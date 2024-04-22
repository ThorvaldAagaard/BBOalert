BBOalert, 2024-04-23 Play with BEN
Import, https://github.com/stanmaz/BBOalert/blob/master/Scripts/test/PlayWithBEN_bboalert.js
Option, Robot bidding
//Script,onDummyCardsDisplayed
console.log(Date.now() + " onDummyCardsDisplayedYY " + dummyCardsDisplayed);
if (deal["played"] && deal["played"].length > 4) {
	// Ignore the display of dummy
} else {
	dummyCardsDisplayed = dummyCardsDisplayed.split(",").join("")
	if (dummyCardsDisplayed.length == 26) {
		deal["dummy"] = formatCardsDisplayed(dummyCardsDisplayed)
		if (deal["dummy"] == deal["hand"]) {
			console.log(Date.now() + " BBO moved me to the declarer position");
			deal["hand"] = formatCards(getDeclarerCards())
			deal["seat"] = getDeclarerDirection()
			console.log(deal)
		}
		savedeal(dealnumber, deal)
	} else {
		if (deal["dummy"]="") {
			alert("Try to construct dummys hand")
			dummycard = getPlayedCards()[1]
			deal["dummy"] = formatCardsDisplayed(dummyCardsDisplayed + dummycard)
			savedeal(dealnumber, deal)
		}
	}
}
//Script,onMyCardsDisplayed
console.log(Date.now() + " onMyCardsDisplayedYY " + myCardsDisplayed);
if (deal["played"] && deal["played"].length > 4) {
	// Ignore the display of your cards
} else {
	if (myCardsDisplayed.length == 26) {
		deal["hand"] = formatCardsDisplayed(myCardsDisplayed)
		savedeal(dealnumber, deal)
	}
}
//Script,onNewDeal 
removeAds(true);
newdeal = true
//Script,onDealEnd 
dealnumber = getDealNumber()
removedeal(dealnumber)
console.log("onDealEnd - Deal removed")
newdeal = true;

//Script,onAuctionEnd
if (tableType() == "no") {
	dealnumber = getDealNumber()
	removedeal(dealnumber)
	console.log("onAuctionEnd - Deal removed")
	newdeal = true
}
//Script,onBeforePlayingCard
console.log(getNow(true) + " onMyBeforePlayingCard " + getPlayedCards() + " turn " + whosTurn());

//Script,onMyTurnToBid
var ctx = getContext()
console.log(getNow(true) + " onMyTurnToBidBEN");
if ((ctx.length >= 8) && (ctx.endsWith('------'))) {
	console.log(Date.now() + " onMyTurnToBid called after bidding ended " + ctx);	
} else {
	// Give BBO time to get stuff in place
	setTimeout(function () {
		BENsTurnToBid(deal);
	}, 2000)
}

//Script,onMyTurnToPlay 
console.log(getNow(true) + " onMyTurnToPlayBEN");
if (deal["played"] && deal["played"].length > 103) {
	// Ignore the event play is over
	console.log(Date.now() + " onMyTurnToPlay called after play ended ");	
} else {
	setTimeout(function () {
		BENsTurnToPlay();
	}, 1000)
}
//Script,onNewPlayedCard 
// This event calls onMyTurnToPlay, so make no change here
if (!isMyTurnToPlay()) {
	deal["played"] = updatePlayedCards(deal["played"])
	savedeal(dealnumber, deal)
}

//Script

//Script,onDataLoad

cardExists = function (card, array) {
	return array.some(function (existingCard) {
		// Assuming cards are objects with unique identifiers like 'id'
		return existingCard === card
	});
}
newdeal = true
deal = {}
getSuit = function (txt) {
	let t = txt;
	switch (t) {
		case 'C':
		case '♣':
		case '♧':
			return 3; // Clubs
		case 'D':
		case '♦':
		case '♢':
			return 2; // Diamonds
		case 'H':
		case '♥':
		case '♡':
			return 1; // Hearts
		case 'S':
		case '♠':
		case '♤':
			return 0; // Spades
		default:
			return -1; // Unknown symbol
	}
}

