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
  const out = { mode, steps: [], notes: [], heirs: [], blocked: [], errors: [], special: [], bayt: ZERO, base: null, awl: null, radd: null, pools: [], pre: null };
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
    if (res[k]) { res[k].share = res[k].share.add(share); res[k].kind = res[k].kind === kind ? kind : 'فرض وتعصيب'; res[k].why += ' + ' + why; res[k].parts.push({ share, kind, why }); }
    else res[k] = { share, kind, why, parts: [{ share, kind, why }] };
  };
  // لقطة الأنصبة قبل العول والردّ (تُستعمل في عرض الحل بالجدول)
  const snap = () => {
    const sh = {}, kd = {}, pt = {};
    Object.keys(res).forEach(k => { sh[k] = res[k].share; kd[k] = res[k].kind; pt[k] = (res[k].parts || []).map(x => ({ share: x.share, kind: x.kind, why: x.why })); });
    out.pre = Object.assign(out.pre || {}, { shares: sh, kinds: kd, parts: pt });
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
    out.pre = {
      shares: { husband: fr(1, 2), mother: fr(1, 3), gf: fr(1, 6), [sisKey]: fr(1, 2) },
      kinds: { husband: 'فرض', mother: 'فرض', gf: 'فرض', [sisKey]: 'فرض' },
      parts: {}, fardText: { gf: 'سدس للجد + نصف للأخت (يُفرض لها استثناءً) ثم يقتسمان مجموع سهميهما' }
    };
    out.pools.push(['gf', sisKey]);
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
    out.pools.push(['mb', 'ms']);
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
    out.pools.push(['fb', 'fs'], ['pb', 'ps']);
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
    out.pools.push(['mb', 'ms', 'fb', 'fs']);
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
        out.pools.push(ks);
        const u = ks.reduce((s, k) => s + g.m[k] * (k === 'gdaughters' ? gdaughters : n[k]), 0);
        ks.forEach(k => give(k, R.mul(g.m[k] * (k === 'gdaughters' ? gdaughters : n[k])).div(u), 'تعصيب', g.why));
        asabaTaken = true;
      }
      break;
    }
  }

  // ---------- العول أو الباقي (الرد) ----------
  Ssum = sum();
  snap();
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

// ================== الحالات الخاصة: الحمل والمفقود والخنثى والمناسخات ==================
const SPEC = {
  child: ['sons', 'daughters', 'ولد للميت (ابن أو بنت)'],
  gchild: ['gsons', 'gdaughters', 'ولد ابن (ابن ابن أو بنت ابن)'],
  fsib: ['fb', 'fs', 'أخ شقيق أو أخت شقيقة'],
  psib: ['pb', 'ps', 'أخ لأب أو أخت لأب'],
  usib: ['mb', 'ms', 'أخ لأم أو أخت لأم']
};
const cpy = o => { const x = {}; KEYS.forEach(k => { x[k] = Number(o && o[k]) > 0 ? Math.floor(Number(o[k])) : 0; }); return x; };
const rowsOf = r => { const m = {}; r.heirs.forEach(h => { m[h.key] = h; }); return m; };
const minF = (...a) => a.reduce((m, x) => (x.lt(m) ? x : m));
const grpShare = (rows, k, c) => (rows[k] ? rows[k].per.mul(c) : ZERO);
const cntLabel = (m, f) => { const p = []; if (m) p.push(m === 1 ? 'ذكر' : m === 2 ? 'ذكران' : m + ' ذكور'); if (f) p.push(f === 1 ? 'أنثى' : f === 2 ? 'أنثيان' : f + ' إناث'); return p.join(' و'); };

// الحمل: يُعطى كل وارث موجود اليقين (أقل نصيبيه في كل التقادير) ويُوقف الباقي
function solveHaml(input, mode, o) {
  const t = SPEC[o && o.type]; const out = { errors: [], scenarios: [], given: [], held: ZERO, hamalMax: ZERO, typeLabel: t ? t[2] : '' };
  if (!t) { out.errors.push('اختر نوع الحمل.'); return out; }
  const maxN = Math.max(1, Math.min(4, (o.maxN | 0) || 1));
  const base = cpy(input);
  const sc = [{ m: 0, f: 0, label: 'يُولد ميتاً (لا حمل)' }];
  for (let tot = 1; tot <= maxN; tot++) for (let m = tot; m >= 0; m--) sc.push({ m, f: tot - m, label: cntLabel(m, tot - m) });
  for (const s of sc) {
    const h = cpy(base); h[t[0]] += s.m; h[t[1]] += s.f;
    const r = solve(h, mode);
    if (r.errors.length) { out.errors.push(...r.errors); return out; }
    s.rows = rowsOf(r); s.bayt = r.bayt;
    s.hamal = ZERO;
    if (s.m && s.rows[t[0]]) s.hamal = s.hamal.add(s.rows[t[0]].per.mul(s.m));
    if (s.f && s.rows[t[1]]) s.hamal = s.hamal.add(s.rows[t[1]].per.mul(s.f));
    out.scenarios.push(s);
  }
  let sum = ZERO;
  KEYS.forEach(k => {
    if (!base[k]) return;
    const vals = sc.map(s => grpShare(s.rows, k, base[k]));
    const g = minF(...vals);
    sum = sum.add(g);
    out.given.push({ key: k, label: nm(k, base[k]), count: base[k], share: g, all: vals });
  });
  out.held = ONE.sub(sum);
  out.hamalMax = maxF(...sc.map(s => s.hamal));
  out.hamalKeys = t;
  return out;
}

