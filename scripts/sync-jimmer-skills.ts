// Mirrors skills/jimmer-{java,kotlin} from LangYa466/jimmer-skills, replacing local copies wholesale.
import { mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

const REPOSITORY = "LangYa466/jimmer-skills";
const BRANCH = "main";
const SKILLS = ["jimmer-java", "jimmer-kotlin"];
const SKILLS_DIR = join(import.meta.dir, "..", "skills");

interface TreeEntry {
  path: string;
  type: "blob" | "tree" | "commit";
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

const api = `https://api.github.com/repos/${REPOSITORY}`;
const { sha } = JSON.parse(await fetchText(`${api}/commits/${BRANCH}`, authHeaders()));
const { tree, truncated } = JSON.parse(await fetchText(`${api}/git/trees/${sha}?recursive=1`, authHeaders()));
if (truncated) throw new Error(`${REPOSITORY}@${sha}: tree listing truncated`);

const files = (tree as TreeEntry[])
  .filter((e) => e.type === "blob" && SKILLS.some((s) => e.path.startsWith(`skills/${s}/`)))
  .map((e) => e.path);
for (const skill of SKILLS) {
  if (!files.some((p) => p === `skills/${skill}/SKILL.md`)) throw new Error(`${REPOSITORY}@${sha}: missing ${skill}`);
}

const contents = await Promise.all(
  files.map((p) => fetchText(`https://raw.githubusercontent.com/${REPOSITORY}/${sha}/${p}`)),
);
await Promise.all(SKILLS.map((s) => rm(join(SKILLS_DIR, s), { recursive: true, force: true })));
for (const [i, path] of files.entries()) {
  const target = join(SKILLS_DIR, path.slice("skills/".length));
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, contents[i]);
}
console.log(`jimmer-skills: ${files.length} files from ${REPOSITORY}@${sha.slice(0, 7)}`);
