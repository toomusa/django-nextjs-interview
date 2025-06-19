/**
 * Test setup file
 * Configures testing environment and global mocks
 */

import '@testing-library/jest-dom';

// Mock IntersectionObserver for components that use it
class MockIntersectionObserver {
	observe = jest.fn();
	disconnect = jest.fn();
	unobserve = jest.fn();
}

Object.defineProperty(window, 'IntersectionObserver', {
	writable: true,
	configurable: true,
	value: MockIntersectionObserver,
});

Object.defineProperty(global, 'IntersectionObserver', {
	writable: true,
	configurable: true,
	value: MockIntersectionObserver,
});

// Mock ResizeObserver for Recharts
class MockResizeObserver {
	observe = jest.fn();
	disconnect = jest.fn();
	unobserve = jest.fn();
}

Object.defineProperty(window, 'ResizeObserver', {
	writable: true,
	configurable: true,
	value: MockResizeObserver,
});

// Mock getBoundingClientRect for positioning calculations
Element.prototype.getBoundingClientRect = jest.fn(() => ({
	width: 800,
	height: 200,
	top: 0,
	left: 0,
	bottom: 0,
	right: 0,
	x: 0,
	y: 0,
	toJSON: () => {},
}));

// Suppress console warnings during tests
const originalWarn = console.warn;
beforeAll(() => {
	console.warn = (...args: any[]) => {
		if (
			typeof args[0] === 'string' &&
			args[0].includes('ReactDOM.render is no longer supported')
		) {
			return;
		}
		originalWarn.call(console, ...args);
	};
});

afterAll(() => {
	console.warn = originalWarn;
});
