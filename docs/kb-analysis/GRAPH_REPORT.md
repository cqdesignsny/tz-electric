# Graph Report - docs  (2026-05-28)

## Corpus Check
- Corpus is ~10,304 words - fits in a single context window. You may not need a graph.

## Summary
- 127 nodes · 160 edges · 10 communities detected
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 8 edges (avg confidence: 0.79)
- Token cost: 0 input · 0 output


## Input Scope
- Requested: auto
- Resolved: committed (source: cli)
- Included files: 2 · Candidates: 2
- Excluded: 0 untracked · 0 ignored · 0 sensitive · 0 missing committed
- Recommendation: Use --scope all or graphify.yaml inputs.corpus for a knowledge-base folder.
## God Nodes (most connected - your core abstractions)
1. `1. Pricing & Fees` - 18 edges
2. `TZ Electric AI Agent Training Answers` - 12 edges
3. `3. Emergency Triage & On-Call` - 12 edges
4. `HVAC Maintenance Price Book Office SOP` - 9 edges
5. `Canonical Lead Intake Question Set` - 9 edges
6. `Primary Weekly On-Call Rotation (electrical)` - 8 edges
7. `7. Scheduling & Handoffs` - 7 edges
8. `Field Assessment fee ($169/$239/$329)` - 7 edges
9. `HVAC Maintenance modular per-component pricing` - 7 edges
10. `Lead routing flow (Neon > HCP customer/estimate + Inbox card + Switchboard mirror)` - 7 edges

## Surprising Connections (you probably didn't know these)
- `HVAC Maintenance modular per-component pricing` --shares_data_with--> `HVAC Maintenance Price Book Office SOP`  [INFERRED]
  docs/agent-training-answers.md → docs/hvac-maintenance-office-sop.md
- `Rationale: modular maintenance pricing hits $230/hr target` --rationale_for--> `HVAC Maintenance modular per-component pricing`  [EXTRACTED]
  docs/hvac-maintenance-office-sop.md → docs/agent-training-answers.md
- `SOP 4. One-time vs 3-year contract` --shares_data_with--> `3-Year Maintenance Contract (7.5% off)`  [EXTRACTED]
  docs/hvac-maintenance-office-sop.md → docs/agent-training-answers.md
- `SOP 5. Deep clean add-ons handled on-site` --shares_data_with--> `Deep Clean Add-Ons (on-site only)`  [EXTRACTED]
  docs/hvac-maintenance-office-sop.md → docs/agent-training-answers.md
- `SOP 3. Building the quote in HCP` --references--> `HCP Estimate record`  [EXTRACTED]
  docs/hvac-maintenance-office-sop.md → docs/agent-training-answers.md

## Hyperedges (group relationships)
- **After-hours emergency dispatch cascade** — policy_after_hours_dispatch_fee, policy_true_emergency_criteria, policy_no_heat_threshold_32f, policy_after_hours_sop, policy_standard_after_hours_window, policy_overnight_window, policy_on_call_rotation, policy_coverage_calendar_2025_2026, entity_ty_stein, entity_tyler_zitz, policy_privacy_tech_phone [EXTRACTED 0.95]
- **HVAC maintenance quote-build flow** — service_hvac_maintenance, policy_hvac_maintenance_modular, policy_3_year_contract, policy_deep_clean_addon, sop_section_1_structure, sop_section_3_build_quote, sop_section_4_pricing_tiers, sop_section_5_deep_clean, entity_hcp_estimate [EXTRACTED 0.95]
- **Lead intake to HCP triple-record routing** — policy_canonical_lead_intake, policy_hcp_lead_routing_flow, tool_create_lead_with_estimate, entity_leads_submit_route, entity_neon_tz_leads, entity_hcp_estimate, entity_hcp_job_inbox, entity_switchboard_lead_pipeline, policy_customer_notes_reserved, policy_tz_ai_agent_tag, policy_two_way_status_sync [EXTRACTED 0.95]
- **Estimate vs Field Assessment vs Diagnostic decision tree** — policy_estimates_free_default, policy_field_assessment_fee, policy_diagnostic_service, policy_priority_dispatch_fee, policy_after_hours_dispatch_fee, tool_flag_for_office_review, rationale_estimates_default_free [EXTRACTED 0.90]
- **Claire voice/SMS/chat communication framing** — entity_claire_persona, policy_voice_persona_claire, policy_smart_assistant_naming, policy_voice_speak_naturally, policy_max_call_length_15, policy_web_chat_widget, policy_human_handoff_triggers [EXTRACTED 0.90]

## Communities

### Community 0 - "Pricing & Fees"
Cohesion: 0.15
Nodes (20): After-Hours Emergency Dispatch Fee $475, Customer-supplied equipment installation policy, Diagnostic Service ($244+), Estimates Policy (free default), EV Charger Install $900-$4,000+, Field Assessment fee ($169/$239/$329), Generator Transfer Switch (Manual/ATS), GFCI/Smoke Detector Replacement $150-$400 (+12 more)

### Community 1 - "Lead Routing & Customer Privacy"
Cohesion: 0.15
Nodes (16): TZ Electric AI Agent Training Answers, /careers page, customer.notes reserved for identity/accommodation info, Hiring/Career inquiries redirect to /careers, Decline home warranty companies, pivot to financing, Existing Customer Privacy & Data Access Rules, Renter requires landlord approval, HCP Two-way Won/Lost status sync (+8 more)

