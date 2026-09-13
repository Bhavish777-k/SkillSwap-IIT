import assert from 'node:assert';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { calculateMatchScore } from './utils/matchingAlgorithm.js';
import { generateToken, sendTokenResponse } from './utils/tokenUtils.js';
import * as authMiddleware from './middlewares/authMiddleware.js';
import errorHandler from './middlewares/errorHandler.js';
import * as validator from './middlewares/validator.js';
import User from './models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = __dirname;

const log = (...args) => console.log('[WHITEBOX]', ...args);

const testResults = {
  'Matching Algorithm': [],
  'Token Utils': [],
  'Auth Middleware': [],
  'Error Handler': [],
  'Validator Module': [],
  'User Model': [],
  'Route Modules': [],
  'Module Imports': []
};

const addTestResult = (module, testName, passed) => {
  if (!testResults[module]) {
    testResults[module] = [];
  }
  testResults[module].push({ testName, passed });
};

const makeResMock = () => {
  let statusCode = 200;
  let body = {};
  return {
    status(code) {
      statusCode = code;
      return this;
    },
    json(obj) {
      body = obj;
      return this;
    },
    get result() {
      return { statusCode, body };
    }
  };
};

const makeReqMock = (headers = {}) => ({ headers, body: {}, params: {}, query: {}, user: null });

const makeNextMock = () => {
  let called = false;
  const fn = () => { called = true; };
  fn.wasCalled = () => called;
  return fn;
};

async function testMatchingAlgorithm() {
  log('Testing matching algorithm...');

  const currentUser = {
    skillsOffered: ['skillA'],
    skillsNeeded: ['skillB'],
    availability: { days: ['Monday', 'Wednesday'], timeSlots: ['Morning', 'Evening'] },
    rating: { average: 3 },
    isPremium: false
  };

  const potentialMatch = {
    skillsOffered: ['skillB'],
    skillsNeeded: ['skillA'],
    availability: { days: ['Monday'], timeSlots: ['Morning'] },
    rating: { average: 5 },
    isPremium: true
  };

  const score = calculateMatchScore(currentUser, potentialMatch);
  assert.strictEqual(score, 85, `Expected score 85, got ${score}`);
  addTestResult('Matching Algorithm', 'calculateMatchScore returns expected value', true);
  log('✔ calculateMatchScore returns expected value');
}

async function testTokenUtils() {
  log('Testing token utils...');

  process.env.JWT_SECRET = 'whiteboxtestsecret';
  const token = generateToken('userId123');
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  assert.strictEqual(decoded.id, 'userId123');
  addTestResult('Token Utils', 'generateToken creates valid JWT', true);

  const user = {
    _id: 'userId123',
    toObject() {
      return { _id: 'userId123', password: 'secret', name: 'Bob' };
    }
  };

  const res = makeResMock();
  sendTokenResponse(user, 201, res, 'Test token');
  assert.strictEqual(res.result.statusCode, 201);
  assert.strictEqual(res.result.body.success, true);
  assert.ok(res.result.body.token, 'Expected token in response');
  assert.strictEqual(res.result.body.user.password, undefined);
  addTestResult('Token Utils', 'sendTokenResponse returns token with masked password', true);

  log('✔ generateToken and sendTokenResponse behave correctly');
}

