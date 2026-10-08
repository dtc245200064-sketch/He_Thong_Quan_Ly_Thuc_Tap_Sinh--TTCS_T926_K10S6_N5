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

const DEFAULT_MOCK_INTERNS = [
  {
    id: 1,
    name: "Trần Minh Khoa",
    email: "khoatran@student.vn",
    phone: "0912 345 678",
    school: "Đại học Bách Khoa",
    major: "CNTT",
    position: "Thực tập sinh Frontend React",
    dept: "Kỹ thuật phần mềm",
    mentor: "Nguyễn Văn Hùng",
    time: "01/10/2026 - 31/12/2026",
    status: "Đang thực tập",
    docCvName: null,
    docLetterName: null,
    cvFileUrl: null,
    letterFileUrl: null,
    docContractName: null,
    contractFileUrl: null,
    cvUploadDate: null,
    letterUploadDate: null,
    contractUploadDate: null
  },
  {
    id: 2,
    name: "Lê Thị Lan",
    email: "lan.lt@ftu.edu.vn",
    phone: "0934 567 890",
    school: "Đại học Ngoại Thương",
    major: "Quản trị Nhân lực",
    position: "Thực tập sinh Tuyển dụng",
    dept: "Nhân sự (HR)",
    mentor: "Nguyễn Thị Hoa",
    time: "01/10/2026 - 31/12/2026",
    status: "Đang thực tập",
    docCvName: null,
    docLetterName: null,
    cvFileUrl: null,
    letterFileUrl: null,
    docContractName: null,
    contractFileUrl: null,
    cvUploadDate: null,
    letterUploadDate: null,
    contractUploadDate: null
  },
  {
    id: 7,
    name: "Nguyễn Thị Hồng Nhung",
    email: "nhung@gmail.com",
    phone: "0987 111 222",
    school: "Đại học Công Nghệ",
    major: "Khoa học Máy tính",
    position: "Thực tập sinh Backend Node.js",
    dept: "Kỹ thuật phần mềm",
    mentor: "Phạm Minh Đức",
    time: "01/10/2026 - 31/12/2026",
    status: "Đang thực tập",
    docCvName: null,
    docLetterName: null,
    cvFileUrl: null,
    letterFileUrl: null,
    docContractName: null,
    contractFileUrl: null,
    cvUploadDate: null,
    letterUploadDate: null,
    contractUploadDate: null
  },
  {
    id: 8,
    name: "Thiện",
    email: "thien@gmail.com",
    phone: "0977 888 999",
    school: "Đại học FPT",
    major: "Kỹ thuật Phần mềm",
    position: "Thực tập sinh Frontend",
    dept: "Kỹ thuật phần mềm",
    mentor: "Nguyễn Văn Hùng",
    time: "01/10/2026 - 31/12/2026",
    status: "Đang thực tập",
    docCvName: null,
    docLetterName: null,
    cvFileUrl: null,
    letterFileUrl: null,
    docContractName: null,
    contractFileUrl: null,
    cvUploadDate: null,
    letterUploadDate: null,
    contractUploadDate: null
  }
];

const DEFAULT_MOCK_APPLICATIONS = [
  {
    id: 3,
    name: "Nguyễn Hoàng Nam",
    email: "nam.nh@student.hust.edu.vn",
    phone: "0965 432 109",
    school: "Đại học Bách Khoa",
    major: "CNTT",
    gpa: "3.6 / 4.0",
    dept: "Kỹ thuật phần mềm",
    mentor: "Trần Bảo Nam",
    position: "Thực tập sinh Frontend React/JS",
    appliedDate: "05/10/2026",
    status: "Chờ xét duyệt",
    rejectReason: "",
    rejectNote: "",
    docCvName: null,
    docLetterName: null,
    cvFileUrl: null,
    letterFileUrl: null,
    docContractName: null,
    contractFileUrl: null,
    cvUploadDate: null,
    letterUploadDate: null,
    contractUploadDate: null
  },
  {
    id: 4,
    name: "Trần Bảo Ngọc",
    email: "ngoc.tb@ftu.edu.vn",
    phone: "0945 678 901",
    school: "Đại học Ngoại Thương",
    major: "Marketing",
    gpa: "3.4 / 4.0",
    dept: "Marketing",
    mentor: "Lê Minh Tuấn",
    position: "Thực tập sinh Digital Marketing",
    appliedDate: "06/10/2026",
    status: "Chờ xét duyệt",
    rejectReason: "",
    rejectNote: "",
    docCvName: null,
    docLetterName: null,
    cvFileUrl: null,
    letterFileUrl: null,
    docContractName: null,
    contractFileUrl: null,
    cvUploadDate: null,
    letterUploadDate: null,
    contractUploadDate: null
  }
];

