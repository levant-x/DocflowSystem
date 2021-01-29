var contractDocs = {
    initTable: function () {
        return {
            cont: $('.crud-table'),
            title: $('a.active').html(),
            getItemsCallback: afterLoad,
            ajaxURLFormat: "/ContractDocs/{0}",
            inlineAjaxURL: "/ContractDocs/{0}",
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
                    code: 'code',
                    title: 'Код',
                    tooltip: 'Уникальный код',
                    isVisible: true,
                    isPK: false,
                    datatype: 'string',
                    isRequired: true,
                    format: '{0}'
                },
                {
                    code: 'as_docType-name',
                    title: 'Тип',
                    tooltip: 'Тип документа в подмножестве одинаковой структуры',
                    isVisible: true,
                    isPK: false,
                    datatype: 'string',
                    isRequired: true,
                    isSort: true,
                    format: function (value) {
                        return value.as_docType.name;
                    },
                    filter: {
                        type: "string"
                    }
                },
                {
                    code: 'as_docBasic-date',
                    title: 'Дата',
                    tooltip: 'Дата',
                    isVisible: true,
                    isPK: false,
                    datatype: 'date',
                    isRequired: true,
                    isSort: true,
                    format: function (value) {
                        value = value.as_docBasic.date;
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
                },
                {
                    code: 'as_docBasic-as_contragent-name',
                    title: 'Контрагент',
                    tooltip: 'Контрагент',
                    isVisible: true,
                    isPK: false,
                    datatype: 'string',
                    isRequired: true,
                    isSort: true,
                    format: function (value) {
                        return value.as_docBasic.as_contragent.name;
                    },
                    filter: {
                        type: "string"
                    }
                },
                {
                    code: 'note',
                    title: 'Заметка',
                    tooltip: 'Дополнительные сведения',
                    isVisible: true,
                    isPK: false,
                    datatype: 'string',
                    isRequired: true,
                    format: '{0}',
                    filter: {
                        type: "string"
                    }
                }
            ],
            operations: {
                remove: true,
                create: true,
                edit: true,
                comments: false,
                details: true,
                other: [{
                    linkClass: 'ctrDetails',
                    iconClass: 'fas fa-info-circle',
                    title: 'Детали (только для договора и счета)',
                    callback: function (e) { }
                }]
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
            titleTemplate: '{0} контракта',
            buttonText: 'Сохранить контракт',
            ajaxURLFormat: "/ContractDocs/{0}",
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
                    code: "code",
                    title: "Код",
                    datatype: "string",
                    visible: false,
                    isRequired: false
                },
                {
                    code: "typeID",
                    title: "Тип",
                    tooltip: "Укажите тип документа в подмножестве одинаковой структуры",
                    datatype: "select",
                    source: function () {
                        var res = getSelectOptions('DocTypes');
                        return res;
                    },
                    visible: true,
                    isRequired: true,
                    checkCallback: function () { }
                },
                {
                    code: "as_docBasic-date",
                    title: "Дата",
                    tooltip: "Укажите требуемую дату",
                    datatype: "date",
                    visible: true,
                    isRequired: true,
                    checkCallback: function (value) {
                        if (!value) value = new Date();
                        return value;
                    }
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
                    checkCallback: function (value) {
                        if (!value) value = getSelectOptions('DocStatuses')[0];
                        return value;
                    }
                },
                {
                    code: "as_docBasic-contragentID",
                    title: "Контрагент",
                    tooltip: "Укажите контрагента",
                    datatype: "select",
                    source: function () {
                        var res = getSelectOptions('Contragents');
                        return res;
                    },
                    visible: true,
                    isRequired: true,
                    checkCallback: function () { }
                },
                {
                    code: "total",
                    title: "Сумма",
                    tooltip: "Укажите сумму счета",
                    datatype: "string",
                    visible: true,
                    isRequired: true,
                    checkCallback: function () { }
                },
                {
                    code: "as_contractFile-link",
                    title: "Ссылка",
                    tooltip: "Укажите ссылку на файловое хранилище",
                    datatype: "string",
                    visible: true,
                    isRequired: false,
                    //checkCallback: function () { }
                },
                {
                    code: "note",
                    title: "Заметка",
                    tooltip: "Дополнительные сведения",
                    datatype: "text",
                    visible: true,
                    isRequired: false,
                    checkCallback: function () { }
                }
            ],
            customizeRuntime: function () {
                function switchUncommonControls(e) {
                    function showInput(datacode) {
                        let isRequired = String(datacode).includes('File') ? '0' : '1';
                        $(`div[data-code='${datacode}']`).show().attr('data-isrequired',
                            isRequired);
                    }
                    function hideInput(datacode) {
                        $(`div[data-code=${datacode}]`).hide().attr('data-isrequired', '0');
                    }

                    var option = $('[data-code=typeID] select option:selected').text();
                    if (option === 'Счет') {
                        showInput('total');
                        hideInput('as_contractFile-link');
                    }
                    else if (option === 'Договор') {
                        showInput('as_contractFile-link');
                        hideInput('total');
                    }
                    else {
                        hideInput('total');
                        hideInput('as_contractFile-link');
                    }
                }
                function filterAllowedStatusOptions() {
                    let statusOpts = $('div[data-code="statusID"] select');
                    let docType = $('div[data-code="typeID"] option:selected').text();
                    getOnlyApproprSelectOptions(statusOpts, "DocStatuses", docType);
                }

                $('div[data-code=typeID] select').change(function (e) {
                    switchUncommonControls(e);
                    filterAllowedStatusOptions();
                });

                var datePicker = $('input.asDatepicker');
                if (!datePicker) return;

                var v = datePicker.attr('value').split('T')[0];
                $(datePicker).val(v);
                switchUncommonControls();
                filterAllowedStatusOptions();
            } 
        };
    }
}