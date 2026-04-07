const express = require('express');
const router = express.Router();
const { createJournal, getJournals, getJournal, updateJournal, deleteJournal } = require('../controllers/journalController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getJournals);
router.post('/', createJournal);
router.get('/:id', getJournal);
router.put('/:id', updateJournal);
router.delete('/:id', deleteJournal);

module.exports = router;
