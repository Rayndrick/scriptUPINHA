// =========================================================
// CELK HELPER — V27
// ATESTADO: fluxo direto pelo botão "Novo Documento"
// =========================================================
console.log("[CELK Helper V30] V27 CARREGADO — ATESTADO COM PREENCHIMENTO DOS DIAS NO EDITOR");

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
gap:0;

height:100%;

padding:0;

background:#f8f8f8;

flex:1 1 auto;
min-width:0;

overflow-x:auto;
overflow-y:hidden;
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

cid.onclick=function(){

    // Ao clicar em 📋 CID, já seleciona automaticamente
    // "ALTA MÉDICA" no campo Encaminhamento do CELK.
    selecionarAltaMedica();

    // Mantém o menu de CIDs normalmente.
    abrirMenuCID();

};
//--------------------------------------------------
// BOTÃO ATESTADO
//--------------------------------------------------

const atestado = document.createElement("div");

atestado.innerHTML="📜 Atestado";

atestado.style.cssText=`
display:flex;
align-items:center;
justify-content:center;

height:100%;

min-width:145px;
flex:0 0 145px;
box-sizing:border-box;

padding:0 18px;

font-size:18px;
font-weight:bold;

color:#222;

background:#f8f8f8;

cursor:pointer;

user-select:none;

border-left:1px solid #d8d8d8;
`;

atestado.onmouseover=function(){
    atestado.style.background="#ececec";
};

atestado.onmouseout=function(){
    atestado.style.background="transparent";
};

atestado.onclick=function(e){
    e.stopPropagation();
    abrirMenuAtestado();
};

console.log("📜 [CELK Helper V30] Botão ATESTADO criado.");

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
// Ordem fixa da barra: Relatório → CID → Atestado → NEWS → Atualizar
painel.appendChild(relatorio);
painel.appendChild(cid);
painel.appendChild(atestado);
painel.appendChild(news);
painel.appendChild(atualizar);

// Garante que o Atestado fique visível mesmo quando a largura da janela
// for menor que a soma dos botões.
[relatorio, cid, atestado, news, atualizar].forEach(function(el){
    el.style.flexShrink = "0";
});


barra.appendChild(grupoAtendimento);
barra.appendChild(atendimento);
barra.appendChild(painel);

const topo = document.querySelector("#bar-holder");

if (topo) {

    topo.insertAdjacentElement("afterend", barra);

} else {

    document.body.appendChild(barra);

}

//--------------------------------------------------
// GARANTIA ROBUSTA DO BOTÃO ATESTADO
//--------------------------------------------------

function criarBotaoAtestadoRobusto(){

    const barraAtual = document.getElementById("celk-helper");

    if(!barraAtual){
        return false;
    }

    // Se já existe, apenas garante que esteja visível.
    const existente = [...barraAtual.querySelectorAll("div,button,a")]
        .find(function(el){

            const txt = (el.textContent || "")
                .replace(/\s+/g," ")
                .trim()
                .toUpperCase();

            return txt === "📜 ATESTADO" ||
                   txt === "ATESTADO";
        });

    if(existente){

        existente.style.setProperty(
            "display",
            "flex",
            "important"
        );

        existente.style.setProperty(
            "visibility",
            "visible",
            "important"
        );

        existente.style.setProperty(
            "opacity",
            "1",
            "important"
        );

        existente.style.setProperty(
            "min-width",
            "145px",
            "important"
        );

        existente.style.setProperty(
            "width",
            "145px",
            "important"
        );

        existente.style.setProperty(
            "flex",
            "0 0 145px",
            "important"
        );

        return true;
    }

    // Localiza o botão CID já renderizado.
    const cidAtual = [...barraAtual.querySelectorAll("div,button,a")]
        .find(function(el){

            const txt = (el.textContent || "")
                .replace(/\s+/g," ")
                .trim()
                .toUpperCase();

            return txt === "📋 CID" || txt === "CID";
        });

    if(!cidAtual){
        return false;
    }

    // Cria uma cópia independente do estilo da barra.
    const novo = document.createElement("div");

    novo.id = "celk-helper-atestado";

    novo.textContent = "📜 Atestado";

    novo.style.cssText = `
        display:flex !important;
        align-items:center !important;
        justify-content:center !important;

        box-sizing:border-box !important;

        width:145px !important;
        min-width:145px !important;
        max-width:145px !important;

        flex:0 0 145px !important;

        height:100% !important;

        padding:0 18px !important;

        font-family:Segoe UI,Arial,sans-serif !important;
        font-size:18px !important;
        font-weight:bold !important;

        color:#222 !important;
        background:#f8f8f8 !important;

        cursor:pointer !important;
        user-select:none !important;

        border-left:1px solid #d8d8d8 !important;
    `;

    novo.onmouseenter = function(){
        novo.style.setProperty(
            "background",
            "#ececec",
            "important"
        );
    };

    novo.onmouseleave = function(){
        novo.style.setProperty(
            "background",
            "#f8f8f8",
            "important"
        );
    };

    novo.onclick = function(e){

        e.preventDefault();
        e.stopPropagation();

        if(typeof abrirMenuAtestado === "function"){
            abrirMenuAtestado();
        }else{
            console.error(
                "[CELK Helper V30] função abrirMenuAtestado não encontrada."
            );
        }
    };

    // Insere imediatamente depois do CID.
    cidAtual.insertAdjacentElement(
        "afterend",
        novo
    );

    console.log(
        "📜 [CELK Helper V30] ATESTADO inserido após CID."
    );

    return true;
}

