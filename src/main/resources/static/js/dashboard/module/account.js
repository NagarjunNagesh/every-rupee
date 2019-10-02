
// SECURITY: Defining Immutable properties as constants
const BANK_ACCOUNT_CONSTANTS = {};
Object.defineProperties(BANK_ACCOUNT_CONSTANTS, {
	'bankAccountUrl': { value: '/api/bankaccount', writable: false, configurable: false },
	'backslash': { value: '/', writable: false, configurable: false },
	'bankAccountAddUrl' : { value: '/add', writable: false, configurable: false },
	'bankAccountPreviewUrl' : { value: '/preview', writable: false, configurable: false },
	'bankAccountSelectUrl' : { value: '/select', writable: false, configurable: false },
	'bankAccountCategorizeUrl' : { value: '/categorize', writable: false, configurable: false },
});
let unsyncSVG = unsyncSVGFc();
let syncSVG = syncSVGFc();
// Constants for reference
let bankAccountPreview = '';
// Tick Icon
let tickIconSVG = tickIcon();

// Account Information display
$(document).ready(function(){

	const accountTypeConst = ['Savings Account','Current Account','Cash','Assets','Credit Card','Liability'];
	Object.freeze(accountTypeConst);
	Object.seal(accountTypeConst);
	const accountTypeUCConst = ['SAVINGS ACCOUNT','CURRENT ACCOUNT','CASH','ASSETS','CREDIT CARD','LIABILITY'];
	Object.freeze(accountTypeUCConst);
	Object.seal(accountTypeUCConst);
	// Toggle Account Information
	document.getElementById("showAccounts").addEventListener("click",function(){
		let accountPickerClass = document.getElementById('accountPickerWrapper').classList;
		
		// If the modal is open
		if(accountPickerClass.contains('d-none')) {
			// Add click outside event listener to close the modal
			document.addEventListener('mouseup', closeShowAccountsModal, false);
		}
		// Toggle Account Picker
		accountPickerClass.toggle('d-none');
		
	});
	
	// Properly closes the accounts modal and performs show accounts actions.
	function closeShowAccountsModal(event) {
		let accountPicker = document.getElementById('accountPickerWrapper');
		let showAccountsDiv = document.getElementById('showAccounts');
		if(showAccountsDiv.contains(event.target)) {
			// Remove event listener once the function performed its task
			document.removeEventListener('mouseup', closeShowAccountsModal, false);
		} else if(!accountPicker.contains(event.target)) {
			// Remove event listener once the function performed its task
			document.removeEventListener('mouseup', closeShowAccountsModal, false);
			accountPicker.classList.toggle('d-none');
		}
		
	}
	
	// Click any drop down menu
	$(document).on('click', ".accountType", function() {
		let selectedAT = this.innerText;
		let accountTypeECL = document.getElementById('accountTypeErr').classList;
		let changeClrBtn = document.getElementsByClassName('changeBtnClr')[0].classList;
		let accCfrmBtn = document.getElementsByClassName('swal2-confirm')[0];
		let accountBalErr = document.getElementById('accountBalErr').classList;
		let accBalance = document.getElementById('accountBal').value;
		
		// Set Text
		document.getElementsByClassName('accountChosen')[0].innerText = selectedAT;
		
		// If the account Type is not in the selected
		if(!includesStr(accountTypeConst,selectedAT)) {
			accountTypeECL.remove('d-none');
			changeClrBtn.remove('btn-dynamic-color');
			changeClrBtn.add('btn-danger');
			accCfrmBtn.setAttribute('disabled','disabled');
			return;
		}
		
		// Display no error if the account type is valid
		if(!accountTypeECL.contains('d-none')) {
			accountTypeECL.add('d-none');
			changeClrBtn.remove('btn-danger');
			changeClrBtn.add('btn-dynamic-color');
		}
		
		// Enable confirm button
		if(accountTypeECL.contains('d-none') && accountBalErr.contains('d-none') && regexForFloat.test(accBalance) && includesStr(accountTypeConst,selectedAT)) {
			accCfrmBtn.removeAttribute('disabled');
		}
		
	});
	
	// Account balance check
	$(document).on('keyup', "#accountBal", function() {
		let accBlnce = this.value;
		let accountBalErr = document.getElementById('accountBalErr').classList;
		let accCfrmBtn = document.getElementsByClassName('swal2-confirm')[0];
		let accountTypeECL = document.getElementById('accountTypeErr').classList;
		
		// If regex test is not valid
		if(!regexForFloat.test(accBlnce)) {
			accountBalErr.remove('d-none');
			accCfrmBtn.setAttribute('disabled','disabled');
			return;
		} 
		
		// Display no error if the account bal is valid
		if(!accountBalErr.contains('d-none')) {
			accountBalErr.add('d-none');
		}
		
		// Enable confirm button
		if(accountTypeECL.contains('d-none') && accountBalErr.contains('d-none')  && regexForFloat.test(accBlnce)) {
			accCfrmBtn.removeAttribute('disabled');
		}
		
	});
	
	
	// Click on Add unsynced account 
	$(document).on('click', "#unsyncedAccountWrap", function() {
		// Show Sweet Alert
		Swal.fire({
	        title: 'Add Unsynced Account',
	        html: unSyncedAccount(),
	        inputAttributes: {
	            autocapitalize: 'on'
	        },
	        confirmButtonClass: 'createAccount btn btn-dynamic-color',
	        confirmButtonText: 'Create Account',
	        showCloseButton: true,
	        buttonsStyling: false
	    }).then(function(result) {
	    	// If confirm button is clicked
	    	if (result.value) {
	    		// Populate the JSON form data
		    	var values = {};
				values['linked'] = 'false';
				values['bankAccountName'] = document.getElementById('accountName').value;
				values['accountBalance'] = document.getElementById('accountBal').value;
				values['accountType'] = document.getElementsByClassName('accountChosen')[0].innerText;
				
				// Check if the account type is valid (Upper Case)
				if(!includesStr(accountTypeUCConst,values['accountType'])) {
					 showNotification('Invalid account type. Please try again!','top','center','danger');
					 return;
				}
				
				// AJAX call for adding a new unlinked Account
		    	$.ajax({
			          type: "POST",
			          url: BANK_ACCOUNT_CONSTANTS.bankAccountUrl + BANK_ACCOUNT_CONSTANTS.bankAccountAddUrl,
			          dataType: "json",
			          contentType: "application/x-www-form-urlencoded; charset=UTF-8",
			          data : values,
			          success: function(){
			        	  showNotification('Unsynced account "' + values['bankAccountName'] + '" has been created successfully','top','center','success');
			          },
			          error: function(thrownError) {
			        	  var responseError = JSON.parse(thrownError.responseText);
			        	  if(responseError.error.includes("Unauthorized")){
			        		  er.sessionExpiredSwal(thrownError);
			        	  } else{
			        		  showNotification('Unable to add the account at this moment. Please try again!','top','center','danger');
			        	  }
			          }
		    	});
	    	}
	    });
		
		// Disable confirmation button 
		let accCfrmBtn = document.getElementsByClassName('swal2-confirm')[0];
		if(!accCfrmBtn.disabled) {
			accCfrmBtn.setAttribute('disabled','disabled');
		}
	});
	
	// Click on an account to select
	$('#accountPickerWrapper').on('click', ".bARow", function() {
		let position = lastElement(splitElement(this.id,'-'));
		let currentElem = this;
		
		// Populate the JSON form data
    	var values = {};
		values['id'] = bankAccountPreview[Number(position)-1].id;
		values['selectedAccount'] = 'true';
		
		// AJAX call for adding a new unlinked Account
    	$.ajax({
	          type: "POST",
	          url: BANK_ACCOUNT_CONSTANTS.bankAccountUrl + BANK_ACCOUNT_CONSTANTS.bankAccountSelectUrl,
	          dataType: "json",
	          contentType: "application/x-www-form-urlencoded; charset=UTF-8",
	          data : values,
	          success: function(){
	        	  // Remove Selected Account
	        	  for(let i = 0, length = bankAccountPreview.length; i < length; i++) {
	        		  if(bankAccountPreview[i].id == bankAccountPreview[Number(position)-1].id) {
	        			  bankAccountPreview[i].selectedAccount = true;
	        		  }
	        	  }
	        	  
	        	  let bARows = document.getElementsByClassName('bARow');
	        	  // Remove class from list
	        	  for(let i = 0, length = bARows.length; i < length; i++) {
	        		  let rowElem = bARows[i];
	        		  if(rowElem.classList.contains('selectedBA')) {
	        			  rowElem.classList.remove('selectedBA');
	        			  bankAccountPreview[i].selectedAccount = false;
	        		  }
	        	  }
	        	  
	        	  currentElem.classList.add('selectedBA');
	        	  
	        	  // Close the account Modal
	        	  closeAccountPopup();
	          },
	          error: function(thrownError) {
	        	  var responseError = JSON.parse(thrownError.responseText);
	        	  if(responseError.error.includes("Unauthorized")){
	        		  er.sessionExpiredSwal(thrownError);
	        	  } else{
	        		  showNotification('Unable to select the account at this moment. Please try again!','top','center','danger');
	        	  }
	          }
    	});
    	
	});
	
	function closeAccountPopup() {
		
		let accountPickerWrapper = document.getElementById('accountPickerWrapper').classList;
		// Close the popup
		accountPickerWrapper.add('d-none');
		
		// Remove event listener once the function performed its task
		document.removeEventListener('mouseup', closeShowAccountsModal, false);
	}
	
	// Click Add Account button
	$('#accountPickerWrapper').on('click', ".bAFooter", function() {
		// Account Picker Wrapper
		let accountPickerModal = document.getElementById('accountPickerWrapper');
		
		// Populate add options while clicking add account
		populateEmptyAccountInfo();
		// Append Back Arrow
		let arrowFrag = document.createDocumentFragment();
		
		let arrowWrapper = document.createElement('div');
		arrowWrapper.classList = 'arrowWrapBA';
		
		let arrowIcon = document.createElement('i');
		arrowIcon.classList = 'material-icons';
		arrowIcon.innerText = 'keyboard_arrow_left';
		arrowWrapper.appendChild(arrowIcon);
		arrowFrag.appendChild(arrowWrapper);
		
		// Append to Account Element 
		accountPickerModal.appendChild(arrowFrag);
	});
	
	// Click Back Button
	$('#accountPickerWrapper').on('click', ".arrowWrapBA", function() {
		// Bank Account Preview
		er_a.populateBankInfo(bankAccountPreview);
	});
	
	// Click Know More
	$('#accountPickerWrapper').on('click', ".knowMoreAccount", function(e) {
		// Prevent refresh of link
		e.preventDefault();
		// Populate the know more
		populateKnowMore();
	});
	
	function populateKnowMore() {
		// Account Picker Wrapper
		let accountPickerModal = document.getElementById('accountPickerWrapper');
		let knowMoreFrag = document.createDocumentFragment();
		
		// Heading
		let headingWrap = document.createElement('div');
		headingWrap.classList = 'row aKMTitle';
		
		let svgElemWrapThree = document.createElement('div');
		svgElemWrapThree.classList = 'col-lg-2 vertical-center-svg px-2 account-info-color infoAO';
		
		let svgElemThree = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
		svgElemThree.setAttribute('viewBox','0 0 16 16');
		
		let pathElemThree = document.createElementNS("http://www.w3.org/2000/svg", 'path');
		pathElemThree.setAttribute('d','M0 8C0 12.4183 3.58167 16 8 16C10.1217 16 12.1566 15.1571 13.6569 13.6569C15.1571 12.1566 16 10.1217 16 8C16 3.58167 12.4183 0 8 0C3.58167 0 0 3.58167 0 8ZM1.33337 8.00012C1.33337 4.31824 4.31812 1.3335 8 1.3335C11.6819 1.3335 14.6667 4.31824 14.6667 8.00012C14.6667 11.682 11.6819 14.6669 8 14.6669C4.31812 14.6669 1.33337 11.682 1.33337 8.00012ZM9.05125 5.22826C8.71087 5.39234 8.28912 5.39234 7.94876 5.22822C7.80589 5.15933 7.67966 5.0601 7.57907 4.93824C7.29818 4.59796 7.29818 4.06879 7.57907 3.72851C7.67949 3.60685 7.80546 3.50776 7.94802 3.43888C8.28875 3.27427 8.71124 3.27422 9.05199 3.43879C9.19461 3.50767 9.32062 3.6068 9.42107 3.7285C9.70194 4.06879 9.70194 4.59796 9.42105 4.93824C9.32043 5.06012 9.19417 5.15937 9.05125 5.22826ZM8.04517 11.0911L8.97339 7.58801C9.05212 7.28699 8.98633 6.96667 8.79565 6.72095C8.60486 6.47522 8.31079 6.33203 7.99976 6.3335H7.00342C6.81946 6.33362 6.67029 6.48279 6.67029 6.66687V6.77441C6.67029 6.91077 6.7533 7.03333 6.87976 7.08398C7.20642 7.21497 7.38416 7.56897 7.29382 7.90918L6.36548 11.4124C6.28687 11.7134 6.35266 12.0337 6.54346 12.2794C6.73425 12.5251 7.02832 12.6683 7.33936 12.6669H8.33569C8.51965 12.6667 8.6687 12.5175 8.6687 12.3335V12.2258C8.6687 12.0896 8.58582 11.967 8.45935 11.9164C8.13257 11.7854 7.95483 11.4313 8.04517 11.0911Z');
		pathElemThree.setAttribute('transform','translate(0 -0.00012207)');
		svgElemThree.appendChild(pathElemThree);
		svgElemWrapThree.appendChild(svgElemThree);
		headingWrap.appendChild(svgElemWrapThree);
		
		let headingElem = document.createElement('h4');
		headingElem.classList = 'col-lg-10 accOptions text-left pb-2 mb-0';
		headingElem.innerText = 'Account Types';
		headingWrap.appendChild(headingElem);
		knowMoreFrag.appendChild(headingWrap);
		
		// Account Info Description
		let accountInfoDesc = document.createElement('div');
		accountInfoDesc.classList = 'accInfoDesc text-left small mt-3';
		accountInfoDesc.innerText = 'You will always have the option to unsync or sync the accounts at any time.';
		knowMoreFrag.appendChild(accountInfoDesc);
		
		// Table Responsive
		let tableReponsive = document.createElement('div');
		tableReponsive.classList = 'table-responsive mt-2';
		
		// Table
		let tableInfo = document.createElement('div');
		tableInfo.classList = 'table table-fixed d-lg-table';
		
		// Table Heading
		let tableHeading = document.createElement('div');
		tableHeading.classList = 'tableHeadingDiv';
		
		// First Empty HEad
		let firstTableHead = document.createElement('div');
		firstTableHead.classList = 'w-60 d-lg-table-cell';
		tableHeading.appendChild(firstTableHead);
		
		// Second Table Head
		let secTableHead = document.createElement('div');
		secTableHead.classList = 'w-20 d-lg-table-cell';
		syncSVG = cloneElementAndAppend(secTableHead, syncSVG);
		tableHeading.appendChild(secTableHead);
		
		// Third Table Head
		let thirdTableHead = document.createElement('div');
		thirdTableHead.classList = 'w-20 d-lg-table-cell';
		unsyncSVG = cloneElementAndAppend(thirdTableHead, unsyncSVG);
		tableHeading.appendChild(thirdTableHead);
		tableInfo.appendChild(tableHeading);
		
		// Table First Row
		let firstTableRow = document.createElement('div');
		firstTableRow.classList = 'd-lg-table-row';
		
		let emptyFC1 = document.createElement('div');
		emptyFC1.classList = 'd-lg-table-cell';
		firstTableRow.appendChild(emptyFC1);
		
		let titleSC1 = document.createElement('div');
		titleSC1.classList = 'd-lg-table-cell';
		titleSC1.innerText = 'Sync';
		firstTableRow.appendChild(titleSC1);
		
		let titlsTC1 = document.createElement('div');
		titlsTC1.classList = 'd-lg-table-cell';
		titlsTC1.innerText = 'Unsync';
		firstTableRow.appendChild(titlsTC1);
		tableInfo.appendChild(firstTableRow);
		
		// Table Six Row
		let SixthTableRow = document.createElement('div');
		SixthTableRow.classList = 'd-lg-table-row';
		
		let emptyFC6 = document.createElement('div');
		emptyFC6.innerText = 'Connect to your Financial Institution';
		emptyFC6.classList = 'd-lg-table-cell pt-2 text-left align-middle';
		SixthTableRow.appendChild(emptyFC6);
		
		let titleSC6 = document.createElement('div');
		titleSC6.classList = 'd-lg-table-cell pt-2 f6x3BckGrd align-middle';
		tickIconSVG = cloneElementAndAppend(titleSC6, tickIconSVG);
		SixthTableRow.appendChild(titleSC6);
		
		let titlsTC6 = document.createElement('div');
		titlsTC6.classList = 'd-lg-table-cell pt-2 f6x3BckGrd align-middle';
		titlsTC6.appendChild(xMark());
		SixthTableRow.appendChild(titlsTC6);
		tableInfo.appendChild(SixthTableRow);
		
		// Table Second Row 
		let secondTableRow = document.createElement('div');
		secondTableRow.classList = 'd-lg-table-row';
		
		let emptyFC2 = document.createElement('div');
		emptyFC2.innerText = 'Import from a file *';
		emptyFC2.classList = 'd-lg-table-cell pt-2 text-left align-middle';
		secondTableRow.appendChild(emptyFC2);
		
		let titleSC2 = document.createElement('div');
		titleSC2.classList = 'd-lg-table-cell pt-2 f6x3BckGrd align-middle';
		tickIconSVG = cloneElementAndAppend(titleSC2, tickIconSVG);
		secondTableRow.appendChild(titleSC2);
		
		let titlsTC2 = document.createElement('div');
		titlsTC2.classList = 'd-lg-table-cell pt-2 f6x3BckGrd align-middle';
		tickIconSVG = cloneElementAndAppend(titlsTC2, tickIconSVG);
		secondTableRow.appendChild(titlsTC2);
		tableInfo.appendChild(secondTableRow);
		
		// Table Third Row
		let ThirdTableRow = document.createElement('div');
		ThirdTableRow.classList = 'd-lg-table-row';
		
		let emptyFC3 = document.createElement('div');
		emptyFC3.innerText = 'Manually Enter Transactions';
		emptyFC3.classList = 'd-lg-table-cell pt-2 text-left align-middle';
		ThirdTableRow.appendChild(emptyFC3);
		
		let titleSC3 = document.createElement('div');
		titleSC3.classList = 'd-lg-table-cell pt-2 f6x3BckGrd align-middle';
		tickIconSVG = cloneElementAndAppend(titleSC3, tickIconSVG);
		ThirdTableRow.appendChild(titleSC3);
		
		let titlsTC3 = document.createElement('div');
		titlsTC3.classList = 'd-lg-table-cell pt-2 f6x3BckGrd align-middle';
		tickIconSVG = cloneElementAndAppend(titlsTC3, tickIconSVG);
		ThirdTableRow.appendChild(titlsTC3);
		tableInfo.appendChild(ThirdTableRow);
		
		// Table Fourth Row
		let FourthTableRow = document.createElement('div');
		FourthTableRow.classList = 'd-lg-table-row';
		
		let emptyFC4 = document.createElement('div');
		emptyFC4.innerText = 'International Availability *';
		emptyFC4.classList = 'd-lg-table-cell pt-2 text-left align-middle';
		FourthTableRow.appendChild(emptyFC4);
		
		let titleSC4 = document.createElement('div');
		titleSC4.classList = 'd-lg-table-cell pt-2 f6x3BckGrd align-middle';
		tickIconSVG = cloneElementAndAppend(titleSC4, tickIconSVG);
		FourthTableRow.appendChild(titleSC4);
		
		let titlsTC4 = document.createElement('div');
		titlsTC4.classList = 'd-lg-table-cell pt-2 f6x3BckGrd align-middle';
		tickIconSVG = cloneElementAndAppend(titlsTC4, tickIconSVG);
		FourthTableRow.appendChild(titlsTC4);
		tableInfo.appendChild(FourthTableRow);
		
		// Table Fifth Row
		let FifthTableRow = document.createElement('div');
		FifthTableRow.classList = 'd-lg-table-row';
		
		let emptyFC5 = document.createElement('div');
		emptyFC5.innerText = 'Mobile Apps Availability';
		emptyFC5.classList = 'd-lg-table-cell pt-2 text-left align-middle';
		FifthTableRow.appendChild(emptyFC5);
		
		let titleSC5 = document.createElement('div');
		titleSC5.classList = 'd-lg-table-cell pt-2 f6x3BckGrd align-middle';
		tickIconSVG = cloneElementAndAppend(titleSC5, tickIconSVG);
		FifthTableRow.appendChild(titleSC5);
		
		let titlsTC5 = document.createElement('div');
		titlsTC5.classList = 'd-lg-table-cell pt-2 f6x3BckGrd align-middle';
		tickIconSVG = cloneElementAndAppend(titlsTC5, tickIconSVG);
		FifthTableRow.appendChild(titlsTC5);
		tableInfo.appendChild(FifthTableRow);
		tableReponsive.appendChild(tableInfo);
		knowMoreFrag.appendChild(tableReponsive);
		
		// Append Back Arrow
		let arrowWrapper = document.createElement('div');
		arrowWrapper.classList = 'arrowWrapKM btn-round btn-sm btn btn-dynamic-color';
		arrowWrapper.innerText = 'Back';
		knowMoreFrag.appendChild(arrowWrapper);
		
		// Replace the HTML to empty and then append child
		while (accountPickerModal.firstChild) {
			accountPickerModal.removeChild(accountPickerModal.firstChild);
		}
		
		// Expand account picker and append child
		accountPickerModal.classList.add('knowMore');
		// For easing the height with transition
		if(accountPickerModal.classList.contains('heightEI')) {
			accountPickerModal.classList.remove('heightEI');
		}
		accountPickerModal.appendChild(knowMoreFrag);
	}
	
	// Back Arrow Click
	$('#accountPickerWrapper').on('click', ".arrowWrapKM", function() {
		// Account Picker Wrapper
		let accountPickerModal = document.getElementById('accountPickerWrapper');
		
		// Populate add options while clicking add account
		populateEmptyAccountInfo();
		
		// If bank account is present then display back button
		if(isNotEmpty(bankAccountPreview)) {
			// Append Back Arrow
			let arrowFrag = document.createDocumentFragment();
			
			let arrowWrapper = document.createElement('div');
			arrowWrapper.classList = 'arrowWrapBA';
			
			let arrowIcon = document.createElement('i');
			arrowIcon.classList = 'material-icons';
			arrowIcon.innerText = 'keyboard_arrow_left';
			arrowWrapper.appendChild(arrowIcon);
			arrowFrag.appendChild(arrowWrapper);
			
			// Append to Account Element 
			accountPickerModal.appendChild(arrowFrag);
		}
		
		// Remove know more if present
		if(accountPickerModal.classList.contains('knowMore')) {
			accountPickerModal.classList.remove('knowMore');
			// For easing the height with transition
			accountPickerModal.classList.add('heightEI');
		}
	});
	
	// Click View All 
	$('#accountPickerWrapper').on('click', ".manageBA", function() {
		$.ajax({
	          type: "GET",
	          url: BANK_ACCOUNT_CONSTANTS.bankAccountUrl + BANK_ACCOUNT_CONSTANTS.bankAccountCategorizeUrl,
	          dataType: "json",
	          success: function(categorizeBankAccount){
	        	  console.log(categorizeBankAccount);
	          },
	          error: function(thrownError) {
	        	  var responseError = JSON.parse(thrownError.responseText);
	        	  if(responseError.error.includes("Unauthorized")){
	        		  er.sessionExpiredSwal(thrownError);
	        	  } else{
	        		  showNotification('Unable to fetch the accounts linked with this profile. Please refresh to try again!','top','center','danger');
	        	  }
	          }
		});
	});
});

