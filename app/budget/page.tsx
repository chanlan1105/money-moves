"use client";


import React, { Activity, useState } from 'react';
import { Section } from '../../lib/types';
import BottomNav from '../components/BottomNav';
import CategoryCreator from './CategoryCreator';
import Sidebar from '../components/Sidebar';
import { MONTHS } from '@/lib/constants';

export default function Budget() {
    const [activeSection, setActiveSection] = useState<Section>(Section.EXPENSES);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeMonth, setActiveMonth] = useState<number>(new Date().getMonth());
    const [activeYear, setActiveYear] = useState<number>(new Date().getFullYear());

    const [editScope, setEditScope] = useState<'global' | 'monthly'>('monthly');

    const toggleSidebar = () => setIsSidebarOpen(prev => !prev);

    return (
        /* Main wrapper: Deep dark background */
        <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 relative transition-colors duration-300">

            <Activity mode={editScope == "monthly" ? "visible" : "hidden"}>
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
            </Activity>

            <div className="flex-1 flex flex-col min-w-0">
                {/* Mobile Header: Elevated dark surface with subtle border */}
                <header className="flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                    <button onClick={toggleSidebar} className="lg:hidden p-2 rounded-md text-slate-500 dark:text-slate-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    
                    {/* Scope Switcher: DaisyUI Tabs */}
                    <div className="tabs tabs-boxed bg-slate-100 dark:bg-slate-800 p-1">
                        <button 
                            className={`tab tab-sm ${editScope === 'global' ? 'tab-active !bg-white dark:!bg-slate-700 shadow-sm' : ''}`}
                            onClick={() => setEditScope('global')}
                        >
                            Global Template
                        </button>
                        <button 
                            className={`tab tab-sm ${editScope === 'monthly' ? 'tab-active !bg-white dark:!bg-slate-700 shadow-sm' : ''}`}
                            onClick={() => setEditScope('monthly')}
                        >
                            {MONTHS[activeMonth]} {activeYear} Overrides
                        </button>
                    </div>
                    <div className="hidden lg:block w-10"></div>
                </header>

                <div className='flex-1 overflow-y-auto pb-24'>
                    <CategoryCreator
                        editScope={editScope}
                        monthString={editScope == "monthly" ? `${activeYear}-${(activeMonth+1).toString().padStart(2, "0")}` : ""}
                    />
                </div>

                <BottomNav
                    activeSection={activeSection}
                    onSectionSelect={setActiveSection}
                />
            </div>
        </div>
    );
}
