"use client";


import React, { useState } from 'react';
import { Section } from '../../lib/types';
import BottomNav from '../components/BottomNav';
import CategoryCreator from '../components/CategoryCreator';

export default function Budget() {
    const [activeSection, setActiveSection] = useState<Section>(Section.EXPENSES);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => setIsSidebarOpen(prev => !prev);

    return (
        /* Main wrapper: Deep dark background */
        <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 relative transition-colors duration-300">

            <div className="flex-1 flex flex-col min-w-0">
                {/* Mobile Header: Elevated dark surface with subtle border */}
                <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                    <button
                        onClick={toggleSidebar}
                        className="p-2 -ml-2 rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <div className="w-10"></div>
                </header>

                <div className='flex-1 overflow-y-auto pb-24'>
                    <CategoryCreator />
                </div>

                <BottomNav
                    activeSection={activeSection}
                    onSectionSelect={setActiveSection}
                />
            </div>
        </div>
    );
}
