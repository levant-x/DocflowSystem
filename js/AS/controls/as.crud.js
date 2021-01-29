// v0.10

var as = as || {};

////////////////// сделать: 

// вывод агрегирующих данных по таблице - напр при нажатии по столбцу
// если есть столбец color - то сразу красим


/// отложено
// ----установка фильтра в обобщенные значения (показать все новые задачи)
// ----сделать возможность навигации по строкам с возможность выбора 
// ----hot keys для выбранных строк


///////////////////// незадокументировано: 
// canReplace и showReplaceTool  ajaxURLFormat.format("replace")
// groupOperationsToolbar
// editHide  editSources
// фильтр сворачивается и запоминается в куки. filterTitle
// выгрузка в Excel - важно изменить в getItems  добавить параметр string mode
// создание статистики по датам isDateStat , метод Stat.
// тип данных дата.
// работа с статистикой по датам getDateStat, dateStat
// вторая сотрировка additionalSort, sort2, direction2
// + возможность копировать по др строке - кнопка copy и такой же метод
// гор клавиши - <a href='#' class='incCreateNewOrder btn btn-primary crdHotkey' data-hotkey='N'>Создать новый заказ</a>  и  Ctrl + Alt + N (создание) и Ctrl + Alt + F (фильтр)


// +документация по использованию
// +возможность показывать комменты для элемента
// +редактирование отдельных элементов
// +групповые операции (установка признака какого то)
// +пейджинг,  и настройка видимости галочек, сортировка, фильтр дополнительный, 
// +показ вложенных элементов
// + работа с select - select в редактировании
//+title
// +скрытие поля при редактировании + значение по умолчанию

// сделать чтобы progress bar в любом случае появлялся


