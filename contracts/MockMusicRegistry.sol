// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

contract MockMusicRegistry {
    event SongRegistered(address indexed artist, string songId, string metadataURI);
    event LicenseGranted(address indexed licensee, string songId, string licenseId);

    function registerSong(string memory songId, string memory metadataURI) public {
        emit SongRegistered(msg.sender, songId, metadataURI);
    }

    function grantLicense(string memory songId, string memory licenseId) public {
        emit LicenseGranted(msg.sender, songId, licenseId);
    }
}