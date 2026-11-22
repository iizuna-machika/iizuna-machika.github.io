/* v11 — one fixed stage per page; native scroll is the animation playhead.
   Copy is sourced from the EXISTING page DOM; source remains accessible in full.
   No scroll-wheel hijacking, no per-slide 'next' controls, no lost original content. */
(()=>{
 'use strict';
 const main=document.querySelector('body.page-inner:not(.page-archive) main');
 if(!main)return;
 const body=document.body;
 const prefersReduced=matchMedia('(prefers-reduced-motion: reduce)');
 const kind=((document.querySelector('.subhero .eyebrow')?.textContent||'').includes('REFERENCE'))?'teachings-notes':([...body.classList].find(x=>x.startsWith('page-')&&x!=='page-inner')||'page-about').replace('page-','');
 const pageNames={about:'About',teachings:'和の書', 'teachings-notes':'原典抄と文脈注解',divination:'五十縄鑑定',works:'作品',journal:'言葉の記録',contact:'お問い合わせ'};
 const pageName=pageNames[kind]||document.title.split('｜')[0];
 const img=main.querySelector('.page-visual img');
 const background=img?.getAttribute('src')||'';
 const source=main;
 const blocks=[...source.querySelectorAll('h1,h2,h3,h4,p,li,dt,dd,blockquote,table,.plan-card,.video-card')];
 const scenes=[];
 let chapter=pageName, section='INTRO', lines=[],length=0;
 const clean=t=>(t||'').replace(/\s+/g,' ').trim();
 const split=(input,max=188)=>{
   let out=[],chars=Array.from(clean(input));
   while(chars.length){
     if(chars.length<=max){out.push(chars.join(''));break;}
     let end=max;
     for(let i=max;i>Math.round(max*.64);i--){if('。！？；。'.includes(chars[i-1])){end=i;break;}}
     out.push(chars.splice(0,end).join(''));
   }
   return out.filter(Boolean);
 };
 const push=()=>{
   if(lines.length){scenes.push({kind:'text',title:section,part:chapter,lines:lines.slice()});lines=[];length=0;}
 };
 const addText=t=>{
   for(const s of split(t,kind==='teachings'||kind==='teachings-notes'?162:185)){
     if(length+s.length>240&&lines.length)push();lines.push(s);length+=s.length;
     if(lines.length>=2)push();
   }
 };
 const omitted=el=>el.closest('header,footer,nav,.doc-toc,.story-motion-panel,.page-visual,.story-illustration,.page-scroll-signal,.archive-scroll-experience,.mobile-read-nav')||el.closest('.visual-table-source');
 const covered=el=>el.closest('.video-card,.plan-card')&&!el.matches('.video-card,.plan-card');
 for(const el of blocks){
   if(omitted(el)||covered(el)|| (el.tagName==='P'&&el.closest('blockquote')))continue;
   const tag=el.tagName;
   const text=clean(el.textContent);
   if(!text)continue;
   if(['H1','H2','H3','H4'].includes(tag)){
      push();section=text;
      if(tag==='H1'||tag==='H2')chapter=text;
      continue;
   }
   if(el.matches('.plan-card')){
     push();const plan=clean(el.querySelector('h3')?.textContent),price=clean(el.querySelector('.price')?.textContent);
     scenes.push({kind:'plan',title:plan,part:'四つの鑑定プラン',price,lines:[clean(el.querySelector('p:not(.button-space)')?.textContent)],link:el.querySelector('a')?.getAttribute('href')});
     continue;
   }
   if(el.matches('.video-card')){
     push();const url=el.getAttribute('href'),videoTitle=el.querySelector('.youtube-official-title');
     scenes.push({kind:'video',title:clean(videoTitle?.textContent)||'YouTubeで作品を見る',titleSource:videoTitle,part:chapter,lines:['作品はYouTubeで視聴できます。'],link:url,thumb:el.querySelector('img')?.getAttribute('src')});
     continue;
   }
   if(tag==='TABLE'){
     push();const headers=[...el.querySelectorAll('thead th')].map(x=>clean(x.textContent));
     for(const tr of el.querySelectorAll('tbody tr')){
       const cells=[...tr.querySelectorAll('td,th')].map(c=>clean(c.textContent));
       if(cells.length<2)continue;
       cells.slice(1).forEach((cell,i)=>{
         for(const chunk of split(cell,170)){
           scenes.push({kind:'graph',title:cells[0],part:section,head:headers[i+1]||'役割・説明',value:chunk,lines:[]});
         }
       });
     }
     continue;
   }
   if(tag==='DT'){
     push(); section=text; continue;
   }
   if(tag==='DD'){addText(text);continue;}
   if(el.closest('.page-notice')){push();section='公開前のご案内';}
   addText(text);
 }
 push();
 // Ensure opening frame has a directly useful meaning and the same world as Home.
 const opening=source.querySelector('main > .subhero, .subhero, .profile-headline');
 const firstTitle=clean(opening?.querySelector('h1')?.textContent)||pageName;
 const firstLead=clean(opening?.querySelector('p')?.textContent)||'言葉を紡ぎ、人の心を結び、世界をくくる。';
 scenes.unshift({kind:'opening',part:'IIZUNA MACHIKA',title:firstTitle,lines:[firstLead]});
 // Explicit external exits; no links invented. For Works, keep all exact 9 links.
 const otherLinks=[...source.querySelectorAll('a[href^="https://"]')].filter(a=>!a.closest('.video-card')&&!a.closest('.plan-card'));
 const visited=new Set();
 for(const a of otherLinks){
   const u=a.getAttribute('href');if(visited.has(u))continue;visited.add(u);
   if(!/^https:\/\//.test(u))continue;
   scenes.push({kind:'link',part:'この先へ',title:clean(a.textContent)||'外部サイトを見る',lines:[u.includes('youtube.com')?'動画・作品を見る':u.includes('note.com')?'文章・作品を読む':'Xから連絡する'],link:u});
 }
 if(!scenes.length)return;
 const originalChildren=[...main.children];
 const shell=document.createElement('div');shell.className='journey-original';shell.id='journey-original';
 for(const e of originalChildren)shell.append(e);
 main.append(shell);
 const bar=document.createElement('nav');bar.className='journey-toolbar';bar.setAttribute('aria-label','閲覧方法');
 const visBtn=document.createElement('button');visBtn.type='button';visBtn.textContent='映像でたどる';visBtn.className='journey-mode is-active';visBtn.setAttribute('aria-pressed','true');
 const readBtn=document.createElement('button');readBtn.type='button';readBtn.textContent='全文を読む';readBtn.className='journey-mode';readBtn.setAttribute('aria-pressed','false');
 const counter=document.createElement('span');counter.className='journey-counter';counter.textContent=`01 / ${String(scenes.length).padStart(2,'0')}`;
 bar.append(visBtn,readBtn,counter);
 main.prepend(bar);
 const track=document.createElement('section');track.className='journey-track';track.setAttribute('aria-label',pageName+'を図と文字の映像でたどる');
 const stage=document.createElement('div');stage.className='journey-stage';
 const bg=document.createElement('div');bg.className='journey-ambient';bg.setAttribute('aria-hidden','true');
 if(background){const art=document.createElement('img');art.src=background;art.alt='';art.loading='eager';bg.append(art);}
 const layerA=document.createElement('div'),layerB=document.createElement('div');
 layerA.className='journey-layer journey-layer-a';layerB.className='journey-layer journey-layer-b';
 const top=document.createElement('div');top.className='journey-overline';top.innerHTML='<span>五十縄まちか · '+pageName+'</span><span class="journey-scene-index">SCROLL / EXPERIENCE</span>';
 const bottom=document.createElement('div');bottom.className='journey-progress';bottom.innerHTML='<span class="journey-progress-line"></span><span class="journey-progress-orb"></span>';
 stage.append(bg,layerA,layerB,top,bottom);track.append(stage);bar.after(track);
 const clamp=v=>Math.max(0,Math.min(1,v));
 const smooth=(a,b,v)=>{const t=clamp((v-a)/(b-a));return t*t*(3-2*t)};
 const svg=`<svg class="journey-symbol" viewBox="0 0 620 420" aria-hidden="true" focusable="false"><defs><radialGradient id="journey-halo"><stop offset="0" stop-color="#dab882" stop-opacity=".22"/><stop offset="1" stop-color="#dab882" stop-opacity="0"/></radialGradient></defs><ellipse cx="310" cy="210" rx="275" ry="195" fill="url(#journey-halo)"/><circle cx="310" cy="210" r="166" fill="none" stroke="#b0a280" stroke-opacity=".3" stroke-width="1"/><path class="journey-gold-thread" d="M15 270 C130 15 230 390 310 209 S510 80 605 270" fill="none" stroke="#ddbb85" stroke-width="2" pathLength="1"/><path class="journey-blue-thread" d="M15 115 C150 370 250 35 310 209 S530 320 605 90" fill="none" stroke="#8fbcbd" stroke-width="1.3" pathLength="1"/><circle class="journey-spark" cx="310" cy="209" r="5" fill="#e7c993"/></svg>`;
 const cached=[{el:layerA,index:-1,letters:[],threads:[],cards:[]},{el:layerB,index:-1,letters:[],threads:[],cards:[]}];
 function appendText(parent,tag,cls,text){const el=document.createElement(tag);el.className=cls;el.textContent=text;parent.append(el);return el;}
 function render(cache,index){
   if(cache.index===index)return;cache.index=index;const data=scenes[index];
   if(!data){cache.el.replaceChildren();cache.letters=[];cache.cards=[];return;}
   const el=cache.el;el.replaceChildren();
   const artwork=document.createElement('div');artwork.className='journey-graphic';artwork.innerHTML=svg;el.append(artwork);
   const content=document.createElement('div');content.className='journey-content';el.append(content);
   appendText(content,'p','journey-kicker',data.part||pageName);
   const title=appendText(content,index===0?'h1':'h2','journey-title',data.title);
   // One character at a time, while preserving the source's wording.
   const heading=title.textContent;title.textContent='';
   [...heading].forEach(c=>{const sp=document.createElement('span');sp.className='journey-char';sp.textContent=c===' '?'\u00a0':c;title.append(sp)});
   const bodyText=document.createElement('div');bodyText.className='journey-description';content.append(bodyText);
   (data.lines||[]).filter(Boolean).forEach(line=>appendText(bodyText,'p','journey-prose',line));
   if(data.kind==='graph'){
     const graph=document.createElement('div');graph.className='journey-link-diagram';
     appendText(graph,'div','journey-graph-core',data.title);
     const join=document.createElement('div');join.className='journey-graph-thread';graph.append(join);
     const detail=document.createElement('div');detail.className='journey-graph-detail';
     appendText(detail,'small',null,data.head);appendText(detail,'p',null,data.value);graph.append(detail);content.append(graph);
   }
   if(data.kind==='plan'){
     const price=appendText(content,'div','journey-price',data.price);
     price.setAttribute('aria-label','料金 '+data.price);
   }
   if(data.kind==='video'&&data.thumb){
     const im=document.createElement('img');im.className='journey-video-preview';im.src=data.thumb;im.alt='';im.loading='lazy';content.append(im);
   }
   if(data.link){
     const a=document.createElement('a');a.className='journey-exit';a.href=data.link;a.target='_blank';a.rel='noopener noreferrer';
     a.textContent=data.kind==='video'?'YouTubeで作品を見る':data.kind==='plan'?'Xで鑑定を相談する':'リンクを開く';content.append(a);
   }
   cache.letters=[...el.querySelectorAll('.journey-char')];
   cache.cards=[...el.querySelectorAll('.journey-prose,.journey-graph-core,.journey-graph-detail,.journey-price,.journey-video-preview,.journey-exit')];
   cache.threads=[...el.querySelectorAll('.journey-gold-thread,.journey-blue-thread')];
 }
 let step=1,last=-1,reading=false,raf=0;
 const setSize=()=>{step=Math.max(260,Math.round(window.innerHeight*(window.innerWidth<650?.68:.79)));track.style.height=(step*(scenes.length-1)+window.innerHeight)+'px'};
 function animate(c,progress){
   if(c.index<0)return;
   const p=clamp(progress),n=c.letters.length;
   c.letters.forEach((el,i)=>{
      const v=smooth(.01+.15*i/Math.max(1,n),.24+.16*i/Math.max(1,n),p);
      el.style.opacity=String(v);el.style.transform=`translateY(${(1-v)*20}px)`;
   });
   c.cards.forEach((el,i)=>{
      const v=smooth(.23+.16*i/Math.max(1,c.cards.length),.51+.24*i/Math.max(1,c.cards.length),p);
      el.style.opacity=String(v);el.style.transform=`translateY(${(1-v)*26}px)`;
   });
   const draw=smooth(.12,.77,p);
   c.threads.forEach(path=>path.style.strokeDashoffset=String(1-draw));
   c.el.style.setProperty('--journey-draw',String(draw));
 }
 function update(){
   raf=0;if(reading)return;
   const rect=track.getBoundingClientRect();
   const amount=clamp(-rect.top/Math.max(1,step*(scenes.length-1)))*(scenes.length-1);
   const index=Math.min(scenes.length-1,Math.floor(amount)),fraction=amount-index;
   render(cached[0],index);render(cached[1],Math.min(index+1,scenes.length-1));
   const cross=smooth(.73,.99,fraction);
   animate(cached[0],index===0?Math.min(1,fraction/.7):1);
   animate(cached[1],Math.max(0,(fraction-.64)/.36));
   layerA.style.opacity=String(1-cross);layerB.style.opacity=String(cross);
   layerA.style.transform=`translate3d(0,${-12*cross}px,0) scale(${1-cross*.016})`;
   layerB.style.transform=`translate3d(0,${12*(1-cross)}px,0) scale(${.985+.015*cross})`;
   layerA.classList.toggle('journey-front',cross<.5);layerB.classList.toggle('journey-front',cross>=.5);
   if(last!==index){last=index;counter.textContent=`${String(index+1).padStart(2,'0')} / ${String(scenes.length).padStart(2,'0')}`;top.querySelector('.journey-scene-index').textContent=`SCENE ${String(index+1).padStart(2,'0')} / ${scenes.length}`;}
   stage.style.setProperty('--scene-progress',((amount+1)/scenes.length).toFixed(4));
 }
 const request=()=>{if(!raf)raf=requestAnimationFrame(update)};
 const switchMode=next=>{
   reading=next==='reading';body.classList.toggle('journey-reading',reading);visBtn.classList.toggle('is-active',!reading);readBtn.classList.toggle('is-active',reading);
   visBtn.setAttribute('aria-pressed',String(!reading));readBtn.setAttribute('aria-pressed',String(reading));
   if(reading){shell.scrollIntoView({block:'start',behavior:'instant'});}
   else{setSize();track.scrollIntoView({block:'start',behavior:'instant'});request()}
 };
 visBtn.addEventListener('click',()=>switchMode('visual'));
 readBtn.addEventListener('click',()=>switchMode('reading'));
 const whenResize=()=>{if(reading)return;const before=last;setSize();request();};
 window.addEventListener('scroll',request,{passive:true});window.addEventListener('resize',whenResize,{passive:true});
 body.classList.add('journey-enabled');setSize();
 if(prefersReduced.matches)switchMode('reading');else request();
 // Keep external titles synced when official YouTube metadata becomes available.
 const titleObserver=new MutationObserver(()=>{
   for(const c of cached){if(c.index<0)continue;const d=scenes[c.index];if(d?.titleSource){const newTitle=clean(d.titleSource.textContent);if(newTitle&&newTitle!==d.title){d.title=newTitle;c.index=-1;request();}}}
 });
 for(const d of scenes){if(d.titleSource)titleObserver.observe(d.titleSource,{childList:true,subtree:true,characterData:true})}
})();
