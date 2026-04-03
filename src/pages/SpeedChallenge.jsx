import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { Zap, Clock, CheckCircle2, XCircle, RotateCcw, Trophy, Flame } from 'lucide-react';

const SpeedChallenge = () => {
  const [phase, setPhase] = useState('intro');
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [globalTimer, setGlobalTimer] = useState(60);
  const [result, setResult] = useState(null);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const startGame = async () => {
    try {
      const res = await fetch('/api/speed', { headers });
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) return;
      setQuestions(data);
      setCurrent(0);
      setAnswers([]);
      setGlobalTimer(60);
      setResult(null);
      startTimeRef.current = Date.now();
      setPhase('playing');
    } catch (err) {
      console.error('Failed to start speed challenge:', err);
    }
  };

  useEffect(() => {
    if (phase !== 'playing') return;
    timerRef.current = setInterval(() => {
      setGlobalTimer(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); submitGame(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase]);

  const selectAnswer = (idx) => {
    const newAnswers = [...answers, { questionId: questions[current]._id, selectedAnswer: idx }];
    setAnswers(newAnswers);
    if (current + 1 >= questions.length) {
      clearInterval(timerRef.current);
      submitGameWithAnswers(newAnswers);
    } else {
      setCurrent(prev => prev + 1);
    }
  };

  const submitGame = () => submitGameWithAnswers(answers);

  const submitGameWithAnswers = async (finalAnswers) => {
    setPhase('result');
    const totalTime = Math.round((Date.now() - startTimeRef.current) / 1000);
    try {
      const res = await fetch('/api/speed/submit', { method: 'POST', headers, body: JSON.stringify({ answers: finalAnswers, totalTime }) });
      const data = await res.json();
      setResult(data);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      user.xp = (user.xp || 0) + (data.xpEarned || 0);
      user.coins = (user.coins || 0) + (data.coinsEarned || 0);
      user.level = data.level || user.level;
      user.badges = data.newBadges || user.badges;
      localStorage.setItem('user', JSON.stringify(user));
    } catch (err) { console.error(err); }
  };

  if (phase === 'intro') {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto text-center py-16 space-y-8">
        <div className="w-24 h-24 mx-auto bg-gradient-to-br from-yellow-500 to-orange-600 rounded-3xl flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.4)]">
          <Zap className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-500 uppercase tracking-wider">Speed Challenge</h1>
        <p className="text-slate-400 text-lg max-w-md mx-auto">Answer 10 rapid-fire questions in 60 seconds. The faster you go, the more bonus XP you earn!</p>
        <div className="flex justify-center gap-6 text-sm font-bold">
          <span className="bg-slate-800 border border-slate-700 px-4 py-2 rounded-lg">⏱️ 60 Seconds</span>
          <span className="bg-slate-800 border border-slate-700 px-4 py-2 rounded-lg">❓ 10 Questions</span>
          <span className="bg-slate-800 border border-slate-700 px-4 py-2 rounded-lg">⚡ Time Bonus</span>
        </div>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={startGame}
          className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 px-12 py-4 rounded-2xl text-xl font-black text-white shadow-[0_4px_0_rgba(194,65,12,1)] hover:shadow-[0_2px_0_rgba(194,65,12,1)] hover:translate-y-[2px] transition-all">
          🚀 START CHALLENGE
        </motion.button>
      </motion.div>
    );
  }

  if (phase === 'playing' && questions.length > 0) {
    const q = questions[current];
    const timerColor = globalTimer > 30 ? 'text-green-400' : globalTimer > 10 ? 'text-yellow-400' : 'text-red-400 animate-pulse';
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <span className="text-sm font-bold px-3 py-1 bg-slate-800 rounded-lg border border-slate-700">{current + 1}/{questions.length}</span>
          <div className={`flex items-center gap-2 px-4 py-2 bg-slate-800/80 rounded-xl border border-slate-700 ${timerColor}`}>
            <Clock className="w-5 h-5" />
            <span className="text-3xl font-mono font-black tabular-nums">{globalTimer}s</span>
          </div>
        </div>
        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
          <motion.div animate={{ width: `${(globalTimer / 60) * 100}%` }} className="h-full bg-gradient-to-r from-yellow-500 to-orange-500" />
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={current} initial={{ opacity: 0, x: 80 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -80 }} transition={{ duration: 0.2 }}
            className="glass-panel rounded-2xl p-8 border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-8">{q.question}</h2>
            <div className="grid grid-cols-2 gap-4">
              {q.options.map((opt, idx) => (
                <motion.button key={idx} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => selectAnswer(idx)}
                  className="p-4 rounded-xl border-2 bg-slate-800/50 border-slate-700 text-slate-200 hover:border-yellow-500 hover:bg-yellow-500/10 font-medium text-left transition-all">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-700 mr-3 text-sm font-bold">{String.fromCharCode(65 + idx)}</span>
                  {opt}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    );
  }

  if (phase === 'result') {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-lg mx-auto text-center space-y-6 py-10">
        <Flame className="w-16 h-16 mx-auto text-orange-500 drop-shadow-[0_0_15px_rgba(249,115,22,0.6)]" />
        <h2 className="text-3xl font-black text-orange-400">{(result?.percentage || 0) >= 70 ? '🔥 Speed Demon!' : '💨 Keep Racing!'}</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="glass-panel p-4 rounded-xl border border-green-500/30"><CheckCircle2 className="w-5 h-5 text-green-400 mx-auto mb-1" /><span className="text-2xl font-black text-green-400">{result?.correct || 0}</span><p className="text-xs text-slate-400">Correct</p></div>
          <div className="glass-panel p-4 rounded-xl border border-red-500/30"><XCircle className="w-5 h-5 text-red-400 mx-auto mb-1" /><span className="text-2xl font-black text-red-400">{(result?.total || 0) - (result?.correct || 0)}</span><p className="text-xs text-slate-400">Wrong</p></div>
          <div className="glass-panel p-4 rounded-xl border border-cyan-500/30"><Zap className="w-5 h-5 text-cyan-400 mx-auto mb-1" /><span className="text-2xl font-black text-cyan-400">+{result?.xpEarned || 0}</span><p className="text-xs text-slate-400">XP Earned</p></div>
          <div className="glass-panel p-4 rounded-xl border border-yellow-500/30"><Trophy className="w-5 h-5 text-yellow-400 mx-auto mb-1" /><span className="text-2xl font-black text-yellow-400">+{result?.timeBonus || 0}</span><p className="text-xs text-slate-400">Time Bonus</p></div>
        </div>
        <motion.button whileHover={{ scale: 1.05 }} onClick={() => setPhase('intro')} className="flex items-center gap-2 mx-auto bg-slate-800 hover:bg-slate-700 px-6 py-3 rounded-xl font-bold border border-slate-600">
          <RotateCcw className="w-4 h-4" /> Play Again
        </motion.button>
      </motion.div>
    );
  }
  return null;
};
export default SpeedChallenge;
