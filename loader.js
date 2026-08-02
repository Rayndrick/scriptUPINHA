(function () {

    "use strict";

    const SCRIPT_URL =
        "https://raw.githubusercontent.com/Rayndrick/scriptUPINHA/main/script.js";

    const CACHE_KEY = "celk-helper-cache";
    const CACHE_TIME = 1000 * 60 * 60 * 6; // 6 horas

    async function baixarScript() {

        const res = await fetch(
            SCRIPT_URL + "?v=" + Date.now(),
            { cache: "no-store" }
        );

        if (!res.ok)
            throw new Error("Erro " + res.status);

        return await res.text();
    }

    function salvarCache(codigo) {

        localStorage.setItem(
            CACHE_KEY,
            JSON.stringify({
                data: Date.now(),
                codigo
            })
        );

    }

    function lerCache() {

        try {

            const obj = JSON.parse(
                localStorage.getItem(CACHE_KEY)
            );

            if (!obj)
                return null;

            if (Date.now() - obj.data > CACHE_TIME)
                return null;

            return obj.codigo;

        } catch {

            return null;

        }

    }

    function executar(codigo) {

        new Function(codigo)();

    }

    async function iniciar() {

        try {

            const cache = lerCache();

            if (cache) {

                console.log("CELK Helper: usando cache");

                executar(cache);

            }

            const codigo = await baixarScript();

            salvarCache(codigo);

            executar(codigo);

        }

        catch (e) {

            console.error(e);

            alert("Erro ao carregar CELK Helper");

        }

    }

    iniciar();

})();
