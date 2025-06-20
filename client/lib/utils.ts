/**
 * Utility functions for data formatting, styling, and common operations
 * Used throughout the application for consistent data presentation
 */

import { format, formatDistanceToNow, parseISO, differenceInDays } from 'date-fns';

/**
 * Formats a date string into a human-readable relative time
 * Examples: "2 hours ago", "3 days ago", "1 month ago"
 *
 * @param dateString - ISO date string to format
 * @returns Formatted relative time string
 */
export function formatRelativeTime(dateString: string): string {
	const date = parseISO(dateString);
	return formatDistanceToNow(date, { addSuffix: true });
}

/**
 * Formats a date string into a readable date format
 * Example: "Mar 15, 2024"
 *
 * @param dateString - ISO date string to format
 * @returns Formatted date string
 */
export function formatDate(dateString: string): string {
	const date = parseISO(dateString);
	return format(date, 'MMM d, yyyy');
}

/**
 * Formats a date string into a full date and time format
 * Example: "Mar 15, 2024 2:30 PM"
 *
 * @param dateString - ISO date string to format
 * @returns Formatted date and time string
 */
export function formatDateTime(dateString: string): string {
	const date = parseISO(dateString);
	return format(date, 'MMM d, yyyy h:mm a');
}

/**
 * Calculates the number of days between two dates
 * Used to determine if a "gap indicator" should be shown in the timeline
 *
 * @param currentDate - Later date (ISO string)
 * @param previousDate - Earlier date (ISO string)
 * @returns Number of days between the dates
 */
export function calculateDateGap(currentDate: string, previousDate: string): number {
	const current = parseISO(currentDate);
	const previous = parseISO(previousDate);
	return differenceInDays(current, previous);
}

/**
 * Utility function for conditionally joining CSS class names
 * Filters out falsy values and joins remaining strings with spaces
 *
 * @param classes - Array of class strings, some may be falsy
 * @returns Single string of joined class names
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
	return classes.filter(Boolean).join(' ');
}

/**
 * Creates a debounced version of a function
 * Useful for performance optimization with frequently called functions
 *
 * @param func - Function to debounce
 * @param wait - Delay in milliseconds before executing
 * @returns Debounced version of the function
 */
export function debounce<T extends (...args: any[]) => any>(
	func: T,
	wait: number
): (...args: Parameters<T>) => void {
	let timeout: NodeJS.Timeout;

	return (...args: Parameters<T>) => {
		// Clear existing timeout
		clearTimeout(timeout);

		// Set new timeout to execute function after delay
		timeout = setTimeout(() => func(...args), wait);
	};
}
