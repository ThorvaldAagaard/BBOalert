BBOalert, 2025-02-21 Play with BEN
Option, Robot bidding

//BBOalert, version 20250221
//Script,onNewActivePlayer   
// Be aware of timing, so keep animations on
dummy = getDummyCards().join("")
//console.log(getNow(true) +  " onNewActivePlayer  " + dummyCardsDisplayed + " Dummy: " + dummy)
if ((dummyCardsDisplayed != dummy) && (dummy.length == 26)) {
    dummyCardsDisplayed = dummy;
    onDummyCardsDisplayed();
}

//Script,onNewDeal
console.log(getNow(true) + " onNewDeal " + getDealNumber() + " " + myCardsDisplayed);
newdeal = true
dummyCardsDisplayed = "";
myCardsDisplayed = "";

//Script,onMyCardsDisplayed
console.log(getNow(true) + " onMyCardsDisplayed " + myCardsDisplayed + " Dealnumber: " + getDealNumber() + " " + JSON.stringify(deal));

//Script,onNewAuction
console.log(getNow(true) + " onNewAuction");

//Script,onNewState
console.log(getNow(true) + " onNewState " + currentAuction);
if ((currentAuction.length >= 8) && (currentAuction.endsWith('------'))) {
    execUserScript('%onAuctionEnd%');
} else {
    console.log(getNow(true) + " onNewState myTurn " + isMyTurn()) + " " + (isItMe(getPlayerAtSeat(getDirectionToBid()))+ " " + getPlayerAtSeat(getDirectionToBid()) + " " + getDirectionToBid());
    if (isMyTurn()) execUserScript('%onMyTurnToBid%');
}
//Script,onAuctionBegin
console.log(getNow(true) + " onAuctionBegin");
execUserScript('%onNewState%');

//Script,onAuctionEnd
console.log(getNow(true) + " onAuctionEnd");
execUserScript('%onBeforePlayingCard%');
if (isMyTurnToPlay()) execUserScript('%onMyTurnToPlay%');

//Script,onBiddingBoxDisplayed
console.log(getNow(true) + " onBiddingBoxDisplayed");

//Script,onAuctionBoxDisplayed
console.log(getNow(true) + " onAuctionBoxDisplayed");

//Script,onMyLead
console.log(getNow(true) + " onMyLead");

//Script,onDealEnd
console.log(getNow(true) + " onDealEnd");

//Script,onNewPlayedCard
console.log(getNow(true) + " onNewPlayedCard " + getPlayedCards() + " turn " + whosTurn());
if (whosTurn() != "") {
    execUserScript('%onBeforePlayingCard%');
    if (isMyTurnToPlay()) execUserScript('%onMyTurnToPlay%');
}
//Script,onBeforePlayingCard
console.log(getNow(true) + " onBeforePlayingCard " + whosTurn());
//Script,onNewActivePlayer
console.log(getNow(true) + " onNewActivePlayer " + activePlayer);
//Script,onMyTurnToBid
console.log(getNow(true) + " onMyTurnToBid context: " + getContext());
//Script,onMyTurnToPlay
console.log(getNow(true) + " onMyTurnToPlay Cards played: " + getPlayedCards());
//Script

//BBOalert,myFunctions
//Script,onDataLoad
currentContext = "??";
dummyCardsDisplayed = "";
getCardByValue = function (cval) {
    let cv =  cval.replace("T", "10");
    var card = $("bridge-screen", parent.window.document).find(".topLeft:visible").filter(function () {
        if (replaceSuitSymbols(this.textContent, "") == cv) return this;
    });
    if (card.length != 0) return card[0];
    return null;
}

playCardByValue = function (cv) {
    var card = getCardByValue(cv);
    if (card != null) {
        card.click();
        card.click();
    }
}

getCardsByDirection = function (direction) {
    let cards = [];
    let zidx = "";
    switch (direction) {
        case "S" : zidx = "1"; break;
        case "W" : zidx = "2"; break;
        case "N" : zidx = "3"; break;
        case "E" : zidx = "4"; break;
        default : return cards;
    }
    $("bridge-screen .cardSurfaceClass", getNavDiv()).find(".cardClass:visible").each(function () {
        if (this.style.zIndex.startsWith(zidx)) {
            let c = $(this).find(".topLeft").text();
            c = replaceSuitSymbols(c, "").replace("10", "T");
            if (c.length == 2) cards.push(c);
        }
    });
    return cards;
}

