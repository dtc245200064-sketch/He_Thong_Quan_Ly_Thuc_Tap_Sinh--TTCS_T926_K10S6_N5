// ==========================================================================
// HR DASHBOARD - TUẦN 1 (T1) FRONTEND MOCK DATA & INTERACTION CONTROLLER
// CHỈ LÀM PHẦN FRONTEND: Mock data hoạt động độc lập, không cần backend
// ==========================================================================

// 1. MOCK DATA: DANH SÁCH HỒ SƠ ỨNG VIÊN MỚI NỘP (TIẾP NHẬN & XÉT DUYỆT)
let applications = [
  {
    id: 101,
    name: "Nguyễn Hoàng Nam",
    email: "nam.nh@student.hust.edu.vn",
    phone: "0987 112 233",
    school: "ĐH Bách Khoa HN",
    major: "CNTT",
    gpa: "3.62 / 4.0",
    dept: "Kỹ thuật phần mềm",
    mentor: "Anh Tuấn",
    position: "Thực tập sinh Frontend React/JS",
    appliedDate: "24/09/2026",
    status: "Chờ xét duyệt",
    rejectReason: "",
    rejectNote: "",
    docCvName: "CV_NguyenHoangNam_Frontend.pdf",
    docLetterName: "Don_Xin_Thuc_Tap_BK.pdf",
    skills: "JavaScript (ES6+), ReactJS, HTML5/CSS3, Git, RESTful API, Tailwind",
    bio: "Sinh viên năm cuối ngành CNTT ĐH Bách Khoa Hà Nội. Có niềm đam mê mãnh liệt với phát triển giao diện Web chuẩn Responsive và tối ưu trải nghiệm người dùng.",
    projects: "Xây dựng E-Commerce Website React (Redux Toolkit, Node API), Quản lý thư viện số cá nhân."
  },
  {
    id: 102,
    name: "Trần Bảo Ngọc",
    email: "ngoc.tb@ftu.edu.vn",
    phone: "0976 554 321",
    school: "ĐH Ngoại thương",
    major: "Marketing",
    gpa: "3.75 / 4.0",
    dept: "Marketing",
    mentor: "Chị Mai",
    position: "Thực tập sinh Digital Marketing",
    appliedDate: "25/09/2026",
    status: "Chờ xét duyệt",
    rejectReason: "",
    rejectNote: "",
    docCvName: "CV_TranBaoNgoc_FTU_Marketing.pdf",
    docLetterName: "Don_Xin_Thuc_Tap_FTU.pdf",
    skills: "Content SEO, Google Analytics 4, Meta Ads, Canva, TikTok Content",
    bio: "Sinh viên năm 3 chuyên ngành Marketing ĐH Ngoại thương. Năng động, sáng tạo, sở hữu chứng chỉ Google Digital Garage và đạt giải nhì cuộc thi Marketing FTU 2025.",
    projects: "Chiến dịch truyền thông Fanpage CLB 50k followers, Viết bài chuẩn SEO tăng 120% Organic traffic."
  },
  {
    id: 103,
    name: "Lê Quốc Thái",
    email: "thai.lq@fpt.edu.vn",
    phone: "0934 889 900",
    school: "ĐH FPT",
    major: "Kỹ thuật phần mềm",
    gpa: "3.45 / 4.0",
    dept: "Kỹ thuật phần mềm",
    mentor: "Anh Nam",
    position: "Thực tập sinh Backend Node.js",
    appliedDate: "25/09/2026",
    status: "Chờ xét duyệt",
    rejectReason: "",
    rejectNote: "",
    docCvName: "CV_LeQuocThai_Backend_FPT.pdf",
    docLetterName: "Giay_Gioi_Thieu_FPT.pdf",
    skills: "Node.js, Express, PostgreSQL, MongoDB, Docker, Microservices basic",
    bio: "Sinh viên K16 ĐH FPT. Định hướng trở thành Backend Developer chất lượng cao, có tư duy phân tích hệ thống tốt và kinh nghiệm làm việc nhóm Agile/Scrum.",
    projects: "Hệ thống API đặt vé xem phim trực tuyến (JWT Authentication, Redis Caching, PostgreSQL)."
  },
  {
    id: 104,
    name: "Phan Thùy Dương",
    email: "duong.pt@neu.edu.vn",
    phone: "0905 443 211",
    school: "ĐH Kinh tế Quốc dân",
    major: "Kế toán",
    gpa: "3.82 / 4.0",
    dept: "Tài chính",
    mentor: "Chị Hương",
    position: "Thực tập sinh Kế toán nội bộ",
    appliedDate: "26/09/2026",
    status: "Chờ xét duyệt",
    rejectReason: "",
    rejectNote: "",
    docCvName: "CV_PhanThuyDuong_NEU.pdf",
    docLetterName: "Don_Xin_Thuc_Tap_NEU.pdf",
    skills: "Excel nâng cao (VBA/Pivot), Phần mềm MISA, Báo cáo thuế, Kiểm toán cơ bản",
    bio: "Sinh viên năm cuối viện Kế toán - Kiểm toán NEU. Tính cách cẩn thận, trung thực, tinh thần trách nhiệm cao và khả năng xử lý số liệu chính xác.",
    projects: "Phân tích báo cáo tài chính nhóm ngành bán lẻ 2024-2025, Đạt chứng chỉ MOS Excel Expert."
  },
  {
    id: 105,
    name: "Đặng Tiến Dũng",
    email: "dung.dt@vnu.edu.vn",
    phone: "0918 776 543",
    school: "ĐH Công nghệ",
    major: "An toàn thông tin",
    gpa: "3.58 / 4.0",
    dept: "Kỹ thuật phần mềm",
    mentor: "Anh Tuấn",
    position: "Thực tập sinh An ninh mạng",
    appliedDate: "26/09/2026",
    status: "Chờ xét duyệt",
    rejectReason: "",
    rejectNote: "",
    docCvName: "CV_DangTienDung_UET.pdf",
    docLetterName: "Don_Thuc_Tap_UET.pdf",
    skills: "Network Security, Linux Administration, Python Scripting, BurpSuite, OWASP",
    bio: "Sinh viên Khoa CNTT - ĐH Công nghệ (ĐHQGHN). Đam mê nghiên cứu bảo mật hệ thống web, kiểm thử xâm nhập và tham gia các giải CTF sinh viên.",
    projects: "Phát hiện và báo cáo 3 lỗ hổng bảo mật Web theo chuẩn OWASP Top 10 trong bài tập lớn."
  }
];

