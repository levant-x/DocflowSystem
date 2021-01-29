var as = as || {};
as.jubilee = {
	options: {
	    dayOfHundredYears: 36400,
        days : 500
	},

	init: function (options) {
		as.jubilee.options = $.extend(as.jubilee.options, options);		
		   
		$('.as-jubilee').delegate(".asBtnJubilee", "click", function () {
		    var dateOfBirthStr = $('.asDateOfBirth').val(); 
		    var dateOfBirthArr = dateOfBirthStr.split('.'); 
		    var dateOfBirth = new Date(dateOfBirthArr[2], +dateOfBirthArr[1] - 1, +dateOfBirthArr[0]); console.log(dateOfBirth);

		    var todayDate = new Date();
			
			if (as.jubilee.validateDate()) {
				
				var s = [];
				s.push("<div class ='container'>");
				s.push("<div class ='row '><div class ='col-md-12 text-center'  style='border: 1px solid grey;background-color: azure;font-family:italic;font-size:22px' >"
                 + "Даты 500-дневныx юбилеев" + "</div></div>");
				
				        var dateOfNextAnyversary = new Date(dateOfBirth);
				        var today = new Date(todayDate); var today1 = new Date(todayDate);
				        var minDate = new Date(today.setDate(todayDate.getDate() - 1500));
				        var maxDate = new Date(today1.setDate(todayDate.getDate() + 1500));
				       
				        s.push("<div class ='row text-center' style='display:flex'><div class ='col-md-6 text-center'  style='text-align:center;border: 1px solid grey;font-size:18px;border-top: 0px;' >" + 
                        "<img  src='/Content/images/controls/jubilee2.jpg' alt='photo' width=auto height=200px>" + "</div><div class ='col-md-6'style='border: 1px solid grey; border-top: 0px;border-left: 0px;' >");
				        for (var i = 0; i <= as.jubilee.options.dayOfHundredYears; i += as.jubilee.options.days) {
				            var date = new Date(dateOfNextAnyversary.setDate(dateOfNextAnyversary.getDate() + as.jubilee.options.days));
				            var res = as.jubilee.dateFormat(date);
				            if (date < maxDate && date > minDate) {
				                console.log("День рождения: " + dateOfBirth + "День юбилея" + date);
				                res = as.jubilee.dateFormat(date);
				                s.push("<div class ='row'><div class ='col-md-12' style='border-top: 0px;font-size:20px' >" + res + "</div></div>");
				              
				            }
				        }
				        s.push("</div></div>");
                                
				s.push("</div>");
				$('.table').html(s.join(""));
			}
		});
	},
	validateDate: function () {
		var valid = true;
		var date = $('.asDateOfBirth');
		console.log(date.val());
		if (date.attr('required') && !date.val()) {
			as.sys.bootstrapAlert("Выберите дату <b>" + date.prev().text() + "</b>", { type: "warning" });
			date.focus();
			valid = false;
		}
		return valid;
	},

   dateFormat:function(date)
   {
        var day = date.getDate();
        var month = date.getMonth() + 1;
        var year = date.getFullYear();
        if (day < 10) {
            day = '0' + day;
        }
        if (month < 10) {
            month = '0' + month;
        }
        return day + '.' + month + '.' + year;
   } 

};