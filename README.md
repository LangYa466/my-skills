# my-skills

**English** | [简体中文](README_zh_CN.md) | [繁體中文](README_zh_TW.md)

Personal skills and rules for AI coding agents (omp / Claude Code).

## Contents

| Name | Type | Path | Purpose |
| --- | --- | --- | --- |
| `ai-coauthor-trailer` | skill | [`skills/ai-coauthor-trailer/`](skills/ai-coauthor-trailer/SKILL.md) | Which email to put in an AI commit's `Co-Authored-By`: only models whose email links to a vendor-owned GitHub account; ships `scripts/resolve-email.sh` to verify |
| `code-styleguide` | skill | [`skills/code-styleguide/`](skills/code-styleguide/SKILL.md) | Google, Angular, and Android Kotlin style guides as Markdown, loaded per language when writing, reviewing, or formatting code |
| `i-have-adhd` | rule (`alwaysApply`) | [`rules/i-have-adhd.md`](rules/i-have-adhd.md) | Reply shape: next action first, numbered steps, restated progress, no tangents, concrete time estimates |
| `jimmer-java` | skill | [`skills/jimmer-java/`](skills/jimmer-java/SKILL.md) | Jimmer ORM (Java API): `JSqlClient`, entity mapping, DTO language, save commands, query DSL, Spring Boot. Mirrored from [jimmer-skills](https://github.com/LangYa466/jimmer-skills) |
| `jimmer-kotlin` | skill | [`skills/jimmer-kotlin/`](skills/jimmer-kotlin/SKILL.md) | Jimmer ORM (Kotlin API): `KSqlClient`, KSP, `fetchBy { }`, extension-property DSL. Mirrored from [jimmer-skills](https://github.com/LangYa466/jimmer-skills) |
| `original-ui-craft` | skill | [`skills/original-ui-craft/`](skills/original-ui-craft/SKILL.md) | Original UI/UX art direction and front-end craft: derive layout, material, and interaction from the subject instead of AI templates |

## Install

Paste this into your agent (omp, Claude Code, or any agent with shell access). It reads the repo, asks which items you want, and installs each one to exactly one place.

```text
Install skills from https://github.com/LangYa466/my-skills for me.

1. Shallow-clone the repo into a temp dir. Build the list of installable items from
   skills/*/SKILL.md (name + description frontmatter) and rules/*.md.
2. Detect my agents: omp (~/.omp/agent/) and Claude Code (~/.claude/). If omp's
   config.yml lists `claude` under enabledProviders, omp also loads ~/.claude/skills/,
   so that single location serves both.
3. Ask me in one multi-select question which items to install, one line of
   description each, nothing preselected. If more than one target is possible, ask
   for the target too. Ask in the language I use with you.
4. Install each chosen item to exactly one location:
   - skill -> <target>/skills/<name>/ (copy the whole directory)
   - rule  -> ~/.omp/agent/rules/ (omp only; on Claude Code, suggest the upstream
     plugin https://github.com/ayghri/i-have-adhd instead)
5. Never install the same skill into both ~/.omp/agent/skills/ and ~/.claude/skills/:
   omp dedupes identical copies, but once they drift it reports a name collision and
   renames one to <namespace>/<name>~2. If a same-named skill already exists with
   different content, summarize the difference and ask before overwriting.
6. Delete the temp clone and report what was installed where.
```

## Upstream sync

[`.github/workflows/sync-upstream.yml`](.github/workflows/sync-upstream.yml) runs daily at 02:23 UTC (or manually from the Actions tab) and commits any changes straight to `main`.

| Script | Upstream | Output |
| --- | --- | --- |
| [`scripts/sync-code-styleguide.ts`](scripts/sync-code-styleguide.ts) | Each guide listed in `sources.json` | `references/*.md` (with line-number index), `sources.json` revisions, the `SKILL.md` table |
| [`scripts/sync-i-have-adhd.ts`](scripts/sync-i-have-adhd.ts) | `skills/i-have-adhd/SKILL.md` in `ayghri/i-have-adhd` | Body of `rules/i-have-adhd.md` (local frontmatter kept), `rules/i-have-adhd.LICENSE` |
| [`scripts/sync-jimmer-skills.ts`](scripts/sync-jimmer-skills.ts) | `skills/jimmer-{java,kotlin}/` in `LangYa466/jimmer-skills` | Whole directories replaced (files deleted upstream are deleted here) |

Manual sync:

```sh
bun install
GITHUB_TOKEN=$(gh auth token) bun run sync
```

Adding a guide: add an entry to `skills/code-styleguide/sources.json` (any `revision`) and run `bun run sync`; the `SKILL.md` table is rebuilt in `sources.json` order. A new GitHub repository must first be added to `BRANCHES` in the script.

Edit `jimmer-java` / `jimmer-kotlin` in [jimmer-skills](https://github.com/LangYa466/jimmer-skills), where every snippet is compiled and run against Jimmer 0.12.4; changes here are overwritten by the next sync.

## Sources and licenses

- Original content (`ai-coauthor-trailer`, `original-ui-craft`, `scripts/`, workflows) is [MIT](LICENSE). Third-party content below keeps its own license and is not covered by the root LICENSE.
- Credit: the approach and layout of `code-styleguide` (upstream guides as Markdown, a line-number index per file, `sources.json` revisions, CI sync) come from [Alice39s/agent-stash's `code-styleguide`](https://github.com/Alice39s/agent-stash/blob/main/skills/code-styleguide/SKILL.md) (Apache-2.0, see [`skills/code-styleguide/agent-stash.LICENSE`](skills/code-styleguide/agent-stash.LICENSE)). This repo's `SKILL.md` and `sources.json` derive from it; `scripts/sync-code-styleguide.ts` and the workflow are reimplementations.
- `code-styleguide`: [google/styleguide](https://github.com/google/styleguide) (CC-BY-3.0), [angular/angular](https://github.com/angular/angular) (CC-BY-4.0), [developer.android.com](https://developer.android.com/kotlin/style-guide) (Apache-2.0). Copyright of each file belongs to its authors.
- `i-have-adhd`: [ayghri/i-have-adhd](https://github.com/ayghri/i-have-adhd) (MIT, see [`rules/i-have-adhd.LICENSE`](rules/i-have-adhd.LICENSE)).
- `jimmer-java`, `jimmer-kotlin`: [LangYa466/jimmer-skills](https://github.com/LangYa466/jimmer-skills) (MIT).
