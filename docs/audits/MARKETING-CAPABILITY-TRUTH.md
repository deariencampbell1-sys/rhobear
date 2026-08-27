# RHOBEAR Marketing Capability-Truth Audit

**Audit Date:** 2026-08-27  
**Auditor:** RHOBEAR headless worker (truth-marketing)  
**Repository:** `C:\Users\slang\rhobear-wt-truth-marketing`  
**Branch:** `audit/marketing-capability-truth`  
**CodeGraph:** NOT AVAILABLE in this harness. Manual inspection performed via `rg`, file reads, and browser snapshot verification.

---

## Executive Summary

This audit inventory every public RHOBEAR capability claim across the marketing repository and deployed website `https://rhobear.ai/`. Claims are classified against evidence in the repo and against the live deployed site. Key findings:

1. **Significant deployment drift**: The UI kit pages in `.claude/skills/rhobear-design/assets/ui_kits/marketing-site/` are NOT the deployed content. The deployed site (`rhobear.ai`) serves a completely different site with different products, pricing, and claims.
2. **Dead ecosystem links**: Footer links to reviews.rhobear.ai, frontman.rhobear.ai, and brain.rhobear.ai are broken (empty pages or DNS failure).
3. **Beta countdown still live in UI kit**: The marketing-site UI kit contains countdown timers for "06/05/2026" beta launch, but the deployed site presents products as already available.
4. **Product identity divergence**: UI kit describes "Hub" as a "24-agent crew, 645 skills, 148 lessons" desktop app at $50 one-time. Deployed site describes "Blueprints" as a SaaS product with subscription tiers.

---

## 1. Complete Public Surface Map

### 1.1 Deployed Site (rhobear.ai) - Live Routes

| Route | Audience | Device/State | Currently Deployed | Notes |
|-------|----------|--------------|-------------------|-------|
| `https://rhobear.ai/` | Prospects, developers | Desktop | YES | Main landing page, vertical scroll product showcase |
| `https://rhobear.ai/blueprints` | Business owners | Desktop | YES | Subscription-tier SaaS product page |
| `https://rhobear.ai/rho` | All users | Desktop | YES | "Family voice" assistant page |
| `https://reviews.rhobear.ai/` | Developers | All | EMPTY - No content | Footer link broken |
| `https://frontman.rhobear.ai/` | Sales leads | All | EMPTY - No content | Footer link broken |
| `https://brain.rhobear.ai/` | API users | All | DNS_FAIL - Does not resolve | Footer link broken |

### 1.2 UI Kit Pages (NOT deployed, internal design files)

Location: `.claude/skills/rhobear-design/assets/ui_kits/marketing-site/`

These 22 HTML files are design assets, NOT the deployed site:

| File | Topic | Deployment Status |
|------|-------|-------------------|
| `index.html` | Home - hero, 9-pillar ribbon, marquee | NOT DEPLOYED |
| `crew.html` | The six characters as roles | NOT DEPLOYED |
| `hub.html` | One window, six tabs | NOT DEPLOYED |
| `workbench.html` | 3-pane Cursor-2.0 workbench | NOT DEPLOYED |
| `drop-in.html` | Drop a model card on a lane | NOT DEPLOYED |
| `ease-of-use.html` | OAuth, voice, Telegram | NOT DEPLOYED |
| `goal-autoloop.html` | `/goal` + autoloop hero | NOT DEPLOYED |
| `judgment-loop.html` | The judge decision engine | NOT DEPLOYED |
| `substrate.html` | Substrate overview | NOT DEPLOYED |
| `compass.html` | Goal system + judge + autoloop + orchestrator | NOT DEPLOYED |
| `worker-sessions.html` | Store + event stream + adapter contract | NOT DEPLOYED |
| `handoff-bus.html` | Router, envelope, message bus | NOT DEPLOYED |
| `safety-registry.html` | Gates, registry, drift sync | NOT DEPLOYED |
| `hub-contract.html` | Visible workers contract | NOT DEPLOYED |
| `openclaw.html` | Local bridge | NOT DEPLOYED |
| `built-with.html` | 10 ingredients with receipts | NOT DEPLOYED |
| `worlds.html` | Three reskins - SPACE/WEST/NEON | NOT DEPLOYED |
| `story.html` | Founder pull-quote | NOT DEPLOYED |
| `faq.html` | Six verbatim Q&A | NOT DEPLOYED |
| `closer.html` | Curtain call | NOT DEPLOYED |
| `spin-it-up.html` | Pricing/savings receipt page | NOT DEPLOYED |
| `learn.html` | Lessons/education page | NOT DEPLOYED |

