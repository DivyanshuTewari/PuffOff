const Addiction = require('../models/Addiction');
const RescuerPlan = require('../models/RescuerPlan');
const UsageLog = require('../models/UsageLog');

/**
 * Normalizes a date to UTC midnight for schedule/log consistency
 */
function toMidnightUTC(date) {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

/**
 * Sync from Tracker entry -> Rescuer plan
 * When user logs in Tracker sheet, updates or creates today's log in active Rescuer plan.
 */
async function syncTrackerToRescuer(userId, addictionId, date, quantity, moneySpent, notes) {
  try {
    const plan = await RescuerPlan.findOne({ userId, addictionId, isActive: true });
    if (!plan) return null;

    const logDate = toMidnightUTC(date);
    const qty = Number(quantity) || 0;

    // Find schedule target for that day
    const scheduleDay = plan.weeklySchedule?.find((s) => {
      return toMidnightUTC(s.date).getTime() === logDate.getTime();
    });
    const target = scheduleDay?.target ?? plan.currentDailyTarget;

    let planLog = plan.logs.find((l) => toMidnightUTC(l.date).getTime() === logDate.getTime());
    if (planLog) {
      planLog.consumed = parseFloat((planLog.consumed + qty).toFixed(2));
      if (notes) planLog.note = planLog.note ? `${planLog.note}; ${notes}` : notes;
    } else {
      plan.logs.push({
        date: logDate,
        target,
        consumed: qty,
        note: notes || 'Logged via Daily Tracker',
        extraLogged: false,
        urgeResisted: 0,
      });
      planLog = plan.logs[plan.logs.length - 1];
    }

    // If total consumed exceeds target, trigger compassionate hold
    if (planLog.consumed > target) {
      plan.holdDays = Math.min(6, (plan.holdDays || 0) + 2);
    }

    await plan.save();
    return plan;
  } catch (err) {
    console.error('syncTrackerToRescuer error:', err);
    return null;
  }
}

/**
 * Sync from Rescuer log -> Tracker entry
 * When user logs in Rescuer, creates/updates corresponding UsageLog row in Tracker sheet.
 */
async function syncRescuerToTracker(userId, addictionId, date, consumedDelta, pricePerUnit, note, isExtra = false) {
  try {
    if (consumedDelta <= 0) return null;
    const logDate = date ? new Date(date) : new Date();
    const moneySpent = parseFloat((consumedDelta * (Number(pricePerUnit) || 0)).toFixed(2));

    const newLog = await UsageLog.create({
      userId,
      addictionId,
      date: logDate,
      quantity: consumedDelta,
      moneySpent,
      notes: note || (isExtra ? 'Rescuer extra consumption logged' : 'Logged via Rescuer'),
    });

    return newLog;
  } catch (err) {
    console.error('syncRescuerToTracker error:', err);
    return null;
  }
}

/**
 * Sync from Dashboard manual relapse -> Tracker & Rescuer
 * Resets clean streak, creates a tracker entry, and triggers Rescuer hold.
 */
async function syncRelapse(userId, addictionId, note) {
  try {
    const now = new Date();

    // 1. Create a 1-unit usage log in Tracker sheet for this relapse
    const usageLog = await UsageLog.create({
      userId,
      addictionId,
      date: now,
      quantity: 1,
      moneySpent: 0,
      notes: note || 'Relapse logged from Dashboard',
    });

    // 2. Sync to active Rescuer plan if exists
    const plan = await RescuerPlan.findOne({ userId, addictionId, isActive: true });
    if (plan) {
      const today = toMidnightUTC(now);
      const scheduleDay = plan.weeklySchedule?.find((s) => toMidnightUTC(s.date).getTime() === today.getTime());
      const target = scheduleDay?.target ?? plan.currentDailyTarget;

      let planLog = plan.logs.find((l) => toMidnightUTC(l.date).getTime() === today.getTime());
      if (planLog) {
        planLog.consumed = parseFloat((planLog.consumed + 1).toFixed(2));
        planLog.extraLogged = true;
        planLog.note = note ? `${planLog.note}; Relapse: ${note}` : `${planLog.note}; Relapse logged`;
      } else {
        plan.logs.push({
          date: today,
          target,
          consumed: 1,
          extraLogged: true,
          note: note ? `Relapse: ${note}` : 'Relapse logged from Dashboard',
        });
      }

      // Add stabilization hold days
      plan.holdDays = Math.min(6, (plan.holdDays || 0) + 2);
      await plan.save();
    }

    return { usageLog, plan };
  } catch (err) {
    console.error('syncRelapse error:', err);
    return null;
  }
}

/**
 * Sync when an addiction is deleted / deactivated
 * Automatically deactivates all active Rescuer plans for this addiction.
 */
async function syncDeleteAddiction(userId, addictionId) {
  try {
    await RescuerPlan.updateMany(
      { userId, addictionId, isActive: true },
      { $set: { isActive: false } }
    );
  } catch (err) {
    console.error('syncDeleteAddiction error:', err);
  }
}

module.exports = {
  toMidnightUTC,
  syncTrackerToRescuer,
  syncRescuerToTracker,
  syncRelapse,
  syncDeleteAddiction,
};
