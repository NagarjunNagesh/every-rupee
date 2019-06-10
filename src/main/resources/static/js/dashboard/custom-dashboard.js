// Custom Javascript for dashboard
//Stores the Loggedin User
let currentUser = '';
let overviewDashboardId = 'overview-dashboard-sidebar';
let transactionDashboardId = 'transaction-dashboard-sidebar';
let goalDashboardId = 'goal-dashboard-sidebar';
let budgetDashboardId = 'budget-dashboard-sidebar';
let investmentDashboardId = 'investment-dashboard-sidebar';
let settingsDashboardId = 'settings-dashboard-sidebar';
let currentActiveSideBar = '';
let once = false;
//Load Expense category and income category
let expenseSelectionOptGroup = document.createDocumentFragment();
let incomeSelectionOptGroup = document.createDocumentFragment();
let fetchCurrentLoggedInUserUrl = "/api/user/";
let fetchCategoriesUrl = "/api/category/";
let categoryMap = {};
//Expense Category
const expenseCategory = "1";
// Income Category
const incomeCategory = "2";
//Constructs transaction API url
const transactionAPIUrl =  "/api/transactions/";
const saveTransactionsUrl = "/api/transactions/save/";
const transactionsUpdateUrl = "/update/";
const budgetUpdateUrl = "/update/plannedAmount";
const budgetAPIUrl =  "/api/budget/";

//Create Budget Map for transactions
let updateBudgetMap = {};

//chosenDate for transactions
let chosenDate = today.getMonth()+1 + ',' + today.getYear()


