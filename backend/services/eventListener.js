require('dotenv').config();

const { Web3 } = require('web3');
const contractABI = require('../artifacts/contracts/MockMusicRegistry.sol/MockMusicRegistry.json').abi;

const contractAddress = process.env.CONTRACT_ADDRESS;
const web3 = new Web3(new Web3.providers.WebsocketProvider('ws://127.0.0.1:7545'));

async function listenToEvents() {
  console.log("Listening for events on Ganache...");

  try {
    const contract = new web3.eth.Contract(contractABI, contractAddress);
    console.log("Contract instance created:", contract.options.address);

    console.log("Contract ABI:", contractABI);
    console.log("Available Events:", contract.events);

    if (contract.events && contract.events.SongRegistered) {
      console.log("Entering listener configuration for SongRegistered");

      setTimeout(() => {
        contract.events.SongRegistered()
          .subscribe(function(error, result) {
            if (error) {
              console.error("Error in SongRegistered subscription:", error);
            } else {
              console.log("SongRegistered event:", result.returnValues);
            }
          });

        console.log("SongRegistered event listener subscribed (after delay).");
      }, 1000);
    } else {
      console.error("SongRegistered event is not defined in the contract ABI.");
    }

    if (contract.events && contract.events.LicenseGranted) {
        console.log("Entering listener configuration for LicenseGranted");

        setTimeout(() => {
          contract.events.LicenseGranted()
            .subscribe(function(error, result) {
              if (error) {
                console.error("Error in LicenseGranted subscription:", error);
              } else {
                console.log("LicenseGranted event:", result.returnValues);
              }
            });

          console.log("LicenseGranted event listener subscribed (after delay).");
        }, 1000);
      } else {
        console.error("LicenseGranted event is not defined in the contract ABI.");
      }
  } catch (error) {
    console.error("Error subscribing to events:", error);
  }
}

module.exports = { listenToEvents };