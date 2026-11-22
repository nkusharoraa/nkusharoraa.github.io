#!/usr/bin/env python3
"""
Reproducible Career-as-Code Resume Builder.

Generates ATS-friendly, single-page PDFs via wkhtmltopdf (using Bitstream Charter)
plus an Overleaf-ready LaTeX source:
  - Public PDF  (phone redacted): Ankush_Arora_latest_CV.pdf
  - Private PDF (with phone):     private/Ankush_Arora_CV_full.pdf
  - Private LaTeX source:         private/resume.tex
"""

from __future__ import annotations

import html
import json
import subprocess
import sys
import tempfile
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parent.parent
PRIVATE_DIR = ROOT / "private"
PUBLIC_PDF = ROOT / "Ankush_Arora_latest_CV.pdf"
PRIVATE_PDF = PRIVATE_DIR / "Ankush_Arora_CV_full.pdf"
PRIVATE_TEX = PRIVATE_DIR / "resume.tex"


def _load_json(path: Path) -> dict[str, Any]:
    if not path.exists():
        return {}
    with path.open("r", encoding="utf-8") as fh:
        return json.load(fh)


def get_resume_model() -> dict[str, Any]:
    identity = _load_json(PRIVATE_DIR / "identity.json")
    return {
        "name": identity.get("fullName", "Ankush Arora"),
        "phone": identity.get("phone", ""),
        "email": identity.get("email", "nkusharoraa@gmail.com"),
        "linkedinLabel": "in/nkusharoraa",
        "linkedinUrl": "https://www.linkedin.com/in/nkusharoraa",
        "githubLabel": "github.com/nkusharoraa",
        "githubUrl": "https://github.com/nkusharoraa",
        "portfolioLabel": "nkusharoraa.github.io",
        "portfolioUrl": "https://nkusharoraa.github.io/",
        "summary": (
            "AI Engineer with 3+ years of experience building production ML/LLM systems across "
            "automotive R&D and enterprise recruitment. Skilled in RAG architectures, LLM fine-tuning "
            "(LoRA), surrogate modelling, and end-to-end MLOps. Currently leading AI initiatives at "
            "Dexian—including a 100K+ calls/day MCP server, a 460-user enterprise chatbot, and an "
            "AI-driven interview platform. IIT Delhi graduate (B.Tech., Mechanical Engineering)."
        ),
        "education": {
            "institution": "Indian Institute of Technology Delhi",
            "degree": "B.Tech. in Mechanical Engineering (GPA: 8.55/10.00)",
            "period": "July 2019 – June 2023",
        },
        "experience": [
            {
                "company": "Dexian",
                "role": "AI Architect, Manager – AI Initiatives",
                "period": "March 2026 – Present",
                "bullets": [
                    ("Analytics MCP Server", "Architected and deployed a custom Model Context Protocol server on Azure, exposing recruitment analytics (SQL queries, aggregate formula introspection, domain wiki) to AI agents, handling <strong>100K+</strong> API calls/day across the centralized recruitment workspace."),
                    ("Enterprise Teams Bot", "Built and deployed a RAG-powered Microsoft Teams chatbot for <strong>460+</strong> users, integrating client SOPs, benefits info, vendor lists, HR-BP mappings, state-wise labour laws, and org hierarchy with a teachable per-team wiki layer."),
                    ("AI Interview Screener", "Developed an autonomous AI-driven interview bot capable of conducting structured technical screens, reducing recruiter screening overhead and standardizing candidate evaluation across roles."),
                    ("Candidate Matching Enhancements", "Improved the in-house AI candidate-sourcing engine by refining ranking logic, building a cost-estimation framework, and benchmarking match quality to strengthen sourcing accuracy without dropping key candidate artifacts."),
                ],
            },
            {
                "company": "Bajaj Auto Limited",
                "role": "Assistant Manager, AI & Vehicle Dynamics, R&D",
                "period": "July 2023 – February 2026",
                "bullets": [
                    ("Architected RAG-Based RCA System", "Deployed a local Retrieval-Augmented stack (LangChain, Llama-3 vLLM, FAISS) to mine and index a decade of vehicle test, simulation, and inference data for Root Cause Analysis (RCA), reducing investigative TAT by <strong>20%</strong> and improving FMEA closure."),
                    ("Engineered ML Surrogate Models for MBD", "Built regression-based ML surrogates (scikit-learn, PyTorch) to emulate Adams MBD outputs, accelerating parameter sweeps and DOE—enabling near-instant chassis, steering, and suspension optimization (<strong>33%</strong> faster loops)."),
                    ("Automated Outlier Detection in V&V Pipelines", "Deployed semantic similarity search (FAISS), text embeddings (Hugging Face), and RAG analytics to flag anomalous Adams results during virtual verification, elevating defect detectability by <strong>18%</strong>."),
                    ("LLM-Driven Scripting Automation", "Fine-tuned CodeLlama using LoRA adapters on custom Adams scripting datasets for NL-to-code translation, achieving <strong>40%</strong> reduction in end-to-end simulation automation latency."),
                ],
            },
            {
                "company": "Colonist LLC",
                "role": "QA Automation Engineer (Part-time)",
                "period": "January 2023 – June 2023",
                "bullets": [
                    ("Automated Regression & NLP Defect Detection", "Boosted test execution throughput by <strong>30%</strong> and reduced issue resolution time by <strong>25%</strong>, leveraging Selenium 4.x, pytest-driven automation, and <strong>spaCy</strong>-powered NLP log parsing."),
                    ("CI/CD Pipeline Integration", "Automated Jira QA syncs via Jenkins and GitHub Actions, achieving <strong>20%</strong> DF increment."),
                ],
            },
            {
                "company": "McGill University",
                "role": "ML Research Intern, Computational Biology (Prof. Adam Hendricks)",
                "period": "May 2022 – July 2022",
                "bullets": [
                    ("Embedding-Driven Optimization", "Applied SBERT sentence-transformers to semantic protein similarity search pipelines, improving match accuracy by <strong>15%</strong> over baseline sequence alignment methods."),
                    ("Bio-Data ETL Automation", "Batched high-throughput metadata ingestion from public APIs (NCBI, UniProt) handling <strong>500K+</strong> records/day."),
                    ("BERT Biomedical NER", "Fine-tuned domain-specific Hugging Face BERT, achieving precision/recall of <strong>88%/85%</strong> on labeled text."),
                ],
            },
        ],
        "skills": [
            ("Languages", "Python, C++, Java, SQL, MATLAB"),
            ("ML/DL Frameworks", "scikit-learn, TensorFlow, PyTorch, Keras, XGBoost, Hugging Face Transformers"),
            ("AI/ML Tools", "Pandas, NumPy, OpenCV, spaCy, FastAPI, vLLM, FAISS, ONNX, MLflow, Weights & Biases"),
            ("Cloud AI & MLOps", "GCP, Vertex AI, Azure, Azure ML, AWS SageMaker, Docker, Kubernetes, CI/CD (Jenkins, GitHub Actions)"),
            ("Data Engineering & Visualization", "Apache Airflow, Spark, MongoDB, Matplotlib, Seaborn, Dash, Tableau"),
            ("Generative AI & LLMs", "RAG (LangChain, LlamaIndex), Fine-tuning (LoRA, QLoRA), Prompt Engineering, Embeddings, MCP, Agentic AI"),
        ],
        "projects": [
            {
                "title": "Discrete Simulation Optimization for ML Hyperparameter Tuning",
                "linkLabel": "GitHub",
                "linkUrl": "https://github.com/nkusharoraa/dissim",
                "period": "August 2022 – May 2023",
                "bullets": [
                    "Developed Python-based stochastic optimizers for automated ML hyperparameter tuning, reducing simulation tuning latency by <strong>30%</strong> in high-dimensional discrete search spaces (<strong>20+</strong> parameters).",
                    "Validated <strong>AHA &amp; SR methods</strong> with statistically significant gains over baselines on WDBC (<strong>0.89 MCC</strong>, <em>p</em> &lt; 0.01).",
                ],
            },
            {
                "title": "Markowitz Portfolio Optimization System",
                "linkLabel": "Live Demo",
                "linkUrl": "https://nkusharoraa.github.io/Markowitz-Portfolio-Optimization/",
                "period": "July 2025 – November 2025",
                "bullets": [
                    "Designed mean-variance optimization engine using Markowitz Theory and convex programming (CVXPY), achieving up to <strong>20%</strong> portfolio risk reduction at targeted returns.",
                    "Deployed interactive web platform with <strong>100+</strong> automated time-series analyses, efficient frontier plotting, and Sharpe ratio benchmarking.",
                ],
            },
        ],
        "achievements": [
            ("MITx MicroMasters", "Successfully passed 5/6 courses for the SCM MITx MicroMasters on edX", "(2023–2024)"),
            ("MITACS GRI", "Selected among top <strong>1%</strong> for undergraduate research in Canada (10,000+ applicants)", "(2022)"),
            ("Teaching Assistant at IIT Delhi", "Offered assistantship for course of 400+ students", "(2022)"),
            ("Department Change at IIT Delhi", "Opted department change among top <strong>9%</strong> in batch of 1000+", "(2021)"),
            ("Joint Entrance Exam", "Secured <strong>AIR 67</strong> in JEE Main Paper II and top <strong>0.2 percentile</strong> in JEE Advanced with 1M+ candidates", "(2019)"),
        ],
    }


