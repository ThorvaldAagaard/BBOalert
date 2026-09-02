# TamperMonkey scripts

## How to install a script

- make sure the <b>TamperMonkey</b> browser extension is installed
- open the script file and press the <b>Raw</b> button
- press <b>Install</b>

## Script : LoveBridge Vugraph PBN

- open the https://vugraph.lovebridge.com/ page
- select <b>Running or Final Score/results</b> and press <b>Boards</b> (team events)
- select the starting board number and the segment number
- add to the page URL :
    - <b>&new</b> to clear the logfile cache before running the script
    - <b>&add</b> to run the script without clearing the cache
- reload the page. The script will open pages for each board one-by-one and will add PBN data to the cache, until no more boards are available. Then the data will be saved in the <b>Downloads</b> folder.

Example :

Original URL : https://vugraph.lovebridge.com/screen/tbricfed/118292?screen=frequency&board=1&round=1

Modified URL : https://vugraph.lovebridge.com/screen/tbricfed/118292?screen=frequency&board=1&round=1&new<br>
or           : https://vugraph.lovebridge.com/screen/tbricfed/118292?screen=frequency&board=1&round=1&add

## Script : BBO DOM probe

Reconnaissance tool for automating the BBO **lobby** (challenge list, invitations, seating).
BBOalert only understands the table, so the lobby DOM is undocumented - this script records
what is actually there. It is read-only and never clicks anything.

- install, reload https://www.bridgebase.com/v3/ and log in
- walk the challenge flow by hand, calling `__bboprobe.mark('...')` at each step
- at each step inspect with `__bboprobe.snap()`, `.buttons()`, `.find('challenge')`, `.ws(40)`
- `__bboprobe.dump()` downloads the whole trace, including WebSocket frames, as JSON

The WebSocket capture is the important part: if BBO pushes challenge state over the socket in
readable form, a lobby driver can treat that as authoritative instead of polling the DOM -
the same design `CuebidsWithBrill` uses for the Firestore stream.

## Script : Play BBO challenges with Brill (standalone, no BBOalert)

`PlayChallengeWithBrill.user.js` plays BBO **robot** challenges without the BBOalert
extension installed. It is a GENERATED file - do not edit it:

```
node Scripts/build-challenge-userscript.js
```

It is built from `src/iframe/*` (BBOalert's DOM and observer layer), `TamperMonkey/src/shim.js`
(script dispatch for real, panel/alerting stubbed out) , `TamperMonkey/src/lobby.js` (the new
challenge sweep) and `Custom/PlayWithBrill.js` (parsed into `scriptList`). Building from
`src/iframe` rather than hand-copying means a selector fixed in the extension is fixed here on
the next build.

Auto-play is **opt-in**, like `CuebidsWithBrill`:

```js
localStorage.BRILL_CHALLENGE_AUTOPLAY = '1'   // actually enter challenges
delete localStorage.BRILL_CHALLENGE_AUTOPLAY  // back to report-only (default)
__brillChallenge.todo()    // what it thinks is playable
__brillChallenge.where()   // {list, table, details}
__brillDom.whoAmI()        // check the vendored BBOalert layer is alive
```

**It only ever enters challenges whose `c_challenge_style` is `ARENA_ROBOT`.** Human
challenges are `PK` and are ignored. See `BBO-lobby-protocol.md`.

### Browser support

Verified on **Firefox** (full: lobby entry, bidding and card play) and on **real Chrome 152**
(initialisation, the DOM layer, the observer, the 61 onDataLoad helpers, the ard.php feed and
the robot-only filter - all clean, zero page errors). Card play itself has only been run on
Firefox so far.

Nothing in the generated script is browser-specific: no `moz*`/`webkit*`, no `chrome.*` or
`browser.*`, and no `GM_*` calls (that is what `@grant none` buys). BBO's own CSP is
permissive - `script-src * 'self' 'unsafe-inline' 'unsafe-eval'` - and `'unsafe-eval'` is
required, because every script block runs through `eval()` in `userScript()`.

Note that Tampermonkey on Chrome (MV3) needs user scripts enabled in `chrome://extensions`
before any userscript runs at all; the exact toggle has moved between Chrome versions.

### Language independence

BBO's UI is localised, and the first version of the lobby driver matched the English strings
`Challenges` and `Play now!`. On a Danish BBO (`Log ind` rather than `Sign in`) it matched
nothing, harvested no challenge list, and reported "nothing to play" - **without any error**.

Fixed by not matching English text on the critical path:

- the **nav button** is found by its icon (`assets/icons/sword_attack.svg`, which menu.json
  pins to `id: "challenges"`), with a label list as fallback
- the **Play now!** button is taken positionally - `challenge-details-panel .buttonBarClass`
  holds exactly one button
- the **robot row** is identified by having no `name-tag` (a human challenge always renders
  the opponent's username), not by the word "robot"

If BBO changes the icon, override the label directly:

```js
localStorage.BRILL_CHALLENGES_LABEL = 'Udfordringer'
__brillChallenge.nav()       // what the matcher currently finds, or null
__brillChallenge.openList()  // open the challenge list without enabling autoplay
```
