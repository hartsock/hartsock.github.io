import { copy } from './copy.ts';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { category, disagrees, type State, type Vec3, type Edge, type Config } from './core';
export const colors: Record<string, string> = { ALLOW: '#4fe2a1', DENY: '#58a8ff', UNSAFE: '#ff5c72', RESTRICTIVE: '#ffb35c', DIVERGENT: '#c391ff', UNKNOWN: '#788493' };
const accessible: Record<string, string> = { ALLOW: '#009e73', DENY: '#56b4e9', UNSAFE: '#d55e00', RESTRICTIVE: '#f0e442', DIVERGENT: '#cc79a7', UNKNOWN: '#999999' };
export class StateScene {
    renderer: THREE.WebGLRenderer;
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(42, 1, .1, 1000);
    controls: OrbitControls;
    nodes: THREE.Mesh[] = [];
    halos: THREE.Group[] = [];
    root = new THREE.Group();
    states: State[] = [];
    current: THREE.Vector3[] = [];
    target: THREE.Vector3[] = [];
    projection: Vec3[] = [];
    links: Edge[] = [];
    line: THREE.LineSegments | null = null;
    faceMesh: THREE.Mesh | null = null;
    visible: boolean[] = [];
    config!: Config;
    selected = -1;
    onSelect: (index: number) => void = () => { };
    start = 0;
    animating = false;
    request = 0;
    sizeObserver: ResizeObserver;
    raycaster = new THREE.Raycaster();
    pointer = new THREE.Vector2();
    down = [0, 0];
    reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    geometries = [new THREE.SphereGeometry(.105, 16, 12), new THREE.OctahedronGeometry(.15), new THREE.BoxGeometry(.19, .19, .19), new THREE.TetrahedronGeometry(.16)];
    selection = new THREE.Mesh(new THREE.TorusGeometry(.23, .012, 8, 36), new THREE.MeshBasicMaterial({ color: '#ffffff', depthTest: false }));
    constructor(public host: HTMLElement) {
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
        this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
        this.renderer.setClearColor(0x080d16, 0);
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        host.appendChild(this.renderer.domElement);
        this.renderer.domElement.setAttribute('aria-label', copy("scene_001"));
        this.camera.position.set(12, 9, 15);
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = !this.reducedMotion;
        this.controls.dampingFactor = .08;
        this.controls.minDistance = 2;
        this.controls.maxDistance = 120;
        this.scene.add(this.root);
        this.scene.add(this.selection);
        this.selection.visible = false;
        const grid = new THREE.GridHelper(24, 24, 0x253244, 0x142030);
        grid.position.y = -5.3;
        grid.material.transparent = true;
        grid.material.opacity = .4;
        this.scene.add(grid);
        this.scene.add(new THREE.AmbientLight(0xffffff, 2));
        const light = new THREE.PointLight(0x93bfff, 30, 50);
        light.position.set(4, 10, 6);
        this.scene.add(light);
        this.sizeObserver = new ResizeObserver(() => { const { width, height } = host.getBoundingClientRect(); this.renderer.setSize(width, height); this.camera.aspect = width / height; this.camera.updateProjectionMatrix(); });
        this.sizeObserver.observe(host);
        this.renderer.domElement.addEventListener('pointerdown', e => { this.down = [e.clientX, e.clientY]; });
        this.renderer.domElement.addEventListener('pointerup', e => { if (Math.hypot(e.clientX - this.down[0], e.clientY - this.down[1]) > 5)
            return; const box = host.getBoundingClientRect(); this.pointer.set((e.clientX - box.left) / box.width * 2 - 1, -(e.clientY - box.top) / box.height * 2 + 1); this.raycaster.setFromCamera(this.pointer, this.camera); const hits = this.raycaster.intersectObjects(this.nodes.filter(n => n.visible),false); if (hits[0])
            this.onSelect(hits[0].object.userData.index); });
        this.tick();
    }
    load(states: State[]) {
        this.clear();
        this.states = states;
        states.forEach((s, i) => {
            const kind = category(s);
            const shape = kind === 'UNSAFE' ? 1 : kind === 'RESTRICTIVE' ? 2 : kind === 'UNKNOWN' ? 3 : 0;
            const mesh = new THREE.Mesh(this.geometries[shape], new THREE.MeshStandardMaterial({ color: colors[kind], emissive: colors[kind], emissiveIntensity: .65, roughness: .35, wireframe: s.provenance === 'synthetic' }));
            mesh.userData.index = i;
            this.root.add(mesh);
            this.nodes.push(mesh);
            if (s.enforcer_1_decision !== 'UNKNOWN' && s.enforcer_2_decision !== 'UNKNOWN' && s.enforcer_1_decision !== s.enforcer_2_decision) {
                const outline = new THREE.Mesh(new THREE.OctahedronGeometry(.19), new THREE.MeshBasicMaterial({ color: '#c391ff', wireframe: true, transparent: true, opacity: .7 }));
                mesh.add(outline);
            }
            const rings = new THREE.Group();
            for (const [key, color, radius] of [['A', '#6fe6ed', .23], ['B', '#f3cf86', .30]] as const) {
                if (s.local_views?.[key]) {
                    const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, .012, 6, 24), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: .7 }));
                    rings.add(ring);
                }
            }
            this.root.add(rings);
            this.halos.push(rings);
        });
    }
    clear() { for (const n of this.nodes) {
        this.root.remove(n);
        (n.material as THREE.Material).dispose();
        n.children.forEach(child => { if (child instanceof THREE.Mesh) {
            child.geometry.dispose();
            child.material.dispose();
        } });
    } for (const g of this.halos) {
        this.root.remove(g);
        g.traverse(o => { if (o instanceof THREE.Mesh) {
            o.geometry.dispose();
            o.material.dispose();
        } });
    } this.nodes = []; this.halos = []; this.current = []; this.target = []; this.removeLines(); }
    removeLines() { if (this.line) {
        this.root.remove(this.line);
        this.line.geometry.dispose();
        (this.line.material as THREE.Material).dispose();
        this.line = null;
    } if (this.faceMesh) {
        this.root.remove(this.faceMesh);
        this.faceMesh.geometry.dispose();
        (this.faceMesh.material as THREE.Material).dispose();
        this.faceMesh = null;
    } }
    setProjection(points: Vec3[], config: Config) {
        this.projection = points;
        const min = [0, 1, 2].map(d => Math.min(...points.map(p => p[d])));
        const max = [0, 1, 2].map(d => Math.max(...points.map(p => p[d])));
        const span = Math.max(...max.map((v, d) => v - min[d]), 1);
        const buckets = new Map<string, number[]>();
        points.forEach((p, i) => { const key = p.map(v => v.toFixed(7)).join(','); buckets.set(key, [...(buckets.get(key) ?? []), i]); });
        this.target = points.map((p, i) => {
            const base = new THREE.Vector3(...p.map((v, d) => (v - (max[d] + min[d]) / 2) * 9 / span) as Vec3);
            const group = buckets.get(p.map(v => v.toFixed(7)).join(','))!;
            if (config.spread && group.length > 1) {
                const k = group.indexOf(i);
                const y = 1 - 2 * (k + .5) / group.length;
                const r = Math.sqrt(1 - y * y);
                const angle = k * 2.399963229728653;
                const radius = Math.min(1.45, .20 * Math.sqrt(group.length));
                base.add(new THREE.Vector3(Math.cos(angle) * r, y, Math.sin(angle) * r).multiplyScalar(radius));
            }
            return base;
        });
        if (!this.current.length || this.reducedMotion)
            this.current = this.target.map(p => p.clone());
        this.start = performance.now();
        this.animating = true;
    }
    style(config: Config, visible: boolean[], links: Edge[], faceList: number[][]) {
        this.config = config;
        this.visible = visible;
        this.links = links.filter(([a, b]) => visible[a] && visible[b] && (config.relationship === 'geometric' || config.relationship === 'disagreement' && (disagrees(this.states[a]) || disagrees(this.states[b])) || config.relationship === 'overlap' && [a, b].every(i => this.states[i].local_views?.A && this.states[i].local_views?.B)));
        this.nodes.forEach((node, i) => { node.visible = visible[i]; this.halos[i].visible = visible[i] && config.views; const s = this.states[i]; const col = config.influence >= 0 ? (s.coordinates[config.influence] ? '#f3cf86' : '#65d6e4') : config.palette === 'rainbow' ? new THREE.Color().setHSL(i / this.states.length, .9, .65).getStyle() : (config.palette === 'accessible' ? accessible : colors)[category(s)]; const material = node.material as THREE.MeshStandardMaterial; material.color.set(col); material.emissive.set(col); });
        this.removeLines();
        const positions = new Float32Array(this.links.length * 6);
        const cols = new Float32Array(this.links.length * 6);
        this.links.forEach(([a, b], k) => { const boundary = disagrees(this.states[a]) !== disagrees(this.states[b]); const color = new THREE.Color(config.relationship === 'overlap' ? '#69b8ba' : config.relationship === 'disagreement' ? (boundary ? '#ffc07e' : '#ff637c') : '#547c9e'); for (let j = 0; j < 2; j++)
            color.toArray(cols, k * 6 + j * 3); });
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(cols, 3));
        this.line = new THREE.LineSegments(geometry, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: config.relationship === 'geometric' ? .19 : .55, depthWrite: false }));
        this.root.add(this.line);
        if (config.faces) {
            const selected = faceList.filter(f => f.every(i => visible[i])).slice(0, 120);
            const faceGeometry = new THREE.BufferGeometry();
            faceGeometry.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(selected.length * 18), 3));
            this.faceMesh = new THREE.Mesh(faceGeometry, new THREE.MeshBasicMaterial({ color: '#ff8c9e', transparent: true, opacity: .035, side: THREE.DoubleSide, depthWrite: false }));
            this.faceMesh.userData.faces = selected;
            this.root.add(this.faceMesh);
        }
        this.updateGeometry();
    }
    updateGeometry() {
        this.nodes.forEach((node, i) => { if (!this.current[i])
            return; node.position.copy(this.current[i]); this.halos[i].position.copy(this.current[i]); this.halos[i].quaternion.copy(this.camera.quaternion); });
        if (this.line) {
            const attr = this.line.geometry.getAttribute('position');
            this.links.forEach(([a, b], i) => { attr.setXYZ(i * 2, ...this.current[a].toArray()); attr.setXYZ(i * 2 + 1, ...this.current[b].toArray()); });
            attr.needsUpdate = true;
            this.line.geometry.computeBoundingSphere();
        }
        if (this.faceMesh) {
            const attr = this.faceMesh.geometry.getAttribute('position');
            (this.faceMesh.userData.faces as number[][]).forEach((f, k) => { [f[0], f[1], f[2], f[0], f[2], f[3]].forEach((i, j) => attr.setXYZ(k * 6 + j, ...this.current[i].toArray())); });
            attr.needsUpdate = true;
            this.faceMesh.geometry.computeBoundingSphere();
        }
    }
    select(i: number) { this.selected = i; }
    setCamera(c: Config['camera']) { this.camera.position.fromArray(c.position); this.controls.target.fromArray(c.target); this.controls.update(); }
    getCamera(): Config['camera'] { return { position: this.camera.position.toArray() as Vec3, target: this.controls.target.toArray() as Vec3 }; }
    tick = () => {
        this.request = requestAnimationFrame(this.tick);
        if (document.hidden)
            return;
        this.controls.update();
        if (this.animating) {
            const dt = performance.now() - this.start;
            const alpha = 1 - Math.exp(-Math.min(dt, 80) / 90);
            this.current.forEach((p, i) => p.lerp(this.target[i], alpha));
            if (this.current.every((p, i) => p.distanceToSquared(this.target[i]) < 1e-7)) {
                this.current = this.target.map(p => p.clone());
                this.animating = false;
            }
            this.updateGeometry();
        }
        this.halos.forEach(g => g.quaternion.copy(this.camera.quaternion));
        this.selection.visible = this.selected >= 0 && !!this.visible[this.selected];
        if (this.selection.visible) {
            this.selection.position.copy(this.current[this.selected]);
            this.selection.quaternion.copy(this.camera.quaternion);
            this.selection.scale.setScalar(this.reducedMotion ? 1 : 1 + Math.sin(performance.now() / 400) * .08);
        }
        this.renderer.render(this.scene, this.camera);
    };
    screenshot(receipt: string[]) {
        // Export the stable target projection, never an unrecorded interpolation frame.
        this.current=this.target.map(p=>p.clone());this.animating=false;this.updateGeometry();
        this.renderer.render(this.scene, this.camera);
        const src = this.renderer.domElement;
        const out = document.createElement('canvas');
        out.width = src.width;
        out.height = src.height + 150;
        const ctx = out.getContext('2d')!;
        ctx.fillStyle = '#080d16';
        ctx.fillRect(0, 0, out.width, out.height);
        ctx.drawImage(src, 0, 0);
        ctx.font = '14px monospace';
        ctx.fillStyle = '#b7cad8';
        receipt.forEach((line, i) => ctx.fillText(line, 20, src.height + 28 + i * 22));
        return out.toDataURL('image/png');
    }
}
