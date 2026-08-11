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

atendimento.onclick = function(){
    preencherEvolucao({modo:"atendimento", qChar:0, eChar:1});
};

atendimento.onmouseover=function(){
    atendimento.style.background="#ececec";
};

atendimento.onmouseout=function(){
    atendimento.style.background="transparent";
};

//--------------------------------------------------
// ESTRELA — ATALHOS CLIN / PED
//--------------------------------------------------

const grupoAtendimento = document.createElement("div");

grupoAtendimento.style.cssText = `
position:relative;
height:100%;
display:flex;
align-items:center;
`;

const estrela = document.createElement("button");

estrela.innerHTML = "⭐";

estrela.title = "Atalhos rápidos de atendimento";

estrela.style.cssText = `
height:100%;
min-width:70px;
padding:0 16px;
display:flex;
align-items:center;
justify-content:center;
font-size:20px;
background:transparent;
color:#222;
border:none;
border-right:1px solid #d8d8d8;
cursor:pointer;
user-select:none;
`;

estrela.onmouseover=function(){
    estrela.style.background="#ececec";
};

estrela.onmouseout=function(){
    if(menuAtendimento.style.display !== "block"){
        estrela.style.background="transparent";
    }
};

const menuAtendimento = document.createElement("div");

menuAtendimento.style.cssText = `
display:none;
position:absolute;
top:100%;
left:0;
background:white;
border:1px solid #bbb;
padding:6px;
min-width:230px;
box-shadow:0 4px 12px rgba(0,0,0,.25);
z-index:99999999;
`;

function criarAtalhoAtendimento(label, qChar, eChar, descricao){

    const botao = document.createElement("button");

    botao.innerHTML = label;
    botao.title = descricao;

    botao.style.cssText = `
    display:block;
    width:100%;
    padding:10px 12px;
    border:none;
    background:transparent;
    text-align:left;
    font-size:16px;
    cursor:pointer;
    color:#222;
    `;

    botao.onmouseover=function(){
        botao.style.background="#bfdbfe";
    };

    botao.onmouseout=function(){
        botao.style.background="transparent";
    };

    botao.onclick=function(e){
        e.stopPropagation();
        menuAtendimento.style.display="none";
        estrela.style.background="transparent";
        preencherEvolucao({
            modo:(qChar === 1 && eChar === 0) ? "ped" : "clin",
            qChar:qChar,
            eChar:eChar
        });
    };

    menuAtendimento.appendChild(botao);
}

criarAtalhoAtendimento(
    "01 = Clin",
    0,
    1,
    "Atendimento Clínica Geral"
);

criarAtalhoAtendimento(
    "10 = Ped",
    1,
    0,
    "Atendimento Pediatria"
);

grupoAtendimento.appendChild(estrela);
grupoAtendimento.appendChild(menuAtendimento);

estrela.onclick=function(e){

    e.stopPropagation();

    const aberto = menuAtendimento.style.display === "block";

    menuAtendimento.style.display = aberto ? "none" : "block";

    estrela.style.background = aberto
        ? "transparent"
        : "#bfdbfe";
};

document.addEventListener("click",function(e){

    if(
        !grupoAtendimento.contains(e.target)
    ){
        menuAtendimento.style.display="none";
        estrela.style.background="transparent";
    }

});

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
//--------------------------------------------------
// BOTÃO NEWS
//--------------------------------------------------

const news = document.createElement("div");

news.innerHTML = "📱 NEWS";

