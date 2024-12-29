const express = require('express');
const { initializeBlockchainService, registerSong, grantLicense } = require('./services/blockchainService');
const { listenToEvents } = require('./services/eventListener');
const contractABI = require('./artifacts/contracts/MockMusicRegistry.sol/MockMusicRegistry.json').abi;

require('dotenv').config();
const contractAddress = process.env.CONTRACT_ADDRESS;

const app = express();
const port = 3000;

app.use(express.json());

async function startApp() {
    try {
        await initializeBlockchainService(contractABI, contractAddress);
        console.log("Blockchain service initialized.");

        await listenToEvents();
        console.log("Event listener started.");

        app.post('/register-song', async (req, res) => {
            const { songId, metadataURI } = req.body;
            try {
                const transactionHash = await registerSong(songId, metadataURI);
                res.send(`Song registered! Transaction hash: ${transactionHash}`);
            } catch (error) {
                console.error(error);
                res.status(500).send(`Error registering song: ${error.message}`);
            }
        });

        app.post('/grant-license', async (req, res) => {
            const { songId, licenseId } = req.body;
            try {
                const transactionHash = await grantLicense(songId, licenseId);
                res.send(`License granted! Transaction hash: ${transactionHash}`);
            } catch (error) {
                console.error(error);
                res.status(500).send(`Error granting license: ${error.message}`);
            }
        });

        app.listen(port, () => {
            console.log(`Mermaid backend listening at http://localhost:${port}`);
        });

    } catch (error) {
        console.error("Failed to initialize blockchain service or start event listener:", error);
        process.exit(1);
    }
}

startApp();