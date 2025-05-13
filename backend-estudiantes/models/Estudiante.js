const mongoose = require('mongoose');
const validator = require('validator');

const estudianteSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre es requerido'],
    trim: true,
    maxlength: [50, 'El nombre no puede exceder los 50 caracteres']
  },
  carrera: {
    type: String,
    required: [true, 'La carrera es requerida'],
    enum: {
      values: ['Ingeniería', 'Medicina', 'Derecho', 'Administración', 'Arquitectura'],
      message: 'Carrera no válida'
    }
  },
  edad: {
    type: Number,
    required: [true, 'La edad es requerida'],
    min: [16, 'La edad mínima es 16 años'],
    max: [80, 'La edad máxima es 80 años']
  },
  creadoPor: {
    type: mongoose.Schema.ObjectId,
    ref: 'Usuario',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Estudiante', estudianteSchema);