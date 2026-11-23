/* Ver.18 - link-only action labels and compact profile spread; full approved reader retained */
(()=>{'use strict';
if(!document.body.classList.contains('page-inner'))return;
const body=document.body,main=document.querySelector('main'),reduce=matchMedia('(prefers-reduced-motion: reduce)');
const compactStage = matchMedia('(max-width: 760px), (max-height: 500px) and (pointer: coarse)');
const type=[...body.classList].find(x=>x.startsWith('page-')&&x!=='page-inner')?.slice(5)||'about';
const clean=s=>String(s||'').replace(/\s+/g,' ').trim();
const titles={about:'About',archive:'思想体系',teachings:'和の書','teachings-notes':'原典注解',divination:'五十縄鑑定',works:'Works',journal:'Journal',contact:'Contact'};
const name=titles[type]||'五十縄まちか';
let backgroundPaused = false;
const motionPause = () => body.classList.toggle('editorial-motion-paused', document.hidden || backgroundPaused);
document.addEventListener('visibilitychange', motionPause);
motionPause();
const original=document.createElement('div');original.className='book-original';[...main.children].forEach(x=>original.append(x));
const scenes=[],add=s=>scenes.push(s);
const profileImage = original.querySelector('.profile-square-reserved img');
const coverImage = original.querySelector('.page-visual img');
// Aim for a complete idea per page, adjusting the capacity to the actual screen.
// Full approved source stays in .book-original for unabridged reading.
const vw=window.innerWidth,vh=window.innerHeight;
const charBudget=vw<=360?(vh<730?225:270):vw<=480?(vh<740?285:440):vw<=768?520:vw<=1100?750:1080;
const parts=(s,cap=charBudget)=>{const chars=[...clean(s)],result=[];let rest=chars;while(rest.length){if(rest.length<=cap){result.push(rest.join(''));break}let n=cap;for(let k=cap;k>Math.round(cap*.64);k--){if('。！？；'.includes(rest[k-1])){n=k;break}}result.push(rest.splice(0,n).join(''))}return result.filter(Boolean)};
const excluded=e=>!!e.closest('header,footer,nav,.doc-toc,.archive-scroll-experience,.principles-rail,.principles-mobile-dock,.story-motion-panel,.page-visual,.story-illustration,.page-scroll-signal,.mobile-read-nav,.story-toolbar,.profile-socials,.profile-information,.profile-headline,.activity-tile,.visual-table-source,.pdd-stage,.page-notice');
const title=clean(original.querySelector('.subhero h1,.profile-headline h1')?.textContent)||name;
const lead=clean(original.querySelector('.subhero p,.profile-lead')?.textContent)||'言葉を紡ぎ、人の心を結び、世界をくくる。';
// Every opening must contain substantive content; no title-only spread.

if(type==='archive'){
 const intro=[...original.querySelectorAll('.deep-guide p')].map(e=>clean(e.textContent)).filter(Boolean);
 add({kind:'intro',part:'五十縄思想体系 / 思想の入口',title:'思想体系とは',lines:intro.slice(0,2),links:[{label:'『和の書』を読む',url:'./teachings.html'}]});
 add({kind:'triad',part:'三大根本原理',title:'和・知徳体・自律自立',lines:['三つの根本原理は互いに関係しながら働きます。']});
}
if(type==='about'){
  const facts=[...original.querySelectorAll('.profile-facts > div')].map(e=>({key:clean(e.querySelector('dt')?.textContent),value:clean(e.querySelector('dd')?.textContent)}));
  const bio=clean(original.querySelector('.profile-description')?.textContent);
  add({kind:'profile',part:'ABOUT / PROFILE',title:'五十縄まちか',subtitle:'人物・活動プロフィール',tagline:lead,lead:bio,facts,links:[
    {label:'YouTube',url:'https://www.youtube.com/@iizuna_machika'},
    {label:'note',url:'https://note.com/iizuna_machika'},
    {label:'X',url:'https://x.com/iizuna_machika'}
  ]});
}
const divinationDiagram=original.querySelector('.divination-method-image');
if(type==='divination' && divinationDiagram){
 add({kind:'method-network',part:'五十縄鑑定の占術',title:'六つの占術を三つの縄に',caption:'各占術の読みを比べ、共通点や違いを相談の問いに照らし合わせます。'});
}

let heading=name,chapter=name,acc=[],accLinks=[],accLen=0,inCase=false;
const getLinks=e=>[...e.querySelectorAll('a[href]')].filter(a=>!a.classList.contains('chapter-return')).map(a=>({label:clean(a.textContent)||'関連ページを見る',url:a.getAttribute('href')}));
// Preserve explanatory prose but never reproduce linked labels as inert text in motion mode.
// The full-text reader still contains the source HTML exactly as approved.
const proseExcludingLinks=e=>{
 const clone=e.cloneNode(true);
 clone.querySelectorAll('a[href]').forEach(a=>a.remove());
 return clean(clone.textContent);
};
const recordLinks=links=>{for(const link of links)if(link.url&&!accLinks.some(x=>x.url===link.url))accLinks.push(link)};
const flush=()=>{if(acc.length){add({kind:'text',part:chapter,title:heading,inCase,lines:acc.splice(0),links:accLinks.splice(0)});accLen=0}else if(accLinks.length){const prev=scenes.at(-1);if(prev)prev.links=[...(prev.links||[]),...accLinks.splice(0)]}};
const append=t=>{
 if(inCase){acc.push(t);return}
 for(const chunk of parts(t)){
  const size=[...chunk].length;
  if(acc.length && (accLen+size>charBudget || acc.length>=8))flush();
  acc.push(chunk);accLen+=size;
 }
};
const selector=type==='archive'?
 '.doc-reading .doc-chapter h2,.doc-reading .doc-chapter h3,.doc-reading .doc-chapter h4,.doc-reading .archive-case h5,.doc-reading .doc-chapter p,.doc-reading .doc-chapter li,.doc-reading .doc-chapter table':
 'h2,h3,h4,p,li,dt,dd,table,.plan-card,.video-card';
for(const e of original.querySelectorAll(selector)){
  if(excluded(e)||e.closest('.plan-card,.video-card')&&!e.matches('.plan-card,.video-card'))continue;
  const t=clean(e.textContent),tag=e.tagName;if(!t)continue;
  if(/^H[2345]$/.test(tag)||tag==='DT'){
    flush();
    inCase=e.matches('.archive-case h5');
    heading=t;if(tag==='H2')chapter=t;
    if(type==='about'&&t==='活動の四つの表現'){
      const activities=[...original.querySelectorAll('.activity-grid .activity-tile')].map(tile=>({title:clean(tile.querySelector('h3')?.textContent),text:clean(tile.querySelector('p')?.textContent),url:tile.querySelector('a')?.getAttribute('href')}));
      add({kind:'activities',part:'ABOUT / ACTIVITIES',title:t,activities});
    }
    continue;
  }
  if(e.matches('.plan-card')){
    flush();add({kind:'plan',part:'鑑定プラン',title:clean(e.querySelector('h3')?.textContent),price:clean(e.querySelector('.price')?.textContent),lines:[clean(e.querySelector('p:not(.button-space)')?.textContent)],url:e.querySelector('a')?.getAttribute('href')});continue;
  }
  if(e.matches('.video-card')){
    flush();const srcTitle=e.querySelector('.youtube-official-title');add({kind:'video',part:chapter,title:clean(srcTitle?.textContent)||'YouTubeの作品を見る',lines:['作品の視聴はYouTubeから。'],srcTitle,url:e.getAttribute('href'),image:e.querySelector('img')?.getAttribute('src')});continue;
  }
  if(tag==='TABLE'){
    flush();const heads=[...e.querySelectorAll('thead th')].map(x=>clean(x.textContent));
    for(const row of e.querySelectorAll('tbody tr')){
      const cells=[...row.querySelectorAll('td,th')].map(x=>clean(x.textContent));if(cells.length<2)continue;
      add({kind:'relation',part:heading,title:cells[0],items:cells.slice(1).map((value,i)=>({head:(['記入内容','説明','意味・説明','内容'].includes(heads[i+1])?'':(heads[i+1]||'')),value}))});
    }continue;
  }
  if(tag==='LI'&&e.querySelector('ol,ul,table'))continue;
  const links=getLinks(e);
  // A linked expression appears only as the actual clickable link, never a plain duplicate.
  // For link-bearing source elements the motion scene contains only clickable anchors.
  // Full prose, including its context, remains available in the original reading mode.
  const prose=links.length?'':t;
  if(prose)append(prose);
  if(links.length)recordLinks(links);
}
flush();
// Combine short neighboring rows of a diagram into one illustrated spread when screen space allows.
const compact=[];
const rowCap=vw<=360?260:vw<=480?390:vw<=768?450:750;
const maxRows=vw<=360?2:vw<=480?3:vw<=768?3:4;
for(let i=0;i<scenes.length;i++){
  const scene=scenes[i];
  if(scene.kind!=='relation'){compact.push(scene);continue}
  const rows=[scene];let chars=([scene.title,...scene.items.map(v=>v.head+v.value)].join('')).length;
  while(i+1<scenes.length&&rows.length<maxRows){
    const next=scenes[i+1];if(next.kind!=='relation'||next.part!==scene.part)break;
    const len=([next.title,...next.items.map(v=>v.head+v.value)].join('')).length;
    if(chars+len>rowCap)break;
    rows.push(next);chars+=len;i++;
  }
  compact.push(rows.length>1?{kind:'relation-group',part:scene.part,title:scene.part,rows}:scene);
}
scenes.splice(0,scenes.length,...compact);
// Keep selected works visible in compact cinema galleries, preserving original YouTube links.
if(type==='works'){
 const gathered=[];
 for(let i=0;i<scenes.length;i++){
  const first=scenes[i];
  if(first.kind!=='video'){gathered.push(first);continue}
  const vids=[first];
  while(i+1<scenes.length&&vids.length<3&&scenes[i+1].kind==='video'&&scenes[i+1].part===first.part)vids.push(scenes[++i]);
  gathered.push({kind:'video-group',part:first.part,title:first.part,videos:vids});
 }
 scenes.splice(0,scenes.length,...gathered);
}
// Combine adjacent short explanations when they fit a single screen. Preserve every heading and body paragraph.
function sceneSize(scene){
 if(scene.kind==='text')return (scene.lines||[]).join('').length+28;
 if(scene.kind==='text-combo')return scene.blocks.reduce((t,b)=>t+(b.lines||[]).join('').length+28,0);
 return 99999;
}
function textBlocks(scene){return scene.kind==='text-combo'?scene.blocks:[{title:scene.title,lines:scene.lines||[],links:scene.links||[]}]}
function mergeNearbyText(){
 const merged=[];
 const cap=Math.round(charBudget*(vw<=360?1.10:vw<=760?1.25:1.30));
 for(const scene of scenes){
  const prev=merged.at(-1);
  if(scene.kind==='text'&&!scene.inCase&&prev&&!prev.inCase&&['text','text-combo'].includes(prev.kind)){
   // Avoid mixing unrelated major sections, but group neighboring small subtopics.
   const same=scene.part===prev.part;
   const shortIntro=prev.kind==='text'&&sceneSize(prev)<75;
   const combined=sceneSize(scene)+sceneSize(prev);
   const blocks=textBlocks(prev),heads=new Set(blocks.map(b=>b.title));
   if((same||shortIntro)&&combined<=cap&&heads.size<4){
    const last=blocks.at(-1);
    if(last&&last.title===scene.title){last.lines.push(...(scene.lines||[]));last.links=[...(last.links||[]),...(scene.links||[])];}
    else blocks.push(...textBlocks(scene));
    merged[merged.length-1]={kind:'text-combo',part:prev.part,title:blocks[0].title,blocks};
    continue;
   }
  }
  merged.push(scene);
 }
 scenes.splice(0,scenes.length,...merged);
}
mergeNearbyText();
// Give each of the four plans equal standing; show a compact comparison instead of four separate pages.
if(type==='divination'){
 const ix=scenes.findIndex(s=>s.kind==='plan');
 if(ix>=0){let j=ix;while(j<scenes.length&&scenes[j].kind==='plan')j++;
  const plans=scenes.slice(ix,j);
  if(plans.length>1){
   // Desktop browser chrome and short landscape windows reduce the usable stage
   // height. Split the four plan cards into two fully visible spreads instead
   // of allowing the fixed-height animation viewport to clip the second row.
   const shortDesktop=vw>760 && vh<980;
   const groups=shortDesktop && plans.length>2
     ? [plans.slice(0,2),plans.slice(2)]
     : [plans];
   scenes.splice(ix,plans.length,...groups.map((group,k)=>({
     kind:'plan-grid',part:'鑑定プラン',
     title:groups.length>1?`四つの鑑定プラン（${k+1}/${groups.length}）`:'四つの鑑定プラン',
     plans:group
   })));
  }
 }
}
const linkIndex=new Map();
for(const a of original.querySelectorAll('a[href]')){
 if(a.closest('nav,.chapter-return,.site-footer,.menu-overlay,.doc-toc,.mobile-read-nav,.skip-link'))continue;
 const u=a.getAttribute('href');if(!u||u==='#')continue;
 if(!linkIndex.has(u))linkIndex.set(u,{label:clean(a.textContent)||'関連ページを見る',url:u});
}
if(type==='about')for(const x of [{label:'YouTube',url:'https://www.youtube.com/@iizuna_machika'},{label:'note',url:'https://note.com/iizuna_machika'},{label:'X',url:'https://x.com/iizuna_machika'}])linkIndex.set(x.url,x);
if(type==='archive')linkIndex.set('./teachings.html',{label:'『和の書』を読む',url:'./teachings.html'});
const globalLinks=[...linkIndex.values()];
// Page introductions are absorbed into the first substantive scene; never use a bare heading-and-subtitle scene.
for(let i=scenes.length-1;i>=0;i--){
 const s=scenes[i];const hasContent=!!((s.lines||[]).some(Boolean)||(s.links||[]).length||s.url||['profile','triad','method-network','relation','relation-group','activities','plan','video','video-group','text-combo','plan-grid'].includes(s.kind));
 if(!hasContent){const next=scenes[i+1]||scenes[i-1];if(next){next.part=next.part||s.part;scenes.splice(i,1)}}
}
const el=document.createElement('section');el.className='book-app';el.innerHTML='<div class="book-bar"><span class="book-location"></span><button type="button" class="book-mode-shortcut">全文を読む</button><details class="book-controls"><summary class="book-controls-trigger">閲覧・目次 <span aria-hidden="true">⌄</span></summary><div class="book-controls-panel"><span class="book-controls-caption">表示方法</span><div class="book-modes"><button data-mode="motion" type="button">映像で読む</button><button data-mode="reading" type="button">全文を読む</button></div><label class="book-chapter-wrap" hidden>部の選択<select class="book-chapter" aria-label="部を選ぶ" hidden></select></label><button class="book-motion-toggle" type="button" aria-pressed="false">背景の動きを止める</button><span class="book-controls-caption">目次</span><nav class="book-toc" aria-label="このページの目次"></nav></div></details></div><div class="book-stage" tabindex="0" role="region" aria-label="映像で読むスライド"><div class="book-current"></div></div><div class="book-footer"><button class="book-links-button" type="button" aria-expanded="false" aria-controls="book-link-sheet">関連リンク</button><div class="book-pagination"><button class="book-turn book-prev" type="button" aria-label="前のスライド">←</button><span class="book-count" aria-live="polite"></span><button class="book-turn book-next" type="button" aria-label="次のスライド">→</button></div><div class="book-progress"><i></i></div></div><div id="book-link-sheet" class="book-link-sheet" hidden><div class="book-link-sheet-header"><strong>関連リンク</strong><button type="button" class="book-links-close">閉じる ×</button></div><div class="book-link-sheet-list"></div></div>';
main.prepend(el);el.append(original); // Keep the full text within the sticky toolbar's containing block.
// Closed by default on every page: a single, accessible reader menu holds display mode and TOC.
const controls=el.querySelector('.book-controls');
const legalLinks = document.querySelector('.site-footer .legal-footer-links');
if (type === 'divination' && legalLinks) {
  const legalMenu = legalLinks.cloneNode(true);
  legalMenu.classList.add('book-legal-links');
  controls.querySelector('.book-controls-panel').append(legalMenu);
}
const motionToggle = el.querySelector('.book-motion-toggle');
motionToggle.addEventListener('click', () => {
  backgroundPaused = !backgroundPaused;
  motionToggle.setAttribute('aria-pressed', String(backgroundPaused));
  motionPause();
});
const updateMotionToggle = () => { motionToggle.hidden = reduce.matches; };
reduce.addEventListener('change', updateMotionToggle);
updateMotionToggle();
const toc=el.querySelector('.book-toc');
const tocEntries=[...original.querySelectorAll('.doc-toc a[href^="#"]')];
if(tocEntries.length){
  for(const link of tocEntries){
    const href=link.getAttribute('href'),label=clean(link.textContent);
    if(!href||!label)continue;
    const a=document.createElement('a');a.href=href;a.textContent=label;toc.append(a);
  }
}else{
  const seen=new Set();
  for(const h of original.querySelectorAll('h2')){
    if(h.closest('nav,footer,.story-toolbar,.archive-scroll-experience,.page-scroll-signal'))continue;
    const label=clean(h.textContent);if(!label||seen.has(label))continue;seen.add(label);
    if(!h.id)h.id='book-section-'+String(toc.children.length+1).padStart(2,'0');
    const a=document.createElement('a');a.href='#'+h.id;a.textContent=label;toc.append(a);
  }
}
if(!toc.children.length){const a=document.createElement('a');a.href='#main';a.textContent='ページの最初へ';toc.append(a)}
controls.addEventListener('toggle',()=>{
  if(controls.open){closeLinks?.();}
});
document.addEventListener('pointerdown',e=>{if(controls.open&&!controls.contains(e.target))controls.open=false});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&controls.open){controls.open=false;controls.querySelector('summary').focus()}});
const previous = el.querySelector('.book-prev');
const next = el.querySelector('.book-next');
const modeShortcut = el.querySelector('.book-mode-shortcut');
previous.addEventListener('click', () => turn(-1));
next.addEventListener('click', () => turn(1));
modeShortcut.addEventListener('click', () => mode(reading ? 'motion' : 'reading'));
const stage=el.querySelector('.book-stage'),current=el.querySelector('.book-current'),count=el.querySelector('.book-count'),progress=el.querySelector('.book-progress i'),locationLabel=el.querySelector('.book-location');
// Selecting a TOC entry retains the current mode where possible; falls back to the full reader when needed.
toc.addEventListener('click',e=>{
  const a=e.target.closest('a[href^="#"]');if(!a)return;
  e.preventDefault();e.stopPropagation();controls.open=false;
  const hash=a.getAttribute('href'),id=hash.slice(1),target=original.querySelector('#'+CSS.escape(id));
  const label=clean(a.textContent);
  if(!reading){
    const match=scenes.findIndex(scene=>scene.title===label||scene.part===label||scene.title.startsWith(label));
    if(match>=0){show(match,false);stage.focus({preventScroll:true});return}
  }
  mode('reading');
  requestAnimationFrame(()=>{
    const node=target||original.querySelector('.subhero,h1,h2');
    node?.scrollIntoView({behavior:'instant',block:'start'});
  });
});

