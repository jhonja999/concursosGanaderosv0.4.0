interface EmailTemplate {
  subject: string
  html: string
  text: string
}

export const emailTemplates = {
  emailVerificationEmail: (userName: string, token: string): EmailTemplate => ({
    subject: "Verifica tu email - Concursos Ganaderos",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>¡Hola ${userName}!</h2>
        <p>Gracias por registrarte en nuestra plataforma. Para completar tu registro, por favor verifica tu email haciendo clic en el siguiente enlace:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.APP_URL}/verificar-email?token=${token}" 
             style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Verificar Email
          </a>
        </div>
        <p>Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:</p>
        <p style="word-break: break-all; color: #666;">${process.env.APP_URL}/verificar-email?token=${token}</p>
        <p><strong>Este enlace expira en 24 horas.</strong></p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 14px;">Si no creaste esta cuenta, puedes ignorar este email.</p>
      </div>
    `,
    text: `
      ¡Hola ${userName}!
      
      Gracias por registrarte en nuestra plataforma. Para completar tu registro, por favor verifica tu email visitando:
      
      ${process.env.APP_URL}/verificar-email?token=${token}
      
      Este enlace expira en 24 horas.
      
      Si no creaste esta cuenta, puedes ignorar este email.
    `,
  }),

  superAdminWelcomeEmail: (userName: string, companyName: string): EmailTemplate => ({
    subject: "Bienvenido como Superadministrador - Concursos Ganaderos",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>¡Bienvenido ${userName}!</h2>
        <p>Has sido configurado como <strong>Superadministrador</strong> de la plataforma.</p>
        <p><strong>Compañía:</strong> ${companyName}</p>
        <p>Como Superadministrador, tienes acceso completo a todas las funcionalidades del sistema, incluyendo:</p>
        <ul>
          <li>Gestión de usuarios y roles</li>
          <li>Aprobación de solicitudes de compañías</li>
          <li>Configuración del sistema</li>
          <li>Acceso a reportes y estadísticas</li>
        </ul>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.APP_URL}/dashboard" 
             style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Acceder al Dashboard
          </a>
        </div>
        <p>¡Gracias por usar nuestra plataforma!</p>
      </div>
    `,
    text: `
      ¡Bienvenido ${userName}!
      
      Has sido configurado como Superadministrador de la plataforma.
      Compañía: ${companyName}
      
      Como Superadministrador, tienes acceso completo a todas las funcionalidades del sistema.
      
      Accede al dashboard en: ${process.env.APP_URL}/dashboard
      
      ¡Gracias por usar nuestra plataforma!
    `,
  }),

  pendingApprovalEmail: (userName: string): EmailTemplate => ({
    subject: "Registro completado - Solicita aprobación para crear tu compañía",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>¡Hola ${userName}!</h2>
        <p>Tu registro ha sido completado exitosamente. Para crear tu compañía y acceder a todas las funcionalidades, necesitas solicitar aprobación.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.APP_URL}/solicitar-compania" 
             style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Solicitar Aprobación
          </a>
        </div>
        <p>Una vez que tu solicitud sea aprobada por un administrador, podrás:</p>
        <ul>
          <li>Crear y gestionar tu compañía</li>
          <li>Acceder a funcionalidades avanzadas</li>
          <li>Gestionar suscripciones</li>
        </ul>
        <p>¡Gracias por unirte a nuestra plataforma!</p>
      </div>
    `,
    text: `
      ¡Hola ${userName}!
      
      Tu registro ha sido completado exitosamente. Para crear tu compañía y acceder a todas las funcionalidades, necesitas solicitar aprobación.
      
      Solicita aprobación en: ${process.env.APP_URL}/solicitar-compania
      
      ¡Gracias por unirte a nuestra plataforma!
    `,
  }),
}
