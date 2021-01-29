
let locale = globv.locale;
let periodUnits = globv.periodUnits;
let periodOffset = 0;
let currentPeriodDur = 0;

document.addEventListener('DOMContentLoaded', function () {
    $('.caret').on('mouseover mouseup', function (e) {
        e.target.style.color = 'pink';
    });
    $('.caret').on('mouseleave', function (e) {
        e.target.style.color = 'black';
    });
    $('.caret').on('mousedown', function (e) {
        e.target.style.color = 'red';
    });
    $('.period-selector :input').on('change', showPeriod);
    $('#period-scroller').on('click', offsetPeriod);
    showPeriod();
});


function offsetPeriod(e) {
    let cl = $(e.target).attr('class');
    if (cl.includes('left')) {
        periodOffset = -1;
    }
    else if (cl.includes('right')) {
        periodOffset = 1;
    }
    if (periodOffset !== 0) {
        showPeriod();
    }
}

function showPeriod() {
    let periodUnitName = $(':input[name=period-unit]').val();
    let periodStart = $('input[name=period-start]').val();
    let startDate = fixDateShift(periodUnitName, new Date(periodStart));

    as.sys.ajaxSend("/Stats/ShowPeriod", { periodUnitName, startDate }, function (data) {
        if (data.result) {
            console.log('initial ajax received');
            fillStats(data);
            if (globv.dayToDetalize) {
                showDayDetails(undefined, globv.dayToDetalize);
            }
        } else {
            as.sys.bootstrapAlert(data.msg || "Не удалось обновить период!", { type: 'danger' });
        }
    });
}

function fixDateShift(periodUnitName, date) {
    currentPeriodDur = periodUnits[periodUnitName];
    date.setDate(date.getDate() + currentPeriodDur * periodOffset);

    $('input[name=period-start]').val(date.toISOString().slice(0, 10));
    periodOffset = 0;
    return date;
}

function fillStats(data) {
    $('#period-calendar').html('');
    $('#total-docs-per-period').text(data.totalDailyDocflCountLabel);
    let monthBlock = $('#templates .month-block').clone(true);
    let firstDay;
    let currentMonth = 0;
    let quickStats = new Map();
    applicationCache['quickStats'] = quickStats;   

    $(data.dailyDocCountsGroupedByType).each(function (index, item) { 
        let date = new Date(Date.parse(item.Key));
        let month = date.getMonth();
        let odd = month % 2 === 0 ? '' : 'odd';

        if (!firstDay) {
            firstDay = date;
        }
        if (item.Value.Details) {
            quickStats.set(item.Value.Date, item.Value);
        }

        let dayBlock = $('#templates .day-block').clone(true).html();
        dayBlock = $($.templates(dayBlock).render(item.Value));
        $(dayBlock).on('mouseover', showQuickStats);
        markWeekend(date, dayBlock);
        $(dayBlock).addClass(odd);

        if (month !== currentMonth) {
            currentMonth = month;
            signMonth(date, monthBlock, odd);
        }

        $(monthBlock).children('.month-days').append(dayBlock);

        if (index + 1 === currentPeriodDur ||
            (index + 31) % 30 === 0) {
            fillWeekDayNames(firstDay, $(monthBlock).children('.month-days'));
            monthBlock = pushSubperiod($('#period-calendar'), monthBlock);
            if (currentPeriodDur > 30) {
                signMonth(date, monthBlock, odd);
                firstDay = undefined;
            }
        }
    });
}

function signMonth(date, monthBlock, odd = '') {
    let monthName = getMonthName(date);
    let monthNameBlock = `<p class='${odd}'>${monthName}</p>`;
    $(monthBlock).children('.month-names').append(monthNameBlock);
}

function fillWeekDayNames(date, heading) {
    for (var i = 0; i < 7; i++) {
        let dayName = date.toLocaleDateString(locale, { weekday: 'short' });
        let day = $(`<div style='grid-row: 1/2; grid-column:
                ${i + 1}/${i + 2};'>${dayName}</div>`);
        markWeekend(date, day);
        $(heading).append(day);
        date.setDate(date.getDate() + 1);
    }
}

function markWeekend(date, element) {
    let weekend = date.getDay() === 6 || date.getDay() === 0 ?
        'weekend' : '';
    $(element).addClass(weekend);
}

function getMonthName(date) {
    return date.toLocaleDateString(locale, { month: 'long' });
}

function pushSubperiod(parent, child) {
    parent.append(child);
    let childClass = $(child).attr('class').split(/\s+/)[0];
    return $('#templates .' + childClass).clone(true);
}
