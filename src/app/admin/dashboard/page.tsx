'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Play, ArrowLeft, Search, Users, Film, Tv, LayoutDashboard, Plus, LogOut, Menu, Pencil, Trash2, Loader2, Star } from 'lucide-react'
import { toast } from 'sonner'

interface Content {
  id: string; contentType: string; mainTitle: string; secondaryTitle: string
  releaseYear?: number; genre?: string[]; imdbRating?: number; quality?: string[]
}

const qColor = (q: string) => q === '480p' ? 'bg-amber-500/90 text-white' : q === '720p' ? 'bg-yellow-500/90 text-white' : q === '1080p' ? 'bg-emerald-500/90 text-white' : 'bg-purple-500/90 text-white'
const tColor = (t: string) => t === 'Movie' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : t === 'Series' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-orange-500/20 text-orange-400 border-orange-500/30'
const tIcon = (t: string) => t === 'Movie' ? '🎬' : t === 'Series' ? '📺' : '⚔️'

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

  if (!authChecked) return <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]"><Loader2 className="h-8 w-8 text-purple-500 animate-spin" /></div>

  const stats = { total: contents.length, movies: contents.filter(c => c.contentType === 'Movie').length, series: contents.filter(c => c.contentType === 'Series').length, anime: contents.filter(c => c.contentType === 'Anime').length }

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0f]">
      <header className="sticky top-0 z-50 glass border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-white/60 hover:text-white transition-colors flex items-center gap-1.5"><ArrowLeft className="h-4 w-4" /><span className="text-sm hidden sm:inline">Home</span></Link>
            <div className="w-px h-6 bg-white/10 hidden sm:block" />
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center"><Play className="h-4 w-4 text-white fill-white" /></div>
              <span className="text-lg font-bold text-gradient">Cineverse</span>
              <span className="text-xs text-white/40 hidden sm:inline">Admin</span>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-1">
            <Link href="/admin/dashboard"><Button variant="ghost" className="gap-2 text-purple-400 bg-purple-600/10 border border-purple-500/30 text-sm"><LayoutDashboard className="h-4 w-4" />Dashboard</Button></Link>
            <Link href="/admin/categories"><Button variant="ghost" className="gap-2 text-white/60 hover:text-white text-sm"><LayoutDashboard className="h-4 w-4" />Categories</Button></Link>
            <Link href="/admin/feedback"><Button variant="ghost" className="gap-2 text-white/60 hover:text-white text-sm"><Star className="h-4 w-4" />Feedback</Button></Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/admin/content/new"><Button className="bg-gradient-to-r from-purple-600 to-purple-500 text-white gap-2 text-sm shadow-lg shadow-purple-500/20"><Plus className="h-4 w-4" /><span className="hidden sm:inline">Add Content</span></Button></Link>
            <Button variant="ghost" onClick={handleLogout} className="text-red-400 hover:text-red-300 hover:bg-red-500/10 gap-2 text-sm"><LogOut className="h-4 w-4" /><span className="hidden sm:inline">Logout</span></Button>
            <Sheet open={navOpen} onOpenChange={setNavOpen}>
              <SheetTrigger asChild><Button variant="ghost" size="icon" className="md:hidden text-white/70"><Menu className="h-5 w-5" /></Button></SheetTrigger>
              <SheetContent side="right" className="w-72 bg-[#12121a] border-white/[0.06] p-6">
                <div className="flex flex-col gap-2 mt-6">
                  <Link href="/admin/dashboard" onClick={() => setNavOpen(false)}><Button variant="ghost" className="w-full justify-start gap-2 text-white/80">Dashboard</Button></Link>
                  <Link href="/admin/categories" onClick={() => setNavOpen(false)}><Button variant="ghost" className="w-full justify-start gap-2 text-white/80">Categories</Button></Link>
                  <Link href="/admin/feedback" onClick={() => setNavOpen(false)}><Button variant="ghost" className="w-full justify-start gap-2 text-white/80">Feedback</Button></Link>
                  <Link href="/admin/content/new" onClick={() => setNavOpen(false)}><Button className="w-full bg-purple-600 text-white gap-2 mt-4"><Plus className="h-4 w-4" />Add Content</Button></Link>
                  <Button variant="ghost" onClick={handleLogout} className="w-full justify-start text-red-400 gap-2 mt-2"><LogOut className="h-4 w-4" />Logout</Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6">Dashboard</h1>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
          {[
            { l: 'Total', v: stats.total, c: 'purple' },
            { l: 'Movies', v: stats.movies, c: 'blue' },
            { l: 'Series', v: stats.series, c: 'emerald' },
            { l: 'Anime', v: stats.anime, c: 'orange' },
          ].map(s => (
            <Card key={s.l} className="bg-[#12121a] border-white/[0.06]">
              <CardContent className="p-4 sm:p-6">
                <div className="text-2xl sm:text-3xl font-bold text-white">{s.v}</div>
                <div className="text-xs sm:text-sm text-white/40 mt-1">{s.l}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mb-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
          <Input placeholder="Search content..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9 bg-[#1a1a25] border-white/[0.08] text-white placeholder:text-white/30 h-10 max-w-md" />
        </div>

        {loading ? <div className="py-16 text-center"><Loader2 className="h-8 w-8 text-purple-400 animate-spin mx-auto mb-4" /><p className="text-white/40 text-sm">Loading...</p></div> :
        filtered.length === 0 ? <div className="py-16 text-center"><p className="text-white/40 text-sm">{searchQuery ? 'No matches' : 'No content'}</p></div> :
        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          {filtered.map(c => (
            <div key={c.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 p-3 sm:p-4 bg-[#12121a] border border-white/[0.04] rounded-lg hover:border-purple-500/20 transition-colors">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="text-lg">{tIcon(c.contentType)}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-white font-medium text-sm truncate">{c.mainTitle}</p>
                  {c.secondaryTitle && <p className="text-white/30 text-xs truncate">{c.secondaryTitle}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className={`text-[10px] ${tColor(c.contentType)}`}>{c.contentType}</Badge>
                {c.releaseYear && <span className="text-white/40 text-xs">{c.releaseYear}</span>}
                {c.imdbRating && <span className="text-amber-400 text-xs">⭐ {c.imdbRating}</span>}
                {c.quality?.map(q => <span key={q} className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${qColor(q)}`}>{q}</span>)}
              </div>
              <div className="flex items-center gap-1">
                <Link href={`/admin/content/${c.id}`}><Button variant="ghost" size="sm" className="h-7 text-xs text-purple-400 hover:text-purple-300 gap-1 px-2"><Pencil className="h-3 w-3" />Edit</Button></Link>
                <AlertDialog>
                  <AlertDialogTrigger asChild><Button variant="ghost" size="sm" className="h-7 text-xs text-red-400 hover:text-red-300 gap-1 px-2" disabled={deletingId === c.id}>{deletingId === c.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}Del</Button></AlertDialogTrigger>
                  <AlertDialogContent className="bg-[#12121a] border-white/[0.08]">
                    <AlertDialogHeader><AlertDialogTitle className="text-white">Delete &quot;{c.mainTitle}&quot;?</AlertDialogTitle><AlertDialogDescription className="text-white/50">This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="bg-white/5 text-white/70 border-white/10">Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(c.id)} className="bg-red-600 text-white hover:bg-red-500">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>}
      </main>

      <footer className="mt-auto border-t border-white/[0.04] py-4 bg-[#0a0a0f]">
        <p className="text-center text-xs text-white/20">&copy; {new Date().getFullYear()} Cineverse</p>
      </footer>
    </div>
  )
}
