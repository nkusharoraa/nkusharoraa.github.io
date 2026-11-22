# Ankush Arora — Portfolio & Career-as-Code Workspace

Live site: https://nkusharoraa.github.io/

## Overview
- **Public Portfolio** (`index.html`, `projects/index.html`, `data.json`): Vanilla HTML/CSS/JS GitHub Pages site powered by a single public `data.json`.
- **Private Career Vault** (`private/`, gitignored): Local-only structured mind map for private PII, deep STAR stories, architecture tradeoffs, and job-application answers — kept strictly outside public git history.
- **Agent & CLI Tooling** (`AGENTS.md`, `CLAUDE.md`, `scripts/career.py`): Instant search across public + private career data, pre-commit PII/schema validation, and platform-tailored profile exports for LinkedIn, Naukri, Mercor, Outlier, and ATS forms.

## Quick Commands
```bash
# Bootstrap local private/ templates on a new machine
python3 scripts/career.py init-private

# Search across public + private career data
python3 scripts/career.py search "RAG"

# Export platform drafts to gitignored exports/
python3 scripts/career.py export all

# Validate schema, assets, and check for accidental PII leaks
python3 scripts/career.py validate

# Print reusable handoff prompt for agents working on other repos
python3 scripts/career.py prompt
```

See [prompts/repo-handoff.md](prompts/repo-handoff.md) for the full, compact, and receiver handoff prompts.

## Get in Touch
- [Portfolio](https://nkusharoraa.github.io/)
- [LinkedIn](https://www.linkedin.com/in/nkusharoraa)
- [GitHub](https://github.com/nkusharoraa)
- [Email](mailto:nkusharoraa@gmail.com)
