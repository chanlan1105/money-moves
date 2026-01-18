"use client";

import { useState } from 'react';

export default function MagicSort({ monthString }: { monthString: string }) {
  const [loading, setLoading] = useState(false);

  const handleSort = async () => {
    setLoading(true);
    try {
      await fetch('/api/budgetcategory/reallocate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user: "hackathon", 
          month: monthString + "-01" 
        }),
      });
      alert("AI Re-sort Complete");
    } catch (err) {
      alert("Error sorting");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleSort}
      disabled={loading}
      className="fixed top-4 left-4 z-50 btn btn-circle btn-primary shadow-lg"
      title="Re-allocate Budget"
    >
      {loading ? (
        <span className="loading loading-spinner h-5 w-5"></span>
      ) : (
        "✨"
      )}
    </button>
  );
}