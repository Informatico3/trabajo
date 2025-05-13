const Estudiante = require('../models/Estudiante');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');

exports.obtenerEstudiantes = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Estudiante.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  
  const estudiantes = await features.query;

  res.status(200).json({
    status: 'success',
    results: estudiantes.length,
    data: {
      estudiantes
    }
  });
});

exports.crearEstudiante = catchAsync(async (req, res, next) => {
  const nuevoEstudiante = await Estudiante.create({
    ...req.body,
    creadoPor: req.usuario.id
  });

  res.status(201).json({
    status: 'success',
    data: {
      estudiante: nuevoEstudiante
    }
  });
});

exports.obtenerEstudiante = catchAsync(async (req, res, next) => {
  const estudiante = await Estudiante.findById(req.params.id);

  if (!estudiante) {
    return next(new AppError('No se encontró un estudiante con ese ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      estudiante
    }
  });
});

exports.actualizarEstudiante = catchAsync(async (req, res, next) => {
  const estudiante = await Estudiante.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!estudiante) {
    return next(new AppError('No se encontró un estudiante con ese ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      estudiante
    }
  });
});

exports.eliminarEstudiante = catchAsync(async (req, res, next) => {
  const estudiante = await Estudiante.findByIdAndDelete(req.params.id);

  if (!estudiante) {
    return next(new AppError('No se encontró un estudiante con ese ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});