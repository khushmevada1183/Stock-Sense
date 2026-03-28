import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    rules: {
      "react/no-unescaped-entities": "off",
      "react-hooks/exhaustive-deps": "off",
      "@next/next/no-img-element": "off",
      "jsx-a11y/role-has-required-aria-props": "off",
      // Million.js optimization rules
      "react/jsx-key": ["error", { checkFragmentShorthand: true }],
      "react/jsx-no-duplicate-props": "error",
      "react/jsx-no-undef": "error"
    },
  },
];

export default eslintConfig;
