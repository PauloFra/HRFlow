module.exports = {
    root: true,
    env: {
        node: true,
        es2022: true,
    },
    extends: [
        'eslint:recommended',
        '@typescript-eslint/recommended',
        '@typescript-eslint/recommended-requiring-type-checking',
        'prettier',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        project: ['./backend/tsconfig.json', './frontend/tsconfig.json'],
    },
    plugins: ['@typescript-eslint', 'import', 'security'],
    rules: {
        // TypeScript specific
        '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
        '@typescript-eslint/explicit-function-return-type': 'warn',
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/prefer-nullish-coalescing': 'error',
        '@typescript-eslint/prefer-optional-chain': 'error',
        '@typescript-eslint/strict-boolean-expressions': 'error',
        '@typescript-eslint/prefer-readonly': 'error',
        '@typescript-eslint/prefer-readonly-parameter-types': 'off',
        '@typescript-eslint/no-floating-promises': 'error',
        '@typescript-eslint/await-thenable': 'error',
        '@typescript-eslint/no-misused-promises': 'error',

        // Import rules
        'import/order': [
            'error',
            {
                groups: [
                    'builtin',
                    'external',
                    'internal',
                    'parent',
                    'sibling',
                    'index',
                ],
                'newlines-between': 'always',
                alphabetize: {
                    order: 'asc',
                    caseInsensitive: true,
                },
            },
        ],
        'import/no-unresolved': 'error',
        'import/no-duplicates': 'error',

        // General rules
        'no-console': 'warn',
        'no-debugger': 'error',
        'prefer-const': 'error',
        'no-var': 'error',
        'object-shorthand': 'error',
        'prefer-template': 'error',
        'prefer-arrow-callback': 'error',
        'arrow-spacing': 'error',
        'no-duplicate-imports': 'error',
        'no-useless-concat': 'error',
        'prefer-spread': 'error',
        'prefer-rest-params': 'error',

        // Security rules
        'security/detect-object-injection': 'warn',
        'security/detect-non-literal-regexp': 'warn',
        'security/detect-possible-timing-attacks': 'warn',
        'security/detect-pseudoRandomBytes': 'error',
    },
    settings: {
        'import/resolver': {
            typescript: {
                alwaysTryTypes: true,
                project: ['./backend/tsconfig.json', './frontend/tsconfig.json'],
            },
        },
    },
    overrides: [
        {
            // Backend specific rules
            files: ['backend/**/*.ts'],
            env: {
                node: true,
            },
            rules: {
                'no-console': 'off', // Allow console in backend for logging
            },
        },
        {
            // Frontend specific rules
            files: ['frontend/**/*.{ts,tsx}'],
            env: {
                browser: true,
                es2022: true,
            },
            extends: [
                'plugin:react/recommended',
                'plugin:react-hooks/recommended',
                'plugin:jsx-a11y/recommended',
            ],
            plugins: ['react', 'react-hooks', 'jsx-a11y'],
            settings: {
                react: {
                    version: 'detect',
                },
            },
            rules: {
                'react/react-in-jsx-scope': 'off', // Next.js doesn't require React import
                'react/prop-types': 'off', // Using TypeScript for prop validation
                'react/display-name': 'off',
                'react/no-unescaped-entities': 'warn',
                'react-hooks/rules-of-hooks': 'error',
                'react-hooks/exhaustive-deps': 'warn',
                'jsx-a11y/anchor-is-valid': 'off', // Next.js Link component
            },
        },
        {
            // Test files
            files: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
            env: {
                jest: true,
            },
            extends: ['plugin:jest/recommended'],
            plugins: ['jest'],
            rules: {
                '@typescript-eslint/no-explicit-any': 'off',
                '@typescript-eslint/no-non-null-assertion': 'off',
            },
        },
    ],
    ignorePatterns: [
        'node_modules/',
        'dist/',
        'build/',
        '.next/',
        'coverage/',
        '*.config.js',
        '*.config.ts',
    ],
}; 