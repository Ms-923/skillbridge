import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { ArrowRight, Sparkles, Zap, Users, Globe } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';

const Landing = () => {
  return (
    <div className="space-y-16 py-6 sm:space-y-20 sm:py-10 md:space-y-24 md:py-12">
      {/* Hero Section */}
      <section className="flex flex-col items-center space-y-6 text-center sm:space-y-8">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.5 }}
        >
           <span className="inline-block rounded-full border-2 border-black bg-yellow-300 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] shadow-[2px_2px_0px_#000] sm:px-4 sm:text-sm">
             Revolutionizing Open Innovation
           </span>
        </motion.div>
        
        <motion.h1 
          className="max-w-4xl text-4xl font-extrabold leading-[0.95] tracking-tighter sm:text-5xl md:text-7xl lg:text-8xl"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          CONNECT YOUR SKILLS TO REAL-WORLD <span className="text-blue-600 italic">IMPACT.</span>
        </motion.h1>
        
        <p className="max-w-2xl px-2 text-base font-bold text-gray-700 sm:text-lg md:text-xl">
          The neo-brutalist bridge between ambitious contributors and mission-driven organizations. Powered by Gemini AI.
        </p>
        
        <div className="flex w-full flex-col items-stretch justify-center gap-3 pt-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:gap-4 sm:pt-4">
          <Link to="/register">
            <Button className="h-14 w-full px-6 text-base sm:h-16 sm:px-8 sm:text-xl">Get Started Now <ArrowRight className="ml-2" /></Button>
          </Link>
          <Link to="/marketplace">
            <Button variant="outline" className="h-14 w-full px-6 text-base sm:h-16 sm:px-8 sm:text-xl">Browse Tasks</Button>
          </Link>
        </div>
      </section>

      {/* How it Works */}
      <section className="space-y-12">
        <h2 className="text-center text-3xl font-extrabold uppercase tracking-tighter sm:text-4xl md:text-6xl">How it Works</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
          {[
            { icon: <Users size={40} />, title: "Join", desc: "Creators or Orgs sign up and define who they are.", color: "bg-green-200" },
            { icon: <Sparkles size={40} />, title: "Match", desc: "AI scans skills and availability to find the perfect tasks.", color: "bg-blue-200" },
            { icon: <Zap size={40} />, title: "Execute", desc: "Complete micro-tasks or massive projects. Earn badges.", color: "bg-orange-200" }
          ].map((item, i) => (
            <Card key={i} className="flex flex-col items-center text-center space-y-4 hover:-translate-y-1 transition-transform">
              <div className={cn("rounded-full border-2 border-black p-4 shadow-[4px_4px_0px_#000]", item.color)}>
                {item.icon}
              </div>
              <h3 className="text-2xl font-extrabold uppercase tracking-tighter">{item.title}</h3>
              <p className="font-bold text-gray-600 text-sm leading-snug">{item.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Social Impact / Featured */}
      <section className="rounded-3xl border-4 border-black bg-black p-5 text-white sm:p-8 md:p-12">
        <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-12">
          <div className="space-y-6">
            <h2 className="text-3xl font-black leading-tight tracking-tighter uppercase sm:text-4xl md:text-5xl">Why SkillBridge?</h2>
            <ul className="space-y-4 text-sm font-bold sm:text-base md:text-lg">
              <li className="flex items-start gap-2"><Globe className="mt-0.5 shrink-0 text-green-400" /> Global access to talented individuals</li>
              <li className="flex items-start gap-2"><Globe className="mt-0.5 shrink-0 text-blue-400" /> Meaningful work for NGOs & Startups</li>
              <li className="flex items-start gap-2"><Globe className="mt-0.5 shrink-0 text-yellow-400" /> Gamified progression & verification</li>
              <li className="flex items-start gap-2"><Globe className="mt-0.5 shrink-0 text-pink-400" /> AI-driven efficiency for organizations</li>
            </ul>
          </div>
          <Card className="space-y-6 text-black md:rotate-2 md:transform-gpu">
             <div className="flex flex-wrap justify-between gap-3">
                <span className="font-black text-xs uppercase bg-black text-white px-2 py-1 rounded">High Impact</span>
                <span className="font-bold text-sm text-gray-400">Micro-task</span>
             </div>
             <h3 className="text-2xl font-black uppercase leading-none sm:text-3xl">Optimize Climate Data Pipeline</h3>
             <p className="font-bold text-gray-700">Help our non-profit clean and analyze reforestation data from satellites.</p>
             <div className="flex flex-wrap gap-2">
                {['Python', 'Data Viz', 'GIS'].map(s => (
                  <span key={s} className="border-2 border-black bg-yellow-200 px-2 py-1 text-xs font-black uppercase">{s}</span>
                ))}
             </div>
             <Button className="w-full">Apply Now</Button>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="flex flex-col items-center space-y-6 rounded-3xl border-4 border-black bg-blue-100 p-6 text-center sm:space-y-8 sm:p-10 md:p-16">
        <h2 className="text-3xl font-black uppercase tracking-tighter sm:text-4xl md:text-5xl">Ready to Build the Future?</h2>
        <p className="max-w-xl text-base font-bold sm:text-lg md:text-xl">Bridge the gap between your passion and real problems today.</p>
        <Link to="/register">
          <Button className="h-14 px-8 text-lg bg-black sm:h-16 sm:px-12 sm:text-2xl">Join Marketplace</Button>
        </Link>
      </section>
    </div>
  );
};

export default Landing;
