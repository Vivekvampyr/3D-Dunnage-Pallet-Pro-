import express from 'express';
import { readDb, writeDb } from '../database/dbHelper.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Submit inquiry Route
router.post('/', async (req, res) => {
  const { name, email, company, phone, message } = req.body;

  if (!name || !email) {
    return res.status(400).json({ message: 'Name and email are required fields.' });
  }

  try {
    const db = await readDb();

    const newInquiry = {
      id: Date.now().toString(),
      name,
      email,
      company: company || '',
      phone: phone || '',
      message: message || '',
      createdAt: new Date().toISOString()
    };

    db.inquiries.push(newInquiry);
    await writeDb(db);

    res.status(201).json({ message: 'Inquiry submitted successfully.', inquiry: newInquiry });
  } catch (error) {
    console.error('Inquiry submission error:', error);
    res.status(500).json({ message: 'Server error during inquiry submission.' });
  }
});

// Fetch all inquiries Route (Protected for authenticated users)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const db = await readDb();
    res.json(db.inquiries);
  } catch (error) {
    console.error('Fetch inquiries error:', error);
    res.status(500).json({ message: 'Server error fetching inquiries.' });
  }
});

export default router;
