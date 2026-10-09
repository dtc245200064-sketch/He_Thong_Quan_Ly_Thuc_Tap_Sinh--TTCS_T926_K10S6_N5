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
  },

  // Trạng thái hồ sơ thực tế đồng bộ từ MySQL Database
  status: 'Chưa hoàn thiện',
  rejectReason: '',
  rejectNote: '',
  rolePermissions: null
};

// ==============================================================================
// 2. CHUYỂN TAB ĐIỀU HƯỚNG (TỔNG QUAN <-> HỒ SƠ & TÀI LIỆU <-> LỊCH THỰC TẬP <-> THÔNG TIN CÁ NHÂN)
// ==============================================================================
function switchPortalTab(tabName) {
  InternState.currentTab = tabName;

  // Danh sách các tab và menu tương ứng
  const tabList = ['overview', 'documents', 'schedule', 'attendance', 'contracts', 'profile'];

  tabList.forEach(t => {
    const menuBtn = document.getElementById(`menu-${t}`);
    const tabSection = document.getElementById(`tab-${t}`);
    if (menuBtn) {
      if (t === tabName) {
        menuBtn.classList.add('active');
      } else {
        menuBtn.classList.remove('active');
      }
    }
    if (tabSection) {
      if (t === tabName) {
        tabSection.classList.add('active');
      } else {
        tabSection.classList.remove('active');
      }
    }
  });

  // Đánh dấu active trên nút Thực tập sinh ở Sidebar Footer khi vào trang profile
  const sidebarUserCard = document.querySelector('.user-profile');
  if (sidebarUserCard) {
    if (tabName === 'profile') {
      sidebarUserCard.classList.add('active-profile');
    } else {
      sidebarUserCard.classList.remove('active-profile');
    }
  }

  if (tabName === 'profile') {
    loadProfileFormFields();
  } else if (tabName === 'schedule') {
    renderSchedule();
  } else if (tabName === 'attendance') {
    initAttendanceTab();
  } else if (tabName === 'contracts') {
    initContractsTab();
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
  if (type === 'cv' && typeof hasInternPermission === 'function' && !hasInternPermission('upload_cv', 1)) {
    if (typeof showInternNotification === 'function') {
      showInternNotification('Bạn không có quyền tải lên CV! Quyền đã bị vô hiệu hóa trong CSDL.', 'danger');
    } else {
      alert('Bạn không có quyền tải lên CV!');
    }
    return;
  }
  if (type === 'application' && typeof hasInternPermission === 'function' && !hasInternPermission('upload_letter', 1)) {
    if (typeof showInternNotification === 'function') {
      showInternNotification('Bạn không có quyền tải lên Đơn xin thực tập! Quyền đã bị vô hiệu hóa trong CSDL.', 'danger');
    } else {
      alert('Bạn không có quyền tải lên Đơn xin thực tập!');
    }
    return;
  }

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

// ==============================================================================
// HỆ THỐNG TOAST THÔNG BÁO CHO THỰC TẬP SINH (KHÔNG DÙNG ALERT)
// ==============================================================================
function showInternToast(message, type = "info") {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;

  let iconHtml = "";
  if (type === "success") {
    iconHtml = `<i class="toast-icon fa-solid fa-circle-check"></i>`;
  } else if (type === "warning") {
    iconHtml = `<i class="toast-icon fa-solid fa-triangle-exclamation"></i>`;
  } else if (type === "danger") {
    iconHtml = `<i class="toast-icon fa-solid fa-circle-xmark"></i>`;
  } else {
    iconHtml = `<i class="toast-icon fa-solid fa-circle-info"></i>`;
  }

  toast.innerHTML = `
    ${iconHtml}
    <div class="toast-message">${message}</div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(40px)";
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }, 4000);
}

/**
 * Kiểm tra và gán tệp tạm thời trong modal
 * @param {File} file 
 */
function selectModalFile(file) {
  const allowed = ['pdf', 'doc', 'docx', 'png', 'jpg', 'jpeg'];
  const ext = file.name.split('.').pop().toLowerCase();

  // Kiểm tra định dạng (PDF, DOC, DOCX, PNG, JPG, JPEG)
  if (!allowed.includes(ext)) {
    showInternToast(`Định dạng tệp .${ext} không được hỗ trợ! Vui lòng chỉ chọn tệp PDF, DOCX hoặc Ảnh (PNG, JPG).`, "danger");
    return;
  }

  // Kiểm tra dung lượng tối đa 10 MB
  const maxBytes = 10 * 1024 * 1024;
  if (file.size > maxBytes) {
    showInternToast('Dung lượng tệp vượt quá giới hạn 10 MB! Vui lòng chọn tệp nhỏ hơn.', "danger");
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
  const isImg = ['png', 'jpg', 'jpeg', 'webp'].includes(ext);
  const isDoc = ext.includes('doc');
  const isPdf = ext === 'pdf';

  // Tạo URL xem trước tức thì từ file máy khách
  let localBlobUrl = '';
  try {
    localBlobUrl = URL.createObjectURL(file);
  } catch (e) {}

  // Lưu thông tin vào state
  InternState.docs[type] = {
    uploaded: true,
    name: file.name,
    size: formatFileSize(file.size),
    time: formatTimeNow(),
    type: isDoc ? 'doc' : (isImg ? 'img' : 'pdf'),
    previewUrl: localBlobUrl,
    fileUrl: ''
  };

  // Lưu state vào localStorage để giữ phiên khi F5
  saveDocsState();

  // Đóng modal
  closeUploadModal();

  // Hiển thị thông báo Toast thành công
  showInternToast(`Tải lên tài liệu "${file.name}" thành công!`, 'success');

  // Cập nhật toàn bộ giao diện
  updateAllPortalUI();

  // Gửi file thật lên Backend lưu vào thư mục uploads/ và ghi vào MySQL
  if (typeof apiUploadDocument === 'function') {
    const userStr = localStorage.getItem('user');
    let internId = null;
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        if (u && (u.internId || u.id)) internId = u.internId || u.id;
      } catch (e) {}
    }
    if (!internId) {
      console.warn('Không xác định được ID thực tập sinh để tải lên!');
      return;
    }
    const docTypeParam = type === 'cv' ? 'CV' : 'APPLICATION_LETTER';
    apiUploadDocument(internId, docTypeParam, file).then(res => {
      if (res && res.success && res.data) {
        InternState.docs[type].fileUrl = res.data.fileUrl;
        InternState.docs[type].previewUrl = res.data.fileUrl;
        saveDocsState();
        console.log('✅ File đã được lưu vào thư mục backend/uploads/ và MySQL:', res.data.fileUrl);
      }
    }).catch(err => console.warn('Lỗi khi tải lên server:', err));
  }
}

/**
 * Xóa/Gỡ tài liệu đã tải lên (Sử dụng Modal Web, không dùng confirm)
 * @param {'cv' | 'application'} type 
 */
let pendingRemoveDocType = null;

function removeUploadedDoc(type) {
  pendingRemoveDocType = type;
  const docName = type === 'cv' ? 'CV' : 'Đơn xin thực tập';
  const msgEl = document.getElementById('removeDocMessage');
  if (msgEl) {
    msgEl.innerHTML = `Bạn có chắc chắn muốn gỡ <strong>${docName}</strong> khỏi hồ sơ của mình?<br><span style="color:#ef4444; font-size:12.5px; margin-top:4px; display:inline-block;">Hành động này sẽ xóa file đính kèm hiện tại.</span>`;
  }

  const btnConfirm = document.getElementById('btnConfirmRemoveDoc');
  if (btnConfirm) {
    btnConfirm.onclick = executeRemoveDoc;
  }

  const modal = document.getElementById('removeDocModal');
  if (modal) modal.classList.add('show');
}

function closeRemoveDocModal() {
  const modal = document.getElementById('removeDocModal');
  if (modal) modal.classList.remove('show');
}

async function executeRemoveDoc() {
  const type = pendingRemoveDocType;
  closeRemoveDocModal();
  if (!type) return;

  const docName = type === 'cv' ? 'CV' : 'Đơn xin thực tập';

  // Lấy thông tin user hiện tại
  const userStr = localStorage.getItem('user');
  let internId = null;
  if (userStr) {
    try {
      const u = JSON.parse(userStr);
      if (u && (u.internId || u.id)) internId = u.internId || u.id;
    } catch (e) {}
  }

  const docTypeParam = type === 'cv' ? 'CV' : 'APPLICATION_LETTER';

  // 1. Cập nhật state cục bộ trước
  InternState.docs[type] = {
    uploaded: false,
    name: '',
    size: '',
    time: '',
    type: 'pdf',
    fileUrl: '',
    previewUrl: ''
  };
  saveDocsState();
  updateAllPortalUI();

  // 2. Gọi API xóa tệp vật lý và bản ghi trong MySQL Database
  if (typeof apiDeleteDocument === 'function' && internId) {
    try {
      const res = await apiDeleteDocument(internId, docTypeParam);
      console.log('🗑️ Đã xóa tài liệu khỏi MySQL & Server:', res);
    } catch (err) {
      console.warn('Lỗi khi gọi API xóa tài liệu:', err);
    }
  }

  showInternToast(`Đã gỡ ${docName} khỏi hồ sơ thành công.`, "warning");
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
        : (InternState.docs.cv.type === 'img' ? '<i class="bi bi-file-earmark-image-fill"></i>' : '<i class="bi bi-file-earmark-word-fill"></i>');
    }
  } else {
    if (placeholderCv) placeholderCv.classList.remove('d-none');
    if (uploadedViewCv) uploadedViewCv.classList.add('d-none');
    if (fileNameCv) fileNameCv.textContent = '';
    if (fileSizeCv) fileSizeCv.textContent = '';
    if (fileTimeCv) fileTimeCv.textContent = '';
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
        : (InternState.docs.application.type === 'img' ? '<i class="bi bi-file-earmark-image-fill"></i>' : '<i class="bi bi-file-earmark-word-fill"></i>');
    }
  } else {
    if (placeholderApp) placeholderApp.classList.remove('d-none');
    if (uploadedViewApp) uploadedViewApp.classList.add('d-none');
    if (fileNameApp) fileNameApp.textContent = '';
    if (fileSizeApp) fileSizeApp.textContent = '';
    if (fileTimeApp) fileTimeApp.textContent = '';
  }

  // -------------------------------------------------------------
  // B. CẬP NHẬT TAB 1: TỔNG QUAN (ĐỒNG BỘ TRẠNG THÁI TỪ MYSQL DB)
  // -------------------------------------------------------------
  const realStatus = InternState.status || (isAllDone ? 'Chờ xét duyệt' : 'Chưa hoàn thiện');
  const isApproved = realStatus === 'Đang thực tập' || realStatus === 'approved' || realStatus === 'Đã duyệt';
  const isRejected = realStatus === 'Đã từ chối' || realStatus === 'rejected';
  const isPending = realStatus === 'Chờ xét duyệt' || realStatus === 'pending';

  // 1. Hero Banner
  const heroTitle = document.getElementById('hero-status-title');
  const heroDesc = document.getElementById('hero-status-desc');
  const heroDot = document.getElementById('hero-status-dot');

  if (isApproved) {
    if (heroTitle) heroTitle.textContent = 'Hồ sơ đã được phê duyệt';
    if (heroDesc) heroDesc.textContent = 'Chúc mừng bạn! Hồ sơ thực tập của bạn đã được Phòng Nhân sự CodeGym phê duyệt. Bạn đã chính thức là Thực tập sinh!';
    if (heroDot) heroDot.style.background = '#22c55e';
  } else if (isRejected) {
    if (heroTitle) heroTitle.textContent = 'Hồ sơ chưa đạt yêu cầu';
    if (heroDesc) heroDesc.textContent = InternState.rejectNote 
      ? `HR phản hồi: ${InternState.rejectNote}` 
      : (InternState.rejectReason ? `Lý do: ${InternState.rejectReason}` : 'Rất tiếc hồ sơ của bạn chưa phù hợp trong đợt tuyển dụng này.');
    if (heroDot) heroDot.style.background = '#ef4444';
  } else if (isPending) {
    if (heroTitle) heroTitle.textContent = 'Hồ sơ đang chờ HR xét duyệt';
    if (heroDesc) heroDesc.textContent = 'Hồ sơ của bạn đã được gửi thành công đến Phòng Nhân sự. HR đang tiến hành thẩm định và sẽ thông báo kết quả sớm nhất.';
    if (heroDot) heroDot.style.background = '#f59e0b';
  } else {
    if (isAllDone) {
      if (heroTitle) heroTitle.textContent = 'Hồ sơ đã đủ tài liệu';
      if (heroDesc) heroDesc.textContent = 'Bạn đã tải lên đầy đủ CV và Đơn xin thực tập. Hãy nhấn nút "Gửi hồ sơ đến Phòng Nhân sự" để nộp!';
      if (heroDot) heroDot.style.background = '#38bdf8';
    } else {
      if (heroTitle) heroTitle.textContent = 'Chưa hoàn thiện';
      if (heroDesc) heroDesc.textContent = 'Hãy tải lên đầy đủ CV và đơn xin thực tập để gửi hồ sơ đến HR xét duyệt.';
      if (heroDot) heroDot.style.background = '#94a3b8';
    }
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
    if (isApproved) {
      progressBadge.className = 'progress-pill-badge bg-success text-white';
      progressBadge.textContent = 'Đã phê duyệt';
    } else if (isRejected) {
      progressBadge.className = 'progress-pill-badge bg-danger text-white';
      progressBadge.textContent = 'Từ chối';
    } else if (isPending) {
      progressBadge.className = 'progress-pill-badge bg-warning text-dark';
      progressBadge.textContent = 'Chờ xét duyệt';
    } else if (isAllDone) {
      progressBadge.className = 'progress-pill-badge completed';
      progressBadge.textContent = 'Sẵn sàng gửi';
    } else {
      progressBadge.className = 'progress-pill-badge';
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

  // Step 03: Xét duyệt hồ sơ
  if (step03 && stepSub03) {
    if (isApproved) {
      step03.classList.add('completed');
      stepSub03.textContent = 'Đã được duyệt';
    } else if (isRejected) {
      step03.classList.remove('completed');
      stepSub03.textContent = 'Đã từ chối';
    } else if (isPending) {
      step03.classList.add('completed');
      stepSub03.textContent = 'Chờ xét duyệt';
    } else if (isAllDone) {
      step03.classList.add('completed');
      stepSub03.textContent = 'Sẵn sàng gửi';
    } else {
      step03.classList.remove('completed');
      stepSub03.textContent = 'Chưa hoàn thiện';
    }
  }

  // 4. Cập nhật thẻ Gửi hồ sơ đến phòng nhân sự (Theo thiết kế mới)
  updateDossierSubmitCardUI();

  // 5. Cập nhật mốc xử lý hồ sơ tại Tab Tổng quan (Đồng bộ tuyệt đối với MySQL DB)
  const isDbSubmitted = isApproved || isRejected || isPending || localStorage.getItem('tts_dossier_submitted') === 'true';

  const milestoneRegister = document.getElementById('overviewMilestoneRegisterDate');
  if (milestoneRegister) {
    milestoneRegister.textContent = internProfileData.appliedDate || internProfileData.created_at || '15/01/2026';
  }

  const milestoneProfile = document.getElementById('overviewMilestoneProfileStatus');
  if (milestoneProfile) {
    if (isAllDone || isDbSubmitted) {
      milestoneProfile.innerHTML = '<span class="text-success fw-semibold"><i class="bi bi-check2-circle me-1"></i>Đã hoàn thiện</span>';
    } else {
      milestoneProfile.innerHTML = '<span class="text-secondary fw-normal">Chưa hoàn thiện</span>';
    }
  }

  const milestoneSubmit = document.getElementById('overviewMilestoneSubmitStatus');
  if (milestoneSubmit) {
    if (isDbSubmitted) {
      milestoneSubmit.innerHTML = '<span class="text-primary fw-semibold"><i class="bi bi-send-check me-1"></i>Đã gửi</span>';
    } else {
      milestoneSubmit.innerHTML = '<span class="text-muted">Chưa gửi</span>';
    }
  }

  const milestoneResult = document.getElementById('overviewMilestoneApprovalResult');
  if (milestoneResult) {
    if (isApproved) {
      milestoneResult.innerHTML = '<span class="text-success fw-bold"><i class="bi bi-patch-check-fill me-1"></i>Đã duyệt (Trúng tuyển)</span>';
    } else if (isRejected) {
      milestoneResult.innerHTML = '<span class="text-danger fw-bold"><i class="bi bi-x-circle-fill me-1"></i>Từ chối</span>';
    } else if (isPending || isDbSubmitted) {
      milestoneResult.innerHTML = '<span class="text-warning-emphasis fw-semibold"><i class="bi bi-hourglass-split me-1"></i>Đang xét duyệt</span>';
    } else {
      milestoneResult.innerHTML = '<span class="text-muted">Chưa có kết quả</span>';
    }
  }

  // 6. Cập nhật nút bấm trong Hero Banner Tab 1
  const btnHeroComplete = document.querySelector('.btn-complete-profile');
  if (btnHeroComplete) {
    if (isApproved) {
      btnHeroComplete.textContent = 'Xem lịch & hợp đồng thực tập';
      btnHeroComplete.setAttribute('onclick', "switchPortalTab('schedule')");
    } else if (isPending) {
      btnHeroComplete.textContent = 'Xem chi tiết hồ sơ';
      btnHeroComplete.setAttribute('onclick', "switchPortalTab('documents')");
    } else {
      btnHeroComplete.textContent = 'Hoàn thiện hồ sơ';
      btnHeroComplete.setAttribute('onclick', "switchPortalTab('documents')");
    }
  }

  // 7. Cập nhật Row 3: Lịch làm việc hôm nay & Công việc sắp tới
  const elWorkHours = document.getElementById('overviewTodayWorkHours');
  const elWorkLoc = document.getElementById('overviewTodayWorkLocation');
  const elAttStatus = document.getElementById('overviewAttendanceStatus');
  const elTaskTitle = document.getElementById('overviewUpcomingTaskTitle');
  const elTaskSchedule = document.getElementById('overviewUpcomingTaskSchedule');
  const elTaskMentor = document.getElementById('overviewUpcomingTaskMentor');

  if (isApproved) {
    if (elWorkHours) elWorkHours.textContent = '08:30 - 17:30 (Thứ 2 - Thứ 6)';
    if (elWorkLoc) elWorkLoc.textContent = `Văn phòng CodeGym${internProfileData.dept ? ' • ' + internProfileData.dept : ''}`;
    if (elAttStatus) {
      elAttStatus.textContent = (AttendanceState && AttendanceState.todayCheckIn)
        ? `Đã check-in (${AttendanceState.todayCheckIn})`
        : 'Chưa check-in';
    }
    if (elTaskTitle) elTaskTitle.textContent = `Thực tập ${internProfileData.position || internProfileData.dept || 'Chuyên môn'}`;
    if (elTaskSchedule) {
      elTaskSchedule.textContent = (internProfileData.startFormatted && internProfileData.endFormatted)
        ? `${internProfileData.startFormatted} - ${internProfileData.endFormatted}`
        : (internProfileData.time || 'Chưa xếp thời gian');
    }
    if (elTaskMentor) elTaskMentor.textContent = internProfileData.mentor || 'Chưa phân công';
  } else {
    if (elWorkHours) elWorkHours.textContent = '—';
    if (elWorkLoc) elWorkLoc.textContent = '—';
    if (elAttStatus) elAttStatus.textContent = isPending ? 'Chờ duyệt hồ sơ' : 'Chưa bắt đầu thực tập';
    if (elTaskTitle) elTaskTitle.textContent = isPending ? 'Chờ HR xét duyệt hồ sơ' : 'Chưa xếp lịch thực tập';
    if (elTaskSchedule) elTaskSchedule.textContent = '—';
    if (elTaskMentor) elTaskMentor.textContent = '—';
  }
}

// -------------------------------------------------------------
// C. DỮ LIỆU ĐỘNG CHO TỔNG QUAN (HÀNG 3 & HÀNG 4)
// Mặc định để trống dữ liệu cho Backend làm API.
// Hàm dưới đây để Backend dễ dàng gọi cập nhật dữ liệu khi có API:
// -------------------------------------------------------------
window.updateInternOverviewData = function (data = {}) {
  if (data.todayWorkHours !== undefined) {
    const el = document.getElementById('overviewTodayWorkHours');
    if (el) el.textContent = data.todayWorkHours || '—';
  }
  if (data.todayWorkLocation !== undefined) {
    const el = document.getElementById('overviewTodayWorkLocation');
    if (el) el.textContent = data.todayWorkLocation || '—';
  }
  if (data.attendanceStatus !== undefined) {
    const el = document.getElementById('overviewAttendanceStatus');
    if (el) el.textContent = data.attendanceStatus || 'Chưa check-in';
  }
  if (data.upcomingTaskTitle !== undefined) {
    const el = document.getElementById('overviewUpcomingTaskTitle');
    if (el) el.textContent = data.upcomingTaskTitle || '—';
  }
  if (data.upcomingTaskSchedule !== undefined) {
    const el = document.getElementById('overviewUpcomingTaskSchedule');
    if (el) el.textContent = data.upcomingTaskSchedule || '—';
  }
  if (data.upcomingTaskMentor !== undefined) {
    const el = document.getElementById('overviewUpcomingTaskMentor');
    if (el) el.textContent = data.upcomingTaskMentor || '—';
  }
  if (data.milestoneRegisterDate !== undefined) {
    const el = document.getElementById('overviewMilestoneRegisterDate');
    if (el) el.textContent = data.milestoneRegisterDate || '—';
  }
  if (data.milestoneProfileStatus !== undefined) {
    const el = document.getElementById('overviewMilestoneProfileStatus');
    if (el) el.textContent = data.milestoneProfileStatus || 'Chưa hoàn thiện';
  }
  if (data.milestoneSubmitStatus !== undefined) {
    const el = document.getElementById('overviewMilestoneSubmitStatus');
    if (el) el.textContent = data.milestoneSubmitStatus || 'Chưa gửi';
  }
  if (data.milestoneApprovalResult !== undefined) {
    const el = document.getElementById('overviewMilestoneApprovalResult');
    if (el) el.textContent = data.milestoneApprovalResult || 'Chưa có kết quả';
  }
};

// ==============================================================================
// 4.1. QUẢN LÝ GỬI HỒ SƠ ĐẾN PHÒNG NHÂN SỰ (SUBMIT DOSSIER TO HR)
// ==============================================================================

/**
 * Cập nhật giao diện thẻ Gửi hồ sơ đến phòng nhân sự
 */
function updateDossierSubmitCardUI() {
  const chkInfo = document.getElementById('chkReqInfo');
  const iconInfo = document.getElementById('iconChkInfo');
  const chkCv = document.getElementById('chkReqCv');
  const iconCv = document.getElementById('iconChkCv');
  const chkApp = document.getElementById('chkReqApp');
  const iconApp = document.getElementById('iconChkApp');
  const btnSubmit = document.getElementById('btnSubmitDossier');

  if (!btnSubmit) return;

  // 1. Kiểm tra Thông tin cá nhân (Có họ tên và thông tin liên lạc / học vấn)
  const isInfoDone = !!(internProfileData.name && (internProfileData.phone || internProfileData.school || internProfileData.email));

  // 2. Kiểm tra CV
  const isCvDone = !!(InternState.docs.cv && InternState.docs.cv.uploaded);

  // 3. Kiểm tra Đơn xin thực tập
  const isAppDone = !!(InternState.docs.application && InternState.docs.application.uploaded);

  // Cập nhật mục 1: Thông tin cá nhân
  if (chkInfo && iconInfo) {
    if (isInfoDone) {
      chkInfo.classList.add('done');
      iconInfo.innerHTML = '<i class="bi bi-check-circle-fill"></i>';
    } else {
      chkInfo.classList.remove('done');
      iconInfo.textContent = '○';
    }
  }

  // Cập nhật mục 2: CV
  if (chkCv && iconCv) {
    if (isCvDone) {
      chkCv.classList.add('done');
      iconCv.innerHTML = '<i class="bi bi-check-circle-fill"></i>';
    } else {
      chkCv.classList.remove('done');
      iconCv.textContent = '○';
    }
  }

  // Cập nhật mục 3: Đơn xin thực tập
  if (chkApp && iconApp) {
    if (isAppDone) {
      chkApp.classList.add('done');
      iconApp.innerHTML = '<i class="bi bi-check-circle-fill"></i>';
    } else {
      chkApp.classList.remove('done');
      iconApp.textContent = '○';
    }
  }

  // Kiểm tra trạng thái hồ sơ thực tế từ Database
  const realStatus = InternState.status || '';
  const isApproved = realStatus === 'Đang thực tập' || realStatus === 'approved' || realStatus === 'Đã duyệt';
  const isRejected = realStatus === 'Đã từ chối' || realStatus === 'rejected';
  const isPending = realStatus === 'Chờ xét duyệt' || realStatus === 'pending';
  const isSubmitted = isApproved || isRejected || isPending || localStorage.getItem('tts_dossier_submitted') === 'true';

  if (isApproved) {
    btnSubmit.className = 'btn-submit-dossier submitted bg-success text-white border-0';
    btnSubmit.innerHTML = '<i class="bi bi-patch-check-fill me-1"></i> Hồ sơ đã được phê duyệt';
    btnSubmit.disabled = true;
    return;
  }

  if (isRejected) {
    btnSubmit.className = 'btn-submit-dossier bg-danger text-white border-0';
    btnSubmit.innerHTML = '<i class="bi bi-x-circle-fill me-1"></i> Hồ sơ chưa đạt yêu cầu';
    btnSubmit.disabled = true;
    return;
  }

  if (isPending || isSubmitted) {
    btnSubmit.className = 'btn-submit-dossier submitted';
    btnSubmit.innerHTML = '<i class="bi bi-clock-history me-1"></i> Đã gửi đến phòng nhân sự (Chờ duyệt)';
    btnSubmit.disabled = true;
    return;
  }

  // Trạng thái nút theo điều kiện hoàn thiện
  if (isInfoDone && isCvDone && isAppDone) {
    btnSubmit.className = 'btn-submit-dossier ready';
    btnSubmit.innerHTML = '<i class="bi bi-send-fill me-1"></i> Gửi hồ sơ đến phòng nhân sự';
    btnSubmit.disabled = false;
  } else {
    btnSubmit.className = 'btn-submit-dossier';
    btnSubmit.innerHTML = 'Gửi hồ sơ đến phòng nhân sự';
    btnSubmit.disabled = false;
  }
}

/**
 * Xử lý khi người dùng bấm nút Gửi hồ sơ đến phòng nhân sự
 */
function handleDossierSubmitClick() {
  const realStatus = InternState.status || '';
  const isApproved = realStatus === 'Đang thực tập' || realStatus === 'approved' || realStatus === 'Đã duyệt';
  const isRejected = realStatus === 'Đã từ chối' || realStatus === 'rejected';
  const isPending = realStatus === 'Chờ xét duyệt' || realStatus === 'pending';
  const isSubmitted = isApproved || isRejected || isPending || localStorage.getItem('tts_dossier_submitted') === 'true';

  if (isApproved) {
    showInternToast('Hồ sơ của bạn đã được Phòng Nhân sự phê duyệt thành công!', 'success');
    return;
  }

  if (isPending || isSubmitted) {
    showInternToast('Hồ sơ của bạn đã được gửi đến phòng nhân sự trước đó và đang chờ xét duyệt.', 'info');
    return;
  }

  const isInfoDone = !!(internProfileData.name && (internProfileData.phone || internProfileData.school || internProfileData.email));
  const isCvDone = !!(InternState.docs.cv && InternState.docs.cv.uploaded);
  const isAppDone = !!(InternState.docs.application && InternState.docs.application.uploaded);

  const missing = [];
  if (!isInfoDone) missing.push('Thông tin cá nhân');
  if (!isCvDone) missing.push('CV');
  if (!isAppDone) missing.push('Đơn xin thực tập');

  if (missing.length > 0) {
    showInternToast(`Vui lòng hoàn thiện: ${missing.join(', ')} trước khi gửi!`, 'warning');
    return;
  }

  // Mở modal xác nhận
  const modal = document.getElementById('confirmSendDossierModal');
  if (modal) {
    modal.classList.add('show');
  }
}

function closeConfirmSendDossierModal() {
  const modal = document.getElementById('confirmSendDossierModal');
  if (modal) {
    modal.classList.remove('show');
  }
}

async function confirmSubmitDossierToHR() {
  closeConfirmSendDossierModal();
  localStorage.setItem('tts_dossier_submitted', 'true');
  localStorage.setItem('tts_dossier_submitted_at', new Date().toISOString());

  InternState.status = 'Chờ xét duyệt';
  updateAllPortalUI();
  showInternToast('Đang gửi hồ sơ đến Phòng Nhân sự...', 'info');

  // Gửi trạng thái Chờ xét duyệt lên MySQL Database
  try {
    const userStr = localStorage.getItem('user');
    let internId = null;
    if (userStr) {
      const u = JSON.parse(userStr);
      internId = u.internId || u.id;
    }
    if (internId) {
      if (typeof apiUpdateIntern === 'function') {
        await apiUpdateIntern(internId, { status: 'Chờ xét duyệt' });
      } else {
        const token = localStorage.getItem('token');
        await fetch(`http://localhost:5000/api/interns/${internId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify({ status: 'Chờ xét duyệt' })
        });
      }
      console.log(`✅ Đã gửi hồ sơ của Thực tập sinh ID ${internId} lên MySQL thành công!`);
    }
  } catch (e) {
    console.warn('Lỗi gửi hồ sơ lên API:', e);
  }

  showInternToast('Đã gửi hồ sơ đến phòng nhân sự thành công! Phòng nhân sự sẽ tiếp nhận và phản hồi sớm.', 'success');
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
    const targetUrl = (doc && (doc.fileUrl || doc.previewUrl)) ? (doc.fileUrl || doc.previewUrl) : '';
    
    if (targetUrl) {
      const fullUrl = (targetUrl.startsWith('http') || targetUrl.startsWith('blob:'))
        ? targetUrl
        : `http://localhost:5000${targetUrl}`;
      
      const fileName = doc.name || targetUrl.split('/').pop() || '';
      const ext = fileName.split('.').pop().toLowerCase();
      const isImg = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp'].includes(ext) || doc.type === 'img';
      const isPdf = ext === 'pdf' || doc.type === 'pdf';

      if (isImg) {
        modalBody.innerHTML = `
          <div style="text-align: center; padding: 15px; background: #f8fafc; border-radius: 8px;">
            <img src="${fullUrl}" alt="${fileName || 'Hình ảnh tải lên'}" 
                 style="max-width: 100%; max-height: 550px; border-radius: 6px; box-shadow: 0 4px 15px rgba(0,0,0,0.12); object-fit: contain;" />
            <div style="margin-top: 12px; font-weight: 500; font-size: 0.9rem; color: #475569;">
              <i class="bi bi-image me-1"></i> ${fileName} ${doc.size ? `(${doc.size})` : ''}
            </div>
          </div>
        `;
      } else if (isPdf) {
        modalBody.innerHTML = `
          <div style="width: 100%; height: 600px; background: #525659; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
            <iframe src="${fullUrl}" style="width: 100%; height: 100%; border: none;"></iframe>
          </div>
        `;
      } else {
        // Tệp tin dạng Word hoặc định dạng khác
        modalBody.innerHTML = `
          <div style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 40px; text-align: center;">
            <div style="font-size: 3.5rem; color: #2563eb; margin-bottom: 16px;">
              <i class="bi bi-file-earmark-word-fill"></i>
            </div>
            <h4 style="font-weight: 700; color: #1e293b;">${fileName || 'Tài liệu đã tải lên'}</h4>
            <p style="color: #64748b; font-size: 0.9rem; margin-top: 8px;">
              Tệp văn bản định dạng Word không hỗ trợ xem trực tiếp trên trình duyệt. Bạn có thể bấm nút bên dưới để tải về máy.
            </p>
            <a href="${fullUrl}" download="${fileName}" class="btn btn-primary mt-3" style="padding: 10px 24px; border-radius: 6px;">
              <i class="bi bi-download me-2"></i> Tải xuống tệp tin
            </a>
          </div>
        `;
      }
    } else {
      // Trường hợp chưa có file
      modalBody.innerHTML = `
        <div style="background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 45px; text-align: center;">
          <i class="bi bi-cloud-arrow-up" style="font-size: 3rem; color: #94a3b8;"></i>
          <h5 style="margin-top: 16px; font-weight: 600; color: #475569;">Chưa có tệp tin nào được tải lên</h5>
          <p style="color: #64748b; font-size: 0.875rem;">Vui lòng bấm vào nút "Tải lên" để đính kèm file CV hoặc Đơn xin thực tập của bạn.</p>
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

function getDocsStorageKey() {
  try {
    const u = JSON.parse(localStorage.getItem('user') || '{}');
    const uid = u.internId || u.id || 'guest';
    return `intern_docs_state_${uid}`;
  } catch (e) {
    return 'intern_docs_state_guest';
  }
}

function saveDocsState() {
  try {
    localStorage.setItem(getDocsStorageKey(), JSON.stringify(InternState.docs));
  } catch (e) {}
}

function loadDocsState() {
  // Reset trạng thái mặc định rỗng trước khi nạp
  InternState.docs = {
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
  };
  try {
    const saved = localStorage.getItem(getDocsStorageKey());
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
 * Đăng xuất khỏi Cổng thông tin Thực tập sinh (Sử dụng Modal Web, không dùng confirm/alert)
 */
let internLogoutTimer = null;

function handleInternLogout() {
  const modal = document.getElementById('logoutConfirmModal');
  if (modal) {
    modal.classList.add('show');
  } else {
    confirmInternLogout();
  }
}

function closeInternLogoutModal() {
  const modal = document.getElementById('logoutConfirmModal');
  if (modal) modal.classList.remove('show');
}

function confirmInternLogout() {
  closeInternLogoutModal();
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('userRole');
  localStorage.removeItem('user');
  localStorage.removeItem('currentUser');
  localStorage.removeItem('token');

  showInternLogoutSuccessModal();
}

function showInternLogoutSuccessModal() {
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

  if (internLogoutTimer) clearTimeout(internLogoutTimer);
  internLogoutTimer = setTimeout(() => {
    proceedToLoginPage();
  }, 1250);
}

function proceedToLoginPage() {
  if (internLogoutTimer) {
    clearTimeout(internLogoutTimer);
    internLogoutTimer = null;
  }
  window.location.href = 'index.html';
}

// ==============================================================================
// 6.5. QUẢN LÝ HỒ SƠ CÁ NHÂN THỰC TẬP SINH (PROFILE PAGE & LOGIC)
// ==============================================================================
let internProfileData = {
  id: null,
  internId: null,
  name: '',
  role: 'Thực tập sinh',
  email: '',
  phone: '',
  birthDate: '',
  school: '',
  major: '',
  faculty: '',
  course: '',
  dept: '',
  mentor: '',
  position: '',
  start_date: '',
  end_date: '',
  startFormatted: '',
  endFormatted: '',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80'
};

/**
 * Cập nhật danh tính sinh viên trên Sidebar và lời chào
 */
function updateTopBarUI() {
  const sideName = document.getElementById('sidebarName');
  const sideRole = document.getElementById('sidebarRole');
  const sideAvatar = document.getElementById('sidebarAvatar');

  const displayName = internProfileData.name || 'Thực tập sinh';
  const roleName = internProfileData.role || 'Thực tập sinh';
  const avatarUrl = internProfileData.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80';

  if (sideName) sideName.textContent = displayName;
  if (sideRole) sideRole.textContent = roleName;
  if (sideAvatar) sideAvatar.src = avatarUrl;
  const welcomeName = document.getElementById('welcomeUserName');
  if (welcomeName) welcomeName.textContent = displayName;
}

/**
 * Nạp thông tin hồ sơ của thực tập sinh từ localStorage
 */
function loadInternProfileFromStorage() {
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const u = JSON.parse(userStr);
      internProfileData = {
        ...internProfileData,
        ...u,
        id: u.id || internProfileData.id,
        internId: u.internId || u.id || internProfileData.internId,
        name: u.name || internProfileData.name || '',
        email: u.email || internProfileData.email || '',
        phone: u.phone || internProfileData.phone || '',
        role: u.role || 'Thực tập sinh',
        avatar: u.avatar || internProfileData.avatar,
        school: u.school || internProfileData.school || '',
        major: u.major || internProfileData.major || '',
        faculty: u.faculty || internProfileData.faculty || '',
        course: u.course || internProfileData.course || '',
        dept: u.dept || internProfileData.dept || '',
        mentor: u.mentor || internProfileData.mentor || '',
        position: u.position || internProfileData.position || '',
        startFormatted: u.startFormatted || internProfileData.startFormatted || '',
        endFormatted: u.endFormatted || internProfileData.endFormatted || '',
        start_date: u.start_date || internProfileData.start_date || '',
        end_date: u.end_date || internProfileData.end_date || ''
      };
    }
  } catch (e) {
    console.warn('Lỗi đọc user từ localStorage:', e);
  }
  updateTopBarUI();
}

/**
 * Nạp dữ liệu vào form Hoàn thiện thông tin cá nhân (Tab Profile)
 * Đồng bộ trực tiếp từ MySQL Database thay vì localStorage
 */
async function loadProfileFormFields() {
  loadInternProfileFromStorage();

  const elName = document.getElementById('profileInputFullName');
  const elBirth = document.getElementById('profileInputBirthDate');
  const elPhone = document.getElementById('profileInputPhone');
  const elUni = document.getElementById('profileInputUniversity');
  const elFaculty = document.getElementById('profileInputFaculty');
  const elMajor = document.getElementById('profileInputMajor');
  const elCourse = document.getElementById('profileInputCourse');
  const elPos = document.getElementById('profileInputPosition');

  // Điền giá trị sẵn có từ bộ nhớ / profile đã đồng bộ
  if (elName) elName.value = internProfileData.name || '';
  if (elBirth) elBirth.value = internProfileData.birthDate || internProfileData.birth_date || '';
  if (elPhone) elPhone.value = internProfileData.phone || '';
  if (elUni) elUni.value = internProfileData.school || '';
  if (elFaculty) elFaculty.value = internProfileData.faculty || internProfileData.dept || '';
  if (elMajor) elMajor.value = internProfileData.major || '';
  if (elCourse) elCourse.value = internProfileData.course || '';
  if (elPos) elPos.value = internProfileData.position || '';

  // Đồng thời truy vấn MySQL để lấy dữ liệu mới nhất
  const internId = internProfileData.internId || internProfileData.id;
  if (internId && typeof apiGetInternDocuments === 'function') {
    try {
      const res = await apiGetInternDocuments(internId);
      if (res && res.success && res.data) {
        const d = res.data;
        if (d.name) internProfileData.name = d.name;
        if (d.birthDate) internProfileData.birthDate = d.birthDate;
        if (d.phone) internProfileData.phone = d.phone;
        if (d.school) internProfileData.school = d.school;
        if (d.faculty) internProfileData.faculty = d.faculty;
        if (d.major) internProfileData.major = d.major;
        if (d.course) internProfileData.course = d.course;
        if (d.position) internProfileData.position = d.position;
        if (d.dept) internProfileData.dept = d.dept;

        if (elName && !elName.matches(':focus')) elName.value = internProfileData.name || '';
        if (elBirth && !elBirth.matches(':focus')) elBirth.value = internProfileData.birthDate || '';
        if (elPhone && !elPhone.matches(':focus')) elPhone.value = internProfileData.phone || '';
        if (elUni && !elUni.matches(':focus')) elUni.value = internProfileData.school || '';
        if (elFaculty && !elFaculty.matches(':focus')) elFaculty.value = internProfileData.faculty || internProfileData.dept || '';
        if (elMajor && !elMajor.matches(':focus')) elMajor.value = internProfileData.major || '';
        if (elCourse && !elCourse.matches(':focus')) elCourse.value = internProfileData.course || '';
        if (elPos && !elPos.matches(':focus')) elPos.value = internProfileData.position || '';
      }
    } catch (e) {
      console.warn('Lỗi nạp thông tin cá nhân từ MySQL:', e);
    }
  }
}

/**
 * Mở màn hình Hoàn thiện thông tin cá nhân (khi bấm vào Thực tập sinh ở sidebar hoặc nút sửa hồ sơ)
 */
function openInternProfileModal() {
  switchPortalTab('profile');
}

/**
 * Đóng modal hồ sơ cá nhân cũ (nếu có gọi từ đâu)
 */
function closeInternProfileModal() {
  switchPortalTab('overview');
}

/**
 * Xử lý khi bấm nút "Tiếp tục →"
 */
async function handleSaveInternProfile(event) {
  if (event) event.preventDefault();
  await saveInternProfileFormData(true);
}

/**
 * Xử lý khi bấm nút "Lưu thông tin"
 */
async function handleSaveInternProfileOnly() {
  await saveInternProfileFormData(false);
}

/**
 * Lưu dữ liệu thông tin cá nhân trực tiếp vào MySQL Database
 */
async function saveInternProfileFormData(shouldProceed = false) {
  if (typeof hasInternPermission === 'function' && !hasInternPermission('view_own_profile', 2)) {
    if (typeof showInternNotification === 'function') {
      showInternNotification('Bạn không có quyền chỉnh sửa hồ sơ cá nhân! Quyền đã bị vô hiệu hóa trong CSDL.', 'danger');
    } else {
      alert('Bạn không có quyền chỉnh sửa hồ sơ cá nhân!');
    }
    return;
  }
  const elName = document.getElementById('profileInputFullName');
  const elBirth = document.getElementById('profileInputBirthDate');
  const elPhone = document.getElementById('profileInputPhone');
  const elUni = document.getElementById('profileInputUniversity');
  const elFaculty = document.getElementById('profileInputFaculty');
  const elMajor = document.getElementById('profileInputMajor');
  const elCourse = document.getElementById('profileInputCourse');
  const elPos = document.getElementById('profileInputPosition');

  const fullName = elName ? elName.value.trim() : '';
  const birthDate = elBirth ? elBirth.value.trim() : '';
  const phone = elPhone ? elPhone.value.trim() : '';
  const university = elUni ? elUni.value.trim() : '';
  const faculty = elFaculty ? elFaculty.value.trim() : '';
  const major = elMajor ? elMajor.value.trim() : '';
  const course = elCourse ? elCourse.value.trim() : '';
  const position = elPos ? elPos.value.trim() : '';

  if (!fullName) {
    showInternToast('Vui lòng nhập Họ và tên!', 'warning');
    if (elName) elName.focus();
    return;
  }

  const internId = internProfileData.internId || internProfileData.id;
  if (!internId) {
    showInternToast('Không tìm thấy tài khoản thực tập sinh để cập nhật!', 'danger');
    return;
  }

  const payload = {
    name: fullName,
    birthDate: birthDate,
    phone: phone,
    school: university,
    faculty: faculty,
    major: major,
    course: course,
    position: position
  };

  try {
    if (typeof apiUpdateIntern === 'function') {
      const res = await apiUpdateIntern(internId, payload);
      if (!res || !res.success) {
        showInternToast(res?.message || 'Có lỗi xảy ra khi lưu vào hệ thống!', 'danger');
        return;
      }
    }
  } catch (err) {
    console.error('Lỗi gọi API cập nhật hồ sơ cá nhân vào MySQL:', err);
    showInternToast('Không thể kết nối đến máy chủ khi lưu hồ sơ!', 'danger');
    return;
  }

  // Cập nhật trạng thái bộ nhớ
  internProfileData.name = fullName;
  internProfileData.birthDate = birthDate;
  internProfileData.phone = phone;
  internProfileData.school = university;
  internProfileData.faculty = faculty;
  if (faculty) internProfileData.dept = faculty;
  internProfileData.major = major;
  internProfileData.course = course;
  internProfileData.position = position;

  try {
    const userStr = localStorage.getItem('user');
    const u = userStr ? JSON.parse(userStr) : {};
    localStorage.setItem('user', JSON.stringify({ ...u, ...internProfileData }));
  } catch (e) {}

  updateTopBarUI();
  updateScheduleSummaryCard();

  // Đánh dấu hoàn thiện thông tin cá nhân
  InternState.profileCompleted = true;
  updateDossierSubmitCardUI();

  if (shouldProceed) {
    showInternToast('Đã lưu thông tin cá nhân vào hệ thống! Đang chuyển sang Hồ sơ & Tài liệu...', 'success');
    setTimeout(() => {
      switchPortalTab('documents');
    }, 350);
  } else {
    showInternToast('Đã lưu thông tin cá nhân thành công vào hệ thống!', 'success');
  }
}

function triggerProfileDatePicker() {
  const elBirth = document.getElementById('profileInputBirthDate');
  if (elBirth) {
    elBirth.focus();
  }
}



// ==============================================================================
// 6.6. QUẢN LÝ LỊCH THỰC TẬP (INTERNSHIP SCHEDULE) - HOÀN TOÀN ĐỘNG (NO HARDCODE)
// ==============================================================================

const InternScheduleState = {
  viewMode: 'week', // 'week' | 'month'
  currentAnchorDate: new Date(),
  selectedDateStr: formatDateKey(new Date()),
  scheduleCustomMap: {}
};

// Đọc lịch tùy biến từ localStorage nếu có
function loadCustomScheduleFromStorage() {
  try {
    const raw = localStorage.getItem('tts_custom_schedule');
    if (raw) {
      InternScheduleState.scheduleCustomMap = JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Lỗi đọc custom schedule:', e);
  }
}

// Lưu lịch tùy biến vào localStorage
function saveCustomScheduleToStorage() {
  try {
    localStorage.setItem('tts_custom_schedule', JSON.stringify(InternScheduleState.scheduleCustomMap));
  } catch (e) {
    console.warn('Lỗi ghi custom schedule:', e);
  }
}

// Hàm lấy ngày Thứ Hai của tuần cho một ngày bất kỳ
function getMondayOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  // Chủ nhật là 0, chuyển thành 7 để Thứ Hai luôn là ngày đầu tuần
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.getFullYear(), d.getMonth(), diff);
}

// Format date thành "YYYY-MM-DD"
function formatDateKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// Format date thành "DD/MM"
function formatDateShort(d) {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${day}/${m}`;
}