def render_html(model: dict[str, Any], include_phone: bool) -> str:
    contact_items = []
    if include_phone and model["phone"]:
        tel_href = model["phone"].replace(" ", "")
        contact_items.append(f'<a href="tel:{html.escape(tel_href)}">{html.escape(model["phone"])}</a>')
    contact_items.extend([
        f'<a href="mailto:{html.escape(model["email"])}">{html.escape(model["email"])}</a>',
        f'<a href="{html.escape(model["linkedinUrl"])}">{html.escape(model["linkedinLabel"])}</a>',
        f'<a href="{html.escape(model["githubUrl"])}">{html.escape(model["githubLabel"])}</a>',
        f'<a href="{html.escape(model["portfolioUrl"])}">{html.escape(model["portfolioLabel"])}</a>',
    ])
    contact_line = ' <span class="sep">|</span> '.join(contact_items)

    exp_blocks = []
    for job in model["experience"]:
        bullets_html = "".join(
            f'<li><strong>{html.escape(label)}:</strong> {body}</li>'
            for label, body in job["bullets"]
        )
        exp_blocks.append(f"""
        <div class="entry">
            <div class="entry-head">
                <div><strong>{html.escape(job["company"])}</strong> <span class="pipe">|</span> <em>{html.escape(job["role"])}</em></div>
                <div class="date">{html.escape(job["period"])}</div>
            </div>
            <ul>{bullets_html}</ul>
        </div>""")

    skills_html = "".join(
        f'<div class="skill-row"><strong>{html.escape(cat)}:</strong> {html.escape(items)}</div>'
        for cat, items in model["skills"]
    )

    proj_blocks = []
    for proj in model["projects"]:
        bullets_html = "".join(f"<li>{b}</li>" for b in proj["bullets"])
        proj_blocks.append(f"""
        <div class="entry">
            <div class="entry-head">
                <div><strong>{html.escape(proj["title"])}</strong> <span class="pipe">|</span> <a class="proj-link" href="{html.escape(proj["linkUrl"])}">{html.escape(proj["linkLabel"])}</a></div>
                <div class="date">{html.escape(proj["period"])}</div>
            </div>
            <ul>{bullets_html}</ul>
        </div>""")

    ach_rows = "".join(
        f"""<div class="ach-row">
            <div><strong>{html.escape(title)}:</strong> {desc}</div>
            <div class="date">{html.escape(year)}</div>
        </div>"""
        for title, desc, year in model["achievements"]
    )

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>{html.escape(model["name"])} - CV</title>
<style>
  @page {{
    size: A4;
    margin: 0;
  }}
  * {{
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }}
  body {{
    font-family: 'Bitstream Charter', 'Liberation Serif', Georgia, serif;
    font-size: 10.1pt;
    line-height: 1.33;
    color: #111;
    background: #fff;
    padding: 10mm 12mm 9mm 12mm;
  }}
  a {{
    color: #111;
    text-decoration: none;
  }}
  .header {{
    text-align: center;
    margin-bottom: 6pt;
  }}
  .header h1 {{
    font-size: 21pt;
    font-weight: 700;
    letter-spacing: 0.06em;
    margin-bottom: 3pt;
  }}
  .contact {{
    font-size: 9.6pt;
    color: #222;
  }}
  .contact .sep {{
    margin: 0 5pt;
    color: #666;
  }}
  .section {{
    margin-top: 7.5pt;
  }}
  .section-title {{
    font-size: 10.5pt;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    border-bottom: 1pt solid #111;
    padding-bottom: 1.5pt;
    margin-bottom: 4.5pt;
  }}
  .summary {{
    text-align: justify;
  }}
  .entry {{
    margin-bottom: 5pt;
  }}
  .entry:last-child {{
    margin-bottom: 0;
  }}
  .entry-head {{
    display: -webkit-box;
    display: flex;
    -webkit-box-pack: justify;
    justify-content: space-between;
    -webkit-box-align: baseline;
    align-items: baseline;
    margin-bottom: 2pt;
  }}
  .pipe {{
    margin: 0 3pt;
    color: #555;
  }}
  .date {{
    font-style: italic;
    font-size: 9.5pt;
    white-space: nowrap;
    margin-left: 8pt;
    color: #222;
  }}
  .proj-link {{
    color: #1d5f4e;
    text-decoration: underline;
    font-size: 9.2pt;
    font-weight: 600;
  }}
  ul {{
    list-style-type: disc;
    padding-left: 14pt;
  }}
  li {{
    margin-bottom: 2pt;
    text-align: justify;
  }}
  li:last-child {{
    margin-bottom: 0;
  }}
  .skill-row {{
    margin-bottom: 2pt;
  }}
  .ach-row {{
    display: -webkit-box;
    display: flex;
    -webkit-box-pack: justify;
    justify-content: space-between;
    -webkit-box-align: baseline;
    align-items: baseline;
    margin-bottom: 2pt;
  }}
