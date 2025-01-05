// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "./OysterVault.sol";
import "./MusicContract.sol";

contract OysterToken is ERC20, Ownable, ERC20Permit {
    OysterVault public vault;
    mapping(address => bool) public validMusicContracts;
    uint256 public gweiPerToken;

    event ValidatedMusicContract(address indexed _address, bool valid);
    event SetVault(address indexed vault);
    event MintToVault(address indexed vault, uint256 amount);
    event BuyTokens(address indexed buyer, uint256 amount);

    constructor(address initialOwner, uint256 _gweiPerToken)
        ERC20("OysterToken", "OST")
        Ownable(initialOwner)
        ERC20Permit("OysterToken")
    {
        gweiPerToken = _gweiPerToken;
    }

    function setVault(OysterVault _vault) external onlyOwner {
        emit SetVault(address(_vault));
        require(address(_vault) != address(0), "Invalid vault address");
        require(address(vault) == address(0), "Vault already set");
        vault = _vault;
    }

    function mintToVault(uint256 amount) external onlyOwner {
        emit MintToVault(address(vault), amount);
        require(address(vault) != address(0), "Vault address not set");
        _mint(address(vault), amount);
    }

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    function validateMusicContracts(address addressMusicContract) external onlyOwner returns (bool) {
        emit ValidatedMusicContract(addressMusicContract, true);
        validMusicContracts[addressMusicContract] = true;
        return true;
    }

   function buyTokens(address musicContractAddress) external payable {
        require(validMusicContracts[musicContractAddress], "Invalid MusicContract address");
        uint256 amount = msg.value / gweiPerToken;
        require(vault.viewTokensVault() >= amount, "Insufficient tokens in vault");

        // Transferir tokens do vault para o comprador
        require(vault.sendToken(msg.sender, amount), "Token transfer from vault failed");

        // Notificar o MusicContract sobre a compra
        MusicContract(musicContractAddress).purchaseTokens(msg.sender, amount);
        emit BuyTokens(msg.sender, amount);
    }
}