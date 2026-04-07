const UsageLog = require('../models/UsageLog');
const Addiction = require('../models/Addiction');

exports.createLog = async (req, res) => {
  try {
    const { addictionId, date, quantity, moneySpent, notes } = req.body;

    const addiction = await Addiction.findOne({ _id: addictionId, userId: req.user._id });
    if (!addiction) return res.status(404).json({ success: false, message: 'Addiction not found' });

    const log = await UsageLog.create({
      userId: req.user._id,
      addictionId,
      date: date ? new Date(date) : new Date(),
      quantity,
      moneySpent,
      notes,
    });

    res.status(201).json({ success: true, log });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error creating usage log' });
  }
};

exports.getLogs = async (req, res) => {
  try {
    const { addictionId } = req.query;
    const query = { userId: req.user._id };
    if (addictionId) {
      query.addictionId = addictionId;
    }

    const logs = await UsageLog.find(query).sort({ date: -1 }).populate('addictionId', 'viceName customName currency');
    res.json({ success: true, logs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error fetching usage logs' });
  }
};

exports.deleteLog = async (req, res) => {
  try {
    const log = await UsageLog.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!log) return res.status(404).json({ success: false, message: 'Log not found' });
    res.json({ success: true, message: 'Log deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error deleting log' });
  }
};
