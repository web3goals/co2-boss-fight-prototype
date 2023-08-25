import { ethers } from "hardhat";
import { Boss__factory } from "../../typechain-types/factories/contracts";

async function main() {
  console.log("👟 Start to deploy boss contract");

  // Define contract deployer
  const accounts = await ethers.getSigners();
  const deployer = accounts[0];

  // Deploy contract
  const contract = await new Boss__factory(deployer).deploy({});
  await contract.waitForDeployment();
  console.log(`✅ Contract deployed to ${contract.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
