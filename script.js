(function () {

'use strict';

window.celk = window.celk || {};

window.celk.version = "1.0";

if (window.celk.running) {

    console.log("CELK Helper já carregado.");

    if (typeof window.celk.init === "function") {
        window.celk.init();
    }

    return;
}

window.celk.running = true;
    const CONFIG = {

    refreshSeconds: Number(
        localStorage.getItem("celk_refresh") || 5
    )

};

const hoje = new Date().toLocaleDateString("pt-BR");

if(localStorage.getItem("celk_relatorio_data") !== hoje){

    localStorage.setItem("celk_relatorio_data", hoje);

    localStorage.setItem("celk_relatorio","[]");

}

let refreshTimer=null;
    //--------------------------------------------------
// INICIAR
//--------------------------------------------------

window.celk.init = function(){

    criarInterface();

    if(window.celk.intervalo) return;

    window.celk.intervalo = setInterval(function(){

        if(!document.getElementById("celk-helper")){

            console.log("Barra recriada.");

            criarInterface();

        }

    },1000);

};
//--------------------------------------------------
// INTERFACE
//--------------------------------------------------

function criarInterface(){

    if(document.getElementById("celk-helper")) return;

    const barra=document.createElement("div");

    barra.id="celk-helper";
    window.celkHelperBar = barra;

  barra.style.cssText=`
width:100%;
height:56px;

display:flex;
align-items:center;

background:#f5f5f5;

border:1px solid #c8c8c8;

box-sizing:border-box;

font-family:Segoe UI,Arial,sans-serif;

font-size:16px;

box-shadow:0 2px 6px rgba(0,0,0,.15);
`;

    //--------------------------------------------------
// BOTÃO ATENDIMENTO
//--------------------------------------------------

const atendimento = document.createElement("button");

atendimento.innerHTML = "🩺 Atendimento";

atendimento.style.cssText=`
flex:0 0 260px;

height:100%;

display:flex;
align-items:center;
justify-content:center;

font-size:18px;
font-weight:bold;

background:transparent;

color:#222;

border:none;
border-right:1px solid #d8d8d8;

cursor:pointer;

user-select:none;
`;

atendimento.onclick = preencherEvolucao;

atendimento.onmouseover=function(){
    atendimento.style.background="#ececec";
};

atendimento.onmouseout=function(){
    atendimento.style.background="transparent";
};

    const painel=document.createElement("div");

painel.style.cssText=`
display:flex;
align-items:center;
gap:15px;

height:100%;

padding:0 20px;

background:#f8f8f8;

flex:1;
`;
//--------------------------------------------------
// BOTÃO RELATÓRIO
//--------------------------------------------------

const relatorio=document.createElement("div");

relatorio.innerHTML="📋 Relatório";

relatorio.style.cssText=`
display:flex;
align-items:center;
justify-content:center;

height:100%;

padding:0 28px;

font-size:18px;
font-weight:bold;

color:#222;

cursor:pointer;

user-select:none;

border-left:1px solid #d8d8d8;
`;

relatorio.onmouseover=function(){
    relatorio.style.background="#ececec";
};

relatorio.onmouseout=function(){
    relatorio.style.background="transparent";
};

relatorio.onclick=abrirRelatorio;
    const atualizar=document.createElement("div");

atualizar.innerHTML="🔄 Atualizar";

atualizar.style.cssText=`
display:flex;
align-items:center;
justify-content:center;

height:100%;

padding:0 28px;

font-size:18px;
font-weight:bold;

color:#222;

cursor:pointer;

user-select:none;

border-left:1px solid #d8d8d8;
`;

atualizar.onmouseover=function(){
    atualizar.style.background="#ececec";
};

atualizar.onmouseout=function(){
    atualizar.style.background="transparent";
};

//--------------------------------------------------
// BOTÃO CID
//--------------------------------------------------

const cid=document.createElement("div");

cid.innerHTML="📋 CID";

cid.style.cssText=`
display:flex;
align-items:center;
justify-content:center;

height:100%;

padding:0 28px;

font-size:18px;
font-weight:bold;

color:#222;

cursor:pointer;

user-select:none;

border-left:1px solid #d8d8d8;
`;

cid.onmouseover=function(){
    cid.style.background="#ececec";
};

cid.onmouseout=function(){
    cid.style.background="transparent";
};

cid.onclick=abrirMenuCID;
window.preencherCID = function(cid){

    const campo = document.querySelector(
        'input[name*="cid:descricao:textField"]'
    );

    if(!campo){
        alert("Campo CID não encontrado.");
        return;
    }

    const dados = $(campo).data();

    if(!dados || !dados.tokenInputObject){
        alert("TokenInput não encontrado.");
        return;
    }

    const token = dados.tokenInputObject;

    token.clear();

    const item = {
        id: cid.replace(/\./g,""),
        name: "( " + cid.replace(/\./g,"") + " ) " + cid
    };

    token.add(item);

    if(typeof dados.settings.onAdd === "function"){
    dados.settings.onAdd(item);
}

setTimeout(() => {

    // MÉDICO
    const select = document.querySelector(
        'select[name*="profissional"]'
    );

   if (select) {

    select.value = "96829844";

    select.dispatchEvent(new Event("change", {
        bubbles: true
    }));

}

atualizarCamposAlta();

    // MOTIVO = MELHORADO
    const motivo = document.querySelector(
        'select[name*="motivo"]'
    );

    if (motivo) {

        const op = [...motivo.options].find(o =>
            o.text.trim().toUpperCase() === "MELHORADO"
        );

        if (op) {

            motivo.value = op.value;

            motivo.dispatchEvent(new Event("change", {
                bubbles: true
            }));
        }
    }

       // CLASSIFICAÇÃO = OUTROS
    const classificacao = document.querySelector(
        'select[name*="classificacaoAtendimento"]'
    );

    if (classificacao) {

        const op = [...classificacao.options].find(o =>
            o.text.trim().toUpperCase() === "OUTROS"
        );

        if (op) {

            classificacao.value = op.value;

            classificacao.dispatchEvent(new Event("change", {
                bubbles: true
            }));

        }

    }

}, 500);

};

function selecionarOpcao(select, texto){

    if(!select) return;

    const op = [...select.options].find(o =>
        o.text.trim().toUpperCase() === texto.toUpperCase()
    );

    if(op){

        select.value = op.value;

        select.dispatchEvent(new Event("change",{
            bubbles:true
        }));

    }

}
function atualizarCamposAlta(){

    selecionarOpcao(
        document.querySelector('select[name*="motivo"]'),
        "OUTROS"
    );

    selecionarOpcao(
        document.querySelector('select[name*="classificacaoAtendimento"]'),
        "MELHORADO"
    );

}
painel.appendChild(relatorio);
painel.appendChild(cid);
painel.appendChild(atualizar);
    

barra.appendChild(atendimento);
barra.appendChild(painel);

const topo = document.querySelector("#bar-holder");

if (topo) {

    topo.insertAdjacentElement("afterend", barra);

} else {

    document.body.appendChild(barra);

}
const menu=document.createElement("div");

menu.style.cssText=`
display:none;
position:absolute;
top:100%;
left:260px;
background:white;

border:1px solid #bbb;

padding:15px;

box-shadow:0 4px 12px rgba(0,0,0,.25);

z-index:99999999;
`;

menu.innerHTML=`
<div style="font-size:17px;font-weight:bold;margin-bottom:10px">
Atualização
</div>

<div style="margin-bottom:10px">
Tempo:
<input id="celkTempo"
type="number"
value="${CONFIG.refreshSeconds}"
style="width:70px">
segundos
</div>

<button id="celkAgora">
🔄 Atualizar agora
</button>

<br><br>

<button id="celkParar">
⏹ Parar atualização
</button>
`;

barra.appendChild(menu);
iniciarAtualizacao();
    setTimeout(()=>{

document.getElementById("celkAgora").onclick=function(){

    const tempo = Number(document.getElementById("celkTempo").value);

if(tempo <= 0){

    alert("Informe um tempo maior que 0.");

    return;

}

CONFIG.refreshSeconds = tempo;

    localStorage.setItem(
        "celk_refresh",
        CONFIG.refreshSeconds
    );

    clicarPesquisar();

    iniciarAtualizacao();

};
        document.getElementById("celkParar").onclick=function(){

    clearInterval(refreshTimer);

    refreshTimer=null;

    CONFIG.refreshSeconds=0;

    localStorage.setItem("celk_refresh",0);

    document.getElementById("celkTempo").value=0;

};

document.getElementById("celkTempo").onchange=function(){

CONFIG.refreshSeconds=Number(this.value);

localStorage.setItem("celk_refresh",CONFIG.refreshSeconds);

iniciarAtualizacao();

};

},100);
    atualizar.onclick=function(e){

    e.stopPropagation();

    menu.style.display=
        menu.style.display==="block"
        ?"none"
        :"block";

};
// Fecha ao clicar fora
document.addEventListener("click",function(e){

    if(menu.style.display==="none") return;

    if(
        !menu.contains(e.target) &&
        !atualizar.contains(e.target)
    ){
        menu.style.display="none";
    }

});

// Fecha com ESC
document.addEventListener("keydown",function(e){

    if(e.key==="Escape"){
        menu.style.display="none";
    }

});

}
    //--------------------------------------------------
// PREENCHER EVOLUÇÃO
//--------------------------------------------------

function preencherEvolucao(){

    if(typeof tinymce==="undefined" || !tinymce.activeEditor){

        alert("Abra a tela de Evolução.");

        return;

    }

    const tela=document.body.innerText;

let alergia = "NEGA";

const mAlergia = tela.match(
    /(?:ALERGIA(?:S)?|ALÉRGIC[AO]\s+A)\s*:?\s*([^\n\r]+)/i
);

if (mAlergia) {

    let valor = mAlergia[1]
        .replace(/\[\+\]/g, "")
        .replace(/\[-\]/g, "")
        .replace(/\./g, "")
        .trim();

    if (
        valor &&
        !/^(ANOTAÇÕES?|OBSERVAÇÕES?|OBSERVACOES?|NEGA|NENHUMA|NAO|NÃO|SEM INFORMAÇÕES?|SEM INFORMACOES?)$/i.test(valor)
    ) {
        alergia = valor;
    }

}

    function obter(regex){

        const m=tela.match(regex);

        return m ? m[1] : "NT";

    }

    const peso=obter(/Peso:\s*([\d.,]+)/i);

    const fc=obter(/(?:F\.?C\.?|FC|Frequência Cardíaca)\s*:?\s*([\d.,]+)/i);

    const fr=obter(/(?:F\.?R\.?|FR|Frequência Respiratória|Freq\.?\s*Resp\.?)\s*:?\s*([\d.,]+)/i);

    const sat=obter(/(?:Sat\.?Ox\.?|Sat\.?|Saturação|SpO2|SpO₂)\s*:?\s*([\d.,]+)/i);

    const temp=obter(/(?:Temperatura|Temp\.?)\s*:?\s*([\d.,]+)/i);

   const numero = document.location.href.match(/Prontuario:(\d+)/i)?.[1] || "NT";

const cabecalho = tela.match(
/([A-ZÁÀÂÃÉÊÍÓÔÕÚÇ ]+)\s*\|\s*([^|]+)\s*\|\s*DN:/i
);

const nome = cabecalho ? cabecalho[1].trim() : "Não encontrado";

const idade = cabecalho ? cabecalho[2].trim() : "";



    const texto=`PACIENTE COM QUADRO DE


# PESO: ${peso} kg | FC: ${fc} | FR: ${fr} | SAT: ${sat} | TEMP: ${temp}°C

# ALERGIAS: ${alergia}

# CMB: NEGA


# EXAME FÍSICO

- OROFARINGE SEM ALTERAÇÕES

- BEG, CALMO, ATIVO, COLABORATIVO, AAA, EUPNEICO, NORMOCORADO, HIDRATADO

- MV+ EM AHT, SEM RA, SEM DESCONFORTO RESPIRATÓRIO


# CD:

- PRESCREVO SINTOMÁTICOS

- ORIENTO SINAIS E SINTOMAS DE ALARME E RETORNO, SE NECESSÁRIO

- FORNEÇO ATESTADO MÉDICO`;

    tinymce.activeEditor.setContent("<pre>"+texto+"</pre>");
// O RELATÓRIO NÃO É REGISTRADO AQUI.
// A ENTRADA É CAPTURADA QUANDO O NOME DO PACIENTE É CLICADO.
// A SAÍDA É CAPTURADA NA FINALIZAÇÃO DO ATENDIMENTO.

}
    //--------------------------------------------------
// ATUALIZAÇÃO AUTOMÁTICA
//--------------------------------------------------

function iniciarAtualizacao(){

    if(refreshTimer){

        clearInterval(refreshTimer);

    }

    if(CONFIG.refreshSeconds<=0){

        return;

    }

    refreshTimer=setInterval(function(){

        clicarPesquisar();

    },CONFIG.refreshSeconds*1000);

}

//--------------------------------------------------
// =========================================================
// RELATÓRIO DO PLANTÃO — FLUXO ROBUSTO
//
// ENTRADA:
//   registrada quando o NOME DO PACIENTE é clicado na tabela
//   Consulta de Atendimentos.
//   A chegada vem EXCLUSIVAMENTE da célula cells_8 da linha.
//   NÃO usa o "Último acesso" do topo nem o horário atual.
//
// SAÍDA:
//   registrada quando o botão real "Salvar Atendimento" /
//   "Finalizar Prontuário" é clicado.
//   O registro é feito em CAPTURE, antes da navegação do CELK.
//   Há ainda um fallback pela mensagem "Atendimento finalizado com sucesso".
// =========================================================

function normalizarCelk(valor){
    return String(valor || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[\u200B-\u200D\uFEFF]/g, "")
        .replace(/[^A-Z0-9\s]/gi, " ")
        .replace(/\s+/g, " ")
        .trim()
        .toUpperCase();
}

function normalizarClassificacaoTexto(valor){
    return String(valor || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[\u200B-\u200D\uFEFF]/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .toUpperCase();
}

function classeParaClassificacao(elemento){
    if(!elemento) return "NÃO IDENTIFICADA";

    const classes = String(elemento.className || "").toLowerCase();

    if(/(?:^|\s)ball-red(?:\s|$)/.test(classes)) return "VERMELHO";
    if(/(?:^|\s)ball-orange(?:\s|$)/.test(classes)) return "LARANJA";
    if(/(?:^|\s)ball-yellow(?:\s|$)/.test(classes)) return "AMARELO";
    if(/(?:^|\s)ball-green(?:\s|$)/.test(classes)) return "VERDE";
    if(/(?:^|\s)ball-blue(?:\s|$)/.test(classes)) return "AZUL";

    const conteudo = normalizarClassificacaoTexto(
        elemento.textContent ||
        elemento.getAttribute("title") ||
        elemento.getAttribute("aria-label") ||
        elemento.getAttribute("data-title") || ""
    );

    if(/VERMELHO|RED/.test(conteudo)) return "VERMELHO";
    if(/LARANJA|ORANGE/.test(conteudo)) return "LARANJA";
    if(/AMARELO|YELLOW/.test(conteudo)) return "AMARELO";
    if(/VERDE|GREEN/.test(conteudo)) return "VERDE";
    if(/AZUL|BLUE/.test(conteudo)) return "AZUL";

    return "NÃO IDENTIFICADA";
}

function pareceNomePaciente(texto){
    const t = normalizarClassificacaoTexto(texto);

    if(!t || t.length < 5 || /\d/.test(t)) return false;

    if(/^(PACIENTE|PRIORIDADE|PROCEDIMENTO|CLASSIFICACAO|CLASSIFICAÇÃO|CR|LEITO|TEMPO|CHEGADA|ATENDIDO|SITUACAO|SITUAÇÃO|TIPO DE ATENDIMENTO|PESQUISAR|PROCURAR)$/.test(t)){
        return false;
    }

    if(/UP1|ATENDIMENTO|PEDIATR|MEDICACAO|MEDICAÇÃO|COLETA|EMERGENCIA|EMERGÊNCIA|IDOSOS|URGENCIA|URGÊNCIA/.test(t)){
        return false;
    }

    return t.split(/\s+/).filter(Boolean).length >= 2;
}

function nomeDaLinha(tr){
    if(!tr) return "";

    // Estrutura confirmada no CELK:
    // cells_4 = classificação / bolinha
    // cells_5 = NOME
    const nomeCelula = tr.querySelector('td[wicketpath*="_cells_5_cell"]');

    if(nomeCelula){
        const nome = String(
            nomeCelula.innerText || nomeCelula.textContent || ""
        ).replace(/\s+/g," ").trim();

        if(nome) return nome;
    }

    const celulas = Array.from(tr.querySelectorAll("td,th"));

    for(const td of celulas){
        const texto = String(td.innerText || td.textContent || "")
            .replace(/\s+/g," ")
            .trim();

        if(pareceNomePaciente(texto)) return texto;
    }

    return "";
}

function obterLinhaDoEventoCELK(evento){
    if(!evento) return null;

    try{
        const alvo = evento.target;

        if(alvo && alvo.closest){
            const tr = alvo.closest("tr");
            if(tr) return tr;
        }

        if(typeof evento.composedPath === "function"){
            for(const item of evento.composedPath()){
                if(item && item.tagName === "TR") return item;
                if(item && item.closest){
                    const tr = item.closest("tr");
                    if(tr) return tr;
                }
            }
        }
    }catch(_){ }

    return null;
}

function salvarClassificacaoCache(nome,classificacao){
    nome = normalizarClassificacaoTexto(nome);

    if(!nome || !classificacao || classificacao === "NÃO IDENTIFICADA"){
        return;
    }

    let cache = {};

    try{
        cache = JSON.parse(
            localStorage.getItem("celk_classificacoes_cache") || "{}"
        );
    }catch(_){
        cache = {};
    }

    cache[nome] = classificacao;

    try{
        localStorage.setItem(
            "celk_classificacoes_cache",
            JSON.stringify(cache)
        );
    }catch(_){ }

    try{
        atualizarClassificacaoNoRelatorio(nome,classificacao);
    }catch(_){ }
}

function nomeClassificacaoPorEstruturaCELK(tr){
    if(!tr) return null;

    const bolaCelula = tr.querySelector(
        'td[wicketpath*="_cells_4_cell"]'
    );

    const nomeCelula = tr.querySelector(
        'td[wicketpath*="_cells_5_cell"]'
    );

    const bola = bolaCelula && bolaCelula.querySelector(
        '[class~="ball-red"],[class~="ball-orange"],[class~="ball-yellow"],[class~="ball-green"],[class~="ball-blue"]'
    );

    if(bola && nomeCelula){
        const nome = String(
            nomeCelula.innerText || nomeCelula.textContent || ""
        ).replace(/\s+/g," ").trim();

        const classificacao = classeParaClassificacao(bola);

        if(
            nome &&
            pareceNomePaciente(nome) &&
            classificacao !== "NÃO IDENTIFICADA"
        ){
            return {nome,classificacao};
        }
    }

    return null;
}

function capturarClassificacaoDaLinha(tr){
    if(!tr) return false;

    const exata = nomeClassificacaoPorEstruturaCELK(tr);

    if(exata){
        salvarClassificacaoCache(
            exata.nome,
            exata.classificacao
        );
        return true;
    }

    const bola = tr.querySelector(
        '.icon32.ball-red,.icon32.ball-orange,.icon32.ball-yellow,.icon32.ball-green,.icon32.ball-blue,' +
        '[class~="ball-red"],[class~="ball-orange"],[class~="ball-yellow"],[class~="ball-green"],[class~="ball-blue"]'
    );

    if(!bola) return false;

    const classificacao = classeParaClassificacao(bola);

    if(classificacao === "NÃO IDENTIFICADA") return false;

    const nome = nomeDaLinha(tr);

    if(!nome) return false;

    salvarClassificacaoCache(nome,classificacao);
    return true;
}

function sincronizarClassificacoesDaTabela(){
    const linhas = Array.from(
        document.querySelectorAll("table tbody tr, table tr")
    );

    linhas.forEach(function(tr){
        try{ capturarClassificacaoDaLinha(tr); }catch(_){ }
    });
}

function obterClassificacaoDoCache(nomePaciente){
    const nome = normalizarClassificacaoTexto(nomePaciente);

    if(!nome) return "NÃO IDENTIFICADA";

    try{
        const cache = JSON.parse(
            localStorage.getItem("celk_classificacoes_cache") || "{}"
        );

        return cache[nome] || "NÃO IDENTIFICADA";
    }catch(_){
        return "NÃO IDENTIFICADA";
    }
}

function obterClassificacao(nomePaciente){
    const nome = normalizarClassificacaoTexto(nomePaciente);

    if(!nome) return "NÃO IDENTIFICADA";

    const linhas = Array.from(
        document.querySelectorAll("table tbody tr, table tr")
    );

    for(const tr of linhas){
        const nomeLinha = normalizarClassificacaoTexto(
            nomeDaLinha(tr)
        );

        if(!nomeLinha || nomeLinha !== nome) continue;

        const bola = tr.querySelector(
            '[class~="ball-red"],[class~="ball-orange"],[class~="ball-yellow"],[class~="ball-green"],[class~="ball-blue"]'
        );

        const classificacao = classeParaClassificacao(bola);

        if(classificacao !== "NÃO IDENTIFICADA"){
            salvarClassificacaoCache(nome,classificacao);
            return classificacao;
        }
    }

    return obterClassificacaoDoCache(nome);
}

// =========================================================
// ENTRADA — CLIQUE NO NOME DO PACIENTE
// =========================================================

function extrairDadosDaLinhaPaciente(tr){
    if(!tr){
        return {
            nome:"",
            idade:"",
            chegada:"",
            classificacao:"NÃO IDENTIFICADA"
        };
    }

    const nomeCelula = tr.querySelector(
        'td[wicketpath*="_cells_5_cell"]'
    );

    const idadeCelula = tr.querySelector(
        'td[wicketpath*="_cells_6_cell"]'
    );

    const chegadaCelula = tr.querySelector(
        'td[wicketpath*="_cells_8_cell"]'
    );

    const bolaCelula = tr.querySelector(
        'td[wicketpath*="_cells_4_cell"]'
    );

    const nome = String(
        (nomeCelula && (nomeCelula.innerText || nomeCelula.textContent)) ||
        nomeDaLinha(tr) || ""
    ).replace(/\s+/g," ").trim();

    const idade = String(
        (idadeCelula && (idadeCelula.innerText || idadeCelula.textContent)) ||
        ""
    ).replace(/\s+/g," ").trim();

    const chegadaTexto = String(
        (chegadaCelula && (chegadaCelula.innerText || chegadaCelula.textContent)) ||
        ""
    ).replace(/\s+/g," ").trim();

    // IMPORTANTE: pega o horário da CÉLULA DA CHEGADA.
    // Ex.: "12/08/2026 - 16:33 BRT"
    let chegada = "";

    const mChegada = chegadaTexto.match(
        /(?:\d{2}\/\d{2}\/\d{4}\s*-\s*)?(\d{2}:\d{2})/
    );

    if(mChegada){
        chegada = mChegada[1];
    }

    let classificacao = "NÃO IDENTIFICADA";

    const bola = bolaCelula && bolaCelula.querySelector(
        '[class~="ball-red"],[class~="ball-orange"],[class~="ball-yellow"],[class~="ball-green"],[class~="ball-blue"]'
    );

    if(bola){
        classificacao = classeParaClassificacao(bola);
    }

    if(classificacao === "NÃO IDENTIFICADA" && nome){
        classificacao = obterClassificacaoDoCache(nome);
    }

    return {
        nome,
        idade,
        chegada,
        classificacao
    };
}

function preRegistrarNoRelatorio(nome,idade,chegada,classificacao){
    nome = String(nome || "").trim();

    if(!nome || nome === "Não encontrado") return false;

    let classificacaoResolvida = String(
        classificacao || ""
    ).trim();

    if(
        !classificacaoResolvida ||
        classificacaoResolvida === "NÃO IDENTIFICADA"
    ){
        classificacaoResolvida = obterClassificacaoDoCache(nome);
    }

    if(
        classificacaoResolvida === "NÃO IDENTIFICADA"
    ){
        classificacaoResolvida = obterClassificacao(nome);
    }

    if(!classificacaoResolvida){
        classificacaoResolvida = "NÃO IDENTIFICADA";
    }

    const lista = obterListaRelatorio();

    let paciente = localizarPacienteNoRelatorio(
        lista,
        nome,
        chegada
    );

    if(!paciente){
        paciente = {
            numero:lista.length + 1,
            nome:nome,
            idade:String(idade || "").trim(),
            classificacao:classificacaoResolvida,
            chegada:String(chegada || "").trim(),
            atendido:"",
            tempo:""
        };

        lista.push(paciente);
    }else{
        if(idade) paciente.idade = String(idade).trim();
        if(chegada) paciente.chegada = String(chegada).trim();

        if(
            classificacaoResolvida &&
            classificacaoResolvida !== "NÃO IDENTIFICADA"
        ){
            paciente.classificacao = classificacaoResolvida;
        }
    }

    salvarListaRelatorio(lista);

    console.log(
        "[CELK RELATÓRIO] ENTRADA REGISTRADA:",
        paciente.nome,
        "| IDADE:",paciente.idade,
        "| CLASSIFICAÇÃO:",paciente.classificacao,
        "| CHEGADA:",paciente.chegada
    );

    return true;
}

function salvarPacientePendente(nome,idade,chegada,classificacao){
    const dados = {
        nome:String(nome || "").trim(),
        idade:String(idade || "").trim(),
        chegada:String(chegada || "").trim(),
        classificacao:String(classificacao || "NÃO IDENTIFICADA").trim(),
        salvoEm:Date.now()
    };

    if(!dados.nome) return;

    try{
        let historico = JSON.parse(
            localStorage.getItem("celk_pendentes_historico") || "[]"
        );

        if(!Array.isArray(historico)) historico=[];

        historico.push(dados);

        if(historico.length > 30){
            historico = historico.slice(-30);
        }

        localStorage.setItem(
            "celk_pendentes_historico",
            JSON.stringify(historico)
        );

        localStorage.setItem(
            "celk_paciente_pendente",
            JSON.stringify(dados)
        );
    }catch(_){ }

    preRegistrarNoRelatorio(
        dados.nome,
        dados.idade,
        dados.chegada,
        dados.classificacao
    );
}

function instalarCapturaCliquePaciente(){
    if(window.celk.cliquePacienteRelatorioHook) return;

    window.celk.cliquePacienteRelatorioHook = true;

    function capturar(evento){
        try{
            const alvo = evento && evento.target;

            if(!alvo || !alvo.closest) return;

            // O clique precisa ser no NOME, não no restante da linha.
            const nomeCelula = alvo.closest(
                'td[wicketpath*="_cells_5_cell"]'
            );

            if(!nomeCelula) return;

            const tr = nomeCelula.closest("tr");

            if(!tr) return;

            const dados = extrairDadosDaLinhaPaciente(tr);

            if(!dados.nome || !dados.chegada){
                console.warn(
                    "[CELK RELATÓRIO] NÃO FOI POSSÍVEL EXTRAIR NOME/CHEGADA DA LINHA.",
                    dados
                );
                return;
            }

            // Guarda tudo ANTES do CELK navegar/remover a linha.
            salvarClassificacaoCache(
                dados.nome,
                dados.classificacao
            );

            salvarPacientePendente(
                dados.nome,
                dados.idade,
                dados.chegada,
                dados.classificacao
            );

        }catch(err){
            console.error(
                "[CELK RELATÓRIO] ERRO AO CAPTURAR CLIQUE DO PACIENTE:",
                err
            );
        }
    }

    document.addEventListener("pointerdown",capturar,true);
    document.addEventListener("mousedown",capturar,true);
    document.addEventListener("click",capturar,true);

    console.log(
        "[CELK RELATÓRIO] CAPTURA DE ENTRADA PELO NOME INSTALADA."
    );
}

// =========================================================
// SAÍDA — FINALIZAÇÃO DO ATENDIMENTO
// =========================================================

function calcularTempoRelatorio(chegada,agora){
    if(
        !chegada ||
        !/^\d{1,2}:\d{2}$/.test(String(chegada).trim())
    ){
        return "";
    }

    const partes = String(chegada).trim().split(":");
    const inicio = new Date(agora);

    inicio.setHours(
        Number(partes[0]),
        Number(partes[1]),
        0,
        0
    );

    let minutos = Math.floor(
        (agora - inicio) / 60000
    );

    if(minutos < 0){
        minutos += 24 * 60;
    }

    return minutos + " min";
}

function obterListaRelatorio(){
    try{
        const lista = JSON.parse(
            localStorage.getItem("celk_relatorio") || "[]"
        );

        return Array.isArray(lista) ? lista : [];
    }catch(_){
        return [];
    }
}

function renumerarRelatorio(lista){
    lista.forEach(function(paciente,indice){
        paciente.numero = indice + 1;
    });
}

function salvarListaRelatorio(lista){
    renumerarRelatorio(lista);

    localStorage.setItem(
        "celk_relatorio",
        JSON.stringify(lista)
    );

    try{
        if(
            window.celkRelatorioWindow &&
            !window.celkRelatorioWindow.closed
        ){
            window.celkRelatorioWindow.postMessage(
                {
                    tipo:"CELK_RELATORIO_ATUALIZAR",
                    lista:lista
                },
                "*"
            );
        }
    }catch(_){ }
}

function atualizarClassificacaoNoRelatorio(nome,classificacao){
    if(
        !nome ||
        !classificacao ||
        classificacao === "NÃO IDENTIFICADA"
    ) return;

    const lista = obterListaRelatorio();
    const chave = normalizarClassificacaoTexto(nome);
    let alterou = false;

    lista.forEach(function(paciente){
        if(
            normalizarClassificacaoTexto(paciente.nome) === chave &&
            (
                !paciente.classificacao ||
                paciente.classificacao === "NÃO IDENTIFICADA"
            )
        ){
            paciente.classificacao = classificacao;
            alterou = true;
        }
    });

    if(alterou){
        salvarListaRelatorio(lista);
    }
}

function localizarPacienteNoRelatorio(lista,nome,chegada){
    const nomeNormalizado = normalizarClassificacaoTexto(nome);
    const chegadaNormalizada = String(chegada || "").trim();

    if(!nomeNormalizado) return null;

    if(chegadaNormalizada){
        const exato = lista.find(function(item){
            return (
                normalizarClassificacaoTexto(item.nome) === nomeNormalizado &&
                String(item.chegada || "").trim() === chegadaNormalizada
            );
        });

        if(exato) return exato;
    }

    const pendente = lista.find(function(item){
        return (
            normalizarClassificacaoTexto(item.nome) === nomeNormalizado &&
            !item.atendido
        );
    });

    if(pendente) return pendente;

    return lista.find(function(item){
        return normalizarClassificacaoTexto(item.nome) === nomeNormalizado;
    }) || null;
}

function dadosPacienteAtual(){
    try{
        const salvo = JSON.parse(
            localStorage.getItem("celk_paciente_pendente") || "null"
        );

        if(salvo && salvo.nome){
            if(
                !salvo.classificacao ||
                salvo.classificacao === "NÃO IDENTIFICADA"
            ){
                salvo.classificacao = obterClassificacaoDoCache(
                    salvo.nome
                );
            }

            return salvo;
        }
    }catch(_){ }

    const tela = document.body.innerText || "";

    const cab = tela.match(
        /([A-ZÁÀÂÃÉÊÍÓÔÕÚÇ ]+)\s*\|\s*([^|]+)\s*\|\s*DN:/i
    );

    if(!cab) return null;

    const nome = cab[1].trim();
    const idade = cab[2].trim();

    const classificacao = obterClassificacaoDoCache(nome);

    return {
        nome,
        idade,
        chegada:"",
        classificacao
    };
}

function registrarFinalizacaoRelatorio(dadosForcado){
    const dados = dadosForcado || dadosPacienteAtual();

    if(!dados || !dados.nome){
        console.warn(
            "[CELK RELATÓRIO] FINALIZAÇÃO SEM PACIENTE IDENTIFICADO."
        );
        return false;
    }

    const agora = new Date();

    const atendido =
        agora.getHours().toString().padStart(2,"0") + ":" +
        agora.getMinutes().toString().padStart(2,"0");

    let classificacao =
        dados.classificacao || "NÃO IDENTIFICADA";

    if(classificacao === "NÃO IDENTIFICADA"){
        const cache = obterClassificacaoDoCache(dados.nome);
        if(cache !== "NÃO IDENTIFICADA"){
            classificacao = cache;
        }
    }

    const lista = obterListaRelatorio();

    let paciente = localizarPacienteNoRelatorio(
        lista,
        dados.nome,
        dados.chegada
    );

    if(!paciente){
        paciente = {
            numero:lista.length + 1,
            nome:dados.nome,
            idade:dados.idade || "",
            classificacao:classificacao,
            chegada:dados.chegada || "",
            atendido:atendido,
            tempo:calcularTempoRelatorio(
                dados.chegada,
                agora
            )
        };

        lista.push(paciente);
    }else{
        paciente.nome = dados.nome;

        if(dados.idade){
            paciente.idade = dados.idade;
        }

        if(dados.chegada){
            paciente.chegada = dados.chegada;
        }

        if(
            classificacao &&
            classificacao !== "NÃO IDENTIFICADA"
        ){
            paciente.classificacao = classificacao;
        }

        paciente.atendido = atendido;
        paciente.tempo = calcularTempoRelatorio(
            paciente.chegada,
            agora
        );
    }

    salvarListaRelatorio(lista);

    console.log(
        "[CELK RELATÓRIO] SAÍDA REGISTRADA:",
        paciente.nome,
        "| CHEGADA:",paciente.chegada,
        "| ATENDIDO:",paciente.atendido,
        "| TEMPO:",paciente.tempo
    );

    try{
        localStorage.removeItem("celk_paciente_pendente");
    }catch(_){ }

    return true;
}

function instalarCapturaFinalizacaoRelatorio(){
    if(window.celk.finalizacaoRelatorioHook) return;

    window.celk.finalizacaoRelatorioHook = true;

    function elementoFinalizacaoDoEvento(evento){
        const candidatos = [];

        try{
            const alvo = evento && evento.target;

            if(alvo && alvo.closest){
                [
                    "a.btn-finalizar-prontuario",
                    "a",
                    "button",
                    "input",
                    "[role='button']",
                    "[onclick]"
                ].forEach(function(seletor){
                    try{
                        const el = alvo.closest(seletor);
                        if(el) candidatos.push(el);
                    }catch(_){ }
                });
            }
        }catch(_){ }

        try{
            if(evento && typeof evento.composedPath === "function"){
                for(const el of evento.composedPath()){
                    if(el && el.nodeType === 1){
                        candidatos.push(el);
                    }
                }
            }
        }catch(_){ }

        return [...new Set(candidatos)].find(function(el){
            const texto = normalizarCelk(
                el.innerText ||
                el.value ||
                el.getAttribute("title") ||
                el.getAttribute("alt") ||
                el.getAttribute("aria-label") ||
                ""
            );

            const id = normalizarCelk(el.id || "");
            const classe = normalizarCelk(el.className || "");

            if(
                el.matches &&
                el.matches("a.btn-finalizar-prontuario")
            ){
                return true;
            }

            return (
                id.includes("BTNFINALIZARPRONTUARIO") ||
                id.includes("FINALIZARPRONTUARIO") ||
                classe.includes("BTN FINALIZAR PRONTUARIO") ||
                classe.includes("BTN-FINALIZAR-PRONTUARIO") ||
                texto.includes("SALVAR ATENDIMENTO") ||
                texto.includes("SALVAR O ATENDIMENTO") ||
                texto.includes("FINALIZAR PRONTUARIO") ||
                texto.includes("FINALIZAR ATENDIMENTO")
            );
        }) || null;
    }

    function capturarFinalizacao(evento){
        try{
            const alvo = elementoFinalizacaoDoEvento(evento);

            if(!alvo) return;

            const agoraMs = Date.now();

            if(
                window.celk.ultimaCapturaFinalizacao &&
                agoraMs - window.celk.ultimaCapturaFinalizacao < 1200
            ){
                return;
            }

            window.celk.ultimaCapturaFinalizacao = agoraMs;

            console.log(
                "[CELK RELATÓRIO] FINALIZAÇÃO DETECTADA.",
                alvo
            );

            registrarFinalizacaoRelatorio();

        }catch(err){
            console.error(
                "[CELK RELATÓRIO] ERRO NA CAPTURA DA FINALIZAÇÃO:",
                err
            );
        }
    }

    document.addEventListener(
        "pointerdown",
        capturarFinalizacao,
        true
    );

    document.addEventListener(
        "mousedown",
        capturarFinalizacao,
        true
    );

    document.addEventListener(
        "click",
        capturarFinalizacao,
        true
    );

    console.log(
        "[CELK RELATÓRIO] CAPTURA DE SAÍDA INSTALADA."
    );
}

function instalarMonitorSucessoFinalizacao(){
    if(window.celk.monitorSucessoFinalizacao) return;

    window.celk.monitorSucessoFinalizacao = true;

    let ultimaMensagem = 0;

    function localizarPendenteAnterior(agoraMs){
        try{
            let historico = JSON.parse(
                localStorage.getItem("celk_pendentes_historico") || "[]"
            );

            if(!Array.isArray(historico)) return null;

            const lista = obterListaRelatorio();

            for(let i=historico.length-1;i>=0;i--){
                const item = historico[i];

                if(!item || !item.nome) continue;
                if(Number(item.salvoEm || 0) > agoraMs) continue;

                const paciente = localizarPacienteNoRelatorio(
                    lista,
                    item.nome,
                    item.chegada
                );

                if(paciente && !paciente.atendido){
                    return item;
                }
            }

            return null;
        }catch(_){
            return null;
        }
    }

    function verificarMensagem(){
        try{
            const texto = normalizarCelk(
                document.body && document.body.innerText || ""
            );

            if(!texto.includes("ATENDIMENTO FINALIZADO COM SUCESSO")){
                return;
            }

            const agoraMs = Date.now();

            if(agoraMs - ultimaMensagem < 1500) return;

            ultimaMensagem = agoraMs;

            let dados = dadosPacienteAtual();

            if(!dados || !dados.nome){
                dados = localizarPendenteAnterior(agoraMs);
            }

            if(!dados || !dados.nome){
                console.warn(
                    "[CELK RELATÓRIO] SUCESSO DETECTADO, MAS PACIENTE NÃO RECUPERADO."
                );
                return;
            }

            registrarFinalizacaoRelatorio(dados);

        }catch(err){
            console.error(
                "[CELK RELATÓRIO] ERRO NO MONITOR DE SUCESSO:",
                err
            );
        }
    }

    const observer = new MutationObserver(function(){
        verificarMensagem();
    });

    observer.observe(
        document.documentElement || document.body,
        {
            childList:true,
            subtree:true,
            characterData:true
        }
    );

    setTimeout(verificarMensagem,100);

    window.celk.observadorSucessoFinalizacao = observer;

    console.log(
        "[CELK RELATÓRIO] FALLBACK DE SUCESSO INSTALADO."
    );
}

// =========================================================
// RELATÓRIO — VISUALIZAÇÃO
// =========================================================

function escaparHtmlRelatorio(valor){
    return String(valor ?? "")
        .replace(/&/g,"&amp;")
        .replace(/</g,"&lt;")
        .replace(/>/g,"&gt;")
        .replace(/"/g,"&quot;")
        .replace(/'/g,"&#39;");
}

function obterCorClassificacaoRelatorio(classificacao){
    switch(normalizarClassificacaoTexto(classificacao)){
        case "VERDE": return "#d9ead3";
        case "AMARELO": return "#fff2cc";
        case "LARANJA": return "#fce5cd";
        case "VERMELHO": return "#f4cccc";
        case "AZUL": return "#cfe2f3";
        default: return "#ffffff";
    }
}

function abrirRelatorio(){
    const pacientes = obterListaRelatorio();
    const aba = window.open("","_blank");

    if(!aba){
        alert("O navegador bloqueou a abertura do relatório.");
        return;
    }

    window.celkRelatorioWindow = aba;

    function montarHtml(lista){
        let html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Relatório do Plantão</title>
<style>
body{font-family:Arial,sans-serif;margin:30px;color:#111}
h1{margin:0 0 5px;font-size:28px}
.info{font-size:16px;line-height:1.5}
table{width:100%;border-collapse:collapse;margin-top:20px}
th,td{border:1px solid #ccc;padding:8px;text-align:center;vertical-align:middle}
th{background:#f3f3f3;font-weight:700}
td.nome{text-align:left}
td.classificacao{font-weight:700}
#imprimir{margin-top:20px;padding:9px 16px;font-size:15px;cursor:pointer}
@media print{#imprimir{display:none}body{margin:15mm}}
</style>
</head>
<body>
<h1>RELATÓRIO DO PLANTÃO</h1>
<div class="info"><b>Data:</b> ${escaparHtmlRelatorio(localStorage.getItem("celk_relatorio_data") || new Date().toLocaleDateString("pt-BR"))}</div>
<div class="info"><b>Total de pacientes:</b> <span id="total">${lista.length}</span></div>
<table>
<thead>
<tr>
<th>Nº</th>
<th>Nome</th>
<th>Idade</th>
<th>Classificação</th>
<th>Chegada</th>
<th>Atendido</th>
<th>Tempo</th>
</tr>
</thead>
<tbody id="corpo">
${lista.length ? lista.map(function(paciente){
    const classificacao = paciente.classificacao || "NÃO IDENTIFICADA";
    const cor = obterCorClassificacaoRelatorio(classificacao);
    return `
<tr>
<td>${escaparHtmlRelatorio(paciente.numero)}</td>
<td class="nome">${escaparHtmlRelatorio(paciente.nome)}</td>
<td>${escaparHtmlRelatorio(paciente.idade)}</td>
<td class="classificacao" style="background:${cor}">${escaparHtmlRelatorio(classificacao)}</td>
<td>${escaparHtmlRelatorio(paciente.chegada)}</td>
<td>${escaparHtmlRelatorio(paciente.atendido)}</td>
<td>${escaparHtmlRelatorio(paciente.tempo)}</td>
</tr>`;
}).join("") : `
<tr><td colspan="7">NENHUM PACIENTE REGISTRADO.</td></tr>
`}
</tbody>
</table>
<button id="imprimir" onclick="window.print()">IMPRIMIR</button>
<script>
window.addEventListener("message",function(evento){
    if(!evento.data || evento.data.tipo !== "CELK_RELATORIO_ATUALIZAR") return;
    const lista = Array.isArray(evento.data.lista) ? evento.data.lista : [];
    const corpo = document.getElementById("corpo");
    const total = document.getElementById("total");
    if(total) total.textContent = lista.length;
    if(!corpo) return;
    corpo.innerHTML = lista.length ? lista.map(function(paciente){
        const c = String(paciente.classificacao || "NÃO IDENTIFICADA").toUpperCase();
        const cor = c === "VERDE" ? "#d9ead3" : c === "AMARELO" ? "#fff2cc" : c === "LARANJA" ? "#fce5cd" : c === "VERMELHO" ? "#f4cccc" : c === "AZUL" ? "#cfe2f3" : "#fff";
        const esc = function(v){return String(v ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")};
        return "<tr>"+
            "<td>"+esc(paciente.numero)+"</td>"+
            "<td class=\\"nome\\">"+esc(paciente.nome)+"</td>"+
            "<td>"+esc(paciente.idade)+"</td>"+
            "<td class=\\"classificacao\\" style=\\"background:"+cor+"\\">"+esc(c)+"</td>"+
            "<td>"+esc(paciente.chegada)+"</td>"+
            "<td>"+esc(paciente.atendido)+"</td>"+
            "<td>"+esc(paciente.tempo)+"</td>"+
            "</tr>";
    }).join("") : "<tr><td colspan=\\"7\\">NENHUM PACIENTE REGISTRADO.</td></tr>";
});
</script>
</body>
</html>`;
        return html;
    }

    aba.document.open();
    aba.document.write(montarHtml(pacientes));
    aba.document.close();
}

function clicarPesquisar(){
    const botoes = [
        ...document.querySelectorAll("button"),
        ...document.querySelectorAll("input[type='button']"),
        ...document.querySelectorAll("a")
    ];

    const botao = botoes.find(function(el){
        const txt = (
            el.innerText ||
            el.value ||
            ""
        ).trim().toLowerCase();

        return txt === "pesquisar" || txt === "procurar";
    });

    if(botao){
        botao.click();
        console.log("CELK Helper: Pesquisa atualizada.");
    }
}


function abrirMenuCID(){

    if(document.getElementById("celk-cid-menu")){
        document.getElementById("celk-cid-menu").remove();
        return;
    }

const lista = [

    {cid:"J06.9", nome:"IVAS"},
    {cid:"J02.9", nome:"Faringite"},
    {cid:"J03.9", nome:"Amigdalite"},
    {cid:"H66.9", nome:"Otite Média"},
    {cid:"A09", nome:"Gastroenterite"},
    {cid:"B34.9", nome:"Virose"},
    {cid:"R50", nome:"Febre"},
    {cid:"J45", nome:"Asma"},
    {cid:"L20.9", nome:"Dermatite"},
    {cid:"K59.0", nome:"Constipação"},
    {cid:"R10.4", nome:"Dor Abdominal"},
    {cid:"J00", nome:"Resfriado Comum"},
    {cid:"Z00.1", nome:"Consulta de Rotina"}

];

    const fundo=document.createElement("div");
    fundo.id="celk-cid-menu";

    fundo.style.position="fixed";
    fundo.style.left="0";
    fundo.style.top="0";
    fundo.style.width="100%";
    fundo.style.height="100%";
    fundo.style.background="rgba(0,0,0,.35)";
    fundo.style.zIndex="999999";

    const caixa=document.createElement("div");

    caixa.style.position="absolute";
    caixa.style.left="50%";
    caixa.style.top="50%";
    caixa.style.transform="translate(-50%,-50%)";
    caixa.style.width="420px";
    caixa.style.maxHeight="600px";
    caixa.style.background="#fff";
    caixa.style.borderRadius="8px";
    caixa.style.boxShadow="0 0 20px rgba(0,0,0,.3)";
    caixa.style.padding="15px";
    caixa.style.overflow="auto";

    caixa.innerHTML=`
        <h2 style="margin-top:0">
            CID FAVORITOS
        </h2>

        <input
            id="celk-cid-pesquisa"
            placeholder="Pesquisar..."
            style="
                width:100%;
                padding:8px;
                margin-bottom:12px;
            "
        >

        <div id="celk-cid-lista"></div>
    `;

    fundo.appendChild(caixa);

    document.body.appendChild(fundo);

    const listaDiv=document.getElementById("celk-cid-lista");

    function montar(texto=""){

        listaDiv.innerHTML="";

        lista
        .filter(x=>

            x.cid.toLowerCase().includes(texto.toLowerCase()) ||

            x.nome.toLowerCase().includes(texto.toLowerCase())

        )
        .forEach(item=>{

            const b=document.createElement("button");

            b.innerHTML=
                "<b>"+item.cid+"</b> - "+item.nome;

            b.style.display="block";
            b.style.width="100%";
            b.style.marginBottom="6px";
            b.style.padding="8px";
            b.style.cursor="pointer";
            b.style.textAlign="left";

        b.onclick = function(){

    window.preencherCID(item.cid);

    // aguarda o CID ser preenchido
    setTimeout(function(){

        const nomeMedico = document.querySelector(
            'label[wicketpath="linkMinhaConta_usuarioLogado"]'
        )?.textContent.trim();

        const select = document.querySelector(
            'select[name*="profissional"]'
        );

        if(nomeMedico && select){

            const opcao = [...select.options].find(o =>
                o.text.trim().toUpperCase() ===
                nomeMedico.toUpperCase()
            );

            if(opcao){

                select.value = opcao.value;

                select.dispatchEvent(new Event("change",{
                    bubbles:true
                }));

            }

        }

    },300);

    fundo.remove();

};

            listaDiv.appendChild(b);

        });

    }

    montar();

    document
        .getElementById("celk-cid-pesquisa")
        .oninput=function(){

            montar(this.value);

        };

    fundo.onclick=function(e){

        if(e.target===fundo){

            fundo.remove();

        }

    };

}

function abrirRelatorio(){

    const pacientes =
        JSON.parse(localStorage.getItem("celk_relatorio") || "[]");

    const aba = window.open("", "_blank");

    let html = `
    <html>
    <head>

    <title>Relatório do Plantão</title>

    <style>

    body{

        font-family:Arial;

        margin:30px;

    }

    h2{

        margin-bottom:5px;

    }

    table{

        width:100%;

        border-collapse:collapse;

        margin-top:20px;

    }

    th,td{

        border:1px solid #ccc;

        padding:8px;

        text-align:center;

    }

    th{

        background:#f3f3f3;

    }

    </style>

    </head>

    <body>

    <h2>RELATÓRIO DO PLANTÃO</h2>

    <b>Data:</b> ${localStorage.getItem("celk_relatorio_data")}<br>

    <b>Total de pacientes:</b> ${pacientes.length}

    <table>

    <tr>

    <th>Nº</th>

    <th>Nome</th>

    <th>Idade</th>

    <th>Chegada</th>

    <th>Atendido</th>

    <th>Tempo</th>

    </tr>
    `;

    pacientes.forEach(function(p){

        html += `
        <tr>

        <td>${p.numero}</td>

        <td>${p.nome}</td>

        <td>${p.idade}</td>

        <td>${p.chegada}</td>

        <td>${p.atendido}</td>

        <td>${p.tempo}</td>

        </tr>
        `;

    });

    html += `
    </table>

    </body>

    </html>
    `;

    aba.document.write(html);

    aba.document.close();

}

function clicarPesquisar(){

    const botoes=[
        ...document.querySelectorAll("button"),
        ...document.querySelectorAll("input[type='button']"),
        ...document.querySelectorAll("a")
    ];

    const botao=botoes.find(function(el){

        const txt=(el.innerText||el.value||"").trim().toLowerCase();

        return txt==="pesquisar" || txt==="procurar";

    });

    if(botao){

        botao.click();

        console.log("CELK Helper: Pesquisa atualizada.");

    }else{

        console.log("CELK Helper: Botão Pesquisar não encontrado.");

    }

}

//--------------------------------------------------
// INICIALIZA
//--------------------------------------------------

// iniciarReceituario();

let observerCELK = null;

function iniciarObserver(){

    if(observerCELK){
        observerCELK.disconnect();
    }

    const alvo =
        document.querySelector("#wrapper .container .content") ||
        document.querySelector("#content") ||
        document.querySelector("#main") ||
        document.body;

    observerCELK = new MutationObserver(function(){

        if(!document.getElementById("celk-helper")){
            console.log("Reconstruindo barra...");
            criarInterface();
        }

        if(
            typeof tinymce !== "undefined" &&
            tinymce.activeEditor &&
            !document.getElementById("celk-prescricao-ped")
        ){
            console.log("Reconstruindo prescrição...");
            criarCampoPrescricao();
        }

    });

    observerCELK.observe(alvo,{
        childList:true,
        subtree:true
    });

}

    window.celk.init = function(){

    criarInterface();

    // RELATÓRIO: entrada pelo clique no nome e saída pela finalização.
    instalarCapturaCliquePaciente();
    instalarCapturaFinalizacaoRelatorio();
    instalarMonitorSucessoFinalizacao();
    try{ sincronizarClassificacoesDaTabela(); }catch(_){ }

    iniciarObserver();

    setTimeout(iniciarReceituario,1500);

};

window.celk.init();

    //--------------------------------------------------
// RECEITUÁRIO PEDIÁTRICO
//--------------------------------------------------

function iniciarReceituario(){

    criarCampoPrescricao();

}

function criarCampoPrescricao(){

    // evita criar duas vezes
    if(document.getElementById("celk-prescricao-ped")){
        return;
    }

    // somente quando existir TinyMCE (editor do receituário)
    if(typeof tinymce==="undefined" || !tinymce.activeEditor){
        return;
    }

    // procura um lugar para inserir
    const editor=tinymce.activeEditor.getContainer();

    if(!editor){
        return;
    }

    const barra=document.createElement("div");
window.celkReceita = barra;

barra.id = "celk-prescricao-ped";
    barra.id="celk-prescricao-ped";

    barra.style.cssText=`
        display:flex;
        align-items:center;
        gap:10px;
        margin-bottom:8px;
        padding:6px;
        background:#f7f7f7;
        border:1px solid #d9d9d9;
    `;

    barra.innerHTML=`
        <b>💊 Prescrição:</b>

        <input
            id="celk-prescricao-input"
            type="text"
            placeholder="Digite o medicamento..."
            style="
                flex:1;
                height:30px;
                font-size:15px;
                padding:4px 8px;
            ">
    `;
    const input = barra.querySelector("#celk-prescricao-input");

input.addEventListener("keydown", function(e){

    if(e.key !== "Enter") return;

    e.preventDefault();

    const med = buscarMedicamento(this.value);

    if(!med){

        alert("Medicamento não encontrado.");

        return;

    }

const receita = gerarReceita(med);

if(receita){

    inserirNoEditor(receita);

}
    this.value = "";

});

editor.parentNode.insertBefore(barra, editor);

}
    //--------------------------------------------------
// CÁLCULO DE DOSE
//--------------------------------------------------

function obterPesoPaciente(){

    const tela=document.body.innerText;

    const m=tela.match(/Peso:\s*([\d.,]+)/i);

    if(!m) return null;

    return parseFloat(m[1].replace(",","."));

}

function gerarReceita(med){

    const peso=obterPesoPaciente();

    if(!peso){

        alert("Peso não encontrado.");

        return null;

    }

    let dose=med.doseMgKg*peso;

    if(med.doseMaxMg){

        dose=Math.min(dose,med.doseMaxMg);

    }

    if(med.tipo==="ML"){

    const ml=(dose/med.mgPorMl).toFixed(1);

    return `<p><strong>USO ORAL</strong></p>
<p>${med.nome} ${med.apresentacao} ------------------ ${med.quantidade}</p>
<p>Administrar ${ml} mL VIA ORAL DE ${med.intervalo}.</p>`;

}

if(med.tipo==="GOTAS"){

    const ml=dose/med.mgPorMl;

    const gotas=Math.round(ml*med.gotasPorMl);

    return `<p><strong>USO ORAL</strong></p>
<p>${med.nome} ${med.apresentacao} ------------------ ${med.quantidade}</p>
<p>Administrar ${gotas} gotas VIA ORAL DE ${med.intervalo}, SE DOR OU FEBRE.</p>`;

}

return med.nome;

}

function inserirNoEditor(texto){

    if(typeof tinymce==="undefined") return;

    const editor = tinymce.activeEditor;

    if(!editor) return;

    editor.focus();

    editor.execCommand(
        "mceInsertContent",
        false,
        texto
    );

}

   //--------------------------------------------------
// BANCO DE MEDICAMENTOS
//--------------------------------------------------

    const PED_MEDS = {

        dipirona:{

            aliases:["dip","dipirona","novalgina"],

            nome:"DIPIRONA",

            categoria:"ANALGÉSICO",

            apresentacao:"SOLUÇÃO ORAL 500 MG/ML",

            doseMgKg:15,

            doseMaxMg:1000,

            intervalo:"6/6H",

            tipo:"GOTAS",

            gotasPorMl:20,

            mgPorMl:500,

            quantidade:"01 FRASCO"

        },

        paracetamol:{

            aliases:["par","para","paracetamol","tylenol"],

            nome:"PARACETAMOL",

            categoria:"ANALGÉSICO",

            apresentacao:"SOLUÇÃO ORAL 200 MG/ML",

            doseMgKg:15,

            doseMaxMg:750,

            intervalo:"6/6H",

            tipo:"GOTAS",

            gotasPorMl:20,

            mgPorMl:200,

            quantidade:"01 FRASCO"

        },

        ibuprofeno:{

            aliases:["ibu","ibuprofeno","alivium"],

            nome:"IBUPROFENO",

            categoria:"AINE",

            apresentacao:"SUSPENSÃO 100 MG/5 ML",

            doseMgKg:10,

            doseMaxMg:600,

            intervalo:"8/8H",

            tipo:"ML",

            mgPorMl:20,

            quantidade:"01 FRASCO"

        },

        amoxicilina250:{

            aliases:[
                "amox",
                "amoxicilina",
                "amoxicilina250",
                "250"
            ],

            nome:"AMOXICILINA",

            categoria:"ANTIBIÓTICO",

            apresentacao:"250 MG/5 ML",

            doseMgKg:50,

            doseMaxMg:3000,

            intervalo:"8/8H",

            tipo:"ML",

            mgPorMl:50,

            quantidade:"01 FRASCO"

        },

        amoxicilina400:{

            aliases:[
                "amox400",
                "amoxicilina400",
                "400"
            ],

            nome:"AMOXICILINA BD",

            categoria:"ANTIBIÓTICO",

            apresentacao:"400 MG/5 ML",

            doseMgKg:45,

            doseMaxMg:3000,

            intervalo:"12/12H",

            tipo:"ML",

            mgPorMl:80,

            quantidade:"01 FRASCO"

        },

        amoxclav250:{

            aliases:[
                "clav",
                "clavulin",
                "amoxclav",
                "amoxiclav",
                "amoxclav250"
            ],

            nome:"AMOXICILINA + CLAVULANATO",

            categoria:"ANTIBIÓTICO",

            apresentacao:"250 MG + 62,5 MG /5 ML",

            doseMgKg:50,

            doseMaxMg:1500,

            intervalo:"8/8H",

            tipo:"ML",

            mgPorMl:50,

            quantidade:"01 FRASCO"

        },

        amoxclav400:{

            aliases:[
                "clav400",
                "clavulinbd",
                "bd",
                "amoxclav400"
            ],

            nome:"AMOXICILINA + CLAVULANATO BD",

            categoria:"ANTIBIÓTICO",

            apresentacao:"400 MG + 57 MG /5 ML",

            doseMgKg:45,

            doseMaxMg:1750,

            intervalo:"12/12H",

            tipo:"ML",

            mgPorMl:80,

            quantidade:"01 FRASCO"

        },

        azitromicina:{

            aliases:[
                "azi",
                "azitro",
                "azitromicina"
            ],

            nome:"AZITROMICINA",

            categoria:"ANTIBIÓTICO",

            apresentacao:"200 MG/5 ML",

            doseMgKg:10,

            doseMaxMg:500,

            intervalo:"24/24H",

            tipo:"ML",

            mgPorMl:40,

            quantidade:"01 FRASCO"

        },

        cefalexina:{

            aliases:[
                "cefalexina",
                "keflex",
                "cefa"
            ],

            nome:"CEFALEXINA",

            categoria:"ANTIBIÓTICO",

            apresentacao:"250 MG/5 ML",

            doseMgKg:50,

            doseMaxMg:4000,

            intervalo:"6/6H",

            tipo:"ML",

            mgPorMl:50,

            quantidade:"01 FRASCO"

        },

        cefadroxila:{

            aliases:[
                "cefadroxila",
                "cefadoxila",
                "droxil"
            ],

            nome:"CEFADROXILA",

            categoria:"ANTIBIÓTICO",

            apresentacao:"250 MG/5 ML",

            doseMgKg:30,

            doseMaxMg:2000,

            intervalo:"12/12H",

            tipo:"ML",

            mgPorMl:50,

            quantidade:"01 FRASCO"

        },

            cefaclor:{

        aliases:[
            "cefaclor"
        ],

        nome:"CEFACLOR",

        categoria:"ANTIBIÓTICO",

        apresentacao:"250 MG/5 ML",

        doseMgKg:30,

        doseMaxMg:1000,

        intervalo:"8/8H",

        tipo:"ML",

        mgPorMl:50,

        quantidade:"01 FRASCO"

    },

    sulfametoxazol:{

                aliases:[
                    "bactrim",
                    "infectrin",
                    "sulfa",
                    "sulfametoxazol",
                    "sulfatrimetoprim",
                    "smx",
                    "tmp"
                ],

                nome:"SULFAMETOXAZOL + TRIMETOPRIMA",

                categoria:"ANTIBIÓTICO",

                apresentacao:"200 MG + 40 MG / 5 ML",

                doseMgKg:8,

                doseMaxMg:320,

                intervalo:"12/12H",

                tipo:"ML",

                mgPorMl:8,

                quantidade:"01 FRASCO"

            },

            metronidazol:{

                aliases:[
                    "metro",
                    "flagyl",
                    "metronidazol"
                ],

                nome:"METRONIDAZOL",

                categoria:"ANTIBIÓTICO",

                apresentacao:"SUSPENSÃO 40 MG/ML",

                doseMgKg:40,

                doseMaxMg:4000,

                intervalo:"8/8H",

                tipo:"ML",

                mgPorMl:25,

                quantidade:"01 FRASCO"

            },

            penveoral:{

                aliases:[
                    "penveoral",
                    "penv",
                    "penicilinav"
                ],

                nome:"PENICILINA V",

                categoria:"ANTIBIÓTICO",

                apresentacao:"400.000 UI / 5 ML",

                doseMgKg:40000,

                doseMaxMg:0,

                intervalo:"12/12H",

                tipo:"UI",

                uiPorMl:80000,

                quantidade:"01 FRASCO"

            },

            ciprofloxacino:{

                aliases:[
                    "cipro",
                    "ciprofloxacino"
                ],

                nome:"CIPROFLOXACINO",

                categoria:"ANTIBIÓTICO",

                apresentacao:"250 MG COMPRIMIDO",

                doseMgKg:15,

                doseMaxMg:500,

                intervalo:"12/12H",

                tipo:"CP",

                mgPorComprimido:250,

                quantidade:"14 COMPRIMIDOS"

            },

            fluconazol:{

                aliases:[
                    "flu",
                    "fluconazol",
                    "zoltec"
                ],

                nome:"FLUCONAZOL",

                categoria:"ANTIFÚNGICO",

                apresentacao:"100 MG COMPRIMIDO",

                doseMgKg:6,

                doseMaxMg:400,

                intervalo:"24/24H",

                tipo:"CP",

                mgPorComprimido:100,

                quantidade:"14 COMPRIMIDOS"

            },

              aciclovir:{

        aliases:[
            "aciclovir",
            "zovirax"
        ],

        nome:"ACICLOVIR",

        categoria:"ANTIVIRAL",

        apresentacao:"200 MG COMPRIMIDO",

        doseMgKg:20,

        doseMaxMg:800,

        intervalo:"6/6H",

        tipo:"CP",

        mgPorComprimido:200,

        quantidade:"25 COMPRIMIDOS"

    },

    albendazol:{

                    aliases:[
                        "albendazol",
                        "albenza"
                    ],

                    nome:"ALBENDAZOL",

                    categoria:"ANTIPARASITÁRIO",

                    apresentacao:"SUSPENSÃO 400 MG/10 ML OU COMP. 400 MG",

                    doseMgKg:null,

                    intervalo:"24/24H",

                    tipo:"ESQUEMA",

                    esquema:">2 ANOS: 400 MG (10 ML OU 1 CP) 1X/DIA POR 3-5 DIAS | <2 ANOS: 200 MG (5 ML) 1X/DIA POR 3-5 DIAS",

                    quantidade:"01 FRASCO OU 03 COMPRIMIDOS"

                },

                ivermectina:{

                    aliases:[
                        "ivermectina",
                        "ivermec",
                        "iver"
                    ],

                    nome:"IVERMECTINA",

                    categoria:"ANTIPARASITÁRIO",

                    apresentacao:"COMPRIMIDO 6 MG",

                    doseMgKg:0.2,

                    unidadeDose:"MG/KG",

                    intervalo:"DOSE ÚNICA",

                    tipo:"CP",

                    mgPorComprimido:6,

                    observacao:"USAR APENAS >5 ANOS E >15 KG. ESCABIOSE: REPETIR EM 7-14 DIAS.",

                    quantidade:"ATÉ 04 COMPRIMIDOS"

                },

                mebendazol:{

                    aliases:[
                        "mebendazol"
                    ],

                    nome:"MEBENDAZOL",

                    categoria:"ANTIPARASITÁRIO",

                    apresentacao:"SUSPENSÃO 100 MG/5 ML OU COMP. 100 MG",

                    doseMgKg:null,

                    intervalo:"24/24H",

                    tipo:"ESQUEMA",

                    esquema:"100 MG (5 ML OU 1 CP) 1X/DIA POR 3-7 DIAS",

                    observacao:"CONTRAINDICADO <1 ANO. ENTRE 1-2 ANOS AVALIAR RISCO-BENEFÍCIO.",

                    quantidade:"01 FRASCO"

                },

                nitazoxanida:{

                    aliases:[
                        "nitazoxanida",
                        "annita"
                    ],

                    nome:"NITAZOXANIDA",

                    categoria:"ANTIPARASITÁRIO",

                    apresentacao:"SUSPENSÃO 20 MG/ML",

                    doseMgKg:7.5,

                    intervalo:"12/12H",

                    tipo:"ML",

                    mgPorMl:20,

                    duracao:"3 DIAS",

                    observacao:"REGRA PRÁTICA: PESO × 0,375 ML POR DOSE (MÁXIMO 15 ML/DOSE).",

                    quantidade:"01 FRASCO"

                },

                secnidazol:{

                    aliases:[
                        "secnidazol"
                    ],

                    nome:"SECNIDAZOL",

                    categoria:"ANTIPARASITÁRIO",

                    apresentacao:"SUSPENSÃO 30 MG/ML OU COMP.",

                    doseMgKg:30,

                    intervalo:"DOSE ÚNICA",

                    tipo:"ML",

                    mgPorMl:30,

                    observacao:"GIARDÍASE E AMEBÍASE INTESTINAL: 1 ML/KG EM DOSE ÚNICA. MÁXIMO 2 G.",

                    quantidade:"01 FRASCO"
                             }

            };
    function buscarMedicamento(texto){

    texto = texto.trim().toLowerCase();

    for(const med of Object.values(PED_MEDS)){

        if(med.aliases.some(a => a.toLowerCase() === texto)){
            return med;
        }

    }

    return null;

}

})();