function getCard(index) {
    var card = parent.$(".cardClass:visible").filter(function () {
        return $(this).css('z-index') == index;
    }).text();
    if (card.length == 6) {
        card = "T" + card.slice(-1);
    } else card = card.slice(0, 2);
    return card;
}

getMyCards = function () {
    return getCardsByDirection(mySeat());
}

getDummyCards = function () {
    return getCardsByDirection(getDummyDirection());
}

getDeclarerCards = function () {
    return getCardsByDirection(getDeclarerDirection());
}

isMyTurnToBid = function () {
    return isItMe(getPlayerAtSeat(getDirectionToBid()));
}

isMyTurnToPlay = function () {
    if (whosTurn() == getDummyDirection())
        if (isItMe(getPlayerAtSeat(getDeclarerDirection()))) return true;
    return isItMe(getPlayerAtSeat(whosTurn()));
}

isMyTurn = function () {
    return (isMyTurnToBid()||isMyTurnToPlay());
}

whosTurn = function () {
    return $("bridge-screen,parent", parent.window.document).find(".nameBarClass:visible").filter(function () {
        if (this.style.backgroundColor == 'rgb(255, 206, 0)') return this;
    }).find(".directionClass").text();
}

delayedAlert = function (txt, delay = 0) {
    setTimeout(function () {
        alert(txt);
    }, delay)
}

selectBid = function (bid, alert = false) {
    let bbb = parent.$("bidding-box button");
    if (bbb.length != 17) return;
    if (alert != (bbb[15].style.backgroundColor == 'rgb(255, 255, 255)')) bbb[15].click();
    switch (bid) {
        case "--": bbb[12].click(); break;
        case "Db": bbb[13].click(); break;
        case "Rd": bbb[14].click(); break;
        default:
            $(bbb).each(function (idx) {
                if (idx < 12)
                    if (bid.indexOf(replaceSuitSymbols(this.textContent.substring(1), "")) != -1) this.click();
            });
    }
}

isItMe = function (uid) {
    return ((uid.toLowerCase() == whoAmI().toLowerCase()));
}

onNewState = function () {
    execUserScript('%onNewState%');
}

getDealerDirection = function () {
    return "NESW".charAt((getDealNumber() - 1) % 4);
}

getDirectionToBid = function () {
    if (getContext() == "??") return "";
    return "NESW".charAt((getDealNumber() - 1 + getContext().length / 2) % 4);
}

getPlayerAtSeat = function (seat) {
    return $(".nameBarDivClass", getNavDiv()).filter(function () {
        return (this.textContent.startsWith(seat));
    }).text().substring(1);
}

getDeclarerDirection = function () {
    return $(".tricksPanelTricksLabelClass:visible", getNavDiv()).text().substring(0, 1);
}

getDummyDirection = function () {
    let declarer = getDeclarerDirection();
    if (declarer == "") return "";
    return "NESWNESW".charAt("NESW".indexOf(declarer) + 2);
}

window.getCard = function (index) {
    $(".tricksPanelTricksLabelClass:visible", getNavDiv()).text().substring(0, 1);
    var card = parent.$(".cardClass:visible").filter(function () {
        return ($(this).css('z-index') == index);
    }).text();
    if (card.length == 6) {
        card = "T" + card.slice(-1);
    } else card = card.slice(0, 2);
    return card;
}

window.onAuctionBoxHidden = function () {
    activePlayer = '';
    BBOalertEvents().dispatchEvent(E_onAuctionBoxHidden);
    execUserScript('%onAuctionBoxHidden%');
}

window.onNewAuction = function onNewAuction() {
    if (!auctionBoxDisplayed) return;
    execUserScript('%onNewState%');
    if (currentAuction != '')
        if (currentAuction != '??') {
            ctxArray = bidArray(stripContext(getContext()));
            BBOalertEvents().dispatchEvent(E_onNewAuction);
            execUserScript('%onNewAuction%');
			activePlayer = getActivePlayer();
            console.log(getNow(true) + " Next Active player " + activePlayer);
            if (activePlayer.slice(0, 1) == directionRHO()) {
                console.log(getNow(true) + " Partner bid " + getContext().slice(-2));
                BBOalertEvents().dispatchEvent(E_onPartnerAuction);
                execUserScript('%onPartnerAuction%');
            }
            if (activePlayer.slice(0, 1) == directionLHO()) {
                console.log(getNow(true) + " My bid " + getContext().slice(-2));
                BBOalertEvents().dispatchEvent(E_onMyAuction);
                execUserScript('%onMyAuction%');
            }
            if (activePlayer.slice(0, 1) == myDirection()) {
                console.log(getNow(true) + " RHO bid " + getContext().slice(-2));
                BBOalertEvents().dispatchEvent(E_onRHOAuction);
                execUserScript('%onRHOAuction%');
            }
            if (activePlayer.slice(0, 1) == partnerDirection()) {
                console.log(getNow(true) + " LHO bid " + getContext().slice(-2));
                BBOalertEvents().dispatchEvent(E_onLHOAuction);
                execUserScript('%onLHOAuction%');
            }
        }
}

