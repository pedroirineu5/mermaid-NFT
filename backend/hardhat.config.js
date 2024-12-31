require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.28",
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