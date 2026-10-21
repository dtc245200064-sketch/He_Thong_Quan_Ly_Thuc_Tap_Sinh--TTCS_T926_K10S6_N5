/**
 * ==============================================================================
 * MENTOR PORTAL JAVASCRIPT (PHÂN HỆ NGƯỜI HƯỚNG DẪN / TECH LEAD)
 * Độc lập hoàn toàn với HR, hoạt động 100% trên CSDL MySQL qua API RESTful
 * Đáp ứng các User Stories Sprint 3: STT 15, 16, 17, 18, 19, 30, 31, 35, 36
 * ==============================================================================
 */

// Trạng thái dữ liệu phân hệ Mentor
const MentorState = {
  currentMentor: {
    id: null,
    name: 'Người hướng dẫn',
    email: '',
    dept: 'Chưa phân bổ',
    position: 'Mentor',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120'
  },
  interns: [],
  tasks: [],
  reports: [],
  evaluations: [],
  meetings: [],
  notifications: [],
  activeTab: 'overview'
};

// 1. KHỞI TẠO HỆ THỐNG KHI TRANG TẢI XONG
document.addEventListener('DOMContentLoaded', async () => {
  // A. Kiểm tra quyền và phiên đăng nhập
  checkMentorAuth();

  // B. Hiển thị ngày tháng thực tế
  initLiveDate();

  // C. Bắt sự kiện menu chuyển Tab
  initTabNavigation();

  // D. Tải toàn bộ dữ liệu từ CSDL MySQL qua API
  await loadAllMentorData();
});

// Kiểm tra quyền đăng nhập của Mentor
function checkMentorAuth() {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const role = localStorage.getItem('userRole');

  if (!isLoggedIn) {
    window.location.href = 'index.html';
    return;
  }

  // Lấy thông tin tài khoản người dùng từ Session
  try {
    const rawUser = localStorage.getItem('user');
    if (rawUser) {
      const user = JSON.parse(rawUser);
      if (user.name) MentorState.currentMentor.name = user.name;
      if (user.email) MentorState.currentMentor.email = user.email;
      if (user.mentor_id) MentorState.currentMentor.id = user.mentor_id;
      if (user.dept) MentorState.currentMentor.dept = user.dept;
      if (user.avatar) MentorState.currentMentor.avatar = user.avatar;
    }
  } catch (e) {
    console.warn('Lỗi đọc session user:', e);
  }

  // Cập nhật giao diện Sidebar
  const nameEl = document.getElementById('sidebarMentorName');
  const deptEl = document.getElementById('sidebarMentorDept');
  const avatarEl = document.getElementById('sidebarMentorAvatar');

  if (nameEl) nameEl.textContent = MentorState.currentMentor.name;
  if (deptEl) deptEl.textContent = MentorState.currentMentor.dept;
  if (avatarEl && MentorState.currentMentor.avatar) avatarEl.src = MentorState.currentMentor.avatar;
}

