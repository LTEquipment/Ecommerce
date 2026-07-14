import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

/**
 * ESLint flat config (Next.js 16 dropped `next lint`; lint runs via the ESLint
 * CLI — see the "lint" script in package.json). eslint-config-next 16 ships
 * native flat-config arrays, so they spread in directly.
 */
const eslintConfig = [
  ...coreWebVitals,
  ...typescript,
  {
    ignores: [".next/**", "out/**", "build/**", "next-env.d.ts"],
  },
];

export default eslintConfig;
