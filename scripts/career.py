#!/usr/bin/env python3
"""
Career-as-Code CLI for nkusharoraa.github.io.

Zero-dependency utility to:
  - search       Query public data.json + local gitignored private/ career mind map
  - export       Generate conversion-optimized profile drafts (LinkedIn, Naukri, Mercor, Outlier, forms)
  - validate     Verify data.json schema, asset integrity, .gitignore protection, and scan for PII leaks
  - init-private Bootstrap local private/ files from templates/private/
"""

from __future__ import annotations

import argparse
import glob
import json
import os
import re
import shutil
import subprocess
import sys
import zlib
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parent.parent
PUBLIC_DATA = ROOT / "data.json"
PRIVATE_DIR = ROOT / "private"
TEMPLATES_DIR = ROOT / "templates" / "private"
EXPORTS_DIR = ROOT / "exports"
HANDOFF_PROMPT_FILE = ROOT / "prompts" / "repo-handoff.md"


def load_json(path: Path) -> Any:
    if not path.exists():
        return None
    with path.open("r", encoding="utf-8") as fh:
        return json.load(fh)


def tokenize(text: str) -> set[str]:
    return set(re.findall(r"[a-z0-9+#.-]+", text.lower()))


def build_records() -> list[dict[str, Any]]:
    records: list[dict[str, Any]] = []
    pub = load_json(PUBLIC_DATA) or {}

    # Public hero & about
    if pub.get("hero"):
        records.append({
            "source": "data.json#hero",
            "type": "bio",
            "title": f"{pub['hero'].get('name', '')} — Tagline",
            "text": f"{pub['hero'].get('tagline', '')} | {pub.get('about', {}).get('intro', '')}",
            "tags": ["bio", "summary", "tagline", "about"],
        })

    # Public skills
    for cat in pub.get("skills", {}).get("categories", []):
        records.append({
            "source": "data.json#skills",
            "type": "skills",
            "title": cat["title"],
            "text": cat["items"],
            "tags": ["skills", cat["title"]],
        })

    # Public projects
    for cat in pub.get("projectCategories", []):
        for proj in cat.get("projects", []):
            bullets = " ".join(proj.get("bullets", []))
            links = " ".join(filter(None, [proj.get("githubUrl"), proj.get("liveUrl")]))
            records.append({
                "source": f"data.json#projectCategories.{cat['id']}",
                "type": "project",
                "title": proj["title"],
                "text": f"[{cat['name']}] {proj.get('period', '')} {bullets} {links}".strip(),
                "tags": proj.get("tags", []) + [cat["name"], cat["id"]],
            })

    # Public experience
    exp = pub.get("experience", {})
    for bucket in ("industry", "research", "education"):
        for item in exp.get(bucket, []):
            org = item.get("company") or item.get("institution", "")
            detail = item.get("role") or item.get("degree", "")
            records.append({
                "source": f"data.json#experience.{bucket}",
                "type": bucket,
                "title": f"{org} — {detail}",
                "text": f"{item.get('location', '')} | {item.get('period', '')} | {item.get('url', '')}",
                "tags": [bucket, org, item.get("location", "")],
            })

    # Public awards
    for award in pub.get("awards", []):
        certs = "; ".join(
            f"{c.get('code', '')}: {c.get('description', '')}"
            for c in award.get("certificates", [])
        )
        records.append({
            "source": "data.json#awards",
            "type": "award",
            "title": award["title"],
            "text": f"{award.get('description', '')} [{award.get('period', '')}] {certs}".strip(),
            "tags": ["award", "achievement", award["title"]],
        })

    # Private identity
    identity = load_json(PRIVATE_DIR / "identity.json")
    if identity:
        records.append({
            "source": "private/identity.json",
            "type": "private-identity",
            "title": f"{identity.get('fullName', '')} — Private Identity & Logistics",
            "text": json.dumps(identity, ensure_ascii=False),
            "tags": ["phone", "contact", "ctc", "salary", "notice", "gpa", "location", "visa", "authorization"],
        })

    # Private career graph
    graph = load_json(PRIVATE_DIR / "career-graph.json")
    if graph:
        for role in graph.get("roles", []):
            records.append({
                "source": f"private/career-graph.json#roles.{role['id']}",
                "type": "private-role",
                "title": f"{role['company']} — {role['title']} ({role['startDate']} to {role['endDate']})",
                "text": f"{role.get('domain', '')} | {role.get('summary', '')}",
                "tags": ["role", role["company"], role.get("domain", "")],
            })
        for proj in graph.get("projects", []):
            star = proj.get("star", {})
            star_text = " | ".join(
                f"{k.upper()}: {v}" for k, v in star.items() if v
            )
            metrics = ", ".join(proj.get("metrics", []))
            records.append({
                "source": f"private/career-graph.json#projects.{proj['id']}",
                "type": "private-project-star",
                "title": f"{proj['title']} [{proj.get('category', '')}]",
                "text": f"Metrics: {metrics} | {proj.get('summary', '')} | {star_text}",
                "tags": proj.get("skills", []) + ["star", "interview", proj.get("category", "")],
            })
        for m in graph.get("metricsBank", []):
            records.append({
                "source": "private/career-graph.json#metricsBank",
                "type": "metric",
                "title": m["metric"],
                "text": f"{m['context']} (project: {m.get('projectId', '')})",
                "tags": ["metric", "impact", m.get("projectId", "")],
            })

    # Private form answers markdown
    qa_path = PRIVATE_DIR / "form-answers.md"
    if qa_path.exists():
        content = qa_path.read_text(encoding="utf-8")
        sections = re.split(r"^##\s+", content, flags=re.MULTILINE)
        for sec in sections[1:]:
            lines = sec.strip().splitlines()
            if not lines:
                continue
            title = lines[0].strip()
            body = "\n".join(lines[1:]).strip()
            records.append({
                "source": "private/form-answers.md",
                "type": "form-answer",
                "title": title,
                "text": body,
                "tags": ["form", "answer", "essay", "screening", title],
            })

    return records


