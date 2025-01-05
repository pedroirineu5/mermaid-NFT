// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./OysterToken.sol";
import "./OysterVault.sol";

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

    event Log(string message);
    event LogAddress(string message, address addr);
    event LogUint(string message, uint256 value);

    constructor(IERC20 _oysterToken, address initialOwner, OysterVault _vault, uint256 _gweiPerToken) Ownable(initialOwner) {
        oysterToken = _oysterToken;
        vault = _vault;
        remainingRights = 100;
        musicContactIsSealed = false;
        gweiPerToken = _gweiPerToken;
        // Aprovar o próprio contrato a gastar os seus tokens
        oysterToken.approve(address(this), type(uint).max);
    }

    function sealRights() external onlyOwner returns (bool) {
        emit Log("MusicContract: sealRights called");
        emit LogAddress("by", msg.sender);
        require(remainingRights == 0, "The contract cannot be sealed until all rights have been assigned");
        require(!musicContactIsSealed, "The contract is already sealed");
        musicContactIsSealed = true;
        emit RightsSealed(msg.sender);
        emit Log("MusicContract: RightsSealed event emitted");
        return true;
    }

    function assignFullRights(address _to) external onlyOwner returns (bool) {
        emit Log("MusicContract: assignFullRights called");
        emit LogAddress("by", msg.sender);
        emit LogAddress("to", _to);
        require(!musicContactIsSealed, "The contract is already sealed, no modification of rights can be made");
        require(remainingRights > 0, "There are no rights left to assign");
        rightAssigned[_to] = 100;
        remainingRights = 0;
        rightHolders.push(_to);
        emit FullRightsAssigned(_to, block.timestamp);
        emit Log("MusicContract: FullRightsAssigned event emitted");
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
        emit Log("MusicContract: purchaseTokens called");
        emit LogAddress("by", msg.sender);
        emit LogAddress("for buyer", buyer);
        emit LogUint("amount", amount);
        require(msg.sender == address(oysterToken), "Only OysterToken can call this function");
        // Aprova o vault a gastar tokens do MusicContract
        require(oysterToken.approve(address(vault), amount), "Approval failed");
        // Adiciona chamada do vault para receber os tokens
        require(vault.receiveTokens(address(this), amount), "Token transfer failed");
        tokensPerAddress[buyer] += amount;
        emit TokensPurchased(buyer, amount);
        emit Log("MusicContract: TokensPurchased event emitted");
    }

    function sellTokens(uint256 amount) external payable {
        emit Log("MusicContract: sellTokens called");
        emit LogAddress("by", msg.sender);
        emit LogUint("amount", amount);
        require(amount > 0, "Amount must be greater than zero");
        require(tokensPerAddress[msg.sender] >= amount, "Insufficient token balance");
        emit Log("MusicContract: Approving vault to spend tokens");
        // Aprova o vault a gastar a quantidade correta de tokens do MusicContract
        // Vai ser aprovado no teste
        // require(oysterToken.approve(address(vault), amount), "Approval failed");
        emit Log("MusicContract: Approved vault to spend tokens");
        tokensPerAddress[msg.sender] -= amount;
        emit LogUint("MusicContract: Tokens remaining for user", tokensPerAddress[msg.sender]);

        // Em vez de transferir diretamente, chamar receiveTokens do vault
        emit Log("MusicContract: Calling receiveTokens on vault");
        require(vault.receiveTokens(address(this), amount), "Token transfer failed");
        emit Log("MusicContract: receiveTokens called on vault");

        // Calcula o valor em Wei a ser transferido para o vendedor
        uint256 amountToTransfer = amount * gweiPerToken;
        emit LogUint("MusicContract: Amount to transfer in Wei", amountToTransfer);
        emit Log("MusicContract: Transferring Wei to seller");
        // Transfere o valor em Wei para o vendedor
        payable(msg.sender).transfer(amountToTransfer);
        emit Log("MusicContract: Transferred Wei to seller");
        emit SellTokens(msg.sender, amount);
        emit Log("MusicContract: SellTokens event emitted");
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        return oysterToken.approve(spender, amount);
    }
}