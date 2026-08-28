import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Select } from "@/components/ui/Select";

/**
 * `Select` replaces the native `<select>` on the contact form (whose popup can't
 * be themed), which means the engine owns its accessibility contract outright —
 * there is no platform behaviour left to fall back on when an attribute goes
 * missing.
 *
 * It shipped carrying `role="combobox"` and `aria-expanded` but no
 * `aria-controls`, so the trigger never pointed at the listbox it opens and a
 * screen reader announced a combobox with no route to its options. Nothing
 * caught that for weeks: it renders identically, and lint's warning was buried
 * in a count the docs described as "known advisories". These assertions pin the
 * contract so the next regression fails a test instead of a user.
 */

const html = renderToStaticMarkup(
  <Select name="service" options={["Roof repair", "Inspection"]} placeholder="Choose a service" />,
);

describe("Select (custom combobox)", () => {
  it("declares the full combobox relationship, not just the role", () => {
    expect(html).toContain('role="combobox"');
    expect(html).toContain('aria-haspopup="listbox"');
    expect(html).toContain('aria-expanded="false"');

    const controls = html.match(/aria-controls="([^"]+)"/)?.[1];
    expect(controls, "combobox must point at the listbox it opens").toBeTruthy();
  });

  it("mirrors its value into a hidden input so the form's FormData is unchanged", () => {
    // The visible control is a <button>, which contributes nothing to FormData —
    // the hidden input is the only reason the server action sees this field.
    expect(html).toMatch(/<input[^>]+type="hidden"[^>]+name="service"|<input[^>]+name="service"[^>]+type="hidden"/);
  });

  it("shows the placeholder until a value is picked", () => {
    expect(html).toContain("Choose a service");
  });
});
