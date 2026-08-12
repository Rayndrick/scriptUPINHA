CELK — MODULO DE RELATORIO ROBUSTO
====================================

ESTE ARQUIVO FOI FEITO PARA CORRIGIR O RELATORIO.

O modulo:
- pre-registra o paciente enquanto ele aparece na CONSULTA DE ATENDIMENTOS;
- captura a cor da pulseira diretamente das classes BALL-RED / BALL-ORANGE / BALL-YELLOW / BALL-GREEN / BALL-BLUE;
- grava nome, idade, classificacao e chegada;
- ao clicar em SALVAR/FINALIZAR ATENDIMENTO, grava o horario de atendimento;
- calcula o tempo;
- abre o RELATORIO em uma janela propria;
- o relatorio atualiza automaticamente;
- mostra a classificacao com a cor correspondente;
- funciona tambem para pacientes ja pre-registrados.

COMO USAR
==========

1. Salve este conteudo como parte do seu script CELK Helper.
2. Se estiver testando pelo Console, cole o bloco JavaScript inteiro.
3. Para o script definitivo, coloque este modulo no final do seu script V34.
4. Recarregue a pagina do CELK.
5. Entre em CONSULTA DE ATENDIMENTOS.
6. O paciente deve aparecer no console como:
   [CELK Helper] PACIENTE PRE-REGISTRADO: NOME => VERDE | CHEGADA: 09:15
7. Ao finalizar o atendimento, deve aparecer:
   [CELK Helper] PACIENTE FINALIZADO: NOME | ATENDIDO: 09:XX | TEMPO: X min
8. Clique em RELATORIO.

IMPORTANTE
==========
Nao apague as outras partes do seu V34. Este arquivo e o MODULO ROBUSTO
DO RELATORIO para ser incorporado ao script atual.

CODIGO
======


// ============================================================
// CELK HELPER — MÓDULO RELATÓRIO ROBUSTO
// PRÉ-REGISTRO + FINALIZAÇÃO + RELATÓRIO EM TEMPO REAL
// ============================================================
(function () {
"use strict";

const CHAVE = "celk_relatorio";
const CHAVE_DATA = "celk_relatorio_data";
const HOJE = new Date().toLocaleDateString("pt-BR");

if (localStorage.getItem(CHAVE_DATA) !== HOJE) {
    localStorage.setItem(CHAVE_DATA, HOJE);
    localStorage.setItem(CHAVE, "[]");
}

window.celkRelatorio = window.celkRelatorio || {};

function ler() {
    try {
        const v = JSON.parse(localStorage.getItem(CHAVE) || "[]");
        return Array.isArray(v) ? v : [];
    } catch (e) {
        console.error("[CELK RELATÓRIO] Erro lendo registros:", e);
        return [];
    }
}

function salvar(lista) {
    localStorage.setItem(CHAVE, JSON.stringify(lista));
    localStorage.setItem(CHAVE_DATA, HOJE);
    if (window.celkRelatorioWindow && !window.celkRelatorioWindow.closed) {
        try {
            window.celkRelatorioWindow.postMessage({
                tipo: "CELK_RELATORIO_ATUALIZAR",
                lista: lista
            }, "*");
        } catch (e) {}
    }
}

function norm(s) {
    return (s || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .toUpperCase();
}

function agora() {
    return new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit"
    });
}

function texto(el) {
    return (el?.innerText || el?.textContent || "")
        .replace(/\s+/g, " ")
        .trim();
}

function encontrarNomePaciente() {
    // Cabeçalho da tela de atendimento
    const candidatos = [
        ...document.querySelectorAll("h1,h2,h3,h4,div,span,label")
    ];

    for (const el of candidatos) {
        const t = texto(el);
        if (!t || t.length < 5 || t.length > 120) continue;

        // Formato observado no CELK:
        // NOME | idade | DN:
        if (/\|\s*\d+\s*(?:ano|anos|mês|meses|dia|dias)/i.test(t)) {
            const nome = t.split("|")[0].trim();
            if (nome && nome.length >= 4 && !/^(ATENDIMENTO|PACIENTE)$/i.test(nome)) {
                return nome.toUpperCase();
            }
        }
    }

    // Fallback por rótulos
    const body = document.body?.innerText || "";
    const m = body.match(/(?:PACIENTE|NOME)\s*[:\-]\s*([A-ZÁÀÂÃÉÊÍÓÔÕÚÇ][A-ZÁÀÂÃÉÊÍÓÔÕÚÇ ]{3,})/i);
    return m ? m[1].replace(/\s+/g, " ").trim().toUpperCase() : "";
}

function idadeDoTexto(t) {
    const m = t.match(/\|\s*([^|]+?)\s*\|\s*DN\s*:/i);
    return m ? m[1].trim() : "";
}

function encontrarDadosCabecalho() {
    const els = [...document.querySelectorAll("div,span,h1,h2,h3,h4")];
    for (const el of els) {
        const t = texto(el);
        if (!t || t.length > 250) continue;
        if (/\|\s*\d+\s*(?:ano|anos|mês|meses|dia|dias)/i.test(t) && /DN\s*:/i.test(t)) {
            return {
                nome: t.split("|")[0].trim().toUpperCase(),
                idade: idadeDoTexto(t)
            };
        }
    }
    return null;
}

function classificacaoPorElemento(el) {
    if (!el) return "";
    const classes = [
        ...el.classList,
        ...[...el.querySelectorAll("[class]")].flatMap(x => [...x.classList])
    ].map(norm);

    const mapa = [
        ["BALL-RED", "VERMELHO"],
        ["BALL-ORANGE", "LARANJA"],
        ["BALL-YELLOW", "AMARELO"],
        ["BALL-GREEN", "VERDE"],
        ["BALL-BLUE", "AZUL"],
        ["BALL-WHITE", "BRANCO"]
    ];

    for (const [classe, valor] of mapa) {
        if (classes.includes(classe)) return valor;
    }
    return "";
}

function capturarClassificacaoDoRow(row) {
    if (!row) return "";
    const alvos = [
        row,
        ...row.querySelectorAll("div,span,td")
    ];
    for (const el of alvos) {
        const c = classificacaoPorElemento(el);
        if (c) return c;
    }
    return "";
}

function extrairHorario(textoRow) {
    const m = textoRow.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/);
    return m ? `${m[1].padStart(2,"0")}:${m[2]}` : "";
}

