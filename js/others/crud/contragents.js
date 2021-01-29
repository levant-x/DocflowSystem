var contragents = {
    initTable: function () {
        return {
            cont: $('.crud-table'),
            title: $('a.active').html(),
            getItemsCallback: afterLoad,
            ajaxURLFormat: "/Contragents/{0}",
            inlineAjaxURL: "/Contragents/{0}",
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
                    code: 'name',
                    title: 'Название',
                    tooltip: '',
                    isVisible: true,
                    isPK: false,
                    datatype: 'string',
                    isRequired: true,
                    isSort: true,
                    format: '{0}',
                    filter: {
                        type: "string"
                    }
                }
            ],
            operations: {
                remove: false,
                create: true,
                edit: true,
                other: []
            },
            getFilterMakeup: function (filter) {
                return '';
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
            titleTemplate: '{0} контрагента',
            buttonText: 'Сохранить контрагента',
            ajaxURLFormat: "/Contragents/{0}",
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
                    code: "name",
                    title: "Название",
                    tooltip: "Укажите сокращенное наименование",
                    datatype: "string",
                    visible: true,
                    isRequired: true,
                    checkCallback: function () { }
                }
            ]
        };
    }
}