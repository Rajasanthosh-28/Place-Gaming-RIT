import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, UserPlus, Lock, Mail, User } from 'lucide-react';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || 'Signup failed');
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] right-[10%] w-[500px] h-[500px] bg-purple-500/10 blur-[100px] rounded-full"></div>
        <div className="absolute bottom-[20%] left-[10%] w-[400px] h-[400px] bg-pink-500/10 blur-[100px] rounded-full"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel w-full max-w-md p-8 rounded-3xl z-10 border border-slate-700 shadow-2xl relative"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-2xl mx-auto flex items-center justify-center shadow-[0_0_20px_rgba(176,38,255,0.4)] mb-4">
            <Zap className="w-8 h-8 text-white fill-current" />
          </div>
          <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-500 uppercase tracking-wider">New Player</h2>
          <p className="text-slate-400 mt-2 font-medium">Register for the Placement Arena</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-xl mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-slate-400 group-focus-within:text-purple-400 transition-colors" />
            </div>
            <input 
              type="text" 
              required
              className="w-full bg-slate-800/50 border border-slate-700 text-slate-100 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all placeholder:text-slate-500"
              placeholder="Player Name (Username)"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-purple-400 transition-colors" />
            </div>
            <input 
              type="email" 
              required
              className="w-full bg-slate-800/50 border border-slate-700 text-slate-100 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all placeholder:text-slate-500"
              placeholder="Player Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-purple-400 transition-colors" />
            </div>
            <input 
              type="password" 
              required
              className="w-full bg-slate-800/50 border border-slate-700 text-slate-100 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all placeholder:text-slate-500"
              placeholder="Create Strong Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-[0_4px_0_rgba(192,38,211,1)] hover:shadow-[0_2px_0_rgba(192,38,211,1)] hover:translate-y-[2px] transition-all disabled:opacity-50"
          >
            <UserPlus className="w-5 h-5" />
            {loading ? 'REGISTERING...' : 'REGISTER PROFILE'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-slate-400 text-sm">
            Already registered? <Link to="/login" className="text-purple-400 hover:text-purple-300 font-bold ml-1">Login directly</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;
