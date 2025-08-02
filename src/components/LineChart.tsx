import React, { FC, useMemo, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { Download } from "lucide-react"; // Import the download icon
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { ResampledItem } from "@/types";

interface LineChartProps {
  data: ResampledItem[];
  loading: boolean;
  error: string | null;
  dataKey: 'FV' | 'FR';
  timeUnit: 'daily' | 'hourly';
}

/**
 * A reusable line chart component with theme-aware styling and data download functionality.
 */
const LineChartComponent: FC<LineChartProps> = ({ data, loading, error, dataKey, timeUnit }) => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const chartTitle = `${timeUnit === 'daily' ? 'Daily' : 'Hourly'} Trend for ${dataKey}`;

  const formattedData = useMemo(() => {
    return data.map(item => ({
      ...item,
      timestamp: new Date(item.ds).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      date: new Date(item.ds).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    }));
  }, [data]);

  const xAxisDataKey = timeUnit === 'daily' ? 'date' : 'date';

  // --- Download Handlers ---
  const handlePdfDownload = () => {
    const doc = new jsPDF();
    doc.text(chartTitle, 14, 16);
    autoTable(doc, {
      head: [['Timestamp', dataKey]],
      body: formattedData.map(item => [item.ds, item[dataKey]]),
      startY: 20,
    });
    doc.save(`${chartTitle.replace(/ /g, '_')}.pdf`);
    setDropdownOpen(false);
  };

  const handleExcelDownload = () => {
    const worksheet = XLSX.utils.json_to_sheet(formattedData.map(item => ({ Timestamp: item.ds, Value: item[dataKey] })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Chart Data");
    XLSX.writeFile(workbook, `${chartTitle.replace(/ /g, '_')}.xlsx`);
    setDropdownOpen(false);
  };

  // --- Custom Tooltip Component ---
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg">
          <p className="label text-sm font-bold text-slate-800 dark:text-slate-200">{`${label}`}</p>
          {payload.map((pld: any, index: number) => (
            <p key={`item-${index}`} className="intro text-sm" style={{ color: pld.stroke }}>
              {`${pld.name}: ${pld.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) return <div className="flex items-center justify-center h-full">Loading...</div>;
  if (error) return <div className="flex items-center justify-center h-full text-red-500">{error}</div>;
  if (data.length === 0) return <div className="flex items-center justify-center h-full text-gray-500">No data available.</div>;

  return (
    <div className="w-full h-full relative">
      {/* Header with Title and Download Button */}
      <div className="flex justify-between items-center mb-2 px-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{chartTitle}</h3>
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!isDropdownOpen)}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
            aria-label="Download chart data"
          >
            <Download size={18} />
          </button>
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-10">
              <ul className="py-1">
                <li>
                  <button onClick={handlePdfDownload} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">
                    Download as PDF
                  </button>
                </li>
                <li>
                  <button onClick={handleExcelDownload} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">
                    Download as Excel
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Chart Container */}
      <ResponsiveContainer width="100%" height="90%">
        <LineChart data={formattedData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }} >
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
          <XAxis dataKey={xAxisDataKey} tick={{ fontSize: 12, fill: 'rgb(107 114 128)' }} />
          <YAxis tick={{ fontSize: 12, fill: 'rgb(107 114 128)' }} padding={{ top: 30, bottom: 30 }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            type="monotone"
            dataKey={dataKey}
            name={dataKey}
            stroke={dataKey === 'FV' ? "#8884d8" : "#82ca9d"}
            strokeWidth={timeUnit === 'daily' ? 2 : 1}
            dot={false}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineChartComponent;