### Community 2 - "HVAC Maintenance Pricing"
Cohesion: 0.15
Nodes (16): HVAC Maintenance Price Book Office SOP, /hvac-maintenance landing page, 3-Year Maintenance Contract (7.5% off), Deep Clean Add-Ons (on-site only), HVAC Maintenance modular per-component pricing, Rationale: cassette quote-misclassification costs money (50% longer), Rationale: deep clean upcharges protect labor rate, Rationale: modular maintenance pricing hits $230/hr target (+8 more)

### Community 3 - "On-Call Roster & Coverage"
Cohesion: 0.14
Nodes (16): Christopher Weiner (HVAC emergency), Devin Green (electrical on-call), Jimmy Neville (electrical on-call), Nick Neville (electrical on-call), Patrick Spencer (electrical on-call), Sam Tigges (electrical on-call), Timothy Wing (electrical on-call), Ty Stein (On-Call Supervisor) (+8 more)

### Community 4 - "Office Operations & Scheduling"
Cohesion: 0.13
Nodes (15): April (office handoff), Molly (office handoff), Terry (office handoff), After-Hours Emergency Dispatch SOP (2026-05-18), Arrival Windows (30 min target), Blackout Dates (emergencies only), Business Hours Mon-Fri 7:30 AM - 4:00 PM, Estimate Booking Hours (Mon-Fri 9AM-3PM) (+7 more)

### Community 5 - "Lead Capture Pipeline"
Cohesion: 0.17
Nodes (12): HCP Estimate record, HCP Job Inbox (API Leads card), src/app/api/leads/submit/route.ts, Neon tz_leads table, /signature-plans page, TZ Switchboard /switchboard/lead-pipeline, Generac Startup & Activation $290 flat, Lead routing flow (Neon > HCP customer/estimate + Inbox card + Switchboard mirror) (+4 more)

### Community 6 - "Open Questions & Channels"
Cohesion: 0.2
Nodes (10): Max Call Length 15 min before forced handoff, Open Q: Drain cleaning rate, Open Q: Review platform scope, Review Request Workflow (48hr post-job, 5-9 PM), Always identify as smart assistant, never AI, Web Chat Widget (proactive 15s popup), Rationale: smart-assistant naming over AI for tone, 10.5 Open Questions for Tyler (+2 more)

### Community 7 - "Lead Form Services"
Cohesion: 0.25
Nodes (8): src/components/forms/lead-form-config.ts, /quote intake form, Canonical Lead Intake Question Set, Whole-Home Surge Protection $450-$1,200+, Service: Electrical / Panel Upgrade, Service: EV Charger, Service: Plumbing, Service: Whole-Home Surge Protection

### Community 8 - "Warranty, Brands & Payment"
Cohesion: 0.29
Nodes (7): Deposit Schedule by project type, 1-Year Labor Warranty, Mitsubishi Mini-Split 12+12 Year Warranty, Payment Methods (cards, ACH, Wisetack, Synchrony), Signature Plan: no extended warranty, Rationale: Mitsubishi standardization for reliability/cold-climate, 2. Warranty, Brands & Payment

### Community 9 - "Claire Persona & Voice Rules"
Cohesion: 0.29
Nodes (7): Claire (smart assistant persona), Commercial inquiries: immediate transfer, When to Hand Off to a Human, Mini-Split Install $5,500-$25,000+, Claire Voice Persona (female, warm, smart assistant), Voice rule: speak numbers naturally, Service: Mini-Split / HVAC

## Knowledge Gaps
- **58 isolated node(s):** `9. Site Inconsistencies to Resolve`, `Trip Charge $75 outside standard zones`, `Outlet/Switch Install $180-$380`, `GFCI/Smoke Detector Replacement $150-$400`, `1-Year Labor Warranty` (+53 more)
  These have ≤1 connection - possible missing edges or undocumented components.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `TZ Electric AI Agent Training Answers` connect `Lead Routing & Customer Privacy` to `Pricing & Fees`, `Warranty, Brands & Payment`, `On-Call Roster & Coverage`, `Office Operations & Scheduling`, `Open Questions & Channels`?**
  _High betweenness centrality (0.672) - this node is a cross-community bridge._
- **Why does `1. Pricing & Fees` connect `Pricing & Fees` to `Lead Routing & Customer Privacy`, `Claire Persona & Voice Rules`, `Lead Capture Pipeline`, `Lead Form Services`, `HVAC Maintenance Pricing`?**
  _High betweenness centrality (0.464) - this node is a cross-community bridge._
- **Why does `3. Emergency Triage & On-Call` connect `On-Call Roster & Coverage` to `Lead Routing & Customer Privacy`, `Office Operations & Scheduling`?**
  _High betweenness centrality (0.265) - this node is a cross-community bridge._
- **What connects `9. Site Inconsistencies to Resolve`, `Trip Charge $75 outside standard zones`, `Outlet/Switch Install $180-$380` to the rest of the system?**
  _58 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `On-Call Roster & Coverage` be split into smaller, more focused modules?**
  _Cohesion score 0.14 - nodes in this community are weakly interconnected._
- **Should `Office Operations & Scheduling` be split into smaller, more focused modules?**
  _Cohesion score 0.13 - nodes in this community are weakly interconnected._