def cmd_search(args: argparse.Namespace) -> int:
    query = " ".join(args.query).strip()
    if not query:
        print("Provide a search query, e.g.: python3 scripts/career.py search 'RAG Azure'")
        return 1

    q_tokens = tokenize(query)
    q_lower = query.lower()
    records = build_records()
    scored: list[tuple[int, dict[str, Any]]] = []

    for rec in records:
        haystack_title = rec["title"].lower()
        haystack_tags = " ".join(rec.get("tags", [])).lower()
        haystack_text = rec["text"].lower()
        full_tokens = tokenize(f"{haystack_title} {haystack_tags} {haystack_text}")

        score = 0
        if q_lower in haystack_title:
            score += 10
        if q_lower in haystack_tags:
            score += 8
        if q_lower in haystack_text:
            score += 5
        for tok in q_tokens:
            if tok in tokenize(haystack_title):
                score += 4
            if tok in tokenize(haystack_tags):
                score += 3
            if tok in full_tokens:
                score += 2
            elif any(tok in t for t in full_tokens):
                score += 1

        if score > 0:
            scored.append((score, rec))

    scored.sort(key=lambda item: (-item[0], item[1]["source"]))
    if not scored:
        print(f"No matches for '{query}'.")
        return 0

    limit = args.limit
    print(f"Found {len(scored)} match(es) for '{query}' (showing top {min(limit, len(scored))}):\n")
    for score, rec in scored[:limit]:
        snippet = rec["text"]
        if len(snippet) > 360 and not args.full:
            snippet = snippet[:357] + "..."
        print(f"[{rec['type']}] {rec['title']}  (score={score}, source={rec['source']})")
        print(f"  {snippet}\n")
    return 0


def _collect_all_skills(pub: dict[str, Any]) -> list[str]:
    skills: list[str] = []
    for cat in pub.get("skills", {}).get("categories", []):
        # Split on commas outside parentheses
        parts = re.split(r",\s*(?![^()]*\))", cat["items"])
        for part in parts:
            cleaned = part.strip()
            if cleaned and cleaned not in skills:
                skills.append(cleaned)
    return skills


