import React, { useState, useEffect } from 'react';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { apiFetch } from '@/src/services/api';
import { useAuth } from '@/src/contexts/AuthContext';
import { Sparkles, Star, Award, Zap, ArrowRight, User as UserIcon, Clock } from 'lucide-react';
import { getTaskRecommendations, suggestSkillRecycling } from '@/src/services/gemini';
import { Link } from 'react-router-dom';

const ContributorDashboard = () => {
  const [profile, setProfile] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [recycling, setRecycling] = useState<string[]>([]);
  const [allTasks, setAllTasks] = useState<any[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [u, tasks] = await Promise.all([
        apiFetch('/api/users/profile'),
        apiFetch('/api/tasks')
      ]);
      setProfile(u);
      setAllTasks(tasks);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAiRecommend = async () => {
    if (!profile || allTasks.length === 0) return;
    setAiLoading(true);
    try {
      const recs = await getTaskRecommendations(profile, allTasks);
      setRecommendations(recs);
      const suggestions = await suggestSkillRecycling(profile.skills || []);
      setRecycling(suggestions);
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  if (!profile) return <div className="text-center py-20 font-black uppercase italic">Loading...</div>;

  return (
    <div className="space-y-12">
      {/* Welcome & Stats */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
        <Card className="lg:col-span-2 bg-blue-500 text-white flex flex-col justify-between border-2 shadow-[4px_4px_0px_#000]">
          <div className="space-y-4">
            <h1 className="text-3xl font-extrabold uppercase tracking-tighter sm:text-4xl md:text-5xl">Welcome, {profile.name}!</h1>
            <p className="font-bold text-blue-100 italic">Ready to make an impact today? Your skills are in high demand.</p>
          </div>
          <div className="grid grid-cols-1 gap-4 pt-6 sm:grid-cols-2 sm:pt-8">
             <div className="bg-black p-4 rounded-2xl border-2 border-white shadow-[4px_4px_0px_#fff]">
                <p className="text-[10px] uppercase font-bold opacity-60">Total Points</p>
                <div className="text-3xl font-extrabold tracking-tighter sm:text-4xl">{profile.points} <span className="text-sm">PTS</span></div>
             </div>
             <div className="bg-yellow-300 text-black p-4 rounded-2xl border-2 border-black shadow-[4px_4px_0px_#000]">
                <p className="text-[10px] uppercase font-bold opacity-60">Availability</p>
                <div className="text-3xl font-extrabold tracking-tighter sm:text-4xl">{profile.availability} <span className="text-sm">H/WK</span></div>
             </div>
          </div>
        </Card>
        
        <Card className="bg-white space-y-4 border-2">
           <h2 className="text-xl font-extrabold tracking-tighter uppercase flex items-center gap-2">
             <Award size={20} /> Badges Earned
           </h2>
           <div className="flex flex-wrap gap-2">
             {profile.badges.map((b: string) => (
                <span key={b} className="bg-white border-2 border-black px-4 py-2 rounded-2xl font-extrabold uppercase text-[10px] shadow-[3px_3px_0px_#000]">
                  {b}
                </span>
             ))}
             {profile.badges.length === 0 && <p className="font-bold italic text-sm text-gray-400 leading-snug">No badges yet. Complete tasks to earn them!</p>}
           </div>
        </Card>
      </div>

      {/* AI Recommendations */}
      <section className="space-y-6">
        <div className="flex flex-col gap-3 px-2 sm:flex-row sm:items-center sm:justify-between">
           <h2 className="text-2xl font-extrabold tracking-tighter uppercase">AI Recommendations</h2>
           <span className="text-[10px] font-bold bg-purple-400 px-3 py-1 border-2 border-black rounded-full uppercase">Powered by Gemini</span>
        </div>
        
        <div className="flex justify-stretch sm:justify-end">
           <Button 
            onClick={handleAiRecommend} 
            disabled={aiLoading} 
            className="w-full bg-black text-white px-6 py-2 rounded-xl text-xs font-bold sm:w-auto"
           >
             <Sparkles size={14} className="mr-2" /> {aiLoading ? 'Thinking...' : 'Refresh Matches'}
           </Button>
        </div>

        {recommendations.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
            <div className="space-y-4">
              {recommendations.map((rec: any, i: number) => {
                const task = allTasks.find(t => t._id === rec.taskId);
                if (!task) return null;
                return (
                  <Card key={i} className="hover:-translate-y-1 transition-transform border-black border-2 bg-white relative">
                    <div className="absolute top-4 right-4">
                       <span className="text-lg font-extrabold text-blue-600">{rec.matchPercentage}% MATCH</span>
                    </div>
                    <div className="flex gap-2 mb-2">
                       <span className="text-[10px] font-bold bg-green-400 border border-black px-2 py-0.5 rounded-full uppercase">Matched</span>
                    </div>
                    <h3 className="text-xl font-extrabold uppercase leading-tight mb-2 tracking-tighter pr-20">{task.title}</h3>
                    <p className="text-xs font-bold text-gray-500 mb-4 italic leading-snug">"{rec.reason}"</p>
                    <Link to={`/marketplace?search=${task.title}`}>
                      <Button variant="outline" className="h-8 px-4 py-0 text-[10px] border-none shadow-none uppercase font-black underline underline-offset-4 decoration-2">View Task Details</Button>
                    </Link>
                  </Card>
                );
              })}
            </div>
            
            <Card className="bg-green-100 border-dashed border-4 border-black">
               <h3 className="text-2xl font-black uppercase mb-4 flex items-center gap-2">
                 <Zap size={20} className="text-yellow-500" /> Skill Recycling
               </h3>
               <p className="font-bold mb-6 text-sm">AI-suggested ways to pivot your skills into impact:</p>
               <ul className="space-y-3">
                 {recycling.map((s, i) => (
                   <li key={i} className="flex gap-2 items-start font-bold text-gray-800 text-sm">
                     <Star size={14} className="mt-1 flex-shrink-0" /> {s}
                   </li>
                 ))}
                 {recycling.length === 0 && <li className="italic text-gray-500 text-sm">Click "Get Matches" to see suggestions.</li>}
               </ul>
            </Card>
          </div>
        ) : (
          <div className="border-4 border-black border-dashed rounded-3xl bg-gray-50 p-8 text-center space-y-4 sm:p-12 md:p-20">
             <Sparkles size={48} className="mx-auto text-purple-400" />
             <p className="font-bold text-xl">Let Gemini AI find the perfect tasks for your skillset.</p>
             <Button onClick={handleAiRecommend} variant="outline" className="h-14 px-8">Run AI Matchmaker</Button>
          </div>
        )}
      </section>

      {/* Applied Tasks */}
      <section className="space-y-6">
         <h2 className="text-3xl font-black uppercase tracking-tight">Active Applications</h2>
         <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
           {allTasks.filter(t => t.applicants?.includes(user?.id)).map(task => (
             <Card key={task._id} className="border-l-8 border-l-yellow-400 space-y-2">
               <h4 className="font-black uppercase">{task.title}</h4>
               <p className="text-xs font-bold text-gray-500 flex items-center gap-1"><Clock size={12} /> Pending Response</p>
             </Card>
           ))}
           {allTasks.filter(t => t.applicants?.includes(user?.id)).length === 0 && (
             <p className="font-bold italic text-gray-400">No active applications. Explore the marketplace!</p>
           )}
         </div>
      </section>
    </div>
  );
};

export default ContributorDashboard;
