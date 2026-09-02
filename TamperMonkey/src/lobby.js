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
// OPPONENT GATE
// -------------
// c_challenge_style === "ARENA_ROBOT" (a robot) is always allowed. "PK" is a human opponent
// and is entered ONLY when BRILL_ALLOW_HUMAN is set.
//
// This account is a declared robot - Brill identifies itself as such in its BBO profile - so
// opponents who challenge it know what they are playing. The opt-in is therefore about
// deliberateness, not permission: it keeps a reinstall, a cleared autoplay flag, or a copy of
// this script on some other account from quietly starting to play against people.
//
// Both values are server-supplied fields rather than heuristics, so the gate cannot drift the
// way a DOM-based check would.
//
// SETTINGS (page console):
//   localStorage.BRILL_CHALLENGE_AUTOPLAY = '1'   actually enter challenges (default: off,
//                                                 report only)
//   localStorage.BRILL_ALLOW_HUMAN = '1'          also play PK challenges against people
//                                                 (default: robot challenges only)
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

// Human ("PK") challenges are OFF unless explicitly enabled. Robot challenges need no flag.
// Separate from autoplay on purpose: turning the driver on should never, by itself, start it
// playing against people on an account that has not declared itself a robot.
function allowHuman() { return localStorage.getItem('BRILL_ALLOW_HUMAN') === '1'; }

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

	// ARENA_ROBOT is always allowed; PK is a human opponent and needs the opt-in. Both are
	// server-supplied fields rather than heuristics, so this cannot drift the way a DOM-based
	// check would.
	var robot = d.c_challenge_style === 'ARENA_ROBOT';
	if (!robot && !(d.c_challenge_style === 'PK' && allowHuman())) return null;

	var me = myName();
	var role = null;
	if ((d.c_challenger || '').toLowerCase() === me) role = 'challenger';
	else if ((d.c_challengee || '').toLowerCase() === me) role = 'challengee';
	if (!role) return null;
	var done = parseInt(d['c_boards_completed_' + role] || '0', 10);
	var total = parseInt(d.boards || '0', 10);
	if (!(done < total)) return null;

	// Whoever we are not - used to pick the right row out of the list.
	var opponent = (role === 'challenger' ? d.c_challengee : d.c_challenger) || '';

	// The opponent's own progress. We do not gate on it - the format is asynchronous, so our
	// boards are playable whatever they have done - but it explains the dot colour in the UI:
	// green means WE still have boards (done < total), red means our side is finished and the
	// challenge is waiting on them. Logging both makes "nothing to play" self-evidently
	// correct instead of looking like a stall.
	var theirDone = parseInt(
		d['c_boards_completed_' + (role === 'challenger' ? 'challengee' : 'challenger')] || '0', 10);

	return {
		tid: d.tid, title: d.title, done: done, total: total, role: role,
		robot: robot, opponent: opponent.toLowerCase(), theirDone: theirDone
	};
}

// "robot 5519fea6" / "human challenge vs veronel (0224e851)" - the console should never
// leave you guessing whether it is about to play a person.
function describe(c) {
	return (c.robot ? 'robot challenge ' : 'HUMAN challenge vs ' + c.opponent + ' ')
		+ c.tid.slice(0, 8);
}

