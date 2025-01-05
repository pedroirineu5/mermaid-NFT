const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MusicContract", function () {
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
    const initialTransferToMusicContract = ethers.parseUnits("100", 18);

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
        musicContract = await MusicContract.deploy(
            oysterTokenAddress,
            owner.address,
            oysterVaultAddress,
            gweiPerToken
        );
        const musicContractAddress = await musicContract.getAddress();

        await oysterToken.validateMusicContracts(musicContractAddress);
        await oysterVault.connect(owner).authorizeContract(musicContractAddress, true);

        // Aprovar OysterVault para transferir tokens de volta do MusicContract
        await oysterToken.connect(owner).approve(oysterVaultAddress, ethers.MaxUint256);
        // Transferir tokens para o MusicContract antes dos testes
        await oysterVault.connect(owner).sendToken(musicContractAddress, initialTransferToMusicContract);

        this.buyTokens = async function (buyer, amount) {
            console.log("buyTokens called with:");
            console.log("  buyer:", buyer.address);
            console.log("  musicContract:", musicContractAddress);
            console.log("  amount:", amount.toString());
            const tx = await oysterToken
                .connect(buyer)
                .buyTokens(musicContractAddress, amount, { value: amount * BigInt(gweiPerToken) });
            return await tx.wait();
        };
    });

    it("Should allow buying tokens", async function () {
        // Comprar tokens, por exemplo, 20
        const amount = 20n;

        const receipt = await this.buyTokens(buyer, amount);

        const events = await musicContract.queryFilter(
            musicContract.filters.TokensPurchased,
            receipt.blockNumber,
            receipt.blockNumber
        );

        const tokensPurchasedEvent = events[0];

        expect(tokensPurchasedEvent).to.not.be.undefined;
        expect(tokensPurchasedEvent.args.buyer).to.equal(buyer.address);
        expect(tokensPurchasedEvent.args.amount).to.equal(amount);
        expect(await musicContract.viewTokensPerAddress(buyer.address)).to.equal(
            amount
        );
    });

    it("Should allow selling tokens", async function () {
        // Comprar tokens, por exemplo, 20
        const amount = 20n;
        await this.buyTokens(buyer, amount);

        // Vender metade dos tokens, por exemplo, 10
        const sellAmount = 10n;
        const initialSellerBalance = await ethers.provider.getBalance(
            buyer.address
        );

        // Aprovar o OysterVault para transferir tokens do MusicContract ANTES de chamar sellTokens
        await musicContract.connect(buyer).approve(oysterVault.getAddress(), amount);

        const tx = await musicContract.connect(buyer).sellTokens(sellAmount);
        const receipt = await tx.wait();

        const events = await musicContract.queryFilter(
            musicContract.filters.SellTokens,
            receipt.blockNumber,
            receipt.blockNumber
        );

        const sellTokensEvent = events[0];
        expect(sellTokensEvent).to.not.be.undefined;
        expect(sellTokensEvent.args.caller).to.equal(buyer.address);
        expect(sellTokensEvent.args.amount).to.equal(sellAmount);

        const finalSellerBalance = await ethers.provider.getBalance(
            buyer.address
        );

        expect(finalSellerBalance).to.be.greaterThan(initialSellerBalance);
        expect(
            await musicContract.viewTokensPerAddress(buyer.address)
        ).to.equal(amount - sellAmount);
    });

    it("Should revert if selling zero tokens", async function () {
        // Comprar tokens, por exemplo, 20
        const amount = 20n;
        await this.buyTokens(buyer, amount);

        await expect(
            musicContract.connect(buyer).sellTokens(0)
        ).to.be.revertedWith("Amount must be greater than zero");
    });

    it("Should allow assigning full rights", async function () {
        const tx = await musicContract
            .connect(owner)
            .assignFullRights(buyer.address);
        const receipt = await tx.wait();

        const events = await musicContract.queryFilter(
            musicContract.filters.FullRightsAssigned,
            receipt.blockNumber,
            receipt.blockNumber
        );
        const fullRightsAssignedEvent = events[0];

        console.log("FullRightsAssigned Event:", fullRightsAssignedEvent);

        expect(fullRightsAssignedEvent).to.not.be.undefined;
        expect(fullRightsAssignedEvent.args.to).to.equal(buyer.address);

        expect(await musicContract.getRemainingRightsDivision()).to.equal(0);
        expect(await musicContract.divisionOfRights(buyer.address)).to.equal(100);
    });

    it("Should revert if the contract is already sealed", async function () {
        await musicContract.connect(owner).assignFullRights(buyer.address);
        await musicContract.connect(owner).sealRights();
        await expect(
            musicContract.connect(owner).assignFullRights(buyer.address)
        ).to.be.revertedWith(
            "The contract is already sealed, no modification of rights can be made"
        );
    });

    it("Should revert if there are no remaining rights", async function () {
        await musicContract.connect(owner).assignFullRights(buyer.address);
        await expect(
            musicContract.connect(owner).assignFullRights(seller.address)
        ).to.be.revertedWith("There are no rights left to assign");
    });

    it("Should allow sealing rights", async function () {
        await musicContract.connect(owner).assignFullRights(buyer.address);
        const tx = await musicContract.connect(owner).sealRights();
        const receipt = await tx.wait();

        const events = await musicContract.queryFilter(
            musicContract.filters.RightsSealed,
            receipt.blockNumber,
            receipt.blockNumber
        );

        const rightsSealedEvent = events[0];

        console.log("RightsSealed Event:", rightsSealedEvent);

        expect(rightsSealedEvent).to.not.be.undefined;
        expect(rightsSealedEvent.args.caller).to.equal(owner.address);

        expect(await musicContract.isMusicContractSealed()).to.equal(true);
    });

    it("Should revert if there are rights left", async function () {
        await expect(
            musicContract.connect(owner).sealRights()
        ).to.be.revertedWith(
            "The contract cannot be sealed until all rights have been assigned"
        );
    });

    it("Should revert if the contract is already sealed", async function () {
        await musicContract.connect(owner).assignFullRights(buyer.address);
        await musicContract.connect(owner).sealRights();

        await expect(
            musicContract.connect(owner).sealRights()
        ).to.be.revertedWith("The contract is already sealed");
    });
});