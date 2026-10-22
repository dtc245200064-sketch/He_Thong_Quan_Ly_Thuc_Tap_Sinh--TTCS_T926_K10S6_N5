# 💻 Hướng dẫn Tích hợp API Thông báo cho Phía Frontend

> **Tài liệu bàn giao API:** Ma Công Đức (`dtc245200136@ictu.edu.vn`)  
> **Dành cho:** Nhóm Frontend (Intern Portal & Mentor Portal)

---

## 1. Lấy danh sách thông báo & hiển thị badge số lượng

```javascript
// Gọi API lấy danh sách thông báo
async function fetchMyNotifications() {
  const token = localStorage.getItem('token');
  const response = await fetch('/api/notifications', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const result = await response.json();
  
  if (result.success) {
    const unreadCount = result.data.filter(n => !n.is_read).length;
    updateBadge(unreadCount);
    renderNotificationList(result.data);
  }
}
```

---

## 2. Đánh dấu đã đọc tất cả

```javascript
async function markAllNotificationsAsRead() {
  const token = localStorage.getItem('token');
  const response = await fetch('/api/notifications/read-all', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const result = await response.json();
  if (result.success) {
    console.log('Đã cập nhật toàn bộ thông báo thành đã đọc');
    fetchMyNotifications();
  }
}
```

---

## 3. Đánh dấu đã đọc 1 thông báo khi click

```javascript
async function markOneNotificationAsRead(id, link) {
  const token = localStorage.getItem('token');
  await fetch(`/api/notifications/${id}/read`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (link) {
    window.location.href = link;
  }
}
```
