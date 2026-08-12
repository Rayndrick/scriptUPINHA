CELK HELPER — CORREÇÃO DEFINITIVA DO RELATÓRIO / COMUNICAÇÃO COM ABOUT:BLANK
VERSÃO: V34-R1

IMPORTANTE:
Este arquivo é um PATCH para o seu V34 atual. Ele não substitui as outras funções do seu
script (Atendimento, CID, Atestado, Declaração, NEWS, prescrição etc.).

A correção faz 3 coisas:
1. O relatório é aberto pelo botão Relatório já com os dados atuais, sem depender do
   localStorage próprio do about:blank.
2. A janela do relatório consulta o localStorage da janela CELK (opener) quando possível.
3. O paciente é pré-registrado e, quando aparecer "Atendimento finalizado com sucesso",
   o horário de finalização é atualizado.

TAMBÉM:
- O botão Atualizar inicia em 0 segundos nesta versão.
- As classificações usam:
  ball-green  = VERDE
  ball-yellow = AMARELO
  ball-orange = LARANJA
  ball-red    = VERMELHO
  ball-blue   = AZUL

============================================================
1) NO TOPO DO SCRIPT
============================================================

TROQUE:

const CONFIG = {
    refreshSeconds: Number(
        localStorage.getItem("celk_refresh") || 5
    )
};

POR:

const CONFIG = {
    refreshSeconds: 0
};

localStorage.setItem("celk_refresh", "0");

============================================================
2) SUBSTITUA A FUNÇÃO obterClassificacao()
============================================================

function obterClassificacao(){
    const elementos = Array.from(
        document.querySelectorAll(
            'div.icon32[class*="ball-"], div[class*="icon32"][class*="ball-"]'
        )
    );

    const visiveis = elementos.filter(el => {
        const s = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        return (
            s.display !== "none" &&
            s.visibility !== "hidden" &&
            r.width > 0 &&
            r.height > 0
        );
    });

    const lista = visiveis.length ? visiveis : elementos;

    const elemento =
        lista.find(el => {
            const cls = String(el.className || "").toLowerCase();
            return (
                cls.includes("ball-red") ||
                cls.includes("ball-orange") ||
                cls.includes("ball-yellow") ||
                cls.includes("ball-green") ||
                cls.includes("ball-blue")
            );
        }) || lista[0];

    if(!elemento){
        return "NÃO IDENTIFICADA";
    }

    const classes = String(elemento.className || "").toLowerCase();

    if(classes.includes("ball-red")) return "VERMELHO";
    if(classes.includes("ball-orange")) return "LARANJA";
    if(classes.includes("ball-yellow")) return "AMARELO";
    if(classes.includes("ball-green")) return "VERDE";
    if(classes.includes("ball-blue")) return "AZUL";

    const texto = (
        elemento.textContent ||
        elemento.getAttribute("title") ||
        elemento.getAttribute("aria-label") ||
        ""
    ).toUpperCase();

    if(/VERMELHO|RED/.test(texto)) return "VERMELHO";
    if(/LARANJA|ORANGE/.test(texto)) return "LARANJA";
    if(/AMARELO|YELLOW/.test(texto)) return "AMARELO";
    if(/VERDE|GREEN/.test(texto)) return "VERDE";
    if(/AZUL|BLUE/.test(texto)) return "AZUL";

    return "NÃO IDENTIFICADA";
}

============================================================
3) SUBSTITUA adicionarRelatorio() POR ESTA VERSÃO
============================================================

function obterListaRelatorio(){
    try{
        const valor = localStorage.getItem("celk_relatorio");
        const lista = valor ? JSON.parse(valor) : [];
        return Array.isArray(lista) ? lista : [];
    }catch(e){
        console.error("[CELK RELATÓRIO] erro ao ler lista:", e);
        return [];
    }
}

function salvarListaRelatorio(lista){
    localStorage.setItem(
        "celk_relatorio",
        JSON.stringify(lista)
    );

    localStorage.setItem(
        "celk_relatorio_data",
        new Date().toLocaleDateString("pt-BR")
    );

    // Atualiza uma eventual janela de relatório aberta pelo Helper.
    try{
        if(window.celkRelatorioWindow && !window.celkRelatorioWindow.closed){
            window.celkRelatorioWindow.postMessage(
                {
                    tipo:"CELK_RELATORIO_ATUALIZAR",
                    lista:lista
                },
                "*"
            );
        }
    }catch(e){}
}

