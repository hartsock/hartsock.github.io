import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {labCopy, copy, installCopyDocument} from './copy-fixture.mjs';
import {labDOM} from './lab-dom-fixture.mjs';
import {copyText} from '../assets/js/copy.js';
import {BROWSER_MODELS} from '../assets/js/browser-models.js';
import {mount as chatMount} from '../assets/js/chat-lab.js';
import {mount as comparisonMount, compareModels} from '../assets/js/model-comparison.js';
import {CASES} from '../assets/js/lab-protocol.js';

const tick = () => new Promise(resolve => setTimeout(resolve, 0));
const connection = () => ({unload() {},emit() {}});
test('review slugs resolve all six reviews without interpreting model IDs as paths', () => {
  installCopyDocument('browser-chat');
  assert.equal(new Set(BROWSER_MODELS.map(m => m.reviewKey)).size, 6);
  for (const model of BROWSER_MODELS) {
    assert.match(model.reviewKey, /^[a-z_]+$/);
    assert.equal(copyText('reviews.' + model.reviewKey), labCopy['browser-chat'].reviews[model.reviewKey]);
    assert.ok(model.finding);
  }
});
test('every page runtime key belongs to the page mounting that module', () => {
  for (const [slug, module, group] of [['browser-chat','chat-lab','lab_chat'],['model-comparison','model-comparison','lab_comparison']]) {
    const source = readFileSync('assets/js/' + module + '.js', 'utf8');
    const keys = [...source.matchAll(/'(lab_chat|lab_comparison|lab_prompt)\.([a-z_]+)'/g)];
    assert.ok(keys.length > 10);
    for (const [,g,k] of keys) assert.equal(typeof labCopy[slug][g]?.[k], 'string', slug + ':' + g + '.' + k);
    assert.equal(typeof labCopy[slug][group], 'object');
  }
});
test('published numbers and the ungrounded prompt stay tied to the actual protocol', () => {
  assert.equal(CASES.length, 6);
  assert.match(labCopy['browser-chat'].lab_chat.smoke_complete, /^Six replies/);
  assert.equal(labCopy['browser-chat'].lab_prompt.ungrounded, 'You are a helpful concise assistant.');
  const originalTrio = BROWSER_MODELS.filter(m => [0,1,3].includes(BROWSER_MODELS.indexOf(m)));
  assert.equal((originalTrio.reduce((sum,m) => sum+m.mb,0)/1000).toFixed(1), '1.1');
  assert.match(labCopy['model-comparison'].comparison_ui.download_help, /1\.1 GB/);
});
test('a headless comparison retains a coded odds failure', async () => {
  let result;
  await compareModels({stop() {},async load() {},async nextWord() {return [];}}, [{id:'test',label:'test'}], 'Hi', {onUpdate:r => {result=r;}});
  assert.equal(result.error, 'no-next-token-odds');
  installCopyDocument('model-comparison');
  assert.equal(copyText('lab_comparison.no_odds'), 'This model did not return next-token odds.');
});
test('browser controls, copy addresses and disposal survive leaving and remounting the lab', async () => {
  const oldFetch = globalThis.fetch;
  globalThis.fetch = async () => ({ok:true,json:async () => ({title:'Fixture',content:'Public fixture',authors:[],url:'/fixture/',status:'draft'})});
  try {
    for (let visit=0;visit<2;visit++) {
      const {$,root,chip,document} = labDOM('browser-chat');
      let settings=0;
      const dispose = chatMount(root, {conn:connection(),openSettings:() => settings++});
      await tick();
      assert.equal($('cards').children.length, 6);
      assert.equal($('cards').children[0].children[3].attributes['data-md-key'], 'copy.reviews.smollm_small');
      $('prompt').value='Hello'; $('prompt').dispatchEvent(new Event('input'));
      assert.equal($('send').disabled,false);
      assert.equal($('send').attributes['data-md-key'],'copy.lab_chat.send');
      $('model').dispatchEvent(new Event('change'));
      assert.equal($('status').attributes['data-md-key'], 'copy.lab_chat.selection_changed');
      $('cancel-load').click();
      assert.equal($('status').attributes['data-md-key'], 'copy.lab_chat.cancelled');
      assert.equal($('prompt').value,'Hello');
      $('clear').click(); assert.equal($('status').textContent,'New conversation.');
      assert.equal($('status').attributes['data-md-key'],undefined);
      $('settings').click(); assert.equal(settings,1);
      document.body.dispatchEvent(new Event('htmx:beforeHistorySave'));
      assert.equal($('prompt').value,'');
      dispose();assert.equal(chip.disabled,false);
      $('settings').click();assert.equal(settings,1,'disposed handlers do not fire');
    }
  } finally {globalThis.fetch=oldFetch;}
});
test('comparison selectors, token stepping, history privacy and cleanup survive a page swap', async () => {
  const oldFetch=globalThis.fetch;
  const capture=JSON.parse(readFileSync('assets/data/model-comparison.json','utf8'));
  globalThis.fetch=async () => ({ok:true,json:async () => structuredClone(capture)});
  try {
    for(let visit=0;visit<2;visit++) {
      const {$,root,chip,document}=labDOM('model-comparison');
      const dispose=comparisonMount(root,{conn:connection()});await tick();
      const first=root.groups['[data-comparison-card]'][0];
      assert.equal(first.nodes.select.children.length,6);
      first.nodes.select.dispatchEvent(new Event('change'));
      assert.equal(first.nodes['[data-selection-note]'].attributes['data-md-key'],'copy.lab_comparison.selected');
      assert.equal($('step').textContent,'Token 1 of 8');
      $('next').click();assert.equal($('step').textContent,'Token 2 of 8');
      $('back').click();assert.equal($('step').textContent,'Token 1 of 8');
      const other=first.nodes['[data-odds]'].children.at(-1);
      assert.equal(other.attributes['data-md-key'],'copy.lab_comparison.other_tokens');
      assert.match(other.textContent,/Bars are not rescaled/);
      assert.equal(first.nodes['[data-completion]'].dataset.evidence,'model-comparison');
      $('stop').click();assert.equal($('status').attributes['data-md-key'],'copy.lab_comparison.stopped');
      $('opening').value='private draft';document.body.dispatchEvent(new Event('htmx:beforeHistorySave'));
      assert.equal($('opening').value,'');assert.equal(first.nodes['[data-completion]'].textContent,'');
      dispose();assert.equal(chip.disabled,false);
      const before=$('status').textContent;document.dispatchEvent(new Event('site:chat-start'));
      assert.equal($('status').textContent,before);
    }
  } finally {globalThis.fetch=oldFetch;}
});

