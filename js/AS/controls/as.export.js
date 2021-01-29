var as = as || {};

as.export = {
    options: {
        ajax: {
            "exportTable": "/export/exportTable"
        }        
    },
    init: function () {
        if (as.export.runInit) return;
        else as.export.runInit = true;

        $(document).delegate('.as-export', "mouseenter mouseleave", function (event) {
            if (event.type == 'mouseenter') {

                var tableWithExcel = $(this).closest(".as-export").filter("[data-type~='excel']");
                var lenTableWithExcel = tableWithExcel.length;
                var tableWithPDF = $(this).closest(".as-export").filter("[data-type~='pdf']");
                var lenTableWithPDF = tableWithPDF.length;

                var menustring = "<div class='as-export-toolbar'>";
                if (lenTableWithExcel > 0) {
                    menustring += "<a href='#' class='as-export-link-Excel'><img src='../js/AS/images/export_excel.png'  alt='" + as.resources.export_init_excelExp + "' /></a>";
                }
                if (lenTableWithPDF > 0) {
                    menustring += "<a href='#' class='as-export-link-PDF'><img src='../js/AS/images/export_pdf.png' alt='" + as.resources.export_init_pdfExp + "'/></a>";
                }
                menustring += "</div>";

                if (lenTableWithExcel > 0 || lenTableWithPDF > 0) {
                    $(this).append(menustring);
                }


            } else {
                $(this).find(".as-export-toolbar").remove();
            }
        });
        $(document).delegate('.as-export-link-Excel', "click", function (e) {
            e.preventDefault();
            var cont = $(this).closest('.as-export');
            if (cont.length == 0) cont = $('.as-export');

            if (cont.is("table")) {
                as.export.exportTable(cont, "excel");
            }
        });
        $(document).delegate('.as-export-link-PDF', "click", function (e) {
            e.preventDefault();
            var cont = $(this).closest('.as-export');
            if (cont.length == 0) cont = $('.as-export');

            if (cont.is("table")) {
                as.export.exportTable(cont, "pdf");
            }
        });

    },
    exportTable: function (cont, type) {
        var title = cont.attr("data-title") || "";
        var subtitle = cont.attr("data-subtitle") || "";
        var table = [];
        $("tr", cont).each(function () {
            var el = [];
            $("td, th", $(this)).each(function () {
                el.push($(this).text());
            });
            table.push(el);
        });

        var params = { title: title, subtitle: subtitle, type: type, table: table };

        as.sys.ajaxSend(as.export.options.ajax.exportTable, params, function (data) {
            if (typeof (data) != "object") data = eval('(' + data + ')');
            if (data.result) {
                location.href = data.url;
            } else {
                as.sys.bootstrapAlert(data.msg || as.resources.export_exportTable_ErrorMsg, { type: 'danger' });
            }
        });
    }


};

