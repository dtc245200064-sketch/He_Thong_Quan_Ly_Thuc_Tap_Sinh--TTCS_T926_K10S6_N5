// ==========================================
// CẤU HÌNH API CLIENT (DÙNG CHUNG CHO FRONTEND)
// ==========================================

const API_BASE_URL = 'http://localhost:5000/api';

// Hàm lấy token từ localStorage và vai trò người dùng
function getAuthHeaders() {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('userRole');
  const headers = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (role) {
    headers['x-user-role'] = role;
  }
  return headers;
}

// 0. Lấy thông tin tài khoản và ma trận quyền mới nhất từ MySQL: GET /api/auth/me
async function apiGetMe() {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return await res.json();
  } catch (e) {
    console.warn('Lỗi gọi apiGetMe:', e);
    return { success: false, message: e.message };
  }
}

// 1. Đăng nhập HR Manager: POST /api/auth/login
async function apiLogin(email, password) {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return await res.json();
}

// 2. Lấy danh sách thực tập sinh: GET /api/interns?search=...&school=...&dept=...
async function apiGetInterns(params = {}) {
  const query = new URLSearchParams();
  if (params.search) query.append('search', params.search);
  if (params.school) query.append('school', params.school);
  if (params.dept) query.append('dept', params.dept);

  const url = `${API_BASE_URL}/interns${query.toString() ? '?' + query.toString() : ''}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  return await res.json();
}

// 3. Thêm mới thực tập sinh: POST /api/interns
async function apiCreateIntern(internData) {
  const res = await fetch(`${API_BASE_URL}/interns`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(internData)
  });
  return await res.json();
}

// 4. Cập nhật thông tin thực tập sinh: PUT /api/interns/:id
async function apiUpdateIntern(id, internData) {
  const res = await fetch(`${API_BASE_URL}/interns/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(internData)
  });
  return await res.json();
}

// 5. Xem chi tiết hồ sơ & tài liệu: GET /api/interns/:id/documents
async function apiGetInternDocuments(id) {
  const res = await fetch(`${API_BASE_URL}/interns/${id}/documents`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  return await res.json();
}

// 6. Duyệt / Từ chối tài liệu: PATCH /api/interns/:id/documents/status
async function apiUpdateDocumentStatus(id, status, note = '') {
  const res = await fetch(`${API_BASE_URL}/interns/${id}/documents/status`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status, note })
  });
  return await res.json();
}

// 7. Tải lên tài liệu thực tế (PDF, Ảnh...): POST /api/interns/:id/documents
async function apiUploadDocument(internId, docType, file) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('docType', docType || 'CV');

  const token = localStorage.getItem('token');
  const role = localStorage.getItem('userRole');
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (role) headers['x-user-role'] = role;

  const res = await fetch(`${API_BASE_URL}/interns/${internId}/documents`, {
    method: 'POST',
    headers: headers,
    body: formData
  });
  return await res.json();
}

// 8. Xóa thực tập sinh: DELETE /api/interns/:id
async function apiDeleteIntern(id) {
  const res = await fetch(`${API_BASE_URL}/interns/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  return await res.json();
}

// 9. Xóa tài liệu của thực tập sinh: DELETE /api/interns/:id/documents/:docType
async function apiDeleteDocument(internId, docType) {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('userRole');
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (role) headers['x-user-role'] = role;

  const res = await fetch(`${API_BASE_URL}/interns/${internId}/documents/${docType}`, {
    method: 'DELETE',
    headers: headers
  });
  return await res.json();
}

// ==========================================
// API DÀNH CHO PHÂN HỆ QUẢN TRỊ VIÊN (ADMIN)
// ==========================================

// 10. Lấy danh sách tài khoản & thống kê: GET /api/admin/users
async function apiGetAdminUsers(params = {}) {
  const query = new URLSearchParams();
  if (params.search) query.append('search', params.search);
  if (params.role) query.append('role', params.role);
  if (params.status) query.append('status', params.status);

  const url = `${API_BASE_URL}/admin/users${query.toString() ? '?' + query.toString() : ''}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  return await res.json();
}

// 11. Tạo tài khoản người dùng mới: POST /api/admin/users (User Story 39)
async function apiCreateAdminUser(userData) {
  const res = await fetch(`${API_BASE_URL}/admin/users`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(userData)
  });
  return await res.json();
}

