const path = require('node:path');
const fs = require('node:fs');
const multer = require('multer');
const LoiApi = require('../utils/loiApi');

const uploadDir = path.resolve(__dirname, '../../uploads');
fs.mkdirSync(uploadDir, { recursive: true });
const taiAnh = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, callback) => callback(null, uploadDir),
    filename: (_req, file, callback) => callback(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${path.extname(file.originalname).toLowerCase()}`),
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => file.mimetype.startsWith('image/')
    ? callback(null, true) : callback(new LoiApi('Chi chap nhan tep anh', 422)),
});

module.exports = { taiAnh, uploadDir };
