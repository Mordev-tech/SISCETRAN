// ==========================================================================
// 1. SELEÇÃO DE ELEMENTOS DA INTERFACE
// ==========================================================================
const heroSection = document.getElementById("heroSection");
const acoesTableContainer = document.getElementById("acoesTableContainer");
const formulario = document.getElementById("formularioContainer");
const tabelaRegistros = document.getElementById("registroView");

const btnAcoes = document.getElementById("btnAcoes");
const btnConsultar = document.getElementById("btnConsultar");
const btnMeusRascunhos = document.getElementById("btnMeusRascunhos");

const btnDetalharSelecionada = document.getElementById("btnDetalharSelecionada");
const btnVoltarHero = document.getElementById("btnVoltarHero");

const btnSalvarRascunho = document.getElementById("btnSalvarRascunho");
const btnLimpar = document.getElementById("btnLimpar");
const btnEnviarComite = document.getElementById("btnEnviarComite");
const btnVoltarAcoes = document.getElementById("btnVoltarAcoes");
const btnVoltarAcoesDaConsulta = document.getElementById("btnVoltarAcoesDaConsulta");

const corpoTabelaAcoes = document.getElementById("acoesTableBody");
const corpoTabelaRegistros = document.getElementById("registroTableBody");

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

const listaAcoesVinculadasEl = document.getElementById("listaAcoesVinculadas");

// ==========================================================================
// 2. ESTADO DO SISTEMA
// ==========================================================================
const DB_KEY = "siscetran_db";
let db = carregarBanco();
let registros = db.registros || [];
let idRegistroSendoEditado = null;
let usuarioLogado = carregarSessao();
let acoesSelecionadas = []; 
let modoVisualizacao = "geral";

// ==========================================================================
// 3. FUNÇÕES DE BANCO DE DADOS E LOGIN
// ==========================================================================
function carregarBanco() {
    const dadosSalvos = JSON.parse(localStorage.getItem(DB_KEY));
    const registrosLegados = JSON.parse(localStorage.getItem("registros"));

    if (dadosSalvos && Array.isArray(dadosSalvos.registros)) {
        return dadosSalvos;
    }

    const bancoInicial = {
        usuarios: [
            { email: "usuario@email.com", senha: "usuario123", role: "usuario" },
            { email: "comite@email.com", senha: "comite123", role: "comite" },
            { email: "admin@email.com", senha: "admin123", role: "admin" }
        ],
        registros: Array.isArray(registrosLegados) ? registrosLegados : []
    };

    localStorage.setItem(DB_KEY, JSON.stringify(bancoInicial));
    return bancoInicial;
}

function salvarBanco() {
    db.registros = registros;
    localStorage.setItem(DB_KEY, JSON.stringify(db));
}

function carregarSessao() {
    const usuarioSalvo = localStorage.getItem("usuarioLogadoDados");
    return usuarioSalvo ? JSON.parse(usuarioSalvo) : null;
}

function salvarSessao(usuario) {
    usuarioLogado = usuario;
    localStorage.setItem("usuarioLogadoDados", JSON.stringify(usuario));
    localStorage.setItem("usuarioLogado", "true");
}

function limparSessao() {
    usuarioLogado = null;
    localStorage.removeItem("usuarioLogadoDados");
    localStorage.removeItem("usuarioLogado");
}

function estaLogado() {
    return Boolean(usuarioLogado);
}

function atualizarVisibilidadeMenu() {
    if (btnMeusRascunhos) {
        btnMeusRascunhos.style.display = estaLogado() ? "inline-flex" : "none";
    }
}

function exigirLogin() {
    if (!estaLogado()) {
        Swal.fire({
            icon: 'warning',
            title: 'Acesso restrito',
            text: 'Faça login para acessar esta função.',
            confirmButtonColor: '#2563eb'
        });
        return false;
    }
    return true;
}

// ==========================================================================
// 4. NAVEGAÇÃO ENTRE TELAS
// ==========================================================================
btnAcoes.onclick = () => {
    if (!exigirLogin()) return;
    heroSection.style.display = "none";
    acoesTableContainer.style.display = "block";
    formulario.style.display = "none";
    tabelaRegistros.style.display = "none";
    renderizarTabelaAcoes();
};

