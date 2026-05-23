'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import {
  ArrowLeft, Search, Film, Tv, LayoutDashboard, Plus, LogOut,
  Menu, Pencil, Trash2, Loader2, Star, Sparkles, TrendingUp, Clapperboard,
  Swords, Activity, ChevronRight
} from 'lucide-react'
import { toast } from 'sonner'

interface Content {
  id: string; contentType: string; mainTitle: string; secondaryTitle: string
  releaseYear?: number; genre?: string[]; imdbRating?: number; quality?: string[]
}

const qColor = (q: string) => q === '480p' ? 'bg-amber-500/90 text-white' : q === '720p' ? 'bg-yellow-500/90 text-white' : q === '1080p' ? 'bg-emerald-500/90 text-white' : 'bg-purple-500/90 text-white'
const tColor = (t: string) => t === 'Movie' ? 'bg-blue-500/15 text-blue-400 border-blue-500/30' : t === 'Series' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-orange-500/15 text-orange-400 border-orange-500/30'

// Stat card config
const statCards = [
  { key: 'total', label: 'Total Content', icon: Sparkles, gradient: 'from-purple-600 to-purple-400', bgGlow: 'rgba(139,92,246,0.15)', iconBg: 'bg-purple-500/20', iconColor: 'text-purple-400' },
  { key: 'movies', label: 'Movies', icon: Film, gradient: 'from-blue-600 to-blue-400', bgGlow: 'rgba(59,130,246,0.15)', iconBg: 'bg-blue-500/20', iconColor: 'text-blue-400' },
  { key: 'series', label: 'Series', icon: Tv, gradient: 'from-emerald-600 to-emerald-400', bgGlow: 'rgba(16,185,129,0.15)', iconBg: 'bg-emerald-500/20', iconColor: 'text-emerald-400' },
  { key: 'anime', label: 'Anime', icon: Swords, gradient: 'from-orange-600 to-orange-400', bgGlow: 'rgba(249,115,22,0.15)', iconBg: 'bg-orange-500/20', iconColor: 'text-orange-400' },
] as const

// Content type icon
function TypeIcon({ type }: { type: string }) {
  if (type === 'Movie') return <Film className="h-4 w-4 text-blue-400" />
  if (type === 'Series') return <Tv className="h-4 w-4 text-emerald-400" />
  return <Swords className="h-4 w-4 text-orange-400" />
}

// Animated counter
function AnimatedNumber({ value }: { value: number }) {
  return (
    <motion.span
      className="text-3xl sm:text-4xl font-bold text-white tabular-nums"
      key={value}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {value}
    </motion.span>
  )
}

