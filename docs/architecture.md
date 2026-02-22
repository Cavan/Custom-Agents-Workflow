# Architecture of a Custom Copilot Agent

Understanding how the pieces fit together makes debugging and extending your agent much easier.

---

## High-Level Flow

```
User types "@my-agent do X" in Copilot Chat
         │
         ▼
  GitHub Copilot back-end
  (authenticates user, builds prompt)
         │
         │  HTTPS POST  (JSON body, SSE response expected)
         ▼
  Your Agent Server  ◄─── GitHub App credentials
         │
         │  (optional) call external APIs / LLMs
         ▼
  Stream back Server-Sent Events (SSE)
         │
         ▼
  GitHub Copilot back-end assembles tokens
         │
         ▼
  User sees streamed response in chat
```

---

## Key Components

### 1. GitHub App

Every custom Copilot agent is backed by a **GitHub App**. The app:

- Provides the identity of your agent (`@my-agent`).
- Holds the **Inference URL** — where GitHub sends chat requests.
- Optionally holds permissions to call the GitHub REST API on behalf of the user.

When a user mentions `@my-agent`, GitHub validates that the app is installed for that user/organisation and forwards the request to your Inference URL.

### 2. Inference Request (Inbound)

GitHub sends an **HTTP POST** to your Inference URL with:

```
POST https://your-server.example.com/
Content-Type: application/json
X-GitHub-Token: <short-lived OAuth token>
X-GitHub-Public-Key-Identifier: <key id>
X-GitHub-Public-Key-Signature: <signature>
```

**Body — simplified structure:**

```json
{
  "messages": [
    { "role": "system",  "content": "You are a helpful assistant." },
    { "role": "user",    "content": "@my-agent do X" },
    { "role": "assistant", "content": "..." }
  ],
  "copilot_thread_id": "abc-123",
  "agent": { "id": "...", "name": "my-agent" }
}
```

The `messages` array is a standard **OpenAI-compatible chat completion** format, which means you can pass it almost directly to any OpenAI-compatible LLM (including GitHub Models).

### 3. Payload Verification (Security — Do Not Skip!)

GitHub signs every request with an **ECDSA P-256** private key. Your server **must** verify this signature before trusting the payload. Both official SDKs handle this automatically.

Manual verification steps (if implementing from scratch):

1. Fetch GitHub's current public keys from `https://api.github.com/meta/public_keys/copilot_api`.
2. Identify the key matching `X-GitHub-Public-Key-Identifier`.
3. Verify the ECDSA signature of the raw request body using `X-GitHub-Public-Key-Signature`.
4. Reject the request if verification fails.

### 4. Your Agent Logic

Once the payload is verified, your agent can:

- **Respond directly** using a hard-coded or template reply.
- **Forward to an LLM** — pass the `messages` array to GitHub Models, OpenAI, Azure OpenAI, Anthropic, etc.
- **Call external APIs** — fetch data from Jira, Confluence, Slack, your internal services, etc., and inject context into the system message before calling the LLM.
- **Use function/tool calling** — define tool schemas in the LLM request and handle tool-call results before returning the final answer.

### 5. Streaming Response (Outbound — Server-Sent Events)

Your server must respond with:

```
HTTP/1.1 200 OK
Content-Type: text/event-stream
Cache-Control: no-cache
Transfer-Encoding: chunked
```

Each token is sent as an SSE event in **OpenAI streaming delta format**:

```
data: {"choices":[{"delta":{"content":"Hello"},"index":0}]}

data: {"choices":[{"delta":{"content":" world"},"index":0}]}

data: [DONE]
```

GitHub Copilot Chat assembles these deltas and displays them progressively to the user.

### 6. X-GitHub-Token (Calling the GitHub API)

The `X-GitHub-Token` header in the inbound request is a **short-lived OAuth token** scoped to the user who invoked the agent. You can use it to call the GitHub REST API on behalf of that user without any additional OAuth dance:

```bash
curl -H "Authorization: Bearer <X-GitHub-Token>" \
     https://api.github.com/user
```

The token automatically expires; do not cache it.

---

## Skillset Architecture (Simplified)

Skillsets work differently — you do **not** manage the LLM call:

```
User types "@my-skillset summarise issue #42"
         │
         ▼
  GitHub Copilot (runs its own LLM)
  LLM decides which skill function to call
         │
         │  HTTPS POST to your function endpoint
         ▼
  Your Skill Function Handler
  (returns plain JSON result)
         │
         ▼
  GitHub Copilot LLM incorporates result
  and streams the final answer to the user
```

Your server only needs to implement simple JSON-returning HTTP endpoints described by an OpenAPI-like manifest. No streaming required.

---

## Data Flow Diagram (Full Agent)

```
┌────────────────────────────────────────────────────┐
│                  Your Agent Server                  │
│                                                    │
│  POST /  ──► verifySignature()                     │
│              │                                     │
│              ▼                                     │
│           parseMessages()                          │
│              │                                     │
│              ├──► fetchExternalContext()  (optional)│
│              │         │                           │
│              │         ▼                           │
│              │    injectIntoSystemPrompt()          │
│              │                                     │
│              ▼                                     │
│           callLLM()  ──► GitHub Models / OpenAI    │
│              │                                     │
│              ▼                                     │
│           streamSSEResponse()  ──► Copilot Chat    │
└────────────────────────────────────────────────────┘
```

---

## Security Considerations

| Concern | Mitigation |
|---------|-----------|
| Payload tampering | Always verify the ECDSA signature |
| Prompt injection via user input | Sanitise user messages before injecting into system prompt |
| Token leakage | Never log the `X-GitHub-Token`; it grants API access as the user |
| SSRF via external calls | Validate and allowlist any URLs derived from user input |
| LLM key exposure | Store LLM API keys in environment variables, never in code |
