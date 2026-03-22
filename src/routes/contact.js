import { Router } from 'express'
import { body, validationResult } from 'express-validator'
import { prisma } from '../index.js'
import { authenticate, staffOnly } from '../middleware/auth.js'
const router = Router()

router.post('/', [
  body('firstName').trim().notEmpty(),
  body('email').isEmail().normalizeEmail(),
  body('message').trim().notEmpty(),
], async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })
    const msg = await prisma.contactMessage.create({ data: req.body })
    res.status(201).json({ message: '✅ Message received! We will get back to you within 24 hours. Akwaaba!', id: msg.id })
  } catch (err) { next(err) }
})

router.get('/', authenticate, staffOnly, async (req, res, next) => {
  try {
    const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: 'desc' } })
    res.json({ messages })
  } catch (err) { next(err) }
})

router.patch('/:id', authenticate, staffOnly, async (req, res, next) => {
  try {
    await prisma.contactMessage.update({ where: { id: req.params.id }, data: req.body })
    res.json({ message: 'Updated' })
  } catch (err) { next(err) }
})
export default router
