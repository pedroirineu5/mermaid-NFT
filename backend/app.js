const express = require('express');
const cors = require('cors');
const blockchainService = require('./services/blockchainService');
const { listenToEvents } = require('./services/eventListener');

require('dotenv').config();

const app = express();
const port = 3000;

app.use(express.json());

const corsOptions = {
  origin: "http://localhost:5173",
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

async function startApp() {
    try {
        await blockchainService.initializeBlockchainService();
        console.log('Blockchain service initialized.');

        listenToEvents();

        app.post('/validate-music-contract', async (req, res) => {
            const { addressMusicContract } = req.body;
            try {
                const isValid = await blockchainService.validateMusicContract(
                    addressMusicContract
                );
                if (isValid) {
                    res.send({
                        message: 'Music contract validated!',
                        musicContractAddress: addressMusicContract,
                    });
                } else {
                    res.status(400).send({
                        error: 'Music contract validation failed.',
                        musicContractAddress: addressMusicContract,
                    });
                }
            } catch (error) {
                console.error(error);
                res.status(500).send(`Error validating music contract: ${error.message}`);
            }
        });

        app.post('/assign-rights', async (req, res) => {
            const { addressRight, percentageOfRights } = req.body;
            try {
                const isSealed = await blockchainService.isMusicContractSealed();

                if (isSealed) {
                    return res.status(400).send({
                        error: `Music contract already sealed`
                    });
                }
                const transactionHash = await blockchainService.assignRights(addressRight, percentageOfRights);
                res.send(`Music rights assigned! Transaction hash: ${transactionHash}`);
            } catch (error) {
                console.error(error);
                res.status(500).send(`Error assigning music rights: ${error.message}`);
            }
        });

        app.post('/withdraw-rights', async (req, res) => {
            const { addressRight, percentageOfRights } = req.body;
            try {
                const isSealed = await blockchainService.isMusicContractSealed();

                if (isSealed) {
                    return res.status(400).send({
                        error: `Music contract already sealed`
                    });
                }

                const transactionHash = await blockchainService.withdrawRights(addressRight, percentageOfRights);
                res.send(`Music rights withdraw! Transaction hash: ${transactionHash}`);
            } catch (error) {
                console.error(error);
                res.status(500).send(`Error withdraw music rights: ${error.message}`);
            }
        });

        app.post('/seal-music-contract', async (req, res) => {
            try {
                const isSealed = await blockchainService.isMusicContractSealed();

                if (isSealed) {
                    return res.status(400).send({
                        error: `Music contract already sealed`
                    });
                }

                const transactionHash = await blockchainService.sealMusicContract();
                res.status(200).send({ message: 'Music contract sealed successfully!', transactionHash });
            } catch (error) {
                console.error('Error sealing music contract:', error);
                res.status(500).send({ error: `Failed to seal music contract: ${error.message}` });
            }
        });

        app.post('/buy-oyster-token', async (req, res) => {
            try {
                const isSealed = await blockchainService.isMusicContractSealed();

                if (!isSealed) {
                    return res.status(400).send({
                        error: `Music contract is not sealed`
                    });
                }

                const transactionHash = await blockchainService.buy100OysterToken();
                res.send(
                    `100 OysterTokens purchased! Transaction hash: ${transactionHash}`
                );
            } catch (error) {
                console.error(error);
                res.status(500).send(`Error purchasing tokens: ${error.message}`);
            }
        });

        app.post('/sell-oyster-token', async (req, res) => {
            const { amount } = req.body;
            try {
                const isSealed = await blockchainService.isMusicContractSealed();

                if (!isSealed) {
                    return res.status(400).send({
                        error: `Music contract is not sealed`
                    });
                }

                const transactionHash = await blockchainService.sellOysterToken(
                    amount
                );
                res.send(
                    `${amount} OysterTokens sold! Transaction hash: ${transactionHash}`
                );
            } catch (error) {
                console.error(error);
                res.status(500).send(`Error selling tokens: ${error.message}`);
            }
        });

        app.post('/buy-rights-music', async (req, res) => {
            try {
                const isSealed = await blockchainService.isMusicContractSealed();

                if (!isSealed) {
                    return res.status(400).send({
                        error: `Music contract is not sealed`
                    });
                }

                const transactionHash = await blockchainService.buyRightsMusic();
                res.send(
                    `Music rights purchased! Transaction hash: ${transactionHash}`
                );
            } catch (error) {
                console.error(error);
                res.status(500).send(`Error purchasing music rights: ${error.message}`);
            }
        });

        app.post('/listen-music', async (req, res) => {
            try {
                const isSealed = await blockchainService.isMusicContractSealed();

                if (!isSealed) {
                    return res.status(400).send({
                        error: `Music contract is not sealed`
                    });
                }

                const transactionHash = await blockchainService.listenMusic();
                res.send(
                    `Music listened! Transaction hash: ${transactionHash}`
                );
            } catch (error) {
                console.error(error);
                res.status(500).send(`Error listening music: ${error.message}`);
            }
        });

        app.get('/remaining-rights', async (req, res) => {
            try {
                const remainingRights = await blockchainService.getRemainingRightsDivision();
                res.json({ remainingRights: remainingRights.toString() });
            } catch (error) {
                console.error(error);
                res.status(500).send(`Error fetching remaining rights: ${error.message}`);
            }
        });

        app.get('/tokens/:address', async (req, res) => {
            const { address } = req.params;
            try {
                const tokens = await blockchainService.getTokensPerAddress(address);
                res.json({ tokens: tokens.toString() });
            } catch (error) {
                console.error(error);
                res.status(500).send(`Error fetching tokens per address: ${error.message}`);
            }
        });

        app.get('/is-sealed', async (req, res) => {
            try {
                const isSealed = await blockchainService.isMusicContractSealed();
                res.json({ isSealed });
            } catch (error) {
                console.error(error);
                res.status(500).send(`Error checking if contract is sealed: ${error.message}`);
            }
        });

        app.get('/view-balance', async (req, res) => {
            try {
                const balance = await blockchainService.viewBalance();
                res.json({ balance: balance.toString() });
            } catch (error) {
                console.error(error);
                res.status(500).send(`Error checking balance: ${error.message}`);
            }
        });

        app.get('/musics', async (req, res) => {
            try {
                const musics = await blockchainService.getAllMusics();
                res.json(musics);
            } catch (error) {
                console.error('Error fetching all musics:', error);
                res.status(500).send(`Error fetching all musics: ${error.message}`);
            }
        });

        app.get('/musics', async (req, res) => {
            const producerAddress = req.query.producer;
            try {
                const musics = await blockchainService.getMusicsByProducer(producerAddress);
                res.json(musics);
            } catch (error) {
                console.error(`Error fetching musics by producer ${producerAddress}:`, error);
                res.status(500).send(`Error fetching musics by producer ${producerAddress}: ${error.message}`);
            }
        });

        app.get('/music/:id', async (req, res) => {
            const { id } = req.params;
            try {
                const music = await blockchainService.getMusicById(id);
                res.json(music);
            } catch (error) {
                console.error(`Error fetching music with ID ${id}:`, error);
                res.status(500).send(`Error fetching music with ID ${id}: ${error.message}`);
            }
        });

        app.post('/music', async (req, res) => {
            const musicData = req.body;
            try {
                const transactionHash = await blockchainService.createMusic(musicData);
                res.status(201).send({ message: 'Music created successfully!', transactionHash });
            } catch (error) {
                console.error('Error creating music:', error);
                res.status(500).send(`Error creating music: ${error.message}`);
            }
        });

        app.get('/balance/:address', async (req, res) => {
            const { address } = req.params;
            try {
                const balance = await blockchainService.getAccountBalance(address);
                res.json({ balance });
            } catch (error) {
                console.error(`Error fetching balance for address ${address}:`, error);
                res.status(500).send(`Error fetching balance for address ${address}: ${error.message}`);
            }
        });

        app.listen(port, () => {
            console.log(`Mermaid backend listening at http://localhost:${port}`);
        });
    } catch (error) {
        console.error(
            'Failed to initialize blockchain service or start event listener:',
            error
        );
        process.exit(1);
    }
}

startApp();