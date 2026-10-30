import dictionary from '../public/prose.json' with {type:'json'};
// The Markdown file is authoritative; generate-demo verifies and emits this dictionary.
export function copy(key:string,slots:unknown[]=[]):string {
  const text=(dictionary as Record<string,string>)[key];
  if(text===undefined)throw new Error('copy:'+key);
  return text.replace(/\{slot(\d+)\}/g,(_,index)=>String(slots[Number(index)]));
}
