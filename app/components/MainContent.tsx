
import React from 'react';

export default function MainContent() {
  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 h-full">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          Workspace
        </h2>
        <p className="text-slate-400 text-sm mt-1 uppercase tracking-widest font-semibold">
          Standard View
        </p>
      </div>
      
      <div className="h-[70vh] rounded-xl border border-slate-200 bg-white shadow-sm flex items-center justify-center text-slate-300">
        <span className="text-xs font-semibold uppercase tracking-widest">Main Workspace</span>
      </div>
    </div>
  );
}
