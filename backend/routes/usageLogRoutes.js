const express = require('express');
const router = express.Router();
const { createLog, getLogs, deleteLog } = require('../controllers/usageLogController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/', createLog);
router.get('/', getLogs);
router.delete('/:id', deleteLog);

module.exports = router;
