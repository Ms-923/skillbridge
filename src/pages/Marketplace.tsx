import React, { useState, useEffect } from 'react';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { apiFetch } from '@/src/services/api';
import { useAuth } from '@/src/contexts/AuthContext';
import { Search, Filter, Zap, Clock } from 'lucide-react';

const Marketplace = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState({ impact: '', micro: false });
  const { user } = useAuth();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const data = await apiFetch('/api/tasks');
      setTasks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (taskId: string) => {
    if (!user) return alert('Please login to apply');
    try {
      await apiFetch(`/api/tasks/${taskId}/apply`, { method: 'POST' });
      alert('Application sent successfully!');
      fetchTasks();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesImpact = !filter.impact || task.impactLevel === filter.impact;
    const matchesMicro = !filter.micro || task.isMicroTask;
    return matchesSearch && matchesImpact && matchesMicro;
  });

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 bg-yellow-400 border-4 border-black p-8 rounded-[32px] shadow-[8px_8px_0px_#000]">
        <div className="space-y-4 max-w-xl">
          <h1 className="text-5xl font-extrabold uppercase tracking-tighter">Task Marketplace</h1>
          <p className="font-bold">Find meaningful work that matches your skills. Filter by impact or micro-tasks.</p>
        </div>
        <div className="flex flex-wrap gap-4 w-full md:w-auto">
          <div className="relative flex-grow md:flex-grow-0">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2" size={18} />
             <Input 
               className="pl-12 w-full md:w-64 border-b-4" 
               placeholder="Search tasks..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
          </div>
          <select 
            className="h-12 rounded-3xl border-2 border-black bg-white px-4 font-bold focus:outline-none"
            value={filter.impact}
            onChange={(e) => setFilter({...filter, impact: e.target.value})}
          >
            <option value="">All Impact</option>
            <option value="High">High Impact</option>
            <option value="Medium">Medium Impact</option>
            <option value="Low">Low Impact</option>
          </select>
          <button 
             onClick={() => setFilter({...filter, micro: !filter.micro})}
             className={`flex items-center gap-2 h-12 px-6 rounded-2xl border-2 border-black font-extrabold uppercase transition-all shadow-[4px_4px_0px_#000] active:translate-y-1 active:shadow-none ${filter.micro ? 'bg-black text-white' : 'bg-white text-black'}`}
          >
            <Zap size={16} /> Micro-tasks
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[1,2,3,4].map(n => <div key={n} className="h-64 bg-gray-100 rounded-3xl animate-pulse border-2 border-black"></div>)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTasks.length > 0 ? filteredTasks.map((task) => (
            <Card key={task._id} className="flex flex-col h-full hover:-translate-y-2 transition-transform cursor-pointer group">
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-2">
                  <span className={`px-2 py-1 rounded-sm text-[10px] font-black uppercase border border-black shadow-[2px_2px_0px_#000] ${
                    task.impactLevel === 'High' ? 'bg-red-400' : task.impactLevel === 'Medium' ? 'bg-orange-400' : 'bg-green-400'
                  }`}>
                    {task.impactLevel} Impact
                  </span>
                  {task.isMicroTask && (
                    <span className="px-2 py-1 bg-yellow-400 rounded-sm text-[10px] font-black uppercase border border-black shadow-[2px_2px_0px_#000]">
                      Micro-task
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-gray-500 font-bold text-xs uppercase">
                  <Clock size={12} /> {task.duration}
                </div>
              </div>
              <h3 className="text-2xl font-extrabold uppercase mb-2 group-hover:underline tracking-tighter">{task.title}</h3>
              <p className="text-sm font-bold text-gray-600 mb-6 flex-grow line-clamp-3">{task.description}</p>
              
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {task.requiredSkills.map((s: string) => (
                    <span key={s} className="bg-gray-100 border border-black px-2 py-1 text-[10px] font-black uppercase">{s}</span>
                  ))}
                </div>
                <div className="pt-4 border-t-2 border-black flex items-center justify-between">
                  <span className="text-xs font-bold italic">By {task.createdBy?.name}</span>
                  {user?.role === 'Contributor' && (
                    <Button onClick={() => handleApply(task._id)} className="h-10 px-4 py-0 bg-blue-500">Apply Now</Button>
                  )}
                </div>
              </div>
            </Card>
          )) : (
            <div className="col-span-full py-20 text-center space-y-4">
              <h2 className="text-4xl font-black uppercase italic">No tasks found.</h2>
              <p className="font-bold">Try adjusting your filters or search terms.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Marketplace;
