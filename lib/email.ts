import nodemailer from "nodemailer"

interface EmailOptions {
  subject: string
  html: string
  text: string
}

// Crear transporter con OAuth2
const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: process.env.MAIL_USERNAME,
      clientId: process.env.OAUTH_CLIENTID,
      clientSecret: process.env.OAUTH_CLIENT_SECRET,
      refreshToken: process.env.OAUTH_REFRESH_TOKEN,
    },
  })
}

export async function sendEmail(to: string, emailOptions: EmailOptions) {
  try {
    const transporter = createTransporter()

    const mailOptions = {
      from: `"${process.env.COMPANY_NAME || "Lo Mejor de Mi Tierra"}" <${process.env.MAIL_USERNAME}>`,
      to,
      subject: emailOptions.subject,
      html: emailOptions.html,
      text: emailOptions.text,
    }

    const result = await transporter.sendMail(mailOptions)
    console.log("Email enviado exitosamente:", result.messageId)
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error("Error enviando email:", error)
    throw new Error("Error al enviar email")
  }
}

export async function verifyTransporter() {
  try {
    const transporter = createTransporter()
    await transporter.verify()
    return true
  } catch (error) {
    console.error("Error verificando transporter:", error)
    return false
  }
}
