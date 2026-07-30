(async () => {

    const url = "https://raw.githubusercontent.com/Rayndrick/scriptUPINHA/main/core.js";

    const codigo = await fetch(url + "?v=" + Date.now()).then(r => r.text());

    new Function(codigo)();

})();
