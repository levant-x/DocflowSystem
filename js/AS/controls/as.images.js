var as = as || {};

as.images = {
    options: {
        ajax: {
            "getImages": "/images/getImages",
            "saveImage": "/images/saveImage",
            "deleteImage": "/images/deleteImage",
            "updateImagesOrder": "/images/updateImagesOrder",
            "upload": "/images/Upload"
        },
        data: [],  
        alertError: true, 
        filter: '*.gif; *.jpg; *.png',
        maxFileSize: '5MB',
    },
    init: function () {       
        if (as.images.runInit) return;
        else as.images.runInit = true;


        as.sys.loadLib("/js/uploadify/jquery.uploadify-3.1.min.js", "/js/uploadify/uploadify.css", $('.as-images-file-upload').uploadify, function () {
            $('.as-images-manager').each(function () {
                as.images.showImagesManager($(this));
            });
        });

       

        $(document).delegate('.as-images-manager-image','click', as.images.selectImage);
        $(document).delegate('.as-images-manager-delete', 'click', as.images.deleteImage);
        $(document).delegate('.as-images-manager-close', 'click', as.images.closeImage);
        $(document).delegate('.as-images-manager-save', 'click', as.images.saveImage);
       
       
        as.images.initGallery();
    },
    initGallery: function () {
        $('.as-images-gallery').each(function () {
            var items = [];
            $(">img", this).each(function () {
                items.push({
                    thumb: $(this).attr('src'),
                    url: $(this).attr('data-url'),
                    title: $(this).attr('title')
                });
            });

            as.images.showGallery($(this), items);
        });
    },
    showImagesManager: function (cont) {
        if ($(".as-images-manager-items", cont).length == 0) {
            cont.append("<div class='as-images-manager-items'></div><input type='file' class='as-images-file-upload' name='as-images-file-upload' id='as-images-file-upload" + as.tools.smallGuidGenerator() + "' /><div class='as-images-manager-panel hide'></div>");
            var el = $('.as-images-file-upload', cont);
            $(el).uploadify({
                'swf': '/js/uploadify/uploadify.swf',
                'uploader':as.images.options.ajax.upload,
                'fileTypeExts':as.images.options.filter,
                'onQueueComplete': function (queueData) {
                    setTimeout(function () {
                        as.images.showImagesManager(cont);
                    }, 1000);
                },
                'fileSizeLimit': as.images.options.maxFileSize,
                'buttonText': as.resources.images_showImagesManager_btnText,
                'buttonClass': 'as-images-upload',
                'method': 'post',
                'formData': { 'itemid': cont.attr('data-itemID'), 'code': cont.attr('data-code'), 'thumbWidth': cont.attr('data-thumbWidth') ||100, 'thumbHeight': cont.attr('data-thumbHeight') || 100 },
                'onComplete': function (event, ID, fileObj, response, data) {
                   // alert(response);
                }
            });
        }
        var params = {
            itemid: cont.attr('data-itemID'),
            code: cont.attr('data-code'),
        };      
        as.sys.ajaxSend(as.images.options.ajax.getImages, params, function (data) {
            if (typeof (data) != "object") data = eval('(' + data + ')');
            if (data.result) {
                var s = data.result;
                var s = [];
                s.push('<ul>');
                //for (var i = 0; i < data.items.length; i++) {
                    //  var item = data.items[i];
                var item = data.items[data.items.length-1];
                   s.push("<li><a href='#' data-url='"+item.originalUrl+"' data-id='" + item.id + "'  class='as-images-manager-image'><img alt='' src='" + item.thumbUrl + "' /></a></li>");

                    var props = {
                        name:item.name,
                        url: item.url,
                        description: item.description
                    }
                    as.images.options.data[item.id] = props;

               // }
               s.push("</ul>");
               $('.as-images-manager-items', cont).html(s.join(""));


                $($('.as-images-manager-items ul', cont)).sortable({
                    placeholder: "ui-state-highlight",
                    revert: true,
                    update: function (event, ui) {
                        as.images.updateImagesOrder(cont);
                    }
                }).disableSelection();            
    
                if ($('.as-images-manager-image', cont).length == 0) {
                    $('.as-images-manager-items', cont).html('<div class="alert alert-info">"' + as.resources.images_showImagesManager_noImage + '"</div><br />');
                }  
            } else {
                as.sys.bootstrapAlert(data.msg || as.resources.images_showImagesManager_AlertError, { type: 'danger' });
            }
        });
    },
    deleteImage: function (e) {
        var btn = $(this)
        if(e) e.preventDefault();
        var params = {
            id: btn.closest('.as-images-manager-panel').attr('data-id')
        };
        as.sys.ajaxSend(as.images.options.ajax.deleteImage, params, function (data) {
            if (typeof (data) != "object") data = eval('(' + data + ')');
            if (data.result) {
                btn.closest('.as-images-manager').find('.as-images-manager-image[data-id=' + params.id + ']').parent().hide(300, function () { $(this).remove(); });
                btn.closest('.as-images-manager-panel').addClass("hide");
            } else {
                as.sys.bootstrapAlert(data.msg || as.resources.images_showImagesManager_AlertError, { type: 'danger' });
            }
        });
    },
    closeImage: function (e) {
        if (e) e.preventDefault();
        $('.as-images-manager-panel', $(this).closest(".as-images-manager")).addClass('hide');
    },
    saveImage: function (e) {
        if (e) e.preventDefault();
        var params = {
            id: $(this).closest(".as-images-manager-panel").attr('data-id'),
            name: $('.as-images-manager-name').val(),
            url: $('.as-images-manager-url').val(),
            description: $('.as-images-manager-description').val()
        };
    
        as.sys.ajaxSend(as.images.options.ajax.saveImage, params, function (data) {
            if (typeof (data) != "object") data = eval('(' + data + ')');
            if (data.result) {
                var props = {
                    name: params.name,
                    url: params.url,
                    description: params.description
                };
                as.images.options.data[params.id] = props;
                as.images.closeImage();
                as.sys.bootstrapAlert(data.msg || as.resources.images_saveImage_AlertSaved, { type: 'success' });
            } else {
                as.sys.bootstrapAlert(data.msg || as.resources.images_showImagesManager_AlertError, { type: 'danger' });
            }
        });
        
    },
    selectImage: function (e) {
        if (e) e.preventDefault();
        var cont = $(this).closest('.as-images-manager');
       $('.as-images-manager-image', cont).removeClass('as-images-manager-sel');
       $(this).addClass('as-images-manager-sel');

       $('.as-images-manager-panel', cont).removeClass("hide");

        var id = $(this).attr('data-id');

        var s = [];
       // console.log([id, as.images.data]);

        s.push("<label>Имя </label><input type='text' class='as-images-manager-name' value='" + as.images.options.data[id].name + "' /><br /><br />");
        s.push("<label>URL </label><input type='text' class='as-images-manager-url' value='" + as.images.options.data[id].url + "' /><br /><br />");
        s.push("<label>Описание </label><textarea class='as-images-manager-description' >" + as.images.options.data[id].description + "</textarea><br /><br />");
        s.push("<input type='button' class='as-images-manager-save btn btn-primary' value='" + as.resources.images_selectImage_save + "' /><br /><br /><hr />");
  
        s.push("<img src='" + $(this).attr('data-url') + "' alt='' class='as-images-manager-show' /> <br />");
        s.push("<a class='as-images-manager-delete btn btn-warning btn-sm' href='#'>" + as.resources.images_selectImage_Del + "</a> &nbsp;&nbsp;&nbsp;");
        s.push("<a class='as-images-manager-close  btn btn-danger btn-sm' href='#'>" + as.resources.images_selectImage_Close + "</a>");

        $('.as-images-manager-panel', cont).html(s.join(""));

        $('.as-images-manager-panel', cont).attr('data-id', id);
        
        $('html, body').animate({
            scrollTop: $('.as-images-manager-panel', cont).offset().top - 100
        }, 400);

    },
    appendPic: function (image, cont) {

        var item = '<a class="as-images-manager-add" href="#">' + as.resources.images_appendPic_Add + '</a>';
        if (image != '') {
            item = "<a href='#' class='as-images-manager-image'><img alt='' src='" + image + "' /></a>";
        }

        $(cont).append(item);
    },
    updateImagesOrder: function (cont) {
        var ids = "";
        $(".as-images-manager-items li .as-images-manager-image").each(function () {
            var id = $(this).attr('data-id');
            ids += id + ";";
        });
        var params = { code: cont.attr("data-code"), itemID: cont.attr("data-itemID"), nums: ids };
        console.log(params);
        as.sys.ajaxSend(as.images.options.ajax.updateImagesOrder, params, function (data) {
            if (typeof (data) != "object") data = eval('(' + data + ')');
            if (data.result) {
            //    btn.closest('.as-images-manager').find('.as-images-manager-image[data-id=' + param.id + ']').parent().hide(300, function () { $(this).remove(); });
            } else {
                as.sys.bootstrapAlert(data.msg || as.resources.images_showImagesManager_AlertError, { type: 'danger' });
            }
        });
    },
    showSlider: function (cont, items) {
            
    },
    showGallery: function (cont, items) {
        var s = [];
        s.push("dsdsd");



        cont.html(s.join(""));
    }




    
};
