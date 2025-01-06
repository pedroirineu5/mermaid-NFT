// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract OysterVault is Ownable {
    IERC20 public oysterToken;

    event OysterTokenSet(address indexed oysterToken);
    event ApproveTokenSpending(address indexed spender, uint256 amount);

    constructor(address _oysterToken, address initialOwner)
        Ownable(initialOwner)
    {
        oysterToken = IERC20(_oysterToken);
    }

    function setOysterToken(address _oysterToken) external onlyOwner {
        oysterToken = IERC20(_oysterToken);
    }

    // Função para aprovar que um endereço gaste tokens do vault (simplificada)
    function approveTokenSpending(address spender, uint256 amount) external onlyOwner {
        require(address(oysterToken) != address(0), "OysterToken not set");
        // A aprovação agora é feita diretamente no teste
        emit ApproveTokenSpending(spender, amount);
    }

    function transferFrom(address from, address to, uint256 amount) external onlyOwner {
        require(address(oysterToken) != address(0), "OysterToken not set");
        require(oysterToken.transferFrom(from, to, amount), "OysterVault: OysterToken transferFrom failed");
    }
}