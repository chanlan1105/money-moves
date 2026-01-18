"use client";

import { useState, useEffect } from 'react';

interface Category {
  name: string;
  budget: number;
}

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
  {categories.map((cat, index) => (
    <div key={index} className="flex justify-between items-center p-4 bg-base-200 rounded-lg group">
      <div>
        <span className="font-bold text-lg">{cat.name}</span>
        <div className="text-xs opacity-50">Limit: ${cat.budget}</div>
      </div>

      <div className="flex items-center gap-2">
        {/* Only show delete button if it's NOT 'Other' */}
        {cat.name.toLowerCase() !== 'other' ? (
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
  ))}
</div>
      </div>
    </div>
  );
}