// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./OysterToken.sol";

contract MusicContract is Ownable {
    IERC20 public oysterToken;
    OysterVault public vault;

    mapping(address => uint256) public tokensPerAddress;
    mapping(address => uint256) public rightAssigned;
    address[] public rightHolders;

    uint256 public remainingRights;
    bool public musicContactIsSealed;
    uint256 public gweiPerToken;

    event FullRightsAssigned(address indexed to, uint256 timestamp);
    event SellTokens(address indexed caller, uint256 amount);
    event TokensPurchased(address indexed buyer, uint256 amount);
    event RightsSealed(address indexed caller);

    constructor(IERC20 _oysterToken, address initialOwner, OysterVault _vault, uint256 _gweiPerToken) Ownable(initialOwner) {
        oysterToken = _oysterToken;
        vault = _vault;
        remainingRights = 100;
        musicContactIsSealed = false;
        gweiPerToken = _gweiPerToken;
    }

    function sealRights() external onlyOwner returns (bool) {
        require(remainingRights == 0, "The contract cannot be sealed until all rights have been assigned");
        require(!musicContactIsSealed, "The contract is already sealed");
        musicContactIsSealed = true;
        emit RightsSealed(msg.sender);
        return true;
    }

    function assignFullRights(address _to) external onlyOwner returns (bool) {
        require(!musicContactIsSealed, "The contract is already sealed, no modification of rights can be made");
        require(remainingRights > 0, "There are no rights left to assign");
        rightAssigned[_to] = 100;
        remainingRights = 0;
        rightHolders.push(_to);
        emit FullRightsAssigned(_to, block.timestamp);
        return true;
    }

    function getRightHolders() external view returns (address[] memory) {
        return rightHolders;
    }

    function getRemainingRightsDivision() external view returns (uint256) {
        return remainingRights;
    }

    function divisionOfRights(address _of) external view returns (uint256) {
        return rightAssigned[_of];
    }

    function viewTokensPerAddress(address _of) external view returns (uint256){
        return tokensPerAddress[_of];
    }

    function isMusicContractSealed() external view returns (bool) {
        return musicContactIsSealed;
    }

    function purchaseTokens(address buyer, uint256 amount) external {
        require(msg.sender == address(oysterToken), "Only OysterToken can call this function");
        tokensPerAddress[buyer] += amount;
        emit TokensPurchased(buyer, amount);
    }

    function sellTokens(uint256 amount) external payable {
        require(tokensPerAddress[msg.sender] >= amount, "Insufficient token balance");

        // Transferir os tokens do vendedor para o Vault
        tokensPerAddress[msg.sender] -= amount;
        require(oysterToken.transferFrom(msg.sender, address(vault), amount), "Token transfer failed");

        // Transferir Wei para o vendedor
        uint256 amountToTransfer = amount * gweiPerToken;
        payable(msg.sender).transfer(amountToTransfer);
        emit SellTokens(msg.sender, amount);
    }
}