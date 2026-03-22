// middleware/auth.js — JWT Authentication & Authorization
import jwt from 'jsonwebtoken'
import { prisma } from '../index.js'

// Verify JWT token
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access token required' })
    }
    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { member: true },
    })
    if (!user) return res.status(401).json({ error: 'User not found' })
    if (user.status === 'SUSPENDED') return res.status(403).json({ error: 'Account suspended' })
    req.user = user
    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') return res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' })
    if (err.name === 'JsonWebTokenError') return res.status(401).json({ error: 'Invalid token' })
    next(err)
  }
}

// Optional auth — attaches user if token present, doesn't fail if missing
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1]
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      const user = await prisma.user.findUnique({ where: { id: decoded.userId }, include: { member: true } })
      if (user) req.user = user
    }
  } catch (_) { /* silent — no token is fine */ }
  next()
}

// Role-based authorization
export const authorize = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Authentication required' })
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: `Access denied. Required role: ${roles.join(' or ')}` })
  }
  next()
}

// Shorthand guards
export const adminOnly = authorize('ADMIN')
export const staffOnly = authorize('ADMIN', 'PASTOR', 'DEACON')
