const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const ApiError = require("../utils/ApiError");
const emailService = require("../services/emailService");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.createUser = async (req, res, next) => {
  try {
    const { firstName, lastName, email, phone, password, role, providerData } =
      req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !password || !role) {
      throw new ApiError(
        400,
        "All fields are required",
        "Missing required fields",
        "MISSING_FIELDS"
      );
    }

    // Check for existing user
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: email.toLowerCase() }, { phone: phone }],
      },
    });

    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        throw new ApiError(
          409,
          "Email already exists",
          "An account with this email already exists",
          "EMAIL_EXISTS"
        );
      }
      if (existingUser.phone === phone) {
        throw new ApiError(
          409,
          "Phone number already exists",
          "An account with this phone number already exists",
          "PHONE_EXISTS"
        );
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
            ...providerData,
            country: providerData.country || "South Africa",
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

    // Send confirmation email if provider was created
    if (result.provider) {
      try {
        await emailService.sendApplicationSubmitted({
          ...result.provider,
          user: result.user,
        });
        console.log(
          "✅ Application confirmation email sent to:",
          result.user.email
        );
      } catch (emailError) {
        console.error("⚠️ Failed to send application email:", emailError);
        // Don't fail the signup if email fails
      }
    }

    res.status(201).json({
      token,
      user: {
        id: result.user.id,
        email: result.user.email,
        role: result.user.role,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        phone: result.user.phone,
        providerId: result.provider?.id || null,
        providerStatus: result.provider?.status || null,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ApiError(
        400,
        "Email and password are required",
        "Missing credentials",
        "MISSING_CREDENTIALS"
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { Provider: true },
    });

    if (!user) {
      throw new ApiError(
        401,
        "Invalid credentials",
        "Email or password is incorrect",
        "INVALID_CREDENTIALS"
      );
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new ApiError(
        401,
        "Invalid credentials",
        "Email or password is incorrect",
        "INVALID_CREDENTIALS"
      );
    }

    if (["SUSPENDED", "DELETED"].includes(user.status)) {
      throw new ApiError(
        403,
        "Account suspended",
        "Your account has been suspended",
        "ACCOUNT_SUSPENDED"
      );
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
        providerId: user.Provider?.id || null,
        providerStatus: user.Provider?.status || null,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;



    if (!email) {
      throw new ApiError(
        400,
        "Email is required",
        "Please provide an email address",
        "MISSING_EMAIL"
      );
    }

    console.log("email", email);

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    console.log("user", user);
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
    next(err);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      throw new ApiError(
        400,
        "Token and new password are required",
        "Missing required fields",
        "MISSING_FIELDS"
      );
    }

    // Verify JWT
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      throw new ApiError(
        400,
        "Invalid or expired reset token",
        "The reset link is invalid or has expired",
        "INVALID_TOKEN"
      );
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
      throw new ApiError(
        400,
        "Invalid or expired reset token",
        "The reset link is invalid or has expired",
        "INVALID_TOKEN"
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user
    const user = await prisma.user.update({
      where: { id: decoded.userId },
      data: { password: hashedPassword },
    });

    // Delete used token
    await prisma.passwordReset.delete({ where: { id: resetRecord.id } });

    await emailService.sendPasswordResetSuccessEmail(user);

    res.status(200).json({
      message: "Password reset successful. Please login again.",
    });
  } catch (err) {
    next(err);
  }
};

exports.googleOAuth = async (req, res, next) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      throw new ApiError(
        400,
        "Credential is required",
        "Google credential is missing",
        "MISSING_CREDENTIAL"
      );
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
      include: { Provider: true },
    });

    if (!user) {
      // Create new user with Google OAuth
      const randomPassword = await bcrypt.hash(Math.random().toString(36), 10);

      user = await prisma.user.create({
        data: {
          email,
          firstName: given_name || "User",
          lastName: family_name || "",
          password: randomPassword,
          phone: "",
          role: "CUSTOMER",
          googleId,
          profilePicture: picture,
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
      user: {
        id: userWithoutPassword.id,
        email: userWithoutPassword.email,
        role: userWithoutPassword.role,
        firstName: userWithoutPassword.firstName,
        lastName: userWithoutPassword.lastName,
        phone: userWithoutPassword.phone,
        providerId: userWithoutPassword.Provider?.id || null,
        providerStatus: userWithoutPassword.Provider?.status || null,
      },
    });
  } catch (err) {
    next(err);
  }
};
