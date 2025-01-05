const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("OysterVault", function () {
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
    let oysterTokenAddress;
    let musicContractAddress;

    beforeEach(async function () {
        [owner, buyer, seller] = await ethers.getSigners();

        OysterToken = await ethers.getContractFactory("OysterToken");
        oysterToken = await OysterToken.deploy(owner.address, gweiPerToken);
        oysterTokenAddress = await oysterToken.getAddress();

        OysterVault = await ethers.getContractFactory("OysterVault");
        oysterVault = await OysterVault.deploy(oysterTokenAddress, owner.address);
        const oysterVaultAddress = await oysterVault.getAddress();

        MusicContract = await ethers.getContractFactory("MusicContract");
        musicContract = await MusicContract.deploy(
            oysterTokenAddress,
            owner.address,
            oysterVaultAddress,
            gweiPerToken
        );
        musicContractAddress = await musicContract.getAddress();

        await oysterToken.setVault(oysterVaultAddress);
        await oysterToken.mintToVault(initialSupply);

        // Adicionar autorização do MusicContract e do OysterToken
        await oysterVault.connect(owner).authorizeContract(musicContractAddress, true);
        await oysterVault.connect(owner).authorizeContract(oysterTokenAddress, true);
    });

    it("Should allow owner to send tokens from vault", async function () {
        // Autorizar o OysterToken dentro deste teste específico
        await oysterVault.connect(owner).authorizeContract(oysterTokenAddress, true);

        const amountToSend = ethers.parseUnits("100", 18);
        const initialRecipientBalance = await oysterToken.balanceOf(seller.address);

        const tx = await oysterVault.connect(owner).sendToken(seller.address, amountToSend);
        const receipt = await tx.wait();

        const events = await oysterVault.queryFilter(oysterVault.filters.SendToken, receipt.blockNumber, receipt.blockNumber);
        const sendTokenEvent = events[0];

        console.log("SendToken Event:", sendTokenEvent);

        expect(sendTokenEvent).to.not.be.undefined;
        expect(sendTokenEvent.args._to).to.equal(seller.address);
        expect(sendTokenEvent.args.amount).to.equal(amountToSend);

        const events2 = await oysterVault.queryFilter(oysterVault.filters.TokensDistributed, receipt.blockNumber, receipt.blockNumber);
        const tokensDistributedEvent = events2[0];

        console.log("TokensDistributed Event:", tokensDistributedEvent);

        expect(tokensDistributedEvent).to.not.be.undefined;
        expect(tokensDistributedEvent.args.to).to.equal(seller.address);
        expect(tokensDistributedEvent.args.amount).to.equal(amountToSend);

        const finalRecipientBalance = await oysterToken.balanceOf(seller.address);
        expect(finalRecipientBalance).to.equal(initialRecipientBalance + amountToSend);
    });

    it("Should revert if non-owner tries to send tokens", async function () {
        const amountToSend = ethers.parseUnits("100", 18);

        await expect(oysterVault.connect(buyer).sendToken(seller.address, amountToSend)).to.be.reverted;
    });

    it("Should revert if vault has insufficient balance", async function () {
        const excessiveAmount = initialSupply + ethers.parseUnits("1", 18);
        await expect(oysterVault.connect(owner).sendToken(seller.address, excessiveAmount))
            .to.be.revertedWith("Vault does not have enough tokens");
    });

    it("Should allow OysterToken contract to deposit tokens into the vault", async function () {
        // Autorizar o OysterToken dentro deste teste específico
        await oysterVault.connect(owner).authorizeContract(oysterTokenAddress, true);

        const amountToDeposit = 100n;

        await oysterToken.connect(owner).validateMusicContracts(musicContractAddress);
        await oysterToken.connect(owner).approve(musicContractAddress, amountToDeposit);
        console.log("OysterToken: Balance of MusicContract before purchase", (await oysterToken.balanceOf(musicContractAddress)).toString());
        await oysterToken.connect(buyer).buyTokens(musicContractAddress, amountToDeposit, { value: amountToDeposit * BigInt(gweiPerToken) });
        console.log("OysterToken: Balance of MusicContract after purchase", (await oysterToken.balanceOf(musicContractAddress)).toString());
        console.log("OysterToken address:", oysterTokenAddress);
        console.log("Authorizing OysterToken Address in Vault:", oysterTokenAddress);
        console.log("MusicContract address:", musicContractAddress);

        const tx = await musicContract.connect(buyer).sellTokens(amountToDeposit);
        const receipt = await tx.wait();

        console.log("OysterVault: Balance of MusicContract before transfer", (await oysterToken.balanceOf(musicContractAddress)).toString());

        const events = await oysterVault.queryFilter(oysterVault.filters.ReceiveTokens, receipt.blockNumber, receipt.blockNumber);
        const receiveTokensEvent = events[0];
        expect(receiveTokensEvent).to.not.be.undefined;
        expect(receiveTokensEvent.args.holder).to.equal(musicContractAddress);
        expect(receiveTokensEvent.args.amount).to.equal(amountToDeposit);

        const events2 = await oysterVault.queryFilter(oysterVault.filters.TokensRecieved, receipt.blockNumber, receipt.blockNumber);
        const tokensRecievedEvent = events2[0];
        expect(tokensRecievedEvent).to.not.be.undefined;
        expect(tokensRecievedEvent.args.from).to.equal(musicContractAddress);
        expect(tokensRecievedEvent.args.amount).to.equal(amountToDeposit);

        expect(await oysterVault.viewTokensVault()).to.equal(initialSupply);
    });

    it("Should revert if a non-OysterToken address tries to deposit tokens", async function () {
        const amountToDeposit = ethers.parseUnits("100", 18);
        await expect(oysterVault.connect(buyer).receiveTokens(buyer.address, amountToDeposit)).to.be.reverted;
    });
});