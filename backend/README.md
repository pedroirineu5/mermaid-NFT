# mermaid-NFT


# Padrão de commits
Utilizaremos como padrão de commits o conventional commits, são basicamente uma formalização das mensagens de commits. Isso vai facilitar o acompanhamento de mudanças.

````sh
<tipo>(<escopo>): <descrição>
````

`<tipo>`: Descreve o propósito do commit(obrigatório)

`<escopo>`: Mostra a área que o commit afeta.

`<descrição>`: Descreve o que o commit realiza(obrigatório)
    

## Tipos comuns de commit 

- `feat` : Para novas funcionalidades.

- `fix` : Para correção de bugs.

- `docs` : Para alterações na documentação.

- `style` : Para formatação, estilo de código, sem mudanças no código de produção.

- `refactor` : Para refatorações de código.

- `test` : Para adição ou modificação de testes.

- `chore` : Para tarefas de manutenção, como atualização de dependências.

## Exemplos de Mensagens de Commit
Aqui estão alguns exemplos de conventional commits

```sh
feat(login): adicionar funcionalidade de login 
```
```sh
fix(api): corrigir erro de rota 
```