test('cold Send, six smoke replies and export retain their controls and copy', async () => {
  const {BrowserSession}=await import('../assets/js/browser-session.js');
  const oldLoad=BrowserSession.prototype.load, oldComplete=BrowserSession.prototype.complete;
  const oldFetch=globalThis.fetch, oldGPU=Object.getOwnPropertyDescriptor(navigator,'gpu');
  const messages=[];
  Object.defineProperty(navigator,'gpu',{configurable:true,value:{}});
  BrowserSession.prototype.load=async function() {this.engine={};};
  BrowserSession.prototype.complete=async (_messages,{onText}) => {
    messages.push(structuredClone(_messages));onText('Fixture reply');
    return {answer:'Fixture reply',firstTokenSeconds:1,seconds:2};
  };
  globalThis.fetch=async () => ({ok:true,json:async () => ({title:'Fixture',content:'Public fixture',authors:[],url:'/fixture/',status:'draft'})});
  let dispose;
  try {
    const {$,root}=labDOM('browser-chat');dispose=chatMount(root,{conn:connection(),openSettings() {}});await tick();
    $('prompt').value='Hello';$('form').dispatchEvent(new Event('submit',{cancelable:true}));await tick();
    assert.equal(messages[0][0].content,'You are a helpful concise assistant.');
    assert.equal($('prompt').value,'');assert.equal($('loading').open,false);
    assert.equal($('status').attributes['data-md-key'],'copy.lab_chat.complete');
    assert.equal($('chat').children[1].children[1].dataset.evidence,'lab-conversation');
    $('smoke').click();await tick();
    assert.equal(messages.length,7);assert.equal($('tests').children.length,18);
    assert.equal($('status').attributes['data-md-key'],'copy.lab_chat.smoke_complete');
    $('export').click();assert.equal($('save').hidden,false);assert.match($('save').href,/^blob:/);
    assert.equal($('status').attributes['data-md-key'],'copy.lab_chat.exported');
    $('stop').click();assert.equal($('status').attributes['data-md-key'],'copy.lab_chat.stopped');
  } finally {
    dispose?.();BrowserSession.prototype.load=oldLoad;BrowserSession.prototype.complete=oldComplete;globalThis.fetch=oldFetch;
    if(oldGPU) Object.defineProperty(navigator,'gpu',oldGPU);else delete navigator.gpu;
  }
});

