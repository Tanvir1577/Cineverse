import { NextRequest, NextResponse } from 'next/server'
import { firestore } from '@/lib/firebase'
import { collection, getDocs, addDoc, query, where, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore'

// GET all content with optional filtering and search
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const search = searchParams.get('search')

    // Get all content from Firestore
    const contentCollection = collection(firestore, 'content')
    let q = query(contentCollection, orderBy('createdAt', 'desc'))
    
    const querySnapshot = await getDocs(q)
    let contents: any[] = []
    
    querySnapshot.forEach((doc) => {
      contents.push({
        id: doc.id,
        ...doc.data()
      })
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

    return NextResponse.json(contents)
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

    // Validate required fields
    if (!contentType || !mainTitle || !imageHtml) {
      return NextResponse.json(
        { error: 'Content type, main title, and image HTML are required' },
        { status: 400 }
      )
    }

    // Add timestamps
    const timestamp = new Date().toISOString()
    
    // Create content document in Firestore
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

    const docRef = await addDoc(collection(firestore, 'content'), contentData)
    
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
