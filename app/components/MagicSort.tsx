"use client";

import { Dispatch, SetStateAction, useState } from 'react';

export default function MagicSort({ monthString, setTransactions }: { monthString: string, setTransactions: Dispatch<SetStateAction<any>> }) {
    const [loading, setLoading] = useState(false);

    const handleSort = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/budgetcategory/reallocate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user: "hackathon",
                    month: monthString + "-01"
                }),
            });
            const json = await res.json();
            setTransactions(json);
        } catch (err) {
            alert("Error sorting");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleSort}
            disabled={loading}
            className="fixed top-4 right-4 z-50 btn btn-primary px-8 rounded-full shadow-lg border-none bg-gradient-to-r from-violet-600 to-indigo-600 hover:scale-105 transition-all"
            title="Re-allocate Categories"
            
        >
            {loading ? (
                <span className="loading loading-spinner h-5 w-5"></span>
            ) : (
                "Re-allocate Categories ✨"
            )}
        </button>
    );
}