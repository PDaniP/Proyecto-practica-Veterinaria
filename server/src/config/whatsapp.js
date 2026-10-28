import whatsapp from 'whatsapp-web.js';
const { Client, LocalAuth } = whatsapp;
import qrcode from 'qrcode-terminal';
import path from 'path';
import os from 'os';

let whatsappListo = false;
// Creamos el cliente de WhatsApp
const client = new Client({
    authStrategy: new LocalAuth({
        dataPath: process.env.WWEBJS_AUTH_PATH || path.join(os.homedir(), '.veterinaria-whatsapp-auth')
    })
});

client.on('qr', (qr) => {
    whatsappListo = false;
    console.log('📱 Escaneá este código QR con el WhatsApp de la veterinaria:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    whatsappListo = true;
    console.log('✅ Cliente de WhatsApp conectado y listo para enviar mensajes.');
});
client.on('auth_failure', (error) => {
    whatsappListo = false;
    console.error('Error de autenticación en WhatsApp:', error);
});
client.on('disconnected', (reason) => {
    whatsappListo = false;
    console.log('Cliente de WhatsApp desconectado:', reason);
});

// Función para enviar notificaciones
const enviarNotificacion = async (telefono, mensaje) => {
    try {
        if (!whatsappListo) {
            throw new Error('El cliente de WhatsApp no está listo.');
        }

        const numeroLimpio = telefono.replace(/[^0-9]/g, '');
        const numero = numeroLimpio.startsWith('549') ? numeroLimpio : `549${numeroLimpio}`; 
        const chatId = `${numero}@c.us`;
        
        await client.sendMessage(chatId, mensaje);
        console.log(`Mensaje enviado por WhatsApp a ${telefono}`);
    } catch (error) {
        console.error(`Error al enviar WhatsApp a ${telefono}:`, error);
    }
};

export { client, enviarNotificacion };