window.onAuctionBoxHidden = function () {
    activePlayer = '';
    BBOalertEvents().dispatchEvent(E_onAuctionBoxHidden);
    execUserScript('%onAuctionBoxHidden%');
}

window.onNewActivePlayer = function () {
    if (lastDealNumber != "") {
        BBOalertEvents().dispatchEvent(E_onNewActivePlayer);
        execUserScript('%onNewActivePlayer%');
    }
}

window.mySeat = function() {
    return $(".auction-header",getNavDiv()).text().slice(-2,-1);
}

window.onDummyCardsDisplayed = function () {
    execUserScript('%onDummyCardsDisplayed%');
}
//Script


//Script,onDummyCardsDisplayed
console.log(getNow(true) + " onDummyCardsDisplayedBEN " + dummyCardsDisplayed);
if (deal["finished"]) {
	console.log(getNow(true) + " onDummyCardsDisplayed after deal finished " + dummyCardsDisplayed + " " + JSON.stringify(deal))
} else {
	if (deal["played"] && deal["played"].length > 4 && deal["dummy"] != "") {
		// Ignore the display of dummy
		// But sometimes it might be late, so grab it if we have no dummy
	} else {
		if (dummyCardsDisplayed.length == 26) {
			deal["dummy"] = formatCardsDisplayed(dummyCardsDisplayed)
			if (deal["dummy"] == deal["hand"]) {
				console.log(getNow(true) + " BBO moved me to the declarer position");
				deal["hand"] = formatCards(getDeclarerCards())
				deal["seat"] = getDeclarerDirection()
				console.log(getNow(true) + " " + JSON.stringify(deal))
			}
			savedeal(dealnumber, deal)
		} else {
			if (deal["dummy"]="") {
				alert("Try to construct dummys hand by adding played card")
				dummycard = getPlayedCards()[1]
				deal["dummy"] = formatCardsDisplayed(dummyCardsDisplayed + dummycard)
				savedeal(dealnumber, deal)
			}
		}
	}
	
}

//Script,onMyCardsDisplayed
console.log(getNow(true) + " onMyCardsDisplayedYY " + myCardsDisplayed);
// BBO will redisplay the hand after the deal finish
if (deal["finished"]) {
	console.log(getNow(true) + " myCardsDisplayed after deal finished " + dummyCardsDisplayed + " " + JSON.stringify(deal))
} else {
	if (deal["played"] && deal["played"].length > 4) {
		console.log(getNow(true) + " onMyCardsDisplayed after deal in progress " + myCardsDisplayed + " " + JSON.stringify(deal))
	} else {
		if (myCardsDisplayed.length == 26) {
			deal["hand"] = formatCardsDisplayed(myCardsDisplayed)
			console.log(getNow(true) + " Updated hand with myCardsDisplayed " + myCardsDisplayed + " " + deal["hand"] + " dealnumber: " + getDealNumber())
			savedeal(dealnumber, deal)
		}
	}
}

//Script,onNewDeal 
removeAds(true);
newdeal = true
deal = {}
deal["number"] = getDealNumber()

//Script,onDealEnd 
dealnumber = getDealNumber()
deal["finished"] = true
removedeal()
console.log(getNow(true) + " onDealEnd - Deal removed")
newdeal = true;

//Script,onAuctionEnd
if (tableType() == "no") {
	dealnumber = getDealNumber()
	removedeal()
	console.log(getNow(true) + " onAuctionEnd - Deal removed")
	newdeal = true
}

//Script,onBeforePlayingCard
console.log(getNow(true) + " onMyBeforePlayingCard " + getPlayedCards() + " turn " + whosTurn());

