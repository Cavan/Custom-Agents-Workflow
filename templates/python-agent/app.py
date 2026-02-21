"""
GitHub Copilot Agent — Python / Flask template.

This is the main entry point for the agent. It:
  1. Verifies the ECDSA signature on every inbound Copilot request.
  2. Optionally calls the GitHub API to enrich the system prompt with user context.
  3. Forwards the conversation to the GitHub Models API (or any OpenAI-compatible LLM).
  4. Streams the response back to Copilot Chat as Server-Sent Events.
"""

import os
import requests

from dotenv import load_dotenv
from flask import Flask, Response, jsonify, request, stream_with_context

from verify import verify_signature
from stream import sse_error, sse_done, pipe_openai_stream

load_dotenv()

app = Flask(__name__)

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
PORT = int(os.environ.get("PORT", 5000))

# Customise this to give your agent its persona and specialised knowledge.
SYSTEM_PROMPT = (
    "You are a helpful assistant built with GitHub Copilot Extensions. "
    "You have deep knowledge of software development and GitHub. "
    "Be concise, accurate, and friendly."
)

LLM_BASE_URL = os.environ.get(
    "LLM_BASE_URL", "https://models.inference.ai.azure.com"
)
LLM_MODEL = os.environ.get("LLM_MODEL", "gpt-4o")


# ---------------------------------------------------------------------------
# Inference endpoint — GitHub Copilot sends all chat turns here.
# ---------------------------------------------------------------------------
@app.route("/", methods=["POST"])
def infer():
    # 1. Verify the request signature.
    key_id = request.headers.get("X-GitHub-Public-Key-Identifier", "")
    signature = request.headers.get("X-GitHub-Public-Key-Signature", "")
    raw_body = request.get_data()

    if not key_id or not signature:
        return jsonify({"error": "Missing signature headers"}), 400

    try:
        verify_signature(raw_body, key_id, signature)
    except Exception as exc:
        app.logger.error("Signature verification failed: %s", exc)
        return jsonify({"error": "Unauthorized"}), 401

    # 2. Extract messages and the user's GitHub token.
    payload = request.get_json(force=True) or {}
    messages = payload.get("messages", [])
    github_token = request.headers.get("X-GitHub-Token", "")

    # 3. Optionally enrich the system prompt with GitHub context.
    context_note = ""
    if github_token:
        try:
            user_resp = requests.get(
                "https://api.github.com/user",
                headers={
                    "Authorization": f"Bearer {github_token}",
                    "User-Agent": "copilot-agent-template",
                },
                timeout=5,
            )
            if user_resp.ok:
                login = user_resp.json().get("login", "")
                context_note = f"\n\nThe user's GitHub login is: {login}"
        except Exception:
            pass  # GitHub API call is optional — continue without it.

    # 4. Build the LLM messages array.
    llm_messages = [
        {"role": "system", "content": SYSTEM_PROMPT + context_note},
        *[m for m in messages if m.get("role") != "system"],
    ]

    # 5. Determine the API key (prefer X-GitHub-Token for GitHub Models).
    api_key = github_token or os.environ.get("LLM_API_KEY", "")

    # 6. Call the LLM and stream the response back.
    def generate():
        try:
            llm_resp = requests.post(
                f"{LLM_BASE_URL}/chat/completions",
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {api_key}",
                    "User-Agent": "copilot-agent-template",
                },
                json={
                    "model": LLM_MODEL,
                    "messages": llm_messages,
                    "stream": True,
                },
                stream=True,
                timeout=30,
            )
            llm_resp.raise_for_status()
        except Exception as exc:
            app.logger.error("LLM request failed: %s", exc)
            yield from sse_error("Sorry, I encountered an error contacting the model.")
            return

        yield from pipe_openai_stream(llm_resp)
        yield sse_done()

    return Response(
        stream_with_context(generate()),
        content_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------
@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=PORT, debug=False)
