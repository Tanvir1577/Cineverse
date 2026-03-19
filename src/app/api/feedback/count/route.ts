import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Cleanup expired feedback
    await db.feedback.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    })

    const count = await db.feedback.count({

      where: {
        isRead: false,
        expiresAt: {
          gt: new Date(),
        },
      },
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