window.onload = function () {
	$(document).ready(function(){
		
		// Append "active" class name to toggle sidebar color change
		if($('.overview-dashboard').length) {
			currentActiveSideBar = document.getElementById(overviewDashboardId);
			currentActiveSideBar.classList.add('active');
		}
		
		if($('.income-dashboard').length) {
			currentActiveSideBar = document.getElementById(incomeDashboardId);
			currentActiveSideBar.classList.add('active');
		}
		
		if($('.goal-dashboard').length) {
			currentActiveSideBar = document.getElementById(goalDashboardId);
			currentActiveSideBar.classList.add('active');
		}
		
		if($('.budget-dashboard').length) {
			currentActiveSideBar = document.getElementById(budgetDashboardId);
			currentActiveSideBar.classList.add('active');
		}
		
		if($('.investment-dashboard').length) {
			currentActiveSideBar = document.getElementById(investmentDashboardId);
			currentActiveSideBar.classList.add('active');
		}
		
		if($('.settings-dashboard').length) {
			currentActiveSideBar = document.getElementById(settingsDashboardId);
			currentActiveSideBar.classList.add('active');
		}
		
		// Read Cookies
		readCookie();
		
		/* Read Cookies */
		function readCookie() {
				// make sure that the cookies exists
		        if (document.cookie != "") { 
		        		//Get the value from the name=value pair
		                let sidebarActiveCookie = getCookie('sidebarMini');
		                
		                if(includesStr(sidebarActiveCookie, 'active')) {
		                	 minimizeSidebar();
		                }
		                
		                // Get the value from the name=value pair
		                let cookieCurrentPage = getCookie('currentPage');
		                
		                if(!isEmpty(cookieCurrentPage)) {
		                	fetchCurrentPage(cookieCurrentPage);
		                } else {
		                	// Fetch overview page and display if cookie is empty
		                	fetchCurrentPage('overviewPage');
		                }
		        } else {
		        	// fetch overview page and display if no cookie is present
		        	fetchCurrentPage('overviewPage');
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
		
		// DO NOT load the html from request just refresh div if possible without downloading JS
		$('.pageDynamicLoadForDashboard').click(function(e){
			e.preventDefault();
			let id = $(this).attr('id');
			
			/* Create a cookie to store user preference */
		    var expirationDate = new Date;
		    expirationDate.setMonth(expirationDate.getMonth()+2);
		    
		    /* Create a cookie to store user preference */
		    document.cookie =  "currentPage=" + id + "; expires=" + expirationDate.toGMTString();
			
			fetchCurrentPage(id);
		});
		
		// Fetches the current page 
		function fetchCurrentPage(id){
			let url = '';
			let color = '';
			
			if(isEmpty(id)){
				swal({
	                title: "Error Redirecting",
	                text: 'Please try again later',
	                type: 'warning',
	                timer: 1000,
	                showConfirmButton: false
	            }).catch(swal.noop);
				return;
			}
			
			switch(id) {
			
			case 'transactionsPage':
				url = '/dashboard/transactions';
				color = 'green';
				// Updates the budget before navigating away
				er.updateBudget();
			    break;
			case 'budgetPage':
				url = '/dashboard/budget';
				color = 'rose';
			    break;
			case 'goalsPage':
				url = '/dashboard/goals';
				color = 'orange';
			    break;
			case 'overviewPage':
				url = '/dashboard/overview';
				color = 'azure';
			    break;
			case 'investmentsPage':
				url = '/dashboard/investment';
				color = 'purple';
			    break;
			case 'settings-dashboard-sidebar':
				url = '/dashboard/settings';
				color = 'danger';
			    break;
			case 'profilePage':
				url = '/dashboard/profile';
				color = 'danger';
			    break;
			default:
				swal({
	                title: "Redirecting Not Possible",
	                text: 'Please try again later',
	                type: 'warning',
	                timer: 1000,
	                showConfirmButton: false
	            }).catch(swal.noop);
				return;
			}
			
			// Remove the active class from the current sidebar
			currentActiveSideBar.classList.remove('active');
			// Change the current sidebar
			currentActiveSideBar = document.getElementById($('#' + id).closest('li').attr('id'));
			// Add the active flag to the current one
			$('#' + id).closest('li').addClass('active');
			// Change side bar color to green
        	changeColorOfSidebar(color);
        	// Change Image of sidebar
        	changeImageOfSidebar("../img/dashboard/sidebar/sidebar-1.jpg")
			
		    $.ajax({
		        type: "GET",
		        url: url,
		        dataType: 'html',
		        data: { },
		        success: function(data){
		        	// Load the new HTML
		            $('#mutableDashboard').html(data);
		        },
		        error: function(){
		        	swal({
		                title: "Redirecting Not Possible",
		                text: 'Please try again later',
		                type: 'warning',
		                timer: 1000,
		                showConfirmButton: false
		            }).catch(swal.noop);
		        }
		    });
		}
		
	});
	
}

er = {
		//Loads the currenct logged in user from API (Call synchronously to set global variable)
		fetchJSONForLoggedInUser(){
			$.ajax({
		          type: "GET",
		          url: fetchCurrentLoggedInUserUrl,
		          dataType: "json",
		          success : function(data) {
		        	  currentUser = data;
		        	  
		           }
		        });
		},

		// Load all categories from API (Call synchronously to set global variable)
		fetchJSONForCategories() {
			$.ajax({
		          type: "GET",
		          url: fetchCategoriesUrl,
		          dataType: "json",
		          success : function(data) {
		        	  for(let count = 0, length = Object.keys(data).length; count < length; count++){
		        		  let key = Object.keys(data)[count];
		            	  let value = data[key];

		        		  categoryMap[value.categoryId] = value;
		        		  let option = document.createElement('option');
		    			  option.className = 'categoryOption-' + value.categoryId;
		    			  option.value = value.categoryId;
		    			  option.text = value.categoryName;
		        		  if(value.parentCategory == expenseCategory){
		        			  expenseSelectionOptGroup.appendChild(option);
		        		  } else if(value.parentCategory == incomeCategory) {
		        			  incomeSelectionOptGroup.appendChild(option);
		        		  }
		    		   
		        	  }
		           }
		        });
		},
		
		// Updates the budget before refreshing or navigating away from the page
		updateBudget() {
			jQuery.ajax({
				url: budgetAPIUrl + currentUser.financialPortfolioId + budgetUpdateUrl,
	            type: 'POST',
	            dataType: "json",
		        data : updateBudgetMap,
		        success: function(result) { },
	            async: false
			});
		}
}

//Loads the current Logged in User
er.fetchJSONForLoggedInUser();
// Fetch Categpry 
er.fetchJSONForCategories();

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
	      icon: "notifications",
	      message: message

	  },{
	      type: colorCode,
	      timer: 2000,
	      placement: {
	          from: from,
	          align: align
	      }
	  });
}

function replaceHTML(el, html) {
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

function changeColorOfSidebar(color){
	if ($sidebar.length != 0) {
		 $sidebar.attr('data-color', color);
	 }
}

function changeImageOfSidebar(img) {
	if ($sidebar.length != 0) {
		 $sidebar.attr('data-image', img);
	 }
	// Request image to be changed
	md.checkSidebarImage();
}

//Format numbers in Indian Currency
function formatNumber(num, locale) {
	if(isEmpty(locale)){
		locale = "en-IN";
	}
	  return num.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
