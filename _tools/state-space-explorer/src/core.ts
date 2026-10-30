import { copy } from './copy.ts';
import { Matrix, EigenvalueDecomposition } from 'ml-matrix';
import { forceSimulation, forceLink, forceManyBody, forceCenter } from 'd3-force-3d';
import Papa from 'papaparse';
export type Decision = 'ALLOW' | 'DENY' | 'UNKNOWN';
export type Category = 'ALLOW' | 'DENY' | 'UNSAFE' | 'RESTRICTIVE' | 'DIVERGENT' | 'UNKNOWN';
export type Vec3 = [
    number,
    number,
    number
];
export type Transition = {
    target: string;
    change: string;
};
export type State = {
    state_id: string;
    coordinates: number[];
    reachable: boolean | null;
    policy_decision: Decision;
    enforcer_1_decision: Decision;
    enforcer_2_decision: Decision;
    execution_outcome: 'SUCCESS' | 'BLOCKED' | 'FAILURE' | 'UNTESTED' | 'UNKNOWN';
    disagreement_type: string;
    execution_trace_reference: string | null;
    provenance: 'synthetic' | 'measured' | 'unverified';
    command?: string;
    execution_trace?: string;
    local_views?: {
        A: boolean;
        B: boolean;
    };
    transitions?: Transition[];
};
export type Dimension = {
    name: string;
    definition: string;
};
export type Dataset = {
    id: string;
    dimensions: Dimension[];
    states: State[];
};
export type Edge = [
    number,
    number
];
export type Config = {
    version: 1;
    datasetId: string;
    datasetHash: string;
    mode: 'axes' | 'pca' | 'graph';
    axes: number[];
    enabled: boolean[];
    palette: 'semantic' | 'accessible' | 'rainbow';
    filter: 'all' | 'disagreements' | 'unsafe' | 'enforcers';
    relationship: 'geometric' | 'disagreement' | 'overlap';
    views: boolean;
    faces: boolean;
    spread: boolean;
    seed: number;
    influence: number;
    component: number;
    selected: string | null;
    pins: string[];
    camera: {
        position: Vec3;
        target: Vec3;
    };
};
export const defaultConfig: Config = { version: 1, datasetId: '', datasetHash: '', mode: 'axes', axes: [0, 1, 2], enabled: Array(8).fill(true), palette: 'semantic', filter: 'all', relationship: 'geometric', views: false, faces: false, spread: true, seed: 42, influence: -1, component: -1, selected: 'state-0003', pins: [], camera: { position: [12, 9, 15], target: [0, 0, 0] } };
export const demoDimensions: Dimension[] = [
    { name: 'target_inside_root', definition: copy("core_001") },
    { name: 'target_is_symlink', definition: copy("core_002") },
    { name: 'resolved_inside_root', definition: copy("core_003") },
    { name: 'operation_is_write', definition: copy("core_004") },
    { name: 'write_granted', definition: copy("core_005") },
    { name: 'target_exists', definition: copy("core_006") },
    { name: 'capability_expired', definition: copy("core_007") },
    { name: 'operator_is_B', definition: copy("core_008") }
];
export function demoDataset(): Dataset {
    const states: State[] = Array.from({ length: 256 }, (_, i) => {
        const c = Array.from({ length: 8 }, (_, d) => (i >> d) & 1);
        const [inside, symlink, resolved, write, grant, exists, expired, operatorB] = c;
        const policy = !!inside && (!symlink || !!resolved) && (!write || !!grant) && !expired;
        // Deliberately different teaching rules. They model no production implementation.
        const e1 = policy && (!write || !!exists);
        const e2 = !!inside && (!write || !!grant) && !expired;
        const dec = (x: boolean): Decision => x ? 'ALLOW' : 'DENY';
        const s: State = { state_id: `state-${String(i).padStart(4, '0')}`, coordinates: c, reachable: true, policy_decision: dec(policy), enforcer_1_decision: dec(e1), enforcer_2_decision: dec(e2), execution_outcome: e2 ? 'SUCCESS' : 'BLOCKED', disagreement_type: '', execution_trace_reference: `synthetic:fixture/${i}`, provenance: 'synthetic', command: `${write ? 'write' : 'read'} ${inside ? '/authorized' : '/outside'}/${symlink ? 'link' : 'file'}`, execution_trace: copy("core_009", [!!inside, !!symlink, !!resolved, dec(policy), dec(e1), dec(e2), e2 ? 'SUCCESS' : 'BLOCKED']), local_views: { A: !operatorB || !!grant, B: !!operatorB || !!exists } };
        s.disagreement_type = category(s);
        return s;
    });
    // This is an explicit synthetic scenario, not a claim that every cube edge executes.
    states[1].transitions = [{ target: 'state-0003', change: copy("core_010") }];
    states[3].transitions = [{ target: 'state-0007', change: copy("core_011") }];
    states[7].transitions = [{ target: 'state-0071', change: copy("core_012") }];
    return { id: 'synthetic-boolean8-v1', dimensions: demoDimensions, states };
}
export function category(s: State): Category {
    if (s.reachable !== true || ['UNTESTED', 'UNKNOWN'].includes(s.execution_outcome) || [s.policy_decision, s.enforcer_1_decision, s.enforcer_2_decision].includes('UNKNOWN'))
        return 'UNKNOWN';
    if (s.policy_decision === 'DENY' && [s.enforcer_1_decision, s.enforcer_2_decision].includes('ALLOW'))
        return 'UNSAFE';
    if (s.policy_decision === 'ALLOW' && [s.enforcer_1_decision, s.enforcer_2_decision].includes('DENY'))
        return 'RESTRICTIVE';
    if (s.enforcer_1_decision !== s.enforcer_2_decision)
        return 'DIVERGENT';
    return s.policy_decision;
}
export const disagrees = (s: State) => ['UNSAFE', 'RESTRICTIVE', 'DIVERGENT'].includes(category(s));
export function disagreementRateDelta(states:State[],dimension:number):number|null {
    const known=states.filter(s=>category(s)!=='UNKNOWN');
    const bins=[0,1].map(value=>known.filter(s=>s.coordinates[dimension]===value));
    if(bins.some(bin=>bin.length===0))return null;
    return bins[1].filter(disagrees).length/bins[1].length-bins[0].filter(disagrees).length/bins[0].length;
}
export function boundaryNotPreserved(a:State,b:State):boolean {
    return [a.policy_decision,b.policy_decision,a.enforcer_2_decision,b.enforcer_2_decision].every(d=>d!=='UNKNOWN')&&a.policy_decision!==b.policy_decision&&a.enforcer_2_decision===b.enforcer_2_decision;
}
function check(condition: unknown, message: string): asserts condition { if (!condition)
    throw new Error(message); }
