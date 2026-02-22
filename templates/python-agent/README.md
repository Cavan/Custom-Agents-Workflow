# Python Streaming Agent Template

A full GitHub Copilot agent written in Python / Flask that:

- **Verifies** the ECDSA request signature from GitHub.
- **Streams** SSE tokens back to Copilot Chat using GitHub Models (GPT-4o).
- **Forwards** the user's GitHub token for optional GitHub API calls.

---

## Files

```
templates/python-agent/
├── README.md
├── requirements.txt
├── .env.example
├── app.py             ← Flask server entry point
├── verify.py          ← ECDSA signature verification
└── stream.py          ← SSE streaming helpers
```

---

## Setup

```bash
cp -r templates/python-agent my-agent
cd my-agent
pip install -r requirements.txt
cp .env.example .env
# Edit .env if needed
python app.py
```

---

## How It Works

1. `app.py` — receives `POST /` from GitHub Copilot, calls `verify_signature`, then calls the GitHub Models API with the conversation history, streaming the response back as SSE.
2. `verify.py` — fetches GitHub's public keys and verifies the ECDSA P-256 signature using the `cryptography` library.
3. `stream.py` — helper generator and utilities for writing OpenAI-compatible SSE deltas.

---

## Customising the System Prompt

Edit the `SYSTEM_PROMPT` constant in `app.py`.

---

## Using a Different LLM

Change `LLM_BASE_URL` and `LLM_MODEL` in your `.env` file to point to any OpenAI-compatible endpoint.

---

## Calling the GitHub API

```python
github_token = request.headers.get('X-GitHub-Token')
resp = requests.get(
    'https://api.github.com/user',
    headers={'Authorization': f'Bearer {github_token}'}
)
user = resp.json()
```
