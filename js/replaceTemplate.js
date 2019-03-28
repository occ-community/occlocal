log = "";
tmpCode = {};
if(localStorage.getItem("log") == 'true') exibeEstruturasLog();

setInterval(function () {

    var templates = require("knockout").koExternalTemplateEngine.templates;
    var novoTemplate = localStorage.getItem("templates") ? JSON.parse(localStorage.getItem("templates")) : "";
    var caminhoTemplates = localStorage.getItem("caminhoTemplates") ? JSON.parse(localStorage.getItem("caminhoTemplates")) : "";
    var caminhoLess = localStorage.getItem("caminhoLess") ? JSON.parse(localStorage.getItem("caminhoLess")) : "";

    // console.log("caminhoTemplates", caminhoTemplates);

    // console.log("caminhoLess", caminhoLess);

    if (templates != null && templates != "undefined" && novoTemplate != null && novoTemplate != "undefined") {

        $.each(templates, function (index, value) {
            if (tmpCode[index] != novoTemplate[index]) {
                tmpCode[index] = novoTemplate[index]

                if (novoTemplate[index]) {

                    value.template(novoTemplate[index])

                    if (caminhoTemplates[index]) {
                        var log = localStorage.getItem("logTemplate");
                        log += caminhoTemplates[index] + "<br/>";
                        localStorage.setItem("logTemplate", log);
                    }
                    //console.log(localStorage.getItem("logTemplate"));

                    if (caminhoLess[index]) {
                        var log = localStorage.getItem("logLess");
                        log += caminhoLess[index] + "<br/>";
                        localStorage.setItem("logLess", log);
                    }

                }
            }

        });
    }
    if(localStorage.getItem("log") == 'true') exibeLog();
    

}, localStorage.getItem("tempoAtualizacao") * 1000)

function exibeEstruturasLog() {
    $("body").remove(".logFloat");
    $("body").append(`
    <div class="logFloat">
        <style>
        .logFloat{
            position: fixed;
            bottom: 10px;
            height: 350px;
            background: #fff;
            padding: 10px 25px;
            width: 70%;
            overflow: auto;
            line-height: 30px;
            z-index: 9999999999999;
            box-shadow: 0 0 30px #888;
            right: 10px;
            border-radius: 10px;
        }
        .logFloat .coluna{
            height: 100px;
            width: 100%;
            overflow: auto;
            border: 1px solid #ccc;
            border-radius: 5px;
            margin-bottom: 3px;
            padding: 0 10px;
        }

        .logFloat .coluna div{
            line-height: 20px;
            margin-top: -5px;
            color: #5d5d5d;
        }

        .logFloat h4{
            font-family: cursive;
            font-size: 15px;
            letter-spacing: 2px;
            color: #8c8c8c;
            margin-top: 0px;
            margin-bottom: 7px;
        }
        .logFloat.btn{
            border: 1px solid #ccc;
            float: right;
            margin-right: 50px;
        }
        .logFloat .close{
            float: right;
            font-size: 21px;
            font-weight: bold;
            line-height: 1;
            color: #6b6b6b !important;
            font-family: fantasy;
        }
        </style>
        <div class="close">X</div>
        <div class="coluna"><h4>Template</h4><div id="logTemplate"></div></div>
        <div class="coluna"><h4>Less</h4><div id="logLess"></div></div>
        <div class="coluna"><h4>JS</h4><div id="logJs"></div></div>
    </div>
    `);
}

$(".logFloat .close").on("click",function(){
    $(".logFloat").fadeOut();
})

function exibeLog() {
    if ($("#logTemplate").html() != localStorage.getItem("logTemplate")) {
        $("#logTemplate").html(localStorage.getItem("logTemplate"))
    }
    if ($("#logLess").html() != localStorage.getItem("logLess")) {
        $("#logLess").html(localStorage.getItem("logLess"))
    }
    if ($("#logJs").html() != localStorage.getItem("logJs")) {
        $("#logJs").html(localStorage.getItem("logJs"))
    }
}