getSuitPlayed = function (txt) {
	let t = txt;
	switch (t) {
		case 'C':
		case '♣':
		case '♧':
			return 'C'; // Clubs
		case 'D':
		case '♦':
		case '♢':
			return 'D'; // Diamonds
		case 'H':
		case '♥':
		case '♡':
			return 'H'; // Hearts
		case 'S':
		case '♠':
		case '♤':
			return 'S'; // Spades
		default:
			return -1; // Unknown symbol
	}
}

formatCards = function (cards) {
	let suits = ["", "", "", ""];
	for (c of cards) {
		let suit = getSuit(c[c.length - 1])
		if (suit != -1) {
			suits[suit] = c[0].replace("1", "T") + suits[suit];
		}
	}
	let hand = suits.join(".");
	return hand;
}

formatCardsPlayed = function (cards) {
	let played = cards.join("");
	return played;
}

formatCardsDisplayed = function (cards) {
	let played = "";
	let suits = ["", "", "", ""];
	// Loop over the string in steps of 2 characters
	for (let i = 0; i < cards.length; i += 2) {
		let card = cards.substring(i, i + 2); // Get a pair of characters from the string
		let suit = getSuit(card.charAt(1)); // Get the suit from the second character
		if (suit != -1) {
			suits[suit] = card[0].replace("1", "T") + suits[suit];
		}
	}
	played = suits.join(".")
	return played;
}

removeAds = function (on) {
	if (on) {
		$("#bbo_ad1", BBOcontext()).hide();
		$("#bbo_ad2", BBOcontext()).hide();
		$("#bbo_app", BBOcontext()).css("left", "0px");
		$("#bbo_app", BBOcontext()).css("right", "0px");
		$("#bbo_app", BBOcontext()).css("width", "");
		console.log(Date.now() + " Adds removed");
	}
};

removeAds(true);

updatePlayedCards = function (recordedPlays) {
	let cards = getPlayedCards()

	for (let i = 0; i < cards.length; i += 2) {
		let card = cards.substring(i, i + 2); // Get a pair of characters from the string
		let suit = getSuitPlayed(card.charAt(1)); // Get the suit from the second character
		if (suit != -1) {
			var played = suit + card.charAt(0).replace("1", "T"); // Append the suit and rank to the result
			if (!cardExists(played, recordedPlays)) {
				recordedPlays.push(played);
			}
		}
	}
	return recordedPlays;
}

triggerMouseEvent = function (node, eventType) {
	let clickEvent = document.createEvent('MouseEvents');
	clickEvent.initEvent(eventType, true, true);
	node.dispatchEvent(clickEvent);
}

makePlay = function(cv) {
    var card = getCardByValue(cv);
    if (card != null) {
		triggerMouseEvent(card, 'mouseover');
		triggerMouseEvent(card, 'mousedown');
		triggerMouseEvent(card, 'mouseup');
		//card.click();
	}
}

