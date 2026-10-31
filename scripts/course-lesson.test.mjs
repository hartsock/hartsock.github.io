import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {Element} from './lab-dom-fixture.mjs';
import {Fragment} from './copy-fixture.mjs';
import {mount, lessonValues} from '../courses/app/views/session3.js';
const page=JSON.parse(execFileSync('ruby',['-ryaml','-rjson','-e','puts JSON.generate(YAML.load_file(ARGV[0]))','courses/ai-theology/session-3/index.md'],{encoding:'utf8'}));
const captures=Object.fromEntries(['next_word','meaning_map','meaning_map_3d'].map(name=>[name,JSON.parse(readFileSync('courses/content/ai-theology/session-3/'+name+'.json'))]));
const golden=JSON.parse(readFileSync('scripts/fixtures/course-runtime.json','utf8'));
const tick=()=>new Promise(resolve=>setImmediate(resolve));
function fixture() {
 const root=new Element();root.nodes={};
 const ids=[...readFileSync('courses/app/views/session3.js','utf8').matchAll(/\$\(['"]#([^'"]+)['"]\)/g)].map(m=>m[1]);
 for(const id of [...ids,'back','fwd','draw'])root.nodes['#'+id]=new Element();
 const make=()=>{const e=new Element();e.classList={toggle(){}};return e;};
 globalThis.document={createElement:make,createElementNS:make,createTextNode:text=>new Fragment(text),createDocumentFragment:()=>new Fragment(),querySelector(selector){
  const key=selector.match(/data-copy="([a-z_.]+)"/)?.[1];const [group,name]=(key||'').split('.');const value=page.copy[group]?.[name];
  return value===undefined?null:{content:new Fragment(value),dataset:{md:'courses/ai-theology/session-3/index.md',mdKey:'copy.'+key}};
 }};
 globalThis.Option=function(text,value){const e=new Element();e.textContent=text;e.value=value;return e;};
 globalThis.fetch=async url=>({json:async()=>captures[String(url).match(/(next_word|meaning_map_3d|meaning_map)\.json/)[1]]});
 const ctx=new Proxy({draws:0},{get:(t,k)=>k in t?t[k]:k==='clearRect'?()=>t.draws++:k==='measureText'?()=>({width:0}):()=>{},set:(t,k,v)=>(t[k]=v,true)});
 Object.assign(root.nodes['#map3dCanvas'],{width:720,height:520,getContext:()=>ctx,setPointerCapture(){},getBoundingClientRect:()=>({left:0,top:0,width:720,height:520})});
 document.documentElement=new Element();globalThis.getComputedStyle=()=>({getPropertyValue:()=>''});
 const media=new EventTarget(),observers=[];globalThis.matchMedia=()=>media;
 globalThis.MutationObserver=class{constructor(){this.live=true;observers.push(this);}observe(){}disconnect(){this.live=false;}};
 const conn=new EventTarget();Object.assign(conn,{settings:{backend:'browser',browserModel:'Qwen3.5-0.8B-q4f16_1-MLC'},status:{state:'ready'},ready:()=>true,describe:()=> 'Test model',nextWord:async()=>[{token:' word',logprob:0}],chat:async messages=>{conn.messages=messages;return 'Reply';},update(patch){Object.assign(this.settings,patch);}});
 return {root,conn,ctx,media,observers,$:id=>root.nodes['#'+id]};
}
test('lesson widgets step, ask, dispose and remount without duplicate listeners or stale replies',async()=>{
 const originals={document:globalThis.document,fetch:globalThis.fetch,Option:globalThis.Option,getComputedStyle:globalThis.getComputedStyle,matchMedia:globalThis.matchMedia,MutationObserver:globalThis.MutationObserver};
 try {
  const {root,conn,ctx,media,observers,$}=fixture();let settings=0;
  let stop=await mount(root,{conn,openSettings(){settings++;}});
  const optionCount=$('promptSel').children.length, nodeCount=$('mapSvg').children.length;
  $('fwd').click();assert.match($('where').textContent,/Word 2/);
  $('askBox').value='Question';$('askBtn').click();await tick();
  assert.equal(conn.messages[0].content,golden.prompt);assert.match($('answer').textContent,/Reply/);
  stop();const before=$('where').textContent;$('fwd').click();assert.equal($('where').textContent,before);
  stop=await mount(root,{conn,openSettings(){settings++;}});
  assert.equal($('promptSel').children.length,optionCount);assert.equal($('mapSvg').children.length,nodeCount);
  $('fwd').click();assert.match($('where').textContent,/Word 2/);
  assert.equal($('pick3dWord').textContent,'grace');const draws=ctx.draws;
  $('map3dCanvas').dispatchEvent(Object.assign(new Event('keydown'),{key:'ArrowLeft'}));assert.equal(ctx.draws,draws+1);
  media.dispatchEvent(new Event('change'));assert.equal(ctx.draws,draws+2);assert.equal(observers.filter(o=>o.live).length,1);
  $('liveModel').value='@settings';$('liveModel').dispatchEvent(new Event('change'));assert.equal(settings,1);
  $('tabLive').click();$('livePrompt').value='The soul is';$('liveRun').click();await tick();assert.match($('liveStatus').textContent,/Done/);
  let resolve;conn.chat=()=>new Promise(r=>resolve=r);$('askBtn').click();await tick();stop();resolve('Late answer');await tick();assert.doesNotMatch($('answer').textContent,/Late answer/);
 } finally {Object.assign(globalThis,originals);}
});
test('lesson values and quotation remain tied to sealed captures',()=>{
 const n=captures.next_word,m=captures.meaning_map,m3=captures.meaning_map_3d,v=page.values;assert.deepEqual(v,lessonValues(n,m,m3));
 assert.equal(v.map3dId,m3.capture_id);assert.equal(m3.model,m.model);assert.equal(m3.dimensions,m.dimensions);assert.deepEqual(m3.words.map(w=>[w.word,w.group]),m.words.map(w=>[w.word,w.group]));assert.equal(v.dimensions,String(m.dimensions));assert.equal(v.nextId,n.capture_id);assert.equal(v.mapId,m.capture_id);
 const l=n.prompts.find(p=>p.kind==='lovelace');assert.equal(page.evidence.lovelace,l.steps.slice(0,3).map(s=>s.chosen).join('').trim());assert.equal(v.lovelaceOdds,String(Math.round(Math.exp(l.steps[0].candidates[0].logprob)*100)));
 for(const phrase of ['Say when you are unsure','Do not claim feelings, beliefs or religious authority','Do not tell people what to believe','describe positions fairly'])assert.ok(page.copy.lesson_prompt.assistant.includes(phrase));
});

test('lesson instructions and migrated static states preserve captured base bytes',()=>{
 assert.equal(page.copy.lesson_prompt.assistant,golden.prompt);
 for(const [key,text] of Object.entries(page.copy.lesson_state)) {
  if(!text.includes('{')) assert.ok(golden.literals.includes(text),key);
 }
});
