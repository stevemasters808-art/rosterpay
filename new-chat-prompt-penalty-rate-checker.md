Build stage 1 of an Australian award penalty-rate pay checker: a static web calculator for the General Retail Industry Award (MA000004) and the Hospitality Industry (General) Award (MA000009). This is a demand test that runs before any Android app exists. Create the project in a new folder (suggest `C:\PayCheck`) and ask me to confirm before writing files.

## Why this exists

Research on 22 October 2026 (two independent reports) found this the only small-app idea where a tier-1 audience, an uncontested store keyword and free official data coincide. About 2.6 to 2.8 million Australian workers are award-reliant. "penalty rates calculator" gets about 2,400 Australian searches a month (SEO difficulty 15) and a Google Play search for it returns no award-aware free app. The government's Record My Hours app logs hours but does not calculate pay (10K+ installs, 2.9 stars, a 2021 reviewer asked for exactly this). MyRoster is subscription-only and a September 2026 review says its overtime calculation is wrong. PayJar (iOS only, launched September 2026) does this exact scope with no Android version.

The eventual business is a free Android app with a banner ad and one interstitial after the result, a AUD 5 to 10 one-off "remove ads and export" purchase, and this web page. The web page comes first because it costs nothing to build or host and gives a numeric pass or fail in 12 weeks. Do not build the Android app in this chat.

## Step 0: feature research (two hours maximum, before any schema or code)

The viability research did not cover features. Do these four things and report back in one page before building:

1. Read the current FWO pay guide and the award summary for each award and write down, per award: the penalty windows (evening, night, Saturday, Sunday, public holiday) with percentages for full-time, part-time and casual; the overtime triggers (daily and weekly) and rates; the casual loading rule and whether it stacks with penalties; minimum engagement; unpaid break rules; junior percentages by age. Cite the clause for each.
2. Competitor teardown. Install MyRoster on Android and read its Play reviews; read PayJar's App Store screenshots and description (iOS only, cannot install); read the 20 most recent Record My Hours reviews. Produce one table: feature, which apps have it, what users praise or complain about. Note every feature users asked for that no app has.
3. User complaints. Search Reddit (r/AusFinance, r/AusLegal, r/australia, r/melbourne, r/sydney) and Whirlpool for "penalty rates app", "check my payslip", "underpaid casual" and similar, 2024 to now. List the recurring asks and the workarounds people describe (spreadsheets, PACT, asking HR). Reddit was blocked in the earlier research, so this is the first time anyone looks.
4. Data access. Check whether the FWC Modern Awards Pay Database API needs a key, and whether a free key is obtainable today. Identify one source for state and territory public holidays, including part-day and substitute holidays.

Also check how many workers sit under Retail, Hospitality and Fast Food (MA000003), and recommend whether Fast Food should join the first release, since it shares the casual workforce.

## What to build

1. One static site. Vanilla HTML, CSS and JavaScript. No framework, no build step, no backend, no accounts. Must deploy to GitHub Pages or Cloudflare Pages free tier. Everything runs in the browser.

2. Inputs: award (Retail or Hospitality), employment type (full-time, part-time, casual), classification level, age band (adult, plus the junior percentages the award defines), state or territory (for public holidays), and a list of shifts, each with date, start time, end time and unpaid break minutes. A shift may cross midnight. Pay period selector: weekly or fortnightly with a chosen start day. Shifts and settings persist in localStorage so a returning visitor finds their roster where they left it; the research says the economics only work if the tool becomes the user's shift log, and the 30-day return target depends on this.

3. Output per shift and per pay period: hours split into ordinary, evening or night, Saturday, Sunday, public holiday and overtime; the rate applied to each; casual loading handled the way the award specifies (highest applicable rate, not stacking, where that is the rule); gross total. A field "gross on your payslip" that shows the difference. Skip allowances, tax, superannuation and leave in this version.

4. Rates live in one versioned JSON file with effective-from dates. Source them from the Fair Work Commission's Modern Awards Pay Database (free, CC BY 4.0, developer.fwc.gov.au). If the API needs a key you cannot obtain, use the current Fair Work Ombudsman pay guide PDF for each award instead. Verify every number against the official pay guide before use. Minimum rates rose 4.75% from 1 July 2026, and junior rates in the Retail award begin phasing out on 1 December 2026, so confirm the current structure rather than assuming. Public holidays per state go in a second dated JSON.

5. Tests: a test page or script with at least eight worked examples taken from the FWO pay guides or the PACT calculator (ordinary weekday, late evening, Saturday, Sunday, public holiday, a midnight-crossing shift, a casual shift with loading, overtime beyond the daily or weekly limit). Each must match the official figure to the cent. This is the one runnable check the project must leave behind.

6. Legal and policy text: CC BY 4.0 attribution to the Fair Work Commission; a disclaimer that figures are estimates, the award prevails, and nothing implies FWC or FWO endorsement. Do not use "Fair Work" in the name, logo or colour scheme, because Google Play's deceptive-behaviour policy will apply when the app ships. Propose two or three names and check that the .com.au domain and the Play title are free.

7. Measurement: cookie-free analytics (Cloudflare Web Analytics or GoatCounter, both free; no consent banner is required for Australian visitors). Track four events: calculation completed, payslip comparison used, return visit within 30 days, and clicks on a "Get the Android app" button that opens a waitlist form (a free form endpoint or a Google Form link; no backend).

8. SEO: one indexable page per state or territory titled like "Penalty rates calculator NSW (Retail and Hospitality award)", all sharing the same JavaScript, each with a short plain-English explanation of that award's penalty windows and that state's public holidays.

## Pass, fail and kill at week 12 (fixed in advance, do not move them)

Pass: at least 1,000 organic sessions a month, 40% or more of sessions completing a calculation, a 30-day return rate of 15% or more, and 150 waitlist sign-ups or a 5% click-through on the app button. Only then does the Android app get built (Kotlin and Jetpack Compose, AdMob banner plus one interstitial after the result, same rules JSON).

Fail: the page ranks on page one but draws under 300 sessions a month, completion under 25%, return under 5%, or under 50 sign-ups.

Kill: the Fair Work Ombudsman adds pay calculation to Record My Hours, or PACT ships a mobile shift log.

## How to work

Lazy senior-developer mode: fewest files, no dependencies the browser does not already provide, no abstractions for one use. Ask before signing up for any service, even a free one. Order of work: first fetch the current pay guides and confirm the rate and penalty structure for both awards; then show me the JSON schema and the eight test cases; only after I confirm those, build the UI and the state pages.
