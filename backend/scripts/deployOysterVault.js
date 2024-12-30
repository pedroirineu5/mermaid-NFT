const hre = require('hardhat');
const oysterTokenContract = require('../artifacts/contracts/OysterToken.sol/OysterToken.json');

async function main() {
    const [deployer] = await hre.ethers.getSigners();

    console.log('Deploying contracts with the account:', deployer.address);

    const networkId = await hre.ethers.provider.getNetwork();
    const deployerOysterTokenAddress = oysterTokenContract.networks[networkId].address;

    console.log('OysterToken Address:', deployedOysterTokenAddress);
    const OysterVault = await hre.ethers.getContractFactory('OysterVault');
    const oysterVault = await OysterVault.deploy(deployedOysterTokenAddress, deployer.address);

    await oysterVault.waitForDeployment();

    console.log('OysterVault deployed to:', await oysterVault.getAddress());
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });