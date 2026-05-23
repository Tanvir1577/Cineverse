import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export async function GET() {
  try {
    const snapshot = await adminDb.collection('feedback').where('isRead', '==', false).get()
    
    const now = new Date()
    let count = 0

    snapshot.forEach((document) => {
      const data = document.data()
      const expiresAt = new Date(data.expiresAt)

      if (expiresAt > now) {
        count++
      }
    })

    return NextResponse.json({ count })
  } catch (error) {
    console.error('Failed to fetch feedback count:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
