var as = as || {};

as.videobg = {
    options: {
        isMobile: false,
        appendTo: 'body',
        alterImage: '',
        sources: []
    },
    init: function(options) {
        as.videobg.options = $.extend(as.videobg.options, options);
        var opts = as.videobg.options;
        var target = $(opts.appendTo);
        target.addClass("fullscreen-bg");

        var content = '<img src="'+ opts.alterImage +'" class="alternative-bg" alt="Your browser does not support HTML5 video." />';
        if(!opts.isMobile)
        {
            content += '<video loop muted autoplay poster="'+ opts.alterImage +'" class="fullscreen-bg__video">';
            for(var i in opts.sources)
            {
                content+= '<source src="'+ opts.sources[i].src +'" type="' + opts.sources[i].type + '" />';
            }
            content+='</video>';
        }
        target.append(content);        
    }
}