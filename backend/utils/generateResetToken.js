const jwt = require("jsonwebtoken");
const crypto = require("crypto");

exports.createResetToken = (userId) => {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const token = jwt.sign({ userId, rawToken }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  return { token, tokenHash };
};
