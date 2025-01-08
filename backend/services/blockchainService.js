const { ethers } = require("ethers");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();
const {
  getConnection,
  insertMusic,
  getMusicsByProducer,
  getMusicById,
  getAllMusics,
} = require("./dbService");

const provider = new ethers.JsonRpcProvider(
  process.env.HARDHAT_PROVIDER_URL
);

let oysterTokenInstance;
let oysterVaultInstance;
let musicContractInstance;
let wallet;

function readDeployData() {
  if (!fs.existsSync("deploy-data.json")) {
    throw new Error(
      "deploy-data.json file not found. Please run the deployment script before starting the backend."
    );
  }

  try {
    return JSON.parse(fs.readFileSync("deploy-data.json", "utf8"));
  } catch (error) {
    throw new Error(
      "Error reading deploy-data.json. Please ensure the file is a valid JSON."
    );
  }
}

async function initializeBlockchainService() {
  console.log("===== Initializing Blockchain Service =====");

  const {
    oysterToken: { address: oysterTokenAddress, abi: oysterTokenABI },
    oysterVault: { address: oysterVaultAddress, abi: oysterVaultABI },
  } = readDeployData();

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
  console.log("===== Validating Music Contract =====");
  console.log(
    "Validating Music Contract Address (input):",
    addressMusicContract
  );
  if (!oysterTokenInstance) {
    throw new Error("Blockchain service not initialized.");
  }
  console.log(
    "oysterTokenInstance Address (inside validateMusicContract):",
    oysterTokenInstance.target
  );

  console.log(
    "Calling validateMusicContracts with address:",
    addressMusicContract
  );

  try {
    const tx = await oysterTokenInstance.validateMusicContracts(
      addressMusicContract
    );
    console.log("Transaction hash:", tx.hash);
    const receipt = await tx.wait();
    console.log("Transaction confirmed in block:", receipt.blockNumber);

    if (receipt.status === 0) {
      console.error("Transaction Reverted:", receipt);
      throw new Error("Transaction reverted");
    }

    console.log("===== Music Contract Validated =====");
    return true;
  } catch (error) {
    console.error("Error during validateMusicContract:", error);
    throw error;
  }
}

async function sealMusicContract() {
  console.log("===== Sealing Music Contract =====");
  try {
    const sealTx = await musicContractInstance.sealRights();
    console.log("Transaction hash:", sealTx.hash);
    const sealReceipt = await sealTx.wait();
    console.log("Transaction confirmed in block:", sealReceipt.blockNumber);

    if (sealReceipt.status === 0) {
      console.error("Transaction Reverted:", sealReceipt);
      throw new Error("Seal transaction reverted");
    }

    return sealReceipt.transactionHash;
  } catch (error) {
    console.error("Error during sealMusicContract:", error);
    throw error;
  }
}

async function assignRights(addressRight, percentageOfRights) {
  console.log("===== Assigning Rights =====");
  try {
    const assignTx = await musicContractInstance.assignRights(
      addressRight,
      percentageOfRights
    );
    console.log("Transaction hash:", assignTx.hash);
    const assignReceipt = await assignTx.wait();
    console.log("Transaction confirmed in block:", assignReceipt.blockNumber);

    if (assignReceipt.status === 0) {
      console.error("Transaction Reverted:", assignReceipt);
      throw new Error("Assign rights transaction reverted");
    }

    return assignReceipt.transactionHash;
  } catch (error) {
    console.error("Error during assignRights:", error);
    throw error;
  }
}

async function withdrawRights(addressRight, percentageOfRights) {
  console.log("===== Withdrawing Rights =====");
  try {
    const withdrawTx = await musicContractInstance.withdrawRights(
      addressRight,
      percentageOfRights
    );
    console.log("Transaction hash:", withdrawTx.hash);
    const withdrawReceipt = await withdrawTx.wait();
    console.log("Transaction confirmed in block:", withdrawReceipt.blockNumber);

    if (withdrawReceipt.status === 0) {
      console.error("Transaction Reverted:", withdrawReceipt);
      throw new Error("Withdraw rights transaction reverted");
    }

    return withdrawReceipt.transactionHash;
  } catch (error) {
    console.error("Error during withdrawRights:", error);
    throw error;
  }
}

async function buy100OysterToken() {
  console.log("===== Buying 100 OysterToken =====");

  const businessRateWei = BigInt(process.env.BUSINESS_RATE_WEI);
  const tokensToBuy = 100;
  const gweiPerToken = BigInt(process.env.GWEI_PER_TOKEN);

  const weiValue = BigInt(tokensToBuy) * gweiPerToken + businessRateWei;

  console.log("Business Rate (wei):", businessRateWei.toString());
  console.log("Gwei per Token:", gweiPerToken.toString());
  console.log("Wei Value to send:", weiValue.toString());

  try {
    const buyTx = await musicContractInstance.buy100OysterToken({
      value: weiValue,
    });

    console.log("Transaction hash:", buyTx.hash);
    const buyReceipt = await buyTx.wait();
    console.log("Transaction confirmed in block:", buyReceipt.blockNumber);

    if (buyReceipt.status === 0) {
      console.error("Transaction Reverted:", buyReceipt);
      throw new Error("Buy 100 OysterToken transaction reverted");
    }

    return buyReceipt.transactionHash;
  } catch (error) {
    console.error("Error during buy100OysterToken:", error);
    throw error;
  }
}

