'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Play, Lock, ArrowLeft, Mail, Key, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
      // Dynamic import of Firebase to reduce initial bundle
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
        case 'auth/invalid-credential': setError('Invalid credentials.'); break
        case 'auth/user-not-found': setError('No account found.'); break
        case 'auth/wrong-password': setError('Incorrect password.'); break
        case 'auth/invalid-email': setError('Invalid email format.'); break
        case 'auth/too-many-requests': setError('Too many attempts. Try later.'); break
        default: setError('Login failed. Check credentials.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0f] px-4 py-8 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/5 rounded-full blur-3xl pointer-events-none" />

      <a href="/" className="absolute top-6 left-6 inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
        <ArrowLeft className="h-4 w-4" /><span>Back to Home</span>
      </a>

      <div className="flex items-center gap-3 mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
          <Play className="h-6 w-6 text-white fill-white" />
        </div>
        <h1 className="text-3xl font-bold text-gradient">Cineverse</h1>
      </div>

      <Card className="w-full max-w-md border-white/[0.06] bg-[#12121a]/80 backdrop-blur-xl shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-3 w-14 h-14 rounded-full bg-[#1a1a25] border border-white/[0.06] flex items-center justify-center">
            <Lock className="h-6 w-6 text-purple-400" />
          </div>
          <CardTitle className="text-xl font-semibold text-white">Admin Login</CardTitle>
          <CardDescription className="text-gray-400 text-sm">Sign in to access the admin panel</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div>
            )}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-300">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                <Input id="email" type="email" placeholder="admin@cineverse.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="pl-10 h-11 bg-[#1a1a25]/60 border-white/[0.08] text-white placeholder:text-gray-600 focus-visible:border-purple-500/50 focus-visible:ring-purple-500/20 rounded-lg" />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-300">Password</label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                <Input id="password" type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required className="pl-10 h-11 bg-[#1a1a25]/60 border-white/[0.08] text-white placeholder:text-gray-600 focus-visible:border-purple-500/50 focus-visible:ring-purple-500/20 rounded-lg" />
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full h-11 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-medium rounded-lg shadow-lg shadow-purple-500/20 transition-all disabled:opacity-60">
              {loading ? <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Signing in...</span> : <span className="flex items-center gap-2"><Lock className="h-4 w-4" />Sign In</span>}
            </Button>
          </form>
        </CardContent>
      </Card>
      <p className="mt-10 text-center text-xs text-gray-600">&copy; {new Date().getFullYear()} Cineverse. All rights reserved.</p>
    </div>
  )
}
