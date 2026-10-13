// ==========================================================================
// HR DASHBOARD - TUẦN 1 (T1) FRONTEND MOCK DATA & INTERACTION CONTROLLER
// CHỈ LÀM PHẦN FRONTEND: Mock data hoạt động độc lập, không cần backend
// ==========================================================================


// ==========================================================================
// DỮ LIỆU FRONTEND: Mock data hoạt động độc lập (100% không tài liệu giả)
// ==========================================================================
// Hàm tiện ích: Lấy ngày tải lên định dạng mm/dd/yyyy theo yêu cầu
function getFormattedUploadDate() {
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const yyyy = now.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
}
window.getFormattedUploadDate = getFormattedUploadDate;

const DEFAULT_MOCK_INTERNS = [];
const DEFAULT_MOCK_APPLICATIONS = [];

let applications = [];
let internList = [];
if (typeof window !== "undefined") {
  window.applications = applications;
  window.internList = internList;
}

// HỒ SƠ NGƯỜI DÙNG ĐĂNG NHẬP (LẤY TỪ PHIÊN ĐĂNG NHẬP THỰC TẾ)
let userProfile = (() => {
  try {
    const saved = localStorage.getItem('user');
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return {
    name: "Nguyễn Thị Hoa",
    role: "HR Manager",
    email: "hr@company.vn",
    phone: "0988 888 999",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80"
  };
})();

// MA TRẬN PHÂN QUYỀN HỆ THỐNG VÀ THÔNG TIN TÀI KHOẢN TỪ MYSQL (User Story 40)
let DashboardPermissions = null;
let CurrentSessionUser = null;

function hasPermission(moduleKey, actionIndex) {
  if (!DashboardPermissions) return true; // Chưa tải xong thì tạm thời mở
  if (!DashboardPermissions[moduleKey]) return false;
  return DashboardPermissions[moduleKey][actionIndex] === true;
}
window.hasPermission = hasPermission;

// Biến lưu trạng thái đang xem hồ sơ / tài liệu
let currentDocCandidateId = null;
let currentDocType = "cv"; // 'cv', 'letter' hoặc 'contract'

// ==========================================================================
// CHUYỂN TAB MƯỢT MÀ GIỮA 3 TAB (TỔNG QUAN, TIẾP NHẬN & XÉT DUYỆT, THỰC TẬP SINH)
// ==========================================================================
function switchTab(tabName) {
  const tabs = {
    overview: { tab: document.getElementById("overviewTab"), nav: document.getElementById("navOverview") },
    review: { tab: document.getElementById("reviewTab"), nav: document.getElementById("navReview") },
    interns: { tab: document.getElementById("internsTab"), nav: document.getElementById("navInterns") },
    attendance: { tab: document.getElementById("attendanceTab"), nav: document.getElementById("navAttendance") },
    programs: { tab: document.getElementById("programsTab"), nav: document.getElementById("navPrograms") },
    tasks: { tab: document.getElementById("tasksTab"), nav: document.getElementById("navTasks") },
    mentors: { tab: document.getElementById("mentorsTab"), nav: document.getElementById("navMentors") },
    reports: { tab: document.getElementById("reportsTab"), nav: document.getElementById("navReports") }
  };

  Object.keys(tabs).forEach((key) => {
    if (tabs[key].tab) tabs[key].tab.classList.remove("active");
    if (tabs[key].nav) tabs[key].nav.classList.remove("active");
  });

  if (tabs[tabName]) {
    if (tabs[tabName].tab) tabs[tabName].tab.classList.add("active");
    if (tabs[tabName].nav) tabs[tabName].nav.classList.add("active");
  }

  // Cập nhật dữ liệu tương ứng của từng tab
  if (tabName === "overview") {
    renderOverview();
  } else if (tabName === "review") {
    filterReviewData();
  } else if (tabName === "interns") {
    filterData();
  } else if (tabName === "attendance") {
    renderAttendanceTab();
  } else if (tabName === "programs") {
    renderPrograms();
  } else if (tabName === "tasks") {
    initTasksTab();
  } else if (tabName === "mentors") {
    initMentorsTab();
  } else if (tabName === "reports") {
    renderReportsTab();
  }
}

// ==========================================================================
// TAB 1: TỔNG QUAN (OVERVIEW)
// ==========================================================================
function renderOverview() {
  const totalInterns = internList.length;
  const pendingApplications = applications.filter((item) => item.status === "Chờ xét duyệt");
  const activeInterns = internList.filter((item) => item.status === "Đang thực tập").length;
  const finishedInterns = internList.filter(
    (item) => item.status === "Đã hoàn thành" || item.status === "Kết thúc"
  ).length;

  // Cập nhật 4 thẻ thống kê con số
  const elTotal = document.getElementById("statTotal");
  const elPending = document.getElementById("statPending");
  const elActive = document.getElementById("statActive");
  const elFinished = document.getElementById("statFinished");

  if (elTotal) elTotal.textContent = totalInterns;
  if (elPending) elPending.textContent = pendingApplications.length;
  if (elActive) elActive.textContent = activeInterns;
  if (elFinished) elFinished.textContent = finishedInterns;

  // Cập nhật số lượng hiển thị trên Badge thanh Sidebar
  const sidebarPendingBadge = document.getElementById("sidebarPendingBadge");
  const sidebarTotalBadge = document.getElementById("sidebarTotalBadge");
  const reviewCountBadge = document.getElementById("reviewCountBadge");
  const internCountBadge = document.getElementById("internCount");

  if (sidebarPendingBadge) sidebarPendingBadge.textContent = pendingApplications.length;
  if (sidebarTotalBadge) sidebarTotalBadge.textContent = totalInterns;
  if (reviewCountBadge) reviewCountBadge.textContent = `${pendingApplications.length} hồ sơ chờ xét duyệt`;
  if (internCountBadge) internCountBadge.textContent = totalInterns;

  // Render bảng nhỏ: 3 - 5 hồ sơ cần duyệt gấp
  const recentTbody = document.getElementById("recentTableBody");
  if (!recentTbody) return;

  const urgentList = pendingApplications.slice(0, 5);
  recentTbody.innerHTML = "";

  if (urgentList.length === 0) {
    recentTbody.innerHTML = `<tr><td colspan="6" class="empty-row">🎉 Tuyệt vời! Hiện không còn hồ sơ nào cần duyệt gấp.</td></tr>`;
    return;
  }

  urgentList.forEach((candidate) => {
    const tr = document.createElement("tr");
    const initials = getInitials(candidate.name);

    tr.innerHTML = `
      <td>
        <div class="candidate-cell">
          <div class="candidate-avatar-badge">${initials}</div>
          <div class="intern-meta">
            <span class="intern-name">${candidate.name}</span>
            <span class="intern-sub">${candidate.email}</span>
          </div>
        </div>
      </td>
      <td>
        <div class="intern-meta">
          <span class="intern-name" style="font-weight: 500;">${candidate.school}</span>
          <span class="intern-sub">${candidate.major} (GPA: ${candidate.gpa})</span>
        </div>
      </td>
      <td><span class="badge-tag-sm">${candidate.position}</span></td>
      <td>${candidate.appliedDate}</td>
      <td><span class="status-badge status-pending">Chờ xét duyệt</span></td>
      <td class="text-center">
        <div class="action-buttons">
          <button type="button" class="btn-action btn-doc" onclick="openDocumentModal(${candidate.id})" title="Xem hồ sơ & tài liệu">
            <i class="fa-solid fa-file-lines"></i>
            <span>Tài liệu</span>
          </button>
          <button type="button" class="btn-action btn-approve" onclick="quickApprove(${candidate.id})" title="Duyệt nhanh hồ sơ này">
            <i class="fa-solid fa-check"></i>
            <span>Duyệt nhanh</span>
          </button>
        </div>
      </td>
    `;
    recentTbody.appendChild(tr);
  });
}

// Thao tác duyệt nhanh tại Tab Tổng quan
function quickApprove(id) {
  const candidate = applications.find((item) => item.id === id);
  if (!candidate) return;

  approveCandidate(candidate);
}

// ==========================================================================
// TAB 2: TIẾP NHẬN & XÉT DUYỆT (APPLICATIONS & REVIEW)
// ==========================================================================
function filterReviewData() {
  const searchInput = document.getElementById("reviewSearchInput");
  const statusFilter = document.getElementById("reviewStatusFilter");
  const tbody = document.getElementById("reviewTableBody");

  if (!tbody) return;

  const keyword = searchInput ? searchInput.value.toLowerCase().trim() : "";
  const selectedStatus = statusFilter ? statusFilter.value : "";

  const filtered = applications.filter((item) => {
    const matchKeyword =
      (item.name || "").toLowerCase().includes(keyword) ||
      (item.school || "").toLowerCase().includes(keyword) ||
      (item.major || "").toLowerCase().includes(keyword) ||
      (item.position || "").toLowerCase().includes(keyword) ||
      (item.email || "").toLowerCase().includes(keyword);

    const matchStatus = selectedStatus === "" || item.status === selectedStatus;
    return matchKeyword && matchStatus;
  });

  tbody.innerHTML = "";

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="empty-row">Không tìm thấy hồ sơ ứng viên phù hợp với bộ lọc</td></tr>`;
    return;
  }

  filtered.forEach((item) => {
    const tr = document.createElement("tr");
    const initials = getInitials(item.name);

    let statusBadge = "";
    if (item.status === "Chờ xét duyệt") {
      statusBadge = `<span class="status-badge status-pending">Chờ xét duyệt</span>`;
    } else if (item.status === "Đã duyệt") {
      statusBadge = `<span class="status-badge status-approved">Đã duyệt</span>`;
    } else {
      statusBadge = `<span class="status-badge status-rejected" title="${item.rejectReason || 'Từ chối'}">Đã từ chối</span>`;
    }

    // Nút hành động tương ứng với trạng thái (Tuân thủ phân quyền CSDL MySQL)
    const canViewDoc = hasPermission('view_docs', 0);
    const canApproveCandidate = hasPermission('review_docs', 4);

    let actionsHtml = "";
    if (item.status === "Chờ xét duyệt") {
      actionsHtml = `
        <div class="action-buttons">
          <button type="button" class="btn-action btn-detail" onclick="openCandidateDetailModal(${item.id})" title="Xem chi tiết ứng viên">
            Chi tiết
          </button>
          ${canViewDoc ? `
          <button type="button" class="btn-action btn-doc" onclick="openDocumentModal(${item.id})" title="Xem tài liệu CV & Đơn">
            Tài liệu
          </button>` : ''}
          ${canApproveCandidate ? `
          <button type="button" class="btn-action btn-approve" onclick="approveApplication(${item.id})" title="Duyệt ứng viên">
            Duyệt
          </button>
          <button type="button" class="btn-action btn-reject" onclick="openRejectModal(${item.id})" title="Từ chối hồ sơ">
            Từ chối
          </button>` : ''}
        </div>
      `;
    } else if (item.status === "Đã duyệt") {
      actionsHtml = `
        <div class="action-buttons">
          <button type="button" class="btn-action btn-detail" onclick="openCandidateDetailModal(${item.id})">Chi tiết</button>
          ${canViewDoc ? `<button type="button" class="btn-action btn-doc" onclick="openDocumentModal(${item.id})">Tài liệu</button>` : ''}
          <span style="font-size: 11.5px; color: #059669; font-weight: 600;">✓ Đã thêm vào TTS</span>
        </div>
      `;
    } else {
      actionsHtml = `
        <div class="action-buttons">
          <button type="button" class="btn-action btn-detail" onclick="openCandidateDetailModal(${item.id})">Chi tiết</button>
          ${canViewDoc ? `<button type="button" class="btn-action btn-doc" onclick="openDocumentModal(${item.id})">Tài liệu</button>` : ''}
          <span style="font-size: 11.5px; color: #dc2626; font-weight: 600;" title="${item.rejectReason}">✕ Đã từ chối</span>
        </div>
      `;
    }

    tr.innerHTML = `
      <td>
        <div class="candidate-cell">
          <div class="candidate-avatar-badge alt">${initials}</div>
          <div class="intern-meta">
            <span class="intern-name">${item.name}</span>
            <span class="intern-sub">${item.email} • ${item.phone}</span>
          </div>
        </div>
      </td>
      <td>
        <div class="intern-meta">
          <span class="intern-name" style="font-weight: 500;">${item.school}</span>
          <span class="intern-sub">${item.major} (GPA: ${item.gpa})</span>
        </div>
      </td>
      <td><span class="badge-tag-sm">${item.position}</span></td>
      <td>${item.appliedDate}</td>
      <td>
        <div class="doc-pill-list">
          <span class="doc-pill" onclick="openDocumentModalWithType(${item.id}, 'cv')" title="Xem CV đính kèm">
            <i class="fa-solid fa-file-pdf"></i>
            <span>CV</span>
          </span>
          <span class="doc-pill" onclick="openDocumentModalWithType(${item.id}, 'letter')" title="Xem đơn xin thực tập & bảng điểm">
            <i class="fa-solid fa-file-signature"></i>
            <span>Đơn & Điểm</span>
          </span>
        </div>
      </td>
      <td>${statusBadge}</td>
      <td class="text-center">${actionsHtml}</td>
    `;
    tbody.appendChild(tr);
  });
}

// Mở Modal Xem Chi tiết Hồ sơ Ứng viên
function openCandidateDetailModal(id) {
  const candidate = applications.find((item) => item.id === id);
  if (!candidate) return;

  const bodyEl = document.getElementById("candidateDetailBody");
  const footerEl = document.getElementById("candidateDetailFooter");
  const initials = getInitials(candidate.name);

  let statusBadge = "";
  if (candidate.status === "Chờ xét duyệt") {
    statusBadge = `<span class="status-badge status-pending">Chờ xét duyệt</span>`;
  } else if (candidate.status === "Đã duyệt") {
    statusBadge = `<span class="status-badge status-approved">Đã duyệt (Đang thực tập)</span>`;
  } else {
    statusBadge = `<span class="status-badge status-rejected">Đã từ chối</span>`;
  }

  bodyEl.innerHTML = `
    <div class="detail-card-hero">
      <div class="detail-avatar-circle">${initials}</div>
      <div class="detail-hero-content">
        <h4 class="detail-candidate-name">${candidate.name}</h4>
        <div class="detail-candidate-position">${candidate.position}</div>
        <div class="detail-badges-row">
          <span class="badge-tag-sm">${candidate.school}</span>
          <span class="badge-tag-sm">${candidate.major}</span>
          ${statusBadge}
        </div>
      </div>
    </div>

    <div class="info-grid">
      <div class="info-item">
        <span class="info-item-label">Email liên hệ</span>
        <span class="info-item-value">${candidate.email}</span>
      </div>
      <div class="info-item">
        <span class="info-item-label">Số điện thoại</span>
        <span class="info-item-value">${candidate.phone}</span>
      </div>
      <div class="info-item">
        <span class="info-item-label">Điểm học tập (GPA)</span>
        <span class="info-item-value">${candidate.gpa}</span>
      </div>
      <div class="info-item">
        <span class="info-item-label">Ngày nộp hồ sơ</span>
        <span class="info-item-value">${candidate.appliedDate}</span>
      </div>
      <div class="info-item">
        <span class="info-item-label">Phòng ban dự kiến tiếp nhận</span>
        <span class="info-item-value">${candidate.dept}</span>
      </div>
      <div class="info-item">
        <span class="info-item-label">Người hướng dẫn (Mentor)</span>
        <span class="info-item-value">${candidate.mentor}</span>
      </div>
    </div>

    <div class="detail-section-block">
      <h5 class="detail-block-title">Kỹ năng công nghệ & Năng lực</h5>
      <div class="skills-wrap">
        ${candidate.skills
          .split(",")
          .map((s) => `<span class="skill-tag">${s.trim()}</span>`)
          .join("")}
      </div>
    </div>

    <div class="detail-section-block">
      <h5 class="detail-block-title">Mục tiêu & Giới thiệu bản thân</h5>
      <div class="bio-quote-box">${candidate.bio}</div>
    </div>

    <div class="detail-section-block">
      <h5 class="detail-block-title">Dự án & Kinh nghiệm nổi bật</h5>
      <p style="font-size: 13px; color: #475569; line-height: 1.5;">${candidate.projects}</p>
    </div>

    ${
      candidate.rejectReason
        ? `
      <div class="reject-target-box" style="margin-top: 14px;">
        <span class="reject-label">Lý do từ chối:</span>
        <strong class="reject-name" style="font-size: 13.5px;">${candidate.rejectReason}</strong>
        <p style="font-size: 12px; color: #991b1b; margin-top: 4px;">Ghi chú: ${candidate.rejectNote || "Không có"}</p>
      </div>`
        : ""
    }
  `;

  // Thiết lập Footer Actions
  if (candidate.status === "Chờ xét duyệt") {
    footerEl.innerHTML = `
      <button type="button" class="btn-secondary" onclick="closeModal('candidateDetailModal')">Đóng</button>
      <button type="button" class="btn-action btn-doc" style="padding: 9px 16px;" onclick="closeModal('candidateDetailModal'); openDocumentModal(${candidate.id})">
        Xem tài liệu đính kèm
      </button>
      <button type="button" class="btn-danger" onclick="openRejectModalFromDetail(${candidate.id})">
        Từ chối hồ sơ
      </button>
      <button type="button" class="btn-success" onclick="approveApplication(${candidate.id}); closeModal('candidateDetailModal');">
        Duyệt hồ sơ (Approve)
      </button>
    `;
  } else {
    footerEl.innerHTML = `
      <button type="button" class="btn-secondary" onclick="closeModal('candidateDetailModal')">Đóng</button>
      <button type="button" class="btn-action btn-doc" style="padding: 9px 16px;" onclick="closeModal('candidateDetailModal'); openDocumentModal(${candidate.id})">
        Xem tài liệu đính kèm
      </button>
    `;
  }

  openModal("candidateDetailModal");
}

function openRejectModalFromDetail(id) {
  closeModal("candidateDetailModal");
  openRejectModal(id);
}

// Mở Modal Xem Tài Liệu (CV & Đơn xin thực tập)
function openDocumentModalWithType(id, type) {
  currentDocType = type;
  openDocumentModal(id);
}

async function openDocumentModal(id) {
  if (typeof hasPermission === 'function' && !hasPermission('view_docs', 0)) {
    showToast('Bạn không có quyền Xem tài liệu! Quyền đã bị vô hiệu hóa trong CSDL.', 'error');
    return;
  }
  currentDocCandidateId = id;
  let candidate = applications.find((item) => item.id === id);
  if (!candidate) {
    candidate = internList.find((item) => item.id === id);
  }
  if (!candidate) return;

  // Lấy danh sách tài liệu thực tế từ MySQL nếu có
  if (typeof apiGetInternDocuments === 'function') {
    try {
      const res = await apiGetInternDocuments(id);
      if (res && res.success && res.data && Array.isArray(res.data.documents)) {
        candidate.realDocuments = res.data.documents;
        const cvDoc = res.data.documents.find(d => d.type === 'CV');
        const letterDoc = res.data.documents.find(d => d.type === 'APPLICATION_LETTER');
        const contractDoc = res.data.documents.find(d => d.type === 'CONTRACT');
        if (cvDoc) {
          candidate.docCvName = cvDoc.name;
          candidate.cvFileUrl = cvDoc.fileUrl;
        }
        if (letterDoc) {
          candidate.docLetterName = letterDoc.name;
          candidate.letterFileUrl = letterDoc.fileUrl;
        }
        if (contractDoc) {
          candidate.docContractName = contractDoc.name;
          candidate.contractFileUrl = contractDoc.fileUrl;
          candidate.contractStatus = contractDoc.reviewStatus;
          candidate.contractUploadDate = contractDoc.uploadedAt;
          candidate.contractRejectReason = contractDoc.rejectReason;
        }
      }
    } catch (e) {
      console.warn('Lỗi tải tài liệu từ DB:', e);
    }
  }

  // Tải thông tin hợp đồng thực tế từ MySQL contracts nếu có
  if (typeof apiGetContracts === 'function') {
    try {
      const cRes = await apiGetContracts({ intern_id: id });
      if (cRes && cRes.success && Array.isArray(cRes.data) && cRes.data.length > 0) {
        const c = cRes.data[0];
        candidate.docContractName = c.file_name || candidate.docContractName || 'Hop_Dong_Thuc_Tap.pdf';
        candidate.contractFileUrl = c.file_url || candidate.contractFileUrl;
        candidate.contractUploadDate = c.created_at_formatted || candidate.contractUploadDate || getFormattedUploadDate();
        candidate.contractStatus = c.status;
        candidate.contractRejectReason = c.reject_reason;
        candidate.contractCode = c.code;
        candidate.contractTitle = c.title;
      }
    } catch (e) {
      console.warn('Lỗi tải hợp đồng:', e);
    }
  }

  const candidateSub = document.getElementById("docCandidateSub");
  if (candidateSub) {
    const pos = candidate.position || `Thực tập sinh ${candidate.major || ''}`;
    candidateSub.textContent = `Hồ sơ: ${candidate.name} • ${candidate.school || ''} • ${pos}`;
  }

  switchDocTab(currentDocType || "cv");

  // Nút duyệt / từ chối dưới footer của Modal tài liệu
  const btnReject = document.getElementById("docBtnReject");
  const btnApprove = document.getElementById("docBtnApprove");

  const hasUploadedDocs = candidate.realDocuments && candidate.realDocuments.length > 0;
  if (candidate.status === "Chờ xét duyệt") {
    if (btnReject) btnReject.style.display = "inline-flex";
    if (btnApprove) {
      btnApprove.style.display = "inline-flex";
      if (!hasUploadedDocs) {
        btnApprove.disabled = true;
        btnApprove.style.opacity = "0.5";
        btnApprove.title = "Ứng viên chưa hoàn thiện tài liệu bắt buộc để duyệt";
      } else {
        btnApprove.disabled = false;
        btnApprove.style.opacity = "1";
        btnApprove.title = "Duyệt hồ sơ này";
      }
    }
  } else {
    if (btnReject) btnReject.style.display = "none";
    if (btnApprove) btnApprove.style.display = "none";
  }

  openModal("documentViewerModal");
}

// Chuyển tab giữa CV, Đơn xin thực tập và Hợp đồng thực tập
function switchDocTab(type) {
  currentDocType = type;
  const btnCV = document.getElementById("btnTabCV");
  const btnLetter = document.getElementById("btnTabLetter");
  const btnContract = document.getElementById("btnTabContract");
  const fileNameEl = document.getElementById("docFileName");
  const fileSizeEl = document.getElementById("docFileSize");
  const a4Content = document.getElementById("a4Content");

  let candidate = applications.find((item) => item.id === currentDocCandidateId);
  if (!candidate) {
    candidate = internList.find((item) => item.id === currentDocCandidateId);
  }
  if (!candidate || !a4Content) return;

  // Kiểm tra xem ứng viên có file thật được tải lên server không
  let realDoc = null;
  if (candidate.realDocuments && candidate.realDocuments.length > 0) {
    const targetType = type === "cv" ? "CV" : (type === "letter" ? "APPLICATION_LETTER" : "CONTRACT");
    realDoc = candidate.realDocuments.find((d) => d.type === targetType);
  }
  if (!realDoc && type === "contract" && candidate.contractFileUrl) {
    realDoc = {
      type: "CONTRACT",
      name: candidate.docContractName || "Hop_Dong_Thuc_Tap.pdf",
      fileUrl: candidate.contractFileUrl,
      size: "Tài liệu hợp đồng"
    };
  }

  if (btnCV) btnCV.classList.toggle("active", type === "cv");
  if (btnLetter) btnLetter.classList.toggle("active", type === "letter");
  if (btnContract) btnContract.classList.toggle("active", type === "contract");

  // 1. Kiểm tra tài liệu thực tế tải lên server
  if (realDoc && realDoc.fileUrl) {
    const fullUrl = realDoc.fileUrl.startsWith("http") ? realDoc.fileUrl : `http://localhost:5000${realDoc.fileUrl}`;
    const ext = realDoc.fileUrl.split(".").pop().toLowerCase();
    if (fileNameEl) fileNameEl.textContent = realDoc.name;
    if (fileSizeEl) fileSizeEl.textContent = `${realDoc.size || "Tài liệu"} • Định dạng ${ext.toUpperCase()}`;

    if (ext === "pdf") {
      a4Content.innerHTML = `
        <div style="width: 100%; height: 750px; background: #525659; border-radius: 8px; overflow: hidden;">
          <iframe src="${fullUrl}" style="width: 100%; height: 100%; border: none;"></iframe>
        </div>
      `;
      return;
    } else if (["png", "jpg", "jpeg", "webp"].includes(ext)) {
      a4Content.innerHTML = `
        <div style="text-align: center; padding: 20px; background: #f8fafc; border-radius: 8px;">
          <img src="${fullUrl}" alt="${realDoc.name}" style="max-width: 100%; max-height: 700px; border-radius: 6px; box-shadow: 0 4px 15px rgba(0,0,0,0.08);" />
        </div>
      `;
      return;
    } else if (["doc", "docx"].includes(ext)) {
      a4Content.innerHTML = `
        <div style="text-align: center; padding: 60px 20px; background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 8px;">
          <div style="width: 64px; height: 64px; border-radius: 12px; background: #dbeafe; color: #2563eb; display: inline-flex; align-items: center; justify-content: center; font-size: 32px; margin-bottom: 16px;">
            <i class="fa-solid fa-file-word"></i>
          </div>
          <h4 style="font-size: 16px; font-weight: 700; color: #1e293b; margin-bottom: 6px;">${realDoc.name}</h4>
          <p style="font-size: 13px; color: #64748b; margin-bottom: 20px;">Tài liệu định dạng Microsoft Word (${ext.toUpperCase()}) • Dung lượng: ${realDoc.size || 'N/A'}</p>
          <a href="${fullUrl}" download="${realDoc.name}" class="btn-primary" style="display: inline-flex; align-items: center; gap: 8px; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-size: 13px; font-weight: 600;">
            <i class="fa-solid fa-download"></i>
            <span>Tải xuống tệp tài liệu</span>
          </a>
        </div>
      `;
      return;
    }
  }

  // 2. Nếu không có file thật trên server, kiểm tra tên file
  const docName = type === "cv" ? candidate.docCvName : (type === "letter" ? candidate.docLetterName : candidate.docContractName);

  // Nếu không có tài liệu nào đính kèm
  if (!docName) {
    if (fileNameEl) fileNameEl.textContent = "Chưa có tài liệu";
    if (fileSizeEl) fileSizeEl.textContent = "Chưa tải lên";
    a4Content.innerHTML = `
      <div style="text-align: center; padding: 60px 20px; background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 8px;">
        <i class="fa-regular fa-folder-open" style="font-size: 48px; color: #94a3b8; margin-bottom: 12px; display: block;"></i>
        <h4 style="font-size: 16px; font-weight: 700; color: #334155; margin-bottom: 6px;">Chưa có ${type === 'cv' ? 'Bản lý lịch / CV' : (type === 'letter' ? 'Đơn xin thực tập' : 'Hợp đồng thực tập')}</h4>
        <p style="font-size: 13px; color: #64748b; margin: 0;">Thực tập sinh chưa tải lên tài liệu này vào hệ thống.</p>
      </div>
    `;
    return;
  }

  if (fileNameEl) fileNameEl.textContent = docName;
  if (fileSizeEl) fileSizeEl.textContent = "Đã lưu trữ";

    if (type === "cv") {
      a4Content.innerHTML = `
        <div class="a4-sheet">
          <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #2563eb; padding-bottom: 16px; margin-bottom: 20px;">
            <div>
              <h2 style="font-size: 22px; font-weight: 800; color: #1e293b; text-transform: uppercase; margin: 0 0 6px 0;">${candidate.name}</h2>
              <p style="font-size: 14px; font-weight: 600; color: #2563eb; margin: 0 0 8px 0;">Vị trí ứng tuyển: ${candidate.position || ('Thực tập sinh ' + candidate.major)}</p>
              <div style="font-size: 12px; color: #64748b; display: flex; gap: 14px; flex-wrap: wrap;">
                <span><i class="fa-solid fa-envelope" style="color: #2563eb;"></i> ${candidate.email || 'Chưa cập nhật'}</span>
                <span><i class="fa-solid fa-phone" style="color: #2563eb;"></i> ${candidate.phone || '0987 654 321'}</span>
              </div>
            </div>
            <div style="width: 70px; height: 70px; border-radius: 8px; background: #eff6ff; color: #2563eb; display: flex; align-items: center; justify-content: center; font-size: 26px; font-weight: 800; border: 2px solid #bfdbfe;">
              ${getInitials(candidate.name)}
            </div>
          </div>

          <div style="margin-bottom: 16px;">
            <h4 style="font-size: 13px; font-weight: 700; color: #1e293b; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 8px;">
              1. Học vấn & Đào tạo
            </h4>
            <p style="margin: 0; font-size: 13px;"><strong>Trường đại học:</strong> ${candidate.school || 'Đại học'}</p>
            <p style="margin: 4px 0 0 0; font-size: 13px;"><strong>Chuyên ngành:</strong> ${candidate.major || 'CNTT'}</p>
            ${candidate.gpa ? `<p style="margin: 4px 0 0 0; font-size: 13px;"><strong>Điểm tích lũy (GPA):</strong> ${candidate.gpa}</p>` : ''}
          </div>

          <div style="margin-bottom: 16px;">
            <h4 style="font-size: 13px; font-weight: 700; color: #1e293b; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 8px;">
              2. Vị trí & Phòng ban tiếp nhận
            </h4>
            <p style="margin: 0; font-size: 13px;"><strong>Vị trí thực tập:</strong> <span style="color: #2563eb; font-weight: 600;">${candidate.position || ('Thực tập sinh ' + candidate.major)}</span></p>
            <p style="margin: 4px 0 0 0; font-size: 13px;"><strong>Phòng ban:</strong> ${candidate.dept || 'Kỹ thuật phần mềm'}</p>
            <p style="margin: 4px 0 0 0; font-size: 13px;"><strong>Người hướng dẫn (Mentor):</strong> ${candidate.mentor || 'Chưa phân công'}</p>
          </div>

          ${candidate.skills ? `
          <div style="margin-bottom: 16px;">
            <h4 style="font-size: 13px; font-weight: 700; color: #1e293b; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 8px;">
              3. Kỹ năng chuyên môn
            </h4>
            <p style="margin: 0; font-size: 13px; line-height: 1.6;">${candidate.skills}</p>
          </div>` : ''}

          <div style="margin-top: 30px; text-align: right; padding-top: 20px; border-top: 1px dashed #cbd5e1;">
            <p style="font-size: 12px; color: #64748b; margin: 0 0 40px 0;">Hà Nội, ngày nộp hồ sơ</p>
            <p style="font-size: 13px; font-weight: 700; color: #0f172a; margin: 0;">${candidate.name}</p>
          </div>
        </div>
      `;
    } else if (type === "letter") {
      a4Content.innerHTML = `
        <div class="a4-sheet">
          <div style="text-align: center; margin-bottom: 24px;">
            <h3 style="font-size: 14px; font-weight: 700; color: #0f172a; margin: 0; text-transform: uppercase;">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</h3>
            <p style="font-size: 12px; color: #475569; margin: 4px 0 0 0; text-decoration: underline;">Độc lập - Tự do - Hạnh phúc</p>
            <h2 style="font-size: 18px; font-weight: 800; color: #1e293b; text-transform: uppercase; margin: 24px 0 4px 0;">ĐƠN XIN THỰC TẬP DOANH NGHIỆP</h2>
            <p style="font-size: 12.5px; color: #64748b; margin: 0;">Vị trí ứng tuyển: <span style="color: #2563eb; font-weight: 600;">${candidate.position || ('Thực tập sinh ' + candidate.major)}</span></p>
          </div>

          <p style="font-size: 13px; line-height: 1.8; margin-bottom: 12px;"><strong>Kính gửi:</strong> Ban Lãnh đạo và Phòng Nhân sự Công ty</p>
          <p style="font-size: 13px; line-height: 1.8; margin-bottom: 8px;">Tôi tên là: <strong>${candidate.name}</strong></p>
          <p style="font-size: 13px; line-height: 1.8; margin-bottom: 8px;">Sinh viên trường: <strong>${candidate.school || 'Đại học'}</strong> - Chuyên ngành: <strong>${candidate.major || 'CNTT'}</strong></p>
          <p style="font-size: 13px; line-height: 1.8; margin-bottom: 8px;">Nay tôi làm đơn này kính xin được tiếp nhận vào vị trí: <strong style="color: #2563eb;">${candidate.position || ('Thực tập sinh ' + candidate.major)}</strong> tại phòng ban: <strong>${candidate.dept || 'Kỹ thuật phần mềm'}</strong>.</p>
          <p style="font-size: 13px; line-height: 1.8; margin-bottom: 8px;">Tôi cam kết sẽ chấp hành nghiêm túc mọi nội quy, quy chế làm việc và hoàn thành tốt nhiệm vụ được giao trong suốt quá trình thực tập tại công ty.</p>

          <div style="margin-top: 40px; display: flex; justify-content: flex-end;">
            <div style="text-align: center; width: 220px;">
              <p style="font-size: 12px; color: #64748b; margin: 0 0 40px 0;">Người làm đơn<br><em>(Ký và ghi rõ họ tên)</em></p>
              <p style="font-size: 13px; font-weight: 700; color: #0f172a; margin: 0;">${candidate.name}</p>
            </div>
          </div>
        </div>
      `;
    } else {
      a4Content.innerHTML = `
        <div class="a4-sheet">
          <div style="text-align: center; margin-bottom: 20px;">
            <h3 style="font-size: 14px; font-weight: 700; color: #0f172a; margin: 0; text-transform: uppercase;">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</h3>
            <p style="font-size: 12px; color: #475569; margin: 4px 0 0 0; text-decoration: underline;">Độc lập - Tự do - Hạnh phúc</p>
            <h2 style="font-size: 18px; font-weight: 800; color: #1e293b; text-transform: uppercase; margin: 18px 0 4px 0;">HỢP ĐỒNG TIẾP NHẬN THỰC TẬP SINH</h2>
            <p style="font-size: 12px; color: #64748b; margin: 0; font-style: italic;">Số: HĐTT-${new Date().getFullYear()}/0${candidate.id || 1}</p>
          </div>

          <p style="font-size: 12.5px; line-height: 1.6; margin-bottom: 8px;"><em>Hôm nay, ngày ${candidate.contractUploadDate || getFormattedUploadDate()}, tại Trụ sở Công ty, chúng tôi gồm có:</em></p>

          <div style="margin-bottom: 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px 14px;">
            <p style="font-size: 12.5px; font-weight: 700; color: #1e293b; margin: 0 0 4px 0; text-transform: uppercase;">BÊN A: ĐƠN VỊ TIẾP NHẬN THỰC TẬP</p>
            <p style="margin: 0; font-size: 12.5px; line-height: 1.6;"><strong>Đại diện:</strong> Ông/Bà <strong>${candidate.mentor || 'Nguyễn Văn Hùng'}</strong> - Chức vụ: Quản lý phòng ban</p>
            <p style="margin: 2px 0 0 0; font-size: 12.5px; line-height: 1.6;"><strong>Phòng ban:</strong> ${candidate.dept || 'Kỹ thuật phần mềm'}</p>
          </div>

          <div style="margin-bottom: 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px 14px;">
            <p style="font-size: 12.5px; font-weight: 700; color: #1e293b; margin: 0 0 4px 0; text-transform: uppercase;">BÊN B: THỰC TẬP SINH</p>
            <p style="margin: 0; font-size: 12.5px; line-height: 1.6;"><strong>Họ và tên:</strong> <strong>${candidate.name}</strong></p>
            <p style="margin: 2px 0 0 0; font-size: 12.5px; line-height: 1.6;"><strong>Trường đại học:</strong> ${candidate.school || 'Đại học'} - <strong>Chuyên ngành:</strong> ${candidate.major || 'CNTT'}</p>
            <p style="margin: 2px 0 0 0; font-size: 12.5px; line-height: 1.6;"><strong>Email:</strong> ${candidate.email || 'Chưa cập nhật'} • <strong>SĐT:</strong> ${candidate.phone || 'Chưa cập nhật'}</p>
          </div>

          <div style="margin-bottom: 12px;">
            <h4 style="font-size: 12.5px; font-weight: 700; color: #1e293b; margin: 0 0 4px 0;">ĐIỀU 1: VỊ TRÍ VÀ THỜI HẠN THỰC TẬP</h4>
            <p style="margin: 0; font-size: 12.5px; line-height: 1.6;">- Vị trí thực tập: <strong style="color: #2563eb;">${candidate.position || ('Thực tập sinh ' + candidate.major)}</strong></p>
            <p style="margin: 2px 0 0 0; font-size: 12.5px; line-height: 1.6;">- Thời gian thực tập: <strong>${candidate.time || '01/10/2026 - 31/12/2026'}</strong></p>
          </div>

          <div style="margin-bottom: 16px;">
            <h4 style="font-size: 12.5px; font-weight: 700; color: #1e293b; margin: 0 0 4px 0;">ĐIỀU 2: QUYỀN LỢI VÀ NGHĨA VỤ</h4>
            <p style="margin: 0; font-size: 12.5px; line-height: 1.6;">- Bên B được tiếp cận các quy trình kỹ thuật, tài liệu dự án và hướng dẫn trực tiếp từ Mentor.</p>
            <p style="margin: 2px 0 0 0; font-size: 12.5px; line-height: 1.6;">- Bên B cam kết tuân thủ quy định bảo mật, văn hóa doanh nghiệp và quy chế làm việc của Bên A.</p>
          </div>

          <div style="margin-top: 30px; display: flex; justify-content: space-between;">
            <div style="text-align: center; width: 220px;">
              <p style="font-size: 12px; color: #64748b; margin: 0 0 40px 0;">ĐẠI DIỆN BÊN A<br><em>(Ký và đóng dấu)</em></p>
              <p style="font-size: 13px; font-weight: 700; color: #0f172a; margin: 0;">${candidate.mentor || 'Đại diện Công ty'}</p>
            </div>
            <div style="text-align: center; width: 220px;">
              <p style="font-size: 12px; color: #64748b; margin: 0 0 40px 0;">ĐẠI DIỆN BÊN B<br><em>(Ký và ghi rõ họ tên)</em></p>
              <p style="font-size: 13px; font-weight: 700; color: #0f172a; margin: 0;">${candidate.name}</p>
            </div>
          </div>
        </div>
      `;
    }
}

