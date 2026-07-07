// ==========================================================================
// 1. SELEÇÃO DE ELEMENTOS DA INTERFACE
// ==========================================================================
const heroSection = document.getElementById("heroSection");
const formulario = document.getElementById("formularioContainer");
const tabela = document.getElementById("registroView");

const btnNova = document.getElementById("AbrirAcaoButton");
const btnConsulta = document.getElementById("AbrirConsultaButton");
const btnSalvar = document.getElementById("salvarAcaoButton");
const btnLimpar = document.getElementById("limparFormulario");
const btnEnviar = document.getElementById("enviarAcaoButton");

const corpoTabela = document.getElementById("registroTableBody");

// Elementos dos Campos do Formulário para mapeamento simplificado
const camposForm = {
    oque: document.getElementById("f_oque"),
    porque: document.getElementById("f_porque"),
    como: document.getElementById("f_como"),
    quando: document.getElementById("f_quando"),
    onde: document.getElementById("f_onde"),
    quanto: document.getElementById("f_quanto"),
    impacto: document.getElementById("f_impacto"),
    observacao: document.getElementById("f_observacao")
};

// ==========================================================================
// 2. ESTADO DO SISTEMA
// ==========================================================================
let registros = JSON.parse(localStorage.getItem("registros")) || [];
let idRegistroSendoEditado = null; // Controla se estamos editando um item existente

// ==========================================================================
// 3. FUNÇÕES DE NAVEGAÇÃO (LANDING PAGE vs PAINÉIS)
// ==========================================================================

// Quando clica em "Nova Ação"
btnNova.onclick = () => {
    heroSection.style.display = "none";      // Esconde a Landing Page
    formulario.style.display = "block";     // Mostra o formulário
    tabela.style.display = "none";          // Esconde a tabela
};

// Quando clica em "Consultar Ação"
btnConsulta.onclick = () => {
    heroSection.style.display = "none";      // Esconde a Landing Page
    formulario.style.display = "none";      // Esconde o formulário
    tabela.style.display = "block";         // Mostra a tabela
    atualizarTabela();
};

// Retornar para a Landing Page principal ao clicar na logo/nome do sistema
const brandClick = document.querySelector(".header-brand");
if (brandClick) {
    brandClick.style.cursor = "pointer";
    brandClick.onclick = () => {
        heroSection.style.display = "block"; // Reexibe a Landing Page de Boas-vindas
        formulario.style.display = "none";
        tabela.style.display = "none";
    };
}

// ==========================================================================
// 4. FUNÇÕES AUXILIARES E VALIDAÇÕES
// ==========================================================================

// Gera ID único baseado no timestamp atual
function gerarID() {
    return `${Date.now()}-${Math.floor(Math.random() * 100)}`;
}

// Verifica se os campos obrigatórios estão preenchidos
function validarFormulario() {
    const camposObrigatorios = ['oque', 'porque', 'como', 'quando', 'onde', 'quanto', 'impacto'];
    return camposObrigatorios.every(chave => camposForm[chave].value.trim() !== "");
}

// Captura os dados estruturados da tela
function capturarDadosFormulario() {
    return {
        oque: camposForm.oque.value,
        porque: camposForm.porque.value,
        como: camposForm.como.value,
        quando: camposForm.quando.value,
        onde: camposForm.onde.value,
        quanto: camposForm.quanto.value,
        impacto: camposForm.impacto.value,
        observacao: camposForm.observacao.value
    };
}

// Limpa todos os campos e reseta o estado de edição
function limparFormulario() {
    Object.values(camposForm).forEach(campo => campo.value = "");
    idRegistroSendoEditado = null; 
}
btnLimpar.onclick = limparFormulario;

// ==========================================================================
// 5. OPERAÇÕES DO FORMULÁRIO (SALVAR / ENVIAR)
// ==========================================================================

// Salvar / Atualizar Registro como Rascunho
btnSalvar.onclick = () => {
    if (!validarFormulario()) {
        alert("Por favor, preencha todos os campos obrigatórios antes de salvar!");
        return;
    }

    const dadosAcao = capturarDadosFormulario();

    if (idRegistroSendoEditado) {
        // Modo Edição
        const index = registros.findIndex(reg => reg.id === idRegistroSendoEditado);
        if (index !== -1) {
            registros[index] = { 
                ...registros[index], 
                ...dadosAcao,
                dataEdicao: new Date().toLocaleString() 
            };
            alert("Alterações salvas com sucesso!");
        }
        idRegistroSendoEditado = null; // Bug corrigido aqui (estava idRegistroSendoEditated)
    } else {
        // Modo Criação de Rascunho
        dadosAcao.id = gerarID();
        dadosAcao.dataCriacao = new Date().toLocaleString();
        dadosAcao.status = "Rascunho";
        dadosAcao.comentarioComite = "-"; // Inicializa o campo do comitê
        
        registros.push(dadosAcao);
        alert(`Rascunho salvo com sucesso! ID: ${dadosAcao.id}`);
    }

    localStorage.setItem("registros", JSON.stringify(registros));
    limparFormulario();
};