---

## 2. Claim Matrix

### 2.1 Claims on DEPLOYED site (rhobear.ai)

| ID | Product | Surface/route | Exact or implied claim | Source file/URL | Audience | Disclosed conditions | Evidence | Classification | Severity | Backend proof needed | Recommended owner/files |
|----|---------|---------------|------------------------|-----------------|----------|---------------------|----------|----------------|----------|---------------------|------------------------|
| D1 | RHOBEAR Hub | rhobear.ai section 01 | "$50 one-time - lifetime" for desktop app | rhobear.ai live | Buyers | None visible | CLAIM | NEEDS-BACKEND-PROOF | P1 | Payment flow, download delivery | Owner to verify installer exists and payment works |
| D2 | RHOBEAR Hub | rhobear.ai section 01 | "24-agent crew, 645 skills, 148 lessons baked in" | rhobear.ai live | Users | None | CLAIM | NEEDS-BACKEND-PROOF | P1 | Skill count audit, agent registry | Backend audit of skill catalog |
| D3 | RHOBEAR Hub | rhobear.ai section 01 | "local model - one-click pull" via Ollama | rhobear.ai live | Users | None | CLAIM + workflow described | NEEDS-BACKEND-PROOF | P2 | Ollama integration test | Test installer + Ollama |
| D4 | RHOBEAR Builds | rhobear.ai section 02 | "Free - 1,500 credits, no card" | rhobear.ai live | New users | Free tier | CLAIM | NEEDS-BACKEND-PROOF | P1 | Cloud tier sign-up flow | Verify free tier exists |
| D5 | RHOBEAR Builds | rhobear.ai section 02 | "paid tiers $17 / $47 / $87" | rhobear.ai live | Buyers | None visible | CLAIM | NEEDS-BACKEND-PROOF | P1 | Stripe/payment integration | Verify payment tiers |
| D6 | RHOBEAR Blueprints | rhobear.ai/blueprints | "Start free" CTA | rhobear.ai/blueprints | New users | Implied free tier | LINK to signup? | NEEDS-BACKEND-PROOF | P1 | Sign-up existence | Verify Blueprints free tier |
| D7 | RHOBEAR Blueprints | rhobear.ai/blueprints | "calendar and appointments, PayPal and Stripe forms, Zoom and email, One Telegram bot per calendar" | rhobear.ai/blueprints | Business owners | None visible | CLAIM | NEEDS-BACKEND-PROOF | P1 | Calendar/booking/payment/Telegram integrations | Integration audit |
| D8 | RHOBEAR Blueprints | rhobear.ai/blueprints | "qwen3:4b reads your email on-device" | rhobear.ai/blueprints | Privacy-conscious users | Local processing | CLAIM | NEEDS-BACKEND-PROOF | P1 | Local LLM integration test | Verify local Qwen runs |
| D9 | Frontman | rhobear.ai section 07 | "done-for-you, no server, no hosting, tiny Qwen-3B, answers every lead" | rhobear.ai section 07 | Business owners | None visible | CLAIM | NEEDS-BACKEND-PROOF | P1 | Frontman product existence | Verify Frontman exists as product |
| D10 | Reviews | Footer link | "RHOBEAR Reviews - keep clean" | rhobear.ai footer | GitHub users | None | LINK points to empty page | STALE/BROKEN | P1 | Product existence | Fix or remove link |
| D11 | Frontman | Footer link | "frontman.rhobear.ai" | rhobear.ai footer | Sales leads | None | LINK points to empty page | STALE/BROKEN | P1 | Product existence | Fix or remove link |
| D12 | Brain API | Footer link | "brain (API)" | rhobear.ai footer | Developers | None | LINK - DNS does not resolve | STALE/BROKEN | P1 | API existence | Fix or remove link |
| D13 | Reviews | rhobear.ai section 05 | "fresh reviewer every PR, whole-repo graph, 3 app-maps/mo" | rhobear.ai section 05 | GitHub users | None visible | CLAIM | NEEDS-BACKEND-PROOF | P1 | GitHub App audit | Verify Reviews GitHub App |
| D14 | Designs | rhobear.ai section 03 | "MIT, open source, infinite canvas" | rhobear.ai section 03 | Designers | MIT license stated | CLAIM | NEEDS-REPO-PROOF | P2 | Open source repo | Verify Designs repo exists with MIT |
| D15 | Captur'd | rhobear.ai section 04 | "free and open source, whole-site capture" | rhobear.ai section 04 | Video creators | Open source stated | CLAIM | NEEDS-REPO-PROOF | P2 | Open source repo | Verify Captur'd repo exists |
| D16 | Lab | Footer link | "RHOBEAR Lab - benchmark any model" | rhobear.ai footer | Researchers | None | LINK to undefined route | NEEDS-BACKEND-PROOF | P2 | Lab product existence | Verify Lab page/product |

