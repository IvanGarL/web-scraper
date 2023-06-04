const testMatch = ['**/*.test.ts'];
/* eslint-disable */
module.exports = {
    displayName: 'web-scraper-test',
    roots: ['src/', 'node_modules/'],
    globals: {
        'ts-jest': {
            tsconfig: '<rootDir>/tsconfig.json',
        },
    },
    transform: {
        '^.+\\.[tj]sx?$': 'ts-jest',
    },
    testTimeout: 170000,
    moduleDirectories: ['node_modules', 'src'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
    restoreMocks: true,
    testMatch,
};