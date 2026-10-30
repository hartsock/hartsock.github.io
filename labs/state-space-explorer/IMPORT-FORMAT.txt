# Computational State-Space Explorer

A browser-only visualization for hartsock.github.io at `/labs/state-space-explorer/`.
The source is isolated from the authorization and mathematical experiments. The supplied
brief describes “Geometric Topology of Computational Intent”; neither the paper nor its
measured outputs were available in this checkout. The demonstration is not a reconstruction
of its results.

## Run and build

Requires Node 22.12+ and npm. From this directory:

```sh
npm ci
npm test
npm run dev
```

Open the URL Vite prints, including `/labs/state-space-explorer/`.

```sh
npm run generate
npm run build
```

The build writes a self-contained static application into `../../labs/state-space-explorer/`.
That output is committed for the site's existing Jekyll / GitHub Pages publishing flow;
Jekyll ignores this underscored source directory. No backend, API key, CDN, telemetry,
remote trace fetching, or execution of imported commands is used. Keep `package-lock.json`.
The build bundles all JavaScript dependencies and uses system fonts.

Authored instrument copy is owned by `_copy/state-space-explorer.md`, following the site's
Markdown convention. `generate` emits its JSON dictionary. The bundled entry point is a
generated artifact, with a narrowly named prose-rule exception checked by
`scripts/state-space-build.test.mjs`. Third-party chunks live under `assets/vendor/`.
The build receipt hashes all application sources and outputs (normalizing line endings);
CI additionally rebuilds from source and rejects any output drift. Edit the Markdown owner
for interface text, regenerate, and rebuild rather than editing the output bundle.

## Explore

Drag to orbit, scroll to zoom, right-drag to pan. Click a marker or use the keyboard-accessible
state selector. Find unsafe jumps to the next unsafe state. Pin two states to compare their
vectors, differing dimensions, Hamming distance, decisions, and any supplied directed transition.
State filters retain the underlying data; a selected state can remain inspected while hidden.

Axis mode selects three distinct dimensions. Every state is retained. Deterministic spherical
offsets separate coincident points; disable offsets to see the actual overlaps, and use the state
selector to inspect any coincident vertex. There is no mathematical jitter: offsets only affect
the rendering. Axis values are original coordinate values before display normalization.

PCA centers the enabled columns without variance scaling and displays the first three components.
The inspector shows projected coordinates, and the PCA panel shows means, loadings, and explained
variance. The complete eight-dimensional Boolean cube has eight equal covariance eigenvalues:
each component explains 12.5%, and the first three explain 37.5%. Its PCA axes have no privileged
semantic direction. Eigenvector signs are stabilized, but repeated eigenvalues leave the basis
nonunique. Zero-total-variance data reports 0%, not NaN.

Graph mode uses d3-force-3d, 180 simulation ticks, an unsigned 32-bit seed, fixed initial positions
from that seed, charge −18, link distance 2.5 and link strength 0.2. It always uses full-vector
Hamming-one adjacency; disabling dimensions affects axis selection / PCA, not the original graph.
Force distances are layout choices, not semantic distances. Exact layout reproducibility assumes
the same ordered dataset, lockfile, application version and JavaScript numeric behavior.

All projection modes normalize positions with one common scale factor, preserving aspect ratio;
collision offsets and animated interpolation are a further display step. Imported results are
deep-frozen. Projection, filter, graph and rendering calculations do not modify them.

## Synthetic fixture

The 256 states exhaust `{0,1}^8`. Files are in `public/` and the deployed directory:

- `synthetic-boolean8.json`: includes dimension definitions and dataset ID; recommended for exact restoration.
- `synthetic-boolean8.jsonl`: one state per line.
- `synthetic-boolean8.csv`: equivalent quoted CSV.

Every state declares `provenance: "synthetic"`. No command was executed, and SUCCESS/BLOCKED
are simulated results following teaching enforcer 2. The invented teaching rules are:

All 256 bit combinations are declared reachable in this abstract teaching fixture. Physical
filesystem feasibility is not modeled; these flags and simulated outcomes are not evidence
that the corresponding real-world command can execute.

```text
policy = inside && (!symlink || resolved_inside) && (!write || write_granted) && !expired
enforcer_1 = policy && (!write || target_exists)
enforcer_2 = inside && (!write || write_granted) && !expired
```

