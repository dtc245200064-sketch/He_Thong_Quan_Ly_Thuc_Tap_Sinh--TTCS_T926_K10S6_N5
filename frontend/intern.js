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

  // 4. Cập nhật thẻ Gửi hồ sơ đến phòng nhân sự (Theo thiết kế mới)
  updateDossierSubmitCardUI();

  // 5. Cập nhật mốc hoàn thiện hồ sơ tại Tab Tổng quan (nếu người dùng thao tác tài liệu trên giao diện)
  const milestoneProfile = document.getElementById('overviewMilestoneProfileStatus');
  if (milestoneProfile && milestoneProfile.textContent !== '—') {
    milestoneProfile.textContent = isAllDone ? 'Đã hoàn thiện' : 'Chưa hoàn thiện';
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

  // Kiểm tra xem hồ sơ đã được gửi chưa
  const isSubmitted = localStorage.getItem('tts_dossier_submitted') === 'true';

  if (isSubmitted) {
    btnSubmit.className = 'btn-submit-dossier submitted';
    btnSubmit.innerHTML = '<i class="bi bi-check-circle-fill me-1"></i> Đã gửi đến phòng nhân sự';
    btnSubmit.disabled = true;
    return;
  }

  // Trạng thái nút theo điều kiện hoàn thiện
  if (isInfoDone && isCvDone && isAppDone) {
    btnSubmit.className = 'btn-submit-dossier ready';
    btnSubmit.textContent = 'Gửi hồ sơ đến phòng nhân sự';
    btnSubmit.disabled = false;
  } else {
    btnSubmit.className = 'btn-submit-dossier';
    btnSubmit.textContent = 'Gửi hồ sơ đến phòng nhân sự';
    btnSubmit.disabled = false;
  }
}

/**
 * Xử lý khi người dùng bấm nút Gửi hồ sơ đến phòng nhân sự
 */
