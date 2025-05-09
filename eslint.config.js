// import js from '@eslint/js';
// import globals from 'globals';
// import reactHooks from 'eslint-plugin-react-hooks';
// import reactRefresh from 'eslint-plugin-react-refresh';
// import tseslint from 'typescript-eslint';

// export default tseslint.config(
//   { ignores: ['dist'] },
//   {
//     extends: [js.configs.recommended, ...tseslint.configs.recommended],
//     files: ['**/*.{ts,tsx}'],
//     languageOptions: {
//       ecmaVersion: 2020,
//       globals: globals.browser,
//     },
//     plugins: {
//       'react-hooks': reactHooks,
//       'react-refresh': reactRefresh,
//     },
//     rules: {
//       ...reactHooks.configs.recommended.rules,
//       'react-refresh/only-export-components': [
//         'warn',
//         { allowConstantExport: true },
//       ],
//     },
//   }
// );




import { defineConfig } from 'eslint';
import ts from '@typescript-eslint/eslint-plugin';
import js from '@eslint/js';
import globals from 'globals';

export default defineConfig({
  overrides: [
    {
      // Target all TypeScript files
      files: ['**/*.{ts,tsx}'],
      parserOptions: {
        project: './tsconfig.json',  // Use your tsconfig.json for TypeScript parsing
      },
      extends: [
        js.configs.recommended,  // JavaScript recommended config
        ...ts.configs.recommended,  // TypeScript recommended config
      ],
      plugins: {
        '@typescript-eslint': ts.plugin,  // TypeScript plugin
      },
      rules: {
        // You can customize or add more rules specific to your project
        'no-console': 'warn',  // Warn on console.log statements (often used for debugging in development)
        'consistent-return': 'error',  // Enforce consistent return statements in functions
        'no-unused-vars': 'warn',  // Warn on unused variables
        '@typescript-eslint/no-explicit-any': 'off',  // Disable "no-explicit-any" if you're okay with using "any"
        '@typescript-eslint/explicit-module-boundary-types': 'off',  // Disable explicit return type for functions
        '@typescript-eslint/no-non-null-assertion': 'warn',  // Warn on non-null assertions (e.g., `!` operator)
      },
      globals: {
        ...globals.node,  // Node.js global variables (e.g., `process`, `__dirname`, etc.)
      },
    },
  ],
});