def _render_linkedin(pub: dict[str, Any], graph: dict[str, Any] | None) -> str:
    skills = _collect_all_skills(pub)
    roles_section = []
    if graph:
        proj_by_id = {p["id"]: p for p in graph.get("projects", [])}
        for role in graph.get("roles", []):
            lines = [f"### {role['title']} — {role['company']}", f"*{role['startDate']} – {role['endDate']} | {role['location']}*", ""]
            for pid in role.get("projectIds", []):
                p = proj_by_id.get(pid)
                if p:
                    lines.append(f"- **{p['title']}**: {p['summary']}")
            roles_section.append("\n".join(lines))

    return f"""# LinkedIn Profile Pack — Ankush Arora

## Headline Options (220 char limit)
1. **Recommended (Architect + Impact):**
   `AI Architect & Manager (AI Initiatives) @ Dexian | Production LLMs, RAG, MCP & Agentic AI (100K+ calls/day) | Fine-Tuning (LoRA) & MLOps | IIT Delhi`
2. **Hands-On GenAI / Staff Track:**
   `AI Architect | Building Production LLM Systems, RAG Pipelines & MCP Agent Servers | PyTorch, LangChain, vLLM, Azure/GCP/AWS | Ex-Bajaj Auto R&D | IIT Delhi`

## About Section
{pub['about']['intro']}

**Key Production Highlights:**
- **Agentic AI & MCP at Scale**: Architected a custom Azure Model Context Protocol (MCP) server exposing SQL analytics, formula introspection, and domain wiki to AI agents (**100K+ API calls/day**).
- **Enterprise RAG**: Shipped a RAG-powered Microsoft Teams assistant for **460+ users** with a teachable per-team wiki layer, plus a local Llama-3/vLLM/FAISS root-cause analysis system (**20% faster turnaround**).
- **LLM Fine-Tuning & ML Engineering**: Fine-tuned CodeLlama with LoRA (**40% latency reduction**), engineered PyTorch/scikit-learn surrogate models (**33% faster optimization loops**), and deployed FAISS anomaly detection (**+18% defect detectability**).
- **Research & Engineering Foundations**: ML Research Intern at McGill University (**+15% protein similarity accuracy**, **88%/85% P/R** biomedical NER, **500K+ records/day** bio-data ETL); B.Tech. from **IIT Delhi (8.55/10.00)**.

Portfolio: https://nkusharoraa.github.io/ | GitHub: https://github.com/nkusharoraa

## Experience Bullets
{chr(10).join(roles_section)}

## Top Skills to Pin (Order Matters for Recruiter Search)
1. Generative AI / Large Language Models (LLMs)
2. Retrieval-Augmented Generation (RAG)
3. Model Context Protocol (MCP) & Agentic AI
4. Python, PyTorch & Hugging Face Transformers
5. MLOps (Azure ML, GCP Vertex AI, AWS SageMaker, Docker, Kubernetes)

## Full Skills List
{", ".join(skills)}

## Featured Section Recommendations
1. Portfolio Website: https://nkusharoraa.github.io/
2. Projects Showcase: https://nkusharoraa.github.io/projects/
3. Live Demo — Markowitz Portfolio Optimization: https://nkusharoraa.github.io/Markowitz-Portfolio-Optimization/
4. GitHub — Discrete Simulation Optimization (`dissim`): https://github.com/nkusharoraa/dissim
"""