// Custom Functions to fetch all accounts
er_a = {
		fetchBankAccountInfo() {
			$.ajax({
		          type: "GET",
		          url: BANK_ACCOUNT_CONSTANTS.bankAccountUrl + BANK_ACCOUNT_CONSTANTS.bankAccountPreviewUrl,
		          dataType: "json",
		          success : function(bankAccountList) {
		        	  // Assign value to constant
		        	  bankAccountPreview = bankAccountList;
		        	  
		        	  er_a.populateBankInfo(bankAccountList);
		          },
		          error: function(thrownError) {
		        	  var responseError = JSON.parse(thrownError.responseText);
		        	  if(responseError.error.includes("Unauthorized")){
		        		  er.sessionExpiredSwal(thrownError);
		        	  } else{
		        		  showNotification('Unable to fetch the accounts linked with this profile. Please refresh to try again!','top','center','danger');
		        	  }
		          }
			});
		},
		populateBankInfo(bankAccountsInfo) {
			// Populate empty bank account info
			if(isEmpty(bankAccountsInfo)) {
				populateEmptyAccountInfo();
				return;
			}
			
			// Populate the bank account info
			populateAccountInfo(bankAccountsInfo);
		}
}

// Populate bank account info
function populateAccountInfo(bankAccountsInfo) {
	let bAFragment = document.createDocumentFragment();
	
	// Bank Account Heading
	let bAHRow = document.createElement('div');
	bAHRow.classList = 'row';
	
	let bAHeading = document.createElement('h4');
	bAHeading.classList = 'bAHeading text-left pl-3 pr-0 col-lg-7 font-weight-bold';
	bAHeading.innerText = 'Accounts';
	bAHRow.appendChild(bAHeading);
	
	let bAManage = document.createElement('a');
	bAManage.classList = 'text-right col-lg-5 pr-3 manageBA text-dynamic-color';
	bAManage.innerText = 'view all';
	bAHRow.appendChild(bAManage);
	bAFragment.appendChild(bAHRow);

	// Populate the rest of the bank account
	for(let i = 0, length = bankAccountsInfo.length; i < length; i++) {
		let count = i + 1;
		bAFragment.appendChild(populateBankAccountInfo(bankAccountsInfo[i], count));
	}
	
	// Bank Account Footer
	let bAFooter = document.createElement('button');
	bAFooter.classList = 'bAFooter btn-sm btn btn-round btn-dynamic-color';
	bAFooter.innerHTML = '<i class="material-icons pr-2">add_circle_outline</i> Add Account';
	bAFragment.appendChild(bAFooter);
	
	
	// Append the fragment to the account picker
	let accountPickerModal = document.getElementById('accountPickerWrapper');
	// Replace the HTML to empty and then append child
	while (accountPickerModal.firstChild) {
		accountPickerModal.removeChild(accountPickerModal.firstChild);
	}
	accountPickerModal.appendChild(bAFragment);
}

