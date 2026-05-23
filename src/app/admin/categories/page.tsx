'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
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
  FolderOpen,
  Hash,
  Calendar,
  X,
  Check,
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } }
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }
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

  // Fetch all content
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
      // Silent fail
    }
  }, [])

  // Content search
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

  useEffect(() => {
    if (allContent.length > 0 && searchResults.length === 0) {
      setSearchResults(allContent.slice(0, 50))
    }
  }, [allContent, searchResults.length])

  useEffect(() => {
    const timer = setTimeout(() => {
      searchContent(contentSearch)
    }, 300)
    return () => clearTimeout(timer)
  }, [contentSearch, searchContent])

  const handleCreate = () => {
    setEditingCategory(null)
    setFormName('')
    setFormDescription('')
    setFormContentIds([])
    setContentSearch('')
    setSearchResults(allContent.slice(0, 50))
    setDialogOpen(true)
  }

  const handleEdit = (category: CategoryItem) => {
    setEditingCategory(category)
    setFormName(category.name)
    setFormDescription(category.description)
    setFormContentIds(category.contentIds || [])
    setContentSearch('')
    setSearchResults(allContent.slice(0, 50))
    setDialogOpen(true)
  }

  const toggleContent = (contentId: string) => {
    setFormContentIds((prev) =>
      prev.includes(contentId)
        ? prev.filter((id) => id !== contentId)
        : [...prev, contentId]
    )
  }

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

  const getContentName = (id: string) => {
    const c = allContent.find((item) => item.id === id)
    return c?.mainTitle || id.slice(0, 8)
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
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-amber-500 to-purple-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                  <FolderOpen className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white leading-tight">Categories</h1>
                  <p className="text-[10px] text-white/25 uppercase tracking-wider">Manage collections</p>
                </div>
              </div>
            </div>

            <Button
              onClick={handleCreate}
              className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white gap-2 shadow-lg shadow-purple-500/20 text-sm rounded-xl transition-all duration-300"
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
        {/* Stats bar */}
        <motion.div
          className="grid grid-cols-3 gap-3 mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="bg-[#12121a] border-white/[0.06] overflow-hidden relative group hover:border-white/[0.1] transition-all duration-300">
            <div className="absolute top-0 right-0 w-16 h-16 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: 'rgba(139,92,246,0.15)' }} />
            <CardContent className="p-3 sm:p-4 relative z-10">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="h-6 w-6 rounded-md bg-purple-500/20 flex items-center justify-center">
                  <FolderOpen className="h-3 w-3 text-purple-400" />
                </div>
              </div>
              <p className="text-2xl font-bold text-white tabular-nums">{categories.length}</p>
              <p className="text-[11px] text-white/30 font-medium">Categories</p>
              <div className="h-[2px] bg-gradient-to-r from-purple-600 to-purple-400 opacity-0 group-hover:opacity-50 transition-opacity duration-500 absolute bottom-0 left-0 right-0" />
            </CardContent>
          </Card>
          <Card className="bg-[#12121a] border-white/[0.06] overflow-hidden relative group hover:border-white/[0.1] transition-all duration-300">
            <div className="absolute top-0 right-0 w-16 h-16 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: 'rgba(6,182,212,0.15)' }} />
            <CardContent className="p-3 sm:p-4 relative z-10">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="h-6 w-6 rounded-md bg-cyan-500/20 flex items-center justify-center">
                  <Hash className="h-3 w-3 text-cyan-400" />
                </div>
              </div>
              <p className="text-2xl font-bold text-white tabular-nums">
                {categories.reduce((sum, c) => sum + (c.contentIds?.length || 0), 0)}
              </p>
              <p className="text-[11px] text-white/30 font-medium">Total Items</p>
              <div className="h-[2px] bg-gradient-to-r from-cyan-600 to-cyan-400 opacity-0 group-hover:opacity-50 transition-opacity duration-500 absolute bottom-0 left-0 right-0" />
            </CardContent>
          </Card>
          <Card className="bg-[#12121a] border-white/[0.06] overflow-hidden relative group hover:border-white/[0.1] transition-all duration-300">
            <div className="absolute top-0 right-0 w-16 h-16 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: 'rgba(245,158,11,0.15)' }} />
            <CardContent className="p-3 sm:p-4 relative z-10">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="h-6 w-6 rounded-md bg-amber-500/20 flex items-center justify-center">
                  <Calendar className="h-3 w-3 text-amber-400" />
                </div>
              </div>
              <p className="text-2xl font-bold text-white tabular-nums">
                {allContent.length}
              </p>
              <p className="text-[11px] text-white/30 font-medium">Available Content</p>
              <div className="h-[2px] bg-gradient-to-r from-amber-600 to-amber-400 opacity-0 group-hover:opacity-50 transition-opacity duration-500 absolute bottom-0 left-0 right-0" />
            </CardContent>
          </Card>
        </motion.div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="relative inline-flex">
              <div className="h-10 w-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
              <div className="absolute inset-0 h-10 w-10 border-2 border-cyan-500/30 border-b-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
            </div>
            <p className="text-white/30 text-sm mt-4">Loading categories...</p>
          </div>
        ) : categories.length === 0 ? (
          <motion.div
            className="flex flex-col items-center justify-center py-20 px-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="h-20 w-20 rounded-2xl bg-white/[0.03] flex items-center justify-center mb-5 border border-white/[0.04]">
              <FolderOpen className="h-10 w-10 text-white/10" />
            </div>
            <h2 className="text-white/50 text-lg font-semibold mb-2">No categories yet</h2>
            <p className="text-white/25 text-sm mb-6 text-center max-w-sm">
              Create your first category to organize content collections.
            </p>
            <Button
              onClick={handleCreate}
              className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white gap-2 shadow-lg shadow-purple-500/20 rounded-xl transition-all duration-300"
            >
              <Plus className="h-4 w-4" />
              Create First Category
            </Button>
          </motion.div>
        ) : (
          <motion.div
            className="space-y-3"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {categories.map((category) => (
              <motion.div key={category.id} variants={itemVariants}>
                <Card className="bg-[#12121a]/70 border-white/[0.06] hover:border-white/[0.12] transition-all duration-300 overflow-hidden relative group">
                  {/* Hover glow */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <CardContent className="p-4 sm:p-5 relative z-10">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      {/* Left: info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2.5 mb-1.5">
                          <div className="h-9 w-9 rounded-xl bg-purple-500/15 flex items-center justify-center shrink-0 border border-purple-500/15">
                            <FolderOpen className="h-4 w-4 text-purple-400" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-white font-semibold text-base truncate group-hover:text-white/90 transition-colors">
                              {category.name}
                            </h3>
                            {category.slug && (
                              <p className="text-white/20 text-xs truncate">/{category.slug}</p>
                            )}
                          </div>
                        </div>

                        {category.description && (
                          <p className="text-white/35 text-sm leading-relaxed mt-2 ml-0 sm:ml-[44px]">
                            {category.description}
                          </p>
                        )}

                        <div className="flex items-center gap-3 mt-3 ml-0 sm:ml-[44px]">
                          <span className="text-white/25 text-xs flex items-center gap-1">
                            <Hash className="h-3 w-3" />
                            {(category.contentIds || []).length} item{(category.contentIds || []).length !== 1 ? 's' : ''}
                          </span>
                          <span className="text-white/15 text-[10px]">·</span>
                          <span className="text-white/20 text-xs flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(category.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Right: actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(category)}
                          className="h-8 text-xs gap-1.5 text-purple-400/70 hover:text-purple-400 hover:bg-purple-500/10 border border-purple-500/15 rounded-lg transition-colors"
                        >
                          <Pencil className="h-3 w-3" />
                          Edit
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(category.id, category.name)}
                          disabled={deletingId === category.id}
                          className="h-8 text-xs gap-1.5 text-white/20 hover:text-red-400 hover:bg-red-500/10 border border-white/[0.06] hover:border-red-500/15 rounded-lg transition-colors"
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
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-[#12121a] border-white/[0.08] max-w-2xl max-h-[90vh] overflow-hidden flex flex-col rounded-2xl">
          <DialogTitle className="text-white text-lg flex items-center gap-2.5 px-1">
            {editingCategory ? (
              <>
                <div className="h-8 w-8 rounded-lg bg-purple-500/15 flex items-center justify-center">
                  <Pencil className="h-4 w-4 text-purple-400" />
                </div>
                Edit Category
              </>
            ) : (
              <>
                <div className="h-8 w-8 rounded-lg bg-purple-500/15 flex items-center justify-center">
                  <Plus className="h-4 w-4 text-purple-400" />
                </div>
                Create Category
              </>
            )}
          </DialogTitle>

          <div className="flex-1 overflow-y-auto space-y-5 pr-1 -mr-1 py-2">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="cat-name" className="text-white/50 text-sm font-medium">
                Category Name <span className="text-red-400/80">*</span>
              </Label>
              <Input
                id="cat-name"
                placeholder="e.g., Trending Now, Popular"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="bg-[#1a1a25]/60 border-white/[0.06] text-white placeholder:text-white/20 focus-visible:border-purple-500/40 focus-visible:ring-purple-500/15 h-11 rounded-xl transition-all duration-300"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="cat-desc" className="text-white/50 text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="cat-desc"
                placeholder="Brief description of this category..."
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                rows={3}
                className="bg-[#1a1a25]/60 border-white/[0.06] text-white placeholder:text-white/20 focus-visible:border-purple-500/40 focus-visible:ring-purple-500/15 resize-none rounded-xl transition-all duration-300"
              />
            </div>

            {/* Content Selector */}
            <div className="space-y-3">
              <Label className="text-white/50 text-sm font-medium flex items-center gap-2">
                <Hash className="h-3.5 w-3.5 text-purple-400/50" />
                Content Items
                <span className="text-white/20 font-normal text-xs">
                  ({formContentIds.length} selected)
                </span>
              </Label>

              {/* Selected items as removable tags */}
              {formContentIds.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {formContentIds.map((contentId) => (
                    <span
                      key={contentId}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-300/80 text-xs border border-purple-500/20"
                    >
                      {getContentName(contentId)}
                      <button
                        onClick={() => toggleContent(contentId)}
                        className="ml-0.5 hover:text-white transition-colors"
                        aria-label={`Remove ${getContentName(contentId)}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Search input */}
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-purple-400/60 transition-colors" />
                <Input
                  placeholder="Search content to add..."
                  value={contentSearch}
                  onChange={(e) => setContentSearch(e.target.value)}
                  className="pl-9 bg-[#1a1a25]/60 border-white/[0.06] text-white placeholder:text-white/20 focus-visible:border-purple-500/40 focus-visible:ring-purple-500/15 h-10 rounded-xl transition-all duration-300"
                />
              </div>

              {/* Content list */}
              <div className="h-64 overflow-y-auto rounded-xl border border-white/[0.06] bg-[#0a0a0f]/50">
                {searchLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="h-6 w-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 px-4">
                    <Search className="h-6 w-6 text-white/10 mb-2" />
                    <p className="text-white/25 text-sm">
                      {contentSearch ? 'No content matches your search' : 'No content available'}
                    </p>
                    {contentSearch && (
                      <button
                        onClick={() => setContentSearch('')}
                        className="mt-2 text-purple-400/70 hover:text-purple-400 text-xs transition-colors"
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
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 ${
                            isSelected
                              ? 'bg-purple-500/10 hover:bg-purple-500/15'
                              : 'hover:bg-white/[0.03]'
                          }`}
                        >
                          <div className={`h-4 w-4 rounded border flex items-center justify-center shrink-0 transition-all duration-200 ${
                            isSelected
                              ? 'bg-purple-500 border-purple-500'
                              : 'border-white/20 bg-transparent'
                          }`}>
                            {isSelected && <Check className="h-3 w-3 text-white" />}
                          </div>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleContent(content.id)}
                            className="sr-only"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-white/70 text-sm truncate">{content.mainTitle}</p>
                            {content.secondaryTitle && (
                              <p className="text-white/20 text-xs truncate">{content.secondaryTitle}</p>
                            )}
                          </div>
                          <span className="text-white/20 text-[10px] shrink-0 px-1.5 py-0.5 rounded-md bg-white/[0.04]">
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
              className="text-white/40 hover:text-white/70 hover:bg-white/[0.04] rounded-xl transition-colors"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !formName.trim()}
              className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white gap-2 shadow-lg shadow-purple-500/20 min-w-[120px] rounded-xl transition-all duration-300 disabled:opacity-50"
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
          <span className="text-xs text-white/15">Cineverse Admin · Categories</span>
        </div>
      </footer>
    </div>
  )
}
