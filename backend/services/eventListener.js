require('dotenv').config();
const { Web3 } = require('web3');
const { connectToDatabase } = require('./db');

const web3 = new Web3(
  new Web3.providers.WebsocketProvider(process.env.WS_PROVIDER_URL)
);

const oysterTokenContract = require('../artifacts/contracts/OysterToken.sol/OysterToken.json');
const oysterVaultContract = require('../artifacts/contracts/OysterVault.sol/OysterVault.json');

async function listenToEvents(connection) {
  console.log('Listening for events on Ganache...');
  const networkId = await web3.eth.net.getId();

  const deployedOysterTokenAddress =
    oysterTokenContract.networks[networkId].address;
  const deployedOysterVaultAddress =
    oysterVaultContract.networks[networkId].address;

  const oysterTokenInstance = new web3.eth.Contract(
    oysterTokenContract.abi,
    deployedOysterTokenAddress
  );

  try {
    // Listener para o evento ValidatedMusicContract
    oysterTokenInstance.events.validatedMusicContract(
      { fromBlock: 'latest' },
      async (error, event) => {
        if (error) {
          console.error('Error in validatedMusicContract event:', error);
        } else {
          console.log('validatedMusicContract event:', event.returnValues);
          try {
            const [results, fields] = await connection.execute(
              'INSERT INTO valid_music_contracts (contractAddress, valid) VALUES (?, ?)',
              [event.returnValues._address, event.returnValues.valid]
            );
            console.log('validatedMusicContract event data saved to database');
          } catch (dbError) {
            console.error(
              'Error saving validatedMusicContract event data:',
              dbError
            );
          }
        }
      }
    );

    // Listener para o evento WeiRefunded
    oysterTokenInstance.events.WeiRefunded(
      { fromBlock: 'latest' },
      async (error, event) => {
        if (error) {
          console.error('Error in WeiRefunded event:', error);
        } else {
          console.log('WeiRefunded event:', event.returnValues);
          try {
            const [results, fields] = await connection.execute(
              'INSERT INTO refunds (to_address, gweiAmount) VALUES (?, ?)',
              [event.returnValues.to, event.returnValues.gweiAmount]
            );
            console.log('WeiRefunded event data saved to database');
          } catch (dbError) {
            console.error('Error saving WeiRefunded event data:', dbError);
          }
        }
      }
    );
  } catch (error) {
    console.error(
      'Error connecting to database or listening to events:',
      error
    );
  }
}

module.exports = { listenToEvents };