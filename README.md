# Portfolio site — Ben McCloskey (16.S893)

**Live site:** [16s893-ai-for-engineering-research.github.io/benmccloskey](https://16s893-ai-for-engineering-research.github.io/benmccloskey/)

Static, no-build multi-page site for Assignment 1 of 16.S893 (AI Agents for Engineering Research).
Requirements pulled directly from [slide 28](https://16s893-ai-for-engineering-research.github.io/class-repo/sessions/orientation/slides/#28):

- Multi-page with navigation
- Who I am + a project outline
- Something animated
- An easter egg

## Structure

```
index.html     Home
about.html     Who I am
project.html   Project outline (from proposal/week1-one-page-draft.tex)
devlog.html    AI-use dev log
css/style.css
js/layout.js   Injects shared header/footer + active nav state
js/dispatch.js Canvas animation (stylized MEDEVAC dispatch, hero on home page)
js/egg.js      Easter egg — type "medevac" anywhere on the page
```

## Run locally

No build step. From this folder:

```
python3 -m http.server 8000
```

Then open http://localhost:8000/.

## Status

Built with the `pi` coding agent (MIT Parley), reviewed by hand before publishing.
See `devlog.html` for what was delegated, checked, and rejected.

Pending: push to a dedicated repo inside the class GitHub org — organization
membership invite is still `pending` as of this writing.
