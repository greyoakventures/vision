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
 document.getElementById('upd').textContent=proj&&proj.filled?'':'Last updated '+D.lastUpdatedLabel;
 document.getElementById('tabs').innerHTML=D.projects.map(x=>`<button class="tab ${x.id===p?'on':''} ${x.filled?'':'empty'}" data-p="${x.id}">${esc(x.name)}</button>`).join('');
 const app=document.getElementById('app');
 if(!proj.filled){app.innerHTML=`<div class="empty-proj">${svg('box','ic')}<p><b>${esc(proj.name)}</b> isn't mapped yet.</p><p>${esc(proj.summary)}</p></div>`;return;}
 const cs=comps(p);
 const known=cs.filter(c=>c.cost.kind!=='unknown'&&c.cost.monthly!=null);
 const total=known.reduce((a,c)=>a+c.cost.monthly,0);
 const unk=cs.filter(c=>c.cost.kind==='unknown');
 const paid=known.filter(c=>c.cost.monthly>0).sort((a,b)=>b.cost.monthly-a.cost.monthly);
 const unc=cs.filter(c=>!c.confirmed);
 const ch=D.changes.filter(x=>x.project===p).sort((a,b)=>(b.date||'0').localeCompare(a.date||'0'));
 const flow=(D.flows[p]||[]);
 const bots=D.bots.filter(b=>b.touches.some(t=>cs.find(c=>c.id===t))||(b.projects||[]).includes(p));
 let h=`<div class="slim"><span class="money">${fmt(total)}<small>/mo known</small></span><span class="when">Updated ${esc(D.lastUpdatedLabel)}</span></div>`;
 const main=D.layers.filter(L=>L.flow!==false&&cs.some(c=>c.layer===L.id));
 const side=D.layers.filter(L=>L.flow===false&&cs.some(c=>c.layer===L.id));
 const LN=(D.layerNames||{})[p]||{};const band=L=>`<div class="band"><div class="bl">${svg(L.icon)}<span>${esc(LN[L.id]||L.name)}</span></div><div class="tiles">${cs.filter(c=>c.layer===L.id).map(tile).join('')}</div></div>`;
 h+=`<div class="hero">${main.map(band).join('<div class="arrow"><svg viewBox="0 0 12 18" width="12" height="18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M6 1v15M1.5 11.5 6 16l4.5-4.5"/></svg></div>')}${side.length?`<div class="side">${side.map(band).join('')}</div>`:''}</div>`;
 h+=`<div class="botrow">${bots.map(b=>`<button class="bt" data-bot="${b.id}"><span class="av">${esc(initials(b.name))}</span>${esc(b.name)}</button>`).join('')}</div>`;
 const acc=(id,title,count,body)=>`<details class="acc" data-acc="${id}"><summary>${esc(title)}${count!=null?`<span class="cnt">${count}</span>`:''}<span class="car">›</span></summary><div class="accb">${body}</div></details>`;
 h+=`<div class="accs">`;
 h+=acc('changes','Recent changes',ch.length,`<ul class="list">${ch.map(x=>`<li><span class="d">${x.date?esc(x.date):'date ?'}</span>${esc(x.text)}</li>`).join('')}</ul>`);
 h+=acc('flow',(D.flowTitles||{})[p]||'Order flow',flow.length?flow.length+' steps':null,`<ol class="steps">${flow.map(s=>`<li>${svg(s.icon)}<div><b>${esc(s.title)}</b><p>${esc(s.detail)}</p></div></li>`).join('')}</ol>`);
 h+=acc('chart','Flowchart',null,`<div class="mer"><pre class="mermaid" id="mer"></pre></div>`);
 const groups={};cs.filter(c=>c.overlapGroup).forEach(c=>(groups[c.overlapGroup]=groups[c.overlapGroup]||[]).push(c));
 const GN={invoicing:'Invoices & payments',email:'Email'};
 h+=acc('save','Savings & overlaps',null,`<h4>Biggest known costs</h4><ul class="list">${paid.map(c=>`<li><span class="d">${fmt(c.cost.monthly)}/mo</span>${esc(c.short)}</li>`).join('')}</ul><h4>Overlapping tools</h4><ul class="list">${Object.entries(groups).filter(([,v])=>v.length>1).map(([k,v])=>`<li><span class="d">${esc(GN[k]||k)}</span>${v.map(c=>esc(c.short)).join(' · ')}</li>`).join('')}</ul><h4>Worth a look</h4><ul class="list">${(D.watch&&D.watch[p]||[]).map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`);
 h+=acc('unc','Unconfirmed & unknown cost',unc.length+unk.length,`<h4>Unconfirmed <i class="dot"></i></h4><ul class="list">${unc.map(c=>`<li>${esc(c.short)}</li>`).join('')}</ul><h4>Cost unknown <span class="tag unk">?</span></h4><ul class="list">${unk.map(c=>`<li>${esc(c.short)}</li>`).join('')}</ul><p class="note">Tags show list-price monthly cost. No tag = free or included.</p>`);
 h+=`</div>`;
 app.innerHTML=h;
 const md=app.querySelector('details[data-acc="chart"]');
 md.addEventListener('toggle',()=>{if(md.open&&!md.dataset.drawn){md.dataset.drawn=1;drawMermaid(cs);}});
}
function initials(n){return n.split(/\s|\./).filter(Boolean).map(w=>w[0]).join('').slice(0,2);}
function tile(c){
 const m=c.cost;let tag='';
 if(c.status==='paused')tag='<span class="tag unk">paused</span>';else if(m.kind==='unknown')tag='<span class="tag unk">?</span>';else if(m.monthly>0)tag=`<span class="tag">${fmt(m.monthly)}</span>`;
 return `<button class="tile${c.status==='paused'?' paused':''}" data-id="${c.id}">${logo(c)}<span class="tn">${esc(c.short)}</span>${tag}${c.confirmed?'':'<i class="dot" title="unconfirmed"></i>'}</button>`;
}
window.visionBot=function(id){
 const b=D.bots.find(x=>x.id===id);const cs=comps(cur).filter(c=>b.touches.includes(c.id));
 document.getElementById('sh').innerHTML=`<div class="row"><span class="av big">${esc(initials(b.name))}</span><h3>${esc(b.name)}</h3><button class="x" onclick="visionClose()">✕</button></div><p class="role">${esc(b.role)}</p><p>${esc(b.notes)}</p><div class="tiles">${cs.map(tile).join('')}</div>`;
 document.getElementById('sheet').classList.add('on');
};
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
 const bots=D.bots.filter(b=>b.touches.includes(id)&&b.id!=='nick').map(b=>b.name);
 const L=D.layers.find(l=>l.id===c.layer);
 const links=[];if(c.lives.url)links.push(`<a href="${esc(c.lives.url)}" target="_blank" rel="noopener">${esc(c.lives.url)}</a>`);
 if(c.lives.repo)links.push(/^https?:/.test(c.lives.repo)?`<a href="${esc(c.lives.repo)}" target="_blank" rel="noopener">${esc(c.lives.repo.replace('https://github.com/',''))}</a>`:esc(c.lives.repo));
 if(c.lives.dashboard)links.push(/^https?:/.test(c.lives.dashboard)?`<a href="${esc(c.lives.dashboard)}" target="_blank" rel="noopener">Dashboard</a>`:esc(c.lives.dashboard));
 document.getElementById('sh').innerHTML=`<div class="row">${logo(c)}<h3>${esc(c.name)}</h3><button class="x" onclick="visionClose()">✕</button></div>
 <div class="badges" style="margin-top:8px">${costBadge(c,false)}${c.confirmed?'<span class="b" style="color:#34d399">confirmed</span>':'<span class="b unc">unconfirmed</span>'}${c.overlapGroup?'<span class="b ovl">overlap: '+esc(c.overlapGroup)+'</span>':''}</div>
 <dl><dt>What it is</dt><dd>${esc((c.notesByProject||{})[cur]||c.notes)}</dd><dt>Layer</dt><dd>${esc((((D.layerNames||{})[cur]||{})[c.layer])||(L?L.name:c.layer))}</dd><dt>Where it lives</dt><dd>${links.join('<br>')||'—'}</dd><dt>Owner</dt><dd>${esc(c.owner.person||'—')}</dd><dt>Bots</dt><dd>${esc([...new Set([...(c.owner.bots||[]),...bots])].join(', ')||'—')}</dd><dt>Monthly cost</dt><dd>${c.cost.monthly!=null&&c.cost.kind!=='unknown'?fmt(c.cost.monthly)+' · ':''}${esc(c.cost.basis)}</dd><dt>Last verified</dt><dd>${esc(c.lastVerified)}</dd></dl>`;
 document.getElementById('sheet').classList.add('on');
};
window.visionClose=()=>document.getElementById('sheet').classList.remove('on');
function drawMermaid(cs){
 const el=document.getElementById('mer');if(!el||!window.mermaid)return;
 const ids={};cs.forEach((c,i)=>ids[c.id]='n'+i);
 let g='flowchart TB\n';
 const linked=new Set();cs.forEach(c=>c.connects.forEach(t=>{if(ids[t]){linked.add(c.id);linked.add(t);}}));
 cs.filter(c=>linked.has(c.id)).forEach(c=>{g+=`${ids[c.id]}["${c.short.replace(/"/g,'')}${c.confirmed?'':' •'}"]\n`;});
 cs.forEach(c=>c.connects.forEach(t=>{if(ids[t])g+=`${ids[c.id]} --> ${ids[t]}\n`;}));
 cs.filter(c=>linked.has(c.id)).forEach(c=>{g+=`click ${ids[c.id]} call visionOpen("${c.id}")\n`;});
 el.textContent=g;el.removeAttribute('data-processed');
 mermaid.initialize({startOnLoad:false,theme:'base',securityLevel:'loose',flowchart:{htmlLabels:true,curve:'basis'},themeVariables:{background:'#161a1f',primaryColor:'#1d2229',primaryTextColor:'#e9edf1',primaryBorderColor:'#2a313a',lineColor:'#5eead4',clusterBkg:'#12161a',clusterBorder:'#2a313a',titleColor:'#97a1ad',fontSize:'13px'}});
 mermaid.run({nodes:[el]}).catch(e=>{el.textContent='Flowchart could not render: '+e.message;});
}
document.addEventListener('click',e=>{
 const t=e.target.closest('.tab');if(t){cur=t.dataset.p;selBot=selStep=null;if(!FIXED)history.replaceState(null,'','#'+cur);else if(cur!==FIXED){location.href=ROOT+'/#'+cur;return;}render();return;}
 const n=e.target.closest('.node,.tile');if(n){visionOpen(n.dataset.id);return;}
 const bt=e.target.closest('.bt');if(bt){visionBot(bt.dataset.bot);return;}
 const s=e.target.closest('.step');if(s){const v=+s.dataset.step;selStep=selStep===v?null:v;selBot=null;render();return;}
 const b=e.target.closest('.bot');if(b){selBot=selBot===b.dataset.bot?null:b.dataset.bot;selStep=null;render();return;}
 if(e.target.id==='sheet')visionClose();
});
document.addEventListener('keydown',e=>{if(e.key==='Escape')visionClose();});
fetch(ROOT+'/data/stack.json',{cache:'no-store'}).then(r=>r.json()).then(d=>{D=d;const h=location.hash.slice(1);cur=FIXED||(D.projects.find(p=>p.id===h)?h:(D.projects.find(p=>p.filled)||D.projects[0]).id);render();}).catch(e=>{document.getElementById('app').textContent='Could not load data: '+e.message;});
})();