function handleDossierSubmitClick() {
  const isSubmitted = localStorage.getItem('tts_dossier_submitted') === 'true';
  if (isSubmitted) {
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

function confirmSubmitDossierToHR() {
  closeConfirmSendDossierModal();
  localStorage.setItem('tts_dossier_submitted', 'true');
  localStorage.setItem('tts_dossier_submitted_at', new Date().toISOString());

  updateAllPortalUI();
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
 * Nhớ: Để trống toàn bộ nếu người dùng chưa điền dữ liệu (placeholder sẽ hiển thị mẫu theo thiết kế)
 */
function loadProfileFormFields() {
  loadInternProfileFromStorage();

  let profile = {};
  try {
    const pStr = localStorage.getItem('internPersonalProfile');
    if (pStr) {
      profile = JSON.parse(pStr);
    }
  } catch (e) {}

  const elName = document.getElementById('profileInputFullName');
  const elBirth = document.getElementById('profileInputBirthDate');
  const elPhone = document.getElementById('profileInputPhone');
  const elUni = document.getElementById('profileInputUniversity');
  const elFaculty = document.getElementById('profileInputFaculty');
  const elMajor = document.getElementById('profileInputMajor');
  const elCourse = document.getElementById('profileInputCourse');
  const elPos = document.getElementById('profileInputPosition');

  // ĐỂ TRỐNG TOÀN BỘ NẾU CHƯA CÓ DỮ LIỆU
  if (elName) elName.value = profile.fullName || internProfileData.name || '';
  if (elBirth) elBirth.value = profile.birthDate || internProfileData.birthDate || '';
  if (elPhone) elPhone.value = profile.phone || internProfileData.phone || '';
  if (elUni) elUni.value = profile.university || internProfileData.school || '';
  if (elFaculty) elFaculty.value = profile.faculty || internProfileData.faculty || internProfileData.dept || '';
  if (elMajor) elMajor.value = profile.major || internProfileData.major || '';
  if (elCourse) elCourse.value = profile.course || internProfileData.course || '';
  if (elPos) elPos.value = profile.position || internProfileData.position || '';
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
function handleSaveInternProfile(event) {
  if (event) event.preventDefault();
  saveInternProfileFormData(true);
}

/**
 * Xử lý khi bấm nút "Lưu thông tin"
 */
function handleSaveInternProfileOnly() {
  saveInternProfileFormData(false);
}

/**
 * Lưu dữ liệu thông tin cá nhân vào localStorage (chỉ làm frontend)
 */
function saveInternProfileFormData(shouldProceed = false) {
  const elName = document.getElementById('profileInputFullName');
  const elBirth = document.getElementById('profileInputBirthDate');
  const elPhone = document.getElementById('profileInputPhone');
  const elUni = document.getElementById('profileInputUniversity');
  const elFaculty = document.getElementById('profileInputFaculty');
  const elMajor = document.getElementById('profileInputMajor');
  const elCourse = document.getElementById('profileInputCourse');
  const elPos = document.getElementById('profileInputPosition');

  const profile = {
    fullName: elName ? elName.value.trim() : '',
    birthDate: elBirth ? elBirth.value.trim() : '',
    phone: elPhone ? elPhone.value.trim() : '',
    university: elUni ? elUni.value.trim() : '',
    faculty: elFaculty ? elFaculty.value.trim() : '',
    major: elMajor ? elMajor.value.trim() : '',
    course: elCourse ? elCourse.value.trim() : '',
    position: elPos ? elPos.value.trim() : ''
  };

  localStorage.setItem('internPersonalProfile', JSON.stringify(profile));

  if (profile.fullName) {
    internProfileData.name = profile.fullName;
  }
  if (profile.phone) internProfileData.phone = profile.phone;
  if (profile.university) internProfileData.school = profile.university;
  if (profile.faculty) internProfileData.dept = profile.faculty;
  if (profile.major) internProfileData.major = profile.major;
  if (profile.position) internProfileData.position = profile.position;

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
    showInternToast('Đã lưu thông tin cá nhân! Đang chuyển sang Hồ sơ & Tài liệu...', 'success');
    setTimeout(() => {
      switchPortalTab('documents');
    }, 350);
  } else {
    showInternToast('Đã lưu thông tin cá nhân thành công!', 'success');
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
 * Trả về dữ liệu lịch cho một ngày cụ thể (0% dữ liệu giả, không tự ý chèn dữ liệu nếu chưa có)
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

  // Lấy mentor động từ hồ sơ thực tế
  const mentorName = internProfileData.mentor || '—';

  // Nếu chưa có lịch phân công, tuyệt đối không tự thêm dữ liệu giả
  let time = '—';
  let task = 'Chưa có lịch phân công';
  let location = '—';

  if (dayOfWeek === 0 || dayOfWeek === 6) {
    time = 'Nghỉ cuối tuần';
    task = 'Không có lịch làm việc theo quy định';
    location = 'Nghỉ ngơi';
  }

  return {
    dateKey: key,
    dayName,
    dayNumber,
    time,
    task,
    location,
    mentor: mentorName
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

  // Tìm chương trình thực tế thuộc phòng ban từ hệ thống nếu có
  let programName = '—';
  try {
    const rawProgs = localStorage.getItem('codegym_hr_programs');
    if (rawProgs) {
      const progs = JSON.parse(rawProgs);
      if (Array.isArray(progs) && internProfileData.dept) {
        const found = progs.find(p => p.dept && p.dept.toLowerCase().trim() === internProfileData.dept.toLowerCase().trim());
        if (found && found.name) {
          programName = found.name;
        }
      }
    }
  } catch (e) {}

  if (programName === '—' && internProfileData.position) {
    programName = internProfileData.position;
  }

  const dept = internProfileData.dept || '—';
  const mentor = internProfileData.mentor || '—';
  const start = internProfileData.startFormatted || internProfileData.start_date || '—';
  const end = internProfileData.endFormatted || internProfileData.end_date || '—';

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
  if (InternScheduleState.viewMode === 'week') {
    renderScheduleWeekView();
  } else {
    renderScheduleMonthView();
  }
  renderScheduleDetail();
}

// ==============================================================================
// 6.7. QUẢN LÝ CHẤM CÔNG CÁ NHÂN (ATTENDANCE) - HOÀN TOÀN ĐỘNG & ĐỂ TRỐNG
// ==============================================================================

const AttendanceState = {
  todayStatus: 'not_checked_in', // 'not_checked_in' | 'checked_in' | 'completed'
  todayCheckIn: null,            // Chuỗi ví dụ '08:27' hoặc null (mặc định để trống: —)
  todayCheckOut: null,           // Chuỗi ví dụ '17:34' hoặc null (mặc định để trống: —)
  todayTotalWork: null,          // Chuỗi ví dụ '8 giờ 07 phút' hoặc null (mặc định để trống: —)
  history: []                    // Mặc định để trống dữ liệu theo yêu cầu
};

function loadAttendanceStateFromStorage() {
  try {
    const todayStr = localStorage.getItem('tts_attendance_today');
    if (todayStr) {
      const parsedToday = JSON.parse(todayStr);
      AttendanceState.todayStatus = parsedToday.todayStatus || 'not_checked_in';
      AttendanceState.todayCheckIn = parsedToday.todayCheckIn || null;
      AttendanceState.todayCheckOut = parsedToday.todayCheckOut || null;
      AttendanceState.todayTotalWork = parsedToday.todayTotalWork || null;
    } else {
      AttendanceState.todayStatus = 'not_checked_in';
      AttendanceState.todayCheckIn = null;
      AttendanceState.todayCheckOut = null;
      AttendanceState.todayTotalWork = null;
    }

    const historyStr = localStorage.getItem('tts_attendance_history');
    if (historyStr) {
      AttendanceState.history = JSON.parse(historyStr) || [];
    } else {
      AttendanceState.history = [];
    }
  } catch (e) {
    console.warn('Lỗi đọc dữ liệu chấm công từ localStorage:', e);
    AttendanceState.todayStatus = 'not_checked_in';
    AttendanceState.todayCheckIn = null;
    AttendanceState.todayCheckOut = null;
    AttendanceState.todayTotalWork = null;
    AttendanceState.history = [];
  }
}

function saveAttendanceStateToStorage() {
  try {
    localStorage.setItem('tts_attendance_today', JSON.stringify({
      todayStatus: AttendanceState.todayStatus,
      todayCheckIn: AttendanceState.todayCheckIn,
      todayCheckOut: AttendanceState.todayCheckOut,
      todayTotalWork: AttendanceState.todayTotalWork
    }));
    localStorage.setItem('tts_attendance_history', JSON.stringify(AttendanceState.history));
  } catch (e) {
    console.warn('Lỗi ghi dữ liệu chấm công vào localStorage:', e);
  }
}

/**
 * Đồng bộ trạng thái chấm công của TTS vào hệ thống quản lý của HR
 */
function syncAttendanceToHR(status) {
  try {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const dateKey = `${y}-${m}-${d}`;

    const internId = internProfileData.id || internProfileData.internId || 1;
    let hrAtt = {};
    const saved = localStorage.getItem('codegym_hr_attendance');
    if (saved) {
      hrAtt = JSON.parse(saved) || {};
    }
    if (!hrAtt[internId]) {
      hrAtt[internId] = {};
    }
    hrAtt[internId][dateKey] = status;
    localStorage.setItem('codegym_hr_attendance', JSON.stringify(hrAtt));
  } catch (e) {
    console.warn('Lỗi đồng bộ chấm công với HR:', e);
  }
}

/**
 * Khởi tạo Tab Chấm công
 */
function initAttendanceTab() {
  loadAttendanceStateFromStorage();

  // Cập nhật ngày hôm nay
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

  const todaySched = getScheduleDataForDate(new Date());
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

  renderAttendanceToday();
  renderAttendanceHistory();
  renderInternLeaves();
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
 * Xử lý nút bấm CHECK-IN / CHECK-OUT (Tính toán theo thời gian thực)
 */
function handleToggleCheckInOut() {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const timeStr = `${hh}:${mm}`;

  if (AttendanceState.todayStatus === 'not_checked_in') {
    // Check-in thực tế
    AttendanceState.todayStatus = 'checked_in';
    AttendanceState.todayCheckIn = timeStr;
    saveAttendanceStateToStorage();
    renderAttendanceToday();
    syncAttendanceToHR('present');
    showInternToast(`Check-in thành công vào lúc ${timeStr}!`, 'success');
  } else if (AttendanceState.todayStatus === 'checked_in') {
    // Check-out thực tế
    AttendanceState.todayStatus = 'completed';
    AttendanceState.todayCheckOut = timeStr;

    // Tính thời gian làm việc thực tế
    let totalStr = '—';
    if (AttendanceState.todayCheckIn) {
      const [inH, inM] = AttendanceState.todayCheckIn.split(':').map(Number);
      const [outH, outM] = timeStr.split(':').map(Number);
      let diffMinutes = (outH * 60 + outM) - (inH * 60 + inM);
      if (diffMinutes < 0) diffMinutes += 24 * 60;
      const hours = Math.floor(diffMinutes / 60);
      const mins = diffMinutes % 60;
      totalStr = `${hours} giờ ${String(mins).padStart(2, '0')} phút`;
    }
    AttendanceState.todayTotalWork = totalStr;

    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();

    // Thêm bản ghi mới vừa check-out vào lịch sử
    AttendanceState.history.unshift({
      date: `${day}/${month}/${year}`,
      checkIn: AttendanceState.todayCheckIn,
      checkOut: timeStr,
      total: totalStr,
      status: 'Đúng giờ'
    });

    saveAttendanceStateToStorage();
    renderAttendanceToday();
    renderAttendanceHistory();
    syncAttendanceToHR('present');
    showInternToast(`Check-out thành công lúc ${timeStr}! Tổng thời gian làm việc: ${totalStr}`, 'success');
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
 * Xử lý nộp đơn xin nghỉ phép lên hệ thống phòng nhân sự (HR)
 */
function handleSubmitInternLeave(event) {
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

  const diffTime = Math.abs(new Date(endDate) - new Date(startDate));
  const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

  const now = new Date();
  const d = String(now.getDate()).padStart(2, '0');
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const y = now.getFullYear();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const submittedAt = `${d}/${m}/${y} ${hh}:${mm}`;

  const internId = internProfileData.id || internProfileData.internId || 1;
  const internName = internProfileData.name || 'Thực tập sinh';

  let leaveRequests = [];
  try {
    const saved = localStorage.getItem('codegym_hr_leaves');
    if (saved) leaveRequests = JSON.parse(saved) || [];
  } catch (e) {
    leaveRequests = [];
  }

  const newLeave = {
    id: Date.now(),
    internId: internId,
    internName: internName,
    program: internProfileData.dept || internProfileData.major || 'Kỹ thuật phần mềm',
    leaveType: leaveType,
    startDate: startDate,
    endDate: endDate,
    days: days,
    reason: reason,
    submittedAt: submittedAt,
    status: 'Chờ duyệt'
  };

  leaveRequests.unshift(newLeave);

  try {
    localStorage.setItem('codegym_hr_leaves', JSON.stringify(leaveRequests));
  } catch (err) {
    console.error('Lỗi lưu đơn nghỉ phép:', err);
  }

  closeInternLeaveModal();
  renderInternLeaves();
  showInternToast('Đã gửi đơn xin nghỉ phép đến phòng nhân sự (HR) thành công!', 'success');
}

/**
 * Render danh sách đơn nghỉ phép của thực tập sinh hiện tại
 */
function renderInternLeaves() {
  const tbody = document.getElementById('internLeavesTableBody');
  if (!tbody) return;

  let allLeaves = [];
  try {
    const saved = localStorage.getItem('codegym_hr_leaves');
    if (saved) allLeaves = JSON.parse(saved) || [];
  } catch (e) {
    allLeaves = [];
  }

  const internId = internProfileData.id || internProfileData.internId || 1;
  const internName = (internProfileData.name || '').trim().toLowerCase();

  // Lọc đơn nghỉ phép của TTS hiện tại
  const myLeaves = allLeaves.filter(l => {
    if (l.internId && internId && String(l.internId) === String(internId)) return true;
    if (l.internName && internName && l.internName.trim().toLowerCase() === internName) return true;
    return false;
  });

  if (myLeaves.length === 0) {
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
    const p = dStr.split('-');
    if (p.length === 3) return `${p[2]}/${p[1]}/${p[0]}`;
    return dStr;
  };

  let html = '';
  myLeaves.forEach(leave => {
    let statusBadge = '<span class="badge bg-warning-subtle text-warning border border-warning px-2 py-1 rounded-pill" style="font-size: 11.5px; font-weight: 600;"><i class="bi bi-hourglass-split me-1"></i>Chờ duyệt</span>';
    if (leave.status === 'Đã duyệt') {
      statusBadge = '<span class="badge bg-success-subtle text-success border border-success px-2 py-1 rounded-pill" style="font-size: 11.5px; font-weight: 600;"><i class="bi bi-check-circle me-1"></i>Đã duyệt</span>';
    } else if (leave.status === 'Từ chối') {
      statusBadge = '<span class="badge bg-danger-subtle text-danger border border-danger px-2 py-1 rounded-pill" style="font-size: 11.5px; font-weight: 600;"><i class="bi bi-x-circle me-1"></i>Từ chối</span>';
    }

    const typeLabel = leave.leaveType || 'Việc cá nhân';
    const timeRange = `${formatDMY(leave.startDate)} – ${formatDMY(leave.endDate)}`;

    html += `
      <tr>
        <td>
          <span class="badge bg-light text-dark border px-2 py-1 rounded" style="font-size: 12px; font-weight: 600;">${typeLabel}</span>
        </td>
        <td style="font-size: 13px; font-weight: 600; color: #1e293b;">
          ${timeRange}
        </td>
        <td>
          <span class="fw-bold text-primary" style="font-size: 13px;">${leave.days} ngày</span>
        </td>
        <td style="font-size: 12.5px; color: #475569; max-width: 260px;" title="${leave.reason}">
          ${leave.reason}
        </td>
        <td style="font-size: 12px; color: #64748b;">
          ${leave.submittedAt || '—'}
        </td>
        <td>
          ${statusBadge}
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
}

// ==============================================================================
// 6.8. QUẢN LÝ HỢP ĐỒNG THỰC TẬP (CONTRACTS) - PERSISTENT & SYNC VỚI HR
// ==============================================================================

const ContractsState = {
  currentModalContractId: null,
  contracts: []
};

function loadContractsStateFromStorage() {
  try {
    const saved = localStorage.getItem('tts_intern_contracts');
    if (saved) {
      ContractsState.contracts = JSON.parse(saved) || [];
    } else {
      // Khởi tạo hợp đồng mẫu thực tập ban đầu để TTS có thể xem và xác nhận (User Story 10)
      const internId = internProfileData.id || internProfileData.internId || 1;
      const internName = internProfileData.name || 'Thực tập sinh';
      const cleanName = internName ? internName.replace(/\s+/g, '_') : 'TTS';
      ContractsState.contracts = [
        {
          id: 'HD-2026-001',
          internId: internId,
          code: 'HĐTT-2026-089',
          title: 'Hợp đồng thực tập Phát triển phần mềm',
          fileName: `Hop_Dong_Thuc_Tap_${cleanName}.pdf`,
          company: 'Hệ thống Đào tạo CodeGym Việt Nam',
          dept: internProfileData.dept || 'Phòng Phát triển Phần mềm',
          period: '01/03/2026 - 31/05/2026',
          status: 'pending'
        }
      ];
      saveContractsStateToStorage();
    }
  } catch (e) {
    console.warn('Lỗi đọc hợp đồng từ localStorage:', e);
    ContractsState.contracts = [];
  }
}

function saveContractsStateToStorage() {
  try {
    localStorage.setItem('tts_intern_contracts', JSON.stringify(ContractsState.contracts));
  } catch (e) {
    console.warn('Lỗi lưu hợp đồng vào localStorage:', e);
  }
}

/**
 * Khởi tạo Tab Hợp đồng thực tập
 */
function initContractsTab() {
  loadContractsStateFromStorage();
  updateContractNoticeBanner();
  renderContractList();
}

/**
 * Cập nhật thanh thông báo hợp đồng chờ xác nhận
 */
function updateContractNoticeBanner() {
  const banner = document.getElementById('contractNoticeBanner');
  if (!banner) return;

  const pendingList = ContractsState.contracts.filter(c => c.status === 'pending');
  const count = pendingList.length;

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
            <span>Chưa có hợp đồng nào được phân công.</span>
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

  if (titleEl) titleEl.textContent = contract.title;
  if (subEl) subEl.textContent = `Mã số: ${contract.code} • Tệp: ${contract.fileName}`;

  const internName = internProfileData.name || '—';

  if (contentEl) {
    contentEl.innerHTML = `
      <div class="contract-doc-paper">
        <div class="contract-doc-header">
          <h4 class="contract-doc-title">${contract.title}</h4>
          <div class="contract-doc-code">${contract.code} - ${contract.period}</div>
        </div>

        <div class="contract-section">
          <div class="contract-section-heading">BÊN A: ĐƠN VỊ TIẾP NHẬN THỰC TẬP (DOANH NGHIỆP)</div>
          <div class="contract-section-content">
            <b>${contract.company}</b><br>
            Phòng ban phụ trách: ${contract.dept || '—'}<br>
            Người hướng dẫn chuyên môn: ${internProfileData.mentor || '—'}
          </div>
        </div>

        <div class="contract-section">
          <div class="contract-section-heading">BÊN B: THỰC TẬP SINH</div>
          <div class="contract-section-content">
            Họ và tên: <b>${internName}</b><br>
            Trường đào tạo: ${internProfileData.school || '—'}<br>
            Chuyên ngành: ${internProfileData.major || '—'}<br>
            Email: ${internProfileData.email || '—'}
          </div>
        </div>

        <div class="contract-section">
          <div class="contract-section-heading">ĐIỀU KHOẢN VÀ NGHĨA VỤ CHUNG</div>
          <div class="contract-section-content">
            1. Bên B cam kết tuân thủ đầy đủ nội quy lao động, quy định bảo mật thông tin và lịch làm việc của Bên A.<br>
            2. Bên A tạo điều kiện cơ sở vật chất, phân công Mentor hướng dẫn và đánh giá kết quả thực tập công tâm.<br>
            3. Thời hạn thực tập có hiệu lực theo giai đoạn ghi rõ trong hợp đồng (${contract.period}).
          </div>
        </div>
      </div>
    `;
  }

  if (actionsEl) {
    if (contract.status === 'pending') {
      actionsEl.innerHTML = `
        <button type="button" class="btn btn-outline-secondary px-3" onclick="closeContractModal()">Đóng</button>
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
        <button type="button" class="btn btn-primary px-3" onclick="downloadContractPDF('${contract.id}')" style="background: #2563eb; border-color: #2563eb;">
          <i class="bi bi-download me-1"></i>Tải bản ký (PDF)
        </button>
      `;
    } else {
      actionsEl.innerHTML = `
        <span class="badge-contract-rejected me-auto py-2 px-3">
          <i class="bi bi-x-circle-fill me-1"></i>Hợp đồng đã bị từ chối
        </span>
        <button type="button" class="btn btn-outline-secondary px-3" onclick="closeContractModal()">Đóng</button>
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

function handleConfirmContract(contractId) {
  const contract = ContractsState.contracts.find(c => c.id === contractId);
  if (!contract) return;

  contract.status = 'approved';
  saveContractsStateToStorage();

  // Đồng bộ trạng thái ký hợp đồng sang dữ liệu quản lý của HR
  try {
    const internsStr = localStorage.getItem('codegym_interns');
    if (internsStr) {
      const list = JSON.parse(internsStr);
      const target = list.find(i => String(i.id) === String(contract.internId || internProfileData.id));
      if (target) {
        target.contractStatus = 'approved';
        target.contractConfirmedAt = new Date().toLocaleDateString('vi-VN');
        localStorage.setItem('codegym_interns', JSON.stringify(list));
      }
    }
  } catch (e) {
    console.warn('Lỗi đồng bộ hợp đồng sang HR:', e);
  }

  closeContractModal();
  updateContractNoticeBanner();
  renderContractList();
  showInternToast(`Đã xác nhận ký hợp đồng "${contract.title}" thành công!`, 'success');
}

function handleRejectContract(contractId) {
  const contract = ContractsState.contracts.find(c => c.id === contractId);
  if (!contract) return;

  contract.status = 'rejected';
  saveContractsStateToStorage();

  // Đồng bộ trạng thái từ chối hợp đồng sang dữ liệu quản lý của HR
  try {
    const internsStr = localStorage.getItem('codegym_interns');
    if (internsStr) {
      const list = JSON.parse(internsStr);
      const target = list.find(i => String(i.id) === String(contract.internId || internProfileData.id));
      if (target) {
        target.contractStatus = 'rejected';
        localStorage.setItem('codegym_interns', JSON.stringify(list));
      }
    }
  } catch (e) {
    console.warn('Lỗi đồng bộ hợp đồng sang HR:', e);
  }

  closeContractModal();
  updateContractNoticeBanner();
  renderContractList();
  showInternToast(`Đã ghi nhận phản hồi từ chối hợp đồng "${contract.title}".`, 'warning');
}

function downloadContractPDF(contractId) {
  const contract = ContractsState.contracts.find(c => c.id === contractId);
  showInternToast(`Đang tải file ${contract ? contract.fileName : 'Hop_dong.pdf'}...`, 'info');
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
            internProfileData.school = found.school || '';
            internProfileData.major = found.major || '';
            internProfileData.dept = found.dept || '';
            internProfileData.mentor = found.mentor || '';
            internProfileData.position = found.position || '';
            internProfileData.startFormatted = found.startFormatted || '';
            internProfileData.endFormatted = found.endFormatted || '';
            internProfileData.start_date = found.start_date || '';
            internProfileData.end_date = found.end_date || '';
            const updated = { ...u, ...internProfileData };
            localStorage.setItem('user', JSON.stringify(updated));
            updateTopBarUI();
            updateScheduleSummaryCard();
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
          saveDocsState();
          updateAllPortalUI();
          console.log(`✅ Đã đồng bộ tài liệu của Thực tập sinh (ID ${internId}) từ MySQL!`);
        }
      } catch (err) {
        console.warn('Lỗi đồng bộ tài liệu từ DB:', err);
      }
    }
  })();
});
