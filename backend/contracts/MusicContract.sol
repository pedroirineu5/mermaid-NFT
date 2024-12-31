// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "./OysterToken.sol";

contract MusicContract {
    OysterToken public oysterToken;
    address public owner;

    event BuyTokensCalled(address caller, uint256 amount, uint256 balance);
    event BuyTokensFailed(address caller, uint256 amount, string reason); // Adicionado para registrar falhas

    constructor(OysterToken _oysterToken) {
        oysterToken = _oysterToken;
        owner = msg.sender;
    }

    function buyTokens() external payable {
        uint256 balance = oysterToken.balanceOf(address(this));
        emit BuyTokensCalled(msg.sender, msg.value, balance);
        
        (bool success, ) = address(oysterToken).call{value: msg.value}(
            abi.encodeWithSignature("buy100OSTToMusicContract()")
        );

        if (!success) {
            emit BuyTokensFailed(msg.sender, msg.value, "buy100OSTToMusicContract call failed");
        }
    }

    function transferOwnership(address newOwner) external {
        require(msg.sender == owner, "Only the current owner can transfer ownership");
        require(newOwner != address(0), "New owner cannot be the zero address");
        owner = newOwner;
    }
}