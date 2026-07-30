(async () => {

    const BASE = "https://raw.githubusercontent.com/Rayndrick/scriptUPINHA/main/";

    try {

        const resposta = await fetch(BASE + "core.js?v=" + Date.now());

        if (!resposta.ok)
            throw new Error("Erro ao baixar o core.js");

        const codigo = await resposta.text();

        new Function(codigo)();

    } catch (erro) {

        console.error("CELK Helper:", erro);
        alert("Erro ao carregar o CELK Helper.");

    }

})();
