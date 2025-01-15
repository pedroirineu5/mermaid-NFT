const express = require('express');
const cors = require('cors');
const blockchainService = require('./services/blockchainService');
const { listenToEvents } = require('./services/eventListener');
const { createDatabaseIfNotExists } = require('./services/db');
const { ethers } = require('ethers');

require('dotenv').config();

const app = express();
const port = 3000;

app.use(express.json());

const corsOptions = {
    origin: "http://localhost:5173",
    optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// Códigos de escape ANSI para cores (igual ao blockchainService.js)
const colors = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    dim: "\x1b[2m",
    underscore: "\x1b[4m",
    blink: "\x1b[5m",
    reverse: "\x1b[7m",
    hidden: "\x1b[8m",

    fg: {
        black: "\x1b[30m",
        red: "\x1b[31m",
        green: "\x1b[32m",
        yellow: "\x1b[33m",
        blue: "\x1b[34m",
        magenta: "\x1b[35m",
        cyan: "\x1b[36m",
        white: "\x1b[37m",
        crimson: "\x1b[38m"
    },
    bg: {
        black: "\x1b[40m",
        red: "\x1b[41m",
        green: "\x1b[42m",
        yellow: "\x1b[43m",
        blue: "\x1b[44m",
        magenta: "\x1b[45m",
        cyan: "\x1b[46m",
        white: "\x1b[47m",
        crimson: "\x1b[48m"
    }
};

