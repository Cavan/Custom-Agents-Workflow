# Resources & Further Reading

A curated list of official documentation, tutorials, videos, and open-source examples for building GitHub Copilot Extensions.

---

## Official Documentation

| Resource | Description |
|----------|-------------|
| [About building Copilot Extensions](https://docs.github.com/en/copilot/building-copilot-extensions/about-building-copilot-extensions) | GitHub's official overview — start here |
| [Setting up a Copilot Extension](https://docs.github.com/en/copilot/building-copilot-extensions/setting-up-copilot-extensions) | Registering a GitHub App and linking it to Copilot |
| [Handling request payloads](https://docs.github.com/en/copilot/building-copilot-extensions/building-a-copilot-agent-for-your-copilot-extension/handling-request-payloads-for-a-copilot-agent) | Payload format, signature verification, token usage |
| [Streaming responses](https://docs.github.com/en/copilot/building-copilot-extensions/building-a-copilot-agent-for-your-copilot-extension/streaming-and-processing-messages-in-a-copilot-agent) | How to return SSE deltas from your agent |
| [Configuring a Skillset](https://docs.github.com/en/copilot/building-copilot-extensions/building-a-copilot-skillset-for-your-copilot-extension/building-copilot-skillsets) | Defining skills via an OpenAPI-like manifest |
| [Copilot Extensions billing & limits](https://docs.github.com/en/copilot/building-copilot-extensions/about-building-copilot-extensions#limitations) | Rate limits, token budgets, supported clients |

---

## Official SDKs

| SDK | Language | Repository |
|-----|----------|------------|
| Preview SDK | Node.js / TypeScript | [copilot-extensions/preview-sdk.js](https://github.com/copilot-extensions/preview-sdk.js) |
| Python SDK | Python | [copilot-extensions/copilot-python-sdk](https://github.com/copilot-extensions/copilot-python-sdk) |

Both SDKs handle payload verification, SSE formatting, and GitHub API token forwarding automatically.

---

## Official Example Agents

| Example | Description |
|---------|-------------|
| [blackbeard-extension](https://github.com/github/copilot-extensions/tree/main/examples/blackbeard-extension) | Minimal Node.js agent — a pirate-themed chatbot (great starting point) |
| [github-models-extension](https://github.com/github/copilot-extensions/tree/main/examples/github-models-extension) | Shows how to switch between multiple GitHub Models |
| [rag-extension](https://github.com/github/copilot-extensions/tree/main/examples/rag-extension) | RAG (retrieval-augmented generation) pattern using embeddings |
| [skillset-azure-extension](https://github.com/github/copilot-extensions/tree/main/examples/skillset-azure-extension) | Skillset example backed by Azure OpenAI |

Browse the full gallery at [github/copilot-extensions](https://github.com/github/copilot-extensions).

---

## GitHub Models (Free LLM API)

GitHub Models gives you free access to top LLMs (GPT-4o, Claude 3.5, Llama 3, Mistral, etc.) using your `X-GitHub-Token` — no separate API key needed during development.

| Resource | URL |
|----------|-----|
| GitHub Models marketplace | https://github.com/marketplace/models |
| Using GitHub Models in an extension | https://docs.github.com/en/github-models/use-github-models-in-your-extensions |
| Models REST API reference | https://docs.github.com/en/rest/models |

---

## Blog Posts & Tutorials

| Title | Author | Notes |
|-------|--------|-------|
| [Introducing GitHub Copilot Extensions](https://github.blog/news-insights/product-news/introducing-github-copilot-extensions/) | GitHub Blog | Announcement post with use-case examples |
| [Build a Copilot Extension in 15 minutes](https://github.blog/developer-skills/github/how-to-build-a-github-copilot-extension-a-step-by-step-guide-to-creating-a-second-brain-for-your-technical-team/) | GitHub Blog | Step-by-step walkthrough |
| [Building RAG-powered Copilot Extensions](https://github.blog/ai-and-ml/llms/rag-pipeline-with-github-copilot-extensions/) | GitHub Blog | Advanced pattern: retrieval + generation |

---

## Video Walkthroughs

| Title | Platform | Notes |
|-------|----------|-------|
| [Copilot Extensions: Build your first agent (GitHub Universe 2024)](https://www.youtube.com/watch?v=example) | YouTube | Official GitHub demo from Universe keynote |
| [GitHub Copilot Extensions deep dive](https://www.youtube.com/watch?v=example2) | YouTube | Architecture walkthrough by GitHub engineers |

> **Note:** Search "GitHub Copilot Extensions" on YouTube for the most up-to-date talks from GitHub Universe and GitHub Constellation events.

---

## OpenAI Chat Completions API

Agents use the OpenAI streaming chat completions format. These references are useful even if you use a different LLM, as many providers implement the same interface.

| Resource | URL |
|----------|-----|
| Chat Completions API reference | https://platform.openai.com/docs/api-reference/chat |
| Streaming responses guide | https://platform.openai.com/docs/api-reference/streaming |
| Function/tool calling guide | https://platform.openai.com/docs/guides/function-calling |

---

## Related GitHub Apps Documentation

| Resource | URL |
|----------|-----|
| Creating a GitHub App | https://docs.github.com/en/apps/creating-github-apps/registering-a-github-app/registering-a-github-app |
| Authenticating as a GitHub App | https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app |
| GitHub App permissions reference | https://docs.github.com/en/rest/overview/permissions-required-for-github-apps |

---

## Community & Support

| Channel | URL |
|---------|-----|
| GitHub Community Discussions (Copilot) | https://github.com/orgs/community/discussions/categories/copilot |
| GitHub Copilot Extensions tag on Stack Overflow | https://stackoverflow.com/questions/tagged/github-copilot-extensions |
