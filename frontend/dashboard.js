// ==========================================================================
// HR DASHBOARD - TUẦN 1 (T1) FRONTEND MOCK DATA & INTERACTION CONTROLLER
// CHỈ LÀM PHẦN FRONTEND: Mock data hoạt động độc lập, không cần backend
// ==========================================================================

// Auth Guard: Nếu truy cập file dashboard.html độc lập mà không phải HR Manager -> Chuyển về index.html
(function checkAuthGuard() {
  if (typeof window !== "undefined") {
    // Chỉ kiểm tra khi trang không có login-view (tức là trang dashboard.html độc lập)
    const isDashboardPage = !document.getElementById("login-view");
    if (isDashboardPage) {
      const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
      const userStr = localStorage.getItem("user") || localStorage.getItem("currentUser");
      let isHR = false;
      if (isLoggedIn && userStr) {
        try {
          const u = JSON.parse(userStr);
          if (u && u.role === "HR Manager") isHR = true;
        } catch (e) {}
      }
      if (!isHR) {
        window.location.href = "index.html";
      }
    }
  }
})();

// ==========================================================================
// DỮ LIỆU ĐỒNG BỘ ĐỘNG TRỰC TIẾP TỪ DATABASE MYSQL (ĐÃ LOẠI BỎ HARDCODE)
// ==========================================================================
let applications = [];
let internList = [];

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

// Biến lưu trạng thái đang xem hồ sơ / tài liệu
let currentDocCandidateId = null;
let currentDocType = "cv"; // 'cv' hoặc 'letter'

