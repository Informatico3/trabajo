require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const morgan = require('morgan');
const path = require('path');

const connectDB = require('./config/db');
const errorHandler = require('./middlewares/errorMiddleware');

// Conectar a MongoDB
connectDB();

// Inicializar aplicación Express
const app = express();

// 1) MIDDLEWARES GLOBALES

// Configurar seguridad con helmet
app.use(helmet());

// Desarrollo logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limitar peticiones de la misma API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Demasiadas peticiones desde esta IP, por favor intente nuevamente en una hora!'
});
app.use('/api', limiter);

// Body parser, lectura de datos del body en req.body
app.use(express.json({ limit: '10kb' }));

// Data sanitización contra NoSQL query injection
app.use(mongoSanitize());

// Data sanitización contra XSS
app.use(xss());

// Prevenir parameter pollution
app.use(hpp({
  whitelist: [
    'duracion',
    'ratingsQuantity',
    'ratingsAverage',
    'maxGroupSize',
    'difficulty',
    'precio'
  ]
}));

// Configurar sesiones
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 1 día
  }
}));

// Habilitar CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

// Cookie parser
app.use(cookieParser());

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// 2) RUTAS
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/estudiantes', require('./routes/estudiantesRoutes'));

// 3) MANEJO DE ERRORES
app.use(errorHandler);

// 4) INICIAR SERVIDOR
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Servidor corriendo en modo ${process.env.NODE_ENV} en puerto ${PORT}`);
});

// Manejar errores de promesas no capturadas
process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION! 💥 Apagando...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECIBIDO. Apagando correctamente');
  server.close(() => {
    console.log('💥 Proceso terminado');
  });
});