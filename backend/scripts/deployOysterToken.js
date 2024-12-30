const hre = require('hardhat');

async function main() {
    const [deployer] = await hre.ethers.getSigners();

    console.log('Deploying contracts with the account:', deployer.address);

    const OysterToken = await hre.ethers.getContractFactory('OysterToken');
    const oysterToken = await OysterToken.deploy(deployer.address);

    await oysterToken.waitForDeployment();

    console.log('OysterToken deployed to:', await oysterToken.getAddress());
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });