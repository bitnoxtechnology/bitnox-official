/**
 * The languages a code block can be written in.
 *
 * One list, two consumers that must not disagree. The Tiptap `CodeBlockLowlight` dropdown in
 * the admin offers exactly these, and the Shiki highlighter on the public page loads exactly
 * these grammars. A language offered by the editor and missing from the highlighter renders
 * as unstyled text on the published post, which is the failure this file exists to prevent.
 *
 * `id` is the Shiki grammar name and the value written into `class="language-<id>"` by
 * Tiptap. `label` is what the dropdown and the caption above the block say, because
 * "csharp" is a grammar name and "C#" is what a reader calls it.
 *
 * The set is deliberately short. Every grammar is bundled into the server build, and loading
 * two hundred of them to highlight the four that ever appear is a cost paid on every render.
 */

export interface CodeLanguage {
  id: string;
  label: string;
}

export const CODE_LANGUAGES = [
  { id: "javascript", label: "JavaScript" },
  { id: "typescript", label: "TypeScript" },
  { id: "jsx", label: "JSX" },
  { id: "tsx", label: "TSX" },
  { id: "python", label: "Python" },
  { id: "java", label: "Java" },
  { id: "php", label: "PHP" },
  { id: "csharp", label: "C#" },
  { id: "go", label: "Go" },
  { id: "rust", label: "Rust" },
  { id: "sql", label: "SQL" },
  { id: "html", label: "HTML" },
  { id: "css", label: "CSS" },
  { id: "json", label: "JSON" },
  { id: "yaml", label: "YAML" },
  { id: "bash", label: "Bash" },
  { id: "dockerfile", label: "Dockerfile" },
] as const satisfies readonly CodeLanguage[];

export type CodeLanguageId = (typeof CODE_LANGUAGES)[number]["id"];

export const CODE_LANGUAGE_IDS = CODE_LANGUAGES.map((language) => language.id);

const BY_ID = new Map<string, CodeLanguage>(
  CODE_LANGUAGES.map((language) => [language.id, language]),
);

/**
 * Aliases Tiptap and pasted markdown produce for the same grammar.
 *
 * `ts`, `js` and `sh` arrive constantly from pasted fences, and `shell` is what a reader
 * writes when they mean bash. Mapping them here rather than adding them to the list above
 * keeps the dropdown to one entry per language.
 */
const ALIASES: Record<string, CodeLanguageId> = {
  js: "javascript",
  ts: "typescript",
  mjs: "javascript",
  cjs: "javascript",
  py: "python",
  "c#": "csharp",
  cs: "csharp",
  golang: "go",
  rs: "rust",
  yml: "yaml",
  sh: "bash",
  shell: "bash",
  zsh: "bash",
  docker: "dockerfile",
  postgres: "sql",
  postgresql: "sql",
  mysql: "sql",
};

/** The grammar for a class name, or undefined for one this site does not highlight. */
export function resolveLanguage(value: string | undefined): CodeLanguage | undefined {
  if (!value) return undefined;

  const normalised = value.trim().toLowerCase();

  return BY_ID.get(normalised) ?? BY_ID.get(ALIASES[normalised] ?? "");
}
