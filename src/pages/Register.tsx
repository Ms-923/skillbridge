import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/src/contexts/AuthContext';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { Input } from '@/src/components/ui/Input';
import { apiFetch } from '@/src/services/api';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'Contributor' });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const data = await apiFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      login(data.token, data.user);
      navigate('/profile'); // Send to profile to complete setup
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex justify-center items-center py-20">
      <Card className="w-full max-w-lg space-y-6">
        <h1 className="text-4xl font-black uppercase tracking-tighter text-center">Create Account</h1>
        {error && <div className="bg-red-200 border-2 border-black p-3 font-bold text-sm text-red-700">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="font-bold uppercase text-xs">Full Name</label>
            <Input 
              type="text" 
              placeholder="John Doe" 
              value={form.name}
              onChange={(e) => setForm({...form, name: e.target.value})}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="font-bold uppercase text-xs">Email Address</label>
            <Input 
              type="email" 
              placeholder="you@example.com" 
              value={form.email}
              onChange={(e) => setForm({...form, email: e.target.value})}
              required
            />
          </div>
          <div className="space-y-4 pt-2">
            <label className="font-bold uppercase text-xs block">Choose Your Role</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setForm({...form, role: 'Contributor'})}
                className={`p-4 border-2 border-black rounded-2xl font-black uppercase tracking-tight transition-all ${form.role === 'Contributor' ? 'bg-black text-white' : 'bg-white text-black'}`}
              >
                Contributor
              </button>
              <button
                type="button"
                onClick={() => setForm({...form, role: 'Organization'})}
                className={`p-4 border-2 border-black rounded-2xl font-black uppercase tracking-tight transition-all ${form.role === 'Organization' ? 'bg-black text-white' : 'bg-white text-black'}`}
              >
                Organization
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <label className="font-bold uppercase text-xs">Password</label>
            <Input 
              type="password" 
              placeholder="••••••••" 
              value={form.password}
              onChange={(e) => setForm({...form, password: e.target.value})}
              required
            />
          </div>
          <Button type="submit" className="w-full h-14 text-lg">Join SkillBridge</Button>
        </form>
        <p className="text-center font-bold text-sm text-gray-500 italic">
          Already have an account? <Link to="/login" className="underline text-black font-black">Login</Link>
        </p>
      </Card>
    </div>
  );
};

export default Register;
