const express = require('express');
const blockchainService = require('./services/blockchainService');

require('dotenv').config();

const app = express();
const port = 3000;

app.use(express.json());

async function startApp() {
    try {
        await blockchainService.initializeBlockchainService();
        console.log('Blockchain service initialized.');

        app.post('/validate-music-contract', async (req, res) => {
            const { addressMusicContract } = req.body;
            try {
                const result = await blockchainService.validateMusicContract(
                    addressMusicContract
                );
                if (result.isValid) {
                    res.send({
                        message: 'Music contract validated!',
                        transactionHash: result.hash,
                        musicContractAddress: addressMusicContract,
                    });
                } else {
                    // Isso nunca deve acontecer, pois se a transação foi revertida, um erro deve ter sido lançado
                    res.status(400).send({
                        error: 'Music contract validation failed.',
                        transactionHash: result.hash,
                        musicContractAddress: addressMusicContract,
                    });
                }
            } catch (error) {
                console.error(error);
                res.status(500).send(`Error validating music contract: ${error.message}`);
            }
        });

        app.post('/assign-full-rights', async (req, res) => {
            const { addressRight } = req.body;
            try {
                const transactionHash = await blockchainService.assignFullMusicRights(addressRight);
                res.send(`Music rights assigned! Transaction hash: ${transactionHash}`);
            } catch (error) {
                console.error(error);
                res.status(500).send(`Error assigning music rights: ${error.message}`);
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

        app.post('/buy-tokens', async (req, res) => {
            const { amount } = req.body; // Agora recebe a quantidade de tokens
            try {
                // Obter o endereço do comprador do cabeçalho da requisição ou do corpo da requisição
                const buyerAddress = req.headers['x-buyer-address'] || req.body.buyerAddress; 

                if (!buyerAddress) {
                    return res.status(400).send({ error: 'Buyer address is required.' });
                }

                const transactionHash = await blockchainService.buyTokens(buyerAddress, amount);
                res.send(
                    `${amount} tokens purchased by ${buyerAddress}! Transaction hash: ${transactionHash}`
                );
            } catch (error) {
                console.error(error);
                res.status(500).send(`Error purchasing tokens: ${error.message}`);
            }
        });

        app.post('/sell-tokens', async (req, res) => {
            const { amount } = req.body;
            try {
                const transactionHash = await blockchainService.sellOysterTokens(
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