test('load failures keep the draft and address the composed error notice', async () => {
  const {BrowserSession}=await import('../assets/js/browser-session.js');
  const oldLoad=BrowserSession.prototype.load,oldFetch=globalThis.fetch,oldGPU=Object.getOwnPropertyDescriptor(navigator,'gpu');
  Object.defineProperty(navigator,'gpu',{configurable:true,value:{}});
  BrowserSession.prototype.load=async () => {throw new Error('fixture failed');};
  globalThis.fetch=async () => ({ok:true,json:async () => ({title:'Fixture',content:'Public fixture',authors:[]})});
  let dispose;
  try {
    const {$,root}=labDOM('browser-chat');dispose=chatMount(root,{conn:connection(),openSettings() {}});await tick();
    $('prompt').value='Keep this draft';$('form').dispatchEvent(new Event('submit',{cancelable:true}));await tick();
    assert.equal($('prompt').value,'Keep this draft');
    assert.equal($('status').attributes['data-md-key'],'copy.lab_chat.not_sent');
    assert.match($('status').textContent,/fixture failed Your message has not been sent/);
  } finally {
    dispose?.();BrowserSession.prototype.load=oldLoad;globalThis.fetch=oldFetch;
    if(oldGPU) Object.defineProperty(navigator,'gpu',oldGPU);else delete navigator.gpu;
  }
});

test('runtime messages and all six reviews match captured base wording',()=>{
  installCopyDocument();
  const golden=JSON.parse(readFileSync('scripts/fixtures/lab-messages.json','utf8'));
  assert.equal(golden.cases.length,48);
  for(const item of golden.cases) assert.equal(copyText(item.key,item.vars),item.text,item.key);
});

test('live comparison clears prior copy addresses, runs all pickers and prepares an export',async()=>{
  const {BrowserSession}=await import('../assets/js/browser-session.js?v=model-comparison-1');
  const oldLoad=BrowserSession.prototype.load,oldNext=BrowserSession.prototype.nextWord;
  const oldFetch=globalThis.fetch,oldGPU=Object.getOwnPropertyDescriptor(navigator,'gpu');
  const loaded=[];
  Object.defineProperty(navigator,'gpu',{configurable:true,value:{}});
  BrowserSession.prototype.load=async function(id){loaded.push(id);this.engine={};};
  BrowserSession.prototype.nextWord=async()=>[{token:' word',logprob:Math.log(.25)}];
  globalThis.fetch=async()=>({ok:false});
  let dispose;
  try {
    const {$,root,chip}=labDOM('model-comparison');dispose=comparisonMount(root,{conn:connection()});await tick();
    const first=root.groups['[data-comparison-card]'][0];
    first.nodes.select.dispatchEvent(new Event('change'));
    $('opening').value='Fixture';$('form').dispatchEvent(new Event('submit',{cancelable:true}));await tick();
    assert.equal(loaded.length,3);assert.equal($('step').textContent,'Token 1 of 8');
    assert.equal(first.nodes['[data-selection-note]'].attributes['data-md-key'],undefined);
    assert.equal($('status').attributes['data-md-key'],'copy.lab_comparison.finished');
    assert.equal(chip.disabled,false);$('export').click();assert.equal($('save').hidden,false);assert.match($('save').href,/^blob:/);
    BrowserSession.prototype.nextWord=async()=>[];
    $('form').dispatchEvent(new Event('submit',{cancelable:true}));await tick();
    const provenance=first.nodes['[data-provenance]'];
    assert.equal(provenance.children[0].attributes['data-md-key'],'copy.lab_comparison.no_odds');
    assert.match(provenance.textContent,/This model did not return next-token odds\./);
  } finally {
    dispose?.();BrowserSession.prototype.load=oldLoad;BrowserSession.prototype.nextWord=oldNext;globalThis.fetch=oldFetch;
    if(oldGPU) Object.defineProperty(navigator,'gpu',oldGPU);else delete navigator.gpu;
  }
});
