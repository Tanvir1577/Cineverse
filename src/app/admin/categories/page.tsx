'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  ArrowLeft,
  Plus,
  Trash2,
  Pencil,
  Play,
  Loader2,
  Search,
} from 'lucide-react'
import { toast } from 'sonner'

interface CategoryItem {
  id: string
  name: string
  slug?: string
  description: string
  contentIds: string[]
  createdAt: string
  updatedAt: string
}

interface ContentItem {
  id: string
  contentType: string
  mainTitle: string
  secondaryTitle: string
}

export default function AdminCategoriesPage() {
  const router = useRouter()
  const [authLoading, setAuthLoading] = useState(true)
  const [categories, setCategories] = useState<CategoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null)
  const [formName, setFormName] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formContentIds, setFormContentIds] = useState<string[]>([])

  // Content search state
  const [contentSearch, setContentSearch] = useState('')
  const [searchResults, setSearchResults] = useState<ContentItem[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [allContent, setAllContent] = useState<ContentItem[]>([])

  // Auth check
  useEffect(() => {
    const adminUid = localStorage.getItem('adminUid')
    if (!adminUid) {
      router.push('/admin/login')
      return
    }
    setAuthLoading(false)
  }, [router])

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/categories')
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      setCategories(data)
    } catch {
      toast.error('Failed to load categories')
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch all content (for resolving names of selected items)
  const fetchAllContent = useCallback(async () => {
    try {
      const res = await fetch('/api/content?limit=1000')
      if (!res.ok) return
      const data = await res.json()
      setAllContent((data.contents || []).map((c: ContentItem) => ({
        id: c.id,
        contentType: c.contentType,
        mainTitle: c.mainTitle,
        secondaryTitle: c.secondaryTitle,
      })))
    } catch {
      // Silent fail - content names are nice-to-have
    }
  }, [])

  // Content search (dynamic fetch)
  const searchContent = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults(allContent.slice(0, 50))
      return
    }
    try {
      setSearchLoading(true)
      const res = await fetch(`/api/content?limit=1000&search=${encodeURIComponent(query)}`)
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      setSearchResults((data.contents || []).map((c: ContentItem) => ({
        id: c.id,
        contentType: c.contentType,
        mainTitle: c.mainTitle,
        secondaryTitle: c.secondaryTitle,
      })))
    } catch {
      // Fallback to local filter
      const q = query.toLowerCase()
      setSearchResults(
        allContent.filter(
          (c) =>
            c.mainTitle?.toLowerCase().includes(q) ||
            c.secondaryTitle?.toLowerCase().includes(q)
        ).slice(0, 50)
      )
    } finally {
      setSearchLoading(false)
    }
  }, [allContent])

  useEffect(() => {
    if (!authLoading) {
      fetchCategories()
      fetchAllContent()
    }
  }, [authLoading, fetchCategories, fetchAllContent])

  // When allContent loads, init search results
  useEffect(() => {
    if (allContent.length > 0 && searchResults.length === 0) {
      setSearchResults(allContent.slice(0, 50))
    }
  }, [allContent, searchResults.length])

  // Debounced content search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchContent(contentSearch)
    }, 300)
    return () => clearTimeout(timer)
  }, [contentSearch, searchContent])

  // Open create dialog
  const handleCreate = () => {
    setEditingCategory(null)
    setFormName('')
    setFormDescription('')
    setFormContentIds([])
    setContentSearch('')
    setSearchResults(allContent.slice(0, 50))
    setDialogOpen(true)
  }

  // Open edit dialog
  const handleEdit = (category: CategoryItem) => {
    setEditingCategory(category)
    setFormName(category.name)
    setFormDescription(category.description)
    setFormContentIds(category.contentIds || [])
    setContentSearch('')
    setSearchResults(allContent.slice(0, 50))
    setDialogOpen(true)
  }

  // Toggle content selection
  const toggleContent = (contentId: string) => {
    setFormContentIds((prev) =>
      prev.includes(contentId)
        ? prev.filter((id) => id !== contentId)
        : [...prev, contentId]
    )
  }

  // Save category
  const handleSave = async () => {
    if (!formName.trim()) {
      toast.error('Category name is required')
      return
    }
    try {
      setSaving(true)
      const payload = {
        name: formName.trim(),
        description: formDescription.trim(),
        contentIds: formContentIds,
      }

      if (editingCategory) {
        const res = await fetch(`/api/categories/${editingCategory.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error('Failed')
        toast.success('Category updated')
      } else {
        const res = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error('Failed')
        toast.success('Category created')
      }

      setDialogOpen(false)
      fetchCategories()
    } catch {
      toast.error(editingCategory ? 'Failed to update category' : 'Failed to create category')
    } finally {
      setSaving(false)
    }
  }

  // Delete category
  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return
    try {
      setDeletingId(id)
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed')
      setCategories((prev) => prev.filter((c) => c.id !== id))
      toast.success('Category deleted')
    } catch {
      toast.error('Failed to delete category')
    } finally {
      setDeletingId(null)
    }
  }

  // Resolve content name
  const getContentName = (id: string) => {
    const c = allContent.find((item) => item.id === id)
    return c?.mainTitle || id.slice(0, 8)
  }

  // Auth loading
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="h-10 w-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

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
              <h1 className="text-lg font-bold text-white">Categories</h1>
            </div>

            <Button
              onClick={handleCreate}
              className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white gap-2 shadow-lg shadow-purple-500/20 text-sm"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Category</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-8 w-8 text-purple-400 animate-spin mb-4" />
            <p className="text-white/40 text-sm">Loading categories...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 animate-in fade-in duration-300">
            <div className="h-20 w-20 rounded-2xl bg-white/5 flex items-center justify-center mb-5">
              <Play className="h-10 w-10 text-white/15" />
            </div>
            <h2 className="text-white/60 text-lg font-semibold mb-2">No categories yet</h2>
            <p className="text-white/30 text-sm mb-6 text-center max-w-sm">
              Create your first category to organize content collections.
            </p>
            <Button
              onClick={handleCreate}
              className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white gap-2 shadow-lg shadow-purple-500/20"
            >
              <Plus className="h-4 w-4" />
              Create First Category
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {categories.map((category) => (
              <Card
                key={category.id}
                className="bg-[#12121a] border-white/[0.06] hover:border-white/[0.12] transition-colors duration-200 animate-in fade-in duration-300"
              >
                <CardContent className="p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    {/* Left: info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 mb-1">
                        <div className="h-8 w-8 rounded-lg bg-purple-500/15 flex items-center justify-center shrink-0">
                          <Play className="h-4 w-4 text-purple-400" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-white font-semibold text-base truncate">
                            {category.name}
                          </h3>
                          {category.slug && (
                            <p className="text-white/20 text-xs truncate">/{category.slug}</p>
                          )}
                        </div>
                      </div>

                      {category.description && (
                        <p className="text-white/40 text-sm leading-relaxed mt-2">
                          {category.description}
                        </p>
                      )}

                      <p className="text-white/25 text-xs mt-2">
                        {(category.contentIds || []).length} content item{(category.contentIds || []).length !== 1 ? 's' : ''} · Created {new Date(category.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Right: actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(category)}
                        className="h-8 text-xs gap-1.5 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 border border-purple-500/20"
                      >
                        <Pencil className="h-3 w-3" />
                        Edit
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(category.id, category.name)}
                        disabled={deletingId === category.id}
                        className="h-8 text-xs gap-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20"
                      >
                        {deletingId === category.id ? (
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
            ))}
          </div>
        )}
      </main>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-[#12121a] border-white/[0.08] max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogTitle className="text-white text-lg flex items-center gap-2 px-1">
            {editingCategory ? (
              <>
                <Pencil className="h-5 w-5 text-purple-400" />
                Edit Category
              </>
            ) : (
              <>
                <Plus className="h-5 w-5 text-purple-400" />
                Create Category
              </>
            )}
          </DialogTitle>

          <div className="flex-1 overflow-y-auto space-y-5 pr-1 -mr-1 py-2">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="cat-name" className="text-white/70 text-sm font-medium">
                Category Name <span className="text-red-400">*</span>
              </Label>
              <Input
                id="cat-name"
                placeholder="e.g., Trending Now, Popular"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="bg-[#1a1a25] border-white/[0.08] text-white placeholder:text-white/25 focus:border-purple-500/50 focus:ring-purple-500/20 h-11"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="cat-desc" className="text-white/70 text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="cat-desc"
                placeholder="Brief description of this category..."
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                rows={3}
                className="bg-[#1a1a25] border-white/[0.08] text-white placeholder:text-white/25 focus:border-purple-500/50 focus:ring-purple-500/20 resize-none"
              />
            </div>

            {/* Content Selector */}
            <div className="space-y-3">
              <Label className="text-white/70 text-sm font-medium">
                Content Items
                <span className="text-white/30 font-normal ml-2">
                  ({formContentIds.length} selected)
                </span>
              </Label>

              {/* Selected items as removable tags */}
              {formContentIds.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {formContentIds.map((contentId) => (
                    <span
                      key={contentId}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-purple-500/15 text-purple-300 text-xs border border-purple-500/25"
                    >
                      {getContentName(contentId)}
                      <button
                        onClick={() => toggleContent(contentId)}
                        className="ml-0.5 hover:text-white transition-colors"
                        aria-label={`Remove ${getContentName(contentId)}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Search input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                <Input
                  placeholder="Search content to add..."
                  value={contentSearch}
                  onChange={(e) => setContentSearch(e.target.value)}
                  className="pl-9 bg-[#1a1a25] border-white/[0.08] text-white placeholder:text-white/25 focus:border-purple-500/50 focus:ring-purple-500/20 h-10"
                />
              </div>

              {/* Content list */}
              <div className="h-64 overflow-y-auto rounded-lg border border-white/[0.06] bg-[#0a0a0f]">
                {searchLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-5 w-5 text-purple-400 animate-spin" />
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 px-4">
                    <Search className="h-6 w-6 text-white/10 mb-2" />
                    <p className="text-white/30 text-sm">
                      {contentSearch ? 'No content matches your search' : 'No content available'}
                    </p>
                    {contentSearch && (
                      <button
                        onClick={() => setContentSearch('')}
                        className="mt-2 text-purple-400 hover:text-purple-300 text-xs transition-colors"
                      >
                        Clear search
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="p-1">
                    {searchResults.map((content) => {
                      const isSelected = formContentIds.includes(content.id)
                      return (
                        <label
                          key={content.id}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-purple-500/10 hover:bg-purple-500/15'
                              : 'hover:bg-white/[0.03]'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleContent(content.id)}
                            className="h-4 w-4 rounded border-white/20 bg-transparent accent-purple-500"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-white/80 text-sm truncate">
                              {content.mainTitle}
                            </p>
                            {content.secondaryTitle && (
                              <p className="text-white/25 text-xs truncate">
                                {content.secondaryTitle}
                              </p>
                            )}
                          </div>
                          <span className="text-white/30 text-[10px] shrink-0 px-1.5 py-0.5 rounded bg-white/5">
                            {content.contentType}
                          </span>
                        </label>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Dialog footer */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-white/[0.06]">
            <Button
              variant="ghost"
              onClick={() => setDialogOpen(false)}
              className="text-white/60 hover:text-white hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !formName.trim()}
              className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white gap-2 shadow-lg shadow-purple-500/20 min-w-[120px]"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : editingCategory ? (
                <>
                  <Pencil className="h-4 w-4" />
                  Update
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Create
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="mt-auto border-t border-white/[0.04] py-4 bg-[#0a0a0f]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-xs text-white/30">Cineverse Admin · Categories</span>
        </div>
      </footer>
    </div>
  )
}
