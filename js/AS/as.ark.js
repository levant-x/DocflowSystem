var as = as || {};

as.ark = {
    options: {
    },
    init: function (options) {

        as.ark.options = $.extend(as.ark.options, options);
        as.ark.loadStuffElements();
        as.ark.settings.init();
        as.ark.text.init();
        as.ark.image.init();
        as.metrics.init();
        as.simpleForm.init({ ajaxURLFormat: "/arkStuff/simpleForm_{0}" });      
        as.info.init();
        as.ark.loadApplets();
        as.export.init();
        as.images.init();
        as.files.init();
        as.sqlCrud.init();
        as.replace.init();
        as.mosaik.init();
        as.textMistakes.init();
        as.userchecks.init();
        //as.countdown.init();
        as.jubilee.init();
        as.opinion.init();
    },
    loadStuffElements: function () {
        as.sys.ajaxSend("/ArkStuff/loadStuffElements", { url: location.href }, function (data) {
            as.ark.settings.options.items = data.menuProfileItems;
            as.ark.loadUserBar(data.name, data.menuProfileItems);
            as.ark.loadMenu(data.menuItems);

        });
    },
    loadUserBar: function (name, items) {
        var s = [];
        var cont = $(".as-loginStatus");
        var userBarInfo = {
            id: "UserBar",
            name: "<span class='UserName'>" + name + "</span>",
            items: []
        };

        $.each(items, function (i, item) {
            userBarInfo.items.push(item);
        });
        
        if (name == "core-guest@mail.ru")
        {
            userBarInfo.items.push(
                                  { name: '', cssclass: 'anchor divider' },
                                  { name: as.resources.profile, href: '/Account/Profile', cssiconclass: 'fa fa-user fa-fw', cssclass: 'anchor' },                                 
                                 
                                  { name: as.resources.siteout, href: '/Account/LogOff', cssiconclass: 'fa fa-sign-out fa-fw', cssclass: 'anchor' });
        }
        else {
            userBarInfo.items.push({ name: as.resources.metrics, href: '/Demo/Metrics', cssclass: 'fa fa-home fa-fw' },
                                   { name: '', cssclass: 'anchor divider' },
                                   { name: as.resources.profile, href: '/Account/Profile', cssiconclass: 'fa fa-user fa-fw', cssclass: 'anchor' },
                                   { name: as.resources.changepassword, href: '/Account/ChangePassword', cssiconclass: 'fa fa-key fa-fw', cssclass: 'anchor' },
                                   { name: as.resources.settings, href: '#', cssiconclass: 'glyphicon glyphicon-wrench', cssclass: 'anchor settings' },
                                   { name: as.resources.siteout, href: '/Account/LogOff', cssiconclass: 'fa fa-sign-out fa-fw', cssclass: 'anchor' });
        }
        if (cont.attr("data-cabinet") == "1") {
            s.push('<a class="dropdown-toggle" data-toggle="dropdown" href="#"><i class="fa fa-user fa-fw"></i> ' + name + ' <i class="fa fa-caret-down"></i></a>');
            s.push('<ul class="dropdown-menu dropdown-user">');
            $.each(userBarInfo.items, function (i, item) {
                if (item.cssclass == 'anchor divider') s.push('<li class="divider"></li>');
                else s.push('<li><a href="' + item.href + '" class = "'+ item.cssclass + '"><i class="' + item.cssiconclass + '"></i> ' + item.name + '</a></li>');
            });
            s.push('</ul>');
        } else {
            s.push(as.makeup.getDropdownMakeup(userBarInfo));
        }
        cont.html(s.join(""));
    },

   
    loadMenu: function (items) {

        var s = [];
        if (!items) return;
        var cont = $(".as-mainMenu");
        s.push('<div class="sidebar-nav navbar-collapse">');
        s.push('<ul class="nav" id="side-menu">');

        $.each(items, function (i, item) {

            var ar = "";
            if (item.items.length > 0) ar = '<span class="fa arrow"></span>';

            var isActiveClass = "";
            if (item.isActive) isActiveClass = " class='active' ";
            s.push('<li><a ' + isActiveClass + ' href="' + item.url + '" title="' + item.title + '"><i class="' + item.cssclass + '"></i> ' + item.name + ar + '</a>');
            if (item.items.length > 0) {
                s.push('<ul class="nav nav-second-level">');
                $.each(item.items, function (j, item1) {
                    var ar1 = "";
                    if (item1.items.length > 0) ar1 = '<span class="fa arrow"></span>';
                    var isActiveClass1 = "";
                    if (item1.isActive) isActiveClass1 = " class='active' ";
                    s.push('<li><a ' + isActiveClass1 + ' href="' + item1.url + '" title="' + item1.title + '"><i class="' + item1.cssclass + '"></i> ' + item1.name + ar1 + '</a>');
                    if (item1.items.length > 0) {
                        s.push('<ul class="nav nav-third-level">');
                        $.each(item1.items, function (k, item2) {
                            var isActiveClass2 = "";
                            if (item2.isActive) isActiveClass2 = " class='active' ";

                            s.push('<li><a ' + isActiveClass2 + ' href="' + item2.url + '" title="' + item2.title + '"><i class="' + item2.cssclass + '"></i> ' + item2.name + '</a>');
                            s.push('</li>');
                        });
                        s.push('</ul>');
                    }
                    s.push('</li>');
                });
                s.push('</ul>');
            }
            s.push('</li>');
        });
        s.push("</ul>");
        s.push("</div>");
        cont.html(s.join(""));
        try {
            $('#side-menu').metisMenu();
        } catch (ex) { }


    },
    loadApplets: function () {
        try {
            $('.as-showimage').fancybox();
        } catch (ex) { }
    },
    loadNotifications: function () {
        // аналогично - выводим если есть уведомления (по системе или от других юзеров)
        // GAG! это пока не делаем
    }
};