async function testAuthMiddleware() {
  log('Testing auth middleware...');

  process.env.JWT_SECRET = 'whiteboxtestsecret';

  const reqNoToken = makeReqMock();
  const resNoToken = makeResMock();
  const nextNoToken = makeNextMock();
  await authMiddleware.protect(reqNoToken, resNoToken, nextNoToken);
  assert.strictEqual(resNoToken.result.statusCode, 401);
  assert.strictEqual(resNoToken.result.body.success, false);
  addTestResult('Auth Middleware', 'protect rejects request without token', true);
  log('✔ protect rejects request without token');

  const reqInvalidToken = makeReqMock({ authorization: 'Bearer invalid-token' });
  const resInvalidToken = makeResMock();
  const nextInvalidToken = makeNextMock();
  await authMiddleware.protect(reqInvalidToken, resInvalidToken, nextInvalidToken);
  assert.strictEqual(resInvalidToken.result.statusCode, 401);
  assert.strictEqual(resInvalidToken.result.body.success, false);
  addTestResult('Auth Middleware', 'protect rejects invalid token', true);
  log('✔ protect rejects invalid token');

  const authFn = authMiddleware.authorize('student');
  const reqAuth = { user: { role: 'student' } };
  const resAuth = makeResMock();
  const nextAuth = makeNextMock();
  authFn(reqAuth, resAuth, nextAuth);
  assert.strictEqual(nextAuth.wasCalled(), true);
  addTestResult('Auth Middleware', 'authorize allows permitted role', true);
  log('✔ authorize allows permitted role');

  const authFnBlocked = authMiddleware.authorize('admin');
  const resAuthBlocked = makeResMock();
  const nextAuthBlocked = makeNextMock();
  authFnBlocked(reqAuth, resAuthBlocked, nextAuthBlocked);
  assert.strictEqual(resAuthBlocked.result.statusCode, 403);
  addTestResult('Auth Middleware', 'authorize rejects unauthorized role', true);
  log('✔ authorize rejects unauthorized role');

  const reqOptionalNoToken = makeReqMock();
  const resOptionalNoToken = makeResMock();
  const nextOptionalNoToken = makeNextMock();
  await authMiddleware.optionalAuth(reqOptionalNoToken, resOptionalNoToken, nextOptionalNoToken);
  assert.strictEqual(nextOptionalNoToken.wasCalled(), true);
  addTestResult('Auth Middleware', 'optionalAuth continues without token', true);
  log('✔ optionalAuth continues without token');

  const reqOptionalInvalid = makeReqMock({ authorization: 'Bearer invalid-token' });
  const resOptionalInvalid = makeResMock();
  const nextOptionalInvalid = makeNextMock();
  await authMiddleware.optionalAuth(reqOptionalInvalid, resOptionalInvalid, nextOptionalInvalid);
  assert.strictEqual(nextOptionalInvalid.wasCalled(), true);
  addTestResult('Auth Middleware', 'optionalAuth continues with invalid token', true);
  log('✔ optionalAuth continues with invalid token');
}

function testErrorHandler() {
  log('Testing error handler...');

  const originalConsoleError = console.error;
  console.error = () => {};

  try {
    const err = { name: 'CastError', message: 'Invalid ObjectId' };
    const res = makeResMock();
    errorHandler(err, {}, res, () => {});
    assert.strictEqual(res.result.statusCode, 404);
    assert.strictEqual(res.result.body.message, 'Resource not found');
    addTestResult('Error Handler', 'errorHandler maps CastError to 404', true);

    log('✔ errorHandler maps CastError to a 404 response');
  } finally {
    console.error = originalConsoleError;
  }
}

async function testValidatorModule() {
  log('Testing validator module...');
  assert.strictEqual(typeof validator.validate, 'function');
  addTestResult('Validator Module', 'validator exports a validate function', true);
  log('✔ validator exports a validate function');
}

async function testUserModelMethods() {
  log('Testing User model methods...');

  const hashedPassword = await bcrypt.hash('password123', 10);
  const user = new User({
    name: 'Test User',
    email: 'test@example.com',
    password: hashedPassword
  });

  assert.strictEqual(await user.comparePassword('password123'), true);
  addTestResult('User Model', 'User.comparePassword validates password correctly', true);

  const profile = user.getPublicProfile();
  assert.strictEqual(profile.password, undefined);
  assert.strictEqual(profile.email, 'test@example.com');
  addTestResult('User Model', 'User.getPublicProfile masks password', true);

  log('✔ User.comparePassword and getPublicProfile behave correctly');
}

