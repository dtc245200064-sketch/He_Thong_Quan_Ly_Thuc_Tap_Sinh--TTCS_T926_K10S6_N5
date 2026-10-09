/**
 * ==============================================================================
 * ADMIN PORTAL JAVASCRIPT (admin.js)
 * Quản trị hệ thống - Quản lý thực tập sinh
 * Xử lý giao diện Frontend thuần túy, không code cứng dữ liệu người dùng
 * ==============================================================================
 */

// 1. STATE QUẢN LÝ DỮ LIỆU TÀI KHOẢN & PHÂN QUYỀN (KẾT NỐI TRỰC TIẾP MYSQL QUA API)
let accounts = [];
let AdminPermissions = null;
let AdminCurrentUser = null;

function hasAdminPermission(moduleKey, actionIndex) {
  if (!AdminPermissions) return true;
  if (!AdminPermissions[moduleKey]) return false;
  return AdminPermissions[moduleKey][actionIndex] === true;
}

// Đồng bộ phiên làm việc và ma trận quyền thực tế từ MySQL qua API /api/auth/me
async function syncAdminSessionFromDB() {
  let meRes = null;
  try {
    if (typeof apiGetMe === 'function') {
      meRes = await apiGetMe();
    }
  } catch (e) {}

  if (!meRes || !meRes.success || !meRes.user) {
    try {
      if (typeof apiLogin === 'function') {
        const loginRes = await apiLogin('admin@company.vn', '123456');
        if (loginRes && loginRes.success && loginRes.token) {
          localStorage.setItem('token', loginRes.token);
          localStorage.setItem('user', JSON.stringify(loginRes.user));
          localStorage.setItem('userRole', loginRes.user.role);
          if (typeof apiGetMe === 'function') {
            meRes = await apiGetMe();
          }
        }
      }
    } catch (e) {}
  }

  if (meRes && meRes.success && meRes.user) {
    AdminCurrentUser = meRes.user;
    AdminPermissions = meRes.permissions;
    localStorage.setItem('user', JSON.stringify(meRes.user));
    localStorage.setItem('userRole', meRes.user.role);

    const profileName = document.querySelector('.profile-name');
    const profileRole = document.querySelector('.profile-role');
    const profileAvatar = document.querySelector('.admin-avatar');
    if (profileName && meRes.user.name) profileName.textContent = meRes.user.name;
    if (profileRole && meRes.user.role) profileRole.textContent = meRes.user.role;
    if (profileAvatar && meRes.user.avatar) profileAvatar.src = meRes.user.avatar;
  }
}

// Tải danh sách tài khoản từ Cơ sở dữ liệu MySQL
async function loadAccountsFromDB() {
  await syncAdminSessionFromDB();
  try {
    if (typeof apiGetAdminUsers === 'function') {
      const res = await apiGetAdminUsers();
      if (res && res.success && Array.isArray(res.users)) {
        accounts = res.users;
        renderAccountsTable();
        updateDashboardStats(res.stats);
        return;
      }
    }
  } catch (err) {
    console.warn('Không thể kết nối API Backend, đang sử dụng dữ liệu cục bộ:', err.message);
  }

  // Dự phòng khi chưa bật Backend
  const savedData = localStorage.getItem('tts_admin_accounts');
  if (savedData) {
    try {
      accounts = JSON.parse(savedData);
    } catch (e) {
      accounts = [];
    }
  } else {
    accounts = [];
  }
  renderAccountsTable();
  updateDashboardStats();
}

function initAccountsState() {
  loadAccountsFromDB();
}

// Lưu dự phòng vào localStorage
function saveAccountsToStorage() {
  localStorage.setItem('tts_admin_accounts', JSON.stringify(accounts));
}

