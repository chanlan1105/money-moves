"use client";


import { useEffect, useState } from 'react';
import { Section, Month } from '../../lib/types';
import { MONTHS, YEAR } from '../../lib/constants';
import Sidebar from '../components/Sidebar';
import BottomNav from '../components/BottomNav';
import { TransactionTable } from './TransactionTable';
import BudgetDoughnut from './BudgetDoughnut';

import CategoryCreator from "../budget/CategoryCreator"; // Adjusted path
import CSVUpload from "../components/CSVUpload";           // Adjusted path
import Dock from "../components/Dock";                     // Adjusted path

export default function Expenses() {
    const [activeSection, setActiveSection] = useState<Section>(Section.EXPENSES);
    const [activeMonth, setActiveMonth] = useState<number>(new Date().getMonth());
    const [activeYear, setActiveYear] = useState<number>(new Date().getFullYear());
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [transactions, setTransactions] = useState([]);
    const [budgets, setBudgets] = useState([]);

    const toggleSidebar = () => setIsSidebarOpen(prev => !prev);

    // Fetch transactions for given month
    useEffect(() => {
        fetch("/api/transactions", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user: "hackathon",
                year: `${activeYear}`,
                month: `${(activeMonth+1).toString().padStart(2, "0")}`
            })
        }).then(res => {
            res.json().then(json => {
                setTransactions(json);
            })
        });
    }, [activeMonth, activeYear]);

    // Fetch budget amounts
    useEffect(() => {
        fetch("/api/budgetcategory/fetch", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user: "hackathon",
                month: `${activeYear}-${(activeMonth+1).toString().padStart(2, "0")}-01`
            })
        }).then(res => {
            res.json().then(json => {
                setBudgets(json);
            });
        });
    }, [activeMonth, activeYear]);

    // Define the interface for your chart data
    interface BudgetCategoryData {
        category: string;
        budget: number;
        actual: number;
        color: string;
        remaining: number;
    }

    // Derive categoryData from transactions and budgets
    const categoryData: BudgetCategoryData[] = budgets.map((b: any) => {
        // Sum transactions for this specific category
        const actual = transactions
            .filter((t: any) => t.category === b.category)
            .reduce((sum, t: any) => sum + parseFloat(t.amount), 0);

        const isOver = actual > b.budget;

        return {
            category: b.category,
            budget: b.budget,
            actual: actual,
            color: isOver ? '#ef4444' : '#22c55e',
            remaining: Math.max(0, b.budget - actual)
        };
    })
    .sort((a, b) => {
        const getPercentage = (item: any) => {
            if (item.budget === 0) {
                // If budget is 0 and we've spent money, treat it as 1000% (High priority)
                // If budget is 0 and spent is 0, treat it as 0% (Low priority)
                return item.actual > 0 ? 10 : 0; 
            }
            return item.actual / item.budget;
        };

        const pctA = getPercentage(a);
        const pctB = getPercentage(b);
        
        // Sort descending: highest percentage (most over budget) first
        return pctB - pctA;
    });

    return (
        /* Added dark:bg-slate-950 */
        <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 overflow-hidden relative transition-colors duration-300">
            <Sidebar
                activeMonth={activeMonth}
                onMonthSelect={(month) => {
                    setActiveMonth(month);
                    setIsSidebarOpen(false);
                }}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                activeYear={activeYear}
                setActiveYear={setActiveYear}
            />

            <div className="flex-1 flex flex-col min-w-0">
                {/* Mobile Header: Added dark:bg-slate-900 and dark:border-slate-800 */}
                <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                    <button
                        onClick={toggleSidebar}
                        className="p-2 -ml-2 rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <div className="flex-1 px-3 text-center text-xl font-semibold text-slate-800 dark:text-slate-100">
                        {MONTHS[activeMonth]} {activeYear}
                    </div>
                </header>

                {/* Desktop Header: Added dark:bg-slate-900 and dark:border-slate-800 */}
                <header className="hidden lg:flex items-center px-8 py-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                    <h1 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">
                        {MONTHS[activeMonth]} {activeYear}
                    </h1>
                </header>

                <main className="flex-1 overflow-y-auto pb-20 lg:pb-0 p-4 lg:p-8">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
                        {categoryData.map(data => (
                            <BudgetDoughnut key={data.category} data={data} />
                        ))}
                    </div>

                    <TransactionTable transactions={transactions} />
                </main>

                <BottomNav
                    activeSection={activeSection}
                    onSectionSelect={setActiveSection}
                />
            </div>
        </div>
    );
}
