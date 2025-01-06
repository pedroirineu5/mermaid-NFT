import { ethers } from 'ethers';
import OysterTokenABI from '../../../backend/artifacts/contracts/OysterToken.sol/OysterToken.json';
import MusicContractABI from '../../../backend/artifacts/contracts/MusicContract.sol/MusicContract.json';
import OysterVaultABI from '../../../backend/artifacts/contracts/OysterToken.sol/OysterVault.json';
import deployData from '../../../backend/deploy-data.json';

// Conectando ao provedor local do Hardhat
const provider = new ethers.JsonRpcProvider(
    import.meta.env.VITE_HARDHAT_PROVIDER_URL
);

// Obtendo os endereços dos contratos do deploy-data.json
const oysterTokenAddress = deployData.oysterToken.address;
const musicContractAddress = deployData.musicContract.address;
const oysterVaultAddress = deployData.oysterVault.address;

// Criando as instâncias dos contratos (somente leitura, sem signer)
const oysterTokenContract = new ethers.Contract(
    oysterTokenAddress,
    OysterTokenABI.abi,
    provider
);

const musicContract = new ethers.Contract(
    musicContractAddress,
    MusicContractABI.abi,
    provider
);

const oysterVaultContract = new ethers.Contract(
    oysterVaultAddress,
    OysterVaultABI.abi,
    provider
);


export {
    provider,
    oysterTokenContract,
    musicContract,
    oysterVaultContract,
    // Exporte as funções de interação que você criar
};