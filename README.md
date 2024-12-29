# Mermaid

Mermaid é uma plataforma descentralizada para gestão de direitos autorais na indústria musical, construída usando tecnologia blockchain e contratos inteligentes. O objetivo do projeto é fornecer uma maneira transparente, segura e eficiente para artistas registrarem suas músicas, gerenciarem licenças e receberem royalties.

## Funcionalidades Principais

*   Registro de músicas com metadados imutáveis na blockchain.
*   Concessão de licenças para uso de músicas com termos flexíveis.
*   Rastreamento transparente do uso de músicas e distribuição de royalties.
*   Interface amigável para artistas e usuários.

## Instalação e Configuração (Em construção)

1. **Clone o repositório:**

    ```bash
    git clone https://github.com/pedroirineu5/mermaid-NFT.git
    cd mermaid-NFT
    ```

2. **Instale as dependências:**

    ```bash
    npm install
    ```

3. **Configure as variáveis de ambiente:**

    *   Crie um arquivo `.env` na raiz do projeto.
    *   Adicione a variável `CONTRACT_ADDRESS` com o endereço do contrato `MockMusicRegistry` implantado. Exemplo:

        ```
        CONTRACT_ADDRESS=0x1234567890abcdef1234567890abcdef12345678
        ```

4. **Inicie o Ganache:**

    *   Certifique-se de que o Ganache esteja em execução e configurado para suportar WebSockets (normalmente na porta 7545).

5. **Compile o contrato (se necessário):**

    ```bash
    npx hardhat compile
    ```

6. **Implante o contrato (se necessário):**

    ```bash
    npx hardhat run scripts/deployMockMusicRegistry.js --network localhost
    ```

7. **Inicie o aplicativo:**

    ```bash
    node app.js
    ```

## Padrão de commits

Utilizaremos como padrão de commits o conventional commits, são basicamente uma formalização das mensagens de commits. Isso vai facilitar o acompanhamento de mudanças.

````sh
<tipo>(<escopo>): <descrição>
