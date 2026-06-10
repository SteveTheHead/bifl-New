import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Pre-existing tech debt: ~200 `as any` / `: any` sites (mostly Supabase
      // query-builder workarounds). Tracked as a warning so the build gate can
      // be ON and catch *real* errors, without blocking deploys on a 200-site
      // typing marathon. Burn these down incrementally; do not add new ones.
      "@typescript-eslint/no-explicit-any": "warn",
      // Allow intentionally-unused names when prefixed with `_` (standard convention).
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" },
      ],
    },
  },
];

export default eslintConfig;
