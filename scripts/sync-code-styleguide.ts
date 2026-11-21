// Regenerates skills/code-styleguide/references from upstream, driven by sources.json.
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import type { Heading, Nodes, Parent, Root } from "mdast";
import { toString } from "mdast-util-to-string";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import { unified } from "unified";
import { SKIP, visit } from "unist-util-visit";

const SKILL_DIR = join(import.meta.dir, "..", "skills", "code-styleguide");
const MANIFEST = join(SKILL_DIR, "sources.json");
const SKILL_MD = join(SKILL_DIR, "SKILL.md");

const BRANCHES: Record<string, string> = {
  "google/styleguide": "gh-pages",
  "angular/angular": "main",
};
const NON_GITHUB_BASE: Record<string, string> = {
  "developer.android.com": "https://developer.android.com",
};
const HASH_PREFIX = "sha256:";
const SHORT_REV = 12;
const INDEX_DEPTH = 3;

interface Reference {
  file: string;
  topic: string;
  title: string;
  url: string;
  repository: string;
  path: string;
  revision: string;
  updated: string;
  license: string;
  indexEnd: number;
  lines: number;
}

interface Upstream {
  text: string;
  revision: string;
  updated: string;
}

function authHeaders(): Record<string, string> {
  const token = process.env.GITHUB_TOKEN;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function fetchText(url: string, headers: Record<string, string> = {}): Promise<string> {
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`GET ${url}: ${res.status} ${res.statusText}`);
  return res.text();
}

async function fetchUpstream(ref: Reference): Promise<Upstream> {
  const branch = BRANCHES[ref.repository];
  if (branch) {
    const api = `https://api.github.com/repos/${ref.repository}/commits?sha=${branch}&path=${encodeURIComponent(ref.path)}&per_page=1`;
    const commits = JSON.parse(await fetchText(api, authHeaders()));
    if (!commits.length) throw new Error(`no commits for ${ref.repository}:${ref.path}`);
    const [commit] = commits;
    const text = await fetchText(
      `https://raw.githubusercontent.com/${ref.repository}/${commit.sha}/${ref.path}`,
    );
    return { text, revision: commit.sha, updated: commit.commit.committer.date.slice(0, 10) };
  }
  const base = NON_GITHUB_BASE[ref.repository];
  if (!base) throw new Error(`unknown repository ${ref.repository}`);
  const text = await fetchText(base + ref.path);
  const revision = HASH_PREFIX + createHash("sha256").update(text).digest("hex");
  const updated = revision === ref.revision ? ref.updated : new Date().toISOString().slice(0, 10);
  return { text, revision, updated };
}

