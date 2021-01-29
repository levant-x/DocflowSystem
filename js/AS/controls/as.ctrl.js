var as = as || {};

as.ctrl = {
    options: {
        InfoLoad: [],
        AjaxLoad: [],
        AjaxClick: []
      
    },

    init: function (tagFind, ServAction) {
        as.ctrl.initMonitoring(tagFind, ServAction);
    },

    initMonitoring: function (tagFind,ServAction) {
      
        var selectTag = $(tagFind+".as-ctrl");
        var colasctrl = selectTag.length;
        var iInfoLoad = 0;
        var iAjaxL = 0;
        var iAjaxC = 0;
        for (var i = 0; i < colasctrl; i++) {
          
            if (selectTag.eq(i).attr("data-type") == "load") {

                if (selectTag.eq(i).attr("data-info") != "undefined" && selectTag.eq(i).attr("data-info").length > 0) {
                    as.ctrl.options.InfoLoad[iInfoLoad] = selectTag.eq(i).attr("data-info");
                    iInfoLoad++;
                }

                as.sys.ajaxSend(ServAction, { datacode: selectTag.eq(i).attr("data-code"), datatype: selectTag.eq(i).attr("data-type") }, function (data) {
                    as.ctrl.options.AjaxLoad[iAjaxL] = data.STATUS;

                    iAjaxL++;
                });
            }
            else if (selectTag.eq(i).attr("data-type") == "click") {
                as.sys.ajaxSend(ServAction, { datacode: selectTag.eq(i).attr("data-code"), datatype: selectTag.eq(i).attr("data-type") }, function (data) {
                    as.ctrl.options.AjaxClick[iAjaxC] = data.STATUS;
                    iAjaxC++;
                });
            } 
        }
    }
}