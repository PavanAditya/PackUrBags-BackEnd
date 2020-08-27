const express = require('express');
const router = express.Router();
const { flightController } = require('../controllers/flight.controllers');

// ! Backend Test Flight Route
// ? http://localhost:3000/api/v1/flights
router.get('/', (req, res) => {
    res.status(200).send({
        message: 'Success',
        status: 200,
        dataObject: {
            appName: 'Pack Ur Bags',
            routeName: 'Flight Service Test Route',
            workingStatus: 'Working as expected'
        }
    });
});
// ! Backend Test Flight Route

module.exports = router;