var as = as || {};

as.files = {
    options: {
        ajax: {
            upload: "/files/Upload",
            getFiles: "/files/getFiles",
            getFile: "/files/getFile",
            deleteFile: "/files/deleteFile",
            updateFilesOrder: "/files/updateFilesOrder",
        },
        maxFileSize: '5MB',
    },
    init: function() {
        if (as.files.runInit) return;
        else as.files.runInit = true;

        as.sys.loadLib("/js/uploadify/jquery.uploadify-3.1.min.js", "/js/uploadify/uploadify.css", $('.as-files-file-upload').uploadify, function() {
            $('.as-files-manager').each(function() {
                as.files.showHomeScreen($(this));
            });
        });

        $(document).delegate('.as-files-manager-delete', 'click', as.files.deleteFile);
        $(document).delegate('#show-file-manager', 'click', as.files.prepareMainScreen);
    },
    showHomeScreen: function(cont) {
        cont.append('<a id="show-file-manager" href="#"><div class="uploadify-button as-images-upload" style="height: 30px; line-height: 30px; width: 120px;"><span class="uploadify-button-text">"' + as.resources.files_showHomeScreen_files + '"</span></div></a>');
    },
    prepareMainScreen: function() {
        var cont = $(this).parent();
        $(this).remove();
        as.files.showFilesManager(cont);
    },
    showFilesManager: function (cont) {
        
        if ($(".as-files-manager-items", cont).length == 0) {           
            cont.append("<div class='as-files-manager-items'></div><input type='file' class='as-files-file-upload' name='as-files-file-upload' id='as-files-file-upload" + as.tools.smallGuidGenerator() + "' /><div class='as-files-manager-panel hide'></div>");
            
            $('.as-files-file-upload', cont).uploadify({
                swf: '/js/uploadify/uploadify.swf',
                uploader: as.files.options.ajax.upload,
                fileTypeExts: cont.data('typeid'),
                onQueueComplete: function() {
                    setTimeout(function() {
                        as.files.showFilesManager(cont);
                    }, 1000);
                },
                fileSizeLimit: as.files.options.maxFileSize,
                buttonText: as.resources.files_showFilesManager_btn, //buttonText: files_showFilesManager_btn,
                buttonClass: 'as-images-upload',
                method: 'post',
                formData: { 'itemid': cont.data('itemid'), ASPSESSID: window.ASPSESSID, AUTHID: window.auth }
            });

        }

        var params = {
            itemid: cont.data('itemid'),
        };

        as.sys.ajaxSend(as.files.options.ajax.getFiles, params, function (data) {

            if (typeof (data) != "object") data = eval('(' + data + ')');
            if (data.result) {
                var s = [];
                s.push('<ul class="list-unstyled">');

                var getFileUrl = as.files.options.ajax.getFile;

                for (var i = 0; i < data.items.length; i++) {
                    var item = data.items[i];
                    s.push("<li class='as-files-manager-file' data-id='" + item.id + "'><a href='" + getFileUrl + "/" + item.id + "'> " + item.name + "</a><a href='#' class='as-files-manager-delete'><span class='glyphicon glyphicon-remove'></span></a></li>");
                }
                s.push("</ul>");
                $('.as-files-manager-items', cont).html(s.join(""));

                $($('.as-files-manager-items ul', cont)).sortable({
                    placeholder: "ui-state-highlight",
                    revert: true,
                    update: function (event, ui) {
                        as.files.updateFilesOrder(cont);
                    }
                }).disableSelection();

                if (data.items.length == 0) {
                    $('.as-files-manager-items', cont).html('<div class="alert alert-info">"' + as.resources.files_deleteFile_alert + '"</div><br />');
                }
            }
        });
    },
    deleteFile: function (e) {
        if (e) e.preventDefault();
        var self = $(this);
        var params = {
            id: self.closest('.as-files-manager-file').data('id')
        }
        as.sys.ajaxSend(as.files.options.ajax.deleteFile, params, function(data) {
            if (typeof (data) != "object") data = eval('(' + data + ')');
            if (data.result) {
                self.closest('.as-files-manager').find('.as-files-manager-file[data-id=' + params.id + ']').hide(300, function() {
                    $(this).remove();
                    if ($('.as-files-manager-file').length == 0) {
                        $('.as-files-manager-items').html('<div class="alert alert-info">"' + files_deleteFile_alert + '"</div><br />');
                    }
                });

               
            } else {
                as.sys.bootstrapAlert(data.msg || as.resources.files_deleteFile_AlertError, { type: 'danger' });
            }
        });
    },
    updateFilesOrder: function (cont) {
        var ids = "";
        $(".as-files-manager-items li").each(function () {
            ids += $(this).data('id') + ",";
        });
        var params = { itemID: cont.data("itemid"), ids: ids };
        
        as.sys.ajaxSend(as.files.options.ajax.updateFilesOrder, params, function (data) {
            if (typeof (data) != "object") data = eval('(' + data + ')');
            if (!data.result) {
                as.sys.bootstrapAlert(data.msg || as.resources.files_deleteFile_AlertError, { type: 'danger' });
            }
        });
    },
};