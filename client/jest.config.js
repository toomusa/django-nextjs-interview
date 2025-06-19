/**
 * Jest configuration for Next.js project
 * Configures testing environment, module resolution, and setup files
 */

const nextJest = require('next/jest');

// Create Jest config with Next.js settings
const createJestConfig = nextJest({
	// Path to Next.js app directory
	dir: './',
});

// Custom Jest configuration
const customJestConfig = {
	// Setup files to run before tests
	setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],

	// Test environment (jsdom for React components)
	testEnvironment: 'jest-environment-jsdom',

	// Module name mapping for path aliases
	moduleNameMapper: {
		'^@/(.*)$': '<rootDir>/$1',
	},

	// Files to collect coverage from
	collectCoverageFrom: [
		'components/**/*.{ts,tsx}',
		'lib/**/*.{ts,tsx}',
		'app/**/*.{ts,tsx}',
		'!**/*.d.ts',
		'!**/node_modules/**',
	],

	// Coverage thresholds
	coverageThreshold: {
		global: {
			branches: 70,
			functions: 70,
			lines: 70,
			statements: 70,
		},
	},

	// Test patterns
	testMatch: [
		'<rootDir>/tests/**/*.test.{ts,tsx}',
		'<rootDir>/**/tests/**/*.test.{ts,tsx}',
	],

	// Transform configuration
	transform: {
		'^.+\\.(ts|tsx)$': ['ts-jest', {
			tsconfig: 'tsconfig.json',
		}],
	},

	// Module file extensions
	moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
};

// Export Jest config created by Next.js with custom overrides
module.exports = createJestConfig(customJestConfig);
