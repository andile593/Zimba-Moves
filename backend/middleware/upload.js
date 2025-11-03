const multer = require("multer");
const { storage } = require("../config/cloudinary");

// File filter for validation
const fileFilter = (req, file, cb) => {
  const allowedImageTypes = /jpeg|jpg|jfif|png|gif|webp/;
  const allowedDocTypes = /pdf|doc|docx/;

  const extname = file.originalname.split('.').pop().toLowerCase();
  const mimetype = file.mimetype;

  // Check if it's an image or document
  const isImage =
    allowedImageTypes.test(extname) && mimetype.startsWith("image/");
  const isDoc =
    allowedDocTypes.test(extname) &&
    (mimetype === "application/pdf" ||
      mimetype.includes("document") ||
      mimetype.includes("word"));

  if (isImage || isDoc) {
    console.log("✓ File accepted:", file.originalname);
    cb(null, true);
  } else {
    console.log(
      "✗ File rejected:",
      file.originalname,
      "- Extension:",
      extname,
      "- MIME:",
      mimetype
    );
    cb(
      new Error(
        "Invalid file type. Only images (JPEG, PNG, GIF, WEBP, JFIF) and documents (PDF, DOC, DOCX) are allowed."
      )
    );
  }
};

const upload = multer({
  storage: storage, // Use Cloudinary storage
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Error handler
upload.handleError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        error: "File too large",
        details: "File size must be less than 5MB",
      });
    }
    return res.status(400).json({
      error: "Upload error",
      details: err.message,
    });
  }

  if (err) {
    return res.status(400).json({
      error: "Invalid file",
      details: err.message,
    });
  }

  next();
};

module.exports = upload;