function normalizarNomeRelatorio(nome){
    return String(nome || "")
        .replace(/\s+/g," ")
        .trim()
        .toUpperCase();
}

function adicionarRelatorio(nome, idade, chegada, classificacao){
    nome = normalizarNomeRelatorio(nome);

    if(!nome || nome === "PACIENTE"){
        console.warn("[CELK RELATÓRIO] nome inválido:", nome);
        return null;
    }

    const lista = obterListaRelatorio();

    const existente = lista.find(p =>
        normalizarNomeRelatorio(p.nome) === nome &&
        String(p.chegada || "") === String(chegada || "")
    );

    if(existente){
        // Atualiza a classificação se anteriormente estava desconhecida.
        if(
            classificacao &&
            classificacao !== "NÃO IDENTIFICADA"
        ){
            existente.classificacao = classificacao;
        }

        salvarListaRelatorio(lista);

        console.log(
            "[CELK RELATÓRIO] PACIENTE JÁ EXISTIA:",
            nome
        );

        return existente;
    }

    const agora = new Date();

    const registro = {
        numero: lista.length + 1,
        nome: nome,
        idade: idade || "",
        classificacao:
            classificacao || "NÃO IDENTIFICADA",
        chegada: chegada || "",
        atendido: "",
        tempo: "",
        finalizado: false,
        criadoEm: agora.toISOString()
    };

    lista.push(registro);
    salvarListaRelatorio(lista);

    console.log(
        "[CELK RELATÓRIO] PACIENTE PRÉ-REGISTRADO:",
        nome,
        "=>",
        registro.classificacao,
        "| CHEGADA:",
        registro.chegada
    );

    return registro;
}

============================================================
4) ADICIONE ESTAS FUNÇÕES AO SCRIPT
============================================================

function obterHoraAtual(){
    const d = new Date();

    return (
        d.getHours().toString().padStart(2,"0") +
        ":" +
        d.getMinutes().toString().padStart(2,"0")
    );
}

function calcularTempoRelatorio(chegada, atendido){
    if(!chegada || !atendido){
        return "";
    }

    const a = String(chegada).match(/^(\d{1,2}):(\d{2})$/);
    const b = String(atendido).match(/^(\d{1,2}):(\d{2})$/);

    if(!a || !b){
        return "";
    }

    const inicio =
        Number(a[1]) * 60 +
        Number(a[2]);

    const fim =
        Number(b[1]) * 60 +
        Number(b[2]);

    let minutos = fim - inicio;

    // Caso atravesse meia-noite.
    if(minutos < 0){
        minutos += 24 * 60;
    }

    return minutos + " min";
}

function obterPacienteCabecalhoAtual(){
    const texto = document.body.innerText || "";

    const m = texto.match(
        /([A-ZÁÀÂÃÉÊÍÓÔÕÚÇ][A-ZÁÀÂÃÉÊÍÓÔÕÚÇ ]+?)\s*\|\s*([^|]+?)\s*\|\s*DN:/i
    );

    if(!m){
        return null;
    }

    return {
        nome: normalizarNomeRelatorio(m[1]),
        idade: m[2].trim()
    };
}

function obterChegadaAtual(){
    const texto = document.body.innerText || "";

    const tentativas = [
        /TRIAGEM[\s\S]*?(\d{2}:\d{2})/i,
        /(?:CHEGADA|ENTRADA)[^\d]{0,40}(\d{2}:\d{2})/i,
        /(\d{2}:\d{2})\s*BRT/i
    ];

    for(const re of tentativas){
        const m = texto.match(re);
        if(m){
            return m[1];
        }
    }

    return "";
}

function atualizarFinalizacaoPaciente(nome, horaFinal){
    nome = normalizarNomeRelatorio(nome);

    if(!nome){
        return false;
    }

    const lista = obterListaRelatorio();

    const candidatos = lista.filter(p =>
        normalizarNomeRelatorio(p.nome) === nome
    );

    if(!candidatos.length){
        console.warn(
            "[CELK RELATÓRIO] FINALIZAÇÃO: paciente não encontrado:",
            nome
        );
        return false;
    }

    // Atualiza o último registro ainda não finalizado.
    let registro =
        [...candidatos]
        .reverse()
        .find(p => !p.finalizado);

    if(!registro){
        registro = candidatos[candidatos.length - 1];
    }

    registro.atendido = horaFinal;
    registro.finalizado = true;

    registro.tempo = calcularTempoRelatorio(
        registro.chegada,
        registro.atendido
    );

    salvarListaRelatorio(lista);

    console.log(
        "[CELK RELATÓRIO] FINALIZADO:",
        registro.nome,
        "|",
        registro.atendido,
        "|",
        registro.tempo
    );

    return true;
}

