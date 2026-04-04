import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcryptjs from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ detail: 'Email and password are required' }, { status: 400 })
    }

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ detail: 'Email already registered' }, { status: 400 })
    }

    const hashed_password = await bcryptjs.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        email,
        hashed_password,
        is_active: true,
      },
      select: {
        id: true,
        email: true,
        is_active: true,
        created_at: true,
      }
    })

    return NextResponse.json(user)
  } catch (error: any) {
    console.error('Registration error:', error)
    return NextResponse.json({ detail: 'Internal Server Error' }, { status: 500 })
  }
}