// Format date thành "DD/MM/YYYY"
function formatDateFull(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${day}/${m}/${y}`;
}

// Lấy tên Thứ tiếng Việt
function getVietnameseDayName(d) {
  const dayIndex = d.getDay();
  const names = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  return names[dayIndex];
}

/**
 * Hàm phân tích ngày linh hoạt (hỗ trợ cả YYYY-MM-DD và DD/MM/YYYY)
 */
function parseScheduleDate(val) {
  if (!val) return null;
  if (val instanceof Date && !isNaN(val)) return val;
  const str = String(val).trim();
  if (!str || str === '—') return null;

  if (str.includes('-')) {
    const clean = str.includes('T') ? str.split('T')[0] : str;
    const parts = clean.split('-');
    if (parts.length === 3) {
      return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    }
  }

  if (str.includes('/')) {
    const parts = str.split('/');
    if (parts.length === 3) {
      return new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
    }
  }

  const parsed = new Date(str);
  return isNaN(parsed) ? null : parsed;
}

/**
 * Trả về dữ liệu lịch cho một ngày cụ thể (Dựa trên trạng thái và kỳ thực tập thực tế trong MySQL)
 */
function getScheduleDataForDate(date) {
  const key = formatDateKey(date);

  // 1. Kiểm tra nếu có dữ liệu lưu trữ tùy biến
  if (InternScheduleState.scheduleCustomMap && InternScheduleState.scheduleCustomMap[key]) {
    return InternScheduleState.scheduleCustomMap[key];
  }

  const dayOfWeek = date.getDay(); // 0: Chủ Nhật, 1: Thứ 2...
  const dayName = getVietnameseDayName(date);
  const dayNumber = String(date.getDate()).padStart(2, '0');

  const status = InternState.status || '';
  const isApproved = status === 'Đang thực tập' || status === 'approved' || status === 'Đã duyệt';

  // Nếu thực tập sinh chưa được phê duyệt chính thức
  if (!isApproved) {
    return {
      dateKey: key,
      dayName,
      dayNumber,
      time: '—',
      task: 'Chưa có kế hoạch làm việc (Chờ HR xét duyệt hồ sơ và phân công chương trình)',
      location: '—',
      mentor: internProfileData.mentor || '—',
      isOff: true
    };
  }

  const mentorName = internProfileData.mentor || 'Chưa phân công';
  const deptName = internProfileData.dept || 'Chưa phân bổ phòng ban';
  const posName = internProfileData.position || deptName;

  // Kiểm tra thời gian bắt đầu và kết thúc kỳ thực tập từ MySQL
  const sDate = parseScheduleDate(internProfileData.start_date || internProfileData.startFormatted);
  const eDate = parseScheduleDate(internProfileData.end_date || internProfileData.endFormatted);

  // Chuẩn hóa ngày kiểm tra về 00:00:00
  const checkDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (sDate) {
    const startDateOnly = new Date(sDate.getFullYear(), sDate.getMonth(), sDate.getDate());
    if (checkDate < startDateOnly) {
      const sFormatted = internProfileData.startFormatted || formatDateFull(sDate);
      return {
        dateKey: key,
        dayName,
        dayNumber,
        time: 'Chưa bắt đầu',
        task: `Kỳ thực tập của bạn sẽ bắt đầu vào ngày ${sFormatted}`,
        location: '—',
        mentor: mentorName,
        isOff: true
      };
    }
  }

  if (eDate) {
    const endDateOnly = new Date(eDate.getFullYear(), eDate.getMonth(), eDate.getDate());
    if (checkDate > endDateOnly) {
      const eFormatted = internProfileData.endFormatted || formatDateFull(eDate);
      return {
        dateKey: key,
        dayName,
        dayNumber,
        time: 'Đã kết thúc',
        task: `Kỳ thực tập đã kết thúc vào ngày ${eFormatted}`,
        location: '—',
        mentor: mentorName,
        isOff: true
      };
    }
  }

  // Cuối tuần: Thứ 7 & Chủ Nhật
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return {
      dateKey: key,
      dayName,
      dayNumber,
      time: 'Nghỉ cuối tuần',
      task: 'Nghỉ ngơi theo quy định chung của công ty',
      location: 'Nghỉ ngơi',
      mentor: mentorName,
      isOff: true
    };
  }

  // Thứ 2 đến Thứ 6 trong kỳ thực tập
  const weekdayTasks = {
    1: `Họp giao ban đầu tuần, nhận kế hoạch công việc và mục tiêu nhiệm vụ (${posName})`,
    2: `Thực hiện nhiệm vụ chuyên môn theo phân công và tài liệu hướng dẫn (${posName})`,
    3: `Triển khai công việc chuyên môn và phối hợp cùng nhóm dự án`,
    4: `Báo cáo tiến độ và tiếp nhận hướng dẫn (Review / Mentoring) từ Mentor`,
    5: `Tổng kết tiến độ tuần, hoàn thiện báo cáo công việc và kế hoạch tuần tiếp theo`
  };

  return {
    dateKey: key,
    dayName,
    dayNumber,
    time: '08:30 – 17:30 (Nghỉ trưa 12:00 – 13:00)',
    task: weekdayTasks[dayOfWeek] || `Thực hiện nhiệm vụ chuyên môn (${posName})`,
    location: `Văn phòng CodeGym (${deptName})`,
    mentor: mentorName,
    isOff: false
  };
}

/**
 * Cập nhật thanh tóm tắt thông tin chương trình thực tập (5 cột)
 */
function updateScheduleSummaryCard() {
  const pVal = document.getElementById('schedProgramVal');
  const dVal = document.getElementById('schedDeptVal');
  const mVal = document.getElementById('schedMentorVal');
  const sVal = document.getElementById('schedStartDateVal');
  const eVal = document.getElementById('schedEndDateVal');

  const status = InternState.status || '';
  const isApproved = status === 'Đang thực tập' || status === 'approved' || status === 'Đã duyệt';

  let programName = 'Chưa phân công';
  if (isApproved) {
    programName = internProfileData.position || internProfileData.dept || 'Chương trình thực tập CodeGym';
  }

  const dept = isApproved ? (internProfileData.dept || 'Chưa phân bổ') : 'Chưa phân bổ';
  const mentor = isApproved ? (internProfileData.mentor || 'Chưa phân công') : '—';
  const start = isApproved ? (internProfileData.startFormatted || internProfileData.start_date || '—') : '—';
  const end = isApproved ? (internProfileData.endFormatted || internProfileData.end_date || '—') : '—';

  if (pVal) pVal.textContent = programName;
  if (dVal) dVal.textContent = dept;
  if (mVal) mVal.textContent = mentor;
  if (sVal) sVal.textContent = start;
  if (eVal) eVal.textContent = end;
}

/**
 * Render chế độ Lịch Theo tuần (Week View)
 */
function renderScheduleWeekView() {
  const container = document.getElementById('scheduleWeekContainer');
  if (!container) return;

  const monday = getMondayOfWeek(InternScheduleState.currentAnchorDate);
  const weekDays = [];
  for (let i = 0; i < 5; i++) {
    const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
    weekDays.push(d);
  }

  // Cập nhật tiêu đề tuần: ví dụ "Tuần 28/09 – 02/10/2026"
  const titleEl = document.getElementById('scheduleWeekRangeTitle');
  const friday = weekDays[4];
  const monStr = formatDateShort(monday);
  const friStr = formatDateFull(friday);
  if (titleEl) {
    titleEl.textContent = `Tuần ${monStr} – ${friStr}`;
  }

  // Nếu ngày đang chọn không nằm trong tuần này, tự động chọn Thứ Hai của tuần
  const currentWeekKeys = weekDays.map(d => formatDateKey(d));
  if (!currentWeekKeys.includes(InternScheduleState.selectedDateStr)) {
    InternScheduleState.selectedDateStr = currentWeekKeys[0];
  }

  let html = '';
  weekDays.forEach(dayDate => {
    const dateKey = formatDateKey(dayDate);
    const dayData = getScheduleDataForDate(dayDate);
    const isSelected = dateKey === InternScheduleState.selectedDateStr;

    html += `
      <div class="schedule-day-card ${isSelected ? 'selected' : ''}" 
           id="sched-card-${dateKey}" 
           onclick="selectScheduleDay('${dateKey}')">
        <div class="day-header-meta">
          <div class="day-name">${dayData.dayName}</div>
          <div class="day-number">${dayData.dayNumber}</div>
        </div>
        <div class="day-time-badge">${dayData.time}</div>
        <div class="day-task-title" title="${dayData.task}">${dayData.task}</div>
        <div class="day-location-info" title="${dayData.location}">
          ${dayData.location}
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

/**
 * Render chi tiết ngày đang chọn ở cột phải (Plan Details Card)
 */
function renderScheduleDetail() {
  const dateStr = InternScheduleState.selectedDateStr;
  const parts = dateStr.split('-');
  const dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  const data = getScheduleDataForDate(dateObj);

  const titleEl = document.getElementById('schedDetailDateTitle');
  const timeEl = document.getElementById('schedDetailTime');
  const taskEl = document.getElementById('schedDetailTask');
  const locEl = document.getElementById('schedDetailLocation');
  const mentorEl = document.getElementById('schedDetailMentor');

  if (titleEl) titleEl.textContent = `${data.dayName}, ${formatDateFull(dateObj)}`;
  if (timeEl) timeEl.textContent = data.time;
  if (taskEl) taskEl.textContent = data.task;
  if (locEl) locEl.textContent = data.location;
  if (mentorEl) mentorEl.textContent = data.mentor || internProfileData.mentor || '—';
}

/**
 * Render chế độ Lịch Theo tháng (Month View)
 */
function renderScheduleMonthView() {
  const container = document.getElementById('scheduleMonthContainer');
  if (!container) return;

  const curr = InternScheduleState.currentAnchorDate;
  const year = curr.getFullYear();
  const month = curr.getMonth();

  const monthNames = [
    'Tháng 01', 'Tháng 02', 'Tháng 03', 'Tháng 04', 'Tháng 05', 'Tháng 06',
    'Tháng 07', 'Tháng 08', 'Tháng 09', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  let startDay = firstDay.getDay(); // 0 is Sunday
  startDay = startDay === 0 ? 6 : startDay - 1; // Mon = 0, Sun = 6

  let html = `
    <div class="month-view-header">
      <h4 class="month-view-title">${monthNames[month]} năm ${year}</h4>
      <div class="d-flex gap-1">
        <button type="button" class="btn-period-nav" onclick="navigateScheduleMonth(-1)" title="Tháng trước">
          <i class="bi bi-chevron-left"></i>
        </button>
        <button type="button" class="btn-period-nav" onclick="navigateScheduleMonth(1)" title="Tháng sau">
          <i class="bi bi-chevron-right"></i>
        </button>
      </div>
    </div>
    <div class="month-calendar-grid">
      <div class="month-weekday-label">T2</div>
      <div class="month-weekday-label">T3</div>
      <div class="month-weekday-label">T4</div>
      <div class="month-weekday-label">T5</div>
      <div class="month-weekday-label">T6</div>
      <div class="month-weekday-label text-danger">T7</div>
      <div class="month-weekday-label text-danger">CN</div>
  `;

  // Ô của tháng trước
  for (let i = 0; i < startDay; i++) {
    const prevDate = new Date(year, month, 1 - (startDay - i));
    html += `
      <div class="month-day-cell other-month">
        <span class="month-cell-num">${prevDate.getDate()}</span>
      </div>
    `;
  }

  // Các ngày trong tháng hiện tại
  for (let day = 1; day <= lastDay.getDate(); day++) {
    const cellDate = new Date(year, month, day);
    const dateKey = formatDateKey(cellDate);
    const isSelected = dateKey === InternScheduleState.selectedDateStr;
    const isWeekend = cellDate.getDay() === 0 || cellDate.getDay() === 6;
    const data = !isWeekend ? getScheduleDataForDate(cellDate) : null;

    html += `
      <div class="month-day-cell ${isSelected ? 'selected' : ''}" onclick="selectScheduleDay('${dateKey}', true)">
        <span class="month-cell-num ${isWeekend ? 'text-muted' : ''}">${day}</span>
        ${data ? `<span class="month-cell-badge" title="${data.task}">${data.task.slice(0, 16)}...</span>` : ''}
      </div>
    `;
  }

  html += `</div>`;
  container.innerHTML = html;
}

/**
 * Chọn ngày trên lịch
 */
function selectScheduleDay(dateKey, fromMonth = false) {
  InternScheduleState.selectedDateStr = dateKey;
  const parts = dateKey.split('-');
  const targetDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));

  if (fromMonth) {
    InternScheduleState.currentAnchorDate = targetDate;
  }

  // Cập nhật class active cho các card tuần
  document.querySelectorAll('.schedule-day-card').forEach(c => c.classList.remove('selected'));
  const activeCard = document.getElementById(`sched-card-${dateKey}`);
  if (activeCard) activeCard.classList.add('selected');

  renderScheduleDetail();

  if (InternScheduleState.viewMode === 'month') {
    renderScheduleMonthView();
  }
}

