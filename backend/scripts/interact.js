const hre = require("hardhat");

async function main() {
    const contractAddress = "0x45b4a52fE8dE462F2c2D437c45D5406c24aFAECb";

    const MockMusicRegistry = await hre.ethers.getContractFactory("MockMusicRegistry");
    const mockMusicRegistry = MockMusicRegistry.attach(contractAddress);

    // Simula o registro de uma música.
    const tx1 = await mockMusicRegistry.registerSong("song123", "ipfs://Qm...");
    await tx1.wait();
    console.log("Song registered:", tx1.hash);

    // Simula a concessão de uma licença.
    const tx2 = await mockMusicRegistry.grantLicense("song123", "license456");
    await tx2.wait();
    console.log("License granted:", tx2.hash);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });