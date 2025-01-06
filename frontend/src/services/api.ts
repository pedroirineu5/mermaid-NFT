import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000'; // URL do seu backend

// Interface para a requisição de validação do contrato
interface ValidateMusicContractRequest {
    addressMusicContract: string;
}

// Interface para a resposta de validação do contrato
interface ValidateMusicContractResponse {
    message: string;
    transactionHash: string;
    musicContractAddress: string;
}

// Exemplo de função para chamar o endpoint /validate-music-contract
export const validateMusicContract = async (
    data: ValidateMusicContractRequest
): Promise<ValidateMusicContractResponse> => {
    try {
        const response = await axios.post<ValidateMusicContractResponse>(
            `${API_BASE_URL}/validate-music-contract`,
            data
        );
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error(
                'Erro ao validar contrato de música:',
                error.response ? error.response.data : error.message
            );
        } else {
            console.error('Erro ao validar contrato de música:', error);
        }
        throw error;
    }
};

// Interface para a resposta de obter os direitos restantes
interface RemainingRightsResponse {
    remainingRights: string;
}

// Exemplo de função para chamar o endpoint /remaining-rights
export const getRemainingRights = async (): Promise<RemainingRightsResponse> => {
    try {
        const response = await axios.get<RemainingRightsResponse>(
            `${API_BASE_URL}/remaining-rights`
        );
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error(
                'Erro ao obter direitos restantes:',
                error.response ? error.response.data : error.message
            );
        } else {
            console.error('Erro ao obter direitos restantes:', error);
        }
        throw error;
    }
};

// Interface para a resposta de obter tokens por endereço
interface TokensPerAddressResponse {
    tokens: string;
}
// Exemplo de função para chamar o endpoint /tokens/:address
export const getTokensPerAddress = async (
    address: string
): Promise<TokensPerAddressResponse> => {
    try {
        const response = await axios.get<TokensPerAddressResponse>(
            `${API_BASE_URL}/tokens/${address}`
        );
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error(
                'Erro ao obter tokens por endereço:',
                error.response ? error.response.data : error.message
            );
        } else {
            console.error('Erro ao obter tokens por endereço:', error);
        }
        throw error;
    }
};

// Interface para a resposta de verificar se o contrato está selado
interface IsSealedResponse {
    isSealed: boolean;
}

// Exemplo de função para chamar o endpoint /is-sealed
export const isMusicContractSealed = async (): Promise<IsSealedResponse> => {
    try {
        const response = await axios.get<IsSealedResponse>(
            `${API_BASE_URL}/is-sealed`
        );
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error(
                'Erro ao verificar se o contrato está selado:',
                error.response ? error.response.data : error.message
            );
        } else {
            console.error('Erro ao verificar se o contrato está selado:', error);
        }
        throw error;
    }
};

// Interface para a resposta de visualizar o saldo
interface ViewBalanceResponse {
    balance: string;
}

// Exemplo de função para chamar o endpoint /view-balance
export const viewBalance = async (): Promise<ViewBalanceResponse> => {
    try {
        const response = await axios.get<ViewBalanceResponse>(
            `${API_BASE_URL}/view-balance`
        );
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error(
                'Erro ao visualizar o saldo:',
                error.response ? error.response.data : error.message
            );
        } else {
            console.error('Erro ao visualizar o saldo:', error);
        }
        throw error;
    }
};

// Adicione aqui as outras funções para interagir com os demais endpoints do seu backend (assign-rights, withdraw-rights, etc.) seguindo o mesmo padrão
// ...