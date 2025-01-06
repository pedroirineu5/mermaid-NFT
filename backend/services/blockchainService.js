const { ethers } = require('ethers');
const fs = require('fs');
require('dotenv').config();

const provider = new ethers.JsonRpcProvider('http://127.0.0.1:7545');

let oysterTokenInstance;
let musicContractInstance;
let oysterVaultInstance;
let wallet;

async function initializeBlockchainService() {
    console.log("===== initializeBlockchainService =====");
    const deployData = JSON.parse(fs.readFileSync('deploy-data.json', 'utf8'));
    console.log("deployData:", deployData);

    const oysterTokenAddress = deployData.oysterToken.address;
    const oysterTokenABI = deployData.oysterToken.abi;
    const musicContractAddress = deployData.musicContract.address;
    const musicContractABI = deployData.musicContract.abi;
    const oysterVaultAddress = deployData.oysterVault.address;
    const oysterVaultABI = deployData.oysterVault.abi;

    console.log("OYSTER_TOKEN_ADDRESS (from deployData):", oysterTokenAddress);
    console.log("MUSIC_CONTRACT_ADDRESS (from deployData):", musicContractAddress);
    console.log("OYSTER_VAULT_ADDRESS (from deployData):", oysterVaultAddress);

    console.log("OYSTER_TOKEN_ADDRESS (from .env):", process.env.OYSTER_TOKEN_ADDRESS);
    console.log("MUSIC_CONTRACT_ADDRESS (from .env):", process.env.MUSIC_CONTRACT_ADDRESS);
    console.log("OYSTER_VAULT_ADDRESS (from .env):", process.env.OYSTER_VAULT_ADDRESS);
    console.log("GWEI_PER_TOKEN (from .env):", process.env.GWEI_PER_TOKEN);
    console.log("PRIVATE_KEY (from .env):", process.env.PRIVATE_KEY);

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
    
        // Verifica o status da transação no recibo
        if (receipt.status === 0) {
          console.error("Transaction Reverted:", receipt);
          throw new Error("Transaction reverted");
        }
    
        // Se a transação não foi revertida, prosseguimos
        console.log("Transaction Hash:", tx.hash);
        console.log("===== validateMusicContract END =====");
        return { hash: tx.hash, isValid: true };
      } catch (error) {
        console.error("Error during validateMusicContract:", error);
        throw error;
      }
}

async function sealMusicContract() {
    if (!musicContractInstance) {
        throw new Error('Music contract not initialized.');
    }
    const result = await musicContractInstance.sealRights();
    await result.wait();
    return result.hash;
}

async function assignFullMusicRights(addressRight) {
    if (!musicContractInstance) {
        throw new Error('Music contract not initialized.');
    }
    const result = await musicContractInstance.assignFullRights(addressRight);
    await result.wait();
    return result.hash;
}

async function buyTokens(buyerAddress, amount) {
    if (!oysterTokenInstance) {
        throw new Error('OysterToken contract not initialized.');
    }

    // Obter o valor em Wei a ser enviado (quantidade de tokens * gwei por token)
    const gweiPerToken = BigInt(process.env.GWEI_PER_TOKEN);
    const weiValue = BigInt(amount) * gweiPerToken;

    // Chamar a função buyTokens do contrato OysterToken, enviando o valor em Wei
    const result = await oysterTokenInstance.connect(wallet).buyTokens(musicContractInstance.target, amount, {
        value: weiValue,
        gasLimit: 300000
    });

    await result.wait();
    return result.hash;
}

async function sellOysterTokens(amount) {
    if (!musicContractInstance) {
        throw new Error('Music contract not initialized.');
    }
    try {
        const result = await musicContractInstance.connect(wallet).sellTokens(
            BigInt(amount)
        );

        await result.wait();
        return result.hash;
    } catch (error) {
        console.error("Error in sellOysterTokens:", error);
        throw new Error(`Failed to sell Oyster tokens: ${error.message}`);
    }
}

async function getRemainingRightsDivision() {
    if (!musicContractInstance) {
        throw new Error('Music contract not initialized.');
    }
    const result = await musicContractInstance.getRemainingRightsDivision();
    return result;
}

async function isMusicContractSealed() {
    if (!musicContractInstance) {
        throw new Error('Music contract not initialized.');
    }
    const result = await musicContractInstance.isMusicContractSealed();
    return result;
}

async function getTokensPerAddress(address) {
    if (!musicContractInstance) {
        throw new Error('Music contract not initialized.');
    }
    const result = await musicContractInstance.viewTokensPerAddress(address);
    return result;
}

async function getSignerAddress() {
    return wallet.getAddress();
}

module.exports = {
    initializeBlockchainService,
    validateMusicContract,
    sealMusicContract,
    assignFullMusicRights,
    buyTokens,
    sellOysterTokens,
    getRemainingRightsDivision,
    isMusicContractSealed,
    getTokensPerAddress,
    getSignerAddress
};