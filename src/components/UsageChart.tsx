import React, { FC, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from "recharts";
import { ResampledItem, PeakTimeData } from "@/types";


interface UsageChartProps {
  data: ResampledItem[];
  peakTimes: PeakTimeData | null;
  loading: boolean;
  error: string | null;
  chartType: 'FV' | 'FR';
}

/**
 * A bar chart component specifically for visualizing peak usage times.
 * It calculates the average usage for each hour and overlays reference lines
 * to indicate the morning and night peak hours.
 */
const UsageChart: FC<UsageChartProps> = ({ data, peakTimes, loading, error, chartType }) => {
  const chartTitle = `Peak Usage Analysis (${chartType})`;

  // Memoize the hourly average calculation to prevent re-running on every render.
  const hourlyAverageData = useMemo(() => {
    // Ensure data is valid before processing
    if (!data || data.length === 0) return [];

    const hourlyMap = new Map<number, { total: number; count: number }>();
    data.forEach(item => {
      const hour = new Date(item.ds).getUTCHours();
      // Safely access the value based on chartType
      const value = item[chartType] || 0;
      if (!hourlyMap.has(hour)) {
        hourlyMap.set(hour, { total: 0, count: 0 });
      }
      const current = hourlyMap.get(hour)!;
      current.total += value;
      current.count += 1;
    });

    return Array.from({ length: 24 }, (_, hour) => ({
      hour: `${hour.toString().padStart(2, '0')}:00`,
      value: hourlyMap.has(hour) ? hourlyMap.get(hour)!.total / hourlyMap.get(hour)!.count : 0,
    }));
  }, [data, chartType]);

  // Determine which peak hour data to use based on the chartType prop
  const peakHourData = chartType === 'FV'
    ? { morning: peakTimes?.fv_morning_peak_hour, night: peakTimes?.fv_night_peak_hour }
    : { morning: peakTimes?.fr_morning_peak_hour, night: peakTimes?.fr_night_peak_hour };

  // This is the main container that will always be rendered.
  // Its content will change based on the loading, error, or data state.
  return (
    <div className="w-full h-full">
      <h3 className="text-lg font-semibold text-center text-gray-800 dark:text-gray-200 mb-4">{chartTitle}</h3>
      <div className="w-full h-[90%]">
        {loading ? (
          <div className="flex items-center justify-center h-full">Loading...</div>
        ) : error ? (
          <div className="flex items-center justify-center h-full text-red-500">{error}</div>
        ) : data.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">No data available.</div>
        ) : (
          // The chart is only rendered when all checks have passed.
          <ResponsiveContainer width="100%" height="100%" key={chartType}>
              <BarChart data={hourlyAverageData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                  <XAxis dataKey="hour" tick={{ fontSize: 12 }} interval={2} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.9)', borderColor: '#4A5568', borderRadius: '0.5rem' }} />
                  <Legend />
                  <Bar dataKey="value" name={`Average ${chartType}`} fill={chartType === 'FV' ? "#8884d8" : "#82ca9d"} />
                  {peakHourData.morning != null && <ReferenceLine x={`${String(peakHourData.morning).padStart(2, '0')}:00`} stroke="orange" strokeWidth={2} label={{ value: 'Morning Peak', position: 'top' }} />}
                  {peakHourData.night != null && <ReferenceLine x={`${String(peakHourData.night).padStart(2, '0')}:00`} stroke="cyan" strokeWidth={2} label={{ value: 'Night Peak', position: 'top' }} />}
              </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default UsageChart;
