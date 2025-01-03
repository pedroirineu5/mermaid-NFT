const { ethers } = require('ethers');
const { connectToDatabase } = require('./db');
const fs = require('fs');

const provider = new ethers.JsonRpcProvider('http://127.0.0.1:7545');

async function listenToEvents() {
  try {
    const deployData = JSON.parse(fs.readFileSync('deploy-data.json', 'utf8'));
    const oysterTokenAddress = deployData.oysterToken.address;
    const oysterTokenABI = deployData.oysterToken.abi;
    const oysterVaultAddress = deployData.oysterVault.address;
    const oysterVaultABI = deployData.oysterVault.abi;
    const musicContractAddress = deployData.musicContract.address;
    const musicContractABI = deployData.musicContract.abi;

    const oysterTokenInstance = new ethers.Contract(
      oysterTokenAddress,
      oysterTokenABI,
      provider
    );
    const oysterVaultInstance = new ethers.Contract(
      oysterVaultAddress,
      oysterVaultABI,
      provider
    );
    const musicContractInstance = new ethers.Contract(
      musicContractAddress,
      musicContractABI,
      provider
    );

    const connection = await connectToDatabase();
    console.log('Database connection established successfully!');

    // Listener para validatedMusicContract (OysterToken)
    oysterTokenInstance.on(
      'validatedMusicContract',
      async (address, valid, event) => {
        console.log(
          `Event: validatedMusicContract - Address: ${address}, Valid: ${valid}`
        );
        const transactionHash = event.log.transactionHash;

        try {
          console.log('Executing SQL query for validatedMusicContract...');
          const [results] = await connection.execute(
            'INSERT INTO validated_music_contracts (contractAddress, valid, transactionHash) VALUES (?, ?, ?)',
            [address, valid, transactionHash]
          );
          console.log(
            'validatedMusicContract event data inserted into database!',
            results
          );
        } catch (dbError) {
          console.error(
            'Error inserting validatedMusicContract event data:',
            dbError
          );
        }
      }
    );

    // Listener para WeiRefunded (OysterToken) - Movido para cá!
    oysterTokenInstance.on('WeiRefunded', async (to, weiAmount, event) => {
      console.log(`Event: WeiRefunded - To: ${to}, Amount: ${weiAmount}`);
      const transactionHash = event.log.transactionHash;

      try {
        const [results] = await connection.execute(
          'INSERT INTO refunds (to_address, gweiAmount, transactionHash) VALUES (?, ?, ?)',
          [to, weiAmount.toString(), transactionHash] // Convertendo BigInt para String
        );
        console.log('WeiRefunded event data inserted into database!');
      } catch (dbError) {
        console.error('Error inserting WeiRefunded event data:', dbError);
      }
    });

    // Listener para assignedRight (MusicContract)
    musicContractInstance.on(
      'assignedRight',
      async (addressRight, addressThisMusicContract, percentageOfRights, event) => {
        console.log(`Event: assignedRight - Address: ${addressRight}, Music Contract: ${addressThisMusicContract}, Percentage: ${percentageOfRights}`);
        const transactionHash = event.log.transactionHash;

        try {
          const [results] = await connection.execute(
            'INSERT INTO music_rights_assignments (addressRight, addressThisMusicContract, percentageOfRights, transactionHash) VALUES (?, ?, ?, ?)',
            [addressRight, addressThisMusicContract, percentageOfRights, transactionHash]
          );
          console.log('assignedRight event data inserted into database!');
        } catch (dbError) {
          console.error('Error inserting assignedRight event data:', dbError);
        }
      }
    );

    // Listener para withdrawalRight (MusicContract)
    musicContractInstance.on(
      'withdrawalRight',
      async (addressRight, addressThisMusicContract, percentageOfRights, event) => {
        console.log(`Event: withdrawalRight - Address: ${addressRight}, Music Contract: ${addressThisMusicContract}, Percentage: ${percentageOfRights}`);
        const transactionHash = event.log.transactionHash;

        try {
          const [results] = await connection.execute(
            'INSERT INTO music_rights_withdrawals (addressRight, addressThisMusicContract, percentageOfRights, transactionHash) VALUES (?, ?, ?, ?)',
            [addressRight, addressThisMusicContract, percentageOfRights, transactionHash]
          );
          console.log('withdrawalRight event data inserted into database!');
        } catch (dbError) {
          console.error('Error inserting withdrawalRight event data:', dbError);
        }
      }
    );

    // Listener para musicWithSealedRights (MusicContract)
    musicContractInstance.on(
      'musicWithSealedRights',
      async (addressThisMusicContract, musicContactIsSealed, event) => {
        console.log(`Event: musicWithSealedRights - Music Contract: ${addressThisMusicContract}, Sealed: ${musicContactIsSealed}`);
        const transactionHash = event.log.transactionHash;
        try {
          const [results] = await connection.execute(
            'INSERT INTO music_rights_sealed (addressThisMusicContract, musicContactIsSealed, transactionHash) VALUES (?, ?, ?)',
            [addressThisMusicContract, musicContactIsSealed, transactionHash]
          );
          console.log('musicWithSealedRights event data inserted into database!');
        } catch (dbError) {
          console.error('Error inserting musicWithSealedRights event data:', dbError);
        }
      }
    );

    // Listener para tokenAssigned (MusicContract)
    musicContractInstance.on('tokenAssigned', async (addressHolderToken, amountToken, event) => {
      console.log(`Event: tokenAssigned - Address: ${addressHolderToken}, Amount: ${amountToken}`);
      const transactionHash = event.log.transactionHash;

      try {
        const [results] = await connection.execute(
          'INSERT INTO token_assignments (addressHolderToken, amountToken, transactionHash) VALUES (?, ?, ?)',
          [addressHolderToken, amountToken.toString(), transactionHash] // Convertendo BigInt para String
        );
        console.log('tokenAssigned event data inserted into database!');
      } catch (dbError) {
        console.error('Error inserting tokenAssigned event data:', dbError);
      }
    });

    // Listener para purchaseMade (MusicContract)
    musicContractInstance.on('purchaseMade', async (purchaseAddress, activated, event) => {
      console.log(`Event: purchaseMade - Address: ${purchaseAddress}, Activated: ${activated}`);
      const transactionHash = event.log.transactionHash;

      try {
        const [results] = await connection.execute(
          'INSERT INTO purchases (purchaseAddress, activated, transactionHash) VALUES (?, ?, ?)',
          [purchaseAddress, activated, transactionHash]
        );
        console.log('purchaseMade event data inserted into database!');
      } catch (dbError) {
        console.error('Error inserting purchaseMade event data:', dbError);
      }
    });

    // Listener para musicHeard (MusicContract)
    musicContractInstance.on('musicHeard', async (hearAddress, confirm, event) => {
      console.log(`Event: musicHeard - Address: ${hearAddress}, Confirm: ${confirm}`);
      const transactionHash = event.log.transactionHash;

      try {
        const [results] = await connection.execute(
          'INSERT INTO music_listens (hearAddress, confirm, transactionHash) VALUES (?, ?, ?)',
          [hearAddress, confirm, transactionHash]
        );
        console.log('musicHeard event data inserted into database!');
      } catch (dbError) {
        console.error('Error inserting musicHeard event data:', dbError);
      }
    });

    // Listener para transferViaTokenSale (OysterToken)
    oysterTokenInstance.on('transferViaTokenSale', async (to, weiAmount, event) => {
      console.log(`Event: transferViaTokenSale - To: ${to}, Amount: ${weiAmount}`);
      const transactionHash = event.log.transactionHash;

      try {
        const [results] = await connection.execute(
          'INSERT INTO token_sales (to_address, weiAmount, transactionHash) VALUES (?, ?, ?)',
          [to, weiAmount.toString(), transactionHash] // Convertendo BigInt para String
        );
        console.log('transferViaTokenSale event data inserted into database!');
      } catch (dbError) {
        console.error('Error inserting transferViaTokenSale event data:', dbError);
      }
    });

    console.log('Listening for events on Ganache...');
  } catch (error) {
    console.error('Error setting up event listeners:', error);
  }
}

module.exports = { listenToEvents };