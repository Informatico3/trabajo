const mongoose = require('mongoose');
const validator = require('validator');

const usuarioSchema = new mongoose.Schema({
  correo: { 
    type: String, 
    required: [true, 'El correo es requerido'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Por favor ingrese un correo válido']
  },
  contraseña: { 
    type: String, 
    required: [true, 'La contraseña es requerida'],
    minlength: [8, 'La contraseña debe tener al menos 8 caracteres'],
    select: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware pre-save para hashear la contraseña
usuarioSchema.pre('save', async function(next) {
  if (!this.isModified('contraseña')) return next();
  this.contraseña = await bcrypt.hash(this.contraseña, 12);
  next();
});

module.exports = mongoose.model('Usuario', usuarioSchema);