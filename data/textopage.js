let tmp = null;
let debug = false;
let e = (q)=>{return document.createElement(q)};
let log = console.log;
let err = debug ? console.error : null;
function Get(url){
    let file = new XMLHttpRequest();
    file.open("GET",url,false);
    file.send();
    return file;
}
async function LoadPage(main,page){
    for(let i = 0;i < page.length;++i){
        switch(page[i][0]){
            case ':':
                let ss = page[i].split(':');
                if(ss.length !== 3) {
                    err(i + 1 + " Line :xxx~ define incorrect\n" + page[i]);
                    continue;
                }
                let m = e(ss[1]);
                m.innerText = ss[2];
                while(page.length-1 > i){
                    if(page[i+1].length !== 0){
                        if(page[i + 1][0] === '='){
                            if(page[i+1].split('=').length === 3){
                                i++;
                                ss = page[i].replace('\r','').split('=');
                                m.setAttribute(ss[1],ss[2]);
                            }else{break;}
                        }else{break;}
                    }else{break;}
                }
                main.append(m);
                break;
            case ';':
                let rr = page[i].split(';');
                if(rr.length < 3){
                    err(i+1 + "Line ;xx~ define incorrect\n" + page[i])
                    continue;
                }
                let n = tmp.id.indexOf(rr[1]);
                if(n === -1){
                    err(i + 1 + " Line ;xxx~ define incorrect\n" + page[i]);
                    continue;
                }
                let tmps = tmp.temp[n];
                for(let j = 0;j < rr.length - 2;++j){
                    tmps=tmps.replace('%',rr[2+j]);
                }
                LoadPage(main,tmps.split('\n'));
                break;
            case '<':
                main.innerHTML += page[i];
                break;
            case '&' :
                main.innerHTML += page[i];
                break;
        }
    }
}
async function optocf(q,file){
    fetch(file).then(async function(response){
        if(!response.ok){
            err("Not Found PageFile: " + file);
            lm(404);return;}
        let main = e("z");
        LoadPage(main,(await response.text()).split('\n'));
        $(q).html(main.innerHTML);
    });
}
async function lm(id){

    if(tmp == null){
        let b = $("body");
        let tmpfile = Get("/config/temp.json");
        if(tmpfile.status !== 200){err("Not Found Template Configfile");return;}
        tmp = {id: [],temp: []};
        let tmp_orgobj = JSON.parse(tmpfile.responseText)
        tmp_orgobj.forEach((value)=>{tmp.id.push(value.id);
            tmp.temp.push(value.base);
        });

        b.append(e("header"));
        b.append(e("main"));
        b.append(e("footer"));
        $("head").append(e("title"));

        optocf("header","/page/header.page");
        optocf("footer","/page/footer.page");

        document.body.innerHTML+="<a href=\"https://github.com/TNTSuperMan/TextoPage.js\" target=\"_blank\">Powered by TextoPage.js</a>";
    }
    let p = "/page/"+id+".page";
    fetch(p).then(async function(response){
        if(!response.ok){
            err("Not Found PageFile: " + p);
            lm(404);return;}
        let t = (await response.text()).split('\n');
        $("title").text(t[0]);
        
        let main = e('z');
        LoadPage(main,t);
        $('main').html(main.innerHTML);
    });
    history.replaceState('','',"?p=" + id);
}
$(function(){
    var qs = window.location.search;
    var g = new Object();
    if(qs){
      qs = qs.substring(1);
      var p = qs.split('&');

      for (var i = 0; i < p.length; i++) {
        var e = p[i].split('=');

        var pn = decodeURIComponent(e[0]);
        var pv = decodeURIComponent(e[1]);

        g[pn] = pv;
      }
    }
    if(g["p"]){
        lm(g["p"]);
        if(g["s"]){
            const es = document.querySelector("#" + g["s"]);
            window.scrollTo(0,es.getBoundingClientRect().y);
        }
    }else{
        lm(1);
    }
});