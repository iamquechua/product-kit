# Knowledge Directory

Drop raw research files here. Product Kit slash commands will read these as evidence when drafting artifacts.

## What to Put Here

- **Interview transcripts** — `.md`, `.txt`, or `.csv` files from user interviews
- **Survey results** — `.csv` exports from survey tools (Google Forms, Typeform, etc.)
- **Analytics exports** — `.csv` or `.json` data from analytics platforms
- **Market research** — PDFs, reports, or summaries from industry research
- **Competitor analysis** — Screenshots, notes, or feature comparisons
- **Internal docs** — Strategy decks, OKRs, meeting notes, prior PRDs

## Workspace vs Project Knowledge

If this project is inside a workspace, there are two knowledge directories:

- **Workspace `knowledge/`** (parent directory) — Shared research that applies across all projects: company-wide market reports, org-level competitor analysis, brand guidelines, industry regulations, and cross-project user research.
- **Project `knowledge/`** (this directory) — Research specific to this project: user interviews for this product, feature-specific surveys, project-scoped analytics, and this product's competitive positioning.

Run `/productkit.learn` after adding files to index them into `knowledge-index.md`. All other slash commands read the index instead of scanning raw files directly. Project-level knowledge takes precedence when there's overlap.

## Supported Formats

Claude can read: `.md`, `.txt`, `.csv`, `.json`, `.pdf`

## Tips

- Use descriptive filenames: `user-interviews-2025-q1.md` not `notes.txt`
- Keep files focused — one topic per file is easier to reference
- Add a brief header to each file explaining what it contains
- Anonymize interview data before committing (replace names with P1, P2, etc.)
- Consider adding this directory to `.gitignore` if files contain sensitive data
