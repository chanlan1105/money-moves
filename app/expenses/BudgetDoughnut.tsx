import { useEffect, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, ChartData } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface BudgetCategoryData {
    category: string;
    budget: number;
    actual: number;
    color: string;
    remaining: number;
}

interface BudgetDoughnutProps {
    data: BudgetCategoryData;
}

export default function BudgetDoughnut({ data }: BudgetDoughnutProps) {
    const [trackColor, setTrackColor] = useState<string>('rgba(0,0,0,0.1)');

    useEffect(() => {
        const root = getComputedStyle(document.documentElement);
        const color = root.getPropertyValue('--chart-track').trim();
        if (color) setTrackColor(color);
    }, []);

    // Logic for Zero Budget handling
    const isZeroBudget = data.budget === 0;
    
    // Calculate percentage safely
    const percentage = isZeroBudget 
        ? (data.actual > 0 ? 100 : 0) 
        : Math.round((data.actual / data.budget) * 100);

    const chartData: ChartData<'doughnut'> = {
        labels: ['Spent', 'Remaining'],
        datasets: [{
            // If budget is 0 and spent > 0, make the chart look full (100% spent)
            data: isZeroBudget && data.actual === 0 
                ? [0, 1] // If budget and spending are both 0, show a full "remaining" circle
                : isZeroBudget && data.actual > 0 
                    ? [1, 0] // If budget is 0 but money is spent, show a full "spent" circle
                    : [data.actual, data.remaining],
            backgroundColor: [data.color, trackColor],
            borderWidth: 0,
        }]
    };

    const formatCurrency = (val: number) => 
        new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(val);

    const diff = data.budget - data.actual;
    const isOver = diff < 0;
    const absDiff = Math.abs(diff);

    return (
        <div className="flex flex-col items-center p-4 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors duration-300">
            <div className="h-32 w-32 relative flex items-center justify-center">
                <Doughnut 
                    data={chartData} 
                    options={{ 
                        cutout: '80%', 
                        plugins: { 
                            legend: { display: false },
                            tooltip: { 
                                enabled: !isZeroBudget, // Tooltips can be confusing with 0 budget
                            }
                        },
                        maintainAspectRatio: false,
                        // Prevent chart from spinning if data is [0, 0]
                        circumference: 360 
                    }} 
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className={`text-xs font-bold ${
                        isOver 
                            ? 'text-red-500' 
                            : 'text-slate-600 dark:text-slate-400'
                    }`}>
                        {/* Safeguard against NaN display */}
                        {percentage}%
                    </span>
                </div>
            </div>
            
            <h3 className="mt-2 font-semibold text-slate-700 dark:text-slate-200">
                {data.category}
            </h3>
            
            <p className={`text-xs font-medium ${
                isOver 
                    ? 'text-red-500 dark:text-red-400' 
                    : 'text-slate-500 dark:text-slate-400'
            }`}>
                {/* Better labelling for 0 budget categories */}
                {isOver 
                    ? `$${formatCurrency(absDiff)} over budget` 
                    : `$${formatCurrency(absDiff)} remaining`
                }
            </p>
        </div>
    );
}