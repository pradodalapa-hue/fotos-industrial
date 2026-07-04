// HELENA INDUSTRIAL CORE - CONEXÃO DE BANCO DE DADOS
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost/mini_firebase', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log(`[HELENA SYSTEM]: MongoDB Conectado: ${conn.connection.host}`);
    } catch (error) {
        console.error(`[ERRO DE CONEXÃO HELENA]: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;