const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const dbName = process.env.DB_NAME || 'codegym';

// Cấu hình kết nối cơ sở dữ liệu MySQL (XAMPP mặc định)
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: dbName,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true
});

// Kiểm tra kết nối khi khởi động
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log(`✅ Kết nối MySQL Database (${dbName}) thành công!`);
    connection.release();
  } catch (error) {
    console.error(`❌ Lỗi kết nối MySQL Database (${dbName}):`, error.message);
  }
})();

module.exports = pool;
