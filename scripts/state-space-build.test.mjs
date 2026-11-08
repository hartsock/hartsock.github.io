// Generated JS is exempt only with verifiable Markdown-owned copy and build receipts.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve,relative} from 'node:path';
const root=resolve(import.meta.dirname,'..');
const text=path=>readFileSync(resolve(root,path),'utf8').replace(/\r\n/g,'\n');
function files(path){return readdirSync(resolve(root,path),{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(`${path}/${e.name}`):[`${path}/${e.name}`]);}
test('explorer artifacts have source receipts and match the Markdown copy owner',()=>{
  const receipt=JSON.parse(text('labs/state-space-explorer/build-receipt.json'));
  assert.equal(receipt.version,1);
  assert.ok(receipt.inputs['_copy/state-space-explorer.md']);
  assert.ok(receipt.inputs['_tools/state-space-explorer/package-lock.json']);
  for(const [path,hash]of Object.entries({...receipt.inputs,...receipt.outputs})){
    assert.ok(resolve(root,path).startsWith(root+'/')||resolve(root,path).startsWith(root+'\\'));
    assert.equal(createHash('sha256').update(text(path)).digest('hex'),hash,`Stale generated artifact or source: ${path}. Run generate and build.`);
  }
  assert.deepEqual(Object.keys(receipt.outputs).sort(),files('labs/state-space-explorer').filter(p=>!p.endsWith('/build-receipt.json')).sort());
  for(const p of files('_tools/state-space-explorer/src'))assert.ok(receipt.inputs[p],`Unreceipted source: ${p}`);
  const markdown=text('_copy/state-space-explorer.md');
  const authoritative=JSON.parse(markdown.split('---')[1]).copy.ui;
  assert.deepEqual(JSON.parse(text('_tools/state-space-explorer/public/prose.json')),authoritative);
  assert.deepEqual(JSON.parse(text('labs/state-space-explorer/prose.json')),authoritative);
  const data=JSON.parse(text('labs/state-space-explorer/synthetic-boolean8.json'));
  assert.equal(data.states.length,256);
  assert.ok(data.states.every(s=>s.provenance==='synthetic'));
  assert.equal(data.dimensions.length,8);
});
