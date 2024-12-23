import express from 'express';
import db from './bd_config/db.js'; 
const { Carta } = db;

const app = express();
const port = process.env.PORT || 8080;

app.use(express.static('public'));
app.use('/imageneswebp', express.static('imagenes webp'));

app.set('view engine', 'ejs');
app.set('views', './views');

app.get('/', (req, res) => {
    res.send('¡Aplicación funcionando correctamente en Railway!'); 
});

app.use((req, res, next) => {
    console.log(`Solicitud: ${req.method} ${req.url}`);
    next();
});

process.on('uncaughtException', (err) => {
    console.error('Error no capturado:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Promesa rechazada no manejada:', promise, 'razón:', reason);
});

// Ruta para obtener las cartas y renderizar la vista
app.get('/cartas', async (req, res) => {
    try {
        const { nombre, tipo, raza, edicion } = req.query;
        let whereConditions = {};
        if (nombre) whereConditions.nombre = { [db.Sequelize.Op.like]: `%${nombre}%` };
        if (tipo) whereConditions.tipo = tipo;
        if (raza && tipo === 'Aliado') whereConditions.raza = raza;
        if (edicion) whereConditions.edicion = edicion;

        const cartas = await Carta.findAll({
            where: whereConditions,
            order: [['id', 'ASC']],
            limit: 10
        });

        if (!cartas.length) {
            res.status(404).send('No se encontraron cartas.');
            return;
        }

        const ediciones = await Carta.findAll({
            attributes: [[db.Sequelize.fn('DISTINCT', db.Sequelize.col('edicion')), 'edicion']],
            order: [['edicion', 'ASC']],
        });

        res.render('cartas', {cartas, 
            ediciones: ediciones.map(e => e.edicion),
            nombre, tipo, raza, edicion
        });
    } catch (error) {
        console.error('Error al obtener las cartas:', error);
        res.status(500).json({ error: 'Error al obtener las cartas' });
        res.status(500).send('Error interno en el servidor');
    }
});

// Función para iniciar el servidor después de la conexión a la base de datos
async function startServer() {
    try {
        await db.sequelize.authenticate();
        console.log('Conexión a la base de datos establecida exitosamente');
        await db.sequelize.sync(); // Sincroniza la base de datos
        console.log('Tablas creadas con éxito');
        app.listen(port, () => {
            console.log(`Servidor corriendo en https://cartasmyl-production.up.railway.app/${port}`);
        });
    } catch (error) {
        console.error('No se pudo conectar a la base de datos:', error);
    }
}

// Llamar a la función para iniciar el servidor
startServer();