/**
 * Chuyển đổi chế độ xem: Theo tuần / Theo tháng
 */
function setScheduleViewMode(mode) {
  InternScheduleState.viewMode = mode;
  const btnWeek = document.getElementById('btnToggleWeek');
  const btnMonth = document.getElementById('btnToggleMonth');
  const weekContainer = document.getElementById('scheduleWeekContainer');
  const monthContainer = document.getElementById('scheduleMonthContainer');

  if (mode === 'week') {
    if (btnWeek) btnWeek.classList.add('active');
    if (btnMonth) btnMonth.classList.remove('active');
    if (weekContainer) weekContainer.classList.remove('d-none');
    if (monthContainer) monthContainer.classList.add('d-none');
    renderScheduleWeekView();
  } else {
    if (btnWeek) btnWeek.classList.remove('active');
    if (btnMonth) btnMonth.classList.add('active');
    if (weekContainer) weekContainer.classList.add('d-none');
    if (monthContainer) monthContainer.classList.remove('d-none');
    renderScheduleMonthView();
  }
}

/**
 * Điều hướng tuần / tháng kế tiếp hoặc trước đó
 */
function navigateSchedulePeriod(direction) {
  if (InternScheduleState.viewMode === 'week') {
    const cur = new Date(InternScheduleState.currentAnchorDate);
    cur.setDate(cur.getDate() + direction * 7);
    InternScheduleState.currentAnchorDate = cur;
    renderScheduleWeekView();
    renderScheduleDetail();
  } else {
    navigateScheduleMonth(direction);
  }
}

