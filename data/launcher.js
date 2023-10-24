const t = function(g){return document.createElement(g)};
const h = document.querySelector("head");

let pcfg;
let x = new XMLHttpRequest();
x.open("GET","/config/plugin.json",false);
x.send();
pcfg = JSON.parse(x.responseText);
if(pcfg === null){
    err("Not Found plugin.json");
    
}

for(let s = 0;s < pcfg.script.length;++s){
    let atd = t("script");
    atd.setAttribute("src",pcfg.script[s]);
    h.appendChild(atd);
}
for(let s = 0;s < pcfg.module.length;++s){
    let scr = t("script");
    scr.setAttribute("src",pcfg.module[s]);
    scr.setAttribute("type","module");
    h.appendChild(scr);
}
for(let s = 0;s < pcfg.css.length;++s){
    let nst = t("link");
    nst.setAttribute("href",pcfg.css[s]);
    nst.setAttribute("rel","stylesheet");
    nst.setAttribute("type","text/css");
    h.appendChild(nst);
}