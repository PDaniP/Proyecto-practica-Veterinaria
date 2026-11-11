import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import api from '../../config/api.js';

export default function WhatsApp() {
    const [datos, setDatos] = useState({
        estado: 'iniciando',
        qr: null
    });

    useEffect(() => {
        let activo = true;

        const actualizar = async () => {
            try {
                const respuesta = await api.get('/whatsapp/estado');

                if (activo) {
                    setDatos(respuesta.data);
                }
            } catch (error) {
                console.error('Error consultando WhatsApp:', error);
            }
        };

        actualizar();

        const intervalo = setInterval(actualizar, 3000);

        return () => {
            activo = false;
            clearInterval(intervalo);
        };
    }, []);

    return (
        <section>
            <h2>Configuración de WhatsApp</h2>

            <p>Estado: {datos.estado}</p>

            {datos.estado === 'esperando_qr' && datos.qr && (
                <div>
                    <p>Escaneá este código desde WhatsApp</p>
                    <QRCodeSVG value={datos.qr} size={256} />
                </div>
            )}

            {datos.estado === 'conectado' && (
                <p>WhatsApp conectado correctamente.</p>
            )}
        </section>
    );
}