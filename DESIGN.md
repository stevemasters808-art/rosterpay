# RosterPay design system

One file, read by Claude Code or any AI tool before touching UI. Applies to the web calculator now and the Android app later. Keep it short; add only what a screen needs.

## Who it is for

Australian retail and hospitality shift workers, mostly 16 to 30, on a phone, checking a payslip against what the award says. They want a number they can trust and a plain reason for it. Tone: a sharp mate who read the award, not a government form and not a startup.

## Colours

| Token | Hex | Use |
|---|---|---|
| paper | #F4F6F2 | page background |
| ink | #14201A | text |
| green | #1F4D3A | primary: buttons, selected choices, brand, links |
| green-deep | #153528 | hover and pressed |
| mark | #FFE24D | the highlighter. One use per screen: the gross total. Never for buttons or decoration |
| muted | #5B6B62 | hints, secondary text, table headers |
| rule | #C9D2CB | table rules, section dividers |
| amber | #8A4B00 on #FFF4DB | warnings and notices |
| field | #FFFFFF | inputs |

Never blue, never orange, never navy: those read as Fair Work Ombudsman. No gradients. No shadows except native controls.

## Type

System stack: `"Segoe UI", system-ui, -apple-system, Roboto, sans-serif`. On Android use Roboto or the platform default. No web fonts, no icon fonts.

Scale: body 17px, hint 15px, h1 28 to 40px clamped, section heading 21px, gross total 20px bold. Line height 1.5. Tabular numerals everywhere money or hours appear (`font-variant-numeric: tabular-nums`). Sentence case for every label and button. No all-caps labels, no eyebrows, no numbered section markers unless the content is a sequence.

## Layout

Single column, max width 44rem, left aligned, 16px side gutters on phones. Sections separated by a 1px rule with the heading as the legend. Two-column grid for form fields above 40rem. Result block opens with a 3px green top rule.

Spacing unit 0.25rem. Controls at least 44px tall. Focus ring 3px green, offset 2px. Respect `prefers-reduced-motion`; the only motion is the result block fading in.

## Components

- Choice pills: radio or checkbox inside a rounded label, white with muted border, filled green with white text when selected.
- Inputs: white, 1px muted border, 4px radius, full width.
- Primary button: green fill, white text, full width on phones.
- Ghost button: white fill, green border and text.
- Notice: left 4px amber bar on amber-bg; "stop" variant uses green bar on #E6EEE9 for the before-you-act message.
- Ledger table: left labels, right-aligned numbers, 1px rules, total row bold with the highlighter on the amount only.
- Shift rows: date, start, finish, break, remove. Stack to a 2-column grid on phones.

## Words

- Name the thing by what the user calls it: "Classification level", "Unpaid break", "Gross on your payslip".
- Buttons say what happens: "Calculate award minimum", "Add another shift", "Get the Android app".
- Results are "award minimum estimate". Never "what you are owed", never "underpaid".
- Every result shows its assumptions and a way to check with the Fair Work Ombudsman.
- Errors say what went wrong and what to do: "Add at least one shift with a date, start and finish time."

## Brand marks

`img/logo.svg` (512 app icon: green rounded square, paper payslip, highlighter stroke on the total line), `img/favicon.svg`, `img/wordmark.svg`, `img/og-image.jpg` 1200x630. Wordmark text is "RosterPay", one word, capital R and P.

## Do not

- Do not use the words Fair Work in the name, logo, colours or domain.
- Do not add a card around every section.
- Do not add a second accent colour.
- Do not animate on load except the result.
