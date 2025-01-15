const { ethers } = require('ethers');
const { connectToDatabase } = require('./db');
const fs = require('fs');

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
        console.log('Database connection OK!');

        // Eventos do OysterToken
        oysterTokenInstance.on('validatedMusicContract', async (address, valid, event) => {
            console.log(`New Event: Music Contract Validated - Address: ${address}, Valid: ${valid}`);
            const transactionHash = event.log.transactionHash;

            try {
                const [existingRows] = await connection.execute(
                    'SELECT 1 FROM validated_music_contracts WHERE transactionHash = ?',
                    [transactionHash]
                );

                if (existingRows.length > 0) {
                    console.log('Event already processed. Skipping.');
                    return;
                }

                await connection.execute(
                    'INSERT INTO validated_music_contracts (contractAddress, valid, transactionHash) VALUES (?, ?, ?)',
                    [address, valid, transactionHash]
                );
                console.log('Event data saved!');
            } catch (dbError) {
                console.error('Error saving event data:', dbError);
            }
        });

        oysterTokenInstance.on('WeiRefunded', async (to, weiAmount, event) => {
            console.log(`New Event: Wei Refunded - Address: ${to}, Amount: ${weiAmount}`);
            const transactionHash = event.log.transactionHash;

            try {
                const [existingRows] = await connection.execute(
                    'SELECT 1 FROM WeiRefunded WHERE transactionHash = ?',
                    [transactionHash]
                );

                if (existingRows.length > 0) {
                    console.log('Event already processed. Skipping.');
                    return;
                }

                await connection.execute(
                    'INSERT INTO WeiRefunded (`to`, weiAmount, transactionHash) VALUES (?, ?, ?)',
                    [to, weiAmount, transactionHash]
                );
                console.log('Event data saved!');
            } catch (dbError) {
                console.error('Error saving event data:', dbError);
            }
        });

        oysterTokenInstance.on('transferViaTokenSale', async (to, weiAmount, event) => {
            console.log(`New Event: Token Sale Transfer - Address: ${to}, Amount: ${weiAmount}`);
            const transactionHash = event.log.transactionHash;

            try {
                const [existingRows] = await connection.execute(
                    'SELECT 1 FROM transferViaTokenSale WHERE transactionHash = ?',
                    [transactionHash]
                );

                if (existingRows.length > 0) {
                    console.log('Event already processed. Skipping.');
                    return;
                }
                
                await connection.execute(
                    'INSERT INTO transferViaTokenSale (`to`, weiAmount, transactionHash) VALUES (?, ?, ?)',
                    [to, weiAmount, transactionHash]
                );
                console.log('Event data saved!');
            } catch (dbError) {
                console.error('Error saving event data:', dbError);
            }
        });

        // Eventos do MusicContract
        musicContractInstance.on('assignedRight', async (addressRight, addressThisMusicContract, percentageOfRights, event) => {
            console.log(`New Event: Rights Assigned - Address: ${addressRight}, Contract: ${addressThisMusicContract}, Percentage: ${percentageOfRights}`);
            const transactionHash = event.log.transactionHash;

            try {
                const [existingRows] = await connection.execute(
                    'SELECT 1 FROM assigned_rights WHERE transactionHash = ?',
                    [transactionHash]
                );

                if (existingRows.length > 0) {
                    console.log('Event already processed. Skipping.');
                    return;
                }

                await connection.execute(
                    'INSERT INTO assigned_rights (addressRight, addressThisMusicContract, percentageOfRights, transactionHash) VALUES (?, ?, ?, ?)',
                    [addressRight, addressThisMusicContract, percentageOfRights, transactionHash]
                );
                console.log('Event data saved!');
            } catch (dbError) {
                console.error('Error saving event data:', dbError);
            }
        });

        musicContractInstance.on('withdrawalRight', async (addressRight, addressThisMusicContract, percentageOfRights, event) => {
            console.log(`New Event: Rights Withdrawn - Address: ${addressRight}, Contract: ${addressThisMusicContract}, Percentage: ${percentageOfRights}`);
            const transactionHash = event.log.transactionHash;

            try {
                const [existingRows] = await connection.execute(
                    'SELECT 1 FROM withdrawal_rights WHERE transactionHash = ?',
                    [transactionHash]
                );

                if (existingRows.length > 0) {
                    console.log('Event already processed. Skipping.');
                    return;
                }

                await connection.execute(
                    'INSERT INTO withdrawal_rights (addressRight, addressThisMusicContract, percentageOfRights, transactionHash) VALUES (?, ?, ?, ?)',
                    [addressRight, addressThisMusicContract, percentageOfRights, transactionHash]
                );
                console.log('Event data saved!');
            } catch (dbError) {
                console.error('Error saving event data:', dbError);
            }
        });

        musicContractInstance.on('musicWithSealedRights', async (addressThisMusicContract, musicContactIsSealed, event) => {
            console.log(`New Event: Music Rights Sealed - Contract: ${addressThisMusicContract}, Sealed: ${musicContactIsSealed}`);
            const transactionHash = event.log.transactionHash;

            try {
                const [existingRows] = await connection.execute(
                    'SELECT 1 FROM music_with_sealed_rights WHERE transactionHash = ?',
                    [transactionHash]
                );

                if (existingRows.length > 0) {
                    console.log('Event already processed. Skipping.');
                    return;
                }

                await connection.execute(
                    'INSERT INTO music_with_sealed_rights (addressThisMusicContract, musicContactIsSealed, transactionHash) VALUES (?, ?, ?)',
                    [addressThisMusicContract, musicContactIsSealed, transactionHash]
                );
                console.log('Event data saved!');
            } catch (dbError) {
                console.error('Error saving event data:', dbError);
            }
        });

        musicContractInstance.on('tokenAssigned', async (addressHolderToken, amountToken, event) => {
            console.log(`New Event: Token Assigned - Address: ${addressHolderToken}, Amount: ${amountToken}`);
            const transactionHash = event.log.transactionHash;

            try {
                const [existingRows] = await connection.execute(
                    'SELECT 1 FROM token_assigned WHERE transactionHash = ?',
                    [transactionHash]
                );

                if (existingRows.length > 0) {
                    console.log('Event already processed. Skipping.');
                    return;
                }

                await connection.execute(
                    'INSERT INTO token_assigned (addressHolderToken, amountToken, transactionHash) VALUES (?, ?, ?)',
                    [addressHolderToken, amountToken.toString(), transactionHash]
                );
                console.log('Event data saved!');
            } catch (dbError) {
                console.error('Error saving event data:', dbError);
            }
        });

        musicContractInstance.on('purchaseMade', async (purchaseAddress, activated, event) => {
            console.log(`New Event: Purchase Made - Address: ${purchaseAddress}, Activated: ${activated}`);
            const transactionHash = event.log.transactionHash;

            try {
                const [existingRows] = await connection.execute(
                    'SELECT 1 FROM purchase_made WHERE transactionHash = ?',
                    [transactionHash]
                );

                if (existingRows.length > 0) {
                    console.log('Event already processed. Skipping.');
                    return;
                }

                await connection.execute(
                    'INSERT INTO purchase_made (purchaseAddress, activated, transactionHash) VALUES (?, ?, ?)',
                    [purchaseAddress, activated, transactionHash]
                );
                console.log('Event data saved!');
            } catch (dbError) {
                console.error('Error saving event data:', dbError);
            }
        });

        musicContractInstance.on('musicHeard', async (hearAddress, confirm, event) => {
            console.log(`New Event: Music Heard - Address: ${hearAddress}, Confirm: ${confirm}`);
            const transactionHash = event.log.transactionHash;

            try {
                const [existingRows] = await connection.execute(
                    'SELECT 1 FROM music_heard WHERE transactionHash = ?',
                    [transactionHash]
                );

                if (existingRows.length > 0) {
                    console.log('Event already processed. Skipping.');
                    return;
                }

                await connection.execute(
                    'INSERT INTO music_heard (hearAddress, confirm, transactionHash) VALUES (?, ?, ?)',
                    [hearAddress, confirm, transactionHash]
                );
                console.log('Event data saved!');
            } catch (dbError) {
                console.error('Error saving event data:', dbError);
            }
        });

        console.log('Listening for blockchain events...');
    } catch (error) {
        console.error('Error setting up event listeners:', error.message);
    }
}

module.exports = { listenToEvents };