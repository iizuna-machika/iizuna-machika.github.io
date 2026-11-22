/** A different motion language for each editorial page. All artwork is decorative. */
(()=>{
 'use strict';
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 const path=(d,c='#d7bc88')=>`<path class="story-moving-path" d="${d}" fill="none" stroke="${c}" stroke-width="2" pathLength="1" stroke-linecap="round"/>`;
 const c=(x,y,r=4,fill='#e7d6af')=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" class="story-glowing"/>`;
 const svgs={
  three:path('M110 78 Q360 5 610 78 Q360 150 110 78')+path('M110 78 L610 78','#93b6b4')+c(110,78,8)+c(360,78,8)+c(610,78,8),
  book:path('M358 122 Q250 52 95 77 L95 20 Q250 5 358 70 Q470 5 625 20 L625 77 Q468 52 358 122 Z')+path('M358 70 L358 122','#93b6b4')+path('M165 62 Q258 36 326 87','#eee3d1')+path('M389 86 Q492 37 554 61','#eee3d1'),
  quote:path('M110 120 Q173 40 245 98 Q282 131 234 130')+path('M470 120 Q531 40 611 98 Q638 135 581 133','#93b6b4')+path('M244 141 Q360 43 470 141','#c4a5a0'),
  lenses:[...Array(6)].map((_,i)=>{const angle=i*Math.PI/3;const x=360+Math.cos(angle)*140,y=78+Math.sin(angle)*52;return path(`M360 78 L${x.toFixed(1)} ${y.toFixed(1)}`,i%2?'#93b6b4':'#d7bc88')+c(x.toFixed(1),y.toFixed(1),5)}).join('')+c(360,78,12),
  sound:[...Array(21)].map((_,i)=>{const x=105+i*25;const h=20+Math.abs(Math.sin(i*1.11)*58);return path(`M${x} ${78-h/2} L${x} ${78+h/2}`,i%3?'#93b6b4':'#d7bc88')}).join(''),
  threads:path('M55 32 C220 140 300 10 435 84 S625 108 695 36')+path('M55 116 C210 0 320 142 435 84 S620 30 695 119','#93b6b4')+c(435,84,8)
 };
 document.querySelectorAll('.story-motion-panel').forEach(el=>{
   const motif=el.dataset.motionMotif;
   const display=el.querySelector('.story-motion-figure');if(!display)return;
   display.innerHTML=`<svg viewBox="0 0 720 158" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><ellipse cx="360" cy="78" rx="300" ry="65" fill="#e3c991" opacity=".07"/>${svgs[motif]||svgs.three}</svg>`;
   if(reduced) el.classList.add('motion-reduced');
 });
})();