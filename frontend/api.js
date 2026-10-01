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

// 7. Tải lên tài liệu thực tế (PDF, Ảnh...): POST /api/interns/:id/documents
async function apiUploadDocument(internId, docType, file) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('docType', docType || 'CV');

  const token = localStorage.getItem('token');
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

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
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
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

