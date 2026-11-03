// The guards every change must pass, whoever writes it (people or coding agents): no secrets, no
// personal paths or email addresses, no AI tool credited as an author, no oversized files. The
// patterns are written so they never match their own source.

type Finding = { rule: string; match: string };

const SECRETS: ReadonlyArray<[string, RegExp]> = [
  ["private key", /-----BEGIN [A-Z ]*PRIVATE KEY(?: BLOCK)?-----/],
  ["OpenAI or Anthropic key", /\bsk-(?:proj-|ant-)?[A-Za-z0-9_-]{24,}/],
  [
    "GitHub token",
    /\bgh[pousr]_[A-Za-z0-9]{36}\b|\bghs_[A-Za-z0-9._-]{36,}|\bgithub_pat_[A-Za-z0-9_]{40,}/,
  ],
  ["AWS access key", /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/],
  ["npm token", /\bnpm_[A-Za-z0-9]{36}\b/],
  ["Slack token", /\bxox[abprs]-[A-Za-z0-9-]{10,}/],
  ["Google API key", /\bAIza[0-9A-Za-z_-]{35}(?![0-9A-Za-z_-])/],
  ["Vercel token", /\bvc[pk]_[A-Za-z0-9]{24,}/],
  ["Stripe key", /\b(?:sk|rk)_(?:live|test)_[A-Za-z0-9]{24,}/],
];
// A home folder from any machine, not only this one: a `/Users/<name>` path committed from another
// laptop would otherwise pass CI, whose runner has a home of its own. A path counts when it starts
// one (at a line start, after a space, a quote, `=`, `(` or `:`), so an import like
// `@/app/home/_components/x` is not one; the name may hold spaces, and Windows paths may be
// escaped once (JSON, JS strings).
const PATH_START = String.raw`(?:^|[\s"'\`=(:])`;
const HOME_PATHS: ReadonlyArray<RegExp> = [
  new RegExp(
    String.raw`${PATH_START}/(?:Users|home)/[A-Za-z0-9._-][A-Za-z0-9._ -]*(?=$|[/"'\`\s)])`,
    "m"
  ),
  new RegExp(
    String.raw`[A-Za-z]:\\{1,2}Users\\{1,2}[A-Za-z0-9._-][A-Za-z0-9._ -]*(?=$|[\\"'\`\s)])`,
    "m"
  ),
];
// Every co-author trailer is refused, a person's too: commits are authored by one GitHub identity,
// and a trailer is how an AI tool or someone's address slips in.
const ATTRIBUTION =
  /Co-Authored-By:[ \t]*[A-Za-z]|noreply@anthropic\.com|Generated with \[?Claude/i;
// A real person's address never belongs in the repo. Mock data uses the reserved example domains
// (RFC 2606) or GitHub's noreply addresses.
const EMAIL =
  /\b[A-Za-z0-9._%+-]+@([A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,})\b/g;
// What looks like an address but is not one: a retina asset (`logo@2x.png`) and an SSH remote
// (`git@github.com:owner/repo`).
const NOT_AN_ADDRESS =
  /^git@|\.(?:png|jpe?g|gif|webp|avif|svg|ico|css|js|mjs|cjs|ts|tsx|json|woff2?)$/i;
const ALLOWED_EMAIL_DOMAIN =
  /(?:^|\.)(?:example\.(?:com|org|net)|users\.noreply\.github\.com|test|invalid|localhost)$/i;

/** 1 MB: a bigger file is almost always a build output or a dataset that belongs elsewhere. */
const MAX_FILE_BYTES = 1024 * 1024;
// Big files kept on purpose, each with its reason.
const BIG_ON_PURPOSE = new Set<string>([
  // The onboarding prototype export: one self-contained file with its fonts and images inlined.
  "docs/design/reference/onboarding-prototype.html",
]);

function findSecrets(text: string): Finding[] {
  return SECRETS.flatMap(([rule, pattern]) => {
    const found = pattern.exec(text);
    // Only the start of a match: a report must not repeat the secret.
    return found ? [{ rule, match: `${found[0].slice(0, 8)}…` }] : [];
  });
}

function findAttribution(text: string): Finding[] {
  const found = ATTRIBUTION.exec(text);
  return found
    ? [{ rule: "AI tool credited as an author", match: found[0] }]
    : [];
}

function findHomePath(text: string, home: string): Finding[] {
  if (home.length > 1 && text.includes(home))
    return [{ rule: "this computer's home folder", match: home }];
  for (const pattern of HOME_PATHS) {
    const found = pattern.exec(text);
    if (found) return [{ rule: "a home folder path", match: found[0] }];
  }
  return [];
}

function findEmails(text: string): Finding[] {
  return [...text.matchAll(EMAIL)]
    .filter(
      ([address, domain]) =>
        !NOT_AN_ADDRESS.test(address) &&
        !ALLOWED_EMAIL_DOMAIN.test(domain ?? "")
    )
    .map(([address]) => ({ rule: "an email address", match: address }));
}

function isBinary(bytes: Buffer): boolean {
  return bytes.subarray(0, 8000).includes(0);
}

/** Every guard on one file about to be committed: what's wrong with it, for people to read. */
function checkFile(path: string, bytes: Buffer, home: string): string[] {
  const problems: string[] = [];
  if (bytes.length > MAX_FILE_BYTES && !BIG_ON_PURPOSE.has(path))
    problems.push(`${path}: over ${MAX_FILE_BYTES / 1024 / 1024} MB`);
  if (isBinary(bytes)) return problems;
  const text = bytes.toString("utf8");
  for (const f of [
    ...findSecrets(text),
    ...findHomePath(text, home),
    ...findEmails(text),
    ...findAttribution(text),
  ])
    problems.push(`${path}: ${f.rule} (${f.match})`);
  return problems;
}

/** A commit message: no AI tool as an author, no address, and no secret pasted into it. */
function checkMessage(text: string): string[] {
  return [
    ...findAttribution(text),
    ...findEmails(text),
    ...findSecrets(text),
  ].map((f) => `commit message: ${f.rule} (${f.match})`);
}

export {
  BIG_ON_PURPOSE,
  MAX_FILE_BYTES,
  checkFile,
  checkMessage,
  findAttribution,
  findEmails,
  findHomePath,
  findSecrets,
  isBinary,
};
export type { Finding };
