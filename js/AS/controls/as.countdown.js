var as = as || {};

as.countdown = {
    options: {
        _second: 1000,
        time: ',13:00:00',
        timeHour: 13,
        timeSecond: 01
    },

    init: function () {
        as.countdown.showRemaining();
    },

    showRemaining: function () {
        var _minute = as.countdown.options._second * 60;
        var _hour = _minute * 60;
        var _day = _hour * 24;
        var timer;
        var now = new Date();
        var hours = now.getHours();
        var minutes = now.getMinutes(); thisEl = $(this);

        var tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        var nextday = new Date((tomorrow.getMonth() + 1) + ',' + tomorrow.getDate() + ',' + tomorrow.getFullYear() + as.countdown.options.time);

        var timebefore = new Date((now.getMonth() + 1) + ',' + now.getDate() + ',' + now.getFullYear() + as.countdown.options.time);

        if (hours >= as.countdown.options.timeHour && minutes >= as.countdown.options.timeSecond) {
            var distance = nextday - now;
            as.countdown.getDistance(distance);
        }
        else {
            var distance = timebefore - now;
            as.countdown.getDistance(distance);
        }
        var days = Math.floor(distance / _day);
        var hours = Math.floor((distance % _day) / _hour);
        var minutes = Math.floor((distance % _hour) / _minute);
        var seconds = Math.floor((distance % _minute) / as.countdown.options._second);
        
        $('.as-count-down').html('<span class="days">' + days + ' <b>' + as.resources.as_countdown_days + '</b> </span> <span class="hours">' + hours + '<b>' + as.resources.as_countdown_hours + '</b></span> <span class="minutes">'
   + minutes + ' <b>' + as.resources.as_countdown_minutes + '</b></span> <span class="seconds">' + seconds + ' <b>' + as.resources.as_countdown_seconds + '</b></span>');

        console.log("days: " + days + "hours" + hours);
       
        setTimeout("as.countdown.showRemaining()", 1000);

    },

    getDistance: function (distance) {
        if (distance < 0) {

            clearInterval(timer);
            $('.as-count-down').html('<span class="days">Time is more 13 hours!</span>');

            return;
        }
    }
};