as.crud = {
    options: {
        title: '',
        emptyText: as.resources.crudEmptyText,
        createLinkTitle: as.resources.crudCreateLinkTitle,
        filterLinkTitle: as.resources.crudFilterLinkTitle,
        filterTitle: as.resources.crudFilterTitle,
        showChecksCol: true,
        showNumsCol: true,
        showToolbar: true,
        showColSettings: true,
        showReplaceTool: false,
        showExcelExport: false,
        showPDFExport: false,
        toolbarAdditional: '',
        groupOperationsToolbar: '',        
        cont: null,
        ajaxURLFormat: "/serv/crud.aspx/{0}",  // save, getItems, remove, getItem
        inlineAjaxURL: "",
        pageSize: 3,
        page: 1,
        sort: '',
        direction: '',
        additionalSort: true,
        sort2: '',
        direction2: '',
        cookiePrefix: 'as-crud3-',
        cols: [
         { code: "", title: "", tooltip: "", isVisible: false, isPK: false, datatype: "", isRequired: false, callback: null },
         { code: "", title: "", tooltip: "", isVisible: false, isPK: false, datatype: "", isRequired: true, isSort: true, callback: function (el) { alert('asd2'); } },
         {
             code: "", title: "", tooltip: "", isVisible: false, isPK: false, datatype: "", isRequired: true,
             filter: { type: "select", source: [], notSelected: as.resources.crudNotSelected }
         }
        ],
        operations: {
            create: true,
            remove: true,
            edit: true,
            copy: false,
            comments: false,
            audioComments: false,
            dateStat: false,
            other: [
            //  { linkClass: 'crdDetails', iconClass: 'glyphicon glyphicon-th-large', title: 'Детали', callback: function (e) { } },
            ]
        },
        predefinedFilterLinks: [
            // {title: "", tooltip:"", code: "", setFilter: function(){} },
        ],
        getFilterMakeup: function (filter) { var res = ""; return res; },
        filter: function () {
            var res = [];
            return res;
        },
        
        processRowCallback: function (tr) {
        },
        getItemsCallback: function () { }
    },
    init: function (options) {
        as.crud.options = $.extend(as.crud.options, options);

        if (typeof String.prototype.format != 'function') {
            as.sys.init();
        }

        if (as.crud.options.cont) {
            as.crud.getItems(true);

            // потенциально узкое место
            $(document).keyup(function (e) {
                if(e.ctrlKey && e.altKey){
                    var ch = String.fromCharCode(e.which);
                    var btn = $(".crdHotkey[data-hotkey="+ch+"]", as.crud.options.cont);
                    if(btn.length>0){
                        btn.trigger('click');
                    }else{
                        switch(ch){
                             case "F": as.crud.filter(); break;
                             case "N":  
                                if (as.crud.options.operations.create){
                                    as.crud.showEditDialog(0); 
                                }
                                break;
                        }                                 
                    }
                }
            });
            
            $(document).delegate('.crdSort', 'click', function (e) {
                e.preventDefault();
                as.crud.sort($(this), e);
            });

            

            $(document).delegate('.crdFilterLink', 'click', function (e) {
                e.preventDefault();
                $('.crdPredefinedFilterLink').removeClass('btn-warning');
                as.crud.filter();
            });

            $(document).delegate('.crdCreate', 'click', function (e) {
                e.preventDefault();
                as.crud.showEditDialog(0);
            });
            $(document).delegate('.crdEdit', 'click', function (e) {
                e.preventDefault();
                var id = $(this).closest('tr').attr('data-itemID');
                as.crud.showEditDialog(id, $(this).closest('tr'));
            });
            $(document).delegate('.crdRemove', 'click', function (e) {
                e.preventDefault();
                as.crud.removeItem($(this));
            });
            $(document).delegate('.crdCopy', 'click', function (e) {
                e.preventDefault();
                as.crud.copyItem($(this));
            });

            $(document).delegate('.crdSelectAll', 'change', function (e) {
                $(this).closest('table').find('.crdSelect').prop("checked", $(this).prop("checked"));
                as.crud.updateGroupOperationsPanel();
            });

            $(document).delegate('.crdSelect', 'change', function (e) {
                as.crud.updateGroupOperationsPanel();
            });

            $(document).delegate('.crdSelect', 'click', function (e) {
                as.crud.updateGroupOperationsPanel();

                if (e.shiftKey && as.crud.lastCheck) {
                    var ind1 = $('.crdSelect').index($(this));
                    var ind2 = $('.crdSelect').index(as.crud.lastCheck);
                    var min = ind1 >= ind2 ? ind2 : ind1;
                    var max = ind1 >= ind2 ? ind1 : ind2;
                    $('.crdSelect').filter(':lt(' + max + ')').filter(':gt(' + min + ')').prop("checked", true);
                }
                if ($(this).is(":checked")) {
                    as.crud.lastCheck = $(this);
                } else {
                    as.crud.lastCheck = null;
                }
            });
            $(document).delegate('.crdItemLink', 'click', function (e) {
                e.preventDefault();
                var el = $(this);
                var code = $(this).closest("td").attr('data-code');
                var stop = false;
                $.each(as.crud.options.cols, function (i, col) {
                    if (stop) return;
                    if (col.code == code) {
                        if (col.callback) col.callback(el);
                        stop = true;
                    }
                });
            });

            if (as.crud.options.showColSettings) {
                $(document).delegate('.crdShowColSettingDialog', 'click', function (e) {
                    e.preventDefault();
                    as.crud.colSettings.showColSettings();
                });
            }
            if (as.crud.options.showReplaceTool) {
                $(document).delegate('.crdReplaceDialog', 'click', function (e) {
                    e.preventDefault();
                    as.crud.showReplaceDialog();
                });
                $(document).delegate('.crdReplaceSelect', 'change', function (e) {
                    e.preventDefault();
                    var s="";
                    var code = $("option:selected",this).val();
                    if(code){
                        var col = as.crud.getColByCode(code);                      
                        var m = as.makeup.getControlMakeupByDataType(col.datatype, "", col.editSources || []);
                        s+=as.resources.crudReplaceSelect + "<div class='crdReplaceFrom' data-datatype='" + col.datatype + "'>" + m + "</div>" + as.resources.crudReplaceSelect2 + "<div class='crdReplaceTo' data-datatype='" + col.datatype + "'>" + m + "</div>";
                    }                    
                    s+="";
                    $('.crdReplaceCont2').html(s);
                });
            }
             if (as.crud.options.showExcelExport) {              
                $(document).delegate('.crdShowExcelExport', 'click', function (e) {
                    e.preventDefault();
                     as.crud.getItems(false, "excel");                   
                });
             }

             if (as.crud.options.showPDFExport) {
                $(document).delegate('.crdShowPDFExport', 'click', function (e) {
                    e.preventDefault();
                    as.crud.getItems(false, "pdf");
                });
             }

             if (as.crud.options.predefinedFilterLinks && as.crud.options.predefinedFilterLinks.length > 0) {
                 $(document).delegate('.crdPredefinedFilterLink', 'click', function (e) {
                     e.preventDefault();                    
                     var code = $(this).attr('data-code');
                     $('.crdPredefinedFilterLink').removeClass('btn-warning');
                     
                     var filter = null;
                     $.each(as.crud.options.predefinedFilterLinks, function (i, item) {
                         if (item.code == code) filter = item.setFilter();
                     });
                     as.crud.options.page = 1;
                     as.crud.getItems(false, "", filter, function () {
                         $('.crdPredefinedFilterLink[data-code='+code+']').addClass("btn-warning");
                     });
                 });             
             }

            $(document).delegate('.crdFilter .panel-title>a', 'click', function(e){
                e.preventDefault();
                setTimeout(function(){                    
                    var isOut = as.sys.setCookie(as.crud.options.cookiePrefix + "filterCollapsed_" + as.crud.options.cont.attr('class'), $('#crdFilterPanel').hasClass("in") ? "0" : "1");           
                }, 500);                
            });

            if(as.crud.options.operations.dateStat){
                as.crud.dateStat.init();              
            }

            if (as.crud.options.operations.comments) {
                as.crud.comments.init();
            }

            $.each(as.crud.options.operations.other, function (k, operation) {
                if (operation.linkClass && operation.callback) {
                    $(document).delegate("." + operation.linkClass, 'click', operation.callback);
                }
            });
        }

    },
    getItems: function (isFirst, mode, hardFilter, callback) {
        params = as.crud.getSelectParams(isFirst, hardFilter);       
        params.mode= {};        
        params.mode.type = mode || ""; 
        params.mode.visibleCols = [];
        $(as.crud.options.cont).find(">table>thead>tr>th:visible").each(function(){
            var val = $(this).attr('data-code');
            if(val) params.mode.visibleCols.push({ code: val, title: $(this).text() });
        });      

        as.sys.ajaxSend(as.crud.options.ajaxURLFormat.format("getItems"), params, function (data) {
            if (typeof (data) != "object") data = eval('(' + data + ')');

            if (data.msg)
            {
                as.sys.showMessage(data.msg);
            }
            if (data.url) {
                if (data.url.trim() != "#") {
                    location.href = data.url;
                }
                return;
            }

            var s = "";
            if (as.crud.options.title) {
                s+="<h1>" + as.crud.options.title + "</h1>";
            }      
            s+=as.crud.getToolbarMakeup(params, data);
            s+=as.crud.getFilterMakeup(params.filter, isFirst);

            s+=as.crud.getPredefinedFilterLinksMakeup();
            console.log(data.items);
            if (data.items.length > 0) {
                s+="<table class='crdTable table table-hover table-condensed table-stripped table-bordered'>";
                s+="<thead><tr>";
                if (as.crud.options.showChecksCol) {
                    s+="<th><input type='checkbox' class='crdSelectAll' /></th>";
                }
                if (as.crud.options.showNumsCol) {
                    s+="<th>#</th>";
                }
                $.each(as.crud.options.cols, function (j, col) {
                    var hide = "";
                    if (!col.isVisible) hide = " hide ";

                    var sorts = params.sort.split(",");
                    var sort1 = sorts.length>0 ? sorts[0] : "";
                    var sort2 = sorts.length>1 ? sorts[1] : "";

                    var directions = params.direction.split(",");
                    var direction1 = directions.length>0 ? directions[0] : "";
                    var direction2 = directions.length>1 ? directions[1] : "";

                    var selSortClass = "";
                    if (sort1 == col.code && direction1 == "up") {
                        selSortClass = "crdSortUp";
                    }
                    if (sort1 == col.code && direction1 == "down") {
                        selSortClass = "crdSortDown";
                    }

                    var selSortClass2 = "";
                    if (sort2 == col.code && direction2 == "up") {
                        selSortClass2 = "crdSortUp2";
                    }
                    if (sort2 == col.code && direction2 == "down") {
                        selSortClass2 = "crdSortDown2";
                    }
                   
                    var headerName = col.isSort ? "<a class='crdSort' href='#' data-code='" + col.code + "'>" + col.title + "</a>" : col.title;

                    s+="<th class='crdItemHeader " + selSortClass + " " + selSortClass2 + " " + hide + "' data-code='" + col.code + "' title='" + col.tooltip + "' >" + headerName + "</th>";
                });
                if (as.crud.options.operations.edit) s+="<th></th>";
                if (as.crud.options.operations.remove) s+="<th></th>";
                if (as.crud.options.operations.copy) s+="<th></th>";
                if (as.crud.options.operations.comments) s+="<th></th>";
                if (as.crud.options.operations.dateStat) s+="<th></th>";
                if (as.crud.options.operations.other.length > 0) s+="<th></th>";

                

                s +="</tr></thead>";
                s+="<tbody>";
             
                $.each(data.items, function (i, item) {
                    var pkID = "";
                    var t = "";
                    if (as.crud.options.showChecksCol) {
                        t += "<td><input type='checkbox' class='crdSelect' /></td>";
                    }
                    if (as.crud.options.showNumsCol) {
                        t += "<td>" + ((as.crud.options.page - 1) * as.crud.options.pageSize + i + 1) + "</td>";
                    }

                    $.each(as.crud.options.cols, function (j, col) {
                        var hide = "";
                        if (!col.isVisible) hide = " hide ";
                        var name = item[col.code];
                        if (col.format) {
                            name = col.format.format(name);
                        }

                        if (col.callback) {
                            val = "<a class='crdItemLink' href='#'>" + name + "</a>";
                        } else {
                            if (col.editable) {
                                value = col.editable.type == "select" || col.editable.type == "checklist" ? item[col.code + "ID"] : item[col.code];
                                if (!value) value = item[col.code];

                                var dataMin = "";
                                if(col.editable.min){dataMin = " data-min='"+col.editable.min+"' "; }
                                var dataMax = "";
                                if(col.editable.max){dataMax = " data-max='"+col.editable.max+"' "; }
                                var dataStep = "";
                                if(col.editable.step){dataStep = " data-step='"+col.editable.step+"' "; }

                                val = "<a class='crdEditable' href='#' data-pk='" + pkID + "' data-type='" + col.editable.type + "' data-format='" + col.editable.format + "' " +
                                    " data-name='" + col.code + "' data-title='" + col.title + "' data-value='" + value + "' data-placement='" + (col.editable.placement || 'top') + "' "+
                                    dataMin + dataMax + dataStep+">" + item[col.code] + "</a>";
                                if (col.format) {
                                    val = col.format.format(val);
                                }

                            } else {
                                val = name;
                            }

                        }
                        t += "<td class='crdItem " + hide + "' data-code='" + col.code + "' title='" + col.title + "' >" + val + "</td>";
                        if (col.isPK) pkID = item[col.code];

                    });
                    
                    s+="<tr data-itemID='" + pkID + "' class='crdRow'>";
                    s+=t;
                    if (as.crud.options.operations.edit) s+="<td><a href='#' class='crdEdit' title='" + as.resources.crud_getItems_editTitle + "'><i class='glyphicon glyphicon-pencil'></i></a></td>";
                    if (as.crud.options.operations.remove) s+="<td><a href='#' class='crdRemove' title='" + as.resources.crud_getItems_deleteTitle + "'><i class='glyphicon glyphicon-remove'></i></a></td>";
                    if (as.crud.options.operations.copy) s+="<td><a href='#' class='crdCopy' title='" + as.resources.crud_getItems_copyTitle + "'><i class='glyphicon glyphicon-copy'></i></a></td>";
                    if (as.crud.options.operations.comments) s+="<td><a href='#' class='crdComments' title='" + as.resources.crud_getItems_commentTitle + "'><i class='glyphicon glyphicon-comment'></i></a></td>";
                    if (as.crud.options.operations.dateStat) s+="<td><a href='#' class='crdDateStat' title='" + as.resources.crud_getItems_dateStatTitle + "'><i class='glyphicon glyphicon-signal'></i></a></td>";
                   if (as.crud.options.operations.other.length > 0) {
                       s+="<td>";
                        $.each(as.crud.options.operations.other, function (k, operation) {
                            s+="<a href='#' class='crdOtherOperation " + operation.linkClass + "' title='" + operation.title + "'>" + ((typeof operation.iconClass == "undefined" ? operation.title : "<i class='" + operation.iconClass + "'></i>")) + "</a>";
                        });
                        s+="</td>";
                    }
                   s+="</tr>";
                });
                s+="</tbody>";
                s+="</table>";
                s+='<div id="pagingwrapper" class="pagingwrapper"><div id="pagingcontainer" class="pagingcontainer">&nbsp;</div></div>';

            } else {
                s+="<div class='alert alert-info'>" + as.crud.options.emptyText + "</div>";
            }
            s += "";
            as.crud.options.cont.html(s);


            // для inline select заменяем элементы с name на id 
            $.each(as.crud.options.cols, function (j, col) {
                if(col.editable&& col.editable.type=="select"){
                    $.each(col.editable.source, function(i, s){
                        $('.crdEditable[data-name='+col.code+'][data-value='+JSON.stringify(s.text)+']').attr('data-value', s.value);
                    });
                }
            });
            as.crud.setPaging(params.page, params.pageSize, data.total);
            as.crud.loadInlineEdit();
            if (as.crud.options.processRowCallback) {
                $('.crdTable>tbody>tr', as.crud.options.cont).each(function () {
                    as.crud.options.processRowCallback($(this));
                });
            }
            as.crud.colSettings.setColSettings();
            if (as.crud.options.getItemsCallback) as.crud.options.getItemsCallback(as.crud.options.cont);
            if (callback) callback();
	
            if (isFirst) {
                var parameters = as.tools.getUrlHashParameters();
               
                $.each(parameters, function (i, item) {
                    if (item.name == "goto") as.crud.gotoItem(parseInt(item.value));
                });
            }
        });
    },
    getSelectParams: function (isFirst, hardFilter) {
        var res = {
            page: as.crud.options.page,
            pageSize: as.crud.options.pageSize,
            filter: hardFilter ? hardFilter : as.crud.getFilterValues()
        };
        if(as.crud.options.additionalSort){
            res.sort = as.crud.options.sort + "," + as.crud.options.sort2;
            res.direction = as.crud.options.direction + "," + as.crud.options.direction2;
        }else{
            res.sort = as.crud.options.sort;
            res.direction = as.crud.options.direction;
        }        

        if (isFirst) {
            // если первичная загрузка - то считаем из куки
            var saveData = as.sys.getCookie(as.crud.options.cookiePrefix + "selectParams_" + as.crud.options.cont.attr('class'));
            if (saveData && saveData.length > 0) {
                res = JSON.parse(saveData) || {};
            }
            var urlHashParapmeters = as.crud.processParametersFromUrlHash();
            console.log(res);
            res = $.extend(res, urlHashParapmeters || {});
            console.log(res);
        } else {
            // сохраняем в куки
            var dataToSave = JSON.stringify(res);
            as.sys.setCookie(as.crud.options.cookiePrefix + "selectParams_" + as.crud.options.cont.attr('class'), dataToSave, 30);
        }       
        return res;        
    },
    getFilterValues: function(){
        var res = {};
        $.each(as.crud.options.cols, function (i, col) {
            if (col.filter && col.filter.type) {
                var ctl = $('.crdFilterItem[data-code=' + col.code + ']');
                var val = as.makeup.getValueFromControlMakeup(col.filter.type, ctl);
                res[col.code] = val;
            }
        });

        res = $.extend(res, as.crud.options.filter() || {});        
        return res;
    },
    processParametersFromUrlHash: function () {
        var res = {}; 
        var parameters = as.tools.getUrlHashParameters();
        if (parameters.length > 0) res.filter = {}; // обнуляем фильтр если есть что то в хеше на первый раз
        for (var i = 0; i < parameters.length; i++) {
            var p = parameters[i];
            if (p && p.name) {
                switch (p.name) {
                    case "page": res.page = parseInt(p.value) || 1; break;
                    case "sort": res.sort = p.value || ""; break;
                    case "direction": res.direction = p.value || ""; break;
                    default: 
                        res.filter = res.filter || {};
                        res.filter[p.name] = p.value; 
                        break;                
                }               
            } 
        }
        return res;
    },
    setPaging: function (page, pagesize, total) {

        function initPagination() {
            $("#pagingcontainer").pagination(total, {
                items_per_page: pagesize,
                callback: function (page_index, pagination_container) {
                    as.crud.options.page = (parseInt(page_index) + 1);
                    as.crud.getItems();
                },
                prev_text: as.resources.crud_initPagination_prev_text,
                next_text: as.resources.crud_initPagination_next_text,
                num_display_entries: 10,
                num_edge_entries: 1,
                current_page: page - 1
            });
            var pagingcontainerwidth = 252 + 20 * total / pagesize;
            $("#pagingcontainer").css('width', '' + pagingcontainerwidth + 'px');
        }
        as.sys.loadLib("/JS/pagination/jquery.pagination.js", "/JS/pagination/pagination.css", $("#pagingcontainer").pagination, initPagination);

    },
    sort: function (el, event) {
        var th = el.closest('th');
        var code = el.attr('data-code');

        if(as.crud.options.additionalSort && event.altKey){  // additional sort
            as.crud.options.sort2  = code;

             $('.crdTable>thead>th').removeClass("crdSortUp2 crdSortDown2");
            if (th.hasClass('crdSortUp2')) {
                th.addClass('crdSortDown2');
                as.crud.options.direction2 = "down";
            } else {
                th.addClass('crdSortUp2');
                as.crud.options.direction2 = "up";
            }
        }else{   // simple sort
            as.crud.options.sort = code;
            as.crud.options.sort2 = "";
            as.crud.options.direction2 = "";
            $('.crdTable>thead>th').removeClass("crdSortUp2 crdSortDown2");
            
            $('.crdTable>thead>th').removeClass("crdSortUp crdSortDown");
            if (th.hasClass('crdSortUp')) {
                th.addClass('crdSortDown');
                as.crud.options.direction = "down";
            } else {
                th.addClass('crdSortUp');
                as.crud.options.direction = "up";
            }
        }
        
        as.crud.options.page = 1;
        as.crud.getItems();
    },
    getFilterMakeup: function (params, isFirst) {
        var s = "";        
        var filter = as.crud.options.getFilterMakeup(params);        
        filter += as.crud.appendColFilters(params, isFirst);
        if (filter) {
            var isOut = as.sys.getCookie(as.crud.options.cookiePrefix + "filterCollapsed_" + as.crud.options.cont.attr('class'));      
            var inOut = "in";
            if(isOut=="1"){
                inOut = "out";
            }                  
            s+='<div class="panel-group crdFilter" id="crdFilter"><div class="panel panel-default">';
            s+='<div class="panel-heading"><h4 class="panel-title"><a data-toggle="collapse" data-parent="#crdFilter" href="#crdFilterPanel">'+as.crud.options.filterTitle+'</a></h4></div>'
            s+='<div id="crdFilterPanel" class="panel-collapse collapse '+ inOut +'"><div class="panel-body">';
            s+=filter;
            s+="<a href='#' class='crdFilterLink btn btn-default btn-sm'>" + as.crud.options.filterLinkTitle + "</a>";        
            s+='</div></div>';
            s+='</div></div>';
        }
        
        return s+="";
    },
    appendColFilters: function (params, isFirst) {
        var s = "";
        $.each(as.crud.options.cols, function (i, col) {
            if (col.filter && col.filter.type) {
                s+="<div class='crdFilterItem' data-code='" + col.code + "'>";              
                var defValue = params ? params[col.code] || "" : "";
                if (col.filter.notSelected &&  isFirst) col.filter.source.splice(0, 0,{ Text: col.filter.notSelected, Value: 0 });
                var ctl = as.makeup.getControlMakeupByDataType(col.filter.type, defValue, col.filter.source);
                s+="<span class='as-cap'>"+col.title+"</span>"
                s+=ctl;
                s+="</div>";
            }
        });
        return s+="";
    },
    filter: function () {
        as.crud.options.page = 1;
        as.crud.getItems();
    },
    getPredefinedFilterLinksMakeup: function(){
        var s = "";
        if (as.crud.options.predefinedFilterLinks && as.crud.options.predefinedFilterLinks.length > 0) {
            s+="<div class='crdPredefinedFilters'>";
            for (var i = 0; i < as.crud.options.predefinedFilterLinks.length; i++) {
                var item = as.crud.options.predefinedFilterLinks[i];
                s+="<a href='#' class='crdPredefinedFilterLink btn btn-default btn-xs' title='" + (item.tooltip || "") + "' data-code='" + item.code + "' >" + (item.title || "Filter") + "</a>";
            }
            s+="</div>";
        }
        return s+="";
    },
    showEditDialog: function (itemID, tr) {
        

        var s = "";
        s+="<div class='crdEditCont' data-itemID='" + itemID + "'>";

        $.each(as.crud.options.cols, function (i, col) {
            var val = tr ? $(".crdItem[data-code=" + col.code + "]", tr).html() : "";
            var hide = "";
            if (col.isPK || col.editHide) {
                hide = " hide ";
            }
            if (col.isPK && itemID == 0) {
                val = "0";
            }
            var m = as.makeup.getControlMakeupByDataType(col.datatype, val, col.editSources || [],"form-control");
            s+="<div class='crdEditItem " + hide + "' data-code='" + col.code + "' data-datatype='" + col.datatype + "' data-isRequired='" + (col.isRequired ? 1 : 0) + "'>" +
                "<span class='gCap'>" + col.title + "</span>" + m +
                "</div>";
        });
        s+="</div>";

        s += "";
        as.sys.showDialog(itemID > 0 ? as.resources.crud_showEditDialog_edit : as.resources.crud_showEditDialog_create, s, as.resources.crud_showEditDialog_save, function () {
            var ar = [];
            var errorMessage = "";
            var errorElement = null;
            $(".crdEditItem").each(function () {
                if (!errorMessage) {
                    var val = as.makeup.getValueFromControlMakeup($(this).attr('data-datatype'), $(this));
                    ar.push({ code: $(this).attr('data-code'), value: val || '' });
                    if ($(this).attr("data-isRequired") == "1" && !val) {
                        errorMessage = as.resources.crud_showEditDialog_errorMessage + $(".gCap", this).text();
                        errorElement = $(">:input", this);
                    }
                }
            });

            if (errorMessage) {
                as.sys.bootstrapAlert(errorMessage, { type: "warning" });
                if (errorElement) errorElement.focus();
                return;
            }
            var params = {
                fields: ar
            };
            as.sys.ajaxSend(as.crud.options.ajaxURLFormat.format("save"), params, function (data) {
                if (typeof (data) != "object") data = eval('(' + data + ')');
                if (data.result) {
                    as.sys.bootstrapAlert(data.msg || as.resources.crud_showEditDialog_savedMessage, { type: 'success' });
                    as.sys.closeDialog();
                    as.crud.getItems();
                } else {
                    as.sys.bootstrapAlert(data.msg || as.resources.crud_showEditDialog_savedErrMessage, { type: 'danger' });
                }
            });
        });

    },
    removeItem: function (btn) {
        var itemID = btn.closest('tr').attr('data-itemID');
        if (confirm(as.resources.crudRemoveConfirm) == false) return false;
        var params = {
            id: itemID
        };       
        as.sys.ajaxSend(as.crud.options.ajaxURLFormat.format("remove"), params, function (data) {
            if (typeof (data) != "object") data = eval('(' + data + ')');

            if (data.result) {
                as.sys.bootstrapAlert(data.msg || as.resources.crud_removeItem_savedMessage, { type: 'success' });
                btn.closest('tr').hide(100, function () { $(this).remove(); });
            } else {
                as.sys.bootstrapAlert(data.msg || as.resources.crud_removeItem_savedErrMessage, { type: 'danger' });
            }
        });
    },
    copyItem: function (btn) {
        var itemID = btn.closest('tr').attr('data-itemID');
        if (confirm(as.resources.crud_copyItem_confirm) == false) return false;
        var params = {
            id: itemID
        };
        as.sys.ajaxSend(as.crud.options.ajaxURLFormat.format("copy"), params, function (data) {
            if (typeof (data) != "object") data = eval('(' + data + ')');

            if (data.result) {
                as.sys.bootstrapAlert(data.msg || as.resources.crud_copyItem_savedMessage, { type: 'success' });
                as.crud.getItems();
            } else {
                as.sys.bootstrapAlert(data.msg || as.resources.crud_copyItem_savedErrMessage, { type: 'danger' });
            }
        });
    },
    getToolbarMakeup: function (params, data) {
        var t = "";
        if (as.crud.options.showToolbar) {
            t+="<div class='crdToolbar well well-sm'>";
            if (as.crud.options.operations.create) {
                t+="<a href='#' class='crdCreate btn btn-primary'>" + as.crud.options.createLinkTitle + "</a>";
            }


            if (as.crud.options.toolbarAdditional) {
                t+=as.crud.options.toolbarAdditional;
            }

            if (as.crud.options.showReplaceTool) {
                t+="<a href='#' class='crdReplaceDialog btn btn-default'>" + as.resources.crud_getToolbarMakeup_ReplaceDialog + "</a>";
            }
            if (as.crud.options.showColSettings) {
                t+="<a href='#' class='crdShowColSettingDialog btn btn-default'>" + as.resources.crud_getToolbarMakeup_ShowColSettingDialog + "</a>";
            }

            if (as.crud.options.showExcelExport) {
                t+="<a href='#' class='crdShowExcelExport btn btn-default'>" + as.resources.crud_getToolbarMakeup_HowExcelExport + "</a>";
            }

            if (as.crud.options.showPDFExport) {
                t+="<a href='#' class='crdShowPDFExport btn btn-default'>" + as.resources.crud_getToolbarMakeup_ShowPDFExport + "</a>";
            }

            

            t+="<div class='crdGroupOperations hide'>";
            t+=as.crud.options.groupOperationsToolbar || '';
            t+="</div>";

            t += "</div>";
        }
        return t+="";
    },
    updateGroupOperationsPanel: function () {
        if ($('.crdSelect:checked').length > 0) {
            $('.crdGroupOperations').removeClass('hide');
        } else {
            $('.crdGroupOperations').addClass('hide');
        }
    },
    loadInlineEdit: function () {
        if (as.crud.options.inlineAjaxURL) {
            function initInlineEdit(response, newValue) {              
                $('.crdEditable').editable({
                    url: as.crud.options.inlineAjaxURL,
                    emptytext: as.resources.crud_loadInlineEdit_emptyText,
                    mode: 'popup', // inline
                    source: function () {
                        var td =  $(this).closest('td');
                        var code = td.attr('data-code');
                        var val = td.find(">.crdEditable").text();                        
                        var col = as.crud.getColByCode(code); console.log("1111111");
                        var res = col.editable.source;
                        return res; 
                    },                    
                    success: function (response, newValue) {
                        var code = $(this).closest('td').attr('data-code');
                        var col = as.crud.getColByCode(code);
                        if (col.editable.callback) col.editable.callback($(this), newValue);
                    },
                    validate: function (value) {
                        var td = $(this).closest('td');
                        var code = td.attr('data-code');
                        var col = as.crud.getColByCode(code);
                        var pos = value.indexOf(".");
                        if (col.datatype == "int" && (!$.isNumeric(value) || pos != -1 || value != Math.round(value))) {
                            as.sys.bootstrapAlert(col.title + " должен быть целым числом", { type: 'warning' });
                            return "Ошибка";
                        } else value = Math.round(value);
                    }
                });
            }
            setTimeout(function () {
                initInlineEdit();
            }, 400);
        }
    },
    getColByCode: function (code) {
        var col = null;
        for (var i = 0; i <= as.crud.options.cols.length; i++) {
            col = as.crud.options.cols[i];
            if (col.code == code) {
                break;
            }
        }
        return col;
    },
    showReplaceDialog: function () {
        var s = "";
        s+="<div class='crdReplaceCont'>";
        var t = "";
       
        $.each(as.crud.options.cols, function (i, col) {            
            if(col.canReplace){
                t+="<option value='"+col.code+"'>"+col.title+"</option>";
            }
        });
        if(t.length>0){
           t +="";
            s+="" + as.resources.crud_showReplaceDialog_selectColum + " <select class='crdReplaceSelect'><option value=''>" + as.resources.crud_showReplaceDialog_notSelectColum + "</option>" + t + "</select>";
            s+="<div class='crdReplaceCont2'></div>";
        }else{
            s+="<div class='alert alert-info'>" + as.resources.crud_showReplaceDialog_replacementMessage + "</div>";
        }
        s+="</div>";
        s+="";
        as.sys.showDialog(as.resources.crud_showReplaceDialog_search, s, as.resources.crud_showReplaceDialog_replace, function () {
            var colName = $('.crdReplaceSelect option:selected').html();
            var colCode = $('.crdReplaceSelect option:selected').val();

            if(colCode==""){
                alert(as.resources.crud_showReplaceDialog_alertSElectColumn);
                return;
            }

            var from =  as.makeup.getValueFromControlMakeup($('.crdReplaceFrom').attr('data-datatype'), $('.crdReplaceFrom'));
            var to =  as.makeup.getValueFromControlMakeup($('.crdReplaceTo').attr('data-datatype'), $('.crdReplaceTo'));
            
            if (confirm('' + as.resources.crud_showReplaceDialog_confirm + ' (' + as.resources.crud_showReplaceDialog_confirm2 + ' ' + colName + ', ' + as.resources.crudReplaceSelect + ' ' + from + ' ' + as.resources.crudReplaceSelect2 + ' ' + to + '). ' + as.resources.crud_showReplaceDialog_confirm3 + ' ') == false) return false;
                        
            var params = { code: colCode, from: from, to: to};
            as.sys.ajaxSend(as.crud.options.ajaxURLFormat.format("replace"), params, function (data) {
                if (typeof (data) != "object") data = eval('(' + data + ')');

                if (data.result) {
                    as.sys.bootstrapAlert(data.msg || " " + as.resources.crud_showReplaceDialog_alertRes1 + " " + data.count +" " + as.resources.crud_showReplaceDialog_alertRes2 + "", { type: 'success' });
                    as.sys.closeDialog();
                    as.crud.getItems();
                } else {
                    as.sys.bootstrapAlert(data.msg || "" + as.resources.crud_showReplaceDialog_alertError + "", { type: 'danger' });
                }
            });
        });

    },
    gotoItem: function (itemID) {
        var el = $('tr[data-itemID=' + itemID + ']', as.crud.options.cont);
        if (el.length > 0) {
            $('html, body').animate({
                scrollTop: el.offset().top
            }, 500);
            el.addClass('as-markedRow');
            setTimeout(function () { el.removeClass('as-markedRow') }, 3000);
        }
    },
};


