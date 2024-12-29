// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

contract SimpleEvent {
    event SimpleEventEmitted(uint256 indexed value);

    function emitEvent(uint256 value) public {
        emit SimpleEventEmitted(value);
    }
}