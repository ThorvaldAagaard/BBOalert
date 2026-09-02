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
