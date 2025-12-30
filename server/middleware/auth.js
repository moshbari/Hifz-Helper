import { supabase, isSupabaseConfigured } from '../services/supabase.js';

/**
 * Middleware to verify JWT token from Supabase
 */
export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.split(' ')[1];

    if (!isSupabaseConfigured()) {
      // In development without Supabase, allow requests with a mock user
      req.user = { id: 'dev-user', email: 'dev@test.com', role: 'student' };
      return next();
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Authentication error' });
  }
}

/**
 * Optional auth - attaches user if token present, continues if not
 */
export async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];

    if (!isSupabaseConfigured()) {
      req.user = { id: 'dev-user', email: 'dev@test.com', role: 'student' };
      return next();
    }

    const { data: { user } } = await supabase.auth.getUser(token);
    req.user = user || null;
    next();
  } catch (error) {
    next();
  }
}

/**
 * Role-based access control
 */
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userRole = req.user.user_metadata?.role || 'student';
    
    if (!roles.includes(userRole)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
}
