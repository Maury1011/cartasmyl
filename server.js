import express from 'express';
import db from './bd_config/db.js';
const { Carta } = db;

const app = express();
const port = 3000;

// Configura el directorio público para archivos estáticos
app.use(express.static('public'));
app.use('/imageneswebp', express.static('imagenes webp'));
app.use('/imagenes', express.static('imagenes'));

// Configura EJS como motor de plantillas
app.set('view engine', 'ejs');
app.set('views', './views');

// Ruta para obtener las cartas y renderizar la vista
app.get('/cartas', async (req, res) => {
    try {
        // Obtener los filtros desde la URL
        const { nombre, tipo, raza, edicion } = req.query;

        // Filtro por nombre
        let whereConditions = {};
        if (nombre) {
            whereConditions.nombre = {
                [db.Sequelize.Op.like]: `%${nombre}%`
            };
        }

        // Filtro por tipo
        if (tipo) {
            whereConditions.tipo = tipo;
        }

        // Filtro por raza (solo si tipo es "Aliado")
        if (raza && tipo === 'Aliado') {
            whereConditions.raza = raza;
        }

        // Filtro por edición
        if (edicion) {
            whereConditions.edicion = edicion;
        }

        // Obtener las cartas filtradas
        const cartas = await Carta.findAll({
            where: whereConditions,
            order: [['id', 'ASC']], // Orden por ID (puedes cambiar esto)
        });

        // Obtener las ediciones disponibles (esto es solo un ejemplo, puedes ajustar según tu modelo)
        const ediciones = await Carta.findAll({
            attributes: [[db.Sequelize.fn('DISTINCT', db.Sequelize.col('edicion')), 'edicion']],
            order: [['edicion', 'ASC']]
        });

        // Enviar las cartas y las ediciones a la vista
        res.render('cartas', {
            cartas,
            ediciones: ediciones.map(e => e.edicion),
            nombre,
            tipo,
            raza,
            edicion
        });
    } catch (error) {
        console.error('Error al obtener las cartas:', error);
        res.status(500).json({ error: 'Error al obtener las cartas' });
    }
});


// Función para iniciar el servidor después de la conexión a la base de datos
async function startServer() {
    try {
        // Intenta autenticar la conexión a la base de datos
        await db.sequelize.authenticate();
        console.log('Conexión a la base de datos establecida exitosamente');
        
        // Sincroniza los modelos con la base de datos (si no lo has hecho ya)
        await db.sequelize.sync();
        console.log('Tablas creadas con éxito');
        
        // Inicia el servidor Express después de que la base de datos esté lista
        app.listen(port, () => {
            console.log(`Servidor corriendo en http://localhost:${port}`);
        });
    } catch (error) {
        console.error('No se pudo conectar a la base de datos:', error);
    }
}

// Llamar a la función para iniciar el servidor
startServer();