function encontrarNomeNaLinha(row) {
    const textoRow = texto(row);
    if (!textoRow) return "";

    const celulas = [...row.querySelectorAll("td,th")];
    for (const td of celulas) {
        const t = texto(td);
        if (!t || t.length < 4) continue;

        // Evita células de ícones, idade, horário etc.
        if (/\d{1,2}:\d{2}/.test(t)) continue;
        if (/^\d+\s*(ano|anos|mes|meses|dia|dias)/i.test(t)) continue;
        if (/UP1|ATENDIMENTO|PEDIATRA|CLINICA/i.test(t) && t.length < 60) continue;

        // Nome geralmente é a célula com várias letras e poucas pontuações
        const letras = (t.match(/[A-ZÁÀÂÃÉÊÍÓÔÕÚÇ]/gi) || []).length;
        if (letras >= 5 && t.length <= 100) {
            return t.toUpperCase();
        }
    }
    return "";
}

function preRegistrar(dados) {
    if (!dados?.nome) return false;

    const nome = norm(dados.nome);
    let lista = ler();

    let item = lista.find(p => norm(p.nome) === nome);

    if (!item) {
        item = {
            id: `${nome}|${HOJE}`,
            numero: lista.length + 1,
            nome: dados.nome,
            idade: dados.idade || "",
            classificacao: dados.classificacao || "NÃO IDENTIFICADA",
            chegada: dados.chegada || agora(),
            atendido: "",
            tempo: "",
            finalizado: false,
            criadoEm: Date.now()
        };
        lista.push(item);
        salvar(lista);
        console.log(
            "[CELK Helper] PACIENTE PRÉ-REGISTRADO:",
            item.nome,
            "=>",
            item.classificacao,
            "| CHEGADA:",
            item.chegada
        );
        return true;
    }

    let alterou = false;

    if (dados.idade && !item.idade) {
        item.idade = dados.idade;
        alterou = true;
    }

    if (dados.classificacao &&
        dados.classificacao !== "NÃO IDENTIFICADA" &&
        (!item.classificacao || item.classificacao === "NÃO IDENTIFICADA")) {
        item.classificacao = dados.classificacao;
        alterou = true;
    }

    if (dados.chegada && !item.chegada) {
        item.chegada = dados.chegada;
        alterou = true;
    }

    if (alterou) salvar(lista);
    return false;
}

