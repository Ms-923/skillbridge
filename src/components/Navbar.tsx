import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/src/contexts/AuthContext';
import { Button } from '@/src/components/ui/Button';
import { Menu, X, User as UserIcon } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="sticky top-3 z-50 mx-auto mb-6 w-[calc(100%-1rem)] max-w-7xl rounded-2xl border-2 border-black bg-white px-4 py-4 shadow-[4px_4px_0px_#000000] sm:top-4 sm:w-[calc(100%-2rem)] sm:px-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3 sm:gap-8">
          <Link to="/" className="truncate text-2xl font-extrabold tracking-tighter sm:text-3xl" onClick={closeMenu}>
            SKILLBRIDGE
          </Link>
          <div className="hidden items-center gap-6 font-bold text-sm uppercase md:flex">
            <Link to="/marketplace" className="hover:underline decoration-4 underline-offset-4" onClick={closeMenu}>
              Marketplace
            </Link>
            <Link to="/leaderboard" className="hover:underline decoration-4 underline-offset-4" onClick={closeMenu}>
              Leaderboard
            </Link>
            {user && (
              <Link to="/dashboard" className="hover:underline decoration-4 underline-offset-4" onClick={closeMenu}>
                Dashboard
              </Link>
            )}
          </div>
        </div>

        <div className="hidden items-center gap-4 md:flex">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <div className="font-extrabold text-sm uppercase">{user.name}</div>
                <div className="text-[10px] font-bold bg-yellow-300 border border-black px-1 uppercase leading-tight">
                  {user.role}
                </div>
              </div>
              <Link to="/profile" className="w-10 h-10 rounded-full border-2 border-black shadow-[2px_2px_0px_#000000] bg-orange-400 flex items-center justify-center overflow-hidden" onClick={closeMenu}>
                <UserIcon size={20} />
              </Link>
              <button 
                onClick={() => { closeMenu(); logout(); navigate('/'); }}
                className="font-bold text-xs uppercase hover:underline"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login" className="font-bold text-xs uppercase hover:underline" onClick={closeMenu}>Login</Link>
              <Link to="/register" onClick={closeMenu}>
                <Button className="h-10 px-4 py-0 text-xs">Join Us</Button>
              </Link>
            </div>
          )}
        </div>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border-2 border-black bg-yellow-300 shadow-[3px_3px_0px_#000] md:hidden"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="Toggle navigation menu"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {menuOpen && (
        <div className="mt-4 space-y-4 border-t-2 border-black pt-4 md:hidden">
          <div className="grid grid-cols-1 gap-2 font-bold text-sm uppercase">
            <Link to="/marketplace" className="rounded-xl border-2 border-black bg-gray-50 px-4 py-3" onClick={closeMenu}>
              Marketplace
            </Link>
            <Link to="/leaderboard" className="rounded-xl border-2 border-black bg-gray-50 px-4 py-3" onClick={closeMenu}>
              Leaderboard
            </Link>
            {user && (
              <Link to="/dashboard" className="rounded-xl border-2 border-black bg-gray-50 px-4 py-3" onClick={closeMenu}>
                Dashboard
              </Link>
            )}
            {user && (
              <Link to="/profile" className="rounded-xl border-2 border-black bg-gray-50 px-4 py-3" onClick={closeMenu}>
                Profile
              </Link>
            )}
          </div>

          {user ? (
            <div className="space-y-3 rounded-2xl border-2 border-black bg-orange-100 p-4">
              <div>
                <div className="font-extrabold uppercase">{user.name}</div>
                <div className="mt-1 inline-block border border-black bg-yellow-300 px-2 py-1 text-[10px] font-bold uppercase leading-tight">
                  {user.role}
                </div>
              </div>
              <Button
                className="w-full"
                onClick={() => {
                  closeMenu();
                  logout();
                  navigate('/');
                }}
              >
                Logout
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Link to="/login" onClick={closeMenu}>
                <Button variant="outline" className="w-full">
                  Login
                </Button>
              </Link>
              <Link to="/register" onClick={closeMenu}>
                <Button className="w-full">Join Us</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
