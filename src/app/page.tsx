'use client'

import { useState, useEffect } from 'react'
import { Search, Film, Tv, Play, Star, LogIn, Grid, Sparkles, ChevronDown } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import Link from 'next/link'
import { getCopyrightText } from '@/lib/year'

type ContentType = 'all' | 'Movie' | 'Series' | 'Anime'

interface Content {
  id: string
  contentType: string
  mainTitle: string
  secondaryTitle: string
  imageHtml: string
  releaseYear?: number
  genre?: string[]
  imdbRating?: number
  quality?: string[]
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<ContentType>('all')
  const [contents, setContents] = useState<Content[]>([])
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    fetchContents()
  }, [activeFilter, searchQuery])

  const fetchContents = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (activeFilter !== 'all') params.append('type', activeFilter)
      if (searchQuery) params.append('search', searchQuery)

      const response = await fetch(`/api/content?${params}`)
      if (response.ok) {
        const data = await response.json()
        setContents(data)
      }
    } catch (error) {
      console.error('Failed to fetch contents:', error)
    } finally {
      setLoading(false)
    }
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
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:shadow-purple-500/50 transition-shadow">
                <Play className="w-5 h-5 text-white fill-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Cineverse
              </h1>
            </Link>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl hidden md:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search movies, series, anime by title, genre, year..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-11 bg-gray-900/50 border-gray-700/50 text-white placeholder-gray-500 focus:border-purple-500/50 focus:ring-purple-500/20 rounded-xl"
                />
              </div>
            </div>

            {/* Filter Tabs - Desktop (Minimalist) */}
            <nav className="hidden lg:flex items-center gap-1 bg-gray-900/30 px-1 py-1 rounded-lg border border-gray-800/50">
              <button
                onClick={() => setActiveFilter('all')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-all duration-300 ${
                  activeFilter === 'all'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>All</span>
              </button>
              <button
                onClick={() => setActiveFilter('Movie')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-all duration-300 ${
                  activeFilter === 'Movie'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <Film className="w-3.5 h-3.5" />
                <span>Movies</span>
              </button>
              <button
                onClick={() => setActiveFilter('Series')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-all duration-300 ${
                  activeFilter === 'Series'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <Tv className="w-3.5 h-3.5" />
                <span>Series</span>
              </button>
              <button
                onClick={() => setActiveFilter('Anime')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-all duration-300 ${
                  activeFilter === 'Anime'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Anime</span>
              </button>
            </nav>

            {/* Mobile Menu Trigger */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon" className="text-white">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-gray-950 border-gray-800">
                <SheetTitle className="sr-only">Menu</SheetTitle>
                <div className="flex flex-col gap-6 mt-8">
                  {/* Mobile Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-11 bg-gray-900/50 border-gray-700/50 text-white placeholder-gray-500"
                    />
                  </div>

                  {/* Mobile Filter Tabs */}
                  <div className="flex flex-col gap-2">
                    <p className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-1">Filter</p>
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => { setActiveFilter('all'); setMobileMenuOpen(false) }}
                        className={`flex items-center gap-2 px-3 py-2 rounded text-sm font-medium transition-all ${
                          activeFilter === 'all'
                            ? 'bg-purple-600 text-white'
                            : 'text-gray-400 hover:text-white bg-gray-800/30'
                        }`}
                      >
                        <Grid className="w-4 h-4" />
                        <span>All</span>
                      </button>
                      <button
                        onClick={() => { setActiveFilter('Movie'); setMobileMenuOpen(false) }}
                        className={`flex items-center gap-2 px-3 py-2 rounded text-sm font-medium transition-all ${
                          activeFilter === 'Movie'
                            ? 'bg-purple-600 text-white'
                            : 'text-gray-400 hover:text-white bg-gray-800/30'
                        }`}
                      >
                        <Film className="w-4 h-4" />
                        <span>Movies</span>
                      </button>
                      <button
                        onClick={() => { setActiveFilter('Series'); setMobileMenuOpen(false) }}
                        className={`flex items-center gap-2 px-3 py-2 rounded text-sm font-medium transition-all ${
                          activeFilter === 'Series'
                            ? 'bg-purple-600 text-white'
                            : 'text-gray-400 hover:text-white bg-gray-800/30'
                        }`}
                      >
                        <Tv className="w-4 h-4" />
                        <span>Series</span>
                      </button>
                      <button
                        onClick={() => { setActiveFilter('Anime'); setMobileMenuOpen(false) }}
                        className={`flex items-center gap-2 px-3 py-2 rounded text-sm font-medium transition-all ${
                          activeFilter === 'Anime'
                            ? 'bg-purple-600 text-white'
                            : 'text-gray-400 hover:text-white bg-gray-800/30'
                        }`}
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>Anime</span>
                      </button>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Mobile Search Bar */}
          <div className="relative mt-4 md:hidden">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search movies, series, anime..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 bg-gray-900/50 border-gray-700/50 text-white placeholder-gray-500 focus:border-purple-500/50 focus:ring-purple-500/20 rounded-xl"
            />
          </div>

          {/* Mobile Filter Tabs - Minimalist */}
          <nav className="flex lg:hidden items-center gap-1 mt-4 overflow-x-auto pb-2">
            <button
              onClick={() => setActiveFilter('all')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-all duration-300 flex-shrink-0 ${
                activeFilter === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white bg-gray-800/30'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>All</span>
            </button>
            <button
              onClick={() => setActiveFilter('Movie')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-all duration-300 flex-shrink-0 ${
                activeFilter === 'Movie'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white bg-gray-800/30'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>Movies</span>
            </button>
            <button
              onClick={() => setActiveFilter('Series')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-all duration-300 flex-shrink-0 ${
                activeFilter === 'Series'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white bg-gray-800/30'
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              <span>Series</span>
            </button>
            <button
              onClick={() => setActiveFilter('Anime')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-all duration-300 flex-shrink-0 ${
                activeFilter === 'Anime'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white bg-gray-800/30'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Anime</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6 sm:py-8">
        {/* Section Title */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            {activeFilter === 'all' ? 'All Content' : `${activeFilter}s`}
          </h2>
          <p className="text-gray-400 text-sm">
            {loading ? 'Loading...' : `${contents.length} items found`}
          </p>
        </div>

        {/* Content Grid - Mobile Single Column / Desktop Multi-column */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4">
            {[...Array(12)].map((_, i) => (
              <Card key={i} className="bg-gray-900/50 border-gray-800/50 overflow-hidden">
                <CardContent className="p-0">
                  <div className="aspect-[2/3] bg-gray-800/50 animate-pulse" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : contents.length === 0 ? (
          <div className="text-center py-20">
            <Film className="w-16 h-16 mx-auto text-gray-700 mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No content found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4">
            {contents.map((content) => (
              <Link key={content.id} href={`/content/${content.id}`} className="w-full">
                <Card className="group bg-gray-900/50 border-gray-800/50 overflow-hidden hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 cursor-pointer h-full">
                  <CardContent className="p-0 h-full flex flex-col">
                    {/* Poster with Quality Badges Overlay */}
                    <div className="relative aspect-[2/3] bg-gray-800 overflow-hidden flex-shrink-0">
                      <div
                        className="w-full h-full"
                        dangerouslySetInnerHTML={{ __html: content.imageHtml }}
                      />
                      {/* Quality Badges - Top Left Overlay */}
                      {content.quality && content.quality.length > 0 && (
                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                          {content.quality.map((q) => (
                            <Badge
                              key={q}
                              className={`${getQualityColor(q)} text-white text-xs font-semibold px-2 py-0.5`}
                            >
                              {q}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Card Content */}
                    <div className="p-3 sm:p-4 flex flex-col flex-1">
                      {/* Title */}
                      <h3 className="font-bold text-white text-sm sm:text-base mb-1 line-clamp-2 group-hover:text-purple-400 transition-colors">
                        {content.mainTitle}
                      </h3>

                      {/* Release Year */}
                      {content.releaseYear && (
                        <p className="text-xs sm:text-sm text-gray-400 mb-2">{content.releaseYear}</p>
                      )}

                      {/* Genre Tags */}
                      {content.genre && content.genre.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {content.genre.slice(0, 2).map((g) => (
                            <Badge key={g} variant="secondary" className="text-xs bg-gray-800/50 text-gray-400 border-gray-700/50">
                              {g}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* IMDb Rating */}
                      {content.imdbRating && (
                        <div className="flex items-center gap-1 text-yellow-500 mb-2 sm:mb-3">
                          <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-current" />
                          <span className="text-xs sm:text-sm font-semibold">{content.imdbRating}</span>
                        </div>
                      )}

                      {/* View Details Button - Always Visible */}
                      <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold text-sm sm:text-base py-2 sm:py-2.5 mt-auto">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-black/50 border-t border-gray-800/50 py-6 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-500 text-sm">
            {getCopyrightText()}
          </p>
        </div>
      </footer>
    </div>
  )
}
