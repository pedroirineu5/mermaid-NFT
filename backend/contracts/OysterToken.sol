// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract OysterToken is ERC20, Ownable {
    uint256 public constant GWEI_PER_TOKEN = 50000 * 1e9;

    address public vault;
    mapping(address => bool) public validMusicContracts;

    event BuyTokens(
        address indexed buyer,
        address indexed musicContract,
        uint256 amount
    );
    event Log(string message);
    event LogAddress(string message, address addr);
    event LogUint(string message, uint256 value);
    event OysterTokenDeployed(address initialOwner, uint256 gweiPerToken);
    event MusicContractValidated(address indexed musicContract, bool valid);
    event VaultSet(address indexed vault);

    constructor(address initialOwner)
        ERC20("OysterToken", "OST")
        Ownable(initialOwner)
    {
        emit OysterTokenDeployed(initialOwner, GWEI_PER_TOKEN);
    }

    function setVault(address _vault) external onlyOwner {
        emit VaultSet(_vault);
        vault = _vault;
    }

    function validateMusicContract(address _musicContract) external onlyOwner {
        require(_musicContract.code.length > 0, "Invalid MusicContract address");
        // Chama setOysterToken no MusicContract para validar e configurar
        (bool success, bytes memory data) = _musicContract.call(
            abi.encodeWithSignature("setOysterToken(address)", address(this))
        );
        require(success && data.length > 0, "Not a valid MusicContract");
        validMusicContracts[_musicContract] = true;
        emit MusicContractValidated(_musicContract, true);
    }

    function buyTokens(address _musicContract, uint256 _amount) external {
        emit Log("OysterToken: buyTokens called");
        emit LogAddress("by", msg.sender);
        emit LogAddress("for MusicContract", _musicContract);
        emit LogUint("amount", _amount);

        require(validMusicContracts[_musicContract], "Invalid MusicContract");

        emit Log("OysterToken: Before transferFrom");
        emit LogAddress("Vault", vault);
        emit LogAddress("MusicContract", _musicContract);
        emit LogUint("Amount", _amount);
        emit LogUint("Vault Balance", this.balanceOf(vault));
        emit LogUint("Allowance", this.allowance(vault, address(this)));

        // Verifica se o OysterVault tem saldo suficiente
        require(this.balanceOf(vault) >= _amount, "Insufficient vault balance");

        // Tenta a transferência e captura o resultado
        (bool success, bytes memory returnData) = address(this).call(
            abi.encodeWithSignature(
                "transferFrom(address,address,uint256)",
                vault,
                _musicContract,
                _amount
            )
        );

        // Emite logs com base no resultado
        if (success) {
            emit Log("OysterToken: transferFrom successful");
            if (returnData.length > 0) {
                emit Log("OysterToken: transferFrom return data");
            }
        } else {
            emit Log("OysterToken: transferFrom failed");
            if (returnData.length > 0) {
                emit Log("OysterToken: transferFrom revert reason:");
                // Tenta decodificar o revert reason, se possível
                if (returnData.length > 32) {
                    string memory revertReason = abi.decode(returnData, (string));
                    emit Log(revertReason);
                }
            }
        }

        require(success, "Token transfer failed");

        emit Log("OysterToken: After transferFrom");

        emit BuyTokens(msg.sender, _musicContract, _amount);
        emit Log("OysterToken: BuyTokens event emitted");
    }

    function mint(address to, uint256 amount) external onlyOwner {
        emit LogAddress("Minting to", to);
        emit LogUint("Minting amount", amount);
        _mint(msg.sender, amount);
    }

    function approve(
        address spender,
        uint256 amount
    ) public override returns (bool) {
        emit LogAddress("OysterToken: Approving spender", spender);
        emit LogUint("OysterToken: Approval amount", amount);
        emit LogAddress("OysterToken: Owner of approval", owner());
        emit LogAddress("OysterToken: msg.sender of approval", msg.sender);
        // Usar owner() em vez de msg.sender
        _approve(owner(), spender, amount);
        return true;
    }

    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) public override returns (bool) {
        emit LogAddress("OysterToken: transferFrom called by", msg.sender);
        emit LogAddress("OysterToken: transferFrom from", from);
        emit LogAddress("OysterToken: transferFrom to", to);
        emit LogUint("OysterToken: transferFrom amount", amount);
        bool result = super.transferFrom(from, to, amount);
        emit Log("OysterToken: transferFrom result: ");
        emit Log(result ? "true" : "false");
        return result;
    }
}