// Populate one Bank account info
function populateBankAccountInfo(bankAccount, count) {
	let wrapperRow = document.createElement('div');
	wrapperRow.classList = 'row bARow';
	wrapperRow.id = 'bAR-' + count;
	
	// If Selected then highlight account
	if(bankAccount.selectedAccount) {
		wrapperRow.classList.add('selectedBA');
	}
	
	// Link Icon
	let wrapperSVG = document.createElement('div');
	wrapperSVG.classList = 'col-lg-2 py-2 bAIcon';
	
	if(bankAccount.linked) {
		syncSVG = cloneElementAndAppend(wrapperSVG, syncSVG);
	} else {
		unsyncSVG = cloneElementAndAppend(wrapperSVG, unsyncSVG);
	}
	wrapperRow.appendChild(wrapperSVG);
	
	// Bank Account Name
	let bAName = document.createElement('div');
	bAName.classList = 'col-lg-5 text-left bAName py-2';
	bAName.innerText = bankAccount.bankAccountName;
	wrapperRow.appendChild(bAName);
	
	// Bank Account Balance
	let bABalance = document.createElement('div');
	bABalance.classList = 'col-lg-5 text-right font-weight-bold py-2 bAAmount';
	bABalance.innerText = currentCurrencyPreference + formatNumber(bankAccount.accountBalance, currentUser.locale);
	wrapperRow.appendChild(bABalance);
	
	return wrapperRow;
}

