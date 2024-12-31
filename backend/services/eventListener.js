const { ethers } = require('ethers');
const { connectToDatabase } = require('./db');
const fs = require('fs');

const provider = new ethers.JsonRpcProvider('http://127.0.0.1:7545');

async function listenToEvents() {
  try {
    const deployData = JSON.parse(fs.readFileSync('deploy-data.json', 'utf8'));
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

    const connection = await connectToDatabase();
    console.log('Database connection established successfully!'); // Adicionado log

    oysterTokenInstance.on(
      'ValidatedMusicContract', // Corrigido para ValidatedMusicContract (inicial maiúscula)
      async (address, valid, event) => {
        console.log(
          `Event: ValidatedMusicContract - Address: ${address}, Valid: ${valid}`
        );
        const transactionHash = event.log.transactionHash;

        try {
          console.log('Executing SQL query for ValidatedMusicContract...'); // Adicionado log
          const [results] = await connection.execute(
            'INSERT INTO valid_music_contracts (contractAddress, valid, transactionHash) VALUES (?, ?, ?)',
            [address, valid, transactionHash]
          );
          console.log(
            'ValidatedMusicContract event data inserted into database!',
            results
          );
        } catch (dbError) {
          console.error(
            'Error inserting ValidatedMusicContract event data:',
            dbError
          );
        }
      }
    );

    oysterTokenInstance.on(
      'WeiRefunded',
      async (to, gweiAmount, event) => {
        console.log(`Event: WeiRefunded - To: ${to}, Amount: ${gweiAmount}`);
        const transactionHash = event.log.transactionHash;

        try {
          const [results] = await connection.execute(
            'INSERT INTO refunds (to_address, gweiAmount, transactionHash) VALUES (?, ?, ?)',
            [to, gweiAmount, transactionHash]
          );
          console.log('WeiRefunded event data inserted into database!');
        } catch (dbError) {
          console.error('Error inserting WeiRefunded event data:', dbError);
        }
      }
    );

    musicContractInstance.on(
      'BuyTokensCalled',
      async (caller, amount, balance, event) => {
        console.log(
          `Event: BuyTokensCalled - Caller: ${caller}, Amount: ${amount}, Balance: ${balance}`
        );
        const transactionHash = event.log.transactionHash;

        try {
          console.log('Executing SQL query for BuyTokensCalled...'); // Adicionado log
          const [results] = await connection.execute(
            'INSERT INTO token_purchases (buyer_address, amount_wei, amount_tokens, transactionHash) VALUES (?, ?, ?, ?)',
            [caller, amount, 100, transactionHash] // Assumindo a compra de 100 tokens
          );
          console.log('BuyTokensCalled event data inserted into database!');
        } catch (dbError) {
          console.error(
            'Error inserting BuyTokensCalled event data:',
            dbError
          );
        }
      }
    );

    console.log('Listening for events on Ganache...');
  } catch (error) {
    console.error('Error setting up event listeners:', error);
  }
}

module.exports = { listenToEvents };