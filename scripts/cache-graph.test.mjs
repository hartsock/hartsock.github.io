import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {posix} from 'node:path';
import {copy, installCopyDocument} from './copy-fixture.mjs';

// This migration's pre-change asset graph. Keep the baseline fixed: comparing
// only the latest commit misses parents changed earlier in a stacked migration.
const BASE = '98bd881d263cb522b54f283ee103ae6e0fb299d6';
const git = (...args) => execFileSync('git', args, {encoding:'utf8'});
const files = git('ls-files').trim().split('\n');
const oldFiles = git('ls-tree', '-r', '--name-only', BASE).trim().split('\n');
const isModule = file => /^(assets\/js|courses\/app)\/.*\.js$/.test(file);
const baselineFiles=oldFiles.filter(file => isModule(file) || /\.(html|md)$/.test(file));
const blobs=execFileSync('git',['cat-file','--batch'],{
  input:baselineFiles.map(file=>BASE+':'+file).join('\n')+'\n',maxBuffer:16*1024*1024,
});
let offset=0;
const old=new Map(baselineFiles.map(file=>{
  const end=blobs.indexOf(10,offset), header=blobs.subarray(offset,end).toString();
  assert.match(header,/^[a-f0-9]+ blob [0-9]+$/);
  const size=Number(header.split(' ')[2]);
  const source=blobs.subarray(end+1,end+1+size).toString();offset=end+size+2;
  return [file,source];
}));
const current = new Map(files.filter(file => isModule(file) || /\.(html|md)$/.test(file))
  .flatMap(file => {try {return [[file,readFileSync(file,'utf8')]];} catch {return [];}}));
const origin = 'https://cache.test/';
const fileOf = url => new URL(url,origin).pathname.slice(1);
const resolve = (owner, specifier) => new URL(specifier, new URL(owner,origin)).href;
const escape = value => value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');

// Includes imports/re-exports, registry strings passed to import(source), and
// worker URLs. Expand template paths over the actual module files (course views).
function dependencies(owner, source, tree) {
  const urls=[];
  for (const match of source.matchAll(/(['"`])((?:\.\.?\/|\/)[^'"`\n]*?\.js(?:\?[^'"`\n]*)?)\1/g)) {
    const specifier=match[2];
    if (specifier.includes('${')) {
      const [pathname,query='']=specifier.split('?');
      const pattern=new RegExp('^'+pathname.split(/\$\{[^}]+\}/).map(escape).join('[^/]+')+'$');
      const matches=[...tree.keys()].filter(isModule).map(file => './'+posix.relative(posix.dirname(fileOf(owner)),file)).filter(file => pattern.test(file));
      assert.ok(matches.length,'Unresolved dynamic module path: '+specifier);
      urls.push(...matches.map(path => resolve(owner,path+(query?'?'+query:''))));
    } else urls.push(resolve(owner,specifier));
  }
  return [...new Set(urls)];
}
function entries(tree) {
  const result=[];
  for(const [file,source] of tree) {
    if(!/\.(html|md)$/.test(file)) continue;
    const rendered=source.replace(/\{\{\s*['"]([^'"]+)['"]\s*\|\s*relative_url\s*\}\}/g,'$1');
    for(const match of rendered.matchAll(/<script\b[^>]*\bsrc=['"]([^'"]+)['"]/g)) {
      const url=resolve('/'+file,match[1]);
      if(url.startsWith(origin)) result.push({owner:file,url});
    }
  }
  assert.ok(result.length,'No local script entry points discovered');
  return result;
}
function graph(tree) {
  const edges=[...entries(tree)], visited=new Set();
  for(let i=0;i<edges.length;i++) {
    const {url}=edges[i];
    if(visited.has(url)) continue;
    visited.add(url);
    const source=tree.get(fileOf(url));
    assert.equal(typeof source,'string','Missing local module: '+url);
    edges.push(...dependencies(url,source,tree).map(child => ({owner:fileOf(url),url:child})));
  }
  return {edges,visited};
}
const baseline=graph(old), head=graph(current);
const changed=new Set([...current].filter(([file,text]) => isModule(file) && old.get(file)!==text).map(([file])=>file));

test('every changed module has a fresh URL through every entry and transitive import',()=>{
  const stale=[];
  for(const {owner,url} of head.edges) {
    const path=fileOf(url);
    if(!changed.has(path) || !old.has(path)) continue;
    const version=new URL(url).searchParams.get('v');
    const oldVersions=[...baseline.visited].filter(u=>fileOf(u)===path).map(u=>new URL(u).searchParams.get('v'));
    if(!version || oldVersions.includes(version)) stale.push(owner+' -> '+path+' ('+(version||'unversioned')+')');
  }
  for(const file of changed) assert.ok([...head.visited].some(url=>fileOf(url)===file),'Changed module not reached from a page entry: '+file);
  assert.deepEqual(stale,[],'Stale changed modules:\n'+stale.join('\n'));
  console.log(`Cache graph: ${entries(current).length} entry points; ${head.visited.size} module URLs; ${changed.size} changed modules; all fresh.`);
});

test('a warm base cache reaches edited Markdown findings through the production settings path',async()=>{
  installCopyDocument();
  const previous=copy.model_findings.smollm_small;
  copy.model_findings.smollm_small='REVIEW CACHE SENTINEL';
  const cachedSource=url => (baseline.visited.has(url)?old:current).get(fileOf(url));
  const entry=entries(current).find(({url})=>fileOf(url)==='assets/js/site.js');
  assert.ok(entry);
  const inference=dependencies(entry.url,cachedSource(entry.url),current).find(url=>fileOf(url)==='assets/js/inference.js');
  assert.ok(inference,'Production settings import found');
  const compiled=new Map();
  function moduleURL(url) {
    if(compiled.has(url)) return compiled.get(url);
    // These settings dependencies are static ESM. Dynamic runtime imports stay
    // dormant: the probe neither downloads a model nor starts a worker.
    const source=cachedSource(url).replace(/\bfrom\s*(['"])(\.[^'"]+)\1/g,
      (_match,_quote,path)=>'from '+JSON.stringify(moduleURL(resolve(url,path))));
    const data='data:text/javascript;base64,'+Buffer.from(source).toString('base64');
    compiled.set(url,data);return data;
  }
  let loaded;
  try {
    loaded=await import(moduleURL(inference));
    assert.equal(loaded.BROWSER_MODELS[0].finding,'REVIEW CACHE SENTINEL');
    console.log('Warm-cache settings finding: '+loaded.BROWSER_MODELS[0].finding);
  } finally {copy.model_findings.smollm_small=previous;loaded?.connection.unload();}
});
