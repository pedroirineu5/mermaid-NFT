const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

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
  console.log(`OysterVault balance after minting: ${vaultBalance.toString()}`);

  const MusicContract = await hre.ethers.getContractFactory("MusicContract");
  const musicContract = await MusicContract.deploy(
    await oysterToken.getAddress()
  );
  await musicContract.waitForDeployment();
  console.log("MusicContract deployed to:", await musicContract.getAddress());

  const validateTx = await oysterToken.validateMusicContracts(
    await musicContract.getAddress()
  );
  await validateTx.wait();
  console.log(
    "MusicContract address validated in OysterToken contract"
  );

  const buyTokensAmount = hre.ethers.parseUnits("5200000", "wei");
  const buyTokensTx = await musicContract.buyTokens({
    value: buyTokensAmount,
  });
  await buyTokensTx.wait();
  console.log(
    `Tokens purchased through MusicContract. Transaction hash: ${buyTokensTx.hash}`
  );

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
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });