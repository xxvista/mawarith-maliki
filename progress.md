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
- [x] Phone-first redesign: bottom tab bar (calculator, lessons, relatives, takharuj + "More" sheet for rules / examples / references), larger touch targets (40px steppers, 48px buttons, 16px inputs so iOS does not zoom), result tables turned into cards on narrow screens, more white space (card padding 22-26px, 24px between cards), safe-area padding. Checked with headless Chrome at 390x844 (no horizontal overflow) and 1280x800.

## Next / ideas
- [ ] Test on a real iPhone/Android browser (only headless Chrome emulation so far).
- [ ] Add past-exam questions and lecture examples as exercises (waiting for the files).
- [ ] Student name line in the header (name not provided yet).
- [ ] Student progress dashboard (#6), exam mode (#7), dark mode / font size (#9), free-text heir entry (#11).
- [ ] Drowned/burned (gharqa/hadma) dedicated calculator.
- [ ] Per-class degree handling inside dhawu al-arham class 4 (strength of kinship).
- [ ] Tanzil for several dead children at once; multi-generation tanzil.
- [ ] Optional dark theme.

## Deploy
GitHub Pages from `main` / root (`index.html` is self-contained, `.nojekyll` added). URL: https://xxvista.github.io/mawarith-maliki/

## Build
`python3 build.py` assembles `index.html` from `template.html` + `engine.js` + `ui.js`.

## تحديث التصميم الثاني (2026-11-18)
- ترويسة مدمجة بالشعار، مجموعات ورثة قابلة للطي، شريط إجراء ثابت («احسب الأنصبة») مع عدّاد الورثة.
- أرقام الأقسام، شرائح «ملخص النتيجة»، والشرح التعليمي داخل بطاقة قابلة للطي.
- إصلاح عدم ظهور الدروس (انهيار عند الفتح على #learn).

## الدروس الكاملة من ملفات المقياس (2026-11-18)
- توسيع الدروس من 8 إلى 16 درساً في أربعة أقسام، مأخوذة من محاضرات د. حدة سعدي (المواريث، المحاضرة الثالثة، الإرث بالتعصيب، التخارج، حالات أصحاب الفروض، مدخل إلى علم الفرائض، التنزيل).
- دروس جديدة: مدخل علم الفرائض (المبادئ العشرة)، أركان الميراث وشروطه، أسباب الإرث، موانع الإرث السبعة (عش لك رزق)، مصادر المواريث، الوارثون وطرق الإرث، التنزيل، التخارج.
- 74 تمريناً (حساب يصحّحه المحرك + أسئلة اختيار)، وترتيب خيارات الأسئلة عشوائي عند كل فتح.
- عناوين الأقسام في قائمة الدروس، وجداول الدروس تتحول إلى بطاقات على الجوال.

## دروس الحمل والمفقود والخنثى (2026-11-18)
- ثلاثة دروس جديدة في قسم مستقل («القسم الرابع»): ميراث الحمل، ميراث المفقود، ميراث الخنثى (على المذهب المالكي مع المادتين 42 و109 من قانون الأسرة). صار المجموع 19 درساً و92 تمريناً.
- الأمثلة المحلولة مُتحقَّق منها بمحرك الحساب. هذه الدروس مأخوذة من مراجع عامة لا من ملفات الأستاذة (لا توجد في الحاسوب)، وينبغي مراجعتها معها.

## درس حل المناسخات (2026-11-18)
- درس جديد «حل المناسخات» (الدرس 17) في القسم الرابع: تعريفها، الأحوال الثلاثة (لا عمل / انقسام / توافق أو تباين)، خطوات الحل، ومثال محلول جامعته 288 مُتحقَّق منه بمحرك الحساب وبالكسور. صار المجموع 20 درساً و99 تمريناً.

## حاسبات الحالات الخاصة (2026-11-18)
- تبويب جديد «حالات خاصة» يعمل على الورثة المدخلين في الحاسبة: الحمل (إيقاف النصيب بحسب 1–4 أجنة)، المفقود (حالتا الحياة والموت)، الخنثى (متوسط حالتي الذكورة والأنوثة)، المناسخات (طريقة السهام والجامعة مع ربط الوارث المشترك).
- أُضيفت 7 اختبارات انحدار (المجموع 33). مقدار ما يُوقف للحمل مختلف فيه (قيد L ما زال مفتوحاً).

## إضافات الواجهة (2026-11-18) — extras.js
- مشاركة بالرابط: الحالة كاملة في الـhash (`#calc?h=wives:1,sons:2&m=B&g=m&e=240000`) تُفتح وتُحسب تلقائياً؛ أزرار نسخ الرابط ونسخ النتيجة كنص وطباعة/PDF (ورقة بترويسة المقرر).
- مخطط دائري للأنصبة وشجرة عائلة SVG (وارث/محجوب/لا يرث) تحت النتيجة.
- مقارنة الصيغ الثلاث جنباً إلى جنب مع تلوين الفروق، وحلّ خطوة بخطوة (6 خطوات: الورثة، الحجب، الفروض، العصبة، الأصل والعول والردّ، النتيجة).
- تبويب «بحث وقاموس»: 35 مصطلحاً وبحث في نصوص الدروس (تطبيع الحروف العربية) مع فتح الدرس.
- PWA: manifest وsw.js (شبكة أولاً ثم ذاكرة مؤقتة) وأيقونتان، وزر تثبيت (وإرشاد iOS). التسجيل يعمل على GitHub Pages فقط؛ في نسخة claude.ai لا يعمل ولا يضرّ.
- build.py يحقن extras.js في ui.js عند العلامة /*EXTRAS*/.