// 12. Cập nhật tài khoản: PUT /api/admin/users/:id
async function apiUpdateAdminUser(id, userData) {
  const res = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(userData)
  });
  return await res.json();
}

// 13. Khóa / Mở khóa tài khoản: PATCH /api/admin/users/:id/status
async function apiToggleAdminUserStatus(id) {
  const res = await fetch(`${API_BASE_URL}/admin/users/${id}/status`, {
    method: 'PATCH',
    headers: getAuthHeaders()
  });
  return await res.json();
}

// 14. Lấy ma trận phân quyền: GET /api/admin/permissions (User Story 40)
async function apiGetAdminPermissions(role = '') {
  const url = `${API_BASE_URL}/admin/permissions${role ? '?role=' + encodeURIComponent(role) : ''}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  return await res.json();
}

// 15. Cập nhật ma trận phân quyền: PUT /api/admin/permissions (User Story 40)
async function apiUpdateAdminPermissions(role, permissions) {
  const res = await fetch(`${API_BASE_URL}/admin/permissions`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ role, permissions })
  });
  return await res.json();
}

// ==========================================
// API CLIENT CHO SPRINT 2 (MYSQL PERSISTENCE)
// ==========================================

// 16. Lấy danh sách chương trình thực tập: GET /api/programs
async function apiGetPrograms(params = {}) {
  const query = new URLSearchParams(params).toString();
  const url = `${API_BASE_URL}/programs${query ? '?' + query : ''}`;
  const res = await fetch(url, { headers: getAuthHeaders() });
  return await res.json();
}

// 17. Tạo mới chương trình thực tập: POST /api/programs
async function apiCreateProgram(programData) {
  const res = await fetch(`${API_BASE_URL}/programs`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(programData)
  });
  return await res.json();
}

// 18. Lấy bảng chấm công: GET /api/attendance
async function apiGetAttendance(params = {}) {
  const query = new URLSearchParams(params).toString();
  const url = `${API_BASE_URL}/attendance${query ? '?' + query : ''}`;
  const res = await fetch(url, { headers: getAuthHeaders() });
  return await res.json();
}

// 19. HR chấm công / sửa trạng thái theo ngày: POST /api/attendance/mark
async function apiMarkAttendance(data) {
  const res = await fetch(`${API_BASE_URL}/attendance/mark`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  return await res.json();
}

// 20. TTS check-in / check-out hôm nay: POST /api/attendance/check-in-out
async function apiCheckInOut(internId, date = '') {
  const payload = { intern_id: internId };
  if (date) payload.date = date;
  const res = await fetch(`${API_BASE_URL}/attendance/check-in-out`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });
  return await res.json();
}

// 21. Lấy danh sách đơn nghỉ phép: GET /api/leaves
async function apiGetLeaves(params = {}) {
  const query = new URLSearchParams(params).toString();
  const url = `${API_BASE_URL}/leaves${query ? '?' + query : ''}`;
  const res = await fetch(url, { headers: getAuthHeaders() });
  return await res.json();
}

// 22. TTS tạo đơn xin nghỉ phép: POST /api/leaves
async function apiCreateLeave(leaveData) {
  const res = await fetch(`${API_BASE_URL}/leaves`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(leaveData)
  });
  return await res.json();
}

// 23. HR duyệt / từ chối đơn nghỉ phép: PATCH /api/leaves/:id/review
async function apiReviewLeave(id, status, reviewNote = '') {
  const res = await fetch(`${API_BASE_URL}/leaves/${id}/review`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status, review_note: reviewNote })
  });
  return await res.json();
}

// 24. Lấy danh sách hợp đồng thực tập: GET /api/contracts
async function apiGetContracts(params = {}) {
  const query = new URLSearchParams(params).toString();
  const url = `${API_BASE_URL}/contracts${query ? '?' + query : ''}`;
  const res = await fetch(url, { headers: getAuthHeaders() });
  return await res.json();
}

// 24.1. Tạo / Cập nhật hợp đồng thực tập: POST /api/contracts
async function apiCreateContract(contractData, file = null) {
  try {
    const token = localStorage.getItem('token');
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    let body;
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      Object.keys(contractData).forEach(key => {
        if (contractData[key] !== undefined && contractData[key] !== null) {
          formData.append(key, contractData[key]);
        }
      });
      body = formData;
    } else {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify(contractData);
    }

    const res = await fetch(`${API_BASE_URL}/contracts`, {
      method: 'POST',
      headers,
      body
    });
    return await res.json();
  } catch (e) {
    console.warn('Lỗi gọi apiCreateContract:', e);
    return { success: false, message: e.message };
  }
}

// 24.2. Xóa hợp đồng thực tập: DELETE /api/contracts/:id
async function apiDeleteContract(idOrInternId) {
  try {
    const res = await fetch(`${API_BASE_URL}/contracts/${idOrInternId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return await res.json();
  } catch (e) {
    console.warn('Lỗi gọi apiDeleteContract:', e);
    return { success: false, message: e.message };
  }
}

