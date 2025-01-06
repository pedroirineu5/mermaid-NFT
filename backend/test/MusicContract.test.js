const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MusicContract - validateMusicContracts", function () {
    let OysterToken;
    let oysterToken;
    let OysterVault;
    let oysterVault;
    let MusicContract;
    let musicContract;
    let owner;
    let addr1;
    let addr2;
    let oysterTokenAddress, oysterVaultAddress, musicContractAddress;

    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();

        // Deploy do OysterToken
        OysterToken = await ethers.getContractFactory("OysterToken");
        oysterToken = await OysterToken.deploy(owner.address, 50000 * 1e9);
        oysterTokenAddress = await oysterToken.getAddress();

        // Deploy do OysterVault
        OysterVault = await ethers.getContractFactory("OysterVault");
        oysterVault = await OysterVault.deploy(oysterTokenAddress, owner.address);
        oysterVaultAddress = await oysterVault.getAddress();

        // Configurar o vault no OysterToken
        await oysterToken.setVault(oysterVaultAddress);

        // Deploy do MusicContract
        MusicContract = await ethers.getContractFactory("MusicContract");
        musicContract = await MusicContract.deploy(oysterTokenAddress, owner.address, oysterVaultAddress, 50000 * 1e9);
        musicContractAddress = await musicContract.getAddress();
    });

    it("Should validate a valid MusicContract", async function () {
        // Autorizar o OysterToken no OysterVault antes de validar
        await oysterVault.connect(owner).authorizeContract(oysterTokenAddress, true);

        // Validar o MusicContract
        await oysterToken.connect(owner).validateMusicContracts(musicContractAddress);

        // Verificar se o MusicContract foi validado
        expect(await oysterToken.validMusicContracts(musicContractAddress)).to.equal(true);
    });

    it("Should revert when validating an invalid address", async function () {
        // Tentar validar um endereço inválido (não é um contrato)
        await expect(oysterToken.connect(owner).validateMusicContracts(addr1.address))
            .to.be.revertedWith("Address is not a contract");
    });

    it("Should revert when validating a non-MusicContract contract", async function () {
        // Tentar validar o próprio OysterVault (não é um MusicContract)
        await expect(oysterToken.connect(owner).validateMusicContracts(oysterVault.target))
            .to.be.revertedWith("Call to getContractType failed");
    });
});