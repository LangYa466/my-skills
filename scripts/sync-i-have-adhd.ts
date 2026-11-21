// Replaces the body of rules/i-have-adhd.md with upstream SKILL.md, keeping local frontmatter.
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const UPSTREAM = "https://raw.githubusercontent.com/ayghri/i-have-adhd/main";
const RULES_DIR = join(import.meta.dir, "..", "rules");
const RULE = join(RULES_DIR, "i-have-adhd.md");
const LICENSE = join(RULES_DIR, "i-have-adhd.LICENSE");
const FRONTMATTER = /^---\n[\s\S]*?\n---\n/;

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET ${url}: ${res.status} ${res.statusText}`);
  return res.text();
}

const [skill, license, local] = await Promise.all([
  fetchText(`${UPSTREAM}/skills/i-have-adhd/SKILL.md`),
  fetchText(`${UPSTREAM}/LICENSE`),
  readFile(RULE, "utf8"),
]);
const frontmatter = local.match(FRONTMATTER)?.[0];
if (!frontmatter) throw new Error(`${RULE}: missing frontmatter`);
const body = skill.replace(FRONTMATTER, "").trim();

await writeFile(RULE, `${frontmatter}\n${body}\n`);
await writeFile(LICENSE, license);
