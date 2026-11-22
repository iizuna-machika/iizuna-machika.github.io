/** V9: animated lettering belongs to the same scene as the drawing.
 *  We relocate existing SVG motifs into each page header; no editorial words change.
 *  DOM text remains HTML so it can be copied, selected, translated and indexed.
 */
(()=>{
 'use strict';
 const body=document.body;
 if(!body.classList.contains('page-inner'))return;
 const motif=document.querySelector('main > .story-motion-panel');
 const hero=document.querySelector('main > .subhero.story-banner, main > .about-profile-hero');
 if(motif&&hero){
   hero.insertBefore(motif,hero.firstChild);
   hero.classList.add('integrated-hero');
   const cap=motif.querySelector('figcaption');
   if(cap)cap.classList.add('visually-hidden-caption');
 }
 // Decorate the existing text sections, using CSS backgrounds instead of altering text nodes.
 document.querySelectorAll('main .reading > section, main .reading > h2, main .paper-card, main .activity-tile').forEach(el=>{
   if(!el.closest('.doc-reading')&&!el.closest('.archive-scroll-experience'))el.classList.add('ink-integrated-section');
 });
})();
