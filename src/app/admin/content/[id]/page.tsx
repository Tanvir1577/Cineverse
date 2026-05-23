'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Play, ArrowLeft, Plus, Trash2, Download, Film, Tv, Loader2, LogOut,
  Image as ImageIcon, FileText, Clapperboard, Swords, Sparkles, Link2, Save, Menu
} from 'lucide-react'
import { GENRE_OPTIONS, LANGUAGE_OPTIONS, SUBTITLE_OPTIONS, QUALITY_OPTIONS } from '@/lib/types'
import type { ContentType, DownloadLink, DownloadGroup } from '@/lib/types'

function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

function extractImageSrc(html: string): string | null {
  if (!html) return null
  const match = html.match(/src=["']([^"']+)["']/)
  return match ? match[1] : null
}

const qualityColorMap: Record<string, string> = {
  '480p': 'bg-amber-500/90 text-white hover:bg-amber-600',
  '720p': 'bg-blue-500/90 text-white hover:bg-blue-600',
  '1080p': 'bg-emerald-500/90 text-white hover:bg-emerald-600',
  '4k': 'bg-purple-500/90 text-white hover:bg-purple-600',
}

const qualityBorderMap: Record<string, string> = {
  '480p': 'border-amber-500/50 text-amber-400',
  '720p': 'border-blue-500/50 text-blue-400',
  '1080p': 'border-emerald-500/50 text-emerald-400',
  '4k': 'border-purple-500/50 text-purple-400',
}

const inputCls = "bg-[#1a1a25]/60 border-white/[0.06] text-white placeholder:text-white/20 h-11 rounded-xl focus-visible:border-purple-500/40 focus-visible:ring-purple-500/15 transition-all duration-300"
const smallInputCls = "bg-[#12121a]/80 border-white/[0.06] text-white placeholder:text-white/20 h-10 text-sm rounded-xl focus-visible:border-purple-500/40 focus-visible:ring-purple-500/15 transition-all duration-300"

