import { describe, expect, it } from "vitest";

import * as connect from "./connect/page";
import * as finding from "./finding/page";
import * as found from "./found/page";
import * as home from "./page";
import * as together from "./together/page";
import * as welcome from "./welcome/page";

// Next announces each client-side navigation by the page title, so every step needs its own.
describe("step titles", () => {
  it("gives every step its own title", () => {
    const titles = [finding, found, connect, together, welcome].map(
      (page) => page.metadata.title
    );
    // The start has no title of its own: it shows the site title.
    expect((home as { metadata?: unknown }).metadata).toBeUndefined();
    expect(titles).toEqual([
      "Getting to know you",
      "Found you",
      "Connect your pages",
      "Putting it together",
      "You're in",
    ]);
  });
});
