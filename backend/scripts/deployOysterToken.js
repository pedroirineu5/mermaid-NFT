const hre = require("hardhat");
const fs = require("fs");
const path = require("path");
const { updateEnvFile } = require("./updateEnv"); // Importando a função

async function isGanacheRunning() {
    try {
        await hre.ethers.provider.getNetwork();
        return true;
    } catch (error) {
        return false;
    }
}

async function main() {
    const deployer = (await hre.ethers.getSigners())[0];

    console.log("Deploying contracts with the account:", deployer.address);

    if (!(await isGanacheRunning())) {
        console.error(
            "Ganache is not running. Please start Ganache and try again."
        );
        process.exit(1);
    }

    const gweiPerToken = 50000 * 1e9;

    const OysterToken = await hre.ethers.getContractFactory("OysterToken");
    const oysterToken = await OysterToken.deploy(deployer.address, gweiPerToken);
    await oysterToken.waitForDeployment();
    console.log("OysterToken deployed to:", await oysterToken.getAddress());

    const OysterVault = await hre.ethers.getContractFactory("OysterVault");
    const oysterVault = await OysterVault.deploy(
        await oysterToken.getAddress(),
        deployer.address
    );
    await oysterVault.waitForDeployment();
    console.log("OysterVault deployed to:", await oysterVault.getAddress());

    const setVaultTx = await oysterToken.setVault(
        await oysterVault.getAddress()
    );
    await setVaultTx.wait();
    console.log("OysterVault address set in OysterToken contract");

    const mintAmount = hre.ethers.parseUnits("100000", 18);
    const mintTx = await oysterToken.mintToVault(mintAmount);
    await mintTx.wait();
    console.log(`Minted ${mintAmount} tokens to OysterVault`);

    const vaultBalance = await oysterToken.balanceOf(
        await oysterVault.getAddress()
    );
    console.log(
        `OysterVault balance after minting: ${vaultBalance.toString()}`
    );

    const MusicContract = await hre.ethers.getContractFactory("MusicContract");
    const musicContract = await MusicContract.deploy(
        await oysterToken.getAddress(),
        deployer.address,
        await oysterVault.getAddress(),
        gweiPerToken
    );
    await musicContract.waitForDeployment();
    console.log("MusicContract deployed to:", await musicContract.getAddress());

    // Autorizar endereços no OysterVault ANTES de validar
    const authorizeOysterTokenTx = await oysterVault.authorizeContract(
        await oysterToken.getAddress(),
        true
    );
    await authorizeOysterTokenTx.wait();
    console.log("OysterToken address authorized in OysterVault contract");

    const authorizeMusicContractTx = await oysterVault.authorizeContract(
        await musicContract.getAddress(),
        true
    );
    await authorizeMusicContractTx.wait();
    console.log("MusicContract address authorized in OysterVault contract");

    // Removida a chamada para validateMusicContracts

    const deployData = {
        network: hre.network.name,
        oysterToken: {
            address: await oysterToken.getAddress(),
            abi: oysterToken.interface.format("json"),
            gweiPerToken: gweiPerToken,
        },
        oysterVault: {
            address: await oysterVault.getAddress(),
            abi: oysterVault.interface.format("json"),
        },
        musicContract: {
            address: await musicContract.getAddress(),
            abi: musicContract.interface.format("json"),
        },
    };

    fs.writeFileSync(
        "deploy-data.json",
        JSON.stringify(deployData, null, 2)
    );
    console.log("Deployment data saved to deploy-data.json");

    // Chamando a função para atualizar o .env
    await updateEnvFile(deployData);
    console.log(".env file updated by deploy script");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });