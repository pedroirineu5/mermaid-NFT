const { ethers } = require('ethers');
const fs = require('fs');
require('dotenv').config();

const provider = new ethers.JsonRpcProvider(process.env.HARDHAT_PROVIDER_URL);

let oysterTokenInstance;
let musicContractInstance;
let oysterVaultInstance;
let wallet;

async function initializeBlockchainService() {
    console.log("===== Initializing Blockchain Service =====");

    // Check for the existence of deploy-data.json
    if (!fs.existsSync('deploy-data.json')) {
        throw new Error("deploy-data.json file not found. Please run the deployment script before starting the backend.");
    }

    // Check for the validity of deploy-data.json
    let deployData;
    try {
        deployData = JSON.parse(fs.readFileSync('deploy-data.json', 'utf8'));
    } catch (error) {
        throw new Error("Error reading deploy-data.json. Please ensure the file is a valid JSON.");
    }
    console.log("deployData:", deployData);

    const oysterTokenAddress = deployData.oysterToken.address;
    const oysterTokenABI = deployData.oysterToken.abi;
    const musicContractAddress = deployData.musicContract.address;
    const musicContractABI = deployData.musicContract.abi;
    const oysterVaultAddress = deployData.oysterVault.address;
    const oysterVaultABI = deployData.oysterVault.abi;

    // Obter a carteira (signer) diretamente do provedor
    wallet = await provider.getSigner(0); // Pega a primeira conta disponível

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

    console.log("===== Blockchain Service Initialized =====");
}

async function validateMusicContract(addressMusicContract) {
    console.log("===== Validating Music Contract =====");
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
        console.log("===== Music Contract Validated =====");
        return { hash: tx.hash, isValid: true };
    } catch (error) {
        console.error("Error during validateMusicContract:", error);
        throw error;
    }
}

async function sealMusicContract() {
    console.log("===== Sealing Music Contract =====");
    if (!musicContractInstance) {
        throw new Error('Music contract not initialized.');
    }
    try {
        const result = await musicContractInstance.sealRights();
        await result.wait();
        console.log("===== Music Contract Sealed =====");
        return result.hash;
    } catch (error) {
        console.error("Error during sealMusicContract:", error);
        throw error;
    }
}

async function assignRights(addressRight, percentageOfRights) {
    console.log("===== Assigning Rights =====");
    if (!musicContractInstance) {
        throw new Error('Music contract not initialized.');
    }
    try {
        const result = await musicContractInstance.assignRights(addressRight, percentageOfRights);
        await result.wait();
        console.log("===== Rights Assigned =====");
        return result.hash;
    } catch (error) {
        console.error("Error during assignRights:", error);
        throw error;
    }
}

async function withdrawRights(addressRight, percentageOfRights) {
    console.log("===== Withdrawing Rights =====");
    if (!musicContractInstance) {
        throw new Error('Music contract not initialized.');
    }
    try {
        const result = await musicContractInstance.withdrawRights(addressRight, percentageOfRights);
        await result.wait();
        console.log("===== Rights Withdrawn =====");
        return result.hash;
    } catch (error) {
        console.error("Error during withdrawRights:", error);
        throw error;
    }
}

async function buy100OysterToken() {
    console.log("===== Buying 100 OysterToken =====");
    if (!musicContractInstance) {
        throw new Error('Music contract not initialized.');
    }

    const businessRateWei = ethers.parseUnits(process.env.BUSINESS_RATE_WEI, "gwei");
    const tokensToBuy = 100;
    const gweiPerToken = ethers.parseUnits(process.env.GWEI_PER_TOKEN, "gwei");
    const weiValue = tokensToBuy * gweiPerToken + businessRateWei;

    try {
        const result = await musicContractInstance.buy100OysterToken({
            value: weiValue.toString(),
            gasLimit: 300000
        });

        await result.wait();
        console.log("===== 100 OysterToken Bought =====");
        return result.hash;
    } catch (error) {
        console.error("Error during buy100OysterToken:", error);
        throw error;
    }
}

async function sellOysterToken(amount) {
    console.log("===== Selling OysterToken =====");
    if (!musicContractInstance) {
        throw new Error('Music contract not initialized.');
    }
    try {
        const result = await musicContractInstance.sellOysterToken(
            BigInt(amount)
        );

        await result.wait();
        console.log("===== OysterToken Sold =====");
        return result.hash;
    } catch (error) {
        console.error("Error in sellOysterToken:", error);
        throw new Error(`Failed to sell Oyster tokens: ${error.message}`);
    }
}

async function getRemainingRightsDivision() {
    console.log("===== Getting Remaining Rights Division =====");
    if (!musicContractInstance) {
        throw new Error('Music contract not initialized.');
    }
    try {
        const result = await musicContractInstance.remainingRightsDivision();
        console.log("===== Remaining Rights Division:", result.toString());
        return result;
    } catch (error) {
        console.error("Error during getRemainingRightsDivision:", error);
        throw error;
    }
}

async function isMusicContractSealed() {
    console.log("===== Checking if Music Contract is Sealed =====");
    if (!musicContractInstance) {
        throw new Error('Music contract not initialized.');
    }
    try {
        const result = await musicContractInstance.musicContactIsSealed();
        console.log("===== Music Contract Sealed Status:", result);
        return result;
    } catch (error) {
        console.error("Error during isMusicContractSealed:", error);
        throw error;
    }
}

async function getTokensPerAddress(address) {
    console.log("===== Getting Tokens Per Address =====");
    if (!musicContractInstance) {
        throw new Error('Music contract not initialized.');
    }
    try {
        const result = await musicContractInstance.tokensPerAddress(address);
        console.log("===== Tokens Per Address:", result.toString());
        return result;
    } catch (error) {
        console.error("Error during getTokensPerAddress:", error);
        throw error;
    }
}

async function getSignerAddress() {
    if (!wallet) {
        throw new Error('Wallet not initialized.');
    }
    return wallet.getAddress();
}

async function buyRightsMusic() {
    console.log("===== Buying Music Rights =====");
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
        console.log("===== Music Rights Bought =====");
        return result.hash;
    } catch (error) {
        console.error("Error during buyRightsMusic:", error);
        throw error;
    }
}

async function listenMusic() {
    console.log("===== Listening to Music =====");
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
        console.log("===== Music Listened To =====");
        return result.hash;
    } catch (error) {
        console.error("Error during listenMusic:", error);
        throw error;
    }
}

async function viewBalance() {
    console.log("===== Viewing Balance =====");
    if (!musicContractInstance) {
        throw new Error('Music contract not initialized.');
    }
    try {
        const result = await musicContractInstance.viewBalance();
        console.log("===== Balance:", result.toString());
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