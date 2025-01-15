const { ethers } = require('ethers');
const fs = require('fs');
require('dotenv').config();

const provider = new ethers.JsonRpcProvider(process.env.HARDHAT_PROVIDER_URL);

let oysterTokenInstance;
let musicContractInstance;
let oysterVaultInstance;
let wallet;

async function initializeBlockchainService() {
    console.log("Initializing Blockchain Service...");

    if (!fs.existsSync('deploy-data.json')) {
        throw new Error("deploy-data.json file not found. Please run the deployment script before starting the backend.");
    }

    let deployData;
    try {
        deployData = JSON.parse(fs.readFileSync('deploy-data.json', 'utf8'));
    } catch (error) {
        throw new Error("Error reading deploy-data.json. Please ensure the file is a valid JSON.");
    }

    const oysterTokenAddress = deployData.oysterToken.address;
    const oysterTokenABI = deployData.oysterToken.abi;
    const musicContractAddress = deployData.musicContract.address;
    const musicContractABI = deployData.musicContract.abi;
    const oysterVaultAddress = deployData.oysterVault.address;
    const oysterVaultABI = deployData.oysterVault.abi;

    wallet = await provider.getSigner(0);

    console.log("Wallet Address:", await wallet.getAddress());

    oysterTokenInstance = new ethers.Contract(
        oysterTokenAddress,
        oysterTokenABI,
        wallet
    );

    musicContractInstance = new ethers.Contract(
        musicContractAddress,
        musicContractABI,
        wallet
    );

    oysterVaultInstance = new ethers.Contract(
        oysterVaultAddress,
        oysterVaultABI,
        wallet
    );

    console.log("Blockchain Service Initialized.");
}

async function sealMusicContract() {
    console.log("Sealing Music Contract...");
    try {
        const result = await musicContractInstance.sealRights();
        await result.wait();
        return result.hash;
    } catch (error) {
        if (error.code === 'NETWORK_ERROR') {
            throw new Error('Network error. Please check your connection.');
        }
        console.error("Error during sealMusicContract:", error);
        throw error;
    }
}

async function assignRights(addressRight, percentageOfRights) {
    console.log(`Assigning ${percentageOfRights}% rights to ${addressRight}`);
    try {
        const result = await musicContractInstance.assignRights(addressRight, percentageOfRights);
        await result.wait();
        return result.hash;
    } catch (error) {
        if (error.code === 'NETWORK_ERROR') {
            throw new Error('Network error. Please check your connection.');
        }
        console.error("Error during assignRights:", error);
        throw error;
    }
}

async function withdrawRights(addressRight, percentageOfRights) {
    console.log(`Withdrawing ${percentageOfRights}% rights from ${addressRight}`);
    try {
        const result = await musicContractInstance.withdrawRights(addressRight, percentageOfRights);
        await result.wait();
        return result.hash;
    } catch (error) {
        if (error.code === 'NETWORK_ERROR') {
            throw new Error('Network error. Please check your connection.');
        }
        console.error("Error during withdrawRights:", error);
        throw error;
    }
}

async function buy100OysterToken() {
    console.log("Buying 100 OysterToken...");
    const businessRateWei = BigInt(process.env.BUSINESS_RATE_WEI);
    const tokensToBuy = 100;
    const gweiPerToken = BigInt(process.env.GWEI_PER_TOKEN);
    const weiValue = BigInt(tokensToBuy) * gweiPerToken + businessRateWei;

    try {
        const result = await musicContractInstance.buy100OysterToken({
            value: weiValue
        });

        await result.wait();
        return result.hash;
    } catch (error) {
        if (error.code === 'NETWORK_ERROR') {
            throw new Error('Network error. Please check your connection.');
        }
        console.error("Error during buy100OysterToken:", error);
        throw error;
    }
}

async function sellOysterToken(amount) {
    console.log(`Selling ${amount} OysterToken...`);
    try {
        const result = await musicContractInstance.sellOysterToken(
            ethers.toBeHex(amount)
        );

        await result.wait();
        return result.hash;
    } catch (error) {
        if (error.code === 'NETWORK_ERROR') {
            throw new Error('Network error. Please check your connection.');
        }
        console.error("Error during sellOysterToken:", error);
        throw error;
    }
}

async function getRemainingRightsDivision() {
    console.log("Getting Remaining Rights Division...");
    try {
        const result = await musicContractInstance.remainingRightsDivision();
        return result;
    } catch (error) {
        if (error.code === 'NETWORK_ERROR') {
            throw new Error('Network error. Please check your connection.');
        }
        console.error("Error during getRemainingRightsDivision:", error);
        throw error;
    }
}

async function isMusicContractSealed() {
    console.log("Checking if Music Contract is Sealed...");
    try {
        const result = await musicContractInstance.musicContactIsSealed();
        return result;
    } catch (error) {
        if (error.code === 'NETWORK_ERROR') {
            throw new Error('Network error. Please check your connection.');
        }
        console.error("Error during isMusicContractSealed:", error);
        throw error;
    }
}

async function getTokensPerAddress(address) {
    console.log(`Getting Tokens for Address: ${address}`);
    try {
        const result = await musicContractInstance.tokensPerAddress(address);
        return result;
    } catch (error) {
        if (error.code === 'NETWORK_ERROR') {
            throw new Error('Network error. Please check your connection.');
        }
        console.error("Error during getTokensPerAddress:", error);
        throw error;
    }
}

async function getSignerAddress() {
    if (!musicContractInstance) {
        throw new Error('Music contract not initialized.');
    }
    if (!wallet) {
        throw new Error('Wallet not initialized.');
    }
    return wallet.getAddress();
}

async function buyRightsMusic() {
    console.log("Buying Music Rights...");
    const rightPurchaseValueInGwei = BigInt(process.env.RIGHT_PURCHASE_VALUE_IN_GWEI);
    const weiValue = rightPurchaseValueInGwei * BigInt(1e9);

    try {
        const result = await musicContractInstance.buyRightsMusic({
            value: weiValue,
            gasLimit: 300000
        });

        await result.wait();
        return result.hash;
    } catch (error) {
        if (error.code === 'NETWORK_ERROR') {
            throw new Error('Network error. Please check your connection.');
        }
        console.error("Error during buyRightsMusic:", error);
        throw error;
    }
}

async function listenMusic() {
    console.log("Listening to Music...");
    const valueForListeningInGwei = BigInt(process.env.VALUE_FOR_LISTENING_IN_GWEI);
    const weiValue = valueForListeningInGwei * BigInt(1e9);

    try {
        const result = await musicContractInstance.listenMusic({
            value: weiValue,
            gasLimit: 300000
        });

        await result.wait();
        return result.hash;
    } catch (error) {
        if (error.code === 'NETWORK_ERROR') {
            throw new Error('Network error. Please check your connection.');
        }
        console.error("Error during listenMusic:", error);
        throw error;
    }
}

module.exports = {
    initializeBlockchainService,
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
};