if (btnVoltarHero) btnVoltarHero.onclick = () => {
    heroSection.style.display = "block";
    acoesTableContainer.style.display = "none";
    formulario.style.display = "none";
    tabelaRegistros.style.display = "none";
    limparSelecao();
};

btnConsultar.onclick = () => {
    if (!exigirLogin()) return;
    heroSection.style.display = "none";
    acoesTableContainer.style.display = "none";
    formulario.style.display = "none";
    tabelaRegistros.style.display = "block";
    modoVisualizacao = "geral";
    atualizarTabelaRegistros();
};

btnVoltarAcoesDaConsulta.onclick = () => {
    heroSection.style.display = "none";
    acoesTableContainer.style.display = "block";
    formulario.style.display = "none";
    tabelaRegistros.style.display = "none";
    renderizarTabelaAcoes();
};

btnMeusRascunhos.onclick = () => {
    if (!exigirLogin()) return;
    heroSection.style.display = "none";
    acoesTableContainer.style.display = "none";
    formulario.style.display = "none";
    tabelaRegistros.style.display = "block";
    modoVisualizacao = "meus_rascunhos";
    atualizarTabelaRegistros();
};

const brandClick = document.querySelector(".header-brand");
if (brandClick) {
    brandClick.style.cursor = "pointer";
    brandClick.onclick = () => {
        heroSection.style.display = "block";
        acoesTableContainer.style.display = "none";
        formulario.style.display = "none";
        tabelaRegistros.style.display = "none";
        limparSelecao();
    };
}

// ==========================================================================
// 5. CONTROLE DO BOTÃO FLUTUANTE E RENDERIZAÇÃO
// ==========================================================================
const floatingBtn = document.getElementById('floatingDetalharBtn');
const btnDetalhar = document.getElementById('btnDetalharSelecionada');

function atualizarBotaoFlutuante() {
    const checkboxes = document.querySelectorAll('.acao-checkbox:checked');
    if (checkboxes.length > 0) {
        floatingBtn.classList.add('visible');
    } else {
        floatingBtn.classList.remove('visible');
    }
}

function renderizarTabelaAcoes() {
    corpoTabelaAcoes.innerHTML = "";

    if (!window.acoesEstrategicas || window.acoesEstrategicas.length === 0) {
        corpoTabelaAcoes.innerHTML = `<tr><td colspan="7" class="table-empty-state">Nenhuma ação estratégica encontrada</td></tr>`;
        return;
    }

    window.acoesEstrategicas.forEach((acao) => {
        const linha = document.createElement("tr");
        linha.innerHTML = `
            <td style="text-align: center;">
                <input type="checkbox" class="acao-checkbox" value="${acao.id}">
            </td>
            <td><strong>${acao.id}</strong></td>
            <td>${acao.diretriz}</td>
            <td><span class="badge-${acao.prazo.toLowerCase()}">${acao.prazo}</span></td>
            <td>${acao.meta}</td>
            <td>${acao.indicador}</td>
            <td>${acao.responsavel}</td>
        `;
        corpoTabelaAcoes.appendChild(linha);
    });

    document.querySelectorAll('.acao-checkbox').forEach(cb => {
        cb.onchange = function() {
            atualizarBotaoFlutuante();
        };
    });

    floatingBtn.classList.remove('visible');
}

// ==========================================================================
// 6. DETALHAR MÚLTIPLAS AÇÕES SELECIONADAS
// ==========================================================================
btnDetalhar.onclick = () => {
    if (!exigirLogin()) return;
    
    const checkboxes = document.querySelectorAll('.acao-checkbox:checked');
    if (checkboxes.length === 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Nenhuma ação selecionada',
            text: 'Por favor, selecione pelo menos uma ação estratégica.',
            confirmButtonColor: '#2563eb'
        });
        return;
    }

    acoesSelecionadas = [];
    checkboxes.forEach(cb => {
        const acao = window.acoesEstrategicas.find(a => a.id === cb.value);
        if (acao) acoesSelecionadas.push(acao);
    });

    preencherFormularioComAcoes(acoesSelecionadas);
    
    heroSection.style.display = "none";
    acoesTableContainer.style.display = "none";
    formulario.style.display = "block";
    tabelaRegistros.style.display = "none";

    floatingBtn.classList.remove('visible');
};

