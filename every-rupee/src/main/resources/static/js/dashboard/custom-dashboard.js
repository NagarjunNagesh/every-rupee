/**
 * Custom Javascript for dashboard
 */

window.onload = function () {
	$(document).ready(function(){
		
		// Append "active" class name to toggle sidebar color change
		if($('.overview-dashboard').length) {
			document.getElementById("overview-dashboard-sidebar").classList.add('active');
		}
		
		if($('.income-dashboard').length) {
			document.getElementById("income-dashboard-sidebar").classList.add('active');
		}
		
		if($('.debt-dashboard').length) {
			document.getElementById("debt-dashboard-sidebar").classList.add('active');
		}
		
		if($('.savings-dashboard').length) {
			document.getElementById("savings-dashboard-sidebar").classList.add('active');
		}
		
		if($('.investment-dashboard').length) {
			document.getElementById("investment-dashboard-sidebar").classList.add('active');
		}
		
		if($('.settings-dashboard').length) {
			document.getElementById("settings-dashboard-sidebar").classList.add('active');
		}
		
		// Read Cookies
		readCookie();
		
		/* Read Cookies */
		function readCookie() {
				// make sure that the cookies exists
		        if (document.cookie != "") { 
		        		//Get the value from the name=value pair
		                var sidebarActiveCookie = getCookie('sidebarMini');
		                
		                if(includesStr(sidebarActiveCookie, 'active')) {
		                	 minimizeSidebar();
		                }
		        }
		}
		
		// Gets the cookie with the name
		function getCookie(cname) {
			  var name = cname + "=";
			  var decodedCookie = decodeURIComponent(document.cookie);
			  var ca = decodedCookie.split(';');
			  for(var i = 0; i <ca.length; i++) {
			    var c = ca[i];
			    while (c.charAt(0) == ' ') {
			      c = c.substring(1);
			    }
			    if (c.indexOf(name) == 0) {
			      return c.substring(name.length, c.length);
			    }
			  }
			  return "";
			}
		
	});
	
}

/* When the toggleFullscreen() function is executed, open the video in fullscreen.
Note that we must include prefixes for different browsers, as they don't support the requestFullscreen method yet */
function toggleFullscreen() {
	elem = document.documentElement;
	  if (!document.fullscreenElement && !document.mozFullScreenElement &&
	    !document.webkitFullscreenElement && !document.msFullscreenElement) {
	    if (elem.requestFullscreen) {
	      elem.requestFullscreen();
	    } else if (elem.msRequestFullscreen) {
	      elem.msRequestFullscreen();
	    } else if (elem.mozRequestFullScreen) {
	      elem.mozRequestFullScreen();
	    } else if (elem.webkitRequestFullscreen) {
	      elem.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
	    }
	  } else {
	    if (document.exitFullscreen) {
	      document.exitFullscreen();
	    } else if (document.msExitFullscreen) {
	      document.msExitFullscreen();
	    } else if (document.mozCancelFullScreen) {
	      document.mozCancelFullScreen();
	    } else if (document.webkitExitFullscreen) {
	      document.webkitExitFullscreen();
	    }
	  }
}

/* Get the element you want displayed in fullscreen mode (a video in this example): */
document.getElementById('dashboard-util-fullscreen').addEventListener('click', function() {
	  toggleFullscreen();
});

/* Minimize sidebar */
$('#minimizeSidebar').click(function () {
    $(this);
    minimizeSidebar();
    
    /* Create a cookie to store user preference */
    var expirationDate = new Date;
    expirationDate.setMonth(expirationDate.getMonth()+2);
    
    /* Create a cookie to store user preference */
    document.cookie =  (1 == md.misc.sidebar_mini_active ? "sidebarMini=active; expires=" + expirationDate.toGMTString() : "sidebarMini=inActive; expires=" + expirationDate.toGMTString() );
    
  });

/* Minimise sidebar*/
function minimizeSidebar(){
	 1 == md.misc.sidebar_mini_active ? ($('body').removeClass('sidebar-mini'), md.misc.sidebar_mini_active = !1)  : ($('body').addClass('sidebar-mini'), md.misc.sidebar_mini_active = !0);
 	
	 var e = setInterval(function () {
 	      window.dispatchEvent(new Event('resize'))
 	    }, 180);
 	    setTimeout(function () {
 	      clearInterval(e)
 	    }, 1000)
   
 	    // hide the active pro bottom pane
   if(1 == md.misc.sidebar_mini_active){
    	$('.active-pro').addClass('d-none').removeClass('d-block').animate({ height: '20px' }, 'easeOutQuad', function(){ 
        });
    } else {
    	$('.active-pro').removeClass('d-none').addClass('d-block').animate({ height: '20px' }, 'easeOutQuad', function(){});
    }
}

// Minimize the decimals to a set variable
function round(value, decimals) {
  return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}

// Datetime Picker
<!-- javascript for init -->
$('.datetimepicker').datetimepicker({
	viewMode: 'months',
	viewDate: false,
    format: 'MMM YYYY',
    useCurrent: true,
    icons: {
        time: "fa fa-clock-o",
        date: "fa fa-calendar",
        up: "fa fa-chevron-up",
        down: "fa fa-chevron-down",
        previous: 'fa fa-chevron-left',
        next: 'fa fa-chevron-right',
        today: 'fa fa-screenshot',
        clear: 'fa fa-trash',
        close: 'fa fa-remove'
    },
    tooltips: {
        today: 'Go to today',
        clear: 'Clear selection',
        close: 'Close the picker',
        selectMonth: 'Select Month',
        prevMonth: 'Previous Month',
        nextMonth: 'Next Month',
        selectYear: 'Select Year',
        prevYear: 'Previous Year',
        nextYear: 'Next Year',
        selectDecade: 'Select Decade',
        prevDecade: 'Previous Decade',
        nextDecade: 'Next Decade',
        prevCentury: 'Previous Century',
        nextCentury: 'Next Century'
    }
});

$("#monthYearOnlyPicker").on("dp.show", function(e) {
	   $(e.target).data("DateTimePicker").viewMode("months"); 
});

$('#monthYearOnlyPicker').datetimepicker().on('dp.show dp.update', function () {
    $(".datepicker-years .picker-switch").removeAttr('title')
        //.css('cursor', 'default')
        //.css('background', 'inherit')
        .on('click', function (e) {
            e.stopPropagation();
        });
});

function showNotification(message, from, align, colorCode){

	  $.notify({
	      icon: "add_alert",
	      message: message

	  },{
	      type: colorCode,
	      timer: 4000,
	      placement: {
	          from: from,
	          align: align
	      }
	  });
}

er = {
		startAnimationForLineChart: function (e) {
		    e.on('draw', function (e) {
		      'line' === e.type || 'area' === e.type ? e.element.animate({
		        d: {
		          begin: 600,
		          dur: 700,
		          from: e.path.clone().scale(1, 0).translate(0, e.chartRect.height()).stringify(),
		          to: e.path.clone().stringify(),
		          easing: Chartist.Svg.Easing.easeOutQuint
		        }
		      })  : 'point' === e.type && (seq++, e.element.animate({
		        opacity: {
		          begin: seq * delays,
		          dur: durations,
		          from: 0,
		          to: 1,
		          easing: 'ease'
		        }
		      }))
		    }),
		    seq = 0
		}
}