const linksButton=el.querySelector('.book-links-button'),linksSheet=el.querySelector('.book-link-sheet');
linksButton.hidden=!globalLinks.length;
for(const link of globalLinks){const a=document.createElement('a');a.className='book-sheet-link';a.href=link.url;a.textContent=link.label+' ↗';if(/^https?:\/\//.test(link.url)){a.target='_blank';a.rel='noopener noreferrer'}el.querySelector('.book-link-sheet-list').append(a)}
const closeLinks=()=>{linksSheet.hidden=true;linksButton.setAttribute('aria-expanded','false')};
linksButton.addEventListener('click',e=>{e.stopPropagation();linksSheet.hidden=!linksSheet.hidden;linksButton.setAttribute('aria-expanded',String(!linksSheet.hidden))});
el.querySelector('.book-links-close').addEventListener('click',e=>{e.stopPropagation();closeLinks();linksButton.focus()});
linksSheet.addEventListener('click',e=>{e.stopPropagation();const a=e.target.closest('a[href^="#"]');if(a){e.preventDefault();const id=a.getAttribute('href').slice(1);closeLinks();mode('reading');requestAnimationFrame(()=>document.getElementById(id)?.scrollIntoView({block:'start'}))}});

let index=0,reading=false,wheelRun=false,wheelTimer=0,touch=null,lastTouchAt=0;let syncChapterOptions=()=>{};
const mk=(tag,cl,s)=>{const e=document.createElement(tag);e.className=cl;if(s!==undefined)e.textContent=s;return e};
// Five quiet background motifs. Assigned per spread, never repeating on adjacent spreads.
// The assignment survives moving back and forth; a layout reflow regenerates the sequence.
const motionNames=['threads','ink','ripples','stars','orbits'];
let motionSequence=[];
function motifFor(n){
 if(motionSequence.length!==scenes.length){
   motionSequence=[];
   for(let i=0;i<scenes.length;i++){
     const last=motionSequence[i-1];
     const choices=motionNames.filter(k=>k!==last);
     motionSequence.push(choices[Math.floor(Math.random()*choices.length)]);
   }
 }
 return motionSequence[n]||motionNames[0];
}
const stroke=(d,color='#dcbf88',width=1.7,extra='')=>`<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" ${extra}/>`;
const motifSVG={
 threads:`<g class="motif-threads">${stroke('M-20 245 C125 45 230 380 350 188 S480 70 590 255')}${stroke('M-10 90 C105 330 244 10 355 182 S455 310 585 75','#8eb9b5',1.4)}${stroke('M15 305 C130 140 258 340 395 162 S502 124 575 320','#e8c997',.8)}<circle cx="351" cy="186" r="6" fill="#e4c894" opacity=".7"/></g>`,
 ink:`<g class="motif-ink"><ellipse class="motif-ink-a" cx="355" cy="172" rx="165" ry="98" fill="#79acae" opacity=".11"/><ellipse class="motif-ink-b" cx="415" cy="228" rx="145" ry="78" fill="#d1b58b" opacity=".10"/><path class="motif-ink-line" d="M70 245 C188 146 206 266 333 171 S510 120 585 165" fill="none" stroke="#dfc593" opacity=".45" stroke-width="1.3"/></g>`,
 ripples:`<g class="motif-ripples" fill="none" stroke="#d2bc96" stroke-width="1.35"><ellipse class="motif-ripple r1" cx="350" cy="210" rx="90" ry="52"/><ellipse class="motif-ripple r2" cx="350" cy="210" rx="150" ry="88"/><ellipse class="motif-ripple r3" cx="350" cy="210" rx="212" ry="123"/><ellipse class="motif-ripple r4" cx="350" cy="210" rx="268" ry="156"/></g>`,
 stars:`<g class="motif-stars">${Array.from({length:34},(_,i)=>{const x=58+(i*173%490),y=42+(i*97%308),r=i%6===0?2.3:1.1;return `<circle class="motif-star" style="--d:${(i%11)*-.48}s" cx="${x}" cy="${y}" r="${r}" fill="${i%4?'#e4ca99':'#91c1c3'}" opacity=".45"/>`}).join('')}${stroke('M100 280 Q300 100 510 260','#b6d0ca',.65,'opacity=".18"')}</g>`,
 orbits:`<g class="motif-orbits" fill="none" stroke-width="1.45"><ellipse class="motif-orbit o1" cx="365" cy="205" rx="245" ry="112" transform="rotate(-24 365 205)" stroke="#d6ba88" opacity=".5"/><ellipse class="motif-orbit o2" cx="365" cy="205" rx="210" ry="136" transform="rotate(29 365 205)" stroke="#87b6b7" opacity=".46"/><ellipse class="motif-orbit o3" cx="365" cy="205" rx="156" ry="155" stroke="#dccba8" opacity=".34"/><circle cx="365" cy="205" r="7" fill="#ddc38f" opacity=".4" stroke="none"/></g>`
};
function backgroundArt(n){const motif=motifFor(n);return {motif,html:`<svg viewBox="0 0 560 400" class="book-symbol book-motif-svg" aria-hidden="true" preserveAspectRatio="xMidYMid meet"><ellipse cx="350" cy="195" rx="242" ry="170" fill="#d7be90" opacity=".025"/>${motifSVG[motif]}</svg>`};}
const triad=`<svg class="book-triad-svg" viewBox="0 0 360 292" aria-label="和、知・徳・体、自律・自立の三原理が相互につながる図" role="img"><path class="book-trace" pathLength="1" d="M180 42 Q300 100 282 230 Q180 283 78 230 Q50 100 180 42Z" fill="none" stroke="#d6b783" stroke-width="2"/><path class="book-trace delay" pathLength="1" d="M180 42 Q95 168 282 230 Q190 148 78 230 Q260 160 180 42" fill="none" stroke="#8cb9b8" stroke-width="2"/>${[[180,42,'和'],[78,230,'知・徳・体'],[282,230,'自律・自立']].map(([x,y,v])=>`<circle cx="${x}" cy="${y}" r="39" fill="#263e50" stroke="#e1c796"/><text x="${x}" y="${y+5}" fill="#fff2d8" font-size="${v.length>3?12:23}" font-family="serif" text-anchor="middle">${v}</text>`).join('')}</svg>`;
stage.prepend(mk('h1', 'sr-only', title));

function makePage(n, includeArt = true) {
 const s = scenes[n], plate = mk('section','book-plate book-' + s.kind);
 if (includeArt) {
   const art = mk('div','book-art');
   const background = backgroundArt(n);
   art.dataset.motif = background.motif;
   art.innerHTML = background.html;
   plate.append(art);
 }
 const copy=mk('div','book-copy');copy.append(mk('p','book-kicker',s.part));const h=mk('h2','book-head',s.title);copy.append(h);
 if (n === 0 && coverImage && !['profile', 'method-network'].includes(s.kind)) {
   const cover = coverImage.cloneNode();
   cover.className = 'book-opening-image';
   cover.removeAttribute('loading');
   copy.append(cover);
 }
 if(s.kind==='triad'){const g=mk('div','book-triad-wrap');g.innerHTML=triad;copy.append(g)}
 if(s.kind==='profile'){
  const row=mk('div','book-profile-layout');
  const avatar=mk('div','book-avatar-space');
  if (profileImage) avatar.append(profileImage.cloneNode());
  const info=mk('dl','book-profile-facts');
  (s.facts||[]).forEach(f=>{const part=mk('div','');part.append(mk('dt','',f.key),mk('dd','',f.value));info.append(part)});
  row.append(avatar,info);copy.append(row);
  if(s.tagline)copy.insertBefore(mk('p','book-profile-tagline',s.tagline),row);
  if(s.lead)copy.append(mk('p','book-profile-bio',s.lead));
  if(s.links){const links=mk('div','book-profile-links');s.links.forEach(link=>{const a=mk('a','',link.label+' ↗');a.href=link.url;a.target='_blank';a.rel='noopener noreferrer';links.append(a)});copy.append(links)}
 }else if(s.kind==='video-group'){
  const grid=mk('div','book-video-gallery');
  s.videos.forEach((v,i)=>{
   const a=mk('a','book-video-tile');a.href=v.url;a.target='_blank';a.rel='noopener noreferrer';a.style.setProperty('--card',i);
   if(v.image){const pic=mk('img','book-video-preview');pic.src=v.image;pic.alt='YouTube公式サムネイル';pic.loading='lazy';a.append(pic)}
   a.append(mk('strong','',clean(v.srcTitle?.textContent)||v.title));
   a.append(mk('span','','YouTubeで視聴 ↗'));grid.append(a)
  });copy.append(grid);
  const channel=mk('a','book-channel-link','チャンネルを見る ↗');channel.href=s.part.includes('音縄')?'https://www.youtube.com/@otonawa13':'https://www.youtube.com/@iizuna_machika';channel.target='_blank';channel.rel='noopener noreferrer';copy.append(channel);
 }else if(s.kind==='activities'){
  const grid=mk('div','book-activity-grid');
  (s.activities||[]).forEach((a,i)=>{const card=mk('article','book-activity-card');card.style.setProperty('--act',i);card.append(mk('b','',a.title),mk('p','',a.text));if(a.url){const link=mk('a','', '詳しく見る ↗');link.href=a.url;card.append(link)}grid.append(card)});copy.append(grid);
 }else if(s.kind==='method-network'){
  const visual=mk('div','book-network-wrap');
  const diagram=divinationDiagram.cloneNode();
  diagram.className='book-network-svg';
  diagram.removeAttribute('loading');
  visual.append(diagram);
  copy.append(visual,mk('p','book-network-caption',s.caption));
 }else if(s.kind==='plan-grid'){
  const grid=mk('div','book-plans-layout');
  for(const p of s.plans){const item=mk('article','book-plan-item');item.append(mk('h3','',p.title),mk('strong','book-plan-value',p.price));
   for(const line of p.lines||[])item.append(mk('p','book-plan-desc',line));
   if(p.url){const a=mk('a','book-plan-cta','詳細・ご依頼 ↗');a.href=p.url;item.append(a)}grid.append(item)}copy.append(grid);
 }else if(s.kind==='text-combo'){
  const group=mk('div','book-text-sections');
  for(const [bi,b] of s.blocks.entries()){
    const sec=mk('section','book-combo-block');
    if(bi>0||b.title!==s.title)sec.append(mk('h3','book-combo-head',b.title));
    (b.lines||[]).forEach((line,j)=>{const el=mk('p','book-line',line);el.style.setProperty('--line',bi*3+j);sec.append(el)});
    group.append(sec);
  }
  copy.append(group);
 }else if(s.kind==='relation-group'){
  const grid=mk('div','book-relation-batch');
  s.rows.forEach((r,j)=>{const article=mk('article','book-relation-entry');article.style.setProperty('--row',j);article.append(mk('h3','',r.title));r.items.forEach(item=>{const line=mk('div','book-relation-pair');if(item.head&&!['記入内容','内容','意味・説明'].includes(item.head))line.append(mk('span','',item.head));line.append(mk('p','',item.value));article.append(line)});grid.append(article)});copy.append(grid);
 }else if(s.kind==='relation'){
  const rel=mk('div','book-relation-diagram book-relation-multi');
  rel.append(mk('b','book-term',s.title));
  const details=mk('div','book-relation-items');
  (s.items||[]).forEach((item,i)=>{const part=mk('div','book-relation-item');part.style.setProperty('--item',i);if(item.head&&!['記入内容','内容','意味・説明'].includes(item.head))part.append(mk('small','',item.head));part.append(mk('p','',item.value));details.append(part)});
  rel.append(details);copy.append(rel);
 }else{
  if(s.price)copy.append(mk('div','book-price',s.price));
  if(s.kind==='video'&&s.image){const pic=mk('img','book-thumb');pic.src=s.image;pic.alt='YouTube公式サムネイル';pic.loading='lazy';copy.append(pic)}
  (s.lines||[]).forEach((v,k)=>{const p=mk('p','book-line',v);p.style.setProperty('--line',k);copy.append(p)});
 }
 // Profile and gallery scenes already display real anchors; do not print a second row of links.
 const linksAlreadyDisplayed=['profile','video-group','activities','plan-grid'].includes(s.kind);
 const sceneLinks=linksAlreadyDisplayed?[]:[...(s.links||[]),...(s.kind==='text-combo'?s.blocks.flatMap(b=>b.links||[]):[])];
 if(s.url&&!linksAlreadyDisplayed)sceneLinks.push({label:s.kind==='video'?'YouTubeで見る':s.kind==='plan'?'Xで鑑定を相談する':'リンクを開く',url:s.url});
 if(sceneLinks.length){const actions=mk('div','book-inline-actions');const seen=new Set();for(const link of sceneLinks){if(!link.url||seen.has(link.url))continue;seen.add(link.url);const a=mk('a','book-link',link.label||'ページを開く');a.href=link.url;if(/^https?:\/\//.test(link.url)){a.target='_blank';a.rel='noopener noreferrer'}actions.append(a)}copy.append(actions)}
 const visual = copy.querySelector('.book-opening-image, .book-network-wrap');
 if (visual) {
   const text = mk('div', 'book-visual-text');
   [...copy.children].filter(child => child !== visual).forEach(child => text.append(child));
   copy.classList.add('book-visual-layout');
   copy.prepend(text);
 }
 plate.append(copy);return plate}
// v15: Rebalance long e-book scenes using *actual* viewport geometry instead of only character count.
// The scroll/turn gesture remains one action per scene; no text is omitted.
let layoutCheck={checked:0,split:0,unresolved:0};
function divideString(value){
  const chars=[...String(value||'')];if(chars.length<2)return null;
  const midpoint=Math.floor(chars.length/2),floor=Math.max(1,Math.floor(chars.length*.33));
  let n=midpoint;
  for(let k=midpoint;k>=floor;k--){if('。！？；、，'.includes(chars[k-1])){n=k;break}}
  return [chars.slice(0,n).join(''),chars.slice(n).join('')].filter(Boolean);
}
function splitForViewport(scene){
 if(scene.kind==='text-combo'&&scene.blocks?.length>1){
   // Keep complete subsections together where possible.
   const blocks=scene.blocks;let total=blocks.reduce((n,b)=>n+(b.lines||[]).join('').length+28,0),at=1,used=0;
   for(let i=0;i<blocks.length-1;i++){used+=(blocks[i].lines||[]).join('').length+28;if(Math.abs(used-total/2)<Math.abs(blocks.slice(0,at).reduce((n,b)=>n+(b.lines||[]).join('').length+28,0)-total/2))at=i+1;}
   const a=blocks.slice(0,at),b=blocks.slice(at);if(!b.length)return null;
   return [a,b].map((group)=>({...scene,kind:group.length===1?'text':'text-combo',title:group[0].title,part:scene.part,lines:group.length===1?group[0].lines:undefined,links:group.length===1?group[0].links:undefined,blocks:group.length===1?undefined:group}));
 }
 if(['text','intro','opening','text-combo'].includes(scene.kind)){
   const lines=[...(scene.lines||scene.blocks?.[0]?.lines||[])];
   if(lines.length>1){
     let left=[],right=[],total=lines.reduce((n,x)=>n+[...x].length,0),running=0;
     for(const ln of lines){if(running<total*.5||!left.length){left.push(ln);running+=[...ln].length}else right.push(ln)}
     if(right.length)return [{...scene,kind:'text',lines:left},{...scene,kind:'text',lines:right}];
   }
   const halves=divideString(lines[0]);if(halves&&[...lines[0]].length>=52)return halves.map(t=>({...scene,kind:'text',lines:[t]}));
 }
 if(scene.kind==='relation-group'&&scene.rows?.length>1){
  const n=Math.ceil(scene.rows.length/2);return [{...scene,rows:scene.rows.slice(0,n)},{...scene,rows:scene.rows.slice(n)}];
 }
 if(scene.kind==='relation-group'&&scene.rows?.length===1){
  return [{...scene.rows[0],kind:'relation',part:scene.part}];
 }
 if(scene.kind==='relation'&&scene.items?.length>1){
  const n=Math.ceil(scene.items.length/2);return [{...scene,items:scene.items.slice(0,n)},{...scene,items:scene.items.slice(n)}];
 }
 if(scene.kind==='relation'&&scene.items?.length===1&&[...(scene.items[0].value||'')].length>85){
   const pair=divideString(scene.items[0].value);if(pair)return pair.map(t=>({...scene,items:[{...scene.items[0],value:t}]}));
 }
 if(scene.kind==='plan-grid'&&scene.plans?.length>2){
  const n=Math.ceil(scene.plans.length/2);return [{...scene,plans:scene.plans.slice(0,n)},{...scene,plans:scene.plans.slice(n)}];
 }
 return null;
}
function rebalanceViewport(){
 if(reading)return;
 const probe=mk('div','book-current book-layout-probe');
 Object.assign(probe.style,{opacity:'0',pointerEvents:'none',zIndex:'-1'});stage.append(probe);
 let checked=0,split=0,unresolved=0;
 for(let i=0;i<scenes.length&&checked<900;i++){
   const scene=scenes[i];
   const relation = scene.kind === 'relation' || scene.kind === 'relation-group';
   if (scene.inCase || (vh <= 500 && !relation)) continue;
   probe.replaceChildren(makePage(i, false));
   const plate=probe.querySelector('.book-plate'),copy=probe.querySelector('.book-copy');if(!copy||!plate)continue;
   const vr=plate.getBoundingClientRect();
   const cr=copy.getBoundingClientRect();
   const isOver=copy.scrollHeight>copy.clientHeight+(relation?3:25)||cr.top<vr.top+4||cr.bottom>vr.bottom-4;
   checked++;if(!isOver)continue;
   const parts=splitForViewport(scene);
   if(parts){scenes.splice(i,1,...parts);split++;i--;continue}
   // A non-splittable illustrated spread is reported, rather than concealed by inner scrolling.
   unresolved++;
 }
 probe.remove();layoutCheck={checked,split,unresolved};
 window.__iizunaLayoutReport=()=>({...layoutCheck,viewport:[innerWidth,innerHeight],total:scenes.length});
}
function show(n, animate = true) {
  index = Math.max(0, Math.min(scenes.length - 1, n));
  const page = makePage(index);
  const copy = page.querySelector('.book-copy');
  const restoreFocus = current.contains(document.activeElement);
  current.replaceChildren(page);
  updateSlideScrollability();
  if (animate && !reduce.matches) copy.classList.add('is-entering');
  locationLabel.textContent = `${name} / ${scenes[index].part}`;
  count.textContent = `${index + 1} / ${scenes.length}`;
  progress.style.width = `${(index + 1) / scenes.length * 100}%`;
  previous.disabled = index === 0;
  next.disabled = index === scenes.length - 1;
  if (restoreFocus || document.activeElement === body && animate) stage.focus({preventScroll:true});
}
function updateSlideScrollability() {
  const copy = current.querySelector('.book-copy');
  if (!copy || reading) return;
  if (copy.scrollHeight > copy.clientHeight + 2) copy.tabIndex = 0;
  else copy.removeAttribute('tabindex');
}
new ResizeObserver(updateSlideScrollability).observe(stage);

function turn(direction) {
  if (reading || body.classList.contains('menu-open') || controls.open || !linksSheet.hidden) return;
  const target = index + direction;
  if (target >= 0 && target < scenes.length) {
    const buttonWasFocused = [previous, next].includes(document.activeElement);
    show(target);
    if (buttonWasFocused && document.activeElement !== previous && document.activeElement !== next) {
      (direction > 0 ? previous : next).focus({preventScroll: true});
    }
  }
}
let layoutMeasured = false;
function mode(m, focus = true) {
  reading = m === 'reading';
  body.classList.toggle('book-reading', reading);
  modeShortcut.textContent = reading ? '映像で読む' : '全文を読む';
  el.querySelectorAll('[data-mode]').forEach(button => {
    const active = button.dataset.mode === m;
    button.classList.toggle('is-current', active);
    button.setAttribute('aria-pressed', active);
  });
  original.inert = !reading;
  window.scrollTo({top: 0, behavior: 'instant'});
  if (!reading) {
    if (!layoutMeasured) {
      rebalanceViewport();
      syncChapterOptions();
      layoutMeasured = true;
    }
    show(index, false);
  }
  if (focus) (reading ? modeShortcut : stage).focus({preventScroll:true});
}
el.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>{const next=b.dataset.mode;controls.open=false;mode(next)}));
const siteHeader = document.querySelector('.site-header');
function header() {
  body.style.setProperty('--book-header-size', `${siteHeader.getBoundingClientRect().height}px`);
}
new ResizeObserver(header).observe(siteHeader);
function canScrollCopy(target, delta) {
  const copy = target.closest('.book-copy');
  if (!copy || copy.scrollHeight <= copy.clientHeight + 2) return false;
  return delta > 0 ? copy.scrollTop + copy.clientHeight < copy.scrollHeight - 2 : copy.scrollTop > 1;
}
stage.addEventListener('wheel', event => {
  if (compactStage.matches || event.ctrlKey || !event.cancelable || canScrollCopy(event.target, event.deltaY)) return;
  event.preventDefault();
  clearTimeout(wheelTimer);
  wheelTimer = setTimeout(() => { wheelRun = false; }, 150);
  const delta = Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
  if (wheelRun || Math.abs(delta) < 8) return;
  wheelRun = true;
  turn(Math.sign(delta));
}, {passive:false});
stage.addEventListener('touchstart', event => {
  if (event.touches.length !== 1) { touch = null; return; }
  const point = event.touches[0];
  touch = {x: point.clientX, y: point.clientY, copy: event.target.closest('.book-copy')};
}, {passive:true});
stage.addEventListener('touchcancel', () => { touch = null; }, {passive:true});
stage.addEventListener('touchend', event => {
  lastTouchAt = performance.now();
  if (!touch || event.target.closest('a,button,select')) { touch = null; return; }
  const point = event.changedTouches[0];
  const dx = touch.x - point.clientX;
  const dy = touch.y - point.clientY;
  const vertical = Math.abs(dy) > Math.abs(dx);
  if (vertical && (compactStage.matches || touch.copy && touch.copy.scrollHeight > touch.copy.clientHeight + 2)) { touch = null; return; }
  const distance = vertical ? dy : dx;
  if (Math.abs(distance) > 48) turn(Math.sign(distance));
  touch = null;
}, {passive:true});
stage.addEventListener('click',e=>{
 const anchor=e.target.closest('a[href]');if(anchor){e.stopPropagation();
   const href=anchor.getAttribute('href')||'';
   if(href.startsWith('#')){e.preventDefault();mode('reading');requestAnimationFrame(()=>document.getElementById(href.slice(1))?.scrollIntoView({block:'start'}))}
   return;
 }
 if(reading||performance.now()-lastTouchAt<580||e.target.closest('button,select,.book-copy'))return;
 turn(1)
});
document.addEventListener('keydown',e=>{if(reading||body.classList.contains('menu-open')||controls.open||!linksSheet.hidden||e.ctrlKey||e.metaKey||e.altKey||e.target.closest('a,button,summary,select,input,textarea,[contenteditable],.book-copy[tabindex]'))return;if(compactStage.matches && !['ArrowLeft','ArrowRight'].includes(e.key))return;const d=['ArrowDown','ArrowRight','PageDown',' '].includes(e.key)?1:['ArrowUp','ArrowLeft','PageUp'].includes(e.key)?-1:0;if(d){e.preventDefault();turn(d)}});
if(type==='archive'){
 const choose=el.querySelector('.book-chapter');let chapters=[];
 syncChapterOptions=()=>{
  chapters=[{text:'冒頭から',idx:0}];
  scenes.forEach((s,i)=>{if(/^第[一二三四五六七]部/.test(s.title)&&!chapters.some(c=>c.text===s.title))chapters.push({text:s.title,idx:i})});
  choose.replaceChildren();for(const c of chapters){const o=document.createElement('option');o.value=c.idx;o.textContent=c.text;choose.append(o)}choose.hidden=false;
  choose.value=chapters.filter(c=>c.idx<=index).at(-1)?.idx||0;
 };
 syncChapterOptions();
 choose.closest('.book-chapter-wrap').hidden=false;
 choose.addEventListener('change',()=>{controls.open=false;const val=Number(choose.value);show(val,false);if(reading){const part=chapters.find(c=>c.idx===val)?.text||'';const ch=[...original.querySelectorAll('.doc-chapter > h2')].find(e=>clean(e.textContent)===part);(ch||original.querySelector('.subhero'))?.scrollIntoView({behavior:'smooth',block:'start'})}else stage.focus({preventScroll:true})});
 new MutationObserver(()=>{choose.value=chapters.filter(c=>c.idx<=index).at(-1)?.idx||0}).observe(count,{childList:true});
}

const titleScenes=scenes.flatMap(s=>s.kind==='video-group'?s.videos:s.srcTitle?[s]:[]).filter(s=>s.srcTitle);const sync=new MutationObserver(()=>{let changed=false;for(const s of titleScenes){const v=clean(s.srcTitle.textContent);if(v&&!v.startsWith('YouTubeの作品')&&v!==s.title){s.title=v;changed=true}}if(changed&&(scenes[index].srcTitle||scenes[index].kind==='video-group'))show(index,false)});titleScenes.forEach(s=>sync.observe(s.srcTitle,{childList:true,subtree:true,characterData:true}));
body.classList.add('book-on');header();show(0,false);mode(reduce.matches || location.hash && location.hash !== '#main' ? 'reading' : 'motion', false);
if (location.hash.length > 1) requestAnimationFrame(() => document.getElementById(location.hash.slice(1))?.scrollIntoView());
window.__iizunaBookDiagnostics=()=>({index:index+1,total:scenes.length,mode:reading?'reading':'motion',title:scenes[index].title,sceneKind:scenes[index].kind,background:motifFor(index),links:(scenes[index].links||[]).length,globalLinks:globalLinks.length,charBudget,remainingScenes:scenes.length-index-1});window.__iizunaSceneManifest=()=>scenes.map(s=>({kind:s.kind,title:s.title,part:s.part,chars:(s.lines||[]).join('').length,blocks:s.blocks?.length,plans:s.plans?.length,rows:s.rows?.length}));
})();
