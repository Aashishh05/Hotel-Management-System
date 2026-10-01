import multer from "multer";

export const MAX_ROOM_IMAGES = 10;
export const MAX_FILE_SIZE_MB = 5;

const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: { fileSize: MAX_FILE_SIZE_MB * 1024 * 1024, files: MAX_ROOM_IMAGES },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("only image files are allowed"), false);
    }
  },
});

// Multer signals limits by calling next(err) from inside the stream. Without an
// explicit handler the request can fall through and save a record with no
// images while still returning success, so failures are surfaced as 400s.
export const handleUploadErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_UNEXPECTED_FILE" || err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        message: `You can upload at most ${MAX_ROOM_IMAGES} images per room`,
      });
    }

    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: `Each image must be under ${MAX_FILE_SIZE_MB}MB`,
      });
    }

    return res.status(400).json({ success: false, message: err.message });
  }

  if (err) {
    return res.status(400).json({ success: false, message: err.message });
  }

  next();
};

export default upload;