var as = as || {};

as.reports = {
    curReportCode: '',
    options: {
        ajax: {
            getReportParameters: "/Report/GetReportParameters",
            getReport: "/Report/GetReport"
        }
    },
    init: function () {
        $(document).delegate('.as-report', 'click', as.reports.showParametersWindow);
    },
    showParametersWindow: function (e) {
        e.preventDefault();
        var reportCode = $(this).attr('code');
        as.reports.curReportCode = reportCode;
        as.sys.ajaxSend(as.reports.options.ajax.getReportParameters, { code: reportCode }, function (data) {
            var s = [];
            $.each(data.parameters, function (i, item) {
                var m = as.reports.getControlMakeup(item.id, item.name, item.typecode, item.typeID, item.tooltip, item.defValue, item.values);
                s.push(m);                
            });
            as.sys.showDialog(data.name, s.join(""), 'OK', as.reports.showReport);
        });
    },
    getControlMakeup: function (itemID, name, typecode, typeID, tooltip, defValue, valuesForSelect) {
        var res = "";

        var ctl = "";
        ctl = as.tools.getControlMakeupByDataType(typecode, defValue, valuesForSelect);
        
        res = "<div class='rptItem' itemID='" + itemID + "' typecode='" + typecode + "' typeID='" + typeID + "' title='" + tooltip + "'><span class='rptCap'>" + name + "</span>" + ctl + "</div>";
        return res;
    },
    showReport: function (e) {
        e.preventDefault();      
        var parameters = [];
        $('.rptItem').each(function () {
            var itemID = $(this).attr('itemID');
            var typeID = $(this).attr('typeID');
            var val = as.reports.getValueFromControlMakeup($(this));
            parameters.push({
                id: itemID,
                typeID: typeID,
                defValue: val
            });
        });

        //console.log({ code: as.reports.curReportCode, parameters: parameters });
        as.sys.ajaxSend(as.reports.options.ajax.getReport, { code: as.reports.curReportCode, parameters: parameters },
            function (data) {
                //alert(data.link);
                location.href = data.link;
            });      
    },
    getValueFromControlMakeup: function (ctl) {
        var typecode = ctl.attr("typecode");
        var res = as.tools.getValueFromControlMakeup(typecode, ctl);        
       return res;
    }
};