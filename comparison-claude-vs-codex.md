# Claude vs Codex: "Solo dev ad-funded mobile apps" research compared

Compared on 22 October 2026. Sources: the Claude report downloaded from the cloud session (`claude-report-solo-dev-ad-funded-apps.md`) and the Codex final message extracted from thread `01a161ed-4bf7-7302-917e-8b518663ae0f` (`codex-report-solo-dev-ad-funded-apps.md`). The eleven Claude research notes were not available on this machine, so this comparison covers the two reports only.

## Short version

Both reports reach the same verdict: no idea is validated as an ad-funded business, and ads should be the free-tier wedge with a one-off purchase as the real revenue. They disagree almost completely on which ideas to test, because they ran different scopes: Codex searched global everyday niches (crafts, shifts, grocery prices); Claude searched for an Australian Android-first developer (penalty rates, caravan weights, fish limits, sound meter, expense splitter).

Claude's report is the stronger evidence base and the stronger ad model. Codex's report is the better-sized decision document and the only one with first-hand user complaints (Reddit was blocked for Claude). Neither is sufficient on its own; the useful next step is to run Codex's three finalists through Claude's validation method.

## Size and sourcing

| Measure | Claude | Codex |
|---|---|---|
| Length | 11,832 words | 3,357 words |
| Cited links | 193 (75 domains) | 40 (10 domains) |
| Play Store listings cited | 41 | 7 |
| App Store listings cited | 12 | 7 |
| Reddit threads cited | 1 (via secondary article; reddit.com blocked) | 7 (read directly) |
| Keyword volume data | Ubersuggest, one report per finalist | None |
| Incumbent MAU / revenue estimates | AppGoblin (directional) | None |
| Model cross-checks against observed earnings | Two (Settle Up, KTW) plus two forum self-reports | None |
| Blocked sources disclosed | Long list (Reddit, Google Trends, FWC, fairwork.gov.au, FRDC, ATO, AppBrain, Whirlpool) | Two (Price Cruncher 404, Pocket Knitting empty page) |
| Method | Multi-agent: four category scans, five finalist validations, tooling notes | Single agent, 25 tool calls |

## Verdicts

| | Claude | Codex |
|---|---|---|
| Headline | "Ad revenue won't carry these five apps." None validated. | "Worthwhile side income is possible, but small apps are not automatically good ad businesses." None validated. |
| Confidence | High on direction, moderate on magnitudes, low-to-moderate on ranking the two weakest ideas | Moderate |
| Monetisation shape recommended | Ads as acquisition wedge, one-off remove-ads purchase as revenue, web companion page | Ads plus optional one-time ad removal; paid features more plausible than ads for the shift tracker |
| Platform advice | Android only, Kotlin/Compose, iOS deferred until an app clears AUD 100/month | Android US$25 vs iOS US$99/year noted; no platform ordering recommended |

The verdicts match. Claude states it more firmly and backs the firmness with incumbent install ceilings (loadmate 1K+ in 40 months, FishOz 100+ in two years, PayJar one rating in four weeks).

## Idea sets barely overlap

| Idea | Claude | Codex |
|---|---|---|
| Craft pattern reader / row counter | Excluded in one line ("knitting counters" absorbed by dominant free app) | Top candidate (ease 3, commercial 3) |
| Shift / pay tracking | Penalty-rate checker is the top finalist (ease 4, commercial 2 ads / 3 with IAP); generic shift calendars excluded as 1M–10M+ incumbents | Multi-employer shift tracker is second finalist (3 / 3); incumbents Supershift, MyShiftPlanner |
| Grocery price book | Not considered (shared grocery lists excluded as OS-absorbed, a different product) | Third finalist, conditional (4 / 2) |
| Pantry / freezer inventory | Non-finalist, 4 / 3 | Excluded: data entry is the failure point |
| Expense splitter | Finalist, not validated (4.5 / 1.5) | Not considered |
| Caravan weight calculator | Finalist, not validated (4.5 / 1.5) | Not considered |
| Fish size and bag limits | Finalist, partially validated (3 / 2) | Not considered |
| Sound meter | Finalist, not validated as framed (3 / 2) | Not considered (brief named it as an example only) |
| Loyalty cards, packing lists, fuel logs, generic scorekeepers | Excluded, same reasons | Excluded, same reasons |

