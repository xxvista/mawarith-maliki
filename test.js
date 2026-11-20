const E=require('./engine.js');
const t=(name,inp,mode,exp)=>{const r=E.solve(inp,mode);const got={};r.heirs.forEach(h=>got[h.key]=h.share.str());if(!r.bayt.isZero())got.bayt=r.bayt.str();
 const ok=JSON.stringify(Object.keys(exp).sort().map(k=>[k,exp[k]]))===JSON.stringify(Object.keys(got).sort().map(k=>[k,got[k]]));
 console.log(ok?'PASS':'FAIL',name, ok?'':JSON.stringify(got)+' vs '+JSON.stringify(exp), r.errors.join('|'));};
t('عمرية1 زوج+أبوان',{husband:1,father:1,mother:1},'A',{husband:'1/2',mother:'1/6',father:'1/3'});
t('عمرية2 زوجة+أبوان',{wives:1,father:1,mother:1},'A',{wives:'1/4',mother:'1/4',father:'1/2'});
t('أكدرية',{husband:1,mother:1,gf:1,fs:1},'A',{husband:'1/3',mother:'2/9',gf:'8/27',fs:'4/27'});
t('مشتركة',{husband:1,mother:1,mb:2,fb:1},'A',{husband:'1/2',mother:'1/6',mb:'2/9',fb:'1/9'});
t('عول زوج+شقيقتان+أم',{husband:1,fs:2,mother:1},'A',{husband:'3/8',fs:'1/2',mother:'1/8'});
t('منبرية زوجة+بنتان+أبوان',{wives:1,daughters:2,father:1,mother:1},'A',{wives:'1/9',daughters:'16/27',father:'4/27',mother:'4/27'});
t('بنت+بنت ابن+أخ',{daughters:1,gdaughters:1,fb:1},'A',{daughters:'1/2',gdaughters:'1/6',fb:'1/3'});
t('جد+5إخوة+جدة',{gf:1,fb:5,gm_m:1},'A',{gf:'5/18',fb:'5/9',gm_m:'1/6'});
t('بنت+شقيقة',{daughters:1,fs:1},'A',{daughters:'1/2',fs:'1/2'});
t('رد A بنت+أم',{daughters:1,mother:1},'A',{daughters:'1/2',mother:'1/6',bayt:'1/3'});
t('رد B بنت+أم',{daughters:1,mother:1},'B',{daughters:'3/4',mother:'1/4'});
t('رد C زوج+بنت',{husband:1,daughters:1},'C',{husband:'1/4',daughters:'3/4'});
t('رد C زوج فقط',{husband:1},'C',{husband:'1'});
t('جدتان',{gm_m:1,gm_p:1},'A',{gm_m:'1/12',gm_p:'1/12',bayt:'5/6'});
t('أب+ابن',{father:1,sons:1},'A',{father:'1/6',sons:'5/6'});
t('ابن+بنت',{sons:1,daughters:1},'A',{sons:'2/3',daughters:'1/3'});
t('زوجة+ابن',{wives:2,sons:1},'A',{wives:'1/8',sons:'7/8'});
t('جد+أخ+زوج',{husband:1,gf:1,fb:1},'A',{husband:'1/2',gf:'1/4',fb:'1/4'});
t('جد+أخ شقيق+أخ لأب مقاسمة',{gf:1,fb:1,pb:1},'A',{gf:'1/3',fb:'2/3'});
t('جد+شقيقة+إخوة لأب',{gf:1,fs:1,pb:2},'A',{gf:'1/3',fs:'1/2',pb:'1/6'});
t('أخ لأم+أخت لأم',{mb:1,ms:1},'A',{mb:'1/6',ms:'1/6',bayt:'2/3'});
t('جد+أم+أخ لأم',{gf:1,mother:1,mb:1},'A',{gf:'2/3',mother:'1/3'});
t('أم+شقيق+شقيقة',{mother:1,fb:1,fs:1},'A',{mother:'1/6',fb:'5/9',fs:'5/18'});
t('عم',{ufb:2,upb:1},'A',{ufb:'1'});
t('بنتان+بنت ابن+ابن ابن',{daughters:2,gdaughters:1,gsons:1},'A',{daughters:'2/3',gsons:'2/9',gdaughters:'1/9'});
t('زوج+أم+أخوان لأم+شقيق + شقيقة',{husband:1,mother:1,mb:2,fb:1,fs:1},'A',{husband:'1/2',mother:'1/6',mb:'1/6',fb:'1/12',fs:'1/12'});

