// Real Jekyll output + a real browser DOM. No packages, models or remote requests.
// CHROME_BIN may name a locally installed Chrome/Chromium executable.
import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync, readFileSync, mkdtempSync, mkdirSync, rmSync} from 'node:fs';
import {resolve, join, extname} from 'node:path';
import {spawn, spawnSync} from 'node:child_process';
import {createServer} from 'node:http';

const probe = String.raw`
import {mount} from '/courses/app/views/session3.js';
import {start} from '/courses/app/router.js';
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const tick = () => new Promise(resolve => setTimeout(resolve, 0));
try {
 const root = document.querySelector('#view[data-app="courses"]');
 assert(root, 'Lesson course mount hook');
 const queries = new Set(), originalQuery = root.querySelector.bind(root);
 root.querySelector = selector => {
   queries.add(selector);
   const element = originalQuery(selector);
   assert(element, 'Missing built lesson selector: ' + selector);
   return element;
 };
 const $ = selector => root.querySelector(selector);
 const conn = new EventTarget();
 let asks = 0, settings = 0;
 Object.assign(conn, {settings:{backend:'browser',browserModel:'Qwen3.5-0.8B-q4f16_1-MLC'},
   status:{state:'ready'}, ready:()=>true, describe:()=> 'Test model',
   nextWord:async()=>[{token:' word',logprob:0}],
   chat:async()=>{asks++;return 'Browser fixture reply';},
   update(patch){Object.assign(this.settings,patch);}});
 const context = {conn,openSettings(){settings++;}};
 const rows = root.querySelectorAll('[data-widget="meaning-map"] tbody tr');
 const beforeRows = [...rows].map(row=>row.textContent);
 assert(beforeRows.length === 41, 'Single captured 41-row table');
 let stop = await mount(root, context);
 for (const selector of REQUIRED) assert(root.querySelectorAll(selector).length > 0, 'Selector audit: '+selector);
 const options = $('#promptSel').options.length, nodes = $('#mapSvg').children.length;
 $('#fwd').click(); assert($('#where').textContent.includes('Word 2'), 'Next word');
 $('#back').click(); assert($('#where').textContent.includes('Word 1'), 'Previous word');
 $('#temp').value='0'; $('#temp').dispatchEvent(new Event('input')); $('#draw').click();
 $('#tabLive').click(); $('#livePrompt').value='The soul is'; $('#liveRun').click();
 await tick(); await tick(); assert($('#liveStatus').textContent.includes('Done.'), 'Live odds');
 $('#liveModel').value='@settings'; $('#liveModel').dispatchEvent(new Event('change')); assert(settings===1,'Settings picker');
 $('#askBox').value='Question'; $('#askBtn').click(); await tick(); await tick();
 assert(asks===1 && $('#answer').textContent.includes('Browser fixture reply'), 'Plate 3 Ask installed');
 stop(); const stopped = $('#where').textContent;
 $('#fwd').click(); $('#askBtn').click(); await tick();
 assert($('#where').textContent===stopped && asks===1, 'Disposed handlers inactive');
 stop = await mount(root, context);
 assert($('#promptSel').options.length===options && $('#mapSvg').children.length===nodes, 'No duplicate mounts');
 $('#fwd').click(); assert($('#where').textContent.includes('Word 2'), 'One handler after remount');
 $('#askBtn').click(); await tick(); await tick(); assert(asks===2,'Ask after remount');
 assert(JSON.stringify([...root.querySelectorAll('[data-widget="meaning-map"] tbody tr')].map(row=>row.textContent))===JSON.stringify(beforeRows),'Captured table rows unchanged');
 stop();
 // Exercise actual router mounts on all three built page roots, including swaps.
 for (const path of ['/courses/','/courses/ai-theology/','/courses/ai-theology/session-3/']) {
   const html = await (await fetch(path)).text();
   const doc = new DOMParser().parseFromString(html,'text/html');
   const pageRoot=doc.querySelector('#view[data-app="courses"]');
   assert(pageRoot,'Course mount hook: '+path);
   document.body.replaceChildren(document.adoptNode(pageRoot));
   // Page-local templates must swap alongside the article.
   for(const template of doc.querySelectorAll('template[data-copy]')) document.body.append(document.adoptNode(template));
   for(let i=0;i<2;i++) {const cleanup=await start(pageRoot,context);assert(typeof cleanup==='function','Router cleanup: '+path);cleanup();}
 }
 await fetch('/result',{method:'POST',body:JSON.stringify({ok:true,selectors:[...new Set([...queries,...REQUIRED])].sort(),rows:beforeRows.length})});
} catch(error) {
 await fetch('/result',{method:'POST',body:JSON.stringify({ok:false,error:error.stack})});
}
`;

