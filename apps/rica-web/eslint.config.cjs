const nx = require('@nx/eslint-plugin');
const baseConfig = require('../../eslint.base.config.cjs');

module.exports = [
    ...baseConfig,
    ...nx.configs['flat/angular'],
    ...nx.configs['flat/angular-template'],
    {
        files: ['**/*.ts'],
        rules: {
            '@angular-eslint/directive-selector': [
                'error',
                {
                    type: 'attribute',
                    prefix: 'ricaweb',
                    style: 'camelCase',
                },
            ],
            '@angular-eslint/component-selector': [
                'error',
                {
                    type: 'element',
                    prefix: 'ricaweb',
                    style: 'kebab-case',
                },
            ],
            '@angular-eslint/template/click-events-have-key-events': 'off',
            '@angular-eslint/template/interactive-supports-focus': 'off'
        },
    },
    {
        files: ['**/*.html'],
        rules: {
            '@angular-eslint/template/click-events-have-key-events': 'off',
            '@angular-eslint/template/interactive-supports-focus': 'off'
        },
    },
    {
        files: ['**/*.html'],
        // Override or add rules here
        rules: {},
    },
];
