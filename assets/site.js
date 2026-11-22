/** 五十縄まちか: Prototype v2 — seamless Home + restrained page motion. */
(() => {
  'use strict';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const menu = document.querySelector('#menu-overlay');
  const menuButton = document.querySelector('#menu-toggle');
  const menuBackground = [...document.querySelectorAll('main, .site-footer, .site-header')];
  const closeMenu = () => {
    if (!menu || !menuButton) return;
    menu.classList.remove('is-open');
    menu.setAttribute('aria-hidden', 'true');
    menu.inert = true;
    menuBackground.forEach(node => { node.inert = false; });
    menuButton.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
  };
  if (menu && menuButton) {
    menu.inert = true;
    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = 'menu-close';
    closeButton.textContent = '閉じる ×';
    menu.querySelector('.menu-inside').prepend(closeButton);
    closeButton.addEventListener('click', () => { closeMenu(); menuButton.focus(); });
    menuButton.addEventListener('click', () => {
      const opening = !menu.classList.contains('is-open');
      if (opening) {
        menu.inert = false;
        menu.classList.add('is-open');
        menu.setAttribute('aria-hidden', 'false');
        menuButton.setAttribute('aria-expanded', 'true');
        document.body.classList.add('menu-open');
        menuBackground.forEach(node => { node.inert = true; });
        closeButton.focus();
      } else { closeMenu(); menuButton.focus(); }
    });
    menu.addEventListener('click', event => {
      if (event.target === menu) { closeMenu(); menuButton.focus(); }
    });
    document.addEventListener('keydown', event => {
      if (!menu.classList.contains('is-open')) return;
      if (event.key === 'Tab') {
        const links = [...menu.querySelectorAll('a[href]')];
        const last = links.at(-1) || closeButton;
        if (event.shiftKey && document.activeElement === closeButton) {
          event.preventDefault(); last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault(); closeButton.focus();
        }
      }
      if (event.key === 'Escape') {
        closeMenu(); menuButton.focus();
      }
    });
    window.addEventListener('pagehide', closeMenu);
  }

  // Readable content is visible with JS disabled. Reveal only while observer exists.
  if ('IntersectionObserver' in window && !reduceMotion.matches) {
    const revealElements = [...document.querySelectorAll('.reveal, .story-illustration, .paper-card, .principle, .video-card, .subhero')];
    if (revealElements.length) {
      document.documentElement.classList.add('can-reveal');
      const observer = new IntersectionObserver(entries => {
        for (const entry of entries) if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      }, {threshold: 0, rootMargin: '0px 0px -22px 0px'});
      revealElements.forEach(el => observer.observe(el));
    }
  }

  // Pull title only from metadata mirroring the exact linked YouTube video ID.
  // Never author an unverified official title. Fall back to a neutral action label.
  for (const card of document.querySelectorAll('.video-card')) {
    const title = card.querySelector('.youtube-official-title');
    if (!title) continue;
    const raw = card.getAttribute('href');
    const id = new URL(raw, location.href).searchParams.get('v');
    if (!/^[A-Za-z0-9_-]{11}$/.test(id || '')) continue;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5500);
    fetch('https://noembed.com/embed?url=' + encodeURIComponent('https://www.youtube.com/watch?v=' + id),
      {signal: controller.signal})
      .then(r => { if (!r.ok) throw new Error('metadata'); return r.json(); })
      .then(data => {
        if (typeof data.title !== 'string' || !data.title.trim() || data.error) return;
        title.textContent = data.title.trim();
        title.removeAttribute('data-loading-title');
        card.setAttribute('aria-label', `${data.title.trim()} をYouTubeで見る`);
      })
      .catch(() => { title.textContent = 'YouTubeで作品を見る'; })
      .finally(() => clearTimeout(timer));
  }

  const stage = document.querySelector('#home-stage');
  if (!stage) return;
  const copies = [...document.querySelectorAll('.scene-copy')];
  const paths = [...stage.querySelectorAll('[data-strand]')];
  const spark = document.querySelector('#morph-spark');
  const prev = document.querySelector('#scene-prev');
  const next = document.querySelector('#scene-next');
  const skip = document.querySelector('#scene-skip');
  const count = document.querySelector('#scene-counter');
  const dots = [...document.querySelectorAll('.step-dots i')];
  const stageFitsViewport = () => stage.offsetTop + stage.offsetHeight <= innerHeight + 4;

  // Each strand has M(x,y), C(6 params), C(6 params): 14 values.
  // The topology never changes, allowing a true continuous morph instead of image replacement.
  const shapes = [
    [
      [-50,450, 250,440,340,135,630,325, 820,505,1050,370,1260,75],
      [-50,500, 250,480,340,280,630,325, 820,420,1050,420,1260,180],
      [-50,410, 250,380,340,120,630,325, 820,250,1050,350,1260,400]
    ],
    [
      [-50,75, 230,420,350,510,600,320, 810,160,1020,120,1260,405],
      [-50,540, 250,110,405,175,600,320, 850,525,1000,475,1260,125],
      [-50,335, 260,490,435,100,600,320, 870,140,1030,230,1260,335]
    ],
    [
      [600,95, 860,160,965,340,850,510, 600,630,405,630,310,500],
      [310,500, 190,320,285,200,600,95, 695,290,890,430,850,510],
      [850,510, 520,430,390,230,310,500, 330,300,455,150,600,95]
    ],
    [
      [600,670, 575,540,620,380,600,310, 475,215,310,125,150,35],
      [600,670, 625,540,580,380,600,310, 780,185,930,120,1070,40],
      [600,670, 598,485,603,360,600,310, 598,180,602,80,600,0]
    ],
    [
      [-50,460, 310,490,450,260,610,330, 815,400,995,250,1260,45],
      [-50,200, 300,40,390,400,610,330, 870,260,930,390,1260,490],
      [50,600, 330,410,450,300,610,330, 810,350,940,190,1150,10]
    ]
  ];
  const serialize = a => `M${a[0]} ${a[1]} C${a[2]} ${a[3]} ${a[4]} ${a[5]} ${a[6]} ${a[7]} C${a[8]} ${a[9]} ${a[10]} ${a[11]} ${a[12]} ${a[13]}`;
  const clone = frame => frame.map(a => a.slice());
  let current = 0, lastWheel = 0, animFrame = 0, activeFrame = clone(shapes[0]);
  let touchStart = null;
  stage.classList.add('home-enhanced');
  copies.forEach((copy, index) => {
    copy.inert = index !== 0;
    copy.setAttribute('aria-hidden', String(copy.inert));
  });
  paths.forEach((path, i) => path.setAttribute('d', serialize(activeFrame[i])));
  const blend = (start, end, t) => start.map((coords, strand) => coords.map((x,j) => x + (end[strand][j] - x)*t));
  const ease = t => t*t*t*(t*(6*t-15)+10); // quintic smoothstep: continuous velocity at both endpoints
  const updatePaths = frame => {
    paths.forEach((path, i) => path.setAttribute('d', serialize(frame[i])));
    const point = frame[0];
    if (spark) { spark.setAttribute('cx', point[6]); spark.setAttribute('cy', point[7]); }
  };
  function morphTo(n) {
    cancelAnimationFrame(animFrame);
    if (reduceMotion.matches) { activeFrame = clone(shapes[n]); updatePaths(activeFrame); return; }
    const startFrame = clone(activeFrame);
    const endFrame = shapes[n];
    const duration = Math.abs(n-current) > 1 ? 460 : 340;
    const startTime = performance.now();
    const step = now => {
      const t = Math.min(1, (now-startTime)/duration);
      activeFrame = blend(startFrame, endFrame, ease(t));
      updatePaths(activeFrame);
      if(t<1) animFrame=requestAnimationFrame(step);
    };
    animFrame=requestAnimationFrame(step);
  }
  function goto(n) {
    const target=Math.max(0,Math.min(4,n));
    if(target===current) return;
    const old=current;
    // Blend from the shape currently on screen, not a hidden preset.
    morphTo(target);
    copies[old].classList.remove('active');
    copies[old].setAttribute('aria-hidden','true');
    copies[old].inert=true;
    current=target;
    stage.dataset.scene=String(current);
    copies[current].classList.add('active');
    copies[current].setAttribute('aria-hidden','false');
    copies[current].inert=false;
    dots.forEach((dot,i) => dot.classList.toggle('active',i===current));
    count.textContent=`${current + 1} / ${copies.length}`;
    if(prev)prev.disabled=current===0;
    if(next)next.textContent=current===4?'↺':'→';
    next?.setAttribute('aria-label',current===4?'最初のシーンに戻る':'次のシーン');
    if (current === 4 && document.activeElement === skip) next?.focus();
    skip.hidden=current===4;
    if (document.activeElement === prev && prev.disabled) next?.focus();
  }
  prev?.addEventListener('click',()=>goto(current-1));
  next?.addEventListener('click',()=>goto(current===4?0:current+1));
  skip?.addEventListener('click',()=>goto(4));
  document.addEventListener('keydown',e => {
    if(menu?.classList.contains('is-open')||e.altKey||e.metaKey||e.ctrlKey)return;
    if (!stageFitsViewport() && ['ArrowDown','ArrowUp','PageDown','PageUp','Home','End'].includes(e.key)) return;
    if(['A','BUTTON','INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName))return;
    const d=['ArrowRight','ArrowDown','PageDown'].includes(e.key)?1:['ArrowLeft','ArrowUp','PageUp'].includes(e.key)?-1:0;
    if(d){e.preventDefault();goto(current+d);}
    else if(e.key==='Home'){e.preventDefault();goto(0);}
    else if(e.key==='End'){e.preventDefault();goto(4);}
  });
  stage.addEventListener('wheel',e => {
    if (!stageFitsViewport() || e.ctrlKey || menu?.classList.contains('is-open') || e.target.closest('a,button') || Math.abs(e.deltaY)<12) return;
    const target = current + Math.sign(e.deltaY);
    if (target < 0 || target >= copies.length) return;
    e.preventDefault();
    const now = Date.now();
    if (now - lastWheel < 380) return;
    lastWheel = now;
    goto(target);
  },{passive:false});
  let touchDoneAt=0;
  stage.addEventListener('click',e=>{
    if(Date.now()-touchDoneAt<500||e.target.closest('a,button')||menu?.classList.contains('is-open'))return;
    goto(current===4?0:current+1);
  });
  stage.addEventListener('touchstart',e=>{
    touchStart={y:e.changedTouches[0].screenY,x:e.changedTouches[0].screenX};
  },{passive:true});
  stage.addEventListener('touchcancel', () => { touchStart = null; });
  stage.addEventListener('touchend',e=>{
    touchDoneAt=Date.now();
    if(!touchStart||menu?.classList.contains('is-open')||e.target.closest('a,button')){touchStart=null;return;}
    const dy=touchStart.y-e.changedTouches[0].screenY;
    const dx=touchStart.x-e.changedTouches[0].screenX;
    if(stageFitsViewport() && Math.abs(dy)>55&&Math.abs(dy)>Math.abs(dx))goto(current+(dy>0?1:-1));
    else if(Math.abs(dx)>65&&Math.abs(dx)>Math.abs(dy)*1.2)goto(current+(dx>0?1:-1));
    touchStart=null;
  },{passive:true});
})();


/** v5 Scroll narrative controller. No network calls and no new content. */
(() => {
  'use strict';
  if (!document.body.classList.contains('page-inner')) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const readSections=[...document.querySelectorAll('.reading > section, .reading > div.reveal')];
  const illustrations=[...document.querySelectorAll('.story-illustration')];
  const visuals=[...document.querySelectorAll('.page-visual')];
  const staggered=[...document.querySelectorAll('.paper-card, .activity-tile, .video-card, .principle')];
  staggered.forEach((node,i) => node.style.setProperty('--stagger', `${(i%4)*70}ms`));
  const svgNS='http://www.w3.org/2000/svg';
  const newSvg = tag => document.createElementNS(svgNS,tag);
  // Overlay follows real original artwork and never creates fictional labels.
  visuals.forEach((figure,i) => {
    const svg=newSvg('svg');
    svg.classList.add('visual-thread');
    svg.setAttribute('viewBox','0 0 1000 400');
    svg.setAttribute('preserveAspectRatio','none');
    svg.setAttribute('aria-hidden','true');
    const defs=newSvg('defs');
    const grad=newSvg('linearGradient');
    const gradId='visual-gold-grad-'+i;
    grad.setAttribute('id',gradId);grad.setAttribute('x1','0%');grad.setAttribute('x2','100%');
    for (const [offset,color] of [['0%','#bb925c'],['55%','#ffedbd'],['100%','#85b8b6']]) {
      const stop=newSvg('stop');stop.setAttribute('offset',offset);stop.setAttribute('stop-color',color);grad.append(stop);
    }
    defs.append(grad);svg.append(defs);
    const d='M -70 322 C 162 373 235 64 460 210 S 810 376 1075 86';
    for (const [cls,stroke] of [['thread-back',''],['thread-main',`url(#${gradId})`],['thread-sheen','']]) {
      const path=newSvg('path');path.setAttribute('d',d);path.setAttribute('class',cls);
      if(stroke) path.setAttribute('stroke',stroke);
      svg.append(path);
    }
    const spark=newSvg('circle');spark.setAttribute('r','4.5');spark.setAttribute('class','thread-spark');
    svg.append(spark);
    figure.insertBefore(svg,figure.querySelector('figcaption')||null);
    const main=svg.querySelector('.thread-main');
    const length=main.getTotalLength();
    main.style.strokeDasharray=`${length}`;main.style.strokeDashoffset=`${length}`;
    const sheen=svg.querySelector('.thread-sheen');
    sheen.style.strokeDasharray=`${length}`;sheen.style.strokeDashoffset=`${length}`;
    figure.__trace={main,sheen,spark,length};
  });
  illustrations.forEach(figure=> {
    figure.__paths=[...figure.querySelectorAll('.ink-lines path')].map(path=>{
      const length=path.getTotalLength();
      path.style.strokeDasharray=`${length}`;
      path.style.strokeDashoffset=`${length}`;
      return {path,length};
    });
  });
  let ticking=false;
  const clamp=x=>Math.min(1,Math.max(0,x));
  const progressFor=(el,viewHeight,start=.92,end=.18)=>{
    const rect=el.getBoundingClientRect();
    const from=viewHeight*start;
    const until=-rect.height*end;
    return clamp((from-rect.top)/(from-until));
  };
  const update=()=>{
    ticking=false;
    const vh=innerHeight;
    const scrollMax=Math.max(1,document.documentElement.scrollHeight-vh);
    document.body.style.setProperty('--scroll-progress',clamp(scrollY/scrollMax).toFixed(4));
    if(reduce.matches) return;
    for(const figure of visuals){
      const p=progressFor(figure,vh);
      const rect=figure.getBoundingClientRect();
      if(rect.bottom < -vh || rect.top > 2*vh) continue;
      const t=figure.__trace;
      const draw=clamp((p-.09)/.79);
      for(const line of [t.main,t.sheen]) line.style.strokeDashoffset=`${t.length*(1-draw)}`;
      const point=t.main.getPointAtLength(t.length*draw);
      t.spark.setAttribute('cx',point.x); t.spark.setAttribute('cy',point.y);
      figure.style.setProperty('--visual-opacity',p>.08 && p<.98?'1':'0');
      figure.style.setProperty('--art-shift',`${((.50-p)*18).toFixed(1)}px`);
    }
    for(const illustration of illustrations){
      const rect=illustration.getBoundingClientRect();
      if(rect.bottom< -vh || rect.top > 2*vh)continue;
      const draw=clamp((progressFor(illustration,vh)-.06)/.85);
      for(const {path,length} of illustration.__paths){path.style.strokeDashoffset=`${length*(1-draw)}`;}
    }
    for(const section of readSections){
      const rect=section.getBoundingClientRect();
      if(rect.bottom< -vh || rect.top > 2*vh)continue;
      section.style.setProperty('--read-progress',progressFor(section,vh,.78,.12).toFixed(4));
    }
  };
  const request=()=>{if(!ticking){ticking=true;requestAnimationFrame(update)}};
  window.addEventListener('scroll',request,{passive:true});
  window.addEventListener('resize',request,{passive:true});
  reduce.addEventListener?.('change',request);
  window.addEventListener('load',request,{once:true});
  request();
})();
