"use client";

import { useState } from 'react';

export default function CSVUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState(""); // To show "Uploading..." or "Success!"
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      // Basic check to ensure it's a CSV
      if (droppedFile.name.endsWith('.csv')) {
        setFile(droppedFile);
        setStatus("");
      } else {
        setStatus("Please drop a CSV file.");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Files is an array, we just want the first one selected
    setFile(e.target.files?.[0] ?? null);
};

  const handleUpload = async () => {
    if (!file) {
      setStatus("Please select a file first.");
      return;
    }

    setStatus("Uploading and processing...");

    // 1. Create the FormData object
    const formData = new FormData();
    // 2. Append the file with a key name (the backend will look for 'file')
    formData.append('file', file);
    formData.append('user', 'hackathon'); // Adding the username like before

    try {
      // 3. Send the request
      const response = await fetch('/api/uploadcsv', {
        method: 'POST',
        // IMPORTANT: Do NOT set 'Content-Type' header manually! 
        // The browser will set it to 'multipart/form-data' automatically.
        body: formData,
      });

      if (response.ok) {
        setStatus("Success! Your transactions are being processed.");
        // We might want to refresh the page or trigger a re-fetch here
      } else {
        setStatus("Upload failed. Check file format.");
      }
    } catch (error) {
      setStatus("Error: Could not reach the server.");
    }
  };

  return (
  <div className="card w-full max-w-sm bg-white dark:bg-slate-900 shadow-2xl p-8 border border-slate-200 dark:border-slate-800 transition-all duration-300">
    <div className="text-center mb-6">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Upload Statement</h2>
      <p className="text-xs text-slate-500 mt-1">Select your bank CSV to sync transactions</p>
    </div>

    {/* The Hidden Input & Styled Label */}
    <label 
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`group relative flex flex-col items-center justify-center w-full h-44 border-2 border-dashed rounded-2xl transition-all cursor-pointer overflow-hidden
        ${isDragging ? 'border-primary bg-primary/10' : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950'}
        hover:border-primary dark:hover:border-primary hover:bg-primary/5`}
    >
      <input 
        type="file" 
        accept=".csv"
        className="hidden" 
        onChange={handleFileChange}
      />
      
      <div className="flex flex-col items-center justify-center py-4">
        {/* Animated Icon */}
        <div className={`p-4 mb-3 rounded-full ${file ? 'bg-success/20 text-success' : 'bg-primary/10 text-primary'} group-hover:scale-110 transition-transform duration-300`}>
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
          {file ? file.name : "Click to browse"}
        </p>
        <p className="text-[10px] text-slate-400 mt-1 italic">
          {file ? `${(file.size / 1024).toFixed(1)} KB` : "CSV files only"}
        </p>
      </div>

      {/* Progress Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </label>

    <div className="mt-6">
      <button 
        className={`btn btn-primary w-full rounded-xl shadow-lg shadow-primary/20 active:scale-95 transition-all
          ${!file ? 'btn-disabled opacity-50' : 'hover:-translate-y-0.5'}`}
        onClick={handleUpload}
        disabled={!file}
      >
        <span className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
          Process Statement
        </span>
      </button>
    </div>

    {status && (
      <div className={`mt-4 p-3 rounded-lg text-xs text-center font-medium animate-in fade-in slide-in-from-top-2
        ${status.includes('Success') ? 'bg-success/10 text-success' : 'bg-secondary/10 text-secondary'}`}>
        {status}
      </div>
    )}
  </div>
);
}