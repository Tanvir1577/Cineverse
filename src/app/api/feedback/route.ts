import { NextRequest, NextResponse } from 'next/server'
import { db, collection, getDocs, addDoc, query, orderBy, deleteDoc, doc } from '@/lib/firebase-admin'

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

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { type, title, contentType, message, link } = body

    if (!type || !title || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const now = new Date()
    const expiresAt = new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString()
    const createdAt = now.toISOString()

    const feedbackData = cleanData({
      type,
      title,
      contentType: type === 'REQUEST' ? (contentType || null) : null,
      message,
      link: type === 'REPORT' ? (link || null) : null,
      isRead: false,
      createdAt,
      expiresAt,
    })

    const docRef = await addDoc(collection(db, 'feedback'), feedbackData)

    return NextResponse.json({ id: docRef.id, ...feedbackData }, { status: 201 })
  } catch (error) {
    console.error('Failed to create feedback:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const q = query(collection(db, 'feedback'), orderBy('createdAt', 'desc'))
    const snapshot = await getDocs(q)

    const now = new Date()
    const feedback: any[] = []
    const expiredIds: string[] = []

    snapshot.forEach((docSnap) => {
      const data = docSnap.data()
      const expiresAt = new Date(data.expiresAt)

      if (expiresAt < now) {
        expiredIds.push(docSnap.id)
      } else {
        feedback.push({
          id: docSnap.id,
          ...data
        })
      }
    })

    // Cleanup expired feedback asynchronously
    if (expiredIds.length > 0) {
      Promise.all(expiredIds.map(id => deleteDoc(doc(db, 'feedback', id))))
        .catch(err => console.error('Failed to cleanup expired feedback:', err))
    }

    return NextResponse.json(feedback)
  } catch (error) {
    console.error('Failed to fetch feedback:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
