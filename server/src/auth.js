import jwt from 'jsonwebtoken';
import { supabase } from './supabase.js';
import { authenticateLDAP } from './ldap.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

export const loginUser = async (username, password) => {
  try {
    const ldapUser = await authenticateLDAP(username, password);

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const token = jwt.sign(
      {
        userId: ldapUser.id,
        username: ldapUser.username,
        email: ldapUser.email
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const { data: session, error } = await supabase
      .from('user_sessions')
      .insert({
        user_id: ldapUser.id,
        username: ldapUser.username,
        email: ldapUser.email,
        token: token,
        expires_at: expiresAt.toISOString(),
        is_active: true
      })
      .select()
      .single();

    if (error) throw error;

    return {
      user: {
        id: ldapUser.id,
        username: ldapUser.username,
        email: ldapUser.email,
        token: token
      },
      token: token,
      session: session
    };
  } catch (error) {
    throw new Error(`Login failed: ${error.message}`);
  }
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

export const logoutUser = async (token) => {
  try {
    const decoded = verifyToken(token);

    await supabase
      .from('user_sessions')
      .update({ is_active: false })
      .eq('user_id', decoded.userId);

    return true;
  } catch (error) {
    throw new Error(`Logout failed: ${error.message}`);
  }
};

export const tokenMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    req.token = token;
    next();
  } catch (error) {
    return res.status(401).json({ error: error.message });
  }
};