as.crud.colSettings = {
    setColSettings: function () {
        var shift = as.crud.options.showNumsCol ? 1 : 0;
        var saveData = as.sys.getCookie(as.crud.options.cookiePrefix + "colSettings_" + as.crud.options.cont.attr('class'));      
        if (saveData && saveData.length > 0) {
            var colNames = JSON.parse(saveData);
            if (colNames) {
                $(colNames).each(function (i, item) {
                    var tds = $(">table>thead>tr>th[data-code=" + item.colName + "],>table>tbody>tr>td[data-code=" + item.colName + "]", as.crud.options.cont);
                   
                    if (item.isVisible) {
                        tds.removeClass("hide");
                    } else {
                        tds.addClass("hide");
                    }

                    var indexInTable = $(">table>thead>tr>th[data-code=" + item.colName + "]", as.crud.options.cont).index();
                    if (indexInTable != i+shift) as.crud.colSettings.moveColumn(indexInTable, i+shift);
                });
            }
        }
    },
    showColSettings: function () {
        var shift = as.crud.options.showNumsCol ? 1 : 0;

        var s = "";
        s+="<ul class='crdColSettings'>";
        $(">table>thead>tr>th[data-code]", as.crud.options.cont).each(function () {
            var ch = "";
            if (!$(this).hasClass("hide")) {
                ch = " checked='checked' ";
            }
            s+="<li data-code='" + $(this).attr("data-code") + "'><i class='glyphicon glyphicon-move'></i> <span class='crdCol'>" + $(this).text() + "</span><input type='checkbox' class='crdColVisible' " + ch + " + title='" + as.resources.crud_showColSettings_title + "'></li>";
        });
        s+="</ul>";
        s+="";
        as.sys.showDialog(as.resources.crud_showColSettings_showDialogSetting, s, "OK", function () {
            var data = "";
            $(".crdColSettings li").each(function (i, item) {
                var colName = $(this).attr("data-code");
                var isVisible = $(".crdColVisible", this).is(":checked");
                data+={ colName: colName, isVisible: isVisible, position: i };
                if (isVisible) {
                    $(">table>thead>tr>th[data-code=" + colName + "],>table>tbody>tr>td[data-code=" + colName + "]", as.crud.options.cont).removeClass("hide");
                } else {
                    $(">table>thead>tr>th[data-code=" + colName + "],>table>tbody>tr>td[data-code=" + colName + "]", as.crud.options.cont).addClass("hide");
                }
                var indexInTable = $(">table>thead>tr>th[data-code=" + colName + "]", as.crud.options.cont).index();
                if (indexInTable != i+shift) as.crud.colSettings.moveColumn(indexInTable, i+shift);                
            });
            var dataToSave = JSON.stringify(data);
            as.sys.setCookie(as.crud.options.cookiePrefix + "colSettings_" + as.crud.options.cont.attr('class'), dataToSave, 30);
            as.sys.closeDialog();
        });
        setTimeout(function () { as.sys.setSortable($('.crdColSettings'), { handle: 'i.glyphicon-move' }); }, 50);
    },
    moveColumn: function (from, to) {
        $('>table>thead>tr,>table>tbody>tr', as.crud.options.cont).each(function () {
            var cols = $(this).children('th, td');
            cols.eq(from).detach().insertBefore(cols.eq(to));
        });
    }
};


