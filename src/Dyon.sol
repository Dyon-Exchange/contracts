// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "openzeppelin-solidity/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "openzeppelin-solidity/contracts/access/Ownable.sol";

contract Dyon is ERC1155Supply, Ownable {
    constructor() ERC1155("https://game.example/api/item/{id}.json") {}

    /**
     * Mint tokens to contract owner
     */
    function mint(uint256 id, uint64 supply) public onlyOwner {
        require(exists(id) == false, "Id must not already exist");
        _mint(owner(), id, supply, "");
    }

    /**
     *  Mint tokens to the supplied address
     */
    function mintToAddress(
        address addr,
        uint256 id,
        uint64 supply
    ) public onlyOwner {
        require(exists(id) == false, "Id must not already exist");
        _mint(addr, id, supply, "");
    }

    /*
     * Burn tokens
     */
    function burn(
        address addr,
        uint256 id,
        uint256 amount
    ) external {
        require(addr == _msgSender(), "Dyon: caller is not owner of tokens");
        require(
            amount <= balanceOf(addr, id),
            "Dyon: Address must more or equal the amount of tokens being burned"
        );
        _burn(addr, id, amount);
    }
}
