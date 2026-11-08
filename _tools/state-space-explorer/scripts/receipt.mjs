import {readFile,writeFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve,relative} from 'node:path';
const repo=resolve(import.meta.dirname,'../../..');
const app=resolve(repo,'_tools/state-space-explorer');
const output=resolve(repo,'labs/state-space-explorer');
async function files(root){const result=[];for(const item of await readdir(root,{withFileTypes:true})){const path=resolve(root,item.name);if(item.isDirectory())result.push(...await files(path));else result.push(path);}return result;}
async function hashes(paths){const out={};for(const path of paths.sort()){const text=(await readFile(path,'utf8')).replace(/\r\n/g,'\n');out[relative(repo,path).replaceAll('\\','/')]=createHash('sha256').update(text).digest('hex');}return out;}
const inputs=[...await files(resolve(app,'src')),...await files(resolve(app,'scripts')),...await files(resolve(app,'public')), ...['package.json','package-lock.json','tsconfig.json','vite.config.ts','README.md'].map(f=>resolve(app,f)),resolve(repo,'_copy/state-space-explorer.md')];
const outputs=(await files(output)).filter(f=>!f.endsWith('build-receipt.json'));
await writeFile(resolve(output,'build-receipt.json'),JSON.stringify({version:1,inputs:await hashes(inputs),outputs:await hashes(outputs)},null,2)+'\n');
console.log('Receipt ready.');
