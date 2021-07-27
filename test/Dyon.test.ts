import { expect } from "chai";
import { Dyon as TDyon } from "../typechain/Dyon";
import {
  ethers,
  deployments,
  getUnnamedAccounts,
  getNamedAccounts,
} from "hardhat";
import { setupUser, setupUsers } from "./utils";

// fungible token ids (see dyon token spec doc)
const F = [
  "10123162001060075000000003001001001",
  "10123162001060075035618695001001001",
  "10123162001060075008946515001001001",
];

// ntf token ids (see dyon token spec token)
const N = [
  "10123162001060075000000004001029001",
  "10123162001060075000000005031001003",
];

async function setup() {
  await deployments.fixture(["Dyon"]);

  const contracts = {
    Dyon: (await ethers.getContract("Dyon")) as TDyon,
  };

  const { deployer } = await getNamedAccounts();
  const users = await setupUsers(await getUnnamedAccounts(), contracts);

  return {
    ...contracts,
    users,
    contractOwner: await setupUser(deployer, contracts),
  };
}

describe("Dyon contract", function () {
  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { Dyon, contractOwner } = await setup();
      expect(await Dyon.owner()).equal(contractOwner.address);
    });
  });

  describe("Minting", function () {
    it("Mint tokens to contract owner", async function () {
      const { contractOwner, users } = await setup();

      await contractOwner.Dyon.mint(F[0], 10);

      const ownerBalance = await contractOwner.Dyon.balanceOf(
        contractOwner.address,
        F[0]
      );
      expect(ownerBalance).equal(10);

      const users0Balance = await contractOwner.Dyon.balanceOf(
        users[0].address,
        F[0]
      );
      expect(users0Balance).equal(0);
    });

    it("Mint tokens to user address", async function () {
      const { contractOwner, users } = await setup();

      await contractOwner.Dyon.mintToAddress(users[0].address, F[0], 10);

      const users0Balance = await users[0].Dyon.balanceOf(
        users[0].address,
        F[0]
      );
      const ownerBalance = await contractOwner.Dyon.balanceOf(
        contractOwner.address,
        F[0]
      );

      expect(ownerBalance).equal(0);
      expect(users0Balance).equal(10);
    });

    it("Should mint correct supply", async function () {
      const { contractOwner, users } = await setup();

      await contractOwner.Dyon.mint(F[1], 15);
      await contractOwner.Dyon.mint(F[0], 5);
      expect(
        await contractOwner.Dyon.balanceOf(contractOwner.address, F[0])
      ).equal(5);
      expect(
        await contractOwner.Dyon.balanceOf(contractOwner.address, F[1])
      ).equal(15);

      expect(await contractOwner.Dyon.totalSupply(F[1])).equal(15);
      expect(await contractOwner.Dyon.totalSupply(F[0])).equal(5);

      await contractOwner.Dyon.mintToAddress(users[0].address, F[2], 20);
      await contractOwner.Dyon.mintToAddress(users[0].address, N[0], 100);
      expect(await contractOwner.Dyon.balanceOf(users[0].address, F[2])).equal(
        20
      );
      expect(await contractOwner.Dyon.balanceOf(users[0].address, N[0])).equal(
        100
      );
    });

    it("Should not allow non-owner to mint tokens", async function () {
      const { users } = await setup();

      await expect(users[0].Dyon.mint(F[0], 10)).to.be.revertedWith(
        "revert Ownable: caller is not the owner"
      );
    });

    it("Should not mint tokens with the same id", async function () {
      const { contractOwner } = await setup();

      await contractOwner.Dyon.mint(F[0], 10);
      await contractOwner.Dyon.mint(F[1], 10);

      await expect(contractOwner.Dyon.mint(F[0], 10)).to.be.revertedWith(
        "Id must not already exist"
      );
    });
  });

  describe("Transactions", function () {
    it("Should transfer tokens between accounts", async function () {
      const { Dyon, users, contractOwner } = await setup();
      await contractOwner.Dyon.mint(F[0], 100);

      // Transfer 50 tokens from owner to users[0]
      await contractOwner.Dyon.safeTransferFrom(
        contractOwner.address,
        users[0].address,
        F[0],
        50,
        "0x00"
      );
      const users0Balance = await Dyon.balanceOf(users[0].address, F[0]);
      expect(users0Balance).to.equal(50);

      // Transfer 50 tokens from users[0] to users[1]
      // We use .connect(signer) to send a transaction from another account
      await users[0].Dyon.safeTransferFrom(
        users[0].address,
        users[1].address,
        F[0],
        50,
        "0x00"
      );
      const users1Balance = await Dyon.balanceOf(users[1].address, F[0]);
      expect(users1Balance).to.equal(50);
    });

    it("Should fail if sender doesn’t have enough tokens", async function () {
      const { Dyon, users, contractOwner } = await setup();
      await contractOwner.Dyon.mint(F[0], 100);

      const initialOwnerBalance = await Dyon.balanceOf(
        contractOwner.address,
        F[0]
      );

      // Try to send 1 token from users[0] (0 tokens) to owner (1000 tokens).
      // `require` will evaluate false and revert the transaction.
      await expect(
        users[0].Dyon.safeTransferFrom(
          users[0].address,
          contractOwner.address,
          F[0],
          1,
          "0x00"
        )
      ).to.be.revertedWith("revert ERC1155: insufficient balance for transfer");

      // Owner balance shouldn't have changed.
      expect(await Dyon.balanceOf(contractOwner.address, F[0])).to.equal(
        initialOwnerBalance
      );
    });

    it("Should update balances after transfers", async function () {
      const { Dyon, users, contractOwner } = await setup();

      await contractOwner.Dyon.mint(F[0], 50);

      await contractOwner.Dyon.safeTransferFrom(
        contractOwner.address,
        users[0].address,
        F[0],
        20,
        "0x00"
      );

      await contractOwner.Dyon.safeTransferFrom(
        contractOwner.address,
        users[1].address,
        F[0],
        10,
        "0x00"
      );

      const finalOwnerBalance = await Dyon.balanceOf(
        contractOwner.address,
        F[0]
      );
      expect(finalOwnerBalance).to.equal(50 - 30);

      const users0Balance = await Dyon.balanceOf(users[0].address, F[0]);
      expect(users0Balance).to.equal(20);

      const users1Balance = await Dyon.balanceOf(users[1].address, F[0]);
      expect(users1Balance).to.equal(10);
    });
  });

  describe("Redeem/Burn Tokens", function () {
    it("Should only allow tokens to be burned if user has enough to burn that amount", async function () {
      const { Dyon, users, contractOwner } = await setup();
      const user0 = users[0];
      const userBalance = (i: number, x: number) =>
        users[i].Dyon.balanceOf(users[i].address, F[x]);

      await contractOwner.Dyon.mintToAddress(user0.address, F[0], 100);
      expect(await userBalance(0, 0)).equal(100);
      await user0.Dyon.burn(user0.address, F[0], 100);
      expect(await userBalance(0, 0)).equal(0);

      const user1 = users[1];

      await contractOwner.Dyon.mintToAddress(user0.address, F[1], 200);
      await user0.Dyon.safeTransferFrom(
        user0.address,
        user1.address,
        F[1],
        100,
        "0x00"
      );
      expect(await userBalance(1, 1)).equal(100);
      expect(await Dyon.totalSupply(F[1])).equal(200);

      await expect(
        user0.Dyon.burn(user0.address, F[1], 200)
      ).to.be.revertedWith(
        "Dyon: Address must more or equal the amount of tokens being burned"
      );
    });

    it("Should not be able to burn more tokens than exists", async function () {
      const { users, contractOwner } = await setup();
      const [user0] = users;

      await contractOwner.Dyon.mintToAddress(user0.address, F[0], 100);
      await expect(
        user0.Dyon.burn(user0.address, F[1], 200)
      ).to.be.revertedWith(
        "Dyon: Address must more or equal the amount of tokens being burned"
      );
    });

    it("Should only allow holder of tokens to burn", async function () {
      const { users, contractOwner } = await setup();
      const [user0, user1] = users;

      await contractOwner.Dyon.mintToAddress(user0.address, F[0], 100);
      await expect(
        user1.Dyon.burn(user0.address, F[0], 100)
      ).to.be.revertedWith("Dyon: caller is not owner");
    });
  });
});
