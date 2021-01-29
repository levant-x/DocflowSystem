var as = as || {};

as.createMistake = {
	options: {	},
	init: function (options) {
		as.createMistake.options = $.extend(as.createMistake.options, options); // инициализация свойств объекта
		as.createMistake.options.dialogTitle = (as.createMistake.options.dialogTitle == undefined) ? "Добавление новой ошибки" : as.createMistake.options.dialogTitle;
		as.createMistake.options.addButtonTitle = (as.createMistake.options.addButtonTitle == undefined) ? "Добавить" : as.createMistake.options.addButtonTitle;
		as.createMistake.options.ajaxURLFormat = (as.createMistake.options.ajaxURLFormat == undefined) ? "/LulchenkoTextMistakes/AddMistake" : as.createMistake.options.ajaxURLFormat;

	},

	showDialog: function () {
		var inputs = [];
		inputs.push("<span>Url:</span><input type='text' class='form-control mistUrl' /><br />");
		inputs.push("<span>Ошибка:</span><input type='text' class='form-control mistDefinition' /><br />");
		inputs.push("<span>Комментарий:</span><textarea rows='5' cols='30' class='form-control mistComment' /><br />");

		setTimeout(function () { $('.mistUrl').focus(); }, 200);
		as.sys.showDialog(as.createMistake.options.dialogTitle, inputs.join(""), as.createMistake.options.addButtonTitle, function () {
			var url = $('.mistUrl').val();
			var definition = $('.mistDefinition').val();
			var comment = $('.mistComment').val();
			var cont = $('.modal').find(".as-form-simple-form");
			if (!url) {
				as.sys.bootstrapAlert("Не указан url текста с ошибкой", { type: 'warning' });
				$('.mistUrl').focus();
				return;
			}
			if (!definition) {
				as.sys.bootstrapAlert("Не указано содержание ошибки", { type: 'warning' });
				$('.mistDefinition').focus();
				return;
			}


			var params = {comment: comment, selectText: definition, url: url };
			as.sys.ajaxSend(as.createMistake.options.ajaxURLFormat, params, function (data) {
				if (typeof (data) != "object") data = eval('(' + data + ')');
				if (data.result) {
					as.sys.bootstrapAlert(data.msg || as.resources.textMistakes_init_AlertSavedError, { type: 'success' });
					as.sys.closeDialog();
				} else {
					as.sys.bootstrapAlert(data.msg || as.resources.textMistakes_init_AlertError, { type: 'danger' });
				}
			}, false, $(".as-form-simple-save", cont));

		});
	}
};