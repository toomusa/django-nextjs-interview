/**
 * Type definitions for the Activity Timeline application
 * These interfaces define the shape of data used throughout the app
 */

/**
 * Represents a single activity event from the backend
 * Contains all the information about customer touchpoints and interactions
 */
export interface ActivityEvent {
	id: number;                    // Unique identifier for the activity
	timestamp: string;             // ISO timestamp when the activity occurred
	activity: string;              // Description of what happened
	channel: string;               // Communication channel (EMAIL, PHONE, etc.)
	status: string;                // Current status (SENT, DELIVERED, etc.)
	direction: 'IN' | 'OUT';      // Whether it's inbound or outbound activity
	people: Person[];              // Array of people involved in this activity
	involved_team_ids: string[];   // Teams that participated in this activity
}

/**
 * Represents a person/contact in the system
 * Contains personal and professional information
 */
export interface Person {
	id: string;              // Unique identifier for the person
	first_name: string;      // Person's first name
	last_name: string;       // Person's last name
	email_address: string;   // Primary email address
	job_title?: string;      // Optional job title/position
}

/**
 * Data point for the timeline chart visualization
 * Represents activity count for a specific date
 */
export interface TimelineDataPoint {
	date: string;   // Date in YYYY-MM-DD format
	count: number;  // Number of activities on this date
}

/**
 * Represents the first touchpoint for a specific person
 * Used to show orange markers on the timeline chart
 */
export interface FirstTouchpoint {
	person_id: string;   // ID of the person this touchpoint belongs to
	timestamp: string;   // ISO timestamp of the first touchpoint
	date: string;        // Date in YYYY-MM-DD format
}

/**
 * Response structure from the activity events API endpoint
 * Contains events, related person data, and pagination info
 */
export interface ApiResponse {
	events: ActivityEvent[];              // Array of activity events
	persons: Record<string, Person>;      // Map of person IDs to person objects
	pagination: {
		current_page: number;     // Current page number
		total_pages: number;      // Total number of pages available
		total_count: number;      // Total number of events across all pages
		has_next: boolean;        // Whether there are more pages available
		has_previous: boolean;    // Whether there are previous pages
	};
}

/**
 * Response structure from the timeline data API endpoint
 * Contains data needed for the minimap chart visualization
 */
export interface TimelineApiResponse {
	timeline_data: TimelineDataPoint[];     // Daily activity counts for chart
	first_touchpoints: FirstTouchpoint[];   // First touchpoint markers
}
