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
  const allowed = ['pdf', 'doc', 'docx', 'png', 'jpg', 'jpeg'];
  const ext = file.name.split('.').pop().toLowerCase();

  // Kiểm tra định dạng (PDF, DOC, DOCX, PNG, JPG, JPEG)
  if (!allowed.includes(ext)) {
    alert(`Định dạng tệp .${ext} không được hỗ trợ! Vui lòng chỉ chọn tệp PDF, DOCX hoặc Ảnh (PNG, JPG).`);
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
 * Xóa/Gỡ tài liệu đã tải lên
 * @param {'cv' | 'application'} type 
 */
async function removeUploadedDoc(type) {
  const docName = type === 'cv' ? 'CV' : 'Đơn xin thực tập';
  if (!confirm(`Bạn có chắc chắn muốn gỡ ${docName}?`)) return;

  // Lấy thông tin user hiện tại
  const userStr = localStorage.getItem('user');
  let internId = null;
  if (userStr) {
    try {
      const u = JSON.parse(userStr);
      if (u && (u.internId || u.id)) internId = u.internId || u.id;
    } catch (e) {}
  }

  if (!internId) {
    console.warn('Không xác định được ID thực tập sinh để xóa tài liệu!');
    return;
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
  if (typeof apiDeleteDocument === 'function') {
    try {
      const res = await apiDeleteDocument(internId, docTypeParam);
      console.log('🗑️ Đã xóa tài liệu khỏi MySQL & Server:', res);
    } catch (err) {
      console.warn('Lỗi khi gọi API xóa tài liệu:', err);
    }
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

// Bắt sự kiện click ra ngoài để đóng modal xác nhận
window.addEventListener('click', (e) => {
  const modal = document.getElementById('logoutConfirmModal');
  if (e.target === modal) {
    closeInternLogoutModal();
  }
});

// ==============================================================================
// 7. KHỞI CHẠY KHI TẢI TRANG
// ==============================================================================
document.addEventListener('DOMContentLoaded', () => {
  // 1. Phục hồi state tài liệu của tài khoản hiện tại
  loadDocsState();

  // 2. Nạp tên và vai trò từ tài khoản vừa đăng nhập thật
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
    }
  } catch (e) {
    console.warn('Lỗi nạp thông tin user:', e);
  }

  // 3. Cập nhật toàn bộ giao diện
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
