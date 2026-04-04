import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    // Stub: in production, send reset email
    return NextResponse.json({ message: 'If the email is registered, a reset link has been sent.' })
  } catch (error: any) {
    return NextResponse.json({ detail: 'Internal Server Error' }, { status: 500 })
  }
}
