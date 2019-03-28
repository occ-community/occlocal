const urls = {};
const version = "1";
var currentTab;

// fetchInject([
//   'https://app.occlocal.com/eventsBackground.php'
// ]).then(() => {
//   //console.log(`Finish in less than ${moment().endOf('year').fromNow(true)}`)
// })

/**
 * Função responsável por conter as URLs para serem filtradas no request.
 */
const filterBeforeRequest = {
    urls: ["<all_urls>"]
};

/**
 * Função responsável por conter quais tipos de informações irão vir na função de callback.
 */
const extraInfoBeforeRequest = ["blocking"];

/**
 * Variável responsável por armazenar os dados do layout da página atual.
 */
let layoutExtension = "";
let layoutInstances = "";
let urlFolderOcc = "";
let on;

chrome.storage.onChanged.addListener((changes, namespace) => {
    init()
});

function init() {
    chrome.storage.sync.get(['occUrl', 'urlFolderOcc', 'tempoAtualizacao', 'on'], function (result) {
        occUrl = result.occUrl;
        occUrl = occUrl && occUrl[occUrl.length - 1] != "/" ? occUrl + "/" : occUrl;
        urlFolderOcc = result.urlFolderOcc;
        urlFolderOcc = urlFolderOcc && urlFolderOcc[urlFolderOcc.length - 1] != "/" ? urlFolderOcc + "/" : urlFolderOcc;
        tempoAtualizacao = result.tempoAtualizacao;
        on = result.on;

        if (on) {

            /**
             * Listener responsável por ficar ouvindo as atualizações do storage e atualizar as variável necessárias.
             */
            chrome.storage.onChanged.addListener((changes, namespace) => {
                if (on && namespace == "local" && changes.layoutExtension) {
                    layoutExtension = changes.layoutExtension.newValue;
                }
            });

            /**
             * Listener responsável por ficar ouvindo as atualizações do storage e atualizar as variável necessárias.
             */
            chrome.storage.onChanged.addListener((changes, namespace) => {
                if (on && namespace == "local" && changes.layoutInstances) {
                    layoutInstances = changes.layoutInstances.newValue;
                }
            });

            /**
             * Listener responsável por ficar ouvindo as requisições.
             */
            chrome.webRequest.onBeforeRequest.addListener(callbackBeforeRequest, filterBeforeRequest, extraInfoBeforeRequest);


        }

    });
}
init();
/**
 * Função responsável por obter o conteúdo do arquivo passado por parâmetro.
 * 
 * @param {String} file - URL do arquivo 
 */