// Kramdown/Jekyll artifacts that render as noise outside GitHub Pages.
function preclean(text: string): string {
  return text
    .replace(/^\* TOC\n\{:toc\}\n/gm, "")
    .replace(/^\s*\{:[^}\n]*\}\s*$/gm, "")
    .replace(/^(#{1,6} .*?)\s*(?:\[\]\(\))?\s*\{#[^}\n]+\}\s*$/gm, "$1")
    .replace(/\{%-? *(?:end)?raw *-?%\}/g, "");
}

const DROPPED_HTML =
  /^\s*(?:<!--[\s\S]*?-->\s*|<a\s+(?:id|name)="[^"]*"\s*>\s*<\/a>\s*|<br\s*\/?>\s*)+$/i;
const ANCHOR_TAG = /^\s*(?:<a\s+(?:id|name)="[^"]*"\s*>|<\/a>|<br\s*\/?>)\s*$/i;
const INLINE_BREAK = /^<br\s*\/?>$/i;
const ANCHOR_OPEN = /^<a\s+(?:id|name)="[^"]*"\s*>$/i;
const BLOCK_PARENTS: Record<string, true> = { root: true, listItem: true, blockquote: true };
// Google guides tag the next code block with an empty marker div.
const CODE_MARKER = /^<div class=['"](good|bad|neutral)code['"]><\/div>$/;

function resolveHref(href: string, ref: Reference): string {
  if (!href || href.startsWith("#") || /^[a-z][a-z0-9+.-]*:/i.test(href)) return href;
  const resolved = new URL(href, ref.url);
  if (ref.repository === "google/styleguide") {
    resolved.pathname = resolved.pathname.replace(/\.md$/, ".html");
  }
  return resolved.href;
}

function fenceMeta(meta: string | null | undefined): string | null {
  if (!meta) return null;
  if (/\b(good|prefer)\b/.test(meta)) return "good";
  if (/\b(bad|avoid)\b/.test(meta)) return "bad";
  return null;
}

function transform(tree: Root, ref: Reference): void {
  const definitions = new Map<string, { url: string; title?: string | null }>();
  visit(tree, "definition", (node) => {
    definitions.set(node.identifier, { url: node.url, title: node.title });
  });

  visit(tree, (node: Nodes, index, parent: Parent | undefined) => {
    if (!parent || index === undefined) return;
    if (node.type === "html") {
      const marker = node.value.trim().match(CODE_MARKER);
      if (marker) {
        const next = parent.children[index + 1];
        if (next?.type === "code") next.meta = marker[1];
        parent.children.splice(index, 1);
        return [SKIP, index];
      }
      if (!BLOCK_PARENTS[parent.type] && INLINE_BREAK.test(node.value.trim())) {
        parent.children.splice(index, 1, { type: "text", value: " " } as never);
        return;
      }
      const next = parent.children[index + 1];
      if (ANCHOR_OPEN.test(node.value) && next?.type === "html" && next.value === "</a>") {
        parent.children.splice(index, 2);
        return [SKIP, index];
      }
    }
    if (node.type === "definition" || (node.type === "html" && DROPPED_HTML.test(node.value))) {
      parent.children.splice(index, 1);
      return [SKIP, index];
    }
    if (node.type === "linkReference" || node.type === "imageReference") {
      const def = definitions.get(node.identifier);
      if (!def) return;
      const url = resolveHref(def.url, ref);
      const replacement =
        node.type === "linkReference"
          ? { type: "link", url, title: def.title, children: node.children }
          : { type: "image", url, title: def.title, alt: node.alt };
      parent.children.splice(index, 1, replacement as never);
      return;
    }
    if (node.type === "link" || node.type === "image") node.url = resolveHref(node.url, ref);
    if (node.type === "text" || node.type === "inlineCode") {
      node.value = node.value.replace(/[ \t]*\n[ \t]*/g, " ");
    }
    if (node.type === "code") node.meta = fenceMeta(node.meta);
  });

  // Anchor-only lines parse as paragraphs of inline HTML.
  visit(tree, "paragraph", (node, index, parent) => {
    if (!parent || index === undefined) return;
    const anchorOnly = node.children.every(
      (child) =>
        (child.type === "html" && ANCHOR_TAG.test(child.value)) ||
        (child.type === "text" && !child.value.trim()),
    );
    if (!anchorOnly) return;
    parent.children.splice(index, 1);
    return [SKIP, index];
  });

  // Removed inline anchors leave edge spaces that would serialize as &#x20;.
  visit(tree, "paragraph", (node) => {
    const first = node.children[0];
    const last = node.children.at(-1);
    if (first?.type === "text") first.value = first.value.trimStart();
    if (last?.type === "text") last.value = last.value.trimEnd();
  });

  // Upstream H1 duplicates the manifest title.
  const first = tree.children.findIndex((n) => n.type === "heading" && n.depth === 1);
  if (first !== -1) tree.children.splice(first, 1);
}

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm, { tablePipeAlign: false })
  .use(remarkStringify, {
    bullet: "-",
    emphasis: "_",
    strong: "*",
    fence: "`",
    fences: true,
    listItemIndent: "one",
    rule: "-",
  });

