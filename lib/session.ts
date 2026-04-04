import { SignJWT, jwtVerify } from 'jose'

const secretKey = process.env.JWT_SECRET_KEY || 'default_secret_key_for_development'
const key = new TextEncoder().encode(secretKey)

export async function signToken(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d') // 1 week
    .sign(key)
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ['HS256'],
    })
    return payload
  } catch (err) {
    return null
  }
}

export async function extractBearerToken(authHeader: string | null): Promise<string | null> {
  if (!authHeader) return null
  const match = authHeader.match(/^Bearer (.*)$/)
  return match ? match[1] : null
}
