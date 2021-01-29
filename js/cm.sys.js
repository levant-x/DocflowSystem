var cm = cm || {};

cm.sys = {
    // режим использования значений в textarea
    mode: { html: "text/html", javascript: "javascript", css: "css" },
    init: function (textarea, mode) {
        var reader = CodeMirror.fromTextArea(textarea, {
            lineNumbers: true, // Нумеровать каждую строчку.
            mode: mode,
            indentUnit: 2, // Длина отступа в пробелах.
            matchTags: { bothTags: true },
            extraKeys: {
                "Ctrl-J": "toMatchingTag",
                "Ctrl-Q": function (cm) { cm.foldCode(cm.getCursor()); },
                "Ctrl-Space": "autocomplete"
            },
            lineWrapping: true,
            foldGutter: true,
            gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter", "CodeMirror-lint-markers"],
            value: document.documentElement.innerHTML,
            autoCloseTags: true,
            //  gutters: [],
            //  lint: true
            styleActiveLine: true,
            matchBrackets: true   // выделение парных скобок
        });
        return reader;
    },
    getValue: function (reader) {
        return reader.getValue();
    },
    setValue: function (reader, value) {
        reader.setValue(value);
        reader.refresh();
    },
    // вставить текст
    insertTextAndSelection: function (reader, txt) {
        var cursor = reader.doc.getCursor();   // line номер строки c 0, ch - число символов в этой строке
        if (cursor != null) {
            reader.doc.replaceRange(txt, { line: cursor.line, ch: cursor.ch });
            reader.doc.setSelection({ line: cursor.line, ch: cursor.ch }, { line: cursor.line, ch: cursor.ch + txt.length });
        }
    },
    // поиск текста
    searchTextAndSelection: function (reader, query) {
        var state = reader.state.search || (reader.state.search = new this._searchState());
        state.query = this._parseQuery(query);
        reader.removeOverlay(state.overlay, this._queryCaseInsensitive(state.query))                //точные вхождения

        state.overlay = this._searchOverlay(state.query, this._queryCaseInsensitive(state.query));
        reader.addOverlay(state.overlay);                                                           // включить подсветку символов
    },
    _searchState: function () {
        this.posFrom = this.posTo = this.query = null;
        this.overlay = null;
    },
    _parseQuery: function (query) {
        var isRE = query.match(/^\/(.*)\/([a-z]*)$/);
        if (isRE) {
            query = new RegExp(isRE[1], isRE[2].indexOf("i") == -1 ? "" : "i");
            if (query.test("")) query = /x^/;
        } else if (query == "") {
            query = /x^/;
        }
        return query;
    },
    _queryCaseInsensitive: function (query) {
        return typeof query == "string" && query == query.toLowerCase();
    },
    _searchOverlay: function (query, caseInsensitive) {
        if (typeof query == "string")
            query = new RegExp(query.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"), caseInsensitive ? "gi" : "g");
        else if (!query.global)
            query = new RegExp(query.source, query.ignoreCase ? "gi" : "g");

        return {
            token: function (stream) {
                query.lastIndex = stream.pos;
                var match = query.exec(stream.string);
                if (match && match.index == stream.pos) {
                    stream.pos += match[0].length;
                    return "searching";
                } else if (match) {
                    stream.pos = match.index;
                } else {
                    stream.skipToEnd();
                }
            }
        };
    }

}