var as = as || {};

as.replace = {
    init: function () {
        $(document).delegate('.btnResult', 'click', function () {
            var foo = document.getElementById('foo');
            var s = [];

            for (var i = 0, l = foo.childNodes.length; i < l; i++) {
                var d = foo.childNodes[i];
                if (d.textContent != '') {
                    if (d.href) {
                        s.push(d);
                    } else {
                        var de = d.textContent;
                        var reg = /((www\.|(http|https|ftp|news|file)+\:\/\/)[_.a-z0-9-]+\.[a-z0-9\/_:@=.+?,##%&amp;~-]*[^.|\'|\# |!|\(|?|,| |>|<|;|\)])/gi;
                        if (de.match(reg)) {
                            var ewqewq = de.split(" ");
                            $.each(ewqewq, function (index, value) {
                                if (value.match(reg)) {
                                    var elm = document.createElement('a');
                                    elm.href = value;
                                    elm.textContent = value;
                                    s.push(elm);
                                } else {
                                    s.push(' ' + value+' ');
                                }
                            });
                        } else {
                            s.push(d);
                        }
                    }
                } else {
                    s.push(d);
                }
            }
            $('#foo').html(s);


        });



    }



};