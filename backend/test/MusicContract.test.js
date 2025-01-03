const hre = require("hardhat");
const { expect } = require("chai");

describe('MusicContract', function () {
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

        const mintAmount = hre.ethers.parseUnits("10000", 18);
        const mintTx = await oysterToken.mintToVault(mintAmount);
        await mintTx.wait();

        const rightPurchaseValue = hre.ethers.parseUnits('5000000', 'gwei');
        const valueForListening = hre.ethers.parseUnits('1000', 'gwei');

        const MusicContract = await hre.ethers.getContractFactory('MusicContract');
        musicContract = await MusicContract.deploy(
            await oysterToken.getAddress(),
            deployer.address,
            rightPurchaseValue,
            valueForListening
        );
        await musicContract.waitForDeployment();

        await oysterToken.validateMusicContracts(await musicContract.getAddress());
    });

    it('Should set the correct owner', async function () {
        expect(await musicContract.owner()).to.equal(deployer.address);
    });

    it('Should assign rights to a user', async function () {
        await musicContract.assignRights(user1.address, 25);
        expect(await musicContract.divisionOfRights(user1.address)).to.equal(25);
        expect(await musicContract.remainingRightsDivision()).to.equal(75);
        const rightHolders = await musicContract.getRightHolders();
        expect(rightHolders).to.deep.equal([user1.address]);
    });

    it('Should withdraw rights from a user', async function () {
        await musicContract.assignRights(user1.address, 25);
        await musicContract.withdrawRights(user1.address, 10);
        expect(await musicContract.divisionOfRights(user1.address)).to.equal(15);
        expect(await musicContract.remainingRightsDivision()).to.equal(85);
    });

    it('Should seal rights', async function () {
      await musicContract.assignRights(user1.address, 100);
        await musicContract.sealRights();
        expect(await musicContract.musicContactIsSealed()).to.equal(true);
    });

    it('Should buy 100 oyster tokens', async function () {
      const businessRateWei = await oysterToken.getBusinessRateWei();
      const gweiPerToken = await oysterToken.getGweiPerToken();

      await musicContract.assignRights(user1.address, 100);
        await musicContract.sealRights();
       await oysterToken.buy100OSTToMusicContract(await musicContract.getAddress(), {
            value: (businessRateWei) + (gweiPerToken * BigInt(100) * (10n ** 9n)),
        });
      await musicContract.connect(user1).buy100OysterToken({value: 5300000 * 1e9});
      expect(await musicContract.tokensPerAddress(user1.address)).to.equal(100);
    });

    it('Should buy rights', async function () {
        await musicContract.assignRights(user1.address, 100);
        await musicContract.sealRights();
        const rightPurchaseValue = await musicContract.rightPurchaseValueInGwei();
        // Transferir Ether para user1 para a compra dos direitos
       await deployer.sendTransaction({
            to: user1.address,
            value: rightPurchaseValue * (10n ** 9n)
        })
       await musicContract.connect(user1).buyRightsMusic({ value: rightPurchaseValue * (10n ** 9n)});
    });

    it('Should listen to music', async function () {
       await musicContract.assignRights(user1.address, 100);
        await musicContract.sealRights();
        const valueForListening = await musicContract.valueForListeningInGwei();
        await musicContract.listenMusic({ value: valueForListening * (10n ** 9n)});
    });
});