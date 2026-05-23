import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

// GET all categories
export async function GET() {
  try {
    const catSnapshot = await adminDb.collection('categories').orderBy('createdAt', 'desc').get()
    
    const categories: any[] = []
    catSnapshot.forEach((document) => {
      categories.push({
        id: document.id,
        ...document.data()
      })
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Failed to fetch categories:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

// POST create category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, contentIds } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      )
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    const timestamp = new Date().toISOString()

    const catData = {
      name,
      slug,
      description: description || '',
      contentIds: contentIds || [],
      createdAt: timestamp,
      updatedAt: timestamp,
    }

    const docRef = await adminDb.collection('categories').add(catData)

    return NextResponse.json({ id: docRef.id, ...catData }, { status: 201 })
  } catch (error) {
    console.error('Failed to create category:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