// المفقود: مسألتان (حياً / ميتاً) ويُعطى كل وارث موجود الأقل
function solveMafqud(input, mode, key) {
  const out = { errors: [], rows: [], held: ZERO };
  const base = cpy(input);
  if (!base[key]) { out.errors.push('اختر المفقود من بين الورثة المدخلين.'); return out; }
  const A = solve(base, mode); if (A.errors.length) { out.errors.push(...A.errors); return out; }
  const bd = cpy(base); bd[key] -= 1;
  const B = solve(bd, mode); if (B.errors.length) { out.errors.push(...B.errors); return out; }
  const ra = rowsOf(A), rb = rowsOf(B);
  let sum = ZERO;
  KEYS.forEach(k => {
    const c = base[k] - (k === key ? 1 : 0);
    if (c <= 0) return;
    const a = grpShare(ra, k, c), b = grpShare(rb, k, c), g = minF(a, b);
    sum = sum.add(g);
    out.rows.push({ key: k, label: nm(k, c), count: c, alive: a, dead: b, given: g });
  });
  const mf = ra[key];
  out.mafqudLabel = nm(key, 1);
  out.mafqudAlive = mf ? mf.per : ZERO;
  out.held = ONE.sub(sum);
  out.baytAlive = A.bayt; out.baytDead = B.bayt;
  return out;
}

// الخنثى المشكل (المالكية): لكل وارث نصف مجموع نصيبيه في حالتي الذكورة والأنوثة
function solveKhuntha(input, mode, type) {
  const t = SPEC[type]; const out = { errors: [], rows: [] };
  if (!t || type === 'usib') { out.errors.push(type === 'usib' ? 'الإخوة لأم يرثون سواء كانوا ذكوراً أو إناثاً، فلا يتغير الحساب.' : 'اختر جهة الخنثى.'); if (!t) return out; }
  const base = cpy(input);
  const hm = cpy(base); hm[t[0]] += 1;
  const hf = cpy(base); hf[t[1]] += 1;
  const rm = solve(hm, mode), rf = solve(hf, mode);
  if (rm.errors.length || rf.errors.length) { out.errors.push(...rm.errors, ...rf.errors); return out; }
  const a = rowsOf(rm), b = rowsOf(rf), two = fr(2);
  KEYS.forEach(k => {
    if (!base[k]) return;
    const x = grpShare(a, k, base[k]), y = grpShare(b, k, base[k]);
    out.rows.push({ key: k, label: nm(k, base[k]), count: base[k], male: x, female: y, avg: x.add(y).div(two) });
  });
  const km = a[t[0]] ? a[t[0]].per : ZERO, kf = b[t[1]] ? b[t[1]].per : ZERO;
  out.khuntha = { male: km, female: kf, avg: km.add(kf).div(two) };
  out.bayt = { male: rm.bayt, female: rf.bayt, avg: rm.bayt.add(rf.bayt).div(two) };
  out.typeLabel = t[2];
  return out;
}

