"use client";

import { useState, useEffect } from 'react';

interface Category {
    name: string;
    budget: number;
}

interface BackendCategory {
    category: string;
    budget: number;
}

export default function CategoryCreator() {
    const [catName, setCatName] = useState("");
    const [budgetAmount, setBudgetAmount] = useState("");
    const [categories, setCategories] = useState<Category[]>([]);
    const [error, setError] = useState<string>(""); // This was likely outside!
    const [isLoading, setIsLoading] = useState(false);

    // Stores the name of the category currently being edited (null if none)
    const [editingName, setEditingName] = useState<string | null>(null);

    // Temporary storage for the edits before they are saved
    const [tempName, setTempName] = useState("");
    const [tempBudget, setTempBudget] = useState("");

    const fetchCategories = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/budgetcategory/fetch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user: "hackathon" }),
            });

            if (response.ok) {
                const data = await response.json();

                // This maps 'category' (database) to 'name' (your UI)
                const formattedData = data.map((item: BackendCategory) => ({
                    name: item.category,
                    budget: item.budget
                }));

                console.log(formattedData);

                setCategories(formattedData);
            }
        } catch (err) {
            console.error("Sync error:", err);
            setError("Failed to sync categories.");
        } finally {
            setIsLoading(false);
        }
    };


    // --- NEW: LIFECYCLE HOOK ---
    useEffect(() => {
        fetchCategories();
    }, []);

    const handleAddCategory = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!catName.trim() || !budgetAmount) return;

        setError("");
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
        if (!tempName.trim() || !tempBudget) return;

        setIsLoading(true);
        try {
            const response = await fetch('/api/budgetcategory/update', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user: "hackathon",
                    oldCategory: oldCategoryName,
                    newCategory: tempName.trim(),
                    newBudget: parseFloat(tempBudget)
                }),
            });

            if (response.ok) {
                // Update the local list so the UI reflects the change immediately
                setCategories(prev => prev.map(cat =>
                    cat.name === oldCategoryName
                        ? { name: tempName.trim(), budget: parseFloat(tempBudget) }
                        : cat
                ));
                setEditingName(null); // Exit edit mode
            } else {
                setError("Failed to update category.");
            }
        } catch (err) {
            setError("Error connecting to update service.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (categoryToDelete: string) => {
        // 1. Hard Safeguard
        if (categoryToDelete.toLowerCase() === 'other') {
            setError("The 'Other' category is required and cannot be deleted.");
            return;
        }

        // 2. Confirmation Dialog (Browser native is fastest for hackathons)
        if (!window.confirm(`Are you sure you want to delete "${categoryToDelete}"? Transactions will be moved to relevant categories.`)) {
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('/api/budgetcategory/delete', {
                method: 'DELETE', // or DELETE, depending on your teammate's route
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user: "hackathon",
                    category: categoryToDelete
                }),
            });

            if (response.ok) {
                // 3. Update Local State: Remove the deleted item from the list
                setCategories(prev => prev.filter(cat => cat.name !== categoryToDelete));

                // OPTIONAL: Re-fetch all categories to see the new totals/allocations
                // await fetchCategories(); 
            } else {
                setError("Failed to delete category.");
            }
        } catch (err) {
            setError("Server error during deletion.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-2xl bg-base-100 rounded-xl shadow-md">
            <h2 className="text-2xl font-bold mb-6">Create Budget Categories</h2>

            {/* Input Group: Stacked on mobile, joined on desktop */}
            <div className="flex flex-col md:flex-row gap-2 mb-4">
                <input
                    type="text"
                    placeholder="Category (e.g. Dining)"
                    className="input input-bordered w-full md:flex-1"
                    value={catName}
                    onChange={(e) => setCatName(e.target.value)}
                    disabled={isLoading}
                />
                <div className="join w-full md:w-auto">
                    <span className="join-item btn btn-active pointer-events-none">$</span>
                    <input
                        type="number"
                        placeholder="Amount"
                        className="input input-bordered join-item w-full md:w-32"
                        value={budgetAmount}
                        onChange={(e) => setBudgetAmount(e.target.value)}
                        disabled={isLoading}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddCategory(e)}
                    />
                    <button
                        className={`btn btn-primary join-item ${isLoading ? 'loading' : ''}`}
                        onClick={handleAddCategory}
                        disabled={isLoading}
                    >
                        Add
                    </button>
                </div>
            </div>

            {error && <div className="text-error text-sm mb-4">{error}</div>}

            {/* Modern List Display */}
            <div className="grid grid-cols-1 gap-3">
                <div className="grid grid-cols-1 gap-3">
                    <div className="grid grid-cols-1 gap-3">
                        {isLoading && categories.length === 0 ? (
                            /* 1. Loading State: Show a spinner */
                            <div className="flex justify-center p-10">
                                <span className="loading loading-dots loading-lg text-primary"></span>
                            </div>
                        ) : categories.length === 0 ? (
                            /* 2. Empty State: Show a message */
                            <div className="text-center p-10 bg-base-200 rounded-lg text-sm opacity-60">
                                No categories found. Add your first budget limit above.
                            </div>
                        ) : (
                            /* 3. Real Data: Show the list */
                            categories.map((cat, index) => (
                                <div key={index} className="p-4 bg-base-200 rounded-lg group hover:bg-base-300 transition-all mb-3">
                                    {/* CHECK: Are we currently editing this specific category? */}
                                    {editingName === cat.name ? (
                                        /* --- 1. EDIT MODE: Show Input Fields --- */
                                        <div className="flex flex-col md:flex-row gap-3 items-center">
                                            <input
                                                className="input input-bordered input-sm flex-1"
                                                value={tempName}
                                                onChange={(e) => setTempName(e.target.value)}
                                                autoFocus
                                            />
                                            <div className="join">
                                                <span className="join-item btn btn-sm btn-active pointer-events-none">$</span>
                                                <input
                                                    type="number"
                                                    className="input input-bordered input-sm join-item w-24"
                                                    value={tempBudget}
                                                    onChange={(e) => setTempBudget(e.target.value)}
                                                />
                                            </div>
                                            <div className="flex gap-2">
                                                <button className="btn btn-success btn-sm" onClick={() => handleUpdate(cat.name)}>Save</button>
                                                <button className="btn btn-ghost btn-sm" onClick={() => setEditingName(null)}>Cancel</button>
                                            </div>
                                        </div>
                                    ) : (
                                        /* --- 2. VIEW MODE: Show Normal Text (Your Original Code + Edit Button) --- */
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <span className="font-bold text-lg">{cat?.name || "Unnamed Category"}</span>
                                                <div className="text-xs opacity-50">Limit: ${cat?.budget || 0}</div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {/* Edit Button: Visible on hover */}
                                                <button
                                                    className="btn btn-ghost btn-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => {
                                                        setEditingName(cat.name);
                                                        setTempName(cat.name);
                                                        setTempBudget(cat.budget.toString());
                                                    }}
                                                >
                                                    Edit
                                                </button>

                                                {/* Delete Logic: Only show if it's NOT 'Other' */}
                                                {(cat?.name?.toLowerCase() !== 'other') ? (
                                                    <button
                                                        className="btn btn-ghost btn-sm text-error opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={() => handleDelete(cat.name)}
                                                        disabled={isLoading}
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                ) : (
                                                    <div className="badge badge-ghost text-xs">System</div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}


