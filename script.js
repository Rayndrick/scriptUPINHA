/*
=========================================================
CELK — HELPER FINAL — BOTÃO EVASÃO
=========================================================

IMPORTANTE:
Este bloco foi feito para corrigir a versão que já está
carregada na página.

Ele NÃO usa o seletor quebrado:
#form:btnFinalizarProntuario

O botão correto do CELK é localizado por:
a.btn-finalizar-prontuario

FLUXO:
EVASÃO
→ preencher evolução
→ selecionar EVASÃO
→ aguardar Wicket
→ confirmar que EVASÃO permaneceu
→ clicar em Salvar Atendimento
=========================================================
*/

(function(){

"use strict";

window.celkEvasaoCorrecao = true;

function normalizar(txt){
    return String(txt || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g,"")
        .replace(/[^A-Z0-9\s]/gi," ")
        .replace(/\s+/g," ")
        .trim()
        .toUpperCase();
}

function localizarEncaminhamento(){

    const porName = document.querySelector(
        'select[name*="eloNaturezaTipoEncaminhamento"]'
    );

    if(
        porName &&
        [...porName.options].some(o =>
            normalizar(o.textContent).includes("EVASAO")
        )
    ){
        return porName;
    }

    const selects = [...document.querySelectorAll("select")];

    return selects.find(select =>
        [...select.options].some(o =>
            normalizar(o.textContent).includes("EVASAO")
        )
    ) || null;
}

async function selecionarEvasao(){

    const inicio = Date.now();

    while(Date.now() - inicio < 10000){

        const select = localizarEncaminhamento();

        if(select){

            const opcao = [...select.options].find(o =>
                normalizar(o.textContent).includes("EVASAO")
            );

            if(opcao){

                const setter =
                    Object.getOwnPropertyDescriptor(
                        HTMLSelectElement.prototype,
                        "value"
                    )?.set;

                if(setter){
                    setter.call(select, opcao.value);
                }else{
                    select.value = opcao.value;
                }

                select.selectedIndex = opcao.index;

                [...select.options].forEach(o => {
                    o.selected = o === opcao;
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
                }catch(e){}

                select.dispatchEvent(
                    new Event("blur",{bubbles:true})
                );

                console.log(
                    "[CELK EVASÃO] EVASÃO selecionada:",
                    select.value,
                    opcao.textContent.trim()
                );

                return true;
            }
        }

        await new Promise(r => setTimeout(r,250));
    }

    console.error(
        "[CELK EVASÃO] Não consegui encontrar a opção EVASÃO."
    );

    return false;
}

function preencherEvolucao(){

    /*
    Se a função original do Helper já existir,
    reutilizamos ela porque ela já conhece o TinyMCE
    utilizado pelo CELK.
    */

    if(typeof window.preencherEvolucaoEvasao === "function"){

        try{
            return window.preencherEvolucaoEvasao();
        }catch(e){
            console.error(
                "[CELK EVASÃO] Erro na função original:",
                e
            );
        }
    }

    /*
    Fallback: procura o TinyMCE do documento.
    */

    try{

        if(
            window.tinymce &&
            typeof window.tinymce.get === "function"
        ){

            const editores = window.tinymce.editors || [];

            const editor =
                editores.find(e =>
                    e &&
                    e.getBody &&
                    e.getBody()
                );

            if(editor){

                const html =
`<p style="text-align:center;"><strong><em>—----------------------------------- EVASÃO —---------------------------</em></strong></p>
<p>PACIENTE CHAMADO NO PAINEL 3X E PESSOALMENTE, MAS NÃO COMPARECEU. EVASÃO</p>
<p>CID: Z532</p>
<p>—---------------------------------------------------------------------------</p>`;

                editor.setContent(html);

                try{
                    editor.fire("change");
                }catch(e){}

                try{
                    editor.save();
                }catch(e){}

                console.log(
                    "[CELK EVASÃO] Texto inserido na evolução."
                );

                return true;
            }
        }

    }catch(e){
        console.error(
            "[CELK EVASÃO] Erro no fallback do TinyMCE:",
            e
        );
    }

    alert(
        "Não consegui localizar o editor da evolução."
    );

    return false;
}

function localizarSalvar(){

    /*
    ESTE É O SELETOR CORRETO OBSERVADO NO CELK:
    a.btn-finalizar-prontuario
    */

    const botao =
        document.querySelector(
            "a.btn-finalizar-prontuario"
        );

    if(botao){
        return botao;
    }

    /*
    Fallback pelo texto/título.
    */

    const candidatos = [
        ...document.querySelectorAll("a"),
        ...document.querySelectorAll("button"),
        ...document.querySelectorAll(
            'input[type="button"], input[type="submit"]'
        )
    ];

    return candidatos.find(el => {

        const texto = normalizar(
            el.innerText ||
            el.value ||
            el.title ||
            el.getAttribute("title") ||
            ""
        );

        const classe =
            String(el.className || "")
                .toLowerCase();

        return (
            classe.includes("btn-finalizar-prontuario") ||
            texto.includes("SALVAR O ATENDIMENTO") ||
            texto.includes("SALVAR ATENDIMENTO") ||
            texto.includes("FINALIZAR PRONTUÁRIO") ||
            texto.includes("FINALIZAR PRONTUARIO")
        );

    }) || null;
}

async function executarEvasaoCorrigida(){

    const ok = window.confirm(
        "REGISTRAR EVASÃO?\n\n" +
        "O sistema irá:\n" +
        "1. Inserir a evolução de evasão;\n" +
        "2. Selecionar EVASÃO no encaminhamento;\n" +
        "3. Finalizar o atendimento.\n\n" +
        "Deseja continuar?"
    );

    if(!ok){
        return;
    }

    console.log(
        "[CELK EVASÃO] Iniciando fluxo..."
    );

    const evolucao = preencherEvolucao();

    if(evolucao === false){
        console.error(
            "[CELK EVASÃO] Não foi possível preencher a evolução."
        );
        return;
    }

    await new Promise(r => setTimeout(r,700));

    const selecionou =
        await selecionarEvasao();

    if(!selecionou){
        alert(
            "A evolução foi preenchida, mas não consegui selecionar EVASÃO.\n\n" +
            "O atendimento NÃO foi finalizado."
        );
        return;
    }

    /*
    Aguarda o Wicket reconstruir o select.
    */
    await new Promise(r => setTimeout(r,1200));

    /*
    Reaplica EVASÃO após possível reconstrução.
    */
    const selecionouNovamente =
        await selecionarEvasao();

    if(!selecionouNovamente){
        alert(
            "Não consegui confirmar EVASÃO após a atualização do CELK.\n\n" +
            "O atendimento NÃO foi finalizado."
        );
        return;
    }

    await new Promise(r => setTimeout(r,800));

    const salvar = localizarSalvar();

    if(!salvar){

        console.error(
            "[CELK EVASÃO] Botão Salvar Atendimento não encontrado."
        );

        alert(
            "EVASÃO foi preenchida e selecionada, " +
            "mas o botão Salvar Atendimento não foi encontrado.\n\n" +
            "O atendimento NÃO foi finalizado."
        );

        return;
    }

    console.log(
        "[CELK EVASÃO] Botão encontrado:",
        salvar
    );

    /*
    Última confirmação automática:
    o select precisa estar em EVASÃO.
    */

    const selectFinal =
        localizarEncaminhamento();

    const evasaoFinal =
        selectFinal &&
        [...selectFinal.options].some(o =>
            o.selected &&
            normalizar(o.textContent).includes("EVASAO")
        );

    if(!evasaoFinal){

        console.error(
            "[CELK EVASÃO] EVASÃO não permaneceu selecionada."
        );

        alert(
            "EVASÃO não permaneceu selecionada no CELK.\n\n" +
            "O atendimento NÃO foi finalizado."
        );

        return;
    }

    console.log(
        "[CELK EVASÃO] Tudo pronto. Salvando atendimento..."
    );

    /*
    CLICA NO BOTÃO REAL DO CELK.
    */
    salvar.click();
}

/*
---------------------------------------------------------
LOCALIZA O BOTÃO EVASÃO JÁ EXISTENTE
---------------------------------------------------------
*/

function instalarBotao(){

    const botoes = [
        ...document.querySelectorAll("div"),
        ...document.querySelectorAll("a"),
        ...document.querySelectorAll("button")
    ];

    const botao = botoes.find(el => {
        const texto = normalizar(el.innerText || "");
        return texto === "EVASAO" || texto.includes("EVASAO");
    });

    if(!botao){
        return false;
    }

    /*
    Remove qualquer comportamento antigo.
    */
    botao.onclick = null;

    /*
    Impede handlers antigos diretamente associados.
    */
    if(botao.dataset.celkEvasaoCorrigido === "1"){
        return true;
    }

    botao.dataset.celkEvasaoCorrigido = "1";

    botao.addEventListener(
        "click",
        function(e){
            e.preventDefault();
            e.stopImmediatePropagation();

            executarEvasaoCorrigida().catch(err => {
                console.error("[CELK EVASÃO] Erro no fluxo:", err);
                alert("Ocorreu um erro ao executar a EVASÃO. O atendimento NÃO foi finalizado.");
            });
        },
        true
    );

    botao.title =
        "Registrar EVASÃO e finalizar atendimento";

    botao.style.cursor = "pointer";

    console.log(
        "[CELK EVASÃO] Botão EVASÃO corrigido e pronto."
    );

    return true;
}

/*
O CELK pode recriar a barra.
Por isso tentamos por alguns segundos.
*/

(function tentar(){

    if(instalarBotao()){
        return;
    }

    setTimeout(tentar,500);

})();

})();
