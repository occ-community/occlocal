$(function () {
    chrome.storage.sync.get(['occUrl', 'urlFolderOcc', 'tempoAtualizacao', 'log', 'on'], function (result) {
        $('#occUrl').val(result.occUrl);
        $('#urlFolderOcc').val(result.urlFolderOcc);
        $('#tempoAtualizacao').val(result.tempoAtualizacao);
        if(result.log == "") result.log = false;
        $('#log').attr("checked",result.log);
        if(result.on == "") result.on = false;
        $('#on').attr("checked",result.on);
    });

    $('#saveButton').click(function () {
        var btnSave = $(this);
        btnSave.attr("disabled","disabled");
        btnSave.attr("value","Your changes have been saved");
        setTimeout(
            function(){
                btnSave.removeAttr("disabled")
                btnSave.attr("value","Save");
            }
        ,2000)

        chrome.storage.sync.set({
            'occUrl': $('#occUrl').val()
        }, function () {
            // console.log('occUrl is set to ' + $('#occUrl').val());
        });

        chrome.storage.sync.set({
            'urlFolderOcc': $('#urlFolderOcc').val()
        }, function () {
            // console.log('urlFolderOcc is set to ' + $('#urlFolderOcc').val());
        });

        chrome.storage.sync.set({
            'tempoAtualizacao': $('#tempoAtualizacao').val()
        }, function () {
            // console.log('tempoAtualizacao is set to ' + $('#tempoAtualizacao').val());
        });
        chrome.storage.sync.set({
            'log': $('#log').is(":checked")
        }, function () {
            // console.log('log is set to ' + $('#log').is(":checked"));
        });
        chrome.storage.sync.set({
            'on': $('#on').is(":checked")
        }, function () {
            // console.log('on is set to ' + $('#on').is(":checked"));
        });

    });

    $(".help").click(function () {
        $("."+$(this).attr('name')).slideToggle();
    });


});
