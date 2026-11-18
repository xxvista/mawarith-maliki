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
let mode='A',gender='m',last=null,shareH='';
const val={};E.KEYS.forEach(k=>val[k]=0);
const $=s=>document.querySelector(s);
const TABS=['calc','learn','arham','takh','spec','find','rules','ex','refs'];

function tab(t){document.querySelectorAll('.tab').forEach(e=>e.classList.toggle('on',e.id===t));document.querySelectorAll('#nav button[data-t]').forEach(b=>b.classList.toggle('on',b.dataset.t===t));moreBtn.classList.toggle('on',['rules','ex','refs','spec','find'].includes(t));const ab=$('#actbar');if(ab)ab.hidden=(t!=='calc');if(window.__inited)try{history.replaceState(null,'','#'+(t==='calc'&&shareH?shareH:t))}catch(e){}
  if(t==='takh')drawTakh();if(t==='spec')drawSpec();if(t==='find')runFind();if(t==='learn'&&curL<0&&!chal)renderLessonList();}
const sheet=$('#moreSheet'),moreBtn=$('#moreBtn');
const closeSheet=()=>{sheet.hidden=true;moreBtn.setAttribute('aria-expanded','false')};
$('#nav').onclick=e=>{const b=e.target.closest('button');if(!b)return;
  if(b.id==='moreBtn'){sheet.hidden=!sheet.hidden;moreBtn.setAttribute('aria-expanded',String(!sheet.hidden));return}
  closeSheet();tab(b.dataset.t);window.scrollTo({top:0,behavior:'smooth'})};
sheet.onclick=e=>{const b=e.target.closest('button');if(!b)return;closeSheet();tab(b.dataset.t);window.scrollTo({top:0,behavior:'smooth'})};
document.addEventListener('click',e=>{if(!sheet.hidden&&!e.target.closest('#moreSheet,#moreBtn'))closeSheet()});
function stackify(c){c.querySelectorAll('table').forEach(tb=>{
  const rows=[...tb.querySelectorAll('tr')];if(!rows.length)return;
  const h=rows[0];const ths=[...h.children];
  if(ths.length<3||!ths.every(x=>x.tagName==='TH'))return;
  tb.classList.add('stack');h.classList.add('hd');
  const labels=ths.map(x=>x.textContent.trim());
  rows.slice(1).forEach(r=>[...r.children].forEach((td,i)=>{if(td.tagName==='TD'&&labels[i])td.setAttribute('data-label',labels[i])}));
})}
['#out','#arOut','#tkOut','#spOut'].forEach(s=>{const el=$(s);new MutationObserver(()=>stackify(el)).observe(el,{childList:true})});

function drawModes(){$('#modes').innerHTML=MODES.map(m=>`<button class="mode ${m.id===mode?'on':''}" data-m="${m.id}"><b>${m.t}</b><span>${m.d}</span></button>`).join('')}
$('#modes').onclick=e=>{const b=e.target.closest('.mode');if(!b)return;mode=b.dataset.m;if(mode==='C')val.mawla=0;drawModes();drawHeirs()};
$('#gender').onclick=e=>{const b=e.target.closest('button');if(!b)return;gender=b.dataset.g;setGender();drawHeirs()};
function setGender(){document.querySelectorAll('#gender button').forEach(b=>b.classList.toggle('on',b.dataset.g===gender));if(gender==='m')val.husband=0;else val.wives=0}

