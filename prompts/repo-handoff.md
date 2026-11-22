# Repo-to-Portfolio Handoff Prompts

Use these prompts in chats with coding agents running on **other repositories** (work repos, side projects, research codebases) to extract a structured, privacy-safe handoff packet ready to drop into this portfolio (`data.json`) and private career vault (`private/career-graph.json`).

> Tip: Run `python3 scripts/career.py prompt` from this repo to print the raw prompt to stdout for quick clipboard copy.

---

## 1. Full Handoff Prompt (Copy & Paste into Any Repo Agent)

<!-- HANDOFF_PROMPT_START -->
```text
You are preparing a Career Handoff Packet from THIS repository so I can update my public portfolio (`nkusharoraa.github.io`) and my private career knowledge base (`private/career-graph.json`).

### Step 1: Inspect This Repository (Ground Every Claim)
Inspect the codebase, README, git log (`git log -n 30 --oneline` and my commits if identifiable), dependencies/manifests, architecture/infra files (Docker, CI/CD, Terraform/Azure/GCP/AWS), and tests/benchmarks/evals.
- **ZERO FABRICATION**: Never invent metrics, user counts, latencies, accuracy gains, or dates. If a business/scale metric is not explicitly proven in this repo or our chat, insert `[NEEDS USER METRIC: <what to ask>]` instead of guessing.
- **PRIVACY SANITIZATION**: For the PUBLIC block, remove all confidential/internal client names, internal hostnames/URLs, secrets, credentials, proprietary schemas, and NDA-sensitive business details. Keep architectural patterns, open-source/cloud stack, and safe high-level outcomes.

### Step 2: Classify Into My Portfolio Schema
Choose the best matching category ID from my portfolio:
- `llm` — "LLM & Generative AI" (LLMs, RAG, MCP, AI Agents, fine-tuning, NLP/transformers)
- `ml` — "ML Engineering & MLOps" (ML/DL models, surrogates, ranking, anomaly detection, evaluation, MLOps, CI/CD, ETL, optimization)
- `misc` — "Other Projects" (quant/finance, forecasting, mechanical/systems, standalone web tools)

Determine whether this project belongs under an existing roleId (`dexian`, `bajaj-auto`, `colonist`, `mcgill`, `nthu`), a new role, or `null` (independent project).

### Step 3: Output ONLY the Following 4 Sections

#### A. Public Portfolio Snippet (`data.json`)
Provide valid JSON with:
1. `categoryId`: `"llm"` | `"ml"` | `"misc"`
2. `projectCategoryEntry`: ready for `data.json -> projectCategories[].projects[]`:
```json
{
  "title": "Concise, Recruiter-Searchable Project Title",
  "period": "Month YYYY - Month YYYY (or omit if ongoing/role-scoped)",
  "githubUrl": "https://github.com/... (ONLY if public repo; otherwise omit)",
  "liveUrl": "https://... (ONLY if public live demo; otherwise omit)",
  "bullets": [
    "Action + Architecture/Stack + Quantified Outcome (1-2 crisp sentences).",
    "Second high-signal outcome, scale, or engineering highlight."
  ],
  "tags": ["Tag1", "Tag2", "Tag3"]
}
```
3. `featuredVariant` (if strong enough for homepage `data.json -> projects[].featured[]` — uses `{ "label", "text" }` bullets):
```json
{
  "title": "Same exact title as projectCategoryEntry",
  "bullets": [
    { "label": "Architecture", "text": "..." },
    { "label": "Results", "text": "..." }
  ],
  "tags": ["Tag1", "Tag2", "Tag3"]
}
```
4. `newSkillsToAdd`: Array of exact ATS-friendly tech/framework strings verified in this repo that may be worth adding to my skills (split by category: `Generative AI & LLMs`, `ML/DL Frameworks & Tools`, `Cloud AI & MLOps`, `Languages, Data & Visualization`).

#### B. Private Career Mind Map Entry (`private/career-graph.json`)
Provide valid JSON for `private/career-graph.json -> projects[]` and `metricsBank[]`:
```json
{
  "project": {
    "id": "kebab-case-project-id",
    "title": "Same exact title",
    "roleId": "dexian | bajaj-auto | ... | null",
    "period": "YYYY-MM to YYYY-MM or Present",
    "public": true,
    "category": "LLM & Generative AI | ML Engineering & MLOps | Other Projects",
    "skills": ["Explicit", "ATS", "Stack", "Strings"],
    "metrics": ["Only verified metrics or [NEEDS USER METRIC]"],
    "summary": "1-2 sentence high-density summary.",
    "star": {
      "situation": "Problem & context (2 sentences max).",
      "task": "What I personally owned.",
      "action": "Architecture, key libraries, data flow, and implementation specifics.",
      "result": "Verified technical & business impact.",
      "tradeoffs": "2-3 concrete engineering tradeoffs & alternatives rejected (for Mercor/Staff/AI Architect interviews)."
    },
    "links": {}
  },
  "metricsBank": [
    { "metric": "Quantified headline", "projectId": "kebab-case-project-id", "context": "One-line context" }
  ]
}
```

#### C. Resume & Platform Bullets
- **1-Page Resume (1–2 bullets, <= 2 lines each)**: Action + Context + Verified Metric format.
- **LinkedIn / Mercor Angle**: 1 sentence positioning why this proves specialist AI Architect / LLM / MLOps depth.

#### D. Verification & Redaction Audit
- **Evidence Map**: List each claim/metric -> exact file path, commit, or benchmark in this repo (or `[NEEDS USER METRIC]`).
- **Redacted Items**: Explicitly list anything sensitive (client names, internal URLs, proprietary details) stripped from Section A so I can double-check before publishing.
```
<!-- HANDOFF_PROMPT_END -->

---

## 2. Compact Handoff Prompt (Quick Mid-Chat Version)

```text
Inspect this repo (README, architecture, dependencies, git history, benchmarks/evals) and generate a Career Handoff Packet for my portfolio (`nkusharoraa.github.io`) + private career graph (`private/career-graph.json`).

Rules:
- Zero fabrication: use `[NEEDS USER METRIC]` for any metric not verified in this repo/chat.
- Sanitize the public snippet (no internal client names, secrets, or proprietary URLs).
- Map category to `llm`, `ml`, or `misc`.

Output:
1. Public JSON for `data.json` (`projectCategories` entry with string bullets + optional `projects.featured` entry with `{label, text}` bullets + `tags` + any new ATS skill keywords).
2. Private JSON for `private/career-graph.json` (`id`, `title`, `roleId`, `period`, `public`, `category`, `skills`, `metrics`, `summary`, `star: {situation, task, action, result, tradeoffs}`, `metricsBank`).
3. 1–2 concise resume bullets (Action + Context + Metric) and a brief Evidence + Redaction list.
```

---

## 3. Receiver Prompt (Paste Back into This Portfolio Repo)

Once the other repo's agent gives you the handoff packet, open a chat in this portfolio workspace and paste:

```text
Ingest the Career Handoff Packet below following AGENTS.md:
1. Merge Section B into `private/career-graph.json` (do NOT commit `private/`).
2. Merge Section A into `data.json` (only public-safe, verified details; keep homepage `projects` and `projectCategories` titles and counts 100% synced).
3. Ask me for any `[NEEDS USER METRIC]` placeholders before finalizing public bullets.
4. Run `python3 scripts/career.py validate` and `python3 scripts/career.py export all` to refresh LinkedIn, Naukri, Mercor, Outlier, and ATS form drafts.

<PASTE HANDOFF PACKET HERE>
```
