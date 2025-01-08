const hre = require("hardhat");
const fs = require("fs");
const path = require("path");
const { createEnvFileIfNotExists, updateEnvFile } = require("./updateEnv");

async function main() {
    await createEnvFileIfNotExists();

    const [deployer] = await hre.ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);

    const OysterToken = await hre.ethers.getContractFactory("OysterToken");
    const oysterToken = await OysterToken.deploy(deployer.address);
    await oysterToken.waitForDeployment();
    const oysterTokenAddress = await oysterToken.getAddress();
    console.log("OysterToken deployed to:", oysterTokenAddress);

    const OysterVault = await hre.ethers.getContractFactory("OysterVault");
    const oysterVault = await OysterVault.deploy(
        oysterTokenAddress,
        deployer.address
    );
    await oysterVault.waitForDeployment();
    const oysterVaultAddress = await oysterVault.getAddress();
    console.log("OysterVault deployed to:", oysterVaultAddress);

    const setVaultTx = await oysterToken.setVault(oysterVaultAddress);
    await setVaultTx.wait();
    console.log("OysterVault address set in OysterToken contract");

    const mintAmount = hre.ethers.parseUnits("100000", 18);
    const mintTx = await oysterToken.mintToVault(mintAmount);
    await mintTx.wait();
    console.log(`Minted ${mintAmount} tokens to OysterVault`);

    const vaultBalance = await oysterToken.balanceOf(oysterVaultAddress);
    console.log(
        `OysterVault balance after minting: ${vaultBalance.toString()}`
    );

    const envPath = path.join(__dirname, "..", ".env");
    const envConfig = require("dotenv").config({ path: envPath }).parsed || {};

    const rightPurchaseValueInGwei = envConfig.RIGHT_PURCHASE_VALUE_IN_GWEI;
    const valueForListeningInGwei = envConfig.VALUE_FOR_LISTENING_IN_GWEI;

    const MusicContract = await hre.ethers.getContractFactory("MusicContract");
    const musicContract = await MusicContract.deploy(
        oysterTokenAddress,
        oysterVaultAddress,
        rightPurchaseValueInGwei,
        valueForListeningInGwei
    );
    await musicContract.waitForDeployment();
    const musicContractAddress = await musicContract.getAddress();

    // Ler o bytecode do arquivo de artefatos
    const musicContractArtifactPath = path.join(__dirname, "../artifacts/contracts/MusicContract.sol/MusicContract.json");
    const musicContractArtifact = JSON.parse(fs.readFileSync(musicContractArtifactPath, "utf-8"));
    const musicContractBytecode = musicContractArtifact.bytecode;

    console.log("MusicContract deployed to:", musicContractAddress);

    const validateMusicContractTx =
        await oysterToken.validateMusicContracts(musicContractAddress);
    await validateMusicContractTx.wait();
    console.log("MusicContract address validated in OysterToken contract");

    const deployData = {
        network: hre.network.name,
        oysterToken: {
            address: oysterTokenAddress,
            abi: JSON.parse(oysterToken.interface.formatJson()),
        },
        oysterVault: {
            address: oysterVaultAddress,
            abi: JSON.parse(oysterVault.interface.formatJson()),
        },
        musicContract: {
            address: musicContractAddress,
            abi: JSON.parse(musicContract.interface.formatJson()),
            bytecode: musicContractBytecode, // Usando o bytecode do arquivo de artefatos
        },
        rightPurchaseValueInGwei: rightPurchaseValueInGwei,
        valueForListeningInGwei: valueForListeningInGwei,
    };

    fs.writeFileSync(
        "deploy-data.json",
        JSON.stringify(deployData, null, 2)
    );
    console.log("Deployment data saved to deploy-data.json");

    await updateEnvFile(deployData);
    console.log(".env file updated by deploy script");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });