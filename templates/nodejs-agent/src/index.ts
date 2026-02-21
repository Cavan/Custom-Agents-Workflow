import 'dotenv/config';
import express, { Request, Response } from 'express';
import { verifySignature } from './verify';
import { startSSE, writeToken, endSSE, pipeStream } from './stream';

const app = express();
const PORT = process.env.PORT || 3000;

// ---------------------------------------------------------------------------
// System prompt — customise this to give your agent its persona and knowledge.
// ---------------------------------------------------------------------------
const SYSTEM_PROMPT = `You are a helpful assistant built with GitHub Copilot Extensions.
You have deep knowledge of software development and GitHub.
Be concise, accurate, and friendly.`;

// ---------------------------------------------------------------------------
// LLM configuration — defaults to GitHub Models (free during development).
// Set LLM_BASE_URL and LLM_API_KEY env vars to use a different provider.
// ---------------------------------------------------------------------------
const LLM_BASE_URL =
  process.env.LLM_BASE_URL ?? 'https://models.inference.ai.azure.com';
const LLM_MODEL = process.env.LLM_MODEL ?? 'gpt-4o';

// ---------------------------------------------------------------------------
// Raw body parsing — required for ECDSA signature verification.
// We store the raw bytes on req so the verification function can use them.
// ---------------------------------------------------------------------------
app.use(
  express.json({
    verify: (req: Request & { rawBody?: Buffer }, _res, buf) => {
      req.rawBody = buf;
    },
  })
);

// ---------------------------------------------------------------------------
// Main inference endpoint — GitHub Copilot sends all chat turns here.
// ---------------------------------------------------------------------------
app.post('/', async (req: Request & { rawBody?: Buffer }, res: Response) => {
  // 1. Verify the request really came from GitHub Copilot.
  const keyId = req.headers['x-github-public-key-identifier'] as string;
  const signature = req.headers['x-github-public-key-signature'] as string;

  if (!keyId || !signature || !req.rawBody) {
    res.status(400).json({ error: 'Missing signature headers' });
    return;
  }

  try {
    await verifySignature(req.rawBody, keyId, signature);
  } catch (err) {
    console.error('Signature verification failed:', err);
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  // 2. Extract the conversation messages and the user's GitHub token.
  const messages: { role: string; content: string }[] = req.body.messages ?? [];
  const githubToken = req.headers['x-github-token'] as string | undefined;

  // 3. Optionally call the GitHub API to fetch context.
  //    Example: get the authenticated user's login.
  let contextNote = '';
  if (githubToken) {
    try {
      const userRes = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${githubToken}`,
          'User-Agent': 'copilot-agent-template',
        },
      });
      if (userRes.ok) {
        const user = (await userRes.json()) as { login: string };
        contextNote = `\n\nThe user's GitHub login is: ${user.login}`;
      }
    } catch {
      // GitHub API call is optional — continue without it.
    }
  }

  // 4. Build the messages array for the LLM.
  const llmMessages = [
    { role: 'system', content: SYSTEM_PROMPT + contextNote },
    ...messages.filter((m) => m.role !== 'system'),
  ];

  // 5. Start streaming the SSE response back to Copilot Chat.
  startSSE(res);

  // 6. Call the LLM (GitHub Models by default; replace with any OpenAI-compatible API).
  const llmApiKey = githubToken ?? process.env.LLM_API_KEY ?? '';

  let llmResponse: globalThis.Response;
  try {
    llmResponse = await fetch(`${LLM_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${llmApiKey}`,
        'User-Agent': 'copilot-agent-template',
      },
      body: JSON.stringify({
        model: LLM_MODEL,
        messages: llmMessages,
        stream: true,
      }),
    });
  } catch (err) {
    console.error('LLM request failed:', err);
    writeToken(res, 'Sorry, I encountered an error contacting the model.');
    endSSE(res);
    return;
  }

  if (!llmResponse.ok || !llmResponse.body) {
    const errText = await llmResponse.text().catch(() => 'unknown error');
    console.error('LLM error response:', errText);
    writeToken(res, 'Sorry, the model returned an error.');
    endSSE(res);
    return;
  }

  // 7. Pipe the LLM's SSE stream directly to the client.
  await pipeStream(llmResponse.body, res);
  endSSE(res);
});

// ---------------------------------------------------------------------------
// Health check
// ---------------------------------------------------------------------------
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Agent server running on http://localhost:${PORT}`);
});