// 25. TTS xác nhận ký / từ chối hợp đồng: PATCH /api/contracts/:id/confirm
async function apiConfirmContract(id, status, reason = '') {
  const res = await fetch(`${API_BASE_URL}/contracts/${id}/confirm`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status, reason })
  });
  return await res.json();
}

// 26. Lấy lịch sử email hệ thống đã gửi: GET /api/interns/emails/history
async function apiGetSystemEmails(email = '') {
  try {
    const query = email ? `?email=${encodeURIComponent(email)}` : '';
    const res = await fetch(`${API_BASE_URL}/interns/emails/history${query}`, {
      headers: getAuthHeaders()
    });
    return await res.json();
  } catch (e) {
    console.warn('Lỗi gọi apiGetSystemEmails:', e);
    return { success: false, data: [] };
  }
}

// ==============================================================================
// CÁC HÀM API CHO SPRINT 3 (CÔNG VIỆC, BÁO CÁO, ĐÁNH GIÁ, MENTOR, THỐNG KÊ & TÍCH HỢP)
// ==============================================================================

// 27. Tasks: GET /api/tasks & POST /api/tasks & PUT /api/tasks/:id/progress
async function apiGetTasks(params = {}) {
  try {
    const q = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE_URL}/tasks${q ? '?' + q : ''}`, { headers: getAuthHeaders() });
    return await res.json();
  } catch (e) {
    console.warn('Lỗi apiGetTasks:', e);
    return { success: false, data: [] };
  }
}

async function apiCreateTask(data) {
  const res = await fetch(`${API_BASE_URL}/tasks`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  return await res.json();
}

async function apiUpdateTask(id, data) {
  const res = await fetch(`${API_BASE_URL}/tasks/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  return await res.json();
}

async function apiUpdateTaskProgress(id, data) {
  const res = await fetch(`${API_BASE_URL}/tasks/${id}/progress`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  return await res.json();
}

async function apiDeleteTask(id) {
  const res = await fetch(`${API_BASE_URL}/tasks/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  return await res.json();
}

async function apiFeedbackTask(id, data) {
  const res = await fetch(`${API_BASE_URL}/tasks/${id}/feedback`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  return await res.json();
}

// 28. Weekly Reports: GET /api/reports/weekly & POST /api/reports/weekly & PUT /api/reports/weekly/:id/feedback
async function apiGetWeeklyReports(params = {}) {
  try {
    const q = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE_URL}/reports/weekly${q ? '?' + q : ''}`, { headers: getAuthHeaders() });
    return await res.json();
  } catch (e) {
    console.warn('Lỗi apiGetWeeklyReports:', e);
    return { success: false, data: [] };
  }
}

