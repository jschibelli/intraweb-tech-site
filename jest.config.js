const nextJest = require('next/jest')

const createJestConfig = nextJest({
    // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
    dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
    // Setup files to run before tests
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

    // Test environment
    testEnvironment: 'jest-environment-jsdom',

    // Module paths
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
    },

    // Test match patterns
    testMatch: [
        '**/__tests__/**/*.[jt]s?(x)',
        '**/?(*.)+(spec|test).[jt]s?(x)',
    ],

    // Ignore patterns
    testPathIgnorePatterns: [
        '/node_modules/',
        '/.next/',
        '/playwright-report/',
        '/test-results/',
        '/tests/e2e/', // Ignore Playwright E2E tests
    ],

    // Coverage configuration
    collectCoverageFrom: [
        'app/**/*.{js,jsx,ts,tsx}',
        'components/**/*.{js,jsx,ts,tsx}',
        'lib/**/*.{js,jsx,ts,tsx}',
        'hooks/**/*.{js,jsx,ts,tsx}',
        '!**/*.d.ts',
        '!**/node_modules/**',
        '!**/.next/**',
        '!**/coverage/**',
        '!**/playwright-report/**',
    ],

    // Coverage thresholds
    coverageThreshold: {
        global: {
            statements: 18,
            branches: 13,
            functions: 16,
            lines: 19,
        },
    },

    // Clear mocks between tests
    clearMocks: true,

    // Restore mocks between tests
    restoreMocks: true,
    // Add transform to handle TS/TSX via babel-jest
    transform: {
        '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
    },
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)
