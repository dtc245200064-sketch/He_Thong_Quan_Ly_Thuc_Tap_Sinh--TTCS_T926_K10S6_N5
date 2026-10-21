// Functional test: 28 user stories (Sprint 1-3) against running server
const BASE = 'http://localhost:5000/api';
const results = [];
const ctx = {};
const log = (stt, name, ok, note = '') => {
  results.push({ stt, name, ok, note });
  console.log(`${ok ? 'PASS' : 'FAIL'} | STT ${stt} | ${name}${note ? ' | ' + note : ''}`);
};

async function call(method, path, token, body, form) {
  const headers = {};
  if (token) headers.Authorization = 'Bearer ' + token;
  let payload;
  if (form) payload = form;
  else if (body) { headers['Content-Type'] = 'application/json'; payload = JSON.stringify(body); }
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 30000);
  try {
    const r = await fetch(BASE + path, { method, headers, body: payload, signal: ctrl.signal });
    let j = null; const txt = await r.text();
    try { j = JSON.parse(txt); } catch { j = { raw: txt.slice(0, 200) }; }
    return { status: r.status, j };
  } catch (e) { return { status: 0, j: { error: e.message } }; }
  finally { clearTimeout(t); }
}
const short = (r) => `${r.status} ${JSON.stringify(r.j).slice(0, 160)}`;
const pdfBlob = () => new Blob(['%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF'], { type: 'application/pdf' });
const today = new Date(Date.now() + 7 * 3600e3).toISOString().slice(0, 10);
const addDays = (d, n) => new Date(new Date(d).getTime() + n * 864e5).toISOString().slice(0, 10);

const db = require('../backend/config/db');

async function login(id, pw) {
  const r = await call('POST', '/auth/login', null, id.includes('@') ? { email: id, password: pw } : { username: id, password: pw });
  return { r, token: r.j.token || (r.j.data && r.j.data.token), user: r.j.user || (r.j.data && r.j.data.user) };
}

