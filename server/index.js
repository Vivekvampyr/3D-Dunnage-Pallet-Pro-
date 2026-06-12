import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import bcrypt from 'bcryptjs';
import { readDb, writeDb } from './database/dbHelper.js';
import authRoutes from './routes/auth.js';
import inquiryRoutes from './routes/inquiry.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Main API Routes
app.use('/api/auth', authRoutes);
app.use('/api/inquiry', inquiryRoutes);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Seed default admin user if database has zero users
async function seedAdminUser() {
  try {
    const db = await readDb();
    if (!db.users || db.users.length === 0) {
      console.log('No users found in database. Seeding default admin account...');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password', salt);
      
      const adminUser = {
        id: 'admin-default-id',
        email: 'admin@company.com',
        password: hashedPassword,
        createdAt: new Date().toISOString()
      };
      
      db.users = [adminUser];
      await writeDb(db);
      console.log('Seeded default admin user: admin@company.com / password');
    }
  } catch (error) {
    console.error('Error seeding admin user:', error);
  }
}

app.listen(PORT, async () => {
  console.log(`Dunnage Pro API Server is running on port ${PORT}`);
  await seedAdminUser();
});
