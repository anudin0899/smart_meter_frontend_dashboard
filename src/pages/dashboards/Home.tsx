import { FC, useEffect, useMemo, useState } from "react";
import { Package, TrendingUp, Percent } from "lucide-react";
import { categoryData } from "../../services/mockData";
import SkeletonCard from "@/components/SkeletonCard";
import { getLatestPerMeterCode } from "@/contexts/getLatestData";
import axios from "axios";
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
import MeterSelector from "@/components/MeterSelector";


// --- 1. Define the Custom Plugin for Peak Lines ---
const peakLinesPlugin = {
  id: 'peakLines',
  afterDatasetsDraw(chart, args, options) {
    const { ctx, chartArea: { top, bottom, left, right }, scales: { x } } = chart;

    // Check if peak data is available from the options
    if (!options.peakData) {
      return;
    }

    const { morning_peak_hour, night_peak_hour } = options.peakData;

    // Helper function to draw a line and its label
    const drawPeakLine = (hour, label, color) => {
      if (hour === null || hour === undefined) return;

      // Find the x-coordinate for the given hour on the time scale
      // We need to find a date in the data that has this hour
      const targetDate = chart.data.datasets[0].data.find(d => new Date(d.x).getHours() === hour);
      if (!targetDate) return; // If no data point for this hour exists, we can't draw the line

      const xCoord = x.getPixelForValue(new Date(targetDate.x));

      // Draw the vertical line
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(xCoord, top);
      ctx.lineTo(xCoord, bottom);
      ctx.lineWidth = 2;
      ctx.strokeStyle = color;
      ctx.stroke();

      // Draw the label
      ctx.fillStyle = color;
      ctx.textAlign = 'center';
      ctx.fillText(label, xCoord, top - 5);
      ctx.restore();
    };

    drawPeakLine(morning_peak_hour, 'Morning Peak', 'rgba(255, 159, 64, 1)');
    drawPeakLine(night_peak_hour, 'Night Peak', 'rgba(75, 192, 192, 1)');
  }
};

// --- 2. Register all components, including the new plugin ---
ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, TimeScale,
  peakLinesPlugin // Register the custom plugin
);


export interface MeterReading {
  FR: number;
  FV: number;
  LocalTimeCol: string;
  MeterCode: string;
  NetTotal: number;
  [key: string]: any; // allows extra unknown fields
}

interface PeakTimeData {
  morning_peak_hour: number | null;
  morning_peak_fv: number | null;
  night_peak_hour: number | null;
  night_peak_fv: number | null;
}

interface Props {
  // loading: boolean;
  tableData: MeterReading[];
}

type MeterData = {
  [key: string]: any[]; // if values are arrays of any type
};

interface ResampledItem { ds: string; FV: number; }
interface PeakTimeData {
  morning_peak_hour: number | null;
  night_peak_hour: number | null;
}