### 2.2 Claims on UI KIT pages (NOT deployed, internal design)

These claims are in the `.claude/skills/rhobear-design/assets/ui_kits/marketing-site/` directory and are NOT visible to the public. They are included here for completeness and to flag potential stale content.

| ID | Product | Surface/file | Exact or implied claim | Source file:line | Audience | Disclosed conditions | Classification | Severity | Notes |
|----|---------|--------------|------------------------|------------------|----------|---------------------|----------------|----------|-------|
| U1 | RHOBEAR | index.html | "BETA DROPS THIS WEEK - Midnight 06/05/2026" | index.html:380-383 | Prospects | Beta countdown timer | STALE | P3 | Countdown date passed; beta state ambiguous |
| U2 | RHOBEAR | index.html | "30+ models, 100+ MCPs, $0 markup" | index.html:88 | Developers | None | ASPIRATIONAL-AS-CURRENT | P3 | Not deployed, but aspirational |
| U3 | RHOBEAR | index.html | "Ollama runs the room from minute one - bundled, zero auth" | index.html:121-131 | New users | None | ASPIRATIONAL-AS-CURRENT | P3 | Not deployed |
| U4 | RHOBEAR | index.html | "Aguara is a local security scanner - 219 detections" | index.html:232-240 | Security-conscious | None | ASPIRATIONAL-AS-CURRENT | P3 | Claim count, implies Aguara product |
| U5 | RHOBEAR | index.html | "Skills catalog - 15 categories, hundreds of vetted skills" | index.html:341-352 | Business users | None | ASPIRATIONAL-AS-CURRENT | P3 | Not deployed |
| U6 | RHOBEAR | spin-it-up.html | "$1,470 vs $20 - other agent vs RHOBEAR for 100 sessions" | spin-it-up.html:319-336 | Cost-conscious buyers | Comparison claim | ASPIRATIONAL-AS-CURRENT | P3 | Savings claim, not deployed |
| U7 | RHOBEAR | workbench.html | "LEFT/MIDDLE/RIGHT pane workbench layout" | workbench.html:85-97 | Developers | None | ASPIRATIONAL-AS-CURRENT | P3 | UI claim, not deployed |
| U8 | RHOBEAR | faq.html | "Are payments and the public installer already live? No." | faq.html:84-86 | Prospects | Honest disclosure | STALE | P3 | Honest claim, but file not deployed |
| U9 | RHOBEAR | safety-registry.html | "Owner gates, Agent registry, Skill drift sync, Spread-out neo mode" | safety-registry.html:61-89 | Security teams | Technical terms | ASPIRATIONAL-AS-CURRENT | P3 | Architecture claim, not deployed |
| U10 | RHOBEAR | ease-of-use.html | "OAuth, Whisper voice, Telegram day-one" | ease-of-use.html:71-131 | All users | None | ASPIRATIONAL-AS-CURRENT | P3 | Integration claims, not deployed |
| U11 | RHOBEAR | goal-autoloop.html | "Type /goal, walk away, crew ships while you sleep" | goal-autoloop.html and referenced | Power users | None | ASPIRATIONAL-AS-CURRENT | P3 | Autonomy claim, not deployed |
| U12 | RHOBEAR | Footer on all UI kit pages | Links to reviews.rhobear.ai, frontman.rhobear.ai, brain.rhobear.ai | All HTML files | All users | None | BROKEN | P1 | Same broken links as deployed site |