function convert(text: string, ref: Reference): { body: string; headings: Heading[] } {
  const tree = processor.parse(preclean(text)) as Root;
  transform(tree, ref);
  const headings: Heading[] = [];
  visit(tree, "heading", (node) => {
    if (node.depth >= 2 && node.depth <= INDEX_DEPTH) headings.push(node);
  });
  const body = String(processor.stringify(tree)).replace(/\n{3,}/g, "\n\n").trim();
  return { body, headings };
}

function render(ref: Reference, upstream: Upstream): { markdown: string; indexEnd: number } {
  const { body, headings } = convert(upstream.text, ref);
  const rev = upstream.revision.startsWith(HASH_PREFIX)
    ? upstream.revision.slice(0, HASH_PREFIX.length + SHORT_REV)
    : upstream.revision.slice(0, SHORT_REV);
  const header = [
    `# ${ref.title}`,
    "",
    `Source: <${ref.url}> · ${ref.repository}@${rev} (${upstream.updated}) · ${ref.license}`,
    "",
    "## Index",
    "",
  ];
  const indexEnd = header.length + headings.length;
  // Blank line, rule, blank line, then the body's first line.
  const bodyStart = indexEnd + 4;
  const bodyLines = body.split("\n");

  // Headings appear in the rendered body in document order; skip fenced code.
  const entries: string[] = [];
  let cursor = 0;
  let inFence = false;
  for (const heading of headings) {
    const marker = `${"#".repeat(heading.depth)} `;
    for (; cursor < bodyLines.length; cursor++) {
      const line = bodyLines[cursor];
      if (/^\s*(```|~~~)/.test(line)) inFence = !inFence;
      else if (!inFence && line.startsWith(marker)) break;
    }
    if (cursor === bodyLines.length) throw new Error(`${ref.file}: heading not found in output`);
    const indent = "  ".repeat(heading.depth - 2);
    entries.push(`${indent}- L${bodyStart + cursor} ${toString(heading).trim()}`);
    cursor++;
  }

  const markdown = [...header, ...entries, "", "---", "", ...bodyLines].join("\n") + "\n";
  return { markdown, indexEnd };
}

function updateSkillMd(skill: string, refs: Reference[]): string {
  const rows = refs.map((r) => `| ${r.topic} | [${r.title}](${r.file}) | 1-${r.indexEnd} | ${r.lines} |`);
  const tableStart = skill.indexOf("| Topic |");
  if (tableStart === -1) throw new Error("SKILL.md table not found");
  const rowsStart = skill.indexOf("\n", skill.indexOf("\n", tableStart) + 1) + 1;
  let rowsEnd = rowsStart;
  while (skill.startsWith("|", rowsEnd)) rowsEnd = skill.indexOf("\n", rowsEnd) + 1;
  const latest = refs.map((r) => r.updated).sort().at(-1);
  return (skill.slice(0, rowsStart) + rows.join("\n") + "\n" + skill.slice(rowsEnd)).replace(
    /^(\s+updated: )"[^"]*"/m,
    `$1"${latest}"`,
  );
}

async function main(): Promise<void> {
  const manifest = JSON.parse(await readFile(MANIFEST, "utf8")) as { references: Reference[] };
  const refs = await Promise.all(
    manifest.references.map(async (ref) => {
      const upstream = await fetchUpstream(ref);
      const { markdown, indexEnd } = render(ref, upstream);
      const target = join(SKILL_DIR, ref.file);
      await mkdir(dirname(target), { recursive: true });
      await writeFile(target, markdown);
      const lines = markdown.split("\n").length - 1;
      console.log(`${ref.file}: ${upstream.revision.slice(0, SHORT_REV)} ${lines} lines`);
      return { ...ref, revision: upstream.revision, updated: upstream.updated, indexEnd, lines };
    }),
  );
  await writeFile(MANIFEST, JSON.stringify({ references: refs }, null, 2) + "\n");
  await writeFile(SKILL_MD, updateSkillMd(await readFile(SKILL_MD, "utf8"), refs));
}

await main();