function navigateScheduleMonth(direction) {
  const cur = new Date(InternScheduleState.currentAnchorDate);
  cur.setMonth(cur.getMonth() + direction);
  InternScheduleState.currentAnchorDate = cur;
  renderScheduleMonthView();
}

/**
 * Trở về tuần làm việc hiện tại thực tế
 */
function resetScheduleToCurrent() {
  InternScheduleState.currentAnchorDate = new Date();
  InternScheduleState.selectedDateStr = formatDateKey(new Date());
  renderSchedule();
  showInternToast('Đã quay về tuần làm việc hiện tại', 'info');
}

/**
 * Khởi chạy và render toàn bộ module Lịch thực tập
 */
function renderSchedule() {
  updateScheduleSummaryCard();

  const status = InternState.status || '';
  const isApproved = status === 'Đang thực tập' || status === 'approved' || status === 'Đã duyệt';

  const scheduleContentRow = document.querySelector('.schedule-content-row');
  const periodNav = document.querySelector('.schedule-period-nav');
  const existingEmpty = document.getElementById('scheduleEmptyPlaceholder');

  if (!isApproved) {
    if (scheduleContentRow) scheduleContentRow.classList.add('d-none');
    if (periodNav) periodNav.classList.add('d-none');

    if (!existingEmpty) {
      const summaryCard = document.querySelector('.schedule-summary-card');
      if (summaryCard) {
        const emptyEl = document.createElement('div');
        emptyEl.id = 'scheduleEmptyPlaceholder';
        emptyEl.innerHTML = `
          <div style="text-align: center; padding: 60px 24px; background: #ffffff; border: 1.5px dashed #cbd5e1; border-radius: 12px; margin-top: 18px; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
            <div style="width: 64px; height: 64px; border-radius: 50%; background: #f8fafc; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; color: #94a3b8; font-size: 30px; border: 1px solid #e2e8f0;">
              <i class="bi bi-calendar-x"></i>
            </div>
            <h3 style="font-size: 17px; font-weight: 700; color: #1e293b; margin-bottom: 8px;">Chưa có lịch thực tập được phân công</h3>
            <p style="font-size: 13.5px; color: #64748b; max-width: 520px; margin: 0 auto 18px; line-height: 1.6;">
              Lịch làm việc và kế hoạch nhiệm vụ sẽ được kích hoạt sau khi Phòng Nhân sự (HR) phê duyệt hồ sơ và phân công chương trình thực tập cho bạn.
            </p>
            <span class="badge bg-warning-subtle text-warning border border-warning px-3 py-2 rounded-pill" style="font-size: 12px; font-weight: 600;">
              <i class="bi bi-hourglass-split me-1"></i>Trạng thái hồ sơ: ${status || 'Chưa hoàn thiện'}
            </span>
          </div>
        `;
        summaryCard.parentNode.insertBefore(emptyEl, summaryCard.nextSibling);
      }
    } else {
      existingEmpty.classList.remove('d-none');
      const badge = existingEmpty.querySelector('.badge');
      if (badge) badge.innerHTML = `<i class="bi bi-hourglass-split me-1"></i>Trạng thái hồ sơ: ${status || 'Chưa hoàn thiện'}`;
    }
    return;
  }

  // Đã là TTS chính thức: Hiển thị bảng lịch
  if (existingEmpty) existingEmpty.classList.add('d-none');
  if (scheduleContentRow) scheduleContentRow.classList.remove('d-none');
  if (periodNav) periodNav.classList.remove('d-none');

  if (InternScheduleState.viewMode === 'week') {
    renderScheduleWeekView();
  } else {
    renderScheduleMonthView();
  }
  renderScheduleDetail();
}

