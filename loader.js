(function () {

"use strict";

const LINKS = [
    "https://raw.githubusercontent.com/Rayndrick/scriptUPINHA/main/script.js"
];

const CACHE_KEY = "fetcher:" + btoa(LINKS.join("|"));
const CACHE_MAX_AGE_MS = 1000 * 60 * 60 * 11;

function run(code, link){

    console.log("[CELK] Executando", link);

    const s = document.createElement("script");
    s.textContent = code;
    document.documentElement.appendChild(s);
    s.remove();

}

function readCache(storage){

    try{

        const raw = storage.getItem(CACHE_KEY);

        if(!raw) return null;

        return JSON.parse(raw);

    }catch{

        return null;

    }

}

function writeCache(code, link){

    const payload = {

        code,
        link,
        savedAt: Date.now()

    };

    try{

        localStorage.setItem(
            CACHE_KEY,
            JSON.stringify(payload)
        );

    }catch{}

}

function cacheExpired(c){

    if(!c) return true;

    return Date.now()-c.savedAt > CACHE_MAX_AGE_MS;

}

async function fetchFresh(){

    for(const link of LINKS){

        const r = await fetch(
            link + "?v=" + Date.now(),
            {cache:"no-store"}
        );

        if(!r.ok) continue;

        const code = await r.text();

        writeCache(code,link);

        run(code,link);

        return;

    }

}

async function load(){

    const cache =
        readCache(localStorage) ||
        readCache(sessionStorage);

    if(cache && !cacheExpired(cache)){

        run(cache.code,cache.link);

    }

    try{

        await fetchFresh();

    }catch(e){

        console.error(e);

    }

}

window.fetcher = {

    load,

    refresh:fetchFresh,

    info(){

        console.log(readCache(localStorage));

    }

};

load();

})();
