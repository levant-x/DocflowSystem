var shipments = {
    initTable: function () {
        return {
            cont: $('.crud-table'),
            title: $('a.active').html(),
            getItemsCallback: afterLoad,
            ajaxURLFormat: "/Shipments/{0}",
            inlineAjaxURL: "/Shipments/{0}",
            showChecksCol: false,
            showNumsCol: true,
            filterLinkTitle: "Обновить",
            filterByEnterKey: true,
            pageSize: $('input[name=page-by]').val(),
            toolbarAdditional: '<a href=# class="btn btn-primary create-cmd">Создать</a>',
            edit: editOrCreate,
            filterTemplate: FILTER_MK_TMPL,
            cols: [
                {
                    code: 'id',
                    title: 'ID',
                    tooltip: 'Идентификатор',
                    isVisible: false,
                    isPK: true,
                    datatype: 'int',
                    isRequired: false
                },
                {
                    code: 'date',
                    title: 'Дата',
                    tooltip: 'Дата регистрации (может быть позднее даты отправления)',
                    isVisible: true,
                    isPK: false,
                    datatype: 'date',
                    isRequired: true,
                    isSort: true,
                    format: function (value) {
                        value = value.date;
                        var date = new Date(value);
                        var locale = globv ? globv.locale || 'ru_RU' : 'ru_RU';
                        var res = date.toLocaleDateString(locale);
                        return res;
                    },
                    filter: {
                        type: "date"
                    }
                },
                {
                    code: 'fromPerson',
                    title: 'От',
                    tooltip: 'Отправитель',
                    isVisible: true,
                    isPK: false,
                    datatype: 'string',
                    isRequired: true,
                    isSort: true,
                    format: '{0}',
                    filter: {
                        type: "string"
                    }
                },
                {
                    code: 'toAddr',
                    title: 'По адресу',
                    tooltip: 'Адрес получателя',
                    isVisible: true,
                    isPK: false,
                    datatype: 'string',
                    isRequired: true,
                    isSort: false,
                    format: '{0}',
                    filter: {
                        type: "string"
                    }
                }, 
                {
                    code: 'trackNum',
                    title: 'Трек-номер',
                    tooltip: 'Номер для отслеживания местоположения и статуса',
                    isVisible: true,
                    isPK: false,
                    datatype: 'string',
                    isRequired: true,
                    isSort: false,
                    format: '{0}',
                    filter: {
                        type: "string"
                    }
                },
                {
                    code: 'descr',
                    title: 'Описание',
                    tooltip: 'Краткое описание',
                    isVisible: true,
                    isPK: false,
                    datatype: 'string',
                    isRequired: false,
                    isSort: false,
                    format: '{0}'
                },
                {
                    code: 'as_shipper-name',
                    title: 'Доставщик',
                    tooltip: 'Организация-доставщик',
                    isVisible: true,
                    isPK: false,
                    datatype: 'string',
                    isRequired: true,
                    isSort: true,
                    format: function (value) {
                        return value.as_shipper.name;
                    },
                    filter: {
                        type: "string"
                    }
                },
                {
                    code: 'as_docStatus-name',
                    title: 'Статус',
                    tooltip: 'Статус документа',
                    isVisible: true,
                    isPK: false,
                    datatype: 'string',
                    isRequired: true,
                    isSort: true,
                    format: function (value) {
                        return value.as_docStatus.name;
                    },
                    filter: {
                        type: "string"
                    }
                }
            ],
            operations: {
                remove: true,
                create: true,
                edit: true,
                other: []
            },
            filter: function () {
                var filter = getFilterValues();
                return filter;
            },
            remove: function () {
                removeSelected();
            }
        };
    },

    initForm: function () {
        return {
            editID: "0",
            titleTemplate: '{0} отправления',
            buttonText: 'Сохранить отправление',
            ajaxURLFormat: "/Shipments/{0}",
            saveCallback: function (data) { refreshTableAfterEditing(data) },
            fields: [
                {
                    code: "id",
                    title: "ID",
                    datatype: "string",
                    visible: false,
                    isRequired: false
                },
                {
                    code: "fromPerson",
                    title: "От отправителя",
                    tooltip: "Укажите отправителя",
                    datatype: "string",
                    visible: true,
                    isRequired: true,
                    checkCallback: function () { }
                },
                {
                    code: "toAddr",
                    title: "По адресу",
                    tooltip: "Укажите адрес получателя",
                    datatype: "string",
                    visible: true,
                    isRequired: true,
                    checkCallback: function () { }
                },
                {
                    code: "descr",
                    title: "Описание",
                    tooltip: "Добавьте краткое описание",
                    datatype: "text",
                    visible: true,
                    isRequired: false,
                    checkCallback: function () { }
                },
                {
                    code: "trackNum",
                    title: "Трек-номер",
                    tooltip: "Укажите номер для отслеживания статуса и местоположения",
                    datatype: "string",
                    visible: true,
                    isRequired: true,
                    checkCallback: function () { }
                },
                {
                    code: "shipperID",
                    title: "Система отправки",
                    tooltip: "Укажите перевозчика",
                    datatype: "select",
                    source: function () {
                        var res = getSelectOptions('Shippers');
                        return res;
                    },
                    visible: true,
                    isRequired: true,
                    checkCallback: function () { }
                },
                {
                    code: "statusID",
                    title: "Статус",
                    tooltip: "Укажите статус документа",
                    datatype: "select",
                    source: function () {
                        var res = getSelectOptions('DocStatuses');
                        return res;
                    },
                    visible: true,
                    isRequired: true,
                    checkCallback: function () { }
                }
            ],
            customizeRuntime: function () {
                let statusOpts = $('div[data-code="statusID"] select');
                getOnlyApproprSelectOptions(statusOpts, "DocStatuses", "отправление");
            }
        };
    }
}