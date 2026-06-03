<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project: ip-address

Minimal Next.js 16 App Router project (no custom code yet — just the `create-next-app` scaffold).

## Commands

- `npm run dev` — dev server (Turbopack, no `--turbopack` flag needed)
- `npm run build` — production build (Turbopack by default; use `--webpack` to opt out)
- `npm run lint` — ESLint flat config (`eslint.config.mjs`)
- `npm start` — production server

## Next.js 16 quirks (easily missed)

- **Async Request APIs**: `params`, `searchParams`, `cookies`, `headers`, `draftMode` are all async-only. Synchronous access was removed. Always `await`.
- **No `next lint`**: The `next lint` command was removed. Run `npm run lint` (calls `eslint` directly). `next build` no longer runs linting.
- **`cacheLife` / `cacheTag`**: Stable names now — no `unstable_` prefix needed. Import from `'next/cache'`.
- **`revalidateTag`** requires a second argument — a `cacheLife` profile string.
- **`proxy.ts` instead of `middleware.ts`**: If adding middleware, use `proxy.ts` with an exported `proxy` function. The `middleware` convention is deprecated.
- **`next dev` outputs to `.next/dev`** (separate from build output in `.next`).
- **`next/image` defaults changed**: `minimumCacheTTL` is now 4h, `qualities` defaults to `[75]`, 16px removed from `imageSizes`, local images with query strings need `localPatterns.search`.
- **No `serverRuntimeConfig` / `publicRuntimeConfig`**: Use env vars or `NEXT_PUBLIC_` prefix.
- **`reactCompiler`** config is stable (opt-in, not default).
- **ESLint flat config** (`eslint.config.mjs`) — no `.eslintrc.*`.

## Stack

- Next.js 16.2.7 + React 19.2.4
- TypeScript 5+, Tailwind CSS 4 (`@tailwindcss/postcss`)
- Path alias `@/*` maps to project root
