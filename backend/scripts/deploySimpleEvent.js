const hre = require("hardhat");

async function main() {
  const SimpleEvent = await hre.ethers.getContractFactory("SimpleEvent");
  const simpleEvent = await SimpleEvent.deploy();

  await simpleEvent.waitForDeployment();

  console.log("SimpleEvent deployed to:", await simpleEvent.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });