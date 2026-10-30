import { describe, it, expect } from 'vitest';
import { demoDataset, validateStates, parseDataset, hamming, edges, components, faces, category, pca, project, layout, defaultConfig, validateConfig, canonical, fingerprint, restoreConfig, pathFrom, disagreementRateDelta, boundaryNotPreserved } from '../src/core';

describe('scientific data contract', () => {
  it('loads every synthetic vertex and all Boolean cube edges', () => {
    const ds = demoDataset();
    expect(ds.states).toHaveLength(256);
    expect(new Set(ds.states.map(s => s.coordinates.join(''))).size).toBe(256);
    expect(edges(ds.states)).toHaveLength(1024);
    expect(ds.states.every(s => s.provenance === 'synthetic')).toBe(true);
  });
  it('has a documented unsafe counterexample, without calling it an observation', () => {
    const ds = demoDataset();
    const s = ds.states.find(s => s.coordinates.join('') === '11000000')!;
    expect(category(s)).toBe('UNSAFE');
    expect(s.policy_decision).toBe('DENY');
    expect(s.enforcer_2_decision).toBe('ALLOW');
    expect(s.execution_trace_reference).toContain('synthetic:');
  });
  it('rejects malformed coordinates, duplicate IDs, missing fields and mixed dimensionality', () => {
    const s = demoDataset().states[0];
    expect(() => validateStates([{...s, coordinates: [0, 2]}])).toThrow();
    expect(() => validateStates([s, s])).toThrow();
    expect(() => validateStates([{...s, reachable: 'false'}])).toThrow();
    expect(() => validateStates([{...s, policy_decision: undefined}])).toThrow();
    expect(() => validateStates([s, {...s, state_id:'short', coordinates:[0]}])).toThrow();
  });
  it('round-trips JSONL and quoted CSV without filling in missing results', () => {
    const states = demoDataset().states.slice(8, 10);
    const a = parseDataset(states.map(s=>JSON.stringify(s)).join('\n'), 'a.jsonl');
    expect(a.states).toEqual(states);
    const header = 'state_id,coordinates,reachable,policy_decision,enforcer_1_decision,enforcer_2_decision,execution_outcome,disagreement_type,execution_trace_reference';
    const b = parseDataset(header+'\nx,"[0,1,0]",false,UNKNOWN,UNKNOWN,UNKNOWN,UNTESTED,UNKNOWN,', 'b.csv');
    expect(b.states[0].reachable).toBe(false);
    expect(category(b.states[0])).toBe('UNKNOWN');
    expect(b.states[0].provenance).toBe('unverified');
    expect(b.states[0].local_views).toBeUndefined();
    expect(() => parseDataset(header+'\nx,"[0,1]",perhaps,ALLOW,DENY,ALLOW,SUCCESS,UNSAFE,', 'b.csv')).toThrow();
  });
});

describe('relationships come from vectors, not screen positions', () => {
  it('excludes unknown evidence from correlations and policy-boundary explanations', () => {
    const known={...demoDataset().states[3],coordinates:[0,0,0]};
    const other={...known,state_id:'other',coordinates:[1,0,0]};
    const unknown={...other,state_id:'unknown',coordinates:[1,1,0],execution_outcome:'UNKNOWN' as const};
    expect(disagreementRateDelta([known,other,unknown],0)).toBe(0);
    expect(disagreementRateDelta([known,unknown],0)).toBeNull();
    expect(boundaryNotPreserved({...known,policy_decision:'UNKNOWN',enforcer_2_decision:'UNKNOWN'},{...other,policy_decision:'ALLOW',enforcer_2_decision:'UNKNOWN'})).toBe(false);
    expect(boundaryNotPreserved(known,{...other,policy_decision:'ALLOW'})).toBe(true);
  });
  it('counts square faces and disagreement components exactly', () => {
    const ds=demoDataset();
    expect(faces(ds.states)).toHaveLength(1792);
    const square=ds.states.filter(s=>s.coordinates.slice(2).every(x=>x===0));
    expect(faces(square)).toHaveLength(1);
    expect(components(square, edges(square))).toHaveLength(1);
    expect(hamming(square[0], square[3])).toBe(2);
    expect(components([square[0],square[3]], [])).toHaveLength(2);
  });
  it('traverses only supplied computational transitions', () => {
    const ds=demoDataset();
    const path=pathFrom(ds.states, 'state-0001');
    expect(path.length).toBeGreaterThan(1);
    for(let i=1;i<path.length;i++) expect(ds.states.find(s=>s.state_id===path[i-1])!.transitions!.some(t=>t.target===path[i])).toBe(true);
    expect(pathFrom(ds.states.map(s=>({...s,transitions:undefined})), 'state-0001')).toEqual(['state-0001']);
  });
});

describe('projection and reproducibility', () => {
  it('retains 256 vertices when axis projection has only 8 unique positions', () => {
    const ds=demoDataset(); const points=project(ds.states, [0,1,2]);
    expect(points).toHaveLength(256);
    expect(new Set(points.map(p=>p.join(','))).size).toBe(8);
  });
  it('reports 37.5% cumulative PCA variance for the complete 8-cube', () => {
    const out=pca(demoDataset().states,[0,1,2,3,4,5,6,7]);
    expect(out.variance.slice(0,3).reduce((a,b)=>a+b,0)).toBeCloseTo(.375,8);
    expect(out.points).toHaveLength(256);
    expect(pca(demoDataset().states.slice(0,1),[0,1,2]).variance.every(v=>v===0)).toBe(true);
  });
  it('uses a seeded layout and does not mutate any experimental field', () => {
    const ds=demoDataset(); const before=canonical(ds);
    const subset=ds.states.slice(0,12);
    expect(layout(subset, edges(subset),42)).toEqual(layout(subset, edges(subset),42));
    project(ds.states,[3,4,5]);pca(ds.states,[0,1,2,3]);
    expect(canonical(ds)).toBe(before);
  });
  it('round-trips settings and refuses invalid parameters or the wrong dataset', async () => {
    const ds=demoDataset(); const hash=await fingerprint(ds);
    const cfg={...defaultConfig, datasetId:ds.id, datasetHash:hash};
    expect(restoreConfig(JSON.stringify(cfg), ds.id, hash)).toEqual(cfg);
    expect(() => restoreConfig(JSON.stringify(cfg),ds.id,'wrong')).toThrow(/hash/i);
    expect(() => validateConfig({...cfg, axes:[0,0,2]})).toThrow();
    expect(() => validateConfig({...cfg, mode:'magic'})).toThrow();
    expect(() => validateConfig({...cfg, enabled:[true]})).toThrow();
    expect(() => validateConfig({...cfg, seed:NaN})).toThrow();
    expect(JSON.stringify(cfg)).not.toContain('execution_trace');
  });
  it('treats unobserved outcomes as unknown and bounds face enumeration for duplicate vectors', () => {
    const s=demoDataset().states[1];
    expect(category({...s,execution_outcome:'UNKNOWN'})).toBe('UNKNOWN');
    const square=demoDataset().states.filter(s=>s.coordinates.slice(2).every(x=>x===0));
    const repeated=Array.from({length:16},(_,k)=>square.map((s,i)=>({...s,state_id:`${k}-${i}`}))).flat();
    expect(faces(repeated,100)).toHaveLength(100);
  });
});
