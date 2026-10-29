import mascotasModel from '../models/mascotas.model.js';
import { actualizarStockLote } from '../models/ventas.model.js';

const { añadirMascotaADB, obtenerListaMascotas, editarMascotaADB, eliminarMascotaADB, obtenerDetalleConsulta, datosMascota, añadirConsulta, obtenerConsultaPorID, obtenerMotivos, editarConsulta, obtenerAntecedentes, obtenerVacunasAplicadas, obtenerDiagnosticosPorMotivo } = mascotasModel;

const listaMascotas = async (req, res) => {
    try {
        const mascotas = await obtenerListaMascotas();
        if(!mascotas || mascotas.length === 0) {
            return res.status(404).json({ message: 'No se encontraron mascotas' });
        }
        res.status(200).json({ message: 'Lista de mascotas obtenida correctamente', mascotas });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener la lista de mascotas', error });
    }
}

const añadirMascota = async (req, res) => {
    try {
        const mascota = req.body;
        if(!mascota.id_cliente || !mascota.nombre || !mascota.id_especie || !mascota.id_raza || !mascota.fecha_nacimiento || !mascota.genero) {
            return res.status(400).json({ message: 'Faltan datos obligatorios de la mascota' });
        }
        const nuevaMascota = await añadirMascotaADB(mascota);
        res.status(201).json({ message: 'Mascota añadida correctamente', mascota: nuevaMascota });
    } catch (error) {
        res.status(500).json({ message: 'Error al añadir la mascota', error });
    }
}

const editarMascota = async (req, res) => {
    try {
        const { id } = req.params;
        if(!id) {
            return res.status(400).json({ message: 'Falta el ID de la mascota' });
        }
        const mascota = req.body;
        if(!mascota.id_cliente || !mascota.nombre || !mascota.id_especie || !mascota.id_raza || !mascota.fecha_nacimiento || !mascota.genero) {
            return res.status(400).json({ message: 'Faltan datos obligatorios de la mascota' });
        }
        const mascotaEditada = await editarMascotaADB(id, mascota);
        if(!mascotaEditada) {
            return res.status(404).json({ message: 'Mascota no encontrada' });
        }
        res.status(200).json({ message: 'Mascota editada correctamente', mascota: mascotaEditada });
    } catch (error) {
        res.status(500).json({ message: 'Error al editar la mascota', error });
    }
}

const eliminarMascota = async (req, res) => {
    try {
        const { id } = req.params;
        if(!id) {
            return res.status(400).json({ message: 'Falta el ID de la mascota' });
        }
        const mascotaEliminada = await eliminarMascotaADB(id);
        if(!mascotaEliminada) {
            return res.status(404).json({ message: 'Mascota no encontrada' });
        }
        res.status(200).json({ message: 'Mascota eliminada correctamente', mascota: mascotaEliminada });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar la mascota', error });
    }
}

const historiaClinica = async (req, res) => {
    try {
        const { id } = req.params;
        if(!id) {
            return res.status(400).json({ message: 'Falta el ID de la mascota' });
        }
        const datos = await datosMascota(id);
        const consultas = await obtenerDetalleConsulta(id);
        const antecedentes = await obtenerAntecedentes(id);
        const vacunas = await obtenerVacunasAplicadas(id);

        if (!datos) {
            return res.status(404).json({
            message: 'Mascota no encontrada'
        });
    
    }

    res.status(200).json({
        message: 'Historia clínica obtenida correctamente',
        historiaClinica: {
            id: datos.id,
            nombre: datos.nombre,
            especie: datos.id_especie,
            raza: datos.id_raza,
            fecha_nacimiento: datos.fecha_nacimiento,
            sexo: datos.genero,
            alergias: datos.alergias,
            observaciones: datos.observaciones,
            activo: datos.activo,
            numero_chip: datos.numero_chip,
            dueño: datos.id_cliente,
            consultas: consultas,
            antecedentes: antecedentes,
            vacunas: vacunas,
        }
    });
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener la historia clínica', error });
            console.error(error);
        }
    }