There are 30 allow agreements, 208 deny agreements, 12 unsafe disagreements, and 6 restrictive
disagreements. The 18 disagreement vertices form one component with 17 candidate squares.
The full Boolean graph has 1,024 edges and 1,792 squares. State `state-0003`, vector
`[1,1,0,0,0,0,0,0]`, is a known unsafe synthetic example. This is a fixture fact, not an
experimental finding.

Local synthetic views are A = `!operator_is_B || write_granted`, B = `operator_is_B || target_exists`.
These are illustrative memberships, not actual authorization checks. The explicitly supplied
synthetic traversal is `state-0001 → state-0003 → state-0007 → state-0071`.

## JSONL, JSON and CSV contract

Use UTF-8. Up to 4,096 states and 20 MB are accepted. This version accepts equal-length Boolean
vectors of 3–32 dimensions. Other coordinate types require a future explicit schema extension.
IDs must be nonempty and unique; duplicate original vectors are retained as separate states.

Required fields (all must be present; explicit unknown values are supported):

| Field | Value |
| --- | --- |
| `state_id` | Unique string |
| `coordinates` | Array of 0/1 numbers |
| `reachable` | `true`, `false`, or `null` (unknown) |
| `policy_decision` | `ALLOW`, `DENY`, `UNKNOWN` |
| `enforcer_1_decision` | `ALLOW`, `DENY`, `UNKNOWN` |
| `enforcer_2_decision` | `ALLOW`, `DENY`, `UNKNOWN` |
| `execution_outcome` | `SUCCESS`, `BLOCKED`, `FAILURE`, `UNTESTED`, `UNKNOWN` |
| `disagreement_type` | Nonempty source classification string; `UNKNOWN` allowed |
| `execution_trace_reference` | String or `null`; displayed as text, never fetched |

Optional fields:

| Field | Value |
| --- | --- |
| `provenance` | `synthetic`, `measured`, or `unverified`; omitted means `unverified` |
| `command` | Literal string, never executed |
| `execution_trace` | Literal string, rendered safely as text |
| `local_views` | `{"A": true, "B": false}`; both Boolean keys required |
| `transitions` | `[{"target":"another-state-id","change":"Exact computational change"}]` |

Every transition target must exist in the loaded file. Transitions are directed and need not
have Hamming distance one; they are explicit source claims, not verified by this visualization.
No transition is inferred from a geometric edge. Missing command, trace, definitions, transitions
or view membership is shown as missing; absent view membership does not mean “neither.”

JSONL: one state object per nonblank line. CSV: a header row and the same fields; `coordinates`,
`local_views` and `transitions` are JSON values inside CSV-quoted cells. Double embedded quotes
according to CSV rules. `reachable` is the literal `true`, `false` or `null`, not 0/1; an empty
trace-reference cell becomes null. Optional empty JSON-valued cells are absent. See the generated
CSV for a complete working example.

JSON can be a state array or a metadata envelope:

```json
{
  "id": "experiment-run-identifier",
  "dimensions": [
    {"name":"condition_0","definition":"Meaning supplied by the experiment"},
    {"name":"condition_1","definition":"Another observed condition"},
    {"name":"condition_2","definition":"A third observed condition"}
  ],
  "states": [{
    "state_id":"sample-1", "coordinates":[0,1,0], "reachable":null,
    "policy_decision":"UNKNOWN", "enforcer_1_decision":"UNKNOWN",
    "enforcer_2_decision":"UNKNOWN", "execution_outcome":"UNTESTED",
    "disagreement_type":"UNKNOWN", "execution_trace_reference":null
  }]
}
```

The envelope supplies dimension meanings; JSONL/CSV without metadata use generic dimension names
and explicitly missing definitions. Provenance is declared by the input and is not independently
attested. The top banner identifies synthetic, declared-measured, mixed, or unverified input;
the inspector shows each state's provenance. Synthetic markers are wireframe; measured markers
are solid. Treat imported files as potentially sensitive; processing is local, but this instrument
does not enforce access restrictions on records already loaded into the browser.

## Classification, relationships and interpretation

