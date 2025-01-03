const hre = require("hardhat");
const { expect } = require("chai");

describe('OysterToken', function () {
    let oysterToken, oysterVault, musicContract, deployer, user1;
  
    beforeEach(async function () {
        const signers = await hre.ethers.getSigners();
        deployer = signers[0];
        user1 = signers[1];
  
        const OysterToken = await hre.ethers.getContractFactory('OysterToken');
        oysterToken = await OysterToken.deploy(deployer.address);
        await oysterToken.waitForDeployment();
  
        const OysterVault = await hre.ethers.getContractFactory('OysterVault');
        oysterVault = await OysterVault.deploy(
            await oysterToken.getAddress(),
            deployer.address
        );
        await oysterVault.waitForDeployment();
  
        const setVaultTx = await oysterToken.setVault(await oysterVault.getAddress());
        await setVaultTx.wait();

        const mintAmount = hre.ethers.parseUnits("100000", 18);
        const mintTx = await oysterToken.mintToVault(mintAmount);
        await mintTx.wait();
        
         const MusicContract = await hre.ethers.getContractFactory('MusicContract');
         musicContract = await MusicContract.deploy(
            await oysterToken.getAddress(),
            deployer.address,
             hre.ethers.parseUnits('5000000', 'gwei'),
             hre.ethers.parseUnits('1000', 'gwei')
          );
          await musicContract.waitForDeployment();
  
          await oysterToken.validateMusicContracts(await musicContract.getAddress());
    });
  
    it('Should set the correct owner', async function () {
      expect(await oysterToken.owner()).to.equal(deployer.address);
    });
  
    it('Should mint tokens to the vault', async function () {
        const mintAmount = hre.ethers.parseUnits("100000", 18);
        const mintTx = await oysterToken.mintToVault(mintAmount);
        await mintTx.wait();
  
        const vaultBalance = await oysterToken.balanceOf(await oysterVault.getAddress());
        expect(vaultBalance).to.equal(hre.ethers.parseUnits('100000', 18));
    });
  
    it('Should validate a music contract address', async function () {
      const musicContractAddress = user1.address;
        await oysterToken.validateMusicContracts(musicContractAddress);
        expect(await oysterToken.validMusicContracts(musicContractAddress)).to.equal(true);
    });
  
    it('Should buy 100 OST for a music contract', async function () {
        const businessRateWei = await oysterToken.getBusinessRateWei();
        const gweiPerToken = await oysterToken.getGweiPerToken();
      await oysterToken.buy100OSTToMusicContract(await musicContract.getAddress(), {
        value: (businessRateWei) + (gweiPerToken * BigInt(100) * (10n ** 9n)),
      });
      const vaultBalance = await oysterToken.balanceOf(await oysterVault.getAddress());
       expect(vaultBalance).to.equal(hre.ethers.parseUnits("99900", 18));
    });
  
    it('Should sell Oyster tokens', async function () {
        const businessRateWei = await oysterToken.getBusinessRateWei();
        const gweiPerToken = await oysterToken.getGweiPerToken();
        await oysterToken.buy100OSTToMusicContract(await musicContract.getAddress(), {
            value: (businessRateWei) + (gweiPerToken * BigInt(100) * (10n ** 9n)),
          });
      
       const MusicContractUser1 = musicContract.connect(user1);

       await musicContract.assignRights(user1.address, 100);
        await musicContract.sealRights();
       await musicContract.buy100OysterToken({value: 5300000 * 1e9})

       await MusicContractUser1.approveOysterVault(50);
      await oysterToken.sellOysterToken(await musicContract.getAddress(), 50);
  
      const vaultBalance = await oysterToken.balanceOf(await oysterVault.getAddress());
      expect(vaultBalance).to.equal(hre.ethers.parseUnits("99950", 18));
    });
  });