function openRejectModalFromDoc() {
  closeModal("documentViewerModal");
  openRejectModal(currentDocCandidateId);
}

function approveFromDoc() {
  approveApplication(currentDocCandidateId);
  closeModal("documentViewerModal");
}

// Thao tác DUYỆT HỒ SƠ ỨNG VIÊN
// (Chuyển trạng thái sang Đã duyệt -> Tự động chuyển TTS sang danh sách chính Tab 3)
function approveApplication(id) {
  if (typeof hasPermission === 'function' && !hasPermission('review_docs', 4)) {
    showToast('Bạn không có quyền Duyệt hồ sơ ứng viên! Quyền đã bị vô hiệu hóa trong CSDL.', 'error');
    return;
  }
  const candidate = applications.find((item) => item.id === id);
  if (!candidate) return;

  approveCandidate(candidate);
}

function approveCandidate(candidate) {
  candidate.status = "Đã duyệt";

  // Kiểm tra xem đã có trong danh sách TTS chính chưa
  const existing = internList.find((item) => item.name.toLowerCase() === candidate.name.toLowerCase());
  if (!existing) {
    // Tự động tạo bản ghi TTS chính thức
    const newIntern = {
      id: Date.now(),
      name: candidate.name,
      email: candidate.email,
      major: candidate.major,
      school: candidate.school,
      dept: candidate.dept || "Kỹ thuật phần mềm",
      mentor: candidate.mentor || "Chưa phân công",
      time: "01/10/2026 - 31/12/2026",
      status: "Đang thực tập"
    };
    internList.unshift(newIntern);
    try {
      localStorage.setItem("codegym_saved_interns", JSON.stringify(internList));
    } catch (e) {}
  }

  // Cập nhật lại giao diện các tab
  renderOverview();
  filterReviewData();
  filterData();

  // Gọi API cập nhật trạng thái duyệt vào MySQL
  if (typeof apiUpdateDocumentStatus === 'function') {
    apiUpdateDocumentStatus(candidate.id, 'approved', 'Đã duyệt hồ sơ').catch(e => console.warn(e));
  }

  // Ghi nhận log email hệ thống gửi thông báo (User Story 8)
  try {
    const raw = localStorage.getItem('codegym_system_emails') || '[]';
    const emailLogs = JSON.parse(raw);
    emailLogs.unshift({
      id: Date.now(),
      to: candidate.email,
      name: candidate.name,
      subject: 'Thông báo kết quả xét duyệt hồ sơ thực tập CodeGym',
      type: 'approved',
      content: `Chúc mừng bạn ${candidate.name}, hồ sơ thực tập của bạn đã được phòng nhân sự duyệt thành công!`,
      time: new Date().toLocaleString('vi-VN')
    });
    localStorage.setItem('codegym_system_emails', JSON.stringify(emailLogs));
  } catch (e) {}

  showToast(`Đã duyệt hồ sơ của ứng viên "${candidate.name}" và hệ thống đã gửi email thông báo kết quả đến ${candidate.email}!`, "success");
}

// Thao tác TỪ CHỐI HỒ SƠ (Mở Modal nhập lý do)
function openRejectModal(id) {
  if (typeof hasPermission === 'function' && !hasPermission('review_docs', 4)) {
    showToast('Bạn không có quyền Từ chối hồ sơ ứng viên! Quyền đã bị vô hiệu hóa trong CSDL.', 'error');
    return;
  }
  const candidate = applications.find((item) => item.id === id);
  if (!candidate) return;

  document.getElementById("rejectCandidateId").value = candidate.id;
  document.getElementById("rejectCandidateName").textContent = candidate.name;
  document.getElementById("rejectCandidateMeta").textContent = `${candidate.school} • ${candidate.major} • ${candidate.position}`;
  document.getElementById("rejectReasonSelect").value = "";
  document.getElementById("rejectNote").value = "";

  openModal("rejectModal");
}

function handleRejectSelectChange(selectEl) {
  const noteEl = document.getElementById("rejectNote");
  if (!noteEl) return;

  if (selectEl.value && selectEl.value !== "Khác") {
    noteEl.value = `Chào bạn, cảm ơn bạn đã nộp hồ sơ vào vị trí thực tập sinh. Sau khi xem xét kỹ lưỡng hồ sơ, HR nhận thấy: ${selectEl.value}. Rất tiếc hiện tại công ty chưa thể tiếp nhận bạn trong đợt tuyển dụng này. Chúc bạn luôn thành công!`;
  } else if (selectEl.value === "Khác") {
    noteEl.value = "";
  }
}

function handleRejectSubmit(e) {
  e.preventDefault();
  const id = Number(document.getElementById("rejectCandidateId").value);
  const reason = document.getElementById("rejectReasonSelect").value;
  const note = document.getElementById("rejectNote").value.trim();

  const candidate = applications.find((item) => item.id === id);
  if (candidate) {
    candidate.status = "Đã từ chối";
    candidate.rejectReason = reason;
    candidate.rejectNote = note;

    closeModal("rejectModal");
    renderOverview();
    filterReviewData();

    // Gọi API cập nhật trạng thái từ chối vào MySQL
    if (typeof apiUpdateDocumentStatus === 'function') {
      apiUpdateDocumentStatus(candidate.id, 'rejected', note || reason).catch(e => console.warn(e));
    }

    // Ghi nhận log email hệ thống gửi thông báo (User Story 8)
    try {
      const raw = localStorage.getItem('codegym_system_emails') || '[]';
      const emailLogs = JSON.parse(raw);
      emailLogs.unshift({
        id: Date.now(),
        to: candidate.email,
        name: candidate.name,
        subject: 'Thông báo kết quả xét duyệt hồ sơ thực tập CodeGym',
        type: 'rejected',
        content: `Cảm ơn bạn đã nộp hồ sơ. Rất tiếc công ty chưa thể tiếp nhận bạn trong đợt này. Lý do: ${note || reason}`,
        time: new Date().toLocaleString('vi-VN')
      });
      localStorage.setItem('codegym_system_emails', JSON.stringify(emailLogs));
    } catch (e) {}

    showToast(`Đã ghi nhận từ chối và hệ thống đã gửi email thông báo kết quả đến ${candidate.email}.`, "warning");
  }
}

// ==========================================================================
// TAB 3: THỰC TẬP SINH (INTERNS LIST - TÌM KIẾM, 2 LỌC, THÊM, SỬA)
// ==========================================================================

