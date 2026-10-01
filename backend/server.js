const express = require('express');
const path = require('path');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const internRoutes = require('./routes/intern.routes');
const adminRoutes = require('./routes/admin.routes');
const db = require('./config/db');

const app = express();

// 1. Cấu hình CORS cho phép Frontend truy cập từ bất kỳ origin nào
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 2. Middleware phân tích dữ liệu JSON & URL-encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Phục vụ tĩnh thư mục uploads chứa file tài liệu (PDF, Ảnh...) và giao diện Frontend
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, '../frontend')));

// 4. Đăng ký các API Routes theo hợp đồng
app.use('/api/auth', authRoutes);
app.post('/api/login', require('./controllers/auth.controller').login); // Alias cho frontend
app.use('/api/interns', internRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'HR Portal Backend is running smoothly!' });
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
  } catch (err) {
    console.warn('⚠️ Kiểm tra migration DB:', err.message);
  }
}
ensureAdminDBSchema();

// Khởi chạy server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
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
