import { Router, Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { findUserByEmail, createUser } from '../services/userService'; // Assuming these exist
import { User } from '../models/User'; // Assuming this exists

const router = Router();

// You should store these in environment variables
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

router.post('/google', async (req: Request, res: Response) => {
  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({ message: 'ID token is required.' });
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
    });

    const payload = ticket.getPayload();

    if (!payload) {
      return res.status(401).json({ message: 'Invalid Google token.' });
    }

    const { email, given_name, family_name, picture } = payload;

    if (!email) {
      return res.status(400).json({ message: 'Email not available from Google account.' });
    }

    let user: User | null = await findUserByEmail(email);

    if (!user) {
      // Create a new user
      const newUser = {
        username: email, // Using email as username for simplicity
        email,
        firstName: given_name,
        lastName: family_name,
        source: 'google',
      };
      user = await createUser(newUser);
    }

    if (!user) {
        return res.status(500).json({ message: 'Failed to create or find user.' });
    }

    // User exists or was created, now create a session token (JWT)
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1d' });

    res.status(200).json({ token, username: user.username });

  } catch (error) {
    console.error('Google sign-in error:', error);
    res.status(500).json({ message: 'Internal server error during Google authentication.' });
  }
});

export default router;
