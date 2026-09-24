import especiesModel from "../models/especies.model.js";

const listarEspecies = async (req, res) => {
    try {
        const especies = await especiesModel.obtenerEspecies();
        res.status(200).json({ especies });
    } catch (error) {
        res.status(500).json({
            message: "Error al obtener las especies",
            error,
        });
    }
};

const listarRazas = async (req, res) => {
    try {
        const { idEspecie } = req.params;
        const razas = await especiesModel.obtenerRazas(idEspecie);
        res.status(200).json({ razas })
    } catch (error) {
        res.status(500).json({
            message: "Error al obtener las razas",
            error,
        });
    }  
};

export default {
    listarEspecies,
    listarRazas,
}