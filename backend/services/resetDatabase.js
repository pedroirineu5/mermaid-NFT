const mysql = require('mysql2/promise');
require('dotenv').config();

async function resetDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE
    });

    await connection.query(`USE ${process.env.DB_DATABASE}`);

    const tables = [
      `CREATE TABLE IF NOT EXISTS validated_music_contracts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        contractAddress VARCHAR(255) NOT NULL,
        valid BOOLEAN NOT NULL,
        transactionHash VARCHAR(255) NOT NULL UNIQUE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS assigned_rights (
        id INT AUTO_INCREMENT PRIMARY KEY,
        addressRight VARCHAR(255) NOT NULL,
        addressThisMusicContract VARCHAR(255) NOT NULL,
        percentageOfRights TINYINT UNSIGNED NOT NULL,
        transactionHash VARCHAR(255) NOT NULL UNIQUE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS withdrawal_rights (
        id INT AUTO_INCREMENT PRIMARY KEY,
        addressRight VARCHAR(255) NOT NULL,
        addressThisMusicContract VARCHAR(255) NOT NULL,
        percentageOfRights TINYINT UNSIGNED NOT NULL,
        transactionHash VARCHAR(255) NOT NULL UNIQUE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS music_with_sealed_rights (
        id INT AUTO_INCREMENT PRIMARY KEY,
        addressThisMusicContract VARCHAR(255) NOT NULL,
        musicContactIsSealed BOOLEAN NOT NULL,
        transactionHash VARCHAR(255) NOT NULL UNIQUE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS token_assigned (
        id INT AUTO_INCREMENT PRIMARY KEY,
        addressHolderToken VARCHAR(255) NOT NULL,
        amountToken VARCHAR(255) NOT NULL,
        transactionHash VARCHAR(255) NOT NULL UNIQUE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS purchase_made (
        id INT AUTO_INCREMENT PRIMARY KEY,
        purchaseAddress VARCHAR(255) NOT NULL,
        activated BOOLEAN NOT NULL,
        transactionHash VARCHAR(255) NOT NULL UNIQUE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS music_heard (
        id INT AUTO_INCREMENT PRIMARY KEY,
        hearAddress VARCHAR(255) NOT NULL,
        confirm BOOLEAN NOT NULL,
        transactionHash VARCHAR(255) NOT NULL UNIQUE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS WeiRefunded (
        id INT AUTO_INCREMENT PRIMARY KEY,
        \`to\` VARCHAR(255) NOT NULL,
        weiAmount VARCHAR(255) NOT NULL,
        transactionHash VARCHAR(255) NOT NULL UNIQUE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS transferViaTokenSale (
        id INT AUTO_INCREMENT PRIMARY KEY,
        \`to\` VARCHAR(255) NOT NULL,
        weiAmount VARCHAR(255) NOT NULL,
        transactionHash VARCHAR(255) NOT NULL UNIQUE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
    ];

    for (const table of tables) {
      await connection.query(table);
    }

    await connection.end();
    console.log('Database reset successful!');
  } catch (error) {
    console.error('Error resetting database:', error);
    process.exit(1);
  }
}

module.exports = { resetDatabase };