//Script,onMyTurnToBid
console.log(getNow(true) + " onMyTurnToBidBEN "+ getContext());
if (deal["finished"]) {
	console.log(getNow(true) + " onMyTurnToBid called after deal finished" + " " + JSON.stringify(deal))
} else {
	// Give BBO time to get stuff in place
	var overlay = addSpinner()
	ctx = getContext()
	if (ctx == "") {
		setTimeout(function () {
			requestIdleCallback(() => BENsTurnToBid(overlay), { timeout: 3000 });
		}, 3000)
	} else {
		setTimeout(function () {
			requestIdleCallback(() => BENsTurnToBid(overlay), { timeout: 3000 });
		}, 200)
	}
}

//Script,onMyTurnToPlay 
console.log(getNow(true) + " onMyTurnToPlayBEN");
if (deal["finished"]) {
	console.log(getNow(true) + " onMyTurnToPlay called after deal finished" + " " + JSON.stringify(deal))
} else {
	console.log(getNow(true) + " onMyTurnToPlay current trick: " + deal["played"])
	var overlay = addSpinner()
	if (deal["played"] && deal["played"].length > 0) {
		setTimeout(function () {
			requestIdleCallback(() => BENsTurnToPlay(overlay), { timeout: 3000 });
		}, 200)
	} else {
		setTimeout(function () {
			requestIdleCallback(() => BENsTurnToPlay(overlay), { timeout: 3000 });
		}, 2000)
	}
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
dealnumber = ""
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
		//console.log(getNow(true) + " Adds removed");
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
	overlay.style.top = '58%'; // Adjust top position to center vertically
	overlay.style.left = '40%'; // Adjust left position to center horizontally
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
	//console.log("adding spinner")
	return overlay
}

removeSpinner = function (overlay) {
	if (overlay) {
		parent.document.body.removeChild(overlay);
		//console.log("removing spinner")
		overlay = null;
	}
	return overlay;
}

