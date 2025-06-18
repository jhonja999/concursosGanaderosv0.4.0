import { verifyTransporter } from "@/lib/email"

function validateEnvironment() {
  const required = ["MAIL_USERNAME", "OAUTH_CLIENTID", "OAUTH_CLIENT_SECRET", "OAUTH_REFRESH_TOKEN", "APP_URL"]

  const missing = required.filter((key) => !process.env[key])

  if (missing.length > 0) {
    throw new Error(`Variables de entorno faltantes: ${missing.join(", ")}`)
  }
}

async function initializeNodemailer() {
  console.log("🔧 Inicializando sistema de emails...")

  try {
    // Validar variables de entorno
    console.log("1️⃣ Validando variables de entorno...")
    validateEnvironment()

    // Verificar configuración de Nodemailer
    console.log("2️⃣ Verificando configuración de Nodemailer...")
    const isConfigured = await verifyTransporter()

    if (isConfigured) {
      console.log("✅ Sistema de emails configurado correctamente")
      console.log("📧 Listo para enviar emails de recuperación de contraseña")
      console.log(`🏢 Empresa: ${process.env.COMPANY_NAME || "Lo Mejor de Mi Tierra"}`)
      console.log(`🌐 URL base: ${process.env.APP_URL}`)
      console.log(`📮 Email desde: ${process.env.MAIL_USERNAME}`)
      if (process.env.SUPPORT_EMAIL) {
        console.log(`🆘 Email de soporte: ${process.env.SUPPORT_EMAIL}`)
      }
    } else {
      console.log("❌ Error en la configuración de Nodemailer")
      console.log("🔍 Verifica las siguientes variables de entorno:")
      console.log("   - MAIL_USERNAME")
      console.log("   - OAUTH_CLIENTID")
      console.log("   - OAUTH_CLIENT_SECRET")
      console.log("   - OAUTH_REFRESH_TOKEN")
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Error desconocido"
    console.error("❌ Error durante la inicialización:", errorMessage)
    process.exit(1)
  }
}

initializeNodemailer()
