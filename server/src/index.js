import express from 'express';
// import routes from './routes/user.routes.js'; // Tu compañero deberá usar el .js al final
import db from './config/db.js'; // <-- ¡Acá el .js al final es obligatorio!
import userRoutes from './routes/user.routes.js';
import productRoutes from './routes/product.routes.js'
import cors from 'cors';
import cookieParser from 'cookie-parser';
import ventasRoutes from './routes/ventas.routes.js'
import clientesRoutes from './routes/clientes.routes.js'
import mascotasRoutes from './routes/mascotas.routes.js'
import especiesRoutes from "./routes/especies.routes.js"
import estudiosRoutes from "./routes/estudios.routes.js"
import turnosRoutes from './routes/turnos.routes.js';
import { client } from './config/whatsapp.js';
import { iniciarCronRecordatorios } from './config/cron.js';
const app = express();
client.initialize();
iniciarCronRecordatorios();
app.use(cors({
  origin: [process.env.FRONTEND_URL,  
    'http://localhost:5173'
  ],
  methods: ["GET", "POST", "PUT","PATCH", "DELETE"],
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());



app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/users', userRoutes);
app.use('/products', productRoutes);
app.use('/ventas', ventasRoutes);
app.use('/clientes', clientesRoutes);
app.use('/mascotas', mascotasRoutes);
app.use("/especies", especiesRoutes);
app.use("/estudios", estudiosRoutes);
app.use("/turnos", turnosRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto: ${PORT}`);
});