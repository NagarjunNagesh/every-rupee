
$(document).ready(function(){
	
	// Currency Preference
	const currentCurrencyPreference = document.getElementById('currentCurrencySymbol').innerText;
	
	// Fetch user budget and build the div
	fetchAllUserBudget();
	
	// Fetches all the user budget and displays them in the user budget
	function fetchAllUserBudget() {
		let budgetDivFragment = document.createDocumentFragment();
		jQuery.ajax({
			url: budgetAPIUrl + currentUser.financialPortfolioId + dateMeantFor + chosenDate,
            type: 'GET',
            success: function(data) {
            	let dataKeySet = Object.keys(data)
            	for(let count = 0, length = dataKeySet.length; count < length; count++){
	            	let key = dataKeySet[count];
	          	  	let value = data[key];
	          	  
	          	  	if(isEmpty(value)) {
	          	  		continue;
	          	  	}

	          	  	// Appends to a document fragment
	          	  	budgetDivFragment.appendChild(buildUserBudget(value));
            	}
            	
            	// paints them to the budget dashboard
          	  	document.getElementById('budgetAmount').appendChild(budgetDivFragment);
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
		card.classList = 'card';
		
		// Card Header
		let cardHeader = document.createElement('div');
		cardHeader.classList = 'card-header';
		
		// Card title with category name
		let cardTitle = document.createElement('div');
		cardTitle.classList = 'card-title';
		cardTitle.innerText = categoryObject.categoryName;
		cardHeader.appendChild(cardTitle);
		card.appendChild(cardHeader);
		
		let cardBody = document.createElement("div");
		cardBody.classList = 'card-body';
		
		// Card Row Remaining
		let cardRowRemaining = document.createElement('div');
		
		// <div id="budgetInfoLabelInModal" class="col-lg-12 text-right headingDiv justify-content-center align-self-center">Remaining (%)</div> 
		let cardRemainingText = document.createElement('div');
		cardRemainingText.classList = 'col-lg-12 text-right headingDiv justify-content-center align-self-center';
		cardRemainingText.id = 'budgetInfoLabelInModal-' + categoryObject.categoryId;
		cardRemainingText.innerText = 'Remaining (%)';
		cardRowRemaining.appendChild(cardRemainingText);
		cardBody.appendChild(cardRowRemaining);
		
		// Card Row Percentage Available
		let cardRowPercentage = document.createElement('div');
		
		// <span id="percentageAvailable" class="col-lg-12 text-right">NA</span> 
		let cardRemainingPercentage = document.createElement('div');
		cardRemainingPercentage.classList = 'col-lg-12 text-right';
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
		progressBar.classList = 'progress-bar progress-bar-success-striped';
		progressBar.setAttribute('role', 'progressbar');
		progressBar.setAttribute('aria-valuenow', '0');
		progressBar.setAttribute('aria-valuemin', '0');
		progressBar.setAttribute('aria-valuemax', '100');
		cardProgressClass.appendChild(progressBar);
		cardProgressAndRemainingAmount.appendChild(cardProgressClass);
		
		
		// Remaining Amount Div
		let remainingAmountDiv = document.createElement('span');
		remainingAmountDiv.id = 'remainingAmount';
		remainingAmountDiv.classList = 'mild-text-success';
		
		let currencyRemainingAmount = document.createElement('span');
		currencyRemainingAmount.innerText = currentCurrencyPreference + '0.00';
		remainingAmountDiv.appendChild(currencyRemainingAmount);
		cardProgressAndRemainingAmount.appendChild(remainingAmountDiv);
		cardBody.appendChild(cardProgressAndRemainingAmount);
		
		card.appendChild(cardBody);
		return card;
		
	}
	
});