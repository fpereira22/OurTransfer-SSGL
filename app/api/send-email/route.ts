import { EmailClient } from "@azure/communication-email";
import { NextResponse } from "next/server";

const connectionString = process.env.AZURE_COMMUNICATION_CONNECTION_STRING;
const senderAddress = process.env.AZURE_EMAIL_SENDER_ADDRESS;

interface EmailRequestBody {
    senderEmail: string;
    senderName: string;
    recipientEmail: string;
    recipientName?: string;
    fileName: string;
    downloadLink: string;
    message?: string;
}

export async function POST(request: Request) {
    try {
        // 1. Validar configuración del servidor
        if (!connectionString || !senderAddress) {
            return NextResponse.json(
                { error: "Error de configuración en el servidor (faltan variables de Azure Communication Services)." },
                { status: 500 }
            );
        }

        // 2. Obtener datos del formulario
        const body: EmailRequestBody = await request.json();
        const { senderEmail, senderName, recipientEmail, recipientName, fileName, downloadLink, message } = body;

        // Validación simple
        if (!senderEmail || !recipientEmail || !downloadLink || !fileName) {
            return NextResponse.json(
                { error: "Faltan campos obligatorios (senderEmail, recipientEmail, downloadLink, fileName)." },
                { status: 400 }
            );
        }

        // 3. Preparar el cliente de Email
        const client = new EmailClient(connectionString);

        // 4. Construir el correo para el destinatario
        const emailMessage = {
            senderAddress: senderAddress,
            content: {
                subject: `${senderName || senderEmail} te ha enviado un archivo`,
                plainText: `
${senderName || senderEmail} te ha enviado un archivo a través de SSGL OurTransfer.

Archivo: ${fileName}
${message ? `Mensaje: ${message}` : ''}

Haz clic en este enlace para descargarlo:
${downloadLink}

Este enlace expira en 24 horas.

---
SSGL OurTransfer - Transferencia segura de archivos
                `.trim(),
                html: `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Te han enviado un archivo</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0d1117;">
    
    <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        
        <!-- Header con Logo -->
        <div style="text-align: center; padding: 30px 0;">
            <div style="display: inline-block; width: 60px; height: 60px; background: linear-gradient(135deg, #0A9345 0%, #0FBE5A 100%); border-radius: 16px; line-height: 60px; font-size: 24px; font-weight: bold; color: white;">
                S
            </div>
            <h1 style="margin: 15px 0 5px; color: #ffffff; font-size: 24px; font-weight: 700;">
                SSGL <span style="color: #0FBE5A;">OurTransfer</span>
            </h1>
            <p style="margin: 0; color: #6e7681; font-size: 14px;">
                Transferencia segura de archivos
            </p>
        </div>

        <!-- Card Principal -->
        <div style="background: linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%); border-radius: 24px; border: 1px solid rgba(255,255,255,0.1); overflow: hidden;">
            
            <!-- Header del Card -->
            <div style="padding: 30px 30px 20px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.08);">
                <div style="display: inline-block; width: 80px; height: 80px; background: linear-gradient(135deg, #0A9345 0%, #0FBE5A 100%); border-radius: 20px; line-height: 80px; margin-bottom: 20px;">
                    <span style="font-size: 36px;">📦</span>
                </div>
                <h2 style="margin: 0 0 10px; color: #ffffff; font-size: 22px; font-weight: 600;">
                    ¡Tienes un archivo!
                </h2>
                <p style="margin: 0; color: #8b949e; font-size: 15px;">
                    <strong style="color: #0FBE5A;">${escapeHtml(senderName || senderEmail)}</strong> te ha enviado un archivo
                </p>
            </div>

            <!-- Info del Archivo -->
            <div style="padding: 25px 30px; background: rgba(0,0,0,0.2);">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 12px 0; color: #6e7681; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">
                            Archivo
                        </td>
                        <td style="padding: 12px 0; color: #ffffff; font-size: 15px; text-align: right; word-break: break-all;">
                            ${escapeHtml(fileName)}
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 0; color: #6e7681; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">
                            De
                        </td>
                        <td style="padding: 12px 0; text-align: right;">
                            <a href="mailto:${escapeHtml(senderEmail)}" style="color: #0FBE5A; text-decoration: none; font-size: 15px;">
                                ${escapeHtml(senderEmail)}
                            </a>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 0; color: #6e7681; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">
                            Expira
                        </td>
                        <td style="padding: 12px 0; color: #f0883e; font-size: 15px; text-align: right;">
                            En 24 horas
                        </td>
                    </tr>
                </table>
            </div>

            ${message ? `
            <!-- Mensaje Personal -->
            <div style="padding: 20px 30px; border-top: 1px solid rgba(255,255,255,0.08);">
                <p style="margin: 0 0 10px; color: #6e7681; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">
                    Mensaje de ${escapeHtml(senderName || 'el remitente')}:
                </p>
                <div style="background: rgba(15, 190, 90, 0.1); border-left: 4px solid #0FBE5A; padding: 15px 20px; border-radius: 0 8px 8px 0;">
                    <p style="margin: 0; color: #c9d1d9; font-size: 15px; font-style: italic; line-height: 1.6; white-space: pre-wrap;">"${escapeHtml(message)}"</p>
                </div>
            </div>
            ` : ''}

            <!-- Botón de Descarga -->
            <div style="padding: 30px; text-align: center;">
                <a href="${escapeHtml(downloadLink)}" style="display: inline-block; background: linear-gradient(135deg, #0A9345 0%, #0FBE5A 100%); color: #ffffff; font-size: 16px; font-weight: 700; text-decoration: none; padding: 16px 48px; border-radius: 14px; box-shadow: 0 8px 24px rgba(10, 147, 69, 0.4);">
                    ⬇️ Descargar Archivo
                </a>
                <p style="margin: 20px 0 0; color: #6e7681; font-size: 12px;">
                    O copia este enlace: <a href="${escapeHtml(downloadLink)}" style="color: #58a6ff; text-decoration: none; word-break: break-all;">${escapeHtml(downloadLink)}</a>
                </p>
            </div>
        </div>

        <!-- Footer -->
        <div style="text-align: center; padding: 30px 0;">
            <div style="display: inline-flex; gap: 20px; margin-bottom: 15px;">
                <span style="color: #6e7681; font-size: 12px; display: flex; align-items: center; gap: 5px;">
                    🔒 Encriptado
                </span>
                <span style="color: #6e7681; font-size: 12px; display: flex; align-items: center; gap: 5px;">
                    ⏰ 24h disponible
                </span>
                <span style="color: #6e7681; font-size: 12px; display: flex; align-items: center; gap: 5px;">
                    ☁️ Almacenamiento seguro
                </span>
            </div>
            <p style="margin: 0; color: #484f58; font-size: 11px;">
                © 2026 Sociedad de Servicios Generales LTDA
            </p>
            <p style="margin: 5px 0 0; color: #484f58; font-size: 11px;">
                Este correo fue enviado automáticamente. No responder a este correo.
            </p>
        </div>
    </div>
</body>
</html>
                `,
            },
            recipients: {
                to: [
                    { address: recipientEmail, displayName: recipientName || undefined },
                ],
            },
            replyTo: [
                { address: senderEmail, displayName: senderName || undefined },
            ],
        };

        // 5. Enviar
        const poller = await client.beginSend(emailMessage);
        const result = await poller.pollUntilDone();

        if (result.status === "Succeeded") {
            return NextResponse.json({
                message: "Correo enviado con éxito",
                recipientEmail
            });
        } else {
            throw new Error(`Error en el envío: ${result.error?.message}`);
        }

    } catch (error: any) {
        console.error("Error enviando correo:", error);
        return NextResponse.json(
            { error: "Error al enviar el correo.", details: error.message },
            { status: 500 }
        );
    }
}

// Función para escapar HTML y prevenir XSS
function escapeHtml(text: string): string {
    const map: { [key: string]: string } = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
}
