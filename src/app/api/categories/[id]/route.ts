import { NextRequest, NextResponse } from 'next/server'
import { firestore } from '@/lib/firebase'
import { doc, updateDoc, deleteDoc } from 'firebase/firestore'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, description, contentIds } = body
    const updateData: Record<string, any> = { updatedAt: new Date().toISOString() }
    if (name) {
      updateData.name = name
      updateData.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    }
    if (description !== undefined) updateData.description = description
    if (contentIds !== undefined) updateData.contentIds = contentIds
    const docRef = doc(firestore, 'categories', id)
    await updateDoc(docRef, updateData)
    return NextResponse.json({ id, ...updateData })
  } catch (error) {
    console.error('Failed to update category:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const docRef = doc(firestore, 'categories', id)
    await deleteDoc(docRef)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete category:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
