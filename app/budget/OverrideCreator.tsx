import { useState } from "react";

interface OverrideCreatorProps {
    availableCategories: string[]; // Categories that don't have an override yet
    onSaveOverride: (category: string, amount: number) => Promise<void>;
    isLoading?: boolean;
}

export default function OverrideCreator({ 
    availableCategories, 
    onSaveOverride, 
    isLoading = false 
}: OverrideCreatorProps) {
    const [selectedCategory, setSelectedCategory] = useState<string>("");
    const [budgetAmount, setBudgetAmount] = useState<string>("");
    const [error, setError] = useState<string>("");

    const handleSubmit = async (e?: React.FormEvent | React.KeyboardEvent) => {
        if (e) e.preventDefault();
        
        if (!selectedCategory) {
            setError("Please select a category.");
            return;
        }
        
        const amount = parseFloat(budgetAmount);
        if (isNaN(amount) || amount < 0) {
            setError("Please enter a valid amount.");
            return;
        }

        try {
            await onSaveOverride(selectedCategory, amount);
            // Reset form on success
            setSelectedCategory("");
            setBudgetAmount("");
            setError("");
        } catch (err) {
            setError("Failed to save override. Try again.");
        }
    };

    return (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 mb-8 transition-all">
            <div className="flex flex-col md:flex-row gap-3">
                {/* Category Dropdown */}
                <div className="relative flex-1">
                    <span className="absolute inset-y-0 left-3 flex items-center text-slate-400 z-10">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                    </span>
                    <select
                        className="select select-bordered w-full pl-10 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-primary/50 transition-all font-normal"
                        value={selectedCategory}
                        onChange={(e) => {
                            setSelectedCategory(e.target.value);
                            if (error) setError("");
                        }}
                        disabled={isLoading || availableCategories.length === 0}
                    >
                        <option value="" disabled>Select category to override...</option>
                        {availableCategories.map((cat) => (
                            <option key={cat} value={cat}>
                                {cat}
                            </option>
                        ))}
                        {availableCategories.length === 0 && (
                            <option disabled>All categories have overrides</option>
                        )}
                    </select>
                </div>

                {/* Amount Input and Submit Button */}
                <div className="join w-full md:w-auto">
                    <span className="join-item btn btn-active bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 pointer-events-none text-slate-500">
                        $
                    </span>
                    <input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="input input-bordered join-item w-full md:w-32 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-primary/50"
                        value={budgetAmount}
                        onChange={(e) => {
                            setBudgetAmount(e.target.value);
                            if (error) setError("");
                        }}
                        disabled={isLoading}
                        onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
                    />
                    <button
                        className={`btn btn-primary join-item px-6 shadow-lg shadow-primary/20 ${isLoading ? 'loading' : ''}`}
                        onClick={handleSubmit}
                        disabled={isLoading || !selectedCategory}
                    >
                        {isLoading ? '' : 'Apply Override'}
                    </button>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mt-3 flex items-center gap-2 text-error text-xs font-medium animate-in fade-in slide-in-from-top-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                </div>
            )}
        </div>
    );
}