// المناسخات
const lcmB = (a, b) => (a === 0n || b === 0n ? 0n : a / gcd(a, b) * b);
function munasakha(p1, m1, deadKey, p2, m2, links) {
  const out = { errors: [] };
  const r1 = solve(p1, m1);
  if (r1.errors.length) { out.errors.push(...r1.errors.map(e => 'المسألة الأولى: ' + e)); return out; }
  const dead = r1.heirs.find(h => h.key === deadKey);
  if (!dead) { out.errors.push('الميت الثاني يجب أن يكون من الورثة الفعليين في المسألة الأولى (غير محجوب).'); return out; }
  const r2 = solve(p2, m2);
  if (r2.errors.length) { out.errors.push(...r2.errors.map(e => 'المسألة الثانية: ' + e)); return out; }
  if (!r2.heirs.length && r2.bayt.isZero()) { out.errors.push('أدخل ورثة الميت الثاني.'); return out; }
  const s1 = dead.per;
  const rows = [];
  r1.heirs.forEach(h => { const c = h.key === deadKey ? h.count - 1 : h.count; if (c > 0) rows.push({ id: 'a' + h.key, key: h.key, label: h.label, count: c, per1: h.per, per2: ZERO, notes: [] }); });
  r2.heirs.forEach(h => {
    const p = s1.mul(h.per), lk = links && links[h.key];
    const tgt = lk ? rows.find(r => r.id === 'a' + lk && r.count === 1 && h.count === 1) : null;
    if (tgt) { tgt.per2 = tgt.per2.add(p); tgt.notes.push('وهو نفسه ' + h.label + ' في المسألة الثانية'); }
    else rows.push({ id: 'b' + h.key, key: h.key, label: h.label, count: h.count, per1: ZERO, per2: p, notes: ['من ورثة الميت الثاني'] });
  });
  out.bayt = r1.bayt.add(s1.mul(r2.bayt));
  out.rows = rows; out.s1 = s1; out.r1 = r1; out.r2 = r2; out.deadLabel = nm(deadKey, 1);
  // طريقة السهام التقليدية
  let T1 = 1n; r1.heirs.forEach(h => { T1 = lcmB(T1, h.per.d); }); T1 = lcmB(T1, r1.bayt.d);
  let T2 = 1n; r2.heirs.forEach(h => { T2 = lcmB(T2, h.per.d); }); T2 = lcmB(T2, r2.bayt.d);
  const dF = s1.mul(fr(Number(T1))); const d = dF.d === 1n ? dF.n : null;
  out.T1 = T1; out.T2 = T2; out.d = d;
  if (d !== null) {
    const g = gcd(d, T2);
    if (d % T2 === 0n) { out.relation = 'انقسام'; out.f1 = 1n; out.f2 = d / T2; }
    else if (g > 1n) { out.relation = 'توافق'; out.g = g; out.f1 = T2 / g; out.f2 = d / g; }
    else { out.relation = 'تباين'; out.f1 = T2; out.f2 = d; }
    out.J = T1 * out.f1;
    rows.forEach(r => { r.sihaam = r.per1.add(r.per2).mul(fr(Number(out.J))); });
  }
  return out;
}

/* ============ طريقة الجدول: أصل المسألة والسهام والعول والردّ والتصحيح ============ */
const gcdN = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) { [a, b] = [b, a % b]; } return a; };
const lcmN = (a, b) => (a / gcdN(a, b)) * b;
const relOf = (a, b) => (a === b ? 'تماثل' : (a % b === 0 || b % a === 0) ? 'تداخل' : gcdN(a, b) > 1 ? 'توافق' : 'تباين');

// نسبة الأعداد المطلوب تضعيفها (تماثل، تداخل، توافق، تباين) للوصول إلى جزء السهم
function combineFactors(list) {
  const steps = [];
  let cur = list.map(x => ({ v: x.v, who: x.who.slice() }));
  let changed = true;
  while (changed && cur.length > 1) {
    changed = false;
    outer: for (let i = 0; i < cur.length; i++) for (let j = i + 1; j < cur.length; j++) {
      const a = cur[i], b = cur[j], t = relOf(a.v, b.v);
      if (t === 'تباين') continue;
      let nv, txt;
      if (t === 'تماثل') { nv = a.v; txt = a.v + ' و' + b.v + ' متماثلان، فنكتفي بأحدهما (' + nv + ').'; }
      else if (t === 'تداخل') { nv = Math.max(a.v, b.v); txt = Math.min(a.v, b.v) + ' داخل في ' + nv + ' (تداخل)، فنكتفي بالأكبر (' + nv + ').'; }
      else { const g = gcdN(a.v, b.v); nv = lcmN(a.v, b.v); txt = a.v + ' و' + b.v + ' متوافقان بالقاسم المشترك ' + g + '، فنضرب أحدهما في وفق الآخر (' + (a.v / g) + ' × ' + b.v + ') = ' + nv + '.'; }
      cur.splice(j, 1); cur[i] = { v: nv, who: a.who.concat(b.who) }; steps.push(txt); changed = true; break outer;
    }
  }
  const part = cur.reduce((p, x) => p * x.v, 1);
  if (cur.length > 1) steps.push('الأعداد ' + cur.map(x => x.v).join(' و') + ' متباينة، فنضرب بعضها في بعض: ' + cur.map(x => x.v).join(' × ') + ' = ' + part + '.');
  return { part, steps };
}