news.style.cssText = `
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

news.onmouseover=function(){
    news.style.background="#ececec";
};

news.onmouseout=function(){
    news.style.background="transparent";
};

news.onclick = function(e){

    e.stopPropagation();

    abrirCalculadoraNEWS();

};

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
painel.appendChild(news);
painel.appendChild(atualizar);


barra.appendChild(grupoAtendimento);
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

function preencherEvolucao(opcoes = {}){

    // MODOS:
    // Atendimento direto = apenas ectoscopia
    // ⭐ Clin = exame físico clínico completo
    // ⭐ Ped  = exame físico pediátrico
    const modo = opcoes.modo || "atendimento";
    const qChar = opcoes.qChar ?? 0;
    const eChar = opcoes.eChar ?? 1;

    if(typeof tinymce === "undefined" || !tinymce.activeEditor){
        alert("Abra a tela de Evolução.");
        return;
    }

    const tela = document.body.innerText;

    function obter(regex){
        const m = tela.match(regex);
        return m ? m[1].trim() : "NT";
    }

    // ------------------------------
    // DADOS DO PACIENTE
    // ------------------------------
    let peso = obter(/Peso\s*:?\s*([\d.,]+)\s*(?:kg)?/i);

    // Peso pediátrico: tenta primeiro o campo de peso da página,
    // depois o campo da prescrição e, por fim, o texto da triagem.
    const pesoTriagem = parseFloat(
        (
            document.querySelector("textarea[data-bind*='DescricaoQueixaFisico']")?.value
                ?.match(/(\d+(?:[.,]\d+)?)\s*kg/i)?.[1] || ""
        ).replace(",", ".")
    ) || 0;

    const pesoCampo = parseFloat(
        (
            document.querySelector("input[data-bind*='VlrPeso']")?.value?.trim() || ""
        ).replace(",", ".")
    ) || 0;

    const pesoPrescricao = parseFloat(
        (
            document.querySelector("#PrescricaoMedicamento_PesoUltimoAcolhimento")?.value?.trim() || ""
        ).replace(",", ".")
    ) || 0;

    const pesoPagina = pesoCampo || pesoPrescricao || pesoTriagem;

    if(pesoPagina > 0){
        peso = pesoPagina.toFixed(1).replace(".", ",");
    }else if(!peso || peso === "NT"){
        peso = "NT";
    }
    const fc = obter(/(?:F\.?C\.?|FC|Frequência Cardíaca)\s*:?\s*([\d.,]+)/i);
    const fr = obter(/(?:F\.?R\.?|FR|Frequência Respiratória|Freq\.?\s*Resp\.?)\s*:?\s*([\d.,]+)/i);
    const sat = obter(/(?:Sat\.?Ox\.?|Sat\.?|Saturação|SpO2|SpO₂)\s*:?\s*([\d.,]+)/i);
    const temp = obter(/(?:Temperatura|Temp\.?)\s*:?\s*([\d.,]+)/i);
    const pa = obter(/(?:PA|Pressão Arterial)\s*:?\s*([\d.,]+\s*[xX/]\s*[\d.,]+)/i);
    const dx = obter(/(?:DX|HGT|Glicemia(?:\s+Capilar)?)\s*:?\s*([\d.,]+)/i);

    const cabecalho = tela.match(
        /([A-ZÁÀÂÃÉÊÍÓÔÕÚÇ ]+)\s*\|\s*([^|]+)\s*\|\s*DN:/i
    );

    const nome = cabecalho ? cabecalho[1].trim() : "Não encontrado";
    const idade = cabecalho ? cabecalho[2].trim() : "";
    const primeiroNome = nome.split(/\s+/)[0] || "PACIENTE";

    // ------------------------------
    // UNIDADE + DATA/HORA
    // ------------------------------
    const unidadeEl =
        document.querySelector('label.first[wicketpath="empresaLogada"]') ||
        document.querySelector('label[wicketpath="empresaLogada"]');

    const unidade = (
        unidadeEl?.getAttribute("title") ||
        unidadeEl?.textContent ||
        document.querySelector('label[title*="UPA"]')?.getAttribute("title") ||
        "UPA"
    ).replace(/\.\.\.$/, "").trim().toUpperCase();

    const agora = new Date();

    const dataAtual = agora.toLocaleDateString("pt-BR", {
        day:"2-digit",
        month:"2-digit",
        year:"numeric"
    });

    const horaAtual = agora.toLocaleTimeString("pt-BR", {
        hour:"2-digit",
        minute:"2-digit",
        hourCycle:"h23"
    }).slice(0,5);

    // ------------------------------
    // CHEGADA
    // ------------------------------
    let chegada = "";

    const mTriagem = tela.match(
        /TRIAGEM[\s\S]*?([0-9]{2}\/\d{2}\/\d{4})\s*-\s*([0-9]{2}:\d{2})/i
    );

    if(mTriagem){
        chegada = mTriagem[2];
    }

    // ------------------------------
    // QUEIXA
    // ------------------------------
    let queixa = document.querySelector(
        'textarea[data-bind*="DscAcolhimento"]'
    )?.value?.trim() || "";

    if(!queixa){
        queixa = "PACIENTE COM QUADRO DE";
    }

    queixa = queixa
        .replace(/^#+\s*/gm, "")
        .replace(/\r/g, "")
        .trim()
        .toUpperCase();

    // ------------------------------
    // ALERGIAS
    // ------------------------------
    // O CELK informa a alergia no link "Alergia".
    // Exemplo real da página:
    // <a wicketpath="form_linkAlergia" title="AMOXICILINA">...</a>
    //
    // Portanto, NÃO devemos interpretar o texto ao redor da tela.
    // A fonte da verdade é o atributo TITLE desse link.
    // Se o link/atributo não existir ou estiver vazio -> NEGA.

    let alergia = "NEGA";

    const alergiaEl =
        document.querySelector('a[wicketpath="form_linkAlergia"][title]') ||
        document.querySelector('a[title][wicketpath*="linkAlergia"]');

    const alergiaTitulo = (
        alergiaEl?.getAttribute("title") || ""
    ).trim();

    if(alergiaTitulo){
        const valorAlergia = alergiaTitulo
            .replace(/\s+/g, " ")
            .replace(/\.\.\.$/, "")
            .trim();

        // Só aceita um valor que veio do TITLE do elemento Alergia.
        // Isso impede que FC, SAT, peso, CMB ou outros parâmetros
        // sejam confundidos com alergia.
        if(
            valorAlergia &&
            !/^(ALERGIA|ALERGIAS|NEGA|NENHUMA|NÃO|NAO|SEM ALERGIA|SEM ALERGIAS|N\/A|NA)$/i.test(valorAlergia)
        ){
            alergia = valorAlergia.toUpperCase();
        }
    }

    const cmb = "NEGA";

    // ------------------------------
    // SSVV
    // ------------------------------
    const ssvv = [
        `PA: ${pa}`,
        `FC: ${fc}`,
        `TAX: ${temp}`,
        `SAT: ${sat}`,
        `FR: ${fr}`,
        `DX: ${dx}`
    ].join(" - ");

    // Peso aparece em TODOS os modos. Se não for encontrado,
    // permanece explicitamente como NT.
    const pesoLinha = `# PESO: ${peso} kg`;

    // ------------------------------
    // EXAMES FÍSICOS
    // ------------------------------

    const exameAtendimento = `# EXAME FÍSICO:

- ECTOSCOPIA: BOM ESTADO GERAL, LÚCIDO, ORIENTADO EM TEMPO E ESPAÇO, CONTACTUANTE, CORADO, HIDRATADO, ANICTÉRICO, ACIANÓTICO E AFEBRIL AO TOQUE.`;

    const exameClin = `# EXAME FÍSICO:

- ECTOSCOPIA: BOM ESTADO GERAL, LÚCIDO, ORIENTADO EM TEMPO E ESPAÇO, CONTACTUANTE, CORADO, HIDRATADO, ANICTÉRICO, ACIANÓTICO E AFEBRIL AO TOQUE.
- APARELHO CARDIOVASCULAR: RITMO CARDÍACO REGULAR EM DOIS TEMPOS, BULHAS NORMOFONÉTICAS, SEM SOPROS.
- APARELHO RESPIRATÓRIO: MURMÚRIO VESICULAR PRESENTE BILATERALMENTE, SEM RUÍDOS ADVENTÍCIOS, SEM SINAIS DE DESCONFORTO RESPIRATÓRIO.
- ABDOME PLANO, FLÁCIDO, INDOLOR À PALPAÇÃO, SEM SINAIS DE IRRITAÇÃO PERITONEAL, COM RUÍDOS HIDROAÉREOS PRESENTES.
- EXTREMIDADES SEM EDEMAS, COM PULSOS PERIFÉRICOS PALPÁVEIS E SIMÉTRICOS, PERFUSÃO PERIFÉRICA PRESERVADA.
- EXAME NEUROLÓGICO SEM DÉFICITS FOCAIS EVIDENTES, COM FORÇA MUSCULAR E SENSIBILIDADE PRESERVADAS.`;

    const examePed = `# EXAME FÍSICO:

- BOM ESTADO GERAL, CORADO, EUPNEICO, ALERTA E ATIVO.
- APARELHO CARDIOVASCULAR: RITMO CARDÍACO REGULAR, EM DOIS TEMPOS, BULHAS NORMOFONÉTICAS, SEM SOPROS AUDÍVEIS.
- APARELHO RESPIRATÓRIO: MURMÚRIO VESICULAR UNIVERSALMENTE AUDÍVEL, SEM RUÍDOS ADVENTÍCIOS, SEM SINAIS DE DESCONFORTO RESPIRATÓRIO.
- ABDOME PLANO, FLÁCIDO, INDOLOR À PALPAÇÃO, SEM SINAIS DE IRRITAÇÃO PERITONEAL, COM RUÍDOS HIDROAÉREOS PRESENTES.
- EXTREMIDADES SEM EDEMAS, COM PULSOS PERIFÉRICOS PALPÁVEIS E SIMÉTRICOS, PERFUSÃO PERIFÉRICA PRESERVADA.`;

    // ------------------------------
    // TEXTO FINAL
    // ------------------------------

    let texto = "";

    // Cabeçalho presente em todos os modos.
    const cabecalhoUnidade =
        `# ${unidade} - ${dataAtual} - ATENDIMENTO INICIADO ÀS ${horaAtual}`;

    if(modo === "atendimento"){

        texto = `${cabecalhoUnidade}

# PACIENTE COM QUADRO DE

# CMB: ${cmb}
# ALERGIAS: ${alergia}

${pesoLinha}

# SSVV: ${ssvv}

${exameAtendimento}

# CD:
- PRESCREVO SINTOMÁTICOS
- ORIENTO SINAIS E SINTOMAS DE ALARME E RETORNO, SE NECESSÁRIO
- FORNEÇO ATESTADO MÉDICO`;

    }else if(modo === "ped" || (qChar === 1 && eChar === 0)){

        texto = `${cabecalhoUnidade}

# PACIENTE COM QUADRO DE

# CMB: ${cmb}
# ALERGIAS: ${alergia}

${pesoLinha}

# SSVV: ${ssvv}

${examePed}

# CD:
- VIDE PRESCRIÇÃO
- FORNEÇO ORIENTAÇÕES E SINAIS DE ALARME
- RETORNAR SE AUSÊNCIA DE MELHORA APÓS 72 HORAS
- RETORNAR EM CASO DE PIORA`;

    }else{

        texto = `${cabecalhoUnidade}

# PACIENTE COM QUADRO DE

# CMB: ${cmb}
# ALERGIAS: ${alergia}

${pesoLinha}

# SSVV: ${ssvv}

${exameClin}

# CD:
- VIDE PRESCRIÇÃO
- FORNEÇO ORIENTAÇÕES E SINAIS DE ALARME
- RETORNAR EM CASO DE PIORA`;

    }

    const escapeHtml = (valor) => String(valor)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

    const textoHtml = escapeHtml(texto)
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
        .replace(/\n/g, "<br>");

    tinymce.activeEditor.setContent(
        '<div style="width:100%; max-width:100%; box-sizing:border-box; overflow-wrap:anywhere; word-break:normal;">' +
        textoHtml +
        '</div>'
    );

    const classificacao = obterClassificacao();

    adicionarRelatorio(
        nome,
        idade,
        chegada,
        classificacao
    );

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
// CLICA NO BOTÃO PESQUISAR
//--------------------------------------------------

    //--------------------------------------------------
