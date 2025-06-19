/**
 * Main Application Page Component
 *
 * Root page component that orchestrates the Activity Timeline application.
 * Manages the communication between the minimap and main table components,
 * handling date navigation and visible range synchronization.
 */

'use client';

import React, { useState, useCallback } from 'react';
import { ActivityTimelineTable } from '@/components/ActivityTimelineTable';
import { ActivityMinimap } from '@/components/ActivityMinimap';
import { BarChart3 } from 'lucide-react';

/**
 * Home page component - main entry point for the application
 */
export default function Home() {
  // State for tracking the date range currently visible in the main table
  // Used to sync the blue bars in the minimap
  const [visibleStartDate, setVisibleStartDate] = useState<string>('');
  const [visibleEndDate, setVisibleEndDate] = useState<string>('');

  // State for handling navigation requests from the minimap
  // When user clicks on a date in the chart, this triggers table navigation
  const [navigateToDate, setNavigateToDate] = useState<string>('');

  /**
   * Callback function called by the table when its visible date range changes
   * Updates the minimap's blue bars to reflect what's currently visible
   *
   * @param startDate - Earliest date visible in table (YYYY-MM-DD)
   * @param endDate - Latest date visible in table (YYYY-MM-DD)
   */
  const handleVisibleRangeChange = useCallback((startDate: string, endDate: string) => {
    setVisibleStartDate(startDate);
    setVisibleEndDate(endDate);
  }, []);

  /**
   * Callback function called when user clicks on a date in the minimap
   * Triggers navigation in the main table to show events around that date
   *
   * @param date - Target date to navigate to (YYYY-MM-DD)
   */
  const handleDateClick = useCallback((date: string) => {
    setNavigateToDate(date);
  }, []);

  /**
   * Callback function called when the table has completed navigation
   * Clears the navigation state to prevent repeated navigation attempts
   */
  const handleNavigationComplete = useCallback(() => {
    setNavigateToDate('');
  }, []);

  return (
    // Main page container with light gray background
    <div className="min-h-screen bg-gray-50">
      {/* Content container with responsive margins and max width */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">

        {/* Page header section */}
        <header className="mb-8">
          {/* Title section with icon and main heading */}
          <div className="flex items-center space-x-3 mb-4">
            {/* Blue icon container */}
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            {/* Main page title */}
            <h1 className="text-3xl font-bold text-black">Activity Timeline</h1>
          </div>

          {/* Page description */}
          <p className="text-black max-w-2xl">
            Interactive timeline showing customer activity events with navigation minimap.
            Click on any point in the overview chart to jump to that date.
          </p>
        </header>

        {/* Main content area with component stack */}
        <div className="space-y-6">

          {/*
           * Navigation Minimap Component
           * Displays activity overview chart with clickable navigation
           * Receives visible range from table and sends navigation events
           */}
          <ActivityMinimap
            visibleStartDate={visibleStartDate}
            visibleEndDate={visibleEndDate}
            onDateClick={handleDateClick}
          />

          {/*
           * Activity Timeline Table Component
           * Main data table with infinite scroll and detailed event information
           * Sends visible range updates and receives navigation commands
           */}
          <ActivityTimelineTable
            onVisibleRangeChange={handleVisibleRangeChange}
            navigateToDate={navigateToDate}
            onNavigationComplete={handleNavigationComplete}
          />
        </div>
      </div>
    </div>
  );
}