function buildTable(r) {
  if (!r || !r.pre || !r.pre.shares || !r.heirs.length) return null;
  const P = r.pre, mode = r.mode;
  P.parts = P.parts || {};
  const byKey = {}, order = r.heirs.map(h => h.key);
  r.heirs.forEach(h => { byKey[h.key] = h; });
  // 1) الفئات: الورثة الذين يقتسمون نصيباً واحداً (رؤوس) يجمعهم صف واحد
  const used = new Set(), blocks = [];
  (r.pools || []).forEach(pool => {
    const ks = pool.filter(k => byKey[k] && !used.has(k));
    if (ks.length < 2) return;
    const pers = ks.map(k => byKey[k].per);
    const mn = pers.reduce((m, x) => (x.lt(m) ? x : m));
    const ws = pers.map(x => x.div(mn));
    if (!ws.every(w => w.d === 1n)) return;
    ks.forEach(k => used.add(k));
    blocks.push({ keys: ks, w: ws.map(w => Number(w.n)) });
  });
  order.forEach(k => { if (!used.has(k)) blocks.push({ keys: [k], w: [1] }); });
  const pos = b => Math.min(...b.keys.map(k => order.indexOf(k)));
  blocks.sort((a, b) => pos(a) - pos(b));
  const fardText = b => {
    const ov = P.fardText && b.keys.map(k => P.fardText[k]).find(Boolean);
    if (ov) return ov;
    const parts = [].concat(...b.keys.map(k => P.parts[k] || []));
    const f = parts.filter(p => p.kind === 'فرض'), a = parts.filter(p => p.kind === 'تعصيب');
    if (!parts.length) return b.share.str();
    if (f.length === parts.length) return b.share.str() + ' فرضاً';
    if (a.length === parts.length) return 'الباقي تعصيباً';
    if (f.length && a.length && f.length + a.length === parts.length) return f.reduce((s, p) => s.add(p.share), ZERO).str() + ' فرضاً + الباقي تعصيباً';
    if (parts.some(p => p.kind === 'تشريك')) return b.share.str() + ' (يشتركون فيه)';
    return b.share.str() + ' (' + String(parts[0].why).split(' + ')[0] + ')';
  };
  blocks.forEach(b => {
    b.share = b.keys.reduce((s, k) => s.add(P.shares[k]), ZERO);
    b.members = b.keys.map((k, i) => ({ key: k, label: byKey[k].label, count: byKey[k].count, w: b.w[i] }));
    b.count = b.members.reduce((s, m) => s + m.count, 0);
    b.heads = b.members.reduce((s, m) => s + m.w * m.count, 0);
    b.fard = fardText(b);
  });
  const T = { mode, errors: [], steps: [], blocks };
  const S = T.steps;
  const say = (title, ...ps) => S.push({ title, ps });
  const bl = b => b.members.map(m => m.label).join(' و');
  // 2) أصل المسألة
  let Lb = 1n; blocks.forEach(b => { Lb = lcmB(Lb, b.share.d); });
  let asl = Number(Lb);
  const single = blocks.length === 1 && blocks[0].share.eq(ONE);
  if (single) asl = Math.max(1, blocks[0].heads);
  blocks.forEach(b => { b.u0 = single ? b.heads : Number(b.share.n) * (asl / Number(b.share.d)); });
  const T0 = blocks.reduce((s, b) => s + b.u0, 0);
  T.asl = asl; T.T0 = T0;
  const dens = [...new Set(blocks.map(b => Number(b.share.d)).filter(d => d > 1))].sort((a, b) => a - b);
  if (single) {
    say('أصل المسألة', 'لا يوجد في هذه المسألة صاحب فرض، والتركة كلها لمن يرثون بالتعصيب (' + bl(blocks[0]) + ').',
      'فيكون أصل المسألة هو عدد رؤوسهم' + (blocks[0].members.some(m => m.w > 1) ? ' (للذكر رأسان وللأنثى رأس، لأن للذكر مثل حظ الأنثيين)' : '') + ' = ' + asl + '.');
  } else {
    say('أصل المسألة', 'نكتب نصيب كل وارث: ' + blocks.map(b => bl(b) + ' ' + b.fard).join('، ') + '.',
      'مقامات الأنصبة: ' + (dens.length ? dens.join('، ') : '1') + '، وأصغر عدد تنقسم عليه كلها قسمة صحيحة هو ' + asl + '، فأصل المسألة ' + asl + '.');
  }
  // 3) السهام
  say('سهام كل وارث', 'سهم الوارث = نصيبه × أصل المسألة (' + asl + '): ' + blocks.map(b => bl(b) + ' = ' + b.u0).join('، ') + (!single && blocks.some(b => /الباقي/.test(b.fard)) ? '. ويأخذ العاصب ما بقي بعد الفروض' : '') + '.',
    'مجموع السهام = ' + T0 + (T0 === asl ? '، وهو يساوي أصل المسألة، فالمسألة عادلة ولا عول فيها ولا ردّ.' : T0 > asl ? '، وهو أكبر من أصل المسألة (' + asl + ').' : '، وهو أقل من أصل المسألة (' + asl + ') وينقصه ' + (asl - T0) + ' من السهام.'));
  // 4) العول أو الردّ أو الباقي
  let base1 = asl, kind = 'عادلة';
  blocks.forEach(b => { b.u1 = b.u0; });
  let restU = Math.max(0, asl - T0), restLabel = null;
  if (T0 > asl) {
    kind = 'عائلة'; base1 = T0; restU = 0;
    T.awl = { from: asl, to: T0 };
    const canAwl = { 6: '7 و8 و9 و10', 12: '13 و15 و17', 24: '27' };
    say('العول', 'مجموع السهام (' + T0 + ') أكبر من أصل المسألة (' + asl + ')، فالمسألة عائلة: الفروض تزيد على التركة.',
      'تعول المسألة فيصير أصلها ' + T0 + '، ويدخل النقص على جميع أصحاب الفروض بنسبة سهامهم، فنصيب كل واحد = سهمه ÷ ' + T0 + ' بدل سهمه ÷ ' + asl + '.',
      canAwl[asl] ? 'الأصل ' + asl + ' من الأصول التي تعول، وعوله إلى ' + canAwl[asl] + '. وهنا عالت إلى ' + T0 + '.' : 'تنبيه: الأصل ' + asl + ' ليس من الأصول المعروفة بالعول (6 و12 و24)، فراجع إدخال الورثة.');
    if (r.special.includes('الأكدرية')) S[S.length - 1].ps.push('وهذه هي الأكدرية: تُفرض للأخت النصف، فتعول المسألة من 6 إلى 9، ثم يضمّ الجدّ سهمه إلى سهم الأخت ويقتسمانه للذكر مثل حظ الأنثيين.');
  } else if (T0 < asl) {
    const elig = b => b.keys.every(k => !['husband', 'wives', 'father', 'gf'].includes(k) && P.kinds[k] === 'فرض');
    if (r.radd) {
      kind = 'ردية'; restU = 0;
      const R = blocks.filter(elig), Fx = blocks.filter(b => !elig(b));
      const src = mode === 'C' ? 'المادة 167 من قانون الأسرة الجزائري' : 'فتوى المتأخرين من المالكية';
      if (!R.length) {
        base1 = 1; blocks.forEach(b => { b.u1 = 1; });
        T.radd = { spouseOnly: true };
        say('الردّ', 'بقي ' + (asl - T0) + ' من السهام (من أصل ' + asl + ') ولا عاصب ولا صاحب فرض نسبي، فيُردّ الباقي على أحد الزوجين (' + src + '، الفقرة الثانية).',
          'فيأخذ ' + bl(blocks[0]) + ' التركة كلها، وتصير المسألة من 1.');
      } else {
        let L2 = 1n; R.forEach(b => { L2 = lcmB(L2, b.share.d); });
        const l2 = Number(L2), raw = R.map(b => Number(b.share.n) * (l2 / Number(b.share.d)));
        const g2 = raw.reduce((g, x) => gcdN(g, x), 0) || 1, red = raw.map(x => x / g2), T2 = red.reduce((s, x) => s + x, 0);
        if (!Fx.length) {
          base1 = T2; R.forEach((b, i) => { b.u1 = red[i]; });
          T.radd = { spouse: false, units: red, T2 };
          say('الردّ', 'مجموع السهام (' + T0 + ') أقل من أصل المسألة (' + asl + ') وبقي ' + (asl - T0) + ' من السهام ولا عاصب، والمسألة هنا ردّية (' + src + ').',
            'يُردّ الباقي على أصحاب الفروض بنسبة سهامهم، أي نجعل أصل المسألة مجموع سهامهم' + (g2 > 1 ? ' بعد اختصارها بقسمتها على ' + g2 : '') + ': ' + R.map((b, i) => bl(b) + ' ' + red[i]).join('، ') + ' فيكون المجموع ' + T2 + '.',
            'فتصير المسألة من ' + T2 + ' بدل ' + asl + '.');
        } else {
          let L1 = 1n; Fx.forEach(b => { L1 = lcmB(L1, b.share.d); });
          const b1 = Number(L1), fu = Fx.map(b => Number(b.share.n) * (b1 / Number(b.share.d)));
          const rr = b1 - fu.reduce((s, x) => s + x, 0), gg = gcdN(rr, T2);
          let m, relation;
          if (rr % T2 === 0) { m = 1; relation = 'انقسام'; } else if (gg > 1) { m = T2 / gg; relation = 'توافق'; } else { m = T2; relation = 'تباين'; }
          base1 = b1 * m;
          Fx.forEach((b, i) => { b.u1 = fu[i] * m; });
          R.forEach((b, i) => { b.u1 = red[i] * (rr * m / T2); });
          T.radd = { spouse: true, base1: b1, fixed: Fx.map((b, i) => ({ label: bl(b), u: fu[i] })), rr, units: red, T2, relation, m, g: gg };
          say('الردّ (مع وجود ' + Fx.map(bl).join(' و') + ')', 'مجموع السهام (' + T0 + ') أقل من أصل المسألة (' + asl + ') وبقي ' + (asl - T0) + ' من السهام ولا عاصب، فالمسألة ردّية (' + src + ').',
            'لا يُردّ على الزوجين، فنحلّ مسألتين: المسألة الأولى أصلها ' + b1 + ' بحسب فرض ' + Fx.map(bl).join(' و') + ': ' + Fx.map((b, i) => bl(b) + ' ' + fu[i]).join('، ') + '، والباقي ' + rr + ' من السهام لبقية الورثة.',
            'المسألة الثانية (مسألة الردّ) من سهام بقية الورثة' + (g2 > 1 ? ' بعد الاختصار' : '') + ': ' + R.map((b, i) => bl(b) + ' ' + red[i]).join('، ') + ' فمجموعها ' + T2 + '.',
            'نقارن الباقي (' + rr + ') بمجموع سهام الردّ (' + T2 + '): ' + (relation === 'انقسام' ? 'ينقسم الباقي على ' + T2 + ' قسمة صحيحة (انقسام)، فلا نضرب شيئاً وأصل المسألة ' + b1 + '.' : relation === 'توافق' ? 'بينهما توافق بالقاسم ' + gg + '، فنضرب المسألة الأولى في وفق مجموع الردّ (' + T2 + ' ÷ ' + gg + ' = ' + m + ') فتصير ' + b1 + ' × ' + m + ' = ' + base1 + '.' : 'بينهما تباين، فنضرب المسألة الأولى في مجموع سهام الردّ (' + T2 + ') فتصير ' + b1 + ' × ' + T2 + ' = ' + base1 + '.'),
            'ثم تُضرب سهام ' + Fx.map(bl).join(' و') + ' في ' + m + '، ويقتسم بقية الورثة ' + (rr * m) + ' من السهام بنسبة سهام الردّ (' + red.join(' : ') + ').');
        }
      }
    } else {
      kind = 'ناقصة'; restLabel = mode === 'A' ? 'بيت المال' : 'الباقي (ذوو الأرحام أو بيت المال)';
      say('الباقي', 'بقي ' + (asl - T0) + ' من السهام (من أصل ' + asl + ') ولا عاصب في المسألة.',
        mode === 'A' ? 'أصل المذهب المالكي أنه لا ردّ على أصحاب الفروض ولا توريث لذوي الأرحام، فيؤول الباقي إلى بيت المال.' : 'لا يُردّ هنا على أحد من الورثة المذكورين، فيؤول الباقي إلى ذوي الأرحام (المادة 168) فإن لم يوجدوا فللخزينة العمومية/بيت المال.');
    }
  }
  T.kind = kind; T.base1 = base1; T.restLabel = restLabel;
  // 5) التصحيح
  const checks = blocks.map(b => {
    const u = b.u1, c = b.heads;
    if (c <= 1 || u % c === 0) return { b, ok: true };
    const g = gcdN(u, c);
    return { b, ok: false, u, c, g, relation: g > 1 ? 'توافق' : 'تباين', factor: g > 1 ? c / g : c };
  });
  const need = checks.filter(x => !x.ok);
  let part = 1;
  if (!need.length) {
    const mh = blocks.filter(b => b.heads > 1);
    say('التصحيح', mh.length ? 'نقارن سهام كل فريق بعدد رؤوسه: ' + mh.map(b => bl(b) + ' (السهام ' + b.u1 + '، الرؤوس ' + b.heads + ')').join('، ') + '. كل فريق تنقسم سهامه على رؤوسه قسمة صحيحة، فلا تحتاج المسألة إلى تصحيح وتصحّ من ' + base1 + '.'
      : 'كل وارث في المسألة فرد واحد، فلا حاجة إلى تصحيح وتصحّ المسألة من ' + base1 + '.');
  } else {
    const ps = ['نقارن سهام كل فريق بعدد رؤوسه' + (blocks.some(b => b.members.some(m => m.w > 1)) ? ' (الذكر برأسين والأنثى برأس)' : '') + ':'];
    need.forEach(x => ps.push(bl(x.b) + ': سهامهم ' + x.u + ' وعدد رؤوسهم ' + x.c + ' فلا تنقسم. العلاقة بين ' + x.u + ' و' + x.c + ' ' + x.relation + (x.relation === 'توافق' ? ' (القاسم المشترك ' + x.g + ')، فنأخذ وفق عدد الرؤوس: ' + x.c + ' ÷ ' + x.g + ' = ' + x.factor : '، فنأخذ عدد الرؤوس كاملاً: ' + x.factor) + '.'));
    const cf = combineFactors(need.map(x => ({ v: x.factor, who: [bl(x.b)] })));
    part = cf.part;
    if (need.length > 1) { ps.push('نقارن الأعداد الناتجة ' + need.map(x => x.factor).join(' و') + ' فيما بينها:'); cf.steps.forEach(t => ps.push(t)); }
    ps.push('جزء السهم = ' + part + '، فنضرب أصل المسألة' + (T.awl || T.radd ? ' بعد ' + (T.awl ? 'العول' : 'الردّ') : '') + ' (' + base1 + ') في ' + part + ' فتصحّ المسألة من ' + (base1 * part) + '، وتُضرب سهام كل وارث في ' + part + '.');
    say('التصحيح', ...ps);
  }
  T.checks = checks.map(x => ({ label: bl(x.b), ok: x.ok, u: x.b.u1, heads: x.b.heads, relation: x.ok ? (x.b.heads > 1 ? 'انقسام' : null) : x.relation, g: x.ok ? null : x.g, factor: x.factor || null }));
  T.cfSteps = need.length > 1 ? combineFactors(need.map(x => ({ v: x.factor, who: [bl(x.b)] }))).steps : [];
  T.part = part; T.base2 = base1 * part;
  blocks.forEach(b => {
    b.u2 = b.u1 * part;
    b.members.forEach(m => { m.perU = (b.u2 / b.heads) * m.w; });
  });
  T.restU = restU * part;
  // 6) نصيب كل فرد
  say('نصيب كل وارث', 'بعد التصحيح تصحّ المسألة من ' + T.base2 + '، وسهام الورثة: ' + blocks.map(b => b.members.length === 1 && b.members[0].count === 1 ? bl(b) + ' ' + b.u2 : b.members.map(m => m.label + (m.count > 1 ? ' (للفرد الواحد ' + m.perU + ')' : ' ' + m.perU)).join('، ')).join('، ') + (T.restU ? '، و' + (restLabel || 'الباقي') + ' ' + T.restU : '') + '.',
    'ونصيب الوارث من التركة = سهامه ÷ ' + T.base2 + '، أي أن الجدول يوصل إلى الأنصبة نفسها التي في الحساب الكسري.');
  // تحقق داخلي: كل نصيب من الجدول = نصيب المحرك
  T.consistent = blocks.every(b => b.members.every(m => fr(m.perU * m.count, T.base2).eq(byKey[m.key].share))) && blocks.reduce((s, b) => s + b.u2, 0) + T.restU === T.base2;
  return T;
}

