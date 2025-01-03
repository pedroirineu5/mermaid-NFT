// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

contract OysterToken is ERC20, Ownable, ERC20Permit {
    OysterVault public vault;
    mapping(address => bool) public validMusicContracts;

    uint256 public businessRateWei = 200_000 * 1e9; // Variável pública para businessRateWei
    uint256 public gweiPerToken = 50_000; // Variável pública para gweiPerToken

    event validatedMusicContract(address indexed _address, bool valid);
    event WeiRefunded(address indexed to, uint256 weiAmount);
    event transferViaTokenSale(address indexed to, uint256 weiAmount);

    // Removendo o modifier onlyValidMusicContract
    // modifier onlyValidMusicContract() {
    //     require(validMusicContracts[msg.sender], "This function can only be called by the valid MusicContract address");
    //     _;
    // }

    constructor(address initialOwner)
        ERC20("OysterToken", "OST")
        Ownable(initialOwner)
        ERC20Permit("OysterToken")
    {}

    // Função para configurar o endereço do Vault após a implantação
    function setVault(OysterVault _vault) external onlyOwner {
        require(address(_vault) != address(0), "Invalid vault address");  // Verificar se o novo endereço do vault é válido
        require(address(vault) == address(0), "Vault already set");        // Verificar se o vault já foi configurado
        vault = _vault;
    }

    // Mint para o Vault
    function mintToVault(uint256 amount) external onlyOwner {
        require(address(vault) != address(0), "Vault address not set");
        _mint(address(vault), amount);
    }

    // Adicionar o endereço e validar de um contract de música
    function validateMusicContracts(address addressMusicContract) external onlyOwner returns (bool) {
        validMusicContracts[addressMusicContract] = true;

        emit validatedMusicContract(addressMusicContract, true);
        return true;
    }

    // Função de comprar 100 tokens para o contrato de música (modificada)
    function buy100OSTToMusicContract(address _musicContractAddress) external payable returns (bool) {
        //Verifica se o contrato de música é válido
        require(validMusicContracts[_musicContractAddress], "Invalid MusicContract address");

        uint256 weiRequired = 100 * gweiPerToken * 1e9 + businessRateWei;

        require(msg.value >= weiRequired, "Insufficient Wei sent to buy tokens");

        uint256 remainingWei = msg.value - weiRequired;

        // Garante que há tokens suficientes no vault antes de continuar
        require(vault.viewTokensVault() >= 100, "Not enough tokens in OysterToken contract");

        // Transfere o troco antes de realizar outras operações externas
        if (remainingWei > 0) {
            (bool success, ) = payable(msg.sender).call{value: remainingWei}("");
            require(success, "Failed to send remaining Ether");
        }

        // Garante a transferência de tokens
        vault.sendToken(msg.sender, 100);

        emit WeiRefunded(msg.sender, remainingWei);
        return true;
    }

    // Função para vender tokens
    function sellOysterToken(address holder, uint256 amount) external payable returns (bool) {
        require(amount > 0, "Amount must be greater than zero");

        vault.receiveTokens(msg.sender, amount);
        uint256 tokenValueInWei = 50000 * 1e9;
        uint256 amountTransfer = tokenValueInWei * amount;
        payable(holder).transfer(amountTransfer);

        emit transferViaTokenSale(holder, amountTransfer);
    }

    // Getter para businessRateWei
    function getBusinessRateWei() public view returns (uint256) {
        return businessRateWei;
    }

    // Getter para gweiPerToken
    function getGweiPerToken() public view returns (uint256) {
        return gweiPerToken;
    }
}

contract OysterVault is Ownable {
    IERC20 public oysterToken;

    event TokensDistributed(address indexed to, uint256 amount);
    event TokensRecieved(address indexed from, uint256 amount);
    event WeiRefunded(address indexed to, uint256 weiAmount);

    modifier onlyOysterToken() {
        require(msg.sender == address(oysterToken), "This function can only be called by the oysterToken address");
        _;
    }

    constructor(IERC20 _oysterToken, address initialOwner) Ownable(initialOwner) {
        oysterToken = _oysterToken;
    }

    function sendToken(address musicContract, uint256 amount) external onlyOysterToken returns (bool) {
        require(amount > 0, "Amount must be greater than zero");
        require(
            oysterToken.balanceOf(address(this)) >= amount,
            "Vault does not have enough tokens"
        );
        require(
            oysterToken.transfer(musicContract, amount),
            "Token transfer failed"
        );

        emit TokensDistributed(musicContract, amount);
        return true;
    }

    function receiveTokens(address musicContract, uint256 amount) external onlyOysterToken returns (bool) {
        bool success = IERC20(oysterToken).transferFrom(musicContract, address(this), amount);

        require(success, "Token transfer failed");

        emit TokensRecieved(musicContract, amount);
        return true;
    }

    function viewTokensVault() external view returns (uint256) {
        return oysterToken.balanceOf(address(this));
    }
}