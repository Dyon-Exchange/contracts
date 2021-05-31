import { HardhatUserConfig } from "hardhat/types";
import "hardhat-deploy";
import "hardhat-deploy-ethers";
import "@typechain/hardhat";
require("dotenv").config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.0",
  },
  namedAccounts: {
    deployer: 0,
  },
  paths: {
    sources: "src",
  },
  networks: {
    goerli: {
      url: `https://goerli.infura.io/v3/24d65073c1014b83ad15422c5971ac97`,
      accounts: [`0x${process.env.GOERLI_PRIVATE_KEY}`],
      gas: 5500000,
    },
  },
};
export default config;