// ==============================================================================
// 6.7. QUẢN LÝ CHẤM CÔNG CÁ NHÂN (ATTENDANCE) - 100% PERSISTENCE MYSQL DATABASE
// ==============================================================================

const AttendanceState = {
  todayStatus: 'not_checked_in', // 'not_checked_in' | 'checked_in' | 'completed'
  todayCheckIn: null,            // Chuỗi ví dụ '08:27' hoặc null (mặc định để trống: —)
  todayCheckOut: null,           // Chuỗi ví dụ '17:34' hoặc null (mặc định để trống: —)
  todayTotalWork: null,          // Chuỗi ví dụ '8 giờ 07 phút' hoặc null (mặc định để trống: —)
  history: []                    // Lịch sử chấm công hoàn toàn từ MySQL Database
};

/**
 * Tải toàn bộ dữ liệu chấm công trực tiếp từ MySQL Database (không phụ thuộc vào localStorage/cookie)
 */
async function loadAttendanceFromDB() {
  const actualInternId = internProfileData.internId || internProfileData.id || 1;
  const todayKey = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' });

  if (typeof apiGetAttendance === 'function') {
    try {
      const res = await apiGetAttendance({ intern_id: actualInternId });
      if (res && res.success && Array.isArray(res.data)) {
        // Ánh xạ lịch sử chấm công từ MySQL
        AttendanceState.history = res.data.map(row => {
          const d = row.date.includes('T') ? row.date.split('T')[0] : row.date;
          const [y, m, day] = d.split('-');
          let statusText = 'Đúng giờ';
          if (row.status === 'late') statusText = 'Muộn';
          else if (row.status === 'absent') statusText = 'Vắng mặt';
          else if (row.status === 'leave') statusText = 'Nghỉ phép';
          else if (!row.check_out && row.check_in) statusText = 'Chưa checkout';

          return {
            date: `${day}/${m}/${y}`,
            rawDate: d,
            checkIn: row.check_in || '—',
            checkOut: row.check_out || '—',
            total: row.total_hours || '—',
            status: statusText
          };
        });

        // Tìm bản ghi ngày hôm nay trong MySQL
        const todayRow = res.data.find(r => {
          const rDate = r.date.includes('T') ? r.date.split('T')[0] : r.date;
          return rDate === todayKey;
        });

        if (!todayRow) {
          AttendanceState.todayStatus = 'not_checked_in';
          AttendanceState.todayCheckIn = null;
          AttendanceState.todayCheckOut = null;
          AttendanceState.todayTotalWork = null;
        } else if (todayRow.check_in && !todayRow.check_out) {
          AttendanceState.todayStatus = 'checked_in';
          AttendanceState.todayCheckIn = todayRow.check_in;
          AttendanceState.todayCheckOut = null;
          AttendanceState.todayTotalWork = null;
        } else if (todayRow.check_in && todayRow.check_out) {
          AttendanceState.todayStatus = 'completed';
          AttendanceState.todayCheckIn = todayRow.check_in;
          AttendanceState.todayCheckOut = todayRow.check_out;
          AttendanceState.todayTotalWork = todayRow.total_hours || '—';
        } else {
          AttendanceState.todayStatus = 'not_checked_in';
          AttendanceState.todayCheckIn = null;
          AttendanceState.todayCheckOut = null;
          AttendanceState.todayTotalWork = null;
        }

        renderAttendanceToday();
        renderAttendanceHistory();
        return;
      }
    } catch (e) {
      console.warn('Lỗi tải dữ liệu chấm công từ MySQL:', e);
    }
  }

  AttendanceState.todayStatus = 'not_checked_in';
  AttendanceState.todayCheckIn = null;
  AttendanceState.todayCheckOut = null;
  AttendanceState.todayTotalWork = null;
  AttendanceState.history = [];
  renderAttendanceToday();
  renderAttendanceHistory();
}

/**
 * Khởi tạo Tab Chấm công
 */
async function initAttendanceTab() {
  const dateEl = document.getElementById('todayAttendanceDate');
  if (dateEl) {
    const d = new Date();
    const dayNames = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const dayName = dayNames[d.getDay()];
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    dateEl.textContent = `${dayName}, ${day}/${month}/${year}`;
  }

  // Cập nhật Mentor ở Ca làm việc hôm nay (để trống — nếu chưa có dữ liệu)
  const mentorEl = document.getElementById('todayShiftMentor');
  if (mentorEl) {
    mentorEl.textContent = internProfileData.mentor || '—';
  }

  // Cập nhật các thông số theo lịch: nếu không có ca làm việc/ngày nghỉ thì để trống —
  const schedStartEl = document.getElementById('todayScheduledStart');
  const schedEndEl = document.getElementById('todayScheduledEnd');
  const shiftTimeEl = document.getElementById('todayShiftTime');
  const shiftLocEl = document.getElementById('todayShiftLocation');
  const shiftLunchEl = document.getElementById('todayShiftLunch');

  const todaySched = typeof getScheduleDataForDate === 'function' ? getScheduleDataForDate(new Date()) : null;
  if (todaySched && todaySched.time && todaySched.time.includes('–')) {
    const parts = todaySched.time.split('–').map(s => s.trim());
    if (schedStartEl) schedStartEl.textContent = parts[0] || '—';
    if (schedEndEl) schedEndEl.textContent = parts[1] || '—';
    if (shiftTimeEl) shiftTimeEl.textContent = todaySched.time;
    if (shiftLocEl) shiftLocEl.textContent = todaySched.location || '—';
    if (shiftLunchEl) shiftLunchEl.textContent = '12:00 – 13:00';
  } else {
    // Không có ca làm việc / ngày nghỉ / chưa có lịch
    if (schedStartEl) schedStartEl.textContent = '—';
    if (schedEndEl) schedEndEl.textContent = '—';
    if (shiftTimeEl) shiftTimeEl.textContent = '—';
    if (shiftLocEl) shiftLocEl.textContent = '—';
    if (shiftLunchEl) shiftLunchEl.textContent = '—';
  }

  await loadAttendanceFromDB();
  await loadInternLeavesFromDB();
}

/**
 * Render giao diện thẻ Hôm nay (để trống dữ liệu nếu chưa check-in)
 */
function renderAttendanceToday() {
  const checkInEl = document.getElementById('todayCheckInTime');
  const checkOutEl = document.getElementById('todayCheckOutTime');
  const totalEl = document.getElementById('todayTotalWorkTime');
  const badgeEl = document.getElementById('todayStatusBadge');
  const btnEl = document.getElementById('btnCheckInOut');

  if (checkInEl) checkInEl.textContent = AttendanceState.todayCheckIn || '—';
  if (checkOutEl) checkOutEl.textContent = AttendanceState.todayCheckOut || '—';
  if (totalEl) totalEl.textContent = AttendanceState.todayTotalWork || '—';

  if (badgeEl && btnEl) {
    badgeEl.className = 'status-pill-badge';
    btnEl.className = 'btn-checkin-action';

    if (AttendanceState.todayStatus === 'not_checked_in') {
      badgeEl.textContent = 'Chưa check-in';
      btnEl.textContent = 'CHECK-IN';
      btnEl.disabled = false;
    } else if (AttendanceState.todayStatus === 'checked_in') {
      badgeEl.textContent = 'Đã check-in';
      badgeEl.classList.add('active-checkin');
      btnEl.textContent = 'CHECK-OUT';
      btnEl.classList.add('is-checkout');
      btnEl.disabled = false;
    } else if (AttendanceState.todayStatus === 'completed') {
      badgeEl.textContent = 'Đã hoàn thành';
      badgeEl.classList.add('completed');
      btnEl.textContent = 'ĐÃ HOÀN THÀNH';
      btnEl.classList.add('is-done');
      btnEl.disabled = true;
    }
  }
}

/**
 * Xử lý nút bấm CHECK-IN / CHECK-OUT (Lưu trực tiếp vào MySQL Database, hoàn toàn không dùng cookie/localStorage)
 */
async function handleToggleCheckInOut() {
  const btnEl = document.getElementById('btnCheckInOut');
  if (btnEl) btnEl.disabled = true;

  const actualInternId = internProfileData.internId || internProfileData.id || 1;
  const todayKey = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' });

  try {
    if (typeof apiCheckInOut === 'function') {
      const res = await apiCheckInOut(actualInternId, todayKey);
      if (res && res.success) {
        showInternToast(res.message || 'Chấm công thành công!', 'success');
      } else {
        showInternToast(res?.message || 'Lỗi thao tác chấm công', 'danger');
      }
    }
  } catch (err) {
    console.error('Lỗi gọi API check-in/out:', err);
    showInternToast('Không thể kết nối đến máy chủ chấm công', 'danger');
  } finally {
    await loadAttendanceFromDB();
  }
}

/**
 * Render bảng lịch sử chấm công (Nếu mảng rỗng thì để trống sạch sẽ)
 */
