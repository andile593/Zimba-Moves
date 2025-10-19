const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.createUser = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, role, providerData } =
      req.body;

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: email.toLowerCase() }, { phone: phone }],
      },
    });

    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        return res.status(409).json({
          error: "Email already exists",
          details: "An account with this email address already exists",
        });
      }
      if (existingUser.phone === phone) {
        return res.status(409).json({
          error: "Phone number already exists",
          details: "An account with this phone number already exists",
        });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          firstName,
          lastName,
          email: email.toLowerCase(),
          phone,
          password: hashedPassword,
          role,
        },
      });

      let providerRecord = null;

      if (role === "PROVIDER" && providerData) {
        providerRecord = await tx.provider.create({
          data: {
            userId: user.id,
            status: "PENDING",
            idNumber: providerData.idNumber || null,
            address: providerData.address || null,
            city: providerData.city || null,
            region: providerData.region || null,
            country: providerData.country || "South Africa",
            postalCode: providerData.postalCode || null,
            includeHelpers: providerData.includeHelpers || false,
          },
        });
      }

      return { user, provider: providerRecord };
    });

    const token = jwt.sign(
      { userId: result.user.id, role: result.user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
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
        providerId: result.provider?.id || null,
      },
    });
  } catch (err) {
    console.error("Signup error details:", {
      message: err.message,
      code: err.code,
      meta: err.meta,
      stack: err.stack,
    });

    // Handle specific Prisma errors
    if (err.code === "P2002") {
      // Unique constraint violation
      const field = err.meta?.target?.[0] || "field";
      return res.status(409).json({
        error: "User already exists",
        details: `An account with this ${field} already exists`,
      });
    }

    if (err.code === "P2003") {
      // Foreign key constraint violation
      return res.status(400).json({
        error: "Invalid data",
        details: "Please check your input data",
      });
    }

    res.status(500).json({
      error: "Failed to create user",
      details:
        process.env.NODE_ENV === "development"
          ? err.message
          : "An error occurred during signup",
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        Provider: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        error: "Invalid credentials",
        details: "Email or password is incorrect",
      });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({
        error: "Invalid credentials",
        details: "Email or password is incorrect",
      });
    }

    // Check if user account is active
    if (user.status === "SUSPENDED" || user.status === "DELETED") {
      return res.status(403).json({
        error: "Account suspended",
        details: "Your account has been suspended. Please contact support.",
      });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
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
        providerStatus: user.Provider?.status || null,
        providerId: user.Provider?.id || null,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({
      error: "Login failed",
      details:
        process.env.NODE_ENV === "development"
          ? err.message
          : "An error occurred during login",
    });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return res
        .status(200)
        .json({ message: "If that email exists, a reset link was sent." });
    }
    // Generate reset token
    const { token, tokenHash } =
      require("../utils/generateResetToken").createResetToken(user.id);

    await prisma.passwordReset.deleteMany({ where: { userId: user.id } });

    await prisma.passwordReset.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    await emailService.sendPasswordResetEmail(user, resetUrl);

    res.status(200).json({
      message: "If that email exists, a password reset link has been sent.",
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ error: "Failed to send password reset link" });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res
        .status(400)
        .json({ error: "Token and new password are required" });
    }

    // Verify JWT
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    const crypto = require("crypto");
    const tokenHash = crypto
      .createHash("sha256")
      .update(decoded.rawToken)
      .digest("hex");

    // Find matching reset token
    const resetRecord = await prisma.passwordReset.findFirst({
      where: {
        userId: decoded.userId,
        tokenHash,
        expiresAt: { gt: new Date() },
      },
    });

    if (!resetRecord) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    // Hash new password
    const hashedPassword = await require("bcryptjs").hash(newPassword, 10);

    // Update user
    await prisma.user.update({
      where: { id: decoded.userId },
      data: { password: hashedPassword },
    });

    // Delete used token
    await prisma.passwordReset.delete({ where: { id: resetRecord.id } });
    await emailService.sendPasswordResetSuccessEmail(user);

    res
      .status(200)
      .json({ message: "Password reset successful. Please login again." });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ error: "Failed to reset password" });
  }
};

exports.googleOAuth = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ error: "Credential is required" });
    }

    // Verify the Google token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, given_name, family_name, sub: googleId, picture } = payload;

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { email },
      include: { Provider: true, Customer: true },
    });

    if (!user) {
      // Create new user with Google OAuth
      const randomPassword = await bcrypt.hash(Math.random().toString(36), 10);

      user = await prisma.user.create({
        data: {
          email,
          firstName: given_name || "User",
          lastName: family_name || "",
          password: randomPassword, // They won't use this password
          phone: "", // Optional: prompt user to add phone later
          role: "CUSTOMER", // Default to customer
          googleId, // Store Google ID for future logins
          profilePicture: picture, // Optional: store profile picture
        },
      });

      // Create customer profile
      await prisma.customer.create({
        data: {
          userId: user.id,
        },
      });
    } else if (!user.googleId) {
      // User exists but hasn't linked Google account yet
      await prisma.user.update({
        where: { id: user.id },
        data: {
          googleId,
          profilePicture: picture,
        },
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Return user data without password
    const { password, ...userWithoutPassword } = user;

    res.json({
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Google auth error:", error);
    res.status(401).json({ error: "Invalid Google token" });
  }
};
