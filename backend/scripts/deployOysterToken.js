const hre = require("hardhat");
const fs = require("fs");
const path = require("path");
const { updateEnvFile } = require("./updateEnv");

async function main() {
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

    const rightPurchaseValueInGwei = process.env.RIGHT_PURCHASE_VALUE_IN_GWEI;
    const valueForListeningInGwei = process.env.VALUE_FOR_LISTENING_IN_GWEI;

    const MusicContract = await hre.ethers.getContractFactory("MusicContract");
    const musicContract = await MusicContract.deploy(
        oysterTokenAddress,
        oysterVaultAddress,
        rightPurchaseValueInGwei,
        valueForListeningInGwei
    );
    await musicContract.waitForDeployment();
    const musicContractAddress = await musicContract.getAddress();
    console.log("MusicContract deployed to:", musicContractAddress);

    const validateMusicContractTx = await oysterToken.validateMusicContracts(musicContractAddress);
    await validateMusicContractTx.wait();
    console.log("MusicContract address validated in OysterToken contract");

    const deployData = {
        network: hre.network.name,
        oysterToken: {
            address: oysterTokenAddress,
            abi: oysterToken.interface.format("json"),
        },
        oysterVault: {
            address: oysterVaultAddress,
            abi: oysterVault.interface.format("json"),
        },
        musicContract: {
            address: musicContractAddress,
            abi: musicContract.interface.format("json"),
        },
        rightPurchaseValueInGwei: rightPurchaseValueInGwei,
        valueForListeningInGwei: valueForListeningInGwei
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