// How many challenges are playable in every respect EXCEPT that they are human and the
// opt-in is off. Reported in the idle message: "nothing to play" with no reason is exactly
// the kind of silence that wastes an afternoon.
function humanHeldBack() {
	if (allowHuman()) return 0;
	var n = 0;
	for (var tid in tlist) {
		var d = tlist[tid];
		if (d.state !== 'RUNNING' || d.c_challenge_style !== 'PK') continue;
		var me = myName();
		var role = (d.c_challenger || '').toLowerCase() === me ? 'challenger'
			: ((d.c_challengee || '').toLowerCase() === me ? 'challengee' : null);
		if (!role) continue;
		if (parseInt(d['c_boards_completed_' + role] || '0', 10) < parseInt(d.boards || '0', 10)) n++;
	}
	return n;
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

// Find the list row for a specific challenge. tlist has already decided WHICH challenge to
// play; this only has to locate its row, so it matches on identity rather than trying to
// re-derive robot-ness from the DOM.
//
//   robot  -> renders no name-tag (there is no opponent username to show)
//   human  -> renders a name-tag holding the opponent's username
//
// Both tests are language-independent. The name-tag also contains a rank badge, so this
// matches on "contains" rather than equality.
function challengeRow(target) {
	var rows = $('challenge-list-item', PWD);
	if (target && !target.robot && target.opponent) {
		return rows.filter(function () {
			var tag = $('name-tag', this).text().replace(/\s+/g, ' ').trim().toLowerCase();
			return tag.indexOf(target.opponent) !== -1;
		}).first();
	}
	return rows.filter(function () {
		return $('name-tag', this).length === 0;
	}).first();
}

// The details panel's button bar holds exactly one button ("Play now!"), so take it
// positionally rather than by English text - same language trap as the nav button.
// Switch the right-hand pane to History on entering a match, so the boards played and the
// running score are visible instead of the Mail tab (which also flashes as BBO polls it).
//
// Same language trap as the nav button: "History" is English. Ordered fallbacks -
//   1. localStorage.BRILL_HISTORY_LABEL   explicit override
//   2. a known label in any of the UI languages
//   3. position - the rail is Messages / People / History / Account, so index 2
// Whichever matched is logged, so a wrong pick is visible rather than mysterious.
var HISTORY_LABELS = ['History', 'Historik', 'Historie', 'Verlauf', 'Historique',
	'Historial', 'Storico', 'Geschiedenis', 'Historia'];

function historyTab() {
	var tabs = $('tab-bar-button:visible', PWD);
	if (!tabs.length) return null;

	var override = localStorage.getItem('BRILL_HISTORY_LABEL');
	var labels = override ? [override] : HISTORY_LABELS;
	var byText = tabs.filter(function () {
		var t = $(this).text().replace(/\s+/g, ' ').trim();
		for (var i = 0; i < labels.length; i++) {
			if (t.indexOf(labels[i]) !== -1) return true;
		}
		return false;
	}).first();
	if (byText.length) return { el: byText, how: 'label "' + byText.text().trim() + '"' };

	if (tabs.length >= 3) return { el: tabs.eq(2), how: 'position 3 of ' + tabs.length };
	return null;
}

var historyPaneShown = false;

function showHistoryPane() {
	if (historyPaneShown) return;
	var t = historyTab();
	if (!t) return;
	historyPaneShown = true;          // set first: one attempt per match, even if the click throws
	try {
		t.el[0].click();
		lobbyLog('side panel -> History (matched by ' + t.how + ')');
	} catch (e) {
		lobbyLog('could not switch to History: ' + (e && e.message));
	}
}

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

		// initGlobals() is NOT optional, even though it looks like BBOalert bookkeeping.
		// BBOobserver.checkAnnouncementPanel() reads `announcemenDisplayed` - note the
		// missing 't'; globals.js declares the correctly spelled `announcementDisplayed`
		// and never uses it. The typo'd name only ever comes into existence because
		// initGlobals() does a bare `announcemenDisplayed = false` (globals.js:143), which
		// creates it as an implicit global.
		//
		// Skipping initGlobals here meant the first mutation threw ReferenceError inside
		// the observer callback - and because that callback disconnects at the top and
		// re-observes at the bottom, the throw left the observer PERMANENTLY detached.
		// Symptom: seated at a table, hooks loaded, and absolute silence.
		initGlobals();
		navDivDisplayed = true;
		setScriptList();
		brillDataLoad();

		// Guard the callback rather than handing BBOobserverCallback straight to the
		// observer. Its disconnect-first/re-observe-last shape means ANY exception in any
		// check kills observation for good, with no further output. Re-attaching on throw
		// turns that from fatal into a logged glitch.
		var guarded = new MutationObserver(function (list, obs) {
			try {
				BBOobserverCallback(list, obs);
			} catch (e) {
				lobbyLog('observer callback threw (re-attaching): ' + (e && e.message));
				try { obs.observe(PWD.body, config); } catch (e2) { }
			}
		});
		guarded.observe(PWD.body, config);
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
	if (atTable()) {
		// PlayWithBrill's hooks own the table from here; the only thing left to do is put
		// the History pane up so the boards played are visible while it works.
		showHistoryPane();
		return;
	}
	historyPaneShown = false;          // back in the lobby - arm it for the next match

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
	var held = todo.length ? 0 : humanHeldBack();
	var msg = todo.length
		? todo.map(function (c) {
			return (c.robot ? '' : 'vs ' + c.opponent + ' ') + c.tid.slice(0, 8) +
				' us ' + c.done + '/' + c.total + ', them ' + c.theirDone + '/' + c.total;
		}).join(', ')
		: (held
			? 'nothing to play - ' + held + ' human challenge(s) available but not enabled; ' +
			  '__brillChallenge.allowHuman(true) to include them'
			: 'nothing to play');
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

	var row = challengeRow(target);
	if (!row.length) {
		lobbyLog('no row on screen for ' + describe(target) + ' - backing off');
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

	lobbyLog('entering ' + describe(target) +
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
	allowHuman: function (on) {
		if (on === undefined) return allowHuman();
		if (on) localStorage.setItem('BRILL_ALLOW_HUMAN', '1');
		else localStorage.removeItem('BRILL_ALLOW_HUMAN');
		return allowHuman();
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
