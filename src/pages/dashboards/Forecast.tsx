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

interface ForecastItem {
    ds: string;
    forecast: number,
    yhat: number;
    yhat_lower: number;
    yhat_upper: number;
}

interface ResampledItem {
  ds: string;
  fr_mean: number;
  fv_mean: number;
}

const Forecast: React.FC = () => {
    // --- State Management ---
    const [meterCodes, setMeterCodes] = useState<string[]>([]);
    const [selectedMeter, setSelectedMeter] = useState<string>("");

    const [hourlyData, setHourlyData] = useState<ResampledItem[]>([]);
    const [dailyData, setDailyData] = useState<ResampledItem[]>([]);

    const [dailyFvForecastData, setDailyFvForecastData] = useState<ForecastItem[]>([]);
    const [dailyFrForecastData, setDailyFrForecastData] = useState<ForecastItem[]>([]);
    const [historicalData, setHistoricalData] = useState<ResampledItem[]>([]);

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




    // Effect to fetch all chart-related data whenever the selected meter changes
    useEffect(() => {
        if (!selectedMeter) return;
        const fetchAllChartData = async () => {
            // setLoading(true);
            setError(null);
            try {

                // const res = await axios.get(`http://localhost:5000/api/daily_forecast?meter_code=${selectedMeter}&target=FR`);
                // console.log(res.data);
                
                // Fetch all data in parallel for efficiency
                const [fvRes, frRes] = await Promise.all([
                    axios.get(`http://localhost:5000/api/daily_forecast?meter_code=${selectedMeter}&target=FR`),
                    axios.get(`http://localhost:5000/api/daily_forecast?meter_code=${selectedMeter}&target=FV`),

                ]);

                let fvparsedData;
                if (typeof fvRes.data === "string") {
                    const cleanedData = fvRes.data.replace(/\bNaN\b/g, "null");
                    fvparsedData = JSON.parse(cleanedData);
                } else {
                    fvparsedData = fvRes.data;
                }

                let frparsedData;
                if (typeof frRes.data === "string") {
                    const cleanedData = frRes.data.replace(/\bNaN\b/g, "null");
                    frparsedData = JSON.parse(cleanedData);
                } else {
                    frparsedData = frRes.data;
                }

                setDailyFrForecastData(frparsedData || []);
                setDailyFvForecastData(fvparsedData || []);

            } catch (err) {
                console.error("Error fetching chart data:", err);
                setError("Failed to load chart data for the selected meter.");
            } finally {
                setLoading(false);
            }
        };

        fetchAllChartData();
    }, [selectedMeter]);

    console.log(dailyFrForecastData);
    console.log(dailyFvForecastData);





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

            {/* Daily Forecast Section */}
            <div className="card p-6 bg-white dark:bg-dark-800 rounded-lg shadow-lg">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-gray-200 dark:border-gray-700 gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Daily Forecast Analysis</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Daily Forecast for Flow Volume and Flow Rate</p>
                    </div>
                    <MeterSelector selectedMeter={selectedMeter} onMeterChange={setSelectedMeter} meterCodes={meterCodes} />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                    <div className="h-72"><LineChartComponent data={dailyFvForecastData} loading={loading} error={error} dataKey="FV" timeUnit="daily" /></div>
                    <div className="h-72"><LineChartComponent data={dailyFrForecastData} loading={loading} error={error} dataKey="FR" timeUnit="daily" /></div>
                </div>
            </div>

            {/* Hourly Forecast Section */}
            <div className="card p-6 bg-white dark:bg-dark-800 rounded-lg shadow-lg">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-gray-200 dark:border-gray-700 gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Hourly Forecast Analysis</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Hourly Forecast for Flow Volume and Flow Rate</p>
                    </div>
                    <MeterSelector selectedMeter={selectedMeter} onMeterChange={setSelectedMeter} meterCodes={meterCodes} />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                    <div className="h-72"><LineChartComponent data={dailyData} loading={loading} error={error} dataKey="FV" timeUnit="daily" /></div>
                    <div className="h-72"><LineChartComponent data={dailyData} loading={loading} error={error} dataKey="FR" timeUnit="daily" /></div>
                </div>
            </div>



        </div>
    );
};

export default Forecast;
