const { Web3 } = require('web3');
const oysterTokenContract = require('../artifacts/contracts/OysterToken.sol/OysterToken.json');
const oysterVaultContract = require('../artifacts/contracts/OysterVault.sol/OysterVault.json');

const web3 = new Web3('http://127.0.0.1:7545');

let oysterTokenInstance;
let oysterVaultInstance;
let deployerAccount;

async function initializeBlockchainService() {
    const networkId = await web3.eth.net.getId();

    const deployedOysterTokenAddress = oysterTokenContract.networks[networkId].address;
    const deployedOysterVaultAddress = oysterVaultContract.networks[networkId].address;

    oysterTokenInstance = new web3.eth.Contract(oysterTokenContract.abi, deployedOysterTokenAddress);
    oysterVaultInstance = new web3.eth.Contract(oysterVaultContract.abi, deployedOysterVaultAddress);

    const accounts = await web3.eth.getAccounts();
    deployerAccount = accounts[0];

    console.log("Blockchain service initialized with deployer account:", deployerAccount);
}

async function validateMusicContract(addressMusicContract) {
    if (!oysterTokenInstance || !deployerAccount) {
        throw new Error("Blockchain service not initialized.");
    }

    console.log("Validating music contract:", addressMusicContract);
    const result = await oysterTokenInstance.methods.validateMusicContracts(addressMusicContract).send({ from: deployerAccount });
    console.log("Transaction result:", result);
    return result.transactionHash;
}

async function buyTokens(amount) {
    if (!oysterTokenInstance || !deployerAccount) {
        throw new Error("Blockchain service not initialized.");
    }

    console.log("Buying tokens, amount (in Wei):", amount);
    const result = await contractInstance.methods.grantLicense(songId, licenseId).send({ from: deployerAccount });
    console.log("Transaction result:", result);
    return result.transactionHash;
}

module.exports = {
    initializeBlockchainService,
    validateMusicContract,
    buyTokens,
};