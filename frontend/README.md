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
