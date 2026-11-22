/** Archive interactive diagram: desktop rail + mobile sticky dock and detail dialog.
 *  Only interactive decoration is changed. All manuscript text is always visible. */
(() => {
  'use strict';
  const section = document.querySelector('.archive-first-part');
  if (!section) return;
  const mobile = window.matchMedia('(max-width: 960px)');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const descriptions = {
    wa: {
      title: '和',
      full: '違いを消さずに、健全な結びを育む。自己犠牲は必須ではありません。',
      short: '違いを消さず、健全な結びを育む'
    },
    chitokutai: {
      title: '知・徳・体',
      full: '知・徳・体が相互に補い、抑制する。均等さが強制されるものではありません。',
      short: '知恵・情と意志・行動が互いに働く'
    },
    jiritsu: {
      title: '自律・自立',
      full: '支えを受けながらも、自ら考え、判断し、歩むことを大切にします。',
      short: '他者とつながり、自ら考え選ぶ'
    }
  };
  const items = [
    {key:'wa',el:document.getElementById('principle-wa')},
    {key:'chitokutai',el:document.getElementById('principle-chitokutai')},
    {key:'jiritsu',el:document.getElementById('principle-jiritsu')}
  ];
  if (items.some(item => !item.el)) return;
  const nodes = [...section.querySelectorAll('.principles-node')];
  const railName = document.getElementById('principles-current-name');
  const railDesc = document.getElementById('principles-current-desc');
  const railLines = [...section.querySelectorAll('[data-principles-thread]')];
  const railFill = document.getElementById('principles-progress-fill');
  const dock = document.querySelector('.principles-mobile-dock');
  const dockButtons = [...document.querySelectorAll('[data-pmd-principle]')];
  const dockTitle = document.getElementById('pmd-current');
  const dockDesc = document.getElementById('pmd-explain');
  const dockLines = [...document.querySelectorAll('[data-pmd-thread]')];
  const dockFill = document.getElementById('pmd-progress-fill');
  const collapse = document.getElementById('pmd-collapse');
  const detail = document.getElementById('principles-detail-dialog');
  const expand = document.getElementById('pmd-expand');
  const close = document.getElementById('pdd-close');
  const read = document.getElementById('pdd-read');
  const detailTabs = [...document.querySelectorAll('[data-pdd-tab]')];
  const detailViews = [...document.querySelectorAll('[data-pdd-view]')];
  let activeKey = '';
  let selectedDetail = 'wa';
  let returnFocus = expand;
  const clamp = x => Math.max(0,Math.min(1,x));

  function setDetail(key) {
    if (!descriptions[key]) return;
    selectedDetail = key;
    for (const tab of detailTabs) {
      const selected = tab.dataset.pddTab === key;
      tab.classList.toggle('is-active',selected);
      tab.setAttribute('aria-pressed',String(selected));
    }
    for (const view of detailViews) {
      const selected = view.dataset.pddView === key;
      view.hidden = !selected;
      view.classList.toggle('is-active',selected);
    }
  }
  function setActive(key) {
    if (!descriptions[key] || activeKey === key) return;
    activeKey = key;
    for (const node of nodes) {
      const selected = node.dataset.principle === key;
      node.classList.toggle('is-active',selected);
      if (selected) node.setAttribute('aria-current','location');
      else node.removeAttribute('aria-current');
    }
    if (railName) railName.textContent = descriptions[key].title;
    if (railDesc) railDesc.textContent = descriptions[key].full;
    for (const button of dockButtons) {
      const selected = button.dataset.pmdPrinciple === key;
      button.classList.toggle('is-active',selected);
      button.setAttribute('aria-pressed',String(selected));
    }
    if (dockTitle) dockTitle.textContent = descriptions[key].title;
    if (dockDesc) dockDesc.textContent = descriptions[key].short;
    if (!detail?.open) setDetail(key);
  }
  function getReadingOffset() {
    if (!mobile.matches) return 32;
    const nav = document.querySelector('.mobile-read-nav');
    const topNavHeight = nav?.getBoundingClientRect().height || 0;
    return topNavHeight + (dock?.offsetHeight || 44) + 16;
  }
  function go(key, source='diagram') {
    const item = items.find(h => h.key === key);
    if (!item) return;
    const absoluteY = item.el.getBoundingClientRect().top + window.scrollY;
    const y = Math.max(0,absoluteY - getReadingOffset());
    setActive(key);
    if (detail?.open) detail.close();
    // Very long chapters make browser-native smooth scrolling last several seconds.
    // Jump directly to the correct section; the persistent diagram keeps context.
    const previousBehavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = 'auto';
    window.scrollTo({top:y,behavior:'instant'});
    document.documentElement.style.scrollBehavior = previousBehavior;
    try { history.replaceState(null,'','#'+item.el.id); } catch (_) { /* local file URLs */ }
    schedule();
  }
  function update() {
    const bounds = section.getBoundingClientRect();
    const viewport = window.innerHeight || 1;
    const total = Math.max(1,bounds.height-viewport*.4);
    const overall = clamp((viewport*.52-bounds.top)/total);

    // Screen-specific reading line: account for mobile chapter nav + compact figure.
    const readingLine = mobile.matches ? getReadingOffset()+20 : Math.min(viewport*.46,350);
    let index=0;
    for (let i=0;i<items.length;i++) {
      if (items[i].el.getBoundingClientRect().top <= readingLine) index=i;
    }
    setActive(items[index].key);

    if (reduced.matches) railLines.forEach(path=>path.style.strokeDashoffset='0');
    else railLines.forEach((path,i)=>{
      const p=clamp(overall*1.22-i*.14);
      path.style.strokeDashoffset=String(100*(1-p));
    });
    if (railFill) railFill.style.width=`${Math.round(overall*100)}%`;

    if (dock) {
      const start=items[index].el.getBoundingClientRect().top;
      const end=index<items.length-1
        ? items[index+1].el.getBoundingClientRect().top
        : section.getBoundingClientRect().bottom;
      const per=clamp((readingLine-start)/Math.max(200,end-start));
      const phase=(index+per)/items.length;
      dockLines.forEach((path,i)=>{
        path.style.strokeDashoffset=reduced.matches?'0':String(100*(1-clamp(phase*3-i)));
      });
      if (dockFill) dockFill.style.width=`${Math.round(phase*100)}%`;
    }
  }
  let scheduled=false;
  function schedule() {
    if(scheduled) return;
    scheduled=true;
    requestAnimationFrame(()=>{scheduled=false;update()});
  }
  window.addEventListener('scroll',schedule,{passive:true});
  window.addEventListener('resize',schedule,{passive:true});
  window.addEventListener('pageshow',schedule,{passive:true});
  reduced.addEventListener?.('change',schedule);
  mobile.addEventListener?.('change',schedule);

  // Both the original PC diagram and the new mobile one link to the *same* headings.
  nodes.forEach(node=>node.addEventListener('click',event=>{
    event.preventDefault();go(node.dataset.principle);
  }));
  dockButtons.forEach(button=>button.addEventListener('click',()=>go(button.dataset.pmdPrinciple)));
  if (collapse && dock) collapse.addEventListener('click',()=>{
    const folded = dock.classList.toggle('is-collapsed');
    collapse.setAttribute('aria-expanded',String(!folded));
    collapse.innerHTML=folded?'ひらく <span aria-hidden="true">⌄</span>':'しまう <span aria-hidden="true">⌃</span>';
    schedule();
  });
  if (expand && detail && typeof detail.showModal === 'function') {
    expand.addEventListener('click',()=>{
      returnFocus=expand;
      setDetail(activeKey || 'wa');
      detail.showModal();
      close?.focus();
    });
  }
  close?.addEventListener('click',()=>detail?.close());
  detail?.addEventListener('close',()=>returnFocus?.focus({preventScroll:true}));
  detail?.addEventListener('click',event=>{
    // Clicking the backdrop closes the modal, but clicks inside the document do not.
    if (event.target === detail) detail.close();
  });
  detailTabs.forEach(tab=>tab.addEventListener('click',()=>setDetail(tab.dataset.pddTab)));
  read?.addEventListener('click',()=>go(selectedDetail,'detail'));
  update();
  document.documentElement.dataset.archiveMotion='v64-ready';
})();
