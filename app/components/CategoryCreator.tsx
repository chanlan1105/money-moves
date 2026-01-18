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

        setError("");

        if (!catName.trim()) {
            setError("Category name cannot be blank.");
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
        // 1. Validate Name (unless it's 'Other')
        if (!tempName.trim()) {
            setError("Category name cannot be empty.");
            return;
        }

        // 2. Validate Budget
        if (isNaN(amount) || amount < 0) {
            setError("Budget cannot be negative.");
            return;
        }

        // THE SAFEGUARD: 
        // If we are updating 'Other', the newCategory name MUST remain 'Other'.
        // Otherwise, use the tempName the user typed.
        const finalName = oldCategoryName.toLowerCase() === 'other'
            ? oldCategoryName
            : tempName.trim();

        setIsLoading(true);
        try {
            const response = await fetch('/api/budgetcategory/update', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user: "hackathon",
                    oldCategory: oldCategoryName,
                    newCategory: finalName, // We use the protected name here!
                    newBudget: parseFloat(tempBudget)
                }),
            });

            if (response.ok) {
                // Update local state with the same safe name
                setCategories(prev => prev.map(cat =>
                    cat.name === oldCategoryName
                        ? { name: finalName, budget: parseFloat(tempBudget) }
                        : cat
                ));
                setEditingName(null);
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
                    onChange={(e) => {
                        setCatName(e.target.value);
                        if (error) setError(""); // Clear error as they type
                    }}
                    disabled={isLoading}
                />
                <div className="join w-full md:w-auto">
                    <span className="join-item btn btn-active pointer-events-none">$</span>
                    <input
                        type="number"
                        placeholder="Amount"
                        className="input input-bordered join-item w-full md:w-32"
                        value={budgetAmount}
                        onChange={(e) => {
                            setBudgetAmount(e.target.value);
                            if (error) setError(""); // Clear error as they type
                        }}
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
                                        /* --- EDIT MODE --- */
                                        <div className="flex flex-col md:flex-row gap-3 items-center">

                                            {/* NAME INPUT: Disabled if it's 'Other' */}
                                            <div className="flex-1 w-full">
                                                <input
                                                    className={`input input-bordered input-sm w-full ${cat.name.toLowerCase() === 'other' ? 'bg-base-300 cursor-not-allowed opacity-70' : ''}`}
                                                    value={tempName}
                                                    onChange={(e) => {
                                                        setTempName(e.target.value);
                                                        if (error) setError(""); // ✨ Clear error during editing
                                                    }}
                                                    disabled={cat.name.toLowerCase() === 'other'} // 🔒 The Lock
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
                                        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
                                            <div className="flex-1">
                                                <h3 className="font-semibold">{cat.name}</h3>
                                                <p className="text-sm text-base-content/60">${cat.budget.toFixed(2)}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button className="btn btn-ghost btn-sm" onClick={() => {
                                                    setEditingName(cat.name);
                                                    setTempName(cat.name);
                                                    setTempBudget(cat.budget.toString());
                                                }}>Edit</button>

                                                {/* Only show Delete if it's NOT 'other' */}
                                                {cat.name.toLowerCase() !== 'other' ? (
                                                    <button className="btn btn-error btn-sm" onClick={() => handleDelete(cat.name)}>Delete</button>
                                                ) : (
                                                    <div className="badge badge-ghost text-[10px] opacity-50 uppercase tracking-widest">System</div>
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


