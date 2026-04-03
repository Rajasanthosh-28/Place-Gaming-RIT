import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Target, CheckCircle2, Lock, Gift, Sparkles } from 'lucide-react';

const Missions = () => {
  const [missions, setMissions] = useState([]);
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetch('/api/missions', { headers }).then(r => r.json()).then(d => { if (Array.isArray(d)) setMissions(d); }).catch(console.error);
  }, []);

  const completeMission = async (id) => {
    try {
      const res = await fetch(`/api/missions/${id}/complete`, { method: 'POST', headers });
      const data = await res.json();
      if (res.ok) {
        setMissions(prev => prev.map(m => m._id === id ? { ...m, completed: true } : m));
        if (data.user) localStorage.setItem('user', JSON.stringify(data.user));
      } else {
        alert(data.message);
      }
    } catch (e) { console.error(e); }
  };

  const typeIcons = { profile: '👤', quiz: '🧠', job: '💼', coding: '💻', level: '⭐', speed: '⚡', badges: '🏆', puzzle: '🧩' };
  const typeColors = { profile: 'from-blue-500 to-indigo-600', quiz: 'from-cyan-500 to-blue-600', job: 'from-orange-500 to-red-500', coding: 'from-green-500 to-emerald-600', level: 'from-yellow-500 to-amber-600', speed: 'from-pink-500 to-rose-600', badges: 'from-purple-500 to-violet-600', puzzle: 'from-fuchsia-500 to-pink-600' };

  const containerV = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
  const itemV = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } };

  return (
    <motion.div variants={containerV} initial="hidden" animate="show" className="space-y-8 max-w-4xl mx-auto">
      <div className="text-center space-y-3">
        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-[0_0_25px_rgba(245,158,11,0.4)]">
          <Target className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-500 uppercase">Mission Board</h1>
        <p className="text-slate-400 text-lg">Complete missions to earn XP and coins!</p>
      </div>

      <div className="flex gap-4 justify-center">
        <div className="glass-panel px-4 py-2 rounded-lg border border-slate-700 text-sm font-bold">
          <span className="text-green-400">{missions.filter(m => m.completed).length}</span>
          <span className="text-slate-500"> / {missions.length} completed</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {missions.map((m) => {
          const icon = typeIcons[m.type] || '🎯';
          const gradient = typeColors[m.type] || 'from-slate-500 to-slate-600';
          return (
            <motion.div key={m._id} variants={itemV} whileHover={!m.completed ? { y: -5, scale: 1.02 } : {}}
              className={`glass-panel rounded-2xl p-6 border transition-all relative overflow-hidden ${m.completed ? 'border-green-500/30 opacity-75' : 'border-slate-700 hover:border-amber-500/50'}`}>
              {m.completed && <div className="absolute top-3 right-3"><CheckCircle2 className="w-6 h-6 text-green-400" /></div>}
              <div className="flex items-start gap-4">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-2xl shadow-lg flex-shrink-0`}>
                  {icon}
                </div>
                <div className="flex-1">
                  <h3 className={`text-lg font-bold ${m.completed ? 'text-slate-400 line-through' : 'text-white'}`}>{m.title}</h3>
                  <p className="text-sm text-slate-400 mt-1">{m.description}</p>
                  <div className="flex items-center gap-3 mt-3">
                    <span className="text-xs font-bold text-cyan-400 bg-cyan-950/50 px-2 py-1 rounded">{m.xpReward} XP</span>
                    <span className="text-xs font-bold text-yellow-400 bg-yellow-950/50 px-2 py-1 rounded">{m.coinsReward} 💰</span>
                  </div>
                </div>
              </div>
              {!m.completed && (
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => completeMission(m._id)}
                  className="w-full mt-4 flex items-center justify-center gap-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 py-2.5 rounded-xl font-bold text-white text-sm shadow-[0_3px_0_rgba(194,65,12,1)] hover:shadow-[0_1px_0_rgba(194,65,12,1)] hover:translate-y-[2px] transition-all">
                  <Gift className="w-4 h-4" /> Claim Reward
                </motion.button>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};
export default Missions;
