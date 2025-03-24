# Mermaid NFT

Mermaid NFT é um DApp full-stack desenvolvido como **projeto final da trilha de aprendizado Crypto Submersion do programa de bolsas em AWS Blockchain e Real Digital pelo Compass UOL.** Ele fornece uma solução para gestão de direitos autorais na indústria musical, permitindo que artistas e detentores de direitos registrem e gerenciem seus direitos de forma transparente e segura na blockchain.

## Protótipo das Telas

Este projeto apresenta uma interface amigável e intuitiva. Abaixo, destacamos as principais telas, e você pode navegar pelo protótipo interativo para explorar todas as funcionalidades.

#### Tela de Login
[![Tela de Login](/screenshots/login.png)](/screenshots/login.png)

*A tela de login permite que os usuários acessem o sistema com segurança, utilizando suas credenciais ou wallet.*

#### Tela Inicial
[![Tela Inicial](/screenshots/home.png)](/screenshots/home.png)

*A tela inicial apresenta uma navbar com links para navegação e um hero section destacando a proposta do Mermaid NFT.*

**Para visualizar o protótipo interativo completo, acesse o [Figma](https://www.figma.com/proto/eFmjXS9IOxnoHK4OETgjk4/Mermaid-NFT?node-id=4-5&starting-point-node-id=4%3A5&scaling=scale-down-width&content-scaling=fixed&t=hs6nYXqPslLgXS3F-1).**

## Funcionalidades

O Mermaid NFT oferece diversas funcionalidades para gerenciar direitos autorais na indústria musical, incluindo registro, gestão, tokenização, compra/venda de tokens e a possibilidade de ouvir músicas. Explore o protótipo interativo para conhecer todos os detalhes.

## Arquitetura

O projeto é dividido em dois componentes principais:

*   **Backend:** API RESTful construída em Node.js com Express.js que interage com os contratos inteligentes e um banco de dados MySQL.
*   **Frontend:** Aplicação React que fornece a interface do usuário para interagir com a API e os contratos inteligentes.

## Tecnologias

*   **Backend:**
    *   Node.js (v18 ou superior)
    *   Express.js
    *   ethers.js
    *   MySQL
    *   Solidity
    *   Hardhat
*   **Frontend:**
    *   React
    *   Vite
    *   Tailwind CSS
    *   Radix UI
    *   Axios

## Pré-requisitos

*   Node.js (v18 ou superior)
*   npm
*   Hardhat
*   MySQL

## Instalação

1. **Clone o repositório:**

    ```bash
    git clone https://github.com/pedroirineu5/mermaid-NFT.git
    cd mermaid-NFT
    ```

## Configuração do Backend

1. **Navegue até o diretório do backend:**

    ```bash
    cd backend
    ```

2. **Instale as dependências:**

    ```bash
    npm install
    ```

3. **Banco de Dados:**
    *   Crie um banco de dados MySQL chamado `mermaid_db`.
    *   Atualize as variáveis de ambiente do banco de dados no arquivo `.env` (um arquivo `.env` será criado automaticamente durante o redeploy, caso não exista):

        ```
        DB_HOST=localhost
        DB_USER=seu_usuario
        DB_PASSWORD=sua_senha
        DB_DATABASE=mermaid_db
        ```

4. **Variáveis de Ambiente:**
    *   O arquivo `.env` também será atualizado automaticamente durante o redeploy com os endereços dos contratos e outros valores relevantes:

        ```
        OYSTER_TOKEN_ADDRESS=
        OYSTER_VAULT_ADDRESS=
        MUSIC_CONTRACT_ADDRESS=
        RIGHT_PURCHASE_VALUE_IN_GWEI=1000
        VALUE_FOR_LISTENING_IN_GWEI=100
        HARDHAT_PROVIDER_URL=http://127.0.0.1:8545
        BUSINESS_RATE_WEI=200000000000000
        GWEI_PER_TOKEN=50000000000000
        ```

## Implantação dos Contratos

1. **Inicie a rede local do Hardhat:**

    ```bash
    npx hardhat node
    ```

2. **Em um novo terminal, execute o script de deploy e criação/reset do banco:**

    ```bash
    npm run redeploy
    ```

    Este script irá:
    *   Criar um arquivo `.env` se ele não existir, com valores padrão.
    *   Resetar o banco de dados, dropando e recriando as tabelas, caso já existam.
    *   Implantar os contratos `OysterToken`, `OysterVault` e `MusicContract` na rede local do Hardhat.
    *   Validar o `MusicContract` no `OysterToken`.
    *   Salvar os dados do deploy (endereços, ABIs, etc.) no arquivo `deploy-data.json`.
    *   Atualizar o arquivo `.env` com os endereços dos contratos implantados e outros valores.

## Inicializando a API

Em um novo terminal, dentro do diretório `backend`, execute:

```bash
npm start
```

A API estará disponível em `http://localhost:3000`.

## Configuração e Execução do Frontend

1. **Navegue até o diretório do frontend:**

    ```bash
    cd ../frontend
    ```

2. **Instale as dependências:**

    ```bash
    npm install
    ```

3. **Inicie o frontend:**

    ```bash
    npm run dev
    ```

    O frontend estará disponível em `http://localhost:5173`.

## Endpoints

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

**Requisições:** As requisições podem ser feitas inicialmente utilizando ferramentas como Insomnia ou Postman e, em seguida, diretamente no Frontend, utilizando o console do navegador para acompanhar as interações.

## Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir um Pull Request com melhorias, correções de bugs ou novas funcionalidades.

## Licença

Este projeto está licenciado sob a [MIT License](LICENSE).
