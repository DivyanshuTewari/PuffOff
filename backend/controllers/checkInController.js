const CheckIn = require('../models/CheckIn');

// POST /api/checkins
const createCheckIn = async (req, res) => {
  try {
    const { addictionId, urgeMeter, triggers, mood, notes } = req.body;
    const checkIn = await CheckIn.create({
      userId: req.user._id,
      addictionId,
      urgeMeter,
      triggers: triggers || '',
      mood: mood || 'neutral',
      notes: notes || '',
    });
    res.status(201).json({ success: true, checkIn });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/checkins
const getCheckIns = async (req, res) => {
  try {
    const { addictionId, limit = 30 } = req.query;
    const query = { userId: req.user._id };
    if (addictionId) query.addictionId = addictionId;

    const checkIns = await CheckIn.find(query)
      .populate('addictionId', 'viceName customName')
      .sort({ date: -1 })
      .limit(parseInt(limit));

    res.json({ success: true, checkIns });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createCheckIn, getCheckIns };
