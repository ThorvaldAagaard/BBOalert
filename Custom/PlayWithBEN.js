
Import,https://github.com/stanmaz/BBOalert/blob/master/Scripts/test/PlayWithBEN_bboalert.js

//Script,onNewDeal
let playedCards = ""
//Script,onNewAuction
if ((ctx.length >= 8) && (ctx.endsWith('------'))) {
	dummyDirection = "NESWNESW".charAt("NESW".indexOf(whosTurn())+1);
	declarerDirection = "NESWNESW".charAt("NESW".indexOf(whosTurn())+3);
}

//Script,onBeforePlayingCard
console.log(getNow(true) + " onBeforePlayingCardXX");
//Script,onMyTurnToBid
console.log(getNow(true) + " onMyTurnToBidXX");

var hand = getMyCards()
hand = formatCards(hand)
var ctx = getContext()
var user = getActivePlayer()
var dealer = getDealer()
var seat = mySeat()
var vul = ourVulnerability() + areTheyVulnerable()
var url = "https://remote.aalborgdata.dk/bid?user="+ user + "&dealer=" + dealer + "&seat=" + seat + "&vul=" + vul + "&ctx=" + ctx + "&hand=" + hand
console.log("Requesting " + url)
fetch(url, {
	cache: "no-store"
})
	.then(response => response.json())
	.then(data => { console.log(data); 
		MakeBid(data.bid, 0, "")
	})
	.catch(error => { console.log(error)});

//Script,onMyTurnToPlay 
console.log(getNow(true) + " onMyTurnToPlayXX");
// We need to send all cards played to the server as it does not hold state
playedCards += formatCards(getPlayedCards())
var hand = getMyCards()
hand = formatCards(hand)
var dummy = getDummyCards()
dummyhand = formatCards(dummy)
var ctx = getContext()
var user = getActivePlayer()
var dealer = getDealer()
var seat = mySeat()
var vul = ourVulnerability() + areTheyVulnerable()
var url = "https://remote.aalborgdata.dk/play?user="+ user + "&dealer=" + dealer + "&seat=" + seat + "&vul=" + vul + "&ctx=" + ctx + "&hand=" + hand +
"&dummy=" + dummyhand + "&played=" + playedCards;
console.log("Requesting " + url)
fetch(url, {
	cache: "no-store"
})
	.then(response => response.json())
	.then(data => { console.log(data); 
		playCardByValue(data.card)
	})
	.catch(error => { console.log(error)});
//Script

//BBOalert,myFunctions
//Script,onDataLoad
dummyDirection = "";
declarerDirection = "";
getCardByValue = function (cv) {
    var card =  $("bridge-screen" ,parent.window.document).find(".topLeft:visible").filter(function () {
        if (replaceSuitSymbols(this.textContent,"") == cv) return this;
    });
    if (card.length != 0) return card[0];
    return null;
}

playCardByValue = function (cv) {
	alert("Play: " + cv)
	return

	cv = cv.split("").reverse().join("").replace("T", "10")
	let card = getCardByValue(cv);
	if (card != null) {
		card.click();
		card.click();
		havePlayed = true
	}
}

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

formatCards = function (cards) {
	let suits = ["", "", "", ""];
	for (c of cards) {
		let suit = getSuit(c[c.length - 1])
		if (suit != -1) {
			suits[suit] = c[0].replace("1", "T") + suits[suit];
		}
	}
	let hand = suits.join("_");
	return hand;
}


getDealer = function () {
    try {
        let dn = parseInt(getDealNumber());
        // Extract the dealer character
        let dealer = "NESW".charAt((dn - 1) % 4);
        return dealer;
    } catch {
        // when something goes wrong
        return "";
    }
}

function triggerMouseEvent(node, eventType) {
	let clickEvent = document.createEvent('MouseEvents');
	clickEvent.initEvent(eventType, true, true);
	node.dispatchEvent(clickEvent);
}

MakeBid = function (bid, artificial, explain) {
	alert("BEN Suggest: " + bid)
	return
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

