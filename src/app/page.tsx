'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Play, Film, Tv, Sword, Star, Calendar, Globe, Subtitles,
  HardDrive, FileCode, Download, X, ArrowUp,
  MessageSquarePlus, AlertTriangle, Loader2,
  Sparkles, TrendingUp, Send,
  FolderOpen, Tag
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
  // Try to extract src from img tag
  const srcMatch = html.match(/src=["']([^"']+)["']/)
  if (srcMatch) return srcMatch[1]
  // If it's already a URL
  if (html.startsWith('http')) return html
  return '/logo.svg'
}

// ========= Quality Badge Component =========
function QualityBadge({ quality, size = 'sm' }: { quality: string; size?: 'sm' | 'xs' }) {
  const sizeClass = size === 'xs' ? 'text-[10px] px-1.5 py-0.5' : 'text-[11px] px-2 py-0.5'
  return (
    <span className={`inline-flex items-center font-bold rounded ${QUALITY_COLORS[quality] || 'bg-gray-600 text-white'} ${sizeClass}`}>
      {quality}
    </span>
  )
}

// ========= Content Card =========
function ContentCard({ content, onClick }: { content: Content; onClick: () => void }) {
  const [imgLoaded, setImgLoaded] = useState(false)
  const imageUrl = extractImageUrl(content.imageHtml)
  const bestQuality = content.quality?.includes('4k') ? '4k' :
    content.quality?.includes('1080p') ? '1080p' :
    content.quality?.includes('720p') ? '720p' :
    content.quality?.includes('480p') ? '480p' : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -6, transition: { duration: 0.25 } }}
      className="card-hover group cursor-pointer"
      onClick={onClick}
    >
      <Card className="overflow-hidden bg-cineverse-800 border-white/[0.04] hover:border-purple-500/30 transition-all duration-300 h-full flex flex-col">
        {/* Poster */}
        <div className="relative aspect-2-3 overflow-hidden bg-cineverse-900">
          {!imgLoaded && (
            <div className="absolute inset-0 shimmer" />
          )}
          <img
            src={imageUrl}
            alt={content.mainTitle}
            className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImgLoaded(true)}
            onError={(e) => { (e.target as HTMLImageElement).src = '/logo.svg'; setImgLoaded(true) }}
          />
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Quality Badge */}
          {bestQuality && (
            <div className="absolute top-2 left-2 z-10">
              <QualityBadge quality={bestQuality} size="xs" />
            </div>
          )}
          
          {/* Content Type Badge */}
          <div className="absolute top-2 right-2 z-10">
            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-sm ${
              content.contentType === 'Movie' ? 'bg-purple-600/80 text-white' :
              content.contentType === 'Series' ? 'bg-cyan-600/80 text-white' :
              'bg-rose-600/80 text-white'
            }`}>
              {content.contentType === 'Movie' ? <Film className="w-2.5 h-2.5" /> :
               content.contentType === 'Series' ? <Tv className="w-2.5 h-2.5" /> :
               <Sword className="w-2.5 h-2.5" />}
              {content.contentType}
            </span>
          </div>

          {/* Play icon on hover */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-12 h-12 rounded-full bg-purple-600/80 backdrop-blur-sm flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Play className="w-5 h-5 text-white fill-white ml-0.5" />
            </div>
          </div>
        </div>

        {/* Card Content */}
        <CardContent className="p-3 flex-1 flex flex-col gap-1.5">
          {/* Secondary Title */}
          {content.secondaryTitle && (
            <p className="text-[11px] text-muted-foreground truncate leading-tight">{content.secondaryTitle}</p>
          )}
          {/* Main Title */}
          <h3 className="text-sm font-bold text-white truncate leading-tight group-hover:text-purple-400 transition-colors">
            {content.mainTitle}
          </h3>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
            {content.releaseYear && (
              <span className="flex items-center gap-0.5">
                <Calendar className="w-2.5 h-2.5" />
                {content.releaseYear}
              </span>
            )}
            {content.imdbRating && (
              <span className="flex items-center gap-0.5 text-amber-400">
                <Star className="w-2.5 h-2.5 fill-amber-400" />
                {content.imdbRating}
              </span>
            )}
          </div>
          <Button
            size="sm"
            className="w-full mt-auto bg-purple-600/20 hover:bg-purple-600 text-purple-400 hover:text-white text-xs h-7 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-200"
          >
            View Details
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ========= Content Detail Modal =========
function ContentDetailModal({ content, open, onClose }: { content: Content | null; open: boolean; onClose: () => void }) {
  const [showReportDialog, setShowReportDialog] = useState(false)
  const [showRequestDialog, setShowRequestDialog] = useState(false)

  if (!content) return null

  const imageUrl = extractImageUrl(content.imageHtml)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] p-0 bg-cineverse-800 border-white/[0.06] overflow-hidden">
        <DialogTitle className="sr-only">{content.mainTitle}</DialogTitle>
        <ScrollArea className="max-h-[90vh]">
          <div className="relative">
            {/* Hero backdrop */}
            <div className="relative h-48 sm:h-64 overflow-hidden">
              <img
                src={imageUrl}
                alt={content.mainTitle}
                className="w-full h-full object-cover blur-sm scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-cineverse-800 via-cineverse-800/60 to-transparent" />
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Info */}
            <div className="px-4 sm:px-8 pb-8 -mt-24 relative z-10">
              <div className="flex flex-col sm:flex-row gap-6">
                {/* Poster */}
                <div className="flex-shrink-0 w-36 sm:w-48 mx-auto sm:mx-0">
                  <div className="aspect-2-3 rounded-xl overflow-hidden shadow-2xl shadow-purple-500/10 border border-white/10">
                    <img
                      src={imageUrl}
                      alt={content.mainTitle}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Details */}
                <div className="flex-1 space-y-4">
                  {/* Title */}
                  <div>
                    {content.secondaryTitle && (
                      <p className="text-sm text-muted-foreground mb-1">{content.secondaryTitle}</p>
                    )}
                    <h2 className="text-2xl sm:text-3xl font-black text-white">{content.mainTitle}</h2>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-sm">
                    {/* Season - only for Series/Anime */}
                    {(content.contentType === 'Series' || content.contentType === 'Anime') && content.season && (
                      <div className="flex items-center gap-2 text-gray-300">
                        <Tv className="w-4 h-4 text-purple-400 shrink-0" />
                        <span className="text-muted-foreground">Season:</span>
                        <span className="font-medium">{content.season}</span>
                      </div>
                    )}

                    {/* IMDB Rating */}
                    {content.imdbRating && (
                      <div className="flex items-center gap-2 text-gray-300">
                        <Star className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
                        <span className="text-muted-foreground">IMDb:</span>
                        <span className="font-bold text-amber-400">{content.imdbRating}/10</span>
                      </div>
                    )}

                    {/* Release Year */}
                    {content.releaseYear && (
                      <div className="flex items-center gap-2 text-gray-300">
                        <Calendar className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span className="text-muted-foreground">Year:</span>
                        <span className="font-medium">{content.releaseYear}</span>
                      </div>
                    )}

                    {/* Genre */}
                    {content.genre && content.genre.length > 0 && (
                      <div className="flex items-start gap-2 text-gray-300">
                        <Tag className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                        <span className="text-muted-foreground shrink-0">Genre:</span>
                        <div className="flex flex-wrap gap-1">
                          {content.genre.map(g => (
                            <Badge key={g} variant="secondary" className="text-[11px] bg-cineverse-700 text-gray-300 border-white/[0.04] h-5">
                              {g}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Language */}
                    {content.language && content.language.length > 0 && (
                      <div className="flex items-start gap-2 text-gray-300">
                        <Globe className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="text-muted-foreground shrink-0">Language:</span>
                        <div className="flex flex-wrap gap-1">
                          {content.language.map(l => (
                            <Badge key={l} variant="secondary" className="text-[11px] bg-cineverse-700 text-gray-300 border-white/[0.04] h-5">
                              {l}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Subtitle */}
                    {content.subtitle && content.subtitle.length > 0 && (
                      <div className="flex items-start gap-2 text-gray-300">
                        <Subtitles className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                        <span className="text-muted-foreground shrink-0">Subtitle:</span>
                        <div className="flex flex-wrap gap-1">
                          {content.subtitle.map(s => (
                            <Badge key={s} variant="secondary" className="text-[11px] bg-cineverse-700 text-gray-300 border-white/[0.04] h-5">
                              {s}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Quality Options */}
                    {content.quality && content.quality.length > 0 && (
                      <div className="flex items-start gap-2 text-gray-300">
                        <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                        <span className="text-muted-foreground shrink-0">Quality:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {content.quality.map(q => (
                            <QualityBadge key={q} quality={q} />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* File Size */}
                    {content.fileSize && (
                      <div className="flex items-center gap-2 text-gray-300">
                        <HardDrive className="w-4 h-4 text-orange-400 shrink-0" />
                        <span className="text-muted-foreground">Size:</span>
                        <span className="font-medium">{content.fileSize}</span>
                      </div>
                    )}

                    {/* Format */}
                    {content.format && (
                      <div className="flex items-center gap-2 text-gray-300">
                        <FileCode className="w-4 h-4 text-pink-400 shrink-0" />
                        <span className="text-muted-foreground">Format:</span>
                        <span className="font-medium">{content.format}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    <Button
                      onClick={() => setShowRequestDialog(true)}
                      className="bg-purple-600/20 hover:bg-purple-600 text-purple-400 hover:text-white border border-purple-500/30 hover:border-purple-500/50 text-xs h-8"
                      size="sm"
                    >
                      <MessageSquarePlus className="w-3.5 h-3.5 mr-1.5" />
                      Request Content
                    </Button>
                    <Button
                      onClick={() => setShowReportDialog(true)}
                      className="bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/30 hover:border-rose-500/50 text-xs h-8"
                      size="sm"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />
                      Report Issue
                    </Button>
                  </div>
                </div>
              </div>

              {/* Storyline */}
              {content.storyline && (
                <div className="mt-8">
                  <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                    <div className="w-1 h-5 bg-purple-500 rounded-full" />
                    Storyline
                  </h3>
                  <p className="text-gray-400 leading-relaxed text-sm whitespace-pre-wrap bg-cineverse-900/50 rounded-xl p-4 border border-white/[0.03]">
                    {content.storyline}
                  </p>
                </div>
              )}

              {/* Download Section */}
              {content.downloadGroups && content.downloadGroups.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <div className="w-1 h-5 bg-cyan-500 rounded-full" />
                    <Download className="w-5 h-5 text-cyan-400" />
                    Download Links
                  </h3>
                  <div className="space-y-4">
                    {content.downloadGroups.map((group: DownloadGroup, gi: number) => (
                      <div key={group.id || gi} className="bg-cineverse-900/50 rounded-xl border border-white/[0.04] overflow-hidden">
                        <div className="px-4 py-3 bg-cineverse-700/30 border-b border-white/[0.04]">
                          <h4 className="font-bold text-white flex items-center gap-2">
                            <FolderOpen className="w-4 h-4 text-cyan-400" />
                            {group.title || `Download Group ${gi + 1}`}
                          </h4>
                        </div>
                        <div className="p-4 space-y-2">
                          {group.links && group.links.map((link, li: number) => (
                            <div key={link.id || li} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 p-3 bg-cineverse-800/50 rounded-lg border border-white/[0.03] hover:border-purple-500/20 transition-colors">
                              <div className="flex-1 min-w-0">
                                <span className="text-sm font-medium text-gray-300">{link.title}</span>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                {link.quality && link.quality.map((q: string) => (
                                  <QualityBadge key={q} quality={q} size="xs" />
                                ))}
                                <a
                                  href={link.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg transition-colors"
                                >
                                  <Download className="w-3 h-3" />
                                  Download
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        {/* Report Dialog */}
        <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
          <DialogContent className="max-w-md bg-cineverse-800 border-white/[0.06]">
            <DialogTitle className="text-white font-bold text-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
              Report Issue
            </DialogTitle>
            <ReportForm contentId={content.id} contentTitle={content.mainTitle} onClose={() => setShowReportDialog(false)} />
          </DialogContent>
        </Dialog>

        {/* Request Dialog */}
        <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
          <DialogContent className="max-w-md bg-cineverse-800 border-white/[0.06]">
            <DialogTitle className="text-white font-bold text-lg flex items-center gap-2">
              <MessageSquarePlus className="w-5 h-5 text-purple-400" />
              Request Content
            </DialogTitle>
            <RequestForm onClose={() => setShowRequestDialog(false)} />
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
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
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'REPORT',
          title: `Report: ${contentTitle}`,
          message: message.trim(),
          link: link.trim() || undefined,
        }),
      })
      setMessage('')
      setLink('')
      onClose()
      toast.success('Report submitted successfully!')
    } catch (error) {
      console.error('Failed to submit report:', error)
      toast.error('Failed to submit report. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-xs text-muted-foreground mb-1.5 block">Problem URL (optional)</label>
        <Input
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="https://..."
          className="bg-cineverse-900 border-white/[0.06] text-white text-sm"
        />
      </div>
      <div>
        <label className="text-xs text-muted-foreground mb-1.5 block">Describe the issue *</label>
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="e.g. Download link is broken, wrong quality..."
          className="bg-cineverse-900 border-white/[0.06] text-white text-sm min-h-[80px]"
          required
        />
      </div>
      <Button type="submit" disabled={loading || !message.trim()} className="w-full bg-rose-600 hover:bg-rose-700 text-white">
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
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'REQUEST',
          title: title.trim(),
          contentType: contentType || undefined,
          message: message.trim(),
        }),
      })
      setTitle('')
      setContentType('')
      setMessage('')
      onClose()
      toast.success('Request submitted successfully!')
    } catch (error) {
      console.error('Failed to submit request:', error)
      toast.error('Failed to submit request. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-xs text-muted-foreground mb-1.5 block">Content Title *</label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Breaking Bad Season 5"
          className="bg-cineverse-900 border-white/[0.06] text-white text-sm"
          required
        />
      </div>
      <div>
        <label className="text-xs text-muted-foreground mb-1.5 block">Content Type</label>
        <Select value={contentType} onValueChange={setContentType}>
          <SelectTrigger className="bg-cineverse-900 border-white/[0.06] text-white text-sm">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent className="bg-cineverse-800 border-white/[0.06]">
            <SelectItem value="Movie">Movie</SelectItem>
            <SelectItem value="Series">Series</SelectItem>
            <SelectItem value="Anime">Anime</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="text-xs text-muted-foreground mb-1.5 block">Message *</label>
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Describe what you're looking for..."
          className="bg-cineverse-900 border-white/[0.06] text-white text-sm min-h-[80px]"
          required
        />
      </div>
      <Button type="submit" disabled={loading || !title.trim() || !message.trim()} className="w-full bg-purple-600 hover:bg-purple-700 text-white">
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
    <section className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-cyan-500 rounded-full" />
        <h2 className="text-xl sm:text-2xl font-black text-white">{category.name}</h2>
        {category.description && (
          <span className="text-sm text-muted-foreground hidden sm:inline">— {category.description}</span>
        )}
        <TrendingUp className="w-5 h-5 text-purple-400 ml-auto" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
        {categoryContents.map(content => (
          <ContentCard key={content.id} content={content} onClick={() => onContentClick(content)} />
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
  const [detailOpen, setDetailOpen] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)
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
      params.set('limit', '30')

      const response = await fetch(`/api/content?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setContents(data.contents || [])
        setTotalPages(data.totalPages || 1)
        setTotal(data.total || 0)
      }
    } catch (error) {
      console.error('Failed to fetch contents:', error)
    } finally {
      setLoading(false)
    }
  }, [page])

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data || [])
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }, [])

  useEffect(() => {
    fetchContents(searchQuery, activeTab)
    fetchCategories()
  }, [searchQuery, activeTab, page, fetchContents, fetchCategories])

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSearch = (value: string) => {
    setSearchInput(value)
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => {
      setSearchQuery(value)
      setPage(1)
    }, 400)
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    setPage(1)
  }

  const openDetail = (content: Content) => {
    setSelectedContent(content)
    setDetailOpen(true)
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Filter categories to only show those with content
  const activeCategories = categories.filter(cat => cat.contentIds && cat.contentIds.length > 0)

  // Count stats
  const movieCount = total // We'll approximate from what we have

  return (
    <div className="min-h-screen bg-cineverse-900 flex flex-col">
      {/* ========= HEADER ========= */}
      <header className="sticky top-0 z-50 glass border-b border-white/[0.04]">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <a href="/" className="flex items-center gap-2.5 group shrink-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-purple-600 via-violet-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-purple-500/25 group-hover:shadow-purple-500/40 transition-shadow">
                <Play className="w-4 h-4 sm:w-5 sm:h-5 text-white fill-white ml-0.5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-gradient tracking-tight hidden sm:block">
                CINEVERSE
              </h1>
            </a>

            {/* Search Bar */}
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search movies, series, anime..."
                  value={searchInput}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 bg-cineverse-800/80 border-white/[0.06] text-white placeholder:text-muted-foreground focus:border-purple-500/50 focus:ring-purple-500/20 h-9 sm:h-10 text-sm rounded-xl"
                />
                {searchInput && (
                  <button
                    onClick={() => { setSearchInput(''); setSearchQuery(''); setPage(1) }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Nav Links */}
            <div className="flex items-center gap-2 shrink-0">
              <a href="/admin/login" className="text-[11px] sm:text-xs text-muted-foreground hover:text-purple-400 transition-colors hidden sm:block">
                Admin
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* ========= HERO SECTION ========= */}
        {!searchQuery && activeTab === 'all' && (
          <section className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-cineverse-900 to-cineverse-900" />
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-10 left-10 w-72 h-72 bg-purple-600/30 rounded-full blur-[120px]" />
              <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-600/20 rounded-full blur-[150px]" />
            </div>
            <div className="container mx-auto px-4 py-12 sm:py-20 relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="text-center max-w-3xl mx-auto"
              >
                <div className="inline-flex items-center gap-2 bg-purple-600/10 border border-purple-500/20 rounded-full px-4 py-1.5 mb-6">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Premium Entertainment Hub</span>
                </div>
                <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white mb-4 leading-tight">
                  Discover Your Next
                  <span className="text-gradient"> Favorite </span>
                  Watch
                </h2>
                <p className="text-muted-foreground text-sm sm:text-lg max-w-xl mx-auto mb-8">
                  Explore 300+ movies, series, and anime in stunning quality. Download with ease and enjoy anywhere.
                </p>
                <div className="flex items-center justify-center gap-4 sm:gap-6 text-sm">
                  <div className="flex items-center gap-1.5">
                    <Film className="w-4 h-4 text-purple-400" />
                    <span className="text-white font-bold">Movies</span>
                  </div>
                  <div className="w-1 h-1 bg-muted-foreground rounded-full" />
                  <div className="flex items-center gap-1.5">
                    <Tv className="w-4 h-4 text-cyan-400" />
                    <span className="text-white font-bold">Series</span>
                  </div>
                  <div className="w-1 h-1 bg-muted-foreground rounded-full" />
                  <div className="flex items-center gap-1.5">
                    <Sword className="w-4 h-4 text-rose-400" />
                    <span className="text-white font-bold">Anime</span>
                  </div>
                </div>
              </motion.div>
            </div>
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
                <TabsTrigger value="all" className="text-xs sm:text-sm px-3 sm:px-5 rounded-lg data-[state=active]:bg-purple-600 data-[state=active]:text-white font-bold">
                  All
                </TabsTrigger>
                <TabsTrigger value="Movie" className="text-xs sm:text-sm px-3 sm:px-5 rounded-lg data-[state=active]:bg-purple-600 data-[state=active]:text-white font-bold">
                  <Film className="w-3.5 h-3.5 mr-1 hidden sm:inline" />
                  Movies
                </TabsTrigger>
                <TabsTrigger value="Series" className="text-xs sm:text-sm px-3 sm:px-5 rounded-lg data-[state=active]:bg-purple-600 data-[state=active]:text-white font-bold">
                  <Tv className="w-3.5 h-3.5 mr-1 hidden sm:inline" />
                  Series
                </TabsTrigger>
                <TabsTrigger value="Anime" className="text-xs sm:text-sm px-3 sm:px-5 rounded-lg data-[state=active]:bg-purple-600 data-[state=active]:text-white font-bold">
                  <Sword className="w-3.5 h-3.5 mr-1 hidden sm:inline" />
                  Anime
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Results count */}
            <div className="text-xs text-muted-foreground shrink-0">
              {total} {total === 1 ? 'result' : 'results'}
            </div>
          </div>

          {/* Content Grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="aspect-2-3 rounded-xl bg-cineverse-800" />
                  <Skeleton className="h-3 w-3/4 bg-cineverse-800" />
                  <Skeleton className="h-3 w-1/2 bg-cineverse-800" />
                </div>
              ))}
            </div>
          ) : contents.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="w-20 h-20 rounded-2xl bg-cineverse-800 flex items-center justify-center mx-auto mb-4">
                <Film className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No content found</h3>
              <p className="text-muted-foreground text-sm">
                {searchQuery ? 'Try a different search term' : 'Check back later for new content'}
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {contents.map(content => (
                <ContentCard key={content.id} content={content} onClick={() => openDetail(content)} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="border-white/[0.06] text-muted-foreground hover:text-white hover:bg-cineverse-700 text-xs"
              >
                Previous
              </Button>
              <span className="text-xs text-muted-foreground px-3">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="border-white/[0.06] text-muted-foreground hover:text-white hover:bg-cineverse-700 text-xs"
              >
                Next
              </Button>
            </div>
          )}
        </section>
      </main>

      {/* ========= FOOTER ========= */}
      <footer className="bg-cineverse-900 border-t border-white/[0.04] py-8 mt-auto">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center">
                <Play className="w-3.5 h-3.5 text-white fill-white ml-0.5" />
              </div>
              <span className="font-black text-gradient">CINEVERSE</span>
            </div>
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} Cineverse. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <a href="/admin/login" className="text-xs text-muted-foreground hover:text-purple-400 transition-colors">
                Admin Panel
              </a>
            </div>
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
            className="fixed bottom-6 right-6 z-50 w-10 h-10 rounded-full bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/30 flex items-center justify-center transition-colors"
          >
            <ArrowUp className="w-4 h-4" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ========= CONTENT DETAIL MODAL ========= */}
      <ContentDetailModal
        content={selectedContent}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
      />
    </div>
  )
}
