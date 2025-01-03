require("@nomicfoundation/hardhat-toolbox");
 
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
     version: "0.8.28",
     settings: {
       optimizer: {
         enabled: true,
         runs: 200
       }
     }
  },
  networks: {
  localhost: {
      url: "http://127.0.0.1:7545",
      chainId: 1337,
  },
  },
  paths: {
  artifacts: "./artifacts",
  },
};