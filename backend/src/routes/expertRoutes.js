const express = require('express');
const router = express.Router();
const { getExperts, getExpertById, seedExperts } = require('../controllers/expertController');

router.get('/', getExperts);
router.get('/:id', getExpertById);

// Dev only: seed database
if (process.env.NODE_ENV !== 'production') {
  router.post('/seed', seedExperts);
}

module.exports = router;