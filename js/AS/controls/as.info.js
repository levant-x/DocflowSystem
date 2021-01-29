var as = as || {};

as.info = {
    options: {
        ajax: {
            get: '/ArkStuff/Info'
        }
    },
    init: function() {
        $('.as-info').each(function() {
            as.info.initPopover($(this));
        });
    },
    initPopover: function(el) {

        var params = {
            itemID: el.data('itemid'),
            code: el.data('code')
        };

        var url = el.data('url') || as.info.options.ajax.get;

        as.sys.ajaxSend(url, params, function (data) {
            if (data.result) {                
                el.popover({ content: data.content, title: data.title });
                el.show();
            }
        });
    }
}