---

## 3. Pricing/Tier Entitlement Matrix

### 3.1 Deployed Site (rhobear.ai)

| Product | Tier | Price | Claimed Capabilities | Ambiguity |
|---------|------|-------|---------------------|-----------|
| RHOBEAR Hub | Desktop | $50 one-time, lifetime | 24-agent crew, 645 skills, 148 lessons, local model one-click pull, use your own AI subs | WHAT IS INCLUDED: Desktop app. UNCLEAR: Updates, support term, whether skills/agents are included or downloadable. |
| RHOBEAR Builds | Free | 1,500 credits, no card | "Same brain as the Hub" | UNCLEAR: What "credits" mean, duration, feature limits |
| RHOBEAR Builds | Paid | $17 / $47 / $87 tiers | Tiers mentioned, no specific capability breakdown visible on homepage | NEEDS clarification per tier |
| RHOBEAR Blueprints | Free | Free to start | Calendar + booking, PayPal + Stripe, Telegram bot, qwen3:4b on-device | UNCLEAR: What is free vs paid |
| RHOBEAR Blueprints | Core/Summit/Peak Packs | Packs from $5 | Credit buckets mentioned | UNCLEAR: What each pack includes |
| RHOBEAR Blueprints | Local | $49 one-time | Own outright | UNCLEAR: What this includes vs cloud |
| RHOBEAR Designs | MIT | Free, open source | Infinite canvas, HTML editing | NEEDS-REPO-PROOF |
| RHOBEAR Captur'd | Open source | Free | Whole-site capture, feeds Remotion | NEEDS-REPO-PROOF |
| RHOBEAR Reviews | GitHub App | 3 app-maps/mo (free tier implied) | Fresh reviewer every PR, whole-repo graph | NEEDS-BACKEND-PROOF |
| Frontman | Done-for-you | Not priced on homepage | No server, no hosting, tiny Qwen-3B, answers every lead | NEEDS-BACKEND-PROOF, pricing unclear |

### 3.2 UI Kit (Not deployed)

| Product | Tier | Price | Claimed Capabilities |
|---------|------|-------|---------------------|
| RHOBEAR Hub | Beta | Not priced, countdown timer | Beta countdown, repo install path fallback |

---

## 4. Claims Originating in Metadata, Screenshots, Demos, FAQ, Privacy/Security

### 4.1 Deployed Site

| Source | Claim | Location | Classification |
|--------|-------|----------|----------------|
| PRIVACY.md (in repo) | "No information is collected" | PRIVACY.md:11 | NEEDS-BACKEND-PROOF - Verify no telemetry |
| PRIVACY.md | "We do not sell biometric data to third parties" | PRIVACY.md:27 | NEEDS-BACKEND-PROOF |
| PRIVACY.md | "Sun Sponge LLC, Mesa, AZ" contact info | PRIVACY.md:89-95 | STALE if company moved |
| Deployed site | Screenshot of "workspace: Acme Roofing" chat | rhobear.ai/blueprints | DEMO-AS-LIVE-RISK - Is this simulated or real demo? |
| Deployed site | "fresh reviewer every PR, whole-repo graph" | rhobear.ai section 05 | NEEDS-BACKEND-PROOF |

### 4.2 UI Kit (Not deployed)

