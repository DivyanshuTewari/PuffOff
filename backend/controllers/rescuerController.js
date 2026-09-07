const RescuerPlan = require('../models/RescuerPlan');
const Addiction = require('../models/Addiction');
const { syncRescuerToTracker, toMidnightUTC } = require('../services/syncService');

// ─── Universal Clinical Tapering Engine ──────────────────────────────────────

function calculateNormalizedDaily(quantity, frequency) {
  const qty = Math.max(0.01, Number(quantity) || 1);
  if (frequency === 'weekly') {
    return parseFloat((qty / 7).toFixed(3));
  }
  return parseFloat(qty.toFixed(3));
}

function roundTarget(val) {
  if (val >= 5) return Math.round(val);
  if (val >= 1) return parseFloat(val.toFixed(1));
  return parseFloat(val.toFixed(2));
}

function buildUniversalSchedule(phase, baselineQuantity, frequency, weekNumber, startDate, holdDays = 0) {
  const schedule = [];
  const start = new Date(startDate);
  start.setUTCHours(0, 0, 0, 0);

  const baseline = Math.max(0.01, Number(baselineQuantity) || 1);

  if (frequency === 'weekly') {
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setUTCDate(start.getUTCDate() + i);

      let target = 0;
      let isIntermittent = true;
      let targetNote = 'Rest & Recovery Day';

      if (phase === 1) {
        if (i === 5) {
          target = roundTarget(baseline * 0.8);
          isIntermittent = false;
          targetNote = 'Weekly Session (15-20% reduced)';
        }
      } else if (phase === 2) {
        const sessionDay = (weekNumber * 2) % 7;
        const phase2Reduction = Math.max(0.2, baseline * Math.pow(0.75, weekNumber));
        if (i === sessionDay) {
          target = roundTarget(phase2Reduction);
          isIntermittent = false;
          targetNote = 'Tapered Session Window';
        }
      } else if (phase === 3) {
        if (weekNumber % 2 === 1 && i === 6) {
          target = roundTarget(Math.min(0.3, baseline * 0.3));
          isIntermittent = false;
          targetNote = 'Micro-Step Session';
        }
      } else {
        target = 0;
        targetNote = 'Freedom Day';
      }

      schedule.push({ day: i, date, target, targetNote, isIntermittent });
    }
    return schedule;
  }

  // Daily Pattern
  for (let i = 0; i < 7; i++) {
    const date = new Date(start);
    date.setUTCDate(start.getUTCDate() + i);

    let target = 0;
    let isIntermittent = false;
    let targetNote = 'Daily Target';

    if (phase === 1) {
      target = roundTarget(baseline * 0.8);
      targetNote = 'Stabilization & Time Shifting';
    } else if (phase === 2) {
      if (baseline >= 10) {
        const stepCut = baseline * 0.8 * Math.pow(0.85, Math.max(0, weekNumber - 1));
        target = roundTarget(Math.max(2, stepCut));
        targetNote = 'Active Reduction (Hyperbolic curve)';
      } else if (baseline >= 3) {
        const stepCut = Math.max(1, (baseline * 0.8) - ((weekNumber - 1) * 0.8));
        target = roundTarget(stepCut);
        targetNote = 'Active Step-Down';
      } else {
        const microStep = Math.max(0.2, (baseline * 0.8) - ((weekNumber - 1) * 0.25));
        target = roundTarget(microStep);
        targetNote = 'Micro-Dose Reduction';
      }
    } else if (phase === 3) {
      isIntermittent = (i % 2 !== 0);
      const dose = baseline >= 10 ? 2 : (baseline >= 3 ? 1 : roundTarget(Math.min(0.5, baseline * 0.3)));
      target = isIntermittent ? 0 : dose;
      targetNote = isIntermittent ? 'Zero-Dose Rest Day' : 'Consolidation Day';
    } else {
      target = 0;
      isIntermittent = false;
      targetNote = 'Freedom Day';
    }

    schedule.push({ day: i, date, target, targetNote, isIntermittent });
  }

  return schedule;
}

function determineInitialPhase(normalizedDaily, frequency) {
  if (frequency === 'weekly') return 1;
  if (normalizedDaily <= 0.2) return 3;
  return 1;
}

function compassionateHoldRecalculation(schedule, todayIdx, totalConsumedToday, targetToday) {
  const overflow = Math.max(0, totalConsumedToday - targetToday);
  if (overflow === 0) return schedule;

  return schedule.map((day, idx) => {
    if (idx <= todayIdx) return day;
    return day;
  });
}

// ─── Controllers ─────────────────────────────────────────────────────────────

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

