//BBOalert, 2026-08-08 Play with Brill
//BBOalert, localStorage.BRILL_SERVER = 'local'      // → http://localhost:8085
//BBOalert, localStorage.removeItem('BRILL_SERVER')  // → back to brillservice (https://brillservice.aalborgdata.dk, default)
Option, Robot Brill

//Script,onAnnouncementDisplayed
console.log(getNow(true) + " onAnnouncementDisplayed Dealnumber: " + getDealNumber() + " " + JSON.stringify(deal));
var isClaimDialog = false;
try {
	var panel = getAnnouncementPanel();
	var panelText = $(panel).text().replace(/\s+/g, " ").trim();
	var visibleButtons = $("button:visible", panel).map(function () { return $(this).text().trim(); }).get();
	console.log(getNow(true) + " onAnnouncementDisplayed text: \"" + panelText + "\" buttons: " + JSON.stringify(visibleButtons));
	isClaimDialog = /\bI claim\b/i.test(panelText);
	if (isClaimDialog) {
		// Mark that a real claim happened on this deal - used by sendFinalPlay to decide whether
		// to attach &claim=true to /pbn/finalize. Without this flag we'd incorrectly tag any deal
		// with played < 52 (e.g. one missed card during capture) as a claim.
		claimDetected = true;
		// Parse "<Dir>: I claim <N> more tricks. Contract <making|down> <±N>. Do you accept?"
		var claimMatch = /\bI claim (\d+)\b/i.exec(panelText);
		var dirMatch = /^(North|South|East|West):/i.exec(panelText);
		var resultMatch = /Contract (making|down)(?:\s*([+\-]?\d+))?/i.exec(panelText);
		var tricksClaimed = claimMatch ? parseInt(claimMatch[1], 10) : null;
		var claimerDir = dirMatch ? dirMatch[1].charAt(0).toUpperCase() : null;
		var resultKind = resultMatch ? resultMatch[1].toLowerCase() : null;
		var resultDelta = resultMatch && resultMatch[2] ? parseInt(resultMatch[2], 10) : 0;
		console.log(getNow(true) + " CLAIM parsed: claimer=" + claimerDir +
			" tricks=" + tricksClaimed + " result=" + resultKind + " delta=" + resultDelta);
		validateClaimWithServer(panel, tricksClaimed, claimerDir, resultKind, resultDelta);
	}
} catch (e) {
	console.error(getNow(true) + " onAnnouncementDisplayed log error:", e);
}
// Auto-click Yes on regular (non-claim) announcements
if (!isClaimDialog) {
	$("button:visible:contains('Yes')", getAnnouncementPanel()).click();
}
//Script,onNewActivePlayer
// Be aware of timing, so keep animations on
dummy = getDummyCards().join("")
console.log(getNow(true) +  " onNewActivePlayer  " + dummyCardsDisplayed + " Dummy: " + dummy)
if ((dummyCardsDisplayed != dummy) && (dummy.length == 26)) {
    dummyCardsDisplayed = dummy;
    onDummyCardsDisplayed();
} else if (dummy.length > 0 && dummy.length < 26 && dummyCardsDisplayed.length < 26) {
    // BBO might not have rendered all dummy cards yet, retry with increasing delays
    console.log(getNow(true) + " Dummy not fully rendered (" + (dummy.length/2) + " cards), retrying...");
    var retryDelays = [50, 100, 200, 400];
    retryDelays.forEach(function(delay) {
        setTimeout(function() {
            if (dummyCardsDisplayed.length == 26) return; // Already captured
            var retryDummy = getDummyCards().join("");
            console.log(getNow(true) + " Retry dummy after " + delay + "ms: " + retryDummy + " (" + (retryDummy.length/2) + " cards)");
            if ((dummyCardsDisplayed != retryDummy) && (retryDummy.length == 26)) {
                dummyCardsDisplayed = retryDummy;
                onDummyCardsDisplayed();
            }
        }, delay);
    });
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
var ctx = getContext();
if (ctx.endsWith("------") && ctx != "--------" && ctx.length >= 8) {
    execUserScript('%onBeforeFirstLead%');
}

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
//Script,onAnnouncement
console.log(getNow(true) + " onAnnouncement event fired");
try {
	var annText = $(".announcementClass:visible", parent.window.document).text().replace(/\s+/g, " ").trim();
	console.log(getNow(true) + " onAnnouncement text: \"" + annText + "\"");
} catch (e) { }
//Script,onNotification
console.log(getNow(true) + " onNotification event fired");
try {
	var notifText = $(".notificationClass:visible", parent.window.document).text().replace(/\s+/g, " ").trim();
	console.log(getNow(true) + " onNotification text: \"" + notifText + "\"");
} catch (e) { }
//Script,onNotificationDisplayed
console.log(getNow(true) + " onNotificationDisplayed event fired");
try {
	var notifText = $(".notificationClass:visible", parent.window.document).text().replace(/\s+/g, " ").trim();
	console.log(getNow(true) + " onNotificationDisplayed text: \"" + notifText + "\"");
} catch (e) { }
//Script

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

getPlayerAtSeat2 = function (seat) {
    let player = $(".nameBarDivClass", getNavDiv()).filter(function () {
        return (this.textContent.startsWith(seat));
    }).text();
	console.log(player)
    // Extract everything before "@font-face"
    let cutoff = player.indexOf(" @font-face");
    if (cutoff !== -1) {
        player = player.substring(0, cutoff);
    }
    return player.substring(1);
}

getPlayerAtSeat = function (seat) {
    return $(".nameBarDivClass", getNavDiv()).filter(function () {
        return (this.textContent.startsWith(seat));
    }).find(".nameDisplayClass").text();
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
window.getActivePlayer = function getActivePlayer() {
    var name = $('bridge-screen deal-viewer .nameBarClass', PWD)
        .filter(function () {
            return this.style.backgroundColor === "rgb(255, 206, 0)";
        }).find(":lt(2)").text();
    if (name == '') {
        name = $('bridge-screen deal-viewer .nameBarClass', PWD)
            .filter(function () {
                return this.style.backgroundColor === "rgb(204, 204, 154)";
            }).find(":lt(2)").text();
    }
    // return direction + UID in lower case
	// console.log(name);
    return name.charAt(0) + name.substring(1).toLowerCase();
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
console.log(getNow(true) + " onDummyCardsDisplayedBrill " + dummyCardsDisplayed);
if (deal["finished"]) {
	console.log(getNow(true) + " onDummyCardsDisplayed after deal finished " + dummyCardsDisplayed + " " + JSON.stringify(deal))
} else {
	if (deal["played"] && deal["played"].length > 4 && deal["dummy"] != "") {
		// Ignore the display of dummy
		// But sometimes it might be late, so grab it if we have no dummy
	} else {
		if (dummyCardsDisplayed.length == 26) {
			// When playing defend only the order is a bit different
			if (newdeal) {
				// Defensive: onDataLoad block may not have run yet (BBOalert script evaluation race).
				// initdeal lives in the bottom onDataLoad block - skip if not yet defined.
				if (typeof initdeal === "function") initdeal();
				else console.warn(getNow(true) + " onDummyCardsDisplayed: initdeal not yet defined, skipping init");
			}
			deal["dummy"] = formatCardsDisplayed(dummyCardsDisplayed)
			if (deal["dummy"] == deal["hand"]) {
				console.log(getNow(true) + " BBO moved me to the declarer position");
				deal["hand"] = formatCards(getDeclarerCards())
				deal["seat"] = getDeclarerDirection()
				console.log(getNow(true) + " " + JSON.stringify(deal))
			}
			savedeal(dealnumber, deal)
		} else {
			if (deal["dummy"] == "" || !deal["dummy"]) {
				console.log(getNow(true) + " Dummy incomplete (" + (dummyCardsDisplayed.length/2) + " cards), will retry in BrillsTurnToPlay");
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
		if (deal["hand"]) {
			console.log(getNow(true) + " myCardsDisplayed with hand already " + deal["hand"] + " " + dummyCardsDisplayed + " " + getMyCards())
		} else {
			if (myCardsDisplayed.length == 26) {
				deal["hand"] = formatCardsDisplayed(getMyCards())
				deal["seat"] = myDirection()
				console.log(getNow(true) + " Updated hand with myCardsDisplayed " + myCardsDisplayed + " " + getMyCards() + " " + deal["hand"] + " dealnumber: " + getDealNumber())
				savedeal(getDealNumber(), deal)
			}
		}
	}
}

//Script,onNewDeal
removeAds(true);
newdeal = true
deal = {}
deal["number"] = getDealNumber()
biddingInProgress = false
playInProgress = false
lastBidCtx = null
lastPlayKey = null
finalPlaySent = false
claimDetected = false

//Script,onDealEnd
dealnumber = getDealNumber()
deal["finished"] = true
sendFinalPlay()
removedeal()
console.log(getNow(true) + " onDealEnd - Deal removed")
newdeal = true;

//Script,onAuctionEnd
// Detect passed-out auction (4 passes, no contract) and finalize the deal so it shows up in the PBN file.
// onDealEnd often doesn't fire for passed-out auctions, so we need to finalize here.
if (getContext() === "--------") {
	console.log(getNow(true) + " onAuctionEnd - passed out auction detected, finalizing");
	sendFinalPlay();
}
if (tableType() == "no") {
	dealnumber = getDealNumber()
	removedeal()
	console.log(getNow(true) + " onAuctionEnd - Deal removed")
	newdeal = true
}

//Script,onBeforeFirstLead
if (getActivePlayer().substring(0,1) == mySeat()) {
    execUserScript('%onMyTurnToPlay%');
}


//Script,onBeforePlayingCard
console.log(getNow(true) + " onMyBeforePlayingCard " + getPlayedCards() + " turn " + whosTurn());

//Script,onMyTurnToBid
console.log(getNow(true) + " onMyTurnToBidBrill "+ getContext());
if (deal["finished"] && getDealNumber() != deal["number"]) {
	console.log(getNow(true) + " onMyTurnToBid new board detected, reinitializing deal");
	newdeal = true;
	deal["finished"] = false;
}
var currentBidCtx = getContext();
if (deal["finished"]) {
	console.log(getNow(true) + " onMyTurnToBid called after deal finished" + " " + JSON.stringify(deal))
} else if (biddingInProgress) {
	console.log(getNow(true) + " onMyTurnToBid skipped, bid request already in progress")
} else if (lastBidCtx === currentBidCtx) {
	console.log(getNow(true) + " onMyTurnToBid skipped, already processed ctx: " + currentBidCtx)
} else {
	biddingInProgress = true;
	lastBidCtx = currentBidCtx;
	// Give BBO time to get stuff in place
	var overlay = addSpinner()
	ctx = currentBidCtx
	if (ctx == "") {
		setTimeout(function () {
			requestIdleCallback(() => BrillsTurnToBid(overlay), { timeout: 3000 });
		}, 3000)
	} else {
		setTimeout(function () {
			requestIdleCallback(() => BrillsTurnToBid(overlay), { timeout: 3000 });
		}, 500)
	}
}

//Script,onMyTurnToPlay
console.log(getNow(true) + " onMyTurnToPlayBrill");
if (deal["finished"] && getDealNumber() != deal["number"]) {
	console.log(getNow(true) + " onMyTurnToPlay new board detected, reinitializing deal");
	newdeal = true;
	deal["finished"] = false;
}
// Dedup key combines played-count and current played cards on screen so repeated fires for the same turn are skipped
var currentPlayKey = (deal["played"] ? deal["played"].length : 0) + "|" + getPlayedCards();
if (deal["finished"]) {
	console.log(getNow(true) + " onMyTurnToPlay called after deal finished" + " " + JSON.stringify(deal))
} else if (playInProgress) {
	console.log(getNow(true) + " onMyTurnToPlay skipped, play request already in progress")
} else if (lastPlayKey === currentPlayKey) {
	console.log(getNow(true) + " onMyTurnToPlay skipped, already processed key: " + currentPlayKey)
} else {
	playInProgress = true;
	lastPlayKey = currentPlayKey;
	console.log(getNow(true) + " onMyTurnToPlay current trick: " + deal["played"])
	var overlay = addSpinner()
	if (deal["played"] && deal["played"].length > 0) {
		setTimeout(function () {
			requestIdleCallback(() => BrillsTurnToPlay(overlay), { timeout: 3000 });
		}, 500)
	} else {
		setTimeout(function () {
			requestIdleCallback(() => BrillsTurnToPlay(overlay), { timeout: 3000 });
		}, 2000)
	}
}

//Script,onNewPlayedCard
// This event calls onMyTurnToPlay, so make no change here
if (!isMyTurnToPlay()) {
	deal["played"] = updatePlayedCards(deal["played"])
	savedeal(dealnumber, deal)
}
// Send final /play as soon as the 52nd card is recorded - before any onDealEnd/onNewDeal race can wipe deal state
if (deal["played"] && deal["played"].length == 52 && !finalPlaySent) {
	sendFinalPlay()
}

//Script

//Script,onDataLoad

cardExists = function (card, array) {
	return array.some(function (existingCard) {
		// Assuming cards are objects with unique identifiers like 'id'
		return existingCard === card
	});
}
// Server selection: in the BBO browser console run
//   localStorage.BRILL_SERVER = 'local'     -> http://localhost:5200 (https variant: http://localhost:7200)
//   localStorage.removeItem('BRILL_SERVER') -> back to brillservice (default)
getBrillBaseUrl = function () {
	return localStorage.getItem('BRILL_SERVER') === 'local'
		? 'http://localhost:5200'
		: 'https://brillservice.aalborgdata.dk';
}
// Player naming for the saved PBN. The server stamps names on the board-saving calls (/play,
// /claim, /pbn/finalize) into [North]/[East]/[South]/[West] and derives [Room] from the board
// label (Open, or Closed when it ends in _robot).
//
// On a live BBO table Brill drives ONLY our own seat (every action is gated on isItMe()==whoAmI),
// so the OTHER three seats are BBO's own robots (GIB / Ben / an opponent), each with its own name.
// Recording all three as "Brill" (the old getRobotName) was wrong on two counts: they aren't Brill,
// and the seat Brill actually played was ours. So we now send the ACTUAL name at each seat and label
// only the Brill-driven seat "Brill". getSeatDisplayName(dir) returns "Brill" for our own seat and
// BBO's on-screen name for the rest; sent per-seat as &south/&north/&east/&west.
// user= is a caller/tool identity tag the server ignores, so it is not sent on these calls.
getRobotName = function () {
	return "Brill";
}
getSeatDisplayName = function (dir) {
	var name = (getPlayerAtSeat(dir) || "").trim();
	// Our own seat is the one Brill operates -- match on the on-screen name (same test isItMe uses)
	// with deal["seat"] as a fallback for when the name isn't rendered at save time. Label it "Brill".
	var me = (typeof whoAmI === "function" ? (whoAmI() || "") : "").trim();
	var isHeroSeat = (name && me && name.toLowerCase() === me.toLowerCase())
		|| (typeof deal !== "undefined" && deal && deal["seat"] === dir);
	if (isHeroSeat) return getRobotName();
	return name; // BBO's own name for this seat (GIB / Ben / opponent)
}
newdeal = true
dealnumber = ""
deal = {}
biddingInProgress = false
playInProgress = false
lastBidCtx = null
lastPlayKey = null
finalPlaySent = false
claimDetected = false
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
	if (typeof cards !== "string") {
		//console.error("Invalid input: cards should be a string.");
		//console.error("Received: ", cards);
		cards = cards.join("");
	}
	
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

// Inject a stylesheet ONCE that hides ad slots with !important so GPT/Prebid
// re-injection can't override it. Also nukes ad iframes to kill their scripts
// (GPT refresh cycles burn CPU even on display:none elements).
removeAds = function (on) {
	if (!on) return;
	try {
		var doc = parent.window.document;
		// 1) Persistent CSS - hides ads even if BBO/GPT re-injects them
		if (!doc.getElementById("brill-no-ads-css")) {
			var style = doc.createElement("style");
			style.id = "brill-no-ads-css";
			style.textContent =
				"#bbo_ad1, #bbo_ad2, [id^='bbo_ad'], " +
				"iframe[src*='googleads'], iframe[src*='securepubads'], " +
				"iframe[src*='doubleclick'], iframe[src*='amazon-adsystem'], " +
				"iframe[src*='adnxs'], iframe[src*='googlesyndication'], " +
				".adsbygoogle { display: none !important; visibility: hidden !important; width: 0 !important; height: 0 !important; }" +
				"#bbo_app { left: 0px !important; right: 0px !important; width: auto !important; }";
			doc.head.appendChild(style);
		}
		// 2) Actively remove ad iframes - stops their JS from running and saves CPU
		$("iframe[src*='googleads'], iframe[src*='securepubads'], " +
		  "iframe[src*='doubleclick'], iframe[src*='amazon-adsystem'], " +
		  "iframe[src*='adnxs'], iframe[src*='googlesyndication']", doc).remove();
		// 3) Empty the ad slot containers (their inner GPT div+iframe go away)
		$("#bbo_ad1, #bbo_ad2", doc).empty();
	} catch (e) {
		console.error(getNow(true) + " removeAds error:", e);
	}
};

removeAds(true);
// GPT re-runs auctions every ~30s. Re-empty the ad slots periodically to keep iframes from
// taking back over. Cheap: one jQuery query + .remove() per tick. CSS keeps them invisible.
if (typeof brillAdInterval === "undefined" || !brillAdInterval) {
	brillAdInterval = setInterval(function () { removeAds(true); }, 15000);
}

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

// Defensive dedupe - despite cardExists checks, duplicates have been observed (probably from brief
// screen states where a previous trick's winning card is still rendered alongside the new trick).
// Sending duplicates to the server triggers "No cards remaining" errors.
dedupePlayedCards = function (cards) {
	if (!cards || cards.length == 0) return cards;
	var seen = {};
	var result = [];
	for (var i = 0; i < cards.length; i++) {
		var c = cards[i];
		if (seen[c]) {
			console.warn(getNow(true) + " dedupe: dropping duplicate " + c + " at index " + i);
			continue;
		}
		seen[c] = true;
		result.push(c);
	}
	return result;
}

getTrumpSuit = function(ctx) {
	// Find the last real bid (not pass/double/redouble) to determine trump suit
	for (var i = ctx.length - 2; i >= 0; i -= 2) {
		var bid = ctx.substring(i, i + 2);
		if (bid != "--" && bid != "Db" && bid != "Rd") {
			var suit = bid.charAt(1);
			if (suit == "N") return ""; // No Trump
			return suit; // S, H, D, or C
		}
	}
	return "";
}

// Reconstruct any direction's original 13-card hand by combining the cards
// currently visible on screen with the cards that direction has already played.
reconstructHand = function (direction, currentCards, playedCards, declarerDir, ctx) {
	if (!playedCards || playedCards.length == 0) return formatCards(currentCards || []);
	if (!declarerDir) return formatCards(currentCards || []);

	var trumpSuit = getTrumpSuit(ctx);
	var leaderDir = "NESWNESW".charAt("NESW".indexOf(declarerDir) + 1);
	var ranks = "23456789TJQKA";
	var dirPlayedCards = [];
	var currentLeader = leaderDir;

	var fullTricks = Math.floor(playedCards.length / 4);
	for (var t = 0; t < fullTricks; t++) {
		var trickStart = t * 4;
		var playOrder = [];
		var dir = currentLeader;
		for (var j = 0; j < 4; j++) {
			playOrder.push(dir);
			dir = "NESWNESW".charAt("NESW".indexOf(dir) + 1);
		}
		for (var j = 0; j < 4; j++) {
			if (playOrder[j] == direction) {
				dirPlayedCards.push(playedCards[trickStart + j]);
				break;
			}
		}
		// Determine winner to track next leader
		var leadSuit = playedCards[trickStart].charAt(0);
		var winnerIdx = 0;
		var winnerRank = ranks.indexOf(playedCards[trickStart].charAt(1));
		var winnerIsTrump = (leadSuit == trumpSuit);
		for (var j = 1; j < 4; j++) {
			var cardSuit = playedCards[trickStart + j].charAt(0);
			var cardRank = ranks.indexOf(playedCards[trickStart + j].charAt(1));
			if (trumpSuit != "" && cardSuit == trumpSuit && !winnerIsTrump) {
				winnerIdx = j; winnerRank = cardRank; winnerIsTrump = true;
			} else if (trumpSuit != "" && cardSuit == trumpSuit && winnerIsTrump && cardRank > winnerRank) {
				winnerIdx = j; winnerRank = cardRank;
			} else if (cardSuit == leadSuit && !winnerIsTrump && cardRank > winnerRank) {
				winnerIdx = j; winnerRank = cardRank;
			}
		}
		currentLeader = playOrder[winnerIdx];
	}
	// Handle incomplete trick (cards played but trick not finished)
	var remainingCards = playedCards.length % 4;
	if (remainingCards > 0) {
		var trickStart = fullTricks * 4;
		var dir = currentLeader;
		for (var j = 0; j < remainingCards; j++) {
			if (dir == direction) {
				dirPlayedCards.push(playedCards[trickStart + j]);
			}
			dir = "NESWNESW".charAt("NESW".indexOf(dir) + 1);
		}
	}
	// Combine: currentCards is rank+suit format ("KD"); playedCards entries are suit+rank ("DK")
	// Dedupe defensively - currentCards may already include cards from the current trick that are
	// also in the played array, which would otherwise produce a hand > 13 cards.
	var seen = {};
	var allCards = [];
	for (var i = 0; i < (currentCards || []).length; i++) {
		var c = currentCards[i];
		if (!seen[c]) { seen[c] = true; allCards.push(c); }
	}
	for (var i = 0; i < dirPlayedCards.length; i++) {
		var played = dirPlayedCards[i];
		var asCard = played.charAt(1) + played.charAt(0);
		if (!seen[asCard]) { seen[asCard] = true; allCards.push(asCard); }
	}
	return formatCards(allCards);
}

// True iff a hand string has exactly 13 cards across 4 dot-separated suits.
isValidHand = function (handStr) {
	if (!handStr) return false;
	var parts = handStr.split(".");
	if (parts.length != 4) return false;
	return (parts[0].length + parts[1].length + parts[2].length + parts[3].length) == 13;
}

// Read all 4 hands from the screen, reconstructing originals when only remaining cards are visible.
// Returns { N, E, S, W } - each value is a hand string in PBN-suit format (e.g. "AKx.xxxx.xx.xxx")
// or "" if the seat isn't visible / produced an invalid count. Server tolerates "" and fills via
// 52-card-elimination from the seats it does receive.
//
// Seeds with reliable deal["hand"]/deal["dummy"] data first, since at claim time the announcement
// panel may obscure cards or BBO may be in a transitional render state where getCardsByDirection
// returns nothing. Screen reads override the seed if they produce a valid 13-card hand.
getAllHands = function () {
	var hands = { N: "", E: "", S: "", W: "" };
	var declarerDir = getDeclarerDirection();
	var ctx = (deal && deal["ctx"]) || getContext() || "";
	var played = (deal && deal["played"]) || [];

	// Seed with deal data: our seat's hand and the dummy's hand are known reliably from earlier
	// in the deal, so use them as defaults regardless of whether the screen reads succeed.
	if (deal && deal["seat"] && deal["hand"] && isValidHand(deal["hand"])) {
		hands[deal["seat"]] = deal["hand"];
	}
	if (deal && deal["dummy"] && declarerDir && isValidHand(deal["dummy"])) {
		var dummySeat = "NESWNESW".charAt("NESW".indexOf(declarerDir) + 2);
		hands[dummySeat] = deal["dummy"];
	}

	// Then try screen reads - a successful 13-card read overrides the seed (more authoritative)
	// and may also fill in opponents we couldn't seed.
	var dirs = ["N", "E", "S", "W"];
	for (var i = 0; i < dirs.length; i++) {
		var dir = dirs[i];
		var cards = getCardsByDirection(dir);
		if (!cards || cards.length == 0) continue;
		// Defensive: if zIndex filter picked up too many cards (e.g. animation pushed everything
		// to z-index "100" which startsWith("1") matches for S), skip - sending garbage hurts more.
		if (cards.length > 13) {
			console.warn(getNow(true) + " getAllHands: " + dir + " has " + cards.length + " visible cards (>13), skipping");
			continue;
		}
		var formatted;
		if (cards.join("").length == 26) {
			// 13 cards visible -> hand is original
			formatted = formatCards(cards);
		} else if (declarerDir && played.length > 0) {
			formatted = reconstructHand(dir, cards, played, declarerDir, ctx);
		} else {
			formatted = formatCards(cards);
		}
		if (isValidHand(formatted)) {
			hands[dir] = formatted;
		} else if (!hands[dir]) {
			console.warn(getNow(true) + " getAllHands: " + dir + " produced invalid hand \"" + formatted +
				"\" (visible=" + cards.length + ", played=" + played.length + "), keeping empty");
		}
	}
	return hands;
}

reconstructDummy = function(currentDummyCards, playedCards, declarerDir, ctx) {
	// Reconstruct original dummy hand by adding back cards played from dummy's position
	if (!playedCards || playedCards.length == 0) return formatCards(currentDummyCards);

	var trumpSuit = getTrumpSuit(ctx);
	var dummyDir = "NESWNESW".charAt("NESW".indexOf(declarerDir) + 2);
	// Opening leader is to the left of declarer (clockwise)
	var leaderDir = "NESWNESW".charAt("NESW".indexOf(declarerDir) + 1);

	var ranks = "23456789TJQKA";
	var dummyPlayedCards = [];
	var currentLeader = leaderDir;

	// Process complete tricks
	var fullTricks = Math.floor(playedCards.length / 4);
	for (var t = 0; t < fullTricks; t++) {
		var trickStart = t * 4;
		// Determine play order for this trick: leader, then clockwise
		var playOrder = [];
		var dir = currentLeader;
		for (var j = 0; j < 4; j++) {
			playOrder.push(dir);
			dir = "NESWNESW".charAt("NESW".indexOf(dir) + 1);
		}

		// Find dummy's card in this trick
		for (var j = 0; j < 4; j++) {
			if (playOrder[j] == dummyDir) {
				dummyPlayedCards.push(playedCards[trickStart + j]);
				break;
			}
		}

		// Determine trick winner to know who leads next
		var leadSuit = playedCards[trickStart].charAt(0);
		var winnerIdx = 0;
		var winnerRank = ranks.indexOf(playedCards[trickStart].charAt(1));
		var winnerIsTrump = (leadSuit == trumpSuit);

		for (var j = 1; j < 4; j++) {
			var cardSuit = playedCards[trickStart + j].charAt(0);
			var cardRank = ranks.indexOf(playedCards[trickStart + j].charAt(1));

			if (trumpSuit != "" && cardSuit == trumpSuit && !winnerIsTrump) {
				winnerIdx = j;
				winnerRank = cardRank;
				winnerIsTrump = true;
			} else if (trumpSuit != "" && cardSuit == trumpSuit && winnerIsTrump && cardRank > winnerRank) {
				winnerIdx = j;
				winnerRank = cardRank;
			} else if (cardSuit == leadSuit && !winnerIsTrump && cardRank > winnerRank) {
				winnerIdx = j;
				winnerRank = cardRank;
			}
		}
		currentLeader = playOrder[winnerIdx];
	}

	// Handle incomplete trick (cards played but trick not finished)
	var remainingCards = playedCards.length % 4;
	if (remainingCards > 0) {
		var trickStart = fullTricks * 4;
		var dir = currentLeader;
		for (var j = 0; j < remainingCards; j++) {
			if (dir == dummyDir) {
				dummyPlayedCards.push(playedCards[trickStart + j]);
			}
			dir = "NESWNESW".charAt("NESW".indexOf(dir) + 1);
		}
	}

	// Combine current visible dummy cards with dummy's played cards
	// currentDummyCards: array of "rank+suit" like ["KD", "4S"]
	// dummyPlayedCards: array of "suit+rank" like ["DK", "S4"]
	var allDummyCards = currentDummyCards.slice();
	for (var i = 0; i < dummyPlayedCards.length; i++) {
		var played = dummyPlayedCards[i];
		var asCard = played.charAt(1) + played.charAt(0); // "DK" -> "KD"
		allDummyCards.push(asCard);
	}

	console.log(getNow(true) + " reconstructDummy: visible=" + currentDummyCards.length +
		" dummyPlayed=" + JSON.stringify(dummyPlayedCards) + " total=" + allDummyCards.length);
	return formatCards(allDummyCards);
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

// Poll test() every interval ms until it returns something truthy or timeout ms have passed.
// Calls back with the truthy value, or with null on timeout.
waitFor = function (test, timeout, interval, callback) {
    var waited = 0;
    (function poll() {
        var result = null;
        try { result = test(); } catch (e) { }
        if (result) return callback(result);
        if (waited >= timeout) return callback(null);
        waited += interval;
        setTimeout(poll, interval);
    })();
}

getClaimRejectedNotification = function () {
    var n = $(".notificationClass div:visible:contains('Claim rejected')", PWD);
    return n.length > 0 ? n : null;
}

// Claim 'tricks' tricks. The callback gets true only when the claim really went through.
// Every other outcome - rejected, dialog never opened, opponents never answered - calls back
// with false, because the caller then has to play a card: after a claim that goes nowhere no
// card is played, so BBO fires no onNewPlayedCard and nothing else restarts the play flow.
makeClaim = function (tricks, card, callback) {
    var tricksText = parseInt(tricks);
    var settled = false;
    var finish = function (accepted, reason) {
        if (settled) return;
        settled = true;
        console.log(getNow(true) + " Claim " + (accepted ? "accepted" : "not accepted") + " - " + reason);
        callback(accepted);
    };
    var cancelDialog = function () {
        $("claim-dialog button:contains('Cancel')", PWD).first().click();
    };

    // Step 1: Click the initial Claim button
    $(".claimButtonClass:contains('Claim')", PWD).click();

    // Step 2: wait for the dialog to render, then click the button for the number of tricks
    waitFor(function () {
        var b = $("claim-dialog button", PWD).filter(function () {
            return $(this).text().trim() === tricksText.toString();
        });
        return b.length > 0 ? b.first() : null;
    }, 3000, 100, function (trickButton) {
        if (!trickButton) {
            cancelDialog();
            return finish(false, "claim dialog did not offer " + tricksText + " tricks");
        }
        trickButton.click();

        // Step 3: wait for the final 'Claim' confirmation button, then click it
        waitFor(function () {
            var b = $("claim-dialog button", PWD).filter(function () {
                var t = $(this).text().trim();
                return t.toLowerCase() === "claim" ||
                    (t.indexOf("Claim") > -1 && t.toLowerCase().indexOf("cancel") === -1);
            });
            return b.length > 0 ? b.first() : null;
        }, 2000, 100, function (confirmButton) {
            if (!confirmButton) {
                cancelDialog();
                return finish(false, "confirmation button never appeared");
            }
            confirmButton.click();

            // Step 4: opponents can take several seconds to answer, so poll for the outcome
            // instead of deciding after a fixed delay. Only an emptied hand counts as accepted -
            // a timeout while we still hold cards is treated as "not accepted" so we play on.
            waitFor(function () {
                var rejected = getClaimRejectedNotification();
                if (rejected) return { rejected: rejected };
                if (getMyCards().length == 0) return { accepted: true };
                return null;
            }, 10000, 200, function (outcome) {
                if (outcome && outcome.rejected) {
                    outcome.rejected.parent().hide();
                    return finish(false, "claim rejected");
                }
                if (outcome && outcome.accepted) return finish(true, "claimed " + tricks + " tricks");
                finish(false, "no answer to the claim");
            });
        });
    });
};

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

BrillsTurnToBid = function (overlay) {
	if (newdeal) {
		if (typeof initdeal === "function") initdeal();
	}
	try {
		// State may have advanced while this call was deferred - bail if it's no longer our turn
		if (!isMyTurnToBid()) {
			console.log(getNow(true) + " BrillsTurnToBid aborted - no longer my turn to bid");
			overlay = removeSpinner(overlay);
			biddingInProgress = false;
			return;
		}
		// alert(getMyCards())
		// Due to timing we don't have the hand, so we try to get it again
		if (!deal["hand"]  || deal["hand"].length < 13) {
			console.log(getNow(true) + " Updated hand due to timing" + deal["hand"] + " " + myCardsDisplayed)
			if (getMyCards().length > 26) {
				console.warn(getNow(true) + " Hand is too big, something is wrong: " + getMyCards())
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
		// Same board/session tagging as /lead and /play: board = the PLAIN board number,
		// pbn_label = the groupable "<session>_b<N>" (names the bid log), event = the match
		// name. The server stamps board + event onto the game it bids, so a missing auction
		// context recorded here says which board of which tournament produced it.
		var url = getBrillBaseUrl() + "/bid?user=" + user + "&dealer=" + dealer + "&dealno=" + dealnumber + "&seat=" + seat + "&vul=" + vul + "&ctx=" + ctx + "&hand=" + hand +
			"&board=" + encodeURIComponent(dealnumber) +
			"&pbn_label=" + encodeURIComponent(getBoardLabel()) +
			"&event=" + encodeURIComponent(getEventName())
		var bidTournamentType = getTournamentType()
		if (bidTournamentType != "") {
			url += "&tournament=" + bidTournamentType
		}
		console.log(getNow(true) + " BrillsTurnToBid Requesting " + url)
		try {
			fetch(url, {
				cache: "no-store"
			})
				.then(function (response) {
					console.log(getNow(true) + " BrillsTurnToBid Response from " + url)
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
					if (data.message) {
						console.log(getNow(true) + " Brill return message:",data.message)
						overlay = removeSpinner(overlay);
						biddingInProgress = false;
					} else {
						console.log(getNow(true) + " BrillsTurnToBid Brill would like to bid:",data.bid)
						// Re-check turn AT CLICK TIME (inside setTimeout) - state may advance between now and when the macrotask runs
						setTimeout(() => {
							if (isMyTurnToBid()) {
								makeBid(data.bid, 0, "");
							} else {
								console.log(getNow(true) + " Skipping bid click - no longer my turn to bid")
							}
						}, 0);
						overlay = removeSpinner(overlay);
						biddingInProgress = false;
					}
				})
				.catch(function (error) {
					overlay = removeSpinner(overlay);
					biddingInProgress = false;
					// Catch any errors that occurred during the fetch or processing
					console.error('Error occurred:', error.message);
				});
		} catch (error) {
			// Handle any errors that occur during the fetch request
			alert('Error fetching data: ' + error.message);
			// Show an error message to the user or perform other error handling actions
			overlay = removeSpinner(overlay);
			biddingInProgress = false;
		}
		// Before bid update and save deal - BBO seems to forget the bid if we leave after the bid / play
		savedeal(dealnumber, deal)
	} catch (error) {
		overlay = removeSpinner(overlay);
		biddingInProgress = false;
	}
}

BrillsTurnToPlay = function (overlay) {
	console.log(getNow(true) + " BrillsTurnToPlay called");
	if (newdeal) {
		if (typeof initdeal === "function") initdeal();
	}
	try {
		// State may have advanced while this call was deferred - bail if it's no longer our turn
		if (!isMyTurnToPlay()) {
			console.log(getNow(true) + " BrillsTurnToPlay aborted - no longer my turn to play");
			overlay = removeSpinner(overlay);
			playInProgress = false;
			return;
		}
		// if (myCardsDisplayed.length == 26) {
		// 	console.log(getNow(true) + " Updated hand with myCardsDisplayed " + myCardsDisplayed + " " + deal["hand"])
		// 	deal["hand"] = formatCardsDisplayed(myCardsDisplayed)
		// }

		// Due to timing we don't have the hand, so we try to get it again
		if (!deal["hand"]  ||  deal["hand"].length < 13) {
			console.log(getNow(true) + " Updated hand due to timing" + deal["hand"] + " " + myCardsDisplayed)
			if (getMyCards().length > 26) {
				console.warn(getNow(true) + " Too many cards in hand, something is wrong: " + getMyCards())
			}
			deal["hand"] = formatCards(getMyCards())
		}
		
		// If we see 13 cards in dummy, we update the deal
		dc = getDummyCards()
		if (dc.join("").length == 26) {
			deal["dummy"] = formatCards(dc)
			// We update both hand as BBO might rotate the deal
			if (deal["dummy"] == deal["hand"]) {
				console.log(getNow(true) + " same hand for dummy and hand")
				deal["hand"] = formatCards(getDeclarerCards())
				deal["seat"] = getDeclarerDirection()
				console.log(getNow(true) + " " + JSON.stringify(deal))
			}
		}
		
		deal["played"] = updatePlayedCards(deal["played"])
		deal["played"] = dedupePlayedCards(deal["played"])

		// Bail out if I have no cards left to play - the deal is effectively over
		// (this happens when an opponent claim transitions BBO state mid-call)
		if (getMyCards().length == 0 && deal["played"].length > 0) {
			console.log(getNow(true) + " BrillsTurnToPlay aborted - no cards in my hand, deal must be ending");
			overlay = removeSpinner(overlay);
			playInProgress = false;
			return;
		}

		hand = deal["hand"]
		var ctx = getContext()
		deal["ctx"] = ctx
		var user = deal["user"]
		var dealer = deal["dealer"]
		var seat = deal["seat"]
		var vul = deal["vul"]
		var dealnumber = getDealNumber()
		if (deal["played"].length == 52) {
			console.log(getNow(true) + " BrillsTurnToPlay called, but Board is finished");
			sendFinalPlay();
			overlay = removeSpinner(overlay);
			playInProgress = false;
			return
		}
		if (deal["played"].length == 0) {
			// board = the PLAIN board number ([Board] tag / log context); pbn_label carries the
			// groupable "<session>_b<N>" name and event the challenge name (see getBoardLabel).
			var url = getBrillBaseUrl() + "/lead?user=" + user + "&dealer=" + dealer + "&dealno=" + dealnumber + "&seat=" + seat + "&vul=" + vul + "&ctx=" + ctx + "&hand=" + hand +
				"&board=" + encodeURIComponent(dealnumber) +
				"&pbn_label=" + encodeURIComponent(getBoardLabel()) +
				"&event=" + encodeURIComponent(getEventName());

		} else {
			var dummyhand = deal["dummy"]
			if (dummyhand == "" || !dummyhand || dummyhand == "...") {
				console.log(getNow(true) + " No dummy stored - getting dummy cards from screen")
				dc = getDummyCards()
				if (dc.join("").length == 26) {
					deal["dummy"] = formatCards(dc)
				} else {
					// Dummy cards incomplete on screen - reconstruct by adding back played cards
					console.log(getNow(true) + " Dummy incomplete on screen (" + dc.length + " cards), reconstructing from played cards")
					deal["dummy"] = reconstructDummy(dc, deal["played"], getDeclarerDirection(), ctx)
				}
				dummyhand = deal["dummy"]
				savedeal(dealnumber, deal)
			}
			// Verify dummy has 13 cards before sending to API
			var dummyCardCount = dummyhand.replace(/\./g, "").length;
			if (dummyCardCount != 13) {
				console.error(getNow(true) + " Dummy has " + dummyCardCount + " cards instead of 13: " + dummyhand);
				overlay = removeSpinner(overlay);
				playInProgress = false;
				return;
			}
			var playedCardsXX = formatCardsPlayed(deal["played"])
			var url = getBrillBaseUrl() + "/play?user=" + user + "&dealer=" + dealer + "&dealno=" + dealnumber + "&seat=" + seat + "&vul=" + vul + "&ctx=" + ctx + "&hand=" + hand +
				"&dummy=" + dummyhand + "&played=" + playedCardsXX +
				"&board=" + encodeURIComponent(dealnumber) +
				"&pbn_label=" + encodeURIComponent(getBoardLabel()) +
				"&event=" + encodeURIComponent(getEventName()) +
				"&south=" + encodeURIComponent(getSeatDisplayName("S")) +
				"&north=" + encodeURIComponent(getSeatDisplayName("N")) +
				"&east=" + encodeURIComponent(getSeatDisplayName("E")) +
				"&west=" + encodeURIComponent(getSeatDisplayName("W"));
		}
		var tournamentType = getTournamentType()
		if (tournamentType != "") {
			url += "&tournament=" + tournamentType
		}
		console.log(getNow(true) + " BrillsTurnToPlay Requesting " + url)
		try {
			fetch(url, {
				cache: "no-store"
			})
				.then(function (response) {
					console.log(getNow(true) + " BrillsTurnToPlay Response from " + url)
					// Check if the response is successful
					if (!response.ok) {
						overlay = removeSpinner(overlay);
						playInProgress = false;
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
					if (data.message) {
						console.log(getNow(true) + " Brill return message:",data.message)
						overlay = removeSpinner(overlay);
						playInProgress = false;
					} else {
						// Re-check turn before clicking - state may have advanced during the fetch
						var stillMyTurn = isMyTurnToPlay();
						// Only claim as declarer or dummy. As defender we can only conceed
						if (data.claim && (data.player == 1 || data.player == 3)) {
							console.log(getNow(true) + " Claiming " + data.claim + " tricks")
							makeClaim(data.claim, data.card, function (accepted) {
								overlay = removeSpinner(overlay);
								playInProgress = false;
								if (accepted) return;
								// The claim did not go through, so we have to play after all.
								// Nothing else will restart us: no card was played, so there is no
								// onNewPlayedCard, and the dedup key is unchanged - clear it as well.
								lastPlayKey = null;
								// Re-check the turn here, not before the claim - the dialog took seconds
								if (!isMyTurnToPlay()) {
									console.log(getNow(true) + " Claim not accepted, but no longer my turn to play")
									return;
								}
								console.log(getNow(true) + " Claim not accepted - playing " + data.card + " instead")
								var playedBefore = getPlayedCards();
								setTimeout(() => makePlay(data.card[1].replace("T", "10") + data.card[0]), 0);
								// If that click did not register we would be stuck, so re-drive the flow.
								// Only when nothing was played since - otherwise the normal flow took over.
								setTimeout(function () {
									if (!playInProgress && isMyTurnToPlay() && getPlayedCards() == playedBefore) {
										console.log(getNow(true) + " Card not played after rejected claim - retrying")
										playInProgress = true;
										BrillsTurnToPlay(addSpinner());
									}
								}, 3000);
							});
						} else {
							console.log(getNow(true) + " BrillsTurnToBid Brill would like to play:",data.card)
							if (stillMyTurn) {
								setTimeout(() => makePlay(data.card[1].replace("T", "10") + data.card[0]),0);
							} else {
								console.log(getNow(true) + " Skipping play click - no longer my turn to play")
							}
							overlay = removeSpinner(overlay);
							playInProgress = false;
						}
					}
				})
				.catch(function (error) {
					overlay = removeSpinner(overlay);
					playInProgress = false;
					// Catch any errors that occurred during the fetch or processing
					console.error(getNow(true) + ' Error occurred:', error.message);
				});
		
		} catch (error) {
			// Handle any errors that occur during the fetch request
			console.error(getNow(true) + ' Error fetching data:', errorMessage);
			// Show an error message to the user or perform other error handling actions
			overlay = removeSpinner(overlay);
			playInProgress = false;
		}

		// Before play update and save deal - BBO seems to forget the bid if we leave after the bid / play
		savedeal(dealnumber, deal)
	} catch (error) {
		overlay = removeSpinner(overlay);
		playInProgress = false;
	}
}

validateClaimWithServer = function (panel, tricksClaimed, claimerDir, resultKind, resultDelta) {
	// Called when an opponent claim dialog appears. Sends /claim to the server for validation,
	// then auto-clicks Accept (Yes) or Reject (No) based on the response.
	// On any error or missing data, leaves the dialog up for the user to decide manually.
	if (!tricksClaimed) {
		console.warn(getNow(true) + " validateClaimWithServer: no tricks parsed, leaving dialog for manual decision");
		return;
	}
	// Defer briefly so BBO has time to reveal all 4 hands as part of the claim presentation.
	// At claim time BBO normally exposes the claimer's hand (and often dummy already, plus our own
	// seat) so the opposing side can verify the claim. The hand reads in getAllHands() depend on
	// those cards being rendered face-up; firing synchronously is too early.
	setTimeout(function () {
		validateClaimWithServerInternal(panel, tricksClaimed, claimerDir, resultKind, resultDelta);
	}, 500);
}

validateClaimWithServerInternal = function (panel, tricksClaimed, claimerDir, resultKind, resultDelta) {
	try {
		// Initialize deal struct from localStorage / fresh if not done yet
		if (newdeal || !deal["number"]) {
			if (typeof initdeal === "function") initdeal();
		}
		// Populate any missing fields from the screen on demand - the claim may arrive before
		// our other handlers got a chance to fill them in.
		if (!deal["played"]) deal["played"] = [];
		deal["played"] = updatePlayedCards(deal["played"]);
		deal["played"] = dedupePlayedCards(deal["played"]);
		if (!deal["hand"] || deal["hand"].length < 13) {
			var myCards = getMyCards();
			if (myCards.length > 0) deal["hand"] = formatCards(myCards);
		}
		if (!deal["dummy"]) {
			var dc = getDummyCards();
			if (dc.length > 0) {
				deal["dummy"] = (dc.join("").length == 26)
					? formatCards(dc)
					: reconstructDummy(dc, deal["played"], getDeclarerDirection(), getContext());
			}
		}
		if (!deal["dealer"]) deal["dealer"] = getDealerDirection();
		if (!deal["vul"]) deal["vul"] = getAbsoluteVulnerability();
		if (!deal["seat"]) deal["seat"] = mySeat();
		if (!deal["user"]) deal["user"] = getActivePlayer();
		if (!deal["ctx"]) deal["ctx"] = getContext();
		if (!deal["number"]) deal["number"] = getDealNumber();
		// Final check - we still need at minimum hand and number to send
		if (!deal["hand"] || !deal["number"]) {
			console.warn(getNow(true) + " validateClaimWithServer: still missing hand/number after fallback (hand=" +
				deal["hand"] + ", number=" + deal["number"] + "), leaving dialog for manual decision");
			return;
		}
		var ctx = deal["ctx"];
		var user = deal["user"];
		var dealer = deal["dealer"];
		var seat = deal["seat"];
		var vul = deal["vul"];
		var hand = deal["hand"];
		var dummyhand = deal["dummy"] || "";
		var dealnumber = deal["number"];
		var playedCardsXX = formatCardsPlayed(deal["played"] || []);
		// Read all 4 hands from screen - BBO reveals all hands when an opponent claims, so the
		// server can verify the claim against everyone's actual cards.
		var allHands = getAllHands();
		console.log(getNow(true) + " validateClaim allHands: N=" + allHands.N + " E=" + allHands.E + " S=" + allHands.S + " W=" + allHands.W);
		var url = getBrillBaseUrl() + "/claim?south=" + encodeURIComponent(getSeatDisplayName("S")) +
			"&north=" + encodeURIComponent(getSeatDisplayName("N")) +
			"&east=" + encodeURIComponent(getSeatDisplayName("E")) +
			"&west=" + encodeURIComponent(getSeatDisplayName("W")) +
			"&dealer=" + dealer + "&dealno=" + dealnumber + "&seat=" + seat +
			"&vul=" + vul + "&ctx=" + ctx + "&hand=" + hand +
			"&dummy=" + dummyhand + "&played=" + playedCardsXX +
			"&board=" + encodeURIComponent(dealnumber) +
			"&pbn_label=" + encodeURIComponent(getBoardLabel()) +
			"&event=" + encodeURIComponent(getEventName()) +
			"&tricks=" + tricksClaimed +
			"&n=" + allHands.N + "&e=" + allHands.E + "&s=" + allHands.S + "&w=" + allHands.W;
		if (claimerDir) url += "&claimer=" + claimerDir;
		var tournamentType = getTournamentType();
		if (tournamentType != "") url += "&tournament=" + tournamentType;
		console.log(getNow(true) + " validateClaim Requesting " + url);
		fetch(url, { cache: "no-store" })
			.then(function (response) {
				console.log(getNow(true) + " validateClaim Response status: " + response.status);
				if (!response.ok) {
					console.warn(getNow(true) + " validateClaim non-OK response, leaving for manual decision");
					return null;
				}
				return response.json();
			})
			.then(function (data) {
				if (!data) return;
				console.log(getNow(true) + " validateClaim response data:", JSON.stringify(data));
				// Note: do NOT set finalPlaySent here. /claim is for validation only.
				// /pbn/finalize fires later from onDealEnd when BBO has revealed all 4 hands,
				// so the server can construct a complete PBN.
				// Server fields: { saved: bool, claim: N, result: N, board: ... }
				// Accept-signal field names: saved | accept | ok | valid (true to accept).
				var accept = (data.saved === true) || (data.accept === true) || (data.ok === true) || (data.valid === true);
				var reject = (data.saved === false) || (data.accept === false) || (data.reject === true) || (data.valid === false);
				if (accept) {
					console.log(getNow(true) + " validateClaim: server accepted (claim=" + data.claim + ", result=" + data.result + "), clicking Yes");
					$("button.accept-button:visible", panel).click();
				} else if (reject) {
					console.log(getNow(true) + " validateClaim: server rejected, clicking No");
					$("button.reject-button:visible", panel).click();
				} else {
					console.log(getNow(true) + " validateClaim: server response unclear, leaving for manual decision");
				}
			})
			.catch(function (error) {
				console.error(getNow(true) + " validateClaim error:", error.message);
			});
	} catch (e) {
		console.error(getNow(true) + " validateClaim exception:", e);
	}
}

sendFinalPlay = function () {
	// Record the completed deal via /pbn/finalize with all 4 hands.
	// Called from onDealEnd (after BBO reveals all hands) or onAuctionEnd (passed out).
	// /claim is a separate endpoint that fires at claim-dialog time for live validation only;
	// it does NOT save the PBN, because at that moment opponent hands aren't yet visible.
	if (finalPlaySent) {
		console.log(getNow(true) + " sendFinalPlay skipped - already sent for this deal");
		return;
	}
	// Defer ~1.5s so BBO has time to settle the last trick animation and reveal all 4 hands.
	// Earlier 500ms was too aggressive - we were reading mid-animation and losing the last
	// trick's cards. The hand reads in getAllHands() depend on cards being rendered face-up.
	setTimeout(function () { sendFinalPlayInternal(); }, 1500);
}

sendFinalPlayInternal = function () {
	if (finalPlaySent) return;
	try {
		// Make sure we've captured all played cards still visible on screen, then dedupe defensively
		if (deal["played"]) {
			deal["played"] = updatePlayedCards(deal["played"]);
			deal["played"] = dedupePlayedCards(deal["played"]);
		}
		// Pull missing fields from the screen so this works even before bidding/play populated them
		if (!deal["hand"] || deal["hand"].length < 13) {
			var myCards = getMyCards();
			if (myCards.length > 0) deal["hand"] = formatCards(myCards);
		}
		if (!deal["dealer"]) deal["dealer"] = getDealerDirection();
		if (!deal["vul"]) deal["vul"] = getAbsoluteVulnerability();
		if (!deal["seat"]) deal["seat"] = mySeat();
		if (!deal["user"]) deal["user"] = getActivePlayer();
		if (!deal["ctx"]) deal["ctx"] = getContext();
		if (!deal["number"]) deal["number"] = getDealNumber();
		// Need at least hand and number to send anything meaningful
		if (!deal["hand"] || !deal["number"]) {
			console.log(getNow(true) + " sendFinalPlay skipped - missing hand or deal number");
			return;
		}
		finalPlaySent = true;
		var playedCount = deal["played"] ? deal["played"].length : 0;
		var complete = (playedCount == 52);
		var ctx = deal["ctx"];
		var passedOut = (ctx === "--------" || /^-+$/.test(ctx));
		var user = deal["user"];
		var dealer = deal["dealer"];
		var seat = deal["seat"];
		var vul = deal["vul"];
		var hand = deal["hand"];
		var dummyhand = deal["dummy"] || "";
		var dealnumber = deal["number"];
		var playedCardsXX = formatCardsPlayed(deal["played"] || []);
		// Read all 4 hands from screen - at deal end BBO reveals all opponents, so this is
		// where we get a complete deal for the PBN.
		var allHands = getAllHands();
		console.log(getNow(true) + " sendFinalPlay allHands: N=" + allHands.N + " E=" + allHands.E + " S=" + allHands.S + " W=" + allHands.W);
		// Always use /pbn/finalize - the server's universal "save PBN" endpoint.
		// Deal type is signalled by &passedout / &claim / &final query params.
		var url = getBrillBaseUrl() + "/pbn/finalize?south=" + encodeURIComponent(getSeatDisplayName("S")) +
			"&north=" + encodeURIComponent(getSeatDisplayName("N")) +
			"&east=" + encodeURIComponent(getSeatDisplayName("E")) +
			"&west=" + encodeURIComponent(getSeatDisplayName("W")) +
			"&dealer=" + dealer + "&dealno=" + dealnumber + "&seat=" + seat +
			"&vul=" + vul + "&ctx=" + ctx + "&hand=" + hand +
			"&dummy=" + dummyhand + "&played=" + playedCardsXX +
			// board = the PLAIN board number so the [Board] tag stays numeric (match pairing);
			// pbn_label names the file "<session>_b<N>.pbn" so the /pbn page groups every board
			// of this sitting under one heading, and event supplies that heading.
			"&board=" + encodeURIComponent(dealnumber) +
			"&pbn_label=" + encodeURIComponent(getBoardLabel()) +
			"&event=" + encodeURIComponent(getEventName()) +
			"&final=true" +
			"&n=" + allHands.N + "&e=" + allHands.E + "&s=" + allHands.S + "&w=" + allHands.W;
		if (passedOut) {
			url += "&passedout=true";
		} else if (claimDetected) {
			// A real claim dialog was seen on this deal. Send the actual remaining-trick count.
			var remainingTricks = Math.ceil((52 - playedCount) / 4);
			url += "&claim=true&tricks=" + remainingTricks;
		} else if (!complete) {
			// Less than 52 cards but no claim was observed - we just missed capturing some cards
			// during play (timing issue with screen reads). Don't tag as claim; let the server
			// reconstruct from the hands we are sending.
			var missingCount = 52 - playedCount;
			if (missingCount <= 2) {
				console.log(getNow(true) + " sendFinalPlay: " + playedCount + "/52 cards (missing " +
					missingCount + ") - acceptable shortfall, sending without claim flag");
			} else {
				console.warn(getNow(true) + " sendFinalPlay: only " + playedCount + "/52 cards captured (missing " +
					missingCount + ") but no claim was detected - significant shortfall, server may reject");
			}
		}
		var tournamentType = getTournamentType();
		if (tournamentType != "") url += "&tournament=" + tournamentType;
		// Count how many of the 4 hands are populated - server needs >= 3 to construct full PBN
		var handsPopulated = (allHands.N ? 1 : 0) + (allHands.E ? 1 : 0) + (allHands.S ? 1 : 0) + (allHands.W ? 1 : 0);
		var dealTypeLabel = passedOut ? "passed out" :
			(claimDetected ? playedCount + "/52 cards, CLAIM" :
				complete ? playedCount + "/52 cards, complete" : playedCount + "/52 cards, INCOMPLETE-no-claim");
		console.log(getNow(true) + " sendFinalPlay -> /pbn/finalize (" + dealTypeLabel +
			", hands populated: " + handsPopulated + "/4) " + url);
		if (handsPopulated < 3) {
			console.warn(getNow(true) + " sendFinalPlay: only " + handsPopulated + "/4 hands populated - server may not be able to construct full PBN");
		}
		fetch(url, { cache: "no-store" })
			.then(function (response) {
				console.log(getNow(true) + " sendFinalPlay Response status: " + response.status);
			})
			.catch(function (error) {
				console.error(getNow(true) + " sendFinalPlay error:", error.message);
			});
	} catch (e) {
		console.error(getNow(true) + " sendFinalPlay exception:", e);
	}
}

removedeal = function () {
	// Loop through all keys in localStorage
	// Should perhaps include a table type
	for (var key in localStorage) {
		// Check if the key starts with 'BidWithBrill' and ends with the value of dealnumber
		if (key.startsWith('BidWithBrill')) {
			// If the key matches, remove the item from localStorage
			localStorage.removeItem(key);
		}
	}
}

savedeal = function (dealnumber, deal) {
	if (dealnumber) {
		if (deal["dummy"] == deal["hand"]) {
			// BBO rotated the deal - skip saving, we recover on the next update
			console.warn(getNow(true) + " savedeal: hand and dummy are the same - BBO rotated the deal, not saving")
		} else {
			localStorage.setItem('BidWithBrill' + dealnumber, JSON.stringify(deal))
		}
	}
}

getTournamentType = function() {
	let text = $("#navDiv score-panel, #navDiv .score-panel", parent.window.document).text().toLowerCase();
	if (text.indexOf("imp") > -1) return "IMP";
	if (text.indexOf("mp") > -1) return "MP";
	return "";
}

getMatchName = function() {
	var title = $("nav-bar h2.titleClass", parent.window.document).first().text().trim();
	if (!title) return "";
	var stopWords = ["a", "an", "the", "of", "for", "against", "vs", "and", "with", "in", "on", "at", "to", "board"];
	var words = title.split(/\s+/).filter(function (w) {
		return w && stopWords.indexOf(w.toLowerCase()) === -1 && !/^\d+$/.test(w);
	});
	if (words.length === 0) return "";
	var compact;
	if (words.length <= 2) {
		compact = words.join("-");
	} else {
		var initials = words.slice(0, -1).map(function (w) { return w.charAt(0).toUpperCase(); }).join("");
		compact = initials + "-" + words[words.length - 1];
	}
	return compact.replace(/[^A-Za-z0-9\-]/g, "");
}

getDateStamp = function() {
	var now = new Date();
	return now.getFullYear() +
		String(now.getMonth() + 1).padStart(2, '0') +
		String(now.getDate()).padStart(2, '0');
}

// The session slug every board of this sitting shares - date, scoring type and match name,
// with NO board number in it. Brill.Service's /pbn page groups saved boards by their filename
// after stripping a trailing "_b<N>" (PbnChallengeKey), so boards only land in one group when
// they share this prefix. (The old getBoardID() buried the board number in the MIDDLE, which
// is why every board showed up as its own "Brill.Service /play" challenge - all endpoints now
// send the plain board number plus this slug via pbn_label.)
getChallengeSlug = function() {
	var slug = getDateStamp() + "_" + (getTournamentType() || "X");
	var matchName = getMatchName();
	if (matchName) slug += "_" + matchName;
	return slug;
}

// Filename label for one saved board: "<session slug>_b<board>" - the same shape BridgeChallenge
// sends as pbn_label, so Brill.Service names and groups our boards exactly the same way.
getBoardLabel = function() {
	return getChallengeSlug() + "_b" + String(getDealNumber());
}

// Readable [Event] tag for the saved PBN, i.e. the group heading on the Completed Boards page.
// Without it the server falls back to the default "Brill.Service /play". Any "board <n>" in the
// nav-bar title is stripped so every board of the session reports the same event.
getEventName = function() {
	var title = $("nav-bar h2.titleClass", parent.window.document).first().text().trim();
	if (title) {
		var cleaned = title.replace(/\bboard\s*\d+\b/ig, "").replace(/\s{2,}/g, " ").trim();
		if (cleaned) return cleaned;
	}
	var tournament = getTournamentType();
	return "BBO" + (tournament ? " " + tournament : "") + " " + getDateStamp();
}

initdeal = function() {
	try {
		dealnumber = getDealNumber()
		dealString = localStorage.getItem('BidWithBrill' + dealnumber);
		if (dealString) {
			deal = JSON.parse(dealString);
			console.log(getNow(true) + " Found in storage: " + dealString);
			if (!deal["played"]) deal["played"] = []
			if (!deal["ctx"]) deal["ctx"] = ""
			deal["dealer"] = getDealerDirection()
			deal["vul"] = getAbsoluteVulnerability()
			deal["seat"] = mySeat()
			deal["user"] = getActivePlayer()
		}
		if (!dealString || !deal["number"]) {
			deal = {}
			deal["number"] = dealnumber
			deal["dealer"] = getDealerDirection()
			deal["vul"] = getAbsoluteVulnerability()
			deal["seat"] = mySeat()
			deal["user"] = getActivePlayer()
			deal["hand"] = ""
			deal["ctx"] = ""
			deal["dummy"] = ""
			deal["played"] = []
	
			localStorage.setItem('BidWithBrill' + dealnumber, JSON.stringify(deal))
		}
		console.log(getNow(true) + " onMyDeal", JSON.stringify(deal))
	} catch (error) {
		console.log(getNow(true) + " onMyDeal error", error)
	}
	newdeal = false
	return deal;
	
}

getAbsoluteVulnerability = function() {
	// Convert from relative (us/them) to absolute (NS/EW) vulnerability format
	// Brill API expects: None, NS, EW, All
	const seat = mySeat();
	const isNS = (seat === 'N' || seat === 'S');
	const weAreVul = areWeVulnerable() === '@v';
	const theyAreVul = areTheyVulnerable() === '@V';

	// Convert relative to absolute
	const nsVul = isNS ? weAreVul : theyAreVul;
	const ewVul = isNS ? theyAreVul : weAreVul;

	if (nsVul && ewVul) return 'All';
	if (nsVul) return 'NS';
	if (ewVul) return 'EW';
	return 'None';
}

//Script