// Populate Empty Account Info
function populateEmptyAccountInfo() {
	let emptyAccountFragment = document.createDocumentFragment();
	
	// First Row
	let firstRow = document.createElement('div');
	firstRow.classList = 'px-3 py-3 account-box account-info-color mt-2';
	
	let svgWrapper = document.createElement('div');
	svgWrapper.classList = 'vertical-center-svg';
	
	let syncSVG = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
	syncSVG.setAttribute('width','20');
	syncSVG.setAttribute('height','20');
	syncSVG.setAttribute('viewBox','0 0 128 128');
	
	let pathElement = document.createElementNS("http://www.w3.org/2000/svg", 'path');
	pathElement.setAttribute('d','M9.2 62.8c-.1 0-.2 0-.2 0-1.7-.1-2.9-1.6-2.8-3.2.5-6.3 2-12.4 4.4-18.1.6-1.5 2.4-2.2 3.9-1.6 1.5.6 2.2 2.4 1.6 3.9-2.2 5.2-3.5 10.6-3.9 16.2C12 61.6 10.7 62.8 9.2 62.8zM117.1 40.6c-.7-1.5-2.4-2.2-4-1.5-1.5.7-2.2 2.4-1.5 4 8.7 19.8 4.5 42.5-10.8 57.8C90.9 110.6 77.9 116 64 116c-11.2 0-21.9-3.5-30.8-10.1l0 0h4.9c1.7 0 3-1.3 3-3s-1.3-3-3-3h-13c-1.7 0-3 1.3-3 3v13c0 1.7 1.3 3 3 3s3-1.3 3-3v-6.3l0 0C38.6 117.8 51.3 122 64 122c14.9 0 29.7-5.7 41-17C122.1 88 126.8 62.7 117.1 40.6zM25.2 25.2c1.1 1.1 2.9 1.2 4.1.1C38.9 16.7 51.1 12 64 12c11.2 0 21.9 3.5 30.8 10.1l0 0-4.8 0c-1.6 0-3.1 1.2-3.2 2.8-.1 1.7 1.3 3.2 3 3.2h13c1.7 0 3-1.3 3-3V12.3c0-1.6-1.2-3.1-2.8-3.2-1.7-.1-3.2 1.3-3.2 3v6.3l0 0C78 1.1 46.3 1.9 25.3 20.8 24 22 24 24 25.2 25.2L25.2 25.2zM11.5 77.69999999999999A2.9 2.9 0 1 0 11.5 83.5 2.9 2.9 0 1 0 11.5 77.69999999999999z');
	syncSVG.appendChild(pathElement);
	svgWrapper.appendChild(syncSVG);
	firstRow.appendChild(svgWrapper);
	
	let syncInfo = document.createElement('div');
	syncInfo.classList = 'font-weight-bold';
	
	let syncTitle = document.createElement('div');
	syncTitle.innerText = 'Automatically Sync Accounts';
	syncTitle.classList = 'noselect';
	syncInfo.appendChild(syncTitle);
	
	firstRow.appendChild(syncInfo);
	emptyAccountFragment.appendChild(firstRow);
	
	let separatorRow = document.createElement('div');
	separatorRow.classList="separator-text"
		
	let separatorSpan = document.createElement('span');
	separatorSpan.innerText = 'or';
	separatorRow.appendChild(separatorSpan);
	emptyAccountFragment.appendChild(separatorRow);
	
	// Second Row
	let secondRow = document.createElement('div');
	secondRow.id = 'unsyncedAccountWrap'
	secondRow.classList = 'px-3 py-3 account-box account-info-color';
	
	let svgWrapperTwo = document.createElement('div');
	svgWrapperTwo.classList = 'vertical-center-svg';
	
	let syncSVGTwo = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
	syncSVGTwo.setAttribute('width','20');
	syncSVGTwo.setAttribute('height','20');
	syncSVGTwo.setAttribute('viewBox','0 0 32 32');
	
	let gElement = document.createElementNS("http://www.w3.org/2000/svg", 'g');
	
	let pathElementTwo = document.createElementNS("http://www.w3.org/2000/svg", 'path');
	pathElementTwo.setAttribute('d','M 15.507813 2.09375 L 14.09375 3.507813 L 16.617188 6.03125 C 16.410156 6.019531 16.210938 6 16 6 C 13.609375 6 11.417969 6.867188 9.695313 8.28125 L 3.707031 2.292969 L 2.292969 3.707031 L 28.292969 29.707031 L 29.707031 28.292969 L 23.71875 22.304688 C 25.136719 20.582031 26 18.390625 26 16 C 26 14.5 25.699219 13.101563 25.097656 11.902344 L 23.597656 13.402344 C 23.898438 14.199219 24 15.101563 24 16 C 24 17.839844 23.359375 19.535156 22.300781 20.890625 L 11.109375 9.695313 C 12.464844 8.640625 14.160156 8 16 8 C 16.1875 8 16.371094 8.015625 16.558594 8.03125 L 14.09375 10.492188 L 15.507813 11.90625 L 20.414063 7 Z M 7.160156 11.347656 C 6.421875 12.738281 6 14.324219 6 16 C 6 17.5 6.300781 18.898438 6.898438 20.097656 L 8.398438 18.597656 C 8.199219 17.800781 8 16.898438 8 16 C 8 14.878906 8.234375 13.8125 8.65625 12.84375 Z M 16.199219 20.386719 L 11.585938 25 L 16.492188 29.90625 L 17.90625 28.492188 L 15.378906 25.96875 C 15.585938 25.980469 15.792969 26 16 26 C 17.675781 26 19.261719 25.578125 20.652344 24.839844 L 19.15625 23.34375 C 18.1875 23.765625 17.121094 24 16 24 C 15.8125 24 15.628906 23.988281 15.441406 23.972656 L 17.613281 21.800781 Z ');
	gElement.appendChild(pathElementTwo);
	syncSVGTwo.appendChild(gElement);
	svgWrapperTwo.appendChild(syncSVGTwo);
	secondRow.appendChild(svgWrapperTwo);
	
	let tenColTwo = document.createElement('div');
	tenColTwo.classList = 'font-weight-bold';
	
	let unsyncTitle = document.createElement('div');
	unsyncTitle.innerText = 'Unsynced Accounts';
	unsyncTitle.classList = 'noselect';
	tenColTwo.appendChild(unsyncTitle);
	
	secondRow.appendChild(tenColTwo);
	emptyAccountFragment.appendChild(secondRow);
	
	// Third Row
	let rowThree = document.createElement('div');
	rowThree.classList = 'row mx-3 mt-4';
	
	let svgElemWrapThree = document.createElement('div');
	svgElemWrapThree.classList = 'col-lg-2 vertical-center-svg pr-2 pl-2 account-info-color';
	
	let svgElemThree = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
	svgElemThree.setAttribute('viewBox','0 0 16 16');
	
	let pathElemThree = document.createElementNS("http://www.w3.org/2000/svg", 'path');
	pathElemThree.setAttribute('d','M0 8C0 12.4183 3.58167 16 8 16C10.1217 16 12.1566 15.1571 13.6569 13.6569C15.1571 12.1566 16 10.1217 16 8C16 3.58167 12.4183 0 8 0C3.58167 0 0 3.58167 0 8ZM1.33337 8.00012C1.33337 4.31824 4.31812 1.3335 8 1.3335C11.6819 1.3335 14.6667 4.31824 14.6667 8.00012C14.6667 11.682 11.6819 14.6669 8 14.6669C4.31812 14.6669 1.33337 11.682 1.33337 8.00012ZM9.05125 5.22826C8.71087 5.39234 8.28912 5.39234 7.94876 5.22822C7.80589 5.15933 7.67966 5.0601 7.57907 4.93824C7.29818 4.59796 7.29818 4.06879 7.57907 3.72851C7.67949 3.60685 7.80546 3.50776 7.94802 3.43888C8.28875 3.27427 8.71124 3.27422 9.05199 3.43879C9.19461 3.50767 9.32062 3.6068 9.42107 3.7285C9.70194 4.06879 9.70194 4.59796 9.42105 4.93824C9.32043 5.06012 9.19417 5.15937 9.05125 5.22826ZM8.04517 11.0911L8.97339 7.58801C9.05212 7.28699 8.98633 6.96667 8.79565 6.72095C8.60486 6.47522 8.31079 6.33203 7.99976 6.3335H7.00342C6.81946 6.33362 6.67029 6.48279 6.67029 6.66687V6.77441C6.67029 6.91077 6.7533 7.03333 6.87976 7.08398C7.20642 7.21497 7.38416 7.56897 7.29382 7.90918L6.36548 11.4124C6.28687 11.7134 6.35266 12.0337 6.54346 12.2794C6.73425 12.5251 7.02832 12.6683 7.33936 12.6669H8.33569C8.51965 12.6667 8.6687 12.5175 8.6687 12.3335V12.2258C8.6687 12.0896 8.58582 11.967 8.45935 11.9164C8.13257 11.7854 7.95483 11.4313 8.04517 11.0911Z');
	pathElemThree.setAttribute('transform','translate(0 -0.00012207)');
	svgElemThree.appendChild(pathElemThree);
	svgElemWrapThree.appendChild(svgElemThree);
	rowThree.appendChild(svgElemWrapThree);
	
	let colTenThree = document.createElement('div');
	colTenThree.classList = 'pl-0 col-lg-10 small';
	
	let infoTitle = document.createElement('div');
	infoTitle.innerText = 'Synced or Unsynced?';
	infoTitle.classList = 'text-left account-footer-title';
	colTenThree.appendChild(infoTitle);
	
	let infoDescription = document.createElement('div');
	infoDescription.classList = 'text-left';
	
	let knowMore = document.createElement('a');
	knowMore.href="#";
	knowMore.classList = 'knowMoreAccount account-info-color';
	knowMore.innerText = 'Know more'
	infoDescription.appendChild(knowMore);
	
	let restOfTheText = document.createElement('span');
	restOfTheText.innerText = ' to help you decide';
	infoDescription.appendChild(restOfTheText);
	
	colTenThree.appendChild(infoDescription);
	rowThree.appendChild(colTenThree);
	emptyAccountFragment.appendChild(rowThree);
	
	// Append the fragment to the account picker
	let accountPickerModal = document.getElementById('accountPickerWrapper');
	// Replace the HTML to empty and then append child
	while (accountPickerModal.firstChild) {
		accountPickerModal.removeChild(accountPickerModal.firstChild);
	}
	accountPickerModal.appendChild(emptyAccountFragment);
	
}

