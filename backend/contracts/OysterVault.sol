// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract OysterVault is Ownable {
    IERC20 public oysterToken;

    event TokensDistributed(address indexed to, uint256 amount);
    event TokensRecieved(address indexed from, uint256 amount);
    event WeiRefunded(address indexed to, uint256 weiAmount);
    event SendToken(address indexed _to, uint256 amount);
    event ReceiveTokens(address indexed holder, uint256 amount);

    modifier onlyOysterToken() {
        require(msg.sender == address(oysterToken) || owner() == msg.sender, "This function can only be called by the oysterToken address or owner");
        _;
    }

    constructor(IERC20 _oysterToken, address initialOwner) Ownable(initialOwner) {
        oysterToken = _oysterToken;
    }

    function sendToken(address _to, uint256 amount) external returns (bool) {
        emit SendToken(_to, amount);
        require(amount > 0, "Amount must be greater than zero");
        require(
            oysterToken.balanceOf(address(this)) >= amount,
            "Vault does not have enough tokens"
        );
         require(
            oysterToken.transfer( _to, amount),
            "Token transfer failed"
        );

        emit TokensDistributed(_to, amount);
        return true;
    }

   function receiveTokens(address holder, uint256 amount) external onlyOysterToken returns (bool) {
        emit ReceiveTokens(holder, amount);
        require(oysterToken.transferFrom(holder, address(this), amount), "Token transfer failed");
        emit TokensRecieved(holder, amount);
        return true;
    }

    function viewTokensVault() external view returns (uint256) {
        return oysterToken.balanceOf(address(this));
    }
}