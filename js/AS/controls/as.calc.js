var as = as || {};

as.calc = {
    params: {},
    options: {
        calcId: 1,
        cont: null,
        ajaxURLFormat: '/Demo/Calc_{0}',
        paramFormat: '<%{0}%>',
        calcSelector: '.calc',
    },
    init: function(options) {
        as.calc.options = $.extend(as.calc.options, options);        
        $('.as-calc').each(function() {
            as.calc.loadCalc($(this));
        });
        as.calc.bind();
    },
    loadCalc: function(cont) {
        var opts = as.calc.options;
        var url = opts.ajaxURLFormat.format("getCalc");
        var calcCode = cont.data('code');
        var params = { code: calcCode };
        as.sys.ajaxSend(url, params, function (data) {
            if (data) {
                as.calc.saveParams(calcCode, data);
                as.calc.appendMakeup(cont, data);                
            }
        });
    },
    saveParams: function(calcCode, data) {
        as.calc.params[calcCode]= {
            parameters: data.parameters,
            calcFunction: data.calcFunction,
            resultFunction: data.resultFunction,
        }
    },
    appendMakeup: function (cont, data) {
        var opts = as.calc.options;

        data.parameters.forEach(function (p) {
            var paramMakeup = as.makeup.getControlMakeupByDataType(p.dataTypeCode, p.defaultValue, null, p.code);
            data.makeup = data.makeup.replace(opts.paramFormat.format(p.code), paramMakeup);
        });
        cont.append(data.makeup);
        
    },
    bind: function () {
        var opts = as.calc.options;
        $(document).delegate(opts.calcSelector, 'click', function () {
            var calcEl = $(this).closest('.as-calc');
            var calcCode = calcEl.data('code');
            var params = as.calc.params[calcCode];            
            if (opts[params.calcFunction] && opts[params.resultFunction]) {
                var parameters = {};
                params.parameters.forEach(function(p) {
                    var text = calcEl.find('.' + p.code);
                    if (text.length > 0) {
                        parameters[p.code] = text.val();
                    }
                });
                var res = opts[params.calcFunction](parameters);
                opts[params.resultFunction](res);
            }
        });
    }
}