import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Puzzle, CheckCircle2, XCircle, Lightbulb } from 'lucide-react';

const PuzzleGame = () => {
  const [puzzles, setPuzzles] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState({ correct: 0, wrong: 0, xp: 0 });

  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetch('/api/puzzles', { headers }).then(r => r.json()).then(d => { if (Array.isArray(d)) setPuzzles(d); }).catch(console.error);
  }, []);

  const submitAnswer = async (idx) => {
    if (feedback) return;
    setSelected(idx);
    try {
      const res = await fetch('/api/puzzles/submit', { method: 'POST', headers, body: JSON.stringify({ puzzleId: puzzles[current]._id, answer: idx }) });
      const data = await res.json();
      setFeedback(data);
      setScore(prev => ({
        correct: prev.correct + (data.correct ? 1 : 0),
        wrong: prev.wrong + (data.correct ? 0 : 1),
        xp: prev.xp + (data.xpEarned || 0)
      }));
      if (data.xpEarned > 0) {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        user.xp = (user.xp || 0) + data.xpEarned;
        user.level = data.level || user.level;
        localStorage.setItem('user', JSON.stringify(user));
      }
    } catch (err) {
      console.error('Failed to submit puzzle answer:', err);
    }
  };

  const nextPuzzle = () => {
    if (current + 1 < puzzles.length) {
      setCurrent(prev => prev + 1);
      setSelected(null);
      setFeedback(null);
    }
  };

  if (puzzles.length === 0) return <div className="text-center py-20 text-slate-400">Loading puzzles...</div>;

  const p = puzzles[current];
  const diffColor = { easy: 'text-green-400 bg-green-500/10 border-green-500/30', medium: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30', hard: 'text-red-400 bg-red-500/10 border-red-500/30' };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto space-y-8">
      <div className="text-center space-y-3">
        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-violet-500 to-fuchsia-600 rounded-2xl flex items-center justify-center shadow-[0_0_25px_rgba(139,92,246,0.4)]">
          <Puzzle className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-300 to-fuchsia-500 uppercase">Puzzle Lab</h1>
      </div>

      {/* Score Bar */}
      <div className="flex justify-between items-center glass-panel p-4 rounded-xl border border-slate-700">
        <div className="flex gap-4 text-sm font-bold">
          <span className="text-green-400">✅ {score.correct}</span>
          <span className="text-red-400">❌ {score.wrong}</span>
          <span className="text-cyan-400">⚡ {score.xp} XP</span>
        </div>
        <span className="text-sm text-slate-400 font-bold">Puzzle {current + 1} / {puzzles.length}</span>
      </div>

      {/* Puzzle Card */}
      <motion.div key={current} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel rounded-2xl p-8 border border-slate-700 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-violet-400" />
            <span className="text-xs font-bold uppercase text-slate-400">{p.type} puzzle</span>
          </div>
          <span className={`text-xs font-bold px-3 py-1 rounded-full border ${diffColor[p.difficulty]}`}>{p.difficulty}</span>
        </div>

        <h2 className="text-xl md:text-2xl font-bold text-white leading-relaxed">{p.question}</h2>

        <div className="grid grid-cols-2 gap-4">
          {p.options.map((opt, idx) => {
            let btnClass = 'bg-slate-800/50 border-slate-700 text-slate-200 hover:border-violet-500 hover:bg-violet-500/10';
            if (feedback) {
              if (idx === feedback.correctAnswer) btnClass = 'bg-green-500/20 border-green-500 text-green-300';
              else if (idx === selected && !feedback.correct) btnClass = 'bg-red-500/20 border-red-500 text-red-300';
              else btnClass = 'bg-slate-800/30 border-slate-700/50 text-slate-500';
            }
            return (
              <motion.button key={idx} whileHover={!feedback ? { scale: 1.03 } : {}} whileTap={!feedback ? { scale: 0.97 } : {}}
                onClick={() => submitAnswer(idx)} disabled={!!feedback}
                className={`p-4 rounded-xl border-2 text-left font-medium transition-all ${btnClass}`}>
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-700 mr-3 text-sm font-bold">{String.fromCharCode(65 + idx)}</span>
                {opt}
              </motion.button>
            );
          })}
        </div>

        {feedback && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between pt-4 border-t border-slate-700">
            <div className="flex items-center gap-2">
              {feedback.correct ? <CheckCircle2 className="w-5 h-5 text-green-400" /> : <XCircle className="w-5 h-5 text-red-400" />}
              <span className={`font-bold ${feedback.correct ? 'text-green-400' : 'text-red-400'}`}>{feedback.correct ? 'Correct! +' + feedback.xpEarned + ' XP' : 'Wrong answer'}</span>
            </div>
            {current + 1 < puzzles.length && (
              <motion.button whileHover={{ scale: 1.05 }} onClick={nextPuzzle} className="bg-violet-600 hover:bg-violet-500 px-6 py-2 rounded-xl font-bold text-white transition-colors">
                Next Puzzle →
              </motion.button>
            )}
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};
export default PuzzleGame;