window.celkGarantirBotaoAtestado = function(){

    if(criarBotaoAtestadoRobusto()){
        return;
    }

    // O CELK pode reconstruir a barra de forma assíncrona.
    // Tenta novamente até o botão aparecer.
    setTimeout(criarBotaoAtestadoRobusto,100);
    setTimeout(criarBotaoAtestadoRobusto,300);
    setTimeout(criarBotaoAtestadoRobusto,700);
    setTimeout(criarBotaoAtestadoRobusto,1500);
    setTimeout(criarBotaoAtestadoRobusto,3000);
}

window.celkGarantirBotaoAtestado?.();

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
    // TRIAGEM / QUEIXA
    // ------------------------------
    // O CELK mantém a triagem no histórico de atendimentos.
    // Na tela, o bloco aparece como:
    // "UP1 - TRIAGEM COM CLASSIFICAÇÃO DE RISCO"
    // e logo abaixo existe um <p> com a descrição escrita na triagem.
    //
    // Exemplo real:
    // <p>MAE REFERE, TOSSE SECA HÁ 6 DIAS NEGA FEBRE...</p>
    //
    // A partir desta versão, essa é a FONTE PRINCIPAL da queixa.
    function obterTextoTriagem(){

        let bruto = "";

        // 1) FONTE PRINCIPAL: histórico visual da TRIAGEM.
        // Procura os blocos de descrição do repeater de atendimentos
        // e identifica aquele cujo cartão/ancestral contém
        // "TRIAGEM COM CLASSIFICAÇÃO DE RISCO".
        try{

            const descricoes = Array.from(
                document.querySelectorAll(
                    'div[wicketpath*="repeaterAtendimentosProntuario"][wicketpath*="_descricao"] p, ' +
                    'div[wicketpath*="repeaterAtendimentosProntuario"][wicketpath*="_descricao"]'
                )
            );

            for(const el of descricoes){

                const textoDescricao = (el.textContent || "")
                    .replace(/\s+/g, " ")
                    .trim();

                if(!textoDescricao){
                    continue;
                }

                let ancestral = el;

                for(let i = 0; i < 8 && ancestral; i++){
                    const textoCard = (ancestral.innerText || "")
                        .replace(/\s+/g, " ")
                        .trim()
                        .toUpperCase();

                    if(
                        textoCard.includes("TRIAGEM COM CLASSIFICAÇÃO DE RISCO") ||
                        textoCard.includes("TRIAGEM COM CLASSIFICACAO DE RISCO")
                    ){
                        bruto = textoDescricao;
                        break;
                    }

                    ancestral = ancestral.parentElement;
                }

                if(bruto){
                    break;
                }
            }

        }catch(e){
            console.warn(
                "[CELK Helper V30] erro ao localizar triagem no histórico:",
                e
            );
        }

        // 2) Segunda tentativa: localizar diretamente qualquer bloco
        // que contenha o título da triagem e pegar o <p> de descrição.
        if(!bruto){
            try{

                const candidatos = Array.from(
                    document.querySelectorAll(
                        '[wicketpath*="repeaterAtendimentosProntuario"]'
                    )
                );

                for(const bloco of candidatos){

                    const textoBloco = (bloco.innerText || "")
                        .replace(/\s+/g, " ")
                        .trim()
                        .toUpperCase();

                    if(
                        textoBloco.includes("TRIAGEM COM CLASSIFICAÇÃO DE RISCO") ||
                        textoBloco.includes("TRIAGEM COM CLASSIFICACAO DE RISCO")
                    ){

                        const p = bloco.querySelector("p");

                        if(p?.textContent?.trim()){
                            bruto = p.textContent.trim();
                            break;
                        }
                    }
                }

            }catch(e){}
        }

        // 3) Mantém compatibilidade com outras telas do CELK.
        if(!bruto){
            try{
                const infoTriagem =
                    window.o4a?.util?.evolucoesTriagem?.();

                if(infoTriagem?.triagemRaw){
                    bruto = String(infoTriagem.triagemRaw).trim();
                }
            }catch(e){}
        }

        // 4) Campo de acolhimento, quando existir.
        if(!bruto){
            const campoAcolhimento = document.querySelector(
                'textarea[data-bind*="DscAcolhimento"]'
            );

            bruto = campoAcolhimento?.value?.trim() || "";
        }

        // 5) Campo usado em algumas telas pediátricas.
        if(!bruto){
            const campoTriagem = document.querySelector(
                'textarea[data-bind*="DescricaoQueixaFisico"]'
            );

            bruto = campoTriagem?.value?.trim() || "";
        }

        if(!bruto){
            return "";
        }

        // Limpeza sem destruir a frase da triagem.
        bruto = bruto
            .replace(/\r/g, "")
            .replace(/\s+/g, " ")
            .trim();

        // Remove somente marcadores indevidos no início.
        bruto = bruto
            .replace(/^#+\s*/i, "")
            .trim();

        // Se por alguma razão o texto vier acompanhado de blocos
        // de parâmetros, corta antes deles.
        const corte = bruto.search(
            /(?:#?\s*)(?:CMB|ALERGIAS?|SSVV|SINAIS\s+VITAIS|EXAME\s+F[IÍ]SICO|CONDUTA|CD)\s*:/i
        );

        if(corte > 0){
            bruto = bruto.slice(0, corte).trim();
        }

        return bruto.toUpperCase();
    }

    const queixaTriagem = obterTextoTriagem();

    const queixa = queixaTriagem || "PACIENTE COM QUADRO DE";

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
    // PARÂMETROS / SSVV
    // ------------------------------
    // Mantém os parâmetros separados, como no modelo anterior.
    // O PESO segue exatamente o mesmo padrão dos demais parâmetros.
    // A queixa da TRIAGEM NÃO substitui nem mistura os parâmetros.
    const parametros =
        `# PESO: ${peso} kg | FC: ${fc} | FR: ${fr} | PA: ${pa} | SAT: ${sat} | TEMP: ${temp}°C | DX: ${dx}`;

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

# PACIENTE COM QUADRO DE ${queixa}

# CMB: ${cmb}
# ALERGIAS: ${alergia}

${parametros}

${exameAtendimento}

# CD:
- PRESCREVO SINTOMÁTICOS
- ORIENTO SINAIS E SINTOMAS DE ALARME E RETORNO, SE NECESSÁRIO
- FORNEÇO ATESTADO MÉDICO`;

    }else if(modo === "ped" || (qChar === 1 && eChar === 0)){

        texto = `${cabecalhoUnidade}

# PACIENTE COM QUADRO DE ${queixa}

# CMB: ${cmb}
# ALERGIAS: ${alergia}

${parametros}

${examePed}

# CD:
- VIDE PRESCRIÇÃO
- FORNEÇO ORIENTAÇÕES E SINAIS DE ALARME
- RETORNAR SE AUSÊNCIA DE MELHORA APÓS 72 HORAS
- RETORNAR EM CASO DE PIORA`;

    }else{

        texto = `${cabecalhoUnidade}

# PACIENTE COM QUADRO DE ${queixa}

# CMB: ${cmb}
# ALERGIAS: ${alergia}

${parametros}

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

    // O CELK apresenta a classificação através de uma DIV
    // com classe icon32 + ball-cor.
    // Exemplos:
    // ball-blue   = AZUL
    // ball-green  = VERDE
    // ball-yellow = AMARELO
    // ball-orange = LARANJA
    // ball-red    = VERMELHO

    const elementos = Array.from(
        document.querySelectorAll('div.icon32[class*="ball-"]')
    );

    // Prioriza o elemento visível.
    const elemento = elementos.find(el => {
        const style = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        return style.display !== "none" &&
               style.visibility !== "hidden" &&
               rect.width > 0 &&
               rect.height > 0;
    }) || elementos[0];

    if(!elemento){
        return "NÃO IDENTIFICADA";
    }

    const classes = (elemento.className || "").toLowerCase();

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

    // Fallback: caso o CELK altere a classe, tenta identificar
    // pelo texto/atributo do próprio elemento.
    const conteudo = (
        elemento.textContent ||
        elemento.getAttribute("title") ||
        elemento.getAttribute("aria-label") ||
        ""
    ).trim().toUpperCase();

    if(/VERMELHO|RED/.test(conteudo)){
        return "VERMELHO";
    }

    if(/LARANJA|ORANGE/.test(conteudo)){
        return "LARANJA";
    }

    if(/AMARELO|YELLOW/.test(conteudo)){
        return "AMARELO";
    }

    if(/VERDE|GREEN/.test(conteudo)){
        return "VERDE";
    }

    if(/AZUL|BLUE/.test(conteudo)){
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

//--------------------------------------------------
// ATESTADO MÉDICO — MENU
//--------------------------------------------------

function abrirMenuAtestado(){

    if(document.getElementById("celk-atestado-overlay")){
        return;
    }

    const overlay = document.createElement("div");
    overlay.id = "celk-atestado-overlay";

    overlay.style.cssText = `
        position:fixed;
        inset:0;
        background:rgba(0,0,0,.45);
        z-index:100000000;
        display:flex;
        align-items:center;
        justify-content:center;
        font-family:Segoe UI,Arial,sans-serif;
    `;

    const caixa = document.createElement("div");

    caixa.style.cssText = `
        width:380px;
        max-width:90vw;
        background:#fff;
        border-radius:8px;
        box-shadow:0 8px 30px rgba(0,0,0,.35);
        padding:22px;
        box-sizing:border-box;
    `;

    caixa.innerHTML = `
        <div style="font-size:20px;font-weight:700;margin-bottom:18px;">
            📜 ATESTADO MÉDICO
        </div>

        <label style="display:block;font-weight:600;margin-bottom:6px;">
            Quantos dias de afastamento?
        </label>

        <input
            id="celk-atestado-dias"
            type="number"
            min="1"
            step="1"
            value="1"
            style="
                width:100%;
                box-sizing:border-box;
                padding:9px;
                font-size:18px;
                border:1px solid #bbb;
                border-radius:5px;
                margin-bottom:18px;
            "
        >

        <div style="font-weight:600;margin-bottom:8px;">
            Incluir CID no atestado?
        </div>

        <div style="display:flex;gap:8px;">
            <button id="celk-atestado-com-cid"
                style="
                    flex:1;
                    padding:11px;
                    border:none;
                    border-radius:5px;
                    background:#2563eb;
                    color:#fff;
                    font-weight:700;
                    cursor:pointer;
                ">
                SIM — COM CID
            </button>

            <button id="celk-atestado-sem-cid"
                style="
                    flex:1;
                    padding:11px;
                    border:1px solid #aaa;
                    border-radius:5px;
                    background:#f5f5f5;
                    color:#222;
                    font-weight:700;
                    cursor:pointer;
                ">
                NÃO — SEM CID
            </button>
        </div>

        <div style="
            margin-top:12px;
            font-size:12px;
            color:#666;
            line-height:1.4;
        ">
            COM CID: o campo do CID ficará disponível para você digitar.
            SEM CID: o CID será desativado e os campos serão limpos.
        </div>
    `;

    overlay.appendChild(caixa);
    document.body.appendChild(overlay);

    const fechar = () => {
        overlay.remove();
    };

    overlay.addEventListener("click", function(e){
        if(e.target === overlay){
            fechar();
        }
    });
// Usa delegação no próprio overlay para evitar que o CELK
    // intercepte/reconstrua os handlers dos botões.
    overlay.addEventListener("click", async function(e){

        const botao = e.target.closest(
            "#celk-atestado-com-cid, #celk-atestado-sem-cid"
        );

        if(!botao){
            return;
        }

        e.preventDefault();
        e.stopPropagation();

        const campoDiasUI =
            document.getElementById("celk-atestado-dias");

        const dias = Number(campoDiasUI?.value);

        if(!Number.isInteger(dias) || dias < 1){

            alert("Informe uma quantidade válida de dias.");
            return;
        }

        const comCid =
            botao.id === "celk-atestado-com-cid";

        console.log(
            "[CELK Helper V30] Botão do Atestado clicado:",
            dias,
            comCid ? "COM CID" : "SEM CID"
        );

        // Mostra imediatamente que o clique foi recebido.
        botao.disabled = true;
        botao.style.opacity = "0.6";

        const textoOriginal = botao.textContent;
        botao.textContent = "ABRINDO...";

        try{

            await prepararAtestado(dias, comCid);

        }catch(err){

            console.error(
                "[CELK Helper V30] erro no clique do Atestado:",
                err
            );

            alert(
                "Não foi possível abrir o formulário de Atestado. " +
                (err?.message || "")
            );

        }finally{

            // Se o fluxo tiver removido o modal, não há nada para fazer.
            if(document.body.contains(overlay)){
                overlay.remove();
            }
        }

    }, true);

    setTimeout(() => {
        document.getElementById("celk-atestado-dias")?.focus();
        document.getElementById("celk-atestado-dias")?.select();
    }, 0);
}


//--------------------------------------------------
// ATESTADO MÉDICO — ABRIR TELA
//--------------------------------------------------


//--------------------------------------------------
// EDITOR DO DOCUMENTO / PREENCHIMENTO DOS DIAS
//--------------------------------------------------

function normalizarTextoCelk(s){
    return (s || "")
        .replace(/\u00a0/g," ")
        .replace(/\s+/g," ")
        .trim()
        .toUpperCase();
}

function textoTemModeloAtestado(s){
    const t = normalizarTextoCelk(s);
    return (
        t.includes("ATESTO PARA OS DEVIDOS FINS") &&
        t.includes("DIAS DE AFASTAMENTO")
    );
}

function substituirDiasNoTexto(texto, dias){

    if(!texto){
        return texto;
    }

    // Modelo apresentado pelo CELK:
    // necessita ____ (  ) dias de afastamento...
    //
    // Substitui apenas o espaço destinado à quantidade de dias.
    let novo = texto.replace(
        /_{2,}\s*\(\s*\)\s*(?=DIAS\s+DE\s+AFASTAMENTO)/i,
        String(dias)
    );

    // Fallback para pequenas variações do modelo.
    novo = novo.replace(
        /_{2,}\s*(?:\(\s*\))?\s*(?=dias\s+de\s+afastamento)/i,
        String(dias)
    );

    return novo;
}

function localizarAlvosEditorAtestado(){

    const encontrados = [];
    const adicionar = (tipo, elemento, iframe=null) => {

        if(!elemento){
            return;
        }

        const texto =
            elemento.value ??
            elemento.innerText ??
            elemento.textContent ??
            "";

        if(textoTemModeloAtestado(texto)){
            encontrados.push({
                tipo,
                elemento,
                iframe
            });
        }
    };

    // 1) Textareas e contenteditable da página principal.
    document.querySelectorAll(
        "textarea, [contenteditable='true'], " +
        ".mceContentBody, .mce-content-body"
    ).forEach(el => adicionar("direto", el));

    // 2) TinyMCE/editores dentro de iframes.
    document.querySelectorAll("iframe").forEach(iframe => {

        try{

            const doc =
                iframe.contentDocument ||
                iframe.contentWindow?.document;

            if(!doc){
                return;
            }

            if(doc.body){
                adicionar("iframe-body", doc.body, iframe);
            }

            doc.querySelectorAll(
                "textarea, [contenteditable='true'], " +
                ".mceContentBody, .mce-content-body"
            ).forEach(el => {
                adicionar("iframe-editor", el, iframe);
            });

        }catch(_){}

    });

    // 3) Caso o CELK use um DIV/P/TD editável sem classe conhecida.
    document.querySelectorAll(
        "[contenteditable], div, p, td"
    ).forEach(el => {

        if(
            encontrados.some(x => x.elemento === el) ||
            el.closest("#celk-atestado-overlay")
        ){
            return;
        }

        const texto = el.innerText || el.textContent || "";

        if(
            textoTemModeloAtestado(texto) &&
            texto.length < 12000
        ){
            adicionar("bloco", el);
        }

    });

    return encontrados;
}

function substituirDiasNoHtml(html, dias){

    if(!html){
        return {
            alterado:false,
            html
        };
    }

    // O modelo oficial mostrado no CELK:
    // necessita ____ (  ) dias de afastamento
    //
    // Permite espaços, entidades HTML e pequenas variações.
    let novo = html;

    const padroes = [

        /_{2,}\s*(?:\(\s*\))?\s*(?=dias\s+de\s+afastamento)/i,

        /_{2,}\s*(?:&nbsp;|\s)*\(\s*(?:&nbsp;|\s)*\)\s*(?=dias\s+de\s+afastamento)/i,

        /_{2,}\s*(?:\(\s*\))?\s*(?=DIAS\s+DE\s+AFASTAMENTO)/i

    ];

    for(const regex of padroes){

        const teste = novo.replace(
            regex,
            String(dias)
        );

        if(teste !== novo){
            return {
                alterado:true,
                html:teste
            };
        }
    }

    return {
        alterado:false,
        html:novo
    };
}

function substituirDiasEmTextoVisivel(texto, dias){

    if(!texto){
        return texto;
    }

    // Mantém o restante do documento exatamente como está.
    return texto.replace(
        /_{2,}\s*(?:\(\s*\))?\s*(?=dias\s+de\s+afastamento)/i,
        String(dias)
    );
}

function preencherDiasNoElementoEditor(el, dias){

    if(!el){
        return false;
    }

    const textoOriginal =
        el.value ??
        el.innerText ??
        el.textContent ??
        "";

    if(!textoTemModeloAtestado(textoOriginal)){
        return false;
    }

    // --------------------------------------------------
    // TEXTAREA / INPUT
    // --------------------------------------------------

    if(
        el.tagName === "TEXTAREA" ||
        el.tagName === "INPUT"
    ){

        const novoTexto =
            substituirDiasEmTextoVisivel(
                textoOriginal,
                dias
            );

        if(novoTexto === textoOriginal){
            return false;
        }

        const proto =
            el.tagName === "TEXTAREA"
                ? HTMLTextAreaElement.prototype
                : HTMLInputElement.prototype;

        const setter =
            Object.getOwnPropertyDescriptor(
                proto,
                "value"
            )?.set;

        if(setter){
            setter.call(el,novoTexto);
        }else{
            el.value = novoTexto;
        }

        el.dispatchEvent(
            new Event("input",{bubbles:true})
        );

        el.dispatchEvent(
            new Event("change",{bubbles:true})
        );

        return true;
    }

    // --------------------------------------------------
    // CONTENTEDITABLE / BODY DE IFRAME / DIV DO EDITOR
    // --------------------------------------------------

    const htmlOriginal = el.innerHTML || "";

    const resultado =
        substituirDiasNoHtml(
            htmlOriginal,
            dias
        );

    if(resultado.alterado){

        el.innerHTML = resultado.html;

        try{
            el.dispatchEvent(
                new InputEvent("input",{
                    bubbles:true,
                    inputType:"insertText",
                    data:String(dias)
                })
            );
        }catch(_){
            el.dispatchEvent(
                new Event("input",{bubbles:true})
            );
        }

        el.dispatchEvent(
            new Event("change",{bubbles:true})
        );

        return true;
    }

    // --------------------------------------------------
    // FALLBACK: texto puro dentro do elemento.
    // --------------------------------------------------

    const novoTexto =
        substituirDiasEmTextoVisivel(
            textoOriginal,
            dias
        );

    if(novoTexto !== textoOriginal){

        el.textContent = novoTexto;

        try{
            el.dispatchEvent(
                new InputEvent("input",{
                    bubbles:true,
                    inputType:"insertText",
                    data:String(dias)
                })
            );
        }catch(_){
            el.dispatchEvent(
                new Event("input",{bubbles:true})
            );
        }

        el.dispatchEvent(
            new Event("change",{bubbles:true})
        );

        return true;
    }

    return false;
}

async function preencherDiasNoDocumento(dias, timeout=20000){

    const inicio = Date.now();

    while(Date.now() - inicio < timeout){

        const alvos =
            localizarAlvosEditorAtestado();

        if(alvos.length){

            console.log(
                "[CELK Helper V30] ALVOS DO EDITOR DE ATESTADO:",
                alvos.map(x => x.tipo)
            );

            for(const alvo of alvos){

                try{

                    const ok =
                        preencherDiasNoElementoEditor(
                            alvo.elemento,
                            dias
                        );

                    if(ok){

                        console.log(
                            "[CELK Helper V30] DIAS PREENCHIDOS NO DOCUMENTO:",
                            dias,
                            alvo.tipo
                        );

                        // Se for TinyMCE, tenta sincronizar o conteúdo
                        // com a instância correspondente.
                        try{

                            if(
                                typeof tinymce !== "undefined" &&
                                tinymce?.editors?.length
                            ){

                                tinymce.editors.forEach(editor => {

                                    try{

                                        const body =
                                            editor.getBody?.();

                                        if(
                                            body &&
                                            (
                                                body === alvo.elemento ||
                                                body.contains?.(alvo.elemento) ||
                                                alvo.elemento.contains?.(body)
                                            )
                                        ){
                                            editor.setContent(
                                                body.innerHTML
                                            );
                                            editor.fire("change");
                                        }

                                    }catch(_){}

                                });

                            }

                        }catch(_){}

                        return true;
                    }

                }catch(err){

                    console.warn(
                        "[CELK Helper V30] Falha ao preencher alvo:",
                        alvo.tipo,
                        err
                    );

                }

            }
        }

        await new Promise(r => setTimeout(r,300));
    }

    return false;
}


function forcarAtestadoNaMesmaAba(){

    const restaurar = [];

    const registrarTarget = (el) => {

        if(!el || !("target" in el)){
            return;
        }

        const original = el.getAttribute("target");

        if(original !== null){
            restaurar.push(() => el.setAttribute("target", original));
        }else{
            restaurar.push(() => el.removeAttribute("target"));
        }

        el.setAttribute("target","_self");
    };

    // Links e formulários são os principais responsáveis por o CELK
    // abrir "Novo separador" durante a criação do documento.
    document.querySelectorAll(
        "a[target], form[target]"
    ).forEach(registrarTarget);

    // Também força os elementos existentes dentro de diálogos/modais.
    document.querySelectorAll(
        "[target='_blank'], [target='_new'], [target='_newtab']"
    ).forEach(el => {

        if(el.matches("a,form")){
            registrarTarget(el);
        }

    });

    // Captura submits feitos pelo formulário do CELK durante este fluxo.
    const onSubmit = function(e){

        const form = e.target;

        if(form && form.tagName === "FORM"){
            form.setAttribute("target","_self");
        }

    };

    document.addEventListener("submit", onSubmit, true);

    return function restaurarTargets(){

        document.removeEventListener("submit", onSubmit, true);

        restaurar.reverse().forEach(fn => {
            try{ fn(); }catch(_){}
        });

    };
}

function fecharJanelasAuxiliaresAtestado(janelas){

    if(!Array.isArray(janelas)){
        return;
    }

    janelas.forEach(janela => {

        try{

            if(
                janela &&
                !janela.closed
            ){

                janela.close();

                console.log(
                    "[CELK Helper V30] Aba/janela auxiliar do Atestado fechada."
                );
            }

        }catch(e){

            console.log(
                "[CELK Helper V30] Não foi possível fechar a janela auxiliar:",
                e
            );

        }

    });
}

async function prepararAtestado(dias, comCid){

    // Guarda somente janelas/abas abertas pelo próprio fluxo do Atestado.
    // A aba principal do CELK nunca é fechada.
    const janelasAtestado = [];

    // O CELK estava abrindo uma terceira aba ("Novo separador").
    // Durante o fluxo do Atestado, força links/formulários a permanecerem
    // na própria aba para que o documento seja criado na aba do atendimento.
    const restaurarTargetsAtestado =
        forcarAtestadoNaMesmaAba();

    const windowOpenOriginal = window.open;

    const capturarWindowOpen = function(...args){

        const janela = windowOpenOriginal.apply(this,args);

        if(janela){
            janelasAtestado.push(janela);

            console.log(
                "[CELK Helper V30] Janela auxiliar capturada."
            );
        }

        return janela;
    };

    try{

        console.log(
            "[CELK Helper V30] INICIANDO ATESTADO:",
            dias,
            comCid ? "COM CID" : "SEM CID"
        );

        // --------------------------------------------------
        // 1) O fluxo começa SEMPRE pelo botão real:
        //    "Novo Documento".
        // --------------------------------------------------

        const localizarNovoDocumento = () => {

            const candidatos = [
                ...document.querySelectorAll(
                    "button, a, input, div, span"
                )
            ];

            return candidatos.find(el => {

                if(el.closest("#celk-atestado-overlay")){
                    return false;
                }

                const texto = (
                    el.innerText ||
                    el.value ||
                    el.getAttribute("title") ||
                    el.getAttribute("aria-label") ||
                    ""
                )
                .replace(/\s+/g," ")
                .trim()
                .toUpperCase();

                if(texto !== "NOVO DOCUMENTO"){
                    return false;
                }

                const r = el.getBoundingClientRect();
                const s = getComputedStyle(el);

                return (
                    r.width > 20 &&
                    r.height > 15 &&
                    s.display !== "none" &&
                    s.visibility !== "hidden"
                );
            });
        };

        let novo = localizarNovoDocumento();

        if(!novo){

            // Se ainda não estiver na aba Documentos, tenta clicar
            // no item lateral "Documentos".
            const documentos = [
                ...document.querySelectorAll("a,button,div,span")
            ].find(el => {

                const txt = (
                    el.innerText ||
                    el.getAttribute("title") ||
                    ""
                )
                .replace(/\s+/g," ")
                .trim()
                .toUpperCase();

                if(txt !== "DOCUMENTOS"){
                    return false;
                }

                const r = el.getBoundingClientRect();

                return r.width > 20 && r.height > 15;
            });

            if(documentos){

                console.log(
                    "[CELK Helper V30] Abrindo aba DOCUMENTOS."
                );

                documentos.click();

                await new Promise(r => setTimeout(r,700));

                novo = localizarNovoDocumento();
            }
        }

        if(!novo){

            throw new Error(
                "Não encontrei o botão NOVO DOCUMENTO. " +
                "Verifique se a aba Documentos está aberta."
            );
        }

        console.log(
            "[CELK Helper V30] CLICANDO EM NOVO DOCUMENTO."
        );

        // Captura janelas/abas abertas pelo CELK durante este clique.
        window.open = capturarWindowOpen;

        try{
            novo.click();
        }finally{
            window.open = windowOpenOriginal;
        }

        // --------------------------------------------------
        // 2) Espera o modal "MODELO DE DOCUMENTO".
        // --------------------------------------------------

        const tipo = await esperarSelectModeloAtestado(12000);

        if(!tipo){

            throw new Error(
                "O CELK não abriu a janela MODELO DE DOCUMENTO."
            );
        }

        console.log(
            "[CELK Helper V30] MODAL MODELO DE DOCUMENTO ABERTO."
        );

        // --------------------------------------------------
        // 3) Seleciona exatamente o modelo correto.
        // --------------------------------------------------

        const opcoes = [...tipo.options];

        const opcao = opcoes.find(o => {

            const txt = (
                o.textContent || ""
            )
            .replace(/\s+/g," ")
            .trim()
            .toUpperCase();

            if(comCid){

                return (
                    txt.includes("ATESTADO MEDICO") &&
                    txt.includes("COM CID") &&
                    txt.includes("IDEAS")
                );

            }else{

                // O modelo SEM CID pode aparecer no CELK com pequenas
                // diferenças de espaços/acentuação. O importante é:
                // ATESTADO MÉDICO + IDEAS e NÃO conter "COM CID".
                return (
                    txt.includes("ATESTADO MEDICO") &&
                    txt.includes("IDEAS") &&
                    !txt.includes("COM CID")
                );
            }
        });

        if(!opcao){

            console.log(
                "[CELK Helper V31] OPÇÕES ENCONTRADAS:",
                opcoes.map(o => o.textContent)
            );

            throw new Error(
                "Não encontrei o modelo de Atestado Médico desejado."
            );
        }

        const setter = Object.getOwnPropertyDescriptor(
            HTMLSelectElement.prototype,
            "value"
        )?.set;

        if(setter){
            setter.call(tipo, opcao.value);
        }else{
            tipo.value = opcao.value;
        }

        tipo.dispatchEvent(
            new Event("input",{bubbles:true})
        );

        tipo.dispatchEvent(
            new Event("change",{bubbles:true})
        );

        console.log(
            "[CELK Helper V31] MODELO SELECIONADO:",
            opcao.textContent
        );

        // --------------------------------------------------
        // 4) O Wicket normalmente confirma a escolha por botão.
        //    Procuramos botões no modal.
        // --------------------------------------------------

        const modal = encontrarModalDoSelect(tipo);

        if(modal){

            const botoes = [
                ...modal.querySelectorAll(
                    "button, input[type='button'], " +
                    "input[type='submit'], a"
                )
            ];

            const confirmar = botoes.find(btn => {

                const txt = (
                    btn.innerText ||
                    btn.value ||
                    btn.getAttribute("title") ||
                    btn.getAttribute("alt") ||
                    ""
                )
                .replace(/\s+/g," ")
                .trim()
                .toUpperCase();

                return [
                    "OK",
                    "CONFIRMAR",
                    "CONTINUAR",
                    "SELECIONAR",
                    "CRIAR",
                    "ABRIR",
                    "PROSSEGUIR"
                ].includes(txt);
            });

            if(confirmar){

                console.log(
                    "[CELK Helper V30] CONFIRMANDO MODELO."
                );

                confirmar.click();
            }
        }

        // --------------------------------------------------
        // 5) O documento IDEAS usa o texto do modelo.
        //    Portanto, os dias precisam ser inseridos no EDITOR
        //    do documento, no trecho:
        //
        //    necessita ____ (  ) dias de afastamento
        // --------------------------------------------------

        const preenchido = await preencherDiasNoDocumento(
            dias,
            15000
        );

        if(!preenchido){

            throw new Error(
                "O Atestado abriu, mas não consegui localizar " +
                "o texto do documento para inserir a quantidade de dias."
            );
        }


        // CID só é tratado depois que o documento oficial existe.
        const checkboxCid = localizarCheckboxCidAtestado();

        if(checkboxCid){

            if(checkboxCid.checked !== !!comCid){
                checkboxCid.click();
            }
        }

        console.log(
            "[CELK Helper V30] ATESTADO ABERTO E DIAS PREENCHIDOS:",
            dias,
            comCid ? "COM CID" : "SEM CID"
        );

        // Se o CELK tiver aberto uma aba/janela auxiliar durante
        // a criação do documento, fecha somente essa aba.
        // A aba principal do atendimento permanece aberta.
        setTimeout(() => {
            fecharJanelasAuxiliaresAtestado(janelasAtestado);
            restaurarTargetsAtestado();
        }, 1200);

    }catch(e){

        // Garante que o window.open original seja restaurado mesmo
        // se houver erro no fluxo.
        try{
            window.open = windowOpenOriginal;
        }catch(_){}

        fecharJanelasAuxiliaresAtestado(janelasAtestado);

        try{
            restaurarTargetsAtestado();
        }catch(_){}

        console.error(
            "[CELK Helper V30] ERRO NO ATESTADO:",
            e
        );

        alert(
            "Erro ao abrir o Atestado Médico:\n\n" +
            (e?.message || e)
        );
    }
}

//--------------------------------------------------
// LOCALIZADORES DO ATESTADO
//--------------------------------------------------

function localizarCampoDiasAtestado(){

    // IMPORTANTÍSSIMO:
    // Só considerar o campo pertencente ao FORMULÁRIO OFICIAL
    // do Atestado Médico.
    //
    // Nunca usar campos genéricos da página de atendimento que contenham
    // "DIAS", pois isso faz o Helper achar que o atestado já está aberto.

    const seletoresOficiais = [
        "#AtestadoMedico_NumeroDias",
        'input[name*="AtestadoMedico_NumeroDias"]',
        'input[id*="AtestadoMedico"][id*="NumeroDias"]',
        'input[name*="NumeroDias"]'
    ];

    for(const seletor of seletoresOficiais){

        const campos = [
            ...document.querySelectorAll(seletor)
        ];

        const campo = campos.find(el => {

            if(!el){
                return false;
            }

            // Jamais aceitar nosso campo de quantidade do modal.
            if(el.id === "celk-atestado-dias"){
                return false;
            }

            if(el.closest("#celk-atestado-overlay")){
                return false;
            }

            const style = window.getComputedStyle(el);
            const rect = el.getBoundingClientRect();

            return (
                style.display !== "none" &&
                style.visibility !== "hidden" &&
                rect.width > 0 &&
                rect.height > 0
            );
        });

        if(campo){
            console.log(
                "[CELK Helper V30] Campo OFICIAL de dias localizado:",
                campo.id || campo.name
            );
            return campo;
        }
    }

    // Não existe fallback genérico de "DIAS".
    // Se o formulário oficial não estiver aberto, retornar null
    // força o fluxo a abrir "Novo Documento".
    return null;
}

function localizarCheckboxCidAtestado(){

    return (
        document.querySelector(
            "#AtestadoMedico_ImpressaoCodCid"
        ) ||
        [...document.querySelectorAll(
            'input[type="checkbox"]'
        )].find(el => {

            const attrs = [
                el.id,
                el.name,
                el.getAttribute("data-bind"),
                el.getAttribute("aria-label")
            ]
            .filter(Boolean)
            .join(" ")
            .toUpperCase();

            return (
                attrs.includes("IMPRESSAOCODCID") ||
                attrs.includes("CODCID") ||
                attrs.includes("CID")
            );
        }) ||
        null
    );
}


function localizarCampoPorLabel(regex){

    const labels = [...document.querySelectorAll("label")];

    for(const label of labels){

        if(!regex.test(label.textContent || "")){
            continue;
        }

        const forId = label.htmlFor;

        if(forId){

            const el = document.getElementById(forId);

            if(el){
                return el;
            }
        }

        const parent = label.parentElement;

        const campo = parent?.querySelector(
            "input,textarea,select"
        );

        if(campo){
            return campo;
        }
    }

    return null;
}


function encontrarModalDoSelect(select){

    let el = select;

    for(let i=0;i<8 && el;i++){

        const cls = (
            el.className || ""
        ).toString().toLowerCase();

        const role = (
            el.getAttribute("role") || ""
        ).toLowerCase();

        if(
            role === "dialog" ||
            cls.includes("modal") ||
            cls.includes("dialog") ||
            cls.includes("window")
        ){
            return el;
        }

        el = el.parentElement;
    }

    return select.parentElement?.parentElement || null;
}


function esperarSelectModeloAtestado(timeout=8000){

    return new Promise(resolve => {

        const inicio = Date.now();

        const procurar = () => {

            const selects = [
                ...document.querySelectorAll("select")
            ];

            const encontrado = selects.find(el => {

                const textoOpcoes = [...el.options]
                    .map(o => (o.textContent || "").trim().toUpperCase())
                    .join(" | ");

                return (
                    textoOpcoes.includes("ATESTADO MEDICO") ||
                    textoOpcoes.includes("ATESTADO MÉDICO")
                );
            });

            if(encontrado){
                resolve(encontrado);
                return;
            }

            if(Date.now() - inicio >= timeout){
                resolve(null);
                return;
            }

            setTimeout(procurar,150);
        };

        procurar();
    });
}


function esperarCampoDiasAtestado(timeout=8000){

    return new Promise(resolve => {

        const inicio = Date.now();

        const procurar = () => {

            const campo = localizarCampoDiasAtestado();

            if(campo){
                resolve(campo);
                return;
            }

            if(Date.now() - inicio >= timeout){
                resolve(null);
                return;
            }

            setTimeout(procurar,150);
        };

        procurar();
    });
}


function aguardarMudancaDaTela(timeout=12000){

    return new Promise(resolve => {

        const inicio = Date.now();

        const verificar = () => {

            // Para este fluxo, só interessa a abertura do formulário/modal
            // relacionado ao documento. Mudança de tamanho da página não conta.
            const selectModelo = [...document.querySelectorAll("select")]
                .find(el => {

                    const textoOpcoes = [...el.options]
                        .map(o => (o.textContent || "").trim().toUpperCase())
                        .join(" | ");

                    return (
                        textoOpcoes.includes("ATESTADO MEDICO") ||
                        textoOpcoes.includes("ATESTADO MÉDICO")
                    );
                });

            if(
                document.querySelector("#AtestadoMedico_NumeroDias") ||
                selectModelo
            ){
                resolve(true);
                return;
            }

            if(Date.now() - inicio >= timeout){
                resolve(false);
                return;
            }

            setTimeout(verificar,200);
        };

        verificar();
    });
}


//--------------------------------------------------
// ESPERAR ELEMENTO
//--------------------------------------------------

function celkEsperarElemento(selector, timeout=8000, filtro=null){

    return new Promise(resolve => {

        const inicio = Date.now();

        const procurar = () => {

            const elementos = [...document.querySelectorAll(selector)];

            const encontrado = elementos.find(el => {

                if(typeof filtro === "function"){
                    try{
                        return filtro(el);
                    }catch(e){
                        return false;
                    }
                }

                return true;
            });

            if(encontrado){
                resolve(encontrado);
                return;
            }

            if(Date.now() - inicio >= timeout){
                resolve(null);
                return;
            }

            setTimeout(procurar, 150);
        };

        procurar();
    });
}


function selecionarAltaMedica(){

    // Campo "Encaminhamento" identificado no CELK:
    // name="panelContainer:nodePanel:form:eloNaturezaTipoEncaminhamento"
    const selects = [
        ...document.querySelectorAll(
            'select[name*="eloNaturezaTipoEncaminhamento"]'
        )
    ];

    const select = selects.find(el => {
        const style = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();

        return style.display !== "none" &&
               style.visibility !== "hidden" &&
               rect.width > 0 &&
               rect.height > 0;
    }) || selects[0];

    if(!select){
        console.log(
            "CELK Helper: campo Encaminhamento não encontrado."
        );
        return false;
    }

    const opcao = [...select.options].find(option => {

        const texto = (option.textContent || "")
            .replace(/\s+/g, " ")
            .trim()
            .toUpperCase();

        return texto === "ALTA MÉDICA" ||
               texto === "ALTA MEDICA" ||
               texto.includes("ALTA MÉDICA") ||
               texto.includes("ALTA MEDICA");

    });

    if(!opcao){
        console.log(
            "CELK Helper: opção ALTA MÉDICA não encontrada."
        );
        return false;
    }

    // Define a opção selecionada.
    select.value = opcao.value;

    // Dispara os eventos que o CELK/Wicket pode estar escutando.
    select.dispatchEvent(new Event("input", {
        bubbles:true
    }));

    select.dispatchEvent(new Event("change", {
        bubbles:true
    }));

    // Também dispara um evento de blur para componentes que
    // atualizam o formulário ao perder o foco.
    try{
        select.dispatchEvent(new Event("blur", {
            bubbles:true
        }));
    }catch(e){}

    console.log(
        "CELK Helper: Encaminhamento definido como ALTA MÉDICA."
    );

    return true;
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

        // O CELK pode redesenhar a barra. Garante que o Atestado
        // continue imediatamente após o botão CID.
        window.celkGarantirBotaoAtestado?.();

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


