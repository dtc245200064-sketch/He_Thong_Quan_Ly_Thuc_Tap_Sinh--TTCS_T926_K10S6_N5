const mysql = require('mysql2/promise');

// Cấu hình kết nối cơ sở dữ liệu MySQL (XAMPP mặc định)
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'codegym',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Kiểm tra kết nối khi khởi động
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Kết nối MySQL Database (codegym) thành công!');
    connection.release();
  } catch (error) {
    console.error('❌ Lỗi kết nối MySQL Database:', error.message);
  }
})();

module.exports = pool;