// Check if this should be changed to SelectBid
makeBid = function (bid, artificial, explain) {
	let elBiddingBox = parent.document.querySelector('.biddingBoxClass');
	if (elBiddingBox != null) {
		let elBiddingButtons = elBiddingBox.querySelectorAll('.biddingBoxButtonClass');
		let alertField = elBiddingBox.querySelector('.mat-form-field-infix').querySelector('input');
		alertField.value = unescape(explain);
		let eventInput = new Event('input');
		alertField.dispatchEvent(eventInput);
		if (elBiddingButtons != null) {
			if (elBiddingBox.style.display != 'none') {
				if (artificial == 1) elBiddingButtons[15].click();
				if (bid == 'PASS') triggerMouseEvent(elBiddingButtons[12], 'mousedown');
				if (bid == 'PASS') elBiddingButtons[12].click();
				if (bid == 'P') triggerMouseEvent(elBiddingButtons[12], 'mousedown');
				if (bid == 'P') elBiddingButtons[12].click();
				if (bid == 'X') triggerMouseEvent(elBiddingButtons[13], 'mousedown');
				if (bid == 'X') elBiddingButtons[13].click();
				if (bid == 'XX') triggerMouseEvent(elBiddingButtons[14], 'mousedown');
				if (bid == 'XX') elBiddingButtons[14].click();
				if (bid[0] == '1') elBiddingButtons[0].click();
				if (bid[0] == '2') elBiddingButtons[1].click();
				if (bid[0] == '3') elBiddingButtons[2].click();
				if (bid[0] == '4') elBiddingButtons[3].click();
				if (bid[0] == '5') elBiddingButtons[4].click();
				if (bid[0] == '6') elBiddingButtons[5].click();
				if (bid[0] == '7') elBiddingButtons[6].click();
				if (bid[1] == 'C') triggerMouseEvent(elBiddingButtons[7], 'mousedown');
				if (bid[1] == 'C') elBiddingButtons[7].click();
				if (bid[1] == 'D') triggerMouseEvent(elBiddingButtons[8], 'mousedown');
				if (bid[1] == 'D') elBiddingButtons[8].click();
				if (bid[1] == 'H') triggerMouseEvent(elBiddingButtons[9], 'mousedown');
				if (bid[1] == 'H') elBiddingButtons[9].click();
				if (bid[1] == 'S') triggerMouseEvent(elBiddingButtons[10], 'mousedown');
				if (bid[1] == 'S') elBiddingButtons[10].click();
				if (bid[1] == 'N') triggerMouseEvent(elBiddingButtons[11], 'mousedown');
				if (bid[1] == 'N') elBiddingButtons[11].click();
			}
		}
	};
}

addSpinner = function () {
	// Create the spinner element
	const spinner = parent.document.createElement('div');
	spinner.classList.add('spinner');
	spinner.style.width = '50px';
	spinner.style.height = '50px';
	spinner.style.border = '5px solid #f3f3f3';
	spinner.style.borderRadius = '50%';
	spinner.style.borderTop = '5px solid #3498db';
	spinner.style.animation = 'loader 1s linear infinite';

	// Create the overlay element
	const overlay = parent.document.createElement('div');
	overlay.classList.add('overlay');
	overlay.style.position = 'fixed';
	overlay.style.top = '50%'; // Adjust top position to center vertically
	overlay.style.left = '50%'; // Adjust left position to center horizontally
	overlay.style.transform = 'translate(-50%, -50%)'; // Center the overlay
	overlay.style.width = '160px'; // Adjust the width of the overlay
	overlay.style.height = '160px'; // Adjust the height of the overlay
	overlay.style.backgroundColor = 'rgba(0, 0, 0, 0)'; // Adjust the transparency
	overlay.style.zIndex = '9999';
	overlay.style.display = 'flex';
	overlay.style.justifyContent = 'center';
	overlay.style.alignItems = 'center';
	// Append the spinner to the overlay
	overlay.appendChild(spinner);

	// Append the overlay to the document body
	parent.document.body.appendChild(overlay);
	console.log("adding spinner")
	return overlay
}

removeSpinner = function (overlay) {
	if (overlay) {
		parent.document.body.removeChild(overlay);
		console.log("removing spinner")
		overlay = null;
	}
	return overlay;
}

