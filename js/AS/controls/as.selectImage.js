// Компонент добавления картинки в ячейку таблицы as.crud
// Колонка массива cols должна иметь опцию datatype: "string"
// Элементы editable и filter исключаются

var as = as || {};

as.selectImage = {
    options: {
        cont: null, //div контейнер, где выводим изображение и управляющие кнопки (myUsUploadImage)
        swfURLFormat: '', // ('/js/uploadify/uploadify.swf')
        uploaderURLFormat: '', //'/Article/ArticleImageSave'
        deleteURLFormat: '',  // '/Article/ArticleImageDelete'
        toSaveDirectory: '', //('/uploads/Images/Articles')
        imageMaxWidth: 150,
        btnAddImageTitle: as.resources.selectImageBtnAddImageTitle,
        btnEditImageTitle: as.resources.selectImagebtnEditImageTitle,
        btnDeleteImageTitle: as.resources.selectImagebtnDeleteImageTitle,
        btnWidth: 20,
        btnHeight: 20
    },

    init: function (options) {
        as.selectImage.options = $.extend(as.selectImage.options, options);

        if (as.selectImage.options.cont != null) {
            $(document).delegate('.usDeleteImage', 'click', function (e) {
                e.preventDefault();
                as.selectImage.deleteImage($(this));
            });
        }
    },
    deleteImage: function (btn) {
        var tr = btn.closest("tr");
        var td = btn.closest('td');
        var params = { id: tr.attr('data-itemID') };
        as.sys.ajaxSend(as.selectImage.options.deleteURLFormat, params, function (data) {
            if (typeof (data) != "object") data = eval('(' + data + ')');
            if (data.result) {
                as.crud.getItems();
                as.sys.bootstrapAlert(as.resources.selectImage_deleteImage_AlertDel, { type: 'success' });
            } else {
                as.sys.bootstrapAlert(data.msg || as.resources.selectImage_deleteImage_AlertError, { type: 'danger' });
            }
        });
    },

    editImage: function (current) {
        var tr = current.closest("tr");
        var td = current.closest('td');
        var files = "<div class='rpFiles'><input type='file' class='svFile' id='" + tr.attr('data-itemID') + "_file' /></div>";
        $(current).find("div.usEditImage").html(files);
        $(current).find("input.svFile").uploadify({
            'swf': as.selectImage.options.swfURLFormat,
            'uploader': as.selectImage.options.uploaderURLFormat,
            'fileTypeExts': '*.jpg;*.pdf;*.png;*.gif',
            'auto': true,
            'multi': false,
            'fileSizeLimit': '5MB',
            'buttonText': "<a href='#'><div class='glyphicon glyphicon-picture'></div></a>",
            'method': 'post',
            'width': as.selectImage.options.btnWidth,
            'height': as.selectImage.options.btnHeight,
            'formData': { 'suggestionID': tr.attr('data-itemID'), 'toSaveDirectory': as.selectImage.options.toSaveDirectory },
            'onUploadSuccess': function (file, data, response) {
                if (typeof (data) != "object") data = eval('(' + data + ')');
                if (data.result) {
                   as.crud.getItems();
                   as.sys.bootstrapAlert(as.resources.selectImage_editImage_AlertPerformed, { type: 'success' });
                } else {
                    as.sys.bootstrapAlert(data.msg || as.resources.selectImage_deleteImage_AlertError, { type: 'danger' });
                }
            },
            'onInit': function () {
                
                $(td).find("div.uploadify-button").removeClass("uploadify-button");
                $(td).find("span.uploadify-button-text").removeClass("uploadify-button-text");
                $(td).find("div.uploadify-queue").attr("style", "width: 150px");
                $(td).find("div.myuploadify-queue").html($(td).find("div.rpFiles > div.uploadify-queue"));
                $(td).find("div.rpFiles > div.uploadify-queue").remove();
            }
            
        });
    },

    changeImageContent: function (current) {
        if (!current) {
            $("div." + as.selectImage.options.cont).each(function (index, val) {
                as.selectImage.displayImageContent($(this));
            });
        }
        else {
            as.selectImage.displayImageContent(current);
        }
    },

    displayImageContent: function (current){
        var btn = current;
        var tr = btn.closest('tr');
        var td = btn.closest('td');
        $(td).attr("style", "width:" + (as.selectImage.options.imageMaxWidth + 50) + "px");
        if ($(btn).attr("data-imgPath") != "") {
            $(btn).html("<div class='ItemImageCell'>" +
                            "<div class='ItemImageImg'>" +
                                "<img src='" + $(btn).attr("data-imgPath") + "' />" +
                            "</div>" +
                            "<div class='ItemImageBtn'>" +
                                "<div class='usDeleteImage' title='" + as.selectImage.options.btnDeleteImageTitle + "' style='margin-botton:10px;'></div>" +
                                "<div class='usEditImage' title='" + as.selectImage.options.btnEditImageTitle + "'></div>" +
                            "</div>" +
                        "</div>" +
                        "<div class='myuploadify-queue'></div>");

            $(td).find("div.ItemImageCell").attr("style", " display:inline-block; height: auto; width: " + (as.selectImage.options.imageMaxWidth + 40) + "px;");
            $(td).find("div.ItemImageImg").attr("style", "display:inline-block; float:left; height: auto;  max-width: " + as.selectImage.options.imageMaxWidth + "px;");
            $(td).find("div.ItemImageImg > img").addClass("img-responsive");
            $(td).find("div.ItemImageBtn").attr("style", "display:inline-block; float:right;");
            $(td).find("div.ItemImageBtn > div.usDeleteImage").html("<a class='' href='#'><div class='glyphicon glyphicon-remove-circle'></div></a>");
            as.selectImage.editImage(current);
        }
        else {
            $(btn).html("<div class='usEditImage'  title='" + as.selectImage.options.btnAddImageTitle + "'>" +
                        "</div>" +
                        "<div class='myuploadify-queue'></div>");
            as.selectImage.editImage(current);
        }
    }
}