function FormCard({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export default function EditContentPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [fetchLoading, setFetchLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  // Form state
  const [contentType, setContentType] = useState<ContentType>('Movie')
  const [mainTitle, setMainTitle] = useState('')
  const [secondaryTitle, setSecondaryTitle] = useState('')
  const [imageHtml, setImageHtml] = useState('')
  const [name, setName] = useState('')
  const [season, setSeason] = useState('')
  const [imdbRating, setImdbRating] = useState('')
  const [releaseYear, setReleaseYear] = useState('')
  const [genre, setGenre] = useState<string[]>([])
  const [language, setLanguage] = useState<string[]>([])
  const [subtitle, setSubtitle] = useState<string[]>([])
  const [quality, setQuality] = useState<string[]>([])
  const [fileSize, setFileSize] = useState('')
  const [format, setFormat] = useState('')
  const [storyline, setStoryline] = useState('')
  const [downloadGroups, setDownloadGroups] = useState<DownloadGroup[]>([])

  // Auth check + fetch
  useEffect(() => {
    const adminUid = localStorage.getItem('adminUid')
    if (!adminUid) {
      router.push('/admin/login')
      return
    }
    if (!id) return

    let cancelled = false
    const load = async () => {
      try {
        setFetchLoading(true)
        const res = await fetch(`/api/content/${id}`)
        if (!res.ok) throw new Error('Content not found')
        const data = await res.json()
        if (cancelled) return
        setContentType(data.contentType || 'Movie')
        setMainTitle(data.mainTitle || '')
        setSecondaryTitle(data.secondaryTitle || '')
        setImageHtml(data.imageHtml || '')
        setName(data.name || '')
        setSeason(data.season || '')
        setImdbRating(data.imdbRating ? String(data.imdbRating) : '')
        setReleaseYear(data.releaseYear ? String(data.releaseYear) : '')
        setGenre(data.genre || [])
        setLanguage(data.language || [])
        setSubtitle(data.subtitle || [])
        setQuality(data.quality || [])
        setFileSize(data.fileSize || '')
        setFormat(data.format || '')
        setStoryline(data.storyline || '')
        setDownloadGroups(data.downloadGroups || [])
      } catch (err) {
        if (cancelled) return
        toast.error('Failed to load content. Redirecting to dashboard.')
        router.push('/admin/dashboard')
      } finally {
        if (!cancelled) setFetchLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [id, router])

  const imageSrc = extractImageSrc(imageHtml)
  const showSeriesInfo = contentType === 'Series' || contentType === 'Anime'

  const toggleArrayItem = (arr: string[], item: string): string[] =>
    arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item]

  const addDownloadGroup = () =>
    setDownloadGroups([...downloadGroups, { id: generateId(), title: '', links: [] }])

  const removeDownloadGroup = (gid: string) => {
    if (!confirm('Delete this download group? This cannot be undone.')) return
    setDownloadGroups(downloadGroups.filter((g) => g.id !== gid))
  }

  const updateDownloadGroup = (gid: string, title: string) =>
    setDownloadGroups(downloadGroups.map((g) => (g.id === gid ? { ...g, title } : g)))

  const addDownloadLink = (gid: string) =>
    setDownloadGroups(
      downloadGroups.map((g) =>
        g.id === gid ? { ...g, links: [...g.links, { id: generateId(), title: '', url: '', quality: [] }] } : g
      )
    )

  const removeDownloadLink = (gid: string, lid: string) =>
    setDownloadGroups(
      downloadGroups.map((g) => (g.id === gid ? { ...g, links: g.links.filter((l) => l.id !== lid) } : g))
    )

  const updateDownloadLink = (gid: string, lid: string, field: keyof DownloadLink, value: string | string[]) =>
    setDownloadGroups(
      downloadGroups.map((g) =>
        g.id === gid ? { ...g, links: g.links.map((l) => (l.id === lid ? { ...l, [field]: value } : l)) } : g
      )
    )

  const handleLogout = async () => {
    try {
      const { signOut } = await import('firebase/auth')
      const { auth } = await import('@/lib/firebase')
      await signOut(auth)
    } catch {}
    localStorage.clear()
    router.push('/admin/login')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!contentType || !mainTitle || !imageHtml) {
      toast.error('Content type, main title, and image HTML are required.')
      return
    }
    setSubmitting(true)
    try {
      const payload = {
        contentType, mainTitle, secondaryTitle, imageHtml, name,
        season: contentType === 'Movie' ? '' : season,
        imdbRating: imdbRating ? parseFloat(imdbRating) : null,
        releaseYear: releaseYear ? parseInt(releaseYear) : null,
        genre, language, subtitle, quality, fileSize, format, storyline, downloadGroups,
      }
      const res = await fetch(`/api/content/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update content')
      }
      toast.success('Content updated successfully!')
      router.push('/admin/dashboard')
    } catch (error: any) {
      toast.error(error.message || 'Failed to update content. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // Loading
  if (fetchLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="h-10 w-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            <div className="absolute inset-0 h-10 w-10 border-2 border-cyan-500/30 border-b-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
          </div>
          <p className="text-white/30 text-sm">Loading content...</p>
        </div>
      </div>
    )
  }

  const contentTypeConfig = contentType === 'Movie'
    ? { icon: Film, color: 'blue', iconColor: 'text-blue-400', bg: 'bg-blue-500/15' }
    : contentType === 'Series'
      ? { icon: Tv, color: 'emerald', iconColor: 'text-emerald-400', bg: 'bg-emerald-500/15' }
      : { icon: Swords, color: 'orange', iconColor: 'text-orange-400', bg: 'bg-orange-500/15' }

  const TypeIcon = contentTypeConfig.icon

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0f]">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-white/[0.06]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link href="/admin/dashboard" className="flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors">
                <ArrowLeft className="h-4 w-4" />
                <span className="text-sm hidden sm:inline">Dashboard</span>
              </Link>
              <div className="w-px h-6 bg-white/[0.06] hidden sm:block" />
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                  <Play className="h-4 w-4 text-white fill-white" />
                </div>
                <span className="text-lg font-bold text-gradient">Cineverse</span>
                <span className="text-[10px] uppercase tracking-wider text-white/25 font-medium bg-white/[0.04] px-2 py-0.5 rounded-full hidden sm:inline">Admin</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/admin/content/new">
                <Button className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white gap-1.5 text-sm h-9 px-3 rounded-xl shadow-lg shadow-purple-500/20">
                  <Plus className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Add Content</span>
                </Button>
              </Link>
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="text-white/30 hover:text-red-400 hover:bg-red-500/10 gap-2 text-sm rounded-xl transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
              <button
                type="button"
                className="md:hidden text-white/50 hover:text-white p-2 rounded-xl"
                onClick={() => setMobileNavOpen(!mobileNavOpen)}
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile dropdown */}
        <AnimatePresence>
          {mobileNavOpen && (
            <motion.div
              className="md:hidden border-t border-white/[0.06] bg-[#12121a] p-4 space-y-2"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Link href="/admin/dashboard" onClick={() => setMobileNavOpen(false)} className="block px-3 py-2 text-white/50 hover:text-white hover:bg-white/[0.04] rounded-xl text-sm transition-colors">Dashboard</Link>
              <button onClick={() => { setMobileNavOpen(false); handleLogout() }} className="w-full text-left px-3 py-2 text-red-400/70 hover:text-red-400 hover:bg-red-500/10 rounded-xl text-sm transition-colors">Logout</button>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Title */}
        <motion.div
          className="mb-6 sm:mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-cyan-500/15 flex items-center justify-center">
              <Save className="h-5 w-5 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Edit Content</h1>
              <p className="text-white/30 text-sm">Update &quot;{mainTitle || 'Content'}&quot; details</p>
            </div>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <FormCard delay={0.1}>
            <Card className="bg-[#12121a]/80 border-white/[0.06] overflow-hidden relative group">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardHeader className="pb-4">
                <CardTitle className="text-white text-lg flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-purple-500/15 flex items-center justify-center">
                    <Clapperboard className="h-4 w-4 text-purple-400" />
                  </div>
                  Basic Information
                </CardTitle>
                <CardDescription className="text-white/30 text-sm">Core details about the content</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Content Type */}
                <div className="space-y-2">
                  <Label className="text-white/50 text-sm">Content Type</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {([
                      { value: 'Movie' as ContentType, label: 'Movie', emoji: '🎬', activeClass: 'bg-blue-500/15 text-blue-400 border-blue-500/40 shadow-lg shadow-blue-500/10' },
                      { value: 'Series' as ContentType, label: 'Series', emoji: '📺', activeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40 shadow-lg shadow-emerald-500/10' },
                      { value: 'Anime' as ContentType, label: 'Anime', emoji: '⚔️', activeClass: 'bg-orange-500/15 text-orange-400 border-orange-500/40 shadow-lg shadow-orange-500/10' },
                    ]).map(type => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setContentType(type.value)}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all duration-300 ${
                          contentType === type.value
                            ? type.activeClass
                            : 'bg-[#1a1a25]/50 border-white/[0.06] text-white/30 hover:text-white/50 hover:border-white/[0.12]'
                        }`}
                      >
                        <span className="text-lg">{type.emoji}</span>
                        <span className="text-xs font-medium">{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Main Title */}
                <div className="space-y-2">
                  <Label className="text-white/50 text-sm">Main Title <span className="text-red-400/80">*</span></Label>
                  <Input value={mainTitle} onChange={(e) => setMainTitle(e.target.value)} placeholder="Enter main title (shows in bold on cards)" className={inputCls} required />
                </div>

                {/* Secondary Title */}
                <div className="space-y-2">
                  <Label className="text-white/50 text-sm">Secondary Title</Label>
                  <Input value={secondaryTitle} onChange={(e) => setSecondaryTitle(e.target.value)} placeholder="Shows below main title on cards and detail view" className={inputCls} />
                </div>

                {/* Image HTML */}
                <div className="space-y-2">
                  <Label className="text-white/50 text-sm flex items-center gap-1.5">
                    <ImageIcon className="h-3.5 w-3.5 text-cyan-400/50" />
                    Image HTML <span className="text-red-400/80">*</span>
                  </Label>
                  <Textarea value={imageHtml} onChange={(e) => setImageHtml(e.target.value)} placeholder='<img src="https://example.com/image.jpg"/>' className="bg-[#1a1a25]/60 border-white/[0.06] text-white placeholder:text-white/20 min-h-[80px] font-mono text-sm rounded-xl focus-visible:border-purple-500/40 focus-visible:ring-purple-500/15 transition-all duration-300" required />
                  <p className="text-white/20 text-xs">Paste the HTML img code. Preview updates automatically.</p>
                </div>

                {/* Image Preview */}
                {imageSrc && (
                  <div className="space-y-2">
                    <Label className="text-white/50 text-sm">Image Preview</Label>
                    <div className="flex items-start gap-4">
                      <div className="w-36 sm:w-44 rounded-xl overflow-hidden bg-[#1a1a25]/50 border border-white/[0.06]">
                        <img src={imageSrc} alt="Preview" className="w-full h-auto object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                      </div>
                      <div className="flex-1 hidden sm:block">
                        <div className="bg-[#1a1a25]/50 rounded-xl p-3 border border-white/[0.06]">
                          <h4 className="text-white font-bold text-sm mb-1">{mainTitle || 'Main Title'}</h4>
                          <p className="text-white/30 text-xs mb-2">{secondaryTitle || 'Secondary Title'}</p>
                          <div className="flex items-center gap-1.5">
                            <div className={`h-5 w-5 rounded ${contentTypeConfig.bg} flex items-center justify-center`}>
                              <TypeIcon className="h-3 w-3" />
                            </div>
                            <span className="text-white/50 text-[10px]">{contentType}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </FormCard>

          {/* Series Information */}
          <AnimatePresence>
            {showSeriesInfo && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="bg-[#12121a]/80 border-white/[0.06] overflow-hidden relative group">
                  <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <CardHeader className="pb-4">
                    <CardTitle className="text-white text-lg flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                        <Tv className="h-4 w-4 text-emerald-400" />
                      </div>
                      Series Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="space-y-2">
                      <Label className="text-white/50 text-sm">Name</Label>
                      <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter series/anime name" className={inputCls} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white/50 text-sm">Season</Label>
                      <Input value={season} onChange={(e) => setSeason(e.target.value)} placeholder="e.g., Season 1, Season 2" className={inputCls} />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Details */}
          <FormCard delay={0.2}>
            <Card className="bg-[#12121a]/80 border-white/[0.06] overflow-hidden relative group">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardHeader className="pb-4">
                <CardTitle className="text-white text-lg flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-cyan-500/15 flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-cyan-400" />
                  </div>
                  Details
                </CardTitle>
                <CardDescription className="text-white/30 text-sm">Quality, genre, language and more</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* IMDB Rating & Release Year */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white/50 text-sm">IMDB Rating</Label>
                    <Input type="number" step="0.1" min="0" max="10" value={imdbRating} onChange={(e) => setImdbRating(e.target.value)} placeholder="e.g., 8.5" className={inputCls} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/50 text-sm">Release Year</Label>
                    <Input type="number" min="1900" max="2030" value={releaseYear} onChange={(e) => setReleaseYear(e.target.value)} placeholder="e.g., 2024" className={inputCls} />
                  </div>
                </div>

                {/* Genre */}
                <div className="space-y-2">
                  <Label className="text-white/50 text-sm">Genre</Label>
                  <div className="flex flex-wrap gap-2">
                    {GENRE_OPTIONS.map((g) => (
                      <button key={g} type="button" onClick={() => setGenre(toggleArrayItem(genre, g))}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 border ${
                          genre.includes(g)
                            ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-sm shadow-purple-500/10'
                            : 'bg-[#1a1a25]/50 text-white/30 border-white/[0.06] hover:text-white/50 hover:border-white/[0.12]'
                        }`}>
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Language */}
                <div className="space-y-2">
                  <Label className="text-white/50 text-sm">Language</Label>
                  <div className="flex flex-wrap gap-2">
                    {LANGUAGE_OPTIONS.map((l) => (
                      <button key={l} type="button" onClick={() => setLanguage(toggleArrayItem(language, l))}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 border ${
                          language.includes(l)
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm shadow-cyan-500/10'
                            : 'bg-[#1a1a25]/50 text-white/30 border-white/[0.06] hover:text-white/50 hover:border-white/[0.12]'
                        }`}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Subtitle */}
                <div className="space-y-2">
                  <Label className="text-white/50 text-sm">Subtitle</Label>
                  <div className="flex flex-wrap gap-2">
                    {SUBTITLE_OPTIONS.map((s) => (
                      <button key={s} type="button" onClick={() => setSubtitle(toggleArrayItem(subtitle, s))}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 border ${
                          subtitle.includes(s)
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-500/10'
                            : 'bg-[#1a1a25]/50 text-white/30 border-white/[0.06] hover:text-white/50 hover:border-white/[0.12]'
                        }`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quality */}
                <div className="space-y-2">
                  <Label className="text-white/50 text-sm">Quality</Label>
                  <div className="flex flex-wrap gap-2">
                    {QUALITY_OPTIONS.map((q) => (
                      <button key={q} type="button" onClick={() => setQuality(toggleArrayItem(quality, q))}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 border uppercase ${
                          quality.includes(q)
                            ? qualityColorMap[q]
                            : `bg-[#1a1a25]/50 ${qualityBorderMap[q]} border hover:opacity-80`
                        }`}>
                        {q}
                      </button>
                    ))}
                  </div>
                </div>

                {/* File Size & Format */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white/50 text-sm">File Size</Label>
                    <Input value={fileSize} onChange={(e) => setFileSize(e.target.value)} placeholder="e.g., 2.5 GB" className={inputCls} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/50 text-sm">Format</Label>
                    <Input value={format} onChange={(e) => setFormat(e.target.value)} placeholder="e.g., MKV, MP4" className={inputCls} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </FormCard>

          {/* Storyline */}
          <FormCard delay={0.3}>
            <Card className="bg-[#12121a]/80 border-white/[0.06] overflow-hidden relative group">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardHeader className="pb-4">
                <CardTitle className="text-white text-lg flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-amber-500/15 flex items-center justify-center">
                    <FileText className="h-4 w-4 text-amber-400" />
                  </div>
                  Storyline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label className="text-white/50 text-sm">Storyline / Synopsis</Label>
                  <Textarea value={storyline} onChange={(e) => setStoryline(e.target.value)} placeholder="Enter the storyline or synopsis of the content..." className="bg-[#1a1a25]/60 border-white/[0.06] text-white placeholder:text-white/20 min-h-[120px] rounded-xl focus-visible:border-purple-500/40 focus-visible:ring-purple-500/15 transition-all duration-300" />
                </div>
              </CardContent>
            </Card>
          </FormCard>

          {/* Download Section */}
          <FormCard delay={0.4}>
            <Card className="bg-[#12121a]/80 border-white/[0.06] overflow-hidden relative group">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-lg flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-purple-500/15 flex items-center justify-center">
                      <Download className="h-4 w-4 text-purple-400" />
                    </div>
                    Download Section
                  </CardTitle>
                  <Button type="button" onClick={addDownloadGroup} className="bg-purple-500/15 text-purple-400 hover:bg-purple-500/25 hover:text-purple-300 border border-purple-500/20 gap-1.5 text-sm rounded-xl transition-all duration-200" size="sm">
                    <Plus className="h-4 w-4" />
                    Add Group
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {downloadGroups.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="h-16 w-16 rounded-2xl bg-white/[0.03] flex items-center justify-center mb-4 border border-white/[0.04]">
                      <Download className="h-8 w-8 text-white/10" />
                    </div>
                    <p className="text-white/30 text-sm mb-1 font-medium">No download groups yet</p>
                    <p className="text-white/15 text-xs">Click &quot;Add Group&quot; above to add one</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <AnimatePresence>
                      {downloadGroups.map((group, gi) => (
                        <motion.div
                          key={group.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.3 }}
                          className="bg-[#1a1a25]/50 rounded-xl border border-white/[0.06] p-4 sm:p-5 relative group/grp hover:border-white/[0.1] transition-colors duration-300"
                        >
                          {/* Group Header */}
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2.5">
                              <div className="h-8 w-8 rounded-lg bg-purple-500/15 flex items-center justify-center text-purple-400 text-xs font-bold border border-purple-500/20">
                                {gi + 1}
                              </div>
                              <span className="text-white/50 text-sm font-medium">Group {gi + 1}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeDownloadGroup(group.id)}
                              className="h-8 w-8 flex items-center justify-center text-white/20 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>

                          {/* Group Title */}
                          <div className="space-y-2 mb-4">
                            <Label className="text-white/40 text-xs">Group Title</Label>
                            <Input value={group.title} onChange={(e) => updateDownloadGroup(group.id, e.target.value)} placeholder="e.g., Episode 1-10, Season Pack" className={smallInputCls} />
                          </div>

                          {/* Links */}
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <Label className="text-white/35 text-xs flex items-center gap-1.5">
                                <Link2 className="h-3 w-3" />
                                Links ({group.links.length})
                              </Label>
                              <Button type="button" onClick={() => addDownloadLink(group.id)} className="bg-white/[0.04] text-white/40 hover:bg-white/[0.08] hover:text-white/60 gap-1 text-xs h-7 px-2.5 rounded-lg transition-colors" size="sm">
                                <Plus className="h-3 w-3" />
                                Add Link
                              </Button>
                            </div>

                            {group.links.length === 0 ? (
                              <div className="text-center py-6 text-white/15 text-xs border border-dashed border-white/[0.06] rounded-xl">No links in this group</div>
                            ) : (
                              <div className="space-y-3">
                                <AnimatePresence>
                                  {group.links.map((link) => (
                                    <motion.div
                                      key={link.id}
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0, x: -20 }}
                                      className="bg-[#12121a]/80 rounded-xl border border-white/[0.04] p-3 sm:p-4 space-y-3"
                                    >
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div className="space-y-1.5">
                                          <Label className="text-white/30 text-[11px]">Link Title</Label>
                                          <Input value={link.title} onChange={(e) => updateDownloadLink(group.id, link.id, 'title', e.target.value)} placeholder="e.g., Episode 1" className="bg-[#0a0a0f]/80 border-white/[0.06] text-white placeholder:text-white/15 h-9 text-sm rounded-lg focus-visible:border-purple-500/40" />
                                        </div>
                                        <div className="space-y-1.5">
                                          <Label className="text-white/30 text-[11px]">URL</Label>
                                          <Input value={link.url} onChange={(e) => updateDownloadLink(group.id, link.id, 'url', e.target.value)} placeholder="https://..." className="bg-[#0a0a0f]/80 border-white/[0.06] text-white placeholder:text-white/15 h-9 text-sm rounded-lg focus-visible:border-purple-500/40" />
                                        </div>
                                      </div>
                                      <div className="space-y-1.5">
                                        <Label className="text-white/30 text-[11px]">Quality</Label>
                                        <div className="flex flex-wrap gap-1.5">
                                          {QUALITY_OPTIONS.map((q) => (
                                            <button
                                              key={q} type="button"
                                              onClick={() => {
                                                const nq = link.quality.includes(q)
                                                  ? link.quality.filter((lq) => lq !== q)
                                                  : [...link.quality, q]
                                                updateDownloadLink(group.id, link.id, 'quality', nq)
                                              }}
                                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors duration-150 border uppercase ${
                                                link.quality.includes(q)
                                                  ? qualityColorMap[q]
                                                  : `bg-[#0a0a0f]/80 ${qualityBorderMap[q]} border hover:opacity-80`
                                              }`}>
                                              {q}
                                            </button>
                                          ))}
                                        </div>
                                      </div>
                                      <div className="flex justify-end">
                                        <button type="button" onClick={() => removeDownloadLink(group.id, link.id)} className="flex items-center gap-1 text-red-400/40 hover:text-red-400 text-xs hover:bg-red-500/10 px-2 py-1 rounded-lg transition-colors">
                                          <Trash2 className="h-3 w-3" />
                                          Remove
                                        </button>
                                      </div>
                                    </motion.div>
                                  ))}
                                </AnimatePresence>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </CardContent>
            </Card>
          </FormCard>

          {/* Submit */}
          <motion.div
            className="flex flex-col sm:flex-row items-center gap-3 pb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-medium h-12 px-8 text-base rounded-xl shadow-lg shadow-purple-500/25 transition-all duration-300 hover:shadow-purple-500/40 disabled:opacity-50 disabled:shadow-none gap-2 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/10 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              {submitting ? (
                <span className="flex items-center gap-2 relative z-10"><Loader2 className="h-5 w-5 animate-spin" />Updating...</span>
              ) : (
                <span className="flex items-center gap-2 relative z-10"><Save className="h-5 w-5" />Update Content</span>
              )}
            </Button>
            <Link href="/admin/dashboard" className="w-full sm:w-auto">
              <Button type="button" variant="ghost" className="w-full sm:w-auto text-white/30 hover:text-white/60 hover:bg-white/[0.04] h-12 px-8 rounded-xl transition-colors">Cancel</Button>
            </Link>
          </motion.div>
        </form>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-white/[0.04] py-4 bg-[#0a0a0f]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-2">
            <div className="h-4 w-4 rounded bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center">
              <Play className="h-2 w-2 text-white fill-white" />
            </div>
            <span className="text-xs text-white/15">Cineverse Admin</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