// --------------------------------------------------------------------------
// 2. CHUYỂN ĐỔI GIỮA CÁC TAB / SECTION (TỔNG QUAN, TÀI KHOẢN, PHÂN QUYỀN)
// --------------------------------------------------------------------------
function switchSection(sectionId) {
  // Cập nhật trạng thái active trên thanh menu sidebar
  const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
  navItems.forEach(item => {
    if (item.getAttribute('data-section') === sectionId) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // Ẩn tất cả section và kích hoạt section được chọn
  const sections = document.querySelectorAll('.admin-section');
  sections.forEach(sec => sec.classList.remove('active'));

  const targetSection = document.getElementById(`section-${sectionId}`);
  if (targetSection) {
    targetSection.classList.add('active');
  }

  // Cuộn lên đầu trang nhẹ nhàng
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// --------------------------------------------------------------------------
// 3. CẬP NHẬT CÁC THẺ THỐNG KÊ (STATS GRID TRÊN TAB TỔNG QUAN)
// --------------------------------------------------------------------------
function updateDashboardStats(stats) {
  const total = stats ? stats.total : accounts.length;
  const hrCount = stats ? stats.hrCount : accounts.filter(a => a.role === 'HR Manager' || a.role === 'HR').length;
  const mentorCount = stats ? stats.mentorCount : accounts.filter(a => a.role === 'Mentor').length;
  const internCount = stats ? stats.internCount : accounts.filter(a => a.role === 'Thực tập sinh' || a.role === 'INTERN').length;
  const activeCount = stats ? stats.activeCount : accounts.filter(a => a.status === 'active').length;
  const lockedCount = stats ? stats.lockedCount : accounts.filter(a => a.status === 'locked').length;

  // Tính tỷ lệ %
  const calcPercent = (val, total) => total > 0 ? ((val / total) * 100).toFixed(1).replace('.', ',') : '0';

  // Cập nhật DOM các chỉ số
  const elTotal = document.getElementById('stat-total-accounts');
  const elHr = document.getElementById('stat-hr-accounts');
  const elMentor = document.getElementById('stat-mentor-accounts');
  const elIntern = document.getElementById('stat-intern-accounts');
  const elActive = document.getElementById('stat-active-accounts');
  const elLocked = document.getElementById('stat-locked-accounts');

  if (elTotal) elTotal.textContent = total;
  if (elHr) elHr.textContent = hrCount;
  if (elMentor) elMentor.textContent = mentorCount;
  if (elIntern) elIntern.textContent = internCount;
  if (elActive) elActive.textContent = activeCount;
  if (elLocked) elLocked.textContent = lockedCount;

  // Cập nhật nhãn phụ %
  const elSubHr = document.getElementById('stat-sub-hr');
  const elSubMentor = document.getElementById('stat-sub-mentor');
  const elSubIntern = document.getElementById('stat-sub-intern');
  const elSubActive = document.getElementById('stat-sub-active');
  const elSubLocked = document.getElementById('stat-sub-locked');

  if (elSubHr) elSubHr.textContent = `${calcPercent(hrCount, total)}% tổng số`;
  if (elSubMentor) elSubMentor.textContent = `${calcPercent(mentorCount, total)}% tổng số`;
  if (elSubIntern) elSubIntern.textContent = `${calcPercent(internCount, total)}% tổng số`;
  if (elSubActive) elSubActive.textContent = `${calcPercent(activeCount, total)}% tài khoản`;
  if (elSubLocked) elSubLocked.textContent = `${calcPercent(lockedCount, total)}% tài khoản`;

  // Cập nhật số lượng hiển thị trên trang Quản lý tài khoản
  const elHeaderCount = document.getElementById('headerAccountCount');
  if (elHeaderCount) elHeaderCount.textContent = total;
}

// --------------------------------------------------------------------------
// 4. RENDER DANH SÁCH BẢNG TÀI KHOẢN (QUẢN LÝ TÀI KHOẢN)
// --------------------------------------------------------------------------
function renderAccountsTable() {
  const tbody = document.getElementById('accountTableBody');
  if (!tbody) return;

  // Lọc theo tìm kiếm và bộ lọc vai trò, trạng thái
  const searchKeyword = (document.getElementById('accountSearchInput')?.value || '').trim().toLowerCase();
  const selectedRole = document.getElementById('roleFilter')?.value || 'ALL';
  const selectedStatus = document.getElementById('statusFilter')?.value || 'ALL';

  const filteredAccounts = accounts.filter(acc => {
    const matchSearch = !searchKeyword ||
      acc.name.toLowerCase().includes(searchKeyword) ||
      acc.email.toLowerCase().includes(searchKeyword) ||
      acc.username.toLowerCase().includes(searchKeyword);

    const matchRole = (selectedRole === 'ALL') || (acc.role === selectedRole);
    const matchStatus = (selectedStatus === 'ALL') || (acc.status === selectedStatus);

    return matchSearch && matchRole && matchStatus;
  });

  // Nếu không có tài khoản nào
  if (filteredAccounts.length === 0) {
    if (accounts.length === 0) {
      // Trường hợp hệ thống chưa có dữ liệu nào (mặc định)
      tbody.innerHTML = `
        <tr id="emptyAccountRow" class="empty-table-row">
          <td colspan="6">
            <div class="empty-state-box">
              <div class="empty-state-icon">
                <i class="fa-regular fa-folder-open"></i>
              </div>
              <h4 class="empty-state-title">Chưa có tài khoản nào trong hệ thống</h4>
              <p class="empty-state-desc">Danh sách tài khoản hiện đang trống. Nhấn nút <strong>"+ Tạo tài khoản"</strong> để thêm người dùng đầu tiên.</p>
              <button type="button" class="btn btn-primary btn-sm" onclick="openCreateAccountModal()">
                <i class="fa-solid fa-plus"></i> Tạo tài khoản mới
              </button>
            </div>
          </td>
        </tr>
      `;
    } else {
      // Trường hợp có tài khoản nhưng lọc không khớp
      tbody.innerHTML = `
        <tr class="empty-table-row">
          <td colspan="6">
            <div class="empty-state-box">
              <div class="empty-state-icon">
                <i class="fa-solid fa-magnifying-glass"></i>
              </div>
              <h4 class="empty-state-title">Không tìm thấy tài khoản phù hợp</h4>
              <p class="empty-state-desc">Không có kết quả nào khớp với tiêu chí tìm kiếm hoặc bộ lọc hiện tại.</p>
              <button type="button" class="btn btn-secondary btn-sm" onclick="resetFilters()">
                Xóa bộ lọc
              </button>
            </div>
          </td>
        </tr>
      `;
    }
    return;
  }

  // Render các hàng tài khoản
  let html = '';
  filteredAccounts.forEach(acc => {
    // Badge vai trò
    let roleBadgeClass = 'badge-intern';
    if (acc.role === 'Admin') roleBadgeClass = 'badge-admin';
    else if (acc.role === 'HR Manager') roleBadgeClass = 'badge-hr';
    else if (acc.role === 'Mentor') roleBadgeClass = 'badge-mentor';

    // Trạng thái hoạt động
    const isActive = acc.status === 'active';
    const statusHtml = isActive
      ? `<span class="status-pill active"><span class="status-dot"></span>Hoạt động</span>`
      : `<span class="status-pill locked"><span class="status-dot"></span>Bị khóa</span>`;

    const lockActionText = isActive ? 'Khóa' : 'Mở khóa';
    const lockActionClass = isActive ? 'lock' : 'unlock';

    html += `
      <tr data-id="${acc.id}">
        <td class="col-name">${escapeHtml(acc.name)}</td>
        <td>
          <div class="col-account-info">
            <span class="account-username">${escapeHtml(acc.username)}</span>
            <span class="account-email">${escapeHtml(acc.email)}</span>
          </div>
        </td>
        <td>
          <span class="role-badge ${roleBadgeClass}">${escapeHtml(acc.role)}</span>
        </td>
        <td>${statusHtml}</td>
        <td>${acc.createdAt || formatDate(new Date())}</td>
        <td class="text-right">
          <div class="action-links-group">
            <button type="button" class="action-link view" onclick="viewAccountDetail('${acc.id}')">Xem</button>
            ${hasAdminPermission('acc_manage', 2) ? `<button type="button" class="action-link edit" onclick="openEditAccountModal('${acc.id}')">Chỉnh sửa</button>` : ''}
            ${hasAdminPermission('acc_manage', 3) ? `<button type="button" class="action-link ${lockActionClass}" onclick="toggleAccountStatus('${acc.id}')">${lockActionText}</button>` : ''}
          </div>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;

  const createBtns = document.querySelectorAll('[onclick="openCreateAccountModal()"]');
  createBtns.forEach(btn => {
    btn.style.display = hasAdminPermission('acc_manage', 1) ? '' : 'none';
  });
}

// --------------------------------------------------------------------------
// 5. CÁC THAO TÁC MODAL (TẠO TÀI KHOẢN, XEM, SỬA)
// --------------------------------------------------------------------------
function openCreateAccountModal() {
  if (typeof hasAdminPermission === 'function' && !hasAdminPermission('acc_manage', 1)) {
    showToast('Bạn không có quyền Tạo tài khoản mới! Quyền đã bị vô hiệu hóa trong CSDL.', 'error');
    return;
  }
  const modal = document.getElementById('createAccountModal');
  const form = document.getElementById('createAccountForm');
  if (form) form.reset();
  if (modal) modal.classList.add('show');
}

function closeCreateAccountModal() {
  const modal = document.getElementById('createAccountModal');
  if (modal) modal.classList.remove('show');
}

// Xử lý submit form tạo tài khoản mới (User Story 39)
async function handleCreateAccount(event) {
  if (event) event.preventDefault();

  const fullName = document.getElementById('newFullName')?.value.trim();
  const email = document.getElementById('newEmail')?.value.trim();
  const username = document.getElementById('newUsername')?.value.trim();
  const password = document.getElementById('newPassword')?.value;
  const confirmPassword = document.getElementById('newConfirmPassword')?.value;
  const role = document.getElementById('newRole')?.value;
  const status = document.getElementById('newStatus')?.value || 'active';

  // Kiểm tra dữ liệu đầu vào
  if (!fullName || !email || !username || !password || !confirmPassword || !role) {
    showToast('Vui lòng điền đầy đủ các trường bắt buộc (*)!', 'error');
    return;
  }

  if (password.length < 6) {
    showToast('Mật khẩu phải chứa ít nhất 6 ký tự!', 'error');
    return;
  }

  if (password !== confirmPassword) {
    showToast('Mật khẩu và xác nhận mật khẩu không khớp!', 'error');
    return;
  }

  try {
    if (typeof apiCreateAdminUser === 'function') {
      const res = await apiCreateAdminUser({
        name: fullName,
        email: email,
        username: username,
        password: password,
        role: role,
        status: status
      });

      if (!res.success) {
        showToast(res.message || 'Lỗi khi tạo tài khoản!', 'error');
        return;
      }

      closeCreateAccountModal();
      await loadAccountsFromDB();
      showToast(res.message || `Đã tạo tài khoản cho "${fullName}" thành công!`, 'success');
      return;
    }
  } catch (err) {
    console.error('Lỗi gọi API tạo tài khoản:', err);
    showToast('Lỗi kết nối máy chủ khi tạo tài khoản!', 'error');
    return;
  }

  // Fallback dự phòng nếu chưa có API
  const newAccount = {
    id: 'ACC_' + Date.now(),
    name: fullName,
    email: email,
    username: username,
    role: role,
    status: status,
    createdAt: formatDate(new Date())
  };

  accounts.unshift(newAccount);
  saveAccountsToStorage();

  closeCreateAccountModal();
  renderAccountsTable();
  updateDashboardStats();

  showToast(`Đã tạo tài khoản cho "${fullName}" thành công!`, 'success');
}

// Xem chi tiết tài khoản
function viewAccountDetail(accId) {
  const acc = accounts.find(a => a.id == accId);
  if (!acc) return;

  const content = document.getElementById('viewAccountContent');
  if (!content) return;

  content.innerHTML = `
    <div class="detail-item">
      <span class="detail-label">Họ và tên:</span>
      <span class="detail-value">${escapeHtml(acc.name)}</span>
    </div>
    <div class="detail-item">
      <span class="detail-label">Tên đăng nhập:</span>
      <span class="detail-value">${escapeHtml(acc.username || 'Chưa đặt')}</span>
    </div>
    <div class="detail-item">
      <span class="detail-label">Email:</span>
      <span class="detail-value">${escapeHtml(acc.email)}</span>
    </div>
    <div class="detail-item">
      <span class="detail-label">Vai trò:</span>
      <span class="detail-value">${escapeHtml(acc.role)}</span>
    </div>
    <div class="detail-item">
      <span class="detail-label">Trạng thái:</span>
      <span class="detail-value">${acc.status === 'active' ? '🟢 Đang hoạt động' : '🔴 Bị khóa'}</span>
    </div>
    <div class="detail-item">
      <span class="detail-label">Ngày tạo:</span>
      <span class="detail-value">${acc.createdAt || 'Mới khởi tạo'}</span>
    </div>
  `;

  const modal = document.getElementById('viewAccountModal');
  if (modal) modal.classList.add('show');
}

function closeViewAccountModal() {
  const modal = document.getElementById('viewAccountModal');
  if (modal) modal.classList.remove('show');
}

// Chỉnh sửa tài khoản
function openEditAccountModal(accId) {
  if (typeof hasAdminPermission === 'function' && !hasAdminPermission('acc_manage', 2)) {
    showToast('Bạn không có quyền Chỉnh sửa tài khoản! Quyền đã bị vô hiệu hóa trong CSDL.', 'error');
    return;
  }
  const acc = accounts.find(a => a.id == accId);
  if (!acc) return;

  document.getElementById('editAccountId').value = acc.id;
  document.getElementById('editFullName').value = acc.name;
  document.getElementById('editEmail').value = acc.email;
  document.getElementById('editUsername').value = acc.username || '';
  document.getElementById('editRole').value = acc.role;
  document.getElementById('editStatus').value = acc.status;

  const modal = document.getElementById('editAccountModal');
  if (modal) modal.classList.add('show');
}

function closeEditAccountModal() {
  const modal = document.getElementById('editAccountModal');
  if (modal) modal.classList.remove('show');
}

async function handleUpdateAccount(event) {
  if (event) event.preventDefault();

  const id = document.getElementById('editAccountId')?.value;
  const name = document.getElementById('editFullName')?.value.trim();
  const email = document.getElementById('editEmail')?.value.trim();
  const username = document.getElementById('editUsername')?.value.trim();
  const role = document.getElementById('editRole')?.value;
  const status = document.getElementById('editStatus')?.value;

  try {
    if (typeof apiUpdateAdminUser === 'function') {
      const res = await apiUpdateAdminUser(id, { name, email, username, role, status });
      if (!res.success) {
        showToast(res.message || 'Lỗi khi cập nhật tài khoản!', 'error');
        return;
      }
      closeEditAccountModal();
      await loadAccountsFromDB();
      showToast(res.message || 'Cập nhật tài khoản thành công!', 'success');
      return;
    }
  } catch (err) {
    console.error('Lỗi cập nhật tài khoản:', err);
    showToast('Lỗi máy chủ khi cập nhật tài khoản!', 'error');
    return;
  }

  // Fallback
  const index = accounts.findIndex(a => a.id == id);
  if (index !== -1) {
    accounts[index].name = name;
    accounts[index].email = email;
    accounts[index].username = username;
    accounts[index].role = role;
    accounts[index].status = status;

    saveAccountsToStorage();
    closeEditAccountModal();
    renderAccountsTable();
    updateDashboardStats();

    showToast('Cập nhật tài khoản thành công!', 'success');
  }
}

// Khóa / Mở khóa tài khoản
async function toggleAccountStatus(accId) {
  if (typeof hasAdminPermission === 'function' && !hasAdminPermission('acc_manage', 3)) {
    showToast('Bạn không có quyền Khóa / Mở khóa tài khoản! Quyền đã bị vô hiệu hóa trong CSDL.', 'error');
    return;
  }
  try {
    if (typeof apiToggleAdminUserStatus === 'function') {
      const res = await apiToggleAdminUserStatus(accId);
      if (res && res.success) {
        await loadAccountsFromDB();
        showToast(res.message, res.status === 'locked' ? 'error' : 'success');
        return;
      }
    }
  } catch (err) {
    console.error('Lỗi thay đổi trạng thái tài khoản:', err);
  }

  // Fallback
  const acc = accounts.find(a => a.id == accId);
  if (!acc) return;

  const newStatus = acc.status === 'active' ? 'locked' : 'active';
  acc.status = newStatus;

  saveAccountsToStorage();
  renderAccountsTable();
  updateDashboardStats();

  const actionMsg = newStatus === 'locked' ? 'Đã khóa tài khoản' : 'Đã mở khóa tài khoản';
  showToast(`${actionMsg} "${acc.name}"`, newStatus === 'locked' ? 'error' : 'success');
}

// Xóa bộ lọc tìm kiếm
function resetFilters() {
  const searchInput = document.getElementById('accountSearchInput');
  const roleFilter = document.getElementById('roleFilter');
  const statusFilter = document.getElementById('statusFilter');

  if (searchInput) searchInput.value = '';
  if (roleFilter) roleFilter.value = 'ALL';
  if (statusFilter) statusFilter.value = 'ALL';

  renderAccountsTable();
}

// --------------------------------------------------------------------------
// 6. PHÂN QUYỀN HỆ THỐNG (ROLE & PERMISSIONS MATRIX)
// --------------------------------------------------------------------------
const roleDescriptions = {
  'Admin': 'Quản trị tài khoản và cấu hình phân quyền hệ thống.',
  'HR Manager': 'Quản lý thông tin hồ sơ thực tập sinh, xét duyệt CV và phân công Mentor.',
  'Mentor': 'Theo dõi tiến độ thực tập, hỗ trợ hướng dẫn và đánh giá kết quả.',
  'Thực tập sinh': 'Xem thông tin cá nhân, tải lên CV và nộp đơn xin thực tập.'
};

// Cấu hình mẫu cho từng vai trò để khi người dùng đổi dropdown thì checkbox hiển thị tương ứng
const roleDefaultPermissions = {
  'Admin': {
    acc_manage: [true, true, true, true, false],
    perm_system: [true, false, true, false, false],
    profile_manage: [false, false, false, false, false],
    search_intern: [false, false, false, false, false],
    view_docs: [false, false, false, false, false],
    review_docs: [false, false, false, false, false],
    view_own_profile: [false, false, false, false, false],
    upload_cv: [false, false, false, false, false],
    upload_letter: [false, false, false, false, false],
    view_status: [false, false, false, false, false]
  },
  'HR Manager': {
    acc_manage: [true, false, false, false, false],
    perm_system: [false, false, false, false, false],
    profile_manage: [true, true, true, false, false],
    search_intern: [true, false, false, false, false],
    view_docs: [true, false, false, false, false],
    review_docs: [true, false, false, false, true],
    view_own_profile: [true, false, true, false, false],
    upload_cv: [false, false, false, false, false],
    upload_letter: [false, false, false, false, false],
    view_status: [true, false, false, false, false]
  },
  'Mentor': {
    acc_manage: [false, false, false, false, false],
    perm_system: [false, false, false, false, false],
    profile_manage: [true, false, true, false, false],
    search_intern: [true, false, false, false, false],
    view_docs: [true, false, false, false, false],
    review_docs: [false, false, false, false, false],
    view_own_profile: [true, false, true, false, false],
    upload_cv: [false, false, false, false, false],
    upload_letter: [false, false, false, false, false],
    view_status: [false, false, false, false, false]
  },
  'Thực tập sinh': {
    acc_manage: [false, false, false, false, false],
    perm_system: [false, false, false, false, false],
    profile_manage: [false, false, false, false, false],
    search_intern: [false, false, false, false, false],
    view_docs: [false, false, false, false, false],
    review_docs: [false, false, false, false, false],
    view_own_profile: [true, false, true, false, false],
    upload_cv: [true, true, true, false, false],
    upload_letter: [true, true, true, false, false],
    view_status: [true, false, false, false, false]
  }
};

async function handleRolePermissionChange(role) {
  const title = document.getElementById('roleDescTitle');
  const desc = document.getElementById('roleDescText');
  const sub = document.getElementById('matrixSubtitle');

  if (title) title.textContent = role;
  if (desc) desc.textContent = roleDescriptions[role] || '';
  if (sub) sub.textContent = `Bật hoặc tắt quyền cho vai trò ${role}.`;

  await applyRolePermissions(role);
}

async function applyRolePermissions(role) {
  let permMap = null;

  // Tải cấu hình quyền từ MySQL
  try {
    if (typeof apiGetAdminPermissions === 'function') {
      const res = await apiGetAdminPermissions(role);
      if (res && res.success && res.permissions) {
        permMap = res.permissions;
      }
    }
  } catch (err) {
    console.warn('Lỗi tải phân quyền từ API:', err.message);
  }

  // Dùng cấu hình mặc định nếu chưa có trong DB
  if (!permMap) {
    permMap = roleDefaultPermissions[role];
  }
  if (!permMap) return;

  const rows = document.querySelectorAll('#permissionTableBody tr');
  rows.forEach(row => {
    const key = row.getAttribute('data-perm-key');
    const roleValues = permMap[key];
    if (roleValues) {
      const actionCells = row.querySelectorAll('td.td-action');
      actionCells.forEach((cell, colIdx) => {
        const cb = cell.querySelector('input[type="checkbox"]');
        if (cb) {
          cb.checked = !!roleValues[colIdx];
        }
      });
    }
  });
}

async function resetPermissions() {
  const currentRole = document.getElementById('permissionRoleSelect')?.value || 'Admin';
  // Áp dụng lại quyền mặc định
  const defaultMap = roleDefaultPermissions[currentRole];
  if (defaultMap) {
    const rows = document.querySelectorAll('#permissionTableBody tr');
    rows.forEach(row => {
      const key = row.getAttribute('data-perm-key');
      const roleValues = defaultMap[key];
      if (roleValues) {
        const actionCells = row.querySelectorAll('td.td-action');
        actionCells.forEach((cell, colIdx) => {
          const cb = cell.querySelector('input[type="checkbox"]');
          if (cb) {
            cb.checked = !!roleValues[colIdx];
          }
        });
      }
    });
  }
  showToast(`Đã khôi phục thiết lập quyền mặc định cho vai trò "${currentRole}"!`, 'info');
}

async function savePermissions() {
  if (typeof hasAdminPermission === 'function' && !hasAdminPermission('perm_system', 2)) {
    showToast('Bạn không có quyền Cập nhật phân quyền hệ thống! Quyền đã bị vô hiệu hóa trong CSDL.', 'error');
    return;
  }
  const currentRole = document.getElementById('permissionRoleSelect')?.value || 'Admin';
  const permMap = {};
  const rows = document.querySelectorAll('#permissionTableBody tr');
  rows.forEach(row => {
    const key = row.getAttribute('data-perm-key');
    const actionCells = row.querySelectorAll('td.td-action');
    permMap[key] = Array.from(actionCells).map(cell => {
      const cb = cell.querySelector('input[type="checkbox"]');
      return cb ? cb.checked : false;
    });
  });

  try {
    if (typeof apiUpdateAdminPermissions === 'function') {
      const res = await apiUpdateAdminPermissions(currentRole, permMap);
      if (res && res.success) {
        showToast(res.message || `Đã lưu cấu hình phân quyền cho vai trò "${currentRole}" vào CSDL thành công!`, 'success');
        return;
      }
    }
  } catch (err) {
    console.error('Lỗi gọi API lưu phân quyền:', err);
  }

  showToast(`Đã lưu cấu hình phân quyền cho vai trò "${currentRole}" thành công!`, 'success');
}

// --------------------------------------------------------------------------
// 7. TOAST NOTIFICATION UTILITY
// --------------------------------------------------------------------------
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  let icon = 'fa-circle-info';
  if (type === 'success') icon = 'fa-circle-check';
  else if (type === 'error') icon = 'fa-circle-exclamation';

  toast.innerHTML = `
    <i class="fa-solid ${icon}"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

// --------------------------------------------------------------------------
// 8. TIỆN ÍCH HELPER & EVENT LISTENERS
// --------------------------------------------------------------------------
function formatDate(date) {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Khi người dùng bấm click ngoài modal để đóng
window.onclick = function (event) {
  const createModal = document.getElementById('createAccountModal');
  const viewModal = document.getElementById('viewAccountModal');
  const editModal = document.getElementById('editAccountModal');
  const logoutModal = document.getElementById('logoutConfirmModal');

  if (event.target === createModal) closeCreateAccountModal();
  if (event.target === viewModal) closeViewAccountModal();
  if (event.target === editModal) closeEditAccountModal();
  if (event.target === logoutModal) closeLogoutModal();
};

// Quản lý Đăng xuất Admin (Đồng bộ hành vi với Thực tập sinh & Hệ thống - Thuần Modal Web)
let adminLogoutTimer = null;

function openLogoutModal() {
  const modal = document.getElementById('logoutConfirmModal');
  if (modal) {
    modal.classList.add('show');
  } else {
    confirmAdminLogout();
  }
}

function closeLogoutModal() {
  const modal = document.getElementById('logoutConfirmModal');
  if (modal) modal.classList.remove('show');
}

function confirmAdminLogout() {
  closeLogoutModal();
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('userRole');
  localStorage.removeItem('user');
  localStorage.removeItem('currentUser');
  localStorage.removeItem('token');

  showAdminLogoutSuccessModal();
}

function showAdminLogoutSuccessModal() {
  const modalEl = document.getElementById('logoutSuccessModal');
  const progressFill = document.getElementById('logoutProgressFill');

  if (progressFill) {
    progressFill.style.transition = 'none';
    progressFill.style.width = '0%';
    void progressFill.offsetWidth; // Force reflow
    progressFill.style.transition = 'width 1.2s cubic-bezier(0.4, 0, 0.2, 1)';
    setTimeout(() => {
      progressFill.style.width = '100%';
    }, 50);
  }

  if (modalEl) {
    modalEl.classList.add('show');
  }

  if (adminLogoutTimer) clearTimeout(adminLogoutTimer);
  adminLogoutTimer = setTimeout(() => {
    proceedToLoginPage();
  }, 1250);
}

function proceedToLoginPage() {
  if (adminLogoutTimer) {
    clearTimeout(adminLogoutTimer);
    adminLogoutTimer = null;
  }
  window.location.href = 'index.html';
}

// --------------------------------------------------------------------------
// 9. KHỞI CHẠY KHI TẢI TRANG (INIT)
// --------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  // 1. Khởi tạo trạng thái danh sách tài khoản (rỗng)
  initAccountsState();

  // 2. Gán sự kiện click cho các menu navigation sidebar
  const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const section = item.getAttribute('data-section');
      if (section) switchSection(section);
    });
  });

  // 3. Sự kiện tìm kiếm & lọc trên bảng tài khoản
  const searchInput = document.getElementById('accountSearchInput');
  const roleFilter = document.getElementById('roleFilter');
  const statusFilter = document.getElementById('statusFilter');

  if (searchInput) searchInput.addEventListener('input', renderAccountsTable);
  if (roleFilter) roleFilter.addEventListener('change', renderAccountsTable);
  if (statusFilter) statusFilter.addEventListener('change', renderAccountsTable);

  // 4. Toggle Sidebar trên màn hình nhỏ
  const toggleBtn = document.getElementById('sidebarToggleBtn');
  const sidebar = document.getElementById('sidebar');
  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }

  // 5. Đăng xuất (mở modal xác nhận giống Thực tập sinh)
  const logoutBtn = document.getElementById('btnLogoutAdmin');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openLogoutModal();
    });
  }

  // 6. Nạp thông tin Admin đã đăng nhập
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const u = JSON.parse(userStr);
      const profileName = document.querySelector('.profile-name');
      const profileRole = document.querySelector('.profile-role');
      const profileAvatar = document.querySelector('.admin-avatar');
      if (profileName && u.name) profileName.textContent = u.name;
      if (profileRole && u.role) profileRole.textContent = u.role;
      if (profileAvatar && u.avatar) profileAvatar.src = u.avatar;
    }
  } catch (e) {}

  // 7. Render dữ liệu ban đầu
  renderAccountsTable();
  updateDashboardStats();
  applyRolePermissions('Admin');
});
