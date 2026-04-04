import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcryptjs from 'bcryptjs'
import { signToken } from '@/lib/session'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ detail: 'Email and password are required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !user.is_active) {
      return NextResponse.json({ detail: 'Incorrect email or password' }, { status: 401 })
    }

    const isValid = await bcryptjs.compare(password, user.hashed_password)
    if (!isValid) {
      return NextResponse.json({ detail: 'Incorrect email or password' }, { status: 401 })
    }

    const access_token = await signToken({ sub: user.id })

    return NextResponse.json({
      access_token,
      token_type: 'bearer',
    })
  } catch (error: any) {
    console.error('Login error:', error)
    return NextResponse.json({ detail: 'Internal Server Error' }, { status: 500 })
  }
}
