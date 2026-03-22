// server/src/index.js — Express API Entry Point
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { rateLimit } from 'express-rate-limit'
import dotenv from 'dotenv'
import { PrismaClient } from '@prisma/client'

import authRoutes      from './routes/auth.js'
import memberRoutes    from './routes/members.js'
import carouselRoutes  from './routes/carousel.js'
import eventRoutes     from './routes/events.js'
import sermonRoutes    from './routes/sermons.js'
import prayerRoutes    from './routes/prayer.js'
import givingRoutes    from './routes/giving.js'
import notifRoutes     from './routes/notifications.js'
import contactRoutes   from './routes/contact.js'
import settingsRoutes  from './routes/settings.js'
import uploadRoutes    from './routes/upload.js'

dotenv.config()

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
})

const app = express()
const PORT = process.env.PORT || 5000

// ── Security ──
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))

// CORS — allow Render client, localhost dev, and any CLIENT_URL env var
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
  'https://pgsdaapp.onrender.com',
  process.env.CLIENT_URL,
].filter(Boolean)

const corsOptions = {
  origin: (origin, callback) => {
    // No origin = server-to-server, Postman, mobile — always allow
    if (!origin) return callback(null, true)
    // Exact match
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true)
    // Allow any onrender.com subdomain (covers preview deploys)
    if (origin.endsWith('.onrender.com')) return callback(null, true)
    console.warn(`CORS blocked: ${origin}`)
    callback(new Error('CORS: origin not allowed'))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}

app.use(cors(corsOptions))
// Handle preflight OPTIONS for all routes
app.options('*', cors(corsOptions))

// ── Rate Limiting ──
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200, standardHeaders: true, legacyHeaders: false })
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: { error: 'Too many attempts, please try again later.' } })
app.use(limiter)

// ── Body Parsing ──
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// ── Static Files (uploads) ──
app.use('/uploads', express.static(process.env.UPLOAD_DIR || './uploads'))

// ── Health Check ──
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Phoenix Ghanaian SDA API is running 🙏', timestamp: new Date().toISOString() })
})

// ── Routes ──
app.use('/api/auth',          authLimiter, authRoutes)
app.use('/api/members',       memberRoutes)
app.use('/api/carousel',      carouselRoutes)
app.use('/api/events',        eventRoutes)
app.use('/api/sermons',       sermonRoutes)
app.use('/api/prayer',        prayerRoutes)
app.use('/api/giving',        givingRoutes)
app.use('/api/notifications', notifRoutes)
app.use('/api/contact',       contactRoutes)
app.use('/api/settings',      settingsRoutes)
app.use('/api/upload',        uploadRoutes)

// ── 404 ──
app.use('*', (req, res) => res.status(404).json({ error: `Route ${req.originalUrl} not found` }))

// ── Global Error Handler ──
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err)
  const status = err.status || 500
  res.status(status).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
})

// ── Start ──
app.listen(PORT, () => {
  console.log(`\n🙏 Phoenix Ghanaian SDA API running on http://localhost:${PORT}`)
  console.log(`📊 Environment: ${process.env.NODE_ENV}`)
  console.log(`🔗 Client: ${process.env.CLIENT_URL}\n`)
})

export default app
