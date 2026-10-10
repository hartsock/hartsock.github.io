import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';

// Exercise the actual harness with a main process and a lingering helper in
// the same process group. Only group shutdown stops the helper profile writes.
const preload = String.raw`
import cp from 'node:child_process';
import fs from 'node:fs';
import {tmpdir} from 'node:os';
import {EventEmitter} from 'node:events';
import {request} from 'node:http';
import {syncBuiltinESMExports} from 'node:module';
const remove=fs.rmSync;
let directory, exited=false, helperAlive=true, groupChecked=false, groupRejected=false;
process.on('exit',()=>{if(directory) remove(directory,{recursive:true,force:true,maxRetries:10,retryDelay:100});});
cp.spawnSync=()=>({status:0,stdout:'',stderr:''});
cp.spawn=(bin,args,options)=>{
 const profile=args.find(arg=>arg.startsWith('--user-data-dir=')).split('=')[1];
 directory=profile.slice(0,-'/profile'.length);
 fs.mkdirSync(profile+'/Default',{recursive:true});
 const child=new EventEmitter();
 Object.assign(child,{pid:123,exitCode:null,signalCode:null});
 const stopMain=signal=>{
   if(exited) return;
   exited=true;child.signalCode=signal;child.emit('exit',null,signal);
   fs.writeFileSync(profile+'/Default/late-write','helper still writing after main exit');
   console.log('fixture: helper writes after main exit');
 };
 child.kill=signal=>{
   console.log('fixture: main '+signal);
   if(process.env.CLEANUP_CASE.endsWith('-kill') && signal==='SIGTERM') return true;
   setTimeout(()=>stopMain(signal),25);return true;
 };
 process.kill=(pid,signal)=>{
   if(pid!==-child.pid) throw Error('Expected process group signal');
   const mode=process.env.CLEANUP_CASE;
   if(groupRejected) throw Error('Must not signal an unowned group again');
   if((mode.startsWith('eperm') && (mode!=='eperm-probe' || signal===0)) || mode.startsWith('esrch')) {
     groupRejected=true;helperAlive=false;groupChecked=true;
     const code=mode.startsWith('esrch')?'ESRCH':'EPERM';
     console.log('fixture: group '+signal+' '+code);
     throw Object.assign(Error('group unavailable'),{code});
   }
   if(!options.detached) throw Error('Browser must have its own process group');
   if(!helperAlive) {groupChecked=true;throw Object.assign(Error('group gone'),{code:'ESRCH'});}
   if(signal===0) return true;
   if(signal!=='SIGTERM' && signal!=='SIGKILL') throw Error('Unexpected group signal');
   console.log('fixture: group '+signal);
   setTimeout(()=>stopMain(signal),25);
   if(process.env.CLEANUP_CASE==='stubborn' || (process.env.CLEANUP_CASE==='escalation' && signal==='SIGTERM')) return true;
   setTimeout(()=>{helperAlive=false;console.log('fixture: helper exited');},100);
   return true;
 };
 setImmediate(()=>{
   const url=new URL('/result',args.at(-1));
   const req=request(url,{method:'POST'},res=>res.resume());
   req.end(JSON.stringify({ok:!process.env.CLEANUP_CASE.endsWith('assertion'),error:'fixture mount assertion',selectors:[],rows:41}));
 });
 return child;
};
fs.rmSync=(path,options)=>{
 if(path!==directory) return remove(path,options);
 if(!exited || helperAlive || !groupChecked) throw Error('Profile removed before process group disappeared');
 if(!directory.startsWith(tmpdir()) || options.maxRetries!==20 || options.retryDelay!==200) throw Error('Temporary profile/retry contract');
 console.log('fixture: removing profile after group disappeared');
 if(['permanent','assertion'].includes(process.env.CLEANUP_CASE))
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
test('profile cleanup waits for the helper process group to disappear',()=>{
 const result=run('transient');
 assert.equal(result.status,0,result.stdout+result.stderr);
 assert.match(result.stdout,/group SIGTERM[\s\S]*helper writes after main exit[\s\S]*helper exited[\s\S]*removing profile after group disappeared[\s\S]*profile cleanup completed with retries/);
});
test('leftover profile after successful group shutdown is diagnostic only',()=>{
 const result=run('permanent');
 assert.equal(result.status,0,result.stdout+result.stderr);
 assert.match(result.stdout,/ENOTEMPTY: fixture profile still being written/);
});
test('cleanup failure is diagnostic and preserves the original mount assertion',()=>{
 const result=run('assertion');
 assert.equal(result.status,1,result.stdout+result.stderr);
 assert.match(result.stdout,/error: (?:'fixture mount assertion'|\|-\n\s+fixture mount assertion)/);
 assert.match(result.stdout,/Browser cleanup failed:.*ENOTEMPTY/);
});

test('lingering helpers receive SIGKILL after the SIGTERM grace period',()=>{
 const result=run('escalation');
 assert.equal(result.status,0,result.stdout+result.stderr);
 assert.match(result.stdout,/group SIGTERM[\s\S]*group SIGKILL[\s\S]*profile cleanup completed with retries/);
});
test('a group that never disappears fails bounded shutdown without removing its profile',()=>{
 const result=run('stubborn');
 assert.equal(result.status,1,result.stdout+result.stderr);
 assert.match(result.stdout,/Browser process group cleanup timed out after SIGKILL/);
 assert.doesNotMatch(result.stdout,/fixture: removing profile/);
});

for(const mode of ['eperm','eperm-probe','eperm-kill','esrch-kill','eperm-assertion']) {
 test('unowned group preserves the real probe outcome: '+mode,()=>{
   const result=run(mode);
   assert.equal(result.status,mode.endsWith('assertion')?1:0,result.stdout+result.stderr);
   assert.match(result.stdout,/fixture: group .* (?:EPERM|ESRCH)/);
   assert.match(result.stdout,/fixture: profile cleanup completed with retries/);
   assert.doesNotMatch(result.stdout,/Browser cleanup failed/);
   if(mode.endsWith('-kill')) assert.match(result.stdout,/fixture: main SIGKILL/);
   if(mode.endsWith('assertion')) assert.match(result.stdout,/error: (?:'fixture mount assertion'|\|-\n\s+fixture mount assertion)/);
 });
}