export function validateStates(rows: unknown[]): State[] {
    check(rows.length > 0 && rows.length <= 4096, copy("core_013"));
    const ids = new Set<string>();
    let n = 0;
    const result = rows.map((value, index) => {
        const s = value as State;
        const label = `Row ${index + 1}`;
        check(s && typeof s === 'object', copy("core_014", [label]));
        check(typeof s.state_id === 'string' && s.state_id.length > 0 && !ids.has(s.state_id), copy("core_015", [label]));
        ids.add(s.state_id);
        check(Array.isArray(s.coordinates) && s.coordinates.length >= 3 && s.coordinates.length <= 32 && s.coordinates.every(v => v === 0 || v === 1), copy("core_016", [label]));
        n = n || s.coordinates.length;
        check(s.coordinates.length === n, copy("core_017", [label]));
        check(s.reachable === true || s.reachable === false || s.reachable === null, copy("core_018", [label]));
        for (const key of ['policy_decision', 'enforcer_1_decision', 'enforcer_2_decision'] as const)
            check(['ALLOW', 'DENY', 'UNKNOWN'].includes(s[key]), copy("core_019", [label, key]));
        check(['SUCCESS', 'BLOCKED', 'FAILURE', 'UNTESTED', 'UNKNOWN'].includes(s.execution_outcome), copy("core_020", [label]));
        check(typeof s.disagreement_type === 'string' && s.disagreement_type.length > 0, copy("core_021", [label]));
        check(s.execution_trace_reference === null || typeof s.execution_trace_reference === 'string', copy("core_022", [label]));
        check(s.provenance === undefined || ['synthetic', 'measured', 'unverified'].includes(s.provenance), copy("core_023", [label]));
        for (const key of ['command', 'execution_trace'] as const)
            check(s[key] === undefined || typeof s[key] === 'string', copy("core_024", [label, key]));
        if (s.local_views !== undefined)
            check(typeof s.local_views?.A === 'boolean' && typeof s.local_views?.B === 'boolean', copy("core_025", [label]));
        if (s.transitions !== undefined)
            check(Array.isArray(s.transitions) && s.transitions.every(t => typeof t.target === 'string' && typeof t.change === 'string'), copy("core_026", [label]));
        return { ...s, provenance: s.provenance ?? 'unverified' };
    });
    for (const s of result)
        for (const t of s.transitions ?? [])
            check(ids.has(t.target), copy("core_027", [t.target]));
    return result;
}
export function parseDataset(text: string, filename: string): Dataset {
    check(text.length <= 20000000, copy("core_028"));
    let rows: unknown[];
    let dimensions: Dimension[] | undefined;
    let id = filename;
    if (filename.toLowerCase().endsWith('.csv')) {
        const parsed = Papa.parse<Record<string, string>>(text, { header: true, skipEmptyLines: 'greedy' });
        check(parsed.errors.length === 0, `CSV parse error: ${parsed.errors[0]?.message}`);
        rows = parsed.data.map(r => {
            const o: Record<string, unknown> = { ...r };
            o.coordinates = JSON.parse(r.coordinates);
            check(['true', 'false', 'null'].includes(r.reachable), copy("core_029"));
            o.reachable = JSON.parse(r.reachable);
            o.execution_trace_reference = r.execution_trace_reference || null;
            if (!r.provenance)
                delete o.provenance;
            for (const k of ['local_views', 'transitions'])
                if (r[k])
                    o[k] = JSON.parse(r[k]);
                else
                    delete o[k];
            return o;
        });
    }
    else if (filename.toLowerCase().endsWith('.json')) {
        const parsed = JSON.parse(text);
        rows = Array.isArray(parsed) ? parsed : parsed.states;
        dimensions = parsed.dimensions;
        id = parsed.id ?? filename;
    }
    else
        rows = text.split(/\r?\n/).filter(l => l.trim()).map((l, i) => { try {
            return JSON.parse(l);
        }
        catch {
            throw new Error(copy("core_030", [i + 1]));
        } });
    check(Array.isArray(rows), copy("core_031"));
    const states = validateStates(rows);
    const n = states[0].coordinates.length;
    if (dimensions !== undefined)
        check(Array.isArray(dimensions) && dimensions.length === n && dimensions.every(d => typeof d.name === 'string' && typeof d.definition === 'string'), copy("core_032"));
    check(typeof id === 'string' && id.length > 0, copy("core_033"));
    return { id, states, dimensions: dimensions ?? Array.from({ length: n }, (_, i) => ({ name: `dimension_${i}`, definition: copy("core_034") })) };
}
export function hamming(a: State, b: State) { return a.coordinates.reduce((sum, v, i) => sum + Number(v !== b.coordinates[i]), 0); }
export function edges(states: State[]): Edge[] {
    // Vector buckets retain distinct states sharing the same original coordinates.
    const lookup = new Map<string, number[]>();
    states.forEach((s, i) => { const key = s.coordinates.join(''); lookup.set(key, [...(lookup.get(key) ?? []), i]); });
    const out: Edge[] = [];
    states.forEach((s, i) => s.coordinates.forEach((_, d) => { const c = [...s.coordinates]; c[d] = 1 - c[d]; for (const j of lookup.get(c.join('')) ?? [])
        if (j > i)
            out.push([i, j]); }));
    return out;
}
export function components(states: State[], links: Edge[]): number[][] {
    const adjacent = states.map(() => [] as number[]);
    for (const [a, b] of links) {
        adjacent[a].push(b);
        adjacent[b].push(a);
    }
    const seen = new Set<number>();
    const out: number[][] = [];
    states.forEach((_, i) => { if (seen.has(i))
        return; const group = [i]; seen.add(i); for (let k = 0; k < group.length; k++)
        for (const j of adjacent[group[k]])
            if (!seen.has(j)) {
                seen.add(j);
                group.push(j);
            } out.push(group); });
    return out.sort((a, b) => b.length - a.length);
}
export function faces(states: State[], limit = 20000): number[][] {
    const lookup = new Map<string, number[]>();
    states.forEach((s, i) => { const key = s.coordinates.join(''); lookup.set(key, [...(lookup.get(key) ?? []), i]); });
    const out: number[][] = [];
    for (let i = 0; i < states.length; i++) {
        const s = states[i];
        for (let a = 0; a < s.coordinates.length; a++)
            for (let b = a + 1; b < s.coordinates.length; b++) {
                if (s.coordinates[a] || s.coordinates[b])
                    continue;
                const c = [...s.coordinates];
                c[a] = 1;
                const js = lookup.get(c.join('')) ?? [];
                c[b] = 1;
                const ks = lookup.get(c.join('')) ?? [];
                c[a] = 0;
                const ls = lookup.get(c.join('')) ?? [];
                for (const j of js)
                    for (const k of ks)
                        for (const l of ls) {
                            out.push([i, j, k, l]);
                            if (out.length >= limit)
                                return out;
                        }
            }
    }
    return out;
}
export function project(states: State[], axes: number[]): Vec3[] { return states.map(s => axes.map(d => s.coordinates[d]) as Vec3); }
export function pca(states: State[], dimensions: number[]) {
    const n = states.length;
    const d = dimensions.length;
    const means = dimensions.map(k => states.reduce((a, s) => a + s.coordinates[k], 0) / n);
    const centered = new Matrix(states.map(s => dimensions.map((k, i) => s.coordinates[k] - means[i])));
    const covariance = centered.transpose().mmul(centered).div(Math.max(1, n - 1));
    const evd = new EigenvalueDecomposition(covariance, { assumeSymmetric: true });
    const eigenvalues = evd.realEigenvalues.map(v => Math.max(0, v));
    const order = eigenvalues.map((_, i) => i).sort((a, b) => eigenvalues[b] - eigenvalues[a] || a - b);
    const total = eigenvalues.reduce((a, b) => a + b, 0);
    const basis = order.slice(0, 3).map(i => { const col = evd.eigenvectorMatrix.getColumn(i); const peak = col.reduce((best, v, k) => Math.abs(v) > Math.abs(col[best]) ? k : best, 0); return col.map(v => v * (col[peak] < 0 ? -1 : 1)); });
    while (basis.length < 3)
        basis.push(Array(d).fill(0));
    return { points: states.map((_, i) => basis.map(b => b.reduce((sum, v, k) => sum + v * centered.get(i, k), 0)) as Vec3), variance: order.map(i => total ? eigenvalues[i] / total : 0), basis, means, eigenvalues: order.map(i => eigenvalues[i]) };
}
export function random(seed: number) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
export function layout(states: State[], links: Edge[], seed: number): Vec3[] {
    const rng = random(seed);
    const nodes = states.map((_, i) => ({ index: i, x: (rng() - .5) * 10, y: (rng() - .5) * 10, z: (rng() - .5) * 10 }));
    const simulation = forceSimulation(nodes, 3).stop().randomSource(rng).force('charge', forceManyBody().strength(-18)).force('link', forceLink(links.map(([source, target]) => ({ source, target }))).distance(2.5).strength(.2)).force('center', forceCenter(0, 0, 0));
    simulation.tick(180);
    simulation.stop();
    return nodes.map(n => [n.x, n.y, n.z]);
}
export function pathFrom(states: State[], start: string): string[] {
    const path = [start];
    const seen = new Set(path);
    let current = states.find(s => s.state_id === start);
    while (current) {
        const next = current.transitions?.find(t => !seen.has(t.target));
        if (!next)
            break;
        seen.add(next.target);
        path.push(next.target);
        current = states.find(s => s.state_id === next.target);
    }
    return path;
}
export function canonical(value: unknown): string {
    if (Array.isArray(value))
        return '[' + value.map(canonical).join(',') + ']';
    if (value && typeof value === 'object')
        return '{' + Object.keys(value).sort().filter(k => (value as Record<string, unknown>)[k] !== undefined).map(k => JSON.stringify(k) + ':' + canonical((value as Record<string, unknown>)[k])).join(',') + '}';
    return JSON.stringify(value);
}
export async function fingerprint(ds: Dataset) { const buffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(canonical(ds))); return Array.from(new Uint8Array(buffer)).map(x => x.toString(16).padStart(2, '0')).join(''); }
export function validateConfig(value: unknown, n = 8): Config {
    const c = value as Config;
    check(c?.version === 1, copy("core_035"));
    check(typeof c.datasetId === 'string' && typeof c.datasetHash === 'string', copy("core_036"));
    check(['axes', 'pca', 'graph'].includes(c.mode), copy("core_037"));
    check(Array.isArray(c.axes) && c.axes.length === 3 && new Set(c.axes).size === 3 && c.axes.every(d => Number.isInteger(d) && d >= 0 && d < n), copy("core_038"));
    check(Array.isArray(c.enabled) && c.enabled.length === n && c.enabled.every(v => typeof v === 'boolean') && c.enabled.filter(Boolean).length >= 3, copy("core_039"));
    check(c.axes.every(d => c.enabled[d]), copy("core_040"));
    check(['semantic', 'accessible', 'rainbow'].includes(c.palette) && ['all', 'disagreements', 'unsafe', 'enforcers'].includes(c.filter) && ['geometric', 'disagreement', 'overlap'].includes(c.relationship), copy("core_041"));
    check(['views', 'faces', 'spread'].every(k => typeof c[k as keyof Config] === 'boolean'), copy("core_042"));
    check(Number.isInteger(c.seed) && c.seed >= 0 && c.seed <= 4294967295, copy("core_043"));
    check(Number.isInteger(c.influence) && c.influence >= -1 && c.influence < n && Number.isInteger(c.component) && c.component >= -1, copy("core_044"));
    check(c.selected === null || typeof c.selected === 'string', 'Invalid selection.');
    check(Array.isArray(c.pins) && c.pins.length <= 2 && c.pins.every(p => typeof p === 'string'), copy("core_045"));
    for (const key of ['position', 'target'] as const)
        check(Array.isArray(c.camera?.[key]) && c.camera[key].length === 3 && c.camera[key].every(v => Number.isFinite(v) && Math.abs(v) < 1e6), 'Invalid camera.');
    check(Math.hypot(...c.camera.position.map((v, i) => v - c.camera.target[i])) > .01, copy("core_046"));
    // Copy only the allow-listed settings. Trace text and arbitrary input keys cannot enter URLs.
    return { version: 1, datasetId: c.datasetId, datasetHash: c.datasetHash, mode: c.mode, axes: [...c.axes], enabled: [...c.enabled], palette: c.palette, filter: c.filter, relationship: c.relationship, views: c.views, faces: c.faces, spread: c.spread, seed: c.seed, influence: c.influence, component: c.component, selected: c.selected, pins: [...c.pins], camera: { position: [...c.camera.position], target: [...c.camera.target] } };
}
export function restoreConfig(text: string, id: string, hash: string, n = 8) { const cfg = validateConfig(JSON.parse(text), n); check(cfg.datasetHash === hash, copy("core_047")); check(cfg.datasetId === id, copy("core_048")); return cfg; }
export function freeze<T>(value: T): T { if (value && typeof value === 'object') {
    Object.freeze(value);
    for (const v of Object.values(value))
        freeze(v);
} return value; }
