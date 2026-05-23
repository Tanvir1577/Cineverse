import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

// GET single content by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const docRef = adminDb.collection('content').doc(id)
    const docSnap = await docRef.get()

    if (!docSnap.exists) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      )
    }

    const content = {
      id: docSnap.id,
      ...docSnap.data()
    }

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
      downloadGroups = [],
    } = body

    if (!contentType || !mainTitle || !imageHtml) {
      return NextResponse.json(
        { error: 'Content type, main title, and image HTML are required' },
        { status: 400 }
      )
    }

    const docRef = adminDb.collection('content').doc(id)
    
    const updateData = {
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
    }

    await docRef.update(updateData)

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
    const docRef = adminDb.collection('content').doc(id)
    await docRef.delete()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting content:', error)
    return NextResponse.json(
      { error: 'Failed to delete content' },
      { status: 500 }
    )
  }
}
