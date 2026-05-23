'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  ArrowLeft,
  MessageSquarePlus,
  AlertTriangle,
  Trash2,
  CheckCircle2,
  Clock,
  Loader2,
  RefreshCw,
  Play,
} from 'lucide-react'
import { toast } from 'sonner'

interface FeedbackItem {
  id: string
  type: 'REQUEST' | 'REPORT'
  title: string
  message: string
  link?: string | null
  contentType?: string | null
  isRead: boolean
  createdAt: string
  expiresAt: string
}

function formatTimeAgo(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diffMs / 60000)
  const hours = Math.floor(diffMs / 3600000)
  const days = Math.floor(diffMs / 86400000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

export default function AdminFeedbackPage() {
  const router = useRouter()
  const [authLoading, setAuthLoading] = useState(true)
  const [feedback, setFeedback] = useState<FeedbackItem[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [markingReadId, setMarkingReadId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('requests')

  // Auth check
  useEffect(() => {
    const adminUid = localStorage.getItem('adminUid')
    if (!adminUid) {
      router.push('/admin/login')
      return
    }
    setAuthLoading(false)
  }, [router])

  // Fetch feedback
  const fetchFeedback = useCallback(async (showSync = false) => {
    try {
      if (showSync) {
        setSyncing(true)
      } else {
        setLoading(true)
      }
      const res = await fetch('/api/feedback')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setFeedback(data)
    } catch {
      toast.error('Failed to load feedback. Please try again.')
    } finally {
      setLoading(false)
      setSyncing(false)
    }
  }, [])

  useEffect(() => {
    if (!authLoading) fetchFeedback()
  }, [authLoading, fetchFeedback])

  // Mark as read
  const handleMarkAsRead = async (id: string) => {
    try {
      setMarkingReadId(id)
      const res = await fetch(`/api/feedback/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: true }),
      })
      if (!res.ok) throw new Error('Failed')
      setFeedback((prev) =>
        prev.map((f) => (f.id === id ? { ...f, isRead: true } : f))
      )
      toast.success('Marked as read')
    } catch {
      toast.error('Failed to mark as read')
    } finally {
      setMarkingReadId(null)
    }
  }

  // Delete feedback
  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this feedback? This cannot be undone.')) return
    try {
      setDeletingId(id)
      const res = await fetch(`/api/feedback/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed')
      setFeedback((prev) => prev.filter((f) => f.id !== id))
      toast.success('Feedback deleted')
    } catch {
      toast.error('Failed to delete feedback')
    } finally {
      setDeletingId(null)
    }
  }

  const requests = feedback.filter((f) => f.type === 'REQUEST')
  const reports = feedback.filter((f) => f.type === 'REPORT')
  const unreadRequests = requests.filter((f) => !f.isRead).length
  const unreadReports = reports.filter((f) => !f.isRead).length

  // Auth loading
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="h-10 w-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const renderFeedbackCard = (item: FeedbackItem) => (
    <Card
      key={item.id}
      className="bg-[#12121a] border-white/[0.06] hover:border-white/[0.12] transition-colors duration-200 animate-in fade-in duration-300"
    >
      <CardContent className="p-4 sm:p-5">
        <div className="flex flex-col gap-3">
          {/* Top row: badges + time */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className={
                  item.type === 'REQUEST'
                    ? 'bg-purple-500/15 text-purple-400 border-purple-500/30'
                    : 'bg-red-500/15 text-red-400 border-red-500/30'
                }
              >
                {item.type === 'REQUEST' ? (
                  <MessageSquarePlus className="h-3 w-3 mr-1" />
                ) : (
                  <AlertTriangle className="h-3 w-3 mr-1" />
                )}
                {item.type === 'REQUEST' ? 'Request' : 'Report'}
              </Badge>

              {!item.isRead && (
                <Badge className="bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 mr-1.5 animate-pulse" />
                  New
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-white/30 text-xs shrink-0">
              <Clock className="h-3 w-3" />
              <span>{formatTimeAgo(item.createdAt)}</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-white font-semibold text-sm sm:text-base leading-snug">
            {item.title}
          </h3>

          {/* Message */}
          <p className="text-white/50 text-sm leading-relaxed whitespace-pre-wrap">
            {item.message}
          </p>

          {/* Link (for reports) */}
          {item.type === 'REPORT' && item.link && (
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 text-sm transition-colors"
            >
              <Play className="h-3 w-3" />
              <span className="truncate max-w-xs sm:max-w-md">{item.link}</span>
            </a>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-1">
            {!item.isRead && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleMarkAsRead(item.id)}
                disabled={markingReadId === item.id}
                className="h-8 text-xs gap-1.5 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 border border-cyan-500/20"
              >
                {markingReadId === item.id ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-3 w-3" />
                )}
                Mark Read
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(item.id)}
              disabled={deletingId === item.id}
              className="h-8 text-xs gap-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20"
            >
              {deletingId === item.id ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Trash2 className="h-3 w-3" />
              )}
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderEmptyState = (type: 'REQUEST' | 'REPORT') => (
    <div className="flex flex-col items-center justify-center py-16 px-4 animate-in fade-in duration-300">
      <div className="h-14 w-14 rounded-xl bg-white/5 flex items-center justify-center mb-4">
        {type === 'REQUEST' ? (
          <MessageSquarePlus className="h-7 w-7 text-white/20" />
        ) : (
          <AlertTriangle className="h-7 w-7 text-white/20" />
        )}
      </div>
      <p className="text-white/40 text-sm font-medium">
        No {type === 'REQUEST' ? 'requests' : 'reports'} yet
      </p>
      <p className="text-white/20 text-xs mt-1">
        {type === 'REQUEST'
          ? 'User content requests will appear here'
          : 'User reports will appear here'}
      </p>
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0f]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-md border-b border-white/[0.06]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link
                href="/admin/dashboard"
                className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="text-sm hidden sm:inline">Dashboard</span>
              </Link>
              <div className="h-6 w-px bg-white/10 hidden sm:block" />
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center">
                  <MessageSquarePlus className="h-4 w-4 text-white" />
                </div>
                <h1 className="text-lg font-bold text-white">Feedback Center</h1>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => fetchFeedback(true)}
              disabled={syncing}
              className="gap-2 text-white/60 hover:text-white hover:bg-white/5"
            >
              <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{syncing ? 'Syncing...' : 'Refresh'}</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 animate-in fade-in duration-300">
          <Card className="bg-[#12121a] border-white/[0.06]">
            <CardContent className="p-3 sm:p-4">
              <p className="text-xs text-white/40 mb-1">Total</p>
              <p className="text-xl font-bold text-white">{feedback.length}</p>
            </CardContent>
          </Card>
          <Card className="bg-[#12121a] border-white/[0.06]">
            <CardContent className="p-3 sm:p-4">
              <p className="text-xs text-white/40 mb-1">Requests</p>
              <p className="text-xl font-bold text-white">{requests.length}</p>
            </CardContent>
          </Card>
          <Card className="bg-[#12121a] border-white/[0.06]">
            <CardContent className="p-3 sm:p-4">
              <p className="text-xs text-white/40 mb-1">Reports</p>
              <p className="text-xl font-bold text-white">{reports.length}</p>
            </CardContent>
          </Card>
          <Card className="bg-[#12121a] border-white/[0.06]">
            <CardContent className="p-3 sm:p-4">
              <p className="text-xs text-white/40 mb-1">Unread</p>
              <p className="text-xl font-bold text-white">
                {feedback.filter((f) => !f.isRead).length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-[#12121a] border border-white/[0.06] p-1 h-auto">
            <TabsTrigger
              value="requests"
              className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400 text-white/50 text-sm px-4 py-2 transition-colors"
            >
              <MessageSquarePlus className="h-4 w-4 mr-1.5" />
              Requests
              {unreadRequests > 0 && (
                <span className="ml-1.5 h-5 min-w-5 px-1.5 rounded-full bg-purple-500/30 text-purple-300 text-[10px] font-bold flex items-center justify-center">
                  {unreadRequests}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="reports"
              className="data-[state=active]:bg-red-500/20 data-[state=active]:text-red-400 text-white/50 text-sm px-4 py-2 transition-colors"
            >
              <AlertTriangle className="h-4 w-4 mr-1.5" />
              Reports
              {unreadReports > 0 && (
                <span className="ml-1.5 h-5 min-w-5 px-1.5 rounded-full bg-red-500/30 text-red-300 text-[10px] font-bold flex items-center justify-center">
                  {unreadReports}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="mt-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="h-8 w-8 text-purple-400 animate-spin mb-4" />
                <p className="text-white/40 text-sm">Loading requests...</p>
              </div>
            ) : requests.length === 0 ? (
              renderEmptyState('REQUEST')
            ) : (
              <div className="space-y-3">
                {requests.map((item) => renderFeedbackCard(item))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="reports" className="mt-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="h-8 w-8 text-red-400 animate-spin mb-4" />
                <p className="text-white/40 text-sm">Loading reports...</p>
              </div>
            ) : reports.length === 0 ? (
              renderEmptyState('REPORT')
            ) : (
              <div className="space-y-3">
                {reports.map((item) => renderFeedbackCard(item))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-white/[0.04] py-4 bg-[#0a0a0f]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-xs text-white/30">Cineverse Admin · Feedback Center</span>
        </div>
      </footer>
    </div>
  )
}
