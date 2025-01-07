const { ethers } = require('ethers');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const provider = new ethers.JsonRpcProvider(process.env.HARDHAT_PROVIDER_URL);

let oysterTokenInstance;
let oysterVaultInstance;
let wallet;

async function initializeBlockchainService() {
    console.log("===== Initializing Blockchain Service =====");

    if (!fs.existsSync('deploy-data.json')) {
        throw new Error("deploy-data.json file not found. Please run the deployment script before starting the backend.");
    }

    let deployData;
    try {
        deployData = JSON.parse(fs.readFileSync('deploy-data.json', 'utf8'));
    } catch (error) {
        throw new Error("Error reading deploy-data.json. Please ensure the file is a valid JSON.");
    }
    console.log("deployData:", deployData);

    const oysterTokenAddress = deployData.oysterToken.address;
    const oysterTokenABI = deployData.oysterToken.abi;
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
    console.log("oysterTokenInstance Address:", oysterTokenInstance.target);

    oysterVaultInstance = new ethers.Contract(
        oysterVaultAddress,
        oysterVaultABI,
        wallet
    );
    console.log("oysterVaultInstance Address:", oysterVaultInstance.target);

    console.log("===== Blockchain Service Initialized =====");
}

async function validateMusicContract(addressMusicContract) {
    console.log("===== Validating Music Contract ======");
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
        console.log("===== Music Contract Validated ======");
        return true;
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

    const businessRateWei = BigInt(process.env.BUSINESS_RATE_WEI);
    const tokensToBuy = 100;
    const gweiPerToken = BigInt(process.env.GWEI_PER_TOKEN);

    const padding = BigInt(110000000000000);

    const weiValue = BigInt(tokensToBuy) * gweiPerToken + businessRateWei + padding;

    console.log("Business Rate (wei):", businessRateWei.toString());
    console.log("Gwei per Token:", gweiPerToken.toString());
    console.log("Wei Value to send:", weiValue.toString());

    try {
        const result = await musicContractInstance.buy100OysterToken({
            value: weiValue
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

async function getAllMusics() {
    console.log("===== Getting All Musics =====");
    const musicContracts = [];
    
    // Implementar lógica para buscar todos os contratos de música
    
    return musicContracts;
}

async function getMusicsByProducer(producerAddress) {
    console.log(`===== Getting Musics By Producer: ${producerAddress} =====`);
    const musics = [];

    // Implementar lógica para buscar músicas por produtor
  
    return musics;
}

async function getMusicById(id) {
    console.log(`===== Getting Music By ID: ${id} =====`);
    let music;

    // Implementar lógica para buscar música por ID
  
    return music;
}

async function createMusic(musicData) {
    console.log("===== Creating Music =====");
    const { title, artist, producer, metadata, duration } = musicData;

    const musicContractFactory = new ethers.ContractFactory(
        deployData.musicContract.abi,
        deployData.musicContract.bytecode,
        wallet
    );

    const rightPurchaseValueInGwei = BigInt(process.env.RIGHT_PURCHASE_VALUE_IN_GWEI);
    const valueForListeningInGwei = BigInt(process.env.VALUE_FOR_LISTENING_IN_GWEI);

    const musicContract = await musicContractFactory.deploy(
        oysterTokenInstance.target,
        oysterVaultInstance.target,
        rightPurchaseValueInGwei,
        valueForListeningInGwei
    );

    await musicContract.waitForDeployment();

    const musicContractAddress = await musicContract.getAddress();

    const musicId = uuidv4();

    // Implementar lógica para salvar dados adicionais da música

    return musicContractAddress;
}

async function getAccountBalance(address) {
    console.log(`===== Getting Account Balance for ${address} =====`);
    try {
        const balance = await provider.getBalance(address);
        console.log(`===== Balance for ${address}: ${balance.toString()} =====`);
        return balance;
    } catch (error) {
        console.error(`Error fetching balance for address ${address}:`, error);
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
    viewBalance,
    getAllMusics,
    getMusicsByProducer,
    getMusicById,
    createMusic,
    getAccountBalance
};