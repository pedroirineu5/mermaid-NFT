const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("OysterToken", function () {
  let OysterToken;
  let oysterToken;
  let OysterVault;
  let oysterVault;
  let MusicContract;
  let musicContract;
  let owner;
  let buyer;
  let seller;
  const initialSupply = ethers.parseUnits("1000000", 18);
    const gweiPerToken = 50000 * 1e9;

  beforeEach(async function () {
    [owner, buyer, seller] = await ethers.getSigners();

    OysterToken = await ethers.getContractFactory("OysterToken");
      oysterToken = await OysterToken.deploy(owner.address, gweiPerToken);
    const oysterTokenAddress = await oysterToken.getAddress();

    OysterVault = await ethers.getContractFactory("OysterVault");
    oysterVault = await OysterVault.deploy(oysterTokenAddress, owner.address);
    const oysterVaultAddress = await oysterVault.getAddress();

    await oysterToken.setVault(oysterVaultAddress);
    await oysterToken.mintToVault(initialSupply);

    MusicContract = await ethers.getContractFactory("MusicContract");
    musicContract = await MusicContract.deploy(oysterTokenAddress, owner.address, oysterVaultAddress, gweiPerToken);
    const musicContractAddress = await musicContract.getAddress();

    await oysterToken.validateMusicContracts(musicContractAddress);
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await oysterToken.owner()).to.equal(owner.address);
    });

    it("Should mint initial supply to vault", async function () {
      expect(await oysterVault.viewTokensVault()).to.equal(initialSupply);
    });
  });

  describe("buyTokens", function () {
    it("Should allow buying tokens", async function () {
        const weiAmount = ethers.parseUnits("0.001", "ether");
        const tokensToBuy = weiAmount / BigInt(gweiPerToken);

      const initialBuyerBalance = await oysterToken.balanceOf(buyer.address);
      const tx = await oysterToken.connect(buyer).buyTokens(musicContract.target, { value: weiAmount });
        const receipt = await tx.wait();

        const tokensPurchasedEvent = receipt.logs.find(log => log.topics.includes(musicContract.interface.getEvent("TokensPurchased").topic));
        expect(tokensPurchasedEvent).to.not.be.undefined;
        expect(tokensPurchasedEvent.args.buyer).to.equal(buyer.address);
        expect(tokensPurchasedEvent.args.amount).to.equal(tokensToBuy);
      
      const finalBuyerBalance = await oysterToken.balanceOf(buyer.address);
      expect(finalBuyerBalance).to.equal(initialBuyerBalance );
      expect(await musicContract.viewTokensPerAddress(buyer.address)).to.equal(tokensToBuy);

      // Verificar se o evento BuyTokens foi emitido (o emissor é o OysterToken)
      expect(receipt.logs.some(log => log.topics.includes(oysterToken.interface.getEvent("BuyTokens").topic))).to.be.true;
    });

    it("Should revert if MusicContract is not validated", async function () {
      const InvalidMusicContract = await ethers.getContractFactory(
        "MusicContract"
      );
      const invalidMusicContract = await InvalidMusicContract.deploy(
          oysterToken.getAddress(),
          owner.address,
          oysterVault.getAddress(),
          gweiPerToken
      );
      const invalidMusicContractAddress = await invalidMusicContract.getAddress();

      const weiAmount = ethers.parseUnits("0.001", "ether");

      await expect(
        oysterToken
          .connect(buyer)
          .buyTokens(invalidMusicContractAddress, { value: weiAmount })
      ).to.be.revertedWith("Invalid MusicContract address");
    });

      it("Should revert if insufficient tokens in vault", async function () {
        const weiAmount = ethers.parseUnits("2000", "ether");

        await expect(
          oysterToken.connect(buyer).buyTokens(musicContract.target, { value: weiAmount })
        ).to.be.revertedWith("Insufficient tokens in vault");
    });
  });

  describe("sellOysterToken", function () {
    it("Should allow selling tokens", async function () {
        const weiAmount = ethers.parseUnits("0.001", "ether");
        const tokensToBuy = weiAmount / BigInt(gweiPerToken);

        await oysterToken.connect(buyer).buyTokens(musicContract.target, { value: weiAmount });
        await musicContract.connect(owner).purchaseTokens(buyer.address, tokensToBuy)

      const sellAmount = tokensToBuy / BigInt(2);
       const initialSellerBalance = await ethers.provider.getBalance(buyer.address);

      const tx = await musicContract.connect(buyer).sellTokens(sellAmount);
        const receipt = await tx.wait();

         // Verificar se o evento SellTokens foi emitido pelo MusicContract
        expect(receipt.logs.some(log => log.topics.includes(musicContract.interface.getEvent("SellTokens").topic))).to.be.true;

      const finalSellerBalance = await ethers.provider.getBalance(buyer.address);

     // Verifica se o saldo do seller aumentou após a venda
    expect(finalSellerBalance).to.be.greaterThan(initialSellerBalance);
    expect(await musicContract.viewTokensPerAddress(buyer.address)).to.equal(tokensToBuy - sellAmount);
    });


    it("Should revert if selling zero tokens", async function () {
      const weiAmount = ethers.parseUnits("0.001", "ether");
        const tokensToBuy = weiAmount / BigInt(gweiPerToken);
        await oysterToken.connect(buyer).buyTokens(musicContract.target, { value: weiAmount });
        await musicContract.connect(owner).purchaseTokens(buyer.address, tokensToBuy)


      await expect(musicContract.connect(buyer).sellTokens(0)).to.be.revertedWith(
        "Insufficient token balance"
      );
    });
  });

    describe("assignFullRights", function () {
        it("Should allow assigning full rights", async function () {
            const tx = await musicContract.connect(owner).assignFullRights(buyer.address);
             const receipt = await tx.wait();

             // Verificar se o evento FullRightsAssigned foi emitido
            expect(receipt.logs.some(log => log.topics.includes(musicContract.interface.getEvent("FullRightsAssigned").topic))).to.be.true;

            expect(await musicContract.getRemainingRightsDivision()).to.equal(0);
            expect(await musicContract.divisionOfRights(buyer.address)).to.equal(100);
        });

        it("Should revert if the contract is already sealed", async function () {
            await musicContract.connect(owner).assignFullRights(buyer.address);
            await musicContract.connect(owner).sealRights();
            await expect(musicContract.connect(owner).assignFullRights(buyer.address)).to.be.revertedWith("The contract is already sealed, no modification of rights can be made");
        });

         it("Should revert if there are no remaining rights", async function () {
            await musicContract.connect(owner).assignFullRights(buyer.address);
            await expect(musicContract.connect(owner).assignFullRights(seller.address)).to.be.revertedWith("There are no rights left to assign");
        });
    });

    describe("sealRights", function () {
      it("Should allow sealing rights", async function () {
        await musicContract.connect(owner).assignFullRights(buyer.address);
        const tx = await musicContract.connect(owner).sealRights();
          const receipt = await tx.wait();

          // Verificar se o evento RightsSealed foi emitido
          expect(receipt.logs.some(log => log.topics.includes(musicContract.interface.getEvent("RightsSealed").topic))).to.be.true;

        expect(await musicContract.isMusicContractSealed()).to.equal(true);
      });

    it("Should revert if there are rights left", async function () {
      await expect(musicContract.connect(owner).sealRights()).to.be.revertedWith(
        "The contract cannot be sealed until all rights have been assigned"
      );
    });

      it("Should revert if the contract is already sealed", async function () {
          await musicContract.connect(owner).assignFullRights(buyer.address);
          await musicContract.connect(owner).sealRights();

        await expect(musicContract.connect(owner).sealRights()).to.be.revertedWith(
          "The contract is already sealed"
        );
      });
    });
});