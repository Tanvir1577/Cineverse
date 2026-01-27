'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { Play, Save, Plus, Trash2, ArrowLeft, Link2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import Link from 'next/link'
import { getCopyrightText } from '@/lib/year'

const GENRES = ['Action', 'Animation', 'Adventure', 'Thriller', 'Crime', 'Comedy', 'Horror', 'Fantasy']
const LANGUAGES = ['English', 'Hindi', 'Japanese', 'Korean']
const SUBTITLES = ['English', 'Hindi', 'Japanese', 'Korean']
const QUALITIES = ['480p', '720p', '1080p']
const CONTENT_TYPES = ['Movie', 'Series', 'Anime']

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

export default function EditContent({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  // Form state
  const [formData, setFormData] = useState({
    contentType: 'Movie' as 'Movie' | 'Series' | 'Anime',
    mainTitle: '',
    secondaryTitle: '',
    imageHtml: '',
    name: '',
    season: '',
    imdbRating: '',
    releaseYear: '',
    genre: [] as string[],
    language: [] as string[],
    subtitle: [] as string[],
    quality: [] as string[],
    fileSize: '',
    format: '',
    storyline: '',
  })

  // Download groups state
  const [downloadGroups, setDownloadGroups] = useState<DownloadGroup[]>([])

  useEffect(() => {
    fetchContent()
  }, [resolvedParams.id])

  const fetchContent = async () => {
    try {
      const response = await fetch(`/api/content/${resolvedParams.id}`)
      if (response.ok) {
        const data = await response.json()
        setFormData({
          contentType: data.contentType,
          mainTitle: data.mainTitle || '',
          secondaryTitle: data.secondaryTitle || '',
          imageHtml: data.imageHtml || '',
          name: data.name || '',
          season: data.season || '',
          imdbRating: data.imdbRating?.toString() || '',
          releaseYear: data.releaseYear?.toString() || '',
          genre: data.genre || [],
          language: data.language || [],
          subtitle: data.subtitle || [],
          quality: data.quality || [],
          fileSize: data.fileSize || '',
          format: data.format || '',
          storyline: data.storyline || '',
        })

        // Parse download groups
        if (data.downloadGroups && data.downloadGroups.length > 0) {
          const parsedGroups = data.downloadGroups.map((group: any) => ({
            id: group.id,
            title: group.title,
            links: group.links.map((link: any) => ({
              id: link.id,
              title: link.title,
              url: link.url,
              quality: link.quality,
            })),
          }))
          setDownloadGroups(parsedGroups)
        }
      }
    } catch (error) {
      console.error('Failed to fetch content:', error)
    } finally {
      setFetching(false)
    }
  }

  const handleToggleArray = (field: 'genre' | 'language' | 'subtitle' | 'quality', value: string) => {
    const current = formData[field]
    const updated = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value]
    setFormData({ ...formData, [field]: updated })
  }

  const addDownloadGroup = () => {
    setDownloadGroups([
      ...downloadGroups,
      {
        id: Date.now().toString(),
        title: '',
        links: [],
      },
    ])
  }

  const removeDownloadGroup = (groupId: string) => {
    setDownloadGroups(downloadGroups.filter((group) => group.id !== groupId))
  }

  const updateDownloadGroup = (groupId: string, title: string) => {
    setDownloadGroups(
      downloadGroups.map((group) =>
        group.id === groupId ? { ...group, title } : group
      )
    )
  }

  const addDownloadLink = (groupId: string) => {
    setDownloadGroups(
      downloadGroups.map((group) =>
        group.id === groupId
          ? {
              ...group,
              links: [
                ...group.links,
                {
                  id: Date.now().toString(),
                  title: '',
                  url: '',
                  quality: '720p',
                },
              ],
            }
          : group
      )
    )
  }

  const updateDownloadLink = (
    groupId: string,
    linkId: string,
    field: 'title' | 'url' | 'quality',
    value: string
  ) => {
    setDownloadGroups(
      downloadGroups.map((group) =>
        group.id === groupId
          ? {
              ...group,
              links: group.links.map((link) =>
                link.id === linkId ? { ...link, [field]: value } : link
              ),
            }
          : group
      )
    )
  }

  const removeDownloadLink = (groupId: string, linkId: string) => {
    setDownloadGroups(
      downloadGroups.map((group) =>
        group.id === groupId
          ? {
              ...group,
              links: group.links.filter((link) => link.id !== linkId),
            }
          : group
      )
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = {
        ...formData,
        imdbRating: formData.imdbRating ? parseFloat(formData.imdbRating) : null,
        releaseYear: formData.releaseYear ? parseInt(formData.releaseYear) : null,
        downloadGroups: downloadGroups.filter((group) => group.title || group.links.length > 0),
      }

      const url = `/api/content/${resolvedParams.id}`
      const method = 'PUT'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        router.push('/admin/dashboard')
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to save content')
      }
    } catch (error) {
      console.error('Failed to save content:', error)
      alert('Failed to save content. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case '480p':
        return 'bg-orange-500/90'
      case '720p':
        return 'bg-yellow-500/90'
      case '1080p':
        return 'bg-green-500/90'
      default:
        return 'bg-blue-500/90'
    }
  }

  if (fetching) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-gray-800/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link href="/admin/dashboard">
                <Button variant="ghost" size="icon" className="text-white hover:bg-gray-800/50">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                  <Play className="w-5 h-5 text-white fill-white" />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Edit Content
                </h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit}>
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Content Type & Titles */}
            <Card className="bg-gray-900/50 border-gray-800/50">
              <CardHeader>
                <CardTitle className="text-white">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Content Type *</Label>
                    <Select
                      value={formData.contentType}
                      onValueChange={(value: any) => setFormData({ ...formData, contentType: value })}
                    >
                      <SelectTrigger className="bg-gray-800/50 border-gray-700/50 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 border-gray-700">
                        {CONTENT_TYPES.map((type) => (
                          <SelectItem key={type} value={type} className="text-white">
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">Release Year</Label>
                    <Input
                      type="number"
                      placeholder="e.g., 2024"
                      value={formData.releaseYear}
                      onChange={(e) => setFormData({ ...formData, releaseYear: e.target.value })}
                      className="bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Main Title (Displayed on cards) *</Label>
                  <Input
                    type="text"
                    placeholder="e.g., Inception"
                    value={formData.mainTitle}
                    onChange={(e) => setFormData({ ...formData, mainTitle: e.target.value })}
                    className="bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Secondary Title (Displayed in detail page)</Label>
                  <Input
                    type="text"
                    placeholder="e.g., Inception (2010)"
                    value={formData.secondaryTitle}
                    onChange={(e) => setFormData({ ...formData, secondaryTitle: e.target.value })}
                    className="bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-500"
                  />
                </div>

                {(formData.contentType === 'Series' || formData.contentType === 'Anime') && (
                  <div className="space-y-2">
                    <Label className="text-gray-300">Season</Label>
                    <Input
                      type="text"
                      placeholder="e.g., Season 1"
                      value={formData.season}
                      onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                      className="bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-500"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-gray-300">IMDb Rating</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    placeholder="e.g., 8.5"
                    value={formData.imdbRating}
                    onChange={(e) => setFormData({ ...formData, imdbRating: e.target.value })}
                    className="bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-500"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Image HTML */}
            <Card className="bg-gray-900/50 border-gray-800/50">
              <CardHeader>
                <CardTitle className="text-white">Poster Image</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Image HTML *</Label>
                  <p className="text-xs text-gray-500">Paste the full &lt;img&gt; HTML code here</p>
                  <Textarea
                    placeholder='<img src="https://example.com/poster.jpg" alt="Poster" />'
                    value={formData.imageHtml}
                    onChange={(e) => setFormData({ ...formData, imageHtml: e.target.value })}
                    className="bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-500 font-mono text-sm min-h-[100px]"
                    required
                  />
                </div>
                {formData.imageHtml && (
                  <div className="bg-gray-800/50 rounded-lg p-4 max-w-[200px]">
                    <div dangerouslySetInnerHTML={{ __html: formData.imageHtml }} />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Genres, Languages, Subtitles, Quality */}
            <Card className="bg-gray-900/50 border-gray-800/50">
              <CardHeader>
                <CardTitle className="text-white">Categories & Quality</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-gray-300">Genre (Select multiple)</Label>
                  <div className="flex flex-wrap gap-2">
                    {GENRES.map((genre) => (
                      <div key={genre} className="flex items-center space-x-2">
                        <Checkbox
                          id={`genre-${genre}`}
                          checked={formData.genre.includes(genre)}
                          onCheckedChange={() => handleToggleArray('genre', genre)}
                        />
                        <label
                          htmlFor={`genre-${genre}`}
                          className="text-sm text-gray-300 cursor-pointer hover:text-white transition-colors"
                        >
                          {genre}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-gray-300">Language (Select multiple)</Label>
                  <div className="flex flex-wrap gap-2">
                    {LANGUAGES.map((lang) => (
                      <div key={lang} className="flex items-center space-x-2">
                        <Checkbox
                          id={`lang-${lang}`}
                          checked={formData.language.includes(lang)}
                          onCheckedChange={() => handleToggleArray('language', lang)}
                        />
                        <label
                          htmlFor={`lang-${lang}`}
                          className="text-sm text-gray-300 cursor-pointer hover:text-white transition-colors"
                        >
                          {lang}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-gray-300">Subtitle (Select multiple)</Label>
                  <div className="flex flex-wrap gap-2">
                    {SUBTITLES.map((sub) => (
                      <div key={sub} className="flex items-center space-x-2">
                        <Checkbox
                          id={`sub-${sub}`}
                          checked={formData.subtitle.includes(sub)}
                          onCheckedChange={() => handleToggleArray('subtitle', sub)}
                        />
                        <label
                          htmlFor={`sub-${sub}`}
                          className="text-sm text-gray-300 cursor-pointer hover:text-white transition-colors"
                        >
                          {sub}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-gray-300">Quality (Select multiple)</Label>
                  <div className="flex flex-wrap gap-2">
                    {QUALITIES.map((quality) => (
                      <Badge
                        key={quality}
                        className={`cursor-pointer transition-all ${
                          formData.quality.includes(quality)
                            ? `${getQualityColor(quality)} text-white ring-2 ring-white/20`
                            : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'
                        }`}
                        onClick={() => handleToggleArray('quality', quality)}
                      >
                        {quality}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300">File Size</Label>
                    <Input
                      type="text"
                      placeholder="e.g., 1.5 GB"
                      value={formData.fileSize}
                      onChange={(e) => setFormData({ ...formData, fileSize: e.target.value })}
                      className="bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">Format</Label>
                    <Input
                      type="text"
                      placeholder="e.g., MKV, MP4"
                      value={formData.format}
                      onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                      className="bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-500"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Storyline */}
            <Card className="bg-gray-900/50 border-gray-800/50">
              <CardHeader>
                <CardTitle className="text-white">Storyline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Enter the storyline or description..."
                  value={formData.storyline}
                  onChange={(e) => setFormData({ ...formData, storyline: e.target.value })}
                  className="bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-500 min-h-[200px]"
                />
              </CardContent>
            </Card>

            {/* Download Groups */}
            <Card className="bg-gray-900/50 border-gray-800/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Download Links</CardTitle>
                  <Button
                    type="button"
                    onClick={addDownloadGroup}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Download Group
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {downloadGroups.map((group) => (
                  <div key={group.id} className="space-y-4 p-4 bg-gray-800/30 rounded-lg border border-gray-700/50">
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <Label className="text-gray-300 mb-2 block">Group Title</Label>
                        <Input
                          type="text"
                          placeholder="e.g., Episode 1, Season 1"
                          value={group.title}
                          onChange={(e) => updateDownloadGroup(group.id, e.target.value)}
                          className="bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-500"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => removeDownloadGroup(group.id)}
                        className="flex-shrink-0 mt-6"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-gray-300">Download Links</Label>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => addDownloadLink(group.id)}
                          className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Add Link
                        </Button>
                      </div>

                      {group.links.map((link) => (
                        <div key={link.id} className="p-4 bg-gray-900/50 rounded-lg border border-gray-700/50 space-y-3">
                          <div className="flex items-center gap-4 mb-3">
                            <div className="flex-1">
                              <Label className="text-gray-300 mb-2 block">Link Title</Label>
                              <Input
                                type="text"
                                placeholder="e.g., Google Drive"
                                value={link.title}
                                onChange={(e) => updateDownloadLink(group.id, link.id, 'title', e.target.value)}
                                className="bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-500"
                              />
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeDownloadLink(group.id, link.id)}
                              className="flex-shrink-0 mt-6 text-red-400 hover:text-red-300"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-gray-300 mb-2 block">Download URL</Label>
                            <Input
                              type="url"
                              placeholder="https://example.com/download"
                              value={link.url}
                              onChange={(e) => updateDownloadLink(group.id, link.id, 'url', e.target.value)}
                              className="bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-500"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-gray-300 mb-2 block">Quality</Label>
                            <Select
                              value={link.quality}
                              onValueChange={(value) => updateDownloadLink(group.id, link.id, 'quality', value)}
                            >
                              <SelectTrigger className="bg-gray-800/50 border-gray-700/50 text-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-gray-900 border-gray-700">
                                {QUALITIES.map((quality) => (
                                  <SelectItem key={quality} value={quality} className="text-white">
                                    <div className="flex items-center gap-2">
                                      <div className={`w-2 h-2 rounded-full ${getQualityColor(quality)}`} />
                                      {quality}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {downloadGroups.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Link2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No download groups added yet</p>
                    <p className="text-sm">Click the button above to add your first download group</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <Link href="/admin/dashboard">
                <Button variant="outline" className="border-gray-700 text-gray-300">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold px-8"
                disabled={loading}
              >
                {loading ? 'Saving...' : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Update Content
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
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
