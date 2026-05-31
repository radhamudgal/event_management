import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        process: 'readonly',
        console: 'readonly',
        __dirname: 'readonly'
      }
    },
    ignores: ['node_modules/**', 'dist/**', 'build/**'],
    rules: {
      'no-unused-vars': 'off',
      'no-undef': 'off'
    }
  }
];

