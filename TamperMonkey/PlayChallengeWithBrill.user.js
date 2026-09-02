// ==UserScript==
// @name         Play BBO challenges with Brill
// @namespace    https://github.com/ThorvaldAagaard/BBOalert
// @version      0.1.0
// @description  Plays BBO robot challenges with Brill. Standalone - does NOT need the BBOalert extension.
// @match        *://www.bridgebase.com/v3/*
// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery/3.5.1/jquery.min.js
// @grant        none
// @run-at       document-idle
// ==/UserScript==
//
// GENERATED FILE - do not edit. Run: node Scripts/build-challenge-userscript.js
// Sources: src/iframe/*, TamperMonkey/src/shim.js, TamperMonkey/src/lobby.js,
//          Custom/PlayWithBrill.js
//
// @grant none keeps this in page context, the same reason CuebidsWithBrill.user.js needs it:
// under a sandbox, `window` is a wrapper and the page's own globals are invisible.
//
// NOT 'use strict' - deliberately. PlayWithBrill's blocks pass state between hooks via
// implicit globals (`newdeal = true` with no var), which strict mode turns into errors.
//
// SAFETY: the lobby driver only ever enters a challenge whose c_challenge_style is
// ARENA_ROBOT. See TamperMonkey/BBO-lobby-protocol.md.

