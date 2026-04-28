import React, { useState, useEffect } from 'react';
import { Card } from '@/src/components/ui/Card';
import { apiFetch } from '@/src/services/api';
import { Trophy, Award, Star } from 'lucide-react';

const Leaderboard = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const data = await apiFetch('/api/leaderboard');
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-10">
      <div className="text-center space-y-4">
         <h1 className="text-6xl font-extrabold uppercase tracking-tighter flex flex-col md:flex-row items-center justify-center gap-4">
           Top <span className="text-white bg-blue-600 px-6 rounded-[32px] border-4 border-black inline-block -rotate-2 shadow-[8px_8px_0px_#000]">IMPACT</span> Makers
         </h1>
         <p className="text-xl font-bold italic">The most active contributors across the global SkillBridge network.</p>
      </div>

      <Card className="p-0 overflow-hidden border-2 shadow-[8px_8px_0px_#000]">
        <div className="bg-black text-white p-6 grid grid-cols-12 font-extrabold uppercase tracking-widest text-[10px]">
           <div className="col-span-2">Rank</div>
           <div className="col-span-6">Contributor</div>
           <div className="col-span-2 text-center">XP</div>
           <div className="col-span-2 text-right">Badges</div>
        </div>

        {loading ? (
          <div className="p-20 text-center animate-pulse font-black uppercase italic">Processing Stats...</div>
        ) : (
          <div className="divide-y-4 divide-black">
            {users.map((user, i) => (
              <div key={user._id} className="p-6 grid grid-cols-12 items-center hover:bg-yellow-50 transition-colors">
                <div className="col-span-2">
                   <div className={`w-10 h-10 rounded-full border-2 border-black flex items-center justify-center font-black shadow-[4px_4px_0px_#000] ${
                     i === 0 ? 'bg-yellow-400 rotate-6' : i === 1 ? 'bg-gray-300' : i === 2 ? 'bg-orange-300' : 'bg-white'
                   }`}>
                     {i + 1}
                   </div>
                </div>
                <div className="col-span-6 flex items-center gap-4">
                   <div className="w-12 h-12 rounded-full border-2 border-black bg-white flex items-center justify-center overflow-hidden font-black uppercase text-xl">
                      {user.name.charAt(0)}
                   </div>
                   <div className="space-y-1">
                      <span className="text-xl font-black uppercase block">{user.name}</span>
                      <div className="flex gap-1">
                         {user.badges.slice(0, 2).map((b: string) => (
                           <span key={b} className="bg-blue-100 border border-black px-2 py-0.5 text-[8px] font-black uppercase rounded">{b}</span>
                         ))}
                      </div>
                   </div>
                </div>
                <div className="col-span-2 text-center">
                   <span className="text-2xl font-black">{user.points}</span>
                </div>
                <div className="col-span-2 text-right">
                   <div className="flex justify-end gap-1">
                      {i < 3 && <Trophy size={18} className={i === 0 ? 'text-yellow-500' : i === 1 ? 'text-gray-400' : 'text-orange-500'} />}
                      {user.badges.length > 0 && <Award size={18} className="text-purple-500" />}
                   </div>
                </div>
              </div>
            ))}
            {users.length === 0 && <div className="p-20 text-center font-bold italic text-gray-400">No data available yet. Be the first to earn points!</div>}
          </div>
        )}
      </Card>

      <section className="bg-white border-2 border-dashed border-black p-10 rounded-[32px] flex flex-col md:flex-row items-center gap-8 justify-between">
         <div className="space-y-4">
            <h3 className="text-3xl font-extrabold uppercase tracking-tighter">Impact Scoring</h3>
            <ul className="space-y-2 font-bold text-gray-700 text-sm">
               <li className="flex items-center gap-2"><div className="w-2 h-2 bg-black rounded-full" /> +10 XP for standard tasks</li>
               <li className="flex items-center gap-2"><div className="w-2 h-2 bg-black rounded-full" /> +20 XP for high impact tasks</li>
               <li className="flex items-center gap-2"><div className="w-2 h-2 bg-black rounded-full" /> Badges at 10, 50, 100 milestones</li>
            </ul>
         </div>
         <div className="relative">
            <div className="absolute -top-4 -left-4 bg-yellow-400 border-2 border-black p-2 font-black uppercase text-[10px] transform -rotate-12">New</div>
            <Card className="bg-white flex items-center gap-4 border-black -rotate-2">
               <Star className="text-yellow-500 fill-yellow-500" />
               <div>
                  <p className="font-black uppercase text-sm leading-none">Global Ranking</p>
                  <p className="font-bold text-[10px] text-gray-400 uppercase">Updates every 10 minutes</p>
               </div>
            </Card>
         </div>
      </section>
    </div>
  );
};

export default Leaderboard;
