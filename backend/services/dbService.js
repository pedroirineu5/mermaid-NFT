const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function getConnection() {
    try {
        const connection = await pool.getConnection();
        console.log("Connected to MySQL database! (connection id: " + connection.threadId + ")");
        return connection;
    } catch (error) {
        console.error("Error connecting to MySQL database:", error);
        throw error;
    }
}

async function initializeDatabase() {
    let connection;
    try {
        connection = await getConnection();
        console.log("Initializing database...");        
        await createMusicsTable(connection);
        await createValidatedMusicContractsTable(connection);
        await createAssignedRightsTable(connection);
        await createWithdrawalRightsTable(connection);
        await createMusicWithSealedRightsTable(connection);
        await createTokenAssignedTable(connection);
        await createPurchaseMadeTable(connection);
        await createMusicHeardTable(connection);
        await createWeiRefundedTable(connection);
        await createTransferViaTokenSaleTable(connection);
        console.log("Database initialized successfully.");
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    } finally {
        if (connection) connection.release();
    }
}

async function createMusicsTable(connection) {
    try {
        const createTableQuery = `
        CREATE TABLE IF NOT EXISTS musics (
            id INT AUTO_INCREMENT PRIMARY KEY,
            musicId VARCHAR(255) UNIQUE NOT NULL,
            contractAddress VARCHAR(255) UNIQUE NOT NULL,
            title VARCHAR(255) NOT NULL,
            artist VARCHAR(255) NOT NULL,
            producer VARCHAR(255) NOT NULL,
            metadata VARCHAR(255),
            duration INT,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

        await connection.execute(createTableQuery);
        console.log('Music table created or already exists.');
    } catch (error) {
        console.error('Error creating musics table:', error);
        throw error;
    }
}

async function createValidatedMusicContractsTable(connection) {
    try {
        const createTableQuery = `
        CREATE TABLE IF NOT EXISTS validated_music_contracts (
            id INT AUTO_INCREMENT PRIMARY KEY,
            contractAddress VARCHAR(255) UNIQUE NOT NULL,
            valid BOOLEAN NOT NULL,
            transactionHash VARCHAR(255) NOT NULL,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

        await connection.execute(createTableQuery);
        console.log('validated_music_contracts table created or already exists.');
    } catch (error) {
        console.error('Error creating validated_music_contracts table:', error);
        throw error;
    }
}

async function createAssignedRightsTable(connection) {
    try {
        const createTableQuery = `
        CREATE TABLE IF NOT EXISTS assigned_rights (
            id INT AUTO_INCREMENT PRIMARY KEY,
            addressRight VARCHAR(255) NOT NULL,
            addressThisMusicContract VARCHAR(255) NOT NULL,
            percentageOfRights INT NOT NULL,
            transactionHash VARCHAR(255) NOT NULL,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

        await connection.execute(createTableQuery);
        console.log('assigned_rights table created or already exists.');
    } catch (error) {
        console.error('Error creating assigned_rights table:', error);
        throw error;
    }
}

async function createWithdrawalRightsTable(connection) {
    try {
        const createTableQuery = `
        CREATE TABLE IF NOT EXISTS withdrawal_rights (
            id INT AUTO_INCREMENT PRIMARY KEY,
            addressRight VARCHAR(255) NOT NULL,
            addressThisMusicContract VARCHAR(255) NOT NULL,
            percentageOfRights INT NOT NULL,
            transactionHash VARCHAR(255) NOT NULL,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

        await connection.execute(createTableQuery);
        console.log('withdrawal_rights table created or already exists.');
    } catch (error) {
        console.error('Error creating withdrawal_rights table:', error);
        throw error;
    }
}

async function createMusicWithSealedRightsTable(connection) {
    try {
        const createTableQuery = `
        CREATE TABLE IF NOT EXISTS music_with_sealed_rights (
            id INT AUTO_INCREMENT PRIMARY KEY,
            addressThisMusicContract VARCHAR(255) NOT NULL,
            musicContactIsSealed BOOLEAN NOT NULL,
            transactionHash VARCHAR(255) NOT NULL,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

        await connection.execute(createTableQuery);
        console.log('music_with_sealed_rights table created or already exists.');
    } catch (error) {
        console.error('Error creating music_with_sealed_rights table:', error);
        throw error;
    }
}

async function createTokenAssignedTable(connection) {
    try {
        const createTableQuery = `
        CREATE TABLE IF NOT EXISTS token_assigned (
            id INT AUTO_INCREMENT PRIMARY KEY,
            addressHolderToken VARCHAR(255) NOT NULL,
            amountToken INT NOT NULL,
            transactionHash VARCHAR(255) NOT NULL,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

        await connection.execute(createTableQuery);
        console.log('token_assigned table created or already exists.');
    } catch (error) {
        console.error('Error creating token_assigned table:', error);
        throw error;
    }
}

async function createPurchaseMadeTable(connection) {
    try {
        const createTableQuery = `
        CREATE TABLE IF NOT EXISTS purchase_made (
            id INT AUTO_INCREMENT PRIMARY KEY,
            purchaseAddress VARCHAR(255) NOT NULL,
            activated BOOLEAN NOT NULL,
            transactionHash VARCHAR(255) NOT NULL,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

        await connection.execute(createTableQuery);
        console.log('purchase_made table created or already exists.');
    } catch (error) {
        console.error('Error creating purchase_made table:', error);
        throw error;
    }
}

async function createMusicHeardTable(connection) {
    try {
        const createTableQuery = `
        CREATE TABLE IF NOT EXISTS music_heard (
            id INT AUTO_INCREMENT PRIMARY KEY,
            hearAddress VARCHAR(255) NOT NULL,
            confirm BOOLEAN NOT NULL,
            transactionHash VARCHAR(255) NOT NULL,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

        await connection.execute(createTableQuery);
        console.log('music_heard table created or already exists.');
    } catch (error) {
        console.error('Error creating music_heard table:', error);
        throw error;
    }
}

async function createWeiRefundedTable(connection) {
    try {
        const createTableQuery = `
        CREATE TABLE IF NOT EXISTS WeiRefunded (
            id INT AUTO_INCREMENT PRIMARY KEY,
            toAddress VARCHAR(255) NOT NULL,
            weiAmount VARCHAR(255) NOT NULL,
            transactionHash VARCHAR(255) NOT NULL,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

        await connection.execute(createTableQuery);
        console.log('WeiRefunded table created or already exists.');
    } catch (error) {
        console.error('Error creating WeiRefunded table:', error);
        throw error;
    }
}

async function createTransferViaTokenSaleTable(connection) {
    try {
        const createTableQuery = `
        CREATE TABLE IF NOT EXISTS transferViaTokenSale (
            id INT AUTO_INCREMENT PRIMARY KEY,
            toAddress VARCHAR(255) NOT NULL,
            weiAmount VARCHAR(255) NOT NULL,
            transactionHash VARCHAR(255) NOT NULL,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

        await connection.execute(createTableQuery);
        console.log('transferViaTokenSale table created or already exists.');
    } catch (error) {
        console.error('Error creating transferViaTokenSale table:', error);
        throw error;
    }
}

async function insertMusic(db, contractAddress, title, artist, producer, metadata, duration, musicId) {
    let connection;
    try {
        connection = await pool.getConnection();
        const [result] = await connection.execute(
            'INSERT INTO musics (musicId, contractAddress, title, artist, producer, metadata, duration) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [musicId, contractAddress, title, artist, producer, metadata, duration]
        );
        return result;
    } catch (error) {
        console.error('Error in insertMusic:', error);
        throw error;
    } finally {
        if (connection) connection.release();
    }
}

async function getAllMusics() {
    console.log("===== Getting All Musics (dbService) =====");
    let connection;
    try {
        connection = await getConnection();
        const [rows] = await connection.execute('SELECT * FROM musics');
        console.log("Fetched musics:", rows);
        return rows;
    } catch (error) {
        console.error("Error fetching all musics:", error);
        throw error;
    } finally {
        if (connection) connection.release();
    }
}

async function getMusicsByProducer(producerAddress) {
    console.log(`===== Getting Musics By Producer: ${producerAddress} (dbService) =====`);
    let connection;
    try {
        connection = await getConnection();
        const [rows] = await connection.execute('SELECT * FROM musics WHERE producer = ?', [producerAddress]);
        console.log(`Musics by producer ${producerAddress}:`, rows);
        return rows;
    } catch (error) {
        console.error(`Error getting musics by producer ${producerAddress}:`, error);
        throw error;
    } finally {
        if (connection) connection.release();
    }
}

async function getMusicById(musicId) {
    console.log(`===== Getting Music By ID: ${musicId} (dbService) =====`);
    let connection;
    try {
        connection = await getConnection();
        const [rows] = await connection.execute('SELECT * FROM musics WHERE id = ?', [musicId]);
        console.log(`Music with ID ${musicId}:`, rows[0]);
        return rows[0];
    } catch (error) {
        console.error(`Error fetching music with ID ${musicId}:`, error);
        throw error;
    } finally {
        if (connection) connection.release();
    }
}

module.exports = {
    initializeDatabase,
    getConnection,
    insertMusic,
    getAllMusics,
    getMusicsByProducer,
    getMusicById
};