BENsTurnToBid = function () {
	var overlay = addSpinner()
	if (newdeal) {
		initdeal()		
	}
	try {

		// Due to timing we don't have the hand, so we try to get it again
		if (!deal["hand"]  || deal["hand"].length < 13) {
			console.log(Date.now() + " Updated hand due to timing" + deal["hand"] + " " + myCardsDisplayed)
			if (getMyCards().length > 26) {
				alert("Hand is too big, something is wrong")
			}
			deal["hand"] = formatCards(getMyCards())
		}

		var ctx = getContext()
		deal["ctx"] = ctx
		var user = deal["user"]
		var dealer = deal["dealer"]
		var seat = deal["seat"]
		var vul = deal["vul"]
		hand = deal["hand"]
		var url = "https://remote.aalborgdata.dk/bid?user=" + user + "&dealer=" + dealer + "&seat=" + seat + "&vul=" + vul + "&ctx=" + ctx + "&hand=" + hand
		console.log("onMyTurnToBidXX Requesting " + url)
		try {
			fetch(url, {
				cache: "no-store"
			})
				.then(function (response) {
					console.log("onMyTurnToBidXX Response from " + url)
					// Check if the response is successful
					if (!response.ok) {
						overlay = removeSpinner(overlay);
						// Log the response status and status text
						console.error('Response not OK:', response.status, response.statusText);

						// Parse the response body as JSON and handle the error
						return response.json().then(function (errorResponse) {
							// Extract the error message from the JSON response
							const errorMessage = errorResponse.error || 'Unknown error occurred';

							// Show the error message to the user
							alert(errorMessage);
							throw new Error(errorMessage); // Throw an error to skip to the catch block
						});
					}

					// If response is OK, parse the response as JSON
					return response.json();
				})
				.then(function (data) {
					// Proceed with the logic if the response was successful
					console.log(" onMyTurnToBid BEN would like to bid:",data.bid)
					makeBid(data.bid, 0, "");
					overlay = removeSpinner(overlay);
				})
				.catch(function (error) {
					overlay = removeSpinner(overlay);
					// Catch any errors that occurred during the fetch or processing
					console.error('Error occurred:', error.message);
				});
		} catch (error) {
			// Handle any errors that occur during the fetch request
			alert('Error fetching data:', error.message);
			// Show an error message to the user or perform other error handling actions
			overlay = removeSpinner(overlay);
		}
		// Before bid update and save deal - BBO seems to forget the bid if we leave after the bid / play
		savedeal(dealnumber, deal)
	} catch (error) {
		overlay = removeSpinner(overlay);
	}
}