// Khởi tạo hiển thị ngày hôm nay
function initLiveDate() {
  const dateEl = document.getElementById('liveDateText');
  if (dateEl) {
    const now = new Date();
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    dateEl.textContent = `${days[now.getDay()]}, ${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;
  }
}

// Bắt sự kiện chuyển tab trên Sidebar
function initTabNavigation() {
  const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const tab = item.getAttribute('data-tab');
      if (tab) switchMentorTab(tab);
    });
  });

  // Hỗ trợ URL hash
  const hash = window.location.hash.replace('#', '');
  if (hash && ['overview', 'interns', 'tasks', 'reports', 'evaluations', 'meetings', 'notifications'].includes(hash)) {
    switchMentorTab(hash);
  }
}

// Hàm chuyển đổi Tab hiển thị
function switchMentorTab(tabName) {
  MentorState.activeTab = tabName;
  window.location.hash = tabName;

  // Cập nhật trạng thái active trên sidebar
  document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
    if (item.getAttribute('data-tab') === tabName) item.classList.add('active');
    else item.classList.remove('active');
  });

  // Hiển thị section tương ứng
  document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
  const targetPane = document.getElementById(`pane-${tabName}`);
  if (targetPane) targetPane.classList.add('active');

  // Cập nhật tiêu đề Topbar
  const titleEl = document.getElementById('pageTitle');
  const titles = {
    overview: 'Tổng quan người hướng dẫn',
    interns: 'Danh sách Thực tập sinh phụ trách',
    tasks: 'Quản lý nhiệm vụ & Giao việc (STT 15, 16)',
    reports: 'Duyệt & Phản hồi Báo cáo tuần (STT 17, 18)',
    evaluations: 'Đánh giá kỹ năng & Thái độ tổng kết (STT 19)',
    meetings: 'Lịch họp & Trao đổi với TTS (STT 35)',
    notifications: 'Thông báo ứng dụng (STT 36)'
  };
  if (titleEl) titleEl.textContent = titles[tabName] || 'Cổng Người Hướng Dẫn';
}

// ==============================================================================
// 2. TẢI DỮ LIỆU TỪ CSDL MYSQL VÀ RENDER GIAO DIỆN
// ==============================================================================
async function loadAllMentorData() {
  try {
    // 1. Tải danh sách mentor để map chính xác mentor_id nếu cần
    if (typeof apiGetMentors === 'function') {
      const mentorRes = await apiGetMentors();
      if (mentorRes && mentorRes.success && Array.isArray(mentorRes.data)) {
        const found = mentorRes.data.find(m => m.email === MentorState.currentMentor.email || m.name === MentorState.currentMentor.name);
        if (found) {
          MentorState.currentMentor.id = found.id;
          MentorState.currentMentor.name = found.name;
          MentorState.currentMentor.dept = found.dept || MentorState.currentMentor.dept;
          MentorState.currentMentor.position = found.position || MentorState.currentMentor.position;
        }
      }
    }

    // 2. Tải danh sách Thực tập sinh
    if (typeof apiGetInterns === 'function') {
      const internRes = await apiGetInterns();
      if (internRes && internRes.success && Array.isArray(internRes.data)) {
        // Lọc các TTS do Mentor này quản lý (hoặc tất cả TTS nếu chưa phân bổ rõ)
        const myName = MentorState.currentMentor.name.toLowerCase();
        let myInterns = internRes.data.filter(i => {
          if (!i.mentor) return false;
          return i.mentor.toLowerCase().includes(myName) || myName.includes(i.mentor.toLowerCase());
        });
        // Nếu mới tạo chưa có ai gán rõ ràng thì lấy danh sách thực tập sinh đang thực tập
        if (myInterns.length === 0) {
          myInterns = internRes.data.slice(0, 5);
        }
        MentorState.interns = myInterns;
      }
    }

    // 3. Tải danh sách nhiệm vụ (Tasks - STT 15, 16)
    if (typeof apiGetTasks === 'function') {
      const taskRes = await apiGetTasks({ mentor_id: MentorState.currentMentor.id });
      if (taskRes && taskRes.success && Array.isArray(taskRes.data)) {
        MentorState.tasks = taskRes.data;
      }
    }

    // 4. Tải danh sách báo cáo tuần (Weekly Reports - STT 17, 18)
    if (typeof apiGetWeeklyReports === 'function') {
      const reportRes = await apiGetWeeklyReports({ mentor_id: MentorState.currentMentor.id });
      if (reportRes && reportRes.success && Array.isArray(reportRes.data)) {
        MentorState.reports = reportRes.data;
      }
    }

    // 5. Tải danh sách đánh giá tổng kết (Evaluations - STT 19)
    if (typeof apiGetEvaluations === 'function') {
      const evalRes = await apiGetEvaluations({ mentor_id: MentorState.currentMentor.id });
      if (evalRes && evalRes.success && Array.isArray(evalRes.data)) {
        MentorState.evaluations = evalRes.data;
      }
    }

    // 6. Tải danh sách lịch họp (Meetings - STT 35)
    if (typeof apiGetMeetings === 'function') {
      const meetingRes = await apiGetMeetings();
      if (meetingRes && meetingRes.success && Array.isArray(meetingRes.data)) {
        MentorState.meetings = meetingRes.data;
      }
    }

    // 7. Tải thông báo In-app (STT 36)
    if (typeof apiGetInAppNotifications === 'function') {
      const notifRes = await apiGetInAppNotifications({ role: 'Mentor' });
      if (notifRes && notifRes.success && Array.isArray(notifRes.data)) {
        MentorState.notifications = notifRes.data;
      }
    }
  } catch (err) {
    console.error('Lỗi khi tải dữ liệu Mentor từ CSDL:', err);
  }

  // RENDER DỮ LIỆU LÊN TẤT CẢ CÁC BẢNG
  renderAllMentorViews();
}

// Gọi render toàn bộ các views
function renderAllMentorViews() {
  updateMentorBadgesAndKPIs();
  renderOverviewView();
  renderInternsView();
  renderTasksView();
  renderReportsView();
  renderEvaluationsView();
  renderMeetingsView();
  renderNotificationsView();
}

// Cập nhật các chỉ số thẻ KPI và Badge trên Sidebar
function updateMentorBadgesAndKPIs() {
  const pendingReportsCount = MentorState.reports.filter(r => r.status === 'submitted' || !r.mentor_feedback).length;
  const activeTasksCount = MentorState.tasks.filter(t => t.status !== 'done').length;

  // KPI Cards
  const kpiInterns = document.getElementById('statMyInterns');
  const kpiTasks = document.getElementById('statActiveTasks');
  const kpiReports = document.getElementById('statPendingReports');
  const kpiMeetings = document.getElementById('statUpcomingMeetings');

  if (kpiInterns) kpiInterns.textContent = MentorState.interns.length;
  if (kpiTasks) kpiTasks.textContent = activeTasksCount;
  if (kpiReports) kpiReports.textContent = pendingReportsCount;
  if (kpiMeetings) kpiMeetings.textContent = MentorState.meetings.length;

  // Sidebar badges
  const badgeIntern = document.getElementById('badgeInternCount');
  const badgeReport = document.getElementById('badgePendingReports');
  const badgeNotif = document.getElementById('badgeNotifCount');
  const topbarDot = document.getElementById('topbarNotifDot');

  if (badgeIntern) {
    badgeIntern.textContent = MentorState.interns.length;
    badgeIntern.style.display = MentorState.interns.length > 0 ? 'inline-block' : 'none';
  }
  if (badgeReport) {
    badgeReport.textContent = pendingReportsCount;
    badgeReport.style.display = pendingReportsCount > 0 ? 'inline-block' : 'none';
  }
  const unreadNotifs = MentorState.notifications.filter(n => !n.is_read).length;
  if (badgeNotif) {
    badgeNotif.textContent = unreadNotifs;
    badgeNotif.style.display = unreadNotifs > 0 ? 'inline-block' : 'none';
  }
  if (topbarDot) {
    topbarDot.style.display = unreadNotifs > 0 ? 'block' : 'none';
  }
}

// ==============================================================================
// 3. RENDER TAB 1: TỔNG QUAN (OVERVIEW)
// ==============================================================================
function renderOverviewView() {
  const tbodyInterns = document.getElementById('overviewInternsTableBody');
  const tbodyReports = document.getElementById('overviewReportsTableBody');

  // Bảng TTS tóm tắt
  if (tbodyInterns) {
    if (MentorState.interns.length === 0) {
      tbodyInterns.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 24px; color:#94a3b8;">Chưa có thực tập sinh nào được gán cho bạn.</td></tr>`;
    } else {
      tbodyInterns.innerHTML = MentorState.interns.map(i => {
        const avatar = i.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(i.name)}&background=6366f1&color=fff`;
        const progress = Math.min(100, Math.max(0, parseInt(i.progress || 50)));
        return `
          <tr>
            <td>
              <div class="user-cell">
                <img src="${avatar}" class="user-avatar-sm" alt="${escapeHtml(i.name)}">
                <div>
                  <div class="user-meta-name">${escapeHtml(i.name)}</div>
                  <div class="user-meta-sub">${escapeHtml(i.email || '')}</div>
                </div>
              </div>
            </td>
            <td>${escapeHtml(i.school || 'Đại học')} - <strong>${escapeHtml(i.major || 'CNTT')}</strong></td>
            <td>${escapeHtml(i.start_date || '01/09/2026')} - ${escapeHtml(i.end_date || '30/11/2026')}</td>
            <td>
              <div class="progress-wrap">
                <div class="progress-bar-bg"><div class="progress-bar-fill" style="width: ${progress}%;"></div></div>
                <span class="progress-pct">${progress}%</span>
              </div>
            </td>
            <td><span class="badge badge-success">${escapeHtml(i.status || 'Đang thực tập')}</span></td>
            <td style="text-align:right;">
              <button type="button" class="btn btn-outline btn-sm" onclick="switchMentorTab('tasks'); prefillTaskIntern(${i.id});">
                <i class="fa-solid fa-list-check"></i> Giao việc
              </button>
            </td>
          </tr>
        `;
      }).join('');
    }
  }

  // Bảng báo cáo tuần chờ phản hồi
  if (tbodyReports) {
    const pendingList = MentorState.reports.filter(r => r.status === 'submitted' || !r.mentor_feedback);
    if (pendingList.length === 0) {
      tbodyReports.innerHTML = `<tr><td colspan="6" class="empty-row"><i class="fa-solid fa-circle-check"></i> Tuyệt vời! Không còn báo cáo nào đang chờ phản hồi.</td></tr>`;
    } else {
      tbodyReports.innerHTML = pendingList.slice(0, 5).map(r => {
        return `
          <tr>
            <td><strong>Tuần ${r.week_number}</strong></td>
            <td><span style="font-weight:600; color:var(--text-main);">${escapeHtml(r.intern_name || 'TTS #' + r.intern_id)}</span></td>
            <td>${formatDate(r.created_at || r.start_date)}</td>
            <td style="max-width:280px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
              ${escapeHtml(r.tasks_completed || 'Đã hoàn thành các task tuần')}
            </td>
            <td><span class="badge badge-warning">Chờ phản hồi</span></td>
            <td style="text-align:right;">
              <button type="button" class="btn btn-primary btn-sm" onclick="openFeedbackReportModal(${r.id})">
                <i class="fa-solid fa-file-pen"></i> Phản hồi ngay
              </button>
            </td>
          </tr>
        `;
      }).join('');
    }
  }
}

// ==============================================================================
// 4. RENDER TAB 2: THỰC TẬP SINH CỦA TÔI
// ==============================================================================
function renderInternsView() {
  const tbody = document.getElementById('mentorInternsTableBody');
  if (!tbody) return;

  if (MentorState.interns.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 32px; color:#94a3b8;">Hiện chưa có thực tập sinh nào.</td></tr>`;
    return;
  }

  tbody.innerHTML = MentorState.interns.map(i => {
    const avatar = i.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(i.name)}&background=6366f1&color=fff`;
    const progress = Math.min(100, Math.max(0, parseInt(i.progress || 50)));
    return `
      <tr>
        <td>
          <div class="user-cell">
            <img src="${avatar}" class="user-avatar-sm" alt="${escapeHtml(i.name)}">
            <div>
              <div class="user-meta-name">${escapeHtml(i.name)}</div>
              <div class="user-meta-sub">${escapeHtml(i.position || 'Thực tập sinh')}</div>
            </div>
          </div>
        </td>
        <td>
          <div><i class="fa-regular fa-envelope me-1 text-muted"></i> ${escapeHtml(i.email || 'Chưa cập nhật')}</div>
          <div style="font-size:12px; color:#64748b;"><i class="fa-solid fa-phone me-1 text-muted"></i> ${escapeHtml(i.phone || 'Chưa có')}</div>
        </td>
        <td>
          <div>${escapeHtml(i.school || 'Đại học')}</div>
          <div style="font-size:12px; color:#64748b;">${escapeHtml(i.major || 'CNTT')}</div>
        </td>
        <td>${formatDate(i.start_date || '2026-09-01')} - ${formatDate(i.end_date || '2026-11-30')}</td>
        <td>
          <div class="progress-wrap">
            <div class="progress-bar-bg"><div class="progress-bar-fill" style="width:${progress}%;"></div></div>
            <span class="progress-pct">${progress}%</span>
          </div>
        </td>
        <td><span class="badge badge-success">${escapeHtml(i.status || 'Đang thực tập')}</span></td>
        <td style="text-align:right;">
          <div style="display:flex; justify-content:flex-end; gap:6px;">
            <button type="button" class="btn btn-primary btn-sm" onclick="switchMentorTab('tasks'); prefillTaskIntern(${i.id});" title="Giao nhiệm vụ">
              <i class="fa-solid fa-plus"></i> Giao việc
            </button>
            <button type="button" class="btn btn-outline btn-sm" onclick="switchMentorTab('evaluations'); openEvaluationModal(${i.id});" title="Đánh giá tổng kết">
              <i class="fa-solid fa-award"></i> Chấm điểm
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function filterMentorInterns() {
  const query = (document.getElementById('searchInternInput')?.value || '').toLowerCase().trim();
  const status = document.getElementById('filterInternStatus')?.value || '';
  const rows = document.querySelectorAll('#mentorInternsTableBody tr');

  rows.forEach(row => {
    const text = row.innerText.toLowerCase();
    const matchesQuery = !query || text.includes(query);
    const matchesStatus = !status || text.includes(status.toLowerCase());
    row.style.display = matchesQuery && matchesStatus ? '' : 'none';
  });
}

// ==============================================================================
// 5. RENDER TAB 3: GIAO VIỆC & QUẢN LÝ NHIỆM VỤ (STT 15, 16)
// ==============================================================================
function renderTasksView() {
  const tbody = document.getElementById('mentorTasksTableBody');
  const internSelect = document.getElementById('filterTaskIntern');
  if (!tbody) return;

  // Cập nhật dropdown chọn TTS
  if (internSelect) {
    const curVal = internSelect.value;
    internSelect.innerHTML = `<option value="">Tất cả TTS</option>` + MentorState.interns.map(i => `<option value="${i.id}">${escapeHtml(i.name)}</option>`).join('');
    internSelect.value = curVal;
  }

  if (MentorState.tasks.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 32px; color:#94a3b8;">Chưa có nhiệm vụ nào được giao. Hãy nhấn nút "Giao việc mới"!</td></tr>`;
    return;
  }

  tbody.innerHTML = MentorState.tasks.map(t => {
    const priorityBadges = {
      high: '<span class="badge badge-danger">Ưu tiên cao</span>',
      medium: '<span class="badge badge-warning">Trung bình</span>',
      low: '<span class="badge badge-secondary">Thấp</span>'
    };
    const statusBadges = {
      todo: '<span class="badge badge-secondary">Cần làm</span>',
      in_progress: '<span class="badge badge-primary">Đang làm</span>',
      done: '<span class="badge badge-success">Hoàn thành</span>'
    };
    const progress = Math.min(100, Math.max(0, parseInt(t.progress || 0)));
    const internName = t.intern_name || (MentorState.interns.find(i => i.id === t.intern_id)?.name) || `TTS #${t.intern_id}`;

    return `
      <tr>
        <td>
          <div style="font-weight:600; color:var(--text-main);">${escapeHtml(t.title)}</div>
          <div style="font-size:12px; color:#64748b; max-width:320px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
            ${escapeHtml(t.description || 'Không có mô tả')}
          </div>
        </td>
        <td><strong>${escapeHtml(internName)}</strong></td>
        <td><i class="fa-regular fa-clock me-1 text-muted"></i> ${formatDate(t.deadline)}</td>
        <td>${priorityBadges[t.priority] || priorityBadges.medium}</td>
        <td>
          <div class="progress-wrap">
            <div class="progress-bar-bg"><div class="progress-bar-fill" style="width:${progress}%;"></div></div>
            <span class="progress-pct">${progress}%</span>
          </div>
        </td>
        <td>${statusBadges[t.status] || statusBadges.todo}</td>
        <td style="text-align:right;">
          <div style="display:flex; justify-content:flex-end; gap:6px;">
            ${t.status !== 'done' ? `
              <button type="button" class="btn btn-success btn-sm btn-icon-only" onclick="updateTaskStatusQuick(${t.id}, 'done')" title="Đánh dấu hoàn thành">
                <i class="fa-solid fa-check"></i>
              </button>
            ` : ''}
            <button type="button" class="btn btn-outline btn-sm btn-icon-only text-danger" onclick="deleteMentorTask(${t.id})" title="Xóa nhiệm vụ">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function filterMentorTasks() {
  const query = (document.getElementById('searchTaskInput')?.value || '').toLowerCase().trim();
  const internId = document.getElementById('filterTaskIntern')?.value || '';
  const status = document.getElementById('filterTaskStatus')?.value || '';
  const rows = document.querySelectorAll('#mentorTasksTableBody tr');

  rows.forEach(row => {
    const text = row.innerText.toLowerCase();
    const matchesQuery = !query || text.includes(query);
    const matchesStatus = !status || text.includes(status === 'done' ? 'hoàn thành' : (status === 'in_progress' ? 'đang làm' : 'cần làm'));
    row.style.display = matchesQuery && matchesStatus ? '' : 'none';
  });
}

// Mở modal giao việc mới (STT 15)
function openCreateTaskModal() {
  const select = document.getElementById('taskInternSelect');
  if (select) {
    select.innerHTML = `<option value="">-- Chọn Thực tập sinh trong nhóm --</option>` + 
      MentorState.interns.map(i => `<option value="${i.id}">${escapeHtml(i.name)} (${escapeHtml(i.school || 'Đại học')})</option>`).join('');
  }

  // Đặt hạn chót mặc định sau 7 ngày
  const deadInput = document.getElementById('taskDeadlineInput');
  if (deadInput) {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    deadInput.value = nextWeek.toISOString().split('T')[0];
  }

  openModal('createTaskModal');
}

function prefillTaskIntern(internId) {
  openCreateTaskModal();
  const select = document.getElementById('taskInternSelect');
  if (select) select.value = internId;
}

// Xử lý gửi Form giao việc mới
async function handleCreateTaskSubmit(event) {
  event.preventDefault();
  const intern_id = document.getElementById('taskInternSelect')?.value;
  const title = document.getElementById('taskTitleInput')?.value.trim();
  const deadline = document.getElementById('taskDeadlineInput')?.value;
  const priority = document.getElementById('taskPrioritySelect')?.value || 'medium';
  const description = document.getElementById('taskDescInput')?.value.trim() || '';

  if (!intern_id || !title || !deadline) {
    showMentorToast('Vui lòng điền đầy đủ các thông tin bắt buộc!', 'error');
    return;
  }

  try {
    const payload = {
      intern_id: parseInt(intern_id),
      mentor_id: MentorState.currentMentor.id,
      title,
      description,
      deadline,
      priority,
      progress: 0,
      status: 'todo'
    };

    if (typeof apiCreateTask === 'function') {
      const res = await apiCreateTask(payload);
      if (res && res.success) {
        showMentorToast('Giao nhiệm vụ cho thực tập sinh thành công!', 'success');
        closeModal('createTaskModal');
        document.getElementById('createTaskForm')?.reset();
        await loadAllMentorData();
        return;
      }
    }

    // Dự phòng offline
    MentorState.tasks.unshift({ ...payload, id: Date.now() });
    showMentorToast('Đã lưu nhiệm vụ vào hệ thống!', 'success');
    closeModal('createTaskModal');
    renderTasksView();
  } catch (err) {
    console.error('Lỗi khi giao task:', err);
    showMentorToast('Lỗi máy chủ khi giao nhiệm vụ!', 'error');
  }
}

async function updateTaskStatusQuick(taskId, newStatus) {
  try {
    if (typeof apiUpdateTask === 'function') {
      await apiUpdateTask(taskId, { status: newStatus, progress: newStatus === 'done' ? 100 : 50 });
      showMentorToast('Đã cập nhật trạng thái nhiệm vụ!', 'success');
      await loadAllMentorData();
      return;
    }
  } catch (e) {
    console.warn(e);
  }
}

async function deleteMentorTask(taskId) {
  const confirmed = typeof UI !== 'undefined' ? await UI.confirm({ title: 'Xác nhận xóa nhiệm vụ', message: 'Bạn có chắc chắn muốn xóa nhiệm vụ này không?', danger: true }) : true;
  if (!confirmed) return;
  try {
    if (typeof apiDeleteTask === 'function') {
      await apiDeleteTask(taskId);
      showMentorToast('Đã xóa nhiệm vụ thành công!', 'info');
      await loadAllMentorData();
    }
  } catch (e) {
    console.error(e);
  }
}

// ==============================================================================
// 6. RENDER TAB 4: BÁO CÁO TUẦN & PHẢN HỒI (STT 17, 18)
// ==============================================================================
function renderReportsView() {
  const tbody = document.getElementById('mentorReportsTableBody');
  if (!tbody) return;

  if (MentorState.reports.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 32px; color:#94a3b8;">Chưa có báo cáo tuần nào từ thực tập sinh.</td></tr>`;
    return;
  }

  tbody.innerHTML = MentorState.reports.map(r => {
    const internName = r.intern_name || (MentorState.interns.find(i => i.id === r.intern_id)?.name) || `TTS #${r.intern_id}`;
    const isReviewed = r.status === 'reviewed' || (r.mentor_feedback && r.mentor_feedback.length > 0);
    const ratingDisplay = r.mentor_rating ? `<span class="badge badge-success">${r.mentor_rating} / 10</span>` : '<span class="text-muted">-</span>';

    return `
      <tr>
        <td><strong>Tuần ${r.week_number}</strong></td>
        <td><span style="font-weight:600;">${escapeHtml(internName)}</span></td>
        <td>${formatDate(r.start_date)} - ${formatDate(r.end_date)}</td>
        <td style="max-width:260px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
          ${escapeHtml(r.tasks_completed || 'Chưa ghi nhận')}
        </td>
        <td style="max-width:220px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; color:#ef4444;">
          ${escapeHtml(r.issues_faced || 'Không có')}
        </td>
        <td>${ratingDisplay}</td>
        <td>${isReviewed ? '<span class="badge badge-success">Đã phản hồi</span>' : '<span class="badge badge-warning">Chờ phản hồi</span>'}</td>
        <td style="text-align:right;">
          <button type="button" class="btn ${isReviewed ? 'btn-outline' : 'btn-primary'} btn-sm" onclick="openFeedbackReportModal(${r.id})">
            <i class="fa-solid fa-file-pen"></i> ${isReviewed ? 'Sửa nhận xét' : 'Nhận xét'}
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function filterMentorReports() {
  const query = (document.getElementById('searchReportInput')?.value || '').toLowerCase().trim();
  const status = document.getElementById('filterReportStatus')?.value || '';
  const rows = document.querySelectorAll('#mentorReportsTableBody tr');

  rows.forEach(row => {
    const text = row.innerText.toLowerCase();
    const matchesQuery = !query || text.includes(query);
    const matchesStatus = !status || (status === 'reviewed' ? text.includes('đã phản hồi') : text.includes('chờ phản hồi'));
    row.style.display = matchesQuery && matchesStatus ? '' : 'none';
  });
}

// Mở modal phản hồi báo cáo tuần (STT 18)
function openFeedbackReportModal(reportId) {
  const report = MentorState.reports.find(r => r.id === reportId);
  if (!report) return;

  const idInput = document.getElementById('feedbackReportId');
  const titleEl = document.getElementById('reportDetailTitle');
  const timeEl = document.getElementById('reportDetailTime');
  const doneEl = document.getElementById('reportDetailDone');
  const issuesEl = document.getElementById('reportDetailIssues');
  const plansEl = document.getElementById('reportDetailPlans');
  const ratingInput = document.getElementById('reportRatingInput');
  const feedbackInput = document.getElementById('reportFeedbackInput');

  const internName = report.intern_name || (MentorState.interns.find(i => i.id === report.intern_id)?.name) || `TTS #${report.intern_id}`;

  if (idInput) idInput.value = report.id;
  if (titleEl) titleEl.textContent = `Báo cáo Tuần ${report.week_number} - Thực tập sinh: ${internName}`;
  if (timeEl) timeEl.textContent = `Khoảng thời gian: ${formatDate(report.start_date)} đến ${formatDate(report.end_date)}`;
  if (doneEl) doneEl.textContent = report.tasks_completed || 'Chưa cập nhật nội dung hoàn thành';
  if (issuesEl) issuesEl.textContent = report.issues_faced || 'Không có khó khăn nào được ghi nhận';
  if (plansEl) plansEl.textContent = report.plans_next_week || 'Tiếp tục theo kế hoạch đã đề ra';
  if (ratingInput) ratingInput.value = report.mentor_rating || '';
  if (feedbackInput) feedbackInput.value = report.mentor_feedback || '';

  openModal('feedbackReportModal');
}

// Xử lý gửi Form phản hồi báo cáo tuần
async function handleFeedbackReportSubmit(event) {
  event.preventDefault();
  const reportId = document.getElementById('feedbackReportId')?.value;
  const rating = parseFloat(document.getElementById('reportRatingInput')?.value || 0);
  const feedback = document.getElementById('reportFeedbackInput')?.value.trim();

  if (!reportId || isNaN(rating) || !feedback) {
    showMentorToast('Vui lòng nhập điểm đánh giá và nhận xét chi tiết!', 'error');
    return;
  }

  try {
    if (typeof apiFeedbackReport === 'function') {
      const res = await apiFeedbackReport(reportId, {
        mentor_rating: rating,
        mentor_feedback: feedback
      });
      if (res && res.success) {
        showMentorToast('Đã lưu nhận xét và gửi phản hồi cho thực tập sinh thành công!', 'success');
        closeModal('feedbackReportModal');
        await loadAllMentorData();
        return;
      }
    }

    // Dự phòng offline
    const rep = MentorState.reports.find(r => r.id === parseInt(reportId));
    if (rep) {
      rep.mentor_rating = rating;
      rep.mentor_feedback = feedback;
      rep.status = 'reviewed';
    }
    showMentorToast('Đã lưu phản hồi báo cáo tuần!', 'success');
    closeModal('feedbackReportModal');
    renderReportsView();
    updateMentorBadgesAndKPIs();
  } catch (err) {
    console.error('Lỗi phản hồi báo cáo:', err);
    showMentorToast('Lỗi máy chủ khi phản hồi báo cáo!', 'error');
  }
}

// ==============================================================================
// 7. RENDER TAB 5: ĐÁNH GIÁ TỔNG KẾT KỸ NĂNG & THÁI ĐỘ (STT 19)
// ==============================================================================
function renderEvaluationsView() {
  const tbody = document.getElementById('mentorEvaluationsTableBody');
  if (!tbody) return;

  if (MentorState.interns.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 32px; color:#94a3b8;">Chưa có thực tập sinh nào để đánh giá.</td></tr>`;
    return;
  }

  tbody.innerHTML = MentorState.interns.map(i => {
    const existing = MentorState.evaluations.find(e => e.intern_id === i.id);
    const techScore = existing ? existing.technical_score : '-';
    const attitudeScore = existing ? (existing.attitude_score || existing.discipline_score) : '-';
    const totalScore = existing ? existing.total_score : '-';
    const grade = existing ? existing.grade : '<span class="badge badge-warning">Chưa chấm</span>';
    const comments = existing ? escapeHtml(existing.mentor_comments || 'Đã đánh giá') : '<span class="text-muted">Chưa có nhận xét</span>';

    return `
      <tr>
        <td>
          <div style="font-weight:600; color:var(--text-main);">${escapeHtml(i.name)}</div>
          <div style="font-size:12px; color:#64748b;">${escapeHtml(i.email || '')}</div>
        </td>
        <td>${escapeHtml(i.school || 'Đại học')}</td>
        <td><strong style="color:var(--primary); font-size:15px;">${techScore}</strong></td>
        <td><strong style="color:var(--success); font-size:15px;">${attitudeScore}</strong></td>
        <td><strong style="color:var(--primary-dark); font-size:16px;">${totalScore}</strong></td>
        <td>${typeof grade === 'string' && grade.includes('<span') ? grade : `<span class="badge badge-success">${grade}</span>`}</td>
        <td style="max-width:280px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${comments}</td>
        <td style="text-align:right;">
          <button type="button" class="btn btn-primary btn-sm" onclick="openEvaluationModal(${i.id})">
            <i class="fa-solid fa-award"></i> ${existing ? 'Sửa đánh giá' : 'Chấm điểm'}
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

// Mở modal chấm điểm tổng kết (STT 19)
function openEvaluationModal(internId) {
  const intern = MentorState.interns.find(i => i.id === internId);
  if (!intern) return;

  const idInput = document.getElementById('evalInternId');
  const nameTitle = document.getElementById('evalInternNameTitle');
  const schoolSub = document.getElementById('evalInternSchoolSub');
  const techInput = document.getElementById('evalTechScore');
  const discInput = document.getElementById('evalDisciplineScore');
  const commentInput = document.getElementById('evalComments');

  if (idInput) idInput.value = intern.id;
  if (nameTitle) nameTitle.textContent = `Thực tập sinh: ${intern.name}`;
  if (schoolSub) schoolSub.textContent = `Trường: ${intern.school || 'Đại học'} | Chuyên ngành: ${intern.major || 'CNTT'}`;

  // Kiểm tra nếu đã có điểm lưu trước đó
  const existing = MentorState.evaluations.find(e => e.intern_id === internId);
  if (existing) {
    if (techInput) techInput.value = existing.technical_score || '';
    if (discInput) discInput.value = existing.discipline_score || existing.attitude_score || '';
    if (commentInput) commentInput.value = existing.mentor_comments || '';
  } else {
    if (techInput) techInput.value = '8.5';
    if (discInput) discInput.value = '9.0';
    if (commentInput) commentInput.value = '';
  }

  calcEvalTotalScore();
  openModal('evaluationModal');
}

// Tự động tính điểm trung bình và xếp loại
function calcEvalTotalScore() {
  const tech = parseFloat(document.getElementById('evalTechScore')?.value || 0);
  const disc = parseFloat(document.getElementById('evalDisciplineScore')?.value || 0);
  const total = ((tech + disc) / 2).toFixed(1);

  const totalEl = document.getElementById('evalTotalScoreDisplay');
  const gradeEl = document.getElementById('evalGradeDisplay');

  let grade = 'Chưa đạt';
  let gradeColor = '#ef4444';
  if (total >= 9.0) { grade = 'Xuất sắc'; gradeColor = '#10b981'; }
  else if (total >= 8.0) { grade = 'Giỏi'; gradeColor = '#059669'; }
  else if (total >= 6.5) { grade = 'Khá'; gradeColor = '#6366f1'; }
  else if (total >= 5.0) { grade = 'Trung bình (Đạt)'; gradeColor = '#f59e0b'; }

  if (totalEl) totalEl.textContent = total;
  if (gradeEl) {
    gradeEl.textContent = grade;
    gradeEl.style.color = gradeColor;
  }
}

// Xử lý nộp Form đánh giá tổng kết
async function handleEvaluationSubmit(event) {
  event.preventDefault();
  const intern_id = parseInt(document.getElementById('evalInternId')?.value);
  const tech = parseFloat(document.getElementById('evalTechScore')?.value || 0);
  const disc = parseFloat(document.getElementById('evalDisciplineScore')?.value || 0);
  const total = parseFloat(((tech + disc) / 2).toFixed(1));
  const grade = document.getElementById('evalGradeDisplay')?.textContent || 'Khá';
  const comments = document.getElementById('evalComments')?.value.trim();

  if (!intern_id || !comments) {
    showMentorToast('Vui lòng điền đầy đủ nhận xét tổng kết của Mentor!', 'error');
    return;
  }

  try {
    const payload = {
      intern_id,
      mentor_id: MentorState.currentMentor.id,
      technical_score: tech,
      discipline_score: disc,
      attitude_score: disc,
      total_score: total,
      grade,
      mentor_comments: comments,
      status: 'finalized'
    };

    if (typeof apiCreateEvaluation === 'function') {
      const res = await apiCreateEvaluation(payload);
      if (res && res.success) {
        showMentorToast('Đã lưu đánh giá kỹ năng & thái độ tổng kết cho TTS!', 'success');
        closeModal('evaluationModal');
        await loadAllMentorData();
        return;
      }
    }

    // Dự phòng offline
    const idx = MentorState.evaluations.findIndex(e => e.intern_id === intern_id);
    if (idx >= 0) MentorState.evaluations[idx] = { ...payload, id: MentorState.evaluations[idx].id };
    else MentorState.evaluations.push({ ...payload, id: Date.now() });

    showMentorToast('Đã lưu đánh giá tổng kết thành công!', 'success');
    closeModal('evaluationModal');
    renderEvaluationsView();
  } catch (err) {
    console.error('Lỗi khi lưu đánh giá:', err);
    showMentorToast('Lỗi máy chủ khi lưu đánh giá!', 'error');
  }
}

// ==============================================================================
// 8. RENDER TAB 6: LỊCH HỌP & TRAO ĐỔI (STT 35)
// ==============================================================================
function renderMeetingsView() {
  const tbody = document.getElementById('mentorMeetingsTableBody');
  if (!tbody) return;

  if (MentorState.meetings.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 32px; color:#94a3b8;">Chưa có lịch họp nào. Nhấn "Tạo lịch họp mới" để gửi email thông báo cho TTS!</td></tr>`;
    return;
  }

  tbody.innerHTML = MentorState.meetings.map(m => {
    let internNames = 'Tất cả TTS';
    if (m.intern_ids) {
      try {
        const ids = Array.isArray(m.intern_ids) ? m.intern_ids : JSON.parse(m.intern_ids);
        internNames = ids.map(id => MentorState.interns.find(i => i.id === id)?.name || `TTS #${id}`).join(', ');
      } catch (e) {}
    }

    return `
      <tr>
        <td>
          <div style="font-weight:600; color:var(--text-main);">${escapeHtml(m.title)}</div>
          <div style="font-size:12px; color:#64748b;">Chủ trì: ${escapeHtml(m.host_name || MentorState.currentMentor.name)}</div>
        </td>
        <td><i class="fa-regular fa-calendar me-1 text-muted"></i> ${formatDate(m.meeting_date)}</td>
        <td><i class="fa-regular fa-clock me-1 text-muted"></i> ${escapeHtml(m.start_time)} - ${escapeHtml(m.end_time)}</td>
        <td>
          ${m.link ? `<a href="${escapeHtml(m.link)}" target="_blank" class="btn btn-outline btn-sm" style="color:var(--primary);"><i class="fa-solid fa-video me-1"></i> Tham gia Meet</a>` : escapeHtml(m.location || 'Online Meet')}
        </td>
        <td><strong>${escapeHtml(internNames)}</strong></td>
        <td style="max-width:240px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
          ${escapeHtml(m.notes || 'Không có ghi chú')}
        </td>
        <td style="text-align:right;">
          <span class="badge badge-success"><i class="fa-solid fa-paper-plane me-1"></i> Đã gửi email</span>
        </td>
      </tr>
    `;
  }).join('');
}

// Mở modal tạo lịch họp mới (STT 35)
function openCreateMeetingModal() {
  const select = document.getElementById('meetingInternSelect');
  if (select) {
    select.innerHTML = `<option value="">-- Chọn Thực tập sinh tham gia --</option>` +
      MentorState.interns.map(i => `<option value="${i.id}">${escapeHtml(i.name)} (${escapeHtml(i.email)})</option>`).join('');
  }

  const dateInput = document.getElementById('meetingDate');
  if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];

  const startInput = document.getElementById('meetingStartTime');
  const endInput = document.getElementById('meetingEndTime');
  if (startInput) startInput.value = '09:00';
  if (endInput) endInput.value = '10:00';

  openModal('createMeetingModal');
}

// Xử lý gửi Form tạo lịch họp
async function handleCreateMeetingSubmit(event) {
  event.preventDefault();
  const title = document.getElementById('meetingTitle')?.value.trim();
  const meeting_date = document.getElementById('meetingDate')?.value;
  const intern_id = document.getElementById('meetingInternSelect')?.value;
  const start_time = document.getElementById('meetingStartTime')?.value;
  const end_time = document.getElementById('meetingEndTime')?.value;
  const link = document.getElementById('meetingLink')?.value.trim();
  const notes = document.getElementById('meetingNotes')?.value.trim();

  if (!title || !meeting_date || !intern_id || !start_time || !end_time) {
    showMentorToast('Vui lòng điền đầy đủ các mục bắt buộc!', 'error');
    return;
  }

  try {
    const payload = {
      title,
      meeting_date,
      start_time,
      end_time,
      location: link ? 'Google Meet Online' : 'Văn phòng CodeGym',
      link: link || '',
      host_name: MentorState.currentMentor.name,
      intern_ids: [parseInt(intern_id)],
      notes: notes || ''
    };

    if (typeof apiCreateMeeting === 'function') {
      const res = await apiCreateMeeting(payload);
      if (res && res.success) {
        showMentorToast('Tạo cuộc họp thành công & đã tự động gửi email cho TTS!', 'success');
        closeModal('createMeetingModal');
        await loadAllMentorData();
        return;
      }
    }

    // Dự phòng offline
    MentorState.meetings.unshift({ ...payload, id: Date.now() });
    showMentorToast('Đã lưu lịch họp thành công!', 'success');
    closeModal('createMeetingModal');
    renderMeetingsView();
  } catch (err) {
    console.error('Lỗi khi tạo lịch họp:', err);
    showMentorToast('Lỗi máy chủ khi tạo lịch họp!', 'error');
  }
}

// ==============================================================================
// 9. RENDER TAB 7: THÔNG BÁO IN-APP (STT 36)
// ==============================================================================
function renderNotificationsView() {
  const container = document.getElementById('mentorNotifList');
  if (!container) return;

  if (MentorState.notifications.length === 0) {
    container.innerHTML = `<div style="text-align:center; padding: 32px; color:#94a3b8;"><i class="fa-regular fa-bell-slash" style="font-size:32px; margin-bottom:8px;"></i><p>Không có thông báo mới nào.</p></div>`;
    return;
  }

  container.innerHTML = MentorState.notifications.map(n => {
    return `
      <div style="display:flex; align-items:flex-start; gap:14px; padding:16px; border-radius:var(--radius-md); background:${n.is_read ? '#ffffff' : '#f0fdf4'}; border:1px solid ${n.is_read ? 'var(--border-color)' : '#bbf7d0'};">
        <div style="width:36px; height:36px; border-radius:50%; background:${n.type === 'success' ? 'var(--success-light)' : 'var(--primary-light)'}; color:${n.type === 'success' ? 'var(--success)' : 'var(--primary)'}; display:flex; align-items:center; justify-content:center; font-size:16px;">
          <i class="${n.type === 'success' ? 'fa-solid fa-check' : 'fa-solid fa-info'}"></i>
        </div>
        <div style="flex:1;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <strong style="font-size:14px; color:var(--text-main);">${escapeHtml(n.title)}</strong>
            <span style="font-size:12px; color:#94a3b8;"><i class="fa-regular fa-clock me-1"></i>${formatDate(n.created_at)}</span>
          </div>
          <p style="font-size:13px; color:var(--text-muted); margin:0;">${escapeHtml(n.content)}</p>
        </div>
      </div>
    `;
  }).join('');
}

async function markAllMentorNotifsRead() {
  try {
    if (typeof apiMarkAllNotificationsRead === 'function') {
      await apiMarkAllNotificationsRead({ role: 'Mentor' });
    }
    MentorState.notifications.forEach(n => n.is_read = true);
    renderNotificationsView();
    updateMentorBadgesAndKPIs();
    showMentorToast('Đã đánh dấu đọc tất cả thông báo!', 'info');
  } catch (e) {
    console.warn(e);
  }
}

// ==============================================================================
// 10. HÀM TIỆN ÍCH MODAL, TOAST, FORMAT DATE, LOGOUT
// ==============================================================================
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('active');
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('active');
}

// Đóng modal khi bấm phím Escape
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.mentor-modal.active').forEach(m => m.classList.remove('active'));
  }
});

// Toast thông báo
function showMentorToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `mentor-toast ${type}`;
  const icon = type === 'success' ? 'fa-solid fa-circle-check text-success' : (type === 'error' ? 'fa-solid fa-circle-xmark text-danger' : 'fa-solid fa-circle-info text-info');
  toast.innerHTML = `<i class="${icon}"></i><span>${escapeHtml(message)}</span>`;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function openLogoutModal() {
  openModal('logoutModal');
}

let mentorLogoutTimer = null;

function confirmLogout() {
  closeModal('logoutModal');
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('userRole');
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  showMentorLogoutSuccessModal();
}

function showMentorLogoutSuccessModal() {
  const modalEl = document.getElementById('logoutSuccessModal');
  const progressFill = document.getElementById('logoutProgressFill');

  if (progressFill) {
    progressFill.style.transition = 'none';
    progressFill.style.width = '0%';
    void progressFill.offsetWidth;
    progressFill.style.transition = 'width 1.2s cubic-bezier(0.4, 0, 0.2, 1)';
    setTimeout(() => {
      progressFill.style.width = '100%';
    }, 50);
  }

  if (modalEl) {
    modalEl.classList.add('active');
  }

  if (mentorLogoutTimer) clearTimeout(mentorLogoutTimer);
  mentorLogoutTimer = setTimeout(() => {
    proceedToLoginPage();
  }, 1250);
}

function proceedToLoginPage() {
  if (mentorLogoutTimer) {
    clearTimeout(mentorLogoutTimer);
    mentorLogoutTimer = null;
  }
  window.location.href = 'index.html';
}

function formatDate(dateStr) {
  if (!dateStr) return 'Gần đây';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  } catch (e) {
    return dateStr;
  }
}

function escapeHtml(str) {
  if (typeof str !== 'string') return str || '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}
