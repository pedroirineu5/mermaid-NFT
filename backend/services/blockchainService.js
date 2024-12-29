const { Web3 } = require('web3');

let contractInstance;
let deployerAccount;

async function initializeBlockchainService(contractABI, contractAddress) {
    const web3 = new Web3("http://127.0.0.1:7545"); // URL do Ganache
    contractInstance = new web3.eth.Contract(contractABI, contractAddress);

    const accounts = await web3.eth.getAccounts();
    deployerAccount = accounts[0];

    console.log("Blockchain service initialized with deployer account:", deployerAccount);
}

async function registerSong(songId, metadataURI) {
    if (!contractInstance || !deployerAccount) {
        throw new Error("Blockchain service not initialized.");
    }

    console.log("Registering song:", songId, metadataURI);
    const result = await contractInstance.methods.registerSong(songId, metadataURI).send({ from: deployerAccount });
    console.log("Transaction result:", result);
    return result.transactionHash;
}

async function grantLicense(songId, licenseId) {
    if (!contractInstance || !deployerAccount) {
        throw new Error("Blockchain service not initialized.");
    }

    console.log("Granting license:", songId, licenseId); // Log para depuração
    const result = await contractInstance.methods.grantLicense(songId, licenseId).send({ from: deployerAccount });
    console.log("Transaction result:", result);
    return result.transactionHash;
}

module.exports = {
    initializeBlockchainService,
    registerSong,
    grantLicense,
};