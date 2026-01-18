"use client";

import React, { useState } from 'react';
import { Section } from '../../lib/types'; // Kept Section for BottomNav logic
import BottomNav from '../components/BottomNav';
import CSVUpload from '../components/CSVUpload';

export default function Settings() {
  const [activeSection, setActiveSection] = useState<Section>(Section.EXPENSES);

  return (
    // Updated background for both modes
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 overflow-hidden relative transition-colors duration-300">
      <div className="flex-1 flex flex-col min-w-0">
        
        <main className="flex-1 flex items-center justify-center p-4 overflow-y-auto pb-24">
          <div className="w-full max-w-md">
            {/* The CSVUpload component will need its own dark: classes inside its file too! */}
            <CSVUpload />
          </div>
        </main>

        <BottomNav 
          activeSection={activeSection} 
          onSectionSelect={setActiveSection} 
        />
      </div>
    </div>
  );
}