function monitorarFinalizacaoCELK(){
    if(window.celkFinalizacaoObserver){
        window.celkFinalizacaoObserver.disconnect();
    }

    let ultimaChave = "";

    const verificar = () => {
        const texto = (
            document.body.innerText || ""
        ).replace(/\s+/g," ").trim();

        if(!/ATENDIMENTO FINALIZADO COM SUCESSO/i.test(texto)){
            return;
        }

        const paciente =
            window.celkPacienteEmAtendimento ||
            obterPacienteCabecalhoAtual();

        if(!paciente?.nome){
            console.warn(
                "[CELK RELATÓRIO] FINALIZOU, MAS NÃO IDENTIFIQUEI O PACIENTE."
            );
            return;
        }

        const chave =
            paciente.nome + "|" + obterHoraAtual();

        if(chave === ultimaChave){
            return;
        }

        ultimaChave = chave;

        atualizarFinalizacaoPaciente(
            paciente.nome,
            obterHoraAtual()
        );
    };

    window.celkFinalizacaoObserver =
        new MutationObserver(verificar);

    window.celkFinalizacaoObserver.observe(
        document.body,
        {
            childList:true,
            subtree:true,
            characterData:true
        }
    );

    verificar();

    console.log(
        "[CELK RELATÓRIO] MONITOR DE FINALIZAÇÃO ATIVO."
    );
}

============================================================
5) PRÉ-REGISTRO DO PACIENTE
============================================================

Adicione:

function registrarPacienteAtual(){
    const paciente = obterPacienteCabecalhoAtual();

    if(!paciente){
        return;
    }

    const chegada = obterChegadaAtual();
    const classificacao = obterClassificacao();

    window.celkPacienteEmAtendimento = {
        nome: paciente.nome,
        idade: paciente.idade,
        chegada: chegada,
        classificacao: classificacao
    };

    adicionarRelatorio(
        paciente.nome,
        paciente.idade,
        chegada,
        classificacao
    );
}

============================================================
6) INICIAR O MONITOR
============================================================

Dentro de:

window.celk.init = function(){

adicione:

    monitorarFinalizacaoCELK();

    setTimeout(() => {
        registrarPacienteAtual();
    }, 800);

============================================================
7) ABRIR RELATÓRIO — SUBSTITUIR A FUNÇÃO
============================================================

