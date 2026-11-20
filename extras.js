// ---------- إضافات: مشاركة، نسخ، طباعة، شجرة، مخطط، مقارنة، خطوات، بحث، PWA ----------
const X={};
const sym=f=>f.str();
function stateHash(){
  const i=curInput();
  const h=E.KEYS.filter(k=>i[k]>0).map(k=>k+':'+i[k]).join(',');
  const e=($('#estate')||{}).value;
  return 'calc?h='+h+'&m='+mode+'&g='+gender+(e?'&e='+encodeURIComponent(e):'');
}
function shareUrl(){let b='';try{b=location.href.split('#')[0]}catch(e){}return b+'#'+stateHash()}
function applyQ(q){
  const p=new URLSearchParams(q);const h={};
  (p.get('h')||'').split(',').forEach(s=>{const [k,v]=s.split(':');if(E.KEYS.includes(k)&&+v>0)h[k]=Math.min(30,+v|0)});
  E.KEYS.forEach(k=>val[k]=0);Object.assign(val,h);
  gender=p.get('g')==='f'||h.husband?'f':'m';
  mode=['A','B','C'].includes(p.get('m'))?p.get('m'):'A';
  if(p.get('e'))$('#estate').value=p.get('e');
  document.querySelectorAll('#gender button').forEach(bb=>bb.classList.toggle('on',bb.dataset.g===gender));
  drawModes();drawHeirs();
  if(Object.keys(h).length)run(false);
}
function copyText(txt,msgEl,okMsg){
  const done=()=>{msgEl.textContent=okMsg};
  const fb=()=>{try{const ta=document.createElement('textarea');ta.value=txt;ta.style.cssText='position:fixed;opacity:0';document.body.appendChild(ta);ta.select();const ok=document.execCommand('copy');ta.remove();ok?done():manual()}catch(e){manual()}};
  const manual=()=>{msgEl.innerHTML='انسخ من هنا: <input readonly value="'+esc(txt.split('\n')[0])+'" style="width:100%;font:inherit;padding:6px" onclick="this.select()">'};
  if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(txt).then(done,fb);else fb();
}
function resultText(){
  const {r,net,mode:m}=last;const md=MODES.find(x=>x.id===m);
  let t='نتيجة المواريث — '+md.t+'\n';
  t+='الورثة: '+r.heirs.map(h=>h.label+(h.count>1?' ('+h.count+')':'')).join('، ')+'\n\n';
  r.heirs.forEach(h=>{t+=h.label+': '+h.share.str()+' ('+pct(h.share)+')'+(net!=null?' = '+fmtMoney(Number(h.share.n)*net/Number(h.share.d)):'')+'\n'});
  if(!r.bayt.isZero())t+=(m==='A'?'بيت المال: ':'الباقي: ')+r.bayt.str()+'\n';
  t+='\nأصل المسألة: '+r.base+(r.awl?' (عالت من '+r.awl.from+' إلى '+r.awl.to+')':'')+'\n';
  t+='حاسبة المواريث — جامعة البويرة — د. حدة سعدي';
  return t;
}

