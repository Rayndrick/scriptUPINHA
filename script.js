// =========================================================
// CELK HELPER — V32
// ATESTADO: fluxo direto pelo botão "Novo Documento"
// =========================================================
console.log("[CELK Helper V32] CARREGADO — ATESTADO COM PREENCHIMENTO DOS DIAS NO EDITOR");

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
    // Sempre inicia com atualização automática DESLIGADA (0 s)
// quando o script é carregado.
localStorage.setItem("celk_refresh", "0");

const CONFIG = {
    refreshSeconds: 0
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

    // Captura a pulseira ANTES de o CELK retirar a linha da tabela.
    instalarCapturaAntecipadaClassificacao();

    // Alimenta o cache quando estivermos na Consulta de Atendimentos.
    try{ sincronizarClassificacoesDaTabela(); }catch(_){ }

    // Captura o clique de finalização ANTES do CELK navegar/remover a tela.
    instalarCapturaFinalizacaoRelatorio();

    if(window.celk.intervalo) return;

    window.celk.intervalo = setInterval(function(){

        if(!document.getElementById("celk-helper")){

            console.log("Barra recriada.");

            criarInterface();

        }

        try{ sincronizarClassificacoesDaTabela(); }catch(_){ }

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

console.log("📜 [CELK Helper V32] Botão ATESTADO criado.");

//--------------------------------------------------
// BOTÃO DECLARAÇÃO
//--------------------------------------------------

const declaracao = document.createElement("div");

declaracao.id = "celk-helper-declaracao";
declaracao.innerHTML = "📄 Declaração";

declaracao.style.cssText = `
display:flex;
align-items:center;
justify-content:center;

height:100%;

min-width:165px;
flex:0 0 165px;
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

declaracao.onmouseover=function(){
    declaracao.style.background="#ececec";
};

declaracao.onmouseout=function(){
    declaracao.style.background="transparent";
};

declaracao.onclick=function(e){
    e.stopPropagation();
    abrirMenuDeclaracao();
};

console.log("📄 [CELK Helper V32] Botão DECLARAÇÃO criado.");

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
//--------------------------------------------------
// BOTÃO EVASÃO
//--------------------------------------------------

function normalizarCelk(valor){
    return String(valor || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g,"")
        .replace(/[^A-Z0-9\s]/gi," ")
        .replace(/\s+/g," ")
        .trim()
        .toUpperCase();
}

function preencherEvolucaoEvasaoFinal(){

    try{

        const texto =
            "—----------------------------------- EVASÃO —---------------------------\n" +
            "PACIENTE CHAMADO NO PAINEL 3X E PESSOALMENTE, MAS NÃO COMPARECEU. EVASÃO\n" +
            "CID: Z532\n" +
            "—---------------------------------------------------------------------------";

        // TinyMCE do editor de evolução.
        let editor = null;

        if(window.tinymce){

            if(window.tinymce.activeEditor &&
               window.tinymce.activeEditor.getBody){
                editor = window.tinymce.activeEditor;
            }

            if(!editor && Array.isArray(window.tinymce.editors)){
                editor = window.tinymce.editors.find(function(ed){
                    return ed &&
                           ed.getBody &&
                           ed.getBody();
                }) || null;
            }
        }

        if(!editor){

            const iframe = [...document.querySelectorAll("iframe")]
                .find(function(fr){
                    try{
                        const body = fr.contentDocument &&
                                     fr.contentDocument.body;

                        return body &&
                               body.classList &&
                               body.classList.contains("mceContentBody");
                    }catch(_){
                        return false;
                    }
                });

            if(iframe && window.tinymce){
                editor = [...window.tinymce.editors].find(function(ed){
                    return ed.iframeElement === iframe;
                }) || null;
            }
        }

        if(!editor){

            alert(
                "Abra a tela de Evolução antes de usar EVASÃO."
            );

            console.error(
                "[CELK Helper V32] EVASÃO: editor da evolução não encontrado."
            );

            return false;
        }

        editor.setContent(
            texto
                .split("\n")
                .map(function(linha){
                    return "<p>" + linha + "</p>";
                })
                .join("")
        );

        try{
            editor.fire("change");
        }catch(_){}

        try{
            editor.save();
        }catch(_){}

        // Garante sincronização também pelo iframe.
        try{
            const body = editor.getBody();

            if(body){
                body.innerHTML =
                    texto
                        .split("\n")
                        .map(function(linha){
                            return "<p>" + linha + "</p>";
                        })
                        .join("");
            }
        }catch(_){}

        console.log(
            "[CELK Helper V32] EVASÃO: texto inserido na evolução."
        );

        return true;

    }catch(err){

        console.error(
            "[CELK Helper V32] EVASÃO: erro ao preencher evolução.",
            err
        );

        alert(
            "Não foi possível preencher a evolução de EVASÃO."
        );

        return false;
    }
}

async function selecionarEvasaoFinal(timeout){

    timeout = timeout || 10000;

    const inicio = Date.now();

    function localizarSelect(){

        const candidatos = [
            document.querySelector(
                'select[name="panelContainer:nodePanel:form:eloNaturezaTipoEncaminhamento"]'
            ),
            ...document.querySelectorAll(
                'select[name*="eloNaturezaTipoEncaminhamento"]'
            )
        ].filter(Boolean);

        // Primeiro tenta o select conhecido pelo name.
        const conhecido = candidatos.find(function(select){
            return [...select.options].some(function(option){
                return normalizarCelk(option.textContent).includes("EVASAO");
            });
        });

        if(conhecido){
            return conhecido;
        }

        // Fallback: procura qualquer select que contenha EVASÃO.
        return [...document.querySelectorAll("select")].find(function(select){
            return [...select.options].some(function(option){
                return normalizarCelk(option.textContent).includes("EVASAO");
            });
        }) || null;
    }

    while(Date.now() - inicio < timeout){

        const select = localizarSelect();

        if(select){

            const opcao = [...select.options].find(function(option){
                return normalizarCelk(option.textContent).includes("EVASAO");
            });

            if(opcao){

                const setter =
                    Object.getOwnPropertyDescriptor(
                        HTMLSelectElement.prototype,
                        "value"
                    )?.set;

                if(setter){
                    setter.call(select,opcao.value);
                }else{
                    select.value = opcao.value;
                }

                select.selectedIndex = opcao.index;

                [...select.options].forEach(function(option){
                    option.selected = option === opcao;
                });

                select.dispatchEvent(
                    new Event("input",{bubbles:true})
                );

                select.dispatchEvent(
                    new Event("change",{bubbles:true})
                );

                try{
                    if(typeof select.onchange === "function"){
                        select.onchange.call(
                            select,
                            new Event("change",{bubbles:true})
                        );
                    }
                }catch(_){}

                select.dispatchEvent(
                    new Event("blur",{bubbles:true})
                );

                console.log(
                    "[CELK Helper V32] EVASÃO SELECIONADA:",
                    select.value,
                    opcao.textContent.trim()
                );

                return true;
            }
        }

        await new Promise(function(resolve){
            setTimeout(resolve,250);
        });
    }

    console.error(
        "[CELK Helper V32] EVASÃO: select/opção não encontrada."
    );

    return false;
}

function localizarBotaoSalvarAtendimentoFinal(){

    // Seletor confirmado no HTML do CELK.
    const direto =
        document.querySelector("a.btn-finalizar-prontuario");

    if(direto){
        return direto;
    }

    // Fallback sem usar querySelector com ":" no ID.
    const candidatos = [
        ...document.querySelectorAll("a"),
        ...document.querySelectorAll("button"),
        ...document.querySelectorAll(
            'input[type="button"],input[type="submit"]'
        )
    ];

    return candidatos.find(function(el){

        const texto = normalizarCelk(
            el.innerText ||
            el.value ||
            el.getAttribute("title") ||
            ""
        );

        const id = normalizarCelk(el.id || "");
        const classe = normalizarCelk(el.className || "");

        return (
            classe.includes("BTN FINALIZAR PRONTUARIO") ||
            id.includes("BTNFINALIZARPRONTUARIO") ||
            texto.includes("SALVAR ATENDIMENTO") ||
            texto.includes("SALVAR O ATENDIMENTO") ||
            texto.includes("FINALIZAR PRONTUARIO")
        );

    }) || null;
}

async function executarEvasaoFinal(){

    if(window.celkEvasaoExecutando){
        console.log(
            "[CELK Helper V32] EVASÃO já está em execução."
        );
        return;
    }

    const confirmar = window.confirm(
        "REGISTRAR EVASÃO?\n\n" +
        "O sistema irá:\n" +
        "✓ Inserir a evolução de EVASÃO\n" +
        "✓ Selecionar EVASÃO no encaminhamento\n" +
        "✓ Salvar e finalizar o atendimento\n\n" +
        "Deseja continuar?"
    );

    if(!confirmar){
        return;
    }

    window.celkEvasaoExecutando = true;

    try{

        console.log(
            "[CELK Helper V32] EVASÃO: iniciando fluxo..."
        );

        // 1 — Evolução.
        if(!preencherEvolucaoEvasaoFinal()){
            return;
        }

        await new Promise(function(resolve){
            setTimeout(resolve,700);
        });

        // 2 — Encaminhamento.
        if(!await selecionarEvasaoFinal(10000)){
            alert(
                "A evolução foi preenchida, mas não consegui selecionar EVASÃO.\n\n" +
                "O atendimento NÃO foi finalizado."
            );
            return;
        }

        // 3 — O Wicket pode reconstruir o select.
        await new Promise(function(resolve){
            setTimeout(resolve,1000);
        });

        // 4 — Reaplica EVASÃO depois da reconstrução.
        if(!await selecionarEvasaoFinal(5000)){
            alert(
                "Não consegui confirmar EVASÃO após a atualização do CELK.\n\n" +
                "O atendimento NÃO foi finalizado."
            );
            return;
        }

        await new Promise(function(resolve){
            setTimeout(resolve,1000);
        });

        // 5 — Confere se EVASÃO permaneceu selecionada.
        const selectFinal =
            document.querySelector(
                'select[name*="eloNaturezaTipoEncaminhamento"]'
            );

        const evasaoMantida =
            selectFinal &&
            [...selectFinal.options].some(function(option){
                return option.selected &&
                    normalizarCelk(option.textContent).includes("EVASAO");
            });

        if(!evasaoMantida){

            console.warn(
                "[CELK Helper V32] EVASÃO não permaneceu selecionada."
            );

            if(!await selecionarEvasaoFinal(5000)){
                alert(
                    "EVASÃO não permaneceu selecionada.\n\n" +
                    "O atendimento NÃO foi finalizado."
                );
                return;
            }

            await new Promise(function(resolve){
                setTimeout(resolve,700);
            });
        }

        // 6 — Localiza o botão REAL de salvar/finalizar.
        const finalizar =
            localizarBotaoSalvarAtendimentoFinal();

        if(!finalizar){

            console.error(
                "[CELK Helper V32] Botão Salvar Atendimento não encontrado."
            );

            alert(
                "EVASÃO foi preenchida e selecionada, mas o botão " +
                "Salvar Atendimento não foi encontrado.\n\n" +
                "O atendimento NÃO foi finalizado."
            );

            return;
        }

        console.log(
            "[CELK Helper V32] EVASÃO: todas as etapas prontas."
        );

        console.log(
            "[CELK Helper V32] EVASÃO: clicando em Salvar Atendimento..."
        );

        // 7 — FINALIZA.
        finalizar.click();

    }catch(err){

        console.error(
            "[CELK Helper V32] EVASÃO: erro no fluxo.",
            err
        );

        alert(
            "Ocorreu um erro durante a EVASÃO.\n\n" +
            "O atendimento NÃO foi finalizado automaticamente."
        );

    }finally{

        setTimeout(function(){
            window.celkEvasaoExecutando = false;
        },3000);
    }
}

// Cria o botão à direita de Atualizar.
const evasao = document.createElement("div");

evasao.id = "celk-helper-evasao";
evasao.innerHTML = "🚪 Evasão";

evasao.style.cssText = `
display:flex;
align-items:center;
justify-content:center;
height:100%;
min-width:145px;
flex:0 0 145px;
box-sizing:border-box;
padding:0 22px;
font-size:18px;
font-weight:bold;
color:#222;
background:#f8f8f8;
cursor:pointer;
user-select:none;
border-left:1px solid #d8d8d8;
`;

evasao.onmouseover=function(){
    evasao.style.background="#ececec";
};

evasao.onmouseout=function(){
    evasao.style.background="#f8f8f8";
};

evasao.onclick=function(e){

    e.preventDefault();
    e.stopPropagation();

    executarEvasaoFinal();
};


// Ordem fixa da barra: Relatório → CID → Atestado → Declaração → NEWS → Atualizar
painel.appendChild(relatorio);
painel.appendChild(cid);
painel.appendChild(atestado);
painel.appendChild(declaracao);
painel.appendChild(news);
painel.appendChild(atualizar);
painel.appendChild(evasao);

// Garante que o Atestado fique visível mesmo quando a largura da janela
// for menor que a soma dos botões.
[relatorio, cid, atestado, declaracao, news, atualizar, evasao].forEach(function(el){
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
                "[CELK Helper V32] função abrirMenuAtestado não encontrada."
            );
        }
    };

    // Insere imediatamente depois do CID.
    cidAtual.insertAdjacentElement(
        "afterend",
        novo
    );

    console.log(
        "📜 [CELK Helper V32] ATESTADO inserido após CID."
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
                "[CELK Helper V32] erro ao localizar triagem no histórico:",
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

    // O relatório agora é registrado SOMENTE quando o atendimento for
    // efetivamente finalizado. Aqui salvamos os dados do paciente para
    // garantir que nome + classificação já estejam prontos antes da saída.
    registrarPacienteEmAtendimento(nome, idade, chegada);

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
// CLASSIFICAÇÃO DE RISCO — CAPTURA ROBUSTA DO CELK
// --------------------------------------------------

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

    if(/^(PACIENTE|PRIORIDADE|PROCEDIMENTO|CLASSIFICACAO|CLASSIFICAÇÃO|CR|LEITO|TEMPO|CHEGADA|ATENDIDO|SITUACAO|SITUAÇÃO|TIPO DE ATENDIMENTO|PESQUISAR|PROCURAR)$/.test(t)) return false;
    if(/UP1|ATENDIMENTO|PEDIATR|MEDICA[CÇ][AÃ]O|COLETA|EMERGENCIA|EMERGÊNCIA|IDOSOS|URG[ÊE]NCIA/.test(t)) return false;

    const palavras=t.split(/\s+/).filter(Boolean);
    return palavras.length >= 2;
}

function nomeDaLinha(tr){
    if(!tr) return "";

    const celulas=Array.from(tr.querySelectorAll("td,th"));

    // Prioridade: célula de nome do CELK normalmente é text-left.
    const ordenadas=celulas.slice().sort((a,b)=>{
        const sa=(/text-left/i.test(String(a.className||""))?100:0)
                +(/cells_[23]_cell/i.test(String(a.getAttribute("wicketpath")||""))?30:0);
        const sb=(/text-left/i.test(String(b.className||""))?100:0)
                +(/cells_[23]_cell/i.test(String(b.getAttribute("wicketpath")||""))?30:0);
        return sb-sa;
    });

    for(const td of ordenadas){
        const texto=String(td.textContent||"").trim();
        if(pareceNomePaciente(texto)) return texto;
    }

    // Fallback: procura um bloco com várias palavras, excluindo textos do sistema.
    for(const td of celulas){
        const partes=String(td.innerText||td.textContent||"")
            .split(/\n+/).map(x=>x.trim()).filter(Boolean);
        for(const parte of partes){
            if(pareceNomePaciente(parte)) return parte;
        }
    }

    return "";
}

function encontrarLinhaDaBola(bola){
    if(!bola) return null;

    const tr=bola.closest("tr");
    if(tr) return tr;

    let el=bola;
    for(let i=0;i<8 && el;i++,el=el.parentElement){
        if(el.querySelectorAll && el.querySelectorAll("td").length>=3){
            return el;
        }
    }

    return null;
}

function salvarClassificacaoCache(nome,classificacao){
    nome=normalizarClassificacaoTexto(nome);
    if(!nome || classificacao==="NÃO IDENTIFICADA") return;

    let cache={};
    try{ cache=JSON.parse(localStorage.getItem("celk_classificacoes_cache")||"{}"); }
    catch(_){ cache={}; }

    cache[nome]=classificacao;
    localStorage.setItem("celk_classificacoes_cache",JSON.stringify(cache));

    try{
        if(typeof atualizarClassificacaoNoRelatorio === "function"){
            atualizarClassificacaoNoRelatorio(nome,classificacao);
        }
    }catch(_){}

    console.log("[CELK Helper V32] CLASSIFICAÇÃO CAPTURADA:",nome,"=>",classificacao);
}

function nomeClassificacaoPorEstruturaCELK(tr){
    if(!tr) return null;

    // ESTRUTURA CONFIRMADA NOS TESTES DO CELK (12/08/2026):
    // índice 3 = célula da classificação (icon32 ball-cor)
    // índice 4 = célula do paciente/nome
    // Não usar cells_4/cells_5 como regra principal, pois essa numeração
    // varia conforme a tela/estrutura Wicket.
    const celulas = Array.from(tr.querySelectorAll("td,th"));

    const seletoresBola =
        '[class~="ball-red"],[class~="ball-orange"],[class~="ball-yellow"],' +
        '[class~="ball-green"],[class~="ball-blue"]';

    // 1) Estrutura exata confirmada pelo teste do usuário.
    const bolaCelula = celulas[3] || null;
    const nomeCelula = celulas[4] || null;
    const bolaExata = bolaCelula && bolaCelula.querySelector(seletoresBola);

    if(bolaExata && nomeCelula){
        const nome = String(
            nomeCelula.innerText || nomeCelula.textContent || ""
        ).replace(/\s+/g," ").trim();

        const classificacao = classeParaClassificacao(bolaExata);

        if(
            nome &&
            pareceNomePaciente(nome) &&
            classificacao !== "NÃO IDENTIFICADA"
        ){
            return {nome, classificacao};
        }
    }

    // 2) Fallback por wicketpath, caso o CELK mude a estrutura.
    const bolaCelulaWicket = tr.querySelector(
        'td[wicketpath*="_cells_3_cell"]'
    );
    const nomeCelulaWicket = tr.querySelector(
        'td[wicketpath*="_cells_4_cell"]'
    );

    const bolaWicket = bolaCelulaWicket &&
        bolaCelulaWicket.querySelector(seletoresBola);

    if(bolaWicket && nomeCelulaWicket){
        const nome = String(
            nomeCelulaWicket.innerText ||
            nomeCelulaWicket.textContent || ""
        ).replace(/\s+/g," ").trim();

        const classificacao = classeParaClassificacao(bolaWicket);

        if(
            nome &&
            pareceNomePaciente(nome) &&
            classificacao !== "NÃO IDENTIFICADA"
        ){
            return {nome, classificacao};
        }
    }

    // 3) Fallback genérico: encontra a bolinha e procura a célula de nome.
    const bola = tr.querySelector(seletoresBola);

    if(!bola) return null;

    const classificacao = classeParaClassificacao(bola);
    if(classificacao === "NÃO IDENTIFICADA") return null;

    const indiceBola = celulas.indexOf(bola.closest("td,th"));

    // Normalmente o nome vem imediatamente depois da classificação.
    for(let i = Math.max(0, indiceBola + 1); i < celulas.length; i++){
        const nome = String(
            celulas[i].innerText || celulas[i].textContent || ""
        ).replace(/\s+/g," ").trim();

        if(pareceNomePaciente(nome)){
            return {nome, classificacao};
        }
    }

    // Último fallback: usa o extrator genérico já existente.
    const nome = nomeDaLinha(tr);
    if(nome){
        return {nome, classificacao};
    }

    return null;
}

function obterLinhaDoEventoCELK(evento){
    if(!evento) return null;
    try{
        const alvo=evento.target;
        if(alvo && alvo.closest){
            const tr=alvo.closest("tr");
            if(tr) return tr;
            const td=alvo.closest("td,th");
            if(td && td.closest("tr")) return td.closest("tr");
        }
        if(typeof evento.composedPath === "function"){
            for(const item of evento.composedPath()){
                if(item && item.tagName === "TR") return item;
                if(item && item.closest){ const tr=item.closest("tr"); if(tr) return tr; }
            }
        }
    }catch(_){}
    return null;
}

function capturarClassificacaoDaLinha(tr){
    if(!tr) return false;

    const exata = nomeClassificacaoPorEstruturaCELK(tr);
    if(exata){
        salvarClassificacaoCache(exata.nome, exata.classificacao);
        return true;
    }

    const bola=tr.querySelector(
        '.icon32.ball-red, .icon32.ball-orange, .icon32.ball-yellow, .icon32.ball-green, .icon32.ball-blue, ' +
        '[class~="ball-red"], [class~="ball-orange"], [class~="ball-yellow"], [class~="ball-green"], [class~="ball-blue"]'
    );

    if(!bola) return false;

    const classificacao=classeParaClassificacao(bola);
    if(classificacao==="NÃO IDENTIFICADA") return false;

    const nome=nomeDaLinha(tr);
    if(!nome) return false;

    salvarClassificacaoCache(nome,classificacao);
    return true;
}

function extrairMapaClassificacoesDaTabela(){
    const mapa={};

    const linhas=Array.from(document.querySelectorAll("table tbody tr, table tr"));

    for(const tr of linhas){
        const bola=tr.querySelector(
            '[class~="ball-red"],[class~="ball-orange"],[class~="ball-yellow"],[class~="ball-green"],[class~="ball-blue"]'
        );
        if(!bola) continue;

        const classificacao=classeParaClassificacao(bola);
        const nome=nomeDaLinha(tr);
        if(!nome || classificacao==="NÃO IDENTIFICADA") continue;

        const chave=normalizarClassificacaoTexto(nome);
        mapa[chave]=classificacao;
        salvarClassificacaoCache(nome,classificacao);
    }

    // Fallback para estruturas Wicket em que o tr não é encontrado diretamente.
    if(!Object.keys(mapa).length){
        const bolas=Array.from(document.querySelectorAll(
            '.icon32.ball-red,.icon32.ball-orange,.icon32.ball-yellow,.icon32.ball-green,.icon32.ball-blue,'+
            '[class~="ball-red"],[class~="ball-orange"],[class~="ball-yellow"],[class~="ball-green"],[class~="ball-blue"]'
        ));

        for(const bola of bolas){
            const tr=encontrarLinhaDaBola(bola);
            if(!tr) continue;
            const nome=nomeDaLinha(tr);
            const classificacao=classeParaClassificacao(bola);
            if(nome && classificacao!=="NÃO IDENTIFICADA"){
                mapa[normalizarClassificacaoTexto(nome)]=classificacao;
                salvarClassificacaoCache(nome,classificacao);
            }
        }
    }

    return mapa;
}

function sincronizarClassificacoesDaTabela(){
    return extrairMapaClassificacoesDaTabela();
}

// CAPTURA DIRETA DA LINHA CELK
// O CELK usa, na linha da tabela:
// cells_4 = classificação (ball-cor)
// cells_5 = nome
// cells_6 = idade
// cells_8 = chegada
// Capturamos tudo no mousedown, antes da navegação remover a linha.
function capturarDadosDiretosDaLinhaCELK(tr){
    if(!tr) return false;

    try{
        const celNome = tr.querySelector('[wicketpath*="_cells_5"]');
        const celIdade = tr.querySelector('[wicketpath*="_cells_6"]');
        const celClass = tr.querySelector('[wicketpath*="_cells_4"]');
        const celChegada = tr.querySelector('[wicketpath*="_cells_8"]');

        const nome = String(celNome?.innerText || celNome?.textContent || '').replace(/\\s+/g,' ').trim();
        const idade = String(celIdade?.innerText || celIdade?.textContent || '').replace(/\\s+/g,' ').trim();
        const chegadaTexto = String(celChegada?.innerText || celChegada?.textContent || '').replace(/\\s+/g,' ').trim();

        if(!nome) return false;

        const bola = celClass?.querySelector(
            '.icon32.ball-red,.icon32.ball-orange,.icon32.ball-yellow,.icon32.ball-green,.icon32.ball-blue,'+
            '[class~="ball-red"],[class~="ball-orange"],[class~="ball-yellow"],[class~="ball-green"],[class~="ball-blue"]'
        ) || celClass?.querySelector('[class*="ball-"]');

        const classificacao = classeParaClassificacao(bola);

        let chegada = chegadaTexto;
        // Extrai apenas o horário da chegada sem usar RegExp, evitando erro de sintaxe no CELK.
        const partesChegada = String(chegada).split(' - ');
        if(partesChegada.length > 1){
            const horario = partesChegada[partesChegada.length - 1].trim();
            if(/^\d{2}:\d{2}$/.test(horario)) chegada = horario;
        }

        if(classificacao !== 'NÃO IDENTIFICADA'){
            salvarClassificacaoCache(nome, classificacao);
        }

        salvarPacientePendente(
            nome,
            idade,
            chegada,
            classificacao
        );

        console.log(
            '[CELK Helper] CAPTURA DIRETA:',
            nome,
            '| IDADE:', idade,
            '| CLASSIFICAÇÃO:', classificacao,
            '| CHEGADA:', chegada
        );

        return true;
    }catch(err){
        console.warn('[CELK Helper] FALHA NA CAPTURA DIRETA:', err);
        return false;
    }
}

// Captura ANTES da navegação. Este é o ponto principal da correção:
// quando o usuário clica no paciente, o CELK pode remover a linha da tabela
// imediatamente. A classificação precisa estar salva antes disso.
function instalarCapturaAntecipadaClassificacao(){
    if(window.celk.classificacaoClickHook) return;
    window.celk.classificacaoClickHook=true;

    const capturar=function(evento){
        try{
            const alvo=obterLinhaDoEventoCELK(evento);
            if(alvo){
                // Primeiro captura nome + idade + classificação + chegada
                // diretamente das cells da linha, antes da navegação do CELK.
                capturarDadosDiretosDaLinhaCELK(alvo);
                capturarClassificacaoDaLinha(alvo);
                const exata=nomeClassificacaoPorEstruturaCELK(alvo);
                if(exata){
                    salvarClassificacaoCache(exata.nome,exata.classificacao);
                    salvarPacientePendente(exata.nome,"","",exata.classificacao);
                }else{
                    const bola=alvo.querySelector(
                        '.icon32.ball-red,.icon32.ball-orange,.icon32.ball-yellow,.icon32.ball-green,.icon32.ball-blue,'+
                        '[class~="ball-red"],[class~="ball-orange"],[class~="ball-yellow"],[class~="ball-green"],[class~="ball-blue"]'
                    );
                    const nome=nomeDaLinha(alvo);
                    const classificacao=classeParaClassificacao(bola);
                    if(nome && classificacao!=="NÃO IDENTIFICADA"){
                        salvarClassificacaoCache(nome,classificacao);
                        salvarPacientePendente(nome,"","",classificacao);
                    }
                }
                const tabela=alvo.closest("table");
                if(tabela){
                    const linhas=Array.from(tabela.querySelectorAll("tr"));
                    const idx=linhas.indexOf(alvo);
                    if(idx>=0){
                        for(let i=Math.max(0,idx-1);i<=Math.min(linhas.length-1,idx+1);i++){
                            capturarClassificacaoDaLinha(linhas[i]);
                        }
                    }
                }
            }else{
                sincronizarClassificacoesDaTabela();
            }
        }catch(err){
            console.warn("[CELK Helper V39] FALHA NA CAPTURA ANTECIPADA:",err);
        }
    };

    document.addEventListener("mousedown",capturar,true);
    document.addEventListener("click",capturar,true);

    // MutationObserver mantém o cache atualizado quando o CELK reconstrói a tabela.
    if(window.MutationObserver){
        const obs=new MutationObserver(function(){
            if(window.celk._classificacaoScanTimer) return;
            window.celk._classificacaoScanTimer=setTimeout(function(){
                window.celk._classificacaoScanTimer=null;
                try{ sincronizarClassificacoesDaTabela(); }catch(_){ }
            },100);
        });

        obs.observe(document.body,{childList:true,subtree:true});
        window.celk.classificacaoObserver=obs;
    }
}

function obterClassificacaoDoCache(nomePaciente){
    const nome=normalizarClassificacaoTexto(nomePaciente);
    if(!nome) return "NÃO IDENTIFICADA";

    try{
        const cache=JSON.parse(localStorage.getItem("celk_classificacoes_cache")||"{}");
        return cache[nome] || "NÃO IDENTIFICADA";
    }catch(_){
        return "NÃO IDENTIFICADA";
    }
}

function obterClassificacao(nomePaciente){
    const nome=normalizarClassificacaoTexto(nomePaciente);
    if(!nome) return "NÃO IDENTIFICADA";

    // Primeiro: linha atual.
    const linhas=Array.from(document.querySelectorAll("table tr"));
    for(const tr of linhas){
        const nomeLinha=normalizarClassificacaoTexto(nomeDaLinha(tr));
        if(!nomeLinha || nomeLinha!==nome) continue;

        const bola=tr.querySelector(
            '[class~="ball-red"],[class~="ball-orange"],[class~="ball-yellow"],[class~="ball-green"],[class~="ball-blue"]'
        );
        const c=classeParaClassificacao(bola);
        if(c!=="NÃO IDENTIFICADA"){
            salvarClassificacaoCache(nome,c);
            return c;
        }
    }

    // Segundo: cache persistente capturado antes da navegação.
    const cache=obterClassificacaoDoCache(nome);
    if(cache!=="NÃO IDENTIFICADA") return cache;

    console.warn("[CELK Helper V32] CLASSIFICAÇÃO NÃO ENCONTRADA:",nome);
    return "NÃO IDENTIFICADA";
}

// --------------------------------------------------
// RELATÓRIO DO PLANTÃO — V39
// PRÉ-REGISTRO + CLASSIFICAÇÃO + FINALIZAÇÃO
// --------------------------------------------------
// A lógica abaixo mantém o paciente no relatório assim que ele é
// identificado/aberto, mas só preenche "Atendido" e "Tempo" quando
// o atendimento é efetivamente finalizado.
//
// Isso permite que o relatório mostre:
// ✓ pacientes já atendidos
// ✓ pacientes aguardando atendimento
// ✓ classificação capturada pela pulseira
// ✓ horário de chegada
// ✓ horário de atendimento
// ✓ tempo de espera
//
// A classificação é capturada ANTES de o CELK remover a linha da tabela.
// O registro é persistido em localStorage para sobreviver à navegação.

function escaparHtmlRelatorio(valor){
    return String(valor ?? "")
        .replace(/&/g,"&amp;")
        .replace(/</g,"&lt;")
        .replace(/>/g,"&gt;")
        .replace(/"/g,"&quot;")
        .replace(/'/g,"&#39;");
}

function calcularTempoRelatorio(chegada, agora){
    if(!chegada || !/^\d{1,2}:\d{2}$/.test(String(chegada).trim())){
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

    let minutos = Math.floor((agora - inicio) / 60000);

    // Virada de dia.
    if(minutos < 0){
        minutos += 24 * 60;
    }

    return minutos + " min";
}

function renumerarRelatorio(lista){
    lista.forEach(function(paciente, indice){
        paciente.numero = indice + 1;
    });
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

function salvarListaRelatorio(lista){
    renumerarRelatorio(lista);

    localStorage.setItem(
        "celk_relatorio",
        JSON.stringify(lista)
    );
}

function atualizarClassificacaoNoRelatorio(nome,classificacao){
    if(!nome || !classificacao || classificacao==="NÃO IDENTIFICADA") return;
    const lista=obterListaRelatorio();
    const chave=normalizarClassificacaoTexto(nome);
    let alterou=false;
    lista.forEach(function(paciente){
        if(normalizarClassificacaoTexto(paciente.nome)===chave && paciente.classificacao==="NÃO IDENTIFICADA"){
            paciente.classificacao=classificacao;
            alterou=true;
        }
    });
    if(alterou){
        salvarListaRelatorio(lista);
        console.log("[CELK RELATÓRIO V39] CLASSIFICAÇÃO ATUALIZADA:",nome,"=>",classificacao);
    }
}

// Procura o registro correspondente ao paciente.
// Primeiro usa nome + chegada; depois usa um registro ainda não atendido
// do mesmo paciente. Isso permite transformar o pré-registro em definitivo.
function localizarPacienteNoRelatorio(lista, nome, chegada){
    const nomeNormalizado = normalizarClassificacaoTexto(nome);
    const chegadaNormalizada = String(chegada || "").trim();

    if(!nomeNormalizado){
        return null;
    }

    let paciente = null;

    if(chegadaNormalizada){
        paciente = lista.find(function(item){
            return (
                normalizarClassificacaoTexto(item.nome) === nomeNormalizado &&
                String(item.chegada || "").trim() === chegadaNormalizada
            );
        });

        if(paciente){
            return paciente;
        }
    }

    paciente = lista.find(function(item){
        return (
            normalizarClassificacaoTexto(item.nome) === nomeNormalizado &&
            !item.atendido
        );
    });

    if(paciente){
        return paciente;
    }

    // Último fallback: mesmo nome.
    return lista.find(function(item){
        return normalizarClassificacaoTexto(item.nome) === nomeNormalizado;
    }) || null;
}

// Registra o paciente no relatório sem marcar como atendido.
// É chamado no momento em que o paciente é aberto/pré-registrado.
function preRegistrarNoRelatorio(nome, idade, chegada, classificacao){
    nome = String(nome || "").trim();

    if(!nome || nome === "Não encontrado"){
        return false;
    }

    const lista = obterListaRelatorio();

    let paciente = localizarPacienteNoRelatorio(
        lista,
        nome,
        chegada
    );

    if(!paciente){
        paciente = {
            numero: lista.length + 1,
            nome: nome,
            idade: String(idade || "").trim(),
            classificacao:
                classificacao || "NÃO IDENTIFICADA",
            chegada: String(chegada || "").trim(),
            atendido: "",
            tempo: ""
        };

        lista.push(paciente);

    }else{

        if(idade){
            paciente.idade = String(idade).trim();
        }

        if(chegada){
            paciente.chegada = String(chegada).trim();
        }

        if(
            classificacao &&
            classificacao !== "NÃO IDENTIFICADA"
        ){
            paciente.classificacao = classificacao;
        }
    }

    salvarListaRelatorio(lista);

    console.log(
        "[CELK RELATÓRIO V39] PACIENTE PRÉ-REGISTRADO:",
        paciente.nome,
        "=>",
        paciente.classificacao
    );

    return true;
}

function salvarPacientePendente(
    nome,
    idade,
    chegada,
    classificacao
){
    const dados = {
        nome: String(nome || "").trim(),
        idade: String(idade || "").trim(),
        chegada: String(chegada || "").trim(),
        classificacao:
            classificacao || "NÃO IDENTIFICADA",
        salvoEm: Date.now()
    };

    if(
        !dados.nome ||
        dados.nome === "Não encontrado"
    ){
        return;
    }

    try{
        localStorage.setItem(
            "celk_paciente_pendente",
            JSON.stringify(dados)
        );
    }catch(_){}

    // IMPORTANTE:
    // o paciente entra no relatório imediatamente, mas
    // "Atendido" e "Tempo" continuam vazios.
    preRegistrarNoRelatorio(
        dados.nome,
        dados.idade,
        dados.chegada,
        dados.classificacao
    );

    console.log(
        "[CELK RELATÓRIO V39] PRÉ-REGISTRO:",
        dados.nome,
        "=>",
        dados.classificacao
    );
}

function registrarPacienteEmAtendimento(
    nome,
    idade,
    chegada
){
    let classificacao =
        obterClassificacaoDoCache(nome);

    if(
        classificacao === "NÃO IDENTIFICADA"
    ){
        classificacao = obterClassificacao(nome);
    }

    salvarPacientePendente(
        nome,
        idade,
        chegada,
        classificacao
    );
}

function dadosPacienteAtual(){
    try{
        const salvo = JSON.parse(
            localStorage.getItem(
                "celk_paciente_pendente"
            ) || "null"
        );

        if(salvo && salvo.nome){
            // Tenta completar classificação pelo cache atual.
            if(
                !salvo.classificacao ||
                salvo.classificacao === "NÃO IDENTIFICADA"
            ){
                const cache =
                    obterClassificacaoDoCache(salvo.nome);

                if(cache !== "NÃO IDENTIFICADA"){
                    salvo.classificacao = cache;
                }
            }

            return salvo;
        }
    }catch(_){}

    // Fallback: extrai o paciente diretamente
    // do cabeçalho do prontuário.
    const tela = document.body.innerText || "";

    const cab = tela.match(
        /([A-ZÁÀÂÃÉÊÍÓÔÕÚÇ ]+)\s*\|\s*([^|]+)\s*\|\s*DN:/i
    );

    if(!cab){
        return null;
    }

    let chegada = "";

    const mTriagem = tela.match(
        /TRIAGEM[\s\S]*?([0-9]{2}\/\d{2}\/\d{4})\s*-\s*([0-9]{2}:\d{2})/i
    );

    if(mTriagem){
        chegada = mTriagem[2];
    }

    const nome = cab[1].trim();
    const idade = cab[2].trim();

    const classificacao =
        obterClassificacaoDoCache(nome);

    return {
        nome,
        idade,
        chegada,
        classificacao
    };
}

function registrarFinalizacaoRelatorio(){
    const dados = dadosPacienteAtual();

    if(!dados || !dados.nome){
        console.warn(
            "[CELK RELATÓRIO V39] FINALIZAÇÃO SEM PACIENTE IDENTIFICADO."
        );
        return false;
    }

    const agora = new Date();

    const atendido =
        agora.getHours().toString().padStart(2,"0") +
        ":" +
        agora.getMinutes().toString().padStart(2,"0");

    let classificacao =
        dados.classificacao || "NÃO IDENTIFICADA";

    if(classificacao === "NÃO IDENTIFICADA"){
        const cache =
            obterClassificacaoDoCache(dados.nome);

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
            numero: lista.length + 1,
            nome: dados.nome,
            idade: dados.idade || "",
            classificacao: classificacao,
            chegada: dados.chegada || "",
            atendido: atendido,
            tempo: calcularTempoRelatorio(
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
        "[CELK RELATÓRIO V39] FINALIZAÇÃO REGISTRADA:",
        paciente.nome,
        "=>",
        paciente.classificacao,
        "|",
        paciente.atendido,
        "|",
        paciente.tempo
    );

    try{
        localStorage.removeItem(
            "celk_paciente_pendente"
        );
    }catch(_){}

    return true;
}

// Captura o clique de finalização em fase de CAPTURE.
// Assim o registro acontece antes do CELK executar o próprio
// onclick/navegação e remover a tela do paciente.
function instalarCapturaFinalizacaoRelatorio(){
    if(window.celk.finalizacaoRelatorioHook){
        return;
    }

    window.celk.finalizacaoRelatorioHook = true;

    const capturarFinalizacao = function(evento){

        try{

            const alvo =
                evento.target &&
                evento.target.closest
                    ? evento.target.closest(
                        "a,button,input"
                    )
                    : null;

            if(!alvo){
                return;
            }

            const texto = normalizarCelk(
                alvo.innerText ||
                alvo.value ||
                alvo.getAttribute("title") ||
                alvo.getAttribute("alt") ||
                ""
            );

            const id = normalizarCelk(
                alvo.id || ""
            );

            const classe = normalizarCelk(
                alvo.className || ""
            );

            const ehFinalizacao =
                id.includes(
                    "BTNFINALIZARPRONTUARIO"
                ) ||
                classe.includes(
                    "BTN FINALIZAR PRONTUARIO"
                ) ||
                texto.includes(
                    "SALVAR ATENDIMENTO"
                ) ||
                texto.includes(
                    "SALVAR O ATENDIMENTO"
                ) ||
                texto.includes(
                    "FINALIZAR PRONTUARIO"
                ) ||
                texto.includes(
                    "FINALIZAR ATENDIMENTO"
                );

            if(!ehFinalizacao){
                return;
            }

            // Apenas registrar; NÃO impedir o clique do CELK.
            registrarFinalizacaoRelatorio();

        }catch(err){

            console.error(
                "[CELK RELATÓRIO V39] ERRO NA CAPTURA DA FINALIZAÇÃO:",
                err
            );

        }

    };

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
        "[CELK RELATÓRIO V39] CAPTURA DE FINALIZAÇÃO INSTALADA."
    );
}

// Mantida por compatibilidade com versões anteriores.
// Agora ela faz PRÉ-REGISTRO, e não marca o paciente como atendido.
function adicionarRelatorio(
    nome,
    idade,
    chegada,
    classificacao
){
    preRegistrarNoRelatorio(
        nome,
        idade,
        chegada,
        classificacao
    );
}

//--------------------------------------------------
// DECLARAÇÕES — MENU E PREENCHIMENTO
//--------------------------------------------------

function normalizarTextoDeclaracao(valor){
    return String(valor || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g,"")
        .replace(/[\u200B-\u200D\uFEFF]/g,"")
        .replace(/\s+/g," ")
        .trim()
        .toUpperCase();
}

function obterDadosPacienteDeclaracao(){

    const tela = document.body.innerText || "";

    // Mesmo padrão já usado no Helper para o cabeçalho do paciente.
    const cabecalho = tela.match(
        /([A-ZÁÀÂÃÉÊÍÓÔÕÚÇ ]+)\s*\|\s*([^|]+)\s*\|\s*DN:/i
    );

    let nome = cabecalho
        ? cabecalho[1].trim()
        : "PACIENTE";

    let idadeTexto = cabecalho
        ? cabecalho[2].trim()
        : "";

    // Para a declaração, usar somente a idade em anos.
    const idadeMatch = idadeTexto.match(/(\d+)\s*anos?/i);
    const idade = idadeMatch ? idadeMatch[1] : idadeTexto;

    // Horário de chegada: prioriza a triagem.
    let chegada = "";

    const mTriagem = tela.match(
        /TRIAGEM[\s\S]*?(?:\d{2}\/\d{2}\/\d{4}\s*-\s*)?(\d{2}:\d{2})/i
    );

    if(mTriagem){
        chegada = mTriagem[1];
    }

    // Fallbacks caso o texto da triagem esteja em outro formato.
    if(!chegada){
        const mChegada = tela.match(
            /(?:CHEGADA|ENTRADA)[^\d]{0,40}(\d{2}:\d{2})/i
        );

        if(mChegada){
            chegada = mChegada[1];
        }
    }

    if(!chegada){
        chegada = "NÃO IDENTIFICADO";
    }

    const agora = new Date();

    const data = agora.toLocaleDateString("pt-BR",{
        day:"2-digit",
        month:"2-digit",
        year:"numeric"
    });

    const saida = agora.toLocaleTimeString("pt-BR",{
        hour:"2-digit",
        minute:"2-digit",
        hourCycle:"h23"
    });

    return {
        nome,
        idade,
        chegada,
        saida,
        data
    };
}

function localizarNovoDocumentoDeclaracao(){

    const candidatos = [
        ...document.querySelectorAll(
            "button, a, input, div, span"
        )
    ];

    return candidatos.find(el => {

        if(el.closest("#celk-declaracao-overlay")){
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
}

function esperarSelectModeloDeclaracao(timeout=12000){

    return new Promise(resolve => {

        const inicio = Date.now();

        const procurar = () => {

            const selects = [
                ...document.querySelectorAll("select")
            ];

            const encontrado = selects.find(el => {

                const textoOpcoes = [...el.options]
                    .map(o => normalizarTextoDeclaracao(o.textContent))
                    .join(" | ");

                return (
                    textoOpcoes.includes("DECLARACAO DE COMPARECIMENTO")
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

function localizarAlvosEditorDeclaracao(){

    const encontrados = [];

    const adicionar = (elemento, iframe=null) => {

        if(!elemento){
            return;
        }

        const texto =
            elemento.value ??
            elemento.innerText ??
            elemento.textContent ??
            "";

        const normalizado = normalizarTextoDeclaracao(texto);

        if(
            normalizado.includes("DECLARACAO") ||
            normalizado.includes("COMPARECIMENTO")
        ){
            if(!encontrados.some(x => x.elemento === elemento)){
                encontrados.push({
                    elemento,
                    iframe
                });
            }
        }
    };

    document.querySelectorAll(
        "textarea, [contenteditable='true'], " +
        ".mceContentBody, .mce-content-body"
    ).forEach(el => adicionar(el));

    document.querySelectorAll("iframe").forEach(iframe => {

        try{

            const doc =
                iframe.contentDocument ||
                iframe.contentWindow?.document;

            if(!doc){
                return;
            }

            if(doc.body){
                adicionar(doc.body, iframe);
            }

            doc.querySelectorAll(
                "textarea, [contenteditable='true'], " +
                ".mceContentBody, .mce-content-body"
            ).forEach(el => adicionar(el, iframe));

        }catch(_){}

    });

    return encontrados;
}

function esperarEditorDeclaracao(timeout=12000){

    return new Promise(resolve => {

        const inicio = Date.now();

        const procurar = () => {

            const alvos = localizarAlvosEditorDeclaracao();

            if(alvos.length){
                resolve(alvos);
                return;
            }

            if(Date.now() - inicio >= timeout){
                resolve([]);
                return;
            }

            setTimeout(procurar,200);
        };

        procurar();
    });
}

function definirConteudoEditorDeclaracao(elemento, html){

    if(!elemento){
        return false;
    }

    // TinyMCE
    try{

        if(typeof tinymce !== "undefined" && tinymce?.editors?.length){

            const editor = tinymce.editors.find(ed => {

                try{
                    const body = ed.getBody?.();

                    return (
                        body === elemento ||
                        body?.contains?.(elemento) ||
                        elemento?.contains?.(body)
                    );

                }catch(_){
                    return false;
                }

            });

            if(editor){

                editor.setContent(html);
                editor.fire("input");
                editor.fire("change");

                return true;
            }

        }

    }catch(_){}

    // Editor direto / iframe.
    try{

        if(
            elemento.tagName === "TEXTAREA" ||
            elemento.tagName === "INPUT"
        ){

            elemento.value =
                html.replace(/<[^>]+>/g,"");

        }else{

            elemento.innerHTML = html;

        }

        elemento.dispatchEvent(
            new Event("input",{bubbles:true})
        );

        elemento.dispatchEvent(
            new Event("change",{bubbles:true})
        );

        return true;

    }catch(e){

        console.error(
            "[CELK Helper V32] Erro ao preencher declaração:",
            e
        );

        return false;
    }
}

function montarDeclaracaoPaciente(dados){

    return `
        <p style="margin:0 0 18px 0;"><strong>DECLARAÇÃO DE COMPARECIMENTO</strong></p>

        <p style="margin:0 0 14px 0;">
            Declaro, para os devidos fins, que o(a) paciente
            <strong>${dados.nome}</strong>, esteve nesta unidade para
            atendimento/consulta médica.
        </p>

        <p style="margin:0 0 8px 0;">
            Data: ${dados.data}
        </p>

        <p style="margin:0 0 8px 0;">
            Horário de chegada: <strong>${dados.chegada}</strong>
        </p>

        <p style="margin:0 0 18px 0;">
            Horário de saída: <strong>${dados.saida}</strong>
        </p>

        <p style="margin:0;">
            ( X ) Atendimento / Consulta médica
        </p>

        <p style="margin-top:80px;">
            ________________________________________________
        </p>

        <p style="margin:0;">
            RAYNDRICK KELRYN ASSIS LIMA CRM 30235
        </p>
    `;
}

function montarDeclaracaoAcompanhante(dados){

    return `
        <p style="margin:0 0 18px 0;"><strong>DECLARAÇÃO DE COMPARECIMENTO</strong></p>

        <p style="margin:0 0 12px 0;">
            Nome do Paciente: <strong>${dados.nome}</strong>,
            Idade: <strong>${dados.idade}</strong>
        </p>

        <p style="margin:0 0 8px 0;">
            Grau de Parentesco:
        </p>

        <p style="margin:0;">( ) Cônjuge ou Companheiro(a)</p>
        <p style="margin:0;">( X ) Mãe / Pai</p>
        <p style="margin:0;">( ) Avó / Avô</p>
        <p style="margin:0;">( ) Irmão / Irmã</p>
        <p style="margin:0;">( ) Tia / Tio</p>
        <p style="margin:0 0 16px 0;">( ) Outro</p>

        <p style="margin:0 0 8px 0;">
            Data: ${dados.data}
        </p>

        <p style="margin:0 0 8px 0;">
            Horário de chegada: <strong>${dados.chegada}</strong>
        </p>

        <p style="margin:0 0 18px 0;">
            Horário de saída: <strong>${dados.saida}</strong>
        </p>

        <p style="margin-top:80px;">
            ________________________________________________
        </p>

        <p style="margin:0;">
            RAYNDRICK KELRYN ASSIS LIMA CRM 30235
        </p>
    `;
}

async function prepararDeclaracao(acompanhante){

    const overlay = document.getElementById(
        "celk-declaracao-overlay"
    );

    const dados = obterDadosPacienteDeclaracao();

    try{

        console.log(
            "[CELK Helper V32] INICIANDO DECLARAÇÃO:",
            acompanhante ? "ACOMPANHANTE" : "PACIENTE",
            dados
        );

        let novo = localizarNovoDocumentoDeclaracao();

        if(!novo){

            const documentos = [
                ...document.querySelectorAll(
                    "a,button,div,span"
                )
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

                documentos.click();

                await new Promise(r =>
                    setTimeout(r,700)
                );

                novo = localizarNovoDocumentoDeclaracao();
            }
        }

        if(!novo){
            throw new Error(
                "Não encontrei o botão NOVO DOCUMENTO. " +
                "Verifique se a aba Documentos está aberta."
            );
        }

        novo.click();

        const tipo =
            await esperarSelectModeloDeclaracao(12000);

        if(!tipo){
            throw new Error(
                "O CELK não abriu o modelo de Declaração."
            );
        }

        const opcoes = [...tipo.options];

        const opcao = opcoes.find(o => {

            const txt =
                normalizarTextoDeclaracao(o.textContent);

            if(acompanhante){

                return (
                    txt.includes(
                        "DECLARACAO DE COMPARECIMENTO"
                    ) &&
                    txt.includes("ACOMPANHANTE")
                );

            }

            return (
                txt === "DECLARACAO DE COMPARECIMENTO" ||
                (
                    txt.includes(
                        "DECLARACAO DE COMPARECIMENTO"
                    ) &&
                    !txt.includes("ACOMPANHANTE")
                )
            );

        });

        if(!opcao){

            throw new Error(
                acompanhante
                    ? "Não encontrei DECLARAÇÃO DE COMPARECIMENTO (ACOMPANHANTE)."
                    : "Não encontrei DECLARAÇÃO DE COMPARECIMENTO."
            );
        }

        const setter =
            Object.getOwnPropertyDescriptor(
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

        const modal =
            encontrarModalDoSelect(tipo);

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
                confirmar.click();
            }
        }

        // Espera o editor do documento ficar disponível.
        await new Promise(r =>
            setTimeout(r,500)
        );

        const alvos =
            await esperarEditorDeclaracao(12000);

        if(!alvos.length){

            throw new Error(
                "O editor da Declaração não foi encontrado."
            );
        }

        const html = acompanhante
            ? montarDeclaracaoAcompanhante(dados)
            : montarDeclaracaoPaciente(dados);

        let preenchido = false;

        for(const alvo of alvos){

            if(
                definirConteudoEditorDeclaracao(
                    alvo.elemento,
                    html
                )
            ){
                preenchido = true;
            }

        }

        if(!preenchido){
            throw new Error(
                "Não consegui preencher o editor da Declaração."
            );
        }

        console.log(
            "[CELK Helper V32] DECLARAÇÃO PREENCHIDA:",
            acompanhante ? "ACOMPANHANTE" : "PACIENTE"
        );

    }catch(e){

        console.error(
            "[CELK Helper V32] ERRO NA DECLARAÇÃO:",
            e
        );

        alert(
            "Erro ao abrir a Declaração:\n\n" +
            (e?.message || e)
        );

    }finally{

        if(overlay && overlay.parentNode){
            overlay.remove();
        }

    }
}

function abrirMenuDeclaracao(){

    if(document.getElementById("celk-declaracao-overlay")){
        return;
    }

    const overlay = document.createElement("div");

    overlay.id = "celk-declaracao-overlay";

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
        width:390px;
        max-width:90vw;
        background:#fff;
        border-radius:8px;
        box-shadow:0 8px 30px rgba(0,0,0,.35);
        padding:22px;
        box-sizing:border-box;
    `;

    caixa.innerHTML = `
        <div style="
            font-size:20px;
            font-weight:700;
            margin-bottom:18px;
        ">
            📄 DECLARAÇÃO
        </div>

        <div style="
            font-size:14px;
            margin-bottom:14px;
            color:#555;
        ">
            Selecione o tipo de declaração:
        </div>

        <div style="
            display:flex;
            flex-direction:column;
            gap:10px;
        ">

            <button
                id="celk-declaracao-paciente"
                style="
                    padding:13px;
                    border:none;
                    border-radius:5px;
                    background:#2563eb;
                    color:#fff;
                    font-weight:700;
                    font-size:15px;
                    cursor:pointer;
                "
            >
                DECLARAÇÃO PACIENTE
            </button>

            <button
                id="celk-declaracao-acompanhante"
                style="
                    padding:13px;
                    border:1px solid #aaa;
                    border-radius:5px;
                    background:#f5f5f5;
                    color:#222;
                    font-weight:700;
                    font-size:15px;
                    cursor:pointer;
                "
            >
                DECLARAÇÃO ACOMPANHANTE
            </button>

        </div>
    `;

    overlay.appendChild(caixa);
    document.body.appendChild(overlay);

    overlay.addEventListener("click", function(e){

        if(e.target === overlay){
            overlay.remove();
        }

    });

    overlay.addEventListener("click", async function(e){

        const botao = e.target.closest(
            "#celk-declaracao-paciente, " +
            "#celk-declaracao-acompanhante"
        );

        if(!botao){
            return;
        }

        e.preventDefault();
        e.stopPropagation();

        botao.disabled = true;
        botao.style.opacity = "0.6";
        botao.textContent = "ABRINDO...";

        await prepararDeclaracao(
            botao.id === "celk-declaracao-acompanhante"
        );

    }, true);

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
            "[CELK Helper V32] Botão do Atestado clicado:",
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
                "[CELK Helper V32] erro no clique do Atestado:",
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

function corrigirEspacamentoDiasAtestado(el){
    if(!el) return false;
    let alterou=false;
    const corrigir=(texto)=>String(texto||"").replace(/(\d+)\s*DIAS(?=\s+DE\s+AFASTAMENTO)/gi,"$1 dias");
    if(el.value!==undefined){
        const novo=corrigir(el.value);
        if(novo!==el.value){ el.value=novo; alterou=true; }
    }else{
        const novo=corrigir(el.innerHTML||"");
        if(novo!==(el.innerHTML||"")){ el.innerHTML=novo; alterou=true; }
    }
    if(alterou){
        try{el.dispatchEvent(new Event("input",{bubbles:true}));}catch(_){}
        try{el.dispatchEvent(new Event("change",{bubbles:true}));}catch(_){}
    }
    return alterou;
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
                "[CELK Helper V32] ALVOS DO EDITOR DE ATESTADO:",
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

                        corrigirEspacamentoDiasAtestado(alvo.elemento);

                        console.log(
                            "[CELK Helper V39] DIAS PREENCHIDOS NO DOCUMENTO:",
                            dias,
                            alvo.tipo,
                            "(espaçamento corrigido)"
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
                        "[CELK Helper V32] Falha ao preencher alvo:",
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
                    "[CELK Helper V32] Aba/janela auxiliar do Atestado fechada."
                );
            }

        }catch(e){

            console.log(
                "[CELK Helper V32] Não foi possível fechar a janela auxiliar:",
                e
            );

        }

    });
}


