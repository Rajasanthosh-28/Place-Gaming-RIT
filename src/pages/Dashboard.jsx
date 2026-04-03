import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Target, TrendingUp, Award, Zap, Briefcase, Activity, Code2, Puzzle, Crosshair, Flame, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchCurrentUser, getLocalUser } from '../api';

const Dashboard = () => {
  const [user, setUser] = useState({ name: 'Player', totalScore: 0, missionsCompleted: 0, jobsApplied: 0, level: 1, quizzesTaken: 0, badges: ['Newcomer'] });

  useEffect(() => {
    // First load from localStorage for instant display
    const cached = getLocalUser();
    if (cached?.name) setUser(cached);

    // Then fetch fresh data from backend
    fetchCurrentUser().then(freshUser => {
      if (freshUser?.name) setUser(freshUser);
    });
  }, []);

  const metrics = [
    { title: 'Total Score', value: user.totalScore || 0, icon: Trophy, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
    { title: 'Missions', value: user.missionsCompleted || 0, icon: Target, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30' },
    { title: 'Jobs Applied', value: user.jobsApplied || 0, icon: Briefcase, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
    { title: 'Quizzes Taken', value: user.quizzesTaken || 0, icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' },
  ];

  const games = [
    { name: 'Quiz Arena', desc: 'Test your knowledge with MCQs', icon: '🧠', path: '/challenges', gradient: 'from-cyan-500 to-blue-600', shadow: 'rgba(0,240,255,0.3)' },
    { name: 'Speed Run', desc: '10 questions, 60 seconds, GO!', icon: '⚡', path: '/speed', gradient: 'from-yellow-500 to-orange-600', shadow: 'rgba(245,158,11,0.3)' },
    { name: 'Code Lab', desc: 'Solve coding challenges', icon: '💻', path: '/coding', gradient: 'from-green-500 to-emerald-600', shadow: 'rgba(16,185,129,0.3)' },
    { name: 'Puzzle Lab', desc: 'Logic & pattern puzzles', icon: '🧩', path: '/puzzles', gradient: 'from-violet-500 to-fuchsia-600', shadow: 'rgba(139,92,246,0.3)' },
    { name: 'Missions', desc: 'Complete tasks for rewards', icon: '🎯', path: '/missions', gradient: 'from-amber-500 to-red-600', shadow: 'rgba(245,158,11,0.3)' },
  ];

  const containerV = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const itemV = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300 } } };

  return (
    <motion.div variants={containerV} initial="hidden" animate="show" className="space-y-6">
      {/* Welcome */}
      <div className="flex justify-between items-end mb-4">
        <div>
          <h1 className="text-3xl font-bold"><span className="text-white">Welcome back, </span><span className="text-cyan-400">{user.name}</span></h1>
          <p className="text-slate-400 mt-1">Choose a game and start earning XP!</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 glass-panel px-4 py-2 rounded-lg">
          <Activity className="w-4 h-4 text-green-500" /><span className="text-sm font-bold text-green-400">Online</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, i) => {
          const Icon = m.icon;
          return (
            <motion.div key={i} variants={itemV} whileHover={{ scale: 1.03, y: -3 }}
              className={`glass-panel p-5 rounded-2xl border ${m.border} relative overflow-hidden group`}>
              <div className={`absolute -inset-2 opacity-0 group-hover:opacity-20 transition-opacity blur-xl ${m.bg}`} />
              <div className="relative z-10 flex items-start justify-between">
                <div>
                  <p className="text-slate-400 text-xs font-medium mb-1">{m.title}</p>
                  <h3 className="text-2xl font-black text-white">{typeof m.value === 'number' ? m.value.toLocaleString() : m.value}</h3>
                </div>
                <div className={`p-2.5 rounded-xl ${m.bg} border ${m.border}`}><Icon className={`w-5 h-5 ${m.color}`} /></div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Game Hub */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-400" /> Game Hub
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          {games.map((game, i) => (
            <motion.div key={game.name} variants={itemV} whileHover={{ y: -8, scale: 1.03 }}>
              <Link to={game.path} className="block glass-panel rounded-2xl p-6 border border-slate-700 hover:border-slate-500 transition-all group relative overflow-hidden">
                <div className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${game.gradient} opacity-10 blur-2xl group-hover:opacity-25 transition-opacity rounded-full`} />
                <div className="relative z-10">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${game.gradient} flex items-center justify-center text-2xl shadow-lg mb-4`} style={{ boxShadow: `0 8px 20px ${game.shadow}` }}>
                    {game.icon}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">{game.name}</h3>
                  <p className="text-xs text-slate-400">{game.desc}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Badges */}
      <motion.div variants={itemV} className="glass-panel rounded-2xl p-6 border border-slate-700">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-pink-400" /> Your Badges
        </h2>
        <div className="flex flex-wrap gap-3">
          {(user.badges || ['Newcomer']).map((badge, i) => (
            <motion.span key={badge} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
              className="px-4 py-2 rounded-full bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/30 text-pink-300 text-sm font-bold flex items-center gap-2">
              <Award className="w-3.5 h-3.5" /> {badge}
            </motion.span>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};
export default Dashboard;