BENsTurnToPlay = function () {
	var overlay = addSpinner();
	if (newdeal) {
		initdeal()
	}
	try {
		// if (myCardsDisplayed.length == 26) {
		// 	console.log(Date.now() + " Updated hand with myCardsDisplayed " + myCardsDisplayed + " " + deal["hand"])
		// 	deal["hand"] = formatCardsDisplayed(myCardsDisplayed)
		// }

		// Due to timing we don't have the hand, so we try to get it again
		if (!deal["hand"]  ||  deal["hand"].length < 13) {
			console.log(Date.now() + " Updated hand due to timing" + deal["hand"] + " " + myCardsDisplayed)
			if (getMyCards().length > 26) {
				alert("Hand is too big, something is wrong")
			}
			deal["hand"] = formatCards(getMyCards())
		}

		if (getDummyCards().length == 13) {
			deal["dummy"] = formatCards(getDummyCards())
			// We update both hand as BBO might rotate the deal
			if (deal["dummy"] == deal["hand"]) {
				console.log(Date.now() + " same hand for dummy and hand")
				deal["hand"] = formatCards(getDeclarerCards())
				deal["seat"] = getDeclarerDirection()
				console.log(deal)
			}
		}
		
		deal["played"] = updatePlayedCards(deal["played"])
		
		hand = deal["hand"]
		var ctx = getContext()
		deal["ctx"] = ctx
		var user = deal["user"]
		var dealer = deal["dealer"]
		var seat = deal["seat"]
		var vul = deal["vul"]
		if (deal["played"].length == 52) {
			console.log("onMyTurnToPlayXX called, but Board is finished");
			overlay = removeSpinner(overlay);
			return
		}
		if (deal["played"].length == 0) {
			var url = "https://remote.aalborgdata.dk/lead?user=" + user + "&dealer=" + dealer + "&seat=" + seat + "&vul=" + vul + "&ctx=" + ctx + "&hand=" + hand;
		
		} else {
			var dummyhand = deal["dummy"]
			var playedCardsXX = formatCardsPlayed(deal["played"])
			if (dummyhand == "") {
				alert("No dummy")
				var dummyhand = deal["dummy"]
			}
			var url = "https://remote.aalborgdata.dk/play?user=" + user + "&dealer=" + dealer + "&seat=" + seat + "&vul=" + vul + "&ctx=" + ctx + "&hand=" + hand +
				"&dummy=" + dummyhand + "&played=" + playedCardsXX;
		}
		var tournamentType = getTournamentType()
		if (tournamentType != "") {
			url += "&tournament=" + tournamentType
		}
		console.log("onMyTurnToPlayXX Requesting " + url)
		try {
			fetch(url, {
				cache: "no-store"
			})
				.then(function (response) {
					console.log("onMyTurnToPlayXX Response from " + url)
					// Check if the response is successful
					if (!response.ok) {
						overlay = removeSpinner(overlay);
						// Log the response status and status text
						console.error('Response not OK:', response.status, response.statusText);
		
						// Parse the response body as JSON and handle the error
						return response.json().then(function (errorResponse) {
							// Extract the error message from the JSON response
							const errorMessage = errorResponse.error || 'Unknown error occurred';
		
							// Show the error message to the user
							alert(errorMessage);
							throw new Error(errorMessage); // Throw an error to skip to the catch block
						});
					}
		
					// If response is OK, parse the response as JSON
					return response.json();
				})
				.then(function (data) {
					// Proceed with the logic if the response was successful
					console.log(" onMyTurnToPlay BEN would like to play:",data.card)
					makePlay(data.card[1].replace("T", "10") + data.card[0])
					overlay = removeSpinner(overlay);
				})
				.catch(function (error) {
					overlay = removeSpinner(overlay);
					// Catch any errors that occurred during the fetch or processing
					console.error('Error occurred:', error.message);
				});
		
		} catch (error) {
			// Handle any errors that occur during the fetch request
			alert('Error fetching data:', error.message);
			// Show an error message to the user or perform other error handling actions
			overlay = removeSpinner(overlay);
		}
		
		// Before play update and save deal - BBO seems to forget the bid if we leave after the bid / play
		savedeal(dealnumber, deal)
	} catch (error) {
		overlay = removeSpinner(overlay);
	}
}

removedeal = function (dealnumber) {
	// Loop through all keys in localStorage
	// Should perhaps include a table type
	for (var key in localStorage) {
		// Check if the key starts with 'BidWithBen' and ends with the value of dealnumber
		if (key.startsWith('BidWithBen')) {
			// If the key matches, remove the item from localStorage
			localStorage.removeItem(key);
		}
	}
}

savedeal = function (dealnumber, deal) {
	if (deal["dummy"] == deal["hand"]) {
		alert ("Hand and dummy are the same - BBO rotated the deal")
	} else {
		localStorage.setItem('BidWithBen' + dealnumber, JSON.stringify(deal))
	}
}

getTournamentType = function() {
    if ($("#navDiv score-panel", parent.window.document).text().indexOf("IMPs") > -1) return "IMP";
    if ($("#navDiv score-panel", parent.window.document).text().indexOf("MPs") > -1) return "MP";
    return "";
}

initdeal = function() {
	try {
		dealnumber = getDealNumber()
		dealString = localStorage.getItem('BidWithBen' + dealnumber);
		if (dealString) {
			deal = JSON.parse(dealString);
			console.log(deal);
		}
		if (!dealString || !deal["number"]) {
			deal = {}
			deal["number"] = dealnumber
			deal["dealer"] = getDealerDirection()
			deal["vul"] = ourVulnerability() + areTheyVulnerable()
			deal["seat"] = mySeat()
			deal["user"] = getActivePlayer()
			deal["hand"] = ""
			deal["ctx"] = ""
			deal["dummy"] = ""
			deal["played"] = []
	
			localStorage.setItem('BidWithBen' + dealnumber, JSON.stringify(deal))
		}
		console.log("onMyDeal", JSON.stringify(deal))
	} catch (error) {
		console.log(error)
	}
	return deal;
	
}
//Script
