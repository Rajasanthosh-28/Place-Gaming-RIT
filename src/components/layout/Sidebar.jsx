import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Briefcase, Trophy, User, Target, Zap, Code2, Puzzle, Crosshair, LogOut, FileCheck } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const links = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { divider: true, label: 'GAMES' },
    { name: 'Quiz Arena', icon: Target, path: '/challenges' },
    { name: 'Speed Run', icon: Zap, path: '/speed' },
    { name: 'Code Lab', icon: Code2, path: '/coding' },
    { name: 'Puzzles', icon: Puzzle, path: '/puzzles' },
    { name: 'Missions', icon: Crosshair, path: '/missions' },
    { divider: true, label: 'PLACEMENT' },
    { name: 'Job Board', icon: Briefcase, path: '/jobs' },
    { name: 'My Apps', icon: FileCheck, path: '/applications' },
    { name: 'Leaderboard', icon: Trophy, path: '/leaderboard' },
    { name: 'Profile', icon: User, path: '/profile' },
  ];

  const handleLogout = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/login'); };

  return (
    <aside className="fixed left-0 top-0 h-screen w-16 md:w-64 glass-panel border-r border-slate-700/50 flex flex-col items-center md:items-start transition-all duration-300 z-50 overflow-y-auto">
      <div className="w-full h-16 flex items-center justify-center md:justify-start md:px-6 border-b border-slate-700/50 flex-shrink-0">
        <div className="w-9 h-9 bg-gradient-to-tr from-cyan-400 to-purple-500 rounded-lg shadow-[0_0_15px_rgba(0,240,255,0.4)] flex items-center justify-center font-bold text-lg cursor-default">P</div>
        <span className="hidden md:ml-3 md:block text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">Place Gaming RIT</span>
      </div>

      <nav className="w-full mt-2 space-y-1 px-2 md:px-3 flex-1">
        {links.map((link, i) => {
          if (link.divider) return (
            <div key={i} className="hidden md:block pt-4 pb-1 px-3"><span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{link.label}</span></div>
          );
          const isActive = location.pathname === link.path;
          const Icon = link.icon;
          return (
            <Link key={link.name} to={link.path}
              className={`flex items-center justify-center md:justify-start p-2.5 md:px-3 md:py-2.5 rounded-xl transition-all duration-200 group relative ${
                isActive ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/10 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
              }`}>
              {isActive && <div className="absolute left-0 w-1 h-6 bg-cyan-400 rounded-r-md shadow-[0_0_10px_rgba(0,240,255,0.8)]" />}
              <Icon className={`w-5 h-5 ${isActive ? 'text-cyan-400' : 'group-hover:text-cyan-300'}`} />
              <span className="hidden md:block ml-3 text-sm font-medium tracking-wide">{link.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="w-full px-2 md:px-3 pb-4 flex-shrink-0">
        <button onClick={handleLogout} className="w-full flex items-center justify-center md:justify-start p-2.5 md:px-3 md:py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/30">
          <LogOut className="w-5 h-5" /><span className="hidden md:block ml-3 text-sm font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};
export default Sidebar;
