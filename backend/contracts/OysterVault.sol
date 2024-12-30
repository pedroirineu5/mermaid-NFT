// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./OysterToken.sol";

contract OysterVault is Ownable {
    OysterToken public oysterToken;

    event TokensDistributed(address indexed to, uint256 amount);

    modifier onlyOysterToken() {
        require(msg.sender == address(oysterToken), "This function can only be called by the OysterToken address");
        _;
    }

    constructor(OysterToken _oysterToken, address initialOwner) Ownable(initialOwner) {
        oysterToken = _oysterToken;
    }

    function sendToken(address to, uint256 amount) external onlyOysterToken returns (bool) {
        require(amount > 0, "Amount must be greater than zero");
        require(
            oysterToken.balanceOf(address(this)) >= amount,
            "Vault does not have enough tokens"
        );
        require(
            oysterToken.transfer(to, amount),
            "Token transfer failed"
        );

        emit TokensDistributed(to, amount);
        return true;
    }

    function viewTokensVault() external view returns (uint256) {
        return oysterToken.balanceOf(address(this));
    }
}