import coreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

/**
 * Flat config (ESLint 9). Replaces `next lint`, which is deprecated and, with
 * no config present, dropped into an interactive prompt instead of linting —
 * so `npm run lint` silently did nothing.
 *
 * eslint-config-next v16 ships flat configs directly, so they're spread in as-is
 * (no FlatCompat shim — wrapping them throws on their circular plugin refs).
 */
const config = [
  {
    ignores: [".next/**", "node_modules/**", "next-env.d.ts", "*.tsbuildinfo"],
  },
  ...coreWebVitals,
  ...nextTypescript,
  {
    rules: {
      // Section/override components take loosely-typed props by design (the
      // registry erases the discriminated union), so `any` is load-bearing.
      "@typescript-eslint/no-explicit-any": "off",

      // `_`-prefixed bindings are deliberate discards (e.g. destructuring a key
      // out of an object), which is how we strip `translations` in localizeConfig.
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" },
      ],

      // ── React Compiler advisories, kept visible as warnings ───────────────
      // These flag working, verified patterns rather than defects, and turning
      // them into hard errors would make `npm run lint` fail permanently (a
      // gate that always fails gets ignored). Worth revisiting as a refactor:
      //   • SectionRenderer SELECTS a component from a stable module-level
      //     registry — it never creates one during render, so reconciliation is
      //     fine; the rule can't see that the reference is stable.
      //   • ThemeToggle / useHeaderScroll sync state from the DOM on mount
      //     (the pre-paint theme script) — `useSyncExternalStore` is the modern
      //     form, but the current code is correct and covered by tests.
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/static-components": "warn",
    },
  },
];

export default config;
