/** Ver.8.0 Shared editorial scroll ink and motif animation: never hides prose. */
(()=>{
 'use strict';
 if(!document.body.classList.contains('page-inner'))return;
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 const clamp=x=>Math.min(1,Math.max(0,x));
 const root=document.querySelector('main');if(!root)return;
 const nodes=[...root.querySelectorAll('.reading h2, .reading h3, .reading p, .section-heading, .subhero h1, .profile-headline h1, .profile-headline p, .profile-information h2, .profile-information p, .activity-tile, .paper-card, .video-card, .story-illustration, .page-visual, .story-motion-panel, .novel-spotlight')]
    .filter(el=>!el.closest('.doc-reading')&&!el.closest('.archive-scroll-experience'));
 nodes.forEach(el=>el.classList.add('scroll-ink-target'));
 const motifPaths=[...document.querySelectorAll('.story-motion-panel .story-moving-path')];
 const scenes=[...document.querySelectorAll('.story-motion-panel')];
 let queued=false;
 function update(){
   queued=false;
   const vh=innerHeight;
   for(const el of nodes){
     const r=el.getBoundingClientRect();if(r.bottom< -30||r.top>vh+40)continue;
     const v=reduce.matches?1:clamp((vh*.91-r.top)/(vh*.48));
     el.style.setProperty('--ink-enter',v.toFixed(3));
   }
   for(const el of scenes){
     const r=el.getBoundingClientRect();if(r.bottom<0||r.top>vh)continue;
     const v=reduce.matches?1:clamp((vh*.95-r.top)/(vh*.82));
     el.style.setProperty('--motif-draw',v.toFixed(3));
   }
 }
 function request(){if(!queued){queued=true;requestAnimationFrame(update)}}
 // Site core and V6.3 can continue to manage their own decoration; no text is made invisible.
 document.documentElement.classList.add('scroll-ink-enabled');
 window.addEventListener('scroll',request,{passive:true});
 window.addEventListener('resize',request,{passive:true});
 window.addEventListener('pageshow',request,{passive:true});
 request();
})();