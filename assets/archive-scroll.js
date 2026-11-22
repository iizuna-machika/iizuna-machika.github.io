/** Ver.8.0 - 一枚ずつの全画面読書を通常の縦スクロールでつなぐ。
 *  承認済みの .doc-reading 原稿はDOMから変更せず、表示用に複製する。
 */
(()=>{
 'use strict';
 const original=document.querySelector('.page-archive .doc-reading');
 const panel=document.getElementById('archive-scroll-experience');
 if(!original || !panel) return;
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 const chapters=[...original.querySelectorAll(':scope > .doc-chapter')];
 const slides=[],chapterStart=[];
const textlen=node=>(node?.textContent||'').trim().length;
 const skipBlock=el=>el.matches?.('a.chapter-return,.principles-inline-key');
 const partBlocks=(chapter,i)=>{
  if(i===0){const copy=chapter.querySelector('.principles-copy');return copy?[...copy.children].filter(el=>!skipBlock(el)):[]}
  return [...chapter.children].filter(el=>el.tagName!=='H2'&&!skipBlock(el));
 };
 // Each paragraph/table remains intact. Long text scrolls *inside* its slide.
 chapters.forEach((chapter,i)=>{
   const part=chapter.querySelector(':scope > h2')?.textContent?.trim()||`第${i+1}部`;
   chapterStart.push(slides.length);
   const blocks=partBlocks(chapter,i);
   let heading=part, working=[], chars=0, maxchars=0;
   const flush=()=>{if(!working.length)return;slides.push({part,partIndex:i,heading,blocks:working.slice()});working=[];chars=0};
   for(const b of blocks){
    if(['H3','H4'].includes(b.tagName)){
      flush(); heading=b.textContent.trim(); maxchars=b.tagName==='H4'?360:450; continue;
    }
    const l=textlen(b);
    if(working.length && (chars+l>Math.max(maxchars,450)|| b.tagName==='TABLE'||b.tagName==='OL'&&l>400))flush();
    working.push(b);chars+=l;
    if(b.tagName==='TABLE'||l>650)flush();
   }
   flush();
   if(slides.length===chapterStart[i]) slides.push({part,partIndex:i,heading:part,blocks:[]});
 });
 // Diagram visuals: visually different explanations per subject, not claims of scientific proof.
 const path=(d,color='#d8bc85',thickness=2)=>`<path class="graphic-thread" d="${d}" fill="none" stroke="${color}" stroke-width="${thickness}" pathLength="1" stroke-linecap="round"/>`;
 const node=(x,y,text,r=30)=>`<g class="graphic-node"><circle cx="${x}" cy="${y}" r="${r}" class="graphic-main-node"/><text x="${x}" y="${y+6}" class="graphic-label ${text.length>2?'small':''}">${text}</text></g>`;
 const txt=(x,y,t)=>`<text x="${x}" y="${y}" class="graphic-tiny">${t}</text>`;
 function figure(s){
  const h=s.heading, i=s.partIndex;
  let body='';
  if(i===0&&/和議|議論|対立|目的|合意|両立|着地点|和による/.test(h)){
    body=path('M35 78 C115 68 125 145 210 157 S317 80 389 72')+path('M35 227 C126 227 140 160 210 157 S312 218 389 223','#8ab1b4')+node(67,78,'立場A',38)+node(67,227,'立場B',38)+node(333,158,'可能性',43)+txt(210,104,'互いの目的を確かめる');
  }else if(i===0&&/徳の判断|健全|正しい|不介入|教育|実践用|判断手続き|徳の負/.test(h)){
    body=path('M91 209 Q92 88 210 67 Q332 86 330 211 Q211 282 91 209')+path('M91 209 Q199 155 330 211','#8ab1b4')+node(210,67,'知る',36)+node(91,209,'選ぶ',36)+node(330,211,'省みる',41)+txt(210,155,'情と意志');
  }else if(i===0&&/第一原理|^和$/.test(h)){
    body=path('M13 68 C100 272 256 15 405 228')+path('M13 231 C165 14 284 264 405 65','#8ab1b4')+path('M10 145 C159 194 280 92 410 145','#eee0ca',1.4)+node(210,145,'和',37)+txt(210,36,'異なる線を保ちつつ結ぶ');
  }else if(i===0&&/知.{0,2}徳.{0,2}体|三竦み|三原理/.test(h)){
    body=path('M210 48 Q342 120 310 224 Q210 289 110 224 Q86 124 210 48')+path('M210 48 Q134 142 310 224 Q220 168 110 224 Q267 146 210 48','#8ab1b4',1.6)+node(210,48,'知')+node(110,224,'徳')+node(310,224,'体')+txt(210,166,'相互補完・相互抑制');
  }else if(i===0&&/自律|自立/.test(h)){
    body=path('M210 270 L210 152 Q124 110 44 44')+path('M210 270 L210 152 Q300 93 380 42','#8ab1b4')+path('M210 270 L210 34','#eee0ca')+path('M44 44 Q210 170 380 42','#bfaaa0',1)+node(210,151,'己',31)+txt(76,28,'選ぶ')+txt(339,28,'選ぶ')+txt(211,19,'選ぶ');
  }else if(i===0){
    body=path('M210 47 Q352 125 312 239 Q210 293 108 239 Q70 126 210 47Z')+path('M210 47 Q98 141 312 239 Q208 178 108 239 Q311 168 210 47','#8ab1b4',1.7)+node(210,47,'和')+node(108,239,'知徳体',35)+node(312,239,'自律自立',40)+txt(210,171,'三つの根は不可分');
  }else if(i===1){
    body=path('M90 215 Q110 75 210 61 Q302 75 330 211')+path('M330 211 Q226 285 90 215','#8ab1b4')+node(90,215,'考える',40)+node(210,61,'選ぶ',37)+node(330,211,'省みる',42)+txt(210,165,'経験と振り返り');
  }else if(i===2){
    body=path('M35 85 C124 110 119 200 210 165 S326 86 395 85')+path('M35 224 C128 201 137 114 210 165 S326 225 395 224','#8ab1b4')+node(66,84,'立場A',38)+node(66,226,'立場B',38)+node(334,154,'共に',37)+txt(210,108,'目的を伝え合う');
  }else if(i===3){
    body=path('M210 155 Q111 80 105 53')+path('M210 155 Q321 85 315 51','#8ab1b4')+path('M210 155 Q114 250 98 253','#e4cfb0')+path('M210 155 Q322 241 327 250','#bd9d9a')+node(210,155,'関係',40)+node(105,53,'生命',33)+node(315,51,'自然',33)+node(98,252,'道具',34)+node(327,250,'AI',33);
  }else if(i===4){
    body=path('M58 160 Q125 90 210 160 Q295 225 362 160')+path('M58 160 Q133 232 210 160 Q290 87 362 160','#8ab1b4')+node(58,160,'先代',35)+node(210,160,'根',36)+node(362,160,'次代',35)+txt(210,83,'変えずに受け渡す');
  }else if(i===5){
    body=path('M210 150 L95 65')+path('M210 150 L325 65','#8ab1b4')+path('M210 150 L95 238','#e2caa0')+path('M210 150 L325 238','#bd9d9a')+node(210,150,'活動',37)+node(95,65,'思想',34)+node(325,65,'鑑定',34)+node(95,238,'音楽',34)+node(325,238,'文章',34);
  }else{
    body=path('M92 72 Q210 19 329 72')+path('M329 72 Q359 181 210 241','#8ab1b4')+path('M210 241 Q48 179 92 72','#e2caa0')+node(92,72,'問い',34)+node(329,72,'検証',37)+node(210,241,'更新',37)+txt(210,149,'根拠を確かめる');
  }
  return `<svg viewBox="0 0 420 300" role="img" aria-label="この部の論点を表す補助的な概念図"><ellipse cx="210" cy="152" rx="176" ry="134" fill="#ddc48c" opacity=".06"/>${body}</svg>`;
 }
 
 const list=document.getElementById('story-list');
 const select=document.getElementById('story-part-select');
 const count=document.getElementById('story-page-count');
 const fill=document.getElementById('story-progress-fill');
 const btnVisual=document.getElementById('story-mode-visual');
 const btnText=document.getElementById('story-mode-text');
 const clamp=n=>Math.max(0,Math.min(1,n));
 const compact=matchMedia('(max-width: 580px)');
 const intro=document.querySelector('.story-heading-block p');
 if(intro)intro.textContent='上下へスクロールすると画面はその場に留まり、文字が現れ、図が動き、次の場面へつながります。';
 if(btnVisual)btnVisual.textContent='映像でたどる';
 const backToVisual=document.createElement('button');
 backToVisual.type='button';backToVisual.className='story-return-to-visual';
 backToVisual.textContent='動く思想絵巻へ戻る';
 original.insertAdjacentElement('beforebegin',backToVisual);
 // Visual copy is rendered from the approved source. The unaltered source article
 // remains independently available in the "全文を読む" mode.
 function breakText(raw,maxLen){
   const normalized=String(raw||'').replace(/\r\n/g,'\n').trim();
   if(!normalized)return [];
   let chars=Array.from(normalized),res=[];
   while(chars.length){
     if(chars.length<=maxLen){res.push(chars.join(''));break;}
     let limit=maxLen, pos=-1;
     for(let j=limit;j>Math.floor(maxLen*.63);j--){
       if('。！？\n；;'.includes(chars[j-1])){pos=j;break;}
     }
     if(pos<0){for(let j=limit;j>Math.floor(maxLen*.68);j--){if('、，, 　'.includes(chars[j-1])){pos=j;break;}}}
     if(pos<0)pos=maxLen;
     res.push(chars.splice(0,pos).join(''));
   }
   return res.filter(Boolean);
 }
 function flatten(block){
   if(block.tagName==='TABLE'){
     return [...block.querySelectorAll('tr')].map(r=>[...r.querySelectorAll('th,td')].map(c=>c.textContent.trim()).join(' ｜ ')).filter(Boolean);
   }
   if(['OL','UL'].includes(block.tagName)){
     return [...block.querySelectorAll(':scope > li')].map((li,i)=>(block.tagName==='OL'?`${i+1}. `:'・')+li.textContent.trim());
   }
   return [block.textContent];
 }
 let beats=[];
 const chapterStarts=[];
 function buildBeats(){
   beats=[];chapterStarts.length=0;
   const max=compact.matches?112:178;
   slides.forEach((s,i)=>{
     if(chapterStarts[s.partIndex]===undefined)chapterStarts[s.partIndex]=beats.length;
     let buffer='';
     const push=()=>{if(!buffer.trim())return;beats.push({...s,visualIndex:i,text:buffer.trim()});buffer='';};
     for(const block of s.blocks){
       // Tables become explicit node-and-relationship scenes, not flattened text.
       // Each source cell is reproduced verbatim (long cells flow across scenes).
       if(block.tagName==='TABLE'){
         push();
         const heads=[...block.querySelectorAll('thead th')].map(x=>x.textContent.trim());
         const tableRows=[...block.querySelectorAll('tbody tr')];
         for(const row of tableRows){
           const cells=[...row.querySelectorAll('th,td')].map(x=>x.textContent.trim());
           if(cells.length<2)continue;
           for(let k=1;k<cells.length;k++){
             for(const piece of breakText(cells[k],compact.matches?130:210)){
               beats.push({...s,visualIndex:i,text:'',tableRelation:{center:cells[0],attribute:heads[k]||'説明',detail:piece}});
             }
           }
         }
         continue;
       }
       for(const part of flatten(block)){
         for(const piece of breakText(part,max)){
           if(buffer && Array.from(buffer+'\n'+piece).length>max)push();
           buffer+=(buffer?'\n':'')+piece;
         }
       }
     }
     push();
     if(!beats.length||beats[beats.length-1].visualIndex!==i){beats.push({...s,visualIndex:i,text:''});}
   });
 }
 buildBeats();
 chapters.forEach((c,i)=>{
   const opt=document.createElement('option');opt.value=String(chapterStarts[i]||0);
   opt.textContent=c.querySelector(':scope > h2')?.textContent.trim()||`第${i+1}部`;
   select.append(opt);
 });
 list.classList.add('cinema-scroll-track');
 list.innerHTML=`<div class="cinema-pin" id="cinema-pin">
   <div class="cinema-scene" role="group" aria-label="スクロールに連動する思想図解">
    <div class="cinema-decor" aria-hidden="true"><i></i><i></i><i></i></div>
    <div class="cinema-layer cinema-layer-a"></div><div class="cinema-layer cinema-layer-b"></div>
    <div class="cinema-instructions" aria-hidden="true">SCROLL TO REVEAL <span>↓</span></div>
   </div>
 </div>`;
 const layerA=list.querySelector('.cinema-layer-a');
 const layerB=list.querySelector('.cinema-layer-b');
 let current=-1,mode='visual',scrollTicking=false,lastProgress=-1;
 const buffers=[{node:layerA,index:-1,spans:[],paths:[]},{node:layerB,index:-1,spans:[],paths:[]}];
 function asText(s){return String(s).replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
 function charsHTML(raw,className){
   return Array.from(raw).map((c,i)=> c==='\n'?'<span class="cinema-newline"></span>':
     `<span class="${className}" data-i="${i}">${c===' '? '&nbsp;' : asText(c)}</span>`).join('');
 }
 function fillBuffer(buffer,index){
   if(buffer.index===index)return;
   const b=beats[index];if(!b){buffer.node.innerHTML='';buffer.index=-1;buffer.spans=[];buffer.paths=[];return;}
   const actualPart=b.part.replace(/第[^部]*部/,m=>m);
   const relation=b.tableRelation;
   const diagram=relation?`<div class="cinema-relation" aria-label="表の内容を関係図で表示">
      <div class="cinema-relation-center">${asText(relation.center)}</div>
      <div class="cinema-relation-thread" aria-hidden="true"></div>
      <div class="cinema-relation-note"><small>${asText(relation.attribute)}</small><p>${asText(relation.detail)}</p></div>
     </div>`:'';
   buffer.node.innerHTML=`<div class="cinema-overline"><span>${asText(actualPart)}</span><span>SCENE ${String(index+1).padStart(3,'0')} / ${beats.length}</span></div>
      <div class="cinema-art" aria-hidden="true">${figure(b)}</div>
      <div class="cinema-content"><div class="cinema-heading">${charsHTML(b.heading,'cinema-heading-glyph')}</div>
      <div class="cinema-ink-rule" aria-hidden="true"></div>
      ${diagram||`<div class="cinema-body">${charsHTML(b.text,'cinema-glyph')}</div>`}</div>`;
   buffer.spans=[...buffer.node.querySelectorAll('.cinema-heading-glyph,.cinema-glyph')];
   buffer.paths=[...buffer.node.querySelectorAll('.graphic-thread')];
   for(const p of buffer.paths){p.style.strokeDasharray='1';p.style.strokeDashoffset='1'}
   buffer.index=index;
 }
 const ease=(a,b,v)=>{const t=clamp((v-a)/(b-a));return t*t*(3-2*t)};
 function animateBuffer(buffer,p,isUpcoming){
   const heading=buffer.node.querySelectorAll('.cinema-heading-glyph');
   const body=buffer.node.querySelectorAll('.cinema-glyph');
   for(let j=0;j<heading.length;j++){
     const k=reduce.matches?1:ease(.04 + .13*j/Math.max(1,heading.length),.29+.22*j/Math.max(1,heading.length),p);
     heading[j].style.opacity=k;heading[j].style.transform=`translateY(${(1-k)*14}px)`;
   }
   for(let j=0;j<body.length;j++){
     const k=reduce.matches?1:ease(.20+.42*j/Math.max(1,body.length),.38+.42*j/Math.max(1,body.length),p);
     body[j].style.opacity=k;body[j].style.transform=`translateY(${(1-k)*10}px)`;
   }
   const q=reduce.matches?1:ease(.08,.78,p);
   for(const path of buffer.paths)path.style.strokeDashoffset=(1-q).toFixed(3);
   buffer.node.style.setProperty('--cinema-draw',q.toFixed(3));
   buffer.node.style.setProperty('--cinema-ink',ease(.1,.7,p).toFixed(3));
 }
 function resize(){
   const h=window.innerHeight;
   const step=Math.max(270,Math.round(h*(compact.matches?.66:.74)));
   list.style.setProperty('--cinema-step',step+'px');
   list.style.height=(Math.max(0,beats.length-1)*step+h)+'px';
   return step;
 }
 let step=resize();
 function update(){
   scrollTicking=false;if(mode!=='visual')return;
   const rect=list.getBoundingClientRect();
   const raw=Math.max(0,Math.min(beats.length-1,(-rect.top)/step));
   const index=Math.floor(raw);const fract=raw-index;
   fillBuffer(buffers[0],index);fillBuffer(buffers[1],Math.min(beats.length-1,index+1));
   if(current!==index){
     current=index;count.textContent=`${String(index+1).padStart(2,'0')} / ${String(beats.length).padStart(2,'0')}`;
     select.value=String(chapterStarts[beats[index].partIndex]);
   }
   const x=ease(.74,.99,fract);
   // Each incoming text sequence is written during the dissolve (last quarter
   // of the preceding beat), and stays visible across the beat boundary.
   animateBuffer(buffers[0], index===0 ? Math.min(1,fract/.72) : 1,false);
   animateBuffer(buffers[1], Math.min(1,Math.max(0,(fract-.64)/.35)),true);
   // The next scene starts appearing during the final quarter of the scroll beat.
   layerA.style.opacity=String(1-x);
   layerB.style.opacity=String(x);
   layerA.style.transform=`translateY(${-x*12}px) scale(${1-x*.016})`;
   layerB.style.transform=`translateY(${(1-x)*16}px) scale(${.985+x*.015})`;
   const global=(raw+1)/beats.length;
   fill.style.width=(100*global).toFixed(2)+'%';
 }
 function request(){if(!scrollTicking){scrollTicking=true;requestAnimationFrame(update)}}
 function jumpTo(n,behavior='instant'){
   const i=Math.max(0,Math.min(beats.length-1,n));
   const target=window.scrollY+list.getBoundingClientRect().top+i*step;
   window.scrollTo({top:target,behavior:reduce.matches?'instant':behavior});
   if(history.replaceState)history.replaceState(null,'',`#arch-scene-${i+1}`);
   request();
 }
 select.addEventListener('change',()=>jumpTo(Number(select.value)));
 [...document.querySelectorAll('.doc-toc a[href^="#philo-"]')].forEach((a,i)=>a.addEventListener('click',e=>{
   if(mode!=='visual')return;e.preventDefault();jumpTo(chapterStarts[i]||0)
 }));
 function switchMode(next){
   mode=next;
   document.body.classList.toggle('archive-reading-on',mode==='text');
   btnVisual.classList.toggle('is-active',next==='visual');btnText.classList.toggle('is-active',next==='text');
   btnVisual.setAttribute('aria-pressed',String(next==='visual'));
   btnText.setAttribute('aria-pressed',String(next==='text'));
   if(next==='visual'){
     step=resize();requestAnimationFrame(()=>jumpTo(Math.max(0,current),'instant'));
   }else{
     document.getElementById('doc-start').scrollIntoView({block:'start',behavior:'instant'});
     history.replaceState?.(null,'','#doc-start');
   }
 }
 btnVisual.addEventListener('click',()=>switchMode('visual'));
 btnText.addEventListener('click',()=>switchMode('text'));
 backToVisual.addEventListener('click',()=>switchMode('visual'));
 window.addEventListener('scroll',request,{passive:true});
 let previousWidth=window.innerWidth;
 window.addEventListener('resize',()=>{
   if(mode!=='visual')return;
   const width=window.innerWidth;
   if(compact.matches && Math.abs(width-previousWidth)<12)return;
   previousWidth=width;
   const old=current;step=resize();
   requestAnimationFrame(()=>jumpTo(Math.max(0,old),'instant'));
 },{passive:true});
 const rawhash=location.hash;
 const hashMatch=/^#arch-(?:scene|story|slide)-(\d+)$/.exec(rawhash);
 panel.hidden=false;document.body.classList.add('archive-scroll-on','archive-cinema-on');
 if(reduce.matches){switchMode('text')}
 else if(hashMatch){requestAnimationFrame(()=>jumpTo(Number(hashMatch[1])-1,'instant'));}
 else requestAnimationFrame(update);
})();
