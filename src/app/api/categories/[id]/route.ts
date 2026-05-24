import { NextRequest, NextResponse } from 'next/server'
import { db, doc, updateDoc, deleteDoc, ensureAuth } from '@/lib/firebase-admin'

// PUT update category
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Ensure Firebase auth before writing
    await ensureAuth()

    const { id } = await params
    const body = await request.json()
    const { name, description, contentIds } = body

    const updateData: Record<string, any> = {
      updatedAt: new Date().toISOString()
    }

    if (name) {
      updateData.name = name
      updateData.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    }
    if (description !== undefined) updateData.description = description
    if (contentIds !== undefined) updateData.contentIds = contentIds

    const docRef = doc(db, 'categories', id)
    await updateDoc(docRef, updateData)

    return NextResponse.json({ id, ...updateData })
  } catch (error) {
    console.error('Failed to update category:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

// DELETE category
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Ensure Firebase auth before deleting
    await ensureAuth()

    const { id } = await params
    const docRef = doc(db, 'categories', id)
    await deleteDoc(docRef)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete category:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
