const { ethers } = require('ethers');
const { connectToDatabase } = require('./db');
const fs = require('fs');

const provider = new ethers.JsonRpcProvider('http://127.0.0.1:7545');

async function listenToEvents() {
    try {
        const deployData = JSON.parse(fs.readFileSync('deploy-data.json', 'utf8'));
        const oysterTokenAddress = deployData.oysterToken.address;
        const oysterTokenABI = deployData.oysterToken.abi;
        const oysterVaultAddress = deployData.oysterVault.address;
        const oysterVaultABI = deployData.oysterVault.abi;
        const musicContractAddress = deployData.musicContract.address;
        const musicContractABI = deployData.musicContract.abi;

        const oysterTokenInstance = new ethers.Contract(
            oysterTokenAddress,
            oysterTokenABI,
            provider
        );
        const oysterVaultInstance = new ethers.Contract(
            oysterVaultAddress,
            oysterVaultABI,
            provider
        );
        const musicContractInstance = new ethers.Contract(
            musicContractAddress,
            musicContractABI,
            provider
        );

        const connection = await connectToDatabase();
        console.log('Database connection established successfully!');

        // Listener para ValidatedMusicContract (OysterToken)
        oysterTokenInstance.on(
            'ValidatedMusicContract',
            async (address, valid, event) => {
                console.log(
                    `Event: ValidatedMusicContract - Address: ${address}, Valid: ${valid}`
                );
                const transactionHash = event.log.transactionHash;

                try {
                    console.log(
                        'Executing SQL query for ValidatedMusicContract...'
                    );
                    const [results] = await connection.execute(
                        'INSERT INTO validated_music_contracts (contractAddress, valid, transactionHash) VALUES (?, ?, ?)',
                        [address, valid, transactionHash]
                    );
                    console.log(
                        'ValidatedMusicContract event data inserted into database!',
                        results
                    );
                } catch (dbError) {
                    console.error(
                        'Error inserting ValidatedMusicContract event data:',
                        dbError
                    );
                }
            }
        );

        // Listener para FullRightsAssigned (MusicContract)
        musicContractInstance.on(
            'FullRightsAssigned',
            async (to, timestamp, event) => {
                console.log(
                    `Event: FullRightsAssigned - To: ${to}, Timestamp: ${timestamp}`
                );
                const transactionHash = event.log.transactionHash;

                try {
                    const [results] = await connection.execute(
                        'INSERT INTO full_rights_assigned (addressTo, timestamp, transactionHash) VALUES (?, ?, ?)',
                        [to, new Date(Number(timestamp) * 1000).toISOString(), transactionHash]
                    );
                    console.log(
                        'FullRightsAssigned event data inserted into database!'
                    );
                } catch (dbError) {
                    console.error(
                        'Error inserting FullRightsAssigned event data:',
                        dbError
                    );
                }
            }
        );

        // Listener para SellTokens (MusicContract)
        musicContractInstance.on(
            'SellTokens',
            async (caller, amount, event) => {
                console.log(
                    `Event: SellTokens - Caller: ${caller}, Amount: ${amount}`
                );
                const transactionHash = event.log.transactionHash;

                try {
                    const [results] = await connection.execute(
                        'INSERT INTO sell_tokens (caller, amount, transactionHash) VALUES (?, ?, ?)',
                        [caller, amount.toString(), transactionHash]
                    );
                    console.log('SellTokens event data inserted into database!');
                } catch (dbError) {
                    console.error(
                        'Error inserting SellTokens event data:',
                        dbError
                    );
                }
            }
        );

        // Listener para TokensPurchased (MusicContract)
        musicContractInstance.on(
            'TokensPurchased',
            async (buyer, amount, event) => {
                console.log(
                    `Event: TokensPurchased - Buyer: ${buyer}, Amount: ${amount}`
                );
                const transactionHash = event.log.transactionHash;

                try {
                    const [results] = await connection.execute(
                        'INSERT INTO tokens_purchased (buyer, amount, transactionHash) VALUES (?, ?, ?)',
                        [buyer, amount.toString(), transactionHash]
                    );
                    console.log(
                        'TokensPurchased event data inserted into database!'
                    );
                } catch (dbError) {
                    console.error(
                        'Error inserting TokensPurchased event data:',
                        dbError
                    );
                }
            }
        );

        // Listener para RightsSealed (MusicContract)
        musicContractInstance.on('RightsSealed', async (caller, event) => {
            console.log(`Event: RightsSealed - Caller: ${caller}`);
            const transactionHash = event.log.transactionHash;

            try {
                const [results] = await connection.execute(
                    'INSERT INTO rights_sealed (caller, transactionHash) VALUES (?, ?)',
                    [caller, transactionHash]
                );
                console.log('RightsSealed event data inserted into database!');
            } catch (dbError) {
                console.error(
                    'Error inserting RightsSealed event data:',
                    dbError
                );
            }
        });

        console.log('Listening for events on Ganache...');
    } catch (error) {
        console.error('Error setting up event listeners:', error);
    }
}

module.exports = { listenToEvents };