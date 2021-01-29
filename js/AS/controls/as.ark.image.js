var as = as || {};


as.ark.image = {
    curElement: {},
    ajax:
    {
        UrlSave: "/ArkStuff/ArkImgSave/",
        UrlExist: "/ArkStuff/ArkImgExist/"
    },
    width: "auto",
    height: "200px",
    init: function () {
        if($("div.as-image").length>0)
        {
            as.ark.image.showImage();
            $(document).delegate('.as-image-canEdit', 'mouseenter mouseleave', function (event) {
                if (event.type == 'mouseenter') {
                    var Sel = $(this);
                    if (Sel.find("div.as-hover-toolbar").length == 0) {
                        Sel.append("<div class='as-hover-toolbar'></div>");

                    }
                    Sel.find("div.as-hover-toolbar").append("<div class='as-edit'>" +
                                                        "<a href='#' class='as-image-click'><i class='glyphicon glyphicon-picture' title='" + as.resources.ark_image_init_title + "' alt='" + as.resources.ark_image_init_alt + "' ></i></a>" +
                                                        "</div>");
                }
                else {
                    $(this).find("div.as-hover-toolbar").remove();
                }
            });

            $(document).delegate('a.as-image-click', 'click', function (e) {
                e.preventDefault();
                as.ark.image.curElement = $(this).parent("div.as-edit").parent("div.as-hover-toolbar").parent("div.as-image-canEdit");
                as.ark.image.editImage();
            });

            as.fe.options.ajax.fileEditor_Caption = "Caption";
            as.fe.options.ajax.loadFileEditor = "/ArkStuff/loadFileEditor";
            as.fe.options.ajax.loadDir = "/ArkStuff/loadDir";
            as.fe.options.ajax.uploadFiles = "/Handlers/feUploadFilesAsArkImage.ashx";
            as.fe.options.ajax.createDir = "/ArkStuff/createDir";
            as.fe.options.ajax.deleteFile = "/ArkStuff/deleteFile";
            as.fe.options.ajax.renameFile = "/ArkStuff/renameFile";
            as.fe.options.ajax.renameDir = "/ArkStuff/renameDir";
            as.fe.options.ajax.deleteDir = "/ArkStuff/deleteDir";
            as.fe.options.ajax.getTextFile = "/ArkStuff/getTextFile";
            as.fe.options.ajax.saveTextFile = "/ArkStuff/saveTextFile";
            as.fe.init();
        }
    },

    showImage: function () {
        $("div.as-image").addClass("as-image-canEdit");
    },

    editImage: function () {
        if (as.ark.image.curElement.attr("data-mode") == "image" && as.ark.image.curElement.attr("data-mode") != "undefined")
        {
            as.ark.image.curElement.find("div.as-hover-toolbar").remove();
            as.fe.showFileEditorDialog("Менеджер изображений", "image/jpeg, image/png, image/gif", "Выбрать", $('#asModal'), function (url, curElementData) {
                var alt = $('input.feAlt').val();
                if (alt == "" || alt == "undefined") {
                    alt = curElementData.attr('data-name');
                }
                var NameCodeDiv = "";
                var dc = as.ark.image.curElement.attr("data-code");
                as.sys.ajaxSend(as.ark.image.ajax.UrlExist, { codeDiv: dc }, function (dataIs) {
                    if (dataIs.STATUS == "NotExist") {
                        NameCodeDiv = prompt('Введите название блока', dc);
                    }
                    if (dataIs.STATUS == "ItExists" || dataIs.STATUS == "NotExist") {
                        as.sys.ajaxSend(as.ark.image.ajax.UrlSave, { ImgText: "|||" + url + "|||" + alt, codeDiv: dc, NameDiv: NameCodeDiv }, function (data) {

                            if (data.STATUS == "OK") {
                                as.ark.image.curElement.html("<img id='" + dc + "' src='" + url + "' alt='" + alt + "' width='" + as.ark.image.width + "' height='" + as.ark.image.height+"'>");
                            }
                        }, false, false);
                    }

                }, false, false);
            });
        }
      
      
}
};