// Tìm kiếm và 2 dropdown lọc (Lọc theo trường + Lọc theo ngành)
function filterData() {
  const searchInput = document.getElementById("searchInput");
  const schoolFilter = document.getElementById("schoolFilter");
  const majorFilter = document.getElementById("majorFilter");
  const tbody = document.getElementById("tableBody");
  const internCountBadge = document.getElementById("internCount");

  if (!tbody) return;

  const keyword = searchInput ? searchInput.value.toLowerCase().trim() : "";
  const selectedSchool = schoolFilter ? schoolFilter.value : "";
  const selectedMajor = majorFilter ? majorFilter.value : "";

  const filtered = internList.filter((item) => {
    const matchKeyword =
      (item.name || "").toLowerCase().includes(keyword) ||
      (item.school || "").toLowerCase().includes(keyword) ||
      (item.major || "").toLowerCase().includes(keyword) ||
      (item.email || "").toLowerCase().includes(keyword) ||
      (item.mentor || "").toLowerCase().includes(keyword);

    const matchSchool = selectedSchool === "" || item.school === selectedSchool;
    const matchMajor = selectedMajor === "" || item.major === selectedMajor;

    return matchKeyword && matchSchool && matchMajor;
  });

  if (internCountBadge) internCountBadge.textContent = filtered.length;
  tbody.innerHTML = "";

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="empty-row">Không tìm thấy thực tập sinh nào phù hợp với điều kiện tìm kiếm/lọc</td></tr>`;
    return;
  }

  filtered.forEach((item) => {
    let statusClass = "status-finished";
    if (item.status === "Đang thực tập") statusClass = "status-active";
    else if (item.status === "Chờ xét duyệt") statusClass = "status-pending";

    const initials = getInitials(item.name);
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>
        <div class="candidate-cell">
          <div class="candidate-avatar-badge blue">${initials}</div>
          <div class="intern-meta">
            <span class="intern-name">${item.name}</span>
            <span class="intern-sub">${item.position ? `<strong style="color: #4f46e5; font-weight: 600;">${item.position}</strong> • ` : ''}${item.email}</span>
          </div>
        </div>
      </td>
      <td><strong>${item.school}</strong></td>
      <td><span class="badge-tag-sm">${item.major}</span></td>
      <td>${item.dept}</td>
      <td>${item.mentor}</td>
      <td style="color: #64748b; font-size: 12.5px;">${item.time}</td>
      <td>
        <span class="status-badge ${statusClass}">${item.status}</span>
      </td>
      <td class="text-center">
        <div class="action-buttons">
          <button type="button" class="btn-action btn-view" onclick="openViewInternModal(${item.id})" title="Xem chi tiết thực tập sinh">
            <i class="fa-solid fa-eye"></i>
            <span>Xem</span>
          </button>
          ${hasPermission('profile_manage', 2) ? `
          <button type="button" class="btn-action btn-edit" onclick="openEditModal(${item.id})" title="Chỉnh sửa thông tin">
            <i class="fa-solid fa-pen-to-square"></i>
            <span>Sửa</span>
          </button>` : ''}
          ${hasPermission('profile_manage', 3) ? `
          <button type="button" class="btn-action btn-delete" onclick="handleDeleteIntern(${item.id})" title="Xóa thực tập sinh" style="color: #ef4444; border-color: #fecaca; background: #fff5f5;">
            <i class="fa-solid fa-trash-can"></i>
            <span>Xóa</span>
          </button>` : ''}
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Cập nhật tên file khi người dùng chọn tài liệu
function updateUploadFileName(input, targetSpanId, clearBtnId, boxId) {
  const span = document.getElementById(targetSpanId);
  const clearBtn = clearBtnId ? document.getElementById(clearBtnId) : null;
  const box = boxId ? document.getElementById(boxId) : (input ? input.closest('.file-upload-box') : null);
  const icon = box ? box.querySelector('.file-type-icon') : null;
  const formGroup = box ? box.closest('.form-group') : (input ? input.closest('.form-group') : null);
  const metaBar = formGroup ? formGroup.querySelector('.file-meta-bar') : null;

  const isCv = (targetSpanId || '').toLowerCase().includes("cv");
  const isLetter = (targetSpanId || '').toLowerCase().includes("letter");
  let defaultText = "Tải lên Hợp đồng thực tập";
  if (isCv) defaultText = "Tải lên CV (PDF, DOCX)";
  else if (isLetter) defaultText = "Tải lên Đơn xin thực tập";

  if (input.files && input.files[0]) {
    const file = input.files[0];
    if (span) {
      span.textContent = file.name;
      span.style.fontWeight = "600";
      span.style.color = "#1e293b";
    }
    if (clearBtn) {
      clearBtn.style.display = "inline-flex";
    }
    if (icon) {
      const ext = (file.name.split('.').pop() || '').toLowerCase();
      if (['doc', 'docx'].includes(ext)) {
        icon.className = 'fa-solid fa-file-word file-type-icon';
        icon.style.color = '#2563eb';
      } else if (ext === 'pdf') {
        icon.className = 'fa-solid fa-file-pdf file-type-icon';
        icon.style.color = '#ef4444';
      } else if (['png', 'jpg', 'jpeg'].includes(ext)) {
        icon.className = 'fa-solid fa-file-image file-type-icon';
        icon.style.color = '#10b981';
      } else {
        icon.className = 'fa-solid fa-file-lines file-type-icon';
        icon.style.color = 'var(--primary)';
      }
    }
    if (metaBar) {
      const statusEl = metaBar.querySelector('.file-meta-status');
      const dateEl = metaBar.querySelector('.file-meta-date');
      const dateStr = getFormattedUploadDate();
      if (statusEl) {
        statusEl.innerHTML = '<i class="fa-solid fa-circle-check"></i> Trạng thái:  Đã tải lên';
        statusEl.className = 'file-meta-status uploaded';
      }
      if (dateEl) {
        dateEl.innerHTML = `<i class="fa-regular fa-calendar-check"></i> Ngày tải: ${dateStr}`;
        dateEl.className = 'file-meta-date uploaded';
      }
      input.dataset.uploadDate = dateStr;
    }
  } else {
    if (span) {
      span.textContent = defaultText;
      span.style.fontWeight = "normal";
      span.style.color = "#475569";
    }
    if (clearBtn) {
      clearBtn.style.display = "none";
    }
    if (icon) {
      icon.className = 'fa-solid fa-file-lines file-type-icon';
      icon.style.color = 'var(--primary)';
    }
    if (metaBar) {
      const statusEl = metaBar.querySelector('.file-meta-status');
      const dateEl = metaBar.querySelector('.file-meta-date');
      if (statusEl) {
        statusEl.innerHTML = '<i class="fa-regular fa-circle"></i> Trạng thái: Chưa tải lên';
        statusEl.className = 'file-meta-status';
      }
      if (dateEl) {
        dateEl.innerHTML = '<i class="fa-regular fa-calendar"></i> Ngày tải: --/--/----';
        dateEl.className = 'file-meta-date';
      }
      if (input) delete input.dataset.uploadDate;
    }
  }
}
window.updateUploadFileName = updateUploadFileName;

// Cập nhật hiển thị hộp tải file trong Modal
function updateDocBoxDisplay(boxId, spanId, clearBtnId, fileName, defaultText, uploadDate) {
  const box = document.getElementById(boxId);
  const span = document.getElementById(spanId);
  const clearBtn = clearBtnId ? document.getElementById(clearBtnId) : null;
  const icon = box ? box.querySelector('.file-type-icon') : null;
  const formGroup = box ? box.closest('.form-group') : null;
  const metaBar = formGroup ? formGroup.querySelector('.file-meta-bar') : null;

  if (fileName) {
    if (span) {
      span.textContent = fileName;
      span.style.fontWeight = "600";
      span.style.color = "#1e293b";
    }
    if (clearBtn) {
      clearBtn.style.display = "inline-flex";
    }
    if (icon) {
      const ext = (fileName.split('.').pop() || '').toLowerCase();
      if (['doc', 'docx'].includes(ext)) {
        icon.className = 'fa-solid fa-file-word file-type-icon';
        icon.style.color = '#2563eb';
      } else if (ext === 'pdf') {
        icon.className = 'fa-solid fa-file-pdf file-type-icon';
        icon.style.color = '#ef4444';
      } else if (['png', 'jpg', 'jpeg'].includes(ext)) {
        icon.className = 'fa-solid fa-file-image file-type-icon';
        icon.style.color = '#10b981';
      } else {
        icon.className = 'fa-solid fa-file-lines file-type-icon';
        icon.style.color = 'var(--primary)';
      }
    }
    if (metaBar) {
      const statusEl = metaBar.querySelector('.file-meta-status');
      const dateEl = metaBar.querySelector('.file-meta-date');
      const dateStr = uploadDate || getFormattedUploadDate();
      if (statusEl) {
        statusEl.innerHTML = '<i class="fa-solid fa-circle-check"></i> Trạng thái:  Đã tải lên';
        statusEl.className = 'file-meta-status uploaded';
      }
      if (dateEl) {
        dateEl.innerHTML = `<i class="fa-regular fa-calendar-check"></i> Ngày tải: ${dateStr}`;
        dateEl.className = 'file-meta-date uploaded';
      }
    }
  } else {
    if (span) {
      span.textContent = defaultText;
      span.style.fontWeight = "normal";
      span.style.color = "#475569";
    }
    if (clearBtn) {
      clearBtn.style.display = "none";
    }
    if (icon) {
      icon.className = 'fa-solid fa-file-lines file-type-icon';
      icon.style.color = 'var(--primary)';
    }
    if (metaBar) {
      const statusEl = metaBar.querySelector('.file-meta-status');
      const dateEl = metaBar.querySelector('.file-meta-date');
      if (statusEl) {
        statusEl.innerHTML = '<i class="fa-regular fa-circle"></i> Trạng thái: Chưa tải lên';
        statusEl.className = 'file-meta-status';
      }
      if (dateEl) {
        dateEl.innerHTML = '<i class="fa-regular fa-calendar"></i> Ngày tải: --/--/----';
        dateEl.className = 'file-meta-date';
      }
    }
  }
}
window.updateDocBoxDisplay = updateDocBoxDisplay;

// Bỏ chọn / Xóa file đã chọn trong modal
function clearSelectedFile(inputId, spanId, clearBtnId, boxId, docType, event) {
  if (event) {
    event.stopPropagation();
    event.preventDefault();
  }
  const input = document.getElementById(inputId);
  if (input) {
    input.value = "";
    delete input.dataset.uploadDate;
  }

  let defaultText = 'Tải lên Hợp đồng thực tập';
  if (docType === 'cv') defaultText = 'Tải lên CV (PDF, DOCX)';
  else if (docType === 'letter') defaultText = 'Tải lên Đơn xin thực tập';

  updateDocBoxDisplay(boxId, spanId, clearBtnId, null, defaultText, null);

  // Đánh dấu để xóa trên server khi người dùng lưu ở Modal Sửa
  const editIdEl = document.getElementById("editId");
  if (editIdEl && editIdEl.value) {
    const id = Number(editIdEl.value);
    const intern = internList.find(i => i.id === id) || applications.find(i => i.id === id);
    if (intern) {
      if (docType === 'cv') {
        intern.docCvName = null;
        intern.cvFileUrl = null;
        intern.cvUploadDate = null;
        intern.deleteCvOnSave = true;
      } else if (docType === 'letter') {
        intern.docLetterName = null;
        intern.letterFileUrl = null;
        intern.letterUploadDate = null;
        intern.deleteLetterOnSave = true;
      } else if (docType === 'contract') {
        intern.docContractName = null;
        intern.contractFileUrl = null;
        intern.contractUploadDate = null;
        intern.deleteContractOnSave = true;
      }
    }
  }
}
window.clearSelectedFile = clearSelectedFile;

// Bấm nút Mở Modal Thêm mới thực tập sinh
function openAddModal() {
  if (typeof hasPermission === 'function' && !hasPermission('profile_manage', 1)) {
    showToast('Bạn không có quyền Thêm mới thực tập sinh! Quyền đã bị vô hiệu hóa trong CSDL.', 'error');
    return;
  }
  document.getElementById("addName").value = "";
  if (document.getElementById("addBirthDate")) document.getElementById("addBirthDate").value = "";
  if (document.getElementById("addPhone")) document.getElementById("addPhone").value = "";
  if (document.getElementById("addEmail")) document.getElementById("addEmail").value = "";
  document.getElementById("addSchool").value = "";
  document.getElementById("addMajor").value = "";
  if (document.getElementById("addPosition")) document.getElementById("addPosition").value = "";
  if (document.getElementById("addDept")) document.getElementById("addDept").value = "Kỹ thuật phần mềm";
  if (document.getElementById("addMentor")) document.getElementById("addMentor").value = "";
  if (document.getElementById("addStartDate")) document.getElementById("addStartDate").value = "2026-10-01";
  if (document.getElementById("addEndDate")) document.getElementById("addEndDate").value = "2026-12-31";
  
  updateDocBoxDisplay("addCvBox", "cvFileName", "cvClearBtn", null, "Tải lên CV (PDF, DOCX)", null);
  updateDocBoxDisplay("addLetterBox", "letterFileName", "letterClearBtn", null, "Tải lên Đơn xin thực tập", null);
  updateDocBoxDisplay("addContractBox", "contractFileName", "contractClearBtn", null, "Tải lên Hợp đồng thực tập", null);
  if (document.getElementById("addCv")) document.getElementById("addCv").value = "";
  if (document.getElementById("addLetter")) document.getElementById("addLetter").value = "";
  if (document.getElementById("addContract")) document.getElementById("addContract").value = "";
  openModal("addModal");
}

// Xử lý Lưu Thêm Mới TTS
function handleAddSubmit(e) {
  e.preventDefault();

  const name = document.getElementById("addName").value.trim();
  const birthDate = document.getElementById("addBirthDate") ? document.getElementById("addBirthDate").value : "";
  const phone = document.getElementById("addPhone") ? document.getElementById("addPhone").value.trim() : "";
  const email = document.getElementById("addEmail") ? document.getElementById("addEmail").value.trim() : "";
  const school = document.getElementById("addSchool").value.trim();
  const major = document.getElementById("addMajor").value.trim();
  const position = document.getElementById("addPosition") ? document.getElementById("addPosition").value.trim() : "";
  const dept = document.getElementById("addDept") ? document.getElementById("addDept").value : "Kỹ thuật phần mềm";
  const mentor = document.getElementById("addMentor") ? document.getElementById("addMentor").value.trim() : "";
  const startDate = document.getElementById("addStartDate") ? document.getElementById("addStartDate").value : "";
  const endDate = document.getElementById("addEndDate") ? document.getElementById("addEndDate").value : "";

  const cvInput = document.getElementById("addCv");
  const letterInput = document.getElementById("addLetter");
  const contractInput = document.getElementById("addContract");
  const cvFile = cvInput && cvInput.files && cvInput.files[0] ? cvInput.files[0].name : null;
  const letterFile = letterInput && letterInput.files && letterInput.files[0] ? letterInput.files[0].name : null;
  const contractFile = contractInput && contractInput.files && contractInput.files[0] ? contractInput.files[0].name : null;

  const cvUploadDate = cvFile ? (cvInput.dataset.uploadDate || getFormattedUploadDate()) : null;
  const letterUploadDate = letterFile ? (letterInput.dataset.uploadDate || getFormattedUploadDate()) : null;
  const contractUploadDate = contractFile ? (contractInput.dataset.uploadDate || getFormattedUploadDate()) : null;

  const formatDate = (d) => {
    if (!d) return "";
    const [y, m, day] = d.split("-");
    return `${day}/${m}/${y}`;
  };

  const timeStr = (startDate && endDate)
    ? `${formatDate(startDate)} - ${formatDate(endDate)}`
    : (startDate ? `Từ ${formatDate(startDate)}` : "01/10/2026 - 31/12/2026");

  const newIntern = {
    id: Date.now(),
    name,
    birthDate,
    phone,
    email: email || `${name.toLowerCase().replace(/\s+/g, ".")}@company.vn`,
    school,
    major,
    position: position || `Thực tập sinh ${major}`,
    dept,
    mentor: mentor || "Chưa phân công",
    time: timeStr,
    status: "Đang thực tập",
    docCvName: cvFile,
    docLetterName: letterFile,
    docContractName: contractFile,
    cvFileUrl: cvFile && cvInput.files[0] ? URL.createObjectURL(cvInput.files[0]) : null,
    letterFileUrl: letterFile && letterInput.files[0] ? URL.createObjectURL(letterInput.files[0]) : null,
    contractFileUrl: contractFile && contractInput.files[0] ? URL.createObjectURL(contractInput.files[0]) : null,
    cvUploadDate,
    letterUploadDate,
    contractUploadDate
  };

  internList.unshift(newIntern);
  try {
    localStorage.setItem("codegym_saved_interns", JSON.stringify(internList));
  } catch (e) {}
  closeModal("addModal");
  filterData();
  renderOverview();

  // Lưu bản ghi vào MySQL Database
  if (typeof apiCreateIntern === 'function') {
    apiCreateIntern({
      name,
      email: newIntern.email,
      phone,
      school,
      major,
      dept,
      mentor: newIntern.mentor,
      position: newIntern.position,
      startDate: startDate || '2026-10-01',
      endDate: endDate || '2026-12-31',
      status: 'Đang thực tập'
    }).then(res => {
      if (res && res.success && res.data && res.data.id) {
        newIntern.id = res.data.id;
        console.log('✅ Đã lưu thực tập sinh mới vào MySQL Database với ID:', res.data.id);
        if (cvInput && cvInput.files && cvInput.files[0] && typeof apiUploadDocument === 'function') {
          apiUploadDocument(res.data.id, 'CV', cvInput.files[0]).catch(e => console.warn(e));
        }
        if (letterInput && letterInput.files && letterInput.files[0] && typeof apiUploadDocument === 'function') {
          apiUploadDocument(res.data.id, 'APPLICATION_LETTER', letterInput.files[0]).catch(e => console.warn(e));
        }
        if (contractInput && contractInput.files && contractInput.files[0] && typeof apiCreateContract === 'function') {
          const cCode = `HĐTT-2026-${String(res.data.id).padStart(3, '0')}`;
          apiCreateContract({
            intern_id: res.data.id,
            code: cCode,
            title: `Hợp đồng thực tập ${newIntern.dept || newIntern.position || 'Phát triển phần mềm'}`,
            company: 'Hệ thống Đào tạo CodeGym Việt Nam',
            dept: newIntern.dept || 'Phòng Phát triển Phần mềm',
            period: newIntern.time
          }, contractInput.files[0]).catch(e => console.warn(e));
        }
      }
    }).catch(err => console.warn('Lỗi khi lưu vào MySQL:', err));
  }

  showToast(`Đã thêm mới thực tập sinh "${name}" thành công!`, "success");
}

// Mở Modal Xem Chi tiết Thực tập sinh
async function openViewInternModal(id) {
  let intern = internList.find((item) => item.id === id);
  if (!intern) {
    intern = applications.find((item) => item.id === id);
  }
  if (!intern) return;

  // Luôn reset thông tin tài liệu trước khi nạp từ server
  intern.docCvName = intern.docCvName || null;
  intern.cvFileUrl = intern.cvFileUrl || null;
  intern.docLetterName = intern.docLetterName || null;
  intern.letterFileUrl = intern.letterFileUrl || null;
  intern.docContractName = intern.docContractName || null;
  intern.contractFileUrl = intern.contractFileUrl || null;
  intern.realDocuments = intern.realDocuments || [];

  // Lấy tài liệu thực tế từ MySQL nếu có
  if (typeof apiGetInternDocuments === 'function') {
    try {
      const res = await apiGetInternDocuments(id);
      if (res && res.success && res.data && Array.isArray(res.data.documents)) {
        intern.realDocuments = res.data.documents;
        const cvDoc = res.data.documents.find(d => d.type === 'CV');
        const letterDoc = res.data.documents.find(d => d.type === 'APPLICATION_LETTER');
        const contractDoc = res.data.documents.find(d => d.type === 'CONTRACT');
        if (cvDoc) {
          intern.docCvName = cvDoc.name;
          intern.cvFileUrl = cvDoc.fileUrl;
        }
        if (letterDoc) {
          intern.docLetterName = letterDoc.name;
          intern.letterFileUrl = letterDoc.fileUrl;
        }
        if (contractDoc) {
          intern.docContractName = contractDoc.name;
          intern.contractFileUrl = contractDoc.fileUrl;
          intern.contractStatus = contractDoc.reviewStatus;
          intern.contractUploadDate = contractDoc.uploadedAt;
          intern.contractRejectReason = contractDoc.rejectReason;
        }
      }
    } catch (e) {
      console.warn('Lỗi tải tài liệu TTS:', e);
    }
  }

  // Luôn nạp thông tin hợp đồng từ API contracts để đồng bộ chính xác nhất
  if (typeof apiGetContracts === 'function') {
    try {
      const cRes = await apiGetContracts({ intern_id: id });
      if (cRes && cRes.success && Array.isArray(cRes.data) && cRes.data.length > 0) {
        const c = cRes.data[0];
        intern.docContractName = c.file_name || intern.docContractName || 'Hop_Dong_Thuc_Tap.pdf';
        intern.contractFileUrl = c.file_url || intern.contractFileUrl;
        intern.contractUploadDate = c.created_at_formatted || intern.contractUploadDate || getFormattedUploadDate();
        intern.contractStatus = c.status;
        intern.contractRejectReason = c.reject_reason;
        intern.contractCode = c.code;
        intern.contractTitle = c.title;
      }
    } catch (e) {
      console.warn('Lỗi tải hợp đồng TTS:', e);
    }
  }

  const hasCv = !!intern.docCvName;
  const hasLetter = !!intern.docLetterName;
  const hasContract = !!intern.docContractName;
  const docCount = (hasCv ? 1 : 0) + (hasLetter ? 1 : 0) + (hasContract ? 1 : 0);
  const docCountBadge = docCount > 0 ? `(${docCount}/3 tài liệu đã nộp)` : `(Chưa có tài liệu đính kèm)`;
  const displayPosition = intern.position || `Thực tập sinh ${intern.major || ''}`;

  const bodyEl = document.getElementById("internDetailBody");
  const footerEl = document.getElementById("internDetailFooter");
  const initials = getInitials(intern.name);

  let statusClass = "status-finished";
  if (intern.status === "Đang thực tập") statusClass = "status-active";
  else if (intern.status === "Chờ xét duyệt") statusClass = "status-pending";

  const getDocIconConfig = (filename) => {
    const ext = (filename ? filename.split('.').pop() : '').toLowerCase();
    if (['doc', 'docx'].includes(ext)) {
      return { icon: 'fa-solid fa-file-word', bg: '#dbeafe', color: '#2563eb' };
    } else if (ext === 'pdf') {
      return { icon: 'fa-solid fa-file-pdf', bg: '#fee2e2', color: '#ef4444' };
    } else if (['png', 'jpg', 'jpeg'].includes(ext)) {
      return { icon: 'fa-solid fa-file-image', bg: '#dcfce7', color: '#16a34a' };
    }
    return { icon: 'fa-solid fa-file-lines', bg: '#eff6ff', color: 'var(--primary)' };
  };

  const cvIcon = getDocIconConfig(intern.docCvName);
  const letterIcon = getDocIconConfig(intern.docLetterName);
  const contractIcon = getDocIconConfig(intern.docContractName);

  // Card CV
  const cvCardHtml = hasCv ? `
    <div class="doc-card-interactive" style="border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px; background: #ffffff; display: flex; flex-direction: column; justify-content: space-between; gap: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
      <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 10px;">
        <div style="display: flex; align-items: center; gap: 10px; min-width: 0;">
          <div style="width: 38px; height: 38px; border-radius: 8px; background: ${cvIcon.bg}; color: ${cvIcon.color}; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0;">
            <i class="${cvIcon.icon}"></i>
          </div>
          <div style="min-width: 0;">
            <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Bản lý lịch / CV</div>
            <div style="font-size: 13px; font-weight: 600; color: #1e293b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${intern.docCvName}">${intern.docCvName}</div>
          </div>
        </div>
        <button type="button" class="btn-action btn-view" style="flex-shrink: 0; padding: 6px 12px; font-size: 12px;" onclick="closeModal('internDetailModal'); openDocumentModalWithType(${intern.id}, 'cv')" title="Xem chi tiết CV">
          <i class="fa-solid fa-eye"></i>
          <span>Xem CV</span>
        </button>
      </div>
      <div class="file-meta-bar" style="margin-top: 4px; padding: 6px 10px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; font-size: 11.5px; display: flex; align-items: center; justify-content: space-between; gap: 6px;">
        <span class="file-meta-status uploaded" style="font-weight: 600;"><i class="fa-solid fa-circle-check"></i> Trạng thái:  Đã tải lên</span>
        <span class="file-meta-date uploaded"><i class="fa-regular fa-calendar-check"></i> Ngày tải: ${intern.cvUploadDate || getFormattedUploadDate()}</span>
      </div>
    </div>
  ` : `
    <div class="doc-card-interactive" style="border: 1.5px dashed #cbd5e1; border-radius: 10px; padding: 14px; background: #f8fafc; display: flex; flex-direction: column; justify-content: space-between; gap: 12px;">
      <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px;">
        <div style="display: flex; align-items: center; gap: 10px; min-width: 0;">
          <div style="width: 38px; height: 38px; border-radius: 8px; background: #f1f5f9; color: #94a3b8; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0;">
            <i class="fa-regular fa-file"></i>
          </div>
          <div style="min-width: 0;">
            <div style="font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;">Bản lý lịch / CV</div>
            <div style="font-size: 13px; font-weight: 500; color: #94a3b8; font-style: italic;">Chưa tải lên CV</div>
          </div>
        </div>
        <span class="badge-tag-sm" style="background: #f1f5f9; color: #64748b; font-weight: normal; flex-shrink: 0;">Chưa nộp</span>
      </div>
      <div class="file-meta-bar" style="margin-top: 4px; padding: 6px 10px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 11.5px; display: flex; align-items: center; justify-content: space-between; gap: 6px;">
        <span class="file-meta-status" style="color: #94a3b8;"><i class="fa-regular fa-circle"></i> Trạng thái: Chưa tải lên</span>
        <span class="file-meta-date" style="color: #94a3b8;"><i class="fa-regular fa-calendar"></i> Ngày tải: --/--/----</span>
      </div>
    </div>
  `;

  // Card Đơn xin thực tập
  const letterCardHtml = hasLetter ? `
    <div class="doc-card-interactive" style="border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px; background: #ffffff; display: flex; flex-direction: column; justify-content: space-between; gap: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
      <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 10px;">
        <div style="display: flex; align-items: center; gap: 10px; min-width: 0;">
          <div style="width: 38px; height: 38px; border-radius: 8px; background: ${letterIcon.bg}; color: ${letterIcon.color}; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0;">
            <i class="${letterIcon.icon}"></i>
          </div>
          <div style="min-width: 0;">
            <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Đơn xin thực tập</div>
            <div style="font-size: 13px; font-weight: 600; color: #1e293b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${intern.docLetterName}">${intern.docLetterName}</div>
          </div>
        </div>
        <button type="button" class="btn-action btn-view" style="flex-shrink: 0; padding: 6px 12px; font-size: 12px;" onclick="closeModal('internDetailModal'); openDocumentModalWithType(${intern.id}, 'letter')" title="Xem chi tiết Đơn xin thực tập">
          <i class="fa-solid fa-eye"></i>
          <span>Xem Đơn</span>
        </button>
      </div>
      <div class="file-meta-bar" style="margin-top: 4px; padding: 6px 10px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; font-size: 11.5px; display: flex; align-items: center; justify-content: space-between; gap: 6px;">
        <span class="file-meta-status uploaded" style="font-weight: 600;"><i class="fa-solid fa-circle-check"></i> Trạng thái:  Đã tải lên</span>
        <span class="file-meta-date uploaded"><i class="fa-regular fa-calendar-check"></i> Ngày tải: ${intern.letterUploadDate || getFormattedUploadDate()}</span>
      </div>
    </div>
  ` : `
    <div class="doc-card-interactive" style="border: 1.5px dashed #cbd5e1; border-radius: 10px; padding: 14px; background: #f8fafc; display: flex; flex-direction: column; justify-content: space-between; gap: 12px;">
      <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px;">
        <div style="display: flex; align-items: center; gap: 10px; min-width: 0;">
          <div style="width: 38px; height: 38px; border-radius: 8px; background: #f1f5f9; color: #94a3b8; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0;">
            <i class="fa-regular fa-file"></i>
          </div>
          <div style="min-width: 0;">
            <div style="font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;">Đơn xin thực tập</div>
            <div style="font-size: 13px; font-weight: 500; color: #94a3b8; font-style: italic;">Chưa tải lên đơn xin thực tập</div>
          </div>
        </div>
        <span class="badge-tag-sm" style="background: #f1f5f9; color: #64748b; font-weight: normal; flex-shrink: 0;">Chưa nộp</span>
      </div>
      <div class="file-meta-bar" style="margin-top: 4px; padding: 6px 10px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 11.5px; display: flex; align-items: center; justify-content: space-between; gap: 6px;">
        <span class="file-meta-status" style="color: #94a3b8;"><i class="fa-regular fa-circle"></i> Trạng thái: Chưa tải lên</span>
        <span class="file-meta-date" style="color: #94a3b8;"><i class="fa-regular fa-calendar"></i> Ngày tải: --/--/----</span>
      </div>
    </div>
  `;

  // Card Hợp đồng thực tập
  let contractStatusText = 'Đã tải lên';
  let contractStatusClass = 'uploaded text-success';
  let contractStatusIcon = 'fa-circle-check';
  let contractBgColor = '#f0fdf4';
  let contractBorderColor = '#bbf7d0';

  if (intern.contractStatus === 'approved') {
    contractStatusText = 'TTS đã đồng ý ký kết';
    contractStatusClass = 'uploaded text-success';
    contractStatusIcon = 'fa-circle-check';
    contractBgColor = '#f0fdf4';
    contractBorderColor = '#bbf7d0';
  } else if (intern.contractStatus === 'rejected') {
    contractStatusText = `TTS từ chối${intern.contractRejectReason ? ' (' + intern.contractRejectReason + ')' : ''}`;
    contractStatusClass = 'text-danger';
    contractStatusIcon = 'fa-circle-xmark';
    contractBgColor = '#fef2f2';
    contractBorderColor = '#fecaca';
  } else {
    contractStatusText = 'Chờ TTS xác nhận';
    contractStatusClass = 'text-warning-emphasis';
    contractStatusIcon = 'fa-clock';
    contractBgColor = '#fffbeb';
    contractBorderColor = '#fde68a';
  }

  const contractStatusBadge = `<span class="badge ${intern.contractStatus === 'approved' ? 'bg-success' : (intern.contractStatus === 'rejected' ? 'bg-danger' : 'bg-warning text-dark')}" style="font-size: 10.5px; padding: 3px 7px;">${intern.contractStatus === 'approved' ? 'Đã ký kết' : (intern.contractStatus === 'rejected' ? 'Đã từ chối' : 'Chờ ký')}</span>`;

  const contractCardHtml = hasContract ? `
    <div class="doc-card-interactive" style="border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px; background: #ffffff; display: flex; flex-direction: column; justify-content: space-between; gap: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
      <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 10px;">
        <div style="display: flex; align-items: center; gap: 10px; min-width: 0;">
          <div style="width: 38px; height: 38px; border-radius: 8px; background: ${contractIcon.bg}; color: ${contractIcon.color}; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0;">
            <i class="${contractIcon.icon}"></i>
          </div>
          <div style="min-width: 0;">
            <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 2px;">
              <span style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Hợp đồng thực tập</span>
              ${contractStatusBadge}
            </div>
            <div style="font-size: 13px; font-weight: 600; color: #1e293b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${intern.docContractName}">${intern.docContractName}</div>
          </div>
        </div>
        <button type="button" class="btn-action btn-view" style="flex-shrink: 0; padding: 6px 12px; font-size: 12px;" onclick="closeModal('internDetailModal'); openDocumentModalWithType(${intern.id}, 'contract')" title="Xem chi tiết Hợp đồng thực tập">
          <i class="fa-solid fa-eye"></i>
          <span>Xem HĐ</span>
        </button>
      </div>
      <div class="file-meta-bar" style="margin-top: 4px; padding: 6px 10px; background: ${contractBgColor}; border: 1px solid ${contractBorderColor}; border-radius: 6px; font-size: 11.5px; display: flex; align-items: center; justify-content: space-between; gap: 6px;">
        <span class="file-meta-status ${contractStatusClass}" style="font-weight: 600;"><i class="fa-solid ${contractStatusIcon}"></i> Trạng thái: ${contractStatusText}</span>
        <span class="file-meta-date uploaded"><i class="fa-regular fa-calendar-check"></i> Ngày tải: ${intern.contractUploadDate || getFormattedUploadDate()}</span>
      </div>
    </div>
  ` : `
    <div class="doc-card-interactive" style="border: 1.5px dashed #cbd5e1; border-radius: 10px; padding: 14px; background: #f8fafc; display: flex; flex-direction: column; justify-content: space-between; gap: 12px;">
      <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px;">
        <div style="display: flex; align-items: center; gap: 10px; min-width: 0;">
          <div style="width: 38px; height: 38px; border-radius: 8px; background: #f1f5f9; color: #94a3b8; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0;">
            <i class="fa-regular fa-file"></i>
          </div>
          <div style="min-width: 0;">
            <div style="font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;">Hợp đồng thực tập</div>
            <div style="font-size: 13px; font-weight: 500; color: #94a3b8; font-style: italic;">Chưa tải lên hợp đồng</div>
          </div>
        </div>
        <span class="badge-tag-sm" style="background: #f1f5f9; color: #64748b; font-weight: normal; flex-shrink: 0;">Chưa nộp</span>
      </div>
      <div class="file-meta-bar" style="margin-top: 4px; padding: 6px 10px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 11.5px; display: flex; align-items: center; justify-content: space-between; gap: 6px;">
        <span class="file-meta-status" style="color: #94a3b8;"><i class="fa-regular fa-circle"></i> Trạng thái: Chưa tải lên</span>
        <span class="file-meta-date" style="color: #94a3b8;"><i class="fa-regular fa-calendar"></i> Ngày tải: --/--/----</span>
      </div>
    </div>
  `;

  if (bodyEl) {
    bodyEl.innerHTML = `
      <div class="detail-card-hero">
        <div class="detail-avatar-circle">${initials}</div>
        <div class="detail-hero-content">
          <h4 class="detail-candidate-name">${intern.name}</h4>
          <div class="detail-candidate-position">
            <i class="fa-solid fa-briefcase" style="margin-right: 6px; color: var(--primary);"></i>${displayPosition}
          </div>
          <div class="detail-badges-row">
            <span class="badge-tag-sm"><i class="fa-solid fa-building" style="margin-right: 4px;"></i>${intern.dept}</span>
            <span class="status-badge ${statusClass}">${intern.status}</span>
          </div>
        </div>
      </div>

      <div class="info-grid">
        <div class="info-item">
          <span class="info-item-label">Mã thực tập sinh</span>
          <span class="info-item-value">#TTS-${String(intern.id).padStart(4, "0")}</span>
        </div>
        <div class="info-item">
          <span class="info-item-label">Vị trí thực tập</span>
          <span class="info-item-value" style="color: var(--primary); font-weight: 700;">
            <i class="fa-solid fa-briefcase" style="margin-right: 6px; color: var(--primary);"></i>${displayPosition}
          </span>
        </div>
        <div class="info-item">
          <span class="info-item-label">Email liên hệ</span>
          <span class="info-item-value">${intern.email || "Chưa cập nhật"}</span>
        </div>
        <div class="info-item">
          <span class="info-item-label">Số điện thoại</span>
          <span class="info-item-value">${intern.phone || "Chưa cập nhật"}</span>
        </div>
        ${intern.birthDate ? `
        <div class="info-item">
          <span class="info-item-label">Ngày sinh</span>
          <span class="info-item-value">${intern.birthDate}</span>
        </div>` : ""}
        <div class="info-item">
          <span class="info-item-label">Trường đại học</span>
          <span class="info-item-value">${intern.school}</span>
        </div>
        <div class="info-item">
          <span class="info-item-label">Chuyên ngành đào tạo</span>
          <span class="info-item-value">${intern.major}</span>
        </div>
        <div class="info-item">
          <span class="info-item-label">Phòng ban tiếp nhận</span>
          <span class="info-item-value">${intern.dept}</span>
        </div>
        <div class="info-item">
          <span class="info-item-label">Người hướng dẫn (Mentor)</span>
          <span class="info-item-value">${intern.mentor}</span>
        </div>
        <div class="info-item" style="grid-column: 1 / -1;">
          <span class="info-item-label">Thời gian thực tập</span>
          <span class="info-item-value"><i class="fa-regular fa-calendar-days" style="margin-right: 6px; color: var(--primary);"></i>${intern.time}</span>
        </div>
      </div>

      <div class="detail-section-block" style="margin-top: 18px;">
        <h5 class="detail-block-title" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
          <span>
            <i class="fa-solid fa-folder-open" style="margin-right: 6px; color: var(--primary);"></i>
            Tài liệu hồ sơ đính kèm (CV, Đơn xin thực tập & Hợp đồng)
          </span>
          <span style="font-size: 12px; font-weight: normal; color: #64748b;">${docCountBadge}</span>
        </h5>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 14px;">
          ${cvCardHtml}
          ${letterCardHtml}
          ${contractCardHtml}
        </div>
      </div>
    `;
  }

  if (footerEl) {
    const canViewDoc = hasPermission('view_docs', 0);
    const canEdit = hasPermission('profile_manage', 2);
    const canDelete = hasPermission('profile_manage', 3);

    footerEl.innerHTML = `
      <button type="button" class="btn-secondary" onclick="closeModal('internDetailModal')">
        <i class="fa-solid fa-xmark"></i>
        <span>Đóng</span>
      </button>
      ${(docCount > 0 && canViewDoc) ? `
      <button type="button" class="btn-action btn-doc" style="padding: 9px 16px;" onclick="closeModal('internDetailModal'); openDocumentModal(${intern.id})">
        <i class="fa-solid fa-file-lines"></i>
        <span>Xem tài liệu đính kèm</span>
      </button>` : ''}
      ${canEdit ? `
      <button type="button" class="btn-primary" onclick="closeModal('internDetailModal'); openEditModal(${intern.id})">
        <i class="fa-solid fa-pen-to-square"></i>
        <span>Chỉnh sửa thông tin</span>
      </button>` : ''}
      ${canDelete ? `
      <button type="button" class="btn-danger" style="background: #ef4444; color: #fff; border: none; padding: 9px 16px; border-radius: 8px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;" onclick="closeModal('internDetailModal'); handleDeleteIntern(${intern.id})">
        <i class="fa-solid fa-trash-can"></i>
        <span>Xóa thực tập sinh</span>
      </button>` : ''}
    `;
  }

  openModal("internDetailModal");
}

window.openViewInternModal = openViewInternModal;

// Mở Modal Chỉnh sửa TTS
async function openEditModal(id) {
  if (typeof hasPermission === 'function' && !hasPermission('profile_manage', 2)) {
    showToast('Bạn không có quyền Chỉnh sửa thông tin thực tập sinh! Quyền đã bị vô hiệu hóa trong CSDL.', 'error');
    return;
  }
  let intern = internList.find((item) => item.id === id);
  if (!intern) {
    intern = applications.find((item) => item.id === id);
  }
  if (!intern) return;

  document.getElementById("editId").value = intern.id;
  document.getElementById("editName").value = intern.name || "";
  if (document.getElementById("editPhone")) {
    document.getElementById("editPhone").value = intern.phone || "";
  }
  document.getElementById("editEmail").value = intern.email || "";
  document.getElementById("editMajor").value = intern.major || "";
  document.getElementById("editSchool").value = intern.school || "";
  if (document.getElementById("editPosition")) {
    document.getElementById("editPosition").value = intern.position || `Thực tập sinh ${intern.major || ''}`;
  }
  document.getElementById("editDept").value = intern.dept || "Kỹ thuật phần mềm";
  const parseDMYtoYMD = (str) => {
    if (!str) return "";
    str = String(str).trim();
    if (str.includes("/")) {
      const parts = str.split("/");
      if (parts.length === 3) {
        return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
    }
    if (str.match(/^\d{4}-\d{2}-\d{2}/)) {
      if (str.includes("T")) {
        const d = new Date(str);
        if (!isNaN(d.getTime())) {
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          return `${y}-${m}-${day}`;
        }
      }
      return str.substring(0, 10);
    }
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    }
    return "";
  };

  let rawStart = intern.startFormatted || intern.start_date || intern.startDate;
  let rawEnd = intern.endFormatted || intern.end_date || intern.endDate;
  if ((!rawStart || !rawEnd) && intern.time && intern.time.includes("-")) {
    const timeParts = intern.time.split("-").map(p => p.trim());
    if (!rawStart && timeParts[0]) rawStart = timeParts[0];
    if (!rawEnd && timeParts[1]) rawEnd = timeParts[1];
  }

  if (document.getElementById("editStartDate")) {
    document.getElementById("editStartDate").value = parseDMYtoYMD(rawStart);
  }
  if (document.getElementById("editEndDate")) {
    document.getElementById("editEndDate").value = parseDMYtoYMD(rawEnd);
  }
  document.getElementById("editStatus").value = intern.status || "Đang thực tập";

  // Đồng bộ chọn Mentor từ danh sách người dùng hệ thống
  const editMentorSelect = document.getElementById("editMentor");
  if (editMentorSelect) {
    if (intern.mentor && !Array.from(editMentorSelect.options).some(o => o.value === intern.mentor)) {
      const opt = document.createElement("option");
      opt.value = intern.mentor;
      opt.textContent = `${intern.mentor} (Hệ thống)`;
      editMentorSelect.appendChild(opt);
    }
    editMentorSelect.value = intern.mentor || "";
  }

  // Reset file inputs & cờ xóa
  if (document.getElementById("editCv")) document.getElementById("editCv").value = "";
  if (document.getElementById("editLetter")) document.getElementById("editLetter").value = "";
  if (document.getElementById("editContract")) document.getElementById("editContract").value = "";

  intern.deleteCvOnSave = false;
  intern.deleteLetterOnSave = false;
  intern.deleteContractOnSave = false;

  // Cập nhật text & icon & meta bar hiển thị tên file tài liệu trong Modal Chỉnh sửa
  updateDocBoxDisplay("editCvBox", "editCvFileName", "editCvClearBtn", intern.docCvName, "Tải lên CV (PDF, DOCX)", intern.cvUploadDate);
  updateDocBoxDisplay("editLetterBox", "editLetterFileName", "editLetterClearBtn", intern.docLetterName, "Tải lên Đơn xin thực tập", intern.letterUploadDate);
  updateDocBoxDisplay("editContractBox", "editContractFileName", "editContractClearBtn", intern.docContractName, "Tải lên Hợp đồng thực tập", intern.contractUploadDate);

  // Tải thông tin hợp đồng thực tế từ MySQL Database để hiển thị trạng thái và lý do từ chối (nếu có)
  const editContractMetaBar = document.getElementById("editContractMetaBar");
  if (editContractMetaBar) {
    editContractMetaBar.innerHTML = '';
    editContractMetaBar.style.display = 'none';
  }
  if (typeof apiGetContracts === 'function') {
    apiGetContracts({ intern_id: intern.id }).then(res => {
      if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
        const c = res.data[0];
        intern.docContractName = c.file_name || 'Hop_Dong_Thuc_Tap.pdf';
        intern.contractFileUrl = c.file_url || intern.contractFileUrl;
        intern.contractUploadDate = c.created_at_formatted || getFormattedUploadDate();
        intern.contractStatus = c.status;
        intern.contractRejectReason = c.reject_reason;

        let statusText = 'Chờ thực tập sinh xác nhận';
        let statusBadgeClass = 'badge bg-warning text-dark';
        if (c.status === 'approved') {
          statusText = `TTS đã ký kết (${c.confirmed_at_formatted || 'Đã xác nhận'})`;
          statusBadgeClass = 'badge bg-success';
        } else if (c.status === 'rejected') {
          statusText = `TTS đã từ chối (${c.reject_reason || 'Không rõ lý do'})`;
          statusBadgeClass = 'badge bg-danger';
        }

        updateDocBoxDisplay("editContractBox", "editContractFileName", "editContractClearBtn", intern.docContractName, "Tải lên Hợp đồng thực tập", intern.contractUploadDate);

        if (editContractMetaBar) {
          editContractMetaBar.innerHTML = `
            <div style="font-size: 12px; margin-top: 6px; padding: 6px 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;">
              <span class="${statusBadgeClass} me-2" style="font-weight: 600;">${statusText}</span>
              <span class="text-secondary">Mã: <b>${c.code}</b></span>
            </div>
          `;
          editContractMetaBar.style.display = 'block';
        }
      }
    }).catch(() => {});
  }

  openModal("editModal");
}

// Xử lý Lưu Chỉnh sửa TTS
async function handleEditSubmit(e) {
  e.preventDefault();
  const id = Number(document.getElementById("editId").value);
  let intern = internList.find((item) => item.id === id);
  if (!intern) {
    intern = applications.find((item) => item.id === id);
  }

  if (intern) {
    intern.name = document.getElementById("editName").value.trim();
    if (document.getElementById("editPhone")) {
      intern.phone = document.getElementById("editPhone").value.trim();
    }
    intern.email = document.getElementById("editEmail").value.trim();
    intern.major = document.getElementById("editMajor").value.trim();
    intern.school = document.getElementById("editSchool").value.trim();
    if (document.getElementById("editPosition")) {
      intern.position = document.getElementById("editPosition").value.trim();
    }
    intern.dept = document.getElementById("editDept").value;
    intern.mentor = document.getElementById("editMentor").value.trim();
    const sDateVal = document.getElementById("editStartDate") ? document.getElementById("editStartDate").value : "";
    const eDateVal = document.getElementById("editEndDate") ? document.getElementById("editEndDate").value : "";
    intern.start_date = sDateVal || null;
    intern.end_date = eDateVal || null;
    intern.startDate = sDateVal || null;
    intern.endDate = eDateVal || null;
    if (sDateVal && eDateVal) {
      const partsS = sDateVal.split('-');
      const partsE = eDateVal.split('-');
      intern.startFormatted = `${partsS[2]}/${partsS[1]}/${partsS[0]}`;
      intern.endFormatted = `${partsE[2]}/${partsE[1]}/${partsE[0]}`;
      intern.time = `${intern.startFormatted} - ${intern.endFormatted}`;
    } else {
      intern.time = "Chưa xếp lịch";
    }
    intern.status = document.getElementById("editStatus").value;

    // Xử lý upload tài liệu mới nếu HR chọn tệp mới
    const editCvInput = document.getElementById("editCv");
    const editLetterInput = document.getElementById("editLetter");
    const editContractInput = document.getElementById("editContract");

    if (editCvInput && editCvInput.files && editCvInput.files[0]) {
      const file = editCvInput.files[0];
      intern.docCvName = file.name;
      intern.cvFileUrl = URL.createObjectURL(file);
      intern.cvUploadDate = editCvInput.dataset.uploadDate || getFormattedUploadDate();
      intern.deleteCvOnSave = false;
      if (typeof apiUploadDocument === 'function') {
        try {
          apiUploadDocument(id, 'CV', file).then(res => {
            if (res && res.data && res.data.fileUrl) intern.cvFileUrl = res.data.fileUrl;
          }).catch(() => {});
        } catch (err) {}
      }
    } else if (intern.deleteCvOnSave) {
      intern.docCvName = null;
      intern.cvFileUrl = null;
      intern.cvUploadDate = null;
      if (typeof apiDeleteDocument === 'function') {
        try {
          apiDeleteDocument(id, 'CV').catch(() => {});
        } catch (err) {}
      }
    }

    if (editLetterInput && editLetterInput.files && editLetterInput.files[0]) {
      const file = editLetterInput.files[0];
      intern.docLetterName = file.name;
      intern.letterFileUrl = URL.createObjectURL(file);
      intern.letterUploadDate = editLetterInput.dataset.uploadDate || getFormattedUploadDate();
      intern.deleteLetterOnSave = false;
      if (typeof apiUploadDocument === 'function') {
        try {
          apiUploadDocument(id, 'APPLICATION_LETTER', file).then(res => {
            if (res && res.data && res.data.fileUrl) intern.letterFileUrl = res.data.fileUrl;
          }).catch(() => {});
        } catch (err) {}
      }
    } else if (intern.deleteLetterOnSave) {
      intern.docLetterName = null;
      intern.letterFileUrl = null;
      intern.letterUploadDate = null;
      if (typeof apiDeleteDocument === 'function') {
        try {
          apiDeleteDocument(id, 'APPLICATION_LETTER').catch(() => {});
        } catch (err) {}
      }
    }

    if (editContractInput && editContractInput.files && editContractInput.files[0]) {
      const file = editContractInput.files[0];
      intern.docContractName = file.name;
      intern.contractUploadDate = editContractInput.dataset.uploadDate || getFormattedUploadDate();
      intern.deleteContractOnSave = false;

      const cCode = `HĐTT-2026-${String(id).padStart(3, '0')}`;
      const contractPayload = {
        intern_id: Number(id),
        code: cCode,
        title: `Hợp đồng thực tập ${intern.dept || intern.position || 'Phát triển phần mềm'}`,
        company: 'Hệ thống Đào tạo CodeGym Việt Nam',
        dept: intern.dept || intern.position || 'Phòng Phát triển Phần mềm',
        period: (intern.startFormatted && intern.endFormatted) ? `${intern.startFormatted} - ${intern.endFormatted}` : '01/03/2026 - 31/05/2026'
      };

      // Tải lên tệp hợp đồng thật vào MySQL Database qua Multer và cập nhật URL
      if (typeof apiCreateContract === 'function') {
        try {
          const res = await apiCreateContract(contractPayload, file);
          if (res && res.success && res.data) {
            intern.contractFileUrl = res.data.file_url;
            intern.docContractName = res.data.file_name || file.name;
            intern.contractStatus = 'pending';
            intern.contractRejectReason = null;
          }
        } catch (e) {
          console.warn('Lỗi tải lên hợp đồng vào MySQL:', e);
        }
      }
    } else if (intern.deleteContractOnSave) {
      intern.docContractName = null;
      intern.contractFileUrl = null;
      intern.contractUploadDate = null;
      intern.contractStatus = null;

      if (typeof apiDeleteContract === 'function') {
        try {
          await apiDeleteContract(id);
        } catch (e) {
          console.warn('Lỗi xóa hợp đồng trên MySQL:', e);
        }
      }
      if (typeof apiDeleteDocument === 'function') {
        try {
          await apiDeleteDocument(id, 'CONTRACT');
        } catch (err) {}
      }
    }

    // Phân tích khoảng thời gian thành startDate và endDate
    let sDate = intern.start_date || intern.startDate || null;
    let eDate = intern.end_date || intern.endDate || null;
    if (!sDate && intern.time && intern.time.includes("-")) {
      const parts = intern.time.split("-").map(p => p.trim());
      const parseDMY = (str) => {
        if (!str) return null;
        if (str.includes("/")) {
          const segs = str.split("/");
          if (segs.length === 3) {
            return `${segs[2]}-${segs[1].padStart(2, '0')}-${segs[0].padStart(2, '0')}`;
          }
        }
        return str;
      };
      if (parts[0]) sDate = parseDMY(parts[0]);
      if (parts[1]) eDate = parseDMY(parts[1]);
    }

    // Cập nhật dữ liệu vào MySQL Database
    if (typeof apiUpdateIntern === 'function') {
      try {
        await apiUpdateIntern(id, {
          name: intern.name,
          email: intern.email,
          phone: intern.phone,
          major: intern.major,
          school: intern.school,
          position: intern.position,
          dept: intern.dept,
          mentor: intern.mentor,
          startDate: sDate,
          endDate: eDate,
          status: intern.status
        });
        console.log('✅ Đã cập nhật thực tập sinh và lịch vào MySQL thành công!');
      } catch (err) {
        console.warn('Lỗi khi cập nhật vào MySQL:', err);
      }
    }

    try {
      localStorage.setItem("codegym_saved_interns", JSON.stringify(internList));
    } catch (e) {}

    closeModal("editModal");
    filterData();
    renderOverview();

    showToast(`Cập nhật thông tin thực tập sinh "${intern.name}" thành công!`, "success");
  }
}

// Xử lý Xóa thực tập sinh (Sử dụng Modal Web, không dùng confirm/alert)
let pendingDeleteInternId = null;

function handleDeleteIntern(id) {
  if (typeof hasPermission === 'function' && !hasPermission('profile_manage', 3)) {
    showToast('Bạn không có quyền Xóa thực tập sinh! Quyền đã bị vô hiệu hóa trong CSDL.', 'error');
    return;
  }
  const intern = internList.find((item) => item.id === id);
  if (!intern) return;

  pendingDeleteInternId = id;
  const msgEl = document.getElementById("deleteConfirmMessage");
  if (msgEl) {
    msgEl.innerHTML = `Bạn có chắc chắn muốn xóa thực tập sinh <strong>"${intern.name}"</strong> khỏi cơ sở dữ liệu?<br><span style="color:#ef4444; font-size:12.5px; margin-top:4px; display:inline-block;">Hành động này không thể hoàn tác.</span>`;
  }

  const btnConfirm = document.getElementById("btnConfirmDeleteIntern");
  if (btnConfirm) {
    btnConfirm.onclick = executeDeleteIntern;
  }

  openModal("deleteConfirmModal");
}

async function executeDeleteIntern() {
  const id = pendingDeleteInternId;
  closeModal("deleteConfirmModal");
  if (!id) return;

  const intern = internList.find((item) => item.id === id);
  const internName = intern ? intern.name : "thực tập sinh";

  if (typeof apiDeleteIntern === 'function') {
    try {
      const res = await apiDeleteIntern(id);
      if (res && res.success) {
        internList = internList.filter((item) => item.id !== id);
        filterData();
        renderOverview();
        showToast(`Đã xóa thực tập sinh "${internName}" khỏi cơ sở dữ liệu MySQL thành công.`, "warning");
        return;
      }
    } catch (e) {
      console.warn('Lỗi khi gọi API xóa:', e);
    }
  }

    internList = internList.filter((item) => item.id !== id);
    try {
      localStorage.setItem("codegym_saved_interns", JSON.stringify(internList));
      let mentors = getMentors();
      let changed = false;
      mentors.forEach(m => {
        if (Array.isArray(m.assignedInternIds) && m.assignedInternIds.some(iId => String(iId) === String(id))) {
          m.assignedInternIds = m.assignedInternIds.filter(iId => String(iId) !== String(id));
          changed = true;
        }
      });
      if (changed) {
        saveMentors(mentors);
        renderMentorStats();
        renderMentorTable();
      }
    } catch (e) {}
    filterData();
    renderOverview();
    showToast(`Đã xóa thực tập sinh "${internName}" khỏi danh sách.`, "warning");
}

// ==========================================================================
// CÁC HÀM TIỆN ÍCH MODAL, TOAST & THÔNG TIN CÁ NHÂN
// ==========================================================================

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add("active");
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove("active");
}

// Rút trích ký tự viết tắt Họ & Tên
function getInitials(name) {
  if (!name) return "TTS";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Hệ thống Toast Notification mượt mà, chuyên nghiệp
function showToast(message, type = "info") {
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
    <div class="toast-content">${message}</div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(30px)";
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3500);
}

// Modal Hồ sơ cá nhân (Profile)
function openProfileModal() {
  document.getElementById("profileName").value = userProfile.name;
  document.getElementById("profileRole").value = userProfile.role;
  document.getElementById("profileEmail").value = userProfile.email;
  document.getElementById("profilePhone").value = userProfile.phone;
  document.getElementById("profileAvatarPreview").src = userProfile.avatar;

  const pwFields = document.getElementById("passwordFields");
  const arrow = document.getElementById("pwArrow");
  if (pwFields) pwFields.classList.remove("show");
  if (arrow) arrow.textContent = "▼";
  document.getElementById("oldPassword").value = "";
  document.getElementById("newPassword").value = "";
  document.getElementById("confirmPassword").value = "";

  openModal("profileModal");
}

function togglePasswordSection() {
  const pwFields = document.getElementById("passwordFields");
  const arrow = document.getElementById("pwArrow");
  if (pwFields) {
    pwFields.classList.toggle("show");
    arrow.textContent = pwFields.classList.contains("show") ? "▲" : "▼";
  }
}

function handleAvatarChange(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      document.getElementById("profileAvatarPreview").src = e.target.result;
      userProfile.avatar = e.target.result;
    };
    reader.readAsDataURL(file);
  }
}

function handleSaveProfile(event) {
  event.preventDefault();
  const newName = document.getElementById("profileName").value.trim();
  const newEmail = document.getElementById("profileEmail").value.trim();
  const newPhone = document.getElementById("profilePhone").value.trim();

  const pwFields = document.getElementById("passwordFields");
  if (pwFields && pwFields.classList.contains("show")) {
    const newPw = document.getElementById("newPassword").value;
    const confirmPw = document.getElementById("confirmPassword").value;
    if (newPw && newPw !== confirmPw) {
      showToast("Xác nhận mật khẩu mới không khớp!", "danger");
      return;
    }
  }

  userProfile.name = newName;
  userProfile.email = newEmail;
  userProfile.phone = newPhone;

  const sidebarName = document.getElementById("sidebarName");
  const sidebarAvatar = document.getElementById("sidebarAvatar");
  if (sidebarName) sidebarName.textContent = newName;
  if (sidebarAvatar) sidebarAvatar.src = userProfile.avatar;

  closeModal("profileModal");
  showToast("Cập nhật thông tin cá nhân HR Manager thành công!", "success");
}

// Đăng xuất HR Manager (Hiển thị Modal Web, không dùng alert/confirm)
let logoutRedirectTimer = null;

function confirmLogout() {
  closeModal("logoutModal");
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("userRole");
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("currentUser");

  showLogoutSuccessModal();
}

function showLogoutSuccessModal() {
  const modalEl = document.getElementById("logoutSuccessModal");
  const progressFill = document.getElementById("logoutProgressFill");

  if (progressFill) {
    progressFill.style.transition = "none";
    progressFill.style.width = "0%";
    void progressFill.offsetWidth; // Force reflow
    progressFill.style.transition = "width 1.2s cubic-bezier(0.4, 0, 0.2, 1)";
    setTimeout(() => {
      progressFill.style.width = "100%";
    }, 50);
  }

  if (modalEl) {
    modalEl.classList.add("active");
  }

  if (logoutRedirectTimer) clearTimeout(logoutRedirectTimer);
  logoutRedirectTimer = setTimeout(() => {
    proceedToLoginPage();
  }, 1250);
}

function proceedToLoginPage() {
  if (logoutRedirectTimer) {
    clearTimeout(logoutRedirectTimer);
    logoutRedirectTimer = null;
  }
  window.location.href = "index.html";
}

// Đóng modal khi bấm ra ngoài vùng dialog hoặc bấm phím Escape
window.addEventListener("click", (e) => {
  if (e.target.classList.contains("modal")) {
    e.target.classList.remove("active");
  }
});

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    document.querySelectorAll(".modal.active").forEach((m) => m.classList.remove("active"));
  }
});

// Khởi chạy khi DOM sẵn sàng
document.addEventListener("DOMContentLoaded", () => {
  // Đồng bộ thông tin người dùng từ localStorage nếu có
  const savedUser = localStorage.getItem("user") || localStorage.getItem("currentUser");
  if (savedUser) {
    try {
      const u = JSON.parse(savedUser);
      if (u.name) userProfile.name = u.name;
      if (u.role) userProfile.role = u.role;
      if (u.email) userProfile.email = u.email;
      if (u.phone) userProfile.phone = u.phone;
      if (u.avatar) userProfile.avatar = u.avatar;

      const sidebarName = document.getElementById("sidebarName");
      const sidebarRole = document.getElementById("sidebarRole");
      const sidebarAvatar = document.getElementById("sidebarAvatar");
      const roleDisplayBadge = document.getElementById("roleDisplayBadge");

      if (sidebarName && u.name) sidebarName.textContent = u.name;
      if (sidebarRole && u.role) sidebarRole.textContent = u.role;
      if (sidebarAvatar && u.avatar) sidebarAvatar.src = u.avatar;
      if (roleDisplayBadge && u.role) roleDisplayBadge.textContent = u.role;
    } catch (e) {}
  }

  // Cập nhật ngày hôm nay
  const todayDisplay = document.getElementById("todayDisplay");
  if (todayDisplay) {
    const now = new Date();
    const d = String(now.getDate()).padStart(2, "0");
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const y = now.getFullYear();
    todayDisplay.textContent = `${d}/${m}/${y}`;
  }

  // Đồng bộ danh sách thực tập sinh đã lưu ở frontend
  try {
    const savedInterns = localStorage.getItem("codegym_saved_interns");
    if (savedInterns) {
      const parsed = JSON.parse(savedInterns);
      if (Array.isArray(parsed) && parsed.length > 0 && internList.length === 0) {
        internList = parsed;
      }
    }
  } catch (e) {}

  // Khởi tạo các bảng dữ liệu
  renderOverview();
  filterReviewData();
  filterData();
  initPrograms();
  renderPrograms();
  initAttendance();

  // Nạp dữ liệu mới nhất từ MySQL Database
  loadInternsFromDB();

  // Nạp danh sách Mentor hệ thống từ MySQL Database
  loadSystemMentors();

  // Đồng bộ và áp dụng ma trận phân quyền từ MySQL Database (User Story 40)
  applyRolePermissionsToDashboard();
});

// ==========================================
// ĐỒNG BỘ VÀ ÁP DỤNG PHÂN QUYỀN VAI TRÒ TỪ MYSQL (User Story 40)
// ==========================================
async function applyRolePermissionsToDashboard() {
  let meRes = null;
  try {
    if (typeof apiGetMe === 'function') {
      meRes = await apiGetMe();
    }
  } catch (e) {
    console.warn('Lỗi gọi apiGetMe:', e);
  }

  // Tự động chuyển hướng nếu người dùng là Mentor (đã có cổng riêng mentor.html)
  const savedRole = localStorage.getItem('userRole');
  if (savedRole === 'Mentor' || savedRole === 'MENTOR') {
    window.location.href = 'mentor.html';
    return;
  }

  // Tự động kết nối lấy token từ MySQL nếu chưa có phiên đăng nhập hợp lệ
  if (!meRes || !meRes.success || !meRes.user) {
    const roleForLogin = savedRole || 'HR Manager';
    let defaultEmail = 'hr@company.vn';
    if (roleForLogin === 'Admin' || roleForLogin === 'ADMIN') defaultEmail = 'admin@company.vn';
    else if (roleForLogin === 'INTERN' || roleForLogin === 'Thực tập sinh') defaultEmail = 'intern@student.vn';

    try {
      if (typeof apiLogin === 'function') {
        const loginRes = await apiLogin(defaultEmail, '123456');
        if (loginRes && loginRes.success && loginRes.token) {
          localStorage.setItem('token', loginRes.token);
          localStorage.setItem('user', JSON.stringify(loginRes.user));
          localStorage.setItem('userRole', loginRes.user.role);
          if (typeof apiGetMe === 'function') {
            meRes = await apiGetMe();
          }
        }
      }
    } catch (e) {
      console.warn('Lỗi tự động kết nối tài khoản DB:', e);
    }
  }

  if (meRes && meRes.success && meRes.user) {
    CurrentSessionUser = meRes.user;
    DashboardPermissions = meRes.permissions;
    
    // Đồng bộ lại vào localStorage
    localStorage.setItem('user', JSON.stringify(meRes.user));
    localStorage.setItem('userRole', meRes.user.role);

    // Cập nhật thông tin Profile trên giao diện từ CSDL MySQL thực tế
    const sidebarName = document.getElementById("sidebarName");
    const sidebarRole = document.getElementById("sidebarRole");
    const sidebarAvatar = document.getElementById("sidebarAvatar");
    const roleDisplay = document.getElementById("sidebarRoleDisplay");
    const roleDisplayBadge = document.getElementById("roleDisplayBadge");

    if (sidebarName && meRes.user.name) sidebarName.textContent = meRes.user.name;
    if (sidebarAvatar && meRes.user.avatar) sidebarAvatar.src = meRes.user.avatar;
    if (sidebarRole && meRes.user.role) sidebarRole.textContent = meRes.user.role;
    if (roleDisplayBadge && meRes.user.role) roleDisplayBadge.textContent = meRes.user.role;
    if (roleDisplay) {
      if (meRes.user.role === 'Mentor') roleDisplay.textContent = 'Mentor (Người hướng dẫn)';
      else if (meRes.user.role === 'Admin') roleDisplay.textContent = 'Quản trị viên (Admin)';
      else roleDisplay.textContent = 'HR Manager';
    }
  } else {
    // Dự phòng: Lấy trực tiếp từ apiGetAdminPermissions theo roleKey
    const role = localStorage.getItem('userRole') || 'HR Manager';
    const roleKey = (role === 'Mentor' || role === 'MENTOR') ? 'Mentor' : ((role === 'Admin' || role === 'ADMIN') ? 'Admin' : 'HR Manager');
    try {
      if (typeof apiGetAdminPermissions === 'function') {
        const res = await apiGetAdminPermissions(roleKey);
        if (res && res.success && res.permissions) {
          DashboardPermissions = res.permissions;
        }
      }
    } catch (e) {}
  }

  if (!DashboardPermissions) return;

  // 1. Phân quyền Xét duyệt hồ sơ (review_docs):
  const canViewReview = hasPermission('review_docs', 0);
  const navReview = document.getElementById('navReview');
  if (navReview) {
    if (!canViewReview) {
      navReview.style.display = 'none';
      if (currentTab === 'review') {
        switchTab('overview');
      }
    } else {
      navReview.style.display = '';
    }
  }

  // 2. Phân quyền Quản lý hồ sơ thực tập sinh (profile_manage):
  const canCreateIntern = hasPermission('profile_manage', 1);
  const addButtons = document.querySelectorAll('[onclick="openAddModal()"], .btn-add-intern, #btnAddIntern');
  addButtons.forEach(btn => {
    btn.style.display = canCreateIntern ? '' : 'none';
  });

  // 3. Phân quyền Tìm kiếm / lọc (search_intern):
  const canSearch = hasPermission('search_intern', 0);
  const searchInput = document.getElementById('searchInput');
  const schoolFilter = document.getElementById('schoolFilter');
  const majorFilter = document.getElementById('majorFilter');
  if (searchInput) {
    searchInput.disabled = !canSearch;
    if (!canSearch) searchInput.placeholder = 'Tính năng tìm kiếm đã bị Admin vô hiệu hóa';
  }
  if (schoolFilter) schoolFilter.disabled = !canSearch;
  if (majorFilter) majorFilter.disabled = !canSearch;

  // 4. Nếu là Mentor, thêm huy hiệu chào mừng Mentor
  const activeRole = CurrentSessionUser ? CurrentSessionUser.role : (localStorage.getItem('userRole') || 'HR Manager');
  if (activeRole === 'Mentor') {
    const welcomeHeader = document.querySelector('.header-title h1');
    if (welcomeHeader && !welcomeHeader.innerHTML.includes('Mentor')) {
      welcomeHeader.innerHTML += ' <span class="badge bg-info text-dark ms-2" style="font-size: 13px; vertical-align: middle;">Chế độ Mentor</span>';
    }
  }

  // 5. Cập nhật lại các bảng dữ liệu để áp dụng quyền Sửa / Xóa / Duyệt mới nhất
  filterData();
  filterReviewData();
}

// ==========================================
// ĐỒNG BỘ DỮ LIỆU VỚI BACKEND MYSQL
// ==========================================
async function loadInternsFromDB() {
  try {
    if (typeof apiGetInterns === 'function') {
      const res = await apiGetInterns();
      if (res && res.success && Array.isArray(res.data)) {
        // Phân loại thực tập sinh và ứng viên chờ duyệt:
        // QUY TẮC: Khi không có file upload nào (document_count === 0), ứng viên KHÔNG hiện ở mục xét duyệt bên HR
        const apps = res.data.filter(i => {
          const docCount = Number(i.document_count || 0);
          return (i.status === 'Chờ xét duyệt' && docCount > 0) || i.status === 'Đã từ chối';
        });
        const active = res.data.filter(i => i.status === 'Đang thực tập' || i.status === 'Hoàn thành' || i.status === 'Kết thúc');

        internList = active.map(i => ({
          id: i.id,
          name: i.name,
          email: i.email,
          major: i.major,
          school: i.school,
          dept: i.dept,
          mentor: i.mentor,
          mentor_id: i.mentor_id || null,
          startDate: i.start_date,
          endDate: i.end_date,
          start_date: i.start_date,
          end_date: i.end_date,
          startFormatted: i.startFormatted,
          endFormatted: i.endFormatted,
          time: i.time || 'Chưa xếp lịch',
          status: i.status || 'Đang thực tập',
          phone: i.phone,
          position: i.position || `Thực tập sinh ${i.major || ''}`,
          skills: i.skills,
          bio: i.bio,
          docCvName: i.cv_doc_name || null,
          docLetterName: i.letter_doc_name || null,
          cvFileUrl: i.cv_file_url || null,
          letterFileUrl: i.letter_file_url || null,
          docContractName: i.contract_file_name || null,
          contractFileUrl: i.contract_file_url || null,
          contractStatus: i.contract_status || null,
          contractCode: i.contract_code || null,
          contractTitle: i.contract_title || null,
          contractUploadDate: i.contract_created_at_formatted || null,
          contractRejectReason: i.contract_reject_reason || null
        }));

        applications = apps.map(i => ({
          id: i.id,
          name: i.name,
          email: i.email,
          phone: i.phone,
          school: i.school,
          major: i.major,
          gpa: i.gpa ? `${i.gpa} / 4.0` : '',
          dept: i.dept,
          mentor: i.mentor,
          mentor_id: i.mentor_id || null,
          position: i.position || `Thực tập sinh ${i.major || ''}`,
          appliedDate: i.appliedDate || '',
          startDate: i.start_date,
          endDate: i.end_date,
          start_date: i.start_date,
          end_date: i.end_date,
          startFormatted: i.startFormatted,
          endFormatted: i.endFormatted,
          status: i.status,
          rejectReason: i.reject_reason || '',
          rejectNote: i.reject_note || '',
          docCvName: i.cv_doc_name || null,
          docLetterName: i.letter_doc_name || null,
          cvFileUrl: i.cv_file_url || null,
          letterFileUrl: i.letter_file_url || null,
          docContractName: i.contract_file_name || null,
          contractFileUrl: i.contract_file_url || null,
          contractStatus: i.contract_status || null,
          contractCode: i.contract_code || null,
          contractTitle: i.contract_title || null,
          contractUploadDate: i.contract_created_at_formatted || null,
          contractRejectReason: i.contract_reject_reason || null,
          skills: i.skills || '',
          bio: i.bio || '',
          projects: i.projects || ''
        }));

        renderOverview();
        filterReviewData();
        filterData();
        renderPrograms();
        if (typeof renderAttendanceSheet === "function") {
          renderAttendanceSheet();
        }
        if (typeof renderReportsTab === "function" && document.getElementById("reportsTab") && document.getElementById("reportsTab").classList.contains("active")) {
          renderReportsTab();
        }
        console.log(`✅ Đã nạp thành công ${res.data.length} bản ghi từ MySQL Database!`);
      }
    }
  } catch (err) {
    console.warn('⚠️ Lỗi khi tải dữ liệu từ API:', err);
  }
}
window.loadInternsFromDB = loadInternsFromDB;

// ==========================================================================
// 15. CHỨC NĂNG CHƯƠNG TRÌNH THỰC TẬP (INTERNSHIP PROGRAMS) - 0% DỮ LIỆU GIẢ
// ==========================================================================
let internshipPrograms = [];
let selectedProgramId = null;

// Hàm tiện ích: Chuyển chuỗi ngày tháng sang timestamp
function parseDateStrToTimestamp(dStr) {
  if (!dStr) return null;
  if (typeof dStr === "string" && dStr.includes("-")) {
    const cleanStr = dStr.split("T")[0];
    const parts = cleanStr.split("-");
    if (parts.length === 3) {
      return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])).getTime();
    }
  }
  if (typeof dStr === "string" && dStr.includes("/")) {
    const parts = dStr.split("/");
    if (parts.length === 3) {
      return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0])).getTime();
    }
  }
  const parsed = new Date(dStr).getTime();
  return isNaN(parsed) ? null : parsed;
}

// Hàm tính tiến độ % theo thời gian thực tế
function calculateDynamicProgress(startDateStr, endDateStr) {
  const start = parseDateStrToTimestamp(startDateStr);
  const end = parseDateStrToTimestamp(endDateStr);
  if (!start || !end || end <= start) return 0;

  const now = Date.now();
  if (now <= start) return 0;
  if (now >= end) return 100;
  return Math.round(((now - start) / (end - start)) * 100);
}

// Khởi tạo và đồng bộ chương trình thực tập (Kết nối MySQL & dự phòng LocalStorage)
function initPrograms() {
  try {
    localStorage.removeItem("codegym_hr_custom_programs");
    const old = localStorage.getItem("codegym_hr_programs");
    if (old) {
      try {
        const parsed = JSON.parse(old);
        if (Array.isArray(parsed)) {
          internshipPrograms = parsed.filter(p => p && p.isUserCreated === true && !p.id.includes("prog_ktpm"));
        } else {
          internshipPrograms = [];
        }
      } catch (err) {
        internshipPrograms = [];
      }
    } else {
      internshipPrograms = [];
    }
  } catch (e) {
    internshipPrograms = [];
  }

  // Tự động tải danh sách chương trình từ MySQL Database
  if (typeof apiGetPrograms === 'function') {
    apiGetPrograms().then(res => {
      if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
        internshipPrograms = res.data.map(p => ({
          id: 'prog_' + p.id,
          dbId: p.id,
          name: p.name,
          dept: p.dept,
          positions: `Thực tập sinh ${p.dept}`,
          mentor: p.mentor_default || 'Chưa phân công',
          startDate: p.start_date ? p.start_date.split('T')[0] : '2026-07-01',
          endDate: p.end_date ? p.end_date.split('T')[0] : '2026-09-30',
          startDateFormatted: p.start_date ? new Date(p.start_date).toLocaleDateString('vi-VN') : '01/07/2026',
          endDateFormatted: p.end_date ? new Date(p.end_date).toLocaleDateString('vi-VN') : '30/09/2026',
          capacity: p.max_interns || 10,
          status: p.status || 'active',
          progress: 50,
          desc: p.description || '',
          schedule: getProgramSchedule('prog_' + p.id),
          isUserCreated: true
        }));
        if (!selectedProgramId && internshipPrograms.length > 0) {
          selectedProgramId = internshipPrograms[0].id;
        }
        localStorage.setItem("codegym_hr_programs", JSON.stringify(internshipPrograms));
        renderPrograms();
        populateAttendanceProgramFilter();
      }
    }).catch(() => {});
  }

  if (internshipPrograms.length > 0) {
    if (!selectedProgramId || !internshipPrograms.some(p => p.id === selectedProgramId)) {
      selectedProgramId = internshipPrograms[0].id;
    }
  } else {
    selectedProgramId = null;
  }
}

// Lấy danh sách thực tập sinh THẬT trong hệ thống thuộc phòng ban của chương trình
function getInternsForDept(dept) {
  if (!dept) return [];
  const deptNorm = dept.toLowerCase().trim();

  const allCandidates = [
    ...(Array.isArray(internList) ? internList : []),
    ...(Array.isArray(applications) ? applications : [])
  ];

  const seen = new Set();
  return allCandidates.filter(item => {
    if (!item.id || seen.has(item.id)) return false;
    seen.add(item.id);

    const iDept = (item.dept || "").toLowerCase().trim();
    return iDept && deptNorm && (iDept.includes(deptNorm) || deptNorm.includes(iDept));
  });
}

function getInternsForProgram(prog) {
  if (!prog) return [];
  return getInternsForDept(prog.dept);
}

// Render giao diện Chương trình thực tập
function renderPrograms() {
  const container = document.getElementById("programsCardsContainer");
  const detailGrid = document.getElementById("programDetailGrid");
  const scheduleTimeline = document.getElementById("programScheduleTimeline");
  const actionsEl = document.getElementById("programDetailActions");

  if (!container) return;

  // Nếu chưa có chương trình nào: hiển thị trạng thái trống, TUYỆT ĐỐI KHÔNG TỰ BỊA DỮ LIỆU GIẢ
  if (!internshipPrograms || internshipPrograms.length === 0) {
    container.innerHTML = `
      <div style="padding: 50px 30px; text-align: center; background: #ffffff; border-radius: 14px; border: 1.5px dashed #cbd5e1;">
        <div style="width: 56px; height: 56px; border-radius: 50%; background: #f8fafc; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; color: #94a3b8;">
          <i class="fa-regular fa-calendar-xmark fa-2x"></i>
        </div>
        <h3 style="font-size: 16px; font-weight: 700; color: #1e293b; margin-bottom: 6px;">Chưa có chương trình thực tập nào</h3>
        <p style="font-size: 13.5px; color: #64748b; margin-bottom: 20px; max-width: 440px; margin-left: auto; margin-right: auto; line-height: 1.5;">
          Hiện tại hệ thống chưa có chương trình thực tập nào. Nhấn vào nút <strong>"+ Tạo chương trình"</strong> phía trên để thiết lập chương trình mới.
        </p>
        <button type="button" class="btn-primary" onclick="openCreateProgramModal()" style="margin: 0 auto;">
          <i class="fa-solid fa-plus"></i>
          <span>Tạo chương trình</span>
        </button>
      </div>
    `;

    if (detailGrid) {
      detailGrid.innerHTML = `
        <div style="text-align: center; padding: 36px 16px; color: #94a3b8; font-size: 13.5px;">
          <i class="fa-solid fa-circle-info" style="margin-right: 6px;"></i>
          Vui lòng tạo hoặc chọn một chương trình để xem chi tiết
        </div>
      `;
    }
    if (scheduleTimeline) {
      scheduleTimeline.innerHTML = `
        <div class="schedule-empty-state">
          <div class="schedule-empty-icon-wrap">
            <i class="fa-regular fa-file-lines"></i>
          </div>
          <div class="schedule-empty-title">Chưa có lịch trình</div>
          <div class="schedule-empty-desc">Thêm các mốc quan trọng của chương trình.</div>
        </div>
      `;
    }
    const subTitleEl = document.getElementById("programScheduleSubtitle");
    if (subTitleEl) subTitleEl.textContent = "0 hoạt động";
    if (actionsEl) actionsEl.style.display = "none";
    return;
  }

  // Đảm bảo selectedProgramId hợp lệ
  let currentProg = internshipPrograms.find(p => p.id === selectedProgramId);
  if (!currentProg) {
    currentProg = internshipPrograms[0];
    selectedProgramId = currentProg.id;
  }

  // 1. Render danh sách thẻ bên trái
  container.innerHTML = internshipPrograms.map(prog => {
    const isSelected = prog.id === selectedProgramId;
    let badgeClass = "program-badge-running";
    if (prog.status === "Sắp diễn ra") badgeClass = "program-badge-upcoming";
    else if (prog.status === "Đã kết thúc") badgeClass = "program-badge-ended";

    // Lấy số lượng TTS thực tế trong DB thuộc phòng ban này
    const realInterns = getInternsForProgram(prog);
    const enrolled = realInterns.length;
    const capacityText = prog.capacity ? `${enrolled}/${prog.capacity} thực tập sinh` : `${enrolled} thực tập sinh`;

    // Tính tiến độ từ ngày bắt đầu & kết thúc nếu có
    const progress = calculateDynamicProgress(prog.startDate, prog.endDate) || Number(prog.progress || 0);

    const timeText = (prog.startDateFormatted || prog.endDateFormatted)
      ? `${prog.startDateFormatted || 'Chưa xếp'} - ${prog.endDateFormatted || 'Chưa xếp'}`
      : 'Chưa xếp lịch';

    const subText = prog.mentor
      ? `${prog.dept} · Mentor: ${prog.mentor}`
      : prog.dept;

    return `
      <div class="program-card ${isSelected ? 'active' : ''}" onclick="selectProgram('${prog.id}')">
        <div class="program-card-header">
          <h3 class="program-card-title">${prog.name}</h3>
          <span class="program-card-badge ${badgeClass}">${prog.status || 'Đang diễn ra'}</span>
        </div>
        <div class="program-card-sub">
          ${subText}
        </div>
        <div class="program-card-meta">
          <span>${timeText}</span>
          <span>${capacityText}</span>
        </div>
        <div class="program-progress-container">
          <div class="program-progress-header">
            <span>Tiến độ chương trình</span>
            <span class="program-progress-pct">${progress}%</span>
          </div>
          <div class="program-progress-track">
            <div class="program-progress-bar" style="width: ${progress}%;"></div>
          </div>
        </div>
      </div>
    `;
  }).join("");

  // 2. Render Chi tiết chương trình bên phải
  if (detailGrid && currentProg) {
    const realInterns = getInternsForProgram(currentProg);
    const countDisplay = currentProg.capacity ? `${realInterns.length}/${currentProg.capacity} người` : `${realInterns.length} người`;

    let statusColor = "#10b981";
    if (currentProg.status === "Sắp diễn ra") statusColor = "#2563eb";
    else if (currentProg.status === "Đã kết thúc") statusColor = "#64748b";

    detailGrid.innerHTML = `
      <div class="program-info-row">
        <span class="program-info-label">Phòng ban</span>
        <span class="program-info-value">${currentProg.dept}</span>
      </div>
      <div class="program-info-row">
        <span class="program-info-label">Vị trí</span>
        <span class="program-info-value">${currentProg.positions || 'Chưa cập nhật'}</span>
      </div>
      <div class="program-info-row">
        <span class="program-info-label">Mô tả</span>
        <span class="program-info-value">${currentProg.desc || 'Chưa cập nhật'}</span>
      </div>
      <div class="program-info-row">
        <span class="program-info-label">Mentor phụ trách</span>
        <span class="program-info-value">${currentProg.mentor || 'Chưa phân công'}</span>
      </div>
      <div class="program-info-row">
        <span class="program-info-label">Bắt đầu</span>
        <span class="program-info-value">${currentProg.startDateFormatted || 'Chưa xếp lịch'}</span>
      </div>
      <div class="program-info-row">
        <span class="program-info-label">Kết thúc</span>
        <span class="program-info-value">${currentProg.endDateFormatted || 'Chưa xếp lịch'}</span>
      </div>
      <div class="program-info-row">
        <span class="program-info-label">Số TTS</span>
        <span class="program-info-value">${countDisplay}</span>
      </div>
      <div class="program-info-row">
        <span class="program-info-label">Trạng thái</span>
        <span class="program-info-value" style="color: ${statusColor}; font-weight: 600;">${currentProg.status || 'Đang diễn ra'}</span>
      </div>
    `;
  }

  // 3. Render Lịch trình dự kiến (theo mẫu thẻ giai đoạn & hoạt động chuẩn Screenshot 1)
  if (currentProg) {
    if (!currentProg.schedule || currentProg.schedule.length === 0) {
      currentProg.schedule = getProgramSchedule(currentProg.id);
    }
  }

  const schedCount = (currentProg && Array.isArray(currentProg.schedule)) ? currentProg.schedule.length : 0;
  const subtitleEl = document.getElementById("programScheduleSubtitle");
  if (subtitleEl) {
    subtitleEl.textContent = `${schedCount} hoạt động`;
  }

  if (scheduleTimeline) {
    if (schedCount > 0) {
      scheduleTimeline.innerHTML = currentProg.schedule.map((item, idx) => {
        if (item.name || item.startDate) {
          let badgeClass = "sched-badge-upcoming";
          if (item.status === "Đang diễn ra") badgeClass = "sched-badge-active";
          else if (item.status === "Đã hoàn thành") badgeClass = "sched-badge-done";
          else if (item.status === "Đã hủy") badgeClass = "sched-badge-cancelled";

          const startFormatted = formatScheduleDateTime(item.startDate);
          const endFormatted = formatScheduleDateTime(item.endDate);
          const timeDisplay = (startFormatted && endFormatted) 
            ? `${startFormatted} – ${endFormatted}` 
            : (startFormatted || endFormatted || 'Chưa xếp thời gian');

          return `
            <div class="sched-activity-item">
              <div class="sched-activity-header">
                <div class="sched-activity-title-group">
                  <h4 class="sched-activity-name">${item.name || 'Hoạt động'}</h4>
                  <span class="sched-status-badge ${badgeClass}">${item.status || 'Sắp diễn ra'}</span>
                </div>
                <button type="button" class="btn-remove-stage" onclick="removeScheduleActivity('${item.id || idx}')" title="Xóa lịch trình">
                  <i class="fa-solid fa-trash-can"></i>
                </button>
              </div>
              ${item.desc ? `<div class="sched-activity-desc">${item.desc}</div>` : ''}
              <div class="sched-activity-meta-grid">
                <div class="sched-meta-item">
                  <i class="fa-regular fa-calendar-check text-primary"></i>
                  <span>${timeDisplay}</span>
                </div>
                <div class="sched-meta-item">
                  <i class="fa-solid fa-location-dot text-danger"></i>
                  <span>${item.format || 'Trực tiếp'}${item.location ? ' · ' + item.location : ''}</span>
                </div>
                ${item.inCharge ? `
                <div class="sched-meta-item">
                  <i class="fa-regular fa-user text-muted"></i>
                  <span>Phụ trách: <strong>${item.inCharge}</strong></span>
                </div>` : ''}
                ${item.target ? `
                <div class="sched-meta-item">
                  <i class="fa-solid fa-users text-info"></i>
                  <span>Đối tượng: ${item.target}</span>
                </div>` : ''}
              </div>
            </div>
          `;
        } else {
          const numStr = String(idx + 1).padStart(2, "0");
          const stageHeader = item.title 
            ? `${item.week ? item.week + '  ' : ''}${item.title}`
            : item.week;
          return `
            <div class="schedule-stage-card" style="margin-bottom: 8px; padding: 10px 14px;">
              <div class="stage-num-badge" style="width: 32px; height: 32px; font-size: 13px;">${numStr}</div>
              <div class="stage-info">
                <div class="stage-title" style="font-size: 13px;">${stageHeader}</div>
                <div class="stage-desc" style="font-size: 12.5px;">${item.desc || ''}</div>
              </div>
              <button type="button" class="btn-remove-stage" onclick="removeScheduleActivity('${idx}')" title="Xóa giai đoạn">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </div>
          `;
        }
      }).join("");
    } else {
      scheduleTimeline.innerHTML = `
        <div class="schedule-empty-state">
          <div class="schedule-empty-icon-wrap">
            <i class="fa-regular fa-file-lines"></i>
          </div>
          <div class="schedule-empty-title">Chưa có lịch trình</div>
          <div class="schedule-empty-desc">Thêm các mốc quan trọng của chương trình.</div>
        </div>
      `;
    }
  }

  if (actionsEl) actionsEl.style.display = "flex";
}

function selectProgram(id) {
  selectedProgramId = id;
  renderPrograms();
}

// Quản lý giai đoạn lịch trình trong Modal (mặc định để trống hoàn toàn)
let currentModalStages = [];

function renderModalStages() {
  const container = document.getElementById("progFormStagesContainer");
  if (!container) return;

  if (!currentModalStages || currentModalStages.length === 0) {
    container.innerHTML = `
      <div class="stages-empty-box">
        <div style="font-size: 13px; color: #94a3b8;">
          <i class="fa-regular fa-calendar-xmark me-1"></i> Chưa có giai đoạn nào được thêm vào lịch trình.
        </div>
      </div>
    `;
    return;
  }

  container.innerHTML = currentModalStages.map((stage, idx) => {
    const numStr = String(idx + 1).padStart(2, "0");
    const stageHeader = stage.title 
      ? `${stage.week ? stage.week + '  ' : ''}${stage.title}`
      : stage.week;

    return `
      <div class="schedule-stage-card">
        <div class="stage-num-badge">${numStr}</div>
        <div class="stage-info">
          <div class="stage-title">${stageHeader}</div>
          <div class="stage-desc">${stage.desc || ''}</div>
        </div>
        <button type="button" class="btn-remove-stage" onclick="removeModalStage(${idx})" title="Xóa giai đoạn">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </div>
    `;
  }).join("");
}

function toggleAddStageForm(show) {
  const form = document.getElementById("stageAddForm");
  const btn = document.getElementById("btnToggleAddStage");
  if (!form) return;

  const willShow = show !== undefined ? show : (form.style.display === "none");
  form.style.display = willShow ? "block" : "none";
  if (btn) btn.style.display = willShow ? "none" : "inline-flex";

  if (willShow) {
    const elW = document.getElementById("newStageWeek");
    const elT = document.getElementById("newStageTitle");
    const elD = document.getElementById("newStageDesc");
    if (elW) elW.value = "";
    if (elT) elT.value = "";
    if (elD) elD.value = "";
    if (elW) elW.focus();
  }
}

function confirmAddStage() {
  const weekEl = document.getElementById("newStageWeek");
  const titleEl = document.getElementById("newStageTitle");
  const descEl = document.getElementById("newStageDesc");

  const week = weekEl ? weekEl.value.trim() : "";
  const title = titleEl ? titleEl.value.trim() : "";
  const desc = descEl ? descEl.value.trim() : "";

  if (!week && !title && !desc) {
    showToast("Vui lòng nhập thông tin cho giai đoạn!", "warning");
    return;
  }

  currentModalStages.push({
    week: week || "Giai đoạn",
    title: title || "",
    desc: desc || ""
  });

  renderModalStages();
  toggleAddStageForm(false);
}

function removeModalStage(idx) {
  if (idx >= 0 && idx < currentModalStages.length) {
    currentModalStages.splice(idx, 1);
    renderModalStages();
  }
}

// ==========================================
// QUẢN LÝ LỊCH TRÌNH CHƯƠNG TRÌNH (MODAL 19 & SCREENSHOTS)
// Không có dữ liệu cứng, dữ liệu mặc định để trống hoàn toàn (User request)
// ==========================================

function getProgramSchedule(progId) {
  if (!progId) return [];
  try {
    const raw = localStorage.getItem("codegym_hr_schedule_" + progId);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}
  return [];
}

function saveProgramSchedule(progId, scheduleList) {
  if (!progId) return;
  try {
    localStorage.setItem("codegym_hr_schedule_" + progId, JSON.stringify(scheduleList));
  } catch (e) {}
}

function formatScheduleDateTime(dtStr) {
  if (!dtStr) return "";
  try {
    const d = new Date(dtStr);
    if (isNaN(d.getTime())) return dtStr;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${mins}`;
  } catch (e) {
    return dtStr;
  }
}

