// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "./OysterVault.sol";

contract OysterToken is ERC20, Ownable, ERC20Permit {
    OysterVault public vault;
    mapping(address => bool) public validMusicContracts;

    event ValidatedMusicContract(address indexed _address, bool valid); // Renomeado
    event WeiRefunded(address indexed to, uint256 gweiAmount);
    event Buy100OSTToMusicContractCalled(address caller, uint256 value);
    event Buy100OSTToMusicContractFailed(address caller, uint256 value, string reason);

    modifier onlyValidMusicContract() {
        require(validMusicContracts[msg.sender], "This function can only be called by a valid MusicContract address");
        _;
    }

    constructor(address initialOwner)
        ERC20("OysterToken", "OST")
        Ownable(initialOwner)
        ERC20Permit("OysterToken")
    {}

    function setVault(OysterVault _vault) external onlyOwner {
        require(address(vault) == address(0), "Vault already set");
        require(address(_vault) != address(0), "Invalid vault address");
        vault = _vault;
    }

    function mintToVault(uint256 amount) external onlyOwner {
        require(address(vault) != address(0), "Vault address not set");
        _mint(address(vault), amount);
    }

    function validateMusicContracts(address addressMusicContract) external onlyOwner returns (bool) {
        validMusicContracts[addressMusicContract] = true;

        emit ValidatedMusicContract(addressMusicContract, true);
        return true;
    }

    function buy100OSTToMusicContract() external payable onlyValidMusicContract returns (bool) {
        emit Buy100OSTToMusicContractCalled(msg.sender, msg.value);

        require(msg.value >= 5200000, "Insufficient Wei sent to buy tokens");

        uint256 tokensToBuy = 100;
        uint256 gweiRequired = 5000000;
        uint256 remainingWei = msg.value - gweiRequired;

        if (vault.viewTokensVault() < tokensToBuy) {
          emit Buy100OSTToMusicContractFailed(msg.sender, msg.value, "Not enough tokens in OysterToken contract");
          revert("Not enough tokens in OysterToken contract");
        }

        vault.sendToken(msg.sender, tokensToBuy);

        if(remainingWei > 0){
          payable(msg.sender).transfer(remainingWei);
        }

        emit WeiRefunded(msg.sender, remainingWei);
        return true;
    }
}