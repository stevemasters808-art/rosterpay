"""Writes index.html, one page per state/territory, and sitemap.xml from one template.
Run after editing the template or holidays.json:  python build-pages.py
Deploy output is static; this script is not needed on the server."""
import json, html, datetime, hashlib

def v(fn):
    """Short content hash so browsers fetch new JS and CSS after a deploy (GitHub Pages caches for 10 minutes)."""
    return hashlib.sha1(open(fn, "rb").read()).hexdigest()[:8]


SITE = "https://stevemasters808-art.github.io/rosterpay"
H = json.load(open("holidays.json", encoding="utf-8"))
R = json.load(open("rates.json", encoding="utf-8"))

STATES = {
    "NSW": ("New South Wales", "nsw", "NSW has 13 public holidays a year. Labour Day is the first Monday in October. Australia Day, Anzac Day and Christmas are moved or doubled when they fall on a weekend, so a shift on the Monday after can attract public holiday rates. The August Bank Holiday is not a public holiday for retail or hospitality workers."),
    "VIC": ("Victoria", "vic", "Victoria adds two holidays other states do not have: the Friday before the AFL Grand Final (late September, date set each year) and Melbourne Cup Day (first Tuesday in November, some regional areas substitute a local show day). Labour Day is the second Monday in March. Easter Saturday and Easter Sunday are both public holidays."),
    "QLD": ("Queensland", "qld", "Queensland's Labour Day is the first Monday in May and the King's Birthday is the first Monday in October, later than most states. Christmas Eve is a part-day public holiday from 6pm to midnight, so an evening shift on 24 December is paid at public holiday rates from 6pm. Royal Queensland Show day (the Ekka, second Wednesday in August) applies to the Brisbane area only; other regions have their own show days."),
    "WA": ("Western Australia", "wa", "Western Australia's Labour Day is the first Monday in March, WA Day is the first Monday in June, and the King's Birthday is in late September (some regional towns pick a different date). Easter Saturday is not a public holiday in WA, so Saturday rates apply, but Easter Sunday is. Christmas and Boxing Day are doubled when they fall on a weekend."),
    "SA": ("South Australia", "sa", "South Australia has Adelaide Cup Day (second Monday in March) and Proclamation Day (26 December, instead of Boxing Day). Christmas Eve and New Year's Eve are part-day public holidays from 7pm to midnight, so an evening shift on either day is paid at public holiday rates after 7pm. Easter Saturday is a public holiday."),
    "TAS": ("Tasmania", "tas", "Tasmania's Eight Hours Day is the second Monday in March. Easter Saturday and Easter Sunday are not public holidays in Tasmania, so weekend rates apply, while Easter Tuesday is generally public-service only. Regional show days (Royal Hobart Regatta, Royal Hobart Show, Recreation Day and others) apply only in parts of the state; tick the regional option if yours applies."),
    "ACT": ("Australian Capital Territory", "act", "The ACT has Canberra Day (second Monday in March) and Reconciliation Day (late May or early June), which no other state observes. Easter Saturday and Easter Sunday are both public holidays. Anzac Day, Christmas Day and Boxing Day are doubled with an extra Monday when they fall on a weekend."),
    "NT": ("Northern Territory", "nt", "The Northern Territory has May Day (first Monday in May) and Picnic Day (first Monday in August). Christmas Eve and New Year's Eve are part-day public holidays from 7pm to midnight, so evening shifts on those days attract public holiday rates after 7pm. Regional show days (Darwin, Alice Springs, Katherine, Tennant Creek, Borroloola) apply only locally."),
}

def holiday_list(code):
    out = []
    for h in H["states"][code]:
        try: d = datetime.date.fromisoformat(h["date"]).strftime("%a %d %b %Y").replace(" 0", " ")
        except Exception: d = h["date"]
        flag = ""
        if h.get("from"): flag = f' <span class="flag">(from {int(h["from"][:2]) - 12}pm)</span>'
        elif h.get("regional"): flag = f' <span class="flag">(regional: {html.escape(h["regional"])})</span>'
        out.append(f"<li>{d}: {html.escape(h['name'])}{flag}</li>")
    return "\n".join(out)

def state_options(sel):
    return "\n".join(f'<option value="{c}"{" selected" if c == sel else ""}>{STATES[c][0]}</option>' for c in STATES)

