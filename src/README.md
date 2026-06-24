# SISCETRAN — Sistema de Solicitações

> Formulário web integrado ao Google Sheets para registro, edição e exclusão de solicitações internas, estruturado com a metodologia **5W2H**.

---

## Sumário

- [Visão geral](#visão-geral)
- [Tecnologias](#tecnologias)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Instalação e implantação](#instalação-e-implantação)
- [Estrutura da planilha](#estrutura-da-planilha)
- [Funcionalidades](#funcionalidades)
- [Funções do backend](#funções-do-backend)
- [Como usar](#como-usar)
- [Personalização](#personalização)

---

## Visão geral

O SISCETRAN é um sistema leve de formulário web construído sobre **Google Apps Script**, que persiste todos os dados diretamente em uma planilha Google Sheets. Não requer servidor externo, banco de dados ou dependências adicionais — tudo roda dentro do ecossistema Google.

```
Usuário (navegador)
       │  HTTP GET
       ▼
Google Apps Script (Code.gs + Index.html)
       │  SpreadsheetApp API
       ▼
Google Sheets → aba "Solicitações"
```

---

## Tecnologias

| Camada | Tecnologia |
|---|---|
| Frontend | HTML5 + CSS3 + JavaScript puro |
| Backend | Google Apps Script (GAS) |
| Banco de dados | Google Sheets |
| Hospedagem | Google Apps Script Web App |

---

## Estrutura do projeto

```
siscetran/
├── Code.gs       # Backend: CRUD na planilha + ponto de entrada HTTP
├── Index.html    # Frontend: formulário, tabela de registros e lógica de UI
└── README.md     # Esta documentação
```

> Os dois arquivos (`Code.gs` e `Index.html`) devem estar no mesmo projeto do Google Apps Script.

---

## Instalação e implantação

### Pré-requisitos

- Conta Google (pessoal ou corporativa)
- Acesso ao Google Sheets e ao Google Apps Script

### Passo a passo

**1. Crie ou abra a planilha**

Acesse [sheets.google.com](https://sheets.google.com) e crie uma planilha nova (ou use uma existente). O script criará automaticamente a aba `Solicitações` na primeira execução.

**2. Abra o editor de script**

No menu da planilha, clique em **Extensões → Apps Script**.

**3. Configure o arquivo `Code.gs`**

Apague o conteúdo padrão e cole o conteúdo do arquivo `Code.gs` deste repositório.

**4. Crie o arquivo `Index.html`**

No painel esquerdo do Apps Script, clique no ícone **+** ao lado de "Arquivos" → selecione **HTML** → nomeie como `Index` (sem extensão) → cole o conteúdo do arquivo `Index.html`.

**5. Salve o projeto**

Pressione `Ctrl + S` (ou `Cmd + S` no Mac) ou clique no ícone de disquete.

**6. Implante como Web App**

1. Clique em **Implantar** → **Nova implantação**
2. Em "Tipo", selecione **Aplicativo da Web**
3. Preencha:
   - **Descrição:** `SISCETRAN v1.0`
   - **Executar como:** `Eu (seu e-mail)`
   - **Quem tem acesso:** `Qualquer pessoa da organização` *(ou "Qualquer pessoa" para acesso externo)*
4. Clique em **Implantar**
5. Autorize as permissões solicitadas
6. **Copie a URL** gerada — ela é o endereço do sistema

**7. Distribuição**

Compartilhe a URL copiada com os usuários. Não é necessária nenhuma instalação adicional.

> **Atenção:** Ao atualizar o código, é necessário criar uma **nova implantação** (ou usar "Gerenciar implantações" para atualizar a versão existente) para que as mudanças entrem em vigor.

---

## Estrutura da planilha

A aba **Solicitações** é criada automaticamente com as seguintes colunas:

| # | Coluna | Descrição |
|---|---|---|
| A | ID | Identificador único gerado automaticamente (`SOL-timestamp`) |
| B | DATA DE SUBMISSÃO | Data e hora do registro (`dd/MM/yyyy HH:mm:ss`) |
| C | O QUÊ? | Descrição da ação ou problema |
| D | POR QUÊ? | Justificativa ou motivo |
| E | ONDE? | Local de aplicação |
| F | QUANDO? | Data prevista de início |
| G | QUEM? | Nome do responsável direto |
| H | COMO? | Método ou processo |
| I | QUANTO? | Custo estimado |
| J | IMPACTO | Nível de impacto (`Baixo`, `Médio`, `Alto`, `Crítico`) |
| K | PRAZO | Data limite final |
| L | RESPONSÁVEL | Responsável pelo setor |
| M | SETORES | Setores envolvidos |
| N | EMAIL | E-mail de contato |
| O | AUTENTICAÇÃO | Código ou assinatura digital |
| P | STATUS | Status da solicitação (`Pendente`, `Aprovado`, `Reprovado`) |

---

## Funcionalidades

### Nova Solicitação

- Formulário dividido em três seções: **Descrição 5W2H**, **Responsável** e **Avaliação**
- Campo obrigatório: **O quê?**
- Ao submeter, gera automaticamente um ID único e registra a data/hora de criação
- Novo registro entra com status `Pendente` por padrão

### Visualização de Registros

- Tabela com todos os registros ordenados cronologicamente
- Exibe: data de criação, ID, o quê, quem, setor, impacto e status
- Badges coloridos para **Impacto** e **Status**
- Botão de atualização manual

### Edição

- Ao clicar em **Editar**, o sistema abre a aba do formulário com os campos preenchidos
- Um banner amarelo exibe a data de criação e o ID do registro em edição, evitando confusão entre múltiplos registros
- O ID e a data de criação originais são **sempre preservados** — apenas os demais campos são atualizados
- A edição é identificada pelo **ID único** (`SOL-timestamp`)

### Exclusão

- Pede confirmação antes de excluir, exibindo a data de criação do registro
- Remove a linha diretamente da planilha
- Atualiza a tabela automaticamente após a exclusão

---

## Funções do backend

Todas as funções estão em `Code.gs` e são chamadas pelo frontend via `google.script.run`.

### `doGet(e)`
Ponto de entrada HTTP. Serve o arquivo `Index.html` como Web App.

### `getOrCreateSheet()`
Verifica se a aba `Solicitações` existe. Caso não exista, cria a aba, aplica o cabeçalho formatado e define as larguras de coluna. Chamada internamente pelas demais funções.

### `createRecord(data)`
Insere uma nova linha na planilha.

```js
// Retorno em caso de sucesso
{ success: true, id: "SOL-1718000000000", createdAt: "22/06/2025 14:30:00" }

// Retorno em caso de erro
{ success: false, error: "mensagem de erro" }
```

### `getRecords()`
Lê todas as linhas da planilha (a partir da linha 2) e retorna um array de objetos.

```js
// Retorno
{ success: true, records: [ { id, createdAt, oque, porque, ... }, ... ] }
```

### `updateRecord(id, data)`
Localiza a linha pelo `id` e sobrescreve as colunas C a P. As colunas A (ID) e B (Data de Submissão) não são alteradas.

```js
// Retorno em caso de sucesso
{ success: true }
```

### `deleteRecord(id)`
Localiza a linha pelo `id` e a exclui da planilha com `sheet.deleteRow()`.

```js
// Retorno em caso de sucesso
{ success: true }
```

---

## Como usar

### Para o usuário final

1. Acesse a URL do sistema fornecida pelo administrador
2. Na aba **Nova Solicitação**, preencha os campos desejados — ao menos **O quê?** é obrigatório
3. Clique em **Submeter solicitação**
4. Para ver os registros existentes, clique na aba **Registros**
5. Para **editar** um registro, clique em ✏️ Editar na linha desejada — o formulário abrirá com os dados preenchidos e um banner indicando qual registro está sendo editado
6. Para **excluir**, clique em 🗑 Excluir e confirme a ação

### Para o administrador

- Os dados ficam disponíveis diretamente na planilha Google Sheets vinculada, podendo ser filtrados, exportados ou integrados com outras ferramentas Google
- O **status** de cada solicitação pode ser alterado diretamente na planilha (coluna P) sem necessitar do formulário
- Para atualizar o sistema após mudanças no código, acesse o Apps Script → **Implantar → Gerenciar implantações** → edite a versão ativa

---

## Personalização

### Alterar o nome da aba da planilha

No início de `Code.gs`, altere a constante:

```js
const SHEET_NAME = "Solicitações"; // ← altere aqui
```

### Adicionar novos campos

1. Inclua o novo campo em `COLUMNS` (em `Code.gs`)
2. Adicione o campo no `appendRow` da função `createRecord`
3. Mapeie o campo no `map` da função `getRecords`
4. Adicione o campo no `setValues` da função `updateRecord`
5. Crie o input correspondente no `Index.html` e mapeie em `getFields()` e `fillFields()`

### Alterar os níveis de impacto

No `Index.html`, localize o `<select id="f_impacto">` e adicione ou remova as opções desejadas. Atualize também a função `impactClass()` para adicionar o estilo visual correspondente.

### Controle de acesso

O nível de acesso é configurado na etapa de implantação do Apps Script. As opções são:

- `Qualquer pessoa da organização` — apenas usuários com e-mail do domínio corporativo
- `Qualquer pessoa` — acesso público via URL
- `Apenas eu` — para testes locais