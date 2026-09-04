# BBO challenge lobby - protocol notes

Captured 2026-09-02 with `BBOprobe.user.js` driven by Playwright Firefox, account `Brill ADA`,
BBO client version 6.61.5. These notes exist because BBOalert only understands the *table*;
everything below is about the lobby, which it has never touched.

## The headline

**BBO "Challenges" are asynchronous, like cuebids** - not a synchronous head-to-head table.
Each side plays the same 8 boards on their own time, and the list shows how far each has got.
The `CuebidsWithBrill` sweep design therefore ports over almost directly.

**The challenge list has an authoritative feed - no DOM scraping required.**

## Challenge list: `POST https://webutil.bridgebase.com/v2/ard.php`

```
u=<username>&p=<sessionPassword>&cmd=l&boturl=y&v3b=web&v3v=6.61.5&v3u=BBO1&cbust=<random>
```

`sessionPassword` is a numeric session token issued at login (it also appears as
`sessionPassword=` on `webutil.bridgebase.com/v2/profile/get_profile.php`). It is **not** the
account password.

Response is XML - one `<t>` per challenge:

```xml
<tlist request_id="" err="0" gc_price="0">
  <t tid="04230b5c-a62f-11f1-8901-ac1f6b5a106e" state="RUNNING" style="CHALLENGE"
     host="veronel" title="Friend Challenge: veronel / brill ada"
     scoring="IMP" boards="8" c_challenge_style="PK"
     c_challenger="veronel"  c_boards_completed_challenger="8"
     c_challengee="brill ada" c_boards_completed_challengee="0"
     c_winner="" c_final_score_challenger="" c_final_score_challengee=""
     round_end_time="1788544828" botstyle="BASIC" fee="0" .../>
</tlist>
```

Fields that matter for a driver:

| field | use |
|---|---|
| `tid` | challenge id, stable key for cooldown/skip bookkeeping |
| `state` | `RUNNING` while playable |
| `c_challenger` / `c_challengee` | which side we are (compare to our username, lowercased) |
| `c_boards_completed_challenger` / `..._challengee` | **the "my turn" signal**: ours `< boards` means there is work to do |
| `boards` | total boards, 8 in the observed challenges |
| `scoring` | `IMP` |
| `round_end_time` | unix deadline, so a sweep can prioritise expiring challenges |
| `c_winner`, `c_final_score_*` | filled once complete |
| `fee` | `0` for both the friend and robot challenges observed |
| `c_challenge_style` | **`ARENA_ROBOT`** for a robot challenge, `PK` for a human one |

This replaces the cuebids `bellRows()` / `toSeeRows()` heuristics with a real state feed.
Compare against `CuebidsWithBrill.user.js`, which had to infer turn state from the DOM.

### Robot vs human - the safety gate

A robot challenge created from `Challenge a robot` appears in the same `tlist` as an ordinary
row, distinguished by three fields:

|  | robot | friend |
|---|---|---|
| `c_challenge_style` | `ARENA_ROBOT` | `PK` |
| `c_challengee` | `Robot` | a username |
| `boards` | 4 | 8 |

```xml
<t tid="5519fea6-a655-11f1-8901-ac1f6b5a106e" state="RUNNING" style="CHALLENGE"
   title="Robot Challenge" c_challenge_style="ARENA_ROBOT" scoring="IMP" boards="4"
   c_challenger="Brill ADA" c_boards_completed_challenger="0"
   c_challengee="Robot"     c_boards_completed_challengee="4"
   botstyle="BASIC" fee="0" host="Brill ADA" .../>
```

`c_challenge_style` is the field a driver should gate on. `PlayChallengeWithBrill` plays
`ARENA_ROBOT` whenever autoplay is on, and `PK` (a human opponent) only when
`localStorage.BRILL_ALLOW_HUMAN = '1'`.

The Brill account is a **declared robot** - it says so in its BBO profile - so opponents who
challenge it know what they are playing. The separate opt-in is about deliberateness rather
than permission: it stops a reinstall, a cleared autoplay flag, or a copy of the script on a
different account from quietly playing against people. Being a server-supplied field rather
than a heuristic, the gate cannot silently drift the way a DOM-based check would.

Note `c_boards_completed_*` is per side and reads from *our* perspective once we work out
whether we are `c_challenger` or `c_challengee` (compare lowercased usernames - BBO returns
`"Brill ADA"` in some fields and `"brill ada"` in others). "My turn" is
`ours < boards`. In the robot challenge the robot's 4 boards are already banked before we
start, which is how the arena format works.

## DOM, for clicking only

The list screen is `challenge-list-screen` containing `challenge-list-item` elements:

```
<challenge-list-item>
  <div.itemClass>
    <div.titleClass  "IMPs Challenge Vs"
    <name-tag> ... <span.mat-button-wrapper "veronel">
    <img.statusImageClass src="dot.green.png">
```

Note the state is an **image name** (`dot.green.png`), not a class or text - which is exactly
why the probe's skeleton was extended to print `src`. Prefer `ard.php` for state and use the
DOM only as a click target.

