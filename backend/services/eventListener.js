const { ethers } = require("ethers");
const { getConnection, insertMusic } = require("./dbService");
const fs = require("fs");
require("dotenv").config();

const provider = new ethers.JsonRpcProvider(process.env.HARDHAT_PROVIDER_URL);

async function listenToEvents() {
  if (!fs.existsSync("deploy-data.json")) {
    throw new Error(
      "deploy-data.json file not found. Please run the deployment script before starting the backend."
    );
  }

  let deployData;
  try {
    deployData = JSON.parse(fs.readFileSync("deploy-data.json", "utf8"));
  } catch (error) {
    throw new Error(
      "Error reading deploy-data.json. Please ensure the file is a valid JSON."
    );
  }

  const oysterTokenAddress = deployData.oysterToken.address;
  const oysterTokenABI = deployData.oysterToken.abi;
  const musicContractAddress = deployData.musicContract.address;
  const musicContractABI = deployData.musicContract.abi;

  const oysterTokenInstance = new ethers.Contract(
    oysterTokenAddress,
    oysterTokenABI,
    provider
  );

  const musicContractInstance = new ethers.Contract(
    musicContractAddress,
    musicContractABI,
    provider
  );

  oysterTokenInstance.on(
    "validatedMusicContract",
    async (address, valid, event) => {
      console.log(
        `Event: validatedMusicContract - Address: ${address}, Valid: ${valid}`
      );
      console.log("Checking if validatedMusicContract already exists...");

      let db;
      try {
        db = await getConnection();
        const [rows] = await db.execute(
          "SELECT * FROM validated_music_contracts WHERE contractAddress = ?",
          [address]
        );
        const existingContract = rows[0];

        if (existingContract) {
          console.log(
            "validatedMusicContract already exists. Skipping insertion."
          );
        } else {
          console.log("Inserting validatedMusicContract into the database...");
          await db.execute(
            "INSERT INTO validated_music_contracts (contractAddress, valid, transactionHash) VALUES (?, ?, ?)",
            [address, valid, event.log.transactionHash]
          );
          console.log("validatedMusicContract inserted into the database!");
        }
      } catch (error) {
        console.error("Error handling validatedMusicContract event:", error);
      } finally {
        if (db) db.release();
      }
    }
  );

  musicContractInstance.on(
    "assignedRight",
    async (addressRight, addressThisMusicContract, percentageOfRights, event) => {
      console.log(
        `Event: assignedRight - Address: ${addressRight}, Contract: ${addressThisMusicContract}, Percentage: ${percentageOfRights}`
      );
      let db;
      try {
        db = await getConnection();
        await db.execute(
          "INSERT INTO assigned_rights (addressRight, addressThisMusicContract, percentageOfRights, transactionHash) VALUES (?, ?, ?, ?)",
          [
            addressRight,
            addressThisMusicContract,
            percentageOfRights,
            event.log.transactionHash,
          ]
        );
        console.log("assignedRight event data inserted into database!");
      } catch (error) {
        console.error(
          "Error inserting assignedRight event data into database:",
          error
        );
      } finally {
        if (db) db.release();
      }
    }
  );

  musicContractInstance.on(
    "withdrawalRight",
    async (addressRight, addressThisMusicContract, percentageOfRights, event) => {
      console.log(
        `Event: withdrawalRight - Address: ${addressRight}, Contract: ${addressThisMusicContract}, Percentage: ${percentageOfRights}`
      );
      let db;
      try {
        db = await getConnection();
        await db.execute(
          "INSERT INTO withdrawal_rights (addressRight, addressThisMusicContract, percentageOfRights, transactionHash) VALUES (?, ?, ?, ?)",
          [
            addressRight,
            addressThisMusicContract,
            percentageOfRights,
            event.log.transactionHash,
          ]
        );
        console.log("withdrawalRight event data inserted into database!");
      } catch (error) {
        console.error(
          "Error inserting withdrawalRight event data into database:",
          error
        );
      } finally {
        if (db) db.release();
      }
    }
  );

  musicContractInstance.on(
    "musicWithSealedRights",
    async (addressThisMusicContract, musicContactIsSealed, event) => {
      console.log(
        `Event: musicWithSealedRights - Contract: ${addressThisMusicContract}, Sealed: ${musicContactIsSealed}`
      );
      let db;
      try {
        db = await getConnection();
        await db.execute(
          "INSERT INTO music_with_sealed_rights (addressThisMusicContract, musicContactIsSealed, transactionHash) VALUES (?, ?, ?)",
          [addressThisMusicContract, musicContactIsSealed, event.log.transactionHash]
        );
        console.log("musicWithSealedRights event data inserted into database!");
      } catch (error) {
        console.error(
          "Error inserting musicWithSealedRights event data into database:",
          error
        );
      } finally {
        if (db) db.release();
      }
    }
  );

  musicContractInstance.on(
    "tokenAssigned",
    async (addressHolderToken, amountToken, event) => {
      console.log(
        `Event: tokenAssigned - Address: ${addressHolderToken}, Amount: ${amountToken}`
      );
      let db;
      try {
        db = await getConnection();
        await db.execute(
          "INSERT INTO token_assigned (addressHolderToken, amountToken, transactionHash) VALUES (?, ?, ?)",
          [addressHolderToken, amountToken, event.log.transactionHash]
        );
        console.log("tokenAssigned event data inserted into database!");
      } catch (error) {
        console.error(
          "Error inserting tokenAssigned event data into database:",
          error
        );
      } finally {
        if (db) db.release();
      }
    }
  );

  musicContractInstance.on(
    "purchaseMade",
    async (purchaseAddress, activated, event) => {
      console.log(
        `Event: purchaseMade - Address: ${purchaseAddress}, Activated: ${activated}`
      );
      let db;
      try {
        db = await getConnection();
        await db.execute(
          "INSERT INTO purchase_made (purchaseAddress, activated, transactionHash) VALUES (?, ?, ?)",
          [purchaseAddress, activated, event.log.transactionHash]
        );
        console.log("purchaseMade event data inserted into database!");
      } catch (error) {
        console.error(
          "Error inserting purchaseMade event data into database:",
          error
        );
      } finally {
        if (db) db.release();
      }
    }
  );

  musicContractInstance.on("musicHeard", async (hearAddress, confirm, event) => {
    console.log(`Event: musicHeard - Address: ${hearAddress}, Confirm: ${confirm}`);
    let db;
    try {
      db = await getConnection();
      await db.execute(
        "INSERT INTO music_heard (hearAddress, confirm, transactionHash) VALUES (?, ?, ?)",
        [hearAddress, confirm, event.log.transactionHash]
      );
      console.log("musicHeard event data inserted into database!");
    } catch (error) {
      console.error("Error inserting musicHeard event data into database:", error);
    } finally {
      if (db) db.release();
    }
  });

  oysterTokenInstance.on("WeiRefunded", async (to, weiAmount, event) => {
    console.log(`Event: WeiRefunded - To: ${to}, Amount: ${weiAmount}`);
    let db;
    try {
      db = await getConnection();
      await db.execute(
        "INSERT INTO WeiRefunded (toAddress, weiAmount, transactionHash) VALUES (?, ?, ?)",
        [to, weiAmount, event.log.transactionHash]
      );
      console.log("WeiRefunded event data inserted into database!");
    } catch (error) {
      console.error("Error inserting WeiRefunded event data into database:", error);
    } finally {
      if (db) db.release();
    }
  });

  oysterTokenInstance.on("transferViaTokenSale", async (to, weiAmount, event) => {
    console.log(`Event: transferViaTokenSale - To: ${to}, Amount: ${weiAmount}`);
    let db;
    try {
      db = await getConnection();
      await db.execute(
        "INSERT INTO transferViaTokenSale (toAddress, weiAmount, transactionHash) VALUES (?, ?, ?)",
        [to, weiAmount, event.log.transactionHash]
      );
      console.log("transferViaTokenSale event data inserted into database!");
    } catch (error) {
      console.error(
        "Error inserting transferViaTokenSale event data into database:",
        error
      );
    } finally {
      if (db) db.release();
    }
  });

  musicContractInstance.on(
    "MusicCreated",
    async (musicContractAddress, title, artist, producer, metadata, duration, musicId, event) => {
      console.log(
        "Event: MusicCreated - Contract:",
        musicContractAddress,
        "Title:",
        title,
        "Artist:",
        artist,
        "Producer:",
        producer,
        "Metadata:",
        metadata,
        "Duration:",
        duration,
        "MusicId:",
        musicId
      );
      let db;
      try {
        db = await getConnection();
        await insertMusic(
          db,
          musicContractAddress,
          title,
          artist,
          producer,
          metadata,
          duration,
          musicId
        );
        console.log("MusicCreated event data inserted into database!");
      } catch (error) {
        console.error(
          "Error inserting MusicCreated event data into database:",
          error
        );
      } finally {
        if (db) db.release();
      }
    }
  );

  console.log("Listening for events...");
}

module.exports = { listenToEvents };