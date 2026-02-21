# Node.js Streaming Agent Template

A full GitHub Copilot agent that:

- **Verifies** the ECDSA request signature from GitHub.
- **Streams** SSE tokens back to Copilot Chat using GitHub Models (GPT-4o).
- **Forwards** the user's GitHub token for optional GitHub API calls.

---

## Files

```
templates/nodejs-agent/
├── README.md
├── package.json
├── tsconfig.json
├── .env.example
└── src/
    ├── index.ts       ← Express server entry point
    ├── verify.ts      ← ECDSA signature verification
    └── stream.ts      ← SSE streaming helpers
```

---

## Setup

```bash
cp -r templates/nodejs-agent my-agent
cd my-agent
npm install
cp .env.example .env
# Edit .env — set PORT if desired
npm run build
npm start
```

Or run in development mode with live reload:

```bash
npm run dev   # uses ts-node-dev or tsx
```

---

## How It Works

1. `index.ts` — receives `POST /` from GitHub Copilot, calls `verifySignature`, then calls the GitHub Models API with the conversation history, streaming the response back as SSE.
2. `verify.ts` — fetches GitHub's public keys and verifies the ECDSA P-256 signature.
3. `stream.ts` — helper functions for writing OpenAI-compatible SSE deltas and the final `[DONE]` event.

---

## Customising the System Prompt

Edit the `SYSTEM_PROMPT` constant in `src/index.ts`:

```ts
const SYSTEM_PROMPT = `You are a helpful assistant specialised in ...`;
```

---

## Using a Different LLM

Replace the `callModel` function in `src/index.ts` with any OpenAI-compatible endpoint:

```ts
const response = await fetch('https://YOUR_ENDPOINT/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.LLM_API_KEY}`,
  },
  body: JSON.stringify({ model: 'your-model', messages, stream: true }),
});
```

---

## Calling the GitHub API

The `X-GitHub-Token` header contains a short-lived OAuth token for the user. Use it to call the GitHub REST API:

```ts
const ghToken = req.headers['x-github-token'] as string;
const userRes = await fetch('https://api.github.com/user', {
  headers: { Authorization: `Bearer ${ghToken}` },
});
const user = await userRes.json();
```
