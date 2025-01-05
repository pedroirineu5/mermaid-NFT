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
        musicContract = await MusicContract.deploy(
            oysterTokenAddress,
            owner.address,
            oysterVaultAddress,
            gweiPerToken
        );
        const musicContractAddress = await musicContract.getAddress();

        await oysterToken.validateMusicContracts(musicContractAddress);
        await oysterVault.connect(owner).authorizeContract(musicContractAddress, true);
    });

    it("Should set the right owner", async function () {
        expect(await oysterToken.owner()).to.equal(owner.address);
    });

    it("Should mint initial supply to vault", async function () {
        expect(await oysterVault.viewTokensVault()).to.equal(initialSupply);
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
        const invalidMusicContractAddress =
            await invalidMusicContract.getAddress();

        const weiAmount = ethers.parseUnits("0.001", "ether");

        await expect(
            oysterToken
                .connect(buyer)
                .buyTokens(invalidMusicContractAddress, { value: weiAmount })
        ).to.be.revertedWith("Invalid MusicContract address");
    });
});