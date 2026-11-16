// End-to-End Verification Test for Webby Classroom Sync Fix
import http from 'http';

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function runTests() {
  console.log('🚀 Starting WEBBY CLASSROOM SYNC FIX End-to-End Test Suite...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${message}`);
      failed++;
    }
  }

  try {
    // 1. Test Network Info API
    console.log('--- 1. Testing Network Discovery API ---');
    const netRes = await request({
      hostname: 'localhost',
      port: 3001,
      path: '/api/network-info',
      method: 'GET'
    });
    assert(netRes.status === 200, 'GET /api/network-info returns 200 OK');
    assert(netRes.data.success === true, 'Response indicates success');
    assert(typeof netRes.data.lanIp === 'string' && netRes.data.lanIp.length > 0, `Detected true LAN IP: ${netRes.data.lanIp}`);
    assert(netRes.data.mobileConnectUrl.includes(netRes.data.lanIp), `Mobile connect URL points to LAN IP: ${netRes.data.mobileConnectUrl}`);

    // 2. Test Room Initialization & Fetch
    console.log('\n--- 2. Testing Room State & Class Binding ---');
    const roomRes = await request({
      hostname: 'localhost',
      port: 3001,
      path: '/api/classroom/rooms/WB-601',
      method: 'GET'
    });
    const room = roomRes.data.room || roomRes.data;
    assert(roomRes.status === 200, 'GET /api/classroom/rooms/WB-601 returns 200 OK');
    assert(room.roomCode === 'WB-601', 'Room code is WB-601');
    assert(typeof room.classId === 'string' && room.classId.length > 0, `Active class ID: ${room.classId}`);
    assert(typeof room.className === 'string' && room.className.length > 0, `Active class name: ${room.className}`);
    assert(room.totalStudents > 0, `Class has ${room.totalStudents} students`);

    // 3. Test Room Lifecycle: Start Room
    console.log('\n--- 3. Testing Room Lifecycle (Start Room) ---');
    const startRes = await request({
      hostname: 'localhost',
      port: 3001,
      path: '/api/classroom/rooms/WB-601/start',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    assert(startRes.status === 200, 'POST /api/classroom/rooms/WB-601/start returns 200 OK');
    assert(startRes.data.room.status === 'ACTIVE', 'Room status updated to ACTIVE');

    // 4. Test Setting Question
    console.log('\n--- 4. Testing Question Activation ---');
    const testQuestion = {
      id: 'Q_SYNC_01',
      questionText: 'Mạng toàn cầu World Wide Web (WWW) hoạt động trên nền tảng nào?',
      options: {
        A: 'Mạng LAN cục bộ trường học',
        B: 'Nền tảng Internet',
        C: 'Đĩa mềm máy tính',
        D: 'Mạng Bluetooth'
      },
      correctAnswer: 'B',
      explanation: 'WWW hoạt động trên nền tảng Internet.'
    };
    const qRes = await request({
      hostname: 'localhost',
      port: 3001,
      path: '/api/classroom/rooms/WB-601/question',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { question: testQuestion });
    assert(qRes.status === 200, 'POST /api/classroom/rooms/WB-601/question returns 200 OK');
    assert(qRes.data.room.questionState === 'COLLECTING', 'Room state is COLLECTING');
    assert(Object.keys(qRes.data.room.responses).length === 0, 'Previous responses cleared for new question');

    // 5. Test Live Card Scanning Auto-sync (Webby QR & Quizizz ArUco)
    console.log('\n--- 5. Testing Instant Scanner Auto-sync & Upsert ---');
    const batchScan = [
      {
        cardId: 'CARD_0001',
        answer: 'B',
        angle: 90,
        cardType: 'Webby QR'
      },
      {
        cardId: 'CARD_0002',
        quizizzCode: 'P 2',
        answer: 'A',
        angle: 0,
        cardType: 'Quizizz Q-Card'
      },
      {
        cardId: 'CARD_0003',
        answer: 'B',
        angle: 90,
        cardType: 'Webby QR'
      }
    ];

    const submitRes = await request({
      hostname: 'localhost',
      port: 3001,
      path: '/api/classroom/rooms/WB-601/responses',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { responses: batchScan });

    assert(submitRes.status === 200, 'POST /api/classroom/rooms/WB-601/responses returns 200 OK');
    assert(submitRes.data.success === true, 'Submit returns success: true');
    assert(submitRes.data.totalAnswered === 3, 'Total answered count is 3');
    assert(submitRes.data.room.responses['CARD_0001'].answer === 'B', 'Student CARD_0001 submitted B (Correct)');
    assert(submitRes.data.room.responses['CARD_0002'].answer === 'A', 'Student CARD_0002 (Quizizz P 2) submitted A');

    // Test Upsert / Revision (Student 2 rotates card from A to B)
    console.log('\n--- 6. Testing Card Rotation & Answer Change (Upsert) ---');
    const rotateScan = [
      {
        cardId: 'CARD_0002',
        quizizzCode: 'P 2',
        answer: 'B',
        angle: 90,
        cardType: 'Quizizz Q-Card'
      }
    ];
    const updateRes = await request({
      hostname: 'localhost',
      port: 3001,
      path: '/api/classroom/rooms/WB-601/responses',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { responses: rotateScan });

    assert(updateRes.data.success === true, 'Card rotation update accepted');
    assert(updateRes.data.room.responses['CARD_0002'].answer === 'B', 'CARD_0002 answer changed from A to B');
    assert(updateRes.data.room.responses['CARD_0002'].revision === 2, 'CARD_0002 revision is now 2');
    assert(updateRes.data.room.responses['CARD_0002'].previousAnswer === 'A', 'CARD_0002 previousAnswer was recorded as A');

    // 7. Test Locking Question
    console.log('\n--- 7. Testing Question Locking & Enforcement ---');
    const lockRes = await request({
      hostname: 'localhost',
      port: 3001,
      path: '/api/classroom/rooms/WB-601/lock',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    assert(lockRes.status === 200, 'POST /api/classroom/rooms/WB-601/lock returns 200 OK');
    assert(lockRes.data.room.questionState === 'LOCKED', 'Question state is LOCKED');

    // Verify rejection of new scans after lock
    const lateScan = [{ cardId: 'CARD_0004', answer: 'C' }];
    const lateRes = await request({
      hostname: 'localhost',
      port: 3001,
      path: '/api/classroom/rooms/WB-601/responses',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { responses: lateScan });
    assert(lateRes.data.success === false, 'Late scan rejected by server');
    assert(lateRes.data.locked === true, 'Server explicitly returns locked: true');

    // 8. Test Reveal Answer
    console.log('\n--- 8. Testing Answer Reveal & Analytics ---');
    const revealRes = await request({
      hostname: 'localhost',
      port: 3001,
      path: '/api/classroom/rooms/WB-601/reveal',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    assert(revealRes.status === 200, 'POST /api/classroom/rooms/WB-601/reveal returns 200 OK');
    assert(revealRes.data.room.questionState === 'REVEALED', 'Question state is REVEALED');
    assert(revealRes.data.room.responses['CARD_0001'].isCorrect === true, 'CARD_0001 is evaluated as isCorrect: true');
    assert(revealRes.data.room.responses['CARD_0002'].isCorrect === true, 'CARD_0002 is evaluated as isCorrect: true');
    assert(revealRes.data.room.analytics.percentageCorrectOnAnswered === 100, 'All answered students got correct answer: percentageCorrectOnAnswered 100%');

    console.log(`\n========================================`);
    console.log(`TEST SUITE RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log(`========================================\n`);
    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Fatal test error:', err);
    process.exit(1);
  }
}

runTests();
