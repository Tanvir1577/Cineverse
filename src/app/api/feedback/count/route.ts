import { NextResponse } from 'next/server'
import { firestore } from '@/lib/firebase'
import { collection, getDocs, query, where } from 'firebase/firestore'

export async function GET() {
  try {
    const feedbackCollection = collection(firestore, 'feedback')
    // We filter for isRead: false. Expiration is checked manually to avoid complex queries without composite indexes.
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
