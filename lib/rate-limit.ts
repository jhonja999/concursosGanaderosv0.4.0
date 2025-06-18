// Simple rate limiting usando Map en memoria
// En producción, usar Redis o similar
const attempts = new Map<string, { count: number; resetTime: number }>()

export function rateLimit(ip: string, maxAttempts = 5, windowMs: number = 15 * 60 * 1000) {
  const now = Date.now()
  const userAttempts = attempts.get(ip)

  if (!userAttempts || now > userAttempts.resetTime) {
    // Primera vez o ventana expirada
    attempts.set(ip, { count: 1, resetTime: now + windowMs })
    return { success: true, remaining: maxAttempts - 1 }
  }

  if (userAttempts.count >= maxAttempts) {
    // Límite excedido
    return {
      success: false,
      remaining: 0,
      resetTime: userAttempts.resetTime,
    }
  }

  // Incrementar contador
  userAttempts.count++
  attempts.set(ip, userAttempts)

  return {
    success: true,
    remaining: maxAttempts - userAttempts.count,
  }
}

export function getRemainingTime(ip: string): number {
  const userAttempts = attempts.get(ip)
  if (!userAttempts) return 0

  const now = Date.now()
  return Math.max(0, userAttempts.resetTime - now)
}
