'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Lock, ArrowLeft, Mail, Key, Loader2, Shield, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

// Floating orbs for animated background
function FloatingOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, rgba(139,92,246,0) 70%)',
          left: '10%',
          top: '5%',
        }}
        animate={{
          x: [0, 60, -30, 0],
          y: [0, -40, 20, 0],
          scale: [1, 1.1, 0.95, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(6,182,212,0.1) 0%, rgba(6,182,212,0) 70%)',
          right: '5%',
          bottom: '10%',
        }}
        animate={{
          x: [0, -50, 30, 0],
          y: [0, 30, -50, 0],
          scale: [1, 0.9, 1.15, 1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute w-[300px] h-[300px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, rgba(6,182,212,0.05) 70%)',
          left: '50%',
          top: '60%',
        }}
        animate={{
          x: [0, 40, -40, 0],
          y: [0, -30, 30, 0],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  )
}

// Grid pattern overlay
function GridPattern() {
  return (
    <div
      className="absolute inset-0 pointer-events-none opacity-[0.03]"
      style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
        backgroundSize: '60px 60px',
      }}
    />
  )
}

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Check if already logged in
  useEffect(() => {
    const adminUid = localStorage.getItem('adminUid')
    const adminEmail = localStorage.getItem('adminEmail')
    if (adminUid && adminEmail) {
      router.push('/admin/dashboard')
    }
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { getAuth, signInWithEmailAndPassword } = await import('firebase/auth')
      const { auth } = await import('@/lib/firebase')

      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      localStorage.setItem('adminUid', userCredential.user.uid)
      localStorage.setItem('adminEmail', userCredential.user.email || '')
      router.push('/admin/dashboard')
    } catch (err: unknown) {
      const firebaseError = err as { code?: string }
      const code = firebaseError.code || ''
      switch (code) {
        case 'auth/invalid-credential': setError('Invalid credentials. Please try again.'); break
        case 'auth/user-not-found': setError('No account found with this email.'); break
        case 'auth/wrong-password': setError('Incorrect password. Please try again.'); break
        case 'auth/invalid-email': setError('Invalid email format.'); break
        case 'auth/too-many-requests': setError('Too many attempts. Please try later.'); break
        default: setError('Login failed. Please check your credentials.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0f] px-4 py-8 relative overflow-hidden">
      <FloatingOrbs />
      <GridPattern />

      {/* Animated top accent line */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{
          background: 'linear-gradient(90deg, transparent, #8b5cf6, #06b6d4, transparent)',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, delay: 0.5 }}
      />

      {/* Back link */}
      <motion.a
        href="/"
        className="absolute top-6 left-6 inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/80 transition-colors z-10"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Home</span>
      </motion.a>

      {/* Logo */}
      <motion.div
        className="flex items-center gap-3 mb-10 z-10"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.img
          src="/Cineverse.png"
          alt="Cineverse"
          className="w-14 h-14 object-contain"
          whileHover={{ scale: 1.05, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
        />
        <div>
          <h1 className="text-3xl font-bold text-gradient">Cineverse</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/30 font-medium">Admin Portal</p>
        </div>
      </motion.div>

      {/* Login Card */}
      <motion.div
        className="w-full max-w-md z-10"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="relative">
          {/* Card glow */}
          <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-b from-purple-500/20 via-transparent to-cyan-500/10 opacity-60" />

          <div className="relative rounded-2xl border border-white/[0.06] bg-[#12121a]/90 backdrop-blur-2xl shadow-2xl shadow-black/40 overflow-hidden">
            {/* Card top accent */}
            <div className="h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />

            <div className="p-8 sm:p-10">
              {/* Header */}
              <motion.div
                className="text-center mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <div className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1a1a25] to-[#12121a] border border-white/[0.08] flex items-center justify-center relative">
                  <Shield className="h-7 w-7 text-purple-400" />
                  <div className="absolute inset-0 rounded-2xl bg-purple-500/5" />
                </div>
                <h2 className="text-xl font-semibold text-white mb-1">Admin Login</h2>
                <p className="text-white/40 text-sm">Sign in to access the control panel</p>
              </motion.div>

              {/* Form */}
              <form onSubmit={handleLogin} className="space-y-5">
                <AnimatePresence mode="wait">
                  {error && (
                    <motion.div
                      className="rounded-xl border border-red-500/20 bg-red-500/[0.08] px-4 py-3 text-sm text-red-400 flex items-center gap-2"
                      initial={{ opacity: 0, y: -10, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: 'auto' }}
                      exit={{ opacity: 0, y: -10, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="h-1.5 w-1.5 rounded-full bg-red-400 shrink-0" />
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <label htmlFor="email" className="text-sm font-medium text-white/60 flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-purple-400/60" />
                    Email Address
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-purple-400/60 transition-colors pointer-events-none" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@cineverse.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-10 h-12 bg-[#1a1a25]/50 border-white/[0.06] text-white placeholder:text-white/20 focus-visible:border-purple-500/40 focus-visible:ring-purple-500/15 rounded-xl transition-all duration-300"
                    />
                  </div>
                </motion.div>

                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <label htmlFor="password" className="text-sm font-medium text-white/60 flex items-center gap-1.5">
                    <Key className="h-3.5 w-3.5 text-purple-400/60" />
                    Password
                  </label>
                  <div className="relative group">
                    <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-purple-400/60 transition-colors pointer-events-none" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pl-10 pr-10 h-12 bg-[#1a1a25]/50 border-white/[0.06] text-white placeholder:text-white/20 focus-visible:border-purple-500/40 focus-visible:ring-purple-500/15 rounded-xl transition-all duration-300"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-medium rounded-xl shadow-lg shadow-purple-500/25 transition-all duration-300 hover:shadow-purple-500/40 disabled:opacity-50 disabled:shadow-none relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/10 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    {loading ? (
                      <span className="flex items-center gap-2 relative z-10">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Authenticating...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 relative z-10">
                        <Lock className="h-4 w-4" />
                        Sign In
                      </span>
                    )}
                  </Button>
                </motion.div>
              </form>
            </div>

            {/* Card bottom accent */}
            <div className="h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
          </div>
        </div>
      </motion.div>

      {/* Footer */}
      <motion.p
        className="mt-10 text-center text-xs text-white/20 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        &copy; {new Date().getFullYear()} Cineverse. All rights reserved.
      </motion.p>
    </div>
  )
}