const registrarConsulta = async (req, res) => {
    try {
        const {id_mascota, fecha_consulta,peso_actual,temperatura, motivo_id, tratamiento, observaciones, insumos = []} = req.body;
        const motivoId = Number(motivo_id);
        //Voy a quitar !temperatura y !observaciones porque no son "obligatorios" en el formulario y bloquean la creacion- Pablo
        if(!id_mascota || !fecha_consulta /*|| !peso_actual*/ || !Number.isInteger(motivoId) || motivoId <= 0 /*||  !tratamiento*/) {
            return res.status(400).json({ message: 'Faltan datos obligatorios de la consulta' });
        }
        if (!Array.isArray(insumos)) {
            return res.status(400).json({ message: 'La lista de insumos no es válida' });
        }
        if(id_mascota){
            const consulta = {
                id_mascota,
                id_veterinario: req.user.id,
                fecha_consulta,
                peso_actual,
                temperatura,
                motivo_id: motivoId,
                tratamiento,
                observaciones
            };
            const consultaRegistrada = await añadirConsulta(consulta, insumos);
            console.log('Consulta registrada:', consultaRegistrada);
            if(!consultaRegistrada) {
            return res.status(500).json({ message: 'Error al registrar la consulta' });
            }
        }
        
        
        
        res.status(200).json({ message: 'Operacion registrada correctamente'});
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        res.status(500).json({ message: 'Error al registrar la consulta', error: error.message });
        console.error(error);
    }
}


const consultaPorId = async (req, res) => {
    try {
        const { id_consulta } = req.params;
        if(!id_consulta) {
            return res.status(400).json({ message: 'Falta el ID de la consulta' });
        }
        const consulta = await obtenerConsultaPorID(id_consulta);
        if(!consulta) {
            return res.status(404).json({ message: 'Consulta no encontrada' });
        }
        res.status(200).json(consulta);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener la consulta', error });
        console.error(error);
    }
};
const motivosConsultas = async (req, res) => {
    try {
        const motivos = await obtenerMotivos();
        res.status(200).json(motivos);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los motivos de consulta', error });
    }
};


//agregue esto
const diagnosticosPorMotivo = async (req, res) => {
    const motivoId = Number(req.params.motivoId);

    if (!Number.isInteger(motivoId) || motivoId <= 0) {
        return res.status(400).json({
            message: "El ID del motivo no es válido"
        });
    }

    try {
        const diagnosticos = await obtenerDiagnosticosPorMotivo(motivoId);
        res.status(200).json(diagnosticos);
    } catch (error) {
        console.error("Error al obtener los diagnósticos del motivo:", error);
        res.status(500).json({
            message: "Error al obtener los diagnósticos del motivo"
        });
    }
};

const editarConsultaPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const consulta = req.body;
        const motivoId = Number(consulta.motivo_id);
        const incluyePeso = Object.prototype.hasOwnProperty.call(consulta, 'peso_actual');
        const incluyeTemperatura = Object.prototype.hasOwnProperty.call(consulta, 'temperatura');
        const peso = !incluyePeso
            ? undefined
            : consulta.peso_actual == null || consulta.peso_actual === ''
                ? null
                : Number(consulta.peso_actual);
        const temperatura = !incluyeTemperatura
            ? undefined
            : consulta.temperatura == null || consulta.temperatura === ''
                ? null
                : Number(consulta.temperatura);

        if (!Number.isInteger(motivoId) || motivoId <= 0) {
            return res.status(400).json({ message: 'Seleccione un motivo válido' });
        }
        if (peso !== undefined && peso !== null &&
            (!Number.isFinite(peso) || peso <= 0)) {
            return res.status(400).json({ message: 'El peso debe ser mayor a 0' });
        }
        if (temperatura !== undefined && temperatura !== null &&
            (!Number.isFinite(temperatura) || temperatura < 30 || temperatura > 45)) {
            return res.status(400).json({
                message: 'La temperatura debe estar entre 30 y 45 °C'
            });
        }
        if (consulta.insumos !== undefined && !Array.isArray(consulta.insumos)) {
            return res.status(400).json({ message: 'La lista de insumos no es válida' });
        }
        const consultaEditada = await editarConsulta(id, {
            ...consulta,
            motivo_id: motivoId,
            peso_actual: peso,
            temperatura
        });
        if(!consultaEditada) {
            return res.status(404).json({ message: 'Consulta no encontrada' });
        }
        res.status(200).json(consultaEditada);
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        res.status(500).json({ message: 'Error al editar la consulta', error: error.message });
        console.error(error);
    }
};


export default {
    listaMascotas,
    añadirMascota,
    editarMascota,
    eliminarMascota,
    historiaClinica,
    registrarConsulta,
    consultaPorId,
    motivosConsultas,
    editarConsultaPorId,
    diagnosticosPorMotivo
};