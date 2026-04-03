import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Code2, Play, CheckCircle2, XCircle, RotateCcw, Trophy, ArrowLeft } from 'lucide-react';

const CodingChallenge = () => {
  const [challenges, setChallenges] = useState([]);
  const [selected, setSelected] = useState(null);
  const [code, setCode] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetch('/api/coding', { headers }).then(r => r.json()).then(d => { if (Array.isArray(d)) setChallenges(d); }).catch(console.error);
  }, []);

  const selectChallenge = async (id) => {
    try {
      const res = await fetch(`/api/coding/${id}`, { headers });
      const data = await res.json();
      setSelected(data);
      setCode(data.starterCode || '');
      setResult(null);
    } catch (err) {
      console.error('Failed to load challenge:', err);
    }
  };

  const runCode = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/coding/${selected._id}/submit`, { method: 'POST', headers, body: JSON.stringify({ code }) });
      const data = await res.json();
      setResult(data);
      if (data.xpEarned > 0) {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        user.xp = (user.xp || 0) + data.xpEarned;
        user.coins = (user.coins || 0) + data.coinsEarned;
        user.level = data.level || user.level;
        localStorage.setItem('user', JSON.stringify(user));
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  // Challenge list
  if (!selected) {
    const diffColor = { easy: 'text-green-400 border-green-500/30 bg-green-500/10', medium: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10', hard: 'text-red-400 border-red-500/30 bg-red-500/10' };
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 max-w-4xl mx-auto">
        <div className="text-center space-y-3">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-[0_0_25px_rgba(16,185,129,0.4)]">
            <Code2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-emerald-500 uppercase">Coding Arena</h1>
          <p className="text-slate-400 text-lg">Solve problems, pass test cases, earn XP!</p>
        </div>
        <div className="space-y-4">
          {challenges.map((ch, i) => (
            <motion.button key={ch._id} initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} whileHover={{ x: 5, scale: 1.01 }}
              onClick={() => selectChallenge(ch._id)} className="w-full glass-panel p-6 rounded-2xl border border-slate-700 hover:border-green-500/50 text-left flex items-center justify-between transition-all">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center font-mono font-bold text-green-400 border border-slate-700">{i + 1}</div>
                <div>
                  <h3 className="text-lg font-bold text-white">{ch.title}</h3>
                  <p className="text-sm text-slate-400">{ch.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${diffColor[ch.difficulty]}`}>{ch.difficulty}</span>
                <span className="text-cyan-400 font-bold text-sm">{ch.xpReward} XP</span>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>
    );
  }

  // Code editor
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 max-w-5xl mx-auto">
      <button onClick={() => { setSelected(null); setResult(null); }} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-bold">
        <ArrowLeft className="w-4 h-4" /> Back to Challenges
      </button>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Problem */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-700 space-y-4">
          <h2 className="text-2xl font-bold text-white">{selected.title}</h2>
          <p className="text-slate-300">{selected.description}</p>
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-slate-400 uppercase">Test Cases:</h4>
            {selected.testCases?.map((tc, i) => (
              <div key={i} className="bg-slate-900 p-3 rounded-lg border border-slate-700 font-mono text-sm">
                <span className="text-slate-500">Input:</span> <span className="text-cyan-300">{tc.input}</span>
                <br /><span className="text-slate-500">Expected:</span> <span className="text-green-300">{tc.expected}</span>
              </div>
            ))}
          </div>
          {selected.hint && <p className="text-xs text-slate-500 italic">💡 Hint: {selected.hint}</p>}
        </div>
        {/* Editor */}
        <div className="space-y-4">
          <div className="glass-panel rounded-2xl border border-slate-700 overflow-hidden">
            <div className="bg-slate-800/80 px-4 py-2 border-b border-slate-700 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-xs text-slate-400 ml-2 font-mono">solution.js</span>
            </div>
            <textarea value={code} onChange={e => setCode(e.target.value)} spellCheck="false"
              className="w-full h-64 bg-slate-900 text-green-300 font-mono text-sm p-4 resize-none focus:outline-none leading-relaxed" />
          </div>
          <div className="flex gap-3">
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={runCode} disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 py-3 rounded-xl font-bold text-white shadow-[0_4px_0_rgba(5,150,105,1)] hover:shadow-[0_2px_0_rgba(5,150,105,1)] hover:translate-y-[2px] transition-all disabled:opacity-50">
              <Play className="w-5 h-5" /> {loading ? 'Running...' : 'Run Code'}
            </motion.button>
            <button onClick={() => setCode(selected.starterCode || '')} className="px-4 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-600 transition-colors">
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
          {result && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className={`p-6 rounded-xl border ${result.percentage === 100 ? 'bg-green-900/20 border-green-500/50' : 'bg-slate-800/50 border-slate-700'}`}>
              <div className="flex items-center gap-3 mb-3">
                {result.percentage === 100 ? <CheckCircle2 className="w-6 h-6 text-green-400" /> : <XCircle className="w-6 h-6 text-yellow-400" />}
                <span className="font-bold text-lg text-white">{result.passed}/{result.total} Tests Passed</span>
              </div>
              <div className="flex gap-3">
                <span className="text-cyan-400 font-bold text-sm">+{result.xpEarned} XP</span>
                <span className="text-yellow-400 font-bold text-sm">+{result.coinsEarned} coins</span>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
export default CodingChallenge;
