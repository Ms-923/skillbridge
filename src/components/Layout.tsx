import React from 'react';
import { Navbar } from './Navbar';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#f3f4f6] font-sans text-black selection:bg-black selection:text-white pb-12">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 md:px-8 py-6">
        {children}
      </main>
      <footer className="mt-20 border-t-2 border-black bg-white p-8">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-extrabold tracking-tighter uppercase text-xs">© 2026 SkillBridge. All rights reserved.</p>
          <div className="flex gap-8 font-bold text-[10px] uppercase">
            <a href="#" className="hover:underline">Terms</a>
            <a href="#" className="hover:underline">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