def _render_naukri(pub: dict[str, Any], identity: dict[str, Any] | None) -> str:
    notice = (identity or {}).get("careerLogistics", {}).get("noticePeriod", "Update in private/identity.json")
    naukri_skills = [
        "Generative AI", "Large Language Models (LLM)", "RAG", "LangChain", "LlamaIndex",
        "Model Context Protocol (MCP)", "AI Agents", "LLM Fine-tuning", "LoRA", "QLoRA",
        "vLLM", "FAISS", "Hugging Face Transformers", "PyTorch", "TensorFlow", "scikit-learn",
        "XGBoost", "Python", "SQL", "FastAPI", "MLOps", "Azure ML", "GCP Vertex AI",
        "AWS SageMaker", "Docker", "Kubernetes", "MLflow", "Weights & Biases", "CI/CD",
        "Apache Airflow", "Spark", "MongoDB", "spaCy", "Prompt Engineering", "Embeddings"
    ]
    headline = "AI Architect | 3+ Yrs Exp | GenAI, LLMs, RAG, MCP, AI Agents, LoRA Fine-tuning, PyTorch, LangChain, vLLM, Azure/GCP/AWS, MLOps | IIT Delhi"
    return f"""# Naukri Profile Pack — Ankush Arora

## Resume Headline ({len(headline)}/250 chars)
`{headline}`

## Profile Summary
AI Architect & Engineer (IIT Delhi, B.Tech., 8.55 GPA) with 3+ years of hands-on experience shipping production Generative AI, LLM, RAG, and MLOps systems across enterprise recruitment (Dexian) and automotive R&D (Bajaj Auto). Built a 100K+ calls/day Azure MCP server for AI agents, a 460+ user enterprise RAG Teams chatbot, an autonomous AI technical interview screener, CodeLlama LoRA fine-tuning (40% latency reduction), local Llama-3/vLLM/FAISS RAG pipelines (20% faster RCA), and PyTorch ML surrogate models (33% faster optimization loops).

## Key Skills (Paste all granular tags)
{", ".join(naukri_skills)}

## Logistics Reminder
- Notice Period: {notice}
- Preferred Locations: Pune, Bengaluru, Delhi NCR, Hyderabad, Remote
- **Naukri Algorithm Tip**: Make a minor edit / re-upload your resume every 3–4 days (especially Monday/Tuesday mornings IST) to stay pinned at the top of recruiter search results.
"""


def _render_mercor(pub: dict[str, Any], graph: dict[str, Any] | None) -> str:
    qa_blocks = []
    if graph:
        for proj in graph.get("projects", []):
            if not proj.get("public", True):
                continue
            star = proj.get("star", {})
            qa_blocks.append(
                f"### {proj['title']} ({proj.get('category', '')})\n"
                f"- **Key Metrics**: {', '.join(proj.get('metrics', [])) or 'N/A'}\n"
                f"- **Stack**: {', '.join(proj.get('skills', []))}\n"
                f"- **What you built (Action)**: {star.get('action', proj.get('summary', ''))}\n"
                f"- **Impact (Result)**: {star.get('result', '')}\n"
                f"- **Likely Mercor AI Follow-up / Tradeoffs**: {star.get('tradeoffs', '')}\n"
            )

    return f"""# Mercor Profile & AI Interview Prep Pack — Ankush Arora

## Specialist Positioning (Avoid Generic Titles)
- **Primary Title**: `AI Architect — Production LLM Systems, Agentic MCP & RAG Evaluation`
- **Core Niches**: Agentic AI / Tool Calling (MCP), Enterprise RAG Architectures, Parameter-Efficient Fine-Tuning (LoRA/CodeLlama), ML Benchmarking & Evaluation, Python / PyTorch Systems

## High-Signal Stack Keywords (Exact Strings for Vector Matching)
Python, PyTorch, TensorFlow, Hugging Face Transformers, LangChain, LlamaIndex, vLLM, FAISS, LoRA, QLoRA, Model Context Protocol (MCP), FastAPI, SQL, Docker, Kubernetes, Azure ML, GCP Vertex AI, AWS SageMaker, MLflow, Weights & Biases, scikit-learn, XGBoost, spaCy, Apache Airflow, Spark, CVXPY

## Defensible Claims Cheat Sheet (for Mercor ~20-min AI Video Interview)
> Remember: Mercor's AI interviewer dynamically probes claims directly from your resume. Keep answers conversational, natural (no scripts/LLMs), 60–90 seconds each, leading with architectural tradeoffs you personally made.

{chr(10).join(qa_blocks)}
"""


