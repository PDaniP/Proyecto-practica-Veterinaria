import multer from 'multer'
import fs from 'node:fs'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import { fileURLToPath } from 'node:url'

const directorioEstudios = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '../../estudios'
);

fs.mkdirSync(directorioEstudios, { recursive: true });

const extensionesPermitidas = new Set(['.pdf', '.jpg', '.jpeg', '.png', '.webp']);
const tiposPermitidos = new Set([
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp'
]);

const almacenamiento = multer.diskStorage({
    destination: (_req, _archivo, callback) => callback(null, directorioEstudios),
    filename: (_req, archivo, callback) => {
        callback(null, `${randomUUID()}${path.extname(archivo.originalname).toLowerCase()}`);
    }
});

const upload = multer({
    storage: almacenamiento,
    fileFilter: (_req, archivo, callback) => {
        const extension = path.extname(archivo.originalname).toLowerCase();
        if (!extensionesPermitidas.has(extension) || !tiposPermitidos.has(archivo.mimetype)) {
            const error = new Error('Formato no admitido. Adjunte un PDF, JPG, PNG o WEBP.');
            error.statusCode = 415;
            return callback(error);
        }
        callback(null, true);
    },
    limits: {
        fileSize: 50 * 1024 * 1024
    }
});

export { directorioEstudios };
export default upload;