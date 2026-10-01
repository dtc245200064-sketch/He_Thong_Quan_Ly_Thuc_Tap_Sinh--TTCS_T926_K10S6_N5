// ==========================================================================
// QUẢN LÝ XÁC THỰC VÀ CHUYỂN ĐỔI GIAO DIỆN (THUẦN FRONTEND JAVASCRIPT)
// Tuyệt đối không dùng API / Backend. Xử lý trực tiếp qua DOM & localStorage.
// ==========================================================================

// 1. KHI BẤM NÚT "HR": KÍCH HOẠT VAI TRÒ HR VÀ ĐIỀN THÔNG TIN MẪU
function selectHRRole(button) {
  // Đặt trạng thái active duy nhất cho nút HR
  const buttons = document.querySelectorAll('.role-tabs .role-btn');
  buttons.forEach(btn => btn.classList.remove('active'));
  if (button) {
    button.classList.add('active');
  }

  // Điền thông tin tài khoản mẫu của HR
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  if (usernameInput) usernameInput.value = 'hr@company.vn';
  if (passwordInput) passwordInput.value = '123456';

  // Ẩn thông báo lỗi nếu có
  hideLoginError();
}

// 1.2. KHI BẤM NÚT "Thực tập sinh": KÍCH HOẠT VAI TRÒ THỰC TẬP SINH VÀ ĐIỀN THÔNG TIN MẪU
function selectInternRole(button) {
  // Đặt trạng thái active duy nhất cho nút Thực tập sinh
  const buttons = document.querySelectorAll('.role-tabs .role-btn');
  buttons.forEach(btn => btn.classList.remove('active'));
  if (button) {
    button.classList.add('active');
  }

  // Điền thông tin tài khoản mẫu của Thực tập sinh
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  if (usernameInput) usernameInput.value = 'intern@student.vn';
  if (passwordInput) passwordInput.value = '123456';

  // Ẩn thông báo lỗi nếu có
  hideLoginError();
}

// 1.3. KHI BẤM NÚT "Admin": KÍCH HOẠT VAI TRÒ ADMIN VÀ ĐIỀN THÔNG TIN MẪU
function selectAdminRole(button) {
  const buttons = document.querySelectorAll('.role-tabs .role-btn');
  buttons.forEach(btn => btn.classList.remove('active'));
  if (button) {
    button.classList.add('active');
  }

  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  if (usernameInput) usernameInput.value = 'admin@company.vn';
  if (passwordInput) passwordInput.value = '123456';

  hideLoginError();
}

// 2. KHI BẤM VÀO NÚT "Master":
// THÔNG BÁO TÍNH NĂNG ĐANG TRONG QUÁ TRÌNH PHÁT TRIỂN
function notifyRoleDeveloping(roleName) {
  const message = `Tính năng dành cho ${roleName} đang trong quá trình phát triển!`;
  alert(message);
  showLoginError(message);
}

// Tương thích ngược nếu còn chỗ nào gọi setRole
function setRole(button, email, roleName = '') {
  if (!roleName && button) {
    roleName = button.textContent.trim();
  }
  if (roleName === 'HR') {
    selectHRRole(button);
  } else if (roleName === 'Thực tập sinh') {
    selectInternRole(button);
  } else if (roleName === 'Admin') {
    selectAdminRole(button);
  } else {
    notifyRoleDeveloping(roleName);
  }
}

// 3. ẨN / HIỆN MẬT KHẨU
function togglePass() {
  const passInput = document.getElementById('password');
  const eyeImg = document.getElementById('eyeIcon') || document.querySelector('.toggle-eye img');
  if (!passInput) return;

  if (passInput.type === 'password') {
    passInput.type = 'text';
    if (eyeImg) {
      eyeImg.src = 'image/eye-off.svg';
      eyeImg.alt = 'Ẩn mật khẩu';
    }
  } else {
    passInput.type = 'password';
    if (eyeImg) {
      eyeImg.src = 'image/eye.svg';
      eyeImg.alt = 'Hiện mật khẩu';
    }
  }
}

