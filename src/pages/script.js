// script.js

const formulario = document.getElementById("formularioContainer");
const tabela = document.getElementById("registroView");

const btnNova = document.getElementById("AbrirAcaoButton");
const btnConsulta = document.getElementById("AbrirConsultaButton");
const btnSalvar = document.getElementById("salvarAcaoButton");
const btnLimpar = document.getElementById("limparFormulario");
const btnEnviar = document.getElementById("enviarAcaoButton");

const corpoTabela = document.getElementById("registroTableBody");

let registros = JSON.parse(localStorage.getItem("registros")) || [];

// Função para gerar ID único
function gerarID() {
    // Pega o timestamp atual em milissegundos
    const timestamp = Date.now();
    // Gera um número aleatório de 4 dígitos para evitar colisões
    const random = Math.floor(Math.random() * 10000);
    // Combina timestamp + random para criar um ID único
    return `${timestamp}-${random}`;
}

// Mostrar Formulário e Tabela
btnNova.onclick = () => {
    formulario.style.display = "block";
    tabela.style.display = "none";
}

btnConsulta.onclick = () => {
    formulario.style.display = "none";
    tabela.style.display = "block";
    atualizarTabela();
}

// Salvar Registro
btnSalvar.onclick = () => {
    // Verifica se todos os campos obrigatórios estão preenchidos
    const camposObrigatorios = [
        document.getElementById("f_oque").value,
        document.getElementById("f_porque").value,
        document.getElementById("f_como").value,
        document.getElementById("f_quando").value,
        document.getElementById("f_onde").value,
        document.getElementById("f_quanto").value,
        document.getElementById("f_impacto").value,
        document.getElementById("f_observacao").value
    ];

    if (camposObrigatorios.some(campo => campo.trim() === "")) {
        alert("Por favor, preencha todos os campos antes de salvar!");
        return;
    }

    const registro = {
        id: gerarID(), // Gera ID único para o registro
        oque: document.getElementById("f_oque").value,
        porque: document.getElementById("f_porque").value,
        como: document.getElementById("f_como").value,
        quando: document.getElementById("f_quando").value,
        onde: document.getElementById("f_onde").value,
        quanto: document.getElementById("f_quanto").value,
        impacto: document.getElementById("f_impacto").value,
        observacao: document.getElementById("f_observacao").value,
        dataCriacao: new Date().toLocaleString() // Adiciona data de criação
    };
    
    registros.push(registro);
    localStorage.setItem("registros", JSON.stringify(registros));
    alert(`Registro salvo com sucesso! ID: ${registro.id}`);
    limparFormulario();
}

// Limpar Formulário
btnLimpar.onclick = limparFormulario;

function limparFormulario() {
    document.getElementById("f_oque").value = "";
    document.getElementById("f_porque").value = "";
    document.getElementById("f_como").value = "";
    document.getElementById("f_quando").value = "";
    document.getElementById("f_onde").value = "";
    document.getElementById("f_quanto").value = "";
    document.getElementById("f_impacto").value = "";
    document.getElementById("f_observacao").value = "";
}

// Enviar Ação (simulação de envio)
btnEnviar.onclick = () => {
    // Verifica se há registros salvos
    if (registros.length === 0) {
        alert("Nenhum registro para enviar. Por favor, salve um registro primeiro.");
        return;
    }

    // Verifica se o registro atual está completo
    const camposObrigatorios = [
        document.getElementById("f_oque").value,
        document.getElementById("f_porque").value,
        document.getElementById("f_como").value,
        document.getElementById("f_quando").value,
        document.getElementById("f_onde").value,
        document.getElementById("f_quanto").value,
        document.getElementById("f_impacto").value,
        document.getElementById("f_observacao").value
    ];

    if (camposObrigatorios.some(campo => campo.trim() === "")) {
        alert("Por favor, preencha todos os campos antes de enviar!");
        return;
    }

    const confirmacao = confirm("Deseja enviar esta ação?");
    if (confirmacao) {
        const registro = {
            id: gerarID(),
            oque: document.getElementById("f_oque").value,
            porque: document.getElementById("f_porque").value,
            como: document.getElementById("f_como").value,
            quando: document.getElementById("f_quando").value,
            onde: document.getElementById("f_onde").value,
            quanto: document.getElementById("f_quanto").value,
            impacto: document.getElementById("f_impacto").value,
            observacao: document.getElementById("f_observacao").value,
            dataCriacao: new Date().toLocaleString(),
            status: "Enviado"
        };
        
        registros.push(registro);
        localStorage.setItem("registros", JSON.stringify(registros));
        alert(`Ação enviada com sucesso! ID: ${registro.id}`);
        limparFormulario();
    }
}