/* ============ المناسخات المتعددة (سلسلة وفيات) بطريقة السهام ============ */
// steps: [{ deadId, p2, mode, links }]  deadId = معرّف صف الميت في نتيجة المرحلة السابقة (مثل '0:mother')
function munasakhaChain(p1, m1, steps) {
  const out = { errors: [], stages: [], rows: [], J: 0, baytU: 0 };
  const r1 = solve(p1, m1);
  if (r1.errors.length) { out.errors.push(...r1.errors.map(e => 'المسألة الأولى: ' + e)); return out; }
  const tb = r => { try { return buildTable(r); } catch (e) { return null; } };
  const smalls = r => r.heirs.map(h => ({ key: h.key, label: h.label, count: h.count, u: Number(h.unitsPer.n / h.unitsPer.d) }));
  let J = r1.base;
  let rows = r1.heirs.map(h => ({ id: '0:' + h.key, stage: 0, key: h.key, label: h.label, count: h.count, u: Number(h.unitsPer.n / h.unitsPer.d), notes: [] }));
  let baytU = Number(r1.bayt.mul(fr(J)).n / r1.bayt.mul(fr(J)).d);
  const t1 = tb(r1);
  out.stages.push({ n: 1, title: 'المسألة الأولى', heirs: smalls(r1), base: J, kind: t1 ? t1.kind : '', asl: t1 ? t1.asl : J, baytU });
  const ORD = ['الأولى', 'الثانية', 'الثالثة', 'الرابعة', 'الخامسة'];
  for (let i = 0; i < steps.length; i++) {
    const st = steps[i], n = i + 2, nm2 = ORD[n - 1] || String(n);
    const dead = rows.find(r => r.id === st.deadId);
    if (!dead) { out.errors.push('اختر الميت في المسألة ' + nm2 + '.'); return out; }
    const r2 = solve(st.p2, st.mode || m1);
    if (r2.errors.length && !r2.heirs.length) { out.errors.push(...r2.errors.map(e => 'المسألة ' + nm2 + ': ' + e)); return out; }
    if (!r2.heirs.length && r2.bayt.isZero()) { out.errors.push('أدخل ورثة الميت في المسألة ' + nm2 + '.'); return out; }
    const d = dead.u, T2 = r2.base, g = gcdN(d, T2);
    let relation, f1, f2;
    if (d % T2 === 0) { relation = 'انقسام'; f1 = 1; f2 = d / T2; }
    else if (g > 1) { relation = 'توافق'; f1 = T2 / g; f2 = d / g; }
    else { relation = 'تباين'; f1 = T2; f2 = d; }
    const before = rows.map(r => ({ ...r, notes: r.notes.slice() }));
    const nr = [];
    rows.forEach(r => {
      if (r.id === dead.id) { if (r.count > 1) nr.push({ ...r, count: r.count - 1, u: r.u * f1, notes: r.notes.slice() }); }
      else nr.push({ ...r, u: r.u * f1, notes: r.notes.slice() });
    });
    const links = st.links || {};
    const t2 = tb(r2), deadLbl = dead.label + (dead.stage ? ' (من المسألة ' + ORD[dead.stage] + ')' : '');
    r2.heirs.forEach(h => {
      const pu = Number(h.unitsPer.n / h.unitsPer.d) * f2;
      const tgt = links[h.key] ? nr.find(x => x.id === links[h.key] && x.count === 1 && h.count === 1) : null;
      if (tgt) { tgt.u += pu; tgt.notes.push('وهو نفسه ' + h.label + ' في المسألة ' + nm2); }
      else nr.push({ id: (n - 1) + ':' + h.key, stage: n - 1, key: h.key, label: h.label, count: h.count, u: pu, notes: ['من ورثة ' + dead.label + ' (المسألة ' + nm2 + ')'] });
    });
    const b2 = Number(r2.bayt.mul(fr(T2)).n / r2.bayt.mul(fr(T2)).d);
    baytU = baytU * f1 + b2 * f2;
    const Jn = J * f1;
    const total = nr.reduce((s, r) => s + r.u * r.count, 0) + baytU;
    if (total !== Jn) { out.errors.push('تنبيه برمجي: مجموع السهام (' + total + ') لا يساوي الجامعة (' + Jn + ')'); return out; }
    const relTxt = relation === 'انقسام'
      ? 'سهامه (' + d + ') تنقسم على مسألته (' + T2 + ') قسمة صحيحة، فلا نضرب في شيء: جزء سهم المسألة السابقة 1، والجامعة تبقى ' + J + '.'
      : relation === 'توافق'
        ? 'سهامه (' + d + ') ومسألته (' + T2 + ') متوافقان بالقاسم المشترك ' + g + '. نأخذ وفق مسألته (' + T2 + ' ÷ ' + g + ' = ' + f1 + ') ونضربه في المسألة السابقة: ' + J + ' × ' + f1 + ' = ' + Jn + '.'
        : 'سهامه (' + d + ') ومسألته (' + T2 + ') متباينان (لا قاسم مشترك غير 1). نضرب كل مسألته (' + T2 + ') في المسألة السابقة: ' + J + ' × ' + T2 + ' = ' + Jn + '.';
    out.stages.push({
      n, title: 'المسألة ' + nm2, deadLabel: deadLbl, d, J, T2, relation, g, f1, f2, Jn,
      heirs: smalls(r2), base: T2, kind: t2 ? t2.kind : '', asl: t2 ? t2.asl : T2, baytU2: b2,
      text: [
        'مات ' + deadLbl + ' قبل قسمة التركة. نصيبه من المسألة السابقة ' + d + ' سهماً من ' + J + '.',
        'نحلّ مسألته وحدها كأنه المتوفى الوحيد: ورثته ' + (r2.heirs.map(h => h.label + (h.count > 1 ? ' (' + h.count + ')' : '')).join('، ') || 'لا أحد') + '، وتصحّ مسألته من ' + T2 + '.',
        'ننظر بين سهامه (' + d + ') ومسألته (' + T2 + '): ' + relation + '.', relTxt,
        'نضرب سهام الأحياء من المسألة السابقة في ' + f1 + '، ونضرب سهام ورثة الميت (من مسألته) في ' + f2 + ' (لأن سهامه صارت ' + d * f1 + ' = ' + T2 + ' × ' + f2 + ').',
        'الجامعة الآن ' + Jn + '، ومجموع السهام ' + total + ' يساويها.'
      ]
    });
    rows = nr; J = Jn;
  }
  out.rows = rows.map(r => ({ ...r, per: fr(r.u, J), all: fr(r.u * r.count, J) }));
  out.J = J; out.baytU = baytU; out.bayt = fr(baytU, J);
  return out;
}

root.MawarithEngine = { munasakhaChain, buildTable, solve, solveTanzil, solveArham, takharuj, solveHaml, solveMafqud, solveKhuntha, munasakha, SPEC, Fr, fr, NAMES, KEYS };
if (typeof module !== 'undefined') module.exports = root.MawarithEngine;
})(typeof window !== 'undefined' ? window : globalThis);