function openAddScheduleModal() {
  const form = document.getElementById("scheduleActivityForm");
  if (form) form.reset();

  // Nạp danh sách chương trình thực tập vào select
  const progSelect = document.getElementById("schedProgramSelect");
  if (progSelect) {
    if (!internshipPrograms || internshipPrograms.length === 0) {
      progSelect.innerHTML = `<option value="">Chưa có chương trình nào trong hệ thống</option>`;
      updateScheduleProgramInfo("");
    } else {
      progSelect.innerHTML = `<option value="">Chọn chương trình thực tập...</option>` +
        internshipPrograms.map(p => `<option value="${p.id}">${p.name}</option>`).join("");
      
      // Mặc định chọn chương trình đang xem nếu có
      if (selectedProgramId && internshipPrograms.some(p => p.id === selectedProgramId)) {
        progSelect.value = selectedProgramId;
        updateScheduleProgramInfo(selectedProgramId);
      } else if (internshipPrograms.length > 0) {
        progSelect.value = internshipPrograms[0].id;
        updateScheduleProgramInfo(internshipPrograms[0].id);
      }
    }
  }

  // Nạp danh sách tài khoản phụ trách: Mentor và HR Manager
  const inChargeSelect = document.getElementById("schedInCharge");
  if (inChargeSelect) {
    const mentors = getAvailableMentors();
    let optionsHtml = `<option value="">Chọn tài khoản phụ trách</option>`;
    
    // Tài khoản HR hiện tại
    const hrName = (userProfile && userProfile.name) ? userProfile.name : "Nguyễn Thị Hoa";
    optionsHtml += `<option value="${hrName}">${hrName} (HR Manager)</option>`;

    // Các Mentor trong hệ thống
    mentors.forEach(m => {
      optionsHtml += `<option value="${m}">${m} (Mentor)</option>`;
    });

    inChargeSelect.innerHTML = optionsHtml;
  }

  // DỮ LIỆU ĐỂ TRỐNG HOÀN TOÀN (KHÔNG CÓ DỮ LIỆU CỨNG GIẢ LẬP)
  const actName = document.getElementById("schedActivityName");
  const actDesc = document.getElementById("schedActivityDesc");
  const actStart = document.getElementById("schedStartDate");
  const actEnd = document.getElementById("schedEndDate");
  const actTarget = document.getElementById("schedTarget");
  const actFormat = document.getElementById("schedFormat");
  const actLocation = document.getElementById("schedLocation");
  const actReminder = document.getElementById("schedReminder");
  const actStatus = document.getElementById("schedStatus");
  const actNotify = document.getElementById("schedSendNotify");

  if (actName) actName.value = "";
  if (actDesc) actDesc.value = "";
  if (actStart) actStart.value = "";
  if (actEnd) actEnd.value = "";
  if (actTarget) actTarget.value = "Cả hai";
  if (actFormat) actFormat.value = "Trực tiếp";
  if (actLocation) actLocation.value = "";
  if (actReminder) actReminder.value = "15 phút";
  if (actStatus) actStatus.value = "Sắp diễn ra";
  if (actNotify) actNotify.checked = true;

  openModal("addScheduleModal");
}

function handleSchedProgramChange(val) {
  updateScheduleProgramInfo(val);
}

function updateScheduleProgramInfo(programId) {
  const deptEl = document.getElementById("schedBoxDept");
  const mentorEl = document.getElementById("schedBoxMentor");
  const timeEl = document.getElementById("schedBoxTime");

  const prog = internshipPrograms.find(p => p.id === programId);
  if (!prog) {
    if (deptEl) deptEl.textContent = "--";
    if (mentorEl) mentorEl.textContent = "--";
    if (timeEl) timeEl.textContent = "Thời gian chương trình: --";
    return;
  }

  if (deptEl) deptEl.textContent = prog.dept || "Chưa cập nhật";
  if (mentorEl) mentorEl.textContent = prog.mentor || "Chưa phân công";

  const timeStr = (prog.startDateFormatted || prog.endDateFormatted)
    ? `${prog.startDateFormatted || 'Chưa xếp'} – ${prog.endDateFormatted || 'Chưa xếp'}`
    : (prog.startDate && prog.endDate ? `${prog.startDate} – ${prog.endDate}` : 'Chưa xếp thời gian');

  if (timeEl) timeEl.textContent = `Thời gian chương trình: ${timeStr}`;
}

function handleSaveScheduleActivity(e) {
  e.preventDefault();

  const progId = document.getElementById("schedProgramSelect").value;
  if (!progId) {
    showToast("Vui lòng chọn chương trình thực tập!", "warning");
    return;
  }

  const prog = internshipPrograms.find(p => p.id === progId);
  if (!prog) {
    showToast("Chương trình thực tập không hợp lệ!", "danger");
    return;
  }

  const name = document.getElementById("schedActivityName").value.trim();
  const desc = document.getElementById("schedActivityDesc").value.trim();
  const startDate = document.getElementById("schedStartDate").value;
  const endDate = document.getElementById("schedEndDate").value;
  const target = document.getElementById("schedTarget").value;
  const inCharge = document.getElementById("schedInCharge").value;
  const format = document.getElementById("schedFormat").value;
  const location = document.getElementById("schedLocation").value.trim();
  const reminder = document.getElementById("schedReminder").value;
  const status = document.getElementById("schedStatus").value;
  const sendNotify = document.getElementById("schedSendNotify").checked;

  if (!name) {
    showToast("Vui lòng nhập tên hoạt động!", "warning");
    return;
  }
  if (!desc) {
    showToast("Vui lòng nhập nội dung mô tả!", "warning");
    return;
  }
  if (!startDate || !endDate) {
    showToast("Vui lòng chọn thời gian bắt đầu và kết thúc!", "warning");
    return;
  }
  if (!inCharge) {
    showToast("Vui lòng chọn tài khoản phụ trách!", "warning");
    return;
  }

  if (new Date(startDate) > new Date(endDate)) {
    showToast("Ngày kết thúc phải diễn ra sau ngày bắt đầu!", "warning");
    return;
  }

  const newActivity = {
    id: "act_" + Date.now(),
    name: name,
    desc: desc,
    programId: progId,
    startDate: startDate,
    endDate: endDate,
    target: target,
    inCharge: inCharge,
    format: format,
    location: location,
    reminder: reminder,
    status: status,
    sendNotify: sendNotify,
    createdAt: new Date().toISOString()
  };

  if (!Array.isArray(prog.schedule)) {
    prog.schedule = [];
  }
  prog.schedule.push(newActivity);

  // Lưu lịch trình theo từng chương trình vào localStorage
  saveProgramSchedule(progId, prog.schedule);

  // Đồng bộ lại internshipPrograms
  try {
    localStorage.setItem("codegym_hr_programs", JSON.stringify(internshipPrograms));
  } catch (err) {}

  // Gửi thông báo nếu người dùng tích chọn
  if (sendNotify) {
    try {
      const notifs = JSON.parse(localStorage.getItem('codegym_notifications') || '[]');
      notifs.unshift({
        id: Date.now(),
        title: `Lịch trình mới: ${name}`,
        message: `Hoạt động "${name}" đã được xếp lịch cho đối tượng "${target}".`,
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        type: 'schedule',
        read: false
      });
      localStorage.setItem('codegym_notifications', JSON.stringify(notifs));
    } catch (err) {}
  }

  closeModal("addScheduleModal");
  showToast("Lưu lịch trình chương trình thành công!", "success");

  // Hiển thị chương trình vừa thêm lịch
  selectedProgramId = progId;
  renderPrograms();
}

function removeScheduleActivity(actId) {
  const currentProg = internshipPrograms.find(p => p.id === selectedProgramId);
  if (!currentProg || !Array.isArray(currentProg.schedule)) return;

  const idx = currentProg.schedule.findIndex((item, i) => String(item.id || i) === String(actId));
  if (idx !== -1) {
    currentProg.schedule.splice(idx, 1);
    saveProgramSchedule(currentProg.id, currentProg.schedule);
    try {
      localStorage.setItem("codegym_hr_programs", JSON.stringify(internshipPrograms));
    } catch (err) {}
    renderPrograms();
    showToast("Đã xóa hoạt động khỏi lịch trình.", "info");
  }
}

// ==========================================
// QUẢN LÝ DANH SÁCH MENTOR TỪ HỆ THỐNG
// ==========================================
let systemMentors = [];

async function loadSystemMentors() {
  try {
    if (typeof apiGetAdminUsers === 'function') {
      const res = await apiGetAdminUsers({ role: 'Mentor' });
      const list = (res && (res.users || res.data)) ? (res.users || res.data) : [];
      if (res && res.success && Array.isArray(list) && list.length > 0) {
        systemMentors = list;
      }
    }
  } catch (e) {
    console.warn('Lỗi tải danh sách Mentor từ hệ thống:', e);
  }

  if (!systemMentors || systemMentors.length === 0) {
    systemMentors = [];
  }

  populateMentorDropdowns();
}

