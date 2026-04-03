import { motion } from 'framer-motion';
import { Trophy, Medal, Crown } from 'lucide-react';
import { useState, useEffect } from 'react';

const Leaderboard = () => {
  const [leaderData, setLeaderData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaders = async () => {
      try {
        const res = await fetch('/api/gamification/leaderboard');
        const data = await res.json();
        if (!Array.isArray(data)) { setLoading(false); return; }
        const mappedData = data.map((player, index) => ({
          rank: index + 1,
          name: player.name,
          level: player.level || 1,
          score: player.totalScore || 0,
          role: player.rankTitle || 'Rookie',
          isUser: false
        }));
        
        setLeaderData(mappedData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaders();
  }, []);

  const getRankStyle = (rank) => {
    switch(rank) {
      case 1: return { icon: Crown, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/50' };
      case 2: return { icon: Medal, color: 'text-slate-300', bg: 'bg-slate-300/10 border-slate-300/50' };
      case 3: return { icon: Medal, color: 'text-orange-500', bg: 'bg-orange-500/10 border-orange-700/50' };
      default: return { icon: Trophy, color: 'text-slate-500', bg: 'bg-slate-800/50 border-slate-700' };
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      <div className="text-center space-y-4">
        <Trophy className="w-16 h-16 mx-auto text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-500 uppercase tracking-widest">
          Hall of Fame
        </h1>
        <p className="text-slate-400 text-lg">Top Placement Candidates & Challenge Winners</p>
      </div>

      <div className="glass-panel rounded-3xl p-6 md:p-10 border-slate-700 relative overflow-hidden">
        {/* Decorative Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-20"></div>

        <div className="space-y-4 relative z-10">
          {/* Header Row */}
          <div className="grid grid-cols-12 gap-4 px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-700/50">
            <div className="col-span-2 md:col-span-1 text-center">Rank</div>
            <div className="col-span-6 md:col-span-5">Player</div>
            <div className="col-span-4 md:col-span-3 text-center">Level & Title</div>
            <div className="hidden md:block col-span-3 text-right">Total Score</div>
          </div>

          {loading ? (
            <div className="text-center py-10 text-slate-400">Loading leaderboard...</div>
          ) : leaderData.length === 0 ? (
            <div className="text-center py-10 text-slate-400">No players found</div>
          ) : leaderData.map((player, index) => {
            const style = getRankStyle(player.rank);
            const Icon = style.icon;
            
            return (
              <motion.div 
                key={player.rank}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`grid grid-cols-12 gap-4 items-center px-4 md:px-6 py-4 rounded-2xl border ${style.bg} ${player.isUser ? 'shadow-[0_0_20px_rgba(0,240,255,0.15)] ring-1 ring-cyan-500' : ''} transition-transform hover:scale-[1.01]`}
              >
                {/* Rank */}
                <div className="col-span-2 md:col-span-1 flex justify-center">
                   <div className="relative flex items-center justify-center w-8 h-8 md:w-10 md:h-10">
                     {player.rank <= 3 && <Icon className={`absolute inset-0 w-full h-full opacity-20 ${style.color}`} />}
                     <span className={`text-xl font-black ${style.color}`}>{player.rank}</span>
                   </div>
                </div>

                {/* Name */}
                <div className="col-span-6 md:col-span-5 flex items-center gap-3 md:gap-4">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${player.name}&backgroundColor=0f172a`} 
                       alt="avatar" 
                       className={`w-10 h-10 md:w-12 md:h-12 rounded-full border-2 ${player.isUser ? 'border-cyan-400' : 'border-slate-600'}`} />
                  <div>
                    <h3 className={`font-bold text-sm md:text-lg ${player.isUser ? 'text-cyan-400' : 'text-slate-100'}`}>
                      {player.name} {player.isUser && '(You)'}
                    </h3>
                  </div>
                </div>

                {/* Level / Title */}
                <div className="col-span-4 md:col-span-3 flex flex-col items-center justify-center">
                  <span className="text-xs text-slate-400 uppercase font-bold tracking-widest">{player.role}</span>
                  <div className="flex items-center gap-1 mt-1 bg-slate-900 border border-slate-700 px-2 py-0.5 rounded text-xs font-bold text-white">
                    <span className="text-purple-400">LVL</span> {player.level}
                  </div>
                </div>

                {/* Score */}
                <div className="col-span-12 md:col-span-3 hidden md:flex items-center justify-end">
                  <span className="text-xl font-mono text-transparent font-bold bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-500">
                    {player.score.toLocaleString()}
                  </span>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
