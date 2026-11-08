import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
import {demoDataset} from '../src/core';
import {PerspectiveCamera,Vector3} from 'three';
const route='/labs/state-space-explorer/';
test('unknown evidence does not bias dimension correlation',async({page})=>{
  await page.goto(route);await expect(page.locator('#visible-count')).toHaveText('256');const s={...demoDataset().states[3],transitions:undefined};
  const states=[{...s,state_id:'a',coordinates:[0,0,0]},{...s,state_id:'b',coordinates:[1,0,0]},{...s,state_id:'c',coordinates:[1,1,0],execution_outcome:'UNKNOWN'}];
  await page.locator('#dataset-file').setInputFiles({name:'unknown.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(states))});
  await expect(page.locator('#visible-count')).toHaveText('3');await expect(page.locator('.dimension-row .correlation').first()).toHaveText('+0pp');
});
test('unknown evidence cannot establish a policy-boundary failure',async({page})=>{
  await page.goto(route);await expect(page.locator('#visible-count')).toHaveText('256');const s=demoDataset().states[8];
  const states=[{...s,state_id:'a',coordinates:[0,0,0],policy_decision:'UNKNOWN',enforcer_2_decision:'UNKNOWN'},{...s,state_id:'b',coordinates:[1,0,0],policy_decision:'ALLOW',enforcer_2_decision:'UNKNOWN'}];
  await page.locator('#dataset-file').setInputFiles({name:'unknown.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(states))});
  await expect(page.locator('#visible-count')).toHaveText('2');await page.locator('#pin').click();await page.locator('#state-list').selectOption('1');await page.locator('#pin').click();
  await expect(page.locator('.boundary-callout')).toHaveCount(0);
});
test('A–I: render, inspect, switch projections, compare, show views, and restore',async({page})=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(route);
  await expect(page.locator('#visible-count')).toHaveText('256');
  await expect(page.locator('#edge-count')).toHaveText('1,024');
  await expect(page.locator('#inspection')).toContainText('state-0003');
  await expect(page.locator('#inspection')).toContainText('Unsafe disagreement');
  await expect(page.locator('#inspection')).toContainText('target_is_symlink');
  await expect(page.locator('#inspection .vector')).toHaveText('[1, 1, 0, 0, 0, 0, 0, 0]');
  const canvas=page.locator('#viewport canvas');await expect(canvas).toBeVisible();
  await expect.poll(()=>canvas.evaluate(c=>{const gl=(c as HTMLCanvasElement).getContext('webgl2')!;const pixel=new Uint8Array(4);gl.readPixels(100,100,1,1,gl.RGBA,gl.UNSIGNED_BYTE,pixel);return gl.isContextLost();})).toBe(false);
  // Independently project a known collision-offset marker, then click the real canvas.
  const initialBox=(await canvas.boundingBox())!;
  const camera=new PerspectiveCamera(42,initialBox.width/initialBox.height,.1,1000);camera.position.set(12,9,15);camera.lookAt(0,0,0);camera.updateMatrixWorld();
  const y=1-1/32;const radius=.20*Math.sqrt(32);const point=new Vector3(-4.5+Math.sqrt(1-y*y)*radius,-4.5+y*radius,-4.5).project(camera);
  await page.mouse.click(initialBox.x+(point.x+1)/2*initialBox.width,initialBox.y+(1-point.y)/2*initialBox.height);
  await expect(page.locator('#state-list')).not.toHaveValue('3');await page.locator('#state-list').selectOption('3');
  await page.locator('#pin').click();await page.locator('#state-list').selectOption('1');await page.locator('#pin').click();
  await expect(page.locator('#comparison')).toContainText('1 Hamming distance');
  await expect(page.locator('#comparison')).toContainText('target_is_symlink');
  await page.getByRole('button',{name:'PCA',exact:true}).click();
  await expect(page.locator('#pca-info')).toContainText('37.5');
  await page.getByRole('button',{name:'Graph',exact:true}).click();
  await expect(page.locator('#scene-title')).toHaveText('FORCE-DIRECTED LAYOUT');
  await page.locator('#views').check();await page.locator('#relationship').selectOption('overlap');
  await expect(page.locator('#edge-note')).toContainText('A ∩ B');
  await page.locator('[data-filter="unsafe"]').click();
  await expect(page.locator('#visible-count')).toHaveText('12');
  await page.locator('[data-filter="all"]').click();
  await page.locator('#state-list').selectOption('3');
  // Camera orbit and zoom change the exported view configuration.
  const box=(await canvas.boundingBox())!;await page.mouse.move(box.x+box.width*.4,box.y+box.height*.4);await page.mouse.down();await page.mouse.move(box.x+box.width*.6,box.y+box.height*.5,{steps:8});await page.mouse.up();await page.mouse.wheel(0,-200);
  await page.locator('#export').click();
  const download=page.waitForEvent('download');await page.locator('#download-config').click();const file=await download;const exported=JSON.parse(await readFile((await file.path())!,'utf8'));
  expect(exported.mode).toBe('graph');expect(exported.views).toBe(true);expect(exported.datasetHash).toHaveLength(64);expect(exported.pins).toHaveLength(2);expect(JSON.stringify(exported)).not.toContain('execution_trace');
  await page.locator('#close-export').click();await page.getByRole('button',{name:'Axis',exact:true}).click();
  await page.locator('#config-file').setInputFiles({name:'view.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(exported))});
  await expect(page.locator('#scene-title')).toHaveText('FORCE-DIRECTED LAYOUT');await expect(page.locator('#views')).toBeChecked();await expect(page.locator('#comparison .pin-chip')).toHaveCount(2);
  await page.locator('#export').click();const pngWait=page.waitForEvent('download');await page.locator('#download-png').click();const png=await pngWait;expect((await readFile((await png.path())!)).subarray(1,4).toString()).toBe('PNG');await page.locator('#close-export').click();
  await page.screenshot({path:'test-results/explorer-desktop.png',fullPage:true});
  expect(errors).toEqual([]);
});
test('share URLs restore display settings without source records or state identifiers',async({page,context})=>{
  await context.grantPermissions(['clipboard-read','clipboard-write']);await page.goto(route);await expect(page.locator('#visible-count')).toHaveText('256');
  await page.getByRole('button',{name:'PCA',exact:true}).click();await page.locator('#palette').selectOption('rainbow');await page.locator('#share').click();
  const shared=await page.evaluate(()=>navigator.clipboard.readText());const fragment=JSON.parse(decodeURIComponent(new URL(shared).hash.slice(6)));
  expect(fragment.mode).toBe('pca');expect(fragment.datasetId).toBe('');expect(fragment.selected).toBe(null);expect(fragment.pins).toEqual([]);expect(shared).not.toContain('execution_trace');
  await page.goto(shared);await expect(page.locator('#scene-title')).toHaveText('PRINCIPAL COMPONENTS');await expect(page.locator('#palette')).toHaveValue('rainbow');
});
test('J: input results remain unchanged, no transitions are invented, and bad receipts fail',async({page})=>{
  await page.goto(route);await expect(page.locator('#visible-count')).toHaveText('256');
  const fixture=demoDataset();fixture.id='import-fixture';fixture.states=fixture.states.slice(8,16).map(s=>({...s,provenance:'measured',transitions:undefined,local_views:undefined,execution_trace:undefined,command:'<script>not executed</script>'}));
  const before=JSON.stringify(fixture);
  await page.locator('#dataset-file').setInputFiles({name:'fixture.json',mimeType:'application/json',buffer:Buffer.from(before)});
  await expect(page.locator('#visible-count')).toHaveText('8');await expect(page.locator('#provenance')).toHaveText('IMPORTED · MEASURED AS DECLARED');
  await expect(page.locator('#inspection')).toContainText('Membership not supplied');await expect(page.locator('#inspection .command')).toHaveText('<script>not executed</script>');
  await page.getByRole('button',{name:'PCA',exact:true}).click();await page.getByRole('button',{name:'Graph',exact:true}).click();await page.locator('#traverse').click();
  await expect(page.locator('#toast')).toContainText('No explicit computational transitions');
  await page.locator('#export').click();const wait=page.waitForEvent('download');await page.locator('#download-config').click();const config=JSON.parse(await readFile((await(await wait).path())!,'utf8'));await page.locator('#close-export').click();config.datasetHash='bad';
  await page.locator('#config-file').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(config))});await expect(page.locator('#toast')).toContainText('hash mismatch');
  expect(JSON.stringify(fixture)).toEqual(before);
});
test('mobile layout and explanation remain usable',async({page})=>{
  await page.setViewportSize({width:390,height:844});await page.goto(route);await expect(page.locator('#visible-count')).toHaveText('256');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.locator('#about').click();await expect(page.getByRole('heading',{name:'What Am I Actually Looking At?'})).toBeVisible();await page.locator('#close-about').click();
  await page.screenshot({path:'test-results/explorer-mobile.png',fullPage:true});
});
test('basis animation and supplied path traversal preserve the dataset receipt',async({page})=>{
  await page.goto(route);await expect(page.locator('#visible-count')).toHaveText('256');
  const receipt=await page.locator('#receipt').textContent();
  await page.locator('#cycle').click();await expect(page.locator('#axis-summary')).toHaveText('d1 / d2 / d3');await page.locator('#cycle').click();
  await page.locator('#state-list').selectOption('1');await page.locator('#traverse').click();
  await expect(page.locator('#state-list')).toHaveValue('3');await expect(page.locator('#step-label')).toContainText('symlink resolving outside');await page.locator('#traverse').click();
  await page.locator('#faces').check();await expect(page.locator('#face-count')).toContainText('17 shown');
  await expect(page.locator('#receipt')).toHaveText(receipt!);await expect(page.locator('#visible-count')).toHaveText('256');
});
