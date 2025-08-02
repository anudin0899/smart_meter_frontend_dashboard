import React, { FC } from "react";
import { LucideProps } from "lucide-react";

interface KpiCardProps {
    icon: React.ComponentType<LucideProps>;
    title: string;
    value: string | number;
    color: 'blue' | 'green' | 'purple';
}


const KpiCard: FC<KpiCardProps> = ({ icon: Icon, title, value, color }) => {
    const colorClasses = {
        blue: 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400',
        green: 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400',
        purple: 'bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400',
    };
    return (
        <div className="card flex items-center p-4 bg-white dark:bg-dark-800 rounded-xl shadow-md min-h-[100px]">
            <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
                <Icon className="h-6 w-6" />
            </div>
            <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white truncate">{value}</p>
            </div>
        </div>
    );
};

export default KpiCard;