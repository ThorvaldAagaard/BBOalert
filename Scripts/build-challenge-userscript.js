#!/usr/bin/env node
//
// Builds TamperMonkey/PlayChallengeWithBrill.user.js - a standalone userscript that plays
// BBO challenges WITHOUT the BBOalert extension (robot challenges by default; human ones
// only when BRILL_ALLOW_HUMAN is set).
//
// Why a build step rather than a hand-written file: the DOM selectors in src/iframe are
// BBOalert's real asset and its real fragility. A hand-copied fork would silently drift the
// next time BBO changes its markup. Generating from src/iframe keeps one source of truth,
// so fixing a selector in the extension fixes the userscript on the next build.
//
//   node Scripts/build-challenge-userscript.js
//
// Layout of the generated file (order matters):
//   globals.js               PWD, scriptList, the E_* Event objects
//   functions.js             userScript()/eval host, isVisible, getNow, ...
//   BBO_DOM.js               the ~100 BBO page accessors
//   BBOobserverHandlers.js   on<Event> handlers that dispatch into user scripts
//   shim.js                  execUserScript/getScript for real; alert+panel as no-ops;
//                            OVERRIDES onNavDivDisplayed (must come after the handlers)
//   lobby.js                 NEW: the challenge sweep (ard.php + the 3-click entry chain)
//   <script blocks>          Custom/PlayWithBrill.js parsed into scriptList entries
//   BBOobserver.js           LAST: it self-starts a setInterval on load
//
const fs = require('fs');
const path = require('path');
const { checkShim } = require('./check-shim');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'TamperMonkey', 'PlayChallengeWithBrill.user.js');

const VENDOR = ['globals.js', 'functions.js', 'BBO_DOM.js'];
const VENDOR_AFTER = ['BBOobserverHandlers.js'];
const LAST = 'BBOobserver.js';

const read = (...p) => fs.readFileSync(path.join(ROOT, ...p), 'utf8');

// --------------------------------------------------------------- PlayWithBrill parsing
//
// Reproduces setScriptList() from BBOalert.js exactly. A "//Script,<name>" line opens a
// block; every following non-Script line belongs to it. The stored entry must be
//     "//Script,<name>," + "\n" + <lines>
// because getScript() slices everything after the SECOND comma - get this wrong and every
// hook silently returns empty.
function parseScripts(text) {
	const entries = [];
	let current = null;
	let dropped = 0;
	for (const line of text.split(/\r?\n/)) {
		const rec = line.split(',');
		const head = rec[0].trim();
		if (head === 'Script' || head === '//Script') {
			if (current) { entries.push(current); current = null; }
			if (rec.length === 2) current = line + ',';
			else if (rec.length > 2) entries.push(line);
			continue;
		}
		if (head === 'Option' || head === '//Option') { dropped++; continue; }
		if (current !== null) current += '\n' + line;
	}
	if (current) entries.push(current);
	return { entries, dropped };
}

const brill = read('Custom', 'PlayWithBrill.js');
const { entries, dropped } = parseScripts(brill);
const names = entries.map(e => e.split(',')[1].trim());

// --------------------------------------------------------------- assemble
const banner = (f) =>
	`\n// ${'='.repeat(74)}\n// vendored: ${f}\n// ${'='.repeat(74)}\n`;

// shim.js goes AFTER the vendored handlers on purpose: duplicate function declarations in
// the same scope resolve to the LAST one, so this is what lets the shim override
// onNavDivDisplayed() rather than merely supply missing names.
let body = '';
for (const f of VENDOR) body += banner('src/iframe/' + f) + read('src', 'iframe', f);
for (const f of VENDOR_AFTER) body += banner('src/iframe/' + f) + read('src', 'iframe', f);
body += banner('TamperMonkey/src/shim.js (overrides the above)') + read('TamperMonkey', 'src', 'shim.js');
body += banner('TamperMonkey/src/lobby.js') + read('TamperMonkey', 'src', 'lobby.js');

