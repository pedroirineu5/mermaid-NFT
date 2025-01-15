const mysql = require('mysql2/promise');
require('dotenv').config();

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

module.exports = { connectToDatabase };