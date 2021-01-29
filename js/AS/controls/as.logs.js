var as = as || {};

as.logs = {    
    options: {
        ajax: {
            getLog: "/Log/GetLog",
            saveLogFilling: "/Log/SaveLogFilling"
        }
    },
    init: function () {
        as.logs.processLogs();
    },
    processLogs: function () {
            $('.as-log').each(function () {
                as.logs.showLog($(this));
            });
            $(document).delegate('.lgItem input[type=text], .lgItem input[type=checkbox], .lgItem select', 'change', as.logs.fieldChange);
               
    },
    showLog: function (cont) {       
        var code = cont.attr('code');        
        as.sys.ajaxSend(as.logs.options.ajax.getLog, { code: code }, function (data) {
            var s = [];
            s.push("<h3>" + data.name + "</h3>");
            
            s.push("<table class='table table-hover table-bordered'>");
            s.push("<thead><tr>");
            s.push("<td>Item</td>");
            $.each(data.cols, function (j, col) {
                var cl = '';
                if (col.IsCurrent) {
                    cl = ' class="lgCur" ';
                }
                var th = "<th "+cl+">"+col.Name+"</th>";
                s.push(th);
            });
            s.push("</tr></thead>");

            $.each(data.items, function (i, item) {
                s.push("<tr>");
                s.push("<td>"+item.name+"</td>");
                $.each(item.colValues, function (j, col) {
                    var makeup = as.logs.getControlMakeup(item.id, item.name, item.typecode, item.typeID, item.tooltip, col.Value, item.selectValues);
                    var cl = '';
                    if (col.IsCurrent) {
                        cl = ' class="lgCur" ';
                    }
                    var td = "<td "+cl+" itemID='"+item.id+"' dt='" + col.Date + "'>" + makeup + "</td>";
                    s.push(td);
                });
                s.push("</tr>");
            });
            s.push("</table>");         
            
            cont.html(s.join(""));          
        });
    },
    getControlMakeup: function (itemID, name, typecode, typeID, tooltip, defValue, valuesForSelect) {
        var res = "";

        var ctl = "";
       
        ctl = as.tools.getControlMakeupByDataType(typecode, defValue, valuesForSelect);       
        res = "<div class='lgItem' itemID='" + itemID + "' typecode='" + typecode + "' typeID='" + typeID + "' title='" + tooltip + "'>" + ctl + "</div>";
        return res;
    },
    fieldChange: function () {
        var td = $(this).closest('td');
        var newValue = as.logs.getValueFromControlMakeup($(this).closest('.lgItem'));
        var itemID =td.attr('itemID');
        var dt = td.attr('dt');
        var logCode = $(this).closest('.as-log').attr('code');
      
        var input = $(this);
        input.css('background', '#f1f498');
        as.sys.ajaxSend(as.logs.options.ajax.saveLogFilling, 
            { logCode: logCode, value: newValue, itemID: itemID, dt: dt }, 
            function (data) {
                if (data.result == 1) {
                    input.css('background', '#4dcc6b');
                    setTimeout(function () {
                        input.css('background', '#fff');
                    }, 1500);
                } else {
                    input.css('background', '#ff572a');
                    setTimeout(function () {
                        input.css('background', '#fff');
                    }, 5500);
                }
        });
    },
    getValueFromControlMakeup: function (ctl) {
        var res = "";
        var typecode = ctl.attr("typecode");
        res =  as.tools.getValueFromControlMakeup(typecode, ctl);        
        return res;
    }
};