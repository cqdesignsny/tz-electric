# Knowledge base structure analysis

Snapshot of `docs/agent-training-answers.md` + `docs/hvac-maintenance-office-sop.md`
run through the [graphify](https://github.com/cqdesignsny/graphify) tool
on 2026-05-28. Verifies the structure of Claire's KB and validates whether
graph-RAG / vector-RAG would help at the current scale.

## Files

- **`GRAPH_REPORT.md`** — plain-language audit: god nodes, surprising
  connections, hyperedges, community labels, suggested questions.
- **`kb-graph.html`** — interactive force-directed graph. Open in any
  browser, no server. Nodes colored by community.
- **`kb-graph.json`** — raw graph data (127 nodes, 160 edges, 10
  communities). Reusable by any GraphRAG / Neo4j / Cypher tooling later
  if we want to layer retrieval on top.

## Headline finding

> Corpus is ~10,304 words — fits in a single context window. You may not need a graph.

That's graphify's own verdict. At this corpus size, Anthropic prompt
caching is doing what vector RAG would do for cost, without the
"silent retrieval failure" mode. Re-run this analysis if the KB grows
past ~30K words or the cohesion scores rise (more cross-references
between sections).

## Communities found

1. **Pricing & Fees** (20 nodes) — biggest cluster. Estimates Policy,
   Field Assessment fee, EV/Generator/Plumbing rates.
2. **Lead Routing & Customer Privacy** (16) — HCP integration, customer
   notes rules, hiring redirect, renter approval.
3. **HVAC Maintenance Pricing** (16) — modular per-component pricing
   from Tyler's 2026-05-07 doc.
4. **On-Call Roster & Coverage** (16) — Jimmy / Sam / Ty / Christopher /
   Tyler P. + weekly rotation calendar.
5. **Office Operations & Scheduling** (15) — business hours, dispatch
   SOP, office handoff to Molly / Terry / April.
6. **Lead Capture Pipeline** (12) — HCP estimate + Inbox card + lead
   submit route + Generac startup pricing.
7. **Open Questions & Channels** (10) — drain rate / review platform
   open questions + voice/SMS/chat preferences.
8. **Lead Form Services** (8) — canonical intake question set, surge
   protection, EV, plumbing routing.
9. **Warranty, Brands & Payment** (7) — Mitsubishi standardization,
   payment methods, labor warranty terms.
10. **Claire Persona & Voice Rules** (7) — smart-assistant naming,
    natural number reading, commercial transfer.

## Hyperedges (multi-node flows worth tracking)

The graph identified five named flows that cross multiple sections.
Each one is a single conceptual unit even though it lives spread across
the KB:

- **After-hours emergency dispatch cascade** — fee + emergency criteria
  + no-heat-below-32F + SOP + standard / overnight windows + on-call
  rotation + coverage calendar + Ty/Tyler escalation + tech-phone
  privacy rule.
- **HVAC maintenance quote-build flow** — service + modular pricing +
  3-year contract + deep-clean add-ons + SOP sections 1, 3, 4, 5 + HCP
  estimate.
- **Lead intake to HCP triple-record routing** — canonical intake +
  routing flow + create-lead-with-estimate tool + leads submit route +
  Neon table + HCP estimate + Inbox card + Switchboard mirror +
  customer-notes-reserved rule + TZ AI AGENT tag + two-way status sync.
- **Estimate vs Field Assessment vs Diagnostic decision tree** — free
  default + Field Assessment fee + Diagnostic Service + priority
  dispatch fee + after-hours fee + flag tool + free-default rationale.
- **Claire voice/SMS/chat communication framing** — persona + voice
  persona + smart-assistant naming + natural number speech + 15-min
  call cap + web chat widget + human handoff triggers.

These are the things to verify whenever a related KB edit lands —
changing one node usually means the related ones need a re-read to
stay coherent.

## Decision: no runtime graph/vector RAG yet

Based on this analysis, we are NOT layering vector embeddings or
graph-based retrieval on Claire's prompt path at this time. Reasons:

- 10K words fits in cached prompt — no retrieval needed.
- Anthropic ephemeral cache already drops repeat input cost ~90%.
- Cohesion scores are low (0.13-0.29 per community), meaning the KB is
  a list of mostly-independent rules. Graph traversal wouldn't surface
  meaningfully better context than just including everything.
- Adding retrieval introduces "missing context" silent failure modes
  that are harder to debug than the current "everything is in the
  prompt" baseline.

Revisit if:
- Total KB grows past ~30K words (more than 3x current size).
- We add 5+ concurrent admin users hammering the chat surface.
- A second non-trivial doc set lands (e.g. an internal SOPs subdir).

## Regenerating

```bash
# from tz-site root
graphify detect docs --scope auto --out .graphify/.graphify_detect.json
# ...follow the /graphify skill steps for prep, extract, build, label
# Then copy the outputs back here:
cp .graphify/GRAPH_REPORT.md docs/kb-analysis/GRAPH_REPORT.md
cp .graphify/graph.html      docs/kb-analysis/kb-graph.html
cp .graphify/graph.json      docs/kb-analysis/kb-graph.json
```

`.graphify/` is gitignored — keeps runtime state out of commits while
preserving the analysis snapshots here in `docs/kb-analysis/`.
