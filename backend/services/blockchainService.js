const { ethers } = require('ethers');
const fs = require('fs');
require('dotenv').config();

// Códigos de escape ANSI para cores
const colors = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    dim: "\x1b[2m",
    underscore: "\x1b[4m",
    blink: "\x1b[5m",
    reverse: "\x1b[7m",
    hidden: "\x1b[8m",

    fg: {
        black: "\x1b[30m",
        red: "\x1b[31m",
        green: "\x1b[32m",
        yellow: "\x1b[33m",
        blue: "\x1b[34m",
        magenta: "\x1b[35m",
        cyan: "\x1b[36m",
        white: "\x1b[37m",
        crimson: "\x1b[38m" // Scarlet
    },
    bg: {
        black: "\x1b[40m",
        red: "\x1b[41m",
        green: "\x1b[42m",
        yellow: "\x1b[43m",
        blue: "\x1b[44m",
        magenta: "\x1b[45m",
        cyan: "\x1b[46m",
        white: "\x1b[47m",
        crimson: "\x1b[48m"
    }
};

const provider = new ethers.JsonRpcProvider(process.env.HARDHAT_PROVIDER_URL);

let oysterTokenInstance;
let musicContractInstance;
let oysterVaultInstance;
let wallet;

async function initializeBlockchainService() {
    console.log(colors.fg.blue + colors.bright + "Initializing Blockchain Service..." + colors.reset);

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

    console.log("Wallet Address:", colors.fg.yellow + await wallet.getAddress() + colors.reset);

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

    console.log(colors.fg.green + "Blockchain Service Initialized." + colors.reset);
}

async function sealMusicContract() {
    console.log(colors.fg.cyan + "Sealing Music Contract..." + colors.reset);
    try {
        const result = await musicContractInstance.sealRights();
        await result.wait();
        return result.hash;
    } catch (error) {
        if (error.code === 'NETWORK_ERROR') {
            throw new Error('Network error. Please check your connection.');
        }
        console.error(colors.fg.red + "Error during sealMusicContract:" + colors.reset, error);
        throw error;
    }
}

async function assignRights(addressRight, percentageOfRights) {
    console.log(colors.fg.cyan + `Assigning ${percentageOfRights}% rights to ${addressRight}` + colors.reset);
    try {
        const result = await musicContractInstance.assignRights(addressRight, percentageOfRights);
        await result.wait();
        return result.hash;
    } catch (error) {
        if (error.code === 'NETWORK_ERROR') {
            throw new Error('Network error. Please check your connection.');
        }
        console.error(colors.fg.red + "Error during assignRights:" + colors.reset, error);
        throw error;
    }
}

async function withdrawRights(addressRight, percentageOfRights) {
    console.log(colors.fg.cyan + `Withdrawing ${percentageOfRights}% rights from ${addressRight}` + colors.reset);
    try {
        const result = await musicContractInstance.withdrawRights(addressRight, percentageOfRights);
        await result.wait();
        return result.hash;
    } catch (error) {
        if (error.code === 'NETWORK_ERROR') {
            throw new Error('Network error. Please check your connection.');
        }
        console.error(colors.fg.red + "Error during withdrawRights:" + colors.reset, error);
        throw error;
    }
}

async function buy100OysterToken() {
    console.log(colors.fg.cyan + "Buying 100 OysterToken..." + colors.reset);
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
        console.error(colors.fg.red + "Error during buy100OysterToken:" + colors.reset, error);
        throw error;
    }
}

async function sellOysterToken(amount) {
    console.log(colors.fg.cyan + `Selling ${amount} OysterToken...` + colors.reset);
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
        console.error(colors.fg.red + "Error during sellOysterToken:" + colors.reset, error);
        throw error;
    }
}

async function getRemainingRightsDivision() {
    console.log(colors.fg.cyan + "Getting Remaining Rights Division..." + colors.reset);
    try {
        const result = await musicContractInstance.remainingRightsDivision();
        return result;
    } catch (error) {
        if (error.code === 'NETWORK_ERROR') {
            throw new Error('Network error. Please check your connection.');
        }
        console.error(colors.fg.red + "Error during getRemainingRightsDivision:" + colors.reset, error);
        throw error;
    }
}

async function isMusicContractSealed() {
    console.log(colors.fg.cyan + "Checking if Music Contract is Sealed..." + colors.reset);
    try {
        const result = await musicContractInstance.musicContactIsSealed();
        return result;
    } catch (error) {
        if (error.code === 'NETWORK_ERROR') {
            throw new Error('Network error. Please check your connection.');
        }
        console.error(colors.fg.red + "Error during isMusicContractSealed:" + colors.reset, error);
        throw error;
    }
}

async function getTokensPerAddress(address) {
    console.log(colors.fg.cyan + `Getting Tokens for Address: ${address}` + colors.reset);
    try {
        const result = await musicContractInstance.tokensPerAddress(address);
        return result;
    } catch (error) {
        if (error.code === 'NETWORK_ERROR') {
            throw new Error('Network error. Please check your connection.');
        }
        console.error(colors.fg.red + "Error during getTokensPerAddress:" + colors.reset, error);
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
    console.log(colors.fg.cyan + "Buying Music Rights..." + colors.reset);
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
        console.error(colors.fg.red + "Error during buyRightsMusic:" + colors.reset, error);
        throw error;
    }
}

async function listenMusic() {
    console.log(colors.fg.cyan + "Listening to Music..." + colors.reset);
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
        console.error(colors.fg.red + "Error during listenMusic:" + colors.reset, error);
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