
Import, https://github.com/stanmaz/BBOalert/blob/master/Scripts/test/PlayWithBEN_bboalert.js

//Script,onNewDeal 
try {
	dealnumber = getDealNumber()
	myCards = getMyCards()
	console.log("myCards", myCards)
	dealString = localStorage.getItem('BidWithBen' + dealnumber);
	if (!dealString ) {
		deal = {}
		deal["number"] = dealnumber
		deal["dealer"] = getDealerDirection()
		// Sometimes BBO haven't had time to draw all cards
		if (getMyCards().length >= 13) {
			deal["hand"] = formatCards(getMyCards())
		} else {
			deal["hand"] = ""
		}
		deal["vul"] = ourVulnerability() + areTheyVulnerable()
		deal["seat"] = mySeat()
		deal["user"] = getActivePlayer()
		deal["ctx"] = ""
		deal["dummy"] = ""
		deal["played"] = []
	
		localStorage.setItem('BidWithBen' + dealnumber, JSON.stringify(deal))
	}
	else {
	
		deal = JSON.parse(dealString);
		console.log(deal);
	
	}
	console.log("onMyDeal", deal)
} catch (error) {
	console.log(error)
}

//Script,onDealEnd 
dealnumber = getDealNumber()
localStorage.removeItem('BidWithBen' + dealnumber)
console.log("onDealEnd - Deal removed")

//Script,onBeforePlayingCard
console.log(Date.now() + " onMyBeforePlayingCard " + getPlayedCards() + " turn " + whosTurn());

