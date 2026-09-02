// Shim completeness check for the standalone challenge userscript.
//
// The vendored BBOalert files reference names that live in the files we do NOT vendor
// (BBOalert.js, BBOalertUI.js, BBOalertData.js, BBOalertFind.js). Each missing one is a
// runtime ReferenceError, and they surface in the worst possible way:
//
//   - execUserScript threw on `foundContext` inside the observer bootstrap, so the
//     MutationObserver never started, no hook ever fired, and the only symptom was silence.
//   - `inputOnKeyup` threw inside onBiddingBoxDisplayed, killing BBOobserverCallback, so
//     the bidding box appeared but nothing ever bid.
//
// Finding those one crash at a time cost several live runs against a real BBO table. This
// finds them statically instead.
//
// Note it checks bare identifier REFERENCES, not just call sites: inputOnKeyup is assigned
// as a value (elMessage.onkeyup = inputOnKeyup), and a scan looking only for `name(` misses
// it entirely - which is exactly what happened on the first attempt.

const fs = require('fs');
const path = require('path');

const IGNORE = new Set([
	'error'   // catch-clause parameter in the vendored code, not a BBOalert global
]);

function strip(t) {
	return t
		.replace(/\/\*[\s\S]*?\*\//g, ' ')
		.replace(/^\s*\/\/.*$/gm, ' ')
		.replace(/(['"`])(?:\\.|(?!\1)[^\\\n])*\1/g, '""');
}

function collect(text, patterns) {
	const out = new Set();
	for (const re of patterns) {
		for (const m of text.matchAll(re)) out.add(m[1]);
	}
	return out;
}

const DECLARES = [
	/function\s+([A-Za-z_$][\w$]*)/g,
	/^([A-Za-z_$][\w$]*)\s*=\s*function/gm,
	/^(?:var|let|const)\s+([A-Za-z_$][\w$]*)/gm,
	/class\s+([A-Za-z_$][\w$]*)/g
];

/**
 * @param {string} bodyText  the assembled userscript body (vendored + shim + lobby)
 * @param {string} iframeDir absolute path to src/iframe
 * @param {string[]} vendored filenames from iframeDir that ARE included in bodyText
 * @returns {string[]} names referenced by the body but defined only in non-vendored files
 */
function checkShim(bodyText, iframeDir, vendored) {
	const src = strip(bodyText);
	const skip = new Set(vendored);

	// Names that only the non-vendored BBOalert files define.
	const theirs = new Set();
	for (const f of fs.readdirSync(iframeDir)) {
		if (!f.endsWith('.js') || skip.has(f)) continue;
		for (const n of collect(fs.readFileSync(path.join(iframeDir, f), 'utf8'), DECLARES)) {
			theirs.add(n);
		}
	}

	// Names the assembled body defines for itself (vendored code + shim + lobby).
	const ours = collect(src, [
		/function\s+([A-Za-z_$][\w$]*)/g,
		/(?:var|let|const)\s+([A-Za-z_$][\w$]*)/g,
		/^\s*([A-Za-z_$][\w$]*)\s*=[^=]/gm
	]);

	// Every identifier the body references, excluding property accesses (obj.name).
	const refs = new Set();
	for (const m of src.matchAll(/(?:^|[^.\w$])([A-Za-z_$][\w$]*)/g)) refs.add(m[1]);

	return [...theirs].filter(n => !ours.has(n) && refs.has(n) && !IGNORE.has(n)).sort();
}

module.exports = { checkShim };