// Container animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [authChecked, setAuthChecked] = useState(false)
  const [contents, setContents] = useState<Content[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [navOpen, setNavOpen] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem('adminUid')) { router.push('/admin/login'); return }
    setAuthChecked(true)
  }, [router])

  const fetchContents = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/content?limit=1000')
      if (res.ok) { const d = await res.json(); setContents(d.contents || []) }
    } catch { toast.error('Failed to load') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { if (authChecked) fetchContents() }, [authChecked, fetchContents])

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id)
      const res = await fetch(`/api/content/${id}`, { method: 'DELETE' })
      if (res.ok) { setContents(p => p.filter(c => c.id !== id)); toast.success('Deleted') }
    } catch { toast.error('Failed') }
    finally { setDeletingId(null) }
  }

  const handleLogout = async () => {
    try { const { signOut } = await import('firebase/auth'); const { auth } = await import('@/lib/firebase'); await signOut(auth) } catch {}
    localStorage.clear(); router.push('/admin/login')
  }

  const filtered = contents.filter(c => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return c.mainTitle?.toLowerCase().includes(q) || c.contentType?.toLowerCase().includes(q) || c.genre?.some(g => g.toLowerCase().includes(q)) || c.releaseYear?.toString().includes(q)
  })

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="h-12 w-12 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            <div className="absolute inset-0 h-12 w-12 border-2 border-cyan-500/30 border-b-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
          </div>
          <p className="text-white/30 text-sm">Authenticating...</p>
        </div>
      </div>
    )
  }

  const stats = { total: contents.length, movies: contents.filter(c => c.contentType === 'Movie').length, series: contents.filter(c => c.contentType === 'Series').length, anime: contents.filter(c => c.contentType === 'Anime').length }

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0f]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0a0a0f]/95 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-white/40 hover:text-white/70 transition-colors flex items-center gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm hidden sm:inline">Home</span>
            </Link>
            <div className="w-px h-6 bg-white/[0.06] hidden sm:block" />
            <div className="flex items-center gap-2.5">
              <img src="/Cineverse.png" alt="Cineverse" className="h-9 w-9 object-contain" />
              <span className="text-lg font-bold text-gradient">Cineverse</span>
              <span className="text-[10px] uppercase tracking-wider text-white/25 font-medium bg-white/[0.04] px-2 py-0.5 rounded-full hidden sm:inline">Admin</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            <Link href="/admin/dashboard">
              <Button
                variant="ghost"
                className="gap-2 text-sm text-purple-400 bg-purple-600/10 border border-purple-500/25 transition-all duration-200 rounded-lg"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            <Link href="/admin/categories">
              <Button
                variant="ghost"
                className="gap-2 text-sm text-white/40 hover:text-white/70 hover:bg-white/[0.04] transition-all duration-200 rounded-lg"
              >
                <Star className="h-4 w-4" />
                Categories
              </Button>
            </Link>
            <Link href="/admin/feedback">
              <Button
                variant="ghost"
                className="gap-2 text-sm text-white/40 hover:text-white/70 hover:bg-white/[0.04] transition-all duration-200 rounded-lg"
              >
                <Activity className="h-4 w-4" />
                Feedback
              </Button>
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/admin/content/new">
              <Button className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white gap-2 text-sm shadow-lg shadow-purple-500/20 transition-all duration-300 hover:shadow-purple-500/30 rounded-xl">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add Content</span>
              </Button>
            </Link>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="text-white/30 hover:text-red-400 hover:bg-red-500/10 gap-2 text-sm transition-colors duration-200 rounded-xl"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
            <Sheet open={navOpen} onOpenChange={setNavOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden text-white/50 hover:text-white rounded-xl">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 bg-[#12121a] border-white/[0.06] p-6">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <div className="flex items-center gap-2.5 mb-6 mt-2">
                  <img src="/Cineverse.png" alt="Cineverse" className="h-8 w-8 object-contain" />
                  <span className="text-base font-bold text-gradient">Cineverse</span>
                  <span className="text-[9px] uppercase tracking-wider text-white/25 font-medium bg-white/[0.04] px-1.5 py-0.5 rounded-full">Admin</span>
                </div>
                <div className="flex flex-col gap-1">
                  <Link href="/admin/dashboard" onClick={() => setNavOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start gap-2 text-purple-400 bg-purple-500/10 hover:bg-purple-500/15 rounded-lg">
                      <LayoutDashboard className="h-4 w-4" />Dashboard
                    </Button>
                  </Link>
                  <Link href="/admin/categories" onClick={() => setNavOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start gap-2 text-white/50 hover:text-white/80 hover:bg-white/[0.04] rounded-lg">
                      <Star className="h-4 w-4" />Categories
                    </Button>
                  </Link>
                  <Link href="/admin/feedback" onClick={() => setNavOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start gap-2 text-white/50 hover:text-white/80 hover:bg-white/[0.04] rounded-lg">
                      <Activity className="h-4 w-4" />Feedback
                    </Button>
                  </Link>
                  <div className="h-px bg-white/[0.06] my-3" />
                  <Link href="/admin/content/new" onClick={() => setNavOpen(false)}>
                    <Button className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white gap-2 shadow-lg shadow-purple-500/20 rounded-lg">
                      <Plus className="h-4 w-4" />Add Content
                    </Button>
                  </Link>
                  <Button variant="ghost" onClick={handleLogout} className="w-full justify-start text-red-400/60 hover:text-red-400 hover:bg-red-500/10 gap-2 mt-2 rounded-lg">
                    <LogOut className="h-4 w-4" />Logout
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Title Section */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-purple-500/15 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Dashboard</h1>
              <p className="text-white/30 text-sm">Overview of your content library</p>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {statCards.map((card) => {
            const value = stats[card.key]
            const Icon = card.icon
            return (
              <motion.div key={card.key} variants={itemVariants}>
                <Card className="bg-[#12121a] border-white/[0.06] overflow-hidden relative group hover:border-white/[0.1] transition-all duration-300">
                  {/* Background glow */}
                  <div
                    className="absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: card.bgGlow }}
                  />
                  <CardContent className="p-4 sm:p-6 relative z-10">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`h-10 w-10 rounded-xl ${card.iconBg} flex items-center justify-center`}>
                        <Icon className={`h-5 w-5 ${card.iconColor}`} />
                      </div>
                      <ChevronRight className="h-4 w-4 text-white/10 group-hover:text-white/20 transition-colors" />
                    </div>
                    <AnimatedNumber value={value} />
                    <p className="text-xs text-white/35 mt-1 font-medium">{card.label}</p>
                  </CardContent>
                  {/* Bottom accent */}
                  <div className={`h-[2px] bg-gradient-to-r ${card.gradient} opacity-0 group-hover:opacity-60 transition-opacity duration-500`} />
                </Card>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Search */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="relative group max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-purple-400/60 transition-colors" />
            <Input
              placeholder="Search content by title, genre, year..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10 bg-[#1a1a25]/50 border-white/[0.06] text-white placeholder:text-white/20 h-11 rounded-xl focus-visible:border-purple-500/30 focus-visible:ring-purple-500/10 transition-all duration-300"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors text-sm"
              >
                Clear
              </button>
            )}
          </div>
        </motion.div>

        {/* Content List */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              className="py-20 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="relative inline-flex">
                <div className="h-10 w-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                <div className="absolute inset-0 h-10 w-10 border-2 border-cyan-500/30 border-b-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
              </div>
              <p className="text-white/30 text-sm mt-4">Loading content library...</p>
            </motion.div>
          ) : filtered.length === 0 ? (
            <motion.div
              key="empty"
              className="py-20 text-center"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="h-20 w-20 rounded-2xl bg-white/[0.03] flex items-center justify-center mx-auto mb-4">
                <Film className="h-10 w-10 text-white/10" />
              </div>
              <p className="text-white/40 text-sm font-medium">
                {searchQuery ? 'No content matches your search' : 'No content yet'}
              </p>
              <p className="text-white/20 text-xs mt-1">
                {searchQuery ? 'Try a different search term' : 'Start by adding your first content'}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="list"
              className="space-y-2 max-h-[650px] overflow-y-auto pr-1"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {filtered.map((c, i) => (
                <motion.div
                  key={c.id}
                  variants={itemVariants}
                  className="group"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-[#12121a]/60 border border-white/[0.04] rounded-xl hover:border-purple-500/20 hover:bg-[#12121a]/80 transition-all duration-300 relative overflow-hidden">
                    {/* Hover glow */}
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <div className="flex items-center gap-3 flex-1 min-w-0 relative z-10">
                      <div className="h-9 w-9 rounded-lg bg-[#1a1a25] flex items-center justify-center shrink-0 border border-white/[0.04]">
                        <TypeIcon type={c.contentType} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-white font-medium text-sm truncate group-hover:text-white/90">{c.mainTitle}</p>
                        {c.secondaryTitle && <p className="text-white/25 text-xs truncate">{c.secondaryTitle}</p>}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap relative z-10">
                      <Badge variant="outline" className={`text-[10px] ${tColor(c.contentType)}`}>{c.contentType}</Badge>
                      {c.releaseYear && <span className="text-white/30 text-xs">{c.releaseYear}</span>}
                      {c.imdbRating && (
                        <span className="flex items-center gap-0.5 text-amber-400 text-xs">
                          <Star className="h-3 w-3 fill-amber-400" />{c.imdbRating}
                        </span>
                      )}
                      {(Array.isArray(c.quality) ? c.quality : []).map(q => (
                        <span key={q} className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${qColor(q)}`}>{q}</span>
                      ))}
                    </div>

                    <div className="flex items-center gap-1 relative z-10">
                      <Link href={`/admin/content/${c.id}`}>
                        <Button variant="ghost" size="sm" className="h-8 text-xs text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 gap-1 px-2.5 rounded-lg transition-colors">
                          <Pencil className="h-3 w-3" />Edit
                        </Button>
                      </Link>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-xs text-white/25 hover:text-red-400 hover:bg-red-500/10 gap-1 px-2.5 rounded-lg transition-colors"
                            disabled={deletingId === c.id}
                          >
                            {deletingId === c.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                            Del
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-[#12121a] border-white/[0.08]">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-white">Delete &quot;{c.mainTitle}&quot;?</AlertDialogTitle>
                            <AlertDialogDescription className="text-white/40">This action cannot be undone. The content will be permanently removed.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="bg-white/[0.04] text-white/60 border-white/[0.08] hover:bg-white/[0.08]">Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(c.id)} className="bg-red-600 text-white hover:bg-red-500">Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results count */}
        {!loading && filtered.length > 0 && (
          <motion.div
            className="mt-4 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <p className="text-white/20 text-xs">
              Showing {filtered.length} of {contents.length} items
              {searchQuery && ` matching "${searchQuery}"`}
            </p>
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-white/[0.06] bg-[#0a0a0f]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <img src="/Cineverse.png" alt="Cineverse" className="h-7 w-7 object-contain" />
              <span className="text-sm font-bold tracking-wide text-white/60">CINEVERSE</span>
            </div>
            <p className="text-xs text-white/20">
              &copy; {new Date().getFullYear()} Cineverse. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
