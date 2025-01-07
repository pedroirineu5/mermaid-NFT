
import axios from "axios";
const API_BASE_URL = "http://localhost:3000"; 

// ---------- INTERFACES PARA REQUISIÇÕES E RESPOSTAS ----------

// GET /remaining-rights
interface RemainingRightsResponse {
  remainingRights: string;
}

// GET /tokens/:address
interface TokensPerAddressRequest {
  address: string;
}

interface TokensPerAddressResponse {
  tokens: string;
}

// GET /is-sealed
interface IsSealedResponse {
  isSealed: boolean;
}

// GET /view-balance
interface ViewBalanceResponse {
  balance: string;
}

// POST /seal-music-contract
interface SealMusicContractRequest {
  // Pode adicionar parâmetros se sua função precisar
}

interface SealMusicContractResponse {
  message: string;
  transactionHash: string;
}

// POST /buy-oyster-token
interface BuyOysterTokenRequest {
  // Pode adicionar parâmetros se sua função precisar, por exemplo, a quantidade
}

interface BuyOysterTokenResponse {
  message: string;
  transactionHash: string;
}

// POST /sell-oyster-token
interface SellOysterTokenRequest {
  amount: number; // Quantidade de tokens para vender
}

interface SellOysterTokenResponse {
  message: string;
  transactionHash: string;
}

// POST /buy-rights-music
interface BuyRightsMusicRequest {
  // Pode adicionar parâmetros se sua função precisar, por exemplo, a quantidade
}

interface BuyRightsMusicResponse {
  message: string;
  transactionHash: string;
}

// POST /listen-music
interface ListenMusicRequest {
  // Pode adicionar parâmetros se sua função precisar
}

interface ListenMusicResponse {
  message: string;
  transactionHash: string;
}

// POST /assign-rights
interface AssignRightsRequest {
  addressRight: string;
  percentageOfRights: number;
}

interface AssignRightsResponse {
  message: string;
  transactionHash: string;
}

// POST /withdraw-rights
interface WithdrawRightsRequest {
  addressRight: string;
  percentageOfRights: number;
}

interface WithdrawRightsResponse {
  message: string;
  transactionHash: string;
}

// ---------- FUNÇÕES PARA CHAMADAS GET ----------

// Obter a quantidade restante de direitos que podem ser atribuídos
export const getRemainingRights = async (): Promise<RemainingRightsResponse> => {
  try {
    const response = await axios.get<RemainingRightsResponse>(
      `${API_BASE_URL}/remaining-rights`
    );
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Erro ao obter direitos restantes");
  }
};

// Obter a quantidade de tokens que um determinado endereço possui
export const getTokensPerAddress = async (
  data: TokensPerAddressRequest
): Promise<TokensPerAddressResponse> => {
  try {
    const response = await axios.get<TokensPerAddressResponse>(
      `${API_BASE_URL}/tokens/${data.address}`
    );
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Erro ao obter tokens por endereço");
  }
};

// Verificar se o contrato já foi selado
export const isMusicContractSealed = async (): Promise<IsSealedResponse> => {
  try {
    const response = await axios.get<IsSealedResponse>(
      `${API_BASE_URL}/is-sealed`
    );
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Erro ao verificar se o contrato está selado");
  }
};

// Visualizar o saldo de ether do contrato inteligente
export const viewBalance = async (): Promise<ViewBalanceResponse> => {
  try {
    const response = await axios.get<ViewBalanceResponse>(
      `${API_BASE_URL}/view-balance`
    );
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Erro ao visualizar o saldo");
  }
};

// ---------- FUNÇÕES PARA CHAMADAS POST ----------

// Selar o contrato de música
export const sealMusicContract = async (
  data: SealMusicContractRequest = {}
): Promise<SealMusicContractResponse> => {
  try {
    const response = await axios.post<SealMusicContractResponse>(
      `${API_BASE_URL}/seal-music-contract`,
      data
    );
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Erro ao selar o contrato de música");
  }
};

// Comprar tokens
export const buyOysterToken = async (
  data: BuyOysterTokenRequest = {}
): Promise<BuyOysterTokenResponse> => {
  try {
    const response = await axios.post<BuyOysterTokenResponse>(
      `${API_BASE_URL}/buy-oyster-token`,
      data
    );
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Erro ao comprar tokens");
  }
};

// Vender tokens
export const sellOysterToken = async (
  data: SellOysterTokenRequest
): Promise<SellOysterTokenResponse> => {
  try {
    const response = await axios.post<SellOysterTokenResponse>(
      `${API_BASE_URL}/sell-oyster-token`,
      data
    );
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Erro ao vender tokens");
  }
};

// Comprar direitos musicais
export const buyRightsMusic = async (
  data: BuyRightsMusicRequest = {}
): Promise<BuyRightsMusicResponse> => {
  try {
    const response = await axios.post<BuyRightsMusicResponse>(
      `${API_BASE_URL}/buy-rights-music`,
      data
    );
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Erro ao comprar direitos musicais");
  }
};

// Ouvir música
export const listenMusic = async (
  data: ListenMusicRequest = {}
): Promise<ListenMusicResponse> => {
  try {
    const response = await axios.post<ListenMusicResponse>(
      `${API_BASE_URL}/listen-music`,
      data
    );
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Erro ao ouvir música");
  }
};

// Atribuir direitos
export const assignRights = async (
  data: AssignRightsRequest
): Promise<AssignRightsResponse> => {
  try {
    const response = await axios.post<AssignRightsResponse>(
      `${API_BASE_URL}/assign-rights`,
      data
    );
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Erro ao atribuir direitos");
  }
};

// Retirar direitos
export const withdrawRights = async (
  data: WithdrawRightsRequest
): Promise<WithdrawRightsResponse> => {
  try {
    const response = await axios.post<WithdrawRightsResponse>(
      `${API_BASE_URL}/withdraw-rights`,
      data
    );
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Erro ao retirar direitos");
  }
};
function handleAxiosError(error: unknown, arg1: string) {
    throw new Error("Function not implemented.");
}

