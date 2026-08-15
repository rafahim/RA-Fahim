import { FlatCompat } from '@eslint/eslintrc';

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    ignores: ['.next/**', 'node_modules/**', 'next-env.d.ts'],
  },
  {
    // App Router's root layout is exactly the supported place to load
    // custom fonts via <link> (this rule was written for the old Pages
    // Router's pages/_document.js and doesn't apply here).
    files: ['app/layout.tsx'],
    rules: {
      '@next/next/no-page-custom-font': 'off',
    },
  },
];

export default eslintConfig;
