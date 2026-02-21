# Skillsets vs. Agents — Choosing the Right Approach

GitHub Copilot Extensions come in two flavours. This document helps you decide which one to build.

---

## Quick Comparison

| | **Skillset** | **Agent** |
|--|-------------|-----------|
| Who calls the LLM? | GitHub Copilot (built-in) | **You** |
| Response format | Plain JSON from your endpoint | Server-Sent Events (streaming) |
| Streaming UI | ✅ Handled by Copilot automatically | ✅ You stream SSE tokens |
| Custom system prompt | ❌ | ✅ |
| Custom LLM (non-OpenAI) | ❌ | ✅ |
| Multi-step tool/function calling | ❌ | ✅ |
| Implementation complexity | **Low** | **Medium – High** |
| Payload signature verification | Optional | **Required** |
| GitHub API access | Via token forwarding | Via token forwarding |

---

## When to Build a Skillset

Choose a skillset when:

- You already have REST API endpoints you want to expose to Copilot.
- You don't need a custom LLM or special prompt engineering.
- You want the simplest possible implementation — a few JSON endpoints + an OpenAPI manifest.
- You want GitHub Copilot to decide *when* to call your functions (function-calling handled for you).

**Example use cases:**
- Fetching Jira tickets: `@jira-agent show me open P1 tickets`
- Looking up internal documentation: `@docs-agent how does our auth service work`
- Querying a database: `@data-agent what were last week's signups`

### Skillset Implementation (minimal)

```
my-skillset/
├── manifest.json      ← Describes your skills (OpenAPI-like)
└── server.js          ← HTTP handler(s) returning JSON
```

Your manifest describes function signatures:

```json
{
  "name_for_human": "Jira Agent",
  "skills": [
    {
      "id": "getTickets",
      "description": "Get open Jira tickets",
      "parameters": {
        "type": "object",
        "properties": {
          "priority": { "type": "string", "enum": ["P1","P2","P3"] }
        }
      },
      "inference_url": "https://your-server.example.com/skills/getTickets"
    }
  ]
}
```

Your handler just returns JSON — no streaming needed:

```js
app.post('/skills/getTickets', async (req, res) => {
  const { priority } = req.body.parameters;
  const tickets = await jira.getTickets({ priority });
  res.json({ tickets });
});
```

---

## When to Build a Full Agent

Choose a full agent when:

- You need a custom system prompt (personas, specialised knowledge, formatting rules).
- You want to call a non-OpenAI LLM (Anthropic Claude, Google Gemini, a local model, etc.).
- You need multi-turn tool/function calling orchestrated by your own logic.
- You want to pre-process or augment user messages before they reach the LLM.
- You need fine-grained control over what gets logged, cached, or rate-limited.

**Example use cases:**
- A security review agent with a carefully crafted security-specialist prompt.
- An agent that calls multiple internal services, aggregates results, and synthesises an answer.
- An agent backed by a fine-tuned or self-hosted model.

### Agent Implementation (minimal)

```
my-agent/
├── src/
│   ├── index.ts       ← Express server
│   ├── verify.ts      ← Signature verification
│   └── stream.ts      ← SSE helpers
├── package.json
└── .env.example
```

The critical parts are:

1. **Verify the ECDSA signature** on every inbound request.
2. **Pass `messages` to your LLM** (or process them yourself).
3. **Stream SSE deltas** back to Copilot.

See [`templates/nodejs-agent/`](../templates/nodejs-agent/) and [`templates/python-agent/`](../templates/python-agent/) for working examples.

---

## Decision Tree

```
Do you already have REST API endpoints?
├── Yes ──► Do you need a custom LLM or prompt?
│           ├── No  ──► SKILLSET ✅
│           └── Yes ──► AGENT ✅
└── No  ──► Do you need a custom LLM or prompt?
            ├── No  ──► SKILLSET (define simple endpoints) ✅
            └── Yes ──► AGENT ✅
```

In practice: **start with a Skillset** and upgrade to a full Agent only if you hit its limitations.
