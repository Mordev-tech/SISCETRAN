//Base

const formulario = document.getElementById("formularioContainer");
const tabela = document.getElementById("registroView");

const btnNova = document.getElementById("AbrirAcaoButton");
const btnConsulta = document.getElementById("AbrirConsultaButton");
const btnSalvar = document.getElementById("salvarAcaoButton");

const corpoTabela = document.getElementById("registroTableBody");

let registros = JSON.parse(localStorage.getItem("registros")) || [];

//Mostrar Formulario e Tabela
btnNova.onclick = () => {

    formulario.style.display = "block";
    tabela.style.display = "none";

}

btnConsulta.onclick = () => {

    formulario.style.display = "none";
    tabela.style.display = "block";

    atualizarTabela();

}

//Salvar Registro
btnSalvar.onclick = () => {

    const registro = {
        oque: document.getElementById("f_oque").value,
        porque: document.getElementById("f_porque").value,
        como: document.getElementById("f_como").value,
        quando: document.getElementById("f_quando").value,
        onde: document.getElementById("f_onde").value,
        quanto: document.getElementById("f_quanto").value,
        impacto: document.getElementById("f_impacto").value,
        observacao: document.getElementById("f_observacao").value
    };
    registros.push(registro);
    localStorage.setItem("registros", JSON.stringify(registros));
    alert("Registro salvo com sucesso!");
    limparFormulario();
    };

//Limpar Formulario
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

//Atualizar Tabela
function atualizarTabela() {
    corpoTabela.innerHTML = "";
    registros.forEach((registro, index) => {
        const linha = document.createElement("tr");
        linha.innerHTML = `
            <td>${registro.oque}</td>
            <td>${registro.porque}</td>
            <td>${registro.como}</td>
            <td>${registro.quando}</td>
            <td>${registro.onde}</td>
            <td>${registro.quanto}</td>
            <td>${registro.impacto}</td>,
            <td>${registro.observacao}</td>
        `;
        corpoTabela.appendChild(linha);
    });
}

//Excluir

function excluirRegistro(index) {
    if(confirm("Você deseja excluir este registro?")) {
        registros.splice(index, 1);
        localStorage.setItem("registros", JSON.stringify(registros));
        atualizarTabela();
    }
}