def nav(current):
    links = [f'<a href="./">All states</a>' if current else '<a href="./" aria-current="page">All states</a>']
    for c, (name, slug, _) in STATES.items():
        cur = ' aria-current="page"' if c == current else ""
        links.append(f'<a href="{slug}.html"{cur}>{c}</a>')
    return "\n".join(links)

def page(code):
    if code:
        name, slug, blurb = STATES[code]
        title = f"Penalty rates calculator {code} (Retail and Hospitality award) | RosterPay"
        desc = f"Free {name} penalty rates calculator for the General Retail and Hospitality awards. Evening, weekend, public holiday and overtime pay for your shifts at 1 July 2026 rates, with {code} public holidays built in."
        h1 = f"Penalty rates calculator {code}"
        url = f"{SITE}/{slug}.html"
        state_section = f"""
<h2>Public holidays in {name}</h2>
<p>{blurb}</p>
<p>Public holidays used by this calculator for {name} (2026 and 2027, from the Fair Work Ombudsman's list):</p>
<ul class="holidays">
{holiday_list(code)}
</ul>"""
    else:
        name, slug, blurb = "Australia", "index", ""
        title = "Penalty rates calculator: Retail and Hospitality award | RosterPay"
        desc = "Free Australian penalty rates calculator for the General Retail and Hospitality awards. Evening, Saturday, Sunday, public holiday and overtime pay for your shifts at 1 July 2026 rates. Compare with your payslip."
        h1 = "Penalty rates calculator"
        url = f"{SITE}/"
        state_section = """
<h2>Public holidays by state</h2>
<p>Each state and territory sets its own public holidays, and some have part-day holidays or regional show days. Pick your state above, or open your state's page for its holiday list and notes: """ + ", ".join(f'<a href="{s}.html">{c}</a>' for c, (_, s, _) in STATES.items()) + "</p>"
    retail = R["awards"]["MA000004"]["rates"][0]["hourly"]; hosp = R["awards"]["MA000009"]["rates"][0]["hourly"]
    return f"""<!doctype html>
<html lang="en-AU">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{html.escape(desc)}">
<link rel="canonical" href="{url}">
<meta name="google-site-verification" content="qCf1_iqAammzVCyLBNmHFTyJg-XhXHJGURxZAkp4Vco">
<link rel="icon" href="img/favicon.svg" type="image/svg+xml">
<meta property="og:title" content="{html.escape(title)}">
<meta property="og:description" content="{html.escape(desc)}">
<meta property="og:url" content="{url}">
<meta property="og:type" content="website">
<meta property="og:image" content="{SITE}/img/og-image.jpg">
<meta name="twitter:card" content="summary_large_image">
<link rel="stylesheet" href="style.css?v={v("style.css")}">
<script type="application/ld+json">{{"@context":"https://schema.org","@type":"WebApplication","name":"RosterPay penalty rates calculator","url":"{url}","applicationCategory":"FinanceApplication","operatingSystem":"Any","offers":{{"@type":"Offer","price":"0","priceCurrency":"AUD"}},"description":"{html.escape(desc)}"}}</script>
</head>
<body data-state="{code or ''}">
<header class="top">
<a class="brand" href="./"><img src="img/favicon.svg" alt="" width="24" height="24">RosterPay</a>
<nav aria-label="States">
{nav(code)}
</nav>
</header>
<main>
<h1>{h1}</h1>
<p class="lede">What the Retail or Hospitality award says your shifts are worth, at the rates from 1 July 2026. Estimate only. Free, no sign-up, nothing leaves your browser.</p>

<form id="calc" novalidate>
<fieldset>
<legend>Your job</legend>
<div class="grid">
<div class="wide"><span class="label" id="awardLabel" style="font-weight:600">Award</span>
<div class="choices" role="radiogroup" aria-labelledby="awardLabel">
<label><input type="radio" name="award" value="MA000004" checked> Retail (MA000004)</label>
<label><input type="radio" name="award" value="MA000009"> Hospitality (MA000009)</label>
</div></div>
<div class="wide"><span id="empLabel" style="font-weight:600">Employment type</span>
<div class="choices" role="radiogroup" aria-labelledby="empLabel">
<label><input type="radio" name="employment" value="ft" checked> Full-time</label>
<label><input type="radio" name="employment" value="pt"> Part-time</label>
<label><input type="radio" name="employment" value="casual"> Casual</label>
</div>
<div id="ptHours" hidden><label for="agreedWeeklyHours">Agreed hours per week<small>From your part-time agreement. Hours above this are overtime. Leave blank to use 38.</small></label><input type="number" id="agreedWeeklyHours" min="1" max="38" step="0.5"></div>
</div>
<div><label for="level">Classification level<small>On your contract or payslip. Not sure? Level 1 is the most common.</small></label><select id="level"></select>
<p class="hint" id="juniorLevelNote" hidden>Junior rates only apply at Retail levels 1 to 3. At this level the adult rate is used.</p></div>
<div><label for="age">Age<small>Junior rates are a percentage of the adult rate.</small></label><select id="age"></select>
<label class="check" id="over6mWrap" hidden><input type="checkbox" id="over6m"> More than 6 months with this employer<small>Changes the rate for 18 to 20 year olds in Retail, including the phase-in from 1 December 2026.</small></label>
<label class="check" id="liquorWrap" hidden><input type="checkbox" id="liquor"> I serve alcohol (liquor service)<small>Hospitality juniors who serve liquor are paid the adult rate.</small></label>
</div>
<div><label for="state">State or territory<small>Sets which public holidays apply.</small></label><select id="state">
{state_options(code or "NSW")}
</select>
<label class="check"><input type="checkbox" id="regional"> Include regional and local public holidays<small>Show days, Hobart Regatta, Ekka (Brisbane) and similar.</small></label></div>
<div id="retailOpts" class="wide">
<label class="check"><input type="checkbox" id="lateTrading"> My store trades after 9pm on weekdays or after 6pm on weekends<small>Lets ordinary hours run until 11pm instead of counting them as overtime.</small></label>
<label class="check"><input type="checkbox" id="elevenHourDay"> My roster allows one 11-hour day a week<small>Otherwise ordinary hours stop at 9 a day and the rest is overtime.</small></label>
</div>
</div>
</fieldset>

<fieldset>
<legend>Pay period</legend>
<div class="grid">
<div><span id="ppLabel" style="font-weight:600">Length</span>
<div class="choices" role="radiogroup" aria-labelledby="ppLabel">
<label><input type="radio" name="periodWeeks" value="1" checked> Weekly</label>
<label><input type="radio" name="periodWeeks" value="2"> Fortnightly</label>
</div></div>
<div><label for="periodStart">First day of the pay period<small>Weekly overtime (over 38 hours) is counted from this day.</small></label><input type="date" id="periodStart"></div>
</div>
</fieldset>

<fieldset>
<legend>Shifts</legend>
<p class="hint">Enter each shift you worked or were rostered. A shift can finish after midnight.</p>
<table class="shifts" id="shifts">
<thead><tr><th>Date</th><th>Start</th><th>Finish</th><th>Unpaid break (min)</th><th><span class="sr-only">Remove</span></th></tr></thead>
<tbody></tbody>
</table>
<button type="button" class="btn btn-ghost" id="addShift">Add another shift</button>
</fieldset>

<fieldset>
<legend>Before you calculate</legend>
<div class="grid">
<div><span id="eaLabel" style="font-weight:600">Does an enterprise agreement cover your workplace?</span>
<p class="hint">Big employers often have one. It would be named on your payslip or contract.</p>
<div class="choices" role="radiogroup" aria-labelledby="eaLabel">
<label><input type="radio" name="ea" value="no"> No</label>
<label><input type="radio" name="ea" value="unsure"> Not sure</label>
<label><input type="radio" name="ea" value="yes"> Yes</label>
</div></div>
<div><span id="wpLabel" style="font-weight:600">Where do you work?</span>
<p class="hint">Cafes, restaurants, fast food and pharmacies are under other awards.</p>
<div class="choices" role="radiogroup" aria-labelledby="wpLabel" id="workplace">
<label><input type="radio" name="workplace" value="ok"> Shop or supermarket</label>
<label><input type="radio" name="workplace" value="other"> Somewhere else</label>
</div></div>
</div>
</fieldset>
<button type="submit" class="btn btn-primary">Calculate award minimum</button>
</form>

<section id="result" hidden aria-live="polite"></section>

<h2>How penalty rates work in these awards</h2>
<h3>General Retail Industry Award (MA000004)</h3>
<p>Ordinary hours can be rostered 7am to 9pm Monday to Friday, 7am to 6pm Saturday and 9am to 6pm Sunday. Full-time and part-time staff get 125% after 6pm on weekdays and on Saturdays, 150% on Sundays and 225% on public holidays. Casuals get 25% more on top at every step: 125% for ordinary hours, 150% evenings and Saturdays, 175% Sundays, 250% public holidays. Work past 9 ordinary hours in a day, past 38 in a week, or outside the span is overtime: 150% for the first 3 hours Monday to Saturday then 200%, 200% all day Sunday, 250% on a public holiday (casuals add 25% to each). Level 1 adult minimum is ${retail["1"]:.2f} an hour; level 8 is ${retail["8"]:.2f}.</p>
<p>Juniors at levels 1 to 3 are paid a percentage of the adult rate: 45% under 16, then 50%, 60%, 70%, 80% at 19, and 90% at 20 (100% after 6 months). From 1 December 2026, 18 and 19 year olds with more than 6 months' service step up 5% every 1 December and 1 July until they reach the adult rate.</p>
<h3>Hospitality Industry (General) Award (MA000009)</h3>
<p>Monday to Friday 7am to 7pm is the ordinary rate. From 7pm to midnight add $2.95 for each hour or part hour; from midnight to 7am add $4.42. Saturdays pay 125%, Sundays 150%, public holidays 225%; casuals get 150%, 175% and 250% including their loading. Overtime applies after 11.5 ordinary hours in a shift (12 for casuals) or 38 in a week: 150% for the first 2 hours Monday to Friday, then 200%, and 200% all weekend. Hospitality casuals are not paid the casual loading on overtime. Only the single highest penalty applies to any hour. Level 1 adult minimum is ${hosp["1"]:.2f} an hour; introductory is ${hosp["intro"]:.2f}. Juniors get 50% under 17, 60% at 17, 70% at 18, 85% at 19 and the full rate at 20; juniors who serve alcohol are always paid the adult rate.</p>
{state_section}

<h2>What this calculator does not do</h2>
<p>It does not cover enterprise agreements, other awards (Fast Food, Restaurant, Pharmacy, Hair and Beauty, Clerks), allowances (laundry, meal, first aid, cold work), shiftwork rosters, apprentices, annualised salaries, leave, superannuation or tax. Minimum engagement rules (3 hours in Retail, 2 hours for Hospitality casuals) are not applied. It is a first check, not a ruling: the award and the <a href="https://calculate.fairwork.gov.au/" rel="noopener" target="_blank">Fair Work Ombudsman Pay and Conditions Tool</a> prevail.</p>
</main>
<footer>
<p>Rates effective <span id="ratesVersion">{R["version"]}</span>, last checked <span id="ratesChecked">{R["checked"]}</span>. Award data: Fair Work Commission, General Retail Industry Award 2020 and Hospitality Industry (General) Award 2020, licensed under <a href="https://creativecommons.org/licenses/by/4.0/" rel="license noopener" target="_blank">Creative Commons Attribution 4.0</a>. Public holiday dates from the Fair Work Ombudsman. Figures cross-checked against the Fair Work Ombudsman pay guides published 24 June 2026.</p>
<p>RosterPay is an independent tool. It is not affiliated with, and not endorsed by, the Fair Work Commission or the Fair Work Ombudsman. All figures are estimates of award minimums based on what you enter. Where this page and the award differ, the award applies. This is general information, not legal or financial advice. Nothing you type is sent anywhere; this page stores your last entries on your own device only.</p>
<p><a href="test.html">Worked-example tests</a></p>
</footer>
<script src="engine.js?v={v("engine.js")}"></script>
<script src="app.js?v={v("app.js")}"></script>
</body>
</html>
"""

urls = []
for code in [None] + list(STATES):
    fn = "index.html" if code is None else STATES[code][1] + ".html"
    open(fn, "w", encoding="utf-8", newline="\n").write(page(code))
    urls.append(f"{SITE}/" if code is None else f"{SITE}/{STATES[code][1]}.html")
    print("wrote", fn)
today = datetime.date.today().isoformat()
open("sitemap.xml", "w", encoding="utf-8", newline="\n").write(
    '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    "".join(f"<url><loc>{u}</loc><lastmod>{today}</lastmod></url>\n" for u in urls) + "</urlset>\n")
open("robots.txt", "w", encoding="utf-8", newline="\n").write(f"User-agent: *\nAllow: /\nDisallow: /test.html\nSitemap: {SITE}/sitemap.xml\n")
print("wrote sitemap.xml robots.txt")
