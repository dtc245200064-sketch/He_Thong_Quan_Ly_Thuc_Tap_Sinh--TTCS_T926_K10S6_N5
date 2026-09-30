/**
 * ==============================================================================
 * CỔNG THÔNG TIN THỰC TẬP SINH (INTERN PORTAL) - JAVASCRIPT LOGIC
 * Tái cấu trúc chuẩn xác theo giao diện thực tế (Screenshots)
 * ==============================================================================
 */

// ==============================================================================
// 1. STATE MANAGEMENT
// ==============================================================================
const InternState = {
  // Trạng thái tab hiện tại: 'overview' | 'documents'
  currentTab: 'overview',

  // Loại tài liệu đang mở trong modal: 'cv' | 'application'
  modalType: 'cv',
  tempFile: null,

  // Dữ liệu tài liệu (Lưu và phục hồi từ localStorage)
  docs: {
    cv: {
      uploaded: false,
      name: '',
      size: '',
      time: '',
      type: 'pdf'
    },
    application: {
      uploaded: false,
      name: '',
      size: '',
      time: '',
      type: 'doc'
    }
  }
};

// ==============================================================================
// 2. CHUYỂN TAB ĐIỀU HƯỚNG (TỔNG QUAN <-> HỒ SƠ & TÀI LIỆU)
// ==============================================================================
function switchPortalTab(tabName) {
  InternState.currentTab = tabName;

  // Cập nhật nút active trên sidebar
  const menuOverview = document.getElementById('menu-overview');
  const menuDocs = document.getElementById('menu-documents');
  const tabOverview = document.getElementById('tab-overview');
  const tabDocs = document.getElementById('tab-documents');

  if (tabName === 'overview') {
    if (menuOverview) menuOverview.classList.add('active');
    if (menuDocs) menuDocs.classList.remove('active');
    if (tabOverview) tabOverview.classList.add('active');
    if (tabDocs) tabDocs.classList.remove('active');
  } else {
    if (menuOverview) menuOverview.classList.remove('active');
    if (menuDocs) menuDocs.classList.add('active');
    if (tabOverview) tabOverview.classList.remove('active');
    if (tabDocs) tabDocs.classList.add('active');
  }

  // Cuộn nhẹ lên đầu trang
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==============================================================================
// 3. XỬ LÝ MODAL UPLOAD TÀI LIỆU (THEO ẢNH 3 & 4)
// ==============================================================================

/**
 * Mở modal upload tài liệu
 * @param {'cv' | 'application'} type 
 */
function openUploadModal(type) {
  InternState.modalType = type;
  InternState.tempFile = null;

  const modalOverlay = document.getElementById('uploadModalOverlay');
  const subText = document.getElementById('modalSubtitleText');
  const fileInput = document.getElementById('modalHiddenFileInput');
  const selectedStrip = document.getElementById('selectedFileStrip');
  const btnSubmit = document.getElementById('btnModalSubmitUpload');

  // Đặt phụ đề modal theo từng loại tài liệu
  if (subText) {
    subText.textContent = type === 'cv' ? 'Tải lên CV của bạn' : 'Tải lên đơn xin thực tập';
  }

  // Reset trạng thái chọn tệp trong modal
  if (fileInput) fileInput.value = '';
  if (selectedStrip) selectedStrip.classList.add('d-none');
  if (btnSubmit) btnSubmit.disabled = true;

  // Hiển thị modal overlay
  if (modalOverlay) modalOverlay.classList.add('show');
}

/**
 * Đóng modal upload tài liệu
 */
function closeUploadModal() {
  const modalOverlay = document.getElementById('uploadModalOverlay');
  if (modalOverlay) modalOverlay.classList.remove('show');
  InternState.tempFile = null;
}

/**
 * Kích hoạt mở file picker từ máy tính
 */
function triggerNativeFileInput(event) {
  if (event) event.stopPropagation();
  const fileInput = document.getElementById('modalHiddenFileInput');
  if (fileInput) fileInput.click();
}

/**
 * Xử lý Drag & Drop trong modal
 */
function handleModalDragOver(event) {
  event.preventDefault();
  event.stopPropagation();
  const dropzone = document.getElementById('modalDropzone');
  if (dropzone) dropzone.classList.add('dragover');
}

function handleModalDragLeave(event) {
  event.preventDefault();
  event.stopPropagation();
  const dropzone = document.getElementById('modalDropzone');
  if (dropzone) dropzone.classList.remove('dragover');
}

function handleModalDrop(event) {
  event.preventDefault();
  event.stopPropagation();
  const dropzone = document.getElementById('modalDropzone');
  if (dropzone) dropzone.classList.remove('dragover');

  const files = event.dataTransfer.files;
  if (files && files.length > 0) {
    selectModalFile(files[0]);
  }
}

/**
 * Xử lý khi chọn file từ file input
 */
function handleNativeFileSelected(input) {
  if (input.files && input.files[0]) {
    selectModalFile(input.files[0]);
  }
}

/**
 * Kiểm tra và gán tệp tạm thời trong modal
 * @param {File} file 
 */
function selectModalFile(file) {
  const allowed = ['pdf', 'doc', 'docx'];
  const ext = file.name.split('.').pop().toLowerCase();

  // Kiểm tra định dạng (PDF, DOC, DOCX)
  if (!allowed.includes(ext)) {
    alert(`Định dạng tệp .${ext} không được hỗ trợ! Vui lòng chỉ chọn tệp PDF, DOC hoặc DOCX.`);
    return;
  }

  // Kiểm tra dung lượng tối đa 10 MB
  const maxBytes = 10 * 1024 * 1024;
  if (file.size > maxBytes) {
    alert('Dung lượng tệp vượt quá giới hạn 10 MB! Vui lòng chọn tệp nhỏ hơn.');
    return;
  }

  InternState.tempFile = file;

  // Hiển thị khung thông tin tệp đã chọn
  const selectedStrip = document.getElementById('selectedFileStrip');
  const selectedName = document.getElementById('selectedFileName');
  const btnSubmit = document.getElementById('btnModalSubmitUpload');

  if (selectedStrip) selectedStrip.classList.remove('d-none');
  if (selectedName) selectedName.textContent = `${file.name} (${formatFileSize(file.size)})`;
  if (btnSubmit) btnSubmit.disabled = false;
}

/**
 * Xóa tệp đã chọn trong modal
 */
function clearSelectedModalFile(event) {
  if (event) event.stopPropagation();
  InternState.tempFile = null;

  const fileInput = document.getElementById('modalHiddenFileInput');
  const selectedStrip = document.getElementById('selectedFileStrip');
  const btnSubmit = document.getElementById('btnModalSubmitUpload');

  if (fileInput) fileInput.value = '';
  if (selectedStrip) selectedStrip.classList.add('d-none');
  if (btnSubmit) btnSubmit.disabled = true;
}

/**
 * Xác nhận Upload tệp từ modal vào hệ thống
 */
function confirmModalUpload() {
  if (!InternState.tempFile) return;

  const file = InternState.tempFile;
  const type = InternState.modalType;
  const ext = file.name.split('.').pop().toLowerCase();

  // Lưu thông tin vào state
  InternState.docs[type] = {
    uploaded: true,
    name: file.name,
    size: formatFileSize(file.size),
    time: formatTimeNow(),
    type: ext.includes('doc') ? 'doc' : 'pdf'
  };

  // Lưu state vào localStorage để giữ phiên khi F5
  saveDocsState();

  // Đóng modal
  closeUploadModal();

  // Cập nhật toàn bộ giao diện
  updateAllPortalUI();
}

/**
 * Xóa/Gỡ tài liệu đã tải lên
 * @param {'cv' | 'application'} type 
 */
function removeUploadedDoc(type) {
  const docName = type === 'cv' ? 'CV' : 'Đơn xin thực tập';
  if (confirm(`Bạn có chắc chắn muốn gỡ ${docName}?`)) {
    InternState.docs[type] = {
      uploaded: false,
      name: '',
      size: '',
      time: '',
      type: 'pdf'
    };
    saveDocsState();
    updateAllPortalUI();
  }
}

// ==============================================================================
// 4. CẬP NHẬT GIAO DIỆN PHẢN HỒI (UI REACTIVITY)
// ==============================================================================
function updateAllPortalUI() {
  const isCvDone = InternState.docs.cv.uploaded;
  const isAppDone = InternState.docs.application.uploaded;
  const isAllDone = isCvDone && isAppDone;

  // -------------------------------------------------------------
  // A. CẬP NHẬT TAB 2: HỒ SƠ & TÀI LIỆU
  // -------------------------------------------------------------
  // 1. Cập nhật Card CV
  const placeholderCv = document.getElementById('placeholder-cv');
  const uploadedViewCv = document.getElementById('uploaded-view-cv');
  const fileNameCv = document.getElementById('file-name-cv');
  const fileSizeCv = document.getElementById('file-size-cv');
  const fileTimeCv = document.getElementById('file-time-cv');
  const fileIconCv = document.getElementById('file-icon-cv');

  if (isCvDone) {
    if (placeholderCv) placeholderCv.classList.add('d-none');
    if (uploadedViewCv) uploadedViewCv.classList.remove('d-none');
    if (fileNameCv) fileNameCv.textContent = InternState.docs.cv.name;
    if (fileSizeCv) fileSizeCv.textContent = InternState.docs.cv.size;
    if (fileTimeCv) fileTimeCv.textContent = InternState.docs.cv.time;
    if (fileIconCv) {
      fileIconCv.className = `file-row-icon ${InternState.docs.cv.type}`;
      fileIconCv.innerHTML = InternState.docs.cv.type === 'pdf' 
        ? '<i class="bi bi-file-earmark-pdf-fill"></i>' 
        : '<i class="bi bi-file-earmark-word-fill"></i>';
    }
  } else {
    if (placeholderCv) placeholderCv.classList.remove('d-none');
    if (uploadedViewCv) uploadedViewCv.classList.add('d-none');
  }

  // 2. Cập nhật Card Đơn xin thực tập
  const placeholderApp = document.getElementById('placeholder-app');
  const uploadedViewApp = document.getElementById('uploaded-view-app');
  const fileNameApp = document.getElementById('file-name-app');
  const fileSizeApp = document.getElementById('file-size-app');
  const fileTimeApp = document.getElementById('file-time-app');
  const fileIconApp = document.getElementById('file-icon-app');

  if (isAppDone) {
    if (placeholderApp) placeholderApp.classList.add('d-none');
    if (uploadedViewApp) uploadedViewApp.classList.remove('d-none');
    if (fileNameApp) fileNameApp.textContent = InternState.docs.application.name;
    if (fileSizeApp) fileSizeApp.textContent = InternState.docs.application.size;
    if (fileTimeApp) fileTimeApp.textContent = InternState.docs.application.time;
    if (fileIconApp) {
      fileIconApp.className = `file-row-icon ${InternState.docs.application.type}`;
      fileIconApp.innerHTML = InternState.docs.application.type === 'pdf' 
        ? '<i class="bi bi-file-earmark-pdf-fill"></i>' 
        : '<i class="bi bi-file-earmark-word-fill"></i>';
    }
  } else {
    if (placeholderApp) placeholderApp.classList.remove('d-none');
    if (uploadedViewApp) uploadedViewApp.classList.add('d-none');
  }

  // -------------------------------------------------------------
  // B. CẬP NHẬT TAB 1: TỔNG QUAN
  // -------------------------------------------------------------
  // 1. Hero Blue Banner
  const heroTitle = document.getElementById('hero-status-title');
  const heroDesc = document.getElementById('hero-status-desc');
  if (isAllDone) {
    if (heroTitle) heroTitle.textContent = 'Đã hoàn thiện hồ sơ';
    if (heroDesc) heroDesc.textContent = 'Hồ sơ của bạn đã tải lên đầy đủ CV và đơn xin thực tập, sẵn sàng gửi HR xét duyệt.';
  } else {
    if (heroTitle) heroTitle.textContent = 'Chưa hoàn thiện';
    if (heroDesc) heroDesc.textContent = 'Hãy tải lên đầy đủ CV và đơn xin thực tập để gửi hồ sơ đến HR xét duyệt.';
  }

  // 2. Thẻ trắng: Tài liệu bắt buộc
  const reqItemCv = document.getElementById('req-item-cv');
  const reqStatusCv = document.getElementById('req-status-text-cv');
  const reqItemApp = document.getElementById('req-item-app');
  const reqStatusApp = document.getElementById('req-status-text-app');

  if (reqItemCv && reqStatusCv) {
    if (isCvDone) {
      reqItemCv.classList.add('uploaded');
      reqStatusCv.textContent = 'Đã upload';
    } else {
      reqItemCv.classList.remove('uploaded');
      reqStatusCv.textContent = 'Chưa upload';
    }
  }

  if (reqItemApp && reqStatusApp) {
    if (isAppDone) {
      reqItemApp.classList.add('uploaded');
      reqStatusApp.textContent = 'Đã upload';
    } else {
      reqItemApp.classList.remove('uploaded');
      reqStatusApp.textContent = 'Chưa upload';
    }
  }

  // 3. Khối: Tiến độ hoàn thiện hồ sơ
  const progressBadge = document.getElementById('progress-summary-badge');
  const step01 = document.getElementById('step-card-01');
  const stepSub01 = document.getElementById('step-sub-01');
  const step02 = document.getElementById('step-card-02');
  const stepSub02 = document.getElementById('step-sub-02');
  const step03 = document.getElementById('step-card-03');
  const stepSub03 = document.getElementById('step-sub-03');

  if (progressBadge) {
    if (isAllDone) {
      progressBadge.classList.add('completed');
      progressBadge.textContent = 'Đã hoàn thiện';
    } else {
      progressBadge.classList.remove('completed');
      progressBadge.textContent = 'Chưa hoàn thiện';
    }
  }

  // Step 01: CV
  if (step01 && stepSub01) {
    if (isCvDone) {
      step01.classList.add('completed');
      stepSub01.textContent = 'Đã upload';
    } else {
      step01.classList.remove('completed');
      stepSub01.textContent = 'Chưa upload';
    }
  }

  // Step 02: Đơn xin thực tập
  if (step02 && stepSub02) {
    if (isAppDone) {
      step02.classList.add('completed');
      stepSub02.textContent = 'Đã upload';
    } else {
      step02.classList.remove('completed');
      stepSub02.textContent = 'Chưa upload';
    }
  }

  // Step 03: Hoàn thiện hồ sơ
  if (step03 && stepSub03) {
    if (isAllDone) {
      step03.classList.add('completed');
      stepSub03.textContent = 'Sẵn sàng gửi';
    } else {
      step03.classList.remove('completed');
      stepSub03.textContent = 'Chưa hoàn thiện';
    }
  }
}

// ==============================================================================
// 5. MODAL XEM TRƯỚC TÀI LIỆU (PREVIEW MODAL)
// ==============================================================================
function openFilePreviewModal(type) {
  const docKey = type === 'cv' ? 'cv' : 'application';
  const doc = InternState.docs[docKey];

  const modalTitle = document.getElementById('previewModalTitle');
  const modalBody = document.getElementById('previewModalBody');

  if (modalTitle) {
    modalTitle.textContent = `Xem trước: ${doc.name || (type === 'cv' ? 'CV Thực tập' : 'Đơn xin thực tập')}`;
  }

  if (modalBody) {
    if (type === 'cv') {
      modalBody.innerHTML = `
        <div style="background: white; border: 1px solid #cbd5e1; border-radius: 8px; padding: 32px; text-align: left; max-width: 650px; margin: 0 auto; box-shadow: 0 4px 12px rgba(0,0,0,0.06);">
          <div style="border-bottom: 2px solid #2563eb; padding-bottom: 12px; margin-bottom: 18px;">
            <h2 style="color: #1e3a8a; font-size: 1.4rem; font-weight: 800; margin: 0;">TRẦN MINH KHOA</h2>
            <div style="color: #475569; font-size: 0.875rem; margin-top: 4px;">Vị trí: Thực tập sinh Phát triển Phần mềm (Frontend Intern)</div>
            <div style="color: #64748b; font-size: 0.8rem;">Email: khoatran@student.vn • SĐT: 0912 345 678 • Đại học Bách Khoa</div>
          </div>
          <h4 style="font-size: 0.95rem; font-weight: 700; color: #0f172a; margin-top: 14px;">1. KỸ NĂNG CHUYÊN MÔN</h4>
          <p style="font-size: 0.85rem; color: #334155; line-height: 1.6;">• HTML5, CSS3, JavaScript ES6+, Bootstrap 5, ReactJS<br>• Quản lý mã nguồn với Git/GitHub, RESTful API</p>
          <h4 style="font-size: 0.95rem; font-weight: 700; color: #0f172a; margin-top: 14px;">2. DỰ ÁN ĐÃ THỰC HIỆN</h4>
          <p style="font-size: 0.85rem; color: #334155; line-height: 1.6;">• Hệ thống Quản lý Thực tập sinh CodeGym (Frontend Developer)<br>• Web Ứng dụng Quản lý Nhiệm vụ cá nhân (ReactJS + LocalStorage)</p>
        </div>
      `;
    } else {
      modalBody.innerHTML = `
        <div style="background: white; border: 1px solid #cbd5e1; border-radius: 8px; padding: 32px; text-align: left; max-width: 650px; margin: 0 auto; box-shadow: 0 4px 12px rgba(0,0,0,0.06);">
          <div style="text-align: center; margin-bottom: 20px;">
            <div style="font-weight: 700; font-size: 0.9rem;">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
            <div style="font-weight: 600; font-size: 0.85rem; color: #475569;">Độc lập - Tự do - Hạnh phúc</div>
            <h3 style="font-weight: 800; font-size: 1.25rem; color: #1e3a8a; margin-top: 16px;">ĐƠN XIN THỰC TẬP TẠI DOANH NGHIỆP</h3>
          </div>
          <p style="font-size: 0.85rem; line-height: 1.7; color: #334155;">
            <strong>Kính gửi:</strong> Ban Giám đốc & Phòng Nhân sự Công ty Cổ phần CodeGym Việt Nam.<br>
            <strong>Họ và tên sinh viên:</strong> Trần Minh Khoa<br>
            <strong>Mã số sinh viên:</strong> 20210088 • Đại học Bách Khoa<br>
            <strong>Nguyện vọng:</strong> Được tiếp nhận vào Đợt thực tập tốt nghiệp vị trí Frontend Developer.
          </p>
        </div>
      `;
    }
  }

  const modalEl = document.getElementById('previewFileModal');
  if (modalEl) {
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
  }
}

// ==============================================================================
// 6. TIỆN ÍCH & LƯU TRỮ LOCALSTORAGE
// ==============================================================================

function saveDocsState() {
  try {
    localStorage.setItem('intern_docs_state', JSON.stringify(InternState.docs));
  } catch (e) {}
}

function loadDocsState() {
  try {
    const saved = localStorage.getItem('intern_docs_state');
    if (saved) {
      InternState.docs = JSON.parse(saved);
    }
  } catch (e) {}
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function formatTimeNow() {
  const d = new Date();
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${h}:${min} ${day}/${month}`;
}

/**
 * Đăng xuất khỏi Cổng thông tin Thực tập sinh
 */
function handleInternLogout() {
  if (confirm('Bạn có chắc chắn muốn đăng xuất khỏi Cổng thông tin Thực tập sinh?')) {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    localStorage.removeItem('user');
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
  }
}

// ==============================================================================
// 7. KHỞI CHẠY KHI TẢI TRANG
// ==============================================================================
document.addEventListener('DOMContentLoaded', () => {
  // 1. Phục hồi state tài liệu
  loadDocsState();

  // 2. Nạp tên sinh viên từ user đã đăng nhập nếu có
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const u = JSON.parse(userStr);
      if (u.name) {
        const topName = document.getElementById('topbar-user-name');
        const sideName = document.getElementById('sidebarName') || document.getElementById('sidebar-user-name');
        if (topName) topName.textContent = u.name;
        if (sideName) sideName.textContent = u.name;
      }
    }
  } catch (e) {}

  // 3. Cập nhật toàn bộ giao diện
  updateAllPortalUI();
});
