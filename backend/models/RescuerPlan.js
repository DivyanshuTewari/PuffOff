const mongoose = require('mongoose');

const urgeTimeSchema = new mongoose.Schema({
  time: { type: String, required: true }, // "HH:MM" 24h
  label: { type: String, default: '' },   // "After breakfast"
}, { _id: false });

const dailyLogSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  target: { type: Number, required: true },
  consumed: { type: Number, default: 0 },
  extraLogged: { type: Boolean, default: false }, // true if "Log an Extra" was used
  note: { type: String, default: '' },
  urgeResisted: { type: Number, default: 0 }, // times user waited 15 min
}, { _id: false });

const weeklyDaySchema = new mongoose.Schema({
  day: { type: Number, required: true }, // 0=Mon, 6=Sun
  date: { type: Date, required: true },
  target: { type: Number, required: true },
  isIntermittent: { type: Boolean, default: false }, // Phase 3 skip days
}, { _id: false });

const rescuerPlanSchema = new mongoose.Schema({
  addictionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Addiction',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // Intake Data
  unit: { type: String, required: true, default: 'units' }, // "Sticks", "Pegs", "Packets"
  baselineDaily: { type: Number, required: true, min: 1 },
  pricePerUnit: { type: Number, default: 0 },
  currency: { type: String, default: 'INR' },
  firstDoseMinutes: { type: Number, default: 60 }, // mins after waking
  urgeMap: [urgeTimeSchema],

  // Algorithm Output
  currentPhase: { type: Number, default: 1, min: 1, max: 4 },
  currentDailyTarget: { type: Number, required: true },
  weekStartDate: { type: Date, required: true },
  weeklySchedule: [weeklyDaySchema],

  // Logs
  logs: [dailyLogSchema],

  // Meta
  startDate: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
  prevPlanId: { // archived plan reference if this is a re-taper
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RescuerPlan',
    default: null,
  },
}, { timestamps: true });

// Index for fast lookups
rescuerPlanSchema.index({ userId: 1, addictionId: 1, isActive: 1 });

module.exports = mongoose.model('RescuerPlan', rescuerPlanSchema);
