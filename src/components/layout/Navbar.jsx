import { Coins, Flame, Trophy, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

const Navbar = () => {
  const [userStats, setUserStats] = useState({
    level: 1, xp: 0, nextLvl: 1000, coins: 0, streak: 0, energy: 100, name: 'Player'
  });

  // Sync from localStorage on mount + listen for storage changes
  const syncFromStorage = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user && user.level) {
      setUserStats({
        level: user.level,
        xp: user.xp || 0,
        nextLvl: (user.level || 1) * 1000,
        coins: user.coins || 0,
        streak: user.streak || 0,
        energy: user.energy || 100,
        name: user.name || 'Player',
      });
    }
  };

  useEffect(() => {
    syncFromStorage();

    // Poll localStorage every 2 seconds to pick up changes from other components
    const interval = setInterval(syncFromStorage, 2000);
    
    // Also listen for storage events (cross-tab sync)
    window.addEventListener('storage', syncFromStorage);
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', syncFromStorage);
    };
  }, []);

  const xpPercentage = Math.min((userStats.xp / userStats.nextLvl) * 100, 100);

  return (
    <nav className="h-20 w-full glass-panel sticky top-0 z-40 border-b border-slate-700/50 flex items-center justify-between px-4 lg:px-10">
      
      {/* Level & XP Bar */}
      <div className="flex items-center gap-4 flex-1">
        <div className="relative group cursor-pointer">
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full blur opacity-40 group-hover:opacity-75 transition duration-300"></div>
          <div className="relative w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center border border-slate-700 font-bold text-lg neon-text-blue">
            {userStats.level}
          </div>
          <div className="absolute -bottom-1 -right-1 bg-cyan-500 w-5 h-5 rounded-full flex items-center justify-center border-2 border-slate-900">
            <Trophy className="w-3 h-3 text-slate-900" />
          </div>
        </div>

        <div className="hidden sm:flex flex-col w-48 lg:w-64 gap-1">
          <div className="flex justify-between text-xs font-semibold text-slate-400">
            <span>Pro Rank</span>
            <span>{userStats.xp} / {userStats.nextLvl} XP</span>
          </div>
          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${xpPercentage}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 relative"
            >
               <div className="absolute top-0 right-0 bottom-0 left-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem] animate-[stripes_1s_linear_infinite]" />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Stats Indicators */}
      <div className="flex items-center gap-3 lg:gap-6">
        
        {/* Streak */}
        <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-full border border-orange-500/30 shadow-[0_0_10px_rgba(249,115,22,0.1)]">
          <Flame className="w-5 h-5 text-orange-500 fill-orange-500/20" />
          <span className="font-bold text-orange-400">{userStats.streak}</span>
        </div>

        {/* Coins */}
        <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-full border border-yellow-500/30 shadow-[0_0_10px_rgba(234,179,8,0.1)]">
          <Coins className="w-5 h-5 text-yellow-400 fill-yellow-400/20" />
          <span className="font-bold text-yellow-500">{userStats.coins}</span>
        </div>

        {/* Energy */}
        <div className="hidden md:flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-full border border-green-500/30">
          <Zap className="w-5 h-5 text-green-400 fill-green-400/20" />
          <span className="font-bold text-green-400">{userStats.energy}/100</span>
        </div>
        
        {/* Profile Avatar */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 p-0.5 ml-2 cursor-pointer border-2 border-transparent hover:border-pink-400 transition-colors">
          <div className="block w-full h-full bg-slate-900 rounded-full overflow-hidden">
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userStats.name}&backgroundColor=0f172a`} alt="avatar" />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