const createPlan = async (req, res) => {
  try {
    const {
      addictionId,
      unit,
      baselineDaily,
      baselineQuantity,
      frequency = 'daily',
      pricePerUnit,
      currency,
      firstDoseMinutes,
      urgeMap,
    } = req.body;

    const addiction = await Addiction.findOne({ _id: addictionId, userId: req.user._id });
    if (!addiction) return res.status(404).json({ success: false, message: 'Addiction not found' });

    const rawQty = Math.max(0.01, Number(baselineQuantity || baselineDaily) || 1);
    const normalizedDaily = calculateNormalizedDaily(rawQty, frequency);

    await RescuerPlan.updateMany(
      { addictionId, userId: req.user._id, isActive: true },
      { isActive: false }
    );

    const phase = determineInitialPhase(normalizedDaily, frequency);

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const weeklySchedule = buildUniversalSchedule(phase, rawQty, frequency, 1, today, 0);
    const currentDailyTarget = weeklySchedule[0]?.target ?? roundTarget(rawQty * 0.8);

    const plan = await RescuerPlan.create({
      addictionId,
      userId: req.user._id,
      unit: unit || 'units',
      frequency,
      baselineQuantity: rawQty,
      baselineDaily: normalizedDaily,
      pricePerUnit: Number(pricePerUnit) || 0,
      currency: currency || 'INR',
      firstDoseMinutes: Number(firstDoseMinutes) || 60,
      urgeMap: urgeMap || [],
      currentPhase: phase,
      currentDailyTarget,
      weekStartDate: today,
      weeklySchedule,
      holdDays: 0,
      logs: [],
    });

    const populated = await plan.populate('addictionId', 'viceName customName');
    res.status(201).json({ success: true, plan: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const logDay = async (req, res) => {
  try {
    const { consumed, note } = req.body;
    const plan = await RescuerPlan.findOne({ _id: req.params.planId, userId: req.user._id });
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });

    const consumedNum = Number(consumed);
    if (isNaN(consumedNum) || consumedNum < 0) {
      return res.status(400).json({ success: false, message: 'Invalid consumed quantity' });
    }

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const weekStart = new Date(plan.weekStartDate);
    weekStart.setUTCHours(0, 0, 0, 0);
    const daysSinceWeekStart = Math.floor((today.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24));
    const requiredCycleDays = 7 + (plan.holdDays || 0);

    if (daysSinceWeekStart >= requiredCycleDays) {
      const newWeekStart = new Date(today);
      newWeekStart.setUTCHours(0, 0, 0, 0);

      const weeksElapsed = Math.floor(daysSinceWeekStart / 7);
      const newWeekNumber = Math.max(1, weeksElapsed + 1);

      if (plan.currentPhase === 1) {
        plan.currentPhase = 2;
      } else if (plan.currentPhase === 2) {
        const isCriticalMinimum =
          plan.frequency === 'weekly'
            ? plan.currentDailyTarget <= 0.3
            : plan.currentDailyTarget <= 2;

        if (isCriticalMinimum) {
          plan.currentPhase = 3;
        }
      }

      plan.holdDays = 0;

      const newSchedule = buildUniversalSchedule(
        plan.currentPhase,
        plan.baselineQuantity,
        plan.frequency,
        newWeekNumber,
        newWeekStart,
        0
      );
      plan.weeklySchedule = newSchedule;
      plan.currentDailyTarget = newSchedule[0].target;
      plan.weekStartDate = newWeekStart;
    }

    const todayIdx = plan.weeklySchedule.findIndex((s) => {
      const d = new Date(s.date);
      d.setUTCHours(0, 0, 0, 0);
      return d.getTime() === today.getTime();
    });
    const todayTarget = todayIdx >= 0 ? plan.weeklySchedule[todayIdx].target : plan.currentDailyTarget;

    let todayLog = plan.logs.find((l) => {
      const d = new Date(l.date);
      d.setUTCHours(0, 0, 0, 0);
      return d.getTime() === today.getTime();
    });

    const previousConsumed = todayLog ? todayLog.consumed : 0;
    const consumedDelta = Math.max(0, consumedNum - previousConsumed);

    if (todayLog) {
      todayLog.consumed = consumedNum;
      todayLog.note = note || todayLog.note;
    } else {
      plan.logs.push({
        date: today,
        target: todayTarget,
        consumed: consumedNum,
        note: note || '',
      });
    }

    if (todayIdx >= 0) {
      plan.currentDailyTarget = plan.weeklySchedule[todayIdx].target;
    }

    if (consumedNum > todayTarget) {
      plan.holdDays = Math.min(6, (plan.holdDays || 0) + 2);
      plan.weeklySchedule = compassionateHoldRecalculation(
        plan.weeklySchedule,
        todayIdx,
        consumedNum,
        todayTarget
      );
    }

    if (plan.currentPhase === 3 && consumedNum === 0) {
      const recentLogs = plan.logs.slice(-7);
      const allZero = recentLogs.length >= 4 && recentLogs.every((l) => l.consumed === 0);
      if (allZero) {
        plan.currentPhase = 4;
        plan.currentDailyTarget = 0;
      }
    }

    await plan.save();

    // ── Bidirectional Cross-Sync ──
    let updatedAddiction = null;
    if (consumedNum > 0) {
      const addiction = await Addiction.findById(plan.addictionId);
      if (addiction) {
        const currentRelapse = addiction.lastRelapseDate ? new Date(addiction.lastRelapseDate) : null;
        if (!currentRelapse || today >= currentRelapse) {
          addiction.lastRelapseDate = today;
          addiction.relapseHistory.push({ date: today, note: note || 'Logged via Rescuer' });
          await addiction.save();
          updatedAddiction = addiction;
        }
      }
    }

    // Write corresponding Tracker sheet log entry if positive delta
    const syncedUsageLog = await syncRescuerToTracker(
      req.user._id,
      plan.addictionId,
      today,
      consumedDelta > 0 ? consumedDelta : consumedNum,
      plan.pricePerUnit,
      note || 'Logged via Rescuer'
    );

    res.json({ success: true, plan, addiction: updatedAddiction, usageLog: syncedUsageLog });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const logExtra = async (req, res) => {
  try {
    const { note } = req.body;
    const plan = await RescuerPlan.findOne({ _id: req.params.planId, userId: req.user._id });
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const todayIdx = plan.weeklySchedule.findIndex((s) => {
      const d = new Date(s.date);
      d.setUTCHours(0, 0, 0, 0);
      return d.getTime() === today.getTime();
    });
    const todayTarget = todayIdx >= 0 ? plan.weeklySchedule[todayIdx].target : plan.currentDailyTarget;

    let todayLog = plan.logs.find((l) => {
      const d = new Date(l.date);
      d.setUTCHours(0, 0, 0, 0);
      return d.getTime() === today.getTime();
    });

    const increment = plan.frequency === 'weekly' ? 0.25 : (plan.baselineQuantity < 2 ? 0.25 : 1);

    if (todayLog) {
      todayLog.consumed = roundTarget(todayLog.consumed + increment);
      todayLog.extraLogged = true;
      todayLog.note = note || todayLog.note;
    } else {
      plan.logs.push({
        date: today,
        target: todayTarget,
        consumed: increment,
        extraLogged: true,
        note: note || '',
      });
      todayLog = plan.logs[plan.logs.length - 1];
    }

    plan.holdDays = Math.min(6, (plan.holdDays || 0) + 2);
    await plan.save();

    // ── Bidirectional Cross-Sync ──
    let updatedAddiction = null;
    const addiction = await Addiction.findById(plan.addictionId);
    if (addiction) {
      const currentRelapse = addiction.lastRelapseDate ? new Date(addiction.lastRelapseDate) : null;
      if (!currentRelapse || today >= currentRelapse) {
        addiction.lastRelapseDate = today;
        addiction.relapseHistory.push({ date: today, note: note || 'Rescuer extra consumption' });
        await addiction.save();
        updatedAddiction = addiction;
      }
    }

    const syncedUsageLog = await syncRescuerToTracker(
      req.user._id,
      plan.addictionId,
      today,
      increment,
      plan.pricePerUnit,
      note || 'Rescuer extra consumption',
      true
    );

    res.json({
      success: true,
      plan,
      addiction: updatedAddiction,
      usageLog: syncedUsageLog,
      message: "It's completely okay. We held your target for 2 extra days so your body can adapt comfortably. 💚",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const logUrgeResisted = async (req, res) => {
  try {
    const plan = await RescuerPlan.findOne({ _id: req.params.planId, userId: req.user._id });
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const todayTarget = (() => {
      const idx = plan.weeklySchedule.findIndex((s) => {
        const d = new Date(s.date);
        d.setUTCHours(0, 0, 0, 0);
        return d.getTime() === today.getTime();
      });
      return idx >= 0 ? plan.weeklySchedule[idx].target : plan.currentDailyTarget;
    })();

    const todayLog = plan.logs.find((l) => {
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

const updatePlan = async (req, res) => {
  try {
    const {
      unit,
      baselineDaily,
      baselineQuantity,
      frequency,
      pricePerUnit,
      currency,
      firstDoseMinutes,
      urgeMap,
    } = req.body;

    const allowedUpdates = {};
    if (unit !== undefined) allowedUpdates.unit = unit;
    if (frequency !== undefined) allowedUpdates.frequency = frequency;

    if (baselineQuantity !== undefined || baselineDaily !== undefined) {
      const qty = Math.max(0.01, Number(baselineQuantity || baselineDaily) || 1);
      allowedUpdates.baselineQuantity = qty;
      allowedUpdates.baselineDaily = calculateNormalizedDaily(qty, frequency || 'daily');
    }

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

const deletePlan = async (req, res) => {
  try {
    const plan = await RescuerPlan.findOneAndDelete({
      _id: req.params.planId,
      userId: req.user._id,
    });
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });
    res.json({ success: true, message: 'Plan deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getPlans,
  getPlan,
  getPlanById,
  createPlan,
  logDay,
  logExtra,
  logUrgeResisted,
  updatePlan,
  deletePlan,
};