// Atualizar Tabela
function atualizarTabela() {
    corpoTabela.innerHTML = "";
    
    if (registros.length === 0) {
        const linha = document.createElement("tr");
        linha.innerHTML = `<td colspan="10" style="text-align: center;">Nenhum registro encontrado</td>`;
        corpoTabela.appendChild(linha);
        return;
    }

    registros.forEach((registro, index) => {
        const linha = document.createElement("tr");
        linha.innerHTML = `
            <td>${registro.id || `ID-${index + 1}`}</td>
            <td>${registro.oque}</td>
            <td>${registro.porque}</td>
            <td>${registro.onde}</td>
            <td>${formatarData(registro.quando)}</td>
            <td>${registro.como}</td>
            <td>${registro.quanto}</td>
            <td>${formatarImpacto(registro.impacto)}</td>
            <td>
                <button onclick="excluirRegistro(${index})" class="button-excluir">🗑️</button>
                <button onclick="editarRegistro(${index})" class="button-editar">✏️</button>
            </td>
        `;
        corpoTabela.appendChild(linha);
    });
}

// Função para formatar data
function formatarData(data) {
    if (!data) return "-";
    try {
        const partes = data.split('-');
        return `${partes[2]}/${partes[1]}/${partes[0]}`;
    } catch {
        return data;
    }
}

// Função para formatar impacto com cores
function formatarImpacto(impacto) {
    const cores = {
        'baixo': '🟢 Baixo',
        'medio': '🟡 Médio',
        'alto': '🔴 Alto'
    };
    return cores[impacto] || impacto;
}

// Excluir Registro
function excluirRegistro(index) {
    if (confirm(`Deseja excluir o registro ${registros[index].id || index + 1}?`)) {
        registros.splice(index, 1);
        localStorage.setItem("registros", JSON.stringify(registros));
        atualizarTabela();
    }
}

// Editar Registro
function editarRegistro(index) {
    const registro = registros[index];
    
    // Preenche o formulário com os dados do registro
    document.getElementById("f_oque").value = registro.oque || "";
    document.getElementById("f_porque").value = registro.porque || "";
    document.getElementById("f_como").value = registro.como || "";
    document.getElementById("f_quando").value = registro.quando || "";
    document.getElementById("f_onde").value = registro.onde || "";
    document.getElementById("f_quanto").value = registro.quanto || "";
    document.getElementById("f_impacto").value = registro.impacto || "";
    document.getElementById("f_observacao").value = registro.observacao || "";
    
    // Mostra o formulário
    formulario.style.display = "block";
    tabela.style.display = "none";
    
    // Remove o registro da lista para ser readicionado após edição
    registros.splice(index, 1);
    localStorage.setItem("registros", JSON.stringify(registros));
    
    alert("Registro carregado para edição. Faça as alterações e clique em Salvar.");
}

// Verificação de login (exemplo)
document.addEventListener('DOMContentLoaded', () => {
    const loginButton = document.getElementById('loginButton');
    const loginModal = document.getElementById('loginModal');
    const closeLoginModal = document.getElementById('closeLoginModal');
    const loginForm = document.getElementById('loginForm');

    if (loginButton) {
        loginButton.onclick = () => {
            loginModal.style.display = 'block';
        };
    }

    if (closeLoginModal) {
        closeLoginModal.onclick = () => {
            loginModal.style.display = 'none';
        };
    }

    if (loginForm) {
        loginForm.onsubmit = (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            // Login simples (apenas demonstração)
            if (username === 'admin' && password === 'admin') {
                alert('Login realizado com sucesso!');
                localStorage.setItem('usuarioLogado', 'true');
                loginModal.style.display = 'none';
                document.getElementById('loginButton').textContent = 'Logout';
                document.getElementById('loginButton').style.backgroundColor = '#e74c3c';
            } else {
                alert('Usuário ou senha incorretos!');
            }
        };
    }

    // Inicializa a visualização
    formulario.style.display = 'block';
    tabela.style.display = 'none';
});

// Adiciona estilo para os botões de ação da tabela
const styleSheet = document.createElement("style");
styleSheet.textContent = `
    .button-excluir {
        background-color: #e74c3c;
        color: white;
        border: none;
        border-radius: 4px;
        padding: 5px 10px;
        margin: 2px;
        cursor: pointer;
        font-size: 14px;
    }
    .button-excluir:hover {
        background-color: #c0392b;
    }
    .button-editar {
        background-color: #3498db;
        color: white;
        border: none;
        border-radius: 4px;
        padding: 5px 10px;
        margin: 2px;
        cursor: pointer;
        font-size: 14px;
    }
    .button-editar:hover {
        background-color: #2980b9;
    }
`;
document.head.appendChild(styleSheet);