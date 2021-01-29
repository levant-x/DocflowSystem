var as = as || {};

as.mosaik = {
    init: function () {

        $(document).delegate('.mos', 'click', function () {
            var $container = $('.grid');
            var s = [];

            as.sys.ajaxSend("/Demo/GetMosaik/", null, function(data) {
                $.each(data, function(index, value) {
                    if (index % 2!==0) {
                        s.push("<div class='grid-item even'><img alt='' src='" + value + "'/></div>");
                    } else {
                        if (index % 3 !== 0) {
                            s.push("<div class='grid-item odd'><img alt='' src='" + value + "'/></div>");
                        } else {
                            s.push("<div class='grid-item even2'><img alt='' src='" + value + "'/></div>");
                        }
                        
                    }

                });
                $container.html(s.join(""));
                
            });
            $('.mos').removeClass('mos').addClass('mos2').attr('value','Try Mosaik');
        });
        $(document).delegate('.mos2', 'click', function () {
            var $container = $('.grid');
            $container.imagesLoaded(function () {
                $container.isotope({
                    itemSelector: '.grid-item',
                    layoutMode: 'masonry',
                    masonry: {
                        columnWidth: 50,
                        fitWidth:true
                    }
                });
            });

        });


    }

};