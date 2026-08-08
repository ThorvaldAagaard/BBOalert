// ==UserScript==
// @name         Cuebids with Brill
// @namespace    https://github.com/ThorvaldAagaard/BBOalert
// @version      0.1.0
// @description  Let Brill bid your seat on cuebids.com. Advisory by default; auto-bid is opt-in.
// @match        https://cuebids.com/*
// @grant        GM_xmlhttpRequest
// @connect      brillservice.aalborgdata.dk
// @connect      localhost
// @run-at       document-start
// ==/UserScript==
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
//   localStorage.BRILL_SERVER  = 'local'  // http://localhost:5200 instead of brillservice

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
		return localStorage.getItem('BRILL_SERVER') === 'local'
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

	// Cuebids tokens -> Brill ctx ("P"->"--", "X"->"Db", "XX"->"Rd", bids unchanged)
	function toCtx(bidding) {
		return tokens(bidding).map(function (t) {
			if (t === 'P') return '--';
			if (t === 'X') return 'Db';
			if (t === 'XX') return 'Rd';
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

	// Double / redouble only appear when opponents actually compete (compete > 0).
	function doubleButton(kind) {
		var want = kind === 'XX' ? ['XX', 'REDBL', 'RDBL'] : ['X', 'DBL', 'DOUBLE'];
		var byId = document.querySelector('button[data-tooltip-id="' + want[0] + '"]');
		if (byId && byId.offsetParent !== null) return byId;
		return Array.prototype.slice.call(document.querySelectorAll('button')).find(function (b) {
			var t = (b.textContent || '').trim().toUpperCase();
			return want.indexOf(t) !== -1 && b.offsetParent !== null && !b.disabled;
		}) || null;
	}

	function place(bid, done) {
		if (bid === 'PASS' || bid === 'P' || bid === '--') {
			var p = passButton();
			if (p) { p.click(); return done(true); }
			return done(false, 'no PASS button');
		}
		if (bid === 'X' || bid === 'Db' || bid === 'XX' || bid === 'Rd') {
			var kind = (bid === 'XX' || bid === 'Rd') ? 'XX' : 'X';
			var d = doubleButton(kind);
			if (d) { d.click(); return done(true); }
			return done(false, 'no ' + kind + ' button (opponents may not be competing)');
		}
		if (!/^[1-7][CDHSN]$/.test(bid)) return done(false, 'unrecognised bid ' + bid);

		// Already on the right level?
		var direct = bidButton(bid);
		if (direct) { direct.click(); return done(true); }

		if (!selectLevel(bid.charAt(0))) return done(false, 'no level tab ' + bid.charAt(0));
		setTimeout(function () {
			var b = bidButton(bid);
			if (b) { b.click(); return done(true); }
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
		if (busy) return;
		var deal = currentDeal();
		if (!deal || !deal.hand) return;

		// Board done -> move to the next one so a session plays straight through.
		// Only in auto mode: in advisory mode the user is driving and should not be
		// navigated away. advanced[] keeps us from clicking twice for the same board.
		if (deal.finished) {
			if (!autoBid() || advanced[deal.id]) return;
			var nb = nextBoardButton();
			if (!nb) return;                        // last board of the session
			advanced[deal.id] = true;
			log('board finished, advancing to next');
			banner('Next board…', '#6b7280');
			setTimeout(function () { nb.click(); }, CFG.settle);
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
				setTimeout(function () {
					place(data.bid, function (ok, why) {
						if (ok) { banner('Brill bid ' + data.bid, '#15803d'); return; }
						banner('Could not bid ' + data.bid, '#b91c1c');
						log('place failed:', why);
						lastKey = null;   // let the next tick retry this position
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
		reset: function () { lastKey = null; busy = false; advanced = {}; return 'ok'; },
		next: function () {
			var b = nextBoardButton();
			if (!b) return 'no next-board button';
			b.click();
			return 'clicked';
		}
	};

	setInterval(tick, CFG.poll);
	log('loaded. autoBid=' + autoBid() + ' server=' + baseUrl());
})();
