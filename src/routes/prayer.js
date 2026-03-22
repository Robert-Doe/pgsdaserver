import { Router } from 'express'
import { prisma } from '../index.js'
import { authenticate, staffOnly, optionalAuth } from '../middleware/auth.js'
const router = Router()

// Public submit
router.post('/', optionalAuth, async (req, res, next) => {
  try {
    const { name, request, isPrivate, memberId } = req.body
    const pr = await prisma.prayerRequest.create({
      data: { name: name || 'Anonymous', request, isPrivate: !!isPrivate, memberId: memberId || null }
    })
    res.status(201).json({ message: '🙏 Prayer request received. We are standing with you.', prayerRequest: pr })
  } catch (err) { next(err) }
})

// Admin views all
router.get('/', authenticate, staffOnly, async (req, res, next) => {
  try {
    const { status } = req.query
    const where = status ? { status } : {}
    const requests = await prisma.prayerRequest.findMany({
      where, orderBy: { createdAt: 'desc' }, include: { member: { select: { firstName: true, lastName: true } } }
    })
    res.json({ requests })
  } catch (err) { next(err) }
})

// Member views their own
router.get('/mine', authenticate, async (req, res, next) => {
  try {
    const requests = await prisma.prayerRequest.findMany({
      where: { memberId: req.user.member?.id }, orderBy: { createdAt: 'desc' }
    })
    res.json({ requests })
  } catch (err) { next(err) }
})

// Update (pastoral response, status, urgency)
router.put('/:id', authenticate, staffOnly, async (req, res, next) => {
  try {
    const data = { ...req.body }
    if (data.pastoralReply) data.repliedAt = new Date()
    const pr = await prisma.prayerRequest.update({ where: { id: req.params.id }, data })
    res.json({ prayerRequest: pr })
  } catch (err) { next(err) }
})

router.delete('/:id', authenticate, staffOnly, async (req, res, next) => {
  try {
    await prisma.prayerRequest.delete({ where: { id: req.params.id } })
    res.json({ message: 'Deleted' })
  } catch (err) { next(err) }
})
export default router
