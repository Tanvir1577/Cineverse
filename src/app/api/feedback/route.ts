import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

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

    // Set expiration to 24 hours from now
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

    const feedback = await db.feedback.create({
      data: {
        type,
        title,
        contentType: type === 'REQUEST' ? contentType : null,
        message,
        link: type === 'REPORT' ? link : null,
        expiresAt,
      },
    })

    return NextResponse.json(feedback, { status: 201 })
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
    // Basic cleanup: delete expired feedback when admin fetches
    await db.feedback.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    })

    const feedback = await db.feedback.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(feedback)
  } catch (error) {
    console.error('Failed to fetch feedback:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
