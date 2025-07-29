// --- HELPER FUNCTION for GROUPING DATA BY DAY ---
interface ForecastRecord {
    LocalTimeCol: string;
    yhat: number;
    y_hat_lower: number;
    y_hat_upper: number;
    meter_code: string;
}

interface ChartableForecastRecord extends ForecastRecord {
    confidence_band: number;
}

export function groupDataByDay(data: ForecastRecord[]): ChartableForecastRecord[] {
    const groupedData: { [key: string]: ForecastRecord[] } = {};

    // Group data by date (YYYY-MM-DD format)
    data.forEach(item => {
        const date = new Date(item.LocalTimeCol).toISOString().split('T')[0];
        if (!groupedData[date]) {
            groupedData[date] = [];
        }
        groupedData[date].push(item);
    });

    // Calculate daily averages
    const dailyAverages = Object.keys(groupedData).map(date => {
        const dayData = groupedData[date];
        const avgYhat = dayData.reduce((sum, item) => sum + item.yhat, 0) / dayData.length;
        const avgLower = dayData.reduce((sum, item) => sum + item.y_hat_lower, 0) / dayData.length;
        const avgUpper = dayData.reduce((sum, item) => sum + item.y_hat_upper, 0) / dayData.length;

        return {
            LocalTimeCol: date,
            yhat: avgYhat,
            y_hat_lower: avgLower,
            y_hat_upper: avgUpper,
            meter_code: dayData[0].meter_code,
            confidence_band: avgUpper - avgLower,
        };
    });

    // Sort by date and return last 10 days
    return dailyAverages
        .sort((a, b) => new Date(a.LocalTimeCol).getTime() - new Date(b.LocalTimeCol).getTime())
        .slice(-12); // Get last 12 days
}
