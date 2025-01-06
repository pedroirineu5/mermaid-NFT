// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MusicContract is Ownable {
    IERC20 public oysterToken;
    address public rightsHolder;
    bool public rightsSealed;

    mapping(address => uint256) public tokenBalances;

    event RightsAssigned(address indexed newRightsHolder);
    event RightsSealed();
    event TokensBought(address indexed buyer, uint256 amount);
    event TokensSold(address indexed seller, uint256 amount);
    event OysterTokenSet(address indexed oysterToken);
    event Log(string message);
    event LogAddress(string message, address addr);
    event LogUint(string message, uint256 value);

    constructor(address _oysterToken, address initialOwner) Ownable(initialOwner) {
        emit LogAddress("MusicContract: Owner", owner());
        emit OysterTokenSet(_oysterToken);
        oysterToken = IERC20(_oysterToken);
        rightsSealed = false; // Inicializado como false
    }

    function setOysterToken(address _oysterToken) external returns (bool) {
        emit Log("MusicContract: setOysterToken called");
        emit LogAddress("MusicContract: setOysterToken called with", _oysterToken);
        emit LogAddress("MusicContract: Current oysterToken", address(oysterToken));
        emit LogAddress("MusicContract: owner", owner());
        emit LogAddress("MusicContract: msg.sender", msg.sender);
        emit OysterTokenSet(_oysterToken);
        oysterToken = IERC20(_oysterToken);
        emit LogAddress("MusicContract: oysterToken address after", address(oysterToken));
        return true;
    }

    function assignFullRights(address _newRightsHolder) external onlyOwner {
        require(!rightsSealed, "Rights have been sealed");
        rightsHolder = _newRightsHolder;
        emit RightsAssigned(_newRightsHolder);
    }

    function sealRights() external onlyOwner {
        require(!rightsSealed, "Rights have already been sealed");
        rightsSealed = true;
        emit RightsSealed();
    }

    function buyTokens(uint256 _amount) external {
        emit Log("MusicContract: buyTokens called");
        emit LogAddress("by", msg.sender);
        emit LogUint("amount", _amount);
        require(
            address(oysterToken) != address(0),
            "OysterToken address not set"
        );
        emit Log("MusicContract: Before transfer");
        emit LogAddress("Sender", msg.sender);
        emit LogAddress("This", address(this));
        emit LogUint("Amount", _amount);

        // Log da transferência de tokens
        emit LogUint(
            "MusicContract: oysterToken.balanceOf(msg.sender) before",
            oysterToken.balanceOf(msg.sender)
        );
        emit LogUint(
            "MusicContract: oysterToken.balanceOf(address(this)) before",
            oysterToken.balanceOf(address(this))
        );
        emit LogUint(
            "MusicContract: oysterToken.allowance(msg.sender, address(this)) before",
            oysterToken.allowance(msg.sender, address(this))
        );

        oysterToken.transferFrom(msg.sender, address(this), _amount);

        emit Log("MusicContract: After transfer");
        emit LogUint(
            "MusicContract: oysterToken.balanceOf(msg.sender) after",
            oysterToken.balanceOf(msg.sender)
        );
        emit LogUint(
            "MusicContract: oysterToken.balanceOf(address(this)) after",
            oysterToken.balanceOf(address(this))
        );

        tokenBalances[msg.sender] += _amount;
        emit LogUint("MusicContract: tokenBalances[msg.sender]", tokenBalances[msg.sender]);
        emit TokensBought(msg.sender, _amount);
    }

    function sellTokens(uint256 _amount) external {
        require(tokenBalances[msg.sender] >= _amount, "Insufficient balance");
        tokenBalances[msg.sender] -= _amount;
        oysterToken.transfer(msg.sender, _amount);
        emit TokensSold(msg.sender, _amount);
    }

    function isSealed() external view returns (bool) {
        return rightsSealed;
    }
}