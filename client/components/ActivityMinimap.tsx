/**
 * Activity Minimap Component
 *
 * Displays an interactive line chart showing activity volume over time.
 * Features:
 * - Line chart of daily inbound activity counts
 * - Orange markers for first touchpoints per person
 * - Blue bars indicating the currently visible date range in the main table
 * - Click-to-navigate functionality
 * - Real-time synchronization with the main timeline table
 */

'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TimelineDataPoint, FirstTouchpoint, TimelineApiResponse } from '@/types/activity';
import { ApiService } from '@/lib/api';
import { format, parseISO } from 'date-fns';
import { BarChart3, Circle, Loader2 } from 'lucide-react';

/**
 * Props interface for the ActivityMinimap component
 */
interface ActivityMinimapProps {
	visibleStartDate?: string;        // Start date of visible range in main table
	visibleEndDate?: string;          // End date of visible range in main table
	onDateClick: (date: string) => void;  // Callback when user clicks on chart
}

/**
 * Main ActivityMinimap component
 */
export function ActivityMinimap({ visibleStartDate, visibleEndDate, onDateClick }: ActivityMinimapProps) {
	// State for timeline chart data (daily activity counts)
	const [timelineData, setTimelineData] = useState<TimelineDataPoint[]>([]);

	// State for first touchpoint markers
	const [firstTouchpoints, setFirstTouchpoints] = useState<FirstTouchpoint[]>([]);

	// Loading state for the entire component
	const [loading, setLoading] = useState(true);

	// Error state for handling API failures
	const [error, setError] = useState<string | null>(null);

	// Reference to the chart container for positioning calculations
	const chartRef = useRef<HTMLDivElement>(null);

	/**
	 * Effect hook to load timeline data when component mounts
	 * Fetches both activity counts and first touchpoint data from the API
	 */
	useEffect(() => {
		const loadTimelineData = async () => {
			try {
				setLoading(true);

				// Fetch timeline data from the backend
				const response: TimelineApiResponse = await ApiService.fetchTimelineData();

				// Update state with received data
				setTimelineData(response.timeline_data);
				setFirstTouchpoints(response.first_touchpoints);
				setError(null);
			} catch (err) {
				// Handle errors by setting error state
				setError(err instanceof Error ? err.message : 'Failed to load timeline data');
			} finally {
				// Always clear loading state
				setLoading(false);
			}
		};

		loadTimelineData();
	}, []);

	/**
	 * Memoized chart data processing
	 * Transforms raw timeline data into format expected by Recharts
	 * Adds parsed date objects and formatted labels
	 */
	const chartData = useMemo(() => {
		return timelineData.map(point => ({
			...point,
			dateObj: parseISO(point.date),                    // Parsed date object
			formattedDate: format(parseISO(point.date), 'MMM d'),  // Human-readable label
		}));
	}, [timelineData]);

	/**
	 * Memoized touchpoint marker positioning
	 * Calculates pixel positions for orange markers based on chart width
	 * Ensures markers align with corresponding dates on the chart
	 */
	const touchpointMarkers = useMemo(() => {
		// Don't process if no chart data available
		if (!chartData.length) return [];

		// Get chart container width for position calculations
		const chartWidth = chartRef.current?.clientWidth || 800;
		const padding = 60; // Account for chart margins and padding
		const availableWidth = chartWidth - (padding * 2);

		return firstTouchpoints.map(touchpoint => {
			// Find the index of this touchpoint's date in the chart data
			const dateIndex = chartData.findIndex(d => d.date === touchpoint.date);
			let position = 0;

			// Calculate pixel position based on date index
			if (dateIndex >= 0 && chartData.length > 1) {
				position = (dateIndex / (chartData.length - 1)) * availableWidth + padding;
			}

			return {
				...touchpoint,
				x: position,  // Pixel position for absolute positioning
			};
		});
	}, [firstTouchpoints, chartData]);

	/**
	 * Callback for handling chart clicks
	 * Extracts the clicked date and calls the parent's navigation handler
	 */
	const handleChartClick = useCallback((data: any) => {
		if (data && data.activeLabel) {
			onDateClick(data.activeLabel);
		}
	}, [onDateClick]);

	/**
	 * Loading state render
	 * Shows a spinner and loading message while data is being fetched
	 */
	if (loading) {
		return (
			<div className="bg-white rounded-lg shadow border border-gray-200 p-6">
				{/* Header with icon and title */}
				<div className="flex items-center space-x-2 mb-4">
					<BarChart3 className="w-5 h-5 text-blue-600" />
					<h3 className="text-lg font-semibold text-black">Navigation Minimap</h3>
				</div>

				{/* Loading indicator */}
				<div className="h-48 flex items-center justify-center">
					<div className="flex items-center space-x-2 text-black">
						<Loader2 data-testid="loader" className="w-5 h-5 animate-spin text-blue-600" />
						<span>Loading timeline...</span>
					</div>
				</div>
			</div>
		);
	}

	/**
	 * Error state render
	 * Shows error message when data loading fails
	 */
	if (error) {
		return (
			<div className="bg-white rounded-lg shadow border border-gray-200 p-6">
				{/* Header with icon and title */}
				<div className="flex items-center space-x-2 mb-4">
					<BarChart3 className="w-5 h-5 text-blue-600" />
					<h3 className="text-lg font-semibold text-black">Navigation Minimap</h3>
				</div>

				{/* Error message */}
				<div className="h-48 flex items-center justify-center text-red-600">
					<p>Error: {error}</p>
				</div>
			</div>
		);
	}

	/**
	 * Main component render
	 * Shows the complete minimap with chart, markers, and legend
	 */
	return (
		<div className="bg-white rounded-lg shadow border border-gray-200 p-6">
			{/* Header section with title and legend */}
			<div className="flex items-center justify-between mb-4">
				{/* Title with icon */}
				<div className="flex items-center space-x-2">
					<BarChart3 className="w-5 h-5 text-blue-600" />
					<h3 className="text-lg font-semibold text-black">Navigation Minimap</h3>
				</div>

				{/* Legend explaining chart elements */}
				<div className="flex items-center space-x-6 text-sm text-black">
					{/* Inbound activities line */}
					<div className="flex items-center space-x-2">
						<div className="w-3 h-0.5 bg-blue-500"></div>
						<span>Inbound Activities</span>
					</div>

					{/* First touchpoint markers */}
					<div className="flex items-center space-x-2">
						<Circle className="w-3 h-3 fill-orange-500 text-orange-500" />
						<span>First Touchpoints</span>
					</div>

					{/* Visible range indicators */}
					<div className="flex items-center space-x-2">
						<div className="w-4 h-3 bg-blue-600 bg-opacity-20 border-l-2 border-r-2 border-blue-600"></div>
						<span>Visible Range</span>
					</div>
				</div>
			</div>

			{/* Chart container with reference for positioning calculations */}
			<div className="relative" ref={chartRef}>
				{/* Main line chart */}
				<div className="h-48 timeline-chart">
					<ResponsiveContainer width="100%" height="100%">
						<LineChart
							data={chartData}
							onClick={handleChartClick}
							margin={{ top: 5, right: 30, left: 20, bottom: 35 }}
						>
							{/* X-axis with formatted date labels */}
							<XAxis
								dataKey="date"
								tickFormatter={(value) => format(parseISO(value), 'MMM d')}
								interval="preserveStartEnd"
								fontSize={12}
								tick={{ fill: '#000000' }}
								axisLine={{ stroke: '#e5e7eb' }}
								tickLine={{ stroke: '#e5e7eb' }}
							/>

							{/* Y-axis with activity count */}
							<YAxis
								fontSize={12}
								tick={{ fill: '#000000' }}
								axisLine={{ stroke: '#e5e7eb' }}
								tickLine={{ stroke: '#e5e7eb' }}
								label={{
									value: 'Activities',
									angle: -90,
									position: 'insideLeft',
									style: { textAnchor: 'middle', fill: '#000000' }
								}}
							/>

							{/* Blue vertical line indicating start of visible range */}
							{visibleStartDate && (
								<ReferenceLine
									x={visibleStartDate}
									stroke="#2563eb"
									strokeWidth={2}
									strokeDasharray="none"
									className="active-region-indicator"
								/>
							)}

							{/* Blue vertical line indicating end of visible range */}
							{visibleEndDate && (
								<ReferenceLine
									x={visibleEndDate}
									stroke="#2563eb"
									strokeWidth={2}
									strokeDasharray="none"
									className="active-region-indicator"
								/>
							)}

							{/* Main activity count line */}
							<Line
								type="monotone"
								dataKey="count"
								stroke="#3b82f6"
								strokeWidth={2}
								dot={{ fill: '#3b82f6', strokeWidth: 0, r: 2 }}
								activeDot={{ r: 4, stroke: '#3b82f6', strokeWidth: 2, fill: '#ffffff' }}
							/>
						</LineChart>
					</ResponsiveContainer>
				</div>

				{/*
         * Orange touchpoint markers overlay
         * Positioned absolutely below the date labels to avoid overlap
         */}
				{touchpointMarkers.length > 0 && (
					<div className="absolute inset-0 pointer-events-none">
						<div className="relative h-full">
							{touchpointMarkers.map((marker, index) => (
								<div
									key={`${marker.person_id}-${index}`}
									className="absolute w-3 h-3 bg-orange-500 rounded-full border-2 border-white shadow-sm pointer-events-auto cursor-pointer hover:scale-110 transition-transform"
									style={{
										left: `${marker.x}px`,
										top: '180px', // Positioned below date labels to prevent overlap
										transform: 'translateX(-50%)',
										zIndex: 10
									}}
									onClick={() => onDateClick(marker.date)}
									title={`First touchpoint for person ${marker.person_id}`}
								/>
							))}
						</div>
					</div>
				)}
			</div>

			{/* Instructions for user interaction */}
			<div className="mt-4 text-xs text-black text-center">
				Click on any point to navigate to that date in the timeline below.
			</div>
		</div>
	);
}