// ==========================================================================
// CHUYỂN TAB MƯỢT MÀ GIỮA 3 TAB (TỔNG QUAN, TIẾP NHẬN & XÉT DUYỆT, THỰC TẬP SINH)
// ==========================================================================
function switchTab(tabName) {
  const tabs = {
    overview: { tab: document.getElementById("overviewTab"), nav: document.getElementById("navOverview") },
    review: { tab: document.getElementById("reviewTab"), nav: document.getElementById("navReview") },
    interns: { tab: document.getElementById("internsTab"), nav: document.getElementById("navInterns") }
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
      item.name.toLowerCase().includes(keyword) ||
      item.school.toLowerCase().includes(keyword) ||
      item.major.toLowerCase().includes(keyword) ||
      item.position.toLowerCase().includes(keyword) ||
      item.email.toLowerCase().includes(keyword);

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

    // Nút hành động tương ứng với trạng thái
    let actionsHtml = "";
    if (item.status === "Chờ xét duyệt") {
      actionsHtml = `
        <div class="action-buttons">
          <button type="button" class="btn-action btn-detail" onclick="openCandidateDetailModal(${item.id})" title="Xem chi tiết ứng viên">
            Chi tiết
          </button>
          <button type="button" class="btn-action btn-doc" onclick="openDocumentModal(${item.id})" title="Xem tài liệu CV & Đơn">
            Tài liệu
          </button>
          <button type="button" class="btn-action btn-approve" onclick="approveApplication(${item.id})" title="Duyệt ứng viên">
            Duyệt
          </button>
          <button type="button" class="btn-action btn-reject" onclick="openRejectModal(${item.id})" title="Từ chối hồ sơ">
            Từ chối
          </button>
        </div>
      `;
    } else if (item.status === "Đã duyệt") {
      actionsHtml = `
        <div class="action-buttons">
          <button type="button" class="btn-action btn-detail" onclick="openCandidateDetailModal(${item.id})">Chi tiết</button>
          <button type="button" class="btn-action btn-doc" onclick="openDocumentModal(${item.id})">Tài liệu</button>
          <span style="font-size: 11.5px; color: #059669; font-weight: 600;">✓ Đã thêm vào TTS</span>
        </div>
      `;
    } else {
      actionsHtml = `
        <div class="action-buttons">
          <button type="button" class="btn-action btn-detail" onclick="openCandidateDetailModal(${item.id})">Chi tiết</button>
          <button type="button" class="btn-action btn-doc" onclick="openDocumentModal(${item.id})">Tài liệu</button>
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
  currentDocCandidateId = id;
  const candidate = applications.find((item) => item.id === id);
  if (!candidate) return;

  // Lấy danh sách tài liệu thực tế từ MySQL nếu có
  if (typeof apiGetInternDocuments === 'function') {
    try {
      const res = await apiGetInternDocuments(id);
      if (res && res.success && res.data && Array.isArray(res.data.documents)) {
        candidate.realDocuments = res.data.documents;
      }
    } catch (e) {
      console.warn('Lỗi tải tài liệu từ DB:', e);
    }
  }

  const candidateSub = document.getElementById("docCandidateSub");
  if (candidateSub) {
    candidateSub.textContent = `Ứng viên: ${candidate.name} • ${candidate.school} • ${candidate.position}`;
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

// Chuyển tab giữa CV và Đơn xin thực tập
function switchDocTab(type) {
  currentDocType = type;
  const btnCV = document.getElementById("btnTabCV");
  const btnLetter = document.getElementById("btnTabLetter");
  const fileNameEl = document.getElementById("docFileName");
  const fileSizeEl = document.getElementById("docFileSize");
  const a4Content = document.getElementById("a4Content");

  const candidate = applications.find((item) => item.id === currentDocCandidateId);
  if (!candidate || !a4Content) return;

  // Kiểm tra xem ứng viên có file thật được tải lên server không
  let realDoc = null;
  if (candidate.realDocuments && candidate.realDocuments.length > 0) {
    const targetType = type === "cv" ? "CV" : "APPLICATION_LETTER";
    realDoc = candidate.realDocuments.find((d) => d.type === targetType);
  }

  if (realDoc && realDoc.fileUrl) {
    const fullUrl = realDoc.fileUrl.startsWith("http") ? realDoc.fileUrl : `http://localhost:5000${realDoc.fileUrl}`;
    const ext = realDoc.fileUrl.split(".").pop().toLowerCase();
    if (fileNameEl) fileNameEl.textContent = realDoc.name;
    if (fileSizeEl) fileSizeEl.textContent = `${realDoc.size || "Tài liệu"} • Định dạng ${ext.toUpperCase()}`;

    if (type === "cv") {
      if (btnCV) btnCV.classList.add("active");
      if (btnLetter) btnLetter.classList.remove("active");
    } else {
      if (btnCV) btnCV.classList.remove("active");
      if (btnLetter) btnLetter.classList.add("active");
    }

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
    }
  }

    if (type === "cv") {
      if (btnCV) btnCV.classList.add("active");
      if (btnLetter) btnLetter.classList.remove("active");
    } else {
      if (btnCV) btnCV.classList.remove("active");
      if (btnLetter) btnLetter.classList.add("active");
    }

    if (fileNameEl) fileNameEl.textContent = "Chưa có tài liệu";
    if (fileSizeEl) fileSizeEl.textContent = "Ứng viên chưa tải lên hoặc đã gỡ bỏ";

    a4Content.innerHTML = `
      <div style="background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 8px; padding: 60px 20px; text-align: center; margin: 40px auto; max-width: 600px;">
        <i class="fa-solid fa-file-circle-xmark" style="font-size: 3.5rem; color: #94a3b8; margin-bottom: 16px;"></i>
        <h3 style="font-weight: 700; color: #334155;">Chưa có ${type === 'cv' ? 'CV' : 'Đơn xin thực tập'}</h3>
        <p style="color: #64748b; font-size: 0.95rem; margin-top: 8px; max-width: 480px; margin-left: auto; margin-right: auto;">
          Ứng viên chưa tải lên tài liệu này hoặc đã gỡ bỏ khỏi hệ thống.
        </p>
      </div>
    `;
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
      mentor: candidate.mentor || "Anh Tuấn",
      time: "01/10/2026 - 31/12/2026",
      status: "Đang thực tập"
    };
    internList.unshift(newIntern);
  }

  // Cập nhật lại giao diện các tab
  renderOverview();
  filterReviewData();
  filterData();

  // Gọi API cập nhật trạng thái duyệt vào MySQL
  if (typeof apiUpdateDocumentStatus === 'function') {
    apiUpdateDocumentStatus(candidate.id, 'approved', 'Đã duyệt hồ sơ').catch(e => console.warn(e));
  }

  showToast(`Đã duyệt hồ sơ của ứng viên "${candidate.name}" và chuyển sang danh sách Thực tập sinh thành công!`, "success");
}

