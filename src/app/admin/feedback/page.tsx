'use client'

import { useState, useEffect } from 'react'

import {
  MessageSquarePlus,
  AlertTriangle,
  Trash2,
  CheckCircle2,
  Clock,
  ArrowLeft,
  LayoutDashboard,
  Filter,
  CheckCircle,
  Film,
  Tv,
  Gamepad2,
  ExternalLink,
  ChevronRight,
  RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import Link from 'next/link'
import { auth } from '@/lib/firebase'

interface Feedback {
  id: string
  type: 'REQUEST' | 'REPORT'
  title: string
  contentType?: string
  message: string
  link?: string
  isRead: boolean
  createdAt: string
  expiresAt: string
}

export default function AdminFeedbackPage() {
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        window.location.href = '/admin/login'
      }
    })
    fetchFeedback()
    return () => unsubscribe()
  }, [])

  const fetchFeedback = async () => {
    setRefreshing(true)
    try {
      const response = await fetch('/api/feedback')
      if (response.ok) {
        const data = await response.json()
        setFeedback(data)
      }
    } catch (error) {
      console.error('Failed to fetch feedback:', error)
      toast.error('Failed to load feedback')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      const response = await fetch(`/api/feedback/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: true }),
      })

      if (response.ok) {
        setFeedback(prev => prev.map(f => f.id === id ? { ...f, isRead: true } : f))
        toast.success('Marked as read')
      }
    } catch (error) {
      console.error('Update error:', error)
    }
  }

  const deleteFeedback = async (id: string) => {
    try {
      const response = await fetch(`/api/feedback/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setFeedback(prev => prev.filter(f => f.id !== id))
        toast.success('Feedback deleted')
      }
    } catch (error) {
      console.error('Delete error:', error)
    }
  }

  const getTimeRemaining = (expiresAt: string) => {
    const remaining = new Date(expiresAt).getTime() - new Date().getTime()
    const hours = Math.max(0, Math.floor(remaining / (1000 * 60 * 60)))
    const minutes = Math.max(0, Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60)))
    return `${hours}h ${minutes}m`
  }

  const getContentTypeIcon = (type?: string) => {
    switch (type) {
      case 'Movie': return <Film className="w-4 h-4" />
      case 'Series': return <Tv className="w-4 h-4" />
      case 'Anime': return <Gamepad2 className="w-4 h-4" />
      default: return null
    }
  }

  const requests = feedback.filter(f => f.type === 'REQUEST')
  const reports = feedback.filter(f => f.type === 'REPORT')

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      {/* Admin Header */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/admin/dashboard">
              <Button variant="outline" size="icon" className="text-slate-400 hover:text-white border-slate-800 bg-slate-900/50 rounded-xl transition-all hover:scale-110">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-2xl shadow-purple-500/20">
                <MessageSquarePlus className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight">Feedback Center</h1>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Live Management</p>
                </div>
              </div>
            </div>
          </div>
          <Button 
            variant="default" 
            size="lg" 
            onClick={fetchFeedback} 
            disabled={refreshing}
            className="bg-slate-900 border border-slate-700 hover:bg-slate-800 text-white font-bold rounded-xl shadow-xl transition-all active:scale-95 px-6"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''} text-purple-400`} />
            Sync Data
          </Button>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
        <Tabs defaultValue="requests" className="w-full">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-10">
            <TabsList className="grid grid-cols-2 w-full lg:w-auto h-auto bg-slate-900 border border-slate-700 p-1.5 rounded-2xl shadow-2xl gap-1.5">
              <TabsTrigger 
                value="requests" 
                className="px-2 sm:px-8 py-3.5 rounded-xl text-slate-400 data-[state=active]:bg-purple-600 data-[state=active]:text-white font-bold transition-all duration-300 border border-transparent data-[state=active]:border-white/10 text-xs sm:text-sm"
              >
                Requests
                <Badge variant="secondary" className="ml-1.5 sm:ml-3 bg-slate-800/80 text-slate-300 border-slate-700 text-[10px] sm:text-xs">
                  {requests.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger 
                value="reports" 
                className="px-2 sm:px-8 py-3.5 rounded-xl text-slate-400 data-[state=active]:bg-red-600 data-[state=active]:text-white font-bold transition-all duration-300 border border-transparent data-[state=active]:border-white/10 text-xs sm:text-sm"
              >
                Reports
                <Badge variant="secondary" className="ml-1.5 sm:ml-3 bg-slate-800/80 text-slate-300 border-slate-700 text-[10px] sm:text-xs">
                  {reports.length}
                </Badge>
              </TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-3 text-sm font-bold text-slate-500 bg-slate-900/40 px-5 py-3.5 rounded-2xl border border-slate-800/50 backdrop-blur-sm shadow-inner w-full lg:w-auto justify-center lg:justify-start">
              <Clock className="w-4 h-4 text-amber-500 shrink-0" />
              <span className="uppercase tracking-widest text-[10px]">Auto-Cleanup Cycle: 24 Hours</span>
            </div>
          </div>

          <TabsContent value="requests" className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {requests.length === 0 ? (
              <EmptyState icon={<Film className="w-12 h-12" />} title="No requests yet" description="New content requests from users will appear here." />
            ) : (
              <div className="grid gap-6">
                {requests.map(item => (
                  <FeedbackCard 
                    key={item.id} 
                    item={item} 
                    onMarkRead={markAsRead} 
                    onDelete={deleteFeedback}
                    timeRemaining={getTimeRemaining(item.expiresAt)}
                    icon={getContentTypeIcon(item.contentType)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="reports" className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {reports.length === 0 ? (
              <EmptyState icon={<AlertTriangle className="w-12 h-12" />} title="No reports yet" description="Broken links or other issues reported by users will appear here." />
            ) : (
              <div className="grid gap-6">
                {reports.map(item => (
                  <FeedbackCard 
                    key={item.id} 
                    item={item} 
                    onMarkRead={markAsRead} 
                    onDelete={deleteFeedback}
                    timeRemaining={getTimeRemaining(item.expiresAt)}
                    icon={<AlertTriangle className="w-4 h-4 text-red-500" />}
                    isReport
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

    </div>
  )
}

function FeedbackCard({ item, onMarkRead, onDelete, timeRemaining, icon, isReport }: { 
  item: Feedback, 
  onMarkRead: (id: string) => void, 
  onDelete: (id: string) => void,
  timeRemaining: string,
  icon: React.ReactNode,
  isReport?: boolean
}) {
  return (
    <Card className={`bg-slate-900/40 border-slate-800 overflow-hidden transition-all hover:bg-slate-900/60 ${!item.isRead ? 'border-l-4 border-l-purple-600' : ''}`}>
      <CardContent className="p-0">
        <div className="p-4 md:p-6 flex flex-col md:flex-row gap-6">
          <div className="flex-1 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {!item.isRead && <Badge className="bg-purple-600 text-[10px] h-4 uppercase">New</Badge>}
                  <h3 className="text-lg font-bold text-white">{item.title}</h3>
                </div>
                <div className="flex items-center gap-3 text-slate-500 text-xs">
                  <div className="flex items-center gap-1">
                    {icon}
                    <span>{item.contentType || (isReport ? 'Problem Report' : 'Request')}</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>Created: {new Date(item.createdAt).toLocaleString()}</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1 text-amber-500/80">
                    <Clock className="w-3 h-3" />
                    <span>Expires in: {timeRemaining}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/50">
              <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                {item.message}
              </p>
            </div>

            {item.link && (
              <div className="flex items-center gap-2 text-xs text-blue-400">
                <ExternalLink className="w-3 h-3" />
                <a href={item.link} target="_blank" rel="noopener noreferrer" className="hover:underline truncate max-w-md">
                  {item.link}
                </a>
              </div>
            )}
          </div>

          <div className="flex md:flex-col items-center justify-end gap-2 shrink-0 border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6">
            {!item.isRead && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onMarkRead(item.id)}
                className="text-purple-400 hover:text-purple-300 hover:bg-purple-400/10 flex-1 md:w-full justify-start"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Mark Seen
              </Button>
            )}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-md transition-colors flex-1 md:w-full">
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-slate-900 border-slate-800">
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Feedback?</AlertDialogTitle>
                  <AlertDialogDescription className="text-slate-400">
                    This action will permanently remove this {item.type.toLowerCase()} from the records.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700">Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete(item.id)} className="bg-red-600 hover:bg-red-700 text-white">Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function EmptyState({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="text-center py-20 bg-slate-900/20 rounded-3xl border border-dashed border-slate-800">
      <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-6 text-slate-700">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-400 mb-2">{title}</h3>
      <p className="text-slate-600 max-w-xs mx-auto">{description}</p>
    </div>
  )
}
