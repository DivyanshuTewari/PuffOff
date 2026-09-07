const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Addiction = require('../models/Addiction');
const CheckIn = require('../models/CheckIn');
const UsageLog = require('../models/UsageLog');
const RescuerPlan = require('../models/RescuerPlan');

// Controllers
const authController = require('../controllers/authController');
const checkInController = require('../controllers/checkInController');
const rescuerController = require('../controllers/rescuerController');
const addictionController = require('../controllers/addictionController');
const usageLogController = require('../controllers/usageLogController');

function mockRes() {
  const res = {
    statusCode: 200,
    data: null,
    cookieName: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.data = payload;
      return this;
    },
    cookie(name, val) {
      this.cookieName = name;
      return this;
    },
  };
  return res;
}

async function runSecurityTests() {
  console.log('Connecting to MongoDB for security tests...');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connected.');

  const testUserA = new mongoose.Types.ObjectId();
  const testUserB = new mongoose.Types.ObjectId();

  let addictionA = null;

  try {
    // Setup test addiction for User A
    addictionA = await Addiction.create({
      userId: testUserA,
      viceName: 'nicotine',
      customName: 'User A Habit',
      dailySpending: 5,
      currency: 'USD',
    });

    // ── Test 1: NoSQL Injection Defense on Login ──
    console.log('\n--- 1. Testing NoSQL Query Injection Defense ---');
    const req1 = { body: { email: { $ne: null }, password: 'password123' } };
    const res1 = mockRes();
    await authController.login(req1, res1);
    if (res1.statusCode !== 400) {
      throw new Error(`Expected 400 for NoSQL injection object in login, got ${res1.statusCode}`);
    }
    console.log('✔ Blocked NoSQL injection attempt (returned 400)');

    // ── Test 2: Password Minimum Length Defense ──
    console.log('\n--- 2. Testing Password Length Validation ---');
    const req2 = { body: { username: 'shortpwuser', email: 'shortpw@test.com', password: '123' } };
    const res2 = mockRes();
    await authController.register(req2, res2);
    if (res2.statusCode !== 400) {
      throw new Error(`Expected 400 for password < 6 chars, got ${res2.statusCode}`);
    }
    console.log('✔ Enforced password minimum length of 6 characters');

    // ── Test 3: IDOR Defense on CheckIn Creation ──
    console.log('\n--- 3. Testing IDOR Defense on CheckIn Creation ---');
    // User B tries to log check-in against User A's addiction
    const req3 = {
      user: { _id: testUserB },
      body: { addictionId: addictionA._id, urgeMeter: 7, mood: 'bad' },
    };
    const res3 = mockRes();
    await checkInController.createCheckIn(req3, res3);
    if (res3.statusCode !== 404) {
      throw new Error(`Expected 404 unauthorized addiction access, got ${res3.statusCode}`);
    }
    console.log('✔ Successfully blocked IDOR on CheckIn: User B cannot access User A addiction');

    // ── Test 4: IDOR Defense on Rescuer Plan Creation ──
    console.log('\n--- 4. Testing IDOR Defense on Rescuer Plan Creation ---');
    // User B tries to create Rescuer Plan on User A's addiction
    const req4 = {
      user: { _id: testUserB },
      body: { addictionId: addictionA._id, baselineQuantity: 10 },
    };
    const res4 = mockRes();
    await rescuerController.createPlan(req4, res4);
    if (res4.statusCode !== 404) {
      throw new Error(`Expected 404 for Rescuer plan IDOR attempt, got ${res4.statusCode}`);
    }
    console.log('✔ Successfully blocked IDOR on Rescuer: User B cannot create plan on User A addiction');

    // ── Test 5: Mass-Assignment Immunity on Addiction Update ──
    console.log('\n--- 5. Testing Mass-Assignment Immunity ---');
    const req5 = {
      user: { _id: testUserA },
      params: { id: addictionA._id },
      body: { customName: 'Updated Name Safe', userId: testUserB, maliciousField: 'injected' },
    };
    const res5 = mockRes();
    await addictionController.updateAddiction(req5, res5);
    const refreshedA = await Addiction.findById(addictionA._id);
    if (String(refreshedA.userId) !== String(testUserA)) {
      throw new Error('Mass assignment allowed userId overwrite!');
    }
    if (refreshedA.customName !== 'Updated Name Safe') {
      throw new Error('Legitimate update failed');
    }
    console.log('✔ Mass assignment prevented: userId was preserved, malicious fields discarded');

    // ── Test 6: UsageLog Non-Positive Quantity Rejection ──
    console.log('\n--- 6. Testing UsageLog Quantity Validation ---');
    const req6 = {
      user: { _id: testUserA },
      body: { addictionId: addictionA._id, quantity: -2 },
    };
    const res6 = mockRes();
    await usageLogController.createLog(req6, res6);
    if (res6.statusCode !== 400) {
      throw new Error(`Expected 400 for negative quantity, got ${res6.statusCode}`);
    }
    console.log('✔ UsageLog rejected negative quantity (returned 400)');

    console.log('\n=========================================');
    console.log('ALL SECURITY & VALIDATION TESTS PASSED 100%!');
    console.log('=========================================\n');
  } finally {
    console.log('Cleaning up test data...');
    await Addiction.deleteMany({ userId: { $in: [testUserA, testUserB] } });
    await CheckIn.deleteMany({ userId: { $in: [testUserA, testUserB] } });
    await UsageLog.deleteMany({ userId: { $in: [testUserA, testUserB] } });
    await RescuerPlan.deleteMany({ userId: { $in: [testUserA, testUserB] } });
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

runSecurityTests().catch((err) => {
  console.error('Security test failed:', err);
  process.exit(1);
});
