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
        oysterVaultAddress = await oysterVault.getAddress();

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

        // Validar MusicContract no OysterToken
        await oysterToken.validateMusicContracts(musicContractAddress);

        // Transferir tokens para o MusicContract antes dos testes
        await oysterVault.connect(owner).sendToken(musicContractAddress, initialTransferToMusicContract);

        // Aprovar OysterVault para transferir tokens de volta do MusicContract
        await oysterToken.connect(owner).approve(oysterVaultAddress, ethers.MaxUint256);
    });

    it("Should allow owner to send tokens from vault", async function () {
        // Autorizar o owner no OysterVault (se necessário - para o owner, provavelmente não precisa)
        // await oysterVault.connect(owner).authorizeContract(owner.address, true);

        const amountToSend = ethers.parseUnits("100", 18);
        const initialRecipientBalance = await oysterToken.balanceOf(seller.address);

        // Autorizar o owner a enviar tokens
        await oysterVault.connect(owner).authorizeContract(owner.address, true);

        const tx = await oysterVault.connect(owner).sendToken(seller.address, amountToSend);
        await tx.wait();

        const finalRecipientBalance = await oysterToken.balanceOf(seller.address);
        expect(finalRecipientBalance).to.equal(initialRecipientBalance + amountToSend);
    });

    it("Should revert if non-owner tries to send tokens", async function () {
        const amountToSend = ethers.parseUnits("100", 18);
        await expect(oysterVault.connect(buyer).sendToken(seller.address, amountToSend)).to.be.reverted;
    });

    it("Should revert if vault has insufficient balance", async function () {
        const excessiveAmount = initialSupply + ethers.parseUnits("1", 18);
        // Autorizar o owner no OysterVault (se necessário)
        await oysterVault.connect(owner).authorizeContract(owner.address, true);
        await expect(oysterVault.connect(owner).sendToken(seller.address, excessiveAmount))
            .to.be.revertedWith("Vault does not have enough tokens");
    });

    it("Should allow OysterToken contract to deposit tokens into the vault", async function () {
        // Transferir tokens para o MusicContract antes de tentar vender
        const amountToDeposit = ethers.parseUnits("100", 18);

        // Autorizar o MusicContract no OysterVault
        await oysterVault.connect(owner).authorizeContract(musicContractAddress, true);
        // Autorizar o OysterToken no OysterVault
        await oysterVault.connect(owner).authorizeContract(oysterTokenAddress, true);

        await oysterVault.connect(owner).sendToken(musicContractAddress, amountToDeposit);

        // Comprar tokens para que o MusicContract tenha tokens para vender
        await oysterToken.connect(buyer).buyTokens(musicContractAddress, amountToDeposit, { value: amountToDeposit * BigInt(gweiPerToken) });

        // Aprovar o OysterVault para transferir tokens do MusicContract
        await oysterToken.connect(musicContract).approve(oysterVaultAddress, amountToDeposit);

        // Agora, vender os tokens (o que faz o MusicContract depositar no Vault)
        const tx = await musicContract.connect(buyer).sellTokens(amountToDeposit);
        await tx.wait();

        expect(await oysterVault.viewTokensVault()).to.equal(initialSupply);
    });
});