const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

async function updateEnvFile(deployData) {
    const envPath = path.join(__dirname, "..", ".env");

    const envConfig = dotenv.parse(fs.readFileSync(envPath));

    envConfig.OYSTER_TOKEN_ADDRESS = deployData.oysterToken.address;
    envConfig.OYSTER_VAULT_ADDRESS = deployData.oysterVault.address;
    envConfig.MUSIC_CONTRACT_ADDRESS = deployData.musicContract.address;
    envConfig.GWEI_PER_TOKEN = deployData.oysterToken.gweiPerToken;

    const newEnvContent = Object.entries(envConfig)
        .map(([key, value]) => `${key}=${value}`)
        .join("\n");

    fs.writeFileSync(envPath, newEnvContent);

    console.log(".env file updated successfully!");
}

module.exports = { updateEnvFile };