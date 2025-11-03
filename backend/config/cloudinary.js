const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Create storage engine for Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const category = req.body.category || 'other';
    
    // Determine folder based on category
    let folder = 'ras-logistics';
    if (category) {
      folder += `/${category.toLowerCase()}`;
    }

    // Determine allowed formats based on file type
    const isImage = file.mimetype.startsWith('image/');
    const allowedFormats = isImage 
      ? ['jpg', 'jpeg', 'png', 'webp', 'gif']
      : ['pdf'];

    return {
      folder: folder,
      allowed_formats: allowedFormats,
      resource_type: 'auto',
      // Generate unique filename
      public_id: `${Date.now()}-${Math.round(Math.random() * 1e9)}`,
    };
  },
});

module.exports = { cloudinary, storage };