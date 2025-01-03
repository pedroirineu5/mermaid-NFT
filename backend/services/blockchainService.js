const { ethers } = require('ethers');
const fs = require('fs');
require('dotenv').config();

const provider = new ethers.JsonRpcProvider('http://127.0.0.1:7545');

let oysterTokenInstance;
let oysterVaultInstance;
let musicContractInstance;

async function initializeBlockchainService() {
  const deployData = JSON.parse(fs.readFileSync('deploy-data.json', 'utf8'));
  const oysterTokenAddress = deployData.oysterToken.address;
  const oysterTokenABI = deployData.oysterToken.abi;
  const oysterVaultAddress = deployData.oysterVault.address;
  const oysterVaultABI = deployData.oysterVault.abi;
  const musicContractAddress = deployData.musicContract.address;
  const musicContractABI = deployData.musicContract.abi;

  const privateKey = process.env.PRIVATE_KEY;

  if (!privateKey) {
    throw new Error(
      'PRIVATE_KEY environment variable not set. Please define it in your .env file.'
    );
  }

  const wallet = new ethers.Wallet(privateKey, provider);

  oysterTokenInstance = new ethers.Contract(
    oysterTokenAddress,
    oysterTokenABI,
    wallet
  );

  oysterVaultInstance = new ethers.Contract(
    oysterVaultAddress,
    oysterVaultABI,
    wallet
  );

  musicContractInstance = new ethers.Contract(
    musicContractAddress,
    musicContractABI,
    wallet
  );

  console.log('Blockchain service initialized with signer:', wallet.address);
}

async function validateMusicContract(addressMusicContract) {
  if (!oysterTokenInstance) {
    throw new Error('Blockchain service not initialized.');
  }

  console.log('Validating music contract:', addressMusicContract);
  try {
    const result = await oysterTokenInstance.validateMusicContracts(
      addressMusicContract
    );
    await result.wait();
    console.log('Transaction result:', result);
    return result.hash;
  } catch (error) {
    console.error('Error validating music contract:', error);
    throw new Error(`Failed to validate music contract: ${error.message}`);
  }
}

async function sealMusicContract() {
  if (!musicContractInstance) {
    throw new Error('Music contract not initialized.');
  }

  console.log('Sealing music contract...');
  try {
    const result = await musicContractInstance.sealRights();
    await result.wait();
    console.log('Transaction result:', result);
    return result.hash;
  } catch (error) {
    console.error('Error sealing music contract:', error);
    throw new Error(`Failed to seal music contract: ${error.message}`);
  }
}

async function assignMusicRights(address, percentage) {
  if (!musicContractInstance) {
    throw new Error('Music contract not initialized.');
  }

  console.log(`Assigning ${percentage}% of rights to ${address}...`);
  try {
    const result = await musicContractInstance.assignRights(address, percentage);
    await result.wait();
    console.log('Transaction result:', result);
    return result.hash;
  } catch (error) {
    console.error('Error assigning music rights:', error);
    throw new Error(`Failed to assign music rights: ${error.message}`);
  }
}

async function withdrawMusicRights(address, percentage) {
  if (!musicContractInstance) {
    throw new Error('Music contract not initialized.');
  }

  console.log(`Withdrawing ${percentage}% of rights from ${address}...`);
  try {
    const result = await musicContractInstance.withdrawRights(
      address,
      percentage
    );
    await result.wait();
    console.log('Transaction result:', result);
    return result.hash;
  } catch (error) {
    console.error('Error withdrawing music rights:', error);
    throw new Error(`Failed to withdraw music rights: ${error.message}`);
  }
}

// Funções atualizadas para interagir com OysterToken e MusicContract
async function buy100OysterTokens(address) {
    if (!oysterTokenInstance) {
        throw new Error('OysterToken contract not initialized.');
    }
      
    console.log(`Buying 100 Oyster tokens to ${address}...`);
    try {
        const result = await oysterTokenInstance.buy100OSTToMusicContract(address, {
            value: (await oysterTokenInstance.getBusinessRateWei()) + ((await oysterTokenInstance.getGweiPerToken()) * BigInt(100) * (10n ** 9n))
        });
        await result.wait();
        console.log('Transaction result:', result);
        return result.hash;
    } catch (error) {
        console.error('Error buying Oyster tokens:', error);
        throw new Error(`Failed to buy Oyster tokens: ${error.message}`);
    }
}

