# Second Brain Assistant

A personal assistant built **from scratch** in TypeScript, growing one small increment at a
time. The goal is twofold: **learn the core concepts of building AI agents** and end up with a
**genuinely useful second brain assistant**.

## Planned features

1. **Learning assistant** — capture problem areas at the end of the day, create learning
   plans, explain how a topic fits among other technologies, find gaps in fundamentals,
   suggest focus areas, and assess progress over time.
2. **Research helper** — find related topics and present key points with the ability to drill
   deeper.
3. **Week / day planner** — plan days and weeks, connected to your calendar.
4. **Future** — language-learning assistant.

## Tech choices

- **Language:** TypeScript + Node, minimal dependencies (`zod`; LLM calls via raw `fetch`).
- **Interface:** CLI / terminal REPL (to start).
- **Provider:** OpenRouter first (OpenAI-compatible API). Multiple providers **and local
  models** (Ollama / LM Studio / llama.cpp / vLLM) can be added later behind the same seam.

## Architecture seams (locked in from day one)

Small, stable interfaces so every later feature slots in without rewrites:

1. **Provider gateway** — a neutral `AiProvider` interface (`generate` / `stream`) with a
   canonical request/response shape. Hosted providers and local runtimes all speak an
   OpenAI-compatible `/chat/completions`, so swapping models is mostly a `baseURL` + model-id
   change.
2. **Tool ABI** — `ToolSpec { name, description, inputSchema, validate, execute(ctx, args) }`
   - an in-memory `ToolRegistry` + a `ToolContext`. Every capability is a tool.
3. **Turn loop** — `assemble context → call model → if tool calls: execute + re-inject results
   - repeat, else: finish`. Bounded by a max-steps limit.
4. **Result/error discipline** — a `Result<T,E>` type and structured errors with model-facing
   recovery hints.

---

## MVP

A terminal REPL that talks to a model via OpenRouter and reads/writes your learning notes
through a tool loop.

**Scope**

- **Provider adapter** behind the `AiProvider` interface, calling OpenRouter with raw `fetch`.
  Non-streaming `generate` first; keep the interface stream-ready.
- **Turn loop** with a max-steps limit; conversation held in memory for the session.
- **Tools:** `read_note(path)`, `write_note(path, content)`, `list_notes()`, sandboxed to
  `notes/`.
- **System prompt** loaded from `prompts/agent.md`.
- **Crude trace log:** append every LLM + tool call to `traces/*.jsonl` from day one.

**Suggested layout**

```
src/provider/   # AiProvider interface + openrouter adapter (fetch)
src/tools/      # ToolSpec, registry, fs note tools
src/agent/      # turn loop, context assembly, prompt loader
src/cli/        # REPL entry
src/shared/     # Result, ids, logger, trace
notes/          # learning garden (starts here)
prompts/agent.md
```

**Env:** `OPENROUTER_API_KEY`, `MODEL`.

**Concepts covered:** stateless API, context window, function-calling loop, tool design,
minimal filesystem+memory agent.

**Done when:** "note down that I struggled with TS generics today" writes a note, and "what
have I struggled with?" reads it back — both via the tool loop, with calls logged to a trace
file.

**Proposed notes structure (grows over time)**

```
notes/
  _index.md                  # the map the agent navigates
  topics/<tech>.md           # frontmatter: status, confidence, related[], last_reviewed
  daily/YYYY-MM-DD.md        # end-of-day: learned, problem areas
  plans/<plan>.md            # learning + week/day plans
  research/<topic>.md        # findings with drill-down sections
  memory/progress.md         # assessed progress + suggested focus
```

---

## Additional functionalities (roadmap menu)

Each item is an optional, independently valuable increment. Pick the next one based on what
you want to use or learn.

### Summary

| #   | Functionality                            | Concepts / topics it covers                                                          |
| --- | ---------------------------------------- | ------------------------------------------------------------------------------------ |
| 1   | Structured capture + end-of-day workflow | Structured output (JSON Schema), tool design, forgiving validation, recovery hints   |
| 2   | Context engineering + linked garden      | System prompt as a map, prompt-cache discipline, token limits, breadcrumb navigation |
| 3   | Long-term memory + progress assessment   | Observational memory (observer/reflector), knowledge base for agents                 |
| 4   | Research helper (web search)             | Agentic RAG, native vs custom tools, prompt-injection safety                         |
| 5   | Planning + calendar (MCP)                | Model Context Protocol, trusted tools, human confirmation                            |
| 6   | Observability + evaluation               | Tracing hierarchy, offline/online evals, tool-selection scoring                      |
| 7   | Production backbone + scheduled habits   | Job/Run/Item model, scheduler, resumable jobs, autonomous triggers                   |
| 8   | Multi-provider + local models + safety   | Provider gateway, model strategy, local models, moderation                           |
| 9   | Multi-agent + interface                  | Multi-agent architectures, delegation, streaming UI, Code Mode                       |
| 10  | Multimodality (opportunistic)            | Attachments, image/audio, STT/TTS                                                    |
| 11  | Self-improving prompts                   | Automatic prompt optimization, DSPy/AX signatures                                    |
| F   | Language-learning agent (future)         | Profile-by-tools, spaced repetition                                                  |

### 1. Structured capture + end-of-day workflow

Add a `capture_learning(topic, learned, problemAreas, confidence)` tool that writes structured
markdown + frontmatter, a `daily_review` workflow, `search_notes`, and per-session transcript
persistence. zod-validated args with verbose, hint-rich errors so the model self-recovers.

