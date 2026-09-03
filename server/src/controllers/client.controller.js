import clientModel from '../models/client.model.js';
const { obtenerListaClientes, añadirClienteADB, editarClienteADB, eliminarClienteADB } = clientModel;

const listaClientes = async (req, res) => {
    try {
        const clientes = await obtenerListaClientes();
        if(!clientes || clientes.length === 0) {
            return res.status(404).json({ message: 'No se encontraron clientes' });
        }
        res.status(200).json({ message: 'Lista de clientes obtenida correctamente', clientes });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener la lista de clientes', error });
    }
}

const añadirCliente = async (req, res) => {
    try {
        const cliente = req.body;
        if(!cliente.nombre || !cliente.apellido || !cliente.dni || !cliente.telefono || !cliente.direccion) {
            return res.status(400).json({ message: 'Faltan datos obligatorios del cliente' });
        }
        const nuevoCliente = await añadirClienteADB(cliente);
        res.status(201).json({ message: 'Cliente añadido correctamente', cliente: nuevoCliente });
    }catch (error) {
        res.status(500).json({ message: 'Error al añadir el cliente', error });
    }
}

const editarCliente = async (req, res) => {
    try {
        const { id } = req.params;
        
        if(!id) {
            return res.status(400).json({ message: 'Falta el ID del cliente' });
        }
        const cliente = req.body;
        if(!cliente.nombre || !cliente.apellido || !cliente.dni || !cliente.telefono || !cliente.direccion) {
            return res.status(400).json({ message: 'Faltan datos obligatorios del cliente' });
        }
        const clienteEditado = await editarClienteADB(id, cliente);
        console.log('Cliente editado:', clienteEditado); // Agrega este log para verificar el resultado de la edición
        if(!clienteEditado) {
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }
        res.status(200).json({ message: 'Cliente editado correctamente', cliente: clienteEditado });
    }catch (error) {
        res.status(500).json({ message: 'Error al editar el cliente', error });
    }
}

const eliminarCliente = async (req, res) => {
    try {
        const { id } = req.params;
        if(!id) {
            return res.status(400).json({ message: 'Falta el ID del cliente' });
        }
        const clienteEliminado = await eliminarClienteADB(id);
        if(!clienteEliminado) {
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }
        res.status(200).json({ message: 'Cliente eliminado correctamente', cliente: clienteEliminado });
    }
    catch (error) {
        res.status(500).json({ message: 'Error al eliminar el cliente', error });
    }
}

export default {
    listaClientes,
    añadirCliente,
    editarCliente,
    eliminarCliente
};