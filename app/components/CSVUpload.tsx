"use client";

import { useState } from 'react';

export default function CSVUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState(""); // To show "Uploading..." or "Success!"

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
    <div className="card w-full max-w-sm bg-base-100 shadow-xl p-6 border border-primary/20">
      <h2 className="card-title mb-4">Upload Statements</h2>
      
      <input 
        type="file" 
        accept=".csv"
        className="file-input file-input-bordered file-input-primary w-full max-w-xs" 
        onChange={handleFileChange}
      />
      
      <div className="card-actions justify-end mt-4">
        <button 
          className="btn btn-primary" 
          onClick={handleUpload}
          disabled={!file}
        >
          Process CSV
        </button>
      </div>

      {status && (
        <p className="mt-4 text-sm font-medium text-center text-secondary">
          {status}
        </p>
      )}
    </div>
  );
}