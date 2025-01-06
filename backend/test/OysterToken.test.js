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
        // await musicContract.connect(owner).sealRights();
        await oysterToken.validateMusicContract(musicContract.target);

        const mintAmount = ethers.parseUnits("100000", 18);
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
        await oysterToken.connect(owner).transfer(oysterVault.target, mintAmount);
        console.log("Transfer complete.");

        console.log(
            "Owner balance after transfer:",
            (await oysterToken.balanceOf(owner.address)).toString()
        );
        console.log(
            "Vault balance after transfer:",
            (await oysterToken.balanceOf(oysterVault.target)).toString()
        );

        // Aprovar OysterVault a gastar tokens do OysterToken
        console.log(
            "Approving OysterVault to spend owner's tokens..."
        );
        await oysterVault.connect(owner).setOysterToken(oysterToken.target);
        // Aprovação agora é feita diretamente no teste
        // await oysterVault.connect(owner).approveTokenSpending(oysterVault.target, mintAmount);
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

    // it("Should emit BuyTokens event on successful purchase", async function () {
    //     const amountToBuy = ethers.parseUnits("10", 18);
    //     console.log(`Attempting to buy ${amountToBuy} tokens...`);
    //     await expect(
    //         oysterToken.connect(addr1).buyTokens(musicContract.target, amountToBuy)
    //     )
    //         .to.emit(oysterToken, "BuyTokens")
    //         .withArgs(addr1.address, musicContract.target, amountToBuy);
    //     console.log("BuyTokens event emitted successfully.");
    // });

    // it("Should revert when buying tokens for an invalid MusicContract", async function () {
    //     const amountToBuy = ethers.parseUnits("10", 18);
    //     const invalidMusicContract = addr2;
    //     console.log(`Attempting to buy tokens for an invalid MusicContract...`);
    //     await expect(
    //         oysterToken
    //             .connect(addr1)
    //             .buyTokens(invalidMusicContract.address, amountToBuy)
    //     ).to.be.revertedWith("Invalid MusicContract");
    //     console.log("Transaction reverted as expected.");
    // });

    it("Should allow OysterVault to transfer tokens using transferFrom", async function () {
        const amountToTransfer = ethers.parseUnits("5", 18);

        // Aprovar o OysterVault a gastar tokens do owner
        console.log(`Approving OysterVault to spend owner's tokens...`);
        await oysterToken.connect(owner).approve(oysterVault.target, amountToTransfer);
        console.log(
            "Approve complete. Allowance:",
            (await oysterToken.allowance(owner.address, oysterVault.target)).toString()
        );

        // O owner chama transferFrom no OysterVault, permitindo que ele use a allowance
        await expect(
            oysterVault.connect(owner).transferFrom(
                oysterVault.target,
                addr2.address,
                amountToTransfer
            )
        )
        .to.emit(oysterToken, "Transfer")
        .withArgs(oysterVault.target, addr2.address, amountToTransfer);

        expect(await oysterToken.balanceOf(addr2.address)).to.equal(
            amountToTransfer
        );
        expect(await oysterToken.balanceOf(oysterVault.target)).to.equal(
            ethers.parseUnits("99995", 18)
        );
    });

    // it("Should allow addr1 to buy tokens", async function () {
    //     const amountToBuy = ethers.parseUnits("10", 18);
    //     console.log(`addr1 attempting to buy ${amountToBuy} tokens...`);

    //     // Transferir tokens do OysterVault para o addr1 antes da compra
    //     const transferAmount = ethers.parseUnits("20", 18);

    //     await oysterVault.connect(owner).transferFrom(oysterVault.target, addr1.address, transferAmount);

    //     console.log(
    //         `Transferred ${transferAmount} tokens from OysterVault to addr1.`
    //     );

    //     // addr1 aprova o OysterToken para gastar seus tokens
    //     await oysterToken.connect(addr1).approve(oysterToken.target, amountToBuy);

    //     await oysterToken.connect(addr1).buyTokens(musicContract.target, amountToBuy);
    //     console.log("addr1 bought tokens successfully.");
    //     expect(await musicContract.tokenBalances(addr1.address)).to.equal(
    //         amountToBuy
    //     );
    //     console.log(
    //         `addr1 token balance in MusicContract: ${await musicContract.tokenBalances(
    //             addr1.address
    //         )}`
    //     );
    // });

    // it("Should allow addr1 to sell tokens", async function () {
    //     const amountToBuy = ethers.parseUnits("10", 18);
    //     const amountToSell = ethers.parseUnits("5", 18);
    //     console.log(`addr1 attempting to buy ${amountToBuy} tokens...`);
    //     await oysterToken
    //         .connect(addr1)
    //         .buyTokens(musicContract.target, amountToBuy);
    //     console.log("addr1 bought tokens successfully.");
    //     console.log(`addr1 attempting to sell ${amountToSell} tokens...`);
    //     await musicContract.connect(addr1).sellTokens(amountToSell);
    //     console.log("addr1 sold tokens successfully.");
    //     expect(await musicContract.tokenBalances(addr1.address)).to.equal(
    //         amountToBuy.sub(amountToSell)
    //     );
    //     console.log(
    //         `addr1 token balance in MusicContract: ${await musicContract.tokenBalances(
    //             addr1.address
    //         )}`
    //     );
    // });

    // it("Should allow owner to assign full rights", async function () {
    //     console.log(`Assigning full rights to addr1...`);
    //     await musicContract.connect(owner).assignFullRights(addr1.address);
    //     console.log("Full rights assigned.");
    //     expect(await musicContract.rightsHolder()).to.equal(addr1.address);
    //     console.log(`Rights holder: ${await musicContract.rightsHolder()}`);
    // });

    // it("Should allow owner to seal rights", async function () {
    //     console.log(`Sealing rights...`);
    //     await musicContract.connect(owner).sealRights();
    //     console.log("Rights sealed.");
    //     expect(await musicContract.isSealed()).to.be.true;
    //     console.log(`Rights sealed: ${await musicContract.isSealed()}`);
    // });
});