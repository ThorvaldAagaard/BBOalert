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
