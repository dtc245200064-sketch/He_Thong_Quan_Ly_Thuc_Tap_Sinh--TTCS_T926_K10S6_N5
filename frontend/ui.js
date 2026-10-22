/**
 * CODEGYM INTERN MANAGEMENT - UI DIALOG HELPER
 * Provides modern, accessible, promise-based UI.confirm() & UI.alert()
 * Replaces native browser alert() and confirm() with calm UI modals.
 */

window.UI = (function() {
  let modalContainer = null;
  let previousActiveElement = null;
  let currentResolve = null;

  function ensureModalDOM() {
    if (modalContainer && document.body.contains(modalContainer)) return;
    modalContainer = document.createElement('div');
    modalContainer.id = 'uiDynamicModal';
    modalContainer.className = 'ui-modal-backdrop';
    modalContainer.setAttribute('role', 'dialog');
    modalContainer.setAttribute('aria-modal', 'true');
    modalContainer.setAttribute('tabindex', '-1');
    modalContainer.innerHTML = `
      <div class="ui-modal-box">
        <div class="ui-modal-header">
          <div class="ui-modal-icon" id="uiModalIcon"></div>
          <h3 class="ui-modal-title" id="uiModalTitle"></h3>
        </div>
        <div class="ui-modal-body" id="uiModalMessage"></div>
        <div class="ui-modal-footer" id="uiModalFooter">
          <button type="button" class="ui-btn ui-btn-cancel" id="uiModalBtnCancel">Hủy</button>
          <button type="button" class="ui-btn ui-btn-confirm" id="uiModalBtnConfirm">Đồng ý</button>
        </div>
      </div>
    `;
    document.body.appendChild(modalContainer);

    // Click on backdrop to dismiss
    modalContainer.addEventListener('click', (e) => {
      if (e.target === modalContainer) {
        close(false);
      }
    });

    // Keyboard handlers
    document.addEventListener('keydown', (e) => {
      if (!modalContainer || !modalContainer.classList.contains('active')) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        close(false);
      } else if (e.key === 'Tab') {
        trapFocus(e);
      }
    });
  }

  function trapFocus(e) {
    if (!modalContainer) return;
    const focusable = modalContainer.querySelectorAll('button:not([disabled])');
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  function close(result) {
    if (!modalContainer) return;
    modalContainer.classList.remove('active');
    setTimeout(() => {
      if (currentResolve) {
        const res = currentResolve;
        currentResolve = null;
        res(result);
      }
      if (previousActiveElement && typeof previousActiveElement.focus === 'function') {
        try { previousActiveElement.focus(); } catch (e) {}
      }
    }, 180);
  }

  /**
   * Modern replacement for confirm()
   * @param {Object} options
   * @param {string} [options.title='Xác nhận']
   * @param {string} [options.message='']
   * @param {string} [options.confirmText='Xác nhận']
   * @param {string} [options.cancelText='Hủy']
   * @param {boolean} [options.danger=false]
   * @returns {Promise<boolean>}
   */
  function confirm({
    title = 'Xác nhận thao tác',
    message = '',
    confirmText = 'Xác nhận',
    cancelText = 'Hủy',
    danger = false
  } = {}) {
    return new Promise((resolve) => {
      ensureModalDOM();
      previousActiveElement = document.activeElement;
      currentResolve = resolve;

      const titleEl = document.getElementById('uiModalTitle');
      const msgEl = document.getElementById('uiModalMessage');
      const iconEl = document.getElementById('uiModalIcon');
      const btnCancel = document.getElementById('uiModalBtnCancel');
      const btnConfirm = document.getElementById('uiModalBtnConfirm');

      titleEl.textContent = title;
      msgEl.textContent = message;

      btnCancel.style.display = 'inline-flex';
      btnCancel.textContent = cancelText;
      btnConfirm.textContent = confirmText;

      if (danger) {
        btnConfirm.className = 'ui-btn ui-btn-danger';
        iconEl.className = 'ui-modal-icon danger';
        iconEl.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i>';
      } else {
        btnConfirm.className = 'ui-btn ui-btn-primary';
        iconEl.className = 'ui-modal-icon primary';
        iconEl.innerHTML = '<i class="fa-solid fa-circle-question"></i>';
      }

      btnCancel.onclick = () => close(false);
      btnConfirm.onclick = () => close(true);

      requestAnimationFrame(() => {
        modalContainer.classList.add('active');
        if (danger) {
          btnCancel.focus();
        } else {
          btnConfirm.focus();
        }
      });
    });
  }

  /**
   * Modern replacement for alert()
   * @param {Object} options
   * @param {string} [options.title='Thông báo']
   * @param {string} [options.message='']
   * @param {string} [options.buttonText='Đã hiểu']
   * @returns {Promise<void>}
   */
  function alert({
    title = 'Thông báo',
    message = '',
    buttonText = 'Đã hiểu'
  } = {}) {
    return new Promise((resolve) => {
      ensureModalDOM();
      previousActiveElement = document.activeElement;
      currentResolve = () => resolve();

      const titleEl = document.getElementById('uiModalTitle');
      const msgEl = document.getElementById('uiModalMessage');
      const iconEl = document.getElementById('uiModalIcon');
      const btnCancel = document.getElementById('uiModalBtnCancel');
      const btnConfirm = document.getElementById('uiModalBtnConfirm');

      titleEl.textContent = title;
      msgEl.textContent = message;

      btnCancel.style.display = 'none';
      btnConfirm.className = 'ui-btn ui-btn-primary';
      btnConfirm.textContent = buttonText;

      iconEl.className = 'ui-modal-icon info';
      iconEl.innerHTML = '<i class="fa-solid fa-circle-info"></i>';

      btnConfirm.onclick = () => close(true);

      requestAnimationFrame(() => {
        modalContainer.classList.add('active');
        btnConfirm.focus();
      });
    });
  }

  return {
    confirm,
    alert
  };
})();