//--------------------------------------------------
// ATESTADO — AJUSTES FINAIS DE ASSINATURA
//--------------------------------------------------

function normalizarAtestadoTexto(s){
    return String(s || "")
        .replace(/\u00a0/g," ")
        .replace(/\s+/g," ")
        .trim()
        .toUpperCase();
}

function aplicarLayoutAssinaturaAtestado(comCid){

    const alvos = localizarAlvosEditorAtestado();

    if(!alvos.length){
        console.warn(
            "[CELK Helper V32] Não encontrei o editor para ajustar assinatura."
        );
        return false;
    }

    let aplicado = false;

    alvos.forEach(alvo => {

        const el = alvo.elemento;

        if(!el){
            return;
        }

        // ==================================================
        // SEM CID
        // ==================================================
        //
        // O modelo IDEAS continua trazendo a parte do paciente
        // depois da assinatura médica. Portanto, em SEM CID,
        // fazemos um corte definitivo:
        //
        // DATA
        // [espaço para carimbo]
        // RAYNDRICK... CRM 30235
        // -------------------------
        //
        // e eliminamos tudo que vier depois da primeira assinatura
        // médica. Isso impede que o nome do paciente e a segunda
        // assinatura médica reapareçam.
        // ==================================================

        if(!comCid){

            // Primeiro remove a autorização/dados do paciente quando
            // esses blocos estiverem claramente identificáveis.
            [
                ...el.querySelectorAll("p, div, li, td, section")
            ].forEach(no => {

                if(!no.parentNode){
                    return;
                }

                const t = normalizarAtestadoTexto(
                    no.innerText || no.textContent
                );

                if(
                    t.startsWith("EU,") &&
                    (
                        t.includes("AUTORIZO A DIVULGACAO") ||
                        t.includes("AUTORIZO A DIVULGAÇÃO")
                    )
                ){
                    no.remove();
                    aplicado = true;
                }

            });

            // Localiza TODAS as ocorrências da assinatura médica.
            const blocosMedico = [
                ...el.querySelectorAll("p, div, li, td")
            ].filter(no => {

                const t = normalizarAtestadoTexto(
                    no.innerText || no.textContent
                );

                return (
                    t.includes("RAYNDRICK KELRYN ASSIS LIMA") &&
                    t.includes("CRM 30235")
                );

            });

            // A PRIMEIRA ocorrência é a assinatura médica correta.
            // Tudo que vem depois pertence à seção do paciente/
            // assinatura duplicada do modelo.
            const blocoMedico = blocosMedico[0];

            if(blocoMedico){

                const pai = blocoMedico.parentElement;

                if(pai){

                    const filhos = [...pai.children];
                    const indiceMedico = filhos.indexOf(blocoMedico);

                    if(indiceMedico >= 0){

                        for(
                            let i = filhos.length - 1;
                            i > indiceMedico;
                            i--
                        ){

                            const no = filhos[i];

                            // Se o próprio bloco médico contém elementos
                            // internos, não mexemos nele.
                            if(no === blocoMedico){
                                continue;
                            }

                            no.remove();
                            aplicado = true;
                        }

                    }
                }

                // --------------------------------------------------
                // Remove também qualquer conteúdo textual que tenha
                // ficado depois do bloco médico no mesmo elemento-pai.
                // --------------------------------------------------

                let encontrouMedico = false;

                [...pai.childNodes].forEach(no => {

                    if(no === blocoMedico){
                        encontrouMedico = true;
                        return;
                    }

                    if(encontrouMedico){
                        no.remove();
                        aplicado = true;
                    }

                });

                // --------------------------------------------------
                // Coloca UMA linha de assinatura abaixo do médico.
                // --------------------------------------------------

                const linha = document.createElement("p");

                linha.setAttribute(
                    "data-celk-linha-assinatura",
                    "1"
                );

                linha.style.cssText =
                    "margin:0;line-height:1.2;height:auto;";

                linha.textContent =
                    "________________________________________";

                blocoMedico.parentNode.appendChild(linha);

                aplicado = true;
            }

            // --------------------------------------------------
            // Fallback: se a assinatura médica não foi encontrada
            // como bloco, corta pelo HTML a partir da segunda ocorrência
            // do nome do paciente/médico.
            // --------------------------------------------------

            else{

                let html = el.innerHTML;

                const nomeMedico =
                    "RAYNDRICK\\s+KELRYN\\s+ASSIS\\s+LIMA\\s*CRM\\s*30235";

                // Mantém somente a primeira ocorrência do médico e
                // remove o restante da seção.
                const partes = html.split(
                    new RegExp(
                        "(RAYNDRICK\\s+KELRYN\\s+ASSIS\\s+LIMA\\s*CRM\\s*30235)",
                        "ig"
                    )
                );

                if(partes.length >= 3){

                    html =
                        partes[0] +
                        partes[1] +
                        partes[2];

                    el.innerHTML = html;

                    aplicado = true;
                }
            }

            // --------------------------------------------------
            // Limpa espaços vazios que o editor possa ter deixado.
            // NÃO remove o bloco médico.
            // --------------------------------------------------

            [
                ...el.querySelectorAll("p, div, li, td, section")
            ].forEach(no => {

                if(!no.parentNode){
                    return;
                }

                const t = normalizarAtestadoTexto(
                    no.innerText || no.textContent
                );

                const vazio =
                    t === "" &&
                    String(no.innerHTML || "")
                        .replace(/&nbsp;/gi,"")
                        .replace(/<br\s*\/?>/gi,"")
                        .replace(/\s+/g,"")
                        .trim() === "";

                const ehMedico =
                    t.includes("RAYNDRICK KELRYN ASSIS LIMA") &&
                    t.includes("CRM 30235");

                const ehLinha =
                    no.getAttribute("data-celk-linha-assinatura") === "1";

                if(vazio && !ehMedico && !ehLinha){
                    no.remove();
                    aplicado = true;
                }

            });
        }

        // ==================================================
        // ESPAÇO MAIOR PARA CARIMBO/ASSINATURA MÉDICA
        // ==================================================

        const blocosMedico = [
            ...el.querySelectorAll("p, div, li, td")
        ];

        const blocoMedico = blocosMedico.find(b => {

            const t = normalizarAtestadoTexto(
                b.innerText || b.textContent
            );

            return (
                t.includes("RAYNDRICK KELRYN ASSIS LIMA") &&
                t.includes("CRM 30235")
            );

        });

        if(blocoMedico){

            const anterior = blocoMedico.previousElementSibling;

            if(!(
                anterior &&
                anterior.getAttribute(
                    "data-celk-espaco-assinatura"
                ) === "1"
            )){

                const espaco = document.createElement("p");

                espaco.setAttribute(
                    "data-celk-espaco-assinatura",
                    "1"
                );

                espaco.style.cssText =
                    "margin:0;line-height:1.2;height:120px;";

                espaco.innerHTML = "&nbsp;";

                blocoMedico.parentNode.insertBefore(
                    espaco,
                    blocoMedico
                );

                aplicado = true;
            }
        }

        // ==================================================
        // SINCRONIZA TINYMCE / WICKET
        // ==================================================

        try{

            if(
                typeof tinymce !== "undefined" &&
                tinymce?.editors?.length
            ){

                tinymce.editors.forEach(editor => {

                    try{

                        const body = editor.getBody?.();

                        if(
                            body &&
                            (
                                body === el ||
                                body.contains?.(el) ||
                                el.contains?.(body)
                            )
                        ){

                            editor.setContent(body.innerHTML);
                            editor.fire("input");
                            editor.fire("change");
                        }

                    }catch(_){}

                });
            }

        }catch(_){}

        try{

            el.dispatchEvent(
                new Event("input",{bubbles:true})
            );

            el.dispatchEvent(
                new Event("change",{bubbles:true})
            );

        }catch(_){}

    });

    console.log(
        "[CELK Helper V32] Layout do Atestado ajustado:",
        comCid ? "COM CID" : "SEM CID",
        aplicado ? "OK" : "NÃO APLICADO"
    );

    return aplicado;
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
                "[CELK Helper V32] Janela auxiliar capturada."
            );
        }

        return janela;
    };

    try{

        console.log(
            "[CELK Helper V32] INICIANDO ATESTADO:",
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
                    "[CELK Helper V32] Abrindo aba DOCUMENTOS."
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
            "[CELK Helper V32] CLICANDO EM NOVO DOCUMENTO."
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
            "[CELK Helper V32] MODAL MODELO DE DOCUMENTO ABERTO."
        );

        // --------------------------------------------------
        // 3) Seleciona exatamente o modelo correto.
        // --------------------------------------------------

        const opcoes = [...tipo.options];

        // Normaliza acentos, espaços e caracteres invisíveis.
        // Isso evita que o CELK deixe de reconhecer o modelo SEM CID
        // por diferenças de formatação do texto da <option>.
        const normalizarModelo = (valor) => String(valor || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[\u200B-\u200D\uFEFF]/g, "")
            .replace(/\s+/g, " ")
            .trim()
            .toUpperCase();

        console.log(
            "[CELK Helper V32] OPÇÕES DO MODELO:",
            opcoes.map(o => ({ texto: o.textContent, valor: o.value }))
        );

        const opcao = opcoes.find(o => {

            const txt = normalizarModelo(o.textContent);

            if(comCid){

                return (
                    txt.includes("ATESTADO MEDICO") &&
                    txt.includes("COM CID") &&
                    txt.includes("IDEAS")
                );

            }else{

                // SEM CID = ATESTADO MEDICO + IDEAS, mas SEM "COM CID".
                // A opção do seu CELK aparece como:
                // ATESTADO MEDICO ( IDEAS )
                return (
                    txt.includes("ATESTADO MEDICO") &&
                    txt.includes("IDEAS") &&
                    !txt.includes("COM CID")
                );
            }
        });

        if(!opcao){

            console.error(
                "[CELK Helper V32] MODELO NÃO ENCONTRADO. OPÇÕES:",
                opcoes.map(o => ({ texto: o.textContent, valor: o.value }))
            );

            throw new Error(
                comCid
                    ? "Não encontrei o modelo ATESTADO MEDICO COM CID ( IDEAS )."
                    : "Não encontrei o modelo ATESTADO MEDICO ( IDEAS )."
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
            "[CELK Helper V32] MODELO SELECIONADO:",
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
                    "[CELK Helper V32] CONFIRMANDO MODELO."
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
        await new Promise(r => setTimeout(r, 300));
        aplicarLayoutAssinaturaAtestado(comCid);

        // Ajusta o documento depois que o modelo oficial foi aberto:
        // SEM CID remove a seção de assinatura/autorização do paciente;
        // COM CID mantém essa seção. Nos dois modelos é reservado um
        // espaço maior para carimbo e assinatura médica.
        await new Promise(r => setTimeout(r, 250));
        aplicarLayoutAssinaturaAtestado(comCid);

        console.log(
            "[CELK Helper V32] ATESTADO ABERTO, DIAS E ASSINATURA AJUSTADOS:",
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
            "[CELK Helper V32] ERRO NO ATESTADO:",
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
                "[CELK Helper V32] Campo OFICIAL de dias localizado:",
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

function atualizarClassificacoesRelatorioVisiveis(){

    let lista = [];

    try{
        lista = JSON.parse(
            localStorage.getItem("celk_relatorio") || "[]"
        );
    }catch(_){
        return;
    }

    if(!Array.isArray(lista) || !lista.length){
        return;
    }

    let alterou = false;

    lista.forEach(function(paciente){

        if(!paciente || !paciente.nome){
            return;
        }

        // Somente aceita uma classificação encontrada na linha
        // correspondente ao paciente. Nunca usa fallback global.
        const classificacao = obterClassificacaoDoCache(paciente.nome) !== "NÃO IDENTIFICADA"
            ? obterClassificacaoDoCache(paciente.nome)
            : obterClassificacao(paciente.nome, true);

        if(
            classificacao &&
            classificacao !== "NÃO IDENTIFICADA" &&
            paciente.classificacao !== classificacao
        ){
            paciente.classificacao = classificacao;
            alterou = true;

            console.log(
                "[CELK Helper V32] RELATÓRIO ANTIGO CORRIGIDO:",
                paciente.nome,
                "=>",
                classificacao
            );
        }
    });

    if(alterou){
        localStorage.setItem(
            "celk_relatorio",
            JSON.stringify(lista)
        );
    }
}

function obterCorClassificacaoRelatorio(classificacao){
    const c = normalizarClassificacaoTexto(classificacao);

    if(c === "VERMELHO"){
        return "#f4cccc";
    }

    if(c === "LARANJA"){
        return "#fce5cd";
    }

    if(c === "AMARELO"){
        return "#fff2cc";
    }

    if(c === "VERDE"){
        return "#d9ead3";
    }

    if(c === "AZUL"){
        return "#cfe2f3";
    }

    return "#ffffff";
}

function abrirRelatorio(){

    // Primeiro tenta atualizar o cache com a tabela atual.
    try{
        sincronizarClassificacoesDaTabela();
    }catch(_){}

    // Corrige registros antigos quando a classificação
    // estiver disponível no cache/tabela.
    try{
        atualizarClassificacoesRelatorioVisiveis();
    }catch(_){}

    const pacientes = obterListaRelatorio();

    const aba = window.open(
        "",
        "_blank"
    );

    if(!aba){
        alert(
            "O navegador bloqueou a abertura do Relatório.\n\n" +
            "Permita pop-ups para o CELK Helper."
        );
        return;
    }

    let html = `
<!DOCTYPE html>
<html lang="pt-BR">

<head>

<meta charset="UTF-8">

<title>Relatório do Plantão</title>

<style>

*{
    box-sizing:border-box;
}

body{
    font-family:Arial,Helvetica,sans-serif;
    margin:30px;
    color:#111;
    background:#fff;
}

h1{
    margin:0 0 4px 0;
    font-size:28px;
    font-weight:700;
}

.info{
    font-size:16px;
    line-height:1.45;
}

table{
    width:100%;
    border-collapse:collapse;
    margin-top:20px;
}

th,
td{
    border:1px solid #c9c9c9;
    padding:10px 8px;
    text-align:center;
    vertical-align:middle;
}

th{
    background:#f1f1f1;
    font-size:16px;
    font-weight:700;
}

td.nome{
    text-align:left;
}

td.classificacao{
    font-weight:700;
}

#imprimir{
    margin-top:20px;
    padding:10px 18px;
    font-size:16px;
    cursor:pointer;
    border:1px solid #888;
    background:#f3f3f3;
}

#imprimir:hover{
    background:#e7e7e7;
}

@media print{

    body{
        margin:15mm;
    }

    #imprimir{
        display:none;
    }

    table{
        margin-top:15px;
    }

}

</style>

</head>

<body>

<h1>RELATÓRIO DO PLANTÃO</h1>

<div class="info">
    <b>Data:</b>
    ${escaparHtmlRelatorio(
        localStorage.getItem("celk_relatorio_data") ||
        new Date().toLocaleDateString("pt-BR")
    )}
</div>

<div class="info">
    <b>Total de pacientes:</b>
    ${pacientes.length}
</div>

<table>

<thead>

<tr>
    <th>Nº</th>
    <th>Nome</th>
    <th>Idade</th>
    <th>Classificação</th>
    <th>Chegada</th>
</tr>

</thead>

<tbody>
`;

    if(!pacientes.length){

        html += `
<tr>
    <td colspan="5">
        NENHUM PACIENTE REGISTRADO.
    </td>
</tr>
`;

    }else{

        pacientes.forEach(function(paciente){

            const classificacao =
                paciente.classificacao ||
                "NÃO IDENTIFICADA";

            const cor =
                obterCorClassificacaoRelatorio(
                    classificacao
                );

            html += `
<tr>

    <td>
        ${escaparHtmlRelatorio(
            paciente.numero
        )}
    </td>

    <td class="nome">
        ${escaparHtmlRelatorio(
            paciente.nome
        )}
    </td>

    <td>
        ${escaparHtmlRelatorio(
            paciente.idade
        )}
    </td>

    <td
        class="classificacao"
        style="background:${cor};"
    >
        ${escaparHtmlRelatorio(
            classificacao
        )}
    </td>

    <td>
        ${escaparHtmlRelatorio(
            paciente.chegada
        )}
    </td>


</tr>
`;

        });

    }

    html += `
</tbody>

</table>

<button id="imprimir">
    IMPRIMIR
</button>

<script>

document
    .getElementById("imprimir")
    .addEventListener(
        "click",
        function(){
            window.print();
        }
    );

</script>

</body>

</html>
`;

    aba.document.open();
    aba.document.write(html);
    aba.document.close();

    console.log(
        "[CELK RELATÓRIO V39] RELATÓRIO ABERTO:",
        pacientes.length,
        "pacientes"
    );
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
