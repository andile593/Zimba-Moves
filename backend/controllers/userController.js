const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Signup
exports.createUser = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, role } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    console.log(hashedPassword);


    const user = await prisma.user.create({
      data: { firstName, lastName, email, phone, password: hashedPassword, role }
    });

    res.status(201).json({ id: user.id, email: user.email, role: user.role });
  } catch (err) {
    res.status(400).json({ error: 'Failed to create user', details: err.message });
  }
};

exports.createProvider = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, role, providerData } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { firstName, lastName, email, phone, password: hashedPassword, role }
    });

    // If provider role and provider data exists, create provider application
    if (role === 'PROVIDER' && providerData) {
      await prisma.provider.create({
        data: {
          userId: user.id,
          status: 'PENDING', // Always start as PENDING
          businessName: providerData.businessName,
          businessType: providerData.businessType,
          idNumber: providerData.idNumber,
          taxNumber: providerData.taxNumber,
          address: providerData.address,
          city: providerData.city,
          region: providerData.region,
          country: providerData.country || 'South Africa',
          postalCode: providerData.postalCode,
          includeHelpers: providerData.includeHelpers || false
        }
      });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        status: user.status
      }
    });
  } catch (err) {
    res.status(400).json({ error: 'Failed to create user', details: err.message });
  }
}

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;     


    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { userId: user.id, role: user.role }, 
      process.env.JWT_SECRET,
      { expiresIn: '24h' } 
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        status: user.status
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Login failed', details: err.message });
  }
};


