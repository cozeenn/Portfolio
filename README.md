# Reo Tan — Portfolio

An advanced, responsive portfolio built with Next.js, TypeScript, Tailwind CSS, and a server-side Groq assistant.

## Local development

Requirements: Node.js 20.9 or newer.

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Groq assistant

Copy `.env.example` to `.env.local`, then replace the placeholder with a Groq API key:

```env
GROQ_API_KEY=gsk_your_real_key
GROQ_MODEL=openai/gpt-oss-20b
```

`GROQ_MODEL` is optional. The API route already defaults to `openai/gpt-oss-20b`. Keep `GROQ_API_KEY` server-side and never prefix it with `NEXT_PUBLIC_`.

## Quality checks

```bash
npm run typecheck
npm run lint
npm run build
npm audit
```

## Deployment

Import this repository into Vercel as a Next.js project, add `GROQ_API_KEY` under Project Settings → Environment Variables, and redeploy. If an older `GROQ_MODEL` value exists in Vercel, update it to `openai/gpt-oss-20b` or remove it to use the built-in default.

The API route includes a best-effort per-instance rate limit. For a public production deployment, also add a Vercel WAF rate-limit rule for `POST /api/chat` (or connect a shared Redis-backed limiter) to protect Groq usage across serverless instances.

## Featured work

- [JS VirtuAssist](https://jsvirtuassist.vercel.app/#top)
- [Carlito's Swimming Pool Resort](https://carlitos-swimming-pool-resort.ct.ws/)
- [LifeTag](https://cozeenn.github.io/lifetag/)