// Thao tác TỪ CHỐI HỒ SƠ (Mở Modal nhập lý do)
function openRejectModal(id) {
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

    showToast(`Đã ghi nhận từ chối hồ sơ của ứng viên "${candidate.name}".`, "warning");
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
      item.name.toLowerCase().includes(keyword) ||
      item.school.toLowerCase().includes(keyword) ||
      item.major.toLowerCase().includes(keyword) ||
      item.email.toLowerCase().includes(keyword) ||
      item.mentor.toLowerCase().includes(keyword);

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
            <span class="intern-sub">${item.email}</span>
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
          <button type="button" class="btn-action btn-edit" onclick="openEditModal(${item.id})" title="Chỉnh sửa thông tin">
            <i class="fa-solid fa-pen-to-square"></i>
            <span>Sửa</span>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Cập nhật tên file khi người dùng chọn tài liệu
function updateUploadFileName(input, targetSpanId) {
  const span = document.getElementById(targetSpanId);
  if (span) {
    if (input.files && input.files[0]) {
      span.textContent = input.files[0].name;
      if (span.style) {
        span.style.fontWeight = "600";
        span.style.color = "#1e293b";
      }
    } else {
      span.textContent = targetSpanId === "cvFileName" ? "Tải lên CV (PDF, DOCX)" : "Tải lên Đơn xin thực tập";
      if (span.style) {
        span.style.fontWeight = "normal";
        span.style.color = "#475569";
      }
    }
  }
}
window.updateUploadFileName = updateUploadFileName;

// Bấm nút Mở Modal Thêm mới thực tập sinh
function openAddModal() {
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
  const cvEl = document.getElementById("cvFileName");
  if (cvEl) {
    cvEl.textContent = "Tải lên CV (PDF, DOCX)";
    if (cvEl.style) {
      cvEl.style.fontWeight = "normal";
      cvEl.style.color = "#475569";
    }
  }
  const letterEl = document.getElementById("letterFileName");
  if (letterEl) {
    letterEl.textContent = "Tải lên Đơn xin thực tập";
    if (letterEl.style) {
      letterEl.style.fontWeight = "normal";
      letterEl.style.color = "#475569";
    }
  }
  if (document.getElementById("addCv")) document.getElementById("addCv").value = "";
  if (document.getElementById("addLetter")) document.getElementById("addLetter").value = "";
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
  const cvFile = cvInput && cvInput.files && cvInput.files[0] ? cvInput.files[0].name : "CV_" + name.replace(/\s+/g, "") + ".pdf";
  const letterFile = letterInput && letterInput.files && letterInput.files[0] ? letterInput.files[0].name : "Don_Xin_Thuc_Tap.pdf";

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
    docLetterName: letterFile
  };

  internList.unshift(newIntern);
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
      }
    }).catch(err => console.warn('Lỗi khi lưu vào MySQL:', err));
  }

  showToast(`Đã thêm mới thực tập sinh "${name}" thành công!`, "success");
}

// Mở Modal Xem Chi tiết Thực tập sinh
function openViewInternModal(id) {
  const intern = internList.find((item) => item.id === id);
  if (!intern) return;

  const bodyEl = document.getElementById("internDetailBody");
  const footerEl = document.getElementById("internDetailFooter");
  const initials = getInitials(intern.name);

  let statusClass = "status-finished";
  if (intern.status === "Đang thực tập") statusClass = "status-active";
  else if (intern.status === "Chờ xét duyệt") statusClass = "status-pending";

  if (bodyEl) {
    bodyEl.innerHTML = `
      <div class="detail-card-hero">
        <div class="detail-avatar-circle">${initials}</div>
        <div class="detail-hero-content">
          <h4 class="detail-candidate-name">${intern.name}</h4>
          <div class="detail-candidate-position">${intern.position || (intern.major + " • " + intern.school)}</div>
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
          <span class="info-item-label">Email liên hệ</span>
          <span class="info-item-value">${intern.email || "Chưa cập nhật"}</span>
        </div>
        ${intern.phone ? `
        <div class="info-item">
          <span class="info-item-label">Số điện thoại</span>
          <span class="info-item-value">${intern.phone}</span>
        </div>` : ""}
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
        ${intern.docCvName || intern.docLetterName ? `
        <div class="info-item" style="grid-column: 1 / -1;">
          <span class="info-item-label">Tài liệu đính kèm</span>
          <span class="info-item-value" style="display: flex; gap: 10px; margin-top: 4px;">
            ${intern.docCvName ? `<span class="badge-tag-sm" style="color: #0d9488; background-color: #f0fdfa;"><i class="fa-solid fa-file-pdf"></i> ${intern.docCvName}</span>` : ""}
            ${intern.docLetterName ? `<span class="badge-tag-sm" style="color: #2563eb; background-color: #eff6ff;"><i class="fa-solid fa-file-lines"></i> ${intern.docLetterName}</span>` : ""}
          </span>
        </div>` : ""}
      </div>
    `;
  }

  if (footerEl) {
    footerEl.innerHTML = `
      <button type="button" class="btn-secondary" onclick="closeModal('internDetailModal')">Đóng</button>
      <button type="button" class="btn-primary" onclick="closeModal('internDetailModal'); openEditModal(${intern.id})">
        <i class="fa-solid fa-pen-to-square"></i>
        <span>Chỉnh sửa thông tin</span>
      </button>
    `;
  }

  openModal("internDetailModal");
}

