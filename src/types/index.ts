/**
 * This file contains all shared TypeScript interfaces for the dashboard.
 * Centralizing types makes them easier to manage and reuse across components.
 */

// Represents a single row of data in the main data table.
export interface MeterReading {
  FR: number;
  FV: number;
  LocalTimeCol: string;
  MeterCode: string;
  NetTotal: number;
  Today: number;
  [key: string]: any; // Allows for any other properties.
}

// Defines the structure for the peak time data returned by the API.
export interface PeakTimeData {
  fv_morning_peak_hour: number | null;
  fv_morning_peak_value: number | null;
  fv_night_peak_hour: number | null;
  fv_night_peak_value: number | null;
  fr_morning_peak_hour: number | null;
  fr_morning_peak_value: number | null;
  fr_night_peak_hour: number | null;
  fr_night_peak_value: number | null;
}

// Defines the structure for the general status data (KPIs).
export interface StatusData {
  total_historical_records?: number;
  last_processed_time_in_memory?: string | null;
  total_meters?: number;
}

// Represents a single item in the resampled data arrays (daily or hourly).
export interface ResampledItem {
  ds: string; // The timestamp for the data point.
  FV: number; // Flow Volume
  FR: number; // Flow Rate
}