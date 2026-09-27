# trueleansolutions.com (v2)

This is the redesigned True Lean Solutions website: a static Astro site deployed to GitHub Pages.

- **Owner:** Himanshu
- **Guidance:** Hemang Dwivedi and Mack Akhani

## Start here

1. Create the GitHub repository and push this folder to it as the first commit.
2. In the repo settings, set **Pages → Source** to **GitHub Actions**.
3. Open the folder in Claude Code. It reads `CLAUDE.md` automatically and walks through the first-session checklist, including the questions it needs answered.

## What is in `docs/`

| Path | Contents |
|---|---|
| `brand/TLS_Brand_Guide_v2.3.docx` | The brand source of truth. The `.md` beside it is a pandoc export for tools. |
| `brand/TLS_Brand_Guide_v2.2_SUPERSEDED.docx` | Archive only. |
| `project-history.md` | How the redesign got here, settled decisions, and open questions. |
| `sources.md` | Every Drive file the site's content comes from, with fetch URLs. |
| `references/` | Mack's mock-ups and a guide to what each one is for. Tali designs are for v1.1. |
| `meetings/` | Transcript of the 2026-09-27 local design review. |
| `decisions.md` | Append-only log of deliberately temporary choices. |

## Local development

Requires Node.js LTS.

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # production build to dist/
npx astro check    # type and template checks
```