function unSyncedAccount() {
	let unsyncedDocumentFragment = document.createDocumentFragment();
	
	let unsyncFormWrapper = document.createElement('div');
	unsyncFormWrapper.classList = 'text-left mb-4 mt-2';
	
	// Description
	let description = document.createElement('div');
	description.classList = 'descriptionAccount';
	description.innerText = "Let's get your account started! you can always sync it later on.";
	unsyncFormWrapper.appendChild(description);
	unsyncedDocumentFragment.appendChild(unsyncFormWrapper);
	
	// Choose Type
	let chooseTypeWrapper = document.createElement('div');
	chooseTypeWrapper.classList = "chooseTypeWrapper text-left";
	
	let chooseTypeLabel = document.createElement('label');
	chooseTypeLabel.innerText = 'What is the type of your account?';
	chooseTypeWrapper.appendChild(chooseTypeLabel);
	
	
	let dropdownGroup = document.createElement('div');
	dropdownGroup.classList = 'btn-group d-md-block d-lg-block';
	
	let displaySelected = document.createElement('button');
	displaySelected.classList = 'btn btn-secondary w-85 accountChosen';
	displaySelected.setAttribute('disabled', 'disabled');
	displaySelected.innerText = 'Cash';
	dropdownGroup.appendChild(displaySelected);
	
	let dropdownTrigger = document.createElement('button');
	dropdownTrigger.classList = 'changeBtnClr btn btn-dynamic-color dropdown-toggle dropdown-toggle-split';
	dropdownTrigger.setAttribute('data-toggle' , 'dropdown');
	dropdownTrigger.setAttribute('aria-haspopup' , 'true');
	dropdownTrigger.setAttribute('aria-expanded' , 'false');
	
	let toggleSpan = document.createElement('span');
	toggleSpan.classList = 'sr-only';
	toggleSpan.innerText = 'Toggle Dropdown';
	dropdownTrigger.appendChild(toggleSpan);
	dropdownGroup.appendChild(dropdownTrigger);
	
	let dropdownMenu = document.createElement('div');
	dropdownMenu.classList = 'dropdown-menu';
	
	let dropdownContentWrap = document.createElement('div');
	dropdownContentWrap.classList = 'm-2';
	
	// Drop Down Menu
	let budgetHeading = document.createElement('label');
	budgetHeading.innerText = 'Saving';
	dropdownContentWrap.appendChild(budgetHeading);
	
	// Savings
	let savingsAnchor = document.createElement('a');
	savingsAnchor.classList = 'accountType d-block px-3 py-1 small';
	savingsAnchor.innerText = 'Savings Account';
	dropdownContentWrap.appendChild(savingsAnchor);
	
	// Current
	let currentAnchor = document.createElement('a');
	currentAnchor.classList = 'accountType d-block px-3 py-1 small';
	currentAnchor.innerText = 'Current Account';
	dropdownContentWrap.appendChild(currentAnchor);
	
	// Cash
	let cashAnchor = document.createElement('a');
	cashAnchor.classList = 'accountType d-block px-3 py-1 small';
	cashAnchor.innerText = 'Cash';
	dropdownContentWrap.appendChild(cashAnchor);
	
	// Assets
	let assetsAnchor = document.createElement('a');
	assetsAnchor.classList = 'accountType d-block px-3 py-1 small';
	assetsAnchor.innerText = 'Assets';
	dropdownContentWrap.appendChild(assetsAnchor);
	
	// Drop Down Menu 2
	let debtHeading = document.createElement('label');
	debtHeading.innerText = 'Borrowing';
	debtHeading.classList = 'mt-2';
	dropdownContentWrap.appendChild(debtHeading);
	
	// Credit card
	let creditCardAnchor = document.createElement('a');
	creditCardAnchor.classList = 'accountType d-block px-3 py-1 small';
	creditCardAnchor.innerText = 'Credit Card';
	dropdownContentWrap.appendChild(creditCardAnchor);
	
	// Liability
	let liabilityAnchor = document.createElement('a');
	liabilityAnchor.classList = 'accountType d-block px-3 py-1 small';
	liabilityAnchor.innerText = 'Liability';
	dropdownContentWrap.appendChild(liabilityAnchor);
	dropdownMenu.appendChild(dropdownContentWrap);
	dropdownGroup.appendChild(dropdownMenu);
	chooseTypeWrapper.appendChild(dropdownGroup);
	unsyncedDocumentFragment.appendChild(chooseTypeWrapper);
	
	// Error Div for account type
	let accountTypeError = document.createElement('div');
	accountTypeError.id = 'accountTypeErr';
	accountTypeError.classList = 'd-none text-danger text-left small mb-2 noselect';
	accountTypeError.innerText = 'Account type is not valid';
	unsyncedDocumentFragment.appendChild(accountTypeError);
	
	// Name Of account
	let accountNameWrapper = document.createElement('div');
	accountNameWrapper.setAttribute('data-gramm_editor',"false");
	accountNameWrapper.classList = 'accountNameWrapper text-left';
	
	let accountNameLabel = document.createElement('label');
	accountNameLabel.innerText = 'Give it a name';
	accountNameWrapper.appendChild(accountNameLabel);
	
	let accountNameInput = document.createElement('input');
	accountNameInput.id='accountName';
	accountNameInput.setAttribute('type','text');
	accountNameInput.setAttribute('autocapitalize','off');
	accountNameInput.setAttribute('spellcheck','false');
	accountNameInput.setAttribute('autocorrect','off');
	accountNameInput.setAttribute('autocorrect','off');
	accountNameWrapper.appendChild(accountNameInput);
	unsyncedDocumentFragment.appendChild(accountNameWrapper);
	
	// Account Balance
	let accountBalWrapper = document.createElement('div');
	accountBalWrapper.classList = 'accountBalWrapper text-left';
	
	
	let accountBalLabel = document.createElement('label');
	accountBalLabel.innerText = 'What is your account balance?';
	accountBalWrapper.appendChild(accountBalLabel);
	
	let accountBalInput = document.createElement('input');
	accountBalInput.id='accountBal';
	accountBalInput.setAttribute('type','text');
	accountBalInput.setAttribute('autocapitalize','off');
	accountBalInput.setAttribute('spellcheck','false');
	accountBalInput.setAttribute('autocorrect','off');
	accountBalInput.setAttribute('autocorrect','off');
	accountBalWrapper.appendChild(accountBalInput);
	unsyncedDocumentFragment.appendChild(accountBalWrapper);
	
	// Error Div for account bal
	let accountBalErr = document.createElement('div');
	accountBalErr.id = 'accountBalErr';
	accountBalErr.classList = 'd-none text-danger text-left small mb-2 noselect';
	accountBalErr.innerText = 'Account balance can contain only numbers and dot.';
	unsyncedDocumentFragment.appendChild(accountBalErr);
	
    return unsyncedDocumentFragment;
}