// initGlobals() in globals.js does `scriptList = []`, and the observer calls it on startup -
// so assigning scriptList once at load is not enough, it gets wiped. Keep the parsed blocks
// in their own constant and let the shim's setScriptList() restore from it; the lobby tick
// re-checks, so the script survives every initGlobals.
body += banner('generated: Custom/PlayWithBrill.js -> scriptList') +
	'BRILL_SCRIPTS = ' + JSON.stringify(entries, null, 1) + ';\n' +
	'setScriptList();\n' +
	'console.log("[brill] " + scriptList.length + " script blocks loaded");\n';

body += banner('src/iframe/' + LAST + ' (self-starts - must be last)') +
	read('src', 'iframe', LAST);

// jQuery is INLINED rather than pulled in with @require. The @require path is an extra
// failure mode with no diagnostic: if Tampermonkey cannot fetch the CDN copy it declines to
// run the script at all, so not one line of our code executes and the console shows nothing
// whatsoever - indistinguishable from "not installed". Vendoring the copy the extension
// already ships (src/jquery-3.5.1.min.js, the exact version BBOalert is built against)
// makes the userscript self-contained and offline-capable, at ~89 KB.
const jquery = read('src', 'jquery-3.5.1.min.js');

const header = `// ==UserScript==
// @name         Play BBO challenges with Brill
// @namespace    https://github.com/ThorvaldAagaard/BBOalert
// @version      0.3.1
// @description  Plays BBO challenges with Brill (robots by default; humans opt-in). Standalone - no BBOalert extension needed.
// @match        *://www.bridgebase.com/v3/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==
//
// GENERATED FILE - do not edit. Run: node Scripts/build-challenge-userscript.js
//
// BUMP @version IN Scripts/build-challenge-userscript.js WHEN YOU CHANGE ANYTHING.
// Tampermonkey compares versions on update: reinstalling with an unchanged version can
// leave the previously installed copy in place, which looks identical to "the fix did
// not work".
// Sources: src/iframe/*, TamperMonkey/src/shim.js, TamperMonkey/src/lobby.js,
//          Custom/PlayWithBrill.js
//
// @grant none keeps this in page context, the same reason CuebidsWithBrill.user.js needs it:
// under a sandbox, \`window\` is a wrapper and the page's own globals are invisible.
//
// NOT 'use strict' - deliberately. PlayWithBrill's blocks pass state between hooks via
// implicit globals (\`newdeal = true\` with no var), which strict mode turns into errors.
//
// OPPONENTS: robot challenges (c_challenge_style ARENA_ROBOT) are played whenever autoplay
// is on. Human challenges (PK) additionally require localStorage.BRILL_ALLOW_HUMAN = '1' -
// a separate switch so it is always a deliberate choice.
// See TamperMonkey/BBO-lobby-protocol.md.

// --- vendored jQuery 3.5.1 (src/jquery-3.5.1.min.js) ------------------------------
${jquery}
// --- end vendored jQuery ----------------------------------------------------------

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
		console.error('[brill] jQuery missing - the inlined copy failed to evaluate');
		return;
	}
${body.split('\n').map(l => l ? '\t' + l : l).join('\n')}
})();
`;


// Catch missing shim names here rather than as a silent ReferenceError at a live table.
const gaps = checkShim(body, path.join(ROOT, 'src', 'iframe'), [...VENDOR, ...VENDOR_AFTER, LAST]);

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, header, 'utf8');

console.log('wrote', path.relative(ROOT, OUT));
console.log('  script blocks :', entries.length, dropped ? `(dropped ${dropped} Option lines)` : '');
console.log('  hooks         :', [...new Set(names)].sort().join(' '));
console.log('  size          :', (header.length / 1024).toFixed(0) + ' KB');

if (gaps.length) {
	console.error('');
	console.error('!! shim is missing ' + gaps.length + ' name(s) that the vendored code references:');
	console.error('   ' + gaps.join(', '));
	console.error('   Each one is a runtime ReferenceError. Add them to TamperMonkey/src/shim.js.');
	process.exitCode = 1;
} else {
	console.log('  shim check    : OK');
}
