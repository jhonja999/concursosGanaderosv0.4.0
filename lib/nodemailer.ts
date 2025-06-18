import nodemailer from "nodemailer"

// Configuración del transporter de Nodemailer con OAuth2
export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
    clientId: process.env.OAUTH_CLIENTID,
    clientSecret: process.env.OAUTH_CLIENT_SECRET,
    refreshToken: process.env.OAUTH_REFRESH_TOKEN,
  },
})

// Verificar la configuración del transporter
export const verifyTransporter = async () => {
  try {
    await transporter.verify()
    console.log("✅ Nodemailer configurado correctamente")
    return true
  } catch (error) {
    console.error("❌ Error en configuración de Nodemailer:", error)
    return false
  }
}

// Plantillas de email
export const emailTemplates = {
  passwordReset: (resetUrl: string, userName: string) => ({
    subject: `Restablecer contraseña - ${process.env.COMPANY_NAME || "Lo Mejor de Mi Tierra"}`,
    html: `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Restablecer Contraseña</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #148766, #22C55E); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #148766; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🐄 ${process.env.COMPANY_NAME || "Lo Mejor de Mi Tierra"}</h1>
            <p>Plataforma de Concursos Ganaderos</p>
          </div>
          <div class="content">
            <h2>Hola ${userName},</h2>
            <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en <strong>${process.env.COMPANY_NAME || "Lo Mejor de Mi Tierra"}</strong>.</p>
            
            <p>Si solicitaste este cambio, haz clic en el siguiente botón para crear una nueva contraseña:</p>
            
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Restablecer Contraseña</a>
            </div>
            
            <div class="warning">
              <strong>⚠️ Importante:</strong>
              <ul>
                <li>Este enlace expirará en <strong>1 hora</strong></li>
                <li>Solo puedes usar este enlace una vez</li>
                <li>Si no solicitaste este cambio, ignora este email</li>
              </ul>
            </div>
            
            <p>Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
            <p style="word-break: break-all; background: #f0f0f0; padding: 10px; border-radius: 5px;">
              ${resetUrl}
            </p>
            
            <p>Si tienes problemas o no solicitaste este cambio, contacta nuestro soporte${process.env.SUPPORT_EMAIL ? ` en ${process.env.SUPPORT_EMAIL}` : ""}.</p>
            
            <p>Saludos,<br>
            <strong>Equipo de ${process.env.COMPANY_NAME || "Lo Mejor de Mi Tierra"}</strong></p>
          </div>
          <div class="footer">
            <p>© 2024 ${process.env.COMPANY_NAME || "Lo Mejor de Mi Tierra"}. Todos los derechos reservados.</p>
            <p>Este es un email automático, por favor no respondas a este mensaje.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Hola ${userName},
      
      Recibimos una solicitud para restablecer la contraseña de tu cuenta en ${process.env.COMPANY_NAME || "Lo Mejor de Mi Tierra"}.
      
      Si solicitaste este cambio, visita el siguiente enlace para crear una nueva contraseña:
      ${resetUrl}
      
      IMPORTANTE:
      - Este enlace expirará en 1 hora
      - Solo puedes usar este enlace una vez
      - Si no solicitaste este cambio, ignora este email
      
      Si tienes problemas, contacta nuestro soporte${process.env.SUPPORT_EMAIL ? ` en ${process.env.SUPPORT_EMAIL}` : ""}.
      
      Saludos,
      Equipo de ${process.env.COMPANY_NAME || "Lo Mejor de Mi Tierra"}
    `,
  }),

  welcomeEmail: (userName: string, companyName: string) => ({
    subject: `¡Bienvenido a ${process.env.COMPANY_NAME || "Lo Mejor de Mi Tierra"}! 🎉`,
    html: `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bienvenido</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #148766, #22C55E); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #148766; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .features { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
          .feature { margin: 15px 0; padding: 10px; border-left: 4px solid #148766; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🐄 ¡Bienvenido a ${process.env.COMPANY_NAME || "Lo Mejor de Mi Tierra"}!</h1>
            <p>La plataforma líder para concursos ganaderos</p>
          </div>
          <div class="content">
            <h2>¡Hola ${userName}! 👋</h2>
            <p>¡Nos emociona tenerte en nuestra plataforma! Tu empresa <strong>${companyName}</strong> ya está registrada y lista para comenzar.</p>
            
            <div class="features">
              <h3>🚀 ¿Qué puedes hacer ahora?</h3>
              <div class="feature">
                <strong>🏆 Crear Concursos</strong><br>
                Organiza concursos profesionales con categorías personalizadas
              </div>
              <div class="feature">
                <strong>👥 Gestionar Equipos</strong><br>
                Invita registradores para que te ayuden con las inscripciones
              </div>
              <div class="feature">
                <strong>📊 Ver Reportes</strong><br>
                Obtén insights detallados sobre tus concursos y participantes
              </div>
              <div class="feature">
                <strong>📅 Crear Eventos</strong><br>
                Promociona eventos relacionados con tus concursos
              </div>
            </div>
            
            <div style="text-align: center;">
              <a href="${process.env.APP_URL}/dashboard" class="button">Ir al Dashboard</a>
            </div>
            
            <p>Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos${process.env.SUPPORT_EMAIL ? ` en ${process.env.SUPPORT_EMAIL}` : ""}. ¡Estamos aquí para ayudarte a tener éxito!</p>
            
            <p>¡Que tengas mucho éxito con tus concursos!</p>
            
            <p>Saludos,<br>
            <strong>Equipo de ${process.env.COMPANY_NAME || "Lo Mejor de Mi Tierra"}</strong></p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),
}

// Función para enviar emails
export const sendEmail = async (to: string, template: { subject: string; html: string; text?: string }) => {
  try {
    const mailOptions = {
      from: `"${process.env.COMPANY_NAME || "Lo Mejor de Mi Tierra"}" <${process.env.MAIL_USERNAME}>`,
      to,
      subject: template.subject,
      html: template.html,
      text: template.text,
    }

    const result = await transporter.sendMail(mailOptions)
    console.log("✅ Email enviado:", result.messageId)
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error("❌ Error enviando email:", error)
    return { success: false, error: error.message }
  }
}
