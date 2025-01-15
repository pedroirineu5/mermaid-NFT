const { ethers } = require('ethers');
const { connectToDatabase } = require('./db');
const fs = require('fs');

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

const provider = new ethers.JsonRpcProvider(process.env.HARDHAT_PROVIDER_URL);

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
        console.log(colors.fg.green + 'Database connection OK!' + colors.reset);

        // Eventos do OysterToken
        oysterTokenInstance.on('validatedMusicContract', async (address, valid, event) => {
            console.log(colors.fg.magenta + `New Event: Music Contract Validated - Address: ${address}, Valid: ${valid}` + colors.reset);
            const transactionHash = event.log.transactionHash;

            try {
                const [existingRows] = await connection.execute(
                    'SELECT 1 FROM validated_music_contracts WHERE transactionHash = ?',
                    [transactionHash]
                );

                if (existingRows.length > 0) {
                    console.log(colors.dim + 'Event already processed. Skipping.' + colors.reset);
                    return;
                }

                await connection.execute(
                    'INSERT INTO validated_music_contracts (contractAddress, valid, transactionHash) VALUES (?, ?, ?)',
                    [address, valid, transactionHash]
                );
                console.log(colors.fg.green + 'Event data saved!' + colors.reset);
            } catch (dbError) {
                console.error(colors.fg.red + 'Error saving event data:' + colors.reset, dbError);
            }
        });

        oysterTokenInstance.on('WeiRefunded', async (to, weiAmount, event) => {
            console.log(colors.fg.magenta + `New Event: Wei Refunded - Address: ${to}, Amount: ${weiAmount}` + colors.reset);
            const transactionHash = event.log.transactionHash;

            try {
                const [existingRows] = await connection.execute(
                    'SELECT 1 FROM WeiRefunded WHERE transactionHash = ?',
                    [transactionHash]
                );

                if (existingRows.length > 0) {
                    console.log(colors.dim + 'Event already processed. Skipping.' + colors.reset);
                    return;
                }

                await connection.execute(
                    'INSERT INTO WeiRefunded (`to`, weiAmount, transactionHash) VALUES (?, ?, ?)',
                    [to, weiAmount, transactionHash]
                );
                console.log(colors.fg.green + 'Event data saved!' + colors.reset);
            } catch (dbError) {
                console.error(colors.fg.red + 'Error saving event data:' + colors.reset, dbError);
            }
        });

        oysterTokenInstance.on('transferViaTokenSale', async (to, weiAmount, event) => {
            console.log(colors.fg.magenta + `New Event: Token Sale Transfer - Address: ${to}, Amount: ${weiAmount}` + colors.reset);
            const transactionHash = event.log.transactionHash;

            try {
                const [existingRows] = await connection.execute(
                    'SELECT 1 FROM transferViaTokenSale WHERE transactionHash = ?',
                    [transactionHash]
                );

                if (existingRows.length > 0) {
                    console.log(colors.dim + 'Event already processed. Skipping.' + colors.reset);
                    return;
                }

                await connection.execute(
                    'INSERT INTO transferViaTokenSale (`to`, weiAmount, transactionHash) VALUES (?, ?, ?)',
                    [to, weiAmount, transactionHash]
                );
                console.log(colors.fg.green + 'Event data saved!' + colors.reset);
            } catch (dbError) {
                console.error(colors.fg.red + 'Error saving event data:' + colors.reset, dbError);
            }
        });

        // Eventos do MusicContract
        musicContractInstance.on('assignedRight', async (addressRight, addressThisMusicContract, percentageOfRights, event) => {
            console.log(colors.fg.magenta + `New Event: Rights Assigned - Address: ${addressRight}, Contract: ${addressThisMusicContract}, Percentage: ${percentageOfRights}` + colors.reset);
            const transactionHash = event.log.transactionHash;

            try {
                const [existingRows] = await connection.execute(
                    'SELECT 1 FROM assigned_rights WHERE transactionHash = ?',
                    [transactionHash]
                );

                if (existingRows.length > 0) {
                    console.log(colors.dim + 'Event already processed. Skipping.' + colors.reset);
                    return;
                }

                await connection.execute(
                    'INSERT INTO assigned_rights (addressRight, addressThisMusicContract, percentageOfRights, transactionHash) VALUES (?, ?, ?, ?)',
                    [addressRight, addressThisMusicContract, percentageOfRights, transactionHash]
                );
                console.log(colors.fg.green + 'Event data saved!' + colors.reset);
            } catch (dbError) {
                console.error(colors.fg.red + 'Error saving event data:' + colors.reset, dbError);
            }
        });

        musicContractInstance.on('withdrawalRight', async (addressRight, addressThisMusicContract, percentageOfRights, event) => {
            console.log(colors.fg.magenta + `New Event: Rights Withdrawn - Address: ${addressRight}, Contract: ${addressThisMusicContract}, Percentage: ${percentageOfRights}` + colors.reset);
            const transactionHash = event.log.transactionHash;

            try {
                const [existingRows] = await connection.execute(
                    'SELECT 1 FROM withdrawal_rights WHERE transactionHash = ?',
                    [transactionHash]
                );

                if (existingRows.length > 0) {
                    console.log(colors.dim + 'Event already processed. Skipping.' + colors.reset);
                    return;
                }

                await connection.execute(
                    'INSERT INTO withdrawal_rights (addressRight, addressThisMusicContract, percentageOfRights, transactionHash) VALUES (?, ?, ?, ?)',
                    [addressRight, addressThisMusicContract, percentageOfRights, transactionHash]
                );
                console.log(colors.fg.green + 'Event data saved!' + colors.reset);
            } catch (dbError) {
                console.error(colors.fg.red + 'Error saving event data:' + colors.reset, dbError);
            }
        });

        musicContractInstance.on('musicWithSealedRights', async (addressThisMusicContract, musicContactIsSealed, event) => {
            console.log(colors.fg.magenta + `New Event: Music Rights Sealed - Contract: ${addressThisMusicContract}, Sealed: ${musicContactIsSealed}` + colors.reset);
            const transactionHash = event.log.transactionHash;

            try {
                const [existingRows] = await connection.execute(
                    'SELECT 1 FROM music_with_sealed_rights WHERE transactionHash = ?',
                    [transactionHash]
                );

                if (existingRows.length > 0) {
                    console.log(colors.dim + 'Event already processed. Skipping.' + colors.reset);
                    return;
                }

                await connection.execute(
                    'INSERT INTO music_with_sealed_rights (addressThisMusicContract, musicContactIsSealed, transactionHash) VALUES (?, ?, ?)',
                    [addressThisMusicContract, musicContactIsSealed, transactionHash]
                );
                console.log(colors.fg.green + 'Event data saved!' + colors.reset);
            } catch (dbError) {
                console.error(colors.fg.red + 'Error saving event data:' + colors.reset, dbError);
            }
        });

        musicContractInstance.on('tokenAssigned', async (addressHolderToken, amountToken, event) => {
            console.log(colors.fg.magenta + `New Event: Token Assigned - Address: ${addressHolderToken}, Amount: ${amountToken}` + colors.reset);
            const transactionHash = event.log.transactionHash;

            try {
                const [existingRows] = await connection.execute(
                    'SELECT 1 FROM token_assigned WHERE transactionHash = ?',
                    [transactionHash]
                );

                if (existingRows.length > 0) {
                    console.log(colors.dim + 'Event already processed. Skipping.' + colors.reset);
                    return;
                }

                await connection.execute(
                    'INSERT INTO token_assigned (addressHolderToken, amountToken, transactionHash) VALUES (?, ?, ?)',
                    [addressHolderToken, amountToken.toString(), transactionHash]
                );
                console.log(colors.fg.green + 'Event data saved!' + colors.reset);
            } catch (dbError) {
                console.error(colors.fg.red + 'Error saving event data:' + colors.reset, dbError);
            }
        });

        musicContractInstance.on('purchaseMade', async (purchaseAddress, activated, event) => {
            console.log(colors.fg.magenta + `New Event: Purchase Made - Address: ${purchaseAddress}, Activated: ${activated}` + colors.reset);
            const transactionHash = event.log.transactionHash;

            try {
                const [existingRows] = await connection.execute(
                    'SELECT 1 FROM purchase_made WHERE transactionHash = ?',
                    [transactionHash]
                );

                if (existingRows.length > 0) {
                    console.log(colors.dim + 'Event already processed. Skipping.' + colors.reset);
                    return;
                }

                await connection.execute(
                    'INSERT INTO purchase_made (purchaseAddress, activated, transactionHash) VALUES (?, ?, ?)',
                    [purchaseAddress, activated, transactionHash]
                );
                console.log(colors.fg.green + 'Event data saved!' + colors.reset);
            } catch (dbError) {
                console.error(colors.fg.red + 'Error saving event data:' + colors.reset, dbError);
            }
        });

        musicContractInstance.on('musicHeard', async (hearAddress, confirm, event) => {
            console.log(colors.fg.magenta + `New Event: Music Heard - Address: ${hearAddress}, Confirm: ${confirm}` + colors.reset);
            const transactionHash = event.log.transactionHash;

            try {
                const [existingRows] = await connection.execute(
                    'SELECT 1 FROM music_heard WHERE transactionHash = ?',
                    [transactionHash]
                );

                if (existingRows.length > 0) {
                    console.log(colors.dim + 'Event already processed. Skipping.' + colors.reset);
                    return;
                }

                await connection.execute(
                    'INSERT INTO music_heard (hearAddress, confirm, transactionHash) VALUES (?, ?, ?)',
                    [hearAddress, confirm, transactionHash]
                );
                console.log(colors.fg.green + 'Event data saved!' + colors.reset);
            } catch (dbError) {
                console.error(colors.fg.red + 'Error saving event data:' + colors.reset, dbError);
            }
        });

        console.log(colors.fg.blue + colors.bright + 'Listening for blockchain events...' + colors.reset);
    } catch (error) {
        console.error(colors.fg.red + 'Error setting up event listeners:' + colors.reset, error.message);
    }
}

module.exports = { listenToEvents };