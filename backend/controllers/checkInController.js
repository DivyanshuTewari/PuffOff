const CheckIn = require('../models/CheckIn');
const Addiction = require('../models/Addiction');

// POST /api/checkins
const createCheckIn = async (req, res) => {
  try {
    const { addictionId, urgeMeter, triggers, mood, notes } = req.body;

    const addiction = await Addiction.findOne({ _id: addictionId, userId: req.user._id });
    if (!addiction) return res.status(404).json({ success: false, message: 'Addiction not found' });

    const checkIn = await CheckIn.create({
      userId: req.user._id,
      addictionId,
      urgeMeter: Math.max(1, Math.min(10, parseInt(urgeMeter, 10) || 5)),
      triggers: typeof triggers === 'string' ? triggers.slice(0, 500) : '',
      mood: typeof mood === 'string' ? mood : 'neutral',
      notes: typeof notes === 'string' ? notes.slice(0, 1000) : '',
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
