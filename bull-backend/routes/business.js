const express = require('express');
const router = express.Router();
const businessController = require('../controllers/businessController');

// İşletme Ekleme Rotası: /api/business/add
router.post('/add', businessController.addBusiness);

// İşletme Bilgilerini Getirme Rotası: /api/business/:ownerId
router.get('/:ownerId', businessController.getBusinessProfile);

module.exports = router;