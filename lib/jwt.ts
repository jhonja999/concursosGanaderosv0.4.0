import { SignJWT, jwtVerify, type JWTPayload as JoseJWTPayload } from "jose"

// Extend jose's JWTPayload to include your specific fields
export interface JWTPayload extends JoseJWTPayload {
  userId: string
  companyId: string | null
  roles: string[]
  subscriptionStatus: string | null
  expiresAt: string | null
}

const getSecretKey = () => {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    console.error("JWT_SECRET environment variable is not set.")
    // In a real application, you might throw an error or use a strong default
    // For development, a fallback is provided, but it's crucial to set this in production.
    return new TextEncoder().encode("your-super-secure-default-secret-key-for-development-only")
  }
  return new TextEncoder().encode(secret)
}

export async function signToken(payload: JWTPayload): Promise<string> {
  try {
    console.log("Signing token with payload:", payload)
    const secret = getSecretKey()
    const token = await new SignJWT(payload) // Payload now conforms to JoseJWTPayload
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d") // Token expires in 7 days
      .sign(secret)

    console.log("Token signed successfully")
    return token
  } catch (error) {
    console.error("Error signing token:", error)
    throw error
  }
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    console.log("Verifying token...")
    const secret = getSecretKey()
    const { payload } = await jwtVerify(token, secret)
    console.log("Token verified successfully:", payload)
    return payload as JWTPayload // Explicitly cast to your JWTPayload
  } catch (error) {
    console.error("Error verifying token:", error)
    console.error("Token that failed:", token.substring(0, 50) + "...")
    return null
  }
}
