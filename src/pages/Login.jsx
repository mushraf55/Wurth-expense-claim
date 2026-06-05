import React, { useState } from 'react';
const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Strict domain regex validation
  const validateEmail = (val) => {
    return val.toLowerCase().endsWith('@wuerth-professional.com');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError('Please fill in all fields.');
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      setError('Invalid Domain: Only @wuerth-professional.com email accounts are permitted.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: trimmedEmail, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed. Please check credentials.');
      }

      triggerSuccess(data.user);
    } catch (err) {
      // Graceful fallback simulation if server is unreachable
      if (err.message.includes('Failed to fetch')) {
        simulateFallbackLogin(trimmedEmail, password);
      } else {
        setError(err.message);
        setLoading(false);
      }
    }
  };

  // Safe fallback if backend database is offline
  const simulateFallbackLogin = (emailVal, passVal) => {
    console.log('Backend offline. Attempting client-side validation...');
    const lowerEmail = emailVal.toLowerCase();
    
    let role = '';
    let name = '';

    if (lowerEmail === 'claimant@wuerth-professional.com') {
      role = 'CLAIMANT';
      name = 'John Doe';
    } else if (lowerEmail === 'manager@wuerth-professional.com') {
      role = 'MANAGER';
      name = 'Jane Manager';
    } else if (lowerEmail === 'finance@wuerth-professional.com') {
      role = 'FINANCE';
      name = 'Finance Master';
    } else {
      setError('Invalid credentials.');
      setLoading(false);
      return;
    }

    if (passVal !== 'Password123') {
      setError('Incorrect password.');
      setLoading(false);
      return;
    }

    const mockUser = { id: `mock-${role.toLowerCase()}`, email: lowerEmail, name, role };
    triggerSuccess(mockUser);
  };

  const triggerSuccess = (user) => {
    setLoading(false);
    onLoginSuccess(user);
  };

  const isEmailValid = email === '' || validateEmail(email.trim());

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Background Graphic Lines */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-secondary-container/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md bg-white border border-outline-variant shadow-lg rounded-xl overflow-hidden z-10 transition-all duration-300">
        
        {/* Banner Logo */}
        <div className="bg-secondary p-6 text-center flex flex-col items-center gap-2">
          <h2 className="flex items-center justify-center">
            <img
              src="/big-logo.png"
              alt="WÜRTH PROFESSIONAL SOLUTIONS"
              className="h-14 sm:h-16 w-auto object-contain drop-shadow-md"
            />
          </h2>
          <p className="font-label-sm text-label-sm text-on-secondary opacity-75 uppercase tracking-widest">
            Expense Management Portal
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="p-6 space-y-4">
          {error && (
            <div className="bg-error-container text-on-error-container border border-error/20 p-2 rounded font-body-sm text-body-sm flex items-start gap-2 animate-shake">
              <span className="material-symbols-outlined text-[18px] text-error">info</span>
              <p className="text-error font-semibold">{error}</p>
            </div>
          )}

          {/* Email input */}
          <div className="space-y-1">
            <label className="block font-label-md text-label-md text-on-surface-variant font-semibold">
              Corporate Email Address
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary opacity-60">
                mail
              </span>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@wuerth-professional.com"
                className={`w-full bg-surface-container-low border rounded-lg py-2 pl-10 pr-4 text-body-md focus:ring-2 focus:ring-primary/20 outline-none transition-all ${
                  isEmailValid ? 'border-outline-variant focus:border-primary' : 'border-error focus:border-error'
                }`}
                disabled={loading}
              />
            </div>
            {!isEmailValid && (
              <p className="text-[11px] text-error font-bold mt-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">cancel</span>
                Only @wuerth-professional.com email accounts are permitted.
              </p>
            )}
          </div>

          {/* Password input */}
          <div className="space-y-1">
            <label className="block font-label-md text-label-md text-on-surface-variant font-semibold">
              Password
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary opacity-60">
                lock
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2 pl-10 pr-4 text-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                disabled={loading}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !isEmailValid || email === ''}
            className={`w-full py-4 text-white font-bold flex items-center justify-center gap-2 transition-all rounded shadow-md cursor-pointer ${
              loading || !isEmailValid || email === ''
                ? 'bg-secondary/40 text-on-secondary/50 cursor-not-allowed'
                : 'bg-primary hover:bg-primary/95 active:scale-98'
            }`}
          >
            {loading ? (
              <>
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">login</span>
                <span>Sign In</span>
              </>
            )}
          </button>

          {/* User hint instructions to easily test role access */}
          <div className="mt-6 border-t border-outline-variant pt-4 text-left">
            <span className="font-label-sm text-label-sm font-bold text-secondary uppercase tracking-wider block mb-2">
              Dummy Testing Accounts (Password: Password123)
            </span>
            <div className="space-y-1 font-mono text-[10px] text-secondary">
              <div className="flex justify-between bg-surface p-1 rounded">
                <span>claimant@wuerth-professional.com</span>
                <span className="text-primary font-bold">Claimant</span>
              </div>
              <div className="flex justify-between bg-surface p-1 rounded">
                <span>manager@wuerth-professional.com</span>
                <span className="text-primary font-bold">Manager</span>
              </div>
              <div className="flex justify-between bg-surface p-1 rounded">
                <span>finance@wuerth-professional.com</span>
                <span className="text-primary font-bold">Finance</span>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Copyright footer */}
      <span className="font-label-sm text-label-sm text-secondary opacity-60 mt-6">
        © 2026 WÜRTH PROFESSIONAL SOLUTIONS. All Rights Reserved.
      </span>
    </div>
  );
};

export default Login;