async function testRouteImports() {
  log('Testing route modules import...');

  const routeDir = path.join(root, 'routes');
  const files = await listJsFiles(routeDir);
  for (const file of files) {
    const module = await import(pathToFileURL(file).href);
    assert.ok(module.default, `${path.relative(root, file)} should default-export a router`);
  }
  addTestResult('Route Modules', `All ${files.length} route modules import correctly`, true);

  log('✔ route modules import successfully');
}

async function testModuleImports() {
  log('Scanning module exports across server modules...');
  const baseDirs = ['controllers', 'middlewares', 'utils', 'routes', 'models', 'config'];
  const report = [];
  let totalModules = 0;

  for (const dir of baseDirs) {
    const fullDir = path.join(root, dir);
    const files = await listJsFiles(fullDir);
    for (const file of files) {
      const relativeFile = path.relative(root, file);
      const normalizedRelativeFile = relativeFile.replace(/\\/g, '/');

      if (normalizedRelativeFile === 'utils/seedData.js') {
        report.push({ file: relativeFile, exports: ['<none>'] });
        continue;
      }

      const module = await import(pathToFileURL(file).href);
      const keys = Object.keys(module);
      report.push({ file: relativeFile, exports: keys.length ? keys : ['<none>'] });
      totalModules++;

      assert.ok(keys.length > 0 || module.default, `${relativeFile} should export symbols`);
      if (dir === 'controllers') {
        const functionKeys = keys.filter((key) => typeof module[key] === 'function');
        assert.ok(functionKeys.length > 0, `${relativeFile} should export controller functions`);
      }
      if (dir === 'routes') {
        assert.ok(module.default, `${relativeFile} should default-export a router`);
      }
      if (dir === 'models') {
        assert.ok(module.default && module.default.modelName, `${relativeFile} should export a Mongoose model`);
      }
    }
  }
  addTestResult('Module Imports', `All ${totalModules} backend modules import correctly`, true);

  log('✔ module import verification passed for all scanned backend files');
  for (const entry of report) {
    log(`  ${entry.file}: ${entry.exports.join(', ')}`);
  }
}

async function listJsFiles(dir) {
  const results = [];
  const items = await fs.readdir(dir, { withFileTypes: true });
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      results.push(...await listJsFiles(fullPath));
    } else if (item.isFile() && fullPath.endsWith('.js') && !fullPath.endsWith('whitebox-test.js')) {
      results.push(fullPath);
    }
  }
  return results;
}

function printReport() {
  log('\n═══════════════════════════════════════════════════════════════');
  log('                    WHITEBOX TEST REPORT                         ');
  log('═══════════════════════════════════════════════════════════════\n');

  let totalTests = 0;
  let totalPassed = 0;

  for (const [module, tests] of Object.entries(testResults)) {
    if (tests.length === 0) continue;

    const passCount = tests.filter(t => t.passed).length;
    const failCount = tests.filter(t => !t.passed).length;
    totalTests += tests.length;
    totalPassed += passCount;

    const status = failCount === 0 ? '✅ PASSED' : '❌ FAILED';
    log(`${status}  ${module} (${passCount}/${tests.length})`);

    for (const test of tests) {
      const mark = test.passed ? '  ✔' : '  ✗';
      log(`${mark}  ${test.testName}`);
    }
    log('');
  }

  log('═══════════════════════════════════════════════════════════════');
  log(`TOTAL:   ${totalPassed}/${totalTests} test cases passed`);
  log('═══════════════════════════════════════════════════════════════\n');
}

async function runAllTests() {
  log('Starting white-box tests for server modules...\n');
  await testMatchingAlgorithm();
  await testTokenUtils();
  await testAuthMiddleware();
  testErrorHandler();
  await testValidatorModule();
  await testUserModelMethods();
  await testRouteImports();
  await testModuleImports();
  
  printReport();
}

runAllTests().catch((error) => {
  console.error('[WHITEBOX] TEST FAILED:', error);
  process.exit(1);
});