Classification is derived separately from the unmodified source `disagreement_type` and both are
shown. Unreachable, unknown reachability, untested / unknown outcomes, or unknown decisions are
gray. Otherwise a policy DENY with either enforcer ALLOW is unsafe; policy ALLOW with either
enforcer DENY is restrictive. Complete binary decisions cannot produce an enforcer disagreement
outside these two cases, so purple outlines show this independent property without replacing
the policy-based color. Green and blue require agreement of all three decisions. An unsafe
decision is not by itself proof that execution succeeded.

The accessible palette changes color only. Classification also uses sphere (agreement), diamond
(unsafe), cube (restrictive), tetrahedron (unknown); purple wire outlines indicate differing
known enforcers. Rainbow encodes state order, and dimension highlighting encodes 0 vs 1; the
panel warns that these colors do not encode classification. Hover dimension rows for definitions.
Dimension correlations exclude unknown/untested states and report the difference in conditional
disagreement rates in percentage points. Empty conditional bins report n/a; association is not
causation.

Geometric lines are full-vector Hamming-one edges. Disagreement lines are incident to a disagreement
vertex; amber marks the boundary to agreement or unknown, red links two disagreement vertices.
Overlap lines are Hamming edges inside A ∩ B, not the same thing as either of the above layers.
Halos independently show A and B membership; two rings mean intersection, one ring means exclusive
membership, no rings on a record with memberships means neither. Missing memberships remain unknown.

Components use the disagreement-induced graph of the entire loaded dataset, not projected distances
or filtered screen points. Candidate faces are four supplied Boolean vectors completing a coordinate
square; only all-disagreement candidates are offered as translucent faces. Duplicate vector records
contribute separate candidates. Enumeration stops at 20,000 and is explicitly marked “≥” when capped;
at most 120 visible candidates are drawn, also explicitly labeled. Neither the triangles used to
display a square nor apparent holes establish continuity, manifold structure, homology, or correctness.
No global correctness claim follows from agreement on overlapping views.

## Export and restore

Export view offers PNG and JSON. The PNG includes a dataset receipt and projection disclaimer;
export JSON alongside it for complete restoration. JSON contains a schema version, dataset ID,
SHA-256 content hash, method, seed, enabled dimensions, selected axes, filters, relationship layer,
palette, face / local-view / collision toggles, influence, component, pinned IDs, selection and
camera position/target. The recorded seed affects graph layout only.

The hash covers canonical JSON of the normalized dataset (ID, dimension metadata, and ordered
states, including traces and supplied fields), not the file's original whitespace or bytes.
Keys are sorted recursively; absent provenance normalizes to unverified. Array order is significant.
When no explicit ID/definitions are provided, filename and generic dimensions enter the receipt:
use the same filename, or preferably the JSON metadata envelope, to obtain the same hash later.

Load the original dataset, then Restore settings. A mismatching hash or ID is rejected, along
with invalid parameters or missing selected/pinned states. A settings export is not a dataset
export; it does not contain source results. Importing settings never overwrites the experiment.

Copy view URL puts allow-listed settings in the fragment. Dataset ID, selected state ID, pins,
commands, vectors, and traces are removed; only the dataset hash and display settings remain.
Do not treat hashes as anonymization for low-entropy datasets. For an imported dataset, load its
file first and use Restore URL view. URLs do not upload data or confer authorization.

## Validation

```sh
npm test
npm run build
```

For the browser tests, start `npm run dev`, then in another shell:

```sh
npm run test:browser
```

By default Playwright uses its installed Chromium; set CHROME_PATH to a native Chrome executable
to reuse that instead. Install test Chromium with `npx playwright install chromium` if necessary.
On NUC01 the tests were run against installed Chrome via CHROME_PATH. No browser installation
is required to use the app itself. The CI workflow builds the exact output and fails on drift.

Core tests cover complete fixture retention, edge/face counts, strict imports, known unsafe state,
component connectivity, PCA degeneracy/variance, deterministic force layout, input immutability,
transition traversal, and receipt validation. Browser tests cover A–J and a narrow-screen layout,
with PNG captures under ignored `test-results/`. They are smoke/interaction checks, not proof of
authorization correctness. WebGL2 is required. Import limits bound storage but layout computation
still runs on the main thread; the 256-state fixture is the intended interactive workload. Large
or dense datasets may pause during layout; Web Workers / instancing are future work.

The Three.js rendering and pure data/math modules are separate to make later scaling changes
possible without changing interpretation. There are no claims about the source paper beyond
the user-supplied visualization brief.
