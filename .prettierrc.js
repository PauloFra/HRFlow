module.exports = {
    // Basic formatting
    printWidth: 80,
    tabWidth: 2,
    useTabs: false,
    semi: true,
    singleQuote: true,
    quoteProps: 'as-needed',
    trailingComma: 'es5',
    bracketSpacing: true,
    bracketSameLine: false,
    arrowParens: 'avoid',
    endOfLine: 'lf',

    // TypeScript/React specific
    jsxSingleQuote: true,

    // Plugin configurations
    plugins: [
        '@trivago/prettier-plugin-sort-imports',
        'prettier-plugin-tailwindcss',
    ],

    // Import sorting
    importOrder: [
        '^(react|next)$',
        '^@?\\w',
        '^[./]',
    ],
    importOrderSeparation: true,
    importOrderSortSpecifiers: true,

    // File-specific overrides
    overrides: [
        {
            files: '*.json',
            options: {
                printWidth: 120,
            },
        },
        {
            files: '*.md',
            options: {
                printWidth: 100,
                proseWrap: 'always',
            },
        },
        {
            files: '*.yml',
            options: {
                tabWidth: 2,
                singleQuote: false,
            },
        },
        {
            files: '*.sql',
            options: {
                printWidth: 120,
                tabWidth: 2,
            },
        },
    ],
}; 