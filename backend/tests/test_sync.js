const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Addiction = require('../models/Addiction');
const RescuerPlan = require('../models/RescuerPlan');
const UsageLog = require('../models/UsageLog');
const {
  toMidnightUTC,
  syncTrackerToRescuer,
  syncRescuerToTracker,
  syncRelapse,
  syncDeleteAddiction,
} = require('../services/syncService');

async function runTests() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connected successfully.');

  const testUserId = new mongoose.Types.ObjectId();
  let testAddiction = null;
  let testPlan = null;

  try {
    // 1. Create test Addiction
    testAddiction = await Addiction.create({
      userId: testUserId,
      viceName: 'nicotine',
      customName: 'Sync Test Cigarettes',
      dailySpending: 10,
      currency: 'USD',
      lastRelapseDate: new Date(Date.now() - 3 * 86400000), // 3 days ago
    });
    console.log('✔ Created test addiction:', testAddiction._id);

    // 2. Create test Rescuer Plan
    const todayMidnight = toMidnightUTC(new Date());
    testPlan = await RescuerPlan.create({
      userId: testUserId,
      addictionId: testAddiction._id,
      frequency: 'daily',
      baselineQuantity: 10,
      baselineDaily: 10,
      pricePerUnit: 1,
      currentDailyTarget: 8,
      weekStartDate: todayMidnight,
      weeklySchedule: [
        { day: 0, date: todayMidnight, target: 8, targetNote: 'Session target' },
      ],
      logs: [],
    });
    console.log('✔ Created test Rescuer plan with target 8:', testPlan._id);

    // 3. Test syncTrackerToRescuer (Simulate Tracker user logging 5 units)
    console.log('\n--- Testing Tracker -> Rescuer Sync ---');
    const updatedPlan = await syncTrackerToRescuer(
      testUserId,
      testAddiction._id,
      new Date(),
      5,
      5,
      '5 cigarettes smoked'
    );
    if (!updatedPlan) throw new Error('syncTrackerToRescuer returned null');
    const todayLog = updatedPlan.logs.find(
      (l) => toMidnightUTC(l.date).getTime() === todayMidnight.getTime()
    );
    if (!todayLog || todayLog.consumed !== 5) {
      throw new Error(`Expected consumed to be 5, got ${todayLog?.consumed}`);
    }
    console.log('✔ Rescuer plan updated with Tracker consumed = 5');

    // Test Tracker logging over target triggers holdDays
    await syncTrackerToRescuer(testUserId, testAddiction._id, new Date(), 5, 5, 'Another 5');
    const planWithHold = await RescuerPlan.findById(testPlan._id);
    const todayLog2 = planWithHold.logs.find(
      (l) => toMidnightUTC(l.date).getTime() === todayMidnight.getTime()
    );
    if (todayLog2.consumed !== 10 || planWithHold.holdDays !== 2) {
      throw new Error(`Expected consumed=10, holdDays=2; got consumed=${todayLog2.consumed}, holdDays=${planWithHold.holdDays}`);
    }
    console.log('✔ Rescuer triggered holdDays = 2 when consumption exceeded target 8');

    // 4. Test syncRescuerToTracker (Simulate Rescuer user logging 2 units)
    console.log('\n--- Testing Rescuer -> Tracker Sync ---');
    const createdUsageLog = await syncRescuerToTracker(
      testUserId,
      testAddiction._id,
      new Date(),
      2,
      1,
      'Logged via Rescuer',
      false
    );
    if (!createdUsageLog || createdUsageLog.quantity !== 2) {
      throw new Error(`Expected usage log quantity 2, got ${createdUsageLog?.quantity}`);
    }
    const foundUsageLog = await UsageLog.findById(createdUsageLog._id);
    if (!foundUsageLog) throw new Error('UsageLog not persisted in database');
    console.log('✔ UsageLog successfully created in Tracker for Rescuer consumption');

    // 5. Test syncRelapse (Simulate manual relapse button on Dashboard)
    console.log('\n--- Testing Relapse Sync across Dashboard, Tracker & Rescuer ---');
    const relapseSync = await syncRelapse(testUserId, testAddiction._id, 'Felt stressed');
    if (!relapseSync || !relapseSync.usageLog || !relapseSync.plan) {
      throw new Error('syncRelapse failed to create usageLog and update plan');
    }
    if (relapseSync.plan.holdDays < 4) {
      throw new Error(`Expected holdDays to increment to at least 4, got ${relapseSync.plan.holdDays}`);
    }
    console.log('✔ Dashboard relapse successfully created Tracker entry and extended Rescuer holdDays to:', relapseSync.plan.holdDays);

    // 6. Test syncDeleteAddiction
    console.log('\n--- Testing Delete Addiction Sync ---');
    await syncDeleteAddiction(testUserId, testAddiction._id);
    const deactivatedPlan = await RescuerPlan.findById(testPlan._id);
    if (deactivatedPlan.isActive !== false) {
      throw new Error('Expected RescuerPlan isActive to be false');
    }
    console.log('✔ RescuerPlan automatically deactivated upon vice deletion');

    console.log('\n=========================================');
    console.log('ALL SYNCHRONIZATION TESTS PASSED 100%!');
    console.log('=========================================\n');
  } finally {
    // Cleanup test data
    console.log('Cleaning up test data...');
    if (testAddiction) await Addiction.deleteMany({ userId: testUserId });
    if (testPlan) await RescuerPlan.deleteMany({ userId: testUserId });
    await UsageLog.deleteMany({ userId: testUserId });
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

runTests().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
