import obtenerListaClientes from '../models/client.model.js';

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

export default listaClientes;