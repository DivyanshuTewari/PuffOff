const express = require('express');
const router = express.Router();
const {
  getPlans, getPlan, getPlanById,
  createPlan, logDay, logExtra, logUrgeResisted, updatePlan, deletePlan
} = require('../controllers/rescuerController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getPlans);
router.get('/plan/:planId', getPlanById);
router.get('/:addictionId', getPlan);
router.post('/', createPlan);
router.post('/:planId/log', logDay);
router.post('/:planId/extra', logExtra);
router.post('/:planId/resist', logUrgeResisted);
router.put('/:planId', updatePlan);
router.delete('/:planId', deletePlan);

module.exports = router;