// Build an SVG for SYNC image
function syncSVGFc() {
	let syncSVG = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
	syncSVG.setAttribute('width','20');
	syncSVG.setAttribute('height','20');
	syncSVG.setAttribute('viewBox','0 0 128 128');
	
	let pathElement = document.createElementNS("http://www.w3.org/2000/svg", 'path');
	pathElement.setAttribute('d','M9.2 62.8c-.1 0-.2 0-.2 0-1.7-.1-2.9-1.6-2.8-3.2.5-6.3 2-12.4 4.4-18.1.6-1.5 2.4-2.2 3.9-1.6 1.5.6 2.2 2.4 1.6 3.9-2.2 5.2-3.5 10.6-3.9 16.2C12 61.6 10.7 62.8 9.2 62.8zM117.1 40.6c-.7-1.5-2.4-2.2-4-1.5-1.5.7-2.2 2.4-1.5 4 8.7 19.8 4.5 42.5-10.8 57.8C90.9 110.6 77.9 116 64 116c-11.2 0-21.9-3.5-30.8-10.1l0 0h4.9c1.7 0 3-1.3 3-3s-1.3-3-3-3h-13c-1.7 0-3 1.3-3 3v13c0 1.7 1.3 3 3 3s3-1.3 3-3v-6.3l0 0C38.6 117.8 51.3 122 64 122c14.9 0 29.7-5.7 41-17C122.1 88 126.8 62.7 117.1 40.6zM25.2 25.2c1.1 1.1 2.9 1.2 4.1.1C38.9 16.7 51.1 12 64 12c11.2 0 21.9 3.5 30.8 10.1l0 0-4.8 0c-1.6 0-3.1 1.2-3.2 2.8-.1 1.7 1.3 3.2 3 3.2h13c1.7 0 3-1.3 3-3V12.3c0-1.6-1.2-3.1-2.8-3.2-1.7-.1-3.2 1.3-3.2 3v6.3l0 0C78 1.1 46.3 1.9 25.3 20.8 24 22 24 24 25.2 25.2L25.2 25.2zM11.5 77.69999999999999A2.9 2.9 0 1 0 11.5 83.5 2.9 2.9 0 1 0 11.5 77.69999999999999z');
	syncSVG.appendChild(pathElement);
	
	return syncSVG;
}

