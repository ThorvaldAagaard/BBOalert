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
//   localStorage.BRILL_CHALLENGE_AUTOPLAY = '1'   actually enter challenges (default: off,
//                                                 report only)
//   localStorage.BRILL_ALLOW_HUMAN = '1'          also play PK challenges against people
//                                                 (default: robot challenges only)
//   localStorage.BRILL_DAYLONGS = 'ben & friends, just declare'
//                                                 comma-separated substrings of the daylong
//                                                 tournaments to enter, matched against
//                                                 title and host (default: 'ben & friends';
//                                                 set it to '' to play no tournaments at all)
//   localStorage.BRILL_DAYLONG_ENTER_LABEL        text of the button that enters a
//                                                 tournament, if its panel holds more than one
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
		NativeXHR.prototype.send = function () {
			var xhr = this;
			xhr.addEventListener('load', function () {
				try {
					var rt = xhr.responseType;
					if (rt && rt !== 'text') return;
					harvestFrom(xhr.__brillUrl || '(xhr)', xhr.responseText);
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
				r.clone().text().then(function (body) { harvestFrom(url, body); })
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
	return out;
}

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
// The URL is the reliable signal; the button is matched on an EXACT text of "play", which is
// what separates it from the list's "Play now".
function onTournamentDetails() {
	try {
		return String((PWD.location && PWD.location.href) || '').indexOf('tournament-details') !== -1;
	} catch (e) {
		return false;
	}
}

var DETAILS_PLAY_LABELS = ['play'];

function detailsPlayButton() {
	var override = localStorage.getItem('BRILL_DETAILS_PLAY_LABEL');
	var labels = override ? [override.toLowerCase()] : DETAILS_PLAY_LABELS;
	return $('button:visible', PWD).filter(function () {
		return labels.indexOf(norm($(this).text()).toLowerCase()) !== -1;
	}).first();
}

// Gated on the page itself naming an allowlisted tournament, not on what we clicked a moment
// ago: that also covers you navigating to a daily by hand, and refuses to press PLAY on a
// details page for something the allowlist does not cover.
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
			lobbyLog('details page for "' + pat + '" - clicking PLAY');
			lastLobbyLog = '';
			lobbyBusy = true;
			b[0].click();
			setTimeout(function () { lobbyBusy = false; }, LOBBY.settle * 3);
			return;
		}
		// No PLAY button: either the day's boards are all played, or the entry card has not
		// rendered yet. Both are worth saying once rather than silently sitting here.
		msg = 'details page for "' + pat + '" but no PLAY button - it may be finished; ' +
			'go back to the tournament list to play another';
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

function lobbyTick() {
	ensureObserver();
	if (!scriptList.length && BRILL_SCRIPTS.length) setScriptList();   // backstop
	if (lobbyBusy) return;
	if (atTable()) {
		// PlayWithBrill's hooks own the table from here; the only thing left to do is put
		// the History pane up so the boards played are visible while it works.
		showHistoryPane();
		// We got in, so the last daily clicked was not a finished one.
		if (lastDaylongTid) { daylongMisses[lastDaylongTid] = 0; lastDaylongTid = null; }
		return;
	}
	historyPaneShown = false;          // back in the lobby - arm it for the next match

	// A daily's "Play now" lands on the tournament page, not at a table. Without this the
	// driver sits there reporting "nothing to play" while PLAY waits on screen.
	if (onTournamentDetails()) { playFromDetails(); return; }

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

	// Challenges first: someone (or some robot) is waiting on the other side of one, while a
	// daylong is only waiting on the clock.
	if (todo.length) { enterChallenge(todo[0]); return; }
	if (dailies.length) { enterDaylong(dailies[0]); return; }
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
