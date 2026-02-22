import type { Response } from 'express';

/**
 * Writes the SSE headers required by GitHub Copilot.
 * Call this before sending any data chunks.
 */
export function startSSE(res: Response): void {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Transfer-Encoding', 'chunked');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();
}

/**
 * Sends a single content token as an OpenAI-compatible SSE delta.
 *
 * @param res   - Express response object
 * @param token - The text token to stream
 */
export function writeToken(res: Response, token: string): void {
  const chunk = JSON.stringify({
    choices: [{ delta: { content: token }, index: 0 }],
  });
  res.write(`data: ${chunk}\n\n`);
}

/**
 * Sends the final [DONE] event and ends the response.
 *
 * @param res - Express response object
 */
export function endSSE(res: Response): void {
  res.write('data: [DONE]\n\n');
  res.end();
}

/**
 * Pipes an OpenAI-compatible streaming response directly to the SSE client.
 * Works with any provider that returns `text/event-stream` (OpenAI, GitHub Models, Azure OpenAI).
 *
 * @param llmStream - ReadableStream from the LLM fetch response body
 * @param res       - Express response object (SSE headers must already be sent)
 */
export async function pipeStream(
  llmStream: ReadableStream<Uint8Array>,
  res: Response
): Promise<void> {
  const reader = llmStream.getReader();
  const decoder = new TextDecoder();

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const text = decoder.decode(value, { stream: true });
      // Forward each SSE line from the LLM directly to the client.
      for (const line of text.split('\n')) {
        if (line.trim()) {
          res.write(line + '\n');
        }
      }
      res.write('\n');
    }
  } finally {
    reader.releaseLock();
  }
}