// Enviar Ação para os Conselheiros
btnEnviar.onclick = () => {
    if (!validarFormulario()) {
        alert("Por favor, preencha todos os campos obrigatórios antes de enviar!");
        return;
    }

    if (confirm("Deseja enviar esta ação para a aprovação dos conselheiros?")) {
        const dadosAcao = capturarDadosFormulario();
        
        if (idRegistroSendoEditado) {
            const index = registros.findIndex(reg => reg.id === idRegistroSendoEditado);
            if (index !== -1) {
                registros[index] = { ...registros[index], ...dadosAcao, status: "Enviado" };
            }
            idRegistroSendoEditado = null;
        } else {
            dadosAcao.id = gerarID();
            dadosAcao.dataCriacao = new Date().toLocaleString();
            dadosAcao.status = "Enviado";
            dadosAcao.comentarioComite = "-";
            registros.push(dadosAcao);
        }

        localStorage.setItem("registros", JSON.stringify(registros));
        alert("Ação enviada com sucesso!");
        limparFormulario();
    }
};

// ==========================================================================
// 6. CONTROLE E RENDERIZAÇÃO DA TABELA (COM REGRAS DO COMITÊ)
// ==========================================================================

function atualizarTabela() {
    corpoTabela.innerHTML = "";
    
    // Verifica se o conselheiro está logado no momento
    const esComite = localStorage.getItem('usuarioLogado') === 'true';

    if (registros.length === 0) {
        corpoTabela.innerHTML = `<tr><td colspan="9" style="text-align: center;">Nenhum registro encontrado</td></tr>`;
        return;
    }

    registros.forEach((registro, index) => {
        const linha = document.createElement("tr");
        
        // Define os botões de ação baseado em quem está olhando a tabela
        let botoesAcao = "";
        
        if (esComite) {
            // Se for Conselheiro e a ação estiver pendente ("Enviado")
            if (registro.status === "Enviado") {
                botoesAcao = `
                    <button onclick="avaliarAcao('${registro.id}', 'Aprovado')" class="button-aprovar" title="Aprovar">Aprovar</button>
                    <button onclick="avaliarAcao('${registro.id}', 'Reprovado')" class="button-reprovar" title="Reprovar">Reprovar</button>
                `;
            } else {
                botoesAcao = `<span style="font-size:12px; color:gray;">Avaliado</span>`;
            }
        } else {
            // Se for Usuário Comum, ele só edita se for Rascunho
            if (registro.status === "Rascunho") {
                botoesAcao = `
                    <button onclick="editarRegistro('${registro.id}')" class="button-editar" title="Editar">✏️</button>
                    <button onclick="excluirRegistro('${registro.id}')" class="button-excluir" title="Excluir">🗑️</button>
                `;
            } else {
                botoesAcao = `<span style="font-size:12px; color:gray;">Bloqueado em Análise</span>`;
            }
        }

        linha.innerHTML = `
            <td>${registro.id || `ID-${index + 1}`}</td>
            <td>${registro.oque}</td>
            <td>${registro.onde}</td>
            <td>${formatarData(registro.quando)}</td>
            <td>${registro.quanto}</td>
            <td>${formatarImpacto(registro.impacto)}</td>
            <td><span class="badge-${registro.status.toLowerCase()}">${registro.status}</span></td>
            <td><em>${registro.comentarioComite || "-"}</em></td>
            <td>${botoesAcao}</td>
        `;
        corpoTabela.appendChild(linha);
    });
}

// Nova função para a Tomada de Decisão do Comitê (Aprovar/Reprovar + Comentário)
window.avaliarAcao = function(id, novoStatus) {
    const index = registros.findIndex(reg => reg.id === id);
    if (index === -1) return;

    const parecer = prompt(`Digite um parecer/comentário para esta ação (${novoStatus}):`);
    if (parecer === null) return; // Cancelou o prompt

    registros[index].status = novoStatus;
    registros[index].comentarioComite = parecer.trim() || `Ação ${novoStatus} pelo comitê.`;

    localStorage.setItem("registros", JSON.stringify(registros));
    alert(`Ação atualizada para ${novoStatus} com sucesso!`);
    atualizarTabela();
};

function formatarData(data) {
    if (!data) return "-";
    const partes = data.split('-');
    return partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : data;
}

