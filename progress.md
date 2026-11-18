# Progress — Maliki inheritance calculator (حاسبة المواريث)

Single-page Arabic RTL site. Course: Inheritance (المواريث), 3rd year Sharia, Bouira University, 2026/2027, supervised by Dr. Hadda Saadi.
Published as a claude.ai artifact (private to the owner until shared).

## Done

### Engine (`engine.js`) — exact fractions with BigInt
- [x] Fraction class (`Fr`), no rounding anywhere.
- [x] Fixed shares: spouses, mother, father, grandfather, grandmothers (max two, nearer blocks farther, mother blocks all), daughters / son's daughters, uterine siblings, full and paternal sisters.
- [x] Residuary (`ta'sib`): by self, by another, with another.
- [x] Grandfather with siblings, Zayd's method (best of: sharing, 1/3 of remainder, 1/6 of estate) and al-mu'adda.
- [x] Special cases: the two Umariyyas, Akdariyya, Mushtaraka, `awl`.
- [x] Three modes: A original Maliki (no radd), B later Maliki fatwa (radd), C Algerian Family Code (radd art. 167, no wala').
- [x] Tanzil, arts. 169-172: hypothetical share of the dead child, 1/3 cap, 2:1 split among grandchildren, taken before the optional bequest.
- [x] Dhawu al-arham, art. 168: four classes, simplified ahl al-tanzil method.
- [x] Takharuj: take a sum from the estate / one heir buys / all remaining heirs buy.
- [x] 26 regression tests in `test.js` (`node test.js`), all passing, plus smoke checks for tanzil / arham / takharuj.

### UI (`ui.js`, `template.html`)
- [x] Calculator with mode picker, deceased gender, heir steppers, estate deductions (funeral, debts, bequest capped at 1/3).
- [x] Result table: fraction, %, shares of the base, amounts per heir and per person, blocked heirs with reasons, step-by-step special-case notes.
- [x] Educational explanation under every result (who inherits, type of share, evidence, base and shares, check, money).
- [x] Tabs: calculator, lessons and exercises, dhawu al-arham, takharuj, Maliki rules, famous problems, references and warnings.
- [x] 8 interactive lessons, MCQ + calculation exercises auto-checked by the engine, detailed solution, open-in-calculator, random challenge, progress in localStorage (optional).
- [x] University logo (taken from Dr. Saadi's own handout, embedded as data URI) and course info in header/footer.
- [x] Light theme forced, explicit button colours, stacked fractions, zebra tables, print styles.

## Next / ideas
- [ ] Add past-exam questions and lecture examples as exercises (waiting for the files).
- [ ] Student name line in the header (name not provided yet).
- [ ] Missing-person (mafqud), pregnancy (haml), khuntha, drowned/burned (gharqa/hadma), munasakha.
- [ ] Per-class degree handling inside dhawu al-arham class 4 (strength of kinship).
- [ ] Tanzil for several dead children at once; multi-generation tanzil.
- [ ] Optional dark theme.

## Build
`python3 build.py` assembles `index.html` from `template.html` + `engine.js` + `ui.js`.
