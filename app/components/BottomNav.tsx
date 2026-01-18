"use client";

import React from 'react';
import { Section } from '../../lib/types';
import { ICONS } from '../../lib/constants';
import { usePathname } from 'next/navigation';

interface BottomNavProps {
    // These props are no longer used for local state but kept to match your interface
    activeSection?: Section;
    onSectionSelect?: (section: Section) => void;
}

export default function BottomNav({ activeSection, onSectionSelect }: BottomNavProps) {
    const tabs = [
        { id: Section.EXPENSES, label: 'Expenses', icon: ICONS.Expenses, href: '/expenses' },
        { id: Section.BUDGET, label: 'Budget', icon: ICONS.Budget, href: '/budget' },
        { id: Section.SETTINGS, label: 'Upload', icon: ICONS.Upload, href: '/upload' }
    ];

    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 lg:sticky lg:top-auto z-30 transition-colors duration-300">
            <div className="max-w-screen-xl mx-auto px-4">
                <div className="flex justify-around items-center h-16">
                    {tabs.map((tab) => {
                        const isActive = pathname == tab.href;

                        return (
                            <button
                                key={tab.id}
                                onClick={() => {
                                    window.location.href = tab.href;
                                }}
                                className={`
                                    relative flex flex-col items-center justify-center space-y-1 w-full h-full transition-colors duration-200
                                    ${isActive 
                                        ? 'text-indigo-600 dark:text-indigo-400' 
                                        : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}
                                `}
                            >
                                {tab.icon(`w-6 h-6 ${
                                    isActive 
                                        ? 'stroke-indigo-600 dark:stroke-indigo-400' 
                                        : 'stroke-slate-400 dark:stroke-slate-500'
                                }`)}
                                
                                <span className="text-[10px] font-semibold uppercase tracking-wide">
                                    {tab.label}
                                </span>

                                {isActive && (
                                    <div className="absolute top-0 w-8 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.6)]"></div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}