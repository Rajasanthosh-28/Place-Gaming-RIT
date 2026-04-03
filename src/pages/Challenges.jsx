import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { Trophy, Clock, Zap, CheckCircle2, XCircle, ArrowRight, RotateCcw, Sparkles, Shield, Brain } from 'lucide-react';

const Challenges = () => {
  const [phase, setPhase] = useState('select'); // select | playing | result
  const [category, setCategory] = useState('mixed');
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [timer, setTimer] = useState(30);
  const [totalTime, setTotalTime] = useState(0);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef(null);

  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const categories = [
    { id: 'mixed', label: 'Mixed Arena', icon: Sparkles, color: 'from-cyan-500 to-blue-500', desc: 'All categories randomized' },
    { id: 'technical', label: 'Tech Combat', icon: Shield, color: 'from-purple-500 to-indigo-500', desc: 'DSA, OS, DBMS, Networks' },
    { id: 'aptitude', label: 'Brain Quest', icon: Brain, color: 'from-orange-500 to-red-500', desc: 'Speed math & logic' },
    { id: 'programming', label: 'Code Blitz', icon: Zap, color: 'from-green-500 to-emerald-500', desc: 'Programming concepts' },
  ];

  // Start quiz
  const startQuiz = async (cat) => {
    setCategory(cat);
    setLoading(true);
    try {
      const res = await fetch(`/api/quiz?category=${cat}&limit=5`, { headers });
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) {
        alert('No questions available for this category. Try Mixed Arena!');
        setLoading(false);
        return;
      }
      setQuestions(data);
      setCurrent(0);
      setAnswers([]);
      setSelected(null);
      setTimer(30);
      setTotalTime(0);
      setResult(null);
      setPhase('playing');
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  // Timer
  useEffect(() => {
    if (phase !== 'playing') return;
    timerRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          handleNext();
          return 30;
        }
        return prev - 1;
      });
      setTotalTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase, current]);

  // Select answer
  const handleSelect = (idx) => {
    if (selected !== null) return;
    setSelected(idx);
  };

  // Next question or submit
  const handleNext = () => {
    clearInterval(timerRef.current);
    const newAnswers = [...answers, { questionId: questions[current]._id, selectedAnswer: selected ?? -1 }];
    setAnswers(newAnswers);

    if (current + 1 >= questions.length) {
      submitQuiz(newAnswers);
    } else {
      setCurrent(prev => prev + 1);
      setSelected(null);
      setTimer(30);
    }
  };

  // Submit
  const submitQuiz = async (finalAnswers) => {
    setPhase('result');
    try {
      const res = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers,
        body: JSON.stringify({ answers: finalAnswers, timeTaken: totalTime, category })
      });
      const data = await res.json();
      setResult(data);

      // Update localStorage user
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user) {
        user.xp = (user.xp || 0) + (data.xpEarned || 0);
        user.coins = (user.coins || 0) + (data.coinsEarned || 0);
        user.level = data.level || user.level;
        user.badges = data.newBadges || user.badges;
        user.quizzesTaken = (user.quizzesTaken || 0) + 1;
        localStorage.setItem('user', JSON.stringify(user));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ── SELECT SCREEN ──
  if (phase === 'select') {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 max-w-4xl mx-auto">
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-400 uppercase tracking-wider">
            Challenge Arena
          </h1>
          <p className="text-slate-400 text-lg">Choose your battle category and earn XP!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <motion.button
                key={cat.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.03, y: -5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => startQuiz(cat.id)}
                disabled={loading}
                className="glass-panel p-8 rounded-2xl border border-slate-700 text-left hover:border-cyan-500/50 transition-all group relative overflow-hidden disabled:opacity-60"
              >
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${cat.color} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity rounded-full -translate-y-8 translate-x-8`} />
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center mb-4 shadow-lg`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-1">{cat.label}</h3>
                <p className="text-slate-400 text-sm">{cat.desc}</p>
                <div className="mt-4 flex items-center gap-2 text-cyan-400 text-sm font-bold">
                  <span>5 Questions</span>
                  <span className="text-slate-600">•</span>
                  <span>30s per Q</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-yellow-400">Up to 225 XP</span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    );
  }

  // ── PLAYING SCREEN ──
  if (phase === 'playing' && questions.length > 0) {
    const q = questions[current];
    const timerColor = timer > 15 ? 'text-green-400' : timer > 5 ? 'text-yellow-400' : 'text-red-400';
    const timerBg = timer > 15 ? 'bg-green-500' : timer > 5 ? 'bg-yellow-500' : 'bg-red-500';

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto space-y-6">
        {/* Top Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold px-3 py-1 bg-slate-800 rounded-lg border border-slate-700 text-slate-300">
              Q{current + 1}/{questions.length}
            </span>
            <div className="h-2 w-40 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
              <motion.div
                animate={{ width: `${((current + 1) / questions.length) * 100}%` }}
                className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
              />
            </div>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 bg-slate-800/80 rounded-xl border border-slate-700 ${timerColor}`}>
            <Clock className="w-5 h-5" />
            <span className="text-2xl font-mono font-bold tabular-nums">{timer}</span>
          </div>
        </div>

        {/* Timer bar */}
        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            key={`timer-${current}`}
            initial={{ width: '100%' }}
            animate={{ width: '0%' }}
            transition={{ duration: 30, ease: 'linear' }}
            className={`h-full ${timerBg}`}
          />
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="glass-panel rounded-2xl p-8 border border-slate-700"
          >
            <h2 className="text-xl md:text-2xl font-bold text-white mb-8 leading-relaxed">{q.question}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {q.options.map((opt, idx) => {
                const isSelected = selected === idx;
                return (
                  <motion.button
                    key={idx}
                    whileHover={selected === null ? { scale: 1.02 } : {}}
                    whileTap={selected === null ? { scale: 0.98 } : {}}
                    onClick={() => handleSelect(idx)}
                    className={`p-4 rounded-xl border-2 text-left font-medium transition-all ${
                      isSelected
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                        : 'bg-slate-800/50 border-slate-700 text-slate-200 hover:border-slate-500 hover:bg-slate-800'
                    }`}
                  >
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg mr-3 text-sm font-bold ${
                      isSelected ? 'bg-cyan-500 text-white' : 'bg-slate-700 text-slate-400'
                    }`}>
                      {String.fromCharCode(65 + idx)}
                    </span>
                    {opt}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Next Button */}
        <div className="flex justify-end">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleNext}
            className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 px-8 py-3 rounded-xl font-bold text-white shadow-[0_4px_0_rgba(2,132,199,1)] hover:shadow-[0_2px_0_rgba(2,132,199,1)] hover:translate-y-[2px] transition-all"
          >
            {current + 1 >= questions.length ? 'Submit' : 'Next'} <ArrowRight className="w-5 h-5" />
          </motion.button>
        </div>
      </motion.div>
    );
  }

  // ── RESULT SCREEN ──
  if (phase === 'result') {
    const pct = result?.percentage || 0;
    const isGreat = pct >= 80;

    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-lg mx-auto text-center space-y-6 py-10">
        {/* Score Ring */}
        <div className="relative w-48 h-48 mx-auto">
          <svg className="w-48 h-48 -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="#1e293b" strokeWidth="8" />
            <motion.circle
              cx="50" cy="50" r="45" fill="none"
              stroke={isGreat ? '#00f0ff' : '#f59e0b'}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={283}
              initial={{ strokeDashoffset: 283 }}
              animate={{ strokeDashoffset: 283 - (283 * pct / 100) }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-black text-white">{pct}%</span>
            <span className="text-sm text-slate-400 font-medium">Score</span>
          </div>
        </div>

        <h2 className={`text-3xl font-black ${isGreat ? 'text-cyan-400' : 'text-yellow-400'}`}>
          {isGreat ? '🎉 Outstanding!' : pct >= 50 ? '💪 Good Effort!' : '📚 Keep Practicing!'}
        </h2>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="glass-panel p-4 rounded-xl border border-slate-700">
            <div className="flex items-center justify-center gap-2 mb-1">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              <span className="font-bold text-green-400 text-2xl">{result?.score || 0}</span>
            </div>
            <span className="text-xs text-slate-400">Correct</span>
          </div>
          <div className="glass-panel p-4 rounded-xl border border-slate-700">
            <div className="flex items-center justify-center gap-2 mb-1">
              <XCircle className="w-5 h-5 text-red-400" />
              <span className="font-bold text-red-400 text-2xl">{(result?.totalQuestions || 0) - (result?.score || 0)}</span>
            </div>
            <span className="text-xs text-slate-400">Wrong</span>
          </div>
          <div className="glass-panel p-4 rounded-xl border border-cyan-500/30">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Zap className="w-5 h-5 text-cyan-400" />
              <span className="font-bold text-cyan-400 text-2xl">+{result?.xpEarned || 0}</span>
            </div>
            <span className="text-xs text-slate-400">XP Earned</span>
          </div>
          <div className="glass-panel p-4 rounded-xl border border-yellow-500/30">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <span className="font-bold text-yellow-400 text-2xl">+{result?.coinsEarned || 0}</span>
            </div>
            <span className="text-xs text-slate-400">Coins Earned</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 justify-center pt-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setPhase('select')}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-6 py-3 rounded-xl font-bold border border-slate-600 transition-colors"
          >
            <RotateCcw className="w-4 h-4" /> Play Again
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return null;
};

export default Challenges;
