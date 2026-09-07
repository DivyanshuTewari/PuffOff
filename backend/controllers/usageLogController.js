const UsageLog = require('../models/UsageLog');
const Addiction = require('../models/Addiction');
const { syncTrackerToRescuer } = require('../services/syncService');

exports.createLog = async (req, res) => {
  try {
    const { addictionId, date, quantity, moneySpent, notes } = req.body;

    const addiction = await Addiction.findOne({ _id: addictionId, userId: req.user._id });
    if (!addiction) return res.status(404).json({ success: false, message: 'Addiction not found' });

    const logDate = date ? new Date(date) : new Date();
    const qty = parseFloat(quantity) || 0;
    if (qty <= 0) {
      return res.status(400).json({ success: false, message: 'Quantity must be greater than 0' });
    }
    const spent = Math.max(0, parseFloat(moneySpent) || 0);

    const log = await UsageLog.create({
      userId: req.user._id,
      addictionId,
      date: logDate,
      quantity: qty,
      moneySpent: spent,
      notes: typeof notes === 'string' ? notes.slice(0, 500) : '',
    });

    // Automatically update the addiction's clean timer if this new log is more recent
    if (!addiction.lastRelapseDate || logDate >= new Date(addiction.lastRelapseDate)) {
      addiction.lastRelapseDate = logDate;
      addiction.relapseHistory.push({ date: logDate, note: notes || 'Logged via Tracker' });
      await addiction.save();
    }

    // Bidirectional sync: Automatically update active Rescuer Plan for this vice
    const updatedPlan = await syncTrackerToRescuer(
      req.user._id,
      addictionId,
      logDate,
      qty,
      spent,
      notes
    );

    res.status(201).json({ success: true, log, addiction, rescuerPlan: updatedPlan });
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

    // Recompute lastRelapseDate so the clean streak on the Dashboard stays accurate.
    const mostRecentLog = await UsageLog.findOne(
      { userId: req.user._id, addictionId: log.addictionId },
      null,
      { sort: { date: -1 } }
    );

    const addiction = await Addiction.findOne({ _id: log.addictionId, userId: req.user._id });
    if (addiction) {
      addiction.lastRelapseDate = mostRecentLog
        ? mostRecentLog.date
        : addiction.createdAt;
      await addiction.save();
    }

    res.json({ success: true, message: 'Log deleted successfully', addiction });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error deleting log' });
  }
};