// ---- الشجرة ----
const TROWS=[['الأجداد',['gf','gm_p','gm_m','gm_pm','gm_mm']],['الأبوان',['father','mother']],['الميت والزوجان',['husband','__d','wives']],['الإخوة والأخوات',['fb','fs','pb','ps','mb','ms']],['الفروع',['sons','daughters']],['فروع الفروع',['gsons','gdaughters']],['العصبات الأبعد',['nfb','npb','ufb','upb','cfb','cpb','mawla']]];
function treeSvg(){
  const {r}=last;const inp=curInput();
  const W=360,bw=106,bh=50,gap=8,per=3;
  const hmap={};r.heirs.forEach(h=>hmap[h.key]=h);
  const bmap={};r.blocked.forEach(b=>bmap[b.key]=b);
  let y=6,out='',prevY=null;
  TROWS.forEach(([title,keys])=>{
    const ks=keys.filter(k=>k==='__d'||inp[k]>0);
    if(!ks.length||(ks.length===1&&ks[0]==='__d'&&false))return;
    if(title==='الميت والزوجان'&&ks.length===1){/* الميت وحده */}
    const lines=[];for(let i=0;i<ks.length;i+=per)lines.push(ks.slice(i,i+per));
    if(prevY!==null)out+=`<line x1="180" y1="${prevY}" x2="180" y2="${y+14}" stroke="#c9bf9f" stroke-width="2"/>`;
    out+=`<text x="${W-6}" y="${y+10}" text-anchor="start" font-size="10" fill="#8a826f" direction="rtl">${title}</text>`;
    y+=16;
    lines.forEach(line=>{
      const tw=line.length*bw+(line.length-1)*gap;let x=(W-tw)/2;
      // RTL: أول عنصر في اليمين
      line.slice().reverse().forEach(k=>{
        let fill='#eef4ef',st='#1f5a43',dash='',tc='#1f5a43',l1='',l2='';
        if(k==='__d'){fill='#1f5a43';tc='#fff';l1=gender==='m'?'المتوفى':'المتوفاة';l2=''}
        else{
          const nm=E.NAMES[k][inp[k]>1?1:0];
          if(hmap[k]){l1=hmap[k].label;l2=hmap[k].share.str()}
          else if(bmap[k]){fill='#f1ece0';st='#b9b19b';dash='stroke-dasharray="4 3"';tc='#7a7260';l1=nm;l2='محجوب'}
          else{fill='#f1ece0';st='#b9b19b';dash='stroke-dasharray="4 3"';tc='#7a7260';l1=nm;l2='لا يرث'}
        }
        const fs=l1.length>13?10.5:12.5;
        out+=`<g><rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="10" fill="${fill}" stroke="${st}" stroke-width="1.5" ${dash}/>
          <text x="${x+bw/2}" y="${y+(l2?20:30)}" text-anchor="middle" font-size="${fs}" font-weight="700" fill="${tc}" direction="rtl" style="font-family:Cairo,sans-serif">${esc(l1)}</text>
          ${l2?`<text x="${x+bw/2}" y="${y+39}" text-anchor="middle" font-size="13" font-weight="700" fill="${tc}" direction="ltr" style="font-family:Cairo,sans-serif">${esc(l2)}</text>`:''}</g>`;
        x+=bw+gap;
      });
      y+=bh+gap;
    });
    prevY=y-gap;y+=6;
  });
  return `<svg viewBox="0 0 ${W} ${y+4}" width="100%" role="img" aria-label="شجرة الورثة" style="max-width:480px;display:block;margin:0 auto">${out}</svg>
  <div class="legend" style="justify-content:center"><span><b style="background:#1f5a43"></b>المتوفى</span><span><b style="background:#eef4ef;border:1.5px solid #1f5a43"></b>وارث</span><span><b style="background:#f1ece0;border:1.5px dashed #b9b19b"></b>محجوب أو لا يرث</span></div>`;
}
function donutSvg(){
  const {r,mode:m,fac}=last;
  const parts=r.heirs.map((h,i)=>({l:h.label,f:h.share.num()*(fac?fac.num():1),c:COLORS[i%COLORS.length]}));
  if(!r.bayt.isZero())parts.push({l:m==='A'?'بيت المال':'الباقي',f:r.bayt.num()*(fac?fac.num():1),c:'#b9b19b'});
  if(fac)parts.push({l:'التنزيل',f:1-fac.num(),c:'#d4a64a'});
  const R=70,C=2*Math.PI*R;let off=0,o='';
  parts.forEach(p=>{const len=p.f*C;o+=`<circle r="${R}" cx="100" cy="100" fill="none" stroke="${p.c}" stroke-width="34" stroke-dasharray="${len} ${C-len}" stroke-dashoffset="${-off}" transform="rotate(-90 100 100)"><title>${esc(p.l)} ${(p.f*100).toFixed(1)}%</title></circle>`;off+=len});
  return `<svg viewBox="0 0 200 200" width="200" height="200" role="img" aria-label="مخطط دائري للأنصبة" style="display:block;margin:0 auto"><circle r="${R}" cx="100" cy="100" fill="none" stroke="#eee6d2" stroke-width="34"/>${o}<text x="100" y="97" text-anchor="middle" font-size="13" fill="#6b6455" style="font-family:Cairo,sans-serif">التركة</text><text x="100" y="118" text-anchor="middle" font-size="18" font-weight="700" fill="#1f5a43" style="font-family:Cairo,sans-serif">100%</text></svg>
  <div class="legend" style="justify-content:center">${parts.map(p=>`<span><b style="background:${p.c}"></b>${esc(p.l)} ${(p.f*100).toFixed(1).replace(/\.0$/,'')}%</span>`).join('')}</div>`;
}

