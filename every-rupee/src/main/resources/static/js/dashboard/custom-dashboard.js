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