Where both looked at the same thing (loyalty cards, packing lists, fuel logs, scorekeepers) they agree and cite the same alternatives (Catima, Google Wallet, Apple Reminders templates, Fuelio). Only one direct contradiction exists: Codex's best idea is one Claude dismissed without evidence beyond "dominant free app". Codex's own evidence on that idea is mixed too: My Row Counter already ships most of the proposed features free, and Codex scored it only 3/5 commercially.

Claude's inclusion of the sound meter is questionable against the brief, which said sound meters were examples only and not to centre the research on them. Claude spent a full finalist slot there and concluded the differentiators already exist. Codex followed that instruction and did not touch it.

## Ad model

Both built explicit models with conservative, base and optimistic cases, counted foreground impressions only, excluded rewarded ads, used the Appodeal Q4 2024 report, and flagged it as games-framed.

| Input | Claude (base) | Codex (base) |
|---|---|---|
| eCPM source | Appodeal country tables (AU Android banner US$0.35, interstitial US$9.9); blended base banner 0.29, interstitial 6.3 | Assumed: Android banner US$0.35, interstitial US$4.00; iOS 0.40 / 5.00 |
| Interstitials | Up to 1 per session at a natural break | 0.2 per session |
| Sessions | Per finalist, 0.75 to 17 per month | 12 per MAU per month, generic |
| Fill and show haircut | 80% match x show, 0.80 seasonal | 80% fill x 85% shown |
| Exchange rate | RBA 1 AUD = 0.7010 USD on 21 Oct 2026, cited | 1 USD = AUD 1.50, stated as assumption |
| Result: AUD per 1,000 MAU per month | AUD 38 (penalty checker), AUD 8 (caravan), AUD 8 (fish), AUD 6 (sound meter), AUD 8 (splitter) | AUD 22.64 Android, AUD 26.93 iOS generic; AUD 42.84 craft reader, AUD 7.14 shift tracker, AUD 5.71 grocery book |
| MAU for AUD 500 (base) | 9,500 to 90,500 by finalist | 18,569 to 22,081 generic; 11,672 to 87,536 by finalist |
| Conservative case | 10,900 DAU for AUD 500 (roughly 40,000 to 70,000 MAU) | 1,234,568 MAU for AUD 500 |

The two models land in the same place: AUD 20 to 40 per 1,000 MAU per month for a tier-1 audience with real foreground time, and single-digit AUD for a once-a-week tool. That convergence from independent assumptions is the most useful finding of the comparison.

Differences that matter:

- Claude's eCPMs come from a cited country table and are cross-checked against AppGoblin estimates for two live apps. Codex's are round assumptions with no cross-check.
- Codex's conservative case (1.2 million MAU) is a stress test, not a scenario; Claude's conservative case is a plausible global-organic blend.
- Codex caps interstitials at 0.2 per session, which is stricter than AdMob policy requires; Claude uses the policy limit. Combined with Codex's lower interstitial eCPM this is why Codex's generic base needs twice the MAU of Claude's.
- Claude adds the AdMob AUD 100 payout threshold, Play's new Australian fee structure from 30 September 2026, GST treatment, app-ads.txt, the 16 KB page-size deadline, and a year-one cost table. Codex covers store fees, the 12-tester closed test, ATT and the EEA consent platform.
- Claude includes a RevenueCat median (US$72/month a year after launch) as the only population anchor for "typical", clearly labelled as a different model. Codex makes no typical-earnings claim at all, which the brief asked for.

## Demand tests

| | Claude | Codex |
|---|---|---|
| Form | Live web page or Play open-test build, 60 to 90 days | Recruit 12 users, observe current tools, compare clickable mockup, follow up over two to three weeks |
| Cost | Play fee plus a domain, plus build time | AUD 0 to 50 plus time |
| Measures | Organic acquisition, completion, D30 retention, sessions per week, waitlist sign-ups | Whether the problem is unresolved and whether users prefer the mockup with a banner present |
| Pass lines | Numeric, anchored to comparators (for example 500 organic installs, D30 15%, two sessions a week) | Numeric but small-sample (8 of 12 share the problem, 6 of 12 prefer the mockup) |
| Kill signals | Named per finalist (FWO adds pay calculation; iDfish adds a free tier; Splid rating decays) | Named per finalist (incumbent already handles it; users want sync or Watch) |