// 4. HIỂN THỊ & ẨN THÔNG BÁO LỖI FORM
function showLoginError(message) {
  const errorBox = document.getElementById('loginErrorMsg');
  if (errorBox) {
    errorBox.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      <span>${message}</span>
    `;
    errorBox.style.display = 'flex';
  }
}

function hideLoginError() {
  const errorBox = document.getElementById('loginErrorMsg');
  if (errorBox) {
    errorBox.style.display = 'none';
  }
}

// 5. XỬ LÝ SUBMIT ĐĂNG NHẬP: GỌI API BACKEND KẾT NỐI DATABASE MYSQL
async function handleLogin(event) {
  if (event) event.preventDefault();
  hideLoginError();

  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const username = usernameInput ? usernameInput.value.trim() : '';
  const password = passwordInput ? passwordInput.value.trim() : '';

  if (!username) {
    alert('Vui lòng nhập tên đăng nhập hoặc email!');
    if (usernameInput) usernameInput.focus();
    return;
  }

  if (!password) {
    alert('Vui lòng nhập mật khẩu!');
    if (passwordInput) passwordInput.focus();
    return;
  }

  // 1. Thử gọi API Backend thực tế
  try {
    if (typeof apiLogin === 'function') {
      const response = await apiLogin(username, password);
      if (response && response.success) {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        const role = response.user.role;
        if (role === 'HR' || role === 'HR Manager') {
          localStorage.setItem('userRole', 'HR');
          window.location.href = 'dashboard.html';
          return;
        } else if (role === 'INTERN' || role === 'Thực tập sinh') {
          localStorage.setItem('userRole', 'INTERN');
          alert('Đăng nhập thành công! Đang chuyển đến Cổng thông tin Thực tập sinh...');
          window.location.href = 'intern.html';
          return;
        } else if (role === 'ADMIN' || role === 'Admin') {
          localStorage.setItem('userRole', 'ADMIN');
          alert('Đăng nhập thành công! Đang chuyển đến Trang Quản trị hệ thống...');
          window.location.href = 'admin.html';
          return;
        } else {
          notifyRoleDeveloping(role);
          return;
        }
      } else {
        const errMsg = (response && response.message) ? response.message : 'Email hoặc mật khẩu không chính xác!';
        showLoginError(errMsg);
        return;
      }
    }
  } catch (apiError) {
    console.warn('Backend API chưa sẵn sàng hoặc mất kết nối, chuyển sang chế độ dự phòng:', apiError);
  }

  // 2. Chế độ dự phòng offline (Local Mock Fallback)
  const lowerUser = username.toLowerCase();
  if (lowerUser === 'hr@company.vn' || lowerUser.includes('hr')) {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userRole', 'HR');
    localStorage.setItem('user', JSON.stringify({
      id: 2,
      name: "Nguyễn Thị Hoa",
      email: "hr@company.vn",
      role: "HR Manager",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80"
    }));
    window.location.href = 'dashboard.html';
    return;
  }

  if (lowerUser === 'intern@student.vn' || lowerUser.includes('intern') || lowerUser.includes('student')) {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userRole', 'INTERN');
    localStorage.setItem('user', JSON.stringify({
      id: 5,
      name: "Trần Minh Khoa",
      email: "khoatran@student.vn",
      role: "Thực tập sinh",
      studentId: "20210088",
      university: "Đại học Bách Khoa Hà Nội",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
    }));
    alert('Đăng nhập thành công! Đang chuyển đến Cổng thông tin Thực tập sinh...');
    window.location.href = 'intern.html';
    return;
  }

  if (lowerUser === 'admin@company.vn' || lowerUser.includes('admin')) {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userRole', 'ADMIN');
    localStorage.setItem('user', JSON.stringify({
      id: 1,
      name: "Lê Văn Admin",
      email: "admin@company.vn",
      role: "Admin",
      avatar: "image/GiangVien.png"
    }));
    alert('Đăng nhập thành công! Đang chuyển đến Trang Quản trị hệ thống...');
    window.location.href = 'admin.html';
    return;
  }

  const errorText = 'Email hoặc mật khẩu không chính xác!';
  showLoginError(errorText);
}

// 6. HÀM HIỂN THỊ GIAO DIỆN HR DASHBOARD (ẨN LOGIN VIEW, HIỆN HR VIEW)
function showHRDashboard() {
  const loginView = document.getElementById('login-view');
  const hrView = document.getElementById('hr-view');

  if (loginView) loginView.style.display = 'none';
  if (hrView) hrView.style.display = 'block';

  // Khởi tạo các bảng dữ liệu nếu dashboard.js đã nạp sẵn
  if (typeof renderOverview === 'function') renderOverview();
  if (typeof filterReviewData === 'function') filterReviewData();
  if (typeof filterData === 'function') filterData();
}

// 7. HÀM HIỂN THỊ MÀN HÌNH ĐĂNG NHẬP (ẨN HR VIEW, HIỆN LOGIN VIEW)
function showLoginView() {
  const loginView = document.getElementById('login-view');
  const hrView = document.getElementById('hr-view');

  if (hrView) hrView.style.display = 'none';
  if (loginView) loginView.style.display = 'flex';

  hideLoginError();
}

// 8. KIỂM TRA PHIÊN KHI TẢI TRANG (HỖ TRỢ CẢ HR VÀ THỰC TẬP SINH)
function checkAuthState() {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const userRole = localStorage.getItem('userRole');

  // NẾU ĐÃ ĐĂNG NHẬP VÀ VAI TRÒ LÀ "HR"
  if (isLoggedIn && (userRole === 'HR' || userRole === 'HR Manager')) {
    window.location.href = 'dashboard.html';
    return;
  }

  // NẾU ĐÃ ĐĂNG NHẬP VÀ VAI TRÒ LÀ "INTERN"
  if (isLoggedIn && userRole === 'INTERN') {
    window.location.href = 'intern.html';
    return;
  }

  // NẾU ĐÃ ĐĂNG NHẬP VÀ VAI TRÒ LÀ "ADMIN"
  if (isLoggedIn && userRole === 'ADMIN') {
    window.location.href = 'admin.html';
    return;
  }

  // Nếu không phải phiên hợp lệ -> Xóa sạch session và bắt buộc ở lại màn hình Login
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('userRole');
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('currentUser');

  showLoginView();
}

// 9. XỬ LÝ ĐĂNG XUẤT (CONFIRM LOGOUT)
function confirmLogout() {
  // Đóng modal đăng xuất
  if (typeof closeModal === 'function') {
    closeModal('logoutModal');
  } else {
    const modal = document.getElementById('logoutModal');
    if (modal) modal.classList.remove('active');
  }

  // Xóa sạch trạng thái đăng nhập
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('userRole');
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('currentUser');

  // Chuyển về màn hình đăng nhập (thuần DOM)
  if (document.getElementById('login-view')) {
    showLoginView();
    alert('Đã đăng xuất thành công khỏi hệ thống!');
  } else {
    // Nếu đang ở trang dashboard.html riêng biệt
    window.location.href = 'index.html';
  }
}

// 10. QUẢN LÝ MODAL TRÊN GIAO DIỆN
function openModal(modalId = 'logoutModal') {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('active');
}

function closeModal(modalId = 'logoutModal') {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('active');
}

// 11. ĐĂNG KÝ TÀI KHOẢN MỚI
function handleRegister() {
  alert('Chức năng đăng ký tài khoản Doanh nghiệp / HR đang được cập nhật!');
}

// ==========================================================================
// TỰ ĐỘNG CHẠY KHI MỞ TRANG
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  checkAuthState();
});