let tmp = null;
let debug = false;
const e = function(q) {return document.createElement(q)};

function log(txt){console.log(txt)}
function err(txt){if(debug)console.error(txt)}

function Get(url){
    let file = new XMLHttpRequest();
    file.open("GET",url,false);
    file.send();
    return file;
}

function LoadPage(main,page){
    for(let i = 0;i < page.length;++i){
        err(page[i]);
        switch(page[i][0]){
            case ':':
                let ss = page[i].split(':');
                if(ss.length !== 3) {
                    err(i + 1 + " Line :xxx~ define is incorrect\n" + page[i]);
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
                    console.error(i+1 + "Line text is incorrect\n" + page[i]);
                    continue;
                }
                let n = tmp.id.indexOf(rr[1]);
                if(n === -1){
                    err(i + 1 + " Line ;xxx~ define is incorrect\n" + page[i]);
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
        }
    }
}

function outpage(query,texts){
    let main = e(query);
    LoadPage(main,texts);
    $(query).html(main.innerHTML);
}

function lm(id){

    if(tmp == null){
        const b = $("body");
        const tmpfile = Get("/config/temp.json");
        if(tmpfile.status !== 200){err("Not Found Template Configfile");return;}
        tmp = JSON.parse(tmpfile.responseText);

        b.append(e("header"));
        b.append(e("main"));
        b.append(e("footer"));
        $("head").append(e("title"));

        let headertxt = Get("/page/header.page");
        if(headertxt.status !== 200){
            err("Not Found PageFile: header.page");
            lm(404);return;}
        outpage("header",headertxt.responseText.split('\n'));

        let footertxt = Get("/page/footer.page");
        if(footertxt.status !== 200){
            err("Not Found PageFile: footer.page");
            lm(404);return;}
        outpage("footer",footertxt.responseText.split('\n'));
        const c = function(c){document.body.innerHTML+=c};
        c("<a href=\"#\" id=\"dialogb63756\">Powered by TextoPage.js</a>");
        c("<div id=\"dialog29543\" style=\"display:none\" title=\"about: TextoPage.js\">Powered by TextoPage.js<br>"
         +"<a target=\"_blank\" href=\"https://github.com/TNTSuperMan/TextoPage.js\">TextoPage.js Repository</a>"
         +"</div>");
    }
    const c = "/page/"+id+".page";
    let site = Get(c);
    if(site.status !== 200){
        err("Not Found PageFile: " + c);
        lm(404);return;
    }
    const srs = site.responseText.split('\n')
    $("main").text(null);
    $("title").text(srs[0]);
    outpage("main",srs);
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
    $("#dialogb63756").on("click",function(){
        $("#dialog29543").dialog();
    });
});