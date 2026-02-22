# Getting Started with Custom Copilot Agents

This guide takes you from zero to a running custom GitHub Copilot agent.

---

## Prerequisites

### Accounts & Access

| Requirement | Notes |
|-------------|-------|
| GitHub account | Free tier is fine for building; users need Copilot to _use_ the agent |
| GitHub Copilot Business or Enterprise | Required by end-users of the extension |
| GitHub App registration | Free; one per agent |

### Runtime (choose one)

- **Node.js ≥ 20** with npm ≥ 10
- **Python ≥ 3.11** with pip

### Networking

Your server must be reachable over **HTTPS** from the GitHub Copilot back-end. Options:

| Option | Notes |
|--------|-------|
| **ngrok** (recommended for local dev) | `ngrok http 3000` gives you a public HTTPS URL |
| **Cloudflare Tunnel** | `cloudflared tunnel --url http://localhost:3000` |
| **Production hosting** | Any cloud host with TLS (Railway, Render, Fly.io, AWS, Azure, …) |

---

## Step 1 — Choose Your Template

| Template | When to use |
|----------|-------------|
| `templates/skillset/` | You have existing REST APIs to expose; no custom LLM needed |
| `templates/nodejs-agent/` | You want full streaming control, a custom prompt, or a custom LLM |
| `templates/python-agent/` | Same as above but you prefer Python |

Copy the template and install dependencies:

```bash
# Node.js agent
cp -r templates/nodejs-agent my-agent
cd my-agent
npm install

# Python agent
cp -r templates/python-agent my-agent
cd my-agent
pip install -r requirements.txt
```

---

## Step 2 — Start a Local Tunnel

```bash
ngrok http 3000        # Node.js default port
# or
ngrok http 5000        # Python default port
```

Note the **Forwarding** URL, e.g. `https://abc123.ngrok-free.app`.

---

## Step 3 — Register a GitHub App

1. Navigate to **GitHub → Settings → Developer settings → GitHub Apps → New GitHub App**.
2. Fill in the required fields:
   - **GitHub App name** — e.g. `my-copilot-agent`
   - **Homepage URL** — your tunnel URL
   - **Webhook URL** — your tunnel URL + `/webhook` (can be any path; webhooks are optional for agents)
3. Under the **Copilot** section:
   - Set **Type** to `Agent` (or `Skillset` for the skillset template).
   - Paste your tunnel URL into the **Inference URL** field.
4. Under **Permissions**, grant only what your agent needs (e.g. *Read-only* on repositories if you need repo data).
5. Click **Create GitHub App**.
6. On the app page, click **Install** and choose your account or organisation.

> **Tip:** Keep a note of your **App ID** and generate a **Private Key** (PEM file) — you'll need them if your agent calls the GitHub API on behalf of users.

---

## Step 4 — Configure Your Agent

Each template includes a `.env.example` file. Copy it and fill in the values:

```bash
cp .env.example .env
# Edit .env with your App ID, private key path, etc.
```

---

## Step 5 — Run and Test

```bash
# Node.js
npm start

# Python
python app.py
```

Open GitHub Copilot Chat (in VS Code, JetBrains, or GitHub.com) and type:

```
@my-copilot-agent Hello, are you there?
```

You should see the response streamed back in the chat panel.

---

## Step 6 — Iterate and Deploy

When you're happy with local testing:

1. Deploy your server to a cloud host.
2. Update the **Inference URL** in your GitHub App settings to the production URL.
3. Publish the GitHub App publicly (optional) via **Settings → Make public** to let other organisations install it.

---

## Common Pitfalls

| Problem | Fix |
|---------|-----|
| `400 Bad Request` from Copilot | Check that your server returns `Content-Type: text/event-stream` for streaming responses |
| Agent not appearing in chat | Make sure the GitHub App is installed on your account _and_ Copilot is enabled |
| `401 Unauthorized` on GitHub API calls | Verify the `X-GitHub-Token` header is forwarded correctly from the request |
| SSL errors with ngrok | Use the HTTPS forwarding URL, not HTTP |

---

## Next Steps

- Read [`architecture.md`](architecture.md) to understand how the message flow works.
- Read [`skillsets-vs-agents.md`](skillsets-vs-agents.md) to decide which type is right for your use case.
