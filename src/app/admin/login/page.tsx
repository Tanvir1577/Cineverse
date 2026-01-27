'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Play, Lock, ArrowLeft, Mail, Key } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import Link from 'next/link'
import { getCopyrightText } from '@/lib/year'
import { auth } from '@/lib/firebase'
import { signInWithEmailAndPassword, signOut } from 'firebase/auth'

export default function AdminLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Check if already logged in
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        router.push('/admin/dashboard')
      }
    })

    return () => unsubscribe()
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Sign in with Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      
      // Get ID token
      const idToken = await userCredential.user.getIdToken()
      
      // Verify with backend
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken }),
      })

      if (response.ok) {
        // Store user info in localStorage
        localStorage.setItem('adminUid', userCredential.user.uid)
        localStorage.setItem('adminEmail', userCredential.user.email || '')
        router.push('/admin/dashboard')
      } else {
        // Check if response is JSON before parsing
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json()
          setError(data.error || 'Authentication failed')
        } else {
          // If not JSON, read as text and show generic error
          const text = await response.text()
          console.error('Non-JSON response:', text.substring(0, 200)) // Log first 200 chars
          setError('Authentication service error. Please try again.')
        }
        // Sign out if verification fails
        await signOut(auth)
      }
    } catch (error: any) {
      console.error('Login error:', error)
      if (error.code === 'auth/invalid-credential') {
        setError('Invalid email or password')
      } else if (error.code === 'auth/user-not-found') {
        setError('No account found with this email')
      } else if (error.code === 'auth/wrong-password') {
        setError('Incorrect password')
      } else {
        setError(error.message || 'Failed to login. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-sm sm:max-w-md">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-3 mb-6 sm:mb-8 group">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:shadow-purple-500/50 transition-shadow">
            <Play className="w-5 h-5 sm:w-6 sm:h-6 text-white fill-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Cineverse
          </h1>
        </Link>

        {/* Login Card */}
        <Card className="bg-gray-900/50 border-gray-800/50 backdrop-blur-xl">
          <CardHeader className="space-y-1 sm:space-y-2 text-center">
            <CardTitle className="text-xl sm:text-2xl font-bold text-white flex items-center justify-center gap-2">
              <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
              Admin Login
            </CardTitle>
            <CardDescription className="text-sm sm:text-base text-gray-400">
              Enter your credentials to access admin panel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-3 sm:space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm sm:text-base">
                  {error}
                </div>
              )}

              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-xs sm:text-sm font-medium text-gray-300">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-500 focus:border-purple-500/50 focus:ring-purple-500/20 h-10 sm:h-12 text-sm sm:text-base pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-xs sm:text-sm font-medium text-gray-300">Password</label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-500 focus:border-purple-500/50 focus:ring-purple-500/20 h-10 sm:h-12 text-sm sm:text-base pl-10"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold h-12 sm:h-14 text-base sm:text-lg"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </form>

            <div className="mt-4 sm:mt-6 text-center">
              <Link href="/">
                <Button variant="ghost" className="text-gray-400 hover:text-white text-sm sm:text-base">
                  <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  <span className="text-sm sm:text-base">Back to Home</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-gray-500 text-xs sm:text-sm mt-6 sm:mt-8">
          {getCopyrightText()}
        </p>
      </div>
    </div>
  )
}
