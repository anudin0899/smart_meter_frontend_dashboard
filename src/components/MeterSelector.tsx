import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"; // Assuming this is your import path

interface MeterSelectorProps {
  selectedMeter: string;
  onMeterChange: (meter: string) => void;
  meterCodes: string[];
}

const MeterSelector: React.FC<MeterSelectorProps> = ({
  selectedMeter,
  onMeterChange,
  meterCodes,
}) => {
  return (
    // We remove the wrapper div and its border classes entirely.
    // The Select component will be the root.
    <Select value={selectedMeter} onValueChange={onMeterChange}>
    
      <SelectTrigger className="w-48 bg-white dark:bg-gray-800 border border-gray-200 rounded-md outline-none focus:outline-none focus:ring-0 focus:ring-offset-0">
        <SelectValue placeholder="Select meter">
          {selectedMeter ? selectedMeter : "Select Meter"}
        </SelectValue>
      </SelectTrigger>
     
      <SelectContent className="bg-white dark:bg-gray-800 border-none outline-none">
        {meterCodes.length > 0 ? (
          meterCodes.map((meter, index) => (
            <SelectItem
              key={index}
              value={meter}
              // These classes prevent any outline on the items themselves when hovered or focused.
              className="hover:bg-gray-100 dark:hover:bg-gray-700 outline-none focus:border-none"
            >
              <div className="flex flex-col">
                <span className="font-medium">{meter}</span>
              </div>
            </SelectItem>
          ))
        ) : (
          <div className="px-4 py-2 text-gray-500">No meters available</div>
        )}
      </SelectContent>
    </Select>
  );
};

export default MeterSelector;