const Home: FC<Props> = ({ tableData }) => {

  const [meterCodes, setMeterCodes] = useState<string[]>([]);
  const [selectedMeter, setSelectedMeter] = useState<string>("");
  const [resampledData, setResampledData] = useState<ResampledItem[]>([]);
  const [peakTimes, setPeakTimes] = useState<PeakTimeData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<MeterData>({});
  const [loading, setLoading] = useState<boolean>(true);



  useEffect(() => {
    const fetchData = () => {
      axios.get('http://localhost:5000/api/status')
        .then(res => {
          setData(res.data);
        })
        .catch(err => console.error(err));
    };
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [tableData]);




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
    if (!selectedMeter) return;
    const fetchAllDataForMeter = async () => {
      setLoading(true);
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





  const hourlyChartOptions = useMemo(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: "top" as const },
    title: { display: true, text: `Hourly Water Usage Pattern for ${selectedMeter}` },
    peakLines: { peakData: peakTimes },
  },
  scales: {
    x: {
      type: 'time',
      time: {
        unit: 'hour',
        displayFormats: {
          hour: 'HH:mm',
        }
      },
      title: { display: true, text: 'Hour of Day' },
      grid: { drawOnChartArea: false },
    },
    y: {
      beginAtZero: true,
      title: { display: true, text: 'Average Flow Volume (FV)' }
    },
  },
}), [selectedMeter, peakTimes]);




  

  const hourlyChartData = useMemo(() => {
    if (!resampledData.length) return { labels: [], datasets: [] };

    const hourlyMap = new Map<number, number[]>();
    resampledData.forEach(item => {
      const hour = new Date(item.ds).getUTCHours();
      if (!hourlyMap.has(hour)) hourlyMap.set(hour, []);
      hourlyMap.get(hour)!.push(item.FV);
    });

    const hourlyAverages = Array.from({ length: 24 }, (_, hour) => {
      const values = hourlyMap.get(hour);
      return values ? values.reduce((a, b) => a + b, 0) / values.length : 0;
    });

    // Create data with dummy date for each hour (e.g., Jan 1, 2023)
    const hourlyAveragesData = hourlyAverages.map((value, hour) => ({
      x: new Date(2023, 0, 1, hour).toISOString(),
      y: value
    }));

    // Rolling average
    const paddedAvgs = [...hourlyAverages.slice(-2), ...hourlyAverages, ...hourlyAverages.slice(0, 2)];
    const rollingAvg = [];
    for (let i = 0; i < 24; i++) {
      const window = paddedAvgs.slice(i, i + 4);
      rollingAvg.push(window.reduce((sum, val) => sum + val, 0) / window.length);
    }

    const rollingAvgData = rollingAvg.map((value, hour) => ({
      x: new Date(2023, 0, 1, hour).toISOString(),
      y: value
    }));

    return {
      datasets: [
        {
          label: 'Average Hourly Usage',
          data: hourlyAveragesData,
          borderColor: 'rgba(54, 162, 235, 0.4)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          fill: true,
          tension: 0.4,
        },
        {
          label: '4-Hour Rolling Mean',
          data: rollingAvgData,
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 2,
          tension: 0.4,
        }
      ]
    };
  }, [resampledData]);








  const totalLatestDataCount = tableData.length || 0;
  const uniqueMeters = Array.from(new Set(tableData.map(d => d.MeterCode)));
  const totalMeterCount = uniqueMeters.length;
  const totalToday = tableData.reduce((sum, d) => sum + d.Today, 0);
  const avgToday = totalLatestDataCount > 0 ? totalToday / totalLatestDataCount : 0;


  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Data</h1>
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">

        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {tableData.length > 0 ?
          <div className="card p-6 bg-white dark:bg-dark-800 rounded-lg shadow h-28">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Data</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {data?.total_historical_records}
                </p>
              </div>
            </div>
          </div>
          :
          <SkeletonCard />
        }

        {tableData.length > 0 ?
          <div className="card p-6 bg-white dark:bg-dark-800 rounded-lg shadow h-28">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Percent className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Last processed Timestamp </p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {data?.last_processed_time_in_memory}
                </p>
              </div>
            </div>
          </div>
          :
          <SkeletonCard />
        }

        {tableData.length > 0 ?
          <div className="card p-6 bg-white dark:bg-dark-800 rounded-lg shadow h-28">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Package className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total MeterCodes</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {data?.total_meters}
                </p>
              </div>
            </div>
          </div>
          :
          <SkeletonCard />
        }

      </div>

      {/* Table */}
      <div style={{ minHeight: "340px" }} className="card p-6 bg-white dark:bg-dark-800 rounded-lg shadow h-86">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Latest Data Details
        </h3>
        <div className="" style={{ maxHeight: "280px", minHeight: "60px", overflowY: "auto", overflowX: "auto" }}>
          <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-700 overflow-y-auto " style={{ maxHeight: "280px", overflow: "auto" }}>
            <thead className="bg-gray-100 dark:bg-dark-800 sticky top-0 z-10 overflow-y-hidden">
              <tr className="">
                {["LocalTimeCol", "Meter Code", "FV", "FR", "NetTotal", "Today"].map((header) => (
                  <th
                    key={header}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-100 dark:bg-dark-800"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-dark-800 divide-y divide-gray-200 dark:divide-dark-700">
              {/* {[...latestData]
                .sort((a, b) => new Date(a.LocalTimeCol).getTime() - new Date(b.LocalTimeCol).getTime())
                .map((row, index) => ( */}
              {tableData.map((row, index) => (
                <tr
                  key={index}
                  className="hover:bg-gray-50 dark:hover:bg-dark-700 "
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {row.LocalTimeCol}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {row.MeterCode}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {row.FV}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {row.FR}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {row.NetTotal}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {row.Today}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Charts */}
      <div className="card p-6 bg-white dark:bg-dark-800 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Hourly Usage Analysis</h3>
          <MeterSelector selectedMeter={selectedMeter} onMeterChange={setSelectedMeter} meterCodes={meterCodes} />
        </div>
        <div style={{ position: 'relative', height: '400px' }}>
          {loading ? (<div className="h-full flex items-center justify-center">Loading Chart...</div>)
            : error ? (<div className="h-full flex items-center justify-center text-red-500">{error}</div>)
              : (resampledData.length > 0) ? (<Line data={hourlyChartData} options={hourlyChartOptions as any} />)
                : (<div className="h-full flex items-center justify-center">No data available for this meter.</div>)}
        </div>
      </div>

      {/* 
      {selectedMeter ? (
        <>
         
          <div className="card p-6 bg-white dark:bg-dark-800 rounded-lg shadow">
            <div style={{ height: '400px' }}>
              {loading ? (
                <div className="h-full flex items-center justify-center">Loading Chart...</div>
              ) : (peakTimes.length) ? (
                <Line data={chartData} options={chartOptions as any} width={1000} height={400} />
              ) : (
                <div>No data available for the chart.</div>
              )}
            </div>
          </div>

          //  Data Table 
        
        </>
      ) : (
        <div className="flex items-center justify-center h-96 ">
          <div className="bg-red-100 border border-red-400 flex items-center justify-center text-red-700 px-4 py-3 rounded w-full">
            {loading ? "Please select a meter to view the forecast." : error ? error : "Loading..."}
          </div>
        </div>
      )}

    */}

    </div>
  );
};

export default Home;
