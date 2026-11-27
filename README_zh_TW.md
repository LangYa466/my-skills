# my-skills

[English](README.md) | [简体中文](README_zh_CN.md) | **繁體中文**

個人 AI coding agent 的 skill 與 rule（omp / Claude Code）。

## 內容

| 名稱 | 類型 | 路徑 | 用途 |
| --- | --- | --- | --- |
| `ai-coauthor-trailer` | skill | [`skills/ai-coauthor-trailer/`](skills/ai-coauthor-trailer/SKILL.md) | AI commit 的 `Co-Authored-By` 該用哪個 email：只有能在 GitHub 連到廠商帳號的模型才加，附查證腳本 `scripts/resolve-email.sh` |
| `code-styleguide` | skill | [`skills/code-styleguide/`](skills/code-styleguide/SKILL.md) | 程式碼風格規則：Google、Angular、Android Kotlin 官方 style guide 轉成 Markdown，寫 / review / 格式化程式碼時按語言載入 |
| `i-have-adhd` | rule（`alwaysApply`） | [`rules/i-have-adhd.md`](rules/i-have-adhd.md) | 回覆格式規則：先給下一步動作、步驟編號、每輪重述進度、壓掉離題內容、具體時間估計 |
| `jimmer-java` | skill | [`skills/jimmer-java/`](skills/jimmer-java/SKILL.md) | Jimmer ORM（Java API）：`JSqlClient`、實體映射、DTO 語言、save command、查詢 DSL、Spring Boot。鏡像自 [jimmer-skills](https://github.com/LangYa466/jimmer-skills) |
| `jimmer-kotlin` | skill | [`skills/jimmer-kotlin/`](skills/jimmer-kotlin/SKILL.md) | Jimmer ORM（Kotlin API）：`KSqlClient`、KSP、`fetchBy { }`、擴充屬性 DSL。鏡像自 [jimmer-skills](https://github.com/LangYa466/jimmer-skills) |
| `original-ui-craft` | skill | [`skills/original-ui-craft/`](skills/original-ui-craft/SKILL.md) | 原創 UI/UX 藝術指導與前端工藝：從對象本質推導佈局、材質與互動，避開 AI 模板慣性。自製（Gemini 4 Neon xhigh 協作） |

## 安裝

把下面這段貼給你的 agent（omp、Claude Code，或任何能跑 shell 的 agent）。它會讀這個 repo、問你要裝哪些，再把每一項只裝到一個位置。

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

[`.github/workflows/sync-upstream.yml`](.github/workflows/sync-upstream.yml) 每天 02:23 UTC 跑一次（也可在 Actions 頁手動觸發），有變更就直接 commit 到 `main`。

| 腳本 | 上游 | 產出 |
| --- | --- | --- |
| [`scripts/sync-code-styleguide.ts`](scripts/sync-code-styleguide.ts) | `sources.json` 列的每份 guide | `references/*.md`（含行號索引）、`sources.json` 的 revision、`SKILL.md` 表格 |
| [`scripts/sync-i-have-adhd.ts`](scripts/sync-i-have-adhd.ts) | `ayghri/i-have-adhd` 的 `skills/i-have-adhd/SKILL.md` | `rules/i-have-adhd.md` 本文（保留本地 frontmatter）、`rules/i-have-adhd.LICENSE` |
| [`scripts/sync-jimmer-skills.ts`](scripts/sync-jimmer-skills.ts) | `LangYa466/jimmer-skills` 的 `skills/jimmer-{java,kotlin}/` | 整個目錄覆寫（上游刪掉的檔案也會刪） |

本機手動同步：

```sh
bun install
GITHUB_TOKEN=$(gh auth token) bun run sync
```

新增 guide：在 `skills/code-styleguide/sources.json` 加一筆（`revision` 隨便填）再跑 `bun run sync`，`SKILL.md` 表格會照 `sources.json` 順序重建。新的 GitHub repo 要先加進腳本裡的 `BRANCHES`。

`jimmer-java` / `jimmer-kotlin` 請到 [jimmer-skills](https://github.com/LangYa466/jimmer-skills) 修改，那邊每段範例都對 Jimmer 0.12.4 編譯並執行過；在這裡改會被下次同步覆蓋。

## 來源與授權

- 本 repo 原創內容（`ai-coauthor-trailer`、`original-ui-craft`、`scripts/`、workflow）採 [MIT](LICENSE)。以下第三方內容維持各自授權，不受根目錄 LICENSE 覆蓋。
- 致謝：`code-styleguide` 的思路與結構（上游 guide 轉 Markdown、每份附行號索引、`sources.json` 記錄版本、CI 自動同步）來自 [Alice39s/agent-stash 的 `code-styleguide`](https://github.com/Alice39s/agent-stash/blob/main/skills/code-styleguide/SKILL.md)（Apache-2.0，見 [`skills/code-styleguide/agent-stash.LICENSE`](skills/code-styleguide/agent-stash.LICENSE)）。本 repo 的 `SKILL.md`、`sources.json` 衍生自該專案；`scripts/sync-code-styleguide.ts` 與 workflow 為重新實作。
- `code-styleguide`：[google/styleguide](https://github.com/google/styleguide)（CC-BY-3.0）、[angular/angular](https://github.com/angular/angular)（CC-BY-4.0）、[developer.android.com](https://developer.android.com/kotlin/style-guide)（Apache-2.0）。各檔版權歸原作者。
- `i-have-adhd`：[ayghri/i-have-adhd](https://github.com/ayghri/i-have-adhd)（MIT，見 [`rules/i-have-adhd.LICENSE`](rules/i-have-adhd.LICENSE)）。
- `jimmer-java`、`jimmer-kotlin`：[LangYa466/jimmer-skills](https://github.com/LangYa466/jimmer-skills)（MIT）。
