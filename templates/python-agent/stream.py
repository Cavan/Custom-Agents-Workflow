"""
SSE (Server-Sent Events) streaming helpers for GitHub Copilot agents.

GitHub Copilot expects responses in OpenAI streaming delta format:
    data: {"choices":[{"delta":{"content":"token"},"index":0}]}
    ...
    data: [DONE]
"""

import json
from typing import Generator


def sse_token(token: str) -> str:
    """
    Formats a single text token as an SSE data line.

    Args:
        token: The text content to send.

    Returns:
        A formatted SSE data line string.
    """
    chunk = json.dumps({"choices": [{"delta": {"content": token}, "index": 0}]})
    return f"data: {chunk}\n\n"


def sse_done() -> str:
    """Returns the final SSE [DONE] event."""
    return "data: [DONE]\n\n"


def sse_error(message: str) -> Generator[str, None, None]:
    """
    Yields an error message token followed by [DONE].

    Args:
        message: Human-readable error description.
    """
    yield sse_token(message)
    yield sse_done()


def pipe_openai_stream(response) -> Generator[str, None, None]:
    """
    Pipes an OpenAI-compatible streaming HTTP response as SSE lines.

    Works with any provider that returns `text/event-stream` in the same
    format as OpenAI (GitHub Models, Azure OpenAI, etc.).

    Args:
        response: A `requests.Response` object with `stream=True`.

    Yields:
        Raw SSE line strings to be written directly to the Flask response.
    """
    for line in response.iter_lines(decode_unicode=True):
        if line:
            yield line + "\n"
        else:
            yield "\n"
