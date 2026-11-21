# my-skills

個人 AI agent 的 skill 與 rule 備份（omp / Claude Code）。

## 內容

| 名稱 | 類型 | 路徑 | 用途 |
| --- | --- | --- | --- |
| `code-styleguide` | skill | [`skills/code-styleguide/`](skills/code-styleguide/SKILL.md) | 程式碼風格規則：Google、Angular、Android Kotlin 官方 style guide 轉成 Markdown，寫 / review / 格式化程式碼時按語言載入 |
| `i-have-adhd` | rule（`alwaysApply`） | [`rules/i-have-adhd.md`](rules/i-have-adhd.md) | 回覆格式規則：先給下一步動作、步驟編號、每輪重述進度、壓掉離題內容、具體時間估計 |

### code-styleguide 涵蓋語言

C++、C#、Common Lisp、Go、Haskell、HTML/CSS、Java、JavaScript、JSON、Kotlin、Markdown、Objective-C、Python、R、Rust、Shell、TypeScript、Verilog、Vim script、XML、Angular。

用法：`SKILL.md` 的表格列出每份 reference 的索引行數，agent 只讀需要的章節。

## 安裝

omp：

```sh
cp -r skills/code-styleguide ~/.omp/agent/skills/
cp rules/i-have-adhd.md ~/.omp/agent/rules/
```

Claude Code：

```sh
cp -r skills/code-styleguide ~/.claude/skills/
```

`i-have-adhd` 在 Claude Code 上建議直接裝原作者的 plugin（見下方來源）。

## 來源與授權

- `code-styleguide`：[google/styleguide](https://github.com/google/styleguide)（CC-BY-3.0）、[angular/angular](https://github.com/angular/angular)（CC-BY-4.0）、[developer.android.com](https://developer.android.com/kotlin/style-guide)（Apache-2.0）。各檔版權歸原作者。
- `i-have-adhd`：[ayghri/i-have-adhd](https://github.com/ayghri/i-have-adhd) v0.3.0。
