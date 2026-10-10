import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';

// Exercise the actual harness with a browser double that writes its profile
// after SIGTERM, then exits. Model a transient ENOTEMPTY from a Chrome helper
// outliving the main process; filesystem retries must be enabled to recover.
const preload = String.raw`
import cp from 'node:child_process';
import fs from 'node:fs';
import {EventEmitter} from 'node:events';
import {request} from 'node:http';
import {syncBuiltinESMExports} from 'node:module';
const remove=fs.rmSync;
let directory, exited=false;
process.on('exit',()=>{if(directory) remove(directory,{recursive:true,force:true,maxRetries:10,retryDelay:100});});
cp.spawnSync=()=>({status:0,stdout:'',stderr:''});
cp.spawn=(bin,args)=>{
 const profile=args.find(arg=>arg.startsWith('--user-data-dir=')).split('=')[1];
 directory=profile.slice(0,-'/profile'.length);
 fs.mkdirSync(profile+'/Default',{recursive:true});
 const child=new EventEmitter();
 Object.assign(child,{pid:123,exitCode:null,signalCode:null});
 child.kill=signal=>{
   if(signal!=='SIGTERM') throw Error('Unexpected escalation');
   fs.writeFileSync(profile+'/Default/late-write','still writing after SIGTERM');
   console.log('fixture: late profile write after SIGTERM');
   setTimeout(()=>{
     exited=true;child.signalCode=signal;child.emit('exit',null,signal);
     console.log('fixture: browser exited');
   },25);
   return true;
 };
 setImmediate(()=>{
   const url=new URL('/result',args.at(-1));
   const req=request(url,{method:'POST'},res=>res.resume());
   req.end(JSON.stringify({ok:process.env.CLEANUP_CASE!=='assertion',error:'fixture mount assertion',selectors:[],rows:41}));
 });
 return child;
};
fs.rmSync=(path,options)=>{
 if(path!==directory) return remove(path,options);
 if(!exited) throw Error('Profile removed before browser exit');
 console.log('fixture: removing profile after exit');
 if(process.env.CLEANUP_CASE!=='transient' || !options.maxRetries || !options.retryDelay)
   throw Object.assign(Error('ENOTEMPTY: fixture profile still being written'),{code:'ENOTEMPTY'});
 remove(path,options);
 if(fs.existsSync(path)) throw Error('Profile remains');
 console.log('fixture: profile cleanup completed with retries');
};
syncBuiltinESMExports();
`;
function run(mode) {
 const env={...process.env,CHROME_BIN:'fixture-browser',CLEANUP_CASE:mode};
 delete env.NODE_TEST_CONTEXT;
 return spawnSync(process.execPath,['--import','data:text/javascript,'+encodeURIComponent(preload),
   '--test','--test-reporter=tap','scripts/course-browser.test.mjs'],{env,encoding:'utf8',timeout:15000});
}
test('profile cleanup waits for exit and tolerates late Chrome profile writes',()=>{
 const result=run('transient');
 assert.equal(result.status,0,result.stdout+result.stderr);
 assert.match(result.stdout,/late profile write after SIGTERM[\s\S]*browser exited[\s\S]*removing profile after exit[\s\S]*profile cleanup completed with retries/);
});
test('cleanup failure after a passing probe is reported as a failure',()=>{
 const result=run('permanent');
 assert.equal(result.status,1,result.stdout+result.stderr);
 assert.match(result.stdout,/ENOTEMPTY: fixture profile still being written/);
});
test('cleanup failure is diagnostic and preserves the original mount assertion',()=>{
 const result=run('assertion');
 assert.equal(result.status,1,result.stdout+result.stderr);
 assert.match(result.stdout,/error: (?:'fixture mount assertion'|\|-\n\s+fixture mount assertion)/);
 assert.match(result.stdout,/Browser cleanup failed:.*ENOTEMPTY/);
});
