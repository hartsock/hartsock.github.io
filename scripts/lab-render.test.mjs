import {spawnSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import test from 'node:test';
import {labCopy} from './copy-fixture.mjs';
const ruby=String.raw`
require 'jekyll'
require 'json'
Jekyll::PluginManager.require_from_bundler
site=Jekyll::Site.new(Jekyll.configuration('quiet'=>true,'safe'=>true))
site.reset;site.read
input=JSON.parse(STDIN.read)
lab=site.pages.find { |p| p.url=='/labs/browser-chat/' }
if input['edit']
 lab.data['card']['title']='Edited card'
 lab.data['copy']['lab_chat']['ready']='Edited ready message.'
 lab.data['copy']['reviews']['qwen_default']='Edited model review.'
end
if input['broken']
 lab.content=lab.content.sub(input['broken'], '')
end
site.generate;site.render
pages=site.pages.select { |p| ['/labs/','/labs/browser-chat/','/labs/model-comparison/','/all/'].include?(p.url) }
puts '\nLAB_RENDER\n'
puts JSON.generate(pages.to_h { |p| [p.url,p.output] })
`;
function render(input={}) {
  return spawnSync('bundle',['exec','ruby','-e',ruby],{encoding:'utf8',input:JSON.stringify(input),maxBuffer:4*1024*1024,
    env:{...process.env,JEKYLL_ENV:'production',PAGES_REPO_NWO:'hartsock/hartsock.github.io'}});
}
const decode=text=>text.replace(/&(?:quot|#39|apos|lt|gt|amp);/g,e=>({'&quot;':'"','&#39;':"'",'&apos;':"'",'&lt;':'<','&gt;':'>','&amp;':'&'}[e]));
const main=html=>html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)[1];
const text=html=>decode(html.replace(/<[^>]*>/g,' ')).replace(/\s+/g,' ').trim();
function pages(result) {assert.equal(result.status,0,result.stderr);return JSON.parse(result.stdout.split('\\nLAB_RENDER\\n\n')[1]);}

test('lab readers and all-page links see the exact captured base text and destinations',()=>{
  const output=pages(render());const golden=JSON.parse(readFileSync('scripts/fixtures/lab-render.json','utf8'));
  for(const slug of ['labs','labs/browser-chat','labs/model-comparison']) {
    assert.equal(text(main(output['/'+slug+'/'])),golden[slug],slug);
    assert.doesNotMatch(main(output['/'+slug+'/']),/data-copy=|\{widget /);
  }
  assert.deepEqual([...main(output['/all/']).matchAll(/href="([^"]+)"/g)].map(m=>m[1]),golden.all_links);
  for(const [slug,groups] of Object.entries(labCopy)) {
    const html=output['/labs/'+slug+'/'];
    for(const [group,entries] of Object.entries(groups).filter(([g])=>['lab_chat','lab_comparison','lab_prompt','reviews'].includes(g))) {
      for(const [key,value] of Object.entries(entries)) {
        const marker=`<template data-copy="${group}.${key}" data-md="labs/${slug}/index.md" data-md-key="copy.${group}.${key}">`;
        const at=html.indexOf(marker);assert.ok(at>html.indexOf('</main>'),group+'.'+key);
        assert.ok(at<html.indexOf('<footer class="site-footer">'));
        assert.equal(decode(html.slice(at+marker.length,html.indexOf('</template>',at))),value);
      }
    }
  }
  assert.match(output['/labs/model-comparison/'],/<h1[^>]*>One opening\.<br>Three different continuations\.<\/h1>/);
  assert.equal((main(output['/labs/browser-chat/']).match(/<details/g)||[]).length,3);
  assert.match(main(output['/labs/browser-chat/']),/<button[^>]*data-settings>Model settings<\/button>/);
  assert.match(main(output['/labs/browser-chat/']),/<noscript><p>JavaScript and WebGPU/);
  assert.match(main(output['/labs/model-comparison/']),/<noscript><p>The three earlier/);
});
test('editing lab fields changes the actual directory card and only the owning page templates',()=>{
  const output=pages(render({edit:true}));
  assert.match(main(output['/labs/']),/<h2 data-md="labs\/browser-chat\/index.md" data-md-key="card.title">Edited card<\/h2>/);
  assert.match(output['/labs/browser-chat/'],/data-copy="lab_chat.ready"[^>]*>Edited ready message\.<\/template>/);
  assert.match(output['/labs/browser-chat/'],/data-copy="reviews.qwen_default"[^>]*>Edited model review\.<\/template>/);
  assert.doesNotMatch(output['/labs/model-comparison/'],/Edited ready|Edited model review|data-copy="lab_chat\./);
});
test('removing a semantic region boundary fails closed instead of dropping controls',()=>{
  const result=render({broken:'\n---\n'});
  assert.notEqual(result.status,0);assert.match(result.stderr,/invalid-lab-regions/);
});

for (const broken of ['{widget browser-workbench}', '{widget browser-models}', '#model-settings']) {
  test('removing required lab wiring fails the build: ' + broken,()=>{
    const result=render({broken});assert.notEqual(result.status,0);
    assert.match(result.stderr,/invalid-lab-(?:widget|settings-link)/);
  });
}