// ==========================================================================
// 7. FUNÇÕES DO FORMULÁRIO (MULTI-AÇÃO)
// ==========================================================================
function preencherFormularioComAcoes(acoes) {
    idRegistroSendoEditado = null;

    listaAcoesVinculadasEl.innerHTML = "";
    acoes.forEach(acao => {
        const item = document.createElement("div");
        item.className = "lista-acoes-item";
        item.innerHTML = `<span>✓ ${acao.id}</span> <span>${acao.diretriz}</span>`;
        listaAcoesVinculadasEl.appendChild(item);
    });

    camposForm.oque.value = "";
    camposForm.porque.value = "";
    camposForm.como.value = "";
    camposForm.quando.value = "";
    camposForm.onde.value = "";
    camposForm.quanto.value = "";
    camposForm.impacto.value = "";
    camposForm.observacao.value = "";
}

function limparSelecao() {
    document.querySelectorAll('.acao-checkbox').forEach(cb => cb.checked = false);
    acoesSelecionadas = [];
    listaAcoesVinculadasEl.innerHTML = "";
}

function limparFormulario() {
    Object.values(camposForm).forEach(campo => campo.value = "");
    idRegistroSendoEditado = null;
    limparSelecao();
}

btnLimpar.onclick = limparFormulario;

btnVoltarAcoes.onclick = () => {
    heroSection.style.display = "none";
    acoesTableContainer.style.display = "block";
    formulario.style.display = "none";
    tabelaRegistros.style.display = "none";
    limparFormulario();
    renderizarTabelaAcoes();
};

function gerarID() {
    return `${Date.now()}-${Math.floor(Math.random() * 100)}`;
}

function validarFormulario() {
    const camposObrigatorios = ['oque', 'porque', 'como', 'quando', 'onde', 'quanto', 'impacto'];
    return camposObrigatorios.every(chave => camposForm[chave].value.trim() !== "");
}

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

function gerarEstruturaAcoesVinculadas(acoes) {
    return acoes.map(a => ({
        id: a.id,
        diretriz: a.diretriz
    }));
}

// ==========================================================================
// 8. OPERAÇÕES DO FORMULÁRIO (SALVAR E ENVIAR)
// ==========================================================================
btnSalvarRascunho.onclick = async () => {
    if (!exigirLogin()) return;

    if (!validarFormulario()) {
        Swal.fire({
            icon: 'warning',
            title: 'Campos obrigatórios',
            text: 'Por favor, preencha todos os campos obrigatórios.',
            confirmButtonColor: '#2563eb'
        });
        return;
    }

    if (acoesSelecionadas.length === 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Ações não selecionadas',
            text: 'Selecione pelo menos uma ação estratégica.',
            confirmButtonColor: '#2563eb'
        });
        return;
    }

    const dadosAcao = capturarDadosFormulario();

    if (idRegistroSendoEditado) {
        const index = registros.findIndex(reg => reg.id === idRegistroSendoEditado);
        if (index !== -1) {
            registros[index] = {
                ...registros[index],
                ...dadosAcao,
                status: "Rascunho",
                dataEdicao: new Date().toLocaleString(),
                acoesEstrategicas: gerarEstruturaAcoesVinculadas(acoesSelecionadas) 
            };
            Swal.fire({
                icon: 'success',
                title: 'Rascunho salvo!',
                text: 'O rascunho foi atualizado com sucesso.',
                timer: 2000,
                showConfirmButton: false
            });
        }
        idRegistroSendoEditado = null;
    } else {
        const novoRegistro = {
            id: gerarID(),
            dataCriacao: new Date().toLocaleString(),
            status: "Rascunho",
            comentarioComite: "-",
            criadoPor: usuarioLogado.email,
            acoesEstrategicas: gerarEstruturaAcoesVinculadas(acoesSelecionadas),
            ...dadosAcao
        };
        registros.push(novoRegistro);
        
        Swal.fire({
            icon: 'success',
            title: 'Rascunho salvo!',
            text: `ID: ${novoRegistro.id}. Você pode continuar editando.`,
            timer: 3000,
            showConfirmButton: false
        });
        idRegistroSendoEditado = novoRegistro.id;
    }

    salvarBanco();
};

