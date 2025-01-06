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
    event Log(string message);
    event LogAddress(string message, address addr);
    event LogUint(string message, uint256 value);
    event LogAddressUint(string message, address addr, uint256 value);

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

    function validateMusicContracts(address addressMusicContract) external onlyOwner {
        // Verifica se o endereço é um contrato
        uint256 codeSize;
        assembly {
            codeSize := extcodesize(addressMusicContract)
        }
        require(codeSize > 0, "Address is not a contract");

        // Tenta chamar a função getContractType() do MusicContract usando o seletor
        (bool success, bytes memory result) = addressMusicContract.staticcall(
            abi.encodeWithSelector(bytes4(keccak256("getContractType()")))
        );

        // Verifica se a chamada foi bem-sucedida e se o valor retornado é "MusicContract"
        require(success, "Call to getContractType failed");

        string memory contractType;
        if (result.length > 0) {
            contractType = abi.decode(result, (string));
        }

        require(keccak256(abi.encodePacked(contractType)) == keccak256(abi.encodePacked("MusicContract")), "Not a valid MusicContract");

        // Se a validação passar, marca o contrato como válido
        emit ValidatedMusicContract(addressMusicContract, true);
        validMusicContracts[addressMusicContract] = true;
    }

    function buyTokens(
        address musicContractAddress,
        uint256 amount
    ) external payable {
        emit Log("OysterToken: buyTokens called");
        emit LogAddress("by", msg.sender);
        emit LogAddress("for MusicContract", musicContractAddress);
        emit LogUint("amount", amount);
        require(
            validMusicContracts[musicContractAddress],
            "Invalid MusicContract address"
        );
        // Calcula o valor em wei baseado na quantidade de tokens
        uint256 weiAmount = amount * gweiPerToken;
        // Verifica se o remetente tem saldo suficiente em wei
        require(msg.value >= weiAmount, "Insufficient Wei sent");
        require(
            vault.viewTokensVault() >= amount,
            "Insufficient tokens in vault"
        );

        emit LogAddressUint(
            "OysterToken: Balance of MusicContract before purchase",
            musicContractAddress,
            IERC20(this).balanceOf(musicContractAddress)
        );
        emit LogAddressUint(
            "OysterToken: Balance of Vault before purchase",
            address(vault),
            vault.viewTokensVault()
        );

        // Transferir tokens do cofre para o MusicContract
        vault.sendToken(musicContractAddress, amount);

        // Chama a função purchaseTokens do MusicContract
        MusicContract(musicContractAddress).purchaseTokens(msg.sender, amount);

        emit LogAddressUint(
            "OysterToken: Balance of MusicContract after purchase",
            musicContractAddress,
            IERC20(this).balanceOf(musicContractAddress)
        );

        // Reembolsa o remetente se ele enviou mais wei do que o necessário
        if (msg.value > weiAmount) {
            payable(msg.sender).transfer(msg.value - weiAmount);
        }
        emit BuyTokens(msg.sender, amount);
    }
}