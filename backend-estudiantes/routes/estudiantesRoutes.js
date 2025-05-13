const express = require('express');
const router = express.Router();
const estudiantesController = require('../controllers/estudiantesController');
const auth = require('../middlewares/authMiddleware');

router
  .route('/')
  .get(auth.protect, estudiantesController.obtenerEstudiantes)
  .post(auth.protect, estudiantesController.crearEstudiante);

router
  .route('/:id')
  .get(auth.protect, estudiantesController.obtenerEstudiante)
  .patch(auth.protect, estudiantesController.actualizarEstudiante)
  .delete(auth.protect, estudiantesController.eliminarEstudiante);

module.exports = router;