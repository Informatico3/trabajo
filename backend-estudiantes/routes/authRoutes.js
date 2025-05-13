const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { check } = require('express-validator');

router.post(
  '/registro',
  [
    check('correo', 'Por favor ingrese un correo válido').isEmail(),
    check('contraseña', 'La contraseña debe tener al menos 8 caracteres').isLength({ min: 8 })
  ],
  authController.registrar
);

router.post('/login', authController.login);

module.exports = router;