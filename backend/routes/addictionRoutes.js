const express = require('express');
const router = express.Router();
const { getAddictions, addAddiction, updateAddiction, logRelapse, deleteAddiction } = require('../controllers/addictionController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getAddictions);
router.post('/', addAddiction);
router.put('/:id', updateAddiction);
router.post('/:id/relapse', logRelapse);
router.delete('/:id', deleteAddiction);

module.exports = router;
