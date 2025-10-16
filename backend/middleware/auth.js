const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  console.log("Auth header:", authHeader); 
  
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded);
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }, 
      select: { 
        id: true, 
        email: true, 
        role: true, 
        firstName: true, 
        lastName: true,
        status: true 
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    if (user.status !== 'ACTIVE') {
      return res.status(403).json({ error: 'Account not active' });
    }

  
    req.user = {
      ...user,
      userId: user.id
    };
    
    next();
  } catch (err) {
    console.error("Auth error:", err);
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
};


exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden. Insufficient role.' });
    }
    next();
  };
};
