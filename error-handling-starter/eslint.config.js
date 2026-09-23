import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';

export default [
  { ignores: ['dist/'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettierConfig,
  // Test files are plain JS running in Node — declare globals explicitly
  // since tseslint's type-aware scope analysis doesn't cover .js files.
  {
    files: ['tests/**/*.js'],
    languageOptions: {
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
      },
    },
  },
  {
    files: ['src/**/*.ts'],
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'error',
    },
  },
];