as.crud.comments = {
    init: function () {

        $(document).delegate('.crdComments', 'click', function(e) {
            e.preventDefault();
            var btn = $(this);
            var tr = btn.closest('tr');
            if (tr.next().hasClass('crdAddRow')) {
                tr.next().hide(50, function() { $(this).remove() });
            } else {
                as.crud.comments.show(tr);
            }
        });

        $(document).delegate('.crdCommentAddLink', 'click', function(e) {
            e.preventDefault();
            var cont = $(this).closest(".crdCommentsCont");
            var text = $('.crdCommentText', cont).val();

            if ((!text && !cont.data('isSaved')) || ((text && !cont.data('isSaved') && cont.data('audioBlob')))) {

                if (cont.data('audioBlob')) {
                    alert(as.resources.crud_getComments_AddAudioRequest);
                }

                $('.crdCommentText', cont).focus();
                return;
            }

            as.crud.comments.addComment(cont, text);

            cont.children('div.crdAudioRec').remove();
            $(this).siblings('.crdAudioCommentInitLink').attr("disabled", false);
        });
                
        $(document).delegate('.crdAudioCommentInitLink', 'click', function (e) {
            e.preventDefault();
            var cont = $(this).closest(".crdCommentsCont");            
            as.crud.comments.initAudioComment(cont);
        });

        $(document).delegate('.crdAudioRecStartStopLink', 'click', function () {
            var cont = $(this).closest(".crdCommentsCont");
            as.crud.comments.startStop(this, cont, 60);
        });

        $(document).delegate('.crdAudioRecAddLink', 'click', function () {
            var cont = $(this).closest(".crdCommentsCont");
            if (cont.data('audioBlob')) {
                cont.data('isSaved', true);
                $(this).attr("disabled", true);
            }
        });

        $(document).delegate('.crdAudioRecCancelLink', 'click', function () {
            var cont = $(this).closest(".crdCommentsCont");
            as.audioRecorder.cancelRecording();

            cont.data('audioBlob', null);
            cont.data('isSaved', false);

            $('.crdAudioPlayer', cont).attr({ "src": null, "controls": false });

            $('.crdAudioRecAddLink', cont).attr("disabled", true);
            $('.crdAudioRecCancelLink', cont).attr("disabled", true);
        });

    },
    show: function(tr) {
        as.crud.comments.getComments(tr, function(m) {
            $("<tr class='crdAddRow'><td colspan='" + as.crud.options.cont.find("th:visible").length + "'>" + m + "</td></tr>").insertAfter(tr);
        });
    },
    getComments: function(tr, callback) {
        var params = {
            itemID: tr.attr('data-itemID')
        };

        as.sys.ajaxSend(as.crud.options.ajaxURLFormat.format("getComments"), params, function(data) {
            if (typeof (data) != "object") data = eval('(' + data + ')');

            if (data.result) {
                var s = "";
                s+="<div class='crdCommentsCont' data-itemID='" + params.itemID + "'>";
                s+="<table class='crdCommentsTable table table-bordered table-hover table-striped'>";
                s+="<thead><tr><th width='150px'>" + as.resources.crud_getComments_CommentsTable2 + "</th><th width='120px'>" + as.resources.crud_getComments_CommentsTable3 + "</th><th>" + as.resources.crud_getComments_CommentsTable1 + "</th>";
                if (as.crud.options.operations.audioComments) {
                    s+="<th>" + as.resources.crud_getComments_CommentsTable4 + "</th>";
                }
                s+="</tr></thead>";

                s+="<tbody>";

                if (data.items.length > 0) {
                    $.each(data.items, function (i, item) {
                        var itemMakeup = as.crud.comments.getItemMakeup(item);
                        s+=itemMakeup;
                    });
                } else {
                    s+="<tr><td colspan='3'><div class='alert alert-info crdNoComments'>" + as.resources.crud_getComments_NoComments + "</div></td></tr>";
                }
                s+="</tbody>";
                s+="</table>";                
                s+="<h5>" + as.resources.crud_getComments_AddComment + "</h5>";

                s+="<div class='crdCommentAdd'>";
                s+="<textarea class='crdCommentText'></textarea>";
                s+="<a href='#' class='btn btn-primary btn-sm crdCommentAddLink'>" + as.resources.crud_getComments_CommentAddLink + "</a>";
                
                if (as.crud.options.operations.audioComments) {
                    s+="<button class='btn btn-primary btn-sm crdAudioCommentInitLink'>" + as.resources.crud_getComments_AudioCommentInitLink + "</button>";
                }

                s+="</div>";

                s+="</div>";
                if (callback) {
                    s+="";
                    callback(s);
                }
            } else {
                as.sys.bootstrapAlert(data.msg || as.resources.crud_getComments_CommentError, { type: 'danger' });
            }
        });
    },
    getItemMakeup: function(item) {
        var res = "";
        res = "<tr data-itemID='" + item.id + "'><td>" + item.created + "</td><td>" + item.username + "</td><td>" + item.text + "</td>";
        if (as.crud.options.operations.audioComments) {            
            if (item.audio) {
                //res += "<td><a href='" + as.crud.options.ajaxURLFormat.format("getAudio") + "/" + item.id + "'>" + as.resources.crud_getComments_LoadAudioComment + "</a></td>";
                res += "<td><audio src='" + item.audio + "' controls></audio>";
                res += "<a href='" + as.crud.options.ajaxURLFormat.format("getAudio") + "/" + item.id + "' class='btn btn-primary btn-sm' style='margin-left:20px; margin-bottom:20px'>" + as.resources.crud_getComments_LoadAudioComment + "</a></td>";
                //res += "<button class='playAudio'>Play</button>";
            } else {
                res += "<td>" + as.resources.crud_getComments_NoAudioComment + "</td>";
            }
        }
        res += "</tr>";
        return res;
    },
    addComment: function (cont, text) {

        //alert(cont.data('isSaved'));

        if (cont.data('isSaved')) {

            var formData = new FormData();
            formData.append('itemID', cont.attr('data-itemID'));
            formData.append('text', text);
            formData.append('audioBlob', cont.data('audioBlob'));
            
            cont.data('isSaved', false);

            //alert(cont.data('isSaved'));

            as.sys.openProgressBar();

            as.audioRecorder.ajaxSend(as.crud.options.ajaxURLFormat.format("addComment"), formData, function (data) {
                if (typeof (data) != "object") data = eval('(' + data + ')');
                if (data.result) {
                    var itemMakeup = as.crud.comments.getItemMakeup(data.item);
                    $('.crdNoComments', cont).hide(100, function () {
                        $(this).remove();
                    });
                    $(cont).find(".crdCommentsTable>tbody").append(itemMakeup);
                    $('.crdCommentText', cont).val('');
                } else {
                    as.sys.bootstrapAlert(data.msg || as.resources.crud_getComments_CommentError, { type: 'danger' });
                }
            }, false);

        } else {

            var params = {
                itemID: cont.attr('data-itemID'),
                text: text
            };

            as.sys.ajaxSend(as.crud.options.ajaxURLFormat.format("addComment"), params, function (data) {
                if (typeof (data) != "object") data = eval('(' + data + ')');
                if (data.result) {
                    var itemMakeup = as.crud.comments.getItemMakeup(data.item);
                    $('.crdNoComments', cont).hide(100, function () {
                        $(this).remove();
                    });
                    $(cont).find(".crdCommentsTable>tbody").append(itemMakeup);
                    $('.crdCommentText', cont).val('');
                } else {
                    as.sys.bootstrapAlert(data.msg || as.resources.crud_getComments_CommentError, { type: 'danger' });
                }
            });

        }

    },


    initAudioComment: function (cont) {

        as.audioRecorder.init(
        {
            isSavelocal: true
        });

        if (!as.audioRecorder.vars.recorder) {
            as.audioRecorder.getMedia(function () {
                showRecButtons();
            })          
        }
        else {
            showRecButtons();
        }

        function showRecButtons() {
            if ($("div.crdAudioRec", cont).length == 0) {

                cont.append("<div class='crdAudioRec'></div>");

                var s = "";
                s += "<button class='btn btn-primary btn-sm crdAudioRecStartStopLink' >" + as.resources.crud_getComments_AudioRecStartLink + "</button>";
                s += "<button class='btn btn-primary btn-sm crdAudioRecAddLink' disabled>" + as.resources.crud_getComments_AudioRecAddLink + "</button>";
                s += "<button class='btn btn-primary btn-sm crdAudioRecCancelLink' disabled>" + as.resources.crud_getComments_AudioRecCancelLink + "</button></br>";
                s += "<audio class='crdAudioPlayer'></audio>";
                s += "";

                $('.crdAudioRec', cont).append(s);

                $('.crdAudioCommentInitLink', cont).attr("disabled", true);
            }
        }
    },

    startStop: function (btnCont, cont, maxLength) {

        if ($(btnCont).hasClass('stop')) {

            if (cont.data('timer')) {
                clearTimeout(cont.data('timer'));
                cont.data('timer', 0);
            }

            cont.data('stopTime', $.now());

            as.audioRecorder.stopRecording(cont, 'audioBlob');

            $(btnCont).removeClass('stop').html(as.resources.crud_getComments_AudioRecStartLink);

            $('.crdAudioPlayer', cont).attr({ "src": null, "controls": false });
            $('.crdAudioRecAddLink', cont).attr("disabled", false);
            $('.crdAudioRecCancelLink', cont).attr("disabled", false);

            $('.crdAudioPlayer', cont).attr("controls", true);
            setTimeout(function () {
                $('.crdAudioPlayer', cont).attr("src", (window.URL || window.webkitURL).createObjectURL(cont.data('audioBlob')));
            }, 100 + (cont.data('stopTime') - cont.data('startTime')) / 80);

        } else {
            cont.data('startTime', $.now());

            as.audioRecorder.startRecording();

            cont.data('audioBlob', null);
            cont.data('isSaved', false);

            $(btnCont).addClass('stop').html(as.resources.crud_getComments_AudioRecStopLink);

            $('.crdAudioRecAddLink', cont).attr("disabled", true);
            $('.crdAudioRecCancelLink', cont).attr("disabled", true);

            $('.crdAudioPlayer', cont).attr("controls", false);
            //Устанавливаем максимальную длительность записи
            cont.data('timer', setTimeout(function () { as.crud.comments.startStop(btnCont, cont, maxLength); }, maxLength * 1000));
        }

    }
};

