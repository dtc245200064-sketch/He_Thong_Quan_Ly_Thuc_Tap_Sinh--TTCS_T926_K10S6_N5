const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Đảm bảo thư mục uploads tồn tại
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Cấu hình lưu trữ file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const baseName = path.basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .substring(0, 50);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e4);
    cb(null, `${baseName}-${uniqueSuffix}${ext}`);
  }
});

// Danh sách định dạng tệp và đuôi cho phép
const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.png', '.jpg', '.jpeg'];

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  
  // Chặn ngay các extension nguy hiểm
  const dangerousExts = ['.exe', '.bat', '.cmd', '.sh', '.php', '.phtml', '.html', '.htm', '.js', '.vbs', '.svg'];
  if (dangerousExts.includes(ext) || file.originalname.toLowerCase().includes('.exe.')) {
    return cb(new Error('Phát hiện tệp tin nguy hiểm! Hệ thống từ chối xử lý.'), false);
  }

  if (ALLOWED_EXTENSIONS.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Định dạng tệp ${ext} không được hỗ trợ! Chỉ chấp nhận PDF, DOC, DOCX, PNG, JPG.`), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // Giới hạn tối đa 10 MB
  },
  fileFilter: fileFilter
});

// Middleware kiểm tra Magic Bytes sau khi multer lưu file tạm
const validateMagicBytes = (req, res, next) => {
  if (!req.file) return next();

  const filePath = req.file.path;
  const ext = path.extname(req.file.originalname).toLowerCase();

  try {
    const stats = fs.statSync(filePath);
    if (stats.size === 0) {
      fs.unlinkSync(filePath);
      return res.status(400).json({ success: false, message: 'Tệp tin rỗng (0 bytes) không được chấp nhận!' });
    }

    const buffer = Buffer.alloc(8);
    const fd = fs.openSync(filePath, 'r');
    fs.readSync(fd, buffer, 0, 8, 0);
    fs.closeSync(fd);

    let isValid = false;
    if (ext === '.pdf') {
      isValid = buffer.slice(0, 4).toString('ascii') === '%PDF';
    } else if (ext === '.png') {
      isValid = buffer.slice(0, 4).toString('hex') === '89504e47';
    } else if (ext === '.jpg' || ext === '.jpeg') {
      isValid = buffer.slice(0, 3).toString('hex') === 'ffd8ff';
    } else if (ext === '.docx') {
      // DOCX là tệp nén ZIP bắt đầu bằng PK (0x50 0x4B 0x03 0x04)
      isValid = buffer.slice(0, 4).toString('hex') === '504b0304';
    } else if (ext === '.doc') {
      // DOC là định dạng OLE2 Compound Document
      isValid = buffer.slice(0, 4).toString('hex') === 'd0cf11e0';
    } else {
      isValid = false;
    }

    if (!isValid) {
      fs.unlinkSync(filePath);
      return res.status(400).json({
        success: false,
        message: 'Nội dung tệp không khớp với định dạng mở rộng (Phát hiện giả mạo phần mở rộng tệp)!'
      });
    }

    next();
  } catch (err) {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    return res.status(400).json({ success: false, message: 'Lỗi kiểm tra tính toàn vẹn của tệp tin!' });
  }
};

module.exports = {
  upload,
  validateMagicBytes
};
