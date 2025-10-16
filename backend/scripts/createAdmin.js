const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    const hashedPassword = await bcrypt.hash('AdminPassword123!', 10);
    
    const admin = await prisma.user.create({
      data: {
        email: 'andilemhlanga16@gmail.com',
        phone: '+27732499844',
        password: hashedPassword,
        firstName: 'Andile',
        lastName: 'Mhlanga',
        role: 'ADMIN',
        status: 'ACTIVE'
      }
    });

    console.log('Admin user created successfully!');
    console.log('Email:', admin.email);
    console.log('Password: AdminPassword123!');
  } catch (error) {
    console.error('Error creating admin:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();