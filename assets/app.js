(function(){
const ROOT=document.body.dataset.root||'.';
const FIXED=document.body.dataset.project||'';
const ICONS={
 globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
 server:'<rect x="3" y="4" width="18" height="7" rx="2"/><rect x="3" y="13" width="18" height="7" rx="2"/><path d="M7 7.5h.01M7 16.5h.01"/>',
 window:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18"/>',
 cpu:'<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/>',
 plug:'<path d="M9 2v6M15 2v6M6 8h12v4a6 6 0 0 1-12 0zM12 18v4"/>',
 db:'<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
 mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
 money:'<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/>',
 chart:'<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
 code:'<path d="m8 6-6 6 6 6M16 6l6 6-6 6"/>',
 calc:'<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M8 6h8M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15h.01M8 19h8"/>',
 send:'<path d="M22 2 11 13M22 2l-7 20-4-9-9-4z"/>',
 doc:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h5"/>',
 truck:'<path d="M1 4h14v12H1zM15 9h4l3 3v4h-7"/><circle cx="5.5" cy="18.5" r="2"/><circle cx="18.5" cy="18.5" r="2"/>',
 box:'<path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="m3 8 9 5 9-5M12 13v8"/>',
 bot:'<rect x="4" y="8" width="16" height="12" rx="3"/><path d="M12 4v4M9 13h.01M15 13h.01"/>'
};
const svg=(k,c)=>`<svg class="${c||'ic'}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONS[k]||ICONS.box}</svg>`;
const GEN={edge:'globe',hosting:'server',frontend:'window',backend:'cpu',apis:'plug',data:'db',email:'mail',money:'money',analytics:'chart',code:'code'};
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fmt=n=>'$'+(Math.round(n*100)/100).toFixed(n%1?2:0);
let D,cur,selBot=null,selStep=null;
function logo(c){
 const bg=c.color||'#2a313a';
 const inner=c.logo?`<img alt="" src="${ROOT}/assets/logos/${c.logo}.svg" onerror="this.style.display='none'">`:`<span style="color:#fff">${svg(GEN[c.layer]||'box','')}</span>`;
 return `<div class="logo" style="background:${bg}">${inner}</div>`;
}
function costBadge(c,top){
 const k=c.cost.kind;
 if(k==='unknown')return '<span class="b unk">cost unknown</span>';
 if(c.cost.monthly===0)return `<span class="b cost">${k==='included'?'included':'$0'}</span>`;
 return `<span class="b cost ${top?'top':''}">${fmt(c.cost.monthly)}/mo</span>`;
}
function comps(p){return D.components.filter(c=>c.projects.includes(p));}
function render(){
 const p=cur, proj=D.projects.find(x=>x.id===p);
 document.getElementById('upd').textContent='Last updated '+D.lastUpdatedLabel;
 document.getElementById('tabs').innerHTML=D.projects.map(x=>`<button class="tab ${x.id===p?'on':''} ${x.filled?'':'empty'}" data-p="${x.id}">${esc(x.name)}</button>`).join('');
 const app=document.getElementById('app');
 if(!proj.filled){app.innerHTML=`<div class="empty-proj">${svg('box','ic')}<p><b>${esc(proj.name)}</b> isn't mapped yet.</p><p>${esc(proj.summary)}</p></div>`+sharedSection(p);return;}
 const cs=comps(p);
 const known=cs.filter(c=>c.cost.kind!=='unknown'&&c.cost.monthly!=null);
 const total=known.reduce((a,c)=>a+c.cost.monthly,0);
 const unk=cs.filter(c=>c.cost.kind==='unknown');
 const paid=known.filter(c=>c.cost.monthly>0).sort((a,b)=>b.cost.monthly-a.cost.monthly);
 const topIds=new Set(paid.slice(0,3).map(c=>c.id));
 const unc=cs.filter(c=>!c.confirmed);
 const ch=D.changes.filter(x=>x.project===p||x.project==='shared').sort((a,b)=>(b.date||'').localeCompare(a.date||''));
 const flow=(D.flows[p]||[]);
 let h='';
 h+=`<section><div class="stats"><div class="stat"><b>${fmt(total)}</b><span>known monthly subscriptions</span></div><div class="stat"><b>${unk.length}</b><span>pieces with cost unknown</span></div><div class="stat"><b>${cs.length}</b><span>pieces mapped</span></div><div class="stat"><b>${unc.length}</b><span>unconfirmed</span></div></div></section>`;
 h+=`<section><h2>${svg('chart','ic')}Recently added / changed</h2><div class="changes">${ch.map(x=>`<div class="chg"><i>${x.date?esc(x.date):'date unconfirmed'}</i>${esc(x.text)}</div>`).join('')}</div></section>`;
 if(flow.length){h+=`<section><h2>${svg('send','ic')}What happens when a customer orders</h2><div class="flow">${flow.map(s=>`<div class="step ${selStep===s.step?'on':''}" data-step="${s.step}">${svg(s.icon)}<div><b>${esc(s.title)}</b></div><small>${s.step}</small></div>`).join('')}</div><div class="stepdetail" id="stepdetail">${selStep?esc(flow.find(s=>s.step===selStep).detail):'Tap a step to light up the pieces it uses.'}</div></section>`;}
 h+=`<section><h2>${svg('bot','ic')}Grok Bot layer: who built or runs what</h2><div class="bots">${D.bots.filter(b=>b.touches.some(t=>cs.find(c=>c.id===t))||b.id==='optimus'||b.id==='ms-room'||b.id==='docbrown').map(b=>`<div class="bot ${selBot===b.id?'on':''} ${b.confirmed?'':'unc'}" data-bot="${b.id}"><span class="av">${esc(b.name.split(/\s|\./).filter(Boolean).map(w=>w[0]).join('').slice(0,2))}</span>${esc(b.name)}</div>`).join('')}</div><div class="botnote" id="botnote">${selBot?botNote(selBot):'Tap a bot to light up what it touches. Dashed = role unconfirmed.'}</div></section>`;
 h+=`<section><h2>${svg('server','ic')}The stack, layer by layer</h2>`;
 const hi=highlightSet(flow);
 for(const L of D.layers){const lc=cs.filter(c=>c.layer===L.id);if(!lc.length)continue;
  const lt=lc.filter(c=>c.cost.kind!=='unknown').reduce((a,c)=>a+(c.cost.monthly||0),0);
  h+=`<details class="layer" open><summary><span class="car">▸</span>${svg(L.icon)}${esc(L.name)}<span class="sum">${lc.length} · ${fmt(lt)}/mo known${lc.some(c=>c.cost.kind==='unknown')?' + unknown':''}</span></summary><div class="nodes">${lc.map(c=>node(c,topIds,hi)).join('')}</div></details>`;}
 h+=`<div class="legend"><span><span class="b top">$</span> top cost</span><span><span class="b unk">cost unknown</span></span><span><span class="b unc">unconfirmed</span></span><span><span class="b ovl">overlap</span> tools doing similar jobs</span></div></section>`;
 h+=`<section><details class="layer"><summary><span class="car">▸</span>${svg('code')}Flowchart: how the pieces connect<span class="sum">tap to open</span></summary><div class="mer"><pre class="mermaid" id="mer"></pre></div></details></section>`;
 const groups={};cs.filter(c=>c.overlapGroup).forEach(c=>(groups[c.overlapGroup]=groups[c.overlapGroup]||[]).push(c));
 const GN={invoicing:'Invoices & payments',email:'Email'};
 h+=`<section><h2>${svg('money','ic')}Spot the savings</h2><div class="cards"><div class="card"><h3>Most expensive (known)</h3><ul>${paid.slice(0,5).map(c=>`<li>${esc(c.name)}: ${fmt(c.cost.monthly)}/mo</li>`).join('')||'<li>None known</li>'}</ul></div><div class="card"><h3>Overlapping tools</h3><ul>${Object.entries(groups).filter(([,v])=>v.length>1).map(([k,v])=>`<li><b>${esc(GN[k]||k)}:</b> ${v.map(c=>esc(c.short)).join(' · ')}</li>`).join('')}</ul></div><div class="card"><h3>Worth a look</h3><ul>${(D.watch&&D.watch[p]||[]).map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div><div class="card"><h3>Cost unknown</h3><ul>${unk.map(c=>`<li>${esc(c.short)}</li>`).join('')}</ul></div></div></section>`;
 h+=sharedSection(p);
 app.innerHTML=h;
 drawMermaid(cs);
}
function sharedSection(p){
 const sh=D.components.filter(c=>c.projects.filter(x=>x!=='shared').length>1||c.projects.includes('shared'));
 if(!sh.length)return '';
 return `<section><h2>${svg('plug','ic')}Shared across projects</h2><div class="nodes" style="padding:0">${sh.map(c=>node(c,new Set(),null,true)).join('')}</div></section>`;
}
function highlightSet(flow){
 if(selStep){return new Set(flow.find(s=>s.step===selStep).components);}
 if(selBot){return new Set(D.bots.find(b=>b.id===selBot).touches);}
 return null;
}
function node(c,topIds,hi,showProj){
 const cls=hi?(hi.has(c.id)?'hi':'dim'):'';
 const projs=showProj?`<span class="b st">${c.projects.filter(x=>x!=='shared').map(x=>(D.projects.find(p=>p.id===x)||{name:x}).name).join(', ')}</span>`:'';
 return `<div class="node ${cls}" data-id="${c.id}"><div class="row">${logo(c)}<div class="nm">${esc(c.short)}</div></div><div class="badges">${costBadge(c,topIds.has(c.id))}${c.confirmed?'':'<span class="b unc">unconfirmed</span>'}${c.overlapGroup?'<span class="b ovl">overlap</span>':''}${c.status&&c.status!=='live'?`<span class="b st">${esc(c.status)}</span>`:''}${projs}</div></div>`;
}
function botNote(id){const b=D.bots.find(x=>x.id===id);return `<b>${esc(b.name)}</b> · ${esc(b.role)}${b.confirmed?'':' (unconfirmed)'}: ${esc(b.notes)}`;}
window.visionOpen=function(id){
 const c=D.components.find(x=>x.id===id);if(!c)return;
 const bots=D.bots.filter(b=>b.touches.includes(id)).map(b=>b.name);
 const L=D.layers.find(l=>l.id===c.layer);
 const links=[];if(c.lives.url)links.push(`<a href="${esc(c.lives.url)}" target="_blank" rel="noopener">${esc(c.lives.url)}</a>`);
 if(c.lives.repo)links.push(/^https?:/.test(c.lives.repo)?`<a href="${esc(c.lives.repo)}" target="_blank" rel="noopener">${esc(c.lives.repo.replace('https://github.com/',''))}</a>`:esc(c.lives.repo));
 if(c.lives.dashboard)links.push(/^https?:/.test(c.lives.dashboard)?`<a href="${esc(c.lives.dashboard)}" target="_blank" rel="noopener">Dashboard</a>`:esc(c.lives.dashboard));
 document.getElementById('sh').innerHTML=`<div class="row">${logo(c)}<h3>${esc(c.name)}</h3><button class="x" onclick="visionClose()">✕</button></div>
 <div class="badges" style="margin-top:8px">${costBadge(c,false)}${c.confirmed?'<span class="b" style="color:#34d399">confirmed</span>':'<span class="b unc">unconfirmed</span>'}${c.overlapGroup?'<span class="b ovl">overlap: '+esc(c.overlapGroup)+'</span>':''}</div>
 <dl><dt>What it is</dt><dd>${esc(c.notes)}</dd><dt>Layer</dt><dd>${esc(L?L.name:c.layer)}</dd><dt>Where it lives</dt><dd>${links.join('<br>')||'—'}</dd><dt>Owner</dt><dd>${esc(c.owner.person||'—')}</dd><dt>Bots</dt><dd>${esc([...new Set([...(c.owner.bots||[]),...bots])].join(', ')||'—')}</dd><dt>Monthly cost</dt><dd>${c.cost.monthly!=null&&c.cost.kind!=='unknown'?fmt(c.cost.monthly)+' · ':''}${esc(c.cost.basis)}</dd><dt>Last verified</dt><dd>${esc(c.lastVerified)}</dd></dl>`;
 document.getElementById('sheet').classList.add('on');
};
window.visionClose=()=>document.getElementById('sheet').classList.remove('on');
function drawMermaid(cs){
 const el=document.getElementById('mer');if(!el||!window.mermaid)return;
 const ids={};cs.forEach((c,i)=>ids[c.id]='n'+i);
 let g='flowchart '+(innerWidth<700?'TB':'LR')+'\n';
 for(const L of D.layers){const lc=cs.filter(c=>c.layer===L.id);if(!lc.length)continue;
  g+=`subgraph ${L.id}["${L.name.replace(/"/g,'')}"]\n`;lc.forEach(c=>{g+=`${ids[c.id]}["${c.short.replace(/"/g,'')}${c.confirmed?'':' (unconfirmed)'}"]\n`;});g+='end\n';}
 cs.forEach(c=>c.connects.forEach(t=>{if(ids[t])g+=`${ids[c.id]} --> ${ids[t]}\n`;}));
 cs.forEach(c=>{g+=`click ${ids[c.id]} call visionOpen("${c.id}")\n`;});
 el.textContent=g;el.removeAttribute('data-processed');
 mermaid.initialize({startOnLoad:false,theme:'dark',securityLevel:'loose',flowchart:{htmlLabels:true}});
 mermaid.run({nodes:[el]}).catch(e=>{el.textContent='Flowchart could not render: '+e.message;});
}
document.addEventListener('click',e=>{
 const t=e.target.closest('.tab');if(t){cur=t.dataset.p;selBot=selStep=null;if(!FIXED)history.replaceState(null,'','#'+cur);else if(cur!==FIXED){location.href=ROOT+'/#'+cur;return;}render();return;}
 const n=e.target.closest('.node');if(n){visionOpen(n.dataset.id);return;}
 const s=e.target.closest('.step');if(s){const v=+s.dataset.step;selStep=selStep===v?null:v;selBot=null;render();return;}
 const b=e.target.closest('.bot');if(b){selBot=selBot===b.dataset.bot?null:b.dataset.bot;selStep=null;render();return;}
 if(e.target.id==='sheet')visionClose();
});
document.addEventListener('keydown',e=>{if(e.key==='Escape')visionClose();});
fetch(ROOT+'/data/stack.json',{cache:'no-store'}).then(r=>r.json()).then(d=>{D=d;const h=location.hash.slice(1);cur=FIXED||(D.projects.find(p=>p.id===h)?h:(D.projects.find(p=>p.filled)||D.projects[0]).id);render();}).catch(e=>{document.getElementById('app').textContent='Could not load data: '+e.message;});
})();
