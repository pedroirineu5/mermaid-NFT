const hre = require("hardhat");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const { updateEnvFile } = require("./updateEnv"); // Importar a função

async function isGanacheRunning() {
  try {
    await hre.ethers.provider.getNetwork();
    return true;
  } catch (error) {
    return false;
  }
}

// Função para copiar o deploy-data.json para o diretório backend
function copyDeployDataToBackend() {
    const sourcePath = path.join(__dirname, "..", "deploy-data.json");
    const destinationPath = path.join(__dirname, "..", "backend", "deploy-data.json");
  
    try {
      fs.copyFileSync(sourcePath, destinationPath);
      console.log("deploy-data.json copied to backend directory.");
    } catch (error) {
      console.error("Error copying deploy-data.json:", error);
    }
}

async function main() {
    const [deployer] = await hre.ethers.getSigners();
  
    console.log("Deploying contracts with the account:", deployer.address);
  
    // Verificar se o Ganache está rodando
    if (!(await isGanacheRunning())) {
      console.error("Ganache is not running. Please start Ganache and try again.");
      process.exit(1);
    }
  
    const OysterToken = await hre.ethers.getContractFactory("OysterToken");
    const oysterToken = await OysterToken.deploy(deployer.address);
    await oysterToken.waitForDeployment();
    console.log("OysterToken deployed to:", await oysterToken.getAddress());
  
    const OysterVault = await hre.ethers.getContractFactory("OysterVault");
    const oysterVault = await OysterVault.deploy(
      await oysterToken.getAddress(),
      deployer.address
    );
    await oysterVault.waitForDeployment();
    console.log("OysterVault deployed to:", await oysterVault.getAddress());
  
    const setVaultTx = await oysterToken.setVault(await oysterVault.getAddress());
    await setVaultTx.wait();
    console.log("OysterVault address set in OysterToken contract");
  
    const mintAmount = hre.ethers.parseUnits("10000", 18);
    const mintTx = await oysterToken.mintToVault(mintAmount);
    await mintTx.wait();
    console.log(`Minted ${mintAmount} tokens to OysterVault`);
  
    const vaultBalance = await oysterToken.balanceOf(
      await oysterVault.getAddress()
    );
    console.log(
      `OysterVault balance after minting: ${vaultBalance.toString()}`
    );
  
    // Valores para os parâmetros do MusicContract (em Gwei)
    const rightPurchaseValue = hre.ethers.parseUnits("5000000", "gwei"); 
    const valueForListening = hre.ethers.parseUnits("1000", "gwei");
  
    const MusicContract = await hre.ethers.getContractFactory("MusicContract");
    const musicContract = await MusicContract.deploy(
      await oysterToken.getAddress(),
      deployer.address, // _owner
      rightPurchaseValue, // _rightPurchaseValue
      valueForListening  // _valueForListening
    );
    await musicContract.waitForDeployment();
    console.log("MusicContract deployed to:", await musicContract.getAddress());
  
    const validateTx = await oysterToken.validateMusicContracts(
      await musicContract.getAddress()
    );
    await validateTx.wait();
    console.log("MusicContract address validated in OysterToken contract");
  
    const deployData = {
      network: hre.network.name,
      oysterToken: {
        address: await oysterToken.getAddress(),
        abi: oysterToken.interface.format("json"),
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
  
    // Copiar deploy-data.json para o diretório backend
    copyDeployDataToBackend();

    // Atualizar o arquivo .env
    await updateEnvFile(deployData);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });