const { expect } = require("chai");
const { ethers } = require('hardhat');
const blockchainService = require('../services/blockchainService');
const fs = require('fs');
require('dotenv').config();

describe("Blockchain Service", function () {
    let deployData;
    let wallet;
    let provider;

    before(async function () {
        deployData = JSON.parse(fs.readFileSync('deploy-data.json', 'utf8'));
        provider = hre.ethers.provider;
        const privateKey = process.env.PRIVATE_KEY;
        wallet = new ethers.Wallet(privateKey, provider);
        await blockchainService.initializeBlockchainService();

        const [owner] = await ethers.getSigners();
        const tx = await owner.sendTransaction({
            to: wallet.address,
            value: ethers.parseEther("100")
        });
        await tx.wait();

        const balance = await provider.getBalance(wallet.address);
        console.log(`Balance of test account: ${ethers.formatEther(balance)} ETH`);
        expect(balance).to.be.above(0, "Test account should have a balance greater than 0");
    });

    describe("validateMusicContract", function () {
        it("Should validate a music contract successfully", async function () {
            const addressMusicContract = deployData.musicContract.address;
            const result = await blockchainService.validateMusicContract(addressMusicContract);
            expect(result.isValid).to.be.true;
            expect(result.hash).to.be.a("string");
            expect(result.hash).to.have.lengthOf(66);
        });

        it("Should throw an error if the music contract address is invalid", async function () {
            const invalidAddress = "0x123";
            try {
                await blockchainService.validateMusicContract(invalidAddress);
                expect.fail("Expected an error but none was thrown");
            } catch (error) {
                expect(error.message).to.include("invalid address");
            }
        });
    });

    describe("assignRights", function () {
        it("Should assign rights successfully", async function () {
            const addressRight = wallet.address;
            const percentageOfRights = 50;
            const transactionHash = await blockchainService.assignRights(addressRight, percentageOfRights);
            expect(transactionHash).to.be.a("string");
            expect(transactionHash).to.have.lengthOf(66);
        });

        it("Should fail to assign rights if contract is sealed", async function () {
            await blockchainService.sealMusicContract();

            const addressRight = wallet.address;
            const percentageOfRights = 50;

            try {
                await blockchainService.assignRights(addressRight, percentageOfRights);
                expect.fail("Expected an error but none was thrown");
            } catch (error) {
                expect(error.message).to.include("Error during assignRights");
            }
        });
    });

    describe("withdrawRights", function () {
        beforeEach(async function () {
            if (await blockchainService.isMusicContractSealed()) {
                const ownerAddress = await blockchainService.getSignerAddress();
                await blockchainService.assignRights(ownerAddress, 100);
                await blockchainService.sealMusicContract();
            }
        });

        it("Should withdraw rights successfully", async function () {
            const addressRight = wallet.address;
            const percentageToWithdraw = 25;
            const initialRemainingRights = await blockchainService.getRemainingRightsDivision();

            const transactionHash = await blockchainService.withdrawRights(addressRight, percentageToWithdraw);

            const finalRemainingRights = await blockchainService.getRemainingRightsDivision();

            expect(transactionHash).to.be.a("string");
            expect(transactionHash).to.have.lengthOf(66);
            expect(Number(finalRemainingRights)).to.equal(Number(initialRemainingRights) + percentageToWithdraw);
        });

        it("Should fail to withdraw rights if contract is sealed", async function () {
            if (!(await blockchainService.isMusicContractSealed())) {
                await blockchainService.sealMusicContract();
            }
            const addressRight = wallet.address;
            const percentageOfRights = 10;

            try {
                await blockchainService.withdrawRights(addressRight, percentageOfRights);
                expect.fail("Expected an error but none was thrown");
            } catch (error) {
                expect(error.message).to.include("Error during withdrawRights");
            }
        });
    });

    describe("sealMusicContract", function () {
        beforeEach(async function () {
            if (await blockchainService.isMusicContractSealed()) {
                const ownerAddress = await blockchainService.getSignerAddress();
                await blockchainService.assignRights(ownerAddress, 100);
            }
        });

        it("Should seal the music contract successfully", async function () {
            const transactionHash = await blockchainService.sealMusicContract();
            const isSealed = await blockchainService.isMusicContractSealed();

            expect(transactionHash).to.be.a("string");
            expect(transactionHash).to.have.lengthOf(66);
            expect(isSealed).to.be.true;
        });

        it("Should fail to seal the music contract if it's already sealed", async function () {
            if (!(await blockchainService.isMusicContractSealed())) {
                await blockchainService.sealMusicContract();
            }

            try {
                await blockchainService.sealMusicContract();
                expect.fail("Expected an error but none was thrown");
            } catch (error) {
                expect(error.message).to.include("Error during sealMusicContract");
            }
        });
    });

    describe("buy100OysterToken", function () {
        beforeEach(async function () {
            if (!(await blockchainService.isMusicContractSealed())) {
                const ownerAddress = await blockchainService.getSignerAddress();
                await blockchainService.assignRights(ownerAddress, 100);
                await blockchainService.sealMusicContract();
            }
            const tx = await wallet.sendTransaction({
                to: deployData.musicContract.address,
                value: ethers.parseEther("0.01")
            });
            await tx.wait();
        });

        it("Should buy 100 OysterToken successfully", async function () {
            const initialTokens = await blockchainService.getTokensPerAddress(wallet.address);
            const transactionHash = await blockchainService.buy100OysterToken();
            const finalTokens = await blockchainService.getTokensPerAddress(wallet.address);

            expect(transactionHash).to.be.a("string");
            expect(transactionHash).to.have.lengthOf(66);
            expect(Number(finalTokens)).to.equal(Number(initialTokens) + 100);
        });

        it("Should fail to buy 100 OysterToken if contract is not sealed", async function () {
            if (await blockchainService.isMusicContractSealed()) {
                const ownerAddress = await blockchainService.getSignerAddress();
                await blockchainService.assignRights(ownerAddress, 100);
            }

            try {
                await blockchainService.buy100OysterToken();
                expect.fail("Expected an error but none was thrown");
            } catch (error) {
                expect(error.message).to.include("Error during buy100OysterToken");
            }
        });
    });

    describe("sellOysterToken", function () {
        beforeEach(async function () {
            if (!(await blockchainService.isMusicContractSealed())) {
                const ownerAddress = await blockchainService.getSignerAddress();
                await blockchainService.assignRights(ownerAddress, 100);
                await blockchainService.sealMusicContract();
            }
        });

        it("Should sell OysterToken successfully", async function () {
            const amountToSell = 50;
            await blockchainService.buy100OysterToken();
            const initialTokens = await blockchainService.getTokensPerAddress(wallet.address);

            const transactionHash = await blockchainService.sellOysterToken(amountToSell);

            const finalTokens = await blockchainService.getTokensPerAddress(wallet.address);

            expect(transactionHash).to.be.a("string");
            expect(transactionHash).to.have.lengthOf(66);
            expect(Number(finalTokens)).to.equal(Number(initialTokens) - amountToSell);
        });

        it("Should fail to sell OysterToken if contract is not sealed", async function () {
            if (await blockchainService.isMusicContractSealed()) {
                const ownerAddress = await blockchainService.getSignerAddress();
                await blockchainService.assignRights(ownerAddress, 100);
            }

            try {
                await blockchainService.sellOysterToken(50);
                expect.fail("Expected an error but none was thrown");
            } catch (error) {
                expect(error.message).to.include("Failed to sell Oyster tokens");
            }
        });
    });

    describe("getRemainingRightsDivision", function () {
        it("Should return remaining rights division", async function () {
            const remainingRights = await blockchainService.getRemainingRightsDivision();
            expect(remainingRights).to.be.a("bigint");
        });
    });

    describe("isMusicContractSealed", function () {
        it("Should return whether the music contract is sealed or not", async function () {
            const isSealed = await blockchainService.isMusicContractSealed();
            expect(isSealed).to.be.a("boolean");
        });
    });

    describe("getTokensPerAddress", function () {
        it("Should return tokens per address", async function () {
            const address = wallet.address;
            const tokens = await blockchainService.getTokensPerAddress(address);
            expect(tokens).to.be.a("bigint");
        });
    });

    describe("buyRightsMusic", function () {
        beforeEach(async function () {
            if (!(await blockchainService.isMusicContractSealed())) {
                const ownerAddress = await blockchainService.getSignerAddress();
                await blockchainService.assignRights(ownerAddress, 100);
                await blockchainService.sealMusicContract();
            }
        });

        it("Should buy rights to music successfully", async function() {
            const transactionHash = await blockchainService.buyRightsMusic();

            expect(transactionHash).to.be.a("string");
            expect(transactionHash).to.have.lengthOf(66);
        });

        it("Should fail to buy rights to music if contract is not sealed", async function() {
            if (await blockchainService.isMusicContractSealed()) {
                const ownerAddress = await blockchainService.getSignerAddress();
                await blockchainService.assignRights(ownerAddress, 100);
            }

            try {
                await blockchainService.buyRightsMusic();
                expect.fail("Expected an error but none was thrown");
            } catch (error) {
                expect(error.message).to.include("Error during buyRightsMusic");
            }
        });
    });

    describe("listenMusic", function () {
        beforeEach(async function () {
            if (!(await blockchainService.isMusicContractSealed())) {
                const ownerAddress = await blockchainService.getSignerAddress();
                await blockchainService.assignRights(ownerAddress, 100);
                await blockchainService.sealMusicContract();
            }
        });

        it("Should listen to music successfully", async function() {
            const transactionHash = await blockchainService.listenMusic();

            expect(transactionHash).to.be.a("string");
            expect(transactionHash).to.have.lengthOf(66);
        });

        it("Should fail to listen to music if contract is not sealed", async function() {
            if (await blockchainService.isMusicContractSealed()) {
                const ownerAddress = await blockchainService.getSignerAddress();
                await blockchainService.assignRights(ownerAddress, 100);
            }

            try {
                await blockchainService.listenMusic();
                expect.fail("Expected an error but none was thrown");
            } catch (error) {
                expect(error.message).to.include("Error during listenMusic");
            }
        });
    });

    describe("viewBalance", function() {
        it("Should return the correct balance", async function() {
            const balance = await blockchainService.viewBalance();
            expect(balance).to.be.a("bigint");
        });
    });
});