const { ethers } = require('ethers');
const fs = require('fs');
require('dotenv').config();

const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');

let oysterTokenInstance;
let musicContractInstance;
let oysterVaultInstance;
let wallet;

async function initializeBlockchainService() {
    console.log("===== initializeBlockchainService =====");
    const deployData = JSON.parse(fs.readFileSync('deploy-data.json', 'utf8'));
    console.log("deployData:", deployData);

    const oysterTokenAddress = deployData.oysterToken.address;
    const oysterTokenABI = JSON.parse(fs.readFileSync('./artifacts/contracts/OysterToken.sol/OysterToken.json', 'utf8')).abi;
    const musicContractAddress = deployData.musicContract.address;
    const musicContractABI = JSON.parse(fs.readFileSync('./artifacts/contracts/MusicContract.sol/MusicContract.json', 'utf8')).abi;
    const oysterVaultAddress = deployData.oysterVault.address;
    const oysterVaultABI = JSON.parse(fs.readFileSync('./artifacts/contracts/OysterToken.sol/OysterVault.json', 'utf8')).abi;

    const privateKey = process.env.PRIVATE_KEY;

    if (!privateKey) {
        throw new Error(
            'PRIVATE_KEY environment variable not set. Please define it in your .env file.'
        );
    }

    wallet = new ethers.Wallet(privateKey, provider);
    console.log("Wallet Address:", await wallet.getAddress());

    oysterTokenInstance = new ethers.Contract(
        oysterTokenAddress,
        oysterTokenABI,
        wallet
    );
    console.log("oysterTokenInstance Address:", oysterTokenInstance.target);

    musicContractInstance = new ethers.Contract(
        musicContractAddress,
        musicContractABI,
        wallet
    );
    console.log("musicContractInstance Address:", musicContractInstance.target);

    oysterVaultInstance = new ethers.Contract(
        oysterVaultAddress,
        oysterVaultABI,
        wallet
    );
    console.log("oysterVaultInstance Address:", oysterVaultInstance.target);

    console.log("===== initializeBlockchainService END =====");
}

async function validateMusicContract(addressMusicContract) {
    console.log("===== validateMusicContract =====");
    console.log("Validating Music Contract Address (input):", addressMusicContract);
    if (!oysterTokenInstance) {
        throw new Error('Blockchain service not initialized.');
    }
    console.log("oysterTokenInstance Address (inside validateMusicContract):", oysterTokenInstance.target);

    console.log("Calling validateMusicContracts with address:", addressMusicContract);

    try {
        const tx = await oysterTokenInstance.validateMusicContracts(addressMusicContract);
        console.log("Transaction:", tx);
        const receipt = await tx.wait();
        console.log("Transaction Receipt:", receipt);

        if (receipt.status === 0) {
          console.error("Transaction Reverted:", receipt);
          throw new Error("Transaction reverted");
        }

        console.log("Transaction Hash:", tx.hash);
        console.log("===== validateMusicContract END =====");
        return { hash: tx.hash, isValid: true };
      } catch (error) {
        console.error("Error during validateMusicContract:", error);
        throw error;
      }
}

async function sealMusicContract() {
    console.log("===== sealMusicContract =====");
    if (!musicContractInstance) {
        throw new Error('Music contract not initialized.');
    }
    try {
        const result = await musicContractInstance.sealRights();
        await result.wait();
        console.log("===== sealMusicContract END =====");
        return result.hash;
    } catch (error) {
        console.error("Error during sealMusicContract:", error);
        throw error;
    }
}

async function assignRights(addressRight, percentageOfRights) {
    console.log("===== assignRights =====");
    if (!musicContractInstance) {
        throw new Error('Music contract not initialized.');
    }
    try {
        const result = await musicContractInstance.assignRights(addressRight, percentageOfRights);
        await result.wait();
        console.log("===== assignRights END =====");
        return result.hash;
    } catch (error) {
        console.error("Error during assignRights:", error);
        throw error;
    }
}

async function withdrawRights(addressRight, percentageOfRights) {
    console.log("===== withdrawRights =====");
    if (!musicContractInstance) {
        throw new Error('Music contract not initialized.');
    }
    try {
        const result = await musicContractInstance.withdrawRights(addressRight, percentageOfRights);
        await result.wait();
        console.log("===== withdrawRights END =====");
        return result.hash;
    } catch (error) {
        console.error("Error during withdrawRights:", error);
        throw error;
    }
}

