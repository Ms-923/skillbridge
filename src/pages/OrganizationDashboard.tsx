import React, { useState, useEffect } from 'react';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { apiFetch } from '@/src/services/api';
import { useAuth } from '@/src/contexts/AuthContext';
import { Plus, Users, CheckCircle, Clock, Search } from 'lucide-react';
import { generateTask, enhanceDescription } from '@/src/services/gemini';

const OrganizationDashboard = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [approvingApplicantId, setApprovingApplicantId] = useState<string | null>(null);
  const [goal, setGoal] = useState('');
  const { user } = useAuth();

  const [form, setForm] = useState({
    title: '',
    description: '',
    requiredSkills: '',
    duration: '',
    impactLevel: 'Medium',
    isMicroTask: false
  });

  useEffect(() => {
    fetchMyTasks();
  }, []);

  const fetchMyTasks = async () => {
    try {
      const allTasks = await apiFetch('/api/tasks');
      // In a real app we'd have an endpoint for my tasks
      const myTasks = allTasks.filter((t: any) => t.createdBy?._id === user?.id || t.createdBy === user?.id);
      setTasks(myTasks);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const skillsArray = form.requiredSkills.split(',').map(s => s.trim()).filter(s => s);
      await apiFetch('/api/tasks', {
        method: 'POST',
        body: JSON.stringify({ ...form, requiredSkills: skillsArray }),
      });
      setShowForm(false);
      setForm({ title: '', description: '', requiredSkills: '', duration: '', impactLevel: 'Medium', isMicroTask: false });
      fetchMyTasks();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAiGenerate = async () => {
    if (!goal) return alert('Enter a goal first!');
    setAiLoading(true);
    try {
      const task = await generateTask(goal);
      setForm({
        ...form,
        title: task.title,
        description: task.description,
        requiredSkills: task.skills.join(', '),
        duration: task.duration,
        impactLevel: task.impactLevel
      });
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  const handleEnhance = async () => {
    if (!form.description) return alert('Enter a description first!');
    setAiLoading(true);
    try {
      const enhanced = await enhanceDescription(form.description);
      setForm({ ...form, description: enhanced });
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  const handleApproveApplicant = async (taskId: string, applicantId: string) => {
    try {
      setApprovingApplicantId(applicantId);
      await apiFetch(`/api/tasks/${taskId}/approve/${applicantId}`, { method: 'POST' });
      setSelectedTaskId(null);
      fetchMyTasks();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setApprovingApplicantId(null);
    }
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col items-start justify-between gap-4 rounded-[32px] border-2 border-black bg-white p-5 text-black shadow-[8px_8px_0px_#000] sm:p-8 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-extrabold uppercase tracking-tighter sm:text-4xl">Org Dashboard</h1>
          <p className="font-bold text-gray-500 text-sm">Manage your tasks and find the best talent.</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="h-12 w-full bg-black px-6 text-base text-white sm:h-14 sm:w-auto sm:px-8 sm:text-lg">
          {showForm ? 'Close Form' : <><Plus className="mr-2" size={18} /> Post New Task</>}
        </Button>
      </div>

      {showForm && (
        <Card className="space-y-6">
          <div className="flex flex-col gap-4 border-b-2 border-black pb-4 lg:flex-row lg:items-center lg:justify-between">
             <h2 className="text-2xl font-extrabold uppercase tracking-tighter sm:text-3xl">Create New Task</h2>
             <div className="flex flex-col gap-2 sm:flex-row">
               <Input 
                 placeholder="Enter mission goal for AI generation..." 
                 className="h-10 w-full text-xs sm:w-64" 
                 value={goal}
                 onChange={(e) => setGoal(e.target.value)}
               />
               <Button onClick={handleAiGenerate} disabled={aiLoading} className="h-10 px-4 py-0 text-xs bg-purple-500">
                 {aiLoading ? 'Thinking...' : 'AI Generate'}
               </Button>
             </div>
          </div>
          <form onSubmit={handleCreateTask} className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="font-black uppercase text-xs">Task Title</label>
                <Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                   <label className="font-black uppercase text-xs">Description</label>
                   <button type="button" onClick={handleEnhance} className="text-[10px] font-black uppercase underline">AI Enhance</button>
                </div>
                <textarea 
                  className="w-full h-32 rounded-3xl border-2 border-black p-4 font-bold focus:outline-none focus:ring-2 focus:ring-black"
                  value={form.description}
                  onChange={e => setForm({...form, description: e.target.value})}
                  required
                />
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="font-black uppercase text-xs">Required Skills (comma separated)</label>
                <Input value={form.requiredSkills} onChange={e => setForm({...form, requiredSkills: e.target.value})} />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="font-black uppercase text-xs">Duration</label>
                  <Input value={form.duration} onChange={e => setForm({...form, duration: e.target.value})} placeholder="e.g. 5 days" required />
                </div>
                <div className="space-y-2">
                  <label className="font-black uppercase text-xs">Impact Level</label>
                  <select 
                    className="w-full h-12 rounded-3xl border-2 border-black px-4 font-bold focus:outline-none"
                    value={form.impactLevel}
                    onChange={e => setForm({...form, impactLevel: e.target.value})}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-col items-stretch gap-4 pt-6 sm:flex-row sm:items-center">
                <button 
                  type="button" 
                  onClick={() => setForm({...form, isMicroTask: !form.isMicroTask})}
                  className={`flex-1 h-12 rounded-2xl border-2 border-black font-black uppercase ${form.isMicroTask ? 'bg-black text-white' : 'bg-white text-black'}`}
                >
                  Micro-Task
                </button>
                <Button type="submit" className="flex-1 bg-green-500 h-12">Publish Task</Button>
              </div>
            </div>
          </form>
        </Card>
      )}

      <div className="space-y-6">
        <h2 className="text-3xl font-black uppercase tracking-tight">Active Job Postings</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
          {tasks.map(task => (
            <Card key={task._id} className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <h3 className="text-xl font-extrabold uppercase tracking-tighter sm:text-2xl">{task.title}</h3>
                <span className={`px-3 py-1 rounded-full border-2 border-black font-black text-[10px] uppercase ${task.status === 'Open' ? 'bg-blue-200' : 'bg-orange-200'}`}>
                  {task.status}
                </span>
              </div>
              <p className="font-bold text-gray-600 line-clamp-2">{task.description}</p>
              
              <div className="flex flex-col gap-3 border-t-2 border-black pt-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 font-black text-xs uppercase">
                   <Users size={16} /> {task.applicants?.length || 0} Applicants
                </div>
                {task.status === 'Open' ? (
                   <Button
                     variant="outline"
                     className="h-10 text-xs px-4"
                     onClick={() => setSelectedTaskId(selectedTaskId === task._id ? null : task._id)}
                   >
                     {selectedTaskId === task._id ? 'Hide Applicants' : 'Review Applicants'}
                   </Button>
                ) : (
                  <Button onClick={async () => {
                    await apiFetch(`/api/tasks/${task._id}/complete`, { method: 'POST' });
                    fetchMyTasks();
                  }} className="bg-green-400 text-black h-10 text-xs px-4">Mark Completed</Button>
                )}
              </div>

              {selectedTaskId === task._id && task.status === 'Open' && (
                <div className="space-y-4 border-t-2 border-black pt-4">
                  <div className="flex items-center justify-between gap-3">
                    <h4 className="text-sm font-black uppercase tracking-wide">Applicants</h4>
                    <span className="rounded-full border-2 border-black bg-yellow-200 px-3 py-1 text-[10px] font-black uppercase">
                      {task.applicants?.length || 0} total
                    </span>
                  </div>

                  {task.applicants?.length ? (
                    <div className="space-y-3">
                      {task.applicants.map((applicant: any) => (
                        <div
                          key={applicant._id || applicant}
                          className="rounded-2xl border-2 border-black bg-gray-50 p-4"
                        >
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div className="space-y-2">
                              <div>
                                <p className="text-base font-black uppercase">{applicant.name || 'Applicant'}</p>
                                {applicant.email && (
                                  <p className="text-xs font-bold text-gray-500">{applicant.email}</p>
                                )}
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {applicant.skills?.length ? applicant.skills.map((skill: string) => (
                                  <span
                                    key={skill}
                                    className="border border-black bg-white px-2 py-1 text-[10px] font-black uppercase"
                                  >
                                    {skill}
                                  </span>
                                )) : (
                                  <span className="text-xs font-bold italic text-gray-400">No skills added yet</span>
                                )}
                              </div>
                              {typeof applicant.availability === 'number' && (
                                <p className="text-xs font-bold uppercase text-gray-600">
                                  Availability: {applicant.availability} hrs/week
                                </p>
                              )}
                            </div>

                            <Button
                              className="h-10 w-full bg-blue-500 px-4 py-0 text-xs sm:w-auto"
                              onClick={() => handleApproveApplicant(task._id, applicant._id)}
                              disabled={approvingApplicantId === applicant._id}
                            >
                              {approvingApplicantId === applicant._id ? 'Approving...' : 'Approve Applicant'}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm font-bold italic text-gray-400">No applicants yet for this task.</p>
                  )}
                </div>
              )}
            </Card>
          ))}
          {tasks.length === 0 && <p className="font-bold italic">No tasks posted yet.</p>}
        </div>
      </div>
    </div>
  );
};

export default OrganizationDashboard;
