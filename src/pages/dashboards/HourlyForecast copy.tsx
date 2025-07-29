import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { TrendingUp, Target, DollarSign } from "lucide-react";
import axios from "axios";
import MeterSelector from "@/components/MeterSelector";
import DataTable from "@/components/DataTable";
import SkeletonTable from "@/components/SkeletonTable";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// --- INTERFACES ---
interface ConsumptionData {
  LocalTimeCol: string;
  MeterCode: string;
  FV: number;
  FR: number;
  NetTotal: number;
  Today: number;
}

interface ProphetForecastRecord {
  ds: string;
  yhat: number;
  yhat_lower: number;
  yhat_upper: number;
  MeterCode: string;
}

interface ResampledData {
  LocalTimeCol: string;
  FV: number;
  FR: number;
  NetTotal: number;
  Today: number;
}

interface CombinedChartData {
  ds: string;
  y: number | null;
  yhat: number | null;
  y_hat_upper: number | null;
  y_hat_lower: number | null;
  NetTotal?: number;
  FR?: number;
  Today?: number;
}

interface ForecastApiResponse {
  resampled_data: {
    [meterCode: string]: ResampledData[];
  };
  forecast_data: ProphetForecastRecord[];
}

interface HourlyForecastProps {
  loading: boolean;
  tableData: ConsumptionData[];
}