// ABRIR RELATÓRIO
//--------------------------------------------------

//--------------------------------------------------
// ABRIR RELATÓRIO
//--------------------------------------------------

    //--------------------------------------------------
// ADICIONAR AO RELATÓRIO
//--------------------------------------------------

// --------------------------------------------------
// IDENTIFICAR CLASSIFICAÇÃO DE RISCO
// --------------------------------------------------

function obterClassificacao(){

    const elemento = document.querySelector(
        'div.icon32[class*="ball-"]'
    );

    if(!elemento){
        return "NÃO IDENTIFICADA";
    }

    const classes = elemento.className;

    if(classes.includes("ball-red")){
        return "VERMELHO";
    }

    if(classes.includes("ball-orange")){
        return "LARANJA";
    }

    if(classes.includes("ball-yellow")){
        return "AMARELO";
    }

    if(classes.includes("ball-green")){
        return "VERDE";
    }

    if(classes.includes("ball-blue")){
        return "AZUL";
    }

    return "NÃO IDENTIFICADA";
}


function adicionarRelatorio(nome, idade, chegada, classificacao){

    const lista = JSON.parse(localStorage.getItem("celk_relatorio") || "[]");

    // evita duplicar
    if(lista.some(p =>
        p.nome === nome &&
        p.chegada === chegada
    )){
        return;
    }

    const agora = new Date();

    const atendido =
        agora.getHours().toString().padStart(2,"0") +
        ":" +
        agora.getMinutes().toString().padStart(2,"0");

    let tempo = "";

    if(chegada){

        const h = chegada.split(":");

        const inicio = new Date();

        inicio.setHours(
            Number(h[0]),
            Number(h[1]),
            0,
            0
        );

        const minutos = Math.max(
            0,
            Math.floor((agora - inicio)/60000)
        );

        tempo = minutos + " min";
    }

    lista.push({

    numero: lista.length + 1,

    nome,

    idade,

    classificacao,

    chegada,

    atendido,

    tempo

});

    localStorage.setItem(
        "celk_relatorio",
        JSON.stringify(lista)
    );

    console.log("Paciente salvo:", nome);

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
    {cid:"Z00.1", nome:"Consulta de Rotina"},
    {cid:"M54.5", nome:"Dorsalgia"},
    {cid:"R68.8", nome:"Outros Sintomas e Sinais Gerais Especificados"},
    {cid:"Z00.0", nome:"Exame Médico Geral (Adulto)"}

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
<th>Classificação</th>
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

<td>${p.classificacao || "NÃO IDENTIFICADA"}</td>

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
// CALCULADORA NEWS
//--------------------------------------------------

function abrirCalculadoraNEWS(){

    if(document.getElementById("celk-news-overlay")){
        return;
    }

    function num(v){

        if(v === null || v === undefined || v === ""){
            return null;
        }

        const n = parseFloat(
            String(v).replace(",", ".")
        );

        return isNaN(n) ? null : n;
    }

    function pontos(tipo, valor){

        const tabela = {

            pas:[
                [90,3],
                [100,2],
                [110,1],
                [219,0],
                [Infinity,3]
            ],

            fc:[
                [40,3],
                [50,1],
                [90,0],
                [110,1],
                [130,2],
                [Infinity,3]
            ],

            fr:[
                [8,3],
                [11,1],
                [20,0],
                [24,2],
                [Infinity,3]
            ],

            tax:[
                [35,3],
                [36,1],
                [38,0],
                [39,1],
                [Infinity,2]
            ],

            spo2:[
                [91,3],
                [93,2],
                [95,1],
                [Infinity,0]
            ]

        };

        const faixa = tabela[tipo];

        if(!faixa){
            return 0;
        }

        for(const item of faixa){

            if(valor <= item[0]){
                return item[1];
            }

        }

        return 0;
    }

    // ==========================================
    // EDITOR DA EVOLUÇÃO
    // ==========================================

    const editor =
        typeof tinymce !== "undefined"
            ? tinymce.activeEditor
            : null;

    if(!editor){

        alert("Abra a tela de Evolução.");

        return;
    }

// ==========================================
// LER PARÂMETROS DO ATENDIMENTO ATUAL
// ==========================================

let textoAtualCELK = "";


// ==========================================
// CABEÇALHO ATUAL DO PACIENTE
// ==========================================

const cabecalhoAtual =
    document.querySelector(
        ".warning.success.nome-paciente.span-9 h3 label"
    );

if(cabecalhoAtual){

    textoAtualCELK =
        cabecalhoAtual.innerText ||
        cabecalhoAtual.textContent ||
        "";

}


// ==========================================
// FC
// ==========================================

const fcMatchNEWS =
    textoAtualCELK.match(
        /(?:FC|F\.C\.|F\.C)\s*:?\s*(\d{1,3})/i
    );

const fcInicial =
    fcMatchNEWS
        ? fcMatchNEWS[1]
        : "";


// ==========================================
// SATURAÇÃO
// ==========================================

const spoMatchNEWS =
    textoAtualCELK.match(
        /(?:SAT|SAT\.O2|SAT\.OX|SAT\.OX\.|SATO2|SPO2|SPO₂|SATURAÇÃO)\s*:?\s*(\d{2,3})/i
    );

const spoInicial =
    spoMatchNEWS
        ? spoMatchNEWS[1]
        : "";


// ==========================================
// PA
// ==========================================

const paMatchNEWS =
    textoAtualCELK.match(
        /(?:PA|P\.A\.|PRESSÃO\s+ARTERIAL)\s*:?\s*(\d{2,3})\s*[xX\/]\s*(\d{2,3})/i
    );

let pasInicial = "";
let padInicial = "";

if(paMatchNEWS){

    pasInicial = paMatchNEWS[1] || "";

    padInicial = paMatchNEWS[2] || "";

}


// ==========================================
// FR
// ==========================================

const frMatchNEWS =
    textoAtualCELK.match(
        /(?:FR|F\.R\.|FREQUÊNCIA\s*RESPIRATÓRIA)\s*:?\s*(\d{1,3})/i
    );

const frInicial =
    frMatchNEWS
        ? frMatchNEWS[1]
        : "";


// ==========================================
// TEMPERATURA
// ==========================================

const taxMatchNEWS =
    textoAtualCELK.match(
        /(?:TAX|TEMP|TEMPERATURA|Tº|T°)\s*:?\s*([\d.,]{2,5})/i
    );

const taxInicial =
    taxMatchNEWS
        ? taxMatchNEWS[1]
        : "";


// ==========================================
// O2 SUPLEMENTAR
// ==========================================

let o2Inicial = false;

if(
    /\bO2\s*:\s*(SIM|S|YES)\b/i.test(textoAtualCELK) ||
    /\bO2\s+SUPLEMENTAR\b/i.test(textoAtualCELK) ||
    /\bOXIGÊNIO\s+SUPLEMENTAR\b/i.test(textoAtualCELK)
){

    o2Inicial = true;

}


// ==========================================
// ALTERAÇÃO DA CONSCIÊNCIA
// ==========================================

let ancInicial = false;

if(
    /\bANC\s*:\s*(SIM|S|YES)\b/i.test(textoAtualCELK) ||
    /ALTERAÇÃO\s+DA\s+CONSCIÊNCIA/i.test(textoAtualCELK) ||
    /ALTERAÇÃO\s+DE\s+CONSCIÊNCIA/i.test(textoAtualCELK) ||
    /REBAIXAMENTO\s+DO\s+NÍVEL\s+DE\s+CONSCIÊNCIA/i.test(textoAtualCELK)
){

    ancInicial = true;

}


// ==========================================
// CONFERÊNCIA
// ==========================================

console.log(
    "[NEWS] Parâmetros atuais:",
    {
        PAS: pasInicial,
        PAD: padInicial,
        FC: fcInicial,
        FR: frInicial,
        TAX: taxInicial,
        SpO2: spoInicial,
        O2: o2Inicial,
        ANC: ancInicial
    }
);

    // ==========================================
    // OVERLAY
    // ==========================================

    const overlay =
        document.createElement("div");

    overlay.id =
        "celk-news-overlay";

    overlay.style.cssText = `
        position:fixed;
        inset:0;
        background:rgba(0,0,0,.5);
        z-index:99999999;
    `;


    // ==========================================
    // JANELA
    // ==========================================

    const caixa =
        document.createElement("div");

    caixa.id =
        "celk-news-modal";

    caixa.style.cssText = `
        position:fixed;
        top:50%;
        left:50%;
        transform:translate(-50%,-50%);

        background:#fff;

        padding:20px;

        border-radius:8px;

        box-shadow:0 4px 20px rgba(0,0,0,.3);

        z-index:100000000;

        width:600px;
        max-width:90vw;
        max-height:85vh;

        overflow-y:auto;

        font-family:
        -apple-system,
        BlinkMacSystemFont,
        "Segoe UI",
        Roboto,
        sans-serif;
    `;


    caixa.innerHTML = `

        <h3 style="
            margin:0 0 15px;
            color:#2c3e50;
            font-size:18px;
        ">
            NEWS Calculator
        </h3>


        <div style="
            display:grid;
            grid-template-columns:1fr 1fr;
            gap:10px 15px;
        ">

            <div class="news-row">

                <label>PAS:</label>

                <input
                    id="celk-news-pas"
                    type="text"
                    inputmode="numeric"
                    value="${pasInicial || ""}"
                >

                <div id="celk-news-pts-pas">0</div>

            </div>


            <div class="news-row">

                <label>PAD:</label>

                <input
                    id="celk-news-pad"
                    type="text"
                    inputmode="numeric"
value="${padInicial || ""}"
                >

                <div id="celk-news-pam">
                    PAM: -
                </div>

            </div>


            <div class="news-row">

                <label>FC (bpm):</label>

                <input
                    id="celk-news-fc"
                    type="text"
                    inputmode="numeric"
                    value="${fcInicial || ""}"
                >

                <div id="celk-news-pts-fc">0</div>

            </div>


            <div class="news-row">

                <label>FR (irpm):</label>

                <input
                    id="celk-news-fr"
                    type="text"
                    inputmode="numeric"
                    value="${frInicial || ""}"
                >

                <div id="celk-news-pts-fr">0</div>

            </div>


            <div class="news-row">

                <label>TAX (°C):</label>

                <input
                    id="celk-news-tax"
                    type="text"
                    inputmode="decimal"
                    value="${taxInicial || ""}"
                >

                <div id="celk-news-pts-tax">0</div>

            </div>


            <div class="news-row">

                <label>SpO2 (%):</label>

                <input
                    id="celk-news-spo2"
                    type="text"
                    inputmode="numeric"
                    value="${spoInicial || ""}"
                >

                <div id="celk-news-pts-spo2">0</div>

            </div>


            <div class="news-check">

                <label>

                    <input
                        type="checkbox"
                        id="celk-news-o2"
                    >

                    O2 suplementar

                </label>

                <div id="celk-news-pts-o2">0</div>

            </div>


            <div class="news-check">

                <label>

                    <input
                        type="checkbox"
                        id="celk-news-anc"
                    >

                    Alt. consciência

                </label>

                <div id="celk-news-pts-anc">0</div>

            </div>

        </div>


        <div style="
            margin-top:15px;
            padding:12px;
            background:#f8f9fa;
            border-radius:4px;
            text-align:center;
        ">

            <div style="
                font-size:12px;
                color:#666;
            ">
                Total NEWS Score
            </div>

            <div
                id="celk-news-total"
                style="
                    font-size:28px;
                    font-weight:bold;
                    color:#e74c3c;
                "
            >
                -
            </div>

        </div>


        <div style="
            margin-top:15px;
            display:flex;
            gap:10px;
        ">

            <button
                id="celk-news-save"
                style="
                    flex:1;
                    padding:10px;
                    background:#27ae60;
                    color:#fff;
                    border:none;
                    border-radius:4px;
                    cursor:pointer;
                    font-size:15px;
                    font-weight:500;
                "
            >
                Salvar
            </button>


            <button
                id="celk-news-append"
                style="
                    padding:10px 15px;
                    background:#3498db;
                    color:#fff;
                    border:none;
                    border-radius:4px;
                    cursor:pointer;
                    font-size:15px;
                    font-weight:500;
                "
            >
                +
            </button>


            <button
                id="celk-news-cancel"
                style="
                    flex:1;
                    padding:10px;
                    background:#95a5a6;
                    color:#fff;
                    border:none;
                    border-radius:4px;
                    cursor:pointer;
                    font-size:15px;
                    font-weight:500;
                "
            >
                Cancelar
            </button>

        </div>
    `;


    // ==========================================
    // ESTILO
    // ==========================================

    const style =
        document.createElement("style");

    style.id =
        "celk-news-style";

    style.textContent = `

        .news-row{
            display:grid;
            grid-template-columns:1fr 60px;
            gap:6px;
            align-items:end;
        }

        .news-row label{
            display:block;
            grid-column:1;
            margin-bottom:2px;
            font-weight:500;
            font-size:13px;
        }

        .news-row input{
            width:100%;
            box-sizing:border-box;
            padding:6px;
            border:1px solid #ddd;
            border-radius:4px;
            font-size:14px;
            grid-column:1;
        }

        .news-row div{
            grid-column:2;
            grid-row:1 / span 2;
            padding:6px;
            text-align:center;
            border-radius:4px;
            font-weight:bold;
            height:32px;
            line-height:20px;
            box-sizing:border-box;
        }

        .news-check{
            display:grid;
            grid-template-columns:1fr 60px;
            gap:6px;
            align-items:center;
        }

        .news-check label{
            display:flex;
            align-items:center;
            gap:6px;
            font-weight:500;
            font-size:13px;
        }

        .news-check input{
            width:18px;
            height:18px;
        }

        .news-check div{
            padding:6px;
            text-align:center;
            font-weight:bold;
        }

    `;

    document.head.appendChild(style);

    document.body.appendChild(overlay);
    document.body.appendChild(caixa);


    // ==========================================
    // CALCULAR
    // ==========================================

    function calcular(){

        const pas =
            num(document.getElementById(
                "celk-news-pas"
            ).value);

        const pad =
            num(document.getElementById(
                "celk-news-pad"
            ).value);

        const fc =
            num(document.getElementById(
                "celk-news-fc"
            ).value);

        const fr =
            num(document.getElementById(
                "celk-news-fr"
            ).value);

        const tax =
            num(document.getElementById(
                "celk-news-tax"
            ).value);

        const spo2 =
            num(document.getElementById(
                "celk-news-spo2"
            ).value);

        const o2 =
            document.getElementById(
                "celk-news-o2"
            ).checked;

        const anc =
            document.getElementById(
                "celk-news-anc"
            ).checked;


        const r = {

            pas:
                pas !== null
                    ? pontos("pas",pas)
                    : 0,

            fc:
                fc !== null
                    ? pontos("fc",fc)
                    : 0,

            fr:
                fr !== null
                    ? pontos("fr",fr)
                    : 0,

            tax:
                tax !== null
                    ? pontos("tax",tax)
                    : 0,

            spo2:
                spo2 !== null
                    ? pontos("spo2",spo2)
                    : 0,

            o2:
                o2 ? 2 : 0,

            anc:
                anc ? 3 : 0
        };


        r.total =
            r.pas +
            r.fc +
            r.fr +
            r.tax +
            r.spo2 +
            r.o2 +
            r.anc;


        r.pam =
            pas !== null &&
            pad !== null
                ? Math.round(
                    (pas + 2 * pad) / 3
                )
                : null;


        r.valores = {
            pas,
            pad,
            fc,
            fr,
            tax,
            spo2,
            o2,
            anc
        };


        return r;

    }


    // ==========================================
    // ATUALIZAR TELA
    // ==========================================

    function atualizar(){

        const r = calcular();

        const ids = {

            pas:"celk-news-pts-pas",
            fc:"celk-news-pts-fc",
            fr:"celk-news-pts-fr",
            tax:"celk-news-pts-tax",
            spo2:"celk-news-pts-spo2",
            o2:"celk-news-pts-o2",
            anc:"celk-news-pts-anc"

        };


        Object.keys(ids).forEach(k=>{

            const el =
                document.getElementById(ids[k]);

            if(el){

                el.textContent =
                    r[k];

            }

        });


        const pam =
            document.getElementById(
                "celk-news-pam"
            );

        if(pam){

            pam.textContent =
                r.pam !== null
                    ? "PAM: " + r.pam
                    : "PAM: -";

        }


        const v =
            r.valores;


        const completo =
            v.pas !== null &&
            v.pad !== null &&
            v.fc !== null &&
            v.fr !== null &&
            v.tax !== null &&
            v.spo2 !== null;


        const total =
            document.getElementById(
                "celk-news-total"
            );

        if(total){

            total.textContent =
                completo
                    ? r.total
                    : "-";

        }

    }


    [
        "celk-news-pas",
        "celk-news-pad",
        "celk-news-fc",
        "celk-news-fr",
        "celk-news-tax",
        "celk-news-spo2"
    ].forEach(id=>{

        document.getElementById(id)
            ?.addEventListener(
                "input",
                atualizar
            );

    });


    [
        "celk-news-o2",
        "celk-news-anc"
    ].forEach(id=>{

        document.getElementById(id)
            ?.addEventListener(
                "change",
                atualizar
            );

    });


    // ==========================================
    // FECHAR
    // ==========================================

    function fechar(){

        overlay.remove();
        caixa.remove();

        style.remove();

        document.removeEventListener(
            "keydown",
            tecla
        );

    }


    function tecla(e){

        if(e.key === "Escape"){

            e.preventDefault();

            fechar();

        }

    }


    document.addEventListener(
        "keydown",
        tecla
    );


    overlay.onclick = function(e){

        if(e.target === overlay){

            fechar();

        }

    };


    document.getElementById(
        "celk-news-cancel"
    ).onclick = fechar;


    // ==========================================
    // TEXTO PARA EVOLUÇÃO
    // ==========================================

    function gerarTexto(r){

        return (
            "# NEWS: " +
            r.total +
            " pontos " +
            "(PAS:" + r.pas +
            " - FC:" + r.fc +
            " - FR:" + r.fr +
            " - TAX:" + r.tax +
            " - SPO2:" + r.spo2 +
            " - O2:" +
            (r.o2 ? "Sim" : "Não") +
            " - ANC:" +
            (r.anc ? "Sim" : "Não") +
            ")"
        );

    }


    // ==========================================
    // SALVAR
    // ==========================================

    document.getElementById(
        "celk-news-save"
    ).onclick = function(){

        const r = calcular();

        const v = r.valores;

        if(
            v.pas === null ||
            v.pad === null ||
            v.fc === null ||
            v.fr === null ||
            v.tax === null ||
            v.spo2 === null
        ){

            alert(
                "Preencha PAS, PAD, FC, FR, TAX e SpO2."
            );

            return;
        }


        const texto =
            gerarTexto(r);


        editor.focus();

        editor.execCommand(
            "mceInsertContent",
            false,
            "<p>" +
            texto +
            "</p>"
        );


        fechar();

    };


    // ==========================================
    // +
    // ==========================================

    document.getElementById(
        "celk-news-append"
    ).onclick = function(){

        const r = calcular();

        const v = r.valores;

        if(
            v.pas === null ||
            v.pad === null ||
            v.fc === null ||
            v.fr === null ||
            v.tax === null ||
            v.spo2 === null
        ){

            alert(
                "Preencha PAS, PAD, FC, FR, TAX e SpO2."
            );

            return;
        }


        const texto =
            gerarTexto(r);


        editor.focus();

        editor.execCommand(
            "mceInsertContent",
            false,
            "<p><br>" +
            texto +
            "</p>"
        );


        fechar();

    };


    // ==========================================
    // INICIAR
    // ==========================================

    atualizar();

    setTimeout(function(){

        document.getElementById(
            "celk-news-pas"
        )?.focus();

    },100);

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
        setTimeout(() => {

    const editor = [...document.querySelectorAll('.span-5')]
        .find(el => el.querySelector('table.mceLayout'));

    if (!editor) return;

    editor.style.setProperty('width','800px','important');
    editor.style.setProperty('min-width','800px','important');
    editor.style.setProperty('max-width','800px','important');
    editor.style.setProperty('margin-left','50px','important');

    const fieldset = editor.querySelector('fieldset');

    if(fieldset){
        fieldset.style.setProperty('width','800px','important');
        fieldset.style.setProperty('min-width','800px','important');
        fieldset.style.setProperty('max-width','800px','important');
        fieldset.style.setProperty('height','700px','important');
        fieldset.style.setProperty('box-sizing','border-box','important');
    }

    const field = editor.querySelector('.field');

    if(field){
        field.style.setProperty('width','800px','important');
        field.style.setProperty('max-width','800px','important');
        field.style.setProperty('height','700px','important');
    }

    const horizontal = editor.querySelector('.span-horizontal');

    if(horizontal){
        horizontal.style.setProperty('width','800px','important');
        horizontal.style.setProperty('max-width','800px','important');
        horizontal.style.setProperty('height','660px','important');
    }

    const mceLayout = editor.querySelector('table.mceLayout');

    if(mceLayout){
        mceLayout.style.setProperty('width','800px','important');
        mceLayout.style.setProperty('min-width','800px','important');
        mceLayout.style.setProperty('max-width','800px','important');
        mceLayout.style.setProperty('height','700px','important');
    }

    const iframe = editor.querySelector('iframe');

    if(iframe){
        iframe.style.setProperty('width','100%','important');
        iframe.style.setProperty('height','660px','important');
        iframe.style.setProperty('min-height','660px','important');
    }

},300);

    });

    observerCELK.observe(alvo,{
        childList:true,
        subtree:true
    });

}

    window.celk.init = function(){

    criarInterface();

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

    setTimeout(() => {

    const editor = [...document.querySelectorAll('.span-5')]
        .find(el => el.querySelector('table.mceLayout'));

    if (!editor) {
        console.log('EDITOR NÃO ENCONTRADO');
        return;
    }

    editor.style.setProperty('width', '800px', 'important');
    editor.style.setProperty('min-width', '800px', 'important');
    editor.style.setProperty('max-width', '800px', 'important');
    editor.style.setProperty('margin-left', '50px', 'important');

    const fieldset = editor.querySelector('fieldset');

    if (fieldset) {
        fieldset.style.setProperty('width', '800px', 'important');
        fieldset.style.setProperty('min-width', '800px', 'important');
        fieldset.style.setProperty('max-width', '800px', 'important');
        fieldset.style.setProperty('height', '700px', 'important');
        fieldset.style.setProperty('box-sizing', 'border-box', 'important');
    }

    const h2 = editor.querySelector('h2');

    if (h2) {
        h2.style.setProperty('width', '100%', 'important');
        h2.style.setProperty('box-sizing', 'border-box', 'important');
    }

    const field = editor.querySelector('.field');

    if (field) {
        field.style.setProperty('width', '800px', 'important');
        field.style.setProperty('max-width', '800px', 'important');
        field.style.setProperty('height', '700px', 'important');
        field.style.setProperty('margin-right', '0px', 'important');
        field.style.setProperty('box-sizing', 'border-box', 'important');
    }

    const horizontal = editor.querySelector('.span-horizontal');

    if (horizontal) {
        horizontal.style.setProperty('width', '800px', 'important');
        horizontal.style.setProperty('max-width', '800px', 'important');
        horizontal.style.setProperty('height', '660px', 'important');
        horizontal.style.setProperty('box-sizing', 'border-box', 'important');
    }

    const mceEditor = editor.querySelector('.mceEditor');

    if (mceEditor) {
        mceEditor.style.setProperty('width', '100%', 'important');
        mceEditor.style.setProperty('max-width', '100%', 'important');
    }

    const mceLayout = editor.querySelector('table.mceLayout');

    if (mceLayout) {
        mceLayout.style.setProperty('width', '800px', 'important');
        mceLayout.style.setProperty('min-width', '800px', 'important');
        mceLayout.style.setProperty('max-width', '800px', 'important');
        mceLayout.style.setProperty('height', '700px', 'important');
    }

    const iframe = editor.querySelector('iframe');

    if (iframe) {
        iframe.style.setProperty('width', '100%', 'important');
        iframe.style.setProperty('height', '660px', 'important');
        iframe.style.setProperty('min-height', '660px', 'important');
        iframe.style.setProperty('display', 'block', 'important');
    }

    console.log('✅ EDITOR: 800 × 700 | 50px À DIREITA');

}, 2000);

})();

