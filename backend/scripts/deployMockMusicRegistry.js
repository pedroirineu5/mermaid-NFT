const hre = require("hardhat");

async function main() {
    const MockMusicRegistry = await hre.ethers.getContractFactory("MockMusicRegistry");
    const mockMusicRegistry = await MockMusicRegistry.deploy();

    await mockMusicRegistry.waitForDeployment();

    console.log("MockMusicRegistry deployed to:", await mockMusicRegistry.getAddress());
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });