import { MONTHS } from '../../lib/constants';

interface SidebarProps {
    activeMonth: number;
    onMonthSelect: (month: number) => void;
    isOpen: boolean;
    onClose: () => void;
    // New Props
    activeYear: number;
    setActiveYear: (year: number) => void;
}

export default function Sidebar({ 
    activeMonth, 
    onMonthSelect, 
    isOpen, 
    onClose,
    activeYear,
    setActiveYear 
}: SidebarProps) {
    
    // Generate a small range of years for the dropdown (e.g., 2024 to 2026)
    const years = [2024, 2025, 2026];

    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 dark:bg-slate-950/70 z-40 lg:hidden transition-opacity"
                    onClick={onClose}
                />
            )}

            <aside className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="h-full flex flex-col">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 space-y-4">
                        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                            Navigation
                        </h2>

                        {/* DaisyUI Year Dropdown */}
                        <div className="dropdown w-full">
                            <div 
                                tabIndex={0} 
                                role="button" 
                                className="btn btn-sm btn-outline w-full justify-between border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600"
                            >
                                Year: {activeYear}
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                            </div>
                            {/* Dropdown Menu */}
                            <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 dark:bg-slate-800 text-base-content dark:text-slate-200 rounded-box w-full border border-slate-100 dark:border-slate-700 mt-1">
                                {years.map((year) => (
                                    <li key={year}>
                                        <button 
                                            className={`${activeYear === year ? "active bg-indigo-600 text-white" : "hover:bg-slate-100 dark:hover:bg-slate-700"}`}
                                            onClick={() => {
                                                setActiveYear(year);
                                                if (document.activeElement instanceof HTMLElement) {
                                                    document.activeElement.blur();
                                                }
                                            }}
                                        >
                                            {year}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                        {MONTHS.map((month, index) => (
                            <button
                                key={month}
                                onClick={() => onMonthSelect(index)}
                                className={`
                                    w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                                    ${activeMonth === index
                                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-slate-700'
                                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200'}
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