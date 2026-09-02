// ==UserScript==
// @name         BBO DOM probe
// @namespace    https://github.com/ThorvaldAagaard/BBOalert
// @version      0.1.0
// @description  Reconnaissance for the BBO challenge lobby - records screen transitions, clickable elements and WebSocket traffic. Read-only: it never clicks anything.
// @match        *://www.bridgebase.com/v3/*
// @grant        none
// @run-at       document-start
// ==/UserScript==
//
// WHY THIS EXISTS
// ---------------
// PlayWithBrill.js already plays a board once you are seated at a BBO table, but it gets
// there by hand. To drive a head-to-head challenge end-to-end we need to automate the
// LOBBY - and BBOalert has no idea the lobby exists (tableType() just returns 'no' when
// there is no deal number). This script maps that unknown territory. It only observes;
// automation comes later.
//
// @grant none is deliberate, exactly as in CuebidsWithBrill.user.js: any @grant puts the
// script in a Tampermonkey sandbox whose `window` is a wrapper, so `window.WebSocket = ...`
// would patch the sandbox and never see the page's real socket, and `__bboprobe` would be
// invisible from the devtools console.
//
// @run-at document-start is load-bearing too - the WebSocket hook has to be installed
// before the BBO client opens its connection, or we capture nothing.
//
// HOW TO USE
// ----------
//   1. Install, reload BBO, log in.
//   2. Walk the flow by hand, calling __bboprobe.mark(...) at each step, e.g.
//        __bboprobe.mark('lobby home')
//        __bboprobe.mark('casual tab')
//        __bboprobe.mark('challenge list, 2 pending')
//        __bboprobe.mark('sent a challenge to <user>')
//        __bboprobe.mark('challenge accepted, seated')
//   3. At each step, inspect:
//        __bboprobe.snap()             skeleton of the visible screen
//        __bboprobe.buttons()          every visible clickable thing + a selector for it
//        __bboprobe.find('challenge')  elements whose text mentions something
//        __bboprobe.ws(40)             last 40 WebSocket frames
//   4. __bboprobe.dump() downloads the whole trace as JSON.
//
// The two questions this is meant to answer:
//   a) Which stable selectors identify "I am on the challenge list" / "a challenge is
//      pending" / "start"?  -> drives a DOM-based lobby driver.
//   b) Does the WebSocket carry the challenge state in readable form?  -> if so we hook
//      it and treat it as authoritative, exactly the way CuebidsWithBrill uses Firestore.
//      That matters more here than on cuebids: a head-to-head challenge arrives as an
//      unsolicited server push, and waiting for a row to appear in the DOM is the
//      flakiest possible way to notice it.

