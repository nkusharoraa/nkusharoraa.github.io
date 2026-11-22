# CLAUDE.md

See [AGENTS.md](./AGENTS.md) for the complete operating manual, data routing table, privacy rules, CLI commands, and form-filling protocol.

## Quick Reference
- **Public portfolio data**: `data.json` (committed, powers `https://nkusharoraa.github.io/`)
- **Private career mind map (NEVER commit)**: `private/identity.json`, `private/career-graph.json`, `private/form-answers.md`
- **Search career data**: `python3 scripts/career.py search "<query>"`
- **Export platform copy**: `python3 scripts/career.py export <linkedin|naukri|mercor|outlier|forms|all>`
- **Pre-commit safety & schema check**: `python3 scripts/career.py validate`
- **Cross-repo handoff prompt**: `prompts/repo-handoff.md` (or `python3 scripts/career.py prompt`) — paste into agents on other repos, then ingest their output back here following `AGENTS.md` §3.5.

**Hard rule**: Never copy phone numbers, CTC, notice period, address, or any contents from `private/` or `exports/` into git-tracked files.
