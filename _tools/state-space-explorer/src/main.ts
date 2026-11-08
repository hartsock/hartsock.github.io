import { copy } from './copy.ts';
import './style.css';
import { StateScene, colors } from './scene';
import { demoDataset, parseDataset, category, disagrees, edges, components, faces, project, pca, layout, defaultConfig, restoreConfig, validateConfig, fingerprint, freeze, pathFrom, hamming, disagreementRateDelta,boundaryNotPreserved, type Dataset, type Config, type Vec3 } from './core';
const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
const esc = (s: unknown) => String(s ?? 'Not supplied').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
const labels: Record<string, string> = { ALLOW: 'Allow agreement', DENY: 'Deny agreement', UNSAFE: 'Unsafe disagreement', RESTRICTIVE: 'Overly restrictive', DIVERGENT: 'Enforcers disagree', UNKNOWN: 'Unreachable / untested / unknown' };
document.querySelector('#app')!.innerHTML = copy("main_001");
let ds: Dataset = freeze(demoDataset());
let cfg: Config = structuredClone(defaultConfig);
let hash = '';
let links = edges(ds.states);
let groups: number[][] = [];
let faceList: number[][] = [];
let projected: Vec3[] = [];
let pcaResult: ReturnType<typeof pca> | undefined;
let cycleTimer: ReturnType<typeof setInterval> | undefined;
let pathTimer: ReturnType<typeof setInterval> | undefined;
let toastTimer: ReturnType<typeof setTimeout>;
const scene = new StateScene($('viewport'));
scene.onSelect = i => select(i);
function toast(message: string) { $('toast').textContent = message; $('toast').classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => $('toast').classList.remove('show'), 6000); }
function safety(fn: () => void | Promise<void>) { return () => { Promise.resolve().then(fn).catch(e => toast(e.message)); }; }
function rebuildAnalysis() {
    links = edges(ds.states);
    const indices = ds.states.map((s, i) => disagrees(s) ? i : -1).filter(i => i >= 0);
    const subset = indices.map(i => ds.states[i]);
    groups = components(subset, edges(subset)).map(g => g.map(i => indices[i]));
    faceList = faces(subset).map(f => f.map(i => indices[i]));
}
function buildControls() {
    $('axis-selects').innerHTML = ['X', 'Y', 'Z'].map((axis, i) => copy("main_002", [i, axis, i, axis, ds.dimensions.map((d, k) => copy("main_003", [k, String(k).padStart(2, '0'), esc(d.name)])).join('')])).join('');
    $('dimensions').innerHTML = ds.dimensions.map((d, k) => {
        const delta = disagreementRateDelta(ds.states,k);
        return copy("main_004", [esc(d.definition), k, String(k).padStart(2, '0'), esc(d.name), delta!==null ? `${delta >= 0 ? '+' : ''}${(delta * 100).toFixed(0)}pp` : 'n/a']);
    }).join('');
    $('influence').innerHTML = copy("main_005") + ds.dimensions.map((d, k) => `<option value="${k}">${esc(d.name)}</option>`).join('');
    $('component').innerHTML = copy("main_006") + groups.map((g, i) => copy("main_007", [i, i + 1, g.length])).join('');
    $('state-list').innerHTML = ds.states.map((s, i) => copy("main_008", [i, esc(s.state_id), category(s)])).join('');
    for (let i = 0; i < 3; i++)
        $<HTMLSelectElement>(`axis-${i}`).onchange = safety(() => { stopCycle(); const axes = [...cfg.axes]; const next = Number($<HTMLSelectElement>(`axis-${i}`).value); const previous = axes.indexOf(next); if (previous >= 0)
            axes[previous] = axes[i]; axes[i] = next; cfg.axes = axes; updateProjection(); });
    document.querySelectorAll<HTMLInputElement>('[data-dimension]').forEach(input => input.onchange = safety(() => { const k = Number(input.dataset.dimension); const proposed = [...cfg.enabled]; proposed[k] = input.checked; if (proposed.filter(Boolean).length < 3) {
        input.checked = true;
        throw new Error(copy("main_009"));
    } cfg.enabled = proposed; const active = proposed.flatMap((v, i) => v ? [i] : []); cfg.axes = cfg.axes.filter(i => proposed[i]); for (const d of active)
        if (cfg.axes.length < 3 && !cfg.axes.includes(d))
            cfg.axes.push(d); updateProjection(); }));
}
function syncControls() {
    document.querySelectorAll<HTMLElement>('[data-mode]').forEach(b => b.classList.toggle('active', b.dataset.mode === cfg.mode));
    document.querySelectorAll<HTMLElement>('[data-filter]').forEach(b => b.classList.toggle('active', b.dataset.filter === cfg.filter));
    for (const name of ['palette', 'relationship', 'seed', 'influence', 'component'] as const)
        $<HTMLSelectElement>(name).value = String(cfg[name]);
    for (const name of ['spread', 'faces', 'views'] as const)
        $<HTMLInputElement>(name).checked = cfg[name];
    for (let i = 0; i < 3; i++) {
        const select = $<HTMLSelectElement>(`axis-${i}`);
        select.value = String(cfg.axes[i]);
        Array.from(select.options).forEach(o => o.disabled = !cfg.enabled[Number(o.value)]);
    }
    document.querySelectorAll<HTMLInputElement>('[data-dimension]').forEach(input => input.checked = cfg.enabled[Number(input.dataset.dimension)]);
    $('enabled-count').textContent = `${cfg.enabled.filter(Boolean).length} ACTIVE`;
    $('axis-selects').hidden = cfg.mode !== 'axes';
    $('pca-info').hidden = cfg.mode !== 'pca';
    $('scene-title').textContent = cfg.mode === 'axes' ? 'AXIS PROJECTION' : cfg.mode === 'pca' ? 'PRINCIPAL COMPONENTS' : 'FORCE-DIRECTED LAYOUT';
    $('axis-summary').textContent = cfg.mode === 'axes' ? cfg.axes.map(i => `d${i}`).join(' / ') : cfg.mode === 'pca' ? 'PC1 / PC2 / PC3' : `seed ${cfg.seed}`;
    $('projection-note').textContent = cfg.mode === 'axes' ? copy("main_010") : cfg.mode === 'pca' ? copy("main_011") : copy("main_012");
    $('edge-note').textContent = cfg.relationship === 'geometric' ? copy("main_013") : cfg.relationship === 'disagreement' ? copy("main_014") : copy("main_015");
    $('palette-note').textContent = cfg.influence >= 0 ? copy("main_016") : cfg.palette === 'rainbow' ? copy("main_017") : copy("main_018");
}
let graphCache: {
    key: string;
    points: Vec3[];
} | undefined;
function updateProjection() {
    syncControls();
    const active = cfg.enabled.flatMap((v, i) => v ? [i] : []);
    if (cfg.mode === 'axes')
        projected = project(ds.states, cfg.axes);
    else if (cfg.mode === 'pca') {
        pcaResult = pca(ds.states, active);
        projected = pcaResult.points;
        $('pca-info').innerHTML = copy("main_019", [(pcaResult.variance.slice(0, 3).reduce((a, b) => a + b, 0) * 100).toFixed(1), pcaResult.variance.slice(0, 3).map((v, i) => copy("main_020", [i + 1, v, (v * 100).toFixed(1)])).join(''), esc(JSON.stringify({ dimensions: active, means: pcaResult.means, basis: pcaResult.basis }, null, 2))]);
    }
    else {
        const key = hash + ':' + cfg.seed;
        if (graphCache?.key !== key)
            graphCache = { key, points: layout(ds.states, links, cfg.seed) };
        projected = graphCache.points;
    }
    scene.setProjection(projected, cfg);
    renderFilter();
    inspect();
}
function renderFilter() {
    const component = cfg.component >= 0 ? new Set(groups[cfg.component] ?? []) : null;
    const visible = ds.states.map((s, i) => (!component || component.has(i)) && (cfg.filter === 'all' || cfg.filter === 'disagreements' && disagrees(s) || cfg.filter === 'unsafe' && category(s) === 'UNSAFE' || cfg.filter === 'enforcers' && s.enforcer_1_decision !== 'UNKNOWN' && s.enforcer_2_decision !== 'UNKNOWN' && s.enforcer_1_decision !== s.enforcer_2_decision));
    scene.style(cfg, visible, links, faceList);
    $('visible-count').textContent = visible.filter(Boolean).length.toLocaleString();
    $('edge-count').textContent = links.length.toLocaleString();
    $('disagree-count').textContent = ds.states.filter(disagrees).length.toLocaleString();
    $('component-count').textContent = String(groups.length);
    const displayedFaces = faceList.filter(f => f.every(i => visible[i])).length;
    $('face-count').textContent = copy("main_021", [faceList.length === 20000 ? '≥' : '', faceList.length.toLocaleString(), faceList.length === 20000 ? ' (enumeration capped)' : '', cfg.faces ? ` · ${Math.min(120, displayedFaces)} shown (cap 120)` : '', scene.links.length]);
    $('legend').innerHTML = Object.entries(labels).filter(([k]) => k !== 'DIVERGENT').map(([k, v]) => copy("main_022", [colors[k], k === 'UNSAFE' ? '◇ ' : k === 'RESTRICTIVE' ? '□ ' : k === 'UNKNOWN' ? '△ ' : '○ ', esc(v)])).join('');
}
function select(i: number) { cfg.selected = ds.states[i]?.state_id ?? null; scene.select(i); $<HTMLSelectElement>('state-list').value = String(i); inspect(); }
function inspect() {
    const i = ds.states.findIndex(s => s.state_id === cfg.selected);
    scene.select(i);
    if (i < 0) {
        $('inspection').innerHTML = copy("main_023");
        return;
    }
    $<HTMLSelectElement>('state-list').value = String(i);
    const s = ds.states[i];
    const kind = category(s);
    const enforcerDiff = s.enforcer_1_decision !== 'UNKNOWN' && s.enforcer_2_decision !== 'UNKNOWN' && s.enforcer_1_decision !== s.enforcer_2_decision;
    const p = projected[i] ?? [0, 0, 0];
    const render = scene.target[i]?.toArray() ?? [0, 0, 0];
    $('inspection').innerHTML = copy("main_024", [esc(s.provenance.toUpperCase()), !scene.visible[i] ? '· HIDDEN BY FILTER' : '', esc(s.state_id), colors[kind], kind === 'UNSAFE' ? '◇ ' : '', labels[kind], enforcerDiff ? copy("main_025") : '', s.coordinates.join(', '), cfg.pins.includes(s.state_id) ? '− Unpin state' : '+ Pin for comparison', ds.dimensions.map((d, k) => copy("main_026", [esc(d.definition), esc(d.name), s.coordinates[k], s.coordinates[k] ? 'true' : 'false'])).join(''), s.policy_decision.toLowerCase(), s.policy_decision, s.enforcer_1_decision.toLowerCase(), s.enforcer_1_decision, s.enforcer_2_decision.toLowerCase(), s.enforcer_2_decision, s.provenance === 'synthetic' ? 'Simulated outcome' : 'Reported outcome', s.execution_outcome, s.reachable === null ? 'UNKNOWN' : String(s.reachable), kind, esc(s.disagreement_type), esc(s.command ?? 'Command not supplied'), esc(s.execution_trace ?? copy("main_027")), esc(s.execution_trace_reference ?? 'Not supplied'), s.local_views ? copy("main_028", [s.local_views.A ? '◉' : '○', s.local_views.B ? '◉' : '○', s.local_views.A ? (s.local_views.B ? 'A ∩ B' : 'A only') : (s.local_views.B ? 'B only' : 'Neither')]) : 'Membership not supplied · unknown', p.map(v => v.toFixed(5)).join(', '), render.map(v => v.toFixed(5)).join(', ')]);
    $('pin').onclick = () => { if (cfg.pins.includes(s.state_id))
        cfg.pins = cfg.pins.filter(id => id !== s.state_id);
    else {
        if (cfg.pins.length === 2)
            cfg.pins.shift();
        cfg.pins.push(s.state_id);
    } inspect(); };
    compare();
}
function compare() {
    const selected = cfg.pins.map(id => ds.states.find(s => s.state_id === id)).filter(s => !!s);
    $('comparison').innerHTML = copy("main_029", [selected.length, selected.length ? selected.map(s => copy("main_030", [esc(s.state_id), esc(s.state_id)])).join('') : copy("main_031")]);
    if (selected.length === 2) {
        const [a, b] = selected;
        const diff = ds.dimensions.flatMap((d, k) => a.coordinates[k] !== b.coordinates[k] ? [`${d.name}: ${!!a.coordinates[k]} → ${!!b.coordinates[k]}`] : []);
        const transition = a.transitions?.find(t => t.target === b.state_id);
        $('comparison').innerHTML += copy("main_032", [hamming(a, b), esc(diff.join(', ') || 'None'), (['policy_decision', 'enforcer_1_decision', 'enforcer_2_decision'] as const).map(k => copy("main_033", [k.replace('_decision', '').replaceAll('_', ' '), a[k], b[k]])).join(''), transition ? copy("main_034", [esc(transition.change)]) : copy("main_035"), boundaryNotPreserved(a,b) ? copy("main_036") : '']);
    }
    document.querySelectorAll<HTMLElement>('[data-pin-id]').forEach(b => b.onclick = () => select(ds.states.findIndex(s => s.state_id === b.dataset.pinId)));
}
function stopCycle() { if (cycleTimer)
    clearInterval(cycleTimer); cycleTimer = undefined; $('cycle').textContent = '▷ Animate coordinate basis'; }
