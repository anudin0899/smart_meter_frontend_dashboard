// Import the zoom plugin and its dependency
import zoomPlugin from "chartjs-plugin-zoom";
import 'hammerjs'; // Required for touch gestures on the zoom plugin

import React, { useState, useEffect, useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from "chart.js";
import { Line } from "react-chartjs-2";
import axios from "axios";
import SkeletonTable from "@/components/SkeletonTable";
import DataTable from "@/components/DataTable";
import { DollarSign, Target, TrendingUp } from "lucide-react";
import MeterSelector from "@/components/MeterSelector";
import "chartjs-adapter-date-fns";

// Register all necessary components, including the zoom plugin
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  zoomPlugin // Register the zoom plugin here
);

// Interfaces for data structures (no changes here)
interface ForecastItem {
  ds: string;
  forecast: number;
  yhat: number;
  yhat_lower: number;
  yhat_upper: number;
}

interface ResampledItem {
  ds: string;
  FR: number;
  FV: number;
}

interface MergedDataItem {
  ds: string;
  historicalValue: number | null;
  forecastValue: number | null;
}

const HourlyForecast: React.FC = () => {
  // State and useEffect hooks remain the same...
  const [meterCodes, setMeterCodes] = useState<string[]>([]);
  const [selectedMeter, setSelectedMeter] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [forecastData, setForecastData] = useState<ForecastItem[]>([]);
  const [historicalData, setHistoricalData] = useState<ResampledItem[]>([]);
  const [tableData, setTableData] = useState<MergedDataItem[]>([]);

  useEffect(() => {
    const fetchMeterCodes = async () => {
      try {
        const res = await axios.get<{ meter_codes: string[] }>("http://localhost:5000/api/meter_codes");
        setMeterCodes(res.data.meter_codes);
        if (res.data.meter_codes.length > 0) {
          setSelectedMeter(res.data.meter_codes[0]);
        }
      } catch (err) {
        console.error("Error fetching meter codes", err);
        setError("Failed to load meter codes.");
      }
    };
    fetchMeterCodes();
  }, []);

  useEffect(() => {
    const fetchForecast = async () => {
      if (!selectedMeter) return;
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`http://localhost:5000/api/hourly_forecast?meter_code=${selectedMeter}`);
        let parsedData;
        if (typeof res.data === "string") {
          const cleanedData = res.data.replace(/\bNaN\b/g, "null");
          parsedData = JSON.parse(cleanedData);
        } else {
          parsedData = res.data;
        }
        setForecastData(parsedData?.forecast_data || []);
        setHistoricalData(parsedData?.resampled_data || []);
      } catch (err) {
        console.error("Error fetching forecast data", err);
        setError("Failed to load forecast data. Please try again.");
        setForecastData([]);
        setHistoricalData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchForecast();
  }, [selectedMeter]);

  useEffect(() => {
    if (!forecastData.length && !historicalData.length) {
      setTableData([]);
      return;
    }
    const historicalMap = new Map(historicalData.map(item => [item.ds, item.FV]));
    const forecastMap = new Map(forecastData.map(item => [item.ds, item.yhat]));
    const allKeys = new Set([...historicalData.map(d => d.ds), ...forecastData.map(d => d.ds)]);
    const sortedKeys = Array.from(allKeys).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    const merged = sortedKeys.map(key => ({
      ds: key,
      historicalValue: historicalMap.get(key) ?? null,
      forecastValue: forecastMap.get(key) ?? null,
    }));
    setTableData(merged);
  }, [forecastData, historicalData]);


  // Prepare chart data with visible points
  const chartData = {
    datasets: [
      {
        label: "Historical",
        data: historicalData.map(d => ({ x: new Date(d.ds), y: d.FV })),
        borderColor: 'rgba(19, 88, 236, 0.6)',
        borderWidth: 1.5,
        tension: 0.3,
        fill: false,
        backgroundColor: 'rgba(19, 88, 236, 0.6)',
        // Make points visible
        pointRadius: 1, // Set a small radius for points
        pointHoverRadius: 5, // Make points larger on hover
      },
      {
        label: "Forecast",
        data: forecastData.map(d => ({ x: new Date(d.ds), y: d.yhat })),
        borderColor: 'rgba(230, 16, 16, 0.8)',
        borderWidth: 1.5,
        borderDash: [10, 5],
        tension: 0.3,
        fill: false,
        // Make points visible
        pointRadius: 1, // Set a small radius for points
        pointHoverRadius: 5, // Make points larger on hover
      },
    ],
  };

  // Update chart options to include zoom and pan functionality
  const chartOptions = useMemo(() => {
    return {
      responsive: true,
      plugins: {
        legend: {
          position: "bottom" as const,
          labels: {
            padding: 10, // ✅ this adds spacing inside the legend box below the items
          },
        },
        title: {
          display: true,
          text: `Hourly Forecast for ${selectedMeter}`,
          padding: {
            bottom: 30, // also adds some space under title if needed
          }
        },
        zoom: {
          limits: {
            x: { minRange: 2 * 60 * 60 * 1000 } // e.g., limit zoom to a minimum range of 2 hours
          },
          pan: {
            enabled: true,
            mode: "xy" as const,
          },
          zoom: {
            wheel: {
              enabled: true,
            },
            pinch: {
              enabled: true,
            },
            mode: "xy" as const,
          },
        },
      },

      scales: {
        x: {
          type: "time" as const,
          time: {
            unit: "day" as const,
            stepSize: 1,
            displayFormats: {
              day: "dd MMM yyyy",
            },
          },
          min: Math.min(
            ...historicalData.map(d => new Date(d.ds).getTime()),
            ...forecastData.map(d => new Date(d.ds).getTime())
          ),
          max: Math.max(
            ...historicalData.map(d => new Date(d.ds).getTime()),
            ...forecastData.map(d => new Date(d.ds).getTime())
          ),
          ticks: {
            autoSkip: false,
            maxTicksLimit: 18,
            maxRotation: 45,
            minRotation: 45,
          },
          title: {
            display: true,
            text: "Date",
          },
        },
        y: {
          title: {
            display: true,
            text: "Value",
          },
        },
      },
    };
  }, [selectedMeter]);



  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Hourly Forecast Performance
        </h1>
        <div className="flex items-center space-x-2">
          <MeterSelector
            selectedMeter={selectedMeter}
            onMeterChange={setSelectedMeter}
            meterCodes={meterCodes}
          />
        </div>
      </div>


      <>
        {/* Chart */}
        <div className="card p-6 bg-white dark:bg-dark-800 rounded-lg shadow">
          <div style={{ height: '400px' }}>
            {loading ? (
              <div className="h-full flex items-center justify-center">Loading Chart...</div>
            ) : (historicalData.length || forecastData.length) ? (
              <Line data={chartData} options={chartOptions as any} width={1000} height={400} />
            ) : (
              <div className="h-full flex items-center justify-center" >No data available for the chart.</div>
            )}
          </div>
        </div>


      </>

    </div>
  );
};

export default HourlyForecast;
