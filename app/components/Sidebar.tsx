
import React from 'react';
import { Month } from '../../types';
import { MONTHS } from '../../constants';

interface SidebarProps {
  activeMonth: Month;
  onMonthSelect: (month: Month) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ activeMonth, onMonthSelect, isOpen, onClose }: SidebarProps) {
  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Navigation
            </h2>
          </div>

          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {MONTHS.map((month) => (
              <button
                key={month}
                onClick={() => onMonthSelect(month)}
                className={`
                  w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                  ${activeMonth === month 
                    ? 'bg-slate-100 text-slate-900 shadow-sm border border-slate-200' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}
                `}
              >
                {month}
              </button>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
}