function stopPath() { if (pathTimer)
    clearInterval(pathTimer); pathTimer = undefined; $('traverse').textContent = '▷ Traverse defined path'; }
function currentSettings() { cfg.camera = scene.getCamera(); return validateConfig(cfg, ds.dimensions.length); }
function download(name: string, contents: string, type: string) { const url = URL.createObjectURL(new Blob([contents], { type })); const a = document.createElement('a'); a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
async function loadDataset(next: Dataset) {
    const nextHash = await fingerprint(next);
    stopCycle();
    stopPath();
    ds = freeze(next);
    hash = nextHash;
    graphCache = undefined;
    cfg = { ...structuredClone(defaultConfig), enabled: Array(ds.dimensions.length).fill(true), datasetId: ds.id, datasetHash: hash, selected: ds.states[0].state_id };
    const viewportRatio = $('viewport').clientWidth / $('viewport').clientHeight;
    if (viewportRatio < 1)
        cfg.camera.position = cfg.camera.position.map(v => v / viewportRatio) as Vec3;
    rebuildAnalysis();
    scene.load(ds.states);
    buildControls();
    updateProjection();
    scene.setCamera(cfg.camera);
    const provenance = new Set(ds.states.map(s => s.provenance));
    $('provenance').textContent = provenance.size === 1 && provenance.has('synthetic') ? 'SYNTHETIC DEMONSTRATION' : provenance.size === 1 && provenance.has('measured') ? 'IMPORTED · MEASURED AS DECLARED' : provenance.has('synthetic') ? 'MIXED PROVENANCE · INSPECT EACH STATE' : 'IMPORTED · UNVERIFIED PROVENANCE';
    $('provenance').classList.toggle('imported', !provenance.has('synthetic'));
    $('dataset-caption').textContent = `${ds.dimensions.length}D BOOLEAN REPRESENTATION`;
    $('space-label').textContent = `${ds.states.length} states · ${ds.id}`;
    $('receipt').textContent = `SHA-256 ${hash.slice(0, 16)}…`;
    $('receipt').title = hash;
}
function applySettings(text: string) { const next = restoreConfig(text, ds.id, hash, ds.dimensions.length); if (next.selected && !ds.states.some(s => s.state_id === next.selected) || next.pins.some(id => !ds.states.some(s => s.state_id === id)) || next.component >= groups.length)
    throw new Error(copy("main_037")); stopCycle(); stopPath(); cfg = next; updateProjection(); scene.setCamera(cfg.camera); toast(copy("main_038")); }
function restoreURL() { if (!location.hash.startsWith('#view='))
    throw new Error(copy("main_039")); if (location.hash.length > 10000)
    throw new Error(copy("main_040")); const raw = JSON.parse(decodeURIComponent(location.hash.slice(6))); raw.datasetId = ds.id; applySettings(JSON.stringify(raw)); }
$('restore-url').hidden = !location.hash.startsWith('#view=');
$('restore-url').onclick = safety(restoreURL);
document.querySelectorAll<HTMLElement>('[data-mode]').forEach(b => b.onclick = safety(() => { stopCycle(); cfg.mode = b.dataset.mode as Config['mode']; updateProjection(); }));
document.querySelectorAll<HTMLElement>('[data-filter]').forEach(b => b.onclick = () => { cfg.filter = b.dataset.filter as Config['filter']; syncControls(); renderFilter(); inspect(); });
for (const name of ['palette', 'relationship'] as const)
    $<HTMLSelectElement>(name).onchange = () => { cfg[name] = $<HTMLSelectElement>(name).value as never; syncControls(); renderFilter(); };
for (const name of ['views', 'faces'] as const)
    $<HTMLInputElement>(name).onchange = () => { cfg[name] = $<HTMLInputElement>(name).checked; renderFilter(); };
$<HTMLInputElement>('spread').onchange = () => { cfg.spread = $<HTMLInputElement>('spread').checked; updateProjection(); };
$<HTMLInputElement>('seed').onchange = safety(() => { const seed = Number($<HTMLInputElement>('seed').value); validateConfig({ ...cfg, seed }, ds.dimensions.length); cfg.seed = seed; updateProjection(); });
$<HTMLSelectElement>('influence').onchange = () => { cfg.influence = Number($<HTMLSelectElement>('influence').value); syncControls(); renderFilter(); };
$<HTMLSelectElement>('component').onchange = () => { cfg.component = Number($<HTMLSelectElement>('component').value); renderFilter(); inspect(); };
$<HTMLSelectElement>('state-list').onchange = () => select(Number($<HTMLSelectElement>('state-list').value));
$('next-unsafe').onclick = () => { const start = ds.states.findIndex(s => s.state_id === cfg.selected); for (let k = 1; k <= ds.states.length; k++) {
    const i = (start + k) % ds.states.length;
    if (category(ds.states[i]) === 'UNSAFE') {
        cfg.filter = 'all';
        cfg.component = -1;
        syncControls();
        renderFilter();
        select(i);
        return;
    }
} toast(copy("main_041")); };
$('cycle').onclick = () => { if (cycleTimer) {
    stopCycle();
    return;
} stopPath(); cfg.mode = 'axes'; $('cycle').textContent = 'Ⅱ Pause basis animation'; cycleTimer = setInterval(() => { const active = cfg.enabled.flatMap((v, i) => v ? [i] : []); cfg.axes = cfg.axes.map(i => active[(active.indexOf(i) + 1) % active.length]); updateProjection(); }, 1800); updateProjection(); };
$('traverse').onclick = () => { if (pathTimer) {
    stopPath();
    return;
} stopCycle(); const start = ds.states.find(s => s.state_id === cfg.selected && s.transitions?.length) ?? ds.states.find(s => s.transitions?.length); if (!start) {
    toast(copy("main_042"));
    return;
} const path = pathFrom(ds.states, start.state_id); let step = 0; cfg.filter = 'all'; cfg.component = -1; syncControls(); renderFilter(); select(ds.states.indexOf(start)); $('traverse').textContent = 'Ⅱ Pause traversal'; $('step-label').textContent = `Start: ${start.command ?? start.state_id}`; pathTimer = setInterval(() => { step++; if (step >= path.length) {
    stopPath();
    return;
} const previous = ds.states.find(s => s.state_id === path[step - 1])!; select(ds.states.findIndex(s => s.state_id === path[step])); $('step-label').textContent = previous.transitions!.find(t => t.target === path[step])!.change; }, 2400); };
$('reset').onclick = () => {const camera=structuredClone(defaultConfig.camera);const ratio=$('viewport').clientWidth/$('viewport').clientHeight;if(ratio<1)camera.position=camera.position.map(v=>v/ratio) as Vec3;scene.setCamera(camera);};
$('about').onclick = () => $<HTMLDialogElement>('about-dialog').showModal();
$('close-about').onclick = () => $<HTMLDialogElement>('about-dialog').close();
$('export').onclick = () => $<HTMLDialogElement>('export-dialog').showModal();
$('close-export').onclick = () => $<HTMLDialogElement>('export-dialog').close();
$('download-config').onclick = safety(() => download('state-space-view.json', JSON.stringify(currentSettings(), null, 2), 'application/json'));
$('download-png').onclick = () => { const c = currentSettings(); const a = document.createElement('a'); a.download = 'state-space-view.png'; a.href = scene.screenshot([`${ds.id} | ${$('provenance').textContent}`, `SHA-256 ${hash}`, copy("main_043", [cfg.mode, cfg.axes.join(','), cfg.seed, cfg.filter]), copy("main_044", [c.enabled.flatMap((v, i) => v ? [i] : []).join(','), c.relationship, c.spread]), copy("main_045")]); a.click(); };
$('share').onclick = safety(async () => { const c = currentSettings(); c.datasetId = ''; c.selected = null; c.pins = []; const url = new URL(location.href); url.hash = 'view=' + encodeURIComponent(JSON.stringify(c)); await navigator.clipboard.writeText(url.href); toast(copy("main_046")); });
$('load').onclick = () => $<HTMLInputElement>('dataset-file').click();
$('restore').onclick = () => $<HTMLInputElement>('config-file').click();
$<HTMLInputElement>('dataset-file').onchange = safety(async () => { const input = $<HTMLInputElement>('dataset-file'); const file = input.files?.[0]; if (!file)
    return; if (file.size > 20000000)
    throw new Error(copy("main_047")); const next = parseDataset(await file.text(), file.name); await loadDataset(next); input.value = ''; toast(copy("main_048", [ds.states.length])); });
$<HTMLInputElement>('config-file').onchange = safety(async () => { const input = $<HTMLInputElement>('config-file'); const file = input.files?.[0]; if (!file)
    return; if (file.size > 100000)
    throw new Error(copy("main_049")); applySettings(await file.text()); input.value = ''; });
async function init() { await loadDataset(ds); cfg.selected = 'state-0003'; inspect(); if (location.hash.startsWith('#view=')) {
    try {
        restoreURL();
    }
    catch (e) {
        toast((e as Error).message + copy("main_050"));
    }
} }
// A hash from an imported dataset can be restored after loading that file, without embedding data in the URL.
window.addEventListener('hashchange', () => { $('restore-url').hidden = !location.hash.startsWith('#view='); if (location.hash.startsWith('#view=')) {
    try {
        restoreURL();
    }
    catch (e) {
        toast((e as Error).message);
    }
} });
void init().catch(e => toast(e.message));