</style>
</head>
<body>
  <div class="header">
    <h1>{html.escape(model["name"].upper())}</h1>
    <div class="contact">{contact_line}</div>
  </div>

  <div class="section">
    <div class="section-title">Summary</div>
    <p class="summary">{html.escape(model["summary"])}</p>
  </div>

  <div class="section">
    <div class="section-title">Education</div>
    <div class="entry-head">
      <div><strong>{html.escape(model["education"]["institution"])}</strong> <span class="pipe">|</span> <em>{html.escape(model["education"]["degree"])}</em></div>
      <div class="date">{html.escape(model["education"]["period"])}</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Work Experience</div>
    {"".join(exp_blocks)}
  </div>

  <div class="section">
    <div class="section-title">Technical Skills</div>
    {skills_html}
  </div>

  <div class="section">
    <div class="section-title">Projects</div>
    {"".join(proj_blocks)}
  </div>

  <div class="section">
    <div class="section-title">Achievements</div>
    {ach_rows}
  </div>
</body>
</html>
"""


def _html_to_tex(text: str) -> str:
    text = text.replace("<strong>", r"\textbf{").replace("</strong>", "}")
    text = text.replace("<em>", r"\textit{").replace("</em>", "}")
    text = text.replace("&amp;", r"\&").replace("&lt;", "$<$")
    text = text.replace("%", r"\%").replace("&", r"\&").replace(r"\\&", r"\&")
    text = text.replace("—", "---").replace("–", "--")
    return text


def render_latex(model: dict[str, Any]) -> str:
    exp_tex = []
    for job in model["experience"]:
        bullets = "\n".join(
            f"  \\item \\textbf{{{_html_to_tex(label)}:}} {_html_to_tex(body)}"
            for label, body in job["bullets"]
        )
        exp_tex.append(
            f"\\noindent\\textbf{{{_html_to_tex(job['company'])}}} $|$ \\textit{{{_html_to_tex(job['role'])}}} "
            f"\\hfill \\textit{{{_html_to_tex(job['period'])}}}\n"
            f"\\begin{{itemize}}[leftmargin=1.2em, itemsep=1pt, topsep=2pt]\n{bullets}\n\\end{{itemize}}\n"
        )

    skills_tex = "\n".join(
        f"\\noindent\\textbf{{{_html_to_tex(cat)}:}} {_html_to_tex(items)}\\\\"
        for cat, items in model["skills"]
    )

    proj_tex = []
    for proj in model["projects"]:
        bullets = "\n".join(f"  \\item {_html_to_tex(b)}" for b in proj["bullets"])
        proj_tex.append(
            f"\\noindent\\textbf{{{_html_to_tex(proj['title'])}}} $|$ "
            f"\\href{{{proj['linkUrl']}}}{{{proj['linkLabel']}}} "
            f"\\hfill \\textit{{{_html_to_tex(proj['period'])}}}\n"
            f"\\begin{{itemize}}[leftmargin=1.2em, itemsep=1pt, topsep=2pt]\n{bullets}\n\\end{{itemize}}\n"
        )

    ach_tex = "\n".join(
        f"\\noindent\\textbf{{{_html_to_tex(t)}:}} {_html_to_tex(d)} \\hfill \\textit{{{_html_to_tex(y)}}}\\\\"
        for t, d, y in model["achievements"]
    )

    return f"""% Overleaf-ready LaTeX source generated by scripts/build_resume.py
