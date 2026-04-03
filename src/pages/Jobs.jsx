import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Briefcase, Building2, MapPin, DollarSign, ArrowRight, Star, Lock, Clock, Users, CheckCircle2, XCircle, X, FileText, Upload } from 'lucide-react';

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applyMsg, setApplyMsg] = useState('');
  const [userApps, setUserApps] = useState([]);
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  useEffect(() => {
    Promise.all([
      fetch('/api/jobs').then(r => r.json()),
      token ? fetch('/api/applications/user', { headers }).then(r => r.json()).catch(() => []) : Promise.resolve([])
    ]).then(([jobsData, apps]) => {
      setJobs(Array.isArray(jobsData) ? jobsData : []);
      setUserApps(Array.isArray(apps) ? apps : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const hasApplied = (jobId) => userApps.some(a => a.jobId === jobId);
  const isLocked = (job) => (user.level || 1) < (job.minLevel || 1);

  const applyForJob = async (jobId) => {
    try {
      const res = await fetch(`/api/apply/${jobId}`, { method: 'POST', headers });
      const data = await res.json();
      if (res.ok) {
        setApplyMsg('✅ ' + data.message);
        setUserApps(prev => [...prev, data.application]);
        if (data.user) localStorage.setItem('user', JSON.stringify(data.user));
        setTimeout(() => setApplyMsg(''), 3000);
      } else {
        setApplyMsg('❌ ' + data.message);
        setTimeout(() => setApplyMsg(''), 3000);
      }
    } catch (e) { setApplyMsg('❌ Network error'); }
  };

  const diffColor = (level) => {
    if (level >= 8) return 'text-red-400 bg-red-500/10 border-red-500/30';
    if (level >= 5) return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
    return 'text-green-400 bg-green-500/10 border-green-500/30';
  };

  if (loading) return <div className="text-center py-20 text-slate-400 font-bold">Loading jobs...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3"><Briefcase className="w-8 h-8 text-cyan-400" /> Job Quest Board</h1>
          <p className="text-slate-400 mt-1">Apply for positions and earn XP. Higher levels unlock better jobs!</p>
        </div>
        <div className="glass-panel px-4 py-2 rounded-lg text-sm font-bold text-slate-300">
          Your Level: <span className="text-cyan-400">{user.level || 1}</span>
        </div>
      </div>

      {applyMsg && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-3 rounded-xl border border-cyan-500/30 text-center font-bold text-sm">{applyMsg}</motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {jobs.map((job, idx) => {
          const locked = isLocked(job);
          const applied = hasApplied(job._id);
          return (
            <motion.div key={job._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.06 }}
              className={`glass-panel rounded-2xl p-6 border transition-all relative overflow-hidden group ${locked ? 'border-slate-700/50 opacity-60' : applied ? 'border-green-500/30' : 'border-slate-700 hover:border-cyan-500/40'}`}>
              {locked && <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center z-10 backdrop-blur-sm rounded-2xl"><Lock className="w-8 h-8 text-slate-500" /><span className="ml-2 font-bold text-slate-400">Level {job.minLevel} required</span></div>}
              
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-slate-800 rounded-xl border border-slate-600 flex items-center justify-center"><Building2 className="text-slate-300 w-6 h-6" /></div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{job.title}</h3>
                    <p className="text-sm text-slate-400">{job.company}</p>
                  </div>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${diffColor(job.minLevel)}`}>Lvl {job.minLevel}+</span>
              </div>

              <p className="text-sm text-slate-400 mb-4 line-clamp-2">{job.description}</p>

              <div className="flex flex-wrap gap-2 mb-3">
                <span className="flex items-center gap-1 text-xs font-medium text-slate-300 bg-slate-800 px-2 py-1 rounded"><MapPin className="w-3 h-3" /> {job.location}</span>
                <span className="flex items-center gap-1 text-xs font-medium text-slate-300 bg-slate-800 px-2 py-1 rounded"><DollarSign className="w-3 h-3" /> {job.salary}</span>
                {job.deadline && <span className="flex items-center gap-1 text-xs font-medium text-slate-300 bg-slate-800 px-2 py-1 rounded"><Clock className="w-3 h-3" /> {job.deadline}</span>}
                <span className="flex items-center gap-1 text-xs font-medium text-slate-300 bg-slate-800 px-2 py-1 rounded"><Users className="w-3 h-3" /> {job.applicantCount || 0} applied</span>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {(job.skillsRequired || job.requirements || []).slice(0, 4).map(s => (
                  <span key={s} className="text-xs font-semibold px-2 py-1 bg-purple-500/10 text-purple-300 border border-purple-500/20 rounded-md">{s}</span>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <button onClick={() => setSelectedJob(job)} className="text-sm text-cyan-400 hover:text-cyan-300 font-bold transition-colors">View Details →</button>
                {applied ? (
                  <span className="flex items-center gap-1 text-green-400 font-bold text-sm"><CheckCircle2 className="w-4 h-4" /> Applied</span>
                ) : !locked ? (
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => applyForJob(job._id)}
                    className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 px-5 py-2 rounded-xl font-bold text-white text-sm shadow-[0_3px_0_rgba(2,132,199,1)] hover:shadow-[0_1px_0_rgba(2,132,199,1)] hover:translate-y-[2px] transition-all">
                    <Star className="w-4 h-4 fill-current" /> Apply (+{job.xpReward} XP)
                  </motion.button>
                ) : null}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Job Detail Modal */}
      <AnimatePresence>
        {selectedJob && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedJob(null)}>
            <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }} onClick={e => e.stopPropagation()}
              className="glass-panel rounded-3xl p-8 border border-slate-700 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedJob.title}</h2>
                  <p className="text-cyan-400 font-medium">{selectedJob.company}</p>
                </div>
                <button onClick={() => setSelectedJob(null)} className="p-2 rounded-lg hover:bg-slate-800 transition-colors"><X className="w-5 h-5 text-slate-400" /></button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-800/50 p-3 rounded-lg"><span className="text-xs text-slate-500 font-bold">Location</span><p className="text-sm text-white font-medium">{selectedJob.location}</p></div>
                  <div className="bg-slate-800/50 p-3 rounded-lg"><span className="text-xs text-slate-500 font-bold">Package</span><p className="text-sm text-white font-medium">{selectedJob.salary}</p></div>
                  <div className="bg-slate-800/50 p-3 rounded-lg"><span className="text-xs text-slate-500 font-bold">Deadline</span><p className="text-sm text-white font-medium">{selectedJob.deadline || 'Open'}</p></div>
                  <div className="bg-slate-800/50 p-3 rounded-lg"><span className="text-xs text-slate-500 font-bold">Min Level</span><p className="text-sm text-white font-medium">Level {selectedJob.minLevel}</p></div>
                </div>

                <div><h4 className="text-sm font-bold text-slate-400 mb-2">Description</h4><p className="text-slate-300 text-sm leading-relaxed">{selectedJob.description}</p></div>

                {selectedJob.eligibility && <div><h4 className="text-sm font-bold text-slate-400 mb-2">Eligibility</h4><p className="text-slate-300 text-sm">{selectedJob.eligibility}</p></div>}

                <div>
                  <h4 className="text-sm font-bold text-slate-400 mb-2">Skills Required</h4>
                  <div className="flex flex-wrap gap-2">{(selectedJob.skillsRequired || selectedJob.requirements || []).map(s => <span key={s} className="text-xs font-semibold px-3 py-1 bg-purple-500/10 text-purple-300 border border-purple-500/20 rounded-md">{s}</span>)}</div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                  <span className="text-sm text-slate-400">{selectedJob.applicantCount || 0} applicants</span>
                  {hasApplied(selectedJob._id) ? (
                    <span className="flex items-center gap-2 text-green-400 font-bold"><CheckCircle2 className="w-5 h-5" /> Already Applied</span>
                  ) : !isLocked(selectedJob) ? (
                    <motion.button whileHover={{ scale: 1.05 }} onClick={() => { applyForJob(selectedJob._id); setSelectedJob(null); }}
                      className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-3 rounded-xl font-bold text-white">
                      <Star className="w-4 h-4 fill-current" /> Apply Now (+{selectedJob.xpReward} XP)
                    </motion.button>
                  ) : <span className="text-red-400 font-bold text-sm">Level {selectedJob.minLevel} required</span>}
                </div>

                {user.resume && <div className="flex items-center gap-2 text-xs text-green-400 mt-2"><FileText className="w-3 h-3" /> Your resume will be auto-attached</div>}
                {!user.resume && <div className="flex items-center gap-2 text-xs text-yellow-400 mt-2"><Upload className="w-3 h-3" /> Upload a resume from your Profile for best results</div>}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default Jobs;