const openG=[true,true,true,false,false];
function visibleItems(items){return items.filter(([k])=>!(k==='husband'&&gender==='m')&&!(k==='wives'&&gender==='f')&&!(k==='mawla'&&mode==='C'))}
function updateBar(){
  const sel=[];let n=0;
  GROUPS.forEach(([t,items])=>visibleItems(items).forEach(([k,l])=>{if(val[k]>0){n+=val[k];sel.push(val[k]>1?`${l} (${val[k]})`:l)}}));
  const c=$('#abCount'),l=$('#abList');if(!c)return;
  c.textContent=n?`${sel.length} فئات من الورثة محددة`:'لم تحدد ورثة بعد';
  l.textContent=n?sel.join('، '):'اختر الورثة من القوائم أعلاه';
  $('#abGo').disabled=!n;
}
function drawHeirs(){
  let html='';
  GROUPS.forEach(([title,items],gi)=>{
    const its=visibleItems(items);const cnt=its.reduce((s,[k])=>s+val[k],0);
    const body=its.map(([k,l,mx])=>`<div class="hv tile ${val[k]?'has':''}"><label>${l}</label><div class="step"><button data-k="${k}" data-d="-1" aria-label="إنقاص ${l}">−</button><output>${val[k]}</output><button data-k="${k}" data-d="1" data-mx="${mx}" aria-label="زيادة ${l}">+</button></div></div>`).join('');
    html+=`<details class="grp2" data-g="${gi}"${openG[gi]||cnt?' open':''}><summary><span>${title}</span>${cnt?`<span class="badge">${cnt}</span>`:''}</summary><div class="grid2">${body}</div></details>`;
  });
  $('#heirs').innerHTML=html;updateBar();
}
$('#heirs').addEventListener('toggle',e=>{const d=e.target;if(d.dataset&&d.dataset.g!==undefined)openG[+d.dataset.g]=d.open},true);
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
function run(ev){
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
  last={r,net,mode,fac:tza?tza.factor:null};
  const fac=tza?tza.factor:null;
  o+=`<div class="card"><h2>النتيجة</h2>`;
  const chips=r.special.map(s=>`<span class="chip">${s}</span>`).join('')+(tza?'<span class="chip">التنزيل</span>':'');
  if(chips)o+=`<div>${chips}</div>`;
  o+=`<div class="glance">${r.heirs.map(hh=>`<span><b>${hh.label}</b>${hh.share.str()}</span>`).join('')}${!r.bayt.isZero()?`<span><b>${mode==='A'?'بيت المال':'الباقي'}</b>${r.bayt.str()}</span>`:''}</div>`;
  o+=`<p class="small" style="margin:6px 0">أصل المسألة: <b>${r.base}</b> سهماً${r.awl?` (عالت من ${r.awl.from} إلى ${r.awl.to})`:''}.${tza?' والأنصبة التالية من الباقي بعد التنزيل.':''}</p>`;
  if(r.errors.length)o+=`<div class="err">${r.errors.join('<br>')}</div>`;
  const parts=r.heirs.map((hh,i)=>({l:hh.label,f:fac?hh.share.mul(fac):hh.share,c:COLORS[i%COLORS.length]}));
  if(tza)tza.groups.forEach(g=>parts.push({l:g.label+' (تنزيل)',f:g.share,c:'#d4a64a'}));
  if(!r.bayt.isZero())parts.push({l:mode==='A'?'الباقي (بيت المال)':'الباقي (غير موزَّع)',f:fac?r.bayt.mul(fac):r.bayt,c:'#b9b19b'});
  o+=`<div class="bar">${parts.map(p=>`<i title="${p.l}" style="width:${p.f.num()*100}%;background:${p.c}"></i>`).join('')}</div><div class="legend">${parts.map(p=>`<span><b style="background:${p.c}"></b>${p.l} ${pct(p.f)}</span>`).join('')}</div>`;
  o+=`<div class="tbl" style="margin-top:12px"><table><tr><th>الوارث</th><th>العدد</th><th>النصيب</th><th>النسبة</th><th>السهام من ${r.base}</th>${tza?'<th>من أصل التركة</th>':''}${net!=null?'<th>المبلغ</th><th>نصيب الفرد</th>':''}<th>الحالة والسبب</th></tr>`;
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
      <div class="tbl"><table><tr><th>المنزَّل</th><th>العدد</th><th>من التركة</th><th>النسبة</th>${after!=null?'<th>المبلغ</th><th>نصيب الفرد</th>':''}</tr>
      ${tza.groups.map(g=>`<tr><td><b>${g.label}</b></td><td class="num">${g.count}</td><td class="num frac">${F(g.share)}</td><td class="num">${pct(g.share)}</td>${after!=null?`<td class="num">${money(g.share,after)}</td><td class="num">${g.count>1?money(g.per,after):'—'}</td>`:''}</tr>`).join('')}</table></div>
      <div class="note" style="margin-top:8px">ملاحظة: يُحسب هنا التنزيل من التركة بعد التجهيز والديون، ثم تُقسَّم بقية التركة على الورثة الباقين بأنصبتهم. بعض الشروح تحسب النتيجة بصورة أخرى، فراجع المحكمة أو الموثّق عند التطبيق.</div></div>`;
  }
  if(r.steps.length){o+=`<div class="card"><h3 style="margin-top:0">المسائل الخاصة في هذه التركة</h3><ol class="steps">${r.steps.map(s=>`<li>${esc(s)}</li>`).join('')}</ol></div>`}
  o+=`<details class="card edu-d"${window.innerWidth>700?' open':''}><summary>شرح تعليمي مفصّل: لماذا هذه الأنصبة؟</summary>${explain(r,{net})}</details>`;
  if(mode==='C')o+=`<div class="note">ذكّرنا بأن الصيغة الجزائرية هنا تحسب الردّ، وتحسب التنزيل إن فعّلته، وذوي الأرحام في تبويب مستقل.</div>`;
  $('#out').innerHTML=o;
  extras();
  if(ev!==false)$('#out').scrollIntoView({behavior:'smooth',block:'start'});
}
$('#go').onclick=run;$('#abGo').onclick=run;
$('#reset').onclick=()=>{E.KEYS.forEach(k=>val[k]=0);['estate','funeral','debts','bequest'].forEach(i=>$('#'+i).value='');$('#tzOn').checked=false;$('#out').innerHTML='';last=null;shareH='';drawHeirs()};

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
  let o=`<div class="card"><h2>نتيجة ذوي الأرحام</h2><div class="tbl"><table><tr><th>الوارث</th><th>العدد</th><th>النصيب</th><th>النسبة</th>${net?'<th>المبلغ</th><th>نصيب الفرد</th>':''}<th>السبب</th></tr>`;
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
  o+=`<div class="tbl"><table><tr><th>الوارث</th><th>العدد</th><th>النصيب الأصلي</th><th>بعد التخارج</th><th>النسبة</th>${hasM?'<th>يستلم</th><th>يدفع</th><th>الصافي</th>':''}</tr>`;
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


// ---------- حالات خاصة: الحمل والمفقود والخنثى والمناسخات ----------
const sp={tab:'haml',haml:{type:'child',maxN:2},maf:{key:''},kh:{type:'child'},mun:{dead:'',g2:'m',p2:{},links:{}}};
E.KEYS.forEach(k=>sp.mun.p2[k]=0);
const SPT=[['haml','الحمل'],['mafqud','المفقود'],['kh','الخنثى'],['mun','المناسخات']];
const selH=(id,opts,cur)=>`<select id="${id}" style="font:inherit;padding:8px;border:1px solid var(--line);border-radius:10px;width:100%;min-height:44px">${opts.map(([v,l])=>`<option value="${v}"${String(v)===String(cur)?' selected':''}>${l}</option>`).join('')}</select>`;
const nmK=(k,c)=>E.NAMES[k][c>1?1:0];
function curInput(){const i={};E.KEYS.forEach(k=>i[k]=val[k]);if(gender==='m')i.husband=0;else i.wives=0;return i}
function curKeys(){const i=curInput();return E.KEYS.filter(k=>i[k]>0)}
function spHead(){
  const i=curInput();const ks=curKeys();
  const l=ks.map(k=>`${nmK(k,i[k])}${i[k]>1?' ('+i[k]+')':''}`).join('، ');
  return `<div class="note">الورثة المأخوذون من تبويب «الحاسبة»: <b>${l||'لم يُحدَّد أحد بعد'}</b>. الصيغة: <b>${MODES.find(m=>m.id===mode).t}</b>.<div class="row" style="margin-top:8px"><button class="btn alt" id="spEdit">تعديل الورثة في الحاسبة</button></div></div>
  <div class="fld" style="margin:10px 0"><label>المبلغ القابل للقسمة (اختياري)</label><input type="number" id="spMoney" min="0" step="any" placeholder="0"></div>`;
}
function spNet(){const M=parseFloat(($('#spMoney')||{}).value);return isFinite(M)&&M>0?M:null}
function spPicker(){
  const gr=GROUPS.filter(g=>g[0]!=='العصبات الأبعد').map(([t,its])=>`<div class="grp"><div class="t">${t}</div><div class="hgrid">${its.filter(([k])=>!(sp.mun.g2==='m'&&k==='husband')&&!(sp.mun.g2==='f'&&k==='wives')).map(([k,l,mx])=>`<div class="hv tile ${sp.mun.p2[k]?'has':''}"><label>${l}</label><div class="step"><button data-sk="${k}" data-d="-1" aria-label="إنقاص">−</button><output>${sp.mun.p2[k]}</output><button data-sk="${k}" data-d="1" aria-label="زيادة">+</button></div></div>`).join('')}</div></div>`).join('');
  return gr;
}
function drawSpec(){
  const t=sp.tab;
  const seg=`<div class="seg" id="spSeg" style="display:flex;flex-wrap:wrap;margin-bottom:14px">${SPT.map(([k,l])=>`<button data-sp="${k}" class="${k===t?'on':''}" style="flex:1 1 22%">${l}</button>`).join('')}</div>`;
  let b='';
  const ks=curKeys();
  if(t==='haml'){
    b=`<p class="small">الحمل وارث بشرط وجوده وقت موت المورِّث وولادته حياً. قبل الولادة يُعطى كل وارث موجود اليقين (أقل نصيبيه في كل الاحتمالات) ويُوقف الباقي للحمل.</p>
    <div class="grid"><div class="fld"><label>الحمل هو</label>${selH('hmType',['child','gchild','fsib','psib','usib'].map(k=>[k,E.SPEC[k][2]]),sp.haml.type)}</div>
    <div class="fld"><label>أقصى ما يُقدَّر للحمل</label>${selH('hmMax',[[1,'ذكر واحد أو أنثى واحدة'],[2,'ذكران أو أنثيان (الأشهر عند التطبيقيين)'],[3,'ثلاثة'],[4,'أربعة (منقول عن مالك)']],sp.haml.maxN)}</div></div>
    <div class="row" style="margin-top:10px"><button class="btn" id="spGo">احسب ما يُعطى وما يُوقف</button></div>`;
  }else if(t==='mafqud'){
    if(!sp.maf.key||!ks.includes(sp.maf.key))sp.maf.key=ks[0]||'';
    b=`<p class="small">المفقود وارث: نحلّ مسألتين، يُفرض في الأولى حياً وفي الثانية ميتاً، ويُعطى كل وارث موجود الأقل، ويُوقف الباقي حتى يظهر أمره أو يحكم القاضي بموته. اختر أيّ الورثة هو المفقود (واحد منهم).</p>
    <div class="grid"><div class="fld"><label>المفقود هو</label>${selH('mfKey',ks.map(k=>[k,nmK(k,1)]),sp.maf.key)}</div></div>
    <div class="row" style="margin-top:10px"><button class="btn" id="spGo">احسب</button></div>`;
  }else if(t==='kh'){
    b=`<p class="small">الخنثى المشكل عند المالكية: يُحلّ حالَي الذكورة والأنوثة، ولكل وارث (والخنثى منهم) نصف مجموع نصيبيه. لا يكون الخنثى أباً ولا أماً ولا زوجاً، وإنما في جهات البنوة والأخوة.</p>
    <div class="grid"><div class="fld"><label>الخنثى هو</label>${selH('khType',['child','gchild','fsib','psib'].map(k=>[k,E.SPEC[k][2]]),sp.kh.type)}</div></div>
    <p class="small">يضاف خنثى واحد إلى الورثة المدخلين في الحاسبة.</p>
    <div class="row" style="margin-top:10px"><button class="btn" id="spGo">احسب</button></div>`;
  }else{
    if(!sp.mun.dead||!ks.includes(sp.mun.dead))sp.mun.dead=ks[0]||'';
    const links=E.KEYS.filter(k=>sp.mun.p2[k]>0&&sp.mun.p2[k]===1);
    const firsts=ks.filter(k=>k!==sp.mun.dead&&curInput()[k]===1);
    b=`<p class="small">المناسخات: أن يموت وارث قبل قسمة التركة الأولى. الورثة الحاليون في الحاسبة هم ورثة <b>الميت الأول</b>. اختر من مات منهم، ثم أدخل ورثة <b>الميت الثاني</b>.</p>
    <div class="grid"><div class="fld"><label>الوارث الذي مات (الميت الثاني)</label>${selH('mnDead',ks.map(k=>[k,nmK(k,1)]),sp.mun.dead)}</div>
    <div class="fld"><label>الميت الثاني</label><div class="seg" id="mnG"><button data-g2="m" class="${sp.mun.g2==='m'?'on':''}">ذكر</button><button data-g2="f" class="${sp.mun.g2==='f'?'on':''}">أنثى</button></div></div></div>
    <h3>ورثة الميت الثاني</h3>${spPicker()}
    ${links.length&&firsts.length?`<h3>هل أحدهم من ورثة الميت الأول؟ (اختياري)</h3><p class="small">مثلاً: أم الميت الثاني هي زوجة الميت الأول. اربط بينهما ليُجمع نصيباها.</p>${links.map(k=>`<div class="fld" style="margin:6px 0"><label>${nmK(k,1)} في المسألة الثانية هو نفسه:</label>${selH('mnL_'+k,[['','شخص آخر'],...firsts.map(f=>[f,nmK(f,1)+' في المسألة الأولى'])],sp.mun.links[k]||'')}</div>`).join('')}`:''}
    <div class="row" style="margin-top:10px"><button class="btn" id="spGo">احسب المناسخة</button></div>`;
  }
  $('#spBody').innerHTML=spHead()+seg+b;
  $('#spOut').innerHTML='';
}
$('#spBody').addEventListener('click',e=>{
  const bt=e.target.closest('button');if(!bt)return;
  if(bt.dataset.sp){sp.tab=bt.dataset.sp;drawSpec();return}
  if(bt.id==='spEdit'){tab('calc');window.scrollTo({top:0,behavior:'smooth'});return}
  if(bt.dataset.g2){sp.mun.g2=bt.dataset.g2;if(bt.dataset.g2==='m')sp.mun.p2.husband=0;else sp.mun.p2.wives=0;drawSpec();return}
  if(bt.dataset.sk){const k=bt.dataset.sk,d=+bt.dataset.d;const mx=(GROUPS.flatMap(g=>g[1]).find(x=>x[0]===k)||[0,0,30])[2];sp.mun.p2[k]=Math.max(0,Math.min(mx,sp.mun.p2[k]+d));
    if(!sp.mun.p2[k])delete sp.mun.links[k];const y=window.scrollY;drawSpec();window.scrollTo(0,y);return}
  if(bt.id==='spGo')runSpec();
});
$('#spBody').addEventListener('change',e=>{
  const id=e.target.id;if(!id)return;
  if(id==='hmType')sp.haml.type=e.target.value;else if(id==='hmMax')sp.haml.maxN=+e.target.value;else if(id==='mfKey')sp.maf.key=e.target.value;else if(id==='khType')sp.kh.type=e.target.value;
  else if(id==='mnDead'){sp.mun.dead=e.target.value;sp.mun.links={};drawSpec()}
  else if(id.startsWith('mnL_')){sp.mun.links[id.slice(4)]=e.target.value}
});
const cell=(f,net)=>`<td class="num frac">${F(f)}</td><td class="num">${pct(f)}</td>${net!=null?`<td class="num">${money(f,net)}</td>`:''}`;
function runSpec(){
  const inp=curInput(),net=spNet(),t=sp.tab;let o='';
  if(!curKeys().length){$('#spOut').innerHTML=`<div class="err">حدّد الورثة في تبويب «الحاسبة» أولاً.</div>`;return}
  if(t==='haml'){
    const r=E.solveHaml(inp,mode,{type:sp.haml.type,maxN:sp.haml.maxN});
    if(r.errors.length){$('#spOut').innerHTML=`<div class="err">${[...new Set(r.errors)].join('<br>')}</div>`;return}
    o=`<div class="card"><h2>ما يُعطى الآن وما يُوقف للحمل</h2><p>الحمل: <b>${r.typeLabel}</b>. التقدير: حتى ${['','واحد','اثنين','ثلاثة','أربعة'][sp.haml.maxN]}.</p>
    <div class="tbl"><table><tr><th>الوارث</th><th>العدد</th><th>يُعطى الآن</th><th>النسبة</th>${net!=null?'<th>المبلغ</th>':''}</tr>
    ${r.given.map(g=>`<tr><td><b>${g.label}</b></td><td class="num">${g.count}</td>${cell(g.share,net)}</tr>`).join('')}
    <tr><td><b>الموقوف للحمل</b></td><td class="num">—</td>${cell(r.held,net)}</tr></table></div>
    <p class="small">يُعطى كل وارث <b>أقل</b> نصيبيه في كل الاحتمالات ليُؤمَن الرجوع عليه. ويُوقف الباقي: أكثر ما قد يستحقه الحمل هو <span class="frac">${F(r.hamalMax)}</span>${r.held.gt(r.hamalMax)?`، وما زاد على ذلك (<span class="frac">${F(r.held.sub(r.hamalMax))}</span>) يرجع للورثة بحسب الاحتمال الذي يتحقق`:''}.</p></div>`;
    const gh=r.given;
    o+=`<div class="card"><h2>القسمة بعد الولادة</h2><div class="tbl"><table><tr><th>إن وُلد</th><th>نصيب الحمل</th>${gh.map(g=>`<th>${g.label}</th>`).join('')}${r.scenarios.some(s=>!s.bayt.isZero())?'<th>بيت المال</th>':''}</tr>
    ${r.scenarios.map(s=>`<tr><td><b>${s.label}</b></td><td class="num frac">${F(s.hamal)}</td>${gh.map(g=>`<td class="num frac">${F(s.rows[g.key]?s.rows[g.key].per.mul(g.count):E.fr(0))}</td>`).join('')}${r.scenarios.some(x=>!x.bayt.isZero())?`<td class="num frac">${F(s.bayt)}</td>`:''}</tr>`).join('')}</table></div>
    <div class="note">بعد الولادة تُصحَّح القسمة بحسب ما وُلد فعلاً: يأخذ الحمل نصيبه، ويكمل الورثة ما نقص عليهم من الموقوف. وإن وُلد أكثر مما قُدِّر رجع على الورثة بما ينقص. وأقل مدة الحمل ستة أشهر وأقصاها في القانون الجزائري عشرة أشهر.</div></div>`;
  }else if(t==='mafqud'){
    const r=E.solveMafqud(inp,mode,sp.maf.key);
    if(r.errors.length){$('#spOut').innerHTML=`<div class="err">${r.errors.join('<br>')}</div>`;return}
    o=`<div class="card"><h2>نتيجة المفقود: ${r.mafqudLabel}</h2>
    <div class="tbl"><table><tr><th>الوارث</th><th>العدد</th><th>إن كان المفقود حياً</th><th>إن كان ميتاً</th><th>يُعطى الآن</th>${net!=null?'<th>المبلغ الآن</th>':''}</tr>
    ${r.rows.map(x=>`<tr><td><b>${x.label}</b></td><td class="num">${x.count}</td><td class="num frac">${F(x.alive)}</td><td class="num frac">${F(x.dead)}</td><td class="num frac">${F(x.given)}</td>${net!=null?`<td class="num">${money(x.given,net)}</td>`:''}</tr>`).join('')}
    <tr><td><b>المفقود (موقوف له)</b></td><td class="num">1</td><td class="num frac">${F(r.mafqudAlive)}</td><td class="num">0</td><td class="num frac">${F(r.held)}</td>${net!=null?`<td class="num">${money(r.held,net)}</td>`:''}</tr></table></div>
    <p class="small">المبلغ الموقوف <span class="frac">${F(r.held)}</span> يبقى محفوظاً: إن ظهر المفقود حياً أخذ نصيبه (<span class="frac">${F(r.mafqudAlive)}</span>) ويُردّ الباقي إلى الورثة. وإن حكم القاضي بموته أخذ الورثة الأحياء تمام نصيبهم في عمود «إن كان ميتاً».</p>
    <div class="note">مدة الانتظار عند المالكية: إن غلبت السلامة فيُنتظر بلوغ سبعين سنة من ولادته على المشهور. وفي قانون الأسرة الجزائري (المادة 109) يُقدِّر القاضي المدة بعد مضي أربع سنوات. وإن كان المفقود <b>مورِّثاً</b> فلا يُقسَّم ماله حتى يحكم القاضي بموته.</div></div>`;
  }else if(t==='kh'){
    const r=E.solveKhuntha(inp,mode,sp.kh.type);
    if(r.errors.length){$('#spOut').innerHTML=`<div class="err">${r.errors.join('<br>')}</div>`;return}
    o=`<div class="card"><h2>نتيجة الخنثى المشكل</h2><p>الخنثى: <b>${r.typeLabel}</b>. المالكية: لكل وارث نصف مجموع نصيبيه.</p>
    <div class="tbl"><table><tr><th>الوارث</th><th>إن كان ذكراً</th><th>إن كان أنثى</th><th>النصيب (نصف المجموع)</th><th>النسبة</th>${net!=null?'<th>المبلغ</th>':''}</tr>
    ${r.rows.map(x=>`<tr><td><b>${x.label}${x.count>1?' ('+x.count+')':''}</b></td><td class="num frac">${F(x.male)}</td><td class="num frac">${F(x.female)}</td>${cell(x.avg,net)}</tr>`).join('')}
    <tr><td><b>الخنثى</b></td><td class="num frac">${F(r.khuntha.male)}</td><td class="num frac">${F(r.khuntha.female)}</td>${cell(r.khuntha.avg,net)}</tr>
    ${r.bayt.avg.isZero()?'':`<tr><td><b>بيت المال</b></td><td class="num frac">${F(r.bayt.male)}</td><td class="num frac">${F(r.bayt.female)}</td>${cell(r.bayt.avg,net)}</tr>`}</table></div>
    <div class="note">الطريقة: مسألة أولى يُفرض فيها الخنثى ذكراً، وثانية أنثى، ثم يُجمع نصيب كل وارث من المسألتين ويُقسَّم على اثنين. (وعند الحنفية يُعطى الأقل، وعند الشافعية اليقين مع الوقف.)</div></div>`;
  }else{
    const p2={};E.KEYS.forEach(k=>p2[k]=sp.mun.p2[k]);if(sp.mun.g2==='m')p2.husband=0;else p2.wives=0;
    const r=E.munasakha(inp,mode,sp.mun.dead,p2,mode,sp.mun.links);
    if(r.errors.length){$('#spOut').innerHTML=`<div class="err">${r.errors.join('<br>')}</div>`;return}
    const relTxt=r.relation==='انقسام'?`تنقسم سهامه (${r.d}) على مسألته (${r.T2}) انقساماً صحيحاً، فالجامعة هي المسألة الأولى (${r.T1}).`:r.relation==='توافق'?`سهامه (${r.d}) ومسألته (${r.T2}) متوافقان بالجزء 1/${r.g}، فوفق المسألة الثانية = ${r.f1}، والجامعة = ${r.T1} × ${r.f1} = ${r.J}.`:`سهامه (${r.d}) ومسألته (${r.T2}) متباينان، فتُضرب المسألة الثانية كاملة (${r.f1}) في الأولى: الجامعة = ${r.T1} × ${r.f1} = ${r.J}.`;
    o=`<div class="card"><h2>نتيجة المناسخة</h2>
    <ol class="steps"><li><b>المسألة الأولى:</b> تصحّ من ${r.T1}. الميت الثاني (${r.deadLabel}) له <b>${r.d}</b> سهماً، أي <span class="frac">${F(r.s1)}</span> من التركة.</li>
    <li><b>المسألة الثانية:</b> تصحّ من ${r.T2}.</li>
    <li><b>المقارنة (${r.relation}):</b> ${relTxt}</li>
    <li>سهام كل وارث من الأولى × ${r.f1}، وسهام ورثة الثاني × ${r.f2}.</li></ol>
    <div class="tbl"><table><tr><th>الوارث</th><th>العدد</th><th>سهام الفرد من ${r.J}</th><th>نصيب الفرد</th><th>نصيب الجميع</th><th>النسبة</th>${net!=null?'<th>المبلغ للفرد</th>':''}<th>ملاحظة</th></tr>
    ${r.rows.map(x=>{const per=x.per1.add(x.per2);return `<tr><td><b>${x.label}</b></td><td class="num">${x.count}</td><td class="num">${x.sihaam.str()}</td><td class="num frac">${F(per)}</td><td class="num frac">${F(per.mul(E.fr(x.count)))}</td><td class="num">${pct(per.mul(E.fr(x.count)))}</td>${net!=null?`<td class="num">${money(per,net)}</td>`:''}<td class="small">${x.notes.join('، ')}</td></tr>`}).join('')}</table></div>
    ${r.bayt.isZero()?'':`<p class="small">الباقي لبيت المال: <span class="frac">${F(r.bayt)}</span></p>`}
    <div class="note">الأحياء وقت القسمة هم وحدهم من يرث. تحقّق: مجموع السهام = ${r.J}.</div></div>`;
  }
  $('#spOut').innerHTML=o;$('#spOut').scrollIntoView({behavior:'smooth',block:'start'});
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
/* ===== القسم الأول: مدخل وأحكام عامة ===== */
{g:'القسم الأول: مدخل وأحكام عامة',t:'مدخل إلى علم الفرائض',s:'المبادئ العشرة: الحد والموضوع والثمرة والفضل...',
 b:`<p><b>المواريث لغة:</b> جمع ميراث، من الإرث وهو البقية والأصل. وقد بيّن القرافي أن المعنى منطبق على العلم، فهو بقية انتقلت من السلف إلى الخلف.</p>
 <p><b>اصطلاحاً:</b> علم يُعرف به من يرث ومن لا يرث ومقدار ما لكل وارث (الدردير). وعرّفه بعض المعاصرين بأنه علم بقواعد فقهية وحسابية يُعرف بها نصيب كل وارث من التركة.</p>
 <p>ينبغي لمن أراد التأسس في أي علم أن يعرف <b>مبادئه العشرة</b>:</p>
 <ol><li><b>حدّه:</b> ما سبق.</li><li><b>موضوعه:</b> التركات من حيث قسمتها وبيان نصيب كل وارث منها.</li><li><b>ثمرته:</b> إيصال الحقوق إلى ذويها على وفق ما شرعه الله، والبعد عن الظلم والجور في قسمة التركات.</li><li><b>نسبته:</b> من العلوم الشرعية.</li><li><b>فضله:</b> من أجلّ العلوم؛ فقد سمّى الله الفرائض «حدوداً»، وقدّرها بنفسه، ووعد من أطاعه فيها بالجنة وتوعّد من عصاه فيها بالنار.</li><li><b>واضعه:</b> علم قرآني تنزيل من الله، وأجمع الصحابة على غالب مسائله.</li><li><b>اسمه:</b> المواريث، ويسمى الفرائض (لأن غالب من يرث يرث بالفرض).</li><li><b>استمداده:</b> من الكتاب والسنة وإجماع الصحابة.</li><li><b>حكمه:</b> فرض كفاية؛ إذا قام به من يكفي سقط عن الباقين (وقد يتعيّن على طلبة العلم عند العزوف عنه).</li><li><b>مسائله:</b> ميراث أصحاب الفروض، والعصبات، والمحجوبون، والردّ ونحوه.</li></ol>
 <div class="note">قال تعالى بعد آيات المواريث: «تلك حدود الله ومن يطع الله ورسوله يدخله جنات تجري من تحتها الأنهار خالدين فيها وذلك الفوز العظيم» (النساء 13).</div>`,
 e:[
 {t:'mcq',q:'موضوع علم المواريث هو:',o:['التركات من حيث قسمتها وبيان نصيب كل وارث','الوصايا والهبات','عقد الزواج وآثاره','الديون وأحكامها'],a:0,w:'موضوعه التركات من حيث قسمتها وبيان نصيب كل وارث.'},
 {t:'mcq',q:'حكم تعلّم علم المواريث وتعليمه:',o:['فرض عين على كل مسلم','فرض كفاية','مستحب فقط','مباح'],a:1,w:'فرض كفاية، إذا قام به من يكفي سقط عن الباقين.'},
 {t:'mcq',q:'لماذا سُمّي علم المواريث بعلم «الفرائض»؟',o:['لأن الصلاة فريضة','لأن غالب من يرث يرث بالفرض','لأنه يدرس الزكاة','لأن الفرائض أكثر من التعصيب في الحساب فقط'],a:1,w:'سُمّي بذلك لأن غالب من يرث يرث بالفرض المقدّر.'},
 {t:'mcq',q:'ثمرة علم المواريث وغايته:',o:['جمع المال','إيصال الحقوق إلى ذويها وتجنّب الظلم في قسمة التركات','تقليل عدد الورثة','حفظ الأنساب فقط'],a:1,w:'الثمرة هي إيصال الحقوق إلى أصحابها وفق ما شرعه الله.'}]},

{t:'الحقوق المتعلقة بالتركة',s:'التجهيز ثم الديون ثم الوصية ثم الميراث',
 b:`<p>قبل أن تُقسَّم التركة بين الورثة تتعلق بها حقوق مرتبة:</p>
 <ol><li><b>مؤونة التجهيز:</b> ثمن ماء الغسل والكفن والحنوط وأجرة الغاسل وحافر القبر، وتُقدَّم على جميع الحقوق كما يُقدَّم المفلس بنفقته ولباسه على غرمائه. (وعند الأئمة الثلاثة تُقدَّم الحقوق المتعلقة بعين التركة قبلها.)</li>
 <li><b>الديون المتعلقة بعين التركة:</b> كالدين الذي فيه رهن، وأرش جناية العبد برقبته، وكالزكاة المتعلقة بعين المال.</li>
 <li><b>الديون المرسلة في الذمة:</b> التي لا تتعلق بعين التركة، سواء كانت لله كالزكاة والكفارة وفدية الصيام ودين الحج، أو لآدمي كالقرض والأجرة وثمن المبيع. ويُسوّى بين الديون بالحصص إن لم تف التركة بالجميع.</li>
 <li><b>الوصية:</b> تمليك مضاف إلى ما بعد الموت، وتنفذ في حدود <b>الثلث</b> وبشرط ألا تكون لوارث، وما زاد يتوقف على إجازة الورثة.</li>
 <li><b>الميراث:</b> وهو آخر الحقوق، يُقسَّم ما بقي على الورثة الشرعيين فرضاً أو تعصيباً أو بهما.</li></ol>
 <p><b>سؤال تأمّل:</b> لماذا ذُكرت الوصية قبل الدين في الآية «من بعد وصية يوصي بها أو دين» مع أن الدين مقدَّم في التنفيذ؟ الجواب: اهتماماً بالوصية لأنها تبرّع قد يتهاون الورثة في إخراجه، أما الدين فله من يطالب به.</p>
 <div class="note">مثال: تركة 100000 والتجهيز 5000 والديون 20000. الباقي للوصية والميراث 75000. فإن أوصى بـ 50000 لغير وارث نفذ منها ثلث الباقي وهو 25000 بلا إجازة، ويبقى للورثة 50000.</div>`,
 e:[
 {t:'mcq',q:'ما أول ما يُخرَج من التركة؟',o:['الوصية','تجهيز الميت ودفنه','الديون المرسلة','نصيب الورثة'],a:1,w:'يبدأ بالتجهيز، ثم الديون، ثم الوصية، ثم الميراث.'},
 {t:'mcq',q:'تركة 90000 لا ديون ولا تجهيز، وأوصى الميت لغير وارث بـ 50000. كم ينفذ بلا إجازة الورثة؟',o:['50000','45000','30000','90000'],a:2,w:'الوصية النافذة بلا إجازة هي الثلث: 90000 ÷ 3 = 30000.'},
 {t:'mcq',q:'الوصية لوارث:',o:['نافذة دائماً','نافذة في الثلث','لا تنفذ إلا بإجازة بقية الورثة','باطلة ولو أجازوا'],a:2,w:'«لا وصية لوارث»: تتوقف على إجازة بقية الورثة.'},
 {t:'mcq',q:'مات رجل وعليه دين وزكاة لم يؤدّها وفدية صيام. كيف تُعامل هذه الحقوق؟',o:['تسقط بالموت','ديون في الذمة تُخرج قبل الوصية والميراث','تُخرج من الثلث','تُؤخَّر بعد الميراث'],a:1,w:'حقوق الله المالية كحقوق الآدميين ديون تُقدَّم على الوصية والميراث.'}]},

{t:'أركان الميراث وشروطه',s:'المورِّث والوارث والموروث، وشروط الإرث الثلاثة',
 b:`<p><b>أركان الميراث ثلاثة،</b> لا تتحقق ماهيته إلا بها:</p>
 <ol><li><b>المورِّث:</b> الميت ومن في حكمه، الذي ترك مالاً أو حقاً.</li><li><b>الوارث:</b> الحيّ الذي يستحق الإرث بسبب من أسبابه.</li><li><b>الموروث (التركة):</b> كل ما يتركه الميت من أموال وحقوق.</li></ol>
 <p><b>الشرط:</b> ما يلزم من عدمه العدم، ولا يلزم من وجوده الوجود. <b>وشروط الميراث ثلاثة</b> متفق عليها، فإن فقد شرط منها فلا ميراث:</p>
 <ol><li><b>تحقق موت المورِّث:</b> حقيقةً، أو حكماً كالمفقود يحكم القاضي بموته، أو تقديراً كجنين انفصل ميتاً بجناية على أمه.</li><li><b>تحقق حياة الوارث بعد موت المورِّث:</b> حقيقةً أو تقديراً كالحمل.</li><li><b>العلم بجهة الإرث ودرجته:</b> قرابة أو زوجية أو ولاء، وكم درجة تفصله عن الميت.</li></ol>
 <div class="note"><b>السبب</b> يلزم من وجوده الوجود ومن عدمه العدم (كالنكاح والنسب). <b>الشرط</b> يلزم من عدمه العدم. <b>المانع</b> يلزم من وجوده العدم، ولا يلزم من عدمه وجود ولا عدم.</div>
 <p><b>فرع مهم:</b> إذا مات اثنان في حادث كغرق أو هدم وجُهل أيهما مات أولاً، فلا يتوارثان لعدم تحقق حياة الوارث بعد موت المورِّث.</p>`,
 e:[
 {t:'mcq',q:'أي هذه ليس من أركان الميراث؟',o:['المورِّث','الوارث','الموروث (التركة)','القاضي'],a:3,w:'الأركان: المورِّث، الوارث، الموروث.'},
 {t:'mcq',q:'مات أخوان في حادث هدم ولا يُعلم أيهما مات أولاً. هل يرث أحدهما الآخر؟',o:['نعم، الأكبر يرث الأصغر','نعم، الأصغر يرث الأكبر','لا، لعدم تحقق حياة الوارث بعد موت المورِّث','نعم، بالتساوي'],a:2,w:'لم يتحقق شرط حياة الوارث بعد موت المورِّث، فلا توارث بينهما، وترثهما ورثتهما الآخرون.'},
 {t:'mcq',q:'الجنين الذي كان حياً في بطن أمه عند موت مورِّثه ثم وُلد حياً:',o:['لا يرث لأنه لم يولد بعد','يرث لأن حياته متحققة تقديراً عند الموت','يرث نصف نصيبه','يرث بإجازة الورثة'],a:1,w:'حياة الوارث تتحقق حقيقة أو تقديراً كالحمل.'},
 {t:'mcq',q:'تعريف «المانع» في علم المواريث:',o:['ما يلزم من وجوده العدم ولا يلزم من عدمه وجود ولا عدم','ما يلزم من عدمه العدم','ما يلزم من وجوده الوجود','ما يبيح القسمة'],a:0,w:'المانع: يلزم من وجوده عدم الإرث، ولا يلزم من عدمه الإرث.'}]},

{t:'أسباب الإرث',s:'النكاح والنسب والولاء عند المالكية',
 b:`<p>الأسباب ثلاثة، وبيانها على مذهب المالكية:</p>
 <h3>1) النكاح (الزوجية)</h3>
 <p>كل عقد نكاح صحيح وإن لم يحصل دخول، بل طردوا السببية حتى في الأنكحة المختلف فيها إذا ثبت فيها النسب وسقط الحدّ. فالزوجان يتوارثان بالعقد ما دامت الزوجية قائمة.</p>
 <ul><li>يرتفع الإرث بالطلاق <b>البائن</b> أو الخلع.</li><li>الطلاق <b>الرجعي</b>: ترث الزوجة ما دامت في العدة.</li><li>الطلاق في <b>مرض الموت</b> يثبت به الإرث للمطلَّقة (قضاء عثمان رضي الله عنه) معاملةً للفاعل بنقيض قصده.</li><li>لا تستحق صداقاً إن مات قبل الدخول ولم يُسمَّ لها صداق، وترث.</li></ul>
 <h3>2) النسب (القرابة أو الرحم)</h3>
 <p>الاتصال بين إنسانين بولادة قريبة أو بعيدة: «وأولو الأرحام بعضهم أولى ببعض في كتاب الله». وينقسم إلى:</p>
 <ul><li><b>الأصول:</b> الأب والجد وإن علا.</li><li><b>الفروع:</b> الابن وابن الابن وإن نزل.</li><li><b>الحواشي:</b> الإخوة وأبناؤهم، والأعمام وأبناؤهم.</li></ul>
 <h3>3) الولاء</h3>
 <p>رابطة بين السيد المعتِق وعتيقه، أجراها الشرع مجرى النسب: «الولاء لمن أعتق». وهو عصوبة يرث بها المعتِق عند عدم عصبة النسب، فيحوز المال كله إذا انفرد، أو ما بقي بعد أصحاب الفروض. والموالي ثلاثة: مولى الرجل الذي أعتقه، ومولى أبيه، ومولى أمه.</p>
 <div class="note">حصر الأسباب في ثلاثة مبنيّ على القول بعدم توريث بيت المال (كما قال النفراوي). وعصوبة الولاء مؤخرة عن عصوبة النسب.</div>`,
 e:[
 {t:'mcq',q:'عقد رجل على امرأة ولم يدخل بها ثم مات. هل ترثه؟',o:['لا، لأنه لم يدخل','نعم، فالإرث يثبت بالعقد الصحيح','نصف نصيبها','بإجازة الورثة'],a:1,w:'النكاح سبب للإرث بمجرد العقد الصحيح ولو لم يقع دخول.'},
 {t:'mcq',q:'طلّق رجل زوجته طلاقاً رجعياً ثم مات وهي في العدة. حكمها:',o:['لا ترث','ترث لأن الزوجية لم تنقطع بالرجعي','ترث نصف نصيبها','ترث الثمن دائماً'],a:1,w:'الطلاق الرجعي لا يقطع الزوجية في العدة، فترث.'},
 {t:'mcq',q:'من «الحواشي» في أقسام القرابة؟',o:['الأب','الابن','الأخ وابن الأخ','الجد'],a:2,w:'الحواشي: الإخوة وأبناؤهم والأعمام وأبناؤهم. أما الأصول فالأب والجد، والفروع الابن وابن الابن.'},
 {t:'mcq',q:'ترتيب عصوبة الولاء بالنسبة إلى عصوبة النسب:',o:['مقدَّمة عليها','مساوية لها','متأخرة عنها','لا علاقة بينهما'],a:2,w:'الولاء يرث عند عدم عصبة النسب.'}]},

{t:'موانع الإرث السبعة',s:'«عش لك رزق»: عدم الاستهلال، الشك، اللعان، الكفر، الرق، الزنا، القتل',
 b:`<p>قد تتوفر الأسباب والشروط ولا ينتقل المال لوجود <b>مانع</b>. وقد جمعها المالكية في سبعة تُحفظ بعبارة <b>«عش لك رزق»</b>:</p>
 <ol>
 <li><b>ع: عدم الاستهلال.</b> المولود الذي لم يستهلّ صارخاً أو بحركة تدل على الحياة لا يرث. وعلامات الحياة عند المالكية: الصراخ أو البكاء أو العطاس أو التنفس أو حركة زائدة عن العادة.</li>
 <li><b>ش: الشك.</b> الشك في السابق بالموت (كالغرقى والهدمى)، أو في الوجود (كالمفقود)، أو في الجهة، أو الذكورة والأنوثة (كالخنثى) فيمنع حتى يُرفع الشك.</li>
 <li><b>ل: اللعان.</b> إذا حصل اللعان بين الزوجين فُرّق بينهما ولم يتوارثا، ولا توارث بين الأب وولد نفاه باللعان.</li>
 <li><b>ك: الكفر.</b> «لا يرث المسلم الكافر ولا الكافر المسلم» (متفق عليه). بل منع المالكية التوارث بين أهل ملتين كافرتين، لأن الكفر عندهم ملل.</li>
 <li><b>ر: الرق.</b> الرقيق لا يملك، فلو ورث لكان الإرث لسيده الأجنبي عن الميت.</li>
 <li><b>ز: الزنا.</b> لا توارث بين الزاني وولد الزنا، ويتوارث ولد الزنا وأمه لأنه ينسب إليها.</li>
 <li><b>ق: القتل.</b> «لا يرث القاتل شيئاً». والقتل العمد العدوان يمنع من الإرث مطلقاً. وعند مالك: القاتل خطأً يرث من مال المقتول دون الدية.</li></ol>
 <div class="note">التعميم في الأصل: منع القاتل من الإرث سدّاً للذريعة، فقد يقتل المورِّث ليتعجل إرثه.</div>`,
 e:[
 {t:'mcq',q:'ماذا يرمز الحرف «ك» في عبارة «عش لك رزق»؟',o:['الكتابة','الكفر','الكفالة','الكسب'],a:1,w:'ك: الكفر. ع: عدم الاستهلال. ش: الشك. ل: اللعان. ر: الرق. ز: الزنا. ق: القتل.'},
 {t:'mcq',q:'مات رجل مسلم وله ابن نصراني. هل يرثه الابن؟',o:['نعم بالفرض','نعم بالتعصيب','لا، اختلاف الدين مانع','لا إلا بإجازة الورثة'],a:2,w:'«لا يرث المسلم الكافر ولا الكافر المسلم».'},
 {t:'mcq',q:'ابن قتل أباه عمداً عدواناً. حكمه:',o:['يرث نصيبه كاملاً','لا يرث لأن القتل العمد العدوان مانع','يرث نصف نصيبه','يرث من الدية فقط'],a:1,w:'القتل العمد العدوان مانع من الإرث، وفي الباب «لا يرث القاتل شيئاً».'},
 {t:'mcq',q:'ولد وُلد حياً وصرخ ثم مات بعد ساعة. هل يكون «عدم الاستهلال» مانعاً في حقه؟',o:['نعم، لأنه مات','لا، فقد استهلّ وتحققت حياته فيرث ثم يُورَّث عنه','نعم لأنه لم يعش يوماً','لا يرث إلا من أمه'],a:1,w:'استهلّ صارخاً فتحققت حياته، فهو وارث، ثم يرثه ورثته.'},
 {t:'mcq',q:'ولد الزنا وأمه:',o:['لا يتوارثان','يتوارثان لأنه ينسب إليها','يرثها فقط ولا ترثه','يتوارثان بإجازة الورثة'],a:1,w:'يتوارث ولد الزنا وأمه لأنه ينسب إليها، ولا توارث بينه وبين الزاني.'}]},

{t:'مصادر المواريث: القرآن والسنة والإجماع',s:'آيات المواريث والأحاديث والإجماع',
 b:`<h3>أولاً: القرآن</h3>
 <p><b>الموضع الأول: آيات عامة بلا تفصيل:</b></p>
 <ul><li>النساء 7: «للرجال نصيب مما ترك الوالدان والأقربون وللنساء نصيب مما ترك الوالدان والأقربون مما قل منه أو كثر نصيباً مفروضاً».</li><li>الأنفال 75: «وأولو الأرحام بعضهم أولى ببعض في كتاب الله».</li></ul>
 <p><b>الموضع الثاني: آيات تفصيلية، وهي عمدة المواريث:</b></p>
 <ul><li><b>النساء 11</b> (الآية العظمى): ميراث الأولاد والأبوين، «للذكر مثل حظ الأنثيين»، وثلثا البنات، ونصف الواحدة، وسدس كل من الأبوين مع الولد، وثلث الأم، وسدسها مع الإخوة.</li><li><b>النساء 12:</b> ميراث الزوجين (النصف والربع، والربع والثمن)، والإخوة لأم (السدس للواحد والثلث للجمع)، وأحكام الوصية والدين.</li><li><b>النساء 176</b> (آية الكلالة الثانية): ميراث الإخوة والأخوات الأشقاء ولأب عند عدم الأصول والفروع.</li></ul>
 <h3>ثانياً: السنة</h3>
 <ul><li>«ألحقوا الفرائض بأهلها فما بقي فهو لأولى رجل ذكر» (البخاري ومسلم)، أصل التعصيب.</li><li>حديث سعد بن أبي وقاص: «الثلث والثلث كثير»، أصل حدّ الوصية.</li><li>«لا يرث المسلم الكافر ولا الكافر المسلم».</li><li>حديث امرأة سعد بن الربيع: للبنتين الثلثان، وللمرأة الثمن، وما بقي للأخ (العم).</li><li>حديث ابن مسعود: لبنت النصف، ولبنت الابن السدس تكملة الثلثين، وما بقي للأخت.</li></ul>
 <h3>ثالثاً: الإجماع</h3>
 <ul><li>ميراث الجدة (السدس): قضى به النبي ﷺ، وشهد به المغيرة ومحمد بن مسلمة عند أبي بكر.</li><li>اشتراك الزوجات في الربع أو الثمن.</li><li>ميراث الجد الصحيح عند عدم الأب، فيأخذ منزلة الأب.</li></ul>`,
 e:[
 {t:'mcq',q:'كم عدد الآيات التفصيلية في المواريث؟',o:['اثنتان','ثلاث (النساء 11 و12 و176)','أربع','ست'],a:1,w:'هي: النساء 11، والنساء 12، والنساء 176.'},
 {t:'mcq',q:'أي آية تبيّن ميراث الإخوة والأخوات الأشقاء ولأب؟',o:['النساء 11','النساء 12','النساء 176','الأنفال 75'],a:2,w:'آية الكلالة الثانية (النساء 176).'},
 {t:'mcq',q:'الحديث «ألحقوا الفرائض بأهلها فما بقي فلأولى رجل ذكر» أصل:',o:['الوصية','الحجب','التعصيب','العول'],a:2,w:'هو الأصل في التعصيب.'},
 {t:'mcq',q:'حديث ابن مسعود في «بنت وبنت ابن وأخت» تضمّن أن لبنت الابن:',o:['النصف','الثلث','السدس تكملة الثلثين','لا شيء'],a:2,w:'للبنت النصف، ولبنت الابن السدس تكملة الثلثين، وما بقي للأخت.'}]},

{t:'الوارثون وطرق الإرث',s:'15 من الرجال و10 من النساء، والفروض الستة',
 b:`<h3>الوارثون من الرجال (15)</h3>
 <p>الابن، ابن الابن وإن نزل، الأب، الجد وإن علا، الأخ الشقيق، الأخ لأب، الأخ لأم، ابن الأخ الشقيق، ابن الأخ لأب، العم الشقيق، العم لأب، ابن العم الشقيق، ابن العم لأب، الزوج، المعتِق.</p>
 <h3>الوارثات من النساء (10)</h3>
 <p>البنت، بنت الابن، الأم، الجدة من جهة الأم، الجدة من جهة الأب، الأخت الشقيقة، الأخت لأب، الأخت لأم، الزوجة، المعتِقة.</p>
 <h3>طرق الإرث</h3>
 <ol><li><b>الإرث بالفرض:</b> نصيب مقدَّر شرعاً لوارث خاص، لا يزيد إلا بالعول ولا ينقص إلا بالرد.</li><li><b>الإرث بالتعصيب:</b> لا نصيب مقدَّر، بل يأخذ ما بقي بعد الفروض أو المال كله عند الانفراد.</li><li><b>ذوو الأرحام:</b> الأقارب غير أصحاب الفروض والعصبات (كأولاد البنات والخالات والعمات)، ولا يرثون عند المالكية الأولين، ويرثون في القانون الجزائري.</li></ol>
 <h3>الفروض الستة</h3>
 <p>النصف (1/2)، ونصفه الربع (1/4)، ونصف نصفه الثمن (1/8). والثلثان (2/3)، ونصفهما الثلث (1/3)، ونصف نصفهما السدس (1/6).</p>
 <h3>أصحاب الفروض الاثنا عشر</h3>
 <p><b>الرجال (4):</b> الأب، الجد الصحيح، الأخ لأم، الزوج. <b>النساء (8):</b> الزوجة، الأم، الجدة الصحيحة، البنت، بنت الابن، الأخت الشقيقة، الأخت لأب، الأخت لأم.</p>`,
 e:[
 {t:'mcq',q:'عدد الفروض المقدَّرة في القرآن:',o:['أربعة','خمسة','ستة','ثمانية'],a:2,w:'النصف والربع والثمن والثلثان والثلث والسدس.'},
 {t:'mcq',q:'أي هؤلاء ليس من أصحاب الفروض؟',o:['الزوج','الأخ لأم','العم الشقيق','الجد الصحيح'],a:2,w:'العم عاصب بنفسه، وليس له فرض مقدَّر.'},
 {t:'mcq',q:'عدد أصحاب الفروض من الرجال:',o:['2','4','6','8'],a:1,w:'الأب، الجد الصحيح، الأخ لأم، الزوج.'},
 {t:'mcq',q:'الثمن هو نصف:',o:['النصف','الربع','الثلث','السدس'],a:1,w:'النصف ونصفه الربع ونصف نصفه الثمن.'},
 {t:'mcq',q:'من هم ذوو الأرحام؟',o:['أصحاب الفروض','العصبات','الأقارب غير أصحاب الفروض والعصبات','الزوجان'],a:2,w:'كأولاد البنات والخالات والعمات. لا يرثون إلا عند عدم أصحاب الفروض والعصبات (في القانون الجزائري).'}]},

/* ===== القسم الثاني: الفروض والحجب والتعصيب ===== */
{g:'القسم الثاني: الفروض والحجب والتعصيب',t:'أصحاب الفروض وحالاتهم',s:'حالات كل وارث بالفرض',
 b:`<table class="tb"><thead><tr><th>الوارث</th><th>حالاته</th></tr></thead><tbody>
 <tr><td><b>الزوج</b></td><td>1/2 بلا فرع وارث للزوجة (منه أو من غيره). 1/4 مع الفرع الوارث.</td></tr>
 <tr><td><b>الزوجة</b></td><td>1/4 بلا فرع وارث للزوج. 1/8 مع الفرع الوارث. وتشترك الزوجات في الفرض.</td></tr>
 <tr><td><b>الأب</b></td><td>1/6 فرضاً مع الفرع الوارث المذكر. 1/6 + الباقي تعصيباً مع الفرع المؤنث. تعصيباً فقط عند عدم الفرع الوارث.</td></tr>
 <tr><td><b>الأم</b></td><td>1/6 مع الفرع الوارث أو جمع من الإخوة. 1/3 عند عدمهما. وفي العمريتين ثلث الباقي.</td></tr>
 <tr><td><b>الجد الصحيح</b></td><td>1/6 مع الفرع المذكر. 1/6 + الباقي مع الفرع المؤنث. تعصيب عند عدم الفرع (وله أحكام مع الإخوة). يُحجب بالأب وبالجد الأقرب.</td></tr>
 <tr><td><b>الجدة</b></td><td>1/6 للواحدة أو أكثر بالتساوي. تُحجب بالأم، والقريبة من جهة الأم تحجب البعيدة، والأب والجد يحجبان أمهما.</td></tr>
 <tr><td><b>الإخوة لأم</b></td><td>1/6 للواحد، 1/3 للاثنين فأكثر بالتساوي (للذكر مثل الأنثى). يُحجبون بالفرع الوارث مطلقاً وبالأصل المذكر.</td></tr>
 <tr><td><b>البنت</b></td><td>1/2 للواحدة. 2/3 للاثنتين فأكثر. تعصيب بالغير مع الابن.</td></tr>
 <tr><td><b>بنت الابن</b></td><td>1/2 للواحدة، 2/3 للمتعددات، 1/6 تكملة الثلثين مع بنت صلبية واحدة. تعصّب بابن الابن. تُحجب بالابن أو بابن الابن الأعلى منها.</td></tr>
 <tr><td><b>الأخت الشقيقة</b></td><td>1/2 للواحدة، 2/3 للمتعددات، تعصيب بالغير مع الأخ الشقيق، وتعصيب مع الغير مع البنت أو بنت الابن. تُحجب بالأب وبالابن وابن الابن.</td></tr>
 <tr><td><b>الأخت لأب</b></td><td>مثل الشقيقة عند فقدها، و1/6 تكملة الثلثين مع شقيقة واحدة. تُحجب بالشقيقتين المستغرقتين للثلثين ما لم يعصّبها أخ لأب.</td></tr></tbody></table>
 <div class="note"><b>الفرع الوارث:</b> الأبناء والبنات وأبناء الابن وبناته وإن نزلوا. وجوده ينقل الزوج من النصف إلى الربع، والزوجة من الربع إلى الثمن، والأم من الثلث إلى السدس.</div>`,
 e:[
 {t:'calc',h:{wives:1,sons:1},m:'A'},
 {t:'calc',h:{husband:1,mother:1,fb:1},m:'A',base:1},
 {t:'mcq',q:'توفي رجل عن زوجة وبنت وأب وأم. كم نصيب الزوجة؟',o:['1/4','1/8','1/6','1/3'],a:1,w:'وُجد فرع وارث (البنت) فتنزل الزوجة من الربع إلى الثمن.'},
 {t:'calc',h:{husband:1,daughters:1},m:'A'},
 {t:'calc',h:{daughters:1,gdaughters:1,fb:1},m:'A',note:'بنت وبنت ابن وأخ شقيق: لاحظ السدس تكملة الثلثين.'}]},

{t:'الحجب',s:'من يمنع من؟ حجب الحرمان وحجب النقصان',
 b:`<p><b>الحجب</b> أن يمنع وارثٌ وارثاً آخر من الميراث كله (<b>حجب حرمان</b>) أو من بعضه (<b>حجب نقصان</b>). ولا يُحجب حجب حرمان من أصحاب الفروض: الزوجان، والأبوان، والبنت الصلبية (فهؤلاء لا يسقطون أبداً).</p>
 <ul><li>الابن يحجب ابن الابن، ويحجب الإخوة كلهم.</li><li>الأب يحجب الجد، ويحجب الإخوة كلهم.</li><li>الابن والأب (والجد) يحجبون الإخوة لأم، والفرع الوارث مطلقاً يحجبهم.</li><li>الأم تحجب كل الجدات، والجدة القريبة تحجب البعيدة، والأب يحجب أم الأب.</li><li>الفرع الوارث ينقص نصيب الزوجين والأم (نقصان).</li><li>البنتان الصلبيتان تحجبان بنات الابن إلا إذا كان معهن ابن ابن يعصّبهن (حجب استغراق للثلثين).</li><li>الشقيقتان تحجبان الأخوات لأب إلا إذا كان معهن أخ لأب.</li></ul>
 <div class="note">الأشخاص الذين يُدلون إلى الميت بواسطة وارث يُحجبون بتلك الواسطة غالباً: فابن الابن يرث بواسطة الابن، فإذا وُجد الابن حجبه. واستثناء: الإخوة لأم يرثون مع أمهم.</div>`,
 e:[
 {t:'calc',h:{sons:1,gsons:1,father:1},m:'A'},
 {t:'calc',h:{father:1,fb:2,mb:1},m:'A',note:'لاحظ أن الإخوة محجوبون بالأب وأن الأم هنا لا تأخذ الثلث الكامل لوجود جمع من الإخوة.'},
 {t:'calc',h:{fs:2,ps:1,mother:1},m:'A',note:'الشقيقتان استغرقتا الثلثين فحُجبت الأخت لأب (حجب استغراق).'},
 {t:'mcq',q:'من يحجب الجدة أم الأم؟',o:['الأب','الأم','الأخ','الزوج'],a:1,w:'الأم تحجب الجدات كلهنّ. أما الأب فيحجب أم الأب فقط.'},
 {t:'mcq',q:'الأخ لأم يسقط بوجود:',o:['الأخ الشقيق','الجد (أبو الأب)','الجدة','الزوج'],a:1,w:'الإخوة لأم يسقطون بالفرع الوارث والأب والجد (عند المالكية).'},
 {t:'mcq',q:'أي هؤلاء لا يُحجبون حجب حرمان أبداً؟',o:['الجد','الأخ لأب','الزوجان والأبوان والبنت الصلبية','بنت الابن'],a:2,w:'الزوجان والأبوان والولد الصلبي لا يسقطون، وقد ينقص نصيبهم فقط.'}]},

{t:'التعصيب',s:'بالنفس، بالغير، ومع الغير',
 b:`<p><b>العاصب</b> من لا فريضة مسمّاة له، فيأخذ ما بقي بعد أصحاب الفروض، أو المال كله إذا انفرد. دليله: «ألحقوا الفرائض بأهلها فما بقي فلأولى رجل ذكر».</p>
 <h3>1) العصبة بالنفس</h3>
 <p>كل ذكر لا يتوسّط في نسبه إلى الميت أنثى. ومرتبتهم: <b>البنوّة، ثم الأبوّة، ثم الأخوّة، ثم العمومة</b>، ويُقدَّم الأقرب فالأقرب:</p>
 <p>الابن، ابن الابن وإن نزل، الأب، الجد الصحيح وإن علا، الأخ الشقيق، الأخ لأب، بنو الإخوة، العم الشقيق، العم لأب، بنوهم، ثم المعتِق.</p>
 <h3>2) العصبة بالغير</h3>
 <p>إناث يصرن عصبة بوجود ذكر مماثل لهن في الجهة والدرجة، بشرط أن يأخذ الذكر ضعف الأنثى: البنت مع الابن، بنت الابن مع ابن الابن، الأخت الشقيقة مع الأخ الشقيق، الأخت لأب مع الأخ لأب.</p>
 <h3>3) العصبة مع الغير</h3>
 <p>الأخت الشقيقة أو لأب مع البنت أو بنت الابن، فتصير عصبة لأن البنت أخذت فرضها، وهي أولى بالباقي (حديث ابن مسعود).</p>
 <h3>تلخيص حالات الإرث</h3>
 <ul><li><b>يرثون بالفرض فقط (7):</b> الزوج، الأخ لأم، الزوجة، الأم، الأخت لأم، الجدة أم الأم، الجدة أم الأب.</li><li><b>يرثون بالتعصيب فقط (11 رجلاً):</b> الابن، ابن الابن، الأخ الشقيق، ابن الأخ الشقيق، الأخ لأب، ابن الأخ لأب، العم الشقيق، ابن العم الشقيق، العم لأب، ابن العم لأب، والمعتِق.</li><li><b>الأب والجد:</b> أحياناً بالفرض وأحياناً بالتعصيب، وفي حالة ثالثة يجمعان بينهما (مع الفرع المؤنث).</li><li><b>أربع نساء:</b> البنت، وبنت الابن، والأخت الشقيقة، والأخت لأب، أحياناً بالفرض وأحياناً بالتعصيب، ولا يجمعن بينهما أبداً.</li></ul>`,
 e:[
 {t:'calc',h:{sons:2,daughters:1},m:'A'},
 {t:'calc',h:{daughters:1,fs:1},m:'A',note:'الأخت الشقيقة هنا عاصبة مع الغير (مع البنت).'},
 {t:'calc',h:{fb:1,fs:1,mother:1},m:'A'},
 {t:'mcq',q:'بنتان وأخ شقيق. ما نصيب الأخ؟',o:['النصف','الثلث','لا شيء','الربع'],a:1,w:'للبنتين الثلثان فرضاً، والباقي وهو الثلث للأخ الشقيق تعصيباً.'},
 {t:'mcq',q:'من الذي يجمع بين الفرض والتعصيب في حالة واحدة؟',o:['الابن','البنت','الأب مع الفرع المؤنث','الأم'],a:2,w:'الأب مع البنت: له السدس فرضاً، ثم يأخذ الباقي تعصيباً.'},
 {t:'mcq',q:'القاعدة في العاصب بالنفس:',o:['كل أنثى ترث','كل ذكر لا يتوسط في نسبه إلى الميت أنثى','كل قريب ذكراً كان أو أنثى','كل من لا فرض له'],a:1,w:'فابن البنت ليس عاصباً لأنه يتوسط بينه وبين الميت أنثى.'}]},

/* ===== القسم الثالث: الحساب والمسائل الخاصة ===== */
{g:'القسم الثالث: الحساب والمسائل الخاصة',t:'أصل المسألة والعول',s:'السهام والمضاعف المشترك الأصغر',
 b:`<p><b>أصل المسألة</b> هو أصغر عدد صحيح يخرج منه نصيب كل وارث عدداً صحيحاً من السهام. نحسبه من مقامات الفروض (المضاعف المشترك الأصغر).</p>
 <p>الأصول سبعة: <b>2، 3، 4، 6، 8، 12، 24</b>. والتي تعول منها: 6 (إلى 7 و8 و9 و10)، و12 (إلى 13 و15 و17)، و24 (إلى 27 فقط).</p>
 <p>مثال: زوج وأم وابن. للزوج 1/4 وللأم 1/6، وللابن الباقي. المقامان 4 و6 ← أصل المسألة 12. للزوج 3 سهام، وللأم 2، وللابن 7.</p>
 <p><b>العول:</b> إذا زادت الفروض على الواحد (مثلاً 3/6 + 4/6 + 1/6 = 8/6) جُعل أصل المسألة هو مجموع السهام (8) ودخل النقص على الجميع بنسبة سهامهم.</p>
 <div class="note">أصل المسألة هو الذي نقيس به السهام، وليس هو العدد الذي نكتب به الكسر دائماً. كلاهما يصل إلى النتيجة نفسها.</div>`,
 e:[
 {t:'calc',h:{husband:1,mother:1,sons:1},m:'A',base:1},
 {t:'calc',h:{husband:1,fs:2,mother:1},m:'A',base:1,note:'مسألة عائلة: الفروض 3/6 + 4/6 + 1/6.'},
 {t:'calc',h:{wives:1,daughters:2,father:1,mother:1},m:'A',base:1,note:'المنبرية: عالت من 24 إلى 27.'},
 {t:'mcq',q:'متى تعول المسألة؟',o:['إذا نقصت الفروض عن الواحد','إذا زادت الفروض على الواحد','إذا وُجد عاصب','إذا لم يوجد وارث'],a:1,w:'العول يكون عند زيادة مجموع الفروض على الواحد الصحيح.'},
 {t:'mcq',q:'الأصل الذي يعول إلى 27 هو:',o:['6','12','24','8'],a:2,w:'الأصل 24 لا يعول إلا إلى 27 (المنبرية).'}]},

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
 b:`<ul><li><b>العمريتان:</b> زوج أو زوجة مع الأبوين. تأخذ الأم <b>ثلث الباقي</b> بعد فرض الزوج/الزوجة، لا ثلث التركة كلها، حتى لا تأخذ الأم أكثر من ضعف الأب.</li>
 <li><b>الأكدرية:</b> زوج وأم وجد وأخت. تعول المسألة من 6 إلى 9 ثم يقتسم الجد والأخت نصيبيهما للذكر مثل حظ الأنثيين فتصحّ من 27.</li>
 <li><b>المشتركة:</b> زوج وأم وإخوة لأم وأخ شقيق. استغرقت الفروض التركة، فعند المالكية يُشرَّك الأخ الشقيق مع الإخوة لأم في ثلثهم.</li></ul>`,
 e:[
 {t:'calc',h:{husband:1,father:1,mother:1},m:'A'},
 {t:'calc',h:{wives:1,father:1,mother:1},m:'A'},
 {t:'calc',h:{husband:1,mother:1,gf:1,fs:1},m:'A',base:1},
 {t:'calc',h:{husband:1,mother:1,mb:2,fb:1},m:'A'},
 {t:'mcq',q:'في العمرية الأولى (زوج وأبوان)، تأخذ الأم:',o:['ثلث التركة','سدس التركة','ثلث الباقي بعد فرض الزوج','نصف الباقي'],a:2,w:'ثلث الباقي، فيكون للزوج 1/2 وللأم 1/6 وللأب 1/3.'}]},

/* ===== القسم الرابع: القانون الجزائري ===== */
/* ===== القسم الرابع: الحمل والمفقود والخنثى ===== */
{g:'القسم الرابع: الحمل والمفقود والخنثى والمناسخات',t:'ميراث الحمل',s:'شروطه، وما يُوقف له، وكيف تُقسَّم التركة قبل ولادته',
 b:`<p><b>الحمل</b> هو ما في بطن المرأة من ولد. وهو وارث بإجماع الفقهاء إذا تحقق شرطان:</p>
 <ol><li><b>وجوده في البطن عند موت المورِّث:</b> بأن تلده لأقصى مدة الحمل فأقل من يوم الموت (أقل مدة الحمل ستة أشهر). وقد اختلفوا في أقصاها: المشهور عند المالكية <b>خمس سنين</b>، وقال ابن عبد الحكم من المالكية سنة، وحدّدها <b>قانون الأسرة الجزائري بعشرة أشهر</b> (المادة 42).</li>
 <li><b>انفصاله حياً حياة مستقرة:</b> ويُعرف بالاستهلال (الصراخ) أو العطاس أو البكاء أو الرضاع أو حركة بيّنة. فإن وُلد ميتاً فلا ميراث له وكأنه لم يكن.</li></ol>
 <h3>كيف نقسم قبل الولادة؟</h3>
 <ol><li>إن أمكن الانتظار حتى تضع الحامل فهو الأولى.</li>
 <li>إن طلب الورثة القسمة: يُنظر في أحوال الحمل (ذكر أو أنثى أو أكثر، أو يُولد ميتاً)، ويُعامل الورثة <b>الموجودون بالأضرّ</b> لهم، فيُعطى كل واحد <b>اليقين</b> (أقل نصيبيه في الاحتمالات)، ويُوقف الباقي للحمل.</li>
 <li>من لا يتأثر بالحمل (كالجدة) يأخذ نصيبه كاملاً. ومن لا يرث إلا في بعض الاحتمالات لا يُعطى شيئاً.</li>
 <li>بعد الولادة يأخذ الحمل نصيبه، وما بقي من الموقوف يرجع لمستحقه. وإن نقص الموقوف (ولد أكثر مما قدّرنا) رجع على الورثة بما ينقص.</li></ol>
 <div class="note"><b>القدر الذي يُوقف:</b> اختلف الفقهاء: فالمنقول عن مالك (كأبي حنيفة في رواية) توقيف أكثر النصيبين لعدد من البنين أو البنات، وعند غيرهم نصيب ذكرين أو أنثيين، وعند أبي يوسف ذكر واحد أو أنثى واحدة مع أخذ كفيل. والمعتمد في الكتب التطبيقية الاحتياط بأكثر الأضرّ. ويُرجع في التفصيل إلى ما قرّره الأستاذ في المحاضرة.</div>
 <h3>مثال محلول</h3>
 <p>توفي عن <b>زوجة حامل</b> (الحمل منه) وأب وأم. لو وُلد الحمل حياً فللزوجة 1/8 وللأم 1/6 وللأب 1/6. ولو وُلد ميتاً فللزوجة 1/4 وللأم 1/4 وللأب 1/2. فيُعطى كل منهم أقل النصيبين: الزوجة 1/8 (3/24)، والأم 1/6 (4/24)، والأب 1/6 (4/24). ويُوقف الباقي وهو 13/24 للحمل. فإن وُلد ابناً أخذ 13/24 كاملة.</p>`,
 e:[
 {t:'calc',h:{wives:1,father:1,mother:1,sons:1},m:'A',note:'هذا الحل إن وُلد الحمل ابناً حياً. قارن نصيب الزوجة بما تأخذه إن وُلد ميتاً.'},
 {t:'calc',h:{wives:1,father:1,mother:1},m:'A',note:'هذا الحل إن وُلد الحمل ميتاً (العمرية الثانية): لكل من الزوجة والأم 1/4.'},
 {t:'mcq',q:'في المثال، كم يُعطى للزوجة ابتداءً (قبل الولادة)؟',o:['1/4','1/8','1/6','1/3'],a:1,w:'تُعطى اليقين: أقل النصيبين، وهو 1/8 (إن وُلد الحمل حياً)، لأنها لو أُعطيت 1/4 ثم وُلد حياً لزاد عليها.'},
 {t:'mcq',q:'ولد الحمل ميتاً. ما حكمه في الميراث؟',o:['يرث ثم يُورَّث عنه','لا يرث ويُعدّ كأن لم يكن','يرث نصف نصيبه','يرث إن ولد قبل 6 أشهر'],a:1,w:'من شروط إرث الحمل أن ينفصل حياً حياة مستقرة، فإن وُلد ميتاً فلا ميراث له.'},
 {t:'mcq',q:'من الوارث الذي لا يتأثر نصيبه بالحمل فيُعطى نصيبه كاملاً؟',o:['الزوجة','الأم','الجدة','الأب'],a:2,w:'الجدة تأخذ السدس سواء وُجد الحمل أم لا (إن لم تُحجب)، بينما تتغير أنصبة الزوج والزوجة والأبوين بوجود الولد.'},
 {t:'mcq',q:'أقصى مدة للحمل في قانون الأسرة الجزائري:',o:['ستة أشهر','تسعة أشهر','عشرة أشهر','أربع سنين'],a:2,w:'المادة 42: أقل مدة الحمل ستة أشهر وأقصاها عشرة أشهر.'}]},

{t:'ميراث المفقود',s:'مدة الانتظار، وما يُعطاه الورثة وما يُوقف',
 b:`<p><b>المفقود:</b> من غاب فخفي خبره ولم تُعلم حياته ولا موته. وله حالتان في الميراث:</p>
 <h3>أولاً: المفقود وارثاً (يموت قريبه وهو مفقود)</h3>
 <ul><li>نحلّ <b>مسألتين</b>: الأولى نفرضه حياً، والثانية نفرضه ميتاً.</li><li>يُعطى كل وارث موجود <b>الأقل</b> من نصيبيه (الأضرّ به).</li><li>يُوقف الباقي (نصيب المفقود لو كان حياً) إلى أن يتبيّن أمره.</li><li>إن ظهر حياً أخذ ما وُقف له. وإن حكم القاضي بموته رُدّ الموقوف إلى الورثة، كل بحسب نصيبه الأوفر في حالة موت المفقود.</li></ul>
 <h3>ثانياً: المفقود مورِّثاً (يُقسَّم ماله)</h3>
 <p>لا يُقسَّم ماله على ورثته ما دام حكمه الحياة. فإذا حكم القاضي بموته قُسّم ماله بين <b>ورثته الأحياء وقت صدور الحكم</b>، ومن مات منهم قبل الحكم لا يرثه.</p>
 <h3>مدة الانتظار عند المالكية</h3>
 <ul><li><b>إن كان الغالب عليه السلامة</b> (كسفر تجارة أو طلب علم): ينتظر به بلوغ <b>سبعين سنة</b> من يوم ولادته على المشهور (وقيل ثمانين أو تسعين، وللقاضي الاجتهاد).</li><li><b>إن كان الغالب عليه الهلاك</b> (كالمعركة أو غرق السفينة أو الجائحة): ينتظر به مدة تقدّرها الأحكام، وعند المالكية سنة بعد انفصال الصفّين في القتال.</li><li><b>في قانون الأسرة الجزائري (المادة 109):</b> يجوز الحكم بموت المفقود في الحرب أو الحالات الاستثنائية بعد أربع سنوات من التحري، وفي الحالات التي تغلب فيها السلامة يُفوَّض تقدير المدة للقاضي بعد مرور أربع سنوات من فقده.</li></ul>
 <h3>مثال محلول</h3>
 <p>توفي عن زوجة وأم وابنين، أحدهما <b>مفقود</b>.<br>إن كان حياً: للزوجة 1/8، وللأم 1/6، ولكل ابن 17/48.<br>إن كان ميتاً: للزوجة 1/8، وللأم 1/6، وللابن الحاضر 17/24.<br>فيُعطى الحاضر <b>17/48</b> (الأقل)، ويُوقف 17/48 للمفقود. فإن ظهر حياً أخذه، وإن حُكم بموته أخذه الابن الحاضر ليصير له 17/24.</p>`,
 e:[
 {t:'calc',h:{wives:1,mother:1,sons:2},m:'A',note:'هذه الحالة التي يكون فيها المفقود حياً (ابنان). نصيب الابنين معاً 17/24.'},
 {t:'calc',h:{wives:1,mother:1,sons:1},m:'A',note:'وهذه الحالة التي يُفرض فيها المفقود ميتاً (ابن واحد).'},
 {t:'mcq',q:'في المثال: ما الذي يُعطاه الابن الحاضر ابتداءً؟',o:['17/24','17/48','1/2','7/24'],a:1,w:'يُعطى الأقل: 17/48 إن كان المفقود حياً، ويُوقف الباقي. ولو أُعطي 17/24 ثم ظهر المفقود حياً لزاد عليه.'},
 {t:'mcq',q:'مات رجل وله مال، وابنه مفقود. متى يُقسَّم مال هذا المفقود على ورثته؟',o:['فوراً','بعد سنة دائماً','بعد حكم القاضي بموته','بعد وفاة أبيه'],a:2,w:'لا يُقسَّم ماله ما دام محكوماً بحياته، فإذا حكم القاضي بموته قُسِّم على ورثته الأحياء وقت الحكم.'},
 {t:'mcq',q:'المفقود الذي كان غالب أمره السلامة، تُنتظر به عند المالكية على المشهور حتى:',o:['سنتين','أربع سنوات','سبعين سنة من ولادته','مئة وعشرين سنة'],a:2,w:'المشهور تعميره سبعين سنة، ثم يحكم القاضي بموته. وفي قانون الأسرة الجزائري يُترك التقدير للقاضي بعد مضي أربع سنوات.'},
 {t:'mcq',q:'كيف نعامل الورثة الموجودين عند وجود مفقود يؤثر في الميراث؟',o:['بأكثر النصيبين','بأقل النصيبين (الأضرّ بهم)','بالتساوي','لا يُعطون شيئاً'],a:1,w:'يُعطى كل وارث موجود اليقين (الأقل)، ويُوقف الباقي حتى يتبيّن أمر المفقود.'}]},

{t:'ميراث الخنثى',s:'الخنثى المشكل: المسألتان ونصف مجموع الحالين',
 b:`<p><b>الخنثى:</b> من له آلة الذكر وآلة الأنثى معاً، أو من ليس له شيء منهما. وهو قسمان:</p>
 <ul><li><b>غير مشكل:</b> تظهر علامة تميّزه (كالبول من آلة معينة، أو نبات اللحية أو الحيض) فيُلحق بالذكر أو بالأنثى.</li><li><b>مشكل:</b> لا يُعلم هل هو ذكر أو أنثى، وهو موضوع هذا الدرس.</li></ul>
 <p>ولا يكون الخنثى أباً ولا أماً ولا زوجاً ولا زوجة ولا جداً ولا جدة. وإنما يكون في جهات أربع: <b>البنوة، الأخوة، العمومة، الولاء</b>.</p>
 <h3>حكمه عند المالكية</h3>
 <p>يُعطى <b>نصف نصيب ذكر ونصف نصيب أنثى</b>، أي نصف مجموع النصيبين. أما باقي الورثة فيُعاملون بالطريقة نفسها، فلكل وارث نصف مجموع نصيبيه في الحالين. (وعند الحنفية يُعطى الأقل، وعند الشافعية اليقين مع وقف الباقي.)</p>
 <h3>طريقة الحل</h3>
 <ol><li>مسألة أولى نفرضه فيها <b>ذكراً</b> ونحدّد نصيب كل وارث.</li><li>مسألة ثانية نفرضه فيها <b>أنثى</b> ونحدّد نصيب كل وارث.</li><li>نجمع نصيبي كل وارث (ومنهم الخنثى) ونقسم على اثنين.</li></ol>
 <h3>مثال محلول (1)</h3>
 <p>ابن وولد خنثى. إن كان ذكراً: لكل منهما 1/2. إن كان أنثى: للابن 2/3 وللأنثى 1/3. فللابن (1/2 + 2/3) ÷ 2 = <b>7/12</b>، وللخنثى (1/2 + 1/3) ÷ 2 = <b>5/12</b>.</p>
 <h3>مثال محلول (2)</h3>
 <p>زوج وأم وشقيق خنثى. إن كان أخاً: الزوج 1/2، الأم 1/3، الأخ 1/6. إن كان أختاً: عالت المسألة إلى 8، فالزوج 3/8، الأم 1/4، الأخت 3/8. فالزوج (1/2 + 3/8) ÷ 2 = <b>7/16</b>، والأم (1/3 + 1/4) ÷ 2 = <b>7/24</b>، والخنثى (1/6 + 3/8) ÷ 2 = <b>13/48</b>. ومجموعها 21/48 + 14/48 + 13/48 = 1.</p>
 <div class="note">اقتراح تطبيقي: شغّل الحاسبة مرتين (مرة بأخ شقيق ومرة بأخت شقيقة) ثم اجمع النصيبين لكل وارث وقسّمه على اثنين.</div>`,
 e:[
 {t:'calc',h:{husband:1,mother:1,fb:1},m:'A',note:'المسألة الأولى: الخنثى ذكر (أخ شقيق).'},
 {t:'calc',h:{husband:1,mother:1,fs:1},m:'A',note:'المسألة الثانية: الخنثى أنثى (أخت شقيقة). لاحظ العول.'},
 {t:'mcq',q:'في المثال الثاني (زوج وأم وشقيق خنثى)، ما نصيب الزوج عند المالكية؟',o:['1/2','3/8','7/16','7/24'],a:2,w:'(1/2 + 3/8) ÷ 2 = 7/16.'},
 {t:'mcq',q:'ابن وخنثى ولد. ما نصيب الخنثى؟',o:['1/2','1/3','5/12','7/12'],a:2,w:'(1/2 + 1/3) ÷ 2 = 5/12.'},
 {t:'mcq',q:'أي هؤلاء لا يمكن أن يكون خنثى؟',o:['الأخ الشقيق','الولد','الزوج','العم'],a:2,w:'الخنثى لا يكون أباً ولا أماً ولا زوجاً ولا زوجة ولا جداً ولا جدة، فجهاته البنوة والأخوة والعمومة والولاء.'},
 {t:'mcq',q:'الحكم المالكي في الخنثى المشكل:',o:['يُعطى نصيب ذكر','يُعطى نصيب أنثى','يُعطى نصف نصيب ذكر ونصف نصيب أنثى','لا يرث'],a:2,w:'يُعطى نصف نصيب ذكر ونصف نصيب أنثى، أي نصف مجموع النصيبين.'}]},

{t:'حل المناسخات',s:'موت وارث أو أكثر قبل قسمة التركة',
 b:`<p><b>المناسخات</b> جمع مناسخة، من النسخ بمعنى النقل والتحويل. واصطلاحاً: أن يموت شخص ولا تُقسَّم تركته حتى يموت وارث أو أكثر من ورثته، فتنتقل حصصهم إلى ورثتهم. فيكون عندنا <b>ميت أول</b> ومسألة أولى، و<b>ميت ثانٍ</b> ومسألة ثانية.</p>
 <p>والغاية: معرفة نصيب كل وارث حيّ من التركتين معاً في قسمة واحدة، تجنّباً لقسمتين متتاليتين.</p>
 <h3>الأحوال الثلاثة</h3>
 <ol><li><b>أن يكون ورثة الميت الثاني هم الأحياء من ورثة الأول بالنسبة نفسها:</b> فلا عمل، نقسم التركة على الأحياء كأن الميت الثاني لم يكن. مثال: مات عن ثلاثة أبناء ثم مات أحدهم عن أخويه فقط: فتُقسَّم التركة على الأخوين الباقيين، لكل منهما النصف.</li>
 <li><b>أن تنقسم سهام الميت الثاني من المسألة الأولى على مسألته انقساماً صحيحاً:</b> تكون الجامعة هي <b>المسألة الأولى</b> نفسها، ويأخذ ورثة الثاني نصيبه بنسبة مسألتهم.</li>
 <li><b>ألا تنقسم</b> سهامه على مسألته: فننظر بين سهامه ومسألته الثانية:
 <ul><li><b>التوافق</b> (يشتركان في عامل مشترك أكبر غير 1): نضرب <b>وفق</b> المسألة الثانية في المسألة الأولى.</li><li><b>التباين</b> (لا عامل مشترك غير 1): نضرب <b>كل</b> المسألة الثانية في المسألة الأولى.</li></ul></li></ol>
 <h3>خطوات الحل</h3>
 <ol><li>صحّح المسألة الأولى وعيّن سهام كل وارث.</li><li>صحّح مسألة الميت الثاني وحدّد سهام ورثته.</li><li>قارن بين سهام الميت الثاني من الأولى ومسألته الثانية (انقسام أو توافق أو تباين).</li><li>حدّد <b>الجامعة</b>.</li><li>اضرب سهام ورثة الأولى (غير الميت الثاني) في <b>جزء السهم</b> (وفق الثانية أو كلها)، واضرب سهام ورثة الثانية في <b>سهام الميت الثاني مقسومة على القاسم المشترك</b>.</li><li>اجمع نصيب من ورث من المسألتين، وتحقق أن المجموع يساوي الجامعة.</li></ol>
 <h3>مثال محلول</h3>
 <p>مات رجل عن <b>زوجة وابن وبنت</b>، ثم مات الابن قبل القسمة عن <b>زوجة وأم (هي زوجة الميت الأول) وابن</b>.</p>
 <p><b>المسألة الأولى:</b> أصلها 24: للزوجة 3، وللابن 14، وللبنت 7.</p>
 <p><b>المسألة الثانية (الابن):</b> أصلها 24: لزوجته 3 (1/8)، ولأمه 4 (1/6)، ولابنه 17.</p>
 <p>سهام الميت الثاني 14 ومسألته 24: يوافق بينهما بالنصف (القاسم المشترك 2). وفق الثانية = 12، فالجامعة = 24 × 12 = <b>288</b>.</p>
 <ul><li>الزوجة الأولى (أم الميت الثاني): 3 × 12 + 4 × 7 = 36 + 28 = <b>64</b>.</li><li>البنت: 7 × 12 = <b>84</b>.</li><li>زوجة الابن: 3 × 7 = <b>21</b>.</li><li>ابن الابن: 17 × 7 = <b>119</b>.</li></ul>
 <p>المجموع: 64 + 84 + 21 + 119 = 288 ✓.</p>
 <div class="note">طريقة التحقق بالكسور: نصيب الزوجة الأولى = 1/8 + (14/24 × 1/6) = 18/144 + 14/144 = 32/144 = 2/9، وهو يساوي 64/288.</div>`,
 e:[
 {t:'calc',h:{wives:1,sons:1,daughters:1},m:'A',base:1,note:'المسألة الأولى في المثال: أصلها 24.'},
 {t:'calc',h:{wives:1,mother:1,sons:1},m:'A',base:1,note:'المسألة الثانية في المثال (الميت الثاني).'},
 {t:'mcq',q:'في المثال، العلاقة بين سهام الميت الثاني (14) ومسألته (24) هي:',o:['انقسام','توافق بالنصف','تباين','تماثل'],a:1,w:'العامل المشترك الأكبر بين 14 و24 هو 2، فهو توافق بالنصف، ووفق المسألة الثانية = 12.'},
 {t:'mcq',q:'جامعة المثال هي:',o:['24','48','288','336'],a:2,w:'الجامعة = المسألة الأولى × وفق الثانية = 24 × 12 = 288.'},
 {t:'mcq',q:'ما نصيب الزوجة الأولى من المسألتين معاً في المثال؟',o:['1/8','2/9','1/4','1/6'],a:1,w:'64/288 = 2/9، فقد أخذت 1/8 من الأولى و1/6 من حصة ابنها الميت.'},
 {t:'mcq',q:'سهام الميت الثاني 5 ومسألته الثانية 6. ما العلاقة وما العمل؟',o:['انقسام، فالجامعة هي الأولى','توافق، نضرب الوفق','تباين، نضرب كل المسألة الثانية في الأولى','لا عمل'],a:2,w:'5 و6 لا يشتركان في عامل غير 1، فهما متباينان، فنضرب 6 كاملة في المسألة الأولى.'},
 {t:'mcq',q:'مات رجل عن ثلاثة أبناء، ثم مات أحدهم عن أخويه فقط قبل القسمة. كم يأخذ كل من الأخوين من تركة الأب؟',o:['1/3','1/2','1/4','2/3'],a:1,w:'ورثة الثاني هم الأخوان الباقيان بالنسبة نفسها، فلا عمل: تُقسَّم التركة بينهما نصفين.'}]},

{g:'القسم الخامس: ما تفرّد به قانون الأسرة الجزائري',t:'الردّ وذوو الأرحام',s:'المادتان 167 و168',
 b:`<h3>الردّ</h3>
 <p>الردّ: إذا بقي شيء بعد الفروض ولا عاصب، فهل يُردّ على أصحاب الفروض؟</p>
 <ul><li><b>أصل المذهب المالكي:</b> لا ردّ، والباقي لبيت المال (المنتظم العادل).</li><li><b>المفتى به عند المتأخرين:</b> يُردّ على أصحاب الفروض غير الزوجين عند عدم انتظام بيت المال.</li><li><b>القانون الجزائري (المادة 167):</b> يُردّ على أصحاب الفروض غير الزوجين بنسبة فروضهم.</li></ul>
 <h3>ذوو الأرحام (المادة 168)</h3>
 <p>الأقارب الذين ليسوا أصحاب فروض ولا عصبة (كأولاد البنات والأخوال والخالات والعمات). عند عدم أصحاب الفروض والعصبة يرثون في القانون الجزائري <b>على طريقة أهل التنزيل</b>، بينما لا يرثون في أصل المذهب المالكي. وتُرتَّب طوائفهم في أربعة أصناف: الأول أولاد البنات وأولاد بنات الابن، ثم الثاني الأجداد والجدات الرحميون (كأبي الأم)، ثم الثالث أولاد الأخوات وبنات الإخوة، ثم الرابع العمات والأعمام لأم والأخوال والخالات؛ ولا ينتقل الحق إلى صنف إلا عند فقد الذي قبله.</p>
 <div class="note">جرّب حاسبة «الأرحام» في الموقع لترى توزيع هؤلاء خطوةً بخطوة.</div>`,
 e:[
 {t:'calc',h:{daughters:1,mother:1},m:'B',note:'صيغة المتأخرين: يُردّ الباقي.'},
 {t:'calc',h:{husband:1,daughters:1},m:'C',note:'في القانون الجزائري يُردّ على البنت دون الزوج.'},
 {t:'mcq',q:'في أصل المذهب المالكي إذا بقي شيء بعد الفروض ولا عاصب:',o:['يُردّ على أصحاب الفروض','يذهب لبيت المال','يُقسَّم على ذوي الأرحام','يُقسَّم بالتساوي'],a:1,w:'لا ردّ عند المالكية الأولين، والباقي لبيت المال.'},
 {t:'mcq',q:'من لا يُردّ عليه في القانون الجزائري (المادة 167)؟',o:['البنت','الأم','الزوج','الأخت الشقيقة'],a:2,w:'الردّ يكون على أصحاب الفروض غير الزوجين.'}]},

{t:'التنزيل (الوصية الواجبة)',s:'المواد 169 إلى 172',
 b:`<p>نصّت المادة 169 من قانون الأسرة: «من توفي وله أحفاد وقد مات مورِّثهم قبله أو معه وجب تنزيلهم منزلة أصلهم في التركة». ولاحظ:</p>
 <ul><li>التنزيل <b>بقوة القانون</b> (واجب)، لا يحتاج إلى وصية من الجد، فإن أوصى لهم فهي وصية اختيارية.</li><li>الأحفاد المستفيدون: أولاد الابن وأولاد البنت الذين مات أصلهم قبل الجد أو معه.</li></ul>
 <h3>الشروط</h3>
 <ul><li>أن يكون الحفيد <b>غير وارث</b> في تركة الجد (محجوباً أو من ذوي الأرحام)، فإن ورث ولو قليلاً فلا تنزيل.</li><li>ألا يكون الجد قد أعطاه بغير عوض بقدر ما يستحق.</li></ul>
 <h3>المقدار</h3>
 <ul><li>بقدر حصة أصلهم لو بقي حيّاً، على ألا يتجاوز <b>ثلث التركة</b>.</li><li>يُقسَّم بين الأحفاد: <b>للذكر مثل حظ الأنثيين</b>.</li><li>يُخرج من التركة <b>قبل</b> الوصية الاختيارية، ثم يقسّم الباقي على الورثة.</li></ul>
 <div class="note">مثال: ثلاثة أبناء وأب وأم، ومعهم بنت ابن مات أبوها قبل الجد. لو كان الابن الميت حياً لكانوا أربعة أبناء: لكل ابن 1/6. فتأخذ البنت المنزَّلة 1/6، ويقسم الباقي 5/6 على الورثة بنسبة أنصبتهم.</div>`,
 e:[
 {t:'mcq',q:'في المثال: ثلاثة أبناء وأب وأم وبنت ابن ميت. ما نصيب المنزَّلة؟',o:['1/3','1/4','1/6','1/8'],a:2,w:'لو بقي أبوها حياً لورث 1/6 (كل ابن من أربعة يرث ثلثي المال أي 1/6)، وهذا دون الثلث فتأخذه.'},
 {t:'mcq',q:'أقصى مقدار للتنزيل من التركة هو:',o:['النصف','الثلث','الربع','السدس'],a:1,w:'بقدر حصة أصلهم، على ألا يتجاوز ثلث التركة.'},
 {t:'mcq',q:'توفي عن بنت واحدة وبنت ابن (أبوها ميت قبله). هل تُنزَّل بنت الابن؟',o:['نعم دائماً','لا، لأنها ترث السدس تكملة الثلثين','نعم بالنصف','لا، لأنها أنثى'],a:1,w:'هي وارثة فعلاً (السدس تكملة الثلثين)، ومن ورث لا يُنزَّل.'},
 {t:'mcq',q:'يُقسَّم المنزَّل بين الأحفاد:',o:['بالتساوي','للذكر مثل حظ الأنثيين','للأكبر','حسب الحاجة'],a:1,w:'للذكر مثل حظ الأنثيين.'},
 {t:'mcq',q:'التنزيل في القانون الجزائري:',o:['اختياري يحتاج وصية','واجب بقوة القانون','خاص بأولاد البنات فقط','خاص بالذكور فقط'],a:1,w:'«وجب تنزيلهم»: يتم بقوة القانون دون حاجة إلى وصية.'}]},

{t:'التخارج',s:'خروج وارث من القسمة بمقابل',
 b:`<p><b>لغةً:</b> مشتق من «تخارج»، وهو البروز والنفاذ عن الشيء.</p>
 <p><b>اصطلاحاً:</b> تصالح الورثة على ترك بعضهم نصيبه من التركة لبعضهم الآخر مقابل شيء معلوم.</p>
 <h3>شرح التعريف</h3>
 <ul><li><b>«تصالح الورثة»:</b> اتفاق بالتراضي. ولا يُشترط وجود نزاع في الإرث.</li><li><b>«ترك بعضهم نصيبه لبعضهم»:</b> تنازل عن النصيب كالبيع أو الهبة، فلا يصح إلا من بالغ عاقل لأن فيه إسقاطاً للحق مقابل عوض.</li><li><b>«مقابل شيء معلوم»:</b> شرط جوهري، فلا بد أن يكون العوض معلوماً ومحدداً، من التركة أو من خارجها.</li></ul>
 <h3>أقسامه</h3>
 <p><b>باعتبار الأطراف:</b> تخارج البعض من الكل، وتخارج الكل من البعض، وتخارج البعض من البعض. <b>وباعتبار المقابل:</b> بعوض من التركة، أو بعوض من خارجها.</p>
 <p>وقد ذكر علي حيدر (درر الحكام): إن كانت التركة نقداً وبدل الصلح من <b>جنس آخر</b> صح الصلح قليلاً كان أو كثيراً بشرط التقابض في المجلس.</p>
 <div class="note">في الحساب: إن أخذ الخارج عوضاً من التركة نفسها قُسّم الباقي على من بقي بنسبة أنصبتهم الأصلية. وإن أخذ عوضاً من مال أحد الورثة حلّ هذا الوارث محله وأخذ نصيبه. استعمل تبويب «التخارج» في الموقع.</div>`,
 e:[
 {t:'mcq',q:'هل يشترط وجود نزاع بين الورثة لصحة التخارج؟',o:['نعم، لا يصح بدون نزاع','لا، يكفي التراضي','نعم أمام القاضي فقط','فقط بين الإخوة'],a:1,w:'التخارج لا يشترط فيه نزاع، وإنما يكفي التراضي.'},
 {t:'mcq',q:'الشرط الجوهري لصحة التخارج:',o:['أن يكون العوض معلوماً محدداً','أن يكون الخارج ذكراً','أن يخرج الأكبر','أن يكون العوض من التركة'],a:0,w:'لا بد أن يكون العوض معلوماً ومحدداً.'},
 {t:'mcq',q:'من يملك التخارج؟',o:['كل وارث ولو صغيراً','البالغ العاقل لأن فيه إسقاطاً للحق','الأب فقط','القاضي فقط'],a:1,w:'تنازل مالي كالبيع، لا يصح إلا من بالغ عاقل.'},
 {t:'mcq',q:'إن خرج وارث وأخذ مبلغاً من التركة نفسها، فإن الباقين يقتسمون الباقي:',o:['بالتساوي','بنسبة أنصبتهم الأصلية بعضها إلى بعض','للأكبر سناً','لبيت المال'],a:1,w:'يُقسَّم الباقي على الباقين بنسبة أنصبتهم الأصلية.'}]}
];

LESSONS.forEach(l=>l.e.forEach(x=>{if(x.t!=='mcq')return;const c=x.o[x.a];for(let i=x.o.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[x.o[i],x.o[j]]=[x.o[j],x.o[i]]}x.a=x.o.indexOf(c)}));
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
  let o=`<div class="card"><h2>الدروس التفاعلية</h2><p>${LESSONS.length} درساً قصيراً، في كل درس شرح وتمارين تصحَّح فوراً. حلّ التمارين بنفسك ثم قارن مع الحل المفصّل.</p>
  <div class="row"><span class="chip g">إجابات صحيحة: ${ok}</span><span class="chip">محاولات: ${tot}</span><button class="btn alt" id="lsReset" style="padding:4px 14px">تصفير التقدّم</button><button class="btn" id="chalBtn">تحدٍّ عشوائي</button></div></div>
  <div class="lgrid">${LESSONS.map((x,i)=>`${x.g?`<h3 class="lgh">${x.g}</h3>`:''}<button class="lcard" data-l="${i}"><span class="ln">${i+1}</span><b>${x.t}</b><span class="small">${x.s}</span><span class="bar2"><i style="width:${done(i)/x.e.length*100}%"></i></span><span class="small">${done(i)} من ${x.e.length} تمارين</span></button>`).join('')}</div>`;
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

/*EXTRAS*/
setGender();drawModes();drawHeirs();drawAr();
const raw0=(location.hash||'').slice(1),h0=raw0.split('?')[0];tab(TABS.includes(h0)?h0:'calc');if(h0==='calc'&&raw0.includes('?'))applyQ(raw0.split('?')[1]);window.__inited=1;
})();