async function sellOysterToken(amount) {
  console.log("===== Selling OysterToken =====");
  try {
    const sellTx = await musicContractInstance.sellOysterToken(
      BigInt(amount)
    );
    console.log("Transaction hash:", sellTx.hash);
    const sellReceipt = await sellTx.wait();
    console.log("Transaction confirmed in block:", sellReceipt.blockNumber);

    if (sellReceipt.status === 0) {
      console.error("Transaction Reverted:", sellReceipt);
      throw new Error("Sell OysterToken transaction reverted");
    }

    return sellReceipt.transactionHash;
  } catch (error) {
    console.error("Error in sellOysterToken:", error);
    throw new Error(`Failed to sell Oyster tokens: ${error.message}`);
  }
}

async function getRemainingRightsDivision() {
  console.log("===== Getting Remaining Rights Division =====");
  try {
    const remainingRights =
      await musicContractInstance.remainingRightsDivision();
    console.log("===== Remaining Rights Division:", remainingRights.toString());
    return remainingRights;
  } catch (error) {
    console.error("Error during getRemainingRightsDivision:", error);
    throw error;
  }
}

async function isMusicContractSealed() {
  console.log("===== Checking if Music Contract is Sealed =====");
  try {
    const isSealed = await musicContractInstance.musicContactIsSealed();
    console.log("===== Music Contract Sealed Status:", isSealed);
    return isSealed;
  } catch (error) {
    console.error("Error during isMusicContractSealed:", error);
    throw error;
  }
}

async function getTokensPerAddress(address) {
  console.log("===== Getting Tokens Per Address =====");
  try {
    const tokens = await musicContractInstance.tokensPerAddress(address);
    console.log("===== Tokens Per Address:", tokens.toString());
    return tokens;
  } catch (error) {
    console.error("Error during getTokensPerAddress:", error);
    throw error;
  }
}

async function getSignerAddress() {
  if (!wallet) {
    throw new Error("Wallet not initialized.");
  }
  return wallet.getAddress();
}

async function buyRightsMusic() {
  console.log("===== Buying Music Rights =====");

  const rightPurchaseValueInGwei = BigInt(
    process.env.RIGHT_PURCHASE_VALUE_IN_GWEI
  );
  const weiValue = rightPurchaseValueInGwei * BigInt(1e9);

  try {
    const buyRightsTx = await musicContractInstance.buyRightsMusic({
      value: weiValue.toString(),
      gasLimit: 300000,
    });

    console.log("Transaction hash:", buyRightsTx.hash);
    const buyRightsReceipt = await buyRightsTx.wait();
    console.log(
      "Transaction confirmed in block:",
      buyRightsReceipt.blockNumber
    );

    if (buyRightsReceipt.status === 0) {
      console.error("Transaction Reverted:", buyRightsReceipt);
      throw new Error("Buy music rights transaction reverted");
    }

    return buyRightsReceipt.transactionHash;
  } catch (error) {
    console.error("Error during buyRightsMusic:", error);
    throw error;
  }
}

async function listenMusic() {
  console.log("===== Listening to Music =====");
  const valueForListeningInGwei = BigInt(
    process.env.VALUE_FOR_LISTENING_IN_GWEI
  );
  const weiValue = valueForListeningInGwei * BigInt(1e9);

  try {
    const listenTx = await musicContractInstance.listenMusic({
      value: weiValue.toString(),
      gasLimit: 300000,
    });

    console.log("Transaction hash:", listenTx.hash);
    const listenReceipt = await listenTx.wait();
    console.log("Transaction confirmed in block:", listenReceipt.blockNumber);

    if (listenReceipt.status === 0) {
      console.error("Transaction Reverted:", listenReceipt);
      throw new Error("Listen music transaction reverted");
    }

    return listenReceipt.transactionHash;
  } catch (error) {
    console.error("Error during listenMusic:", error);
    throw error;
  }
}

async function viewBalance() {
  console.log("===== Viewing Balance =====");
  try {
    const balance = await musicContractInstance.viewBalance();
    console.log("===== Balance:", balance.toString());
    return balance;
  } catch (error) {
    console.error("Error during viewBalance:", error);
    throw error;
  }
}

async function createMusic(musicData) {
  console.log("===== Creating Music =====");
  const { title, artist, producer, metadata, duration } = musicData;

  const deployData = readDeployData();

  const musicContractFactory = new ethers.ContractFactory(
    deployData.musicContract.abi,
    deployData.musicContract.bytecode,
    wallet
  );

  const rightPurchaseValueInGwei = process.env.RIGHT_PURCHASE_VALUE_IN_GWEI;
  const valueForListeningInGwei = process.env.VALUE_FOR_LISTENING_IN_GWEI;

  let musicContract;
  try {
    musicContract = await musicContractFactory.deploy(
      oysterTokenInstance.target,
      oysterVaultInstance.target,
      rightPurchaseValueInGwei,
      valueForListeningInGwei
    );
  } catch (error) {
    console.error("Error deploying music contract:", error);
    throw error;
  }

  await musicContract.waitForDeployment();

  const musicContractAddress = await musicContract.getAddress();

  await validateMusicContract(musicContractAddress);

  const musicId = uuidv4();

  await musicContract.initializeMusic(
    title,
    artist,
    producer,
    metadata,
    duration,
    musicId
  );
  let connection;
  try {
    connection = await getConnection();
    await insertMusic(
      connection,
      musicContractAddress,
      title,
      artist,
      producer,
      metadata,
      duration,
      musicId
    );
  } catch (error) {
    console.error("Error inserting music into database:", error);
    throw error;
  } finally {
    if (connection) connection.release();
  }

  console.log("Music created and inserted into database:", musicId);

  return musicContractAddress;
}

async function getAccountBalance(address) {
  console.log(`===== Getting Account Balance for ${address} =====`);
  try {
    const balance = await provider.getBalance(address);
    console.log(
      `===== Balance for ${address}: ${ethers.formatEther(balance)} ETH =====`
    );
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
  getAccountBalance,
};