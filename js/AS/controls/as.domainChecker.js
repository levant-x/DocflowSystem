var as = as || {};

as.domainChecker = {
    options: {
        listResult: "checkResult",
        button: "checkButton",
        resultStatus: "resultStatus",
        inputFile: "domainTxt"
    },

    init: function () {
        $(document).delegate("#" + as.domainChecker.options.button, 'click', as.domainChecker.runCheck);
        as.domainChecker.showForm();
    },

    runCheck: function () {
        var file = $('#' + as.domainChecker.options.inputFile)[0].files[0];

        if (file) {
            var reader = new FileReader();
            reader.readAsText(file);
            reader.onload = function (e) {
                $("#" + as.domainChecker.options.button).prop("disabled", true);
                $("#" + as.domainChecker.options.listResult).empty();
                var domains = e.target.result.trim().split('\n');
                domains.forEach(function (item, i) {
                    setTimeout(function () {

                        $("#" + as.domainChecker.options.resultStatus).text("Идет проверка " + (i + 1) + " из " + domains.length + "(один запрос в 4 секунды)");

                        as.sys.ajaxSend("/Demo/CheckDomain", { "domain": item }, as.domainChecker.outDomain);
                        if (i == domains.length - 1) {
                            $("#" + as.domainChecker.options.button).prop("disabled", false);
                            $("#" + as.domainChecker.options.resultStatus).text("Проверка завершена");
                        }

                    }
                    , i * 4000);
                });
            };
        } else {
            as.sys.bootstrapAlert("Файл не выбран!" , { type: 'danger' });
        }


    },

    outDomain: function (responce) {
        $("#checkResult").append("<li>" + responce.domain + ": " + responce.result + "</li>");
    },
    showForm: function () {
        var s = [];
        s.push('<input accept="text/plain" id="' + as.domainChecker.options.inputFile + '" type="file" class="file"><br>');
        s.push('<input type="button" id="' + as.domainChecker.options.button + '" value="Проверить">');
        s.push('<div><h3 id="' + as.domainChecker.options.resultStatus + '"></h3>');
        s.push('<ul id="' + as.domainChecker.options.listResult + '"></ul></div>');

        $('.as-domainCheck').html(s.join(''));
    }

}