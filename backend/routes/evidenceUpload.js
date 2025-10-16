const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { authenticate, authorize } = require('../middleware/auth');

// Upload evidence for a complaint
router.post('/:id/evidence', authenticate, authorize('CUSTOMER'), upload.single('file'), async (req, res) => {
  try {
    const complaintId = req.params.id;

    // Ensure complaint exists
    const complaint = await prisma.complaint.findUnique({ where: { id: complaintId } });
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });

    // Save file metadata in DB
    const file = await prisma.file.create({
      data: {
        url: req.file.path, // for now, local path
        type: req.file.mimetype.startsWith('image/') ? 'IMAGE' : 'DOCUMENT',
        complaintId
      }
    });

    res.status(201).json({ message: 'File uploaded successfully', file });
  } catch (err) {
    res.status(400).json({ error: 'Failed to upload file', details: err.message });
  }
});