Codex's tests are cheaper and faster but only test whether the problem exists. Claude's tests cost a build but measure the two things the ad model actually depends on: acquisition and return use. Claude's penalty-rate test is the standout because its first stage is a static web page with no app build at all. Codex's tests are closer to the brief's "cheapest practical" wording; Claude's are closer to what would change a decision.

## Evidence standard

Both separate verified facts, estimates and hypotheses, and both treat installs and ratings as signals rather than proof.

Claude is more rigorous on access limits: every blocked primary source is named with its failure mode (403, Cloudflare, 429), snippet-only figures are labelled inline, and three premises from its own scan stage were corrected during validation (the caravan "40% overloaded" figure is recycled 2023 police data; iDfish already covers all states offline; the NIOSH microphone issue was a Bluetooth bug fixed in May 2026). Scan scores and validated scores are shown side by side, and every finalist dropped one to two points on validation.

Codex is clean but thin. Dated reviews are quoted correctly and listings are separated from user confirmation. The build-hour estimates (60 to 120, 80 to 160, 40 to 80 focused hours) are labelled as planning estimates but have no basis in cited data, which sits uneasily with the brief's instruction to avoid unsupported generalisations. Codex also notes that no council review was run, which is a disclosure Claude's report does not make either way.

Claude's weakness is the opposite one: with Reddit, Google Trends and Whirlpool blocked, its "discover problems before solutions" step relied on store reviews and autocomplete, so its demand evidence is mostly supply-side. Codex read seven Reddit threads directly and its three finalists each start from a dated user complaint.

## Fit to the brief

| Brief requirement | Claude | Codex |
|---|---|---|
| Search broadly, do not centre on sensors or audio | Four category scans; but one of five finalists is a sound meter | Twelve categories listed; no sensor ideas |
| Android and iOS separately | Yes, per finalist, plus an OS-absorption map and an iOS-without-Mac section | Yes, one summary table |
| Read sources, cite beside claims | 193 links | 40 links |
| Label snippet-only and inaccessible | Extensive | Minimal |
| Never infer "no competitor" | Explicitly applied; corrected its own scan | Applied (Price Cruncher 404 not treated as removal) |
| Ad model with explicit assumptions, three scenarios, AUD 100/500/1,000 | Yes, generic plus per finalist | Yes, generic plus per finalist |
| Revenue separate from profit | Fees, GST, payout threshold, cost table | One illustrative profit line |
| No unsupported generalisations about earnings | Only a labelled RevenueCat anchor | Build-hour estimates are unsupported |
| Decision-focused, no launch plan | Too long; the tooling section drifts toward a launch plan | Right length |
| "None validated" acceptable | Used | Used |

## Which report to trust for what

- Trust Claude for the ad economics, platform costs, compliance deadlines and the method of validating a finalist against incumbents. Its numbers are sourced and cross-checked.
- Trust Codex for user-complaint discovery and for a readable summary of why the ad model fails for quick-check utilities.
- Trust neither on the specific finalists. Codex's three were not validated at Claude's depth; Claude's five are Australia-sized or already owned by an incumbent.

## What would close the gap

1. Run Codex's craft reader, multi-employer shift tracker and grocery price book through Claude's validation method: incumbent install tiers and MAU estimates, keyword volumes, dated review text, and the per-finalist MAU model. The craft reader is the only idea either report rated as having real foreground time, so it deserves this first.
2. Give Claude's penalty-rate checker Codex's Reddit pass: search r/AusFinance, r/australia and nursing or hospitality subreddits for payslip-checking complaints. That is the one evidence channel Claude could not reach.
3. Reconcile the two models on one idea by using Claude's AU eCPM table with Codex's session assumptions. If both still land near AUD 20 to 40 per 1,000 MAU, treat that as the working planning number.
4. Retrieve the eleven Claude research notes if the per-idea evidence needs checking; the report cites them but they were not downloaded.

