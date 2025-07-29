
import React from 'react';
import { Calendar, Droplets, TrendingUp } from 'lucide-react';

interface DataRow {
  // date: string;
  FV: number;
  FR: number;
  Today: number;
  NetTotal: number;
  MeterCode: string;      // <-- Add this
  LocalTimeCol: string;   // <-- Add this
}

// const mockData: DataRow[] = [
//   { LocalTimeCol: '2024-01-15', dailyConsumption: 1250, hourlyAverage: 52, peakHour: '08:00', efficiency: 85, MeterCode: 'BWM 1' },
//   { LocalTimeCol: '2024-01-14', dailyConsumption: 1180, hourlyAverage: 49, peakHour: '07:30', efficiency: 88, MeterCode: 'BWM 1' },
//   { LocalTimeCol: '2024-01-13', dailyConsumption: 1320, hourlyAverage: 55, peakHour: '09:15', efficiency: 82, MeterCode: 'BWM 1' },
//   { LocalTimeCol: '2024-01-12', dailyConsumption: 1290, hourlyAverage: 54, peakHour: '08:45', efficiency: 86, MeterCode: 'BWM 1' },
//   { LocalTimeCol: '2024-01-11', dailyConsumption: 1150, hourlyAverage: 48, peakHour: '07:00', efficiency: 90, MeterCode: 'BWM 1' },
//   { LocalTimeCol: '2024-01-10', dailyConsumption: 1400, hourlyAverage: 58, peakHour: '10:30', efficiency: 78, MeterCode: 'BWM 1' },
//   { LocalTimeCol: '2024-01-09', dailyConsumption: 1220, hourlyAverage: 51, peakHour: '08:15', efficiency: 87, MeterCode: 'BWM 1' },
// ];

interface DataTableProps {
  tableData: DataRow[]; // Adjust type as needed
  meterCode: string;
}

const DataTable: React.FC<DataTableProps> = ({ tableData, meterCode }) => {

  // 1. Filter data by selected meter
  const filteredData = tableData.filter(row => row.MeterCode === meterCode)
    // 2. Sort by LocalTimeCol descending
    .sort((a, b) => new Date(b.LocalTimeCol).getTime() - new Date(a.LocalTimeCol).getTime()).slice(0, 10);

  // console.log("Filtered Data:", filteredData);


  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors duration-300">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-teal-600 dark:text-teal-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Water Consumption Data
          </h3>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Daily consumption metrics and efficiency ratings
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                LocalTimeCol
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                FV (L)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                FR (L)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                NetTotal
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Today
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
            {filteredData.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
               
                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {new Date(row.LocalTimeCol).toLocaleString('en-US', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                  })}
                </td> 
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Droplets className="h-4 w-4 text-blue-500 mr-2" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {row.FV}
                    </span>
                  </div>
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


                {/* <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <TrendingUp className={`h-4 w-4 mr-2 ${row.efficiency >= 85 ? 'text-green-500' :
                      row.efficiency >= 80 ? 'text-yellow-500' : 'text-red-500'
                      }`} />
                    <span className={`text-sm font-medium ${row.efficiency >= 85 ? 'text-green-600 dark:text-green-400' :
                      row.efficiency >= 80 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'
                      }`}>
                      {row.efficiency}%
                    </span>
                  </div>
                </td> */}


              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
