# Custom Copilot Agents — A Practical Guide

> **Learn how to build, deploy, and extend GitHub Copilot with your own custom agents.**

This project walks you through every step of creating custom GitHub Copilot agents (also called *GitHub Copilot Extensions*). You will find simple explanations, architecture deep-dives, ready-to-use templates, and curated external resources.

---

## Table of Contents

1. [What Are Custom Copilot Agents?](#what-are-custom-copilot-agents)
2. [Quick Start (5 minutes)](#quick-start)
3. [Docs](#docs)
4. [Templates](#templates)
5. [Resources & Further Reading](#resources--further-reading)

---

## What Are Custom Copilot Agents?

**GitHub Copilot Extensions** let you add new `@agent` participants to GitHub Copilot Chat. Once installed, users can type `@your-agent do something` directly inside their editor or on GitHub.com, and your agent answers—just like the built-in `@workspace` or `@github` agents.

There are two implementation styles:

| Style | Best for | Complexity |
|-------|----------|------------|
| **Skillset** | Exposing a set of API functions (no custom LLM needed) | Low |
| **Agent** | Full control over conversation, streaming, custom LLMs | Medium–High |

See [`docs/skillsets-vs-agents.md`](docs/skillsets-vs-agents.md) for a detailed comparison.

---

## Quick Start

### Prerequisites

- A GitHub account with Copilot Business or Enterprise
- A publicly reachable HTTPS server (use [ngrok](https://ngrok.com) for local dev)
- Node.js ≥ 20 **or** Python ≥ 3.11

### 1 — Clone this repo and pick a template

```bash
git clone https://github.com/Cavan/Custom-Agents-Workflow.git
cd Custom-Agents-Workflow

# Node.js streaming agent
cp -r templates/nodejs-agent my-agent && cd my-agent
npm install

# Python/Flask agent
cp -r templates/python-agent my-agent && cd my-agent
pip install -r requirements.txt

# Skillset (simplest)
cp -r templates/skillset my-skillset && cd my-skillset
```

### 2 — Start a tunnel

```bash
ngrok http 3000
# Copy the forwarding URL, e.g. https://abc123.ngrok-free.app
```

### 3 — Register a GitHub App

1. Go to **GitHub → Settings → Developer settings → GitHub Apps → New GitHub App**.
2. Set **Homepage URL** and **Callback URL** to your tunnel URL.
3. Under **Copilot**, choose *Agent* or *Skillset* and paste the tunnel URL.
4. Install the app on your personal account or an organisation.

### 4 — Run your agent

```bash
# Node.js
npm start

# Python
python app.py
```

Open GitHub Copilot Chat and type `@your-agent hello`!

---

## Docs

| File | Description |
|------|-------------|
| [`docs/getting-started.md`](docs/getting-started.md) | Detailed prerequisites, GitHub App setup, and first run |
| [`docs/architecture.md`](docs/architecture.md) | How the request flows from Copilot Chat to your server and back |
| [`docs/skillsets-vs-agents.md`](docs/skillsets-vs-agents.md) | Side-by-side comparison with when to choose each |
| [`docs/resources.md`](docs/resources.md) | Curated links to official docs, videos, and open-source examples |

---

## Templates

| Directory | Description |
|-----------|-------------|
| [`templates/skillset/`](templates/skillset/) | Minimal skillset — OpenAPI manifest + Express handler |
| [`templates/nodejs-agent/`](templates/nodejs-agent/) | Full streaming agent in Node.js / TypeScript |
| [`templates/python-agent/`](templates/python-agent/) | Streaming agent in Python / Flask |

Each template directory contains its own `README.md` with setup instructions.

---

## Resources & Further Reading

See [`docs/resources.md`](docs/resources.md) for a fully annotated reading list.

**Quick links:**

- [Official GitHub Copilot Extensions docs](https://docs.github.com/en/copilot/building-copilot-extensions/about-building-copilot-extensions)
- [GitHub Copilot Extensions SDK (Node.js)](https://github.com/copilot-extensions/preview-sdk.js)
- [GitHub Copilot Extensions Python SDK](https://github.com/copilot-extensions/copilot-python-sdk)
- [Example agents gallery](https://github.com/github/copilot-extensions)

---

## Contributing

Pull requests are welcome! Please open an issue first to discuss what you would like to change.
