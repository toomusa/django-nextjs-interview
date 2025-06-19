/**
 * Unit tests for ActivityTimelineTable component
 * Tests data loading, infinite scroll, navigation, and rendering logic
 */

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { ActivityTimelineTable } from '@/components/ActivityTimelineTable';
import { ApiService } from '@/lib/api';
import '@testing-library/jest-dom';

// Mock the API service
jest.mock('@/lib/api');
const mockApiService = ApiService as jest.Mocked<typeof ApiService>;

// Mock react-intersection-observer
jest.mock('react-intersection-observer', () => ({
	useInView: () => ({ ref: jest.fn(), inView: false }),
}));

describe('ActivityTimelineTable', () => {
	const mockOnVisibleRangeChange = jest.fn();
	const mockOnNavigationComplete = jest.fn();

	// Fixed mock data with proper Person objects in people array
	const mockApiResponse = {
		events: [
			{
				id: 1,
				timestamp: '2024-01-15T10:00:00Z',
				activity: 'Email sent to customer',
				channel: 'EMAIL',
				status: 'SENT',
				direction: 'OUT' as const,
				people: [
					{
						id: 'person1',
						first_name: 'John',
						last_name: 'Doe',
						email_address: 'john@example.com',
						job_title: 'Manager'
					}
				],
				involved_team_ids: ['SALES'],
			},
			{
				id: 2,
				timestamp: '2024-01-14T15:30:00Z',
				activity: 'Phone call received',
				channel: 'PHONE',
				status: 'COMPLETED',
				direction: 'IN' as const,
				people: [
					{
						id: 'person2',
						first_name: 'Jane',
						last_name: 'Smith',
						email_address: 'jane@example.com',
						job_title: 'Director'
					}
				],
				involved_team_ids: ['team_customer_success'],
			},
		],
		persons: {
			person1: {
				id: 'person1',
				first_name: 'John',
				last_name: 'Doe',
				email_address: 'john@example.com',
				job_title: 'Manager',
			},
			person2: {
				id: 'person2',
				first_name: 'Jane',
				last_name: 'Smith',
				email_address: 'jane@example.com',
				job_title: 'Director',
			},
		},
		pagination: {
			current_page: 1,
			total_pages: 1,
			total_count: 2,
			has_next: false,
			has_previous: false,
		},
	};

	beforeEach(() => {
		jest.clearAllMocks();
	});

	/**
	 * Test: Component shows loading state initially
	 */
	it('displays loading state initially', () => {
		mockApiService.fetchActivityEvents.mockImplementation(() => new Promise(() => {}));

		render(<ActivityTimelineTable onVisibleRangeChange={mockOnVisibleRangeChange} />);

		expect(screen.getByText('Loading activity events...')).toBeInTheDocument();
	});

	/**
	 * Test: Component renders activity data successfully
	 */
	it('renders activity events successfully', async () => {
		mockApiService.fetchActivityEvents.mockResolvedValue(mockApiResponse);

		render(<ActivityTimelineTable onVisibleRangeChange={mockOnVisibleRangeChange} />);

		await waitFor(() => {
			expect(screen.getByText('Touchpoints')).toBeInTheDocument();
		});
	});

	/**
	 * Test: Component handles API errors gracefully
	 */
	it('displays error state when API fails', async () => {
		const errorMessage = 'Failed to load events';
		mockApiService.fetchActivityEvents.mockRejectedValue(new Error(errorMessage));

		render(<ActivityTimelineTable onVisibleRangeChange={mockOnVisibleRangeChange} />);

		await waitFor(() => {
			expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument();
		});

		expect(screen.getByText('Retry')).toBeInTheDocument();
	});

	/**
	 * Test: Retry button works after error
	 */
	it('retries loading when retry button is clicked', async () => {
		mockApiService.fetchActivityEvents
			.mockRejectedValueOnce(new Error('Network error'))
			.mockResolvedValueOnce(mockApiResponse);

		render(<ActivityTimelineTable onVisibleRangeChange={mockOnVisibleRangeChange} />);

		await waitFor(() => {
			expect(screen.getByText('Retry')).toBeInTheDocument();
		});

		fireEvent.click(screen.getByText('Retry'));

		await waitFor(() => {
			expect(screen.getByText('Email sent to customer')).toBeInTheDocument();
		});
	});

	/**
	 * Test: Navigation to specific date works
	 */
	it('navigates to specific date when navigateToDate prop changes', async () => {
		mockApiService.fetchActivityEvents.mockResolvedValue(mockApiResponse);

		const { rerender } = render(
			<ActivityTimelineTable
				onVisibleRangeChange={mockOnVisibleRangeChange}
				onNavigationComplete={mockOnNavigationComplete}
			/>
		);

		await waitFor(() => {
			expect(screen.getByText('Touchpoints')).toBeInTheDocument();
		});

		// Simulate navigation to a specific date
		rerender(
			<ActivityTimelineTable
				onVisibleRangeChange={mockOnVisibleRangeChange}
				onNavigationComplete={mockOnNavigationComplete}
				navigateToDate="2024-01-15"
			/>
		);

		await waitFor(() => {
			expect(mockApiService.fetchActivityEvents).toHaveBeenCalledWith(1, 50, '2024-01-15');
			expect(mockOnNavigationComplete).toHaveBeenCalled();
		});
	});

	/**
	 * Test: Visible range callback is called with correct dates
	 */
	it('calls onVisibleRangeChange with correct date range', async () => {
		mockApiService.fetchActivityEvents.mockResolvedValue(mockApiResponse);

		render(<ActivityTimelineTable onVisibleRangeChange={mockOnVisibleRangeChange} />);

		await waitFor(() => {
			expect(mockOnVisibleRangeChange).toHaveBeenCalledWith('2024-01-14', '2024-01-15');
		});
	});

	/**
	 * Test: People display shows first person and count for additional
	 */
	it('displays people information correctly', async () => {
		const mockResponseWithMultiplePeople = {
			...mockApiResponse,
			events: [
				{
					...mockApiResponse.events[0],
					people: [
						{
							id: 'person1',
							first_name: 'John',
							last_name: 'Doe',
							email_address: 'john@example.com',
							job_title: 'Manager'
						},
						{
							id: 'person2',
							first_name: 'Jane',
							last_name: 'Smith',
							email_address: 'jane@example.com',
							job_title: 'Director'
						},
						{
							id: 'person3',
							first_name: 'Bob',
							last_name: 'Johnson',
							email_address: 'bob@example.com',
							job_title: 'Analyst'
						}
					],
				},
			],
		};

		mockApiService.fetchActivityEvents.mockResolvedValue(mockResponseWithMultiplePeople);

		render(<ActivityTimelineTable onVisibleRangeChange={mockOnVisibleRangeChange} />);

		await waitFor(() => {
			expect(screen.getByText('John Doe')).toBeInTheDocument();
			expect(screen.getByText('+2')).toBeInTheDocument();
		});
	});

	/**
	 * Test: Team badges display correct colors and names
	 */
	it('displays team information with correct formatting', async () => {
		mockApiService.fetchActivityEvents.mockResolvedValue(mockApiResponse);

		render(<ActivityTimelineTable onVisibleRangeChange={mockOnVisibleRangeChange} />);

		await waitFor(() => {
			expect(screen.getByText('SALES')).toBeInTheDocument();
			expect(screen.getByText('CUSTOMER SUCCESS')).toBeInTheDocument();
		});
	});

	/**
	 * Test: Direction arrows display correctly
	 */
	it('displays direction arrows correctly', async () => {
		mockApiService.fetchActivityEvents.mockResolvedValue(mockApiResponse);

		render(<ActivityTimelineTable onVisibleRangeChange={mockOnVisibleRangeChange} />);

		await waitFor(() => {
			// Check that direction indicators are present (arrows are rendered as SVG icons)
			const arrows = screen.getAllByRole('img', { hidden: true });
			expect(arrows.length).toBeGreaterThanOrEqual(2);
		});
	});

	/**
	 * Test: Gap indicator shows for large time gaps
	 */
	it('shows gap indicator for large time differences', async () => {
		const mockResponseWithGap = {
			...mockApiResponse,
			events: [
				mockApiResponse.events[0],
				{
					...mockApiResponse.events[1],
					timestamp: '2024-01-10T15:30:00Z', // 5 days earlier
				},
			],
		};

		mockApiService.fetchActivityEvents.mockResolvedValue(mockResponseWithGap);

		render(<ActivityTimelineTable onVisibleRangeChange={mockOnVisibleRangeChange} />);

		await waitFor(() => {
			expect(screen.getByText(/day gap/)).toBeInTheDocument();
		});
	});

	/**
	 * Test: Empty state displays when no events
	 */
	it('displays empty state when no events are available', async () => {
		const emptyResponse = {
			...mockApiResponse,
			events: [],
			pagination: { ...mockApiResponse.pagination, total_count: 0 },
		};

		mockApiService.fetchActivityEvents.mockResolvedValue(emptyResponse);

		render(<ActivityTimelineTable onVisibleRangeChange={mockOnVisibleRangeChange} />);

		await waitFor(() => {
			expect(screen.getByText('No activities found.')).toBeInTheDocument();
		});
	});
});
