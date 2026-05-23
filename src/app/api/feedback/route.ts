import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

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
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString()
    const createdAt = now.toISOString()

    const feedbackData = {
      type,
      title,
      contentType: type === 'REQUEST' ? contentType : null,
      message,
      link: type === 'REPORT' ? link : null,
      isRead: false,
      createdAt,
      expiresAt,
    }

    const docRef = await adminDb.collection('feedback').add(feedbackData)

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
    const snapshot = await adminDb.collection('feedback').orderBy('createdAt', 'desc').get()
    
    const now = new Date()
    const feedback: any[] = []
    const expiredIds: string[] = []

    snapshot.forEach((document) => {
      const data = document.data()
      const expiresAt = new Date(data.expiresAt)

      if (expiresAt < now) {
        expiredIds.push(document.id)
      } else {
        feedback.push({
          id: document.id,
          ...data
        })
      }
    })

    // Cleanup expired feedback asynchronously
    if (expiredIds.length > 0) {
      Promise.all(expiredIds.map(id => adminDb.collection('feedback').doc(id).delete()))
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
