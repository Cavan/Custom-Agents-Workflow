# Skillset Template

The simplest way to build a GitHub Copilot Extension. You define HTTP endpoints; GitHub Copilot's built-in LLM decides when to call them and how to present the results.

---

## What This Template Does

This template exposes two example skills:

| Skill | What it does |
|-------|-------------|
| `getWeather` | Returns (fake) weather for a given city |
| `searchDocs` | Returns (fake) documentation snippets for a query |

Replace these with your real API calls.

---

## Files

```
templates/skillset/
├── README.md          ← This file
├── manifest.json      ← Skill definitions (OpenAPI-like)
├── server.js          ← Express HTTP handlers
├── package.json
└── .env.example
```

---

## Setup

```bash
cp -r templates/skillset my-skillset
cd my-skillset
npm install
cp .env.example .env
# Edit .env if needed
npm start
```

Then register your GitHub App (see [`docs/getting-started.md`](../../docs/getting-started.md)) with **Type: Skillset** and the manifest URL pointing to `https://your-tunnel-url/manifest.json`.

---

## Extending the Template

1. Add a new entry to `manifest.json` describing your skill's parameters.
2. Add a matching `app.post('/skills/<skillId>', ...)` handler in `server.js`.
3. Return plain JSON — no streaming needed.
