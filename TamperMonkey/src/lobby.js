// ---------------------------------------------------------------- challenge lobby driver
//
// The piece BBOalert never had: getting from the lobby into a challenge. Once seated, the
// vendored observer + PlayWithBrill's hooks take over and play the board.
// The same driver also enters allowlisted daylong tournaments - see "daylong tournaments"
// further down, which is the one part of this file not backed by a capture.
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
//   the Brill pill, bottom right of the page, or __brillChallenge.mode('off'|'dailies'|'bm')
//                                                 what the driver does: nothing (default),
//                                                 challenges + daylongs, or Bridge Master.
//                                                 Stored in BRILL_MODE; the old
//                                                 BRILL_CHALLENGE_AUTOPLAY flag is only read
//                                                 while BRILL_MODE is unset
//   localStorage.BRILL_ALLOW_HUMAN = '1'          also play PK challenges against people
//                                                 (default: robot challenges only)
//   localStorage.BRILL_DAYLONGS = 'ben & friends, just declare'
//                                                 comma-separated substrings of the daylong
//                                                 tournaments to enter, matched against
//                                                 title and host (default: 'ben & friends';
//                                                 set it to '' to play no tournaments at all)
//   localStorage.BRILL_DAYLONG_ENTER_LABEL        text of the button that enters a
//                                                 tournament, if its panel holds more than one
//   localStorage.BRILL_DAYLONG_LIST_URL           where the dailies list is; learned by the
//                                                 driver the first time it sees that list

var LOBBY = {
	poll: 2000,      // ms between lobby checks
	settle: 1500,    // ms to let a screen render before the next click
	cooldown: 60000, // ms before retrying a challenge we failed to enter
	stallMs: 90000,  // no board gained in this long => treat the challenge as stalled
	stallMaxMs: 900000 // a challenge that keeps stalling backs off, doubling up to this
};

var tlist = {};          // tid -> parsed attributes of the last <t> seen
// Have we seen the challenge list at all? NOT the same as "tlist has rows": with no
// challenges the list is empty, and treating that as "no data yet" sent the driver back to
// Challenges to load it every time it went anywhere else - the dailies included.
var tlistLoaded = false;
var challengeListSince = 0;
var lobbyBusy = false;
var lobbyCooldown = {};  // tid -> timestamp until which we leave it alone
var lastLobbyLog = '';
var lobbyEntered = {};   // tid -> {done, at} recorded when we entered, to detect no progress
var challengeGone = {};  // tid -> true once BBO has removed its row: the match is over
var challengeMisses = {};// tid -> consecutive ticks we looked for that row and it was absent
var challengeStalls = {};// tid -> {n, done}: how often it stalled at that count, for the backoff

// The challenge/daylong driver runs in mode "tourneys" only (see brillMode below).
function autoPlay() { return brillMode() === 'tourneys'; }

// Human ("PK") challenges are OFF unless explicitly enabled. Robot challenges need no flag.
// Separate from autoplay on purpose: turning the driver on should never, by itself, start it
// playing against people on an account that has not declared itself a robot.
function allowHuman() { return localStorage.getItem('BRILL_ALLOW_HUMAN') === '1'; }

function lobbyLog() {
	var a = ['[brill-lobby]'].concat([].slice.call(arguments));
	console.log.apply(console, a);
}

// ---- unthrottled timers --------------------------------------------------------
//
// Everything here is timer-driven: the 2s tick, the settle delays, and - through the same
// scope - the play engine's waitFor() polling and its card-click scheduling. Firefox throttles
// timers in a hidden tab, and the cost is not subtle. Measured against Brill.Service's
// /timings CSV over one daylong session:
//
//   tab hidden   median 40.7s between /play calls, one 396s hole at a board boundary
//   tab visible  median  2.4s, matching the 2.2s median across 1816 historical calls
//   service time median 357ms, p90 1.6s - unchanged throughout
//
// So the browser was sitting on our callbacks; nothing was slow but the waiting. Worker timers
// are not throttled that way, so the delay is taken there and the wake-up posted back.
//
// SCOPE - why shadowing is safe here. These declarations shadow setTimeout/setInterval INSIDE
// the userscript's IIFE only. The vendored BBOalert files and lobby.js see them because they
// are concatenated into that scope; PlayWithBrill's blocks see them because userScript() runs
// each block through a DIRECT eval(), which inherits the enclosing scope chain. BBO's own page
// code keeps the native timers - we are not second-guessing the app's scheduling, only our own.
//
// If the Worker cannot be created - a CSP without blob: in script-src would do it - every call
// falls through to the native timer and __brillChallenge.timers() reports it. The failure mode
// is "as slow as before", never "nothing runs".

var timerWorker = null;
var timerCallbacks = {};      // id -> {fn, args, ms, repeat, native}; callbacks never leave the page
var timerSeq = 0;
var timerMode = 'native';
var timerProbeOk = false;

function _fire(id) {
	var e = timerCallbacks[id];
	if (!e) return;
	if (!e.repeat) delete timerCallbacks[id];
	try {
		e.fn.apply(null, e.args);
	} catch (err) {
		lobbyLog('timer callback threw: ' + (err && err.message));
	}
}

// window.* explicitly: inside this scope the bare names are the shadowing declarations below.
function _armNative(id) {
	var e = timerCallbacks[id];
	if (!e) return;
	e.native = e.repeat
		? window.setInterval(function () { _fire(id); }, e.ms)
		: window.setTimeout(function () { _fire(id); }, e.ms);
}

// Give up on the worker and put every pending timer back on native ones.
//
// This is the load-bearing part, not a nicety. Shadowing the timers script-wide means a
// worker that accepts postMessage and never answers takes the lobby tick, the play engine's
// polling and every settle delay down with it - silently, since nothing throws. That is
// exactly what BBO's CSP produces: script-src is "* 'self' 'unsafe-inline' 'unsafe-eval'",
// and "*" does not cover blob:, so new Worker(blob:...) constructs fine and then never loads.
function timerFallback(reason) {
	if (!timerWorker) return;
	try { timerWorker.terminate(); } catch (e) { }
	timerWorker = null;
	timerMode = 'native (' + reason + ')';
	lobbyLog('worker timers unavailable (' + reason + ') - using native timers; the browser ' +
		'throttles those in a hidden tab, so keep the BBO tab visible');
	for (var id in timerCallbacks) _armNative(id);
}

(function startTimerWorker() {
	try {
		if (typeof Worker !== 'function' || typeof Blob !== 'function' || !window.URL) return;
		var src =
			'var t = {};' +
			'onmessage = function (e) {' +
			'  var d = e.data;' +
			'  if (d.op === "set") {' +
			'    t[d.id] = d.repeat' +
			'      ? setInterval(function () { postMessage(d.id); }, d.ms)' +
			'      : setTimeout(function () { postMessage(d.id); }, d.ms);' +
			'  } else if (d.op === "clear") {' +
			'    clearTimeout(t[d.id]); clearInterval(t[d.id]); delete t[d.id];' +
			'  }' +
			'};';
		timerWorker = new Worker(URL.createObjectURL(new Blob([src], { type: 'text/javascript' })));
		timerWorker.onerror = function (e) {
			timerFallback('worker error: ' + ((e && e.message) || 'load failed'));
		};
		timerWorker.onmessage = function (e) {
			if (e.data === '__probe') { timerProbeOk = true; return; }
			_fire(e.data);
		};
		timerMode = 'worker';

		// Prove it round-trips before trusting it with everything. A CSP-blocked worker fails
		// by staying quiet, so silence has to be treated as failure rather than as "not yet".
		timerWorker.postMessage({ op: 'set', id: '__probe', ms: 0 });
		window.setTimeout(function () {
			if (!timerProbeOk) timerFallback('no reply from the worker within 2s');
			else lobbyLog('timers: worker (not throttled when the tab is hidden)');
		}, 2000);
	} catch (e) {
		timerWorker = null;
		timerMode = 'native (worker blocked: ' + (e && e.message) + ')';
	}
})();

function _schedule(fn, ms, args, repeat) {
	// A string body is not worth emulating - hand those straight to the browser.
	if (typeof fn !== 'function') {
		return repeat ? window.setInterval(fn, ms) : window.setTimeout(fn, ms);
	}
	var id = 'w' + (++timerSeq);
	timerCallbacks[id] = { fn: fn, args: args, ms: ms || 0, repeat: !!repeat };
	if (timerWorker) timerWorker.postMessage({ op: 'set', id: id, ms: ms || 0, repeat: !!repeat });
	else _armNative(id);
	return id;                 // a string handle: truthy, and _clear() knows both kinds
}

function _clear(h) {
	if (typeof h === 'string') {
		var e = timerCallbacks[h];
		if (e && e.native !== undefined) {
			window.clearTimeout(e.native);
			window.clearInterval(e.native);
		}
		delete timerCallbacks[h];
		if (timerWorker) timerWorker.postMessage({ op: 'clear', id: h });
		return;
	}
	window.clearTimeout(h);
	window.clearInterval(h);
}

function setTimeout(fn, ms) { return _schedule(fn, ms, [].slice.call(arguments, 2), false); }
function setInterval(fn, ms) { return _schedule(fn, ms, [].slice.call(arguments, 2), true); }
function clearTimeout(h) { _clear(h); }
function clearInterval(h) { _clear(h); }

// ---- harvest -------------------------------------------------------------------

// Pull every <t .../> out of an ard.php body. Attribute soup, so a regex is honest here -
// the payload is flat, single-quoted values never appear, and DOMParser on every poll is
// needless work.
function harvestTlist(text) {
	if (!text || text.indexOf('<tlist') === -1) return 0;
	tlistLoaded = true;
	var rows = text.match(/<t\s[^>]*\/>/g) || [];
	for (var i = 0; i < rows.length; i++) {
		var d = {}, m, re = /([\w]+)="([^"]*)"/g;
		while ((m = re.exec(rows[i]))) d[m[1]] = m[2];
		if (d.tid) tlist[d.tid] = d;
	}
	if (rows.length) lobbyLog('tlist: ' + rows.length + ' rows');
	return rows.length;
}

// Hook both transports. The BBO client used XHR for ard.php when this was captured, but an
// app that switches to fetch later would silently stop feeding us - so watch both.
// Where a <tlist> came from. The challenge list is ard.php, but the daylong tournaments
// were NOT in it when this was first run live, so the URL that does carry them is exactly
// the fact this file is missing - announce each new source once, and it stops being a
// mystery.
var tlistSources = {};

function harvestFrom(url, text) {
	if (!text || text.indexOf('<tlist') === -1) return;
	var key = String(url).split('?')[0];
	if (!tlistSources[key]) {
		tlistSources[key] = true;
		if (key.indexOf('ard.php') === -1) {
			lobbyLog('tlist also served by ' + key + ' - worth recording in BBO-lobby-protocol.md');
		}
	}
	harvestTlist(text);
}

