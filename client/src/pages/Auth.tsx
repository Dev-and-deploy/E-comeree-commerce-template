import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import StoreLayout from '@/components/layout/StoreLayout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const Auth = () => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) throw error;
        toast.success('Welcome back');
        navigate('/');
      } else {
        const { error } = await signUp(email, password, fullName);
        if (error) throw error;
        toast.success('Account created! Please check your email to verify.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-transparent border-b border-border py-3 font-body text-sm tracking-wide placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground transition-colors";

  return (
    <StoreLayout>
      <div className="container mx-auto px-6 py-24 max-w-md">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="text-center mb-12">
            <h1 className="font-display text-4xl font-light tracking-tight mb-3">
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="font-body text-sm text-muted-foreground tracking-wide">
              {mode === 'login' ? 'Sign in to your account' : 'Join our curated community'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {mode === 'register' && (
              <input placeholder="Full Name" value={fullName} onChange={e => setFullName(e.target.value)} required className={inputClass} />
            )}
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className={inputClass} />
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} className={inputClass} />

            <Button variant="luxury" size="lg" className="w-full" type="submit" disabled={loading}>
              {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          <div className="text-center mt-8">
            <button
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="font-body text-xs text-muted-foreground hover:text-foreground transition-colors tracking-wide"
            >
              {mode === 'login' ? "Don't have an account? Create one" : 'Already have an account? Sign in'}
            </button>
          </div>
        </motion.div>
      </div>
    </StoreLayout>
  );
};

export default Auth;
