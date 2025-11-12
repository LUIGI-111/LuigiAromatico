import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import cors from 'cors';
import bcrypt from 'bcrypt';

import sequelize from '../database/index.js';
import User from './models/User.js';
import Perfume from './models/Perfume.js';
import CartItem from './models/CartItem.js';

const app = express();

app.use(cors({
    origin: true,
    credentials: true,
}));

app.use(bodyParser.json());

app.use(
    session({
        secret: 'secret-key',
        resave: false,
        saveUninitialized: false,
        cookie: { maxAge: 1000 * 60 * 60 },
    }),
);

const ensureAuth = (req, res, next) => {
    if (!req.session.userId) {
        return res.status(401).json({ message: 'No autorizado' });
    }
    next();
};

const initializeData = async () => {
    await sequelize.sync({ force: true });

    const passwordHash = await bcrypt.hash('password123', 10);

    await User.create({
        name: 'Cliente Demo',
        email: 'cliente@perfumes.com',
        passwordHash,
    });

    const perfumes = [
        {
            name: 'Essence Bloom',
            brand: 'AromaLux',
            description: 'Fragancia floral con notas de jazmín y vainilla.',
            price: 59.99,
            imageUrl: '/images/essence-bloom.jpg',
        },
        {
            name: 'Ocean Whisper',
            brand: 'BlueWave',
            description: 'Aroma fresco con matices marinos y cítricos.',
            price: 69.99,
            imageUrl: '/images/ocean-whisper.jpg',
        },
        {
            name: 'Mystic Amber',
            brand: 'GoldenAura',
            description: 'Fragancia cálida con notas de ámbar y especias.',
            price: 79.99,
            imageUrl: '/images/mystic-amber.jpg',
        },
    ];

    await Perfume.bulkCreate(perfumes);
};

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(400).json({ message: 'Credenciales inválidas' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Credenciales inválidas' });
        }

        req.session.userId = user.id;
        res.json({ message: 'Inicio de sesión exitoso', user: { id: user.id, name: user.name } });
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
});

app.post('/api/logout', (req, res) => {
    req.session.destroy(() => {
        res.json({ message: 'Sesión cerrada' });
    });
});

app.get('/api/perfumes', ensureAuth, async (req, res) => {
    try {
        const perfumes = await Perfume.findAll();
        res.json(perfumes);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener perfumes', error: error.message });
    }
});

app.get('/api/cart', ensureAuth, async (req, res) => {
    try {
        const items = await CartItem.findAll({
            where: { userId: req.session.userId },
            include: Perfume,
        });
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el carrito', error: error.message });
    }
});

app.post('/api/cart', ensureAuth, async (req, res) => {
    const { perfumeId, quantity } = req.body;

    try {
        const [item, created] = await CartItem.findOrCreate({
            where: {
                userId: req.session.userId,
                perfumeId,
            },
            defaults: { quantity: quantity || 1 },
        });

        if (!created) {
            item.quantity += quantity || 1;
            await item.save();
        }

        res.json({ message: 'Carrito actualizado' });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar el carrito', error: error.message });
    }
});

app.delete('/api/cart/:id', ensureAuth, async (req, res) => {
    try {
        const deleted = await CartItem.destroy({ where: { id: req.params.id, userId: req.session.userId } });
        if (!deleted) {
            return res.status(404).json({ message: 'Elemento no encontrado' });
        }
        res.json({ message: 'Elemento eliminado' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar elemento', error: error.message });
    }
});

app.use(express.static('public'));

const startServer = async () => {
    await initializeData();
    app.listen(3000, () => {
        console.log('Servidor escuchando en http://localhost:3000');
    });
};

startServer();

export default app;
