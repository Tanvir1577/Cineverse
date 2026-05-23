import { NextResponse } from 'next/server'
import { serverDb } from '@/lib/firebase-server'
import { collection, getDocs, query, where } from 'firebase/firestore'

export async function GET() {
  try {
    const feedbackCollection = collection(serverDb, 'feedback')
    const q = query(feedbackCollection, where('isRead', '==', false))
    const querySnapshot = await getDocs(q)
    
    const now = new Date()
    let count = 0

    querySnapshot.forEach((document) => {
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
