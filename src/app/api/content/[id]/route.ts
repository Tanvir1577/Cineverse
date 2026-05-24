import { NextRequest, NextResponse } from 'next/server'
import { db, doc, getDoc, updateDoc, deleteDoc } from '@/lib/firebase-admin'

// Normalize Firestore data: ensure array fields are always arrays
function normalizeContent(data: Record<string, unknown>) {
  const arrayFields = ['genre', 'language', 'subtitle', 'quality']
  for (const field of arrayFields) {
    if (!Array.isArray(data[field])) {
      data[field] = data[field] ? [data[field]] : []
    }
  }
  // Normalize downloadGroups.links.quality too
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

// Helper: remove undefined values (Firebase Client SDK doesn't allow undefined)
function cleanData(data: Record<string, unknown>) {
  const cleaned: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      cleaned[key] = value
    }
  }
  return cleaned
}

// GET single content by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const docRef = doc(db, 'content', id)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      )
    }

    const content = normalizeContent({
      id: docSnap.id,
      ...docSnap.data()
    })

    return NextResponse.json(content)
  } catch (error) {
    console.error('Error fetching content:', error)
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    )
  }
}

// PUT update content
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
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
      downloadGroups,
    } = body

    if (!contentType || !mainTitle || !imageHtml) {
      return NextResponse.json(
        { error: 'Content type, main title, and image HTML are required' },
        { status: 400 }
      )
    }

    const docRef = doc(db, 'content', id)

    const updateData = cleanData({
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
      updatedAt: new Date().toISOString(),
    })

    await updateDoc(docRef, updateData)

    const updatedContent = {
      id,
      ...updateData
    }

    return NextResponse.json(updatedContent)
  } catch (error) {
    console.error('Error updating content:', error)
    return NextResponse.json(
      { error: 'Failed to update content' },
      { status: 500 }
    )
  }
}

// DELETE content
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const docRef = doc(db, 'content', id)
    await deleteDoc(docRef)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting content:', error)
    return NextResponse.json(
      { error: 'Failed to delete content' },
      { status: 500 }
    )
  }
}
