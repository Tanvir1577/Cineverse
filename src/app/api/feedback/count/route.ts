import { NextResponse } from 'next/server'
import { db, collection, getDocs, query, where } from '@/lib/firebase-admin'

export async function GET() {
  try {
    const q = query(collection(db, 'feedback'), where('isRead', '==', false))
    const snapshot = await getDocs(q)

    const now = new Date()
    let count = 0

    snapshot.forEach((docSnap) => {
      const data = docSnap.data()
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