// ---- المقارنة ----
function compareHtml(){
  const inp=curInput();
  const rs=['A','B','C'].map(id=>({id,r:E.solve(inp,id)}));
  const keys=[];rs.forEach(x=>x.r.heirs.forEach(h=>{if(!keys.includes(h.key))keys.push(h.key)}));
  const get=(x,k)=>{const h=x.r.heirs.find(q=>q.key===k);return h?h.share:null};
  const zero=E.fr(0,1);
  let o=`<div class="tbl"><table class="cmp"><tr><th>الوارث</th>${MODES.map(m=>`<th>${m.t}</th>`).join('')}</tr>`;
  const cell=(f,base)=>{const s=f?f.str():'0';const diff=base!==undefined&&((f?f.str():'0')!==(base?base.str():'0'));return `<td class="num frac${diff?' dif':''}">${f?F(f):'—'}<div class="small">${f?pct(f):''}</div></td>`};
  keys.forEach(k=>{const a=get(rs[0],k);o+=`<tr><td class="who"><b>${E.NAMES[k][inp[k]>1?1:0]}</b></td>${rs.map((x,i)=>cell(get(x,k),i?a:undefined)).join('')}</tr>`});
  const by=rs.map(x=>x.r.bayt);
  if(by.some(b=>!b.isZero()))o+=`<tr><td class="who"><b>الباقي / بيت المال</b></td>${by.map((b,i)=>cell(b.isZero()?null:b,i?by[0]:undefined)).join('')}</tr>`;
  o+=`</table></div><p class="small">الخانات الملوّنة تختلف عن الصيغة الأولى. الفرق الجوهري: الردّ على أصحاب الفروض، وأثره في بيت المال.</p>`;
  const errs=rs.filter(x=>x.r.errors.length).map(x=>x.r.errors[0]);
  if(errs.length)o+=`<div class="err">${errs.join('<br>')}</div>`;
  return o;
}

// ---- خطوة بخطوة ----
function stepsList(){
  const {r,mode:m,net}=last;const inp=curInput();
  const S=[];
  S.push(['الورثة الموجودون',`<p>الميت ${gender==='m'?'ذكر':'أنثى'}، وورثته الذين أدخلتَهم:</p><ul>${E.KEYS.filter(k=>inp[k]>0).map(k=>`<li>${E.NAMES[k][inp[k]>1?1:0]}${inp[k]>1?' ('+inp[k]+')':''}</li>`).join('')}</ul>`]);
  S.push(['من يُحجب؟',r.blocked.length?`<p>يُحجب هؤلاء فلا نصيب لهم:</p><ul>${r.blocked.map(b=>`<li><b>${E.NAMES[b.key][0]}</b>: ${esc(b.reason)}</li>`).join('')}</ul>`:'<p>لا يوجد محجوب بين من أدخلتَ، فكل وارث يستحق نصيبه.</p>']);
  const fard=r.heirs.filter(h=>h.kind.includes('فرض'));
  S.push(['أصحاب الفروض',fard.length?`<ul>${fard.map(h=>`<li><b>${h.label}</b>: <span dir="ltr">${h.share.str()}</span> — ${esc(h.why)}</li>`).join('')}</ul>`:'<p>لا صاحب فرض في هذه المسألة.</p>']);
  const ta=r.heirs.filter(h=>h.kind.includes('تعصيب'));
  S.push(['العصبة والباقي',ta.length?`<p>يأخذ العصبة ما بقي بعد الفروض:</p><ul>${ta.map(h=>`<li><b>${h.label}</b>: <span dir="ltr">${h.share.str()}</span> — ${esc(h.why)}</li>`).join('')}</ul>`:`<p>لا عاصب في المسألة. ${r.bayt.isZero()?'':'بقي <b dir="ltr">'+r.bayt.str()+'</b> '+(m==='A'?'لبيت المال.':'من التركة.')}</p>`]);
  S.push(['أصل المسألة',`<p>أصل المسألة: <b>${r.base}</b> سهماً.</p>${r.awl?`<p>مجموع الفروض زاد على الأصل، فعالت المسألة من ${r.awl.from} إلى ${r.awl.to} (العول)، فينقص كل نصيب بنسبة واحدة.</p>`:''}${r.radd?`<p>بقي من التركة جزء بعد الفروض ولا عاصب، فيُردّ على أصحاب الفروض غير الزوجين بنسبة فروضهم (حسب الصيغة المختارة).</p>`:''}${r.steps.length?`<ol class="steps">${r.steps.map(s=>`<li>${esc(s)}</li>`).join('')}</ol>`:''}`]);
  S.push(['النتيجة النهائية',`<div class="tbl"><table><tr><th>الوارث</th><th>النصيب</th><th>السهام من ${r.base}</th>${net!=null?'<th>المبلغ</th>':''}</tr>${r.heirs.map(h=>`<tr><td class="who"><b>${h.label}</b></td><td class="num frac">${F(h.share)}</td><td class="num">${h.units}</td>${net!=null?`<td class="num">${fmtMoney(Number(h.share.n)*net/Number(h.share.d))}</td>`:''}</tr>`).join('')}</table></div>`]);
  return S;
}
let stIdx=0;
function drawSteps(){
  const S=stepsList();stIdx=Math.max(0,Math.min(S.length-1,stIdx));
  const [t,b]=S[stIdx];
  $('#xtPane').innerHTML=`<div class="card"><h3 style="margin-top:0">الخطوة ${stIdx+1} من ${S.length}: ${t}</h3><div class="stdots">${S.map((_,i)=>`<i class="${i===stIdx?'on':i<stIdx?'dn':''}"></i>`).join('')}</div><div class="edu">${b}</div>
  <div class="row" style="justify-content:space-between;margin-top:10px"><button class="btn alt" data-x="sp" ${stIdx===0?'disabled':''}>→ السابق</button><button class="btn" data-x="sn" ${stIdx===S.length-1?'disabled':''}>التالي ←</button></div></div>`;
  stackify($('#xtPane'));
}