const readTextFile = (file) => {
    var ret = "";
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = () => {
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

const replaceJsAppLevel = (fileNameJs) => {
    let localJs = urlFolderOcc + "global/" + fileNameJs + ".js";
    return localJs;
}

/**
 * Esta função é responsável por trocar os dados dos arquivos javascripts remotos pelos templates locais.
 * 
 * @param {JSON} layout - Json contendo os dados da página atual.
 * @param {String} fileNameJs - Nome do arquivo javascript
 * 
 * @return URL para o redirecionamento do arquivo JS local
 */
const replaceJsWidgets = (layout, fileNameJs) => {
    let localJs = "";
    loopRegions:
        for (let i = 0; i < layout.regions.length; i++) {
            for (let j = 0; j < layout.regions[i].widgets.length; j++) {
                const valueWidgets = layout.regions[i].widgets[j];
                const jsRemoteName = layout.regions[i].widgets[j].javascript.replace(".min", "");
                if (fileNameJs == jsRemoteName) {

                    layoutInstances.items.map((item) => {
                        item.instances.map((instance) => {
                            if (instance.repositoryId == valueWidgets.id) {
                                valueWidgets.primeiraPasta = item.displayName;
                            }
                        })
                    })

                    const nomeWidget = valueWidgets.displayName != null ? valueWidgets.displayName : valueWidgets.primeiraPasta; //valueWidgets.instanceName;

                    const caminhoJSLocal = "widget/" + nomeWidget + "/js/" + valueWidgets.javascript.replace(".min", "") + ".js";
                    localJs = urlFolderOcc + caminhoJSLocal;
                    break loopRegions;
                }

                // if(layout.regions[i].hasOwnProperty("regions") {

                // }
                // console.log(layout.regions[i])
            }

            //console.log("layoutInstances", layoutInstances);
            if (layout.regions[i].hasOwnProperty("regions")) {
                for (let k = 0; k < layout.regions[i].regions.length; k++) {
                    for (let l = 0; l < layout.regions[i].regions[k].widgets.length; l++) {
                        const valueWidgets = layout.regions[i].regions[k].widgets[l];
                        const jsRemoteName = layout.regions[i].regions[k].widgets[l].javascript.replace(".min", "");
                        //console.log(valueWidgets);
                        if (fileNameJs == jsRemoteName) {
                            layoutInstances.items.map((item) => {
                                item.instances.map((instance) => {
                                    if (instance.repositoryId == valueWidgets.id) {
                                        valueWidgets.primeiraPasta = item.displayName;
                                    }
                                })
                            })

                            const nomeWidget = valueWidgets.displayName != null ? valueWidgets.displayName : valueWidgets.primeiraPasta; //valueWidgets.instanceName;

                            const caminhoJSLocal = "widget/" + nomeWidget + "/js/" + valueWidgets.javascript.replace(".min", "") + ".js";
                            localJs = urlFolderOcc + caminhoJSLocal;
                            break loopRegions;
                        }

                        // if(layout.regions[i].hasOwnProperty("regions") {

                        // }
                        // console.log(layout.regions[i])
                    }

                }
            }
        }
    return localJs;
};

var arrJsRedirects = [];
/**
 * Função responsável por efetuar a troca das URLs remotas pelas URLs dos aquivos locais.
 * 
 * @param {Object} details - Ojeto com os datalhes da requisição
 * 
 * @return URL para ser retornada
 */
const callbackBeforeRequest = (details) => {
    if (on) {
        let urlRedirect = "";
        let fileNameJs;

        // Troca os arquivos javascripts dos globais. 
        if (details.url.includes("/global/") && details.url.includes(".js")) {
            const urlSeguiments = details.url.split("/");
            if (urlSeguiments[5] === "global") {
                fileNameJs = urlSeguiments[6].split("?")[0].replace(".min", "");
            }
            urlRedirect = replaceJsAppLevel(fileNameJs.replace(".js", ""));
            if (urlRedirect != undefined && urlRedirect != "") {
                if (fileExists(urlRedirect)) {
                    chrome.storage.sync.set({
                        "jsAlterados": urlRedirect
                    }, function () {});
                    return {
                        redirectUrl: urlRedirect
                    };
                } else {
                    return true;
                }
            }
        }

        // Troca os arquivos javascripts dos widgets. 
        if (details.url.includes("/widget/") && details.url.includes(".js")) {
            const urlSeguiments = details.url.split("/");
            if (urlSeguiments[7] === "js") {
                fileNameJs = urlSeguiments[8].split("?")[0].replace(".min", "");
            } else if (urlSeguiments[8] === "js") {
                fileNameJs = urlSeguiments[9].split("?")[0].replace(".min", "");
            } else {
                fileNameJs = urlSeguiments[10].split("?")[0].replace(".min", "");
            }
            if (layoutExtension != {}) {
                urlRedirect = replaceJsWidgets(layoutExtension, fileNameJs.replace(".js", ""));
                if (urlRedirect != "") {
                    if (fileExists(urlRedirect)) {
                        chrome.storage.sync.set({
                            "jsAlterados": urlRedirect
                        }, function () {});
                        return {
                            redirectUrl: urlRedirect
                        };
                    } else {
                        return true;
                    }
                }
            }
        }
    }
};

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