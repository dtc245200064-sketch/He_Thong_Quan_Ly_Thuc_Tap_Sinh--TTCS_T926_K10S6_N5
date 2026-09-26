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
  const passInput = document.getElementById('password');
  const eyeImg = document.getElementById('eyeIcon') || document.querySelector('.toggle-eye img');

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

// Xử lý khi nhấn nút Đăng nhập (Chuyển hướng trực tiếp để làm giao diện)
function handleLogin(event) {
  event.preventDefault();
  window.location.href = 'dashboard.html';
}

// Xử lý khi nhấn nút Đăng ký tài khoản mới
function handleRegister() {
  alert('Chức năng đăng ký tài khoản đang được cập nhật!');
}

// Quản lý Modal xác nhận đăng xuất
function openModal() {
  const modal = document.getElementById('logoutModal');
  if (modal) {
    modal.classList.add('active');
  }
}

function closeModal() {
  const modal = document.getElementById('logoutModal');
  if (modal) {
    modal.classList.remove('active');
  }
}

function confirmLogout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  closeModal();
  alert('Đã đăng xuất thành công khỏi hệ thống!');
}

// Đóng modal khi nhấn ra vùng mờ bên ngoài
window.addEventListener('click', function(event) {
  const modal = document.getElementById('logoutModal');
  if (event.target === modal) {
    closeModal();
  }
});