//Script,onMyTurnToBid
hand = deal["hand"]
// Due to timing we don't have the hand, so we try to get it again
if (hand.length < 13)  {
	console.log(Date.now() + " Updated hand due to timing")
	deal["hand"] = formatCards(getMyCards())
}
var ctx = getContext()
deal["ctx"] = ctx
var user = deal["user"]
var dealer = deal["dealer"]
var seat = deal["seat"]
var vul = deal["vul"]
var url = "http://localhost:8085/bid?user=" + user + "&dealer=" + dealer + "&seat=" + seat + "&vul=" + vul + "&ctx=" + ctx + "&hand=" + hand
console.log("onMyTurnToBidXX Requesting " + url)
try {
	fetch(url, {
		cache: "no-store"
	})
	.then(function(response) {
		// Check if the response is successful
		if (!response.ok) {
			// Log the response status and status text
			console.error('Response not OK:', response.status, response.statusText);
			
			// Parse the response body as JSON and handle the error
			return response.json().then(function(errorResponse) {
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
	.then(function(data) {
		// Proceed with the logic if the response was successful
		makeBid(data.bid, 0, "");
	})
	.catch(function(error) {
		// Catch any errors that occurred during the fetch or processing
		console.error('Error occurred:', error.message);
	});	
} catch (error) {
	// Handle any errors that occur during the fetch request
	alert('Error fetching data:', error.message);
	// Show an error message to the user or perform other error handling actions
}

// Before bid update and save deal - BBO seems to forget the bid if we leave after the bid / play
localStorage.setItem('BidWithBen' + dealnumber, JSON.stringify(deal))

//Script,onMyTurnToPlay 
console.log(getNow(true) + " onMyTurnToPlayXX");
if (getDummyCards().length == 13) {
	deal["dummy"] = formatCards(getDummyCards())
	// We update both hand as BBO might rotate the deal
	if (deal["dummy"] == deal["hand"]) {
		deal["hand"] = formatCards(getDeclarerCards())
		deal["seat"] = getDeclarerDirection()
	}	 
}

deal["played"] = updatePlayedCards(deal["played"])

var dummyhand = deal["dummy"]
hand = deal["hand"]
var ctx = getContext()
deal["ctx"] = ctx
var user = deal["user"]
var dealer = deal["dealer"]
var seat = deal["seat"]
var vul = deal["vul"]
if (deal["played"].length == 0) {
	var url = "http://localhost:8085/lead?user=" + user + "&dealer=" + dealer + "&seat=" + seat + "&vul=" + vul + "&ctx=" + ctx + "&hand=" + hand;

} else {
	var playedCardsXX = formatCardsPlayed(deal["played"])
	var url = "http://localhost:8085/play?user=" + user + "&dealer=" + dealer + "&seat=" + seat + "&vul=" + vul + "&ctx=" + ctx + "&hand=" + hand +
		"&dummy=" + dummyhand + "&played=" + playedCardsXX;
}
console.log("onMyTurnToPlayXX Requesting " + url)
try {
	fetch(url, {
		cache: "no-store"
	})
	.then(function(response) {
		// Check if the response is successful
		if (!response.ok) {
			// Log the response status and status text
			console.error('Response not OK:', response.status, response.statusText);
			
			// Parse the response body as JSON and handle the error
			return response.json().then(function(errorResponse) {
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
	.then(function(data) {
		// Proceed with the logic if the response was successful
		playCardByValue(data.card)
	})
	.catch(function(error) {
		// Catch any errors that occurred during the fetch or processing
		console.error('Error occurred:', error.message);
	});
	
} catch (error) {
	// Handle any errors that occur during the fetch request
	alert('Error fetching data:', error.message);
	// Show an error message to the user or perform other error handling actions
}

// Before play update and save deal - BBO seems to forget the bid if we leave after the bid / play
localStorage.setItem('BidWithBen' + dealnumber, JSON.stringify(deal))

//Script,onNewPlayedCard 
// This event calls onMyTurnToPlay, so make no change here
if (!isMyTurnToPlay()) {
	deal["played"] = updatePlayedCards(deal["played"])
}
localStorage.setItem('BidWithBen' + dealnumber, JSON.stringify(deal))

//Script,onMyCardsDisplayed 
if (myCardsDisplayed.length == 26) {
	console.log(Date.now() + " Updated hand in onMyCardsDisplayed")
	deal["hand"] = formatCardsDisplayed(myCardsDisplayed)
	localStorage.setItem('BidWithBen' + dealnumber, JSON.stringify(deal))
}
//Script

//Script,onDataLoad

cardExists = function (card, array) {
    return array.some(function(existingCard) {
        // Assuming cards are objects with unique identifiers like 'id'
        return existingCard === card
    });
}

var playedCardsXX = ''
var deal = {}
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

formatCardsDisplayed = function(cards) {
    let played = "";
	let suits = ["", "", "", ""];
    // Loop over the string in steps of 2 characters
    for (let i = 0; i < cards.length; i += 2) {
        let card = cards.substring(i, i + 2); // Get a pair of characters from the string
        let suit = getSuitPlayed(card.charAt(1)); // Get the suit from the second character
        if (suit != -1) {
			suits[suit] = c[0].replace("1", "T") + suits[suit];
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

updatePlayedCards = function  (recordedPlays) {
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

function triggerMouseEvent(node, eventType) {
	let clickEvent = document.createEvent('MouseEvents');
	clickEvent.initEvent(eventType, true, true);
	node.dispatchEvent(clickEvent);
}

makeBid = function (bid, artificial, explain) {
	let elBiddingBox = parent.document.querySelector('.biddingBoxClass');
	if (elBiddingBox != null) {
		let elBiddingButtons = elBiddingBox.querySelectorAll('.biddingBoxButtonClass');
		let alertField = elBiddingBox.querySelector('.mat-form-field-infix').querySelector('input');
		alertField.value = unescape(explain);
		let eventInput = new Event('input');
		alertField.dispatchEvent(eventInput);
		if (elBiddingButtons != null) {
			if ( elBiddingBox.style.display != 'none') {
				if (artificial == 1) elBiddingButtons[15].click();
				if (bid == 'PASS') triggerMouseEvent (elBiddingButtons[12], 'mousedown');
				if (bid == 'PASS') elBiddingButtons[12].click();
				if (bid == 'P') triggerMouseEvent (elBiddingButtons[12], 'mousedown');
				if (bid == 'P') elBiddingButtons[12].click();
				if (bid == 'X') triggerMouseEvent (elBiddingButtons[13], 'mousedown');
				if (bid == 'X') elBiddingButtons[13].click();
				if (bid == 'XX') triggerMouseEvent (elBiddingButtons[14], 'mousedown');
				if (bid == 'XX') elBiddingButtons[14].click();
				if (bid[0] == '1') elBiddingButtons[0].click();
				if (bid[0] == '2') elBiddingButtons[1].click();
				if (bid[0] == '3') elBiddingButtons[2].click();
				if (bid[0] == '4') elBiddingButtons[3].click();
				if (bid[0] == '5') elBiddingButtons[4].click();
				if (bid[0] == '6') elBiddingButtons[5].click();
				if (bid[0] == '7') elBiddingButtons[6].click();
				if (bid[1] == 'C') triggerMouseEvent (elBiddingButtons[7], 'mousedown');
				if (bid[1] == 'C') elBiddingButtons[7].click();
				if (bid[1] == 'D') triggerMouseEvent (elBiddingButtons[8], 'mousedown');
				if (bid[1] == 'D') elBiddingButtons[8].click();
				if (bid[1] == 'H') triggerMouseEvent (elBiddingButtons[9], 'mousedown');
				if (bid[1] == 'H') elBiddingButtons[9].click();
				if (bid[1] == 'S') triggerMouseEvent (elBiddingButtons[10], 'mousedown');
				if (bid[1] == 'S') elBiddingButtons[10].click();
				if (bid[1] == 'N') triggerMouseEvent (elBiddingButtons[11], 'mousedown');
				if (bid[1] == 'N') elBiddingButtons[11].click();
			}
		}
	};
}


//Script