function renderAttendanceHistory() {
  const tbody = document.getElementById('attendanceHistoryBody');
  if (!tbody) return;

  if (!AttendanceState.history || AttendanceState.history.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="empty-state-cell">
          <div class="empty-state-box">
            <i class="bi bi-clock-history"></i>
            <span>Chưa có dữ liệu chấm công.</span>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  let html = '';
  AttendanceState.history.forEach(row => {
    let badgeClass = 'badge-status-ontime';
    if (row.status === 'Muộn') badgeClass = 'badge-status-late';
    if (row.status === 'Chưa checkout') badgeClass = 'badge-status-nocheckout';

    html += `
      <tr>
        <td class="fw-semibold text-dark">${row.date}</td>
        <td><span class="history-time-badge">${row.checkIn || '—'}</span></td>
        <td><span class="history-time-badge">${row.checkOut || '—'}</span></td>
        <td class="fw-medium">${row.total || '—'}</td>
        <td><span class="${badgeClass}">${row.status || 'Đúng giờ'}</span></td>
      </tr>
    `;
  });
  tbody.innerHTML = html;
}

// ==============================================================================
// 6.7.1. QUẢN LÝ ĐĂNG KÝ NGHỈ PHÉP (LEAVE REQUESTS - USER STORY 24)
// ==============================================================================

/**
 * Mở modal Đăng ký nghỉ phép cho Thực tập sinh
 */
function openInternLeaveModal() {
  const modal = document.getElementById('internLeaveModal');
  const startInput = document.getElementById('internLeaveStartDate');
  const endInput = document.getElementById('internLeaveEndDate');
  const countEl = document.getElementById('internLeaveDaysCount');
  const reasonInput = document.getElementById('internLeaveReason');

  const todayStr = new Date().toISOString().split('T')[0];
  if (startInput) startInput.value = todayStr;
  if (endInput) endInput.value = todayStr;
  if (countEl) countEl.textContent = '1 ngày';
  if (reasonInput) reasonInput.value = '';

  if (modal) modal.classList.add('show');
}

/**
 * Đóng modal Đăng ký nghỉ phép
 */
function closeInternLeaveModal() {
  const modal = document.getElementById('internLeaveModal');
  if (modal) modal.classList.remove('show');
}

/**
 * Tự động tính số ngày nghỉ dự kiến khi đổi ngày
 */
function calculateInternLeaveDays() {
  const startInput = document.getElementById('internLeaveStartDate');
  const endInput = document.getElementById('internLeaveEndDate');
  const countEl = document.getElementById('internLeaveDaysCount');
  if (!startInput || !endInput || !countEl) return;

  const sVal = startInput.value;
  const eVal = endInput.value;
  if (!sVal || !eVal) {
    countEl.textContent = '0 ngày';
    return;
  }

  const sDate = new Date(sVal);
  const eDate = new Date(eVal);
  if (sDate > eDate) {
    countEl.textContent = 'Khoảng ngày không hợp lệ';
    return;
  }

  const diffTime = Math.abs(eDate - sDate);
  const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  countEl.textContent = `${days} ngày`;
}

/**
 * Xử lý nộp đơn xin nghỉ phép lên hệ thống phòng nhân sự (HR) trực tiếp vào MySQL Database
 */
async function handleSubmitInternLeave(event) {
  if (event) event.preventDefault();

  const typeSelect = document.getElementById('internLeaveType');
  const startInput = document.getElementById('internLeaveStartDate');
  const endInput = document.getElementById('internLeaveEndDate');
  const reasonInput = document.getElementById('internLeaveReason');

  if (!startInput || !endInput || !reasonInput) return;

  const startDate = startInput.value;
  const endDate = endInput.value;
  const reason = reasonInput.value.trim();
  const leaveType = typeSelect ? typeSelect.value : 'Việc cá nhân';

  if (!startDate || !endDate) {
    showInternToast('Vui lòng chọn ngày bắt đầu và kết thúc', 'warning');
    return;
  }

  if (new Date(startDate) > new Date(endDate)) {
    showInternToast('Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu', 'warning');
    return;
  }

  if (!reason) {
    showInternToast('Vui lòng nhập lý do xin nghỉ phép chi tiết', 'warning');
    return;
  }

  const internId = internProfileData.internId || internProfileData.id || 1;
  const submitBtn = event?.target?.querySelector('button[type="submit"]');
  if (submitBtn) submitBtn.disabled = true;

  try {
    if (typeof apiCreateLeave === 'function') {
      const res = await apiCreateLeave({
        intern_id: internId,
        leave_type: leaveType,
        start_date: startDate,
        end_date: endDate,
        reason: reason
      });

      if (res && res.success) {
        showInternToast('Đã gửi đơn xin nghỉ phép đến phòng nhân sự (HR) thành công!', 'success');
      } else {
        showInternToast(res?.message || 'Gửi đơn nghỉ phép thất bại', 'danger');
      }
    }
  } catch (err) {
    console.error('Lỗi gửi đơn nghỉ phép lên server:', err);
    showInternToast('Không thể kết nối đến máy chủ khi gửi đơn nghỉ phép', 'danger');
  } finally {
    if (submitBtn) submitBtn.disabled = false;
  }

  closeInternLeaveModal();
  await loadInternLeavesFromDB();
}

/**
 * Tải và hiển thị danh sách đơn nghỉ phép trực tiếp từ MySQL Database (Không phụ thuộc vào cookie/localStorage)
 */
async function loadInternLeavesFromDB() {
  const tbody = document.getElementById('internLeavesTableBody');
  if (!tbody) return;

  const internId = internProfileData.internId || internProfileData.id || 1;
  let leaves = [];

  if (typeof apiGetLeaves === 'function') {
    try {
      const res = await apiGetLeaves({ intern_id: internId });
      if (res && res.success && Array.isArray(res.data)) {
        leaves = res.data;
      }
    } catch (e) {
      console.warn('Lỗi tải danh sách nghỉ phép từ server:', e);
    }
  }

  if (!leaves || leaves.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="empty-state-cell text-center py-4">
          <div class="empty-state-box text-muted">
            <i class="bi bi-calendar-check fs-3 text-secondary d-block mb-2"></i>
            <span>Bạn chưa có đơn xin nghỉ phép nào. Nhấn <b>"Đăng ký nghỉ phép"</b> để tạo đơn mới.</span>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  const formatDMY = (dStr) => {
    if (!dStr) return '';
    const clean = dStr.includes('T') ? dStr.split('T')[0] : dStr;
    const p = clean.split('-');
    if (p.length === 3) return `${p[2]}/${p[1]}/${p[0]}`;
    return dStr;
  };

  let html = '';
  leaves.forEach(leave => {
    let statusBadge = '<span class="badge bg-warning-subtle text-warning border border-warning px-2 py-1 rounded-pill" style="font-size: 11.5px; font-weight: 600;"><i class="bi bi-hourglass-split me-1"></i>Chờ duyệt</span>';
    if (leave.status === 'approved' || leave.status === 'Đã duyệt') {
      statusBadge = '<span class="badge bg-success-subtle text-success border border-success px-2 py-1 rounded-pill" style="font-size: 11.5px; font-weight: 600;"><i class="bi bi-check-circle me-1"></i>Đã duyệt</span>';
    } else if (leave.status === 'rejected' || leave.status === 'Từ chối') {
      statusBadge = '<span class="badge bg-danger-subtle text-danger border border-danger px-2 py-1 rounded-pill" style="font-size: 11.5px; font-weight: 600;"><i class="bi bi-x-circle me-1"></i>Từ chối</span>';
    }

    const typeLabel = leave.leave_type || leave.leaveType || 'Việc cá nhân';
    const timeRange = `${formatDMY(leave.start_date || leave.startDate)} – ${formatDMY(leave.end_date || leave.endDate)}`;
    const daysCount = leave.days_count || leave.days || 1;
    let submittedText = '—';
    if (leave.created_at) {
      const subD = new Date(leave.created_at);
      submittedText = `${String(subD.getDate()).padStart(2, '0')}/${String(subD.getMonth() + 1).padStart(2, '0')}/${subD.getFullYear()} ${String(subD.getHours()).padStart(2, '0')}:${String(subD.getMinutes()).padStart(2, '0')}`;
    } else if (leave.submittedAt) {
      submittedText = leave.submittedAt;
    }

    html += `
      <tr>
        <td>
          <span class="badge bg-light text-dark border px-2 py-1 rounded" style="font-size: 12px; font-weight: 600;">${typeLabel}</span>
        </td>
        <td style="font-size: 13px; font-weight: 600; color: #1e293b;">
          ${timeRange}
        </td>
        <td>
          <span class="fw-bold text-primary" style="font-size: 13px;">${daysCount} ngày</span>
        </td>
        <td style="font-size: 12.5px; color: #475569; max-width: 260px;" title="${leave.reason || ''}">
          ${leave.reason || ''}
        </td>
        <td style="font-size: 12px; color: #64748b;">
          ${submittedText}
        </td>
        <td>
          ${statusBadge}
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
}

function renderInternLeaves() {
  loadInternLeavesFromDB();
}

// ==============================================================================
// 6.8. QUẢN LÝ HỢP ĐỒNG THỰC TẬP (CONTRACTS) - PERSISTENT & SYNC VỚI HR & MYSQL
// ==============================================================================

const ContractsState = {
  currentModalContractId: null,
  contracts: []
};

async function loadContractsFromDB() {
  let currentInternId = internProfileData.internId || internProfileData.id;
  let currentEmail = internProfileData.email;
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      const u = JSON.parse(userStr);
      if (!currentInternId) currentInternId = u.internId || u.id;
      if (!currentEmail) currentEmail = u.email;
    } catch(e) {}
  }
  if (!currentInternId) currentInternId = 1;

  ContractsState.contracts = [];

  if (typeof apiGetContracts === 'function') {
    try {
      const res = await apiGetContracts({ 
        intern_id: currentInternId,
        email: currentEmail
      });
      if (res && res.success && Array.isArray(res.data)) {
        ContractsState.contracts = res.data.map(c => {
          const rawUrl = c.file_url || '';
          const fileUrl = rawUrl.startsWith('http') ? rawUrl : (rawUrl ? `http://localhost:5000${rawUrl}` : '');
          return {
            id: String(c.id),
            internId: c.intern_id,
            code: c.code,
            title: c.title,
            fileName: c.file_name || 'Hop_Dong_Thuc_Tap.pdf',
            fileUrl: fileUrl,
            company: c.company || 'Hệ thống Đào tạo CodeGym Việt Nam',
            dept: c.dept || 'Phòng Phát triển Phần mềm',
            period: c.period || '01/03/2026 - 31/05/2026',
            status: c.status,
            rejectReason: c.reject_reason || ''
          };
        });
      }
    } catch (e) {
      console.warn('Lỗi tải hợp đồng từ server:', e);
    }
  }

  updateContractNoticeBanner();
  renderContractList();
}

function loadContractsStateFromStorage() {
  loadContractsFromDB();
}

function saveContractsStateToStorage() {
  // Không lưu localStorage - đồng bộ 100% với MySQL Database
}

/**
 * Khởi tạo Tab Hợp đồng thực tập
 */
async function initContractsTab() {
  await loadContractsFromDB();
}

/**
 * Cập nhật thanh thông báo hợp đồng chờ xác nhận
 */
function updateContractNoticeBanner() {
  const banner = document.getElementById('contractNoticeBanner');

  const pendingList = (ContractsState.contracts || []).filter(c => c.status === 'pending');
  const count = pendingList.length;

  // Cập nhật huy hiệu số lượng hợp đồng chờ ký trên Sidebar Menu
  const menuBtn = document.getElementById('menu-contracts');
  let menuBadge = document.getElementById('contractMenuBadge');
  if (menuBtn && !menuBadge) {
    menuBadge = document.createElement('span');
    menuBadge.id = 'contractMenuBadge';
    menuBadge.className = 'badge bg-danger rounded-pill ms-auto';
    menuBadge.style.fontSize = '10px';
    menuBadge.style.padding = '3px 7px';
    menuBtn.appendChild(menuBadge);
  }
  if (menuBadge) {
    if (count > 0) {
      menuBadge.textContent = count;
      menuBadge.style.display = 'inline-block';
    } else {
      menuBadge.style.display = 'none';
    }
  }

  if (!banner) return;

  if (!ContractsState.contracts || ContractsState.contracts.length === 0) {
    banner.innerHTML = `
      <div class="contract-alert-strip alert-info-neutral">
        <div class="alert-icon-box" style="background: #f1f5f9; color: #64748b;">
          <i class="bi bi-file-earmark-break"></i>
        </div>
        <div>
          <div class="alert-title">Chưa có hợp đồng nào được phân công</div>
          <div class="alert-desc">Phòng Nhân sự sẽ tải lên và gửi hợp đồng cho bạn sau khi xét duyệt hồ sơ thực tập.</div>
        </div>
      </div>
    `;
    return;
  }

  if (count > 0) {
    banner.innerHTML = `
      <div class="contract-alert-strip">
        <div class="alert-icon-box">
          <i class="bi bi-file-earmark-text-fill"></i>
        </div>
        <div>
          <div class="alert-title">Bạn có ${count} hợp đồng đang chờ xác nhận</div>
          <div class="alert-desc">Vui lòng đọc kỹ nội dung và phản hồi cho phòng nhân sự.</div>
        </div>
      </div>
    `;
  } else {
    banner.innerHTML = `
      <div class="contract-alert-strip alert-info-neutral">
        <div class="alert-icon-box" style="background: #e2e8f0; color: #64748b;">
          <i class="bi bi-shield-check"></i>
        </div>
        <div>
          <div class="alert-title">Không có hợp đồng nào đang chờ xác nhận</div>
          <div class="alert-desc">Tất cả các tài liệu hợp đồng của bạn đã được cập nhật và phản hồi đầy đủ.</div>
        </div>
      </div>
    `;
  }
}

/**
 * Render bảng danh sách hợp đồng (Nếu rỗng thì để trống sạch sẽ)
 */
