// Chọn vai trò đăng nhập
function setRole(button, email) {
  // Đổi nút active
  let buttons = document.querySelectorAll('.role-btn');
  buttons.forEach(btn => btn.classList.remove('active'));
  button.classList.add('active');

  // Điền email tương ứng vào ô tên đăng nhập
  document.getElementById('username').value = email;
}

// Ẩn / hiện mật khẩu
function togglePass() {
  let passInput = document.getElementById('password');
  let eye = document.querySelector('.toggle-eye');

  if (passInput.type === 'password') {
    passInput.type = 'text';
    eye.textContent = '🔒';
  } else {
    passInput.type = 'password';
    eye.textContent = '👁';
  }
}

// Xử lý khi nhấn nút Đăng nhập
function handleLogin(event) {
  event.preventDefault();
  let username = document.getElementById('username').value;
  alert('Đăng nhập thành công với tài khoản: ' + username);
}

// Mở modal xác nhận đăng xuất
function openModal() {
  document.getElementById('logoutModal').classList.add('active');
}

// Đóng modal xác nhận đăng xuất
function closeModal() {
  document.getElementById('logoutModal').classList.remove('active');
}

// Xác nhận đăng xuất
function confirmLogout() {
  alert('Đã đăng xuất khỏi hệ thống thành công!');
  closeModal();
}

// Bấm nút Đăng ký tài khoản mới
function handleRegister() {
  alert('Chuyển sang trang Đăng ký tài khoản mới!');
}