const r=E.solve({husband:1,fs:2,mother:1},'A');console.log('awl',JSON.stringify(r.awl),'base',r.base,r.heirs.map(h=>h.label+':'+h.units));
const r2=E.solve({husband:1,mother:1,gf:1,fs:1},'A');console.log('akd base',r2.base,r2.heirs.map(h=>h.label+':'+h.units));
const r3=E.solve({wives:2,daughters:2,father:1,mother:1},'A');console.log(r3.base,r3.heirs.map(h=>h.label+':'+h.units+' per '+h.per.str()));

// ---- tanzil / arham / takharuj
const tzr=E.solveTanzil({sons:3,father:1,mother:1},'A',{type:'son',males:0,females:1});
console.log('tz f',tzr.fShare.str(),'tz',tzr.tz.str(),'capped',tzr.capped,tzr.actual.heirs.map(h=>h.label+' '+h.share.str()).join('|'),'factor',tzr.factor.str());
const tzc=E.solveTanzil({daughters:1},'A',{type:'daughter',males:2,females:1});
console.log('tz2 f',tzc.fShare.str(),'tz',tzc.tz.str(),'capped',tzc.capped,tzc.groups.map(g=>g.label+' '+g.share.str()).join('|'));
const tzn=E.solveTanzil({},'A',{type:'son',males:1,females:0});console.log('tz none',tzn.reason.slice(0,40));
const ar1=E.solveArham({spouse:'husband',c1:[{m:1,f:1}]});console.log('arham1',ar1.heirs.map(h=>h.label+' '+h.share.str()).join('|'),ar1.errors);
const ar3=E.solveArham({c3:[{type:'fs',m:1,f:1},{type:'ms',m:1,f:0}]});console.log('arham3',ar3.heirs.map(h=>h.label+' '+h.share.str()).join('|'),ar3.errors);
const ar4=E.solveArham({spouse:'wife',c4:{pm:1,pf:1,mm:0,mf:1}});console.log('arham4',ar4.heirs.map(h=>h.label+' '+h.share.str()).join('|'),ar4.errors);
const ar2=E.solveArham({c2:{mgf:1,gmfm:1}});console.log('arham2',ar2.heirs.map(h=>h.label+' '+h.share.str()).join('|'));
const base=E.solve({sons:2,wives:1,mother:1},'A');
const tk=E.takharuj(base.heirs,{key:'wives',k:1,mode:'estate'});console.log('tk est',tk.rows.map(r=>r.label+' '+r.newShare.str()).join('|'));
const tk2=E.takharuj(base.heirs,{key:'wives',k:1,mode:'payer',payer:'mother'});console.log('tk payer',tk2.rows.map(r=>r.label+' '+r.newShare.str()).join('|'));
const tk3=E.takharuj(base.heirs,{key:'wives',k:1,mode:'payer',payer:'all'});console.log('tk all',tk3.rows.map(r=>r.label+' '+r.newShare.str()).join('|'));

// ---- special cases: haml / mafqud / khuntha / munasakha
const chk=(n,got,exp)=>console.log(got===exp?'PASS':'FAIL',n,got===exp?'':got+' vs '+exp);
{const h=E.solveHaml({wives:1,father:1,mother:1},'A',{type:'child',maxN:1});
 chk('haml given',h.given.map(g=>g.key+' '+g.share.str()).join('|'),'wives 1/8|father 1/6|mother 1/6');chk('haml held',h.held.str(),'13/24');
 chk('haml maxN2 held',E.solveHaml({wives:1,father:1,mother:1},'A',{type:'child',maxN:2}).held.str(),'16/27');}
{const m=E.solveMafqud({wives:1,mother:1,sons:2},'A','sons');chk('mafqud given',m.rows.map(r=>r.key+' '+r.given.str()).join('|'),'wives 1/8|mother 1/6|sons 17/48');}
{const k=E.solveKhuntha({mother:1},'A','child');chk('khuntha',k.rows[0].avg.str()+'/'+k.khuntha.avg.str(),'1/6/2/3');
 chk('khuntha usib rejected',E.solveKhuntha({mother:1},'A','usib').errors.length>0,true);}
{const m=E.munasakha({wives:1,sons:1,daughters:1},'A','sons',{wives:1,mother:1,sons:1},'A',{mother:'wives'});
 chk('munasakha',[m.errors.length,m.relation,m.T1,m.T2,m.J].join(','),'0,توافق,24,24,288');}