BENsTurnToBid = function (overlay) {
	if (newdeal) {
		initdeal()		
	}
	try {
		// alert(getMyCards())
		// Due to timing we don't have the hand, so we try to get it again
		if (!deal["hand"]  || deal["hand"].length < 13) {
			console.log(getNow(true) + " Updated hand due to timing" + deal["hand"] + " " + myCardsDisplayed)
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
		var hand = deal["hand"]
		var dealnumber = getDealNumber()
		var url = "https://remote.aalborgdata.dk/bid?user=" + user + "&dealer=" + dealer + "&dealno=" + dealnumber + "&seat=" + seat + "&vul=" + vul + "&ctx=" + ctx + "&hand=" + hand
		console.log(getNow(true) + " BENsTurnToBid Requesting " + url)
		try {
			fetch(url, {
				cache: "no-store"
			})
				.then(function (response) {
					console.log(getNow(true) + " BENsTurnToBid Response from " + url)
					// Check if the response is successful
					if (!response.ok) {
						overlay = removeSpinner(overlay);
						// Log the response status and status text
						console.error(getNow(true) + 'Response not OK:', response.status, response.statusText);

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
					console.log(getNow(true) + " BENsTurnToBid BEN would like to bid:",data.bid)
					requestAnimationFrame(() => makeBid(data.bid, 0, ""));
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

BENsTurnToPlay = function (overlay) {
	console.log(getNow(true) + " BENsTurnToPlay called");
	if (newdeal) {
		initdeal()
	}
	try {
		// if (myCardsDisplayed.length == 26) {
		// 	console.log(getNow(true) + " Updated hand with myCardsDisplayed " + myCardsDisplayed + " " + deal["hand"])
		// 	deal["hand"] = formatCardsDisplayed(myCardsDisplayed)
		// }

		// Due to timing we don't have the hand, so we try to get it again
		if (!deal["hand"]  ||  deal["hand"].length < 13) {
			console.log(getNow(true) + " Updated hand due to timing" + deal["hand"] + " " + myCardsDisplayed)
			if (getMyCards().length > 26) {
				alert("To many cards in hand, something is wrong")
			}
			deal["hand"] = formatCards(getMyCards())
		}
		
		// If we see 13 cards in dummy, we update the deal
		if (getDummyCards().length == 13) {
			deal["dummy"] = formatCards(getDummyCards())
			// We update both hand as BBO might rotate the deal
			if (deal["dummy"] == deal["hand"]) {
				console.log(getNow(true) + " same hand for dummy and hand")
				deal["hand"] = formatCards(getDeclarerCards())
				deal["seat"] = getDeclarerDirection()
				console.log(getNow(true) + " " + JSON.stringify(deal))
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
		var dealnumber = getDealNumber()
		if (deal["played"].length == 52) {
			console.log(getNow(true) + " BENsTurnToPlay called, but Board is finished");
			overlay = removeSpinner(overlay);
			return
		}
		if (deal["played"].length == 0) {
			var url = "https://remote.aalborgdata.dk/lead?user=" + user + "&dealer=" + dealer + "&dealno=" + dealnumber + "&seat=" + seat + "&vul=" + vul + "&ctx=" + ctx + "&hand=" + hand;
		
		} else {
			var dummyhand = deal["dummy"]
			if (dummyhand == "") {
				console.log(getNow(true) + " No dummy - getting dummy cards")
				deal["dummy"] = formatCards(getDummyCards())
				var dummyhand = deal["dummy"]
				if (dummyhand == "...") {
					overlay = removeSpinner(overlay);
					alert("No dummy cards, something is wrong. Probably timeing issue"+ " " + getDummyCards())
					return
				}
			}
			var playedCardsXX = formatCardsPlayed(deal["played"])
			var url = "https://remote.aalborgdata.dk/play?user=" + user + "&dealer=" + dealer + "&dealno=" + dealnumber + "&seat=" + seat + "&vul=" + vul + "&ctx=" + ctx + "&hand=" + hand +
				"&dummy=" + dummyhand + "&played=" + playedCardsXX;
		}
		var tournamentType = getTournamentType()
		if (tournamentType != "") {
			url += "&tournament=" + tournamentType
		}
		console.log(getNow(true) + " BENsTurnToPlay Requesting " + url)
		try {
			fetch(url, {
				cache: "no-store"
			})
				.then(function (response) {
					console.log(getNow(true) + " BENsTurnToPlay Response from " + url)
					// Check if the response is successful
					if (!response.ok) {
						overlay = removeSpinner(overlay);
						// Log the response status and status text
						console.error(getNow(true) + ' Response not OK:', response.status, response.statusText);
		
						// Parse the response body as JSON and handle the error
						return response.json().then(function (errorResponse) {
							// Extract the error message from the JSON response
							const errorMessage = errorResponse.error || 'Unknown error occurred';
		
							// Show the error message to the user
							console.error(getNow(true) + ' Error:', errorMessage);
							throw new Error(errorMessage); // Throw an error to skip to the catch block
						});
					}
		
					// If response is OK, parse the response as JSON
					return response.json();
				})
				.then(function (data) {
					// Proceed with the logic if the response was successful
					console.log(getNow(true) + " onMyTurnToPlay BEN would like to play:",data.card)
					requestAnimationFrame(() => makePlay(data.card[1].replace("T", "10") + data.card[0]));
					overlay = removeSpinner(overlay);
				})
				.catch(function (error) {
					overlay = removeSpinner(overlay);
					// Catch any errors that occurred during the fetch or processing
					console.error(getNow(true) + ' Error occurred:', error.message);
				});
		
		} catch (error) {
			// Handle any errors that occur during the fetch request
			console.error(getNow(true) + ' Error fetching data:', errorMessage);
			// Show an error message to the user or perform other error handling actions
			overlay = removeSpinner(overlay);
		}
		
		// Before play update and save deal - BBO seems to forget the bid if we leave after the bid / play
		savedeal(dealnumber, deal)
	} catch (error) {
		overlay = removeSpinner(overlay);
	}
}

removedeal = function () {
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
	if (dealnumber) {
		if (deal["dummy"] == deal["hand"]) {
			alert ("Hand and dummy are the same - BBO rotated the deal")
		} else {
			localStorage.setItem('BidWithBen' + dealnumber, JSON.stringify(deal))
		}
	}
}

getTournamentType = function() {
	let text = $("#navDiv score-panel", parent.window.document).text().toLowerCase();
	if (text.indexOf("imp") > -1) return "IMP";
	if (text.indexOf("mp") > -1) return "MP";
	return "";
}

initdeal = function() {
	try {
		dealnumber = getDealNumber()
		dealString = localStorage.getItem('BidWithBen' + dealnumber);
		if (dealString) {
			deal = JSON.parse(dealString);
			console.log(getNow(true) + " Found in storage: " + dealString);
			if (!deal["played"]) deal["played"] = []
			if (!deal["ctx"]) deal["ctx"] = ""
			deal["dealer"] = getDealerDirection()
			deal["vul"] = ourVulnerability() + areTheyVulnerable()
			deal["seat"] = mySeat()
			deal["user"] = getActivePlayer()
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
		console.log(getNow(true) + " onMyDeal", JSON.stringify(deal))
	} catch (error) {
		console.log(getNow(true) + " onMyDeal error", error)
	}
	newdeal = false
	return deal;
	
}
//Script
