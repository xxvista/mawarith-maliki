# Bugs and known issues

## Fixed
| # | Problem | Cause | Fix |
|---|---------|-------|-----|
| 1 | "Famous problems" buttons showed no text until pressed/held | Buttons inherited the browser's default text colour, which was light on a light background | `color-scheme: light`, explicit `color` on `button, input, select`, explicit colour on `.ex button` and `.mode` |
| 2 | Three engine tests failed on first run | Wrong hand-computed expectations, not engine bugs (Mushtaraka: 3 heads share 1/3 so 1/9 each; grandfather + full sister + 2 paternal brothers: sharing 2/7 < 1/3 so he takes 1/3; four heads share 1/3 so 1/12 each) | Expectations corrected after re-deriving by hand |
| 3 | MCQ "two daughters and a full brother" had two correct options | Options "1/3" and "1/3 (remainder after 2/3)" | Options rewritten, single correct answer |
| 4 | Year printed 2025/2026 | Copied from the course file header | Changed to 2026/2027 |
| 5 | Challenge button missing inside lessons | `#chalBtn` only existed on the list view | Added to the lesson header (last-lesson duplicate removed) |
| 6 | Hard to use on phones (cramped cards, wide tables, tiny top tabs) | Desktop-first layout | Mobile redesign: bottom nav, card-style result tables, larger controls, more spacing |
| 7 | Title lines too tall on phones | Body line-height inherited by `h1` | `header h1{line-height:1.4}` |

## Open / known limitations
| # | Item | Notes |
|---|------|-------|
| A | Tanzil result differs from one lecture example | The Guelma lecture example gives father and mother 1/6 of the whole estate each. The site takes the tanzil first, then divides the remainder (father 1/6 of 5/6 = 5/36), which is the usual wasiyya-wajiba treatment. Needs a legal check against court practice. |
| B | Tanzil with debts | The sources reviewed are silent. The site applies tanzil to the estate after funeral and debts. |
| C | Tanzil scope | One dead child with his or her children only. If a dead son's children would inherit by themselves (no living son) the tool says tanzil does not apply. |
| D | Dhawu al-arham | Simplified. Class 4 ignores degrees and strength of kinship. Within class 3 children of uterine siblings split equally, others 2:1. |
| E | Not implemented | Missing person, pregnancy, khuntha, drowning/burning, munasakha, takharuj of several heirs at once, checking inheritance obstacles. |
| F | Cosmetic code debt | `finalize()` in the engine has a leftover no-op loop; arham class-3 label building uses an awkward string replace. No effect on results. |
| G | localStorage | Lesson progress may not persist in sandboxed viewers (handled with try/catch). |
| H | Random challenge | Draws random heir sets; occasionally produces unusual but valid combinations. |
| I | Maliki opinions | Grandmother lines (mother of mother's mother, etc.) and some Mushtaraka details should be checked against Khalil's Mukhtasar and its commentaries before classroom use. |
| J | Phone layout only verified in headless Chrome emulation | Check Safari iOS (bottom bar + safe area) and small Android screens |

## أخطاء مُصلحة (تحديث)
8. **الدروس لا تظهر**: فتح الصفحة على `#learn` كان يسبب خطأ TDZ ("Cannot access 'curL' before initialization") فتفرغ الواجهة. الحل: نقل استدعاء التهيئة إلى نهاية ui.js.
9. **CSS الجديد داخل @media للجوال**: لم يظهر التصميم على الحاسوب. الحل: نقله قبل `</style>`.
10. **الصفحة تبدأ مُمرَّرة 193px على الجوال**: سببه `replaceState('#calc')` أثناء التهيئة (يُنفّذ المتصفح تمريراً إلى المعرّف بعد التحميل). الحل: عدم تحديث الـhash إلا بعد التهيئة.
