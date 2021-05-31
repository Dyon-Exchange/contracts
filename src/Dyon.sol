// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "openzeppelin-solidity/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "openzeppelin-solidity/contracts/access/Ownable.sol";

contract Dyon is ERC1155Supply, Ownable {
  constructor() ERC1155("https://game.example/api/item/{id}.json") {}

  function mint(uint256 id, uint64 supply) public onlyOwner {
    require(exists(id) == false, "Id must not already exist");
    _mint(owner(), id, supply, "");
  }

  function mintToAddress(
    uint256 id,
    uint64 supply,
    address addr
  ) public onlyOwner {
    require(exists(id) == false, "Id must not already exist");
    _mint(addr, id, supply, "");
  }

  function burn(address account, uint256 id) external {
    require(account == _msgSender(), "Dyon: caller is not owner of tokens");

    uint256 supply = totalSupply(id);
    require(
      supply == balanceOf(account, id),
      "Dyon: Address must own all of token's supply"
    );
    _burn(account, id, supply);
  }
}
