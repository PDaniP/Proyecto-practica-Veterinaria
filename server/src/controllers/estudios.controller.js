import fs from 'node:fs/promises';
import path from 'node:path';
import { createReadStream } from 'node:fs';
import { directorioEstudios } from '../middlewares/uploadFile.js';
import estudiosModel from '../models/estudios.model.js';

const tipoPorFirma = async (ruta) => {
    const archivo = await fs.open(ruta, 'r');
    try {
        const firma = Buffer.alloc(12);
        const { bytesRead } = await archivo.read(firma, 0, firma.length, 0);
        const bytes = firma.subarray(0, bytesRead);

        if (bytes.subarray(0, 5).toString() === '%PDF-') return 'application/pdf';
        if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
            return 'image/jpeg';
        }
        if (
            bytes.length >= 8 &&
            bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
        ) {
            return 'image/png';
        }
        if (
            bytes.length >= 12 &&
            bytes.subarray(0, 4).toString() === 'RIFF' &&
            bytes.subarray(8, 12).toString() === 'WEBP'
        ) {
            return 'image/webp';
        }
        return null;
    } finally {
        await archivo.close();
    }
};

const cargarEstudio = async (req, res) => {
    const archivo = req.file;
    const idConsulta = Number(req.params.id_consulta || req.body.id_consulta);
    const rutaLegada = req.path.endsWith('/cargar');

    if (!archivo) {
        return res.status(400).json({ message: 'Seleccione un archivo de estudio.' });
    }

    try {
        const tipoArchivo = await tipoPorFirma(archivo.path);
        if (!tipoArchivo || tipoArchivo !== archivo.mimetype) {
            await fs.unlink(archivo.path);
            return res.status(415).json({ message: 'El contenido del archivo no coincide con un PDF, JPG, PNG o WEBP válido.' });
        }
        if (!Number.isInteger(idConsulta) || idConsulta <= 0) {
            if (rutaLegada) {
                return res.status(200).json({
                    message: 'Archivo subido correctamente.',
                    nombreArchivo: archivo.filename
                });
            }
            await fs.unlink(archivo.path);
            return res.status(400).json({ message: 'El ID de consulta no es válido.' });
        }
        if (!await estudiosModel.existeConsulta(idConsulta)) {
            await fs.unlink(archivo.path);
            return res.status(404).json({ message: 'No se encontró la consulta indicada.' });
        }

        const estudio = await estudiosModel.añadirEstudio({
            id_consulta: idConsulta,
            nombre_archivo: path.basename(archivo.originalname).slice(0, 255),
            url_archivo: archivo.filename,
            tipo_archivo: tipoArchivo
        });
        if (rutaLegada) {
            return res.status(200).json({
                message: 'Archivo subido correctamente.',
                nombreArchivo: archivo.filename,
                estudio
            });
        }
        return res.status(201).json({
            message: 'Estudio asociado correctamente.',
            estudio
        });
    } catch (error) {
        await fs.unlink(archivo.path).catch((errorLimpieza) => {
            if (errorLimpieza.code !== 'ENOENT') {
                console.error('Error al limpiar el archivo de estudio:', errorLimpieza);
            }
        });
        console.error('Error al asociar estudio:', error);
        return res.status(500).json({ message: 'No se pudo asociar el estudio a la consulta.' });
    }
};

const listarEstudios = async (req, res) => {
    const idConsulta = Number(req.params.id_consulta);
    if (!Number.isInteger(idConsulta) || idConsulta <= 0) {
        return res.status(400).json({ message: 'El ID de consulta no es válido.' });
    }

    try {
        if (!await estudiosModel.existeConsulta(idConsulta)) {
            return res.status(404).json({ message: 'No se encontró la consulta indicada.' });
        }
        const estudios = await estudiosModel.obtenerEstudiosPorConsulta(idConsulta);
        return res.status(200).json({ estudios });
    } catch (error) {
        console.error('Error al obtener estudios de consulta:', error);
        return res.status(500).json({ message: 'No se pudieron obtener los estudios.' });
    }
};

const visualizarEstudio = async (req, res) => {
    const idEstudio = Number(req.params.id_estudio);
    if (!Number.isInteger(idEstudio) || idEstudio <= 0) {
        return res.status(400).json({ message: 'El ID de estudio no es válido.' });
    }

    try {
        const estudio = await estudiosModel.obtenerEstudioPorId(idEstudio);
        if (!estudio) {
            return res.status(404).json({ message: 'No se encontró el estudio.' });
        }

        const nombreGuardado = path.basename(estudio.url_archivo || '');
        if (!nombreGuardado || nombreGuardado !== estudio.url_archivo) {
            return res.status(404).json({ message: 'La ruta del estudio no es válida.' });
        }
        const ruta = path.resolve(directorioEstudios, nombreGuardado);
        if (path.dirname(ruta) !== directorioEstudios) {
            return res.status(404).json({ message: 'La ruta del estudio no es válida.' });
        }
        try {
            await fs.access(ruta);
        } catch (error) {
            if (error.code === 'ENOENT') {
                return res.status(404).json({ message: 'El archivo del estudio ya no está disponible.' });
            }
            throw error;
        }

        const nombreDescarga = path.basename(estudio.nombre_archivo || 'estudio');
        const nombreAscii = nombreDescarga.replace(/[^\x20-\x7e]|["\\\r\n]/g, '_');
        const nombreUtf8 = encodeURIComponent(nombreDescarga).replace(/['()*]/g, (caracter) =>
            `%${caracter.charCodeAt(0).toString(16).toUpperCase()}`
        );
        const modo = req.query.descargar === '1' ? 'attachment' : 'inline';
        res.set({
            'Content-Type': estudio.tipo_archivo,
            'Content-Disposition': `${modo}; filename="${nombreAscii}"; filename*=UTF-8''${nombreUtf8}`,
            'X-Content-Type-Options': 'nosniff',
            'Cache-Control': 'private, no-store'
        });
        const flujo = createReadStream(ruta);
        flujo.on('error', (error) => {
            console.error('Error al leer el archivo de estudio:', error);
            if (!res.headersSent) res.status(500).json({ message: 'No se pudo leer el archivo de estudio.' });
            else res.destroy(error);
        });
        return flujo.pipe(res);
    } catch (error) {
        console.error('Error al visualizar estudio:', error);
        return res.status(500).json({ message: 'No se pudo obtener el archivo de estudio.' });
    }
};

export { cargarEstudio, listarEstudios, visualizarEstudio };
