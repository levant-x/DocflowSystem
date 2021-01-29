// v0.01
// метод load
// комбики и чекбоксы (sources)
// проверка через ajax 

var as = as || {};

as.simpleForm = {
    options: {
        ajaxURLFormat: "/serv/form.aspx/{0}",  // get, save           
    },
    init: function (options) {    
        as.simpleForm.options = $.extend(as.simpleForm.options, options);

        as.simpleForm.loadNotModalForms();
        $(document).delegate('a.as-form-simple', 'click', function (e) {
            e.preventDefault();
            var m = as.simpleForm.getSimpleFormMakeup($(this), true);
            as.sys.showDialog($(this).attr('data-title') || as.resources.simpleForm_init_apply, m, $(this).attr('data-button') || as.resources.simpleForm_init_send, function () {
                var cont = $('.modal').find(".as-form-simple-form");
                as.simpleForm.saveSimpleForm(cont, true);
            });
        });
        $(document).delegate('.as-form-simple-save', 'click', function (e) {
            e.preventDefault();
            var cont = $(this).closest(".as-form-simple-form");
            as.simpleForm.saveSimpleForm(cont, false);
        });
    },    
    //---------------------------------------------------------  
    loadNotModalForms: function(){
        $('div.as-form-simple').each(function () {
            var m = as.simpleForm.getSimpleFormMakeup($(this), false);
            $(this).html(m);
        });
    },
    getSimpleFormMakeup: function (el, isModal) {
        var name = el.attr('data-name') || "";
        var phone = el.attr('data-phone') || "";
        var email = el.attr('data-email') || "";
        var text = el.attr('data-text')|| "";

        var namePlaceholder = el.attr('data-name-placeholder') || "";
        var phonePlaceholder = el.attr('data-phone-placeholder') || "";
        var emailPlaceholder = el.attr('data-email-placeholder') || "";
        var textPlaceholder = el.attr('data-text-placeholder') || "";

        var title = el.attr('data-title') || "";
        var subtitle = el.attr('data-subtitle') || "";
        var button = el.attr('data-button') || "";
        var code = el.attr('data-code') || "";

        var s = [];
        s.push('<form class="as-form-simple-form" data-code="'+code+'">');

        if (!isModal) {
            s.push("<h2>" + title + "</h2>");
        }
        s.push("<p class='help-block'>" + subtitle + "</p>");

        if (email) {
            var req = name.indexOf("*") > -1 ? " required='required' " : "";
            s.push('<div class="form-group">');
            s.push('<label for="as-form-simple-name">'+name+'</label>')
            s.push('<input type="text" class="form-control as-form-simple-name" id="as-form-simple-name" placeholder="' + namePlaceholder + '" ' + req + '>');
            s.push('</div>');
        }
        if (phone) {
            var req = phone.indexOf("*") > -1 ? " required='required' " : "";
            s.push('<div class="form-group">');
            s.push('<label for="as-form-simple-phone">'+phone+'</label>')
            s.push('<input type="phone" class="form-control as-form-simple-phone" id="as-form-simple-phone" placeholder="' + phonePlaceholder + '" ' + req + '>');
            s.push('</div>');
        }

        if (email) {
            var req = email.indexOf("*") > -1 ? " required='required' " : "";
            s.push('<div class="form-group">');
            s.push('<label for="as-form-simple-email">'+email+'</label>')
            s.push('<input type="email" class="form-control as-form-simple-email" id="as-form-simple-email" placeholder="' + emailPlaceholder + '" ' + req + '>');
            s.push('</div>');
        }

        if (text) {
            var req = text.indexOf("*") > -1 ? " required='required' " : "";
            s.push('<div class="form-group">');
            s.push('<label for="as-form-simple-text">'+text+'</label>')
            s.push('<textarea class="form-control as-form-simple-text" id="as-form-simple-text" placeholder="' + textPlaceholder + '" ' + req + ' cols="50" rows="5"></textarea>');
            s.push('</div>');
        }
        if(!isModal){
            s.push('<input type="submit" class="btn btn-default as-form-simple-save" value="' + button + '" />');
        }
        s.push('</form>');

        return s.join("");
    },
    saveSimpleForm: function (cont, isModal) {
        var name = $(".as-form-simple-name", cont);
        if (name.attr('required') && !name.val()) {
            as.sys.bootstrapAlert("" + as.resources.simpleForm_saveSimpleForm_AlertRequiredText + " <b>" + name.prev().text() + "</b>", { type: "warning" });
            name.focus();
            return;
        }
        var email = $(".as-form-simple-email", cont);
        if (email.attr('required') && !email.val()) {
            as.sys.bootstrapAlert("" + as.resources.simpleForm_saveSimpleForm_AlertRequiredText + " <b>" + email.prev().text() + "</b>", { type: "warning" });
            email.focus();
            return;
        }
        if (email.attr('required') && !as.tools.isEmail(email.val())) {
            as.sys.bootstrapAlert(as.resources.simpleForm_saveSimpleForm_AlertRequiredEmail, { type: "warning" });
            email.focus();
            return;
        }

        var phone = $(".as-form-simple-phone", cont);
        if (phone.attr('required') && !phone.val()) {
            as.sys.bootstrapAlert("" + as.resources.simpleForm_saveSimpleForm_AlertRequiredText + " <b>" + phone.prev().text() + "</b>", { type: "warning" });
            phone.focus();
            return;
        }
        var text = $(".as-form-simple-text", cont);
        if (text.attr('required') && !name.val()) {
            as.sys.bootstrapAlert("" + as.resources.simpleForm_saveSimpleForm_AlertRequiredText + " <b>" + text.prev().text() + "</b>", { type: "warning" });
            text.focus();
            return;
        }
        var code = $(cont).attr('data-code') || "";        
        var params = { code: code, name: name.val(), phone: phone.val(), email: email.val(), text: text.val() };
        as.sys.ajaxSend(as.simpleForm.options.ajaxURLFormat.format("save"), params, function (data) {
            if (typeof (data) != "object") data = eval('(' + data + ')');
            if (data.result) {
                as.sys.bootstrapAlert(data.msg || as.resources.simpleForm_saveSimpleForm_Saved, { type: 'success' });
                if (isModal) as.sys.closeDialog();
                setTimeout(function () {
                    $("input[type=text],input[type=phone],input[type=email],textarea", cont).val('');
                }, 500);               
            } else {
                as.sys.bootstrapAlert(data.msg || as.resources.simpleForm_saveSimpleForm_SavedError, { type: 'danger' });
            }
        }, false, $(".as-form-simple-save", cont));
    },


};
