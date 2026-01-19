import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Account from '../models/Account.js';

const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/auth/google/callback'
);

/**
 * Google OAuth Authentication
 * Verifies Google token and returns JWT token for platform
 */
const googleAuthController = {
  /**
   * POST /api/auth/google/login
   * Verify Google ID token and create/update user
   */
  loginWithGoogle: async (req, res) => {
    try {
      const { token, credential } = req.body;

      if (!token && !credential) {
        return res.status(400).json({
          success: false,
          message: 'Missing Google token or credential'
        });
      }

      // Use either the token or credential from Google Sign-In button
      const idToken = token || credential;

      // Verify the Google token
      const ticket = await oauth2Client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID
      });

      const payload = ticket.getPayload();

      if (!payload) {
        return res.status(401).json({
          success: false,
          message: 'Invalid Google token'
        });
      }

      const googleId = payload.sub;
      const email = payload.email;
      const name = payload.name;
      const picture = payload.picture;

      // Check if user exists
      let user = await User.findOne({ 
        $or: [
          { googleId },
          { email }
        ]
      });

      let account = null;

      if (!user) {
        // Create new account for new user
        account = new Account({
          name: name || email.split('@')[0],
          email,
          plan: 'starter', // Default plan
          status: 'active',
          createdAt: new Date()
        });
        await account.save();

        // Create new user
        user = new User({
          email,
          name: name || 'User',
          googleId,
          picture,
          accountId: account._id,
          role: 'admin', // New users from Google signup are account admins
          status: 'active',
          emailVerified: true, // Google emails are verified
          createdAt: new Date()
        });
        await user.save();

        console.log('✅ New Google user created:', { userId: user._id, email, accountId: account._id });
      } else {
        // Update existing user with Google info if missing
        if (!user.googleId) {
          user.googleId = googleId;
        }
        if (!user.picture) {
          user.picture = picture;
        }
        user.lastLogin = new Date();
        await user.save();

        account = await Account.findById(user.accountId);
        console.log('✅ Google user logged in:', { userId: user._id, email });
      }

      // Generate JWT token for platform
      const platformToken = jwt.sign(
        {
          userId: user._id,
          email: user.email,
          accountId: user.accountId,
          role: user.role
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '30d' }
      );

      return res.status(200).json({
        success: true,
        message: 'Google authentication successful',
        token: platformToken,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          picture: user.picture,
          role: user.role,
          accountId: user.accountId,
          account: {
            id: account?._id,
            name: account?.name,
            plan: account?.plan
          }
        }
      });

    } catch (error) {
      console.error('Google auth error:', error);
      
      if (error.message.includes('Token used too late')) {
        return res.status(401).json({
          success: false,
          message: 'Google token expired'
        });
      }

      if (error.message.includes('Invalid signature')) {
        return res.status(401).json({
          success: false,
          message: 'Invalid Google token signature'
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Google authentication failed',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * POST /api/auth/google/link
   * Link Google account to existing user
   */
  linkGoogleAccount: async (req, res) => {
    try {
      const { token, credential } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      if (!token && !credential) {
        return res.status(400).json({
          success: false,
          message: 'Missing Google token or credential'
        });
      }

      const idToken = token || credential;

      // Verify the Google token
      const ticket = await oauth2Client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID
      });

      const payload = ticket.getPayload();

      if (!payload) {
        return res.status(401).json({
          success: false,
          message: 'Invalid Google token'
        });
      }

      // Check if this Google account is already linked to another user
      const existingUser = await User.findOne({ 
        googleId: payload.sub,
        _id: { $ne: userId }
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'This Google account is already linked to another user'
        });
      }

      // Update user with Google ID
      const user = await User.findByIdAndUpdate(
        userId,
        {
          googleId: payload.sub,
          picture: payload.picture || user.picture
        },
        { new: true }
      );

      return res.status(200).json({
        success: true,
        message: 'Google account linked successfully',
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          picture: user.picture,
          googleId: user.googleId
        }
      });

    } catch (error) {
      console.error('Link Google account error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to link Google account',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};

export default googleAuthController;