function formatarImpacto(impacto) {
    const cores = {
        'baixo': '🟢 Baixo',
        'medio': '🟡 Médio',
        'alto': '🔴 Alto'
    };
    return cores[impacto] || impacto;
}

window.excluirRegistro = function(id) {
    const index = registros.findIndex(reg => reg.id === id);
    if (index !== -1 && confirm(`Deseja realmente excluir o rascunho ID: ${id}?`)) {
        registros.splice(index, 1);
        localStorage.setItem("registros", JSON.stringify(registros));
        atualizarTabela();
    }
};

window.editarRegistro = function(id) {
    const registro = registros.find(reg => reg.id === id);
    if (!registro) return;

    camposForm.oque.value = registro.oque || "";
    camposForm.porque.value = registro.porque || "";
    camposForm.como.value = registro.como || "";
    camposForm.quando.value = registro.quando || "";
    camposForm.onde.value = registro.onde || "";
    camposForm.quanto.value = registro.quanto || "";
    camposForm.impacto.value = registro.impacto || "";
    camposForm.observacao.value = registro.observacao || "";
    
    idRegistroSendoEditado = registro.id;
    
    heroSection.style.display = "none";
    formulario.style.display = "block";
    tabela.style.display = "none";
    
    alert("Rascunho carregado. Modifique as informações e clique em 'Salvar Rascunho' ou 'Enviar para o Comitê'.");
};

// ==========================================================================
// 7. INICIALIZAÇÃO E EVENTOS DE LOGIN (DOM COMPLETO)
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    const loginButton = document.getElementById('loginButton');
    const loginModal = document.getElementById('loginModal');
    const closeLoginModal = document.getElementById('closeLoginModal');
    const loginForm = document.getElementById('loginForm');

    // Checagem persistente de login ao recarregar a página
    if (localStorage.getItem('usuarioLogado') === 'true' && loginButton) {
        loginButton.textContent = 'Logout';
        loginButton.style.backgroundColor = '#e74c3c';
    }

    if (loginButton && loginModal && closeLoginModal) {
        loginButton.onclick = () => {
            if (localStorage.getItem('usuarioLogado') === 'true') {
                // Fazer Logout
                localStorage.removeItem('usuarioLogado');
                loginButton.textContent = 'Login (Comitê)';
                loginButton.style.backgroundColor = '';
                alert('Você saiu do modo de visualização do Comitê.');
                if (tabela.style.display === "block") atualizarTabela();
            } else {
                loginModal.style.display = 'flex';
            }
        };
        closeLoginModal.onclick = () => loginModal.style.display = 'none';
    }

    if (loginForm) {
        loginForm.onsubmit = (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            if (username === 'admin' && password === 'admin') {
                alert('Login de Conselheiro realizado!');
                localStorage.setItem('usuarioLogado', 'true');
                loginModal.style.display = 'none';
                loginButton.textContent = 'Logout';
                loginButton.style.backgroundColor = '#e74c3c';
                
                // Força atualização da tabela caso ela esteja aberta
                if (tabela.style.display === "block") atualizarTabela();
                
                // Limpa o form de login
                document.getElementById('username').value = "";
                document.getElementById('password').value = "";
            } else {
                alert('Usuário ou senha incorretos!');
            }
        };
    }

    // Configura a visualização da Landing Page padrão ao abrir o site
    heroSection.style.display = 'block';
    formulario.style.display = 'none';
    tabela.style.display = 'none';
});

// Estilização injetada para os novos elementos da tabela
const styleSheet = document.createElement("style");
styleSheet.textContent = `
    .button-excluir, .button-editar, .button-aprovar, .button-reprovar {
        color: white; border: none; border-radius: 4px; padding: 5px 10px; margin: 2px; cursor: pointer; font-size: 13px; transition: background 0.2s ease;
    }
    .button-excluir { background-color: #e74c3c; }
    .button-excluir:hover { background-color: #c0392b; }
    .button-editar { background-color: #3498db; }
    .button-editar:hover { background-color: #2980b9; }
    .button-aprovar { background-color: #2ecc71; }
    .button-aprovar:hover { background-color: #27ae60; }
    .button-reprovar { background-color: #e67e22; }
    .button-reprovar:hover { background-color: #d35400; }
    
    /* Badges de Status */
    .badge-rascunho, .badge-enviado, .badge-aprovado, .badge-reprovado {
        padding: 4px 8px; border-radius: 12px; font-size: 11px; font-weight: bold; color: white; text-transform: uppercase;
    }
    .badge-rascunho { background-color: #95a5a6; }
    .badge-enviado { background-color: #f1c40f; color: #2c3e50; }
    .badge-aprovado { background-color: #2ecc71; }
    .badge-reprovado { background-color: #e74c3c; }
`;
document.head.appendChild(styleSheet);