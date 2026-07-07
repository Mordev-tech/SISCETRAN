# SISCETRAN — Front-end (protótipo)

Este diretório é a versão **limpa e organizada** do front-end encontrado no zip original.
O zip continha duas cópias divergentes do projeto (uma dentro da outra, cada uma com seu
próprio `.git`), um `logfile` do PostgreSQL local versionado por engano, e arquivos `.gs`
do Google Apps Script vazios (0 bytes). Nada disso foi mantido aqui.

## Estrutura

```
frontend/
├── index.html
├── css/
│   └── styles.css
├── js/
│   └── script.js
├── assets/
│   └── logo.png
└── README.md
```

## O que foi corrigido nesta limpeza

1. **Script não carregava.** `index.html` referenciava `<script src="app.js">`, mas o
   arquivo real se chama `script.js`. Isso significa que, no zip original, **nenhum
   JavaScript rodava** ao abrir a página. Corrigido para `js/script.js`.
2. **Caminho da logo quebrado** após a reorganização de pastas — ajustado para `assets/logo.png`.
3. **Asset ausente:** `background.png` é referenciado no HTML mas não existe em `assets/`.
   Deixei um comentário no HTML sinalizando isso — falta adicionar o arquivo ou remover a tag.
4. **Bug de status "Reprovar" vs "Reprovado".** Ao reprovar uma ação, o código gravava o
   status como `"Reprovar"` (verbo), mas o CSS injetado esperava `"Reprovado"` (particípio,
   no mesmo padrão de `"Aprovado"`). Resultado: o badge de itens reprovados ficava **sem
   cor de fundo definida**, praticamente invisível na tabela. Corrigido em dois pontos
   (o valor do status e a lista de seletores do CSS injetado).

## Pontos de atenção importantes (não corrigidos, dependem de decisão sua)

Estes não são bugs de código — são características do estágio atual do protótipo que
merecem atenção antes de qualquer uso real, especialmente por ser um sistema de
instituição pública:

- **Não há persistência real.** Todos os dados (`registros`) ficam em `localStorage` do
  navegador. Isso significa que os dados são por navegador/máquina — não são
  compartilhados entre usuários, e um simples "limpar dados do navegador" apaga tudo.
  Isso é esperado num protótipo, mas é a principal razão para a migração ao backend
  Spring Boot + PostgreSQL que vocês já estão desenhando.
- **Login simulado e inseguro.** O acesso "Comitê" usa usuário/senha fixos no próprio
  JavaScript (`admin` / `admin`), visíveis a qualquer pessoa que abra o código-fonte da
  página. Não há hashing, não há sessão real, não há backend validando nada — é só uma
  flag `localStorage.usuarioLogado`. Isso não deve ir para produção; é exatamente o tipo
  de coisa que o RBAC com Spring Security + JWT (mencionado no projeto do backend) resolve
  de verdade.
- **Sem validação/sanitização de entrada.** Os dados do formulário vão direto para o HTML
  da tabela (`innerHTML`) sem qualquer escape, o que abre espaço para XSS caso o conteúdo
  digitado contenha tags/scripts. Num backend real isso deve ser tratado tanto no
  front-end quanto no back-end.

## O que este front-end faz hoje

Fluxo simples de formulário 5W2H (O quê, Por quê, Onde, Quando, Como, Quanto, Impacto) com:
- Landing page → formulário ou tabela de acompanhamento
- Salvar como rascunho / enviar para aprovação
- Modo "Comitê" (login simulado) para aprovar/reprovar com parecer
- Tudo persistido em `localStorage`, sem chamadas a nenhum servidor

## Próximos passos sugeridos

Quando o backend Spring Boot estiver pronto para receber chamadas, os principais pontos
de integração no `script.js` são: `capturarDadosFormulario`, `atualizarTabela`,
`avaliarAcao`, `excluirRegistro` e `editarRegistro` — hoje todos leem/escrevem em
`localStorage` e precisarão virar chamadas `fetch` para a API (com JWT no header,
validação de RBAC no backend, etc.).
