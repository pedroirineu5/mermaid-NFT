const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("OysterVault", function () {
    let OysterToken;
    let oysterToken;
    let OysterVault;
    let oysterVault;
    let owner;
    let buyer;
    let seller;
    const initialSupply = ethers.parseUnits("1000000", 18);

    beforeEach(async function () {
        [owner, buyer, seller] = await ethers.getSigners();

        OysterToken = await ethers.getContractFactory("OysterToken");
        OysterVault = await ethers.getContractFactory("OysterVault");

        const gweiPerToken = 50000 * 1e9;
        oysterToken = await OysterToken.deploy(owner.address, gweiPerToken);
        const oysterTokenAddress = await oysterToken.getAddress();
        oysterVault = await OysterVault.deploy(oysterTokenAddress, owner.address);
        await oysterToken.setVault(oysterVault.getAddress());
        await oysterToken.mintToVault(initialSupply);
    });

    it("Should allow owner to send tokens from vault", async function () {
        const amountToSend = ethers.parseUnits("100", 18);
        const initialRecipientBalance = await oysterToken.balanceOf(
            seller.address
        );

        const tx = await oysterVault
            .connect(owner)
            .sendToken(seller.address, amountToSend);
        const receipt = await tx.wait();

        const sendTokenEvent = receipt.logs.find((log) =>
            log.topics.includes(oysterVault.interface.getEvent("SendToken").topic)
        );

        console.log("SendToken Event:", sendTokenEvent);

        expect(sendTokenEvent).to.not.be.undefined;
        expect(sendTokenEvent.args._to).to.equal(seller.address);
        expect(sendTokenEvent.args.amount).to.equal(amountToSend);

        const tokensDistributedEvent = receipt.logs.find((log) =>
            log.topics.includes(
                oysterVault.interface.getEvent("TokensDistributed").topic
            )
        );

        console.log("TokensDistributed Event:", tokensDistributedEvent);

        expect(tokensDistributedEvent).to.not.be.undefined;
        expect(tokensDistributedEvent.args.to).to.equal(seller.address);
        expect(tokensDistributedEvent.args.amount).to.equal(amountToSend);

        const finalRecipientBalance = await oysterToken.balanceOf(
            seller.address
        );

        expect(finalRecipientBalance).to.equal(
            initialRecipientBalance + amountToSend
        );
    });

    it("Should revert if non-owner tries to send tokens", async function () {
        const amountToSend = ethers.parseUnits("100", 18);

        await expect(
            oysterVault.connect(buyer).sendToken(seller.address, amountToSend)
        ).to.be.reverted;
    });

    it("Should revert if vault has insufficient balance", async function () {
        const excessiveAmount = initialSupply + ethers.parseUnits("1", 18);

        await expect(
            oysterVault.connect(owner).sendToken(seller.address, excessiveAmount)
        ).to.be.revertedWith("Vault does not have enough tokens");
    });

    it("Should allow OysterToken contract to deposit tokens into the vault", async function () {
        const amountToDeposit = ethers.parseUnits("100", 18);

        await oysterToken.connect(owner).mint(oysterToken.address, amountToDeposit);

        await oysterToken.connect(owner).approve(oysterVault.address, amountToDeposit);

        console.log("OysterToken address:", await oysterToken.getAddress());
        const tx = await oysterVault.connect(oysterToken).receiveTokens(await oysterToken.getAddress(), amountToDeposit);
        const receipt = await tx.wait();

        const receiveTokensEvent = receipt.logs.find(log => log.topics.includes(oysterVault.interface.getEvent("ReceiveTokens").topic));
        expect(receiveTokensEvent).to.not.be.undefined;
        expect(receiveTokensEvent.args.holder).to.equal(await oysterToken.getAddress());
        expect(receiveTokensEvent.args.amount).to.equal(amountToDeposit);

        const tokensRecievedEvent = receipt.logs.find(log => log.topics.includes(oysterVault.interface.getEvent("TokensRecieved").topic));
        expect(tokensRecievedEvent).to.not.be.undefined;
        expect(tokensRecievedEvent.args.from).to.equal(await oysterToken.getAddress());
        expect(tokensRecievedEvent.args.amount).to.equal(amountToDeposit);

        expect(await oysterVault.viewTokensVault()).to.equal(initialSupply + amountToDeposit);
    });

    it("Should revert if a non-OysterToken address tries to deposit tokens", async function () {
        const amountToDeposit = ethers.parseUnits("100", 18);

        await expect(
            oysterVault.connect(buyer).receiveTokens(buyer.address, amountToDeposit)
        ).to.be.reverted;
    });
});