import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });

export const config = {
  api: {
    bodyParser: false, // Needed for Multer
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  upload.single('file')(req, {}, async (err) => {
    if (err) return res.status(500).json({ error: 'File upload failed' });

    console.log('Uploaded file:', {
      fileSize: req.file?.size,
      mimeType: req.file?.mimetype,
    });

    res.json({
      message: 'File uploaded successfully!',
      fileType: req.file.mimetype,
      size: req.file.size,
    });
  });
}