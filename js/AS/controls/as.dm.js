var as = as || {};

as.dm = {
    options: {
        ajax: {           
            getTable: '/dm/GetTable',
            GetTableItemActions: '/dm/GetTableItemActions',
            DeleteTable: '/dm/DeleteElement',
            EditElement: '/dm/EditElement',
            SaveElement: '/dm/SaveElement',
            getTableHeaderById: '/dm/EditElement'
        },
        captions: {
            //
        }
    },
    init: function () {
        if ($('.as-dm-table').length == 0) {
            return;  // фактически не подключаем модуль
        }
        // подключаем обработчики
        $('.as-dm-table').each(function () {
            as.dm.loadTable($(this));
        });


        $(document).delegate('a', 'click', as.dm.buttonClick);
    },
    loadTable: function (cont) {
        var tableName = cont.attr('tableName');
        cont.append("<div class='as-table-toolbar well well-small btn-group'>" +
            "<button type='button' class='btn btn-default'><span class='glyphicon glyphicon-adjust'></span> Columns</button>" +
            "<button type='button' class='btn btn-default'><span class='glyphicon glyphicon-sort'></span> Sort</button>" +
            "</div>");
        cont.append("<div class='as-table-body'>table body</div>");
        cont.append("<div class='as-pagination'>paging</div>");
        var params = {};
        as.sys.ajaxSend(as.dm.options.ajax.getTable, { tableName: tableName }, function (data) {
            alert(data.tableTitle);            
        });

        
    },
    buttonClick: function (e) {

    }
};