window.openViewInternModal = openViewInternModal;
window.openViewModal = openViewInternModal;
window.openInternDetailModal = openViewInternModal;
window.handleViewIntern = openViewInternModal;
window.viewIntern = openViewInternModal;

// Mở Modal Chỉnh sửa TTS
function openEditModal(id) {
  const intern = internList.find((item) => item.id === id);
  if (!intern) return;

  document.getElementById("editId").value = intern.id;
  document.getElementById("editName").value = intern.name;
  document.getElementById("editEmail").value = intern.email || "";
  document.getElementById("editMajor").value = intern.major;
  document.getElementById("editSchool").value = intern.school;
  document.getElementById("editDept").value = intern.dept;
  document.getElementById("editMentor").value = intern.mentor;
  document.getElementById("editTime").value = intern.time;
  document.getElementById("editStatus").value = intern.status;

  openModal("editModal");
}

// Xử lý Lưu Chỉnh sửa TTS
function handleEditSubmit(e) {
  e.preventDefault();
  const id = Number(document.getElementById("editId").value);
  const intern = internList.find((item) => item.id === id);

  if (intern) {
    intern.name = document.getElementById("editName").value.trim();
    intern.email = document.getElementById("editEmail").value.trim();
    intern.major = document.getElementById("editMajor").value.trim();
    intern.school = document.getElementById("editSchool").value.trim();
    intern.dept = document.getElementById("editDept").value;
    intern.mentor = document.getElementById("editMentor").value.trim();
    intern.time = document.getElementById("editTime").value.trim();
    intern.status = document.getElementById("editStatus").value;

    closeModal("editModal");
    filterData();
    renderOverview();

    // Cập nhật dữ liệu vào MySQL Database
    if (typeof apiUpdateIntern === 'function') {
      apiUpdateIntern(id, {
        name: intern.name,
        email: intern.email,
        major: intern.major,
        school: intern.school,
        dept: intern.dept,
        mentor: intern.mentor,
        status: intern.status
      }).then(res => {
        if (res && res.success) {
          console.log('✅ Đã cập nhật thực tập sinh vào MySQL thành công!');
        }
      }).catch(err => console.warn('Lỗi khi cập nhật vào MySQL:', err));
    }

    showToast(`Cập nhật thông tin thực tập sinh "${intern.name}" thành công!`, "success");
  }
}

// Xử lý Xóa thực tập sinh (Sử dụng Modal Web, không dùng confirm/alert)
let pendingDeleteInternId = null;

function handleDeleteIntern(id) {
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

  // Khởi tạo các bảng dữ liệu
  renderOverview();
  filterReviewData();
  filterData();

  // Nạp dữ liệu mới nhất từ MySQL Database
  loadInternsFromDB();
});

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
          time: i.time || 'Chưa xếp lịch',
          status: i.status || 'Đang thực tập',
          phone: i.phone,
          position: i.position,
          skills: i.skills,
          bio: i.bio
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
          position: i.position || `Thực tập sinh ${i.major}`,
          appliedDate: i.appliedDate || '',
          status: i.status,
          rejectReason: i.reject_reason || '',
          rejectNote: i.reject_note || '',
          docCvName: `CV_${i.name.replace(/\s+/g, '')}.pdf`,
          docLetterName: `Don_Xin_Thuc_Tap.pdf`,
          skills: i.skills || '',
          bio: i.bio || '',
          projects: i.projects || ''
        }));

        renderOverview();
        filterReviewData();
        filterData();
        console.log(`✅ Đã nạp thành công ${res.data.length} bản ghi từ MySQL Database!`);
      }
    }
  } catch (err) {
    console.warn('⚠️ Lỗi khi tải dữ liệu từ API:', err);
  }
}
window.loadInternsFromDB = loadInternsFromDB;
