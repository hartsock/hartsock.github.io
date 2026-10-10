import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';

// Hide even the platform's absolute browser path, without requiring a second
// machine. Any build or resource creation before discovery is an error.
const preload = `
import cp from 'node:child_process';
import fs from 'node:fs';
import {syncBuiltinESMExports} from 'node:module';
cp.spawnSync = (bin, args, options) => {
 if (args.length !== 1 || args[0] !== '--version') throw Error('Unexpected build');
 return {status:null,error:Object.assign(Error('not found'),{code:'ENOENT'})};
};
fs.mkdirSync = fs.mkdtempSync = () => {throw Error('Unexpected resource creation');};
syncBuiltinESMExports();
`;
function run(browser) {
 const env={...process.env,PATH:''};
 delete env.CHROME_BIN;
 delete env.NODE_TEST_CONTEXT;
 if(browser!==undefined) env.CHROME_BIN=browser;
 return spawnSync(process.execPath,['--import','data:text/javascript,'+encodeURIComponent(preload),
   '--test','--test-reporter=tap','scripts/course-browser.test.mjs'],{env,encoding:'utf8',timeout:10000});
}
test('automatic discovery skips without a browser before building or allocating resources',()=>{
 const result=run();
 assert.equal(result.status,0,result.stderr+result.stdout);
 assert.match(result.stdout,/# SKIP Chrome\/Chromium unavailable; set CHROME_BIN/);
 assert.match(result.stdout,/# skipped 1/);
 assert.match(result.stdout,/# fail 0/);
});
test('an explicitly broken CHROME_BIN fails instead of skipping or falling back',()=>{
 const result=run('/missing/explicit-browser');
 assert.equal(result.status,1,result.stderr+result.stdout);
 assert.match(result.stdout,/CHROME_BIN.*\/missing\/explicit-browser/);
 assert.match(result.stdout,/# skipped 0/);
});
