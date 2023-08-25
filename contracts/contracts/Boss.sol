// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @notice A contract that stores bosses.
 */
contract Boss is ERC721URIStorage {
    using Counters for Counters.Counter;

    event URISet(uint256 indexed tokenId, string tokenURI);

    Counters.Counter private _counter;

    constructor() ERC721("CO2 Boss Fight - Bosses", "CO2B") {}

    /// **************************
    /// ***** USER FUNCTIONS *****
    /// **************************

    function create(string memory tokenURI) public {
        // Update counter
        _counter.increment();
        // Mint token
        uint256 tokenId = _counter.current();
        _mint(msg.sender, tokenId);
        // Set URI
        _setURI(tokenId, tokenURI);
    }

    /// ***********************************
    /// ***** EXTERNAL VIEW FUNCTIONS *****
    /// ***********************************

    function getCurrentCounter() public view returns (uint) {
        return _counter.current();
    }

    /// ******************************
    /// ***** INTERNAL FUNCTIONS *****
    /// ******************************

    function _setURI(uint256 tokenId, string memory tokenURI) private {
        _setTokenURI(tokenId, tokenURI);
        emit URISet(tokenId, tokenURI);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 firstTokenId,
        uint256 batchSize
    ) internal virtual override(ERC721) {
        super._beforeTokenTransfer(from, to, firstTokenId, batchSize);
        // Disable transfers except minting
        if (from != address(0)) revert("Token not transferable");
    }
}
