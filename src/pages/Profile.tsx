import React, { useState, useEffect } from 'react';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { apiFetch } from '@/src/services/api';
import { useAuth } from '@/src/contexts/AuthContext';
import { User, Mail, Briefcase, Clock, Plus, X } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [newSkill, setNewSkill] = useState('');
  const [newInterest, setNewInterest] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await apiFetch('/api/users/profile');
      setProfile(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      await apiFetch('/api/users/profile', {
        method: 'PUT',
        body: JSON.stringify({
          skills: profile.skills,
          availability: profile.availability,
          interests: profile.interests,
        }),
      });
      alert('Profile updated!');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const addSkill = () => {
    if (newSkill && !profile.skills.includes(newSkill)) {
      setProfile({ ...profile, skills: [...profile.skills, newSkill] });
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setProfile({ ...profile, skills: profile.skills.filter((s: string) => s !== skill) });
  };

  if (loading) return <div className="text-center py-20 font-black uppercase italic">Loading Profile...</div>;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <h1 className="text-3xl font-black uppercase tracking-tighter sm:text-4xl md:text-5xl">Your Profile</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Sidebar Info */}
        <Card className="md:col-span-1 space-y-6 flex flex-col items-center text-center bg-gray-50 border-dashed">
          <div className="w-24 h-24 rounded-full border-4 border-black bg-white flex items-center justify-center shadow-[4px_4px_0px_#000]">
             <User size={48} />
          </div>
          <div className="space-y-1">
             <h2 className="text-2xl font-black uppercase">{profile.name}</h2>
             <p className="font-bold text-gray-500 flex items-center justify-center gap-2 text-sm"><Mail size={14} /> {profile.email}</p>
             <span className="inline-block bg-black text-white px-3 py-1 rounded-full text-[10px] font-black uppercase mt-2">
               {profile.role}
             </span>
          </div>
          
          {profile.role === 'Contributor' && (
            <div className="pt-4 border-t-2 border-black w-full text-center">
               <p className="text-xs uppercase font-black text-gray-500">Reputation</p>
               <p className="text-3xl font-black">{profile.points} XP</p>
            </div>
          )}
        </Card>

        {/* Edit Section */}
        <Card className="md:col-span-2 space-y-8">
          {profile.role === 'Contributor' ? (
            <>
              {/* Skills */}
              <div className="space-y-4">
                <label className="font-black uppercase flex items-center gap-2"><Briefcase size={20} /> My Skills</label>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((s: string) => (
                    <span key={s} className="flex items-center gap-2 bg-yellow-200 border-2 border-black px-3 py-1 font-black uppercase text-xs rounded-xl shadow-[2px_2px_0px_#000]">
                      {s} <X size={14} className="cursor-pointer" onClick={() => removeSkill(s)} />
                    </span>
                  ))}
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                   <Input 
                     placeholder="Add skill (e.g. React, UX Design)" 
                     value={newSkill}
                     onChange={(e) => setNewSkill(e.target.value)}
                     onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                   />
                   <Button onClick={addSkill} className="px-4"><Plus /></Button>
                </div>
              </div>

              {/* Availability */}
              <div className="space-y-4">
                <label className="font-black uppercase flex items-center gap-2"><Clock size={20} /> Availability (hours/week)</label>
                <Input 
                  type="number" 
                  value={profile.availability}
                  onChange={(e) => setProfile({...profile, availability: parseInt(e.target.value) || 0})}
                />
              </div>

              {/* Interests */}
              <div className="space-y-4">
                <label className="font-black uppercase">Interests / Domains</label>
                <p className="text-xs font-bold text-gray-400 italic">Describe your interests separated by commas (e.g. Climate Tech, Education)</p>
                <Input 
                  value={profile.interests.join(', ')}
                  onChange={(e) => setProfile({...profile, interests: e.target.value.split(',').map((i: string) => i.trim()).filter((i: string) => i)})}
                />
              </div>
            </>
          ) : (
             <div className="p-12 text-center space-y-4">
                <h3 className="text-2xl font-black uppercase">Organization Profile</h3>
                <p className="font-bold">You are registered as an Organization. You can post and manage tasks via the Dashboard.</p>
             </div>
          )}

          <div className="flex justify-stretch border-t-2 border-black pt-8 sm:justify-end">
             <Button onClick={handleUpdate} className="h-14 w-full px-8 text-base sm:w-auto sm:px-12 sm:text-lg">Save Profile Changes</Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