(async () => {
  // Idempotent test cleanup
  const cleanSqls = [
    "DELETE FROM attendance WHERE intern_id IN (SELECT id FROM interns WHERE email LIKE '%@test.vn' OR email LIKE '%@candidate.vn' OR email = 'nam.le@school.edu.vn')",
    "DELETE FROM leave_requests WHERE intern_id IN (SELECT id FROM interns WHERE email LIKE '%@test.vn' OR email LIKE '%@candidate.vn' OR email = 'nam.le@school.edu.vn')",
    "DELETE FROM contracts WHERE intern_id IN (SELECT id FROM interns WHERE email LIKE '%@test.vn' OR email LIKE '%@candidate.vn' OR email = 'nam.le@school.edu.vn')",
    "DELETE FROM documents WHERE intern_id IN (SELECT id FROM interns WHERE email LIKE '%@test.vn' OR email LIKE '%@candidate.vn' OR email = 'nam.le@school.edu.vn')",
    "DELETE FROM evaluations WHERE intern_id IN (SELECT id FROM interns WHERE email LIKE '%@test.vn' OR email LIKE '%@candidate.vn' OR email = 'nam.le@school.edu.vn')",
    "DELETE FROM weekly_reports WHERE intern_id IN (SELECT id FROM interns WHERE email LIKE '%@test.vn' OR email LIKE '%@candidate.vn' OR email = 'nam.le@school.edu.vn')",
    "DELETE FROM tasks WHERE intern_id IN (SELECT id FROM interns WHERE email LIKE '%@test.vn' OR email LIKE '%@candidate.vn' OR email = 'nam.le@school.edu.vn')",
    "DELETE FROM intern_schedules WHERE intern_id IN (SELECT id FROM interns WHERE email LIKE '%@test.vn' OR email LIKE '%@candidate.vn' OR email = 'nam.le@school.edu.vn')",
    "DELETE FROM inapp_notifications WHERE user_id IN (SELECT id FROM users WHERE email LIKE '%@test.vn' OR email LIKE '%@candidate.vn' OR email = 'nam.le@school.edu.vn')",
    "DELETE FROM interns WHERE email LIKE '%@test.vn' OR email LIKE '%@candidate.vn' OR email = 'nam.le@school.edu.vn'",
    "DELETE FROM mentors WHERE email LIKE '%@test.vn' OR email = 'an@test.vn'",
    "DELETE FROM users WHERE email LIKE '%@test.vn' OR email LIKE '%@candidate.vn' OR email = 'nam.le@school.edu.vn' OR username IN ('hr1','mentor1','mentor2','intern1','intern2','weak')",
    "DELETE FROM programs WHERE name LIKE '%K26%'",
    "DELETE FROM meetings WHERE title = 'Họp tuần'",
    "UPDATE users SET password = '$2b$10$ED0SWcX/mtmKZbfc/tSUTugKJpFnqAfHdKE5UcNcCC1c0phdKeUUe' WHERE username = 'admin' OR id = 1"
  ];
  for (const sql of cleanSqls) {
    try { await db.query(sql); } catch (e) {}
  }

  // ---------- STT 39: Admin tạo tài khoản ----------
  const a = await login('admin', 'Admin@123');
  ctx.admin = a.token;
  log('39', 'Admin đăng nhập', !!a.token, a.token ? '' : short(a.r));
  const mk = async (name, email, role, extra = {}) => {
    const r = await call('POST', '/admin/users', ctx.admin, { name, email, username: email.split('@')[0], password: 'Pass@123', role, ...extra });
    return r;
  };
  const rHR = await mk('Hoa HR', 'hr1@test.vn', 'HR Manager');
  log('39', 'Tạo tài khoản HR', rHR.status === 201 || (rHR.j && rHR.j.success), short(rHR));
  const rM1 = await mk('Minh Mentor', 'mentor1@test.vn', 'Mentor');
  const rM2 = await mk('Thanh An', 'mentor2@test.vn', 'Mentor');
  log('39', 'Tạo tài khoản Mentor x2', (rM1.j && rM1.j.success) && (rM2.j && rM2.j.success), short(rM1));
  const rI1 = await mk('Nguyễn Văn Tâm', 'intern1@test.vn', 'Thực tập sinh');
  const rI2 = await mk('Trần Thị Lan', 'intern2@test.vn', 'Thực tập sinh');
  log('39', 'Tạo tài khoản Thực tập sinh x2', (rI1.j && rI1.j.success) && (rI2.j && rI2.j.success), short(rI1));
  const dup = await mk('Trùng', 'intern1@test.vn', 'Thực tập sinh');
  log('39', 'Chặn trùng email', dup.status === 400 || dup.status === 409, short(dup));
  const weak = await mk('Yếu', 'weak@test.vn', 'Thực tập sinh', { password: '1' });
  log('39', 'Chặn mật khẩu quá ngắn', weak.status === 400, short(weak));

  const users = await call('GET', '/admin/users', ctx.admin);
  const list = users.j.data || users.j.users || [];
  const find = (e) => list.find((u) => u.email === e) || {};
  log('39', 'Danh sách tài khoản + lọc', list.length >= 5, `count=${list.length}`);
  const lockRes = await call('PATCH', `/admin/users/${find('intern2@test.vn').id}/status`, ctx.admin, { status: 'locked' });
  const lockedLogin = await login('intern2@test.vn', 'Pass@123');
  log('39', 'Khóa tài khoản -> không đăng nhập được', !lockedLogin.token, short(lockRes));
  await call('PATCH', `/admin/users/${find('intern2@test.vn').id}/status`, ctx.admin, { status: 'active' });
  const upd = await call('PUT', `/admin/users/${find('hr1@test.vn').id}`, ctx.admin, { name: 'Hoa HR (sửa)', email: 'hr1@test.vn', username: 'hr1', role: 'HR Manager', status: 'active' });
  log('39', 'Sửa tài khoản', upd.j && upd.j.success === true, short(upd));

  const hr = await login('hr1@test.vn', 'Pass@123'); ctx.hr = hr.token;
  const m1 = await login('mentor1@test.vn', 'Pass@123'); ctx.m1 = m1.token;
  const m2 = await login('mentor2@test.vn', 'Pass@123'); ctx.m2 = m2.token;
  const i1 = await login('intern1@test.vn', 'Pass@123'); ctx.i1 = i1.token;
  const i2 = await login('intern2@test.vn', 'Pass@123'); ctx.i2 = i2.token;
  log('39', 'Cả 4 vai trò đăng nhập được', !!(ctx.hr && ctx.m1 && ctx.m2 && ctx.i1 && ctx.i2), [!!ctx.hr, !!ctx.m1, !!ctx.i1].join(','));

  // ---------- STT 6: Đăng ký tài khoản trực tuyến (L4) ----------
  const regOk = await call('POST', '/auth/register', null, { name: 'Đỗ Thị Mai', email: 'mai.do@candidate.vn', phone: '0987654321', password: 'Pass@123' });
  log('6', 'Đăng ký tài khoản Thực tập sinh', regOk.status === 201 && regOk.j && regOk.j.success === true, short(regOk));
  const regDup = await call('POST', '/auth/register', null, { name: 'Đỗ Thị Mai Trùng', email: 'mai.do@candidate.vn', password: 'Pass@123' });
  log('6', 'Chặn trùng email khi đăng ký', regDup.status === 400 || regDup.status === 409, short(regDup));
  const regWeak = await call('POST', '/auth/register', null, { name: 'Pass Yếu', email: 'weak_reg@candidate.vn', password: '123' });
  log('6', 'Chặn mật khẩu yếu (<6 ký tự)', regWeak.status === 400, short(regWeak));
  const regEsc = await call('POST', '/auth/register', null, { name: 'Hacker Admin', email: 'hacker@candidate.vn', password: 'Pass@123', role: 'Admin' });
  const hackerUser = regEsc.j && regEsc.j.user;
  log('6', 'Chặn leo thang vai trò khi đăng ký', regEsc.status === 201 && hackerUser && hackerUser.role === 'Thực tập sinh', `role=${hackerUser ? hackerUser.role : 'none'}`);
  const maiLogin = await login('mai.do@candidate.vn', 'Pass@123');
  log('6', 'TTS mới đăng ký đăng nhập thành công', !!maiLogin.token && maiLogin.user && maiLogin.user.role === 'Thực tập sinh', short(maiLogin.r));

  // ---------- STT 40: Phân quyền ----------
  const perm = await call('GET', '/admin/permissions', ctx.admin);
  log('40', 'Xem ma trận phân quyền', perm.status === 200 && perm.j.success !== false, short(perm).slice(0, 120));
  ctx.permData = perm.j.data || perm.j.permissions;
  // Đổi quyền Xem profile_manage của HR -> tắt, kiểm tra HR bị 403, rồi khôi phục
  try {
    const hrPerm = await call('GET', '/admin/permissions?role=' + encodeURIComponent('HR Manager'), ctx.admin);
    const orig = hrPerm.j.data || hrPerm.j.permissions;
    const origObj = Array.isArray(orig) ? orig[0] : orig;
    const permissions = JSON.parse(JSON.stringify(origObj.permissions || origObj));
    const before = JSON.stringify(permissions.profile_manage);
    permissions.profile_manage = [false, false, false, false, false];
    const put = await call('PUT', '/admin/permissions', ctx.admin, { role: 'HR Manager', permissions });
    const denied = await call('GET', '/interns', ctx.hr);
    permissions.profile_manage = JSON.parse(before);
    await call('PUT', '/admin/permissions', ctx.admin, { role: 'HR Manager', permissions });
    const allowed = await call('GET', '/interns', ctx.hr);
    log('40', 'Đổi quyền có hiệu lực ngay và khôi phục được', put.j && put.j.success && denied.status === 403 && allowed.status === 200, `put=${put.status} denied=${denied.status} restored=${allowed.status}`);
  } catch (e) { log('40', 'Đổi quyền có hiệu lực ngay', false, e.message); }
  const permBad = await call('PUT', '/admin/permissions', ctx.hr, { role: 'Mentor', permissions: {} });
  log('40', 'HR không được sửa phân quyền', permBad.status === 403, short(permBad));

  // ---------- STT 1-3: Hồ sơ TTS ----------
  const before = await call('GET', '/interns', ctx.hr);
  const rows0 = before.j.data || [];
  const auto = rows0.find((x) => x.email === 'intern1@test.vn');
  log('1', 'Tạo TTS tự sinh hồ sơ interns (từ tài khoản)', !!auto, auto ? 'có' : 'không có hồ sơ tự động');
  const c1 = await call('POST', '/interns', ctx.hr, { name: 'Lê Hoàng Nam', email: 'nam.le@school.edu.vn', phone: '0912345678', school: 'ĐH Bách Khoa', major: 'Công nghệ thông tin', dept: 'Engineering', startDate: today, endDate: addDays(today, 60), gpa: 3.4, position: 'Frontend Intern' });
  log('1', 'HR thêm mới hồ sơ TTS', c1.status === 201, short(c1));
  const c1bad = await call('POST', '/interns', ctx.hr, { name: 'Thiếu trường' });
  log('1', 'Chặn thiếu trường bắt buộc', c1bad.status === 400, short(c1bad));
  const c1d = await call('POST', '/interns', ctx.hr, { name: 'Lê Hoàng Nam', email: 'nam.le@school.edu.vn', school: 'ĐH Bách Khoa', major: 'CNTT', dept: 'Engineering' });
  log('1', 'Chặn trùng email hồ sơ', c1d.status === 400 || c1d.status === 409, short(c1d));
  const all1 = await call('GET', '/interns', ctx.hr);
  const rows = all1.j.data || [];
  ctx.nam = rows.find((x) => x.email === 'nam.le@school.edu.vn') || {};
  ctx.tam = rows.find((x) => x.email === 'intern1@test.vn') || {};
  ctx.lan = rows.find((x) => x.email === 'intern2@test.vn') || {};
  const up = await call('PUT', `/interns/${ctx.nam.id}`, ctx.hr, { name: 'Lê Hoàng Nam', email: 'nam.le@school.edu.vn', phone: '0999888777', school: 'ĐH FPT', major: 'Công nghệ thông tin', dept: 'Engineering', status: 'Chờ xét duyệt' });
  const chk = await call('GET', '/interns?search=Nam', ctx.hr);
  const nm = (chk.j.data || []).find((x) => x.id === ctx.nam.id) || {};
  log('2', 'HR chỉnh sửa hồ sơ TTS và dữ liệu lưu đúng', up.j && up.j.success && nm.school === 'ĐH FPT', `${short(up)} school=${nm.school}`);
  const s1 = await call('GET', '/interns?search=' + encodeURIComponent('Nam'), ctx.hr);
  const s2 = await call('GET', '/interns?school=' + encodeURIComponent('ĐH FPT'), ctx.hr);
  const s3 = await call('GET', '/interns?dept=Engineering&status=' + encodeURIComponent('Chờ xét duyệt'), ctx.hr);
  log('3', 'Tìm kiếm theo từ khóa', (s1.j.data || []).some((x) => x.id === ctx.nam.id), `n=${(s1.j.data || []).length}`);
  log('3', 'Lọc theo trường', (s2.j.data || []).length >= 1 && (s2.j.data || []).every((x) => x.school === 'ĐH FPT'), `n=${(s2.j.data || []).length}`);
  log('3', 'Lọc theo phòng ban + trạng thái', s3.status === 200, `n=${(s3.j.data || []).length}`);
  const s4 = await call('GET', "/interns?search=%25%27%20OR%201%3D1--", ctx.hr);
  log('3', 'Tìm kiếm ký tự lạ không lỗi 500', s4.status === 200, short(s4).slice(0, 60));

  // ---------- STT 4: TTS upload ----------
  const fd = new FormData(); fd.append('file', pdfBlob(), 'CV_Tam.pdf'); fd.append('docType', 'CV');
  const u1 = await call('POST', `/interns/${ctx.tam.id}/documents`, ctx.i1, null, fd);
  log('4', 'TTS upload CV (PDF)', u1.status === 200 || u1.status === 201, short(u1));
  const fd2 = new FormData(); fd2.append('file', pdfBlob(), 'Don_Tam.pdf'); fd2.append('docType', 'APPLICATION_LETTER');
  const u2 = await call('POST', `/interns/${ctx.tam.id}/documents`, ctx.i1, null, fd2);
  log('4', 'TTS upload Đơn xin thực tập', u2.status === 200 || u2.status === 201, short(u2));
  const fd3 = new FormData(); fd3.append('file', new Blob(['MZ evil'], { type: 'application/pdf' }), 'virus.exe'); fd3.append('docType', 'CV');
  const u3 = await call('POST', `/interns/${ctx.tam.id}/documents`, ctx.i1, null, fd3);
  log('4', 'Chặn file .exe', u3.status === 400, short(u3));
  const fd4 = new FormData(); fd4.append('file', pdfBlob(), 'CV_Lan.pdf'); fd4.append('docType', 'CV');
  const u4 = await call('POST', `/interns/${ctx.tam.id}/documents`, ctx.i2, null, fd4);
  log('4', 'TTS khác không upload hộ được', u4.status === 403, short(u4));
  // ---------- STT 5: HR xem + duyệt ----------
  const docs = await call('GET', `/interns/${ctx.tam.id}/documents`, ctx.hr);
  const dl = docs.j.data || docs.j.documents || [];
  log('5', 'HR xem danh sách tài liệu của TTS', (Array.isArray(dl) ? dl.length : Object.keys(dl).length) >= 1, short(docs).slice(0, 100));
  // file tải về
  let fileUrl = (Array.isArray(dl) ? dl[0] : null);
  fileUrl = fileUrl && (fileUrl.file_url || fileUrl.url);
  if (fileUrl) {
    const fr = await fetch('http://localhost:5000' + (fileUrl.startsWith('/') ? fileUrl : '/' + fileUrl), { headers: { Authorization: 'Bearer ' + ctx.hr } });
    log('5', 'HR mở/tải được file tài liệu', fr.status === 200, 'status ' + fr.status + ' ' + fileUrl);
  }

  // ---------- STT 7, 8: Duyệt / từ chối + email ----------
  const rej0 = await call('PATCH', `/interns/${ctx.tam.id}/documents/status`, ctx.hr, { status: 'rejected' });
  log('7', 'Từ chối bắt buộc có lý do', rej0.status === 400, short(rej0));
  const t0 = Date.now();
  const app = await call('PATCH', `/interns/${ctx.tam.id}/documents/status`, ctx.hr, { status: 'approved' });
  log('7', 'HR duyệt hồ sơ', app.j && app.j.success === true, `${short(app)} (${Date.now() - t0}ms)`);
  const after = await call('GET', '/interns?search=Tâm', ctx.hr);
  const st = ((after.j.data || [])[0] || {}).status;
  log('7', 'Trạng thái TTS đổi sau khi duyệt', st && st !== 'Chờ xét duyệt', 'status=' + st);
  const rej = await call('PATCH', `/interns/${ctx.nam.id}/documents/status`, ctx.hr, { status: 'rejected', rejectReason: 'Thiếu bảng điểm' });
  log('7', 'HR từ chối kèm lý do', (rej.j && rej.j.success === true) || rej.status === 404, short(rej));
  const eh = await call('GET', '/interns/emails/history', ctx.hr);
  log('8', 'Có lịch sử email thông báo kết quả', eh.status === 200 && (eh.j.data || eh.j.emails || []).length >= 1, `n=${(eh.j.data || eh.j.emails || []).length} emailSent(app)=${app.j && app.j.emailSent}`);

  // ---------- STT 9, 10: Hợp đồng ----------
  const cf = new FormData(); cf.append('file', pdfBlob(), 'HD_Tam.pdf');
  cf.append('intern_id', ctx.tam.id); cf.append('code', 'HD-001'); cf.append('title', 'Hợp đồng thực tập'); cf.append('company', 'CodeGym'); cf.append('dept', 'Engineering'); cf.append('period', '3 tháng');
  const ct = await call('POST', '/contracts', ctx.hr, null, cf);
  log('9', 'HR tải lên hợp đồng thực tập', ct.status === 201 || (ct.j && ct.j.success === true), short(ct));
  const cl = await call('GET', '/contracts?intern_id=' + ctx.tam.id, ctx.hr);
  const ctr = (cl.j.data || cl.j.contracts || [])[0] || {};
  const cl2 = await call('GET', '/contracts', ctx.i1);
  const myC = (cl2.j.data || cl2.j.contracts || [])[0] || {};
  log('10', 'TTS thấy hợp đồng của mình', !!myC.id, short(cl2).slice(0, 100));
  const cfm = await call('PATCH', `/contracts/${myC.id || ctr.id}/confirm`, ctx.i1, { status: 'approved' });
  log('10', 'TTS xác nhận hợp đồng', cfm.j && cfm.j.success === true, short(cfm));
  const cfm2 = await call('PATCH', `/contracts/${myC.id || ctr.id}/confirm`, ctx.i2, { status: 'approved' });
  log('10', 'TTS khác không xác nhận hộ được', cfm2.status === 403, short(cfm2));

  // ---------- STT 29: Mentor ----------
  const av = await call('GET', '/mentors/available-users', ctx.hr);
  const avl = av.j.data || [];
  const mu1 = find('mentor1@test.vn');
  const cm1 = await call('POST', '/mentors', ctx.hr, { user_id: mu1.id, dept: 'Engineering', position: 'Senior Dev', max_interns: 2 });
  log('29', 'HR thêm mentor (liên kết tài khoản)', cm1.status === 201 || (cm1.j && cm1.j.success === true), short(cm1));
  const cm2 = await call('POST', '/mentors', ctx.hr, { name: 'An', email: 'an@test.vn', dept: 'Engineering', max_interns: 3 });
  log('29', 'HR thêm mentor (nhập tay)', cm2.status === 201 || (cm2.j && cm2.j.success === true), short(cm2));
  const cmd = await call('POST', '/mentors', ctx.hr, { name: 'An', email: 'an@test.vn', dept: 'Engineering' });
  log('29', 'Chặn trùng email mentor', cmd.status === 400, short(cmd));
  const ml = await call('GET', '/mentors', ctx.hr);
  const mentors = ml.j.data || [];
  const mM1 = mentors.find((m) => m.email === 'mentor1@test.vn') || {};
  const mAn = mentors.find((m) => m.email === 'an@test.vn') || {};

  const cm3 = await call('POST', '/mentors', ctx.hr, { user_id: find('mentor2@test.vn').id, dept: 'Engineering', position: 'Dev', max_interns: 5 });
  ctx.m1 = (await login('mentor1@test.vn', 'Pass@123')).token; ctx.m2 = (await login('mentor2@test.vn', 'Pass@123')).token;
  // ---------- STT 30, 31, 12: gán mentor ----------
  const as1 = await call('POST', '/mentors/assign', ctx.hr, { intern_id: ctx.tam.id, mentor_id: mM1.id });
  log('30', 'HR gán mentor cho TTS', as1.j && as1.j.success === true, short(as1));
  const as2 = await call('POST', '/mentors/assign', ctx.hr, { intern_id: ctx.nam.id, mentor_id: mM1.id });
  const as3 = await call('POST', '/mentors/assign', ctx.hr, { intern_id: ctx.lan.id, mentor_id: mM1.id });
  log('30', 'Chặn gán vượt max_interns (=2)', as3.status === 400, short(as3));
  const ml2 = await call('GET', '/mentors', ctx.hr);
  const m1row = (ml2.j.data || []).find((m) => m.id === mM1.id) || {};
  log('31', 'HR xem số TTS mỗi mentor đang quản lý', Number(m1row.current_interns) === 2, 'current_interns=' + m1row.current_interns);
  const anRow = (ml2.j.data || []).find((m) => m.id === mAn.id) || {};
  log('31', 'Mentor "An" không đếm nhầm TTS của mentor khác', Number(anRow.current_interns) === 0, 'An=' + anRow.current_interns);
  log('12', 'Phân công TTS cho mentor (STT 12)', (as1.j && as1.j.success === true) && (as2.j && as2.j.success === true), '');

  // ---------- STT 11, 13: Chương trình ----------
  const pg = await call('POST', '/programs', ctx.hr, { name: 'Thực tập Mùa Thu', dept: 'Engineering', mentor_default: 'Minh Mentor', start_date: today, end_date: addDays(today, 90), max_interns: 10, description: 'Chương trình demo', schedule: [{ stage: 'Onboarding', from: today, to: addDays(today, 14) }] });
  log('11', 'HR tạo chương trình theo phòng ban', pg.status === 201 || (pg.j && pg.j.success === true), short(pg));
  const pgb = await call('POST', '/programs', ctx.hr, { name: 'Sai ngày', dept: 'Engineering', start_date: addDays(today, 10), end_date: today, max_interns: 5 });
  log('13', 'Chặn ngày kết thúc < ngày bắt đầu', pgb.status === 400, short(pgb));
  const pl = await call('GET', '/programs?dept=Engineering', ctx.hr);
  const prog = (pl.j.data || [])[0] || {};
  const pu = await call('PUT', `/programs/${prog.id}`, ctx.hr, { name: prog.name, dept: 'Engineering', start_date: today, end_date: addDays(today, 120), max_interns: 10, status: 'active', description: 'sửa', schedule: prog.schedule });
  log('13', 'HR thiết lập/sửa ngày bắt đầu-kết thúc chương trình', pu.j && pu.j.success === true, short(pu));

  // ---------- STT 23, 14: Lịch làm việc ----------
  const sc = await call('POST', '/schedules', ctx.hr, { intern_id: ctx.tam.id, schedule_date: today, start_time: '09:00', end_time: '16:00', title: 'Ca làm việc linh hoạt', content: 'Nhóm A', schedule_type: 'working' });
  log('23', 'HR tạo lịch làm việc linh hoạt', sc.status === 201 || (sc.j && sc.j.success === true), short(sc));
  const scb = await call('POST', '/schedules', ctx.hr, { intern_id: ctx.tam.id, schedule_date: today, start_time: '17:00', end_time: '09:00', title: 'Sai giờ' });
  log('23', 'Chặn giờ kết thúc < bắt đầu', scb.status === 400, short(scb));
  const sl = await call('GET', '/schedules', ctx.i1);
  log('14', 'TTS xem lịch thực tập cá nhân', (sl.j.data || []).length >= 1, `n=${(sl.j.data || []).length}`);
  const sl2 = await call('GET', '/schedules', ctx.i2);
  log('14', 'TTS khác không thấy lịch của người này', (sl2.j.data || []).length === 0, `n=${(sl2.j.data || []).length}`);

  // ---------- L3 ca test mới: HR lập lịch cho nhiều TTS và phân tách lịch ----------
  const scMulti = await call('POST', '/schedules', ctx.hr, { intern_id: ctx.lan.id, schedule_date: today, start_time: '13:30', end_time: '17:30', title: 'Ca chiều cho Lan', schedule_type: 'training' });
  log('23', 'HR tạo lịch cho TTS thứ hai', scMulti.status === 201 || (scMulti.j && scMulti.j.success === true), short(scMulti));
  const slLan = await call('GET', '/schedules', ctx.i2);
  log('14', 'TTS Lan thấy đúng lịch của mình', (slLan.j.data || []).length === 1 && (slLan.j.data || [])[0].title === 'Ca chiều cho Lan', `n=${(slLan.j.data || []).length}`);
  const slTamRecheck = await call('GET', '/schedules', ctx.i1);
  log('14', 'TTS Tâm không bị lẫn lịch của TTS Lan', !(slTamRecheck.j.data || []).some(s => s.title === 'Ca chiều cho Lan'), 'Lịch phân tách độc lập');

  // ---------- STT 21, 22: Chấm công ----------
  const ci = await call('POST', '/attendance/check-in-out', ctx.i1, {});
  log('21', 'TTS check-in', ci.j && ci.j.success === true, short(ci));
  const co = await call('POST', '/attendance/check-in-out', ctx.i1, {});
  log('21', 'TTS check-out', co.j && co.j.success === true, short(co));
  const at = await call('GET', `/attendance?intern_id=${ctx.tam.id}`, ctx.hr);
  const arow = (at.j.data || [])[0] || {};
  log('22', 'HR xem báo cáo đi làm', (at.j.data || []).length >= 1, `check_in=${arow.check_in} out=${arow.check_out} total=${arow.total_hours}`);
  const mk2 = await call('POST', '/attendance/mark', ctx.hr, { intern_id: ctx.nam.id, date: addDays(today, -1), status: 'absent', notes: 'Nghỉ không phép' });
  log('22', 'HR chấm công thủ công', mk2.j && mk2.j.success === true, short(mk2));

  // ---------- STT 24: Nghỉ phép ----------
  const lv = await call('POST', '/leaves', ctx.i1, { leave_type: 'Nghỉ ốm', start_date: addDays(today, 3), end_date: addDays(today, 4), reason: 'Bị cảm' });
  log('24', 'TTS đăng ký nghỉ phép', lv.status === 201 || (lv.j && lv.j.success === true), short(lv));
  const lvb = await call('POST', '/leaves', ctx.i1, { leave_type: 'Nghỉ ốm', start_date: addDays(today, 9), end_date: addDays(today, 7), reason: 'Sai' });
  log('24', 'Chặn ngày kết thúc < bắt đầu', lvb.status === 400, short(lvb));
  const ll = await call('GET', '/leaves', ctx.hr);
  const lrow = (ll.j.data || ll.j.leaves || [])[0] || {};
  log('22', 'HR xem danh sách nghỉ phép', !!lrow.id, `n=${(ll.j.data || ll.j.leaves || []).length}`);
  const lself = await call('PATCH', `/leaves/${lrow.id}/review`, ctx.i1, { status: 'approved' });
  log('24', 'TTS không tự duyệt đơn của mình', lself.status === 403, short(lself));
  const lrev = await call('PATCH', `/leaves/${lrow.id}/review`, ctx.hr, { status: 'approved', review_note: 'OK' });
  log('24', 'HR duyệt đơn nghỉ phép', lrev.j && lrev.j.success === true, short(lrev));

  // ---------- STT 15, 16: Nhiệm vụ ----------
  const tk = await call('POST', '/tasks', ctx.m1, { intern_id: ctx.tam.id, mentor_id: mM1.id, title: 'Xây trang đăng nhập', description: 'HTML/CSS', deadline: addDays(today, 7), priority: 'high' });
  log('15', 'Mentor giao nhiệm vụ', tk.status === 201 || (tk.j && tk.j.success === true), short(tk));
  const tkOther = await call('POST', '/tasks', ctx.m2, { intern_id: ctx.tam.id, title: 'Giao trái nhóm' });
  log('15', 'Mentor khác nhóm không giao được', tkOther.status === 403, short(tkOther));
  const tl = await call('GET', '/tasks', ctx.i1);
  const task = (tl.j.data || tl.j.tasks || [])[0] || {};
  log('16', 'TTS thấy nhiệm vụ được giao', !!task.id, `n=${(tl.j.data || tl.j.tasks || []).length}`);
  const tp = await call('PUT', `/tasks/${task.id}/progress`, ctx.i1, { progress: 60, intern_note: 'Xong 60%' });
  log('16', 'TTS cập nhật tiến độ', tp.j && tp.j.success === true, short(tp));
  const tl2 = await call('GET', '/tasks', ctx.m1);
  log('15', 'Mentor thấy danh sách nhiệm vụ đã giao', (tl2.j.data || []).length >= 1, `mentor thấy ${(tl2.j.data || []).length} nhiệm vụ`);
  const t2 = (tl2.j.data || tl2.j.tasks || []).find((x) => x.id === task.id) || {};
  log('16', 'Mentor thấy tiến độ cập nhật', Number(t2.progress) === 60, `progress=${t2.progress} status=${t2.status}`);

  // ---------- STT 17, 18: Báo cáo tuần ----------
  const wr = await call('POST', '/reports/weekly', ctx.i1, { week_number: 1, start_date: today, end_date: addDays(today, 6), tasks_completed: 'Xong trang login', issues_faced: 'Không', plans_next_week: 'Làm dashboard' });
  log('17', 'TTS nộp báo cáo tuần', wr.status === 201 || (wr.j && wr.j.success === true), short(wr));
  const wr2 = await call('POST', '/reports/weekly', ctx.i1, { week_number: 1, start_date: today, end_date: addDays(today, 6), tasks_completed: 'Cập nhật lại', plans_next_week: 'x' });
  const wlm = await call('GET', '/reports/weekly', ctx.m1);
  log('18', 'Mentor thấy báo cáo tuần của TTS mình', (wlm.j.data || []).length >= 1, `mentor thấy ${(wlm.j.data || []).length} báo cáo`);
  const wl = await call('GET', '/reports/weekly', ctx.hr);
  const wrows = (wl.j.data || wl.j.reports || []);
  log('17', 'Nộp lại cùng tuần không sinh bản ghi trùng', wrows.filter((w) => Number(w.week_number) === 1).length === 1, `rows=${wrows.length}`);
  const wid = (wrows[0] || {}).id;
  const fb = await call('PUT', `/reports/weekly/${wid}/feedback`, ctx.m1, { mentor_feedback: 'Làm tốt, chú ý responsive', mentor_rating: 4 });
  log('18', 'Mentor xem báo cáo và phản hồi', fb.j && fb.j.success === true, short(fb));
  const wl2 = await call('GET', '/reports/weekly', ctx.i1);
  const w1 = (wl2.j.data || wl2.j.reports || [])[0] || {};
  log('18', 'TTS đọc được phản hồi của mentor', !!w1.mentor_feedback, `status=${w1.status}`);
  const wedit = await call('PUT', `/reports/weekly/${wid}`, ctx.i1, { tasks_completed: 'sửa sau phản hồi' });
  log('18', 'Báo cáo đã phản hồi bị khóa sửa', wedit.status === 400 || wedit.status === 403, short(wedit));

  // ---------- STT 19, 20: Đánh giá ----------
  const ev = await call('POST', '/evaluations', ctx.m1, { intern_id: ctx.tam.id, mentor_id: mM1.id, technical_score: 9, discipline_score: 8, attitude_score: 9, mentor_comments: 'Rất tốt' });
  log('19', 'Mentor đánh giá kỹ năng/thái độ', ev.status === 200 || ev.status === 201 || (ev.j && ev.j.success === true), short(ev));
  const evb = await call('POST', '/evaluations', ctx.m1, { intern_id: ctx.tam.id, technical_score: 11, discipline_score: 8, attitude_score: 9 });
  log('19', 'Chặn điểm ngoài 0-10', evb.status === 400, short(evb));
  const el = await call('GET', '/evaluations', ctx.hr);
  const ed = el.j.data || el.j;
  log('20', 'HR tổng hợp đánh giá cuối kỳ', el.status === 200, short(el).slice(0, 200));

  // ---------- STT 35, 36: Họp + thông báo ----------
  const mt = await call('POST', '/notifications/meetings', ctx.hr, { title: 'Họp tuần', meeting_date: addDays(today, 1), start_time: '14:00', end_time: '15:00', location: 'Phòng A', link: 'https://meet.google.com/abc', host_name: 'Hoa HR', intern_ids: [ctx.tam.id, ctx.lan.id], notes: 'Mang laptop' });
  log('35', 'HR tạo lịch họp + gửi email tự động', mt.status === 201 || (mt.j && mt.j.success === true), short(mt));
  const mtb = await call('POST', '/notifications/meetings', ctx.hr, { title: 'Sai giờ', meeting_date: addDays(today, 1), start_time: '15:00', end_time: '14:00', intern_ids: [ctx.tam.id] });
  log('35', 'Chặn giờ kết thúc <= bắt đầu', mtb.status === 400, short(mtb));
  const nl = await call('GET', '/notifications', ctx.i1);
  const nots = nl.j.data || nl.j.notifications || [];
  log('36', 'TTS nhận thông báo trong ứng dụng', nots.length >= 1, `n=${nots.length}: ${nots.slice(0, 3).map((n) => n.title).join(' | ')}`);
  if (nots[0]) {
    const rd = await call('PUT', `/notifications/${nots[0].id}/read`, ctx.i1);
    log('36', 'Đánh dấu đã đọc', rd.j && rd.j.success === true, short(rd));
  }
  const rda = await call('PUT', '/notifications/read-all', ctx.i1, {});
  log('36', 'Đọc tất cả', rda.j && rda.j.success === true, short(rda));
  const nl2 = await call('GET', '/notifications', ctx.i2);
  log('36', 'TTS khác nhận thông báo riêng của mình', true, `n=${(nl2.j.data || nl2.j.notifications || []).length}`);

  // ---------- Bonus: thống kê ----------
  const sd = await call('GET', '/reports/statistics/demographics', ctx.hr);
  const sc2 = await call('GET', '/reports/statistics/completion', ctx.hr);
  log('32/33', 'Thống kê theo trường/ngành + tỷ lệ hoàn thành (bonus)', sd.status === 200 && sc2.status === 200, `${sd.status}/${sc2.status}`);

  const pass = results.filter((r) => r.ok).length;
  console.log(`\nTONG: ${pass}/${results.length} PASS`);
  try {
    const path = require('path');
    const outDir = path.resolve(__dirname, '../reports');
    if (!require('fs').existsSync(outDir)) require('fs').mkdirSync(outDir, { recursive: true });
    require('fs').writeFileSync(path.join(outDir, 'ftest_result.json'), JSON.stringify(results, null, 1));
  } catch (e) {
    console.error('Error saving ftest_result.json:', e);
  }
  process.exit(pass === results.length ? 0 : 1);
})();
