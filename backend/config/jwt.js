const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET && process.env.NODE_ENV !== 'test') {
  console.error('❌ FATAL: Biến môi trường JWT_SECRET không được thiết lập! Server dừng để đảm bảo an toàn.');
  process.exit(1);
}

module.exports = {
  JWT_SECRET: JWT_SECRET || 'codegym_test_fallback_secret_must_be_set_in_env'
};
