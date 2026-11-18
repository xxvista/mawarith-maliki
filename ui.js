(function(){
const E=window.MawarithEngine;
const MODES=[
 {id:'A',t:'أصل المذهب المالكي',d:'لا ردّ على أصحاب الفروض، والفاضل لبيت المال.'},
 {id:'B',t:'المفتى به عند المتأخرين',d:'ردّ الفاضل على أصحاب الفروض غير الزوجين.'},
 {id:'C',t:'قانون الأسرة الجزائري',d:'الردّ (المادة 167) بلا ولاء، ويُفعَّل معه التنزيل وذوو الأرحام.'}];
const GROUPS=[
 ['الزوجان',[['husband','الزوج',1],['wives','الزوجات',4]]],
 ['الأصول',[['father','الأب',1],['mother','الأم',1],['gf','الجد (أبو الأب)',1],['gm_m','أم الأم',1],['gm_p','أم الأب',1],['gm_mm','أم أم الأم',1],['gm_pm','أم أم الأب',1]]],
 ['الفروع',[['sons','الأبناء',30],['daughters','البنات',30],['gsons','أبناء الابن',30],['gdaughters','بنات الابن',30]]],
 ['الإخوة والأخوات',[['fb','الإخوة الأشقاء',30],['fs','الأخوات الشقيقات',30],['pb','الإخوة لأب',30],['ps','الأخوات لأب',30],['mb','الإخوة لأم',30],['ms','الأخوات لأم',30]]],
 ['العصبات الأبعد',[['nfb','أبناء الأخ الشقيق',30],['npb','أبناء الأخ لأب',30],['ufb','الأعمام الأشقاء',30],['upb','الأعمام لأب',30],['cfb','أبناء العم الشقيق',30],['cpb','أبناء العم لأب',30],['mawla','المعتِق (الولاء)',1]]]];
let mode='A',gender='m',last=null;
const val={};E.KEYS.forEach(k=>val[k]=0);
const $=s=>document.querySelector(s);
const TABS=['calc','learn','arham','takh','rules','ex','refs'];

function tab(t){document.querySelectorAll('.tab').forEach(e=>e.classList.toggle('on',e.id===t));document.querySelectorAll('#nav button').forEach(b=>b.classList.toggle('on',b.dataset.t===t));try{history.replaceState(null,'','#'+t)}catch(e){}
  if(t==='takh')drawTakh();if(t==='learn'&&curL<0&&!chal)renderLessonList();}
$('#nav').onclick=e=>{const b=e.target.closest('button');if(b){tab(b.dataset.t);window.scrollTo({top:0,behavior:'smooth'})}};
const h0=(location.hash||'').slice(1);if(TABS.includes(h0))tab(h0);

function drawModes(){$('#modes').innerHTML=MODES.map(m=>`<button class="mode ${m.id===mode?'on':''}" data-m="${m.id}"><b>${m.t}</b><span>${m.d}</span></button>`).join('')}
$('#modes').onclick=e=>{const b=e.target.closest('.mode');if(!b)return;mode=b.dataset.m;if(mode==='C')val.mawla=0;drawModes();drawHeirs()};
$('#gender').onclick=e=>{const b=e.target.closest('button');if(!b)return;gender=b.dataset.g;setGender();drawHeirs()};
function setGender(){document.querySelectorAll('#gender button').forEach(b=>b.classList.toggle('on',b.dataset.g===gender));if(gender==='m')val.husband=0;else val.wives=0}

function drawHeirs(){
  const openFar=[...document.querySelectorAll('#heirs details')].map(x=>x.open);
  let html='';
  GROUPS.forEach(([title,items])=>{
    const its=items.filter(([k])=>!(k==='husband'&&gender==='m')&&!(k==='wives'&&gender==='f')&&!(k==='mawla'&&mode==='C'));
    const far=title==='العصبات الأبعد';
    const body=its.map(([k,l,mx])=>`<div class="hv ${val[k]?'has':''}"><label>${l}</label><div class="step"><button data-k="${k}" data-d="-1" aria-label="إنقاص">−</button><output>${val[k]}</output><button data-k="${k}" data-d="1" data-mx="${mx}" aria-label="زيادة">+</button></div></div>`).join('');
    const open=far&&(its.some(([k])=>val[k])||openFar[0])?' open':'';
    html+=far?`<details class="grp"${open}><summary>${title}</summary><div class="grid" style="margin-top:8px">${body}</div></details>`:`<div class="grp"><div class="t">${title}</div><div class="grid">${body}</div></div>`;
  });
  $('#heirs').innerHTML=html;
}
$('#heirs').onclick=e=>{const b=e.target.closest('button[data-k]');if(!b)return;const k=b.dataset.k,d=+b.dataset.d;
  const cap=+(document.querySelector(`button[data-k="${k}"][data-mx]`).dataset.mx);
  val[k]=Math.max(0,Math.min(cap,val[k]+d));drawHeirs()};

const fmtMoney=x=>{try{return x.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}catch(e){return x.toFixed(2)}};
const pct=f=>(f.num()*100).toFixed(2).replace(/\.?0+$/,'')+'%';
const COLORS=['#1f5a43','#b5832a','#3d7cae','#a64b3c','#6e5aa8','#4a9a8a','#c1773b','#7a8b3a','#8a5a7a','#556b8d','#9b7b3a','#3c6f6f'];
const money=(f,net)=>net==null?null:fmtMoney(Number(f.n)*net/Number(f.d));
const esc=s=>String(s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
const F=f=>f.d===1n?String(f.n):`<span class="fr"><b>${f.n}</b><b>${f.d}</b></span>`;
const unitsOf=(f,base)=>Number(f.mul(base).n/f.mul(base).d);

// ---------- أدلة مختصرة ----------
function dalil(key,kind){
  const a=[];
  if(['husband','wives'].includes(key))a.push('الزوجية: ﴿وَلَكُمْ نِصْفُ مَا تَرَكَ أَزْوَاجُكُمْ…﴾ و﴿وَلَهُنَّ الرُّبُعُ…﴾ (النساء: 12)');
  if(['sons','daughters'].includes(key))a.push('﴿يُوصِيكُمُ اللَّهُ فِي أَوْلَادِكُمْ لِلذَّكَرِ مِثْلُ حَظِّ الْأُنثَيَيْنِ…﴾ (النساء: 11)');
  if(['father','mother'].includes(key))a.push('﴿وَلِأَبَوَيْهِ لِكُلِّ وَاحِدٍ مِّنْهُمَا السُّدُسُ…﴾ (النساء: 11)');
  if(['mb','ms'].includes(key))a.push('﴿وَإِن كَانَ رَجُلٌ يُورَثُ كَلَالَةً… فَلِكُلِّ وَاحِدٍ مِّنْهُمَا السُّدُسُ…﴾ (النساء: 12)');
  if(['fb','fs','pb','ps'].includes(key))a.push('﴿يَسْتَفْتُونَكَ قُلِ اللَّهُ يُفْتِيكُمْ فِي الْكَلَالَةِ…﴾ (النساء: 176)');
  if(['gm_m','gm_p','gm_mm','gm_pm'].includes(key))a.push('السنّة: أن النبي ﷺ أعطى الجدة السدس');
  if(key==='gf')a.push('الجدّ كالأب في الإرث بالإجماع، واختُلف في حجبه الإخوة فأخذ المالكية بقول زيد بن ثابت');
  if(['gsons','gdaughters'].includes(key))a.push('أبناء الابن وبناته كالأبناء والبنات عند عدمهم (الفرع الوارث)');
  if(kind&&kind.includes('تعصيب'))a.push('التعصيب: «أَلْحِقُوا الفَرَائِضَ بِأَهْلِهَا، فَمَا بَقِيَ فَهُوَ لِأَوْلَى رَجُلٍ ذَكَرٍ» (متفق عليه)');
  return a;
}

// ---------- الشرح التعليمي ----------
function explain(r,ctx){
  let o=`<h3>شرح النتيجة خطوة خطوة</h3><div class="edu">`;
  const present=r.heirs.map(h=>h.count>1?`${h.label} (${h.count})`:h.label);
  o+=`<h4>١. من الذي يرث ومن الذي لا يرث؟</h4><p>الورثة الذين لهم نصيب في هذه المسألة: ${present.join('، ')}. `;
  if(r.blocked.length)o+=`وأما ${r.blocked.map(b=>b.label).join('، ')} فلا شيء لهم. والسبب أن القريب الأقرب أو الأقوى يحجب من هو أبعد منه، ويُسمّى هذا الحجب.</p><ul class="blocked">${r.blocked.map(b=>`<li><b>${b.label}</b>: ${b.reason}.</li>`).join('')}</ul>`;
  else o+=`ولم يُحجب أحد ممن أدخلتهم.</p>`;
  const fur=r.heirs.filter(h=>h.kind==='فرض'),asb=r.heirs.filter(h=>h.kind!=='فرض');
  o+=`<h4>٢. ما نوع كل نصيب؟</h4><p>الميراث نوعان: <b>فرض</b> وهو نصيب مقدَّر بنص (النصف والربع والثمن والثلثان والثلث والسدس)، و<b>تعصيب</b> وهو أخذ ما بقي بعد أصحاب الفروض أو أخذ المال كله عند الانفراد. `;
  o+=(fur.length?`في مسألتك أصحاب الفروض: ${fur.map(h=>h.label).join('، ')}. `:'لا يوجد أصحاب فروض صرفاً. ')+(asb.length?`وأصحاب التعصيب أو من جمعوا الفرض والتعصيب: ${asb.map(h=>h.label).join('، ')}.`:'ولا عاصب في المسألة.')+`</p>`;
  o+=`<h4>٣. لماذا أخذ كل وارث هذا النصيب؟</h4><ol class="steps">`;
  r.heirs.forEach(h=>{
    const d=dalil(h.key,h.kind);
    o+=`<li><b>${h.label}</b> ${h.count>1?`(${h.count} أشخاص): الجميع معاً <span class="frac">${h.share.str()}</span> ونصيب الفرد <span class="frac">${h.per.str()}</span>`:`: <span class="frac">${h.share.str()}</span>`}. ${esc(h.why)}.${d.length?`<div class="small">الأصل: ${d.join('؛ ')}.</div>`:''}</li>`;
  });
  o+=`</ol>`;
  o+=`<h4>٤. أصل المسألة وتصحيحها</h4><p>أصل المسألة هو أصغر عدد تنقسم عليه كل الأنصبة قسمة صحيحة، ويُسمّى المضاعف المشترك الأصغر لمقامات الأنصبة. هنا أصل المسألة <b>${r.base}</b>. فكل وارث يأخذ من هذه السهام: <i>نصيبه × ${r.base}</i>:</p><ul>`;
  r.heirs.forEach(h=>{o+=`<li>${h.label}: ${h.share.str()} × ${r.base} = <b>${h.units}</b> سهماً${h.count>1?` (لكل فرد ${h.unitsPer.str()})`:''}</li>`});
  if(!r.bayt.isZero())o+=`<li>الباقي غير الموزَّع: ${r.bayt.str()} × ${r.base} = <b>${unitsOf(r.bayt,r.base)}</b> سهماً</li>`;
  o+=`</ul><p>مجموع السهام = ${r.heirs.reduce((s,h)=>s+h.units,0)+unitsOf(r.bayt,r.base)} وهو يساوي أصل المسألة (${r.base})، فالقسمة سليمة.</p>`;
  if(r.awl)o+=`<p><b>العول:</b> كانت الفروض تحتاج إلى ${r.awl.from} سهماً لكن المسألة لا تحتمل إلا ما فيها من مال، فجُعل أصل المسألة ${r.awl.to} ودخل النقص على الجميع بنسبة سهامهم. فالزوج مثلاً لا ينال نصفه كاملاً من التركة بل ما يناسب سهمه من ${r.awl.to}.</p>`;
  o+=`<h4>٥. التحقق</h4><p>مجموع الأنصبة ${r.check.str()} (أي الواحد الصحيح) فلا زيادة ولا نقص.</p>`;
  if(ctx&&ctx.net!=null)o+=`<h4>٦. من النصيب إلى المبلغ</h4><p>مبلغ كل وارث = نصيبه من التركة × المبلغ الموروث (${fmtMoney(ctx.net)}). مثال: ${r.heirs[0].label}: ${r.heirs[0].share.str()} × ${fmtMoney(ctx.net)} = ${money(r.heirs[0].share,ctx.net)}.</p>`;
  return o+`</div>`;
}

// ---------- الحساب ----------
function run(){
  const input={};E.KEYS.forEach(k=>input[k]=val[k]);
  if(gender==='m')input.husband=0;else input.wives=0;
  const r=E.solve(input,mode);
  const estate=parseFloat($('#estate').value),funeral=parseFloat($('#funeral').value)||0,debts=parseFloat($('#debts').value)||0,beq=parseFloat($('#bequest').value)||0;
  let T=null;
  if($('#tzOn').checked){
    const ex=[['#tzC1','الأحفاد يرثون جدّهم فعلاً، فلا تنزيل (المادة 171).'],['#tzC2','الجدّ أعطاهم مثل نصيب أصلهم، فلا تنزيل (المادة 172).'],['#tzC3','الأحفاد ورثوا من أصلهم ما يغني، فلا تنزيل (المادة 172).']].find(x=>$(x[0]).checked);
    T=E.solveTanzil(input,mode,{type:$('#tzType').value,males:$('#tzM').value,females:$('#tzF').value,exclude:ex?ex[1]:null});
  }
  const tza=T&&T.applicable?T:null;
  let net=null,after=null,tzAmt=0,pre='';
  if(isFinite(estate)&&estate>0){
    after=estate-funeral-debts;
    if(after<0){pre+=`<div class="err">التجهيز والديون تزيد على التركة، فلا شيء للورثة.</div>`;after=0}
    tzAmt=tza?after*tza.tz.num():0;
    let b=beq;const third=Math.max(0,after/3-tzAmt);
    if(b>third){pre+=`<div class="note">الوصية (${fmtMoney(b)}) أكثر مما يتسع له الثلث${tza?' بعد التنزيل':''} (${fmtMoney(third)}). النافذ بلا إجازة هو ${fmtMoney(third)}، وما زاد يتوقف على إجازة الورثة البالغين الراشدين، فحُسبت على المتاح.</div>`;b=third}
    net=after-tzAmt-b;
    pre+=`<div class="card"><h3 style="margin-top:0">من التركة إلى المبلغ الموروث</h3><div class="tbl"><table>
      <tr><td>إجمالي التركة</td><td class="num">${fmtMoney(estate)}</td></tr>
      <tr><td>− التجهيز والدفن</td><td class="num">${fmtMoney(funeral)}</td></tr>
      <tr><td>− الديون</td><td class="num">${fmtMoney(debts)}</td></tr>
      ${tza?`<tr><td>− التنزيل (وصية واجبة، ${tza.tz.str()} من التركة)</td><td class="num">${fmtMoney(tzAmt)}</td></tr>`:''}
      <tr><td>− الوصية الاختيارية النافذة</td><td class="num">${fmtMoney(b)}</td></tr>
      <tr><th>الموروث بين الورثة</th><th class="num">${fmtMoney(net)}</th></tr></table></div>
      <p class="small" style="margin-bottom:0">الترتيب: التجهيز، ثم الديون، ثم التنزيل إن وُجد، ثم الوصية الاختيارية في بقية الثلث، ثم الميراث.</p></div>`;
  }
  let o=pre;
  if(T&&!T.applicable){o+=T.errors.length?`<div class="err">${T.errors.join('<br>')}</div>`:`<div class="note">${esc(T.reason)}</div>`}
  if(r.errors.length&&!r.heirs.length){o+=`<div class="err">${r.errors.join('<br>')}</div>`;$('#out').innerHTML=o;last=null;return}
  last={r,net,mode};
  const fac=tza?tza.factor:null;
  o+=`<div class="card"><h2>النتيجة</h2>`;
  const chips=r.special.map(s=>`<span class="chip">${s}</span>`).join('')+(tza?'<span class="chip">التنزيل</span>':'');
  if(chips)o+=`<div>${chips}</div>`;
  o+=`<p class="small" style="margin:6px 0">أصل المسألة: <b>${r.base}</b> سهماً${r.awl?` (عالت من ${r.awl.from} إلى ${r.awl.to})`:''}.${tza?' والأنصبة التالية من الباقي بعد التنزيل.':''}</p>`;
  if(r.errors.length)o+=`<div class="err">${r.errors.join('<br>')}</div>`;
  const parts=r.heirs.map((hh,i)=>({l:hh.label,f:fac?hh.share.mul(fac):hh.share,c:COLORS[i%COLORS.length]}));
  if(tza)tza.groups.forEach(g=>parts.push({l:g.label+' (تنزيل)',f:g.share,c:'#d4a64a'}));
  if(!r.bayt.isZero())parts.push({l:mode==='A'?'الباقي (بيت المال)':'الباقي (غير موزَّع)',f:fac?r.bayt.mul(fac):r.bayt,c:'#b9b19b'});
  o+=`<div class="bar">${parts.map(p=>`<i title="${p.l}" style="width:${p.f.num()*100}%;background:${p.c}"></i>`).join('')}</div><div class="legend">${parts.map(p=>`<span><b style="background:${p.c}"></b>${p.l} ${pct(p.f)}</span>`).join('')}</div>`;
  o+=`<div class="tbl" style="margin-top:12px"><table><tr><th>الوارث</th><th>العدد</th><th>النصيب</th><th>%</th><th>السهام من ${r.base}</th>${tza?'<th>من أصل التركة</th>':''}${net!=null?'<th>المبلغ</th><th>نصيب الفرد</th>':''}<th>الحالة والسبب</th></tr>`;
  r.heirs.forEach(hh=>{
    o+=`<tr><td class="who"><b>${hh.label}</b></td><td class="num">${hh.count}</td><td class="num frac">${F(hh.share)}</td><td class="num">${pct(hh.share)}</td><td class="num">${hh.units}</td>${tza?`<td class="num">${F(hh.share.mul(fac))}</td>`:''}${net!=null?`<td class="num">${money(hh.share,net)}</td><td class="num">${hh.count>1?money(hh.per,net):'—'}</td>`:''}<td><span class="chip g">${hh.kind}</span> <span class="small">${esc(hh.why)}</span></td></tr>`;
  });
  if(!r.bayt.isZero())o+=`<tr><td class="who"><b>${mode==='A'?'بيت المال':'الباقي'}</b></td><td class="num">—</td><td class="num frac">${F(r.bayt)}</td><td class="num">${pct(r.bayt)}</td><td class="num">${unitsOf(r.bayt,r.base)}</td>${tza?`<td class="num">${r.bayt.mul(fac).str()}</td>`:''}${net!=null?`<td class="num">${money(r.bayt,net)}</td><td class="num">—</td>`:''}<td class="small">لا عاصب ولا ردّ في هذه الصيغة.</td></tr>`;
  o+=`</table></div>`;
  if(!r.bayt.isZero()&&mode==='C')o+=`<div class="note" style="margin-top:8px">بقي جزء من التركة لا يرثه أحد ممن أدخلتَ. في القانون الجزائري يؤول إلى ذوي الأرحام (المادة 168): استعمل تبويب «ذوو الأرحام» إن وُجدوا.</div>`;
  o+=`</div>`;
  if(tza){
    o+=`<div class="card"><h2>التنزيل: كيف حُسب؟</h2><ol class="steps">
      <li>نفترض أن ${tza.type==='son'?'الابن':'البنت'} المتوفى قبل أبيه كان حيّاً، فتصير المسألة: ${tza.hyp.heirs.map(x=>x.label+' '+x.share.str()).join('، ')}.</li>
      <li>نصيب ذلك الأصل لو بقي حيّاً = <b>${tza.fShare.str()}</b> من التركة (المادة 170).</li>
      <li>سقف التنزيل ثلث التركة (1/3). ${tza.capped?`النصيب أكبر من الثلث فيُقتصر على <b>1/3</b>، والزيادة لا تنفذ إلا بإجازة الورثة.`:`النصيب لا يتجاوز الثلث فيؤخذ كاملاً: <b>${tza.tz.str()}</b>.`}</li>
      <li>يُخرج التنزيل أولاً قبل الوصية الاختيارية وقبل قسمة الميراث، ثم يُقسَّم الباقي (${tza.factor.str()} من التركة) على الورثة الموجودين بالأنصبة المبيّنة في الجدول أعلاه.</li>
      <li>يقتسم الأحفاد نصيب أصلهم قسمة ميراث للذكر مثل حظ الأنثيين.</li></ol>
      <div class="tbl"><table><tr><th>المنزَّل</th><th>العدد</th><th>من التركة</th><th>%</th>${after!=null?'<th>المبلغ</th><th>نصيب الفرد</th>':''}</tr>
      ${tza.groups.map(g=>`<tr><td><b>${g.label}</b></td><td class="num">${g.count}</td><td class="num frac">${F(g.share)}</td><td class="num">${pct(g.share)}</td>${after!=null?`<td class="num">${money(g.share,after)}</td><td class="num">${g.count>1?money(g.per,after):'—'}</td>`:''}</tr>`).join('')}</table></div>
      <div class="note" style="margin-top:8px">ملاحظة: يُحسب هنا التنزيل من التركة بعد التجهيز والديون، ثم تُقسَّم بقية التركة على الورثة الباقين بأنصبتهم. بعض الشروح تحسب النتيجة بصورة أخرى، فراجع المحكمة أو الموثّق عند التطبيق.</div></div>`;
  }
  if(r.steps.length){o+=`<div class="card"><h3 style="margin-top:0">المسائل الخاصة في هذه التركة</h3><ol class="steps">${r.steps.map(s=>`<li>${esc(s)}</li>`).join('')}</ol></div>`}
  o+=`<div class="card">${explain(r,{net})}</div>`;
  if(mode==='C')o+=`<div class="note">ذكّرنا بأن الصيغة الجزائرية هنا تحسب الردّ، وتحسب التنزيل إن فعّلته، وذوي الأرحام في تبويب مستقل.</div>`;
  $('#out').innerHTML=o;
  $('#out').scrollIntoView({behavior:'smooth',block:'start'});
}
$('#go').onclick=run;
$('#reset').onclick=()=>{E.KEYS.forEach(k=>val[k]=0);['estate','funeral','debts','bequest'].forEach(i=>$('#'+i).value='');$('#tzOn').checked=false;$('#out').innerHTML='';last=null;drawHeirs()};

// ---------- ذوو الأرحام ----------
const ar={spouse:'',c1:[{m:0,f:0}],c2:{mgf:0,gmfm:0},c3:[{type:'fs',m:0,f:0}],c4:{pm:0,pf:0,mm:0,mf:0}};
const ANC=[['fs','أخت شقيقة'],['ps','أخت لأب'],['ms','أخت لأم'],['fb','أخ شقيق'],['pb','أخ لأب'],['mb','أخ لأم']];
const numIn=(path,v)=>`<input type="number" min="0" value="${v}" data-p="${path}" style="width:80px">`;
function drawAr(){
  let o=`<div class="grp"><div class="t">الصنف الأول: أولاد البنات وأولاد بنات الابن (وإن نزلوا)</div><p class="small">كل فرع هو أولاد بنت واحدة متوفاة.</p>`;
  ar.c1.forEach((x,i)=>o+=`<div class="row" style="margin:4px 0">فرع ${i+1}: ذكور ${numIn('c1.'+i+'.m',x.m)} إناث ${numIn('c1.'+i+'.f',x.f)} <button class="btn alt" data-del="c1.${i}" style="padding:4px 12px">حذف</button></div>`);
  o+=`<button class="btn alt" data-add="c1" style="padding:5px 14px">+ فرع</button></div>`;
  o+=`<div class="grp"><div class="t">الصنف الثاني: الأجداد والجدات الرحميون</div><div class="row">أبو الأم ${numIn('c2.mgf',ar.c2.mgf)} أم أبي الأم ${numIn('c2.gmfm',ar.c2.gmfm)}</div></div>`;
  o+=`<div class="grp"><div class="t">الصنف الثالث: أولاد الأخوات وبنات الإخوة</div><p class="small">كل فرع هو أولاد أخت أو أخ واحد ميّت، فاختر الأصل.</p>`;
  ar.c3.forEach((x,i)=>o+=`<div class="row" style="margin:4px 0">فرع ${i+1}: أولاد <select data-p="c3.${i}.type" style="font:inherit;padding:5px;border:1px solid var(--line);border-radius:8px">${ANC.map(a=>`<option value="${a[0]}"${a[0]===x.type?' selected':''}>${a[1]}</option>`).join('')}</select> ذكور ${numIn('c3.'+i+'.m',x.m)} إناث ${numIn('c3.'+i+'.f',x.f)} <button class="btn alt" data-del="c3.${i}" style="padding:4px 12px">حذف</button></div>`);
  o+=`<button class="btn alt" data-add="c3" style="padding:5px 14px">+ فرع</button></div>`;
  o+=`<div class="grp"><div class="t">الصنف الرابع: الأعمام لأم والعمات والأخوال والخالات</div><div class="row">أعمام لأم ${numIn('c4.pm',ar.c4.pm)} عمات ${numIn('c4.pf',ar.c4.pf)} أخوال ${numIn('c4.mm',ar.c4.mm)} خالات ${numIn('c4.mf',ar.c4.mf)}</div></div>`;
  $('#arBody').innerHTML=o;
}
function setPath(p,v){const a=p.split('.');let o=ar;for(let i=0;i<a.length-1;i++)o=o[a[i]];o[a[a.length-1]]=v}
$('#arBody').addEventListener('input',e=>{const p=e.target.dataset.p;if(!p)return;setPath(p,e.target.tagName==='SELECT'?e.target.value:Math.max(0,parseInt(e.target.value)||0))});
$('#arBody').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
  if(b.dataset.add){ar[b.dataset.add].push(b.dataset.add==='c1'?{m:0,f:0}:{type:'fs',m:0,f:0});drawAr()}
  if(b.dataset.del){const [c,i]=b.dataset.del.split('.');ar[c].splice(+i,1);drawAr()}});
$('#arSp').onclick=e=>{const b=e.target.closest('button');if(!b)return;ar.spouse=b.dataset.s;document.querySelectorAll('#arSp button').forEach(x=>x.classList.toggle('on',x===b))};
$('#arGo').onclick=()=>{
  const r=E.solveArham(ar);const M=parseFloat($('#arMoney').value);const net=isFinite(M)&&M>0?M:null;
  if(r.errors.length&&!r.heirs.length){$('#arOut').innerHTML=`<div class="err">${r.errors.join('<br>')}</div>`;return}
  let o=`<div class="card"><h2>نتيجة ذوي الأرحام</h2><div class="tbl"><table><tr><th>الوارث</th><th>العدد</th><th>النصيب</th><th>%</th>${net?'<th>المبلغ</th><th>نصيب الفرد</th>':''}<th>السبب</th></tr>`;
  r.heirs.forEach(h=>{o+=`<tr><td><b>${h.label}</b></td><td class="num">${h.count}</td><td class="num frac">${F(h.share)}</td><td class="num">${pct(h.share)}</td>${net?`<td class="num">${money(h.share,net)}</td><td class="num">${h.count>1?money(h.per,net):'—'}</td>`:''}<td class="small">${esc(h.why)}</td></tr>`});
  o+=`</table></div></div><div class="card"><h3 style="margin-top:0">شرح الخطوات</h3><ol class="steps">${r.steps.map(s=>`<li>${esc(s)}</li>`).join('')}</ol>${r.notes.map(n=>`<div class="note" style="margin-top:8px">${esc(n)}</div>`).join('')}${r.errors.length?`<div class="err">${r.errors.join('<br>')}</div>`:''}<p class="small">القاعدة: الأقرب درجةً يحجب الأبعد، وكل ذي رحم يأخذ نصيب من يُدلي به إلى الميت لو كان حيّاً. وقد سُمّي هذا مذهب أهل التنزيل.</p></div>`;
  $('#arOut').innerHTML=o;$('#arOut').scrollIntoView({behavior:'smooth',block:'start'});
};

// ---------- التخارج ----------
let tkSel={key:'',k:1,mode:'estate',payer:'all'};
function drawTakh(){
  if(!last){$('#tkBody').innerHTML=`<div class="note">احسب مسألة في تبويب «الحاسبة» أولاً، ثم عُد هنا.</div>`;$('#tkOut').innerHTML='';return}
  const hs=last.r.heirs;if(!hs.find(h=>h.key===tkSel.key))tkSel.key=hs[0].key;
  const cur=hs.find(h=>h.key===tkSel.key);
  const opt=(v,l,s)=>`<option value="${v}"${s?' selected':''}>${l}</option>`;
  $('#tkBody').innerHTML=`<div class="grid">
   <div class="fld"><label>الوارث الخارج</label><select id="tkKey" style="font:inherit;padding:7px;border:1px solid var(--line);border-radius:10px;width:100%">${hs.map(h=>opt(h.key,h.label,h.key===tkSel.key)).join('')}</select></div>
   <div class="fld"><label>كم شخصاً منهم يخرج؟ (حتى ${cur.count})</label><input type="number" id="tkK" min="1" max="${cur.count}" value="${Math.min(tkSel.k,cur.count)}"></div>
   <div class="fld"><label>صورة التخارج</label><select id="tkMode" style="font:inherit;padding:7px;border:1px solid var(--line);border-radius:10px;width:100%">${opt('estate','يأخذ مبلغاً من التركة نفسها',tkSel.mode==='estate')}${opt('payer','يشتري نصيبه وارث أو جميع الورثة من مالهم',tkSel.mode==='payer')}</select></div>
   <div class="fld" id="tkPayerBox" style="display:${tkSel.mode==='payer'?'block':'none'}"><label>من يدفع؟</label><select id="tkPayer" style="font:inherit;padding:7px;border:1px solid var(--line);border-radius:10px;width:100%">${opt('all','جميع الورثة الباقين',tkSel.payer==='all')}${hs.filter(h=>h.key!==tkSel.key).map(h=>opt(h.key,h.label,h.key===tkSel.payer)).join('')}</select></div>
   <div class="fld"><label>المبلغ القابل للقسمة (اختياري)</label><input type="number" id="tkEstate" min="0" step="any" value="${last.net||''}"></div>
   <div class="fld"><label>ما يُدفع أو يأخذه الخارج (اختياري)</label><input type="number" id="tkX" min="0" step="any" placeholder="0"></div></div>
   <div class="row" style="margin-top:10px"><button class="btn" id="tkGo">احسب التخارج</button></div>`;
  $('#tkKey').onchange=e=>{tkSel.key=e.target.value;tkSel.k=1;drawTakh()};
  $('#tkMode').onchange=e=>{tkSel.mode=e.target.value;drawTakh()};
  $('#tkGo').onclick=runTakh;
  $('#tkOut').innerHTML='';
}
function runTakh(){
  tkSel.k=parseInt($('#tkK').value)||1;if($('#tkPayer'))tkSel.payer=$('#tkPayer').value;
  const hs=last.r.heirs.map(h=>({key:h.key,label:h.label,count:h.count,share:h.share,per:h.per}));
  const res=E.takharuj(hs,{key:tkSel.key,k:tkSel.k,mode:tkSel.mode,payer:tkSel.payer});
  if(res.errors.length){$('#tkOut').innerHTML=`<div class="err">${res.errors.join('<br>')}</div>`;return}
  const M=parseFloat($('#tkEstate').value);const X=parseFloat($('#tkX').value)||0;const hasM=isFinite(M)&&M>0;
  const T=res.rows.reduce((s,r)=>s.add(r.share),E.fr(0));
  let o=`<div class="card"><h2>نتيجة التخارج</h2><p>الخارج: <b>${res.k>1?res.k+' من ':''}${res.label}</b> ونصيبه الأصلي <span class="frac">${res.exitShare.str()}</span> (${pct(res.exitShare)}) من التركة.</p><p>${res.note}</p>`;
  o+=`<div class="tbl"><table><tr><th>الوارث</th><th>العدد</th><th>النصيب الأصلي</th><th>بعد التخارج</th><th>%</th>${hasM?'<th>يستلم</th><th>يدفع</th><th>الصافي</th>':''}</tr>`;
  const pool=tkSel.mode==='estate'?M-X:M;
  res.rows.forEach(r=>{
    let pay=0;
    if(tkSel.mode==='payer')pay=tkSel.payer==='all'?X*r.share.num()/T.num():(r.key===tkSel.payer?X:0);
    const got=hasM?Number(r.newShare.n)*pool/Number(r.newShare.d):0;
    o+=`<tr><td><b>${r.label}</b></td><td class="num">${r.count}</td><td class="num frac">${F(r.share)}</td><td class="num frac">${F(r.newShare)}</td><td class="num">${pct(r.newShare)}</td>${hasM?`<td class="num">${fmtMoney(got)}</td><td class="num">${pay?fmtMoney(pay):'—'}</td><td class="num">${fmtMoney(got-pay)}</td>`:''}</tr>`;
  });
  o+=`</table></div>`;
  if(hasM)o+=`<p class="small">الخارج يتلقّى ${fmtMoney(X)} ${tkSel.mode==='estate'?'من التركة':'من الدافعين'}، وكان نصيبه الأصلي ${money(res.exitShare,M)}.${X<Number(res.exitShare.n)*M/Number(res.exitShare.d)?' فهو يتنازل عن الفرق برضاه.':''}</p>`;
  o+=`<div class="note">التخارج عقد صلح يلزم فيه رضا الخارج وبلوغه ورشده، وصحة المقابل شرعاً، ويُوثَّق عند الموثّق. هذا الحساب لتوضيح الأنصبة فقط.</div></div>`;
  $('#tkOut').innerHTML=o;$('#tkOut').scrollIntoView({behavior:'smooth',block:'start'});
}

// ---------- أمثلة ----------
const EX=[
 ['العمرية الأولى: زوج وأبوان',{husband:1,father:1,mother:1},'A'],
 ['العمرية الثانية: زوجة وأبوان',{wives:1,father:1,mother:1},'A'],
 ['الأكدرية',{husband:1,mother:1,gf:1,fs:1},'A'],
 ['المشتركة',{husband:1,mother:1,mb:2,fb:1},'A'],
 ['العول: زوج وشقيقتان وأم',{husband:1,fs:2,mother:1},'A'],
 ['المنبرية: زوجة وبنتان وأبوان',{wives:1,daughters:2,father:1,mother:1},'A'],
 ['جد وخمسة إخوة وجدة',{gf:1,fb:5,gm_m:1},'A'],
 ['جد وأخ شقيق وأخ لأب (المعادّة)',{gf:1,fb:1,pb:1},'A'],
 ['بنت وبنت ابن وأخ',{daughters:1,gdaughters:1,fb:1},'A'],
 ['بنت وأم: بين الأصل والردّ',{daughters:1,mother:1},'B'],
 ['زوج وبنت في القانون الجزائري',{husband:1,daughters:1},'C'],
 ['التنزيل: ثلاثة أبناء وأبوان وبنت لابن ميت',{sons:3,father:1,mother:1},'C',{tz:{type:'son',m:0,f:1}}]];
$('#exlist').innerHTML=EX.map((e,i)=>`<button data-i="${i}">${e[0]}</button>`).join('');
$('#exlist').onclick=e=>{const b=e.target.closest('button');if(!b)return;const x=EX[+b.dataset.i];
  E.KEYS.forEach(k=>val[k]=0);Object.assign(val,x[1]);
  gender=x[1].husband?'f':'m';mode=x[2];
  $('#tzOn').checked=!!x[3];if(x[3]){$('#tzType').value=x[3].tz.type;$('#tzM').value=x[3].tz.m;$('#tzF').value=x[3].tz.f;$('#tzBox').open=true}
  document.querySelectorAll('#gender button').forEach(bb=>bb.classList.toggle('on',bb.dataset.g===gender));
  drawModes();drawHeirs();tab('calc');run()};

// ================== الدروس التفاعلية ==================
const LESSONS=[
{t:'الحقوق المتعلقة بالتركة وأسباب الإرث',s:'الترتيب الشرعي، والأسباب والموانع',
 b:`<p>قبل أن نقسم التركة بين الورثة تتعلق بها حقوق مرتبة:</p>
 <ol><li><b>تجهيز الميت ودفنه</b> بالمعروف.</li><li><b>قضاء الديون.</b></li><li><b>الوصية</b> لغير وارث في حدود <b>ثلث ما بقي</b>، وما زاد يتوقف على إجازة الورثة.</li><li><b>الميراث</b> بين الورثة.</li></ol>
 <p><b>أسباب الإرث ثلاثة:</b> النكاح الصحيح، والنسب، والولاء (العتق). <b>وموانعه:</b> القتل العمد العدوان، والرق، واختلاف الدين.</p>
 <div class="note">قاعدة: لا يُقسَّم شيء على الورثة قبل أداء الحقوق السابقة. فإن كانت التركة 100000 والديون 20000 والتجهيز 5000 فالباقي للوصية والميراث هو 75000.</div>`,
 e:[
 {t:'mcq',q:'ما أول ما يُخرَج من التركة؟',o:['الوصية','تجهيز الميت ودفنه','الديون','نصيب الورثة'],a:1,w:'يبدأ بالتجهيز، ثم الديون، ثم الوصية، ثم الميراث.'},
 {t:'mcq',q:'تركة 90000 لا ديون ولا تجهيز، وأوصى الميت لغير وارث بـ 50000. كم ينفذ بلا إجازة الورثة؟',o:['50000','45000','30000','90000'],a:2,w:'الوصية النافذة بلا إجازة هي ثلث الباقي: 90000 ÷ 3 = 30000.'},
 {t:'mcq',q:'أي هذه ليس من أسباب الإرث؟',o:['النكاح الصحيح','النسب','الجوار','الولاء'],a:2,w:'الأسباب: النكاح والنسب والولاء. الجوار والصداقة لا تورّث.'},
 {t:'mcq',q:'أي هذه من موانع الإرث؟',o:['القتل العمد العدوان','الفقر','البعد في السكن','كون الوارث أنثى'],a:0,w:'القتل العمد العدوان مانع من الإرث، والفقر والبعد والأنوثة ليست موانع.'}]},

{t:'أصحاب الفروض',s:'النصف والربع والثمن والثلثان والثلث والسدس',
 b:`<p>الفروض المقدّرة في القرآن ستة: <b>1/2</b> و<b>1/4</b> و<b>1/8</b> و<b>2/3</b> و<b>1/3</b> و<b>1/6</b>.</p>
 <ul><li><b>الزوج:</b> 1/2 بلا فرع وارث، و1/4 مع الفرع الوارث.</li><li><b>الزوجة أو الزوجات:</b> 1/4 بلا فرع وارث، و1/8 معه، يشتركن فيه.</li><li><b>الأم:</b> 1/6 مع الفرع الوارث أو جمع من الإخوة، وإلا 1/3.</li><li><b>البنت:</b> 1/2 للواحدة، و2/3 للاثنتين فأكثر (ما لم يوجد ابن يعصّبهنّ).</li><li><b>الأب:</b> 1/6 مع الابن، و1/6 مع البنت ثم الباقي تعصيباً.</li></ul>
 <p><b>فكرة مهمة:</b> «الفرع الوارث» هو الأبناء والبنات وأبناء الابن وبناته. وجوده ينقل الزوج من النصف إلى الربع، والزوجة من الربع إلى الثمن.</p>`,
 e:[
 {t:'calc',h:{wives:1,sons:1},m:'A'},
 {t:'calc',h:{husband:1,mother:1,fb:1},m:'A',base:1},
 {t:'mcq',q:'توفي رجل عن زوجة وبنت وأب وأم. كم نصيب الزوجة؟',o:['1/4','1/8','1/6','1/3'],a:1,w:'وُجد فرع وارث (البنت) فتنزل الزوجة من الربع إلى الثمن.'},
 {t:'calc',h:{husband:1,daughters:1},m:'A'}]},

{t:'الحجب',s:'من يمنع من؟ حجب الحرمان وحجب النقصان',
 b:`<p><b>الحجب</b> أن يمنع وارثٌ وارثاً آخر من الميراث كله (<b>حجب حرمان</b>) أو من بعضه (<b>حجب نقصان</b>).</p>
 <ul><li>الابن يحجب ابن الابن.</li><li>الأب يحجب الجد، ويحجب الإخوة كلهم.</li><li>الابن والأب (والجد) يحجبون الإخوة لأم.</li><li>الأم تحجب كل الجدات، والجدة القريبة تحجب البعيدة.</li><li>الفرع الوارث ينقص نصيب الزوجين والأم (نقصان).</li></ul>
 <div class="note">الأشخاص الذين يُدلون إلى الميت بواسطة وارث يُحجبون بتلك الواسطة (غالباً)، فابن الابن يرث بواسطة الابن، فإذا وُجد الابن حجبه.</div>`,
 e:[
 {t:'calc',h:{sons:1,gsons:1,father:1},m:'A'},
 {t:'calc',h:{father:1,fb:2,mb:1},m:'A',note:'لاحظ أن الإخوة محجوبون بالأب وأن الأم هنا لا تأخذ الثلث الكامل لوجود جمع من الإخوة.'},
 {t:'mcq',q:'من يحجب الجدة أم الأم؟',o:['الأب','الأم','الأخ','الزوج'],a:1,w:'الأم تحجب الجدات كلهنّ. أما الأب فيحجب أم الأب فقط.'},
 {t:'mcq',q:'الأخ لأم يسقط بوجود:',o:['الأخ الشقيق','الجد (أبو الأب)','الجدة','الزوج'],a:1,w:'الإخوة لأم يسقطون بالفرع الوارث والأب والجد (عند المالكية).'}]},

{t:'التعصيب',s:'بالنفس، بالغير، ومع الغير',
 b:`<p><b>العاصب</b> من يأخذ ما بقي بعد أصحاب الفروض، أو المال كله إن انفرد. وهو ثلاثة أنواع:</p>
 <ul><li><b>بالنفس:</b> الابن، ابن الابن، الأب، الجد، الأخ الشقيق، الأخ لأب، العم... ويأخذ بنفسه.</li><li><b>بالغير:</b> البنت مع الابن، والأخت الشقيقة مع الأخ الشقيق، يُقسم لهما «للذكر مثل حظ الأنثيين».</li><li><b>مع الغير:</b> الأخوات الشقيقات أو لأب مع البنات أو بنات الابن.</li></ul>
 <p>ترتيب العصبة: جهة البنوة، ثم الأبوة، ثم الأخوة، ثم بنو الإخوة، ثم العمومة، ثم الولاء.</p>`,
 e:[
 {t:'calc',h:{sons:2,daughters:1},m:'A'},
 {t:'calc',h:{daughters:1,fs:1},m:'A',note:'الأخت الشقيقة هنا عاصبة مع الغير (مع البنت).'},
 {t:'calc',h:{fb:1,fs:1,mother:1},m:'A'},
 {t:'mcq',q:'بنتان وأخ شقيق. ما نصيب الأخ؟',o:['النصف','الثلث','لا شيء','الربع'],a:1,w:'للبنتين الثلثان فرضاً، والباقي وهو الثلث للأخ الشقيق تعصيباً.'}]},

{t:'أصل المسألة والعول',s:'السهام والمضاعف المشترك الأصغر',
 b:`<p><b>أصل المسألة</b> هو أصغر عدد صحيح يخرج منه نصيب كل وارث عدداً صحيحاً من السهام. نحسبه من مقامات الفروض (المضاعف المشترك الأصغر).</p>
 <p>مثال: زوج وأم وابن. للزوج 1/4 وللأم 1/6، وللابن الباقي. المقامان 4 و6 ← أصل المسألة 12. للزوج 3 سهام، وللأم 2، وللابن 7.</p>
 <p><b>العول:</b> إذا زادت الفروض على الواحد (مثلاً 3/6 + 4/6 + 1/6 = 8/6) جُعل أصل المسألة هو مجموع السهام (8) ودخل النقص على الجميع بنسبة سهامهم.</p>
 <div class="note">أصل المسألة هو الذي نقيس به السهام، وليس هو العدد الذي نكتب به الكسر دائماً. كلاهما يصل إلى النتيجة نفسها.</div>`,
 e:[
 {t:'calc',h:{husband:1,mother:1,sons:1},m:'A',base:1},
 {t:'calc',h:{husband:1,fs:2,mother:1},m:'A',base:1,note:'مسألة عائلة: الفروض 3/6 + 4/6 + 1/6.'},
 {t:'calc',h:{wives:1,daughters:2,father:1,mother:1},m:'A',base:1,note:'المنبرية: عالت من 24 إلى 27.'},
 {t:'mcq',q:'متى تعول المسألة؟',o:['إذا نقصت الفروض عن الواحد','إذا زادت الفروض على الواحد','إذا وُجد عاصب','إذا لم يوجد وارث'],a:1,w:'العول يكون عند زيادة مجموع الفروض على الواحد الصحيح.'}]},

{t:'الجد والإخوة (مذهب زيد)',s:'ما يختاره المالكية: الأحظّ للجد',
 b:`<p>إذا اجتمع الجد (أبو الأب) مع الإخوة الأشقاء أو لأب، فالمالكية على مذهب <b>زيد بن ثابت</b>: لا يحجب الجد الإخوة، ويأخذ <b>الأحظّ</b> له من ثلاثة:</p>
 <ol><li>المقاسمة كأنه أخ.</li><li>ثلث الباقي بعد الفروض.</li><li>سدس جميع المال.</li></ol>
 <p>مثال: جد وأخوان شقيقان. المقاسمة = 1/3، وثلث الباقي = 1/3، والسدس = 1/6. فله 1/3.</p>
 <p>ومثال: جد وخمسة إخوة وجدة. للجدة 1/6، ويبقى 5/6. المقاسمة = 5/6 ÷ 7 × 2 = 5/21، وثلث الباقي = 5/18، والأكبر 5/18.</p>
 <div class="note">إذا اجتمع الجد مع إخوة أشقاء وإخوة لأب فإنّ الأشقاء <b>يعدّون</b> الإخوة لأب على الجد (المعادّة) ليقلّ نصيبه، ثم يعود نصيب الإخوة لأب إلى الأشقاء.</div>`,
 e:[
 {t:'calc',h:{gf:1,fb:2},m:'A'},
 {t:'calc',h:{gf:1,fb:5,gm_m:1},m:'A'},
 {t:'calc',h:{husband:1,gf:1,fb:1},m:'A'},
 {t:'calc',h:{gf:1,fb:1,pb:1},m:'A',note:'المعادّة: الأخ لأب يُعدّ على الجد ثم يسقط.'}]},

{t:'المسائل الخاصة المشهورة',s:'العمريتان، الأكدرية، المشتركة',
 b:`<ul><li><b>العمريتان:</b> زوج أو زوجة مع الأبوين. تأخذ الأم <b>ثلث الباقي</b> بعد فرض الزوج/الزوجة، لا ثلث التركة كلها.</li>
 <li><b>الأكدرية:</b> زوج وأم وجد وأخت. تعول المسألة من 6 إلى 9 ثم يقتسم الجد والأخت نصيبيهما للذكر مثل حظ الأنثيين فتصحّ من 27.</li>
 <li><b>المشتركة:</b> زوج وأم وإخوة لأم وأخ شقيق. استغرقت الفروض التركة، فعند المالكية يُشرَّك الأخ الشقيق مع الإخوة لأم في ثلثهم.</li></ul>`,
 e:[
 {t:'calc',h:{husband:1,father:1,mother:1},m:'A'},
 {t:'calc',h:{wives:1,father:1,mother:1},m:'A'},
 {t:'calc',h:{husband:1,mother:1,gf:1,fs:1},m:'A',base:1},
 {t:'calc',h:{husband:1,mother:1,mb:2,fb:1},m:'A'}]},

{t:'الردّ وذوو الأرحام والتنزيل والتخارج',s:'ما تفرّد به القانون الجزائري',
 b:`<ul><li><b>الردّ:</b> المالكية الأولون: لا ردّ، والباقي لبيت المال. والقانون الجزائري (المادة 167) يردّ على أصحاب الفروض غير الزوجين.</li>
 <li><b>ذوو الأرحام (المادة 168):</b> عند عدم الفرض والعصبة يرثون على طريقة أهل التنزيل.</li>
 <li><b>التنزيل (169 إلى 172):</b> وصية واجبة لأحفاد مات أصلهم قبل المورّث، بنصيب أصلهم في حدود الثلث.</li>
 <li><b>التخارج:</b> أن يخرج وارث من القسمة مقابل مال، ثم يُعاد توزيع الأنصبة.</li></ul>`,
 e:[
 {t:'calc',h:{daughters:1,mother:1},m:'B',note:'صيغة المتأخرين: يُردّ الباقي.'},
 {t:'calc',h:{husband:1,daughters:1},m:'C',note:'في القانون الجزائري يُردّ على البنت دون الزوج.'},
 {t:'mcq',q:'أقصى مقدار للتنزيل من التركة هو:',o:['النصف','الثلث','الربع','السدس'],a:1,w:'المادة 170: بمقدار حصة أصلهم لو بقي حيّاً على ألا يتجاوز ثلث التركة.'},
 {t:'mcq',q:'في التخارج إن خرج وارث وأخذ مبلغاً من التركة نفسها، فإن الباقين يقتسمون الباقي:',o:['بالتساوي','بنسبة أنصبتهم الأصلية','للأكبر سناً','لبيت المال'],a:1,w:'يُقسَّم الباقي على الباقين بنسبة أنصبتهم الأصلية بعضها إلى بعض.'}]}
];

const PROG={};
try{Object.assign(PROG,JSON.parse(localStorage.getItem('mw_prog')||'{}'))}catch(e){}
const saveProg=()=>{try{localStorage.setItem('mw_prog',JSON.stringify(PROG))}catch(e){}};
const AD='٠١٢٣٤٥٦٧٨٩';
function parseFr(s){s=(s||'').trim().replace(/[٠-٩]/g,d=>AD.indexOf(d)).replace(/\s+/g,'').replace('÷','/');if(!s)return null;let m=s.match(/^(\d+)\/(\d+)$/);if(m&&+m[2]>0)return E.fr(+m[1],+m[2]);if(/^\d+$/.test(s))return E.fr(+s);return null}
function calcRows(h,m){
  const r=E.solve(h,m),rows=[];
  Object.keys(h).filter(k=>h[k]>0).forEach(k=>{
    const he=r.heirs.find(x=>x.key===k),bl=r.blocked.find(x=>x.key===k);
    const cnt=he?he.count:(bl?bl.count:h[k]);
    rows.push({key:k,label:he?he.label:(bl?bl.label:E.NAMES[k][h[k]>1?1:0]),count:cnt,exp:he?he.share:E.fr(0),why:he?he.why:(bl?bl.reason:'لا شيء له')});
  });
  if(!r.bayt.isZero())rows.push({key:'bayt',label:m==='A'?'بيت المال (الباقي)':'الباقي',count:0,exp:r.bayt,why:'ما بقي بعد الفروض ولا عاصب'});
  return {r,rows};
}
const LC=['A','B','C'];
let curL=-1,chal=null;
const exKey=(l,i)=>l+'-'+i;
function renderLessonList(){
  const done=l=>LESSONS[l].e.filter((_,i)=>PROG[exKey(l,i)]).length;
  const tot=PROG._t||0,ok=PROG._c||0;
  let o=`<div class="card"><h2>الدروس التفاعلية</h2><p>ثمانية دروس قصيرة، في كل درس شرح وتمارين تصحَّح فوراً. حلّ التمارين بنفسك ثم قارن مع الحل المفصّل.</p>
  <div class="row"><span class="chip g">إجابات صحيحة: ${ok}</span><span class="chip">محاولات: ${tot}</span><button class="btn alt" id="lsReset" style="padding:4px 14px">تصفير التقدّم</button><button class="btn" id="chalBtn">تحدٍّ عشوائي</button></div></div>
  <div class="lgrid">${LESSONS.map((x,i)=>`<button class="lcard" data-l="${i}"><span class="ln">${i+1}</span><b>${x.t}</b><span class="small">${x.s}</span><span class="bar2"><i style="width:${done(i)/x.e.length*100}%"></i></span><span class="small">${done(i)} من ${x.e.length} تمارين</span></button>`).join('')}</div>`;
  $('#lessonView').innerHTML=o;
}
function exHtml(l,i,ex){
  const id=exKey(l,i);
  if(ex.t==='mcq')return `<div class="exc" data-ex="${id}"><div class="q"><span class="chip">سؤال</span> ${ex.q}</div><div class="opts">${ex.o.map((x,j)=>`<button class="opt" data-mcq="${l},${i},${j}">${x}</button>`).join('')}</div><div class="fb" id="fb-${id}"></div></div>`;
  const {rows}=calcRows(ex.h,ex.m);
  return `<div class="exc" data-ex="${id}"><div class="q"><span class="chip">تمرين حساب</span> الصيغة: <b>${MODES[LC.indexOf(ex.m)].t}</b>. أدخل نصيب كل وارث ككسر من التركة (مثل 1/6)، واكتب 0 لمن لا شيء له.${ex.note?`<div class="small">${ex.note}</div>`:''}</div>
   <div class="crow">${rows.map(r=>`<label>${r.label}${r.count>1?` (${r.count})`:''}<span class="small"> — نصيب الجميع</span><input data-k="${r.key}" placeholder="مثال 1/6" inputmode="text" dir="ltr"></label>`).join('')}${ex.base?`<label>أصل المسألة (عدد السهام)<input data-k="_base" placeholder="مثال 12" inputmode="numeric" dir="ltr"></label>`:''}</div>
   <div class="row" style="margin-top:8px"><button class="btn" data-chk="${l},${i}">تحقّق</button><button class="btn alt" data-sol="${l},${i}">الحل المفصّل</button><button class="btn alt" data-open="${l},${i}">افتح في الحاسبة</button></div><div class="fb" id="fb-${id}"></div><div id="sol-${id}"></div></div>`;
}
function openLesson(l){
  curL=l;const x=LESSONS[l];
  $('#lessonView').innerHTML=`<div class="row" style="margin-bottom:8px"><button class="btn alt" id="lsBack">← كل الدروس</button><button class="btn" id="chalBtn">تحدٍّ عشوائي</button></div>
  <div class="card"><h2>الدرس ${l+1}: ${x.t}</h2><div class="edu">${x.b}</div></div>
  <div class="card"><h2>التمارين</h2>${x.e.map((e,i)=>exHtml(l,i,e)).join('')}
  <div class="row" style="justify-content:space-between;margin-top:12px">${l>0?`<button class="btn alt" data-l="${l-1}">← الدرس السابق</button>`:'<span></span>'}${l<LESSONS.length-1?`<button class="btn" data-l="${l+1}">الدرس التالي →</button>`:'<span></span>'}</div></div>`;
  window.scrollTo({top:0,behavior:'smooth'});
}
function count(ok,id){PROG._t=(PROG._t||0)+1;if(ok){if(!PROG[id])PROG._c=(PROG._c||0)+1;PROG[id]=true}saveProg()}
function checkCalc(h,m,box,id,withBase){
  const {r,rows}=calcRows(h,m);let allOk=true,out='';
  rows.forEach(row=>{
    const inp=box.querySelector(`input[data-k="${row.key}"]`);const v=parseFr(inp.value);
    const ok=v&&v.eq(row.exp);if(!ok)allOk=false;
    out+=`<li class="${ok?'ok':'bad'}"><b>${row.label}</b>: ${ok?'صحيح ✓':(v?`ليس ${v.str()}`:'اكتب كسراً مثل 1/6')} ${ok?'':`— الصواب <b>${row.exp.str()}</b>`}<div class="small">${esc(row.why)}</div></li>`;
  });
  if(withBase){const b=box.querySelector('input[data-k="_base"]');const ok=b&&parseInt(b.value.replace(/[٠-٩]/g,d=>AD.indexOf(d)))===r.base;if(!ok)allOk=false;out+=`<li class="${ok?'ok':'bad'}"><b>أصل المسألة</b>: ${ok?'صحيح ✓':`الصواب <b>${r.base}</b>`}</li>`}
  count(allOk,id);
  return `<div class="verdict ${allOk?'ok':'bad'}">${allOk?'أحسنت! إجابتك صحيحة.':'راجع الإجابات المشار إليها ثم حاول مرة أخرى.'}</div><ul class="fbl">${out}</ul>`;
}
const POOL=[['husband','wives'],'father','mother','gf','gm_m','gm_p','sons','daughters','gsons','gdaughters','fb','fs','pb','ps','mb','ms','ufb'];
function randomProblem(){
  for(let t=0;t<200;t++){
    const h={};const n=2+Math.floor(Math.random()*3);
    if(Math.random()<.55){if(Math.random()<.5)h.wives=1+Math.floor(Math.random()*2);else h.husband=1}
    while(Object.keys(h).length<n){const k=POOL[1+Math.floor(Math.random()*(POOL.length-1))];h[k]=['sons','daughters','fb','fs','pb','ps','mb','ms','gsons','gdaughters'].includes(k)?1+Math.floor(Math.random()*3):1}
    const r=E.solve(h,'A');
    if(r.errors.length||r.heirs.length<2||r.heirs.length>5)continue;
    if(h.husband&&h.wives)continue;
    return h;
  }
  return {husband:1,mother:1,sons:1};
}
function openChallenge(){
  const h=randomProblem();chal={h,m:'A'};
  $('#lessonView').innerHTML=`<div class="row" style="margin-bottom:8px"><button class="btn alt" id="lsBack">← كل الدروس</button><button class="btn" id="chalBtn">مسألة أخرى</button></div>
  <div class="card"><h2>التحدّي العشوائي</h2><p class="small">مسألة جديدة في كل مرة. أصل المذهب المالكي. استعمل ما تعلمته، واكتب 0 لمن يُحجب. حاول أولاً قبل أن تضغط «الحل المفصّل».</p>${exHtml('c',0,{t:'calc',h,m:'A',base:1})}</div>`;
}
$('#lessonView').addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;
  if(b.dataset.l!==undefined&&b.classList.contains('lcard')||(b.dataset.l!==undefined&&!b.classList.contains('lcard')))return openLesson(+b.dataset.l);
  if(b.id==='lsBack'){curL=-1;chal=null;return renderLessonList()}
  if(b.id==='chalBtn')return openChallenge();
  if(b.id==='lsReset'){Object.keys(PROG).forEach(k=>delete PROG[k]);saveProg();return renderLessonList()}
  if(b.dataset.mcq){const [l,i,j]=b.dataset.mcq.split(',').map(Number);const ex=LESSONS[l].e[i];const id=exKey(l,i);const ok=j===ex.a;
    b.parentNode.querySelectorAll('.opt').forEach((x,k)=>{x.classList.remove('okc','badc');if(k===ex.a&&ok||k===j&&!ok)x.classList.add(ok?'okc':'badc')});
    $('#fb-'+id).innerHTML=`<div class="verdict ${ok?'ok':'bad'}">${ok?'إجابة صحيحة ✓':'ليست هذه الإجابة، حاول مرة أخرى.'}</div>${ok?`<div class="small">${ex.w}</div>`:''}`;count(ok,id);return}
  if(b.dataset.chk){const [l,i]=b.dataset.chk.split(',');const ex=l==='c'?{h:chal.h,m:'A',base:1}:LESSONS[+l].e[+i];const id=exKey(l,i);const box=b.closest('.exc');
    $('#fb-'+id).innerHTML=checkCalc(ex.h,ex.m,box,id,!!ex.base);return}
  if(b.dataset.sol){const [l,i]=b.dataset.sol.split(',');const ex=l==='c'?{h:chal.h,m:'A'}:LESSONS[+l].e[+i];const id=exKey(l,i);
    const input=Object.assign({},ex.h);const r=E.solve(input,ex.m);const net=null;
    const sc=$('#sol-'+id);sc.innerHTML=`<div class="card" style="margin-top:10px">${explain(r,{net})}${r.steps.length?`<h3>مسائل خاصة</h3><ol class="steps">${r.steps.map(s=>`<li>${esc(s)}</li>`).join('')}</ol>`:''}</div>`;return}
  if(b.dataset.open){const [l,i]=b.dataset.open.split(',');const ex=l==='c'?{h:chal.h,m:'A'}:LESSONS[+l].e[+i];loadCalc(ex.h,ex.m);return}
});
function loadCalc(h,m){E.KEYS.forEach(k=>val[k]=0);Object.assign(val,h);gender=h.husband?'f':'m';mode=m;
  $('#tzOn').checked=false;document.querySelectorAll('#gender button').forEach(bb=>bb.classList.toggle('on',bb.dataset.g===gender));drawModes();drawHeirs();tab('calc');run()}

setGender();drawModes();drawHeirs();drawAr();
})();
