// ==UserScript==
// @name         Cuebids with Brill
// @namespace    https://github.com/ThorvaldAagaard/BBOalert
// @version      0.5.0
// @description  Let Brill bid your seat on cuebids.com. Advisory by default; auto-bid is opt-in.
// @match        https://cuebids.com/*
// @grant        none
// @run-at       document-start
// ==/UserScript==
//
// @grant none IS LOAD-BEARING - do not add a @grant back.
// Any @grant makes Tampermonkey run this in a sandbox, where `window` is a wrapper around
// the page's real window. Two things then break silently:
//   1. window.fetch = ... patches the SANDBOX's fetch, so the page's Firestore stream is
//      never seen and no deal is ever captured - the script just sits there doing nothing.
//   2. window.__brill lands on the sandbox, so `__brill` in the devtools console reports
//      "not defined" even though the script is installed, enabled and running.
// With @grant none the script runs in page context, exactly like the injected build this
// was developed against. GM_xmlhttpRequest is then unavailable, which is fine: cuebids.com
// sends no CSP and Brill.Service sends Access-Control-Allow-Origin: *, so a plain fetch
// reaches it (request() already falls back to fetch when GM_xmlhttpRequest is missing).
//
// HOW IT WORKS
// ------------
// Cuebids keeps the whole board in a Firestore document (collection "sessionDeals") that the
// page streams over a WebChannel long-poll. We hook the transport, parse those documents out
// of the stream, and use them as the authoritative game state - far more stable than the DOM.
//
// Measured live: the Firestore SDK uses fetch (fetch=25/listen=11, xhr=0), so the fetch hook
// is the one that actually fires. The XHR hook is kept as a fallback in case the SDK switches
// transport - an XHR-only hook silently captures nothing at all.
//
//   hand           "[Deal \"N:J9.K72.KT532.872 AQT72.T8653..KQ4 ... \"]"   PBN, order N E S W
//   bidding        "-P"          hyphen-joined tokens, seats W N E S, "." = seat before dealer
//   dealer         "W"           vulnerability "NONE" | "NS" | "EW" | "ALL"
//   turn           <uid>         users [uid, uid]      compete 0 = opponents auto-pass
//
// Turn detection deliberately uses the DOM (is the bidding box up?) rather than the uid, so we
// never need to know which account we are. Whose turn it is follows from the auction length:
// non-placeholder token count % 4 indexes into W,N,E,S - and if the box is up, that seat is us.
//
// Actions go through the real UI (clicking the bid buttons), NOT by writing to Firestore or
// calling submitSessionDealBid directly. That keeps every server-side validation, the
// expectedBidding concurrency guard, and the scoring path exactly as the app intends.
//
// SETTINGS: see CFG below, or from the page console:
//   localStorage.BRILL_AUTOBID = '1'      // actually place the bid (default: advise only)
//   localStorage.BRILL_SERVER  = 'local'     // http://localhost:5200
//   localStorage.BRILL_SERVER  = 'localssl'  // https://localhost:7200
//   localStorage.BRILL_SERVER  = '<url>'     // used verbatim