as.ark.settings = {
    options: {
        items: []
    },
    init: function () {

        $(document).delegate(".settings", 'click', function (e) {
            e.preventDefault();

            var s = [];
            s.push("<div class='crdToolbar well well-sm'><a href='#' class='btn btn-primary addprofilemenu'>" + as.resources.ark_init_AddMenu + "</a></div></div>")
            s.push("<div class='itemsTable'></div>");
            as.sys.showDialog(as.resources.ark_init_showDialogEditProfile, s.join(""), as.resources.ark_init_showDialogSaveProfile, function () {
                as.ark.settings.saveMenuProfileTable();
                var params = { editMenu: as.ark.settings.options.items };
                as.sys.ajaxSend("/ArkStuff/EditProfileMenu", params, function (data) {
                    if (typeof (data) != "object") data = eval('(' + data + ')');

                    if (data.result) {
                        as.sys.bootstrapAlert(as.resources.ark_init_showDialogSuccessSave, { type: 'success' });
                        as.sys.closeDialog();
                        as.ark.loadStuffElements();
                        setTimeout(function () {
                            as.crud.gotoItem(data.guid);
                        }, 1000);
                    } else {
                        as.sys.bootstrapAlert(data.msg || as.resources.ark_init_showDialogErrorSave, { type: 'danger' });
                    }
                });
            });
            as.ark.settings.loadMenuProfileTable();
        });       

        $(document).delegate(".addprofilemenu", 'click', function (e) {
            e.preventDefault();
            var newId = (as.ark.settings.options.items.length + 1) * -1;
            as.ark.settings.options.items.push({ id: newId, name: '', href: '', cssClass: '' });
            as.ark.settings.saveMenuProfileTable();
            as.ark.settings.loadMenuProfileTable();
        });

        $(document).delegate('.menuRemove', 'click', function (e) {
            e.preventDefault();
            var id = $(this).attr('data-itemid')

            for (var i = as.ark.settings.options.items.length; i--;) {
                if (as.ark.settings.options.items[i].id == id) {
                    as.ark.settings.options.items.splice(i, 1);
                }
            }
            as.ark.settings.loadMenuProfileTable();
        });
    },
    loadMenuProfileTable: function () {
        var items = as.ark.settings.options.items;
        var s = [];
        if (items.length > 0) {
            s.push("<table id='menuprofiles' class='table table-striped table-bordered' cellspacing='0' width='100%'>");
            s.push("<thead>");
            s.push("<tr> <th>" + as.resources.ark_loadMenuProfileTable_Name + "</th> <th>" + as.resources.ark_loadMenuProfileTable_Link + "</th> <th>" + as.resources.ark_loadMenuProfileTable_Class + "</th> <th></th> </tr>");
            s.push("</thead>");
            s.push("<tbody>");
            $.each(items, function (i, item) {
                s.push("<tr>");
                s.push("<td><input type='text' class='form-control menuprofilename' value = " + item.name + "></td>");
                s.push("<td><input type='text' class='form-control menuprofilehref' value = " + item.href + "></td>");
                s.push("<td><input type='text' class='form-control menuprofileicon' value = " + item.cssClass + "></td>");
                s.push('<td><a href="#" data-itemid = "' + item.id + '" class="menuRemove" title="' + as.resources.ark_loadMenuProfileTable_RemoveTitle + '"><i class="glyphicon glyphicon-remove"></i></a></td>');
                s.push("</tr>");
            });
            s.push("</tbody>");
            s.push("</table>");
        }
        $(".itemsTable").html(s.join(""));
    },
    saveMenuProfileTable: function()
    {
        $(".menuprofilename").each(function (index) {
            if ($(this).val() != null)
                as.ark.settings.options.items[index].name = $(this).val();
            else
                as.ark.settings.options.items[index].name = "";
        });
        $(".menuprofilehref").each(function (index) {
            if ($(this).val() != null)
                as.ark.settings.options.items[index].href = $(this).val();
            else
                as.ark.settings.options.items[index].href = "";
        });
        $(".menuprofileicon").each(function (index) {
            if ($(this).val() != null)
                as.ark.settings.options.items[index].cssClass = $(this).val();
            else
                as.ark.settings.options.items[index].cssClass = "";
        });
    }
};




