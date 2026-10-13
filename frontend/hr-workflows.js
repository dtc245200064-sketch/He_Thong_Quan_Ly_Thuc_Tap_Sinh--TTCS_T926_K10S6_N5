/* Two HR UI tasks. Uses existing dashboard state, modal styles and API client. */
const HRWorkflows = (() => {
  const el = id => document.getElementById(id);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const canManage = () => ['HR', 'HR Manager', 'Admin', 'ADMIN'].includes(localStorage.getItem('userRole'));
  let mentors = [], loadingMentors = false, assignmentBusy = false, reviewBusy = false;
  const pending = l => l.status === 'Chờ duyệt';
  const badge = l => `<span class="leave-status-badge ${pending(l) ? 'leave-status-pending' : l.status === 'Đã duyệt' ? 'leave-status-approved' : 'leave-status-rejected'}">${esc(l.status)}</span>`;
  const date = s => { const bits = String(s || '').slice(0,10).split('-'); return bits.length === 3 ? bits.reverse().join('/') : '—'; };
  function renderLeaves() {
    if (!el('leavesTableBody')) return;
    el('leaveSummary').innerHTML = ['Chờ duyệt','Đã duyệt','Từ chối'].map(s => `<div class="hr-summary-card"><strong>${leaveRequests.filter(l=>l.status===s).length}</strong><span>${s}</span></div>`).join('');
    const q = (el('leaveSearch').value || '').trim().toLocaleLowerCase('vi');
    const status = el('leaveFilterStatus').value;
    const rows = leaveRequests.filter(l=>(!status || l.status===status) && `${l.internName} ${l.program} ${l.reason}`.toLocaleLowerCase('vi').includes(q));
    el('leavesTableBody').innerHTML = rows.length ? rows.map(l=>`<tr>
      <td><strong>${esc(l.internName)}</strong><div class="hr-muted">#TTS-${esc(l.internId)}</div></td><td>${esc(l.program)}</td>
      <td>${date(l.startDate)} → ${date(l.endDate)}</td><td>${esc(l.days)} ngày</td>
      <td title="${esc(l.reason)}">${esc(String(l.reason||'').slice(0,60))}</td><td>${esc(l.submittedAt || '—')}</td><td>${badge(l)}</td>
      <td><div class="action-buttons-leave"><button class="btn-action-leave btn-leave-detail" onclick="openLeaveDetailModal(${Number(l.id)})">Chi tiết</button>
      ${pending(l) && canManage() ? `<button class="btn-action-leave btn-leave-approve" onclick="handleApproveLeave(${Number(l.id)})">Duyệt</button><button class="btn-action-leave btn-leave-reject" onclick="handleRejectLeave(${Number(l.id)})">Từ chối</button>` : ''}</div></td></tr>`).join('') : '<tr><td colspan="8" class="hr-empty">Không có đơn nghỉ phép phù hợp.</td></tr>';
  }
  async function reloadLeaves() {
    el('leaveMessage').textContent = 'Đang tải đơn nghỉ phép…';
    try {
      const res = await apiGetLeaves();
      if (!res.success || !Array.isArray(res.data)) throw new Error(res.message || 'Không tải được danh sách');
      leaveRequests = res.data.map(l=>({id:l.id,internId:l.intern_id,internName:l.intern_name,program:l.intern_dept,startDate:String(l.start_date).slice(0,10),endDate:String(l.end_date).slice(0,10),days:l.days_count,reason:l.reason,leaveType:l.leave_type,submittedAt:(l.submitted_at||l.created_at) ? new Date(l.submitted_at||l.created_at).toLocaleString('vi-VN'):'',reviewNote:l.review_note,reviewedAt:l.reviewed_at ? new Date(l.reviewed_at).toLocaleString('vi-VN'):'',status:l.status==='approved'?'Đã duyệt':l.status==='rejected'?'Từ chối':'Chờ duyệt'}));
      renderLeaves(); el('leaveMessage').textContent = '';
    } catch(e) { el('leaveMessage').textContent = e.message + '. Bấm Tải lại để thử lại.'; }
  }
  function openLeave(id, action = '') {
    if (reviewBusy) return;
    const l = leaveRequests.find(x=>x.id===id); if (!l) return;
    const editable = pending(l) && canManage();
    el('leaveDetailBody').innerHTML = `<div class="hr-detail-heading"><h4>${esc(l.internName)}</h4>${badge(l)}</div><p class="hr-muted">${esc(l.program)} · #TTS-${esc(l.internId)}</p>
      <div class="hr-notice"><strong>${date(l.startDate)} → ${date(l.endDate)}</strong> · ${esc(l.days)} ngày<br>Loại nghỉ: ${esc(l.leaveType || 'Việc cá nhân')}</div>
      <h4>Lý do xin nghỉ</h4><p class="hr-reason">${esc(l.reason)}</p><p class="hr-muted">Ngày gửi: ${esc(l.submittedAt || '—')}</p>
      ${!pending(l) ? `<div class="hr-notice"><strong>Kết quả xử lý</strong><p class="hr-reason">${esc(l.reviewNote || 'Không có ghi chú')}</p><span>Thời điểm xử lý: ${esc(l.reviewedAt || '—')}</span></div>` : ''}
      ${editable ? `<label for="leaveReviewNote">Ghi chú HR / Lý do từ chối <span class="hr-muted">(bắt buộc khi từ chối)</span></label><textarea id="leaveReviewNote" class="form-control" rows="4" maxlength="1000" placeholder="Nhập nội dung phản hồi cho thực tập sinh"></textarea><p class="hr-muted">Xác nhận bên dưới để xử lý đơn. Đơn đã xử lý sẽ không thể duyệt lại.</p>` : ''}
      <p id="leaveReviewError" class="hr-error" role="alert"></p>`;
    el('leaveDetailFooter').innerHTML = `<button type="button" class="btn-secondary" onclick="closeModal('leaveDetailModal')">Đóng</button>${editable ? `<button id="leaveReject" class="btn-danger" onclick="HRWorkflows.review(${id}, 'rejected')">Xác nhận từ chối</button><button id="leaveApprove" class="btn-primary" onclick="HRWorkflows.review(${id}, 'approved')">Xác nhận duyệt</button>` : ''}`;
    el('leaveDetailModal').setAttribute('role','dialog'); el('leaveDetailModal').setAttribute('aria-modal','true');
    openModal('leaveDetailModal');
    if (editable) el(action==='rejected' ? 'leaveReviewNote' : 'leaveApprove').focus();
  }
  async function review(id, status) {
    if (reviewBusy || !canManage()) return;
    const l = leaveRequests.find(x=>x.id===id); if (!l || !pending(l)) return;
    const note = el('leaveReviewNote').value.trim();
    if (status === 'rejected' && !note) { el('leaveReviewError').textContent = 'Vui lòng nhập lý do từ chối.'; el('leaveReviewNote').focus(); return; }
    reviewBusy = true; el('leaveReviewError').textContent = '';
    el('leaveDetailModal').querySelectorAll('button').forEach(b=>b.disabled=true);
    try {
      const res = await apiReviewLeave(id,status,note);
      if (!res || !res.success) throw new Error(res?.message || 'Không thể xử lý đơn');
      l.status = status==='approved'?'Đã duyệt':'Từ chối'; l.reviewNote=note; l.reviewedAt=new Date().toLocaleString('vi-VN');
      renderLeaves(); closeModal('leaveDetailModal'); showToast(status==='approved'?'Đã duyệt đơn nghỉ phép':'Đã từ chối đơn nghỉ phép','success');
      await reloadLeaves();
      if(status==='approved') { await loadAttendanceFromDB(); renderAttendanceSheet(); }
    } catch(e) { el('leaveReviewError').textContent=e.message; }
    finally { reviewBusy=false; el('leaveDetailModal').querySelectorAll('button').forEach(b=>b.disabled=false); }
  }
  async function loadMentors() {
    if (loadingMentors) return;
    if (!canManage()) { el('mentorMessage').textContent='Chỉ HR hoặc Admin được phân công mentor.'; el('mentorCards').innerHTML=''; return; }
    loadingMentors=true; el('mentorMessage').textContent='Đang tải danh sách mentor…';
    try {
      mentors=await apiGetMentors();
      renderMentors(); el('mentorMessage').textContent=mentors.length?'':'Chưa có tài khoản mentor đang hoạt động.';
    } catch(e) { mentors=[]; el('mentorCards').innerHTML=''; el('mentorMessage').textContent=e.message+'. Bấm Tải lại để thử lại.'; }
    finally { loadingMentors=false; }
  }
  function renderMentors() {
    const q=el('mentorSearch').value.trim().toLocaleLowerCase('vi');
    const list=mentors.filter(m=>`${m.name} ${m.email}`.toLocaleLowerCase('vi').includes(q));
    el('mentorCards').innerHTML=list.length ? list.map(m=>{
      const tts=internList.filter(i=>i.mentor===m.name && i.status==='Đang thực tập');
      return `<article class="hr-mentor-card"><div class="hr-detail-heading"><h3>${esc(m.name)}</h3><span class="status-badge status-active">Hoạt động</span></div><p class="hr-muted">${esc(m.email)}</p><strong>${tts.length} TTS đang hướng dẫn</strong><ul>${tts.length ? tts.map(i=>`<li>${esc(i.name)} <button class="btn-secondary" onclick="HRWorkflows.openAssignment(${Number(i.id)})">Đổi mentor</button></li>`).join('') : '<li>Chưa được phân công TTS</li>'}</ul><button class="btn-primary" onclick="HRWorkflows.openAssignment(null,${Number(m.id)})">Phân công TTS</button></article>`;
    }).join('') : '<p class="hr-empty">Không có mentor phù hợp.</p>';
  }
  async function openAssignment(internId=null, mentorId=null) {
    if (!canManage() || assignmentBusy) return;
    el('assignError').textContent=''; el('assignSave').disabled=true; el('assignTts').innerHTML=''; el('assignMentor').innerHTML='';
    el('mentorAssignContext').textContent='Đang tải danh sách mentor…'; openModal('mentorAssignModal');
    try {
      mentors=await apiGetMentors();
      const active=internList.filter(i=>i.status==='Đang thực tập');
      el('assignTts').innerHTML='<option value="">— Chọn thực tập sinh —</option>'+active.map(i=>`<option value="${Number(i.id)}">${esc(i.name)} · ${esc(i.dept)}</option>`).join('');
      el('assignTts').value=internId||''; el('assignTts').dataset.fixed=internId ? 'true' : ''; el('assignTts').disabled=!!internId;
      el('assignMentor').innerHTML='<option value="">— Chọn mentor đang hoạt động —</option>'+mentors.map(m=>`<option value="${Number(m.id)}">${esc(m.name)} · ${esc(m.email)}</option>`).join('');
      el('assignMentor').value=mentorId||'';
      el('mentorAssignContext').textContent='Chọn TTS và mentor, kiểm tra thông tin rồi xác nhận phân công.';
      if (!mentors.length || !active.length) el('assignError').textContent=!mentors.length?'Chưa có mentor đang hoạt động.':'Chưa có TTS đang thực tập.';
      updateAssignment(); el('assignMentor').focus();
    } catch(e) { el('mentorAssignContext').textContent='Không tải được dữ liệu phân công.'; el('assignError').textContent=e.message; }
  }
  function updateAssignment() {
    const i=internList.find(i=>i.id===Number(el('assignTts').value));
    const m=mentors.find(m=>m.id===Number(el('assignMentor').value));
    el('currentMentor').textContent='Mentor hiện tại: '+(i?.mentor || 'Chưa phân công');
    el('assignPreview').textContent=i && m ? `${i.name}: ${i.mentor || 'Chưa phân công'} → ${m.name}` : 'Chọn đủ thông tin để xem phân công.';
    el('assignSave').disabled=assignmentBusy || !i || !m || i.mentor===m.name;
    el('assignSave').textContent=i && m && i.mentor===m.name ? 'Đã được phân công mentor này' : 'Xác nhận phân công';
  }
  async function saveMentor(event) {
    event.preventDefault(); if (assignmentBusy || !canManage()) return;
    const i=internList.find(i=>i.id===Number(el('assignTts').value)), m=mentors.find(m=>m.id===Number(el('assignMentor').value));
    if (!i || !m || i.mentor===m.name) return;
    assignmentBusy=true; el('assignError').textContent='';
    el('mentorAssignModal').querySelectorAll('button,select').forEach(x=>x.disabled=true);
    try {
      const data=await apiAssignMentor(i.id,m.id);
      i.mentor=data.mentor; filterData(); renderMentors(); closeModal('mentorAssignModal');
      showToast(`Đã phân công ${data.mentor} hướng dẫn ${i.name}`,'success');
    } catch(e) { el('assignError').textContent=e.message; }
    finally { assignmentBusy=false; el('mentorAssignModal').querySelectorAll('button,select').forEach(x=>x.disabled=false); el('assignTts').disabled=!!el('assignTts').dataset.fixed; updateAssignment(); }
  }
  document.addEventListener('DOMContentLoaded',()=>{
    if (!canManage()) el('navMentors').hidden=true;
    document.addEventListener('keydown',e=>{ if(e.key==='Escape' && !reviewBusy && !assignmentBusy) {closeModal('mentorAssignModal');closeModal('leaveDetailModal');} });
  });
  return {canManage,renderLeaves,reloadLeaves,openLeave,review,loadMentors,renderMentors,openAssignment,updateAssignment,saveMentor};
})();
