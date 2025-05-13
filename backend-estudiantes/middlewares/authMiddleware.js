const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');
const AppError = require('../utils/appError');

exports.protect = async (req, res, next) => {
  try {
    // 1) Obtener el token y verificar que existe
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(
        new AppError('No estás logueado. Por favor inicia sesión para acceder.', 401)
      );
    }

    // 2) Verificación del token
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);

    // 3) Verificar si el usuario aún existe
    const currentUser = await Usuario.findById(decoded.id);
    if (!currentUser) {
      return next(
        new AppError('El usuario perteneciente a este token ya no existe.', 401)
      );
    }

    // 4) Guardar usuario en la request
    req.usuario = currentUser;
    next();
  } catch (err) {
    next(err);
  }
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles es un array ['admin', 'editor']. 'usuario' no está incluido
    if (!roles.includes(req.usuario.rol)) {
      return next(
        new AppError('No tienes permiso para realizar esta acción', 403)
      );
    }

    next();
  };
};