function populateMentorDropdowns() {
  const optionsHtml = systemMentors.map(m => 
    `<option value="${m.name}">${m.name} (${m.email || 'Mentor'})</option>`
  ).join('');

  // 1. Thêm TTS modal (#addMentor)
  const addMentor = document.getElementById('addMentor');
  if (addMentor) {
    const curVal = addMentor.value;
    addMentor.innerHTML = `<option value="">-- Chọn Mentor trong hệ thống --</option>` + optionsHtml;
    if (curVal) addMentor.value = curVal;
  }

  // 2. Sửa TTS modal (#editMentor)
  const editMentor = document.getElementById('editMentor');
  if (editMentor) {
    const curVal = editMentor.value;
    editMentor.innerHTML = `<option value="">-- Chọn Mentor trong hệ thống --</option>` + optionsHtml;
    if (curVal) editMentor.value = curVal;
  }

  // 3. Chương trình thực tập modal (#progFormMentor)
  const progMentor = document.getElementById('progFormMentor');
  if (progMentor) {
    const curVal = progMentor.value;
    progMentor.innerHTML = `<option value="">Chọn Mentor trong danh sách...</option>` + optionsHtml;
    if (curVal) progMentor.value = curVal;
  }
}

function getAvailableMentors() {
  const fromSavedMentors = getMentors().map(m => m.name);
  if (fromSavedMentors && fromSavedMentors.length > 0) {
    return [...new Set(fromSavedMentors)].filter(Boolean);
  }
  if (systemMentors && systemMentors.length > 0) {
    return systemMentors.map(m => m.name).filter(Boolean).filter(m => m !== 'Chưa phân công' && m !== '—');
  }
  const fromInterns = Array.isArray(internList) ? internList.map(i => i.mentor) : [];
  return [...new Set(fromInterns)].filter(Boolean).filter(m => m !== 'Chưa phân công' && m !== '—');
}

function openCreateProgramModal() {
  document.getElementById("progFormId").value = "";
  document.getElementById("progFormName").value = "";
  document.getElementById("progFormPositions").value = "";
  document.getElementById("progFormDesc").value = "";
  document.getElementById("progFormStartDate").value = "";
  document.getElementById("progFormEndDate").value = "";
  document.getElementById("progFormCapacity").value = "";
  document.getElementById("progFormProgress").value = "";
  document.getElementById("progFormStatus").value = "Đang diễn ra";

  // Lấy danh sách các phòng ban thực tế từ cơ sở dữ liệu
  const deptSelect = document.getElementById("progFormDept");
  if (deptSelect) {
    const dbDepts = [...new Set([
      ...(Array.isArray(internList) ? internList.map(i => i.dept) : []),
      ...(Array.isArray(applications) ? applications.map(i => i.dept) : [])
    ])].filter(d => d && d !== "Chưa phân bổ" && d !== "Chưa cập nhật");

    const defaultDepts = ["Kỹ thuật phần mềm", "Marketing", "Nhân sự", "Tài chính"];
    const allDepts = [...new Set([...dbDepts, ...defaultDepts])];

    deptSelect.innerHTML = allDepts.map(d => `<option value="${d}">${d}</option>`).join("");
    deptSelect.value = allDepts[0] || "Kỹ thuật phần mềm";
  }

  // Tự động đếm số lượng TTS thực tế hiện có trong phòng ban này
  const curDept = deptSelect ? deptSelect.value : "Kỹ thuật phần mềm";
  const realInterns = getInternsForDept(curDept);
  const enrolledEl = document.getElementById("progFormEnrolled");
  if (enrolledEl) enrolledEl.value = realInterns.length;

  // Nạp danh sách Mentor và ĐỂ TRỐNG (0% dữ liệu giả)
  const mentorSelect = document.getElementById("progFormMentor");
  if (mentorSelect) {
    const mentors = getAvailableMentors();
    mentorSelect.innerHTML = `
      <option value="">Chọn Mentor trong danh sách...</option>
      ${mentors.map(m => `<option value="${m}">${m}</option>`).join("")}
    `;
    mentorSelect.value = "";
  }

  // Cập nhật thông tin HR phụ trách
  const hrNameEl = document.getElementById("progFormHRName");
  const hrAvatarEl = document.getElementById("progFormHRAvatar");
  try {
    const uStr = localStorage.getItem("user");
    if (uStr) {
      const u = JSON.parse(uStr);
      if (u && u.name) {
        if (hrNameEl) hrNameEl.textContent = u.name;
        if (hrAvatarEl) hrAvatarEl.textContent = getInitials(u.name) || "H";
      } else {
        if (hrNameEl) hrNameEl.textContent = "Nguyễn Thị Hoa";
        if (hrAvatarEl) hrAvatarEl.textContent = "H";
      }
    }
  } catch (e) {
    if (hrNameEl) hrNameEl.textContent = "Nguyễn Thị Hoa";
    if (hrAvatarEl) hrAvatarEl.textContent = "H";
  }

  // Khởi tạo danh sách giai đoạn LÀ MẢNG RỖNG (để trống dữ liệu, không có dữ liệu giả)
  currentModalStages = [];
  renderModalStages();
  toggleAddStageForm(false);

  document.getElementById("programModalTitle").textContent = "TẠO CHƯƠNG TRÌNH THỰC TẬP MỚI";
  openModal("programModal");
}

function openEditCurrentProgramModal() {
  const prog = internshipPrograms.find(p => p.id === selectedProgramId);
  if (!prog) return;

  document.getElementById("progFormId").value = prog.id;
  document.getElementById("progFormName").value = prog.name || "";

  const deptSelect = document.getElementById("progFormDept");
  if (deptSelect) {
    const dbDepts = [...new Set([
      ...(Array.isArray(internList) ? internList.map(i => i.dept) : []),
      ...(Array.isArray(applications) ? applications.map(i => i.dept) : [])
    ])].filter(d => d && d !== "Chưa phân bổ" && d !== "Chưa cập nhật");

    const defaultDepts = ["Kỹ thuật phần mềm", "Marketing", "Nhân sự", "Tài chính"];
    const allDepts = [...new Set([...dbDepts, ...defaultDepts, prog.dept].filter(Boolean))];

    deptSelect.innerHTML = allDepts.map(d => `<option value="${d}">${d}</option>`).join("");
    deptSelect.value = prog.dept || allDepts[0];
  }

  document.getElementById("progFormPositions").value = prog.positions || "";
  document.getElementById("progFormDesc").value = prog.desc || "";

  const mentorSelect = document.getElementById("progFormMentor");
  if (mentorSelect) {
    const mentors = getAvailableMentors();
    if (prog.mentor && !mentors.includes(prog.mentor)) mentors.push(prog.mentor);
    mentorSelect.innerHTML = `
      <option value="">Chọn Mentor trong danh sách...</option>
      ${mentors.map(m => `<option value="${m}">${m}</option>`).join("")}
    `;
    mentorSelect.value = prog.mentor || "";
  }

  document.getElementById("progFormStartDate").value = prog.startDate || "";
  document.getElementById("progFormEndDate").value = prog.endDate || "";
  document.getElementById("progFormCapacity").value = prog.capacity || "";

  const realInterns = getInternsForDept(prog.dept);
  const enrolledEl = document.getElementById("progFormEnrolled");
  if (enrolledEl) enrolledEl.value = realInterns.length;

  document.getElementById("progFormStatus").value = prog.status || "Đang diễn ra";
  document.getElementById("progFormProgress").value = prog.progress !== undefined ? prog.progress : "";

  currentModalStages = Array.isArray(prog.schedule) ? JSON.parse(JSON.stringify(prog.schedule)) : [];
  renderModalStages();
  toggleAddStageForm(false);

  document.getElementById("programModalTitle").textContent = "CHỈNH SỬA CHƯƠNG TRÌNH THỰC TẬP";
  openModal("programModal");
}

function onProgramDeptChange() {
  const dept = document.getElementById("progFormDept").value;
  const enrolledInput = document.getElementById("progFormEnrolled");
  if (enrolledInput) {
    const realInterns = getInternsForDept(dept);
    enrolledInput.value = realInterns.length;
  }
}

function handleProgramFormSubmit(e) {
  e.preventDefault();

  const id = document.getElementById("progFormId").value;
  const name = document.getElementById("progFormName").value.trim();
  const dept = document.getElementById("progFormDept").value;
  const positions = document.getElementById("progFormPositions").value.trim();
  const desc = document.getElementById("progFormDesc").value.trim();
  const mentor = document.getElementById("progFormMentor").value.trim();
  const startDate = document.getElementById("progFormStartDate").value;
  const endDate = document.getElementById("progFormEndDate").value;
  const capacity = document.getElementById("progFormCapacity").value ? Number(document.getElementById("progFormCapacity").value) : null;
  const status = document.getElementById("progFormStatus").value;

  const formatD = (dStr) => {
    if (!dStr) return "";
    const parts = dStr.split("-");
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return dStr;
  };

  const startDateFormatted = formatD(startDate);
  const endDateFormatted = formatD(endDate);

  let progressInput = document.getElementById("progFormProgress").value;
  let progress = progressInput !== "" ? Number(progressInput) : calculateDynamicProgress(startDate, endDate);

  const progData = {
    id: id || `prog_${Date.now()}`,
    name,
    dept,
    positions,
    desc,
    mentor,
    startDate,
    endDate,
    startDateFormatted,
    endDateFormatted,
    capacity,
    status,
    progress,
    schedule: currentModalStages.length > 0 ? currentModalStages : [],
    isUserCreated: true
  };

  if (id) {
    const idx = internshipPrograms.findIndex(p => p.id === id);
    if (idx >= 0) {
      internshipPrograms[idx] = progData;
      showToast(`Đã cập nhật chương trình "${name}" thành công!`, "success");
    }
  } else {
    internshipPrograms.unshift(progData);
    selectedProgramId = progData.id;
    showToast(`Đã tạo chương trình thực tập "${name}" thành công!`, "success");

    // Lưu vào MySQL Database
    if (typeof apiCreateProgram === 'function') {
      apiCreateProgram({
        name,
        dept,
        mentor_default: mentor,
        start_date: startDate,
        end_date: endDate,
        max_interns: capacity,
        description: desc
      }).then(res => {
        if (res && res.data) progData.dbId = res.data.id;
      }).catch(err => console.warn('Lỗi lưu chương trình vào MySQL:', err));
    }
  }

  try {
    localStorage.setItem("codegym_hr_programs", JSON.stringify(internshipPrograms));
  } catch (err) {}

  closeModal("programModal");
  renderPrograms();
}

function handleDeleteProgram() {
  if (!selectedProgramId) return;
  const prog = internshipPrograms.find(p => p.id === selectedProgramId);
  const name = prog ? prog.name : "chương trình này";

  internshipPrograms = internshipPrograms.filter(p => p.id !== selectedProgramId);
  selectedProgramId = internshipPrograms.length > 0 ? internshipPrograms[0].id : null;

  try {
    localStorage.setItem("codegym_hr_programs", JSON.stringify(internshipPrograms));
  } catch (err) {}

  renderPrograms();
  showToast(`Đã xóa chương trình "${name}" thành công!`, "warning");
}