(function () {
	if (window.top !== window.self) return;
	if (window.__brillChallengeInstalled) return;
	window.__brillChallengeInstalled = true;
	console.log('[brill] PlayChallengeWithBrill starting');

	// Keep jQuery off the page's globals. BBOalert can install it freely because it lives
	// in its own iframe; here we share a document with BBO's Angular app, so leaving
	// window.$ reassigned is asking for a conflict. noConflict(true) hands us a private
	// instance and restores window.$ / window.jQuery to exactly what they were.
	var $ = window.jQuery ? window.jQuery.noConflict(true) : null;
	var jQuery = $;
	if (!$) {
		console.error('[brill] jQuery not present - the @require failed to load');
		return;
	}

	// ==========================================================================
	// vendored: src/iframe/globals.js
	// ==========================================================================
	/**
	 * Global variables
	 */
	
	// Global variables
	const CHECKED_CHAR = "✔";
	const COLLAPSED_BG_COLOR = "yellow";
	const COLLAPSED_TEXT_COLOR = "black";
	let DEBUG = false;
	
	let navDivDisplayed = false;
	let biddingBoxExists = false;
	let biddingBoxDisplayed = false;
	let explainCallDisplayed = false;
	let auctionBoxDisplayed = false;
	let lastDealNumber = '';
	let LHOpponent = '';
	let RHOpponent = '';
	let opponentChanged = '';
	let currentAuction = '??';
	let tableDisplayed = false;
	let activePlayer = '';
	let lastSelectedCall = '';
	let OKbuttonVisible = false;
	let OKbuttonPressed = false;
	let cardLead = '';
	let playedCards = '';
	let callExplanationPanelDisplayed = false;
	let myCardsDisplayed = '';
	let dealEndPanelDisplayed = false;
	let announcementDisplayed = false;
	let finalContractDisplayed = false;
	let announcementText = '';
	let notificationDisplayed = false;
	let notificationText = '';
	let lastChatMessage = '';
	let lastUserExplanation = '';
	let recordNewAlerts = true;
	let ctxArray = [];
	let blogNames = [];
	let blogIds = [];
	let eventClick = new Event('click');
	let callText = "";
	let updateText = "";
	let updateCount = 0;
	let cbData = "";
	let scriptList = [];
	let alertTableCursor = 0;
	let clipBoard = navigator.clipboard;
	let alertData = "";
	let alertOriginal = "";
	let alertTable = alertData.split("\n");
	let version = document.title;
	let logText = `${version}\n${navigator.userAgent}\n`;
	let bidSymbolMap = new Map();
	let alertHistoryMap = new Map();
	let PWD = parent.window.document;
	let openProfileBBOid = "";
	let openProfileBBOalertURL = "";
	let listTinyURL = new Map();
	
	let apiKey = "";
	
	E_onAnyMutation = new Event('onAnyMutation');
	E_onBiddingBoxCreated = new Event('onBiddingBoxCreated');
	E_onBiddingBoxDisplayed = new Event('onBiddingBoxDisplayed');
	E_onBiddingBoxHidden = new Event('onBiddingBoxHidden');
	E_onAuctionBoxDisplayed = new Event('onAuctionBoxDisplayed');
	E_onAuctionBegin = new Event('onAuctionBegin');
	E_onAuctionBoxHidden = new Event('onAuctionBoxHidden');
	E_onAuctionEnd = new Event('onAuctionEnd');
	E_onFinalContractDisplayed = new Event('onFinalContractDisplayed');
	E_onNewAuction = new Event('onNewAuction');
	E_onMyAuction = new Event('onMyAuction');
	E_onPartnerAuction = new Event('onPartnerAuction');
	E_onLHOAuction = new Event('onLHOAuction');
	E_onRHOAuction = new Event('onRHOAuction');
	E_onNewActivePlayer = new Event('onNewActivePlayer');
	E_onExplainCallDisplayed = new Event('onExplainCallDisplayed');
	E_onExplainCallHidden = new Event('onExplainCallHidden');
	E_onBiddingBoxRemoved = new Event('onBiddingBoxRemoved');
	E_onLogin = new Event('onLogin');
	E_onLogoff = new Event('onLogoff');
	E_onAnyOpponentChange = new Event('onAnyOpponentChange');
	E_onNewDeal = new Event('onNewDeal');
	E_onNewCallSelected = new Event('onNewCallSelected');
	E_onOKbuttonDisplayed = new Event('onOKbuttonDisplayed');
	E_onOKbuttonHidden = new Event('onOKbuttonHidden');
	E_onOKbuttonPressed = new Event('onOKbuttonPressed');
	E_onCallLevelSelected = new Event('onCallLevelSelected');
	E_onMyLead = new Event('onMyLead');
	E_onNewPlayedCard = new Event('onNewPlayedCard');
	E_onCallExplanationPanelDisplayed = new Event('onCallExplanationPanelDisplayed');
	E_onMyCardsDisplayed = new Event('onMyCardsDisplayed');
	E_onDealEnd = new Event('onDealEnd');
	E_onAnnouncementDisplayed = new Event('onAnnouncementDisplayed');
	E_onNotificationDisplayed = new Event('onNotificationDisplayed');
	E_onNewChatMessage = new Event('onNewChatMessage');
	E_onDataLoad = new Event('onDataLoad');
	E_onTableDisplayed = new Event('onTableDisplayed');
	E_onTableHidden = new Event('onTableHidden');
	E_onProfileBoxDisplayed = new Event('onProfileBoxDisplayed');
	E_onProfileBoxHidden = new Event('onProfileBoxHidden');
	
	function bidArray(bids) {
	    let bidarr = [];
	    for (var i = 0; i < bids.length; i = i + 2) {
	        bidarr.push(bids.slice(i, i + 2));
	    }
	    return bidarr;
	}
	allBids = bidArray("1C1D1H1S1N2C2D2H2S2N3C3D3H3S3N4C4D4H4S4N5C5D5H5S5N6C6D6H6S6N7C7D7H7S7N");
	
	
	// Release notes : stable version
	srcRelnotes = "https://docs.google.com/document/d/e/2PACX-1vQ_8Iv9HbBj4nWDXSY_kHsW1ZP_4c4dbOVO0GLuObJc1vFu_TBg9oV6ZJXMWd_tLITOj7i6WaJBeZJI/pub";
	if (document.title.includes("Beta")) {
	    // Release notes : beta version
	    srcRelnotes = "https://docs.google.com/document/d/e/2PACX-1vQlUHDS_XUimLvS722emrPw5Bzpyjm8lPKxZ9jwVwOVJVq0zQd3fawML8sylwxYIGKiZB60eJENB2TG/pub";
	}
	
	function initGlobals() {
	    navDivDisplayed = false;
	    biddingBoxExists = false;
	    biddingBoxDisplayed = false;
	    explainCallDisplayed = false;
	    auctionBoxDisplayed = false;
	    lastDealNumber = '';
	    LHOpponent = '';
	    RHOpponent = '';
	    opponentChanged = '';
	    currentAuction = '??';
	    tableDisplayed = false;
	    activePlayer = '';
	    lastSelectedCall = '';
	    OKbuttonVisible = false;
	    OKbuttonPressed = false;
	    cardLead = '';
	    playedCards = '';
	    callExplanationPanelDisplayed = false;
	    myCardsDisplayed = '';
	    dealEndPanelDisplayed = false;
	    announcemenDisplayed = false;
	    finalContractDisplayed = false;
	    announcementText = '';
	    notificationDisplayed = false;
	    notificationText = '';
	    lastChatMessage = '';
	    lastUserExplanation = '';
	    recordNewAlerts = true;
	    ctxArray = [];
	    blogNames = [];
	    blogIds = [];
	    eventClick = new Event('click');
	    callText = "";
	    updateText = "";
	    updateCount = 0;
	    cbData = "";
	    scriptList = [];
	    alertTableCursor = 0;
	    clipBoard = navigator.clipboard;
	    lastDealNumber = '';
	    alertData = "";
	    alertOriginal = "";
	    alertTable = alertData.split("\n");
	    version = document.title;
	    logText = version + '\n';
	    logText = logText + navigator.userAgent + '\n';
	    bidSymbolMap = new Map();
	    alertHistoryMap = new Map();
	    PWD = parent.window.document;
	}
	
	BBOalertButtonHTML = `<div id="bboalert-button" style="height: 46px; width: 46px;">
	<svg viewBox="0 0 170 170">
	<rect style="fill:#0000ff;stroke-width:0.9695" id="rect156" width="170.91365" height="118.80013" x="-0.010153236" y="51.866543"></rect>
	<text xml:space="preserve" style="font-style:normal;font-variant:normal;font-weight:bold;font-stretch:normal;font-size:48px;line-height:1.25;font-family:sans-serif;-inkscape-font-specification:'sans-serif, Bold';font-variant-ligatures:normal;font-variant-caps:normal;font-variant-numeric:normal;font-variant-east-asian:normal;fill:#ffffff;fill-opacity:1;stroke:none" x="23.255058" y="100.05701" id="text4208">
	<tspan id="tspan4206" x="23.255058" y="100.05701" style="font-style:normal;font-variant:normal;font-weight:bold;font-stretch:normal;font-size:48px;font-family:sans-serif;-inkscape-font-specification:'sans-serif, Bold';font-variant-ligatures:normal;font-variant-caps:normal;font-variant-numeric:normal;font-variant-east-asian:normal">
	BBO</tspan>
	</text>
	<text xml:space="preserve" style="font-style:normal;font-variant:normal;font-weight:bold;font-stretch:normal;font-size:40px;line-height:1.25;font-family:sans-serif;-inkscape-font-specification:'sans-serif, Bold';font-variant-ligatures:normal;font-variant-caps:normal;font-variant-numeric:normal;font-variant-east-asian:normal;fill:#ffffff;fill-opacity:1;stroke:none" x="24.207453" y="147.17821" id="text11098">
	<tspan id="tspan11096" x="24.207453" y="147.17821" style="font-style:normal;font-variant:normal;font-weight:bold;font-stretch:normal;font-size:40px;font-family:sans-serif;-inkscape-font-specification:'sans-serif, Bold';font-variant-ligatures:normal;font-variant-caps:normal;font-variant-numeric:normal;font-variant-east-asian:normal">
	Alert</tspan>
	</text>
	<rect style="fill:#0000ff;stroke-width:1.42343" id="rect30888" width="85.957748" height="28.492575" x="84.932518" y="23.367001"></rect>
	<text xml:space="preserve" style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-size:26.6667px;line-height:1.25;font-family:sans-serif;-inkscape-font-specification:'sans-serif, Normal';font-variant-ligatures:normal;font-variant-caps:normal;font-variant-numeric:normal;font-variant-east-asian:normal;fill:#ffffff;fill-opacity:1;stroke:none" x="87.319008" y="47.640041" id="text42194">
	<tspan id="tspan42192" x="87.319008" y="47.640041" style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-size:26.6667px;font-family:sans-serif;-inkscape-font-specification:'sans-serif, Normal';font-variant-ligatures:normal;font-variant-caps:normal;font-variant-numeric:normal;font-variant-east-asian:normal">
	Alert</tspan>
	</text>
	<rect style="fill:#ff0000;stroke-width:1.67427" id="rect62412" width="84.908524" height="28.701813" x="0.023992665" y="23.292852"></rect>
	<text xml:space="preserve" style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-size:26.6667px;line-height:1.25;font-family:sans-serif;-inkscape-font-specification:'sans-serif, Normal';font-variant-ligatures:normal;font-variant-caps:normal;font-variant-numeric:normal;font-variant-east-asian:normal;fill:#ffffff;fill-opacity:1;stroke:none" x="14.900936" y="44.923931" id="text65176">
	<tspan id="tspan65174" x="14.900936" y="44.923931" style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-size:26.6667px;font-family:sans-serif;-inkscape-font-specification:'sans-serif, Normal';font-variant-ligatures:normal;font-variant-caps:normal;font-variant-numeric:normal;font-variant-east-asian:normal">
	Stop</tspan>
	</text>
	<rect style="fill:#008000" id="rect121122" width="74.317535" height="24.015348" x="48.270805" y="-0.2446395"></rect>
	<text xml:space="preserve" style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-size:26.6667px;line-height:1.25;font-family:sans-serif;-inkscape-font-specification:'sans-serif, Normal';font-variant-ligatures:normal;font-variant-caps:normal;font-variant-numeric:normal;font-variant-east-asian:normal;fill:#ffffff" x="55.604736" y="21.237953" id="text141696">
	<tspan id="tspan141694" x="55.604736" y="21.237953" style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-size:26.6667px;font-family:sans-serif;-inkscape-font-specification:'sans-serif, Normal';font-variant-ligatures:normal;font-variant-caps:normal;font-variant-numeric:normal;font-variant-east-asian:normal">
	Pass</tspan>
	</text>
	<rect style="fill:#ff0000" id="rect148238" width="48.301918" height="23.611641" x="122.58834" y="-0.2446395"></rect>
	<rect style="fill:#0000ff;stroke-width:1.01631" id="rect148262" width="48.321392" height="24.015348" x="-0.050585855" y="-0.2446395"></rect>
	<text xml:space="preserve" style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-size:26.6667px;line-height:1.25;font-family:sans-serif;-inkscape-font-specification:'sans-serif, Normal';font-variant-ligatures:normal;font-variant-caps:normal;font-variant-numeric:normal;font-variant-east-asian:normal;fill:#ffffff" x="129.7393" y="21.326912" id="text153080">
	<tspan id="tspan153078" x="129.7393" y="21.326912" style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-size:26.6667px;font-family:sans-serif;-inkscape-font-specification:'sans-serif, Normal';font-variant-ligatures:normal;font-variant-caps:normal;font-variant-numeric:normal;font-variant-east-asian:normal">
	X</tspan>
	</text>
	<text xml:space="preserve" style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-size:26.6667px;line-height:1.25;font-family:sans-serif;-inkscape-font-specification:'sans-serif, Normal';font-variant-ligatures:normal;font-variant-caps:normal;font-variant-numeric:normal;font-variant-east-asian:normal;fill:#ffffff" x="6.6074371" y="21.106106" id="text157330">
	<tspan id="tspan157328" x="6.6074371" y="21.106106" style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-size:26.6667px;font-family:sans-serif;-inkscape-font-specification:'sans-serif, Normal';font-variant-ligatures:normal;font-variant-caps:normal;font-variant-numeric:normal;font-variant-east-asian:normal">
	XX</tspan>
	</text>
	</svg>
	</div>`

	// ==========================================================================
	// vendored: src/iframe/functions.js
	// ==========================================================================
	function getBBOalertHeaderMsg() {
		try {
			var r = alertTable[0].split(',')[1];
			if (r == undefined) return '';
			if (alertTable[0].toUpperCase().indexOf('BBOALERT') == -1) return '';
			return ' ' + r.trim() + ' ';
		} catch {
			return '';
		}
	}
	
	/**
	 * execute script
	 * @param {string} S Javascript code
	 * @param {string} CR  context field (optional) 
	 * @param {string} C  current bidding context (optional) 
	 * @param {string} BR  call field (optional) 
	 * @param {string} B  current call (optional)
	 * @returns R = value of reserved variable
	 */
	function userScript(S, CR, C, BR, B) {
		R = '';
		try {
			eval(S);
			if (DEBUG) console.log(S);
			if (DEBUG) console.log(CR);
			if (DEBUG) console.log(C);
			if (DEBUG) console.log(BR);
			if (DEBUG) console.log(B);
			if (DEBUG) console.log(R);
			return R;
		} catch (error) {
			addLog('Error in script');
			addLog(error);
			addLog(S);
			return 'ERROR';
		}
	}
	
	/**
	 * tranform string s into RegExp object
	 * @param {string} s
	 * @returns {RegExp}
	 */
	function makeRegExp(s) {
		var re;
		if (s.startsWith('/') && s.endsWith('/')) {
			re = new RegExp(s.slice(1, s.length - 1));
		} else {
			var ref = s.replace(/\*/g, '.');
			ref = ref.replace(/_/g, '.');
			re = new RegExp(ref);
		}
		return re;
	}
	
	/**
	 * @ignore
	 */
	function setPageReload() {
		var nb = parent.document.querySelector('.navBarClass');
		if (nb == null) return;
		var nadc = nb.querySelector('.nonAnonDivClass');
		if (nadc == null) return;
		var lob = nadc.querySelector('button');
		if (lob == null) return;
		if (lob.onclick == null) lob.onclick = preparePageReload;
	}
	
	/**
	 * @ignoreµ
	 */
	function preparePageReload() {
		var db = parent.document.querySelector('mat-dialog-container');
		if (db == null) return;
		var bt = db.querySelector('button');
		if (bt == null) return;
		bt.onclick = pageReload;
	}
	
	/**
	 * @ignore
	 */
	function pageReload() {
		setOptions(false);
	}
	
	/**
	 * @ignore
	 */
	function normalize(s) {
		return elimine2Spaces(s.replace(/,+/g, ';')).trim();
	}
	
	
	/**
	 * @ignore
	 */
	function addLog(txt) {
		logText = logText + getNow(true) + ',' + txt + '\n';
	}
	
	/**
	 * @ignore
	 */
	function exportLogData() {
		bboalertLog(version + "<br>" + (logText.split('\n').length - 1) + ' records exported');
		writeToClipboard(logText);
	}
	
	/**
	 * @ignore
	 */
	var triggerDragAndDrop = function (selectorDrag, selectorDrop, dist) {
	
		// function for triggering mouse events
		var fireMouseEvent = function (type, elem, centerX, centerY) {
			var evt = parent.document.createEvent('MouseEvents');
			evt.initMouseEvent(type, true, true, window, 1, 1, 1, centerX, centerY, false, false, false, false, 0, elem);
			elem.dispatchEvent(evt);
		};
	
		// fetch target elements
		var elemDrag = parent.document.querySelector(selectorDrag);
		var elemDrop = parent.document.querySelector(selectorDrop);
		if (!elemDrag || !elemDrop) return false;
	
		// calculate positions
		var pos = elemDrag.getBoundingClientRect();
		var center1X = Math.floor((pos.left + pos.right) / 2);
		var center1Y = Math.floor((pos.top + pos.bottom) / 2);
		pos = elemDrop.getBoundingClientRect();
		var center2X = Math.floor((pos.left + pos.right) / 2) + dist;
		var center2Y = Math.floor((pos.top + pos.bottom) / 2);
	
		// mouse over dragged element and mousedown
		fireMouseEvent('mousemove', elemDrag, center1X, center1Y);
		fireMouseEvent('mouseenter', elemDrag, center1X, center1Y);
		fireMouseEvent('mouseover', elemDrag, center1X, center1Y);
		fireMouseEvent('mousedown', elemDrag, center1X, center1Y);
	
		// start dragging process over to drop target
		fireMouseEvent('dragstart', elemDrag, center1X, center1Y);
		fireMouseEvent('drag', elemDrag, center1X, center1Y);
		fireMouseEvent('mousemove', elemDrag, center1X, center1Y);
		fireMouseEvent('drag', elemDrag, center2X, center2Y);
		fireMouseEvent('mousemove', elemDrop, center2X, center2Y);
	
		// trigger dragging process on top of drop target
		fireMouseEvent('mouseenter', elemDrop, center2X, center2Y);
		fireMouseEvent('dragenter', elemDrop, center2X, center2Y);
		fireMouseEvent('mouseover', elemDrop, center2X, center2Y);
		fireMouseEvent('dragover', elemDrop, center2X, center2Y);
	
		// release dragged element on top of drop target
		fireMouseEvent('drop', elemDrop, center2X, center2Y);
		fireMouseEvent('dragend', elemDrag, center2X, center2Y);
		fireMouseEvent('mouseup', elemDrag, center2X, center2Y);
	
		return true;
	};
	
	/**
	 * @ignore
	 */
	function isUndoCommand(t) {
		if (t.search('Undo') != -1) return true;
		if (t.search('悔牌') != -1) return true;
		if (t.search('Fortryd') != -1) return true;
		if (t.search('Ακύρωση') != -1) return true;
		if (t.search('Deshacer') != -1) return true;
		if (t.search('בטל') != -1) return true;
		if (t.search('Visszavonás') != -1) return true;
		if (t.search('やり直す') != -1) return true;
		if (t.search('Ongedaan maken') != -1) return true;
		if (t.search('Angre') != -1) return true;
		if (t.search('Cofnij') != -1) return true;
		if (t.search('Desfazer') != -1) return true;
		if (t.search('Cere înapoi') != -1) return true;
		if (t.search('Geri al') != -1) return true;
		if (t.search('Merusak') != -1) return true;
		if (t.search('Zpět') != -1) return true;
		if (t.search('Откат') != -1) return true;
		if (t.search('Vraćanje') != -1) return true;
		if (t.search('Pöydän asetukset') != -1) return true;
		if (t.search('重來') != -1) return true;
		if (t.search('Ångra') != -1) return true;
		return false;
	}
	
	/**
	 * @ignore
	 */
	function isTable(t) {
		if (t.search('→Table') != -1) return true;
		if (t.search('→Маса') != -1) return true;
		if (t.search('→牌 桌') != -1) return true;
		if (t.search('→Bord') != -1) return true;
		if (t.search('→Tisch') != -1) return true;
		if (t.search('→Τραπέζι') != -1) return true;
		if (t.search('→Table') != -1) return true;
		if (t.search('→Asztal') != -1) return true;
		if (t.search('→Tavolo') != -1) return true;
		if (t.search('→テーブル') != -1) return true;
		if (t.search('→Tafel') != -1) return true;
		if (t.search('→Stół') != -1) return true;
		if (t.search('→Mesa') != -1) return true;
		if (t.search('→Masa') != -1) return true;
		if (t.search('→Tabel') != -1) return true;
		if (t.search('→Stůl') != -1) return true;
		if (t.search('→Стол') != -1) return true;
		if (t.search('→Stol') != -1) return true;
		if (t.search('→Pöytä') != -1) return true;
		if (t.search('→牌桌') != -1) return true;
		return false;
	}
	
	/**
	 * @ignore
	 */
	function isOpponents(t) {
		if (t.search('→Opponents') != -1) return true;
		if (t.search('→Противници') != -1) return true;
		if (t.search('→对手') != -1) return true;
		if (t.search('→Modstandere') != -1) return true;
		if (t.search('→Gegner') != -1) return true;
		if (t.search('→Αντίπαλοι') != -1) return true;
		if (t.search('→Oponentes') != -1) return true;
		if (t.search('→Adversaires') != -1) return true;
		if (t.search('→Ellenfelek') != -1) return true;
		if (t.search('→Avversari') != -1) return true;
		if (t.search('→対戦相手') != -1) return true;
		if (t.search('→Tegenstanders') != -1) return true;
		if (t.search('→Motstandere') != -1) return true;
		if (t.search('→Przeciwnicy') != -1) return true;
		if (t.search('→Adversários') != -1) return true;
		if (t.search('→Adversari') != -1) return true;
		if (t.search('→Rakipler') != -1) return true;
		if (t.search('→Penentang') != -1) return true;
		if (t.search('→Soupeři') != -1) return true;
		if (t.search('→Оппоненты') != -1) return true;
		if (t.search('→Protivnici') != -1) return true;
		if (t.search('→Vastustajille') != -1) return true;
		if (t.search('→Motståndare') != -1) return true;
		return false;
	}
	
	
	
	/**
	 * @ignore
	 * match vulnerability and seat conditions in text
	 * @param {*} v 
	 * @param {*} V 
	 * @param {*} s 
	 * @param {*} t 
	 */
	function matchVulSeat(v, V, s, t) {
		// set option only during the first round of bidding
		if (s == '') return '';
		// Check if seat dependence specified
		if ((t.indexOf('@1') > 0) || (t.indexOf('@2') > 0) || (t.indexOf('@3') > 0) || (t.indexOf('@4') > 0)) {
			if (t.indexOf(s) == -1) return 'N';
		}
		// Check if our vulnerability dependence specified
		if ((t.indexOf('@n') > 0) || (t.indexOf('@v') > 0)) {
			if (t.indexOf(v) == -1) return 'N';
		}
		// Check if their vulnerability dependence specified
		if ((t.indexOf('@N') > 0) || (t.indexOf('@V') > 0)) {
			if (t.indexOf(V) == -1) return 'N';
		}
		return 'Y';
	}
	
	/**
	 * Check if element e is visible
	 */
	function isVisible(e) {
		if (e == null) return false;
		if (e == undefined) return false;
		return !!(e.offsetWidth || e.offsetHeight || e.getClientRects().length);
	}
	
	/**
	 * get formatted actual date and time
	 * if secs=true resultion up to seconds
	 */
	function getNow(secs) {
		var now = new Date();
		var yyyy = now.getFullYear().toString();
		var m = now.getMonth() + 1;
		var mm = m.toString();
		if (mm.length == 1) mm = '0' + mm;
		var dd = now.getDate().toString();
		if (dd.length == 1) dd = '0' + dd;
		var hh = now.getHours().toString();
		if (hh.length == 1) hh = '0' + hh;
		var mn = now.getMinutes().toString();
		if (mn.length == 1) mn = '0' + mn;
		if (!secs) return yyyy + mm + dd + "_" + hh + ":" + mn;
		var ss = now.getSeconds().toString();
		if (ss.length == 1) ss = '0' + ss;
		return yyyy + mm + dd + "_" + hh + ":" + mn + ":" + ss;
	}
	
	/**
	 * elimine spaces and tabs from string str
	 */
	function elimine2Spaces(str) {
		var s = str.replace(/\t+/g, ' ');
		s = s.replace(/\u0020\u0020+/g, ' ');
		return s;
	}
	
	
	// Elimine spaces and tabs
	function elimineSpaces(str) {
		var s = str.replace(/\s+/g, '');
		s = s.replace(/\t+/g, '');
		return s;
	}
	
	/**
	 * @ignore
	 */
	function readFromClipboard(callback) {
		navigator.clipboard.readText().then((cbData) => {
			callback(cbData);
		});
	}
	
	/**
	 * copy string txt to the clipboard
	 */
	function writeToClipboard(txt) {
		navigator.clipboard.writeText(txt).then(function () { }, function () { });
	}
	
	/**
	 * Strip context ctx from leading passes
	 */
	function stripContext(ctx) {
		if (ctx.startsWith('------')) return ctx.substr(6);
		if (ctx.startsWith('----')) return ctx.substr(4);
		if (ctx.startsWith('--')) return ctx.substr(2);
		return ctx;
	}
	
	/**
	 * @ignore
	 */
	function decodeOption(opt) {
		if (opt.length != 2) return opt;
		optText = '';
		if (opt.slice(0, 1) == '1') optText = optText + '@1';
		if (opt.slice(0, 1) == '2') optText = optText + '@2';
		if (opt.slice(0, 1) == '3') optText = optText + '@3';
		if (opt.slice(0, 1) == '4') optText = optText + '@4';
		if (opt.slice(0, 1) == '5') optText = optText + '@1@2';
		if (opt.slice(0, 1) == '6') optText = optText + '@3@4';
		if (opt.slice(1, 2) == '1') optText = optText + '@n@N';
		if (opt.slice(1, 2) == '2') optText = optText + '@v@N';
		if (opt.slice(1, 2) == '3') optText = optText + '@n@V';
		if (opt.slice(1, 2) == '4') optText = optText + '@v@V';
		if (opt.slice(1, 2) == '5') optText = optText + '@n';
		if (opt.slice(1, 2) == '6') optText = optText + '@v';
		if (opt.slice(1, 2) == '7') optText = optText + '@N';
		if (opt.slice(1, 2) == '8') optText = optText + '@V';
		return optText;
	}
	
	/**
	 * @ignore
	 */
	function translateCall(call) {
		if (call == 'D') return 'Db';
		if (call == 'Dbl') return 'Db';
		if (call == 'Ktr.') return 'Db';
		if (call == 'Ktr') return 'Db';
		if (call == 'ктр') return 'Db';
		if (call == 'X') return 'Db';
		if (call == 'Rktr') return 'Rd';
		if (call == 'рктр') return 'Rd';
		if (call == 'Rdbl') return 'Rd';
		if (call == 'RD') return 'Rd';
		if (call == 'XX') return 'Rd';
		if (call == 'p') return '--';
		if (call == 'P') return '--';
		if (call == 'Pass') return '--';
		if (call == 'Pas') return '--';
		if (call == 'Paso') return '--';
		if (call == 'пас') return '--';
		el = call;
		if (el.length > 1) {
			el = el.substr(0, 2);
			if (el.charCodeAt(1) == 9827) {
				return el[0] + 'C';
			}
			if (el.charCodeAt(1) == 9830) {
				return el[0] + 'D';
			}
			if (el.charCodeAt(1) == 9829) {
				return el[0] + 'H';
			}
			if (el.charCodeAt(1) == 9824) {
				return el[0] + 'S';
			}
			return el[0] + 'N';
		}
		return el;
	}
	
	/**
	 * get seat number tag of the openeer
	 */
	function getSeatNr() {
		var c = getContext();
		if (c.startsWith('------')) return '@4';
		if (c.startsWith('----')) return '@3';
		if (c.startsWith('--')) return '@2';
		return '@1';
	}
	
	/**
	 * Get actual bidding context
	 */
	function getContext() {
		var nd;
		if ((nd = getNavDiv()) == null) return '??';
		var ctx = '';
		var bs = nd.querySelector('bridge-screen');
		if (bs == null) {
			return "??";
		}
		var auctionBox = nd.querySelector('auction-box');
		if (auctionBox == null) {
			return "??";
		}
		var auction = auctionBox.querySelectorAll('.auction-cell');
		if (auction.length == 0) {
			return "";
		}
		for (var i = 0; i < auction.length; i++) {
			el = translateCall(auction[i].textContent);
			ctx = ctx + el;
			//	Translate Double, Redouble and Pass from different language interfaces
		}
		return ctx;
	}
	
	
	/**
	 * @ignore
	 */
	function matchContextOld(refContext, actContext) {
		if (refContext == actContext) return true;
		if (refContext.length != actContext.length) return false;
		for (var j = 0; j < refContext.length; j++) {
			if (refContext.substr(j, 1) == '_') continue;
			if (refContext.substr(j, 1) == '*') continue;
			if (refContext.substr(j, 1) != actContext.substr(j, 1)) return false;
		}
		return true;
	}
	
	/**
	 * Check if actual bidding context matches refeence context from the table
	 */
	function matchContext(refContext, actContext) {
		var re;
		try {
			if (refContext.startsWith('/') && refContext.endsWith('/')) {
				re = new RegExp(refContext.slice(1, refContext.length - 1));
				return re.test(actContext);
			}
			if (refContext.startsWith('/')) {
				var idx_dollar = refContext.indexOf("$");
				var ref = refContext.replaceAll("\/", "").replaceAll("$", "");
				if (idx_dollar != -1) ref = ref + "$";
				re = new RegExp(ref);
				return re.test(actContext);
			}
			if (matchContextOld(refContext, actContext)) return true;
			var ref = refContext.replace(/\*/g, '.');
			ref = ref.replace(/_/g, '.');
			ref = '^' + ref + '$';
			re = new RegExp(ref);
			if (!re.test(actContext)) return false;
			return (actContext.match(re)[0].length == actContext.length);
		} catch {
			return false;
		}
	}
	
	
	/**
	 * @ignore
	 */
	function clearOptionsSelector() {
		var optionsSelector = document.getElementById('bboalert-ds');
		if (optionsSelector == null) return;
		for (var i = optionsSelector.options.length; i > 2; i--) {
			optionsSelector.remove(i);
		}
		optionsSelector.selectedIndex = 0;
	}
	
	function saveRecentURL() {
		var fileSelector = document.getElementById("bboalert-menu-file");
		if (fileSelector == null) return;
		var txt = "";
		for (var i = 9; i < fileSelector.options.length; i++) {
			txt = txt + fileSelector.options[i].label + "," + fileSelector.options[i].value + "\n";
		}
		window.localStorage.setItem("BBOAlertRecentURL", txt);
	}
	
	function loadRecentURL() {
		var fileSelector = document.getElementById("bboalert-menu-file");
		if (fileSelector == null) return;
		var txt = "";
		for (let i = fileSelector.options.length - 1; i >= 9; i--) {
			fileSelector.options.remove(i);
		}
		txt = window.localStorage.getItem("BBOAlertRecentURL");
		if (txt == null) return;
		var t = txt.split("\n");
		for (let i = 0; i < t.length; i++) {
			let r = t[i].split(",");
			if (DEBUG) console.log(i + " " + r[0] + " " + r[1]);
			if (r[0] == "") continue;
			importedURL = r[1];
			addRecentURL(r[0], r[1]);
		}
	}
	
	
	function clearRecentURL() {
		var fileSelector = document.getElementById("bboalert-menu-file");
		if (fileSelector == null) return;
		for (var i = fileSelector.options.length - 1; i >= 9; i--) {
			fileSelector.options.remove(i);
		}
		saveRecentURL();
		$(fileSelector.options[8]).hide();
		addBiddingScenariosURL();
	}
	
	function addBiddingScenariosURL() {
		importedURL = "https://raw.githubusercontent.com/ADavidBailey/Practice-Bidding-Scenarios/main/-PBS.txt";
		addRecentURL("Bidding Scenarios", importedURL);
	}
	
	function addRecentURL(label, url) {
		var fileSelector = document.getElementById("bboalert-menu-file");
		if (fileSelector == null) return;
		if (label == "") return;
		if (url == "") return;
		if (makeDirectLink(importedURL) != url) return;
		var lbl = label.replaceAll("<br>", "");
		lbl = lbl.replaceAll("<b>", "");
		lbl = lbl.replaceAll("</b>", "");
		for (var i = 9; i < fileSelector.options.length; i++) {
			if (fileSelector.options[i].value == url) {
				fileSelector.options.remove(i);
			}
		}
		var opt = new Option(lbl, url);
		opt.style.backgroundColor = "LightGray";
		fileSelector.add(opt, 9);
		$(fileSelector.options[8]).show();
		saveRecentURL();
	}
	
	function isSettingON(idx) {
		var sm = $("#bboalert-menu-settings")[0];
		if (idx >= sm.options.length) return false;
		return sm.options[idx].textContent.startsWith(CHECKED_CHAR);
	}
	
	function saveSettings() {
		var sm = $("#bboalert-menu-settings")[0];
		// Save settings to cache
		var s = '';
		for (var i = 1; i < sm.options.length; i++) {
			if (sm.options[i].textContent.startsWith(CHECKED_CHAR)) s = s + 'Y';
			else s = s + 'N';
		}
		localStorage.setItem("BBOalertSettings", s);
	}
	
	function restoreSettings() {
		var s = localStorage.getItem('BBOalertSettings');
		if (s == null) s = "NNNN"
		var sm = $("#bboalert-menu-settings")[0];
		for (var i = 0; i < s.length; i++) {
			if (s.charAt(i) == 'Y')
				if (!sm.options[i + 1].textContent.startsWith(CHECKED_CHAR))
					sm.options[i + 1].textContent = CHECKED_CHAR + sm.options[i + 1].textContent;
			if (s.charAt(i) == 'N')
				if (sm.options[i + 1].textContent.startsWith(CHECKED_CHAR))
					sm.options[i + 1].textContent = sm.options[i + 1].textContent.slice(1);
		}
		hideUnusedOptions();
	}
	
	/**
	 * display text on the BBOalert blue panel
	 */
	function bboalertLog(txt) {
		var p1 = document.getElementById('bboalert-p1');
		if (p1 == null) return;
		p1.innerHTML = '';
		p1.innerHTML = txt;
	}
	
	function addBBOalertLog(txt) {
		var p1 = document.getElementById('bboalert-p1');
		if (p1 == null) return;
		p1.innerHTML = p1.innerHTML + txt;
	}
	
	
	/**
	 * @ignore
	 */
	function documentOnKeyup(key) {
		if (key.altKey) {
			setChatMessage('Alt' + key.key.toUpperCase(), true);
			sendChat();
		}
	}
	
	
	/**
	 * @ignore
	 */
	function getPartnerAlert() {
		var partnerContext = getContext().slice(0, -4);
		var partnerCall = getContext().slice(-4, -2);
		return findAlert(partnerContext, partnerCall);
	}
	
	
	
	/**
	 * sen chat text to both opponents
	 */
	function sendMessageToOpponents(text) {
		sendPrivateChat(myOpponent(true), text);
		sendPrivateChat(myOpponent(false), text);
	}
	
	/**
	 * reverse characters in the strin
	 */
	function reverseString(str) {
		return str.split("").reverse().join("");
	}
	
	/**
	 * make element draggeable
	 */
	function dragElement(elmnt) {
		var pos1 = 0,
			pos2 = 0,
			pos3 = 0,
			pos4 = 0;
		if (document.getElementById(elmnt.id + "header")) {
			// if present, the header is where you move the DIV from:
			document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
		} else {
			// otherwise, move the DIV from anywhere inside the DIV:
			elmnt.onmousedown = dragMouseDown;
		}
	
	
		function dragMouseDown(e) {
			e = e || window.event;
			e.preventDefault();
			// get the mouse cursor position at startup:
			pos3 = e.clientX;
			pos4 = e.clientY;
			document.onmouseup = closeDragElement;
			// call a function whenever the cursor moves:
			document.onmousemove = elementDrag;
		}
	
		function elementDrag(e) {
			e = e || window.event;
			e.preventDefault();
			// calculate the new cursor position:
			pos1 = pos3 - e.clientX;
			pos2 = pos4 - e.clientY;
			pos3 = e.clientX;
			pos4 = e.clientY;
			// set the element's new position:
			elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
			elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
		}
	
		function closeDragElement() {
			// stop moving when mouse button is released:
			document.onmouseup = null;
			document.onmousemove = null;
		}
	
	}
	
	function getBBOalertHeader(data) {
		var txt = '';
		var scan = new BBOalertData();
		scan.setData(data);
		while ((txt = scan.getNextLine()) != null) {
			var rec = txt.split(",");
			if (rec.length > 1) {
				if (rec[0].trim().toUpperCase().indexOf('BBOALERT') != -1) {
					if (rec[0].trim() != '') {
						return rec[1].trim();
					}
				}
			}
		}
		return "";
	}
	
	function updateAlertDataAsync(at, callback) {
		function findURL(url, parent) {
			var idx = parent;
			if (parent == -1) return false;
			while (idx != -1) {
				if (urls[idx] == url) return true;
				idx = parents[idx];
			}
			return false;
		}
	
		function addrecs(txt, to, parent) {
			if (txt != null) {
				var ti = txt.split('\n');
				ti.forEach((element) => {
					var r = element.split(',');
					var last = to.length;
					to.push(element);
					var r0 = r[0].trim();
					if ((r0 == 'Import') || (r0 == 'Javascript') || (r0 == '//Javascript')) {
						if (r.length == 1) return;
						if (r.length == 2) {
							var r1 = r[1].trim();
							if (!r1.startsWith("https:")) {
								r2 = URLmap.get(r1);
								if (r2 == undefined) return;
								r[1] = r2;
							}
						}
						if (r.length > 2) {
							URLmap.set(r[1].trim(), r[2].trim());
							return;
						}
						urlOriginal = r[1].trim();
						var url = makeDirectLink(urlOriginal);
						if (findURL(url, parent)) {
							if (DEBUG) console.log('Error : circular reference :');
							if (DEBUG) console.log('to  ' + url);
							if (DEBUG) console.log('in  ' + urls[parent]);
						} else {
							if (DEBUG) console.log(' Reading ' + url);
							urls.push(url);
							parents.push(parent);
							var myIdx = urls.length - 1;
							pending++;
							fetchWebData(url, function (data) {
								if (DEBUG) console.log('Done    ' + url);
								data = HTMLpage2text(data, url, urlOriginal);
								if (DEBUG) console.log('Header  ' + getBBOalertHeader(data));
								addRecentURL(getBBOalertHeader(data), url);
								if (data != '') {
									if (r0 == 'Import') {
										to[last] = [];
										addrecs(data, to[last], myIdx);
									} else {
										to[last] = [];
										JS = data;
										eval(data);
										addrecs("**//Javascript," + url, to[last], myIdx);
									}
								}
							},
								function (error) {
									if (DEBUG) console.log('Error  ' + error + ' ' + url);
									addBBOalertLog('<br>Error<br>' + error + ' ' + url);
									addBBOalertLog('<br>Export Log<br>');
									to[last] = [];
									addrecs(('Error\n' + error + ' ' + url), to[last]);
								});
						}
					}
				});
			}
			pending--;
			if (pending == 0) {
				//			console.timeEnd("Read time");
				timer = Date.now() - timer;
				if (DEBUG) console.log('Total ' + tab.flat(999).length + ' records in ' + timer / 1000 + " secs");
				alertData = parseMarkdown(tab.flat(999).join('\n'));
				callback();
			}
		}
		var tab = [];
		var urls = [];
		var URLmap = new Map();
		var parents = [];
		var pending = 1;
		var timer = Date.now();
		initBBOalertEvents();
		initInfoSelector();
		clearConfigMenu();
		PluginInit();
		addrecs(at, tab, -1);
	}
	
	
	
	function shiftChars(s, d) {
		var s1 = s.split('');
		for (var i = 0; i < s1.length; i++) {
			s1[i] = String.fromCharCode(s1[i].charCodeAt(0) + d);
		}
		return s1.join('');
	}
	
	function loadScript(url) {
		var url1 = makeDirectLink(url);
		if (DEBUG) console.log('Load JS ' + url1);
		var script = document.createElement('script');
		script.src = url1;
		script.type = "text/javascript";
		var head = document.getElementsByTagName("head")[0];
		head.appendChild(script);
	}
	
	function isAutoShortcutsEnabled() {
		return isSettingON(1);
	}
	
	function isCollapseOptionsEnabled() {
		return isSettingON(4);
	}
	
	function isHoverTopEnabled() {
		return isSettingON(2);
	}
	
	function isHoverEnabled() {
		return isSettingON(3);
	}
	
	
	function initBBOalertEvents() {
		var ue = document.body.querySelector("bboalert-events");
		if (ue != null) ue.parentNode.removeChild(ue);
		ue = document.createElement("bboalert-events");
		document.body.appendChild(ue);
		ue = document.body.querySelector("bboalert-events");
		return ue;
	}
	
	
	function addBBOalertEvent(ev, fn) {
		var ue = BBOalertEvents();
		ue.addEventListener(ev, fn, false);
	}
	
	function BBOalertEvents() {
		var ue = document.body.querySelector("bboalert-events");
		if (ue == null) ue = initBBOalertEvents();
		return ue;
	}
	
	
	function beep(f, d) {
		var context = new window.AudioContext();
		var osc = context.createOscillator();
		osc.type = 'square';
		osc.frequency.value = f;
		osc.connect(context.destination);
		osc.start();
		osc.stop(context.currentTime + d);
	}
	
	function openDropbox(url) {
		window.open(url, '', 'width=100,height=100');
	}
	
	function toggleAlertList(el, expandTree) {
		function ulLevel(ul) {
			if (ul.tagName.toLowerCase() != "ul") return -1;
			try {
				return parseInt(ul.classList[1].split("-")[2]);
			} catch {
				return -1;
			}
		}
		var l = $("p,li");
		for (let i = 0; i < l.length; i++) {
			l[i].itemNr = i;
			l[i].level = ulLevel(l[i].parentNode);
		}
		var l0 = el.level;
		var l1 = l[el.itemNr + 1].level;
		//    if (l0 < 0) return;
		var treeVisible = $(l[el.itemNr + 1]).is(":visible");
		for (let i = el.itemNr + 1; i < l.length; i++) {
			if ((l[i].level <= l0) || i == (l.length - 1)) {
				for (let i = 0; i < l.length - 1; i++) {
					if ($(l[i]).is(":visible") && $(l[i + 1]).is(":hidden")) {
						$(l[i]).css("background-color", COLLAPSED_BG_COLOR);
						$(l[i]).children().css("background-color", COLLAPSED_BG_COLOR);
						//					l[i].style.color = COLLAPSED_TEXT_COLOR;
					} else {
						$(l[i]).css("background-color", "");
						$(l[i]).children().css("background-color", "");
					}
				}
				return false;
			}
			if (treeVisible) {
				if (l[i].level > l0) {
					$(l[i]).hide();
				}
			} else {
				if ((l[i].level == l1) || expandTree) {
					$(l[i]).show();
				}
			}
	
		}
	}
	
	
	function replaceSuitSymbolsInRecord(r) {
		var rx = r.split(",");
		if (rx.length < 3) return r;
		switch (rx[0].trim()) {
			case "Option":
				return r;
			case "Import":
				return r;
			case "Alias":
				return r;
			case "Button":
				rx[2] = replaceSuitSymbols(rx[2], "!");
				break;
			case "Shortcut":
				rx[2] = replaceSuitSymbols(rx[2], "!");
				break;
			default:
				rx[0] = replaceSuitSymbols(rx[0], "");
				rx[1] = replaceSuitSymbols(rx[1], "");
				rx[2] = replaceSuitSymbols(rx[2], "!");
				break;
		}
		return rx.join(",");
	}
	
	function replaceSuitSymbols(txt, prefix) {
		var t = txt;
		t = t.replace(/♣/g, prefix + "C");
		t = t.replace(/♧/g, prefix + "C"); // white clubs
		t = t.replace(/♦/g, prefix + "D");
		t = t.replace(/♢/g, prefix + "D"); // white diamonds
		t = t.replace(/♥/g, prefix + "H");
		t = t.replace(/♡/g, prefix + "H"); // white hearts
		t = t.replace(/♠/g, prefix + "S");
		t = t.replace(/♤/g, prefix + "S"); // white spades
		if (prefix == '') t = t.replace(/NT/g, prefix + "N");
		return t;
	}
	
	userScriptMap = new Map();
	function setUserScript(n, f) {
		userScriptMap.set(n, f);
	}
	
	function getUserScript(n) {
		var f = userScriptMap.get(n);
		if (f == undefined) return function () { return "not_found"; };
		else return f;
	}
	
	function scriptArg(S) {
		var i1 = S.indexOf("\(");
		var i2 = S.indexOf("\)");
		if (i1 == -1) return "";
		if (i2 < i1) return "";
		return S.slice(i1 + 1, i2);
	}
	
	function BBOcontext() {
		if (document.title != 'Bridge Base Online') return window.parent.document;
		return document;
	}
	
	function parseMarkdown(data) {
		var txtTable;
		var recList = ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""];
		txtTable = data.split("\n");
		var txt = "";
		var lvl = 0;
		txtTable.forEach(function (l) {
			var l1 = l.replaceAll("\t", "    ").replace("*", "-");
			if (l1.trim().startsWith("- ") && ((l1.indexOf("-") % 4) == 0)) {
				lvl = l1.indexOf("-") / 4 + 1;
				var t = elimine2Spaces(l.trim().substr(1).trim());
				t = t.split("\n")[0];
				var i0 = t.indexOf(" ");
				t0 = t.substr(0, i0);
				t1 = t.substr(i0 + 1);
				var oppsBid = "--";
				if (t0.split(",").length > 1) {
					oppsBid = t0.split(",")[0];
					t = t0.split(",")[1] + "," + t1;
				} else {
					t = t0 + "," + t1;
				}
				t = elimineSpaces(recList[lvl - 1].split(",")[0] + recList[lvl - 1].split(",")[1] + oppsBid + ",") + t;
				recList[lvl] = t;
				txt = txt + t + "\n";
			} else {
				lvl = 0;
				txt = txt + l.trim() + "\n";
				recList[lvl] = elimine2Spaces(l.trim()) + ",,";
			}
		});
		var tr = txt.split("\n");
		for (let i = 0; i < tr.length; i++) {
			tr[i] = replaceSuitSymbolsInRecord(tr[i]);
		}
		return tr.join("\n");
	}
	
	function replaceSpacesByUnderscore(txt) {
		var txt1 = txt.replace(/ /g, '_').slice(0, 40);
		while (txt1.length < 40) txt1 = txt1 + '_';
		return txt1;
	}
	
	function decodeEntities(encodedStr) {
		if (!encodedStr) return '';
		return $.parseHTML(encodedStr)[0].textContent;
	}
	
	$.fn.onAny = function (cb) {
		for (var k in this[0])
			if (k.search('on') === 0)
				this.on(k.slice(2), function (e) {
					// Probably there's a better way to call a callback function with right context, $.proxy() ?
					cb.apply(this, [e]);
				});
		return this;
	};
	
	function downloadTextAsFile(text, fileName) {
		var blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
		// 1. Create a Blob URL
		var url = URL.createObjectURL(blob);
	
		// 2. Create a link element
		var a = document.createElement('a');
	
		// 3. Set attributes
		a.href = url;
		a.download = fileName;
		a.style.display = 'none'; // Hide the link
	
		// Append to body (necessary for a.click() to work in some browsers)
		document.body.appendChild(a);
	
		// 4. Trigger click
		a.click();
	
		// 5. Clean up - Remove the element and revoke the URL
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}

	// ==========================================================================
	// vendored: src/iframe/BBO_DOM.js
	// ==========================================================================
	/**
	 * click OK button programatically
	 */
	function clickOK() {
		setTimeout(function () {
			$(".biddingBoxButtonClass:eq(16)", PWD).trigger("click");
		}, 300);
	}
	
	/**
	 * when OK button appears, click it programatically
	 */
	function confirmBid() {
		var n = 0;
		var t = setInterval(function () {
			n++;
			if (n > 100) clearInterval(t);
			if (buttonOKvisible()) {
				clearInterval(t);
				if (trustedBid) {
					clickOK();
				}
			}
		}, 10);
	}
	
	/**
	 * get main BBO panel div element
	 * @returns div element
	 */
	function getNavDiv() {
		$("#navbar-menu-dropdown-content", PWD).css("z-index", "5001");
		return PWD.getElementById('navDiv');
	}
	/**
	 * returns div element containing chat dialog
	 */
	function getChatDiv() {
		return PWD.getElementById('chatDiv');
	}
	
	/**
	 * returns current BBO user-id
	 */
	function whoAmI() {
		return localStorage.getItem('userID');
	}
	
	/**
	 * @ignore
	 */
	function myDirection() {
		return mySeat();
	}
	
	/**
	 * retrieve my direction from the auction box 'S' 'W' 'N' 'E' or '' if not found
	 */
	function mySeat() {
		return $('.auction-box-header-cell:eq(3)', getNavDiv()).text().trim().slice(0, 1);
	}
	
	function partnerSeat() {
		return $('.auction-box-header-cell:eq(1)', getNavDiv()).text().trim().slice(0, 1);
	}
	
	/**
	 * retrieve our vulnerability tag
	 */
	function ourVulnerability() {
		var vultab = ["", "NS", "EW", "NSEW", "NS", "EW", "NSEW", "", "EW", "NSEW", "", "NS", "NSEW", "", "NS", "EW"];
		var sd = getDealNumber();
		if (sd == '') return '';
		var nd = parseInt(sd);
		if (isNaN(nd)) return '';
		if (nd < 1) return '';
		nd = (nd - 1) % 16;
		if (vultab[nd].includes(mySeat())) return '@v';
		return '@n';
	}
	
	
	/**
	 * check if confirm bids switch is ON
	 * returns 'Y' or 'N'
	 */
	function confirmBidsSet() {
		return localStorage.getItem(whoAmI() + "_confirm_bids") === "y" ? 'Y' : 'N';
	}
	
	/**
	 * check if keyboard entry switch is ON
	 * returns 'Y' or 'N'
	 */
	function keyboardEntrySet() {
		return localStorage.getItem(whoAmI() + "_keyboard_entry") === "y" ? 'Y' : 'N';
	}
	
	/**
	 * check if account setting switch is ON
	 * returns 'Y' 'N' or '' if not found
	 */
	function accountSettingsSet(idx) {
		switch ($($("settings-list ion-toggle", PWD).get(idx)).attr("aria-checked")) {
			case "false":
				return 'N';
			case "true":
				return 'Y';
			default:
				return '';
		}
	}
	
	/**
	 * return true if OK button is visible
	 */
	function buttonOKvisible() {
		return (!$("#navDiv .biddingBoxClass button:eq(16):visible", PWD).length == 0);
	}
	
	/**
	 * return true if OK button is pressed (mouse down)
	 */
	function buttonOKpressed() {
		return ($("#navDiv .biddingBoxClass button:eq(16):visible", PWD).hasClass("cdk-focused"));
	}
	
	/**
	 * display BBOalert panel if on=true. Otherwise hide it
	 */
	function setOptions(on) {
		setTabEvents();
		var adPanel0 = parent.document.getElementById("adpanel0");
		if (adPanel0 == null) return;
		if (on) {
			$("#rightDiv .verticalTabBarClass tab-bar-button", parent.document).not("#bboalert-tab").find(".verticalClass").addClass("covered");
			adPanel0.style.display = 'block';
			if (adPanel0.getBoundingClientRect().width < 350) {
				triggerDragAndDrop('.hDividerClass', '.hDividerClass', (adPanel0.getBoundingClientRect().width) - 400);
			}
		} else {
			$("#rightDiv .verticalTabBarClass tab-bar-button", parent.document).not("#bboalert-tab").find(".verticalClass").removeClass("covered")
			adPanel0.style.display = 'none';
		}
		if (on) {
			$("#bboalert-tab .verticalClass", PWD).css("background-color", "rgb(49, 96, 191)").css("color", "white")
		} else {
			$("#bboalert-tab .verticalClass", PWD).css("background-color", "white").css("color", "black")
		}
	}
	
	/**
	 * @ignore
	 */
	function addBBOalertTab() {
		if (parent.document.getElementById('bboalert-tab') != null) return;
		var rd = parent.document.getElementById('rightDiv');
		if (rd == null) return;
		var vt = rd.querySelector('.verticalTabBarClass');
		if (vt == null) return;
		var tabs = vt.children;
		if (tabs == null) return;
		if (tabs.length < 2) return;
		var t = tabs[1].cloneNode(true);
		t.querySelector('.verticalClass').textContent = 'BBOalert';
		t.id = 'bboalert-tab';
		t.onclick = toggleOptions;
		t.style.color = 'white';
		t.style.display = "none";
		t.backgroundColor = 'red';
		vt.appendChild(t);
		t = parent.document.getElementById('bboalert-tab');
		t.onclick = toggleOptions;
	}
	
	/**
	 * retrieve our vulnerability tag from the auction box
	 */
	function areWeVulnerable() {
		if (mySeat() == '') return '';
		if ($('.auction-box-header-cell:eq(3)', getNavDiv()).hasClass("vulnerable")) return '@v';
		return '@n';
	}
	
	/**
	 * retrieve opponent's vulnerability tag from the auction box
	 */
	function areTheyVulnerable() {
		if (mySeat() == '') return '';
		if ($('.auction-box-header-cell:eq(2)', getNavDiv()).hasClass("vulnerable")) return '@V';
		return '@N';
	}
	
	/**
	 * retrieve current board number
	 */
	function getDealNumber() {
		return $('.vulPanelInnerPanelClass', getNavDiv()).text().trim();
	}
	
	/**
	 * @ignore
	 */
	function setTitle(txt) {
		t = parent.document.querySelectorAll('div.titleSpanClass');
		if (t.length == 0) return;
		for (var i = 0; i < t.length; i++) {
			t[i].textContent = txt;
		}
	}
	
	/**
	 * @ignore
	 */
	function setTitleText(txt) {
		t = parent.document.querySelector('.titleClass');
		if (t == null) return;
		if (isVisible(t)) {
			t.innerText = '';
			setTimeout(function () {
				t.innerText = txt;
			}, 500);
			return;
		}
		t = parent.document.querySelectorAll('div.titleSpanClass');
		if (t.length == 0) return;
		for (var i = 0; i < t.length; i++) {
			t[i].textContent = '';
			setTimeout(function () {
				t[i].textContent = txt;
			}, 500);
		}
	}
	
	/**
	 * retrieve visible chat input element
	 */
	function getVisibleMessageInput() {
		return $(".messageInputClass:visible", getChatDiv()).get(0)
	}
	
	/**
	 * send chat message programatically
	 */
	function sendChat() {
		cr = parent.document.querySelectorAll('.chatRowClass');
		if (cr.length == 0) return;
		var elMessage = getChatInput();
		if (elMessage == null) return;
		cb = getChatSendButton(elMessage);
		if (cb == null) return;
		if (!isVisible(cb)) return;
		cb.click();
	}
	
	/**
	 * send call explanation chat message programatically
	 */
	function sendAlertChat() {
		var elMessage = getChatInput();
		if (elMessage == null) return;
		cb = getChatSendButton(elMessage);
		if (cb == null) return;
		var msgList = replaceSuitSymbols(getChatMessage(), "!").split("<br>");
		var eventInput = new Event('input');
	
		var i = 0;
		var it = setInterval(function () {
			if (i == msgList.length) {
				elMessage.value = "";
				elMessage.dispatchEvent(eventInput);
				clearInterval(it);
			} else {
				elMessage.value = msgList[i];
				elMessage.dispatchEvent(eventInput);
				cb.click();
			}
			i++;
		}, 100);
	}
	
	/**
	 * send chat message text to msg
	 * If send=true send it immediately
	 */
	function setChatInputMessage(msg, send, elMessage) {
		var eventInput = new Event('input');
		if (elMessage == null) return;
		msgList = msg.split(/\\n/);
		if (msgList.length == 1) {
			elMessage.value = msg;
			elMessage.dispatchEvent(eventInput);
			return;
		}
		if (send) {
			for (i = 0; i < msgList.length; i++) {
				elMessage.value = msgList[i];
				elMessage.dispatchEvent(eventInput);
				if (i < msgList.length - 1) sendChat();
			}
		} else { }
	}
	
	/**
	 * send chat message text to msg
	 * If send=true send it immediately
	 */
	function setInputMessage(msg, send, elMessage) {
		if (DEBUG) console.log("setInputMessage 1 " + msg);
		var eventInput = new Event('input');
		if (elMessage == null) return;
		var msgList = msg.split(/\\n/);
		var sb = getChatSendButton(elMessage);
		// if not chat messaqge set text
		if (DEBUG) console.log("setInputMessage sb " + sb);
		if (sb == null) {
			elMessage.value = msgList[0];
			elMessage.dispatchEvent(eventInput);
			return;
		}
		// if only one line set the message text and send if send flag set
		if (msgList.length == 1) {
			elMessage.value = msg;
			elMessage.dispatchEvent(eventInput);
			if (send) sb.click();
			return;
		}
		// multiline message : send all except the last if no send flag
		var i = 0;
		ti = setInterval(() => {
			if (DEBUG) console.log("setInputMessage 2 " + msgList[i]);
			elMessage.value = msgList[i];
			elMessage.dispatchEvent(eventInput);
			if (i < msgList.length - 1) sb.click();
			else {
				if (send) sb.click();
				clearInterval(ti);
			}
			i++;
		}, 100);
	}
	
	/**
	 * send chat message text to msg
	 * If send=true send it immediately
	 */
	function setChatMessage(msg, send) {
		var eventInput = new Event('input');
		var elMessage = getVisibleMessageInput();
		if (elMessage == undefined) return;
		msgList = msg.split(/\\n/);
		if (msgList.length == 1) {
			elMessage.value = msg;
			elMessage.dispatchEvent(eventInput);
			return;
		}
		if (send) {
			for (i = 0; i < msgList.length; i++) {
				elMessage.value = msgList[i];
				elMessage.dispatchEvent(eventInput);
				if (i < msgList.length - 1) sendChat();
			}
		} else {
	
		}
	}
	
	/**
	 * retrieve actual chat message input text
	 */
	function getChatMessage() {
		var elMessage = getVisibleMessageInput();
		if (elMessage == undefined) return '';
		return elMessage.value;
	}
	
	/**
	 * retrieve bidding box element
	 */
	function getBiddingBox() {
		var bb = $("#navDiv .biddingBoxClass", PWD).get(0);
		if (bb == undefined) return null;
		return bb;
	}
	
	/**
	 * retrieve call explain box element
	 */
	function getExplainCallBox() {
		if ((nd = getNavDiv()) == null) return null;
		return nd.querySelector(".explainCallClass");
	}
	
	function getDealEndPanel() {
		if ((nd = getNavDiv()) == null) return null;
		return nd.querySelector(".deal-end-panel");
	}
	
	/**
	 * set explain call box input text
	 */
	function setExplainCallText(txt) {
		var elExplainCallBox = getExplainCallBox();
		if (!isVisible(elExplainCallBox)) return;
		var elInput = elExplainCallBox.querySelector('input');
		if (elInput == null) return;
		var txtar = txt.split("#");
		if (txtar.length == 1) {
			if (txt.length > 39) {
				txtar = ("See chat#" + txt).split("#");
			}
		}
		elInput.value = txtar[0];
		var eventInput = new Event('input');
		elInput.dispatchEvent(eventInput);
		if (txtar.length > 1) {
			setChatMessage(txtar[1]);
		}
	}
	
	function getExplainCallAlert() {
		var b = translateCall($(".headingClass", getExplainCallBox()).text().split(" ").at(-1));
		var c = getContext().substring(0, getContext().indexOf(b));
		return alertHistoryMap.get(c + b);
	}
	
	/**
	 * retrieve explain call box text input element
	 */
	function getExplainCallInput() {
		var elExplainCallBox = getExplainCallBox();
		if (elExplainCallBox == null) return null;
		return elExplainCallBox.querySelector('input');
	}
	
	/**
	 * retrieve bidding box text input element
	 */
	function getExplainInput() {
		var bbox = getBiddingBox();
		if (bbox == null) return null;
		if (!isVisible(bbox)) return null;
		return bbox.querySelector(".mat-form-field-infix").querySelector('input');
	}
	
	/**
	 * retrieve chat text input element
	 */
	function getChatInput() {
		var cd = parent.document.getElementById('chatDiv');
		if (cd == null) return null;
		return cd.querySelector(".messageInputClass");
	}
	
	/**
	 * set bidding box explanation text
	 */
	function setExplainText(txt) {
		var elAlertExplain = getExplainInput();
		if (elAlertExplain == null) return;
		elAlertExplain.value = txt;
		var eventInput = new Event('input');
		elAlertExplain.dispatchEvent(eventInput);
	}
	
	/**
	 * @ignore
	 */
	function isSplitScreen() {
		return localStorage.getItem(whoAmI() + "_general_split") === "y" ? 'true' : 'false';
	}
	
	/**
	 * @ignore
	 */
	function isAdBlockerOn() {
		app = parent.document.getElementById('bbo_app');
		return (app.style.left == "0px");
	}
	
	/**
	 * @ignore
	 */
	function setStatTextDiv() {
		if (parent.document.getElementById('statText') != null) return;
		var st = parent.document.createElement('div');
		st.style.height = '100%';
		st.id = 'statText';
		st.textContent = 'BBOalert';
		is = parent.document.querySelector('.infoStat');
		isp = is.parentNode;
		isp.insertBefore(st, isp.firstChild);
	}
	
	/**
	 * @ignore
	 */
	function setStatText(txt) {
		var st = parent.document.getElementById('statText');
		if (st == null) return;
		st.textContent = txt;
		if (txt != '') {
			st.style.backgroundColor = 'coral';
		} else {
			st.style.backgroundColor = '#e7eaed';
		}
	}
	
	/**
	 * @ignore
	 */
	function setTabEvents() {
		var rd = parent.document.getElementById('rightDiv');
		if (rd == null) return;
		var vt = rd.querySelector('.verticalTabBarClass');
		if (vt == null) return;
		var tabs = vt.children;
		if (tabs == null) return;
		if (tabs.length == 0) return;
		window.xxxx = tabs;
		if (parent.document.querySelector(".verticalTabBarClass").onmouseup == null)
			parent.document.querySelector(".verticalTabBarClass").onmouseup = function () {
				$("tab-bar-button", parent.document).css("pointer-events", "");
			}
		for (var i = 0; i < tabs.length; i++) {
			if (tabs[i].textContent.search('BBOalert') == -1) {
				if (tabs[i].onmousedown == null) tabs[i].onmousedown = function () {
					$("tab-bar-button", parent.document).has(".selected.covered").css("pointer-events", "none");
					setOptionsOff();
				}
			}
		}
	}
	
	/**
	 * retrieve my partner's user id
	 */
	function myPartner() {
		return $('bridge-screen deal-viewer .directionClass:contains("' + partnerSeat() + '")', PWD)
			.siblings("div.nameDisplayClass").text()
	}
	
	/**
	 * retrieve active player direction and user id
	 */
	function getActivePlayer() {
		var name = $('bridge-screen deal-viewer .nameBarClass', PWD)
			.filter(function () {
				return this.style.backgroundColor === "rgb(255, 206, 0)";
			}).find("div:lt(2)").text();
		if (name == '') {
			name = $('bridge-screen deal-viewer .nameBarClass', PWD)
				.filter(function () {
					return this.style.backgroundColor === "rgb(204, 204, 154)";
				}).find("div:lt(2)").text();
		}
		// return direction + UID in lower case
		return name.charAt(0) + name.substring(1).toLowerCase();
	}
	
	/**
	 *	retrieve opponent's user id. LHO if lho=true 
	 * @param {*} lho 
	 */
	function myOpponent(lho) {
		if (lho) return $('bridge-screen deal-viewer .directionClass:contains("' + directionLHO() + '")', PWD)
			.siblings("div.nameDisplayClass").text();
		return $('bridge-screen deal-viewer .directionClass:contains("' + directionRHO() + '")', PWD)
			.siblings("div.nameDisplayClass").text()
	}
	
	/**
	 * retrieve Alert button state (true = ON)
	 */
	function isAlertON() {
		try {
			return $("#navDiv .biddingBoxClass button:eq(15):visible", PWD)[0].style.backgroundColor != "rgb(255, 255, 255)";
		}
		catch {
			return false;
		}
	}
	
	/**
	 * set alert button state (on=true = ON)
	 */
	function setAlert(on) {
		if (isAlertON() == on) return on;
		$("#navDiv .biddingBoxClass button:eq(15):visible", PWD).click();
		return on;
	}
	
	/**
	 * @ignore
	 */
	function tableType() {
		// no deal number = no table
		if (getDealNumber() == '') return 'no';
		if ($('#navDiv deal-viewer .nameDisplayClass:visible', PWD).text().includes("Robot")) return 'robot';
		if ($('#navDiv deal-viewer .nameDisplayClass:visible', PWD).filter(function () {
			return this.textContent.toLowerCase() == whoAmI().toLowerCase();
		}).text() == '') return 'kibitz';
		// if no score panel -> practice table
		if ($('#navDiv deal-viewer .score-panel:visible', PWD).text() == '') return "practice";
		return 'game';
	}
	
	/**
	 * retrieve current chat destination
	 */
	function getCurrentChatDestination() {
		return $('#chatDiv .messageInputDivClass .channelButtonClass:eq(0)', PWD).text();
	}
	
	/**
	 * @ignore
	 */
	function getChatDestinationMenuItem(t) {
		var mi = parent.$('#chatDiv menu-item div');
		for (var i = 0; i < mi.length; i++) {
			if (mi[i].textContent.trim().toLowerCase() == t.toLowerCase()) {
				return mi[i];
			}
			if (mi[i].textContent.trim() == "→" + t) {
				return mi[i];
			}
			if (t == 'Table') {
				if (isTable(mi[i].textContent)) return mi[i];
			}
			if (t == 'Opponents') {
				if (isOpponents(mi[i].textContent)) return mi[i];
			}
		}
		return null;
	}
	
	function isChatDestinationOK(t) {
		var cb = parent.$('#chatDiv .messageInputDivClass .channelButtonClass')[0];
		if (cb.textContent.slice(1).toLowerCase() == t.toLowerCase()) return true;
		if (t == 'Table') {
			if (isTable(cb.textContent)) return true;
		}
		if (t == 'Opponents') {
			if (isOpponents(cb.textContent)) return true;
		}
		return false;
	}
	
	/**
	 * set chat destinatiop to t
	 */
	function setChatDestination(t) {
		if (isChatDestinationOK(t)) return;
		var cb = parent.$('#chatDiv .messageInputDivClass .channelButtonClass')[0];
		var ok = false;
		parent.$('#chatDiv .menuClass').hide();
		parent.$('#chatDiv .messageInputDivClass .channelButtonClass')[0].click();
		var dmi = getChatDestinationMenuItem(t);
		setTimeout(function () {
			if (dmi != null) {
				dmi.click();
				ok = true;
			}
			parent.$('#chatDiv .menuClass').hide();
		}, 100);
	}
	
	/**
	 * set chat destination to table
	 */
	function setChatToTable() {
		if (isTable(getCurrentChatDestination())) return;
	}
	
	/**
	 * send chat message to specified user id
	 */
	function sendPrivateChat(uid, text) {
		var t = text;
		if (!t.endsWith('\\n')) t = t + '\\n';
		var od = parent.$('#chatDiv .messageInputDivClass .channelButtonClass')[0].textContent;
		setChatDestination('Private');
		//    var cd = $('#chatDiv .messageInputDivClass .channelButtonClass span');
		var cd = parent.$('#chatDiv .getStringDialogClass .messageInputClass');
		var bt = parent.$('#chatDiv .getStringDialogClass button');
		setTimeout(function () {
			cd[0].value = uid;
			var eventInput = new Event('input');
			cd[0].dispatchEvent(eventInput);
			bt[0].click();
			setChatMessage(t, true);
			setChatDestination(od);
		}, 200);
	}
	
	/**
	 * retrieve my hand into a string
	 */
	function getMyHand() {
		return getHandBySeat(mySeat());
	}
	
	/**
	 * retrieve partner's hand if visible
	 */
	function getPartnerHand() {
		return getHandBySeat(partnerSeat());
	}
	
	function getHandBySeat(seat) {
		var zidx = ("SWNE".indexOf(seat) + 1).toString();
		return $('#navDiv .cardClass .topLeft:visible', PWD).filter(function () {
			return this.parentElement.parentElement.parentElement.style.zIndex.startsWith(zidx)
		}).text().replaceAll("10", "T");
	}
	
	/**
	 * retrieve auction box element. Returns undefined if none found
	 * 
	 */
	function getAuctionBox() {
		return parent.$('bridge-screen .auctionBoxClass')[0];
	}
	
	function getCard(index) {
		return $('#navDiv .cardClass .topLeft', PWD).filter(function () {
			return this.parentElement.parentElement.parentElement.style.zIndex == index.toString();
		}).text().replaceAll("10", "T");
	}
	
	function getLastChatMessaage() {
		return $("#chatDiv .chatOutputClass chat-list-item:eq(-1)", PWD).text()
	}
	
	function getPlayedCards() {
		return getCard(90) + getCard(91) + getCard(92) + getCard(93);
	}
	
	function getAnnouncementPanel() {
		return parent.$("bridge-screen .announcementPanelClass")[0];
	}
	
	function getNotificationPanel() {
		return parent.$("bridge-screen .notificationClass")[0];
	}
	
	function getCallExplanationPanel() {
		return parent.$("bridge-screen .callExplanationClass")[0];
	}
	
	function getCallExplanationText() {
		return parent.$("bridge-screen .callExplanationClass .textClass").text();
	}
	
	function getChatSendButton(inp) {
		return $(inp).parent().parent().parent().parent().parent().next().get(0)
	}
	
	function hover_bboalert() {
		try {
			var t = window.parent.document.getElementById('bboalert-tab');
			var rd = window.parent.document.getElementById('rightDiv');
			var vt = rd.querySelector('.verticalTabBarClass');
			var tabs = vt.querySelectorAll('.verticalClass');
			if (t.onmouseenter == null) t.onmouseenter = function () {
				if (isHoverEnabled()) {
					setOptions(true);
					parent.$("#bboalert-tab")[0].focus();
				}
			};
			for (var i = 0; i < tabs.length; i++) {
				if (tabs[i].textContent.search('BBOalert') == -1) {
					if (tabs[i].onmouseenter == null) tabs[i].onmouseenter = function () {
						if (isHoverEnabled()) {
							setOptionsOff();
							window.parent.document.activeElement.blur();
							if ((this.className.indexOf("selected") == -1) || ($("#adpanel0").width() == 0)) {
								this.click();
							}
						}
					};
				}
			}
		} catch { }
	}
	
	function getFinalContractPanel() {
		try {
			return parent.$("bridge-screen .tricksPanelClass")[0];
		} catch {
			return null;
		}
	}
	
	function isDebuggingTable() {
		if ((nd = getNavDiv()) == null) return false;
		var nd1 = nd.querySelectorAll('.nameDisplayClass');
		if (nd1 == null) return false;
		if (nd1.length != 4) return false;
		for (var i = 0; i < 4; i++) {
			if (nd1[i].textContent != whoAmI()) return false;
		}
		return true;
	}
	
	function partnerDirection() {
		var md = myDirection();
		if (md == "S") return "N";
		if (md == "W") return "E";
		if (md == "N") return "S";
		if (md == "E") return "W";
		return '';
	}
	
	function directionRHO() {
		var md = myDirection();
		if (md == "S") return "E";
		if (md == "W") return "S";
		if (md == "N") return "W";
		if (md == "E") return "N";
		return '';
	}
	
	function directionLHO() {
		var md = myDirection();
		if (md == "S") return "W";
		if (md == "W") return "N";
		if (md == "N") return "E";
		if (md == "E") return "S";
		return '';
	}
	
	function getLanguage() {
		return $("html", PWD).attr("lang");
	}
	
	function redisplayBiddingBox(time = 100) {
		var bb = getBiddingBox();
		if (!isVisible(bb)) return;
		bb.style.display = "none";
		setTimeout(function () {
			bb.style.display = "inline-block";
		}, time);
	}
	
	
	function getBiddingBoxButtons() {
		elBiddingButtons = $("#navDiv .biddingBoxClass .biddingBoxButtonClass", PWD).toArray();
		if (elBiddingButtons.length == 0) return null;
		return elBiddingButtons;
	}
	
	/**
	 * Clear explanation text field
	 */
	function clearAlert() {
		elAlertExplain = getExplainInput();
		if (elAlertExplain == null) return;
		elAlertExplain.value = "";
		eventInput = new Event('input');
		elAlertExplain.dispatchEvent(eventInput);
	}
	
	function openAccountTab() {
		$('#rightDiv .verticalClass:eq(3):not(.selected)', PWD).click();
	}
	
	function openMessageTab() {
		$('#rightDiv .verticalClass:eq(0):not(.selected)', PWD).click();
	}
	
	function getMyCall() {
		var c = $("#navDiv .biddingBoxClass button:lt(15):visible", PWD).filter(function () {
			return (this.style.backgroundColor == "rgb(255, 206, 0)");
		}).text().replaceAll(" ", "");
		return translateCall(c);
	}
	
	/**
	 * @ignore
	 */
	function setBiddingButtonEvents() {
		// get bidding box button labels
		var biddingButtonsText = $("#navDiv .biddingBoxClass button", PWD).off('mousedown touchstart')
			.map(function () { return this.textContent.trim() }).get();
		$("#navDiv .biddingBoxClass button", PWD).on('mousedown touchstart', function (event) {
			// find which button has been pressed
			$(".mat-ripple-element", this).remove();
			//		var buttonIndex = biddingButtonsText.indexOf(event.target.textContent.trim());
			if (DEBUG) console.log(event.target.tagName);
			var buttonElement = event.target;
			// If you hit the span element, get its parent
			if (event.target.tagName != "BUTTON") {
				buttonElement = event.target.parentElement;
			}
			var buttonIndex = getBiddingBoxButtonIndexByText(buttonElement.textContent.trim());
			if (DEBUG) console.log(buttonIndex);
			if (buttonIndex < 0) return;
			// if call level button pressed
			if ((buttonIndex >= 0) && (buttonIndex <= 6)) {
				callText = (buttonIndex + 1).toString();
				// if suit button pressed
			} else if (buttonIndex <= 11) {
				callText = callText.charAt(0) + "1234567CDHSN".charAt(buttonIndex);
				// if other buttons pressed
			} else {
				switch (buttonIndex) {
					case 12:
						callText = "--"; break;
					case 13:
						callText = "Db"; break;
					case 14:
						callText = "Rd"; break;
					case 15:
						if (DEBUG) console.log("Alert pressed");
						addLog('click:[Alert]');
						if (isAlertON()) {
							setExplainText('');
							setChatMessage('', false);
						}
						return;
					case 16:
						if (DEBUG) console.log("OK pressed ");
						addLog('click:[OK]');
						saveAlert();
						sendAlertChat();
						return;
				}
			}
			// if call level selected
			if (callText.length == 1) {
				addLog('click:[' + callText + ' ]');
				if ((confirmBidsSet() != 'N')) clearAlert();
				if (DEBUG) console.log('Selected level :' + " > " + callText);
				// if call selected
			} else {
				addLog('click:[' + callText + ' ]');
				getAlert();
				if ((confirmBidsSet() == 'Y')) confirmBid(trustedBid);
				if (DEBUG) console.log('Selected call  :' + " > " + callText);
			}
		}
		);
	}
	
	function getBiddingBoxButtonIndexByText(txt) {
		if (DEBUG) console.log("getBiddingBoxButtonIndexByText " + txt);
		var buttons = getBiddingBoxButtons();
		if (buttons == null) return -1;
		for (var i = 0; i < buttons.length; i++) {
			if (DEBUG) console.log("getBiddingBoxButtonIndexByText " + txt + " " +
				buttons[i].textContent.trim() + " " + i);
			if (buttons[i].textContent.trim() == txt.trim()) return i;
		}
		return -1;
	}
	
	function disableSplitScreenSwitch() {
		if ($($("settings-list ion-toggle", PWD).get(0)).attr("aria-checked"))
			$($("settings-list ion-toggle", PWD).get(0)).attr("disabled", "true");
	}
	
	function getPlayerAtSeat(seat) {
		return $(".nameBarDivClass", getNavDiv()).filter(function () {
			return (this.textContent.startsWith(seat));
		}).find(".nameDisplayClass").text();
	}
	
	function getOpenProfile() {
		var pp = parent.document.querySelector('profile-popup');
		if (pp == null) return null;
		if (!isVisible(pp)) return null;
		return pp;
	}
	
	function getOpenProfileBBOid() {
		var pp = getOpenProfile();
		if (pp == null) return "";
		return pp.querySelector('name-tag span').firstChild.textContent.trim()
	}
	
	function getOpenProfileBBOalertURL() {
		var info = $("profile-popup .otherInfoClass", PWD).text();
		if (!info.includes("https://")) return "";
		return info.substring(info.lastIndexOf("https://")).trim();
	}
	
	function loadBBOalertURLinProfile() {
		var url = getOpenProfileBBOalertURL();
		if (url == "") return;
		importedURL = url;
		readNewData("BBOalert\nImport," + importedURL);
	}
	
	function addBBOalertButtonToProfile() {
		var pp = getOpenProfile();
		if (pp == null) return;
		$('.bboalertProfileButtonClass', pp).remove();
		var url = getOpenProfileBBOalertURL();
		if (url == "") return;
		importedURL = url;
		loadBBOalertWebDataFile(importedURL, importedURL,
			function (data) {
				var txt = data;
				if (getDataType(txt) == "BBOalert") {
					var button = document.createElement("button");
					button.className = "bboalertProfileButtonClass";
					button.textContent = "Import BBOalert data";
					button.onclick = function () {
						setOptions(true);
						$('#bttab-bboalert').click();
						readNewData("BBOalert\nImport," + importedURL);
					};
					var pp = getOpenProfile();
					pp.querySelector('.otherInfoClass').after(button);
				}
			},
			function (error) {
				console.log("Error loading BBOalert data from " + importedURL + " : " + error);
			});
	}
	
	function removeBBOalertButtonFromProfile() {
		$('profile-popup .bboalertProfileButtonClass', PWD).remove();
	}
	// ==========================================================================
	// vendored: src/iframe/BBOobserverHandlers.js
	// ==========================================================================
	
	function onAnyMutation() {
	    setBBOalertButton(isSettingON(8));
	    partnershipOptions();
	    checkOptionsVulnerability();
	    setOptionColors();
	    if ($("#adpanel2").length == 1) {
	        if (parent.document.activeElement.tagName.toLowerCase() == "input") {
	            if (!parent.$("#rightDiv")[0].contains(parent.document.activeElement)) {
	                $("#adpanel2")[0].inputObject = parent.document.activeElement;
	                if (parent.document.activeElement.onclick == null) {
	                    parent.document.activeElement.onclick = function () {
	                        toggleButtons(this);
	                    };
	                }
	            }
	        }
	    }
	    hover_bboalert();
	    disableSplitScreenSwitch();
	    BBOalertEvents().dispatchEvent(E_onAnyMutation);
	    execUserScript('%onAnyMutation%');
	}
	
	function onBiddingBoxCreated() {
	    lastDealNumber = '';
	    LHOpponent = '';
	    RHOpponent = '';
	    activePlayer = '';
	    BBOalertEvents().dispatchEvent(E_onBiddingBoxCreated);
	    execUserScript('%onBiddingBoxCreated%');
	}
	
	function onBiddingBoxDisplayed() {
	    setBiddingButtonEvents();
	    //    setExplainInputClickEvents();
	    var elAlertExplain = getExplainInput();
	    if (elAlertExplain.onclick == null) {
	        elAlertExplain.onclick = function () {
	            toggleButtons(this);
	        };
	    }
	    lastUserExplanation = '';
	    elAlertExplain.onkeyup = inputOnKeyup;
	    elAlertExplain.oninput = inputChanged;
	    //    elAlertExplain.onfocus = inputOnFocus;
	    getExplainInput().setAttribute("maxlength", "69");
	    BBOalertEvents().dispatchEvent(E_onBiddingBoxDisplayed);
	    execUserScript('%onBiddingBoxDisplayed%');
	}
	
	function onBiddingBoxHidden() {
	    BBOalertEvents().dispatchEvent(E_onBiddingBoxHidden);
	    execUserScript('%onBiddingBoxHidden%');
	}
	
	function onAuctionBoxDisplayed() {
	    BBOalertEvents().dispatchEvent(E_onAuctionBoxDisplayed);
	    execUserScript('%onAuctionBoxDisplayed%');
	    setTimeout(function () {
	        if (getContext() == '') {
	            BBOalertEvents().dispatchEvent(E_onAuctionBegin);
	            bidSymbolMap.clear();
	            alertHistoryMap.clear();
	            execUserScript('%onAuctionBegin%');
	        }
	    }, 200);
	}
	
	function onAuctionBoxHidden() {
	    activePlayer = '';
	    BBOalertEvents().dispatchEvent(E_onAuctionBoxHidden);
	    execUserScript('%onAuctionBoxHidden%');
	    var ctx = getContext();
	    if ((ctx.length >= 8) && (ctx.endsWith('------'))) {
	        BBOalertEvents().dispatchEvent(E_onAuctionEnd);
	        execUserScript('%onAuctionEnd%');
	    }
	}
	
	function onFinalContractDisplayed() {
	    BBOalertEvents().dispatchEvent(E_onFinalContractDisplayed);
	    execUserScript('%onFinalContractDisplayed%');
	}
	
	function onNewAuction() {
	    if (currentAuction == '') bidSymbolMap.clear();
	    if (currentAuction != '')
	        if (currentAuction != '??') {
	            ctxArray = bidArray(stripContext(getContext()));
	            BBOalertEvents().dispatchEvent(E_onNewAuction);
	            execUserScript('%onNewAuction%');
	            if (DEBUG) console.log("Active player " + activePlayer);
	            if (activePlayer.slice(0, 1) == directionRHO()) {
	                let txt = findAlertText(getContext().slice(0, -2), getContext().slice(-2));
	                BBOalertEvents().dispatchEvent(E_onPartnerAuction);
	                execUserScript('%onPartnerAuction%');
	            }
	            if (activePlayer.slice(0, 1) == directionLHO()) {
	                if (DEBUG) console.log("My bid " + getContext().slice(-2));
	                BBOalertEvents().dispatchEvent(E_onMyAuction);
	                execUserScript('%onMyAuction%');
	            }
	            if (activePlayer.slice(0, 1) == myDirection()) {
	                if (DEBUG) console.log("RHO bid " + getContext().slice(-2));
	                BBOalertEvents().dispatchEvent(E_onRHOAuction);
	                execUserScript('%onRHOAuction%');
	            }
	            if (activePlayer.slice(0, 1) == partnerDirection()) {
	                if (DEBUG) console.log("LHO bid " + getContext().slice(-2));
	                BBOalertEvents().dispatchEvent(E_onLHOAuction);
	                execUserScript('%onLHOAuction%');
	            }
	        }
	}
	
	function onNewActivePlayer() {
	    BBOalertEvents().dispatchEvent(E_onNewActivePlayer);
	    execUserScript('%onNewActivePlayer%');
	}
	
	function onExplainCallDisplayed() {
	    // TODO: handle text longer than 39 characters
	    var fa = new BBOalertFind();
	    getExplainCallInput().onkeyup = inputOnKeyup;
	    getExplainCallInput().oninput = inputChanged;
	//    $(getExplainCallBox()).draggable();
	//    getExplainCallInput().setAttribute("maxlength", "69");
	    //    getExplainCallBox().onfocus = inputOnFocus;
	    var x = $(".headingClass", getExplainCallBox())[0];
	    var bok = $(getExplainCallBox()).find("button")[0].onclick = function () {
	        sendAlertChat();
	    }
	    x.onclick = function () {
	        var b = translateCall($(".headingClass", getExplainCallBox()).text().split(" ").at(-1));
	        var c = getContext().substring(0, getContext().indexOf(b));
	        setExplainCallText(fa.findAlert(c,b).substring(0,39));
	        if(fa.trustedBid) $(getExplainCallBox()).find("button").click();
	    };
	    var e = getExplainCallInput();
	    if (e.onclick == null) {
	        e.onclick = function () {
	            toggleButtons(this);
	        };
	    }
	//    if (getExplainCallInput().value == "") setExplainCallText(getExplainCallAlert().substring(0,39));
	    if (getExplainCallInput().value == "") {
	        var b = translateCall($(".headingClass", getExplainCallBox()).text().split(" ").at(-1));
	        var c = getContext().substring(0, getContext().indexOf(b));
	        setExplainCallText(fa.findAlert(c,b).substring(0,39));
	        if(fa.trustedBid) $(getExplainCallBox()).find("button").click();
	    }
	//    getExplainCallBox().style.width = "auto";
	//    getExplainCallBox().style.height = "auto";
	    BBOalertEvents().dispatchEvent(E_onExplainCallDisplayed);
	    execUserScript('%onExplainCallDisplayed%');
	}
	
	function onExplainCallHidden() {
	    BBOalertEvents().dispatchEvent(E_onExplainCallHidden);
	    execUserScript('%onExplainCallHidden%');
	}
	
	function onBiddingBoxRemoved() {
	    setBiddingButtonEvents();
	    BBOalertEvents().dispatchEvent(E_onBiddingBoxRemoved);
	    execUserScript('%onBiddingBoxRemoved%');
	}
	
	function checkNewVersion() {
	    var oldVersion = localStorage.getItem("BBOalertVersion");
	    var curVersion = document.title;
	    if (curVersion.split(".").length > 3) return;
	    if (oldVersion != curVersion) {
	        setTimeout(function () {
	            localStorage.setItem("BBOalertVersion", curVersion);
	            alert("\nNew BBOalert version loaded : " + curVersion + 
	                "\n\nPlease read release notes on the 'Documents' tab");
	        }, 100);
	    }
	}
	
	function openRelnotes() {
	    setOptions(true);
	    $("#bttab-info").click();
	}
	
	function onNavDivDisplayed() {
	    if (DEBUG) console.log("Iframe navDiv displayed");
	    // complete initial setup
	    parent.document.querySelector(".logoutBlock button")
	    setUI();
	    setTabEvents();
	    addBBOalertTab();
	    alertData = localStorage.getItem('BBOalertCache');
	    if (alertData == null) alertData = 'BBOalert\n';
	    if (alertData == "") alertData = 'BBOalert\n';
	    alertOriginal = alertData;
	    openAccountTab();
	    openMessageTab();
	    restoreSettings();
	    loadTinyURL();
	    setOptions(!isSettingON(7));
	    bboalertLog(version + "<br>Reading data<br>");
	    setTimeout(() => {
	        updateAlertDataAsync(alertOriginal, function () {
	            alertTable = alertData.split("\n");
	            saveAlertTableToClipboard();
	            processTable();
	            displayHeaders();
	            addBBOalertLog("<br>" + alertTable.length + " records from cache");
	            var elMessage = getChatInput();
	            elMessage.onkeyup = inputOnKeyup;
	            elMessage.oninput = inputChanged;
	            if (elMessage.onclick == null) {
	                elMessage.onclick = function () {
	                    toggleButtons(this);
	                };
	            }
	            setPageReload();
	            setTabEvents();
	            partnershipOptions();
	            setTimeout(function () {
	                setOptions(!isSettingON(7));
	            }, 200);
	//            restoreSettings();
	            hideUnusedOptions();
	            BBOalertEvents().dispatchEvent(E_onLogin);
	            execUserScript('%onLogin%');
	            checkNewVersion();
	            setBBOalertButton(isSettingON(8));
	        });
	    }, 500);
	}
	
	function onNavDivHidden() {
	    if (DEBUG) console.log("Iframe navDiv hidden " + alertOriginal.length);
	    localStorage.setItem('BBOalertCache', alertOriginal);
	    setButtonPanel(false);
	    setOptionsOff();
	    initGlobals();
	    BBOalertEvents().dispatchEvent(E_onLogoff);
	    execUserScript('%onLogoff%');
	}
	
	function onAnyOpponentChange() {
	    if (!biddingBoxExists) return;
	    opponentChanged = '';
	    if (myOpponent(true) != LHOpponent) {
	        opponentChanged = 'L';
	        LHOpponent = myOpponent(true);
	    }
	    if (myOpponent(false) != RHOpponent) {
	        opponentChanged = opponentChanged + 'R';
	        RHOpponent = myOpponent(false);
	    }
	    BBOalertEvents().dispatchEvent(E_onAnyOpponentChange);
	    execUserScript('%onAnyOpponentChange%');
	}
	
	function onNewDeal() {
	    activePlayer = '';
	    BBOalertEvents().dispatchEvent(E_onNewDeal);
	    execUserScript('%onNewDeal%');
	}
	
	function onNewCallSelected() {
	    if (DEBUG) console.log(lastSelectedCall);
	    if (lastSelectedCall.length == 2) {
	        BBOalertEvents().dispatchEvent(E_onNewCallSelected);
	        execUserScript('%onNewCallSelected%');
	    }
	    if (lastSelectedCall.length == 1) {
	        BBOalertEvents().dispatchEvent(E_onCallLevelSelected);
	        execUserScript('%onCallLevelSelected%');
	    }
	}
	
	function onOKbuttonDisplayed() {
	    BBOalertEvents().dispatchEvent(E_onOKbuttonDisplayed);
	    execUserScript('%onOKbuttonDisplayed%');
	}
	
	function onOKbuttonHidden() {
	    BBOalertEvents().dispatchEvent(E_onOKbuttonHidden);
	    execUserScript('%onOKbuttonHidden%');
	}
	
	function onOKbuttonPressed() {
	    OKbuttonPressed = true;
	    BBOalertEvents().dispatchEvent(E_onOKbuttonPressed);
	    execUserScript('%onOKbuttonPressed%');
	}
	
	
	function onNewLead() {
	    if (myDirection() != "") {
	        if (getMyHand().length == 24) {
	            BBOalertEvents().dispatchEvent(E_onMyLead);
	            execUserScript('%onMyLead%');
	        }
	    }
	}
	
	function onNewPlayedCard() {
	    if (playedCards != '') {
	        BBOalertEvents().dispatchEvent(E_onNewPlayedCard);
	        execUserScript('%onNewPlayedCard%');
	    }
	}
	
	function onCallExplanationPanelDisplayed() {
	//    getCallExplanationPanel().draggable();
	    BBOalertEvents().dispatchEvent(E_onCallExplanationPanelDisplayed);
	    execUserScript('%onCallExplanationPanelDisplayed%');
	}
	
	function onMyCardsDisplayed() {
	    lastUserExplanation = '';
	    BBOalertEvents().dispatchEvent(E_onMyCardsDisplayed);
	    execUserScript('%onMyCardsDisplayed%');
	}
	
	
	function onDealEndPanelDisplayed() {
	    BBOalertEvents().dispatchEvent(E_onDealEnd);
	    execUserScript('%onDealEnd%');
	}
	
	function onAnnouncementDisplayed() {
	//    getAnnouncementPanel().draggable();
	    BBOalertEvents().dispatchEvent(E_onAnnouncementDisplayed);
	    execUserScript('%onAnnouncementDisplayed%');
	}
	
	function onNotificationDisplayed() {
	    BBOalertEvents().dispatchEvent(E_onNotificationDisplayed);
	    execUserScript('%onNotificationDisplayed%');
	}
	
	function onNewChatMessage() {
	    BBOalertEvents().dispatchEvent(E_onNewChatMessage);
	    execUserScript('%onNewChatMessage%');
	}
	
	function onTableDisplayed() {
	    setTabEvents();
	    BBOalertEvents().dispatchEvent(E_onTableDisplayed);
	    execUserScript('%onTableDisplayed%');
	}
	
	
	function onTableHidden() {
	    BBOalertEvents().dispatchEvent(E_onTableHidden);
	    execUserScript('%onTableHidden%');
	}

	// ==========================================================================
	// vendored: TamperMonkey/src/shim.js (overrides the above)
	// ==========================================================================
	// ---------------------------------------------------------------- BBOalert shim
	//
	// The vendored files (globals / functions / BBO_DOM / BBOobserver / BBOobserverHandlers)
	// are the parts of BBOalert that actually understand the BBO page. They reference a
	// handful of things that live in the parts we do NOT vendor - the alert engine
	// (BBOalert.js, BBOalertFind.js), the data store (BBOalertData.js) and the panel UI
	// (BBOalertUI.js, BBOalertOptions.js, BBOalertPlugin.js).
	//
	// This file supplies those references. Two kinds:
	//
	//   REAL   - execUserScript / getScript / scriptList. These are the script dispatch
	//            mechanism and must behave exactly as BBOalert does, because PlayWithBrill's
	//            control flow is built on them. Copied from BBOalert.js.
	//   STUB   - the alerting and panel UI. We are not alerting and we have no panel, so
	//            these are no-ops. They exist only so the vendored code does not throw.
	//
	// Nothing here may be 'use strict': PlayWithBrill's blocks assign implicit globals
	// (e.g. `newdeal = true` with no var), which is how state crosses between blocks under
	// BBOalert. Under strict mode every one of those becomes a ReferenceError.
	
	// ---- REAL: alert-engine globals ------------------------------------------------
	//
	// execUserScript() passes these into userScript(), and the observer handlers read
	// trustedBid. All three are declared in BBOalert.js (lines 493-494) which we do not
	// vendor, so without them execUserScript throws ReferenceError on its FIRST call - which
	// is inside the observer bootstrap, so nothing ever starts and the only symptom is
	// silence. Found by diffing declarations in the non-vendored files against everything
	// the vendored set reads; these three are the complete list.
	var foundContext = '';
	var foundCall = '';
	var trustedBid = false;
	
	// ---- REAL: script dispatch (verbatim behaviour from BBOalert.js) ----------------
	
	// scriptList entries have the shape produced by setScriptList():
	//     "//Script,<name>," + "\n" + <code lines joined by \n>
	// getScript() concatenates every entry with a matching name, which is what lets a
	// user script define the same hook twice and have both bodies run.
	function getScript(scriptName) {
		var scriptText = '';
		for (var i = 0; i < scriptList.length; i++) {
			var txt = scriptList[i];
			var rec = txt.split(",");
			if (rec[1].trim() == scriptName) {
				scriptText += txt.slice(txt.indexOf(',', txt.indexOf(',') + 1) + 1);
			}
		}
		return scriptText;
	}
	
	// Replaces every %name% in txt with the RESULT of running that script (its global R).
	// Called both as a dispatcher - execUserScript('%onNewDeal%') - and as a text expander.
	function execUserScript(txt) {
		var rec = txt.split('%');
		if (rec.length < 2) return txt;
		var txt1 = '';
		var script;
		for (var i = 0; i < rec.length; i++) {
			if (i % 2 == 0) {
				txt1 = txt1 + rec[i];
			} else {
				script = getScript(rec[i]);
				if (script != '') {
					txt1 = txt1 + userScript(script, foundContext, getContext(), foundCall, callText);
				} else {
					txt1 = txt1 + "%" + rec[i];
					if (i < rec.length - 1) txt1 = txt1 + "%";
				}
			}
		}
		return txt1;
	}
	
	// ---- REAL: logging -------------------------------------------------------------
	
	// BBOalert writes to a textarea in its panel. We have no panel, so send it to the
	// console - userScript() calls addLog() on every script error, and losing those
	// would make a failing hook completely silent.
	function addLog(x) {
		try {
			console.log('[brill-log]', (x && x.stack) ? x.stack : x);
		} catch (e) { /* never let logging break a hook */ }
	}
	
	// ---- STUB: chat / input handlers -----------------------------------------------
	//
	// The vendored handlers wire these onto BBO's chat input. inputOnKeyup in particular is
	// assigned as a VALUE (elMessage.onkeyup = inputOnKeyup), not called - which is why the
	// first "which functions are missing" scan, looking only for `name(`, did not find it.
	// They exist for BBOalert's alert-entry shortcuts; nothing here needs them.
	function inputOnKeyup() { }
	function inputChanged() { }
	function toggleOptions() { }
	function getDataType() { return ''; }
	function findAlert() { return ''; }
	
	// ---- STUB: alerting ------------------------------------------------------------
	// We disclose nothing and explain nothing; we only play. The observer handlers call
	// into these on bidding-box and explain-box events.
	
	function getAlert() { }
	function saveAlert() { }
	function checkAlert() { }
	function findAlertText() { return ''; }
	function setAlertText() { }
	function displayAlert() { }
	function BBOalertData() { this.getNextRecord = function () { return null; };
	                          this.getNextLine = function () { return null; };
	                          this.trimOn = true; }
	function BBOalertFind() { this.findAlert = function () { return ''; };
	                          this.trustedBid = false; this.alertedBid = false;
	                          this.deferredExplanation = false; }
	
	// ---- STUB: panel UI ------------------------------------------------------------
	// Every one of these paints something in the BBOalert tab, which does not exist here.
	
	function setUI() { }
	function restoreSettings() { }
	function saveSettings() { }
	function isSettingON() { return false; }
	function setOptions() { }
	function setTabEvents() { }
	function openAccountTab() { }
	function openMessageTab() { }
	function bboalertLog() { }
	function addBBOalertLog() { }
	function updateAlertDataAsync(d, cb) { if (typeof cb === 'function') cb(); }
	function processTable() { }
	function saveAlertTableToClipboard() { }
	function setStatText() { }
	function setStatTextDiv() { }
	function hideUnusedOptions() { }
	function initInfoSelector() { }
	function makeDirectLink() { }
	function setBBOalertButton() { }
	function setButtonPanel() { }
	function setOptionColors() { }
	function setOptionsOff() { }
	function toggleButtons() { }
	function partnershipOptions() { }
	
	// ---- STUB: data loading --------------------------------------------------------
	// BBOalert pulls the user's alert table from Google Drive / Dropbox / GitHub. The play
	// engine is compiled in at build time, so there is nothing to fetch.
	function readNewData() { }
	function loadBBOalertWebDataFile() { }
	function loadTinyURL() { }
	function setTitle() { }
	function setTitleText() { }
	function displayHeaders() { }
	function clearConfigMenu() { }
	function setOptionsSelector() { }
	function clearOptionsSelector() { }
	function checkOptionsVulnerability() { }
	function addBBOalertTab() { }
	function initBBOalertUI() { }
	function displayDocument() { }
	function fetchWebData() { }
	function HTMLpage2text(s) { return s; }
	function PluginInit() { }
	// initGlobals() clears scriptList, so this must be able to put it back. The build emits
	// BRILL_SCRIPTS; anything that calls setScriptList() (including our own lobby tick when it
	// notices an empty list) restores the compiled-in play engine.
	var BRILL_SCRIPTS = [];
	function setScriptList() {
		scriptList = BRILL_SCRIPTS.slice();
	}
	
	// PlayWithBrill's onDataLoad block DEFINES 61 helper functions - getCardByValue, makeBid,
	// BrillsTurnToBid, everything that talks to Brill.Service. Under the extension it is
	// dispatched when the alert data finishes loading; here there is no data load, so without
	// this the play hooks fire and immediately hit undefined functions.
	function brillDataLoad() {
		if (!scriptList.length) return;
		execUserScript('%onDataLoad%');
		console.log('[brill] play engine loaded (onDataLoad): ' +
			(typeof getCardByValue === 'function' ? 'helpers OK' : 'HELPERS MISSING'));
	}
	
	// ---- OVERRIDE: observer bootstrap ----------------------------------------------
	//
	// The vendored BBOobserverHandlers.onNavDivDisplayed() is BBOalert's panel bootstrap:
	// setUI, addBBOalertTab, openAccountTab, openMessageTab, restoreSettings, loadTinyURL,
	// then an async alert-data load. None of it applies standalone, and it actively broke
	// this build in two ways:
	//
	//   1. restoreSettings() reads $("#bboalert-menu-settings")[0] - the extension panel's
	//      settings dropdown. Standalone that is undefined, so it threw. And it is called
	//      from BBOobserver's startup interval BEFORE clearInterval + observer.observe():
	//
	//          if (!isVisible(getNavDiv())) return;
	//          initGlobals(); navDivDisplayed = true;
	//          onNavDivDisplayed();                      // threw
	//          clearInterval(tmr);                       // never reached
	//          BBOobserver.observe(targetNode, config);  // never reached
	//
	//      so the MutationObserver never started and NO play hook ever fired.
	//   2. Because clearInterval never ran, that whole block re-ran every 100ms - including
	//      openMessageTab() - which hammered BBO's rd_listmail.php into 429s and made the
	//      Mail tab flash continuously.
	//
	// Both symptoms, one cause. Replaced with the only thing this build needs at that point.
	function onNavDivDisplayed() {
		setScriptList();
		brillDataLoad();
	}
	
	function onNavDivHidden() { }

	// ==========================================================================
	// vendored: TamperMonkey/src/lobby.js
	// ==========================================================================
	// ---------------------------------------------------------------- challenge lobby driver
	//
	// The piece BBOalert never had: getting from the lobby into a challenge. Once seated, the
	// vendored observer + PlayWithBrill's hooks take over and play the board.
	//
	// STATE COMES FROM THE WIRE, NOT THE DOM
	// --------------------------------------
	// BBO's challenge list is served by POST webutil.bridgebase.com/v2/ard.php (cmd=l) as
	// <tlist><t .../></tlist> XML. That is authoritative: it carries per-side board counts,
	// so "is it my turn" is a field rather than a guess at what a coloured dot means.
	//
	// We do NOT call ard.php ourselves. It needs a `sessionPassword` that BBO keeps in Angular
	// memory (it is not in localStorage - checked), and re-authenticating to get one would mean
	// handling the account password. Instead we hook XHR/fetch and read the responses the page
	// already fetches for itself. Same trick CuebidsWithBrill uses on the Firestore stream:
	// piggyback the app's own data, stay automatically in sync, add no traffic.
	//
	// SAFETY GATE
	// -----------
	// Only challenges with c_challenge_style === "ARENA_ROBOT" are ever entered. Human
	// challenges are "PK". Engine-assisted play against humans is against BBO's terms; this is
	// a server-supplied field, not a heuristic, so the gate cannot quietly drift the way a
	// DOM-based check would.
	//
	// SETTINGS (page console):
	//   localStorage.BRILL_CHALLENGE_AUTOPLAY = '1'   actually enter challenges (default: off,
	//                                                 report only)
	//   delete localStorage.BRILL_CHALLENGE_AUTOPLAY  back to report-only
	
	var LOBBY = {
		poll: 2000,      // ms between lobby checks
		settle: 1500,    // ms to let a screen render before the next click
		cooldown: 60000, // ms before retrying a challenge we failed to enter
		stallMs: 90000   // no board gained in this long => treat the challenge as stalled
	};
	
	var tlist = {};          // tid -> parsed attributes of the last <t> seen
	var lobbyBusy = false;
	var lobbyCooldown = {};  // tid -> timestamp until which we leave it alone
	var lastLobbyLog = '';
	var lobbyEntered = {};   // tid -> {done, at} recorded when we entered, to detect no progress
	
	function autoPlay() { return localStorage.getItem('BRILL_CHALLENGE_AUTOPLAY') === '1'; }
	
	function lobbyLog() {
		var a = ['[brill-lobby]'].concat([].slice.call(arguments));
		console.log.apply(console, a);
	}
	
	// ---- harvest -------------------------------------------------------------------
	
	// Pull every <t .../> out of an ard.php body. Attribute soup, so a regex is honest here -
	// the payload is flat, single-quoted values never appear, and DOMParser on every poll is
	// needless work.
	function harvestTlist(text) {
		if (!text || text.indexOf('<tlist') === -1) return 0;
		var rows = text.match(/<t\s[^>]*\/>/g) || [];
		for (var i = 0; i < rows.length; i++) {
			var d = {}, m, re = /([\w]+)="([^"]*)"/g;
			while ((m = re.exec(rows[i]))) d[m[1]] = m[2];
			if (d.tid) tlist[d.tid] = d;
		}
		if (rows.length) lobbyLog('tlist: ' + rows.length + ' challenges');
		return rows.length;
	}
	
	// Hook both transports. The BBO client used XHR for ard.php when this was captured, but an
	// app that switches to fetch later would silently stop feeding us - so watch both.
	(function hookTransports() {
		var NativeXHR = window.XMLHttpRequest;
		if (NativeXHR) {
			var open = NativeXHR.prototype.open;
			var send = NativeXHR.prototype.send;
			NativeXHR.prototype.open = function (method, url) {
				this.__brillUrl = url;
				return open.apply(this, arguments);
			};
			NativeXHR.prototype.send = function () {
				var xhr = this;
				if (String(xhr.__brillUrl || '').indexOf('ard.php') !== -1) {
					xhr.addEventListener('load', function () {
						try { harvestTlist(xhr.responseText); } catch (e) { lobbyLog('harvest', e); }
					});
				}
				return send.apply(this, arguments);
			};
		}
		var nativeFetch = window.fetch;
		if (nativeFetch) {
			window.fetch = function (input) {
				var url = typeof input === 'string' ? input : (input && input.url) || '';
				var p = nativeFetch.apply(this, arguments);
				if (url.indexOf('ard.php') !== -1) {
					p.then(function (r) {
						r.clone().text().then(harvestTlist).catch(function () { });
					}).catch(function () { });
				}
				return p;
			};
		}
	})();
	
	// ---- interpretation ------------------------------------------------------------
	
	// BBO returns the username with inconsistent casing between fields ("Brill ADA" in one,
	// "brill ada" in another), so every comparison here is lowercased.
	function myName() { return (whoAmI() || '').trim().toLowerCase(); }
	
	// Returns {tid, boards, done, total, role} for a challenge, or null if it is not ours to play.
	function playable(d) {
		if (d.state !== 'RUNNING') return null;
		if (d.c_challenge_style !== 'ARENA_ROBOT') return null;   // <- the safety gate
		var me = myName();
		var role = null;
		if ((d.c_challenger || '').toLowerCase() === me) role = 'challenger';
		else if ((d.c_challengee || '').toLowerCase() === me) role = 'challengee';
		if (!role) return null;
		var done = parseInt(d['c_boards_completed_' + role] || '0', 10);
		var total = parseInt(d.boards || '0', 10);
		if (!(done < total)) return null;
		return { tid: d.tid, title: d.title, done: done, total: total, role: role };
	}
	
	function robotChallenges() {
		var out = [];
		for (var tid in tlist) {
			var p = playable(tlist[tid]);
			if (!p) continue;
			if (lobbyCooldown[tid] && Date.now() < lobbyCooldown[tid]) continue;
			out.push(p);
		}
		return out;
	}
	
	// ---- screens -------------------------------------------------------------------
	
	function onChallengeList() { return $('challenge-list-screen', PWD).length > 0; }
	function atTable() { return $('bridge-screen', PWD).is(':visible'); }
	function detailsPanel() { return $('challenge-details-panel:visible', PWD); }
	
	// LANGUAGE INDEPENDENCE
	// ---------------------
	// Matching the English word "Challenges" silently disabled the entire driver on a Danish
	// BBO (found on a Chrome profile whose login button read "Log ind"): the nav button never
	// matched, so no ard.php was ever harvested and it concluded there was nothing to play.
	// Nothing errored - it just sat there, which is the worst kind of failure.
	//
	// BBO's own menu.json pins this item language-independently:
	//   {"type":"regular-navigation-button","id":"challenges",
	//    "label":{"xlationCode":"MO301","fallbackLabel":"Challenges"},
	//    "icon":{"path":"assets/icons/sword_attack.svg"}}
	//
	// The icon is the same in every language, so prefer it and keep text as a fallback only.
	// localStorage.BRILL_CHALLENGES_LABEL overrides both if BBO ever changes the icon.
	var CHALLENGE_ICON = 'sword_attack';
	var CHALLENGE_LABELS = ['Challenges', 'Udfordringer', 'Herausforderungen', 'Defis',
		'Desafios', 'Sfide', 'Uitdagingen', 'Wyzwania'];
	
	function challengesNavButton() {
		var buttons = $('button.bbo-phx-navigation', PWD);
	
		var override = localStorage.getItem('BRILL_CHALLENGES_LABEL');
		if (override) {
			var byOverride = buttons.filter(function () {
				return $(this).text().indexOf(override) !== -1;
			}).first();
			if (byOverride.length) return byOverride;
		}
	
		// Covers <svg-icon icon="sword_attack">, <img src=".../sword_attack.svg"> and inline
		// <use href="...sword_attack.svg"> without needing to know which form BBO uses.
		var byIcon = buttons.filter(function () {
			var host = $(this).closest('phoenix-regular-navigation-button')[0] || this;
			try {
				return (host.innerHTML || '').indexOf(CHALLENGE_ICON) !== -1;
			} catch (e) {
				return false;
			}
		}).first();
		if (byIcon.length) return byIcon;
	
		return buttons.filter(function () {
			var t = $(this).text();
			for (var i = 0; i < CHALLENGE_LABELS.length; i++) {
				if (t.indexOf(CHALLENGE_LABELS[i]) !== -1) return true;
			}
			return false;
		}).first();
	}
	
	// A robot row carries no name-tag - there is no opponent username to show. That test is
	// language-independent, unlike matching the word "robot", so it is the one we rely on.
	// (A human challenge always renders a name-tag with the opponent's username.)
	//
	// We only ever call this when tlist has already told us an ARENA_ROBOT challenge is
	// playable, so the name-tag test just has to pick the right ROW, not decide robot-ness.
	function robotRow() {
		return $('challenge-list-item', PWD).filter(function () {
			return $('name-tag', this).length === 0;
		}).first();
	}
	
	// The details panel's button bar holds exactly one button ("Play now!"), so take it
	// positionally rather than by English text - same language trap as the nav button.
	function playNowButton() {
		var bar = $('challenge-details-panel .buttonBarClass button:visible', PWD);
		if (bar.length) return bar.first();
		return $('challenge-details-panel button:visible', PWD).filter(function () {
			return /play now/i.test($(this).text());
		}).first();
	}
	
	// ---- the loop ------------------------------------------------------------------
	//
	// Three clicks, each verified in TamperMonkey/BBO-lobby-protocol.md:
	//   Challenges nav -> challenge-list-item -> "Play now!"
	// Step two opens a modal rather than seating us, so the driver must wait for the panel
	// instead of assuming the row click entered the challenge.
	
	// initGlobals() does `scriptList = []`, and BBOalert calls it on several page transitions.
	// Under the extension the alert data is reloaded straight after; here there is nothing to
	// reload, so the play engine would just vanish. Wrap it once rather than polling for the
	// damage - the observer calls this far more often than the lobby ticks.
	var _initGlobals = initGlobals;
	initGlobals = function () {
		_initGlobals.apply(this, arguments);
		setScriptList();
	};
	
	// ---- PlayWithBrill's handler overrides -----------------------------------------
	//
	// PlayWithBrill customises BBOalert by assigning window.<name> = function ... (7 of them).
	// Under the extension its blocks are eval'd at global scope, so those assignments really do
	// replace the functions the observer calls. In this build everything lives inside one IIFE,
	// so the assignments land on `window` while the observer keeps calling the IIFE-scoped
	// originals - the overrides are installed and never invoked.
	//
	// That is not cosmetic: window.onNewAuction is what calls onNewState, which is what calls
	// onMyTurnToBid. Without it the hand is dealt, the bidding box appears, every hook fires
	// cleanly - and nothing ever bids.
	//
	// Function declarations are mutable bindings, so rebinding them here is enough: the
	// vendored call sites resolve the binding at call time and pick up the wrapper.
	var _vendoredHandlers = {
		getCard: getCard,
		getActivePlayer: getActivePlayer,
		mySeat: mySeat,
		onNewAuction: onNewAuction,
		onNewActivePlayer: onNewActivePlayer,
		onAuctionBoxHidden: onAuctionBoxHidden
	};
	
	function _delegate(name) {
		var vendored = _vendoredHandlers[name];
		var wrapper = function () {
			var override = window[name];
			// `override !== wrapper` matters: without it, anything that assigns our own wrapper
			// onto window turns every call into infinite recursion.
			if (typeof override === 'function' && override !== wrapper) {
				return override.apply(this, arguments);
			}
			return vendored.apply(this, arguments);
		};
		return wrapper;
	}
	
	getCard = _delegate('getCard');
	getActivePlayer = _delegate('getActivePlayer');
	mySeat = _delegate('mySeat');
	onNewAuction = _delegate('onNewAuction');
	onNewActivePlayer = _delegate('onNewActivePlayer');
	onAuctionBoxHidden = _delegate('onAuctionBoxHidden');
	
	// BBOalert starts its MutationObserver from a 100ms interval gated on
	// isVisible(getNavDiv()) - #navDiv having layout. That gate is fragile here: if it never
	// opens, the observer never starts, no hook ever fires, and the failure is completely
	// silent (the interval just spins). Start it ourselves instead, and cancel BBOalert's
	// interval so we cannot end up with two observers on the same callback.
	//
	// BBOobserver / config / tmr are declared in the vendored BBOobserver.js, which is
	// concatenated into this same scope AFTER us - safe to reference from a timer callback,
	// which by definition runs after load.
	var brillObserverStarted = false;
	var brillObserverFailed = false;
	
	function ensureObserver() {
		if (brillObserverStarted) return;
		try {
			if (typeof BBOobserver === 'undefined' || !PWD || !PWD.body) return;
			if (typeof tmr !== 'undefined') clearInterval(tmr);
			navDivDisplayed = true;
			setScriptList();
			brillDataLoad();
			BBOobserver.observe(PWD.body, config);
			brillObserverStarted = true;
			lobbyLog('MutationObserver started (watchdog); helpers=' +
				(typeof getCardByValue === 'function'));
		} catch (e) {
			// Report once, then stay quiet: this used to log every 2s forever, which buried
			// everything else. The failure is still visible, just not repeated.
			if (!brillObserverFailed) {
				brillObserverFailed = true;
				lobbyLog('observer start FAILED (will keep retrying quietly): ' + (e && e.message));
			}
		}
	}
	
	function lobbyTick() {
		ensureObserver();
		if (!scriptList.length && BRILL_SCRIPTS.length) setScriptList();   // backstop
		if (lobbyBusy) return;
		if (atTable()) return;             // PlayWithBrill's hooks own the table
	
		// Chicken-and-egg: we learn about challenges from the page's own ard.php responses, but
		// the page only fetches ard.php on the Challenges screen. Starting on the lobby home we
		// therefore have no data, conclude there is nothing to play, and never navigate - so we
		// never get data. Seed ourselves by going to the challenge list once.
		// Only in autoplay mode: report-only must stay passive and not move the user's screen.
		if (autoPlay() && !Object.keys(tlist).length) {
			if (!onChallengeList()) {
				var seed = challengesNavButton();
				if (seed.length) {
					lobbyLog('no challenge data yet - opening Challenges to load it');
					lobbyBusy = true;
					seed[0].click();
					setTimeout(function () { lobbyBusy = false; }, LOBBY.settle * 2);
				}
			}
			return;   // on the list already: just wait for the ard.php response to land
		}
	
		var todo = robotChallenges();
		var msg = todo.length
			? todo.map(function (c) { return c.tid.slice(0, 8) + ' ' + c.done + '/' + c.total; }).join(', ')
			: 'nothing to play';
		if (msg !== lastLobbyLog) { lobbyLog(msg + (autoPlay() ? '' : '  (autoplay off)')); lastLobbyLog = msg; }
		if (!todo.length || !autoPlay()) return;
	
		var target = todo[0];
		lobbyBusy = true;
	
		// If the details modal is already up, finish the job.
		if (detailsPanel().length) {
			var pn = playNowButton();
			if (pn.length) { lobbyLog('clicking "Play now!"'); pn[0].click(); }
			setTimeout(function () { lobbyBusy = false; }, LOBBY.settle * 3);
			return;
		}
	
		if (!onChallengeList()) {
			var nav = challengesNavButton();
			if (nav.length) { lobbyLog('opening Challenges'); nav[0].click(); }
			setTimeout(function () { lobbyBusy = false; }, LOBBY.settle);
			return;
		}
	
		var row = robotRow();
		if (!row.length) {
			lobbyLog('no robot row on screen for ' + target.tid.slice(0, 8) + ' - backing off');
			lobbyCooldown[target.tid] = Date.now() + LOBBY.cooldown;
			lobbyBusy = false;
			return;
		}
		// Guard against re-entering a challenge whose board count is not advancing.
		//
		// Observed live: both robot challenges sat at 3/4 in the tlist while the driver
		// re-entered them every few seconds forever, because the cooldown only applied when the
		// ROW was missing - not when entry produced no progress. The account owner confirmed all
		// four boards had in fact been played, so c_boards_completed_* evidently lags the last
		// board (it appears to settle only once the match is recorded as finished).
		//
		// That makes this guard load-bearing rather than a workaround: a completed challenge can
		// still read done < boards for a while, and without the cooldown the driver would keep
		// re-entering a match it has already finished.
		var prev = lobbyEntered[target.tid];
		if (prev && prev.done === target.done && (Date.now() - prev.at) > LOBBY.stallMs) {
			lobbyLog('challenge ' + target.tid.slice(0, 8) + ' stalled at ' + target.done + '/' +
				target.total + ' - cooling down instead of re-entering');
			lobbyCooldown[target.tid] = Date.now() + LOBBY.cooldown;
			delete lobbyEntered[target.tid];
			lobbyBusy = false;
			return;
		}
		if (!prev || prev.done !== target.done) {
			lobbyEntered[target.tid] = { done: target.done, at: Date.now() };
		}
	
		lobbyLog('entering robot challenge ' + target.tid.slice(0, 8) +
			' (' + target.done + '/' + target.total + ' boards done)');
		var item = $('div.itemClass', row);
		(item.length ? item[0] : row[0]).click();
		setTimeout(function () { lobbyBusy = false; }, LOBBY.settle);
	}
	
	setInterval(lobbyTick, LOBBY.poll);
	
	// Console handle, mirroring CuebidsWithBrill's __brill.
	window.__brillChallenge = {
		tlist: function () { return tlist; },
		todo: function () { return robotChallenges(); },
	
		// Which nav button did the language-independent matcher find? Returns null if none -
		// the first thing to check if the driver reports "nothing to play" on a non-English BBO.
		nav: function () {
			var b = challengesNavButton();
			return b.length ? b.text().replace(/\s+/g, ' ').trim() : null;
		},
	
		// Open the challenge list without enabling autoplay, so the page fetches ard.php and
		// the harvester has something to read. Read-only: it navigates, it enters nothing.
		openList: function () {
			var b = challengesNavButton();
			if (!b.length) return 'challenges nav button NOT FOUND';
			b[0].click();
			return 'clicked: ' + b.text().replace(/\s+/g, ' ').trim();
		},
		autoplay: function (on) {
			if (on === undefined) return autoPlay();
			if (on) localStorage.setItem('BRILL_CHALLENGE_AUTOPLAY', '1');
			else localStorage.removeItem('BRILL_CHALLENGE_AUTOPLAY');
			return autoPlay();
		},
		where: function () {
			return { list: onChallengeList(), table: atTable(), details: detailsPanel().length > 0 };
		},
		reset: function () { lobbyCooldown = {}; lobbyEntered = {}; lobbyBusy = false; return 'ok'; }
	};
	
	// Everything in this build lives inside one IIFE, so the vendored BBOalert accessors are
	// not reachable from the devtools console (or from a test driver's page.evaluate). Expose
	// the ones worth poking at - this is how you check the DOM layer is alive at a table.
	window.__brillDom = {
		whoAmI: function () { return whoAmI(); },
		mySeat: function () { return mySeat(); },
		dealNumber: function () { return getDealNumber(); },
		tableType: function () { return tableType(); },
		context: function () { return getContext(); },
		activePlayer: function () { return getActivePlayer(); },
		scripts: function () { return scriptList.length; },
		hooks: function () {
			return scriptList.map(function (s) { return s.split(',')[1].trim(); })
				.filter(function (v, i, a) { return a.indexOf(v) === i; }).sort();
		},
		exec: function (name) { return execUserScript('%' + name + '%'); },
	
		// Why is nothing happening? Start here.
		diag: function () {
			var nav = null;
			try { nav = getNavDiv(); } catch (e) { }
			return {
				observerStarted: brillObserverStarted,
				navDivPresent: !!nav,
				navDivVisible: !!nav && isVisible(nav),
				scripts: scriptList.length,
				helpersLoaded: typeof getCardByValue === 'function',
				tableDisplayed: typeof tableDisplayed !== 'undefined' ? tableDisplayed : null
			};
		}
	};

	// ==========================================================================
	// vendored: generated: Custom/PlayWithBrill.js -> scriptList
	// ==========================================================================
	BRILL_SCRIPTS = [
	 "//Script,onAnnouncementDisplayed,\nconsole.log(getNow(true) + \" onAnnouncementDisplayed Dealnumber: \" + getDealNumber() + \" \" + JSON.stringify(deal));\nvar isClaimDialog = false;\ntry {\n\tvar panel = getAnnouncementPanel();\n\tvar panelText = $(panel).text().replace(/\\s+/g, \" \").trim();\n\tvar visibleButtons = $(\"button:visible\", panel).map(function () { return $(this).text().trim(); }).get();\n\tconsole.log(getNow(true) + \" onAnnouncementDisplayed text: \\\"\" + panelText + \"\\\" buttons: \" + JSON.stringify(visibleButtons));\n\tisClaimDialog = /\\bI claim\\b/i.test(panelText);\n\tif (isClaimDialog) {\n\t\t// Mark that a real claim happened on this deal - used by sendFinalPlay to decide whether\n\t\t// to attach &claim=true to /pbn/finalize. Without this flag we'd incorrectly tag any deal\n\t\t// with played < 52 (e.g. one missed card during capture) as a claim.\n\t\tclaimDetected = true;\n\t\t// Parse \"<Dir>: I claim <N> more tricks. Contract <making|down> <±N>. Do you accept?\"\n\t\tvar claimMatch = /\\bI claim (\\d+)\\b/i.exec(panelText);\n\t\tvar dirMatch = /^(North|South|East|West):/i.exec(panelText);\n\t\tvar resultMatch = /Contract (making|down)(?:\\s*([+\\-]?\\d+))?/i.exec(panelText);\n\t\tvar tricksClaimed = claimMatch ? parseInt(claimMatch[1], 10) : null;\n\t\tvar claimerDir = dirMatch ? dirMatch[1].charAt(0).toUpperCase() : null;\n\t\tvar resultKind = resultMatch ? resultMatch[1].toLowerCase() : null;\n\t\tvar resultDelta = resultMatch && resultMatch[2] ? parseInt(resultMatch[2], 10) : 0;\n\t\tconsole.log(getNow(true) + \" CLAIM parsed: claimer=\" + claimerDir +\n\t\t\t\" tricks=\" + tricksClaimed + \" result=\" + resultKind + \" delta=\" + resultDelta);\n\t\tvalidateClaimWithServer(panel, tricksClaimed, claimerDir, resultKind, resultDelta);\n\t}\n} catch (e) {\n\tconsole.error(getNow(true) + \" onAnnouncementDisplayed log error:\", e);\n}\n// Auto-click Yes on regular (non-claim) announcements\nif (!isClaimDialog) {\n\t$(\"button:visible:contains('Yes')\", getAnnouncementPanel()).click();\n}",
	 "//Script,onNewActivePlayer,\n// Be aware of timing, so keep animations on\ndummy = getDummyCards().join(\"\")\nconsole.log(getNow(true) +  \" onNewActivePlayer  \" + dummyCardsDisplayed + \" Dummy: \" + dummy)\nif ((dummyCardsDisplayed != dummy) && (dummy.length == 26)) {\n    dummyCardsDisplayed = dummy;\n    onDummyCardsDisplayed();\n} else if (dummy.length > 0 && dummy.length < 26 && dummyCardsDisplayed.length < 26) {\n    // BBO might not have rendered all dummy cards yet, retry with increasing delays\n    console.log(getNow(true) + \" Dummy not fully rendered (\" + (dummy.length/2) + \" cards), retrying...\");\n    var retryDelays = [50, 100, 200, 400];\n    retryDelays.forEach(function(delay) {\n        setTimeout(function() {\n            if (dummyCardsDisplayed.length == 26) return; // Already captured\n            var retryDummy = getDummyCards().join(\"\");\n            console.log(getNow(true) + \" Retry dummy after \" + delay + \"ms: \" + retryDummy + \" (\" + (retryDummy.length/2) + \" cards)\");\n            if ((dummyCardsDisplayed != retryDummy) && (retryDummy.length == 26)) {\n                dummyCardsDisplayed = retryDummy;\n                onDummyCardsDisplayed();\n            }\n        }, delay);\n    });\n}\n",
	 "//Script,onNewDeal,\nconsole.log(getNow(true) + \" onNewDeal \" + getDealNumber() + \" \" + myCardsDisplayed);\nnewdeal = true\ndummyCardsDisplayed = \"\";\nmyCardsDisplayed = \"\";\n",
	 "//Script,onMyCardsDisplayed,\nconsole.log(getNow(true) + \" onMyCardsDisplayed \" + myCardsDisplayed + \" Dealnumber: \" + getDealNumber() + \" \" + JSON.stringify(deal));\n",
	 "//Script,onNewAuction,\nconsole.log(getNow(true) + \" onNewAuction\");\nvar ctx = getContext();\nif (ctx.endsWith(\"------\") && ctx != \"--------\" && ctx.length >= 8) {\n    execUserScript('%onBeforeFirstLead%');\n}\n",
	 "//Script,onNewState,\nconsole.log(getNow(true) + \" onNewState \" + currentAuction);\nif ((currentAuction.length >= 8) && (currentAuction.endsWith('------'))) {\n    execUserScript('%onAuctionEnd%');\n} else {\n    console.log(getNow(true) + \" onNewState myTurn \" + isMyTurn()) + \" \" + (isItMe(getPlayerAtSeat(getDirectionToBid()))+ \" \" + getPlayerAtSeat(getDirectionToBid()) + \" \" + getDirectionToBid());\n    if (isMyTurn()) execUserScript('%onMyTurnToBid%');\n}",
	 "//Script,onAuctionBegin,\nconsole.log(getNow(true) + \" onAuctionBegin\");\nexecUserScript('%onNewState%');\n",
	 "//Script,onAuctionEnd,\nconsole.log(getNow(true) + \" onAuctionEnd\");\nexecUserScript('%onBeforePlayingCard%');\nif (isMyTurnToPlay()) execUserScript('%onMyTurnToPlay%');\n",
	 "//Script,onBiddingBoxDisplayed,\nconsole.log(getNow(true) + \" onBiddingBoxDisplayed\");\n",
	 "//Script,onAuctionBoxDisplayed,\nconsole.log(getNow(true) + \" onAuctionBoxDisplayed\");\n",
	 "//Script,onMyLead,\nconsole.log(getNow(true) + \" onMyLead\");\n",
	 "//Script,onDealEnd,\nconsole.log(getNow(true) + \" onDealEnd\");\n",
	 "//Script,onNewPlayedCard,\nconsole.log(getNow(true) + \" onNewPlayedCard \" + getPlayedCards() + \" turn \" + whosTurn());\nif (whosTurn() != \"\") {\n    execUserScript('%onBeforePlayingCard%');\n    if (isMyTurnToPlay()) execUserScript('%onMyTurnToPlay%');\n}",
	 "//Script,onBeforePlayingCard,\nconsole.log(getNow(true) + \" onBeforePlayingCard \" + whosTurn());",
	 "//Script,onNewActivePlayer,\nconsole.log(getNow(true) + \" onNewActivePlayer \" + activePlayer);",
	 "//Script,onMyTurnToBid,\nconsole.log(getNow(true) + \" onMyTurnToBid context: \" + getContext());",
	 "//Script,onMyTurnToPlay,\nconsole.log(getNow(true) + \" onMyTurnToPlay Cards played: \" + getPlayedCards());",
	 "//Script,onAnnouncement,\nconsole.log(getNow(true) + \" onAnnouncement event fired\");\ntry {\n\tvar annText = $(\".announcementClass:visible\", parent.window.document).text().replace(/\\s+/g, \" \").trim();\n\tconsole.log(getNow(true) + \" onAnnouncement text: \\\"\" + annText + \"\\\"\");\n} catch (e) { }",
	 "//Script,onNotification,\nconsole.log(getNow(true) + \" onNotification event fired\");\ntry {\n\tvar notifText = $(\".notificationClass:visible\", parent.window.document).text().replace(/\\s+/g, \" \").trim();\n\tconsole.log(getNow(true) + \" onNotification text: \\\"\" + notifText + \"\\\"\");\n} catch (e) { }",
	 "//Script,onNotificationDisplayed,\nconsole.log(getNow(true) + \" onNotificationDisplayed event fired\");\ntry {\n\tvar notifText = $(\".notificationClass:visible\", parent.window.document).text().replace(/\\s+/g, \" \").trim();\n\tconsole.log(getNow(true) + \" onNotificationDisplayed text: \\\"\" + notifText + \"\\\"\");\n} catch (e) { }",
	 "//Script,onDataLoad,\ncurrentContext = \"??\";\ndummyCardsDisplayed = \"\";\ngetCardByValue = function (cval) {\n    let cv =  cval.replace(\"T\", \"10\");\n    var card = $(\"bridge-screen\", parent.window.document).find(\".topLeft:visible\").filter(function () {\n        if (replaceSuitSymbols(this.textContent, \"\") == cv) return this;\n    });\n    if (card.length != 0) return card[0];\n    return null;\n}\n\nplayCardByValue = function (cv) {\n    var card = getCardByValue(cv);\n    if (card != null) {\n        card.click();\n        card.click();\n    }\n}\n\ngetCardsByDirection = function (direction) {\n    let cards = [];\n    let zidx = \"\";\n    switch (direction) {\n        case \"S\" : zidx = \"1\"; break;\n        case \"W\" : zidx = \"2\"; break;\n        case \"N\" : zidx = \"3\"; break;\n        case \"E\" : zidx = \"4\"; break;\n        default : return cards;\n    }\n    $(\"bridge-screen .cardSurfaceClass\", getNavDiv()).find(\".cardClass:visible\").each(function () {\n        if (this.style.zIndex.startsWith(zidx)) {\n            let c = $(this).find(\".topLeft\").text();\n            c = replaceSuitSymbols(c, \"\").replace(\"10\", \"T\");\n            if (c.length == 2) cards.push(c);\n        }\n    });\n    return cards;\n}\n\nfunction getCard(index) {\n    var card = parent.$(\".cardClass:visible\").filter(function () {\n        return $(this).css('z-index') == index;\n    }).text();\n    if (card.length == 6) {\n        card = \"T\" + card.slice(-1);\n    } else card = card.slice(0, 2);\n    return card;\n}\n\ngetMyCards = function () {\n    return getCardsByDirection(mySeat());\n}\n\ngetDummyCards = function () {\n    return getCardsByDirection(getDummyDirection());\n}\n\ngetDeclarerCards = function () {\n    return getCardsByDirection(getDeclarerDirection());\n}\n\nisMyTurnToBid = function () {\n    return isItMe(getPlayerAtSeat(getDirectionToBid()));\n}\n\nisMyTurnToPlay = function () {\n    if (whosTurn() == getDummyDirection())\n        if (isItMe(getPlayerAtSeat(getDeclarerDirection()))) return true;\n    return isItMe(getPlayerAtSeat(whosTurn()));\n}\n\nisMyTurn = function () {\n    return (isMyTurnToBid()||isMyTurnToPlay());\n}\n\nwhosTurn = function () {\n    return $(\"bridge-screen,parent\", parent.window.document).find(\".nameBarClass:visible\").filter(function () {\n        if (this.style.backgroundColor == 'rgb(255, 206, 0)') return this;\n    }).find(\".directionClass\").text();\n}\n\ndelayedAlert = function (txt, delay = 0) {\n    setTimeout(function () {\n        alert(txt);\n    }, delay)\n}\n\nselectBid = function (bid, alert = false) {\n    let bbb = parent.$(\"bidding-box button\");\n    if (bbb.length != 17) return;\n    if (alert != (bbb[15].style.backgroundColor == 'rgb(255, 255, 255)')) bbb[15].click();\n    switch (bid) {\n        case \"--\": bbb[12].click(); break;\n        case \"Db\": bbb[13].click(); break;\n        case \"Rd\": bbb[14].click(); break;\n        default:\n            $(bbb).each(function (idx) {\n                if (idx < 12)\n                    if (bid.indexOf(replaceSuitSymbols(this.textContent.substring(1), \"\")) != -1) this.click();\n            });\n    }\n}\n\nisItMe = function (uid) {\n    return ((uid.toLowerCase() == whoAmI().toLowerCase()));\n}\n\nonNewState = function () {\n    execUserScript('%onNewState%');\n}\n\ngetDealerDirection = function () {\n    return \"NESW\".charAt((getDealNumber() - 1) % 4);\n}\n\ngetDirectionToBid = function () {\n    if (getContext() == \"??\") return \"\";\n    return \"NESW\".charAt((getDealNumber() - 1 + getContext().length / 2) % 4);\n}\n\ngetPlayerAtSeat2 = function (seat) {\n    let player = $(\".nameBarDivClass\", getNavDiv()).filter(function () {\n        return (this.textContent.startsWith(seat));\n    }).text();\n\tconsole.log(player)\n    // Extract everything before \"@font-face\"\n    let cutoff = player.indexOf(\" @font-face\");\n    if (cutoff !== -1) {\n        player = player.substring(0, cutoff);\n    }\n    return player.substring(1);\n}\n\ngetPlayerAtSeat = function (seat) {\n    return $(\".nameBarDivClass\", getNavDiv()).filter(function () {\n        return (this.textContent.startsWith(seat));\n    }).find(\".nameDisplayClass\").text();\n}\n\ngetDeclarerDirection = function () {\n    return $(\".tricksPanelTricksLabelClass:visible\", getNavDiv()).text().substring(0, 1);\n}\n\ngetDummyDirection = function () {\n    let declarer = getDeclarerDirection();\n    if (declarer == \"\") return \"\";\n    return \"NESWNESW\".charAt(\"NESW\".indexOf(declarer) + 2);\n}\n\nwindow.getCard = function (index) {\n    $(\".tricksPanelTricksLabelClass:visible\", getNavDiv()).text().substring(0, 1);\n    var card = parent.$(\".cardClass:visible\").filter(function () {\n        return ($(this).css('z-index') == index);\n    }).text();\n    if (card.length == 6) {\n        card = \"T\" + card.slice(-1);\n    } else card = card.slice(0, 2);\n    return card;\n}\n\nwindow.onAuctionBoxHidden = function () {\n    activePlayer = '';\n    BBOalertEvents().dispatchEvent(E_onAuctionBoxHidden);\n    execUserScript('%onAuctionBoxHidden%');\n}\nwindow.getActivePlayer = function getActivePlayer() {\n    var name = $('bridge-screen deal-viewer .nameBarClass', PWD)\n        .filter(function () {\n            return this.style.backgroundColor === \"rgb(255, 206, 0)\";\n        }).find(\":lt(2)\").text();\n    if (name == '') {\n        name = $('bridge-screen deal-viewer .nameBarClass', PWD)\n            .filter(function () {\n                return this.style.backgroundColor === \"rgb(204, 204, 154)\";\n            }).find(\":lt(2)\").text();\n    }\n    // return direction + UID in lower case\n\t// console.log(name);\n    return name.charAt(0) + name.substring(1).toLowerCase();\n}\n\nwindow.onNewAuction = function onNewAuction() {\n    if (!auctionBoxDisplayed) return;\n    execUserScript('%onNewState%');\n    if (currentAuction != '')\n        if (currentAuction != '??') {\n            ctxArray = bidArray(stripContext(getContext()));\n            BBOalertEvents().dispatchEvent(E_onNewAuction);\n            execUserScript('%onNewAuction%');\n\t\t\tactivePlayer = getActivePlayer();\n            console.log(getNow(true) + \" Next Active player \" + activePlayer);\n            if (activePlayer.slice(0, 1) == directionRHO()) {\n                console.log(getNow(true) + \" Partner bid \" + getContext().slice(-2));\n                BBOalertEvents().dispatchEvent(E_onPartnerAuction);\n                execUserScript('%onPartnerAuction%');\n            }\n            if (activePlayer.slice(0, 1) == directionLHO()) {\n                console.log(getNow(true) + \" My bid \" + getContext().slice(-2));\n                BBOalertEvents().dispatchEvent(E_onMyAuction);\n                execUserScript('%onMyAuction%');\n            }\n            if (activePlayer.slice(0, 1) == myDirection()) {\n                console.log(getNow(true) + \" RHO bid \" + getContext().slice(-2));\n                BBOalertEvents().dispatchEvent(E_onRHOAuction);\n                execUserScript('%onRHOAuction%');\n            }\n            if (activePlayer.slice(0, 1) == partnerDirection()) {\n                console.log(getNow(true) + \" LHO bid \" + getContext().slice(-2));\n                BBOalertEvents().dispatchEvent(E_onLHOAuction);\n                execUserScript('%onLHOAuction%');\n            }\n        }\n}\n\nwindow.onAuctionBoxHidden = function () {\n    activePlayer = '';\n    BBOalertEvents().dispatchEvent(E_onAuctionBoxHidden);\n    execUserScript('%onAuctionBoxHidden%');\n}\n\nwindow.onNewActivePlayer = function () {\n    if (lastDealNumber != \"\") {\n        BBOalertEvents().dispatchEvent(E_onNewActivePlayer);\n        execUserScript('%onNewActivePlayer%');\n    }\n}\n\nwindow.mySeat = function() {\n    return $(\".auction-header\",getNavDiv()).text().slice(-2,-1);\n}\n\nwindow.onDummyCardsDisplayed = function () {\n    execUserScript('%onDummyCardsDisplayed%');\n}",
	 "//Script,onDummyCardsDisplayed,\nconsole.log(getNow(true) + \" onDummyCardsDisplayedBrill \" + dummyCardsDisplayed);\nif (deal[\"finished\"]) {\n\tconsole.log(getNow(true) + \" onDummyCardsDisplayed after deal finished \" + dummyCardsDisplayed + \" \" + JSON.stringify(deal))\n} else {\n\tif (deal[\"played\"] && deal[\"played\"].length > 4 && deal[\"dummy\"] != \"\") {\n\t\t// Ignore the display of dummy\n\t\t// But sometimes it might be late, so grab it if we have no dummy\n\t} else {\n\t\tif (dummyCardsDisplayed.length == 26) {\n\t\t\t// When playing defend only the order is a bit different\n\t\t\tif (newdeal) {\n\t\t\t\t// Defensive: onDataLoad block may not have run yet (BBOalert script evaluation race).\n\t\t\t\t// initdeal lives in the bottom onDataLoad block - skip if not yet defined.\n\t\t\t\tif (typeof initdeal === \"function\") initdeal();\n\t\t\t\telse console.warn(getNow(true) + \" onDummyCardsDisplayed: initdeal not yet defined, skipping init\");\n\t\t\t}\n\t\t\tdeal[\"dummy\"] = formatCardsDisplayed(dummyCardsDisplayed)\n\t\t\tif (deal[\"dummy\"] == deal[\"hand\"]) {\n\t\t\t\tconsole.log(getNow(true) + \" BBO moved me to the declarer position\");\n\t\t\t\tdeal[\"hand\"] = formatCards(getDeclarerCards())\n\t\t\t\tdeal[\"seat\"] = getDeclarerDirection()\n\t\t\t\tconsole.log(getNow(true) + \" \" + JSON.stringify(deal))\n\t\t\t}\n\t\t\tsavedeal(dealnumber, deal)\n\t\t} else {\n\t\t\tif (deal[\"dummy\"] == \"\" || !deal[\"dummy\"]) {\n\t\t\t\tconsole.log(getNow(true) + \" Dummy incomplete (\" + (dummyCardsDisplayed.length/2) + \" cards), will retry in BrillsTurnToPlay\");\n\t\t\t}\n\t\t}\n\t}\n\t\n}\n",
	 "//Script,onMyCardsDisplayed,\nconsole.log(getNow(true) + \" onMyCardsDisplayedYY \" + myCardsDisplayed);\n// BBO will redisplay the hand after the deal finish\nif (deal[\"finished\"]) {\n\tconsole.log(getNow(true) + \" myCardsDisplayed after deal finished \" + dummyCardsDisplayed + \" \" + JSON.stringify(deal))\n} else {\n\tif (deal[\"played\"] && deal[\"played\"].length > 4) {\n\t\tconsole.log(getNow(true) + \" onMyCardsDisplayed after deal in progress \" + myCardsDisplayed + \" \" + JSON.stringify(deal))\n\t} else {\n\t\tif (deal[\"hand\"]) {\n\t\t\tconsole.log(getNow(true) + \" myCardsDisplayed with hand already \" + deal[\"hand\"] + \" \" + dummyCardsDisplayed + \" \" + getMyCards())\n\t\t} else {\n\t\t\tif (myCardsDisplayed.length == 26) {\n\t\t\t\tdeal[\"hand\"] = formatCardsDisplayed(getMyCards())\n\t\t\t\tdeal[\"seat\"] = myDirection()\n\t\t\t\tconsole.log(getNow(true) + \" Updated hand with myCardsDisplayed \" + myCardsDisplayed + \" \" + getMyCards() + \" \" + deal[\"hand\"] + \" dealnumber: \" + getDealNumber())\n\t\t\t\tsavedeal(getDealNumber(), deal)\n\t\t\t}\n\t\t}\n\t}\n}\n",
	 "//Script,onNewDeal,\nremoveAds(true);\nnewdeal = true\ndeal = {}\ndeal[\"number\"] = getDealNumber()\nbiddingInProgress = false\nplayInProgress = false\nlastBidCtx = null\nlastPlayKey = null\nfinalPlaySent = false\nclaimDetected = false\n",
	 "//Script,onDealEnd,\ndealnumber = getDealNumber()\ndeal[\"finished\"] = true\nsendFinalPlay()\nremovedeal()\nconsole.log(getNow(true) + \" onDealEnd - Deal removed\")\nnewdeal = true;\n",
	 "//Script,onAuctionEnd,\n// Detect passed-out auction (4 passes, no contract) and finalize the deal so it shows up in the PBN file.\n// onDealEnd often doesn't fire for passed-out auctions, so we need to finalize here.\nif (getContext() === \"--------\") {\n\tconsole.log(getNow(true) + \" onAuctionEnd - passed out auction detected, finalizing\");\n\tsendFinalPlay();\n}\nif (tableType() == \"no\") {\n\tdealnumber = getDealNumber()\n\tremovedeal()\n\tconsole.log(getNow(true) + \" onAuctionEnd - Deal removed\")\n\tnewdeal = true\n}\n",
	 "//Script,onBeforeFirstLead,\nif (getActivePlayer().substring(0,1) == mySeat()) {\n    execUserScript('%onMyTurnToPlay%');\n}\n\n",
	 "//Script,onBeforePlayingCard,\nconsole.log(getNow(true) + \" onMyBeforePlayingCard \" + getPlayedCards() + \" turn \" + whosTurn());\n",
	 "//Script,onMyTurnToBid,\nconsole.log(getNow(true) + \" onMyTurnToBidBrill \"+ getContext());\nif (deal[\"finished\"] && getDealNumber() != deal[\"number\"]) {\n\tconsole.log(getNow(true) + \" onMyTurnToBid new board detected, reinitializing deal\");\n\tnewdeal = true;\n\tdeal[\"finished\"] = false;\n}\nvar currentBidCtx = getContext();\nif (deal[\"finished\"]) {\n\tconsole.log(getNow(true) + \" onMyTurnToBid called after deal finished\" + \" \" + JSON.stringify(deal))\n} else if (biddingInProgress) {\n\tconsole.log(getNow(true) + \" onMyTurnToBid skipped, bid request already in progress\")\n} else if (lastBidCtx === currentBidCtx) {\n\tconsole.log(getNow(true) + \" onMyTurnToBid skipped, already processed ctx: \" + currentBidCtx)\n} else {\n\tbiddingInProgress = true;\n\tlastBidCtx = currentBidCtx;\n\t// Give BBO time to get stuff in place\n\tvar overlay = addSpinner()\n\tctx = currentBidCtx\n\tif (ctx == \"\") {\n\t\tsetTimeout(function () {\n\t\t\trequestIdleCallback(() => BrillsTurnToBid(overlay), { timeout: 3000 });\n\t\t}, 3000)\n\t} else {\n\t\tsetTimeout(function () {\n\t\t\trequestIdleCallback(() => BrillsTurnToBid(overlay), { timeout: 3000 });\n\t\t}, 500)\n\t}\n}\n",
	 "//Script,onMyTurnToPlay,\nconsole.log(getNow(true) + \" onMyTurnToPlayBrill\");\nif (deal[\"finished\"] && getDealNumber() != deal[\"number\"]) {\n\tconsole.log(getNow(true) + \" onMyTurnToPlay new board detected, reinitializing deal\");\n\tnewdeal = true;\n\tdeal[\"finished\"] = false;\n}\n// Dedup key combines played-count and current played cards on screen so repeated fires for the same turn are skipped\nvar currentPlayKey = (deal[\"played\"] ? deal[\"played\"].length : 0) + \"|\" + getPlayedCards();\nif (deal[\"finished\"]) {\n\tconsole.log(getNow(true) + \" onMyTurnToPlay called after deal finished\" + \" \" + JSON.stringify(deal))\n} else if (playInProgress) {\n\tconsole.log(getNow(true) + \" onMyTurnToPlay skipped, play request already in progress\")\n} else if (lastPlayKey === currentPlayKey) {\n\tconsole.log(getNow(true) + \" onMyTurnToPlay skipped, already processed key: \" + currentPlayKey)\n} else {\n\tplayInProgress = true;\n\tlastPlayKey = currentPlayKey;\n\tconsole.log(getNow(true) + \" onMyTurnToPlay current trick: \" + deal[\"played\"])\n\tvar overlay = addSpinner()\n\tif (deal[\"played\"] && deal[\"played\"].length > 0) {\n\t\tsetTimeout(function () {\n\t\t\trequestIdleCallback(() => BrillsTurnToPlay(overlay), { timeout: 3000 });\n\t\t}, 500)\n\t} else {\n\t\tsetTimeout(function () {\n\t\t\trequestIdleCallback(() => BrillsTurnToPlay(overlay), { timeout: 3000 });\n\t\t}, 2000)\n\t}\n}\n",
	 "//Script,onNewPlayedCard,\n// This event calls onMyTurnToPlay, so make no change here\nif (!isMyTurnToPlay()) {\n\tdeal[\"played\"] = updatePlayedCards(deal[\"played\"])\n\tsavedeal(dealnumber, deal)\n}\n// Send final /play as soon as the 52nd card is recorded - before any onDealEnd/onNewDeal race can wipe deal state\nif (deal[\"played\"] && deal[\"played\"].length == 52 && !finalPlaySent) {\n\tsendFinalPlay()\n}\n",
	 "//Script,onDataLoad,\n\ncardExists = function (card, array) {\n\treturn array.some(function (existingCard) {\n\t\t// Assuming cards are objects with unique identifiers like 'id'\n\t\treturn existingCard === card\n\t});\n}\n// Server selection: in the BBO browser console run\n//   localStorage.BRILL_SERVER = 'local'     -> http://localhost:5200\n//   localStorage.BRILL_SERVER = 'localssl'  -> https://localhost:7200  (note: https, not http)\n//   localStorage.removeItem('BRILL_SERVER') -> back to brillservice (default)\n// BRILL_SERVER accepts:\n//   (unset)      https://brillservice.aalborgdata.dk   - the default\n//   'local'      http://localhost:5200                 - Brill's plain HTTP port\n//   'localssl'   https://localhost:7200                - Brill's SSL port\n//   any URL      used verbatim, e.g. 'https://localhost:7200' or a staging host\n//\n// The SSL port is worth preferring for local work: BBO is served over HTTPS, so calling\n// http://localhost:5200 is a mixed-content request. Browsers normally exempt localhost from\n// mixed-content blocking, but that exemption has moved around between versions - if bids\n// silently stop arriving with 'local', check the console for a blocked request and switch\n// to 'localssl'.\ngetBrillBaseUrl = function () {\n\tvar s = localStorage.getItem('BRILL_SERVER');\n\tif (!s) return 'https://brillservice.aalborgdata.dk';\n\tif (/^https?:\\/\\//i.test(s)) return s.replace(/\\/+$/, '');\n\tif (s === 'local') return 'http://localhost:5200';\n\tif (s === 'localssl') return 'https://localhost:7200';\n\treturn 'https://brillservice.aalborgdata.dk';\n}\n// Player naming for the saved PBN. The server stamps names on the board-saving calls (/play,\n// /claim, /pbn/finalize) into [North]/[East]/[South]/[West] and derives [Room] from the board\n// label (Open, or Closed when it ends in _robot).\n//\n// On a live BBO table Brill drives ONLY our own seat (every action is gated on isItMe()==whoAmI),\n// so the OTHER three seats are BBO's own robots (GIB / Ben / an opponent), each with its own name.\n// Recording all three as \"Brill\" (the old getRobotName) was wrong on two counts: they aren't Brill,\n// and the seat Brill actually played was ours. So we now send the ACTUAL name at each seat and label\n// only the Brill-driven seat \"Brill\". getSeatDisplayName(dir) returns \"Brill\" for our own seat and\n// BBO's on-screen name for the rest; sent per-seat as &south/&north/&east/&west.\n// user= is a caller/tool identity tag the server ignores, so it is not sent on these calls.\ngetRobotName = function () {\n\treturn \"Brill\";\n}\ngetSeatDisplayName = function (dir) {\n\tvar name = (getPlayerAtSeat(dir) || \"\").trim();\n\t// Our own seat is the one Brill operates -- match on the on-screen name (same test isItMe uses)\n\t// with deal[\"seat\"] as a fallback for when the name isn't rendered at save time. Label it \"Brill\".\n\tvar me = (typeof whoAmI === \"function\" ? (whoAmI() || \"\") : \"\").trim();\n\tvar isHeroSeat = (name && me && name.toLowerCase() === me.toLowerCase())\n\t\t|| (typeof deal !== \"undefined\" && deal && deal[\"seat\"] === dir);\n\tif (isHeroSeat) return getRobotName();\n\treturn name; // BBO's own name for this seat (GIB / Ben / opponent)\n}\nnewdeal = true\ndealnumber = \"\"\ndeal = {}\nbiddingInProgress = false\nplayInProgress = false\nlastBidCtx = null\nlastPlayKey = null\nfinalPlaySent = false\nclaimDetected = false\ngetSuit = function (txt) {\n\tlet t = txt;\n\tswitch (t) {\n\t\tcase 'C':\n\t\tcase '♣':\n\t\tcase '♧':\n\t\t\treturn 3; // Clubs\n\t\tcase 'D':\n\t\tcase '♦':\n\t\tcase '♢':\n\t\t\treturn 2; // Diamonds\n\t\tcase 'H':\n\t\tcase '♥':\n\t\tcase '♡':\n\t\t\treturn 1; // Hearts\n\t\tcase 'S':\n\t\tcase '♠':\n\t\tcase '♤':\n\t\t\treturn 0; // Spades\n\t\tdefault:\n\t\t\treturn -1; // Unknown symbol\n\t}\n}\n\ngetSuitPlayed = function (txt) {\n\tlet t = txt;\n\tswitch (t) {\n\t\tcase 'C':\n\t\tcase '♣':\n\t\tcase '♧':\n\t\t\treturn 'C'; // Clubs\n\t\tcase 'D':\n\t\tcase '♦':\n\t\tcase '♢':\n\t\t\treturn 'D'; // Diamonds\n\t\tcase 'H':\n\t\tcase '♥':\n\t\tcase '♡':\n\t\t\treturn 'H'; // Hearts\n\t\tcase 'S':\n\t\tcase '♠':\n\t\tcase '♤':\n\t\t\treturn 'S'; // Spades\n\t\tdefault:\n\t\t\treturn -1; // Unknown symbol\n\t}\n}\n\nformatCards = function (cards) {\n\tlet suits = [\"\", \"\", \"\", \"\"];\n\tfor (c of cards) {\n\t\tlet suit = getSuit(c[c.length - 1])\n\t\tif (suit != -1) {\n\t\t\tsuits[suit] = c[0].replace(\"1\", \"T\") + suits[suit];\n\t\t}\n\t}\n\tlet hand = suits.join(\".\");\n\treturn hand;\n}\n\nformatCardsPlayed = function (cards) {\n\tlet played = cards.join(\"\");\n\treturn played;\n}\n\nformatCardsDisplayed = function (cards) {\n\tlet played = \"\";\n\tlet suits = [\"\", \"\", \"\", \"\"];\n\t// Loop over the string in steps of 2 characters\n\tif (typeof cards !== \"string\") {\n\t\t//console.error(\"Invalid input: cards should be a string.\");\n\t\t//console.error(\"Received: \", cards);\n\t\tcards = cards.join(\"\");\n\t}\n\t\n\tfor (let i = 0; i < cards.length; i += 2) {\n\t\tlet card = cards.substring(i, i + 2); // Get a pair of characters from the string\n\t\tlet suit = getSuit(card.charAt(1)); // Get the suit from the second character\n\t\tif (suit != -1) {\n\t\t\tsuits[suit] = card[0].replace(\"1\", \"T\") + suits[suit];\n\t\t}\n\t}\n\tplayed = suits.join(\".\")\n\treturn played;\n}\n\n// Inject a stylesheet ONCE that hides ad slots with !important so GPT/Prebid\n// re-injection can't override it. Also nukes ad iframes to kill their scripts\n// (GPT refresh cycles burn CPU even on display:none elements).\nremoveAds = function (on) {\n\tif (!on) return;\n\ttry {\n\t\tvar doc = parent.window.document;\n\t\t// 1) Persistent CSS - hides ads even if BBO/GPT re-injects them\n\t\tif (!doc.getElementById(\"brill-no-ads-css\")) {\n\t\t\tvar style = doc.createElement(\"style\");\n\t\t\tstyle.id = \"brill-no-ads-css\";\n\t\t\tstyle.textContent =\n\t\t\t\t\"#bbo_ad1, #bbo_ad2, [id^='bbo_ad'], \" +\n\t\t\t\t\"iframe[src*='googleads'], iframe[src*='securepubads'], \" +\n\t\t\t\t\"iframe[src*='doubleclick'], iframe[src*='amazon-adsystem'], \" +\n\t\t\t\t\"iframe[src*='adnxs'], iframe[src*='googlesyndication'], \" +\n\t\t\t\t\".adsbygoogle { display: none !important; visibility: hidden !important; width: 0 !important; height: 0 !important; }\" +\n\t\t\t\t\"#bbo_app { left: 0px !important; right: 0px !important; width: auto !important; }\";\n\t\t\tdoc.head.appendChild(style);\n\t\t}\n\t\t// 2) Actively remove ad iframes - stops their JS from running and saves CPU\n\t\t$(\"iframe[src*='googleads'], iframe[src*='securepubads'], \" +\n\t\t  \"iframe[src*='doubleclick'], iframe[src*='amazon-adsystem'], \" +\n\t\t  \"iframe[src*='adnxs'], iframe[src*='googlesyndication']\", doc).remove();\n\t\t// 3) Empty the ad slot containers (their inner GPT div+iframe go away)\n\t\t$(\"#bbo_ad1, #bbo_ad2\", doc).empty();\n\t} catch (e) {\n\t\tconsole.error(getNow(true) + \" removeAds error:\", e);\n\t}\n};\n\nremoveAds(true);\n// GPT re-runs auctions every ~30s. Re-empty the ad slots periodically to keep iframes from\n// taking back over. Cheap: one jQuery query + .remove() per tick. CSS keeps them invisible.\nif (typeof brillAdInterval === \"undefined\" || !brillAdInterval) {\n\tbrillAdInterval = setInterval(function () { removeAds(true); }, 15000);\n}\n\nupdatePlayedCards = function (recordedPlays) {\n\tlet cards = getPlayedCards()\n\n\tfor (let i = 0; i < cards.length; i += 2) {\n\t\tlet card = cards.substring(i, i + 2); // Get a pair of characters from the string\n\t\tlet suit = getSuitPlayed(card.charAt(1)); // Get the suit from the second character\n\t\tif (suit != -1) {\n\t\t\tvar played = suit + card.charAt(0).replace(\"1\", \"T\"); // Append the suit and rank to the result\n\t\t\tif (!cardExists(played, recordedPlays)) {\n\t\t\t\trecordedPlays.push(played);\n\t\t\t}\n\t\t}\n\t}\n\treturn recordedPlays;\n}\n\n// Defensive dedupe - despite cardExists checks, duplicates have been observed (probably from brief\n// screen states where a previous trick's winning card is still rendered alongside the new trick).\n// Sending duplicates to the server triggers \"No cards remaining\" errors.\ndedupePlayedCards = function (cards) {\n\tif (!cards || cards.length == 0) return cards;\n\tvar seen = {};\n\tvar result = [];\n\tfor (var i = 0; i < cards.length; i++) {\n\t\tvar c = cards[i];\n\t\tif (seen[c]) {\n\t\t\tconsole.warn(getNow(true) + \" dedupe: dropping duplicate \" + c + \" at index \" + i);\n\t\t\tcontinue;\n\t\t}\n\t\tseen[c] = true;\n\t\tresult.push(c);\n\t}\n\treturn result;\n}\n\ngetTrumpSuit = function(ctx) {\n\t// Find the last real bid (not pass/double/redouble) to determine trump suit\n\tfor (var i = ctx.length - 2; i >= 0; i -= 2) {\n\t\tvar bid = ctx.substring(i, i + 2);\n\t\tif (bid != \"--\" && bid != \"Db\" && bid != \"Rd\") {\n\t\t\tvar suit = bid.charAt(1);\n\t\t\tif (suit == \"N\") return \"\"; // No Trump\n\t\t\treturn suit; // S, H, D, or C\n\t\t}\n\t}\n\treturn \"\";\n}\n\n// Reconstruct any direction's original 13-card hand by combining the cards\n// currently visible on screen with the cards that direction has already played.\nreconstructHand = function (direction, currentCards, playedCards, declarerDir, ctx) {\n\tif (!playedCards || playedCards.length == 0) return formatCards(currentCards || []);\n\tif (!declarerDir) return formatCards(currentCards || []);\n\n\tvar trumpSuit = getTrumpSuit(ctx);\n\tvar leaderDir = \"NESWNESW\".charAt(\"NESW\".indexOf(declarerDir) + 1);\n\tvar ranks = \"23456789TJQKA\";\n\tvar dirPlayedCards = [];\n\tvar currentLeader = leaderDir;\n\n\tvar fullTricks = Math.floor(playedCards.length / 4);\n\tfor (var t = 0; t < fullTricks; t++) {\n\t\tvar trickStart = t * 4;\n\t\tvar playOrder = [];\n\t\tvar dir = currentLeader;\n\t\tfor (var j = 0; j < 4; j++) {\n\t\t\tplayOrder.push(dir);\n\t\t\tdir = \"NESWNESW\".charAt(\"NESW\".indexOf(dir) + 1);\n\t\t}\n\t\tfor (var j = 0; j < 4; j++) {\n\t\t\tif (playOrder[j] == direction) {\n\t\t\t\tdirPlayedCards.push(playedCards[trickStart + j]);\n\t\t\t\tbreak;\n\t\t\t}\n\t\t}\n\t\t// Determine winner to track next leader\n\t\tvar leadSuit = playedCards[trickStart].charAt(0);\n\t\tvar winnerIdx = 0;\n\t\tvar winnerRank = ranks.indexOf(playedCards[trickStart].charAt(1));\n\t\tvar winnerIsTrump = (leadSuit == trumpSuit);\n\t\tfor (var j = 1; j < 4; j++) {\n\t\t\tvar cardSuit = playedCards[trickStart + j].charAt(0);\n\t\t\tvar cardRank = ranks.indexOf(playedCards[trickStart + j].charAt(1));\n\t\t\tif (trumpSuit != \"\" && cardSuit == trumpSuit && !winnerIsTrump) {\n\t\t\t\twinnerIdx = j; winnerRank = cardRank; winnerIsTrump = true;\n\t\t\t} else if (trumpSuit != \"\" && cardSuit == trumpSuit && winnerIsTrump && cardRank > winnerRank) {\n\t\t\t\twinnerIdx = j; winnerRank = cardRank;\n\t\t\t} else if (cardSuit == leadSuit && !winnerIsTrump && cardRank > winnerRank) {\n\t\t\t\twinnerIdx = j; winnerRank = cardRank;\n\t\t\t}\n\t\t}\n\t\tcurrentLeader = playOrder[winnerIdx];\n\t}\n\t// Handle incomplete trick (cards played but trick not finished)\n\tvar remainingCards = playedCards.length % 4;\n\tif (remainingCards > 0) {\n\t\tvar trickStart = fullTricks * 4;\n\t\tvar dir = currentLeader;\n\t\tfor (var j = 0; j < remainingCards; j++) {\n\t\t\tif (dir == direction) {\n\t\t\t\tdirPlayedCards.push(playedCards[trickStart + j]);\n\t\t\t}\n\t\t\tdir = \"NESWNESW\".charAt(\"NESW\".indexOf(dir) + 1);\n\t\t}\n\t}\n\t// Combine: currentCards is rank+suit format (\"KD\"); playedCards entries are suit+rank (\"DK\")\n\t// Dedupe defensively - currentCards may already include cards from the current trick that are\n\t// also in the played array, which would otherwise produce a hand > 13 cards.\n\tvar seen = {};\n\tvar allCards = [];\n\tfor (var i = 0; i < (currentCards || []).length; i++) {\n\t\tvar c = currentCards[i];\n\t\tif (!seen[c]) { seen[c] = true; allCards.push(c); }\n\t}\n\tfor (var i = 0; i < dirPlayedCards.length; i++) {\n\t\tvar played = dirPlayedCards[i];\n\t\tvar asCard = played.charAt(1) + played.charAt(0);\n\t\tif (!seen[asCard]) { seen[asCard] = true; allCards.push(asCard); }\n\t}\n\treturn formatCards(allCards);\n}\n\n// True iff a hand string has exactly 13 cards across 4 dot-separated suits.\nisValidHand = function (handStr) {\n\tif (!handStr) return false;\n\tvar parts = handStr.split(\".\");\n\tif (parts.length != 4) return false;\n\treturn (parts[0].length + parts[1].length + parts[2].length + parts[3].length) == 13;\n}\n\n// Read all 4 hands from the screen, reconstructing originals when only remaining cards are visible.\n// Returns { N, E, S, W } - each value is a hand string in PBN-suit format (e.g. \"AKx.xxxx.xx.xxx\")\n// or \"\" if the seat isn't visible / produced an invalid count. Server tolerates \"\" and fills via\n// 52-card-elimination from the seats it does receive.\n//\n// Seeds with reliable deal[\"hand\"]/deal[\"dummy\"] data first, since at claim time the announcement\n// panel may obscure cards or BBO may be in a transitional render state where getCardsByDirection\n// returns nothing. Screen reads override the seed if they produce a valid 13-card hand.\ngetAllHands = function () {\n\tvar hands = { N: \"\", E: \"\", S: \"\", W: \"\" };\n\tvar declarerDir = getDeclarerDirection();\n\tvar ctx = (deal && deal[\"ctx\"]) || getContext() || \"\";\n\tvar played = (deal && deal[\"played\"]) || [];\n\n\t// Seed with deal data: our seat's hand and the dummy's hand are known reliably from earlier\n\t// in the deal, so use them as defaults regardless of whether the screen reads succeed.\n\tif (deal && deal[\"seat\"] && deal[\"hand\"] && isValidHand(deal[\"hand\"])) {\n\t\thands[deal[\"seat\"]] = deal[\"hand\"];\n\t}\n\tif (deal && deal[\"dummy\"] && declarerDir && isValidHand(deal[\"dummy\"])) {\n\t\tvar dummySeat = \"NESWNESW\".charAt(\"NESW\".indexOf(declarerDir) + 2);\n\t\thands[dummySeat] = deal[\"dummy\"];\n\t}\n\n\t// Then try screen reads - a successful 13-card read overrides the seed (more authoritative)\n\t// and may also fill in opponents we couldn't seed.\n\tvar dirs = [\"N\", \"E\", \"S\", \"W\"];\n\tfor (var i = 0; i < dirs.length; i++) {\n\t\tvar dir = dirs[i];\n\t\tvar cards = getCardsByDirection(dir);\n\t\tif (!cards || cards.length == 0) continue;\n\t\t// Defensive: if zIndex filter picked up too many cards (e.g. animation pushed everything\n\t\t// to z-index \"100\" which startsWith(\"1\") matches for S), skip - sending garbage hurts more.\n\t\tif (cards.length > 13) {\n\t\t\tconsole.warn(getNow(true) + \" getAllHands: \" + dir + \" has \" + cards.length + \" visible cards (>13), skipping\");\n\t\t\tcontinue;\n\t\t}\n\t\tvar formatted;\n\t\tif (cards.join(\"\").length == 26) {\n\t\t\t// 13 cards visible -> hand is original\n\t\t\tformatted = formatCards(cards);\n\t\t} else if (declarerDir && played.length > 0) {\n\t\t\tformatted = reconstructHand(dir, cards, played, declarerDir, ctx);\n\t\t} else {\n\t\t\tformatted = formatCards(cards);\n\t\t}\n\t\tif (isValidHand(formatted)) {\n\t\t\thands[dir] = formatted;\n\t\t} else if (!hands[dir]) {\n\t\t\tconsole.warn(getNow(true) + \" getAllHands: \" + dir + \" produced invalid hand \\\"\" + formatted +\n\t\t\t\t\"\\\" (visible=\" + cards.length + \", played=\" + played.length + \"), keeping empty\");\n\t\t}\n\t}\n\treturn hands;\n}\n\nreconstructDummy = function(currentDummyCards, playedCards, declarerDir, ctx) {\n\t// Reconstruct original dummy hand by adding back cards played from dummy's position\n\tif (!playedCards || playedCards.length == 0) return formatCards(currentDummyCards);\n\n\tvar trumpSuit = getTrumpSuit(ctx);\n\tvar dummyDir = \"NESWNESW\".charAt(\"NESW\".indexOf(declarerDir) + 2);\n\t// Opening leader is to the left of declarer (clockwise)\n\tvar leaderDir = \"NESWNESW\".charAt(\"NESW\".indexOf(declarerDir) + 1);\n\n\tvar ranks = \"23456789TJQKA\";\n\tvar dummyPlayedCards = [];\n\tvar currentLeader = leaderDir;\n\n\t// Process complete tricks\n\tvar fullTricks = Math.floor(playedCards.length / 4);\n\tfor (var t = 0; t < fullTricks; t++) {\n\t\tvar trickStart = t * 4;\n\t\t// Determine play order for this trick: leader, then clockwise\n\t\tvar playOrder = [];\n\t\tvar dir = currentLeader;\n\t\tfor (var j = 0; j < 4; j++) {\n\t\t\tplayOrder.push(dir);\n\t\t\tdir = \"NESWNESW\".charAt(\"NESW\".indexOf(dir) + 1);\n\t\t}\n\n\t\t// Find dummy's card in this trick\n\t\tfor (var j = 0; j < 4; j++) {\n\t\t\tif (playOrder[j] == dummyDir) {\n\t\t\t\tdummyPlayedCards.push(playedCards[trickStart + j]);\n\t\t\t\tbreak;\n\t\t\t}\n\t\t}\n\n\t\t// Determine trick winner to know who leads next\n\t\tvar leadSuit = playedCards[trickStart].charAt(0);\n\t\tvar winnerIdx = 0;\n\t\tvar winnerRank = ranks.indexOf(playedCards[trickStart].charAt(1));\n\t\tvar winnerIsTrump = (leadSuit == trumpSuit);\n\n\t\tfor (var j = 1; j < 4; j++) {\n\t\t\tvar cardSuit = playedCards[trickStart + j].charAt(0);\n\t\t\tvar cardRank = ranks.indexOf(playedCards[trickStart + j].charAt(1));\n\n\t\t\tif (trumpSuit != \"\" && cardSuit == trumpSuit && !winnerIsTrump) {\n\t\t\t\twinnerIdx = j;\n\t\t\t\twinnerRank = cardRank;\n\t\t\t\twinnerIsTrump = true;\n\t\t\t} else if (trumpSuit != \"\" && cardSuit == trumpSuit && winnerIsTrump && cardRank > winnerRank) {\n\t\t\t\twinnerIdx = j;\n\t\t\t\twinnerRank = cardRank;\n\t\t\t} else if (cardSuit == leadSuit && !winnerIsTrump && cardRank > winnerRank) {\n\t\t\t\twinnerIdx = j;\n\t\t\t\twinnerRank = cardRank;\n\t\t\t}\n\t\t}\n\t\tcurrentLeader = playOrder[winnerIdx];\n\t}\n\n\t// Handle incomplete trick (cards played but trick not finished)\n\tvar remainingCards = playedCards.length % 4;\n\tif (remainingCards > 0) {\n\t\tvar trickStart = fullTricks * 4;\n\t\tvar dir = currentLeader;\n\t\tfor (var j = 0; j < remainingCards; j++) {\n\t\t\tif (dir == dummyDir) {\n\t\t\t\tdummyPlayedCards.push(playedCards[trickStart + j]);\n\t\t\t}\n\t\t\tdir = \"NESWNESW\".charAt(\"NESW\".indexOf(dir) + 1);\n\t\t}\n\t}\n\n\t// Combine current visible dummy cards with dummy's played cards\n\t// currentDummyCards: array of \"rank+suit\" like [\"KD\", \"4S\"]\n\t// dummyPlayedCards: array of \"suit+rank\" like [\"DK\", \"S4\"]\n\tvar allDummyCards = currentDummyCards.slice();\n\tfor (var i = 0; i < dummyPlayedCards.length; i++) {\n\t\tvar played = dummyPlayedCards[i];\n\t\tvar asCard = played.charAt(1) + played.charAt(0); // \"DK\" -> \"KD\"\n\t\tallDummyCards.push(asCard);\n\t}\n\n\tconsole.log(getNow(true) + \" reconstructDummy: visible=\" + currentDummyCards.length +\n\t\t\" dummyPlayed=\" + JSON.stringify(dummyPlayedCards) + \" total=\" + allDummyCards.length);\n\treturn formatCards(allDummyCards);\n}\n\ntriggerMouseEvent = function (node, eventType) {\n\tlet clickEvent = document.createEvent('MouseEvents');\n\tclickEvent.initEvent(eventType, true, true);\n\tnode.dispatchEvent(clickEvent);\n}\n\nmakePlay = function(cv) {\n    var card = getCardByValue(cv);\n    if (card != null) {\n\t\ttriggerMouseEvent(card, 'mouseover');\n\t\ttriggerMouseEvent(card, 'mousedown');\n\t\ttriggerMouseEvent(card, 'mouseup');\n\t\t//card.click();\n\t}\n}\n\n// Poll test() every interval ms until it returns something truthy or timeout ms have passed.\n// Calls back with the truthy value, or with null on timeout.\nwaitFor = function (test, timeout, interval, callback) {\n    var waited = 0;\n    (function poll() {\n        var result = null;\n        try { result = test(); } catch (e) { }\n        if (result) return callback(result);\n        if (waited >= timeout) return callback(null);\n        waited += interval;\n        setTimeout(poll, interval);\n    })();\n}\n\ngetClaimRejectedNotification = function () {\n    var n = $(\".notificationClass div:visible:contains('Claim rejected')\", PWD);\n    return n.length > 0 ? n : null;\n}\n\n// Claim 'tricks' tricks. The callback gets true only when the claim really went through.\n// Every other outcome - rejected, dialog never opened, opponents never answered - calls back\n// with false, because the caller then has to play a card: after a claim that goes nowhere no\n// card is played, so BBO fires no onNewPlayedCard and nothing else restarts the play flow.\nmakeClaim = function (tricks, card, callback) {\n    var tricksText = parseInt(tricks);\n    var settled = false;\n    var finish = function (accepted, reason) {\n        if (settled) return;\n        settled = true;\n        console.log(getNow(true) + \" Claim \" + (accepted ? \"accepted\" : \"not accepted\") + \" - \" + reason);\n        callback(accepted);\n    };\n    var cancelDialog = function () {\n        $(\"claim-dialog button:contains('Cancel')\", PWD).first().click();\n    };\n\n    // Step 1: Click the initial Claim button\n    $(\".claimButtonClass:contains('Claim')\", PWD).click();\n\n    // Step 2: wait for the dialog to render, then click the button for the number of tricks\n    waitFor(function () {\n        var b = $(\"claim-dialog button\", PWD).filter(function () {\n            return $(this).text().trim() === tricksText.toString();\n        });\n        return b.length > 0 ? b.first() : null;\n    }, 3000, 100, function (trickButton) {\n        if (!trickButton) {\n            cancelDialog();\n            return finish(false, \"claim dialog did not offer \" + tricksText + \" tricks\");\n        }\n        trickButton.click();\n\n        // Step 3: wait for the final 'Claim' confirmation button, then click it\n        waitFor(function () {\n            var b = $(\"claim-dialog button\", PWD).filter(function () {\n                var t = $(this).text().trim();\n                return t.toLowerCase() === \"claim\" ||\n                    (t.indexOf(\"Claim\") > -1 && t.toLowerCase().indexOf(\"cancel\") === -1);\n            });\n            return b.length > 0 ? b.first() : null;\n        }, 2000, 100, function (confirmButton) {\n            if (!confirmButton) {\n                cancelDialog();\n                return finish(false, \"confirmation button never appeared\");\n            }\n            confirmButton.click();\n\n            // Step 4: opponents can take several seconds to answer, so poll for the outcome\n            // instead of deciding after a fixed delay. Only an emptied hand counts as accepted -\n            // a timeout while we still hold cards is treated as \"not accepted\" so we play on.\n            waitFor(function () {\n                var rejected = getClaimRejectedNotification();\n                if (rejected) return { rejected: rejected };\n                if (getMyCards().length == 0) return { accepted: true };\n                return null;\n            }, 10000, 200, function (outcome) {\n                if (outcome && outcome.rejected) {\n                    outcome.rejected.parent().hide();\n                    return finish(false, \"claim rejected\");\n                }\n                if (outcome && outcome.accepted) return finish(true, \"claimed \" + tricks + \" tricks\");\n                finish(false, \"no answer to the claim\");\n            });\n        });\n    });\n};\n\n// Check if this should be changed to SelectBid\nmakeBid = function (bid, artificial, explain) {\n\tlet elBiddingBox = parent.document.querySelector('.biddingBoxClass');\n\tif (elBiddingBox != null) {\n\t\tlet elBiddingButtons = elBiddingBox.querySelectorAll('.biddingBoxButtonClass');\n\t\tlet alertField = elBiddingBox.querySelector('.mat-form-field-infix').querySelector('input');\n\t\talertField.value = unescape(explain);\n\t\tlet eventInput = new Event('input');\n\t\talertField.dispatchEvent(eventInput);\n\t\tif (elBiddingButtons != null) {\n\t\t\tif (elBiddingBox.style.display != 'none') {\n\t\t\t\tif (artificial == 1) elBiddingButtons[15].click();\n\t\t\t\tif (bid == 'PASS') triggerMouseEvent(elBiddingButtons[12], 'mousedown');\n\t\t\t\tif (bid == 'PASS') elBiddingButtons[12].click();\n\t\t\t\tif (bid == 'P') triggerMouseEvent(elBiddingButtons[12], 'mousedown');\n\t\t\t\tif (bid == 'P') elBiddingButtons[12].click();\n\t\t\t\tif (bid == 'X') triggerMouseEvent(elBiddingButtons[13], 'mousedown');\n\t\t\t\tif (bid == 'X') elBiddingButtons[13].click();\n\t\t\t\tif (bid == 'XX') triggerMouseEvent(elBiddingButtons[14], 'mousedown');\n\t\t\t\tif (bid == 'XX') elBiddingButtons[14].click();\n\t\t\t\tif (bid[0] == '1') elBiddingButtons[0].click();\n\t\t\t\tif (bid[0] == '2') elBiddingButtons[1].click();\n\t\t\t\tif (bid[0] == '3') elBiddingButtons[2].click();\n\t\t\t\tif (bid[0] == '4') elBiddingButtons[3].click();\n\t\t\t\tif (bid[0] == '5') elBiddingButtons[4].click();\n\t\t\t\tif (bid[0] == '6') elBiddingButtons[5].click();\n\t\t\t\tif (bid[0] == '7') elBiddingButtons[6].click();\n\t\t\t\tif (bid[1] == 'C') triggerMouseEvent(elBiddingButtons[7], 'mousedown');\n\t\t\t\tif (bid[1] == 'C') elBiddingButtons[7].click();\n\t\t\t\tif (bid[1] == 'D') triggerMouseEvent(elBiddingButtons[8], 'mousedown');\n\t\t\t\tif (bid[1] == 'D') elBiddingButtons[8].click();\n\t\t\t\tif (bid[1] == 'H') triggerMouseEvent(elBiddingButtons[9], 'mousedown');\n\t\t\t\tif (bid[1] == 'H') elBiddingButtons[9].click();\n\t\t\t\tif (bid[1] == 'S') triggerMouseEvent(elBiddingButtons[10], 'mousedown');\n\t\t\t\tif (bid[1] == 'S') elBiddingButtons[10].click();\n\t\t\t\tif (bid[1] == 'N') triggerMouseEvent(elBiddingButtons[11], 'mousedown');\n\t\t\t\tif (bid[1] == 'N') elBiddingButtons[11].click();\n\t\t\t}\n\t\t}\n\t};\n}\n\naddSpinner = function () {\n\t// Create the spinner element\n\tconst spinner = parent.document.createElement('div');\n\tspinner.classList.add('spinner');\n\tspinner.style.width = '50px';\n\tspinner.style.height = '50px';\n\tspinner.style.border = '5px solid #f3f3f3';\n\tspinner.style.borderRadius = '50%';\n\tspinner.style.borderTop = '5px solid #3498db';\n\tspinner.style.animation = 'loader 1s linear infinite';\n\n\t// Create the overlay element\n\tconst overlay = parent.document.createElement('div');\n\toverlay.classList.add('overlay');\n\toverlay.style.position = 'fixed';\n\toverlay.style.top = '58%'; // Adjust top position to center vertically\n\toverlay.style.left = '40%'; // Adjust left position to center horizontally\n\toverlay.style.transform = 'translate(-50%, -50%)'; // Center the overlay\n\toverlay.style.width = '160px'; // Adjust the width of the overlay\n\toverlay.style.height = '160px'; // Adjust the height of the overlay\n\toverlay.style.backgroundColor = 'rgba(0, 0, 0, 0)'; // Adjust the transparency\n\toverlay.style.zIndex = '9999';\n\toverlay.style.display = 'flex';\n\toverlay.style.justifyContent = 'center';\n\toverlay.style.alignItems = 'center';\n\t// Append the spinner to the overlay\n\toverlay.appendChild(spinner);\n\n\t// Append the overlay to the document body\n\tparent.document.body.appendChild(overlay);\n\t//console.log(\"adding spinner\")\n\treturn overlay\n}\n\nremoveSpinner = function (overlay) {\n\tif (overlay) {\n\t\tparent.document.body.removeChild(overlay);\n\t\t//console.log(\"removing spinner\")\n\t\toverlay = null;\n\t}\n\treturn overlay;\n}\n\nBrillsTurnToBid = function (overlay) {\n\tif (newdeal) {\n\t\tif (typeof initdeal === \"function\") initdeal();\n\t}\n\ttry {\n\t\t// State may have advanced while this call was deferred - bail if it's no longer our turn\n\t\tif (!isMyTurnToBid()) {\n\t\t\tconsole.log(getNow(true) + \" BrillsTurnToBid aborted - no longer my turn to bid\");\n\t\t\toverlay = removeSpinner(overlay);\n\t\t\tbiddingInProgress = false;\n\t\t\treturn;\n\t\t}\n\t\t// alert(getMyCards())\n\t\t// Due to timing we don't have the hand, so we try to get it again\n\t\tif (!deal[\"hand\"]  || deal[\"hand\"].length < 13) {\n\t\t\tconsole.log(getNow(true) + \" Updated hand due to timing\" + deal[\"hand\"] + \" \" + myCardsDisplayed)\n\t\t\tif (getMyCards().length > 26) {\n\t\t\t\tconsole.warn(getNow(true) + \" Hand is too big, something is wrong: \" + getMyCards())\n\t\t\t}\n\t\t\tdeal[\"hand\"] = formatCards(getMyCards())\n\t\t}\n\n\t\tvar ctx = getContext()\n\t\tdeal[\"ctx\"] = ctx\n\t\tvar user = deal[\"user\"]\n\t\tvar dealer = deal[\"dealer\"]\n\t\tvar seat = deal[\"seat\"]\n\t\tvar vul = deal[\"vul\"]\n\t\tvar hand = deal[\"hand\"]\n\t\tvar dealnumber = getDealNumber()\n\t\t// Same board/session tagging as /lead and /play: board = the PLAIN board number,\n\t\t// pbn_label = the groupable \"<session>_b<N>\" (names the bid log), event = the match\n\t\t// name. The server stamps board + event onto the game it bids, so a missing auction\n\t\t// context recorded here says which board of which tournament produced it.\n\t\tvar url = getBrillBaseUrl() + \"/bid?user=\" + user + \"&dealer=\" + dealer + \"&dealno=\" + dealnumber + \"&seat=\" + seat + \"&vul=\" + vul + \"&ctx=\" + ctx + \"&hand=\" + hand +\n\t\t\t\"&board=\" + encodeURIComponent(dealnumber) +\n\t\t\t\"&pbn_label=\" + encodeURIComponent(getBoardLabel()) +\n\t\t\t\"&event=\" + encodeURIComponent(getEventName())\n\t\tvar bidTournamentType = getTournamentType()\n\t\tif (bidTournamentType != \"\") {\n\t\t\turl += \"&tournament=\" + bidTournamentType\n\t\t}\n\t\tconsole.log(getNow(true) + \" BrillsTurnToBid Requesting \" + url)\n\t\ttry {\n\t\t\tfetch(url, {\n\t\t\t\tcache: \"no-store\"\n\t\t\t})\n\t\t\t\t.then(function (response) {\n\t\t\t\t\tconsole.log(getNow(true) + \" BrillsTurnToBid Response from \" + url)\n\t\t\t\t\t// Check if the response is successful\n\t\t\t\t\tif (!response.ok) {\n\t\t\t\t\t\toverlay = removeSpinner(overlay);\n\t\t\t\t\t\t// Log the response status and status text\n\t\t\t\t\t\tconsole.error(getNow(true) + 'Response not OK:', response.status, response.statusText);\n\n\t\t\t\t\t\t// Parse the response body as JSON and handle the error\n\t\t\t\t\t\treturn response.json().then(function (errorResponse) {\n\t\t\t\t\t\t\t// Extract the error message from the JSON response\n\t\t\t\t\t\t\tconst errorMessage = errorResponse.error || 'Unknown error occurred';\n\n\t\t\t\t\t\t\t// Show the error message to the user\n\t\t\t\t\t\t\talert(errorMessage);\n\t\t\t\t\t\t\tthrow new Error(errorMessage); // Throw an error to skip to the catch block\n\t\t\t\t\t\t});\n\t\t\t\t\t}\n\n\t\t\t\t\t// If response is OK, parse the response as JSON\n\t\t\t\t\treturn response.json();\n\t\t\t\t})\n\t\t\t\t.then(function (data) {\n\t\t\t\t\t// Proceed with the logic if the response was successful\n\t\t\t\t\tif (data.message) {\n\t\t\t\t\t\tconsole.log(getNow(true) + \" Brill return message:\",data.message)\n\t\t\t\t\t\toverlay = removeSpinner(overlay);\n\t\t\t\t\t\tbiddingInProgress = false;\n\t\t\t\t\t} else {\n\t\t\t\t\t\tconsole.log(getNow(true) + \" BrillsTurnToBid Brill would like to bid:\",data.bid)\n\t\t\t\t\t\t// Re-check turn AT CLICK TIME (inside setTimeout) - state may advance between now and when the macrotask runs\n\t\t\t\t\t\tsetTimeout(() => {\n\t\t\t\t\t\t\tif (isMyTurnToBid()) {\n\t\t\t\t\t\t\t\tmakeBid(data.bid, 0, \"\");\n\t\t\t\t\t\t\t} else {\n\t\t\t\t\t\t\t\tconsole.log(getNow(true) + \" Skipping bid click - no longer my turn to bid\")\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t}, 0);\n\t\t\t\t\t\toverlay = removeSpinner(overlay);\n\t\t\t\t\t\tbiddingInProgress = false;\n\t\t\t\t\t}\n\t\t\t\t})\n\t\t\t\t.catch(function (error) {\n\t\t\t\t\toverlay = removeSpinner(overlay);\n\t\t\t\t\tbiddingInProgress = false;\n\t\t\t\t\t// Catch any errors that occurred during the fetch or processing\n\t\t\t\t\tconsole.error('Error occurred:', error.message);\n\t\t\t\t});\n\t\t} catch (error) {\n\t\t\t// Handle any errors that occur during the fetch request\n\t\t\talert('Error fetching data: ' + error.message);\n\t\t\t// Show an error message to the user or perform other error handling actions\n\t\t\toverlay = removeSpinner(overlay);\n\t\t\tbiddingInProgress = false;\n\t\t}\n\t\t// Before bid update and save deal - BBO seems to forget the bid if we leave after the bid / play\n\t\tsavedeal(dealnumber, deal)\n\t} catch (error) {\n\t\toverlay = removeSpinner(overlay);\n\t\tbiddingInProgress = false;\n\t}\n}\n\nBrillsTurnToPlay = function (overlay) {\n\tconsole.log(getNow(true) + \" BrillsTurnToPlay called\");\n\tif (newdeal) {\n\t\tif (typeof initdeal === \"function\") initdeal();\n\t}\n\ttry {\n\t\t// State may have advanced while this call was deferred - bail if it's no longer our turn\n\t\tif (!isMyTurnToPlay()) {\n\t\t\tconsole.log(getNow(true) + \" BrillsTurnToPlay aborted - no longer my turn to play\");\n\t\t\toverlay = removeSpinner(overlay);\n\t\t\tplayInProgress = false;\n\t\t\treturn;\n\t\t}\n\t\t// if (myCardsDisplayed.length == 26) {\n\t\t// \tconsole.log(getNow(true) + \" Updated hand with myCardsDisplayed \" + myCardsDisplayed + \" \" + deal[\"hand\"])\n\t\t// \tdeal[\"hand\"] = formatCardsDisplayed(myCardsDisplayed)\n\t\t// }\n\n\t\t// Due to timing we don't have the hand, so we try to get it again\n\t\tif (!deal[\"hand\"]  ||  deal[\"hand\"].length < 13) {\n\t\t\tconsole.log(getNow(true) + \" Updated hand due to timing\" + deal[\"hand\"] + \" \" + myCardsDisplayed)\n\t\t\tif (getMyCards().length > 26) {\n\t\t\t\tconsole.warn(getNow(true) + \" Too many cards in hand, something is wrong: \" + getMyCards())\n\t\t\t}\n\t\t\tdeal[\"hand\"] = formatCards(getMyCards())\n\t\t}\n\t\t\n\t\t// If we see 13 cards in dummy, we update the deal\n\t\tdc = getDummyCards()\n\t\tif (dc.join(\"\").length == 26) {\n\t\t\tdeal[\"dummy\"] = formatCards(dc)\n\t\t\t// We update both hand as BBO might rotate the deal\n\t\t\tif (deal[\"dummy\"] == deal[\"hand\"]) {\n\t\t\t\tconsole.log(getNow(true) + \" same hand for dummy and hand\")\n\t\t\t\tdeal[\"hand\"] = formatCards(getDeclarerCards())\n\t\t\t\tdeal[\"seat\"] = getDeclarerDirection()\n\t\t\t\tconsole.log(getNow(true) + \" \" + JSON.stringify(deal))\n\t\t\t}\n\t\t}\n\t\t\n\t\tdeal[\"played\"] = updatePlayedCards(deal[\"played\"])\n\t\tdeal[\"played\"] = dedupePlayedCards(deal[\"played\"])\n\n\t\t// Bail out if I have no cards left to play - the deal is effectively over\n\t\t// (this happens when an opponent claim transitions BBO state mid-call)\n\t\tif (getMyCards().length == 0 && deal[\"played\"].length > 0) {\n\t\t\tconsole.log(getNow(true) + \" BrillsTurnToPlay aborted - no cards in my hand, deal must be ending\");\n\t\t\toverlay = removeSpinner(overlay);\n\t\t\tplayInProgress = false;\n\t\t\treturn;\n\t\t}\n\n\t\thand = deal[\"hand\"]\n\t\tvar ctx = getContext()\n\t\tdeal[\"ctx\"] = ctx\n\t\tvar user = deal[\"user\"]\n\t\tvar dealer = deal[\"dealer\"]\n\t\tvar seat = deal[\"seat\"]\n\t\tvar vul = deal[\"vul\"]\n\t\tvar dealnumber = getDealNumber()\n\t\tif (deal[\"played\"].length == 52) {\n\t\t\tconsole.log(getNow(true) + \" BrillsTurnToPlay called, but Board is finished\");\n\t\t\tsendFinalPlay();\n\t\t\toverlay = removeSpinner(overlay);\n\t\t\tplayInProgress = false;\n\t\t\treturn\n\t\t}\n\t\tif (deal[\"played\"].length == 0) {\n\t\t\t// board = the PLAIN board number ([Board] tag / log context); pbn_label carries the\n\t\t\t// groupable \"<session>_b<N>\" name and event the challenge name (see getBoardLabel).\n\t\t\tvar url = getBrillBaseUrl() + \"/lead?user=\" + user + \"&dealer=\" + dealer + \"&dealno=\" + dealnumber + \"&seat=\" + seat + \"&vul=\" + vul + \"&ctx=\" + ctx + \"&hand=\" + hand +\n\t\t\t\t\"&board=\" + encodeURIComponent(dealnumber) +\n\t\t\t\t\"&pbn_label=\" + encodeURIComponent(getBoardLabel()) +\n\t\t\t\t\"&event=\" + encodeURIComponent(getEventName());\n\n\t\t} else {\n\t\t\tvar dummyhand = deal[\"dummy\"]\n\t\t\tif (dummyhand == \"\" || !dummyhand || dummyhand == \"...\") {\n\t\t\t\tconsole.log(getNow(true) + \" No dummy stored - getting dummy cards from screen\")\n\t\t\t\tdc = getDummyCards()\n\t\t\t\tif (dc.join(\"\").length == 26) {\n\t\t\t\t\tdeal[\"dummy\"] = formatCards(dc)\n\t\t\t\t} else {\n\t\t\t\t\t// Dummy cards incomplete on screen - reconstruct by adding back played cards\n\t\t\t\t\tconsole.log(getNow(true) + \" Dummy incomplete on screen (\" + dc.length + \" cards), reconstructing from played cards\")\n\t\t\t\t\tdeal[\"dummy\"] = reconstructDummy(dc, deal[\"played\"], getDeclarerDirection(), ctx)\n\t\t\t\t}\n\t\t\t\tdummyhand = deal[\"dummy\"]\n\t\t\t\tsavedeal(dealnumber, deal)\n\t\t\t}\n\t\t\t// Verify dummy has 13 cards before sending to API\n\t\t\tvar dummyCardCount = dummyhand.replace(/\\./g, \"\").length;\n\t\t\tif (dummyCardCount != 13) {\n\t\t\t\tconsole.error(getNow(true) + \" Dummy has \" + dummyCardCount + \" cards instead of 13: \" + dummyhand);\n\t\t\t\toverlay = removeSpinner(overlay);\n\t\t\t\tplayInProgress = false;\n\t\t\t\treturn;\n\t\t\t}\n\t\t\tvar playedCardsXX = formatCardsPlayed(deal[\"played\"])\n\t\t\tvar url = getBrillBaseUrl() + \"/play?user=\" + user + \"&dealer=\" + dealer + \"&dealno=\" + dealnumber + \"&seat=\" + seat + \"&vul=\" + vul + \"&ctx=\" + ctx + \"&hand=\" + hand +\n\t\t\t\t\"&dummy=\" + dummyhand + \"&played=\" + playedCardsXX +\n\t\t\t\t\"&board=\" + encodeURIComponent(dealnumber) +\n\t\t\t\t\"&pbn_label=\" + encodeURIComponent(getBoardLabel()) +\n\t\t\t\t\"&event=\" + encodeURIComponent(getEventName()) +\n\t\t\t\t\"&south=\" + encodeURIComponent(getSeatDisplayName(\"S\")) +\n\t\t\t\t\"&north=\" + encodeURIComponent(getSeatDisplayName(\"N\")) +\n\t\t\t\t\"&east=\" + encodeURIComponent(getSeatDisplayName(\"E\")) +\n\t\t\t\t\"&west=\" + encodeURIComponent(getSeatDisplayName(\"W\"));\n\t\t}\n\t\tvar tournamentType = getTournamentType()\n\t\tif (tournamentType != \"\") {\n\t\t\turl += \"&tournament=\" + tournamentType\n\t\t}\n\t\tconsole.log(getNow(true) + \" BrillsTurnToPlay Requesting \" + url)\n\t\ttry {\n\t\t\tfetch(url, {\n\t\t\t\tcache: \"no-store\"\n\t\t\t})\n\t\t\t\t.then(function (response) {\n\t\t\t\t\tconsole.log(getNow(true) + \" BrillsTurnToPlay Response from \" + url)\n\t\t\t\t\t// Check if the response is successful\n\t\t\t\t\tif (!response.ok) {\n\t\t\t\t\t\toverlay = removeSpinner(overlay);\n\t\t\t\t\t\tplayInProgress = false;\n\t\t\t\t\t\t// Log the response status and status text\n\t\t\t\t\t\tconsole.error(getNow(true) + ' Response not OK:', response.status, response.statusText);\n\t\t\n\t\t\t\t\t\t// Parse the response body as JSON and handle the error\n\t\t\t\t\t\treturn response.json().then(function (errorResponse) {\n\t\t\t\t\t\t\t// Extract the error message from the JSON response\n\t\t\t\t\t\t\tconst errorMessage = errorResponse.error || 'Unknown error occurred';\n\t\t\n\t\t\t\t\t\t\t// Show the error message to the user\n\t\t\t\t\t\t\tconsole.error(getNow(true) + ' Error:', errorMessage);\n\t\t\t\t\t\t\tthrow new Error(errorMessage); // Throw an error to skip to the catch block\n\t\t\t\t\t\t});\n\t\t\t\t\t}\n\t\t\n\t\t\t\t\t// If response is OK, parse the response as JSON\n\t\t\t\t\treturn response.json();\n\t\t\t\t})\n\t\t\t\t.then(function (data) {\n\t\t\t\t\t// Proceed with the logic if the response was successful\n\t\t\t\t\tif (data.message) {\n\t\t\t\t\t\tconsole.log(getNow(true) + \" Brill return message:\",data.message)\n\t\t\t\t\t\toverlay = removeSpinner(overlay);\n\t\t\t\t\t\tplayInProgress = false;\n\t\t\t\t\t} else {\n\t\t\t\t\t\t// Re-check turn before clicking - state may have advanced during the fetch\n\t\t\t\t\t\tvar stillMyTurn = isMyTurnToPlay();\n\t\t\t\t\t\t// Only claim as declarer or dummy. As defender we can only conceed\n\t\t\t\t\t\tif (data.claim && (data.player == 1 || data.player == 3)) {\n\t\t\t\t\t\t\tconsole.log(getNow(true) + \" Claiming \" + data.claim + \" tricks\")\n\t\t\t\t\t\t\tmakeClaim(data.claim, data.card, function (accepted) {\n\t\t\t\t\t\t\t\toverlay = removeSpinner(overlay);\n\t\t\t\t\t\t\t\tplayInProgress = false;\n\t\t\t\t\t\t\t\tif (accepted) return;\n\t\t\t\t\t\t\t\t// The claim did not go through, so we have to play after all.\n\t\t\t\t\t\t\t\t// Nothing else will restart us: no card was played, so there is no\n\t\t\t\t\t\t\t\t// onNewPlayedCard, and the dedup key is unchanged - clear it as well.\n\t\t\t\t\t\t\t\tlastPlayKey = null;\n\t\t\t\t\t\t\t\t// Re-check the turn here, not before the claim - the dialog took seconds\n\t\t\t\t\t\t\t\tif (!isMyTurnToPlay()) {\n\t\t\t\t\t\t\t\t\tconsole.log(getNow(true) + \" Claim not accepted, but no longer my turn to play\")\n\t\t\t\t\t\t\t\t\treturn;\n\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t\tconsole.log(getNow(true) + \" Claim not accepted - playing \" + data.card + \" instead\")\n\t\t\t\t\t\t\t\tvar playedBefore = getPlayedCards();\n\t\t\t\t\t\t\t\tsetTimeout(() => makePlay(data.card[1].replace(\"T\", \"10\") + data.card[0]), 0);\n\t\t\t\t\t\t\t\t// If that click did not register we would be stuck, so re-drive the flow.\n\t\t\t\t\t\t\t\t// Only when nothing was played since - otherwise the normal flow took over.\n\t\t\t\t\t\t\t\tsetTimeout(function () {\n\t\t\t\t\t\t\t\t\tif (!playInProgress && isMyTurnToPlay() && getPlayedCards() == playedBefore) {\n\t\t\t\t\t\t\t\t\t\tconsole.log(getNow(true) + \" Card not played after rejected claim - retrying\")\n\t\t\t\t\t\t\t\t\t\tplayInProgress = true;\n\t\t\t\t\t\t\t\t\t\tBrillsTurnToPlay(addSpinner());\n\t\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t\t}, 3000);\n\t\t\t\t\t\t\t});\n\t\t\t\t\t\t} else {\n\t\t\t\t\t\t\tconsole.log(getNow(true) + \" BrillsTurnToBid Brill would like to play:\",data.card)\n\t\t\t\t\t\t\tif (stillMyTurn) {\n\t\t\t\t\t\t\t\tsetTimeout(() => makePlay(data.card[1].replace(\"T\", \"10\") + data.card[0]),0);\n\t\t\t\t\t\t\t} else {\n\t\t\t\t\t\t\t\tconsole.log(getNow(true) + \" Skipping play click - no longer my turn to play\")\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\toverlay = removeSpinner(overlay);\n\t\t\t\t\t\t\tplayInProgress = false;\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t})\n\t\t\t\t.catch(function (error) {\n\t\t\t\t\toverlay = removeSpinner(overlay);\n\t\t\t\t\tplayInProgress = false;\n\t\t\t\t\t// Catch any errors that occurred during the fetch or processing\n\t\t\t\t\tconsole.error(getNow(true) + ' Error occurred:', error.message);\n\t\t\t\t});\n\t\t\n\t\t} catch (error) {\n\t\t\t// Handle any errors that occur during the fetch request\n\t\t\tconsole.error(getNow(true) + ' Error fetching data:', errorMessage);\n\t\t\t// Show an error message to the user or perform other error handling actions\n\t\t\toverlay = removeSpinner(overlay);\n\t\t\tplayInProgress = false;\n\t\t}\n\n\t\t// Before play update and save deal - BBO seems to forget the bid if we leave after the bid / play\n\t\tsavedeal(dealnumber, deal)\n\t} catch (error) {\n\t\toverlay = removeSpinner(overlay);\n\t\tplayInProgress = false;\n\t}\n}\n\nvalidateClaimWithServer = function (panel, tricksClaimed, claimerDir, resultKind, resultDelta) {\n\t// Called when an opponent claim dialog appears. Sends /claim to the server for validation,\n\t// then auto-clicks Accept (Yes) or Reject (No) based on the response.\n\t// On any error or missing data, leaves the dialog up for the user to decide manually.\n\tif (!tricksClaimed) {\n\t\tconsole.warn(getNow(true) + \" validateClaimWithServer: no tricks parsed, leaving dialog for manual decision\");\n\t\treturn;\n\t}\n\t// Defer briefly so BBO has time to reveal all 4 hands as part of the claim presentation.\n\t// At claim time BBO normally exposes the claimer's hand (and often dummy already, plus our own\n\t// seat) so the opposing side can verify the claim. The hand reads in getAllHands() depend on\n\t// those cards being rendered face-up; firing synchronously is too early.\n\tsetTimeout(function () {\n\t\tvalidateClaimWithServerInternal(panel, tricksClaimed, claimerDir, resultKind, resultDelta);\n\t}, 500);\n}\n\nvalidateClaimWithServerInternal = function (panel, tricksClaimed, claimerDir, resultKind, resultDelta) {\n\ttry {\n\t\t// Initialize deal struct from localStorage / fresh if not done yet\n\t\tif (newdeal || !deal[\"number\"]) {\n\t\t\tif (typeof initdeal === \"function\") initdeal();\n\t\t}\n\t\t// Populate any missing fields from the screen on demand - the claim may arrive before\n\t\t// our other handlers got a chance to fill them in.\n\t\tif (!deal[\"played\"]) deal[\"played\"] = [];\n\t\tdeal[\"played\"] = updatePlayedCards(deal[\"played\"]);\n\t\tdeal[\"played\"] = dedupePlayedCards(deal[\"played\"]);\n\t\tif (!deal[\"hand\"] || deal[\"hand\"].length < 13) {\n\t\t\tvar myCards = getMyCards();\n\t\t\tif (myCards.length > 0) deal[\"hand\"] = formatCards(myCards);\n\t\t}\n\t\tif (!deal[\"dummy\"]) {\n\t\t\tvar dc = getDummyCards();\n\t\t\tif (dc.length > 0) {\n\t\t\t\tdeal[\"dummy\"] = (dc.join(\"\").length == 26)\n\t\t\t\t\t? formatCards(dc)\n\t\t\t\t\t: reconstructDummy(dc, deal[\"played\"], getDeclarerDirection(), getContext());\n\t\t\t}\n\t\t}\n\t\tif (!deal[\"dealer\"]) deal[\"dealer\"] = getDealerDirection();\n\t\tif (!deal[\"vul\"]) deal[\"vul\"] = getAbsoluteVulnerability();\n\t\tif (!deal[\"seat\"]) deal[\"seat\"] = mySeat();\n\t\tif (!deal[\"user\"]) deal[\"user\"] = getActivePlayer();\n\t\tif (!deal[\"ctx\"]) deal[\"ctx\"] = getContext();\n\t\tif (!deal[\"number\"]) deal[\"number\"] = getDealNumber();\n\t\t// Final check - we still need at minimum hand and number to send\n\t\tif (!deal[\"hand\"] || !deal[\"number\"]) {\n\t\t\tconsole.warn(getNow(true) + \" validateClaimWithServer: still missing hand/number after fallback (hand=\" +\n\t\t\t\tdeal[\"hand\"] + \", number=\" + deal[\"number\"] + \"), leaving dialog for manual decision\");\n\t\t\treturn;\n\t\t}\n\t\tvar ctx = deal[\"ctx\"];\n\t\tvar user = deal[\"user\"];\n\t\tvar dealer = deal[\"dealer\"];\n\t\tvar seat = deal[\"seat\"];\n\t\tvar vul = deal[\"vul\"];\n\t\tvar hand = deal[\"hand\"];\n\t\tvar dummyhand = deal[\"dummy\"] || \"\";\n\t\tvar dealnumber = deal[\"number\"];\n\t\tvar playedCardsXX = formatCardsPlayed(deal[\"played\"] || []);\n\t\t// Read all 4 hands from screen - BBO reveals all hands when an opponent claims, so the\n\t\t// server can verify the claim against everyone's actual cards.\n\t\tvar allHands = getAllHands();\n\t\tconsole.log(getNow(true) + \" validateClaim allHands: N=\" + allHands.N + \" E=\" + allHands.E + \" S=\" + allHands.S + \" W=\" + allHands.W);\n\t\tvar url = getBrillBaseUrl() + \"/claim?south=\" + encodeURIComponent(getSeatDisplayName(\"S\")) +\n\t\t\t\"&north=\" + encodeURIComponent(getSeatDisplayName(\"N\")) +\n\t\t\t\"&east=\" + encodeURIComponent(getSeatDisplayName(\"E\")) +\n\t\t\t\"&west=\" + encodeURIComponent(getSeatDisplayName(\"W\")) +\n\t\t\t\"&dealer=\" + dealer + \"&dealno=\" + dealnumber + \"&seat=\" + seat +\n\t\t\t\"&vul=\" + vul + \"&ctx=\" + ctx + \"&hand=\" + hand +\n\t\t\t\"&dummy=\" + dummyhand + \"&played=\" + playedCardsXX +\n\t\t\t\"&board=\" + encodeURIComponent(dealnumber) +\n\t\t\t\"&pbn_label=\" + encodeURIComponent(getBoardLabel()) +\n\t\t\t\"&event=\" + encodeURIComponent(getEventName()) +\n\t\t\t\"&tricks=\" + tricksClaimed +\n\t\t\t\"&n=\" + allHands.N + \"&e=\" + allHands.E + \"&s=\" + allHands.S + \"&w=\" + allHands.W;\n\t\tif (claimerDir) url += \"&claimer=\" + claimerDir;\n\t\tvar tournamentType = getTournamentType();\n\t\tif (tournamentType != \"\") url += \"&tournament=\" + tournamentType;\n\t\tconsole.log(getNow(true) + \" validateClaim Requesting \" + url);\n\t\tfetch(url, { cache: \"no-store\" })\n\t\t\t.then(function (response) {\n\t\t\t\tconsole.log(getNow(true) + \" validateClaim Response status: \" + response.status);\n\t\t\t\tif (!response.ok) {\n\t\t\t\t\tconsole.warn(getNow(true) + \" validateClaim non-OK response, leaving for manual decision\");\n\t\t\t\t\treturn null;\n\t\t\t\t}\n\t\t\t\treturn response.json();\n\t\t\t})\n\t\t\t.then(function (data) {\n\t\t\t\tif (!data) return;\n\t\t\t\tconsole.log(getNow(true) + \" validateClaim response data:\", JSON.stringify(data));\n\t\t\t\t// Note: do NOT set finalPlaySent here. /claim is for validation only.\n\t\t\t\t// /pbn/finalize fires later from onDealEnd when BBO has revealed all 4 hands,\n\t\t\t\t// so the server can construct a complete PBN.\n\t\t\t\t// Server fields: { saved: bool, claim: N, result: N, board: ... }\n\t\t\t\t// Accept-signal field names: saved | accept | ok | valid (true to accept).\n\t\t\t\tvar accept = (data.saved === true) || (data.accept === true) || (data.ok === true) || (data.valid === true);\n\t\t\t\tvar reject = (data.saved === false) || (data.accept === false) || (data.reject === true) || (data.valid === false);\n\t\t\t\tif (accept) {\n\t\t\t\t\tconsole.log(getNow(true) + \" validateClaim: server accepted (claim=\" + data.claim + \", result=\" + data.result + \"), clicking Yes\");\n\t\t\t\t\t$(\"button.accept-button:visible\", panel).click();\n\t\t\t\t} else if (reject) {\n\t\t\t\t\tconsole.log(getNow(true) + \" validateClaim: server rejected, clicking No\");\n\t\t\t\t\t$(\"button.reject-button:visible\", panel).click();\n\t\t\t\t} else {\n\t\t\t\t\tconsole.log(getNow(true) + \" validateClaim: server response unclear, leaving for manual decision\");\n\t\t\t\t}\n\t\t\t})\n\t\t\t.catch(function (error) {\n\t\t\t\tconsole.error(getNow(true) + \" validateClaim error:\", error.message);\n\t\t\t});\n\t} catch (e) {\n\t\tconsole.error(getNow(true) + \" validateClaim exception:\", e);\n\t}\n}\n\nsendFinalPlay = function () {\n\t// Record the completed deal via /pbn/finalize with all 4 hands.\n\t// Called from onDealEnd (after BBO reveals all hands) or onAuctionEnd (passed out).\n\t// /claim is a separate endpoint that fires at claim-dialog time for live validation only;\n\t// it does NOT save the PBN, because at that moment opponent hands aren't yet visible.\n\tif (finalPlaySent) {\n\t\tconsole.log(getNow(true) + \" sendFinalPlay skipped - already sent for this deal\");\n\t\treturn;\n\t}\n\t// Defer ~1.5s so BBO has time to settle the last trick animation and reveal all 4 hands.\n\t// Earlier 500ms was too aggressive - we were reading mid-animation and losing the last\n\t// trick's cards. The hand reads in getAllHands() depend on cards being rendered face-up.\n\tsetTimeout(function () { sendFinalPlayInternal(); }, 1500);\n}\n\nsendFinalPlayInternal = function () {\n\tif (finalPlaySent) return;\n\ttry {\n\t\t// Make sure we've captured all played cards still visible on screen, then dedupe defensively\n\t\tif (deal[\"played\"]) {\n\t\t\tdeal[\"played\"] = updatePlayedCards(deal[\"played\"]);\n\t\t\tdeal[\"played\"] = dedupePlayedCards(deal[\"played\"]);\n\t\t}\n\t\t// Pull missing fields from the screen so this works even before bidding/play populated them\n\t\tif (!deal[\"hand\"] || deal[\"hand\"].length < 13) {\n\t\t\tvar myCards = getMyCards();\n\t\t\tif (myCards.length > 0) deal[\"hand\"] = formatCards(myCards);\n\t\t}\n\t\tif (!deal[\"dealer\"]) deal[\"dealer\"] = getDealerDirection();\n\t\tif (!deal[\"vul\"]) deal[\"vul\"] = getAbsoluteVulnerability();\n\t\tif (!deal[\"seat\"]) deal[\"seat\"] = mySeat();\n\t\tif (!deal[\"user\"]) deal[\"user\"] = getActivePlayer();\n\t\tif (!deal[\"ctx\"]) deal[\"ctx\"] = getContext();\n\t\tif (!deal[\"number\"]) deal[\"number\"] = getDealNumber();\n\t\t// Need at least hand and number to send anything meaningful\n\t\tif (!deal[\"hand\"] || !deal[\"number\"]) {\n\t\t\tconsole.log(getNow(true) + \" sendFinalPlay skipped - missing hand or deal number\");\n\t\t\treturn;\n\t\t}\n\t\tfinalPlaySent = true;\n\t\tvar playedCount = deal[\"played\"] ? deal[\"played\"].length : 0;\n\t\tvar complete = (playedCount == 52);\n\t\tvar ctx = deal[\"ctx\"];\n\t\tvar passedOut = (ctx === \"--------\" || /^-+$/.test(ctx));\n\t\tvar user = deal[\"user\"];\n\t\tvar dealer = deal[\"dealer\"];\n\t\tvar seat = deal[\"seat\"];\n\t\tvar vul = deal[\"vul\"];\n\t\tvar hand = deal[\"hand\"];\n\t\tvar dummyhand = deal[\"dummy\"] || \"\";\n\t\tvar dealnumber = deal[\"number\"];\n\t\tvar playedCardsXX = formatCardsPlayed(deal[\"played\"] || []);\n\t\t// Read all 4 hands from screen - at deal end BBO reveals all opponents, so this is\n\t\t// where we get a complete deal for the PBN.\n\t\tvar allHands = getAllHands();\n\t\tconsole.log(getNow(true) + \" sendFinalPlay allHands: N=\" + allHands.N + \" E=\" + allHands.E + \" S=\" + allHands.S + \" W=\" + allHands.W);\n\t\t// Always use /pbn/finalize - the server's universal \"save PBN\" endpoint.\n\t\t// Deal type is signalled by &passedout / &claim / &final query params.\n\t\tvar url = getBrillBaseUrl() + \"/pbn/finalize?south=\" + encodeURIComponent(getSeatDisplayName(\"S\")) +\n\t\t\t\"&north=\" + encodeURIComponent(getSeatDisplayName(\"N\")) +\n\t\t\t\"&east=\" + encodeURIComponent(getSeatDisplayName(\"E\")) +\n\t\t\t\"&west=\" + encodeURIComponent(getSeatDisplayName(\"W\")) +\n\t\t\t\"&dealer=\" + dealer + \"&dealno=\" + dealnumber + \"&seat=\" + seat +\n\t\t\t\"&vul=\" + vul + \"&ctx=\" + ctx + \"&hand=\" + hand +\n\t\t\t\"&dummy=\" + dummyhand + \"&played=\" + playedCardsXX +\n\t\t\t// board = the PLAIN board number so the [Board] tag stays numeric (match pairing);\n\t\t\t// pbn_label names the file \"<session>_b<N>.pbn\" so the /pbn page groups every board\n\t\t\t// of this sitting under one heading, and event supplies that heading.\n\t\t\t\"&board=\" + encodeURIComponent(dealnumber) +\n\t\t\t\"&pbn_label=\" + encodeURIComponent(getBoardLabel()) +\n\t\t\t\"&event=\" + encodeURIComponent(getEventName()) +\n\t\t\t\"&final=true\" +\n\t\t\t\"&n=\" + allHands.N + \"&e=\" + allHands.E + \"&s=\" + allHands.S + \"&w=\" + allHands.W;\n\t\tif (passedOut) {\n\t\t\turl += \"&passedout=true\";\n\t\t} else if (claimDetected) {\n\t\t\t// A real claim dialog was seen on this deal. Send the actual remaining-trick count.\n\t\t\tvar remainingTricks = Math.ceil((52 - playedCount) / 4);\n\t\t\turl += \"&claim=true&tricks=\" + remainingTricks;\n\t\t} else if (!complete) {\n\t\t\t// Less than 52 cards but no claim was observed - we just missed capturing some cards\n\t\t\t// during play (timing issue with screen reads). Don't tag as claim; let the server\n\t\t\t// reconstruct from the hands we are sending.\n\t\t\tvar missingCount = 52 - playedCount;\n\t\t\tif (missingCount <= 2) {\n\t\t\t\tconsole.log(getNow(true) + \" sendFinalPlay: \" + playedCount + \"/52 cards (missing \" +\n\t\t\t\t\tmissingCount + \") - acceptable shortfall, sending without claim flag\");\n\t\t\t} else {\n\t\t\t\tconsole.warn(getNow(true) + \" sendFinalPlay: only \" + playedCount + \"/52 cards captured (missing \" +\n\t\t\t\t\tmissingCount + \") but no claim was detected - significant shortfall, server may reject\");\n\t\t\t}\n\t\t}\n\t\tvar tournamentType = getTournamentType();\n\t\tif (tournamentType != \"\") url += \"&tournament=\" + tournamentType;\n\t\t// Count how many of the 4 hands are populated - server needs >= 3 to construct full PBN\n\t\tvar handsPopulated = (allHands.N ? 1 : 0) + (allHands.E ? 1 : 0) + (allHands.S ? 1 : 0) + (allHands.W ? 1 : 0);\n\t\tvar dealTypeLabel = passedOut ? \"passed out\" :\n\t\t\t(claimDetected ? playedCount + \"/52 cards, CLAIM\" :\n\t\t\t\tcomplete ? playedCount + \"/52 cards, complete\" : playedCount + \"/52 cards, INCOMPLETE-no-claim\");\n\t\tconsole.log(getNow(true) + \" sendFinalPlay -> /pbn/finalize (\" + dealTypeLabel +\n\t\t\t\", hands populated: \" + handsPopulated + \"/4) \" + url);\n\t\tif (handsPopulated < 3) {\n\t\t\tconsole.warn(getNow(true) + \" sendFinalPlay: only \" + handsPopulated + \"/4 hands populated - server may not be able to construct full PBN\");\n\t\t}\n\t\tfetch(url, { cache: \"no-store\" })\n\t\t\t.then(function (response) {\n\t\t\t\tconsole.log(getNow(true) + \" sendFinalPlay Response status: \" + response.status);\n\t\t\t})\n\t\t\t.catch(function (error) {\n\t\t\t\tconsole.error(getNow(true) + \" sendFinalPlay error:\", error.message);\n\t\t\t});\n\t} catch (e) {\n\t\tconsole.error(getNow(true) + \" sendFinalPlay exception:\", e);\n\t}\n}\n\nremovedeal = function () {\n\t// Loop through all keys in localStorage\n\t// Should perhaps include a table type\n\tfor (var key in localStorage) {\n\t\t// Check if the key starts with 'BidWithBrill' and ends with the value of dealnumber\n\t\tif (key.startsWith('BidWithBrill')) {\n\t\t\t// If the key matches, remove the item from localStorage\n\t\t\tlocalStorage.removeItem(key);\n\t\t}\n\t}\n}\n\nsavedeal = function (dealnumber, deal) {\n\tif (dealnumber) {\n\t\tif (deal[\"dummy\"] == deal[\"hand\"]) {\n\t\t\t// BBO rotated the deal - skip saving, we recover on the next update\n\t\t\tconsole.warn(getNow(true) + \" savedeal: hand and dummy are the same - BBO rotated the deal, not saving\")\n\t\t} else {\n\t\t\tlocalStorage.setItem('BidWithBrill' + dealnumber, JSON.stringify(deal))\n\t\t}\n\t}\n}\n\ngetTournamentType = function() {\n\tlet text = $(\"#navDiv score-panel, #navDiv .score-panel\", parent.window.document).text().toLowerCase();\n\tif (text.indexOf(\"imp\") > -1) return \"IMP\";\n\tif (text.indexOf(\"mp\") > -1) return \"MP\";\n\treturn \"\";\n}\n\ngetMatchName = function() {\n\tvar title = $(\"nav-bar h2.titleClass\", parent.window.document).first().text().trim();\n\tif (!title) return \"\";\n\tvar stopWords = [\"a\", \"an\", \"the\", \"of\", \"for\", \"against\", \"vs\", \"and\", \"with\", \"in\", \"on\", \"at\", \"to\", \"board\"];\n\tvar words = title.split(/\\s+/).filter(function (w) {\n\t\treturn w && stopWords.indexOf(w.toLowerCase()) === -1 && !/^\\d+$/.test(w);\n\t});\n\tif (words.length === 0) return \"\";\n\tvar compact;\n\tif (words.length <= 2) {\n\t\tcompact = words.join(\"-\");\n\t} else {\n\t\tvar initials = words.slice(0, -1).map(function (w) { return w.charAt(0).toUpperCase(); }).join(\"\");\n\t\tcompact = initials + \"-\" + words[words.length - 1];\n\t}\n\treturn compact.replace(/[^A-Za-z0-9\\-]/g, \"\");\n}\n\ngetDateStamp = function() {\n\tvar now = new Date();\n\treturn now.getFullYear() +\n\t\tString(now.getMonth() + 1).padStart(2, '0') +\n\t\tString(now.getDate()).padStart(2, '0');\n}\n\n// The session slug every board of this sitting shares - date, scoring type and match name,\n// with NO board number in it. Brill.Service's /pbn page groups saved boards by their filename\n// after stripping a trailing \"_b<N>\" (PbnChallengeKey), so boards only land in one group when\n// they share this prefix. (The old getBoardID() buried the board number in the MIDDLE, which\n// is why every board showed up as its own \"Brill.Service /play\" challenge - all endpoints now\n// send the plain board number plus this slug via pbn_label.)\ngetChallengeSlug = function() {\n\tvar slug = getDateStamp() + \"_\" + (getTournamentType() || \"X\");\n\tvar matchName = getMatchName();\n\tif (matchName) slug += \"_\" + matchName;\n\treturn slug;\n}\n\n// Filename label for one saved board: \"<session slug>_b<board>\" - the same shape BridgeChallenge\n// sends as pbn_label, so Brill.Service names and groups our boards exactly the same way.\ngetBoardLabel = function() {\n\treturn getChallengeSlug() + \"_b\" + String(getDealNumber());\n}\n\n// Readable [Event] tag for the saved PBN, i.e. the group heading on the Completed Boards page.\n// Without it the server falls back to the default \"Brill.Service /play\". Any \"board <n>\" in the\n// nav-bar title is stripped so every board of the session reports the same event.\ngetEventName = function() {\n\tvar title = $(\"nav-bar h2.titleClass\", parent.window.document).first().text().trim();\n\tif (title) {\n\t\tvar cleaned = title.replace(/\\bboard\\s*\\d+\\b/ig, \"\").replace(/\\s{2,}/g, \" \").trim();\n\t\tif (cleaned) return cleaned;\n\t}\n\tvar tournament = getTournamentType();\n\treturn \"BBO\" + (tournament ? \" \" + tournament : \"\") + \" \" + getDateStamp();\n}\n\ninitdeal = function() {\n\ttry {\n\t\tdealnumber = getDealNumber()\n\t\tdealString = localStorage.getItem('BidWithBrill' + dealnumber);\n\t\tif (dealString) {\n\t\t\tdeal = JSON.parse(dealString);\n\t\t\tconsole.log(getNow(true) + \" Found in storage: \" + dealString);\n\t\t\tif (!deal[\"played\"]) deal[\"played\"] = []\n\t\t\tif (!deal[\"ctx\"]) deal[\"ctx\"] = \"\"\n\t\t\tdeal[\"dealer\"] = getDealerDirection()\n\t\t\tdeal[\"vul\"] = getAbsoluteVulnerability()\n\t\t\tdeal[\"seat\"] = mySeat()\n\t\t\tdeal[\"user\"] = getActivePlayer()\n\t\t}\n\t\tif (!dealString || !deal[\"number\"]) {\n\t\t\tdeal = {}\n\t\t\tdeal[\"number\"] = dealnumber\n\t\t\tdeal[\"dealer\"] = getDealerDirection()\n\t\t\tdeal[\"vul\"] = getAbsoluteVulnerability()\n\t\t\tdeal[\"seat\"] = mySeat()\n\t\t\tdeal[\"user\"] = getActivePlayer()\n\t\t\tdeal[\"hand\"] = \"\"\n\t\t\tdeal[\"ctx\"] = \"\"\n\t\t\tdeal[\"dummy\"] = \"\"\n\t\t\tdeal[\"played\"] = []\n\t\n\t\t\tlocalStorage.setItem('BidWithBrill' + dealnumber, JSON.stringify(deal))\n\t\t}\n\t\tconsole.log(getNow(true) + \" onMyDeal\", JSON.stringify(deal))\n\t} catch (error) {\n\t\tconsole.log(getNow(true) + \" onMyDeal error\", error)\n\t}\n\tnewdeal = false\n\treturn deal;\n\t\n}\n\ngetAbsoluteVulnerability = function() {\n\t// Convert from relative (us/them) to absolute (NS/EW) vulnerability format\n\t// Brill API expects: None, NS, EW, All\n\tconst seat = mySeat();\n\tconst isNS = (seat === 'N' || seat === 'S');\n\tconst weAreVul = areWeVulnerable() === '@v';\n\tconst theyAreVul = areTheyVulnerable() === '@V';\n\n\t// Convert relative to absolute\n\tconst nsVul = isNS ? weAreVul : theyAreVul;\n\tconst ewVul = isNS ? theyAreVul : weAreVul;\n\n\tif (nsVul && ewVul) return 'All';\n\tif (nsVul) return 'NS';\n\tif (ewVul) return 'EW';\n\treturn 'None';\n}\n"
	];
	setScriptList();
	console.log("[brill] " + scriptList.length + " script blocks loaded");

	// ==========================================================================
	// vendored: src/iframe/BBOobserver.js (self-starts - must be last)
	// ==========================================================================
	// Options for the observer (which mutations to observe)
	const config = {
	    attributes: true,
	    attributeFilter: ['id', 'class', 'style'],
	    childList: true,
	    subtree: true
	};
	
	// Callback function to execute when mutations are observed
	const BBOobserverCallback = function (mutationsList, observer) {
	    observer.disconnect();
	    checkBiddingBox();
	    checkNavDiv();
	    checkTableDisplayed();
	    checkBiddingBoxDisplayed();
	    checkAuctionBoxDisplayed();
	    checkAnnouncementPanel();
	    checkNotificationPanel();
	    checkFinalContractPanel();
	    checkCurrentAuction();
	    checkActivePlayer();
	    checkExplainCallBox();
	    checkDealEndPanel();
	    checkOpponents();
	    checkDealNumber();
	    checkCallText();
	    checkOKbuttonVisible();
	    checkOKbuttonPressed();
	    checkChatMessage();
	    checkCardLead();
	    checkPlayedCards();
	    checkCallExplanationPanel();
	    checkMyCardsDisplayed();
	    checkProfileBoxDisplayed();
	    checkOpenProfileBBOalertURL();
	    onAnyMutation();
	    observer.observe(targetNode, config);
	};
	
	function checkBiddingBox() {
	    if ((getBiddingBox() != null) != biddingBoxExists) {
	        biddingBoxExists = !biddingBoxExists;
	        if (biddingBoxExists) onBiddingBoxCreated();
	        else onBiddingBoxRemoved();
	    }
	}
	
	function checkNavDiv() {
	    if (isVisible(getNavDiv()) != navDivDisplayed) {
	        navDivDisplayed = !navDivDisplayed;
	        if (navDivDisplayed) onNavDivDisplayed();
	        else onNavDivHidden();
	    }
	}
	
	function checkTableDisplayed() {
	    if ($("bridge-screen", window.parent.document).is(":visible") != tableDisplayed) {
	        tableDisplayed = !tableDisplayed;
	        if (tableDisplayed) onTableDisplayed();
	        else onTableHidden();
	    }
	}
	
	function checkBiddingBoxDisplayed() {
	    if (isVisible(getBiddingBox()) != biddingBoxDisplayed) {
	        biddingBoxDisplayed = !biddingBoxDisplayed;
	        if (biddingBoxDisplayed) onBiddingBoxDisplayed();
	        else onBiddingBoxHidden();
	    }
	}
	
	function checkAuctionBoxDisplayed() {
	    if (isVisible(getAuctionBox()) != auctionBoxDisplayed) {
	        auctionBoxDisplayed = !auctionBoxDisplayed;
	        if (auctionBoxDisplayed) onAuctionBoxDisplayed();
	        else onAuctionBoxHidden();
	    }
	}
	
	function checkAnnouncementPanel() {
	    if (isVisible(getAnnouncementPanel()) != announcemenDisplayed) {
	        announcemenDisplayed = !announcemenDisplayed;
	        if (announcemenDisplayed) onAnnouncementDisplayed();
	    }
	}
	
	function checkNotificationPanel() {
	    if (isVisible(getNotificationPanel()) != notificationDisplayed) {
	        notificationDisplayed = !notificationDisplayed;
	        if (notificationDisplayed) onNotificationDisplayed();
	    }
	}
	
	function checkFinalContractPanel() {
	    if (isVisible(getFinalContractPanel()) != finalContractDisplayed) {
	        finalContractDisplayed = !finalContractDisplayed;
	        if (finalContractDisplayed) onFinalContractDisplayed();
	    }
	}
	
	function checkCurrentAuction() {
	    if (currentAuction != getContext()) {
	        currentAuction = getContext();
	        onNewAuction();
	    }
	}
	
	function checkActivePlayer() {
	    if (activePlayer != getActivePlayer()) {
	        activePlayer = getActivePlayer();
	        callText = '';
	        lastSelectedCall = callText;
	        if (activePlayer != '') onNewActivePlayer();
	    }
	}
	
	function checkExplainCallBox() {
	    if (isVisible(getExplainCallBox()) != explainCallDisplayed) {
	        explainCallDisplayed = !explainCallDisplayed;
	        if (explainCallDisplayed) onExplainCallDisplayed();
	        else onExplainCallHidden();
	    }
	}
	
	function checkDealEndPanel() {
	    if (isVisible(getDealEndPanel()) != dealEndPanelDisplayed) {
	        dealEndPanelDisplayed = !dealEndPanelDisplayed;
	        if (dealEndPanelDisplayed) onDealEndPanelDisplayed();
	    }
	}
	
	function checkOpponents() {
	    if ((myOpponent(true) != LHOpponent) || (myOpponent(false) != RHOpponent)) {
	        onAnyOpponentChange();
	    }
	}
	
	function checkDealNumber() {
	    if (getDealNumber() != lastDealNumber) {
	        if (getDealNumber() != '') {
	            onNewDeal();
	        }
	        lastDealNumber = getDealNumber();
	    }
	}
	
	function checkCallText() {
	    if (getMyCall() != lastSelectedCall) {
	        lastSelectedCall = getMyCall();
	        if (isVisible(getAuctionBox())) onNewCallSelected();
	    }
	}
	function checkOKbuttonVisible() {
	    if (buttonOKvisible() != OKbuttonVisible) {
	        OKbuttonVisible = buttonOKvisible();
	        if (isVisible(getAuctionBox())) {
	            if (OKbuttonVisible) {
	                onOKbuttonDisplayed();
	            } else { onOKbuttonHidden(); }
	        }
	    }
	}
	
	function checkOKbuttonPressed() {
	    if (buttonOKpressed() != OKbuttonPressed) {
	        OKbuttonPressed = buttonOKpressed();
	        if (isVisible(getAuctionBox())) {
	            if (OKbuttonPressed) { onOKbuttonPressed(); }
	        }
	    }
	}
	
	function checkChatMessage() {
	    if (getLastChatMessaage() != lastChatMessage) {
	        lastChatMessage = getLastChatMessaage();
	        onNewChatMessage();
	    }
	}
	
	function checkCardLead() {
	    if (cardLead != getCard(90)) {
	        cardLead = getCard(90);
	        onNewLead();
	    }
	}
	
	function checkPlayedCards() {
	    if (playedCards != getPlayedCards()) {
	        playedCards = getPlayedCards();
	        onNewPlayedCard();
	    }
	}
	
	function checkCallExplanationPanel() {
	    if (isVisible(getCallExplanationPanel()) != callExplanationPanelDisplayed) {
	        callExplanationPanelDisplayed = !callExplanationPanelDisplayed;
	        if (callExplanationPanelDisplayed) onCallExplanationPanelDisplayed();
	    }
	}
	
	function checkMyCardsDisplayed() {
	    if ((myCardsDisplayed != getMyHand()) && (getMyHand().length == 26)) {
	        myCardsDisplayed = getMyHand();
	        onMyCardsDisplayed();
	    }
	}
	
	function checkProfileBoxDisplayed() {
	    if (getOpenProfileBBOid() != openProfileBBOid) {
	        openProfileBBOid = getOpenProfileBBOid();
	    }
	}
	
	function checkOpenProfileBBOalertURL() {
	    if (getOpenProfileBBOalertURL() != openProfileBBOalertURL) {
	        openProfileBBOalertURL = getOpenProfileBBOalertURL();
	        if (openProfileBBOalertURL != "") {
	            addBBOalertButtonToProfile();
	        } else {
	            removeBBOalertButtonFromProfile();
	        }
	    }
	}  
	
	/**
	 * @ignore
	 */
	
	// openAccountTab();
	
	
	
	// Create an observer instance linked to the callback function
	const BBOobserver = new MutationObserver(BBOobserverCallback);
	
	// Start observing the target node for configured mutations
	const targetNode = parent.document.body;
	var tmr = setInterval(function () {
	    if (!isVisible(getNavDiv())) return;
	    initGlobals();
	    navDivDisplayed = true;
	    onNavDivDisplayed();
	    clearInterval(tmr);
	    BBOobserver.observe(targetNode, config);
	}, 100);
	

})();
