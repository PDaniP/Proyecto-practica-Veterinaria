import mascotasModel from '../models/mascotas.model.js';

const { añadirMascotaADB, obtenerListaMascotas, editarMascotaADB, eliminarMascotaADB, obtenerVacunas, obtenerConsultas, obtenerAntecedentes, datosMascota, añadirVacuna, añadirConsulta, añadirAntecedente } = mascotasModel;

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
        if(!mascota.id_cliente || !mascota.nombre || !mascota.especie || !mascota.raza || !mascota.fecha_nacimiento || !mascota.genero) {
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
        if(!mascota.id_cliente || !mascota.nombre || !mascota.especie || !mascota.raza || !mascota.fecha_nacimiento || !mascota.genero) {
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
        const vacunas = await obtenerVacunas(id);
        const consultas = await obtenerConsultas(id);
        const antecedentes = await obtenerAntecedentes(id);
        res.status(200).json({ message: 'Historia clínica obtenida correctamente', historiaClinica: { nombre: datos.nombre, especie: datos.especie, raza: datos.raza, vacunas, consultas, antecedentes } });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener la historia clínica', error });
    }
}

/*const actualizarHistoriaClinica = async (req, res) => {
    try {
        const { id } = req.params;
        if(!id) {
            return res.status(400).json({ message: 'Falta el ID de la mascota' });
        }
        const { vacunas, consultas, antecedentes } = req.body;
        if(vacunas) {
            for(const vacuna of vacunas) {
                await añadirVacuna({ id_mascota: id, ...vacuna });
            }
        }
        if(consultas) {
            for(const consulta of consultas) {
                await añadirConsulta({ id_mascota: id, ...consulta });
            }
        }
        if(antecedentes) {
            for(const antecedente of antecedentes) {
                await añadirAntecedente({ id_mascota: id, ...antecedente });
            }
        }
        res.status(200).json({ message: 'Historia clínica actualizada correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar la historia clínica', error });
    }
}*/


export default {
    listaMascotas,
    añadirMascota,
    editarMascota,
    eliminarMascota,
    historiaClinica,
    //actualizarHistoriaClinica
};