// ==========================================================================
// MOBILE SIDEBAR DRAWER CONTROLLER (All 4 Portals)
// ==========================================================================
(function initMobileSidebar() {
  function setup() {
    const sidebar = document.querySelector('.sidebar, .portal-sidebar, .admin-sidebar, .mentor-sidebar');
    if (!sidebar) return;

    let toggleBtn = document.getElementById('mobileSidebarToggle');
    if (!toggleBtn) {
      toggleBtn = document.createElement('button');
      toggleBtn.type = 'button';
      toggleBtn.id = 'mobileSidebarToggle';
      toggleBtn.className = 'mobile-sidebar-toggle';
      toggleBtn.setAttribute('aria-label', 'Mở / Đóng menu');
      toggleBtn.title = 'Mở / Đóng menu';
      toggleBtn.innerHTML = '<i class="fa-solid fa-bars"></i><span>Menu</span>';
      document.body.appendChild(toggleBtn);
    }

    let backdrop = document.getElementById('mobileSidebarBackdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = 'mobileSidebarBackdrop';
      backdrop.className = 'sidebar-mobile-backdrop';
      document.body.appendChild(backdrop);
    }

    function toggle(open) {
      const isOpen = typeof open === 'boolean' ? open : !sidebar.classList.contains('mobile-open');
      sidebar.classList.toggle('mobile-open', isOpen);
      sidebar.classList.toggle('open', isOpen);
      backdrop.classList.toggle('active', isOpen);
      toggleBtn.innerHTML = isOpen
        ? '<i class="fa-solid fa-xmark"></i><span>Đóng</span>'
        : '<i class="fa-solid fa-bars"></i><span>Menu</span>';
    }

    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggle();
    });

    backdrop.addEventListener('click', () => toggle(false));

    sidebar.addEventListener('click', (e) => {
      const item = e.target.closest('.menu-item, .nav-item, .sidebar-menu-btn, .nav-link, .sidebar-logout');
      if (item && window.innerWidth <= 900) {
        toggle(false);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup);
  } else {
    setup();
  }
})();

// ==========================================================================
// DESKTOP & MOBILE SIDEBAR COLLAPSE CONTROLLER (All 4 Portals)
// Hỗ trợ nút 3 gạch thu nhỏ / mở rộng sidebar, ẩn chữ giữ icon + avatar
// ==========================================================================
(function initSidebarCollapse() {
  function setup() {
    const sidebar = document.querySelector('.sidebar, .portal-sidebar, .admin-sidebar, .mentor-sidebar');
    if (!sidebar) return;

    // Tự động gán title tooltip cho từng item để khi thu nhỏ vẫn biết tên tab
    const navItems = sidebar.querySelectorAll('.nav-item, .menu-item, .sidebar-menu-btn');
    navItems.forEach(item => {
      const span = item.querySelector('span:not(.menu-badge):not(.menu-badge-sub):not(.nav-badge)');
      if (span && span.textContent && !item.getAttribute('title')) {
        item.setAttribute('title', span.textContent.trim());
      }
    });

    // Tìm tất cả các nút thu gọn (ở header hoặc toggle-bar)
    let toggleBtns = Array.from(document.querySelectorAll('.sidebar-collapse-btn, #sidebarCollapseBtn, #sidebarToggleBtn'));

    // Đọc trạng thái đã lưu từ localStorage
    const savedState = localStorage.getItem('sidebar_collapsed');
    if (savedState === 'true' && window.innerWidth > 900) {
      sidebar.classList.add('sidebar-collapsed');
      document.body.classList.add('sidebar-is-collapsed');
    }

    function toggleSidebarCollapse() {
      if (window.innerWidth <= 900) {
        // Màn hình nhỏ: mở/đóng drawer
        const isOpen = sidebar.classList.contains('mobile-open') || sidebar.classList.contains('open');
        sidebar.classList.toggle('mobile-open', !isOpen);
        sidebar.classList.toggle('open', !isOpen);
        const backdrop = document.getElementById('mobileSidebarBackdrop');
        if (backdrop) backdrop.classList.toggle('active', !isOpen);
      } else {
        // Desktop: thu nhỏ / mở rộng sidebar
        const isCollapsed = sidebar.classList.toggle('sidebar-collapsed');
        document.body.classList.toggle('sidebar-is-collapsed', isCollapsed);
        try {
          localStorage.setItem('sidebar_collapsed', isCollapsed ? 'true' : 'false');
        } catch (e) {}
      }
    }

    toggleBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleSidebarCollapse();
      });
    });

    // Export hàm toàn cục để có thể gọi từ bất kỳ đâu nếu cần
    window.toggleSidebarCollapse = toggleSidebarCollapse;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup);
  } else {
    setup();
  }
})();