test('the built lesson mounts, asks, disposes and remounts in a browser', {timeout:120000}, async()=>{
 const browser=[process.env.CHROME_BIN,'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome','google-chrome','chromium','chromium-browser']
   .filter(Boolean).find(bin=>spawnSync(bin,['--version'],{encoding:'utf8'}).status===0);
 assert.ok(browser,'A local Chrome/Chromium is required; set CHROME_BIN if needed');
 const parent=resolve('vendor'); mkdirSync(parent,{recursive:true});
 const directory=mkdtempSync(join(parent,'course-browser-')), destination=join(directory,'site');
 let server, child;
 try {
   const build=spawnSync('bundle',['exec','jekyll','build','--safe','--destination',destination],{
     encoding:'utf8',env:{...process.env,JEKYLL_ENV:'production',PAGES_REPO_NWO:'hartsock/hartsock.github.io'},maxBuffer:8*1024*1024});
   assert.equal(build.status,0,build.stderr+'\n'+build.stdout);
   const source=readFileSync('courses/app/views/session3.js','utf8');
   // Static selectors plus computed button IDs and value-token iteration. The
   // browser additionally records every query actually made while interacting.
   const required=[...new Set([...source.matchAll(/\$\(['"](#[^'"]+)['"]\)/g)].map(m=>m[1]).concat(['#back','#fwd','#draw','[data-value]']))].sort();
   const report = new Promise((resolveReport,reject)=>{
     server=createServer((req,res)=>{
       if(req.url==='/result') {
         let body='';req.on('data',chunk=>body+=chunk);req.on('end',()=>{res.end('ok');try{resolveReport(JSON.parse(body));}catch(error){reject(error);}});return;
       }
       const pathname=new URL(req.url,'http://localhost').pathname;
       if(pathname==='/probe.js') {res.setHeader('Content-Type','text/javascript');res.end('const REQUIRED='+JSON.stringify(required)+';\n'+probe);return;}
       const path=resolve(destination,'.'+decodeURIComponent(pathname)+(pathname.endsWith('/')?'index.html':''));
       if(!path.startsWith(destination+'/') || !existsSync(path)){res.writeHead(404).end();return;}
       const type={'.html':'text/html','.js':'text/javascript','.json':'application/json','.css':'text/css'}[extname(path)] || 'application/octet-stream';
       res.setHeader('Content-Type',type);
       // Only loopback fixtures can load. Remove production scripts (including
       // the real model bootstrap); module-under-test imports stay genuine.
       res.setHeader('Content-Security-Policy',"default-src 'none'; script-src 'self'; connect-src 'self'; style-src 'unsafe-inline'; img-src data:");
       let body=readFileSync(path);
       if(type==='text/html') {
         body=body.toString().replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'');
         if(req.url.includes('?probe')) body=body.replace('</body>','<script type="module" src="/probe.js"></script></body>');
       }
       res.end(body);
     });
   });
   await new Promise(resolveListen=>server.listen(0,'127.0.0.1',resolveListen));
   const url='http://127.0.0.1:'+server.address().port+'/courses/ai-theology/session-3/?probe';
   child=spawn(browser,['--headless','--disable-gpu','--disable-background-networking','--disable-component-update','--disable-sync','--no-first-run','--no-default-browser-check','--user-data-dir='+join(directory,'profile'),url],{stdio:'ignore'});
   let timer;
   try {
     const result=await Promise.race([report,new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('Browser mount probe timed out')),45000);})]);
     assert.equal(result.ok,true,result.error);
     console.log('Built DOM selector audit: '+result.selectors.join(', '));
     console.log('Real browser: mount/Ask/dispose/remount/router page swaps passed; '+result.rows+' evidence rows unchanged.');
   } finally {clearTimeout(timer);}
 } finally {
   if(child && child.exitCode===null && child.signalCode===null) {child.kill();await new Promise(resolveExit=>child.once('exit',resolveExit));}
   if(server) {server.closeAllConnections();await new Promise(resolveClose=>server.close(resolveClose));}
   rmSync(directory,{recursive:true,force:true});
 }
});
