# my-skills

[English](README.md) | **简体中文** | [繁體中文](README_zh_TW.md)

个人 AI coding agent 的 skill 与 rule（omp / Claude Code）。

## 内容

| 名称 | 类型 | 路径 | 用途 |
| --- | --- | --- | --- |
| `ai-coauthor-trailer` | skill | [`skills/ai-coauthor-trailer/`](skills/ai-coauthor-trailer/SKILL.md) | AI commit 的 `Co-Authored-By` 该用哪个 email：只有能在 GitHub 关联到厂商账号的模型才加，附查证脚本 `scripts/resolve-email.sh` |
| `code-styleguide` | skill | [`skills/code-styleguide/`](skills/code-styleguide/SKILL.md) | 代码风格规则：Google、Angular、Android Kotlin 官方 style guide 转成 Markdown，写 / review / 格式化代码时按语言加载 |
| `i-have-adhd` | rule（`alwaysApply`） | [`rules/i-have-adhd.md`](rules/i-have-adhd.md) | 回复格式规则：先给下一步动作、步骤编号、每轮重述进度、压掉跑题内容、具体时间估计 |
| `jimmer-java` | skill | [`skills/jimmer-java/`](skills/jimmer-java/SKILL.md) | Jimmer ORM（Java API）：`JSqlClient`、实体映射、DTO 语言、save command、查询 DSL、Spring Boot。镜像自 [jimmer-skills](https://github.com/LangYa466/jimmer-skills) |
| `jimmer-kotlin` | skill | [`skills/jimmer-kotlin/`](skills/jimmer-kotlin/SKILL.md) | Jimmer ORM（Kotlin API）：`KSqlClient`、KSP、`fetchBy { }`、扩展属性 DSL。镜像自 [jimmer-skills](https://github.com/LangYa466/jimmer-skills) |
| `original-ui-craft` | skill | [`skills/original-ui-craft/`](skills/original-ui-craft/SKILL.md) | 原创 UI/UX 艺术指导与前端工艺：从对象本质推导布局、材质与交互，避开 AI 模板惯性。自制（Gemini 4 Neon xhigh 协作） |

## 安装

把下面这段贴给你的 agent（omp、Claude Code，或任何能跑 shell 的 agent）。它会读这个 repo、问你要装哪些，再把每一项只装到一个位置。

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

## 上游同步

[`.github/workflows/sync-upstream.yml`](.github/workflows/sync-upstream.yml) 每天 02:23 UTC 跑一次（也可在 Actions 页面手动触发），有变更就直接 commit 到 `main`。

| 脚本 | 上游 | 产出 |
| --- | --- | --- |
| [`scripts/sync-code-styleguide.ts`](scripts/sync-code-styleguide.ts) | `sources.json` 列出的每份 guide | `references/*.md`（含行号索引）、`sources.json` 的 revision、`SKILL.md` 表格 |
| [`scripts/sync-i-have-adhd.ts`](scripts/sync-i-have-adhd.ts) | `ayghri/i-have-adhd` 的 `skills/i-have-adhd/SKILL.md` | `rules/i-have-adhd.md` 正文（保留本地 frontmatter）、`rules/i-have-adhd.LICENSE` |
| [`scripts/sync-jimmer-skills.ts`](scripts/sync-jimmer-skills.ts) | `LangYa466/jimmer-skills` 的 `skills/jimmer-{java,kotlin}/` | 整个目录覆盖（上游删掉的文件也会删） |

本地手动同步：

```sh
bun install
GITHUB_TOKEN=$(gh auth token) bun run sync
```

新增 guide：在 `skills/code-styleguide/sources.json` 加一条（`revision` 随便填）再跑 `bun run sync`，`SKILL.md` 表格会按 `sources.json` 顺序重建。新的 GitHub repo 要先加进脚本里的 `BRANCHES`。

`jimmer-java` / `jimmer-kotlin` 请到 [jimmer-skills](https://github.com/LangYa466/jimmer-skills) 修改，那边每段示例都针对 Jimmer 0.12.4 编译并运行过；在这里改会被下次同步覆盖。

## 来源与许可

- 本 repo 原创内容（`ai-coauthor-trailer`、`original-ui-craft`、`scripts/`、workflow）采用 [MIT](LICENSE)。以下第三方内容保留各自许可，不受根目录 LICENSE 覆盖。
- 致谢：`code-styleguide` 的思路与结构（上游 guide 转 Markdown、每份附行号索引、`sources.json` 记录版本、CI 自动同步）来自 [Alice39s/agent-stash 的 `code-styleguide`](https://github.com/Alice39s/agent-stash/blob/main/skills/code-styleguide/SKILL.md)（Apache-2.0，见 [`skills/code-styleguide/agent-stash.LICENSE`](skills/code-styleguide/agent-stash.LICENSE)）。本 repo 的 `SKILL.md`、`sources.json` 衍生自该项目；`scripts/sync-code-styleguide.ts` 与 workflow 为重新实现。
- `code-styleguide`：[google/styleguide](https://github.com/google/styleguide)（CC-BY-3.0）、[angular/angular](https://github.com/angular/angular)（CC-BY-4.0）、[developer.android.com](https://developer.android.com/kotlin/style-guide)（Apache-2.0）。各文件版权归原作者。
- `i-have-adhd`：[ayghri/i-have-adhd](https://github.com/ayghri/i-have-adhd)（MIT，见 [`rules/i-have-adhd.LICENSE`](rules/i-have-adhd.LICENSE)）。
- `jimmer-java`、`jimmer-kotlin`：[LangYa466/jimmer-skills](https://github.com/LangYa466/jimmer-skills)（MIT）。
