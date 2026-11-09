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

Auto-play is **opt-in**, like `CuebidsWithBrill`. A small **Brill** pill at the bottom right of
the page shows the mode; click it to cycle **Off -> Dailies -> Bridge Master**:

- **Off** - the driver does nothing (Brill still plays any table you sit it at). The default.
- **Dailies** - robot challenges and the allowlisted daylongs, as described below. Switched on
  at a Bridge Master table, it finishes the problem in progress and goes back to the lobby.
- **Bridge Master** - goes to Practice and, once you open a deal, works through the problems
  with Next deal. Never leaves a challenge in progress to get there. The pill shows the
  score for the level, e.g. `Brill: Bridge Master  12/18`.

```js
__brillChallenge.mode()            // 'off' | 'tourneys' | 'bm'
__brillChallenge.mode('dailies')   // same as clicking the pill
__brillChallenge.mode('bm')
__brillChallenge.mode('off')
localStorage.BRILL_HIDE_SWITCH = '1'  // no pill
__brillChallenge.todo()    // what it thinks is playable
__brillChallenge.where()   // {list, table, details}
__brillDom.whoAmI()        // check the vendored BBOalert layer is alive
```

Opponents:

```js
localStorage.BRILL_ALLOW_HUMAN = '1'   // also play PK (human) challenges
delete localStorage.BRILL_ALLOW_HUMAN  // robot challenges only (default)
__brillChallenge.allowHuman()          // current state
```

Robot challenges (`c_challenge_style` `ARENA_ROBOT`) play whenever autoplay is on. Human
challenges (`PK`) need the extra flag - a deliberate second switch, so turning the driver on
never by itself starts it playing against people. The console names the opponent before
entering, e.g. `entering HUMAN challenge vs veronel 0224e851`. See `BBO-lobby-protocol.md`.

### Daylong tournaments ("the dailies")

The free daylongs are the same asynchronous shape as a challenge - 8 or 16 boards against
robots, at your own pace, resumable - so once seated the play engine is unchanged.

They are **not** in the `ard.php` feed (verified live: `tourneys()` stays empty with the list
open), so the driver reads the tournament screen itself: it finds each row's own `Play now`
link, climbs to the row, and clicks - then presses **PLAY** on the tournament
page that opens, which is what actually seats you. Which rows it may click is an allowlist, matched as a
case-insensitive substring of the row text - title *and* host badge:

```js
__brillChallenge.daylongs()                              // current list
__brillChallenge.daylongs(['ben & friends'])             // the default
__brillChallenge.daylongs(['lorserker', 'free daylong']) // by host, plus BBO's own
__brillChallenge.daylongs(false)                         // no tournaments at all
__brillChallenge.daylongs('default')                     // back to the default
__brillChallenge.onScreen()                              // rows it can see right now
__brillChallenge.openTourneys()                          // click the tournament nav button
```

`ben & friends` is the default because that series is hosted for bots - that is the point of
it. BBO's own Free Daylong is a general competitive event scored against a human field, so it
is not included until you name it. Two hard guards ignore the allowlist entirely: a row
priced in **BB$** is never clicked, and neither is one marked **Full**.

**It only sees the rows while the tournament list is on screen**, so the first time, open
that list by hand (or call `openTourneys()`). The driver remembers the URL it saw the rows at
(`localStorage.BRILL_DAYLONG_LIST_URL`) and from then on gets there itself, through the app's
own router - no guessing at the uncaptured nav button. The Challenges list is home:

- a daily whose row is **on screen** is played before any challenge - it is one click away,
  and leaving for a challenge used to mean never coming back to it;
