import React from 'react';
import { Navbar } from './Navbar';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#f3f4f6] font-sans text-black selection:bg-black selection:text-white pb-12">
      <Navbar />
      <main className="mx-auto max-w-7xl px-3 py-4 sm:px-4 sm:py-6 md:px-8">
        {children}
      </main>
      <footer className="mt-14 border-t-2 border-black bg-white px-4 py-8 sm:mt-20 sm:p-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
          <p className="font-extrabold tracking-tighter uppercase text-[11px] sm:text-xs">© 2026 SkillBridge. All rights reserved.</p>
          <div className="flex flex-wrap justify-center gap-5 font-bold text-[10px] uppercase sm:gap-8">
            <a href="#" className="hover:underline">Terms</a>
            <a href="#" className="hover:underline">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
