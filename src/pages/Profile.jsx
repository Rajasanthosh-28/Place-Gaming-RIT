import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { User, Award, Flame, Trophy, Briefcase, Target, Zap, Coins, Shield, LogOut, TrendingUp, FileText, Upload, X, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API = 'http://localhost:5000';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');
  const [newSkill, setNewSkill] = useState('');
  const fileRef = useRef();

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    const lg = JSON.parse(localStorage.getItem('user') || 'null');
    setUser(lg);
  }, []);

  const handleLogout = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/login'); };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('resume', file);
    try {
      const res = await fetch(`${API}/api/upload-resume`, { method: 'POST', headers, body: formData });
      const data = await res.json();
      if (res.ok) {
        setUploadMsg('✅ Resume uploaded!');
        const updated = { ...user, resume: data.resumeUrl, resumeUploadDate: new Date().toISOString() };
        setUser(updated);
        localStorage.setItem('user', JSON.stringify(updated));
      } else { setUploadMsg('❌ ' + data.message); }
    } catch { setUploadMsg('❌ Upload failed'); }
    setUploading(false);
    setTimeout(() => setUploadMsg(''), 3000);
  };

  const addSkill = async () => {
    if (!newSkill.trim()) return;
    const updatedSkills = [...(user.skills || []), newSkill.trim()];
    try {
      const res = await fetch(`${API}/api/auth/skills`, { method: 'PUT', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ skills: updatedSkills }) });
      if (res.ok) { const updated = { ...user, skills: updatedSkills }; setUser(updated); localStorage.setItem('user', JSON.stringify(updated)); setNewSkill(''); }
    } catch (e) { console.error(e); }
  };

  const removeSkill = async (skill) => {
    const updatedSkills = (user.skills || []).filter(s => s !== skill);
    try {
      const res = await fetch(`${API}/api/auth/skills`, { method: 'PUT', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ skills: updatedSkills }) });
      if (res.ok) { const updated = { ...user, skills: updatedSkills }; setUser(updated); localStorage.setItem('user', JSON.stringify(updated)); }
    } catch (e) { console.error(e); }
  };

  if (!user) return <div className="text-center text-slate-400 py-20">Loading profile...</div>;

  const stats = [
    { label: 'Level', value: user.level || 1, icon: TrendingUp, color: 'text-cyan-400', border: 'border-cyan-500/30' },
    { label: 'XP', value: user.xp || 0, icon: Zap, color: 'text-blue-400', border: 'border-blue-500/30' },
    { label: 'Coins', value: user.coins || 0, icon: Coins, color: 'text-yellow-400', border: 'border-yellow-500/30' },
    { label: 'Streak', value: user.streak || 0, icon: Flame, color: 'text-orange-400', border: 'border-orange-500/30' },
    { label: 'Best Streak', value: user.highestStreak || 0, icon: Flame, color: 'text-red-400', border: 'border-red-500/30' },
    { label: 'Total Score', value: user.totalScore || 0, icon: Trophy, color: 'text-purple-400', border: 'border-purple-500/30' },
    { label: 'Rank', value: user.rankTitle || 'Rookie', icon: Shield, color: 'text-indigo-400', border: 'border-indigo-500/30' },
    { label: 'Badges', value: (user.badges || []).length, icon: Award, color: 'text-pink-400', border: 'border-pink-500/30' },
    { label: 'Missions', value: user.missionsCompleted || 0, icon: Target, color: 'text-emerald-400', border: 'border-emerald-500/30' },
    { label: 'Jobs Applied', value: user.jobsApplied || 0, icon: Briefcase, color: 'text-amber-400', border: 'border-amber-500/30' },
    { label: 'Interviews', value: user.interviewsUnlocked || 0, icon: User, color: 'text-teal-400', border: 'border-teal-500/30' },
    { label: 'Energy', value: `${user.energy ?? 100}/100`, icon: Zap, color: 'text-green-400', border: 'border-green-500/30' },
    { label: 'Quizzes', value: user.quizzesTaken || 0, icon: Target, color: 'text-sky-400', border: 'border-sky-500/30' },
  ];

  const cv = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
  const iv = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } };

  return (
    <motion.div variants={cv} initial="hidden" animate="show" className="space-y-8 max-w-5xl mx-auto pb-10">
      {/* Header */}
      <motion.div variants={iv} className="glass-panel rounded-3xl p-8 border border-slate-700 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-cyan-600/20 to-purple-600/20 blur-xl" />
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
          <div className="relative">
            <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full blur-md opacity-40" />
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}&backgroundColor=0f172a`} alt="avatar" className="relative w-28 h-28 rounded-full border-4 border-slate-800" />
            <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-cyan-500 to-blue-500 px-3 py-1 rounded-full text-xs font-bold border-2 border-slate-900 shadow-lg">LVL {user.level || 1}</div>
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-black text-white">{user.name}</h1>
            <p className="text-slate-400 font-medium">{user.email}</p>
            <div className="flex flex-wrap items-center gap-3 mt-3 justify-center md:justify-start">
              <span className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 px-3 py-1 rounded-full text-sm font-bold text-purple-300">{user.rankTitle || 'Rookie'}</span>
              <span className="bg-slate-800 border border-slate-700 px-3 py-1 rounded-full text-sm font-bold text-slate-300">{user.role || 'user'}</span>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 px-5 py-2.5 rounded-xl font-bold transition-colors">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </motion.div>

      {/* Resume */}
      <motion.div variants={iv} className="glass-panel rounded-2xl p-6 border border-slate-700">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><FileText className="w-5 h-5 text-blue-400" /> Resume</h2>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {user.resume ? (
            <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/30 px-4 py-3 rounded-xl flex-1">
              <FileText className="w-5 h-5 text-green-400" />
              <div><p className="text-sm font-bold text-green-300">Resume Uploaded</p><p className="text-xs text-slate-400">{user.resumeUploadDate ? new Date(user.resumeUploadDate).toLocaleDateString() : 'Recently'}</p></div>
              <a href={`${API}${user.resume}`} target="_blank" rel="noreferrer" className="ml-auto text-xs font-bold text-cyan-400 hover:text-cyan-300">View / Download</a>
            </div>
          ) : (
            <div className="flex items-center gap-3 bg-yellow-500/10 border border-yellow-500/30 px-4 py-3 rounded-xl flex-1">
              <Upload className="w-5 h-5 text-yellow-400" /><p className="text-sm font-bold text-yellow-300">No resume uploaded yet</p>
            </div>
          )}
          <input type="file" ref={fileRef} accept=".pdf,.doc,.docx" onChange={handleResumeUpload} className="hidden" />
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => fileRef.current?.click()} disabled={uploading}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 px-5 py-3 rounded-xl font-bold text-white text-sm shadow-[0_3px_0_rgba(67,56,202,1)] hover:shadow-[0_1px_0_rgba(67,56,202,1)] hover:translate-y-[2px] transition-all disabled:opacity-50">
            <Upload className="w-4 h-4" /> {uploading ? 'Uploading...' : user.resume ? 'Replace Resume' : 'Upload Resume'}
          </motion.button>
        </div>
        {uploadMsg && <p className="mt-3 text-sm font-bold text-center">{uploadMsg}</p>}
      </motion.div>

      {/* Skills */}
      <motion.div variants={iv} className="glass-panel rounded-2xl p-6 border border-slate-700">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Zap className="w-5 h-5 text-cyan-400" /> Skills</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {(user.skills || []).map(skill => (
            <span key={skill} className="flex items-center gap-1 px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-sm font-bold rounded-lg">
              {skill}<button onClick={() => removeSkill(skill)} className="ml-1 hover:text-red-400 transition-colors"><X className="w-3 h-3" /></button>
            </span>
          ))}
          {(user.skills || []).length === 0 && <span className="text-sm text-slate-500">No skills added yet</span>}
        </div>
        <div className="flex gap-2">
          <input value={newSkill} onChange={e => setNewSkill(e.target.value)} onKeyDown={e => e.key === 'Enter' && addSkill()} placeholder="Add a skill (e.g. React)"
            className="flex-1 bg-slate-800/50 border border-slate-700 text-slate-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-cyan-500 placeholder:text-slate-500" />
          <motion.button whileHover={{ scale: 1.05 }} onClick={addSkill} className="bg-cyan-600 hover:bg-cyan-500 px-4 rounded-xl font-bold text-white transition-colors"><Plus className="w-4 h-4" /></motion.button>
        </div>
      </motion.div>

      {/* XP */}
      <motion.div variants={iv} className="glass-panel rounded-2xl p-6 border border-slate-700">
        <div className="flex justify-between text-sm font-bold text-slate-400 mb-2">
          <span>Level {user.level || 1} → Level {(user.level || 1) + 1}</span>
          <span>{user.xp || 0} / {(user.level || 1) * 1000} XP</span>
        </div>
        <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700">
          <motion.div initial={{ width: 0 }} animate={{ width: `${((user.xp || 0) / ((user.level || 1) * 1000)) * 100}%` }} transition={{ duration: 1.2 }} className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 relative">
            <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem]" />
          </motion.div>
        </div>
      </motion.div>

      {/* Stats */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Trophy className="w-5 h-5 text-yellow-400" /> Player Statistics</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {stats.map(s => { const Icon = s.icon; return (
            <motion.div key={s.label} variants={iv} whileHover={{ scale: 1.05, y: -3 }} className={`glass-panel rounded-xl p-4 border ${s.border} text-center group hover:shadow-lg transition-shadow`}>
              <Icon className={`w-6 h-6 mx-auto mb-2 ${s.color} group-hover:scale-110 transition-transform`} />
              <div className="text-2xl font-black text-white">{s.value}</div>
              <div className="text-xs text-slate-400 font-semibold mt-1 uppercase tracking-wider">{s.label}</div>
            </motion.div>
          ); })}
        </div>
      </div>

      {/* Badges */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Award className="w-5 h-5 text-pink-400" /> Earned Badges</h2>
        <div className="flex flex-wrap gap-3">
          {(user.badges || []).map((badge, i) => (
            <motion.div key={badge} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
              className="glass-panel px-4 py-2.5 rounded-xl border border-pink-500/30 flex items-center gap-2 shadow-[0_0_10px_rgba(236,72,153,0.1)]">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center"><Award className="w-4 h-4 text-white" /></div>
              <span className="font-bold text-sm text-pink-200">{badge}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
export default Profile;
