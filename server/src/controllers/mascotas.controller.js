import mascotasModel from '../models/mascotas.model.js';
import { actualizarStockLote } from '../models/ventas.model.js';

const { añadirMascotaADB, obtenerListaMascotas, editarMascotaADB, eliminarMascotaADB, obtenerVacunas, obtenerConsultas, obtenerAntecedentes, datosMascota, añadirVacuna, añadirConsulta, añadirAntecedente, obtenerVacunaPorId, obtenerConsultaPorId } = mascotasModel;

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
        especie: datos.especie,
        raza: datos.raza,
        fecha_nacimiento: datos.fecha_nacimiento,
        sexo: datos.genero,
        alergias: datos.alergias,
        observaciones: datos.observaciones,
        activo: datos.activo,
        numero_chip: datos.numero_chip,
        dueño: datos.id_cliente,
        vacunas: vacunas,
        consultas: consultas,
        antecedentes: antecedentes
    }
});
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener la historia clínica', error });
    }
}

const registrarConsulta = async (req, res) => {
    try {
        const {id_mascota, fecha_consulta,peso_actual,temperatura, motivo, diagnostico, tratamiento, observaciones,id_lote,nombre_vacuna,fecha_aplicacion,proxima_dosis,observaciones_vacuna} = req.body;
        //Voy a quitar !temperatura y !observaciones porque no son "obligatorios" en el formulario y bloquean la creacion- Pablo
        if(!id_mascota || !fecha_consulta || !peso_actual || !motivo || !diagnostico || !tratamiento) {
            return res.status(400).json({ message: 'Faltan datos obligatorios de la consulta' });
        }
        if(id_mascota){
            const consulta = {
                id_mascota,
                id_veterinario: req.user.id,
                fecha_consulta,
                peso_actual,
                temperatura,
                motivo,
                diagnostico,
                tratamiento,
                observaciones
            };
            const consultaRegistrada = await añadirConsulta(consulta);
            console.log('Consulta registrada:', consultaRegistrada);
            if(!consultaRegistrada) {
            return res.status(500).json({ message: 'Error al registrar la consulta' });
            }
        }
        if(nombre_vacuna){
            if(!fecha_aplicacion || !proxima_dosis || !observaciones_vacuna) {
                return res.status(400).json({ message: 'Faltan datos obligatorios de la vacuna' });
            }
            const vacuna = {
            id_mascota,
            id_lote,
            nombre_vacuna,
            fecha_aplicacion,
            proxima_dosis,
            id_veterinario: req.user.id,
            observaciones: observaciones_vacuna
        };
        console.log('Actualizando stock del lote:', id_lote);
        await actualizarStockLote(id_lote, 1); // Actualiza el stock del lote restando 1 unidad
        const vacunaRegistrada = await añadirVacuna(vacuna);
        console.log('Vacuna registrada:', vacunaRegistrada);
        if(!vacunaRegistrada) {
            return res.status(500).json({ message: 'Error al registrar la vacuna' });
        }
        }
        
        
        res.status(200).json({ message: 'Operacion registrada correctamente'});
    } catch (error) {
        res.status(500).json({ message: 'Error al registrar la consulta', error: error.message });
    }
}

const vacunasPorId = async (req, res) => {
    try {
        const { id_vacuna } = req.params;
        if(!id_vacuna) {
            return res.status(400).json({ message: 'Falta el ID de la vacuna' });
        }
        const vacuna = await obtenerVacunaPorId(id_vacuna);
        if(!vacuna) {
            return res.status(404).json({ message: 'Vacuna no encontrada' });
        }
        res.status(200).json(vacuna);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener la vacuna', error });
    }
};

const consultaPorId = async (req, res) => {
    try {
        const { id_consulta } = req.params;
        if(!id_consulta) {
            return res.status(400).json({ message: 'Falta el ID de la consulta' });
        }
        const consulta = await obtenerConsultaPorId(id_consulta);
        if(!consulta) {
            return res.status(404).json({ message: 'Consulta no encontrada' });
        }
        res.status(200).json(consulta);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener la consulta', error });
    }
};
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
    registrarConsulta,
    vacunasPorId,
    consultaPorId,
    //actualizarHistoriaClinica
};