function openProgramInternsModal() {
  const prog = internshipPrograms.find(p => p.id === selectedProgramId);
  if (!prog) return;

  const modalTitle = document.getElementById("programInternsModalTitle");
  const modalSub = document.getElementById("programInternsModalSub");
  const tbody = document.getElementById("programInternsTableBody");
  const countNote = document.getElementById("programInternsCountNote");
  const assignSelect = document.getElementById("assignInternSelect");

  if (modalTitle) modalTitle.textContent = `DANH SÁCH THỰC TẬP SINH - ${prog.name}`;
  if (modalSub) modalSub.textContent = `Phòng ban: ${prog.dept}${prog.mentor ? ' | Mentor: ' + prog.mentor : ''}`;

  const interns = getInternsForProgram(prog);

  if (countNote) {
    countNote.innerHTML = `Hệ thống ghi nhận <strong>${interns.length}</strong> thực tập sinh thuộc phòng ban <strong>${prog.dept}</strong> trong cơ sở dữ liệu.`;
  }

  // Cập nhật danh sách thực tập sinh có thể phân công vào chương trình & lịch
  if (assignSelect) {
    const assignedIds = new Set(interns.map(i => i.id));
    const available = internList.filter(i => !assignedIds.has(i.id));
    if (available.length === 0) {
      assignSelect.innerHTML = `<option value="">-- Tất cả TTS đã được xếp vào chương trình này --</option>`;
      assignSelect.disabled = true;
    } else {
      assignSelect.disabled = false;
      assignSelect.innerHTML = `<option value="">-- Chọn thực tập sinh (${available.length} khả dụng) --</option>` +
        available.map(i => `<option value="${i.id}">${i.name} (${i.school} - ${i.dept || 'Chưa phân bổ'}) [${i.status}]</option>`).join("");
    }
  }

  if (tbody) {
    if (interns.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 40px; color: #64748b;">
            <i class="fa-solid fa-user-slash fa-2x" style="color: #cbd5e1; margin-bottom: 10px; display: block;"></i>
            Hiện chưa có thực tập sinh nào thuộc phòng ban <strong>${prog.dept}</strong> trong chương trình này.<br>
            <span style="font-size: 12.5px; color: #94a3b8;">Bạn có thể chọn thực tập sinh ở ô phía trên và nhấn "Thêm vào lịch & chương trình".</span>
          </td>
        </tr>
      `;
    } else {
      tbody.innerHTML = interns.map(i => {
        let statusBadge = `<span class="status-badge status-active">Đang thực tập</span>`;
        if (i.status === "Chờ xét duyệt") {
          statusBadge = `<span class="status-badge status-pending">Chờ xét duyệt</span>`;
        } else if (i.status === "Đã từ chối") {
          statusBadge = `<span class="status-badge status-rejected">Đã từ chối</span>`;
        } else if (i.status === "Hoàn thành" || i.status === "Kết thúc") {
          statusBadge = `<span class="status-badge status-finished">Hoàn thành</span>`;
        }

        const initials = getInitials(i.name);
        const timeText = i.time || (i.startFormatted && i.endFormatted ? `${i.startFormatted} - ${i.endFormatted}` : (prog.period || 'Chưa xếp lịch'));

        return `
          <tr>
            <td>
              <div class="candidate-cell">
                <div class="candidate-avatar-badge blue">${initials}</div>
                <div class="intern-meta">
                  <span class="intern-name">${i.name}</span>
                  <span class="intern-sub">${i.email || 'Chưa có email'} ${i.phone ? '· ' + i.phone : ''}</span>
                </div>
              </div>
            </td>
            <td>
              <div><strong>${i.school}</strong></div>
              <div style="font-size: 12px; color: #64748b;">${i.major}</div>
            </td>
            <td>${i.position || 'Thực tập sinh'}</td>
            <td>${i.mentor || prog.mentor || 'Chưa phân công'}</td>
            <td><i class="fa-regular fa-calendar-days" style="margin-right: 5px; color: var(--primary);"></i>${timeText}</td>
            <td>${statusBadge}</td>
            <td style="text-align: center;">
              <div style="display: flex; gap: 6px; justify-content: center;">
                <button type="button" class="btn-action btn-edit" style="padding: 4px 8px; border-radius: 6px; font-size: 12px;" onclick="openEditModal(${i.id}); closeModal('programInternsModal');" title="Điều chỉnh lịch hoặc mentor">
                  <i class="fa-solid fa-pen-to-square"></i>
                </button>
                <button type="button" class="btn-action btn-danger" style="background: #fee2e2; color: #dc2626; border: 1px solid #fca5a5; padding: 4px 8px; border-radius: 6px; font-size: 12px;" onclick="handleRemoveInternFromProgram(${i.id})" title="Rút khỏi chương trình & lịch">
                  <i class="fa-solid fa-user-minus"></i>
                </button>
              </div>
            </td>
          </tr>
        `;
      }).join("");
    }
  }

  openModal("programInternsModal");
}

// Phân công thực tập sinh vào chương trình & lịch thực tập (US 11, 12, 13)
async function handleAssignInternToCurrentProgram() {
  const prog = internshipPrograms.find(p => p.id === selectedProgramId);
  if (!prog) {
    showToast("Vui lòng chọn một chương trình thực tập trước!", "warning");
    return;
  }
  const select = document.getElementById("assignInternSelect");
  if (!select || !select.value) {
    showToast("Vui lòng chọn một thực tập sinh từ danh sách để phân công!", "warning");
    return;
  }
  const internId = Number(select.value);
  let intern = internList.find(i => i.id === internId);
  if (!intern) {
    intern = applications.find(i => i.id === internId);
  }
  if (!intern) return;

  const periodText = prog.period || (prog.startDate && prog.endDate ? `${prog.startDate} - ${prog.endDate}` : '01/03/2026 - 31/05/2026');
  
  intern.dept = prog.dept;
  intern.mentor = prog.mentor || intern.mentor || "Chưa phân công";
  intern.time = periodText;
  intern.status = "Đang thực tập";

  // Cập nhật vào MySQL Database
  if (typeof apiUpdateIntern === 'function') {
    try {
      await apiUpdateIntern(internId, {
        dept: prog.dept,
        mentor: prog.mentor || intern.mentor || "Chưa phân công",
        startDate: prog.startDate || '2026-03-01',
        endDate: prog.endDate || '2026-05-31',
        status: "Đang thực tập"
      });
      console.log(`✅ Đã phân công TTS ID ${internId} vào chương trình ${prog.name} và lưu MySQL!`);
    } catch (err) {
      console.warn("Lỗi cập nhật TTS vào chương trình:", err);
    }
  }

  showToast(`Đã thêm thực tập sinh "${intern.name}" vào chương trình "${prog.name}" và lịch thực tập thành công!`, "success");
  filterData();
  renderOverview();
  renderPrograms();
  openProgramInternsModal();
}

// Rút thực tập sinh khỏi chương trình & lịch
async function handleRemoveInternFromProgram(internId) {
  const intern = internList.find(i => i.id === internId);
  if (!intern) return;

  intern.dept = "Chưa phân bổ";
  intern.time = "Chưa xếp lịch";

  if (typeof apiUpdateIntern === 'function') {
    try {
      await apiUpdateIntern(internId, {
        dept: "Chưa phân bổ"
      });
    } catch (err) {}
  }

  showToast(`Đã rút thực tập sinh "${intern.name}" khỏi chương trình!`, "info");
  filterData();
  renderOverview();
  renderPrograms();
  openProgramInternsModal();
}

window.handleAssignInternToCurrentProgram = handleAssignInternToCurrentProgram;
window.handleRemoveInternFromProgram = handleRemoveInternFromProgram;

function goToFilteredInternsTab() {
  const prog = internshipPrograms.find(p => p.id === selectedProgramId);
  closeModal("programInternsModal");
  switchTab("interns");

  if (prog && prog.dept) {
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
      searchInput.value = prog.dept;
      filterData();
    }
    showToast(`Đã lọc danh sách thực tập sinh theo phòng ban "${prog.dept}"`, "info");
  }
}

// Gắn vào window để gọi từ HTML
window.initPrograms = initPrograms;
window.renderPrograms = renderPrograms;
window.selectProgram = selectProgram;
window.openCreateProgramModal = openCreateProgramModal;
window.openEditCurrentProgramModal = openEditCurrentProgramModal;
window.onProgramDeptChange = onProgramDeptChange;
window.handleProgramFormSubmit = handleProgramFormSubmit;
window.handleDeleteProgram = handleDeleteProgram;
window.openProgramInternsModal = openProgramInternsModal;
window.renderModalStages = renderModalStages;
window.toggleAddStageForm = toggleAddStageForm;
window.confirmAddStage = confirmAddStage;
window.removeModalStage = removeModalStage;
window.goToFilteredInternsTab = goToFilteredInternsTab;

// ==========================================================================
// 16. CHỨC NĂNG CHẤM CÔNG & THỜI GIAN (ATTENDANCE & TIME TRACKING) - 0% DỮ LIỆU GIẢ
// ==========================================================================

// Biến lưu trữ dữ liệu chấm công và đơn nghỉ phép (Mặc định để trống hoàn toàn 100%)
let attendanceRecords = {};
let leaveRequests = [];
let currentAttSubtab = "sheet";
let currentAttDates = []; // Mảng chứa các đối tượng ngày đang hiển thị trên bảng

// Cấu hình mã trạng thái chấm công tương ứng chú giải
const ATTENDANCE_STATUS_MAP = {
  present: { code: "Đ", text: "Đúng giờ", chipClass: "chip-present" },
  late: { code: "T", text: "Đi trễ", chipClass: "chip-late" },
  absent: { code: "V", text: "Vắng mặt", chipClass: "chip-absent" },
  leave: { code: "P", text: "Nghỉ phép", chipClass: "chip-leave" },
  remote: { code: "R", text: "Làm việc từ xa", chipClass: "chip-remote" },
  empty: { code: "—", text: "Chưa có dữ liệu", chipClass: "chip-empty" }
};

// Tải bảng chấm công và danh sách đơn nghỉ phép trực tiếp từ MySQL Database (Không phụ thuộc vào cookie/localStorage)
async function loadAttendanceFromDB() {
  if (typeof apiGetAttendance === 'function') {
    try {
      const res = await apiGetAttendance();
      attendanceRecords = {};
      if (res && res.success && Array.isArray(res.data)) {
        res.data.forEach(row => {
          const dKey = row.date.includes('T') ? row.date.split('T')[0] : row.date;
          if (!attendanceRecords[row.intern_id]) attendanceRecords[row.intern_id] = {};
          attendanceRecords[row.intern_id][dKey] = row.status;
        });
      }
    } catch (e) {
      console.warn('Lỗi tải bảng chấm công từ MySQL:', e);
    }
  }

  if (typeof apiGetLeaves === 'function') {
    try {
      const res = await apiGetLeaves();
      if (res && res.success && Array.isArray(res.data)) {
        leaveRequests = res.data.map(l => ({
          id: l.id,
          internId: l.intern_id,
          internName: l.intern_name,
          program: l.intern_dept || "Kỹ thuật phần mềm",
          startDate: l.start_date.split('T')[0],
          endDate: l.end_date.split('T')[0],
          days: l.days_count,
          reason: l.reason,
          submittedAt: l.created_at ? new Date(l.created_at).toLocaleDateString('vi-VN') : '',
          status: l.status === 'approved' ? 'Đã duyệt' : (l.status === 'rejected' ? 'Từ chối' : 'Chờ duyệt')
        }));
      } else {
        leaveRequests = [];
      }
    } catch (e) {
      console.warn('Lỗi tải danh sách nghỉ phép từ MySQL:', e);
    }
  }
}

// Khởi tạo trạng thái Chấm công & Đơn nghỉ phép từ MySQL Database
async function initAttendance() {
  attendanceRecords = {};
  leaveRequests = [];
  initAttendanceFilters();
  await loadAttendanceFromDB();
  if (currentAttSubtab === "sheet") {
    renderAttendanceSheet();
  } else {
    renderLeaveRequests();
  }
}

// Chuyển đổi Subtab: Bảng chấm công (sheet) vs Đơn nghỉ phép (leaves)
async function switchAttendanceSubtab(subtab) {
  currentAttSubtab = subtab;
  const btnSheet = document.getElementById("btnSubtabSheet");
  const btnLeaves = document.getElementById("btnSubtabLeaves");
  const sheetView = document.getElementById("attendanceSheetView");
  const leavesView = document.getElementById("attendanceLeavesView");

  await loadAttendanceFromDB();

  if (subtab === "sheet") {
    if (btnSheet) btnSheet.classList.add("active");
    if (btnLeaves) btnLeaves.classList.remove("active");
    if (sheetView) sheetView.style.display = "block";
    if (leavesView) leavesView.style.display = "none";
    renderAttendanceSheet();
  } else {
    if (btnSheet) btnSheet.classList.remove("active");
    if (btnLeaves) btnLeaves.classList.add("active");
    if (sheetView) sheetView.style.display = "none";
    if (leavesView) leavesView.style.display = "block";
    renderLeaveRequests();
  }
}

// Khởi tạo các ô lọc ngày tháng và chương trình
function initAttendanceFilters() {
  const monthSelect = document.getElementById("attFilterMonth");
  const yearSelect = document.getElementById("attFilterYear");
  const startInput = document.getElementById("attFilterStartDate");
  const endInput = document.getElementById("attFilterEndDate");

  const today = new Date();
  const curMonth = today.getMonth() + 1;
  const curYear = today.getFullYear();

  if (monthSelect) monthSelect.value = String(curMonth);
  if (yearSelect) yearSelect.value = String(curYear);

  // Tính toán khoảng ngày trong tuần hiện tại (từ Thứ 2 đến Thứ 6 / Chủ nhật)
  const dayOfWeek = today.getDay(); // 0 is Sunday, 1 is Monday...
  const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(today);
  monday.setDate(today.getDate() + distanceToMonday);

  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);

  const formatYMD = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  if (startInput && !startInput.value) {
    startInput.value = formatYMD(monday);
  }
  if (endInput && !endInput.value) {
    endInput.value = formatYMD(friday);
  }

  // Nạp danh sách chương trình thực tế vào bộ lọc
  populateAttendanceProgramFilter();
}

// Nạp danh sách chương trình vào filter
function populateAttendanceProgramFilter() {
  const progSelect = document.getElementById("attFilterProgram");
  if (!progSelect) return;

  const currentVal = progSelect.value;
  progSelect.innerHTML = `<option value="">Tất cả chương trình</option>`;

  // Tập hợp danh sách tên chương trình hoặc phòng ban thực tế từ internList và internshipPrograms
  const programNames = new Set();
  if (Array.isArray(internshipPrograms)) {
    internshipPrograms.forEach(p => {
      if (p.name) programNames.add(p.name);
      else if (p.dept) programNames.add(p.dept);
    });
  }
  if (Array.isArray(internList)) {
    internList.forEach(i => {
      if (i.dept) programNames.add(i.dept);
    });
  }

  programNames.forEach(pName => {
    const opt = document.createElement("option");
    opt.value = pName;
    opt.textContent = pName;
    progSelect.appendChild(opt);
  });

  if (currentVal) progSelect.value = currentVal;
}

// Khi người dùng đổi Tháng hoặc Năm ở dropdown
function onAttendanceDateFilterChange() {
  const monthSelect = document.getElementById("attFilterMonth");
  const yearSelect = document.getElementById("attFilterYear");
  const startInput = document.getElementById("attFilterStartDate");
  const endInput = document.getElementById("attFilterEndDate");

  if (!monthSelect || !yearSelect || !startInput || !endInput) return;

  const month = parseInt(monthSelect.value, 10);
  const year = parseInt(yearSelect.value, 10);

  // Mặc định chọn tuần đầu hoặc khoảng ngày phù hợp của tháng
  const startDate = new Date(year, month - 1, 1);
  let dayOfWeek = startDate.getDay();
  if (dayOfWeek === 0) startDate.setDate(2);
  else if (dayOfWeek === 6) startDate.setDate(3);

  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 5);

  const formatYMD = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  startInput.value = formatYMD(startDate);
  endInput.value = formatYMD(endDate);

  renderAttendanceSheet();
}

// Áp dụng bộ lọc
function applyAttendanceFilter() {
  renderAttendanceSheet();
  showToast("Đã cập nhật bảng chấm công theo bộ lọc", "info");
}

// Helper: Lấy danh sách các ngày trong khoảng
function getDatesInRange(startStr, endStr) {
  const dates = [];
  if (!startStr || !endStr) return dates;

  let curr = new Date(startStr);
  const end = new Date(endStr);
  const todayNow = new Date();
  const todayStr = `${todayNow.getFullYear()}-${String(todayNow.getMonth() + 1).padStart(2, '0')}-${String(todayNow.getDate()).padStart(2, '0')}`;

  // Giới hạn tối đa 31 ngày
  let count = 0;
  while (curr <= end && count < 31) {
    const y = curr.getFullYear();
    const m = String(curr.getMonth() + 1).padStart(2, "0");
    const d = String(curr.getDate()).padStart(2, "0");
    const dateKey = `${y}-${m}-${d}`;
    const dayOfWeek = curr.getDay(); // 0: CN, 1: T2, 2: T3...

    const dayLabels = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    const isToday = (dateKey === todayStr);

    dates.push({
      dateKey,
      dateFormatted: `${d}/${m}`,
      dayLabel: dayLabels[dayOfWeek],
      isToday
    });

    curr.setDate(curr.getDate() + 1);
    count++;
  }
  return dates;
}

// Render toàn bộ Tab Chấm công & Thời gian
async function renderAttendanceTab() {
  populateAttendanceProgramFilter();
  await loadAttendanceFromDB();
  if (currentAttSubtab === "leaves") {
    renderLeaveRequests();
  } else {
    renderAttendanceSheet();
  }
}

// Render Bảng Chấm Công (Hình 1)
function renderAttendanceSheet() {
  const thead = document.getElementById("attTableHead");
  const tbody = document.getElementById("attTableBody");
  if (!thead || !tbody) return;

  const startInput = document.getElementById("attFilterStartDate");
  const endInput = document.getElementById("attFilterEndDate");
  const progSelect = document.getElementById("attFilterProgram");
  const searchInput = document.getElementById("attSearchIntern");

  const startVal = startInput ? startInput.value : "";
  const endVal = endInput ? endInput.value : "";
  const progVal = (progSelect ? progSelect.value : "").trim().toLowerCase();
  const searchVal = (searchInput ? searchInput.value : "").trim().toLowerCase();

  // Tính danh sách ngày hiển thị
  currentAttDates = getDatesInRange(startVal, endVal);

  // 1. Render Header cột ngày
  let theadHTML = `
    <tr>
      <th style="min-width: 220px; text-align: left; padding-left: 20px;">Thực tập sinh</th>
  `;

  currentAttDates.forEach(d => {
    theadHTML += `
      <th class="text-center" style="min-width: 70px;">
        <div class="att-th-weekday">${d.dayLabel}</div>
        <div class="${d.isToday ? 'att-th-today' : 'att-th-date'}">${d.isToday ? 'Hôm nay' : d.dateFormatted}</div>
      </th>
    `;
  });

  theadHTML += `
      <th class="text-center" style="min-width: 90px;">Ngày công</th>
    </tr>
  `;
  thead.innerHTML = theadHTML;

  // 2. Lọc danh sách Thực tập sinh thực tế (Từ internList đồng bộ Database)
  let filteredInterns = internList.filter(intern => {
    if (intern.status && intern.status.includes("từ chối")) return false;

    if (progVal) {
      const internDept = (intern.dept || "").toLowerCase();
      const internPos = (intern.position || "").toLowerCase();
      if (!internDept.includes(progVal) && !internPos.includes(progVal)) return false;
    }

    if (searchVal) {
      const matchName = (intern.name || "").toLowerCase().includes(searchVal);
      const matchEmail = (intern.email || "").toLowerCase().includes(searchVal);
      const matchSchool = (intern.school || "").toLowerCase().includes(searchVal);
      if (!matchName && !matchEmail && !matchSchool) return false;
    }

    return true;
  });

  // Nếu không có thực tập sinh nào
  if (filteredInterns.length === 0) {
    const colSpan = currentAttDates.length + 2;
    tbody.innerHTML = `
      <tr>
        <td colspan="${colSpan}" class="text-center py-5" style="color: #64748b;">
          <i class="fa-regular fa-user-xmark" style="font-size: 28px; display: block; margin-bottom: 8px; color: #94a3b8;"></i>
          Không tìm thấy thực tập sinh nào phù hợp.
        </td>
      </tr>
    `;
    return;
  }

  // 3. Render danh sách dòng của từng Thực tập sinh (0% DỮ LIỆU GIẢ - MẶC ĐỊNH '—' NẾU CHƯA CHẤM)
  tbody.innerHTML = "";

  filteredInterns.forEach(intern => {
    const tr = document.createElement("tr");

    // Lấy bản ghi chấm công của TTS này
    const internRecords = attendanceRecords[intern.id] || {};

    let totalWorkDays = 0; // Đếm ngày công: 'present' (Đ), 'late' (T), 'remote' (R)
    let totalEligibleDays = currentAttDates.length;

    let daysCellsHTML = "";
    currentAttDates.forEach(d => {
      const statusKey = internRecords[d.dateKey] || "empty";
      const statusConfig = ATTENDANCE_STATUS_MAP[statusKey] || ATTENDANCE_STATUS_MAP.empty;

      if (statusKey === "present" || statusKey === "late" || statusKey === "remote") {
        totalWorkDays++;
      }

      // Escape tên TTS để truyền an toàn vào onclick
      const safeName = (intern.name || "").replace(/'/g, "\\'");

      daysCellsHTML += `
        <td class="text-center">
          <button type="button" class="att-day-btn" 
            onclick="openMarkAttendanceModal(${intern.id}, '${d.dateKey}', '${safeName}', '${d.dayLabel} ${d.dateFormatted}')"
            title="${statusConfig.text} (${d.dayLabel} ${d.dateFormatted}) - Nhấn để chấm công">
            <span class="att-chip ${statusConfig.chipClass}">${statusConfig.code}</span>
          </button>
        </td>
      `;
    });

    const deptOrProg = intern.dept || intern.position || "Thực tập sinh";

    tr.innerHTML = `
      <td style="padding-left: 20px;">
        <div class="att-intern-cell">
          <div class="att-intern-name">${intern.name}</div>
          <div class="att-intern-sub">${deptOrProg}</div>
        </div>
      </td>
      ${daysCellsHTML}
      <td class="text-center">
        <span class="att-workdays-badge">${totalWorkDays}/${totalEligibleDays}</span>
      </td>
    `;

    tbody.appendChild(tr);
  });
}

// Modal Chấm Công Nhanh: Mở modal khi bấm vào ô ngày
function openMarkAttendanceModal(internId, dateKey, internName, dateStr) {
  const hiddenId = document.getElementById("markAttInternId");
  const hiddenDate = document.getElementById("markAttDateKey");
  const subTitle = document.getElementById("markAttModalSubtitle");

  if (hiddenId) hiddenId.value = internId;
  if (hiddenDate) hiddenDate.value = dateKey;
  if (subTitle) subTitle.textContent = `${internName} • ${dateStr}`;

  openModal("markAttendanceModal");
}

// Modal Chấm Công Nhanh: Lưu trạng thái khi chọn chip
async function applyAttendanceMark(status) {
  const hiddenId = document.getElementById("markAttInternId");
  const hiddenDate = document.getElementById("markAttDateKey");

  if (!hiddenId || !hiddenDate) return;

  const internId = hiddenId.value;
  const dateKey = hiddenDate.value;

  closeModal("markAttendanceModal");

  // Đồng bộ trực tiếp lên MySQL Database
  if (typeof apiMarkAttendance === 'function') {
    try {
      await apiMarkAttendance({
        intern_id: internId,
        date: dateKey,
        status: status || ''
      });
    } catch (err) {
      console.warn('Lỗi lưu chấm công vào MySQL:', err);
    }
  }

  await loadAttendanceFromDB();
  renderAttendanceSheet();

  const statusLabel = status ? (ATTENDANCE_STATUS_MAP[status]?.text || status) : "Chưa có dữ liệu";
  showToast(`Đã cập nhật trạng thái: ${statusLabel}`, "success");
}

// ==========================================================================
// SUBTAB 2: ĐƠN NGHỈ PHÉP (HÌNH 2) - 0% DỮ LIỆU GIẢ
// ==========================================================================

// Render danh sách Đơn nghỉ phép
function renderLeaveRequests() {
  const tbody = document.getElementById("leavesTableBody");
  if (!tbody) return;

  const filterStatus = document.getElementById("leaveFilterStatus");
  const statusFilterVal = filterStatus ? filterStatus.value.trim() : "";

  let list = leaveRequests;
  if (statusFilterVal) {
    list = list.filter(item => item.status === statusFilterVal);
  }

  // Nếu không có đơn nghỉ phép nào (Để trống dữ liệu theo yêu cầu)
  if (list.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center py-5" style="color: #64748b;">
          <i class="fa-regular fa-envelope-open" style="font-size: 32px; display: block; margin-bottom: 10px; color: #cbd5e1;"></i>
          <span>Hiện tại chưa có đơn nghỉ phép nào.</span>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = "";

  list.forEach(leave => {
    const tr = document.createElement("tr");

    const formatDMY = (dStr) => {
      if (!dStr) return "";
      const p = dStr.split("-");
      if (p.length === 3) return `${p[2]}/${p[1]}/${p[0]}`;
      return dStr;
    };

    const timeRangeStr = `${formatDMY(leave.startDate)}<br><span style="font-size: 11px; color: #94a3b8;">đến</span> ${formatDMY(leave.endDate)}`;

    let statusBadgeClass = "leave-status-pending";
    if (leave.status === "Đã duyệt") statusBadgeClass = "leave-status-approved";
    else if (leave.status === "Từ chối") statusBadgeClass = "leave-status-rejected";

    let actionsHTML = `
      <div class="action-buttons-leave d-flex gap-2 justify-content-center">
        <button type="button" class="btn-action-leave btn-leave-detail" onclick="openLeaveDetailModal(${leave.id})">
          Xem chi tiết
        </button>
    `;

    if (leave.status === "Chờ duyệt") {
      actionsHTML += `
        <button type="button" class="btn-action-leave btn-leave-approve" onclick="handleApproveLeave(${leave.id})">
          Duyệt
        </button>
        <button type="button" class="btn-action-leave btn-leave-reject" onclick="handleRejectLeave(${leave.id})">
          Từ chối
        </button>
      `;
    }

    actionsHTML += `</div>`;

    tr.innerHTML = `
      <td>
        <strong>${leave.internName}</strong>
      </td>
      <td>
        <span class="text-muted" style="font-size: 13px;">${leave.program || "Chương trình thực tập"}</span>
      </td>
      <td>
        <div style="font-size: 13px; font-weight: 500;">${timeRangeStr}</div>
      </td>
      <td>
        <strong>${leave.days} ngày</strong>
      </td>
      <td>
        <span style="font-size: 13px; color: #475569;" title="${leave.reason}">
          ${leave.reason && leave.reason.length > 28 ? leave.reason.substring(0, 28) + '...' : (leave.reason || '')}
        </span>
      </td>
      <td>
        <div style="font-size: 12px; color: #64748b;">${leave.submittedAt || ''}</div>
      </td>
      <td>
        <span class="leave-status-badge ${statusBadgeClass}">${leave.status}</span>
      </td>
      <td class="text-center">
        ${actionsHTML}
      </td>
    `;

    tbody.appendChild(tr);
  });
}

// Mở Modal Tạo đơn nghỉ phép mới
function openCreateLeaveModal() {
  const internSelect = document.getElementById("leaveInternSelect");
  const startInput = document.getElementById("leaveStartDate");
  const endInput = document.getElementById("leaveEndDate");
  const reasonInput = document.getElementById("leaveReason");

  if (internSelect) {
    internSelect.innerHTML = "";
    if (internList.length === 0) {
      internSelect.innerHTML = `<option value="">Chưa có thực tập sinh nào trong hệ thống</option>`;
    } else {
      internList.forEach(i => {
        const opt = document.createElement("option");
        opt.value = i.id;
        opt.textContent = `${i.name} - ${i.dept || i.position || 'Thực tập sinh'}`;
        internSelect.appendChild(opt);
      });
    }
  }

  const todayStr = new Date().toISOString().split("T")[0];
  if (startInput) startInput.value = todayStr;
  if (endInput) endInput.value = todayStr;
  if (reasonInput) reasonInput.value = "";

  openModal("createLeaveModal");
}

// Xử lý nộp đơn nghỉ phép
function handleCreateLeaveSubmit(e) {
  e.preventDefault();

  const internSelect = document.getElementById("leaveInternSelect");
  const startInput = document.getElementById("leaveStartDate");
  const endInput = document.getElementById("leaveEndDate");
  const reasonInput = document.getElementById("leaveReason");

  if (!internSelect || !startInput || !endInput || !reasonInput) return;

  const internId = parseInt(internSelect.value, 10);
  const intern = internList.find(i => i.id === internId);

  if (!intern) {
    showToast("Vui lòng chọn thực tập sinh hợp lệ", "error");
    return;
  }

  const startDate = startInput.value;
  const endDate = endInput.value;

  if (new Date(startDate) > new Date(endDate)) {
    showToast("Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu", "warning");
    return;
  }

  // Tính số ngày nghỉ
  const diffTime = Math.abs(new Date(endDate) - new Date(startDate));
  const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

  // Format ngày gửi: dd/mm/yyyy hh:mm
  const now = new Date();
  const d = String(now.getDate()).padStart(2, "0");
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const y = now.getFullYear();
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const submittedAt = `${d}/${m}/${y} ${hh}:${mm}`;

  const newLeave = {
    id: Date.now(),
    internId: intern.id,
    internName: intern.name,
    program: intern.dept || intern.position || "Kỹ thuật phần mềm",
    startDate,
    endDate,
    days,
    reason: reasonInput.value.trim(),
    submittedAt,
    status: "Chờ duyệt"
  };

  leaveRequests.unshift(newLeave);

  try {
    localStorage.setItem("codegym_hr_leaves", JSON.stringify(leaveRequests));
  } catch (err) {
    console.error("Lỗi lưu đơn nghỉ phép:", err);
  }

  closeModal("createLeaveModal");
  renderLeaveRequests();
  showToast("Đã tạo đơn nghỉ phép thành công!", "success");
}

// Mở Modal Xem chi tiết đơn nghỉ phép
function openLeaveDetailModal(leaveId) {
  const leave = leaveRequests.find(l => l.id === leaveId);
  if (!leave) return;

  const detailBody = document.getElementById("leaveDetailBody");
  const detailFooter = document.getElementById("leaveDetailFooter");
  if (!detailBody || !detailFooter) return;

  const formatDMY = (dStr) => {
    if (!dStr) return "";
    const p = dStr.split("-");
    if (p.length === 3) return `${p[2]}/${p[1]}/${p[0]}`;
    return dStr;
  };

  let statusBadgeClass = "leave-status-pending";
  if (leave.status === "Đã duyệt") statusBadgeClass = "leave-status-approved";
  else if (leave.status === "Từ chối") statusBadgeClass = "leave-status-rejected";

  detailBody.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 14px;">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 12px;">
        <div>
          <h4 style="margin: 0; font-size: 16px; font-weight: 700; color: #1e293b;">${leave.internName}</h4>
          <span style="font-size: 13px; color: #64748b;">${leave.program || "Chương trình thực tập"}</span>
        </div>
        <span class="leave-status-badge ${statusBadgeClass}">${leave.status}</span>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        <div style="background: #f8fafc; padding: 10px 14px; border-radius: 8px;">
          <span style="font-size: 12px; color: #64748b; display: block;">Thời gian nghỉ:</span>
          <strong style="font-size: 13px; color: #1e293b;">${formatDMY(leave.startDate)} → ${formatDMY(leave.endDate)}</strong>
        </div>
        <div style="background: #f8fafc; padding: 10px 14px; border-radius: 8px;">
          <span style="font-size: 12px; color: #64748b; display: block;">Tổng số ngày:</span>
          <strong style="font-size: 13px; color: #1e293b;">${leave.days} ngày</strong>
        </div>
      </div>

      <div style="background: #f8fafc; padding: 12px 14px; border-radius: 8px;">
        <span style="font-size: 12px; color: #64748b; display: block; margin-bottom: 4px;">Lý do nghỉ phép:</span>
        <p style="margin: 0; font-size: 13px; color: #334155; line-height: 1.5;">${leave.reason}</p>
      </div>

      <div style="font-size: 12px; color: #94a3b8; text-align: right;">
        Ngày nộp đơn: ${leave.submittedAt || "Không xác định"}
      </div>
    </div>
  `;

  let footerBtns = `<button type="button" class="btn-secondary" onclick="closeModal('leaveDetailModal')">Đóng</button>`;
  if (leave.status === "Chờ duyệt") {
    footerBtns += `
      <button type="button" class="btn-danger" style="background: #ef4444; color: white; padding: 8px 16px; border-radius: 6px;" onclick="handleRejectLeave(${leave.id}); closeModal('leaveDetailModal');">Từ chối</button>
      <button type="button" class="btn-primary" style="background: #10b981; padding: 8px 16px; border-radius: 6px;" onclick="handleApproveLeave(${leave.id}); closeModal('leaveDetailModal');">Duyệt đơn</button>
    `;
  }
  detailFooter.innerHTML = footerBtns;

  openModal("leaveDetailModal");
}

// Duyệt đơn nghỉ phép: Tự động cập nhật MySQL và đánh dấu trạng thái 'leave' (P) trên Bảng chấm công
async function handleApproveLeave(leaveId) {
  const leave = leaveRequests.find(l => l.id === leaveId);
  if (!leave) return;

  try {
    if (typeof apiReviewLeave === 'function') {
      await apiReviewLeave(leaveId, 'approved');
    }
    showToast(`Đã duyệt đơn nghỉ phép của ${leave.internName} và tự động cập nhật bảng chấm công (P)!`, "success");
  } catch (err) {
    console.error("Lỗi duyệt nghỉ phép trên MySQL:", err);
    showToast("Không thể duyệt đơn nghỉ phép lúc này", "danger");
  }

  await loadAttendanceFromDB();
  renderLeaveRequests();
  renderAttendanceSheet();
}

// Từ chối đơn nghỉ phép: Cập nhật trạng thái trực tiếp lên MySQL Database
async function handleRejectLeave(leaveId) {
  const leave = leaveRequests.find(l => l.id === leaveId);
  if (!leave) return;

  try {
    if (typeof apiReviewLeave === 'function') {
      await apiReviewLeave(leaveId, 'rejected');
    }
    showToast(`Đã từ chối đơn nghỉ phép của ${leave.internName}`, "info");
  } catch (err) {
    console.error("Lỗi từ chối nghỉ phép trên MySQL:", err);
    showToast("Không thể từ chối đơn nghỉ phép lúc này", "danger");
  }

  await loadAttendanceFromDB();
  renderLeaveRequests();
}

// ==========================================================================
// XUẤT BÁO CÁO CHẤM CÔNG (CSV VỚI UTF-8 BOM)
// ==========================================================================
function exportAttendanceReport() {
  if (currentAttDates.length === 0) {
    showToast("Không có khoảng ngày nào để xuất báo cáo!", "warning");
    return;
  }

  // Header CSV
  const headers = ["STT", "Họ và tên", "Email", "Phòng ban / Vị trí"];
  currentAttDates.forEach(d => {
    headers.push(`${d.dayLabel} (${d.dateFormatted})`);
  });
  headers.push("Tổng ngày công");

  // Rows
  const rows = [];
  internList.forEach((intern, idx) => {
    const internRecords = attendanceRecords[intern.id] || {};
    let workDays = 0;

    const row = [
      idx + 1,
      `"${intern.name}"`,
      `"${intern.email || ''}"`,
      `"${intern.dept || intern.position || 'Thực tập sinh'}"`
    ];

    currentAttDates.forEach(d => {
      const statusKey = internRecords[d.dateKey] || "empty";
      const statusConfig = ATTENDANCE_STATUS_MAP[statusKey] || ATTENDANCE_STATUS_MAP.empty;
      if (statusKey === "present" || statusKey === "late" || statusKey === "remote") {
        workDays++;
      }
      row.push(`"${statusConfig.text}"`);
    });

    row.push(`"${workDays}/${currentAttDates.length}"`);
    rows.push(row.join(","));
  });

  const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const monthVal = document.getElementById("attFilterMonth")?.value || "current";
  const yearVal = document.getElementById("attFilterYear")?.value || "2026";

  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `Bao_Cao_Cham_Cong_Thang_${monthVal}_${yearVal}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  showToast("Đã xuất báo cáo chấm công thành công!", "success");
}

// Gắn toàn bộ hàm của module Chấm công vào window
window.initAttendance = initAttendance;
window.switchAttendanceSubtab = switchAttendanceSubtab;
window.initAttendanceFilters = initAttendanceFilters;
window.populateAttendanceProgramFilter = populateAttendanceProgramFilter;
window.onAttendanceDateFilterChange = onAttendanceDateFilterChange;
window.applyAttendanceFilter = applyAttendanceFilter;
window.renderAttendanceTab = renderAttendanceTab;
window.renderAttendanceSheet = renderAttendanceSheet;
window.openMarkAttendanceModal = openMarkAttendanceModal;
window.applyAttendanceMark = applyAttendanceMark;
window.renderLeaveRequests = renderLeaveRequests;
window.openCreateLeaveModal = openCreateLeaveModal;
window.handleCreateLeaveSubmit = handleCreateLeaveSubmit;
window.openLeaveDetailModal = openLeaveDetailModal;
window.handleApproveLeave = handleApproveLeave;
window.handleRejectLeave = handleRejectLeave;
window.exportAttendanceReport = exportAttendanceReport;

// ==========================================================================
// 15. PHÂN HỆ MENTOR & PHÒNG BAN (FRONTEND CONTROLLER)
// ==========================================================================
// Đảm bảo dữ liệu phân hệ Mentor & Phòng ban khởi tạo sạch, để trống hoàn toàn theo yêu cầu
const MENTOR_DATA_VERSION = "v_empty_fresh_reset_2026_clean";
if (localStorage.getItem("hr_mentor_schema_ver") !== MENTOR_DATA_VERSION) {
  localStorage.removeItem("hr_mentors_list");
  localStorage.removeItem("hr_departments_list");
  localStorage.setItem("hr_mentor_schema_ver", MENTOR_DATA_VERSION);
}

function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
window.escapeHtml = escapeHtml;

function getMentorsStorageKey() {
  return "hr_mentors_list";
}

function getDeptsStorageKey() {
  return "hr_departments_list";
}

function getMentors() {
  try {
    const raw = localStorage.getItem(getMentorsStorageKey());
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveMentors(mentors) {
  try {
    localStorage.setItem(getMentorsStorageKey(), JSON.stringify(mentors));
  } catch (e) {}
}

function generateDeptCode(deptName) {
  if (!deptName) return "PB";
  let clean = deptName.replace(/^(phòng|ban)\s+/i, '').trim();
  const words = clean.split(/[\s,&-]+/).filter(Boolean);
  if (words.length >= 2) {
    return words.map(w => w[0].toUpperCase()).join('').substring(0, 5);
  }
  return clean.substring(0, 4).toUpperCase();
}

function hashDeptCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getDepartments() {
  let depts = [];
  try {
    const raw = localStorage.getItem(getDeptsStorageKey());
    if (raw) depts = JSON.parse(raw);
  } catch (e) {
    depts = [];
  }
  if (!Array.isArray(depts)) depts = [];

  // Tự động đồng bộ các phòng ban thực tế từ Mentor trong hệ thống
  const mentors = getMentors();
  const mentorDepts = mentors
    .map(m => m.department ? m.department.trim() : "")
    .filter(d => d && d !== "Chưa gán" && d !== "Chưa phân bổ");

  // Loại bỏ phòng ban 'Kỹ thuật phần mềm' nếu bị auto-sync nhầm từ chương trình thực tập (không có mentor phụ trách)
  const initialLength = depts.length;
  depts = depts.filter(d => {
    if (!d || !d.name) return false;
    const nameLower = d.name.trim().toLowerCase();
    if (nameLower === "kỹ thuật phần mềm") {
      const hasMentor = mentors.some(m => (m.department || "").trim().toLowerCase() === nameLower);
      if (!hasMentor) return false;
    }
    return true;
  });

  const existingMap = new Map();
  depts.forEach(d => {
    if (d && d.name) {
      existingMap.set(d.name.trim().toLowerCase(), d);
    }
  });

  let deletedNames = [];
  try {
    deletedNames = JSON.parse(localStorage.getItem("hr_deleted_depts") || "[]");
  } catch (e) {}

  let hasChanged = (depts.length !== initialLength);
  const systemDepts = Array.from(new Set(mentorDepts));

  systemDepts.forEach(deptName => {
    const key = deptName.toLowerCase();
    const hasActiveMentor = mentors.some(m => (m.department || "").trim().toLowerCase() === key);
    // Nếu chưa có trong danh sách phòng ban và (chưa bị người dùng chủ động xóa hoặc đang có mentor phụ trách)
    if (!existingMap.has(key) && (!deletedNames.includes(key) || hasActiveMentor)) {
      const newDept = {
        id: "dept_" + hashDeptCode(deptName),
        code: generateDeptCode(deptName),
        name: deptName,
        desc: `Phòng ban tiếp nhận và quản lý thực tập sinh (${deptName})`
      };
      depts.push(newDept);
      existingMap.set(key, newDept);
      hasChanged = true;
    }
  });

  if (hasChanged) {
    saveDepartments(depts);
  }

  return depts;
}

function saveDepartments(depts) {
  try {
    localStorage.setItem(getDeptsStorageKey(), JSON.stringify(depts));
  } catch (e) {}
}

let currentMentorSubTab = "mentors";
let currentDeleteMentorId = null;
let currentAssignMentorId = null;
let selectedAssignInternIds = new Set();

function handleMentorHeaderAction() {
  if (currentMentorSubTab === "mentors") {
    openAddMentorModal();
  } else {
    openAddDeptModal();
  }
}

function updateMentorHeaderButton() {
  const btnText = document.getElementById("btnHeaderMentorActionText");
  const btn = document.getElementById("btnHeaderMentorAction");
  if (!btn) return;
  if (currentMentorSubTab === "mentors") {
    if (btnText) btnText.textContent = "Thêm Mentor";
    btn.onclick = openAddMentorModal;
  } else {
    if (btnText) btnText.textContent = "Thêm phòng ban";
    btn.onclick = openAddDeptModal;
  }
}

async function initMentorsTab() {
  updateDeptDropdowns();
  if (typeof apiGetMentors === 'function') {
    try {
      const res = await apiGetMentors();
      if (res && res.success && Array.isArray(res.data)) {
        const mapped = res.data.map(m => {
          let assignedIds = [];
          if (m.intern_ids) {
            assignedIds = m.intern_ids.split(',').map(s => s.trim()).filter(Boolean);
          } else if (Array.isArray(m.assignedInternIds)) {
            assignedIds = m.assignedInternIds;
          } else if (m.intern_names) {
            assignedIds = m.intern_names.split(',').map(s => s.trim()).filter(Boolean);
          }
          return {
            id: m.id,
            user_id: m.user_id || null,
            name: m.name,
            role: m.position || m.role || 'Mentor',
            email: m.email,
            phone: m.phone || '',
            department: m.dept || m.department || 'Chưa gán',
            maxInterns: Number(m.max_interns || m.maxInterns) || 5,
            status: (m.status === 'active' || m.status === 'Đang hoạt động') ? 'Đang hoạt động' : 'Tạm ngưng',
            avatar: m.avatar || '',
            assignedInternIds: assignedIds
          };
        });
        saveMentors(mapped);
      }
    } catch (e) {
      console.warn('Lỗi đồng bộ mentors từ MySQL API:', e);
    }
  }
  updateDeptDropdowns();
  renderMentorStats();
  switchMentorSubTab(currentMentorSubTab || "mentors");
}

function switchMentorSubTab(tab) {
  currentMentorSubTab = tab;
  const btnMentors = document.getElementById("btnSubTabMentors");
  const btnDepts = document.getElementById("btnSubTabDepts");
  const viewMentors = document.getElementById("mentorSubTabView");
  const viewDepts = document.getElementById("deptSubTabView");

  updateMentorHeaderButton();

  if (tab === "mentors") {
    if (btnMentors) btnMentors.classList.add("active");
    if (btnDepts) btnDepts.classList.remove("active");
    if (viewMentors) {
      viewMentors.style.display = "block";
      viewMentors.classList.remove("d-none");
    }
    if (viewDepts) {
      viewDepts.style.display = "none";
      viewDepts.classList.add("d-none");
    }
    renderMentorTable();
  } else {
    if (btnDepts) btnDepts.classList.add("active");
    if (btnMentors) btnMentors.classList.remove("active");
    if (viewMentors) {
      viewMentors.style.display = "none";
      viewMentors.classList.add("d-none");
    }
    if (viewDepts) {
      viewDepts.style.display = "block";
      viewDepts.classList.remove("d-none");
    }
    renderDeptTable();
  }
}

function updateDeptDropdowns() {
  const depts = getDepartments();
  const filterSelect = document.getElementById("filterMentorDept");
  const addSelect = document.getElementById("mentorAddDept");
  const editSelect = document.getElementById("mentorEditDept");
  const assignDeptSelect = document.getElementById("assignDeptFilter");

  const deptNames = Array.from(new Set(depts.map(d => d.name).filter(Boolean)));

  if (filterSelect) {
    const currentVal = filterSelect.value;
    filterSelect.innerHTML = `<option value="">Tất cả phòng ban</option>` +
      deptNames.map(d => `<option value="${escapeHtml(d)}">${escapeHtml(d)}</option>`).join("");
    if (currentVal && deptNames.includes(currentVal)) {
      filterSelect.value = currentVal;
    } else {
      filterSelect.value = "";
    }
  }

  if (addSelect) {
    const currentVal = addSelect.value;
    addSelect.innerHTML = `<option value="">Chọn phòng ban</option>` +
      deptNames.map(d => `<option value="${escapeHtml(d)}">${escapeHtml(d)}</option>`).join("");
    if (currentVal && deptNames.includes(currentVal)) {
      addSelect.value = currentVal;
    }
  }

  if (editSelect) {
    const currentVal = editSelect.value;
    editSelect.innerHTML = `<option value="">Chọn phòng ban</option>` +
      deptNames.map(d => `<option value="${escapeHtml(d)}">${escapeHtml(d)}</option>`).join("");
    if (currentVal && deptNames.includes(currentVal)) {
      editSelect.value = currentVal;
    }
  }

  if (assignDeptSelect) {
    const currentVal = assignDeptSelect.value;
    assignDeptSelect.innerHTML = `<option value="">Tất cả phòng ban</option>` +
      deptNames.map(d => `<option value="${escapeHtml(d)}">${escapeHtml(d)}</option>`).join("");
    if (currentVal && deptNames.includes(currentVal)) {
      assignDeptSelect.value = currentVal;
    } else {
      assignDeptSelect.value = "";
    }
  }
}

function renderMentorStats() {
  const mentors = getMentors();
  const depts = getDepartments();

  const activeMentors = mentors.filter(m => m.status === "Đang hoạt động");
  const inactiveMentors = mentors.filter(m => m.status === "Tạm ngưng");

  const capacityTotal = activeMentors.reduce((sum, m) => sum + (Number(m.maxInterns) || 5), 0);
  const capacityAssigned = activeMentors.reduce((sum, m) => sum + ((m.assignedInternIds && m.assignedInternIds.length) || 0), 0);
  const capacityPercent = capacityTotal > 0 ? Math.round((capacityAssigned / capacityTotal) * 100) : 0;

  // Tính số lượng phòng ban từ danh sách phòng ban
  const activeDeptCount = depts.length;
  const totalDeptCount = depts.length;

  const elActiveMentors = document.getElementById("statActiveMentors");
  const elInactiveMentors = document.getElementById("statInactiveMentors");
  const elActiveDepts = document.getElementById("statActiveDepts");
  const elTotalDepts = document.getElementById("statTotalDepts");
  const elCapacityPercent = document.getElementById("statCapacityPercent");
  const elCapacityAssigned = document.getElementById("statCapacityAssigned");
  const elCapacityTotal = document.getElementById("statCapacityTotal");
  const elBadgeMentor = document.getElementById("badgeMentorCount");
  const elBadgeDept = document.getElementById("badgeDeptCount");

  if (elActiveMentors) elActiveMentors.textContent = activeMentors.length;
  if (elInactiveMentors) elInactiveMentors.textContent = inactiveMentors.length;
  if (elActiveDepts) elActiveDepts.textContent = activeDeptCount;
  if (elTotalDepts) elTotalDepts.textContent = totalDeptCount;
  if (elCapacityPercent) elCapacityPercent.textContent = `${capacityPercent}%`;
  if (elCapacityAssigned) elCapacityAssigned.textContent = capacityAssigned;
  if (elCapacityTotal) elCapacityTotal.textContent = capacityTotal;
  if (elBadgeMentor) elBadgeMentor.textContent = mentors.length;
  if (elBadgeDept) elBadgeDept.textContent = totalDeptCount;
}

function getMentorInitials(name) {
  if (!name) return "MT";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function renderMentorTable() {
  const table = document.getElementById("mentorMainTable");
  const tbody = document.getElementById("mentorTableBody");
  const emptyState = document.getElementById("mentorEmptyState");
  const mentors = getMentors();

  const deptFilter = (document.getElementById("filterMentorDept")?.value || "").trim().toLowerCase();
  const keyword = (document.getElementById("searchMentorKeyword")?.value || "").trim().toLowerCase();
  const statusFilter = (document.getElementById("filterMentorStatus")?.value || "").trim();

  let filtered = mentors.filter(m => {
    if (deptFilter && (m.department || "").toLowerCase() !== deptFilter) return false;
    if (statusFilter && m.status !== statusFilter) return false;
    if (keyword) {
      const matchName = (m.name || "").toLowerCase().includes(keyword);
      const matchEmail = (m.email || "").toLowerCase().includes(keyword);
      const matchRole = (m.role || "").toLowerCase().includes(keyword);
      if (!matchName && !matchEmail && !matchRole) return false;
    }
    return true;
  });

  if (!tbody) return;

  if (mentors.length === 0 || filtered.length === 0) {
    if (table) {
      table.style.display = "none";
      table.classList.add("d-none");
    }
    if (emptyState) {
      emptyState.style.display = "block";
      emptyState.classList.remove("d-none");
    }
    tbody.innerHTML = "";
    return;
  }

  if (table) {
    table.style.display = "table";
    table.classList.remove("d-none");
  }
  if (emptyState) {
    emptyState.style.display = "none";
    emptyState.classList.add("d-none");
  }

  tbody.innerHTML = filtered.map(m => {
    const assignedCount = m.assignedInternIds ? m.assignedInternIds.length : 0;
    const maxCount = Number(m.maxInterns) || 5;
    const percent = Math.round((assignedCount / maxCount) * 100);
    const initials = getMentorInitials(m.name);
    const isActive = m.status === "Đang hoạt động";
    const deptText = (m.department && m.department !== "Chưa gán") ? m.department : "Marketing";

    return `
      <tr>
        <td>
          <div class="mentor-cell-flex">
            ${m.avatar ? `
              <img src="${escapeHtml(m.avatar)}" alt="${escapeHtml(m.name)}" class="mentor-compact-avatar-img">
            ` : `
              <div class="mentor-compact-avatar">${initials}</div>
            `}
            <div class="mentor-compact-info">
              <span class="mentor-compact-name">${escapeHtml(m.name)}</span>
              <span class="mentor-compact-role">${escapeHtml(m.role || 'God')}</span>
              <span class="mentor-compact-email">
                <i class="fa-regular fa-envelope"></i>${escapeHtml(m.email)}
              </span>
            </div>
          </div>
        </td>
        <td>
          <span class="mentor-compact-dept-tag">
            ${escapeHtml(deptText)}
          </span>
        </td>
        <td>
          <div class="mentor-compact-capacity">
            <div class="mentor-capacity-row">
              <span class="mentor-capacity-val">${assignedCount}/${maxCount} TTS</span>
              <span class="mentor-capacity-pct">${percent}%</span>
            </div>
            <div class="mentor-capacity-track">
              <div class="mentor-capacity-bar" style="width: ${Math.min(100, percent)}%;"></div>
            </div>
          </div>
        </td>
        <td>
          ${isActive ? `
            <span class="mentor-compact-status active">Đang hoạt động</span>
          ` : `
            <span class="mentor-compact-status inactive">Tạm ngưng</span>
          `}
        </td>
        <td style="text-align: right;">
          <div class="mentor-action-icons-wrap">
            <button type="button" class="btn-mentor-action-icon" title="Phân công thực tập sinh" onclick="openAssignInternModal('${m.id}')">
              <i class="fa-solid fa-user-plus"></i>
            </button>
            <button type="button" class="btn-mentor-action-icon" title="Chỉnh sửa Mentor" onclick="openEditMentorModal('${m.id}')">
              <i class="fa-regular fa-pen-to-square"></i>
            </button>
            <button type="button" class="btn-mentor-action-icon btn-delete-icon" title="Xóa Mentor" onclick="openDeleteMentorModal('${m.id}')">
              <i class="fa-regular fa-trash-can"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

// --- QUẢN LÝ TÀI KHOẢN MENTOR KHẢ DỤNG ---
let cachedAvailableMentorUsers = [];

async function loadAvailableMentorUsers(currentMentorId = '') {
  const selectAdd = document.getElementById("mentorAddUserId");
  const alertAdd = document.getElementById("noMentorAccountAlert");
  const selectEdit = document.getElementById("mentorEditUserId");

  let users = [];
  try {
    if (typeof apiGetAvailableMentorUsers === 'function') {
      const res = await apiGetAvailableMentorUsers(currentMentorId);
      if (res && res.success && Array.isArray(res.data)) {
        users = res.data;
      }
    }
  } catch (err) {
    console.warn("Lỗi tải danh sách tài khoản Mentor khả dụng:", err);
  }

  cachedAvailableMentorUsers = users;

  // Cập nhật dropdown ở modal thêm mới
  if (selectAdd) {
    selectAdd.innerHTML = '<option value="">-- Chọn tài khoản Mentor do Admin tạo --</option>';
    if (users.length === 0) {
      if (alertAdd) alertAdd.style.display = "block";
      const opt = document.createElement("option");
      opt.value = "";
      opt.disabled = true;
      opt.textContent = "Không có tài khoản Mentor khả dụng";
      selectAdd.appendChild(opt);
    } else {
      if (alertAdd) alertAdd.style.display = "none";
      users.forEach(u => {
        const opt = document.createElement("option");
        opt.value = u.id;
        opt.textContent = `${u.full_name || u.name || u.email} (${u.email})`;
        selectAdd.appendChild(opt);
      });
    }
  }

  // Cập nhật dropdown ở modal chỉnh sửa nếu có
  if (selectEdit) {
    selectEdit.innerHTML = '<option value="">-- Chưa liên kết tài khoản --</option>';
    users.forEach(u => {
      const opt = document.createElement("option");
      opt.value = u.id;
      opt.textContent = `${u.full_name || u.name || u.email} (${u.email})`;
      selectEdit.appendChild(opt);
    });
  }

  return users;
}
window.loadAvailableMentorUsers = loadAvailableMentorUsers;

function handleSelectMentorAccount(userId) {
  if (!userId) return;
  const user = cachedAvailableMentorUsers.find(u => String(u.id) === String(userId));
  if (!user) return;

  const nameInp = document.getElementById("mentorAddName");
  const emailInp = document.getElementById("mentorAddEmail");
  const phoneInp = document.getElementById("mentorAddPhone");

  if (nameInp && (!nameInp.value || nameInp.value.trim() === '')) {
    nameInp.value = user.full_name || user.name || '';
  }
  if (emailInp) {
    emailInp.value = user.email || '';
  }
  if (phoneInp && (!phoneInp.value || phoneInp.value.trim() === '')) {
    phoneInp.value = user.phone || '';
  }
}
window.handleSelectMentorAccount = handleSelectMentorAccount;

// --- MODAL: THÊM MENTOR ---
async function openAddMentorModal() {
  updateDeptDropdowns();

  const form = document.querySelector("#addMentorModal form");
  if (form) form.reset();

  const nameInp = document.getElementById("mentorAddName");
  const roleInp = document.getElementById("mentorAddRole");
  const emailInp = document.getElementById("mentorAddEmail");
  const phoneInp = document.getElementById("mentorAddPhone");
  const deptInp = document.getElementById("mentorAddDept");
  const maxInp = document.getElementById("mentorAddMax");
  const avatarInp = document.getElementById("mentorAddAvatar");
  const userSelect = document.getElementById("mentorAddUserId");

  if (userSelect) userSelect.value = "";
  if (nameInp) nameInp.value = "";
  if (roleInp) roleInp.value = "";
  if (emailInp) emailInp.value = "";
  if (phoneInp) phoneInp.value = "";
  if (deptInp) deptInp.value = "";
  if (maxInp) maxInp.value = "5";
  if (avatarInp) avatarInp.value = "";

  await loadAvailableMentorUsers();

  openModal("addMentorModal");
}

async function handleAddMentorSubmit(event) {
  if (event) event.preventDefault();
  const userId = document.getElementById("mentorAddUserId")?.value;
  const name = (document.getElementById("mentorAddName")?.value || "").trim();
  const role = (document.getElementById("mentorAddRole")?.value || "").trim();
  const email = (document.getElementById("mentorAddEmail")?.value || "").trim();
  const phone = (document.getElementById("mentorAddPhone")?.value || "").trim();
  const dept = (document.getElementById("mentorAddDept")?.value || "").trim();
  const max = parseInt(document.getElementById("mentorAddMax")?.value || "5", 10);
  const avatar = (document.getElementById("mentorAddAvatar")?.value || "").trim();

  if (!userId) {
    if (cachedAvailableMentorUsers.length === 0) {
      showToast("Chưa có tài khoản Mentor. Vui lòng liên hệ Admin để cấp tài khoản.", "warning");
    } else {
      showToast("Vui lòng chọn Tài khoản hệ thống cho Mentor!", "warning");
    }
    return;
  }

  if (!name || !role || !email) {
    showToast("Vui lòng điền họ tên, chức danh và email của Mentor!", "warning");
    return;
  }

  let dbId = "mentor_" + Date.now();
  if (typeof apiCreateMentor === 'function') {
    try {
      const res = await apiCreateMentor({
        user_id: Number(userId),
        name,
        email,
        phone,
        dept: dept || "Phòng Phát triển Phần mềm",
        position: role,
        max_interns: isNaN(max) ? 5 : max
      });
      if (res && res.mentorId) {
        dbId = res.mentorId;
      } else if (res && !res.success && res.message) {
        showToast(res.message, "error");
        return;
      }
    } catch (e) {
      console.warn('Lỗi gọi apiCreateMentor:', e);
    }
  }

  const mentors = getMentors();
  const newMentor = {
    id: dbId,
    user_id: Number(userId),
    name,
    role,
    email,
    phone,
    department: dept || "Chưa gán",
    maxInterns: isNaN(max) ? 5 : max,
    status: "Đang hoạt động",
    avatar,
    assignedInternIds: []
  };

  mentors.unshift(newMentor);
  saveMentors(mentors);

  closeModal("addMentorModal");

  // Tự động chuyển sang sub-tab Danh sách Mentor để người dùng thấy ngay kết quả
  switchMentorSubTab("mentors");

  // Xóa các bộ lọc tìm kiếm hiện tại để không vô tình ẩn Mentor vừa thêm
  const filterDept = document.getElementById("filterMentorDept");
  if (filterDept) filterDept.value = "";
  const filterStatus = document.getElementById("filterMentorStatus");
  if (filterStatus) filterStatus.value = "";
  const searchKw = document.getElementById("searchMentorKeyword");
  if (searchKw) searchKw.value = "";

  updateDeptDropdowns();
  renderMentorStats();
  renderMentorTable();
  renderDeptTable();
  showToast(`Đã thêm Mentor "${name}" thành công!`, "success");
}

// --- MODAL: CHỈNH SỬA MENTOR ---
async function openEditMentorModal(mentorId) {
  const mentors = getMentors();
  const mentor = mentors.find(m => String(m.id) === String(mentorId));
  if (!mentor) return;

  updateDeptDropdowns();
  const idInp = document.getElementById("mentorEditId");
  const nameInp = document.getElementById("mentorEditName");
  const roleInp = document.getElementById("mentorEditRole");
  const emailInp = document.getElementById("mentorEditEmail");
  const phoneInp = document.getElementById("mentorEditPhone");
  const deptInp = document.getElementById("mentorEditDept");
  const maxInp = document.getElementById("mentorEditMax");
  const statusInp = document.getElementById("mentorEditStatus");
  const avatarInp = document.getElementById("mentorEditAvatar");
  const userSelect = document.getElementById("mentorEditUserId");

  if (idInp) idInp.value = mentor.id;
  if (nameInp) nameInp.value = mentor.name || "";
  if (roleInp) roleInp.value = mentor.role || "";
  if (emailInp) emailInp.value = mentor.email || "";
  if (phoneInp) phoneInp.value = mentor.phone || "";
  if (deptInp) {
    const opts = deptInp.options ? Array.from(deptInp.options) : [];
    if (mentor.department && !opts.some(o => o.value === mentor.department)) {
      const opt = document.createElement("option");
      opt.value = mentor.department;
      opt.textContent = mentor.department;
      deptInp.appendChild(opt);
    }
    deptInp.value = mentor.department || "";
  }
  if (maxInp) maxInp.value = mentor.maxInterns || 5;
  if (statusInp) statusInp.value = mentor.status || "Đang hoạt động";
  if (avatarInp) avatarInp.value = mentor.avatar || "";

  await loadAvailableMentorUsers(mentor.id);
  if (userSelect) {
    userSelect.value = mentor.user_id ? String(mentor.user_id) : "";
  }

  openModal("editMentorModal");
}

async function handleEditMentorSubmit(event) {
  if (event) event.preventDefault();
  const id = document.getElementById("mentorEditId")?.value;
  let mentors = getMentors();
  const idx = mentors.findIndex(m => String(m.id) === String(id));
  if (idx === -1) {
    showToast("Không tìm thấy Mentor cần cập nhật!", "error");
    return;
  }

  const userId = document.getElementById("mentorEditUserId")?.value;
  const name = (document.getElementById("mentorEditName")?.value || "").trim();
  const role = (document.getElementById("mentorEditRole")?.value || "").trim();
  const email = (document.getElementById("mentorEditEmail")?.value || "").trim();
  const phone = (document.getElementById("mentorEditPhone")?.value || "").trim();
  const dept = (document.getElementById("mentorEditDept")?.value || "").trim();
  const max = parseInt(document.getElementById("mentorEditMax")?.value || "5", 10);
  const status = document.getElementById("mentorEditStatus")?.value || mentors[idx].status || "Đang hoạt động";
  const avatar = (document.getElementById("mentorEditAvatar")?.value || "").trim();

  try {
    if (typeof apiUpdateMentor === 'function' && !String(id).startsWith('m_')) {
      await apiUpdateMentor(id, {
        user_id: userId ? Number(userId) : null,
        name,
        email,
        phone,
        dept,
        position: role || 'Senior Mentor',
        max_interns: isNaN(max) ? 5 : max,
        status: status === 'Đang hoạt động' ? 'active' : 'inactive'
      });
    }
  } catch (err) {
    console.warn("Lỗi đồng bộ MySQL update mentor:", err);
  }

  mentors[idx] = {
    ...mentors[idx],
    user_id: userId ? Number(userId) : null,
    name,
    role,
    email,
    phone,
    department: dept,
    maxInterns: isNaN(max) ? 5 : max,
    status,
    avatar
  };
  saveMentors(mentors);
  closeModal("editMentorModal");
  updateDeptDropdowns();
  renderMentorStats();
  renderMentorTable();
  showToast("Lưu thay đổi thông tin Mentor thành công!", "success");
}

// --- MODAL: XÓA MENTOR ---
function openDeleteMentorModal(mentorId) {
  const mentors = getMentors();
  const mentor = mentors.find(m => m.id === mentorId);
  if (!mentor) return;

  currentDeleteMentorId = mentorId;
  const nameDisplay = document.getElementById("deleteMentorNameDisplay");
  if (nameDisplay) nameDisplay.textContent = mentor.name;

  openModal("deleteMentorModal");
}

async function confirmDeleteMentor() {
  if (!currentDeleteMentorId) return;
  try {
    if (typeof apiDeleteMentor === 'function' && !String(currentDeleteMentorId).startsWith('m_')) {
      await apiDeleteMentor(currentDeleteMentorId);
    }
  } catch (err) {
    console.warn("Lỗi đồng bộ MySQL delete mentor:", err);
  }

  let mentors = getMentors();
  mentors = mentors.filter(m => String(m.id) !== String(currentDeleteMentorId));
  saveMentors(mentors);
  currentDeleteMentorId = null;
  closeModal("deleteMentorModal");
  renderMentorStats();
  renderMentorTable();
  showToast("Đã xóa Mentor khỏi hệ thống!", "info");
}

// --- MODAL: PHÂN CÔNG THỰC TẬP SINH (CHUẨN SCREENSHOT 3) ---

// Lấy danh sách thực tập sinh đủ điều kiện tiếp nhận & phân công
function getEligibleInterns() {
  const map = new Map();

  // 1. Nguồn từ internList chính thức của hệ thống
  if (Array.isArray(internList)) {
    internList.forEach(i => {
      if (i && (i.id || i.name)) {
        const idKey = String(i.id || i.email || i.name);
        map.set(idKey, {
          id: i.id || idKey,
          name: i.name || "Thực tập sinh",
          email: i.email || "",
          school: i.school || "ĐH Bách Khoa HN",
          major: i.major || "CNTT",
          program: i.program || i.position || "TTS Kỹ thuật phần mềm",
          dept: i.dept || "Kỹ thuật phần mềm",
          mentor: i.mentor || "Chưa gán",
          mentor_id: i.mentor_id || null,
          status: i.status || "Đang thực tập",
          dossierStatus: "Đầy đủ"
        });
      }
    });
  }

  // 2. Nguồn từ applications (các hồ sơ đã được duyệt hoặc đang thực tập)
  if (Array.isArray(applications)) {
    applications.forEach(a => {
      if (a && ["Đã duyệt", "Đang thực tập", "approved"].includes(a.status)) {
        const idKey = String(a.id || a.email || a.name);
        if (!map.has(idKey)) {
          map.set(idKey, {
            id: a.id || idKey,
            name: a.name || "Ứng viên tiếp nhận",
            email: a.email || "",
            school: a.school || "ĐH Bách Khoa HN",
            major: a.major || "CNTT",
            program: a.program || a.position || "TTS Kỹ thuật phần mềm",
            dept: a.dept || "Kỹ thuật phần mềm",
            mentor: a.mentor || "Chưa gán",
            mentor_id: a.mentor_id || null,
            status: a.status,
            dossierStatus: "Đầy đủ"
          });
        }
      }
    });
  }

  // 3. Nguồn từ localStorage cache (nếu đã lưu từ trước)
  try {
    const rawCache = localStorage.getItem("codegym_saved_interns");
    if (rawCache) {
      const parsed = JSON.parse(rawCache);
      if (Array.isArray(parsed)) {
        parsed.forEach(i => {
          if (i && (i.id || i.name)) {
            const idKey = String(i.id || i.email || i.name);
            if (!map.has(idKey)) {
              map.set(idKey, {
                id: i.id || idKey,
                name: i.name,
                email: i.email || "",
                school: i.school || "ĐH Bách Khoa HN",
                major: i.major || "CNTT",
                program: i.program || i.position || "TTS Kỹ thuật phần mềm",
                dept: i.dept || "Kỹ thuật phần mềm",
                mentor: i.mentor || "Chưa gán",
                mentor_id: i.mentor_id || null,
                status: i.status || "Đang thực tập",
                dossierStatus: "Đầy đủ"
              });
            }
          }
        });
      }
    }
  } catch (e) {}

  return Array.from(map.values());
}
window.getEligibleInterns = getEligibleInterns;

function openAssignInternModal(mentorId) {
  const mentors = getMentors();
  const mentor = mentors.find(m => String(m.id) === String(mentorId));
  if (!mentor) {
    showToast("Không tìm thấy thông tin Mentor!", "error");
    return;
  }

  currentAssignMentorId = mentor.id;

  // Lấy danh sách ID TTS đang được gán cho mentor này
  selectedAssignInternIds = new Set((mentor.assignedInternIds || []).map(String));

  // Đồng bộ thêm nếu có TTS trong hệ thống đang mang ID hoặc tên mentor này
  const eligible = getEligibleInterns();
  eligible.forEach(i => {
    if ((i.mentor_id && String(i.mentor_id) === String(mentor.id)) || i.mentor === mentor.name) {
      selectedAssignInternIds.add(String(i.id));
    }
  });

  const nameEl = document.getElementById("assignMentorName");
  const subEl = document.getElementById("assignMentorSubtitle");
  const avatarEl = document.getElementById("assignMentorAvatarBadge");

  if (nameEl) nameEl.textContent = mentor.name;
  if (subEl) subEl.textContent = `${mentor.role || 'Mentor'} · ${mentor.department || 'Chưa gán'}`;
  if (avatarEl) avatarEl.textContent = getMentorInitials(mentor.name);

  // Nạp danh sách bộ lọc Chương trình thực tập
  const progSelect = document.getElementById("assignProgramFilter");
  if (progSelect) {
    const progSet = new Set();
    if (typeof getPrograms === "function") {
      const progs = getPrograms();
      progs.forEach(p => { if (p && p.title) progSet.add(p.title); });
    }
    eligible.forEach(i => { if (i.program) progSet.add(i.program); });

    let progOptions = `<option value="">Tất cả chương trình</option>`;
    progSet.forEach(title => {
      progOptions += `<option value="${escapeHtml(title)}">${escapeHtml(title)}</option>`;
    });
    progSelect.innerHTML = progOptions;
    progSelect.value = "";
  }

  // Nạp danh sách bộ lọc Phòng ban
  const deptSelect = document.getElementById("assignDeptFilter");
  if (deptSelect) {
    const deptSet = new Set();
    const depts = getDepartments();
    depts.forEach(d => { if (d && d.name) deptSet.add(d.name); });
    eligible.forEach(i => { if (i.dept) deptSet.add(i.dept); });

    let deptOptions = `<option value="">Tất cả phòng ban</option>`;
    deptSet.forEach(name => {
      deptOptions += `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`;
    });
    deptSelect.innerHTML = deptOptions;
    deptSelect.value = "";
  }

  // Đặt lại ô tìm kiếm
  const searchInp = document.getElementById("assignInternSearch");
  if (searchInp) searchInp.value = "";

  renderAssignInternList();
  updateAssignCountDisplay();
  openModal("assignInternModal");
}
window.openAssignInternModal = openAssignInternModal;

function renderAssignInternList() {
  const tbody = document.getElementById("assignInternTableBody");
  const checkAll = document.getElementById("checkAllAssignInterns");

  const searchKeyword = (document.getElementById("assignInternSearch")?.value || "").trim().toLowerCase();
  const progFilter = (document.getElementById("assignProgramFilter")?.value || "").trim().toLowerCase();
  const deptFilter = (document.getElementById("assignDeptFilter")?.value || "").trim().toLowerCase();

  const allEligible = getEligibleInterns();

  const filtered = allEligible.filter(intern => {
    if (progFilter && (intern.program || "").toLowerCase() !== progFilter) return false;
    if (deptFilter && (intern.dept || "").toLowerCase() !== deptFilter) return false;
    if (searchKeyword) {
      const matchName = (intern.name || "").toLowerCase().includes(searchKeyword);
      const matchEmail = (intern.email || "").toLowerCase().includes(searchKeyword);
      const matchSchool = (intern.school || "").toLowerCase().includes(searchKeyword);
      const matchMajor = (intern.major || "").toLowerCase().includes(searchKeyword);
      if (!matchName && !matchEmail && !matchSchool && !matchMajor) return false;
    }
    return true;
  });

  if (!tbody) return;

  if (allEligible.length === 0 || filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="assign-empty-cell">
          <div class="empty-folder-box">
            <i class="fa-solid fa-folder-open assign-empty-folder-icon"></i>
            <div class="assign-empty-folder-text">Chưa có thực tập sinh nào đủ điều kiện tiếp nhận.</div>
          </div>
        </td>
      </tr>
    `;
    if (checkAll) {
      checkAll.checked = false;
      checkAll.disabled = true;
    }
    updateAssignCountDisplay();
    return;
  }

  if (checkAll) {
    checkAll.disabled = false;
    checkAll.checked = filtered.length > 0 && filtered.every(i => selectedAssignInternIds.has(String(i.id)));
  }

  tbody.innerHTML = filtered.map(intern => {
    const isChecked = selectedAssignInternIds.has(String(intern.id));
    return `
      <tr>
        <td class="assign-col-check">
          <input type="checkbox" class="assign-row-checkbox" ${isChecked ? 'checked' : ''} onchange="toggleSelectAssignIntern('${intern.id}', this.checked)">
        </td>
        <td>
          <div class="fw-bold text-dark" style="font-size: 13.5px;">${escapeHtml(intern.name)}</div>
          <div class="text-muted small" style="font-size: 12px;">${escapeHtml(intern.email || '')}</div>
        </td>
        <td>
          <div class="text-dark small" style="font-size: 12.5px;">${escapeHtml(intern.school || 'Đại học Bách Khoa')}</div>
          <div class="text-muted small" style="font-size: 11.5px;">${escapeHtml(intern.major || 'CNTT')}</div>
        </td>
        <td>
          <span class="assign-badge-program">
            ${escapeHtml(intern.program || 'TTS Kỹ thuật phần mềm')}
          </span>
        </td>
        <td>
          <span class="assign-badge-dept">
            ${escapeHtml(intern.dept || 'Kỹ thuật')}
          </span>
        </td>
        <td>
          <span class="text-muted small" style="font-size: 12.5px;">${escapeHtml(intern.mentor || 'Chưa gán')}</span>
        </td>
        <td>
          <span class="assign-badge-dossier">Đầy đủ</span>
        </td>
      </tr>
    `;
  }).join("");

  updateAssignCountDisplay();
}
window.renderAssignInternList = renderAssignInternList;

function toggleSelectAssignIntern(internId, checked) {
  const mentors = getMentors();
  const mentor = mentors.find(m => String(m.id) === String(currentAssignMentorId));
  const max = mentor ? (Number(mentor.maxInterns) || 5) : 5;
  const idStr = String(internId);

  if (checked) {
    if (selectedAssignInternIds.size >= max) {
      showToast(`Mentor "${mentor ? mentor.name : ''}" đã đạt số lượng tối đa (${max} TTS)! Không thể phân công thêm.`, "warning");
      renderAssignInternList();
      return;
    }
    selectedAssignInternIds.add(idStr);
  } else {
    selectedAssignInternIds.delete(idStr);
  }

  updateAssignCountDisplay();

  const checkAll = document.getElementById("checkAllAssignInterns");
  if (checkAll) {
    const searchKeyword = (document.getElementById("assignInternSearch")?.value || "").trim().toLowerCase();
    const progFilter = (document.getElementById("assignProgramFilter")?.value || "").trim().toLowerCase();
    const deptFilter = (document.getElementById("assignDeptFilter")?.value || "").trim().toLowerCase();
    const filtered = getEligibleInterns().filter(intern => {
      if (progFilter && (intern.program || "").toLowerCase() !== progFilter) return false;
      if (deptFilter && (intern.dept || "").toLowerCase() !== deptFilter) return false;
      if (searchKeyword) {
        const matchName = (intern.name || "").toLowerCase().includes(searchKeyword);
        const matchEmail = (intern.email || "").toLowerCase().includes(searchKeyword);
        const matchSchool = (intern.school || "").toLowerCase().includes(searchKeyword);
        const matchMajor = (intern.major || "").toLowerCase().includes(searchKeyword);
        if (!matchName && !matchEmail && !matchSchool && !matchMajor) return false;
      }
      return true;
    });
    checkAll.checked = filtered.length > 0 && filtered.every(i => selectedAssignInternIds.has(String(i.id)));
  }
}
window.toggleSelectAssignIntern = toggleSelectAssignIntern;

function toggleSelectAllAssignInterns(checked) {
  const mentors = getMentors();
  const mentor = mentors.find(m => String(m.id) === String(currentAssignMentorId));
  const max = mentor ? (Number(mentor.maxInterns) || 5) : 5;

  const searchKeyword = (document.getElementById("assignInternSearch")?.value || "").trim().toLowerCase();
  const progFilter = (document.getElementById("assignProgramFilter")?.value || "").trim().toLowerCase();
  const deptFilter = (document.getElementById("assignDeptFilter")?.value || "").trim().toLowerCase();

  const filtered = getEligibleInterns().filter(intern => {
    if (progFilter && (intern.program || "").toLowerCase() !== progFilter) return false;
    if (deptFilter && (intern.dept || "").toLowerCase() !== deptFilter) return false;
    if (searchKeyword) {
      const matchName = (intern.name || "").toLowerCase().includes(searchKeyword);
      const matchEmail = (intern.email || "").toLowerCase().includes(searchKeyword);
      const matchSchool = (intern.school || "").toLowerCase().includes(searchKeyword);
      const matchMajor = (intern.major || "").toLowerCase().includes(searchKeyword);
      if (!matchName && !matchEmail && !matchSchool && !matchMajor) return false;
    }
    return true;
  });

  if (checked) {
    let hitLimit = false;
    for (const intern of filtered) {
      const idStr = String(intern.id);
      if (!selectedAssignInternIds.has(idStr)) {
        if (selectedAssignInternIds.size >= max) {
          hitLimit = true;
          break;
        }
        selectedAssignInternIds.add(idStr);
      }
    }
    if (hitLimit) {
      showToast(`Đã chọn tối đa ${max} thực tập sinh cho mentor theo định mức.`, "info");
    }
  } else {
    filtered.forEach(intern => {
      selectedAssignInternIds.delete(String(intern.id));
    });
  }

  renderAssignInternList();
}
window.toggleSelectAllAssignInterns = toggleSelectAllAssignInterns;

function updateAssignCountDisplay() {
  const countText = document.getElementById("selectedInternCountText");
  const curCountEl = document.getElementById("assignMentorCurrentCount");
  const maxCountEl = document.getElementById("assignMentorMaxCount");
  const availCountEl = document.getElementById("assignMentorAvailableCount");

  const mentors = getMentors();
  const mentor = mentors.find(m => String(m.id) === String(currentAssignMentorId));
  const max = mentor ? (Number(mentor.maxInterns) || 5) : 5;
  const count = selectedAssignInternIds.size;
  const avail = Math.max(0, max - count);

  if (countText) {
    countText.innerHTML = `Đã chọn <strong>${count}</strong> thực tập sinh`;
  }
  if (curCountEl) curCountEl.textContent = count;
  if (maxCountEl) maxCountEl.textContent = max;
  if (availCountEl) availCountEl.textContent = avail;
}
window.updateAssignCountDisplay = updateAssignCountDisplay;

async function confirmAssignInterns() {
  if (!currentAssignMentorId) return;
  let mentors = getMentors();
  const mentor = mentors.find(m => String(m.id) === String(currentAssignMentorId));
  if (!mentor) {
    showToast("Không tìm thấy thông tin Mentor!", "error");
    return;
  }

  const assignedArr = Array.from(selectedAssignInternIds).map(String);
  const prevAssignedArr = Array.isArray(mentor.assignedInternIds) ? mentor.assignedInternIds.map(String) : [];
  mentor.assignedInternIds = assignedArr;

  // Nếu TTS này trước đó đang được gán cho một Mentor khác, tự động gỡ khỏi Mentor cũ
  mentors.forEach(otherM => {
    if (String(otherM.id) !== String(mentor.id) && Array.isArray(otherM.assignedInternIds)) {
      otherM.assignedInternIds = otherM.assignedInternIds.filter(id => !assignedArr.includes(String(id)));
    }
  });

  saveMentors(mentors);

  // Đồng bộ và cập nhật trường mentor cho các TTS tương ứng trong internList
  const eligible = getEligibleInterns();
  if (!Array.isArray(internList)) internList = [];

  // Đảm bảo tất cả TTS đủ điều kiện đều có mặt trong internList
  eligible.forEach(elig => {
    const exists = internList.some(i => String(i.id) === String(elig.id));
    if (!exists) {
      internList.push({ ...elig });
    }
  });

  // Cập nhật mentor cho các TTS và gọi API đồng bộ MySQL
  for (const intern of internList) {
    const iId = String(intern.id);
    if (assignedArr.includes(iId)) {
      intern.mentor = mentor.name;
      intern.mentor_id = mentor.id;
      if (mentor.department && mentor.department !== "Chưa gán") {
        intern.dept = mentor.department;
      }
      try {
        if (typeof apiAssignMentor === 'function' && !iId.startsWith('app_') && !iId.startsWith('mock_')) {
          await apiAssignMentor({ intern_id: intern.id, mentor_name: mentor.name, mentor_id: mentor.id });
        }
      } catch (err) {
        console.warn("Lỗi sync assign mentor:", err);
      }
    } else if (intern.mentor === mentor.name || (intern.mentor_id && String(intern.mentor_id) === String(mentor.id)) || prevAssignedArr.includes(iId)) {
      intern.mentor = "Chưa gán";
      intern.mentor_id = null;
      try {
        if (typeof apiAssignMentor === 'function' && !iId.startsWith('app_') && !iId.startsWith('mock_')) {
          await apiAssignMentor({ intern_id: intern.id, mentor_name: "Chưa gán", mentor_id: null });
        }
      } catch (err) {
        console.warn("Lỗi sync unassign mentor:", err);
      }
    }
  }

  try {
    localStorage.setItem("codegym_saved_interns", JSON.stringify(internList));
  } catch (e) {}

  // Cập nhật applications nếu có
  if (Array.isArray(applications)) {
    applications.forEach(a => {
      const aId = String(a.id);
      if (assignedArr.includes(aId)) {
        a.mentor = mentor.name;
        a.mentor_id = mentor.id;
        if (mentor.department && mentor.department !== "Chưa gán") {
          a.dept = mentor.department;
        }
      } else if (a.mentor === mentor.name || (a.mentor_id && String(a.mentor_id) === String(mentor.id)) || prevAssignedArr.includes(aId)) {
        a.mentor = "Chưa gán";
        a.mentor_id = null;
      }
    });
  }

  closeModal("assignInternModal");
  renderMentorStats();
  renderMentorTable();
  renderDeptTable();
  if (typeof filterData === "function") filterData();
  if (typeof renderOverview === "function") renderOverview();
  showToast(`Phân công ${assignedArr.length} thực tập sinh cho mentor "${mentor.name}" thành công!`, "success");
}
window.confirmAssignInterns = confirmAssignInterns;

// --- SUB-VIEW: QUẢN LÝ PHÒNG BAN ---
function renderDeptTable() {
  const tbody = document.getElementById("deptTableBody");
  const table = document.getElementById("deptMainTable");
  const emptyState = document.getElementById("deptEmptyState");
  const depts = getDepartments();
  const mentors = getMentors();
  const searchKeyword = (document.getElementById("searchDeptKeyword")?.value || "").trim().toLowerCase();

  if (!tbody) return;

  let filtered = depts.filter(d => {
    if (searchKeyword) {
      const matchName = (d.name || "").toLowerCase().includes(searchKeyword);
      const matchCode = (d.code || "").toLowerCase().includes(searchKeyword);
      const matchDesc = (d.desc || "").toLowerCase().includes(searchKeyword);
      if (!matchName && !matchCode && !matchDesc) return false;
    }
    return true;
  });

  if (depts.length === 0 || filtered.length === 0) {
    if (table) {
      table.style.display = "none";
      table.classList.add("d-none");
    }
    if (emptyState) {
      emptyState.style.display = "block";
      emptyState.classList.remove("d-none");
    }
    tbody.innerHTML = "";
    return;
  }

  if (table) {
    table.style.display = "table";
    table.classList.remove("d-none");
  }
  if (emptyState) {
    emptyState.style.display = "none";
    emptyState.classList.add("d-none");
  }

  tbody.innerHTML = filtered.map(d => {
    const deptMentors = mentors.filter(m => (m.department || "").trim().toLowerCase() === (d.name || "").trim().toLowerCase());
    const mentorCount = deptMentors.length;
    let internCount = deptMentors.reduce((sum, m) => sum + ((m.assignedInternIds && m.assignedInternIds.length) || 0), 0);
    if (internCount === 0 && Array.isArray(internList)) {
      internCount = internList.filter(i => (i.dept || "").trim().toLowerCase() === (d.name || "").trim().toLowerCase()).length;
    }

    return `
      <tr>
        <td>
          <span class="dept-code-tag">${escapeHtml(d.code || 'PB')}</span>
        </td>
        <td>
          <div class="dept-cell-flex">
            <div class="dept-compact-avatar">
              <i class="fa-solid fa-building"></i>
            </div>
            <div class="dept-compact-info">
              <span class="dept-compact-name">${escapeHtml(d.name)}</span>
              <span class="dept-compact-desc">${escapeHtml(d.desc || 'Chưa có mô tả bổ sung')}</span>
            </div>
          </div>
        </td>
        <td>
          <span class="dept-metric-pill ${mentorCount > 0 ? 'mentor-active' : 'metric-zero'}">
            <i class="fa-solid fa-user-tie me-1"></i>${mentorCount} Mentor
          </span>
        </td>
        <td>
          <span class="dept-metric-pill ${internCount > 0 ? 'intern-active' : 'metric-zero'}">
            <i class="fa-solid fa-graduation-cap me-1"></i>${internCount} TTS
          </span>
        </td>
        <td style="text-align: right;">
          <div class="mentor-action-icons-wrap">
            <button type="button" class="btn-mentor-action-icon" title="Chỉnh sửa phòng ban" onclick="openEditDeptModal('${d.id}')">
              <i class="fa-regular fa-pen-to-square"></i>
            </button>
            <button type="button" class="btn-mentor-action-icon btn-delete-icon" title="Xóa phòng ban" onclick="deleteDept('${d.id}')">
              <i class="fa-regular fa-trash-can"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

function openAddDeptModal() {
  const idInp = document.getElementById("deptEditId");
  const codeInp = document.getElementById("deptFormCode");
  const nameInp = document.getElementById("deptFormName");
  const descInp = document.getElementById("deptFormDesc");
  const title = document.getElementById("deptModalTitle");

  if (title) title.textContent = "Thêm phòng ban mới";
  if (idInp) idInp.value = "";
  if (codeInp) codeInp.value = "";
  if (nameInp) nameInp.value = "";
  if (descInp) descInp.value = "";

  openModal("deptModal");
}

function openEditDeptModal(deptId) {
  const depts = getDepartments();
  const d = depts.find(item => item.id === deptId);
  if (!d) return;

  const idInp = document.getElementById("deptEditId");
  const codeInp = document.getElementById("deptFormCode");
  const nameInp = document.getElementById("deptFormName");
  const descInp = document.getElementById("deptFormDesc");
  const title = document.getElementById("deptModalTitle");

  if (title) title.textContent = "Chỉnh sửa phòng ban";
  if (idInp) idInp.value = d.id;
  if (codeInp) codeInp.value = d.code || "";
  if (nameInp) nameInp.value = d.name || "";
  if (descInp) descInp.value = d.desc || "";

  openModal("deptModal");
}

function handleSaveDept(event) {
  if (event) event.preventDefault();
  const id = document.getElementById("deptEditId")?.value;
  const code = (document.getElementById("deptFormCode")?.value || "").trim().toUpperCase();
  const name = (document.getElementById("deptFormName")?.value || "").trim();
  const desc = (document.getElementById("deptFormDesc")?.value || "").trim();

  if (!name) {
    showToast("Vui lòng nhập tên phòng ban!", "warning");
    return;
  }

  // Khôi phục phòng ban nếu trước đó bị đưa vào danh sách xóa
  try {
    let deletedNames = JSON.parse(localStorage.getItem("hr_deleted_depts") || "[]");
    deletedNames = deletedNames.filter(n => n !== name.toLowerCase());
    localStorage.setItem("hr_deleted_depts", JSON.stringify(deletedNames));
  } catch (e) {}

  let depts = getDepartments();
  if (id) {
    const idx = depts.findIndex(d => d.id === id);
    if (idx !== -1) {
      depts[idx] = { ...depts[idx], code: code || name.substring(0, 3).toUpperCase(), name, desc };
    }
    showToast("Cập nhật phòng ban thành công!", "success");
  } else {
    depts.push({
      id: "dept_" + Date.now(),
      code: code || generateDeptCode(name),
      name,
      desc
    });
    showToast("Thêm phòng ban mới thành công!", "success");
  }

  saveDepartments(depts);
  closeModal("deptModal");
  updateDeptDropdowns();
  renderMentorStats();
  renderDeptTable();
}

function deleteDept(deptId) {
  let depts = getDepartments();
  const target = depts.find(d => d.id === deptId);
  if (!target) return;

  // Kiểm tra xem phòng ban có đang có mentor phụ trách không
  const mentors = getMentors();
  const hasMentor = mentors.some(m => (m.department || "").trim().toLowerCase() === (target.name || "").trim().toLowerCase());
  if (hasMentor) {
    showToast(`Không thể xóa phòng ban "${target.name}" vì đang có Mentor trực thuộc! Vui lòng thay đổi phòng ban của Mentor trước.`, "warning");
    return;
  }

  if (!confirm(`Bạn có chắc chắn muốn xóa phòng ban "${target.name}" không?`)) return;

  depts = depts.filter(d => d.id !== deptId);
  saveDepartments(depts);

  try {
    let deletedNames = JSON.parse(localStorage.getItem("hr_deleted_depts") || "[]");
    if (!deletedNames.includes(target.name.toLowerCase())) {
      deletedNames.push(target.name.toLowerCase());
      localStorage.setItem("hr_deleted_depts", JSON.stringify(deletedNames));
    }
  } catch (e) {}

  updateDeptDropdowns();
  renderMentorStats();
  renderDeptTable();
  showToast(`Đã xóa phòng ban "${target.name}"!`, "info");
}

// Gắn toàn bộ hàm của module Mentor & Phòng ban vào window
window.initMentorsTab = initMentorsTab;
window.switchMentorSubTab = switchMentorSubTab;
window.renderMentorStats = renderMentorStats;
window.renderMentorTable = renderMentorTable;
window.openAddMentorModal = openAddMentorModal;
window.handleAddMentorSubmit = handleAddMentorSubmit;
window.openEditMentorModal = openEditMentorModal;
window.handleEditMentorSubmit = handleEditMentorSubmit;
window.openDeleteMentorModal = openDeleteMentorModal;
window.confirmDeleteMentor = confirmDeleteMentor;
window.openAssignInternModal = openAssignInternModal;
window.renderAssignInternList = renderAssignInternList;
window.toggleSelectAssignIntern = toggleSelectAssignIntern;
window.toggleSelectAllAssignInterns = toggleSelectAllAssignInterns;
window.confirmAssignInterns = confirmAssignInterns;
window.openAddDeptModal = openAddDeptModal;
window.openEditDeptModal = openEditDeptModal;
window.handleSaveDept = handleSaveDept;
window.deleteDept = deleteDept;
window.renderDeptTable = renderDeptTable;
window.handleMentorHeaderAction = handleMentorHeaderAction;
window.updateMentorHeaderButton = updateMentorHeaderButton;

// ==========================================================================
// 17. PHÂN HỆ BÁO CÁO & THỐNG KÊ (REPORTS & ANALYTICS) - 100% FRONTEND ONLY
// KHÔNG CHÈN DỮ LIỆU CỨNG, KHỞI TẠO ĐỂ TRỐNG (0), TỰ ĐỘNG TỔNG HỢP KHI CÓ DỮ LIỆU
// ==========================================================================

let reportFilters = {
  program: "",
  dept: "",
  univ: "",
  startDate: "",
  endDate: ""
};

// Chuẩn hóa chuỗi ngày tháng dd/mm/yyyy thành yyyy-mm-dd để so sánh
function normalizeReportDate(dateStr) {
  if (!dateStr) return null;
  const str = String(dateStr).trim();
  if (str.includes("/")) {
    const parts = str.split("/");
    if (parts.length === 3) {
      if (parts[2].length === 4) {
        return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
      }
    }
  }
  return str;
}

// Lấy thông tin Quý/Năm từ chuỗi ngày (e.g. "Q2/2026")
function getQuarterFromDate(dateStr) {
  const norm = normalizeReportDate(dateStr);
  if (!norm) return null;
  const d = new Date(norm);
  if (isNaN(d.getTime())) return null;
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const q = Math.ceil(month / 3);
  return `Q${q}/${year}`;
}

// Lọc danh sách TTS theo bộ lọc hiện tại (hoàn toàn dựa trên dữ liệu thật, không mock)
function getEligibleReportInterns() {
  const sourceList = (typeof window !== "undefined" && Array.isArray(window.internList) && window.internList.length > 0)
    ? window.internList
    : (Array.isArray(internList) ? internList : []);

  if (sourceList.length === 0) {
    return [];
  }

  return sourceList.filter((intern) => {
    // 1. Lọc theo chương trình
    if (reportFilters.program) {
      const prog = (intern.program || intern.position || intern.major || "").toLowerCase();
      if (!prog.includes(reportFilters.program.toLowerCase())) {
        return false;
      }
    }

    // 2. Lọc theo phòng ban
    if (reportFilters.dept) {
      const dept = (intern.dept || "").toLowerCase();
      if (dept !== reportFilters.dept.toLowerCase()) {
        return false;
      }
    }

    // 3. Lọc theo trường đại học
    if (reportFilters.univ) {
      const school = (intern.school || "").toLowerCase();
      if (school !== reportFilters.univ.toLowerCase()) {
        return false;
      }
    }

    // 4. Lọc theo ngày bắt đầu
    if (reportFilters.startDate) {
      const internStart = normalizeReportDate(intern.startDate || intern.start_date || intern.startFormatted);
      if (internStart && internStart < reportFilters.startDate) {
        return false;
      }
    }

    // 5. Lọc theo ngày kết thúc
    if (reportFilters.endDate) {
      const internEnd = normalizeReportDate(intern.endDate || intern.end_date || intern.endFormatted);
      if (internEnd && internEnd > reportFilters.endDate) {
        return false;
      }
    }

    return true;
  });
}

// Cập nhật các lựa chọn dropdown trong Bộ lọc báo cáo từ dữ liệu thực tế
function populateReportFilterOptions() {
  const sourceList = (typeof window !== "undefined" && Array.isArray(window.internList) && window.internList.length > 0)
    ? window.internList
    : (Array.isArray(internList) ? internList : []);

  const progSelect = document.getElementById("reportFilterProgram");
  const deptSelect = document.getElementById("reportFilterDept");
  const univSelect = document.getElementById("reportFilterUniv");

  // 1. Dropdown Chương trình
  if (progSelect) {
    const curVal = progSelect.value;
    const progSet = new Set();
    if (Array.isArray(internshipPrograms)) {
      internshipPrograms.forEach((p) => {
        if (p && p.name) progSet.add(p.name);
      });
    }
    if (Array.isArray(sourceList)) {
      sourceList.forEach((i) => {
        if (i.program) progSet.add(i.program);
        else if (i.position) progSet.add(i.position);
      });
    }

    let html = `<option value="">Tất cả chương trình</option>`;
    progSet.forEach((p) => {
      html += `<option value="${p}">${p}</option>`;
    });
    progSelect.innerHTML = html;
    if (curVal && progSet.has(curVal)) {
      progSelect.value = curVal;
    }
  }

  // 2. Dropdown Phòng ban
  if (deptSelect) {
    const curVal = deptSelect.value;
    const deptSet = new Set();
    if (typeof getDepartments === "function") {
      const depts = getDepartments();
      depts.forEach((d) => {
        if (d && d.name) deptSet.add(d.name);
      });
    }
    if (Array.isArray(sourceList)) {
      sourceList.forEach((i) => {
        if (i.dept) deptSet.add(i.dept);
      });
    }

    let html = `<option value="">Tất cả phòng ban</option>`;
    deptSet.forEach((d) => {
      html += `<option value="${d}">${d}</option>`;
    });
    deptSelect.innerHTML = html;
    if (curVal && deptSet.has(curVal)) {
      deptSelect.value = curVal;
    }
  }

  // 3. Dropdown Trường đại học
  if (univSelect) {
    const curVal = univSelect.value;
    const univSet = new Set();
    if (Array.isArray(sourceList)) {
      sourceList.forEach((i) => {
        if (i.school) univSet.add(i.school);
      });
    }

    let html = `<option value="">Tất cả trường đại học</option>`;
    univSet.forEach((u) => {
      html += `<option value="${u}">${u}</option>`;
    });
    univSelect.innerHTML = html;
    if (curVal && univSet.has(curVal)) {
      univSelect.value = curVal;
    }
  }
}

// Khởi chạy / hiển thị tab Báo cáo & Thống kê
function renderReportsTab() {
  populateReportFilterOptions();
  renderReportDashboard();
}

// Áp dụng bộ lọc
function applyReportFilters() {
  const progSelect = document.getElementById("reportFilterProgram");
  const deptSelect = document.getElementById("reportFilterDept");
  const univSelect = document.getElementById("reportFilterUniv");
  const startDateInput = document.getElementById("reportFilterStartDate");
  const endDateInput = document.getElementById("reportFilterEndDate");

  reportFilters.program = progSelect ? progSelect.value : "";
  reportFilters.dept = deptSelect ? deptSelect.value : "";
  reportFilters.univ = univSelect ? univSelect.value : "";
  reportFilters.startDate = startDateInput ? startDateInput.value : "";
  reportFilters.endDate = endDateInput ? endDateInput.value : "";

  renderReportDashboard();
}

// Đặt lại bộ lọc
function resetReportFilters() {
  const progSelect = document.getElementById("reportFilterProgram");
  const deptSelect = document.getElementById("reportFilterDept");
  const univSelect = document.getElementById("reportFilterUniv");
  const startDateInput = document.getElementById("reportFilterStartDate");
  const endDateInput = document.getElementById("reportFilterEndDate");

  if (progSelect) progSelect.value = "";
  if (deptSelect) deptSelect.value = "";
  if (univSelect) univSelect.value = "";
  if (startDateInput) startDateInput.value = "";
  if (endDateInput) endDateInput.value = "";

  reportFilters = {
    program: "",
    dept: "",
    univ: "",
    startDate: "",
    endDate: ""
  };

  renderReportDashboard();
}

// Render toàn bộ giao diện dashboard báo cáo
function renderReportDashboard() {
  const list = getEligibleReportInterns();

  renderReportTopStats(list);
  renderReportQuarterChart(list);
  renderReportUniversityDistribution(list);
  renderReportBottomStats(list);
  renderReportTable(list);
}

// Render 4 thẻ thống kê con số tổng quan ở phía trên
function renderReportTopStats(list) {
  const elAccepted = document.getElementById("reportStatAccepted");
  const elCompletionRate = document.getElementById("reportStatCompletionRate");
  const elEvaluated = document.getElementById("reportStatEvaluated");
  const elAvgScore = document.getElementById("reportStatAvgScore");

  const total = list.length;
  const completed = list.filter((i) => {
    const s = (i.status || "").toLowerCase();
    return s.includes("hoàn thành") || s.includes("kết thúc");
  }).length;

  const evaluatedList = list.filter((i) => {
    return (
      (i.score !== undefined && i.score !== null && i.score !== "" && i.score !== "—") ||
      (i.evaluationScore !== undefined && i.evaluationScore !== null && i.evaluationScore !== "" && i.evaluationScore !== "—")
    );
  });

  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  let avgScoreStr = "—";
  if (evaluatedList.length > 0) {
    const sum = evaluatedList.reduce((acc, cur) => {
      const val = parseFloat(cur.score || cur.evaluationScore || 0);
      return acc + (isNaN(val) ? 0 : val);
    }, 0);
    avgScoreStr = (sum / evaluatedList.length).toFixed(1);
  }

  if (elAccepted) elAccepted.textContent = total;
  if (elCompletionRate) elCompletionRate.textContent = `${completionRate}%`;
  if (elEvaluated) elEvaluated.textContent = evaluatedList.length;
  if (elAvgScore) elAvgScore.textContent = avgScoreStr;
}

// Render Biểu đồ thực tập sinh theo quý
function renderReportQuarterChart(list) {
  const container = document.getElementById("reportQuarterChartContainer");
  if (!container) return;

  // Thu thập các quý từ dữ liệu thực tế
  const quarterMap = {};
  const defaultQuarters = ["Q2/2026", "Q3/2026", "Q4/2026"];

  defaultQuarters.forEach((q) => {
    quarterMap[q] = { accepted: 0, completed: 0 };
  });

  if (list && list.length > 0) {
    list.forEach((intern) => {
      const q = getQuarterFromDate(intern.startDate || intern.start_date || intern.startFormatted) || "Q3/2026";
      if (!quarterMap[q]) {
        quarterMap[q] = { accepted: 0, completed: 0 };
      }
      quarterMap[q].accepted += 1;

      const s = (intern.status || "").toLowerCase();
      if (s.includes("hoàn thành") || s.includes("kết thúc")) {
        quarterMap[q].completed += 1;
      }
    });
  }

  const quarters = Object.keys(quarterMap);
  let maxCount = 0;
  quarters.forEach((q) => {
    if (quarterMap[q].accepted > maxCount) maxCount = quarterMap[q].accepted;
    if (quarterMap[q].completed > maxCount) maxCount = quarterMap[q].completed;
  });

  const maxHeightPx = 160;
  let html = "";

  quarters.forEach((q) => {
    const data = quarterMap[q];
    const accHeight = maxCount > 0 && data.accepted > 0 ? Math.max(8, Math.round((data.accepted / maxCount) * maxHeightPx)) : 4;
    const compHeight = maxCount > 0 && data.completed > 0 ? Math.max(8, Math.round((data.completed / maxCount) * maxHeightPx)) : 4;

    html += `
      <div class="quarter-col">
        <div class="quarter-bars">
          <div class="bar-item blue" style="height: ${accHeight}px;">
            <div class="bar-tooltip">${data.accepted} Tiếp nhận</div>
          </div>
          <div class="bar-item green" style="height: ${compHeight}px;">
            <div class="bar-tooltip">${data.completed} Hoàn thành</div>
          </div>
        </div>
        <div class="quarter-label">${q}</div>
      </div>
    `;
  });

  container.innerHTML = html;
}

// Render Phân bổ theo trường đại học
function renderReportUniversityDistribution(list) {
  const container = document.getElementById("reportUniversityList");
  if (!container) return;

  if (!list || list.length === 0) {
    container.innerHTML = `
      <div class="empty-report-state">
        <i class="fa-solid fa-graduation-cap"></i>
        <p>Chưa có dữ liệu phân bổ trường đại học</p>
      </div>
    `;
    return;
  }

  const schoolMap = {};
  list.forEach((intern) => {
    const school = intern.school || "Chưa cập nhật";
    schoolMap[school] = (schoolMap[school] || 0) + 1;
  });

  const schools = Object.keys(schoolMap).map((name) => ({
    name,
    count: schoolMap[name]
  }));

  schools.sort((a, b) => b.count - a.count);
  const maxSchoolCount = schools.length > 0 ? schools[0].count : 1;

  let html = "";
  schools.forEach((item) => {
    const percent = Math.round((item.count / maxSchoolCount) * 100);
    html += `
      <div class="school-item">
        <div class="school-name" title="${item.name}">${item.name}</div>
        <div class="school-bar-track">
          <div class="school-bar-fill" style="width: ${percent}%;"></div>
        </div>
        <div class="school-count">${item.count} TTS</div>
      </div>
    `;
  });

  container.innerHTML = html;
}

// Render 5 Thẻ tóm tắt kết quả thực tập cuối kỳ
function renderReportBottomStats(list) {
  const elTotal = document.getElementById("reportBottomTotal");
  const elCompleted = document.getElementById("reportBottomCompleted");
  const elActive = document.getElementById("reportBottomActive");
  const elIncomplete = document.getElementById("reportBottomIncomplete");
  const elEvaluated = document.getElementById("reportBottomEvaluated");

  const total = list.length;
  const completed = list.filter((i) => {
    const s = (i.status || "").toLowerCase();
    return s.includes("hoàn thành") || s.includes("kết thúc");
  }).length;

  const active = list.filter((i) => {
    const s = (i.status || "").toLowerCase();
    return s.includes("đang thực tập") || s === "" || s === "chưa xếp lịch";
  }).length;

  const incomplete = list.filter((i) => {
    const s = (i.status || "").toLowerCase();
    return s.includes("chưa hoàn thành") || s.includes("tạm dừng") || s.includes("thôi việc") || s.includes("hủy");
  }).length;

  const evaluated = list.filter((i) => {
    return (
      (i.score !== undefined && i.score !== null && i.score !== "" && i.score !== "—") ||
      (i.evaluationScore !== undefined && i.evaluationScore !== null && i.evaluationScore !== "" && i.evaluationScore !== "—")
    );
  }).length;

  if (elTotal) elTotal.textContent = total;
  if (elCompleted) elCompleted.textContent = completed;
  if (elActive) elActive.textContent = active;
  if (elIncomplete) elIncomplete.textContent = incomplete;
  if (elEvaluated) elEvaluated.textContent = evaluated;
}

// Render Bảng danh sách kết quả chi tiết
function renderReportTable(list) {
  const tbody = document.getElementById("reportTableBody");
  if (!tbody) return;

  if (!list || list.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9">
          <div class="empty-report-state">
            <i class="fa-solid fa-folder-open"></i>
            <p>Chưa có dữ liệu kết quả chi tiết</p>
            <span style="font-size: 12.5px; color: #94a3b8; margin-top: 4px;">Dữ liệu sẽ tự động tổng hợp khi có hồ sơ thực tập sinh</span>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  let html = "";
  list.forEach((intern, idx) => {
    const code = `TTS-${String(intern.id || idx + 1).padStart(3, "0")}`;
    const name = intern.name || "—";
    const school = intern.school || "—";
    const major = intern.major || "";
    const dept = intern.dept || "—";
    const program = intern.program || (intern.position ? intern.position.replace(/^Thực tập sinh\s*/i, "") : "—");
    const mentor = intern.mentor || "Chưa phân công";

    // Chuyên cần
    let attText = "100%";
    if (intern.attendanceRate) {
      attText = intern.attendanceRate;
    } else if (typeof attendanceRecords !== "undefined" && attendanceRecords) {
      const recs = Object.values(attendanceRecords).filter((r) => r && r.intern_id === intern.id);
      if (recs.length > 0) {
        const presentCount = recs.filter((r) => r.status === "Có mặt").length;
        attText = `${Math.round((presentCount / recs.length) * 100)}%`;
      }
    }

    // Điểm đánh giá & xếp loại
    const rawScore = intern.score || intern.evaluationScore;
    let scoreDisplay = "—";
    let gradeBadge = `<span class="report-grade-badge grade-pending">Chưa đánh giá</span>`;

    if (rawScore !== undefined && rawScore !== null && rawScore !== "" && rawScore !== "—") {
      const num = parseFloat(rawScore);
      if (!isNaN(num)) {
        scoreDisplay = num.toFixed(1);
        if (num >= 9.0) {
          gradeBadge = `<span class="report-grade-badge grade-excellent">Xuất sắc</span>`;
        } else if (num >= 8.0) {
          gradeBadge = `<span class="report-grade-badge grade-good">Giỏi</span>`;
        } else if (num >= 6.5) {
          gradeBadge = `<span class="report-grade-badge grade-fair">Khá</span>`;
        } else if (num >= 5.0) {
          gradeBadge = `<span class="report-grade-badge grade-pass">Trung bình</span>`;
        } else {
          gradeBadge = `<span class="report-grade-badge grade-fail">Chưa đạt</span>`;
        }
      }
    }

    html += `
      <tr>
        <td><strong class="text-primary">${code}</strong></td>
        <td><strong>${name}</strong></td>
        <td>
          <div class="fw-semibold text-dark">${school}</div>
          ${major ? `<div class="text-muted" style="font-size: 12px;">${major}</div>` : ""}
        </td>
        <td>${dept}</td>
        <td>${program}</td>
        <td>${mentor}</td>
        <td><span class="fw-semibold">${attText}</span></td>
        <td><span class="fw-bold">${scoreDisplay}</span></td>
        <td>${gradeBadge}</td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
}

// Xuất file Excel (CSV kèm UTF-8 BOM chuẩn tiếng Việt)
function exportReportExcel() {
  const list = getEligibleReportInterns();
  if (!list || list.length === 0) {
    if (typeof showToast === "function") {
      showToast("Không có dữ liệu thực tập sinh để xuất Excel!", "warning");
    } else {
      alert("Không có dữ liệu thực tập sinh để xuất Excel!");
    }
    return;
  }

  let csvContent = "\uFEFF"; // UTF-8 BOM
  csvContent += "MÃ TTS,HỌ TÊN,TRƯỜNG,NGÀNH,PHÒNG BAN,CHƯƠNG TRÌNH,MENTOR PHỤ TRÁCH,CHUYÊN CẦN,ĐIỂM ĐÁNH GIÁ,XẾP LOẠI\n";

  list.forEach((intern, idx) => {
    const code = `TTS-${String(intern.id || idx + 1).padStart(3, "0")}`;
    const name = `"${(intern.name || "").replace(/"/g, '""')}"`;
    const school = `"${(intern.school || "").replace(/"/g, '""')}"`;
    const major = `"${(intern.major || "").replace(/"/g, '""')}"`;
    const dept = `"${(intern.dept || "").replace(/"/g, '""')}"`;
    const program = `"${(intern.program || intern.position || "").replace(/"/g, '""')}"`;
    const mentor = `"${(intern.mentor || "Chưa phân công").replace(/"/g, '""')}"`;
    const att = intern.attendanceRate || "100%";
    const score = intern.score || intern.evaluationScore || "—";

    let grade = "Chưa đánh giá";
    if (score && score !== "—") {
      const num = parseFloat(score);
      if (!isNaN(num)) {
        if (num >= 9.0) grade = "Xuất sắc";
        else if (num >= 8.0) grade = "Giỏi";
        else if (num >= 6.5) grade = "Khá";
        else if (num >= 5.0) grade = "Trung bình";
        else grade = "Chưa đạt";
      }
    }

    csvContent += `${code},${name},${school},${major},${dept},${program},${mentor},${att},${score},${grade}\n`;
  });

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `Bao_Cao_Thong_Ke_Thuc_Tap_Sinh_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  if (typeof showToast === "function") {
    showToast("Đã xuất báo cáo Excel thành công!", "success");
  }
}

// Xuất file PDF (Kích hoạt hộp thoại in / xuất PDF của trình duyệt)
function exportReportPDF() {
  window.print();
}

// Gắn toàn bộ hàm của module Báo cáo & Thống kê vào window
window.renderReportsTab = renderReportsTab;
window.populateReportFilterOptions = populateReportFilterOptions;
window.applyReportFilters = applyReportFilters;
window.resetReportFilters = resetReportFilters;
window.renderReportDashboard = renderReportDashboard;
window.renderReportTopStats = renderReportTopStats;
window.renderReportQuarterChart = renderReportQuarterChart;
window.renderReportUniversityDistribution = renderReportUniversityDistribution;
window.renderReportBottomStats = renderReportBottomStats;
window.renderReportTable = renderReportTable;
window.exportReportExcel = exportReportExcel;
window.exportReportPDF = exportReportPDF;

// ==============================================================================
// MODULE CÔNG VIỆC, BÁO CÁO TUẦN, ĐÁNH GIÁ & LỊCH HỌP (SPRINT 3: STT 15, 18, 19, 20, 35)
// ==============================================================================

let currentTaskSubTab = 'tasks';
let loadedTasksList = [];
let loadedWeeklyReportsList = [];
let loadedEvaluationsList = [];

function initTasksTab() {
  populateTaskInternSelects();
  switchTaskSubTab(currentTaskSubTab || 'tasks');
}

function switchTaskSubTab(subTab) {
  currentTaskSubTab = subTab;
  const btnTasks = document.getElementById('btnTaskSubTabTasks');
  const btnReports = document.getElementById('btnTaskSubTabReports');
  const btnEvals = document.getElementById('btnTaskSubTabEvals');

  const viewTasks = document.getElementById('viewTaskSubTasks');
  const viewReports = document.getElementById('viewTaskSubReports');
  const viewEvals = document.getElementById('viewTaskSubEvals');

  const activeStyle = 'padding: 8px 16px; border-radius: 8px; border: none; background: #0d6efd; color: #fff; font-weight: 600; cursor: pointer;';
  const inactiveStyle = 'padding: 8px 16px; border-radius: 8px; border: 1px solid #cbd5e1; background: #fff; color: #475569; font-weight: 600; cursor: pointer;';

  if (btnTasks) btnTasks.style.cssText = subTab === 'tasks' ? activeStyle : inactiveStyle;
  if (btnReports) btnReports.style.cssText = subTab === 'reports' ? activeStyle : inactiveStyle;
  if (btnEvals) btnEvals.style.cssText = subTab === 'evals' ? activeStyle : inactiveStyle;

  if (viewTasks) viewTasks.style.display = subTab === 'tasks' ? 'block' : 'none';
  if (viewReports) viewReports.style.display = subTab === 'reports' ? 'block' : 'none';
  if (viewEvals) viewEvals.style.display = subTab === 'evals' ? 'block' : 'none';

  if (subTab === 'tasks') loadTasksFromAPI();
  else if (subTab === 'reports') loadWeeklyReportsFromAPI();
  else if (subTab === 'evals') loadEvaluationsFromAPI();
}

function populateTaskInternSelects() {
  const list = (typeof internList !== 'undefined' && Array.isArray(internList)) ? internList : [];
  const selects = ['taskInternSelect', 'evalInternSelect', 'meetingInternSelect'];

  selects.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const isMulti = el.hasAttribute('multiple');
    let opts = isMulti ? '' : '<option value="">-- Chọn thực tập sinh --</option>';

    list.forEach(i => {
      opts += `<option value="${i.id}">${i.name} (${i.major || i.dept || 'TTS'}) - ${i.email}</option>`;
    });
    el.innerHTML = opts;
  });
}

// 1. NHIỆM VỤ (STT 15, 16)
async function loadTasksFromAPI() {
  const tbody = document.getElementById('tasksTableBody');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4 text-muted"><i class="fa-solid fa-spinner fa-spin me-2"></i>Đang tải danh sách nhiệm vụ từ MySQL...</td></tr>';

  let tasks = [];
  if (typeof apiGetTasks === 'function') {
    const res = await apiGetTasks();
    if (res && res.success && Array.isArray(res.data)) {
      tasks = res.data;
    }
  }

  loadedTasksList = tasks;
  if (tasks.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4 text-muted">Chưa có nhiệm vụ nào được giao. Bấm "Giao nhiệm vụ" để tạo mới!</td></tr>';
    return;
  }

  tbody.innerHTML = tasks.map(t => {
    const p = Number(t.progress) || 0;
    let badgeClass = 'bg-secondary';
    let statusText = 'Chưa làm';
    if (t.status === 'done' || p >= 100) { badgeClass = 'bg-success'; statusText = 'Đã hoàn thành'; }
    else if (t.status === 'in_progress' || p > 0) { badgeClass = 'bg-primary'; statusText = 'Đang thực hiện'; }
    else if (t.status === 'review') { badgeClass = 'bg-warning text-dark'; statusText = 'Chờ review'; }

    let priorityBadge = '<span class="badge bg-light text-dark border">Trung bình</span>';
    if (t.priority === 'urgent') priorityBadge = '<span class="badge bg-danger">Khẩn cấp</span>';
    else if (t.priority === 'high') priorityBadge = '<span class="badge bg-warning text-dark">Cao</span>';
    else if (t.priority === 'low') priorityBadge = '<span class="badge bg-info text-dark">Thấp</span>';

    return `
      <tr>
        <td>
          <div style="font-weight: 600; color: #0f172a;">${t.title}</div>
          <div style="font-size: 12px; color: #64748b;">${t.description ? t.description.slice(0, 50) + '...' : 'Không có mô tả'}</div>
        </td>
        <td>
          <strong>${t.intern_name || 'TTS #' + t.intern_id}</strong>
          <div style="font-size: 11px; color: #64748b;">${t.intern_email || ''}</div>
        </td>
        <td>${t.deadline ? new Date(t.deadline).toLocaleDateString('vi-VN') : '<span class="text-muted">Không hạn</span>'}</td>
        <td>${priorityBadge}</td>
        <td style="min-width: 140px;">
          <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 3px;">
            <span>Tiến độ</span>
            <strong>${p}%</strong>
          </div>
          <div style="height: 6px; background: #e2e8f0; border-radius: 4px; overflow: hidden;">
            <div style="width: ${p}%; height: 100%; background: ${p >= 100 ? '#16a34a' : '#0d6efd'};"></div>
          </div>
        </td>
        <td><span class="badge ${badgeClass}">${statusText}</span></td>
        <td style="text-align: right;">
          <button type="button" class="btn-action-icon text-danger" onclick="deleteTaskItem(${t.id})" title="Xóa nhiệm vụ">
            <i class="fa-regular fa-trash-can"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function openCreateTaskModal() {
  populateTaskInternSelects();
  const form = document.getElementById('createTaskForm');
  if (form) form.reset();
  openModal('createTaskModal');
}

async function handleCreateTaskSubmit(e) {
  if (e) e.preventDefault();
  const internId = document.getElementById('taskInternSelect')?.value;
  const title = document.getElementById('taskTitle')?.value?.trim();
  const deadline = document.getElementById('taskDeadline')?.value;
  const priority = document.getElementById('taskPriority')?.value || 'medium';
  const description = document.getElementById('taskDescription')?.value?.trim();

  if (!internId || !title) {
    if (typeof showToast === 'function') showToast('Vui lòng chọn TTS và nhập tiêu đề!', 'warning');
    return;
  }

  if (typeof apiCreateTask === 'function') {
    const res = await apiCreateTask({
      intern_id: Number(internId),
      title,
      deadline,
      priority,
      description
    });
    if (res && res.success) {
      if (typeof showToast === 'function') showToast('Đã giao nhiệm vụ thành công cho thực tập sinh!', 'success');
      closeModal('createTaskModal');
      loadTasksFromAPI();
    } else {
      if (typeof showToast === 'function') showToast(res ? res.message : 'Lỗi khi giao việc', 'danger');
    }
  }
}

async function deleteTaskItem(id) {
  if (!confirm('Bạn có chắc chắn muốn xóa nhiệm vụ này?')) return;
  if (typeof apiDeleteTask === 'function') {
    const res = await apiDeleteTask(id);
    if (res && res.success) {
      if (typeof showToast === 'function') showToast('Đã xóa nhiệm vụ thành công!', 'success');
      loadTasksFromAPI();
    }
  }
}

// 2. BÁO CÁO TUẦN (STT 17, 18)
async function loadWeeklyReportsFromAPI() {
  const tbody = document.getElementById('weeklyReportsTableBody');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4 text-muted"><i class="fa-solid fa-spinner fa-spin me-2"></i>Đang tải danh sách báo cáo tuần...</td></tr>';

  let reports = [];
  if (typeof apiGetWeeklyReports === 'function') {
    const res = await apiGetWeeklyReports();
    if (res && res.success && Array.isArray(res.data)) {
      reports = res.data;
    }
  }

  loadedWeeklyReportsList = reports;
  if (reports.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4 text-muted">Chưa có báo cáo tuần nào từ thực tập sinh.</td></tr>';
    return;
  }

  tbody.innerHTML = reports.map(r => {
    const isReviewed = r.status === 'reviewed';
    return `
      <tr>
        <td><strong>Tuần ${r.week_number}</strong></td>
        <td>
          <div style="font-weight: 600;">${r.intern_name || 'TTS #' + r.intern_id}</div>
          <div style="font-size: 11px; color: #64748b;">${r.intern_email || ''}</div>
        </td>
        <td>
          <div style="font-size: 13px; max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            ${r.tasks_completed}
          </div>
        </td>
        <td>
          <div style="font-size: 13px; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            ${r.plans_next_week || 'Không có'}
          </div>
        </td>
        <td>
          <span class="badge ${isReviewed ? 'bg-success' : 'bg-warning text-dark'}">
            ${isReviewed ? 'Đã phản hồi' : 'Chờ phản hồi'}
          </span>
        </td>
        <td>
          ${r.mentor_rating ? `<strong class="text-primary">${r.mentor_rating}/10</strong>` : '<span class="text-muted">Chưa chấm</span>'}
        </td>
        <td style="text-align: right;">
          <button type="button" class="btn btn-sm btn-outline-primary" onclick="openFeedbackReportModal(${r.id})">
            <i class="fa-solid fa-reply me-1"></i> ${isReviewed ? 'Xem lại' : 'Phản hồi'}
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function openFeedbackReportModal(reportId) {
  const r = loadedWeeklyReportsList.find(x => x.id === reportId);
  if (!r) return;

  document.getElementById('feedbackReportId').value = r.id;
  document.getElementById('feedbackReportHeader').textContent = `Báo cáo Tuần ${r.week_number} - Thực tập sinh: ${r.intern_name || 'TTS'}`;
  document.getElementById('feedbackReportTasks').textContent = r.tasks_completed || 'Không có nội dung';
  document.getElementById('feedbackReportIssues').textContent = r.issues_faced || 'Không có khó khăn';
  document.getElementById('feedbackReportPlans').textContent = r.plans_next_week || 'Không có kế hoạch';

  document.getElementById('mentorRating').value = r.mentor_rating || '';
  document.getElementById('mentorFeedbackText').value = r.mentor_feedback || '';

  openModal('feedbackReportModal');
}

async function handleFeedbackReportSubmit(e) {
  if (e) e.preventDefault();
  const id = document.getElementById('feedbackReportId')?.value;
  const rating = document.getElementById('mentorRating')?.value;
  const feedback = document.getElementById('mentorFeedbackText')?.value?.trim();

  if (!id || !feedback) {
    if (typeof showToast === 'function') showToast('Vui lòng nhập nhận xét phản hồi!', 'warning');
    return;
  }

  if (typeof apiFeedbackWeeklyReport === 'function') {
    const res = await apiFeedbackWeeklyReport(id, {
      mentor_feedback: feedback,
      mentor_rating: rating ? Number(rating) : null
    });
    if (res && res.success) {
      if (typeof showToast === 'function') showToast('Đã gửi nhận xét và phản hồi cho TTS thành công!', 'success');
      closeModal('feedbackReportModal');
      loadWeeklyReportsFromAPI();
    } else {
      if (typeof showToast === 'function') showToast(res ? res.message : 'Lỗi khi gửi phản hồi', 'danger');
    }
  }
}

// 3. ĐÁNH GIÁ CUỐI KỲ (STT 19, 20)
async function loadEvaluationsFromAPI() {
  const tbody = document.getElementById('evaluationsTableBody');
  const sumEl = document.getElementById('evalSummaryText');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="8" class="text-center py-4 text-muted"><i class="fa-solid fa-spinner fa-spin me-2"></i>Đang tải bảng điểm đánh giá tổng kết từ MySQL...</td></tr>';

  let evals = [];
  let summary = null;
  if (typeof apiGetAllEvaluations === 'function') {
    const res = await apiGetAllEvaluations();
    if (res && res.success) {
      evals = res.data || [];
      summary = res.summary || null;
    }
  }

  loadedEvaluationsList = evals;
  if (sumEl && summary) {
    sumEl.innerHTML = `Tổng số: <strong>${summary.total}</strong> TTS | Điểm trung bình: <strong class="text-primary">${summary.avgScore}</strong> | Xuất sắc: <strong>${summary.xuatSac}</strong>, Giỏi: <strong>${summary.gioi}</strong>, Khá: <strong>${summary.kha}</strong>`;
  }

  if (evals.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="text-center py-4 text-muted">Chưa có bản ghi đánh giá tổng kết nào. Bấm "Đánh giá TTS" để chấm điểm!</td></tr>';
    return;
  }

  tbody.innerHTML = evals.map(e => {
    let gradeBadge = 'bg-primary';
    if (e.grade === 'Xuất sắc') gradeBadge = 'bg-success';
    else if (e.grade === 'Khá') gradeBadge = 'bg-info text-dark';
    else if (e.grade === 'Trung bình') gradeBadge = 'bg-secondary';

    return `
      <tr>
        <td>
          <strong style="color: #0f172a;">${e.intern_name}</strong>
          <div style="font-size: 11px; color: #64748b;">${e.intern_email}</div>
        </td>
        <td>${e.school} - ${e.major}</td>
        <td><strong>${e.technical_score}</strong></td>
        <td><strong>${e.discipline_score}</strong></td>
        <td><strong>${e.attitude_score}</strong></td>
        <td><strong style="font-size: 15px; color: #2563eb;">${e.total_score}</strong></td>
        <td><span class="badge ${gradeBadge}">${e.grade}</span></td>
        <td>
          <div style="font-size: 12.5px; color: #334155; max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${e.mentor_comments || ''}">
            ${e.mentor_comments || '<span class="text-muted">Chưa có nhận xét</span>'}
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function openEvaluationModal(internId = null) {
  populateTaskInternSelects();
  const select = document.getElementById('evalInternSelect');
  if (select && internId) {
    select.value = internId;
    handleEvalInternChange(internId);
  }
  calculateEvalTotal();
  openModal('evaluationModal');
}

async function handleEvalInternChange(internId) {
  if (!internId) return;
  if (typeof apiGetEvaluationByIntern === 'function') {
    const res = await apiGetEvaluationByIntern(internId);
    if (res && res.success && res.data) {
      const d = res.data;
      if (document.getElementById('evalTechScore')) document.getElementById('evalTechScore').value = d.technical_score;
      if (document.getElementById('evalDiscScore')) document.getElementById('evalDiscScore').value = d.discipline_score;
      if (document.getElementById('evalAttScore')) document.getElementById('evalAttScore').value = d.attitude_score;
      if (document.getElementById('evalMentorComment')) document.getElementById('evalMentorComment').value = d.mentor_comments || '';
      if (document.getElementById('evalHrNotes')) document.getElementById('evalHrNotes').value = d.hr_notes || '';
      calculateEvalTotal();
    }
  }
}

function calculateEvalTotal() {
  const t = Number(document.getElementById('evalTechScore')?.value) || 0;
  const d = Number(document.getElementById('evalDiscScore')?.value) || 0;
  const a = Number(document.getElementById('evalAttScore')?.value) || 0;

  const total = Number(((t * 0.4) + (d * 0.3) + (a * 0.3)).toFixed(1));
  const totalEl = document.getElementById('evalTotalScoreDisplay');
  const gradeEl = document.getElementById('evalGradeDisplay');

  if (totalEl) totalEl.textContent = total;

  let grade = 'Trung bình';
  let badgeColor = '#64748b';
  let bg = '#f1f5f9';

  if (total >= 9.0) { grade = 'Xuất sắc'; badgeColor = '#15803d'; bg = '#dcfce7'; }
  else if (total >= 8.0) { grade = 'Giỏi'; badgeColor = '#16a34a'; bg = '#dcfce7'; }
  else if (total >= 6.5) { grade = 'Khá'; badgeColor = '#0284c7'; bg = '#e0f2fe'; }
  else if (total >= 5.0) { grade = 'Trung bình'; badgeColor = '#ca8a04'; bg = '#fef9c3'; }
  else { grade = 'Yếu'; badgeColor = '#dc2626'; bg = '#fee2e2'; }

  if (gradeEl) {
    gradeEl.textContent = grade;
    gradeEl.style.color = badgeColor;
    gradeEl.style.background = bg;
  }
}

async function handleEvaluationSubmit(e) {
  if (e) e.preventDefault();
  const internId = document.getElementById('evalInternSelect')?.value;
  const t = document.getElementById('evalTechScore')?.value;
  const d = document.getElementById('evalDiscScore')?.value;
  const a = document.getElementById('evalAttScore')?.value;
  const comments = document.getElementById('evalMentorComment')?.value?.trim();
  const hrNotes = document.getElementById('evalHrNotes')?.value?.trim();

  if (!internId) {
    if (typeof showToast === 'function') showToast('Vui lòng chọn thực tập sinh!', 'warning');
    return;
  }

  if (typeof apiSaveEvaluation === 'function') {
    const res = await apiSaveEvaluation({
      intern_id: Number(internId),
      technical_score: t,
      discipline_score: d,
      attitude_score: a,
      mentor_comments: comments,
      hr_notes: hrNotes
    });
    if (res && res.success) {
      if (typeof showToast === 'function') showToast('Lưu kết quả đánh giá tổng kết thành công!', 'success');
      closeModal('evaluationModal');
      loadEvaluationsFromAPI();
    } else {
      if (typeof showToast === 'function') showToast(res ? res.message : 'Lỗi khi lưu đánh giá', 'danger');
    }
  }
}

function exportEvaluationReport() {
  if (loadedEvaluationsList.length === 0) {
    if (typeof showToast === 'function') showToast('Chưa có dữ liệu đánh giá để xuất!', 'warning');
    return;
  }

  let csv = "\uFEFFHọ tên,Email,Trường,Ngành,Điểm kỹ thuật,Điểm kỷ luật,Điểm thái độ,Điểm tổng kết,Xếp loại,Nhận xét của Mentor\n";
  loadedEvaluationsList.forEach(e => {
    csv += `"${e.intern_name}","${e.intern_email}","${e.school}","${e.major}",${e.technical_score},${e.discipline_score},${e.attitude_score},${e.total_score},"${e.grade}","${(e.mentor_comments || '').replace(/"/g, '""')}"\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Bao_Cao_Danh_Gia_Tong_Ket_${Date.now()}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  if (typeof showToast === 'function') showToast('Đã xuất báo cáo đánh giá cuối kỳ thành công!', 'success');
}

// 4. LỊCH HỌP & GỬI EMAIL TỰ ĐỘNG (STT 35)
function openCreateMeetingModal() {
  populateTaskInternSelects();
  const form = document.getElementById('createMeetingForm');
  if (form) form.reset();
  const dateInput = document.getElementById('meetingDate');
  if (dateInput) dateInput.value = new Date().toISOString().slice(0, 10);
  openModal('createMeetingModal');
}

async function handleCreateMeetingSubmit(e) {
  if (e) e.preventDefault();
  const title = document.getElementById('meetingTitle')?.value?.trim();
  const date = document.getElementById('meetingDate')?.value;
  const start = document.getElementById('meetingStartTime')?.value;
  const end = document.getElementById('meetingEndTime')?.value;
  const location = document.getElementById('meetingLocation')?.value?.trim();
  const link = document.getElementById('meetingLink')?.value?.trim();
  const select = document.getElementById('meetingInternSelect');
  const notes = document.getElementById('meetingNotes')?.value?.trim();

  const selectedInternIds = [];
  if (select) {
    for (let opt of select.options) {
      if (opt.selected) selectedInternIds.push(Number(opt.value));
    }
  }

  if (!title || !date || selectedInternIds.length === 0) {
    if (typeof showToast === 'function') showToast('Vui lòng nhập chủ đề và chọn ít nhất 1 TTS tham gia!', 'warning');
    return;
  }

  const btn = document.getElementById('btnSubmitMeeting');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-1"></i> Đang tạo & gửi mail...';
  }

  try {
    if (typeof apiCreateMeeting === 'function') {
      const res = await apiCreateMeeting({
        title,
        meeting_date: date,
        start_time: start,
        end_time: end,
        location,
        link,
        host_name: 'Mentor / HR CodeGym',
        intern_ids: selectedInternIds,
        notes
      });

      if (res && res.success) {
        if (typeof showToast === 'function') {
          showToast(`Đã tạo lịch họp và tự động gửi email cho ${res.emailsSentCount || selectedInternIds.length} thực tập sinh!`, 'success');
        }
        closeModal('createMeetingModal');
      } else {
        if (typeof showToast === 'function') showToast(res ? res.message : 'Lỗi khi tạo lịch họp', 'danger');
      }
    }
  } catch (err) {
    if (typeof showToast === 'function') showToast('Lỗi gửi email lịch họp', 'danger');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<i class="fa-regular fa-paper-plane me-1"></i> Tạo & Gửi Email thông báo';
    }
  }
}

// Gắn toàn bộ hàm của Tasks & Evaluations vào window
window.initTasksTab = initTasksTab;
window.switchTaskSubTab = switchTaskSubTab;
window.openCreateTaskModal = openCreateTaskModal;
window.handleCreateTaskSubmit = handleCreateTaskSubmit;
window.deleteTaskItem = deleteTaskItem;
window.openFeedbackReportModal = openFeedbackReportModal;
window.handleFeedbackReportSubmit = handleFeedbackReportSubmit;
window.openEvaluationModal = openEvaluationModal;
window.handleEvalInternChange = handleEvalInternChange;
window.calculateEvalTotal = calculateEvalTotal;
window.handleEvaluationSubmit = handleEvaluationSubmit;
window.exportEvaluationReport = exportEvaluationReport;
window.openCreateMeetingModal = openCreateMeetingModal;
window.handleCreateMeetingSubmit = handleCreateMeetingSubmit;



