# Computational State-Space Explorer

Build the supplied design as a separate browser-only instrument for hartsock.github.io. No authorization code or experimental output is changed. The paper and measured data are not available in this checkout; synthetic examples are teaching fixtures, not reconstructions of the paper.

Use vanilla TypeScript, Three.js, ml-matrix PCA, d3-force-3d seeded layout, and Papa Parse CSV. Plotly would simplify plotting but complicate per-state shapes and local-view overlays; 3d-force-graph couples rendering and layout more tightly than this instrument needs. No backend, remote telemetry, trace execution, or CDN dependencies.

Source: `_tools/state-space-explorer`; deployable static output: `labs/state-space-explorer`. Jekyll ignores the underscored source directory. Keep the existing site's publishing workflow intact. Stop for human review before publication.

- [x] Test: all 256 states, 1024 Boolean-cube edges, disagreement components, candidate square faces, and known synthetic unsafe state.
- [x] Test: projection collision retention, PCA explained variance and degeneracy, reproducible force layout, graph traversal.
- [x] Test: strict JSONL/CSV validation, unknown values, dataset provenance, configuration validation, dataset hash mismatch.
- [x] Build responsive 3D instrument, inspector, pin/compare, dimension controls, filters, local views, honest relationship layers, animations.
- [x] Export PNG with receipt, config JSON and settings-only URL; import config only against matching dataset hash.
- [x] Test and build; browser QA for projections, selection, local views, filters, configuration restoration; document limits.

Validation: 12 core tests, seven headless-Chrome browser checks against static output, and one source/artifact receipt check. Existing site source prose guard: no new findings. Full Jekyll/site tests require Ruby, absent locally; CI is authoritative for those checks. Synthetic/metadata fixtures are generated, never experiment output. The initial implementation cycle wrote tests first but did not obtain a meaningful initial red run before implementing core (the test runner was still installing); later unknown-outcome/capped-face regression was observed red then green. Do not describe the entire workstream as strict TDD.

Semantics: Hamming edges are mathematical adjacency, not evidence of executable transitions. Only explicit `transitions` entries may be traversed as computational transitions. Candidate cubical faces are complete four-vertex Boolean squares; their display does not establish continuity or homology. Local-view membership must be supplied; absence means unknown, never neither. PCA uses centered, unscaled selected coordinates; tied eigenvalues make basis orientation nonunique. Collision offsets belong only to rendering.
