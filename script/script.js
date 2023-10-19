let tmp = undefined;
  

function log(txt){console.log(txt)}
function err(txt){console.error(txt)}

function Get(url){
    let file = new XMLHttpRequest();
    file.open("GET",url,false);
    file.send();
    return file;
}

function LoadPage(main,tmp,page){
    for(let i = 0;i < page.length;++i){
        switch(page[i][0]){
            case ':':
                let ss = page[i].split(':');
                if(ss.length !== 3) {
                    err(i + 1 + " Line :xxx~ define is incorrect");
                    continue;
                }
                let m = document.createElement(ss[1]);
                m.innerText = ss[2];
                while(page.length-1 > i){
                    if(page[i+1].length !== 0){
                        if(page[i + 1][0] === '='){
                            if(page[i+1].split('=').length === 3){
                                i++;
                                ss = page[i].split('=');
                                m.setAttribute(ss[1],ss[2]);
                            }else{break;}
                        }else{break;}
                    }else{break;}
                }
                main.appendChild(m);
                break;
            case ';':
                let rr = page[i].split(';');
                if(rr.length < 3){
                    console.error("err");
                    continue;
                }
                let n = tmp.id.indexOf(rr[1]);
                if(n === -1){
                    err(i + 1 + " Line ;xxx~ define is incorrect");
                    continue;
                }
                let tmps = tmp.temp[n];
                for(let j = 0;j < rr.length - 2;++j){
                    tmps=tmps.replace('%',rr[2+j]);
                }
                LoadPage(main,tmp,tmps.split('\n'));
                break;
            case '<':
                let c = document.createElement("div");
                c.innerHTML = page[i];
                main.appendChild(c);
                break;
        }
    }
}

function LoadPlugin(){
    const h = document.querySelector("head");
    const loadjson = (path)=>{
        let f = Get(path);
        if(f.status === 200){
            return JSON.parse(f.responseText);
        }else{
            return null;
        }
    };

    const pcfg = loadjson("/config/plugin.json");
    if(pcfg === null){
        err("Not Found plugin.json");
        return;
    }
    
    for(let s = 0;s < pcfg.script.length;++s){
        let atd = document.createElement("script");
        atd.setAttribute("src",pcfg.script[s]);
        h.appendChild(atd);
    }
    for(let s = 0;s < pcfg.module.length;++s){
        let scr = document.createElement("script");
        scr.setAttribute("src",pcfg.module[s]);
        scr.setAttribute("type","module");
        h.appendChild(scr);
    }
    for(let s = 0;s < pcfg.css.length;++s){
        let scr = document.createElement("link");
        scr.setAttribute("href",pcfg.css[s]);
        scr.setAttribute("rel","stylesheet");
        h.appendChild(scr);
    }
}

function load(siteid){
    document.querySelector("main").remove();
    let b = document.querySelector("body");
    if(siteid === 404){
        document.querySelector("body").innerText = "404!";
        return;
    }

    LoadPlugin();
    
    if(tmp === undefined){
        let tmpfile = Get("/config/temp.json");
        if(tmpfile.status !== 200){err("Not Found Template Configfile");return;}
        tmp = JSON.parse(tmpfile.responseText);


        let headertxt = Get("/page/header.page");
        if(headertxt.status !== 200){
            err("Not Found PageFile: header.page");
            load(404);return;}
        let footertxt = Get("/page/footer.page");
        if(footertxt.status !== 200){
            err("Not Found PageFile: footer.page");
            load(404);return;}
        let head = document.createElement("header");
        LoadPage(head,tmp,headertxt.responseText.split('\n'));
        b.appendChild(head);
        let foot = document.createElement("footer");
        LoadPage(foot,tmp,footertxt.responseText.split('\n'));
        b.appendChild(foot);
    }
    
    let site = Get("/page/" + siteid + ".page");
    if(site.status !== 200){
        err("Not Found PageFile: " + siteid + ".page");
        load(404);return;
    }
    
    let main = document.createElement("main");
    LoadPage(main,tmp,site.responseText.split('\n'));
    b.appendChild(main);
    b.appendChild(document.querySelector("footer"));
}