\\documentclass[10pt,a4paper]{{article}}
\\usepackage[margin=0.45in]{{geometry}}
\\usepackage[T1]{{fontenc}}
\\usepackage{{charter}}
\\usepackage{{enumitem}}
\\usepackage[hidelinks]{{hyperref}}
\\usepackage{{titlesec}}
\\pagestyle{{empty}}

\\titleformat{{\\section}}{{\\bfseries\\uppercase}}{{}}{{0em}}{{}}[\\titlerule]
\\titlespacing{{\\section}}{{0pt}}{{6pt}}{{3pt}}

\\begin{{document}}
\\begin{{center}}
  {{\\LARGE \\textbf{{{model["name"].upper()}}}}}\\\\[3pt]
  \\small {model["phone"]} $|$ \\href{{mailto:{model["email"]}}}{{{model["email"]}}} $|$
  \\href{{{model["linkedinUrl"]}}}{{{model["linkedinLabel"]}}} $|$
  \\href{{{model["githubUrl"]}}}{{{model["githubLabel"]}}} $|$
  \\href{{{model["portfolioUrl"]}}}{{{model["portfolioLabel"]}}}
\\end{{center}}

\\section*{{Summary}}
\\noindent {_html_to_tex(model["summary"])}

\\section*{{Education}}
\\noindent\\textbf{{{_html_to_tex(model["education"]["institution"])}}} $|$ \\textit{{{_html_to_tex(model["education"]["degree"])}}} \\hfill \\textit{{{_html_to_tex(model["education"]["period"])}}}

