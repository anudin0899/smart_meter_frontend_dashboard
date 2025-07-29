import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from './ui/select';

interface MeterSelectorProps {
    selectedMeter: string;
    onMeterChange: (meter: string) => void;
    meterCodes: string[]; // Adjusted to match your backend response field
}


const MeterSelector: React.FC<MeterSelectorProps> = ({ selectedMeter, onMeterChange, meterCodes }) => {

    return (
        <div className="flex items-center space-x-2 border-2 border-black rounded-lg outline-none focus:outline-none focus:border-none focus:shadow-none">
            <Select value={selectedMeter} onValueChange={onMeterChange}>
                <SelectTrigger className="w-48 bg-white dark:bg-gray-800 border-none outline-none focus:outline-none focus:border-none focus:shadow-none border-gray-300 dark:border-gray-600">
                    <SelectValue placeholder="Select meter">{selectedMeter ? selectedMeter : 'Select Meter'}</SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border outline-none border-gray-300 dark:border-gray-600">
                    {meterCodes.length > 0 ? (
                        meterCodes.map((meter,index) => (
                            <SelectItem
                                key={index}
                                value={meter}
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
        </div>
    );
};

export default MeterSelector;
