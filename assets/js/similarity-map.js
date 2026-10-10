import { putCopy, putText } from './copy.js?v=prose-scripts-1';
import { forceSimulation, forceCollide, forceX, forceY, forceManyBody } from './vendor/d3-force.js';
const NS = 'http://www.w3.org/2000/svg';
export function articlesForNode(node, articles) {
  return [...new Set(node.articles)].map(i=>articles[i]).sort((a,b)=>b.date.localeCompare(a.date)||a.title.localeCompare(b.title));
}
export function nodeRadius(node) {
  return Math.min(17, 4 + Math.sqrt(new Set(node.articles).size));
}
// Semantic anchors never change. Physics operates on separate display objects.
export function pointPosition(node) { return [500 + node.x * 290, 360 + node.y * 290]; }
export function labelPositions(nodes, indices, placed = new Map(), points = null) {
  const overlaps = (a,b) => a.x < b.x+b.width+7 && a.x+a.width+7 > b.x && Math.abs(a.y-b.y)<((a.height||20)+(b.height||20))/2+4;
  const obstacles = points ? [...points.values()].map(p=>({x:p.x-p.r-3,y:p.y,width:(p.r+3)*2,height:(p.r+3)*2})) : [];
  const fontSize=indices.length>100?14:18, height=fontSize+2;
  // Reserve room for long noun phrases first; small labels fill the gaps.
  for (const i of [...indices].sort((a,b)=>nodes[b].title.length-nodes[a].title.length||a-b)) {
    if (placed.has(i)) continue;
    const node=nodes[i], [x,y]=points?[points.get(i).x,points.get(i).y]:pointPosition(node), width=node.title.length*fontSize*.61, gap=nodeRadius(node)+10;
    let candidate, found=false;
    const blockers=[...placed.values(),...obstacles];
    search: for (let step=0;step<30;step++) for (const sign of (step?[1,-1]:[1])) for (const side of [1,-1]) {
      candidate={x:Math.max(12,Math.min(985-width,side===1?x+gap:x-gap-width)),y:Math.max(26,Math.min(694,y+step*sign*(height+4))),width,height,fontSize};
      if (!blockers.some(p=>overlaps(candidate,p))) {found=true;break search;}
    }
    if(!found){
      const slots=[];
      for(let sy=26;sy<=694;sy+=height+4)for(let sx=12;sx<=985-width;sx+=20)slots.push({x:sx,y:sy,width,height,fontSize});
      slots.sort((a,b)=>(a.x+width/2-x)**2+(a.y-y)**2-((b.x+width/2-x)**2+(b.y-y)**2));
      candidate=slots.find(s=>!blockers.some(p=>overlaps(s,p)))||candidate;
    }
    placed.set(i,candidate);
  }
  return placed;
}
export function settleLayout(nodes, indices, previous = new Map()) {
  const particles=indices.map(id=>{
    const [ax,ay]=pointPosition(nodes[id]),old=previous.get(id);
    return {id,ax,ay,x:old?.x??ax,y:old?.y??ay,r:nodeRadius(nodes[id])};
  });
  const simulation=forceSimulation(particles).stop().velocityDecay(.5)
    .force('x',forceX(p=>p.ax).strength(.075))
    .force('y',forceY(p=>p.ay).strength(.075))
    .force('repel',forceManyBody().strength(-12).distanceMax(150))
    .force('collision',forceCollide(p=>p.r+6).strength(1).iterations(4));
  simulation.tick(260);simulation.stop();
  const positions=new Map(particles.map(p=>[p.id,{x:Math.max(28,Math.min(972,p.x)),y:Math.max(28,Math.min(692,p.y)),r:p.r}]));
  const labels=labelPositions(nodes,indices,new Map(),positions);
  for(const [id,p] of positions) p.label=labels.get(id);
  return positions;
}
export function visibleIndices(pages, { limit = 40, selected = null, query = '', revealed = [] } = {}) {
  if (query) return pages.map((p,i)=>i).filter(i => `${pages[i].title} ${pages[i].description}`.toLowerCase().includes(query.toLowerCase())).slice(0,limit);
  const indices = Array.from({length:Math.min(limit,pages.length)},(_,i)=>i).concat(revealed);
  if (selected !== null) indices.push(selected,...pages[selected].nearest.map(n=>n.index));
  return [...new Set(indices)];
}
export function mount(root) {
  const abort = new AbortController();
  const status = root.querySelector('[data-map-status]');
  const svg = root.querySelector('svg'), aside = root.querySelector('aside');
  let pages, articles, coverage, selected = 0, limit = 40, query = '', visible = [], pinned = false, articleLimit = 6;
  const revealed=new Set();
  let positions=new Map(), targetLayout=new Map(), frame=0, layoutKey='';
  const motionPreference=matchMedia('(prefers-reduced-motion: reduce)');
  const motionButton=document.createElement('button');motionButton.type='button';
  motionButton.textContent='Replay settling';motionButton.dataset.mapMotion='';
  root.querySelector('.map-tools').append(motionButton);
  const el = (tag, attrs = {}, text = '') => { const n = document.createElementNS(NS,tag); for(const [k,v] of Object.entries(attrs)) n.setAttribute(k,v); n.textContent=text; return n; };
  const xy = i => {const p=positions.get(i);return p?[p.x,p.y]:pointPosition(pages[i]);};
  const colors = ['#3695e8','#e06b33','#19a781','#dca020','#b58bdd'];
  const color = p => colors[(['software-design','python','organizations','theology'].indexOf(p.topics?.[0])+5)%5];
  function inspect(i) {
    selected=i;
    const p=pages[i], neighbors=new Set(p.nearest.map(n=>n.index));
    svg.querySelectorAll('.map-edge').forEach(n=>n.remove());
    for(const n of p.nearest.slice(0,5)) if(visible.includes(n.index)) {
      const [x1,y1]=xy(i),[x2,y2]=xy(n.index);
      svg.prepend(el('line',{x1,y1,x2,y2,class:'map-edge','data-from':i,'data-to':n.index}));
    }
    svg.querySelectorAll('.map-point').forEach(n=>{
      const j=Number(n.dataset.index);
      n.classList.toggle('map-active',j===i||neighbors.has(j));
      n.setAttribute('aria-pressed',String(pinned&&j===i));
    });
    putText(aside);
    const matches=articlesForNode(p,articles);
    const small=document.createElement('small');small.textContent=`${matches.length} DISTINCT ARTICLES · ${p.kind || 'CONCEPT'}${pinned?' · SELECTED':''}`;
    const h=document.createElement('h2');h.textContent=p.title;
    const description=document.createElement('p');putCopy(description,'runtime_map.description');
    const articleList=document.createElement('ol');
    for(const article of matches.slice(0,articleLimit)){const li=document.createElement('li'),a=document.createElement('a'),date=document.createElement('small');a.href=article.url;a.textContent=article.title;date.textContent=article.date.slice(0,10);li.append(a,document.createElement('br'),date);articleList.append(li);}
    const explore=document.createElement('button');explore.textContent='Reveal related concepts';explore.onclick=()=>choose(i);
    const heading=document.createElement('h3');heading.textContent='Related concepts';
    const list=document.createElement('ol');
    for(const n of p.nearest.slice(0,5)){const li=document.createElement('li'),a=document.createElement('button');a.textContent=pages[n.index].title;a.onclick=()=>choose(n.index);li.append(a);list.append(li);}
    aside.append(small,h,description,articleList);
    if(matches.length>articleLimit){const more=document.createElement('button');more.textContent=`More articles (${matches.length-articleLimit} remaining)`;more.onclick=()=>{pinned=true;articleLimit+=6;inspect(i);};aside.append(more);}
    if(pinned){const release=document.createElement('button');release.textContent='Resume hover previews';release.onclick=()=>{pinned=false;inspect(i);};aside.append(release);}
    aside.append(explore,heading,list);
  }
  function paintPositions(){
    svg.querySelectorAll('.map-point').forEach(node=>{
      const p=positions.get(Number(node.dataset.index));if(!p)return;
      const circle=node.querySelector('circle'),text=node.querySelector('text'),leader=node.querySelector('.map-label-leader');
      circle.setAttribute('cx',p.x);circle.setAttribute('cy',p.y);
      text.setAttribute('x',p.label.x);text.setAttribute('y',p.label.y+5);
      text.style.fontSize=p.label.fontSize+'px';
      leader.setAttribute('x1',p.x);leader.setAttribute('y1',p.y);
      leader.setAttribute('x2',Math.max(p.label.x,Math.min(p.x,p.label.x+p.label.width)));leader.setAttribute('y2',p.label.y);
    });
    svg.querySelectorAll('.map-edge').forEach(edge=>{
      const [x1,y1]=xy(Number(edge.dataset.from)),[x2,y2]=xy(Number(edge.dataset.to));
      for(const [key,value] of Object.entries({x1,y1,x2,y2}))edge.setAttribute(key,value);
    });
  }
  function finishMotion(){
    cancelAnimationFrame(frame);frame=0;
    for(const [id,p] of targetLayout)positions.set(id,p);
    paintPositions();root.dataset.layoutState='settled';
    motionButton.textContent=motionPreference.matches?'Reduced motion':'Replay settling';
    motionButton.disabled=motionPreference.matches;
  }
  function animateLayout(){
    cancelAnimationFrame(frame);frame=0;
    if(motionPreference.matches||!visible.length){finishMotion();return;}
    const starts=new Map(visible.map(i=>[i,positions.get(i)])),began=performance.now();
    root.dataset.layoutState='settling';motionButton.textContent='Settle now';motionButton.disabled=false;
    function tick(now){
      if(abort.signal.aborted)return;
      const t=Math.min(1,(now-began)/900),ease=1-(1-t)**3;
      for(const [id,to] of targetLayout){
        const from=starts.get(id),mix=(a,b)=>a+(b-a)*ease;
        positions.set(id,{x:mix(from.x,to.x),y:mix(from.y,to.y),r:to.r,label:{...to.label,x:mix(from.label.x,to.label.x),y:mix(from.label.y,to.label.y)}});
      }
      paintPositions();if(t<1)frame=requestAnimationFrame(tick);else finishMotion();
    }
    frame=requestAnimationFrame(tick);
  }
  function choose(i){selected=i;pinned=true;articleLimit=6;revealed.add(i);pages[i].nearest.forEach(n=>revealed.add(n.index));query='';root.querySelector('input').value='';render();svg.querySelector(`[data-index="${i}"]`)?.focus({preventScroll:true});}
  function render(replay=false){
    if(!pages) return;
    visible=visibleIndices(pages,{limit,query,revealed:[...revealed]});svg.replaceChildren();
    const nextKey=visible.join(','),changed=replay||nextKey!==layoutKey;
    if(changed){
      cancelAnimationFrame(frame);frame=0;layoutKey=nextKey;
      targetLayout=settleLayout(pages,visible,replay?new Map():positions);
      for(const i of visible)if(replay||!positions.has(i)){
        const [x,y]=pointPosition(pages[i]),to=targetLayout.get(i);
        positions.set(i,{x,y,r:to.r,label:{...to.label,x:to.label.x+x-to.x,y:to.label.y+y-to.y}});
      }
    }
    const list=root.querySelector('[data-map-list]');list.replaceChildren();
    for(const i of visible){const p=pages[i],[x,y]=xy(i);const a=el('g',{role:'button',tabindex:'0',class:'map-point','data-index':i,'aria-label':`${p.title}: ${p.articles.length} articles`});
      const label=positions.get(i).label,lx=label.x>x?label.x:label.x+label.width;
      a.append(el('line',{x1:x,y1:y,x2:lx,y2:label.y,class:'map-label-leader'}),el('circle',{cx:x,cy:y,r:nodeRadius(p),fill:color(p)}),el('text',{x:label.x,y:label.y+5},p.title),el('title',{},`${p.title} — ${p.articles.length} distinct articles`));
      a.addEventListener('pointerenter',()=>{if(!pinned){articleLimit=6;inspect(i);}});a.addEventListener('focus',()=>{if(!pinned)inspect(i);});a.addEventListener('click',()=>choose(i));a.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();choose(i);}});svg.append(a);
      const li=document.createElement('li'),link=document.createElement('button');link.textContent=`${p.title} (${p.articles.length})`;link.onclick=()=>choose(i);li.append(link);list.append(li);
    }
    status.textContent=`${visible.length} of ${pages.length} concepts · ${coverage}/${articles.length} articles linked`;
    if(visible.length) inspect(visible.includes(selected)?selected:visible[0]);else putCopy(aside,'runtime_map.no_matches');
    paintPositions();if(changed)animateLayout();
  }
  motionButton.addEventListener('click',()=>{if(frame)finishMotion();else render(true);},{signal:abort.signal});
  motionPreference.addEventListener('change',()=>{if(motionPreference.matches)finishMotion();else{motionButton.disabled=false;motionButton.textContent='Replay settling';}},{signal:abort.signal});
  root.querySelector('input').addEventListener('input',e=>{pinned=false;articleLimit=6;query=e.target.value;render();},{signal:abort.signal});
  root.querySelector('[data-map-more]').addEventListener('click',()=>{limit+=40;render();},{signal:abort.signal});
  root.querySelector('[data-map-reset]').addEventListener('click',()=>{pinned=false;articleLimit=6;limit=40;selected=0;revealed.clear();query='';root.querySelector('input').value='';render();},{signal:abort.signal});
  fetch(root.dataset.mapUrl || '/preview-corpus/similarity.json',{signal:abort.signal,cache:'no-cache'}).then(r=>{if(!r.ok)throw Error('Map unavailable');return r.json();}).then(data=>{if(!abort.signal.aborted){articles=data.pages;pages=data.nodes;coverage=data.coveredArticles;render();}}).catch(e=>{if(!abort.signal.aborted)status.textContent=e.message;});
  return ()=>{cancelAnimationFrame(frame);abort.abort();motionButton.remove();};
}