async function apiSubmitWeeklyReport(data) {
  const res = await fetch(`${API_BASE_URL}/reports/weekly`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  return await res.json();
}

async function apiUpdateWeeklyReport(id, data) {
  const res = await fetch(`${API_BASE_URL}/reports/weekly/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  return await res.json();
}

async function apiDeleteWeeklyReport(id) {
  const res = await fetch(`${API_BASE_URL}/reports/weekly/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  return await res.json();
}

async function apiFeedbackWeeklyReport(id, data) {
  const res = await fetch(`${API_BASE_URL}/reports/weekly/${id}/feedback`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  return await res.json();
}

// 29. Statistics: Thống kê trường/ngành & tỷ lệ hoàn thành (STT 32, 33)
async function apiGetStatisticsDemographics() {
  try {
    const res = await fetch(`${API_BASE_URL}/reports/statistics/demographics`, { headers: getAuthHeaders() });
    return await res.json();
  } catch (e) {
    console.warn('Lỗi apiGetStatisticsDemographics:', e);
    return { success: false, data: {} };
  }
}

async function apiGetStatisticsCompletion() {
  try {
    const res = await fetch(`${API_BASE_URL}/reports/statistics/completion`, { headers: getAuthHeaders() });
    return await res.json();
  } catch (e) {
    console.warn('Lỗi apiGetStatisticsCompletion:', e);
    return { success: false, data: {} };
  }
}

// 30. Evaluations: GET /api/evaluations & POST /api/evaluations (STT 19, 20)
async function apiGetAllEvaluations() {
  try {
    const res = await fetch(`${API_BASE_URL}/evaluations`, { headers: getAuthHeaders() });
    return await res.json();
  } catch (e) {
    console.warn('Lỗi apiGetAllEvaluations:', e);
    return { success: false, data: [] };
  }
}

async function apiGetEvaluationByIntern(internId) {
  try {
    const res = await fetch(`${API_BASE_URL}/evaluations/intern/${internId}`, { headers: getAuthHeaders() });
    return await res.json();
  } catch (e) {
    console.warn('Lỗi apiGetEvaluationByIntern:', e);
    return { success: false, data: null };
  }
}

async function apiSaveEvaluation(data) {
  const res = await fetch(`${API_BASE_URL}/evaluations`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  return await res.json();
}

// 31. Mentors: GET /api/mentors & POST /api/mentors & PUT /api/mentors/:id & POST /api/mentors/assign (STT 29, 30, 31)
async function apiGetAvailableMentorUsers(currentMentorId = '') {
  try {
    const q = currentMentorId ? `?current_mentor_id=${encodeURIComponent(currentMentorId)}` : '';
    const res = await fetch(`${API_BASE_URL}/mentors/available-users${q}`, { headers: getAuthHeaders() });
    return await res.json();
  } catch (e) {
    console.warn('Lỗi apiGetAvailableMentorUsers:', e);
    return { success: false, data: [] };
  }
}

async function apiGetMentors() {
  try {
    const res = await fetch(`${API_BASE_URL}/mentors`, { headers: getAuthHeaders() });
    return await res.json();
  } catch (e) {
    console.warn('Lỗi apiGetMentors:', e);
    return { success: false, data: [] };
  }
}

async function apiCreateMentor(data) {
  const res = await fetch(`${API_BASE_URL}/mentors`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  return await res.json();
}

async function apiUpdateMentor(id, data) {
  const res = await fetch(`${API_BASE_URL}/mentors/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  return await res.json();
}

async function apiDeleteMentor(id) {
  const res = await fetch(`${API_BASE_URL}/mentors/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  return await res.json();
}

async function apiAssignMentor(data) {
  const res = await fetch(`${API_BASE_URL}/mentors/assign`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  return await res.json();
}

// 32. In-App Notifications & Meetings: GET & PUT & POST (STT 35, 36)
async function apiGetInAppNotifications(params = {}) {
  try {
    const q = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE_URL}/notifications${q ? '?' + q : ''}`, { headers: getAuthHeaders() });
    return await res.json();
  } catch (e) {
    console.warn('Lỗi apiGetInAppNotifications:', e);
    return { success: false, data: [] };
  }
}

async function apiMarkNotificationRead(id) {
  const res = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
    method: 'PUT',
    headers: getAuthHeaders()
  });
  return await res.json();
}

async function apiMarkAllNotificationsRead(data = {}) {
  const res = await fetch(`${API_BASE_URL}/notifications/read-all`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  return await res.json();
}

async function apiDeleteNotification(id) {
  const res = await fetch(`${API_BASE_URL}/notifications/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  return await res.json();
}

async function apiCreateInAppNotification(data) {
  const res = await fetch(`${API_BASE_URL}/notifications`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  return await res.json();
}

async function apiCreateMeeting(data) {
  const res = await fetch(`${API_BASE_URL}/notifications/meetings`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  return await res.json();
}

async function apiGetMeetings() {
  try {
    const res = await fetch(`${API_BASE_URL}/notifications/meetings`, { headers: getAuthHeaders() });
    return await res.json();
  } catch (e) {
    console.warn('Lỗi apiGetMeetings:', e);
    return { success: false, data: [] };
  }
}

// 33. Integrations: GET & PUT & SYNC & CHECK-IN (STT 37, 38)
async function apiGetIntegrations() {
  try {
    const res = await fetch(`${API_BASE_URL}/integrations`, { headers: getAuthHeaders() });
    return await res.json();
  } catch (e) {
    console.warn('Lỗi apiGetIntegrations:', e);
    return { success: false, data: [] };
  }
}

async function apiUpdateIntegration(type, data) {
  const res = await fetch(`${API_BASE_URL}/integrations/${type}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  return await res.json();
}

async function apiSyncHRM() {
  const res = await fetch(`${API_BASE_URL}/integrations/hrm/sync`, {
    method: 'POST',
    headers: getAuthHeaders()
  });
  return await res.json();
}

async function apiSimulateQRCheckIn(data) {
  const res = await fetch(`${API_BASE_URL}/integrations/qr-attendance/checkin`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  return await res.json();
}

// 40. Lịch thực tập (Intern Schedules) - MySQL Database
async function apiGetSchedules(params = {}) {
  try {
    const q = new URLSearchParams();
    if (params.intern_id) q.append('intern_id', params.intern_id);
    if (params.from) q.append('from', params.from);
    if (params.to) q.append('to', params.to);
    if (params.mentor_id) q.append('mentor_id', params.mentor_id);
    const url = `${API_BASE_URL}/schedules${q.toString() ? '?' + q.toString() : ''}`;
    const res = await fetch(url, { headers: getAuthHeaders() });
    return await res.json();
  } catch (e) {
    console.warn('Lỗi apiGetSchedules:', e);
    return { success: false, data: [] };
  }
}

async function apiCreateSchedule(data) {
  const res = await fetch(`${API_BASE_URL}/schedules`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  return await res.json();
}

async function apiUpdateSchedule(id, data) {
  const res = await fetch(`${API_BASE_URL}/schedules/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  return await res.json();
}

async function apiDeleteSchedule(id) {
  const res = await fetch(`${API_BASE_URL}/schedules/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  return await res.json();
}

// 41. Quản lý Phòng ban (Departments) - MySQL Database
async function apiGetDepartments() {
  try {
    const res = await fetch(`${API_BASE_URL}/departments`, { headers: getAuthHeaders() });
    return await res.json();
  } catch (e) {
    console.warn('Lỗi apiGetDepartments:', e);
    return { success: false, data: [] };
  }
}

async function apiCreateDepartment(deptData) {
  const res = await fetch(`${API_BASE_URL}/departments`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(deptData)
  });
  return await res.json();
}

async function apiUpdateDepartment(id, deptData) {
  const res = await fetch(`${API_BASE_URL}/departments/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(deptData)
  });
  return await res.json();
}

async function apiDeleteDepartment(id) {
  const res = await fetch(`${API_BASE_URL}/departments/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  return await res.json();
}

// 42. Cập nhật & Xóa Chương trình thực tập - MySQL Database
async function apiUpdateProgram(id, programData) {
  const res = await fetch(`${API_BASE_URL}/programs/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(programData)
  });
  return await res.json();
}

async function apiDeleteProgram(id) {
  const res = await fetch(`${API_BASE_URL}/programs/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  return await res.json();
}

// 43. Lấy lịch sử email hệ thống từ MySQL Database: GET /api/system-emails
async function apiGetSystemEmails(recipientEmail = '') {
  try {
    const url = `${API_BASE_URL}/system-emails${recipientEmail ? '?recipient_email=' + encodeURIComponent(recipientEmail) : ''}`;
    const res = await fetch(url, { headers: getAuthHeaders() });
    return await res.json();
  } catch (e) {
    console.warn('Lỗi apiGetSystemEmails:', e);
    return { success: false, data: [] };
  }
}



