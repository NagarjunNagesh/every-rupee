"use strict";
$(document).ready(function(){
	// User Budget Map Cache
	let userBudgetCache = {};
	// User transaction category ID and total
	let categoryTotalMapCache = {};
	// Store the budget amount edited previously to compare
	let budgetAmountEditedPreviously = '';
	// store the budget chart in the cache to update later
	let budgetCategoryChart = '';
	// last Budgeted Month
	let lastBudgetedMonthName = '';
	let lastBudgetMonth = 0;
	// Category Compensation Modal Values
	let userBudgetAndTotalAvailable = {};
	// Category modal user budget category id;
	let categoryForModalOpened = '';
	
	/**
	 * START loading the page
	 * 
	 */
	// Fetch user budget and build the div
	fetchAllUserBudget();
	
	// Fetches all the user budget and displays them in the user budget
	function fetchAllUserBudget() {
		let budgetDivFragment = document.createDocumentFragment();
		jQuery.ajax({
			url: CUSTOM_DASHBOARD_CONSTANTS.budgetAPIUrl + currentUser.financialPortfolioId + CUSTOM_DASHBOARD_CONSTANTS.dateMeantFor + chosenDate,
            type: 'GET',
            success: function(data) {
            	let dataKeySet = Object.keys(data);
            	for(let count = 0, length = dataKeySet.length; count < length; count++){
	            	let key = dataKeySet[count];
	          	  	let value = data[key];
	          	  
	          	  	if(isEmpty(value)) {
	          	  		continue;
	          	  	}
	          	  	
	          	  	// Store the values in a cache
	          	  	userBudgetCache[value.categoryId] = value;

	          	  	// Appends to a document fragment
	          	  	budgetDivFragment.appendChild(buildUserBudget(value));
            	}
            	
            	// paints them to the budget dashboard
            	let budgetAmount = document.getElementById('budgetAmount');
            	budgetAmount.innerHTML = '';
            	budgetAmount.appendChild(budgetDivFragment);
          	  	
          		fetchTransactions();
            },
            error:  function (thrownError) {
            	 var responseError = JSON.parse(thrownError.responseText);
             	if(responseError.error.includes("Unauthorized")){
             		er.sessionExpiredSwal(thrownError);
             	} else{
             		showNotification('Unable to delete the budget at this moment. Please try again!','top','center','danger');
             	}
             }
		});
		
	}
	
	// Build the user budget div
	function buildUserBudget(userBudget) {
		let categoryObject = categoryMap[userBudget.categoryId];
		
		if(isEmpty(categoryObject)) {
			return;
		}
		
		let card = document.createElement("div");
		card.id = 'cardCategoryId-' + categoryObject.categoryId;
		card.classList = 'card';
		
		let cardBody = document.createElement("div");
		cardBody.classList = 'card-body';
		
		// Card Row Remaining
		let cardRowRemaining = document.createElement('div');
		cardRowRemaining.classList = 'row';
		
		// Card title with category name
		let cardTitle = document.createElement('div');
		cardTitle.id = 'categoryName-' + categoryObject.categoryId;
		cardTitle.classList = 'col-lg-6 text-left font-weight-bold';
		cardTitle.innerText = categoryObject.categoryName;
		cardRowRemaining.appendChild(cardTitle);
		
		
		// <div id="budgetInfoLabelInModal" class="col-lg-12 text-right headingDiv justify-content-center align-self-center">Remaining (%)</div> 
		let cardRemainingText = document.createElement('div');
		cardRemainingText.classList = 'col-lg-6 text-right headingDiv justify-content-center align-self-center mild-text';
		cardRemainingText.id = 'budgetInfoLabelInModal-' + categoryObject.categoryId;
		cardRemainingText.innerText = 'Remaining (%)';
		cardRowRemaining.appendChild(cardRemainingText);
		cardBody.appendChild(cardRowRemaining);
		
		// Card Row Percentage Available
		let cardRowPercentage = document.createElement('div');
		cardRowPercentage.classList = 'row';
		
		// Budget Amount Wrapper
		let cardAmountWrapperDiv = document.createElement('div');
		cardAmountWrapperDiv.classList = 'col-lg-3';
		
		// Budget Amount Div
		let cardBudgetAmountDiv = document.createElement('div');
		cardBudgetAmountDiv.id = 'budgetAmountEntered-' + categoryObject.categoryId;
		cardBudgetAmountDiv.classList = 'text-left budgetAmountEntered font-weight-bold form-control';
		cardBudgetAmountDiv.setAttribute('contenteditable', true);
		cardBudgetAmountDiv.innerText = currentCurrencyPreference + formatNumber(userBudget.planned, currentUser.locale);
		cardAmountWrapperDiv.appendChild(cardBudgetAmountDiv);
		cardRowPercentage.appendChild(cardAmountWrapperDiv);
		
		// <span id="percentageAvailable" class="col-lg-12 text-right">NA</span> 
		let cardRemainingPercentage = document.createElement('div');
		cardRemainingPercentage.classList = 'col-lg-9 text-right percentageAvailable';
		cardRemainingPercentage.id = 'percentageAvailable-' + categoryObject.categoryId;
		cardRemainingPercentage.innerText = 'NA';
		cardRowPercentage.appendChild(cardRemainingPercentage);
		cardBody.appendChild(cardRowPercentage);
		
		// Parent div for Progress Bar
		let cardProgressAndRemainingAmount = document.createElement('div');
		
		// Div progress bar header
		let cardProgressClass = document.createElement('div');
		cardProgressClass.classList = 'progress';
		
		// progress bar
		let progressBar = document.createElement('div');
		progressBar.id='progress-budget-' + categoryObject.categoryId;
		progressBar.classList = 'progress-bar progress-bar-budget-striped';
		progressBar.setAttribute('role', 'progressbar');
		progressBar.setAttribute('aria-valuenow', '0');
		progressBar.setAttribute('aria-valuemin', '0');
		progressBar.setAttribute('aria-valuemax', '100');
		cardProgressClass.appendChild(progressBar);
		cardProgressAndRemainingAmount.appendChild(cardProgressClass);
		
		
		// Remaining Amount Div
		let remainingAmountDiv = document.createElement('span');
		remainingAmountDiv.id = 'remainingAmount-' + categoryObject.categoryId;
		remainingAmountDiv.classList = 'mild-text-budget';
		
		let currencyRemainingAmount = document.createElement('span');
		currencyRemainingAmount.innerText = currentCurrencyPreference + '0.00';
		remainingAmountDiv.appendChild(currencyRemainingAmount);
		cardProgressAndRemainingAmount.appendChild(remainingAmountDiv);
		
		let currencyRemainingText = document.createElement('span');
		currencyRemainingText.classList = 'mild-text'
		currencyRemainingText.innerText = ' Remaining';
		cardProgressAndRemainingAmount.appendChild(currencyRemainingText);
		cardBody.appendChild(cardProgressAndRemainingAmount);
		
		
		let actionDiv = document.createElement('div');
		actionDiv.id = 'actionIcons-' + categoryObject.categoryId;
		actionDiv.classList = 'text-right';
		
		// Build a delete icon Div
		let deleteIconDiv = document.createElement('div');
		deleteIconDiv.classList = 'svg-container deleteIconWrapper d-lg-inline-block';
		deleteIconDiv.setAttribute('data-toggle','tooltip');
		deleteIconDiv.setAttribute('data-placement','bottom');
		deleteIconDiv.setAttribute('title','Delete budget');
		
		// SVG for delete
		let deleteSvgElement = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
		deleteSvgElement.id = 'deleteSvgElement-' + categoryObject.categoryId;
		deleteSvgElement.classList = 'deleteBudget'
		deleteSvgElement.setAttribute('height','16');
		deleteSvgElement.setAttribute('width','16');
		deleteSvgElement.setAttribute('viewBox','0 0 14 18');
    	
		// Changing stroke to currentColor, Wraps the color of the path to its parent div
    	let deletePathElement = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    	deletePathElement.setAttribute('fill','none');
    	deletePathElement.setAttribute('stroke','currentColor');
    	deletePathElement.setAttribute('stroke-width','1.25');
    	deletePathElement.setAttribute('stroke-linecap','square');
    	deletePathElement.setAttribute('d','M4.273 3.727V2a1 1 0 0 1 1-1h3.454a1 1 0 0 1 1 1v1.727M13 5.91v10.455a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V5.909m6 2.727v5.455M4.273 8.636v5.455m5.454-5.455v5.455M13 3.727H1');
    	deleteSvgElement.appendChild(deletePathElement);
    	deleteIconDiv.appendChild(deleteSvgElement);
    	
    	let materialSpinnerElement = document.createElement('div');
    	materialSpinnerElement.id= 'deleteElementSpinner-' + categoryObject.categoryId;
    	materialSpinnerElement.classList = 'material-spinner-small d-none';
    	deleteIconDiv.appendChild(materialSpinnerElement);
    	
    	actionDiv.appendChild(deleteIconDiv);
    	cardBody.appendChild(actionDiv);
    	
		card.appendChild(cardBody);
		return card;
		
	}
	
	// Fetch all the transactions
	function fetchTransactions() {
		jQuery.ajax({
			url: CUSTOM_DASHBOARD_CONSTANTS.transactionAPIUrl + CUSTOM_DASHBOARD_CONSTANTS.transactionFetchCategoryTotal + currentUser.financialPortfolioId + CUSTOM_DASHBOARD_CONSTANTS.dateMeantFor + chosenDate + CUSTOM_DASHBOARD_CONSTANTS.updateBudgetFalseParam,
            type: 'GET',
            success: function(categoryTotalMap) {
            	// Store the result in a cache
            	categoryTotalMapCache = categoryTotalMap;
            	// Get all the category id's
        		let categoryTotalKeys = Object.keys(categoryTotalMap);
        		
        		// Update only when the user budget cache is not empty
        		if(isNotEmpty(userBudgetCache)) {
        			for(let count = 0, length = categoryTotalKeys.length; count < length; count++){
            			let categoryIdKey = categoryTotalKeys[count];
            			
            			// Handle the update of the progress bar modal
            			updateProgressBarAndRemaining(categoryIdKey, document);
            		}
        		}
        		
        		// Update the Budget Visualization module
        		updateBudgetVisualization(true);
        		
            }, 
            error:  function (thrownError) {
            	 var responseError = JSON.parse(thrownError.responseText);
             	if(responseError.error.includes("Unauthorized")){
             		er.sessionExpiredSwal(thrownError);
             	} else{
             		showNotification('Unable to fetch transactions at this moment. Please refresh and try again!','top','center','danger');
             	}
             }
		});
	}
	
	// Update the budget visualization module
	function updateBudgetVisualization(createNewChart) {
		let categoryTotalKeys = Object.keys(categoryTotalMapCache);
		
		let userBudgetCacheKeys = Object.keys(userBudgetCache);
		
		// Append an empty chart when there is no budget
		let dataPreferences = {};
		
		let totalBudgetedCategoriesDiv = document.getElementById('totalBudgetedCategories');
		let toBeBudgetedDiv = document.getElementById('toBeBudgeted');
		let detachChart = false;
		if(isNotEmpty(userBudgetCacheKeys)) {
			totalBudgetedCategoriesDiv.innerText = userBudgetCacheKeys.length;
			// If empty then update the chart with the 0
			toBeBudgetedDiv.innerText = 0;
			
			if(isNotEmpty(categoryTotalKeys)) {
				let toBeBudgetedAvailable = 0;
				
				// Calculate the to be budgeted section
				for(let count = 0, length = categoryTotalKeys.length; count < length; count++){
					let categoryIdKey = categoryTotalKeys[count];
					if(!includesStr(userBudgetCacheKeys, categoryIdKey)) {
						// Add +1 for every category id which is not present in the update budget keys
						toBeBudgetedAvailable++;
					}
				}
				// assign the to be budgeted
				toBeBudgetedDiv.innerText = toBeBudgetedAvailable;
				
				let totalCategoriesAvailable = toBeBudgetedAvailable + userBudgetCacheKeys.length;
				let userBudgetPercentage = round(((userBudgetCacheKeys.length / totalCategoriesAvailable) * 100),1);
				let toBeBudgetedPercentage = round(((toBeBudgetedAvailable / totalCategoriesAvailable) * 100),1);
				// labels: [Total Budgeted Category, To Be Budgeted]
				dataPreferences = {
	                labels: [userBudgetPercentage + '%',toBeBudgetedPercentage + '%'],
	                series: [userBudgetPercentage,toBeBudgetedPercentage]
	            };
			}
		} else {
			// If empty then update the chart with the 0
			toBeBudgetedDiv.innerText = 0;
			totalBudgetedCategoriesDiv.innerText = 0;
			detachChart = true;
			
			// assign the to be budgeted for budget visualization chart
			toBeBudgetedDiv.innerText = categoryTotalKeys.length;
			
			// Create a document fragment to append
			let emptyBudgetDocumentFragment = document.createDocumentFragment();
			emptyBudgetDocumentFragment.appendChild(createCopyFromPreviousMonthModal());
			
			// Replace the HTML of the empty modal
			let budgetAmountDiv = document.getElementById('budgetAmount');
			// Replace the HTML to empty and then append child
			budgetAmountDiv.innerHTML = '';
			budgetAmountDiv.appendChild(emptyBudgetDocumentFragment);
		}
		
		if(createNewChart) {
			buildPieChart(dataPreferences , 'chartBudgetVisualization');
		} else if(detachChart) {
			// Remove the donut chart from the DOM
			let chartDonutSVG = document.getElementsByClassName('ct-chart-donut');
			
			if(chartDonutSVG.length > 0) {
				chartDonutSVG[0].parentNode.removeChild(chartDonutSVG[0]);
				// Detach the chart
				budgetCategoryChart.detach();
			}
		} else  {
			budgetCategoryChart.update(dataPreferences);
		}
		
		// Fetches all the dates for which user budget is present
		fetchAllDatesWithUserBudgetData();
	}
	
	// Introduce Chartist pie chart
	function buildPieChart(dataPreferences, id) {
		 /*  **************** Public Preferences - Pie Chart ******************** */

        var optionsPreferences = {
		  donut: true,
		  donutWidth: 50,
		  donutSolid: true,
		  startAngle: 270,
		  showLabel: true,
		  height: '230px'
        };
        
        // Reset the chart
        replaceHTML(id, '');
        // Dispose the previous tooltips created
        $("#" + id).tooltip('dispose');
        
        if(isNotEmpty(dataPreferences)) {
        	// Build chart and Add tooltip for the doughnut chart
        	budgetCategoryChart = new Chartist.Pie('#' + id, dataPreferences, optionsPreferences).on('draw', function(data) {
      		  if(data.type === 'slice') {
		        	let sliceValue = data.element._node.getAttribute('ct:value');
		        	data.element._node.setAttribute("title", "Percentage: <strong>" + round(Number(sliceValue),2) + '%</strong>');
					data.element._node.setAttribute("data-chart-tooltip", id);
      		  }
			}).on("created", function() {
				// Initiate Tooltip
				$("#" + id).tooltip({
					selector: '[data-chart-tooltip="' + id + '"]',
					container: "#" + id,
					html: true,
					placement: 'auto',
					delay: { "show": 300, "hide": 100 }
				});
			});
        }
        
	}
	
	// Catch the amount when the user focuses on the budget
	$( "#budgetAmount" ).on( "focusin", ".budgetAmountEntered" ,function() {
		budgetAmountEditedPreviously = trimElement(this.innerText);
	});
	
	// Catch the amount when the user focuses on the budget
	$( "#budgetAmount" ).on( "focusout", ".budgetAmountEntered" ,function() {
		postNewBudgetAmount(this);
	});
	

	// Amount - disable enter key and submit request
	$('#budgetAmount').on('keyup', '.budgetAmountEntered' , function(e) {
		  var keyCode = e.keyCode || e.which;
		  if (keyCode === 13) { 
		    e.preventDefault();

		    document.activeElement.blur();
		    return false;
		  }
	});
	
	// Post the newly entered budget amount and convert the auto generation to false
	function postNewBudgetAmount(element) {
		// If the text is not changed then do nothing (Remove currency locale and minus sign, remove currency formatting and take only the number and convert it into decimals) and round to 2 decimal places
		let enteredText = er.convertToNumberFromCurrency(element.innerText, currentCurrencyPreference);
		let previousText = er.convertToNumberFromCurrency(budgetAmountEditedPreviously, currentCurrencyPreference);
		
		// Test if the entered value is valid
		if(isNaN(enteredText) || !regexForFloat.test(enteredText) || enteredText == 0) {
			// Replace the entered text with 0 inorder for the code to progress.
			enteredText = 0;
		} else if(enteredText < 0){
			// Replace negative sign to positive sign if entered by the user
			enteredText = parseFloat(Math.abs(enteredText),2);
		}
		
		// Test if the previous value is valid
		if(isNaN(previousText) || !regexForFloat.test(previousText) || previousText == 0) {
			previousText = 0;
		}
		
		if(previousText != enteredText){
			// Fetch the id
			let categoryIdForBudget = lastElement(splitElement(element.id,'-'));
			// Security check to ensure that the category is present in the map
			if(er.checkIfInvalidCategory(categoryIdForBudget)) {
				return;
			}
			
			// Post a new budget to the user budget module and change to auto generated as false. 
			var values = {};
			values['planned'] = enteredText;
			values['category_id'] = categoryIdForBudget;
			values['autoGenerated'] = 'false';
			values['dateMeantFor'] = chosenDate;
			$.ajax({
		          type: "POST",
		          url: CUSTOM_DASHBOARD_CONSTANTS.budgetAPIUrl + CUSTOM_DASHBOARD_CONSTANTS.budgetSaveUrl + currentUser.financialPortfolioId,
		          dataType: "json",
		          contentType: "application/x-www-form-urlencoded; charset=UTF-8",
		          data : values,
		          success: function(userBudget){
		        	  // on success then replace the entered text 
		        	  element.innerText = currentCurrencyPreference + formatNumber(enteredText, currentUser.locale);
		        	  // Update the budget cache
		        	  userBudgetCache[userBudget.categoryId] = userBudget;
		        	  // Update the modal
		        	  updateProgressBarAndRemaining(userBudget.categoryId, document);
		          },
		          error: function (thrownError) {
	              	 var responseError = JSON.parse(thrownError.responseText);
	                   	if(responseError.error.includes("Unauthorized")){
	                   		er.sessionExpiredSwal(thrownError);
	                   	} else{
	                   		showNotification('Unable to change the budget. Please try again','top','center','danger');
	                   		// update the current element with the previous amount
	                   		let formattedBudgetAmount = currentCurrencyPreference + formatNumber(previousText , currentUser.locale);
	                   		element.innerText = formattedBudgetAmount;
	                   	}
	               }
			});
		} else {
			// previous text and entered text is the same then simy replace the text
			element.innerText = currentCurrencyPreference + formatNumber(enteredText, currentUser.locale);
		}
	}
	
	// Use user budget to update information in the modal
	function updateProgressBarAndRemaining(categoryIdKey, documentOrFragment) {
		let categoryTotalAmount = categoryTotalMapCache[categoryIdKey];
		
		let userBudgetValue = userBudgetCache[categoryIdKey];
		
		let remainingAmountDiv = documentOrFragment.getElementById('remainingAmount-' + categoryIdKey);
		let remainingAmountPercentageDiv = documentOrFragment.getElementById('percentageAvailable-' + categoryIdKey);
		let budgetLabelDiv = documentOrFragment.getElementById('budgetInfoLabelInModal-' + categoryIdKey);
		let progressBarCategoryModal = documentOrFragment.getElementById('progress-budget-' + categoryIdKey);
		// If the budget is not created for the particular category, make sure the budget is not equal to zero
		if(isNotEmpty(userBudgetValue) && isNotEmpty(categoryTotalAmount)) {
			// Calculate remaining budget
			let budgetAvailableToSpendOrSave = userBudgetValue.planned - categoryTotalAmount;
			let minusSign = '';
			
			// Calculate the minus sign and appropriate class for the remaining amount 
			if(budgetAvailableToSpendOrSave < 0) {
				// if the transaction category is expense category then show overspent else show To be budgeted
				if(categoryMap[categoryIdKey].parentCategory == CUSTOM_DASHBOARD_CONSTANTS.expenseCategory) {
					budgetLabelDiv.innerText = 'Overspent (%)';
				} else if(categoryMap[categoryIdKey].parentCategory == CUSTOM_DASHBOARD_CONSTANTS.incomeCategory) {
					budgetLabelDiv.innerText = 'To Be Budgeted (%)';
				}
				
				// Anchor Icons
				createImageAnchor(categoryIdKey, documentOrFragment);
				
				minusSign = '-';
				budgetAvailableToSpendOrSave = Math.abs(budgetAvailableToSpendOrSave);
			} else {
				budgetLabelDiv.innerText = 'Remaining (%)';
				
				// Remove the compensation anchor if it is present
				var compensateAnchor = document.getElementById('compensateAnchor-'+ categoryIdKey);
				if(compensateAnchor != null) {
					compensateAnchor.parentNode.removeChild(compensateAnchor);
				}
			}
			
			// Change the remaining text appropriately
			remainingAmountDiv.innerText = minusSign + currentCurrencyPreference + formatNumber(budgetAvailableToSpendOrSave, currentUser.locale);
			
			// Calculate percentage available to spend or save
			let remainingAmountPercentage = round(((budgetAvailableToSpendOrSave / userBudgetValue.planned) * 100),0);
			// If the user budget is 0 then the percentage calculation is not applicable
			if(userBudgetValue.planned == 0 || isNaN(remainingAmountPercentage)) {
				remainingAmountPercentageDiv.innerText = 'NA';
			} else {
				remainingAmountPercentageDiv.innerText = remainingAmountPercentage + '%';
			}
			
			// Assign progress bar value. If the category amount is higher then the progress is 100%
			let progressBarPercentage = isNaN(remainingAmountPercentage) ? 0 : (categoryTotalAmount > userBudgetValue.planned) ? 100 : (100 - remainingAmountPercentage);
			// Set the value and percentage of the progress bar
			progressBarCategoryModal.setAttribute('aria-valuenow', progressBarPercentage);
			progressBarCategoryModal.style.width = progressBarPercentage + '%'; 
		} else if(progressBarCategoryModal != null) {
			remainingAmountPercentageDiv.innerText = 'NA';
			// Set the value and percentage of the progress bar
			progressBarCategoryModal.setAttribute('aria-valuenow', 0);
			progressBarCategoryModal.style.width = 0 + '%';
			// Set the amount remaining
			remainingAmountDiv.innerText = currentCurrencyPreference + formatNumber(0.00, currentUser.locale);
			// Set the budget remaining text
			budgetLabelDiv.innerText = 'Remaining (%)';
		}
	}
	
	// Create image anchor for compensating budget icon
	function createImageAnchor(categoryIdKey, documentOrFragment) {
		let actionIconsDiv = documentOrFragment.getElementById('actionIcons-' + categoryIdKey);
		let checkImageExistsDiv = document.getElementById('compensateBudgetImage-' + categoryIdKey);
		// If the compensation anchor exists do not create it
		if(checkImageExistsDiv == null) {
			// Document Fragment for compensation
			let compensationDocumentFragment = document.createDocumentFragment();
			let compensationIconsDiv = document.createElement('a');
			compensationIconsDiv.classList = 'compensateAnchor';
			compensationIconsDiv.id='compensateAnchor-' + categoryIdKey;
			compensationIconsDiv.setAttribute('data-toggle','tooltip');
			compensationIconsDiv.setAttribute('data-placement','bottom');
			compensationIconsDiv.setAttribute('title','Compensate overspending');
			
			let compensationImage = document.createElement('img');
			compensationImage.id= 'compensateBudgetImage-' + categoryIdKey;
			compensationImage.classList = 'compensateBudgetImage';
			compensationImage.src = '../img/dashboard/budget/icons8-merge-16.png'
			compensationIconsDiv.appendChild(compensationImage);
			compensationDocumentFragment.appendChild(compensationIconsDiv);
			// Insert as a first child
			actionIconsDiv.insertBefore(compensationDocumentFragment, actionIconsDiv.childNodes[0]);
		}
	}
	
	// Add click event listener to delete the budget
	$('#budgetAmount').on('click', '.deleteBudget' , function(e) {
		let deleteButtonElement = this;
		let categoryId = lastElement(splitElement(this.id,'-'));
		
		// Show the material spinner and hide the delete button
		document.getElementById('deleteElementSpinner-' + categoryId).classList.toggle('d-none');
		this.classList.toggle('d-none');
		
		// Hide the compensation image if present
		compensateBudget = document.getElementById('compensateBudgetImage-' + categoryId);
		if(compensateBudget != null) {
			compensateBudget.classList.toggle('d-none');
		}
		
		// Security check to ensure that the budget is present
		if(isEmpty(userBudgetCache[categoryId])) {
			showNotification('Unable to delete the budget. Please refresh and try again!','top','center','danger');
			return;
		}
		
		// Request to delete the user budget
		$.ajax({
	          type: "DELETE",
	          url: CUSTOM_DASHBOARD_CONSTANTS.budgetAPIUrl + currentUser.financialPortfolioId + '/' + categoryId + CUSTOM_DASHBOARD_CONSTANTS.dateMeantFor + chosenDate + CUSTOM_DASHBOARD_CONSTANTS.deleteOnlyAutoGeneratedFalseParam,
	          contentType: "application/json; charset=utf-8", 
              success: function() {
            	  // Remove the budget modal
            	  $('#cardCategoryId-' + categoryId).fadeOut('slow', function(){
            		  this.remove();
            	  });
            	  	
            	  // Delete the entry from the map if it is pending to be updated
  				  delete userBudgetCache[categoryId];
  				
            	  // Update budget visualization chart after deletion
            	  updateBudgetVisualization(false);
            	  
            	  // reset the dates cache for the user budget
            	  if(isEmpty(userBudgetCache)) {
            		  let datesCache = [];
            		  for(let count = 0, length = datesWithUserBudgetData.length; count < length; count++){
            			  
            			  // ignore the chosen date
            			  if(Number(datesWithUserBudgetData) != Number(chosenDate)) {
            				  datesCache.push(datesWithUserBudgetData[count]);
            			  }
            		  }
            		  // replace the cached dates with the new ones
            		  datesWithUserBudgetData = datesCache;
            	  }
              },
              error:  function (thrownError) {
             	 var responseError = JSON.parse(thrownError.responseText);
              	if(responseError.error.includes("Unauthorized")){
              		er.sessionExpiredSwal(thrownError);
              	} else{
              		showNotification('Unable to delete the budget at this moment. Please try again!','top','center','danger');
              	}
              	
              	// Remove the material spinner and show the delete button again
              	document.getElementById('deleteElementSpinner-' + categoryId).classList.toggle('d-none');
              	deleteButtonElement.classList.toggle('d-none');
              }
		});
		
	});
	
	// Copy all budget from previous modal if budget is empty
	function createCopyFromPreviousMonthModal() {
		// User chosen month
		userChosenMonthName = months[Number(chosenDate.slice(2, 4)) - 1];
		
		let card = document.createElement("div");
		card.id = 'emptyBudgetCard';
		card.classList = 'card text-center';
		
		let cardBody = document.createElement("div");
		cardBody.classList = 'card-body';
		
		let imgDiv = document.createElement('div');
		imgDiv.classList = 'position-relative';
		
		let imgTransfer = document.createElement('img');
		imgTransfer.id = 'budgetImage';
		imgTransfer.src = '../img/dashboard/budget/icons8-documents-100.png';
		imgDiv.appendChild(imgTransfer);
		
		let monthSpan = document.createElement('span');
		monthSpan.classList = 'previousMonth';
		imgDiv.appendChild(monthSpan);
		
		let monthSpanCurrent = document.createElement('span');
		monthSpanCurrent.classList = 'currentMonth';
		monthSpanCurrent.innerText = userChosenMonthName.slice(0,3);
		imgDiv.appendChild(monthSpanCurrent)
		cardBody.appendChild(imgDiv);
		
		// Card Row Heading
		let cardRowHeading = document.createElement('div');
		cardRowHeading.id = 'emptyBudgetHeading'
		cardRowHeading.classList = 'row font-weight-bold justify-content-center';
		cardRowHeading.innerHTML = 'Hey, Looks like you need a budget for ' + userChosenMonthName + '.';
		cardBody.appendChild(cardRowHeading);
		
		// card description
		let cardRowDescription = document.createElement('div');
		cardRowDescription.id = 'emptyBudgetDescription';
		cardRowDescription.classList = 'row justify-content-center';
		cardBody.appendChild(cardRowDescription);
		
		// card button clone
		let clonePreviousMonthButton = document.createElement('button');
		clonePreviousMonthButton.id = 'copyPreviousMonthsBudget';
		clonePreviousMonthButton.classList = 'btn btn-budget'
		clonePreviousMonthButton.innerHTML = 'Start Planning For ' + userChosenMonthName;
		cardBody.appendChild(clonePreviousMonthButton);
			
		card.appendChild(cardBody);
		
		return card;
	}
	
	// Clicking on copy budget
	$('#budgetAmount').on('click', '#copyPreviousMonthsBudget' , function(e) {
		this.setAttribute("disabled", "disabled");
		this.innerHTML = 'Creating budgets..';
		let element = this;
		let budgetAmount = document.getElementById('budgetAmount');
		
		if(isEmpty(datesWithUserBudgetData) && isEmpty(userBudgetCache)) {
			// Appends to a document fragment
      	  	createAnEmptyBudgets(CUSTOM_DASHBOARD_CONSTANTS.defaultCategory, budgetAmount);
      	  	createAnEmptyBudgets(CUSTOM_DASHBOARD_CONSTANTS.defaultCategory+1, budgetAmount);
			return;
		}
		
		var values = {};
		values['dateToCopy'] = lastBudgetMonth;
		values['dateMeantFor'] = chosenDate;
		$.ajax({
	          type: "POST",
	          url: CUSTOM_DASHBOARD_CONSTANTS.budgetAPIUrl + CUSTOM_DASHBOARD_CONSTANTS.budgetCopyBudgetUrl + currentUser.financialPortfolioId,
	          dataType: "json",
	          contentType: "application/x-www-form-urlencoded; charset=UTF-8",
	          data: values,
	          success: function(userBudgets) {
	        	
	        	if(isEmpty(userBudgets)) {
	        		return;
	        	}
	        	
	        	let budgetDivFragment = document.createDocumentFragment();
	        	// Update User Budget
	        	let dataKeySet = Object.keys(userBudgets)
	        	for(let count = 0, length = dataKeySet.length; count < length; count++){
	        		let key = dataKeySet[count];
	          	  	let value = userBudgets[key];
	          	  
	          	  	if(isEmpty(value)) {
	          	  		continue;
	          	  	}
	          	  	
	          	  	// Store the values in a cache
	          	  	userBudgetCache[value.categoryId] = value;

	          	  	// Appends to a document fragment
	          	  	budgetDivFragment.appendChild(buildUserBudget(value));
	          	  	
	          	  	// Handle the update of the progress bar modal
        			updateProgressBarAndRemaining(value.categoryId, budgetDivFragment);
            	}
            	
            	// paints them to the budget dashboard
            	budgetAmount.innerHTML = '';
            	budgetAmount.appendChild(budgetDivFragment);

	        	
        		// Update the Budget Visualization module
        		updateBudgetVisualization(true);
        		
	          }, 
	          error: function(thrownError) {
              	var responseError = JSON.parse(thrownError.responseText);
               	if(responseError.error.includes("Unauthorized")){
               		er.sessionExpiredSwal(thrownError);
               	} else if(responseError.error.includes("InvalidAttributeValue")) {
               		showNotification('Do you already have budget for ' + userChosenMonthName + '?','top','center','danger');
               	} else{
               		showNotification('Unable to copy the budget. Please try again','top','center','danger');
               	}
               	
               	// disable the button
	        	element.removeAttribute("disabled");
	        	element.innerHTML = 'Start Planning For ' + userChosenMonthName;
	          }
		});
	});
	
	// Fetches all the dates for which user budget is present
	function fetchAllDatesWithUserBudgetData() {
		// Fetch all dates
		jQuery.ajax({
			url: CUSTOM_DASHBOARD_CONSTANTS.budgetAPIUrl + CUSTOM_DASHBOARD_CONSTANTS.budgetFetchAllDates + currentUser.financialPortfolioId,
            type: 'GET',
            success: function(dates) {
            	// If dates are empty then return
            	if(isEmpty(dates)) {
            		return;
            	}
            	
            	// Array of dates stored in a cache
            	datesWithUserBudgetData = dates;
            	
            	// Reset the last month date
            	lastBudgetMonth = 0;
            	
            	// Update the latest budget month
            	for(let count = 0, length = datesWithUserBudgetData.length; count < length; count++) {
            		let userBudgetDate = datesWithUserBudgetData[count];
            		
            		// Update the date picker with existing budgets
                	updateExistingBudgetInDatePicker(userBudgetDate);
            		
            		if(isEmpty(lastBudgetMonth) || userBudgetDate > lastBudgetMonth) {
            			// Append preceeding zero
            			lastBudgetMonth = ('0' + userBudgetDate).slice(-8);
            		}
            	}
            	
            	// Last Budget Month Name
            	lastBudgetedMonthName = months[Number(lastBudgetMonth.toString().slice(2, 4) -1)];
            	
            	let emptyBudgetDiv = document.getElementById('emptyBudgetCard');
            	// If the user budget is empty then update the fields of empty div
            	if(isEmpty(userBudgetCache) && emptyBudgetDiv != null) {
            		// Update descriptions of the empty budget
                	let cardRowDescription = document.getElementById('emptyBudgetDescription');
                	cardRowDescription.innerHTML = "We'll clone <strong> &nbsp" + lastBudgetedMonthName + "'s budget &nbsp</strong> for you to get started";
                	
                	// Display the name if user budget is empty
                	let previousMonthDiv = document.getElementsByClassName('previousMonth');
                	previousMonthDiv[0].innerText = lastBudgetedMonthName.slice(0,3);
            	}
            },
            error:  function (thrownError) {
            	 var responseError = JSON.parse(thrownError.responseText);
             	if(responseError.error.includes("Unauthorized")){
             		er.sessionExpiredSwal(thrownError);
             	} else{
             		showNotification('Unable to fetch the budget at this moment. Please try again!','top','center','danger');
             	}
             }
		});
	}
	
	// Create two empty budgets on click Start Planning for .. button
	function createAnEmptyBudgets(categoryId, budgetAmountDiv) {
		
		var values = {};
		values['planned'] = 0;
		values['category_id'] = categoryId;
		values['autoGenerated'] = 'false';
		values['dateMeantFor'] = chosenDate;
		$.ajax({
	          type: "POST",
	          url: CUSTOM_DASHBOARD_CONSTANTS.budgetAPIUrl + CUSTOM_DASHBOARD_CONSTANTS.budgetSaveUrl + currentUser.financialPortfolioId,
	          dataType: "json",
	          contentType: "application/x-www-form-urlencoded; charset=UTF-8",
	          data: values,
	          success: function(userBudget) {
	        	let budgetDivFragment = document.createDocumentFragment();
	        	budgetDivFragment.appendChild(buildUserBudget(userBudget));
	        	
	        	// Store the values in a cache
          	  	userBudgetCache[userBudget.categoryId] = userBudget;
          	  	
          	  	let categoryNameDiv = budgetDivFragment.getElementById('categoryName-' + userBudget.categoryId);
          	  	categoryNameDiv.innerHTML = '';
          	  	
          	  	// Container for inlining the select form
          	  	let containerForSelect = document.createElement('div');
          	  	containerForSelect.classList = 'd-lg-inline-block';
          	  	
          	  	// Append the select group to the category Name. Enabling use to change the category
          	  	let selectCategoryElement = document.createElement('select');
          	  	selectCategoryElement.id = 'categoryOptions-' + userBudget.categoryId;
          	  	selectCategoryElement.classList = 'categoryOptions form-control';
          	  	selectCategoryElement.setAttribute('data-toggle', 'dropdown');
          	  	selectCategoryElement.setAttribute('data-style', 'btn btn-primary');
          	  	selectCategoryElement.setAttribute('aria-haspopup', true);
          	  	selectCategoryElement.setAttribute('aria-expanded', false); 
          	  	selectCategoryElement.setAttribute('data-width', 'auto');
          	  	selectCategoryElement.setAttribute('data-container', 'body');
          	  	selectCategoryElement.setAttribute('data-size', '5');
          	  	
          	  	let optGroupExpense = document.createElement('optgroup');
          	  	optGroupExpense.id = 'expenseSelection-' + userBudget.categoryId;
          	  	optGroupExpense.classList = 'expenseSelection form-control';
          	  	optGroupExpense.label = 'Expenses';
          	  	// Load Expense category
	      		expenseSelectionOptGroup = cloneElementAndAppend(optGroupExpense, expenseSelectionOptGroup);
          	  	selectCategoryElement.appendChild(optGroupExpense);
          	  	
          	  	let optGroupIncome = document.createElement('optgroup');
        	  	optGroupIncome.id = 'incomeSelection-' + userBudget.categoryId;
        	  	optGroupIncome.classList = 'incomeSelection form-control';
        	  	optGroupIncome.label = 'Income';
        	  	// Load income category
        	  	incomeSelectionOptGroup = cloneElementAndAppend(optGroupIncome, incomeSelectionOptGroup);
        	  	selectCategoryElement.appendChild(optGroupIncome);
        	  	
        	  	// Set the relevant category in the options to selected
        		let toSelectOption = selectCategoryElement.getElementsByClassName('categoryOption-' + userBudget.categoryId);
        		toSelectOption[0].selected = 'selected';
        		
        		containerForSelect.appendChild(selectCategoryElement);
        	  	categoryNameDiv.appendChild(containerForSelect);
        	  	
        	  	// Handle the update of the progress bar modal
    			updateProgressBarAndRemaining(userBudget.categoryId, budgetDivFragment);

	      		// paints them to the budget dashboard if the empty budget div is not null
	      		if(document.getElementById('emptyBudgetCard') !== null) {
	      			// Empty the div
	      			budgetAmountDiv.innerHTML = '';
	      			budgetAmountDiv.appendChild(budgetDivFragment);
	      		} else if(budgetAmountDiv.childNodes[0] != null) {
	      			budgetAmountDiv.insertBefore(budgetDivFragment,budgetAmountDiv.childNodes[0]);
	      		} else {
	      			budgetAmountDiv.appendChild(budgetDivFragment);
	      		}
            	
            	// Update the Budget Visualization module
        		updateBudgetVisualization(true);
            	
	          },
	          error:  function (thrownError) {
            	var responseError = JSON.parse(thrownError.responseText);
             	if(responseError.error.includes("Unauthorized")){
             		er.sessionExpiredSwal(thrownError);
             	} else{
             		showNotification('Unable to create the budgets. Please refresh and try again!','top','center','danger');
             	}
             }
		});
	}
	
	// Change trigger on select
	$( "#budgetAmount" ).on( "change", ".categoryOptions" ,function() {
		let categoryId = lastElement(splitElement(this.id, '-'));

		// Make sure that the category selected is not budgeted
		let allUnbudgetedCategories = returnUnbudgetedCategories();
		if(!includesStr(allUnbudgetedCategories,this.value)) {
			showNotification('The selected category already has a budget. Please choose a different category!','top','center','danger');
			return;
		}
		
		// Call the change of category services
		let values = {};
		values['category_id'] = categoryId; 
		values['newCategoryId'] = this.value;
		values['dateMeantFor'] = chosenDate;
		$.ajax({
	          type: "POST",
	          url: CUSTOM_DASHBOARD_CONSTANTS.budgetAPIUrl + CUSTOM_DASHBOARD_CONSTANTS.changeBudgetUrl + currentUser.financialPortfolioId,
	          dataType: "json",
	          contentType: "application/x-www-form-urlencoded; charset=UTF-8", 
	          data : values,
	          success: function(userBudget){
	        	  
	        	 if(isEmpty(userBudget)) {
	        		 showNotification("Sorry, We couldn't change the budegt at the moment. Please refresh and try again",'top','center','danger');
	        		 return;
	        	 }
	        	  
	        	 // Delete the entry from the map if it is pending to be updated
  				 delete userBudgetCache[categoryId];
  				 
  				 // Assign new category to the user budget cache
  				 userBudgetCache[userBudget.categoryId] = userBudget;
  				  
	        	 // Update all category IDs
	        	 let catergoryIdCard = document.getElementById('cardCategoryId-' + categoryId);
	        	 catergoryIdCard.id = 'cardCategoryId-' + userBudget.categoryId;
	        	 
	        	 let categoryNameDiv = document.getElementById('categoryName-' + categoryId);
	        	 categoryNameDiv.id = 'categoryName-' + userBudget.categoryId;
	        	 
	        	 let categoryOptionsDiv = document.getElementById('categoryOptions-' + categoryId);
	        	 categoryOptionsDiv.id = 'categoryOptions-' + userBudget.categoryId;
	        	 
	        	 let expenseSelectionDiv = document.getElementById('expenseSelection-' + categoryId);
	        	 expenseSelectionDiv.id = 'expenseSelection-' + userBudget.categoryId;
	        	 
	        	 let incomeSelectionDiv = document.getElementById('incomeSelection-' + categoryId);
	        	 incomeSelectionDiv.id = 'incomeSelection-' + userBudget.categoryId;
	        	 
	        	 let budgetInfoLabelInModalDiv = document.getElementById('budgetInfoLabelInModal-' + categoryId);
	        	 budgetInfoLabelInModalDiv.id = 'budgetInfoLabelInModal-' + userBudget.categoryId;
	        	 
	        	 let budgetAmountEnteredDiv = document.getElementById('budgetAmountEntered-' + categoryId);
	        	 budgetAmountEnteredDiv.id = 'budgetAmountEntered-' + userBudget.categoryId;
	        	 
	        	 let percentageAvailableDiv = document.getElementById('percentageAvailable-' + categoryId);
	        	 percentageAvailableDiv.id = 'percentageAvailable-' + userBudget.categoryId;
	        	 
	        	 let progressBudgetDiv = document.getElementById('progress-budget-' + categoryId);
	        	 progressBudgetDiv.id = 'progress-budget-' + userBudget.categoryId;
	        	 
	        	 let remainingAmountDiv = document.getElementById('remainingAmount-' + categoryId);
	        	 remainingAmountDiv.id = 'remainingAmount-' + userBudget.categoryId;
	        	 
	        	 let deleteSvgElementDiv = document.getElementById('deleteSvgElement-' + categoryId);
	        	 deleteSvgElementDiv.id = 'deleteSvgElement-' + userBudget.categoryId;
	        	 
	        	 let deleteElementSpinnerDiv = document.getElementById('deleteElementSpinner-' + categoryId);
	        	 deleteElementSpinnerDiv.id = 'deleteElementSpinner-' + userBudget.categoryId;
	        	 
	        	 let actionIconsDiv = document.getElementById('actionIcons-' + categoryId);
	        	 actionIconsDiv.id = 'actionIcons-' + userBudget.categoryId;
	        	 
	        	 let compensateAnchorDiv = document.getElementById('compensateAnchor-' + categoryId);
	        	 if(compensateAnchorDiv != null) {
	        		 compensateAnchorDiv.parentNode.removeChild(compensateAnchorDiv);
	        	 }
	        	 
	        	// Handle the update of the progress bar modal
     			updateProgressBarAndRemaining(userBudget.categoryId, document);
	        	 
	          },
	          error:  function (thrownError) {
            	var responseError = JSON.parse(thrownError.responseText);
             	if(responseError.error.includes("Unauthorized")){
             		er.sessionExpiredSwal(thrownError);
             	} else{
             		showNotification('Unable to change the budget category at this moment. Please try again!','top','center','danger');
             	}
             }
		});
	
	});
	
	// Add Budgets Button
	$('#budgetChart').on('click', '#addNewBudgets' , function(e) {
		e.preventDefault();
		
		let categoryId = returnUnbudgetedCategory();
		
		if(isEmpty(categoryId)) {
			showNotification('You have a budget for all the categories!','top','center','danger');
			return;
		}
		
		let budgetAmountDiv = document.getElementById('budgetAmount');
		createAnEmptyBudgets(categoryId, budgetAmountDiv);
	});
	
	// Find the unbudgeted category 
	function returnUnbudgetedCategory() {
		let categoryId = '';
		
		// Iterate through all the available categories
		if(isEmpty(userBudgetCache)) {
			categoryId = CUSTOM_DASHBOARD_CONSTANTS.defaultCategory;
		} else {
			let allBudgetedCategories = [];
			// Get all the budgeted categories
			let budgetKeySet = Object.keys(userBudgetCache);
			for(let count = 0, length = budgetKeySet.length; count < length; count++){
				let key = budgetKeySet[count];
	      	  	let budgetObject = userBudgetCache[key];
	      	  	// Push the budgeted category to cache
	      	  	isNotEmpty(budgetObject) && allBudgetedCategories.push(key);
			}
			
			
			let dataKeySet = Object.keys(categoryMap);
			for(let count = 0, length = dataKeySet.length; count < length; count++){
				let key = dataKeySet[count];
	      	  	
	      	  	// If a category that is not contained in the budget cache is found then assign and leave for loop
	      	  	if(!includesStr(allBudgetedCategories,key) && isNotEqual(key,CUSTOM_DASHBOARD_CONSTANTS.expenseCategory) && isNotEqual(key,CUSTOM_DASHBOARD_CONSTANTS.incomeCategory)) {
	      	  		categoryId = key;
	      	  		break;
	      	  	}
	      	  	
			}
		}
		
		return categoryId;
	}
	
	// Find the unbudgeted categories 
	function returnUnbudgetedCategories() {
		let categoryIdArray = [];
		
		// Iterate through all the available categories
		if(isEmpty(userBudgetCache)) {
			// iterate through all available categories and 
			let dataKeySet = Object.keys(categoryMap);
			for(let count = 0, length = dataKeySet.length; count < length; count++){
				let key = dataKeySet[count];
	      	  	let categoryObject = categoryMap[key];
	      	  	categoryIdArray.push(categoryObject.categoryId);
			}
		} else {
			let allBudgetedCategories = [];
			// Get all the budgeted categories
			let budgetKeySet = Object.keys(userBudgetCache);
			for(let count = 0, length = budgetKeySet.length; count < length; count++){
				let key = budgetKeySet[count];
	      	  	let budgetObject = userBudgetCache[key];
	      	  	// Push the budgeted category to cache
	      	  	isNotEmpty(budgetObject) && allBudgetedCategories.push(key);
			}
			
			// Iterate through all the available categories and find the ones that does not have a budget yet
			let dataKeySet = Object.keys(categoryMap);
			for(let count = 0, length = dataKeySet.length; count < length; count++){
				let key = dataKeySet[count];
	      	  	
	      	  	// If a category that is not contained in the budget cache is found then assign and leave for loop
	      	  	if(!includesStr(allBudgetedCategories,key) && isNotEqual(key,CUSTOM_DASHBOARD_CONSTANTS.expenseCategory) && isNotEqual(key,CUSTOM_DASHBOARD_CONSTANTS.incomeCategory)) {
	      	  		categoryIdArray.push(key);
	      	  	}
	      	  	
			}
		}
		
		return categoryIdArray;
	}
	
	/**
	 *  Compensate Budget Module
	 */
	$('#budgetAmount').on('click', '.compensateAnchor' , function() {
		let categoryCompensationTitle = document.getElementById('categoryCompensationTitle');
		let compensationDropdownMenu = document.getElementById('compensationDropdownMenu-1');
		let anchorDropdownItemFragment = document.createDocumentFragment();
		let categoryId = lastElement(splitElement(this.id, '-'));
		// Reset the cached variables
		userBudgetAndTotalAvailable = {};
		categoryForModalOpened = categoryId;
		$('.displaySelectedCompensationCat').remove();
		
		// If user budget or the category is empty then show the message
		if(isEmpty(userBudgetCache) || isEmpty(userBudgetCache[categoryId])) {
			showNotification('You do not have any budgets to compensate it with!','top','center','danger');
			return;
		}
		
		// Build a category available cache
		let selectedCategoryParentCategory = categoryMap[categoryId].parentCategory;
		let dataKeySet = Object.keys(userBudgetCache);
		for(let count = 0, length = dataKeySet.length; count < length; count++) {
			let key = dataKeySet[count];
      	  	let userBudgetValue = userBudgetCache[key];
      	  
      	  	if(isEmpty(userBudgetValue) || isNotEqual(selectedCategoryParentCategory,categoryMap[key].parentCategory)) {
      	  		continue;
      	  	}
      	  	
      	  	let categoryTotalValue = categoryTotalMapCache[key];
      	  	// If the category total map is empty and if the user budget is > 0
      	  	if(isEmpty(categoryTotalValue) && userBudgetValue.planned > 0) {
      	  		userBudgetAndTotalAvailable[key] = userBudgetValue.planned;
      	  	} else if(isNotEmpty(categoryTotalValue) && userBudgetValue.planned > categoryTotalValue) {
      	  	// If the category total map is not empty and if the user budget amount is > category total
      	  		userBudgetAndTotalAvailable[key] = userBudgetValue.planned - categoryTotalValue;
      	  	}
      	  	
      	  	// Build category available select (with the same parent category)
      	  	if(!compensationDropdownMenu.firstElementChild && isNotEmpty(userBudgetAndTotalAvailable[key])) {
      	  		anchorDropdownItemFragment.appendChild(buildCategoryAvailableToCompensate(userBudgetAndTotalAvailable[key], userBudgetValue));
      	  	}
		}
		
		// If there are no user budget available to compensate then show message
		if(isEmpty(userBudgetAndTotalAvailable)) {
			showNotification('You do not have any budgets available to compensate it with!','top','center','danger');
			return;
		}
		
		
		// Get the user Budget overspending
		let userBudgetOverSpending = userBudgetCache[categoryId].planned -  categoryTotalMapCache[categoryId];
		userBudgetOverSpending = currentCurrencyPreference + formatNumber(Math.abs(userBudgetOverSpending), currentUser.locale);
		// Set the title of the modal
		categoryCompensationTitle.innerHTML = 'Compensate <strong> &nbsp' +  categoryMap[categoryId].categoryName + "'s &nbsp</strong>Overspending Of <strong> &nbsp" + userBudgetOverSpending + '&nbsp </strong> With';
		
		// Upload the anchor fragment to the modal
		compensationDropdownMenu.appendChild(anchorDropdownItemFragment);
		// Show the modal
		$('#categoryCompensationModal').modal('show');
		
	});
	
	// Build category compensation modal anchor
	function buildCategoryAvailableToCompensate(userBudgetTotalAvailable, userBudgetValue) {
		let anchorDropdownItem = document.createElement('a');
		anchorDropdownItem.classList = 'dropdown-item compensationDropdownMenu';
		anchorDropdownItem.id = 'categoryItemAvailable1-' + userBudgetValue.categoryId;
		
		let categoryLabelDiv = document.createElement('div');
		categoryLabelDiv.classList = 'compensationCatSelectionName font-weight-bold';
		categoryLabelDiv.innerText = categoryMap[userBudgetValue.categoryId].categoryName;
		anchorDropdownItem.appendChild(categoryLabelDiv);
		
		let categoryAmountAvailableDiv = document.createElement('div');
		categoryAmountAvailableDiv.classList = 'text-right small my-auto text-small-success compensationCatSelectionAmount';
		let printUserBudgetMoney = isNaN(userBudgetTotalAvailable) ? 0.00 : userBudgetTotalAvailable; 
		categoryAmountAvailableDiv.innerText = currentCurrencyPreference + formatNumber(printUserBudgetMoney, currentUser.locale);
		anchorDropdownItem.appendChild(categoryAmountAvailableDiv);
		
		return anchorDropdownItem;
	}
	
	// Category compensation remove anchors while hiding the modal 
	$('#categoryCompensationModal').on('hidden.bs.modal', function () {
		// Remove all anchors from the dropdown menu
		let compensationDropdownMenu = document.getElementById('compensationDropdownMenu-1');
		while (compensationDropdownMenu.firstElementChild) {
			compensationDropdownMenu.removeChild(compensationDropdownMenu.firstElementChild);
		}
		
		let compensationDisplay = document.getElementsByClassName('categoryChosenCompensation-1');
		// Replace the compensated category name
		compensationDisplay[0].innerText = 'Choose category';
		
	});
	
	// On click drop down of the category available to compensate
	$('.modal-footer').on('click', '.compensationDropdownMenu' , function() {
		let selectedCategoryId = lastElement(splitElement(this.id, '-'));
		let compensationDisplay = document.getElementsByClassName('categoryChosenCompensation-1');
		// Post a budget amount change to the user budget module and change to auto generated as false. 
		var values = {};
		values['autoGenerated'] = 'false';
		values['dateMeantFor'] = chosenDate;
		
		if(compensationDisplay.length == 0 || isEmpty(categoryMap[selectedCategoryId]) || isEmpty(categoryMap[categoryForModalOpened]) || isEmpty(categoryTotalMapCache[categoryForModalOpened])) {
			showNotification('There was an error while compensating the categories. Try refreshing the page!','top','center','danger');
			return;
		}
		
		// Replace the compensated category name
		compensationDisplay[0].innerText = categoryMap[selectedCategoryId].categoryName;
		
		// Fetch category And Total Remaining
		let categoryBudgetAvailable = userBudgetAndTotalAvailable[selectedCategoryId];
		// Calculate the amount necessary
		let recalculateUserBudgetOverspent = categoryTotalMapCache[categoryForModalOpened] - userBudgetCache[categoryForModalOpened].planned;
		
		// As the recalculateUserBudgetOverspent is (-amount)
		if(recalculateUserBudgetOverspent > categoryBudgetAvailable) {
				values['planned'] = userBudgetCache[categoryForModalOpened].planned + categoryBudgetAvailable;
				values['category_id'] = categoryForModalOpened;
				callBudgetAmountChange(values);
			
				values['planned'] = userBudgetCache[selectedCategoryId].planned - categoryBudgetAvailable;
				values['category_id'] = selectedCategoryId;
				callBudgetAmountChange(values);
				
				cloneAnchorToBodyAndRemoveDropdown(selectedCategoryId);
				
				// Check if there are any new dropdown elements available
				let compensationDropdownMenu = document.getElementById('compensationDropdownMenu-1');
				if(!compensationDropdownMenu.firstElementChild) {
					// Hide the modal
					$('#categoryCompensationModal').modal('hide');
					return;
				}
				
				let categoryCompensationTitle = document.getElementById('categoryCompensationTitle');
				// Set the title of the modal with the new amount necessary for compensation
				categoryCompensationTitle.innerHTML = 'Compensate <strong> &nbsp' +  categoryMap[categoryForModalOpened].categoryName + "'s &nbsp</strong>Overspending Of <strong> &nbsp" + currentCurrencyPreference + formatNumber((recalculateUserBudgetOverspent - categoryBudgetAvailable), currentUser.locale) + '&nbsp </strong> With';
				
				// Replace the compensated category name
				compensationDisplay[0].innerText = 'Choose category';
				
				
		} else if(recalculateUserBudgetOverspent <= categoryBudgetAvailable) {
				values['planned'] = categoryTotalMapCache[categoryForModalOpened];
				values['category_id'] = categoryForModalOpened;
				callBudgetAmountChange(values);
			
				values['planned'] = userBudgetCache[selectedCategoryId].planned - recalculateUserBudgetOverspent;
				values['category_id'] = selectedCategoryId;
				callBudgetAmountChange(values);
			
				// Hide the modal
				$('#categoryCompensationModal').modal('hide');
		}
		
	});
	
	// Clones the anchor dropdown to the body of the compensation budget modal 
	function cloneAnchorToBodyAndRemoveDropdown(selectedCategoryId) {
		let anchorTag = document.getElementById('categoryItemAvailable1-' + selectedCategoryId);
		let referenceBodyModal = document.getElementById('compensationModalBody');
		let anchorFragment = document.createDocumentFragment();
		// Append and remove (Move element)
		anchorFragment.appendChild(anchorTag);
		
		// Change the anchor tag
		let newAnchorTag = anchorFragment.getElementById('categoryItemAvailable1-' + selectedCategoryId);
		newAnchorTag.id = 'categoryItemSelected-' + selectedCategoryId;
		newAnchorTag.classList = 'removeAlreadyAddedCompensation';
		newAnchorTag.firstChild.classList = 'col-lg-6 text-left font-weight-bold text-nowrap';
		newAnchorTag.lastChild.classList = 'col-lg-4 text-right text-small-success text-nowrap pl-0';
		
		// Div wrapper to create rows
		let newDivWrapper = document.createElement('div');
		newDivWrapper.classList = 'row displaySelectedCompensationCat';
		newDivWrapper.appendChild(newAnchorTag.firstChild);
		newDivWrapper.appendChild(newAnchorTag.lastChild);
		
		
		// Close button wrapper
		let closeButtonWrapper = document.createElement('a');
		closeButtonWrapper.id = 'revertCompensationAnchor-' + selectedCategoryId
		closeButtonWrapper.classList = 'col-lg-2 text-center revertCompensationAnchor';
		
		// Close button
		let closeIconElement = document.createElement('i');
		closeIconElement.className = 'material-icons closeElementCompensation';
		closeIconElement.innerHTML = 'close';
		closeButtonWrapper.appendChild(closeIconElement);
		
		let materialSpinnerElement = document.createElement('div');
    	materialSpinnerElement.id= 'deleteCompensationSpinner-' + selectedCategoryId;
    	materialSpinnerElement.classList = 'material-spinner-small d-none position-absolute mx-auto top-20';
    	closeButtonWrapper.appendChild(materialSpinnerElement);
    	
		newDivWrapper.appendChild(closeButtonWrapper);
		newAnchorTag.appendChild(newDivWrapper);
		
		// Append the anchor fragment to the top of the list
		referenceBodyModal.appendChild(anchorFragment);
	}
	
	// Save Budget by changing amount
	function callBudgetAmountChange(values) {
		$.ajax({
	          type: "POST",
	          url: CUSTOM_DASHBOARD_CONSTANTS.budgetAPIUrl + CUSTOM_DASHBOARD_CONSTANTS.budgetSaveUrl + currentUser.financialPortfolioId,
	          dataType: "json",
	          contentType: "application/x-www-form-urlencoded; charset=UTF-8",
	          data : values,
	          success: function(userBudget){
	        	  // Update the cache containing user budgets
	        	  userBudgetCache[userBudget.categoryId] = userBudget;
	        	  
	        	  // Update the modal
	        	  updateProgressBarAndRemaining(userBudget.categoryId, document);
	        	  
	        	  // Update the budget amount
	        	  let budgetAmountChange = document.getElementById('budgetAmountEntered-' + userBudget.categoryId);
	        	  budgetAmountChange.innerText = currentCurrencyPreference + formatNumber(userBudget.planned, currentUser.locale);
	          },
	          error: function(thrownError) {
	        	  var responseError = JSON.parse(thrownError.responseText);
	        	  if(responseError.error.includes("Unauthorized")){
	        		  er.sessionExpiredSwal(thrownError);
	        	  } else{
	        		  showNotification('Unable to change the budget category amount at this moment. Please try again!','top','center','danger');
	        	  }
	          }
		});
	}
	
	// Click the delete budget compensated
	$('#compensationModalBody').on('click', '.revertCompensationAnchor' , function() {
		let toDeleteCategoryId = lastElement(splitElement(this.id,'-'));
		document.getElementById('deleteCompensationSpinner-' + toDeleteCategoryId).classList.toggle('d-none');
		this.firstChild.classList.toggle('d-none');
		
		if(isEmpty(categoryMap[toDeleteCategoryId]) || isEmpty(userBudgetAndTotalAvailable[toDeleteCategoryId])) {
			showNotification('Please refresh the page and try again!','top','center','danger');
			// Hide the modal
			$('#categoryCompensationModal').modal('hide');
			return;
		}
		removeCompensatedBudget(this, toDeleteCategoryId);
	});
	
	// Remove the budget compensation
	function removeCompensatedBudget(element, toDeleteCategoryId) {
		let compensationAmount = userBudgetAndTotalAvailable[toDeleteCategoryId];
		var values = {};
		values['autoGenerated'] = 'false';
		values['dateMeantFor'] = chosenDate;
		values['planned'] = userBudgetCache[toDeleteCategoryId].planned + compensationAmount;
		values['category_id'] = toDeleteCategoryId;
		$.ajax({
	          type: "POST",
	          url: CUSTOM_DASHBOARD_CONSTANTS.budgetAPIUrl + CUSTOM_DASHBOARD_CONSTANTS.budgetSaveUrl + currentUser.financialPortfolioId,
	          dataType: "json",
	          contentType: "application/x-www-form-urlencoded; charset=UTF-8",
	          data : values,
	          success: function(userBudget){
	        	  // Update the Budget Cache
	        	  userBudgetCache[userBudget.categoryId] = userBudget;
	        	  
	        	  let compensationDropdownMenu = document.getElementById('compensationDropdownMenu-1');
	      		  let anchorDropdownItemFragment = document.createDocumentFragment();
	        	  anchorDropdownItemFragment.appendChild(buildCategoryAvailableToCompensate(userBudgetAndTotalAvailable[toDeleteCategoryId], userBudget));
	        	  // Upload the anchor fragment to the dropdown
	      		  compensationDropdownMenu.appendChild(anchorDropdownItemFragment);
	      		  
	      		  // Remove the compensation Budget Added Display
	      		  let anchorCompensatedBudget = document.getElementById('categoryItemSelected-' + userBudget.categoryId);
	      		  anchorCompensatedBudget.remove();
	      		  
	      		  // Update the modal
	        	  updateProgressBarAndRemaining(userBudget.categoryId, document);
	        	  
	        	  // Update the budget amount
	        	  let budgetAmountChange = document.getElementById('budgetAmountEntered-' + userBudget.categoryId);
	        	  budgetAmountChange.innerText = currentCurrencyPreference + formatNumber(userBudget.planned, currentUser.locale);
	          },
	          error: function(thrownError) {
	        	  var responseError = JSON.parse(thrownError.responseText);
	        	  if(responseError.error.includes("Unauthorized")){
	        		  er.sessionExpiredSwal(thrownError);
	        	  } else{
	        		  showNotification('Unable to change the budget category amount at this moment. Please try again!','top','center','danger');
	        	  }
	        	  // Hide the modal
	  			  $('#categoryCompensationModal').modal('hide');
	          }
		});
		
		values['planned'] = userBudgetCache[categoryForModalOpened].planned - compensationAmount;
		values['category_id'] = categoryForModalOpened;
		$.ajax({
	          type: "POST",
	          url: CUSTOM_DASHBOARD_CONSTANTS.budgetAPIUrl + CUSTOM_DASHBOARD_CONSTANTS.budgetSaveUrl + currentUser.financialPortfolioId,
	          dataType: "json",
	          contentType: "application/x-www-form-urlencoded; charset=UTF-8",
	          data : values,
	          success: function(userBudget){
	        	// Update the Budget Cache
	        	userBudgetCache[userBudget.categoryId] = userBudget;
	        	
	        	// Get the user Budget overspending
	      		let userBudgetOverSpending = userBudgetCache[userBudget.categoryId].planned -  categoryTotalMapCache[userBudget.categoryId];
	      		userBudgetOverSpending = currentCurrencyPreference + formatNumber(Math.abs(userBudgetOverSpending), currentUser.locale);
	      		// Set the title of the modal
	      		categoryCompensationTitle.innerHTML = 'Compensate <strong> &nbsp' +  categoryMap[userBudget.categoryId].categoryName + "'s &nbsp</strong>Overspending Of <strong> &nbsp" + userBudgetOverSpending + '&nbsp </strong> With';
	      		
	      		// Update the modal
	        	updateProgressBarAndRemaining(userBudget.categoryId, document);
	        	  
	        	// Update the budget amount
	        	let budgetAmountChange = document.getElementById('budgetAmountEntered-' + userBudget.categoryId);
	        	budgetAmountChange.innerText = currentCurrencyPreference + formatNumber(userBudget.planned, currentUser.locale);
	          },
	          error: function(thrownError) {
	        	  var responseError = JSON.parse(thrownError.responseText);
	        	  if(responseError.error.includes("Unauthorized")){
	        		  er.sessionExpiredSwal(thrownError);
	        	  } else{
	        		  showNotification('Unable to change the budget category amount at this moment. Please try again!','top','center','danger');
	        	  }
	        	 // Hide the modal
	  			 $('#categoryCompensationModal').modal('hide');
	          }
		});
	    
	}
	
	/**
	 * Date Picker Module
	 */
	
	// Date Picker On click month
	$('.monthPickerMonth').click(function() {
		let budgetAmountDiv = document.getElementById('budgetAmount');
		
		// If other pages are present then return this event
		if(budgetAmountDiv == null) {
			return;
		}
		
		// Set chosen date
		er.setChosenDateWithSelected(this);
		
		// Reset the User Budget with Loader
		resetUserBudgetWithLoader();
		
		// Call the user budget
		fetchAllUserBudget();
		
	});
	
	// Reset the user budget with loader
	function resetUserBudgetWithLoader() {
		// User Budget Map Cache
		userBudgetCache = {};
		// User transaction category ID and total
		categoryTotalMapCache = {};
		// Store the budget amount edited previously to compare
		budgetAmountEditedPreviously = '';
		// store the budget chart in the cache to update later
		budgetCategoryChart = '';
		// Fetch all dates from the user budget
		datesWithUserBudgetData = [];
		// last Budgeted Month
		lastBudgetedMonthName = '';
		lastBudgetMonth = 0;
		// Category Compensation Modal Values
		userBudgetAndTotalAvailable = {};
		// Category modal user budget category id;
		categoryForModalOpened = '';
		
		// Append Empty Budget Loader
		let emptyDocumentFragment = document.createDocumentFragment();
		
		let cardDiv = document.createElement('div');
		cardDiv.classList = 'card';
		
		let cardBody = document.createElement('div');
		cardBody.classList = 'card-body';
		
		// Row 1
		let animationBudgetRowDiv = document.createElement('div');
		animationBudgetRowDiv.classList = 'row';
		
		let threePortionDiv = document.createElement('div');
		threePortionDiv.classList = 'col-lg-3';
		
		let animationBudget = document.createElement('div');
		animationBudget.classList = 'w-100 animationBudget';
		threePortionDiv.appendChild(animationBudget);
		animationBudgetRowDiv.appendChild(threePortionDiv);
		
		let remainingTextDiv = document.createElement('div');
		remainingTextDiv.classList = 'col-lg-9 text-right headingDiv justify-content-center align-self-center mild-text';
		remainingTextDiv.innerText = 'Remaining (%)';
		animationBudgetRowDiv.appendChild(remainingTextDiv);
		cardBody.appendChild(animationBudgetRowDiv);
		
		// Row 2
		let emptyRowTwo = document.createElement('div');
		emptyRowTwo.classList = 'row';
		
		let threePortionTwo = document.createElement('div');
		threePortionTwo.classList = 'col-lg-3';
		
		let animationBudgetTwo = document.createElement('div');
		animationBudgetTwo.classList = 'w-50 animationBudget';
		threePortionTwo.appendChild(animationBudgetTwo);
		emptyRowTwo.appendChild(threePortionTwo);
		
		let percentageAvailable = document.createElement('div');
		percentageAvailable.classList = 'col-lg-9 text-right percentageAvailable';
		emptyRowTwo.appendChild(percentageAvailable);
		cardBody.appendChild(emptyRowTwo);
		
		// Row 3
		let emptyRowThree = document.createElement('div');
		emptyRowThree.classList = 'row';
		
		let twelveColumnRow = document.createElement('div');
		twelveColumnRow.classList = 'col-lg-12';
		
		let progressThree = document.createElement('div');
		progressThree.classList = 'progress';

		let animationProgressThree = document.createElement('div');
		animationProgressThree.id='animationProgressBar';
		animationProgressThree.classList = 'progress-bar progress-bar-budget-striped';
		animationProgressThree.setAttribute('role', 'progressbar');
		animationProgressThree.setAttribute('aria-valuenow','0');
		animationProgressThree.setAttribute('aria-valuemin','0');
		animationProgressThree.setAttribute('aria-valuemax','100');
		progressThree.appendChild(animationProgressThree);
		twelveColumnRow.appendChild(progressThree);
		emptyRowThree.appendChild(twelveColumnRow);
		cardBody.appendChild(emptyRowThree);
		
		// Row 4
		let emptyRowFour = document.createElement('div');
		emptyRowFour.classList = 'row';
		
		let elevenColumnRow = document.createElement('div');
		elevenColumnRow.classList = 'col-lg-11';
		
		let remainingAmountMock = document.createElement('div');
		remainingAmountMock.id = 'remainingAmountMock';
		remainingAmountMock.classList = 'd-lg-inline-block animationBudget';
		elevenColumnRow.appendChild(remainingAmountMock);
		emptyRowFour.appendChild(elevenColumnRow);
		cardBody.appendChild(emptyRowFour);

		// Row 5
		let deleteBudgetPosition = document.createElement('div');
		deleteBudgetPosition.classList = 'row';
		
		let emptyElevenDiv = document.createElement('div');
		emptyElevenDiv.classList = 'col-lg-11';
		deleteBudgetPosition.appendChild(emptyElevenDiv);
		
		let oneColFive = document.createElement('div');
		oneColFive.classList = 'col-lg-1';
		
		let animationBudgetFive = document.createElement('div');
		animationBudgetFive.classList = 'w-100 animationBudget';
		oneColFive.appendChild(animationBudgetFive);
		deleteBudgetPosition.appendChild(oneColFive);
		cardBody.appendChild(deleteBudgetPosition);
		
		cardDiv.appendChild(cardBody);
		emptyDocumentFragment.appendChild(cardDiv);
		
		let budgetAmountBody = document.getElementById('budgetAmount');
		budgetAmountBody.innerHTML = '';
		budgetAmountBody.appendChild(emptyDocumentFragment);
		
		// Budget Visualization
		let chartVisualization = document.getElementById('chartBudgetVisualization');
		chartVisualization.innerHTML = '<div class="material-spinner"></div>';
	}
	
	// Update existing date picker with existing budget
	function updateExistingBudgetInDatePicker(userBudgetDate) {
		userBudgetDate = ('0' + userBudgetDate).slice(-8);
		if(popoverYear == userBudgetDate.slice(-4)) {
			let monthToAppend = Number(userBudgetDate.slice(2,4));
			document.getElementById('monthPicker-' + monthToAppend).classList.add('monthPickerMonthExists');
		}
	}
	
});