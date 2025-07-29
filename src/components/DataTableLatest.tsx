// import React, { useEffect, useState } from "react";
// import { Calendar } from "lucide-react";
// import { getLatestPerMeterCode } from "@/contexts/getLatestData";

// interface DataRow {
//   FV: number;
//   FR: number;
//   Today: number;
//   NetTotal: number;
//   MeterCode: string;
//   LocalTimeCol: string;
// }

// interface Props {
//   tableData: DataRow[];
// }

// const LatestPage: React.FC<Props> = ({ tableData }) => {
//   const [latestData, setLatestData] = useState<DataRow[]>([]);

//   // Fix: Only update when tableData changes, no need for setInterval here
//   useEffect(() => {
//     setLatestData(getLatestPerMeterCode(tableData));
//   }, [tableData]);

//   // console.log("✅ Latest data:", latestData);

//   if (!latestData || latestData.length === 0) {
//     return (
//       <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors duration-300">
//         <div className="px-6 py-4">
//           <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
//             No data available.
//           </h3>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors duration-300">
//       <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
//         <div className="flex items-center space-x-2">
//           <Calendar className="h-5 w-5 text-teal-600 dark:text-teal-400" />
//           <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
//             Recent Water Consumption Data
//           </h3>
//         </div>
//       </div>

//       <div className="overflow-x-auto w-full">
//         <table className="w-full">
//           <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
//             <tr>
//               {["LocalTimeCol", "Meter Code", "FV (L)", "FR (L)", "NetTotal", "Today"].map((header) => (
//                 <th
//                   key={header}
//                   className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
//                 >
//                   {header}
//                 </th>
//               ))}
//             </tr>
//           </thead>
//         </table>

//         <div style={{ maxHeight: "400px" }} className="overflow-y-auto overflow-x-auto">
//           <table className="w-full">
//             <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
//                 {[...latestData]
//                 .sort((a, b) => new Date(a.LocalTimeCol).getTime() - new Date(b.LocalTimeCol).getTime())
//                 .map((row, index) => (
//                   <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
//                   {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white min-w-[140px]">
//                     {new Date(row.LocalTimeCol).toLocaleString('en-US', {
//                     year: 'numeric',
//                     month: '2-digit',
//                     day: '2-digit',
//                     hour: '2-digit',
//                     minute: '2-digit',
//                     hour12: false,
//                     })}
//                   </td>  */}
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{row.LocalTimeCol}</td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{row.MeterCode}</td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{row.FV}</td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{row.FR}</td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{row.NetTotal}</td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{row.Today}</td>
//                   </tr>
//                 ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LatestPage;