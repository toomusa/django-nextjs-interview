/**
 * API Service for communicating with the Django backend
 * Handles all HTTP requests and data fetching for the application
 */

import { ApiResponse, TimelineApiResponse } from '@/types/activity';

// Base URL for the Django backend API
const API_BASE_URL = 'http://localhost:8000';

/**
 * Centralized API service class that handles all backend communication
 * Uses static methods for easy access throughout the application
 */
export class ApiService {
	// Default values for demo purposes - in production, these would come from user context
	private static readonly DEFAULT_CUSTOMER_ORG_ID = 'org_4m6zyrass98vvtk3xh5kcwcmaf';
	private static readonly DEFAULT_ACCOUNT_ID = 'account_31crr1tcp2bmcv1fk6pcm0k6ag';

	/**
	 * Fetches paginated activity events from the backend
	 * Supports pagination and date-based navigation
	 *
	 * @param page - Page number to fetch (1-indexed)
	 * @param pageSize - Number of items per page
	 * @param targetDate - Optional date to navigate to (YYYY-MM-DD format)
	 * @returns Promise containing activity events and pagination info
	 */
	static async fetchActivityEvents(
		page: number = 1,
		pageSize: number = 50,
		targetDate?: string
	): Promise<ApiResponse> {
		// Build query parameters for the API request
		const params = new URLSearchParams({
			customer_org_id: this.DEFAULT_CUSTOMER_ORG_ID,
			account_id: this.DEFAULT_ACCOUNT_ID,
			page: page.toString(),
			page_size: pageSize.toString(),
		});

		// Add optional target date for navigation
		if (targetDate) {
			params.append('date', targetDate);
		}

		// Make the HTTP request
		const response = await fetch(`${API_BASE_URL}/api/events/?${params}`);

		// Handle HTTP errors
		if (!response.ok) {
			throw new Error(`Failed to fetch activity events: ${response.statusText}`);
		}

		// Parse and return the JSON response
		return response.json();
	}

	/**
	 * Fetches timeline data for the minimap chart
	 * Gets daily activity counts and first touchpoint markers
	 *
	 * @returns Promise containing timeline chart data
	 */
	static async fetchTimelineData(): Promise<TimelineApiResponse> {
		// Build query parameters
		const params = new URLSearchParams({
			customer_org_id: this.DEFAULT_CUSTOMER_ORG_ID,
			account_id: this.DEFAULT_ACCOUNT_ID,
		});

		// Make the HTTP request
		const response = await fetch(`${API_BASE_URL}/api/timeline/?${params}`);

		// Handle HTTP errors
		if (!response.ok) {
			throw new Error(`Failed to fetch timeline data: ${response.statusText}`);
		}

		// Parse and return the JSON response
		return response.json();
	}
}