### Entry chain: lobby -> table

Three clicks, each verified:

```
1. button.bbo-phx-navigation           text "Challenges <n>"   -> challenge-list-screen
2. challenge-list-item div.itemClass                           -> challenge-details-panel
                                                                  (inside modal-content)
3. challenge-details-panel .buttonBarClass button
                                       text "Play now!"        -> seated at the table
```

Step 2 does **not** seat you - it opens a details modal with four `div.detailItemClass` rows
and a single `Play now!` button. Anything automating this must expect the modal; treating the
row click as "entered" would leave the driver waiting for a table that never appears.

Per the account owner: a board can always be started, and leaving mid-challenge returns you
where you left off - so a driver may abandon a board without forfeiting it.

Lobby navigation button: `button.bbo-phx-navigation` with text `Challenges <n>`; it carries
`.highlight` when `n > 0`. Creation buttons on the challenge screen are
`phoenix-small-navigation-button > button.bbo-phx-button.secondary`, with texts:
`Challenge a friend`, `Challenge a stranger`, `Challenge a robot`, `Challenge a star`,
`Group Challenge`, `ACBL Challenge`, `Challenge Reward - Micro`, `Challenge Reward - Low Stakes`.

## Daylong tournaments - not in the feed, read from the screen

The lobby's competitive area lists free daylongs. Captured live 2026-09-04, English UI:

```
Title                                                            | Entries | Starts   | Entry fee
BBO       Free Just Declare Daylong (MP) - 2026-09-04 - 8 boards..| 17262   | Play now | Free
BBO       The 7 Tricks Challenge - Daily (Beginner) - Sep 04 ....| 167     | Play now | 0.10 BB$
Lorserker Ben & Friends Daily - 2026-09-04 - 8 boards, Ind., MPs | 280     | Play now | (Registered)
Lorserker Ben & Friends Just Declare - 2026-09-04 - 16 boards....| 278     | Play now | (Registered)
Lorserker Ben & Friends Defend - 2026-09-04 - 16 boards, Ind.,MPs| 146     | Play now | (Registered)
BBO       10 min Free Robot Sprint - 10 min, Ind., Total points..| Full    | 1 min    | Free
```

**They are not in the `ard.php` `tlist`.** With the list on screen and the harvester widened to
sniff *every* text XHR/fetch response for the literal `<tlist` (it no longer filters on the
ard.php URL, and announces each new source once - `__brillChallenge.sources()`),
`__brillChallenge.tourneys()` stayed empty. So `ard.php` serves challenges only, and the
daylong list arrives some other way - a JSON API, the game socket, or Angular state. Worth a
`BBOprobe` capture if a wire-level driver is ever wanted.

Until then the **DOM is the source of truth for dailies**, which the layout above makes
reasonable: every row carries its own `Play now`, the fee column distinguishes free from
`0.10 BB$`, `Full` marks an unenterable one, and a `Registered` badge shows where the account
is already entered. `lobby.js` therefore:

- finds the leaf elements whose text is exactly `Play now` (override:
  `BRILL_PLAY_NOW_LABEL`), then climbs at most six levels to the nearest ancestor that also
  contains an allowlisted title - "the row" without needing this screen's tag names;
- skips any row priced in `BB$`, and any marked `Full`;
- takes the title as everything before the `-` bullet, which includes the date, so each day
  is correctly its own key;
- clicks the row's own `Play now`. There is no nav step and no modal in this path.

Entering costs one click, and the row keeps saying `Play now` when the tournament is
finished - nothing in it reads "8 of 8 played". The guard is therefore behavioural: three
entries that never reach a table and the daily is left alone for an hour
(`DAYLONG_MAX_MISSES`, `DAYLONG_DONE_COOLDOWN`), reset as soon as one does seat us.

The `tlist`-shaped daylong path (nav button by icon, row by title, entry button in a modal)
is still in the file for the day BBO does serve them there; nothing has exercised it.

## The game WebSocket

`wss://v3proxysl<N>.bridgebase.com/` - the main client protocol, and it is fully readable:

- **client -> server**: text frames, `cs_<command>` followed by `key=value` pairs separated by
  `\x01`, with an incrementing `m1=<seq>`. Observed: `cs_login`, `cs_dump_fe`,
  `cs_get_user_details`, `cs_scan_reservations`, `cs_ping`.
- **server -> client**: sent with the **binary** opcode but **not compressed** - plain XML
  `<sc_...>` elements. Observed: `sc_loginok`, `sc_stats`, `sc_sbconfig`, `sc_privacy`,
  `sc_u_stats`, `sc_membership_tier`, `sc_feed`, `sc_user_details`, `sc_init_complete`,
  `sc_dump_fe`, `sc_send_keepalive`.

Anything hooking this must handle Blob/ArrayBuffer, not just string frames.

