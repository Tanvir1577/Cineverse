import { NextRequest, NextResponse } from 'next/server'
import { db, doc, updateDoc, deleteDoc, ensureAuth } from '@/lib/firebase-admin'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Ensure Firebase auth before writing
    await ensureAuth()

    const { id } = await params
    const body = await request.json()
    const { isRead } = body

    const docRef = doc(db, 'feedback', id)
    await updateDoc(docRef, { isRead })

    return NextResponse.json({ id, isRead })
  } catch (error) {
    console.error('Failed to update feedback:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Ensure Firebase auth before deleting
    await ensureAuth()

    const { id } = await params
    const docRef = doc(db, 'feedback', id)
    await deleteDoc(docRef)
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Failed to delete feedback:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
