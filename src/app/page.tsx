'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Play, Film, Tv, Sword, Star, Calendar, Globe, Subtitles,
  HardDrive, FileCode, Download, X, ArrowUp, ArrowLeft,
  MessageSquarePlus, AlertTriangle, Loader2,
  Sparkles, TrendingUp, Send, ChevronRight,
  FolderOpen, Tag, Zap, Crown, Eye
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog, DialogContent, DialogTitle
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import {
  QUALITY_COLORS,
  type Content, type ContentType, type Category, type DownloadGroup
} from '@/lib/types'

// ========= Helper to extract image URL from HTML =========
function extractImageUrl(html: string): string {
  if (!html) return '/logo.svg'
  const srcMatch = html.match(/src=["']([^"']+)["']/)
  if (srcMatch) return srcMatch[1]
  if (html.startsWith('http')) return html
  return '/logo.svg'
}

// ========= Quality Badge Component =========
function QualityBadge({ quality, size = 'sm' }: { quality: string; size?: 'sm' | 'xs' }) {
  const sizeClass = size === 'xs' ? 'text-[10px] px-1.5 py-0.5' : 'text-[11px] px-2 py-0.5'
  return (
    <span className={`inline-flex items-center font-bold rounded-md ${QUALITY_COLORS[quality] || 'bg-gray-600 text-white'} ${sizeClass}`}>
      {quality}
    </span>
  )
}

// ========= Animated Counter =========
function AnimatedCounter({ value }: { value: number }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    let start = 0
    const duration = 1200
    const step = Math.ceil(value / (duration / 30))
    const timer = setInterval(() => {
      start += step
      if (start >= value) { setDisplay(value); clearInterval(timer) }
      else setDisplay(start)
    }, 30)
    return () => clearInterval(timer)
  }, [value])
  return <>{display}</>
}

