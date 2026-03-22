// routes/auth.js — Authentication Routes
import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { body, validationResult } from 'express-validator'
import { prisma } from '../index.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

// ── Token Helpers ──
const generateTokens = (userId, role) => {
  const accessToken = jwt.sign({ userId, role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '15m' })
  const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' })
  return { accessToken, refreshToken }
}

// ── POST /api/auth/register ──
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('firstName').trim().notEmpty(),
  body('lastName').trim().notEmpty(),
], async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })

    const { email, password, firstName, lastName, phone, ministry } = req.body
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return res.status(409).json({ error: 'An account with this email already exists' })

    const hashed = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({
      data: {
        email,
        password: hashed,
        role: 'MEMBER',
        status: 'PENDING', // Requires admin approval
        member: { create: { firstName, lastName, phone, ministry, memberSince: new Date() } }
      },
      include: { member: true }
    })

    res.status(201).json({
      message: 'Registration successful! Your account is pending approval by the church admin.',
      user: { id: user.id, email: user.email, status: user.status, member: user.member }
    })
  } catch (err) { next(err) }
})

// ── POST /api/auth/login ──
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })

    const { email, password } = req.body
    const user = await prisma.user.findUnique({ where: { email }, include: { member: true } })
    if (!user) return res.status(401).json({ error: 'Invalid email or password' })

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return res.status(401).json({ error: 'Invalid email or password' })

    if (user.status === 'PENDING') return res.status(403).json({ error: 'Your account is pending approval. Please contact the church office.', code: 'PENDING_APPROVAL' })
    if (user.status === 'SUSPENDED') return res.status(403).json({ error: 'Your account has been suspended. Please contact the church office.', code: 'SUSPENDED' })
    if (user.status === 'INACTIVE') return res.status(403).json({ error: 'Your account is inactive. Please contact the church office.' })

    const { accessToken, refreshToken } = generateTokens(user.id, user.role)

    // Store refresh token
    await prisma.refreshToken.create({
      data: { token: refreshToken, userId: user.id, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }
    })

    // Update last login
    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } })

    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        member: user.member
      }
    })
  } catch (err) { next(err) }
})

// ── POST /api/auth/refresh ──
router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body
    if (!refreshToken) return res.status(401).json({ error: 'Refresh token required' })

    const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } })
    if (!stored || stored.expiresAt < new Date()) {
      return res.status(401).json({ error: 'Invalid or expired refresh token' })
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)
    const user = await prisma.user.findUnique({ where: { id: decoded.userId }, include: { member: true } })
    if (!user) return res.status(401).json({ error: 'User not found' })

    // Rotate tokens
    await prisma.refreshToken.delete({ where: { token: refreshToken } })
    const tokens = generateTokens(user.id, user.role)
    await prisma.refreshToken.create({
      data: { token: tokens.refreshToken, userId: user.id, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }
    })

    res.json({ ...tokens, user: { id: user.id, email: user.email, role: user.role, member: user.member } })
  } catch (err) { next(err) }
})

// ── POST /api/auth/logout ──
router.post('/logout', async (req, res, next) => {
  try {
    const { refreshToken } = req.body
    if (refreshToken) await prisma.refreshToken.deleteMany({ where: { token: refreshToken } })
    res.json({ message: 'Logged out successfully' })
  } catch (err) { next(err) }
})

// ── GET /api/auth/me ──
router.get('/me', authenticate, async (req, res) => {
  const { password, ...userWithoutPassword } = req.user
  res.json({ user: userWithoutPassword })
})

// ── PUT /api/auth/change-password ──
router.put('/change-password', authenticate, [
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 8 }),
], async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })

    const { currentPassword, newPassword } = req.body
    const user = await prisma.user.findUnique({ where: { id: req.user.id } })
    const valid = await bcrypt.compare(currentPassword, user.password)
    if (!valid) return res.status(400).json({ error: 'Current password is incorrect' })

    const hashed = await bcrypt.hash(newPassword, 12)
    await prisma.user.update({ where: { id: req.user.id }, data: { password: hashed } })
    await prisma.refreshToken.deleteMany({ where: { userId: req.user.id } }) // Invalidate all sessions

    res.json({ message: 'Password updated successfully. Please log in again.' })
  } catch (err) { next(err) }
})

export default router
