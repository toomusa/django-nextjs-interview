/**
 * Unit tests for ActivityMinimap component
 * Tests loading states, error handling, data rendering, and user interactions
 */

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { ActivityMinimap } from '@/components/ActivityMinimap';
import { ApiService } from '@/lib/api';
import '@testing-library/jest-dom';

// Mock the API service
jest.mock('@/lib/api');
const mockApiService = ApiService as jest.Mocked<typeof ApiService>;

// Mock Recharts components to avoid canvas rendering issues in tests
jest.mock('recharts', () => ({
	LineChart: ({ children, onClick }: any) => (
		<div data-testid="line-chart" onClick={() => onClick({ activeLabel: '2024-01-15' })}>
			{children}
		</div>
	),
	Line: () => <div data-testid="line" />,
	XAxis: () => <div data-testid="x-axis" />,
	YAxis: () => <div data-testid="y-axis" />,
	ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
	ReferenceLine: ({ x }: any) => <div data-testid={`reference-line-${x}`} />,
}));

describe('ActivityMinimap', () => {
	const mockOnDateClick = jest.fn();

	const mockTimelineResponse = {
		timeline_data: [
			{ date: '2024-01-15', count: 5 },
			{ date: '2024-01-16', count: 3 },
			{ date: '2024-01-17', count: 8 },
		],
		first_touchpoints: [
			{ person_id: 'person1', timestamp: '2024-01-15T10:00:00Z', date: '2024-01-15' },
			{ person_id: 'person2', timestamp: '2024-01-16T14:30:00Z', date: '2024-01-16' },
		],
	};

	beforeEach(() => {
		jest.clearAllMocks();
	});

	/**
	 * Test: Component shows loading state initially
	 */
	it('displays loading state initially', () => {
		mockApiService.fetchTimelineData.mockImplementation(() => new Promise(() => {}));

		render(<ActivityMinimap onDateClick={mockOnDateClick} />);

		expect(screen.getByText('Loading timeline...')).toBeInTheDocument();
		expect(screen.getByTestId('loader')).toBeInTheDocument();
	});

	/**
	 * Test: Component renders successfully with data
	 */
	it('renders timeline data successfully', async () => {
		mockApiService.fetchTimelineData.mockResolvedValue(mockTimelineResponse);

		render(<ActivityMinimap onDateClick={mockOnDateClick} />);

		await waitFor(() => {
			expect(screen.getByText('Navigation Minimap')).toBeInTheDocument();
		});
	});

	/**
	 * Test: Component handles API errors gracefully
	 */
	it('displays error state when API fails', async () => {
		const errorMessage = 'Failed to load timeline data';
		mockApiService.fetchTimelineData.mockRejectedValue(new Error(errorMessage));

		render(<ActivityMinimap onDateClick={mockOnDateClick} />);

		await waitFor(() => {
			expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument();
		});
	});

	/**
	 * Test: Chart click triggers navigation callback
	 */
	it('calls onDateClick when chart is clicked', async () => {
		mockApiService.fetchTimelineData.mockResolvedValue(mockTimelineResponse);

		render(<ActivityMinimap onDateClick={mockOnDateClick} />);

		await waitFor(() => {
			expect(screen.getByTestId('line-chart')).toBeInTheDocument();
		});

		fireEvent.click(screen.getByTestId('line-chart'));

		expect(mockOnDateClick).toHaveBeenCalledWith('2024-01-15');
	});

	/**
	 * Test: Visible range indicators are displayed when provided
	 */
	it('displays visible range indicators', async () => {
		mockApiService.fetchTimelineData.mockResolvedValue(mockTimelineResponse);

		render(
			<ActivityMinimap
				onDateClick={mockOnDateClick}
				visibleStartDate="2024-01-15"
				visibleEndDate="2024-01-17"
			/>
		);

		await waitFor(() => {
			expect(screen.getByTestId('reference-line-2024-01-15')).toBeInTheDocument();
			expect(screen.getByTestId('reference-line-2024-01-17')).toBeInTheDocument();
		});
	});

	/**
	 * Test: Orange touchpoint markers are rendered
	 */
	it('renders first touchpoint markers', async () => {
		mockApiService.fetchTimelineData.mockResolvedValue(mockTimelineResponse);

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

		render(<ActivityMinimap onDateClick={mockOnDateClick} />);

		await waitFor(() => {
			expect(screen.getByTestId('line-chart')).toBeInTheDocument();
		});

		// Check that touchpoint markers are rendered
		const markers = screen.getAllByTitle(/First touchpoint for person/);
		expect(markers).toHaveLength(2);
	});
});
