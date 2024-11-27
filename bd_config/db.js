
import { Sequelize, DataTypes} from 'sequelize'
import { dbConfig } from './db.config.js'
import initCartasModel from '../models/cartas.model.js';

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
    host: dbConfig.HOST,
    dialect: dbConfig.DIALECT,
    logging: false
});

const db = {}

db.Carta = initCartasModel(sequelize, DataTypes)

db.sequelize = sequelize
db.Sequelize = Sequelize

sequelize
    .authenticate()
    .then(() => {
    console.log('Conexión a la base de datos establecida exitosamente')
    })
    .catch((err) => {
    console.error('No se pudo conectar a la base de datos', err)
    })

//db.sequelize.sync({ force: true })
db.sequelize.sync({ alter: true })
    .then(() => {
        console.log('tablas creadas con exito')
    })
    .catch((error) => {
    console.error('error al sincronizar la base de datos', error)
    }
)

export default db;


