as.crud.dateStat = {
    init: function() {
        $(document).delegate('.crdDateStat', 'click', function(e) {
            e.preventDefault();
            var tr = $(this).closest('tr');
            if (tr.next().hasClass('crdAddRowStat')) {
                tr.next().hide(50, function() { $(this).remove() });
            } else {
                as.crud.dateStat.show(tr);
            }
        });

        $(document).delegate('.crdPeriod', 'click', function(e) {
            e.preventDefault();
            var tr = $(this).closest('tr');

            if (tr.next().is(".crdAddRowStat2")) {
                tr.next().hide(100, function() { $(this).remove(); });
            } else {
                var prevPeriod = $(this).closest('.crdStatCont').attr('data-period');
                var period = "years";
                if (prevPeriod == "years") period = "months";
                if (prevPeriod == "months") period = "days";
                var from = tr.attr('data-from');

                var colCount = tr.find("td").length;
                as.crud.dateStat.getStat(tr.closest('.crdAddRowStat').prev().attr('data-itemID'), period, from, function(m) {
                    $("<tr class='crdAddRowStat2'><td colspan='" + colCount + "'>" + m + "</td></tr>").insertAfter(tr);
                });
            }
        });
    },
    show: function(tr, period, from) {
        if (!period) period = "years";
        as.crud.dateStat.getStat(tr.attr('data-itemID'), period, from, function(m) {
            $("<tr class='crdAddRowStat'><td colspan='" + as.crud.options.cont.find("th:visible").length + "'>" + m + "</td></tr>").insertAfter(tr);
        });
    },
    getStat: function(itemID, period, from, callback) {
        var params = {
            itemID: itemID,
            period: period || 'years',
            from: from || ''
        };
        as.sys.ajaxSend(as.crud.options.ajaxURLFormat.format("getDateStat"), params, function(data) {
            if (typeof (data) != "object") data = eval('(' + data + ')');

            if (data.result) {
                var s = "";
                s+="<div class='crdStatCont' data-itemID='" + params.itemID + "' data-period='" + params.period + "' data-from='" + params.from + "' >";
                s+="<table class='crdStatTable table table-bordered table-hover table-striped'>";
                s+="<thead><tr>";

                var pediodName = "";
                if (params.period == "years") pediodName = as.resources.crud_getStat_Year;
                if (params.period == "months") pediodName = as.resources.crud_getStat_Manth;
                if (params.period == "days") pediodName = as.resources.crud_getStat_Date;

                s+="<th>" + pediodName + "</th>";
                $.each(data.headers, function(i, header) {
                    s+="<th>" + header + "</th>";
                });

                s+="</tr></thead>";
                s+="<tbody>";

                if (data.items.length > 0) {
                    $.each(data.items, function(i, item) {
                        var itemMakeup = as.crud.dateStat.getItemMakeup(item);
                        s+=itemMakeup;
                    });
                } else {
                    s+="<tr><td colspan='3'><div class='alert alert-info crdNoStat'>" + as.resources.crud_getStat_NoStat + "</div></td></tr>";
                }
                s+="</tbody>";
                s+="</table>";
                s+="</div>";
                if (callback) {
                    s+="";
                    callback(s);
                }
            } else {
                as.sys.bootstrapAlert(data.msg || as.resources.crud_getStat_ErrorStat, { type: 'danger' });
            }
        });
    },
    getItemMakeup: function(item) {
        var s = "";
        s+="<tr data-from='" + item.from + "'>";
        var periodLink = item.periodName;
        if (item.period != "days") periodLink = "<a href='#' class='crdPeriod'>" + item.periodName + "</a>";
        s+="<td>" + periodLink + "</td>";
        $.each(item.values, function(item, value) {
            s+="<td>" + value + "</td>";
        });
        s+="</tr>";
        s+="";
        return s;
    }
};