// ---- طريقة الجدول (أصل المسألة، العول، الردّ، التصحيح): يجب أن تطابق الحساب الكسري
(function(){
  const ks=E.KEYS;let seed=7;const rnd=()=>{seed=(seed*1103515245+12345)&0x7fffffff;return seed/0x7fffffff};
  let n=0,bad=0;
  for(let i=0;i<5000;i++){const inp={};const k=1+Math.floor(rnd()*5);
    for(let j=0;j<k;j++){const key=ks[Math.floor(rnd()*ks.length)];inp[key]=1+Math.floor(rnd()*(['husband','father','mother','gf','mawla'].includes(key)?1:4))}
    for(const m of['A','B','C']){const r=E.solve(inp,m);if(!r.heirs.length)continue;n++;const T=E.buildTable(r);if(!T||!T.consistent||T.base2!==r.base)bad++}}
  console.log(bad?'FAIL':'PASS','جدول الحل مطابق للمحرك',n,'حالة');
  const c=(name,inp,m,kind,asl,base2)=>{const T=E.buildTable(E.solve(inp,m));const ok=T.kind===kind&&T.asl===asl&&T.base2===base2;console.log(ok?'PASS':'FAIL','جدول',name,ok?'':JSON.stringify([T.kind,T.asl,T.base2]))};
  c('عول زوج+شقيقتان+أم',{husband:1,fs:2,mother:1},'A','عائلة',6,8);
  c('أكدرية',{husband:1,mother:1,gf:1,fs:1},'A','عائلة',6,27);
  c('ردّ مع زوج',{husband:1,daughters:1,mother:1},'B','ردية',12,16);
  c('ردّ بلا زوج',{daughters:1,mother:1},'B','ردية',6,4);
  c('تصحيح ابنان+بنت',{sons:2,daughters:1},'A','عادلة',5,5);
})();

// ---- المناسخات المتعددة: مجموع سهام الأحياء = الجامعة، ومجموع الأنصبة = 1
(function(){
  const z={};E.KEYS.forEach(k=>z[k]=0);const P=o=>Object.assign({},z,o);
  const r=E.munasakhaChain(P({wives:1,sons:1,daughters:1}),'A',[{deadId:'0:sons',p2:P({wives:1,daughters:1}),mode:'A'},{deadId:'0:daughters',p2:P({husband:1,sons:1}),mode:'A'}]);
  const tot=r.rows.reduce((s,x)=>s.add(x.all),r.bayt);
  const ok=!r.errors.length&&r.J===96&&tot.eq(E.fr(1));
  console.log(ok?'PASS':'FAIL','مناسخات متعددة',r.errors.join('|'),r.J,tot.str());
  let bad=0,n=0,seed=3;const rnd=()=>{seed=(seed*1103515245+12345)&0x7fffffff;return seed/0x7fffffff};
  const pool=['sons','daughters','mother','father','wives','husband','fb','fs','mb'];
  for(let i=0;i<2000;i++){
    const rp=()=>{const o=P({});const k=1+Math.floor(rnd()*3);for(let j=0;j<k;j++){const key=pool[Math.floor(rnd()*pool.length)];o[key]=1+Math.floor(rnd()*(['father','mother','husband'].includes(key)?1:3))}if(o.husband)o.wives=0;return o};
    const p1=rp();let rr=E.munasakhaChain(p1,'B',[]);if(rr.errors.length||!rr.rows.length)continue;
    const steps=[];let cur=rr;
    for(let s=0;s<2;s++){const cand=cur.rows;if(!cand.length)break;const d=cand[Math.floor(rnd()*cand.length)];steps.push({deadId:d.id,p2:rp(),mode:'B',links:{}});const t=E.munasakhaChain(p1,'B',steps);if(t.errors.length){steps.pop();break}cur=t}
    n++;const t=E.munasakhaChain(p1,'B',steps);
    const sum=t.rows.reduce((a,x)=>a.add(x.all),t.bayt);
    if(t.errors.length||!sum.eq(E.fr(1)))bad++;
  }
  console.log(bad?'FAIL':'PASS','مناسخات عشوائية',n);
})();
