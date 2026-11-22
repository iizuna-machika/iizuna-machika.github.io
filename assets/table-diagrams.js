/* v11: Faithful visual re-expression of tables. The original table remains in a collapsible source. */
(()=>{
 'use strict';
 const tables=[...document.querySelectorAll('main table')];
 function make(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;}
 for(const table of tables){
   if(table.closest('.visual-table-source'))continue;
   const headers=[...table.querySelectorAll('thead th')].map(x=>x.textContent.trim());
   const rows=[...table.querySelectorAll('tbody tr')];
   if(!rows.length)continue;
   const fig=make('section','visual-table-figure');fig.setAttribute('aria-label','表の情報を図で読む');
   const intro=make('div','graph-intro');intro.append(make('span','graph-intro-kicker','関係を図で見る'),make('p','graph-intro-sub','各項目と、その特徴・留意点を線で結んで表示します。'));
   fig.append(intro);
   const grid=make('div','graph-grid');
   rows.forEach((row,ri)=>{
     const cells=[...row.querySelectorAll('th,td')];if(!cells.length)return;
     const root=make('article','graph-entry');root.style.setProperty('--graph-order',ri);
     const core=make('div','graph-core');core.append(make('span','graph-numeral',String(ri+1).padStart(2,'0')),make('strong','graph-label',cells[0].textContent.trim()));
     root.append(core);
     const branches=make('div','graph-branches');
     cells.slice(1).forEach((cell,i)=>{
       const br=make('section','graph-branch');
       br.append(make('small','graph-term',headers[i+1]||'役割・説明'));
       const value=make('p','graph-value');value.innerHTML=cell.innerHTML;br.append(value);branches.append(br);
     });
     root.append(branches);grid.append(root);
   });
   fig.append(grid);
   const detail=make('details','visual-table-source');
   detail.append(make('summary',null,'元の表を確認する'));
   table.parentNode.insertBefore(fig,table);
   table.parentNode.insertBefore(detail,table);
   detail.append(table);
 }
})();