function extras(){
  if(!last)return;
  shareH=stateHash();
  try{history.replaceState(null,'','#'+shareH)}catch(e){}
  const out=$('#out');
  const md=MODES.find(x=>x.id===last.mode);
  const pre=`<div class="prt"><b>حاسبة المواريث — ${md.t}</b><br>جامعة البويرة · مقياس المواريث · السنة الثالثة شريعة · 2026/2027 · د. حدة سعدي<br>الورثة: ${last.r.heirs.map(h=>h.label+(h.count>1?' ('+h.count+')':'')).join('، ')}</div>`;
  const tb=`<div class="card xt noprint"><div class="row">
    <button class="btn" data-x="link">نسخ الرابط</button>
    <button class="btn alt" data-x="text">نسخ النتيجة</button>
    <button class="btn alt" data-x="print">طباعة / PDF</button>
    <button class="btn alt" data-x="cmp">قارن الأوضاع</button>
    <button class="btn alt" data-x="steps">حلّ خطوة بخطوة</button></div><div id="xtMsg" class="small" style="margin-top:6px"></div><div id="xtPane"></div></div>`;
  const viz=`<div class="card viz"><h2>المخطط والشجرة</h2><div class="vz2"><div>${donutSvg()}</div><div>${treeSvg()}</div></div></div>`;
  // نضع الشريط والمخطط بعد بطاقة النتيجة الأولى
  const first=out.querySelector('.card h2')?out.querySelector('.card h2').closest('.card'):null;
  const hold=document.createElement('div');hold.innerHTML=tb+viz;out.insertAdjacentHTML('afterbegin',pre);
  if(first&&first.parentNode===out){let ref=first.nextSibling;[...hold.children].forEach(el=>out.insertBefore(el,ref))}else out.prepend(...hold.children);
}
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-x]');if(!b||!last)return;
  const msg=$('#xtMsg');const x=b.dataset.x;
  if(x==='link')copyText(shareUrl(),msg,'تم نسخ الرابط. أي شخص يفتحه يرى نفس المسألة.');
  else if(x==='text')copyText(resultText(),msg,'تم نسخ النتيجة كنص.');
  else if(x==='print'){document.body.classList.add('po');const u=()=>{document.body.classList.remove('po');window.removeEventListener('afterprint',u)};window.addEventListener('afterprint',u);setTimeout(()=>{window.print();setTimeout(u,1500)},50)}
  else if(x==='cmp'){const p=$('#xtPane');if(p.dataset.m==='cmp'){p.innerHTML='';p.dataset.m=''}else{p.dataset.m='cmp';p.innerHTML=`<div class="card"><h3 style="margin-top:0">المقارنة بين الصيغ الثلاث</h3>${compareHtml()}</div>`;stackify(p)}}
  else if(x==='steps'){const p=$('#xtPane');if(p.dataset.m==='st'){p.innerHTML='';p.dataset.m=''}else{p.dataset.m='st';stIdx=0;drawSteps()}}
  else if(x==='sn'){stIdx++;drawSteps()}
  else if(x==='sp'){stIdx--;drawSteps()}
});