const HourlyForecast: React.FC<HourlyForecastProps> = ({ loading, tableData }) => {


  const [meterCodes, setMeterCodes] = useState<string[]>([]);
  const [selectedMeter, setSelectedMeter] = useState('');
  const [originalData, setOriginalData] = useState<ResampledData[]>([]);
  const [chartData, setChartData] = useState<ProphetForecastRecord[]>([]);
  const [combinedChartData, setCombinedChartData] = useState<CombinedChartData[]>([]);
  const [apiLoading, setApiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cache for API responses
  const dataCache = useRef<Map<string, ForecastApiResponse>>(new Map());
  const abortController = useRef<AbortController | null>(null);

  // Debounced meter selection to prevent rapid API calls
  const debouncedMeterSelection = useCallback(
    debounce((meterCode: string) => {
      fetchForecastData(meterCode);
    }, 300),
    []
  );

  // Optimized data fetching with caching and abort signal
  const fetchForecastData = useCallback(async (meterCode: string) => {
    if (!meterCode) {
      setOriginalData([]);
      setChartData([]);
      setCombinedChartData([]);
      return;
    }

    // Check cache first
    if (dataCache.current.has(meterCode)) {
      const cachedData = dataCache.current.get(meterCode)!;
      processApiResponse(cachedData, meterCode);
      return;
    }

    // Cancel previous request
    if (abortController.current) {
      abortController.current.abort();
    }

    abortController.current = new AbortController();
    setApiLoading(true);
    setError(null);

    try {
      const response = await axios.get<ForecastApiResponse>(
        `http://localhost:5000/api/hourly_forecast?meter_code=${meterCode}`,
        {
          signal: abortController.current.signal,
          timeout: 10000 // 10 second timeout
        }
      );

      // Cache the response
      dataCache.current.set(meterCode, response.data);

      // Process data
      processApiResponse(response.data, meterCode);

    } catch (error: any) {
      if (error.name !== 'AbortError' && error.name !== 'CanceledError') {
        console.error('Error fetching forecast data:', error);
        setError('Failed to fetch forecast data');
        setOriginalData([]);
        setChartData([]);
      }
    } finally {
      setApiLoading(false);
    }
  }, []);




  // Separate function to process API response
  const processApiResponse = useCallback((responseData: ForecastApiResponse, meterCode: string) => {
    const { resampled_data, forecast_data } = responseData;

    // Set original/historical data
    const meterResampledData = resampled_data?.[meterCode] || [];
    setOriginalData(meterResampledData);

    // Set forecast data (filter client-side for better performance)
    const meterForecastData = forecast_data?.filter(
      (item: ProphetForecastRecord) => item.MeterCode === meterCode
    ) || [];
    setChartData(meterForecastData);
  }, []);




  // Effect for meter selection with debouncing
  useEffect(() => {
    if (selectedMeter) {
      debouncedMeterSelection(selectedMeter);
    }

    // Cleanup function
    return () => {
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, [selectedMeter, debouncedMeterSelection]);


  
  // Fetch meter codes (cached)
  useEffect(() => {
    const fetchMeterCodes = async () => {
      try {
        const response = await axios.get<{ meter_codes: string[] }>('http://localhost:5000/api/meter_codes');
        if (response.data?.meter_codes?.length > 0) {
          setMeterCodes(response.data.meter_codes);
        }
        console.log(response, "meter code in hourly page");
      } catch (error) {
        console.error('Failed to fetch meter codes:', error);
      }
    };
    fetchMeterCodes();
  }, []);

  // Optimized data combining with useMemo
  useEffect(() => {
    if (originalData.length === 0 && chartData.length === 0) {
      setCombinedChartData([]);
      return;
    }

    // Use requestAnimationFrame to defer heavy computation
    const timeoutId = setTimeout(() => {
      const combined = combineData(originalData, chartData);
      setCombinedChartData(combined);
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [originalData, chartData]);

  // Memoized KPI calculations
  const kpiValues = useMemo(() => {
    const totalNetTotal = originalData.reduce((sum, d) => sum + (d.NetTotal || 0), 0);
    const filteredTableData = tableData.filter(row => row.MeterCode === selectedMeter);
    const meanFV = filteredTableData.length > 0
      ? filteredTableData.reduce((sum, d) => sum + d.FV, 0) / filteredTableData.length
      : 0;
    const minToday = filteredTableData.length > 0
      ? Math.min(...filteredTableData.map(d => d.Today))
      : 0;

    return { totalNetTotal, filteredTableData, meanFV, minToday };
  }, [originalData, tableData, selectedMeter]);

  // Optimized chart data preparation
  const chartJsData = useMemo(() => {
    if (combinedChartData.length === 0) return null;

    // Limit data points for better performance (show last 100 points)
    const limitedData = combinedChartData.slice(-100);

    const labels = limitedData.map(d => {
      const date = new Date(d.ds);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit'
      });
    });

    return {
      labels,
      datasets: [
        {
          label: 'Confidence Interval',
          data: limitedData.map(d => d.y_hat_lower),
          borderColor: 'rgba(16, 185, 129, 0.3)',
          backgroundColor: 'rgba(16, 185, 129, 0.15)',
          fill: '+1',
          pointRadius: 0,
          pointHoverRadius: 0,
          tension: 0.3,
          order: 3
        },
        {
          label: 'Historical Actual',
          data: limitedData.map(d => d.y),
          borderColor: '#3B82F6',
          backgroundColor: '#3B82F6',
          borderWidth: 2,
          pointRadius: 1,
          pointHoverRadius: 4,
          tension: 0.3,
          fill: false,
          spanGaps: false,
          order: 1
        },
        {
          label: 'Forecast',
          data: limitedData.map(d => d.yhat),
          borderColor: '#FF6B6B',
          backgroundColor: '#FF6B6B',
          borderWidth: 2,
          pointRadius: 1,
          pointHoverRadius: 4,
          tension: 0.3,
          fill: false,
          spanGaps: false,
          order: 2
        },
        {
          label: 'Upper Bound',
          data: limitedData.map(d => d.y_hat_upper),
          borderColor: '#10B981',
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderDash: [5, 5],
          pointRadius: 0,
          pointHoverRadius: 3,
          tension: 0.3,
          fill: '-2',
          order: 4
        }
      ].filter(dataset => dataset.data.some(value => value !== null))
    };
  }, [combinedChartData]);

  // Optimized chart options
  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 0 // Disable animations for better performance
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const
      },
      tooltip: {
        callbacks: {
          title: function (context: any) {
            const index = context[0].dataIndex;
            const limitedData = combinedChartData.slice(-100);
            if (limitedData[index]) {
              const date = new Date(limitedData[index].ds);
              return date.toLocaleString();
            }
            return '';
          },
          label: function (context: any) {
            const value = context.raw;
            if (value === null || value === undefined) return null;
            return `${context.dataset.label}: ${Number(value).toFixed(4)}`;
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: { display: true, text: 'Time' },
        ticks: {
          maxTicksLimit: 8,
          autoSkip: true
        }
      },
      y: {
        display: true,
        title: { display: true, text: 'Value' }
      }
    },
    elements: {
      line: { tension: 0.3 },
      point: { radius: 1 }
    }
  }), [combinedChartData]);

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

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {selectedMeter ? (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card p-4 bg-white dark:bg-dark-800 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total NetTotal
                  </p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {kpiValues.totalNetTotal.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-4 bg-white dark:bg-dark-800 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Average FV
                  </p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {kpiValues.meanFV.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-4 bg-white dark:bg-dark-800 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <Target className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Min 'Today' Value
                  </p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {kpiValues.minToday.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="card p-6 bg-white dark:bg-dark-800 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Hourly Forecast Trend for: {selectedMeter}
            </h3>
            <div style={{ height: '400px' }}>
              {(loading || apiLoading) ? (
                <div className="flex items-center justify-center h-full">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    <span>Loading Chart Data...</span>
                  </div>
                </div>
              ) : chartJsData ? (
                <Line data={chartJsData} options={chartOptions} />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No data available for the selected meter
                </div>
              )}
            </div>
          </div>

          {/* Data Table */}
          <div className="mb-8">
            {loading ? (
              <SkeletonTable />
            ) : (
              <DataTable tableData={kpiValues.filteredTableData} meterCode={selectedMeter} />
            )}
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center h-96">
          <p className="text-lg font-bold text-gray-600 dark:text-gray-300">
            Please select a meter code to view forecast and KPIs.
          </p>
        </div>
      )}
    </div>
  );
};

// Helper Functions
function debounce<T extends (...args: any[]) => void>(func: T, delay: number): T {
  let timeoutId: NodeJS.Timeout;
  return ((...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  }) as T;
}

function combineData(originalData: ResampledData[], chartData: ProphetForecastRecord[]): CombinedChartData[] {
  const forecastMap = new Map<string, ProphetForecastRecord>();

  chartData.forEach(item => {
    forecastMap.set(item.ds, item);
  });

  const combined: CombinedChartData[] = [];

  // Add historical data with forecast overlay
  originalData.forEach(historical => {
    const forecast = forecastMap.get(historical.LocalTimeCol);
    combined.push({
      ds: historical.LocalTimeCol,
      y: historical.FV,
      yhat: forecast?.yhat || null,
      y_hat_upper: forecast?.yhat_upper || null,
      y_hat_lower: forecast?.yhat_lower || null,
      NetTotal: historical.NetTotal,
      FR: historical.FR,
      Today: historical.Today
    });
  });

  // Add forecast-only data points
  chartData.forEach(forecast => {
    const hasHistorical = originalData.some(h => h.LocalTimeCol === forecast.ds);
    if (!hasHistorical) {
      combined.push({
        ds: forecast.ds,
        y: null,
        yhat: forecast.yhat,
        y_hat_upper: forecast.yhat_upper,
        y_hat_lower: forecast.yhat_lower
      });
    }
  });

  return combined.sort((a, b) => new Date(a.ds).getTime() - new Date(b.ds).getTime());
}

export default HourlyForecast;
