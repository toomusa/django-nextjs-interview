/**
 * Unit tests for API service functions
 * Tests HTTP requests, error handling, and parameter passing
 */

import { ApiService } from '@/lib/api';

// Mock fetch globally
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('ApiService', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	afterEach(() => {
		jest.resetAllMocks();
	});

	describe('fetchActivityEvents', () => {
		const mockResponse = {
			events: [
				{
					id: 1,
					timestamp: '2024-01-15T10:00:00Z',
					activity: 'Test activity',
					channel: 'EMAIL',
					status: 'SENT',
					direction: 'OUT',
					people: [],
					involved_team_ids: ['SALES'],
				},
			],
			persons: {},
			pagination: {
				current_page: 1,
				total_pages: 1,
				total_count: 1,
				has_next: false,
				has_previous: false,
			},
		};

		/**
		 * Test: Successful API call with default parameters
		 */
		it('fetches activity events successfully with default parameters', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => mockResponse,
			} as Response);

			const result = await ApiService.fetchActivityEvents();

			expect(mockFetch).toHaveBeenCalledWith(
				'http://localhost:8000/api/events/?customer_org_id=org_4m6zyrass98vvtk3xh5kcwcmaf&account_id=account_31crr1tcp2bmcv1fk6pcm0k6ag&page=1&page_size=50'
			);
			expect(result).toEqual(mockResponse);
		});

		/**
		 * Test: API call with custom parameters
		 */
		it('fetches activity events with custom parameters', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => mockResponse,
			} as Response);

			await ApiService.fetchActivityEvents(2, 25, '2024-01-15');

			expect(mockFetch).toHaveBeenCalledWith(
				'http://localhost:8000/api/events/?customer_org_id=org_4m6zyrass98vvtk3xh5kcwcmaf&account_id=account_31crr1tcp2bmcv1fk6pcm0k6ag&page=2&page_size=25&date=2024-01-15'
			);
		});

		/**
		 * Test: Error handling for HTTP errors
		 */
		it('throws error when API request fails', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: false,
				statusText: 'Internal Server Error',
			} as Response);

			await expect(ApiService.fetchActivityEvents()).rejects.toThrow(
				'Failed to fetch activity events: Internal Server Error'
			);
		});

		/**
		 * Test: Network error handling
		 */
		it('throws error when network request fails', async () => {
			mockFetch.mockRejectedValueOnce(new Error('Network error'));

			await expect(ApiService.fetchActivityEvents()).rejects.toThrow('Network error');
		});
	});

	describe('fetchTimelineData', () => {
		const mockTimelineResponse = {
			timeline_data: [
				{ date: '2024-01-15', count: 5 },
				{ date: '2024-01-16', count: 3 },
			],
			first_touchpoints: [
				{ person_id: 'person1', timestamp: '2024-01-15T10:00:00Z', date: '2024-01-15' },
			],
		};

		/**
		 * Test: Successful timeline data fetch
		 */
		it('fetches timeline data successfully', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => mockTimelineResponse,
			} as Response);

			const result = await ApiService.fetchTimelineData();

			expect(mockFetch).toHaveBeenCalledWith(
				'http://localhost:8000/api/timeline/?customer_org_id=org_4m6zyrass98vvtk3xh5kcwcmaf&account_id=account_31crr1tcp2bmcv1fk6pcm0k6ag'
			);
			expect(result).toEqual(mockTimelineResponse);
		});

		/**
		 * Test: Error handling for timeline data fetch
		 */
		it('throws error when timeline data request fails', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: false,
				statusText: 'Bad Request',
			} as Response);

			await expect(ApiService.fetchTimelineData()).rejects.toThrow(
				'Failed to fetch timeline data: Bad Request'
			);
		});
	});
});
