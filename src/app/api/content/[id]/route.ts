import { NextRequest, NextResponse } from 'next/server'
import { firestore } from '@/lib/firebase'
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore'

// GET single content by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const docRef = doc(firestore, 'content', id)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
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

    // Validate required fields
    if (!contentType || !mainTitle || !imageHtml) {
      return NextResponse.json(
        { error: 'Content type, main title, and image HTML are required' },
        { status: 400 }
      )
    }

    // Update content document
    const docRef = doc(firestore, 'content', id)
    
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
    const docRef = doc(firestore, 'content', id)
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
