import { describe, expect, it } from "vitest";

import {
  findAttribution,
  findEmails,
  findHomePath,
  findSecrets,
  isBinary,
} from "./guards";

// Secret-, path- and address-shaped samples are assembled at run time, so this file never contains
// one: it is checked by the guards too.
const sample = (...parts: string[]) => parts.join("");

describe("the secret guard", () => {
  it("finds keys and tokens, and reports only their start", () => {
    const cases = [
      sample("-----BEGIN ", "OPENSSH PRIVATE KEY-----"),
      sample("sk-", "proj-", "a1".repeat(20)),
      sample("sk-", "ant-", "b2".repeat(20)),
      sample("gh", "p_", "c".repeat(36)),
      sample("github", "_pat_", "d".repeat(50)),
      sample("AK", "IA", "ABCDEFGHIJKLMNOP"),
      sample("npm", "_", "e".repeat(36)),
      sample("xo", "xb-", "1234567890-abc"),
      sample("AI", "za", "f".repeat(34), "-"),
      sample("-----BEGIN ", "PGP PRIVATE KEY BLOCK-----"),
      sample("vc", "p_", "g".repeat(30)),
      sample("sk_", "live_", "h".repeat(30)),
    ];
    for (const secret of cases) {
      const found = findSecrets(`const key = "${secret}";`);
      expect(found, secret.slice(0, 6)).toHaveLength(1);
      expect(found[0]?.match).not.toContain(secret.slice(10));
    }
  });

  it("leaves placeholders and ordinary text alone", () => {
    expect(findSecrets('placeholder="sk-…" OPENAI_API_KEY apiKeyEnv')).toEqual(
      []
    );
    expect(findSecrets("ask-your-agent-to-do-something-long-enough")).toEqual(
      []
    );
  });
});

describe("the authorship guard", () => {
  it("finds AI attribution trailers and lines", () => {
    expect(
      findAttribution(sample("Co-Authored", "-By: Some Model <x@y.z>"))
    ).toHaveLength(1);
    expect(findAttribution(sample("noreply@", "anthropic.com"))).toHaveLength(
      1
    );
    expect(
      findAttribution(sample("Generated with ", "[Claude Code]"))
    ).toHaveLength(1);
  });

  it("allows the rule that forbids them", () => {
    expect(
      findAttribution("no `Co-Authored-By` trailers for coding agents")
    ).toEqual([]);
  });
});

describe("the personal path guard", () => {
  const mac = sample("/Us", "ers/someone");
  const linux = sample("/ho", "me/someone");
  const windows = sample("C:\\Us", "ers\\someone");

  it("finds the home folder of whoever runs it", () => {
    expect(findHomePath(`--font ${mac}/x.ttf`, mac)).toHaveLength(1);
    expect(findHomePath("--font firmware/x.ttf", mac)).toEqual([]);
  });

  it("finds a home folder from any other machine", () => {
    expect(findHomePath(`${mac}/x.ttf`, "/root")).toHaveLength(1);
    expect(findHomePath(`${linux}/x.ttf`, "/root")).toHaveLength(1);
    expect(findHomePath(`${windows}\\x.ttf`, "/root")).toHaveLength(1);
    expect(findHomePath("src/Users/list.ts users/home", "/root")).toEqual([]);
  });

  it("finds a home folder without a trailing slash, with a space, or escaped", () => {
    expect(findHomePath(`cwd="${mac}"`, "/root")).toHaveLength(1);
    expect(
      findHomePath(`${sample("/Us", "ers/Some One")}/x`, "/root")
    ).toHaveLength(1);
    expect(
      findHomePath(`"${sample("C:\\\\Us", "ers\\\\someone")}\\\\proj"`, "/root")
    ).toHaveLength(1);
  });

  it("leaves an import path through a home route alone", () => {
    expect(
      findHomePath(
        'import { Hero } from "@/app/home/_components/hero";',
        "/root"
      )
    ).toEqual([]);
  });
});

describe("the email guard", () => {
  it("finds a real person's address", () => {
    expect(findEmails(sample("reach me at someone", "@", "mail.co"))).toEqual([
      { rule: "an email address", match: sample("someone", "@", "mail.co") },
    ]);
  });

  it("allows reserved example domains and GitHub's noreply addresses", () => {
    const allowed = [
      sample("artist", "@", "example.com"),
      sample("label", "@", "mail.example.org"),
      sample("someone", "@", "users.noreply.github.com"),
      sample("x", "@", "studio.test"),
    ];
    for (const address of allowed) expect(findEmails(address)).toEqual([]);
  });

  it("leaves retina assets and SSH remotes alone", () => {
    expect(findEmails("logo@2x.png icon@3x.webp")).toEqual([]);
    expect(
      findEmails(sample("git clone git", "@", "github.com:owner/repo"))
    ).toEqual([]);
  });

  it("leaves scoped package names and versions alone", () => {
    expect(findEmails("@tailwindcss/postcss react@19.3.1 @types/node")).toEqual(
      []
    );
  });
});

describe("binary files", () => {
  it("are told apart from text by a NUL byte", () => {
    expect(isBinary(Buffer.from([0x50, 0x4b, 0x00, 0x01]))).toBe(true);
    expect(isBinary(Buffer.from("plain text"))).toBe(false);
  });
});
