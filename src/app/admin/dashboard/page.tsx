'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Plus,
  Search,
  Edit,
  Trash2,
  Play,
  ArrowLeft,
  Film,
  Tv,
  Users,
  LogOut,
  Menu,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from '@/components/ui/sheet'
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
import Link from 'next/link'
import { getCopyrightText } from '@/lib/year'
import { auth } from '@/lib/firebase'
import { signOut } from 'firebase/auth'

interface Content {
  id: string
  contentType: string
  mainTitle: string
  releaseYear?: number
  genre?: string[]
  imdbRating?: number
  quality?: string[]
}

interface Stats {
  movies: number
  series: number
  anime: number
  total: number
}

export default function AdminDashboard() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [contents, setContents] = useState<Content[]>([])
  const [stats, setStats] = useState<Stats>({ movies: 0, series: 0, anime: 0, total: 0 })
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    checkAuth()
    fetchContents()
  }, [])

  const checkAuth = () => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.push('/admin/login')
      }
    })

    return () => unsubscribe()
  }

  const fetchContents = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/content')
      if (response.ok) {
        const data = await response.json()
        setContents(data)

        // Calculate stats
        const statsData: Stats = {
          movies: data.filter((c: Content) => c.contentType === 'Movie').length,
          series: data.filter((c: Content) => c.contentType === 'Series').length,
          anime: data.filter((c: Content) => c.contentType === 'Anime').length,
          total: data.length,
        }
        setStats(statsData)
      }
    } catch (error) {
      console.error('Failed to fetch contents:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
      localStorage.removeItem('adminUid')
      localStorage.removeItem('adminEmail')
      router.push('/admin/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/content/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setDeleteId(null)
        fetchContents()
      }
    } catch (error) {
      console.error('Failed to delete content:', error)
    }
  }

  const filteredContents = contents.filter((content) => {
    const searchLower = searchQuery.toLowerCase()
    return (
      content.mainTitle.toLowerCase().includes(searchLower) ||
      content.contentType.toLowerCase().includes(searchLower) ||
      (content.genre && content.genre.some((g) => g.toLowerCase().includes(searchLower))) ||
      (content.releaseYear && content.releaseYear.toString().includes(searchLower))
    )
  })

  const getContentTypeIcon = (type: string) => {
    return type === 'Movie' ? <Film className="w-4 h-4" /> : <Tv className="w-4 h-4" />
  }

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case '480p':
        return 'bg-orange-500/90 hover:bg-orange-600'
      case '720p':
        return 'bg-yellow-500/90 hover:bg-yellow-600'
      case '1080p':
        return 'bg-green-500/90 hover:bg-green-600'
      default:
        return 'bg-blue-500/90 hover:bg-blue-600'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-gray-800/50">
        <div className="container mx-auto px-3 sm:px-4 py-4">
          {/* Desktop Header */}
          <div className="hidden lg:flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="icon" className="text-white hover:bg-gray-800/50">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                  <Play className="w-5 h-5 text-white fill-white" />
                </div>
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Cineverse Admin
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/admin/content/new">
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-sm sm:text-base">
                  <Plus className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Add Content</span>
                  <span className="lg:hidden">Add</span>
                </Button>
              </Link>
              <Button variant="outline" onClick={handleLogout} className="border-red-500/30 text-red-400 hover:bg-red-500/10 text-sm sm:text-base">
                <LogOut className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Logout</span>
                <span className="lg:hidden">Exit</span>
              </Button>
            </div>
          </div>

          {/* Mobile Header */}
          <div className="lg:hidden flex items-center justify-between gap-2">
            <Link href="/">
              <Button variant="ghost" size="icon" className="text-white hover:bg-gray-800/50">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                <Play className="w-4 h-4 text-white fill-white" />
              </div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Admin
              </h1>
            </div>
            <div className="flex items-center gap-1">
              <Link href="/admin/content/new">
                <Button size="icon" className="bg-purple-600 text-white hover:bg-purple-700">
                  <Plus className="w-4 h-4" />
                </Button>
              </Link>
              <Button variant="outline" onClick={handleLogout} className="border-red-500/30 text-red-400 hover:bg-red-500/10">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        {/* Stats Cards - Responsive */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/30">
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-400">Total</CardTitle>
            </CardHeader>
            <CardContent className="py-2 sm:py-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                <span className="text-xl sm:text-3xl font-bold text-white">{stats.total}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30">
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-400">Movies</CardTitle>
            </CardHeader>
            <CardContent className="py-2 sm:py-3">
              <div className="flex items-center gap-2">
                <Film className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                <span className="text-xl sm:text-3xl font-bold text-white">{stats.movies}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30">
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-400">Series</CardTitle>
            </CardHeader>
            <CardContent className="py-2 sm:py-3">
              <div className="flex items-center gap-2">
                <Tv className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                <span className="text-xl sm:text-3xl font-bold text-white">{stats.series}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/30">
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-400">Anime</CardTitle>
            </CardHeader>
            <CardContent className="py-2 sm:py-3">
              <div className="flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400" />
                <span className="text-xl sm:text-3xl font-bold text-white">{stats.anime}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar - Responsive */}
        <div className="mb-4 sm:mb-6">
          <div className="relative w-full max-w-full md:max-w-2xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 sm:pl-11 bg-gray-900/50 border-gray-700/50 text-white placeholder-gray-500 focus:border-purple-500/50 focus:ring-purple-500/20 rounded-lg text-sm sm:text-base"
            />
          </div>
        </div>

        {/* Mobile Menu Sheet for Actions */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side="bottom" className="bg-gray-950 border-gray-800 max-h-[70vh]">
            <SheetTitle className="sr-only">Admin Menu</SheetTitle>
            <div className="flex flex-col gap-4 pt-2">
              <div className="flex flex-col gap-3">
                <Link href="/admin/content/new" onClick={() => setMobileMenuOpen(false)} className="w-full">
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
                    <Plus className="w-5 h-5 mr-2" />
                    Add Content
                  </Button>
                </Link>
                <Button onClick={handleLogout} className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10">
                  <LogOut className="w-5 h-5 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Content List */}
        <Card className="bg-gray-900/50 border-gray-800/50">
          <CardHeader>
            <CardTitle className="text-white text-lg sm:text-xl flex items-center gap-2">
              <LayoutDashboard className="w-5 h-5" />
              <span className="hidden sm:inline">Content Management</span>
              <span className="sm:hidden">Content</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-14 sm:h-16 bg-gray-800/50 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : filteredContents.length === 0 ? (
              <div className="text-center py-12 sm:py-20">
                <Film className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-gray-700 mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-semibold text-gray-400 mb-2">No content found</h3>
                <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">Try adjusting your search</p>
                <Link href="/admin/content/new" className="inline-block">
                  <Button className="text-xs sm:text-sm">
                    <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    Add Content
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {filteredContents.map((content) => (
                  <div
                    key={content.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-800/30 border border-gray-700/50 rounded-lg hover:border-purple-500/30 hover:bg-gray-800/50 transition-all"
                  >
                    {/* Content Type Icon */}
                    <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gray-800 flex items-center justify-center text-purple-400">
                      {getContentTypeIcon(content.contentType)}
                    </div>

                    {/* Content Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold text-sm sm:text-base truncate">{content.mainTitle}</h3>
                      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap mt-0.5 sm:mt-1">
                        <Badge variant="secondary" className="text-xs bg-gray-700/50 text-gray-300 border-gray-700/50">
                          {content.contentType}
                        </Badge>
                        {content.releaseYear && (
                          <Badge variant="secondary" className="text-xs bg-gray-700/50 text-gray-300 border-gray-700/50">
                            {content.releaseYear}
                          </Badge>
                        )}
                        {content.quality && content.quality.length > 0 && (
                          content.quality.map((q) => (
                            <Badge key={q} className={`${getQualityColor(q)} text-xs`}>
                              {q}
                            </Badge>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Actions - Responsive */}
                    <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0 sm:w-auto w-full sm:w-auto mt-2 sm:mt-0">
                      <Link href={`/admin/content/${content.id}`} className="flex-1 sm:flex-1">
                        <Button variant="outline" size="sm" className="w-full sm:w-auto border-purple-500/30 text-purple-400 hover:bg-purple-500/10">
                          <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="hidden sm:inline">Edit</span>
                          <span className="sm:hidden">Details</span>
                        </Button>
                      </Link>
                      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                        <Link href={`/admin/content/${content.id}`} className="hidden sm:block">
                          <Button variant="outline" size="sm" className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10">
                            <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>Edit</span>
                          </Button>
                        </Link>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="border-red-500/30 text-red-400 hover:bg-red-500/10">
                              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span className="hidden sm:inline">Delete</span>
                              <span className="sm:hidden">Remove</span>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-gray-900 border-gray-800 max-w-[90vw] sm:max-w-md">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-white">Delete Content</AlertDialogTitle>
                              <AlertDialogDescription className="text-gray-400 text-sm sm:text-base">
                                Are you sure you want to delete "{content.mainTitle}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2 sm:gap-3">
                              <AlertDialogCancel className="border-gray-700 text-gray-300 flex-1 sm:flex-1 py-2 sm:py-2.5">
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(content.id)}
                                className="bg-red-600 hover:bg-red-700 text-white flex-1 sm:flex-1 py-2 sm:py-2.5"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="bg-black/50 border-t border-gray-800/50 py-4 sm:py-6 mt-auto">
        <div className="container mx-auto px-3 sm:px-4 text-center">
          <p className="text-gray-500 text-xs sm:text-sm">
            {getCopyrightText()}
          </p>
        </div>
      </footer>
    </div>
  )
}
