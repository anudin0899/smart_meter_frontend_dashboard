import React, { FC, useEffect, useState } from "react";
import axios from "axios";
import { Package, TrendingUp, Percent } from "lucide-react";

// Import types from the centralized types file
import { MeterReading, PeakTimeData, ResampledItem, StatusData } from "@/types";
import KpiCard from "@/components/KpiCard";
import LineChartComponent from "@/components/LineChart";
import UsageChart from "@/components/UsageChart";
import MeterSelector from "@/components/MeterSelector";

// Import reusable UI and Chart components


interface HomeProps {
  tableData: MeterReading[];
}

const Home: FC<HomeProps> = ({ tableData }) => {
  // --- State Management ---
  const [meterCodes, setMeterCodes] = useState<string[]>([]);
  const [selectedMeter, setSelectedMeter] = useState<string>("");
  const [resampledData, setResampledData] = useState<ResampledItem[]>([]);
  const [hourlyData, setHourlyData] = useState<ResampledItem[]>([]);
  const [dailyData, setDailyData] = useState<ResampledItem[]>([]);
  const [peakTimes, setPeakTimes] = useState<PeakTimeData | null>(null);
  const [statusData, setStatusData] = useState<StatusData>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // --- Utility Functions ---
  const formatTimestamp = (timestamp: string | null | undefined): string => {
    if (!timestamp) return "N/A";
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return "Invalid date";
      return date.toLocaleString("en-IN", { year: "numeric", month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: true });
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return "Error";
    }
  };

  // --- Data Fetching Effects ---
  // Effect to fetch general status data periodically
  useEffect(() => {
    const fetchStatus = () => {
      axios.get('http://localhost:5000/api/status')
        .then(res => setStatusData(res.data))
        .catch(err => console.error('Failed to fetch status:', err));
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  // Effect to fetch the list of available meter codes once on component mount
  useEffect(() => {
    const fetchMeterCodes = async () => {
      try {
        const res = await axios.get<{ meter_codes: string[] }>("http://localhost:5000/api/meter_codes");
        const codes = res.data.meter_codes;
        setMeterCodes(codes);

        if (codes.length > 0 && !selectedMeter) {
          setSelectedMeter(codes[0]);
        }
      } catch (err) {
        setError("Failed to load meter codes.");
      }
    };
    fetchMeterCodes();
  }, []);


  useEffect(() => {
    if (!selectedMeter) return;
    const fetchAllDataForMeter = async () => {
      // setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`http://localhost:5000/api/peak_times?meter_code=${selectedMeter}`);
        let parsedData;
        if (typeof res.data === "string") {
          const cleanedData = res.data.replace(/\bNaN\b/g, "null");
          parsedData = JSON.parse(cleanedData);
        } else {
          parsedData = res.data;
        }
        const { peak_times, resampled_data, rolling_average_data } = parsedData;
        setResampledData(resampled_data || []);
        if (peak_times && peak_times.length > 0) {
          setPeakTimes(peak_times[0]);
        } else {
          setPeakTimes(null);
        }
      } catch (err) {
        setError("Failed to load data.");
      } finally {
        setLoading(false);
      }
    };
    fetchAllDataForMeter();
  }, [selectedMeter]);

  // Effect to fetch all chart-related data whenever the selected meter changes
  useEffect(() => {
    if (!selectedMeter) return;
    const fetchAllChartData = async () => {
      // setLoading(true);
      setError(null);
      try {
        // Fetch all data in parallel for efficiency
        const [hourlyRes, dailyRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/hourly_resampled?meter_code=${selectedMeter}`),
          axios.get(`http://localhost:5000/api/daily_resampled?meter_code=${selectedMeter}`),
    
        ]);

        let hourlyparsedData;
        if (typeof hourlyRes.data === "string") {
          const cleanedData = hourlyRes.data.replace(/\bNaN\b/g, "null");
          hourlyparsedData = JSON.parse(cleanedData);
        } else {
          hourlyparsedData = hourlyRes.data;
        }

        let dailyparsedData;
        if (typeof dailyRes.data === "string") {
          const cleanedData = dailyRes.data.replace(/\bNaN\b/g, "null");
          dailyparsedData = JSON.parse(cleanedData);
        } else {
          dailyparsedData = dailyRes.data;
        }

        setHourlyData(hourlyparsedData || []);
        setDailyData(dailyparsedData || []);

      } catch (err) {
        console.error("Error fetching chart data:", err);
        setError("Failed to load chart data for the selected meter.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllChartData();
  }, [selectedMeter]);

  

  // --- Render Logic ---
  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Data Dashboard</h1>
      </div>

      {/* KPI Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KpiCard icon={TrendingUp} title="Total Historical Records" value={statusData.total_historical_records?.toLocaleString() ?? '...'} color="blue" />
        <KpiCard icon={Percent} title="Last Processed Time" value={formatTimestamp(statusData.last_processed_time_in_memory)} color="green" />
        <KpiCard icon={Package} title="Active Meters" value={statusData.total_meters ?? '...'} color="purple" />
      </div>

      {/* Trend Analysis Section */}
      <div className="card p-6 bg-white dark:bg-dark-800 rounded-lg shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-gray-200 dark:border-gray-700 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Usage Trend Analysis</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Daily and hourly patterns for Flow Volume and Flow Rate</p>
          </div>
          <MeterSelector selectedMeter={selectedMeter} onMeterChange={setSelectedMeter} meterCodes={meterCodes} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <div className="h-72"><LineChartComponent data={dailyData} loading={loading} error={error} dataKey="FV" timeUnit="daily" /></div>
            <div className="h-72"><LineChartComponent data={dailyData} loading={loading} error={error} dataKey="FR" timeUnit="daily" /></div>
            <div className="h-72"><LineChartComponent data={hourlyData} loading={loading} error={error} dataKey="FV" timeUnit="hourly" /></div>
            <div className="h-72"><LineChartComponent data={hourlyData} loading={loading} error={error} dataKey="FR" timeUnit="hourly" /></div>
        </div>
      </div>

      {/* Peak Time Analysis Section */}
      <div className="card p-6 bg-white dark:bg-dark-800 rounded-lg shadow-lg">

        <div className="pb-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Peak Time Analysis</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Average hourly usage to identify peak periods</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div className="h-96"><UsageChart data={hourlyData} peakTimes={peakTimes} loading={loading} error={error} chartType="FV" /></div>
          <div className="h-96"><UsageChart data={hourlyData} peakTimes={peakTimes} loading={loading} error={error} chartType="FR" /></div>
        </div>
      </div>

      {/* Data Table Section */}
      <div className="card p-6 bg-white dark:bg-dark-800 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Latest Data Details</h3>
        <div className="max-h-96 overflow-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-700">
            <thead className="bg-gray-100 dark:bg-dark-900 sticky top-0 z-10">
              <tr>
                {["Timestamp", "Meter Code", "FV", "FR", "NetTotal", "Today"].map((header) => (
                  <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-dark-800 divide-y divide-gray-200 dark:divide-dark-700">
              {tableData.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-dark-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{formatTimestamp(row.LocalTimeCol)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{row.MeterCode}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{row.FV}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{row.FR}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{row.NetTotal}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{row.Today || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Home;
