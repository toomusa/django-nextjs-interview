/**
 * Activity Timeline Table Component
 *
 * Main data table showing chronological list of customer activity events.
 * Features:
 * - Infinite scroll loading for performance with large datasets
 * - Direction indicators (arrows) showing inbound/outbound activities
 * - Date navigation support from minimap clicks
 * - Gap indicators between activities separated by multiple days
 * - Team, channel, and status information with colored icons
 * - People information with overflow indicators (+1, +2, etc.)
 */

'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useInView } from 'react-intersection-observer';
import { ActivityEvent, Person, ApiResponse } from '@/types/activity';
import { ApiService } from '@/lib/api';
import { formatDateTime, formatRelativeTime, calculateDateGap, cn } from '@/lib/utils';
import { Calendar, Users, Mail, Phone, UserCheck, Building2, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';

/**
 * Props interface for the ActivityTimelineTable component
 */
interface ActivityTimelineTableProps {
	onVisibleRangeChange: (startDate: string, endDate: string) => void;  // Callback for minimap sync
	navigateToDate?: string;           // Date to navigate to (from minimap clicks)
	onNavigationComplete?: () => void;  // Callback when navigation is complete
}

/**
 * Main ActivityTimelineTable component
 */
export function ActivityTimelineTable({
																				onVisibleRangeChange,
																				navigateToDate,
																				onNavigationComplete
																			}: ActivityTimelineTableProps) {
	// State for the main activity events data
	const [events, setEvents] = useState<ActivityEvent[]>([]);

	// State for person information (referenced by events)
	const [persons, setPersons] = useState<Record<string, Person>>({});

	// Loading state for initial data load
	const [loading, setLoading] = useState(true);

	// Loading state for infinite scroll (loading additional pages)
	const [loadingMore, setLoadingMore] = useState(false);

	// Flag indicating if more pages are available
	const [hasNext, setHasNext] = useState(false);

	// Current page number for pagination
	const [currentPage, setCurrentPage] = useState(1);

	// Error state for handling API failures
	const [error, setError] = useState<string | null>(null);

	// Reference to the table container
	const tableRef = useRef<HTMLDivElement>(null);

	// Intersection observer for infinite scroll detection
	const { ref: infiniteScrollRef, inView } = useInView({
		threshold: 0,
		rootMargin: '100px',  // Trigger loading 100px before reaching the bottom
	});

	/**
	 * Main function for loading activity events from the API
	 * Handles both initial loads and pagination
	 *
	 * @param page - Page number to load
	 * @param targetDate - Optional date for navigation
	 * @param append - Whether to append to existing data or replace it
	 */
	const loadEvents = useCallback(async (page: number = 1, targetDate?: string, append: boolean = false) => {
		try {
			// Set appropriate loading state
			if (!append) {
				setLoading(true);
			} else {
				setLoadingMore(true);
			}

			// Fetch data from the API
			const response: ApiResponse = await ApiService.fetchActivityEvents(page, 50, targetDate);

			// Update events state - either append or replace based on the append flag
			if (append) {
				setEvents(prev => [...prev, ...response.events]);
			} else {
				setEvents(response.events);
			}

			// Always merge person data (may contain new people from any page)
			setPersons(prev => ({ ...prev, ...response.persons }));

			// Update pagination state
			setHasNext(response.pagination.has_next);
			setCurrentPage(response.pagination.current_page);
			setError(null);
		} catch (err) {
			// Handle errors by setting error state
			setError(err instanceof Error ? err.message : 'Failed to load events');
		} finally {
			// Clear loading states
			setLoading(false);
			setLoadingMore(false);
		}
	}, []);

	/**
	 * Effect for initial data loading when component mounts
	 */
	useEffect(() => {
		loadEvents(1);
	}, [loadEvents]);

	/**
	 * Effect for handling navigation from minimap clicks
	 * Reloads data starting from the target date
	 */
	useEffect(() => {
		if (navigateToDate) {
			loadEvents(1, navigateToDate, false);
			onNavigationComplete?.();
		}
	}, [navigateToDate, loadEvents, onNavigationComplete]);

	/**
	 * Effect for infinite scroll implementation
	 * Loads the next page when the sentinel element comes into view
	 */
	useEffect(() => {
		if (inView && hasNext && !loading && !loadingMore) {
			loadEvents(currentPage + 1, undefined, true);
		}
	}, [inView, hasNext, loading, loadingMore, currentPage, loadEvents]);

	/**
	 * Effect for syncing visible date range with the minimap
	 * Calculates the date range of currently loaded events
	 */
	useEffect(() => {
		if (events.length > 0) {
			// Events are sorted by timestamp descending, so first is newest, last is oldest
			const firstEvent = events[0];
			const lastEvent = events[events.length - 1];
			const startDate = lastEvent.timestamp.split('T')[0];  // Oldest date
			const endDate = firstEvent.timestamp.split('T')[0];   // Newest date
			onVisibleRangeChange(startDate, endDate);
		}
	}, [events, onVisibleRangeChange]);

	/**
	 * Renders the people information for an activity
	 * Shows first person's name and a count indicator for additional people
	 *
	 * @param people - Array of people involved in the activity
	 * @returns JSX element with person information
	 */
	const renderPersonBadge = (people: Person[]) => {
		// Handle empty or missing people array
		if (!people || people.length === 0) {
			return <span className="text-black text-sm">No people</span>;
		}

		// Get the first person's details
		const firstPerson = persons[people[0].id];
		if (!firstPerson) {
			return <span className="text-black text-sm">Unknown Person</span>;
		}

		// Calculate additional people count
		const additionalCount = people.length - 1;

		return (
			<div className="flex items-center space-x-2">
				{/* First person's name */}
				<span className="text-black text-sm">
          {firstPerson.first_name} {firstPerson.last_name}
        </span>

				{/* Additional people indicator */}
				{additionalCount > 0 && (
					<span className="text-blue-600 text-sm font-medium">
            +{additionalCount}
          </span>
				)}
			</div>
		);
	};

	/**
	 * Renders team badges with appropriate colors and formatting
	 * Maps team IDs to display names and applies color coding
	 *
	 * @param teamIds - Array of team identifiers
	 * @returns JSX element with team information
	 */
	const renderTeamBadges = (teamIds: string[]) => {
		// Handle empty or missing team IDs
		if (!teamIds || teamIds.length === 0) {
			return <span className="text-red-600 text-sm font-medium">UNKNOWN</span>;
		}

		return (
			<div className="flex flex-col space-y-1">
				{teamIds.map((teamId, index) => {
					let displayName = teamId;
					let colorClass = 'text-black';

					// Map team IDs to display names and colors
					if (teamId.toLowerCase().includes('marketing') || teamId === 'team-marketing') {
						displayName = 'MARKETING';
						colorClass = 'text-red-600';
					} else if (teamId.toLowerCase().includes('sales') || teamId === 'team_sales') {
						displayName = 'SALES';
						colorClass = 'text-blue-600';
					} else if (teamId.toLowerCase().includes('customer_success') || teamId === 'team_customer_success') {
						displayName = 'CUSTOMER SUCCESS';
						colorClass = 'text-green-600';
					} else if (teamId === 'SDR') {
						displayName = 'SDR';
						colorClass = 'text-green-600';
					}

					return (
						<span key={index} className={cn("text-sm font-medium", colorClass)}>
              {displayName}
            </span>
					);
				})}
			</div>
		);
	};

	/**
	 * Renders a gap indicator when there's a significant time gap between activities
	 * Shows a visual separator with the number of days
	 *
	 * @param days - Number of days in the gap
	 * @returns JSX element for gap indicator or null if gap is too small
	 */
	const renderGapIndicator = (days: number) => {
		// Only show gap indicator for gaps larger than 1 day
		if (days <= 1) return null;

		return (
			<tr>
				<td colSpan={7} className="px-4 py-3">
					<div className="flex items-center justify-center gap-2 text-sm text-black gap-indicator rounded-lg py-2">
						<Calendar className="w-4 h-4 text-gray-600" />
						<span>{days} day gap</span>
					</div>
				</td>
			</tr>
		);
	};

	/**
	 * Returns the appropriate icon for a given channel type
	 * Uses Lucide React icons with consistent colors
	 *
	 * @param channel - Channel type (EMAIL, PHONE, etc.)
	 * @returns JSX element with colored icon
	 */
	const getChannelIcon = (channel: string) => {
		switch (channel) {
			case 'EMAIL':
				return <Mail className="w-4 h-4 text-blue-600" />;
			case 'PHONE':
				return <Phone className="w-4 h-4 text-green-600" />;
			case 'MEETING':
				return <UserCheck className="w-4 h-4 text-purple-600" />;
			case 'LINKEDIN':
				return <Building2 className="w-4 h-4 text-blue-700" />;
			case 'WEBSITE':
				return <div className="w-4 h-4 text-orange-600">🌐</div>;
			case 'DEMO':
				return <div className="w-4 h-4 text-pink-600">📺</div>;
			case 'WEBINAR':
				return <div className="w-4 h-4 text-cyan-600">🎥</div>;
			case 'EVENT':
				return <div className="w-4 h-4 text-emerald-600">🎪</div>;
			default:
				return <div className="w-4 h-4 text-gray-600">📋</div>;
		}
	};

	/**
	 * Returns the appropriate icon for a given status type
	 * Uses emoji icons with consistent styling
	 *
	 * @param status - Status type (SENT, DELIVERED, etc.)
	 * @returns JSX element with colored icon
	 */
	const getStatusIcon = (status: string) => {
		switch (status) {
			case 'SENT':
				return <div className="w-4 h-4 text-blue-600">📤</div>;
			case 'DELIVERED':
				return <div className="w-4 h-4 text-green-600">✅</div>;
			case 'OPENED':
				return <div className="w-4 h-4 text-yellow-600">👁️</div>;
			case 'CLICKED':
				return <div className="w-4 h-4 text-purple-600">👆</div>;
			case 'REPLIED':
				return <div className="w-4 h-4 text-indigo-600">💬</div>;
			case 'BOUNCED':
				return <div className="w-4 h-4 text-red-600">❌</div>;
			case 'SCHEDULED':
				return <div className="w-4 h-4 text-orange-600">📅</div>;
			case 'COMPLETED':
				return <div className="w-4 h-4 text-green-600">✅</div>;
			case 'ENGAGED':
				return <div className="w-4 h-4 text-cyan-600">⚡</div>;
			default:
				return <div className="w-4 h-4 text-gray-600">📋</div>;
		}
	};

	/**
	 * Loading state render - shown during initial data fetch
	 */
	if (loading && events.length === 0) {
		return (
			<div className="bg-white rounded-lg shadow border border-gray-200">
				{/* Header section */}
				<div className="px-6 py-4 border-b border-gray-200">
					<div className="flex items-center space-x-2">
						<Calendar className="w-5 h-5 text-blue-600" />
						<h2 className="text-lg font-semibold text-black">Touchpoints</h2>
					</div>
				</div>

				{/* Loading indicator */}
				<div className="p-8 text-center">
					<div className="flex items-center justify-center space-x-2 text-black">
						<Loader2 className="w-5 h-5 animate-spin text-blue-600" />
						<span>Loading activity events...</span>
					</div>
				</div>
			</div>
		);
	}

	/**
	 * Error state render - shown when API requests fail
	 */
	if (error) {
		return (
			<div className="bg-white rounded-lg shadow border border-gray-200">
				{/* Header section */}
				<div className="px-6 py-4 border-b border-gray-200">
					<div className="flex items-center space-x-2">
						<Calendar className="w-5 h-5 text-blue-600" />
						<h2 className="text-lg font-semibold text-black">Touchpoints</h2>
					</div>
				</div>

				{/* Error message with retry button */}
				<div className="p-8 text-center text-red-600">
					<p>Error: {error}</p>
					<button
						onClick={() => loadEvents(1)}
						className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
					>
						Retry
					</button>
				</div>
			</div>
		);
	}

	/**
	 * Main component render - the complete activity timeline table
	 */
	return (
		<div className="bg-white rounded-lg shadow border border-gray-200" ref={tableRef}>
			{/* Header section with title and event count */}
			<div className="px-6 py-4 border-b border-gray-200">
				<div className="flex items-center space-x-2">
					<Calendar className="w-5 h-5 text-blue-600" />
					<h2 className="text-lg font-semibold text-black">Touchpoints</h2>
					<span className="text-sm text-black">
            ({events.length} activities)
          </span>
				</div>
			</div>

			{/*
       * Table container with horizontal and vertical scrolling
       * Fixed minimum width ensures all content is visible
       */}
			<div className="overflow-x-auto">
				<div className="max-h-96 overflow-y-auto custom-scrollbar">
					<table className="w-full min-w-[1200px]">
						{/*
             * Table header - sticky positioned to remain visible during scroll
             * Each column has appropriate icons and sizing
             */}
						<thead className="bg-gray-50 sticky top-0">
						<tr>
							{/* Direction column - no header text, just arrows */}
							<th className="px-3 py-3 text-left text-xs font-medium text-black uppercase tracking-wider border-b border-gray-200 w-12">
								{/* Empty header for direction arrows */}
							</th>

							{/* Date column with calendar icon */}
							<th className="px-4 py-3 text-left text-xs font-medium text-black uppercase tracking-wider border-b border-gray-200 w-48">
								<div className="flex items-center space-x-1">
									<Calendar className="w-4 h-4 text-gray-600" />
									<span>Date</span>
								</div>
							</th>

							{/* Activity description column */}
							<th className="px-4 py-3 text-left text-xs font-medium text-black uppercase tracking-wider border-b border-gray-200 w-80">
								<div className="flex items-center space-x-1">
									<Mail className="w-4 h-4 text-gray-600" />
									<span>Activity</span>
								</div>
							</th>

							{/* People involved column */}
							<th className="px-4 py-3 text-left text-xs font-medium text-black uppercase tracking-wider border-b border-gray-200 w-48">
								<div className="flex items-center space-x-1">
									<Users className="w-4 h-4 text-gray-600" />
									<span>People</span>
								</div>
							</th>

							{/* Communication channel column */}
							<th className="px-4 py-3 text-left text-xs font-medium text-black uppercase tracking-wider border-b border-gray-200 w-32">
								<div className="flex items-center space-x-1">
									<Phone className="w-4 h-4 text-gray-600" />
									<span>Channel</span>
								</div>
							</th>

							{/* Activity status column */}
							<th className="px-4 py-3 text-left text-xs font-medium text-black uppercase tracking-wider border-b border-gray-200 w-32">
								<div className="flex items-center space-x-1">
									<UserCheck className="w-4 h-4 text-gray-600" />
									<span>Status</span>
								</div>
							</th>

							{/* Teams involved column */}
							<th className="px-4 py-3 text-left text-xs font-medium text-black uppercase tracking-wider border-b border-gray-200 w-40">
								<div className="flex items-center space-x-1">
									<Building2 className="w-4 h-4 text-gray-600" />
									<span>Teams</span>
								</div>
							</th>
						</tr>
						</thead>

						{/*
             * Table body with activity data
             * Each row represents a single activity event
             */}
						<tbody className="bg-white divide-y divide-gray-200">
						{events.map((event, index) => {
							// Calculate time gap from previous event for gap indicators
							const previousEvent = index > 0 ? events[index - 1] : null;
							const gap = previousEvent ? calculateDateGap(previousEvent.timestamp, event.timestamp) : 0;

							return (
								<React.Fragment key={event.id}>
									{/* Show gap indicator if there's a significant time gap */}
									{renderGapIndicator(gap)}

									{/* Main activity row with hover effect */}
									<tr className="hover:bg-gray-50 transition-colors">
										{/* Direction indicator - blue arrow for outbound, red for inbound */}
										<td className="px-3 py-4 text-center">
											{event.direction === 'OUT' ? (
												<ArrowRight role="img" className="w-5 h-5 text-blue-600" />
											) : (
												<ArrowLeft role="img" className="w-5 h-5 text-red-600" />
											)}
										</td>

										{/* Date and time information */}
										<td className="px-4 py-4 text-sm">
											<div className="text-black font-medium">{formatDateTime(event.timestamp)}</div>
											<div className="text-gray-600 text-xs">{formatRelativeTime(event.timestamp)}</div>
										</td>

										{/* Activity description with word wrapping */}
										<td className="px-4 py-4 text-sm">
											<div className="text-black break-words" title={event.activity}>
												{event.activity}
											</div>
										</td>

										{/* People involved with overflow handling */}
										<td className="px-4 py-4">
											{renderPersonBadge(event.people)}
										</td>

										{/* Channel with colored icon */}
										<td className="px-4 py-4">
											<div className="flex items-center space-x-2">
												{getChannelIcon(event.channel)}
												<span className="text-black text-sm">{event.channel}</span>
											</div>
										</td>

										{/* Status with colored icon */}
										<td className="px-4 py-4">
											<div className="flex items-center space-x-2">
												{getStatusIcon(event.status)}
												<span className="text-black text-sm">{event.status}</span>
											</div>
										</td>

										{/* Teams with color-coded labels */}
										<td className="px-4 py-4">
											{renderTeamBadges(event.involved_team_ids)}
										</td>
									</tr>
								</React.Fragment>
							);
						})}

						{/*
               * Infinite scroll sentinel and loading indicator
               * This element triggers loading of the next page when it comes into view
               */}
						{hasNext && (
							<tr ref={infiniteScrollRef}>
								<td colSpan={7} className="px-6 py-8 text-center">
									{loadingMore ? (
										<div className="flex items-center justify-center space-x-2 text-black">
											<Loader2 className="w-5 h-5 animate-spin text-blue-600" />
											<span>Loading more activities...</span>
										</div>
									) : (
										<div className="text-black">Scroll to load more</div>
									)}
								</td>
							</tr>
						)}

						{/* Empty state when no events are available */}
						{events.length === 0 && !loading && (
							<tr>
								<td colSpan={7} className="px-6 py-8 text-center text-black">
									No activities found.
								</td>
							</tr>
						)}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}
