const mysql = require('mysql2/promise');
require('dotenv').config();

async function createDatabaseIfNotExists() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
        });

        await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_DATABASE}`);
        await connection.end();
        console.log(`Database ${process.env.DB_DATABASE} checked/created.`);
    } catch (error) {
        console.error("Error creating database if not exists:", error);
        throw error;
    }
}

async function connectToDatabase() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE
        });

        console.log("Connected to MySQL database!");
        return connection;
    } catch (error) {
        console.error("Error connecting to MySQL database:", error);
        throw error;
    }
}

module.exports = { createDatabaseIfNotExists, connectToDatabase };