// ---- القاموس والبحث ----
const GLOSS=[
['الفرائض','جمع فريضة، وهي النصيب المقدَّر شرعاً. وعلم الفرائض يُعرف به من يرث ومن لا يرث ومقدار نصيب كل وارث.'],
['التركة','كل ما يتركه الميت من مال وحقوق مالية بعد وفاته.'],
['المورِّث','الميت الذي يُنتقل ماله إلى ورثته.'],
['الوارث','من استحق جزءاً من التركة بسبب قرابة أو زوجية أو ولاء، ولم يقم به مانع.'],
['الفرض','نصيب مقدَّر في الكتاب أو السنة: النصف والربع والثمن والثلثان والثلث والسدس.'],
['صاحب الفرض','الوارث الذي له نصيب مقدَّر، كالزوج والأم والبنت.'],
['العصبة','من يأخذ ما بقي بعد أصحاب الفروض، أو يأخذ التركة كلها إن لم يوجد صاحب فرض.'],
['التعصيب بالنفس','أن يكون الوارث عاصباً بذاته دون غيره، كالابن والأب والأخ الشقيق.'],
['التعصيب بالغير','أن تصير الأنثى عاصبة بسبب وجود أخيها، كالبنت مع الابن، للذكر مثل حظ الأنثيين.'],
['التعصيب مع الغير','أن تصير الأخت الشقيقة أو لأب عاصبة مع وجود البنت أو بنت الابن.'],
['الحجب','منع وارث من الميراث كلّه أو بعضه بسبب وجود وارث آخر.'],
['حجب الحرمان','منع الوارث من الميراث كلّه، كحجب الأخ بالابن.'],
['حجب النقصان','تقليص نصيب الوارث إلى نصيب أقل، كنقص الزوج من النصف إلى الربع بوجود الولد.'],
['أصل المسألة','أصغر عدد تخرج منه سهام الورثة صحيحة بلا كسر.'],
['العول','زيادة في أصل المسألة عندما تزيد الفروض عليه، فينقص نصيب كل صاحب فرض بنسبة واحدة.'],
['الردّ','إعطاء ما فضل بعد الفروض لأصحابها بنسبة فروضهم عند عدم العاصب. لا يُقال به في أصل المذهب المالكي، ويؤخذ به في فتوى المتأخرين وقانون الأسرة الجزائري.'],
['التصحيح','ضرب أصل المسألة في عدد يجعل سهام كل فريق تنقسم على رؤوسه صحيحة.'],
['بيت المال','الجهة التي تؤول إليها التركة إذا لم يوجد وارث، أو يبقى الفاضل عند عدم الردّ في أصل المذهب.'],
['ذوو الأرحام','الأقارب الذين ليسوا أصحاب فروض ولا عصبة، كابن البنت والخال والعمة. لا يرثون في أصل المذهب المالكي، وورّثهم المتأخرون على طريقة أهل التنزيل.'],
['الولاء','قرابة حكمية تنشأ بالعتق، فيرث المعتِق عتيقه. وقد أُلغي في القانون الجزائري.'],
['الجد','أبو الأب وإن علا. يحجب الإخوة عند بعض الفقهاء، ويقاسمهم عند المالكية والجمهور.'],
['المعادّة','عدّ الجدّ للإخوة لأب مع الأشقاء في القسمة، ثم يُعطى الشقيق ما لهم.'],
['الأكدرية','مسألة: زوج وأم وجد وأخت شقيقة. سُمّيت بذلك لتكدّر أصول الجد فيها.'],
['المشتركة','مسألة: زوج وأم وإخوة لأم وإخوة أشقاء. يشترك الأشقاء مع الإخوة لأم في الثلث عند المالكية.'],
['العمريتان','مسألتان قضى فيهما عمر رضي الله عنه: زوج وأبوان، وزوجة وأبوان، فتأخذ الأم ثلث الباقي.'],
['الحمل','الجنين في بطن أمه عند الوفاة. يُوقف له نصيب حتى يتبيّن أمره، ويرث إن وُلد حيّاً حياة مستقرة.'],
['المفقود','من غاب ولا يُعلم حياته ولا موته. يُوقف نصيبه إلى أن يُحكم بموته أو يظهر حيّاً.'],
['الخنثى','من له علامتا الذكر والأنثى أو ليس له شيء منهما. يُعامل في الميراث بأضرّ الحالين ثم يُعطى عند المالكية بحسب الحالتين.'],
['المناسخات','أن يموت وارث قبل قسمة التركة، فتنتقل حصته إلى ورثته، فتُحلّ المسألتان معاً.'],
['التنزيل','وصية واجبة في القانون الجزائري (المواد 169–172): يُنزَّل أولاد الابن أو البنت المتوفى قبل أبيه منزلة أصلهم بشرط ألا يتجاوز الثلث.'],
['التخارج','أن يصالح أحد الورثة على شيء من التركة ويخرج منها، فيقسّم الباقي على من بقي.'],
['الغرقى والهدمى','من ماتوا بغرق أو هدم ولم يُعلم أولهم موتاً، فلا يرث بعضهم بعضاً، وتُقسَّم تركة كل واحد على ورثته الأحياء.'],
['موانع الإرث','أسباب تمنع الوارث من الميراث مع قيام سببه: كالقتل والرقّ واختلاف الدين.'],
['أسباب الإرث','القرابة والزوجية والولاء.']
];
const nz=s=>String(s).replace(/[ً-ْـ]/g,'').replace(/[أإآ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه').toLowerCase();
const strip=h=>h.replace(/<[^>]*>/g,' ').replace(/&[a-z]+;/g,' ').replace(/\s+/g,' ');
let lessonText=null;
function runFind(){
  const q=nz(($('#fq').value||'').trim());
  if(!lessonText)lessonText=LESSONS.map(l=>strip(l.t+' '+l.s+' '+l.b));
  let o='';
  const gl=GLOSS.filter(([t,d])=>!q||nz(t+' '+d).includes(q));
  o+=`<h3>المصطلحات (${gl.length})</h3>`+(gl.length?`<dl class="gl">${gl.map(([t,d])=>`<dt>${t}</dt><dd>${d}</dd>`).join('')}</dl>`:'<p class="small">لا مصطلح مطابق.</p>');
  if(q){
    const hits=[];lessonText.forEach((tx,i)=>{const n=nz(tx);const p=n.indexOf(q);if(p>=0){const st=Math.max(0,p-40);hits.push({i,sn:tx.slice(st,st+130)})}});
    o+=`<h3>في الدروس (${hits.length})</h3>`+(hits.length?`<div class="lgrid">${hits.slice(0,12).map(h=>`<button class="lcard" data-fl="${h.i}"><span class="ln">${h.i+1}</span><b>${LESSONS[h.i].t}</b><span class="small">…${esc(h.sn)}…</span></button>`).join('')}</div>`:'<p class="small">لا نتيجة في الدروس.</p>');
  }
  $('#fOut').innerHTML=o;
}
document.addEventListener('input',e=>{if(e.target.id==='fq')runFind()});
document.addEventListener('click',e=>{const b=e.target.closest('[data-fl]');if(b){tab('learn');openLesson(+b.dataset.fl)}});

// ---- تثبيت كتطبيق ----
let dip=null;
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();dip=e;const b=$('#pwaBtn');if(b)b.hidden=false});
document.addEventListener('click',e=>{if(e.target.id==='pwaBtn'&&dip){dip.prompt();dip.userChoice.finally(()=>{dip=null;e.target.hidden=true})}});
try{
  if(/iphone|ipad|ipod/i.test(navigator.userAgent)&&!window.navigator.standalone)$('#pwaHint').textContent='على iPhone: افتح الموقع في Safari ثم زر المشاركة ثم «إضافة إلى الشاشة الرئيسية» لتثبيته كتطبيق.';
  if('serviceWorker' in navigator&&/^https?:$/.test(location.protocol))navigator.serviceWorker.register('sw.js').catch(()=>{});
}catch(e){}