(function () {
	'use strict';

	if (window.top !== window.self) return;
	if (window.__bboprobeInstalled) return;
	window.__bboprobeInstalled = true;

	var CFG = {
		poll: 500,        // ms between screen-signature checks
		frames: 800,      // WebSocket frames kept in the ring buffer
		frameChars: 600,  // per-frame truncation
		depth: 7          // default snap() depth
	};

	var trace = [];   // screen transitions and user marks
	var frames = [];  // WebSocket traffic

	function stamp() { return new Date().toISOString().slice(11, 23); }
	function log() { console.log.apply(console, ['[probe]'].concat([].slice.call(arguments))); }

	function rec(list, cap, entry) {
		entry.t = stamp();
		list.push(entry);
		while (list.length > cap) list.shift();
	}

	// ---------------------------------------------------------------- websocket

	function clip(d) {
		var s;
		try {
			if (typeof d === 'string') s = d;
			else if (d && typeof d.byteLength === 'number') s = '<binary ' + d.byteLength + ' bytes>';
			else if (typeof Blob !== 'undefined' && d instanceof Blob) s = '<blob ' + d.size + ' bytes>';
			else s = String(d);
		} catch (e) {
			s = '<unreadable>';
		}
		return s.length > CFG.frameChars ? s.slice(0, CFG.frameChars) + ' ...(' + s.length + ')' : s;
	}

	var NativeWS = window.WebSocket;

	var ProbeWS = function (url, protocols) {
		var ws = protocols === undefined ? new NativeWS(url) : new NativeWS(url, protocols);
		rec(trace, 5000, { kind: 'ws-open', url: String(url) });
		log('WebSocket ->', String(url));
		ws.addEventListener('message', function (e) {
			rec(frames, CFG.frames, { dir: 'in', data: clip(e.data) });
		});
		var nativeSend = ws.send;
		ws.send = function (d) {
			rec(frames, CFG.frames, { dir: 'out', data: clip(d) });
			return nativeSend.apply(ws, arguments);
		};
		return ws;
	};

	if (NativeWS) {
		ProbeWS.prototype = NativeWS.prototype;
		['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED'].forEach(function (k, i) { ProbeWS[k] = i; });
		window.WebSocket = ProbeWS;
	}

	// The v3 client may also talk plain HTTP for parts of the lobby. Cheap to watch.
	var nativeFetch = window.fetch;
	if (nativeFetch) {
		window.fetch = function (input) {
			var url = typeof input === 'string' ? input : (input && input.url) || '';
			if (!/\.(js|css|png|jpg|svg|woff2?)(\?|$)/i.test(url)) {
				rec(frames, CFG.frames, { dir: 'fetch', data: String(url) });
			}
			return nativeFetch.apply(this, arguments);
		};
	}

	// ---------------------------------------------------------------- dom helpers

	function isVisible(el) {
		if (!el || el.nodeType !== 1) return false;
		if (el.offsetParent !== null) return true;
		return el.getClientRects().length > 0;
	}

	function classes(el) {
		var c = el.getAttribute && el.getAttribute('class');
		return c ? '.' + c.trim().split(/\s+/).join('.') : '';
	}

	// Text belonging to this element itself, not to its children - keeps the skeleton
	// readable instead of repeating the whole subtree at every level.
	function ownText(el) {
		var out = '';
		for (var i = 0; i < el.childNodes.length; i++) {
			var n = el.childNodes[i];
			if (n.nodeType === 3) out += n.nodeValue;
		}
		return out.replace(/\s+/g, ' ').trim();
	}

	function trim(s, n) {
		return s.length > n ? s.slice(0, n) + '...' : s;
	}

	// A selector good enough to paste back into $() or querySelector. Walks up until it
	// hits an id or a custom element, which in an Angular app is usually specific enough.
	function pathTo(el) {
		var parts = [];
		while (el && el.nodeType === 1 && el.tagName !== 'BODY' && parts.length < 6) {
			var tag = el.tagName.toLowerCase();
			if (el.id) { parts.unshift(tag + '#' + el.id); break; }
			parts.unshift(tag + classes(el));
			if (tag.indexOf('-') !== -1) break;   // custom element: specific enough, stop
			el = el.parentElement;
		}
		return parts.join(' > ');
	}

	// Attributes worth seeing in a skeleton. `src` matters most: BBO encodes challenge state
	// as an <img class="statusImageClass"> rather than as text or a class, so the image name
	// is the only readable signal for "whose turn is it".
	var ATTRS = ['src', 'alt', 'title', 'aria-label', 'disabled', 'href'];

	function attrs(el) {
		var out = '';
		for (var i = 0; i < ATTRS.length; i++) {
			if (!el.hasAttribute(ATTRS[i])) continue;
			var v = el.getAttribute(ATTRS[i]) || '';
			// long data: URIs and cache-busting paths add noise; the basename identifies it
			if (ATTRS[i] === 'src' || ATTRS[i] === 'href') {
				if (v.indexOf('data:') === 0) v = 'data:' + v.slice(5, 20) + '...';
				else v = v.split('?')[0].split('/').pop() || v;
			}
			out += ' ' + ATTRS[i] + '="' + trim(v, 60) + '"';
		}
		return out;
	}

	function skeleton(el, depth, indent) {
		if (!el || depth < 0 || !isVisible(el)) return '';
		var out = indent + '<' + el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') +
			classes(el) + attrs(el);
		var own = ownText(el);
		if (own) out += '  "' + trim(own, 70) + '"';
		out += '\n';
		for (var i = 0; i < el.children.length; i++) {
			out += skeleton(el.children[i], depth - 1, indent + '  ');
		}
		return out;
	}

	// The set of visible Angular custom elements is a compact fingerprint of "which screen
	// am I on" - it changes on navigation and is stable within a screen.
	function signature() {
		if (!document.body) return '';
		var seen = {};
		var all = document.body.querySelectorAll('*');
		for (var i = 0; i < all.length; i++) {
			var tag = all[i].tagName.toLowerCase();
			if (tag.indexOf('-') === -1) continue;
			if (!isVisible(all[i])) continue;
			seen[tag] = (seen[tag] || 0) + 1;
		}
		return Object.keys(seen).sort().map(function (k) {
			return seen[k] > 1 ? k + ' x' + seen[k] : k;
		}).join(' ');
	}

	function navTitle() {
		var h = document.querySelector('nav-bar h2.titleClass');
		return h ? h.textContent.replace(/\s+/g, ' ').trim() : '';
	}

	// ---------------------------------------------------------------- screen tracking

	var lastSig = null, lastTitle = null;

	function tick() {
		var sig = signature(), title = navTitle();
		if (sig === lastSig && title === lastTitle) return;
		lastSig = sig; lastTitle = title;
		rec(trace, 5000, { kind: 'screen', title: title, sig: sig, url: location.href });
		log('screen:', title || '(no title)', '\n         ', sig);
	}

	// ---------------------------------------------------------------- console API

	var CLICKABLE = 'button, ion-button, a[href], [role="button"], tab-bar-button, ' +
		'menu-item, ion-item, [class*="uttonClass"], [class*="ButtonDiv"], tr, ion-card';

	window.__bboprobe = {
		// Skeleton of the visible screen. Pass a selector to focus on one subtree,
		// e.g. __bboprobe.snap('lobby-screen') once you know the tag name.
		snap: function (sel, depth) {
			var root = sel ? document.querySelector(sel) : document.body;
			if (!root) return 'no match for ' + sel;
			var s = skeleton(root, depth === undefined ? CFG.depth : depth, '');
			console.log(s);
			return '(' + s.split('\n').length + ' lines)';
		},

		// Every visible clickable thing, with a selector you can try in the console.
		// This is the raw material for a lobby driver.
		buttons: function () {
			var out = [];
			var all = document.querySelectorAll(CLICKABLE);
			for (var i = 0; i < all.length; i++) {
				if (!isVisible(all[i])) continue;
				out.push({
					text: trim(all[i].textContent.replace(/\s+/g, ' ').trim(), 60),
					tag: all[i].tagName.toLowerCase(),
					path: pathTo(all[i])
				});
			}
			console.table(out);
			return out.length + ' clickable';
		},

		// Elements whose visible text mentions something, innermost match only - the
		// fastest way to locate "Challenge", a username, "Accept", "Start".
		find: function (needle) {
			var want = String(needle).toLowerCase(), out = [];
			var all = document.body.querySelectorAll('*');
			for (var i = 0; i < all.length; i++) {
				var el = all[i];
				if (!isVisible(el)) continue;
				var txt = el.textContent.replace(/\s+/g, ' ').trim();
				if (txt.toLowerCase().indexOf(want) === -1) continue;
				// keep only the innermost matches, so we get the row and not the whole page
				var deeper = false;
				for (var j = 0; j < el.children.length; j++) {
					if (isVisible(el.children[j]) &&
						el.children[j].textContent.toLowerCase().indexOf(want) !== -1) { deeper = true; break; }
				}
				if (deeper) continue;
				out.push({ text: trim(txt, 70), path: pathTo(el) });
			}
			console.table(out);
			return out.length + ' matches';
		},

		// Annotate the trace so the dump reads as a narrative of the flow.
		mark: function (label) {
			rec(trace, 5000, { kind: 'mark', label: String(label), title: navTitle(), sig: signature() });
			log('MARK', label);
			return 'marked';
		},

		screens: function () { console.table(trace); return trace.length + ' entries'; },

		ws: function (n) {
			frames.slice(-(n || 30)).forEach(function (f) { console.log(f.t, f.dir, f.data); });
			return frames.length + ' frames buffered';
		},

		// Same information as snap()/buttons()/screens(), but RETURNED rather than printed,
		// so a driver (Playwright, or the eventual lobby automation) can consume it.
		// Everything above is for a human at the console; this is for a program.
		report: function (sel, depth) {
			var root = (sel && document.querySelector(sel)) || document.body;
			var btns = [];
			var all = document.querySelectorAll(CLICKABLE);
			for (var i = 0; i < all.length; i++) {
				if (!isVisible(all[i])) continue;
				var txt = all[i].textContent.replace(/\s+/g, ' ').trim();
				if (!txt) continue;
				btns.push({ text: trim(txt, 80), tag: all[i].tagName.toLowerCase(), path: pathTo(all[i]) });
			}
			return {
				url: location.href,
				title: navTitle(),
				sig: signature(),
				buttons: btns,
				skeleton: skeleton(root, depth === undefined ? CFG.depth : depth, '')
			};
		},

		// Raw buffers, for saving to disk outside the browser.
		raw: function () { return { trace: trace, frames: frames }; },

		dump: function () {
			var blob = new Blob([JSON.stringify({
				captured: new Date().toISOString(),
				url: location.href,
				trace: trace,
				frames: frames
			}, null, 2)], { type: 'application/json' });
			var a = document.createElement('a');
			a.href = URL.createObjectURL(blob);
			a.download = 'bboprobe-' + Date.now() + '.json';
			document.body.appendChild(a);
			a.click();
			setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
			return 'downloading (' + trace.length + ' trace, ' + frames.length + ' frames)';
		},

		clear: function () { trace.length = 0; frames.length = 0; lastSig = null; return 'cleared'; }
	};

	function start() {
		setInterval(tick, CFG.poll);
		tick();
		log('v0.1.0 ready. Try __bboprobe.mark("lobby"), .snap(), .buttons(), .find("challenge"), .ws(), .dump()');
	}

	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
	else start();
})();
