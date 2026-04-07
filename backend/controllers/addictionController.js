const Addiction = require('../models/Addiction');

// GET /api/addictions
const getAddictions = async (req, res) => {
  try {
    const addictions = await Addiction.find({ userId: req.user._id, isActive: true }).sort({ createdAt: -1 });
    res.json({ success: true, addictions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/addictions
const addAddiction = async (req, res) => {
  try {
    const { viceName, customName, lastRelapseDate, dailySpending, currency, motivationalNote } = req.body;
    const addiction = await Addiction.create({
      userId: req.user._id,
      viceName,
      customName: customName || '',
      lastRelapseDate: lastRelapseDate || Date.now(),
      dailySpending: dailySpending || 0,
      currency: currency || 'USD',
      motivationalNote: motivationalNote || '',
    });
    res.status(201).json({ success: true, addiction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/addictions/:id
const updateAddiction = async (req, res) => {
  try {
    const addiction = await Addiction.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!addiction) return res.status(404).json({ success: false, message: 'Addiction not found' });
    res.json({ success: true, addiction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/addictions/:id/relapse
const logRelapse = async (req, res) => {
  try {
    const { note } = req.body;
    const addiction = await Addiction.findOne({ _id: req.params.id, userId: req.user._id });
    if (!addiction) return res.status(404).json({ success: false, message: 'Addiction not found' });

    addiction.relapseHistory.push({ date: Date.now(), note: note || '' });
    addiction.lastRelapseDate = Date.now();
    await addiction.save();

    res.json({ success: true, addiction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/addictions/:id
const deleteAddiction = async (req, res) => {
  try {
    const addiction = await Addiction.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isActive: false },
      { new: true }
    );
    if (!addiction) return res.status(404).json({ success: false, message: 'Addiction not found' });
    res.json({ success: true, message: 'Addiction removed from tracking' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAddictions, addAddiction, updateAddiction, logRelapse, deleteAddiction };
