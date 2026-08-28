import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Legal } from "@/components/sections";
import { resolveTokens } from "@/lib/tokens";
import type { SiteConfig } from "@/lib/types";

/**
 * The `legal` section renders a routed policy page (`/privacy`, `/terms`).
 *
 * Two things are worth pinning. First its document structure: a policy is read
 * rather than skimmed, and headings are how anyone finds the clause they care
 * about. Second — and this is the one that would actually ship broken — token
 * expansion has to reach `pages[].sections`, not just the home page's
 * `sections`. The privacy copy leans on `{siteName}`, `{email}` and `{address}`
 * for the facts a policy is legally required to state correctly, so a walk that
 * stopped at the home page would publish a policy reading "contact us at
 * {email}".
 */

describe("legal section", () => {
  const html = renderToStaticMarkup(
    <Legal
      eyebrow="Legal"
      title="Privacy policy"
      updated="Last updated: 1 January 2026"
      intro="What we collect and why."
      blocks={[
        { heading: "Who we are", body: "We are a business." },
        { heading: "What we collect", body: ["Only what you send.", "Nothing else."], bullets: ["Your name", "Your email"] },
        { body: "An unheaded closing paragraph." },
      ]}
    />,
  );

  it("renders the title as the page h1 and each block heading as an h2", () => {
    expect(html).toContain("<h1");
    expect(html).toContain("Privacy policy");
    expect((html.match(/<h2/g) ?? []).length).toBe(2);
    expect(html).toContain("Who we are");
  });

  it("renders every paragraph, bullet, and an unheaded block", () => {
    expect(html).toContain("Only what you send.");
    expect(html).toContain("Nothing else.");
    expect(html).toContain("Your email");
    expect(html).toContain("An unheaded closing paragraph.");
  });

  it("shows the last-updated line", () => {
    expect(html).toContain("Last updated: 1 January 2026");
  });
});

describe("tokens reach routed pages", () => {
  it("expands {siteName}/{email}/{address} inside pages[].sections", () => {
    const config = resolveTokens({
      siteName: "Acme Roofing",
      business: {
        email: "hello@acme.test",
        address: "1 High Street, Springfield",
        phone: "+1 555 0100",
      },
      sections: [],
      pages: [
        {
          slug: "privacy",
          title: "Privacy",
          sections: [
            {
              type: "legal",
              enabled: true,
              props: {
                title: "Privacy policy",
                blocks: [{ body: "{siteName} can be reached at {email} or {address}." }],
              },
            },
          ],
        },
      ],
    } as unknown as SiteConfig);

    const body = (config.pages?.[0].sections[0].props as { blocks: { body: string }[] }).blocks[0].body;

    expect(body).toContain("Acme Roofing");
    expect(body).toContain("hello@acme.test");
    expect(body).toContain("1 High Street, Springfield");
    expect(body, "an unexpanded token would ship as literal braces").not.toContain("{");
  });
});
