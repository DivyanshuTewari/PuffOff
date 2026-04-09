const RescuerPlan = require('../models/RescuerPlan');
const Addiction = require('../models/Addiction');

// ─── Tapering Algorithm ──────────────────────────────────────────────────────

/**
 * Generates a 7-day weekly schedule starting from startDate (UTC midnight).
 * Phase 1: 20% cut, time shifting (same target each day)
 * Phase 2: Gradual decline across the week
 * Phase 3: Intermittent days (skip every other day)
 * Phase 4: Zeros
 */
function buildWeeklySchedule(phase, baselineDaily, weekNumber, startDate) {
  const schedule = [];
  // Ensure we start at UTC midnight to avoid timezone drift
  const start = new Date(startDate);
  start.setUTCHours(0, 0, 0, 0);

  for (let i = 0; i < 7; i++) {
    const date = new Date(start);
    date.setUTCDate(start.getUTCDate() + i);
    let target = 0;
    let isIntermittent = false;

    if (phase === 1) {
      target = Math.ceil(baselineDaily * 0.8);
    } else if (phase === 2) {
      // Reduce by 1-2 per week; spread evenly within the week
      const maxTarget = Math.max(2, Math.floor(baselineDaily * 0.8));
      const phase2Base = Math.max(2, Math.round(baselineDaily * 0.8 - (weekNumber - 1) * 1.5));
      // Gradual step-down within the week: slightly lower each day
      target = Math.min(maxTarget, Math.max(2, Math.round(phase2Base - (i * 0.1))));
    } else if (phase === 3) {
      // Alternating days: target on even days, rest on odd days
      isIntermittent = i % 2 !== 0;
      target = isIntermittent ? 0 : Math.min(2, baselineDaily);
    } else {
      target = 0;
    }

    schedule.push({ day: i, date, target, isIntermittent });
  }
  return schedule;
}

/**
 * Determines the starting phase based on baseline and dependency.
 */
function determineInitialPhase(baselineDaily, firstDoseMinutes) {
  if (baselineDaily <= 2) return 3; // Jump straight to Intermittent Days
  if (baselineDaily <= 4) return 2; // Jump straight to Active Reduction
  return 1;
}

/**
 * Dynamic rescheduling after a slip-up:
 * Redistributes the remaining weekly budget across remaining days.
 */
function recalculateWeek(schedule, todayIdx, totalConsumedToday, targetToday) {
  const overflow = Math.max(0, totalConsumedToday - targetToday);
  if (overflow === 0) return schedule;

  const remainingDays = schedule.length - todayIdx - 1;
  if (remainingDays <= 0) return schedule;

  // Spread overflow penalty across remaining days
  const reductionPerDay = Math.ceil(overflow / remainingDays);

  const updated = schedule.map((day, idx) => {
    if (idx <= todayIdx) return day;
    const newTarget = Math.max(0, day.target - reductionPerDay);
    return { ...day, target: newTarget };
  });

  return updated;
}

/**
 * Calculates number of complete weeks since the plan start date (UTC-aware).
 */
function weeksSinceStart(startDate) {
  const now = new Date();
  const start = new Date(startDate);
  return Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 7));
}

// ─── Controllers ─────────────────────────────────────────────────────────────

