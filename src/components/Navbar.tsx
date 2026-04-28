import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/src/contexts/AuthContext';
import { Button } from '@/src/components/ui/Button';
import { Menu, LogOut, User as UserIcon, LayoutDashboard, Search, Trophy } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="sticky top-4 z-50 mx-auto w-[calc(100%-2rem)] max-w-7xl border-2 border-black bg-white shadow-[4px_4px_0px_#000000] rounded-2xl px-6 py-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="text-3xl font-extrabold tracking-tighter">
            SKILLBRIDGE
          </Link>
          <div className="hidden items-center gap-6 font-bold text-sm uppercase md:flex">
            <Link to="/marketplace" className="hover:underline decoration-4 underline-offset-4">
              Marketplace
            </Link>
            <Link to="/leaderboard" className="hover:underline decoration-4 underline-offset-4">
              Leaderboard
            </Link>
            {user && (
              <Link to="/dashboard" className="hover:underline decoration-4 underline-offset-4">
                Dashboard
              </Link>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <div className="font-extrabold text-sm uppercase">{user.name}</div>
                <div className="text-[10px] font-bold bg-yellow-300 border border-black px-1 uppercase leading-tight">
                  {user.role}
                </div>
              </div>
              <Link to="/profile" className="w-10 h-10 rounded-full border-2 border-black shadow-[2px_2px_0px_#000000] bg-orange-400 flex items-center justify-center overflow-hidden">
                <UserIcon size={20} />
              </Link>
              <button 
                onClick={() => { logout(); navigate('/'); }}
                className="font-bold text-xs uppercase hover:underline"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login" className="font-bold text-xs uppercase hover:underline">Login</Link>
              <Link to="/register">
                <Button className="h-10 px-4 py-0 text-xs">Join Us</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
