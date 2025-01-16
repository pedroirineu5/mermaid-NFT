const mysql = require('mysql2/promise');
require('dotenv').config();

async function resetDatabase() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    });

    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_DATABASE}`);
    await connection.query(`USE ${process.env.DB_DATABASE}`);

    const tables = {
      validated_music_contracts: `
        id INT AUTO_INCREMENT PRIMARY KEY,
        contractAddress VARCHAR(255) NOT NULL,
        valid BOOLEAN NOT NULL,
        transactionHash VARCHAR(255) NOT NULL UNIQUE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP`,
      assigned_rights: `
        id INT AUTO_INCREMENT PRIMARY KEY,
        addressRight VARCHAR(255) NOT NULL,
        addressThisMusicContract VARCHAR(255) NOT NULL,
        percentageOfRights TINYINT UNSIGNED NOT NULL,
        transactionHash VARCHAR(255) NOT NULL UNIQUE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP`,
      withdrawal_rights: `
        id INT AUTO_INCREMENT PRIMARY KEY,
        addressRight VARCHAR(255) NOT NULL,
        addressThisMusicContract VARCHAR(255) NOT NULL,
        percentageOfRights TINYINT UNSIGNED NOT NULL,
        transactionHash VARCHAR(255) NOT NULL UNIQUE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP`,
      music_with_sealed_rights: `
        id INT AUTO_INCREMENT PRIMARY KEY,
        addressThisMusicContract VARCHAR(255) NOT NULL,
        musicContactIsSealed BOOLEAN NOT NULL,
        transactionHash VARCHAR(255) NOT NULL UNIQUE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP`,
      token_assigned: `
        id INT AUTO_INCREMENT PRIMARY KEY,
        addressHolderToken VARCHAR(255) NOT NULL,
        amountToken VARCHAR(255) NOT NULL,
        transactionHash VARCHAR(255) NOT NULL UNIQUE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP`,
      purchase_made: `
        id INT AUTO_INCREMENT PRIMARY KEY,
        purchaseAddress VARCHAR(255) NOT NULL,
        activated BOOLEAN NOT NULL,
        transactionHash VARCHAR(255) NOT NULL UNIQUE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP`,
      music_heard: `
        id INT AUTO_INCREMENT PRIMARY KEY,
        hearAddress VARCHAR(255) NOT NULL,
        confirm BOOLEAN NOT NULL,
        transactionHash VARCHAR(255) NOT NULL UNIQUE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP`,
      WeiRefunded: `
        id INT AUTO_INCREMENT PRIMARY KEY,
        \`to\` VARCHAR(255) NOT NULL,
        weiAmount VARCHAR(255) NOT NULL,
        transactionHash VARCHAR(255) NOT NULL UNIQUE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP`,
      transferViaTokenSale: `
        id INT AUTO_INCREMENT PRIMARY KEY,
        \`to\` VARCHAR(255) NOT NULL,
        weiAmount VARCHAR(255) NOT NULL,
        transactionHash VARCHAR(255) NOT NULL UNIQUE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP`,
    };

    for (const tableName in tables) {
      await connection.query(`DROP TABLE IF EXISTS ${tableName}`);
      await connection.query(`CREATE TABLE ${tableName} (${tables[tableName]})`);
      console.log(`Table ${tableName} created successfully.`);
    }

    console.log(`Database ${process.env.DB_DATABASE} reset and implementation successful!`);
  } catch (error) {
    console.error('Error resetting database:', error.sqlMessage || error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

module.exports = { resetDatabase };