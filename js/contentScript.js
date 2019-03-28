var caminhoJsonLayout = window.location.protocol + "//" + window.location.hostname + "/ccstoreui/v1/pages/layout" + window.location.pathname;
var caminhoJsonInstances = window.location.protocol + "//" + window.location.hostname + "/ccadminui/v1/widgetDescriptors/instances";
const version = "1";

var myInit = {
    'method': 'GET',
    'headers': new Headers({
        "Content-Type": "application/json",
        "Authorization": "Bearer " + getAdminToken()
    })
};

tmpCode = [];
var templates = {};
var caminhoTemplates = {};
var caminhoLess = {};

localStorage.setItem("templates", "");
localStorage.setItem("logTemplate", "");
localStorage.setItem("logLess", "");
localStorage.setItem("logJs", "");

/**
 * Salva os logs dos arquivos javascripts alterados no localStorage do browser.
 */
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (changes.jsAlterados) {
        let log = localStorage.getItem("logJs");
        log += changes.jsAlterados.newValue + "<br />";
        localStorage.setItem("logJs", log);
    }
});

function injectScript(file, node) {
    var th = document.getElementsByTagName(node)[0];
    var s = document.createElement('script');
    s.setAttribute('type', 'text/javascript');
    s.setAttribute('src', file);
    th.appendChild(s);
}


function validaUrl(urlCadastrada) {
    var urlAtual = window.location.protocol + "//" + window.location.hostname + "/";
    var urlAtualCompleta = window.location.protocol + "//" + window.location.hostname + window.location.pathname;

    if (urlAtual == urlCadastrada && urlAtualCompleta.indexOf("occs-admin") == -1) {
        return true;
    } else {
        return false;
    }
}

chrome.storage.sync.get(['occUrl', 'urlFolderOcc', 'tempoAtualizacao', 'log', 'on'], function (result) {
    occUrl = result.occUrl;
    occUrl = occUrl && occUrl[occUrl.length - 1] != "/" ? occUrl + "/" : occUrl;
    urlFolderOcc = result.urlFolderOcc;
    urlFolderOcc = urlFolderOcc && urlFolderOcc[urlFolderOcc.length - 1] != "/" ? urlFolderOcc + "/" : urlFolderOcc;
    tempoAtualizacao = result.tempoAtualizacao;
    log = result.log;
    on = result.on;
    getUrlExtension = chrome.extension.getURL("");
    if (validaUrl(occUrl) && on) {

        localStorage.setItem("tempoAtualizacao", tempoAtualizacao);
        localStorage.setItem("log", log);

        inicia();
        injectScript(chrome.extension.getURL('/js/replaceTemplate.js'), 'body');


    }

});



function inicia() {


    let layoutExtension = '';
    $(document).ready(() => {
        chrome.storage.sync.set({
            'urlLayout': caminhoJsonLayout
        }, () => {
            $.ajax({
                url: caminhoJsonLayout,
                success: (data, status) => {
                    chrome.storage.local.set({
                        'layoutExtension': ""
                    }, () => {
                        chrome.storage.local.set({
                            'layoutExtension': data
                        }, () => {
                            layoutExtension = data;
                            //console.log(layoutExtension);
                        });
                    });
                },
                beforeSend: (xhr, settings) => {
                    xhr.setRequestHeader('Authorization', 'Bearer ' + getAdminToken());
                }
            });
        });
    });


    let layoutInstances = '';
    $(document).ready(() => {
        chrome.storage.sync.set({
            'urlInstances': caminhoJsonInstances
        }, () => {
            $.ajax({
                url: caminhoJsonInstances,
                success: (data, status) => {
                    chrome.storage.local.set({
                        'layoutInstances': ""
                    }, () => {
                        chrome.storage.local.set({
                            'layoutInstances': data
                        }, () => {
                            layoutInstances = data;
                            //console.log(layoutInstances);
                        });
                    });
                },
                beforeSend: (xhr, settings) => {
                    xhr.setRequestHeader('Authorization', 'Bearer ' + getAdminToken());
                }
            });
        });
    });




    fetch(caminhoJsonLayout, myInit)
        .then(
            function (response) {
                if (response.ok === false) {}
                response.json().then(function (data) {
                    var arrWidgets = [];

                    data.regions.map((regiao1) => {
                        if (regiao1.widgets.length > 0) {
                            regiao1.widgets.map((widget1) => {
                                if (widget1.templateSrc != null) {
                                    widget1.regiaoLocalizada = "regiao";
                                    arrWidgets.push(widget1)
                                }

                            })


                        }
                        if (regiao1.hasOwnProperty("regions")) {
                            regiao1.regions.map((regiao2) => {
                                if (regiao2.widgets.length > 0) {
                                    regiao2.widgets.map((widget2) => {
                                        if (widget2.templateSrc != null) {
                                            widget2.regiaoLocalizada = "stack";
                                            arrWidgets.push(widget2)
                                        }

                                    })

                                }
                            })
                        }
                    })

                    startTrocaTemplate(arrWidgets);
                });
            }
        )
        .catch(function (err) {});

}