// Hook both transports, and do NOT filter on ard.php.
//
// The first version watched that one URL, which is fine for challenges and blind to
// everything else: on the first live run the tournament screen produced no rows at all, and
// there is no way to tell from inside the script whether the daylongs travel on a different
// call or simply were not fetched. Sniffing every text response for the literal "<tlist"
// answers that by itself - harvestTlist bails on the first indexOf when it is absent, so the
// cost is one string scan per response.
//
// The guards matter: reading .responseText throws when responseType is json/blob/arraybuffer,
// and cloning every fetch response to read it as text would drag binary payloads through
// memory for nothing.
(function hookTransports() {
	var NativeXHR = window.XMLHttpRequest;
	if (NativeXHR) {
		var open = NativeXHR.prototype.open;
		var send = NativeXHR.prototype.send;
		NativeXHR.prototype.open = function (method, url) {
			this.__brillUrl = url;
			return open.apply(this, arguments);
		};
		NativeXHR.prototype.send = function (body) {
			var xhr = this;
			try { bmWatchUdApi(xhr.__brillUrl, body, xhr); } catch (e) { }
			xhr.__brillBody = typeof body === 'string' ? body : '';
			xhr.addEventListener('load', function () {
				try {
					var rt = xhr.responseType;
					if (rt && rt !== 'text') return;
					harvestFrom(xhr.__brillUrl || '(xhr)', xhr.responseText);
					bmHarvest(xhr.__brillUrl || '', xhr.__brillBody || '', xhr.responseText);
				} catch (e) { lobbyLog('harvest', e); }
			});
			return send.apply(this, arguments);
		};
	}
	var nativeFetch = window.fetch;
	if (nativeFetch) {
		window.fetch = function (input) {
			var url = typeof input === 'string' ? input : (input && input.url) || '';
			var p = nativeFetch.apply(this, arguments);
			p.then(function (r) {
				var ct = '';
				try { ct = (r.headers.get('content-type') || '').toLowerCase(); } catch (e) { }
				var textish = !ct || ct.indexOf('xml') !== -1 || ct.indexOf('text') !== -1 ||
					ct.indexOf('html') !== -1;
				if (!textish) return;
				// Never tee a stream: a clone of text/event-stream (SignalR's fallback transport)
				// is read until the stream ends, and holding it can stall the real connection.
				if (ct.indexOf('event-stream') !== -1 || /signalr|notifications|negotiate/i.test(url)) return;
				r.clone().text().then(function (body) { harvestFrom(url, body); bmHarvest(url, '', body); })
					.catch(function () { });
			}).catch(function () { });
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
		if (challengeGone[tid]) continue;
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
		if (challengeGone[tid]) continue;
		var p = playable(tlist[tid]);
		if (!p) continue;
		if (lobbyCooldown[tid] && Date.now() < lobbyCooldown[tid]) continue;
		out.push(p);
	}
	return out;
}

// ---- daylong tournaments -------------------------------------------------------
//
// The dailies in the lobby's "Free Tournaments" list are the other thing this account can
// usefully play by itself: 8 or 16 boards against robots, at your own pace, resumable - the
// same asynchronous shape as a challenge. Once seated, the play engine needs no changes at
// all; only getting in is new.
//
// WHAT IS CAPTURED AND WHAT IS NOT
// --------------------------------
// ard.php is very likely the feed for these too - ARD is BBO's async-robot-duplicate
// service, and the daylongs ARE that product; the challenge rows we already harvest ride in
// a <tlist> built for it. But no daylong <t> row has actually been captured, so the field
// names below are candidates rather than observations, and the DOM of the tournament list is
// unknown. Everything that depends on either therefore SAYS what it matched, and
// __brillChallenge.tourneys() dumps the raw rows: a wrong guess shows up as a line in the
// console with the real field names next to it, not as a driver that quietly does nothing.
// Correcting it should be one edit to DAYLONG_DONE_KEYS or one localStorage override.
//
// WHICH ONES - and why this is an allowlist, not "all free tournaments"
// --------------------------------------------------------------------
// A daylong is scored against a field of other entrants, so entering one is a different
// decision from accepting a challenge that was sent to this account. The "Ben & Friends"
// series is hosted for bots - that is the point of it - so it is the default. BBO's own Free
// Daylong is a general competitive event and is deliberately NOT included; name it yourself
// if you want it:
//   __brillChallenge.daylongs(['ben & friends', 'free daylong'])
// A pattern matches as a case-insensitive substring of the title OR the host, so 'lorserker'
// selects that whole series and 'just declare' selects one tournament of it.
var DAYLONG_DEFAULT = ['ben & friends'];

function daylongPatterns() {
	var raw = localStorage.getItem('BRILL_DAYLONGS');
	if (raw === null) return DAYLONG_DEFAULT.slice();
	return raw.split(',')
		.map(function (s) { return s.trim().toLowerCase(); })
		.filter(function (s) { return s.length > 0; });
}

// A challenge row carries the c_challenge_* / c_challenger fields; anything else in the
// tlist is a tournament. Asked positively ("does this look like a challenge?") rather than
// by style name, so a tournament style we have never seen still classifies correctly.
function isChallengeRow(d) {
	return !!(d.c_challenge_style || d.c_challenger || d.c_challengee);
}

function matchesDaylong(d) {
	var pats = daylongPatterns();
	var hay = ((d.title || '') + ' ' + (d.host || '')).toLowerCase();
	for (var i = 0; i < pats.length; i++) {
		if (hay.indexOf(pats[i]) !== -1) return pats[i];
	}
	return null;
}

// Candidate names for "boards WE have played", best first; the loop after them is the safety
// net - any numeric field whose name talks about boards completed or played will do. The
// name that matched is carried in .field and logged, so the guess is visible.
var DAYLONG_DONE_KEYS = ['c_boards_completed', 'boards_completed', 'boards_played',
	'user_boards_played', 'bds_played', 'played', 'completed'];

function daylongProgress(d) {
	var total = parseInt(d.boards || '0', 10);
	for (var i = 0; i < DAYLONG_DONE_KEYS.length; i++) {
		var k = DAYLONG_DONE_KEYS[i];
		if (d[k] !== undefined && /^\d+$/.test(d[k])) {
			return { done: parseInt(d[k], 10), total: total, field: k };
		}
	}
	for (var k2 in d) {
		if (/(completed|played)/i.test(k2) && /^\d+$/.test(d[k2])) {
			return { done: parseInt(d[k2], 10), total: total, field: k2 };
		}
	}
	return { done: null, total: total, field: null };   // unknown - enterDaylong cools down instead
}

// Returns {tid, title, ...} for a tournament worth entering, or null.
function playableDaylong(d) {
	if (!d.tid || isChallengeRow(d)) return null;

	// Free only, whatever the title says. Daylongs also come in paid flavours, and a driver
	// that spends BB$ because a substring matched is a bug you find on the statement.
	if (parseFloat(d.fee || '0') > 0) return null;
	if (d.state && d.state !== 'RUNNING') return null;

	var pat = matchesDaylong(d);
	if (!pat) return null;

	var p = daylongProgress(d);
	if (p.done !== null && p.total && p.done >= p.total) return null;

	return {
		tid: d.tid, title: (d.title || '(untitled)'), host: (d.host || ''),
		done: p.done, total: p.total, field: p.field, pattern: pat, daylong: true
	};
}

function daylongTodo() {
	var out = [];
	for (var tid in tlist) {
		var p = playableDaylong(tlist[tid]);
		if (!p) continue;
		if (lobbyCooldown[tid] && Date.now() < lobbyCooldown[tid]) continue;
		out.push(p);
	}
	return out;
}

// Why is a row that DID match the allowlist not being played? Only used for the idle
// message, but it is the difference between "none matching" - which would be a lie if the
// reason was the state field or a fee - and a line you can act on.
function daylongSkipReason(d) {
	if (!d.tid || isChallengeRow(d) || !matchesDaylong(d)) return null;
	if (parseFloat(d.fee || '0') > 0) return 'fee ' + d.fee;
	if (d.state && d.state !== 'RUNNING') return 'state=' + d.state;
	var p = daylongProgress(d);
	if (p.done !== null && p.total && p.done >= p.total) {
		return 'finished ' + p.done + '/' + p.total;
	}
	return null;
}

// Every tournament row we know about, matched or not: the answer to "why is it not playing
// the daily I can see on screen?".
function tourneyRows() {
	var out = [];
	for (var tid in tlist) {
		if (!isChallengeRow(tlist[tid])) out.push(tlist[tid]);
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



// ---- daylongs on screen --------------------------------------------------------
//
// The first live run settled where these live: ard.php carries challenges only, and
// __brillChallenge.tourneys() stayed empty with the tournament list open. The dailies are
// simply not in the feed we hook - so for them the DOM is the source of truth, and the tlist
// path above stays only in case BBO ever starts serving them there.
//
// The screen is unambiguous. One row per tournament, columns Title / Entries / Starts /
// Entry fee:
//
//   Lorserker | Ben & Friends Daily - 2026-09-04 - 8 boards, Ind., MPs | 280 | Play now | Registered
//   BBO       | The 7 Tricks Challenge - Daily (Beginner) - Sep 04 ... | 167 | Play now | 0.10 BB$
//   BBO       | 10 min Free Robot Sprint ...                           | Full | 1 min   | Free
//
// which gives us the row's own entry link, the fee, and whether the row is even enterable -
// no modal in between. Two guards come straight off that layout: a row priced in BB$ is
// never clicked whatever the allowlist says, and a Full one is skipped.
var PLAY_NOW_LABELS = ['play now'];
var DOM_SCAN_MS = 4000;          // the scan walks every visible element; twice a tick is plenty
var domScan = { at: 0, rows: [] };

function norm(s) { return String(s == null ? '' : s).replace(/\s+/g, ' ').trim(); }

// Find the "Play now" links, then climb from each one to the row it belongs to. Climbing
// beats guessing a row selector: we have never seen this screen's markup, but "the nearest
// ancestor that also contains a title I want" is true of any table-ish layout. Bounded on
// both sides - six levels up, and a text length that still looks like one row rather than
// the whole table.
function scanDaylongRows() {
	var pats = daylongPatterns();
	if (!pats.length) return [];

	var override = localStorage.getItem('BRILL_PLAY_NOW_LABEL');
	var labels = override ? [override.toLowerCase()] : PLAY_NOW_LABELS;

	var out = [], seen = {};
	$('*:visible', PWD).each(function () {
		if (this.children && this.children.length) return;       // the label is a leaf
		var label = norm($(this).text()).toLowerCase();
		if (labels.indexOf(label) === -1) return;

		var node = $(this), row = null, rowText = '', pattern = null;
		for (var i = 0; i < 6; i++) {
			node = node.parent();
			if (!node.length) break;
			var text = norm(node.text());
			if (!text || text.length > 400) break;
			var lower = text.toLowerCase();

			// Stop before the table. An ancestor holding a SECOND entry link is no longer one
			// row, and matching there would bind this "Play now" to a neighbouring
			// tournament's title - i.e. click the wrong daily. Length alone would not catch
			// it: a three-row table still fits in 400 characters.
			if (lower.split(label).length - 1 > 1) break;

			for (var j = 0; j < pats.length; j++) {
				if (lower.indexOf(pats[j]) !== -1) { pattern = pats[j]; break; }
			}
			if (pattern) { row = node; rowText = text; break; }
		}
		if (!row) return;

		if (/BB\$/.test(rowText)) return;               // priced in BB$ - never, allowlist or not
		if (/\bFull\b/i.test(rowText)) return;

		// The row text arrives with no separators at all - "LorserkerBen & Friends Daily -
		// 2026-09-048 boards, Ind., MPs 280 Play now Registered" - and the entry count in the
		// middle of it moves as people join, so the whole string is useless as a key: the
		// cooldown and the miss counter would reset every time someone else registered. These
		// titles end in the date, so cut there.
		var dated = rowText.match(/^(.*?\d{4}-\d{2}-\d{2})/);
		var title = dated ? norm(dated[1]) : norm(rowText.split('\u2022')[0]).slice(0, 60);
		var tid = 'dom:' + title.toLowerCase();
		if (seen[tid]) return;
		seen[tid] = true;

		out.push({
			tid: tid, title: title, host: '', pattern: pattern, dom: true,
			done: null, total: 0, field: null, playNow: $(this)
		});
	});
	if (out.length) rememberDailyList(out);
	return out;
}

// ---- getting to the dailies without a nav button -------------------------------
//
// The tournament nav button has never been captured, and README's rule stands: moving the
// screen on a guess is worse than doing nothing. But the driver does not need to guess where
// the list is - it has SEEN it, every time the scanner found an allowlisted row. So it
// remembers that URL (in localStorage, so once per browser profile is enough) and goes back
// to it through the app's own router: pushState plus a popstate event, which is exactly what
// Angular's router listens for on Back/Forward. No reload, and the session survives.
//
// If that ever stops working the arrival check says so once and turns it off for the
// session, leaving the old behaviour - dailies played while the list is on screen.
var DAILY_LOOK_MS = 600000;      // idle, and every known daily finished: look for new ones this often
var DAILY_LOOK_MIN_MS = 60000;   // never look more often than this, whatever we think is open
var IDLE_DWELL_MS = 20000;       // idle off the challenge list this long => go back to it
var ARRIVE_MS = 10000;           // a look that has not reached the list by then has failed

var challengeListPath = null;    // where the challenge list lives, so we never "learn" that
var knownDailies = {};           // tid -> title, as of the last time the list was on screen
var lastDailyLook = 0;
var dailyLookPending = null;     // {at, url} while a look is under way
var dailyUrlBroken = false;
var dailyUrlHinted = false;
var idleOffListSince = 0;

function pagePath() {
	try { return PWD.location.pathname + PWD.location.search; } catch (e) { return ''; }
}

function dailyListUrl() {
	if (dailyUrlBroken) return null;
	try { return localStorage.getItem('BRILL_DAYLONG_LIST_URL') || null; } catch (e) { return null; }
}

function rememberDailyList(rows) {
	var here = pagePath();
	if (here && !onTournamentDetails() && here !== challengeListPath && here !== dailyListUrl()) {
		try { localStorage.setItem('BRILL_DAYLONG_LIST_URL', here); } catch (e) { }
		lobbyLog('learned where the dailies are: ' + here);
	}
	knownDailies = {};
	for (var i = 0; i < rows.length; i++) knownDailies[rows[i].tid] = rows[i].title;
	if (dailyLookPending) dailyLookPending = null;
}

function gotoPath(url) {
	var w = PWD.defaultView || window;
	w.history.pushState(null, '', url);
	w.dispatchEvent(new PopStateEvent('popstate', { state: null }));
}

// Is there a daily worth walking over for? Something we saw last time that is not cooling
// down says yes straight away; otherwise only every DAILY_LOOK_MS, which is how the next
// day's tournaments get noticed.
function dailyLookDue() {
	if (!daylongPatterns().length || !dailyListUrl()) return false;
	var since = Date.now() - lastDailyLook;
	if (since < DAILY_LOOK_MIN_MS) return false;
	for (var tid in knownDailies) {
		if (!(lobbyCooldown[tid] && Date.now() < lobbyCooldown[tid])) return true;
	}
	return since >= DAILY_LOOK_MS;
}

function lookAtDailies(why) {
	var url = dailyListUrl();
	lobbyLog(why + ' - checking the dailies (' + url + ')');
	lastDailyLook = Date.now();
	dailyLookPending = { at: Date.now(), url: url };
	lastLobbyLog = '';
	lobbyBusy = true;
	try { gotoPath(url); } catch (e) { lobbyLog('navigation failed: ' + (e && e.message)); }
	setTimeout(function () { lobbyBusy = false; }, LOBBY.settle * 2);
}

function checkDailyArrival() {
	if (!dailyLookPending || Date.now() - dailyLookPending.at < ARRIVE_MS) return;
	var here = pagePath();
	if (here !== dailyLookPending.url) {
		dailyUrlBroken = true;
		lobbyLog('went for the dailies at ' + dailyLookPending.url + ' but ended up on ' + here +
			' - not trying that again this session; open the tournament list by hand');
	}
	dailyLookPending = null;
}

// Nothing to play where we are. The challenge list is home - it is where new challenges
// show up - and the dailies are an errand from it: go when one may be open, come back when
// there is nothing left there.
function idleRoam() {
	checkDailyArrival();
	if (onChallengeList()) {
		idleOffListSince = 0;
		if (dailyLookDue()) lookAtDailies('no challenges to play');
		else if (!dailyListUrl() && !dailyUrlBroken && daylongPatterns().length && !dailyUrlHinted) {
			dailyUrlHinted = true;
			lobbyLog('nothing to play, and I do not know where the dailies list is yet - open it ' +
				'by hand once and I will remember it');
		}
		return;
	}
	if (!idleOffListSince) { idleOffListSince = Date.now(); return; }
	if (Date.now() - idleOffListSince < IDLE_DWELL_MS) return;
	idleOffListSince = 0;

	// Done with one daily and another is still open: straight on to it, not via home.
	if (pagePath() !== dailyListUrl() && dailyLookDue()) {
		lookAtDailies('nothing to play here');
		return;
	}

	// Leaving the list with nothing seen on it: whatever we remembered is gone from it.
	if (pagePath() === dailyListUrl() && !domScan.rows.length) knownDailies = {};

	var nav = challengesNavButton();
	if (!nav.length) return;
	lobbyLog('nothing left to play here - back to Challenges');
	lastLobbyLog = '';
	lobbyBusy = true;
	nav[0].click();
	setTimeout(function () { lobbyBusy = false; }, LOBBY.settle * 2);
}

var ARRIVAL_GRACE_MS = 8000;
var arrival = { path: null, at: 0 };  // the screen we are on and when we got there

function daylongDomTodo() {
	if (Date.now() - domScan.at >= DOM_SCAN_MS) {
		domScan = { at: Date.now(), rows: [] };
		try { domScan.rows = scanDaylongRows(); } catch (e) { lobbyLog('daylong scan', e); }
	}
	return domScan.rows.filter(function (r) {
		return !(lobbyCooldown[r.tid] && Date.now() < lobbyCooldown[r.tid]);
	});
}

// A finished daily still shows "Play now" - clicking it reopens the results rather than
// seating us. Nothing in the row says "you have played all 8", so count instead: entries
// that never reached a table. Three of those and the tournament is done for the next hour,
// which is what stops a completed daily from being re-entered every minute all day.
var lastDaylongTid = null;
var daylongMisses = {};
var DAYLONG_MAX_MISSES = 3;
var DAYLONG_DONE_COOLDOWN = 3600000;


// ---- the tournament details screen ---------------------------------------------
//
// Clicking a row's "Play now" does NOT seat us. BBO navigates to the tournament's own page,
// /v3/app/lv/tournament-details/<uuid>, which carries an entry card ("Your entry - this game
// ends in 9h 41m") and one PLAY button. Observed live: the driver clicked into "Ben & Friends
// Daily", landed here, and then reported "nothing to play" every two seconds - the list it
// had been reading was no longer on screen, and nothing pressed PLAY.
//
// The URL is the reliable signal; the button is matched on an exact label ("play" or, since
// 2026-11-05, "play now") - safe only because the list is not rendered on this URL.
function onTournamentDetails() {
	try {
		return String((PWD.location && PWD.location.href) || '').indexOf('tournament-details') !== -1;
	} catch (e) {
		return false;
	}
}

// 2026-11-05: BBO relabelled the details button "Play now" (same text as the list rows), so
// an exact "play" no longer matched and every daily was given up on as "finished". This only
// runs on a tournament-details URL, where the list is not rendered, so "play now" is safe here.
var DETAILS_PLAY_LABELS = ['play', 'play now'];

// The same day BBO's new tournament lobby stopped rendering it as a plain <button> we could
// find with 'button:visible'. So match on text, whatever the tag: the INNERMOST visible
// element whose whole text is the label (a click there bubbles up to the real handler), and
// prefer a real button/link ancestor when there is one.
var detailsProbeLogged = null;

function detailsPlayButton() {
	var override = localStorage.getItem('BRILL_DETAILS_PLAY_LABEL');
	var labels = override ? [override.toLowerCase()] : DETAILS_PLAY_LABELS;
	function label(el) { return norm($(el).text()).toLowerCase().replace(/!+$/, ''); }

	var hit = $('*:visible', PWD).filter(function () {
		if (labels.indexOf(label(this)) === -1) return false;
		// innermost: no child carries the same label
		for (var i = 0; i < this.children.length; i++) {
			if (labels.indexOf(label(this.children[i])) !== -1) return false;
		}
		return true;
	}).first();
	if (hit.length) {
		var btn = hit.closest('button, a, [role="button"]');
		return btn.length ? btn : hit;
	}

	// Not found: say once per page what play-ish things ARE there, so the next markup change
	// shows up in the log instead of as a silent "no PLAY button".
	var here = pagePath();
	if (detailsProbeLogged !== here) {
		detailsProbeLogged = here;
		var seen = [];
		$('*:visible', PWD).each(function () {
			var t = label(this);
			if (t.length < 20 && t.indexOf('play') !== -1 && seen.length < 8) {
				seen.push('<' + this.tagName.toLowerCase() + (this.className ? ' class="' +
					String(this.className).slice(0, 60) + '"' : '') + '> "' + t + '"');
			}
		});
		lobbyLog('details page: no element labelled ' + JSON.stringify(labels) +
			'; play-ish elements: ' + (seen.length ? seen.join(', ') : 'none'));
	}
	return $();
}

// Gated on the page itself naming an allowlisted tournament, not on what we clicked a moment
// ago: that also covers you navigating to a daily by hand, and refuses to press PLAY on a
// details page for something the allowlist does not cover.
//
// Returns 'leave' once a details page has shown no PLAY button for DETAILS_GIVE_UP_MS: the
// tick then carries on as if we were anywhere else in the lobby, instead of parking on a
// finished daily until someone navigates away by hand.
var DETAILS_GIVE_UP_MS = 10000;
var detailsNoPlaySince = 0;
var detailsGaveUp = null;        // the details page we already gave up on - don't wait again

function playFromDetails() {
	var pats = daylongPatterns();
	if (!pats.length) return;

	var text = '';
	try { text = norm($('body', PWD).text()).toLowerCase(); } catch (e) { }
	var pat = null;
	for (var i = 0; i < pats.length; i++) {
		if (text.indexOf(pats[i]) !== -1) { pat = pats[i]; break; }
	}

	var msg;
	if (!pat) {
		msg = 'on a tournament details page for something outside the allowlist - leaving it alone';
	} else if (!autoPlay()) {
		msg = 'on the details page for a "' + pat + '" tournament (autoplay off)';
	} else {
		var b = detailsPlayButton();
		if (b.length) {
			lobbyLog('details page for "' + pat + '" - clicking PLAY (<' + b[0].tagName.toLowerCase() + '> "' + norm(b.text()) + '")');
			lastLobbyLog = '';
			detailsNoPlaySince = 0;
			detailsGaveUp = null;
			lobbyBusy = true;
			b[0].click();
			setTimeout(function () { lobbyBusy = false; }, LOBBY.settle * 3);
			return;
		}
		// No PLAY button: either the day's boards are all played, or the entry card has not
		// rendered yet. Give it a moment for the second, then treat it as the first.
		if (detailsGaveUp === pagePath()) return 'leave';
		if (!detailsNoPlaySince) detailsNoPlaySince = Date.now();
		if (Date.now() - detailsNoPlaySince >= DETAILS_GIVE_UP_MS) {
			detailsNoPlaySince = 0;
			detailsGaveUp = pagePath();
			if (lastDaylongTid) {
				lobbyCooldown[lastDaylongTid] = Date.now() + DAYLONG_DONE_COOLDOWN;
				daylongMisses[lastDaylongTid] = 0;
				lastDaylongTid = null;
			}
			lobbyLog('details page for "' + pat + '" has no PLAY button - finished; moving on');
			lastLobbyLog = '';
			return 'leave';
		}
		msg = 'details page for "' + pat + '" but no PLAY button yet';
	}
	if (msg !== lastLobbyLog) { lobbyLog(msg); lastLobbyLog = msg; }
}

// ---- tournament screen ---------------------------------------------------------
//
// None of this is verified against a capture the way the challenge chain is (see
// BBO-lobby-protocol.md). It is written to fail LOUDLY instead: each step logs what it
// matched or says plainly that it found nothing, and the last two steps refuse to click
// anything ambiguous.

// The lobby's competitive area, where the "Free Tournaments" list lives. Same language trap
// as the Challenges button and the same ordered fix - override, icon, then labels.
var DAYLONG_ICONS = ['medal', 'trophy', 'tournament'];
var DAYLONG_LABELS = ['Competitive', 'Tournaments', 'Turneringer', 'Turniere', 'Tournois',
	'Torneos', 'Tornei', 'Toernooien', 'Turnieje'];

function daylongNavButton() {
	var buttons = $('button.bbo-phx-navigation', PWD);

	var override = localStorage.getItem('BRILL_TOURNAMENTS_LABEL');
	if (override) {
		var byOverride = buttons.filter(function () {
			return $(this).text().indexOf(override) !== -1;
		}).first();
		if (byOverride.length) return byOverride;
	}

	var byIcon = buttons.filter(function () {
		var host = $(this).closest('phoenix-regular-navigation-button')[0] || this;
		try {
			for (var i = 0; i < DAYLONG_ICONS.length; i++) {
				if ((host.innerHTML || '').indexOf(DAYLONG_ICONS[i]) !== -1) return true;
			}
		} catch (e) { }
		return false;
	}).first();
	if (byIcon.length) return byIcon;

	return buttons.filter(function () {
		var t = $(this).text();
		for (var i = 0; i < DAYLONG_LABELS.length; i++) {
			if (t.indexOf(DAYLONG_LABELS[i]) !== -1) return true;
		}
		return false;
	}).first();
}

// Find the on-screen row for a daylong.
//
// The challenge list renders rows as <challenge-list-item><div.itemClass>, and the
// tournament list looks the same in the lobby (title line, then a subtitle with the board
// count and scoring) - but its tag name has not been captured, so match on the TITLE TEXT
// rather than on an element name. Titles are proper nouns ("Ben & Friends Daily -
// 2026-09-03"), which makes this language-independent as a bonus.
//
// The wildcard fallback is deliberately last and only runs when a daily is actually due to
// be entered, not on every tick: it is the expensive branch, and `.last()` is what keeps it
// honest - ancestors precede their descendants in document order, so the last element still
// containing the whole title is the deepest one. Without that this matches <body>.
function daylongRow(target) {
	var want = String(target.title || '').replace(/\s+/g, ' ').trim().toLowerCase();
	if (!want) return $();

	var contains = function () {
		return $(this).text().replace(/\s+/g, ' ').trim().toLowerCase().indexOf(want) !== -1;
	};

	var rows = $('div.itemClass:visible', PWD).filter(contains);
	if (rows.length) return rows.first();

	var all = $('*:visible', PWD).filter(contains);
	if (!all.length) return $();
	var leaf = all.last();
	var clickable = leaf.closest('div.itemClass, [role="button"], button, li').first();
	return clickable.length ? clickable : leaf;
}

// The panel a row click opens. The challenge flow puts its details in <modal-content>
// inside Angular Material's overlay, so accept that plus a plain material dialog. Nothing
// below clicks anything unless one of these is actually on screen: a driver that hunts for
// buttons across the whole page eventually finds one it should not press.
function daylongPanel() {
	return $('modal-content:visible, mat-dialog-container:visible, ' +
		'.mat-dialog-container:visible, .cdk-overlay-pane:visible', PWD).first();
}

// The button that actually enters the tournament, inside that panel.
//
// This refuses to guess: a single visible button is unambiguous and gets clicked, several
// are logged and left alone until BRILL_DAYLONG_ENTER_LABEL names the right one. Taking
// "the first button" of an unseen modal is how a driver ends up pressing Cancel forever -
// or something that costs BB$.
var ENTER_LABELS = ['play now', 'enter', 'register', 'start', 'play'];

function daylongEnterButton(panel) {
	var btns = $('.buttonBarClass button:visible', panel);
	if (!btns.length) btns = $('button:visible', panel);
	if (!btns.length) return null;

	var override = localStorage.getItem('BRILL_DAYLONG_ENTER_LABEL');
	var labels = override ? [override.toLowerCase()] : ENTER_LABELS;
	var byText = btns.filter(function () {
		var t = $(this).text().replace(/\s+/g, ' ').trim().toLowerCase();
		for (var i = 0; i < labels.length; i++) {
			if (t.indexOf(labels[i]) !== -1) return true;
		}
		return false;
	}).first();
	if (byText.length) {
		return { el: byText, how: 'label "' + byText.text().replace(/\s+/g, ' ').trim() + '"' };
	}
	if (btns.length === 1) return { el: btns.first(), how: 'the only button in the panel' };

	return {
		el: null,
		choices: btns.map(function () {
			return $(this).text().replace(/\s+/g, ' ').trim();
		}).get()
	};
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

// ---------------------------------------------------------------- Bridge Master
//
// Practice > Bridge Master (/v3/app/lv/practice) is an ordinary bridge-screen, so the play
// engine attaches as usual - but the table has NO vul-panel, and the vul-panel is where
// getDealNumber() reads the board number. Verified live on Level 3 A-1:
//
//   getDealNumber() ''   -> tableType() 'no', and PlayWithBrill's getDealerDirection()
//                           ("NESW".charAt((dealno-1)%4)) gives '' -> /play 400 "Invalid dealer"
//   getContext()    '2C--2D--2S--4S--6S------'   (the auction is there and reads fine)
//
// Rather than teach every dealer/vul consumer about Bridge Master, getDealNumber() returns a
// SYNTHETIC board number on that screen, chosen so that everything derived from it is right:
//
//   dealer  - (n-1)%4 - worked back from the auction: the declarer (always us: Bridge Master
//             is declarer play) made the first bid of the final strain on our side
//   vul     - (n-1)%16 lands on a board where nobody is vulnerable; the screen does not say
//   unique  - + 16 * a serial from the problem id ("Level 3 A-1"), so the next problem is a
//             new deal number even with the same dealer, and onNewDeal fires
//
// The number appears only once the auction is complete (ends in three passes), so the
// observer never sees a half-drawn problem as a deal.
var BM_BASE = { N: 1, E: 14, S: 11, W: 8 };   // the boards 1-16 with that dealer and vul None
var bmCache = { key: null, value: '' };

function bmPanel() { return $('bridge-master-panel:visible', PWD); }
function onBridgeMaster() { return bmPanel().length > 0; }

// "Bridge Master Level 3 A-1 Show solution Next deal ..." -> "3 A-1". Matched on the shape,
// not on the word "Level", so a localised UI still works.
function bmProblemId() {
	var m = norm(bmPanel().text()).match(/(\d+)\s*([A-Z])\s*-\s*(\d+)/i);
	return m ? m[1] + ' ' + m[2].toUpperCase() + '-' + m[3] : '';
}

function bmSerial(id) {
	var m = id.match(/^(\d+) ([A-Z])-(\d+)$/);
	if (!m) return 0;
	return parseInt(m[1], 10) * 10000 + (m[2].charCodeAt(0) - 64) * 100 + parseInt(m[3], 10);
}

function bmDeclarer() {
	var d = '';
	try { if (typeof getDeclarerDirection === 'function') d = getDeclarerDirection(); } catch (e) { }
	if ('NESW'.indexOf(d) >= 0 && d.length === 1) return d;
	return mySeat();                  // Bridge Master always makes us declarer
}

// Dealer from a complete auction and the declarer's seat.
function bmDealer(ctx, decl) {
	if (!ctx || ctx.length % 2 || !/------$/.test(ctx) || decl.length !== 1 || 'NESW'.indexOf(decl) < 0) return '';
	var calls = ctx.match(/../g), last = -1, i;
	for (i = 0; i < calls.length; i++) if (!/^(--|Db|Rd)$/.test(calls[i])) last = i;
	if (last < 0) return '';
	var strain = calls[last].charAt(1);
	for (i = last % 2; i <= last; i += 2) {
		if (calls[i].charAt(1) === strain) return 'NESW'.charAt((('NESW'.indexOf(decl) - i) % 4 + 4) % 4);
	}
	return '';
}

function bmDealNumber() {
	var id = bmProblemId(), ctx = getContext(), decl = bmDeclarer();
	var key = id + '|' + ctx + '|' + decl;
	if (key === bmCache.key) return bmCache.value;
	var dealer = bmDealer(ctx, decl);
	var value = (id && dealer) ? String(BM_BASE[dealer] + 16 * bmSerial(id)) : '';
	bmCache = { key: key, value: value };
	if (value) lobbyLog('Bridge Master ' + id + ': ' + ctx + ', declarer ' + decl + ', dealer ' + dealer +
		' -> deal number ' + value);
	return value;
}

// OVERRIDES BBO_DOM.js's getDealNumber (the later declaration in this scope wins - the same
// mechanism the shim uses for onNavDivDisplayed). Unchanged wherever a vul-panel exists.
function getDealNumber() {
	var n = $('.vulPanelInnerPanelClass', getNavDiv()).text().trim();
	if (n !== '') return n;
	return onBridgeMaster() ? bmDealNumber() : '';
}

// Moving on. A problem is over when BBO shows its end panel, or the play engine has finished
// the deal; failing both, when nothing on the table has moved for a minute (a problem BBO
// ends early, or one we cannot play) - that one is logged loudly. Then "Next deal".
// localStorage.BRILL_BM_AUTONEXT = '0' leaves it on screen instead.
var BM_NEXT_LABELS = ['next deal'];
var BM_END_WAIT_MS = 4000;    // let the last /play go out and the result be seen
var BM_STALL_MS = 60000;
var BM_NO_MOVE_MS = 15000;    // Next pressed and still the same problem: end of the set
var bm = { id: null, key: '', since: 0, endSeen: 0, nextAt: 0, warned: false };

function bmAutoNext() { return localStorage.getItem('BRILL_BM_AUTONEXT') !== '0'; }

function visibleButtonLabels() {
	return $('button:visible, [role="button"]:visible', PWD).map(function () {
		return norm($(this).text());
	}).get().filter(Boolean).join(' | ');
}

function bmNextButton() {
	var override = localStorage.getItem('BRILL_BM_NEXT_LABEL');
	var labels = override ? [override.toLowerCase()] : BM_NEXT_LABELS;
	return $('button:visible, [role="button"]:visible', PWD).filter(function () {
		return labels.indexOf(norm($(this).text()).toLowerCase()) !== -1;
	}).first();
}

// deal-end-panel / game-over-panel are laid out (":visible") from the moment a Bridge Master
// problem appears - in 0.10.0 that made every problem "over" at once and the driver skipped
// through the whole set. So only a CHANGE in their text since the problem started counts.
// The verdict banner Bridge Master draws over the table: "Contract Made" (seen live, with a
// star). Looked for anywhere on the table rather than only in the end panels, because which
// element carries it is not known. Short text naming the contract and a verdict, innermost.
var BM_BANNER = /\bcontract\b.{0,20}\b(made|fail(ed)?|defeated|down|set)\b/i;

function bmBannerText() {
	var hit = $('bridge-screen *:visible', PWD).filter(function () {
		var t = bmSplitWords(norm($(this).text()));
		if (t.length > 40 || !BM_BANNER.test(t)) return false;
		for (var i = 0; i < this.children.length; i++) {
			if (BM_BANNER.test(norm($(this.children[i]).text()))) return false;
		}
		return true;
	}).first();
	return hit.length ? bmSplitWords(norm(hit.text())) : '';
}

// BBO's end box joins its texts with no space between elements ("Contract FailedPlay again
// Leave table"), which defeats every  in the patterns below - all 13 Level 2 results went
// down as "unknown". Split a lower-case letter running into a capital back apart first.
function bmSplitWords(t) { return t.replace(/([a-z])([A-Z])/g, '$1 $2'); }

function bmEndPanelText() {
	var panel = bmSplitWords(norm($('deal-end-panel:visible, game-over-panel:visible', PWD).text()));
	var banner = bmBannerText();
	return banner && panel.indexOf(banner) === -1 ? (banner + ' ' + panel).trim() : panel;
}

function bmEndReason() {
	var endText = bmEndPanelText();
	if (endText && endText !== bm.endTextAtStart) return 'end panel: "' + endText.slice(0, 120) + '"';
	if (typeof deal !== 'undefined' && deal && deal.finished && String(deal.number) === getDealNumber()) {
		return 'deal finished';
	}
	var key = getContext() + '|' + $('hand-diagram-card:visible, hand-diagram-current-trick-card:visible', PWD).length +
		'|' + $('#navDiv .nameBarClass:visible', PWD).map(function () { return this.style.backgroundColor; }).get().join();
	if (key !== bm.key) { bm.key = key; bm.since = Date.now(); return ''; }
	var busy = typeof playInProgress !== 'undefined' && playInProgress;
	if (!busy && Date.now() - bm.since > BM_STALL_MS) return 'NOTHING MOVED FOR ' + (BM_STALL_MS / 1000) + 's';
	return '';
}

// ---- results ------------------------------------------------------------------
//
// One record per problem in localStorage.BRILL_BM_RESULTS, keyed by id ("3 A-1"). Bridge
// Master counts the FIRST attempt, so that is kept apart from the latest one: a problem
// replayed after reading the solution does not turn a failure into a success.
//
// made/failed is read from the end-panel wording, which has not been seen yet in English -
// anything the patterns miss is stored as 'unknown' WITH the raw text, so the first
// unknown in the log is what to extend BM_MADE / BM_FAILED with.
var BM_RESULTS_KEY = 'BRILL_BM_RESULTS';
var BM_LEVEL_SIZE = { 1: 66 };          // problems per level, where known
var BM_FAILED = /\b(down|fail(ed|ure)?|sorry|defeated|went off|unsuccessful|not made|did not make)\b/i;
var BM_MADE = /\b(made|making|success(ful)?|succeeded|well done|congratulations|correct|solved)\b/i;

function bmLoadResults() {
	try { return JSON.parse(localStorage.getItem(BM_RESULTS_KEY) || '{}') || {}; } catch (e) { return {}; }
}

function bmSaveResults(r) {
	try { localStorage.setItem(BM_RESULTS_KEY, JSON.stringify(r)); } catch (e) { lobbyLog('could not save results: ' + e); }
}

function bmClassify(text, why) {
	if (/^NOTHING MOVED/.test(why)) return 'stalled';
	if (BM_FAILED.test(text)) return 'failed';
	if (BM_MADE.test(text)) return 'made';
	return 'unknown';
}

function bmRecord(id, why) {
	if (!id) return;
	var text = bmEndPanelText();
	var result = bmClassify(text, why);
	var played = (typeof deal !== 'undefined' && deal && deal.played) ? deal.played.join(' ') : '';
	var all = bmLoadResults();
	var prev = all[id];
	var level = parseInt(id, 10);
	all[id] = {
		level: level,
		first: prev ? prev.first : result,
		last: result,
		attempts: (prev ? prev.attempts : 0) + 1,
		at: new Date().toISOString(),
		contract: norm($('.tricksPanelTricksLabelClass:visible', PWD).text()),
		ctx: getContext(),
		key: bm.dealKey || bmDealKey(),
		server: bmServerName(),
		text: text.slice(0, 300),
		why: why,
		played: played
	};
	bmSaveResults(all);
	var s = bmSummary()[level] || {};
	lobbyLog('Bridge Master ' + id + ': ' + result.toUpperCase() +
		(prev ? ' (attempt ' + all[id].attempts + ', first was ' + prev.first + ')' : '') +
		' - level ' + level + ' so far: ' + s.made + ' made, ' + s.failed + ' failed' +
		(s.other ? ', ' + s.other + ' unknown/stalled' : '') + ' of ' + (s.size || '?') +
		(result === 'unknown' ? '  <- end text not recognised: "' + text.slice(0, 160) + '"' : ''));
}

// Per level, counting first attempts.
function bmSummary() {
	var all = bmLoadResults(), out = {};
	Object.keys(all).forEach(function (id) {
		var r = all[id], L = r.level;
		if (!out[L]) out[L] = { played: 0, made: 0, failed: 0, other: 0, lastMade: 0, size: BM_LEVEL_SIZE[L] || null, failedIds: [] };
		out[L].played++;
		if (r.last === 'made') out[L].lastMade++;
		if (r.first === 'made') out[L].made++;
		else if (r.first === 'failed') { out[L].failed++; out[L].failedIds.push(id); }
		else out[L].other++;
	});
	Object.keys(out).forEach(function (L) {
		out[L].failedIds.sort(function (a, b) { return bmSerial(a) - bmSerial(b); });
	});
	return out;
}

function bridgeMasterTick() {
	if (!onBridgeMaster()) { bm.id = null; return; }
	var id = bmProblemId();
	if (id !== bm.id) {
		bm = { id: id, key: '', since: Date.now(), endSeen: 0, nextAt: 0, warned: false,
			endTextAtStart: bmEndPanelText(), dealKey: bmDealKey() };
		if (bm.endTextAtStart) lobbyLog('Bridge Master ' + id + ': end panel already says "' +
			bm.endTextAtStart.slice(0, 120) + '" - ignoring that');
		return;
	}
	// What to do when the problem is over depends on the mode:
	//   bm        Next deal (unless BRILL_BM_AUTONEXT = '0')
	//   tourneys  finish this problem, then back to the lobby for challenges and dailies
	//   off       nothing - but the result is still recorded
	var mode = brillMode();
	var leaving = mode === 'tourneys';
	if (!leaving && !(mode === 'bm' && bmAutoNext())) {
		var w = bm.endSeen ? '' : bmEndReason();
		if (w) { bm.endSeen = Date.now(); bmRecord(id, w); }
		return;
	}
	if (bm.nextAt) {
		if (!bm.warned && Date.now() - bm.nextAt > BM_NO_MOVE_MS) {
			bm.warned = true;
			lobbyLog('Bridge Master: pressed Next deal on ' + id + ' and it is still showing - end of ' +
				'the set? Pick the next one with Select deal. Buttons: ' + visibleButtonLabels());
		}
		return;
	}
	var why = bmEndReason();
	if (!why) return;
	if (!bm.endSeen) {
		bm.endSeen = Date.now();
		lobbyLog('Bridge Master ' + id + ' over (' + why + ')');
		bmRecord(id, why);
		return;
	}
	if (Date.now() - bm.endSeen < BM_END_WAIT_MS) return;
	if (leaving) {
		var lb = lobbyButton();
		lobbyLog('Bridge Master ' + id + ' done; mode is Dailies - back to the lobby' + (lb.length ? '' : ' (no Lobby button - going home)'));
		bm.nextAt = Date.now();
		if (lb.length) lb[0].click(); else gotoPath('/v3/');
		return;
	}
	if (bmReplayActive()) { bm.nextAt = Date.now(); bmReplayAdvance(id); return; }
	var b = bmNextButton();
	if (!b.length) {
		if (!bm.warned) {
			bm.warned = true;
			lobbyLog('Bridge Master ' + id + ': no "Next deal" button. Buttons: ' + visibleButtonLabels() +
				' - set localStorage.BRILL_BM_NEXT_LABEL to the right one');
		}
		return;
	}
	lobbyLog('Bridge Master ' + id + ' - pressing Next deal');
	bm.nextAt = Date.now();
	b[0].click();
}

// Since 2026-11-07 a finished Bridge Master problem can end in a box of its own - "Contract
// Failed / Play again / Leave table" - with the table and the Bridge Master panel gone
// ("Deal removed"), so bridgeMasterTick never runs and nothing pressed Next deal. Away from
// the panel, in Bridge Master mode: press a Next deal button if one is showing anywhere,
// else the button named in localStorage.BRILL_BM_END_BUTTON; failing both, say once which
// buttons there are, so the right one can be named.
var bmEndBoxAt = 0, bmEndBoxLogged = '';
function bmEndBoxTick() {
	if (brillMode() !== 'bm' || !bmAutoNext() || onBridgeMaster()) return false;
	var labels = visibleButtonLabels();
	if (!/play again|leave table|next deal/i.test(labels)) return false;
	if (Date.now() - bmEndBoxAt < 10000) return true;
	if (bmReplayActive()) { bmEndBoxAt = Date.now(); bmReplayAdvance(bm.id); return true; }
	var want =(localStorage.getItem('BRILL_BM_END_BUTTON') || '').toLowerCase();
	var pick = $('button:visible, [role="button"]:visible', PWD).filter(function () {
		var t = norm($(this).text()).toLowerCase();
		return t === 'next deal' || (want && t === want);
	}).first();
	if (pick.length) {
		bmEndBoxAt = Date.now();
		lobbyLog('Bridge Master: end box - pressing "' + norm(pick.text()) + '"');
		pick[0].click();
		return true;
	}
	if (bmEndBoxLogged !== labels) {
		bmEndBoxLogged = labels;
		lobbyLog('Bridge Master: the problem ended in a box with no Next deal. Buttons: ' + labels +
			'. Tell the script which one moves on: localStorage.BRILL_BM_END_BUTTON = '<label>'' +
			' (tags on screen: ' + bmScreenTags() + ')');
	}
	return true;
}

// The custom elements on screen, for the log line above: which BBO screen this is.
function bmScreenTags() {
	var seen = {};
	$('*:visible', PWD).each(function () {
		var n = this.tagName.toLowerCase();
		if (n.indexOf('-') > 0) seen[n] = 1;
	});
	return Object.keys(seen).slice(0, 40).join(' ');
}

// ---------------------------------------------------------------- BBO's own Bridge Master record
//
// BBO keeps the stars and crosses on its server: one key-value entry, bm_results, read and
// written through POST https://webutil.bridgebase.com/v2/ud_api.php with c=kvget / c=kvset,
// u=<user>, sp=<session password>, k=bm_results, v="1A-1Y|3A-1N|..." (Y made, N failed).
// BBO reads it once per login (when the Bridge Master dialog first opens) and writes the
// whole list back after every problem. Watching those calls gives us u and sp, so the
// settings panel can send the same request with v empty - the reset. The page still holds
// the old list in memory and would write it back after the next problem, so a reset always
// reloads the page straight away.
//
// Which problem is open is BBO's setting <user>_bm_deal in localStorage (with <user>_bm_level);
// "Next deal" and "Select deal" both write it. Setting the two and reloading makes BBO open
// Bridge Master on that problem - which is how "Replay failed" gets back to a problem.
var bmUdApi = null;        // { url, body } of the last bm_results call seen this session
var bmBboList = null;      // BBO's results string as last loaded or saved
try { bmBboList = localStorage.getItem('BRILL_BM_BBO_LIST'); } catch (e) { }
function bmSetBboList(v) { bmBboList = v; try { localStorage.setItem('BRILL_BM_BBO_LIST', v); } catch (e) { } }

// BBO's own verdicts, from its bm_results string ("1A-4?|2A-12N|..."): id -> 'Y' | 'N' | '?'.
// '?' is a problem left mid-play (half star). It is the record of truth for "what failed":
// ours may miss a problem that was cut off (1 A-4 on 2026-11-08 was never recorded as failed).
function bmBboVerdicts() {
	var out = {};
	(bmBboList || '').split('|').forEach(function (e) {
		var m = /^(\d)([A-Z])-(\d+)([YN?])$/.exec(e.trim());
		if (m) out[m[1] + ' ' + m[2] + '-' + m[3]] = m[4];
	});
	return out;
}

function bmWatchUdApi(url, body, xhr) {
	url = String(url || '');
	if (url.indexOf('ud_api.php') < 0) return;
	var q = typeof body === 'string' ? body : (url.split('?')[1] || '');
	if (q.indexOf('bm_results') < 0) return;
	var p = new URLSearchParams(q);
	bmUdApi = { url: url, body: q, get: typeof body !== 'string' };
	if (p.get('c') === 'kvset') bmSetBboList(p.get('v') || '');
	if (p.get('c') === 'kvget') xhr.addEventListener('load', function () {
		try { var m = /\bv="([^"]*)"/.exec(xhr.responseText || ''); if (m) bmSetBboList(m[1]); } catch (e) { }
	});
}

// ---- Bridge Master problem list and solutions ----------------------------------
//
// BBO's client gets both over plain HTTP from its web utilities (webUtilName_bridge_master):
//   the problem list: elements with handid / level / setname / handnumber  ("A" + "1" = A-1)
//   a solution:       handid=<key>&fetch_movie=y, answered with a "lin" attribute - the
//                     solution movie, with Bridge Master's commentary (LIN nt| records)
// We keep both: the key map lets "Replay failed" open any problem, and the solutions are the
// intended lines to test the engine against offline. They are never sent to the engine while
// it plays - Brill sees only what any declarer sees.
var BM_KEYS_KEY = 'BRILL_BM_KEYS', BM_SOLUTIONS_KEY = 'BRILL_BM_SOLUTIONS';

function bmLoadJson(k) { try { return JSON.parse(localStorage.getItem(k) || '{}') || {}; } catch (e) { return {}; } }
function bmSaveJson(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { lobbyLog('could not save ' + k + ': ' + e); } }

function bmHarvest(url, body, text) {
	if (!text || typeof text !== 'string') return;
	if (text.indexOf('handid') < 0 && text.indexOf('lin=') < 0) return;
	var doc;
	try { doc = new DOMParser().parseFromString(text, 'text/xml'); } catch (e) { return; }
	if (!doc || doc.getElementsByTagName('parsererror').length) return;
	var q = new URLSearchParams((String(url).split('?')[1] || '') + '&' + (body || ''));
	// A solution movie.
	var lin = doc.documentElement && doc.documentElement.getAttribute('lin');
	if (lin && q.get('fetch_movie') === 'y' && q.get('handid')) {
		// Keep BBO's own request, so the solutions of other problems can be fetched the same way.
		if (!bmFetching) bmSaveJson(BM_MOVIE_REQ_KEY, { url: String(url), body: body || '' });
		var sol = bmLoadJson(BM_SOLUTIONS_KEY);
		if (!sol[q.get('handid')]) {
			sol[q.get('handid')] = lin.replace(/@/g, '!');
			bmSaveJson(BM_SOLUTIONS_KEY, sol);
			lobbyLog('Bridge Master: saved the solution of ' + (bmIdForKey(q.get('handid')) || q.get('handid')));
			bmUpdatePanelCounts();
		}
		return;
	}
	// The problem list.
	var els = doc.getElementsByTagName('*'), keys = bmLoadJson(BM_KEYS_KEY), n = 0;
	for (var i = 0; i < els.length; i++) {
		var e = els[i], h = e.getAttribute('handid'), L = e.getAttribute('level'),
			set = e.getAttribute('setname'), num = e.getAttribute('handnumber');
		if (!h || !L || !set || !num) continue;
		var id = parseInt(L, 10) + ' ' + set.toUpperCase() + '-' + num;
		if (keys[id] !== h) { keys[id] = h; n++; }
	}
	if (n) { bmSaveJson(BM_KEYS_KEY, keys); lobbyLog('Bridge Master: ' + n + ' problem keys learned (' + Object.keys(keys).length + ' known)'); bmUpdatePanelCounts(); }
}

// The settings panel draws its counts when it opens; keep them current while it is open.
function bmUpdatePanelCounts() {
	var a = document.getElementById('bs-nkeys'), b = document.getElementById('bs-nsol');
	if (a) a.textContent = Object.keys(bmLoadJson(BM_KEYS_KEY)).length;
	if (b) b.textContent = Object.keys(bmLoadJson(BM_SOLUTIONS_KEY)).length;
}

// Fetch solutions by repeating BBO's own "Show solution" request (BRILL_BM_MOVIE_REQ, saved the
// first time BBO fetched one) with another problem's handid. One request every 1.5 s, only for
// the problems asked for (the failed ones), and never while Brill is playing them.
var BM_MOVIE_REQ_KEY = 'BRILL_BM_MOVIE_REQ', bmFetching = false;
function bmFetchSolutions(ids, done) {
	var req = bmLoadJson(BM_MOVIE_REQ_KEY);
	if (!req.url) { done('press Show solution on any problem once first, so the script learns the request BBO sends'); return; }
	var keys = bmLoadJson(BM_KEYS_KEY), sol = bmLoadJson(BM_SOLUTIONS_KEY);
	var todo = ids.filter(function (id) { return keys[id] && !sol[keys[id]]; });
	if (!todo.length) { done('all ' + ids.length + ' already saved'); return; }
	bmFetching = true;
	var got = 0, i = 0;
	(function next() {
		if (i >= todo.length) { bmFetching = false; done('saved ' + got + ' of ' + todo.length); return; }
		var id = todo[i++], h = keys[id];
		var base = req.url.split('?')[0], qs = new URLSearchParams(req.body || (req.url.split('?')[1] || ''));
		qs.set('handid', h); qs.set('fetch_movie', 'y');
		var p = req.body
			? fetch(base, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: qs.toString() })
			: fetch(base + '?' + qs.toString(), { credentials: 'include' });
		p.then(function (r) { return r.text(); })
			.then(function (t) {
				var before = Object.keys(bmLoadJson(BM_SOLUTIONS_KEY)).length;
				bmHarvest(base + '?' + qs.toString(), '', t);
				if (Object.keys(bmLoadJson(BM_SOLUTIONS_KEY)).length > before) got++;
				else lobbyLog('Bridge Master: no solution in the answer for ' + id + ': ' + t.slice(0, 120));
			})
			.catch(function (e) { lobbyLog('Bridge Master: solution fetch failed for ' + id + ': ' + e.message); })
			.then(function () { setTimeout(next, 1500); });
	})();
}

function bmIdForKey(h) {
	var keys = bmLoadJson(BM_KEYS_KEY);
	for (var id in keys) if (keys[id] === h) return id;
	return '';
}

function bmUserKey(name) { return myName() + '_' + name; }
function bmDealKey() { try { return localStorage.getItem(bmUserKey('bm_deal')) || ''; } catch (e) { return ''; } }

function bmServerName() {
	try {
		var base = typeof getBrillBaseUrl === 'function' ? getBrillBaseUrl() : '';
		var q = typeof getServerQuery === 'function' ? getServerQuery() : '';
		return base + (q ? '?' + q.slice(1) : '');
	} catch (e) { return ''; }
}

// Clear BBO's stars and crosses. cb(error) - on success the page reloads instead.
function bmResetBbo(alsoOurs, cb) {
	if (!bmUdApi) {
		cb('BBO has not loaded its Bridge Master results since this page opened. Open the Bridge ' +
			'Master dialog once (or finish a problem), then press Reset again.');
		return;
	}
	var base = bmUdApi.url.split('?')[0];
	var p = new URLSearchParams(bmUdApi.body);
	p.set('c', 'kvset'); p.set('k', 'bm_results'); p.set('v', '');
	var req = bmUdApi.get ? fetch(base + '?' + p.toString(), { credentials: 'include' })
		: fetch(bmUdApi.url, { method: 'POST', credentials: 'include',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: p.toString() });
	req.then(function (r) { return r.text().then(function (t) { return { ok: r.ok, text: t }; }); })
		.then(function (r) {
			var err = /\berr="(\d+)"/.exec(r.text);
			if (!r.ok || (err && err[1] !== '0')) { cb('BBO answered: ' + r.text.slice(0, 200)); return; }
			lobbyLog('Bridge Master: BBO record cleared (' + r.text.slice(0, 120) + ') - reloading');
			if (alsoOurs) localStorage.removeItem(BM_RESULTS_KEY);
			bmReplayStop();
			location.reload();
		})
		.catch(function (e) { cb('request failed: ' + e.message); });
}

// ---- Replay failed ----------------------------------------------------------
//
// localStorage.BRILL_BM_REPLAY = { ids: ["2 A-12", ...], i: <index of the one being played> }.
// Each failed problem whose BBO key was recorded is opened in turn; when it ends, the next
// one is set up and the page reloads. Bridge Master keeps scoring the first attempt, so a
// replay never turns a cross into a star; our own record keeps first and last apart.
var BM_REPLAY_KEY = 'BRILL_BM_REPLAY';

function bmReplayState() {
	try { return JSON.parse(localStorage.getItem(BM_REPLAY_KEY) || 'null'); } catch (e) { return null; }
}
function bmReplayActive() { var s = bmReplayState(); return !!(s && s.ids && s.i < s.ids.length); }
function bmReplayStop() { localStorage.removeItem(BM_REPLAY_KEY); }

// The failed problems (first attempt, or 'last' to retry what still fails) we can get back to.
function bmFailedIds(level, which) {
	var all = bmLoadResults(), seen = {};
	var ids = Object.keys(all).filter(function (id) {
		var r = all[id];
		return r[which || 'first'] === 'failed';
	});
	// "failed first time" also takes what BBO itself marks failed (N) or unfinished (?).
	if ((which || 'first') === 'first') {
		var v = bmBboVerdicts();
		Object.keys(v).forEach(function (id) { if (v[id] !== 'Y') ids.push(id); });
	}
	return ids.filter(function (id) {
		if (seen[id]) return false; seen[id] = true;
		return (!level || parseInt(id, 10) === +level) && bmDealValueFor(id);
	}).sort(function (a, b) { return bmSerial(a) - bmSerial(b); });
}

function bmReplayStart(level, which) {
	var ids = bmFailedIds(level, which);
	if (!ids.length) return 'no failed problems with a known BBO key' + (level ? ' on level ' + level : '') +
		' (keys are learned when the Bridge Master deal list is opened, and recorded per problem from 0.14 on)';
	localStorage.setItem(BM_REPLAY_KEY, JSON.stringify({ ids: ids, i: 0 }));
	setBrillMode('bm');
	bmReplayOpen(ids[0]);
	return 'replaying ' + ids.length + ': ' + ids.join(', ');
}

// Opening a problem is done on the page, the way a person does it: "Select deal" on the
// Bridge Master panel opens BBO's dialog (<bridge-master-popup>), then the level button, then
// the deal ("A-12"). No reload - a reload stops at BBO's "leave this page?" prompt.
// bmReplayTick drives it, one step every couple of seconds; BBO's own <user>_bm_level and
// _bm_deal are set as well, so a reload by hand would open the same problem.
var bmPick = { target: '', step: '', at: 0, tries: 0 };

function bmReplayOpen(id) {
	var v = bmDealValueFor(id);
	if (v) {
		localStorage.setItem(bmUserKey('bm_level'), String(parseInt(id, 10)));
		localStorage.setItem(bmUserKey('bm_deal'), v);
	}
	bmPick = { target: id, step: '', at: 0, tries: 0 };
	lobbyLog('Replay: next is Bridge Master ' + id);
}

function bmReplayTarget() {
	var s = bmReplayState();
	return s && s.ids && s.i < s.ids.length ? s.ids[s.i] : '';
}

// Smallest visible element under root whose whole text matches re (the label itself, not a
// container that happens to include it). Our own panel and pill never count.
function bmFindText(root, re) {
	var best = null;
	$(root).find('*:visible').each(function () {
		if (this.closest && this.closest('#brill-settings-panel, #brill-mode-switch, #brill-settings-gear')) return;
		if (!re.test(norm($(this).text()))) return;
		if (!best || $.contains(best, this)) best = this;
	});
	return best;
}

// True while it is working on getting the next replay problem open (lobbyTick then does
// nothing else); false once that problem is on the table, so bridgeMasterTick plays it.
function bmReplayTick() {
	var target = bmReplayTarget();
	if (!target) return false;
	if (onBridgeMaster() && bmProblemId() === target) { bmPick.tries = 0; return false; }
	if (bmPick.target !== target) bmPick = { target: target, step: '', at: 0, tries: 0 };
	if (Date.now() - bmPick.at < 2500) return true;
	bmPick.at = Date.now();
	if (++bmPick.tries > 40) {
		lobbyLog('Replay: could not open ' + target + ' - stopping. Buttons: ' + visibleButtonLabels());
		bmReplayStop();
		return false;
	}
	var level = parseInt(target, 10), label = target.split(' ')[1];
	var popup = $('bridge-master-popup:visible', PWD);
	if (popup.length) {
		if (bmPick.step !== 'level') {
			var lv = bmFindText(popup, new RegExp('^Level ?' + level + '(?![0-9])', 'i'));
			if (lv) { lv.click(); bmPick.step = 'level'; return true; }
		}
		var cell = bmFindText(popup, new RegExp('^' + label.replace('-', ' ?- ?') + '$', 'i'));
		if (cell) {
			lobbyLog('Replay: opening ' + target);
			cell.click(); bmPick.step = 'deal';
			return true;
		}
		bmPick.step = '';            // list not there yet, or the level click did not take: again
		return true;
	}
	// At a Bridge Master table on another problem (the one just finished): its "Select deal".
	if (onBridgeMaster()) {
		var sel = bmFindText(PWD.body, /^select deal$/i);
		if (sel) { sel.click(); return true; }
		lobbyLog('Replay: no "Select deal" button on the Bridge Master panel. Buttons: ' + visibleButtonLabels());
		return true;
	}
	// The end-of-problem box ("Contract Failed / Play again / Leave table"): leave.
	var leave = bmFindText(PWD.body, /^leave table$/i);
	if (leave) { leave.click(); return true; }
	// Practice page: open Bridge Master.
	if (pagePath().indexOf(PRACTICE_PATH) === 0) {
		var tile = bmFindText(PWD.body, /^bridge master$/i);
		if (tile) { tile.click(); return true; }
		lobbyLog('Replay: open Bridge Master to continue with ' + target);
		return true;
	}
	if (!atTable()) bmGoPractice('Replay');
	return true;
}

// The value BBO keeps in <user>_bm_deal for a problem: as recorded when it was played, else
// built from the learned handid in the same shape as a recorded one (a recorded "2/x.a18" for
// handid "x.a18" teaches the "<prefix>" to put in front).
function bmDealValueFor(id) {
	var all = bmLoadResults();
	if (all[id] && all[id].key) return all[id].key;
	var keys = bmLoadJson(BM_KEYS_KEY), h = keys[id];
	if (!h) return '';
	for (var other in all) {
		var k = all[other].key, oh = keys[other];
		if (k && oh && k.slice(-oh.length) === oh) {
			var prefix = k.slice(0, k.length - oh.length);
			return /^\d+\//.test(prefix) ? parseInt(id, 10) + '/' + h : prefix + h;
		}
	}
	return h;
}

function bmReplayAdvance(doneId) {
	var s = bmReplayState();
	if (!s) return;
	s.i++;
	localStorage.setItem(BM_REPLAY_KEY, JSON.stringify(s));
	if (s.i >= s.ids.length) {
		var all = bmLoadResults(), made = s.ids.filter(function (id) { return all[id] && all[id].last === 'made'; });
		lobbyLog('Replay done: ' + made.length + ' of ' + s.ids.length + ' made' +
			(made.length ? ' (' + made.join(', ') + ')' : ''));
		bmReplayStop();
		setBrillMode('off');
		return;
	}
	lobbyLog('Replay: ' + doneId + ' done, ' + (s.ids.length - s.i) + ' to go');
	bmReplayOpen(s.ids[s.i]);
}

// ---- statistics ---------------------------------------------------------------
function bmCsv() {
	var all = bmLoadResults();
	var cols = ['id', 'level', 'first', 'last', 'attempts', 'contract', 'server', 'at', 'ctx', 'played'];
	var esc = function (v) { v = v == null ? '' : String(v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
	return [cols.join(',')].concat(Object.keys(all).sort(function (a, b) { return bmSerial(a) - bmSerial(b); })
		.map(function (id) { var r = all[id]; r.id = id; return cols.map(function (c) { return esc(r[c]); }).join(','); }))
		.join('\n');
}

function bmDownload(name, text, type) {
	var a = document.createElement('a');
	a.href = URL.createObjectURL(new Blob([text], { type: type }));
	a.download = name;
	document.body.appendChild(a); a.click(); a.remove();
}

// ---------------------------------------------------------------- settings panel
//
// The gear left of the mode switch. Engine server (any Seat Robot API engine), Bridge Master
// statistics, Replay failed, and the reset of BBO's stars.
var SERVER_PRESETS = [
	{ v: '', label: 'Brill (brillservice.aalborgdata.dk)' },
	{ v: 'localssl', label: 'Brill, this PC (https://localhost:7200)' },
	{ v: 'local', label: 'Brill, this PC (http://localhost:5200)' },
	{ v: 'ben', label: 'BEN, this PC (http://localhost:8085)' },
	{ v: 'custom', label: 'Other Seat Robot API server...' }
];

function ensureSettingsButton() {
	if (localStorage.getItem('BRILL_HIDE_SWITCH') === '1') return;
	if (!document.body || document.getElementById('brill-settings-gear')) return;
	var g = document.createElement('div');
	g.id = 'brill-settings-gear';
	g.textContent = '⚙';
	g.title = 'Brill settings: server, Bridge Master statistics, replay, reset';
	g.style.cssText = 'position:fixed;right:8px;bottom:8px;z-index:2147483000;width:24px;height:24px;' +
		'border-radius:12px;background:#444;color:#fff;font:16px/24px sans-serif;text-align:center;' +
		'cursor:pointer;user-select:none;box-shadow:0 1px 4px rgba(0,0,0,.4);opacity:.9';
	g.addEventListener('click', toggleSettingsPanel);
	document.body.appendChild(g);
}

function toggleSettingsPanel() {
	var p = document.getElementById('brill-settings-panel');
	if (p) { p.remove(); return; }
	p = document.createElement('div');
	p.id = 'brill-settings-panel';
	p.style.cssText = 'position:fixed;right:8px;bottom:40px;z-index:2147483001;width:340px;max-height:80vh;' +
		'overflow:auto;padding:12px;border-radius:8px;background:#fff;color:#222;font:13px/1.4 sans-serif;' +
		'box-shadow:0 2px 12px rgba(0,0,0,.35)';
	document.body.appendChild(p);
	renderSettingsPanel(p);
}

function renderSettingsPanel(p) {
	var cur = localStorage.getItem('BRILL_SERVER') || '';
	var preset = SERVER_PRESETS.some(function (x) { return x.v === cur && x.v !== 'custom'; }) ? cur : 'custom';
	var extras = localStorage.getItem('BRILL_SERVER_EXTRAS') || '';
	var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
	var sum = bmSummary(), levels = Object.keys(sum).sort();
	var rows = levels.map(function (L) {
		var s = sum[L];
		return '<tr><td>' + L + '</td><td>' + s.played + '</td><td>' + s.made + '</td><td>' + s.failed +
			'</td><td>' + (s.played ? Math.round(100 * s.made / s.played) + '%' : '') +
			'</td><td>' + (s.played ? Math.round(100 * s.lastMade / s.played) + '%' : '') + '</td></tr>';
	}).join('');
	var rep = bmReplayState();
	var btn = 'style="margin:2px 4px 2px 0;padding:2px 8px;cursor:pointer"';
	p.innerHTML =
		'<div style="font-weight:600;margin-bottom:6px">Engine server</div>' +
		'<select id="bs-preset" style="width:100%">' + SERVER_PRESETS.map(function (x) {
			return '<option value="' + x.v + '"' + (x.v === preset ? ' selected' : '') + '>' + esc(x.label) + '</option>';
		}).join('') + '</select>' +
		'<input id="bs-url" placeholder="https://host:port" style="width:100%;box-sizing:border-box;margin-top:4px" value="' +
		esc(preset === 'custom' ? cur : '') + '">' +
		'<input id="bs-token" type="password" placeholder="Bearer token (optional)" style="width:100%;box-sizing:border-box;margin-top:4px" value="' +
		esc(localStorage.getItem('BRILL_SERVER_TOKEN') || '') + '">' +
		'<div style="margin-top:4px">Brill extras (claim check, PBN saving): <select id="bs-extras">' +
		'<option value=""' + (extras === '' ? ' selected' : '') + '>auto</option>' +
		'<option value="1"' + (extras === '1' ? ' selected' : '') + '>on</option>' +
		'<option value="0"' + (extras === '0' ? ' selected' : '') + '>off</option></select></div>' +
		'<div style="margin-top:6px"><button id="bs-save" ' + btn + '>Save</button><button id="bs-test" ' + btn + '>Test</button>' +
		'<span id="bs-msg" style="color:#555"></span></div>' +
		'<div style="font-size:11px;color:#666">Now: ' + esc(bmServerName()) + '</div>' +
		'<hr style="margin:10px 0">' +
		'<div style="font-weight:600;margin-bottom:4px">Bridge Master (first attempts; Latest = after replays)</div>' +
		(rows ? '<table style="width:100%;border-collapse:collapse;text-align:right"><tr><th style="text-align:right">Level</th>' +
			'<th style="text-align:right">Played</th><th style="text-align:right">Made</th><th style="text-align:right">Failed</th>' +
			'<th style="text-align:right">%</th><th style="text-align:right">Latest</th></tr>' + rows + '</table>' : '<div style="color:#666">Nothing recorded yet.</div>') +
		'<div style="margin-top:6px"><button id="bs-csv" ' + btn + '>Export CSV</button><button id="bs-json" ' + btn + '>Export JSON</button>' +
			'<button id="bs-sol" ' + btn + '>Solutions (<span id="bs-nsol">' + Object.keys(bmLoadJson(BM_SOLUTIONS_KEY)).length + '</span>)</button></div>' +
		'<div><button id="bs-fetchsol" ' + btn + '>Fetch solutions of failed problems</button></div>' +
		'<div style="font-size:11px;color:#666"><span id="bs-nkeys">' + Object.keys(bmLoadJson(BM_KEYS_KEY)).length + '</span> problem keys known</div>' +
		'<div style="margin-top:6px">Replay failed: <select id="bs-rlevel"><option value="">all levels</option>' +
		levels.map(function (L) { return '<option value="' + L + '">level ' + L + '</option>'; }).join('') + '</select> ' +
		'<select id="bs-rwhich"><option value="first">failed first time</option><option value="last">still failing</option></select></div>' +
		'<div><button id="bs-replay" ' + btn + '>Start replay</button>' +
		(rep ? '<button id="bs-rstop" ' + btn + '>Stop replay (' + Math.min(rep.i + 1, rep.ids.length) + '/' + rep.ids.length + ')</button>' : '') + '</div>' +
		'<hr style="margin:10px 0">' +
		'<div style="font-weight:600;margin-bottom:4px">Reset</div>' +
		'<label><input id="bs-alsoours" type="checkbox" checked> also clear the record above</label><br>' +
		'<button id="bs-reset" ' + btn + '>Reset BBO\'s Bridge Master stars</button>' +
		'<div id="bs-rmsg" style="color:#a00"></div>';

	var $id = function (x) { return p.querySelector('#' + x); };
	var showUrl = function () { $id('bs-url').style.display = $id('bs-preset').value === 'custom' ? '' : 'none'; };
	$id('bs-preset').addEventListener('change', showUrl); showUrl();
	$id('bs-save').addEventListener('click', function () {
		var v = $id('bs-preset').value;
		if (v === 'custom') {
			v = $id('bs-url').value.trim();
			if (!/^https?:\/\//i.test(v)) { $id('bs-msg').textContent = ' URL must start with http(s)://'; return; }
		}
		if (v) localStorage.setItem('BRILL_SERVER', v); else localStorage.removeItem('BRILL_SERVER');
		var t = $id('bs-token').value.trim();
		if (t) localStorage.setItem('BRILL_SERVER_TOKEN', t); else localStorage.removeItem('BRILL_SERVER_TOKEN');
		var x = $id('bs-extras').value;
		if (x) localStorage.setItem('BRILL_SERVER_EXTRAS', x); else localStorage.removeItem('BRILL_SERVER_EXTRAS');
		lobbyLog('server: ' + bmServerName() + (typeof brillServerHasExtras === 'function' && brillServerHasExtras() ? ' (Brill extras on)' : ' (Seat Robot API only)'));
		renderSettingsPanel(p);
		p.querySelector('#bs-msg').textContent = ' saved';
	});
	$id('bs-test').addEventListener('click', function () {
		var m = $id('bs-msg'); m.textContent = ' testing...';
		var t0 = Date.now();
		fetch(getBrillBaseUrl() + '/', typeof brillFetchOptions === 'function' ? brillFetchOptions() : { cache: 'no-store' })
			.then(function (r) { m.textContent = ' ' + r.status + ' in ' + (Date.now() - t0) + ' ms'; })
			.catch(function (e) { m.textContent = ' failed: ' + e.message + ' (down, or no CORS header?)'; });
	});
	$id('bs-csv').addEventListener('click', function () {
		bmDownload('bridge-master-results-' + new Date().toISOString().slice(0, 10) + '.csv', bmCsv(), 'text/csv');
	});
	$id('bs-json').addEventListener('click', function () {
		bmDownload('bridge-master-results-' + new Date().toISOString().slice(0, 10) + '.json',
			JSON.stringify(bmLoadResults(), null, 1), 'application/json');
	});
	$id('bs-sol').addEventListener('click', function () {
		var keys = bmLoadJson(BM_KEYS_KEY), sol = bmLoadJson(BM_SOLUTIONS_KEY), out = {};
		Object.keys(sol).forEach(function (h) { out[bmIdForKey(h) || h] = { handid: h, lin: sol[h] }; });
		bmDownload('bridge-master-solutions-' + new Date().toISOString().slice(0, 10) + '.json',
			JSON.stringify({ keys: keys, solutions: out }, null, 1), 'application/json');
	});
	$id('bs-fetchsol').addEventListener('click', function () {
		var m = $id('bs-rmsg'); m.textContent = 'fetching solutions...';
		bmFetchSolutions(bmFailedIds('', 'first'), function (r) { m.textContent = 'Solutions: ' + r; bmUpdatePanelCounts(); });
	});
	$id('bs-replay').addEventListener('click', function () {
		var r = bmReplayStart($id('bs-rlevel').value, $id('bs-rwhich').value);
		renderSettingsPanel(p);                       // so the Stop replay button appears now
		p.querySelector('#bs-rmsg').textContent = r;
	});
	if ($id('bs-rstop')) $id('bs-rstop').addEventListener('click', function () {
		bmReplayStop(); lobbyLog('Replay stopped'); renderSettingsPanel(p);
	});
	$id('bs-reset').addEventListener('click', function () {
		if (!confirm('Clear all of BBO\'s Bridge Master stars and crosses for ' + (whoAmI() || 'this user') +
			'? This cannot be undone, and the page reloads.')) return;
		bmResetBbo($id('bs-alsoours').checked, function (err) { $id('bs-rmsg').textContent = err; });
	});
}

// ---------------------------------------------------------------- mode switch
//
// One switch for what the driver does when it is free to choose:
//   off       nothing (Brill still plays any table you sit it at)
//   tourneys  "Dailies": robot challenges and allowlisted daylongs - the old autoplay
//   bm        Bridge Master: stay there, Next deal after each problem
// Stored in localStorage.BRILL_MODE. BRILL_CHALLENGE_AUTOPLAY is kept in step, so a script
// with no BRILL_MODE yet starts in whatever the old flag said.
var MODES = ['off', 'tourneys', 'bm'];
var MODE_LABEL = { off: 'Off', tourneys: 'Dailies', bm: 'Bridge Master' };
var PRACTICE_PATH = '/v3/app/lv/practice';
var bmGoAt = 0;
var bmPickHinted = false;

function brillMode() {
	var m = localStorage.getItem('BRILL_MODE');
	if (MODES.indexOf(m) >= 0) return m;
	return localStorage.getItem('BRILL_CHALLENGE_AUTOPLAY') === '1' ? 'tourneys' : 'off';
}

function setBrillMode(m) {
	if (MODES.indexOf(m) < 0) return brillMode();
	localStorage.setItem('BRILL_MODE', m);
	if (m === 'tourneys') localStorage.setItem('BRILL_CHALLENGE_AUTOPLAY', '1');
	else localStorage.removeItem('BRILL_CHALLENGE_AUTOPLAY');
	bmGoAt = 0; bmPickHinted = false; lastLobbyLog = ''; idleOffListSince = 0;
	lobbyLog('mode: ' + MODE_LABEL[m] + (m === 'tourneys' && onBridgeMaster() ?
		' - leaving Bridge Master after this problem' : ''));
	updateModeButton();
	return m;
}

function lobbyButton() {
	return $('button:visible, [role="button"]:visible', PWD).filter(function () {
		return /lobby/i.test(norm($(this).text()));
	}).first();
}

// Where to pick up: the highest problem played on the highest level reached.
function bmLastPlayed() {
	var all = bmLoadResults(), best = '';
	Object.keys(all).forEach(function (id) { if (!best || bmSerial(id) > bmSerial(best)) best = id; });
	return best;
}

// Bridge Master mode, away from a table. Get to the practice page (never leaving a table to
// do it - a challenge in progress finishes first), then say what to pick: which deal to open
// is a choice BBO's Select deal dialog makes, and that dialog has not been mapped.
// Getting to Practice is done by clicking BBO's own Practice link, never by changing the
// address (gotoPath). On 2026-11-09 a pushState to /v3/app/lv/practice made BBO log in again
// ("User is not connected /app/lv/practice", then sc_loginok on a new proxy), the new login
// dropped the old connection, the table vanished, and 30 s later the script navigated again:
// a disconnect every ~30 s. With no Practice link on screen it says so once and waits.
var bmPracticeHinted = false;
function bmGoPractice(why) {
	if (Date.now() - bmGoAt < 30000) return;
	bmGoAt = Date.now();
	var link = bmFindText(PWD.body, /^practice$/i);
	if (link) { lobbyLog(why + ' - clicking Practice'); link.click(); return; }
	if (!bmPracticeHinted) {
		bmPracticeHinted = true;
		lobbyLog(why + ' - open Practice > Bridge Master (no Practice link on screen to click)');
	}
}

function bmModeIdle() {
	if (pagePath().indexOf(PRACTICE_PATH) !== 0) {
		bmGoPractice('mode Bridge Master');
		return;
	}
	bmPracticeHinted = false;
	if (!bmPickHinted) {
		bmPickHinted = true;
		var rs = bmReplayState();
		if (rs && rs.i < rs.ids.length) {
			lobbyLog('Replay ' + (rs.i + 1) + '/' + rs.ids.length + ': open Bridge Master - ' + rs.ids[rs.i] +
				' should be the selected deal; from there it carries on by itself');
			return;
		}
		var last = bmLastPlayed();
		lobbyLog('mode Bridge Master - open Bridge Master and pick a deal' +
			(last ? ' (last played: ' + last + ')' : '') + '; from there it carries on by itself');
	}
}

// The on-page switch: a small pill bottom-right. Click cycles Off -> Dailies -> Bridge Master.
function modeButtonText() {
	var m = brillMode(), t = 'Brill: ' + MODE_LABEL[m];
	if (m === 'bm') {
		var id = onBridgeMaster() ? bmProblemId() : '';
		var s = bmSummary()[id ? parseInt(id, 10) : parseInt(bmLastPlayed(), 10)];
		if (s) t += '  ' + s.made + '/' + s.played;
	}
	return t;
}

var MODE_COLORS = { off: '#666', tourneys: '#1b7f3b', bm: '#2f52b8' };

function updateModeButton() {
	var b = document.getElementById('brill-mode-switch');
	if (!b) return;
	var m = brillMode(), t = modeButtonText();
	if (b.textContent !== t) b.textContent = t;
	b.style.background = MODE_COLORS[m];
}

function ensureModeButton() {
	if (localStorage.getItem('BRILL_HIDE_SWITCH') === '1') return;
	if (!document.body || document.getElementById('brill-mode-switch')) { updateModeButton(); return; }
	var b = document.createElement('div');
	b.id = 'brill-mode-switch';
	b.title = 'Click to switch: Off -> Dailies (challenges + daylongs) -> Bridge Master';
	b.style.cssText = 'position:fixed;right:38px;bottom:8px;z-index:2147483000;padding:4px 10px;' +
		'border-radius:12px;color:#fff;font:600 13px/1.4 sans-serif;cursor:pointer;user-select:none;' +
		'box-shadow:0 1px 4px rgba(0,0,0,.4);opacity:.9';
	b.addEventListener('click', function () {
		var m = brillMode();
		setBrillMode(MODES[(MODES.indexOf(m) + 1) % MODES.length]);
	});
	document.body.appendChild(b);
	updateModeButton();
}

function lobbyTick() {
	ensureObserver();
	if (!scriptList.length && BRILL_SCRIPTS.length) setScriptList();   // backstop
	try { ensureModeButton(); ensureSettingsButton(); } catch (e) { }
	if (lobbyBusy) return;
	if (bmReplayTick()) return;
	if (bmEndBoxTick()) return;
	if (atTable()) {
		if (onBridgeMaster()) { bridgeMasterTick(); idleOffListSince = 0; return; }
		// PlayWithBrill's hooks own the table from here; the only thing left to do is put
		// the History pane up so the boards played are visible while it works.
		showHistoryPane();
		// We got in, so the last daily clicked was not a finished one.
		if (lastDaylongTid) { daylongMisses[lastDaylongTid] = 0; lastDaylongTid = null; }
		idleOffListSince = 0;
		return;
	}
	if (brillMode() === 'bm') { bmModeIdle(); return; }
	historyPaneShown = false;          // back in the lobby - arm it for the next match
	if (onChallengeList()) {
		challengeListPath = pagePath();
		// Belt and braces for tlistLoaded: an empty list might come back without a <tlist>
		// at all, and a few seconds on the screen is as much as the page will ever tell us.
		if (!challengeListSince) challengeListSince = Date.now();
		else if (Date.now() - challengeListSince > 5000) tlistLoaded = true;
	} else {
		challengeListSince = 0;
	}

	// A new screen gets ARRIVAL_GRACE_MS to show its dailies before a challenge may take us
	// away from it. Without this, opening the tournament list lost to a challenge within a
	// tick or two: the scan result was cached from the previous screen (empty), and the rows
	// themselves render a moment after the URL changes.
	var path = pagePath();
	if (path !== arrival.path) {
		arrival = { path: path, at: Date.now() };
		domScan.at = 0;
	}
	var settling = autoPlay() && !onChallengeList() && !onTournamentDetails() &&
		daylongPatterns().length > 0 && Date.now() - arrival.at < ARRIVAL_GRACE_MS;
	if (settling) domScan.at = 0;      // rescan every tick until the grace is over

	// A daily's "Play now" lands on the tournament page, not at a table. Without this the
	// driver sits there reporting "nothing to play" while PLAY waits on screen. A finished
	// one ('leave') falls through to the rest of the tick, which moves us on.
	if (onTournamentDetails()) {
		if (playFromDetails() !== 'leave') return;
	} else {
		detailsNoPlaySince = 0;
		detailsGaveUp = null;
	}

	// Chicken-and-egg: we learn about challenges from the page's own ard.php responses, but
	// the page only fetches ard.php on the Challenges screen. Starting on the lobby home we
	// therefore have no data, conclude there is nothing to play, and never navigate - so we
	// never get data. Seed ourselves by going to the challenge list once.
	// Only in autoplay mode: report-only must stay passive and not move the user's screen.
	// Dailies already on screen are played first; the seeding can wait until they are done.
	if (autoPlay() && !tlistLoaded && !settling && !daylongDomTodo().length) {
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
	var dailies = daylongTodo().concat(daylongDomTodo());

	// One line, and it has to answer "why is nothing happening?" without a follow-up
	// question: what is playable, what the human opt-in held back, and what the tournament
	// allowlist did or did not match.
	var parts = [];
	if (todo.length) {
		parts.push(todo.map(function (c) {
			return (c.robot ? '' : 'vs ' + c.opponent + ' ') + c.tid.slice(0, 8) +
				' us ' + c.done + '/' + c.total + ', them ' + c.theirDone + '/' + c.total;
		}).join(', '));
	}
	if (dailies.length) {
		parts.push('dailies: ' + dailies.map(function (c) {
			return '"' + c.title + '"' +
				(c.done === null ? ' (progress unknown)' : ' ' + c.done + '/' + c.total);
		}).join(', '));
	}
	if (!parts.length) {
		var held = humanHeldBack();
		var rows = tourneyRows();
		var tourneys = rows.length;
		var skipped = [];
		for (var i = 0; i < rows.length; i++) {
			var reason = daylongSkipReason(rows[i]);
			// A daily we entered a moment ago is on cooldown, not missing: without this the
			// line would read "nothing to play" while it is in fact waiting on purpose.
			if (!reason && lobbyCooldown[rows[i].tid] && Date.now() < lobbyCooldown[rows[i].tid] &&
				matchesDaylong(rows[i])) reason = 'cooling down';
			if (reason) skipped.push('"' + (rows[i].title || rows[i].tid) + '" (' + reason + ')');
		}
		var why = [];
		if (held) {
			why.push(held + ' human challenge(s) available but not enabled; ' +
				'__brillChallenge.allowHuman(true) to include them');
		}
		if (!tourneys && daylongPatterns().length) {
			why.push('no tournament rows seen yet - open the tournament list once so the page ' +
				'fetches it (any response carrying a <tlist> is harvested, whatever the URL), ' +
				'then check __brillChallenge.tourneys() and .sources()');
		}
		if (skipped.length) why.push('allowlisted but skipped: ' + skipped.join(', '));
		var cooling = domScan.rows.filter(function (r) {
			return lobbyCooldown[r.tid] && Date.now() < lobbyCooldown[r.tid];
		});
		if (cooling.length) {
			why.push('on screen but cooling down: ' + cooling.map(function (r) {
				return '"' + r.title + '"';
			}).join(', '));
		}
		if (tourneys && !skipped.length) {
			why.push(tourneys + ' tournament(s) listed, none matching ' +
				JSON.stringify(daylongPatterns()) + '; __brillChallenge.tourneys() to see them');
		}
		parts.push('nothing to play' + (why.length ? ' - ' + why.join('; ') : ''));
	}
	var msg = parts.join(' | ');
	if (msg !== lastLobbyLog) { lobbyLog(msg + (autoPlay() ? '' : '  (autoplay off)')); lastLobbyLog = msg; }
	if (!autoPlay()) return;

	// A daily whose row is on screen right now goes first: it is one click away, and leaving
	// the list for a challenge meant never getting back to it. That was the failure: every
	// time the tournament list came up, a challenge the feed still called unfinished pulled
	// the screen back to Challenges within a tick. The challenge is still there afterwards.
	//
	// Otherwise challenges first - someone (or some robot) is waiting on the other side of
	// one, while a daylong is only waiting on the clock.
	var here = dailies.filter(function (c) { return c.dom; });
	if (here.length) { idleOffListSince = 0; enterDaylong(here[0]); return; }
	if (settling) return;              // give the screen its moment before leaving it
	if (todo.length) { idleOffListSince = 0; enterChallenge(todo[0]); return; }
	if (dailies.length) { idleOffListSince = 0; enterDaylong(dailies[0]); return; }
	idleRoam();
}

function enterChallenge(target) {
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
		// BBO removes the row the moment the match is over - which is when the OPPONENT plays
		// their last board if they finish second, not when we do - while the tlist can go on
		// reporting it RUNNING with our side at 0/12 indefinitely. Confirmed against History ->
		// Recent tournaments, which lists exactly those challenges scored and ranked.
		//
		// So "we are on the list and the row is not there" is the authoritative signal, and a
		// 60s cooldown was the wrong response: it re-reported a finished challenge every minute
		// for as long as the tab stayed open. Two consecutive misses - the list may still be
		// rendering on the first - and it is out for the session.
		challengeMisses[target.tid] = (challengeMisses[target.tid] || 0) + 1;
		if (challengeMisses[target.tid] >= 2) {
			challengeGone[target.tid] = true;
			lobbyLog(describe(target) + ' has no row on the challenge list - it is finished ' +
				'(BBO removes the row; see History -> Recent tournaments). Ignoring it.');
			lobbyCooldown[target.tid] = Date.now() + LOBBY.cooldown;
		} else {
			// Look again in a few seconds, while we are still on the list. A full minute here
			// meant leaving, coming back, and yanking the screen to Challenges a second time
			// just to confirm what the first look already showed.
			lobbyLog('no row on screen yet for ' + describe(target) + ' - looking again');
			lobbyCooldown[target.tid] = Date.now() + LOBBY.settle * 2;
		}
		lobbyBusy = false;
		return;
	}
	challengeMisses[target.tid] = 0;
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
	//
	// The cooldown doubles each time it stalls again at the same count (1, 2, 4, 8, 15 min).
	// A flat minute made a lagging challenge the thing that pulled the screen back to
	// Challenges every time a daily was in reach.
	var prev = lobbyEntered[target.tid];
	if (prev && prev.done === target.done && (Date.now() - prev.at) > LOBBY.stallMs) {
		var st = challengeStalls[target.tid];
		st = challengeStalls[target.tid] =
			{ n: (st && st.done === target.done ? st.n : 0) + 1, done: target.done };
		var wait = Math.min(LOBBY.cooldown * Math.pow(2, st.n - 1), LOBBY.stallMaxMs);
		lobbyLog('challenge ' + target.tid.slice(0, 8) + ' stalled at ' + target.done + '/' +
			target.total + ' - leaving it ' + Math.round(wait / 60000) + ' min');
		lobbyCooldown[target.tid] = Date.now() + wait;
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

// Entering a daily is the same three steps as a challenge - reach the list, click the row,
// press the button in the panel - but with an unverified selector at each one, so every step
// says what it did and anything unclear ends in a cooldown rather than a retry loop. The
// tournament is still there in a minute; a driver clicking blindly at 2Hz is not recoverable.
// Enter a daily straight from its row on screen.
//
// The row carries its own "Play now", so there is no nav step and no modal: the whole
// three-click chain below collapses to one click. What it does need is the finished-daily
// guard - see daylongMisses.
function enterDaylongRow(target, label) {
	var misses = daylongMisses[target.tid] || 0;
	if (misses >= DAYLONG_MAX_MISSES) {
		lobbyLog(label + ' looks finished - ' + misses + ' entries never reached a table; ' +
			'leaving it for an hour');
		lobbyCooldown[target.tid] = Date.now() + DAYLONG_DONE_COOLDOWN;
		daylongMisses[target.tid] = 0;
		lobbyBusy = false;
		return;
	}

	var link = target.playNow;
	if (!link || !link.length || !PWD.body.contains(link[0])) {
		// The list re-rendered between the scan and the click. Nothing is wrong - drop the
		// stale scan and pick the row up again on the next tick.
		domScan.at = 0;
		lobbyBusy = false;
		return;
	}

	lobbyLog('entering ' + label + ' - clicking its "Play now"' +
		(misses ? ' (attempt ' + (misses + 1) + ')' : ''));
	daylongMisses[target.tid] = misses + 1;
	lastDaylongTid = target.tid;
	(link.closest('button, a, [role="button"]')[0] || link[0]).click();
	domScan.at = 0;
	lobbyCooldown[target.tid] = Date.now() + LOBBY.cooldown;
	setTimeout(function () { lobbyBusy = false; }, LOBBY.settle * 3);
}

function enterDaylong(target) {
	lobbyBusy = true;
	var label = '"' + target.title + '"' + (target.host ? ' by ' + target.host : '');

	// A row we found on screen carries its own entry link, so click that and skip the
	// nav/row/modal chain below - which stays for the (still uncaptured) case of a daily
	// arriving in the tlist instead.
	if (target.dom) { enterDaylongRow(target, label); return; }

	var panel = daylongPanel();
	if (panel.length) {
		// ...but only when the open panel is actually about THIS tournament. Every modal on
		// the site matches the selectors above - an announcement, a leftover challenge panel -
		// and pressing "Play" in one of those is not what was asked for. Naming the entry
		// button explicitly counts as saying you know which panel it is.
		var want = (target.pattern || String(target.title || '')).toLowerCase();
		var mine = panel.text().replace(/\s+/g, ' ').toLowerCase().indexOf(want) !== -1 ||
			!!localStorage.getItem('BRILL_DAYLONG_ENTER_LABEL');
		if (!mine) {
			lobbyLog('a panel is open that does not mention ' + label +
				' - clicking nothing in it; trying again in a minute');
			lobbyCooldown[target.tid] = Date.now() + LOBBY.cooldown;
			lobbyBusy = false;
			return;
		}

		var enter = daylongEnterButton(panel);
		if (enter && enter.el) {
			lobbyLog('entering ' + label + ' - clicking ' + enter.how);
			enter.el[0].click();
			// One attempt per minute, whatever happens next. Progress may be unreadable
			// (see daylongProgress), so a silently failed entry would otherwise loop; and
			// if it worked we are at a table, where the tick returns early anyway.
			lobbyCooldown[target.tid] = Date.now() + LOBBY.cooldown;
			setTimeout(function () { lobbyBusy = false; }, LOBBY.settle * 3);
			return;
		}
		if (enter && enter.choices) {
			lobbyLog('the open panel has ' + enter.choices.length + ' buttons and none reads ' +
				'like an entry button: ' + JSON.stringify(enter.choices) +
				' - set localStorage.BRILL_DAYLONG_ENTER_LABEL to the right one');
			lobbyCooldown[target.tid] = Date.now() + LOBBY.cooldown;
			lobbyBusy = false;
			return;
		}
	}

	var row = daylongRow(target);
	if (row.length) {
		lobbyLog('opening ' + label +
			(target.field ? ' (' + target.done + '/' + target.total + ' from ' + target.field + ')'
				: ' (progress unknown)'));
		row[0].click();
		setTimeout(function () { lobbyBusy = false; }, LOBBY.settle);
		return;
	}

	var nav = daylongNavButton();
	if (nav.length) {
		lobbyLog('looking for ' + label + ' - opening "' +
			nav.text().replace(/\s+/g, ' ').trim() + '"');
		nav[0].click();
		setTimeout(function () { lobbyBusy = false; }, LOBBY.settle);
		return;
	}

	lobbyLog('cannot reach ' + label + ': no row for it on screen and no tournament nav ' +
		'button matched (icons ' + JSON.stringify(DAYLONG_ICONS) + '). Open the tournament ' +
		'list by hand once, or set localStorage.BRILL_TOURNAMENTS_LABEL - backing off');
	lobbyCooldown[target.tid] = Date.now() + LOBBY.cooldown;
	lobbyBusy = false;
}


setInterval(lobbyTick, LOBBY.poll);

// Console handle, mirroring CuebidsWithBrill's __brill.
window.__brillChallenge = {
	tlist: function () { return tlist; },
	todo: function () { return robotChallenges(); },

	// The daylong side of the same picture: what is enterable now, every tournament row we
	// have seen (matched or not - this is the dump to read when a daily you can see on
	// screen is not being played), and the allowlist itself.
	dailies: function () { return daylongTodo(); },
	tourneys: function () { return tourneyRows(); },
	sources: function () { return Object.keys(tlistSources); },

	// The dailies as the DOM scanner currently sees them, allowlist applied. Empty while a
	// screen other than the tournament list is up - this reads the page, not a feed.
	onScreen: function () {
		domScan.at = 0;
		return scanDaylongRows().map(function (r) { return r.title; });
	},
	daylongs: function (list) {
		if (list === undefined) return daylongPatterns();
		if (list === 'default') localStorage.removeItem('BRILL_DAYLONGS');
		else if (!list) localStorage.setItem('BRILL_DAYLONGS', '');
		else localStorage.setItem('BRILL_DAYLONGS',
			(Object.prototype.toString.call(list) === '[object Array]' ? list : [list]).join(','));
		return daylongPatterns();
	},

	// Which button did the tournament matcher find? null is the first thing to check when
	// the driver says it cannot reach the tournament list.
	// Navigate to the tournament list. Read-only in the same sense as openList(): it moves
	// the screen, it enters nothing. The driver never calls this by itself - the nav button
	// is a guess, and moving someone's screen on a guess is worse than doing nothing.
	openTourneys: function () {
		var b = daylongNavButton();
		if (!b.length) return 'tournament nav button NOT FOUND';
		b[0].click();
		return 'clicked: ' + norm(b.text());
	},
	tourneyNav: function () {
		var b = daylongNavButton();
		return b.length ? b.text().replace(/\s+/g, ' ').trim() : null;
	},

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
		setBrillMode(on ? 'tourneys' : 'off');
		return autoPlay();
	},
	// 'off' | 'tourneys' (Dailies) | 'bm' (Bridge Master); no argument = current mode.
	mode: function (m) {
		if (m === undefined) return brillMode();
		if (m === 'dailies') m = 'tourneys';
		if (m === 'bridgemaster' || m === 'bridge master') m = 'bm';
		return setBrillMode(m);
	},
	where: function () {
		return { list: onChallengeList(), table: atTable(), details: detailsPanel().length > 0 };
	},
	// Which timer path is live, and what the browser is actually doing with our delays.
	// timerTest() is the one to run BEFORE switching tabs: it reports how late it fired.
	timers: function () {
		return { mode: timerMode, pending: Object.keys(timerCallbacks).length, hidden: !!PWD.hidden };
	},
	timerTest: function (ms) {
		var want = ms || 5000, t0 = Date.now();
		setTimeout(function () {
			lobbyLog('timer test: asked for ' + want + 'ms, fired after ' + (Date.now() - t0) +
				'ms (' + timerMode + (PWD.hidden ? ', tab hidden' : ', tab visible') + ')');
		}, want);
		return 'scheduled - switch away from the tab now and watch the console';
	},
	gone: function () { return Object.keys(challengeGone); },

	// Where the driver goes for the dailies (learned the first time the list is on screen),
	// and what it saw there. dailyUrl(null) forgets it; dailyUrl('/v3/...') sets it by hand.
	dailyUrl: function (url) {
		if (url === null) localStorage.removeItem('BRILL_DAYLONG_LIST_URL');
		else if (url !== undefined) localStorage.setItem('BRILL_DAYLONG_LIST_URL', url);
		if (url !== undefined) dailyUrlBroken = false;
		return { url: dailyListUrl(), broken: dailyUrlBroken, known: knownDailies,
			lastLook: lastDailyLook ? new Date(lastDailyLook).toLocaleTimeString() : null };
	},

	reset: function () {
		lobbyCooldown = {}; lobbyEntered = {}; lobbyBusy = false;
		challengeGone = {}; challengeMisses = {}; daylongMisses = {};
		challengeStalls = {}; dailyUrlBroken = false; detailsGaveUp = null;
		lastDailyLook = 0; dailyLookPending = null; idleOffListSince = 0;
		return 'ok';
	}
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
	// Bridge Master: what the synthetic deal number was built from.
	bridgeMaster: function () {
		var id = bmProblemId(), ctx = getContext(), decl = bmDeclarer();
		return { on: onBridgeMaster(), id: id, ctx: ctx, declarer: decl, dealer: bmDealer(ctx, decl),
			dealNumber: getDealNumber(), autoNext: bmAutoNext(), state: bm, next: bmNextButton().length > 0 };
	},
	// Bridge Master score: per-level summary (first attempts), or one level's problems.
	//   __brillDom.bmResults()        {1: {played, made, failed, other, size, failedIds}, ...}
	//   __brillDom.bmResults(1)       table of every level-1 problem played
	bmResults: function (level) {
		if (level == null) {
			var s = bmSummary();
			console.table(Object.keys(s).map(function (L) {
				var x = s[L];
				return { level: +L, played: x.played, of: x.size || '?', made: x.made, failed: x.failed,
					other: x.other, pct: x.played ? Math.round(100 * x.made / x.played) + '%' : '' };
			}));
			return s;
		}
		var all = bmLoadResults();
		var rows = Object.keys(all).filter(function (id) { return all[id].level === +level; })
			.sort(function (a, b) { return bmSerial(a) - bmSerial(b); })
			.map(function (id) { var r = all[id]; return { id: id, first: r.first, last: r.last,
				attempts: r.attempts, contract: r.contract, text: r.text.slice(0, 80) }; });
		console.table(rows);
		return rows;
	},
	// Download everything as JSON (auction, Brill's play and the end text per problem).
	bmExport: function () {
		var a = document.createElement('a');
		a.href = URL.createObjectURL(new Blob([JSON.stringify(bmLoadResults(), null, 1)], { type: 'application/json' }));
		a.download = 'bridge-master-results-' + new Date().toISOString().slice(0, 10) + '.json';
		document.body.appendChild(a); a.click(); a.remove();
	},
	// Fix one result by hand (when the end text was not recognised), or wipe them all.
	bmMark: function (id, result) {
		var all = bmLoadResults();
		if (!all[id]) return 'no record for ' + id;
		all[id].first = all[id].last = result;
		bmSaveResults(all);
		return all[id];
	},
	bmReset: function () { localStorage.removeItem(BM_RESULTS_KEY); return 'cleared'; },
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