## Addendum: the "many cheap apps, ads on, leave them on the store" strategy

Added 22 October 2026 after the owner clarified the actual plan: build many small utilities such as sound meters, put ads on them, leave them on the store as a passive side hustle. Neither report modelled a portfolio, but both contain the evidence needed, and three Google pages were checked directly today.

**What the strategy gets right.** Android publishing is a one-off US$25. AdMob's AUD 100 payout threshold applies to the account, so ten apps earning AUD 15 each pay out monthly where one would pay out twice a year. A shared Kotlin/Compose template amortises forced releases across the portfolio. More listings mean more chances at the one outcome that actually pays in this category: a ranking breakout like Pony (273K installs in 12 months from a generic listing, per Claude's report).

**What breaks it.**

1. "Leave it" is not available. Google's target API page (checked today) says existing apps that do not move to API 35 by 31 August 2026 (extension to 1 November 2026) become unavailable to new users on newer Android versions. This recurs every year, 16 KB page-size support is mandatory for updates from 1 February 2027, and the AdMob SDK has its own major bumps. Ten apps means at least ten forced releases a year.
2. Per-app closed testing. Google's closed-testing page frames the 12-testers-for-14-days requirement around "their app", so a new personal account should expect to run it for each app.
3. Play's Repetitive Content policy (checked today) lists "creating multiple apps with highly similar functionality, content, and user experience" as a violation and tells developers to consolidate small apps into one. The Limited Functionality policy bars apps "with very little content". A shelf of thin utilities from one account is the pattern these policies describe.
4. iOS is closed to this pattern. Claude's report cites Guideline 4.3(b), which refuses new flashlight, sound-effect, wallpaper and simple-timer apps, and 4.2 minimum functionality, plus a fixed US$99 a year that needs roughly 300 sustained iOS users per app just to break even.
5. One AdMob account is a single point of failure. An invalid-traffic suspension (classically caused by testing live ads on the developer's own phone) stops revenue on every app at once.
6. Sound meters specifically: Claude found three 10M+ incumbents adding 100K to 330K installs a month, MAU at 1 to 8% of installs, head keywords closed (AppBrain counts 25,202 Tools apps with 50K+ installs), accuracy problems that drive one-star reviews, and the two long-session modes (classroom display, overnight logging) unable to carry ads under AdMob rules.

**Portfolio arithmetic.** Using Claude's sound-meter yield of US$0.0039 per MAU-month (about AUD 0.0056):

| Apps | MAU per app | Monthly revenue (AUD) |
|---|---|---|
| 10 | 500 | 28 |
| 10 | 2,000 | 111 |
| 10 | 5,000 | 279 |
| 20 | 2,000 | 223 |

Comparator: Calm dB, a genuinely differentiated free sound meter, reached about 1,400 MAU on 11K installs in roughly ten months. So 2,000 MAU per unmarketed app is an optimistic planning figure, not a conservative one. Codex's generic base (AUD 22.64 per 1,000 MAU) would give ten apps at 2,000 MAU about AUD 450 a month, but that assumes 12 sessions a month and three banners each, which curiosity utilities do not get. Codex's profit line also applies: two maintenance hours a month at AUD 50 wipes out AUD 100 of revenue.

**The version of the strategy both reports would support.** Android only. One shared template. Each app a distinct function, not a variant, to stay clear of Repetitive Content. Categories both reports mark as alive on Android with real foreground time: dice or game scorecards (20 to 40 minute sessions, banners tolerated), meter-reading logs, pantry trackers, planting calendars, spray tank-mix calculators, the AS/NZS 3008 cable calculator under a 1.0-star abandoned incumbent, and a permission-free bubble level timed against the iOS leader's paywall backlash. Banner-only plus one capped interstitial, with a AUD 1 to 2 remove-ads purchase, which Claude's review evidence shows users accept where per-turn interstitials cause uninstalls. Register the phone as a test device and never serve live ads to it. Batch all forced releases into one week a year.

Even that version is not validated. Plan for AUD 100 to 300 a month after a year of ten apps, with the breakout as upside, not as the base case.
