"use client";

import { useState, useEffect } from 'react';

export default function CategoryCreator() {
  const [catName, setCatName] = useState("");
  const [budgetAmount, setBudgetAmount] = useState("");
  // Now storing objects: { name: string, budget: number }
  const [categories, setCategories] = useState([
    { name: "Groceries", budget: 500 },
    { name: "Rent", budget: 1200 }
  ]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);


  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/budgetcategory/get', { // Assuming a 'get' or 'list' route exists
        method: 'POST', // Your backend specified POST for this
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: "hackathon" }),
      });

      if (response.ok) {
        const data = await response.json();
        // The backend returns [{category, budget}, ...]
        // We map it to our state format {name, budget}
        const formattedData = data.map((item: { category: string; budget: number }) => ({
          name: item.category,
          budget: item.budget
        }));
        setCategories(formattedData);
      }
    } catch (err) {
      console.error("Failed to load categories:", err);
    } finally {
      setIsLoading(false);
    }
  };


  // --- NEW: LIFECYCLE HOOK ---
  useEffect(() => {
    fetchCategories();
  }, []);


interface Category {
    name: string;
    budget: number;
}

const handleAddCategory = async (e: React.FormEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLInputElement>): Promise<void> => {
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

        const result:  string = await response.text();

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
        {categories.map((cat, index) => (
          <div key={index} className="flex justify-between items-center p-4 bg-base-200 rounded-lg">
            <span className="font-bold text-lg">{cat.name}</span>
            <div className="flex items-center gap-2">
                <span className="text-sm opacity-60">Monthly Limit:</span>
                <span className="badge badge-outline badge-lg p-4 font-mono">
                    ${cat.budget.toLocaleString()}
                </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}