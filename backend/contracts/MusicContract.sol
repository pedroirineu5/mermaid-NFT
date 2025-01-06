// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "contracts/OysterToken.sol";

contract MusicContract {

    OysterToken oysterTokenContract;
    OysterVault oysterVaultContract;

    uint256 public rightPurchaseValueInGwei;
    uint256 public valueForListeningInGwei;

    address public owner;
    mapping(address => uint8) public divisionOfRights;
    uint8 public remainingRightsDivision;
    address[] public rightHolders;
    bool public musicContactIsSealed;
    uint256 public balanceTokens;
    mapping(address => uint256) public tokensPerAddress;

    event assignedRight(address indexed addressRight, address indexed addressThisMusicContract, uint8 percentageOfRights);
    event withdrawalRight(address indexed addressRight, address indexed addressThisMusicContract, uint8 percentageOfRights);
    event musicWithSealedRights(address indexed addressThisMusicContract, bool musicContactIsSealed);
    event tokenAssigned(address indexed addressHolderToken, uint256 amountToken);
    event purchaseMade(address indexed purchaseAddress, bool activated);
    event musicHeard(address indexed hearAddress, bool confirm);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "This function can only be called by the owner address");
        _;
    }

    modifier isSealed() {
       require(musicContactIsSealed, "The contract is not sealed. This transaction can only be done with a sealed contract");
        _;
    }

    constructor(OysterToken _oysterTokenContract, OysterVault _oysterVaultContract, 
        uint256 _rightPurchaseValue, uint256 _valueForListening) {

        remainingRightsDivision = 100;
        oysterTokenContract = _oysterTokenContract;
        oysterVaultContract = _oysterVaultContract;
        rightPurchaseValueInGwei = _rightPurchaseValue;
        valueForListeningInGwei = _valueForListening;
        owner = msg.sender;

    }

    receive() external payable {}

    // Função para atribuir direitos da musica a um endereço
    function assignRights(address addressRight, uint8 percentageOfRights) external onlyOwner returns (bool) {
        require(!musicContactIsSealed, "The contract is already sealed, no modification of rights can be made");
        require(percentageOfRights > 0, "Percentage of rights must be greater than 0");
        require(percentageOfRights <= remainingRightsDivision, "percentage of entitlements remaining is less than the requested amount");

        if (divisionOfRights[addressRight] == 0) {
            rightHolders.push(addressRight);
        } 

        divisionOfRights[addressRight] += percentageOfRights;
        remainingRightsDivision -= percentageOfRights;

        emit assignedRight(addressRight, address(this), percentageOfRights);

        return true;
    }

    // Função para retirar direitos da musica de um endereço
    function withdrawRights(address addressRight, uint8 percentageOfRights) external onlyOwner returns (bool) {
        require(!musicContactIsSealed, "The contract is already sealed, no modification of rights can be made");
        require(divisionOfRights[addressRight] != 0, "No rights have been defined for this address");
        require(divisionOfRights[addressRight] >= percentageOfRights, "It is not possible to remove more rights than this address has");

        divisionOfRights[addressRight] -= percentageOfRights;
        remainingRightsDivision += percentageOfRights;

        if(divisionOfRights[addressRight] == 0) {
            removeRightHolder(addressRight);
        }

        emit withdrawalRight(addressRight, address(this), percentageOfRights);
        return true;
    }
    
    // Função para remover um dono de direito
    function removeRightHolder(address _address) internal {
        uint256 index = findIndex(_address);

        rightHolders[index] = rightHolders[rightHolders.length - 1];

        rightHolders.pop();
    }

    // Função para encontrar o índice de um endereço no array rightHolders
    function findIndex(address _address) internal view returns (uint256) {
        for (uint256 i = 0; i < rightHolders.length; i++) {
            if (rightHolders[i] == _address) {
                return i;
            }
        }

        return rightHolders.length;
    }

    // Função para selar os direitos da musica (impedir modificações)
    function sealRights() external onlyOwner returns (bool) {
        require(remainingRightsDivision == 0, "The remaining divisions of rights must be 0 to seal this contract");

        musicContactIsSealed = true;
        emit musicWithSealedRights(address(this), true);
        return true;
    }

    // Função para comprar 100 OysterTokens
    function buy100OysterToken() external payable isSealed returns (bool) {
        require(divisionOfRights[msg.sender] != 0, "This function cannot be called by anyone who does not have rights to the song");
        require(address(this).balance >= 5300000 * 1e9, "Insufficient Ether sent to buy tokens. Must have at least 0.0053 Ether");

        oysterTokenContract.buy100OSTToMusicContract{value: address(this).balance}();

        balanceTokens += 100;
        approveVaultTransfer(100);
        tokenSplit();

        return true;
    }  

    // Função para aprovar o OysterVault a transferir tokens
    function approveVaultTransfer(uint256 amount) internal returns (bool) {
        oysterTokenContract.approve(address(oysterVaultContract), amount);
        return true;
    }

    // Função para dividir os tokens entre os donos dos direitos da música
    function tokenSplit() internal returns (bool) {

        for (uint256 i = 0; i < rightHolders.length; i++) {
            tokensPerAddress[rightHolders[i]] += divisionOfRights[rightHolders[i]];      
            emit tokenAssigned(rightHolders[i], divisionOfRights[rightHolders[i]]);
        }

        return true;
    }

    // Função para vender Oyster Token
    function sellOysterToken(uint256 amount) external isSealed returns (bool) {
        require(divisionOfRights[msg.sender] != 0, "This function cannot be called by anyone who does not have rights to the song");
        require(amount > 0, "Number of tokens for requested transfer must be greater than 0");
        require(tokensPerAddress[msg.sender] >= amount, "Number of tokens unavailable");

        oysterTokenContract.sellOysterToken(msg.sender, amount);
        tokensPerAddress[msg.sender] -= amount;
        balanceTokens -= amount;

        return true;
    }

    // Função para comprar direitos 
    function buyRightsMusic() external payable isSealed returns (bool) {
        uint256 valueBuyRight = rightPurchaseValueInGwei * 1e9;
        require(msg.value >= valueBuyRight, "insufficient value to purchase the music rights");

        uint256 remainingValue = msg.value - valueBuyRight;
        emit purchaseMade(msg.sender, true);
        payable(msg.sender).transfer(remainingValue);
        
        return true;
    }

    // Função para ouvir musica
    function listenMusic() external payable isSealed returns (bool) {
        uint256 valueListen = valueForListeningInGwei * 1e9;
        require(msg.value >= valueListen, "insufficient value to listen the music rights");

        uint256 remainingValue = msg.value - valueListen;
        emit musicHeard(msg.sender, true);
        payable(msg.sender).transfer(remainingValue);
        
        return true;
    }

    // Função para ver o saldo desse contrato
    function viewBalance() external view returns (uint256) {
        return address(this).balance;
    }

}