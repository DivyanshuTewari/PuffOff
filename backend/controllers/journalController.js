const Journal = require('../models/Journal');

// POST /api/journals
const createJournal = async (req, res) => {
  try {
    const { title, content, mood, tags } = req.body;
    const journal = await Journal.create({
      userId: req.user._id,
      title,
      content,
      mood: mood || 'neutral',
      tags: tags || [],
    });
    res.status(201).json({ success: true, journal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/journals
const getJournals = async (req, res) => {
  try {
    const journals = await Journal.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, journals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/journals/:id
const getJournal = async (req, res) => {
  try {
    const journal = await Journal.findOne({ _id: req.params.id, userId: req.user._id });
    if (!journal) return res.status(404).json({ success: false, message: 'Entry not found' });
    res.json({ success: true, journal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/journals/:id
const updateJournal = async (req, res) => {
  try {
    const journal = await Journal.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true }
    );
    if (!journal) return res.status(404).json({ success: false, message: 'Entry not found' });
    res.json({ success: true, journal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/journals/:id
const deleteJournal = async (req, res) => {
  try {
    const journal = await Journal.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!journal) return res.status(404).json({ success: false, message: 'Entry not found' });
    res.json({ success: true, message: 'Journal entry deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createJournal, getJournals, getJournal, updateJournal, deleteJournal };
