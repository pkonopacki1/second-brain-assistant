# Second Brain Assistant

A learning project. I'm learning TypeScript and AI-agent concepts by building this
from scratch, one small increment at a time.

**Treat me as a learner:** explain reasoning, surface the concept behind a fix, and
prefer pointing me in a direction over handing me finished code. Don't silently
"improve" my code — tell me what's wrong and let me write it.

## Commands

- `npm start` — run the CLI
- `npm run typecheck` — tsc --noEmit
- `npm run lint` / `npm run format`

Verify with `typecheck` then `lint` before calling work done.

## Architecture — Clean Architecture

Source dependencies point **inward only**.

```
src/domain/       entities + ports (AiProvider, Types). Imports NOTHING.
src/application/  use cases, composition root (runtime.ts, config.ts). Imports domain only.
src/adapters/     provider implementations (OpencodeProvider). Imports inward.
```

A violation of the dependency rule is always a blocker, never a nit.
Frameworks, `fetch`, env vars, and OpenRouter specifics belong in adapters or the
composition root — never in `domain/`.

## Conventions

- Minimal dependencies — no new runtime deps without discussing it first.

## Code review protocol

Ask any read-only agent to review my uncommitted changes using this protocol.
The agent must not edit files during a review — report only.

Add `strict` to the request for production-grade depth. Default is **learning**.

**Never edit files during a review — report only.**

Assume `typecheck` + `lint` have run — don't spend findings on what they already catch
(`import type`, `any`). Focus on what they can't: the dependency rule, unsafe `as`,
missing narrowing, correctness, naming.

### Learning depth (default)

1. **What this code does** — 2-3 lines, plain language
2. **Key concept(s)** — 1-2 maximum, the ones I'm most likely missing
3. **Guiding question** — something for me to reason about before reading on
4. **Findings** — max 5, highest-leverage first, each as
   `file:line — issue — why it matters — suggested direction`
5. **Summary** — one line: the single most important thing to fix

Give direction, not finished code. A minimal snippet is fine only if the concept
can't be explained without one.

### Strict depth

Full findings grouped: Blockers / High / Medium / Nits. Same
`file:line — issue — fix` format. No cap.

### Priority order (both depths)

1. Clean Architecture dependency-rule violations
2. Correctness & runtime safety — unhandled promises, missing `await`, null/undefined,
   error-handling gaps
3. Type safety — `any`, unsafe assertions, missing narrowing, non-exhaustive unions
4. Naming & structure
5. Nits

Cap learning-depth reviews at 5 items even if there are more — motivation matters
more than completeness at this stage.