// Builds an SVG for unsync image
function unsyncSVGFc() {
	let syncSVGTwo = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
	syncSVGTwo.setAttribute('width','20');
	syncSVGTwo.setAttribute('height','20');
	syncSVGTwo.setAttribute('viewBox','0 0 32 32');
	
	let gElement = document.createElementNS("http://www.w3.org/2000/svg", 'g');
	
	let pathElementTwo = document.createElementNS("http://www.w3.org/2000/svg", 'path');
	pathElementTwo.setAttribute('d','M 15.507813 2.09375 L 14.09375 3.507813 L 16.617188 6.03125 C 16.410156 6.019531 16.210938 6 16 6 C 13.609375 6 11.417969 6.867188 9.695313 8.28125 L 3.707031 2.292969 L 2.292969 3.707031 L 28.292969 29.707031 L 29.707031 28.292969 L 23.71875 22.304688 C 25.136719 20.582031 26 18.390625 26 16 C 26 14.5 25.699219 13.101563 25.097656 11.902344 L 23.597656 13.402344 C 23.898438 14.199219 24 15.101563 24 16 C 24 17.839844 23.359375 19.535156 22.300781 20.890625 L 11.109375 9.695313 C 12.464844 8.640625 14.160156 8 16 8 C 16.1875 8 16.371094 8.015625 16.558594 8.03125 L 14.09375 10.492188 L 15.507813 11.90625 L 20.414063 7 Z M 7.160156 11.347656 C 6.421875 12.738281 6 14.324219 6 16 C 6 17.5 6.300781 18.898438 6.898438 20.097656 L 8.398438 18.597656 C 8.199219 17.800781 8 16.898438 8 16 C 8 14.878906 8.234375 13.8125 8.65625 12.84375 Z M 16.199219 20.386719 L 11.585938 25 L 16.492188 29.90625 L 17.90625 28.492188 L 15.378906 25.96875 C 15.585938 25.980469 15.792969 26 16 26 C 17.675781 26 19.261719 25.578125 20.652344 24.839844 L 19.15625 23.34375 C 18.1875 23.765625 17.121094 24 16 24 C 15.8125 24 15.628906 23.988281 15.441406 23.972656 L 17.613281 21.800781 Z ');
	gElement.appendChild(pathElementTwo);
	syncSVGTwo.appendChild(gElement);
	
	return syncSVGTwo;
}

