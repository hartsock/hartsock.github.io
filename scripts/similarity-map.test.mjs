import test from 'node:test';
import assert from 'node:assert/strict';
import { visibleIndices, articlesForNode, nodeRadius, pointPosition, labelPositions, settleLayout } from '../assets/js/similarity-map.js';
const pages=Array.from({length:314},(_,i)=>({title:`Article ${i}`,description:'An essay',nearest:[{index:(i+100)%314,similarity:.7}]}));
test('one word lists several articles newest first, with shared membership across words',()=>{
  const articles=[{title:'Old testing essay',date:'2008-01-01',url:'/old/'},{title:'New testing essay',date:'2015-01-01',url:'/new/'}];
  assert.deepEqual(articlesForNode({articles:[0,1,0]},articles).map(p=>p.title),['New testing essay','Old testing essay']);
  assert.equal(articlesForNode({articles:[1]},articles)[0],articles[1]);
  assert.deepEqual(articlesForNode({articles:[]},articles),[]);
});
test('recent disclosure stays bounded and reveals distant-in-time neighbors',()=>{
  const found=visibleIndices(pages,{selected:0});
  assert.equal(found.length,41);assert.ok(found.includes(100));assert.equal(new Set(found).size,found.length);
});
test('search reaches older articles without filling the map with nonmatches',()=>{
  assert.deepEqual(visibleIndices(pages,{query:'Article 313'}),[313]);
  assert.deepEqual(visibleIndices(pages,{query:'missing'}),[]);
});
test('point size reflects unique article count, not repeat mentions',()=>{
  assert.equal(nodeRadius({articles:[0,0]}),nodeRadius({articles:[0]}));
  assert.ok(nodeRadius({articles:[0,1,2,3]})>nodeRadius({articles:[0]}));
});
test('coordinates and label placements survive changes to selected concept',()=>{
  const nodes=[{title:'pyVmomi',x:0,y:0,articles:[0]},{title:'unit testing',x:.01,y:.01,articles:[0,1]}];
  const labels=new Map();labelPositions(nodes,[0],labels);const initial={...labels.get(0)};
  labelPositions(nodes,[0,1],labels);
  assert.deepEqual(labels.get(0),initial);
  assert.notEqual(labels.get(0).y,labels.get(1).y);
  assert.deepEqual(pointPosition(nodes[0]),[500,360]);
});
test('physics separates touching dots without mutating semantic coordinates',()=>{
  const nodes=Array.from({length:12},(_,i)=>({title:`concept ${i}`,x:0,y:0,articles:[0,1,2,3]}));
  const original=JSON.stringify(nodes),indices=nodes.map((_,i)=>i);
  const layout=settleLayout(nodes,indices);
  assert.equal(JSON.stringify(nodes),original);
  assert.deepEqual([...layout],[...settleLayout(nodes,indices)]);
  for(const [i,a] of layout){
    assert.ok(Math.hypot(a.x-500,a.y-360)<200,'semantic spring limits displacement');
    for(const [j,b] of layout) if(j>i) assert.ok(Math.hypot(a.x-b.x,a.y-b.y)>=a.r+b.r+3,'circles have breathing room');
  }
});
test('settled labels avoid other labels and dots and stay in the viewport',()=>{
  const nodes=Array.from({length:80},(_,i)=>({title:`concept ${i}`,x:(i%3)/10,y:0,articles:[0,1,2]}));
  const layout=settleLayout(nodes,nodes.map((_,i)=>i));
  for(const [i,a] of layout){
    const l=a.label;assert.ok(l.x>=0&&l.x+l.width<=1000&&l.y>=10&&l.y<=710);
    for(const [j,b] of layout){
      if(j>i) assert.ok(l.x+l.width<=b.label.x||b.label.x+b.label.width<=l.x||Math.abs(l.y-b.label.y)>=20,'labels do not overlap');
      const dx=b.x-Math.max(l.x,Math.min(b.x,l.x+l.width)),dy=b.y-Math.max(l.y-10,Math.min(b.y,l.y+10));
      assert.ok(Math.hypot(dx,dy)>=b.r,'label clears dots');
    }
  }
});
