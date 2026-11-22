/* Ver.10 / short pinned narrative openings on editorial subpages.
   Native page scrolling drives the text and existing page motif; no wheel hijacking. */
(()=>{
 'use strict';
 if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 let hero=document.querySelector('main > .subhero');
 if(!hero && document.querySelector('main > .about-profile-hero')){
   const profile=document.querySelector('main > .about-profile-hero');
   const profileName=profile.querySelector('.profile-headline h1')?.textContent?.trim()||'五十縄まちか';
   const lead=profile.querySelector('.profile-lead')?.textContent?.trim()||'';
   hero=document.createElement('section');
   hero.className='subhero story-banner about-narrative-hero';
   const label=document.createElement('div');label.className='eyebrow';label.textContent='ABOUT / IIZUNA MACHIKA';
   const title=document.createElement('h1');title.textContent=profileName;
   const desc=document.createElement('p');desc.textContent=lead;
   hero.append(label,title,desc);
   profile.parentNode.insertBefore(hero,profile);
 }
 if(!hero||!hero.parentNode)return;
 const next=document.querySelector('main .about-profile-hero .profile-information h2, main .content-shell h2, main .content-shell .section-heading');
 const nextText=(next?.textContent||'その先を読む').trim();
 const wrap=document.createElement('div');wrap.className='page-narrative-track';
 hero.parentNode.insertBefore(wrap,hero);wrap.appendChild(hero);
 hero.classList.add('cinematic-page-hero');
 const text=document.createElement('p');text.className='cinematic-next-text';text.textContent=nextText;
 hero.appendChild(text);
 const hint=document.createElement('span');hint.className='cinematic-hint';hint.textContent='SCROLL TO CONTINUE ↓';hero.appendChild(hint);
 const head=hero.querySelector('h1');const desc=hero.querySelector(':scope > p:not(.cinematic-next-text)');
 function split(el){
  if(!el)return [];
  const parts=Array.from(el.textContent||'');el.textContent='';
  return parts.map(c=>{const span=document.createElement('span');span.className='page-cinema-char';span.textContent=c===' '? '\u00a0':c;el.appendChild(span);return span;});
 }
 const headChars=split(head),descChars=split(desc),nextChars=split(text);
 const clamp=v=>Math.min(1,Math.max(0,v));
 const smooth=(a,b,v)=>{const x=clamp((v-a)/(b-a));return x*x*(3-2*x)};
 let raf=0;
 function update(){
  raf=0;
  const rect=wrap.getBoundingClientRect();
  const t=clamp(-rect.top/Math.max(1,wrap.offsetHeight-innerHeight));
  document.body.classList.toggle('cinema-hero-active',rect.top < window.innerHeight*.5 && rect.bottom > window.innerHeight*.5);
  hero.style.setProperty('--hero-progress',t.toFixed(3));
  for(let i=0;i<headChars.length;i++){
   const v=smooth(.0+i/Math.max(1,headChars.length)*.12,.28+i/Math.max(1,headChars.length)*.12,t);
   headChars[i].style.opacity=String(Math.max(.28,v)*(1-smooth(.61,.85,t)*.78));
   headChars[i].style.transform=`translateY(${(1-v)*18-smooth(.61,.85,t)*15}px)`;
  }
  for(let i=0;i<descChars.length;i++){
   const v=smooth(.12+i/Math.max(1,descChars.length)*.16,.42+i/Math.max(1,descChars.length)*.16,t);
   descChars[i].style.opacity=String(Math.max(.40,v)*(1-smooth(.7,.88,t)*.7));
  }
  for(let i=0;i<nextChars.length;i++){
   const v=smooth(.56+i/Math.max(1,nextChars.length)*.16,.76+i/Math.max(1,nextChars.length)*.15,t);
   nextChars[i].style.opacity=String(v);
   nextChars[i].style.transform=`translateY(${(1-v)*16}px)`;
  }
 }
 const req=()=>{if(!raf)raf=requestAnimationFrame(update)};
 window.addEventListener('scroll',req,{passive:true});window.addEventListener('resize',req,{passive:true});
 document.body.classList.add('page-cinema-on');req();
})();
