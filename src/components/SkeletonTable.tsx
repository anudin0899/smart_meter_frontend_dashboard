import React from 'react';

const SkeletonTable = () => {
  return (
    <div className="animate-pulse overflow-x-auto rounded-xl p-4 bg-white dark:bg-black shadow-lg border border-gray-200 dark:border-gray-700">
      <table className="min-w-full ">
        <thead className="bg-white dark:bg-black">
          <tr>
            {[...Array(4)].map((_, i) => (
              <th key={i} className="px-4 py-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mx-auto" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-black">
          {[...Array(10)].map((_, rowIndex) => (
            <tr key={rowIndex} className="border-t border-gray-300 dark:border-gray-700">
              {[...Array(4)].map((_, colIndex) => (
                <td key={colIndex} className="px-4 py-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SkeletonTable;