**The challenge list does not travel over this socket** - it is the `ard.php` POST above.
`api.bridgebase.com/notifications` is a separate SignalR socket (JSON handshake
`{"protocol":"json","version":1}`, `{"type":6}` pings); it was not observed carrying challenge
state, but it is the likely place for push notifications and deserves a longer capture.

## Credentials handling - read before capturing more

BBO moves the account password around in cleartext (inside TLS) in **four** shapes. Any capture
tooling must redact all of them, and `bbo_recon.py`'s `SECRETS` list does:

1. `cs_login ... password=<pw>\x01` over the game socket
2. `POST https://bbo-api.bridgebase.com/authenticate` with `{"username":..,"password":".."}`
3. webutil form posts, e.g. `rd_listmail.php` with `password=<urlencoded>`
4. `sessionPassword=<digits>` / `p=<digits>` session tokens, plus the bearer JWT from
   `/authenticate` (also placed in the notifications socket URL)

A first pass at redaction assumed `key=value&key=value` and silently missed (1), because the
separator is `\x01`. Verify redaction by grepping the artifacts for the literal password.

## Porting PlayWithBrill out of BBOalert - the traps

Building the standalone `PlayChallengeWithBrill.user.js` hit five failures. Every one was
**silent**: the page looked healthy, hooks fired, no error appeared, and nothing bid. Listed
in the order a future port will meet them.

1. **`scriptList` gets wiped.** `initGlobals()` (globals.js) does `scriptList = []`, and the
   observer calls it on several transitions. Under the extension the alert data reloads
   immediately after; standalone there is nothing to reload, so the play engine vanishes.
   Fixed by wrapping `initGlobals`.

2. **`onNavDivDisplayed()` throws.** It is BBOalert's panel bootstrap (`setUI`,
   `addBBOalertTab`, `restoreSettings`, `openMessageTab`, ...). `restoreSettings()` reads
   `$("#bboalert-menu-settings")[0]`, which does not exist without the panel. It is called
   from BBOobserver's startup interval *before* `clearInterval` and `observer.observe()`, so
   the throw meant **the MutationObserver never started** and no hook ever ran. Worse, the
   interval then re-ran every 100ms - including `openMessageTab()` - hammering
   `rd_listmail.php` into HTTP 429s and making BBO's Mail tab flash. One bug, two symptoms.
   Fixed by overriding `onNavDivDisplayed` in the shim.

3. **`onDataLoad` is never dispatched.** PlayWithBrill's `onDataLoad` block *defines 61
   helper functions* - `getCardByValue`, `makeBid`, `BrillsTurnToBid`, everything that talks
   to Brill.Service. The extension dispatches it when alert data finishes loading; with no
   data load it never fires and every play hook hits undefined functions. Call
   `execUserScript('%onDataLoad%')` explicitly.

4. **Missing globals from the non-vendored files.** `foundContext`, `foundCall`,
   `trustedBid` (BBOalert.js) and `inputOnKeyup`, `inputChanged`, `toggleOptions`,
   `getDataType`, `findAlert`. `execUserScript` reads `foundContext` on its *first* call,
   inside the observer bootstrap - so the whole thing died before starting.
   `Scripts/check-shim.js` now catches these at build time. It deliberately checks bare
   identifier **references**, not just call sites: `inputOnKeyup` is assigned as a value
   (`elMessage.onkeyup = inputOnKeyup`) and a call-only scan misses it.

5. **The IIFE breaks PlayWithBrill's override mechanism.** This is the subtle one.
   PlayWithBrill customises BBOalert by assigning `window.<name> = function ...` - seven of
   them: `getCard`, `getActivePlayer`, `mySeat`, `onNewAuction`, `onNewActivePlayer`,
   `onAuctionBoxHidden`, `onDummyCardsDisplayed`. Under the extension its blocks are eval'd
   at **global scope**, so those assignments genuinely replace the functions the observer
   calls. Wrapped in an IIFE they land on `window` while the observer keeps calling the
   IIFE-scoped originals - installed, never invoked.

   That is not cosmetic. `window.onNewAuction` is what calls `onNewState`, which is what
   calls `onMyTurnToBid`. Without it the hand is dealt, the bidding box appears, every hook
   logs cleanly - and nothing ever bids. `lobby.js` rebinds those six names to prefer the
   `window` version at call time (function declarations are mutable bindings, so the
   vendored call sites pick the wrapper up).

Related: `onAuctionBegin` only fires when the auction box appears with `getContext() == ''`,
so a driver that joins **mid-auction** never sees it. The recurring bid driver is
`onNewAuction` (item 5), not `onAuctionBegin`.

### `c_boards_completed_*` lags the final board

Both robot challenges were observed sitting at `3/4` in the `tlist` after all four boards had
actually been played. The count appears to settle only once the match is recorded as finished,
so `done < boards` is **not** a reliable "still has work" signal at the end of a challenge.

A driver must therefore not treat a non-advancing count as a reason to re-enter: `lobby.js`
records the board count on entry and applies a cooldown if it has not moved within
`LOBBY.stallMs`, which is what stops it re-entering a match it has already completed.
