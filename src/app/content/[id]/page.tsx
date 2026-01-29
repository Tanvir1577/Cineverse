'use client'

import { useState, useEffect, use } from 'react'
import { Star, Download, ArrowLeft, Play, Film, Tv } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { getCopyrightText } from '@/lib/year'

interface DownloadLink {
  id: string
  title: string
  url: string
  quality: string
}

interface DownloadGroup {
  id: string
  title: string
  links: DownloadLink[]
}

interface Content {
  id: string
  contentType: string
  mainTitle: string
  secondaryTitle: string
  imageHtml: string
  name?: string
  season?: string
  imdbRating?: number
  releaseYear?: number
  genre?: string[]
  language?: string[]
  subtitle?: string[]
  quality?: string[]
  fileSize?: string
  format?: string
  storyline?: string
  downloadGroups?: DownloadGroup[]
}

export default function ContentDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [content, setContent] = useState<Content | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchContent()
  }, [resolvedParams.id])

  const fetchContent = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/content/${resolvedParams.id}`)
      if (response.ok) {
        const data = await response.json()
        setContent(data)
      }
    } catch (error) {
      console.error('Failed to fetch content:', error)
    } finally {
      setLoading(false)
    }
  }

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case '480p':
        return 'bg-orange-500/90 hover:bg-orange-600 text-white'
      case '720p':
        return 'bg-yellow-500/90 hover:bg-yellow-600 text-white'
      case '1080p':
        return 'bg-green-500/90 hover:bg-green-600 text-white'
      default:
        return 'bg-blue-500/90 hover:bg-blue-600 text-white'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  if (!content) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black flex items-center justify-center">
        <div className="text-center">
          <Film className="w-16 h-16 mx-auto text-gray-700 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Content not found</h2>
          <Link href="/">
            <Button>Go Back Home</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-gray-800/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="text-white hover:bg-gray-800/50">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                <Play className="w-5 h-5 text-white fill-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Cineverse
              </h1>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Back Button Mobile */}
        <div className="mb-6 md:hidden">
          <Link href="/">
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
        </div>

        <div className="grid lg:grid-cols-[300px_1fr] gap-8">
          {/* Left Column - Poster */}
          <div className="lg:sticky lg:top-24 lg:h-fit">
            <Card className="bg-gray-900/50 border-gray-800/50 overflow-hidden">
              <CardContent className="p-0">
                <div className="aspect-[2/3] bg-gray-800">
                  <div
                    className="w-full h-full"
                    dangerouslySetInnerHTML={{ __html: content.imageHtml }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Quality Badges */}
            {content.quality && content.quality.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {content.quality.map((q) => (
                  <Badge key={q} className={`${getQualityColor(q)} text-sm font-semibold px-3 py-1`}>
                    {q}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Details */}
          <div className="space-y-6">
            {/* Title */}
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2">
                {content.secondaryTitle || content.mainTitle}
              </h1>
              {content.secondaryTitle && content.secondaryTitle !== content.mainTitle && (
                <p className="text-xl text-gray-400">{content.mainTitle}</p>
              )}
              <div className="flex items-center gap-2 mt-2">
                {content.contentType === 'Movie' && <Film className="w-5 h-5 text-purple-400" />}
                {(content.contentType === 'Series' || content.contentType === 'Anime') && (
                  <Tv className="w-5 h-5 text-purple-400" />
                )}
                <span className="text-gray-400 font-medium">{content.contentType}</span>
              </div>
            </div>

            <Separator className="bg-gray-800" />

            {/* Information Section */}
            <Card className="bg-gray-900/50 border-gray-800/50">
              <CardHeader>
                <CardTitle className="text-white text-xl">Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Season - Only for Series & Anime */}
                {(content.contentType === 'Series' || content.contentType === 'Anime') && content.season && (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <span className="text-gray-400 font-medium sm:w-32">Season:</span>
                    <span className="text-white font-semibold">{content.season}</span>
                  </div>
                )}

                {/* IMDb Rating */}
                {content.imdbRating && (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <span className="text-gray-400 font-medium sm:w-32">IMDb Rating:</span>
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="w-5 h-5 fill-current" />
                      <span className="text-white font-semibold text-lg">{content.imdbRating}</span>
                    </div>
                  </div>
                )}

                {/* Release Year */}
                {content.releaseYear && (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <span className="text-gray-400 font-medium sm:w-32">Release Year:</span>
                    <span className="text-white font-semibold">{content.releaseYear}</span>
                  </div>
                )}

                {/* Genre */}
                {content.genre && content.genre.length > 0 && (
                  <div className="flex flex-col sm:flex-col gap-1 sm:gap-2">
                    <span className="text-gray-400 font-medium">Genre:</span>
                    <div className="flex flex-wrap gap-2">
                      {content.genre.map((g) => (
                        <Badge key={g} variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                          {g}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Language */}
                {content.language && content.language.length > 0 && (
                  <div className="flex flex-col sm:flex-col gap-1 sm:gap-2">
                    <span className="text-gray-400 font-medium">Language:</span>
                    <div className="flex flex-wrap gap-2">
                      {content.language.map((l) => (
                        <Badge key={l} variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                          {l}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Subtitle */}
                {content.subtitle && content.subtitle.length > 0 && (
                  <div className="flex flex-col sm:flex-col gap-1 sm:gap-2">
                    <span className="text-gray-400 font-medium">Subtitle:</span>
                    <div className="flex flex-wrap gap-2">
                      {content.subtitle.map((s) => (
                        <Badge key={s} variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* File Size & Format */}
                {(content.fileSize || content.format) && (
                  <>
                    {content.fileSize && (
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                        <span className="text-gray-400 font-medium sm:w-32">File Size:</span>
                        <span className="text-white font-semibold">{content.fileSize}</span>
                      </div>
                    )}
                    {content.format && (
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                        <span className="text-gray-400 font-medium sm:w-32">Format:</span>
                        <span className="text-white font-semibold">{content.format}</span>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Storyline */}
            {content.storyline && (
              <Card className="bg-gray-900/50 border-gray-800/50">
                <CardHeader>
                  <CardTitle className="text-white text-xl">Storyline</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 leading-relaxed text-sm sm:text-base whitespace-pre-wrap">
                    {content.storyline}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Download Section */}
            {content.downloadGroups && content.downloadGroups.length > 0 && (
              <Card className="bg-gray-900/50 border-gray-800/50">
                <CardHeader>
                  <CardTitle className="text-white text-xl flex items-center gap-2">
                    <Download className="w-6 h-6" />
                    Download
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {content.downloadGroups.map((group) => (
                    <div key={group.id} className="space-y-3">
                      {group.title && (
                        <h3 className="text-lg font-semibold text-white">{group.title}</h3>
                      )}
                      <div className="grid gap-3">
                        {group.links.map((link) => (
                          <a
                            key={link.id}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center justify-between p-4 bg-gray-800/50 border border-gray-700/50 rounded-xl hover:border-purple-500/50 hover:bg-gray-800/80 transition-all duration-300"
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <Download className="w-5 h-5 text-purple-400 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-white font-medium truncate group-hover:text-purple-400 transition-colors">
                                  {link.title}
                                </p>
                                <Badge className={`${getQualityColor(link.quality)} text-xs mt-1`}>
                                  {link.quality}
                                </Badge>
                              </div>
                            </div>
                            <Button className="ml-4 flex-shrink-0 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                              Download
                            </Button>
                          </a>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
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
