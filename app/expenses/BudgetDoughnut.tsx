import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, ChartData } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

// Define the shape of the data passed to each chart
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
    const chartData: ChartData<'doughnut'> = {
        labels: ['Spent', 'Remaining'],
        datasets: [{
            data: [data.actual, data.remaining],
            backgroundColor: [data.color, '#f1f5f9'],
            borderWidth: 0,
        }]
    };

    // Helper for currency formatting: 1000.5 -> "1,000.50"
    const formatCurrency = (val: number) => 
        new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(val);

    const diff = data.budget - data.actual;
    const isOver = diff < 0;
    const absDiff = Math.abs(diff);

    return (
        <div className="flex flex-col items-center p-4 bg-white rounded-xl shadow-sm border border-slate-100">
            <div className="h-32 w-32 relative flex items-center justify-center">
                <Doughnut 
                    data={chartData} 
                    options={{ 
                        cutout: '80%', 
                        plugins: { 
                            legend: { display: false },
                            tooltip: { enabled: true }
                        },
                        maintainAspectRatio: false 
                    }} 
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className={`text-xs font-bold ${isOver ? 'text-red-500' : 'text-slate-600'}`}>
                        {Math.round((data.actual / data.budget) * 100)}%
                    </span>
                </div>
            </div>
            
            <h3 className="mt-2 font-semibold text-slate-700">{data.category}</h3>
            
            {/* Formatted comma-separated values */}
            <p className={`text-xs font-medium ${isOver ? 'text-red-500' : 'text-slate-500'}`}>
                {isOver ? `$${formatCurrency(absDiff)} over budget` : `$${formatCurrency(absDiff)} remaining`}
            </p>
        </div>
    );
}