- otherwise challenges come first;
- with nothing to play on Challenges it goes to the dailies when one it saw last time is not
  yet finished (and every 10 minutes regardless, to catch the next day's), and it comes
  back to Challenges after 20 idle seconds anywhere else.

A tournament page that shows no **PLAY** button for 10 seconds is a finished daily: it is left
for an hour and the driver moves on to the next one.

```js
__brillChallenge.dailyUrl()        // {url, broken, known, lastLook}
__brillChallenge.dailyUrl(null)    // forget it; the next visit to the list re-learns it
```

If the router trick ever stops working, the first failed trip says so in the console and it is
switched off for the session - back to playing dailies only while the list is on screen.

Two things used to drag the screen back to Challenges within seconds of the list coming up,
and both now back off: a challenge the feed still calls unfinished but whose row is gone is
confirmed on the same visit (a second look 3s later, not a minute later), and one that
enters without the board count moving is left 1, 2, 4, 8 and then 15 minutes.

A finished daily still shows `Play now` and nothing in the row says "8 of 8 played", so the
stop condition is behavioural: three entries that never reach a table and the tournament is
left alone for an hour, reset the moment one does seat us.

If a row is not being picked up, `__brillChallenge.onScreen()` says what the scanner matches,
and the idle log line says why it is being skipped:

```js
localStorage.BRILL_DAYLONGS          = 'ben & friends, free daylong'
localStorage.BRILL_PLAY_NOW_LABEL    = 'Spil nu'        // if the UI is not English
localStorage.BRILL_TOURNAMENTS_LABEL = 'Turneringer'    // the nav button, for openTourneys()
```

### Which bidding system the server uses

Every deal-bidding endpoint (`/bid`, `/lead`, `/play`, `/claim`, `/pbn/finalize`) takes
`nsSystem=` / `ewSystem=`, and defaults **both to Brill** when they are absent. At a BBO table
that default is wrong: Brill drives one seat and the other three are BBO's own robots, so
partner's bids arrive in GIB's system and ours have to be understandable to a GIB partner.
Reading that auction through Brill's rules is how a convention the table never played comes
back as the meaning of a bid.

Both sides are therefore sent as **GIB** by default. Overrides, for a mixed table:

```js
localStorage.BRILL_SYSTEM    = 'GIB'    // both sides (the default when unset)
localStorage.BRILL_NS_SYSTEM = 'Brill'  // our side only
localStorage.BRILL_EW_SYSTEM = 'BEN'    // opponents only
localStorage.BRILL_SYSTEM    = ''       // send neither - the server falls back to Brill
```

**The host has to actually have that system.** A name it cannot resolve falls back to Brill
server-side, with a warning on the service console and nothing in the response - the client
cannot tell the difference. A host lists what it has at `GET /systems`, and the deployed
engines answer `["Brill"]` only: their image is built with `-p:IncludeOpponentSystems=false`,
which leaves the nine ~263 MB `*.system.bin` files out (a 4.36 GB image against 450 MB). Until
`GIB.system.bin` is dropped into the container's `/app`, this parameter is accepted and
quietly ignored.

### Which seats are "external"

Every call to the server also sends `external=` - the seats whose bids came from a human or
another engine. The sampler then treats the points it infers from their bids as **soft**
constraints instead of exact Brill ranges. At a BBO table that is every seat but ours (partner
and opponents are BBO robots); in Bridge Master it is all four, because BBO wrote the whole
auction.

Without it the live service and GuiApp disagreed on the same position. GuiApp sends
`external=`; the userscript did not. Bridge Master Level 1 B-30 (4S, DK lead) showed it:
without `external`, D2 led SQ by 0.19 IMP, inside the 0.3 planning gap, so the planner's
"draw trump" played SQ and went down. With `external=EW` it is D2 3.15 IMP / 92% against SQ
1.56 / 83%, as GuiApp showed.

```js
localStorage.BRILL_EXTERNAL = 'EW'   // override
localStorage.BRILL_EXTERNAL = ''     // send none
delete localStorage.BRILL_EXTERNAL   // automatic (default)
```

### Playing to make the contract (Bridge Master)

Bridge Master scores a problem only as made or failed. On Bridge Master tables the script
sends `objective=make`, so the server ranks cards by how often they make the contract:
overtricks are worth nothing. With normal IMP scoring Brill gave up make chance for
overtricks. In Level 1 B-18 (6NT) it cashed DK (4.13 IMP, 70%) instead of starting clubs
(1.97 IMP, 73%), which used up dummy's last way back to hand. This needs a Brill.Service build
that knows `objective=make`; an older server ignores the parameter.

```js
localStorage.BRILL_OBJECTIVE = 'make'    // every table
localStorage.BRILL_OBJECTIVE = 'score'   // never, not even Bridge Master
delete localStorage.BRILL_OBJECTIVE      // automatic (default)
```

### Background tabs and timer throttling

Everything the script does is timer-driven - the 2s lobby tick, the settle delays, the play
engine's `waitFor()` polling and its card clicks - and Firefox throttles timers in a hidden
tab. Measured against Brill.Service's `/timings` CSV over one daylong session:

| tab | gap between `/play` calls |
|---|---|
| hidden | median **40.7s**, one **396s** hole at a board boundary |
| visible | median **2.4s** (the all-time median is 2.2s over 1816 calls) |

Service time was unaffected throughout - median 357ms, p90 1.6s - so the delay was purely the
browser sitting on our callbacks.

**Keep the BBO tab visible.** That is the fix. A separate window works as well as a separate
tab as long as it is not minimised. If you need it hidden, Firefox's `about:config` has the
switches: `dom.min_background_timeout_value` = `100` and
`dom.timeout.enable_budget_timer_throttling` = `false`.

#### Why not just move the timers into a Worker

Worker timers are not throttled, and the script does shadow
`setTimeout`/`setInterval`/`clearTimeout`/`clearInterval` inside its own IIFE to route delays
through one - the shadowing reaches PlayWithBrill too, because `userScript()` runs each block
through a **direct** `eval()` that inherits the enclosing scope. BBO's own page code keeps the
native timers.

**On BBO it does not currently work**, and the reason is in the page's own CSP meta tag:

```
default-src *; script-src * 'self' 'unsafe-inline' 'unsafe-eval'; ...
```

There is no `worker-src` or `child-src`, so worker scripts fall back to `script-src` - and `*`
does not match the `blob:` scheme. `new Worker(URL.createObjectURL(...))` therefore constructs
without throwing and then never loads, which is the worst possible shape for a failure: the
worker accepts every `postMessage` and answers none. Shipped that way in 0.7.0 it stopped the
lobby tick, the observer bootstrap and the play engine outright, with nothing in the console
but silence.

So the worker is now **probed before it is trusted**: one round-trip message with a 2s deadline,
plus an `onerror` handler. Either failing tears the worker down, re-arms every pending timer on
native ones and says so once in the console. The code stays because it costs nothing and would
start working the day BBO adds `blob:` to `script-src`; today it always falls back.

```js
__brillChallenge.timers()      // {mode: 'worker' | 'native (...reason...)', pending, hidden}
__brillChallenge.timerTest()   // schedules 5s - switch tabs, see how late it fires
```

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

### Bridge Master

Open **Practice > Bridge Master** (`/v3/app/lv/practice`), pick a level and start a deal. Brill
declares, and when a problem is over the driver presses **Next deal** by itself.

That table has no vulnerability panel, which is where the board number normally comes from, so
there was no dealer and every `/play` failed with 400 "Invalid dealer". On that screen
`getDealNumber()` now returns a synthetic number: the dealer is worked back from the auction
(you are always declarer), vulnerability is None (the screen does not show it), and the problem
id ("Level 3 A-1") keeps each problem distinct. Scoring is sent as IMPs, since only making the
contract counts.

A problem counts as over when the text of BBO's end panel changes (the panel itself is on
screen from the start), when the play engine finishes the deal,
or, as a fallback that is logged loudly, when nothing has moved for 60 seconds.

