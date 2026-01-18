import React, { useState, useTransition } from 'react';

interface Category {
    name: string;
    budget: number;
    is_override?: boolean;
}

interface CategoryRowProps {
    cat: Category;
    editScope: "global" | "monthly";
    // Prop signatures as defined in your parent component
    handleUpdate: (oldCategoryName: string) => Promise<void>;
    handleDelete: (categoryToDelete: string) => Promise<void>;
    // Necessary setters to update the shared parent state for editing
    setTempName: (name: string) => void;
    setTempBudget: (budget: string) => void;
    setEditingName: (name: string | null) => void;
    editingName: string | null;
    error: string;
    setError: (msg: string) => void;
}

export default function CategoryRow({
    cat,
    editScope,
    handleUpdate,
    handleDelete,
    setTempName,
    setTempBudget,
    setEditingName,
    editingName,
    error,
    setError
}: CategoryRowProps) {
    const [isDeleting, startDeleting] = useTransition();
    const isOther = cat.name.toLowerCase() === 'other';
    const isEditing = editingName === cat.name;

    const onEditClick = () => {
        setEditingName(cat.name);
        setTempName(cat.name);
        setTempBudget(cat.budget.toString());
    };

    return (
        <div className={`
            p-4 bg-base-100 dark:bg-slate-900 rounded-lg group hover:bg-base-300 dark:hover:bg-slate-800 transition-all mb-3 border border-transparent dark:border-slate-800
            ${isDeleting ? "pointer-events-none opacity-40" : ""}
        `}>
            {isEditing ? (
                /* --- EDIT MODE --- */
                <div className="flex flex-col md:flex-row gap-3 items-center">
                    <div className="flex-1 w-full">
                        <input
                            className={`input input-bordered input-sm w-full bg-slate-50 dark:bg-slate-950 ${isOther || editScope === 'monthly' ? 'cursor-not-allowed opacity-70' : ''}`}
                            defaultValue={cat.name} // Using shared parent state for value
                            onChange={(e) => {
                                setTempName(e.target.value);
                                if (error) setError("");
                            }}
                            disabled={isOther || editScope === 'monthly'}
                            title={isOther ? "System category names cannot be changed" : ""}
                        />
                        {isOther && (
                            <span className="text-[10px] text-info ml-1 italic">Name is system-reserved</span>
                        )}
                    </div>

                    <div className="join">
                        <span className="join-item btn btn-sm btn-active pointer-events-none bg-slate-100 dark:bg-slate-800">$</span>
                        <input
                            type="number"
                            className="input input-bordered input-sm join-item w-24 bg-slate-50 dark:bg-slate-950"
                            defaultValue={cat.budget}
                            onChange={(e) => {
                                setTempBudget(e.target.value);
                                if (error) setError("");
                            }}
                            autoFocus={isOther}
                        />
                    </div>

                    <div className="flex gap-2">
                        <button className="btn btn-success btn-sm text-white" onClick={() => handleUpdate(cat.name)}>
                            Save
                        </button>
                        <button className="btn btn-ghost btn-sm" onClick={() => setEditingName(null)}>
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                /* --- VIEW MODE --- */
                <div className="flex flex-col md:flex-row gap-3 items-center justify-between w-full pl-3">
                    <div className="flex items-center gap-4 w-full">
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">
                                    {cat.name}
                                </h3>
                            </div>
                            <p className="text-sm font-medium text-slate-400 dark:text-slate-500">
                                ${cat.budget.toLocaleString(undefined, { minimumFractionDigits: 2 })} <span className="font-normal">limit</span>
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-2 w-full md:w-auto items-center">
                        <button
                            className="btn btn-ghost btn-sm hover:bg-primary/10 hover:text-primary transition-colors font-semibold"
                            onClick={onEditClick}
                        >
                            Edit
                        </button>

                        {!isOther ? (
                            <button
                                className="btn btn-ghost btn-sm text-slate-400 hover:text-error hover:bg-error/10 transition-colors"
                                onClick={() => {
                                    startDeleting(async () => {
                                        await handleDelete(cat.name);
                                    });
                                }}
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
    );
}