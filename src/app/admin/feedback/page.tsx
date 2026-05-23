'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
  Activity,
  Inbox,
  Eye,
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

// Stat card configs
const statCardConfigs = [
  { key: 'total', label: 'Total', icon: Inbox, gradient: 'from-purple-600 to-purple-400', bgGlow: 'rgba(139,92,246,0.15)', iconBg: 'bg-purple-500/20', iconColor: 'text-purple-400' },
  { key: 'requests', label: 'Requests', icon: MessageSquarePlus, gradient: 'from-blue-600 to-blue-400', bgGlow: 'rgba(59,130,246,0.15)', iconBg: 'bg-blue-500/20', iconColor: 'text-blue-400' },
  { key: 'reports', label: 'Reports', icon: AlertTriangle, gradient: 'from-red-600 to-red-400', bgGlow: 'rgba(239,68,68,0.15)', iconBg: 'bg-red-500/20', iconColor: 'text-red-400' },
  { key: 'unread', label: 'Unread', icon: Eye, gradient: 'from-cyan-600 to-cyan-400', bgGlow: 'rgba(6,182,212,0.15)', iconBg: 'bg-cyan-500/20', iconColor: 'text-cyan-400' },
] as const

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } }
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }
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
  const unreadCount = feedback.filter((f) => !f.isRead).length

  const statValues = {
    total: feedback.length,
    requests: requests.length,
    reports: reports.length,
    unread: unreadCount,
  }

  // Auth loading
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="h-10 w-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            <div className="absolute inset-0 h-10 w-10 border-2 border-cyan-500/30 border-b-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
          </div>
          <p className="text-white/30 text-sm">Authenticating...</p>
        </div>
      </div>
    )
  }

  const renderFeedbackCard = (item: FeedbackItem) => (
    <motion.div
      key={item.id}
      variants={itemVariants}
      className="group"
    >
      <Card className="bg-[#12121a]/70 border-white/[0.06] hover:border-white/[0.12] transition-all duration-300 overflow-hidden relative">
        {/* Unread indicator */}
        {!item.isRead && (
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-500/60 to-purple-500/60" />
        )}
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col gap-3">
            {/* Top row: badges + time */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className={
                    item.type === 'REQUEST'
                      ? 'bg-purple-500/10 text-purple-400 border-purple-500/25'
                      : 'bg-red-500/10 text-red-400 border-red-500/25'
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
                  <Badge className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/25 animate-pulse">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 mr-1.5" />
                    New
                  </Badge>
                )}

                {item.contentType && (
                  <span className="text-white/20 text-[10px] px-1.5 py-0.5 rounded bg-white/[0.04]">
                    {item.contentType}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-white/25 text-xs shrink-0">
                <Clock className="h-3 w-3" />
                <span>{formatTimeAgo(item.createdAt)}</span>
              </div>
            </div>

            {/* Title */}
            <h3 className={`font-semibold text-sm sm:text-base leading-snug ${item.isRead ? 'text-white/60' : 'text-white'}`}>
              {item.title}
            </h3>

            {/* Message */}
            <p className="text-white/40 text-sm leading-relaxed whitespace-pre-wrap">
              {item.message}
            </p>

            {/* Link (for reports) */}
            {item.type === 'REPORT' && item.link && (
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-cyan-400/70 hover:text-cyan-300 text-sm transition-colors"
              >
                <Play className="h-3 w-3" />
                <span className="truncate max-w-xs sm:max-w-md">{item.link}</span>
              </a>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 pt-1 border-t border-white/[0.04]">
              {!item.isRead && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleMarkAsRead(item.id)}
                  disabled={markingReadId === item.id}
                  className="h-8 text-xs gap-1.5 text-cyan-400/70 hover:text-cyan-400 hover:bg-cyan-500/10 border border-cyan-500/15 rounded-lg transition-colors"
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
                className="h-8 text-xs gap-1.5 text-white/20 hover:text-red-400 hover:bg-red-500/10 border border-white/[0.06] hover:border-red-500/15 rounded-lg transition-colors"
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
    </motion.div>
  )

  const renderEmptyState = (type: 'REQUEST' | 'REPORT') => (
    <motion.div
      className="flex flex-col items-center justify-center py-16 px-4"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <div className="h-16 w-16 rounded-2xl bg-white/[0.03] flex items-center justify-center mb-4 border border-white/[0.04]">
        {type === 'REQUEST' ? (
          <MessageSquarePlus className="h-8 w-8 text-white/10" />
        ) : (
          <AlertTriangle className="h-8 w-8 text-white/10" />
        )}
      </div>
      <p className="text-white/35 text-sm font-medium">
        No {type === 'REQUEST' ? 'requests' : 'reports'} yet
      </p>
      <p className="text-white/15 text-xs mt-1">
        {type === 'REQUEST'
          ? 'User content requests will appear here'
          : 'User reports will appear here'}
      </p>
    </motion.div>
  )

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0f]">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-white/[0.06]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link href="/admin/dashboard" className="flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors">
                <ArrowLeft className="h-4 w-4" />
                <span className="text-sm hidden sm:inline">Dashboard</span>
              </Link>
              <div className="w-px h-6 bg-white/[0.06] hidden sm:block" />
              <div className="flex items-center gap-2.5">
                <img src="/Cineverse.png" alt="Cineverse" className="h-9 w-9 rounded-xl shadow-lg shadow-purple-500/20 object-cover" />
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent leading-tight">Cineverse</span>
                  <div className="w-px h-4 bg-white/[0.08] hidden sm:block" />
                  <span className="text-sm text-white/40 font-medium hidden sm:inline">Feedback Center</span>
                </div>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => fetchFeedback(true)}
              disabled={syncing}
              className="gap-2 text-white/40 hover:text-white/70 hover:bg-white/[0.04] rounded-xl transition-colors"
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
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {statCardConfigs.map((card) => {
            const Icon = card.icon
            const value = statValues[card.key]
            return (
              <motion.div key={card.key} variants={itemVariants}>
                <Card className="bg-[#12121a] border-white/[0.06] overflow-hidden relative group hover:border-white/[0.1] transition-all duration-300">
                  <div
                    className="absolute top-0 right-0 w-20 h-20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: card.bgGlow }}
                  />
                  <CardContent className="p-3 sm:p-4 relative z-10">
                    <div className="flex items-start justify-between mb-2">
                      <div className={`h-8 w-8 rounded-lg ${card.iconBg} flex items-center justify-center`}>
                        <Icon className={`h-4 w-4 ${card.iconColor}`} />
                      </div>
                    </div>
                    <motion.p
                      className="text-2xl sm:text-3xl font-bold text-white tabular-nums"
                      key={value}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {value}
                    </motion.p>
                    <p className="text-[11px] text-white/30 mt-0.5 font-medium">{card.label}</p>
                  </CardContent>
                  <div className={`h-[2px] bg-gradient-to-r ${card.gradient} opacity-0 group-hover:opacity-50 transition-opacity duration-500`} />
                </Card>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-[#12121a] border border-white/[0.06] p-1 h-auto rounded-xl">
              <TabsTrigger
                value="requests"
                className="data-[state=active]:bg-purple-500/15 data-[state=active]:text-purple-400 text-white/35 text-sm px-4 py-2.5 rounded-lg transition-all duration-200"
              >
                <MessageSquarePlus className="h-4 w-4 mr-1.5" />
                Requests
                {unreadRequests > 0 && (
                  <span className="ml-1.5 h-5 min-w-5 px-1.5 rounded-full bg-purple-500/25 text-purple-300 text-[10px] font-bold flex items-center justify-center">
                    {unreadRequests}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="reports"
                className="data-[state=active]:bg-red-500/15 data-[state=active]:text-red-400 text-white/35 text-sm px-4 py-2.5 rounded-lg transition-all duration-200"
              >
                <AlertTriangle className="h-4 w-4 mr-1.5" />
                Reports
                {unreadReports > 0 && (
                  <span className="ml-1.5 h-5 min-w-5 px-1.5 rounded-full bg-red-500/25 text-red-300 text-[10px] font-bold flex items-center justify-center">
                    {unreadReports}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="requests" className="mt-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="relative inline-flex">
                    <div className="h-10 w-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                    <div className="absolute inset-0 h-10 w-10 border-2 border-cyan-500/30 border-b-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
                  </div>
                  <p className="text-white/30 text-sm mt-4">Loading requests...</p>
                </div>
              ) : requests.length === 0 ? (
                renderEmptyState('REQUEST')
              ) : (
                <motion.div
                  className="space-y-3"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {requests.map((item) => renderFeedbackCard(item))}
                </motion.div>
              )}
            </TabsContent>

            <TabsContent value="reports" className="mt-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="relative inline-flex">
                    <div className="h-10 w-10 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                    <div className="absolute inset-0 h-10 w-10 border-2 border-cyan-500/30 border-b-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
                  </div>
                  <p className="text-white/30 text-sm mt-4">Loading reports...</p>
                </div>
              ) : reports.length === 0 ? (
                renderEmptyState('REPORT')
              ) : (
                <motion.div
                  className="space-y-3"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {reports.map((item) => renderFeedbackCard(item))}
                </motion.div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-white/[0.04] bg-[#0a0a0f]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <img src="/Cineverse.png" alt="Cineverse" className="h-7 w-7 rounded-lg shadow-md shadow-purple-500/20 object-cover" />
              <span className="text-sm font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent tracking-wider">CINEVERSE</span>
            </div>
            <p className="text-xs text-white/20">© {new Date().getFullYear()} Cineverse. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
