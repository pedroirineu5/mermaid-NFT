const express = require('express');
const {
    initializeBlockchainService,
    validateMusicContract,
    sealMusicContract,
    assignMusicRights,
    withdrawMusicRights,
    buy100OysterTokens,
    sellOysterTokens,
    buyMusicRights,
    listenToMusic,
    getRightHolders,
    getRemainingRightsDivision,
    getDivisionOfRights,
    isMusicContractSealed,
    getTokensPerAddress,
    getMusicContractBalance,
    isMusicContractValid,
    approveOysterVault
} = require('./services/blockchainService');
const { listenToEvents } = require('./services/eventListener');

require('dotenv').config();

const app = express();
const port = 3000;

// Configurar o Express para serializar BigInt para JSON
app.set('json replacer', function (key, value) {
    if (typeof value === 'bigint') {
        return value.toString();
    }
    return value;
});

app.use(express.json());

async function startApp() {
    try {
        await initializeBlockchainService();
        console.log('Blockchain service initialized.');

        listenToEvents();
        console.log('Event listener started.');

        app.post('/validate-music-contract', async (req, res) => {
            const { addressMusicContract } = req.body;
            try {
                const transactionHash = await validateMusicContract(
                    addressMusicContract
                );
                res.send({
                    message: 'Music contract validated!',
                    transactionHash: transactionHash,
                    musicContractAddress: addressMusicContract,
                });
            } catch (error) {
                console.error(error);
                res
                    .status(500)
                    .send(`Error validating music contract: ${error.message}`);
            }
        });

        app.post('/seal-music-contract', async (req, res) => {
            try {
                const transactionHash = await sealMusicContract();
                res.send(
                    `Music contract sealed! Transaction hash: ${transactionHash}`
                );
            } catch (error) {
                console.error(error);
                res.status(500).send(`Error sealing music contract: ${error.message}`);
            }
        });

        app.post('/assign-music-rights', async (req, res) => {
            const { address, percentage } = req.body;
            try {
                const transactionHash = await assignMusicRights(address, percentage);
                res.send(`Music rights assigned! Transaction hash: ${transactionHash}`);
            } catch (error) {
                console.error(error);
                res.status(500).send(`Error assigning music rights: ${error.message}`);
            }
        });

        app.post('/withdraw-music-rights', async (req, res) => {
            const { address, percentage } = req.body;
            try {
                const transactionHash = await withdrawMusicRights(address, percentage);
                res.send(`Music rights withdrawn! Transaction hash: ${transactionHash}`);
            } catch (error) {
                console.error(error);
                res.status(500).send(`Error withdrawing music rights: ${error.message}`);
            }
        });

        app.post('/buy-tokens', async (req, res) => {
            try {
                // Verificar se o contrato de música é válido antes de comprar tokens
                const isContractValid = await isMusicContractValid(
                    process.env.MUSIC_CONTRACT_ADDRESS
                );
                if (!isContractValid) {
                    return res.status(400).send('Music contract is not valid.');
                }
                const transactionHash = await buy100OysterTokens(
                    process.env.MUSIC_CONTRACT_ADDRESS
                );
                res.send(
                    `100 OysterTokens purchased! Transaction hash: ${transactionHash}`
                );
            } catch (error) {
                console.error(error);
                res.status(500).send(`Error purchasing tokens: ${error.message}`);
            }
        });

        app.post('/sell-tokens', async (req, res) => {
            const { amount } = req.body;
            try {
              const transactionHash = await sellOysterTokens(amount);
              res.send(
                `${amount} OysterTokens sold! Transaction hash: ${transactionHash}`
              );
            } catch (error) {
              console.error(error);
              res.status(500).send(`Error selling tokens: ${error.message}`);
            }
        });

        app.post('/buy-rights', async (req, res) => {
            try {
                const transactionHash = await buyMusicRights();
                res.send(`Music rights purchased! Transaction hash: ${transactionHash}`);
            } catch (error) {
                console.error(error);
                res.status(500).send(`Error purchasing music rights: ${error.message}`);
            }
        });

        app.post('/listen-music', async (req, res) => {
            try {
                const transactionHash = await listenToMusic();
                res.send(`Music listened to! Transaction hash: ${transactionHash}`);
            } catch (error) {
                console.error(error);
                res.status(500).send(`Error listening to music: ${error.message}`);
            }
        });

        app.get('/right-holders', async (req, res) => {
            try {
                const rightHolders = await getRightHolders();
                res.json(rightHolders);
            } catch (error) {
                console.error(error);
                res
                    .status(500)
                    .send(`Error fetching right holders: ${error.message}`);
            }
        });

        app.get('/remaining-rights', async (req, res) => {
            try {
                const remainingRights = await getRemainingRightsDivision();
                res.json({ remainingRights });
            } catch (error) {
                console.error(error);
                res
                    .status(500)
                    .send(`Error fetching remaining rights: ${error.message}`);
            }
        });

        app.get('/division-rights/:address', async (req, res) => {
            const { address } = req.params;
            try {
                const divisionRights = await getDivisionOfRights(address);
                res.json({ divisionRights });
            } catch (error) {
                console.error(error);
                res
                    .status(500)
                    .send(`Error fetching division of rights: ${error.message}`);
            }
        });

        app.get('/is-sealed', async (req, res) => {
            try {
                const isSealed = await isMusicContractSealed();
                res.json({ isSealed });
            } catch (error) {
                console.error(error);
                res
                    .status(500)
                    .send(`Error checking if contract is sealed: ${error.message}`);
            }
        });

        app.get('/tokens/:address', async (req, res) => {
            const { address } = req.params;
            try {
                const tokens = await getTokensPerAddress(address);
                res.json({ tokens });
            } catch (error) {
                console.error(error);
                res
                    .status(500)
                    .send(`Error fetching tokens per address: ${error.message}`);
            }
        });

      app.get('/balance', async (req, res) => {
        try {
            const balance = await getMusicContractBalance();
            res.json({ balance });
        } catch (error) {
            console.error(error);
            res.status(500).send(`Error fetching contract balance: ${error.message}`);
        }
    });

    app.post('/approve-vault', async (req, res) => {
        const { amount } = req.body;
      
        try {
          const transactionHash = await approveOysterVault(amount);
          res.send(
            `Vault approved to spend ${amount} tokens! Transaction hash: ${transactionHash}`
          );
        } catch (error) {
          console.error(error);
          res.status(500).send(`Error approving vault: ${error.message}`);
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