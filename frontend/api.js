// ==========================================
// CẤU HÌNH API CLIENT (DÙNG CHUNG CHO FRONTEND)
// ==========================================

const API_BASE_URL = 'http://localhost:5000/api';

// Hàm lấy token từ localStorage
function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
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