// Build a tick icon
function tickIcon() {
	let syncSVG = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
	syncSVG.setAttribute('x','0px');
	syncSVG.setAttribute('y','0px');
	syncSVG.setAttribute('width','20');
	syncSVG.setAttribute('height','20');
	syncSVG.setAttribute('viewBox','0 0 512 512');
	syncSVG.setAttribute('class', 'tickOuterLayer');
	
	let pathElement = document.createElementNS("http://www.w3.org/2000/svg", 'path');
	pathElement.setAttribute('class','tickPath1');
	pathElement.setAttribute('d','M424.3,180c-1-1.2-1.5-2.8-1.5-4.3c-14.8-26.1-15.7-58-30.5-84.1c-41.7,23.4-70.2,65.1-97.4,103.1c-16.4,22.9-31.1,46.4-44.6,71.1c-13.6,24.8-26.8,49.9-42,73.8c-2.2,3.4-7.9,5-10.3,0.7c-7.2-13.3-15.3-26.2-24.6-38.2c-8-10.3-17.1-19.5-25.3-29.6c-12.7-15.7-26.3-34.5-43.9-45.4c-6.4,21-13.9,41.8-17.2,63.6c24.6,15.9,43.4,38.9,61.5,61.6c21.2,26.6,43.1,52,66.9,76.3c15.4-20.1,26-43.5,38.8-65.3c15.1-25.7,32.7-49.4,51.4-72.6c18.7-23.2,40.3-43.7,62-63.9c10.2-9.5,22.2-17.3,33.1-26c8.2-6.6,16.2-13.4,23.7-20.7C424.4,180.2,424.4,180.1,424.3,180z');
	syncSVG.appendChild(pathElement);
	
	let pathElement1 = document.createElementNS("http://www.w3.org/2000/svg", 'path');
	pathElement1.setAttribute('d','M436.2,170.3h-2.8c-16.3-27.7-16.2-62.6-34-89.9c-1.9-3-5.4-3.1-8.3-1.6c-45.6,23.1-76.2,67.7-105.2,108.1c-16.6,23.2-31.6,47-45.4,72c-12.3,22.3-24.1,44.8-37.4,66.6c-6-10.4-12.6-20.4-19.9-29.9c-8.2-10.8-17.8-20.3-26.3-30.8c-15.2-18.7-31.4-40.9-53.7-51.5c-3.7-1.8-7.4,0.5-8.5,4.2c-6.8,23.7-15.8,47-19.5,71.4c0,0.1,0,0.2,0,0.4c-2,2.7-2.2,7.1,1.6,9.4c26.5,15.6,46,40.8,64.9,64.6c22,27.7,45.2,54.1,70.2,79.1c2.3,2.3,6.4,1.8,8.4-0.5c17.2-20.6,28.7-45,41.8-68.2c14.7-25.9,32-50.3,51.1-73.2c19.2-22.9,40-43.7,61.9-64c10.4-9.7,22.6-17.7,33.8-26.6c9-7.2,17.7-14.7,25.9-22.8c2.3-0.5,4.2-2.1,4.6-4.7c0.6-0.6,1.2-1.3,1.8-1.9C445,176.1,441.2,170.3,436.2,170.3z M400.7,201c-10.9,8.7-22.8,16.5-33.1,26c-21.8,20.2-43.4,40.7-62,63.9c-18.7,23.2-36.3,46.8-51.4,72.6c-12.8,21.8-23.4,45.2-38.8,65.3c-23.8-24.2-45.8-49.7-66.9-76.3c-18.1-22.7-37-45.8-61.5-61.6c3.3-21.8,10.8-42.6,17.2-63.6c17.7,10.9,31.2,29.7,43.9,45.4c8.2,10.1,17.3,19.3,25.3,29.6c9.3,12,17.4,24.9,24.6,38.2c2.4,4.4,8.1,2.7,10.3-0.7c15.3-23.9,28.4-49,42-73.8c13.5-24.7,28.2-48.2,44.6-71.1c27.2-38,55.8-79.8,97.4-103.1c14.8,26.1,15.7,58,30.5,84.1c0,1.5,0.5,3.1,1.5,4.3c0,0.1,0.1,0.2,0.1,0.2C416.9,187.6,408.9,194.4,400.7,201z');
	syncSVG.appendChild(pathElement1);
	
	return syncSVG;
}

function xMark() {
	let syncSVGTwo = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
	syncSVGTwo.setAttribute('x','0px');
	syncSVGTwo.setAttribute('y','0px');
	syncSVGTwo.setAttribute('width','15');
	syncSVGTwo.setAttribute('height','15');
	syncSVGTwo.setAttribute('viewBox','0 0 50 50');
	
	let pathElementTwo = document.createElementNS("http://www.w3.org/2000/svg", 'path');
	pathElementTwo.setAttribute('class', 'xWithRed');
	pathElementTwo.setAttribute('d','M31.202,25l13.63-20.445c0.204-0.307,0.224-0.701,0.05-1.026S44.369,3,44,3h-7.34c-0.327,0-0.634,0.16-0.821,0.429L25,19 L14.16,3.429C13.973,3.16,13.667,3,13.34,3H6C5.631,3,5.292,3.203,5.118,3.528s-0.154,0.72,0.05,1.026L18.798,25L5.168,45.445 c-0.204,0.307-0.224,0.701-0.05,1.026S5.631,47,6,47h7.34c0.327,0,0.634-0.16,0.821-0.429L25,31l10.84,15.571 C36.027,46.84,36.333,47,36.66,47H44c0.369,0,0.708-0.203,0.882-0.528s0.154-0.72-0.05-1.026L31.202,25z');
	syncSVGTwo.appendChild(pathElementTwo);
	
	return syncSVGTwo;
}