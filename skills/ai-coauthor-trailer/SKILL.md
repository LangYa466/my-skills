---
name: ai-coauthor-trailer
description: "Pick the `Co-Authored-By:` trailer for an AI model so GitHub links it to a real account, or omit it when no such account exists. Covers Claude, GPT/Codex, Gemini, Grok, Qwen, Mistral, DeepSeek, Kimi, GLM, MiniMax, Llama, and agent products (Copilot, Cursor, Amp, Devin, Jules). Use when writing a commit or PR with AI attribution, or when checking whether a vendor has a linkable GitHub identity."
metadata:
  verified: "2026-11-27"
---

# AI co-author trailers

GitHub shows a co-author avatar only when the trailer email is a **verified email of a User or Bot account**. Organization accounts cannot author commits, so `<id>+<org>@users.noreply.github.com` never links, and neither does an invented vendor address such as `noreply@deepseek.com`.

Rule: add the trailer only if the model's vendor owns a linkable account below. Otherwise omit it.

```text
Co-Authored-By: <Model Name> <email from the table>
```

- `<Model Name>`: the model actually running, from the runtime context (`Model: <provider>/<model-id>`), e.g. `DeepSeek V4.1 Flash`, `Claude Opus 5.5`. Never copy a name from an example.
- Choose the row by the **model name**, not the routing provider (`moff`, `ds`, `official`, `sub2api`, `skiapi`, `openrouter` are routers).
- Model unknown → omit.

## Models with a linkable account

| Model name contains | Email | Links to | Ownership evidence |
| --- | --- | --- | --- |
| `claude` | `noreply@anthropic.com` | [`claude`](https://github.com/claude) (User 81847) | company `@anthropics`, blog anthropic.com/claude-code |
| `gpt`, `o1`/`o3`/`o4`…, `codex` | `noreply@openai.com` | [`codex`](https://github.com/codex) (User 267193182) | company OpenAI, blog openai.com/codex; `codex@openai.com` also links |
| `gemini` | `176961590+gemini-code-assist[bot]@users.noreply.github.com` | [`gemini-code-assist[bot]`](https://github.com/apps/gemini-code-assist) | App owned by org `google` |
| `grok` | `261865991+grok-by-xai[bot]@users.noreply.github.com` | [`grok-by-xai[bot]`](https://github.com/apps/grok-by-xai) | App owned by org `xai-org` |
| `qwen` | `qwen-coder@alibabacloud.com` | [`qwencoder`](https://github.com/qwencoder) (User 224605497) | company Qwen; verified `alibabacloud.com` email; Qwen Code default |
| `mistral`, `devstral`, `codestral` | `vibe@mistral.ai` | [`mistral-vibe`](https://github.com/mistral-vibe) (User 220374863) | verified `mistral.ai` email; Mistral Vibe default |

## Models without one: omit the trailer

| Model name contains | Vendor org (cannot author) | Unlinked emails seen in the wild |
| --- | --- | --- |
| `deepseek` | `deepseek-ai` (148330874) | `noreply@deepseek.com`, `148330874+deepseek-ai@users.noreply.github.com` |
| `kimi` | `MoonshotAI` (129152888) | `noreply@moonshot.ai`, `noreply@moonshot.cn` |
| `glm` | `zai-org` (223098841) | `noreply@z.ai`, `zai-org@users.noreply.github.com` |
| `minimax` | `MiniMax-AI` (194880281) | `noreply@minimax.io` |
| `llama` | `meta-llama` (153379578) | — |
| `hunyuan` / `seed`/`doubao` / `step` / `mimo` / `longcat` / `ling` / `ernie` / `granite` / `command` | `Tencent-Hunyuan` / `ByteDance-Seed` / `stepfun-ai` / `XiaomiMiMo` / `meituan-longcat` / `inclusionAI` / `PaddlePaddle` / `ibm-granite` / `cohere-ai` | — |

Same-name personal accounts are squatters, not vendors: `github.com/Anthropic` (Marcel J Bennett), `kimi`, `grok`, `glm`, `qwen`. `gemini` and `deepseek` are unrelated organizations.

DeepSeek decision (2026-11-27): a self-owned machine account (GitHub allows one free machine account per person; `langya-deepseek` and `deepseek-coauthor` were unregistered) would give DeepSeek commits an avatar, but the owner chose to skip it for now. DeepSeek commits carry no trailer. Never register or invent such an account on the user's behalf.

## Agent products

Use these only when the commit was actually produced by that product; they identify the tool, not the model.

| Product | Email | Links to |
| --- | --- | --- |
| GitHub Copilot coding agent | `198982749+Copilot@users.noreply.github.com` | `Copilot` (App `copilot-swe-agent`, owner `github`) |
| GitHub Copilot CLI | `223556219+Copilot@users.noreply.github.com` | `Copilot` (App `github-copilot-cli`) |
| Cursor agent | `cursoragent@cursor.com` | `cursoragent` |
| Amp | `amp@ampcode.com` | `ampagent` (company `@AmpCode`) |
| Devin | `158243242+devin-ai-integration[bot]@users.noreply.github.com` | App owned by `usacognition` |
| Google Jules | `161369871+google-labs-jules[bot]@users.noreply.github.com` | App owned by `google-labs-code` |
| Claude GitHub App | `209825114+claude[bot]@users.noreply.github.com` | App owned by `anthropics` |

## Verifying a new model or re-checking a row

An email links if and only if GitHub resolves it to a user on real commits:

1. Find what email the vendor's own tool writes (its CLI's default trailer, or commits in its repos). Candidate accounts: `gh api users/<login>` — check `type`, `company`, `blog`; for apps, `gh api apps/<slug>` — check `owner.login`.
2. Run `scripts/resolve-email.sh '<email>'`. It searches public commits containing the email and asks GraphQL `Commit.authors` which account each one resolved to.
   - A vendor-owned login → linkable; add a row.
   - Only `UNLINKED`, or no commits found → omit the trailer.
3. Bot accounts use `<bot id>+<slug>[bot]@users.noreply.github.com`; get the id from `gh api 'users/<slug>[bot]'` (quote the brackets; plain `curl` needs `-g`).

Search API limit is 30 requests/minute; batch accordingly.