def _render_outlier(pub: dict[str, Any]) -> str:
    return f"""# Outlier Profile Pack — Ankush Arora

## Domain Expertise Summary
AI Architect and IIT Delhi engineering graduate (B.Tech., Mechanical Engineering, GPA 8.55/10.00; JEE Advanced top 0.2 percentile, JEE Main Paper II AIR 67) with 3+ years of production LLM/ML experience across enterprise GenAI and R&D.

## High-Value Evaluation & Training Domains to Select
1. **Coding & Software Engineering**: Python (production backend/ML), SQL (complex analytics/MCP), C++, Java, FastAPI, GitHub Actions/CI-CD, pytest/Selenium automation.
2. **AI / ML & LLM Engineering**: RAG evaluation, prompt engineering, tool-use / agentic workflows (MCP), LoRA fine-tuning, vLLM inference, FAISS vector retrieval, PyTorch/Hugging Face debugging.
3. **Math, Optimization & Quantitative Reasoning**: Convex optimization (CVXPY, Markowitz mean-variance), stochastic discrete simulation optimization (AHA & SR, statistical significance testing, MCC, p-values), time-series forecasting.
4. **Mechanical & Systems Engineering**: Multibody dynamics (ADAMS), vehicle dynamics, surrogate modeling, DFMEA/V&V pipelines, MITx Supply Chain Management (5/6 courses passed on edX).

## Short Screening Bio
{pub['about']['intro']}
"""


def _render_forms(pub: dict[str, Any], identity: dict[str, Any] | None, graph: dict[str, Any] | None) -> str:
    ident = identity or {}
    loc = ident.get("location", {})
    log = ident.get("careerLogistics", {})
    edu = ident.get("educationPrivate", {})

    metrics_lines = []
    if graph:
        for m in graph.get("metricsBank", []):
            metrics_lines.append(f"- **{m['metric']}** — {m['context']}")

    return f"""# ATS / Job Application Form Cheat Sheet (PRIVATE — DO NOT COMMIT)

## Core Fields
- **Full Name**: {ident.get('fullName', 'Ankush Arora')}
- **Email**: {ident.get('email', 'nkusharoraa@gmail.com')}
- **Phone**: {ident.get('phone', 'Update in private/identity.json')}
- **Location**: {loc.get('city', 'Pune')}, {loc.get('state', 'Maharashtra')}, {loc.get('country', 'India')} ({loc.get('timezone', 'Asia/Kolkata')})
- **Portfolio**: https://nkusharoraa.github.io/
- **LinkedIn**: https://www.linkedin.com/in/nkusharoraa
- **GitHub**: https://github.com/nkusharoraa
- **Experience**: {log.get('yearsOfExperienceFullTime', '3+')} years full-time
- **Current Title / Company**: {log.get('currentRole', 'AI Architect, Manager - AI Initiatives')} @ {log.get('currentCompany', 'Dexian')}
- **Notice Period**: {log.get('noticePeriod', 'TODO')}
- **Current / Expected CTC**: {log.get('currentCTC', 'TODO')} / {log.get('expectedCTC', 'TODO')}

## Education
- **University**: {edu.get('university', 'Indian Institute of Technology Delhi')}
- **Degree**: {edu.get('degree', 'B.Tech. in Mechanical Engineering')}
- **GPA**: {edu.get('gpa', '8.55/10.00')}
- **Dates**: {edu.get('startDate', '2019-07')} to {edu.get('endDate', '2023-06')}

## Verified Metrics Bank (Copy-Paste Ready)
{chr(10).join(metrics_lines)}
"""


def cmd_export(args: argparse.Namespace) -> int:
    pub = load_json(PUBLIC_DATA)
    if not pub:
        print("Error: data.json not found.", file=sys.stderr)
        return 1

    identity = load_json(PRIVATE_DIR / "identity.json")
    graph = load_json(PRIVATE_DIR / "career-graph.json")
    EXPORTS_DIR.mkdir(parents=True, exist_ok=True)

    generators = {
        "linkedin": lambda: _render_linkedin(pub, graph),
        "naukri": lambda: _render_naukri(pub, identity),
        "mercor": lambda: _render_mercor(pub, graph),
        "outlier": lambda: _render_outlier(pub),
        "forms": lambda: _render_forms(pub, identity, graph),
    }

    targets = list(generators.keys()) if args.target == "all" else [args.target]
    for target in targets:
        out_path = EXPORTS_DIR / f"{target}.md"
        out_path.write_text(generators[target](), encoding="utf-8")
        print(f"Exported: {out_path.relative_to(ROOT)}")
    return 0