(function () {
	'use strict';

	// Only the top document drives bidding. Without these guards the script installs once per
	// iframe (and once per re-injection), and every copy runs its own poll timer - which means
	// N concurrent Brill requests and N clicks for a single turn.
	if (window.top !== window.self) return;
	if (window.__brillInstalled) return;
	window.__brillInstalled = true;

	var CFG = {
		poll: 800,          // ms between turn checks
		settle: 400         // ms to let the UI settle before clicking
	};

	function baseUrl() {
		// Same BRILL_SERVER key as PlayWithBrill/PlayChallengeWithBrill - keep the accepted
		// values identical, or setting it for one script silently misroutes the other.
		//   'local' -> http://localhost:5200   'localssl' -> https://localhost:7200
		//   any http(s) URL is used verbatim
		var s = localStorage.getItem('BRILL_SERVER');
		if (s && /^https?:\/\//i.test(s)) return s.replace(/\/+$/, '');
		if (s === 'localssl') return 'https://localhost:7200';
		return s === 'local'
			? 'http://localhost:5200'
			: 'https://brillservice.aalborgdata.dk';
	}
	function autoBid() { return localStorage.getItem('BRILL_AUTOBID') === '1'; }
	function log() {
		var a = ['[brill]'].concat([].slice.call(arguments));
		console.log.apply(console, a);
	}

	// Brill.Service sends "Access-Control-Allow-Origin: *", so a plain fetch works from
	// cuebids.com. GM_xmlhttpRequest is still preferred under Tampermonkey (immune to CSP
	// and origin policy changes); the fetch path also lets this file be pasted straight
	// into the page console for testing without installing anything.
	function request(url, cb) {
		if (typeof GM_xmlhttpRequest === 'function') {
			return GM_xmlhttpRequest({
				method: 'GET', url: url, timeout: 30000,
				onload: cb.onload, onerror: cb.onerror, ontimeout: cb.ontimeout
			});
		}
		var done = false;
		var timer = setTimeout(function () {
			if (!done) { done = true; cb.ontimeout(); }
		}, 30000);
		fetch(url, { cache: 'no-store' })
			.then(function (r) { return r.text(); })
			.then(function (t) {
				if (done) return;
				done = true; clearTimeout(timer);
				cb.onload({ responseText: t });
			})
			.catch(function (e) {
				if (done) return;
				done = true; clearTimeout(timer);
				cb.onerror(e);
			});
	}

	// ---------------------------------------------------------------- state capture

	var SEATS = ['W', 'N', 'E', 'S'];      // token index % 4 -> seat (matches the app's $rt)
	var PBN_ORDER = { N: 0, E: 1, S: 2, W: 3 };

	// Every board of the session streams through this listener, so we cannot just keep the
	// most recent document - it may belong to a board we are not looking at. Key by document
	// id and pick the one named in the URL (/session/deal/<id>), or we would happily bid the
	// board on screen using a different board's hand.
	var deals = {};

	function currentDealId() {
		var m = /\/session\/deal\/([^/?#]+)/.exec(location.pathname);
		return m ? m[1] : null;
	}

	function currentDeal() {
		var id = currentDealId();
		return id ? (deals[id] || null) : null;
	}

	// Firestore REST value -> plain JS
	function flat(v) {
		if (!v || typeof v !== 'object') return v;
		if ('stringValue' in v) return v.stringValue;
		if ('integerValue' in v) return parseInt(v.integerValue, 10);
		if ('booleanValue' in v) return v.booleanValue;
		if ('doubleValue' in v) return v.doubleValue;
		if ('nullValue' in v) return null;
		if ('arrayValue' in v) return (v.arrayValue.values || []).map(flat);
		if ('mapValue' in v) {
			var o = {};
			var f = v.mapValue.fields || {};
			for (var k in f) o[k] = flat(f[k]);
			return o;
		}
		return v;
	}

	// Documents can straddle chunk boundaries, so accumulate and only consume what parses.
	var buf = '';

	// The stream is pretty-printed JSON ('"name": "projects/...'), so every structural
	// token needs \s* around it - a tight /\{"name":"projects/ never matches.
	var DOC_RE = /\{\s*"name"\s*:\s*"projects\/[^"]*?\/documents\/sessionDeals\/([^"]+)"/g;

	function harvest(text) {
		if (!text) return;
		buf += text;
		if (buf.length > 2000000) buf = buf.slice(-1000000);   // bound memory on a long session
		if (buf.indexOf('sessionDeals/') === -1) return;

		var consumed = 0, m;
		DOC_RE.lastIndex = 0;
		while ((m = DOC_RE.exec(buf)) !== null) {
			var start = m.index, depth = 0, i = start, closed = false;
			for (; i < buf.length; i++) {
				if (buf[i] === '{') depth++;
				else if (buf[i] === '}') { depth--; if (depth === 0) { closed = true; break; } }
			}
			if (!closed) { consumed = start; break; }   // incomplete - keep it for the next chunk
			var doc = null;
			try { doc = JSON.parse(buf.slice(start, i + 1)); } catch (e) { }
			consumed = i + 1;
			DOC_RE.lastIndex = i + 1;
			if (!doc) continue;
			var fields = doc.fields || {};
			var deal = { id: m[1] };
			for (var k in fields) deal[k] = flat(fields[k]);
			if (!deal.hand) continue;                   // partial update, not a full document
			stats.docs++;
			deals[deal.id] = deal;
			log('deal', deal.id, 'bidding=' + JSON.stringify(deal.bidding),
				'dealer=' + deal.dealer, deal.id === currentDealId() ? '(on screen)' : '');
		}
		if (consumed > 0) buf = buf.slice(consumed);
	}

	var stats = { xhr: 0, xhrListen: 0, fetch: 0, fetchListen: 0, bytes: 0, docs: 0 };

	function isListen(url) {
		return typeof url === 'string' && url.indexOf('/Listen/channel') !== -1;
	}

	var origOpen = XMLHttpRequest.prototype.open;
	var origSend = XMLHttpRequest.prototype.send;
	XMLHttpRequest.prototype.open = function (method, url) {
		stats.xhr++;
		this.__brillWatch = isListen(url);
		if (this.__brillWatch) stats.xhrListen++;
		return origOpen.apply(this, arguments);
	};
	XMLHttpRequest.prototype.send = function () {
		if (this.__brillWatch) {
			var xhr = this, seen = 0;
			var grab = function () {
				try {
					var t = xhr.responseText || '';
					if (t.length > seen) {
						stats.bytes += t.length - seen;
						harvest(t.slice(seen));
						seen = t.length;
					}
				} catch (e) { }
			};
			xhr.addEventListener('progress', grab);
			xhr.addEventListener('load', grab);
		}
		return origSend.apply(this, arguments);
	};

	// The Firestore SDK may use fetch instead of XHR for the WebChannel. Stream the body
	// through a reader rather than response.text() - a long-poll body does not finish
	// promptly, so awaiting the whole thing would deliver the deal far too late.
	var origFetch = window.fetch;
	if (typeof origFetch === 'function') {
		window.fetch = function (input, init) {
			var url = (typeof input === 'string') ? input : (input && input.url) || '';
			stats.fetch++;
			var p = origFetch.apply(this, arguments);
			if (!isListen(url)) return p;
			stats.fetchListen++;
			return p.then(function (res) {
				try {
					var clone = res.clone();
					if (clone.body && clone.body.getReader) {
						var reader = clone.body.getReader();
						var dec = new TextDecoder();
						(function pump() {
							reader.read().then(function (r) {
								if (r.done) return;
								var chunk = dec.decode(r.value, { stream: true });
								stats.bytes += chunk.length;
								harvest(chunk);
								pump();
							}).catch(function () { });
						})();
					}
				} catch (e) { }
				return res;
			});
		};
	}

	// ---------------------------------------------------------------- conversions

	// Bids can carry an embedded alert, e.g.  .-.-.-1C["Better minor\n12+ hcp"]-P
	// The alert text may itself contain "-" ("12-14 hcp"), so it MUST be stripped BEFORE
	// splitting on "-" or the auction silently gains phantom tokens. This mirrors the app's
	// own By()/Ui() pair exactly.
	function stripAlerts(bidding) {
		return (bidding || '').replace(/\[[\s\S]*?\]/g, '');
	}

	// Two different splits, and mixing them up is a real bug source. The app makes the same
	// distinction: Ui() keeps "." placeholders, mu() strips them.
	//
	//   allTokens  keeps "."  -> use for SEAT MATH (a "." occupies a real seat)
	//   tokens     drops "."  -> use for the Brill ctx (which starts at the dealer)
	function allTokens(bidding) {
		return stripAlerts(bidding).match(/[^-]+/g) || [];
	}

	// "-P-1S" -> ["P","1S"]
	function tokens(bidding) {
		return allTokens(bidding).filter(function (t) { return t !== '.'; });
	}

	// Cuebids tokens -> Brill ctx.
	//
	// The stored auction uses "D"/"R" for double/redouble - NOT "X"/"XX". X/XX are only the
	// display form (the app's _2() converts X->D, XX->R on the way in). Observed live:
	//     ".-.-2H[\"Weak, 6+!H\"]-D-3H[\"To play\"]"
	// X/XX are still accepted here in case a different surface ever hands them over.
	function toCtx(bidding) {
		return tokens(bidding).map(function (t) {
			if (t === 'P') return '--';
			if (t === 'D' || t === 'X') return 'Db';
			if (t === 'R' || t === 'XX') return 'Rd';
			return t;
		}).join('');
	}

	function seatToBid(bidding) { return SEATS[allTokens(bidding).length % 4]; }

	// "[Deal \"N:h1 h2 h3 h4\"]" -> hand for one direction, already in Brill's S.H.D.C format
	function handFor(pbn, dir) {
		var all = (pbn || '').match(/[AKQJT2-9]*\.[AKQJT2-9]*\.[AKQJT2-9]*\.[AKQJT2-9]*/g);
		if (!all || all.length < 4) return null;
		return all[PBN_ORDER[dir]];
	}

	function toVul(v) {
		switch ((v || '').toUpperCase()) {
			case 'NS': return 'NS';
			case 'EW': return 'EW';
			case 'ALL': case 'BOTH': return 'All';
			default: return 'None';
		}
	}

	// ---------------------------------------------------------------- UI

	function passButton() {
		return Array.prototype.slice.call(document.querySelectorAll('button')).find(function (b) {
			return (b.textContent || '').trim() === 'PASS' && b.offsetParent !== null && !b.disabled;
		}) || null;
	}

	// Bid buttons are tagged with the bid in natural notation:
	//   <button data-tooltip-id="1C"><img alt="C1" ...></button>
	// data-tooltip-id matches Brill's own notation exactly ("1S", "3N"), so no mapping needed.
	function bidButton(bid) {
		var b = document.querySelector('button[data-tooltip-id="' + bid + '"]');
		return (b && b.offsetParent !== null && !b.disabled) ? b : null;
	}

	// The panel shows one level at a time, chosen by <a role="tab">1..7</a>.
	// NOTE: do NOT use the ◀︎/▶︎ arrows for this - the top pair navigates BOARDS
	// (it would skip to the next deal) and the others belong to the Compare widget.
	//
	// data-tooltip-id is NOT exclusive to bids (the finished view uses ids like
	// "trial-lesson-compare"), so only accept ids shaped like an actual bid.
	function anyBidButton() {
		return Array.prototype.slice.call(document.querySelectorAll('button[data-tooltip-id]'))
			.find(function (b) { return /^[1-7][CDHSN]$/.test(b.dataset.tooltipId || ''); }) || null;
	}

	// The page has other role="tab" elements, so scope the search to the ancestor that
	// actually holds the bid buttons rather than matching on tab text alone.
	//
	// Only the levels still legal are rendered: once the auction reaches 1NT the tabs are
	// 2..7 (six of them), and at the 7-level just one. Requiring a fixed count of 7 works
	// at the start of every auction and then fails as soon as the bidding gets going.
	function levelTabs() {
		var el = anyBidButton();
		for (var i = 0; i < 6 && el; i++) {
			el = el.parentElement;
			if (!el) break;
			var tabs = Array.prototype.slice.call(el.querySelectorAll('a[role="tab"]'))
				.filter(function (t) { return /^[1-7]$/.test((t.textContent || '').trim()); });
			if (tabs.length) return tabs;
		}
		return [];
	}

	function selectLevel(level) {
		var tab = levelTabs().find(function (t) {
			return (t.textContent || '').trim() === String(level);
		});
		if (!tab) return false;
		if (/tab-active/.test(tab.className)) return true;   // already there
		tab.click();
		return true;
	}

	// Double / redouble appear only once the opponents compete. Unlike the suit bids these
	// carry NO data-tooltip-id and no text - they are icon buttons sitting just left of PASS:
	//     <button class="mr-2"><div ...><img alt="d" src="/assets/D-*.png"></div></button>
	//
	// The alt is the key of the app's own image map, so these are exact, not guesses:
	//     LI = { C1..N7: <bid pngs>, d: "/assets/D-*.png", ps: "/assets/P-*.png",
	//            r: "/assets/R-*.png" }
	//     Ra(): e.length === 1 ? e.toLowerCase() : e[1] + e[0]   // "1S"->"S1", "D"->"d", "R"->"r"
	// Being a lowercase single letter it cannot collide with the suit bids' "C2"/"N3".
	// The asset path is the fallback anchor: the build hash changes per deploy but the
	// "D-" / "R-" prefix does not, and no suit bid starts with a bare letter.
	function doubleButton(kind) {
		var alts = kind === 'XX' ? ['r', 'R'] : ['d', 'D'];
		var prefix = kind === 'XX' ? '/assets/R-' : '/assets/D-';
		var sels = alts.map(function (a) { return 'button img[alt="' + a + '"]'; });
		sels.push('button img[src^="' + prefix + '"]');
		for (var i = 0; i < sels.length; i++) {
			var img = document.querySelector(sels[i]);
			if (!img) continue;
			var b = img.closest('button');
			if (b && b.offsetParent !== null && !b.disabled) return b;
		}
		// last resort: a text-labelled control, in case the icon set ever changes
		var want = kind === 'XX' ? ['XX', 'REDBL', 'RDBL'] : ['X', 'DBL', 'DOUBLE'];
		return Array.prototype.slice.call(document.querySelectorAll('button')).find(function (x) {
			var t = (x.textContent || '').trim().toUpperCase();
			return want.indexOf(t) !== -1 && x.offsetParent !== null && !x.disabled;
		}) || null;
	}

	// Cuebids keeps every dialog mounted and hides them with opacity:0 / pointer-events:none,
	// so "is it in the DOM" tells you nothing - the computed style is what matters.
	function openModal() {
		return Array.prototype.slice.call(document.querySelectorAll('.modal')).find(function (m) {
			var cs = getComputedStyle(m);
			return cs.opacity !== '0' && cs.pointerEvents !== 'none' && cs.visibility !== 'hidden';
		}) || null;
	}

	// Truly clickable: on screen, not disabled, not inside a closed (opacity:0) modal.
	// The print dialog also has a "Confirm", but it is disabled and hidden - this rejects it.
	function isClickable(el) {
		if (!el || el.disabled) return false;
		var r = el.getBoundingClientRect();
		if (r.width <= 0 || r.height <= 0) return false;
		var cs = getComputedStyle(el);
		if (cs.visibility === 'hidden' || cs.opacity === '0' || cs.pointerEvents === 'none') return false;
		var m = el.closest ? el.closest('.modal') : null;
		if (m) {
			var mcs = getComputedStyle(m);
			if (mcs.opacity === '0' || mcs.pointerEvents === 'none' || mcs.visibility === 'hidden') return false;
		}
		return true;
	}

	// A bid that ends the auction is not committed immediately. Cuebids shows an INLINE bar
	// on the deal page - not a modal:
	//     Are you sure?    [ UNDO ]  (9)  [ CONFIRM ]
	// with a ~10s countdown. Leaving it unanswered (or navigating away first) means the bid
	// never lands and the board keeps coming back round, so CONFIRM must be clicked promptly.
	// Matching is exact so UNDO is never hit.
	function confirmButton() {
		var btns = Array.prototype.slice.call(document.querySelectorAll('button')).filter(isClickable);
		var inline = btns.find(function (b) {
			return /^confirm$/i.test((b.textContent || '').trim());
		});
		if (inline) return inline;

		// modal variant, if the app ever uses one: only "Are you sure?", never sign-out
		var m = openModal();
		if (!m) return null;
		var txt = (m.textContent || '').replace(/\s+/g, ' ');
		if (/sign out/i.test(txt) || !/are you sure/i.test(txt)) return null;
		return Array.prototype.slice.call(m.querySelectorAll('button')).filter(isClickable)
			.find(function (b) { return /^(yes|ok)$/i.test((b.textContent || '').trim()); }) || null;
	}

	// Click a control, then answer the confirmation bar if one appears. Polled for ~3s
	// because the bar animates in; the caller must not navigate away before this resolves.
	function clickAndConfirm(btn, done) {
		btn.click();
		var tries = 0;
		(function check() {
			var yes = confirmButton();
			if (yes) {
				log('clicking CONFIRM');
				yes.click();
				return setTimeout(function () { done(true); }, 400);
			}
			if (++tries < 10) return setTimeout(check, 300);
			done(true);   // no confirmation required for this bid
		})();
	}

	function place(bid, done) {
		if (bid === 'PASS' || bid === 'P' || bid === '--') {
			var p = passButton();
			if (p) return clickAndConfirm(p, done);
			return done(false, 'no PASS button');
		}
		if (bid === 'X' || bid === 'Db' || bid === 'XX' || bid === 'Rd') {
			var kind = (bid === 'XX' || bid === 'Rd') ? 'XX' : 'X';
			var d = doubleButton(kind);
			if (d) return clickAndConfirm(d, done);
			return done(false, 'no ' + kind + ' button (opponents may not be competing)');
		}
		if (!/^[1-7][CDHSN]$/.test(bid)) return done(false, 'unrecognised bid ' + bid);

		// Already on the right level?
		var direct = bidButton(bid);
		if (direct) return clickAndConfirm(direct, done);

		if (!selectLevel(bid.charAt(0))) return done(false, 'no level tab ' + bid.charAt(0));
		setTimeout(function () {
			var b = bidButton(bid);
			if (b) return clickAndConfirm(b, done);
			done(false, 'bid button ' + bid + ' not found after selecting level');
		}, 250);
	}

	// "Next board" is the green ⏩ on the finished-board view. Its Tailwind classes churn, but
	// the double-chevron icon path is stable, so key on that and fall back to the header ▶︎
	// (the TOP one - the pair at y~211 belongs to the Compare widget).
	function nextBoardButton() {
		var p = document.querySelector('button svg path[d^="M11.933 12.8"]');
		if (p) {
			var b = p.closest('button');
			if (b && b.offsetParent !== null && !b.disabled) return b;
		}
		var arrows = Array.prototype.slice.call(document.querySelectorAll('button'))
			.filter(function (x) {
				return /▶/.test(x.textContent || '') && x.offsetParent !== null && !x.disabled;
			})
			.sort(function (a, b) {
				return a.getBoundingClientRect().top - b.getBoundingClientRect().top;
			});
		return arrows[0] || null;
	}

	// ---------------------------------------------------------------- sweep mode
	//
	// With a HUMAN partner a board does not play through: Brill bids once and then the board
	// waits for the partner. So instead of sitting on one board we work the session list -
	// open a board that needs us, bid, come back, repeat.
	//
	// The list is a <table>. A board needing our action shows a red bell; one waiting on the
	// partner shows a greyed envelope:
	//     needs us   <svg class="fill-red-400">      (bell)
	//     waiting    <svg class="fill-gray-400/20">  (envelope)
	// Only ~13 <tr> exist for 20 boards (virtualised), so always re-query after navigating.

	function isDealPage() { return /^\/session\/deal\/[^/]+/.test(location.pathname); }
	function isListPage() { return /^\/session\/[^/]+\/?$/.test(location.pathname); }
	function sweepEnabled() { return localStorage.getItem('BRILL_SWEEP') !== '0'; }

	// The row's left border encodes its state, straight from the app's own render:
	//     v = deal.turn === myUid          -> border-[#ff6961]  (red)   my turn to bid
	//     x = deal.toSee.includes(myUid)   -> border-[#34d399]  (green) finished, unseen result
	//     otherwise                        -> border-transparent
	// The red class is a truer "my turn" signal than the bell icon, so prefer it and keep the
	// bell as a fallback in case the palette changes.
	var RED_ROW = /border-\[#ff6961\]/;
	var GREEN_ROW = /border-\[#34d399\]/;

	function bellRows() {
		var trs = Array.prototype.slice.call(document.querySelectorAll('tr'));
		var red = trs.filter(function (tr) { return RED_ROW.test((tr.className || '').toString()); });
		if (red.length) return red;
		return trs.filter(function (tr) { return tr.querySelector('svg.fill-red-400'); });
	}

	// Finished boards whose result we have not opened yet. Opening one clears it from toSee.
	function toSeeRows() {
		return Array.prototype.slice.call(document.querySelectorAll('tr'))
			.filter(function (tr) { return GREEN_ROW.test((tr.className || '').toString()); });
	}

	// Row text begins with the board number, e.g. "19 Q6 QT974 AKQT5" -> board 1.
	function rowKey(tr) {
		return (tr.textContent || '').replace(/\s+/g, '').slice(0, 24);
	}

	// A board is never permanently skipped: the partner keeps bidding, so a board we just
	// handled will legitimately need us again later. Instead each row gets a cooldown
	// timestamp - short after a successful bid (just long enough for the bell to clear),
	// long after a failure so one unclickable bid cannot spin the sweep.
	var COOLDOWN_OK = 15000;        // 15s
	var COOLDOWN_FAIL = 300000;     // 5min
	var skipBoards = {};            // rowKey -> epoch ms until which we ignore the row
	var idleLogged = false;
	var bidCount = 0;
	var viewingKey = null;          // set when a board was opened only to mark its result seen

	function viewResults() { return localStorage.getItem('BRILL_VIEW') !== '0'; }
	var pendingRowKey = null;
	var cameFromList = false;
	var returning = false;
	var dealOpenedAt = 0;
	var lastPath = '';

	function returnToList(sessionId) {
		if (returning) return;
		returning = true;
		setTimeout(function () {
			if (cameFromList && history.length > 1) history.back();
			else if (sessionId) location.assign('/session/' + sessionId);
			returning = false;
		}, CFG.settle);
	}

	function coolDown(key, ms) {
		if (key) skipBoards[key] = Date.now() + ms;
	}

	function onListPage() {
		if (!autoBid() || !sweepEnabled()) return;
		var now = Date.now();
		var rows = bellRows().filter(function (tr) {
			var until = skipBoards[rowKey(tr)];
			return !until || now > until;
		});
		if (!rows.length) {
			// Nothing to bid. Next: open any finished board whose result we have not seen,
			// which clears its green marker. Then genuinely idle.
			var green = viewResults() ? toSeeRows().filter(function (tr) {
				var until = skipBoards[rowKey(tr)];
				return !until || now > until;
			}) : [];
			if (green.length) {
				idleLogged = false;
				viewingKey = rowKey(green[0]);
				pendingRowKey = viewingKey;
				cameFromList = true;
				log('viewing result of board ' + viewingKey.slice(0, 3) + ' (' + green.length + ' unseen)');
				banner('Viewing result…', '#6b7280');
				green[0].click();
				return;
			}
			// Stay on the list and keep watching - the markers are Firestore-driven, so a
			// row lights up by itself when the partner acts. No reload needed.
			if (!idleLogged) {
				idleLogged = true;
				var anyLeft = document.body.textContent.indexOf('Deals left: 0') === -1;
				var msg = anyLeft ? 'Waiting for partner' : 'Session complete';
				log(msg.toLowerCase() + ' - ' + bidCount + ' board(s) bid, nothing to do');
				banner(msg + ' — ' + bidCount + ' bid', anyLeft ? '#6b7280' : '#15803d');
			}
			return;
		}
		idleLogged = false;
		viewingKey = null;
		pendingRowKey = rowKey(rows[0]);
		cameFromList = true;
		log('opening board ' + pendingRowKey.slice(0, 3) + ' (' + rows.length + ' needing action)');
		banner('Opening next board…', '#6b7280');
		rows[0].click();
	}

	// On-page ON/OFF control, so arming Brill never needs the console. Deliberately labelled
	// with text that none of our own selectors match (they look for PASS, ^confirm$,
	// data-tooltip-id, role=tab or tr), so the script can never click its own button.
	function paintToggle() {
		var el = document.getElementById('brill-toggle');
		if (!el) return;
		var on = autoBid();
		el.textContent = on ? 'Brill: BIDDING' : 'Brill: advisory';
		el.style.background = on ? '#15803d' : '#4b5563';
		el.title = on
			? 'Brill is placing bids - click for advisory only'
			: 'Advisory only (suggests, never clicks) - click to let Brill bid';
	}

	function ensureToggle() {
		if (!document.body) return;                 // @run-at document-start: body may not exist
		if (document.getElementById('brill-toggle')) { paintToggle(); return; }
		var el = document.createElement('button');
		el.id = 'brill-toggle';
		el.type = 'button';
		el.style.cssText = 'position:fixed;left:10px;bottom:10px;z-index:99999;padding:8px 12px;' +
			'border:none;border-radius:8px;font:600 13px system-ui,sans-serif;color:#fff;' +
			'cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.45);opacity:.93';
		el.addEventListener('click', function (ev) {
			ev.preventDefault();
			ev.stopPropagation();
			if (autoBid()) localStorage.removeItem('BRILL_AUTOBID');
			else localStorage.setItem('BRILL_AUTOBID', '1');
			// drop latched state so the change takes effect on the very next tick
			lastKey = null;
			idleLogged = false;
			busy = false;
			log('auto-bid ' + (autoBid() ? 'ON' : 'OFF') + ' (toggle)');
			paintToggle();
		});
		document.body.appendChild(el);
		paintToggle();
	}

	function banner(text, color) {
		var el = document.getElementById('brill-banner');
		if (!el) {
			el = document.createElement('div');
			el.id = 'brill-banner';
			el.style.cssText = 'position:fixed;top:8px;left:50%;transform:translateX(-50%);' +
				'z-index:99999;padding:6px 14px;border-radius:8px;font:600 14px system-ui;' +
				'color:#fff;box-shadow:0 2px 8px rgba(0,0,0,.4);pointer-events:none';
			document.body.appendChild(el);
		}
		el.style.background = color || '#2563eb';
		el.textContent = text;
	}

	// ---------------------------------------------------------------- main loop

	var busy = false, lastKey = null, advanced = {};

	function tick() {
		ensureToggle();
		if (busy) return;

		// Track navigation so we can time out a board that never becomes actionable.
		if (location.pathname !== lastPath) {
			lastPath = location.pathname;
			dealOpenedAt = Date.now();
		}

		if (isListPage()) { onListPage(); return; }
		if (!isDealPage()) return;

		var deal = currentDeal();

		// Landed on a board that never became bidable - either not our turn after all, or
		// ⏩ walked us onto a board waiting for the partner. Head back to the list rather
		// than sitting here; without this the sweep dead-ends on the first such board.
		if (autoBid() && sweepEnabled() &&
			Date.now() - dealOpenedAt > 20000 && (!deal || !passButton())) {
			log('board not actionable after 20s, backing off');
			coolDown(pendingRowKey, COOLDOWN_FAIL);
			pendingRowKey = null;
			viewingKey = null;
			returnToList(deal && deal.sessionId);
			return;
		}

		if (!deal || !deal.hand) return;

		// Board done -> advance with the green ⏩ next-board button. Falls back to the session
		// list when there is no ⏩ (last board), which is also how the sweep finds the next
		// board that actually needs us.
		if (deal.finished) {
			if (!autoBid()) return;

			// Opened purely to clear the green "unseen result" marker - being here is the
			// whole job, so go straight back rather than walking on with ⏩.
			if (viewingKey) {
				coolDown(viewingKey, COOLDOWN_FAIL);
				viewingKey = null;
				pendingRowKey = null;
				log('result seen, back to the list');
				returnToList(deal.sessionId);
				return;
			}

			if (advanced[deal.id]) return;
			coolDown(pendingRowKey, COOLDOWN_FAIL);   // finished: never re-open this row
			pendingRowKey = null;
			var nb = nextBoardButton();
			if (nb) {
				advanced[deal.id] = true;
				log('board finished, clicking next-board');
				banner('Next board…', '#6b7280');
				setTimeout(function () { nb.click(); }, CFG.settle);
				return;
			}
			if (sweepEnabled()) {
				log('board finished, no next-board button - back to the list');
				returnToList(deal.sessionId);
			}
			return;
		}

		if (!passButton()) return;                  // bidding box not up -> not our turn

		var seat = seatToBid(deal.bidding);
		var key = deal.id + '|' + (deal.bidding || '');
		if (key === lastKey) return;                // already handled this position

		var hand = handFor(deal.hand, seat);
		if (!hand) { log('could not extract hand for', seat, deal.hand); return; }

		busy = true;
		lastKey = key;
		// snapshot the position we are asking about, to validate the answer against later
		var askedId = deal.id;
		var askedBidding = deal.bidding;

		var url = baseUrl() + '/bid'
			+ '?user=' + encodeURIComponent('CuebidsBrill')
			+ '&dealer=' + encodeURIComponent(deal.dealer)
			+ '&dealno=' + encodeURIComponent(deal.dealNumber || 1)
			+ '&seat=' + encodeURIComponent(seat)
			+ '&vul=' + encodeURIComponent(toVul(deal.vulnerability))
			+ '&ctx=' + encodeURIComponent(toCtx(deal.bidding))
			+ '&hand=' + encodeURIComponent(hand)
			+ '&board=' + encodeURIComponent(deal.dealNumber || 1)
			+ '&event=' + encodeURIComponent(deal.sessionHeadline || 'Cuebids');

		log('asking Brill', { seat: seat, ctx: toCtx(deal.bidding), hand: hand });
		banner('Brill thinking…', '#6b7280');

		request(url, {
			onload: function (res) {
				busy = false;
				var data;
				try { data = JSON.parse(res.responseText); }
				catch (e) { banner('Brill: bad response', '#b91c1c'); return log('bad JSON', res.responseText); }
				if (!data || typeof data.bid !== 'string') {
					banner('Brill: ' + (data && data.message ? data.message : 'no bid'), '#b91c1c');
					return log('no bid in response', data);
				}
				log('Brill says', data.bid);
				if (!autoBid()) { banner('Brill suggests ' + data.bid, '#2563eb'); return; }

				// The answer takes ~1s, and ⏩ / returnToList may have moved us in the
				// meantime. Re-check that we are still on the same board at the same point
				// in the auction before clicking, or we would bid one board's call on
				// another. (Same re-check-at-click-time guard PlayWithBrill.js uses.)
				var nowDeal = currentDeal();
				if (!nowDeal || nowDeal.id !== askedId || nowDeal.bidding !== askedBidding || !passButton()) {
					log('position moved on since asking - discarding ' + data.bid);
					lastKey = null;
					return;
				}
				setTimeout(function () {
					place(data.bid, function (ok, why) {
						if (!ok) {
							banner('Could not bid ' + data.bid, '#b91c1c');
							log('place failed:', why);
							// In a sweep, a bid we cannot click would spin forever - drop the
							// board and move on rather than blocking the remaining boards.
							if (autoBid() && sweepEnabled() && cameFromList && pendingRowKey) {
								coolDown(pendingRowKey, COOLDOWN_FAIL);
								pendingRowKey = null;
								returnToList(deal.sessionId);
							} else {
								lastKey = null;   // otherwise retry this position next tick
							}
							return;
						}
						bidCount++;
						banner('Brill bid ' + data.bid, '#15803d');
						// Human partner: the board now waits for them, so head back to the
						// list and pick up the next board that needs us.
						if (autoBid() && sweepEnabled() && cameFromList) {
							// short cooldown only: once the partner answers, this same board
							// will need Brill again and must be picked up on a later pass
							coolDown(pendingRowKey, COOLDOWN_OK);
							pendingRowKey = null;
							setTimeout(function () { returnToList(deal.sessionId); }, 1200);
						}
					});
				}, CFG.settle);
			},
			onerror: function (e) { busy = false; banner('Brill unreachable', '#b91c1c'); log('error', e); },
			ontimeout: function () { busy = false; banner('Brill timed out', '#b91c1c'); }
		});
	}

	// Debug handle - from the page console:  __brill.state()
	window.__brill = {
		state: function () {
			var d = currentDeal();
			return {
				autoBid: autoBid(),
				server: baseUrl(),
				dealId: currentDealId(),
				known: Object.keys(deals),
				dealSeen: !!d,
				deal: d ? { id: d.id, bidding: d.bidding, dealer: d.dealer, finished: d.finished } : null,
				seat: d ? seatToBid(d.bidding) : null,
				passButton: !!passButton(),
				bidButtons: Array.prototype.slice.call(
					document.querySelectorAll('button[data-tooltip-id]')).map(function (b) {
						return b.dataset.tooltipId;
					}),
				levelTabs: levelTabs().length,
				busy: busy,
				lastKey: lastKey,
				stats: stats,
				bufLen: buf.length
			};
		},
		deal: function () { return currentDeal(); },
		deals: function () { return deals; },
		reset: function () {
			lastKey = null; busy = false; advanced = {};
			skipBoards = {}; idleLogged = false; bidCount = 0;
			pendingRowKey = null; viewingKey = null;
			return 'ok';
		},
		sweep: function () {
			var now = Date.now();
			var cooling = {};
			Object.keys(skipBoards).forEach(function (k) {
				var left = Math.round((skipBoards[k] - now) / 1000);
				if (left > 0) cooling[k] = left + 's';
			});
			return {
				enabled: sweepEnabled(), viewResults: viewResults(), bidCount: bidCount,
				page: isListPage() ? 'list' : (isDealPage() ? 'deal' : 'other'),
				myTurnRows: isListPage() ? bellRows().map(rowKey) : null,
				unseenRows: isListPage() ? toSeeRows().map(rowKey) : null,
				coolingDown: cooling, pending: pendingRowKey, viewing: viewingKey
			};
		},
		next: function () {
			var b = nextBoardButton();
			if (!b) return 'no next-board button';
			b.click();
			return 'clicked';
		}
	};

	setInterval(tick, CFG.poll);
	log('v0.5.0 loaded. autoBid=' + autoBid() + ' sweep=' + sweepEnabled() + ' server=' + baseUrl());
})();
