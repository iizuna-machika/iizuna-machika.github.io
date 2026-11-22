/** V6.3 / Mobile reading experience. Visual enhancement only; source text is unchanged. */
(() => {
  'use strict';
  if (!document.body.classList.contains('page-inner')) return;
  const small = window.matchMedia('(max-width: 820px)');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const main = document.getElementById('main');
  const header = document.querySelector('.site-header');
  if (!main || !header) return;
  const isArchive = document.body.classList.contains('page-archive');
  const isTeaching = document.body.classList.contains('page-teachings');
  const isNotes = !!main.querySelector('.note-doc');
  const headingsSelector = isArchive
    ? '.doc-chapter > h2, .archive-first-part h3[id^="principle-"]'
    : isNotes ? '.note-doc > h3'
    : isTeaching ? '.doc-chapter > h2'
    : '.content-shell h2, .about-profile-hero h1, .content-shell .section-heading, .works-stage h2, .reading > h3';
  const headings = [...main.querySelectorAll(headingsSelector)]
    .filter(el => el.textContent.trim().length && !el.closest('.mobile-read-nav'));
  const unique = [...new Set(headings)];
  if (unique.length > 0) {
    unique.forEach((h,i) => { if(!h.id) h.id = 'mobile-reading-'+(i+1); });
    const nav = document.createElement('nav');
    nav.className='mobile-read-nav';
    nav.setAttribute('aria-label','スマートフォン用ページ内ナビゲーション');
    nav.innerHTML = '<button class="mobile-read-step" type="button" aria-label="前の項目へ">‹</button>'+
      '<div class="mobile-read-center"><span class="mobile-read-count"></span><select class="mobile-read-select" aria-label="移動する項目を選択"></select></div>'+
      '<button class="mobile-read-step" type="button" aria-label="次の項目へ">›</button>';
    const buttons=nav.querySelectorAll('button');
    const select=nav.querySelector('select');
    const count=nav.querySelector('.mobile-read-count');
    unique.forEach((h,i)=>{
      const opt=document.createElement('option');
      opt.value=String(i);opt.textContent=h.textContent.replace(/\s+/g,' ').trim().slice(0,62);
      select.appendChild(opt);
    });
    header.insertAdjacentElement('afterend',nav);
    let active=0;
    function show(i) {
      active=Math.max(0,Math.min(unique.length-1,i));
      select.value=String(active);
      count.textContent=`${active+1} / ${unique.length}　項目`;
      buttons[0].disabled=active===0;
      buttons[1].disabled=active===unique.length-1;
      nav.style.setProperty('--mobile-chapter-progress', String((active+1)/unique.length));
    }
    const go=i=>{
      const n=Math.max(0,Math.min(unique.length-1,i));
      const h=unique[n];
      if(!h) return;
      show(n);
      // Long first chapter has a persistent mini-diagram below the chapter nav.
      // Account for both sticky elements so the heading is never hidden.
      const dock = h.closest('.archive-first-part')?.querySelector('.principles-mobile-dock');
      const dockHeight = dock ? dock.getBoundingClientRect().height + 16 : 0;
      const top=h.getBoundingClientRect().top+window.scrollY-78-dockHeight;
      window.scrollTo({top:Math.max(0,top),behavior:reduce.matches?'auto':'smooth'});
    };
    buttons[0].addEventListener('click',()=>go(active-1));
    buttons[1].addEventListener('click',()=>go(active+1));
    select.addEventListener('change',()=>go(Number(select.value)));
    let ticking=false;
    const refresh=()=>{
      ticking=false;
      if(!small.matches) return;
      let selected=0;
      const edge=window.innerHeight*.42;
      unique.forEach((h,i)=>{if(h.getBoundingClientRect().top <= edge)selected=i});
      show(selected);
    };
    const ask=()=>{if(!ticking){ticking=true;requestAnimationFrame(refresh)}};
    window.addEventListener('scroll',ask,{passive:true});
    window.addEventListener('resize',ask,{passive:true});
    window.addEventListener('pageshow',ask,{passive:true});
    show(0);ask();
  }
  // Tables in long-form manuscripts remain fully accessible via native horizontal swipe.
  const tables=[...main.querySelectorAll('.doc-chapter table, .note-doc table, .method-table')];
  for(const table of tables) {
    if(table.closest('.mobile-table-scroll')) continue;
    const wrap=document.createElement('div');wrap.className='mobile-table-scroll';
    wrap.setAttribute('role','region');wrap.setAttribute('aria-label','左右にスクロールできる表');
    wrap.tabIndex=0;
    table.parentElement.insertBefore(wrap,table);wrap.appendChild(table);
    const hint=document.createElement('p');hint.className='mobile-table-hint';hint.textContent='項目と役割を図で確認できます。元の表も開けます。';
    wrap.parentElement.insertBefore(hint,wrap);
  }
  // Mobile-only decorative motion. Every text block stays visible at all times.
  const art=[...main.querySelectorAll('.page-visual, .story-illustration, .character-frame, .profile-portrait, .novel-spotlight, .activity-tile, .paper-card')];
  art.forEach(el=>el.classList.add('mobile-animate-art'));
  if('IntersectionObserver' in window) {
    const io=new IntersectionObserver(entries=>{
      entries.forEach(e=>{
        if(e.isIntersecting){e.target.style.setProperty('--mobile-enter','1');io.unobserve(e.target)}
      });
    },{threshold:0,rootMargin:'0px 0px 12% 0px'});
    art.forEach(el=>io.observe(el));
  }else{art.forEach(el=>el.style.setProperty('--mobile-enter','1'))}
  // Scroll progress drives the illustration offset without continuous layout writes.
  const visuals=[...main.querySelectorAll('.page-visual')];
  let running=false;
  function animateVisuals(){
    running=false;
    if(!small.matches || reduce.matches) return;
    for(const figure of visuals){
      const r=figure.getBoundingClientRect();
      if(r.bottom<0||r.top>window.innerHeight) continue;
      const t=Math.max(0,Math.min(1,(window.innerHeight-r.top)/(window.innerHeight+r.height)));
      figure.style.setProperty('--mobile-shift',`${(4-8*t).toFixed(1)}px`);
    }
  }
  const tick=()=>{if(!running){running=true;requestAnimationFrame(animateVisuals)}};
  window.addEventListener('scroll',tick,{passive:true});
  window.addEventListener('resize',tick,{passive:true});
  tick();
  document.documentElement.dataset.mobileMotion='ready';
})();