function renderContractList() {
  const tbody = document.getElementById('contractTableBody');
  if (!tbody) return;

  if (!ContractsState.contracts || ContractsState.contracts.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="empty-state-cell">
          <div class="empty-state-box">
            <i class="bi bi-file-earmark-x"></i>
            <span>Chưa có hợp đồng nào được phân công. Phòng Nhân sự sẽ tải lên và gửi hợp đồng cho bạn sau khi xét duyệt hồ sơ.</span>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  let html = '';
  ContractsState.contracts.forEach(item => {
    let badgeHtml = '';
    if (item.status === 'pending') {
      badgeHtml = `<span class="badge-contract-pending">Chờ xác nhận</span>`;
    } else if (item.status === 'approved') {
      badgeHtml = `<span class="badge-contract-approved">Đã xác nhận</span>`;
    } else if (item.status === 'rejected') {
      badgeHtml = `<span class="badge-contract-rejected">Đã từ chối</span>`;
    }

    html += `
      <tr>
        <td class="fw-bold text-secondary" style="font-size: 13px;">${item.code}</td>
        <td>
          <div class="fw-bold text-dark">${item.title}</div>
          <div class="text-muted" style="font-size: 11.5px;">${item.fileName}</div>
        </td>
        <td>${item.company}</td>
        <td>${item.dept}</td>
        <td style="white-space: nowrap; font-size: 12.5px;">${item.period}</td>
        <td>${badgeHtml}</td>
        <td class="text-end">
          <button type="button" class="btn-view-contract" onclick="openContractDetailModal('${item.id}')">
            Xem hợp đồng
          </button>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
}

/**
 * Mở modal xem chi tiết và phản hồi hợp đồng
 */
function openContractDetailModal(contractId) {
  const contract = ContractsState.contracts.find(c => c.id === contractId);
  if (!contract) return;

  ContractsState.currentModalContractId = contractId;

  const modal = document.getElementById('contractDetailModal');
  const titleEl = document.getElementById('modalContractTitle');
  const subEl = document.getElementById('modalContractSub');
  const contentEl = document.getElementById('modalContractContent');
  const actionsEl = document.getElementById('modalContractFooterActions');

  const rawUrl = contract.fileUrl || '';
  const fullUrl = rawUrl.startsWith('http') ? rawUrl : (rawUrl ? `http://localhost:5000${rawUrl}` : '');
  const fileName = contract.fileName || 'Hop_Dong_Thuc_Tap.pdf';
  const ext = (fileName || rawUrl).split('.').pop().toLowerCase();
  const internName = internProfileData.name || '—';

  if (titleEl) titleEl.textContent = contract.title;
  if (subEl) subEl.textContent = `Mã hợp đồng: ${contract.code} • Tệp đính kèm: ${fileName}`;

  if (contentEl) {
    if (!fullUrl) {
      // Trường hợp chưa có file tải lên
      contentEl.innerHTML = `
        <div style="text-align: center; padding: 48px 20px; background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 10px;">
          <i class="bi bi-file-earmark-x" style="font-size: 48px; color: #94a3b8; display: block; margin-bottom: 12px;"></i>
          <h4 style="font-size: 16px; font-weight: 700; color: #334155; margin-bottom: 6px;">Chưa có tệp tài liệu hợp đồng đính kèm</h4>
          <p style="font-size: 13px; color: #64748b; margin: 0;">Phòng Nhân sự sẽ tải lên bản hợp đồng hoàn chỉnh (PDF / DOCX) để bạn kiểm tra và ký kết.</p>
        </div>
      `;
    } else if (ext === 'pdf') {
      // Render trình xem PDF nhúng trực tiếp
      contentEl.innerHTML = `
        <div class="contract-doc-container">
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 8px 8px 0 0;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span class="badge bg-danger" style="font-size: 11px; padding: 5px 8px;">PDF DOCUMENT</span>
              <span style="font-size: 13px; font-weight: 600; color: #1e293b;">${fileName}</span>
            </div>
            <div style="display: flex; gap: 8px;">
              <a href="${fullUrl}" target="_blank" class="btn btn-sm btn-outline-primary" style="font-size: 12px; display: inline-flex; align-items: center; gap: 4px;">
                <i class="bi bi-box-arrow-up-right"></i> Mở tab mới
              </a>
              <button type="button" class="btn btn-sm btn-outline-secondary" onclick="downloadContractPDF('${contract.id}')" style="font-size: 12px; display: inline-flex; align-items: center; gap: 4px;">
                <i class="bi bi-download"></i> Tải về máy
              </button>
            </div>
          </div>
          <div style="width: 100%; height: 560px; background: #525659; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06);">
            <iframe src="${fullUrl}" style="width: 100%; height: 100%; border: none; display: block;" title="Tài liệu hợp đồng thực tập"></iframe>
          </div>

          <div style="margin-top: 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 18px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px 16px; font-size: 12.5px; color: #334155;">
              <div><strong>Đơn vị tiếp nhận:</strong> ${contract.company} (${contract.dept || '—'})</div>
              <div><strong>Thời hạn thực tập:</strong> ${contract.period}</div>
              <div><strong>Thực tập sinh:</strong> ${internName}</div>
              <div><strong>Người hướng dẫn (Mentor):</strong> ${internProfileData.mentor || '—'}</div>
            </div>
          </div>
        </div>
      `;
    } else if (['doc', 'docx'].includes(ext)) {
      // Render card tài liệu Microsoft Word chuyên dụng
      contentEl.innerHTML = `
        <div class="contract-doc-container">
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 22px; box-shadow: 0 4px 16px rgba(0,0,0,0.04);">
            <!-- Word File Hero Header -->
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 18px 20px; background: linear-gradient(135deg, #eff6ff 0%, #f8fafc 100%); border: 1.5px solid #bfdbfe; border-radius: 10px; margin-bottom: 18px;">
              <div style="display: flex; align-items: center; gap: 16px;">
                <div style="width: 52px; height: 52px; border-radius: 10px; background: #2563eb; color: #ffffff; display: flex; align-items: center; justify-content: center; font-size: 26px; box-shadow: 0 4px 10px rgba(37,99,235,0.25);">
                  <i class="bi bi-file-earmark-word"></i>
                </div>
                <div>
                  <div style="font-size: 15px; font-weight: 700; color: #1e293b; word-break: break-all;">${fileName}</div>
                  <div style="font-size: 12px; color: #64748b; margin-top: 2px;">
                    <span class="badge bg-primary me-2" style="font-size: 11px;">MICROSOFT WORD (.${ext.toUpperCase()})</span>
                    <span>Bản hợp đồng chính thức do Phòng Nhân sự tải lên</span>
                  </div>
                </div>
              </div>
              <div style="display: flex; gap: 8px;">
                <button type="button" class="btn btn-primary" onclick="downloadContractPDF('${contract.id}')" style="background: #2563eb; border-color: #2563eb; font-weight: 600; padding: 9px 18px; font-size: 13px; display: inline-flex; align-items: center; gap: 6px;">
                  <i class="bi bi-download"></i>
                  <span>Tải xuống tệp Word</span>
                </button>
              </div>
            </div>

            <!-- Tóm tắt điều khoản & các bên ký kết -->
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px 20px; margin-bottom: 16px;">
              <h5 style="font-size: 13.5px; font-weight: 700; color: #1e293b; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px;">
                <i class="bi bi-info-circle me-1" style="color: #2563eb;"></i> Thông tin hợp đồng thực tập
              </h5>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px 18px; font-size: 13px; color: #334155;">
                <div><strong>Mã hợp đồng:</strong> <span class="text-primary fw-bold">${contract.code}</span></div>
                <div><strong>Thời hạn thực tập:</strong> <span>${contract.period}</span></div>
                <div><strong>Đơn vị tiếp nhận (Bên A):</strong> <span>${contract.company}</span></div>
                <div><strong>Phòng ban chuyên môn:</strong> <span>${contract.dept || '—'}</span></div>
                <div><strong>Thực tập sinh (Bên B):</strong> <span class="fw-semibold">${internName}</span></div>
                <div><strong>Người hướng dẫn (Mentor):</strong> <span>${internProfileData.mentor || '—'}</span></div>
              </div>
            </div>

            <div style="padding: 12px 16px; background: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; font-size: 12.5px; color: #92400e; display: flex; align-items: center; gap: 10px;">
              <i class="bi bi-info-circle-fill" style="font-size: 18px; color: #d97706; flex-shrink: 0;"></i>
              <div>Vui lòng bấm nút <strong>Tải xuống tệp Word</strong> ở trên để đọc toàn văn nội dung và quyền lợi hợp đồng trước khi thực hiện <strong>Xác nhận hợp đồng</strong> hoặc <strong>Từ chối</strong>.</div>
            </div>
          </div>
        </div>
      `;
    } else if (['png', 'jpg', 'jpeg', 'webp'].includes(ext)) {
      // Render ảnh
      contentEl.innerHTML = `
        <div class="contract-doc-container" style="text-align: center; padding: 20px; background: #f8fafc; border-radius: 8px;">
          <img src="${fullUrl}" alt="${fileName}" style="max-width: 100%; max-height: 650px; border-radius: 6px; box-shadow: 0 4px 15px rgba(0,0,0,0.08);" />
        </div>
      `;
    } else {
      // Định dạng khác
      contentEl.innerHTML = `
        <div style="text-align: center; padding: 40px 20px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px;">
          <div style="font-size: 40px; color: #2563eb; margin-bottom: 10px;"><i class="bi bi-file-earmark-text"></i></div>
          <h4 style="font-size: 16px; font-weight: 700; color: #1e293b; margin-bottom: 6px;">${fileName}</h4>
          <p style="font-size: 13px; color: #64748b; margin-bottom: 16px;">Tệp tài liệu hợp đồng do Phòng Nhân sự gửi tới</p>
          <button type="button" class="btn btn-primary" onclick="downloadContractPDF('${contract.id}')" style="background: #2563eb;">
            <i class="bi bi-download me-1"></i> Tải xuống tệp tài liệu
          </button>
        </div>
      `;
    }
  }

  if (actionsEl) {
    const downloadBtnHtml = fullUrl ? `
      <button type="button" class="btn btn-outline-secondary px-3" onclick="downloadContractPDF('${contract.id}')">
        <i class="bi bi-download me-1"></i>Tải hợp đồng (${ext.toUpperCase()})
      </button>
    ` : '';

    if (contract.status === 'pending') {
      actionsEl.innerHTML = `
        <button type="button" class="btn btn-outline-secondary px-3" onclick="closeContractModal()">Đóng</button>
        ${downloadBtnHtml}
        <button type="button" class="btn btn-outline-danger px-3 ms-auto" onclick="handleRejectContract('${contract.id}')">
          <i class="bi bi-x-circle me-1"></i>Từ chối
        </button>
        <button type="button" class="btn btn-primary px-4 fw-semibold" onclick="handleConfirmContract('${contract.id}')" style="background: #2563eb; border-color: #2563eb;">
          <i class="bi bi-check2-circle me-1"></i>Xác nhận hợp đồng
        </button>
      `;
    } else if (contract.status === 'approved') {
      actionsEl.innerHTML = `
        <span class="badge-contract-approved me-auto py-2 px-3">
          <i class="bi bi-check-circle-fill me-1"></i>Hợp đồng đã được bạn xác nhận ký kết
        </span>
        <button type="button" class="btn btn-outline-secondary px-3" onclick="closeContractModal()">Đóng</button>
        ${downloadBtnHtml}
      `;
    } else {
      const reasonText = contract.rejectReason ? ` - Lý do: ${contract.rejectReason}` : '';
      actionsEl.innerHTML = `
        <span class="badge-contract-rejected me-auto py-2 px-3">
          <i class="bi bi-x-circle-fill me-1"></i>Hợp đồng đã bị từ chối${reasonText}
        </span>
        <button type="button" class="btn btn-outline-secondary px-3" onclick="closeContractModal()">Đóng</button>
        ${downloadBtnHtml}
      `;
    }
  }

  if (modal) modal.classList.add('show');
}

function closeContractModal() {
  const modal = document.getElementById('contractDetailModal');
  if (modal) modal.classList.remove('show');
  ContractsState.currentModalContractId = null;
}

async function handleConfirmContract(contractId) {
  const contract = ContractsState.contracts.find(c => c.id === contractId);
  if (!contract) return;

  try {
    if (typeof apiConfirmContract === 'function') {
      await apiConfirmContract(contractId, 'approved');
    }
    showInternToast(`Đã xác nhận ký hợp đồng "${contract.title}" thành công!`, 'success');
  } catch (err) {
    console.error('Lỗi xác nhận hợp đồng trên MySQL:', err);
    showInternToast('Có lỗi xảy ra khi xác nhận hợp đồng!', 'danger');
  }

  closeContractModal();
  await loadContractsFromDB();
}

let pendingRejectContractId = null;

function handleRejectContract(contractId) {
  pendingRejectContractId = contractId;
  closeContractModal();
  const modal = document.getElementById('contractRejectModal');
  const input = document.getElementById('contractRejectReasonInput');
  if (input) input.value = '';
  if (modal) modal.classList.add('show');
}

function closeContractRejectModal() {
  const modal = document.getElementById('contractRejectModal');
  if (modal) modal.classList.remove('show');
  pendingRejectContractId = null;
}

async function submitContractRejection() {
  if (!pendingRejectContractId) return;
  const contract = ContractsState.contracts.find(c => c.id === pendingRejectContractId);
  if (!contract) return;

  const reasonInput = document.getElementById('contractRejectReasonInput');
  const reason = reasonInput ? reasonInput.value.trim() : '';

  if (!reason) {
    showInternToast('Vui lòng nhập lý do từ chối hợp đồng!', 'warning');
    if (reasonInput) reasonInput.focus();
    return;
  }

  try {
    if (typeof apiConfirmContract === 'function') {
      await apiConfirmContract(pendingRejectContractId, 'rejected', reason);
    }
    showInternToast(`Đã gửi phản hồi từ chối hợp đồng "${contract.title}".`, 'warning');
  } catch (err) {
    console.error('Lỗi từ chối hợp đồng trên MySQL:', err);
    showInternToast('Có lỗi xảy ra khi từ chối hợp đồng!', 'danger');
  }

  closeContractRejectModal();
  await loadContractsFromDB();
}

function downloadContractPDF(contractId) {
  const contract = ContractsState.contracts.find(c => c.id === contractId);
  if (!contract || !contract.fileUrl) {
    showInternToast('Hợp đồng chưa có tệp đính kèm để tải xuống!', 'warning');
    return;
  }
  const rawUrl = contract.fileUrl;
  const fullUrl = rawUrl.startsWith('http') ? rawUrl : `http://localhost:5000${rawUrl}`;
  const fileName = contract.fileName || 'Hop_Dong_Thuc_Tap.pdf';

  const link = document.createElement('a');
  link.href = fullUrl;
  link.download = fileName;
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showInternToast(`Đang tải xuống tệp: ${fileName}...`, 'success');
}

// Bắt sự kiện click ra ngoài để đóng modal xác nhận hoặc modal hồ sơ / hợp đồng / nghỉ phép
window.addEventListener('click', (e) => {
  const modal = document.getElementById('logoutConfirmModal');
  if (e.target === modal) {
    closeInternLogoutModal();
  }
  const removeModal = document.getElementById('removeDocModal');
  if (e.target === removeModal) {
    closeRemoveDocModal();
  }

  const contractModal = document.getElementById('contractDetailModal');
  if (e.target === contractModal) {
    closeContractModal();
  }

  const rejectModal = document.getElementById('contractRejectModal');
  if (e.target === rejectModal) {
    closeContractRejectModal();
  }
  const confirmDossierModal = document.getElementById('confirmSendDossierModal');
  if (e.target === confirmDossierModal) {
    closeConfirmSendDossierModal();
  }
  const internLeaveModal = document.getElementById('internLeaveModal');
  if (e.target === internLeaveModal) {
    closeInternLeaveModal();
  }
});

// ==============================================================================
// 7. KHỞI CHẠY KHI TẢI TRANG
// ==============================================================================
document.addEventListener('DOMContentLoaded', () => {
  // 1. Phục hồi state tài liệu của tài khoản hiện tại
  loadDocsState();

  // 2. Nạp tên và vai trò từ tài khoản vừa đăng nhập thật
  loadInternProfileFromStorage();
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const u = JSON.parse(userStr);
      const welcomeUserName = document.getElementById('welcomeUserName');
      const pageWelcomeTitle = document.getElementById('pageWelcomeTitle');
      const sideName = document.getElementById('sidebarName') || document.getElementById('sidebar-user-name');
      const sideRole = document.getElementById('sidebarRole');
      const sideAvatar = document.getElementById('sidebarAvatar');

      const displayName = u.name || u.username || 'Thực tập sinh';
      if (displayName) {
        if (welcomeUserName) {
          welcomeUserName.textContent = displayName;
        } else if (pageWelcomeTitle) {
          pageWelcomeTitle.textContent = `Xin chào, ${displayName}`;
        }
        if (sideName) sideName.textContent = displayName;
      }
      if (sideRole && u.role) sideRole.textContent = u.role;
      if (sideAvatar && u.avatar) sideAvatar.src = u.avatar;

      // Nạp thông tin trường/khoa/mentor/thời gian thực tập từ DB nếu có
      if (typeof apiGetInterns === 'function' && u.email) {
        apiGetInterns({ search: u.email }).then(res => {
          if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
            const found = res.data[0];
            internProfileData.name = found.name || internProfileData.name || '';
            internProfileData.phone = found.phone || internProfileData.phone || '';
            internProfileData.school = found.school || '';
            internProfileData.faculty = found.faculty || '';
            internProfileData.major = found.major || '';
            internProfileData.course = found.course || '';
            internProfileData.birthDate = found.birth_date || '';
            internProfileData.dept = found.dept || '';
            internProfileData.mentor = found.mentor || '';
            internProfileData.position = found.position || '';
            internProfileData.startFormatted = found.startFormatted || '';
            internProfileData.endFormatted = found.endFormatted || '';
            internProfileData.start_date = found.start_date || '';
            internProfileData.end_date = found.end_date || '';
            InternState.status = found.status || 'Chưa hoàn thiện';
            InternState.rejectReason = found.reject_reason || '';
            InternState.rejectNote = found.reject_note || '';
            internProfileData.appliedDate = found.appliedDate || '';
            const updated = { ...u, ...internProfileData };
            localStorage.setItem('user', JSON.stringify(updated));
            updateTopBarUI();
            updateScheduleSummaryCard();
            updateAllPortalUI();
            if (InternState.currentTab === 'schedule') {
              renderSchedule();
            }
          }
        }).catch(() => {});
      }
    }
  } catch (e) {
    console.warn('Lỗi nạp thông tin user:', e);
  }

  // 3. Khởi tạo module lịch thực tập & cập nhật toàn bộ giao diện
  loadCustomScheduleFromStorage();
  updateTopBarUI();
  updateScheduleSummaryCard();
  renderSchedule();

  // Kiểm tra tham số URL ?tab=... hoặc hash #...
  const urlParams = new URLSearchParams(window.location.search);
  const targetTab = urlParams.get('tab') || window.location.hash.replace('#', '');
  if (targetTab && ['schedule', 'attendance', 'contracts'].includes(targetTab)) {
    switchPortalTab(targetTab);
  }

  updateAllPortalUI();

  // 4. Đồng bộ danh sách tài liệu từ MySQL Database
  (async function syncDocsFromDB() {
    if (typeof apiGetInternDocuments === 'function') {
      try {
        const userStr = localStorage.getItem('user');
        let internId = null;
        if (userStr) {
          const u = JSON.parse(userStr);
          if (u && (u.internId || u.id)) internId = u.internId || u.id;
        }
        if (!internId) {
          console.log('Chưa xác định tài khoản thực tập sinh cụ thể để tải tài liệu.');
          return;
        }
        const res = await apiGetInternDocuments(internId);
        if (res && res.success && res.data && Array.isArray(res.data.documents)) {
          // Xóa trắng trước khi nạp tài liệu từ DB để tránh dính file của tài khoản khác
          InternState.docs.cv = { uploaded: false, name: '', size: '', time: '', type: 'pdf' };
          InternState.docs.application = { uploaded: false, name: '', size: '', time: '', type: 'doc' };

          if (res.data.documents.length > 0) {
            res.data.documents.forEach(doc => {
              const key = doc.type === 'CV' ? 'cv' : 'application';
              const ext = (doc.fileUrl || '').split('.').pop().toLowerCase();
              InternState.docs[key] = {
                uploaded: true,
                name: doc.name,
                size: doc.size,
                time: doc.uploadedAt || 'Đã tải lên',
                type: ext === 'pdf' ? 'pdf' : (ext.includes('doc') ? 'doc' : 'img'),
                fileUrl: doc.fileUrl,
                previewUrl: doc.fileUrl
              };
            });
          }
          if (res.data.status) {
            InternState.status = res.data.status;
          }
          if (res.data.rejectReason !== undefined) {
            InternState.rejectReason = res.data.rejectReason || '';
          }
          if (res.data.rejectNote !== undefined) {
            InternState.rejectNote = res.data.rejectNote || '';
          }
          if (res.data.internId) {
            internProfileData.internId = res.data.internId;
            internProfileData.id = res.data.internId;
            try {
              const uObj = JSON.parse(localStorage.getItem('user') || '{}');
              uObj.internId = res.data.internId;
              localStorage.setItem('user', JSON.stringify(uObj));
            } catch (e) {}
          }
          if (res.data.appliedDate) {
            internProfileData.appliedDate = res.data.appliedDate;
          }
          if (res.data.name) internProfileData.name = res.data.name;
          if (res.data.phone) internProfileData.phone = res.data.phone;
          if (res.data.birthDate) internProfileData.birthDate = res.data.birthDate;
          if (res.data.school) internProfileData.school = res.data.school;
          if (res.data.faculty) internProfileData.faculty = res.data.faculty;
          if (res.data.major) internProfileData.major = res.data.major;
          if (res.data.course) internProfileData.course = res.data.course;
          if (res.data.dept) internProfileData.dept = res.data.dept;
          if (res.data.mentor) internProfileData.mentor = res.data.mentor;
          if (res.data.position) internProfileData.position = res.data.position;
          if (res.data.startFormatted) internProfileData.startFormatted = res.data.startFormatted;
          if (res.data.endFormatted) internProfileData.endFormatted = res.data.endFormatted;
          saveDocsState();
          updateScheduleSummaryCard();
          updateAllPortalUI();
          if (typeof loadContractsStateFromStorage === 'function') {
            loadContractsStateFromStorage();
          }
          console.log(`✅ Đã đồng bộ tài liệu và trạng thái của Thực tập sinh (ID ${internId}) từ MySQL: ${InternState.status}!`);
        }
      } catch (err) {
        console.warn('Lỗi đồng bộ tài liệu từ DB:', err);
      }
    }
  })();

  // 5. Kiểm tra email thông báo hệ thống (User Story 8)
  checkUnreadEmails();

  // 6. Nạp hợp đồng thực tập từ server ngay khi mở trang
  loadContractsFromDB();

  // 7. Áp dụng ma trận phân quyền từ Admin (User Story 40)
  applyRolePermissionsToIntern();
});