```js
__brillDom.bridgeMaster()                    // id, auction, declarer, dealer, deal number
localStorage.BRILL_BM_AUTONEXT  = '0'        // stay on each problem (default: move on)
localStorage.BRILL_BM_NEXT_LABEL = 'Næste'   // if the button is not "Next deal"
```

At the end of a set, Next deal stops moving on; the console says so, and you choose the next
set with **Select deal**.

#### Results

Every problem's result is kept in `localStorage.BRILL_BM_RESULTS`: made / failed, the attempt
count, the auction, Brill's play and BBO's end text. Bridge Master counts the **first** attempt,
so that one is kept separately; a retry after reading the solution does not turn a failure into
a success.

```js
__brillDom.bmResults()          // per level: played, made, failed, % (first attempts)
__brillDom.bmResults(1)         // every level-1 problem played
__brillDom.bmExport()           // download it all as JSON
__brillDom.bmMark('1 A-4', 'made')   // correct one by hand
__brillDom.bmReset()            // start over
```

Made/failed is read from the wording of BBO's end panel. Text the patterns do not recognise is
stored as `unknown`, with the text itself, and the console line says so.

#### Settings panel (the gear next to the pill)

- **Engine server.** Brill, Brill on this PC, BEN on this PC (`http://localhost:8085`), or any
  other server that implements the Seat Robot API (`GET /bid`, `/lead`, `/play`, as BEN does),
  with an optional bearer token. **Test** sends `GET /` and shows the status, which also catches
  a missing CORS header. `/claim` and `/pbn/finalize` exist only on Brill, so on another server
  the opponents' claims are declined and the board is kept only in the browser's record. Each
  result records the server it was played with, so engines can be compared.
- **Statistics.** First-attempt score per level, and the whole record as CSV or JSON.
- **Replay failed.** Opens each failed problem again, one after another (all levels or one;
  failed the first time, or still failing). It sets BBO's `<user>_bm_level` / `<user>_bm_deal`
  and reloads; open Bridge Master and the problem is the selected deal. Only problems played
  with 0.14 or later can be replayed, since that is when the problem's BBO key is recorded.
  BBO still scores the first attempt; the replay result goes in the record's `last` field.
- **Reset BBO's Bridge Master stars.** Clears BBO's server-side record (`bm_results`, via
  `ud_api.php`) and reloads the page. It reuses the session details from BBO's own call, so
  open the Bridge Master dialog once after logging in first.
