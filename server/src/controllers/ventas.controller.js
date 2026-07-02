import {obtenerLotesVentas, actualizarStockLote} from '../models/ventas.model.js'

const descontarStock = async (req, res) => {
    const { id_lote, cantidad } = req.body;
    try {
        const lote = await actualizarStockLote(id_lote, cantidad);
        if (!lote) {
            return res.status(404).json({ message: 'Lote no encontrado' });
        }
        res.json({ message: 'Stock descontado correctamente', lote });
    } catch (error) {
        res.status(500).json({ message: 'Error al descontar el stock', error });
    }
};

const eliminarLoteVacio = async (req, res) => {
    const { id_lote } = req.body;
    try {
        const loteEliminado = await eliminarLoteVacio(id_lote);
        if (!loteEliminado) {
            return res.status(404).json({ message: 'Lote no encontrado o no vacío' });
        }
        res.json({ message: 'Lote eliminado correctamente', loteEliminado });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar el lote', error });
    }
};


export { descontarStock, eliminarLoteVacio };