function atualizarFinalizacao(nome) {
    if (!nome) return false;

    const nomeN = norm(nome);
    const lista = ler();
    const item = lista.find(p => norm(p.nome) === nomeN);

    if (!item) {
        console.warn(
            "[CELK Helper] FINALIZAÇÃO: paciente não estava pré-registrado:",
            nome
        );
        return false;
    }

    if (!item.atendido) {
        item.atendido = agora();
    }

    if (item.chegada) {
        const [h1,m1] = item.chegada.split(":").map(Number);
        const [h2,m2] = item.atendido.split(":").map(Number);

        if (Number.isFinite(h1) && Number.isFinite(m1) &&
            Number.isFinite(h2) && Number.isFinite(m2)) {
            let minutos = (h2*60+m2) - (h1*60+m1);
            if (minutos < 0) minutos += 24*60;
            item.tempo = `${minutos} min`;
        }
    }

    item.finalizado = true;
    item.finalizadoEm = Date.now();

    salvar(lista);

    console.log(
        "[CELK Helper] PACIENTE FINALIZADO:",
        item.nome,
        "| ATENDIDO:",
        item.atendido,
        "| TEMPO:",
        item.tempo
    );

    return true;
}

function capturarListaCELK() {
    const linhas = [...document.querySelectorAll("tr")];

    let encontrados = 0;

    for (const row of linhas) {
        const classe = capturarClassificacaoDoRow(row);
        if (!classe) continue;

        const nome = encontrarNomeNaLinha(row);
        if (!nome) continue;

        const t = texto(row);
        const chegada = extrairHorario(t);

        let idade = "";
        const idadeM = t.match(/\b(\d+\s*(?:ano|anos|mes|meses|dia|dias)(?:\s*e\s*\d+\s*(?:mes|meses|dia|dias))?)/i);
        if (idadeM) idade = idadeM[1];

        preRegistrar({
            nome,
            idade,
            classificacao: classe,
            chegada
        });

        encontrados++;

        console.log(
            "[CELK Helper] CLASSIFICAÇÃO CAPTURADA:",
            nome,
            "=>",
            classe
        );
    }

    return encontrados;
}

function iniciarCapturaLista() {
    capturarListaCELK();

    if (window.celkRelatorio.listaTimer) {
        clearInterval(window.celkRelatorio.listaTimer);
    }

    window.celkRelatorio.listaTimer = setInterval(() => {
        if (location.href.includes("defaultConsultaAtendimento")) {
            capturarListaCELK();
        }
    }, 1000);
}

function encontrarBotaoFinalizar() {
    const candidatos = [
        ...document.querySelectorAll("a,button,input,div,span")
    ];

    return candidatos.find(el => {
        const t = norm(
            el.innerText ||
            el.value ||
            el.title ||
            el.getAttribute("alt") ||
            ""
        );

        const cls = norm(el.className || "");

        return (
            t.includes("SALVAR ATENDIMENTO") ||
            t.includes("FINALIZAR ATENDIMENTO") ||
            cls.includes("FINALIZAR-PRONTUARIO")
        );
    }) || null;
}

function instalarMonitorFinalizacao() {
    if (!location.href.includes("/atendimento/prontuario/")) return;

    const dadosCab = encontrarDadosCabecalho();
    if (dadosCab?.nome) {
        const existente = ler().find(p => norm(p.nome) === norm(dadosCab.nome));
        if (existente) {
            preRegistrar({
                nome: dadosCab.nome,
                idade: dadosCab.idade
            });
        }
    }

    if (window.celkRelatorio.finalizacaoMonitor) {
        clearInterval(window.celkRelatorio.finalizacaoMonitor);
    }

    window.celkRelatorio.finalizacaoMonitor = setInterval(() => {

        const botao = encontrarBotaoFinalizar();

        if (!botao) return;

        if (botao.dataset.celkRelatorioMonitorado === "1") return;

        botao.dataset.celkRelatorioMonitorado = "1";

        console.log(
            "[CELK Helper] BOTÃO DE FINALIZAÇÃO ENCONTRADO:",
            texto(botao) || botao.value || botao.title
        );

        botao.addEventListener("click", () => {

            const paciente = encontrarDadosCabecalho();
            const nome = paciente?.nome || encontrarNomePaciente();

            console.log(
                "[CELK Helper] CLIQUE EM FINALIZAR:",
                nome
            );

            // Aguarda o CELK concluir o salvamento.
            setTimeout(() => {
                atualizarFinalizacao(nome);
            }, 700);

            // Segunda tentativa para páginas que demoram a mudar.
            setTimeout(() => {
                atualizarFinalizacao(nome);
            }, 1800);

        }, true);

    }, 500);
}

