# Learn SD

A mobile-first, ADHD-friendly study path for students in SAIT’s Software Development diploma. One idea on screen at a time. Original explanations only — never copied from SAIT slides, assignments, or quizzes.

## Run it

```bash
npm install
cp .env.example .env
# optional: paste a Gemini key into .env as VITE_GEMINI_API_KEY
npm run dev
```

Byte the tutor works without a key; it will just say it needs one. Everything else is local.

## What’s in the app

- **Path** — courses grouped semester by semester, Duolingo-style nodes
- **Lessons** — bite-sized original explainers + a one-question check-in
- **Quizzes** — six formats (predict output, spot the bug, arrange order, fill blanks, matching, translate code)
- **Practice** — try-it exercises with Run, expected output, hint, and solution
- **Playground** — JavaScript in a sandbox; Python via lazy-loaded Pyodide
- **Setup** — environment guides (editor, Node, Python, JDK, Git, terminal, first file, CPRG 213)
- **AI Prompting** — standalone track (from Path or Setup) on briefing coding assistants
- **Progress** — XP, level, streak calendar, bookmarks
- **Byte** — floating robot tutor (Gemini Flash, lesson JSON as context)

Progress, bookmarks, and streaks live in `localStorage`. No backend.

## Content is JSON

Add a course without touching code:

1. Drop the official outline PDF in `docs/course-outlines/` (source of **what** to teach, not the wording).
2. Add the course and topic ids in `src/content/courses.json`.
3. Add `src/content/lessons/<topic-id>.json`, `src/content/quizzes/<topic-id>.json`, and optionally `src/content/exercises/<topic-id>.json`.

CPNT 217 is intentionally out of the app.

Sample content shipped now:

- `arrays-strings` (JavaScript) — full lesson, quiz, exercises
- `functions-scope` (Python) — full lesson, quiz, exercises
- `src/content/tracks/ai-prompting.json` — seven lessons + four prompt-writing exercises

Every other topic is a path node with a clean “Content coming soon” state.

## Official docs only

Lesson “Go deeper” links point at MDN, docs.python.org, or the Oracle Java Tutorials. No blogs, no scraped pages.
