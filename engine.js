/* محرك حساب المواريث — المذهب المالكي (ثلاث صيغ) — حسابات كسرية دقيقة */
(function (root) {
'use strict';
const gcd = (a, b) => { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) { [a, b] = [b, a % b]; } return a; };
class Fr {
  constructor(n, d = 1n) { n = BigInt(n); d = BigInt(d); if (d < 0n) { n = -n; d = -d; } const g = gcd(n, d) || 1n; this.n = n / g; this.d = d / g; }
  static of(x) { return x instanceof Fr ? x : new Fr(x); }
  add(o) { o = Fr.of(o); return new Fr(this.n * o.d + o.n * this.d, this.d * o.d); }
  sub(o) { o = Fr.of(o); return new Fr(this.n * o.d - o.n * this.d, this.d * o.d); }
  mul(o) { o = Fr.of(o); return new Fr(this.n * o.n, this.d * o.d); }
  div(o) { o = Fr.of(o); return new Fr(this.n * o.d, this.d * o.n); }
  cmp(o) { o = Fr.of(o); const l = this.n * o.d, r = o.n * this.d; return l < r ? -1 : l > r ? 1 : 0; }
  lt(o) { return this.cmp(o) < 0; } gt(o) { return this.cmp(o) > 0; } eq(o) { return this.cmp(o) === 0; }
  isZero() { return this.n === 0n; }
  num() { return Number(this.n) / Number(this.d); }
  str() { return this.d === 1n ? String(this.n) : this.n + '/' + this.d; }
}
const fr = (n, d = 1) => new Fr(n, d);
const ZERO = fr(0), ONE = fr(1);
const maxF = (...a) => a.reduce((m, x) => (x.gt(m) ? x : m));

const NAMES = {
  husband: ['الزوج', 'الزوج'], wives: ['الزوجة', 'الزوجات'],
  father: ['الأب', 'الأب'], mother: ['الأم', 'الأم'], gf: ['الجد (أبو الأب)', 'الجد (أبو الأب)'],
  gm_m: ['أم الأم', 'أم الأم'], gm_p: ['أم الأب', 'أم الأب'], gm_mm: ['أم أم الأم', 'أم أم الأم'], gm_pm: ['أم أم الأب', 'أم أم الأب'],
  sons: ['الابن', 'الأبناء'], daughters: ['البنت', 'البنات'], gsons: ['ابن الابن', 'أبناء الابن'], gdaughters: ['بنت الابن', 'بنات الابن'],
  fb: ['الأخ الشقيق', 'الإخوة الأشقاء'], fs: ['الأخت الشقيقة', 'الأخوات الشقيقات'],
  pb: ['الأخ لأب', 'الإخوة لأب'], ps: ['الأخت لأب', 'الأخوات لأب'],
  mb: ['الأخ لأم', 'الإخوة لأم'], ms: ['الأخت لأم', 'الأخوات لأم'],
  nfb: ['ابن الأخ الشقيق', 'أبناء الأخ الشقيق'], npb: ['ابن الأخ لأب', 'أبناء الأخ لأب'],
  ufb: ['العم الشقيق', 'الأعمام الأشقاء'], upb: ['العم لأب', 'الأعمام لأب'],
  cfb: ['ابن العم الشقيق', 'أبناء العم الشقيق'], cpb: ['ابن العم لأب', 'أبناء العم لأب'],
  mawla: ['المعتِق (الولاء)', 'المعتِق (الولاء)']
};
const KEYS = Object.keys(NAMES);
const DEF = {}; KEYS.forEach(k => DEF[k] = 0);
const nm = (k, c) => NAMES[k][c > 1 ? 1 : 0];

function solve(input, mode) {
  mode = mode || 'A';
  const n = Object.assign({}, DEF);
  KEYS.forEach(k => { const v = Number(input && input[k]); n[k] = isFinite(v) && v > 0 ? Math.floor(v) : 0; });
  const out = { mode, steps: [], notes: [], heirs: [], blocked: [], errors: [], special: [], bayt: ZERO, base: null, awl: null, radd: null };
  if (n.husband > 1) n.husband = 1;
  if (n.wives > 4) n.wives = 4;
  if (n.father > 1) n.father = 1; if (n.mother > 1) n.mother = 1; if (n.gf > 1) n.gf = 1; if (n.mawla > 1) n.mawla = 1;
  if (mode === 'C') n.mawla = 0;
  if (n.husband && n.wives) { out.errors.push('لا يجتمع زوج وزوجة في تركة واحدة: اختر أحدهما.'); return out; }
  const total = KEYS.reduce((s, k) => s + n[k], 0);
  if (total === 0) { out.errors.push('لم تُدخل أي وارث.'); return out; }

  const S = out.steps;
  const res = {}; // key -> {share:Fr, kind, why}
  const give = (k, share, kind, why) => {
    if (share.isZero() || n[k] === 0) return;
    if (res[k]) { res[k].share = res[k].share.add(share); res[k].kind = res[k].kind === kind ? kind : 'فرض وتعصيب'; res[k].why += ' + ' + why; }
    else res[k] = { share, kind, why };
  };
  const sum = () => Object.values(res).reduce((s, r) => s.add(r.share), ZERO);

  // ---------- الفرع الوارث ----------
  let gsons = n.gsons, gdaughters = n.gdaughters;
  if (n.sons > 0) { gsons = 0; gdaughters = 0; }
  else if (gdaughters > 0 && gsons === 0 && n.daughters >= 2) { gdaughters = 0; }
  const maleDesc = n.sons > 0 || gsons > 0;
  const femaleDesc = n.daughters > 0 || gdaughters > 0;
  const desc = maleDesc || femaleDesc;
  const sibAll = n.fb + n.fs + n.pb + n.ps + n.mb + n.ms;
  const father = n.father > 0;
  const gfActive = n.gf > 0 && !father;
  const fullOrPat = n.fb + n.fs + n.pb + n.ps;
  const jadd = gfActive && !maleDesc && fullOrPat > 0;

  // ---------- المسائل الخاصة: الأكدرية ----------
  const onlyKeys = ks => KEYS.every(k => ks.includes(k) ? true : n[k] === 0);
  const akd = n.husband === 1 && n.mother === 1 && n.gf === 1 && ((n.fs === 1 && n.pb === 0 && n.ps === 0 && n.fb === 0) || (n.ps === 1 && n.fs === 0 && n.fb === 0 && n.pb === 0)) && onlyKeys(['husband', 'mother', 'gf', 'fs', 'ps']);
  if (akd) {
    const sisKey = n.fs === 1 ? 'fs' : 'ps';
    S.push('هذه المسألة الأكدرية: زوج وأم وجد وأخت واحدة (شقيقة أو لأب). تُفرض لها النصف استثناءً، فيكون للزوج 1/2 وللأم 1/3 وللجد 1/6 وللأخت 1/2، فتعول المسألة من 6 إلى 9.');
    S.push('ثم يجمع الجد نصيبه (1) مع نصيب الأخت (3) = 4 أسهم، ويقتسمانها «للذكر مثل حظ الأنثيين»: للجد 8/27 وللأخت 4/27، وتصحّ المسألة من 27.');
    res.husband = { share: fr(9, 27), kind: 'فرض', why: '3/9 بعد العول (النصف)' };
    res.mother = { share: fr(6, 27), kind: 'فرض', why: '2/9 بعد العول (الثلث)' };
    res.gf = { share: fr(8, 27), kind: 'فرض وتعصيب', why: 'يقاسم الأخت: له ضعف نصيبها من مجموع سهميهما' };
    res[sisKey] = { share: fr(4, 27), kind: 'فرض وتعصيب', why: 'تُفرض لها استثناءً ثم تُقاسَم الجدَّ' };
    out.special.push('الأكدرية');
    out.awl = { from: 6, to: 9 };
    finalize(); return out;
  }

  // ---------- الجدات (المذهب المالكي: جدتان فقط، والقربى تحجب البعدى) ----------
  const gmRes = [];
  if (n.mother > 0) { ['gm_m', 'gm_p', 'gm_mm', 'gm_pm'].forEach(k => { if (n[k]) out.blocked.push({ key: k, reason: 'محجوبة بالأم' }); }); }
  else {
    const cand = [];
    if (n.gm_m) cand.push(['gm_m', 1]); if (n.gm_mm && !n.gm_m) cand.push(['gm_mm', 2]);
    if (n.gm_p) { if (father) out.blocked.push({ key: 'gm_p', reason: 'محجوبة بالأب' }); else cand.push(['gm_p', 1]); }
    if (n.gm_pm && !n.gm_p) { if (father) out.blocked.push({ key: 'gm_pm', reason: 'محجوبة بالأب' }); else cand.push(['gm_pm', 2]); }
    if (n.gm_mm && n.gm_m) out.blocked.push({ key: 'gm_mm', reason: 'محجوبة بالجدة القربى من جهتها (أم الأم)' });
    if (n.gm_pm && n.gm_p) out.blocked.push({ key: 'gm_pm', reason: 'محجوبة بالجدة القربى من جهتها (أم الأب)' });
    if (cand.length) {
      const mn = Math.min(...cand.map(c => c[1]));
      cand.forEach(c => { if (c[1] > mn) out.blocked.push({ key: c[0], reason: 'محجوبة بجدة أقرب منها' }); else gmRes.push(c[0]); });
    }
  }

  // ---------- أصحاب الفروض ----------
  const spouseShare = n.husband ? (desc ? fr(1, 4) : fr(1, 2)) : n.wives ? (desc ? fr(1, 8) : fr(1, 4)) : ZERO;
  if (n.husband) give('husband', spouseShare, 'فرض', desc ? 'الربع لوجود الفرع الوارث' : 'النصف لعدم الفرع الوارث');
  if (n.wives) give('wives', spouseShare, 'فرض', (desc ? 'الثمن' : 'الربع') + (desc ? ' لوجود الفرع الوارث' : ' لعدم الفرع الوارث') + (n.wives > 1 ? ' يُقسم بينهنّ بالتساوي' : ''));

  // الأم
  let umariyya = false;
  if (n.mother) {
    if (desc) give('mother', fr(1, 6), 'فرض', 'السدس لوجود الفرع الوارث');
    else if (sibAll >= 2) give('mother', fr(1, 6), 'فرض', 'السدس لوجود جمع من الإخوة (اثنين فأكثر)');
    else if ((n.husband || n.wives) && father) {
      umariyya = true;
      give('mother', ONE.sub(spouseShare).div(3), 'فرض', 'ثلث الباقي بعد فرض الزوج (العمريّة)');
    } else give('mother', fr(1, 3), 'فرض', 'الثلث لعدم الفرع الوارث وعدم جمع الإخوة');
  }
  if (umariyya) { out.special.push(n.husband ? 'العمريّة الأولى (زوج وأبوان)' : 'العمريّة الثانية (زوجة وأبوان)'); S.push('مسألة العمريّة: للأم ثلث ما بقي بعد فرض الزوج/الزوجة وليس ثلث التركة كلها، قضى بذلك عمر رضي الله عنه ووافقه الجمهور.'); }

  if (gmRes.length) {
    const each = fr(1, 6).div(gmRes.length);
    gmRes.forEach(k => give(k, each, 'فرض', gmRes.length > 1 ? 'السدس تشترك فيه الجدتان بالتساوي' : 'السدس لعدم الأم'));
    if (gmRes.length === 1 && false) {}
  }

  // الأب والجد (غير مقاسمة الإخوة)
  const asParent = (k, label) => {
    if (maleDesc) give(k, fr(1, 6), 'فرض', 'السدس لوجود الفرع الوارث المذكر');
    else if (femaleDesc) give(k, fr(1, 6), 'فرض', 'السدس لوجود الفرع الوارث المؤنث، ثم يأخذ الباقي تعصيباً');
  };
  if (father) asParent('father');
  if (gfActive && !jadd) asParent('gf');

  // البنات وبنات الابن
  if (n.sons === 0) {
    if (n.daughters > 0) {
      if (n.daughters === 1) give('daughters', fr(1, 2), 'فرض', 'النصف للبنت الواحدة');
      else give('daughters', fr(2, 3), 'فرض', 'الثلثان للبنتين فأكثر يُقسمان بالتساوي');
    }
    if (gsons === 0 && gdaughters > 0) {
      if (n.daughters === 0) {
        if (gdaughters === 1) give('gdaughters', fr(1, 2), 'فرض', 'النصف لبنت الابن الواحدة (تقوم مقام البنت)');
        else give('gdaughters', fr(2, 3), 'فرض', 'الثلثان لبنات الابن');
      } else if (n.daughters === 1) give('gdaughters', fr(1, 6), 'فرض', 'السدس تكملة للثلثين مع البنت الصلبية');
    }
  }

  // الإخوة لأم
  const maternalBlocked = desc || father || gfActive;
  const mTot = n.mb + n.ms;
  if (mTot > 0 && !maternalBlocked) {
    const tot = mTot === 1 ? fr(1, 6) : fr(1, 3);
    const why = mTot === 1 ? 'السدس للواحد منفرداً' : 'الثلث للاثنين فأكثر، يقتسمونه بالتساوي (الذكر كالأنثى)';
    give('mb', tot.mul(n.mb).div(mTot), 'فرض', why);
    give('ms', tot.mul(n.ms).div(mTot), 'فرض', why);
  } else if (mTot > 0) {
    const r = desc ? 'محجوبون بالفرع الوارث' : father ? 'محجوبون بالأب' : 'محجوبون بالجد (عند المالكية)';
    if (n.mb) out.blocked.push({ key: 'mb', reason: r }); if (n.ms) out.blocked.push({ key: 'ms', reason: r });
  }

  // ---------- الإخوة الأشقاء ولأب (غير مسألة الجد) ----------
  const sibsAllowed = !maleDesc && !father && !jadd;
  const asabaSis = femaleDesc; // الأخوات عصبة مع الغير
  if (sibsAllowed) {
    if (n.fb === 0 && n.fs > 0 && !asabaSis) {
      if (n.fs === 1) give('fs', fr(1, 2), 'فرض', 'النصف للأخت الشقيقة المنفردة');
      else give('fs', fr(2, 3), 'فرض', 'الثلثان للشقيقتين فأكثر');
    }
    const pBlocked = n.fb > 0 || (n.fs > 0 && asabaSis);
    if (!pBlocked && n.pb === 0 && n.ps > 0 && !asabaSis) {
      if (n.fs === 0) { if (n.ps === 1) give('ps', fr(1, 2), 'فرض', 'النصف للأخت لأب المنفردة'); else give('ps', fr(2, 3), 'فرض', 'الثلثان للأختين لأب فأكثر'); }
      else if (n.fs === 1) give('ps', fr(1, 6), 'فرض', 'السدس تكملة للثلثين مع الأخت الشقيقة');
      // fs>=2 : محجوبات
    }
  }

  // ---------- مسألة الجد مع الإخوة (زيد بن ثابت — المالكية) ----------
  let jaddInfo = null;
  if (jadd) {
    const F = sum();
    const R = ONE.sub(F);
    const units = 2 * n.fb + n.fs + 2 * n.pb + n.ps;
    const A = R.gt(ZERO) ? R.mul(2).div(2 + units) : ZERO;
    const B = R.gt(ZERO) ? R.div(3) : ZERO;
    const C = fr(1, 6);
    const best = maxF(A, B, C);
    let gfShare, how;
    if (A.cmp(best) === 0 && A.cmp(B) >= 0 && A.cmp(C) >= 0) { how = 'المقاسمة'; gfShare = A; }
    else if (B.cmp(C) >= 0) { how = 'ثلث الباقي'; gfShare = B; }
    else { how = 'سدس جميع المال'; gfShare = C; }
    S.push('الجد مع الإخوة (مذهب زيد بن ثابت الذي أخذ به المالكية): لا يحجب الجد الإخوة الأشقاء ولا لأب، ويُعطى الأحظّ له من ثلاثة: المقاسمة كأخ، أو ثلث الباقي بعد الفروض، أو سدس جميع المال.');
    S.push('بعد الفروض: الباقي = ' + R.str() + ' من التركة. المقاسمة = ' + A.str() + '، ثلث الباقي = ' + B.str() + '، سدس المال = ' + C.str() + ' ← الأحظّ للجد: ' + how + ' (' + gfShare.str() + ').');
    out.special.push('الجد مع الإخوة');
    jaddInfo = { how };
    give('gf', gfShare, how === 'المقاسمة' ? 'فرض وتعصيب' : 'فرض وتعصيب', 'الأحظّ له: ' + how);
    let rem2 = R.sub(gfShare); if (rem2.lt(ZERO)) rem2 = ZERO;
    const fullG = n.fb + n.fs > 0, patG = n.pb + n.ps > 0;
    let fullShare = ZERO, patShare = ZERO;
    if (how === 'المقاسمة') {
      fullShare = R.mul(2 * n.fb + n.fs).div(2 + units);
      patShare = R.mul(2 * n.pb + n.ps).div(2 + units);
      if (fullG && patG) {
        // المعادّة: عدّ الأشقاء الإخوةَ لأب على الجد ثم يأخذ الأشقاء نصيبهم
        S.push('المعادّة: يَعُدّ الإخوةُ الأشقاء الإخوةَ لأب على الجد ليمنعوه كثرة الميراث، ثم يرجع نصيب الإخوة لأب إلى الأشقاء.');
        out.special.push('المعادّة');
        if (n.fb === 0 && n.fs === 1) {
          const cap = fr(1, 2); let fs = fullShare.add(patShare); if (fs.gt(cap)) fs = cap;
          S.push('الشقيقة الواحدة تستكمل فرضها (النصف) من نصيب الفريقين، والباقي للإخوة لأب.');
          patShare = fullShare.add(patShare).sub(fs); fullShare = fs;
        } else { fullShare = fullShare.add(patShare); patShare = ZERO; }
      }
    } else {
      // لا معادّة: الباقي للأشقاء (ولأب إن لم يوجد أشقاء)
      if (fullG) { fullShare = rem2; patShare = ZERO; }
      else patShare = rem2;
    }
    // سقف الأخوات المنفردات: لا يزدن على فرضهنّ
    const capSis = (sisCount, brCount, share) => {
      if (brCount > 0) return { s: share, ex: ZERO };
      const cap = sisCount === 1 ? fr(1, 2) : fr(2, 3);
      return share.gt(cap) ? { s: cap, ex: share.sub(cap) } : { s: share, ex: ZERO };
    };
    if (fullG && how !== 'المقاسمة') { const c = capSis(n.fs, n.fb, fullShare); fullShare = c.s; if (!c.ex.isZero()) { if (patG) patShare = patShare.add(c.ex); else gfShare = gfShare.add(c.ex), res.gf.share = res.gf.share.add(c.ex); } }
    if (fullShare.gt(ZERO)) {
      const u = 2 * n.fb + n.fs;
      give('fb', fullShare.mul(2 * n.fb).div(u), 'تعصيب', 'يقاسم الجدَّ بحسب الأحظّ');
      give('fs', fullShare.mul(n.fs).div(u), 'تعصيب', 'تعصيباً بالأخ أو مع الجد، للذكر مثل حظ الأنثيين');
    }
    if (patShare.gt(ZERO)) {
      const u = 2 * n.pb + n.ps;
      give('pb', patShare.mul(2 * n.pb).div(u), 'تعصيب', 'الإخوة لأب');
      give('ps', patShare.mul(n.ps).div(u), 'تعصيب', 'الأخوات لأب');
    }
    ['fb', 'fs', 'pb', 'ps'].forEach(k => { if (n[k] && !res[k]) out.blocked.push({ key: k, reason: k[0] === 'p' && fullG ? 'سقط بالأشقاء بعد المعادّة' : 'لم يبق له شيء بعد نصيب الجد' }); });
  }

  // ---------- العول / المشتركة ----------
  let Ssum = sum();
  // المشتركة
  if (!jadd && !desc && !father && !gfActive && n.fb > 0 && mTot >= 2 && Ssum.eq(ONE) && !res.fb) {
    const heads = n.fb + n.fs + n.mb + n.ms;
    const third = fr(1, 3);
    ['mb', 'ms'].forEach(k => delete res[k]);
    give('mb', third.mul(n.mb).div(heads), 'فرض', 'شريك في الثلث (المشتركة)');
    give('ms', third.mul(n.ms).div(heads), 'فرض', 'شريك في الثلث (المشتركة)');
    give('fb', third.mul(n.fb).div(heads), 'تشريك', 'شُرِّك مع الإخوة لأم في الثلث لأن الفروض استغرقت التركة');
    give('fs', third.mul(n.fs).div(heads), 'تشريك', 'شُرِّكت مع الإخوة لأم في الثلث');
    S.push('المسألة المشتركة (الحماريّة/الحجريّة): زوج وأم أو جدة وإخوة لأم (اثنان فأكثر) وإخوة أشقاء. استغرقت الفروض التركة، فعند المالكية يُشرَّك الأشقاء مع الإخوة لأم في الثلث ويقسمونه بالتساوي للذكر والأنثى، بخلاف الحنابلة والحنفية الذين يُسقطونهم.');
    out.special.push('المشتركة');
    ['fb', 'fs'].forEach(k => { if (n[k] && !res[k]) out.blocked.push({ key: k, reason: 'غير مشارك' }); });
    if (n.pb || n.ps) { if (n.pb) out.blocked.push({ key: 'pb', reason: 'محجوبون بالأخ الشقيق' }); if (n.ps) out.blocked.push({ key: 'ps', reason: 'محجوبات بالأخ الشقيق' }); }
    Ssum = sum();
  }

  // ---------- العصبات بالنفس / مع الغير ----------
  let R = ONE.sub(Ssum);
  let asabaTaken = false;
  if (!out.special.includes('المشتركة')) {
    const groups = [];
    if (n.sons > 0) groups.push({ m: { sons: 2, daughters: 1 }, why: 'تعصيباً: للذكر مثل حظ الأنثيين' });
    else if (gsons > 0) groups.push({ m: { gsons: 2, gdaughters: 1 }, why: 'تعصيباً: للذكر مثل حظ الأنثيين' });
    if (father && !maleDesc) groups.push({ m: { father: 1 }, why: 'تعصيباً بالنفس' });
    if (gfActive && !jadd && !maleDesc) groups.push({ m: { gf: 1 }, why: 'تعصيباً بالنفس (الجد كالأب عند عدم الإخوة)' });
    if (sibsAllowed) {
      if (n.fb > 0) groups.push({ m: { fb: 2, fs: 1 }, why: 'تعصيباً (الشقيق)' });
      else if (n.fs > 0 && asabaSis) groups.push({ m: { fs: 1 }, why: 'تعصيباً مع الغير (مع البنات/بنات الابن)' });
      const pBlocked = n.fb > 0 || (n.fs > 0 && asabaSis);
      if (!pBlocked) {
        if (n.pb > 0) groups.push({ m: { pb: 2, ps: 1 }, why: 'تعصيباً (الأخ لأب)' });
        else if (n.ps > 0 && asabaSis && n.fs === 0) groups.push({ m: { ps: 1 }, why: 'تعصيباً مع الغير (مع البنات/بنات الابن)' });
      }
    }
    if (!maleDesc && !father && !(gfActive)) {
      [['nfb'], ['npb'], ['ufb'], ['upb'], ['cfb'], ['cpb'], ['mawla']].forEach(a => groups.push({ m: { [a[0]]: 1 }, why: a[0] === 'mawla' ? 'تعصيباً بالولاء' : 'تعصيباً بالنفس' }));
    }
    if (gfActive && !jadd) { /* الجد يحجب أبناء الإخوة ومن بعدهم */ }
    for (const g of groups) {
      const ks = Object.keys(g.m).filter(k => n[k] > 0 && (k !== 'gdaughters' || gdaughters > 0));
      if (!ks.length) continue;
      if (R.gt(ZERO)) {
        const u = ks.reduce((s, k) => s + g.m[k] * (k === 'gdaughters' ? gdaughters : n[k]), 0);
        ks.forEach(k => give(k, R.mul(g.m[k] * (k === 'gdaughters' ? gdaughters : n[k])).div(u), 'تعصيب', g.why));
        asabaTaken = true;
      }
      break;
    }
  }

  // ---------- العول أو الباقي (الرد) ----------
  Ssum = sum();
  if (Ssum.gt(ONE)) {
    // عول
    const parts = Object.values(res).map(r => r.share);
    let L = 1n; parts.forEach(p => { L = (L * p.d) / gcd(L, p.d); });
    const orig = Number(L), tot = Number(parts.reduce((s, p) => s.add(p), ZERO).mul(L).n / parts.reduce((s, p) => s.add(p), ZERO).mul(L).d);
    out.awl = { from: orig, to: tot };
    S.push('العول: مجموع الفروض (' + Ssum.str() + ') أكثر من الواحد الصحيح، فتعول المسألة ويدخل النقص على جميع أصحاب الفروض بنسبة سهامهم. المالكية والجمهور على القول بالعول.');
    Object.keys(res).forEach(k => { res[k].share = res[k].share.div(Ssum); res[k].why += ' (بعد العول)'; });
    out.special.push('العول');
    // أخوات مع الجد لا يُحجب شيء عدا ما سبق
  } else if (Ssum.lt(ONE)) {
    const rem = ONE.sub(Ssum);
    const nonSpouse = Object.keys(res).filter(k => !['husband', 'wives', 'father', 'gf'].includes(k) && res[k].kind === 'فرض');
    if (mode === 'A') {
      out.bayt = rem;
      S.push('بقي ' + rem.str() + ' من التركة ولا عاصب. أصل المذهب المالكي: لا ردّ على أصحاب الفروض ولا توريث لذوي الأرحام، فيُصرف الباقي لبيت المال (الخزينة العامة) إن كان منتظماً.');
    } else if (nonSpouse.length) {
      const T = nonSpouse.reduce((s, k) => s.add(res[k].share), ZERO);
      const target = ONE.sub(spouseShare);
      nonSpouse.forEach(k => { res[k].share = res[k].share.mul(target).div(T); res[k].why += ' (بعد الردّ)'; });
      out.radd = { remain: rem };
      out.special.push('الردّ');
      S.push('الردّ: بقي ' + rem.str() + ' من التركة ولا عاصب، فيُردّ على أصحاب الفروض غير الزوجين بنسبة فروضهم' + (mode === 'C' ? ' (المادة 167 من قانون الأسرة الجزائري)' : ' (فتوى المتأخرين من المالكية عند عدم انتظام بيت المال)') + '.');
    } else if (spouseShare.gt(ZERO) && mode === 'C') {
      const k = n.husband ? 'husband' : 'wives';
      res[k].share = ONE; res[k].why += ' + الردّ على الزوج/الزوجة عند عدم غيره (المادة 167، الفقرة الثانية)';
      out.radd = { remain: rem }; out.special.push('الردّ على أحد الزوجين');
      S.push('لا عاصب ولا صاحب فرض نسبي ولا ذو رحم، فيُردّ الباقي على أحد الزوجين (المادة 167، الفقرة 2).');
    } else {
      out.bayt = rem; out.special.push('ذوو الأرحام');
      S.push('بقي ' + rem.str() + ' من التركة ولا عاصب ولا صاحب فرض يُردّ عليه. تؤول التركة إلى ذوي الأرحام (المادة 168 من قانون الأسرة الجزائري، وفتوى المتأخرين) وهو ما لا يحسبه هذا الموقع؛ فإن لم يوجدوا فللخزينة العمومية/بيت المال.');
    }
  }
  finalize();
  return out;

  function reasonFor(k) {
    if (['gsons', 'gdaughters'].includes(k)) return n.sons > 0 ? 'محجوب بالابن' : 'محجوبات باستيفاء البنتين للثلثين، ولا معصِّب لهنّ';
    if (k === 'gf') return 'محجوب بالأب';
    if (['fb', 'fs', 'pb', 'ps'].includes(k)) {
      if (maleDesc) return 'محجوب بالفرع الوارث المذكر';
      if (father) return 'محجوب بالأب';
      if ((k === 'pb' || k === 'ps')) { if (n.fb > 0) return 'محجوب بالأخ الشقيق'; if (n.fs > 0 && asabaSis) return 'محجوب بالأخت الشقيقة العاصبة مع البنات'; if (n.fs >= 2) return 'محجوبة باستيفاء الشقيقتين للثلثين'; }
      return 'لم يبق له شيء بعد الفروض';
    }
    if (['nfb', 'npb', 'ufb', 'upb', 'cfb', 'cpb', 'mawla'].includes(k)) {
      if (asabaTaken || maleDesc || father || gfActive || n.fb + n.pb > 0 || (n.fs > 0 && femaleDesc)) return 'محجوب بمن هو أقرب منه من العصبة';
      return 'لم يبق له شيء بعد الفروض';
    }
    return 'لم يبق له شيء بعد الفروض';
  }
  function finalize() {
    const seen = new Set(out.blocked.map(b => b.key));
    KEYS.forEach(k => {
      if (n[k] > 0 && res[k]) {
        out.heirs.push({ key: k, label: nm(k, n[k]), count: n[k], share: res[k].share, per: res[k].share.div(n[k]), kind: res[k].kind, why: res[k].why });
      } else if (n[k] > 0 && !seen.has(k)) {
        if (k === 'wives' || k === 'husband') return;
        out.blocked.push({ key: k, reason: reasonFor(k) });
      }
    });
    out.blocked.forEach(b => { b.label = nm(b.key, n[b.key]); b.count = n[b.key]; });
    // أصل المسألة
    let L = 1n; out.heirs.forEach(h => { L = (L * h.per.d) / gcd(L, h.per.d); out.heirs.forEach(()=>{}); });
    out.heirs.forEach(h => { L = (L * h.share.d) / gcd(L, h.share.d); });
    if (!out.bayt.isZero()) L = (L * out.bayt.d) / gcd(L, out.bayt.d);
    out.base = Number(L);
    out.heirs.forEach(h => { h.units = Number(h.share.mul(L).n / h.share.mul(L).d); h.unitsPer = h.share.div(h.count).mul(L); });
    out.check = out.heirs.reduce((s, h) => s.add(h.share), ZERO).add(out.bayt);
    if (!out.check.eq(ONE)) out.errors.push('تنبيه برمجي: مجموع الأنصبة لا يساوي الواحد (' + out.check.str() + ')');
    if (!out.heirs.length && out.bayt.isZero()) out.errors.push('لا وارث يستحق.');
    if (!out.heirs.length && !out.bayt.isZero()) S.push('لا وارث يستحق شيئاً؛ التركة كلها للباقي المذكور.');
  }
}


/* ============ التنزيل (المواد 169-172 من قانون الأسرة الجزائري) ============ */
function solveTanzil(input, mode, tz) {
  const out = { applicable: false, reason: '', errors: [] };
  const m = Math.max(0, Math.floor(Number(tz.males) || 0)), f = Math.max(0, Math.floor(Number(tz.females) || 0));
  if (m + f === 0) { out.errors.push('أدخل عدد الأحفاد المنزَّلين.'); return out; }
  const type = tz.type === 'daughter' ? 'daughter' : 'son';
  if (tz.exclude) { out.reason = tz.exclude; return out; }
  if (type === 'son' && !(Number(input.sons) > 0)) {
    out.reason = 'لا ابن حيّ للمتوفى، فأبناء الابن المتوفى يرثون بأنفسهم تعصيباً أو فرضاً (فروع وارثون) ولا يلزم التنزيل. أدخلهم في خانة «أبناء الابن» و«بنات الابن».'; return out;
  }
  const h = Object.assign({}, input);
  if (type === 'son') h.sons = (Number(h.sons) || 0) + 1; else h.daughters = (Number(h.daughters) || 0) + 1;
  const hyp = solve(h, mode);
  if (hyp.errors.length && !hyp.heirs.length) { out.errors = hyp.errors; return out; }
  const key = type === 'son' ? 'sons' : 'daughters';
  const hh = hyp.heirs.find(x => x.key === key);
  const fShare = hh ? hh.per : ZERO;
  const cap = fr(1, 3);
  const capped = fShare.gt(cap);
  const tzs = capped ? cap : fShare;
  const u = 2 * m + f;
  const groups = [];
  if (m) groups.push({ label: m > 1 ? 'أبناء المنزَّل' : 'ابن المنزَّل', count: m, share: tzs.mul(2 * m).div(u), per: tzs.mul(2).div(u) });
  if (f) groups.push({ label: f > 1 ? 'بنات المنزَّل' : 'بنت المنزَّل', count: f, share: tzs.mul(f).div(u), per: tzs.div(u) });
  const actual = solve(input, mode);
  return { applicable: true, type, hyp, fShare, capped, tz: tzs, groups, actual, factor: ONE.sub(tzs), errors: [], reason: '' };
}

/* ============ ذوو الأرحام (المادة 168) — تبسيط على مذهب أهل التنزيل ============ */
function solveArham(o) {
  const out = { heirs: [], steps: [], errors: [], notes: [] };
  const spouse = o.spouse === 'husband' ? fr(1, 2) : o.spouse === 'wife' ? fr(1, 4) : ZERO;
  const spouseLabel = o.spouse === 'husband' ? 'الزوج' : o.spouse === 'wife' ? 'الزوجة' : null;
  if (spouseLabel) out.heirs.push({ label: spouseLabel, count: 1, share: spouse, per: spouse, why: (o.spouse === 'husband' ? 'النصف' : 'الربع') + ' فرضاً: ذوو الأرحام ليسوا فرعاً وارثاً فلا يحجبون الزوج/الزوجة عن النصف/الربع' });
  const R = ONE.sub(spouse);
  const cnt = a => (a || []).reduce((s, x) => s + (Number(x.m) || 0) + (Number(x.f) || 0), 0);
  const pos = v => Math.max(0, Math.floor(Number(v) || 0));
  const c1 = (o.c1 || []).map(x => ({ m: pos(x.m), f: pos(x.f) })).filter(x => x.m + x.f > 0);
  const c2 = { mgf: pos(o.c2 && o.c2.mgf), gmfm: pos(o.c2 && o.c2.gmfm) };
  const c3 = (o.c3 || []).map(x => ({ type: x.type, m: pos(x.m), f: pos(x.f) })).filter(x => x.m + x.f > 0);
  const c4 = { pm: pos(o.c4 && o.c4.pm), pf: pos(o.c4 && o.c4.pf), mm: pos(o.c4 && o.c4.mm), mf: pos(o.c4 && o.c4.mf) };
  const any1 = c1.length > 0, any2 = c2.mgf + c2.gmfm > 0, any3 = c3.length > 0, any4 = c4.pm + c4.pf + c4.mm + c4.mf > 0;
  if (!any1 && !any2 && !any3 && !any4) { out.errors.push('لم تُدخل أي قريب من ذوي الأرحام.'); return out; }
  if (spouseLabel) out.steps.push('نصيب ' + spouseLabel + ' ' + spouse.str() + ' ثم يُعطى ما بقي (' + R.str() + ') لذوي الأرحام، ويُعامل الباقي كأنه ردّ (المادة 168).');
  const split = (label, total, m, f, why, equal) => {
    if (!(m + f)) return;
    const u = equal ? m + f : 2 * m + f;
    if (m) out.heirs.push({ label: label[0], count: m, share: total.mul(equal ? m : 2 * m).div(u), per: total.mul(equal ? 1 : 2).div(u), why });
    if (f) out.heirs.push({ label: label[1], count: f, share: total.mul(f).div(u), per: total.div(u), why });
  };
  if (any1) {
    out.steps.push('الصنف الأول: أولاد البنات وأولاد بنات الابن. هم الأقدمون في الاستحقاق فيحجبون كل من بعدهم من الأصناف (المادة 168).');
    const F = c1.length;
    out.steps.push('نُنزِّل كل فرع منزلة أصله (البنت): عدد الأصول المنزَّلة ' + F + '، فيأخذ كل أصل ' + R.div(F).str() + ' من الباقي ثم يقسم فرعه نصيبه للذكر مثل حظ الأنثيين.');
    c1.forEach((x, i) => split(['ابن البنت' + (F > 1 ? ' (الفرع ' + (i + 1) + ')' : ''), 'بنت البنت' + (F > 1 ? ' (الفرع ' + (i + 1) + ')' : '')], R.div(F), x.m, x.f, 'ينزَّل منزلة أمه (البنت) فيأخذ نصيبها'));
  } else if (any2) {
    out.steps.push('الصنف الثاني: الأجداد والجدات الرحميون (أبو الأم، وأم أبي الأم). لا يوجد أحد من الصنف الأول، فيرثون ويحجبون الأصناف الأبعد.');
    const m = c2.mgf, f = c2.gmfm;
    split(['أبو الأم', 'أم أبي الأم'], R, m, f, 'جدّ/جدة رحميّان: للذكر مثل حظ الأنثيين عند الاجتماع، ويستغرق المنفرد الباقي');
  } else if (any3) {
    out.steps.push('الصنف الثالث: أولاد الأخوات وبنات الإخوة. لا يوجد أحد من الصنفين الأولين.');
    const cn = {}; c3.forEach(x => cn[x.type] = (cn[x.type] || 0) + 1);
    const hyp = solve(cn, 'C');
    out.steps.push('نُنزِّل كل فرع منزلة أصله (' + c3.map(x => nm(x.type, 1)).join('، ') + ') ونحسب نصيب الأصول كأنها حيّة: ' + hyp.heirs.map(h => h.label + ' ' + h.share.str()).join('، ') + (hyp.radd ? ' (بعد الردّ)' : '') + '.');
    c3.forEach((x, i) => {
      const hh = hyp.heirs.find(q => q.key === x.type);
      const per = hh ? hh.per : ZERO;
      const equal = x.type === 'ms' || x.type === 'mb';
      split(['ابن ' + nm(x.type, 1) + ' (الفرع ' + (i + 1) + ')'.replace(/ابن /, ''), 'بنت ' + nm(x.type, 1) + ' (الفرع ' + (i + 1) + ')'], per.mul(R), x.m, x.f, equal ? 'ينزَّل منزلة أصله من جهة الأم: يقتسمون بالتساوي' : 'ينزَّل منزلة أصله: للذكر مثل حظ الأنثيين');
    });
  } else {
    out.steps.push('الصنف الرابع: العمات والأعمام لأم والأخوال والخالات. لا يوجد أحد من الأصناف السابقة.');
    const p = c4.pm + c4.pf, q = c4.mm + c4.mf;
    let pT = ZERO, mT = ZERO;
    if (p && q) { pT = R.mul(2).div(3); mT = R.div(3); out.steps.push('اجتمعت القرابة الأبوية والأمّيّة: ثلثا الباقي للقرابة الأبوية (تنزَّل منزلة الأب) وثلثه للأمّيّة (تنزَّل منزلة الأم).'); }
    else if (p) pT = R; else mT = R;
    split(['العم لأم', 'العمة'], pT, c4.pm, c4.pf, 'قرابة أبوية: للذكر مثل حظ الأنثيين');
    split(['الخال', 'الخالة'], mT, c4.mm, c4.mf, 'قرابة أمّيّة: يقتسمون بالتساوي', true);
  }
  out.notes.push('هذا حساب مبسَّط على مذهب أهل التنزيل (الأقرب درجة فالأقرب، وتنزيل كل فرع منزلة أصله)، ولا يغني عن النظر في تفاصيل الدرجات المتفاوتة وقوة القرابة.');
  const tot = out.heirs.reduce((s, h) => s.add(h.share), ZERO);
  if (!tot.eq(ONE)) out.errors.push('تنبيه برمجي: مجموع الأنصبة ' + tot.str());
  return out;
}

/* ============ التخارج ============ */
// heirs: [{key,label,count,share,per}] — exit: {key,k}  mode: 'estate' (يأخذ مبلغاً من التركة) | 'payer' (يشتري نصيبه وارث أو جميع الورثة من مالهم)
function takharuj(heirs, ex) {
  const h = heirs.find(x => x.key === ex.key);
  if (!h) return { errors: ['اختر الوارث الخارج.'] };
  const k = Math.max(1, Math.min(h.count, Math.floor(ex.k || 1)));
  const exitShare = h.per.mul(k);
  const rows = [];
  heirs.forEach(x => {
    if (x.key === ex.key) { const remain = x.count - k; if (remain > 0) rows.push({ key: x.key, label: x.label, count: remain, share: x.per.mul(remain), per: x.per }); }
    else rows.push({ key: x.key, label: x.label, count: x.count, share: x.share, per: x.per });
  });
  const T = rows.reduce((s, r) => s.add(r.share), ZERO);
  const res = { errors: [], exitShare, k, label: h.label, rows: [] };
  if (ex.mode === 'estate') {
    // الباقي بعد ما أخذه الخارج يُقسم على الباقين بنسبة أنصبتهم الأصلية
    res.rows = rows.map(r => ({ ...r, newShare: r.share.div(T), newPer: r.per.div(T) }));
    res.note = 'يأخذ الخارج ما اتُّفق عليه من التركة نفسها، ويُقسم الباقي على الورثة الباقين بنسبة أنصبتهم الأصلية بعضها إلى بعض.';
  } else if (ex.mode === 'payer') {
    const payer = ex.payer;
    if (payer === 'all') {
      res.rows = rows.map(r => ({ ...r, newShare: r.share.add(r.share.div(T).mul(exitShare)), newPer: r.per.add(r.per.div(T).mul(exitShare).div(r.count)) }));
      res.note = 'يشتري الورثة الباقون نصيب الخارج من أموالهم الخاصة ويقتسمونه بنسبة أنصبتهم الأصلية. المبلغ المدفوع يوزَّع عليهم بنفس النسبة.';
    } else {
      const p = rows.find(r => r.key === payer);
      if (!p) { res.errors.push('اختر وارثاً غير الخارج ليدفع.'); return res; }
      res.rows = rows.map(r => r.key === payer ? { ...r, newShare: r.share.add(exitShare), newPer: r.count === 1 ? r.per.add(exitShare) : r.per.add(exitShare.div(r.count)) } : { ...r, newShare: r.share, newPer: r.per });
      res.note = 'يدفع الوارث المختار للخارج من ماله الخاص، فيحلّ محلّه في نصيبه فيضمّه إلى نصيبه، وبقية الورثة لا يتأثرون.';
      res.payer = p.label;
    }
  }
  return res;
}

root.MawarithEngine = { solve, solveTanzil, solveArham, takharuj, Fr, fr, NAMES, KEYS };
if (typeof module !== 'undefined') module.exports = root.MawarithEngine;
})(typeof window !== 'undefined' ? window : globalThis);
