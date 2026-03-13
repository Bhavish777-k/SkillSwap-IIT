import jwt from 'jsonwebtoken';

/**
 * Generate JWT token for user
 */
export const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

/**
 * Send token response with cookie
 */
export const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  // Generate token
  const token = generateToken(user._id);

  // Remove password from output
  const userObject = user.toObject();
  delete userObject.password;

  res.status(statusCode).json({
    success: true,
    message,
    token,
    user: userObject
  });
};
