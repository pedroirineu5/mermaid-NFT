require('dotenv').config();
const { Web3 } = require('web3');

const web3 = new Web3(new Web3.providers.HttpProvider(process.env.SEPOLIA_URL));

async function testConnection() {
  try {
    const blockNumber = await web3.eth.getBlockNumber();
    console.log('Conexão bem-sucedida com a Sepolia! Bloco atual:', blockNumber);
  } catch (error) {
    console.error('Erro ao conectar com a Sepolia:', error);
  }
}

testConnection();