// ========= Content Card =========
function ContentCard({ content, onClick, index }: { content: Content; onClick: () => void; index: number }) {
  const [imgLoaded, setImgLoaded] = useState(false)
  const imageUrl = extractImageUrl(content.imageHtml)
  const bestQuality = (Array.isArray(content.quality) ? content.quality : []).includes('4k') ? '4k' :
    (Array.isArray(content.quality) ? content.quality : []).includes('1080p') ? '1080p' :
    (Array.isArray(content.quality) ? content.quality : []).includes('720p') ? '720p' :
    (Array.isArray(content.quality) ? content.quality : []).includes('480p') ? '480p' : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay: index * 0.03, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.3, ease: 'easeOut' } }}
      className="group cursor-pointer"
      onClick={onClick}
    >
      <Card className="overflow-hidden bg-cineverse-800/80 border-white/[0.04] hover:border-purple-500/40 transition-all duration-500 h-full flex flex-col shadow-lg shadow-black/20 hover:shadow-purple-500/10 hover:shadow-2xl">
        {/* Poster */}
        <div className="relative aspect-[2/3] overflow-hidden bg-cineverse-900">
          {!imgLoaded && <div className="absolute inset-0 shimmer" />}
          <img
            src={imageUrl}
            alt={content.mainTitle}
            className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImgLoaded(true)}
            onError={(e) => { (e.target as HTMLImageElement).src = '/logo.svg'; setImgLoaded(true) }}
          />
          {/* Overlay gradient on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Quality Badge */}
          {bestQuality && (
            <div className="absolute top-2 left-2 z-10">
              <QualityBadge quality={bestQuality} size="xs" />
            </div>
          )}

          {/* Content Type Badge */}
          <div className="absolute top-2 right-2 z-10">
            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-md shadow-sm ${
              content.contentType === 'Movie' ? 'bg-purple-600/90 text-white' :
              content.contentType === 'Series' ? 'bg-cyan-600/90 text-white' :
              'bg-rose-600/90 text-white'
            }`}>
              {content.contentType === 'Movie' ? <Film className="w-2.5 h-2.5" /> :
               content.contentType === 'Series' ? <Tv className="w-2.5 h-2.5" /> :
               <Sword className="w-2.5 h-2.5" />}
              {content.contentType}
            </span>
          </div>

          {/* Hover overlay with play icon + title */}
          <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
            <motion.div
              initial={{ scale: 0 }}
              whileHover={{ scale: 1.1 }}
              className="w-14 h-14 rounded-full bg-purple-600/90 backdrop-blur-md flex items-center justify-center shadow-2xl shadow-purple-500/40 mb-3 border border-purple-400/30"
            >
              <Play className="w-6 h-6 text-white fill-white ml-0.5" />
            </motion.div>
            <span className="text-white text-xs font-bold bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full">View Details</span>
          </div>
        </div>

        {/* Card Content */}
        <CardContent className="p-3 flex-1 flex flex-col gap-1">
          {content.secondaryTitle && (
            <p className="text-[10px] text-muted-foreground/70 truncate leading-tight">{content.secondaryTitle}</p>
          )}
          <h3 className="text-sm font-bold text-white truncate leading-tight group-hover:text-purple-400 transition-colors duration-300">
            {content.mainTitle}
          </h3>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
            {content.releaseYear && (
              <span className="flex items-center gap-0.5"><Calendar className="w-2.5 h-2.5" />{content.releaseYear}</span>
            )}
            {content.imdbRating && (
              <span className="flex items-center gap-0.5 text-amber-400"><Star className="w-2.5 h-2.5 fill-amber-400" />{content.imdbRating}</span>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ========= Full-Screen Content Detail =========
function ContentDetail({ content, onClose }: { content: Content; onClose: () => void }) {
  const [showReportDialog, setShowReportDialog] = useState(false)

  const imageUrl = extractImageUrl(content.imageHtml)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[100] bg-cineverse-900 overflow-y-auto"
    >
      {/* Hero Backdrop */}
      <div className="relative h-[40vh] sm:h-[50vh] overflow-hidden">
        <img src={imageUrl} alt={content.mainTitle} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-cineverse-900 via-cineverse-900/70 to-cineverse-900/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-cineverse-900/50 to-transparent" />

        {/* Close button */}
        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/50 backdrop-blur-xl flex items-center justify-center text-white hover:bg-purple-600/80 transition-all duration-300 border border-white/10 shadow-lg"
        >
          <X className="w-5 h-5 sm:w-6 sm:h-6" />
        </motion.button>

        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          onClick={onClose}
          className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20 flex items-center gap-2 text-white/80 hover:text-white bg-black/30 backdrop-blur-xl px-3 py-2 sm:px-4 sm:py-2.5 rounded-full transition-all duration-300 border border-white/10 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back</span>
        </motion.button>
      </div>

      {/* Content Body */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-32 sm:-mt-40 relative z-10 pb-16">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
          {/* Poster */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="flex-shrink-0 w-40 sm:w-52 lg:w-60 mx-auto lg:mx-0"
          >
            <div className="aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl shadow-purple-500/20 border-2 border-white/10 hover:border-purple-500/30 transition-colors duration-300">
              <img src={imageUrl} alt={content.mainTitle} className="w-full h-full object-cover" />
            </div>
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="flex-1 space-y-6"
          >
            {/* Title Section */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-lg ${
                  content.contentType === 'Movie' ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30' :
                  content.contentType === 'Series' ? 'bg-cyan-600/20 text-cyan-400 border border-cyan-500/30' :
                  'bg-rose-600/20 text-rose-400 border border-rose-500/30'
                }`}>
                  {content.contentType === 'Movie' ? <Film className="w-3 h-3" /> :
                   content.contentType === 'Series' ? <Tv className="w-3 h-3" /> :
                   <Sword className="w-3 h-3" />}
                  {content.contentType}
                </span>
                {(content.contentType === 'Series' || content.contentType === 'Anime') && content.season && (
                  <span className="text-xs text-muted-foreground bg-cineverse-700/50 px-3 py-1 rounded-lg border border-white/[0.06]">
                    {content.season}
                  </span>
                )}
              </div>
              {content.secondaryTitle && (
                <p className="text-sm text-muted-foreground mb-1">{content.secondaryTitle}</p>
              )}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">{content.mainTitle}</h1>
            </div>

            {/* Rating + Year Row */}
            <div className="flex flex-wrap items-center gap-4">
              {content.imdbRating && (
                <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-xl">
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                  <span className="font-black text-amber-400 text-lg">{content.imdbRating}</span>
                  <span className="text-amber-400/60 text-xs">/10</span>
                </div>
              )}
              {content.releaseYear && (
                <div className="flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 px-4 py-2 rounded-xl">
                  <Calendar className="w-4 h-4 text-cyan-400" />
                  <span className="font-bold text-cyan-400">{content.releaseYear}</span>
                </div>
              )}
              {content.fileSize && (
                <div className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 px-4 py-2 rounded-xl">
                  <HardDrive className="w-4 h-4 text-orange-400" />
                  <span className="font-bold text-orange-400 text-sm">{content.fileSize}</span>
                </div>
              )}
              {content.format && (
                <div className="flex items-center gap-2 bg-pink-500/10 border border-pink-500/20 px-4 py-2 rounded-xl">
                  <FileCode className="w-4 h-4 text-pink-400" />
                  <span className="font-bold text-pink-400 text-sm">{content.format}</span>
                </div>
              )}
            </div>

            {/* Info Grid */}
            <div className="space-y-4">
              {/* Quality */}
              {content.quality && (Array.isArray(content.quality) ? content.quality : []).length > 0 && (
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-muted-foreground text-sm">Quality</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {(Array.isArray(content.quality) ? content.quality : []).map(q => (
                        <QualityBadge key={q} quality={q} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {/* Genre */}
              {content.genre && (Array.isArray(content.genre) ? content.genre : []).length > 0 && (
                <div className="flex items-start gap-3">
                  <Tag className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-muted-foreground text-sm">Genre</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {(Array.isArray(content.genre) ? content.genre : []).map(g => (
                        <Badge key={g} variant="secondary" className="text-xs bg-cineverse-700/80 text-gray-300 border-white/[0.06]">{g}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {/* Language */}
              {content.language && (Array.isArray(content.language) ? content.language : []).length > 0 && (
                <div className="flex items-start gap-3">
                  <Globe className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-muted-foreground text-sm">Language</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {(Array.isArray(content.language) ? content.language : []).map(l => (
                        <Badge key={l} variant="secondary" className="text-xs bg-cineverse-700/80 text-gray-300 border-white/[0.06]">{l}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {/* Subtitle */}
              {content.subtitle && (Array.isArray(content.subtitle) ? content.subtitle : []).length > 0 && (
                <div className="flex items-start gap-3">
                  <Subtitles className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-muted-foreground text-sm">Subtitle</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {(Array.isArray(content.subtitle) ? content.subtitle : []).map(s => (
                        <Badge key={s} variant="secondary" className="text-xs bg-cineverse-700/80 text-gray-300 border-white/[0.06]">{s}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-2">
              <Button
                onClick={() => setShowReportDialog(true)}
                variant="outline"
                className="border-rose-500/30 text-rose-400 hover:bg-rose-600 hover:text-white hover:border-rose-500 transition-all duration-300"
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Report Issue
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Storyline */}
        {content.storyline && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mt-10"
          >
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-violet-500 rounded-full" />
              Storyline
            </h3>
            <p className="text-gray-400 leading-relaxed text-sm sm:text-base whitespace-pre-wrap bg-cineverse-800/50 rounded-2xl p-6 border border-white/[0.04] backdrop-blur-sm">
              {content.storyline}
            </p>
          </motion.div>
        )}

        {/* Download Section */}
        {content.downloadGroups && content.downloadGroups.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mt-10"
          >
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-cyan-500 to-blue-500 rounded-full" />
              <Download className="w-5 h-5 text-cyan-400" />
              Download Links
            </h3>
            <div className="space-y-4">
              {content.downloadGroups.map((group: DownloadGroup, gi: number) => (
                <div key={group.id || gi} className="bg-cineverse-800/50 rounded-2xl border border-white/[0.04] overflow-hidden backdrop-blur-sm">
                  <div className="px-5 py-4 bg-gradient-to-r from-cyan-600/10 to-purple-600/10 border-b border-white/[0.04]">
                    <h4 className="font-bold text-white flex items-center gap-2">
                      <FolderOpen className="w-4 h-4 text-cyan-400" />
                      {group.title || `Download Group ${gi + 1}`}
                    </h4>
                  </div>
                  <div className="p-4 space-y-3">
                    {group.links && group.links.map((link, li: number) => (
                      <div key={link.id || li} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 bg-cineverse-900/50 rounded-xl border border-white/[0.03] hover:border-purple-500/20 transition-all duration-300 hover:bg-cineverse-900/80">
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium text-gray-300">{link.title}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {link.quality && (Array.isArray(link.quality) ? link.quality : [link.quality]).map((q: string) => (
                            <QualityBadge key={q} quality={q} size="xs" />
                          ))}
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white text-xs font-bold rounded-xl transition-all duration-300 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Download
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Report Panel (inline, avoids z-index issues with Dialog inside fixed overlay) */}
      <AnimatePresence>
        {showReportDialog && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[200] bg-cineverse-900/95 backdrop-blur-xl overflow-y-auto"
          >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-400" />
                  Report Issue
                </h2>
                <button
                  onClick={() => setShowReportDialog(false)}
                  className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <ReportForm contentId={content.id} contentTitle={content.mainTitle} onClose={() => setShowReportDialog(false)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ========= Report Form =========
function ReportForm({ contentId, contentTitle, onClose }: { contentId: string; contentTitle: string; onClose: () => void }) {
  const [message, setMessage] = useState('')
  const [link, setLink] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return
    setLoading(true)
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'REPORT', title: `Report: ${contentTitle}`, message: message.trim(), link: link.trim() || null }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to submit report')
      }
      setMessage(''); setLink(''); onClose()
      toast.success('Report submitted successfully!')
    } catch (err: any) { toast.error(err.message || 'Failed to submit report. Please try again.') }
    finally { setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-xs text-muted-foreground mb-1.5 block">Problem URL (optional)</label>
        <Input value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://..." className="bg-cineverse-900 border-white/[0.06] text-white text-sm" />
      </div>
      <div>
        <label className="text-xs text-muted-foreground mb-1.5 block">Describe the issue *</label>
        <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="e.g. Download link is broken, wrong quality..." className="bg-cineverse-900 border-white/[0.06] text-white text-sm min-h-[80px]" required />
      </div>
      <p className="text-[11px] text-muted-foreground/50 flex items-center gap-1">
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        Reports are automatically deleted after 48 hours
      </p>
      <Button type="submit" disabled={loading || !message.trim()} className="w-full bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white">
        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <AlertTriangle className="w-4 h-4 mr-2" />}
        Submit Report
      </Button>
    </form>
  )
}

// ========= Request Form =========
function RequestForm({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState('')
  const [contentType, setContentType] = useState<string>('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !message.trim()) return
    setLoading(true)
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'REQUEST', title: title.trim(), contentType: contentType || null, message: message.trim() }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to submit request')
      }
      setTitle(''); setContentType(''); setMessage(''); onClose()
      toast.success('Request submitted successfully!')
    } catch (err: any) { toast.error(err.message || 'Failed to submit request. Please try again.') }
    finally { setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-xs text-muted-foreground mb-1.5 block">Content Title *</label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Breaking Bad Season 5" className="bg-cineverse-900 border-white/[0.06] text-white text-sm" required />
      </div>
      <div>
        <label className="text-xs text-muted-foreground mb-1.5 block">Content Type</label>
        <Select value={contentType} onValueChange={setContentType}>
          <SelectTrigger className="bg-cineverse-900 border-white/[0.06] text-white text-sm"><SelectValue placeholder="Select type" /></SelectTrigger>
          <SelectContent className="bg-cineverse-800 border-white/[0.06]">
            <SelectItem value="Movie">Movie</SelectItem>
            <SelectItem value="Series">Series</SelectItem>
            <SelectItem value="Anime">Anime</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="text-xs text-muted-foreground mb-1.5 block">Message *</label>
        <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Describe what you're looking for..." className="bg-cineverse-900 border-white/[0.06] text-white text-sm min-h-[80px]" required />
      </div>
      <p className="text-[11px] text-muted-foreground/50 flex items-center gap-1">
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        Requests are automatically deleted after 48 hours
      </p>
      <Button type="submit" disabled={loading || !title.trim() || !message.trim()} className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white">
        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
        Submit Request
      </Button>
    </form>
  )
}

// ========= Category Section =========
function CategorySection({ category, contents, onContentClick }: { category: Category; contents: Content[]; onContentClick: (c: Content) => void }) {
  const categoryContents = contents.filter(c => category.contentIds?.includes(c.id))
  if (categoryContents.length === 0) return null

  return (
    <section className="mb-14">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-3 mb-6"
      >
        <div className="w-1.5 h-7 bg-gradient-to-b from-purple-500 via-violet-500 to-cyan-500 rounded-full" />
        <h2 className="text-xl sm:text-2xl font-black text-white">{category.name}</h2>
        {category.description && (
          <span className="text-sm text-muted-foreground hidden sm:inline">— {category.description}</span>
        )}
        <div className="ml-auto flex items-center gap-1.5 text-purple-400">
          <TrendingUp className="w-4 h-4" />
          <span className="text-xs font-bold">{categoryContents.length}</span>
        </div>
      </motion.div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
        {categoryContents.map((content, i) => (
          <ContentCard key={content.id} content={content} onClick={() => onContentClick(content)} index={i} />
        ))}
      </div>
    </section>
  )
}

// ========= Main Page =========
export default function HomePage() {
  const [contents, setContents] = useState<Content[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<string>('all')
  const [selectedContent, setSelectedContent] = useState<Content | null>(null)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [showRequestDialog, setShowRequestDialog] = useState(false)
  const [showReportDialog, setShowReportDialog] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const searchTimeout = useRef<NodeJS.Timeout | null>(null)
  const [searchInput, setSearchInput] = useState('')

  const fetchContents = useCallback(async (search?: string, type?: string, pageNum?: number) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (type && type !== 'all') params.set('type', type)
      params.set('page', (pageNum || page).toString())
      params.set('limit', '24')
      const response = await fetch(`/api/content?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setContents(data.contents || [])
        setTotalPages(data.totalPages || 1)
        setTotal(data.total || 0)
      }
    } catch (error) { console.error('Failed to fetch contents:', error) }
    finally { setLoading(false) }
  }, [page])

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) { const data = await response.json(); setCategories(data || []) }
    } catch (error) { console.error('Failed to fetch categories:', error) }
  }, [])

  useEffect(() => { fetchContents(searchQuery, activeTab); fetchCategories() }, [searchQuery, activeTab, page, fetchContents, fetchCategories])

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSearch = (value: string) => {
    setSearchInput(value)
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => { setSearchQuery(value); setPage(1) }, 400)
  }

  const handleTabChange = (value: string) => { setActiveTab(value); setPage(1) }

  const openDetail = (content: Content) => {
    setSelectedContent(content)
    document.body.style.overflow = 'hidden'
  }

  const closeDetail = () => {
    setSelectedContent(null)
    document.body.style.overflow = ''
  }

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  const activeCategories = categories.filter(cat => cat.contentIds && cat.contentIds.length > 0)

  return (
    <div className="min-h-screen bg-cineverse-900 flex flex-col">
      {/* ========= HEADER ========= */}
      <header className={`sticky top-0 z-50 border-b border-white/[0.06] transition-all duration-300 ${showScrollTop ? 'bg-cineverse-900 shadow-2xl shadow-black/40' : 'bg-cineverse-900/80 backdrop-blur-xl'}`}>
        <div className="container mx-auto px-3 sm:px-4 py-2.5 sm:py-3">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            {/* Logo */}
            <a href="/" className="flex items-center gap-1.5 sm:gap-2 group shrink-0">
              <img src="/Cineverse.png" alt="Cineverse" className="w-7 h-7 sm:w-9 sm:h-9 transition-all duration-300 group-hover:scale-105 object-contain drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]" style={{ background: 'transparent' }} />
              <h1 className="text-base sm:text-2xl font-black text-gradient tracking-tight">
                CINEVERSE
              </h1>
            </a>

            {/* Search Bar */}
            <div className="flex-1 max-w-xl min-w-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search..."
                  value={searchInput}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 bg-cineverse-800/80 border-white/[0.06] text-white placeholder:text-muted-foreground focus:border-purple-500/50 focus:ring-purple-500/20 h-9 sm:h-10 text-sm rounded-xl"
                />
                {searchInput && (
                  <button onClick={() => { setSearchInput(''); setSearchQuery(''); setPage(1) }} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Request + Report Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <Button
                onClick={() => setShowRequestDialog(true)}
                size="sm"
                className="hidden sm:flex bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white text-xs shadow-lg shadow-purple-500/20 h-9"
              >
                <MessageSquarePlus className="w-3.5 h-3.5 mr-1.5" />
                Request
              </Button>
              <Button
                onClick={() => setShowReportDialog(true)}
                size="sm"
                variant="outline"
                className="hidden sm:flex border-rose-500/30 text-rose-400 hover:bg-rose-600 hover:text-white hover:border-rose-500 text-xs h-9"
              >
                <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />
                Report
              </Button>
              {/* Mobile: just icons */}
              <button onClick={() => setShowRequestDialog(true)} className="sm:hidden w-9 h-9 flex items-center justify-center rounded-lg bg-purple-600/20 text-purple-400 hover:bg-purple-600 hover:text-white transition-all">
                <MessageSquarePlus className="w-4 h-4" />
              </button>
              <button onClick={() => setShowReportDialog(true)} className="sm:hidden w-9 h-9 flex items-center justify-center rounded-lg bg-rose-600/20 text-rose-400 hover:bg-rose-600 hover:text-white transition-all">
                <AlertTriangle className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* ========= HERO SECTION ========= */}
        {!searchQuery && activeTab === 'all' && (
          <section className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-purple-900/30 via-violet-900/10 to-cineverse-900" />
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-10 left-1/4 w-72 h-72 bg-purple-600/30 rounded-full blur-[120px] animate-pulse" />
              <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-cyan-600/20 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '1s' }} />
            </div>
            {/* Animated grid lines */}
            <div className="absolute inset-0 opacity-[0.03]" style={{
              backgroundImage: 'linear-gradient(rgba(139,92,246,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.3) 1px, transparent 1px)',
              backgroundSize: '60px 60px'
            }} />
            <div className="container mx-auto px-4 py-10 sm:py-24 lg:py-32 relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="text-center max-w-4xl mx-auto"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="inline-flex items-center gap-1.5 sm:gap-2 bg-purple-600/10 border border-purple-500/20 rounded-full px-3 sm:px-5 py-1.5 sm:py-2 mb-6 sm:mb-8 backdrop-blur-sm"
                >
                  <Crown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" />
                  <span className="text-[10px] sm:text-xs font-bold text-purple-300 uppercase tracking-widest">Premium Entertainment Hub</span>
                  <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-purple-400" />
                </motion.div>
                <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white mb-6 leading-[1.1]">
                  Discover Your Next
                  <br />
                  <span className="text-gradient">Favorite</span>
                  <span className="text-white"> Watch</span>
                </h2>
                <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
                  Explore movies, series, and anime in stunning quality. Download with ease and enjoy anywhere.
                </p>

                {/* Stats Row */}
                <div className="flex items-center justify-center gap-8 sm:gap-12">
                  {[
                    { icon: Film, label: 'Movies', color: 'text-purple-400' },
                    { icon: Tv, label: 'Series', color: 'text-cyan-400' },
                    { icon: Sword, label: 'Anime', color: 'text-rose-400' },
                  ].map((item, i) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + i * 0.1 }}
                      className="flex flex-col items-center gap-2"
                    >
                      <div className={`w-12 h-12 rounded-xl bg-cineverse-800/80 border border-white/[0.06] flex items-center justify-center ${item.color}`}>
                        <item.icon className="w-5 h-5" />
                      </div>
                      <span className="text-white font-bold text-sm">{item.label}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Bottom fade */}
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-cineverse-900 to-transparent" />
          </section>
        )}

        {/* ========= CATEGORY SECTIONS (Trending etc.) ========= */}
        {!searchQuery && activeTab === 'all' && activeCategories.length > 0 && (
          <section className="container mx-auto px-4">
            {activeCategories.map(cat => (
              <CategorySection key={cat.id} category={cat} contents={contents} onContentClick={openDetail} />
            ))}
          </section>
        )}

        {/* ========= CONTENT FILTER TABS ========= */}
        <section className="container mx-auto px-4 py-6 sm:py-8">
          {/* Tabs */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <TabsList className="bg-cineverse-800 border border-white/[0.06] h-10 rounded-xl p-1">
                <TabsTrigger value="all" className="text-xs sm:text-sm px-3 sm:px-5 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-violet-600 data-[state=active]:text-white font-bold transition-all duration-300">
                  <Zap className="w-3.5 h-3.5 mr-1" />All
                </TabsTrigger>
                <TabsTrigger value="Movie" className="text-xs sm:text-sm px-3 sm:px-5 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-violet-600 data-[state=active]:text-white font-bold transition-all duration-300">
                  <Film className="w-3.5 h-3.5 mr-1 hidden sm:inline" />Movies
                </TabsTrigger>
                <TabsTrigger value="Series" className="text-xs sm:text-sm px-3 sm:px-5 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-violet-600 data-[state=active]:text-white font-bold transition-all duration-300">
                  <Tv className="w-3.5 h-3.5 mr-1 hidden sm:inline" />Series
                </TabsTrigger>
                <TabsTrigger value="Anime" className="text-xs sm:text-sm px-3 sm:px-5 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-violet-600 data-[state=active]:text-white font-bold transition-all duration-300">
                  <Sword className="w-3.5 h-3.5 mr-1 hidden sm:inline" />Anime
                </TabsTrigger>
              </TabsList>
            </Tabs>


          </div>

          {/* Content Grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="aspect-[2/3] rounded-xl bg-cineverse-800" />
                  <Skeleton className="h-3 w-3/4 bg-cineverse-800" />
                  <Skeleton className="h-3 w-1/2 bg-cineverse-800" />
                </div>
              ))}
            </div>
          ) : contents.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
              <div className="w-20 h-20 rounded-2xl bg-cineverse-800 flex items-center justify-center mx-auto mb-4">
                <Film className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No content found</h3>
              <p className="text-muted-foreground text-sm">
                {searchQuery ? 'Try a different search term' : 'Check back later for new content'}
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
              {contents.map((content, i) => (
                <ContentCard key={content.id} content={content} onClick={() => openDetail(content)} index={i} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-10">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="border-white/[0.06] text-muted-foreground hover:text-white hover:bg-cineverse-700 text-xs min-w-[80px]"
              >
                Previous
              </Button>
              <span className="text-xs text-muted-foreground px-4">
                Page <span className="text-white font-bold">{page}</span> of <span className="text-white font-bold">{totalPages}</span>
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="border-white/[0.06] text-muted-foreground hover:text-white hover:bg-cineverse-700 text-xs min-w-[80px]"
              >
                Next
              </Button>
            </div>
          )}
        </section>
      </main>

      {/* ========= FOOTER ========= */}
      <footer className="bg-cineverse-900 border-t border-white/[0.06] mt-auto">
        <div className="container mx-auto px-4 py-10 sm:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <img src="/Cineverse.png" alt="Cineverse" className="w-10 h-10 object-contain" />
                <span className="text-xl font-black text-gradient tracking-tight">CINEVERSE</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                Your ultimate destination for movies, series, and anime. Discover, explore, and download in stunning quality.
              </p>
            </div>
            {/* Quick Links */}
            <div>
              <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <div className="w-1 h-4 bg-gradient-to-b from-purple-500 to-cyan-500 rounded-full" />
                Quick Links
              </h4>
              <ul className="space-y-2.5">
                {[
                  { label: 'Movies', tab: 'Movie' },
                  { label: 'Series', tab: 'Series' },
                  { label: 'Anime', tab: 'Anime' },
                ].map(item => (
                  <li key={item.tab}>
                    <button
                      onClick={() => { handleTabChange(item.tab); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                      className="text-sm text-muted-foreground hover:text-purple-400 transition-colors duration-200"
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            {/* Info */}
            <div>
              <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <div className="w-1 h-4 bg-gradient-to-b from-cyan-500 to-emerald-500 rounded-full" />
                Information
              </h4>
              <ul className="space-y-2.5">
                <li className="text-sm text-muted-foreground">Premium Content Hub</li>
                <li className="text-sm text-muted-foreground">Multiple Quality Options</li>
                <li className="text-sm text-muted-foreground">Regular Updates</li>
              </ul>
            </div>
          </div>
          {/* Bottom Bar */}
          <div className="mt-8 pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground/60">
              &copy; {new Date().getFullYear()} Cineverse. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground/40">
              Made with passion for entertainment lovers
            </p>
          </div>
        </div>
      </footer>

      {/* ========= SCROLL TO TOP ========= */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-2xl shadow-purple-500/30 flex items-center justify-center hover:shadow-purple-500/50 transition-shadow"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ========= FULL-SCREEN CONTENT DETAIL ========= */}
      <AnimatePresence>
        {selectedContent && (
          <ContentDetail content={selectedContent} onClose={closeDetail} />
        )}
      </AnimatePresence>

      {/* ========= GLOBAL REQUEST/REPORT DIALOGS ========= */}
      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <DialogContent className="max-w-md bg-cineverse-800 border-white/[0.06]">
          <DialogTitle className="text-white font-bold text-lg flex items-center gap-2">
            <MessageSquarePlus className="w-5 h-5 text-purple-400" />
            Request Content
          </DialogTitle>
          <RequestForm onClose={() => setShowRequestDialog(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="max-w-md bg-cineverse-800 border-white/[0.06]">
          <DialogTitle className="text-white font-bold text-lg flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
            Report Issue
          </DialogTitle>
          <ReportForm contentId="general" contentTitle="General Report" onClose={() => setShowReportDialog(false)} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
