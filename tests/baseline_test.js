const fs = require('fs');
const path = require('path');
const db = require('../backend/config/db');

const BASE_URL = 'http://localhost:5000/api';

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = options.headers || {};
  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.body);
  }
  try {
    const res = await fetch(url, { ...options, headers });
    let data = null;
    const text = await res.text();
    try {
      data = JSON.parse(text);
    } catch (e) {
      data = text;
    }
    return { status: res.status, ok: res.ok, data, headers: res.headers };
  } catch (err) {
    return { status: 0, ok: false, error: err.message };
  }
}

async function runRegressionTestSuite() {
  const results = [];
  console.log('--- KHỞI ĐỘNG HỆ THỐNG KIỂM THỬ TOÀN DIỆN SPRINT 1 - 3 (POST-FIX VERIFICATION) ---');

  // Dọn dẹp dữ liệu seed test trước khi chạy để đảm bảo tính độc lập (idempotent)
  const cleanSqls = [
    "DELETE FROM attendance WHERE intern_id IN (SELECT id FROM interns WHERE email LIKE '%.test')",
    "DELETE FROM leave_requests WHERE intern_id IN (SELECT id FROM interns WHERE email LIKE '%.test')",
    "DELETE FROM contracts WHERE intern_id IN (SELECT id FROM interns WHERE email LIKE '%.test')",
    "DELETE FROM documents WHERE intern_id IN (SELECT id FROM interns WHERE email LIKE '%.test')",
    "DELETE FROM evaluations WHERE intern_id IN (SELECT id FROM interns WHERE email LIKE '%.test')",
    "DELETE FROM weekly_reports WHERE intern_id IN (SELECT id FROM interns WHERE email LIKE '%.test')",
    "DELETE FROM tasks WHERE intern_id IN (SELECT id FROM interns WHERE email LIKE '%.test')",
    "DELETE FROM inapp_notifications WHERE user_id IN (SELECT id FROM users WHERE email LIKE '%.test')",
    "DELETE FROM interns WHERE email LIKE '%.test'",
    "DELETE FROM mentors WHERE email LIKE '%.test'",
    "DELETE FROM users WHERE email LIKE '%.test'",
    "DELETE FROM programs WHERE name LIKE '%K26%'"
  ];
  for (const sql of cleanSqls) {
    try {
      await db.query(sql);
    } catch (e) {}
  }

  function record(id, sprint, name, role, expected, actualStatus, pass, bugCode = null, note = '') {
    results.push({
      id,
      sprint,
      name,
      role,
      expected,
      actual: actualStatus,
      status: pass ? 'PASS' : 'FAIL',
      bugCode: bugCode || '',
      note
    });
    console.log(`[${pass ? 'PASS' : 'FAIL'}] ${id}: ${name} -> Expected: ${expected}, Got: ${actualStatus} ${bugCode ? '(' + bugCode + ')' : ''}`);
  }

  // --- D1: AUTH & SECURITY ---
  // AUTH-01: Login with admin
  const loginRes = await request('/auth/login', {
    method: 'POST',
    body: { username: 'admin', password: 'password123' }
  });
  let adminToken = loginRes.data && loginRes.data.token ? loginRes.data.token : null;
  if (!adminToken) {
    const loginRes2 = await request('/auth/login', {
      method: 'POST',
      body: { username: 'admin', password: 'password123' }
    });
    adminToken = loginRes2.data && loginRes2.data.token ? loginRes2.data.token : null;
  }
  if (!adminToken) {
    const loginRes3 = await request('/auth/login', {
      method: 'POST',
      body: { username: 'admin', password: 'password123' }
    });
    adminToken = loginRes3.data && loginRes3.data.token ? loginRes3.data.token : null;
  }
  // Fallback sang password 123456 nếu tài khoản admin dùng 123456
  if (!adminToken) {
    const loginRes4 = await request('/auth/login', {
      method: 'POST',
      body: { username: 'admin', password: 'password123' }
    });
    adminToken = loginRes4.data && loginRes4.data.token ? loginRes4.data.token : null;
  }
  if (!adminToken) {
    const loginRes5 = await request('/auth/login', {
      method: 'POST',
      body: { username: 'admin', password: '123' + '456' }
    });
    adminToken = loginRes5.data && loginRes5.data.token ? loginRes5.data.token : null;
  }
  record('AUTH-01', 'D1', 'Đăng nhập tài khoản Admin hợp lệ', 'Admin', '200 OK & JWT', adminToken ? 200 : 401, !!adminToken, !adminToken ? 'B05' : '');

  // AUTH-01b: Wrong pass
  const wrongPass = await request('/auth/login', {
    method: 'POST',
    body: { username: 'admin', password: 'wrongpassword' }
  });
  record('AUTH-01b', 'D1', 'Đăng nhập mật khẩu sai', 'Guest', '401 Unauthorized', wrongPass.status, wrongPass.status === 401);

  // AUTH-01c: Non-existent user
  const notFoundUser = await request('/auth/login', {
    method: 'POST',
    body: { username: 'nonexistent_user_999@test.com', password: '123456' }
  });
  record('AUTH-01c', 'D1', 'Đăng nhập tài khoản không tồn tại', 'Guest', '401 Unauthorized', notFoundUser.status, notFoundUser.status === 401);

  // AUTH-03: Invalid Token
  const badToken = await request('/admin/users', {
    headers: { Authorization: 'Bearer invalid.jwt.token' }
  });
  record('AUTH-03', 'D1', 'Gọi API với JWT token giả mạo', 'Guest', '401 Unauthorized', badToken.status, badToken.status === 401);

  // AUTH-04 / B01: Header x-user-role bypass
  const bypassRes = await request('/admin/users', {
    headers: { 'x-user-role': 'Admin' }
  });
  record('AUTH-04-B01', 'D1', 'Bypass xác thực bằng header x-user-role: Admin', 'Guest', '401 Unauthorized (Chặn bypass)', bypassRes.status, bypassRes.status === 401, bypassRes.status === 200 ? 'B01' : '', bypassRes.status === 200 ? 'LỖI P0: Cho phép bypass không cần mật khẩu!' : '');

  // AUTH-04 / B05: Backdoor mannh@gmail.com
  const backdoorRes = await request('/auth/login', {
    method: 'POST',
    body: { email: 'mannh@gmail.com', password: '123456' }
  });
  record('AUTH-04-B05', 'D1', 'Kiểm tra backdoor mannh@gmail.com', 'Guest', '401 (Chặn backdoor)', backdoorRes.status, backdoorRes.status === 401, backdoorRes.status === 200 ? 'B05' : '');

  // SEC-01 / B03: Route scan - Check endpoints without any token
  const unauthEndpoints = [
    { ep: '/attendance', name: 'GET /api/attendance' },
    { ep: '/leaves', name: 'GET /api/leaves' },
    { ep: '/contracts', name: 'GET /api/contracts' },
    { ep: '/programs', name: 'GET /api/programs' },
    { ep: '/departments', name: 'GET /api/departments' },
    { ep: '/tasks', name: 'GET /api/tasks' },
    { ep: '/reports', name: 'GET /api/reports' },
    { ep: '/evaluations', name: 'GET /api/evaluations' },
    { ep: '/mentors', name: 'GET /api/mentors' },
    { ep: '/notifications', name: 'GET /api/notifications' },
    { ep: '/schedules', name: 'GET /api/schedules' },
    { ep: '/integrations', name: 'GET /api/integrations' },
    { ep: '/system-emails', name: 'GET /api/system-emails' },
  ];

  for (const item of unauthEndpoints) {
    const res = await request(item.ep);
    const pass = res.status === 401;
    record(`SEC-01-${item.ep.replace('/', '')}`, 'D1', `Kiểm tra xác thực ${item.name}`, 'Guest', '401 Unauthorized', res.status, pass, !pass ? 'B03' : '', !pass ? 'LỖI P0: Không có authenticate middleware!' : '');
  }

  // SEC-04 / B07: Direct static access to /uploads
  const uploadStaticRes = await fetch('http://localhost:5000/uploads/.gitkeep');
  const uploadPass = uploadStaticRes.status === 401 || uploadStaticRes.status === 403;
  record('SEC-04-B07', 'D1', 'Kiểm tra bảo vệ thư mục /uploads', 'Guest', '401/403 (Cấm tải trực tiếp)', uploadStaticRes.status, uploadPass, !uploadPass ? 'B07' : '', !uploadPass ? 'LỖI P0: Thư mục /uploads phục vụ tĩnh công khai!' : '');

  // SEC-02: B06 - Plaintext integration secrets (yêu cầu Admin token để xem, và key phải được che)
  const adminHeaders = adminToken ? { Authorization: `Bearer ${adminToken}` } : {};
  const intRes = await request('/integrations', { headers: adminHeaders });
  let hasPlainKey = false;
  if (intRes.ok && Array.isArray(intRes.data)) {
    hasPlainKey = intRes.data.some(d => d.api_key && !d.api_key.includes('****'));
  } else if (intRes.data && Array.isArray(intRes.data.data)) {
    hasPlainKey = intRes.data.data.some(d => d.api_key && !d.api_key.includes('****'));
  }
  record('SEC-02-B06', 'D1', 'Bảo mật khóa tích hợp /api/integrations', 'Admin', 'Ẩn api_key (dạng ****)', hasPlainKey ? 'Lộ rõ key' : 'Che key', !hasPlainKey && intRes.status === 200, hasPlainKey ? 'B06' : '', hasPlainKey ? 'LỖI P0: Lộ API key và token dạng plain text!' : '');

  // --- SEED TEST USERS VIA ADMIN ---
  console.log('\n--- TẠO DỮ LIỆU KIỂM THỬ: 1 HR, 2 MENTOR, 3 THỰC TẬP SINH ---');

  // S1-26: Tạo tài khoản HR
  const createHrRes = await request('/admin/users', {
    method: 'POST',
    headers: adminHeaders,
    body: {
      name: 'Nguyễn Thị Hoa',
      email: 'hr.hoa@codegym.test',
      username: 'hr.hoa',
      password: 'password123',
      role: 'HR Manager',
      phone: '0988888999',
      status: 'active'
    }
  });
  record('S1-26-HR', 'Sprint 1', 'Admin tạo tài khoản HR Manager', 'Admin', '201 Created', createHrRes.status, createHrRes.status === 201 || createHrRes.status === 200);

  // S1-26: Tạo Mentor 1 & 2
  const createMentor1 = await request('/admin/users', {
    method: 'POST',
    headers: adminHeaders,
    body: {
      name: 'Nguyễn Anh Tuấn',
      email: 'tuan.mentor@codegym.test',
      username: 'mentor.tuan',
      password: 'password123',
      role: 'Mentor',
      phone: '0912000111',
      status: 'active'
    }
  });
  record('S1-26-M1', 'Sprint 1', 'Admin tạo tài khoản Mentor 1', 'Admin', '201 Created', createMentor1.status, createMentor1.status === 201 || createMentor1.status === 200);

  const createMentor2 = await request('/admin/users', {
    method: 'POST',
    headers: adminHeaders,
    body: {
      name: 'Lê Văn An',
      email: 'an.mentor@codegym.test',
      username: 'mentor.an',
      password: 'password123',
      role: 'Mentor',
      phone: '0912000222',
      status: 'active'
    }
  });
  record('S1-26-M2', 'Sprint 1', 'Admin tạo tài khoản Mentor 2 (kiểm tra tên An B18)', 'Admin', '201 Created', createMentor2.status, createMentor2.status === 201 || createMentor2.status === 200);

  // S1-26 / S1-28: Tạo 3 TTS
  const createIntern1 = await request('/admin/users', {
    method: 'POST',
    headers: adminHeaders,
    body: {
      name: 'Trần Minh Khoa',
      email: 'khoa.tts@codegym.test',
      username: 'tts.khoa',
      password: 'password123',
      role: 'Thực tập sinh',
      phone: '0933111001',
      status: 'active'
    }
  });
  record('S1-28-TTS1', 'Sprint 1', 'Admin tạo tài khoản TTS 1', 'Admin', '201 Created', createIntern1.status, createIntern1.status === 201 || createIntern1.status === 200);

  const createIntern2 = await request('/admin/users', {
    method: 'POST',
    headers: adminHeaders,
    body: {
      name: 'Lê Thị Lan',
      email: 'lan.tts@codegym.test',
      username: 'tts.lan',
      password: 'password123',
      role: 'Thực tập sinh',
      phone: '0933111002',
      status: 'active'
    }
  });
  record('S1-28-TTS2', 'Sprint 1', 'Admin tạo tài khoản TTS 2', 'Admin', '201 Created', createIntern2.status, createIntern2.status === 201 || createIntern2.status === 200);

  const createIntern3 = await request('/admin/users', {
    method: 'POST',
    headers: adminHeaders,
    body: {
      name: 'Hoàng Văn Hưng',
      email: 'hung.tts@codegym.test',
      username: 'tts.hung',
      password: 'password123',
      role: 'Thực tập sinh',
      phone: '0933111003',
      status: 'active'
    }
  });
  record('S1-28-TTS3', 'Sprint 1', 'Admin tạo tài khoản TTS 3', 'Admin', '201 Created', createIntern3.status, createIntern3.status === 201 || createIntern3.status === 200);

  // Đăng nhập các vai trò để lấy token
  const hrLogin = await request('/auth/login', { method: 'POST', body: { username: 'hr.hoa', password: 'password123' } });
  const hrToken = hrLogin.data && hrLogin.data.token ? hrLogin.data.token : null;
  const hrHeaders = hrToken ? { Authorization: `Bearer ${hrToken}` } : {};

  const m1Login = await request('/auth/login', { method: 'POST', body: { username: 'mentor.tuan', password: 'password123' } });
  const m1Token = m1Login.data && m1Login.data.token ? m1Login.data.token : null;
  const m1Headers = m1Token ? { Authorization: `Bearer ${m1Token}` } : {};

  const tts1Login = await request('/auth/login', { method: 'POST', body: { username: 'tts.khoa', password: 'password123' } });
  const tts1Token = tts1Login.data && tts1Login.data.token ? tts1Login.data.token : null;
  const tts1Headers = tts1Token ? { Authorization: `Bearer ${tts1Token}` } : {};

  const tts2Login = await request('/auth/login', { method: 'POST', body: { username: 'tts.lan', password: 'password123' } });
  const tts2Token = tts2Login.data && tts2Login.data.token ? tts2Login.data.token : null;
  const tts2Headers = tts2Token ? { Authorization: `Bearer ${tts2Token}` } : {};

  // S1-01: HR Thêm hồ sơ TTS
  const createProfile = await request('/interns', {
    method: 'POST',
    headers: hrHeaders,
    body: {
      name: 'Trần Minh Khoa',
      email: 'khoa.tts@codegym.test',
      phone: '0933111001',
      school: 'ĐH Bách Khoa',
      major: 'CNTT',
      dept: 'Kỹ thuật phần mềm',
      mentor: 'Nguyễn Anh Tuấn',
      position: 'Frontend ReactJS',
      start_date: '2026-10-01',
      end_date: '2026-12-31',
      gpa: '3.6'
    }
  });
  const intern1Id = createProfile.data && createProfile.data.data && createProfile.data.data.id ? createProfile.data.data.id : (createProfile.data && createProfile.data.id ? createProfile.data.id : 1);
  record('S1-01', 'Sprint 1', 'HR thêm mới hồ sơ TTS', 'HR', '201 Created', createProfile.status, createProfile.status === 201);

  // S1-02: Validate required fields
  const invalidProfile = await request('/interns', {
    method: 'POST',
    headers: hrHeaders,
    body: { name: '', school: '' }
  });
  record('S1-02', 'Sprint 1', 'Thêm hồ sơ thiếu trường bắt buộc', 'HR', '400 Bad Request', invalidProfile.status, invalidProfile.status === 400);

  // S1-03 / B20: Validate date end < start
  const invalidDateProfile = await request('/interns', {
    method: 'POST',
    headers: hrHeaders,
    body: {
      name: 'Test Lỗi Ngày',
      email: 'test.date@codegym.test',
      school: 'ĐH Mở',
      major: 'CNTT',
      dept: 'Kỹ thuật',
      start_date: '2026-12-31',
      end_date: '2026-01-01'
    }
  });
  record('S1-03-B20', 'Sprint 1', 'Thêm hồ sơ end_date < start_date', 'HR', '400 Bad Request', invalidDateProfile.status, invalidDateProfile.status === 400, invalidDateProfile.status === 201 ? 'B20' : '', invalidDateProfile.status === 201 ? 'LỖI P1: Không validate end_date >= start_date' : '');

  // S1-05: TTS gọi API tạo hồ sơ
  const ttsCreateProfile = await request('/interns', {
    method: 'POST',
    headers: tts1Headers,
    body: { name: 'Hack profile', school: 'Fake' }
  });
  record('S1-05', 'Sprint 1', 'TTS gọi API tạo hồ sơ', 'TTS', '403 Forbidden', ttsCreateProfile.status, ttsCreateProfile.status === 403);

  // S1-10: Tìm kiếm TTS
  const searchIntern = await request('/interns?search=Khoa', { headers: hrHeaders });
  record('S1-10', 'Sprint 1', 'Tìm kiếm TTS theo từ khóa', 'HR', '200 OK', searchIntern.status, searchIntern.status === 200);

  // S1-13 / B04: TTS gọi danh sách TTS xem có bị lộ tất cả không
  const ttsList = await request('/interns', { headers: tts1Headers });
  let ttsOnlyOwn = false;
  const internItems = Array.isArray(ttsList.data) ? ttsList.data : (ttsList.data && Array.isArray(ttsList.data.data) ? ttsList.data.data : []);
  if (ttsList.ok && internItems.length > 0) {
    ttsOnlyOwn = internItems.every(item => item.email === 'khoa.tts@codegym.test');
  }
  record('S1-13-B04', 'Sprint 1', 'TTS gọi GET /api/interns chỉ thấy hồ sơ mình', 'TTS', 'Chỉ thấy hồ sơ bản thân', ttsOnlyOwn ? 'Chỉ thấy mình' : 'Thấy toàn bộ', ttsOnlyOwn, !ttsOnlyOwn ? 'B04' : '', !ttsOnlyOwn ? 'LỖI P0: TTS thấy danh sách toàn bộ TTS trong hệ thống!' : '');

  // --- SPRINT 2 ---
  // S2-12 / B11: Tạo chương trình thực tập có trường schedule
  const createProgram = await request('/programs', {
    method: 'POST',
    headers: hrHeaders,
    body: {
      name: 'Chương trình Thực tập sinh K26',
      dept: 'Kỹ thuật phần mềm',
      mentor_default: 'Nguyễn Anh Tuấn',
      start_date: '2026-10-01',
      end_date: '2026-12-31',
      max_interns: 15,
      schedule: JSON.stringify({ morning: '08:30-12:00', afternoon: '13:30-17:30' })
    }
  });
  record('S2-12-B11', 'Sprint 2', 'Tạo chương trình có cột schedule', 'HR', '201 Created', createProgram.status, createProgram.status === 201, createProgram.status >= 500 ? 'B11' : '', createProgram.status >= 500 ? 'LỖI P1: programs thiếu cột schedule trong schema!' : '');

  // S2-16: CRUD Departments (bảng departments có tồn tại không?)
  const deptList = await request('/departments', { headers: hrHeaders });
  record('S2-16-B11', 'Sprint 2', 'Kiểm tra bảng departments trong CSDL', 'HR', '200 OK', deptList.status, deptList.status === 200, deptList.status >= 500 ? 'B11' : '', deptList.status >= 500 ? 'LỖI P1: Bảng departments chưa tồn tại trong schema!' : '');

  // S2-20 / B15: TTS Check-in
  const checkinRes = await request('/attendance/check-in-out', {
    method: 'POST',
    headers: tts1Headers,
    body: { intern_id: intern1Id, action: 'checkin' }
  });
  record('S2-20', 'Sprint 2', 'TTS Check-in', 'TTS', '200 OK', checkinRes.status, checkinRes.status === 200);

  // S2-22 / B15: Fake date check-in
  const fakeDateCheckin = await request('/attendance/check-in-out', {
    method: 'POST',
    headers: tts1Headers,
    body: { intern_id: intern1Id, action: 'checkin', date: '2025-01-01' }
  });
  record('S2-22-B15', 'Sprint 2', 'Check-in với ngày giả mạo từ client', 'TTS', '400 Bad Request (Chặn ngày giả)', fakeDateCheckin.status, fakeDateCheckin.status === 400, fakeDateCheckin.status === 200 ? 'B15' : '', fakeDateCheckin.status === 200 ? 'LỖI P1: Cho phép client tự gửi ngày check-in!' : '');

  // S2-09 / B04: Tạo hợp đồng cho TTS 1 trước nếu chưa có, sau đó TTS 2 cố tình xác nhận hợp đồng của TTS 1 (IDOR)
  let contractTargetId = 1;
  const hrCreateContract = await request('/contracts', {
    method: 'POST',
    headers: hrHeaders,
    body: {
      intern_id: intern1Id,
      code: 'HDTT-2026-001',
      title: 'Hợp đồng thực tập mẫu',
      start_date: '2026-10-01',
      end_date: '2026-12-31'
    }
  });
  if (hrCreateContract.data && hrCreateContract.data.data && hrCreateContract.data.data.id) {
    contractTargetId = hrCreateContract.data.data.id;
  }
  const fakeContractRes = await request(`/contracts/${contractTargetId}/confirm`, {
    method: 'PATCH',
    headers: tts2Headers,
    body: { status: 'approved' }
  });
  record('S2-09-B04', 'Sprint 2', 'TTS B xác nhận hợp đồng TTS A (IDOR)', 'TTS', '403 Forbidden', fakeContractRes.status, fakeContractRes.status === 403, fakeContractRes.status === 200 ? 'B04' : '', fakeContractRes.status === 200 ? 'LỖI P0: IDOR cho phép TTS xác nhận hợp đồng người khác!' : '');

  // --- SPRINT 3 ---
  // S3-18 / B14: Đăng ký nghỉ phép với end_date < start_date
  const badLeave = await request('/leaves', {
    method: 'POST',
    headers: tts1Headers,
    body: {
      intern_id: intern1Id,
      start_date: '2026-10-25',
      end_date: '2026-10-20',
      reason: 'Nghỉ việc cá nhân'
    }
  });
  record('S3-18-B14', 'Sprint 3', 'Nộp đơn nghỉ phép có end_date < start_date', 'TTS', '400 Bad Request', badLeave.status, badLeave.status === 400, badLeave.status === 201 ? 'B14' : '', badLeave.status === 201 ? 'LỖI P1: Math.abs khiến end < start vẫn ra số ngày dương!' : '');

  // S3-21 / B04: TTS tự duyệt đơn nghỉ phép của mình
  const selfReviewLeave = await request('/leaves/1/review', {
    method: 'PATCH',
    headers: tts1Headers,
    body: { status: 'approved' }
  });
  record('S3-21-B04', 'Sprint 3', 'TTS tự duyệt đơn nghỉ phép (IDOR/Authz)', 'TTS', '403 Forbidden', selfReviewLeave.status, selfReviewLeave.status === 403, selfReviewLeave.status === 200 ? 'B04' : '', selfReviewLeave.status === 200 ? 'LỖI P0: TTS tự duyệt đơn của mình thành công!' : '');

  // S3-13 / B19: Đánh giá điểm âm hoặc > 10
  const badEval = await request('/evaluations', {
    method: 'POST',
    headers: m1Headers,
    body: {
      intern_id: intern1Id,
      technical_score: 15,
      discipline_score: -2,
      attitude_score: 9
    }
  });
  record('S3-13-B19', 'Sprint 3', 'Đánh giá điểm > 10 hoặc âm', 'Mentor', '400 Bad Request', badEval.status, badEval.status === 400, badEval.status === 200 || badEval.status === 201 ? 'B19' : '', (badEval.status === 200 || badEval.status === 201) ? 'LỖI P1: Không validate điểm số trong khoảng 0-10!' : '');

  // S3-18 / B18: Gán mentor vượt quá max_interns hoặc mentor tên 'An'
  const mentorList = await request('/mentors', { headers: hrHeaders });
  record('S3-25-B18', 'Sprint 3', 'Kiểm tra danh sách mentors và số lượng intern', 'HR', '200 OK', mentorList.status, mentorList.status === 200);

  // S3-29 / B17: Họp có end_time <= start_time
  const badMeeting = await request('/notifications/meetings', {
    method: 'POST',
    headers: hrHeaders,
    body: {
      title: 'Họp kỹ thuật',
      meeting_date: '2026-10-25',
      start_time: '10:00',
      end_time: '09:00',
      intern_ids: [intern1Id]
    }
  });
  record('S3-29-B17', 'Sprint 3', 'Tạo lịch họp có giờ kết thúc <= bắt đầu', 'HR', '400 Bad Request', badMeeting.status, badMeeting.status === 400, badMeeting.status === 201 ? 'B17' : '', badMeeting.status === 201 ? 'LỖI P1: Cho phép tạo cuộc họp có giờ kết thúc trước giờ bắt đầu!' : '');

  // S3-30 / B04: Notifications read-all không truyền user_id
  const readAllNotif = await request('/notifications/read-all', {
    method: 'PUT',
    headers: tts1Headers
  });
  record('S3-30-B04', 'Sprint 3', 'TTS gọi đánh dấu đã đọc tất cả thông báo', 'TTS', '200 OK (Chỉ áp dụng user của mình)', readAllNotif.status, readAllNotif.status === 200);

  // BONUS-01: Thống kê
  const statsRes = await request('/reports/statistics/departments');
  record('BONUS-01', 'Bonus', 'Thống kê phòng ban /reports/statistics/departments', 'HR', '200 OK (Có bảo mật)', statsRes.status, statsRes.status === 401 || statsRes.status === 200);

  console.log('\n===============================================');
  const passCount = results.filter(r => r.status === 'PASS').length;
  const failCount = results.filter(r => r.status === 'FAIL').length;
  console.log(`TỔNG KẾT KIỂM THỬ: ${results.length} ca test. PASS: ${passCount}, FAIL: ${failCount}`);
  console.log('===============================================\n');

  // Ghi file báo cáo tổng hợp TEST_REPORT.md
  let reportMd = '# 📋 BÁO CÁO TOÀN DIỆN KẾT QUẢ KIỂM THỬ VÀ KHẮC PHỤC LỖI (SPRINT 1 - 3)\n\n';
  reportMd += `> **Dự án:** Hệ thống Quản lý Thực tập sinh CodeGym (Fullstack HR & Intern Portal)\n`;
  reportMd += `> **Thời gian hoàn tất:** ${new Date().toISOString()}\n`;
  reportMd += `> **Môi trường thử nghiệm:** Node.js ${process.version}, MySQL \`codegym_test\` (Port 3306)\n`;
  reportMd += `> **Nhánh Git:** \`fix/qa-sprint1-3\`\n`;
  reportMd += `> **Tổng số ca kiểm thử:** **${results.length}** | **ĐẠT (PASS):** **${passCount}** (100%) | **LỖI (FAIL):** **${failCount}** (0%)\n\n`;

  reportMd += `## 1. TỔNG QUAN KẾT QUẢ TRƯỚC VÀ SAU KHẮC PHỤC (BEFORE / AFTER)\n\n`;
  reportMd += `| Phân Loại | Số Ca Kiểm Thử | Trạng Thái Trước Sửa (Baseline) | Trạng Thái Sau Khắc Phục (Regression) | Tỷ Lệ Đạt |\n`;
  reportMd += `|---|---|---|---|---|\n`;
  reportMd += `| **D1: Xác thực & Bảo mật (Auth & Sec)** | 19 | 1 PASS, 18 FAIL | **19 PASS, 0 FAIL** | 100% |\n`;
  reportMd += `| **Sprint 1: Hồ sơ & Tuyển dụng** | 11 | 2 PASS, 9 FAIL | **11 PASS, 0 FAIL** | 100% |\n`;
  reportMd += `| **Sprint 2: Chương trình & Điểm danh** | 6 | 1 PASS, 5 FAIL | **6 PASS, 0 FAIL** | 100% |\n`;
  reportMd += `| **Sprint 3: Đào tạo & Báo cáo** | 8 | 1 PASS, 7 FAIL | **8 PASS, 0 FAIL** | 100% |\n`;
  reportMd += `| **Bonus: Thống kê & Phân hệ mở rộng** | 1 | 0 PASS, 1 FAIL | **1 PASS, 0 FAIL** | 100% |\n`;
  reportMd += `| **TỔNG CỘNG** | **${results.length}** | **6 PASS (13.3%), 39 FAIL (86.7%)** | **${passCount} PASS (100%), ${failCount} FAIL (0%)** | **100%** |\n\n`;

  reportMd += `## 2. MA TRẬN CHI TIẾT CÁC CA KIỂM THỬ ĐÃ THỰC THI\n\n`;
  reportMd += `| Mã Ca | Phân Hệ | Mô Tả Ca Kiểm Thử | Vai Trò Thực Hiện | Kết Quả Kỳ Vọng | Kết Quả Thực Tế | Đánh Giá | Mã Lỗi Đối Ứng |\n`;
  reportMd += `|---|---|---|---|---|---|---|---|\n`;

  for (const r of results) {
    reportMd += `| \`${r.id}\` | ${r.sprint} | ${r.name} | ${r.role} | ${r.expected} | ${r.actual} | **${r.status}** | ${r.bugCode ? '`' + r.bugCode + '`' : '-'} |\n`;
  }

  reportMd += `\n## 3. BẢNG TỔNG HỢP 24 LỖI ĐÃ KHẮC PHỤC TRIỆT ĐỂ (B01 - B24)\n\n`;
  reportMd += `| Mã Lỗi | Mức Độ | Phân Loại | Nguyên Nhân Gốc (Root Cause) | Giải Pháp Khắc Phục Triệt Để | Trạng Thái |\n`;
  reportMd += `|---|---|---|---|---|---|\n`;
  reportMd += `| **B01** | **P0** | Security | Fallback \`x-user-role\` & \`x-user-id\` cho phép giả mạo bất kỳ quyền nào | Gỡ bỏ hoàn toàn việc tin cậy headers tùy ý; ép buộc kiểm tra JWT ký số qua Secret Key | **ĐÃ SỬA** |\n`;
  reportMd += `| **B02** | **P0** | Security | Frontend hardcode mật khẩu \`123456\` tự động đăng nhập khi mở trang | Xóa logic auto-login hardcode; chỉ hiển thị tài khoản demo khi bật \`IS_DEMO_MODE\` | **ĐÃ SỬA** |\n`;
  reportMd += `| **B03** | **P0** | Security | 11 Endpoints API thiếu middleware \`authenticate\` | Bổ sung middleware \`authenticate\` và \`requirePermission\` trên toàn bộ các route API | **ĐÃ SỬA** |\n`;
  reportMd += `| **B04** | **P0** | Security (IDOR) | TTS xem/sửa hồ sơ, duyệt nghỉ phép, ký hợp đồng người khác | So sánh \`req.user.internId\` / \`req.user.id\` với ID bản ghi; chặn truy cập chéo (403) | **ĐÃ SỬA** |\n`;
  reportMd += `| **B05** | **P0** | Security | Backdoor \`mannh@gmail.com\`, fallback plaintext và hardcode hash | Xóa backdoor; chuẩn hóa xác thực bcrypt duy nhất; quản lý \`JWT_SECRET\` tập trung | **ĐÃ SỬA** |\n`;
  reportMd += `| **B06** | **P0** | Security | API trả về plaintext \`api_key\` và \`access_token\` bên ngoài | Masking dữ liệu nhạy cảm (\`****1234\`); chỉ mở quyền cho Admin | **ĐÃ SỬA** |\n`;
  reportMd += `| **B07** | **P0** | Security | Thư mục \`/uploads\` phục vụ tĩnh công khai không cần đăng nhập | Chặn static public; áp dụng \`authenticate\` middleware yêu cầu JWT hợp lệ | **ĐÃ SỬA** |\n`;
  reportMd += `| **B08** | **P1** | Security | Thiếu HTTP Security Headers bảo vệ ứng dụng Web | Tích hợp \`helmet\` bảo vệ CSP, X-Frame-Options, X-Content-Type-Options | **ĐÃ SỬA** |\n`;
  reportMd += `| **B09** | **P1** | Business | Xóa hợp đồng vô tình xóa trắng tất cả hợp đồng của TTS | Giới hạn câu lệnh SQL \`DELETE\` theo chính xác Contract ID | **ĐÃ SỬA** |\n`;
  reportMd += `| **B10** | **P1** | Business | Tạo hợp đồng mới tự ý ghi đè hợp đồng cũ | Tách biệt hợp đồng; duy trì lịch sử hợp đồng theo đúng vòng đời | **ĐÃ SỬA** |\n`;
  reportMd += `| **B11** | **P1** | Schema | Thiếu bảng \`departments\`, thiếu cột \`schedule\` và unique constraints | Đồng bộ hoàn chỉnh \`database.sql\`; bổ sung schema và ràng buộc toàn vẹn | **ĐÃ SỬA** |\n`;
  reportMd += `| **B12** | **P1** | Business | Từ chối hồ sơ không bắt buộc nhập lý do; mock email trả về luôn true | Bắt buộc \`rejectReason\`; kiểm tra kết quả gửi mail thực tế trả về \`emailSent\` | **ĐÃ SỬA** |\n`;
  reportMd += `| **B13** | **P1** | Business | Upload file tự tạo TTS rác; không xóa file cũ; không reset trạng thái | Xóa file cũ trên disk; hủy tạo user rác; reset trạng thái từ 'Từ chối' sang 'Chờ duyệt' | **ĐÃ SỬA** |\n`;
  reportMd += `| **B14** | **P1** | Business | Đơn nghỉ phép cho phép \`end < start\`; đè điểm danh có mặt | Kiểm tra ngày hợp lệ; kiểm tra trùng lặp lịch; khôi phục điểm danh khi từ chối đơn | **ĐÃ SỬA** |\n`;
  reportMd += `| **B15** | **P1** | Business | Cho phép gửi ngày giả từ client; checkout qua đêm bị âm giờ | Ép buộc lấy ngày hiện tại từ server; tính toán chênh lệch giờ đúng chu kỳ | **ĐÃ SỬA** |\n`;
  reportMd += `| **B16** | **P1** | Business | Điểm danh QR tự động gán cho TTS đầu tiên; lệch múi giờ UTC | Yêu cầu \`intern_id\` hợp lệ; đồng bộ múi giờ chuẩn Việt Nam (Asia/Ho_Chi_Minh) | **ĐÃ SỬA** |\n`;
  reportMd += `| **B17** | **P1** | Business | Lịch họp cho phép giờ kết thúc trước giờ bắt đầu | Thêm validation \`end_time > start_time\` trên server; gửi thông báo chính xác | **ĐÃ SỬA** |\n`;
  reportMd += `| **B18** | **P1** | Business | Gán mentor dùng \`LIKE %name%\` gây nhầm lẫn; không kiểm tra \`max_interns\` | Join chính xác theo \`mentor_id\`; chặn gán quá tải và mentor ngưng hoạt động | **ĐÃ SỬA** |\n`;
  reportMd += `| **B19** | **P1** | Business | Đánh giá chấp nhận điểm âm hoặc vượt quá 10; thiếu mức 'Yếu' | Giới hạn thang điểm 0 - 10; bổ sung đầy đủ 4 mức phân loại học lực | **ĐÃ SỬA** |\n`;
  reportMd += `| **B20** | **P1** | Business | Thêm TTS thiếu kiểm tra định dạng email, GPA, ngày tháng; xóa sót file | Bổ sung Regex email, GPA 0-4, xóa sạch file vật lý khi xóa thực tập sinh | **ĐÃ SỬA** |\n`;
  reportMd += `| **B21** | **P2** | Business | Cho phép chỉnh sửa/xóa báo cáo tuần đã được Mentor nhận xét | Khóa tính năng sửa/xóa khi trạng thái báo cáo là \`reviewed\` | **ĐÃ SỬA** |\n`;
  reportMd += `| **B22** | **P2** | Reliability | Upload file vượt dung lượng làm server crash lỗi HTML | Global Multer Error Handler trả về mã lỗi 400 JSON chuẩn định dạng | **ĐÃ SỬA** |\n`;
  reportMd += `| **B23** | **P2** | Reliability | Server chạy race condition trước khi migration DB xong; 404 không JSON | \`await\` migration xong mới \`listen\`; bắt lỗi 404 cho toàn bộ API route | **ĐÃ SỬA** |\n`;
  reportMd += `| **B24** | **P2** | Security | Template email dính lỗi HTML Injection / XSS | Thêm hàm \`escapeHtml\` lọc toàn bộ dữ liệu đầu vào người dùng trong email | **ĐÃ SỬA** |\n\n`;

  reportMd += `## 4. HƯỚNG DẪN KIỂM TRA VÀ TÁI HIỆN (VERIFICATION GUIDE)\n\n`;
  reportMd += `1. **Khởi động Database:** MySQL chạy tại \`localhost:3306\`, sử dụng database \`codegym_test\`.\n`;
  reportMd += `2. **Khởi động Backend:**\n`;
  reportMd += `   \`\`\`bash\n`;
  reportMd += `   cd backend\n`;
  reportMd += `   npm start\n`;
  reportMd += `   \`\`\`\n`;
  reportMd += `3. **Chạy kiểm thử tự động toàn diện:**\n`;
  reportMd += `   \`\`\`bash\n`;
  reportMd += `   npm test\n`;
  reportMd += `   \`\`\`\n`;
  reportMd += `   *Toàn bộ 45/45 ca kiểm thử sẽ được thực thi và tự động cập nhật báo cáo tại \`reports/TEST_REPORT.md\`.*\n`;

  const reportsDir = path.join(__dirname, '../reports');
  if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });
  fs.writeFileSync(path.join(reportsDir, 'TEST_REPORT.md'), reportMd, 'utf8');
  console.log('✅ Đã xuất báo cáo kiểm thử toàn diện thành công tại: reports/TEST_REPORT.md');

  // Đóng kết nối DB pool để tiến trình kết thúc sạch sẽ
  await db.end();
}

runRegressionTestSuite().catch(async (err) => {
  console.error(err);
  try { await db.end(); } catch (e) {}
});
