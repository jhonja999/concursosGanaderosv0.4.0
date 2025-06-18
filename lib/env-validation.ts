// Validación de variables de entorno requeridas
const requiredEnvVars = {
  // Base de datos
  DATABASE_URL: process.env.DATABASE_URL,

  // JWT
  JWT_SECRET: process.env.JWT_SECRET,

  // Email OAuth2
  MAIL_USERNAME: process.env.MAIL_USERNAME,
  OAUTH_CLIENTID: process.env.OAUTH_CLIENTID,
  OAUTH_CLIENT_SECRET: process.env.OAUTH_CLIENT_SECRET,
  OAUTH_REFRESH_TOKEN: process.env.OAUTH_REFRESH_TOKEN,

  // App configuration
  APP_URL: process.env.APP_URL,
}

const optionalEnvVars = {
  COMPANY_NAME: process.env.COMPANY_NAME || "Lo Mejor de Mi Tierra",
  SUPPORT_EMAIL: process.env.SUPPORT_EMAIL,
}

export function validateEnvironment() {
  const missing: string[] = []

  Object.entries(requiredEnvVars).forEach(([key, value]) => {
    if (!value) {
      missing.push(key)
    }
  })

  if (missing.length > 0) {
    console.error("❌ Variables de entorno faltantes:")
    missing.forEach((key) => console.error(`   - ${key}`))
    throw new Error(`Variables de entorno requeridas faltantes: ${missing.join(", ")}`)
  }

  // Validaciones adicionales
  if (requiredEnvVars.JWT_SECRET && requiredEnvVars.JWT_SECRET.length < 32) {
    throw new Error("JWT_SECRET debe tener al menos 32 caracteres")
  }

  if (requiredEnvVars.APP_URL && !requiredEnvVars.APP_URL.startsWith("http")) {
    throw new Error("APP_URL debe comenzar con http:// o https://")
  }

  console.log("✅ Variables de entorno validadas correctamente")
  return {
    required: requiredEnvVars,
    optional: optionalEnvVars,
  }
}

// Exportar configuración validada
export const env = validateEnvironment()
