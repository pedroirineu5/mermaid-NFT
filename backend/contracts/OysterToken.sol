// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "./OysterVault.sol";

contract OysterToken is ERC20, Ownable, ERC20Permit {
    OysterVault public vault;
    mapping(address => bool) public validMusicContracts;

    event validatedMusicContract(address indexed _address, bool valid);
    event WeiRefunded(address indexed to, uint256 gweiAmount);

    modifier onlyValidMusicContract() {
        require(validMusicContracts[msg.sender], "This function can only be called by a valid MusicContract address");
        _;
    }

    constructor(address initialOwner)
        ERC20("OysterToken", "OST")
        Ownable(initialOwner)
        ERC20Permit("OysterToken")
    {}

    // Função para configurar o endereço do Vault após a implantação
    function setVault(OysterVault _vault) external onlyOwner {
        require(address(vault) == address(0), "Vault already set"); // Garante que o Vault ainda não foi definido
        require(address(_vault) != address(0), "Invalid vault address"); // Garante que o endereço do Vault é válido
        vault = _vault;
    }

    // Mint para o Vault
    function mintToVault(uint256 amount) external onlyOwner {
        require(address(vault) != address(0), "Vault address not set"); // Garante que o endereço do Vault foi definido
        _mint(address(vault), amount);
    }

    // Adicionar o endereço e validar de um contract de música
    function validateMusicContracts(address addressMusicContract) external onlyOwner returns (bool) {
        validMusicContracts[addressMusicContract] = true;

        emit validatedMusicContract(addressMusicContract, true);
        return true;
    }

    // Função de comprar 100 tokens para o contrato de musica
    function buy100OSTToMusicContract() external payable onlyValidMusicContract returns (bool) {
        require(msg.value >= 5200000, "Insufficient Wei sent to buy tokens");

        uint256 tokensToBuy = 100;
        uint256 gweiRequired = 5000000;
        uint256 remainingWei = msg.value - gweiRequired;

        require(vault.viewTokensVault() >= tokensToBuy, "Not enough tokens in OysterToken contract");

        vault.sendToken(msg.sender, tokensToBuy);

        // Convertendo o remainingWei para ether antes de enviá-lo de volta ao remetente.
        uint256 remainingEther = remainingWei / 1e18;
        payable(msg.sender).transfer(remainingEther);

        emit WeiRefunded(msg.sender, remainingWei);
        return true;
    }
}