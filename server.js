// HELENA INDUSTRIAL CORE - SERVIDOR PRINCIPAL (MINI FIREBASE CLONE)
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const connectDB = require('./db');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.json());
app.use(cors());

// Inicializa Conexão do db.js
connectDB();

// --- MODELS ---
const UserSchema = new mongoose.Schema({ email: String, pass: String });
const User = mongoose.model('User', UserSchema);

const DataSchema = new mongoose.Schema({ content: String, author: String });
const Data = mongoose.model('Data', DataSchema);

// --- AUTHENTICATION (Firebase Auth Clone) ---
app.post('/auth/register', async (req, res) => {
    try {
        const hashedPass = await bcrypt.hash(req.body.pass, 10);
        const user = await User.create({ email: req.body.email, pass: hashedPass });
        res.json({ message: "Usuário criado com sucesso no Banco JDP!" });
    } catch (err) {
        res.status(500).send("Erro no registro.");
    }
});

app.post('/auth/login', async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    if (user && await bcrypt.compare(req.body.pass, user.pass)) {
        const token = jwt.sign({ id: user._id }, 'SECRET_KEY_PRINCESA_DIAMANTE');
        res.json({ token });
    } else {
        res.status(401).send("Falha na autenticação.");
    }
});

// --- REALTIME DATABASE (Firestore Clone) ---
io.on('connection', (socket) => {
    console.log('[HELENA SOCKET]: Cliente conectado ->', socket.id);

    socket.on('get_data', async () => {
        const docs = await Data.find();
        socket.emit('data_update', docs);
    });

    socket.on('write_data', async (payload) => {
        await Data.create(payload);
        const allDocs = await Data.find();
        io.emit('data_update', allDocs);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`[HELENA SERVER]: Ativo na porta ${PORT}`));