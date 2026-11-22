# AGENTS.md — Career Knowledge Base & Portfolio Operating Manual

This repository (`nkusharoraa.github.io`) serves two purposes:
1. **Public Portfolio Site**: Static GitHub Pages website rendered from `data.json`.
2. **Professional Mind Map & Form-Filling Assistant**: A structured, reproducible single source of truth (SSOT) pairing **public** career data (`data.json`) with a **strictly gitignored private vault** (`private/`) for filling job applications, interview prep, and keeping LinkedIn, Naukri, Mercor, and Outlier profiles synchronized.

---

## 1. Privacy Red Line (CRITICAL)

This repository is **PUBLIC**. Anything committed here is permanently visible on GitHub.

- **NEVER** commit, copy, or quote sensitive data from `private/` or `exports/` into any tracked file (`data.json`, `index.html`, `AGENTS.md`, `CLAUDE.md`, `README.md`, `templates/`, or `scripts/`).
- Sensitive fields that **MUST stay inside `private/` only**:
  - Phone number, street/home address, date of birth, government IDs
  - Current CTC, expected CTC, notice period, compensation history
  - Internal/confidential client names, non-public metrics, recruiter notes
  - 10th/12th scores (keep in `private/identity.json` for Indian application forms)
- **ALWAYS run `python3 scripts/career.py validate` before committing** — it verifies `data.json`, asset references, `.gitignore` safety, and scans tracked files for accidental PII leaks.

---

## 2. Where to Pick Data (Routing Table)

When answering a question, drafting profile copy, or filling any form (Greenhouse, Lever, Workday, Ashby, LinkedIn, Naukri, Mercor, Outlier), read sources in this exact order:

| Need | Primary Source | Notes |
| --- | --- | --- |
| Public headline, bio, skills, featured projects, awards, public links | `data.json` | Public-safe SSOT powering the website |
| Phone, location, GPA, graduation dates, CTC, notice period, work auth, preferences | `private/identity.json` | Gitignored local vault (schema in `templates/private/identity.example.json`) |
| Deep project mind map (roles ↔ projects ↔ skills ↔ metrics ↔ STAR stories ↔ tradeoffs) | `private/career-graph.json` | Best source for tailored bullets & Mercor/technical interviews |
| Essay / screening form answers ("Tell me about yourself", challenges, leadership) | `private/form-answers.md` | Pre-vetted grounded answers; adapt length to form limits |
| Platform-tailored profile copy (LinkedIn, Naukri, Mercor, Outlier) | `python3 scripts/career.py export <platform>` | Outputs ready-to-paste drafts to gitignored `exports/` |
| Fast search across all career facts | `python3 scripts/career.py search "<query>"` | Searches both `data.json` and `private/` instantly |

---

## 3. CLI Tooling (`scripts/career.py`)

Zero-dependency Python 3 CLI for search, export, validation, and bootstrap:

```bash
# Search the full mind map (public data.json + private/ vault)
python3 scripts/career.py search "RAG"
python3 scripts/career.py search "MCP Azure"
python3 scripts/career.py search "McGill"

# Generate platform-specific drafts in gitignored exports/
python3 scripts/career.py export linkedin
python3 scripts/career.py export naukri
python3 scripts/career.py export mercor
python3 scripts/career.py export outlier
python3 scripts/career.py export forms
python3 scripts/career.py export all

# Validate public data, assets, category sync, and check for PII leaks
python3 scripts/career.py validate

# On a new machine: scaffold private/ from committed templates
python3 scripts/career.py init-private

# Print the reusable handoff prompt to paste into agents on other repos
python3 scripts/career.py prompt
```

---

## 3.5 Cross-Repo Handoff & Ingestion Protocol

To pull project updates from agents running on **other repositories** into this portfolio cleanly:
1. Copy the reusable handoff prompt from `prompts/repo-handoff.md` (or run `python3 scripts/career.py prompt`) and paste it into the agent working on that target repo.
2. When the user pastes the resulting **Career Handoff Packet** back into this workspace:
   - Check Section D (Verification & Redaction Audit) first: never publish redacted/confidential items to `data.json`, and ask the user to confirm or supply any `[NEEDS USER METRIC]` placeholders.
   - Merge Section B into gitignored `private/career-graph.json` (`projects[]` and `metricsBank[]`).
   - Merge sanitized Section A into `data.json` (`projectCategories[]`, optional homepage `projects[].featured[]`, and `skills.categories[]`), keeping titles and category counts 100% aligned.
   - Run `python3 scripts/career.py validate` and `python3 scripts/career.py export all`.

---

## 4. Form-Filling & Profile Rules for Agents

1. **Zero Fabrication**: Never invent metrics, dates, technologies, or ownership claims. Use ONLY numbers verified in `data.json` or `private/career-graph.json`.
2. **Exact Dates & Titles**: Pull dates and titles verbatim from `private/identity.json` / `private/career-graph.json` so ATS forms, resume PDF, LinkedIn, and background checks match 100%.
3. **Match the Audience**:
   - **LinkedIn**: Narrative + outcomes + recruiter-searchable stack (`AI Architect`, `LLM`, `RAG`, `MCP`, `MLOps`, `PyTorch`, `Azure/GCP/AWS`).
   - **Naukri**: Front-loaded 250-char headline, exhaustive granular Key Skills tags, explicit notice period / location / CTC from `private/identity.json`.
   - **Mercor**: Specialist positioning (not generalist), explicit framework strings, defensible STAR + engineering tradeoff answers for every claim (AI interview cross-examines resume claims directly).
   - **Outlier**: Emphasize Python, ML/DL evaluation, LLM fine-tuning, stochastic optimization, math/engineering rigor (IIT Delhi), and benchmarking (MCC, p-values, FMEA).
4. **Ask When Missing**: If a field in `private/identity.json` still has a `TODO` placeholder (e.g., CTC, notice period, work authorization), ask the user once and offer to save it into `private/identity.json`.

---

## 5. Keeping Everything in Sync

Whenever Ankush adds a new role, project, metric, or certification:
1. Update `private/career-graph.json` (full private detail + STAR + architecture tradeoffs).
2. Update `data.json` (sanitized public summary, skills, featured projects, and `projectCategories`).
3. Replace the downloadable CV PDF (prefer a phone-redacted copy for public `Ankush_Arora_latest_CV.pdf`, keeping the full PDF inside `private/`).
4. Run `python3 scripts/career.py validate` and `python3 scripts/career.py export all` to refresh LinkedIn/Naukri/Mercor/Outlier drafts.

### Optional Private Vault Backup
To sync `private/` across machines safely without touching this public repo, initialize `private/` as its own separate **private** Git repository (e.g., `nkusharoraa/career-vault`). Because `private/` is listed in `.gitignore`, the outer public repo will never track or push it.
