'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  MessageSquarePlus,
  AlertTriangle,
  Send,
  ArrowLeft,
  Film,
  Tv,
  Gamepad2,
  CheckCircle2,
  Clock,
  ShieldCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import Link from 'next/link'

export default function FeedbackPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>, type: 'REQUEST' | 'REPORT') => {
    event.preventDefault()
    setLoading(true)

    const formData = new FormData(event.currentTarget)
    const data = {
      type,
      title: formData.get('title'),
      contentType: formData.get('contentType'),
      message: formData.get('message'),
      link: formData.get('link'),
    }

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast.success(type === 'REQUEST' ? 'Content requested successfully!' : 'Problem reported successfully!')
        setSubmitted(true)
      } else {
        toast.error('Failed to submit. Please try again.')
      }
    } catch (error) {
      console.error('Submission error:', error)
      toast.error('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-slate-900/50 border-slate-800 backdrop-blur-xl animate-in fade-in zoom-in duration-500">
          <CardContent className="pt-10 pb-8 text-center">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Thank You!</h2>
            <p className="text-slate-400 mb-8 px-4">
              Your submission has been received. Please note that all requests and reports are automatically deleted after 24 hours.
            </p>
            <div className="flex flex-col gap-3">
              <Button asChild className="bg-slate-800 hover:bg-slate-700 text-white">
                <Link href="/">Return Home</Link>
              </Button>
              <Button variant="ghost" onClick={() => setSubmitted(false)} className="text-slate-400 hover:text-white">
                Submit Another
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 selection:bg-purple-500/30">
      {/* Ad-free Background Pattern */}
      <div className="fixed inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/30 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/30 blur-[120px] rounded-full" />
      </div>

      <main className="relative z-10 container mx-auto px-4 py-8 md:py-16 max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <Button asChild variant="ghost" className="text-slate-400 hover:text-white -ml-4">
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Cineverse
            </Link>
          </Button>
          <div className="flex items-center gap-2 bg-slate-900/50 px-3 py-1.5 rounded-full border border-slate-800">
            <Clock className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-medium text-amber-500/90 uppercase tracking-wider">Auto-delete: 24h</span>
          </div>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-white via-white to-slate-500 bg-clip-text text-transparent">
            How can we help?
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Request your favorite content or report a technical issue. We process everything within 24 hours.
          </p>
        </div>

        <Tabs defaultValue="request" className="w-full max-w-2xl mx-auto">
          <TabsList className="grid grid-cols-2 w-full h-auto bg-slate-900 border border-slate-700 p-1.5 rounded-2xl mb-10 shadow-2xl gap-1.5">
            <TabsTrigger 
              value="request" 
              className="rounded-xl py-3 px-2 sm:px-6 text-slate-400 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white font-bold transition-all duration-300 hover:text-slate-200 border border-transparent data-[state=active]:border-white/10 text-xs sm:text-sm"
            >
              <MessageSquarePlus className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-3 shrink-0" />
              <span className="truncate">Request Content</span>
            </TabsTrigger>
            <TabsTrigger 
              value="report"
              className="rounded-xl py-3 px-2 sm:px-6 text-slate-400 data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-orange-600 data-[state=active]:text-white font-bold transition-all duration-300 hover:text-slate-200 border border-transparent data-[state=active]:border-white/10 text-xs sm:text-sm"
            >
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-3 shrink-0" />
              <span className="truncate">Report Problem</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="request" className="animate-in slide-in-from-bottom-4 duration-500">
            <Card className="bg-slate-900 border-slate-700 shadow-2xl overflow-hidden rounded-3xl">
              <CardHeader className="border-b border-slate-800 bg-slate-900/50">
                <CardTitle className="flex items-center gap-3 text-white text-2xl">
                  <div className="p-2.5 bg-purple-500/10 rounded-xl border border-purple-500/20">
                    <Film className="w-6 h-6 text-purple-400" />
                  </div>
                  Request Content
                </CardTitle>
                <CardDescription className="text-slate-400 mt-1">
                  Missing a movie, series, or anime? Let us know!
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 md:p-8">
                <form onSubmit={(e) => handleSubmit(e, 'REQUEST')} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label htmlFor="title" className="text-sm font-bold text-slate-300 uppercase tracking-widest ml-1">Content Title</label>
                      <Input 
                        id="title" 
                        name="title" 
                        placeholder="e.g. Inception (2010)" 
                        required 
                        className="h-12 bg-slate-950 border-slate-700 text-white placeholder-slate-600 focus:border-purple-500 focus:ring-purple-500/20 rounded-xl transition-all"
                      />
                    </div>
                    <div className="space-y-3">
                      <label htmlFor="contentType" className="text-sm font-bold text-slate-300 uppercase tracking-widest ml-1">Content Type</label>
                      <Select name="contentType" defaultValue="Movie" required>
                        <SelectTrigger className="h-12 bg-slate-950 border-slate-700 text-white focus:border-purple-500 focus:ring-purple-500/20 rounded-xl transition-all">
                          <SelectValue placeholder="Select type" className="text-white" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-slate-700 rounded-xl shadow-2xl">
                          <SelectItem value="Movie" className="text-white focus:bg-purple-600 focus:text-white rounded-lg my-1 cursor-pointer">
                            <div className="flex items-center gap-2">
                              <Film className="w-4 h-4" /> Movie
                            </div>
                          </SelectItem>
                          <SelectItem value="Series" className="text-white focus:bg-blue-600 focus:text-white rounded-lg my-1 cursor-pointer">
                            <div className="flex items-center gap-2">
                              <Tv className="w-4 h-4" /> TV Series
                            </div>
                          </SelectItem>
                          <SelectItem value="Anime" className="text-white focus:bg-cyan-600 focus:text-white rounded-lg my-1 cursor-pointer">
                            <div className="flex items-center gap-2">
                              <Gamepad2 className="w-4 h-4" /> Anime
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label htmlFor="message" className="text-sm font-bold text-slate-300 uppercase tracking-widest ml-1">Message (Optional Details)</label>
                    <Textarea 
                      id="message" 
                      name="message" 
                      placeholder="e.g. Specific quality, season number, or language..." 
                      className="min-h-[150px] bg-slate-950 border-slate-700 text-white placeholder-slate-600 focus:border-purple-500 focus:ring-purple-500/20 rounded-2xl resize-none p-4 transition-all"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="w-full h-14 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 hover:from-purple-700 hover:via-blue-700 hover:to-cyan-700 text-white font-black text-lg transition-all duration-500 shadow-xl shadow-purple-500/20 rounded-xl"
                  >
                    {loading ? (
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                        Submitting...
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <Send className="w-5 h-5 animate-bounce" />
                        Send Request
                      </div>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="report" className="animate-in slide-in-from-bottom-4 duration-500">
            <Card className="bg-slate-900 border-slate-700 shadow-2xl overflow-hidden rounded-3xl">
              <CardHeader className="border-b border-slate-800 bg-slate-900/50">
                <CardTitle className="flex items-center gap-3 text-red-500 text-2xl">
                  <div className="p-2.5 bg-red-500/10 rounded-xl border border-red-500/20">
                    <AlertTriangle className="w-6 h-6 text-red-500" />
                  </div>
                  Report Problem
                </CardTitle>
                <CardDescription className="text-slate-400 mt-1">
                  Found a broken link or incorrect content? Help us fix it!
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 md:p-8">
                <form onSubmit={(e) => handleSubmit(e, 'REPORT')} className="space-y-8">
                  <div className="space-y-3">
                    <label htmlFor="report-title" className="text-sm font-bold text-slate-300 uppercase tracking-widest ml-1">Problem Title</label>
                    <Input 
                      id="report-title" 
                      name="title" 
                      placeholder="e.g. Broken download link for The Dark Knight" 
                      required 
                      className="h-12 bg-slate-950 border-slate-700 text-white placeholder-slate-600 focus:border-red-500 focus:ring-red-500/20 rounded-xl transition-all"
                    />
                  </div>
                  <div className="space-y-3">
                    <label htmlFor="link" className="text-sm font-bold text-slate-300 uppercase tracking-widest ml-1">Link to Page (Optional)</label>
                    <Input 
                      id="link" 
                      name="link" 
                      placeholder="https://cineverse.com/content/..." 
                      className="h-12 bg-slate-950 border-slate-700 text-white placeholder-slate-600 focus:border-red-500 focus:ring-red-500/20 rounded-xl transition-all"
                    />
                  </div>
                  <div className="space-y-3">
                    <label htmlFor="report-message" className="text-sm font-bold text-slate-300 uppercase tracking-widest ml-1">Details</label>
                    <Textarea 
                      id="report-message" 
                      name="message" 
                      required
                      placeholder="Describe the issue in detail so we can fix it quickly..." 
                      className="min-h-[150px] bg-slate-950 border-slate-700 text-white placeholder-slate-600 focus:border-red-500 focus:ring-red-500/20 rounded-2xl resize-none p-4 transition-all"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="w-full h-14 bg-gradient-to-r from-red-600 via-orange-600 to-red-600 hover:from-red-700 hover:via-orange-700 hover:to-red-700 text-white font-black text-lg transition-all duration-500 shadow-xl shadow-red-500/20 rounded-xl"
                  >
                    {loading ? (
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                        Reporting...
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <Send className="w-5 h-5 animate-bounce" />
                        Submit Report
                      </div>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-20 text-center">
          <div className="p-8 bg-slate-900 rounded-3xl border border-slate-800 shadow-xl group hover:border-blue-500/50 transition-all duration-500">
            <Clock className="w-10 h-10 text-blue-500 mx-auto mb-6 group-hover:scale-125 transition-transform" />
            <h3 className="font-black text-xl text-white mb-3">Fast Cleanup</h3>
            <p className="text-base text-slate-400">All messages are permanently deleted exactly after 24 hours of submission to ensure your privacy.</p>
          </div>
          <div className="p-8 bg-slate-900 rounded-3xl border border-slate-800 shadow-xl group hover:border-cyan-500/50 transition-all duration-500">
            <Send className="w-10 h-10 text-cyan-500 mx-auto mb-6 group-hover:scale-125 transition-transform" />
            <h3 className="font-black text-xl text-white mb-3">Quick Action</h3>
            <p className="text-base text-slate-400">Our dedicated team reviews and processes each request and report daily to provide you the best experience.</p>
          </div>
        </div>

      </main>

      <footer className="relative z-10 py-8 border-t border-slate-800/50 text-center text-slate-500 text-sm">
        <p>© {new Date().getFullYear()} Cineverse Support Team. Professional Feedback System.</p>
      </footer>
    </div>
  )
}