function hasInternPermission(moduleKey, actionIndex) {
  if (!InternState.rolePermissions) return true;
  if (!InternState.rolePermissions[moduleKey]) return false;
  return InternState.rolePermissions[moduleKey][actionIndex] === true;
}
window.hasInternPermission = hasInternPermission;

async function applyRolePermissionsToIntern() {
  try {
    let meRes = null;
    if (typeof apiGetMe === 'function') {
      meRes = await apiGetMe();
    }
    if (meRes && meRes.success) {
      if (meRes.permissions) {
        InternState.rolePermissions = meRes.permissions;
      }
      if (meRes.user) {
        if (meRes.user.internId) {
          internProfileData.internId = meRes.user.internId;
          internProfileData.id = meRes.user.id;
        }
        try {
          const u = JSON.parse(localStorage.getItem('user') || '{}');
          localStorage.setItem('user', JSON.stringify({ ...u, ...meRes.user }));
        } catch(e) {}
        // Tải danh sách hợp đồng theo danh tính chuẩn xác vừa xác thực
        loadContractsFromDB();
      }
    } else if (typeof apiGetAdminPermissions === 'function') {
      const res = await apiGetAdminPermissions('Thực tập sinh');
      if (res && res.success && res.permissions) {
        InternState.rolePermissions = res.permissions;
      }
    }

    if (!InternState.rolePermissions) return;

    const canUploadCv = hasInternPermission('upload_cv', 1);
    const canUploadLetter = hasInternPermission('upload_letter', 1);
    const canEditProfile = hasInternPermission('view_own_profile', 2);

    const btnUploadCvs = document.querySelectorAll('[onclick="openUploadModal(\'cv\')"]');
    btnUploadCvs.forEach(btn => btn.style.display = canUploadCv ? '' : 'none');

    const btnUploadLetters = document.querySelectorAll('[onclick="openUploadModal(\'application\')"]');
    btnUploadLetters.forEach(btn => btn.style.display = canUploadLetter ? '' : 'none');

    const saveBtns = document.querySelectorAll('button[type="submit"][form="internProfileForm"], [onclick="saveInternProfileFormData(true)"], [onclick="saveInternProfileFormData(false)"]');
    saveBtns.forEach(btn => {
      btn.style.display = canEditProfile ? '' : 'none';
    });
  } catch (e) {
    console.warn('Lỗi áp dụng quyền TTS:', e);
  }
}

// ==============================================================================
// 12. HÒM THƯ THÔNG BÁO / EMAIL KẾT QUẢ XÉT DUYỆT (USER STORY 8)
// ==============================================================================
let currentLoadedEmails = [];

function openEmailInboxModal() {
  const modal = document.getElementById('systemEmailModal');
  if (modal) {
    modal.style.display = 'flex';
  }
  backToEmailList();
  loadSystemEmails();
}

function closeEmailInboxModal() {
  const modal = document.getElementById('systemEmailModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

function backToEmailList() {
  const listEl = document.getElementById('emailListContainer');
  const detailEl = document.getElementById('emailDetailContainer');
  if (listEl) listEl.style.display = 'block';
  if (detailEl) detailEl.style.display = 'none';
}

async function loadSystemEmails() {
  const listContainer = document.getElementById('emailListContainer');
  const syncStatus = document.getElementById('emailSyncStatusText');
  if (listContainer) {
    listContainer.innerHTML = `
      <div class="text-center py-5 text-muted">
        <div class="spinner-border spinner-border-sm text-primary mb-2" role="status"></div>
        <p class="mb-0">Đang tải danh sách email thông báo...</p>
      </div>
    `;
  }

  let internEmail = '';
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const u = JSON.parse(userStr);
      internEmail = u.email || '';
    }
  } catch (e) {}

  let emails = [];

  // 1. Thử gọi API từ MySQL Backend
  if (typeof apiGetSystemEmails === 'function') {
    try {
      const res = await apiGetSystemEmails(internEmail);
      if (res && res.success && Array.isArray(res.data)) {
        emails = res.data;
        if (syncStatus) syncStatus.textContent = `Đồng bộ từ MySQL (${emails.length} thư)`;
      }
    } catch (e) {
      console.warn('Không thể nạp email từ MySQL:', e);
    }
  }

  // 2. Fallback / Kết hợp localStorage nếu có
  try {
    const localRaw = localStorage.getItem('codegym_system_emails') || '[]';
    const localList = JSON.parse(localRaw);
    if (Array.isArray(localList) && localList.length > 0) {
      const filtered = internEmail 
        ? localList.filter(m => (m.to || '').toLowerCase() === internEmail.toLowerCase() || !m.to)
        : localList;
      
      filtered.forEach(item => {
        if (!emails.some(e => (e.subject === item.subject && e.recipient_email === item.to))) {
          emails.push({
            id: item.id || Date.now(),
            recipient_email: item.to || internEmail,
            recipient_name: item.name || '',
            subject: item.subject,
            email_type: item.type || 'approved',
            content: item.content,
            preview_url: item.previewUrl || null,
            sent_at: item.time || new Date().toISOString()
          });
        }
      });
    }
  } catch (e) {}

  currentLoadedEmails = emails;
  renderEmailList(emails);
  updateEmailBadge(emails.length);
}

function renderEmailList(emails) {
  const container = document.getElementById('emailListContainer');
  if (!container) return;

  if (!emails || emails.length === 0) {
    container.innerHTML = `
      <div class="text-center py-5">
        <i class="fa-regular fa-envelope-open fa-3x mb-3 text-secondary opacity-50"></i>
        <h6 class="fw-semibold text-dark">Chưa có thông báo nào</h6>
        <p class="text-muted small mb-0">Khi HR duyệt hoặc xử lý hồ sơ thực tập, bạn sẽ nhận được email thông báo kết quả tại đây.</p>
      </div>
    `;
    return;
  }

  let html = '<div class="list-group list-group-flush">';
  emails.forEach(mail => {
    const isApproved = (mail.email_type === 'approved' || (mail.subject || '').includes('phê duyệt') || (mail.subject || '').includes('Chúc mừng'));
    const isRejected = (mail.email_type === 'rejected' || (mail.subject || '').includes('chưa đạt') || (mail.subject || '').includes('Từ chối'));
    
    const badgeColor = isApproved ? 'bg-success' : (isRejected ? 'bg-danger' : 'bg-primary');
    const badgeText = isApproved ? 'Đã duyệt' : (isRejected ? 'Từ chối' : 'Thông báo');
    const icon = isApproved ? 'fa-circle-check text-success' : (isRejected ? 'fa-circle-xmark text-danger' : 'fa-envelope text-primary');

    let timeStr = mail.sent_at || '';
    try {
      if (timeStr && timeStr.includes('T')) {
        timeStr = new Date(timeStr).toLocaleString('vi-VN');
      }
    } catch (e) {}

    html += `
      <div class="list-group-item list-group-item-action p-3 border-bottom d-flex align-items-start gap-3" 
           style="cursor: pointer; transition: background 0.2s;" 
           onclick="viewEmailDetail(${mail.id})">
        <div class="mt-1" style="font-size: 20px;">
          <i class="fa-solid ${icon}"></i>
        </div>
        <div class="flex-grow-1">
          <div class="d-flex justify-content-between align-items-center mb-1">
            <span class="badge ${badgeColor} px-2 py-1" style="font-size: 11px;">${badgeText}</span>
            <small class="text-muted">${timeStr}</small>
          </div>
          <h6 class="mb-1 fw-bold text-dark" style="font-size: 14.5px;">${mail.subject}</h6>
          <p class="text-muted small mb-0 text-truncate" style="max-width: 500px;">
            Gửi tới: ${mail.recipient_email} ${mail.recipient_name ? `• Ứng viên: ${mail.recipient_name}` : ''}
          </p>
        </div>
        <div class="text-secondary align-self-center">
          <i class="fa-solid fa-chevron-right small"></i>
        </div>
      </div>
    `;
  });
  html += '</div>';

  container.innerHTML = html;
}

function viewEmailDetail(emailId) {
  const mail = currentLoadedEmails.find(m => Number(m.id) === Number(emailId));
  if (!mail) return;

  const listEl = document.getElementById('emailListContainer');
  const detailEl = document.getElementById('emailDetailContainer');
  const contentEl = document.getElementById('emailDetailContent');
  const extLinkEl = document.getElementById('emailDetailExternalLink');

  if (listEl) listEl.style.display = 'none';
  if (detailEl) detailEl.style.display = 'block';

  let timeStr = mail.sent_at || '';
  try {
    if (timeStr && timeStr.includes('T')) {
      timeStr = new Date(timeStr).toLocaleString('vi-VN');
    }
  } catch (e) {}

  if (extLinkEl) {
    if (mail.preview_url) {
      extLinkEl.innerHTML = `
        <a href="${mail.preview_url}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-outline-primary" style="border-radius: 8px;">
          <i class="fa-solid fa-arrow-up-right-from-square me-1"></i> Mở xem trên Ethereal Mail
        </a>
      `;
    } else {
      extLinkEl.innerHTML = '';
    }
  }

  if (contentEl) {
    if (mail.content && mail.content.includes('<html')) {
      contentEl.innerHTML = `
        <div class="mb-3 pb-2 border-bottom">
          <h5 class="fw-bold mb-1">${mail.subject}</h5>
          <div class="small text-muted">
            <b>Người gửi:</b> CodeGym HR Portal &lt;hr-noreply@codegym.vn&gt;<br>
            <b>Người nhận:</b> ${mail.recipient_email} ${mail.recipient_name ? `(${mail.recipient_name})` : ''}<br>
            <b>Thời gian gửi:</b> ${timeStr}
          </div>
        </div>
        <iframe srcdoc="${mail.content.replace(/"/g, '&quot;')}" style="width: 100%; min-height: 420px; border: none; border-radius: 8px; background: #fff;"></iframe>
      `;
    } else {
      contentEl.innerHTML = `
        <div class="mb-3 pb-2 border-bottom">
          <h5 class="fw-bold mb-1">${mail.subject}</h5>
          <div class="small text-muted">
            <b>Người nhận:</b> ${mail.recipient_email}<br>
            <b>Thời gian:</b> ${timeStr}
          </div>
        </div>
        <div class="p-3 bg-white rounded-2">
          ${mail.content || 'Nội dung thông báo trống.'}
        </div>
      `;
    }
  }
}

function updateEmailBadge(count) {
  const badge = document.getElementById('unreadEmailBadge');
  if (badge) {
    if (count > 0) {
      badge.textContent = count;
      badge.style.display = 'inline-block';
    } else {
      badge.style.display = 'none';
    }
  }
}

async function checkUnreadEmails() {
  try {
    let internEmail = '';
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const u = JSON.parse(userStr);
      internEmail = u.email || '';
    }
    if (typeof apiGetSystemEmails === 'function') {
      const res = await apiGetSystemEmails(internEmail);
      if (res && res.success && Array.isArray(res.data)) {
        updateEmailBadge(res.data.length);
      }
    }
  } catch (e) {}
}

