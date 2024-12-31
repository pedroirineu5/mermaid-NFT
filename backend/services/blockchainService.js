const { ethers } = require('ethers');
const fs = require('fs');

const provider = new ethers.JsonRpcProvider('http://127.0.0.1:7545');

let oysterTokenInstance;
let oysterVaultInstance;
let musicContractInstance;

async function initializeBlockchainService() {
  const deployData = JSON.parse(fs.readFileSync('deploy-data.json', 'utf8'));
  const oysterTokenAddress = deployData.oysterToken.address;
  const oysterTokenABI = deployData.oysterToken.abi;
  const musicContractAddress = deployData.musicContract.address;
  const musicContractABI = deployData.musicContract.abi;

  // Obter a chave privada da variável de ambiente
  const privateKey = process.env.PRIVATE_KEY;

  // Verificar se a chave privada foi definida
  if (!privateKey) {
    throw new Error(
      'PRIVATE_KEY environment variable not set. Please define it in your .env file.'
    );
  }

  // Criar um Wallet conectado ao provedor
  const wallet = new ethers.Wallet(privateKey, provider);

  oysterTokenInstance = new ethers.Contract(
    oysterTokenAddress,
    oysterTokenABI,
    wallet // Usar o Wallet como signer
  );

  musicContractInstance = new ethers.Contract(
    musicContractAddress,
    musicContractABI,
    wallet // Usar o Wallet como signer
  );

  console.log(
    'Blockchain service initialized with signer:',
    wallet.address
  );
}

async function validateMusicContract(addressMusicContract) {
  if (!oysterTokenInstance) {
    throw new Error('Blockchain service not initialized.');
  }

  console.log('Validating music contract:', addressMusicContract);

  const result = await oysterTokenInstance.validateMusicContracts(
    addressMusicContract
  );
  console.log('Transaction result:', result);
  return result.hash;
}

async function buyTokens(amount) {
  if (!musicContractInstance) {
    throw new Error('Music contract not initialized.');
  }

  console.log(
    'Buying tokens through music contract, amount (in Wei):',
    amount
  );

  const amountString = amount.toString();
  const result = await musicContractInstance.buyTokens({
    value: amountString,
    gasLimit: 200000,
  });

  console.log('Transaction result:', result);
  return result.hash;
}

module.exports = {
  initializeBlockchainService,
  validateMusicContract,
  buyTokens,
};