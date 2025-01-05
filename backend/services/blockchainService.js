const { ethers } = require('ethers');
const fs = require('fs');
require('dotenv').config();

const provider = new ethers.JsonRpcProvider('http://127.0.0.1:7545');

let oysterTokenInstance;
let musicContractInstance;
let oysterVaultInstance;
let wallet;

async function initializeBlockchainService() {
    const deployData = JSON.parse(fs.readFileSync('deploy-data.json', 'utf8'));
    const oysterTokenAddress = deployData.oysterToken.address;
    const oysterTokenABI = deployData.oysterToken.abi;
    const musicContractAddress = deployData.musicContract.address;
    const musicContractABI = deployData.musicContract.abi;
    const oysterVaultAddress = deployData.oysterVault.address;
    const oysterVaultABI = deployData.oysterVault.abi;

    const privateKey = process.env.PRIVATE_KEY;

    if (!privateKey) {
        throw new Error(
            'PRIVATE_KEY environment variable not set. Please define it in your .env file.'
        );
    }

    wallet = new ethers.Wallet(privateKey, provider);

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
}

async function validateMusicContract(addressMusicContract) {
    if (!oysterTokenInstance) {
        throw new Error('Blockchain service not initialized.');
    }
    const result = await oysterTokenInstance.validateMusicContracts(
        addressMusicContract
    );
    await result.wait();
    return result.hash;
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


async function buyTokens(weiValue) {
  if (!oysterTokenInstance) {
    throw new Error('OysterToken contract not initialized.');
  }

  const result = await oysterTokenInstance.buyTokens(musicContractInstance.target, {
      value: weiValue,
      gasLimit: 300000
  });

  await result.wait();
  return result.hash;
}

async function sellOysterTokens(amount) {
    if (!oysterTokenInstance) {
        throw new Error('OysterToken contract not initialized.');
    }
    if (!musicContractInstance) {
        throw new Error('Music contract not initialized.');
    }
    try {
      const result = await musicContractInstance.sellTokens(
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