const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const internRoutes = require('./routes/intern.routes');

const app = express();

// 1. Cấu hình CORS cho phép Frontend truy cập từ bất kỳ origin nào
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 2. Middleware phân tích dữ liệu JSON
app.use(express.json());

// 3. Đăng ký các API Routes theo hợp đồng
app.use('/api/auth', authRoutes);
app.post('/api/login', require('./controllers/auth.controller').login); // Alias cho frontend
app.use('/api/interns', internRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'HR Portal Backend is running smoothly!' });
});

// Khởi chạy server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🚀 HR Portal Backend đang chạy tại: http://localhost:${PORT}`);
  console.log(`📡 Endpoints:`);
  console.log(`   - POST  /api/auth/login`);
  console.log(`   - GET   /api/interns`);
  console.log(`   - POST  /api/interns`);
  console.log(`   - PUT   /api/interns/:id`);
  console.log(`   - GET   /api/interns/:id/documents`);
  console.log(`   - PATCH /api/interns/:id/documents/status`);
  console.log(`===============================================`);
});
