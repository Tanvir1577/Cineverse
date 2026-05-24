import { NextRequest, NextResponse } from 'next/server'
import { db, collection, getDocs, addDoc, query, orderBy } from '@/lib/firebase-admin'

// Normalize Firestore data: ensure array fields are always arrays
function normalizeContent(data: Record<string, unknown>) {
  const arrayFields = ['genre', 'language', 'subtitle', 'quality']
  for (const field of arrayFields) {
    if (!Array.isArray(data[field])) {
      data[field] = data[field] ? [data[field]] : []
    }
  }
  if (Array.isArray(data.downloadGroups)) {
    data.downloadGroups = data.downloadGroups.map((group: any) => ({
      ...group,
      links: Array.isArray(group.links) ? group.links.map((link: any) => ({
        ...link,
        quality: Array.isArray(link.quality) ? link.quality : link.quality ? [link.quality] : []
      })) : []
    }))
  }
  return data
}

// GET all content with optional filtering and search
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '24')
    const skip = (page - 1) * limit

    const q = query(collection(db, 'content'), orderBy('createdAt', 'desc'))
    const snapshot = await getDocs(q)
    let contents: any[] = []

    snapshot.forEach((docSnap) => {
      contents.push(normalizeContent({
        id: docSnap.id,
        ...docSnap.data()
      }))
    })

    // Filter by content type if specified
    if (type && type !== 'all') {
      contents = contents.filter(content => content.contentType === type)
    }

    // Search functionality
    if (search) {
      const searchLower = search.toLowerCase()
      contents = contents.filter(content =>
        (content.mainTitle && content.mainTitle.toLowerCase().includes(searchLower)) ||
        (content.secondaryTitle && content.secondaryTitle.toLowerCase().includes(searchLower)) ||
        (content.name && content.name.toLowerCase().includes(searchLower)) ||
        (content.season && content.season.toLowerCase().includes(searchLower)) ||
        (content.storyline && content.storyline.toLowerCase().includes(searchLower)) ||
        (content.genre && content.genre.some((g: string) => g.toLowerCase().includes(searchLower))) ||
        (content.language && content.language.some((l: string) => l.toLowerCase().includes(searchLower))) ||
        (content.subtitle && content.subtitle.some((s: string) => s.toLowerCase().includes(searchLower))) ||
        (content.quality && content.quality.some((q: string) => q.toLowerCase().includes(searchLower))) ||
        (content.contentType && content.contentType.toLowerCase().includes(searchLower)) ||
        (content.releaseYear && content.releaseYear.toString().includes(search))
      )
    }

    const total = contents.length
    const totalPages = Math.ceil(total / limit)
    const paginatedContents = contents.slice(skip, skip + limit)

    return NextResponse.json({
      contents: paginatedContents,
      total,
      totalPages,
      currentPage: page,
      limit
    })
  } catch (error) {
    console.error('Error fetching contents:', error)
    return NextResponse.json(
      { error: 'Failed to fetch contents' },
      { status: 500 }
    )
  }
}

// POST create new content
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      contentType,
      mainTitle,
      secondaryTitle,
      imageHtml,
      name,
      season,
      imdbRating,
      releaseYear,
      genre,
      language,
      subtitle,
      quality,
      fileSize,
      format,
      storyline,
      downloadGroups = [],
    } = body

    if (!contentType || !mainTitle || !imageHtml) {
      return NextResponse.json(
        { error: 'Content type, main title, and image HTML are required' },
        { status: 400 }
      )
    }

    const timestamp = new Date().toISOString()

    const contentData = {
      contentType,
      mainTitle,
      secondaryTitle: secondaryTitle || '',
      imageHtml,
      name: name || '',
      season: season || '',
      imdbRating: imdbRating || null,
      releaseYear: releaseYear || null,
      genre: genre || [],
      language: language || [],
      subtitle: subtitle || [],
      quality: quality || [],
      fileSize: fileSize || '',
      format: format || '',
      storyline: storyline || '',
      downloadGroups: downloadGroups || [],
      createdAt: timestamp,
      updatedAt: timestamp,
    }

    const docRef = await addDoc(collection(db, 'content'), contentData)

    const createdContent = {
      id: docRef.id,
      ...contentData
    }

    return NextResponse.json(createdContent, { status: 201 })
  } catch (error) {
    console.error('Error creating content:', error)
    return NextResponse.json(
      { error: 'Failed to create content' },
      { status: 500 }
    )
  }
}