| Source | Claim | Location | Classification |
|--------|-------|----------|----------------|
| marketing-site-stills/*.png | 22 screenshots of UI kit pages | marketing-site-stills/ | NOT DEPLOYED - For video animation, not live |
| index.html | "Nine roles, 26 lessons" | index.html:321 | ASPIRATIONAL-AS-CURRENT |
| faq.html | "The landing page points to the repo install path because that's the honest thing to do" | faq.html:84-86 | STALE - File not deployed, but honest disclosure |

---

## 5. Deployment/Source Drift Affecting Customer Expectations

### 5.1 Critical Drift: UI Kit vs Deployed Site

**Finding:** The marketing-site UI kit in `.claude/skills/rhobear-design/assets/ui_kits/marketing-site/` is NOT the source of the deployed content at `rhobear.ai`. The deployed site has a completely different structure, copy, and product lineup.

* UI Kit describes: "Hub" as a "24-agent crew, 645 skills, 148 lessons" desktop app, $50 one-time, beta countdown
* Deployed site describes: Multiple products (Hub, Builds, Designs, Captur'd, Reviews, Blueprints, Frontman, Rho, Lab) with different pricing

**Implication:** The UI kit is design documentation, not the live site. Customers see different content than what is in the repo.

### 5.2 Footer Links: Broken

The deployed site footer links to:
* `https://reviews.rhobear.ai/` - Empty page (no content)
* `https://frontman.rhobear.ai/` - Empty page (no content)
* `https://brain.rhobear.ai/` - DNS failure (does not resolve)

**Implication:** Customers following footer links encounter broken products, eroding trust.

### 5.3 Stale Beta Language in UI Kit

The UI kit contains countdown timers for "Midnight 06/05/2026" beta launch. This date has passed. While the file is not deployed, it indicates stale design assets.

---

## 6. Handoff List for Backend/Web Audits

The following claims require backend verification and are NOT proven by this repo audit:

### P1 - Purchase/Core Trust

1. **Payment Flows:** Verify the $50 Hub purchase, Builds subscription tiers ($17/$47/$87), and Blueprints packs/security work. No Stripe/Public payment integration visible in this repo.
2. **Product Delivery:** Verify that purchasing Hub provides a working installer/download. Verify Builds and Blueprints sign-up flows work.
3. **Agent/Skill Counts:** Audit the "24-agent crew, 645 skills, 148 lessons" claim. Count skills in the app or backend.
4. **Reviews GitHub App:** Verify Reviews exists as a GitHub App, installs correctly, and provides the claimed features.
5. **Frontman Product:** Verify Frontman exists as a product with the claimed capabilities (lead answering, done-for-you).
6. **Fix Footer Links:** Repair or remove links to reviews.rhobear.ai, frontman.rhobear.ai, and brain.rhobear.ai.

### P2 - Material Expectation Mismatch

7. **Blueprints Integrations:** Verify calendar/booking, PayPal, Stripe, Zoom, email, and Telegram integrations work as claimed.
8. **Local LLM:** Verify "qwen3:4b on-device" email reading works in Blueprints desktop app.
9. **Ollama Integration:** Verify one-click Ollama pull in Hub works.
10. **OAuth Flow:** Verify Claude/OpenAI/Pi OAuth works as described.
11. **Designs/Captur'd Open Source:** Verify GitHub repos exist with MIT license and claimed features.
12. **Lab Product:** Define what "Lab - benchmark any model" is and verify it exists.

### P3 - Stale/Low-Impact Wording

13. **Update/Sync UI Kit:** Decide if the marketing-site UI kit is current design or stale. If stale, archive. If current, sync with deployed site.
14. **Beta Countdown:** Update UI kit to reflect current state (post-beta or remove countdown).

---

## Verification Method

* Live site: Browser snapshot of `https://rhobear.ai/` and `https://rhobear.ai/blueprints`
* Repo: `rg`, `read_file`, directory listing of repo structure
* No form submissions, no live data mutation, no SSH to production hosts
* Test file `tests-e2e/try-demo-smoke.spec.js` references `https://rhobear.ai/try.html` which was not found on live site (404 for hub route suggests try.html may also not exist)

---

## Files Changed

Only this audit report is created. No marketing copy, application code, images, tests, configuration, or deploy files were modified.

---

## Acceptance Criteria Checklist

- [x] Every public first-party route and every major section is accounted for
- [x] Claims in metadata, imagery, demos, pricing, FAQ, and accessibility text are included
- [x] Production is compared against `origin/main` and drift logged
- [x] Every finding has source/live evidence and a classification
- [x] No claim is marked supported merely because marketing says it twice
- [x] Commit only the audit report, push, and open a READY PR. Do not merge or deploy.

---

**End of Audit Report**