// 2. MOCK DATA: DANH SÁCH THỰC TẬP SINH CHÍNH THỨC (TAB THỰC TẬP SINH)
let internList = [
  {
    id: 1,
    name: "Trần Minh Khoa",
    email: "khoa.tm@company.vn",
    major: "CNTT",
    school: "ĐH Bách Khoa HN",
    dept: "Kỹ thuật phần mềm",
    mentor: "Anh Tuấn",
    time: "01/07/2026 - 30/09/2026",
    status: "Đang thực tập"
  },
  {
    id: 2,
    name: "Lê Thị Thu Hà",
    email: "ha.lt@company.vn",
    major: "Kế toán",
    school: "ĐH Kinh tế Quốc dân",
    dept: "Tài chính",
    mentor: "Chị Hương",
    time: "01/07/2026 - 30/09/2026",
    status: "Đang thực tập"
  },
  {
    id: 3,
    name: "Nguyễn Văn Đức",
    email: "duc.nv@company.vn",
    major: "Kỹ thuật phần mềm",
    school: "ĐH FPT",
    dept: "Kỹ thuật phần mềm",
    mentor: "Anh Nam",
    time: "01/08/2026 - 31/10/2026",
    status: "Đang thực tập"
  },
  {
    id: 4,
    name: "Phạm Thị Lan",
    email: "lan.pt@company.vn",
    major: "Marketing",
    school: "ĐH Ngoại thương",
    dept: "Marketing",
    mentor: "Chị Mai",
    time: "01/06/2026 - 31/08/2026",
    status: "Đã hoàn thành"
  },
  {
    id: 5,
    name: "Hoàng Đức Minh",
    email: "minh.hd@company.vn",
    major: "CNTT",
    school: "ĐH Công nghệ",
    dept: "Kỹ thuật phần mềm",
    mentor: "Anh Tuấn",
    time: "01/07/2026 - 30/09/2026",
    status: "Đang thực tập"
  },
  {
    id: 6,
    name: "Vũ Thị Bích Ngọc",
    email: "ngoc.vtb@company.vn",
    major: "Quản trị kinh doanh",
    school: "ĐH Kinh tế TP.HCM",
    dept: "Marketing",
    mentor: "Chị Mai",
    time: "01/08/2026 - 31/10/2026",
    status: "Đang thực tập"
  },
  {
    id: 7,
    name: "Đỗ Hoàng Long",
    email: "long.dh@company.vn",
    major: "An toàn thông tin",
    school: "ĐH Bách Khoa HN",
    dept: "Kỹ thuật phần mềm",
    mentor: "Anh Nam",
    time: "01/06/2026 - 31/08/2026",
    status: "Đã hoàn thành"
  }
];

