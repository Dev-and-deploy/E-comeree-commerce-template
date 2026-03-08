export default [
  {
    files: ['**/*.js'],
    rules: {
      semi: 'error',
      'no-unused-vars': 'warn',
      quotes: ['error', 'single'],
      //  "no-console": "warn",
      'no-duplicate-imports': 'error',
      'no-multiple-empty-lines': ['error', { max: 1 }],
    },
  },
];
