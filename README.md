# AI Content Pipeline — Gemini × DeepSeek

A Next.js app that generates SEO content by having two LLMs **collaborate instead of just being compared**: Gemini drafts, DeepSeek critiques, Gemini reconciles — with the diff between the draft and final version shown to the user.

## Why this is different

Most "compare two AI models" projects just show two outputs side by side. This project instead builds a **3-stage pipeline** where each model's output feeds into the next, demonstrating multi-agent orchestration rather than a simple API comparison.

## Pipeline

1. **Draft** — Gemini generates SEO metadata and a content draft from user input
2. **Critique** — DeepSeek reviews the draft against a strict rubric: unsupported claims, keyword stuffing, logical gaps (DeepSeek's reasoning strength is used deliberately here)
3. **Reconcile** — Gemini merges the critique into a final version

The UI streams each stage as it completes (draft → critique → final) rather than waiting for the whole pipeline to finish, and shows a diff between the original draft and the reconciled output so the user can see exactly what the critique step changed.

## Production Use Cases

Single-prompt LLMs frequently suffer from sycophantic validation (validating their own hallucinations) and superficial fluff ("In conclusion...", vague generalities). By pitting Gemini and DeepSeek against each other with a strict rubric, this architecture is designed for:

1. **High-Conviction Technical SEO & Developer Content**
   - Eliminates generic filler and unsubstantiated claims that hurt reader retention and bounce rates.
   - DeepSeek audits drafts to strip clichés, verify assertions, and ensure actionable density.
   - *Example: "Kubernetes Ingress Controllers vs. Gateway API: Architecture & Migration"*

2. **Developer Documentation & "How-To" Guides**
   - DeepSeek acts as a hardened Principal Engineer checking for framework deprecations, syntax errors, and missing edge cases.
   - Produces clean, copy-ready Markdown for documentation engines (Docusaurus, Mintlify, Nextra, GitBook).

3. **Engineering RFCs & Architecture Decision Records (ADRs)**
   - Gemini drafts system proposals from high-level seed requirements.
   - DeepSeek plays devil's advocate, identifying single points of failure, scalability bottlenecks, and consistency trade-offs before team review.

4. **Automated CI/CD Documentation Audits (via `/api/generate`)**
   - Integrates into GitHub Actions or repository webhooks when new `.md`/`.mdx` PRs are submitted.
   - Automatically runs adversarial critique passes and posts line-level feedback directly onto pull requests.

5. **Headless CMS & Staged Publishing Automation**
   - Converts raw release notes, GitHub diffs, or product specs into structured technical articles.
   - Pushes reconciled content directly to CMS platforms (e.g., WordPress REST API, Ghost, Hashnode).

### Supported Interfaces

- **Interactive Workspace (`/`)**: Clean web UI with topic chips, expandable rubric editor, live SSE stage streaming, and word-level diff viewer.
- **Streaming Endpoint (`/api/stream`)**: Server-Sent Events (SSE) route delivering live updates (`stage_complete`, `status`, `done`) to client applications.
- **Headless Endpoint (`/api/generate`)**: Standard JSON `POST` endpoint for CLI tools, cron jobs, and CI/CD pipelines.

## Tech Stack

- **Next.js (App Router)** — API routes + streaming responses
- **Gemini API** — draft generation + reconciliation
- **DeepSeek API** — critique/review pass
- **Server-Sent Events / streaming** — live pipeline progress in the UI
- **`diff` (npm)** — draft vs. final comparison

## Project Structure

```
/app
  /api
    /generate/route.ts     # orchestrates the 3-step pipeline
    /stream/route.ts       # SSE/streaming endpoint for live progress
    /publish/route.ts      # (optional) pushes final content to WordPress
  /dashboard
    page.tsx               # input form + streaming results view
/lib
  /ai
    gemini.ts              # Gemini API wrapper
    deepseek.ts            # DeepSeek API wrapper
    pipeline.ts            # 3-step orchestration logic
  diff.ts                  # text diffing utility
```

## Setup

```bash
npm install
cp .env.example .env.local
```

Add your API keys to `.env.local`:

```
GEMINI_API_KEY=your_key_here
DEEPSEEK_API_KEY=your_key_here
WP_APPLICATION_PASSWORD=optional_for_publish_feature
WP_SITE_URL=optional_for_publish_feature
```

```bash
npm run dev
```

## Roadmap / Optional Extensions

- [ ] `/api/publish` — push the final reconciled content directly to a WordPress site as a draft post via the WP REST API (`POST /wp-json/wp/v2/posts`)
- [ ] Model-agnostic pipeline config — swap which model handles draft/critique/reconcile
- [ ] Persist pipeline runs (draft, critique, final, diff) for later review
- [ ] Rubric editor — let users customize the critique criteria DeepSeek is given

## Notes

- Keep the critique prompt rubric-based, not open-ended ("flag unsupported claims, keyword stuffing, and logical gaps only") — vague prompts produce vague, stylistic nitpicks instead of substantive review.
- Favor Next.js Server Components + local `useState` over Redux/Zustand for this project; the pipeline's state is simple enough that heavier state management adds complexity without benefit.