async function sellOysterTokens(amount) {
    if (!oysterTokenInstance) {
      throw new Error('OysterToken contract not initialized.');
    }
  
    console.log(`Selling ${amount} Oyster tokens...`);
    try {
        const result = await oysterTokenInstance.sellOysterToken(musicContractInstance.target, BigInt(amount));
        await result.wait();
        console.log('Transaction result:', result);
        return result.hash;
    } catch (error) {
        console.error('Error selling Oyster tokens:', error);
        throw new Error(`Failed to sell Oyster tokens: ${error.message}`);
    }
}

async function buyMusicRights() {
    if (!musicContractInstance) {
      throw new Error('Music contract not initialized.');
    }
  
    console.log(`Buying music rights...`);
    try {
        const result = await musicContractInstance.buyRightsMusic({
            value: await musicContractInstance.rightPurchaseValueInGwei() * (10n ** 9n)
        });
        await result.wait();
        console.log('Transaction result:', result);
        return result.hash;
    } catch (error) {
        console.error('Error buying music rights:', error);
        throw new Error(`Failed to buy music rights: ${error.message}`);
    }
}
  
async function listenToMusic() {
    if (!musicContractInstance) {
        throw new Error('Music contract not initialized.');
    }
        
    console.log(`Listening to music...`);
    try {
        const result = await musicContractInstance.listenMusic({
            value: await musicContractInstance.valueForListeningInGwei() * (10n ** 9n)
        });
        await result.wait();
        console.log('Transaction result:', result);
        return result.hash;
    } catch (error) {
        console.error('Error listening to music:', error);
        throw new Error(`Failed to listen to music: ${error.message}`);
    }
}

async function getRightHolders() {
    if (!musicContractInstance) {
      throw new Error('Music contract not initialized.');
    }
  
    console.log('Getting right holders...');
  
    const result = await musicContractInstance.getRightHolders();
    console.log('Right holders:', result);
    return result;
  }

async function getRemainingRightsDivision() {
  if (!musicContractInstance) {
    throw new Error('Music contract not initialized.');
  }

  console.log('Getting remaining rights division...');

  const result = await musicContractInstance.remainingRightsDivision();
  console.log('Remaining rights division:', result);
  return result;
}

async function getDivisionOfRights(address) {
  if (!musicContractInstance) {
    throw new Error('Music contract not initialized.');
  }

  console.log(`Getting division of rights for address: ${address}...`);

  const result = await musicContractInstance.divisionOfRights(address);
  console.log('Division of rights:', result);
  return result;
}

async function isMusicContractSealed() {
  if (!musicContractInstance) {
    throw new Error('Music contract not initialized.');
  }

  console.log('Checking if music contract is sealed...');

  const result = await musicContractInstance.musicContactIsSealed();
  console.log('Music contract sealed:', result);
  return result;
}

async function getTokensPerAddress(address) {
    if (!musicContractInstance) {
      throw new Error('Music contract not initialized.');
    }
  
    console.log(`Getting tokens per address for address: ${address}...`);
  
    const result = await musicContractInstance.tokensPerAddress(address);
    console.log('Tokens per address:', result);
    return result;
}

async function getMusicContractBalance() {
    if (!musicContractInstance) {
      throw new Error('Music contract not initialized.');
    }
  
    console.log('Getting music contract balance...');
  
    const result = await musicContractInstance.viewBalance();
    console.log('Music contract balance:', result);
    return result;
}

async function isMusicContractValid(addressMusicContract) {
    if (!oysterTokenInstance) {
      throw new Error('OysterToken contract not initialized.');
    }
  
    console.log(`Checking if music contract is valid: ${addressMusicContract}`);
    try {
      const isValid = await oysterTokenInstance.validMusicContracts(addressMusicContract);
      console.log('Music contract valid:', isValid);
      return isValid;
    } catch (error) {
      console.error('Error checking music contract validity:', error);
      throw new Error(`Failed to check music contract validity: ${error.message}`);
    }
}

module.exports = {
  initializeBlockchainService,
  validateMusicContract,
  sealMusicContract,
  assignMusicRights,
  withdrawMusicRights,
  buy100OysterTokens,
  sellOysterTokens,
  buyMusicRights,
  listenToMusic,
  getRightHolders,
  getRemainingRightsDivision,
  getDivisionOfRights,
  isMusicContractSealed,
  getTokensPerAddress,
  getMusicContractBalance,
  isMusicContractValid
};