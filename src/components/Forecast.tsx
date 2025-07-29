
import React, { useEffect, useState } from 'react';
import { TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import LineChartComponent from './LineChart';
import axios from 'axios';
import MeterSelector from './MeterSelector';

// Mock forecast data
// const forecastData = [
//   { name: 'Today', value: 1280 },
//   { name: 'Tomorrow', value: 1320 },
//   { name: 'Day 3', value: 1250 },
//   { name: 'Day 4', value: 1380 },
//   { name: 'Day 5', value: 1290 },
//   { name: 'Day 6', value: 1150 },
//   { name: 'Day 7', value: 1200 },
// ];

const forecastTableData = [
  { date: '2024-01-16', predicted: 1320, confidence: 92, status: 'normal' },
  { date: '2024-01-17', predicted: 1250, confidence: 89, status: 'normal' },
  { date: '2024-01-18', predicted: 1380, confidence: 85, status: 'high' },
  { date: '2024-01-19', predicted: 1290, confidence: 91, status: 'normal' },
  { date: '2024-01-20', predicted: 1150, confidence: 88, status: 'low' },
  { date: '2024-01-21', predicted: 1200, confidence: 90, status: 'normal' },
  { date: '2024-01-22', predicted: 1280, confidence: 87, status: 'normal' },
];

interface DashboardProps {
  loading: boolean
  data: any[];
  tableData: any[]; // Replace `any[]` with your actual data type if known
}

interface ForecastData {
  ds: string;
  yhat: number;
  yhat_upper: number;
  yhat_lower: number;
  MeterCode: string;
  forecast_type: string;
}


const Forecast: React.FC<DashboardProps> = ({ loading, tableData, data }) => {

  // const getStatusIcon = (status: string) => {
  //   switch (status) {
  //     case 'high':
  //       return <AlertTriangle className="h-4 w-4 text-amber-500" />;
  //     case 'low':
  //       return <TrendingUp className="h-4 w-4 text-blue-500" />;
  //     default:
  //       return <CheckCircle className="h-4 w-4 text-green-500" />;
  //   }
  // };

  // const getStatusColor = (status: string) => {
  //   switch (status) {
  //     case 'high':
  //       return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20';
  //     case 'low':
  //       return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20';
  //     default:
  //       return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
  //   }
  // };

  const [selectedMeter, setSelectedMeter] = useState('');
  const [meterCodes, setMeterCodes] = useState<any[]>([]);
  const [forecast, setForecast] = useState<ForecastData[]>([]);

  useEffect(() => {
    const fetchMeterCodes = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/metercodes');
        setMeterCodes(response.data);
      } catch (error) {
        console.error('Failed to fetch meter codes:', error);
        setMeterCodes([]);
      }
    };

    if (tableData.length > 0 && meterCodes.length === 0) {
      fetchMeterCodes();
    }
  }, [tableData, meterCodes]);


  useEffect(() => {
    const fetchForecast = () => {
      axios.get<ForecastData[]>('http://localhost:5000/api/forecast')
        .then(res => {
          console.log("Forecast data fetched:", res);
          setForecast(res.data);
        })
        .catch(err => console.error("Error fetching forecast:", err));
    };

    fetchForecast(); // initial fetch
    const interval = setInterval(fetchForecast, 30000);
    return () => clearInterval(interval);
  }, []);

  // Transform forecast data for line chart
  const forecastChartData = forecast
    .filter(item => item.forecast_type === 'hourly')
    .map(item => ({
      name: new Date(item.ds).toLocaleDateString('en-US', { weekday: 'short' }),
      value: item.yhat
    }));

  console.log("Forecast data:", forecast);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Water Consumption Overview
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor daily and hourly water usage patterns with detailed analytics
          </p>
        </div>
        {/* {tableData.length > 0 && ( */}
        <MeterSelector
          selectedMeter={selectedMeter}
          onMeterChange={setSelectedMeter}
          meterCodes={meterCodes}
        />
        {/* )} */}
      </div>

      {/* Forecast Chart */}
      {/* <div className="mb-8">
        <LineChartComponent
          title="7-Day Consumption Forecast"
          data={forecast}
          color="#8b5cf6"
          icon={<TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />}
          unit="L"
        />
      </div> */}

      {/* Forecast Table */}
      {/*<div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors duration-300">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Detailed Forecast Predictions
            </h3>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Machine learning predictions with confidence intervals
          </p>
        </div>

       <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Predicted Usage (L)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Confidence
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
              {forecastTableData.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {new Date(row.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      weekday: 'short'
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {row.predicted.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mr-3">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full"
                          style={{ width: `${row.confidence}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-300 min-w-fit">
                        {row.confidence}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(row.status)}`}>
                      {getStatusIcon(row.status)}
                      <span className="ml-1 capitalize">{row.status}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div> 
      </div>*/}


    </div >
  );
};

export default Forecast;