- **Serves:** "collect problematic areas at end of day."
- **Concepts:** JSON Schema / structured output; "don't map APIs 1:1"; smart defaults;
  forgiving validation; `hints` / `recoveryHints`.

### 2. Context engineering + linked garden

Stable system prompt + dynamic `<context>` block (date, garden index) injected into the latest
user message for prompt-cache discipline; session persist/resume; wikilinks + `_index.md` map;
navigation tools (scan → deepen → read); token-budget estimation + history trimming.

- **Serves:** "explain a topic in context of others"; resumable sessions.
- **Concepts:** system prompt as a map not a database; signal vs noise; cache-hit discipline;
  attention steering; long-context degradation; token estimation and early compression.

### 3. Long-term memory + progress assessment

An observer pass writes short observations after context compaction; a reflector condenses
them into `memory/progress.md`; tools query progress and gaps.

- **Serves:** "assess progress," "find where I'm lagging," "suggest focus."
- **Concepts:** observational memory (observer/reflector); building knowledge bases _for_
  agents; "human owns content, AI owns organization"; notes that assume zero prior context.

### 4. Research helper (web search)

A web search tool (Brave / Tavily / Firecrawl / Jina) plus an agentic deepen/expand loop;
research notes written with a drill-down structure into `notes/research/`.

- **Serves:** research pillar; topic-in-context.
- **Concepts:** agentic RAG (scan → deepen → identify gaps → iterate); native vs custom tools;
  hybrid search; prompt-injection safety on fetched content.

### 5. Planning + calendar (MCP)

Google Calendar via an MCP server (read schedule first); learning-plan and week/day-plan
generation grounded in progress notes + calendar; human confirmation for any calendar writes.

- **Serves:** planner pillar.
- **Concepts:** Model Context Protocol (host/client/server, transports); trusted-tools list;
  deterministic (non-LLM) confirmation for irreversible actions.

### 6. Observability + evaluation

Formalize a logging layer (JSONL traces or Langfuse) wrapping provider + tool calls; a small
eval harness (custom or Promptfoo) with tool-selection cases + synthetic data.

- **Serves:** confidence when changing prompts/models; debugging non-obvious behavior.
- **Concepts:** observability hierarchy (Session/Trace/Span/Generation/Tool/Event); evals as
  0–1 "good enough" scoring; offline vs online; tool-selection as the highest-value eval;
  synthetic test data.

### 7. Production backbone + scheduled habits

Move from an in-process loop to SQLite-backed queued/resumable runs; background tasks; cron
triggers for automatic end-of-day capture, weekly progress review, and a morning plan digest.

- **Serves:** turning capabilities into habits; "assess progress over time."
- **Concepts:** production data model (Tenant → Account → Workspace → Sessions → Threads →
  Messages; Jobs/Runs/Items/Dependencies); agent runtime lifecycle; messages as resumable
  jobs; crash recovery; autonomous triggers (cron / webhook / heartbeat).

### 8. Multi-provider + local models + safety

A second hosted provider behind the same seam; model aliases + primary/fallback routing; a
**local** adapter pointing at an OpenAI-compatible endpoint (Ollama, LM Studio, llama.cpp,
vLLM) for privacy/offline/cost; per-model capability flags so the router degrades gracefully
when a small local model lacks tool-calling; moderation gate on inputs/outputs.

- **Serves:** "use local models"; provider independence.
- **Concepts:** AI Gateway pattern; provider translation (system-message placement, reasoning
  config, ordering); model strategy (single / primary+fallback / specialist); watching
  open/local models for cost & privacy; moderation.

### 9. Multi-agent + interface

Specialized agents (tutor / researcher / planner) with `delegate` + file references; optional
Code Mode (agent writes/executes TS in a sandbox); an interface that fits your routine (web
chat, Discord, or voice) + a daily digest pipeline; deploy so background tasks run.

- **Serves:** multi-step pipelines (research → write → plan); delivery into daily routine.
- **Concepts:** multi-agent architectures (Pipeline / Orchestrator / Blackboard);
  `delegate` / `message`; progressive disclosure; streaming render + sanitization; Code Mode;
  references between agents.

### 10. Multimodality (opportunistic)

Slot in when a use case demands it: image generation/analysis, audio notes, STT/TTS for voice
capture or an audio digest.

- **Concepts:** multimodal model landscape; the attachment-referencing problem; image
  generation with an analysis tool; STT/TTS vs multimodal vs realtime.

### 11. Self-improving prompts (experimental)

An offline loop that analyzes → optimizes → evaluates prompts, or signature-based frameworks
(DSPy / AX) that replace hand-written prompts with input/task/output signatures.

- **Concepts:** automatic prompt optimization; smaller model executes, stronger model
  observes/optimizes; DSPy/AX signatures + generated few-shot demos.

### F. Language-learning agent (future)

A new specialized agent + spaced-repetition tools reusing the same garden and memory.

- **Concepts:** an agent's profile changes via tools, not code.

---

## Cross-cutting (throughout, not at the end)

- **Security** — moderation, no phantom capabilities, jailbreak-aware editing rules, treat the
  system prompt as public.
- **Evals grow with the system** — add cases whenever you add tools.

## Working method

Each functionality is one reviewable increment: build → format + lint + a manual smoke test →
report what changed / what was validated / what's next → decide on the next increment.
