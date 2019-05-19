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

function replaceHtml(el, html) {
    var oldEl = typeof el === "string" ? document.getElementById(el) : el;
    /*@cc_on // Pure innerHTML is slightly faster in IE
        oldEl.innerHTML = html;
        return oldEl;
    @*/
    var newEl = oldEl.cloneNode(false);
    newEl.innerHTML = html;
    oldEl.parentNode.replaceChild(newEl, oldEl);
    /* Since we just removed the old element from the DOM, return a reference
    to the new element, which can be used to restore variable references. */
    return newEl;
}

function cloneElementAndAppend(document, elementToClone){
	let clonedElement = elementToClone.cloneNode(true);
	document.appendChild(elementToClone);
	return clonedElement;
	
}
