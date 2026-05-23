import { NextRequest, NextResponse } from 'next/server'
import { serverDb } from '@/lib/firebase-server'
import { doc, updateDoc, deleteDoc } from 'firebase/firestore'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { isRead } = body

    await updateDoc(doc(serverDb, 'feedback', id), { isRead })

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
    const { id } = await params
    await deleteDoc(doc(serverDb, 'feedback', id))
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Failed to delete feedback:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
