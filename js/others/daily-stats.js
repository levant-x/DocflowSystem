let BG_INIT_COLOR;
let SUBSCRIBED = [];

function showQuickStats(e) {
    let quStatsDict = applicationCache['quickStats'];
    let date = $(e.target).attr('date');
    let quStats = quStatsDict.get(date);
    if (!quStatsDict || !quStats) {
        return;
    }
    let popoverBlock = $('#templates .quick-stats').clone(true).html();
    popoverBlock = $($.templates(popoverBlock).render(quStats));
    $(popoverBlock).appendTo(e.target);
        
    if (SUBSCRIBED.indexOf(date) < 0) {
        if (BG_INIT_COLOR === undefined) {
            BG_INIT_COLOR = $(e.target).css('background-color');
        }
        $(e.target).on('mouseleave', hidePopover);
        $(e.target).on('mousedown', darken);
        $(e.target).on('mouseup', resetBGColor);
        $(e.target).on('click', showDayDetails);
    }
}

function hidePopover(e) {
    $('.day-block .quick-stats').remove();
}

function darken(e) {
    if ($(e.target).hasClass('day-block')) {
        $(e.target).css('background-color', '#593fff');
    }
}

function resetBGColor(e) {
    if ($(e.target).hasClass('day-block')) {
        $(e.target).css('background-color', BG_INIT_COLOR);
    }
}

function showDayDetails(e, date) {
    date = date || $(e.target).attr('date');
    as.sys.ajaxSend("/Stats/ShowDayDetails", { date }, function (data) {
        if (data.result) {
            showDayStatsCards(data.dailyDocflowOfEachDocType);
        } else {
            as.sys.bootstrapAlert(data.msg || "Не удалось обновить период!", { type: 'danger' });
        }
    });
}

function showDayStatsCards(data) {
    $('#day-stats .day-stats-card').remove();
    $(data).each(function (index, item) {
        let cardBlock = $('#templates .day-stats-card').clone(true).html();
        cardBlock = $($.templates(cardBlock).render(item));
        $('#day-stats').append(cardBlock);
    });
}