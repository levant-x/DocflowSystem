// v0.01
// метод load
// комбики и чекбоксы (sources)
// проверка через ajax 

var as = as || {};

as.form = {
    options: {
        editID: "",
        title: '',
        subtitle: '',
        exampleText: 'напр. ',
        fieldIsRequiredText: 'Set the value of the field ',
        cont: null,
        buttonText: 'Сохранить',
        ajaxURLFormat: "/serv/form.aspx/{0}",  // get, save   
        cookiePrefix: 'as-form-',
        fields: [
         { code: "", title: "", tooltip: "", example: "", datatype: "", visible: true, isRequired: false, checkCallback: function () { alert('asd') } },
         { code: "", title: "", tooltip: "", example: "", datatype: "", visible: true, isRequired: false, checkCallback: function () { alert('asd') } },
         { code: "", title: "", tooltip: "", example: "", datatype: "", visible: true, isRequired: false, checkCallback: function () { alert('asd') } }
        ]
    },
    errors: [],
    fieldErrors: [],
    init: function (options) {
        if (as.form.runInit) return;
        as.form.runInit = true;

        as.form.options = $.extend(as.form.options, options);
        if (typeof String.prototype.format != 'function') {
            as.sys.init();
        }

        $(document).delegate('.as-form-submit', 'click', function (e) {
            e.preventDefault();
            as.form.save();
        });
        $(document).delegate('.as-form-error-link', 'click', function (e) {
            e.preventDefault();
            var code = $(this).attr('data-code');
            var el = $(".as-form-item[data-code=" + code + "]", as.form.options.cont);
            $(":input:first", el).focus();
            $('html,body').animate({ scrollTop: el.offset().top }, 'slow');
        });

        as.form.processErrors();

        if (as.form.options.cont) {
            as.form.show();
        }
    },
    show: function (values) {
        function setMakeup(data) {
            var s = [];
            s.push("<div class='as-form-cont'>");
            s.push("<h1>" + as.form.options.title + "</h1>");
            s.push("<h4>" + as.form.options.subtitle + "</h4><div class='inputs'>");

            $.each(as.form.options.fields, function (i, field) {
                s.push("<div class='as-form-item " + (!field.visible ? "hide" : "") + "' data-code='" + field.code + "' data-datatype='" + field.datatype + "'  data-isRequired='" + (field.isRequired ? 1 : 0) + "' title='" + field.tooltip + "'>");
                s.push("<span class='as-form-cap'>" + field.title + (field.isRequired ? "<span class='as-form-star'>*</span>" : "") + "</span>");
                s.push("<div class='as-form-item-el'>");                
                var defValue, source = data;
                var path = field.code.split('-');
                for (var j = 0; j < path.length; j++) {
                    if (j > 0) source = defValue;
                    defValue = source[path[j]] || '';
                    if (String(defValue).includes('function')) defValue = '';
                }
                s.push(as.makeup.getControlMakeupByDataType(field.datatype, defValue, field.source ? field.source() : []));
                if (values && values[field.code]) {
                    let last = s[s.length - 1];
                    s[s.length - 1] = last.replace("value=''", `value='${values[field.code]}'`);
                }
                if (field.example) {
                    s.push("<div class='alert alert-warning as-form-example'> " + as.form.options.exampleText + field.example + "</div>");
                }
                s.push("</div>");
                s.push("</div>");
            });

            s.push("</div><div class='as-form-btn-cont'><a href='#' class='btn btn-primary as-form-submit'>" + as.form.options.buttonText + "</a></div>");
            s.push("<div class='as-form-res hide'></div>");

            s.push("</div>");
            as.form.options.cont.html(s.join(""));
        }

        if (!as.form.options || as.form.options.editID === '' ||
            as.form.options.editID === '0') {
            setMakeup({});
        } else {
            var params = {
                id: as.form.options.editID
            };
            as.sys.ajaxSend(as.form.options.ajaxURLFormat.format("get"), params, function (data) {
                try {
                    data = eval('(' + data + ')');
                }
                catch (Exception) { console.log(Exception); }
                setMakeup(data);
            });
        }

        

    },
    save: function () {
        $('.as-form-res').addClass('hide').html('');
        as.form.errors = [];
        as.form.errors.push.apply(as.form.errors, as.form.fieldErrors || []) || [];
        var ar = {};
        $(".as-form-item").each(function () {
            var dataType = $(this).attr('data-datatype');
            var val = $(this).find(':input').val(); //as.sys.getValueFromControlMakeup(dataType, $(this));
            var key = $(this).attr('data-code');
            ar[key] = val || '';
            if ($(this).attr("data-isRequired") == "1" && !val) {
                as.form.errors.push({
                    text: as.form.options.fieldIsRequiredText + $(".as-form-cap", this).text(),
                    code: $(this).attr('data-code'), el: $(">:input", this)
                });
            }
        });


        if (as.form.errors && as.form.errors.length > 0) {
            var s = [];
            s.push("<ul class='as-form-errors'>");
            var needShowMessage = false;
            $.each(as.form.errors, function (i, item) {
                if (item) {
                    needShowMessage = true;
                    s.push("<li><a href='#' data-code='" + item.code + "' class='as-form-error-link'>" + item.text + "</a></li>");
                }
            });
            s.push("</ul>");
            if (as.form.errors[0]) {
                $(as.form.errors[0].el).focus();
            }
            if (needShowMessage) {
                as.form.showMessage(s.join(""), 'alert alert-danger');
                return;
            }
        }
        var params = { item: ar };
        var url = as.form.options.ajaxURLFormat.format("save");
        as.sys.ajaxSend(url, params, function (data) {
            try {
                data = eval('(' + data + ')');
            } catch (e) { console.log(e); }
            if (data.result) {
                // as.sys.bootstrapAlert(data.msg || "Сохранено!", { type: 'success' });
                as.form.showMessage(data.msg || "Item has been saved!", 'alert alert-success');
            } else {
                as.form.showMessage(data.msg || "Item not saved! Try again later!", 'alert alert-danger');
            }
            if (as.form.options.saveCallback) as.form.options.saveCallback(data);
        });
    },
    showMessage: function (msg, class1) {
        $('.as-form-res').removeClass('alert-success alert-error alert-danger').addClass(class1).removeClass('hide').html(msg);
    },
    processErrors: function () {
        $.each(as.form.options.fields, function (i, field) {
            if (field.checkCallback) {
                $(document).delegate(".as-form-item[data-code=" + field.code + "] :input", 'change', function () {
                    var el = $(this);
                    el.removeClass('as-form-error-field');
                    field.checkCallback(el, function (msg) {
                        if (msg) {
                            as.sys.bootstrapAlert(msg, { type: "warning" });
                            el.addClass('as-form-error-field');
                        }
                        var notfound = true;
                        $.each(as.form.fieldErrors, function (i, er) {
                            if (er.code == field.code) {
                                notfound = false;
                                if (msg == "") { // then delete error                                    
                                    delete as.form.fieldErrors[i];
                                } else {
                                    er.text = msg;
                                }
                            }
                        });
                        if (notfound) as.form.fieldErrors.push({ text: msg, code: field.code, el: $(">:input", el) });
                    });
                });
            }
        });
    }
};
