/**
 * Unit tests for utility functions
 * Tests date formatting, styling helpers, and other utility functions
 */

import {
	formatRelativeTime,
	formatDate,
	formatDateTime,
	calculateDateGap,
	cn,
	debounce,
} from '@/lib/utils';

describe('Utility Functions', () => {
	describe('formatRelativeTime', () => {
		/**
		 * Test: Formats recent dates correctly
		 */
		it('formats recent dates correctly', () => {
			const now = new Date();
			const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

			const result = formatRelativeTime(oneHourAgo.toISOString());
			expect(result).toMatch(/about 1 hour ago|1 hour ago/);
		});

		/**
		 * Test: Formats older dates correctly
		 */
		it('formats older dates correctly', () => {
			const threeDaysAgo = new Date('2024-01-12T10:00:00Z');

			// Mock current date for consistent testing
			const mockNow = new Date('2024-01-15T10:00:00Z');
			jest.spyOn(Date, 'now').mockReturnValue(mockNow.getTime());

			const result = formatRelativeTime(threeDaysAgo.toISOString());
			expect(result).toMatch(/3 days ago/);

			jest.restoreAllMocks();
		});
	});

	describe('formatDate', () => {
		/**
		 * Test: Formats date in readable format
		 */
		it('formats date in readable format', () => {
			const date = '2024-01-15T10:30:00Z';
			const result = formatDate(date);
			expect(result).toBe('Jan 15, 2024');
		});
	});

	describe('formatDateTime', () => {
		/**
		 * Test: Formats date and time in readable format
		 */
		it('formats date and time in readable format', () => {
			const date = '2024-01-15T14:30:00Z';
			const result = formatDateTime(date);
			expect(result).toMatch(/Jan 15, 2024 6:30 AM/);
		});
	});

	describe('calculateDateGap', () => {
		/**
		 * Test: Calculates correct day difference
		 */
		it('calculates correct day difference', () => {
			const currentDate = '2024-01-15T10:00:00Z';
			const previousDate = '2024-01-12T10:00:00Z';

			const result = calculateDateGap(currentDate, previousDate);
			expect(result).toBe(3);
		});

		/**
		 * Test: Returns zero for same day
		 */
		it('returns zero for same day', () => {
			const date1 = '2024-01-15T10:00:00Z';
			const date2 = '2024-01-15T18:00:00Z';

			const result = calculateDateGap(date1, date2);
			expect(result).toBe(0);
		});
	});

	describe('cn', () => {
		/**
		 * Test: Joins class names correctly
		 */
		it('joins class names correctly', () => {
			const result = cn('class1', 'class2', 'class3');
			expect(result).toBe('class1 class2 class3');
		});

		/**
		 * Test: Filters out falsy values
		 */
		it('filters out falsy values', () => {
			const result = cn('class1', null, undefined, false, 'class2', '');
			expect(result).toBe('class1 class2');
		});

		/**
		 * Test: Handles empty input
		 */
		it('handles empty input', () => {
			const result = cn();
			expect(result).toBe('');
		});
	});

	describe('debounce', () => {
		/**
		 * Test: Debounces function calls
		 */
		it('debounces function calls', (done) => {
			const mockFn = jest.fn();
			const debouncedFn = debounce(mockFn, 100);

			// Call multiple times quickly
			debouncedFn('arg1');
			debouncedFn('arg2');
			debouncedFn('arg3');

			// Should not be called immediately
			expect(mockFn).not.toHaveBeenCalled();

			// Should be called once after delay with last argument
			setTimeout(() => {
				expect(mockFn).toHaveBeenCalledTimes(1);
				expect(mockFn).toHaveBeenCalledWith('arg3');
				done();
			}, 150);
		});

		/**
		 * Test: Cancels previous calls when called again
		 */
		it('cancels previous calls when called again', (done) => {
			const mockFn = jest.fn();
			const debouncedFn = debounce(mockFn, 100);

			debouncedFn('first');

			setTimeout(() => {
				debouncedFn('second');
			}, 50);

			setTimeout(() => {
				expect(mockFn).toHaveBeenCalledTimes(1);
				expect(mockFn).toHaveBeenCalledWith('second');
				done();
			}, 200);
		});
	});
});