def cmd_prompt(_args: argparse.Namespace) -> int:
    if not HANDOFF_PROMPT_FILE.exists():
        print("Error: prompts/repo-handoff.md not found.", file=sys.stderr)
        return 1
    content = HANDOFF_PROMPT_FILE.read_text(encoding="utf-8")
    match = re.search(
        r"<!-- HANDOFF_PROMPT_START -->\s*```text\n(.*?)\n```\s*<!-- HANDOFF_PROMPT_END -->",
        content,
        flags=re.DOTALL,
    )
    if not match:
        print(content)
        return 0
    print(match.group(1))
    return 0


def cmd_build_cv(_args: argparse.Namespace) -> int:
    build_script = ROOT / "scripts" / "build_resume.py"
    res = subprocess.run([sys.executable, str(build_script)], cwd=ROOT)
    return res.returncode


def cmd_init_private(_args: argparse.Namespace) -> int:
    PRIVATE_DIR.mkdir(parents=True, exist_ok=True)
    mapping = {
        "identity.example.json": "identity.json",
        "career-graph.example.json": "career-graph.json",
        "form-answers.example.md": "form-answers.md",
    }
    for src_name, dst_name in mapping.items():
        src = TEMPLATES_DIR / src_name
        dst = PRIVATE_DIR / dst_name
        if dst.exists():
            print(f"Skipped (already exists): private/{dst_name}")
        elif src.exists():
            shutil.copyfile(src, dst)
            print(f"Created: private/{dst_name}")
    return 0