function abrirRelatorio() {

    if (
        window.celkRelatorioWindow &&
        !window.celkRelatorioWindow.closed
    ) {
        window.celkRelatorioWindow.focus();
        return;
    }

    const win = window.open("about:blank", "CELK_RELATORIO_PLANTAO");

    if (!win) {
        alert("O navegador bloqueou a abertura do relatório. Permita pop-ups para o CELK.");
        return;
    }

    window.celkRelatorioWindow = win;

    win.document.open();
    win.document.write(`
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Relatório do Plantão</title>
<style>
body{
    font-family:Arial,Helvetica,sans-serif;
    margin:30px;
    color:#111;
}
h1{
    font-size:26px;
    margin:0 0 8px;
}
.info{
    font-size:16px;
    margin-bottom:20px;
}
table{
    width:100%;
    border-collapse:collapse;
    font-size:16px;
}
th,td{
    border:1px solid #ccc;
    padding:10px 8px;
    text-align:center;
}
th{
    background:#f1f1f1;
}
td.nome{
    text-align:left;
    font-weight:500;
}
.pulseira{
    font-weight:bold;
}
.verde{background:#d9f2d9;}
.amarelo{background:#fff1b8;}
.laranja{background:#ffd5b0;}
.vermelho{background:#ffc4c4;}
.azul{background:#cfe1ff;}
.branco{background:#fff;}
.nao{background:#f5f5f5;color:#666;}
</style>
</head>
<body>
<h1>RELATÓRIO DO PLANTÃO</h1>
<div id="info" class="info"></div>
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
<tbody id="corpo"></tbody>
</table>
<script>
function render(lista){
    const corpo=document.getElementById("corpo");
    const info=document.getElementById("info");

    lista=Array.isArray(lista)?lista:[];

    info.innerHTML =
        "Data: " + ${JSON.stringify(HOJE)} +
        "<br>Total de pacientes: " + lista.length;

    corpo.innerHTML="";

    lista.forEach((p,i)=>{
        const tr=document.createElement("tr");

        const cls=(p.classificacao||"NÃO IDENTIFICADA")
            .toUpperCase();

        let classe="nao";

        if(cls==="VERDE") classe="verde";
        if(cls==="AMARELO") classe="amarelo";
        if(cls==="LARANJA") classe="laranja";
        if(cls==="VERMELHO") classe="vermelho";
        if(cls==="AZUL") classe="azul";
        if(cls==="BRANCO") classe="branco";

        tr.innerHTML=
            "<td>"+(i+1)+"</td>"+
            "<td class='nome'>"+(p.nome||"")+"</td>"+
            "<td>"+(p.idade||"")+"</td>"+
            "<td class='pulseira "+classe+"'>"+cls+"</td>"+
            "<td>"+(p.chegada||"")+"</td>"+
            "<td>"+(p.atendido||"")+"</td>"+
            "<td>"+(p.tempo||"")+"</td>";

        corpo.appendChild(tr);
    });
}

window.addEventListener("message",function(e){
    if(e.data && e.data.tipo==="CELK_RELATORIO_ATUALIZAR"){
        render(e.data.lista);
    }
});

render(JSON.parse(localStorage.getItem("celk_relatorio")||"[]"));

setInterval(()=>{
    try{
        render(JSON.parse(localStorage.getItem("celk_relatorio")||"[]"));
    }catch(e){}
},1000);
<\/script>
</body>
</html>
`);

    win.document.close();

    console.log(
        "[CELK Helper] RELATÓRIO ABERTO:",
        ler()
    );
}

window.celkRelatorio.abrir = abrirRelatorio;
window.celkRelatorio.ler = ler;
window.celkRelatorio.salvar = salvar;
window.celkRelatorio.preRegistrar = preRegistrar;
window.celkRelatorio.finalizar = atualizarFinalizacao;
window.celkRelatorio.capturarLista = capturarListaCELK;

if (location.href.includes("defaultConsultaAtendimento")) {
    iniciarCapturaLista();
}

if (location.href.includes("/atendimento/prontuario/")) {
    instalarMonitorFinalizacao();
}

console.log(
    "[CELK RELATÓRIO ROBUSTO] ATIVO — PRÉ-REGISTRO + FINALIZAÇÃO + RELATÓRIO"
);

})();
