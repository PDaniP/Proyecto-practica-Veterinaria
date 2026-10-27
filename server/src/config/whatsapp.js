import whatsapp from 'whatsapp-web.js';
const { Client, LocalAuth } = whatsapp;
import qrcode from 'qrcode-terminal';

// Creamos el cliente de WhatsApp
const client = new Client({
    authStrategy: new LocalAuth()
});

client.on('qr', (qr) => {
    console.log('📱 Escaneá este código QR con el WhatsApp de la veterinaria:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('✅ Cliente de WhatsApp conectado y listo para enviar mensajes.');
});

// Función para enviar notificaciones
const enviarNotificacion = async (telefono, mensaje) => {
    try {
        const numeroLimpio = telefono.replace(/[^0-9]/g, '');
        const chatId = `549${numeroLimpio}@c.us`;
        
        await client.sendMessage(chatId, mensaje);
        console.log(`Mensaje enviado por WhatsApp a ${telefono}`);
    } catch (error) {
        console.error(`Error al enviar WhatsApp a ${telefono}:`, error);
    }
};

export { client, enviarNotificacion };