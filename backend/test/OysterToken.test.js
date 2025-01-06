const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("OysterToken MVP", function () {
    let OysterToken;
    let oysterToken;
    let OysterVault;
    let oysterVault;
    let MusicContract;
    let musicContract;
    let owner;
    let addr1;
    let addr2;
    const gweiPerToken = 50000 * 1e9;

    before(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();

        console.log("Deploying contracts with the account:", owner.address);

        OysterToken = await ethers.getContractFactory("OysterToken");
        oysterToken = await OysterToken.deploy(owner.address);
        await oysterToken.waitForDeployment();

        console.log("OysterToken deployed to:", oysterToken.target);

        OysterVault = await ethers.getContractFactory("OysterVault");
        oysterVault = await OysterVault.deploy(
            oysterToken.target,
            owner.address
        );
        await oysterVault.waitForDeployment();
        console.log("OysterVault deployed to:", oysterVault.target);

        MusicContract = await ethers.getContractFactory("MusicContract");
        musicContract = await MusicContract.deploy(
            oysterToken.target,
            owner.address
        );
        await musicContract.waitForDeployment();
        console.log("MusicContract deployed to:", musicContract.target);

        await oysterToken.setVault(oysterVault.target);
        console.log("MusicContract address:", musicContract.target);
        console.log("MusicContract isSealed:", await musicContract.isSealed());
        await oysterToken.validateMusicContract(musicContract.target);

        const mintAmount = ethers.parseUnits("100000", 18);
        const transferToVaultAmount = ethers.parseUnits("99970", 18);
        console.log("Mint amount:", mintAmount.toString());

        console.log(
            "Owner balance before mint:",
            (await oysterToken.balanceOf(owner.address)).toString()
        );
        await oysterToken.mint(owner.address, mintAmount);
        console.log(
            "Owner balance after mint:",
            (await oysterToken.balanceOf(owner.address)).toString()
        );
        console.log(
            "Vault balance after mint:",
            (await oysterToken.balanceOf(oysterVault.target)).toString()
        );

        console.log("Transferring tokens to vault...");
        await oysterToken.connect(owner).transfer(oysterVault.target, transferToVaultAmount);
        console.log("Transfer complete.");

        console.log(
            "Owner balance after transfer:",
            (await oysterToken.balanceOf(owner.address)).toString()
        );
        console.log(
            "Vault balance after transfer:",
            (await oysterToken.balanceOf(oysterVault.target)).toString()
        );

        console.log(
            "Approving OysterVault to spend owner's tokens..."
        );

        console.log(
            "Owner balance before approve:",
            (await oysterToken.balanceOf(owner.address)).toString()
        );

        console.log(
            "Approve complete. Allowance:",
            (
                await oysterToken.allowance(
                    oysterVault.target,
                    oysterToken.target
                )
            ).toString()
        );

        const ownerFunds = ethers.parseUnits("100", 18);
        await owner.sendTransaction({
            to: owner.address,
            value: ownerFunds,
        });
    });

    it("Should allow OysterVault to transfer tokens using transferFrom", async function () {
        const amountToTransfer = ethers.parseUnits("5", 18);

        console.log(`Approving OysterVault to spend owner's tokens...`);
        await oysterToken.connect(owner).approve(oysterVault.target, amountToTransfer);
        console.log(
            "Approve complete. Allowance:",
            (await oysterToken.allowance(owner.address, oysterVault.target)).toString()
        );

        await expect(
            oysterVault.connect(owner).transferFrom(
                owner.address,
                addr2.address,
                amountToTransfer
            )
        )
        .to.emit(oysterToken, "Transfer")
        .withArgs(owner.address, addr2.address, amountToTransfer);

        expect(await oysterToken.balanceOf(addr2.address)).to.equal(
            amountToTransfer
        );
        expect(await oysterToken.balanceOf(oysterVault.target)).to.equal(
            ethers.parseUnits("99970", 18)
        );
    });

    it("Should allow addr1 to buy tokens", async function () {
        const amountToBuy = ethers.parseUnits("10", 18);
        console.log(`addr1 attempting to buy ${amountToBuy} tokens...`);

        // Transferir tokens do Owner para o addr1 antes da compra
        const transferAmount = ethers.parseUnits("20", 18);
        await oysterToken.connect(owner).transfer(addr1.address, transferAmount);

        // LOGS DE DEBUG
        console.log("Owner balance after transfer to addr1:", (await oysterToken.balanceOf(owner.address)).toString());
        console.log("addr1 balance after transfer:", (await oysterToken.balanceOf(addr1.address)).toString());

        // 1. addr1 aprova o OysterToken para gastar seus tokens
        await oysterToken.connect(addr1).approve(oysterToken.target, amountToBuy);

        // LOGS DE DEBUG
        console.log("Allowance do OysterToken no addr1 antes de buyTokens:", (await oysterToken.allowance(addr1.address, oysterToken.target)).toString());
        
        // LOG DE DEBUG (adicionado)
        console.log("Allowance do OysterToken no addr1 APÓS approve:", (await oysterToken.allowance(addr1.address, oysterToken.target)).toString());

        // 2. addr1 chama buyTokens no OysterToken, passando o endereço do MusicContract
        await oysterToken.connect(addr1).buyTokens(musicContract.target, amountToBuy);
        console.log("addr1 bought tokens successfully.");

        // 3. Verificar o saldo de addr1 no MusicContract
        expect(await musicContract.tokenBalances(addr1.address)).to.equal(amountToBuy);
        console.log(
            `addr1 token balance in MusicContract: ${await musicContract.tokenBalances(
                addr1.address
            )}`
        );
    });

    it("Should allow addr1 to sell tokens", async function () {
        const amountToBuy = ethers.parseUnits("10", 18);
        const amountToSell = ethers.parseUnits("5", 18);
        console.log("Owner balance before transfer to addr1 (sellTokens):", (await oysterToken.balanceOf(owner.address)).toString());
        console.log("addr1 balance before transfer (sellTokens):", (await oysterToken.balanceOf(addr1.address)).toString());
        // Certifique-se de que addr1 tenha tokens suficientes para vender
        // 1. addr1 aprova o OysterToken (e não o MusicContract) para gastar seus tokens
        await oysterToken.connect(addr1).approve(oysterToken.target, amountToBuy);
        // 2. Comprar tokens
        await oysterToken.connect(addr1).buyTokens(musicContract.target, amountToBuy);

        // Agora addr1 tem tokens no MusicContract

        // 2. addr1 chama sellTokens no MusicContract
        console.log(`addr1 attempting to sell ${amountToSell} tokens...`);

        // LOGS DE DEBUG
        console.log("addr1 balance in MusicContract before sell:", (await musicContract.tokenBalances(addr1.address)).toString());

        await musicContract.connect(addr1).sellTokens(amountToSell);
        console.log("addr1 sold tokens successfully.");

        // 3. Verificar o saldo de addr1 no MusicContract
        expect(await musicContract.tokenBalances(addr1.address)).to.equal(
            amountToBuy.sub(amountToSell)
        );
        // LOGS DE DEBUG
        console.log("addr1 balance in MusicContract after sell:", (await musicContract.tokenBalances(addr1.address)).toString());
    });

    it("Should allow owner to assign full rights", async function () {
        console.log(`Assigning full rights to addr1...`);
        await musicContract.connect(owner).assignFullRights(addr1.address);
        console.log("Full rights assigned.");
        expect(await musicContract.rightsHolder()).to.equal(addr1.address);
        console.log(`Rights holder: ${await musicContract.rightsHolder()}`);
    });

    it("Should allow owner to seal rights", async function () {
        console.log(`Sealing rights...`);
        await musicContract.connect(owner).sealRights();
        console.log("Rights sealed.");
        expect(await musicContract.isSealed()).to.be.true;
        console.log(`Rights sealed: ${await musicContract.isSealed()}`);
    });
});