function abrirRelatorio(){

    const lista = obterListaRelatorio();

    const janela = window.open(
        "",
        "CELK_RELATORIO_PLANTAO",
        "width=1600,height=900"
    );

    if(!janela){
        alert(
            "O navegador bloqueou a janela do relatório. " +
            "Permita pop-ups para o CELK."
        );
        return;
    }

    window.celkRelatorioWindow = janela;

    const dadosIniciais =
        JSON.stringify(lista).replace(/</g,"\\u003c");

    janela.document.open();

    janela.document.write(`
<!DOCTYPE html>
<html lang="pt-BR">
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
    margin:0 0 4px 0;
    font-size:25px;
}
.info{
    font-size:16px;
    margin-bottom:20px;
}
table{
    width:100%;
    border-collapse:collapse;
    table-layout:fixed;
}
th,td{
    border:1px solid #cfcfcf;
    padding:9px 7px;
    text-align:center;
}
th{
    background:#f2f2f2;
    font-weight:bold;
}
td.nome{
    text-align:left;
}
.vazio{
    padding:30px;
    text-align:center;
    color:#777;
}
@media print{
    body{
        margin:15px;
    }
}
</style>
</head>

<body>

<h1>RELATÓRIO DO PLANTÃO</h1>

<div class="info">
    Data: <span id="data"></span><br>
    Total de pacientes: <span id="total">0</span>
</div>

<table>
<thead>
<tr>
    <th style="width:4%">Nº</th>
    <th style="width:29%">Nome</th>
    <th style="width:15%">Idade</th>
    <th style="width:17%">Classificação</th>
    <th style="width:10%">Chegada</th>
    <th style="width:10%">Atendido</th>
    <th style="width:9%">Tempo</th>
</tr>
</thead>
<tbody id="corpo"></tbody>
</table>

<script>

let lista = ${dadosIniciais};

function esc(s){
    return String(s ?? "")
        .replace(/&/g,"&amp;")
        .replace(/</g,"&lt;")
        .replace(/>/g,"&gt;")
        .replace(/"/g,"&quot;")
        .replace(/'/g,"&#39;");
}

function classeCor(valor){
    const v = String(valor || "").toUpperCase();

    if(v === "VERDE") return "verde";
    if(v === "AMARELO") return "amarelo";
    if(v === "LARANJA") return "laranja";
    if(v === "VERMELHO") return "vermelho";
    if(v === "AZUL") return "azul";

    return "";
}

function renderizar(){

    document.getElementById("data").textContent =
        new Date().toLocaleDateString("pt-BR");

    document.getElementById("total").textContent =
        lista.length;

    const corpo =
        document.getElementById("corpo");

    corpo.innerHTML = "";

    if(!lista.length){
        corpo.innerHTML =
            '<tr><td colspan="7" class="vazio">NENHUM PACIENTE REGISTRADO</td></tr>';
        return;
    }

    lista.forEach((p,i) => {

        const tr =
            document.createElement("tr");

        const cor =
            classeCor(p.classificacao);

        tr.innerHTML = \`
            <td>\${i+1}</td>
            <td class="nome">\${esc(p.nome)}</td>
            <td>\${esc(p.idade)}</td>
            <td class="\${cor}">\${esc(p.classificacao || "NÃO IDENTIFICADA")}</td>
            <td>\${esc(p.chegada)}</td>
            <td>\${esc(p.atendido)}</td>
            <td>\${esc(p.tempo)}</td>
        \`;

        corpo.appendChild(tr);
    });
}

function receberDados(event){

    if(!event.data){
        return;
    }

    if(event.data.tipo === "CELK_RELATORIO_ATUALIZAR"){
        lista =
            Array.isArray(event.data.lista)
                ? event.data.lista
                : [];

        renderizar();
    }
}

window.addEventListener(
    "message",
    receberDados
);

renderizar();

</script>

<style>
.verde{
    font-weight:bold;
    color:#15803d;
}
.amarelo{
    font-weight:bold;
    color:#a16207;
}
.laranja{
    font-weight:bold;
    color:#ea580c;
}
.vermelho{
    font-weight:bold;
    color:#dc2626;
}
.azul{
    font-weight:bold;
    color:#2563eb;
}
</style>

</body>
</html>
    `);

    janela.document.close();

    // Envia novamente depois que a página terminar de carregar.
    setTimeout(() => {

        try{
            janela.postMessage(
                {
                    tipo:"CELK_RELATORIO_ATUALIZAR",
                    lista:obterListaRelatorio()
                },
                "*"
            );
        }catch(e){}

    },500);

    console.log(
        "[CELK RELATÓRIO] JANELA ABERTA COM",
        lista.length,
        "PACIENTES."
    );
}

============================================================
8) IMPORTANTE SOBRE O SEU TESTE
============================================================

Depois de instalar este patch:

1. RECARREGUE a página do CELK.
2. NÃO use a antiga aba "Relatório do Plantão".
3. Clique no botão:
   📋 Relatório
   criado pelo Helper.
4. O relatório será aberto em uma nova janela.
5. O relatório deve mostrar imediatamente os pacientes existentes.
6. Ao atender um novo paciente:
   - ele será pré-registrado;
   - a classificação será capturada;
   - a chegada será registrada;
   - ao finalizar, apenas "Atendido" e "Tempo" serão preenchidos.

============================================================
9) TESTE NO CONSOLE
============================================================

Para verificar:

JSON.parse(localStorage.getItem("celk_relatorio") || "[]")

Deve mostrar os pacientes.

Para testar a comunicação com o relatório:

console.log(
    "JANELA DO RELATÓRIO:",
    window.celkRelatorioWindow,
    "FECHADA:",
    window.celkRelatorioWindow?.closed
);

Para testar manualmente a finalização:

atualizarFinalizacaoPaciente(
    "NOME EXATO DO PACIENTE",
    "09:30"
);

============================================================
10) OBSERVAÇÃO
============================================================

NÃO apague o restante do V34.

Este patch foi feito especificamente para corrigir a parte do relatório sem
mexer nas demais funções do seu CELK Helper.
