const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');

const authRoutes = require('./routes/auth.routes');
const internRoutes = require('./routes/intern.routes');
const adminRoutes = require('./routes/admin.routes');
const programRoutes = require('./routes/program.routes');
const attendanceRoutes = require('./routes/attendance.routes');
const leaveRoutes = require('./routes/leave.routes');
const contractRoutes = require('./routes/contract.routes');
const taskRoutes = require('./routes/task.routes');
const reportRoutes = require('./routes/report.routes');
const evaluationRoutes = require('./routes/evaluation.routes');
const mentorRoutes = require('./routes/mentor.routes');
const notificationRoutes = require('./routes/notification.routes');
const integrationRoutes = require('./routes/integration.routes');
const scheduleRoutes = require('./routes/schedule.routes');
const departmentRoutes = require('./routes/department.routes');
const db = require('./config/db');
const { authenticate } = require('./middleware/auth');

const app = express();

// B08: Cấu hình Helmet bảo mật HTTP Headers
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// 1. Cấu hình CORS cho phép Frontend truy cập từ bất kỳ origin nào
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 2. Middleware phân tích dữ liệu JSON & URL-encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// B07: Phục vụ thư mục uploads có xác thực JWT (cho phép query param ?token=... hoặc Bearer header)
app.use('/uploads', authenticate, express.static(path.join(__dirname, 'uploads')));

// Phục vụ giao diện Frontend tĩnh
app.use(express.static(path.join(__dirname, '../frontend')));

// 3. Đăng ký các API Routes theo hợp đồng
app.use('/api/auth', authRoutes);
app.post('/api/login', require('./controllers/auth.controller').login); // Alias cho frontend
app.use('/api/interns', internRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/programs', programRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/evaluations', evaluationRoutes);
app.use('/api/mentors', mentorRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/integrations', integrationRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/departments', departmentRoutes);
app.get('/api/system-emails', authenticate, require('./controllers/intern.controller').getEmailHistory);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'HR Portal Backend is running smoothly with Sprint 1, 2, 3!' });
});

// B23: Xử lý 404 cho tất cả các endpoint /api không tồn tại
app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    code: 'NOT_FOUND',
    message: `Không tìm thấy endpoint API: ${req.method} ${req.originalUrl}`
  });
});

// B22: Global error handler (Bắt lỗi Multer LIMIT_FILE_SIZE và các lỗi khác thành JSON)
app.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      code: 'LIMIT_FILE_SIZE',
      message: 'Kích thước file vượt quá giới hạn tối đa (5MB)!'
    });
  }
  if (err.name === 'MulterError') {
    return res.status(400).json({
      success: false,
      code: err.code || 'MULTER_ERROR',
      message: `Lỗi tải file: ${err.message}`
    });
  }
  if (err.status === 400 || (err.message && (err.message.includes('Định dạng') || err.message.includes('nguy hiểm') || err.message.includes('tệp tin') || err.message.includes('hỗ trợ') || err.message.includes('File')))) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  console.error('Lỗi máy chủ:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Lỗi hệ thống nội bộ!'
  });
});

// Tự động kiểm tra và nâng cấp DB cho phân hệ Admin (Self-healing migration)
async function ensureAdminDBSchema() {
  try {
    const [cols] = await db.query("SHOW COLUMNS FROM users LIKE 'username'");
    if (cols.length === 0) {
      await db.query("ALTER TABLE users ADD COLUMN username VARCHAR(50) UNIQUE AFTER email");
      console.log('✅ Đã tự động thêm cột username vào bảng users');
    }
    const [statusCols] = await db.query("SHOW COLUMNS FROM users LIKE 'status'");
    if (statusCols.length === 0) {
      await db.query("ALTER TABLE users ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'active' AFTER role");
      console.log('✅ Đã tự động thêm cột status vào bảng users');
    }
    await db.query(`
      CREATE TABLE IF NOT EXISTS role_permissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        role VARCHAR(50) NOT NULL UNIQUE,
        permissions JSON NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Chạy migration Sprint 3
    try {
      const migrateSprint3 = require('./migrate_sprint3');
      await migrateSprint3();
    } catch (mErr) {}
  } catch (err) {
    console.warn('⚠️ Kiểm tra migration DB:', err.message);
  }
}

// B23: Khởi chạy tuần tự: đảm bảo DB schema sẵn sàng trước khi lắng nghe request
async function startServer() {
  await ensureAdminDBSchema();

  const PORT = process.env.PORT || 5000;
  const server = app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`🚀 HR & Admin Portal Backend đang chạy tại: http://localhost:${PORT}`);
    console.log(`📡 Endpoints:`);
    console.log(`   - POST  /api/auth/login`);
    console.log(`   - GET   /api/interns`);
    console.log(`   - GET   /api/admin/users`);
    console.log(`   - POST  /api/admin/users`);
    console.log(`   - GET   /api/admin/permissions`);
    console.log(`===============================================`);
  });

  return server;
}

startServer();

module.exports = app;
