interface EmailTemplate {
  subject: string
  html: string
  text: string
}

export const emailTemplates = {
  // Template para reset de contraseña
  passwordResetEmail: (resetUrl: string, userName: string): EmailTemplate => ({
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
            <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta.</p>
            
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
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Hola ${userName}, recibimos una solicitud para restablecer tu contraseña. Visita: ${resetUrl}`,
  }),

  // Template para bienvenida de SUPERADMIN
  superAdminWelcomeEmail: (userName: string, companyName: string): EmailTemplate => ({
    subject: `¡Bienvenido como SUPERADMIN! - ${process.env.COMPANY_NAME || "Lo Mejor de Mi Tierra"}`,
    html: `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bienvenido SUPERADMIN</title>
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
            <h1>🎉 ¡Bienvenido SUPERADMIN!</h1>
            <p>Sistema de Concursos Ganaderos</p>
          </div>
          <div class="content">
            <h2>¡Hola ${userName}! 👋</h2>
            <p>¡Felicidades! Has sido configurado como <strong>SUPERADMIN</strong> del sistema. Tu compañía <strong>${companyName}</strong> ha sido creada exitosamente.</p>
            
            <div class="features">
              <h3>🚀 Como SUPERADMIN puedes:</h3>
              <div class="feature">
                <strong>👥 Gestionar Usuarios</strong><br>
                Administrar todos los usuarios del sistema
              </div>
              <div class="feature">
                <strong>🏢 Gestionar Compañías</strong><br>
                Aprobar solicitudes de nuevas compañías
              </div>
              <div class="feature">
                <strong>💳 Gestionar Suscripciones</strong><br>
                Administrar planes y pagos de todas las compañías
              </div>
              <div class="feature">
                <strong>📊 Dashboard Administrativo</strong><br>
                Acceso completo a estadísticas y reportes del sistema
              </div>
            </div>
            
            <div style="text-align: center;">
              <a href="${process.env.APP_URL}/admin/dashboard" class="button">Ir al Panel de Administración</a>
            </div>
            
            <p><strong>¡El sistema está listo para funcionar!</strong></p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `¡Bienvenido ${userName}! Has sido configurado como SUPERADMIN. Accede al panel: ${process.env.APP_URL}/admin/dashboard`,
  }),

  // Template para usuarios que necesitan aprobación
  pendingApprovalEmail: (userName: string): EmailTemplate => ({
    subject: `Registro exitoso - Solicita tu compañía - ${process.env.COMPANY_NAME || "Lo Mejor de Mi Tierra"}`,
    html: `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Registro Exitoso</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #148766, #22C55E); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #148766; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .info-box { background: #e3f2fd; border: 1px solid #2196f3; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 ¡Registro Exitoso!</h1>
            <p>Plataforma de Concursos Ganaderos</p>
          </div>
          <div class="content">
            <h2>¡Hola ${userName}! 👋</h2>
            <p>Tu cuenta ha sido creada exitosamente. Para acceder a todas las funcionalidades de la plataforma, necesitas solicitar la creación de tu compañía.</p>
            
            <div class="info-box">
              <h3>📋 Próximos pasos:</h3>
              <ol>
                <li>Completa la solicitud de compañía</li>
                <li>Nuestro equipo revisará tu solicitud</li>
                <li>Recibirás una notificación con la respuesta</li>
                <li>Una vez aprobada, tendrás acceso completo</li>
              </ol>
            </div>
            
            <div style="text-align: center;">
              <a href="${process.env.APP_URL}/solicitar-compania" class="button">Solicitar Compañía</a>
            </div>
            
            <p>Si tienes preguntas, no dudes en contactarnos.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `¡Hola ${userName}! Tu cuenta fue creada. Solicita tu compañía en: ${process.env.APP_URL}/solicitar-compania`,
  }),

  // Template para compañía aprobada
  companyApprovedEmail: (userName: string, companyName: string): EmailTemplate => ({
    subject: `¡Compañía aprobada! - ${process.env.COMPANY_NAME || "Lo Mejor de Mi Tierra"}`,
    html: `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Compañía Aprobada</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #148766, #22C55E); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #148766; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .success-box { background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 ¡Compañía Aprobada!</h1>
            <p>Plataforma de Concursos Ganaderos</p>
          </div>
          <div class="content">
            <h2>¡Felicidades ${userName}! 🎊</h2>
            
            <div class="success-box">
              <h3>✅ Tu solicitud fue aprobada</h3>
              <p>La compañía <strong>${companyName}</strong> ha sido creada exitosamente y ya tienes acceso completo a la plataforma.</p>
            </div>
            
            <h3>🚀 ¿Qué puedes hacer ahora?</h3>
            <ul>
              <li>🏆 Crear y gestionar concursos</li>
              <li>👥 Invitar registradores a tu equipo</li>
              <li>📊 Ver reportes y estadísticas</li>
              <li>📅 Organizar eventos</li>
            </ul>
            
            <div style="text-align: center;">
              <a href="${process.env.APP_URL}/dashboard" class="button">Ir al Dashboard</a>
            </div>
            
            <p>¡Bienvenido a la plataforma! Estamos emocionados de verte crear concursos increíbles.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `¡Felicidades ${userName}! Tu compañía ${companyName} fue aprobada. Accede: ${process.env.APP_URL}/dashboard`,
  }),

  // Template para compañía rechazada
  companyRejectedEmail: (userName: string, companyName: string, reason: string): EmailTemplate => ({
    subject: `Solicitud de compañía - Requiere revisión - ${process.env.COMPANY_NAME || "Lo Mejor de Mi Tierra"}`,
    html: `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Solicitud Requiere Revisión</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #148766, #22C55E); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #148766; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .warning-box { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📋 Solicitud Requiere Revisión</h1>
            <p>Plataforma de Concursos Ganaderos</p>
          </div>
          <div class="content">
            <h2>Hola ${userName},</h2>
            
            <p>Hemos revisado tu solicitud para crear la compañía <strong>${companyName}</strong>.</p>
            
            <div class="warning-box">
              <h3>⚠️ Solicitud no aprobada</h3>
              <p>Tu solicitud requiere algunas correcciones antes de poder ser aprobada.</p>
              
              <h4>Comentarios del revisor:</h4>
              <p><em>${reason}</em></p>
            </div>
            
            <h3>📝 ¿Qué puedes hacer?</h3>
            <ul>
              <li>Revisa los comentarios del revisor</li>
              <li>Realiza las correcciones sugeridas</li>
              <li>Envía una nueva solicitud</li>
            </ul>
            
            <div style="text-align: center;">
              <a href="${process.env.APP_URL}/solicitar-compania" class="button">Enviar Nueva Solicitud</a>
            </div>
            
            <p>Si tienes preguntas sobre los comentarios, no dudes en contactarnos.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Hola ${userName}, tu solicitud para ${companyName} requiere revisión. Motivo: ${reason}. Envía una nueva solicitud: ${process.env.APP_URL}/solicitar-compania`,
  }),
}
