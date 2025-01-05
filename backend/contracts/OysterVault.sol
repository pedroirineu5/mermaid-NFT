// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract OysterVault is Ownable {
    IERC20 public oysterToken;
    mapping(address => bool) public authorizedContracts;

    event TokensDistributed(address indexed to, uint256 amount);
    event TokensRecieved(address indexed from, uint256 amount);
    event WeiRefunded(address indexed to, uint256 weiAmount);
    event SendToken(address indexed _to, uint256 amount);
    event ReceiveTokens(address indexed holder, uint256 amount);
    event ContractAuthorized(address indexed contractAddress, bool authorized);
    event Log(string message);
    event LogAddress(string message, address addr);
    event LogUint(string message, uint256 value);
    event LogAddressUint(string message, address addr, uint256 value);

    modifier onlyOysterToken() {
        require(
            msg.sender == address(oysterToken) || owner() == msg.sender,
            "This function can only be called by the oysterToken address or owner"
        );
        _;
    }

    modifier onlyAuthorizedContracts() {
        emit LogAddress("onlyAuthorizedContracts called by", msg.sender);
        require(
            authorizedContracts[msg.sender],
            "Unauthorized contract"
        );
        _;
    }

    constructor(
        IERC20 _oysterToken,
        address initialOwner
    )
        Ownable(initialOwner)
    {
        oysterToken = _oysterToken;
    }

    function sendToken(
        address _to,
        uint256 amount
    ) external onlyAuthorizedContracts returns (bool) {
        emit Log("OysterVault: sendToken called");
        emit LogAddress("by", msg.sender);
        emit LogAddress("to", _to);
        emit LogUint("amount", amount);
        emit SendToken(_to, amount);
        require(amount > 0, "Amount must be greater than zero");
        require(
            oysterToken.balanceOf(address(this)) >= amount,
            "Vault does not have enough tokens"
        );
        require(
            oysterToken.transfer(_to, amount),
            "Token transfer failed"
        );

        emit TokensDistributed(_to, amount);
        emit Log("OysterVault: TokensDistributed event emitted");
        return true;
    }

    function receiveTokens(
        address holder,
        uint256 amount
    ) external onlyAuthorizedContracts returns (bool) {
        emit Log("OysterVault: receiveTokens called");
        emit LogAddress("by", msg.sender);
        emit LogAddress("holder", holder);
        emit LogUint("amount", amount);
        emit LogAddressUint(
            "OysterVault: Balance of holder before transfer",
            holder,
            oysterToken.balanceOf(holder)
        );
        require(
            oysterToken.transferFrom(holder, address(this), amount),
            "Token transfer failed"
        );
        emit TokensRecieved(holder, amount);
        emit Log("OysterVault: TokensRecieved event emitted");
        return true;
    }

    function viewTokensVault() external view returns (uint256) {
        return oysterToken.balanceOf(address(this));
    }

    function authorizeContract(
        address contractAddress,
        bool authorize
    ) external onlyOwner {
        emit LogAddress("OysterVault: Authorizing contract", contractAddress);
        authorizedContracts[contractAddress] = authorize;
        emit ContractAuthorized(contractAddress, authorize);
    }
}