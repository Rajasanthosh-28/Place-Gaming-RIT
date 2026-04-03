import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { FileCheck, Clock, CheckCircle2, XCircle, Star, Briefcase } from 'lucide-react';

const Applications = () => {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetch('/api/applications/user', { headers }).then(r => r.json()).then(data => { if (Array.isArray(data)) setApps(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const statusStyle = {
    Applied: { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', icon: Clock },
    Shortlisted: { color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30', icon: CheckCircle2 },
    Rejected: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', icon: XCircle },
    Hired: { color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', icon: Star },
  };

  const containerV = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const itemV = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } };

  return (
    <motion.div variants={containerV} initial="hidden" animate="show" className="space-y-6 max-w-4xl mx-auto">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.4)]">
          <FileCheck className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-500 uppercase">My Applications</h1>
        <p className="text-slate-400">Track the status of your job applications</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {['Applied', 'Shortlisted', 'Hired', 'Rejected'].map(s => {
          const st = statusStyle[s];
          const count = apps.filter(a => a.status === s).length;
          return (
            <motion.div key={s} variants={itemV} className={`glass-panel p-4 rounded-xl border ${st.border} text-center`}>
              <span className={`text-2xl font-black ${st.color}`}>{count}</span>
              <p className="text-xs text-slate-400 font-bold mt-1">{s}</p>
            </motion.div>
          );
        })}
      </div>

      {loading ? <p className="text-center text-slate-400">Loading...</p> : apps.length === 0 ? (
        <div className="glass-panel rounded-xl p-10 border border-slate-700 text-center">
          <Briefcase className="w-12 h-12 mx-auto mb-3 text-slate-600" />
          <p className="font-bold text-slate-400">No applications yet</p>
          <p className="text-sm text-slate-500 mt-1">Go to the Job Board and start applying!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {apps.map((app) => {
            const st = statusStyle[app.status] || statusStyle.Applied;
            const Icon = st.icon;
            return (
              <motion.div key={app._id} variants={itemV} whileHover={{ x: 5 }}
                className={`glass-panel rounded-xl p-5 border ${st.border} flex items-center justify-between transition-all`}>
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl ${st.bg} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${st.color}`} />
                  </div>
                  <div>
                    <h3 className="text-white font-bold">{app.jobTitle}</h3>
                    <p className="text-sm text-slate-400">{app.company}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-bold ${st.color}`}>{app.status}</span>
                  <p className="text-xs text-slate-500">{new Date(app.appliedDate).toLocaleDateString()}</p>
                  {app.resume && <p className="text-xs text-green-400 mt-1">📎 Resume attached</p>}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};
export default Applications;