async function buy100OysterToken() {
    console.log("===== buy100OysterToken =====");
    if (!musicContractInstance) {
        throw new Error('Music contract not initialized.');
    }

    const businessRateWei = 200000;
    const tokensToBuy = 100;
    const gweiPerToken = 50000;
    const weiValue = (tokensToBuy * gweiPerToken + businessRateWei) * 1e9;

    try {
        const result = await musicContractInstance.buy100OysterToken({
            value: weiValue.toString(),
            gasLimit: 300000 
        });

        await result.wait();
        console.log("===== buy100OysterToken END =====");
        return result.hash;
    } catch (error) {
        console.error("Error during buy100OysterToken:", error);
        throw error;
    }
}

async function sellOysterToken(amount) {
    console.log("===== sellOysterToken =====");
    if (!musicContractInstance) {
        throw new Error('Music contract not initialized.');
    }
    try {
        const result = await musicContractInstance.sellOysterToken(
            BigInt(amount)
        );

        await result.wait();
        console.log("===== sellOysterToken END =====");
        return result.hash;
    } catch (error) {
        console.error("Error in sellOysterToken:", error);
        throw new Error(`Failed to sell Oyster tokens: ${error.message}`);
    }
}

async function getRemainingRightsDivision() {
    console.log("===== getRemainingRightsDivision =====");
    if (!musicContractInstance) {
        throw new Error('Music contract not initialized.');
    }
    try {
        const result = await musicContractInstance.remainingRightsDivision();
        console.log("===== getRemainingRightsDivision END =====", result);
        return result;
    } catch (error) {
        console.error("Error during getRemainingRightsDivision:", error);
        throw error;
    }
}

async function isMusicContractSealed() {
    console.log("===== isMusicContractSealed =====");
    if (!musicContractInstance) {
        throw new Error('Music contract not initialized.');
    }
    try {
        const result = await musicContractInstance.musicContactIsSealed.staticCall();
        console.log("===== isMusicContractSealed END =====", result);
        return result;
    } catch (error) {
        console.error("Error during isMusicContractSealed:", error);
        throw error;
    }
}

async function getTokensPerAddress(address) {
    console.log("===== getTokensPerAddress =====");
    if (!musicContractInstance) {
        throw new Error('Music contract not initialized.');
    }
    try {
        const result = await musicContractInstance.tokensPerAddress.staticCall(address);
        console.log("===== getTokensPerAddress END =====", result);
        return result;
    } catch (error) {
        console.error("Error during getTokensPerAddress:", error);
        throw error;
    }
}

async function getSignerAddress() {
    return wallet.getAddress();
}

async function buyRightsMusic() {
    console.log("===== buyRightsMusic =====");
    if (!musicContractInstance) {
        throw new Error('Music contract not initialized.');
    }

    const rightPurchaseValueInGwei = BigInt(process.env.RIGHT_PURCHASE_VALUE_IN_GWEI);
    const weiValue = rightPurchaseValueInGwei * BigInt(1e9);

    try {
        const result = await musicContractInstance.buyRightsMusic({
            value: weiValue.toString(),
            gasLimit: 300000
        });

        await result.wait();
        console.log("===== buyRightsMusic END =====");
        return result.hash;
    } catch (error) {
        console.error("Error during buyRightsMusic:", error);
        throw error;
    }
}

async function listenMusic() {
    console.log("===== listenMusic =====");
    if (!musicContractInstance) {
        throw new Error('Music contract not initialized.');
    }

    const valueForListeningInGwei = BigInt(process.env.VALUE_FOR_LISTENING_IN_GWEI);
    const weiValue = valueForListeningInGwei * BigInt(1e9);

    try {
        const result = await musicContractInstance.listenMusic({
            value: weiValue.toString(),
            gasLimit: 300000
        });

        await result.wait();
        console.log("===== listenMusic END =====");
        return result.hash;
    } catch (error) {
        console.error("Error during listenMusic:", error);
        throw error;
    }
}

async function viewBalance() {
    console.log("===== viewBalance =====");
    if (!musicContractInstance) {
        throw new Error('Music contract not initialized.');
    }
    try {
        const result = await musicContractInstance.viewBalance();
        console.log("===== viewBalance END =====", result);
        return result;
    } catch (error) {
        console.error("Error during viewBalance:", error);
        throw error;
    }
}

module.exports = {
    initializeBlockchainService,
    validateMusicContract,
    sealMusicContract,
    assignRights,
    withdrawRights,
    buy100OysterToken,
    sellOysterToken,
    getRemainingRightsDivision,
    isMusicContractSealed,
    getTokensPerAddress,
    getSignerAddress,
    buyRightsMusic,
    listenMusic,
    viewBalance
};