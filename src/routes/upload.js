import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { authenticate, staffOnly } from '../middleware/auth.js'
const router = Router()

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads'
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true })

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const type = req.query.type || 'misc'
    const dir = path.join(UPLOAD_DIR, type)
    fs.mkdirSync(dir, { recursive: true })
    cb(null, dir)
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    cb(null, unique + path.extname(file.originalname))
  }
})

const upload = multer({
  storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|gif|mp4|mov|mp3|m4a|pdf/
    const ext = path.extname(file.originalname).toLowerCase().slice(1)
    allowed.test(ext) ? cb(null, true) : cb(new Error(`File type .${ext} not allowed`))
  }
})

router.post('/', authenticate, staffOnly, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
  const url = `/uploads/${req.query.type || 'misc'}/${req.file.filename}`
  res.json({ url, filename: req.file.filename, size: req.file.size })
})
export default router