let applications = JSON.parse(JSON.stringify(DEFAULT_MOCK_APPLICATIONS));
let internList = JSON.parse(JSON.stringify(DEFAULT_MOCK_INTERNS));

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
    programs: { tab: document.getElementById("programsTab"), nav: document.getElementById("navPrograms") }
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
        }
      }
    } catch (e) {
      console.warn('Lỗi tải tài liệu từ DB:', e);
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
        }
      }
    } catch (e) {
      console.warn('Lỗi tải tài liệu TTS:', e);
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
  const contractCardHtml = hasContract ? `
    <div class="doc-card-interactive" style="border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px; background: #ffffff; display: flex; flex-direction: column; justify-content: space-between; gap: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
      <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 10px;">
        <div style="display: flex; align-items: center; gap: 10px; min-width: 0;">
          <div style="width: 38px; height: 38px; border-radius: 8px; background: ${contractIcon.bg}; color: ${contractIcon.color}; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0;">
            <i class="${contractIcon.icon}"></i>
          </div>
          <div style="min-width: 0;">
            <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Hợp đồng thực tập</div>
            <div style="font-size: 13px; font-weight: 600; color: #1e293b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${intern.docContractName}">${intern.docContractName}</div>
          </div>
        </div>
        <button type="button" class="btn-action btn-view" style="flex-shrink: 0; padding: 6px 12px; font-size: 12px;" onclick="closeModal('internDetailModal'); openDocumentModalWithType(${intern.id}, 'contract')" title="Xem chi tiết Hợp đồng thực tập">
          <i class="fa-solid fa-eye"></i>
          <span>Xem HĐ</span>
        </button>
      </div>
      <div class="file-meta-bar" style="margin-top: 4px; padding: 6px 10px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; font-size: 11.5px; display: flex; align-items: center; justify-content: space-between; gap: 6px;">
        <span class="file-meta-status uploaded" style="font-weight: 600;"><i class="fa-solid fa-circle-check"></i> Trạng thái:  Đã tải lên</span>
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
    footerEl.innerHTML = `
      <button type="button" class="btn-secondary" onclick="closeModal('internDetailModal')">
        <i class="fa-solid fa-xmark"></i>
        <span>Đóng</span>
      </button>
      ${docCount > 0 ? `
      <button type="button" class="btn-action btn-doc" style="padding: 9px 16px;" onclick="closeModal('internDetailModal'); openDocumentModal(${intern.id})">
        <i class="fa-solid fa-file-lines"></i>
        <span>Xem tài liệu đính kèm</span>
      </button>` : ''}
      <button type="button" class="btn-primary" onclick="closeModal('internDetailModal'); openEditModal(${intern.id})">
        <i class="fa-solid fa-pen-to-square"></i>
        <span>Chỉnh sửa thông tin</span>
      </button>
    `;
  }

  openModal("internDetailModal");
}

window.openViewInternModal = openViewInternModal;

// Mở Modal Chỉnh sửa TTS
async function openEditModal(id) {
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
  document.getElementById("editMentor").value = intern.mentor || "";
  document.getElementById("editTime").value = intern.time || "";
  document.getElementById("editStatus").value = intern.status || "Đang thực tập";

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
    intern.time = document.getElementById("editTime").value.trim();
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
      intern.contractFileUrl = URL.createObjectURL(file);
      intern.contractUploadDate = editContractInput.dataset.uploadDate || getFormattedUploadDate();
      intern.deleteContractOnSave = false;

      // Đồng bộ hợp đồng mới tải lên sang hệ thống cổng Thực tập sinh (User Story 9 & 10)
      try {
        let contracts = [];
        const savedContracts = localStorage.getItem('tts_intern_contracts');
        if (savedContracts) contracts = JSON.parse(savedContracts) || [];
        const cCode = `HĐTT-2026-${String(id).padStart(3, '0')}`;
        const existingIdx = contracts.findIndex(c => String(c.internId) === String(id) || c.code === cCode);
        const contractObj = {
          id: `HD-2026-${String(id).padStart(3, '0')}`,
          internId: id,
          code: cCode,
          title: `Hợp đồng thực tập ${intern.dept || intern.position || 'Phát triển phần mềm'}`,
          fileName: file.name,
          company: 'Hệ thống Đào tạo CodeGym Việt Nam',
          dept: intern.dept || intern.position || 'Phòng Phát triển Phần mềm',
          period: (intern.startFormatted && intern.endFormatted) ? `${intern.startFormatted} - ${intern.endFormatted}` : '01/03/2026 - 31/05/2026',
          status: 'pending'
        };
        if (existingIdx >= 0) {
          contracts[existingIdx] = contractObj;
        } else {
          contracts.unshift(contractObj);
        }
        localStorage.setItem('tts_intern_contracts', JSON.stringify(contracts));
      } catch (err) {
        console.warn('Lỗi đồng bộ hợp đồng sang cổng TTS:', err);
      }

      if (typeof apiUploadDocument === 'function') {
        try {
          apiUploadDocument(id, 'CONTRACT', file).then(res => {
            if (res && res.data && res.data.fileUrl) intern.contractFileUrl = res.data.fileUrl;
          }).catch(() => {});
        } catch (err) {}
      }
    } else if (intern.deleteContractOnSave) {
      intern.docContractName = null;
      intern.contractFileUrl = null;
      intern.contractUploadDate = null;

      try {
        let contracts = [];
        const savedContracts = localStorage.getItem('tts_intern_contracts');
        if (savedContracts) {
          contracts = JSON.parse(savedContracts) || [];
          contracts = contracts.filter(c => String(c.internId) !== String(id));
          localStorage.setItem('tts_intern_contracts', JSON.stringify(contracts));
        }
      } catch (err) {}

      if (typeof apiDeleteDocument === 'function') {
        try {
          apiDeleteDocument(id, 'CONTRACT').catch(() => {});
        } catch (err) {}
      }
    }

    closeModal("editModal");
    filterData();
    renderOverview();

    // Cập nhật dữ liệu vào MySQL Database
    if (typeof apiUpdateIntern === 'function') {
      apiUpdateIntern(id, {
        name: intern.name,
        email: intern.email,
        phone: intern.phone,
        major: intern.major,
        school: intern.school,
        position: intern.position,
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
  initPrograms();
  renderPrograms();
  initAttendance();

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
          position: i.position || `Thực tập sinh ${i.major || ''}`,
          skills: i.skills,
          bio: i.bio,
          docCvName: i.cv_doc_name || null,
          docLetterName: i.letter_doc_name || null,
          cvFileUrl: i.cv_file_url || null,
          letterFileUrl: i.letter_file_url || null
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
          position: i.position || `Thực tập sinh ${i.major || ''}`,
          appliedDate: i.appliedDate || '',
          status: i.status,
          rejectReason: i.reject_reason || '',
          rejectNote: i.reject_note || '',
          docCvName: i.cv_doc_name || null,
          docLetterName: i.letter_doc_name || null,
          cvFileUrl: i.cv_file_url || null,
          letterFileUrl: i.letter_file_url || null,
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
          mentor: p.mentor_default || 'Nguyễn Anh Tuấn',
          startDate: p.start_date ? p.start_date.split('T')[0] : '2026-07-01',
          endDate: p.end_date ? p.end_date.split('T')[0] : '2026-09-30',
          startDateFormatted: p.start_date ? new Date(p.start_date).toLocaleDateString('vi-VN') : '01/07/2026',
          endDateFormatted: p.end_date ? new Date(p.end_date).toLocaleDateString('vi-VN') : '30/09/2026',
          capacity: p.max_interns || 10,
          status: p.status || 'active',
          progress: 50,
          desc: p.description || '',
          schedule: [],
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
        <div style="text-align: center; padding: 24px 16px; color: #94a3b8; font-size: 13px;">
          Chưa có dữ liệu lịch trình
        </div>
      `;
    }
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

  // 3. Render Lịch trình dự kiến (theo mẫu thẻ giai đoạn)
  if (scheduleTimeline) {
    if (currentProg && Array.isArray(currentProg.schedule) && currentProg.schedule.length > 0) {
      scheduleTimeline.innerHTML = currentProg.schedule.map((item, idx) => {
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
          </div>
        `;
      }).join("");
    } else {
      scheduleTimeline.innerHTML = `
        <div style="text-align: center; padding: 20px 10px; color: #94a3b8; font-size: 13px; font-style: italic;">
          Chưa có lịch trình dự kiến cho chương trình này
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

function getAvailableMentors() {
  const fromInterns = Array.isArray(internList) ? internList.map(i => i.mentor) : [];
  const fromApps = Array.isArray(applications) ? applications.map(i => i.mentor) : [];
  const defaults = ["Anh Nam", "Chị Mai", "Anh Tuấn", "Chị Lan"];
  const all = [...fromInterns, ...fromApps, ...defaults];
  return [...new Set(all)].filter(Boolean).filter(m => m !== 'Chưa phân công' && m !== '—');
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

  if (modalTitle) modalTitle.textContent = `DANH SÁCH THỰC TẬP SINH - ${prog.name}`;
  if (modalSub) modalSub.textContent = `Phòng ban: ${prog.dept}${prog.mentor ? ' | Mentor: ' + prog.mentor : ''}`;

  const interns = getInternsForProgram(prog);

  if (countNote) {
    countNote.innerHTML = `Hệ thống ghi nhận <strong>${interns.length}</strong> thực tập sinh thuộc phòng ban <strong>${prog.dept}</strong> trong cơ sở dữ liệu.`;
  }

  if (tbody) {
    if (interns.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 40px; color: #64748b;">
            <i class="fa-solid fa-user-slash fa-2x" style="color: #cbd5e1; margin-bottom: 10px; display: block;"></i>
            Hiện chưa có thực tập sinh nào thuộc phòng ban <strong>${prog.dept}</strong> trong cơ sở dữ liệu.<br>
            <span style="font-size: 12.5px; color: #94a3b8;">Bạn có thể chuyển sang Tab Thực tập sinh để thêm mới.</span>
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
        const timeText = i.time || (i.startFormatted && i.endFormatted ? `${i.startFormatted} - ${i.endFormatted}` : 'Chưa xếp lịch');

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
          </tr>
        `;
      }).join("");
    }
  }

  openModal("programInternsModal");
}

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

// Khởi tạo trạng thái Chấm công & Đơn nghỉ phép (Đồng bộ MySQL & LocalStorage)
function initAttendance() {
  try {
    const savedAtt = localStorage.getItem("codegym_hr_attendance");
    if (savedAtt) {
      attendanceRecords = JSON.parse(savedAtt) || {};
    } else {
      attendanceRecords = {};
    }
  } catch (e) {
    attendanceRecords = {};
  }

  try {
    const savedLeaves = localStorage.getItem("codegym_hr_leaves");
    if (savedLeaves) {
      leaveRequests = JSON.parse(savedLeaves) || [];
    } else {
      leaveRequests = [];
    }
  } catch (e) {
    leaveRequests = [];
  }

  // Tải bảng chấm công từ MySQL Database
  if (typeof apiGetAttendance === 'function') {
    apiGetAttendance().then(res => {
      if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
        res.data.forEach(row => {
          const dKey = row.date.split('T')[0];
          if (!attendanceRecords[row.intern_id]) attendanceRecords[row.intern_id] = {};
          attendanceRecords[row.intern_id][dKey] = row.status;
        });
        localStorage.setItem("codegym_hr_attendance", JSON.stringify(attendanceRecords));
        if (currentAttSubtab === "sheet") renderAttendanceSheet();
      }
    }).catch(() => {});
  }

  // Tải danh sách đơn nghỉ phép từ MySQL Database
  if (typeof apiGetLeaves === 'function') {
    apiGetLeaves().then(res => {
      if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
        const dbLeaves = res.data.map(l => ({
          id: l.id,
          internId: l.intern_id,
          internName: l.intern_name,
          program: l.intern_dept || "Kỹ thuật phần mềm",
          startDate: l.start_date.split('T')[0],
          endDate: l.end_date.split('T')[0],
          days: l.days_count,
          reason: l.reason,
          submittedAt: l.submitted_at ? new Date(l.submitted_at).toLocaleDateString('vi-VN') : '',
          status: l.status === 'approved' ? 'Đã duyệt' : (l.status === 'rejected' ? 'Từ chối' : 'Chờ duyệt')
        }));
        const existingIds = new Set(dbLeaves.map(d => d.id));
        const locals = leaveRequests.filter(lr => !existingIds.has(lr.id));
        leaveRequests = [...dbLeaves, ...locals];
        localStorage.setItem("codegym_hr_leaves", JSON.stringify(leaveRequests));
        if (currentAttSubtab === "leaves") renderLeaveRequests();
      }
    }).catch(() => {});
  }

  initAttendanceFilters();
}

// Chuyển đổi Subtab: Bảng chấm công (sheet) vs Đơn nghỉ phép (leaves)
function switchAttendanceSubtab(subtab) {
  currentAttSubtab = subtab;
  const btnSheet = document.getElementById("btnSubtabSheet");
  const btnLeaves = document.getElementById("btnSubtabLeaves");
  const sheetView = document.getElementById("attendanceSheetView");
  const leavesView = document.getElementById("attendanceLeavesView");

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
  const todayStr = new Date().toISOString().split("T")[0];

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
function renderAttendanceTab() {
  populateAttendanceProgramFilter();
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
function applyAttendanceMark(status) {
  const hiddenId = document.getElementById("markAttInternId");
  const hiddenDate = document.getElementById("markAttDateKey");

  if (!hiddenId || !hiddenDate) return;

  const internId = hiddenId.value;
  const dateKey = hiddenDate.value;

  if (!attendanceRecords[internId]) {
    attendanceRecords[internId] = {};
  }

  if (status) {
    attendanceRecords[internId][dateKey] = status;
  } else {
    // Nếu status là rỗng -> Xóa bản ghi (trả về Chưa có dữ liệu '—')
    delete attendanceRecords[internId][dateKey];
  }

  // Lưu vào localStorage
  try {
    localStorage.setItem("codegym_hr_attendance", JSON.stringify(attendanceRecords));
  } catch (e) {
    console.error("Lỗi lưu chấm công:", e);
  }

  // Đồng bộ lên MySQL Database
  if (typeof apiMarkAttendance === 'function') {
    apiMarkAttendance({
      intern_id: internId,
      date: dateKey,
      status: status || ''
    }).catch(err => console.warn('Lỗi lưu chấm công vào MySQL:', err));
  }

  closeModal("markAttendanceModal");
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

// Duyệt đơn nghỉ phép: Tự động đánh dấu trạng thái 'leave' (P) vào các ngày nghỉ trên Bảng chấm công
function handleApproveLeave(leaveId) {
  const leave = leaveRequests.find(l => l.id === leaveId);
  if (!leave) return;

  leave.status = "Đã duyệt";

  if (!attendanceRecords[leave.internId]) {
    attendanceRecords[leave.internId] = {};
  }

  let curr = new Date(leave.startDate);
  const end = new Date(leave.endDate);
  while (curr <= end) {
    const y = curr.getFullYear();
    const m = String(curr.getMonth() + 1).padStart(2, "0");
    const d = String(curr.getDate()).padStart(2, "0");
    const dateKey = `${y}-${m}-${d}`;

    attendanceRecords[leave.internId][dateKey] = "leave";
    curr.setDate(curr.getDate() + 1);
  }

  try {
    localStorage.setItem("codegym_hr_leaves", JSON.stringify(leaveRequests));
    localStorage.setItem("codegym_hr_attendance", JSON.stringify(attendanceRecords));
  } catch (e) {
    console.error("Lỗi cập nhật:", e);
  }

  // Đồng bộ phê duyệt đơn nghỉ phép lên MySQL Database
  if (typeof apiReviewLeave === 'function') {
    apiReviewLeave(leaveId, 'approved').catch(err => console.warn('Lỗi duyệt nghỉ phép trên MySQL:', err));
  }

  renderLeaveRequests();
  renderAttendanceSheet();
  showToast(`Đã duyệt đơn nghỉ phép của ${leave.internName} và tự động cập nhật bảng chấm công (P)!`, "success");
}

// Từ chối đơn nghỉ phép
function handleRejectLeave(leaveId) {
  const leave = leaveRequests.find(l => l.id === leaveId);
  if (!leave) return;

  leave.status = "Từ chối";

  try {
    localStorage.setItem("codegym_hr_leaves", JSON.stringify(leaveRequests));
  } catch (e) {
    console.error("Lỗi cập nhật:", e);
  }

  // Đồng bộ từ chối đơn nghỉ phép lên MySQL Database
  if (typeof apiReviewLeave === 'function') {
    apiReviewLeave(leaveId, 'rejected').catch(err => console.warn('Lỗi từ chối nghỉ phép trên MySQL:', err));
  }

  renderLeaveRequests();
  showToast(`Đã từ chối đơn nghỉ phép của ${leave.internName}`, "info");
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
