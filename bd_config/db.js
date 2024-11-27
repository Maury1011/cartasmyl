import dotenv from 'dotenv';
dotenv.config(); // Cargar las variables de entorno desde el archivo .env

import { Sequelize, DataTypes } from 'sequelize';
import initCartasModel from '../models/cartas.model.js'; // Ajusta la ruta de tu modelo según corresponda

const sequelize = new Sequelize(process.env.PGNAME, process.env.PGUSER, process.env.PGPASSWORD, {
    host: process.env.PGHOST,
    dialect: 'postgres', // Usamos PostgreSQL
    port: process.env.PGPORT, // Usamos el puerto de la base de datos
    logging: false // Desactivar el logging (opcional)
});

const db = {};

db.Carta = initCartasModel(sequelize, DataTypes);

db.sequelize = sequelize;
db.Sequelize = Sequelize;

sequelize
    .authenticate()
    .then(() => {
        console.log('Conexión a la base de datos establecida exitosamente');
    })
    .catch((err) => {
        console.error('No se pudo conectar a la base de datos', err);
    });

export default db;














