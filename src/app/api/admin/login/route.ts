import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { idToken } = body

    if (!idToken) {
      return NextResponse.json({ error: 'ID token is required' }, { status: 400 })
    }

    if (typeof idToken !== 'string' || idToken.length < 10) {
      return NextResponse.json({ error: 'Invalid token format' }, { status: 401 })
    }

    return NextResponse.json({ success: true, message: 'Login successful' })
  } catch (error: any) {
    console.error('Login error:', error)
    return NextResponse.json({ error: error.message || 'Invalid request' }, { status: 400 })
  }
}