// GET /api/rescuer
const getPlans = async (req, res) => {
  try {
    const plans = await RescuerPlan.find({ userId: req.user._id, isActive: true })
      .populate('addictionId', 'viceName customName')
      .sort({ createdAt: -1 });
    res.json({ success: true, plans });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/rescuer/:addictionId
const getPlan = async (req, res) => {
  try {
    const plan = await RescuerPlan.findOne({
      addictionId: req.params.addictionId,
      userId: req.user._id,
      isActive: true,
    }).populate('addictionId', 'viceName customName');
    if (!plan) return res.status(404).json({ success: false, message: 'No active plan found' });
    res.json({ success: true, plan });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/rescuer/plan/:planId (by plan ID)
const getPlanById = async (req, res) => {
  try {
    const plan = await RescuerPlan.findOne({
      _id: req.params.planId,
      userId: req.user._id,
    }).populate('addictionId', 'viceName customName');
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });
    res.json({ success: true, plan });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/rescuer — Create a new tapering plan
const createPlan = async (req, res) => {
  try {
    const {
      addictionId, unit, baselineDaily, pricePerUnit,
      currency, firstDoseMinutes, urgeMap,
    } = req.body;

    // Archive old plan if one exists
    await RescuerPlan.updateMany(
      { addictionId, userId: req.user._id, isActive: true },
      { isActive: false }
    );

    const phase = determineInitialPhase(baselineDaily, firstDoseMinutes || 60);

    // Use UTC midnight to avoid timezone date drift
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const weeklySchedule = buildWeeklySchedule(phase, baselineDaily, 1, today);
    const currentDailyTarget = weeklySchedule[0]?.target ?? Math.ceil(baselineDaily * 0.8);

    const plan = await RescuerPlan.create({
      addictionId,
      userId: req.user._id,
      unit: unit || 'units',
      baselineDaily,
      pricePerUnit: pricePerUnit || 0,
      currency: currency || 'INR',
      firstDoseMinutes: firstDoseMinutes || 60,
      urgeMap: urgeMap || [],
      currentPhase: phase,
      currentDailyTarget,
      weekStartDate: today,
      weeklySchedule,
      logs: [],
    });

    const populated = await plan.populate('addictionId', 'viceName customName');
    res.status(201).json({ success: true, plan: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/rescuer/:planId/log — Log today's consumption
const logDay = async (req, res) => {
  try {
    const { consumed, note } = req.body;
    const plan = await RescuerPlan.findOne({ _id: req.params.planId, userId: req.user._id });
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });

    // Validate consumed
    const consumedNum = Number(consumed);
    if (isNaN(consumedNum) || consumedNum < 0) {
      return res.status(400).json({ success: false, message: 'Invalid consumed quantity' });
    }

    // Use UTC midnight for consistent date comparison
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // ── Weekly schedule advancement ──────────────────────────────────────────
    // Advance the week if a new 7-day window has started since weekStartDate
    const weekStart = new Date(plan.weekStartDate);
    weekStart.setUTCHours(0, 0, 0, 0);
    const daysSinceWeekStart = Math.floor((today.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24));

    if (daysSinceWeekStart >= 7) {
      // A new week has started — rebuild schedule for the new week
      const newWeekStart = new Date(today);
      newWeekStart.setUTCHours(0, 0, 0, 0);

      // Determine correct week number for phase 2
      const weeksElapsed = Math.floor(daysSinceWeekStart / 7);
      const newWeekNumber = (plan.currentPhase === 2)
        ? Math.max(2, weeksElapsed + 1) // week 1 is phase 1; phase 2 starts at week 2
        : 1;

      // Phase advancement: only advance once per phase boundary
      if (plan.currentPhase === 1) {
        // Move from Stabilization → Active Reduction (only if baseline > 4)
        const newPhase = plan.baselineDaily > 4 ? 2 : (plan.baselineDaily <= 2 ? 3 : 2);
        plan.currentPhase = newPhase;
      } else if (plan.currentPhase === 2 && plan.currentDailyTarget <= 2) {
        // Move from Active Reduction → Critical Minimum
        plan.currentPhase = 3;
      }
      // Phase 3 → 4 is handled below based on actual streak, not week boundary

      const newSchedule = buildWeeklySchedule(plan.currentPhase, plan.baselineDaily, newWeekNumber, newWeekStart);
      plan.weeklySchedule = newSchedule;
      plan.currentDailyTarget = newSchedule[0].target;
      plan.weekStartDate = newWeekStart;
    }

    // Find today's slot in the (possibly updated) weekly schedule
    const todayIdx = plan.weeklySchedule.findIndex(s => {
      const d = new Date(s.date);
      d.setUTCHours(0, 0, 0, 0);
      return d.getTime() === today.getTime();
    });
    const todayTarget = todayIdx >= 0 ? plan.weeklySchedule[todayIdx].target : plan.currentDailyTarget;

    // Find or create today's log entry
    let todayLog = plan.logs.find(l => {
      const d = new Date(l.date);
      d.setUTCHours(0, 0, 0, 0);
      return d.getTime() === today.getTime();
    });

    if (todayLog) {
      todayLog.consumed = consumedNum;
      todayLog.note = note || todayLog.note;
    } else {
      plan.logs.push({ date: today, target: todayTarget, consumed: consumedNum, note: note || '' });
    }

    // Update currentDailyTarget to reflect today's schedule slot
    if (todayIdx >= 0) {
      plan.currentDailyTarget = plan.weeklySchedule[todayIdx].target;
    }

    // Dynamic rescheduling if over target
    if (consumedNum > todayTarget && todayIdx >= 0) {
      plan.weeklySchedule = recalculateWeek(plan.weeklySchedule, todayIdx, consumedNum, todayTarget);
    }

    // Phase 3 → 4: If last 7 consecutive logged days all have consumed === 0
    if (plan.currentPhase === 3 && consumedNum === 0) {
      // Check last 7 logs (or all if fewer)
      const recentLogs = plan.logs.slice(-7);
      const allZero = recentLogs.length >= 3 && recentLogs.every(l => l.consumed === 0);
      if (allZero) {
        plan.currentPhase = 4;
        plan.currentDailyTarget = 0;
      }
    }

    await plan.save();

    // ── Tracker Sync ─────────────────────────────────────────────────────────
    // Update Addiction's lastRelapseDate when consumed > 0 (resets clean streak)
    // Only update if this new date is more recent than the stored one
    if (consumedNum > 0) {
      const addiction = await Addiction.findById(plan.addictionId);
      if (addiction) {
        const currentRelapse = addiction.lastRelapseDate ? new Date(addiction.lastRelapseDate) : null;
        if (!currentRelapse || today >= currentRelapse) {
          addiction.lastRelapseDate = today;
          await addiction.save();
        }
      }
    }

    res.json({ success: true, plan });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/rescuer/:planId/extra — "Log an Extra" (slip-up protocol)
const logExtra = async (req, res) => {
  try {
    const { note } = req.body;
    const plan = await RescuerPlan.findOne({ _id: req.params.planId, userId: req.user._id });
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const todayIdx = plan.weeklySchedule.findIndex(s => {
      const d = new Date(s.date);
      d.setUTCHours(0, 0, 0, 0);
      return d.getTime() === today.getTime();
    });
    const todayTarget = todayIdx >= 0 ? plan.weeklySchedule[todayIdx].target : plan.currentDailyTarget;

    let todayLog = plan.logs.find(l => {
      const d = new Date(l.date);
      d.setUTCHours(0, 0, 0, 0);
      return d.getTime() === today.getTime();
    });

    if (todayLog) {
      todayLog.consumed += 1;
      todayLog.extraLogged = true;
      todayLog.note = note || todayLog.note;
    } else {
      plan.logs.push({ date: today, target: todayTarget, consumed: 1, extraLogged: true, note: note || '' });
      todayLog = plan.logs[plan.logs.length - 1];
    }

    // Recalculate rest of week compassionately
    if (todayIdx >= 0) {
      plan.weeklySchedule = recalculateWeek(
        plan.weeklySchedule, todayIdx, todayLog.consumed, todayTarget
      );
    }

    await plan.save();

    // ── Tracker Sync ─────────────────────────────────────────────────────────
    // "Log an Extra" always counts as a use — update lastRelapseDate
    const addiction = await Addiction.findById(plan.addictionId);
    if (addiction) {
      const currentRelapse = addiction.lastRelapseDate ? new Date(addiction.lastRelapseDate) : null;
      if (!currentRelapse || today >= currentRelapse) {
        addiction.lastRelapseDate = today;
        await addiction.save();
      }
    }

    res.json({
      success: true,
      plan,
      message: "It's okay. We've adjusted your plan. Try to add 30 more minutes to your next gap. 💚",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/rescuer/:planId/resist — Log an urge resisted (timer completed)
const logUrgeResisted = async (req, res) => {
  try {
    const plan = await RescuerPlan.findOne({ _id: req.params.planId, userId: req.user._id });
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const todayTarget = (() => {
      const idx = plan.weeklySchedule.findIndex(s => {
        const d = new Date(s.date);
        d.setUTCHours(0, 0, 0, 0);
        return d.getTime() === today.getTime();
      });
      return idx >= 0 ? plan.weeklySchedule[idx].target : plan.currentDailyTarget;
    })();

    const todayLog = plan.logs.find(l => {
      const d = new Date(l.date);
      d.setUTCHours(0, 0, 0, 0);
      return d.getTime() === today.getTime();
    });

    if (todayLog) {
      todayLog.urgeResisted = (todayLog.urgeResisted || 0) + 1;
    } else {
      plan.logs.push({
        date: today,
        target: todayTarget,
        consumed: 0,
        urgeResisted: 1,
      });
    }

    await plan.save();
    res.json({ success: true, plan });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/rescuer/:planId — Update plan (edit intake fields only, preserves progress)
const updatePlan = async (req, res) => {
  try {
    // Only allow safe intake fields to be patched — never overwrite logs/schedule/phase
    const { unit, baselineDaily, pricePerUnit, currency, firstDoseMinutes, urgeMap } = req.body;
    const allowedUpdates = {};
    if (unit !== undefined) allowedUpdates.unit = unit;
    if (baselineDaily !== undefined) allowedUpdates.baselineDaily = baselineDaily;
    if (pricePerUnit !== undefined) allowedUpdates.pricePerUnit = pricePerUnit;
    if (currency !== undefined) allowedUpdates.currency = currency;
    if (firstDoseMinutes !== undefined) allowedUpdates.firstDoseMinutes = firstDoseMinutes;
    if (urgeMap !== undefined) allowedUpdates.urgeMap = urgeMap;

    const plan = await RescuerPlan.findOneAndUpdate(
      { _id: req.params.planId, userId: req.user._id },
      { $set: allowedUpdates },
      { new: true, runValidators: true }
    ).populate('addictionId', 'viceName customName');
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });
    res.json({ success: true, plan });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/rescuer/:planId — Delete plan
const deletePlan = async (req, res) => {
  try {
    const plan = await RescuerPlan.findOneAndDelete({ _id: req.params.planId, userId: req.user._id });
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });
    res.json({ success: true, message: 'Plan deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getPlans, getPlan, getPlanById,
  createPlan, logDay, logExtra, logUrgeResisted, updatePlan, deletePlan,
};
