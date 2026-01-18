"use client";

import { useState, useEffect, useCallback, Activity } from 'react';
import OverrideCreator from './OverrideCreator';

interface Category {
    name: string;
    budget: number;
    is_override?: boolean;
}

interface BackendCategory {
    category: string;
    budget: number;
    is_override?: boolean;
}

export default function CategoryCreator({ editScope, monthString }: { editScope: "global" | "monthly", monthString: string }) {
    const [catName, setCatName] = useState("");
    const [budgetAmount, setBudgetAmount] = useState("");
    const [categories, setCategories] = useState<Category[]>([]);
    const [error, setError] = useState<string>(""); // This was likely outside!
    const [isLoading, setIsLoading] = useState(false);


    const [totalBudget, settotaBudget] = useState(0);


    // Stores the name of the category currently being edited (null if none)
    const [editingName, setEditingName] = useState<string | null>(null);

    // Temporary storage for the edits before they are saved
    const [tempName, setTempName] = useState("");
    const [tempBudget, setTempBudget] = useState("");


    useEffect(() => {

        settotaBudget(
            categories.reduce((sum, cat) => sum + cat.budget, 0)
        );

    }, [categories]);


    const fetchCategories = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/budgetcategory/fetch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user: "hackathon",
                    month: editScope == "monthly" ? monthString : undefined
                })
            });

            if (response.ok) {
                const data = await response.json();

                // This maps 'category' (database) to 'name' (your UI)
                const formattedData = data.map((item: BackendCategory) => ({
                    name: item.category,
                    budget: item.budget,
                    is_override: !!item.is_override
                }));

                setCategories(formattedData);
            }
        } catch (err) {
            console.error("Sync error:", err);
            setError("Failed to sync categories.");
        } finally {
            setIsLoading(false);
        }
    }, [editScope, monthString]);


    // --- NEW: LIFECYCLE HOOK ---
    useEffect(() => {
        fetchCategories();
    }, [editScope, monthString]);

    const handleAddCategory = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        setError("");

        if (!catName.trim()) {
            setError("Category name cannot be blank.");
            return;
        }

        if (catName.length > 29) {
            setError("Category name cannot be too long.");
            return;
        }

        // 2. Check for negative or zero budget
        const amount = parseFloat(budgetAmount);
        if (isNaN(amount) || amount <= 0) {
            setError("Budget must be a positive number.");
            return;
        }

        setError(""); // Clear errors if validation passes
        setIsLoading(true);

        try {
            const response = await fetch('/api/budgetcategory/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // Sending both name and amount
                body: JSON.stringify({
                    category: catName.trim(),
                    budget: parseFloat(budgetAmount)
                }),
            });

            const result: string = await response.text();

            if (result === "ok") {
                // Create the new object and prepend to list
                const newEntry: Category = { name: catName, budget: parseFloat(budgetAmount) };
                setCategories([newEntry, ...categories]);

                // Reset both inputs
                setCatName("");
                setBudgetAmount("");
            } else if (result === "duplicate") {
                setError("Category already exists!");
            } else {
                setError("Error saving to server.");
            }
        } catch (_err: unknown) {
            setError("Server connection failed.");
        } finally {
            setIsLoading(false);
        }
    };


    const handleUpdate = async (oldCategoryName: string) => {
        const amount = parseFloat(tempBudget);
        setError("");

        if (!tempName.trim()) {
            setError("Category name cannot be empty.");
            return;
        }

        if (tempName.length > 29) {
            setError("Category name cannot be too long.");
            return;
        }

        if (isNaN(amount) || amount < 0) {
            setError("Budget cannot be negative.");
            return;
        }

        const finalName = oldCategoryName.toLowerCase() === 'other'
            ? oldCategoryName
            : tempName.trim();

        setIsLoading(true);

        // 🧠 Determine which "door" to knock on based on our scope
        const apiUrl = editScope === 'monthly' 
            ? '/api/budgetcategory/update_month' 
            : '/api/budgetcategory/update';

        const payload = editScope === 'monthly'
            ? { user: "hackathon", category: oldCategoryName, newBudget: amount, month: `${monthString}-01` }
            : { user: "hackathon", oldCategory: oldCategoryName, newCategory: finalName, newBudget: amount };

        try {
            const response = await fetch(apiUrl, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                // Refresh data from server to ensure UI matches DB exactly
                await fetchCategories();
                setEditingName(null);
            } else {
                setError("Failed to update.");
            }
        } catch (err) {
            setError("Connection error.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (categoryToDelete: string) => {
        if (categoryToDelete.toLowerCase() === 'other') {
            setError("The 'Other' category is required and cannot be deleted.");
            return;
        }

        // Logic Check: Are we deleting the whole category or just a monthly override?
        const isMonthly = editScope === 'monthly';
        const confirmMsg = isMonthly
            ? `Reset "${categoryToDelete}" to global template value for this month?`
            : `Permanently delete "${categoryToDelete}"? This will move all existing transactions to other categories.`;

        if (!window.confirm(confirmMsg)) return;

        setIsLoading(true);
        try {
            const apiUrl = isMonthly 
                ? '/api/budgetcategory/delete_override' 
                : '/api/budgetcategory/delete';

            const payload = isMonthly
                ? { user: "hackathon", category: categoryToDelete, month: `${monthString}-01` }
                : { user: "hackathon", category: categoryToDelete };

            const response = await fetch(apiUrl, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                await fetchCategories();
            } else {
                setError("Failed to delete.");
            }
        } catch (err) {
            setError("Server error.");
        } finally {
            setIsLoading(false);
        }
    };

    const categoriesForDropdown = editScope === "monthly" 
        ? categories.filter(c => !c.is_override).map(c => c.name)
        : [];

    // In monthly mode, the list only shows categories that HAVE been overridden.
    // In global mode, show everything.
    const categoriesForList = editScope === "monthly"
        ? categories.filter(c => c.is_override)
        : categories;


    return (
        <div className="p-6 w-full max-w-4xl mx-auto">
            <div className="mb-10 text-center">
                <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">
                    Budget Planner
                </h2>
                <p className="text-slate-500 dark:text-slate-400 mt-2">
                    Define your monthly limits to stay on track.
                </p>
            </div>

            {/* --- CREATION CARD --- */}
            <Activity mode={editScope == "global" ? "visible" : "hidden"}>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 mb-8 transition-all">
                    <div className="flex flex-col md:flex-row gap-3">
                        <div className="relative flex-1">
                            <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                </svg>
                            </span>
                            <input
                                type="text"
                                placeholder="Category Name (e.g., Dining)"
                                className="input input-bordered w-full bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-primary/50 transition-all"
                                value={catName}
                                onChange={(e) => {
                                    setCatName(e.target.value);
                                    if (error) setError("");
                                }}
                                disabled={isLoading}
                            />
                        </div>

                        <div className="join w-full md:w-auto">
                            <span className="join-item btn btn-active bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 pointer-events-none text-slate-500">
                                $
                            </span>
                            <input
                                type="number"
                                placeholder="0.00"
                                className="input input-bordered join-item w-full md:w-32 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-primary/50"
                                value={budgetAmount}
                                onChange={(e) => {
                                    setBudgetAmount(e.target.value);
                                    if (error) setError("");
                                }}
                                disabled={isLoading}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddCategory(e)}
                            />
                            <button
                                className={`btn btn-primary join-item px-6 shadow-lg shadow-primary/20 ${isLoading ? 'loading' : ''}`}
                                onClick={handleAddCategory}
                                disabled={isLoading}
                            >
                                {isLoading ? '' : 'Add'}
                            </button>
                        </div>
                    </div>
                    {error && (
                        <div className="mt-3 flex items-center gap-2 text-error text-xs font-medium animate-in fade-in slide-in-from-top-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {error}
                        </div>
                    )}
                </div>
            </Activity>

            {/* --- OVERRIDE CREATION CARD --- */}
            <Activity mode={editScope == "global" ? "hidden" : "visible"}>
                <OverrideCreator
                    availableCategories={categoriesForDropdown}
                    onSaveOverride={async (category: string, amount: number) => {
                        const payload = {
                            user: "hackathon",
                            category: category,
                            newBudget: amount,
                            month: `${monthString}-01`
                        };

                        const response = await fetch("/api/budgetcategory/update_month", {
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify(payload),
                        });

                        if (!response.ok) {
                            // This will be caught by the try/catch in OverrideCreator
                            throw new Error("Failed to save budget override");
                        }
                        else{
                            fetchCategories();
                        }
                    }}
                    isLoading={isLoading}
                />
            </Activity>
            

            {error && <div className="text-error text-sm mb-4">{error}</div>}

            {/* Modern List Display */}
            <div className="grid grid-cols-1 gap-3">
                <div className="grid grid-cols-1 gap-3">
                    <div className="grid grid-cols-1 gap-3">
                        {isLoading && categoriesForList.length === 0 ? (
                            /* 1. Loading State: Show a spinner */
                            <div className="flex justify-center p-10">
                                <span className="loading loading-dots loading-lg text-primary"></span>
                            </div>
                        ) : categoriesForList.length === 0 ? (
                            /* 2. Empty State: Show a message */
                            <div className="text-center p-10 bg-base-200 rounded-lg text-sm opacity-60">
                                No categories found. Add your first budget limit above.
                            </div>
                        ) : (
                            /* 3. Real Data: Show the list */
                            categoriesForList.map((cat, index) => (
                                <div key={index} className="p-4 bg-base-100 rounded-lg group hover:bg-base-300 transition-all mb-3">
                                    {/* CHECK: Are we currently editing this specific category? */}
                                    {editingName === cat.name ? (
                                        /* --- EDIT MODE --- */
                                        <div className="flex flex-col md:flex-row gap-3 items-center">

                                            {/* NAME INPUT: Disabled if it's 'Other' */}
                                            <div className="flex-1 w-full">
                                                <input
                                                    className={`input input-bordered input-sm w-full ${cat.name.toLowerCase() === 'other' || editScope == 'monthly' ? 'bg-base-300 cursor-not-allowed opacity-70' : ''}`}
                                                    value={tempName}
                                                    onChange={(e) => {
                                                        setTempName(e.target.value);
                                                        if (error) setError(""); //  Clear error during editing
                                                    }}
                                                    disabled={cat.name.toLowerCase() === 'other' || editScope == 'monthly'} //  The Lock
                                                    title={cat.name.toLowerCase() === 'other' ? "System category names cannot be changed" : ""}
                                                />
                                                {cat.name.toLowerCase() === 'other' && (
                                                    <span className="text-[10px] text-info ml-1 italic">Name is system-reserved</span>
                                                )}
                                            </div>

                                            {/* BUDGET INPUT: Always enabled */}
                                            <div className="join">
                                                <span className="join-item btn btn-sm btn-active pointer-events-none">$</span>
                                                <input
                                                    type="number"
                                                    className="input input-bordered input-sm join-item w-24"
                                                    value={tempBudget}
                                                    onChange={(e) => {
                                                        setTempBudget(e.target.value);
                                                        if (error) setError(""); // ✨ Clear error during editing
                                                    }}
                                                    autoFocus={cat.name.toLowerCase() === 'other'} // Focus budget if name is locked
                                                />
                                            </div>

                                            <div className="flex gap-2">
                                                <button className="btn btn-success btn-sm" onClick={() => handleUpdate(cat.name)}>Save</button>
                                                <button className="btn btn-ghost btn-sm" onClick={() => setEditingName(null)}>Cancel</button>
                                            </div>
                                        </div>
                                    ) : (
                                        /* --- VIEW MODE --- */

                                        <div className="flex flex-col md:flex-row gap-3 items-center justify-between w-full pl-3">
                                            <div className="flex items-center gap-4 w-full">


                                                <div className="flex-1">
                                                    <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">
                                                        {cat.name}
                                                    </h3>
                                                    <p className="text-sm font-medium text-slate-400 dark:text-slate-500 ">
                                                        ${cat.budget.toLocaleString(undefined, { minimumFractionDigits: 2 })} <span className="font-normal">limit</span>
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex gap-2 w-full md:w-auto items-center">
                                                <button
                                                    className="btn btn-ghost btn-sm hover:bg-primary/10 hover:text-primary transition-colors font-semibold"
                                                    onClick={() => {
                                                        setEditingName(cat.name);
                                                        setTempName(cat.name);
                                                        setTempBudget(cat.budget.toString());
                                                    }}
                                                >
                                                    Edit
                                                </button>

                                                {cat.name.toLowerCase() !== 'other' ? (
                                                    <button
                                                        className="btn btn-ghost btn-sm text-slate-400 hover:text-error hover:bg-error/10 transition-colors"
                                                        onClick={() => handleDelete(cat.name)}
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                ) : (
                                                    <span className="badge badge-outline badge-sm opacity-30 uppercase text-[9px] font-bold tracking-widest px-2">System</span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    {/* --- TOTAL BUDGET SUMMARY --- */}
                    {categories.length > 0 && editScope == "global" && (
                        <div className="mt-10 p-1 bg-gradient-to-r from-primary/20 via-indigo-500/20 to-purple-500/20 rounded-2xl">
                            <div className="bg-white dark:bg-slate-900 rounded-[calc(1rem-1px)] p-6 flex justify-between items-center shadow-inner transition-all">
                                <div>
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Total Allocated</span>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Your total planned spending for this month</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-500">
                                        ${totalBudget.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );



}


