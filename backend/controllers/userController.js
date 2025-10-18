const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.createUser = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, role, providerData } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        details: 'firstName, lastName, email, and password are required'
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ 
      where: { email: email.toLowerCase() } 
    });
    
    if (existingUser) {
      return res.status(409).json({ 
        error: 'User already exists',
        details: 'An account with this email address already exists'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    console.log('Creating user with role:', role);

    // Use transaction to ensure both user and provider are created together
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: { 
          firstName, 
          lastName, 
          email: email.toLowerCase(), 
          phone, 
          password: hashedPassword, 
          role 
        }
      });

      let providerRecord = null;

      // If provider role and provider data exists, create provider application
      if (role === 'PROVIDER' && providerData) {
        console.log('Creating provider application:', providerData);
        
        providerRecord = await tx.provider.create({
          data: {
            userId: user.id,
            status: 'PENDING',
            idNumber: providerData.idNumber,
            address: providerData.address,
            city: providerData.city,
            region: providerData.region || null,
            country: providerData.country || 'South Africa',
            postalCode: providerData.postalCode || null,
            includeHelpers: providerData.includeHelpers || false,
          }
        });
        console.log('Provider application created successfully');
      }

      return { user, provider: providerRecord };
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: result.user.id, role: result.user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: {
        id: result.user.id,
        email: result.user.email,
        role: result.user.role,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        phone: result.user.phone,
        status: result.user.status,
        providerStatus: result.provider?.status || null,
        providerId: result.provider?.id || null
      }
    });
  } catch (err) {
    console.error('Signup error:', err);

    // Handle specific Prisma errors
    if (err.code === 'P2002') {
      // Unique constraint violation
      const field = err.meta?.target?.[0] || 'field';
      return res.status(409).json({ 
        error: 'User already exists',
        details: `An account with this ${field} already exists`
      });
    }

    res.status(500).json({ 
      error: 'Failed to create user', 
      details: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred during signup'
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Missing credentials',
        details: 'Email and password are required'
      });
    }

    // Find user and include provider data if they're a provider
    const user = await prisma.user.findUnique({ 
      where: { email: email.toLowerCase() },
      include: {
        provider: true
      }
    });
    
    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid credentials',
        details: 'Email or password is incorrect'
      });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ 
        error: 'Invalid credentials',
        details: 'Email or password is incorrect'
      });
    }

    // Check if user account is active
    if (user.status === 'SUSPENDED' || user.status === 'BANNED') {
      return res.status(403).json({ 
        error: 'Account suspended',
        details: 'Your account has been suspended. Please contact support.'
      });
    }

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
        status: user.status,
        providerStatus: user.provider?.status || null,
        providerId: user.provider?.id || null
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ 
      error: 'Login failed', 
      details: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred during login'
    });
  }
};