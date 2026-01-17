"use client";

import { useState } from 'react';

export default function CreateComponent() {
  // 1. State for the input text (like a temporary string)
  const [inputValue, setInputValue] = useState("");
  
  // 2. State for the list of categories (like a vector<string>)
  const [categories, setCategories] = useState(["Groceries", "Rent"]);

  const handleAddCategory = (e?: React.FormEvent<HTMLFormElement> | React.KeyboardEvent<HTMLInputElement> | React.MouseEvent<HTMLButtonElement>) => {
    // Prevent the page from refreshing if this is in a form
    if (e) e.preventDefault();

    if (inputValue.trim() !== "") {
      // 3. Add new category to the START of the array
      // This is the React way to do: list.insert(0, newItem)
      setCategories([inputValue, ...categories]);
      
      // 4. Clear the input box
      setInputValue("");
    }
  };

  return (
    <div className="p-4 max-w-md">
      <h2 className="text-xl font-bold mb-4">Manage Categories</h2>
      
      {/* Input Group */}
      <div className="join w-full mb-6">
        <input 
          type="text" 
          placeholder="New Category (e.g. Health)" 
          className="input input-bordered join-item w-full" 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddCategory(e)}
        />
        <button 
          className="btn btn-primary join-item"
          onClick={handleAddCategory}
        >
          Add
        </button>
      </div>

      {/* Display List */}
      <div className="flex flex-col gap-2">
        {categories.map((cat, index) => (
          <div key={index} className="card bg-base-200 shadow-sm p-4 animate-in fade-in slide-in-from-top-2">
            <span className="font-medium">{cat}</span>
          </div>
        ))}
      </div>
    </div>
  );
}