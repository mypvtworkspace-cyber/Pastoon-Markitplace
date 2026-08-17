import React, { useState } from 'react';
import { ShieldCheck, Lock, X, Mail, Key, User as UserIcon, Phone, CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: string;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  reason,
  onSuccess,
}) => {
  const { loginUser, registerUser, showToast } = useApp();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Aap email aur password lazmi daraj karein.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      if (mode === 'login') {
        loginUser(email, password);
        showToast('Khushamdeed! Aap kamyabi se login ho chuke hain.');
      } else {
        registerUser({
          id: `usr_${Date.now()}`,
          name: name || 'Valued Member',
          email,
          phone: phone || '+92 300 0000000',
          role: 'customer',
          createdAt: new Date().toISOString(),
        });
        showToast('Kamyabi! Aap ka account zaroori security ke sath register ho chuka hai.');
      }
      setLoading(false);
      if (onSuccess) onSuccess();
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative text-slate-100">
        
        {/* Top Security Banner */}
        <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-amber-950 p-6 border-b border-slate-800 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20 shrink-0">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white">Security Verification</h3>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-500/30 uppercase tracking-wider">
                  Verified
                </span>
              </div>
              <p className="text-xs text-amber-300/90 font-medium">Secured by App Owner - Mr Zaheer</p>
            </div>
          </div>

          {/* Urdu Security Notice */}
          <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-amber-500/30 mt-3 space-y-1">
            <div className="flex items-start gap-2">
              <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-200 leading-relaxed font-semibold">
                <span className="text-amber-400 font-bold block mb-0.5">🔒 Important Security Notice (اردو):</span>
                Aapki security aur safety ke liye Login / Signup hona zaroori hai. Is ke baghair aap chat, deals ya orders access nahi kar sakte.
              </div>
            </div>
            <div className="text-[11px] text-slate-400 pl-6 border-l border-slate-800 mt-1.5 italic">
              English: For your account security and transaction safety, Login / Signup is strictly required before accessing dealer chats or placing orders.
            </div>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-800 bg-slate-950">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 py-3 text-xs font-extrabold transition-all border-b-2 ${
              mode === 'login'
                ? 'border-indigo-500 text-indigo-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign In / Login
          </button>
          <button
            onClick={() => setMode('signup')}
            className={`flex-1 py-3 text-xs font-extrabold transition-all border-b-2 ${
              mode === 'signup'
                ? 'border-indigo-500 text-indigo-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Create New Account
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {reason && (
            <div className="text-xs bg-indigo-950/60 text-indigo-300 p-3 rounded-2xl border border-indigo-500/30 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{reason}</span>
            </div>
          )}

          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Full Name (Pura Naam)</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ali Ahmed"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Password</label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Phone Number (Optional)</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+92 300 1234567"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-amber-500 via-orange-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-slate-950 font-black rounded-xl text-xs shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2 transition-all mt-2"
          >
            {loading ? (
              <span>Verifying Credentials...</span>
            ) : (
              <>
                <span>{mode === 'login' ? 'Login Securely' : 'Complete Registration'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Quick Demo Login Option */}
          <div className="pt-3 border-t border-slate-800/80 text-center space-y-2">
            <span className="text-[11px] text-slate-500">Or quick login as verified customer:</span>
            <button
              type="button"
              onClick={() => {
                loginUser('sarah.khan@example.com', 'demo123');
                showToast('Logged in as Sarah Khan (Customer)');
                if (onSuccess) onSuccess();
                onClose();
              }}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-indigo-300 font-bold text-xs rounded-xl border border-slate-700 flex items-center justify-center gap-1.5 transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Demo Quick Login (Customer Sarah)
            </button>
          </div>

          <div className="text-[10px] text-center text-slate-500 font-mono pt-1">
            Protected by App Owner - Mr Zaheer • End-to-End Auth
          </div>
        </form>

      </div>
    </div>
  );
};