function startTrocaTemplate(arrWidgets) {

    //Le DisplayName dos Widgets por Instancias
    fetch(caminhoJsonInstances, myInit)
        .then(
            function (response) {
                if (response.ok === false) {
                    //console.log("Erro ao capturar o layout");
                }
                response.json().then(function (data) {

                    var arquivos = {
                        "Arquivos alterados": []
                    };

                    arrWidgets.map((widget, index) => {

                        data.items.map((item) => {
                            item.instances.map((instance) => {
                                if (instance.repositoryId == widget.id) {
                                    widget.primeiraPasta = item.displayName;
                                }
                            })
                        })

                        var nomeWidget = widget.displayName != null ? widget.displayName : widget.primeiraPasta;
                        caminhoTemplateLocal = urlFolderOcc + "widget/" + nomeWidget + "/instances/" + widget.instanceName + "/display.template";
                        caminhoLessLocal = urlFolderOcc + "widget/" + nomeWidget + "/instances/" + widget.instanceName + "/widget.less";
                        arquivos["Arquivos alterados"].push("Template: " + caminhoTemplateLocal);
                        arquivos["Arquivos alterados"].push("Less: " + caminhoLessLocal);

                    })
                    // console.log(arquivos);

                    //console.log("arrWidgets", arrWidgets)
                    var watcher = setInterval(function () {
                        arrWidgets.map((widget, index) => {

                            trocaTemplate(widget, index);

                        })

                    }, tempoAtualizacao * 1000);

                });
            }
        )
        .catch(function (err) {
            //console.log("Erro ao capturar o layout");
        });

}



//localStorage.removeItem("templates")

function trocaTemplate(widget, index) {

    var nomeWidget = widget.displayName != null ? widget.displayName : widget.primeiraPasta;

    caminhoTemplateLocal = urlFolderOcc + "widget/" + nomeWidget + "/instances/" + widget.instanceName + "/display.template";
    caminhoLessLocal = urlFolderOcc + "widget/" + nomeWidget + "/instances/" + widget.instanceName + "/widget.less";
    caminhoVariablesLess = urlFolderOcc + "theme/Tema Oi/variables.less";

    codigoTemplateLocal = "";
    codigoLessLocal = "";

    //.template
    if (fileExists(caminhoTemplateLocal)) {
        codigoTemplateLocal = readTextFile(caminhoTemplateLocal);
    }

    //.less
    if (fileExists(caminhoLessLocal)) {
        codigoLessOriginal = readTextFile(caminhoLessLocal)

        //Leitura das Variáveis do Less
        var splitVarsLess = codigoLessOriginal.replace("@media ", " ").replace(/^\s+|\s+$|\s+(?=\s)/g, "").split(/[:;(){}*]|[ \t]+/) //replace(/\n|\t/g, '').split(";")
        //console.log(splitVarsLess);
        var arrVarsLess = [];
        var txtVarsLess = "";
        var txtClassIdsLess = "";
        //console.log(splitVarsLess);
        $.each(splitVarsLess, function (index, value) {

            //if (value.includes("#", 0) || value.includes(".", 0)) {
            if (value[0] == "#" || value[0] == ".") {
                txtClassIdsLess += value + "{}"
            }

            //value = value.replace("@media","")
            if (value.includes("@", 0)) {

                while (value.includes("@", 0)) {
                    var ini = value.indexOf("@");
                    var fim = value.indexOf(" ", ini);
                    if (fim == -1) fim = value.length;
                    var varless = value.substr(ini, fim - ini);
                    if (!arrVarsLess.includes(varless) && varless != "@media") {
                        arrVarsLess.push(varless);
                        if (varless == "@px") {
                            txtVarsLess += varless + ":0;"
                        } else {
                            txtVarsLess += varless + ":~'';"
                        }

                    }
                    value = value.replace(varless, " ");
                }
            }

        })

        // console.log(txtVarsLess, splitVarsLess);
        //console.log(txtVarsLess+txtClassIdsLess);
        codigoLessLocal =
            txtVarsLess +
            txtClassIdsLess +
            codigoLessOriginal.replace("WIDGET_ID-WIDGET_INSTANCE_ID", widget.typeId + "-" + widget.id);

    }

    if (codigoTemplateLocal + codigoLessLocal != "" && tmpCode[index] != codigoTemplateLocal + codigoLessLocal) {

        tmpCode[index] = codigoTemplateLocal + codigoLessLocal

        options = less.render(codigoLessLocal, {
            "sync": true
        }, function (err, result) {
            if (err) {
                console.log("Error in less compilation: ", caminhoLessLocal, err);
            } else {
                try {
                    caminhoTemplates[widget.templateUrl] = caminhoTemplateLocal;
                    caminhoLess[widget.templateUrl] = caminhoLessLocal;
                    templates[widget.templateUrl] = codigoTemplateLocal + '<style>' + result.css + '</style>';

                    localStorage.setItem("caminhoTemplates", JSON.stringify(caminhoTemplates));
                    localStorage.setItem("caminhoLess", JSON.stringify(caminhoLess));
                    localStorage.setItem("templates", JSON.stringify(templates));

                } catch (e) {
                    console.log("Error: ", e);

                }
            }
        });
    }
}


function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) {
            var str = unescape(c.substring(nameEQ.length, c.length));
            return (str.substring(1, str.length - 2));

        }
    }
    return null;
}

function getAdminToken() {
    var adminToken = sessionStorage.getItem('oauth_token_secret-adminUI');
    if (adminToken === null || adminToken === '')
        adminToken = readCookie('oauth_token_secret-adminUI');
    return adminToken;
}

function readTextFile(file) {
    var ret = "";
    /**
     * @todo Resolver erro 404 no chrome
     */
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function () {
        if (rawFile.readyState === 4) {
            if (rawFile.status === 200 || rawFile.status == 0) {
                var allText = rawFile.responseText;
                ret = allText;
            }
        }
    }
    rawFile.send(null);
    return ret;
}

function fileExists(file) {
    var ret = "";
    /**
     * @todo Resolver erro 404 no chrome
     */
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function () {
        if (rawFile.readyState === 4) {
            if (rawFile.status === 200 || rawFile.status == 0) {
                ret = true;
            } else {
                ret = false;
            }
        } else {
            ret = false;
        }
    }
    rawFile.send(null);
    return ret;
}