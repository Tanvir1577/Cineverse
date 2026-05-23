'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Play, ArrowLeft, Plus, Trash2, Download, Film, Tv, Sword, Loader2, LogOut } from 'lucide-react'
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

const contentTypeColor: Record<string, string> = {
  Movie: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  Series: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  Anime: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
}

export default function EditContentPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [fetchLoading, setFetchLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

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
          <div className="h-10 w-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-white/40 text-sm">Loading content...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0f]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-md border-b border-white/[0.06]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <Link href="/admin/dashboard" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
                <ArrowLeft className="h-4 w-4" />
                <span className="text-sm hidden sm:inline">Dashboard</span>
              </Link>
              <div className="w-px h-5 bg-white/10 hidden sm:block" />
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center">
                  <Play className="h-3.5 w-3.5 text-white fill-white" />
                </div>
                <span className="text-base font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Cineverse</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/admin/content/new">
                <Button className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white gap-1.5 text-sm h-9 px-3">
                  <Plus className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Add Content</span>
                </Button>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-red-400/80 hover:text-red-300 text-sm px-2 py-1.5 rounded-md hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8 animate-in fade-in duration-300">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Edit Content</h1>
          <p className="text-white/40 text-sm">Update &quot;{mainTitle || 'Content'}&quot; details</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card className="bg-[#12121a] border-white/[0.06] animate-in fade-in duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <Film className="h-5 w-5 text-purple-400" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Content Type - native select */}
              <div className="space-y-2">
                <Label className="text-white/70 text-sm">Content Type</Label>
                <select
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value as ContentType)}
                  className="w-full h-11 bg-[#1a1a25] border border-white/[0.08] text-white rounded-md px-3 text-sm focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 appearance-none cursor-pointer"
                >
                  <option value="Movie">🎬 Movie</option>
                  <option value="Series">📺 Series</option>
                  <option value="Anime">⚔️ Anime</option>
                </select>
              </div>

              {/* Main Title */}
              <div className="space-y-2">
                <Label className="text-white/70 text-sm">Main Title <span className="text-red-400">*</span></Label>
                <Input
                  value={mainTitle}
                  onChange={(e) => setMainTitle(e.target.value)}
                  placeholder="Enter main title (shows in bold on cards)"
                  className="bg-[#1a1a25] border-white/[0.08] text-white placeholder:text-white/30 h-11 focus:border-purple-500/50 focus:ring-purple-500/20"
                  required
                />
              </div>

              {/* Secondary Title */}
              <div className="space-y-2">
                <Label className="text-white/70 text-sm">Secondary Title</Label>
                <Input
                  value={secondaryTitle}
                  onChange={(e) => setSecondaryTitle(e.target.value)}
                  placeholder="Shows below main title on cards and detail view"
                  className="bg-[#1a1a25] border-white/[0.08] text-white placeholder:text-white/30 h-11 focus:border-purple-500/50 focus:ring-purple-500/20"
                />
              </div>

              {/* Image HTML */}
              <div className="space-y-2">
                <Label className="text-white/70 text-sm">Image HTML <span className="text-red-400">*</span></Label>
                <Textarea
                  value={imageHtml}
                  onChange={(e) => setImageHtml(e.target.value)}
                  placeholder='<img src="https://example.com/image.jpg"/>'
                  className="bg-[#1a1a25] border-white/[0.08] text-white placeholder:text-white/30 min-h-[80px] focus:border-purple-500/50 focus:ring-purple-500/20 font-mono text-sm"
                  required
                />
                <p className="text-white/30 text-xs">Paste the HTML img code. Preview updates automatically.</p>
              </div>

              {/* Image Preview */}
              {imageSrc && (
                <div className="space-y-2">
                  <Label className="text-white/70 text-sm">Image Preview</Label>
                  <div className="flex items-start gap-4">
                    <div className="w-36 sm:w-44 rounded-xl overflow-hidden bg-[#1a1a25] border border-white/[0.08]">
                      <img
                        src={imageSrc}
                        alt="Preview"
                        className="w-full h-auto object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                      />
                    </div>
                    <div className="flex-1 hidden sm:block">
                      <div className="bg-[#1a1a25] rounded-lg p-3 border border-white/[0.06]">
                        <h4 className="text-white font-bold text-sm mb-1">{mainTitle || 'Main Title'}</h4>
                        <p className="text-white/40 text-xs mb-2">{secondaryTitle || 'Secondary Title'}</p>
                        <button type="button" className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${contentTypeColor[contentType] || ''}`}>
                          {contentType}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Series Information - Only for Series/Anime */}
          {showSeriesInfo && (
            <Card className="bg-[#12121a] border-white/[0.06] animate-in fade-in duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <Tv className="h-5 w-5 text-emerald-400" />
                  Series Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white/70 text-sm">Name</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter series/anime name"
                    className="bg-[#1a1a25] border-white/[0.08] text-white placeholder:text-white/30 h-11 focus:border-purple-500/50 focus:ring-purple-500/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white/70 text-sm">Season</Label>
                  <Input
                    value={season}
                    onChange={(e) => setSeason(e.target.value)}
                    placeholder="e.g., Season 1, Season 2"
                    className="bg-[#1a1a25] border-white/[0.08] text-white placeholder:text-white/30 h-11 focus:border-purple-500/50 focus:ring-purple-500/20"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Details - Available for ALL content types */}
          <Card className="bg-[#12121a] border-white/[0.06] animate-in fade-in duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <Film className="h-5 w-5 text-cyan-400" />
                Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* IMDB Rating & Release Year */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white/70 text-sm">IMDB Rating</Label>
                  <Input
                    type="number" step="0.1" min="0" max="10"
                    value={imdbRating}
                    onChange={(e) => setImdbRating(e.target.value)}
                    placeholder="e.g., 8.5"
                    className="bg-[#1a1a25] border-white/[0.08] text-white placeholder:text-white/30 h-11 focus:border-purple-500/50 focus:ring-purple-500/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70 text-sm">Release Year</Label>
                  <Input
                    type="number" min="1900" max="2030"
                    value={releaseYear}
                    onChange={(e) => setReleaseYear(e.target.value)}
                    placeholder="e.g., 2024"
                    className="bg-[#1a1a25] border-white/[0.08] text-white placeholder:text-white/30 h-11 focus:border-purple-500/50 focus:ring-purple-500/20"
                  />
                </div>
              </div>

              {/* Genre badges */}
              <div className="space-y-2">
                <Label className="text-white/70 text-sm">Genre</Label>
                <div className="flex flex-wrap gap-2">
                  {GENRE_OPTIONS.map((g) => (
                    <button
                      key={g} type="button"
                      onClick={() => setGenre(toggleArrayItem(genre, g))}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border ${
                        genre.includes(g)
                          ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                          : 'bg-[#1a1a25] text-white/40 border-white/[0.06] hover:text-white/60 hover:border-white/[0.12]'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Language badges */}
              <div className="space-y-2">
                <Label className="text-white/70 text-sm">Language</Label>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGE_OPTIONS.map((l) => (
                    <button
                      key={l} type="button"
                      onClick={() => setLanguage(toggleArrayItem(language, l))}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border ${
                        language.includes(l)
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                          : 'bg-[#1a1a25] text-white/40 border-white/[0.06] hover:text-white/60 hover:border-white/[0.12]'
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subtitle badges */}
              <div className="space-y-2">
                <Label className="text-white/70 text-sm">Subtitle</Label>
                <div className="flex flex-wrap gap-2">
                  {SUBTITLE_OPTIONS.map((s) => (
                    <button
                      key={s} type="button"
                      onClick={() => setSubtitle(toggleArrayItem(subtitle, s))}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border ${
                        subtitle.includes(s)
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-[#1a1a25] text-white/40 border-white/[0.06] hover:text-white/60 hover:border-white/[0.12]'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quality badges */}
              <div className="space-y-2">
                <Label className="text-white/70 text-sm">Quality</Label>
                <div className="flex flex-wrap gap-2">
                  {QUALITY_OPTIONS.map((q) => (
                    <button
                      key={q} type="button"
                      onClick={() => setQuality(toggleArrayItem(quality, q))}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 border uppercase ${
                        quality.includes(q)
                          ? qualityColorMap[q]
                          : `bg-[#1a1a25] ${qualityBorderMap[q]} border hover:opacity-80`
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* File Size & Format */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white/70 text-sm">File Size</Label>
                  <Input
                    value={fileSize}
                    onChange={(e) => setFileSize(e.target.value)}
                    placeholder="e.g., 2.5 GB"
                    className="bg-[#1a1a25] border-white/[0.08] text-white placeholder:text-white/30 h-11 focus:border-purple-500/50 focus:ring-purple-500/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70 text-sm">Format</Label>
                  <Input
                    value={format}
                    onChange={(e) => setFormat(e.target.value)}
                    placeholder="e.g., MKV, MP4"
                    className="bg-[#1a1a25] border-white/[0.08] text-white placeholder:text-white/30 h-11 focus:border-purple-500/50 focus:ring-purple-500/20"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Storyline */}
          <Card className="bg-[#12121a] border-white/[0.06] animate-in fade-in duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <Film className="h-5 w-5 text-cyan-400" />
                Storyline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label className="text-white/70 text-sm">Storyline / Synopsis</Label>
                <Textarea
                  value={storyline}
                  onChange={(e) => setStoryline(e.target.value)}
                  placeholder="Enter the storyline or synopsis of the content..."
                  className="bg-[#1a1a25] border-white/[0.08] text-white placeholder:text-white/30 min-h-[120px] focus:border-purple-500/50 focus:ring-purple-500/20"
                />
              </div>
            </CardContent>
          </Card>

          {/* Download Section */}
          <Card className="bg-[#12121a] border-white/[0.06] animate-in fade-in duration-300">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <Download className="h-5 w-5 text-purple-400" />
                  Download Section
                </CardTitle>
                <Button
                  type="button"
                  onClick={addDownloadGroup}
                  className="bg-purple-500/15 text-purple-400 hover:bg-purple-500/25 hover:text-purple-300 border border-purple-500/20 gap-1.5 text-sm"
                  size="sm"
                >
                  <Plus className="h-4 w-4" />
                  Add Group
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {downloadGroups.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Download className="h-8 w-8 text-white/15 mb-2" />
                  <p className="text-white/30 text-sm">No download groups yet</p>
                  <p className="text-white/20 text-xs">Click &quot;Add Group&quot; above to add one</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {downloadGroups.map((group, gi) => (
                    <div key={group.id} className="bg-[#1a1a25] rounded-xl border border-white/[0.06] p-4">
                      {/* Group Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-lg bg-purple-500/15 flex items-center justify-center text-purple-400 text-xs font-bold">
                            {gi + 1}
                          </div>
                          <span className="text-white/60 text-sm font-medium">Group {gi + 1}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeDownloadGroup(group.id)}
                          className="h-7 w-7 flex items-center justify-center text-white/30 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Group Title */}
                      <div className="space-y-1.5 mb-3">
                        <Label className="text-white/60 text-xs">Group Title</Label>
                        <Input
                          value={group.title}
                          onChange={(e) => updateDownloadGroup(group.id, e.target.value)}
                          placeholder="e.g., Episode 1-10, Season Pack"
                          className="bg-[#12121a] border-white/[0.08] text-white placeholder:text-white/25 h-10 text-sm focus:border-purple-500/50 focus:ring-purple-500/20"
                        />
                      </div>

                      {/* Links */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-white/50 text-xs">Links ({group.links.length})</span>
                          <button
                            type="button"
                            onClick={() => addDownloadLink(group.id)}
                            className="flex items-center gap-1 text-white/60 hover:text-white bg-white/5 hover:bg-white/10 text-xs h-7 px-2.5 rounded-md transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                            Add Link
                          </button>
                        </div>

                        {group.links.length === 0 ? (
                          <div className="text-center py-3 text-white/20 text-xs">No links in this group</div>
                        ) : (
                          <div className="space-y-2">
                            {group.links.map((link) => (
                              <div key={link.id} className="bg-[#12121a] rounded-lg border border-white/[0.04] p-3 space-y-2">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  <div className="space-y-1">
                                    <Label className="text-white/40 text-[11px]">Link Title</Label>
                                    <Input
                                      value={link.title}
                                      onChange={(e) => updateDownloadLink(group.id, link.id, 'title', e.target.value)}
                                      placeholder="e.g., Episode 1"
                                      className="bg-[#0a0a0f] border-white/[0.06] text-white placeholder:text-white/20 h-9 text-sm focus:border-purple-500/50 focus:ring-purple-500/20"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-white/40 text-[11px]">URL</Label>
                                    <Input
                                      value={link.url}
                                      onChange={(e) => updateDownloadLink(group.id, link.id, 'url', e.target.value)}
                                      placeholder="https://..."
                                      className="bg-[#0a0a0f] border-white/[0.06] text-white placeholder:text-white/20 h-9 text-sm focus:border-purple-500/50 focus:ring-purple-500/20"
                                    />
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-white/40 text-[11px]">Quality</Label>
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
                                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-colors duration-150 border uppercase ${
                                          link.quality.includes(q)
                                            ? qualityColorMap[q]
                                            : `bg-[#0a0a0f] ${qualityBorderMap[q]} border hover:opacity-80`
                                        }`}
                                      >
                                        {q}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                                <div className="flex justify-end">
                                  <button
                                    type="button"
                                    onClick={() => removeDownloadLink(group.id, link.id)}
                                    className="flex items-center gap-1 text-red-400/60 hover:text-red-400 text-xs hover:bg-red-500/10 px-2 py-1 rounded transition-colors"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                    Remove
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pb-8">
            <Button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-medium h-12 px-8 text-base shadow-lg shadow-purple-500/20 transition-all duration-300 hover:shadow-purple-500/30 disabled:opacity-60 gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Content'
              )}
            </Button>
            <Link href="/admin/dashboard" className="w-full sm:w-auto">
              <Button
                type="button"
                variant="ghost"
                className="w-full sm:w-auto text-white/50 hover:text-white hover:bg-white/5 h-12 px-8"
              >
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-white/[0.04] py-4 bg-[#0a0a0f]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-2">
            <div className="h-4 w-4 rounded bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center">
              <Play className="h-2 w-2 text-white fill-white" />
            </div>
            <span className="text-xs text-white/30">Cineverse Admin Panel</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
