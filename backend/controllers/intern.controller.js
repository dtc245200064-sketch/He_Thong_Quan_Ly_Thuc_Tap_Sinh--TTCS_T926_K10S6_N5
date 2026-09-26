// ==============================================================================
// INTERN CONTROLLER (QUẢN LÝ THỰC TẬP SINH & HỒ SƠ)
// ==============================================================================

// TODO: [Backend] Import Model cơ sở dữ liệu tại đây
// Ví dụ: const Intern = require('../models/Intern');
// Ví dụ: const Document = require('../models/Document');

// 1. GET /api/interns (Lấy danh sách, tìm kiếm & lọc)
exports.getInterns = async (req, res) => {
  try {
    const { search, school, dept } = req.query;

    // TODO: [Backend] Viết câu lệnh truy vấn tìm kiếm và lọc danh sách thực tập sinh từ Database
    // Ví dụ SQL: SELECT * FROM interns WHERE name LIKE ... AND school = ...
    // Ví dụ Mongoose: await Intern.find({ ... })

    return res.status(501).json({
      success: false,
      message: "Chức năng lấy danh sách thực tập sinh đang chờ Backend kết nối Database!",
      receivedQuery: {
        search: search || null,
        school: school || null,
        dept: dept || null
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi máy chủ",
      error: error.message
    });
  }
};

// 2. POST /api/interns (Thêm mới thực tập sinh)
exports.createIntern = async (req, res) => {
  try {
    const { name, major, school, dept, mentor, startDate, endDate, status } = req.body;

    // TODO: [Backend] 1. Kiểm tra validation các trường bắt buộc (name, major, school, dept, mentor,...)
    // TODO: [Backend] 2. Viết câu lệnh INSERT / lưu bản ghi thực tập sinh mới vào Database
    // Ví dụ: const newIntern = await Intern.create({ name, major, school, dept, mentor, ... });

    return res.status(501).json({
      success: false,
      message: "Chức năng thêm thực tập sinh đang chờ Backend kết nối Database!",
      receivedData: { name, major, school, dept, mentor, startDate, endDate, status }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi máy chủ",
      error: error.message
    });
  }
};

// 3. PUT /api/interns/:id (Chỉnh sửa thông tin thực tập sinh)
exports.updateIntern = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // TODO: [Backend] Viết câu lệnh UPDATE dữ liệu thực tập sinh theo id trong Database
    // Ví dụ: await Intern.findByIdAndUpdate(id, updateData, { new: true });

    return res.status(501).json({
      success: false,
      message: "Chức năng cập nhật hồ sơ đang chờ Backend kết nối Database!",
      internId: id,
      receivedUpdateData: updateData
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi máy chủ",
      error: error.message
    });
  }
};

// 4. GET /api/interns/:id/documents (Xem chi tiết hồ sơ & tài liệu đính kèm)
exports.getInternDocuments = async (req, res) => {
  try {
    const { id } = req.params;

    // TODO: [Backend] Viết câu lệnh truy vấn lấy thông tin hồ sơ và danh sách file tài liệu đính kèm (CV, Bảng điểm) theo id
    // Ví dụ: const docs = await Document.find({ internId: id });

    return res.status(501).json({
      success: false,
      message: "Chức năng xem tài liệu hồ sơ đang chờ Backend kết nối Database!",
      internId: id
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi máy chủ",
      error: error.message
    });
  }
};

// 5. PATCH /api/interns/:id/documents/status (Duyệt hoặc từ chối tài liệu)
exports.updateDocumentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body; // status: "approved" | "rejected"

    // TODO: [Backend] Cập nhật trạng thái duyệt tài liệu (approved / rejected) và ghi chú vào Database
    // Ví dụ: await Document.findOneAndUpdate({ internId: id }, { reviewStatus: status, note });

    return res.status(501).json({
      success: false,
      message: "Chức năng duyệt hồ sơ đang chờ Backend kết nối Database!",
      internId: id,
      reviewStatus: status || null,
      note: note || ""
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi máy chủ",
      error: error.message
    });
  }
};
