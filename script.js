(function () {

'use strict';

if (window.celkHelperLoaded) {
    return;
}

window.celkHelperLoaded = true;
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

function iniciar(){

    criarInterface();

}

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


painel.appendChild(relatorio);
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

if(mAlergia){

    const valor = mAlergia[1].trim();

    if(
        valor &&
        !/^(NEGA|NENHUMA|NÃO|NAO)$/i.test(valor)
    ){
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

let chegada = "";

const mTriagem = tela.match(
/TRIAGEM[\s\S]*?([0-9]{2}\/[0-9]{2}\/[0-9]{4})\s*-\s*([0-9]{2}:[0-9]{2})/i
);

if(mTriagem){

    chegada = mTriagem[2];

}

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
adicionarRelatorio(
    nome,
    idade,
    chegada
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

function adicionarRelatorio(nome, idade, chegada){

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
function abrirRelatorio(){
    function abrirMenuCID(){

    alert("Menu CID funcionando");

}

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

        html+=`
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

    html+=`
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
    iniciarReceituario();
function iniciarObserver(){

    let timerObserver;

const observer = new MutationObserver(() => {

    clearTimeout(timerObserver);

    timerObserver = setTimeout(() => {

        if(
    !window.celkHelperBar ||
    !document.body.contains(window.celkHelperBar)
){
    criarInterface();
}

if(
    !window.celkReceita ||
    !document.body.contains(window.celkReceita)
){
    criarCampoPrescricao();
}

    },150);

});

function iniciarObserver(){

    setInterval(() => {

        if (!document.getElementById("celk-helper")) {

            console.log("Reconstruindo barra...");

            criarInterface();

        }

        if (
            typeof tinymce !== "undefined" &&
            tinymce.activeEditor &&
            !document.getElementById("celk-prescricao-ped")
        ) {

            console.log("Reconstruindo prescrição...");

            criarCampoPrescricao();

        }

    },300);
iniciar();
iniciarObserver();
}

//--------------------------------------------------
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

    const editor=tinymce.activeEditor;

    if(!editor) return;

    editor.focus();

    editor.insertContent(texto);

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

})();


