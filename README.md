# Mermaid - Gestão de Direitos Autorais na Indústria Musical

Mermaid é um DApp desenvolvido em Solidity e JavaScript que fornece uma solução para gestão de direitos autorais na indústria musical. Ele permite que artistas e detentores de direitos registrem e gerenciem seus direitos de forma transparente e segura na blockchain.

## Funcionalidades

*   **Registro de Direitos:** Permite que os usuários registrem seus direitos musicais na blockchain.
*   **Gestão de Direitos:** Facilita a divisão, atribuição e retirada de direitos entre os detentores.
*   **Tokenização:** Utiliza o OysterToken (OST) para representar a propriedade e facilitar transações.
*   **Compra e Venda de Tokens:** Os usuários podem comprar e vender OysterTokens.
*   **Ouvir Música:** Os usuários podem pagar para ouvir músicas, com os pagamentos sendo distribuídos aos detentores de direitos.
*   **Contrato Selado:** Oferece a opção de selar os direitos de uma música, impedindo modificações futuras.

## Pré-requisitos

*   Node.js (v18 ou superior)
*   npm
*   Hardhat
*   MySQL

## Instalação

1. **Clone o repositório:**

    ```bash
    git clone <URL do repositório>
    cd backend
    ```

2. **Instale as dependências:**

    ```bash
    npm install
    ```

## Configuração

1. **Banco de Dados:**
    *   Crie um banco de dados MySQL chamado `mermaid_db`.
    *   Atualize as variáveis de ambiente do banco de dados no arquivo `.env` (um arquivo `.env` será criado automaticamente durante o deploy, caso não exista):
        ```
        DB_HOST=localhost
        DB_USER=seu_usuario
        DB_PASSWORD=sua_senha
        DB_DATABASE=mermaid_db
        ```

2. **Variáveis de Ambiente:**
    *   O arquivo `.env` também será atualizado automaticamente durante o deploy com os endereços dos contratos e outros valores relevantes:
        ```
        OYSTER_TOKEN_ADDRESS=
        OYSTER_VAULT_ADDRESS=
        MUSIC_CONTRACT_ADDRESS=
        RIGHT_PURCHASE_VALUE_IN_GWEI=1000
        VALUE_FOR_LISTENING_IN_GWEI=100
        HARDHAT_PROVIDER_URL=http://127.0.0.1:8545
        ```

## Implantação dos Contratos

1. **Limpe o cache e compile os contratos:**

    ```bash
    npx hardhat clean
    npx hardhat compile
    ```

2. **Inicie a rede local do Hardhat:**

    ```bash
    npx hardhat node
    ```

3. **Em um novo terminal, execute o script de deploy:**

    ```bash
    npx hardhat run scripts/deployOysterToken.js --network localhost
    ```

    Este script irá:
    *   Criar um arquivo `.env` se ele não existir, com valores padrão.
    *   Implantar os contratos `OysterToken`, `OysterVault` e `MusicContract` na rede local do Hardhat.
    *   Validar o `MusicContract` no `OysterToken`.
    *   Salvar os dados do deploy (endereços, ABIs, etc.) no arquivo `deploy-data.json`.
    *   Atualizar o arquivo `.env` com os endereços dos contratos implantados e outros valores.

## Executando os Testes

```bash
npx hardhat test
```

## Iniciando o Backend (API)

```bash
npm start
```

A API estará disponível em `http://localhost:3000`.

## Endpoints da API

*   `POST /validate-music-contract` - Valida um contrato de música.
*   `POST /assign-rights` - Atribui direitos musicais a um endereço.
*   `POST /withdraw-rights` - Retira direitos musicais de um endereço.
*   `POST /seal-music-contract` - Sela um contrato de música.
*   `POST /buy-oyster-token` - Compra 100 OysterTokens.
*   `POST /sell-oyster-token` - Vende OysterTokens.
*   `POST /buy-rights-music` - Compra direitos musicais.
*   `POST /listen-music` - Paga para ouvir música.
*   `GET /remaining-rights` - Retorna a divisão de direitos restante.
*   `GET /tokens/:address` - Retorna o número de tokens por endereço.
*   `GET /is-sealed` - Verifica se o contrato está selado.
*   `GET /view-balance` - Retorna o saldo do contrato.

## Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir um Pull Request com melhorias, correções de bugs ou novas funcionalidades.

## Licença

Este projeto está licenciado sob a [MIT License](LICENSE).
