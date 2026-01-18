"use client";


import { useEffect, useState } from 'react';
import { Section, Month } from '../../lib/types';
import { MONTHS, YEAR } from '../../lib/constants';
import Sidebar from '../components/Sidebar';
import BottomNav from '../components/BottomNav';
import { TransactionTable } from './TransactionTable';

export default function Expenses() {
    const [activeSection, setActiveSection] = useState<Section>(Section.EXPENSES);
    const [activeMonth, setActiveMonth] = useState<number>(new Date().getMonth());
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [transactions, setTransactions] = useState([]);

    const toggleSidebar = () => setIsSidebarOpen(prev => !prev);

    useEffect(() => {
        fetch("/api/transactions", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user: "hackathon",
                month: `${YEAR}-${(activeMonth+1).toString().padStart(2, "0")}`
            })
        }).then(res => {
            res.json().then(json => {
                setTransactions(json);
            })
        });
    }, [activeMonth]);

    return (
        <div className="flex h-screen w-full bg-slate-50 overflow-hidden relative">
            <Sidebar
                activeMonth={activeMonth}
                onMonthSelect={(month) => {
                    setActiveMonth(month);
                    setIsSidebarOpen(false);
                }}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            <div className="flex-1 flex flex-col min-w-0">
                <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200">
                    <button
                        onClick={toggleSidebar}
                        className="p-2 -ml-2 rounded-md text-slate-500 hover:bg-slate-100"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <div className="w-10"></div>
                </header>

                <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
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
