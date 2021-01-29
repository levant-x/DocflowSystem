
var globv = {};

var globvCont = $('.globv').each(function () {
    let attributes = this.attributes;
    for (var i = 0; i < attributes.length; i++) {
        let attr = attributes[i];
        if (attr.name === 'class' || attr.name === 'hidden') continue;
        let j = 0;
        let name = attr.name.split('-').map(function (word) {
            j++;
            return j === 1 ? word : word.charAt(0).toUpperCase() + word.slice(1);
        }).join('');
        try {
            globv[name] = eval(`(${attr.value})`);
        } catch (e) {
            globv[name] = attr.value;
        }
    }
});


const FILTER_MK_TMPL = "<div class='form-group row crd2FilterItem filter-control-block mt-3'>" +
    "<label for='{0}' class='col-form-label col-4'>{1}</label>" +
    "<input type='{2}' name='{0}' data-code='{0}' value='{3}' class='crd2FilterItem col-8' /></div>";

function getFilterValues() {
    var res = {};
    $('.crd2FilterItem').each(function (index, item) {
        let key = $(item).find('label').attr('for');
        if (key) {
            let val = $(item).find(`:input[name=${key}]`).val();
            res[key] = val;
        }
    });
    return res;
}

function editOrCreate(e) {
    if (!as.form.options.cont) as.form.options.cont = $('.entity-form');
    if (e.data.createNew) {
        as.form.options.title = as.form.options.titleTemplate.format("Добавление");
        as.form.options.editID = '0';
        as.form.show();
    }
    else {
        as.form.options.title = as.form.options.titleTemplate.format("Редактирование");
        showEditForm(e);
    }

    var onOpen = as.form.options.customizeRuntime || function () { };
    var popup = $('.entity-form').bPopup({ item: e.target }, onOpen);
    //popup.reposition(750);
}

function showEditForm(e) {
    var values = {};
    $(e).closest("tr").find('td').each(function (index, item) {
        var key = $(item).attr('data-code');
        var value = $(item).text();
        values[key] = value;
    });
    as.form.options.editID = values['id'];
    as.form.show(values);
}

function refreshTableAfterEditing(data) {
    if (!data.result) return;
    
    var id = data.d.id;
    var row = $(as.form.options.tableCont).find(`tr[data-itemid=${id}]`);
    row.find('td.crd2Item').each(function (index, item) {

        var key = $(item).attr('data-code').split('-');
        var val = data.d;
        for (var i = 0; i < key.length; i++) {
            val = val[key[i]];
            if (!val) break;
        }
        if (val) $(item).text(val);
    });
}

function getSelectOptions(key) {
    var tableOptions = getTableOptions();
    return tableOptions.fkeys[key];
}

function getTableOptions() {
    var g = as.crud2.getGuidByElement($('.crud-table'));
    var res = as.crud2.options.tables[g];
    return res;
}

function getOnlyApproprSelectOptions(select, parentName, allowFor) {
    let fkeys = getTableOptions().fkeys[parentName];
    let additionalArgs = fkeys.addArgs;
    let allowedIDs = $(additionalArgs).filter(function (index, item) {
        let includes = item.docTypeNames === '' ||
            String(item.docTypeNames).includes(allowFor);
        if (includes === item.allowForListedTypes) return item.id;
    }).map((index, item) => item.id).toArray();

    var oldValue = $(select).val();
    $(select).find('option').each(function (index, option) {
        if (allowedIDs.some(function (id) {
            return String(id) === $(option).attr('value');
        })) $(option).show();
        else $(option).hide();
    });
    var isOldValueAllowed = $(select).find(`option[value=${oldValue}]`).attr('hidden');
    if (oldValue && !isOldValueAllowed) $(select).val('');
}