// 3. MOCK DATA: HỒ SƠ CÁ NHÂN HR MANAGER
let userProfile = {
  name: "Nguyễn Thị Hoa",
  role: "HR Manager",
  email: "hr@company.vn",
  phone: "0912 345 678",
  username: "hr_hoa",
  avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80"
};

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

function openDocumentModal(id) {
  currentDocCandidateId = id;
  const candidate = applications.find((item) => item.id === id);
  if (!candidate) return;

  const candidateSub = document.getElementById("docCandidateSub");
  if (candidateSub) {
    candidateSub.textContent = `Ứng viên: ${candidate.name} • ${candidate.school} • ${candidate.position}`;
  }

  switchDocTab(currentDocType || "cv");

  // Nút duyệt / từ chối dưới footer của Modal tài liệu
  const btnReject = document.getElementById("docBtnReject");
  const btnApprove = document.getElementById("docBtnApprove");

  if (candidate.status === "Chờ xét duyệt") {
    if (btnReject) btnReject.style.display = "inline-flex";
    if (btnApprove) btnApprove.style.display = "inline-flex";
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

  if (type === "cv") {
    if (btnCV) btnCV.classList.add("active");
    if (btnLetter) btnLetter.classList.remove("active");
    if (fileNameEl) fileNameEl.textContent = candidate.docCvName;
    if (fileSizeEl) fileSizeEl.textContent = "1.6 MB • PDF Document (Đã ký điện tử)";

    // Render A4 Sheet: Định dạng CV hoàn chỉnh
    a4Content.innerHTML = `
      <div class="a4-header">
        <div>
          <h1 class="a4-name">${candidate.name}</h1>
          <div class="a4-headline">${candidate.position.toUpperCase()}</div>
        </div>
        <div class="a4-contacts">
          <div>📧 ${candidate.email}</div>
          <div>📱 ${candidate.phone}</div>
          <div>📍 Hà Nội, Việt Nam</div>
          <div>🌐 github.com/${candidate.name.toLowerCase().replace(/\s+/g, "")}</div>
        </div>
      </div>

      <div class="a4-section">
        <h2 class="a4-section-title">1. MỤC TIÊU NGHỀ NGHIỆP</h2>
        <p class="a4-item-desc">${candidate.bio}</p>
      </div>

      <div class="a4-section">
        <h2 class="a4-section-title">2. HỌC VẤN & BẰNG CẤP</h2>
        <div class="a4-item">
          <div class="a4-item-head">
            <span class="a4-item-title">${candidate.school}</span>
            <span class="a4-item-meta">2022 – Hiện tại</span>
          </div>
          <div class="a4-item-desc">
            Chuyên ngành: <strong>${candidate.major}</strong> • Điểm tích lũy trung bình: <strong>${candidate.gpa}</strong>
          </div>
        </div>
      </div>

      <div class="a4-section">
        <h2 class="a4-section-title">3. KỸ NĂNG CHUYÊN MÔN</h2>
        <div class="a4-item-desc" style="line-height: 1.8;">
          • <strong>Công nghệ & Ngôn ngữ:</strong> ${candidate.skills}<br>
          • <strong>Ngoại ngữ:</strong> Tiếng Anh giao tiếp tốt (TOEIC 750+ / B2 tương đương)<br>
          • <strong>Kỹ năng mềm:</strong> Làm việc nhóm, tư duy logic, quản lý thời gian, Agile/Scrum
        </div>
      </div>

      <div class="a4-section">
        <h2 class="a4-section-title">4. DỰ ÁN TIÊU BIỂU & HOẠT ĐỘNG</h2>
        <div class="a4-item">
          <div class="a4-item-head">
            <span class="a4-item-title">Dự án cá nhân / Nhóm môn học</span>
            <span class="a4-item-meta">03/2026 - 06/2026</span>
          </div>
          <p class="a4-item-desc">${candidate.projects}</p>
        </div>
        <div class="a4-item">
          <div class="a4-item-head">
            <span class="a4-item-title">Hoạt động ngoại khóa & Giải thưởng</span>
            <span class="a4-item-meta">2024 - 2025</span>
          </div>
          <p class="a4-item-desc">Thành viên tích cực CLB Lập trình & Sáng tạo Công nghệ; Tình nguyện viên Mùa hè xanh.</p>
        </div>
      </div>

      <div class="a4-seal-box">
        <div class="a4-seal-sign">
          <div class="a4-seal-date">Hà Nội, ngày ${candidate.appliedDate}</div>
          <div class="a4-seal-name">Người lập hồ sơ<br><strong>${candidate.name}</strong></div>
        </div>
      </div>
    `;
  } else {
    if (btnLetter) btnLetter.classList.add("active");
    if (btnCV) btnCV.classList.remove("active");
    if (fileNameEl) fileNameEl.textContent = candidate.docLetterName;
    if (fileSizeEl) fileSizeEl.textContent = "950 KB • Đơn xin thực tập & Bảng điểm trường";

    // Render A4 Sheet: Định dạng Đơn xin thực tập chuẩn mực
    a4Content.innerHTML = `
      <div style="text-align: center; margin-bottom: 24px;">
        <h4 style="font-size: 13px; text-transform: uppercase; font-weight: 700; margin-bottom: 4px;">
          CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
        </h4>
        <p style="font-size: 12px; font-weight: 600; text-decoration: underline;">
          Độc lập - Tự do - Hạnh phúc
        </p>
      </div>

      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="font-size: 18px; font-weight: 800; color: #0f172a; text-transform: uppercase;">
          ĐƠN XIN TIẾP NHẬN THỰC TẬP TỐT NGHIỆP
        </h2>
        <p style="font-size: 12px; color: #64748b; font-style: italic;">
          Kính gửi: Ban Giám đốc & Phòng Nhân sự Công ty CODEGYM
        </p>
      </div>

      <div class="a4-section">
        <p class="a4-item-desc" style="line-height: 1.8; margin-bottom: 12px;">
          Tên tôi là: <strong>${candidate.name}</strong><br>
          Sinh ngày: <strong>15/08/2004</strong> &nbsp;&nbsp;&nbsp;&nbsp; Giới tính: <strong>Nam</strong><br>
          Sinh viên trường: <strong>${candidate.school}</strong><br>
          Chuyên ngành đào tạo: <strong>${candidate.major}</strong> &nbsp;&nbsp;&nbsp;&nbsp; Điểm tích lũy: <strong>${candidate.gpa}</strong><br>
          Số điện thoại liên hệ: <strong>${candidate.phone}</strong> &nbsp;&nbsp;&nbsp;&nbsp; Email: <strong>${candidate.email}</strong>
        </p>

        <p class="a4-item-desc" style="line-height: 1.8; margin-bottom: 12px;">
          Căn cứ theo kế hoạch đào tạo thực tế của Nhà trường và nguyện vọng trau dồi kinh nghiệm chuyên môn trong môi trường doanh nghiệp chuyên nghiệp, tôi viết đơn này kính mong Quý công ty xem xét tiếp nhận tôi vào vị trí <strong>${candidate.position}</strong> (Phòng <strong>${candidate.dept}</strong>).
        </p>

        <p class="a4-item-desc" style="line-height: 1.8; margin-bottom: 12px;">
          Tôi xin cam kết:
          <br>1. Nghiêm túc chấp hành toàn bộ nội quy, quy định bảo mật thông tin và thời gian làm việc của công ty.
          <br>2. Nỗ lực học hỏi, hoàn thành xuất sắc các nhiệm vụ được người hướng dẫn (Mentor) phân công.
          <br>3. Giữ gìn văn hóa làm việc văn minh, trách nhiệm và kỷ luật cao.
        </p>
      </div>

      <div style="display: flex; justify-content: space-between; margin-top: 36px; padding: 0 20px;">
        <div style="text-align: center;">
          <p style="font-size: 12px; font-weight: 700; text-transform: uppercase;">Xác nhận của Nhà trường</p>
          <p style="font-size: 11px; color: #64748b; margin-top: 2px;">(Ký và đóng dấu)</p>
          <div style="margin-top: 50px; font-weight: 700; color: #2563eb;">[ĐÃ XÁC THỰC BẢN GỐC]</div>
        </div>
        <div style="text-align: center;">
          <p style="font-size: 12px; font-style: italic;">Hà Nội, ngày ${candidate.appliedDate}</p>
          <p style="font-size: 12px; font-weight: 700; text-transform: uppercase; margin-top: 2px;">Người làm đơn</p>
          <div style="margin-top: 50px; font-weight: 700; color: #0f172a;">${candidate.name}</div>
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
          <button type="button" class="btn-action btn-edit" onclick="openEditModal(${item.id})" title="Chỉnh sửa thông tin">
            <i class="fa-solid fa-pen-to-square"></i>
            <span>Sửa</span>
          </button>
          <button type="button" class="btn-action btn-delete" onclick="handleDeleteIntern(${item.id})" title="Xóa khỏi danh sách">
            <i class="fa-solid fa-trash-can"></i>
            <span>Xóa</span>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Bấm nút Mở Modal Thêm mới thực tập sinh
function openAddModal() {
  document.getElementById("addName").value = "";
  document.getElementById("addEmail").value = "";
  document.getElementById("addMajor").value = "";
  document.getElementById("addSchool").value = "";
  document.getElementById("addDept").value = "Kỹ thuật phần mềm";
  document.getElementById("addMentor").value = "";
  document.getElementById("addStartDate").value = "2026-10-01";
  document.getElementById("addEndDate").value = "2026-12-31";
  document.getElementById("addStatus").value = "Đang thực tập";
  openModal("addModal");
}

// Xử lý Lưu Thêm Mới TTS
function handleAddSubmit(e) {
  e.preventDefault();

  const name = document.getElementById("addName").value.trim();
  const email = document.getElementById("addEmail").value.trim();
  const major = document.getElementById("addMajor").value.trim();
  const school = document.getElementById("addSchool").value.trim();
  const dept = document.getElementById("addDept").value;
  const mentor = document.getElementById("addMentor").value.trim();
  const startDate = document.getElementById("addStartDate").value;
  const endDate = document.getElementById("addEndDate").value;
  const status = document.getElementById("addStatus").value;

  const formatDate = (d) => {
    if (!d) return "";
    const [y, m, day] = d.split("-");
    return `${day}/${m}/${y}`;
  };

  const newIntern = {
    id: Date.now(),
    name,
    email,
    major,
    school,
    dept,
    mentor,
    time: `${formatDate(startDate)} - ${formatDate(endDate)}`,
    status
  };

  internList.unshift(newIntern);
  closeModal("addModal");
  filterData();
  renderOverview();

  showToast(`Đã thêm mới thực tập sinh "${name}" thành công!`, "success");
}

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

    showToast(`Cập nhật thông tin thực tập sinh "${intern.name}" thành công!`, "success");
  }
}

// Xử lý Xóa thực tập sinh
function handleDeleteIntern(id) {
  const intern = internList.find((item) => item.id === id);
  if (!intern) return;

  if (confirm(`Bạn có chắc chắn muốn xóa thực tập sinh "${intern.name}" khỏi danh sách?`)) {
    internList = internList.filter((item) => item.id !== id);
    filterData();
    renderOverview();
    showToast(`Đã xóa thực tập sinh "${intern.name}" khỏi danh sách.`, "warning");
  }
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
      alert("Xác nhận mật khẩu mới không khớp!");
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

// Đăng xuất
function confirmLogout() {
  closeModal("logoutModal");
  showToast("Đang đăng xuất khỏi hệ thống...", "info");
  setTimeout(() => {
    window.location.href = "index.html";
  }, 600);
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
});
