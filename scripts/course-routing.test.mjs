import test from 'node:test';
import assert from 'node:assert/strict';
import {legacyPath, start} from '../courses/app/router.js';
test('legacy course hash paths redirect to server-rendered routes', () => {
  assert.equal(legacyPath('#/'), '/courses/');
  assert.equal(legacyPath('#/ai-theology'), '/courses/ai-theology/');
  assert.equal(legacyPath('#/ai-theology/session-3'), '/courses/ai-theology/session-3/');
  for (const hash of ['#heading', '#//evil.test', '#/../secret', '#/a?b']) assert.equal(legacyPath(hash), null);
});
test('course navigation survives disposal and remount without replacing page content', async () => {
  const oldWindow=globalThis.window, oldLocation=globalThis.location;
  globalThis.window=new EventTarget(); let target;
  globalThis.location={hash:'',replace(path){target=path;}};
  try {
    const view={dataset:{},replaceChildren(){assert.fail('Server content must survive');}};
    const stop=await start(view,{}); location.hash='#/ai-theology'; window.dispatchEvent(new Event('hashchange'));
    assert.equal(target,'/courses/ai-theology/');stop();target=null;
    window.dispatchEvent(new Event('hashchange'));assert.equal(target,null);
    location.hash='';const again=await start(view,{});location.hash='#/ai-theology/session-3';window.dispatchEvent(new Event('hashchange'));
    assert.equal(target,'/courses/ai-theology/session-3/');again();
  } finally {globalThis.window=oldWindow;globalThis.location=oldLocation;}
});
