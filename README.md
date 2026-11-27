# my-skills

個人 AI agent 的 skill 與 rule 備份（omp / Claude Code）。

## 內容

| 名稱 | 類型 | 路徑 | 用途 |
| --- | --- | --- | --- |
| `ai-coauthor-trailer` | skill | [`skills/ai-coauthor-trailer/`](skills/ai-coauthor-trailer/SKILL.md) | AI commit 的 `Co-Authored-By` 該用哪個 email：只有能在 GitHub 連到廠商帳號的模型才加，附查證腳本 `scripts/resolve-email.sh` |
| `code-styleguide` | skill | [`skills/code-styleguide/`](skills/code-styleguide/SKILL.md) | 程式碼風格規則：Google、Angular、Android Kotlin 官方 style guide 轉成 Markdown，寫 / review / 格式化程式碼時按語言載入 |
| `i-have-adhd` | rule（`alwaysApply`） | [`rules/i-have-adhd.md`](rules/i-have-adhd.md) | 回覆格式規則：先給下一步動作、步驟編號、每輪重述進度、壓掉離題內容、具體時間估計 |
| `jimmer-java` | skill | [`skills/jimmer-java/`](skills/jimmer-java/SKILL.md) | Jimmer ORM（Java API）：`JSqlClient`、實體映射、DTO 語言、save command、查詢 DSL、Spring Boot。鏡像自 [jimmer-skills](https://github.com/LangYa466/jimmer-skills) |
| `jimmer-kotlin` | skill | [`skills/jimmer-kotlin/`](skills/jimmer-kotlin/SKILL.md) | Jimmer ORM（Kotlin API）：`KSqlClient`、KSP、`fetchBy { }`、擴充屬性 DSL。鏡像自 [jimmer-skills](https://github.com/LangYa466/jimmer-skills) |
| `original-ui-craft` | skill | [`skills/original-ui-craft/`](skills/original-ui-craft/SKILL.md) | 原創 UI/UX 藝術指導與前端工藝：從對象本質推導佈局、材質與互動，避開 AI 模板慣性。自製（Gemini 4 Neon xhigh 協作） |

### code-styleguide 涵蓋語言

C++、C#、Common Lisp、Go、Haskell、HTML/CSS、Java、JavaScript、JSON、Kotlin、Markdown、Objective-C、Python、R、Rust、Shell、TypeScript、Verilog、Vim script、XML、Angular。

用法：`SKILL.md` 的表格列出每份 reference 的索引行數，agent 只讀需要的章節。

### jimmer-java / jimmer-kotlin

對應 Jimmer 0.12.4，每段範例都在 [jimmer-skills](https://github.com/LangYa466/jimmer-skills) 的 `verification/` 專案編譯並執行過；修改請在該 repo 進行，這裡每天同步。

## 安裝

omp：

```sh
cp -r skills/ai-coauthor-trailer ~/.omp/agent/skills/
cp -r skills/code-styleguide ~/.omp/agent/skills/
cp -r skills/jimmer-java skills/jimmer-kotlin ~/.omp/agent/skills/
cp -r skills/original-ui-craft ~/.omp/agent/skills/
cp rules/i-have-adhd.md ~/.omp/agent/rules/
```

Claude Code：

```sh
cp -r skills/ai-coauthor-trailer ~/.claude/skills/
cp -r skills/code-styleguide ~/.claude/skills/
cp -r skills/jimmer-java skills/jimmer-kotlin ~/.claude/skills/
cp -r skills/original-ui-craft ~/.claude/skills/
```

`i-have-adhd` 在 Claude Code 上建議直接裝原作者的 plugin（見下方來源）。

同一個 skill 只裝一處。omp 有啟用 Claude 匯入（`enabledProviders` 含 `claude`）時也會讀 `~/.claude/skills/`；兩處內容完全相同會自動去重，但只要一邊改了沒同步，omp 就會出現 `name collision` 警告，並把其中一份改名成 `<namespace>/<name>~2` 掛著。

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

## 來源與授權

- 本 repo 原創內容（`ai-coauthor-trailer`、`original-ui-craft`、`scripts/`、workflow）採 [MIT](LICENSE)。以下第三方內容維持各自授權，不受根目錄 LICENSE 覆蓋。
- 致謝：`code-styleguide` 的思路與結構（上游 guide 轉 Markdown、每份附行號索引、`sources.json` 記錄版本、CI 自動同步）來自 [Alice39s/agent-stash 的 `code-styleguide`](https://github.com/Alice39s/agent-stash/blob/main/skills/code-styleguide/SKILL.md)（Apache-2.0，見 [`skills/code-styleguide/agent-stash.LICENSE`](skills/code-styleguide/agent-stash.LICENSE)）。本 repo 的 `SKILL.md`、`sources.json` 衍生自該專案；`scripts/sync-code-styleguide.ts` 與 workflow 為重新實作。
- `code-styleguide`：[google/styleguide](https://github.com/google/styleguide)（CC-BY-3.0）、[angular/angular](https://github.com/angular/angular)（CC-BY-4.0）、[developer.android.com](https://developer.android.com/kotlin/style-guide)（Apache-2.0）。各檔版權歸原作者。
- `i-have-adhd`：[ayghri/i-have-adhd](https://github.com/ayghri/i-have-adhd)（MIT，見 [`rules/i-have-adhd.LICENSE`](rules/i-have-adhd.LICENSE)）。
- `jimmer-java`、`jimmer-kotlin`：[LangYa466/jimmer-skills](https://github.com/LangYa466/jimmer-skills)（MIT）。
