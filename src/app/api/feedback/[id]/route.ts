import { NextResponse } from 'next/server'
import { firestore } from '@/lib/firebase'
import { doc, updateDoc, deleteDoc } from 'firebase/firestore'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { isRead } = body

    const feedbackRef = doc(firestore, 'feedback', id)
    await updateDoc(feedbackRef, { isRead })

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
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    await deleteDoc(doc(firestore, 'feedback', id))

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Failed to delete feedback:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
