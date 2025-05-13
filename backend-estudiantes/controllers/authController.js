const Usuario = require('../models/Usuario');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

exports.registrar = async (req, res, next) => {
  try {
    // Validación de errores
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { correo, contraseña } = req.body;
    
    // Verificar si el usuario ya existe
    const usuarioExistente = await Usuario.findOne({ correo });
    if (usuarioExistente) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'El correo ya está registrado' 
      });
    }

    // Crear nuevo usuario
    const usuario = await Usuario.create({ correo, contraseña });

    // Generar token JWT
    const token = jwt.sign({ id: usuario._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
    });

    res.status(201).json({
      status: 'success',
      token,
      data: {
        usuario: {
          id: usuario._id,
          correo: usuario.correo
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { correo, contraseña } = req.body;

    // 1) Verificar si el correo y contraseña existen
    if (!correo || !contraseña) {
      return res.status(400).json({
        status: 'error',
        message: 'Por favor ingrese correo y contraseña'
      });
    }

    // 2) Verificar si el usuario existe y la contraseña es correcta
    const usuario = await Usuario.findOne({ correo }).select('+contraseña');

    if (!usuario || !(await usuario.correctPassword(contraseña, usuario.contraseña))) {
      return res.status(401).json({
        status: 'error',
        message: 'Correo o contraseña incorrectos'
      });
    }

    // 3) Si todo está bien, enviar el token al cliente
    const token = jwt.sign({ id: usuario._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
    });

    res.status(200).json({
      status: 'success',
      token,
      data: {
        usuario: {
          id: usuario._id,
          correo: usuario.correo
        }
      }
    });
  } catch (err) {
    next(err);
  }
};