\\section*{{Work Experience}}
{chr(10).join(exp_tex)}
\\section*{{Technical Skills}}
{skills_tex}

\\section*{{Projects}}
{chr(10).join(proj_tex)}
\\section*{{Achievements}}
{ach_tex}
\\end{{document}}
"""


def _html_to_pdf(html_content: str, output_pdf: Path) -> None:
    output_pdf.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile("w", suffix=".html", encoding="utf-8", delete=False) as tf:
        tf.write(html_content)
        temp_html = Path(tf.name)
    try:
        cmd = [
            "wkhtmltopdf",
            "--quiet",
            "--page-size", "A4",
            "--margin-top", "0",
            "--margin-bottom", "0",
            "--margin-left", "0",
            "--margin-right", "0",
            "--enable-local-file-access",
            str(temp_html),
            str(output_pdf),
        ]
        subprocess.run(cmd, check=True)
    finally:
        temp_html.unlink(missing_ok=True)


def build_all() -> int:
    model = get_resume_model()

    # 1. Public CV (phone redacted)
    _html_to_pdf(render_html(model, include_phone=False), PUBLIC_PDF)
    print(f"Built public CV (phone-redacted): {PUBLIC_PDF.relative_to(ROOT)}")

    # 2. Private CV + Overleaf LaTeX source (only when private/ exists)
    if PRIVATE_DIR.exists():
        _html_to_pdf(render_html(model, include_phone=True), PRIVATE_PDF)
        PRIVATE_TEX.write_text(render_latex(model), encoding="utf-8")
        print(f"Built private CV (with phone):    {PRIVATE_PDF.relative_to(ROOT)}")
        print(f"Built private LaTeX source:       {PRIVATE_TEX.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(build_all())
