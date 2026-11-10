const express = require('express');
const router = express.Router();
const { getVehicles, getVehicle, createVehicle, updateVehicle, deleteVehicle, setDefaultVehicle } = require('../controllers/vehicleController');
const { demoAuth } = require('../middleware/demoAuth');

router.use(demoAuth);
router.get('/', getVehicles);
router.get('/:id', getVehicle);
router.post('/', createVehicle);
router.put('/:id/default', setDefaultVehicle);
router.put('/:id', updateVehicle);
router.delete('/:id', deleteVehicle);

module.exports = router;
