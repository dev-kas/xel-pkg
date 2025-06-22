import prettier from 'eslint-plugin-prettier';
import globals from 'globals';
import js from '@eslint/js';

export default [
  {
    ignores: [
      '**/node_modules/',
      '**/dist/',
      'public/api-explorer/',
      '**/*.yaml',
      '**/*.yml',
    ],
  },
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.mocha,
      },
    },
    plugins: {
      prettier,
    },
    rules: {
      'no-unused-vars': 'error',

      'prettier/prettier': [
        'error',
        {
          singleQuote: true,
          trailingComma: 'es5',
          bracketSpacing: true,
          printWidth: 80,
        },
      ],
    },
  },
];