as.ark.text = {
    curElement: {},
    ajax:
    {
        UrlSave: "/ArkStuff/ArkImgSave/",
        UrlExist: "/ArkStuff/ArkImgExist/"
    },
    width: "auto",
    height: "200px",

    init: function () {
        if ($("div.as-text").length > 0) {

            as.ark.text.showTexts();
            as.ark.text.delegateCanEdit('.as-text-canEdit', 'as-text-click');

            as.ark.text.delegateClickEdit('a.as-text-click', "div.as-text-canEdit");

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

    delegateCanEdit: function (canEdit, asClick) {
        $(document).delegate(canEdit, 'mouseenter mouseleave', function (event) {
            if (event.type == 'mouseenter') {
                var Sel = $(this);
                if (Sel.find("div.as-hover-toolbar").length == 0) {
                    Sel.append("<div class='as-hover-toolbar'></div>");

                }
                Sel.find("div.as-hover-toolbar").append("<div class='as-edit'>" +
                                                    "<a href='#' class=" + asClick + "><i class='glyphicon glyphicon-edit' title='" + as.resources.ark_image_init_title + "' alt='" + as.resources.ark_image_init_alt + "' ></i></a>" +
                                                    "</div>");
            }
            else {
                $(this).find("div.as-hover-toolbar").remove();
            }
        });
    },

    delegateClickEdit: function (click, divParent) {
        $(document).delegate(click, 'click', function (e) {
            e.preventDefault();
            as.ark.text.curElement = $(this).parent("div.as-edit").parent("div.as-hover-toolbar").parent(divParent);
            if (as.ark.text.curElement.attr("data-mode") == "image")
                as.ark.text.editImage();
            else as.ark.text.editText();
        });
    },

    showTexts: function () {
        var codes = [];
        $('.as-text').each(function () {
            if ($(this).attr('data-seotext') != "1") {
                var code = $(this).attr('data-code');
                if (code) codes.push(code);
            }
        });
        as.sys.ajaxSend("/ArkStuff/GetTexts", { codes: codes }, function (data) {
            $.each(data.items, function (i, item) {
                var el = $('.as-text[data-code=' + item.code + ']');
                el.html(item.text);
            });
            if (data.canEdit) $('.as-text').addClass('as-text-canEdit');
        });
    },

    editImage: function () {
        if (as.ark.text.curElement.attr("data-mode") == "image" && as.ark.text.curElement.attr("data-mode") != "undefined") {
            as.ark.text.curElement.find("div.as-hover-toolbar").remove();
            as.fe.showFileExplorerDialog(as.resources.ark_editImage_Manager, "image/jpeg, image/png, image/gif", as.resources.ark_editImage_Select, $('#asModal'), function (url, curElementData) {

                var alt = $('input.feAlt').val();
                if (alt == "" || alt == "undefined") {
                    alt = curElementData.attr('data-name');
                }
                var NameCodeDiv = "";
                var dc = as.ark.text.curElement.attr("data-code");
                as.sys.ajaxSend(as.ark.text.ajax.UrlExist, { codeDiv: dc }, function (dataIs) {
                    if (dataIs.STATUS == "NotExist") {
                        NameCodeDiv = prompt('Введите название блока', dc);
                    }
                    if (dataIs.STATUS == "ItExists" || dataIs.STATUS == "NotExist") {
                        as.sys.ajaxSend(as.ark.text.ajax.UrlSave, { ImgText: "|||" + url + "|||" + alt, codeDiv: dc, NameDiv: NameCodeDiv }, function (data) {

                            if (data.STATUS == "OK") {
                                as.ark.text.curElement.html("<img id='" + dc + "' src='" + url + "' alt='" + alt + "' width='" + as.ark.text.width + "' height='" + as.ark.text.height + "'>");
                            }
                        }, false, false);
                    }

                }, false, false);
            });
        }
    },

    editText: function (btn) {
        var s = [];
        var t = as.ark.text.curElement;
        as.ark.text.curElement.find("div.as-hover-toolbar", t).remove();

        var code = t.attr('data-code');
        var text = t.html();
        s.push("<textarea class='as-html as-text-text' rows='15' cols='120' style='max-width: 500px;'>" + text + "</textarea>");


        function CloseText() {
            as.sys.closeDialog();
            $("div.modal-body").html("");
        }
        as.sys.showDialog(as.resources.ark_editText_showDialogEdit, s.join(""), as.resources.ark_editText_showDialogSave, function () {

            var mce1 = tinyMCE.get($('textarea.as-text-text').attr('id'));
            var text1 = mce1.getContent ? mce1.getContent() : $('textarea.as-text-text').val();
            var params = { text: text1, code: code };

            as.sys.ajaxSend("/ArkStuff/SaveText", params, function (data) {
                if (typeof (data) != "object") data = eval('(' + data + ')');
                if (data.result) {
                    as.sys.bootstrapAlert(as.resources.ark_editText_AlertSuccess, { type: 'success' });
                    t.html(text1);
                } else {
                    as.sys.bootstrapAlert(data.msg || as.resources.ark_editText_AlertError, { type: 'danger' });
                }
            });
            CloseText();
        }, false, function () { },
        function () {
            CloseText();
        }
        );
    }
};