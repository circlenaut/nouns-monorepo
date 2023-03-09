module.exports = {
  settings: {
    react: {
        version: 'detect',
    },
  },
  extends: [
    'plugin:react/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:jest/recommended',
  ],
  rules: {
    'react/no-set-state': 'off',
    'jest/expect-expect': 'error',
    'jest/prefer-lowercase-title': [
        'error',
        {
            ignore: ['describe'],
        },
    ],
    'jest/no-disabled-tests': 'error',
    'jest/no-done-callback': 'error',
    'jest/no-duplicate-hooks': 'error',
    'jest/no-conditional-expect': 'error',
    'jest/no-export': 'error',
    'jest/no-focused-tests': 'error',
    'jest/no-identical-title': 'error',
    'jest/no-interpolation-in-snapshots': 'error',
    'jest/no-jasmine-globals': 'error',
    'jest/no-large-snapshots': 'error',
    'jest/no-mocks-import': 'error',
    'jest/no-standalone-expect': 'error',
    'jest/no-test-prefixes': 'error',
    'jest/valid-describe-callback': 'error',
    'jest/valid-expect-in-promise': 'error',
    'jest/prefer-to-have-length': 'warn',
    'jest/valid-expect': 'error',
  },
  ignorePatterns: [
    '**/*.js', 'dist', '**/*.d.ts', '**/vite.config.ts'
  ],
};
