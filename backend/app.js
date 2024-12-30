const express = require('express');
const { initializeBlockchainService, validateMusicContract, buyTokens } = require('./services/blockchainService');
const { listenToEvents } = require('./services/eventListener');

require('dotenv').config();

const app = express();
const port = 3000;

app.use(express.json());

async function startApp() {
    try {
        await initializeBlockchainService();
        console.log("Blockchain service initialized.");

        listenToEvents();
        console.log("Event listener started.");

        // Validar Contrato da Música
        app.post('/validate-music-contract', async (req, res) => {
            const { addressMusicContract } = req.body;
            try {
                const transactionHash = await validateMusicContract(addressMusicContract);
                res.send(`Music contract validated! Transaction hash: ${transactionHash}`);
            } catch (error) {
                console.error(error);
                res.status(500).send(`Error validating music contract: ${error.message}`);
            }
        });

        app.post('/buy-tokens', async (req, res) => {
            const { amount } = req.body;
            try {
                const transactionHash = await buyTokens({ value: amount });
                res.send(`Tokens purchased! Transaction hash: ${transactionHash}`);
            } catch (error) {
                console.error(error);
                res.status(500).send(`Error purchasing tokens: ${error.message}`);
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