btnEnviarComite.onclick = async () => {
    if (!exigirLogin()) return;

    if (!validarFormulario()) {
        Swal.fire({
            icon: 'warning',
            title: 'Campos obrigatórios',
            text: 'Por favor, preencha todos os campos obrigatórios.',
            confirmButtonColor: '#2563eb'
        });
        return;
    }

    if (acoesSelecionadas.length === 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Ações não selecionadas',
            text: 'Selecione pelo menos uma ação estratégica.',
            confirmButtonColor: '#2563eb'
        });
        return;
    }

    const result = await Swal.fire({
        title: 'Confirmar envio',
        text: 'Deseja enviar o detalhamento para a aprovação dos conselheiros?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#2563eb',
        cancelButtonColor: '#e63946',
        confirmButtonText: 'Sim, enviar',
        cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

    const dadosAcao = capturarDadosFormulario();

    if (idRegistroSendoEditado) {
        const index = registros.findIndex(reg => reg.id === idRegistroSendoEditado);
        if (index !== -1) {
            registros[index] = { 
                ...registros[index], 
                ...dadosAcao, 
                status: "Enviado",
                acoesEstrategicas: gerarEstruturaAcoesVinculadas(acoesSelecionadas)
            };
        }
        idRegistroSendoEditado = null;
    } else {
        const novoRegistro = {
            id: gerarID(),
            dataCriacao: new Date().toLocaleString(),
            status: "Enviado",
            comentarioComite: "-",
            criadoPor: usuarioLogado.email,
            acoesEstrategicas: gerarEstruturaAcoesVinculadas(acoesSelecionadas),
            ...dadosAcao
        };
        registros.push(novoRegistro);
    }

    salvarBanco();
    Swal.fire({
        icon: 'success',
        title: 'Ação enviada!',
        text: 'O detalhamento foi enviado para análise.',
        timer: 2000,
        showConfirmButton: false
    });
    
    heroSection.style.display = "none";
    acoesTableContainer.style.display = "block";
    formulario.style.display = "none";
    tabelaRegistros.style.display = "none";
    limparFormulario();
    renderizarTabelaAcoes();
};

// ==========================================================================
// 9. TABELA DE REGISTROS (CONSULTA VISUAL E GERENCIAMENTO)
// ==========================================================================
function atualizarTabelaRegistros() {
    corpoTabelaRegistros.innerHTML = "";

    const esComite = Boolean(usuarioLogado && (usuarioLogado.role === 'comite' || usuarioLogado.role === 'admin'));

    let dadosFiltrados = registros;

    if (modoVisualizacao === "meus_rascunhos" && usuarioLogado) {
        dadosFiltrados = registros.filter(r => r.criadoPor === usuarioLogado.email && r.status === "Rascunho");
    }

    if (dadosFiltrados.length === 0) {
        corpoTabelaRegistros.innerHTML = `<tr><td colspan="9" class="table-empty-state">Nenhum registro encontrado</td></tr>`;
        return;
    }

    dadosFiltrados.forEach((registro) => {
        const linha = document.createElement("tr");
        let botoesAcao = "";

        // Lógica de permissões:
        // 1. Comitê: vê botões de Aprovar/Reprovar apenas em registros "Enviado".
        // 2. Usuário dono do Rascunho: vê botões de Editar/Excluir APENAS no modo "meus_rascunhos".
        // 3. Consulta Geral (btnConsultar): Apenas visualização para usuários comuns.

        if (esComite) {
            if (registro.status === "Enviado") {
                botoesAcao = `
                    <button onclick="avaliarAcao('${registro.id}', 'Aprovado')" class="button-aprovar" title="Aprovar">Aprovar</button>
                    <button onclick="avaliarAcao('${registro.id}', 'Reprovado')" class="button-reprovar" title="Reprovar">Reprovar</button>
                `;
            } else {
                botoesAcao = `<span class="table-status-text">Avaliado</span>`;
            }
        } else {
            // Usuário comum
            if (modoVisualizacao === "meus_rascunhos" && registro.criadoPor === usuarioLogado?.email) {
                botoesAcao = `
                    <button onclick="editarRegistro('${registro.id}')" class="button-editar" title="Editar">✏️</button>
                    <button onclick="excluirRegistro('${registro.id}')" class="button-excluir" title="Excluir">🗑️</button>
                `;
            } else {
                // Se for consulta geral, não mostra botões para o usuário comum
                botoesAcao = `<span class="table-status-text">${registro.status === 'Rascunho' ? 'Rascunho' : 'Em Análise'}</span>`;
            }
        }

        // Renderização das Ações Vinculadas (Compatibilidade)
        let colunaAcoes = "";
        if (registro.acoesEstrategicas && Array.isArray(registro.acoesEstrategicas)) {
            // Novo formato
            colunaAcoes = registro.acoesEstrategicas.map(a => 
                `<div><strong>${a.id}</strong> ${a.diretriz}</div>`
            ).join('');
        } else if (registro.acaoEstrategicaId) {
            // Formato antigo
            colunaAcoes = `<div><strong>${registro.acaoEstrategicaId}</strong> ${registro.acaoEstrategicaDiretriz || ''}</div>`;
        } else {
            colunaAcoes = "-";
        }

        linha.innerHTML = `
            <td>${registro.id || `ID-${Math.random().toString(36).substr(2, 4)}`}</td>
            <td>${colunaAcoes}</td>
            <td>${registro.oque}</td>
            <td>${registro.onde}</td>
            <td>${formatarData(registro.quando)}</td>
            <td>${formatarImpacto(registro.impacto)}</td>
            <td><span class="badge-${registro.status.toLowerCase()}">${registro.status}</span></td>
            <td><em>${registro.comentarioComite || "-"}</em></td>
            <td>${botoesAcao}</td>
        `;
        corpoTabelaRegistros.appendChild(linha);
    });
}

// ==========================================================================
// 10. AÇÕES DO COMITÊ E UTILITÁRIOS
// ==========================================================================
window.avaliarAcao = async function(id, novoStatus) {
    const index = registros.findIndex(reg => reg.id === id);
    if (index === -1) return;

    const { value: parecer } = await Swal.fire({
        title: `Avaliar ação - ${novoStatus}`,
        input: 'textarea',
        inputLabel: 'Digite seu parecer/comentário',
        inputPlaceholder: 'Seu parecer sobre esta ação...',
        showCancelButton: true,
        confirmButtonColor: novoStatus === 'Aprovado' ? '#2ecc71' : '#e63946',
        cancelButtonColor: '#6c757d',
        confirmButtonText: novoStatus === 'Aprovado' ? '✅ Aprovar' : '❌ Reprovar',
        cancelButtonText: 'Cancelar',
        inputValidator: (value) => {
            if (!value || value.trim() === '') {
                return 'Por favor, digite um parecer!';
            }
        }
    });

    if (parecer === null) return;

    registros[index].status = novoStatus;
    registros[index].comentarioComite = parecer.trim();

    salvarBanco();
    Swal.fire({
        icon: 'success',
        title: `Ação ${novoStatus}!`,
        text: `A ação foi ${novoStatus.toLowerCase()} com sucesso.`,
        timer: 2000,
        showConfirmButton: false
    });
    atualizarTabelaRegistros();
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

window.excluirRegistro = async function(id) {
    const index = registros.findIndex(reg => reg.id === id);
    if (index === -1) return;

    const result = await Swal.fire({
        title: 'Confirmar exclusão',
        text: `Deseja realmente excluir o rascunho ID: ${id}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#e63946',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sim, excluir',
        cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
        registros.splice(index, 1);
        salvarBanco();
        Swal.fire({
            icon: 'success',
            title: 'Excluído!',
            text: 'O rascunho foi removido.',
            timer: 2000,
            showConfirmButton: false
        });
        atualizarTabelaRegistros();
    }
};

window.editarRegistro = function(id) {
    const registro = registros.find(reg => reg.id === id);
    if (!registro) return;

    if (registro.acoesEstrategicas && Array.isArray(registro.acoesEstrategicas)) {
        acoesSelecionadas = registro.acoesEstrategicas.map(acaoRef => {
            return window.acoesEstrategicas.find(a => a.id === acaoRef.id) || acaoRef;
        });
    } else if (registro.acaoEstrategicaId) {
        const acao = window.acoesEstrategicas.find(a => a.id === registro.acaoEstrategicaId);
        acoesSelecionadas = acao ? [acao] : [{ id: registro.acaoEstrategicaId, diretriz: registro.acaoEstrategicaDiretriz || "" }];
    } else {
        acoesSelecionadas = [];
    }

    preencherFormularioComAcoes(acoesSelecionadas);

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
    acoesTableContainer.style.display = "none";
    formulario.style.display = "block";
    tabelaRegistros.style.display = "none";

    Swal.fire({
        icon: 'info',
        title: 'Rascunho carregado',
        text: 'Modifique as informações.',
        timer: 2500,
        showConfirmButton: false
    });
};

// ==========================================================================
// 11. LOGIN (Inalterado)
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    const loginButton = document.getElementById('loginButton');
    const loginModal = document.getElementById('loginModal');
    const closeLoginModal = document.getElementById('closeLoginModal');
    const loginForm = document.getElementById('loginForm');

    if (usuarioLogado && loginButton) {
        loginButton.textContent = 'Logout';
        loginButton.classList.add('is-logged-in');
    }

    if (loginButton && loginModal && closeLoginModal) {
        loginButton.onclick = async () => {
            if (estaLogado()) {
                const result = await Swal.fire({
                    title: 'Sair da sessão?',
                    text: 'Você tem certeza que deseja fazer logout?',
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonColor: '#e63946',
                    cancelButtonColor: '#6c757d',
                    confirmButtonText: 'Sim, sair',
                    cancelButtonText: 'Cancelar'
                });

                if (result.isConfirmed) {
                    limparSessao();
                    loginButton.textContent = 'Login';
                    loginButton.classList.remove('is-logged-in');
                    atualizarVisibilidadeMenu();
                    Swal.fire({
                        icon: 'success',
                        title: 'Logout realizado!',
                        timer: 1500,
                        showConfirmButton: false
                    });
                    if (tabelaRegistros.style.display === "block") atualizarTabelaRegistros();
                }
            } else {
                loginModal.style.display = 'flex';
            }
        };
        closeLoginModal.onclick = () => loginModal.style.display = 'none';
    }

    if (loginForm) {
        loginForm.onsubmit = async (e) => {
            e.preventDefault();
            const email = document.getElementById('username').value.trim().toLowerCase();
            const password = document.getElementById('password').value;

            const usuarioEncontrado = db.usuarios.find((u) => u.email === email && u.senha === password);

            if (usuarioEncontrado) {
                salvarSessao(usuarioEncontrado);
                loginModal.style.display = 'none';
                loginButton.textContent = 'Logout';
                loginButton.classList.add('is-logged-in');
                atualizarVisibilidadeMenu();

                if (tabelaRegistros.style.display === "block") atualizarTabelaRegistros();

                document.getElementById('username').value = "";
                document.getElementById('password').value = "";

                Swal.fire({
                    icon: 'success',
                    title: 'Login realizado!',
                    text: `Bem-vindo, ${usuarioEncontrado.email}`,
                    timer: 2000,
                    showConfirmButton: false
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Erro no login',
                    text: 'E-mail ou senha incorretos!',
                    confirmButtonColor: '#2563eb'
                });
            }
        };
    }

    // Inicialização
    heroSection.style.display = 'block';
    acoesTableContainer.style.display = 'none';
    formulario.style.display = 'none';
    tabelaRegistros.style.display = 'none';
    atualizarVisibilidadeMenu();
});