def cmd_validate(args: argparse.Namespace) -> int:
    errors: list[str] = []
    warnings: list[str] = []
    is_ci = bool(getattr(args, "ci", False))

    # 1. Validate data.json
    pub = load_json(PUBLIC_DATA)
    if not pub:
        errors.append("Missing or invalid data.json")
        pub = {}

    cats = {c["id"]: c for c in pub.get("projectCategories", [])}
    for grp in pub.get("projects", []):
        cid = grp.get("categoryId") or grp.get("seeMoreUrl", "").split("#")[-1]
        if cid not in cats:
            errors.append(f"Homepage project group '{grp.get('category')}' references unknown category '{cid}'")
            continue
        cat_titles = {p["title"] for p in cats[cid].get("projects", [])}
        for feat in grp.get("featured", []):
            if feat["title"] not in cat_titles:
                errors.append(f"Featured project '{feat['title']}' not found in projectCategories['{cid}']")
        expected_more = max(0, len(cat_titles) - len(grp.get("featured", [])))
        if grp.get("moreCount") != expected_more:
            warnings.append(f"Category '{cid}' moreCount={grp.get('moreCount')} differs from expected {expected_more}")

    # 2. Asset integrity
    scan_files = [
        "index.html", "shared.js", "script.js", "style.css", "shared.css", "data.json",
        "projects/index.html", "projects/script.js", "projects/style.css",
    ]
    refs: set[str] = {"media/toggle-dark-icon.svg", "media/toggle-light-icon.svg"}
    for rel in scan_files:
        p = ROOT / rel
        if p.exists():
            txt = p.read_text(encoding="utf-8")
            for match in re.findall(r"(?:media|photos)/[A-Za-z0-9._-]+|Ankush_Arora[^\s\"'<>]+\.pdf", txt):
                refs.add(match)
    for ref in sorted(refs):
        if not (ROOT / ref).exists():
            errors.append(f"Missing referenced asset: {ref}")

    all_assets = set(glob.glob(str(ROOT / "media/*")) + glob.glob(str(ROOT / "photos/*")) + glob.glob(str(ROOT / "*.pdf")))
    all_assets_rel = {str(Path(a).relative_to(ROOT)) for a in all_assets}
    for unused in sorted(all_assets_rel - refs):
        warnings.append(f"Unused asset: {unused}")

    # 3. Verify gitignore protects private/ and exports/ and nothing inside them is tracked
    for protected in ("private/identity.json", "exports/forms.md"):
        res = subprocess.run(
            ["git", "check-ignore", "-q", protected],
            cwd=ROOT,
            capture_output=True,
        )
        if res.returncode != 0:
            errors.append(f"CRITICAL: '{protected}' is NOT ignored by .gitignore!")

    tracked_private = subprocess.run(
        ["git", "ls-files", "private", "exports"],
        cwd=ROOT,
        capture_output=True,
        text=True,
    )
    if tracked_private.stdout.strip():
        errors.append(f"CRITICAL: Private/export files are tracked by git: {tracked_private.stdout.strip()}")

    # 4. PII leak scan across public text files and public PDFs (exclude placeholder +91 000...)
    phone_re = re.compile(r"\+91[\s-]?(?!000)[6-9]\d{2}[\s-]?\d{3}[\s-]?\d{4}")
    tracked_candidates = [
        p for p in ROOT.rglob("*")
        if p.is_file()
        and p.suffix in {".json", ".html", ".js", ".css", ".md", ".py", ".txt", ".yml", ".yaml"}
        and ".git" not in p.parts
        and "private" not in p.parts
        and "exports" not in p.parts
    ]
    for fp in tracked_candidates:
        txt = fp.read_text(encoding="utf-8", errors="ignore")
        if phone_re.search(txt):
            errors.append(f"PII LEAK: Indian mobile number detected in public file {fp.relative_to(ROOT)}")

    for pdf_path in ROOT.glob("*.pdf"):
        raw = pdf_path.read_bytes()
        chunks = [raw.decode("latin-1", errors="ignore")]
        for stream_match in re.finditer(rb"stream\r?\n(.*?)\r?\nendstream", raw, flags=re.DOTALL):
            try:
                chunks.append(zlib.decompress(stream_match.group(1)).decode("latin-1", errors="ignore"))
            except Exception:
                pass
        if phone_re.search("\n".join(chunks)):
            errors.append(f"PII LEAK: Indian mobile number detected inside public PDF {pdf_path.name}")

    # 5. Check private vault presence (local mode only)
    if not is_ci and not (PRIVATE_DIR / "identity.json").exists():
        warnings.append("Local private/identity.json not found (run: python3 scripts/career.py init-private)")

    for w in warnings:
        print(f"WARN: {w}")
    for e in errors:
        print(f"ERROR: {e}")

    if errors:
        print(f"\nValidation FAILED with {len(errors)} error(s).")
        return 1
    print(f"Validation PASSED ({len(warnings)} warning(s), 0 errors, 0 PII leaks in public files & PDFs).")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description="Career-as-Code CLI for portfolio & private career mind map.")
    sub = parser.add_subparsers(dest="command", required=True)

    p_search = sub.add_parser("search", help="Search across public data.json and private/ mind map")
    p_search.add_argument("query", nargs="+", help="Keywords to search")
    p_search.add_argument("-n", "--limit", type=int, default=8, help="Max results to print")
    p_search.add_argument("--full", action="store_true", help="Do not truncate matched snippets")
    p_search.set_defaults(func=cmd_search)

    p_export = sub.add_parser("export", help="Export tailored profile drafts into gitignored exports/")
    p_export.add_argument("target", choices=["linkedin", "naukri", "mercor", "outlier", "forms", "all"])
    p_export.set_defaults(func=cmd_export)

    p_val = sub.add_parser("validate", help="Validate data.json, assets, gitignore, and check for PII leaks")
    p_val.add_argument("--ci", action="store_true", help="CI mode (skip local private/ presence warning)")
    p_val.set_defaults(func=cmd_validate)

    p_init = sub.add_parser("init-private", help="Scaffold private/ files from templates/private/")
    p_init.set_defaults(func=cmd_init_private)

    p_prompt = sub.add_parser("prompt", help="Print the reusable repo-to-portfolio handoff prompt")
    p_prompt.set_defaults(func=cmd_prompt)

    p_cv = sub.add_parser("build-cv", help="Build public (phone-redacted) and private CV PDFs + LaTeX source")
    p_cv.set_defaults(func=cmd_build_cv)

    args = parser.parse_args()
    return args.func(args)


if __name__ == "__main__":
    raise SystemExit(main())