async function startApp() {
    try {
        await createDatabaseIfNotExists();
        await blockchainService.initializeBlockchainService();
        console.log(colors.fg.green + colors.bright + 'Blockchain service ready.' + colors.reset);

        listenToEvents();

        app.post('/assign-rights', async (req, res) => {
            const { addressRight, percentageOfRights } = req.body;

            if (!ethers.isAddress(addressRight)) {
                return res.status(400).send({ error: 'Invalid address format.' });
            }

            if (typeof percentageOfRights !== 'number' || percentageOfRights <= 0 || percentageOfRights > 100) {
                return res.status(400).send({ error: 'Invalid percentage of rights. Must be a number between 1 and 100.' });
            }

            try {
                const isSealed = await blockchainService.isMusicContractSealed();
                if (isSealed) {
                    return res.status(400).send({ error: 'Music contract is already sealed.' });
                }

                const transactionHash = await blockchainService.assignRights(addressRight, percentageOfRights);
                res.status(200).send({ message: 'Music rights assigned!', transactionHash });
            } catch (error) {
                console.error(colors.fg.red + 'Error assigning music rights:' + colors.reset, error);
                res.status(500).send({ error: `Failed to assign music rights: ${error.message}` });
            }
        });

        app.post('/withdraw-rights', async (req, res) => {
            const { addressRight, percentageOfRights } = req.body;

            if (!ethers.isAddress(addressRight)) {
                return res.status(400).send({ error: 'Invalid address format.' });
            }

            if (typeof percentageOfRights !== 'number' || percentageOfRights <= 0 || percentageOfRights > 100) {
                return res.status(400).send({ error: 'Invalid percentage of rights. Must be a number between 1 and 100.' });
            }

            try {
                const isSealed = await blockchainService.isMusicContractSealed();
                if (isSealed) {
                    return res.status(400).send({ error: 'Music contract is already sealed.' });
                }

                const transactionHash = await blockchainService.withdrawRights(addressRight, percentageOfRights);
                res.status(200).send({ message: 'Music rights withdrawn!', transactionHash });
            } catch (error) {
                console.error(colors.fg.red + 'Error withdrawing music rights:' + colors.reset, error);
                res.status(500).send({ error: `Failed to withdraw music rights: ${error.message}` });
            }
        });

        app.post('/seal-music-contract', async (req, res) => {
            try {
                const isSealed = await blockchainService.isMusicContractSealed();
                if (isSealed) {
                    return res.status(400).send({ error: 'Music contract is already sealed.' });
                }

                const transactionHash = await blockchainService.sealMusicContract();
                res.status(200).send({ message: 'Music contract sealed successfully!', transactionHash });
            } catch (error) {
                console.error(colors.fg.red + 'Error sealing music contract:' + colors.reset, error);
                res.status(500).send({ error: `Failed to seal music contract: ${error.message}` });
            }
        });

        app.post('/buy-oyster-token', async (req, res) => {
            try {
                const isSealed = await blockchainService.isMusicContractSealed();
                if (!isSealed) {
                    return res.status(400).send({ error: 'Music contract must be sealed before buying tokens.' });
                }

                const transactionHash = await blockchainService.buy100OysterToken();
                res.status(200).send({ message: '100 OysterTokens purchased!', transactionHash });
            } catch (error) {
                console.error(colors.fg.red + 'Error purchasing tokens:' + colors.reset, error);
                res.status(500).send({ error: `Failed to purchase tokens: ${error.message}` });
            }
        });

        app.post('/sell-oyster-token', async (req, res) => {
            const { amount } = req.body;

            if (typeof amount !== 'number' || amount <= 0) {
                return res.status(400).send({ error: 'Invalid amount. Must be a positive number.' });
            }

            try {
                const isSealed = await blockchainService.isMusicContractSealed();
                if (!isSealed) {
                    return res.status(400).send({ error: 'Music contract must be sealed before selling tokens.' });
                }

                const transactionHash = await blockchainService.sellOysterToken(amount);
                res.status(200).send({ message: `${amount} OysterTokens sold!`, transactionHash });
            } catch (error) {
                console.error(colors.fg.red + 'Error selling tokens:' + colors.reset, error);
                res.status(500).send({ error: `Failed to sell tokens: ${error.message}` });
            }
        });

        app.post('/buy-rights-music', async (req, res) => {
            try {
                const isSealed = await blockchainService.isMusicContractSealed();
                if (!isSealed) {
                    return res.status(400).send({ error: 'Music contract must be sealed before buying music rights.' });
                }

                const transactionHash = await blockchainService.buyRightsMusic();
                res.status(200).send({ message: 'Music rights purchased!', transactionHash });
            } catch (error) {
                console.error(colors.fg.red + 'Error purchasing music rights:' + colors.reset, error);
                res.status(500).send({ error: `Failed to purchase music rights: ${error.message}` });
            }
        });

        app.post('/listen-music', async (req, res) => {
            try {
                const isSealed = await blockchainService.isMusicContractSealed();
                if (!isSealed) {
                    return res.status(400).send({ error: 'Music contract must be sealed before listening to the music.' });
                }

                const transactionHash = await blockchainService.listenMusic();
                res.status(200).send({ message: 'Music listened to!', transactionHash });
            } catch (error) {
                console.error(colors.fg.red + 'Error listening to music:' + colors.reset, error);
                res.status(500).send({ error: `Failed to listen to music: ${error.message}` });
            }
        });

        app.get('/remaining-rights', async (req, res) => {
            try {
                const remainingRights = await blockchainService.getRemainingRightsDivision();
                res.json({ remainingRights: remainingRights.toString() });
            } catch (error) {
                console.error(colors.fg.red + 'Error fetching remaining rights:' + colors.reset, error);
                res.status(500).send({ error: `Failed to fetch remaining rights: ${error.message}` });
            }
        });

        app.get('/tokens/:address', async (req, res) => {
            const { address } = req.params;

            if (!ethers.isAddress(address)) {
                return res.status(400).send({ error: 'Invalid address format.' });
            }

            try {
                const tokens = await blockchainService.getTokensPerAddress(address);
                res.json({ tokens: tokens.toString() });
            } catch (error) {
                console.error(colors.fg.red + 'Error fetching tokens:' + colors.reset, error);
                res.status(500).send({ error: `Failed to fetch tokens: ${error.message}` });
            }
        });

        app.get('/is-sealed', async (req, res) => {
            try {
                const isSealed = await blockchainService.isMusicContractSealed();
                res.json({ isSealed });
            } catch (error) {
                console.error(colors.fg.red + 'Error checking if contract is sealed:' + colors.reset, error);
                res.status(500).send({ error: `Failed to check if contract is sealed: ${error.message}` });
            }
        });

        app.listen(port, () => {
            console.log(colors.fg.yellow + `Mermaid backend listening at http://localhost:${port}` + colors.reset);
        });
    } catch (error) {
        console.error(colors.fg.red + 'Failed to initialize blockchain service or start event listener:' + colors.reset, error);
        process.exit(1);
    }
}

startApp();